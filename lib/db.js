// Firestore 읽기/쓰기 계층 — 화면 컴포넌트는 Firestore를 직접 건드리지 않고 이 파일 함수만 씁니다.
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { START_BISCUITS } from '@/data/config';
import { findItem } from './shop';

/* ───────── 식별자 / PIN ───────── */

export function normNick(nickname) {
  return String(nickname || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// 문서 ID = 반 + 닉네임 (같은 반에서 같은 닉네임은 같은 사람)
export function userDocId(classId, nickname) {
  return `${encodeURIComponent(classId.trim())}~${encodeURIComponent(normNick(nickname))}`;
}

function fallbackHash(str) {
  // crypto.subtle 을 쓸 수 없는 환경(http 사설 IP 등)용 간이 해시 (64자 hex)
  let out = '';
  for (let seed = 0; seed < 8; seed++) {
    let h = 5381 + seed * 7919;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i) + seed) | 0;
    out += (h >>> 0).toString(16).padStart(8, '0');
  }
  return out;
}

export async function hashPin(classId, nickname, pin) {
  const raw = `grion|${classId.trim()}|${normNick(nickname)}|${pin}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return fallbackHash(raw);
}

/* ───────── 입소(로그인/가입) ───────── */

function newUserDoc(classId, nickname) {
  return {
    classId: classId.trim(),
    nickname: nickname.trim().replace(/\s+/g, ' '),
    progress: {},
    clearedCount: 0,
    biscuits: START_BISCUITS,
    xp: 0,
    items: { hint: 1, shield: 0 },
    titles: [],
    title: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

/**
 * 반 + 닉네임 + PIN 으로 입소.
 * - 처음이면 새로 만들고, 이미 있으면 PIN을 확인한 뒤 기존 진도를 불러옵니다.
 * - PIN이 다르면 Error('PIN_MISMATCH')
 */
export async function enlist({ classId, nickname, pin }) {
  const id = userDocId(classId, nickname);
  const pinHash = await hashPin(classId, nickname, pin);
  const userRef = doc(db, 'users', id);
  const pinRef = doc(db, 'pins', id);

  const [pinSnap, userSnap] = await Promise.all([getDoc(pinRef), getDoc(userRef)]);

  if (pinSnap.exists() && pinSnap.data().pinHash !== pinHash) {
    throw new Error('PIN_MISMATCH');
  }

  const batch = writeBatch(db);
  let created = false;
  if (!pinSnap.exists()) {
    batch.set(pinRef, { pinHash, createdAt: serverTimestamp() });
    created = true;
  }
  if (!userSnap.exists()) {
    batch.set(userRef, newUserDoc(classId, nickname));
    created = true;
  }
  if (created) await batch.commit();

  return { id, pinHash, isNew: created };
}

// 저장된 세션의 PIN 해시가 아직 유효한지 확인 (다른 기기에서 처음 만든 PIN과 일치?)
export async function verifySession(session) {
  const snap = await getDoc(doc(db, 'pins', session.id));
  return snap.exists() && snap.data().pinHash === session.pinHash;
}

/* ───────── 실시간 구독 ───────── */

export function subscribeUser(id, cb, onError) {
  return onSnapshot(
    doc(db, 'users', id),
    (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  );
}

export function subscribeUsers(cb, onError) {
  return onSnapshot(
    query(collection(db, 'users'), limit(500)),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

/* ───────── 진도 / 포인트 ───────── */

/**
 * 라운드 클리어 저장 (트랜잭션)
 * - 처음 깬 라운드만 보상(건빵) 지급, 복습은 보상 0
 * - 3라운드를 모두 깨면 교안 마스터 → clearedCount 증가(= 진급)
 */
export async function completeRound({ userId, lessonId, roundIndex, earned, bonus, lessonIds }) {
  const ref = doc(db, 'users', userId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('NO_USER');
    const data = snap.data();
    const progress = { ...(data.progress || {}) };
    const prev = progress[lessonId] || 0;
    const isFirst = roundIndex + 1 > prev;
    const gain = isFirst ? earned + (roundIndex === 2 ? bonus : 0) : 0;
    if (isFirst) progress[lessonId] = roundIndex + 1;
    const clearedCount = lessonIds.filter((id) => (progress[id] || 0) >= 3).length;
    tx.update(ref, {
      progress,
      clearedCount,
      biscuits: increment(gain),
      xp: increment(gain),
      updatedAt: serverTimestamp(),
    });
    return { isFirst, gain, clearedCount, prevCleared: data.clearedCount || 0 };
  });
}

// 소모품(힌트/방탄조끼) 1개 사용
export async function consumeItem(userId, kind) {
  const ref = doc(db, 'users', userId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('NO_USER');
    const have = snap.data().items?.[kind] || 0;
    if (have <= 0) return false;
    tx.update(ref, { [`items.${kind}`]: increment(-1), updatedAt: serverTimestamp() });
    return true;
  });
}

/* ───────── PX 상점 ───────── */

export async function buyItem(userId, itemId) {
  const item = findItem(itemId);
  if (!item) throw new Error('NO_ITEM');
  const ref = doc(db, 'users', userId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('NO_USER');
    const data = snap.data();
    if ((data.biscuits || 0) < item.price) throw new Error('NOT_ENOUGH');
    if (item.type === 'title') {
      if ((data.titles || []).includes(item.id)) throw new Error('ALREADY_OWNED');
      tx.update(ref, {
        biscuits: increment(-item.price),
        titles: arrayUnion(item.id),
        title: item.id,
        updatedAt: serverTimestamp(),
      });
    } else {
      tx.update(ref, {
        biscuits: increment(-item.price),
        [`items.${item.kind}`]: increment(1),
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  });
}

export async function equipTitle(userId, titleId) {
  await updateDoc(doc(db, 'users', userId), { title: titleId || '', updatedAt: serverTimestamp() });
}

/* ───────── 마음의 편지 (익명 게시판) ───────── */

export function subscribeLetters(cb, onError) {
  return onSnapshot(
    query(collection(db, 'letters'), orderBy('createdAt', 'desc'), limit(50)),
    (snap) =>
      cb(
        snap.docs.map((d) => {
          const v = d.data();
          return { id: d.id, ...v, createdAt: v.createdAt?.toDate?.() || null };
        })
      ),
    onError
  );
}

export async function postLetter(text) {
  await addDoc(collection(db, 'letters'), {
    text: text.trim(),
    createdAt: serverTimestamp(),
    hearts: 0,
    heartedBy: [],
    commentCount: 0,
  });
}

export async function toggleHeart(letterId, deviceId, currentlyHearted) {
  await updateDoc(doc(db, 'letters', letterId), {
    heartedBy: currentlyHearted ? arrayRemove(deviceId) : arrayUnion(deviceId),
    hearts: increment(currentlyHearted ? -1 : 1),
  });
}

export function subscribeComments(letterId, cb, onError) {
  return onSnapshot(
    query(collection(db, 'letters', letterId, 'comments'), orderBy('createdAt', 'asc'), limit(100)),
    (snap) =>
      cb(
        snap.docs.map((d) => {
          const v = d.data();
          return { id: d.id, ...v, createdAt: v.createdAt?.toDate?.() || null };
        })
      ),
    onError
  );
}

export async function addComment(letterId, text) {
  await addDoc(collection(db, 'letters', letterId, 'comments'), {
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'letters', letterId), { commentCount: increment(1) });
}

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LESSONS } from '@/data/questionsData';
import { isFirebaseConfigured } from '@/lib/firebase';
import * as store from '@/lib/db';
import { countCleared, rankIndexFor } from '@/lib/ranks';

const SESSION_KEY = 'grion_session_v1';
const Ctx = createContext(null);

export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  // status: loading | nofirebase | loggedOut | ready
  const [status, setStatus] = useState('loading');
  const [session, setSession] = useState(null); // { id, classId, nickname, pinHash }
  const [user, setUser] = useState(undefined); // undefined=로딩중, null=문서없음
  const [users, setUsers] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  /* 최초 접속: localStorage 세션이 있으면 자동 로그인 */
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setStatus('nofirebase');
      return;
    }
    let cancelled = false;
    (async () => {
      let saved = null;
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) saved = JSON.parse(raw);
      } catch {
        saved = null;
      }
      if (saved?.id && saved?.pinHash) {
        try {
          const ok = await store.verifySession(saved);
          if (cancelled) return;
          if (ok) {
            setSession(saved);
            setStatus('ready');
            return;
          }
          localStorage.removeItem(SESSION_KEY);
        } catch (e) {
          // 네트워크 오류 등: 저장된 세션을 믿고 일단 진입 (Firestore가 연결되면 자동 동기화)
          console.warn('세션 확인 실패, 저장된 세션으로 진입합니다.', e);
          if (!cancelled) {
            setSession(saved);
            setStatus('ready');
          }
          return;
        }
      }
      if (!cancelled) setStatus('loggedOut');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* 로그인 후: 내 문서 + 전체 랭킹 실시간 구독 */
  useEffect(() => {
    if (!session) return undefined;
    const off1 = store.subscribeUser(session.id, setUser, (e) => console.error(e));
    const off2 = store.subscribeUsers(setUsers, (e) => console.error(e));
    return () => {
      off1();
      off2();
    };
  }, [session]);

  const enlist = useCallback(async ({ classId, nickname, pin }) => {
    const res = await store.enlist({ classId, nickname, pin });
    const s = {
      id: res.id,
      classId: classId.trim(),
      nickname: nickname.trim(),
      pinHash: res.pinHash,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setUser(undefined);
    setSession(s);
    setStatus('ready');
    return res;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setSession(null);
    setUser(undefined);
    setUsers([]);
    setStatus('loggedOut');
  }, []);

  const completeRound = useCallback(
    ({ lessonId, roundIndex, earned, bonus }) =>
      store.completeRound({
        userId: session.id,
        lessonId,
        roundIndex,
        earned,
        bonus,
        lessonIds: LESSONS.map((l) => l.id),
      }),
    [session]
  );

  const consumeItem = useCallback((kind) => store.consumeItem(session.id, kind), [session]);
  const buy = useCallback((itemId) => store.buyItem(session.id, itemId), [session]);
  const equip = useCallback((titleId) => store.equipTitle(session.id, titleId), [session]);

  const totalLessons = LESSONS.length;
  const clearedCount = user ? countCleared(user.progress, LESSONS) : 0;
  const rankIndex = rankIndexFor(clearedCount, totalLessons);

  const value = useMemo(
    () => ({
      status,
      session,
      user,
      users,
      lessons: LESSONS,
      totalLessons,
      clearedCount,
      rankIndex,
      toast,
      toastMsg,
      enlist,
      logout,
      completeRound,
      consumeItem,
      buy,
      equip,
    }),
    [
      status,
      session,
      user,
      users,
      totalLessons,
      clearedCount,
      rankIndex,
      toast,
      toastMsg,
      enlist,
      logout,
      completeRound,
      consumeItem,
      buy,
      equip,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

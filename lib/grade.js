// 주관식 키워드 채점 + 문자열 유틸

// 공백/문장부호 제거 + 소문자화 → '포함 여부'를 느슨하게 비교
export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\s.,!?;:'"“”‘’()\[\]{}~\-_…·]/g, '');
}

/**
 * 키워드 그룹 채점
 * @param {string} answer 사용자가 쓴 답
 * @param {{label:string, words:string[]}[]} groups 핵심 개념 묶음
 * @param {number} minMatch 통과에 필요한 개념 수
 */
export function gradeShort(answer, groups, minMatch) {
  const n = normalize(answer);
  const matched = [];
  const missing = [];
  groups.forEach((g) => {
    const hit = g.words.some((w) => n.includes(normalize(w)));
    (hit ? matched : missing).push(g.label);
  });
  const need = Math.min(minMatch ?? groups.length, groups.length);
  return { pass: matched.length >= need, matched, missing, need };
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// '[정답]' 표기가 들어간 문장을 텍스트/빈칸 조각으로 분해
export function parseBlanks(text) {
  const parts = [];
  const re = /\[([^\]]+)\]/g;
  let last = 0;
  let blankIndex = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ type: 'text', value: text.slice(last, m.index) });
    parts.push({ type: 'blank', answer: m[1], index: blankIndex++ });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) });
  return parts;
}

export function timeAgo(date) {
  if (!date) return '방금 전';
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return '방금 전';
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`;
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)}일 전`;
  return date.toLocaleDateString('ko-KR');
}

// 하트(공감) 중복 방지용 익명 기기 ID
export function getDeviceId() {
  try {
    let id = localStorage.getItem('grion_device_id');
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `d-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('grion_device_id', id);
    }
    return id;
  } catch {
    return 'anonymous-device';
  }
}

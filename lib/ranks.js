// 계급 정의: 훈련병(grion_1) → 이등병(2) → 일병(3) → 상병(4) → 병장(5, 최종 마스터)
export const RANKS = [
  { id: 0, name: '훈련병', bars: 0, image: '/images/grion_1.png', motto: '이제 막 입소한 말씀 훈련병!' },
  { id: 1, name: '이등병', bars: 1, image: '/images/grion_2.png', motto: '첫 계급장을 달았어요. 충진!' },
  { id: 2, name: '일병', bars: 2, image: '/images/grion_3.png', motto: '말씀을 열심히 필기하는 중!' },
  { id: 3, name: '상병', bars: 3, image: '/images/grion_4.png', motto: '든든한 말씀 중견, 멋져요!' },
  { id: 4, name: '병장', bars: 4, image: '/images/grion_5.png', motto: '말씀 사관학교 최종 마스터!' },
];

export const MAX_RANK = RANKS.length - 1;

/**
 * 마스터한 교안 수 → 계급 인덱스
 * - 0개: 훈련병
 * - 전부 마스터: 병장(최종)
 * - 그 사이: 진도 비율에 따라 이등병~상병 (교안이 늘어나도 자동으로 균등 배분)
 *   (교안이 3개인 샘플에서는 1교안=이등병, 2교안=일병, 3교안=병장)
 */
export function rankIndexFor(cleared, total) {
  if (!total || cleared <= 0) return 0;
  if (cleared >= total) return MAX_RANK;
  const raw = Math.floor((cleared * 4) / total);
  return Math.min(MAX_RANK - 1, Math.max(1, raw));
}

export function countCleared(progress, lessons) {
  return lessons.filter((l) => (progress?.[l.id] || 0) >= 3).length;
}

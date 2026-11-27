'use client';

import { useState } from 'react';
import { BookOpen, Check, Lock } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { ROUND_META } from '@/data/questionsData';
import { RANKS } from '@/lib/ranks';
import Grion from './Grion';
import { Bubble, FlagPost, Sheet, Tent } from './ui';
import { ProfileStrip } from './Header';

const ROW_H = 170; // 스테이지 간 세로 간격(px)
const TOP = 70;
const X_PATTERN = [0.62, 0.36, 0.6, 0.38]; // 지그재그 가로 위치(0~1)

function stageState(lessons, progress, i) {
  const done = (progress[lessons[i].id] || 0) >= 3;
  const prevDone = i === 0 || (progress[lessons[i - 1].id] || 0) >= 3;
  if (done) return 'done';
  return prevDone ? 'current' : 'locked';
}

export default function TrainingTab({ onStart, onGoShop }) {
  const { user, lessons, rankIndex, clearedCount, toast } = useApp();
  const [picked, setPicked] = useState(null); // 시작 시트에 보여줄 교안 index
  const [shakeIdx, setShakeIdx] = useState(-1);
  const progress = user?.progress || {};

  const states = lessons.map((_, i) => stageState(lessons, progress, i));
  const currentIdx = states.findIndex((s) => s === 'current');
  const allDone = clearedCount >= lessons.length;

  const points = lessons.map((_, i) => ({
    x: X_PATTERN[i % X_PATTERN.length],
    y: TOP + i * ROW_H,
  }));
  const H = TOP + lessons.length * ROW_H + 40;

  // 점선 길: 각 스테이지 중심을 부드러운 곡선으로 연결 (viewBox 가로 0~100, 세로는 px)
  let path = '';
  points.forEach((p, i) => {
    const x = p.x * 100;
    if (i === 0) path = `M ${x} ${p.y}`;
    else {
      const prev = points[i - 1];
      const px = prev.x * 100;
      path += ` C ${px} ${prev.y + 90}, ${x} ${p.y - 90}, ${x} ${p.y}`;
    }
  });

  const bubbleText = allDone
    ? '전 교안 마스터! 충진!!'
    : currentIdx >= 0
      ? `충진! ${lessons[currentIdx].title} 돌파까지 한 걸음!`
      : '충진! 훈련을 시작해요!';

  function tapStage(i) {
    if (states[i] === 'locked') {
      setShakeIdx(i);
      setTimeout(() => setShakeIdx(-1), 500);
      toast('🔒 앞 교안을 먼저 마스터해야 해요!');
      return;
    }
    setPicked(i);
  }

  const pickedLesson = picked != null ? lessons[picked] : null;
  const pickedRounds = pickedLesson ? progress[pickedLesson.id] || 0 : 0;

  return (
    <div>
      <ProfileStrip onGoShop={onGoShop} />

      {/* 마스코트 + 말풍선 */}
      <div className="relative z-10 mt-3 flex items-end px-3">
        <Grion rank={rankIndex} size={170} anim="talk" className="-mb-1 shrink-0 drop-shadow-md" />
        <Bubble className="mb-16 -ml-1 flex-1">{bubbleText}</Bubble>
      </div>

      {/* 스테이지 맵 */}
      <div className="relative -mt-8 overflow-hidden" style={{ height: H }}>
        {/* 잔디 배경 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#bfe8ff] via-[#b7e38a] to-[#8fcf62]" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#e9f7ff] to-transparent" />
        <span className="absolute left-5 top-24 text-lg opacity-80">🌼</span>
        <span className="absolute right-24 top-16 text-lg opacity-80">🌼</span>
        <span className="absolute bottom-40 left-1/3 text-xl opacity-80">🌿</span>

        {/* 길 */}
        <svg
          className="absolute inset-0"
          width="100%"
          height={H}
          viewBox={`0 0 100 ${H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={path} fill="none" stroke="#f3e5b8" strokeWidth="34" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={path} fill="none" stroke="#fffaf0" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 14" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* 천막 / 표지판 장식 */}
        <Tent width={140} className="absolute -right-6 top-6" />
        <Tent width={150} className="absolute -right-10" style={{ top: Math.max(H - 260, 220) }} />
        <div className="absolute bottom-6 left-3 -rotate-3">
          <div className="rounded-lg border-4 border-[#6b4423] bg-[#b07a43] px-3 py-2 text-center shadow-lg">
            <p className="font-display text-sm text-[#fff3d6]">말씀 훈련로</p>
            <p className="text-lg font-black leading-none text-white">➜</p>
          </div>
          <div className="mx-auto h-8 w-2.5 bg-[#6b4423]" />
        </div>

        {/* 깃발: 현재 스테이지 옆 */}
        {currentIdx >= 0 && (
          <FlagPost
            className="absolute"
            // 스테이지가 왼쪽이면 오른쪽, 오른쪽이면 왼쪽에 꽂기
            style={{
              top: points[currentIdx].y - 42,
              left: `calc(${points[currentIdx].x * 100}% ${points[currentIdx].x < 0.5 ? '+' : '-'} 112px)`,
            }}
          />
        )}

        {/* 스테이지 버튼들 */}
        {lessons.map((lesson, i) => {
          const s = states[i];
          const p = points[i];
          const palette =
            s === 'done'
              ? { top: '#ffd84a', side: '#d9a400', text: '#5a4200' }
              : s === 'current'
                ? { top: '#86e02a', side: '#4fa000', text: '#1f4d08' }
                : { top: '#dcdfe3', side: '#aab1b8', text: '#6b7480' };
          return (
            <div
              key={lesson.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x * 100}%`, top: p.y }}
            >
              <button
                onClick={() => tapStage(i)}
                className={`relative block active:translate-y-1 ${shakeIdx === i ? 'animate-shake' : ''}`}
                aria-label={`${lesson.title} ${s === 'locked' ? '잠김' : s === 'done' ? '완료' : '진행 중'}`}
              >
                {s === 'current' && (
                  <span className="absolute inset-0 animate-glow rounded-[50%]" aria-hidden="true" />
                )}
                <span
                  className="relative flex h-[84px] w-[132px] flex-col items-center justify-center rounded-[50%]"
                  style={{
                    background: palette.top,
                    boxShadow: `0 9px 0 ${palette.side}, 0 14px 14px rgba(0,0,0,0.18), inset 0 6px 8px rgba(255,255,255,0.45)`,
                    color: palette.text,
                  }}
                >
                  {s === 'locked' ? <Lock size={26} strokeWidth={2.6} /> : <BookOpen size={28} strokeWidth={2.6} />}
                  <span className="font-display text-2xl leading-none">{lesson.title}</span>
                </span>
                {s === 'done' && (
                  <span className="absolute -bottom-3 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-grion-500 text-white shadow">
                    <Check size={22} strokeWidth={4} />
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* 교안 시작 시트 */}
      <Sheet open={picked != null} onClose={() => setPicked(null)} title={pickedLesson ? `${pickedLesson.title} 훈련` : ''}>
        {pickedLesson && (
          <div>
            <p className="mb-3 text-sm font-bold text-grion-700">{pickedLesson.subtitle}</p>
            <ol className="mb-4 space-y-2">
              {ROUND_META.map((r, idx) => {
                const cleared = pickedRounds > idx;
                return (
                  <li
                    key={r.key}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-2 ${
                      cleared ? 'border-grion-300 bg-grion-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full font-display text-lg ${
                        cleared ? 'bg-grion-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {cleared ? <Check size={18} strokeWidth={4} /> : idx + 1}
                    </span>
                    <span className="font-display text-lg text-forest">{r.title}</span>
                  </li>
                );
              })}
            </ol>
            {pickedRounds >= 3 && (
              <p className="mb-3 rounded-xl bg-yellow-50 p-2.5 text-center text-sm font-bold text-yellow-800">
                이미 마스터한 교안이에요. 복습 훈련은 건빵 보상이 없어요.
              </p>
            )}
            <button
              className="btn-3d btn-green w-full text-xl"
              onClick={() => {
                const l = pickedLesson;
                setPicked(null);
                onStart(l);
              }}
            >
              {pickedRounds >= 3 ? '복습 훈련 시작' : pickedRounds > 0 ? `${pickedRounds + 1}라운드부터 이어하기` : '훈련 시작 · 충진!'}
            </button>
            <p className="mt-3 text-center text-xs text-gray-400">
              현재 계급: {RANKS[rankIndex].name} · 마스터한 교안 {clearedCount}/{lessons.length}
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

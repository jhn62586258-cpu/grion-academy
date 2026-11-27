'use client';

import { useState } from 'react';
import { BookOpen, Check, Lock } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { ROUND_META } from '@/data/questionsData';
import { RANKS } from '@/lib/ranks';
import Grion from './Grion';
import { Bubble, FlagPost, Sheet } from './ui';
import { ProfileStrip } from './Header';

const ROW_H = 155;
const TOP = 85;
const X_PATTERN = [0.64, 0.42, 0.56, 0.44];

function stageState(lessons, progress, i) {
  const done = (progress[lessons[i].id] || 0) >= 3;
  const prevDone = i === 0 || (progress[lessons[i - 1].id] || 0) >= 3;
  if (done) return 'done';
  return prevDone ? 'current' : 'locked';
}

export default function TrainingTab({ onStart, onGoShop }) {
  const { user, lessons, rankIndex, clearedCount, toast } = useApp();
  const [picked, setPicked] = useState(null);
  const [shakeIdx, setShakeIdx] = useState(-1);
  const progress = user?.progress || {};

  const states = lessons.map((_, i) => stageState(lessons, progress, i));
  const currentIdx = states.findIndex((s) => s === 'current');
  const allDone = clearedCount >= lessons.length;

  const points = lessons.map((_, i) => ({
    x: X_PATTERN[i % X_PATTERN.length],
    y: TOP + i * ROW_H,
  }));
  const H = Math.max(TOP + lessons.length * ROW_H + 60, 560);

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

      {/* 스테이지 맵 전체 컨테이너 (bg_map.png 배경 적용) */}
      <div className="relative overflow-hidden bg-[#b7e38a]" style={{ minHeight: H }}>
        <img
          src="/images/bg_map.png"
          alt="훈련장 배경"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
        />

        {/* 마스코트 + 말풍선 */}
        <div className="relative z-10 flex items-end px-3 pt-14">
          <Grion rank={rankIndex} size={165} anim="talk" className="-mb-2 shrink-0 drop-shadow-md" />
          <Bubble className="mb-14 -ml-2 flex-1 shadow-md">{bubbleText}</Bubble>
        </div>

        {/* 깃발: 현재 스테이지 옆 */}
        {currentIdx >= 0 && (
          <FlagPost
            className="absolute z-10"
            style={{
              top: points[currentIdx].y + 85,
              left: `calc(${points[currentIdx].x * 100}% ${points[currentIdx].x < 0.5 ? '+' : '-'} 105px)`,
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
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x * 100}%`, top: p.y + 125 }}
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
                  className="relative flex h-[80px] w-[128px] flex-col items-center justify-center rounded-[50%]"
                  style={{
                    background: palette.top,
                    boxShadow: `0 9px 0 ${palette.side}, 0 14px 14px rgba(0,0,0,0.22), inset 0 6px 8px rgba(255,255,255,0.45)`,
                    color: palette.text,
                  }}
                >
                  {s === 'locked' ? <Lock size={25} strokeWidth={2.6} /> : <BookOpen size={26} strokeWidth={2.6} />}
                  <span className="text-2xl leading-none">{lesson.title}</span>
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
            <p className="mb-3 text-base text-grion-700">{pickedLesson.subtitle}</p>
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
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-lg ${
                        cleared ? 'bg-grion-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {cleared ? <Check size={18} strokeWidth={4} /> : idx + 1}
                    </span>
                    <span className="text-lg text-forest">{r.title}</span>
                  </li>
                );
              })}
            </ol>
            {pickedRounds >= 3 && (
              <p className="mb-3 rounded-xl bg-yellow-50 p-2.5 text-center text-sm text-yellow-800">
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

'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { RANKS } from '@/lib/ranks';
import Grion from '../Grion';
import { BiscuitIcon, RankBadge } from '../ui';

const CONFETTI = ['🎉', '⭐', '🍪', '✨', '🎖️', '💚'];

/** 교안 마스터 화면: 진급이 있으면 계급 업그레이드 연출 */
export default function LessonComplete({ lesson, practice, gain, prevRank, newRank, onDone }) {
  const promoted = !practice && newRank > prevRank;
  const confetti = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 11) * 0.28}s`,
        dur: `${2.6 + (i % 5) * 0.5}s`,
        char: CONFETTI[i % CONFETTI.length],
        size: 18 + (i % 4) * 6,
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[480px] overflow-hidden bg-gradient-to-b from-[#1f5a2c] via-[#2f7a3c] to-[#58c20a] text-center text-white">
      {promoted &&
        confetti.map((c, i) => (
          <span
            key={i}
            className="pointer-events-none absolute top-0 animate-confetti"
            style={{ left: c.left, animationDelay: c.delay, animationDuration: c.dur, fontSize: c.size }}
          >
            {c.char}
          </span>
        ))}

      <div className="flex h-full flex-col items-center justify-center px-6">
        <p className="font-display text-2xl text-[#fff27a]">
          {practice ? `${lesson.title} 복습 완료!` : `${lesson.title} 마스터!`}
        </p>
        <h2 className="mt-1 font-display text-5xl drop-shadow-lg">{promoted ? '명예로운 진급!' : '충진!'}</h2>

        <div className="relative mt-6 flex items-center justify-center">
          {promoted && (
            <span className="absolute h-64 w-64 animate-burst rounded-full bg-[#fff27a]/60 blur-2xl" aria-hidden="true" />
          )}
          <Grion rank={promoted ? newRank : prevRank} size={230} anim={promoted ? 'talk' : 'float'} className="relative drop-shadow-2xl" />
        </div>

        <div className="mt-3 flex items-center gap-3">
          {promoted ? (
            <>
              <span className="font-display text-2xl text-white/80">{RANKS[prevRank].name}</span>
              <ArrowRight size={26} strokeWidth={3} />
              <RankBadge bars={RANKS[newRank].bars} />
              <span className="font-display text-3xl text-[#fff27a]">{RANKS[newRank].name}</span>
            </>
          ) : (
            <span className="font-display text-2xl">{RANKS[newRank].name} 그리온</span>
          )}
        </div>
        <p className="mt-2 text-base font-bold text-white/90">
          {promoted ? RANKS[newRank].motto : '말씀을 다시 새기는 모습, 멋져요!'}
        </p>

        {gain > 0 && (
          <div className="mt-5 flex items-center gap-2 rounded-full bg-white/95 px-5 py-2 shadow-lg">
            <BiscuitIcon size={34} />
            <span className="font-display text-2xl text-[#5a3d12]">+{gain} 건빵 보급!</span>
          </div>
        )}

        <button onClick={onDone} className="btn-3d btn-yellow mt-8 w-full max-w-xs text-2xl">
          훈련장으로 복귀
        </button>
      </div>
    </div>
  );
}

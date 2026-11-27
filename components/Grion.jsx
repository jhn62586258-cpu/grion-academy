'use client';

import { MAX_RANK, RANKS } from '@/lib/ranks';

/**
 * 그리온 캐릭터 (계급별 이미지)
 * anim: 'float'(숨 쉬듯 둥둥) | 'talk'(말할 때 통통) | 'pop'(등장) | 'none'
 */
export default function Grion({ rank = 0, size = 120, anim = 'float', className = '' }) {
  const r = Math.min(Math.max(rank, 0), MAX_RANK);
  const animClass =
    anim === 'float' ? 'animate-float' : anim === 'talk' ? 'animate-talk' : anim === 'pop' ? 'animate-pop' : '';
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={RANKS[r].image}
      alt={`${RANKS[r].name} 그리온`}
      draggable={false}
      className={`select-none object-contain ${animClass} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** 얼굴만 동그랗게 잘라 보여 주는 프로필 아바타 */
export function GrionFace({ rank = 0, size = 56, className = '' }) {
  const r = Math.min(Math.max(rank, 0), MAX_RANK);
  const W = size * 1.8;
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full border-[3px] border-forest bg-grion-500 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={RANKS[r].image}
        alt={RANKS[r].name}
        draggable={false}
        className="absolute max-w-none select-none"
        style={{ width: W, height: W, left: -size * 0.4, top: -size * 0.2 }}
      />
    </span>
  );
}

'use client';

import { X } from 'lucide-react';

/** 사관학교 엠블럼 (월계관 + 펼친 성경 + 십자가) */
export function Emblem({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke="#2f6d1c" strokeWidth="3" strokeLinecap="round">
        <path d="M13 47 C4 38 4 24 11 15" />
        <path d="M51 47 C60 38 60 24 53 15" />
      </g>
      <g fill="#58c20a" stroke="#2f6d1c" strokeWidth="1">
        <ellipse cx="9" cy="26" rx="3.4" ry="5.5" transform="rotate(-25 9 26)" />
        <ellipse cx="8" cy="38" rx="3.4" ry="5.5" transform="rotate(-5 8 38)" />
        <ellipse cx="55" cy="26" rx="3.4" ry="5.5" transform="rotate(25 55 26)" />
        <ellipse cx="56" cy="38" rx="3.4" ry="5.5" transform="rotate(5 56 38)" />
      </g>
      <path
        d="M16 27 Q25 23 32 29 Q39 23 48 27 V47 Q39 43 32 49 Q25 43 16 47 Z"
        fill="#fffbe8"
        stroke="#2f6d1c"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M32 29 V49" stroke="#2f6d1c" strokeWidth="2.5" />
      <g fill="#ffc800" stroke="#9a7300" strokeWidth="1.2">
        <rect x="29.5" y="4" width="5" height="16" rx="1" />
        <rect x="25" y="8.5" width="14" height="5" rx="1" />
      </g>
    </svg>
  );
}

/** 건빵 아이콘 (지피티 생성 icon_hardtrack.png 적용) */
export function BiscuitIcon({ size = 28 }) {
  return (
    <img
      src="/images/icon_hardtrack.png"
      alt="건빵"
      style={{ width: size, height: size }}
      className="inline-block shrink-0 object-contain"
    />
  );
}

/** 계급장 (노란 줄 개수 = 계급) */
export function RankBadge({ bars = 0, className = '' }) {
  return (
    <span
      className={`inline-flex h-7 min-w-[2.1rem] items-center justify-center rounded-md bg-[#1c2420] px-1.5 ${className}`}
      aria-label={`계급장 ${bars}줄`}
    >
      {bars === 0 ? (
        <span className="block h-[3px] w-4 rounded bg-gray-500" />
      ) : (
        <span className="flex flex-col gap-[2px]">
          {Array.from({ length: Math.min(bars, 4) }).map((_, i) => (
            <span key={i} className="block h-[3px] w-4 rounded bg-gold-400" />
          ))}
        </span>
      )}
    </span>
  );
}

/** 말풍선 */
export function Bubble({ children, tail = 'left', className = '' }) {
  return (
    <div
      className={`relative rounded-[1.6rem] border-[3px] border-[#1d2b22] bg-white px-4 py-3 font-display text-xl leading-snug text-[#1d2b22] ${className}`}
    >
      {children}
      {tail === 'left' ? (
        <span className="absolute -left-[10px] bottom-7 h-4 w-4 rotate-45 border-b-[3px] border-l-[3px] border-[#1d2b22] bg-white" />
      ) : (
        <span className="absolute -bottom-[10px] left-10 h-4 w-4 rotate-45 border-b-[3px] border-r-[3px] border-[#1d2b22] bg-white" />
      )}
    </div>
  );
}

/** 하단에서 올라오는 시트 */
export function Sheet({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] items-end">
      <button
        aria-label="닫기"
        className="absolute inset-0 animate-fadeIn bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full animate-slideUp rounded-t-[2rem] border-t-4 border-grion-200 bg-white px-5 pb-8 pt-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-2xl text-forest">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-500 active:scale-95"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** 상단 토스트 */
export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-[70] mx-auto flex max-w-[480px] justify-center px-4">
      <div className="animate-pop rounded-full border-[3px] border-[#1d2b22] bg-white px-5 py-2.5 font-display text-lg text-[#1d2b22] shadow-lg">
        {message}
      </div>
    </div>
  );
}

/** 천막 장식 */
export function Tent({ width = 130, className = '', style }) {
  return (
    <svg width={width} viewBox="0 0 140 110" className={className} style={style} aria-hidden="true">
      <path d="M8 100 L70 14 L132 100 Z" fill="#5f7d4a" stroke="#3e5a33" strokeWidth="4" strokeLinejoin="round" />
      <path d="M70 14 L8 100 L48 100 L70 52 Z" fill="#6f8f58" />
      <path d="M52 100 L70 56 L88 100 Z" fill="#2c3a28" />
      <rect x="64" y="32" width="12" height="3.5" rx="1" fill="#f3e3a4" />
      <rect x="68.2" y="27.5" width="3.6" height="12" rx="1" fill="#f3e3a4" />
      <path d="M0 104 H140" stroke="#8a6b3c" strokeWidth="6" strokeLinecap="round" />
      <g fill="#d9c28f" stroke="#a98d57" strokeWidth="2">
        <rect x="96" y="92" width="40" height="14" rx="6" />
        <rect x="104" y="80" width="34" height="14" rx="6" />
      </g>
    </svg>
  );
}

/** 깃발 장식 */
export function FlagPost({ className = '', style }) {
  return (
    <svg width="64" height="86" viewBox="0 0 64 86" className={className} style={style} aria-hidden="true">
      <rect x="8" y="6" width="5" height="74" rx="2" fill="#c98a3d" stroke="#8a5a20" strokeWidth="1.5" />
      <path d="M13 10 H58 Q60 10 58 14 L50 24 L58 36 Q60 40 56 40 H13 Z" fill="#2f6d1c" stroke="#1a3c14" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="33" cy="25" r="7" fill="none" stroke="#ffc800" strokeWidth="2.5" />
      <rect x="31.6" y="19" width="2.8" height="12" fill="#ffc800" />
      <rect x="27" y="23.6" width="12" height="2.8" fill="#ffc800" />
      <ellipse cx="10.5" cy="81" rx="12" ry="4" fill="#8a8f96" />
    </svg>
  );
}

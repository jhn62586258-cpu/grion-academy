'use client';

import { Lightbulb } from 'lucide-react';
import Grion from '../Grion';

/**
 * 하단 피드백 바 (정답: 그리온 + "정답입니다! 충진!" / 오답: 땀 흘리는 그리온 + 격려)
 * 오답 때는 일병(땀 흘리며 필기하는) 그리온 이미지를 사용합니다.
 */
export default function FeedbackBar({ type = 'correct', rank = 0, title, message, buttonLabel, onContinue, extra }) {
  const ok = type === 'correct';
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] animate-slideUp px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="relative flex items-end">
        <Grion rank={ok ? rank : 2} size={128} anim="pop" className="relative z-10 -mb-3 -mr-5 shrink-0 drop-shadow-lg" />
        <div
          className={`relative mb-3 flex-1 rounded-[1.6rem] px-5 py-3 text-white shadow-[0_6px_0_rgba(0,0,0,0.18)] ${
            ok ? 'bg-gradient-to-r from-[#4fb008] to-[#7ddc1f]' : 'bg-gradient-to-r from-[#ff5a4f] to-[#ff9a3d]'
          }`}
        >
          <p className="pl-4 font-display text-[1.7rem] leading-tight drop-shadow">
            {title || (ok ? '정답입니다!' : '아쉬워요!')}
          </p>
          {ok ? (
            <p className="pl-4 font-display text-[1.6rem] leading-tight text-[#fff27a] underline decoration-[#fff27a]/70 decoration-4 underline-offset-4">
              충진!
            </p>
          ) : null}
          {message ? <p className="mt-1 pl-4 text-sm font-bold leading-snug text-white/95">{message}</p> : null}
          {extra ? <div className="mt-2 pl-4 text-sm leading-snug text-white/95">{extra}</div> : null}
        </div>
      </div>
      <button onClick={onContinue} className={`btn-3d w-full text-xl ${ok ? 'btn-green' : 'btn-red'}`}>
        {buttonLabel || (ok ? '계속하기' : '다시 시도')}
      </button>
    </div>
  );
}

/** 작전 지도(힌트) 버튼 */
export function HintButton({ count, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-full border-2 border-gold-500 bg-yellow-50 px-3 py-1.5 font-display text-base text-yellow-800 active:scale-95 disabled:opacity-40"
    >
      <Lightbulb size={18} strokeWidth={2.6} />
      작전 지도 <span className="rounded-full bg-gold-500 px-2 text-sm text-white">{count}</span>
    </button>
  );
}

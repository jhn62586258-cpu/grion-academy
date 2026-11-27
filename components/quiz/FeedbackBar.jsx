'use client';

import { Lightbulb } from 'lucide-react';
import Grion from '../Grion';

/**
 * 하단 피드백 바 (슬림 버전: 위쪽 문제 보기를 가리지 않도록 높이를 최적화)
 */
export default function FeedbackBar({ type = 'correct', rank = 0, title, message, buttonLabel, onContinue, extra }) {
  const ok = type === 'correct';
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] animate-slideUp rounded-t-3xl bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm">
      <div className="relative flex items-end">
        <Grion rank={ok ? rank : 2} size={104} anim="pop" className="relative z-10 -mb-2 -mr-4 shrink-0 drop-shadow-md" />
        <div
          className={`relative mb-2 flex-1 rounded-2xl px-4 py-2.5 text-white shadow-[0_4px_0_rgba(0,0,0,0.16)] ${
            ok ? 'bg-gradient-to-r from-[#4fb008] to-[#7ddc1f]' : 'bg-gradient-to-r from-[#ff5a4f] to-[#ff9a3d]'
          }`}
        >
          <div className="flex items-baseline gap-2 pl-3">
            <p className="text-xl leading-tight drop-shadow">
              {title || (ok ? '정답입니다!' : '아쉬워요!')}
            </p>
            {ok && (
              <span className="text-lg leading-tight text-[#fff27a] underline decoration-[#fff27a]/70 decoration-2 underline-offset-4">
                충진!
              </span>
            )}
          </div>
          {message ? <p className="mt-0.5 pl-3 text-xs leading-snug text-white/95">{message}</p> : null}
          {extra ? <div className="mt-1 pl-3 text-xs leading-snug text-white/95">{extra}</div> : null}
        </div>
      </div>
      <button onClick={onContinue} className={`btn-3d w-full py-2.5 text-lg ${ok ? 'btn-green' : 'btn-red'}`}>
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
      className="flex items-center gap-1.5 rounded-full border-2 border-gold-500 bg-yellow-50 px-3 py-1 text-sm text-yellow-800 active:scale-95 disabled:opacity-40"
    >
      <Lightbulb size={16} strokeWidth={2.6} />
      작전 지도 <span className="rounded-full bg-gold-500 px-1.5 text-xs text-white">{count}</span>
    </button>
  );
}

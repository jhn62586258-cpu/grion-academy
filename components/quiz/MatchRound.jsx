'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { shuffle } from '@/lib/grade';
import FeedbackBar, { HintButton } from './FeedbackBar';

/**
 * 1라운드: 성구 ↔ 핵심 주제 짝짓기
 * 왼쪽 성구 카드와 오른쪽 주제 카드를 차례로 눌러 연결합니다. (왼→오, 오→왼 모두 가능)
 */
export default function MatchRound({ items: pairs, api }) {
  const rightOrder = useMemo(() => shuffle(pairs.map((p) => p.id)), [pairs]);
  const byId = useMemo(() => Object.fromEntries(pairs.map((p) => [p.id, p])), [pairs]);

  const [matched, setMatched] = useState([]); // 맞춘 pair id 목록
  const [sel, setSel] = useState(null); // { side, id }
  const [wrong, setWrong] = useState(null); // { l, r }
  const [hintId, setHintId] = useState(null);
  const mistakes = useRef(new Set());
  const lock = useRef(false);

  const wrapRef = useRef(null);
  const leftRefs = useRef({});
  const rightRefs = useRef({});
  const [lines, setLines] = useState([]);

  const allDone = matched.length === pairs.length;

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wb = wrap.getBoundingClientRect();
    const next = matched
      .map((id) => {
        const l = leftRefs.current[id];
        const r = rightRefs.current[id];
        if (!l || !r) return null;
        const lb = l.getBoundingClientRect();
        const rb = r.getBoundingClientRect();
        return {
          id,
          x1: lb.right - wb.left,
          y1: lb.top + lb.height / 2 - wb.top,
          x2: rb.left - wb.left,
          y2: rb.top + rb.height / 2 - wb.top,
        };
      })
      .filter(Boolean);
    setLines(next);
  }, [matched]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  function pick(side, id) {
    if (lock.current || allDone || matched.includes(id)) return;
    if (!sel || sel.side === side) {
      setSel({ side, id });
      return;
    }
    const leftId = side === 'right' ? sel.id : id;
    const rightId = side === 'right' ? id : sel.id;
    setSel(null);

    if (leftId === rightId) {
      setMatched((m) => [...m, leftId]);
      setHintId(null);
      api.onCorrect(!mistakes.current.has(leftId));
    } else {
      mistakes.current.add(leftId);
      mistakes.current.add(rightId);
      setWrong({ l: leftId, r: rightId });
      lock.current = true;
      setTimeout(() => {
        setWrong(null);
        lock.current = false;
      }, 550);
      api.onWrong();
    }
  }

  function useHint() {
    if (allDone) return;
    const target =
      sel?.id && !matched.includes(sel.id) ? sel.id : pairs.find((p) => !matched.includes(p.id))?.id;
    if (!target) return;
    if (api.onHint()) setHintId(target);
  }

  function cardClass(id, side) {
    const isMatched = matched.includes(id);
    const isSel = sel && sel.side === side && sel.id === id;
    const isWrong = wrong && (side === 'left' ? wrong.l === id : wrong.r === id);
    const isHint = hintId === id;
    if (isMatched) return 'border-grion-500 bg-grion-100 opacity-90';
    if (isWrong) return 'animate-shake !border-red-400 !bg-red-50';
    if (isSel) return '!border-grion-500 bg-white ring-4 ring-grion-200';
    if (isHint) return '!border-gold-500 bg-yellow-50 ring-4 ring-yellow-200 animate-pulse';
    return '';
  }

  return (
    <div className={allDone ? 'pb-72' : 'pb-10'}>
      <div className="mb-3 flex justify-end">
        <HintButton count={api.hints} onClick={useHint} disabled={allDone} />
      </div>

      <div ref={wrapRef} className="relative grid grid-cols-[1fr_1fr] gap-x-9 gap-y-4">
        {/* 연결선 */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          {lines.map((ln) => {
            const dx = Math.max(24, (ln.x2 - ln.x1) * 0.5);
            return (
              <path
                key={ln.id}
                d={`M ${ln.x1} ${ln.y1} C ${ln.x1 + dx} ${ln.y1}, ${ln.x2 - dx} ${ln.y2}, ${ln.x2} ${ln.y2}`}
                fill="none"
                stroke="#58c20a"
                strokeWidth="6"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* 왼쪽: 성구 */}
        <div className="flex flex-col gap-4">
          {pairs.map((p) => (
            <button
              key={p.id}
              ref={(el) => {
                leftRefs.current[p.id] = el;
              }}
              onClick={() => pick('left', p.id)}
              className={`quiz-card relative min-h-[104px] px-3 py-3 text-left ${cardClass(p.id, 'left')}`}
            >
              <span className="flex items-center gap-1.5 font-display text-lg text-forest">
                <BookOpen size={20} className="shrink-0 text-grion-500" strokeWidth={2.6} />
                {p.ref}
              </span>
              <span className="mt-1 block text-[0.8rem] font-medium leading-snug text-gray-600">{p.snippet}</span>
              <span className="absolute -right-[11px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-white bg-grion-400 shadow" />
            </button>
          ))}
        </div>

        {/* 오른쪽: 핵심 주제 (섞여 있음) */}
        <div className="flex flex-col gap-4">
          {rightOrder.map((id) => {
            const p = byId[id];
            return (
              <button
                key={id}
                ref={(el) => {
                  rightRefs.current[id] = el;
                }}
                onClick={() => pick('right', id)}
                className={`quiz-card relative flex min-h-[104px] flex-col items-center justify-center px-2 py-3 text-center ${cardClass(id, 'right')}`}
              >
                <span className="text-4xl leading-none">{p.icon}</span>
                <span className="mt-1.5 font-display text-xl leading-tight text-forest">{p.topic}</span>
                <span className="absolute -left-[11px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-white bg-grion-400 shadow" />
              </button>
            );
          })}
        </div>
      </div>

      {allDone && (
        <FeedbackBar
          type="correct"
          rank={api.rank}
          message="성구와 주제를 모두 정확히 연결했어요!"
          onContinue={api.onComplete}
        />
      )}
    </div>
  );
}

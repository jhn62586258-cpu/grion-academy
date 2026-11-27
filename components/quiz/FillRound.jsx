'use client';

import { useMemo, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { parseBlanks, shuffle } from '@/lib/grade';
import FeedbackBar, { HintButton } from './FeedbackBar';

/** 2라운드: 말씀 빈칸 조립 — 단어 카드를 눌러 빈칸을 채웁니다. */
export default function FillRound({ items, api }) {
  const [qi, setQi] = useState(0);
  const item = items[qi];

  // 문항이 바뀔 때마다 새로 계산
  const parts = useMemo(() => parseBlanks(item.text), [item]);
  const answers = useMemo(() => parts.filter((p) => p.type === 'blank').map((p) => p.answer), [parts]);
  const bank = useMemo(
    () => shuffle([...answers, ...(item.distractors || [])].map((word, i) => ({ id: i, word }))),
    [answers, item]
  );

  const [filled, setFilled] = useState(() => answers.map(() => null)); // 빈칸별 chip id
  const [locked, setLocked] = useState(() => answers.map(() => false)); // 힌트로 확정된 칸
  const [status, setStatus] = useState(null); // null | 'wrong' | 'right'
  const [wrongSlots, setWrongSlots] = useState([]);
  const hadMistake = useRef(false);

  const wordOf = (chipId) => bank.find((b) => b.id === chipId)?.word;
  const allFilled = filled.every((f) => f !== null);
  const isLast = qi === items.length - 1;

  function placeChip(chipId) {
    if (status === 'right') return;
    if (filled.includes(chipId)) return;
    const slot = filled.findIndex((f) => f === null);
    if (slot === -1) return;
    setStatus(null);
    setWrongSlots([]);
    setFilled((f) => f.map((v, i) => (i === slot ? chipId : v)));
  }

  function clearSlot(slot) {
    if (status === 'right' || locked[slot] || filled[slot] === null) return;
    setStatus(null);
    setWrongSlots([]);
    setFilled((f) => f.map((v, i) => (i === slot ? null : v)));
  }

  function check() {
    const bad = [];
    filled.forEach((chipId, i) => {
      if (wordOf(chipId) !== answers[i]) bad.push(i);
    });
    if (bad.length === 0) {
      setStatus('right');
      api.onCorrect(!hadMistake.current);
    } else {
      hadMistake.current = true;
      setWrongSlots(bad);
      setStatus('wrong');
      api.onWrong();
    }
  }

  function retry() {
    // 틀린 칸만 비우고 다시 시도
    setFilled((f) => f.map((v, i) => (wrongSlots.includes(i) && !locked[i] ? null : v)));
    setWrongSlots([]);
    setStatus(null);
  }

  function useHint() {
    if (status === 'right') return;
    // 아직 정답이 아닌 첫 칸을 정답으로 채워서 확정
    const slot = answers.findIndex((ans, i) => !locked[i] && wordOf(filled[i]) !== ans);
    if (slot === -1) return;
    if (!api.onHint()) return;
    const used = new Set(filled.filter((f) => f !== null && f !== filled[slot]));
    const chip = bank.find((b) => b.word === answers[slot] && !used.has(b.id));
    if (!chip) return;
    setFilled((f) => f.map((v, i) => (i === slot ? chip.id : v)));
    setLocked((l) => l.map((v, i) => (i === slot ? true : v)));
    setWrongSlots((w) => w.filter((i) => i !== slot));
    setStatus(null);
  }

  function next() {
    if (isLast) {
      api.onComplete();
      return;
    }
    const nextItem = items[qi + 1];
    const nextAnswers = parseBlanks(nextItem.text).filter((p) => p.type === 'blank');
    hadMistake.current = false;
    setFilled(nextAnswers.map(() => null));
    setLocked(nextAnswers.map(() => false));
    setWrongSlots([]);
    setStatus(null);
    setQi(qi + 1);
  }

  return (
    <div className={status ? 'pb-72' : 'pb-10'}>
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-grion-100 px-3 py-1 font-display text-base text-grion-700">
          {qi + 1} / {items.length}
        </span>
        <HintButton count={api.hints} onClick={useHint} disabled={status === 'right'} />
      </div>

      {/* 문장 카드 */}
      <div className="card-3d p-4">
        <p className="mb-3 flex items-center gap-1.5 font-display text-lg text-grion-700">
          <BookOpen size={20} strokeWidth={2.6} /> {item.ref}
        </p>
        <p className="text-[1.15rem] font-bold leading-[2.6rem] text-forest">
          {parts.map((p, i) => {
            if (p.type === 'text') return <span key={i}>{p.value}</span>;
            const chipId = filled[p.index];
            const isBad = wrongSlots.includes(p.index);
            const isOk = status === 'right' || locked[p.index];
            return (
              <button
                key={i}
                onClick={() => clearSlot(p.index)}
                className={`mx-1 inline-flex min-w-[4.2rem] items-center justify-center rounded-xl border-[3px] px-2 align-middle font-display text-lg leading-[2.1rem] transition ${
                  isBad
                    ? 'animate-shake border-red-400 bg-red-50 text-red-600'
                    : isOk
                      ? 'border-grion-500 bg-grion-100 text-grion-800'
                      : chipId !== null
                        ? 'border-grion-300 bg-white text-forest'
                        : 'border-dashed border-gray-300 bg-gray-50 text-transparent'
                }`}
                aria-label={`빈칸 ${p.index + 1}`}
              >
                {chipId !== null ? wordOf(chipId) : '빈칸'}
              </button>
            );
          })}
        </p>
      </div>

      {/* 단어 은행 */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {bank.map((b) => {
          const used = filled.includes(b.id);
          return (
            <button
              key={b.id}
              onClick={() => placeChip(b.id)}
              disabled={used}
              className={`quiz-card px-4 py-2 font-display text-xl ${
                used ? '!border-gray-200 !bg-gray-100 text-transparent !shadow-none' : 'text-forest'
              }`}
            >
              {b.word}
            </button>
          );
        })}
      </div>

      {!status && (
        <div className="mt-8">
          <button onClick={check} disabled={!allFilled} className="btn-3d btn-green w-full text-xl">
            확인하기
          </button>
        </div>
      )}

      {status === 'right' && (
        <FeedbackBar
          type="correct"
          rank={api.rank}
          message={hadMistake.current ? '끝까지 해냈어요! 다음엔 한 번에!' : '한 번에 완벽하게 조립했어요!'}
          buttonLabel={isLast ? '라운드 마치기' : '계속하기'}
          onContinue={next}
        />
      )}
      {status === 'wrong' && (
        <FeedbackBar
          type="wrong"
          title="아쉬워요! 다시 도전!"
          message="빨간 칸을 눌러 말씀을 다시 확인해 보세요."
          onContinue={retry}
        />
      )}
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { MessageCircleQuestion } from 'lucide-react';
import { gradeShort } from '@/lib/grade';
import Grion from '../Grion';
import FeedbackBar, { HintButton } from './FeedbackBar';

/**
 * 3라운드: 소크라테스식 실전 상황 문답
 *  - mcq   : 객관식 (오답 보기는 하나씩 지워짐 → 해설은 '되묻기' 형태)
 *  - short : 주관식 (핵심 키워드 포함 여부로 채점)
 */
export default function ScenarioRound({ items, api }) {
  const [qi, setQi] = useState(0);
  const item = items[qi];
  const isLast = qi === items.length - 1;

  const [choice, setChoice] = useState(null);
  const [eliminated, setEliminated] = useState([]);
  const [text, setText] = useState('');
  const [status, setStatus] = useState(null); // null | 'right' | 'wrong'
  const [result, setResult] = useState(null); // 주관식 채점 결과
  const [hintLabel, setHintLabel] = useState('');
  const hadMistake = useRef(false);

  function reset() {
    setChoice(null);
    setEliminated([]);
    setText('');
    setStatus(null);
    setResult(null);
    setHintLabel('');
    hadMistake.current = false;
  }

  function checkMcq() {
    if (choice === null) return;
    if (choice === item.answerIndex) {
      setStatus('right');
      api.onCorrect(!hadMistake.current);
    } else {
      hadMistake.current = true;
      setEliminated((e) => [...e, choice]);
      setStatus('wrong');
      api.onWrong();
    }
  }

  function checkShort() {
    if (text.trim().length < 2) return;
    const res = gradeShort(text, item.keywordGroups, item.minMatch);
    setResult(res);
    if (res.pass) {
      setStatus('right');
      api.onCorrect(!hadMistake.current);
    } else {
      hadMistake.current = true;
      setStatus('wrong');
      api.onWrong();
    }
  }

  function useHint() {
    if (status === 'right') return;
    if (item.type === 'mcq') {
      const candidates = item.options
        .map((_, i) => i)
        .filter((i) => i !== item.answerIndex && !eliminated.includes(i));
      if (candidates.length <= 1) return; // 더 지울 보기가 거의 없음
      if (!api.onHint()) return;
      const pickIdx = candidates[Math.floor(Math.random() * candidates.length)];
      setEliminated((e) => [...e, pickIdx]);
      if (choice === pickIdx) setChoice(null);
    } else {
      const g = gradeShort(text, item.keywordGroups, item.minMatch);
      if (!g.missing.length) return;
      if (!api.onHint()) return;
      setHintLabel(g.missing[0]);
    }
  }

  function retry() {
    setStatus(null);
    setResult(null);
    if (item.type === 'mcq') setChoice(null);
  }

  function next() {
    if (isLast) {
      api.onComplete();
      return;
    }
    reset();
    setQi(qi + 1);
  }

  return (
    <div className={status ? 'pb-80' : 'pb-10'}>
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-grion-100 px-3 py-1 font-display text-base text-grion-700">
          {qi + 1} / {items.length}
        </span>
        <HintButton count={api.hints} onClick={useHint} disabled={status === 'right'} />
      </div>

      {/* 상황 카드 */}
      <div className="card-3d p-4">
        <div className="flex items-start gap-3">
          <Grion rank={api.rank} size={64} anim="float" className="shrink-0" />
          <p className="rounded-2xl rounded-tl-sm bg-grion-50 p-3 text-[0.95rem] font-medium leading-relaxed text-forest">
            {item.situation}
          </p>
        </div>
        <p className="mt-4 flex items-start gap-2 font-display text-xl leading-snug text-forest">
          <MessageCircleQuestion size={24} className="mt-0.5 shrink-0 text-grion-500" strokeWidth={2.6} />
          {item.question}
        </p>
      </div>

      {/* 답안 영역 */}
      {item.type === 'mcq' ? (
        <ul className="mt-5 space-y-3">
          {item.options.map((opt, i) => {
            const gone = eliminated.includes(i);
            const selected = choice === i;
            const right = status === 'right' && i === item.answerIndex;
            return (
              <li key={i}>
                <button
                  disabled={gone || status === 'right'}
                  onClick={() => {
                    setChoice(i);
                    if (status === 'wrong') setStatus(null);
                  }}
                  className={`quiz-card flex w-full items-start gap-3 px-4 py-3 text-left ${
                    gone
                      ? '!border-gray-200 !bg-gray-100 text-gray-400 line-through !shadow-none'
                      : right
                        ? '!border-grion-500 !bg-grion-100'
                        : selected
                          ? '!border-grion-500 bg-white ring-4 ring-grion-200'
                          : ''
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-base ${
                      selected || right ? 'bg-grion-500 text-white' : 'bg-grion-100 text-grion-700'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-[0.98rem] font-bold leading-snug text-forest">{opt}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={status === 'right'}
            maxLength={300}
            rows={5}
            placeholder="말씀의 핵심을 담아 한두 문장으로 답해 보세요."
            className="w-full resize-none rounded-2xl border-[3px] border-grion-200 bg-white p-4 text-base font-medium leading-relaxed text-forest outline-none placeholder:text-gray-400 focus:border-grion-500"
          />
          {hintLabel ? (
            <p className="mt-2 rounded-xl bg-yellow-50 p-2.5 text-sm font-bold text-yellow-800">
              💡 작전 지도: <span className="underline">‘{hintLabel}’</span> 내용이 들어가면 좋아요.
            </p>
          ) : null}
        </div>
      )}

      {!status && (
        <div className="mt-6">
          <button
            onClick={item.type === 'mcq' ? checkMcq : checkShort}
            disabled={item.type === 'mcq' ? choice === null : text.trim().length < 2}
            className="btn-3d btn-green w-full text-xl"
          >
            확인하기
          </button>
        </div>
      )}

      {status === 'right' && (
        <FeedbackBar
          type="correct"
          rank={api.rank}
          message={item.explain}
          extra={
            item.type === 'short' ? (
              <div>
                {result?.matched?.length ? <p>✔ 담긴 핵심: {result.matched.join(' · ')}</p> : null}
                <p className="mt-1 font-bold">모범 답안: {item.modelAnswer}</p>
              </div>
            ) : null
          }
          buttonLabel={isLast ? '라운드 마치기' : '계속하기'}
          onContinue={next}
        />
      )}
      {status === 'wrong' && (
        <FeedbackBar
          type="wrong"
          title="조금만 더 생각해 봐요!"
          message={item.type === 'mcq' ? item.explain : '빠진 핵심을 떠올려 보세요.'}
          extra={
            item.type === 'short' && result ? (
              <p>
                필요한 핵심 {result.need}개 중 {result.matched.length}개를 담았어요.
                {result.missing.length ? ` (더 들어가면 좋은 내용: ${result.missing.join(' · ')})` : ''}
              </p>
            ) : null
          }
          onContinue={retry}
        />
      )}
    </div>
  );
}

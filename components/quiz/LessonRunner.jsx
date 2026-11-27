'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Heart, ShieldCheck } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { ROUND_META, unitCounts } from '@/data/questionsData';
import { LESSON_BONUS, MAX_HEARTS, REWARD_PER_CORRECT } from '@/data/config';
import { rankIndexFor } from '@/lib/ranks';
import Grion from '../Grion';
import { BiscuitIcon } from '../ui';
import FillRound from './FillRound';
import LessonComplete from './LessonComplete';
import MatchRound from './MatchRound';
import ScenarioRound from './ScenarioRound';

const ROUND_COMPONENTS = { match: MatchRound, fill: FillRound, scenario: ScenarioRound };

export default function LessonRunner({ lesson, onExit }) {
  const { user, rankIndex, consumeItem, completeRound, toast, lessons } = useApp();

  const savedRounds = user?.progress?.[lesson.id] || 0;
  const practice = savedRounds >= 3; // 이미 마스터한 교안은 복습(보상 없음)

  const [round, setRound] = useState(practice ? 0 : savedRounds);
  const [attempt, setAttempt] = useState(0); // 라운드 재도전 시 컴포넌트를 새로 마운트
  const [phase, setPhase] = useState('play'); // play | roundClear | failed | saveError | complete
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [hints, setHints] = useState(user?.items?.hint || 0);
  const [shields, setShields] = useState(user?.items?.shield || 0);
  const [doneInRound, setDoneInRound] = useState(0);
  const [saveResult, setSaveResult] = useState(null);

  const heartsRef = useRef(MAX_HEARTS);
  const hintsRef = useRef(user?.items?.hint || 0);
  const shieldsRef = useRef(user?.items?.shield || 0);
  const earnedRef = useRef(0);
  const startRank = useRef(rankIndex).current;
  const [roundGain, setRoundGain] = useState(0);

  const counts = useMemo(() => unitCounts(lesson), [lesson]);
  const totalUnits = counts.reduce((a, b) => a + b, 0);
  const baseUnits = counts.slice(0, round).reduce((a, b) => a + b, 0);
  const progressPct = totalUnits ? Math.min(100, ((baseUnits + doneInRound) / totalUnits) * 100) : 0;

  const meta = ROUND_META[round];
  const RoundComp = ROUND_COMPONENTS[meta.key];
  const items = lesson.rounds[meta.key] || [];

  /* ── 라운드 컴포넌트가 호출하는 API ── */
  const onWrong = useCallback(() => {
    if (shieldsRef.current > 0) {
      shieldsRef.current -= 1;
      setShields(shieldsRef.current);
      consumeItem('shield').catch(() => {});
      toast('🦺 방탄조끼가 오답을 막아줬어요!');
      return 'blocked';
    }
    heartsRef.current -= 1;
    setHearts(Math.max(0, heartsRef.current));
    if (heartsRef.current <= 0) setTimeout(() => setPhase('failed'), 900);
    return 'lost';
  }, [consumeItem, toast]);

  const onCorrect = useCallback((firstTry) => {
    if (firstTry) earnedRef.current += REWARD_PER_CORRECT;
    setDoneInRound((n) => n + 1);
  }, []);

  const onHint = useCallback(() => {
    if (hintsRef.current <= 0) {
      toast('🗺️ 작전 지도가 없어요! PX에서 보급받을 수 있어요.');
      return false;
    }
    hintsRef.current -= 1;
    setHints(hintsRef.current);
    consumeItem('hint').catch(() => {});
    return true;
  }, [consumeItem, toast]);

  const saveRound = useCallback(async () => {
    if (practice) {
      setRoundGain(0);
      setPhase(round >= 2 ? 'complete' : 'roundClear');
      return;
    }
    try {
      const res = await completeRound({
        lessonId: lesson.id,
        roundIndex: round,
        earned: earnedRef.current,
        bonus: LESSON_BONUS,
      });
      setSaveResult(res);
      setRoundGain(res.gain);
      setPhase(round >= 2 ? 'complete' : 'roundClear');
    } catch (e) {
      console.error(e);
      setPhase('saveError');
    }
  }, [practice, round, completeRound, lesson.id]);

  const api = {
    rank: rankIndex,
    hints,
    onWrong,
    onCorrect,
    onHint,
    onComplete: saveRound,
  };

  function resetRoundState() {
    heartsRef.current = MAX_HEARTS;
    setHearts(MAX_HEARTS);
    earnedRef.current = 0;
    setDoneInRound(0);
    setAttempt((a) => a + 1);
  }

  function nextRound() {
    setRound((r) => r + 1);
    resetRoundState();
    setPhase('play');
  }

  function retryRound() {
    resetRoundState();
    setPhase('play');
  }

  function exit() {
    if (phase === 'play' && doneInRound > 0 && !window.confirm('훈련을 중단할까요? 이 라운드 진행은 저장되지 않아요.')) {
      return;
    }
    onExit();
  }

  /* ── 교안 마스터 화면 ── */
  if (phase === 'complete') {
    const newRank = saveResult ? rankIndexFor(saveResult.clearedCount, lessons.length) : rankIndex;
    return (
      <LessonComplete
        lesson={lesson}
        practice={practice}
        gain={saveResult?.gain || 0}
        prevRank={startRank}
        newRank={practice ? startRank : newRank}
        onDone={onExit}
      />
    );
  }

  return (
    <div className="app-frame bg-gradient-to-b from-[#f4fff0] to-[#e6f7d5]">
      {/* 상단 바 */}
      <div className="sticky top-0 z-20 bg-[#f4fff0]/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={exit} aria-label="나가기" className="rounded-full p-1.5 text-gray-500 active:scale-90">
            <ArrowLeft size={30} strokeWidth={3} />
          </button>
          <div className="relative h-[18px] flex-1 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(progressPct, 4)}%`,
                backgroundImage: 'repeating-linear-gradient(90deg, #7ddc1f 0 26px, #5cc10f 26px 30px)',
              }}
            />
            <span className="absolute inset-x-3 top-[3px] h-[5px] rounded-full bg-white/40" />
          </div>
          <span className="flex items-center gap-1 font-display text-xl text-red-500">
            <Heart size={24} fill="currentColor" strokeWidth={0} /> {hearts}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between pl-1">
          <p className="font-display text-base text-grion-700">
            {lesson.title} · {round + 1}라운드 <span className="text-forest">{meta.title}</span>
            {practice ? <span className="ml-1 text-xs text-gray-400">(복습)</span> : null}
          </p>
          <div className="flex items-center gap-2 text-sm font-bold text-forest">
            {shields > 0 && (
              <span className="flex items-center gap-0.5 rounded-full bg-sky-100 px-2 py-0.5 text-sky-700">
                <ShieldCheck size={15} strokeWidth={2.8} /> {shields}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BiscuitIcon size={22} /> {user?.biscuits ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* 문제 영역 */}
      <div className="px-4 pt-3">
        <h2 className="mb-4 flex items-start gap-2 font-display text-[1.45rem] leading-snug text-forest">
          {meta.guide}
        </h2>
        {phase === 'play' && items.length > 0 ? (
          <RoundComp key={`${round}-${attempt}`} items={items} api={api} />
        ) : null}
        {phase === 'play' && items.length === 0 ? (
          <div className="card-3d p-6 text-center">
            <p className="font-bold text-forest">이 라운드에는 아직 문제가 없어요.</p>
            <button className="btn-3d btn-green mt-4" onClick={saveRound}>
              건너뛰기
            </button>
          </div>
        ) : null}
      </div>

      {/* 라운드 클리어 */}
      {phase === 'roundClear' && (
        <Overlay>
          <Grion rank={rankIndex} size={190} anim="talk" />
          <h3 className="mt-2 font-display text-4xl text-forest">{round + 1}라운드 돌파!</h3>
          <p className="mt-1 font-bold text-grion-700">{ROUND_META[round + 1]?.title} 라운드가 기다리고 있어요!</p>
          {roundGain > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-full bg-yellow-50 px-5 py-2 shadow">
              <BiscuitIcon size={32} />
              <span className="font-display text-2xl text-[#5a3d12]">+{roundGain} 건빵</span>
            </div>
          )}
          <button onClick={nextRound} className="btn-3d btn-green mt-8 w-full max-w-xs text-2xl">
            다음 라운드 · 충진!
          </button>
        </Overlay>
      )}

      {/* 하트 소진 */}
      {phase === 'failed' && (
        <Overlay>
          <Grion rank={2} size={180} anim="float" />
          <h3 className="mt-2 font-display text-3xl text-forest">하트를 모두 썼어요!</h3>
          <p className="mt-2 px-4 text-center font-bold leading-relaxed text-gray-600">
            괜찮아요, 훈련은 반복이 힘이에요.
            <br />
            말씀을 한 번 더 떠올리고 다시 도전해 볼까요?
          </p>
          <button onClick={retryRound} className="btn-3d btn-green mt-8 w-full max-w-xs text-2xl">
            재정비 후 다시 도전
          </button>
          <button onClick={onExit} className="btn-3d btn-gray mt-3 w-full max-w-xs text-lg">
            훈련장으로 돌아가기
          </button>
        </Overlay>
      )}

      {/* 저장 실패 */}
      {phase === 'saveError' && (
        <Overlay>
          <Grion rank={2} size={150} anim="float" />
          <h3 className="mt-2 font-display text-2xl text-forest">진도 저장에 실패했어요</h3>
          <p className="mt-2 px-4 text-center text-sm font-bold text-gray-600">
            네트워크 상태를 확인하고 다시 저장해 주세요. (문제는 다시 풀지 않아도 돼요)
          </p>
          <button onClick={saveRound} className="btn-3d btn-green mt-6 w-full max-w-xs text-xl">
            다시 저장하기
          </button>
        </Overlay>
      )}
    </div>
  );
}

function Overlay({ children }) {
  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] animate-fadeIn flex-col items-center justify-center bg-white/95 px-6 text-center">
      {children}
    </div>
  );
}

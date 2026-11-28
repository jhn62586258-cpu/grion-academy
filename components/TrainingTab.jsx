'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Check, Clock, FileText, Lock, Megaphone } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { ROUND_META } from '@/data/questionsData';
import { isAdminUser, subscribeSettings, updateSettings } from '@/lib/db';
import { RANKS } from '@/lib/ranks';
import Grion from './Grion';
import LessonNote from './LessonNote';
import { Bubble, FlagPost, Sheet } from './ui';
import { ProfileStrip } from './Header';

const ROW_H = 155;
const TOP = 85;
const X_PATTERN = [0.64, 0.42, 0.56, 0.44];

function stageState(lessons, progress, i, openLessons) {
  if (i + 1 > openLessons) return 'scheduled';
  const done = (progress[lessons[i].id] || 0) >= 3;
  const prevDone = i === 0 || (progress[lessons[i - 1].id] || 0) >= 3;
  if (done) return 'done';
  return prevDone ? 'current' : 'locked';
}

export default function TrainingTab({ onStart, onGoShop }) {
  const { user, lessons, rankIndex, clearedCount, toast } = useApp();
  const [picked, setPicked] = useState(null);
  const [showNote, setShowNote] = useState(false);
  const [shakeIdx, setShakeIdx] = useState(-1);
  const [settings, setSettings] = useState({ notice: '', openLessons: 99 });
  const [noticeInput, setNoticeInput] = useState('');
  const [savingAdmin, setSavingAdmin] = useState(false);

  const isAdmin = isAdminUser(user);
  const progress = user?.progress || {};

  useEffect(() => {
    return subscribeSettings((data) => {
      setSettings(data);
      setNoticeInput(data.notice || '');
    });
  }, []);

  const openCount = settings.openLessons ?? 99;
  const states = lessons.map((_, i) => stageState(lessons, progress, i, openCount));
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
      : '충진! 이번 주 훈련을 마쳤어요!';

  function tapStage(i) {
    if (states[i] === 'scheduled') {
      setShakeIdx(i);
      setTimeout(() => setShakeIdx(-1), 500);
      toast(`${lessons[i].title}은 다음 주차에 오픈될 예정이에요!`);
      return;
    }
    if (states[i] === 'locked') {
      setShakeIdx(i);
      setTimeout(() => setShakeIdx(-1), 500);
      toast('앞 교안을 먼저 마스터해야 해요!');
      return;
    }
    setShowNote(false);
    setPicked(i);
  }

  async function saveNotice() {
    if (savingAdmin) return;
    setSavingAdmin(true);
    try {
      await updateSettings({ notice: noticeInput.trim() });
      toast('상단 공지사항이 저장되었습니다!');
    } catch {
      toast('공지 저장에 실패했습니다.');
    } finally {
      setSavingAdmin(false);
    }
  }

  async function changeOpenLessons(count) {
    if (savingAdmin) return;
    setSavingAdmin(true);
    try {
      await updateSettings({ openLessons: count });
      toast(`${count >= lessons.length ? '전체 교안' : `${count}교안까지`} 오픈 설정 완료!`);
    } catch {
      toast('설정 변경에 실패했습니다.');
    } finally {
      setSavingAdmin(false);
    }
  }

  const pickedLesson = picked != null ? lessons[picked] : null;
  const pickedRounds = pickedLesson ? progress[pickedLesson.id] || 0 : 0;

  return (
    <div>
      <ProfileStrip onGoShop={onGoShop} />

      {settings.notice ? (
        <div className="mx-3 mt-2 flex items-center gap-2 rounded-2xl border-[2.5px] border-amber-400 bg-amber-50 px-3.5 py-2 shadow-sm">
          <Megaphone size={20} className="shrink-0 text-amber-600 animate-bounce" />
          <div className="text-sm font-bold leading-snug text-amber-900">{settings.notice}</div>
        </div>
      ) : null}

      {isAdmin && (
        <div className="mx-3 mt-2 space-y-2.5 rounded-2xl border-[3px] border-amber-400 bg-white/95 p-3 shadow-md">
          <div className="text-sm font-bold text-amber-800">[관리자 훈련장 제어판]</div>
          <div className="flex gap-1.5">
            <input
              value={noticeInput}
              onChange={(e) => setNoticeInput(e.target.value)}
              placeholder="상단 고정 공지 입력 (비우면 숨김)"
              className="min-w-0 flex-1 rounded-xl border-2 border-amber-200 bg-amber-50/50 px-3 py-1.5 text-sm text-forest outline-none focus:border-amber-500"
            />
            <button onClick={saveNotice} disabled={savingAdmin} className="btn-3d btn-yellow !px-3 !py-1.5 text-sm shrink-0">
              저장
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-gray-500 mr-1">오픈 범위:</span>
            {lessons.map((l, idx) => {
              const num = idx + 1;
              const active = openCount === num;
              return (
                <button
                  key={l.id}
                  onClick={() => changeOpenLessons(num)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    active ? 'bg-grion-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {num}교안까지
                </button>
              );
            })}
            <button
              onClick={() => changeOpenLessons(99)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                openCount >= lessons.length ? 'bg-grion-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              전체 오픈
            </button>
          </div>
        </div>
      )}
      <div className="relative overflow-hidden bg-[#b7e38a]" style={{ minHeight: H }}>
        <img
          src="/images/bg_map.png"
          alt="훈련장 배경"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
        />

        <div className="relative z-10 flex items-end px-2 pt-24">
          <Grion rank={rankIndex} size={150} anim="talk" className="-mb-2 shrink-0 drop-shadow-md" />
          <Bubble className="mb-14 -ml-3 flex-1 !px-3 !py-2.5 !text-[1.02rem] whitespace-nowrap tracking-tight shadow-md">
            {bubbleText}
          </Bubble>
        </div>

        {currentIdx >= 0 && (
          <FlagPost
            className="absolute z-10"
            style={{
              top: points[currentIdx].y + 85,
              left: `calc(${points[currentIdx].x * 100}% ${points[currentIdx].x < 0.5 ? '+' : '-'} 105px)`,
            }}
          />
        )}

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
                aria-label={lesson.title}
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
                  {s === 'scheduled' ? (
                    <Clock size={25} strokeWidth={2.6} />
                  ) : s === 'locked' ? (
                    <Lock size={25} strokeWidth={2.6} />
                  ) : (
                    <BookOpen size={26} strokeWidth={2.6} />
                  )}
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

      <Sheet open={picked != null} onClose={() => setPicked(null)} title={pickedLesson ? `${pickedLesson.title} 훈련` : ''}>
        {pickedLesson && (
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-base text-grion-700">{pickedLesson.subtitle}</span>
              <button
                type="button"
                onClick={() => setShowNote((v) => !v)}
                className="flex shrink-0 items-center gap-1 rounded-full border-2 border-grion-400 bg-grion-50 px-3 py-1 text-xs font-bold text-grion-800 active:scale-95"
              >
                <FileText size={14} /> {showNote ? '목록 보기' : '핵심 요약 노트'}
              </button>
            </div>

            {showNote ? (
              <LessonNote lesson={pickedLesson} />
            ) : (
              <ul className="mb-4 space-y-2">
                {ROUND_META.map((r, idx) => {
                  const cleared = pickedRounds > idx;
                  const liCls = cleared ? 'border-grion-300 bg-grion-50' : 'border-gray-200 bg-white';
                  const badgeCls = cleared ? 'bg-grion-500 text-white' : 'bg-gray-100 text-gray-500';
                  return (
                    <li key={r.key} className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-2 ${liCls}`}>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-lg ${badgeCls}`}>
                        {cleared ? <Check size={18} strokeWidth={4} /> : idx + 1}
                      </span>
                      <span className="text-lg text-forest">{r.title}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {pickedRounds >= 3 && (
              <div className="mb-3 rounded-xl bg-yellow-50 p-2.5 text-center text-sm text-yellow-800">
                이미 마스터한 교안이에요. 복습 훈련은 건빵 보상이 없어요.
              </div>
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
            <div className="mt-3 text-center text-xs text-gray-400">
              현재 계급: {RANKS[rankIndex].name} · 마스터한 교안 {clearedCount}/{lessons.length}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { Trophy, Users } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { RANKS, rankIndexFor } from '@/lib/ranks';
import { titleLabel } from '@/lib/shop';
import { GrionFace } from './Grion';
import { RankBadge } from './ui';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function RankingTab() {
  const { users, user, totalLessons, session } = useApp();
  const [mode, setMode] = useState('person'); // person | class

  const people = useMemo(() => {
    return users
      .map((u) => {
        const cleared = u.clearedCount || 0;
        return { ...u, cleared, rank: rankIndexFor(cleared, totalLessons) };
      })
      .sort((a, b) => b.cleared - a.cleared || (b.xp || 0) - (a.xp || 0) || a.nickname.localeCompare(b.nickname, 'ko'));
  }, [users, totalLessons]);

  const classes = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      const key = u.classId;
      if (!map[key]) map[key] = { classId: key, members: 0, sumRate: 0 };
      map[key].members += 1;
      map[key].sumRate += totalLessons ? Math.min(1, (u.clearedCount || 0) / totalLessons) : 0;
    });
    return Object.values(map)
      .map((c) => {
        const rate = c.sumRate / c.members;
        return { ...c, rate, rank: rankIndexFor(Math.round(rate * totalLessons), totalLessons) };
      })
      .sort((a, b) => b.rate - a.rate || b.members - a.members);
  }, [users, totalLessons]);

  const myPos = people.findIndex((p) => p.id === user?.id) + 1;
  const myClassPos = classes.findIndex((c) => c.classId === session?.classId) + 1;

  return (
    <div className="px-4 pt-3">
      {/* 내 현황 요약 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-3d p-3 text-center">
          <p className="text-xs font-bold text-gray-500">내 순위</p>
          <p className="font-display text-3xl text-forest">{myPos ? `${myPos}위` : '-'}</p>
          <p className="text-xs text-gray-400">전체 {people.length}명 중</p>
        </div>
        <div className="card-3d p-3 text-center">
          <p className="text-xs font-bold text-gray-500">우리 반({session?.classId})</p>
          <p className="font-display text-3xl text-forest">{myClassPos ? `${myClassPos}위` : '-'}</p>
          <p className="text-xs text-gray-400">전체 {classes.length}개 반 중</p>
        </div>
      </div>

      {/* 전환 토글 */}
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white/70 p-1.5">
        {[
          { id: 'person', label: '개인 계급', Icon: Trophy },
          { id: 'class', label: '반 대항전', Icon: Users },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 font-display text-lg transition ${
              mode === id ? 'bg-grion-500 text-white shadow-[0_3px_0_#3d9100]' : 'text-gray-500'
            }`}
          >
            <Icon size={20} strokeWidth={2.6} /> {label}
          </button>
        ))}
      </div>

      {mode === 'person' ? (
        <ol className="mt-4 space-y-2.5">
          {people.length === 0 && <Empty text="아직 입소한 교사가 없어요." />}
          {people.map((p, i) => {
            const mine = p.id === user?.id;
            return (
              <li
                key={p.id}
                className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-3 py-2.5 ${
                  mine ? 'border-grion-500 shadow-[0_4px_0_#58c20a]' : 'border-grion-100 shadow-[0_3px_0_#e3f2d3]'
                }`}
              >
                <span className="w-9 text-center font-display text-2xl text-forest">{MEDALS[i] || i + 1}</span>
                <GrionFace rank={p.rank} size={50} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg text-forest">
                    {p.nickname}
                    {mine ? <span className="ml-1 text-xs text-grion-600">(나)</span> : null}
                  </p>
                  <p className="truncate text-xs font-bold text-gray-500">
                    {p.classId}
                    {p.title ? ` · ${titleLabel(p.title)}` : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <RankBadge bars={RANKS[p.rank].bars} />
                    <span className="font-display text-lg text-forest">{RANKS[p.rank].name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    마스터 {p.cleared}/{totalLessons}교안
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <ol className="mt-4 space-y-3">
          {classes.length === 0 && <Empty text="아직 집계할 반이 없어요." />}
          {classes.map((c, i) => {
            const mine = c.classId === session?.classId;
            const pct = Math.round(c.rate * 100);
            return (
              <li
                key={c.classId}
                className={`rounded-2xl border-2 bg-white p-3 ${
                  mine ? 'border-grion-500 shadow-[0_4px_0_#58c20a]' : 'border-grion-100 shadow-[0_3px_0_#e3f2d3]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 text-center font-display text-2xl text-forest">{MEDALS[i] || i + 1}</span>
                  <GrionFace rank={c.rank} size={46} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl text-forest">
                      {c.classId}
                      {mine ? <span className="ml-1 text-xs text-grion-600">(우리 반)</span> : null}
                    </p>
                    <p className="text-xs font-bold text-gray-500">대원 {c.members}명</p>
                  </div>
                  <p className="font-display text-2xl text-grion-600">{pct}%</p>
                </div>
                <div className="mt-2 h-3.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-grion-500 to-grion-300 transition-all duration-700"
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
              </li>
            );
          })}
          <p className="pt-1 text-center text-xs text-gray-400">평균 진급률 = 반 대원들의 (마스터한 교안 ÷ 전체 교안) 평균</p>
        </ol>
      )}
    </div>
  );
}

function Empty({ text }) {
  return <p className="rounded-2xl bg-white/70 p-6 text-center font-bold text-gray-500">{text}</p>;
}

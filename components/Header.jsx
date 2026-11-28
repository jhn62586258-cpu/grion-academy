'use client';

import { useState } from 'react';
import { FileCheck2, LogOut, Plus, Settings } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { RANKS } from '@/lib/ranks';
import { titleLabel } from '@/lib/shop';
import ExamModal from './ExamModal';
import { GrionFace } from './Grion';
import { BiscuitIcon, Emblem, RankBadge, Sheet } from './ui';

export function Header({ subtitle }) {
  const { user, session, logout, rankIndex } = useApp();
  const [open, setOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-3 pb-1 pt-4">
        <div className="flex items-center gap-2 min-w-0">
          <Emblem size={44} />
          <div className="leading-tight truncate">
            <h1 className="font-display text-[1.45rem] text-forest truncate">그리온 말씀 사관학교</h1>
            {subtitle ? <p className="-mt-0.5 text-xs font-bold text-grion-700">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setExamOpen(true)}
            className="flex items-center gap-1 rounded-full border-2 border-amber-400 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-900 shadow active:scale-95"
          >
            <FileCheck2 size={16} className="text-amber-600" />
            시험공부
          </button>
          <button
            onClick={() => setOpen(true)}
            aria-label="설정"
            className="rounded-full border-2 border-white/80 bg-white/80 p-2 text-forest shadow active:scale-95"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <ExamModal open={examOpen} onClose={() => setExamOpen(false)} />

      <Sheet open={open} onClose={() => setOpen(false)} title="군 생활 설정">
        <div className="space-y-4">
          <div className="card-3d flex items-center gap-3 p-3">
            <GrionFace rank={rankIndex} size={56} />
            <div>
              <p className="font-display text-xl text-forest">
                {RANKS[rankIndex].name} {user?.nickname || session?.nickname}
              </p>
              <p className="text-sm text-gray-500">소속 반: {session?.classId}</p>
            </div>
          </div>
          <p className="rounded-xl bg-grion-50 p-3 text-sm leading-relaxed text-grion-800">
            진도·계급·건빵은 서버에 저장돼 있어요. 로그아웃해도 사라지지 않으며,
            다른 기기에서는 <b>소속 반 + 닉네임 + PIN 4자리</b>를 입력하면 그대로 불러올 수 있어요.
          </p>
          <button
            onClick={() => {
              if (window.confirm('로그아웃할까요? (진도는 안전하게 저장되어 있어요)')) {
                setOpen(false);
                logout();
              }
            }}
            className="btn-3d btn-gray w-full"
          >
            <LogOut size={20} /> 로그아웃
          </button>
        </div>
      </Sheet>
    </>
  );
}

export function ProfileStrip({ onGoShop }) {
  const { user, session, rankIndex } = useApp();
  const rank = RANKS[rankIndex];
  const title = titleLabel(user?.title);

  return (
    <div className="mx-3 mt-2 flex items-center gap-3 rounded-[2rem] border-2 border-white bg-white/85 px-3 py-2 shadow-[0_4px_0_rgba(0,0,0,0.06)] backdrop-blur">
      <GrionFace rank={rankIndex} size={52} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <RankBadge bars={rank.bars} />
          <span className="truncate font-display text-xl text-forest">
            {rank.name} {user?.nickname || session?.nickname}
          </span>
        </div>
        {title ? <p className="truncate text-xs font-bold text-grion-700">{title}</p> : null}
      </div>
      <div className="h-8 w-px bg-gray-200" />
      <button onClick={onGoShop} className="flex items-center gap-1.5 active:scale-95" aria-label="PX로 이동">
        <BiscuitIcon size={34} />
        <span className="font-display text-2xl text-[#5a3d12]">{user?.biscuits ?? 0}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-grion-500 text-white shadow">
          <Plus size={18} strokeWidth={3} />
        </span>
      </button>
    </div>
  );
}

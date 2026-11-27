'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/AppContext';
import BottomNav from './BottomNav';
import Grion from './Grion';
import { Header } from './Header';
import Login from './Login';
import SetupNeeded from './SetupNeeded';
import { Toast } from './ui';
import TrainingTab from './TrainingTab';
import RankingTab from './RankingTab';
import ShopTab from './ShopTab';
import LettersTab from './LettersTab';
import LessonRunner from './quiz/LessonRunner';

function Splash() {
  return (
    <main className="app-frame flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-[#bfe8ff] to-[#d4f0b4]">
      <Grion rank={0} size={140} anim="talk" />
      <p className="mt-2 font-display text-2xl text-forest">입소 준비 중… 충진!</p>
    </main>
  );
}

const SUBTITLES = {
  train: '말씀 훈련장',
  hq: '상황실 · 랭킹 보드',
  px: 'PX · 보급소',
  letter: '마음의 편지',
};

export default function Shell() {
  const { status, user, logout, toastMsg } = useApp();
  const [tab, setTab] = useState('train');
  const [activeLesson, setActiveLesson] = useState(null);

  // 서버에서 내 문서가 사라진 경우(관리자가 삭제 등) 안전하게 로그아웃
  useEffect(() => {
    if (status === 'ready' && user === null) logout();
  }, [status, user, logout]);

  if (status === 'loading') return <Splash />;
  if (status === 'nofirebase') return <SetupNeeded />;
  if (status === 'loggedOut') return (
    <>
      <Login />
      <Toast message={toastMsg} />
    </>
  );
  if (!user) return <Splash />;

  if (activeLesson) {
    return (
      <>
        <LessonRunner lesson={activeLesson} onExit={() => setActiveLesson(null)} />
        <Toast message={toastMsg} />
      </>
    );
  }

  return (
    <div className="app-frame bg-gradient-to-b from-[#bfe8ff] via-[#e6f6ff] to-[#e9f7d6]">
      <Header subtitle={SUBTITLES[tab]} />
      <div className="pb-32">
        {tab === 'train' && <TrainingTab onStart={setActiveLesson} onGoShop={() => setTab('px')} />}
        {tab === 'hq' && <RankingTab />}
        {tab === 'px' && <ShopTab />}
        {tab === 'letter' && <LettersTab />}
      </div>
      <BottomNav tab={tab} onChange={setTab} />
      <Toast message={toastMsg} />
    </div>
  );
}

'use client';

import Grion from './Grion';

const KEYS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

export default function SetupNeeded() {
  return (
    <main className="app-frame bg-gradient-to-b from-[#bfe8ff] to-[#d4f0b4] px-5 py-10 text-center">
      <div className="flex justify-center">
        <Grion rank={2} size={150} anim="float" />
      </div>
      <h1 className="mt-2 font-display text-3xl text-forest">보급품이 아직 도착하지 않았어요!</h1>
      <p className="mt-3 text-sm leading-relaxed text-forest/80">
        Firebase 연결 정보(.env.local)가 비어 있습니다.
        <br />
        README의 <b>Firebase 설정 가이드</b>를 따라 아래 값을 채우고 서버를 다시 시작해 주세요.
      </p>
      <ul className="card-3d mx-auto mt-5 space-y-1 p-4 text-left font-mono text-xs text-forest">
        {KEYS.map((k) => (
          <li key={k}>{k}</li>
        ))}
      </ul>
    </main>
  );
}

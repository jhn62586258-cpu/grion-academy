'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { CLASS_OPTIONS } from '@/data/config';
import Grion from './Grion';
import { Bubble, Emblem } from './ui';

export default function Login() {
  const { enlist, toast } = useApp();
  const [classId, setClassId] = useState('');
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const nickOk = nickname.trim().length >= 2 && nickname.trim().length <= 10;
  const pinOk = /^\d{4}$/.test(pin);
  const canSubmit = classId && nickOk && pinOk && !busy;

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError('');
    try {
      const res = await enlist({ classId, nickname, pin });
      toast(res.isNew ? '입소를 환영합니다! 충진!' : '기존 진도를 불러왔어요. 충진!');
    } catch (err) {
      if (err?.message === 'PIN_MISMATCH') {
        setError(
          '이미 등록된 닉네임이에요. PIN 4자리가 다르면 들어올 수 없어요. (기기를 바꾼 경우, 처음 정한 PIN을 입력해 주세요)'
        );
      } else {
        console.error(err);
        setError('연결에 실패했어요. 네트워크와 Firebase 설정을 확인해 주세요.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-frame bg-gradient-to-b from-[#bfe8ff] via-[#e4f6ff] to-[#d4f0b4] px-5 pb-10 pt-8">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <Emblem size={52} />
          <h1 className="font-display text-3xl text-forest">그리온 말씀 사관학교</h1>
        </div>

        <div className="mt-4 flex w-full items-end gap-2">
          <Grion rank={0} size={150} anim="talk" />
          <Bubble className="mb-10 flex-1">
            충진! 입소 신청서를
            <br />
            작성해 주세요!
          </Bubble>
        </div>
      </div>

      <form onSubmit={submit} className="card-3d -mt-2 space-y-4 p-5">
        <label className="block">
          <span className="mb-1 block font-display text-lg text-forest">소속 반</span>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded-2xl border-[3px] border-grion-200 bg-grion-50 px-4 py-3 text-lg font-bold text-forest outline-none focus:border-grion-500"
          >
            <option value="">반을 선택하세요</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block font-display text-lg text-forest">닉네임 (2~10자)</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={10}
            placeholder="예: 김교사"
            className="w-full rounded-2xl border-[3px] border-grion-200 bg-grion-50 px-4 py-3 text-lg font-bold text-forest outline-none placeholder:font-normal placeholder:text-gray-400 focus:border-grion-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block font-display text-lg text-forest">PIN (숫자 4자리)</span>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            type="password"
            autoComplete="off"
            placeholder="••••"
            className="w-full rounded-2xl border-[3px] border-grion-200 bg-grion-50 px-4 py-3 text-center text-2xl font-bold tracking-[0.6em] text-forest outline-none placeholder:tracking-[0.6em] placeholder:text-gray-300 focus:border-grion-500"
          />
        </label>

        {error ? (
          <p className="animate-shake rounded-xl bg-red-50 p-3 text-sm font-bold leading-relaxed text-red-600">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={!canSubmit} className="btn-3d btn-green w-full text-xl">
          {busy ? '입소 처리 중…' : '입소하기 · 충진!'}
        </button>

        <p className="text-center text-xs leading-relaxed text-gray-500">
          처음이면 새로 등록되고, 이미 등록한 분은 같은 정보를 입력하면
          <br />
          기존 계급과 진도를 그대로 불러옵니다.
        </p>
      </form>
    </main>
  );
}

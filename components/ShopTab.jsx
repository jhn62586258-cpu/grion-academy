'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { CONSUMABLES, TITLES } from '@/lib/shop';
import { BiscuitIcon } from './ui';

export default function ShopTab() {
  const { user, buy, equip, toast } = useApp();
  const [busyId, setBusyId] = useState(null);
  const biscuits = user?.biscuits ?? 0;
  const owned = user?.titles || [];

  async function purchase(item) {
    if (busyId) return;
    setBusyId(item.id);
    try {
      await buy(item.id);
      toast(`${item.emoji} ${item.name} 보급 완료!`);
    } catch (e) {
      if (e?.message === 'NOT_ENOUGH') toast('건빵이 부족해요. 훈련으로 모아 보세요!');
      else if (e?.message === 'ALREADY_OWNED') toast('이미 가지고 있는 칭호예요.');
      else toast('구매에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setBusyId(null);
    }
  }

  async function toggleTitle(item) {
    try {
      await equip(user.title === item.id ? '' : item.id);
    } catch {
      toast('장착에 실패했어요.');
    }
  }

  return (
    <div className="px-4 pt-3">
      {/* 잔액 */}
      <div className="card-3d flex items-center justify-between p-4">
        <div>
          <p className="text-sm font-bold text-gray-500">내 건빵 포인트</p>
          <p className="font-display text-4xl text-[#5a3d12]">{biscuits}</p>
        </div>
        <BiscuitIcon size={64} />
      </div>

      {/* 보급품 */}
      <h2 className="mb-2 mt-6 font-display text-2xl text-forest">🎒 보급품</h2>
      <ul className="space-y-3">
        {CONSUMABLES.map((item) => {
          const have = user?.items?.[item.kind] || 0;
          const canBuy = biscuits >= item.price;
          return (
            <li key={item.id} className="card-3d flex items-center gap-3 p-3">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-grion-50 text-4xl">
                {item.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl text-forest">
                  {item.name} <span className="text-sm text-grion-600">보유 {have}개</span>
                </p>
                <p className="text-xs font-bold leading-snug text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => purchase(item)}
                disabled={!canBuy || busyId === item.id}
                className="btn-3d btn-yellow !px-3 !py-2 text-lg"
              >
                <BiscuitIcon size={22} /> {item.price}
              </button>
            </li>
          );
        })}
      </ul>

      {/* 칭호 */}
      <h2 className="mb-2 mt-7 font-display text-2xl text-forest">🎖️ 칭호 배지</h2>
      <ul className="space-y-3">
        {TITLES.map((item) => {
          const has = owned.includes(item.id);
          const equipped = user?.title === item.id;
          const canBuy = biscuits >= item.price;
          return (
            <li key={item.id} className="card-3d flex items-center gap-3 p-3">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-4xl">
                {item.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl text-forest">{item.name}</p>
                <p className="text-xs font-bold text-gray-500">{item.desc}</p>
              </div>
              {has ? (
                <button
                  onClick={() => toggleTitle(item)}
                  className={`btn-3d !px-3 !py-2 text-base ${equipped ? 'btn-green' : 'btn-white'}`}
                >
                  {equipped ? (
                    <>
                      <Check size={18} strokeWidth={3.5} /> 장착중
                    </>
                  ) : (
                    '장착'
                  )}
                </button>
              ) : (
                <button
                  onClick={() => purchase(item)}
                  disabled={!canBuy || busyId === item.id}
                  className="btn-3d btn-yellow !px-3 !py-2 text-lg"
                >
                  <BiscuitIcon size={22} /> {item.price}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-center text-xs leading-relaxed text-gray-500">
        건빵은 훈련에서 처음 한 번에 맞힐 때와 교안을 마스터할 때 보급돼요.
        <br />
        작전 지도는 퀴즈 화면의 💡 버튼, 방탄조끼는 오답이 났을 때 자동으로 사용돼요.
      </p>
    </div>
  );
}

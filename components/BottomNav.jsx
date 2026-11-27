'use client';

import { Mail, Radio, Store, Tent } from 'lucide-react';

export const TABS = [
  { id: 'train', label: '훈련장', Icon: Tent },
  { id: 'hq', label: '상황실', Icon: Radio },
  { id: 'px', label: 'PX', Icon: Store },
  { id: 'letter', label: '마음의 편지', Icon: Mail },
];

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px] rounded-t-[2rem] border-t-2 border-white bg-[#fffdf3] px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
      <ul className="grid grid-cols-4 gap-1">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <li key={id}>
              <button
                onClick={() => onChange(id)}
                className={`flex w-full flex-col items-center gap-0.5 rounded-2xl border-[3px] px-1 py-1.5 transition ${
                  active
                    ? 'border-grion-400 bg-grion-50 text-grion-700'
                    : 'border-transparent text-gray-500 active:bg-gray-100'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={30} strokeWidth={active ? 2.6 : 2} className={active ? 'animate-float' : ''} />
                <span className="font-display text-[0.95rem] leading-none">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

'use client';

export const TABS = [
  { id: 'train', label: '훈련장', img: '/images/tab_1.png' },
  { id: 'hq', label: '상황실', img: '/images/tab_2.png' },
  { id: 'px', label: 'PX', img: '/images/tab_3.png' },
  { id: 'letter', label: '마음의 편지', img: '/images/tab_4.png' },
];

export default function BottomNav({ tab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px] rounded-t-[2rem] border-t-2 border-white bg-[#fffdf3] px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
      <ul className="grid grid-cols-4 gap-1">
        {TABS.map(({ id, label, img }) => {
          const active = tab === id;
          return (
            <li key={id}>
              <button
                onClick={() => onChange(id)}
                className={`flex w-full flex-col items-center gap-1 rounded-2xl border-[3px] px-1 py-1.5 transition ${
                  active
                    ? 'border-grion-400 bg-grion-50 text-grion-700'
                    : 'border-transparent text-gray-500 active:bg-gray-100'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <img
                  src={img}
                  alt={label}
                  className={`h-8 w-8 object-contain ${active ? 'animate-float' : 'opacity-85'}`}
                />
                <span className="font-display text-[0.95rem] leading-none">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

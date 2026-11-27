// PX(보급소) 상품 정의. 가격/설명은 여기서 수정하세요.
export const SHOP_ITEMS = [
  {
    id: 'hint',
    type: 'consumable',
    kind: 'hint',
    name: '작전 지도',
    desc: '퀴즈에서 힌트를 1회 볼 수 있어요.',
    price: 30,
    emoji: '🗺️',
  },
  {
    id: 'shield',
    type: 'consumable',
    kind: 'shield',
    name: '방탄조끼',
    desc: '오답 1회를 막아 줘요. (하트가 줄지 않아요)',
    price: 50,
    emoji: '🦺',
  },
  {
    id: 'title_word',
    type: 'title',
    name: '말씀의 용사',
    desc: '이름 옆에 붙는 칭호 배지',
    price: 100,
    emoji: '⚔️',
  },
  {
    id: 'title_supply',
    type: 'title',
    name: '은혜의 보급병',
    desc: '이름 옆에 붙는 칭호 배지',
    price: 120,
    emoji: '🎒',
  },
  {
    id: 'title_dawn',
    type: 'title',
    name: '새벽을 깨우는 교사',
    desc: '이름 옆에 붙는 칭호 배지',
    price: 150,
    emoji: '🌄',
  },
  {
    id: 'title_leader',
    type: 'title',
    name: '충진 리더',
    desc: '이름 옆에 붙는 칭호 배지',
    price: 200,
    emoji: '🚩',
  },
];

export const CONSUMABLES = SHOP_ITEMS.filter((i) => i.type === 'consumable');
export const TITLES = SHOP_ITEMS.filter((i) => i.type === 'title');

export function findItem(id) {
  return SHOP_ITEMS.find((i) => i.id === id);
}

export function titleLabel(titleId) {
  if (!titleId) return '';
  const t = TITLES.find((i) => i.id === titleId);
  return t ? `${t.emoji} ${t.name}` : '';
}

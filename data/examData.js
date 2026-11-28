export const EXAM_STAGES = [
  {
    id: 'stage1',
    title: '1단계 (계 1~2장)',
    subtitle: '계시록 장별 제목 및 빈칸 넣기',
    questions: [
      {
        id: 's1_q1',
        type: 'short',
        category: '계시록 장별 제목',
        prompt: '1. 계시록 1장 1~8절의 제목을 쓰시오. (7점)',
        answer: '계시록 전장의 요약과 결론',
      },
      {
        id: 's1_q2',
        type: 'short',
        category: '계시록 장별 제목',
        prompt: '2. 계시록 1장 9~20절의 제목을 쓰시오. (6점)',
        answer: '계시록 사건의 시작과 일곱 별과 일곱 금 촛대의 비밀',
      },
      {
        id: 's1_q3',
        type: 'short',
        category: '계시록 장별 제목',
        prompt: '3. 계시록 2장의 제목을 쓰시오. (6점)',
        answer: '일곱 교회 사자에게 보낸 편지',
      },
      {
        id: 's1_q4',
        type: 'blank',
        category: '빈칸 넣기 (소문항 당 3점)',
        prompt: '4. 계 1:4 요한은 아시아에 있는 ( ① )에 편지하노니 이제도 계시고 전에도 계시고 장차 오실 이와 ( ② )과',
        blanks: ['일곱 교회', '그 보좌 앞에 일곱 영'],
      },
    ],
  },
  {
    id: 'stage2',
    title: '2단계',
    subtitle: '천국 제사장 고사 2단계 모의고사 (PDF 업로드 대기 중)',
    questions: [],
  },
  {
    id: 'stage3',
    title: '3단계',
    subtitle: '천국 제사장 고사 3단계 모의고사 (PDF 업로드 대기 중)',
    questions: [],
  },
];

# 🪖 그리온 말씀 사관학교 (충진!)

교회 교사들이 교안과 성구를 **게임처럼** 암기하고 실전 문답을 연습하는 모바일 웹앱입니다.
Next.js(App Router) + Tailwind CSS + Lucide + Firebase Firestore, 배포는 Vercel.

---

## 1. 폴더 구조

```
grion-word-academy/
├─ app/
│  ├─ layout.js            # 폰트(Jua, Noto Sans KR) · 메타
│  ├─ page.js              # 진입점 (AppProvider + Shell)
│  └─ globals.css          # 3D 입체 버튼(.btn-3d) · 카드 스타일
├─ components/
│  ├─ Shell.jsx            # 로그인 여부/탭/퀴즈 화면 전환
│  ├─ Login.jsx            # [소속 반 / 닉네임 / PIN 4자리] 입소 화면
│  ├─ Header.jsx           # 타이틀 · 프로필 줄 · 설정(로그아웃)
│  ├─ BottomNav.jsx        # 훈련장 · 상황실 · PX · 마음의 편지
│  ├─ TrainingTab.jsx      # ① 훈련장: 스테이지 맵 (1·2·3교안, 자물쇠)
│  ├─ RankingTab.jsx       # ② 상황실: 개인 계급 / 반 대항전
│  ├─ ShopTab.jsx          # ③ PX: 작전 지도 · 방탄조끼 · 칭호
│  ├─ LettersTab.jsx       # ④ 마음의 편지: 익명 게시판 + 하트 + 댓글
│  ├─ Grion.jsx            # 계급별 캐릭터 이미지 + 애니메이션
│  ├─ ui.jsx               # 엠블럼 · 건빵 · 계급장 · 말풍선 · 시트 · 토스트
│  └─ quiz/
│     ├─ LessonRunner.jsx  # 3라운드 진행 · 하트/힌트/방탄조끼 · 저장
│     ├─ MatchRound.jsx    # 1라운드 성구-주제 짝짓기(연결선)
│     ├─ FillRound.jsx     # 2라운드 말씀 빈칸 조립
│     ├─ ScenarioRound.jsx # 3라운드 소크라테스식 문답(객관식+키워드 채점)
│     ├─ FeedbackBar.jsx   # "정답입니다! 충진!" 하단 바
│     └─ LessonComplete.jsx# 교안 마스터 · 진급 연출
├─ data/
│  ├─ questionsData.js     # ⭐ 교안/문제 데이터 (여기만 고치면 문제 추가)
│  └─ config.js            # 반 목록 · 하트 수 · 보상 건빵 등 설정
├─ lib/
│  ├─ firebase.js          # Firebase 초기화
│  ├─ db.js                # Firestore 읽기/쓰기 전부 (트랜잭션 포함)
│  ├─ AppContext.js        # 로그인 세션 · 실시간 동기화 · 전역 상태
│  ├─ ranks.js             # 계급 정의 · 진급 계산
│  ├─ shop.js              # PX 상품 정의
│  └─ grade.js             # 키워드 채점 · 빈칸 파싱 · 유틸
├─ public/images/          # grion_1.png ~ grion_5.png (훈련병 → 병장)
├─ firestore.rules         # Firestore 보안 규칙
├─ .env.local.example      # Firebase 키 자리
└─ tailwind.config.js      # 색상 · 애니메이션(둥둥/통통/흔들림…)
```

---

## 2. 로컬 실행

```bash
npm install
cp .env.local.example .env.local   # 3번 단계에서 값을 채웁니다
npm run dev                        # http://localhost:3000
```

Firebase 값이 비어 있으면 앱이 "보급품이 아직 도착하지 않았어요" 안내 화면을 보여 줍니다.

---

## 3. Firebase 설정 가이드

1. [Firebase 콘솔](https://console.firebase.google.com) → **프로젝트 추가** (Analytics는 꺼도 됩니다)
2. **빌드 → Firestore Database → 데이터베이스 만들기**
   - 위치: `asia-northeast3 (서울)` 권장 / 모드: **프로덕션 모드**로 시작
3. **프로젝트 설정(톱니) → 일반 → 내 앱 → `</>` (웹 앱 추가)**
   - 앱 등록 후 나오는 `firebaseConfig` 값을 `.env.local`에 옮깁니다.
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
4. **Firestore → 규칙** 탭에 이 프로젝트의 `firestore.rules` 내용을 붙여 넣고 **게시**
5. 서버를 다시 시작(`npm run dev`)하면 연결됩니다.

> 별도 인덱스 생성은 필요 없습니다. (컬렉션 `users`, `pins`, `letters`는 첫 입소/첫 편지 때 자동 생성)

### 저장되는 데이터

| 컬렉션 | 내용 |
|---|---|
| `users/{반~닉네임}` | 반, 닉네임, 교안별 진도(`progress`), 마스터 수(`clearedCount`), 건빵(`biscuits`), 아이템, 칭호 |
| `pins/{반~닉네임}` | PIN의 SHA-256 해시 (목록 조회 불가) |
| `letters/{id}` | 익명 편지, 하트 수, 공감한 기기 ID(익명), `comments` 하위 컬렉션 |

---

## 4. Vercel 배포

1. GitHub에 프로젝트 push → [Vercel](https://vercel.com) → **Add New Project** → 저장소 선택
2. **Environment Variables**에 `.env.local`의 6개 값을 같은 이름으로 등록
3. **Deploy**. 이후 push 할 때마다 자동 배포됩니다.
4. (선택) Firebase 콘솔 → Authentication → 설정 → 승인된 도메인은 이 앱이 Auth를 쓰지 않아 필요 없습니다.

---

## 5. 퀴즈 문제 추가하기 (`data/questionsData.js`)

`LESSONS` 배열에 교안 객체를 추가하면 **스테이지 맵에 자동으로 N교안이 생기고** 앞 교안을 마스터해야 열립니다.

```js
{
  id: 'lesson-4',            // 겹치지 않게 (진도 저장 키 — 운영 중에는 바꾸지 마세요)
  title: '4교안',
  subtitle: '교안 주제',
  rounds: {
    match:    [ /* 성구↔주제 3~5쌍 */ ],
    fill:     [ /* 빈칸 문항: [정답]으로 표시 */ ],
    scenario: [ /* mcq(객관식) / short(키워드 채점) */ ],
  },
}
```

파일 맨 위 주석에 각 문항 형식이 모두 적혀 있습니다.

### PDF 교안 → 문제 데이터로 바꾸기 (Claude에게 시킬 때 쓰는 프롬프트)

> 첨부한 PDF 교안을 읽고, 아래 형식(`questionsData.js`의 LESSONS 항목)으로 **1개 교안**을 만들어 줘.
> - match 4쌍(성구-핵심주제, 주제는 서로 다르게), fill 3문항(`[정답]` 표기 + distractors 2~3개), scenario 3문항(mcq 2 + short 1)
> - scenario는 교사가 현장에서 겪을 상황으로, 해설은 "~일까요?"처럼 되묻는 소크라테스식 문장으로
> - short의 keywordGroups는 핵심 개념 3개(각 개념마다 동의어 2~3개), minMatch는 2
> - 강압적/비하 표현 없이, 격려하는 톤으로
> - 성경 구절은 교안에 인용된 본문 그대로 사용

### 계급 규칙

- 마스터한 교안 수에 따라 자동 진급: 훈련병 → 이등병 → 일병 → 상병 → **병장(전 교안 마스터)**
- 샘플처럼 교안이 3개면 `1교안=이등병, 2교안=일병, 3교안=병장`이고, 교안이 늘어나면 단계가 균등하게 배분됩니다. (`lib/ranks.js`의 `rankIndexFor`)
- 건빵 보상은 **처음 푸는 라운드에서만** 지급됩니다. (복습은 보상 없음 → 포인트 파밍 방지)

---

## 6. 알아두면 좋은 점 (보안·운영)

- **PIN은 가벼운 본인 확인용**입니다. 로그인(Firebase Auth) 없이 쓰는 소규모 교회용 구성이라, 규칙상 누구나 `users`를 읽을 수 있고(랭킹용) 클라이언트가 점수를 계산해 저장합니다. 마음먹고 조작하려는 사람까지 막지는 못해요.
- 더 강하게 하려면: ① Firebase **Anonymous Auth**를 켜서 `request.auth != null`을 규칙에 추가, ② 진도/포인트 저장을 **Cloud Functions**로 옮기기.
- **마음의 편지**는 작성자 정보를 저장하지 않습니다(하트 중복 방지용 무작위 기기 ID만 저장). 부적절한 글은 Firebase 콘솔 → `letters`에서 관리자가 삭제하세요. (규칙상 앱에서는 삭제 불가)
- 로그인 PIN 해시는 `https` 또는 `localhost`에서 SHA-256으로, 그 외 환경(사설 IP http)에서는 간이 해시로 계산됩니다. 기기를 바꿔 접속할 때도 같은 환경 유형이면 문제없습니다. 배포(https) 환경에서만 쓰는 것을 권장합니다.
- 성경 본문은 사용하는 번역본의 저작권/인용 허용 범위를 확인해 주세요.

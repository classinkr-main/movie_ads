# 시네마틱 커머셜 (20초) — 어제 · 오늘 · 내일의 수업

수업의 세 시대를 한 편에 담은 브랜드 커머셜입니다. 시대마다 화면비·색·질감·서체·소리가 달라집니다.

| 시대 | 스타일 | 한 줄 |
| --- | --- | --- |
| **어제** — 분필과 칠판 | 옛 필름: 4:3 게이트 · 세피아 · 스크래치/먼지/깜박임 · 2프레임씩 끊기는 움직임 · 명조 자막 · 영사기 소리 | "어제의 수업은, 지워지면 사라졌습니다." |
| **오늘** — Classin Board | 임팩트와 함께 2.39:1 컬러 와이드로 열림 · 다크 스테이지 + 민트 림라이트 · 실제 제품 프레임 | "오늘의 수업은, 남습니다." → 자동 녹화 · EDB 교안 |
| **내일** — AI | 보드 속으로 들어간 홀로그램 공간 · 3D 와이어프레임 · 주사선 · 모노 HUD 서체 | "내일의 수업은, AI가 돕습니다." → AI 강의 평가 |

엔드카드는 홈 H1 **"칠판은 지워져도, 수업은 남습니다."** 와 **"내일의 수업을, 오늘 Classin에서."** 로 닫습니다. 세 시대를 잇는 것은 같은 판서 하나(중3 수학 · `y = (x − 2)² + 1`)입니다 — 분필로 그려지고, 지워지고, 보드에서 되살아나고, 내일에는 회전 포물면 홀로그램의 단면이 됩니다.

## 스토리 (600f · 120 BPM — 한 마디 60f, 컷은 모두 마디 선)

| 구간 | 프레임 | 내용 |
| --- | --- | --- |
| 어제 | 0–120 | 무성영화식 타이틀 카드 "어제의 수업은," → 매크로: 분필이 식과 포물선을 그린다 → 자막 "지워지면, 사라졌습니다." → 지우개 세 번 |
| 오늘 · 리빌 | 120–240 | 임팩트. 4:3이 와이드로 열리고 풀백하며 Classin Board 등장, 지워진 판서가 스캔되며 되살아남. "오늘의 수업은, 남습니다." |
| 오늘 · 자동 녹화 | 240–300 | 카메라 뷰파인더 시점. REC 타임코드가 45:00에 멈추고 "클라우드에 자동 저장" |
| 오늘 · EDB 교안 | 300–360 | 판서가 페이지로 떠올라 `이차함수의 그래프.edb` 코스 파일이 된다 → 보드 속으로 줌 스루 |
| 내일 · 홀로그램 | 360–420 | 홀로그램 공간. 포물선이 회전 포물면이 되고 AI 스캔 링이 훑는다. "내일의 수업은, AI가 돕습니다." + AI 칠판 · AI 에이전트 · AI 강의 평가 |
| 내일 · AI 강의 평가 | 420–480 | 실제 리포트 화면을 홀로그램으로 띄우고 스캔 → 점수 83 · "4개 영역 · 11개 항목" |
| 엔드카드 | 480–600 | 임팩트. 레터박스가 열리고 로고 · 태그라인 · "내일의 수업을, 오늘 Classin에서." · "도입 문의 → classin.co.kr/contact" · 글로벌 수치(파인 프린트) |

화면 상단의 **어제 — 오늘 — 내일** 표시가 지금 어느 시대인지 알려 줍니다.

## 룩을 만드는 장치

- **렌즈·필름 레이어**(`fx.tsx`) — 아나모픽 플레어, 화면 전체 블룸(할레이션), 라이트 리크, 필름 그레인, 비네트, 임팩트 셰이크, 필러박스/레터박스.
- **옛 필름**(`FilmDamage` · `gateWeave`) — 세로 스크래치, 먼지·머리카락, 밝기 깜박임, 게이트 흔들림, 둥근 게이트.
- **카메라** — 어제는 얕은 심도의 매크로(백열등 스폿이 분필 끝을 따라감), 오늘은 CSS 3D 돌리 아웃과 방향성 모션 블러 휩 팬, 내일은 줌 스루와 궤도 카메라.
- **홀로그램**(`proj.ts` · `shots/Future.tsx`) — WebGL 없이 작은 3D 투영기로 포물면·바닥 그리드·입자를 SVG에 그립니다(프레임 결정론적, GPU 불필요).
- **실제 제품** — 보드 프레임(`board-frame.webp`)과 AI 강의 분석 리포트 화면(`ai-report.webp`)은 classinkr-web 공개 사이트 에셋입니다.

## 콘텐츠 출처와 검수 참고

- **카피** — 시대 3부작 문장("어제의 수업은, 지워지면 사라졌습니다 / 오늘의 수업은, 남습니다 / 내일의 수업은, AI가 돕습니다")은 이 영상을 위해 쓴 문장이고, 홈 H1 "칠판은 지워져도, 수업은 남습니다"(`lib/classin-positioning.ts`)를 풀어 쓴 것입니다. 기능 문장은 classinkr-web 라이브 카피를 따릅니다(`components/home/home-copy.ts` gains: "수업만 하면 녹화가 저절로 쌓입니다" / "수업이 끝나면 AI가 바로 평가합니다" / "누가 들어가도 같은 수업"). 
- **"내일"이라는 표현** — AI 강의 평가는 이미 제공 중인 기능입니다. 영상에서는 "수업의 다음 단계"라는 뜻으로 내일 구간에 두었고, 출시 예정 기능으로 읽히지 않도록 엔드카드를 "내일의 수업을, 오늘 Classin에서."로 닫았습니다. AI 칠판 · AI 에이전트 · AI 강의 평가 세 칩은 포지셔닝 가이드의 AI 영역 구분입니다.
- **수치** — 엔드카드 파인 프린트의 네 가지 글로벌 수치는 홈·About 페이지와 같은 값이며, 브랜드 캐논(`docs/active/brand-canon/company-facts.md`) 규칙대로 "EEO 공식 기준 · 전 세계 누적" 출처 문구를 함께 표기했습니다. 국내 도입 수치는 쓰지 않았습니다.
- **AI 강의 평가 화면** — 사이트의 `images/home/win-ai.webp`(종합 83점, 개인 정보 블러 처리본)의 분석 패널을 잘라 반전·단색화해 홀로그램처럼 띄웠고, 화면에 "실제 리포트 화면을 바탕으로 한 연출"이라고 표기했습니다. "4개 영역 · 11개 항목"은 포지셔닝 가이드의 AI 강의 분석 구성입니다.
- **연출용 요소** — 판서 내용, REC 타임코드(00:45:00), 저장 토스트, EDB 페이지 스택과 파일 이름, AI 카메라 PIP, 홀로그램 공간은 기능을 설명하기 위한 콘셉트 연출입니다. 실제 UI와 다를 수 있습니다.
- **로고** — 심볼은 원본 그린 그대로, 워드마크는 다크 배경용으로 흰색 처리했습니다(`shots/Finale.tsx`의 `filter: brightness(0) invert(1)` 한 줄을 지우면 원본 색으로 돌아갑니다).
- **CTA** — 사이트 헤더와 같은 "도입 문의" → `classin.co.kr/contact`.
- **서체**(모두 SIL OFL 1.1, 라이선스는 `public/fonts/LICENSE-*.txt`) — Pretendard(본문) · Gaegu Bold(판서) · Nanum Myeongjo ExtraBold(어제 자막·타이틀) · IBM Plex Mono(내일 HUD).

## 사운드트랙

`scripts/make-cinematic-score.mjs`가 샘플 없이 코드로 합성합니다(120 BPM, D단조 → 엔드카드에서 D장조). 어제 구간은 영사기 소리와 대역이 좁은 옛 사운드, f120 임팩트에서 풀레인지 스테레오로 열립니다. 분필·지우개 폴리, 두 번의 임팩트(f120 · f480), 컷마다 휩, 내일로 들어가는 푸시 스루, 마디 8의 라이저가 영상 타이밍과 프레임 단위로 맞물려 있습니다.

```bash
npm run score:cinematic      # wav 합성 → public/audio/cinematic-score.m4a
```

통합 음량 약 −15 LUFS · 트루 피크 약 −1.9 dBTP(m4a 기준)로 마스터링되어 있습니다. 어제 구간은 일부러 작게(피크 −12.5 dBFS) 두어 f120 임팩트와 대비를 만듭니다 — 더 키우거나 줄이려면 스크립트의 `INTRO_PEAK` 한 줄만 바꾸면 됩니다. 영상 타이밍(`src/cinematic/theme.ts`의 `T`)을 바꾸면 스크립트의 큐 프레임도 함께 바꿔야 합니다. 다른 음악을 얹을 때는 무음 마스터(`out/classin-cinematic-20s-silent.mp4`, 또는 `npm run render:cinematic:silent`)를 쓰세요. 커밋된 사운드 포함본은 무음 마스터에 m4a를 재인코딩 없이 합친 것입니다(`ffmpeg -i silent.mp4 -i cinematic-score.m4a -c copy`).

## 구조

```
src/cinematic/
  Cinematic.tsx        # 타임라인 · 샷 래퍼(휩 팬/줌 스루) · 화면비 · 시대 표시 · 렌즈/필름 레이어 · 오디오
  theme.ts             # 팔레트 · 타이밍(T) · 레터박스/필러박스 · 보드 프레임 좌표
  fonts.ts             # 시대별 서체 로드
  fx.tsx               # Flare · Bloom · Letterbox · Pillarbox · FilmGrain · FilmDamage · LightLeak · Flash · Dust · WhipBlur · Stage · shake · gateWeave
  type.tsx             # Tracked · LineUp · FadeIn · SweepText · Hairline · Roll
  proj.ts              # 3D 투영(camera · path3)
  Chalk.tsx            # 판서(Lesson) · 칠판 면(Slate) · 판서 진행(lessonAt) · 분필 끝 위치(tipAt)
  Board.tsx            # 실제 프레임 이미지 위에 화면을 얹는 Classin Board 프롭
  shots/Open.tsx       # 어제 — 타이틀 카드 · 매크로 판서 · 지우개(경로 마스크) · 분필 가루
  shots/Reveal.tsx     # 오늘 — 3D 풀백 · 되살아나는 판서 · 헤드라인
  shots/Proofs.tsx     # 오늘 — 자동 녹화 · EDB 교안
  shots/Future.tsx     # 내일 — 홀로그램 공간(HoloSpace) · AI 강의 평가
  shots/Finale.tsx     # 엔드카드(지평선 무대)
scripts/make-cinematic-score.mjs   # 사운드트랙 합성
scripts/cinematic-stills.mjs       # 스틸 추출(번들 1회) — node scripts/cinematic-stills.mjs 60,150,540 0.5
public/cinematic/                  # board-frame · ai-report (classinkr-web 에셋)
public/audio/cinematic-score.m4a   # 합성 사운드트랙
```

## 실행

```bash
npm install
npm run dev                      # Remotion Studio → Cinematic
npm run render:cinematic         # out/classin-cinematic-20s.mp4 (사운드 포함)
npm run render:cinematic:silent  # out/classin-cinematic-20s-silent.mp4
npm run typecheck
```

## 수정 가이드

- **카피** — 어제 `shots/Open.tsx`(타이틀 카드 · 자막), 오늘 `shots/Reveal.tsx` · `shots/Proofs.tsx`의 `ProofText` props, 내일 `shots/Future.tsx`, 엔드카드 `shots/Finale.tsx`(`STATS` · 태그라인 · CTA).
- **판서 내용** — `Chalk.tsx`의 좌표·문자열(식, 단원 제목, 정리 3줄)과 `lessonAt`(그려지는 순서). 홀로그램 포물면은 `shots/Future.tsx`의 `A` · `RMAX`.
- **타이밍** — `theme.ts`의 `T`. 샷 길이를 바꾸면 사운드트랙 큐도 맞춥니다.
- **시대별 룩 강도** — 어제: `Open.tsx`의 세피아 `filter`와 `FilmDamage strength`, on-twos(`Math.floor(frame / 2) * 2`). 공통: `Cinematic.tsx`의 `bloom` · `grain` · `Vignette strength` · `HITS`(셰이크).


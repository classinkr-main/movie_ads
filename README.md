# Classin 영상 광고 (Remotion)

| 영상 | 규격 | 컴포지션 id | 결과물 |
| --- | --- | --- | --- |
| **시네마틱 커머셜 "칠판은 지워져도, 수업은 남습니다"** | 1920×1080 · 30fps · 20s · 2.39:1 레터박스 · 사운드트랙 포함 | `Cinematic` | `out/classin-cinematic-20s.mp4` |
| Classin AI 기능 쇼릴 v4 | 1920×1080 · 30fps · 30s · 무음 | `Showreel` | `out/classin-ai-showreel.mp4` |

두 영상은 같은 워크스페이스에서 따로 렌더됩니다. 아래는 시네마틱 커머셜, 그 다음이 v4 쇼릴 문서입니다.

---

# 시네마틱 커머셜 (20초)

**"칠판은 지워져도, 수업은 남습니다."** — classinkr-web 홈 H1을 그대로 한 편의 장면으로 옮긴 브랜드 커머셜입니다.
어둠 속에서 분필이 식과 포물선을 그리고, 지우개가 훑고 지나간 뒤, 카메라가 빠지면 그 칠판이 Classin Board이고 지워진 판서가 빛으로 되살아납니다.
이어서 "남는 방식" 세 가지(자동 녹화 · AI 강의 평가 · EDB 교안)와 글로벌 수치, 로고·CTA로 끝납니다.

## 룩

- **다크 스테이지 + 민트 림라이트** — 포화 컬러는 Classin Green 계열 하나(`#0B7A52` · 다크 면 포인트 `#6EE7B7`)만 씁니다. 지우개 손잡이의 우드 톤이 유일한 보색 포인트입니다.
- **렌즈·필름 레이어** — 2.39:1 레터박스(엔드카드에서 열림), 아나모픽 플레어, 화면 전체 블룸(할레이션), 라이트 리크, 필름 그레인, 비네트, 임팩트 셰이크.
- **카메라** — 오프닝은 얕은 심도의 매크로(스폿 조명이 분필 끝을 따라감), 리빌은 CSS 3D 돌리 아웃, 샷 사이는 방향성 모션 블러가 걸린 휩 팬.
- **실제 제품** — 보드 프레임(`board-frame.webp`)과 AI 강의 분석 리포트 화면(`ai-report.webp`)은 classinkr-web 공개 사이트 에셋입니다. 판서(중3 수학 · 이차함수의 그래프)는 SVG로 직접 그린 예시 수업입니다.

## 스토리 (600f · 120 BPM — 한 마디 60f, 컷은 모두 마디 선)

| 구간 | 프레임 | 내용 |
| --- | --- | --- |
| S1 오프닝 | 0–120 | 매크로: 분필이 `y = (x − 2)² + 1` 과 포물선을 그린다 → 자막 "칠판은 지워져도," → 지우개 세 번 |
| S2 리빌 | 120–240 | 임팩트. 풀백하며 Classin Board 등장, 지워진 판서가 스캔되며 되살아남. 헤드라인 "수업은 남습니다." + "판서는 교안으로, 수업은 녹화로, 강의는 AI 평가로." |
| 01 자동 녹화 | 240–300 | 카메라 뷰파인더 시점. REC 타임코드가 45:00에 멈추고 "클라우드에 자동 저장" |
| 02 AI 강의 평가 | 300–360 | 실제 리포트 화면 위로 스캔 → 점수 83 · "4개 영역 · 11개 항목" |
| 03 EDB 교안 | 360–420 | 판서가 페이지로 떠올라 `이차함수의 그래프.edb` 코스 파일이 된다 |
| S4 스케일 | 420–480 | 160+ 서비스 국가 · 6만+ 교육기관 · 5,000만+ 교사·학습자 · 3,000만+ 월간 수업 (EEO 공식 기준 · 전 세계 누적) |
| S5 엔드카드 | 480–600 | 임팩트. 레터박스가 열리고 로고 · 태그라인 · "도입 문의 → classin.co.kr/contact" |

## 콘텐츠 출처와 검수 참고

- **카피** — 헤드라인·기능 문장은 classinkr-web 라이브 카피를 따릅니다(`lib/classin-positioning.ts` heroHeadline, `components/home/home-copy.ts` gains: "수업만 하면 녹화가 저절로 쌓입니다" / "수업이 끝나면 AI가 바로 평가합니다" / "누가 들어가도 같은 수업"). 엔드카드 보조 문구 "학원 전자칠판 · 수업 녹화 · AI 강의 평가"는 공유 카드(OG) 문구입니다.
- **수치** — 네 가지 글로벌 수치는 홈·About 페이지와 같은 값이며, 브랜드 캐논(`docs/active/brand-canon/company-facts.md`) 규칙대로 "EEO 공식 기준 · 전 세계 누적" 출처 문구를 함께 표기했습니다. 국내 도입 수치는 쓰지 않았습니다.
- **AI 강의 평가 화면** — 사이트의 `images/home/win-ai.webp`(종합 83점, 개인 정보 블러 처리본)를 그대로 썼고 화면에 "리포트 예시 화면"이라고 표기했습니다. "4개 영역 · 11개 항목"은 포지셔닝 가이드의 AI 강의 분석 구성입니다.
- **연출용 요소** — 판서 내용, REC 타임코드(00:45:00), 저장 토스트, EDB 페이지 스택과 파일 이름, AI 카메라 PIP는 기능을 설명하기 위한 콘셉트 연출입니다. 실제 UI와 다를 수 있습니다.
- **로고** — 심볼은 원본 그린 그대로, 워드마크는 다크 배경용으로 흰색 처리했습니다(`src/cinematic/shots/Finale.tsx`의 `filter: brightness(0) invert(1)` 한 줄을 지우면 원본 색으로 돌아갑니다).
- **CTA** — 사이트 헤더와 같은 "도입 문의" → `classin.co.kr/contact`.
- **서체** — Pretendard(본문) + Gaegu Bold(판서, SIL OFL 1.1 · `public/fonts/LICENSE-Gaegu.txt`).

## 사운드트랙

`scripts/make-cinematic-score.mjs`가 샘플 없이 코드로 합성합니다(120 BPM, D단조 → 엔드카드에서 D장조). 분필·지우개 폴리, 두 번의 임팩트(f120 · f480), 컷마다 휩 사운드, 마디 8의 라이저가 영상 타이밍과 프레임 단위로 맞물려 있습니다.

```bash
npm run score:cinematic      # wav 합성 → public/audio/cinematic-score.m4a
```

영상 타이밍(`src/cinematic/theme.ts`의 `T`)을 바꾸면 스크립트의 큐 프레임도 함께 바꿔야 합니다. 다른 음악을 얹으려면 `npm run render:cinematic:silent`로 무음본을 뽑으세요.

## 구조

```
src/cinematic/
  Cinematic.tsx        # 타임라인 · 휩 팬 샷 래퍼 · 렌즈/필름 레이어 · 오디오
  theme.ts             # 팔레트 · 타이밍(T) · 레터박스 · 보드 프레임 좌표
  fx.tsx               # Flare · Bloom · Letterbox · FilmGrain · LightLeak · Flash · Dust · WhipBlur · Stage · shake
  type.tsx             # Tracked · LineUp · FadeIn · SweepText · Hairline · Roll
  Chalk.tsx            # 판서(Lesson) · 칠판 면(Slate) · 판서 진행(lessonAt) · 분필 끝 위치(tipAt)
  Board.tsx            # 실제 프레임 이미지 위에 화면을 얹는 Classin Board 프롭
  shots/Open.tsx       # S1 매크로 판서 + 지우개(경로 마스크) + 분필 가루
  shots/Reveal.tsx     # S2 3D 풀백 + 되살아나는 판서 + 헤드라인
  shots/Proofs.tsx     # 01 자동 녹화 · 02 AI 강의 평가 · 03 EDB 교안
  shots/Finale.tsx     # S4 스케일 · S5 엔드카드(지평선 무대 공유)
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

- **카피** — 헤드라인 `shots/Reveal.tsx`, 기능 문장 `shots/Proofs.tsx`의 `ProofText` props, 수치 `shots/Finale.tsx`의 `STATS`, 엔드카드 문구·CTA `shots/Finale.tsx`의 `End`.
- **판서 내용** — `Chalk.tsx`의 좌표·문자열(식, 단원 제목, 정리 3줄)과 `lessonAt`(그려지는 순서).
- **타이밍** — `theme.ts`의 `T`. 샷 길이를 바꾸면 사운드트랙 큐도 맞춥니다.
- **룩 강도** — `Cinematic.tsx`의 `Bloom amount`, `FilmGrain opacity`, `Vignette strength`, `HITS`(셰이크), `Letterbox`.

---

# Classin AI 커머셜 쇼릴 (30초, v4)

**"Classin AI로, 수업을 업그레이드."** — Classin의 AI 기능 다섯 가지를 에디토리얼 톤의 키네틱 모션그래픽으로 소개하고
**"지금 문의하기"** CTA로 끝나는 30초 가로(16:9) 커머셜 쇼릴입니다. v4부터 모든 기능 화면을 하나의 예시 수업(중2 국어)으로 채웠습니다. [Remotion](https://www.remotion.dev/) 4 기반이라
카피·수치·색·타이밍을 코드에서 바꾸고 다시 렌더할 수 있습니다.

| 산출물 | 규격 | 경로 |
| --- | --- | --- |
| 메인 (16:9) | 1920×1080 · 30fps · 30s · H.264 · yuv420p bt709 · 무음 | `out/classin-ai-showreel.mp4` |

> v1(20초 다크 톤 · 9:16 포함), v2(23초 AI 강의 분석 단독), v3(25초 5개 기능 · 스켈레톤 UI)는 git 히스토리에 남아 있습니다.

## 예시 수업 (v4)

모든 기능 화면은 같은 수업 하나를 따라갑니다. 상단 중앙의 "예시 수업" 라벨이 기능 씬 내내 표시됩니다.

- **수업**: 중2 국어 A반 · 3단원 비유와 상징 · 윤동주 「서시」 · 45분 · 이서윤 선생님(가상)
- **학생**: 김지민, 박도윤(가상) · 다국어 자막 장면에서는 Alex · Lin · Yui · Thu(가상)
- **수업 흐름**: 도입 8분 → 전개 28분 → 정리 9분, '하늘·바람·별'의 상징 해석, 과제 "상징이 쓰인 시 1편 찾아오기"
- 「서시」 시구 인용은 공유 저작물(윤동주, 1945년 작고) 범위이며, 은유법 예문은 직접 만든 문장입니다.

## 디자인 톤 (v3)

- **베이스**: 화이트·아이보리(`#FFFFFF` / `#FAF8F2` / `#F3EFE4`), 헤어라인 그리드, 느린 카메라 드리프트
- **포인트**: 연두 그린(`#C8F05A` 형광펜·칩·스티커·전환 띠, `#8BC926` 선·아이콘·거대 아웃라인 인덱스, `#3C6B12` 소문자)
- **강조 텍스트·CTA 채움**: Classin Green `#084734`
- **에디토리얼 장치**: 좌측 챕터 레일(01–05), 상단 "Classin AI · 01 — 05" 라벨, 기능별 거대 아웃라인 번호 워터마크, 유리 카드 UI 목업

## 스토리 (7씬 · 900f)

| # | 글로벌 프레임 | 길이 | 화면 속 예시 내용 |
| --- | --- | --- | --- |
| S1 오프닝 | 0–110 | 3.7s | "Classin AI로, 수업을 업그레이드." + 5개 기능 목차 |
| 01 AI 강의 평가 | 90–240 | 5.0s | 45분 파형 스캔, 발문 14회 위치(개방형 6), 도입·전개·정리 구간, 종합 88 · 4개 영역 점수와 11개 항목, 발화 비율(교사 62 · 학생 38), 강점(12:40 생활 예시로 상징 설명) · 개선 포인트(발문 9회가 앞줄에 집중) |
| 02 AI 스크립트 · 강의 요약 | 222–372 | 5.0s | 화자 구분 스크립트 6줄(교사·김지민·박도윤, 타임스탬프), 핵심 문장 하이라이트, 요약 패널(핵심 개념 · 「서시」 속 상징 3개 · 과제) |
| 03 AI 숙제 출제 · 채점 | 354–514 | 5.3s | 출제 조건(범위·근거·객관식 3/서술형 2·난이도), 5문항 생성 → 김지민 답안 채점(✓/△), Q3 서술형 AI 피드백, 90점 · 제출 24/28 · 반 평균 82 · 오답 많은 문항 |
| 04 AI 자동 번역 · 실시간 자막 | 496–646 | 5.0s | LIVE 교실 화면, 칠판 판서(서시 — 하늘·바람·별), 교사 발화 자막 → English · 中文 · 日本語 · Tiếng Việt 순환, 해당 언어 학생 타일 하이라이트 |
| 05 AI 에이전트 | 628–812 | 6.1s | 비서 설정(이름·역할·말투·근거 자료·모델 3종), 학생 질문 탭(강의 21:05 근거 답변 · 다시보기 · 교안 쪽수) → 교사 상담 탭(단원 성취도 72→78→90, 강점·보완점·참여, 제출률 92%, 학부모 상담 초안) |
| S7 CTA | 788–900 | 3.7s | 헤드라인 + 5개 기능 칩 + 지금 문의하기 + classin.co.kr/contact |

전환: 연두 스윕(오프닝→01) → 패럴랙스 푸시 ×4(기능 사이) → 연두 아이리스(05→CTA). 챕터 레일 · 상단 라벨 · 예시 수업 라벨은 기능 씬 동안 고정됩니다.

## 콘텐츠 출처와 검수 참고

- 기능 구성(강의 평가 / 스크립트·요약 / 숙제 출제·채점 / 자동 번역·실시간 자막 / AI 에이전트)은 마케팅 측 지시 목록을 따릅니다.
  AI 강의 평가의 4개 영역 11개 항목·리포트 위치는 Notion "AI 강의 분석 기능 소개 (2026.04.23)" 원문입니다.
- **AI 강의 평가는 Notion 기준 현재 중국어 수업·실시간 수업에만 제공**됩니다. 영상은 언어를 단정하지 않습니다.
- 모든 기능 카드는 **콘셉트 목업**입니다. 예시 수업의 문장·답안·피드백·번역문은 연출용으로 작성했고, 지원 언어(English·中文·日本語·Tiếng Việt),
  에이전트의 모델 선택(기본·경량·고급), 서술형 채점 범위는 실제 지원 범위에 맞춰 조정이 필요합니다.
- 점수(종합 88, 영역 92/88/81/90, 형성평가 90점, 반 평균 82, 단원 성취도 72/78/90)와 발문 14회, 발화 비율, 제출 24/28, 제출률 92%는 모두 예시 수치입니다.
- CTA URL은 사이트 정본 도메인 `classin.co.kr/contact`.

## 프로젝트 구조

```
src/
  Root.tsx                  # Showreel(16:9) 컴포지션
  Showreel.tsx              # TransitionSeries 타임라인 + 커스텀 전환(연두 스윕·패럴랙스 푸시·연두 아이리스) + 챕터 레일 오버레이
  scenes/Opening · F01Eval · F02Script · F03Homework · F04Subtitle · F05Agent · Cta
  components/Feature.tsx    # FEATURES 목록 · FeatureLayout(텍스트 컬럼 + 카드 컬럼) · ChapterRail · UiCard · CardHeader · Stamp
  components/Flourish.tsx   # Highlighter · Chars · RollingNumber · Burst · Dots · GlassCard · GhostWord · TypeText · ClipReveal · SkeletonLine
  components/Kinetic.tsx    # WordPop · MaskText · CountUp · DrawLine
  components/Ui.tsx         # Eyebrow · Chip · Sticker · Pop · Rise · 로고
  components/Backgrounds.tsx# IvoryStage · LimeStage · PanelWipe · Grain
  lib/theme.ts              # 팔레트 · FPS · 길이(900f)
  lib/motion.ts             # 스프링 프리셋 · 이징
  lib/fonts.ts              # Pretendard 6굵기 로드
public/fonts/               # Pretendard (SIL OFL 1.1)
public/brand/               # Classin 마크·워드마크·스택 로고
```

## 실행

```bash
npm install
npm run dev        # Remotion Studio — 씬·전환을 타임라인에서 확인
npm run render     # out/classin-ai-showreel.mp4
npm run typecheck
```

Chrome Headless Shell이 없으면 Remotion이 자동으로 내려받습니다. 설치된 브라우저를 쓰려면 `REMOTION_BROWSER_EXECUTABLE`을 지정합니다.

## 수정 가이드

- **기능 목록·순서** — `src/components/Feature.tsx`의 `FEATURES`(목차·레일·CTA 칩이 함께 바뀜) + `src/Showreel.tsx`의 씬 순서.
- **카피** — 각 기능 씬의 `title`/`sub`/`bullets` props와 카드 안 문자열.
- **예시 수업 바꾸기** — 각 기능 씬 상단 상수(`AREAS`·`LINES`·`QS`·`LANGS`·`UNITS` 등)와 `src/Showreel.tsx`의 예시 수업 라벨 문자열.
- **타이밍** — `src/Showreel.tsx`의 `TIMELINE`(씬 길이, 전환 겹침 포함)과 `TRANSITIONS`. 합계 − 전환 합계 = 900.
- **색** — `src/lib/theme.ts`.
- **BGM/SFX** — `Showreel.tsx`에 `<Audio src={staticFile("audio/bgm.mp3")} />` 추가. 전환 시작 프레임은 `starts` 배열 참고.

## 참고한 라이브러리

- **Remotion 4.0.533** — 프레임 결정론적 React 렌더, `spring`/`interpolate`, `@remotion/fonts`, `@remotion/transitions`(TransitionSeries + 커스텀 프레젠테이션).
- **HyperFrames**(`hyperframes` npm, HeyGen) — HTML/GSAP 타임라인 기반 영상 합성 CLI. 검토했으나 한글 폰트 번들과 스프링 물리 기반 키네틱 타이포에 Remotion이 더 직접적이라 엔진으로 채택하지 않았습니다.

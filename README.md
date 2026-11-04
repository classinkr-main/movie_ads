# Classin 커머셜 영상 (Remotion)

이 저장소에는 두 편의 영상이 들어 있습니다. 둘 다 [Remotion](https://www.remotion.dev/) 4 기반이라 카피·수치·색·타이밍을 코드에서 바꾸고 다시 렌더할 수 있습니다.

| 영상 | 컴포지션 | 규격 | 경로 |
| --- | --- | --- | --- |
| **Classin Board 하드웨어 광고** (45초) | `Hardware` | 1920×1080 · 30fps · H.264 · yuv420p bt709 · 무음 | `out/classin-board-hardware.mp4` |
| Classin AI 커머셜 쇼릴 (30초, v4) | `Showreel` | 1920×1080 · 30fps · H.264 · yuv420p bt709 · 무음 | `out/classin-ai-showreel.mp4` |

```bash
npm install
npm run dev          # Remotion Studio — 두 컴포지션 모두 타임라인에서 확인
npm run render:hw    # out/classin-board-hardware.mp4
npm run render       # out/classin-ai-showreel.mp4
npm run typecheck
```

Chrome Headless Shell이 없으면 Remotion이 자동으로 내려받습니다. 설치된 브라우저를 쓰려면 `REMOTION_BROWSER_EXECUTABLE`을 지정합니다.

---

# Classin Board 하드웨어 광고 (45초)

**"공간이 바뀌면, 공부가 바뀝니다."** — 전자칠판 하드웨어 자체를 시네마틱 톤으로 보여주는 45초 가로(16:9) 광고입니다.
다크 베이스에 제품 사진을 느리게 푸시인(켄 번즈)하고, 사진 속 화면 영역에는 실제 Classin UI를 투영 변환(homography)으로 끼워 넣었습니다.
다섯 챕터(디자인 · 디스플레이 · 퍼포먼스 · AI 트래킹 카메라 · 생태계)와 라인업·CTA 엔드카드로 구성됩니다.

## 디자인 톤

- **베이스**: 거의 검정(`#070908` / `#0D1110`), 라디얼 글로우, 필름 그레인, 비네팅. 오프닝과 CTA에서만 2.0:1 레터박스.
- **포인트**: 민트(`#6EE7B7`) 스펙 수치·레티클·연결선, 브랜드 그린(`#00A36C`) CTA 채움. AI 쇼릴의 아이보리·연두와는 의도적으로 다른 톤.
- **타이포**: Pretendard. 헤드라인은 600 굵기, 한 줄씩 아래에서 마스크로 올라옴. 챕터 태그 `01 — DESIGN` + 가는 민트 라인.
- **사진 처리**: 색 보정은 렌더 시 CSS `filter`(brightness · contrast · saturate)와 그라데이션 셰이드로 걸고, 원본은 크롭·리사이즈만 합니다(`scripts/prep-hw-assets.py`).

## 스토리 (7씬 · 1350f)

| # | 글로벌 프레임 | 길이 | 사진 | 화면 속 장치 |
| --- | --- | --- | --- | --- |
| S0 오프닝 | 0–150 | 5.0s | 다크 스튜디오 스탠드 보드 | 빛줄기 스윕과 함께 보드가 드러남. "공간이 바뀌면, 공부가 바뀝니다." |
| 01 디자인 | 132–372 | 8.0s | **목동 쇼룸 실물 촬영본**(두 대 벽걸이) | 오른쪽 보드로 푸시인, 화면이 스캔라인과 함께 켜지며 Classin 판서 UI 표시 → 베젤 매크로·측면·벽걸이 모서리 트립틱 |
| 02 디스플레이 | 354–584 | 7.7s | 벽걸이 보드(다크) | 화면에 형광등 반사 띠가 지나가다 **AG 코팅** 라벨과 함께 사라짐 → 지문 6개가 찍혔다가 **AF 마감** 라벨과 함께 왼쪽부터 닦임. 4K UHD · 178° · 90% 투과율 |
| 03 퍼포먼스 | 566–786 | 7.3s | OPS 칩 | 보드 프레임 속 데스크톱에 창 3개(Classin 수업 · 교안.pptx · 브라우저)가 또각또각 열림, 펜 선이 지연 없이 그려짐, i5 · 16GB · 256GB · 0.03s, 지연 비교 바 |
| 04 AI 트래킹 카메라 | 768–1008 | 8.0s | **쇼룸 실물 상단 카메라 모듈** → 교실 판서 사진 | 카메라 모듈로 푸시인 → 강사를 따라가는 트래킹 레티클 + REC 00:12:40 + 4K 뱃지 → "수업 종료 · 영상 자동 업로드" 진행 바 |
| 05 생태계 | 992–1202 | 7.0s | — | 보드 카드 → Classin Cloud 허브 → 노트북(교사)·태블릿(학생)·스마트폰(학부모)·관리자 대시보드로 연결선이 그려지고 펄스가 흐름. 표준화 · 언제 어디서나 · 한 곳에서 관리 |
| S6 CTA | 1184–1350 | 5.5s | 65/75/86/110 라인업 | 스택 로고 + "교실의 기준이 되는 보드" + S65–S110 칩 + 지금 문의하기 + classin.co.kr/contact |

전환: 시네 디졸브(앞 씬 살짝 확대·어두워짐, 뒤 씬 줌아웃) × 5, 카메라→생태계는 가로 모션 블러 위프. 상단 워드마크·챕터 카운터(`DESIGN | 01 / 05`)와 하단 진행선은 챕터 씬 동안 고정.

## 사진 출처

- `classinkr-web/public/images/product/hw/**` — 제품 페이지용 이미지(스튜디오 렌더·교실 연출 사진). `hero-stand` · `bezel-macro` · `side-profile` · `bezel-wall` · `display-wall` · `teacher-writing` · `ops-chip` · `lineup`.
- `classinkr-web/public/images/home/` — 화면 콘텐츠로 쓴 실제 UI 스크린샷(`ui-board-class` 개인칠판 수업 화면, `ui-earth` 홈 히어로).
- **Google Drive `0. 사진창고 / 제품 사진, 전자칠판`** (2026-11-03 촬영) — `showroom-wall.jpg`(두 대 벽걸이, 4:3→16:9 크롭), `real-camera-bezel.jpg`(상단 카메라 모듈 크롭). 화면 네 꼭짓점 좌표는 스크립트가 검출해 `H1Design.tsx`에 상수로 들어 있습니다.
- 다시 만들려면: `python3 scripts/prep-hw-assets.py --web ../classinkr-web/public/images --drive <실물 사진 폴더>`

## 카피·수치 검수 참고

- 스펙은 `classinkr-web/lib/hardware/board-specs.ts`(규격서 정본)와 `/product/hw` 페이지 카피를 따랐습니다: AG/AF 강화유리, 4K(3840×2160), 178° 시야각, 90% 투과율·풀 라미네이션, i5 OPS 표준 탑재 · 16GB RAM · 256GB SSD, 0.03s 터치 응답(30ms, 일반 전자칠판 80–120ms), 4K AI 트래킹 카메라(자동 추적·줌·녹화), 라인업 S65·S75·S86·S110.
- "8mm 슬림 베젤 · 매트 화이트 마감"은 제품 페이지 카피 기준입니다. 두께·무게 같은 모델별 수치는 영상에 넣지 않았습니다.
- 퍼포먼스 씬의 데스크톱(창 제목·학생 이름·교안 제목)과 트래킹 씬의 REC 타이머, 업로드 진행 바는 **연출용 목업**입니다.
- "30일 만족 보장 · 설치와 교사 온보딩 포함"은 `/product/hw` ValueAnchor 섹션 문구입니다. 정책이 바뀌면 `H6Cta.tsx`를 고칩니다.
- CTA URL은 사이트 정본 도메인 `classin.co.kr/contact`.

## 수정 가이드 (하드웨어)

- **씬 길이·전환** — `src/Hardware.tsx`의 `HW_TIMELINE` / `HW_TRANSITIONS`. 합계 − 전환 합계 = 1350 이 아니면 빌드 시 에러.
- **카피** — 각 `src/scenes/hw/H*.tsx` 의 `Lines` / `Fade` 안 문자열, 스펙은 `Spec` 컴포넌트의 `value`/`label`.
- **사진 교체** — `public/hw/` 에 같은 이름으로 넣거나 `Plate` 의 `src`·`w`·`h` 를 바꿉니다. 화면 합성이 있는 씬은 `Screen` 의 `quad`(이미지 픽셀 좌표 네 꼭짓점)도 함께 맞춥니다.
- **색** — `src/lib/hwTheme.ts`.
- **BGM/SFX** — `Hardware.tsx` 에 `<Audio src={staticFile("audio/bgm.mp3")} />` 추가.

## 프로젝트 구조 (하드웨어)

```
src/
  Hardware.tsx              # Hardware(16:9) 타임라인 + 시네 디졸브·위프 전환 + 워드마크·챕터 카운터·진행선·레터박스
  scenes/hw/H0Opening · H1Design · H2Display · H3Performance · H4Camera · H5Ecosystem · H6Cta
  components/Cine.tsx       # Lines · Fade · ChapterTag · Spec · DarkStage · Plate(켄 번즈 플레이트) · Screen(투영 합성) · Shade · Vignette · Letterbox · LightSweep · FilmGrain · Reticle · Fingerprint
  lib/hwTheme.ts            # 다크 팔레트 · 길이(1350f) · 챕터 목록
  lib/homography.ts         # 사각형 → 사변형 matrix3d
scripts/prep-hw-assets.py   # 제품 사진 크롭·리사이즈, 쇼룸 사진 화면 꼭짓점 검출
public/hw/                  # 영상이 참조하는 사진
```

---

# Classin AI 커머셜 쇼릴 (30초, v4)

**"Classin AI로, 수업을 업그레이드."** — Classin의 AI 기능 다섯 가지를 에디토리얼 톤의 키네틱 모션그래픽으로 소개하고
**"지금 문의하기"** CTA로 끝나는 30초 가로(16:9) 커머셜 쇼릴입니다. v4부터 모든 기능 화면을 하나의 예시 수업(중2 국어)으로 채웠습니다.

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

## 프로젝트 구조 (AI 쇼릴)

```
src/
  Root.tsx                  # Showreel · Hardware 컴포지션 등록
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

## 수정 가이드 (AI 쇼릴)

- **기능 목록·순서** — `src/components/Feature.tsx`의 `FEATURES`(목차·레일·CTA 칩이 함께 바뀜) + `src/Showreel.tsx`의 씬 순서.
- **카피** — 각 기능 씬의 `title`/`sub`/`bullets` props와 카드 안 문자열.
- **예시 수업 바꾸기** — 각 기능 씬 상단 상수(`AREAS`·`LINES`·`QS`·`LANGS`·`UNITS` 등)와 `src/Showreel.tsx`의 예시 수업 라벨 문자열.
- **타이밍** — `src/Showreel.tsx`의 `TIMELINE`(씬 길이, 전환 겹침 포함)과 `TRANSITIONS`. 합계 − 전환 합계 = 900.
- **색** — `src/lib/theme.ts`.
- **BGM/SFX** — `Showreel.tsx`에 `<Audio src={staticFile("audio/bgm.mp3")} />` 추가. 전환 시작 프레임은 `starts` 배열 참고.

## 참고한 라이브러리

- **Remotion 4.0.533** — 프레임 결정론적 React 렌더, `spring`/`interpolate`, `@remotion/fonts`, `@remotion/transitions`(TransitionSeries + 커스텀 프레젠테이션).
- **HyperFrames**(`hyperframes` npm, HeyGen) — HTML/GSAP 타임라인 기반 영상 합성 CLI. 검토했으나 한글 폰트 번들과 스프링 물리 기반 키네틱 타이포에 Remotion이 더 직접적이라 엔진으로 채택하지 않았습니다.

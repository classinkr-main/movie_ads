# Classin AI 커머셜 쇼릴 (Remotion)

Classin AI 기능을 에디토리얼 톤의 키네틱 모션그래픽으로 소개하는 16:9 커머셜 영상 모음입니다. [Remotion](https://www.remotion.dev/) 4 기반이라
카피·수치·색·타이밍을 코드에서 바꾸고 다시 렌더할 수 있습니다. 두 편이 같은 디자인 시스템(`src/components`, `src/lib/theme.ts`)과 전환(`src/components/Transitions.tsx`)을 공유합니다.

| 편 | 컴포지션 ID | 규격 | 경로 |
| --- | --- | --- | --- |
| **AI 강의 평가 → 강사 관리** (22초, 신규) | `TeacherMgmt` | 1920×1080 · 30fps · 22s(660f) · H.264 · yuv420p bt709 · 무음 | `out/classin-ai-teacher-mgmt.mp4` |
| Classin AI 5개 기능 쇼릴 (30초, v4) | `Showreel` | 1920×1080 · 30fps · 30s(900f) · H.264 · yuv420p bt709 · 무음 | `out/classin-ai-showreel.mp4` |

---

## 1. AI 강의 평가 → 강사 관리 (22초 · `TeacherMgmt`)

**"AI로 강의 평가, 데이터로 강사 관리."** — 원장이 모든 수업을 참관할 수 없다는 문제에서 출발해, AI가 모든 수업을 같은 기준으로 평가하고
그 결과로 강사별 추이·면담 준비 노트까지 이어지는 흐름을 4씬으로 보여줍니다. "너무 빠르지 않게"라는 요청에 맞춰 씬당 1–2개 비트만 두고,
글자 스태거 2.2–2.4f, 레이아웃 스프링은 무오버슈트(`SMOOTH`), 각 씬 끝에 1–2.5초의 정지 호흡을 뒀습니다.

### 스토리 (4씬 · 660f)

| # | 글로벌 프레임 | 길이 | 화면 |
| --- | --- | --- | --- |
| S1 훅 | 0–150 | 5.0s | "지난주 우리 학원 수업, 몇 개나 보셨나요?" + 32개의 뿌연 교실 창 중 2개만 '참관'으로 켜짐 → "직접 본 수업 2회 · 보지 못한 수업 30회" |
| 01 AI 강의 평가 | 130–330 | 6.7s | "모든 수업을, AI가 같은 기준으로" — 12개 수업 녹화 타일 위로 스캐너가 내려가며 타일마다 4영역 미니 막대와 점수가 찍힘(AI 분석 중 n/12 → 분석 완료), 4개 영역 주간 평균 스트립 |
| 02 강사 관리 | 312–548 | 7.9s | "강사 관리는, 느낌 대신 근거로" — 강사 5명 표(수업 수 · 평균 점수 · 4주 스파크라인 · 변화 · 상태: 안정/성장 중/면담 추천) → '면담 추천' 행 선택 → 면담 준비 노트(강점 먼저 · 개선점 하나 · 근거 타임스탬프 · 1:1 면담 일정 잡기) |
| S4 CTA | 524–660 | 4.5s | "AI로 강의 평가, 데이터로 강사 관리." + 3개 칩 + "참관하지 않아도, 학원의 모든 수업이 보입니다." + 지금 문의하기 + classin.co.kr/contact |

전환: 연두 스윕(S1→01) → 패럴랙스 푸시(01→02) → 연두 아이리스(02→CTA). 01–02 동안 상단 "Classin AI · 강의 평가 · 강사 관리" 라벨, "01 — 02" 카운터,
우하단 "화면과 수치는 연출용 예시입니다" 고지가 고정됩니다.

### 카피 근거와 검수 참고

- 훅의 질문("지난주 우리 학원 수업 중 몇 개를 직접 보셨습니까?")과 "참관은 가끔, 나머지는 전언과 인상", "면담이 '느낌'에서 근거로 — 강점 먼저 · 근거는 수업 데이터 · 개선점은 하나",
  "감시가 아니라 성장"은 `classinkr-web/docs/active/presentation-ai-lecture-eval-v3-2026-10-27.md`(세미나 기획 v3)의 10·16·22장 문구를 옮긴 것입니다.
- "강사별 수업 품질을 같은 기준으로", "참관 없이"는 홈 카피(`components/home/home-copy.ts`)와 AI 리포트 제품 페이지의 '강사 관리' 블록을 따릅니다.
- 4개 영역(수업 전달 · 수업 분위기 · 수업 상호작용 · 언어 표현) · 11개 항목은 Showreel과 같은 Notion 원문 기준입니다.
- **강사 이름·과목·수업 수·점수·추이·면담 노트 문장은 모두 가상 예시**입니다. 화면에도 고지를 넣었습니다. '교사 개발' 화면의 강사별 추이·면담 노트·근거 타임스탬프 UI는 콘셉트 목업이라 실제 제품 범위에 맞춰 조정이 필요합니다.
- AI 강의 평가 제공 범위(언어·수업 형태)는 영상에서 단정하지 않습니다. CTA URL은 사이트 정본 도메인 `classin.co.kr/contact`.

### 파일

```
src/TeacherMgmt.tsx            # 타임라인(TM_TIMELINE · TM_TRANSITIONS) + 상단 라벨·예시 고지 오버레이
src/scenes/tm/TmLayout.tsx     # 텍스트 컬럼 + 카드 컬럼 레이아웃(느린 등장 간격), TM_STEPS
src/scenes/tm/Hook.tsx         # S1 — 교실 창 벽 + 질문
src/scenes/tm/EvalAll.tsx      # 01 — 녹화 타일 스캐너 + 점수
src/scenes/tm/Manage.tsx       # 02 — 강사 표 · 스파크라인 · 면담 준비 노트
src/scenes/tm/CtaTm.tsx        # S4 — CTA
scripts/preview-frames.mjs     # 번들 1회로 여러 프레임 스틸 렌더(검수용)
```

### 실행

```bash
npm run render:tm                                   # out/classin-ai-teacher-mgmt.mp4
node scripts/preview-frames.mjs TeacherMgmt 90,250,460,600   # out/preview-TeacherMgmt/f0090.png …
```

타이밍은 `src/TeacherMgmt.tsx`의 `TM_TIMELINE`(씬 길이, 전환 겹침 포함)과 `TM_TRANSITIONS`로 바꿉니다. 합계 − 전환 합계 = 660. 씬 안의 비트 시점은 각 씬 파일 상단 상수(`LIT_AT` · `SCAN_START/END` · `SELECT_AT` · `NOTE_AT`)입니다.

---

## 2. Classin AI 5개 기능 쇼릴 (30초 · v4 · `Showreel`)

**"Classin AI로, 수업을 업그레이드."** — Classin의 AI 기능 다섯 가지를 소개하고 **"지금 문의하기"** CTA로 끝나는 30초 쇼릴입니다. v4부터 모든 기능 화면을 하나의 예시 수업(중2 국어)으로 채웠습니다.

> v1(20초 다크 톤 · 9:16 포함), v2(23초 AI 강의 분석 단독), v3(25초 5개 기능 · 스켈레톤 UI)는 git 히스토리에 남아 있습니다.

### 예시 수업 (v4)

모든 기능 화면은 같은 수업 하나를 따라갑니다. 상단 중앙의 "예시 수업" 라벨이 기능 씬 내내 표시됩니다.

- **수업**: 중2 국어 A반 · 3단원 비유와 상징 · 윤동주 「서시」 · 45분 · 이서윤 선생님(가상)
- **학생**: 김지민, 박도윤(가상) · 다국어 자막 장면에서는 Alex · Lin · Yui · Thu(가상)
- **수업 흐름**: 도입 8분 → 전개 28분 → 정리 9분, '하늘·바람·별'의 상징 해석, 과제 "상징이 쓰인 시 1편 찾아오기"
- 「서시」 시구 인용은 공유 저작물(윤동주, 1945년 작고) 범위이며, 은유법 예문은 직접 만든 문장입니다.

### 디자인 톤 (v3)

- **베이스**: 화이트·아이보리(`#FFFFFF` / `#FAF8F2` / `#F3EFE4`), 헤어라인 그리드, 느린 카메라 드리프트
- **포인트**: 연두 그린(`#C8F05A` 형광펜·칩·스티커·전환 띠, `#8BC926` 선·아이콘·거대 아웃라인 인덱스, `#3C6B12` 소문자)
- **강조 텍스트·CTA 채움**: Classin Green `#084734`
- **에디토리얼 장치**: 좌측 챕터 레일(01–05), 상단 "Classin AI · 01 — 05" 라벨, 기능별 거대 아웃라인 번호 워터마크, 유리 카드 UI 목업

### 스토리 (7씬 · 900f)

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

### 콘텐츠 출처와 검수 참고

- 기능 구성(강의 평가 / 스크립트·요약 / 숙제 출제·채점 / 자동 번역·실시간 자막 / AI 에이전트)은 마케팅 측 지시 목록을 따릅니다.
  AI 강의 평가의 4개 영역 11개 항목·리포트 위치는 Notion "AI 강의 분석 기능 소개 (2026.04.23)" 원문입니다.
- **AI 강의 평가는 Notion 기준 현재 중국어 수업·실시간 수업에만 제공**됩니다. 영상은 언어를 단정하지 않습니다.
- 모든 기능 카드는 **콘셉트 목업**입니다. 예시 수업의 문장·답안·피드백·번역문은 연출용으로 작성했고, 지원 언어(English·中文·日本語·Tiếng Việt),
  에이전트의 모델 선택(기본·경량·고급), 서술형 채점 범위는 실제 지원 범위에 맞춰 조정이 필요합니다.
- 점수(종합 88, 영역 92/88/81/90, 형성평가 90점, 반 평균 82, 단원 성취도 72/78/90)와 발문 14회, 발화 비율, 제출 24/28, 제출률 92%는 모두 예시 수치입니다.
- CTA URL은 사이트 정본 도메인 `classin.co.kr/contact`.

### 프로젝트 구조

```
src/
  Root.tsx                  # Showreel · TeacherMgmt 컴포지션 등록
  Showreel.tsx              # TransitionSeries 타임라인 + 챕터 레일 오버레이
  TeacherMgmt.tsx           # 강사 관리 편 타임라인(위 1절)
  scenes/Opening · F01Eval · F02Script · F03Homework · F04Subtitle · F05Agent · Cta
  scenes/tm/                # 강사 관리 편 씬
  components/Transitions.tsx# 연두 스윕 · 패럴랙스 푸시 · 연두 아이리스 (두 편 공용)
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

### 실행

```bash
npm install
npm run dev        # Remotion Studio — 두 컴포지션을 타임라인에서 확인
npm run render     # out/classin-ai-showreel.mp4 (30초 쇼릴)
npm run render:tm  # out/classin-ai-teacher-mgmt.mp4 (22초 강사 관리 편)
npm run typecheck
```

Chrome Headless Shell이 없으면 Remotion이 자동으로 내려받습니다. 설치된 브라우저를 쓰려면 `REMOTION_BROWSER_EXECUTABLE`을 지정합니다(클라우드 세션: `/opt/pw-browsers/chromium`).

### 수정 가이드

- **기능 목록·순서** — `src/components/Feature.tsx`의 `FEATURES`(목차·레일·CTA 칩이 함께 바뀜) + `src/Showreel.tsx`의 씬 순서.
- **카피** — 각 기능 씬의 `title`/`sub`/`bullets` props와 카드 안 문자열.
- **예시 수업 바꾸기** — 각 기능 씬 상단 상수(`AREAS`·`LINES`·`QS`·`LANGS`·`UNITS` 등)와 `src/Showreel.tsx`의 예시 수업 라벨 문자열.
- **타이밍** — `src/Showreel.tsx`의 `TIMELINE`(씬 길이, 전환 겹침 포함)과 `TRANSITIONS`. 합계 − 전환 합계 = 900.
- **색** — `src/lib/theme.ts`.
- **BGM/SFX** — `Showreel.tsx`에 `<Audio src={staticFile("audio/bgm.mp3")} />` 추가. 전환 시작 프레임은 `starts` 배열 참고.

### 참고한 라이브러리

- **Remotion 4.0.533** — 프레임 결정론적 React 렌더, `spring`/`interpolate`, `@remotion/fonts`, `@remotion/transitions`(TransitionSeries + 커스텀 프레젠테이션).
- **HyperFrames**(`hyperframes` npm, HeyGen) — HTML/GSAP 타임라인 기반 영상 합성 CLI. 검토했으나 한글 폰트 번들과 스프링 물리 기반 키네틱 타이포에 Remotion이 더 직접적이라 엔진으로 채택하지 않았습니다.

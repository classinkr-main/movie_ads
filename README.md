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

---

# 2026 아시아 AI 교육 포럼(부산) 스케치 영상 — 7개 버전

2026년 5월 29일 부산 WP과사람에서 열린 **2026 Asia AI Education Forum in Busan** 촬영본(Google Drive `260529 부산 포럼(영상)`, 한국팀 DJI + 중국 본사 촬영본)과
전날 **5월 28일 부산 학원 탐방** 자료(`260528 학원 탐방`의 카메라 사진·핸드폰 영상)로 만든 현장 영상입니다.
A–C안은 **실황 톤**(현장음·실제 연설 음성 중심, 과한 그래픽 없음)에 **컷 대부분 4.8–8초**, D–F안은 탐방을 넣은 짧은 버전입니다.

| 버전 | 성격 | 규격 | 경로 |
| --- | --- | --- | --- |
| A안 · 실황편 | 사회자·축사·발표자의 실제 목소리(자막)와 현장음이 흐름을 이끈다. 01 교육기관 탐방 → 02 개막 → 03 축사 → 04 국가별 발표(한국·중국·일본) → 05 질의응답 → 06 함께. 음악은 오프닝·엔딩에만 낮게 | 1920×1080 · 30fps · 2:33 · H.264/AAC | `out/busan-forum-sketch-A-live.mp4` |
| B안 · 스케치 하이라이트 | 오리지널 음악 마디(2.4초)에 맞춘 4.8초 컷 16개 + 키 카피 3개. 연사 소개 없이 현장 분위기 중심. 마지막 단체 사진 환호는 살린다 | 1920×1080 · 30fps · 1:22 · H.264/AAC | `out/busan-forum-sketch-B-highlight.mp4` |
| C안 · 하이라이트편(연사) | 사회 → 축사 → 세션 01–06을 순서대로, 연사마다 3.6–7초 컷 1–2개와 한 줄 사운드바이트(한국어 자막)만. 세션 라벨·이름 자막은 공식 아젠다 표기. 몽타주 → 단체 사진 "茄子!" → 엔드 카드 | 1920×1080 · 30fps · 2:00 · H.264/AAC | `out/busan-forum-sketch-C-highlight-speakers.mp4` |
| D안 · 1분 스케치 | **DAY 1 학원 탐방(약 22초)** → DAY 2 WP과사람·포럼. 탐방은 카메라 사진(천천히 밀고 당기기)과 현장 영상, 연사는 한 컷(2.4초)씩 이름만, 객석 위에 사회자 한 줄 바이트, 단체 사진 구호로 마무리. 100 BPM 마디에 맞춘 2.4–4.8초 컷 | 1920×1080 · 30fps · 0:57.6 · H.264/AAC | `out/busan-forum-sketch-D-60s.mp4` |
| E안 · 스타일편 | D안 구성을 더 세련되게: 레터박스(섹션·날짜 표기, 진행 막대) · 그레인·비네트·색보정, 박자에 맞춰 들어오는 큰 타이포, DAY 01/02 외곽선 숫자, 세로 영상·사진 3분할, 연사 5인 라인업 분할, 플래시·펀치 줌. 120 BPM 하우스 그루브 | 1920×1080 · 30fps · 0:58 · H.264/AAC | `out/busan-forum-sketch-E-style.mp4` |
| G안 · 사람편 | 연사·강연 없이 **사람**만: 01 입장(행사장으로 들어서는 발걸음, 로비 사인, 등록 데스크, 입구 인사, 꽉 찬 홀) → 02 만남(복도·라이브러리 대화, 원로 인사, 간식 테이블, VIP 기념 촬영, 5.28 탐방 복도 대화) → 03 함께(사진 찍는 객석, 질문하는 참가자, 객석 전경) → 단체 사진 구호. 포럼 당일 카메라 사진 + 현장 영상, 100 BPM 2.4초 컷 | 1920×1080 · 30fps · 1:02 · H.264/AAC | `out/busan-forum-sketch-G-people.mp4` |
| F안 · 30초편 | E안 문법으로 탐방 5마디 · 포럼 4마디 · 단체 사진 드롭만 남긴 30초. 컷은 2초(1마디) 이상 | 1920×1080 · 30fps · 0:30 · H.264/AAC | `out/busan-forum-sketch-F-30s.mp4` |

## 공식 프로그램 (현장 아젠다 슬라이드 기준)

| 세션 | 시간 | 제목 | 연사 |
| --- | --- | --- | --- |
| 개회 | 13:15 | 개회사 · 축사 | 사회 김정무 클래스인 코리아 지사장 · 축사 설동근 전 교육부 차관 |
| 01 | 13:15–13:55 | AI 시대 교육기업의 경영전략 | 조규성 (Cho Kyu Seong) · WP과사람 교육기업 이사장 |
| 02 | 13:55–14:35 | 학생이 설명할 때, 배움이 완성된다 | 곽정율 (Kwak Jung Youl) · 정률사관학원 대표 |
| 03 | 14:35–15:15 | 기술은 어떻게 '전도·수업·해혹'을 재구성하는가 | 허첸 (He Qian) · 클래스인 CTO |
| 04 | 15:35–16:15 | 교육 + 운영의 더블 루프 전략 | 웅극중 (Xiong Kezhong) · 중국 선전 |
| 05 | 16:15–16:55 | 선도 교육기관의 실전 성장 전략 | 지우유 左佑 (Zuo You) · 항저우 A+ 심화교육 창립자 |
| 06 | 16:55–17:35 | 일본 사교육 시장의 현황과 다각화 발전 전략 | 안도 다이사쿠 (Ando Daisaku) · 일본 전국학원협회 회장 |

제목·이름·영문 표기는 개막 때 띄운 아젠다 슬라이드와 세션 01·05 표지 슬라이드에서 읽었습니다. 소속 중 03·04·06은 슬라이드 글자가 작아 공식 스크립트
(`부산 포럼 영상/2026 아시아 AI 교육포럼(부산) 스크립트`)로 보완했습니다. Drive의 섹션별 파일명 `조교성`은 슬라이드 표기 `조규성`과 달라 슬라이드를 따랐습니다.

## 사운드바이트

모두 현장 녹음이며, 자막은 음성 인식(Whisper large-v3-turbo)과 공식 스크립트를 대조해 들리는 말 그대로 다듬었습니다(말버릇·반복만 정리).
중국어·일본어 바이트는 한국어로 옮긴 자막입니다.

| 버전 · 위치 | 화자 | 자막 |
| --- | --- | --- |
| A 콜드 오픈 · C 개회 | 김정무 (사회) | 기술은 빠르게 변하고 있지만 / 학생들은 여전히 좋은 선생님을 기억합니다. / 교육은 결국, 사람이 사람을 성장시키는 일입니다. |
| A 01 교육기관 탐방 | WP과사람 발표자 (포럼 전 오전 소개 세션) | 그리고 클래스인 아카이브라는 곳에 가면 / 왼쪽은 학생 판서, 오른쪽은 선생님 판서 / 분할 화면으로 보이는 구조입니다. (화면 속 슬라이드와 동기) |
| A 02 개막 | 김정무 (사회) | 이번 포럼은 클래스인과 과사람 교육기업이 함께 준비했습니다. |
| A 03 · C 축사 | 설동근 전 교육부 차관 | AI는 인간이 더 인간다운 일에 집중하도록 돕는 기반이 될 수 있습니다. |
| A 04 · C 세션 02 | 곽정율 | 누구나 자신의 수업을 열어서 가르칠 수 있어야 합니다. |
| A 청중 컷 | 설동근 전 교육부 차관 | 교육의 본질은 사람을 키우는 일입니다. / 학생이 스스로 질문하게 하는 일입니다. / 다른 사람과 함께 생각하게 하는 일입니다. |
| C 세션 05 | 지우유 (중국어) | 피드백할 때도 어느 단계에서 문제가 생겼는지 보입니다. / 앞으로 AI가 들어와도 마찬가지입니다. |
| C 세션 06 | 안도 다이사쿠 (일본어) | 아이 수는 계속 줄고 있지만 / 1.2조 엔이라는 시장 규모는 변하지 않았습니다. (화면의 '1.2兆円' 슬라이드와 동기) |
| A 06 함께 | 설동근 전 교육부 차관 | 아시아 교육의 미래를 함께 여는 소중한 출발점이 되기를 기원합니다. / 감사합니다. |
| D 객석 컷 | 김정무 (사회) | 교육은 결국, 사람이 사람을 성장시키는 일입니다. |

단체 사진 컷은 촬영자의 "一、二、三 — 茄子!" 구호와 웃음을 그대로 살렸습니다.

## 검수 참고

- 이름 자막은 얼굴이 화면에 잡힌 컷에만 붙였습니다. **세션 04(웅극중)** 는 얼굴을 확인할 수 있는 컷이 없어 C안에서 질의응답 장면에 세션 라벨만 두었습니다.
  세션 03(허첸)은 현장 휴대폰 컷(3초 2개)이라 사운드바이트 없이 이름만 넣었습니다.
- 카메라별 시각을 아젠다와 맞춰 보니 A안 초기본에서 '국가별 발표 · 한국'으로 붙였던 WP과사람 발표(클래스인 아카이브 시연)는 **포럼 전 오전 교육기관 탐방 세션**이었습니다.
  A안은 이 장면을 '01 교육기관 탐방'으로 옮기고 순서를 실제 일정대로 바꿨습니다.
- 소속 표기 중 '정률사관학원'(세션 02), '일본 전국학원협회 회장'(세션 06), '선전'(세션 04)은 스크립트가 음성 인식 기반이라 확인을 권합니다.
- B안 카피 "한·중·일·베트남 교육 관계자 150여 명", "AI 시대, 교육은 어디로 향해야 할까?", "기술은 도구, 중심은 사람"은 공식 블로그 후기(2026-06-02) 표현을 따랐습니다.
- 중국 본사 촬영본 대부분은 세로(9:16)라 가로 16:9 띠로 잘라 썼습니다. 1080×1920 원본(입장·개막 타이틀·축사·세션 01·06 일부)은 1.78배 확대라 다른 컷보다 약간 부드럽습니다.
- **섹션별 고화질 렌더링본**(`부산 포럼 영상/섹션별 렌더링본`, 1080p 19Mbps)은 이번 작업에 쓰지 못했습니다. 01·04–07 파일은 링크 공유가 되어 있지만
  Drive의 파일별 다운로드 할당량이 초과됐고(대략 24시간 뒤 풀림), 02 조교성·03 곽정율 파일은 링크 공유가 꺼져 있습니다. 할당량이 풀리면 연사 컷만
  고화질로 바꿔 넣을 수 있도록 C안은 연사 컷을 샷 단위로 분리해 두었습니다(`src/forum/edl/speakers.json`의 `C_JO`·`C_HE`·`C11`·`C13`·`C14`·`C15`).
- **학원 탐방(D–F안)**: `260528 학원 탐방/카메라 사진`(소니 원본, 가로 2880px로 줄여 사용)과 `핸드폰 사진`의 카카오톡 영상(1280×720, 세로 영상 다수)을 썼습니다.
  학원 이름은 간판이 화면에 보이는 컷(라임라잇수학학원 · 리드101)만 그대로 두고 자막으로 따로 적지 않았습니다. 방문 순서·기관 목록이 있으면 라벨을 더 붙일 수 있습니다.
  세로 영상은 16:9로 자르면 너무 확대돼 E·F안에서는 3분할 칸에 원본 비율로 넣었습니다.
- **사람편(G안)** 사진은 `260529 부산 포럼(사진)/카메라 사진`(소니 원본 1,499장)에서 골랐습니다. 입장 영상은 중국 본사 촬영본(09:48 입장, 10:01 착석)과
  한국팀 4K(12:52 꽉 찬 홀, 16:20 객석)입니다. 사진 구간 밑에 로비 웅성거림을 깔려고 했던 12:50 영상은 실수로 바닥을 찍은 클립이고,
  소리도 운영진 무전·업무 대화(이름 포함)라 쓰지 않았습니다. 얼굴이 크게 나온 컷이 많아 외부 공개 전 초상권 확인을 권합니다.
- D–F안의 연사 컷은 얼굴이 잡힌 5인(조규성·곽정율·허첸·지우유·안도 다이사쿠)입니다. 세션 04 웅극중은 쓸 수 있는 컷이 없어 빠졌습니다.
  허첸 컷은 3초 휴대폰 영상이라 E·F안 라인업에서는 얼굴이 잡힌 프레임에서 멈춘 화면으로 씁니다.
- E·F안 카피 "직접 보고, 함께 배우다."는 제작 카피이고, "한·중·일·베트남 150여 명이 함께"는 B안과 같은 공식 블로그 후기 표현입니다.
- 음악은 저작권 이슈가 없도록 직접 작곡(MIDI)해 FluidR3 GM 사운드폰트(MIT)로 렌더한 오리지널입니다. 유료 라이브러리 곡으로 바꾸려면 `public/forum/audio/music-*.wav`를 교체하고 EDL의 `music` 키프레임만 맞추면 됩니다.

## 구조와 다시 만들기

```
src/forum/edl/live.json        # A안 EDL — 컷(원본·인/아웃·크롭·현장음 볼륨)·사운드바이트(자막 포함)·텍스트·음악 큐
src/forum/edl/highlight.json   # B안 EDL
src/forum/edl/speakers.json    # C안 EDL — 대부분 A·B 중간본을 clip/offset 으로 재사용
src/forum/edl/sketch.json      # D안 EDL — 탐방 사진(img)·영상 + A–C 중간본 재사용
src/forum/edl/style.json       # E안 EDL — style(레터박스·그레인·색보정) · panels(분할 화면) · words/stamp/lockup 텍스트
src/forum/edl/short.json       # F안 EDL
src/forum/edl/people.json      # G안 EDL — 포럼 당일 사진 + 입장·객석 영상
src/forum/ForumEdit.tsx        # EDL 렌더러 — 디졸브, 사진 켄번스, 세로 영상(tall), 분할 화면, 플래시·펀치, 덕킹, 자막
src/forum/Overlays.tsx         # 타이틀 · 챕터/세션 라벨 · LIVE HUD · 로워서드 · 자막 · 키 카피 · 엔드 카드
src/forum/Style.tsx            # E·F안 — 레터박스 틀 · 그레인 · 비네트 · 분할 화면 · 박자 타이포 · DAY 스탬프 · 락업
tools/forum/fetch.sh           # Drive 원본 내려받기(footage.tsv = EDL이 쓰는 클립·탐방 사진)
tools/forum/cut.py             # EDL → public/forum/clips/*.mp4(1080p30 중간본) · stills/*.jpg(사진) · audio/*.wav(사운드바이트)
tools/forum/compose_music.py   # 오리지널 음악 MIDI (highlight · live · speakers · sketch · people · style · short)
tools/forum/music.sh           # MIDI → public/forum/audio/music-*.wav
tools/forum/deliver.sh         # 마스터 → 납품본(-16 LUFS, x264 2-pass)
```

```bash
tools/forum/fetch.sh ~/footage
python3 tools/forum/cut.py ~/footage src/forum/edl/*.json        # clip 으로 가리키는 컷은 다른 버전의 중간본을 재사용
tools/forum/music.sh                                             # fluidsynth · fluid-soundfont-gm · mido 필요
npm run render:forum-live && npm run render:forum-highlight && npm run render:forum-speakers   # out/forum-sketch-*-master.mp4 (CRF 17)
npm run render:forum-sketch60 && npm run render:forum-style && npm run render:forum-short30 && npm run render:forum-people
tools/forum/deliver.sh out/forum-sketch-speakers-master.mp4 out/busan-forum-sketch-C-highlight-speakers.mp4 5500
tools/forum/deliver.sh out/forum-sketch-60s-master.mp4 out/busan-forum-sketch-D-60s.mp4 6000
tools/forum/deliver.sh out/forum-sketch-style-master.mp4 out/busan-forum-sketch-E-style.mp4 7000
tools/forum/deliver.sh out/forum-sketch-30s-master.mp4 out/busan-forum-sketch-F-30s.mp4 7000
tools/forum/deliver.sh out/forum-sketch-people-master.mp4 out/busan-forum-sketch-G-people.mp4 6500
```

`public/forum/`와 마스터 렌더는 용량 때문에 git에서 제외했습니다. 납품용 `out/busan-forum-sketch-*.mp4`는 마스터를 x264 2-pass로 다시 인코딩한 파일입니다.
컷 길이·순서는 EDL의 `dur`/`xfade`(겹침 초)만 고치면 되고, 인/아웃이나 크롭을 바꿨다면 `cut.py`를 다시 돌립니다(EDL보다 새 파일, 원본이 없는 파일은 건너뜀).

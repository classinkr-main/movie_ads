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

## 숏폼 (9:16) — 2026 아시아 AI 교육 포럼 · 허첸 CTO 세션

포럼 영상(드라이브 「부산 포럼 영상/허첸 진행자.mp4」, 28:54)에서 한국 교육 업계(학원 원장·강사)가 반응할 구간 세 개를 골라 세로 숏폼으로 만듭니다.

| 컴포지션 | 상단 카피 | 길이 | 원본 구간(파일 기준) |
| --- | --- | --- | --- |
| `short-01-ai-teacher` | 매년 똑같은 강의라면, **AI가 대체**할 수 있다 | 66.5s | Q&A 25:24~28:44 — 현장 질문 "AI의 부속품 같은 선생님이 되지 않을까?"와 답변 |
| `short-02-institution` | 수업의 질, 아직도 **강사 한 명**에게 달렸나요? | 35.6s | 16:22~17:06 — 강사 개인기에서 기관의 데이터·AI 경쟁력으로 |
| `short-03-learning` | AI가 이제 **'왜 막혔는지'**까지 봅니다 | 48.4s | 7:46~9:06 — AI가 학생 한 명의 학습 과정을 이해한다 |

- **레이아웃(1080×1920)**: 상단 행사명·헤드 카피 → 가운데 16:9 영상 → 영상 하단에 겹친 원어(중국어) + 한국어 자막(영상 아래쪽에 그림자 깔림) → 하단 Classin 워드마크. 맨 아래 250px는 플랫폼 UI 자리로 비워 둡니다.
- **이름표**: 영상 왼쪽 위. 연사(허첸 · ClassIn CTO)는 처음 말을 시작할 때 3.5초만 보였다 사라지고, 현장 질문은 질문하는 동안 표시합니다(스펙의 `speakers[].tag: "run"`).
- **화면**: 원본은 무대 와이드 샷이고 LED 화면 오른쪽에 발표자 클로즈업이 뜹니다. 구간마다 `wide`(LED 전체)와 `close`(발표자) 크롭을 번갈아 써서 점프컷을 투캠 편집처럼 보이게 합니다.
- **오디오·인코딩**: 구간 경계 30ms 페이드, 라우드니스 -14 LUFS. 숏폼은 업로드용이라 CRF 20으로 렌더합니다(쇼릴은 16).
- **자막**: Whisper large-v3-turbo로 받아쓴 뒤 포럼 전체 자막과 대조해 정리했습니다. 한국어 발화(현장 질문)는 한국어 한 줄만 표시합니다.

### 검수 참고

- 원본 파일 자체가 점프컷 편집본이라 문장 중간이 잘린 곳이 있습니다. 마무리 발언의 "혁신은 대부분 **구미**에서 왔다. 다음은 **우리**에게서"는 이 파일에서 "혁신은 대부분 **우리**에게서 왔다"로 이어 붙어 있어(1123.8s·1126.4s 컷) 뜻이 반대가 되므로 쓰지 않았습니다.
- Q&A 중 "스탠퍼드 졸업생 280여 명 중 취업자 20명 미만" 일화는 출처를 확인할 수 없어 컷에서 뺐습니다.
- 1번의 "매년 똑같은 강의는 단순 반복이라 대체될 수 있다"는 원본 1680.3s 컷 앞뒤("简单的 | 把那个替掉")를 포럼 전체 자막 기준으로 이어 번역했습니다.

### 다시 만들기

```bash
npm run shorts:cut -- <원본 mp4 경로>   # src/shorts/specs/*.json의 segments대로 public/shorts/<id>.mp4 생성
npm run shorts:render                    # out/shorts/<id>.mp4
```

구간·자막·카피는 `src/shorts/specs/<id>.json` 하나에서 고칩니다. 시간은 모두 원본 파일 기준 초이고, 클립 위치로의 변환은 `src/shorts/timeline.ts`가 합니다. 구간을 바꾸면 `shorts:cut`부터 다시 돌립니다.

## 프로젝트 구조

```
src/
  Root.tsx                  # Showreel(16:9) + 숏폼 3편(9:16) 컴포지션
  shorts/ShortForm.tsx      # 숏폼 레이아웃 — 헤드 카피 · 크롭 영상 · 왼쪽 위 이름표 · 영상에 겹친 원어/한국어 자막 · Classin
  shorts/specs/*.json       # 숏폼별 구간 · 자막 · 카피 · 크롭(원본 기준 초)
  shorts/timeline.ts        # 원본 시각 → 클립 시각 변환, 프레임 고정 구간 길이
scripts/cut-clips.py        # 스펙대로 원본을 잘라 이어 붙여 public/shorts/<id>.mp4 생성
  Showreel.tsx              # TransitionSeries 타임라인 + 커스텀 전환(연두 스윕·패럴랙스 푸시·연두 아이리스) + 챕터 레일 오버레이
  scenes/Opening · F01Eval · F02Script · F03Homework · F04Subtitle · F05Agent · Cta
  components/Feature.tsx    # FEATURES 목록 · FeatureLayout(텍스트 컬럼 + 카드 컬럼) · ChapterRail · UiCard · CardHeader · Stamp
  components/Flourish.tsx   # Highlighter · Chars · RollingNumber · Burst · Dots · GlassCard · GhostWord · TypeText · ClipReveal · SkeletonLine
  components/Kinetic.tsx    # WordPop · MaskText · CountUp · DrawLine
  components/Ui.tsx         # Eyebrow · Chip · Sticker · Pop · Rise · 로고
  components/Backgrounds.tsx# IvoryStage · LimeStage · PanelWipe · Grain
  lib/theme.ts              # 팔레트 · FPS · 길이(900f)
  lib/motion.ts             # 스프링 프리셋 · 이징
  lib/fonts.ts              # Pretendard 6굵기 + Noto Sans SC 2굵기(숏폼 중국어 자막) 로드
public/fonts/               # Pretendard · Noto Sans SC GB2312 서브셋 (둘 다 SIL OFL 1.1)
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

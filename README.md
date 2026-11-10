# Classin 커머셜 쇼릴

Classin을 소개하는 커머셜 쇼릴 두 편을 [Remotion](https://www.remotion.dev/) 4로 만듭니다. 카피·수치·색·타이밍을 코드에서 바꾸고 다시 렌더할 수 있습니다.

| 산출물 | 규격 | 컴포지션 | 경로 |
| --- | --- | --- | --- |
| **갈매기 드로잉 쇼릴** | 1920×1080 · 30fps · 49s · H.264 + AAC(BGM·효과음) | `GullReel` | `out/classin-gull-showreel.mp4` |
| 갈매기 쇼릴 섬네일 | 1920×1080 PNG · 1280×720 JPG | `GullThumb` | `out/classin-gull-thumbnail.png` · `out/classin-gull-thumbnail-1280.jpg` |
| AI 키네틱 쇼릴 (v4) | 1920×1080 · 30fps · 30s · H.264 · 무음 | `Showreel` | `out/classin-ai-showreel.mp4` |

---

# 1. 갈매기 드로잉 쇼릴 (49초)

**"칠판은 지워져도, 수업은 남습니다."** — 연필이 그려 낸 연두 갈매기가 그 연필을 낚아채, 클래스인의 특장점 두 가지와 학습 데이터의 가치를 직접 그려 가며 설명하는 손그림 애니메이션입니다. 원장님과 대형 학원의 시스템 담당자를 대상으로 구성했습니다.

## 스토리 (6씬 · 1,470f)

| # | 프레임 | 길이 | 내용 |
| --- | --- | --- | --- |
| S0 오프닝 | 0–180 | 6s | 연필이 밑그림 위에 갈매기를 그린다 → 마커로 색이 칠해진다 → 갈매기가 폴짝 뛰어 연필을 낚아챈다. "안녕하세요, 원장님! 클래스인이 잘하는 것, 딱 **두 가지**만 그려 볼게요" (+ 하나 더: 데이터) |
| S1 특장점 01 | 180–480 | 10s | **칠판은 지워져도, 수업은 남습니다.** 전자칠판 판서(AI 카메라 REC) → 지우개가 지운다 → 판서·수업이 알갱이가 되어 "교안 파일"·"수업 녹화"로 → 다음 수업을 해도 매일 차곡차곡. 포스트잇: "결석 보강·복습 영상이 그날 바로" / "누가 들어가도 같은 수업" |
| S2 특장점 02 | 480–780 | 10s | **수업이 끝나면, AI가 바로 평가합니다.** 교실 6곳을 다 참관할 수 없는 갈매기 → "딩동, 수업 끝" → AI → 리포트 한 장(종합 점수, 4개 영역, 강점·개선, 수업 흐름) → 교실마다 점수 태그 + 자(같은 기준). "60분 수업을 한 장으로" |
| S3 +1 데이터 | 780–1200 | 14s | **쌓인 수업은, 데이터가 됩니다.** 매일의 수업 → 5개 기록(수업 시간 · 출석·참여 · 특이사항 · 네트워크 상태 · 녹화·수업 데이터) → 가치 카드 3장(원장님 / 상담 선생님 / 시스템 담당자) → 갈매기가 날아올라 지점들을 내려다본다. **쌓일수록, 더 멀리 보입니다** + 데이터가 답해 줄 질문 3개 |
| S4 글로벌 | 1200–1320 | 4s | **전 세계 교실이 이미 쓰고 있어요.** 160+ 서비스 국가 · 6만+ 교육기관 · 3,000만+ 월간 수업 (EEO 공식 기준 · 전 세계 누적) |
| S5 엔드카드 | 1320–1470 | 5s | 헤드라인 + 요약 칩 3개 + 로고 + **파일럿 상담 신청** + `classin.co.kr/contact` + "1개 교실 파일럿부터, 함께 설계합니다" |

전환: 연두 마커 스와이프(S0→S1) → 스케치북 장 넘김(S1→S2) → 민트 마커 스와이프(S2→S3) → 위로 날아오르기(S3 안) → 해에서 열리는 아이리스(S3→S4) → 연두 마커 스와이프(S4→S5).

## 드로잉 스타일

- **손그림 엔진**(`src/gull/sketch.ts`) — 직선·사각형·타원·화살표·지그재그를 seed 기반으로 비뚤빼뚤하게 생성합니다. 비뚤빼뚤함의 세기는 `WOBBLE` 한 값으로 조절합니다.
- **끓는 선(line boil)** — 4프레임마다 3장의 그림을 돌려 써서 선이 살짝씩 떨립니다. 고정 성분(그림마다 정해진 비뚤빼뚤함) + boil 성분(떨림)을 섞어, 모양은 유지되면서 살아 있는 느낌이 납니다.
- **두 번 덧그린 윤곽선**, **살짝 밀린 채색**(선과 색이 어긋나는 인쇄 느낌), **마커로 칠해지는 리빌**(지그재그 마스크), **드로온**(선이 그려지는 과정).
- **종이** — 아이보리 종이 + 도트 그리드 + 종이 결 텍스처(곱하기) + 비네트 + 필름 그레인 + 촬영대 카메라의 미세한 흔들림.
- **서체** — 제목 Jua, 손메모 Gaegu(둘 다 SIL OFL 1.1), 각주 Pretendard.
- **색** — 연두 `#C8F05A` / `#8BC926`, 브랜드 그린 `#084734` / `#009060`, 칠판 `#17503C`, 포인트는 부리·발의 주황과 포스트잇 노랑뿐입니다. 파랑은 쓰지 않습니다.

## 캐릭터: 연두 갈매기

`src/gull/Gull.tsx`의 SVG 리그입니다. 연두 몸 + 흰 배 + 짙은 초록 날개 끝(갈매기의 검은 날개 끝이자 로고의 짙은 그라데이션) + 머리 깃 세 장. 웹사이트 쿠키 배너의 갈매기와 같은 계열로 그렸습니다.

| prop | 뜻 |
| --- | --- |
| `wingL` `wingR` `wingLen` | 날개 각도(68 = 내림, 음수 = 들어 올림)와 길이. `flap(frame)`으로 날갯짓 |
| `eyes` | `auto`(자동 깜빡임) · `open` · `closed` · `happy` · `wide` |
| `look` `beak` `tuft` `blush` `sweat` | 시선 · 부리 벌림 · 머리 깃 흔들림 · 볼 · 땀방울 |
| `squash` `lift` `rotate` | 찌그러짐 · 뜬 높이 · 기울기. `hop(frame, start)`로 폴짝 |
| `mono` `draw` | 선만 그리는 스케치 단계(드로온 0~1) |
| `hold` | 오른쪽 날개에 쥔 소품(`<Pencil />`) |

`npm run still:gull`로 포즈 시트(`out/gull-sheet.png`)를 뽑을 수 있습니다.

## 섬네일

`src/gull/Thumb.tsx`(`GullThumb`)는 오프닝 프레임의 느낌을 그대로 살린 섬네일입니다. 작게 줄여도 읽히도록 요소를 셋으로 줄였습니다 — 햇살 후광 앞의 갈매기, 화면 높이의 4분의 1을 차지하는 **"딱 두 가지"**, 내용을 가린 물음표 카드(01 칠판 · 02 AI · +1 데이터). 말풍선 "원장님, 49초만요!"의 49초는 영상 길이이므로 길이를 바꾸면 함께 고칩니다.

```bash
npm run thumb:gull    # out/classin-gull-thumbnail.png (1920×1080)
```

1280×720 JPG(`out/classin-gull-thumbnail-1280.jpg`)는 PNG를 줄여 만든 업로드용 사본입니다.

## 사운드

BGM과 효과음은 **코드로 합성**합니다(`scripts/make-audio.mjs`, 샘플·외부 음원 없음 → 저작권 걱정 없음). 120 BPM이라 한 박 = 15f, 한 마디 = 60f이고, 주요 장면(연필 낚아채기, "수업은 남습니다", 딩동, 타일 5개, 날아오르기, CTA 버튼 등)이 박자에 맞춰져 있습니다.

- 악기: 우쿨렐레(가산 합성) · 글로켄슈필 · 마림바 · 베이스 · 킥/셰이커/핑거 스냅 · 패드
- 효과음: 연필 사각사각 · 뿅 · 갈매기 삐약 · 휘익 · 분필 톡톡 · 지우개 · 종이 넘김 · 날갯짓 · 딩동
- 통합 음량 약 −15 LUFS, 트루 피크 약 −3.4 dBTP

```bash
npm run audio      # public/audio/gull-reel.wav 합성 → gull-reel.m4a 인코딩(ffmpeg 필요)
```

영상 타이밍을 바꾸면 `make-audio.mjs` 아래쪽의 효과음 표(씬별 프레임)도 함께 고칩니다. 다른 음악으로 바꾸려면 `public/audio/gull-reel.m4a`만 교체하면 됩니다.

## 콘텐츠 출처와 검수 참고

- 카피는 `classinkr-web`의 홈·제품 페이지 문구를 따릅니다. 헤드라인 "칠판은 지워져도, 수업은 남습니다", "수업만 하면 녹화가 저절로 쌓입니다", "수업이 끝나면 AI가 바로 평가합니다", "누가 들어가도 같은 수업", "참관하지 않아도 강사별 수업 품질을 같은 기준으로 봅니다", "60분을 한 장으로", 데이터 항목(수업 시간 · 출석과 참여 · 특이사항 · 네트워크 상태 · 녹화와 수업 데이터), "감이 아니라 기준으로", "학부모 상담에 근거가 생깁니다", "데이터 구독과 코스/수업 정보 조회 API", "1개 교실 파일럿부터", CTA "파일럿 상담 신청".
- **글로벌 지표**(160+ · 6만+ · 3,000만+)는 홈 히어로와 같은 EEO 공식 기준의 전 세계 누적 수치이며, 화면에 출처를 표기했습니다. 한국 내 도입 수치는 쓰지 않았습니다.
- **예시 수치** — AI 리포트의 종합 88점, 영역 92/88/81/90, 교실별 점수(88·91·84·93·76·89), 강점·개선 문장은 연출용 예시이고 리포트에 "(예시)"로 표기했습니다. 4개 영역 이름(수업 전달 · 수업 분위기 · 수업 상호작용 · 언어 표현)은 AI 강의 분석 소개 자료 기준입니다.
- **AI 강의 평가의 제공 범위**(수업 언어·수업 형태)는 영상에서 단정하지 않습니다. 게시 전에 현재 제공 범위와 맞는지 확인이 필요합니다.
- S3 바다 장면의 질문 3개("어느 반의 참여가 줄고 있을까?" 등)와 "쌓일수록, 더 멀리 보입니다"는 **데이터의 가능성을 보여 주는 연출 카피**입니다. 특정 분석 기능이 제공된다는 뜻이 아니도록 질문형으로 썼습니다. 사이트는 고급 리포트를 "별도 시스템이나 연동으로 분리해 설계"한다고 안내합니다.
- 가치 카드의 "본원·A지점·B지점", "지점 · 반 · 학생까지 한눈에"는 관리자 뷰 소개 문구를 따른 연출입니다.
- 웹사이트 디자인 규칙(`classinkr-web/DESIGN.md`)은 공개 화면에 캐릭터를 쓰지 않도록 정하고 있습니다(쿠키 배너만 예외). 이 영상을 사이트에 직접 싣는다면 그 규칙과의 관계를 먼저 정해야 합니다.

## 프로젝트 구조 (갈매기 쇼릴)

```
src/gull/
  GullReel.tsx        # 타임라인 · 전환(마커 스와이프 · 장 넘김 · 아이리스) · 오디오
  theme.ts            # 팔레트 · 씬 길이(SCENES) · 서체 이름
  sketch.ts           # 손그림 경로 생성기(WOBBLE · roughLine/Rect/Ellipse · scribble · arrow …)
  Ink.tsx             # Stroke · MarkerReveal · SRect/SEllipse/SPoly/SLine/SArrow · Scribble · Label · useBoil
  Lettering.tsx       # Hand(손글씨 제목) · Note(손메모) · Mark(형광펜) · Under(밑줄) · Circled(동그라미)
  Gull.tsx            # 갈매기 리그 · Pencil · flap
  motion.ts           # hop(폴짝) · pointOn · mix · span
  Paper.tsx           # Paper · PaperFinish(종이 결·비네트·그레인) · Rostrum · Canvas
  parts.tsx           # Badge · TitleLine · Sticky · Bubble · Burst · Motes · Sheet · MarkerWipe · PageMark
  Sheet.tsx           # 캐릭터 포즈 시트(GullSheet 컴포지션)
  Thumb.tsx           # 섬네일(GullThumb 컴포지션)
  scenes/S0Open · S1Keep · S2Eval · S3Data · S4Scale · S5Cta
scripts/
  make-audio.mjs      # BGM·효과음 합성
  stills.mjs          # 개발용: 여러 프레임을 한 번에 스틸로
  contact.py          # 개발용: 스틸을 콘택트 시트로
public/audio/gull-reel.m4a   # 합성된 사운드트랙
public/textures/paper.jpg    # 종이 결 텍스처(직접 생성)
public/fonts/                # Jua · Gaegu (SIL OFL 1.1) 추가
```

## 실행 (갈매기 쇼릴)

```bash
npm install
npm run dev           # Remotion Studio — GullReel 컴포지션
npm run render:gull   # out/classin-gull-showreel.mp4
npm run audio         # 사운드트랙 다시 합성
node scripts/stills.mjs GullReel out/frames 60,300,600,1100,1440 0.5   # 특정 프레임만 확인
```

## 수정 가이드 (갈매기 쇼릴)

- **카피** — 각 씬 파일의 문자열. 제목은 `<TitleLine a="…" b="…" />`, 손메모는 `<Note>` · `<Label>`.
- **선의 비뚤빼뚤함** — `src/gull/sketch.ts`의 `WOBBLE`(기본 2.3). 떨림 속도는 `Ink.tsx`의 `useBoil(rate, cycle)`.
- **타이밍** — 씬 길이는 `theme.ts`의 `SCENES`, 씬 안의 박자는 각 씬 파일 상단 상수. 바꾸면 `scripts/make-audio.mjs`의 효과음 프레임도 맞춥니다.
- **지표** — `S4Scale.tsx`의 `STATS`. **CTA** — `S5Cta.tsx`의 `CTA_URL`과 버튼 문구.
- **캐릭터** — `Gull.tsx`의 `BODY` · `WING` 점 좌표와 `theme.ts`의 색.

---

# 2. Classin AI 키네틱 쇼릴 (30초, v4)

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

- **Remotion 4.0.533** — 프레임 결정론적 React 렌더, `spring`/`interpolate`, `@remotion/fonts`, `@remotion/transitions`(TransitionSeries + 커스텀 프레젠테이션), `@remotion/paths`(갈매기 쇼릴에서 경로 위의 점 계산).
- **HyperFrames**(`hyperframes` npm, HeyGen) — HTML/GSAP 타임라인 기반 영상 합성 CLI. 검토했으나 한글 폰트 번들과 스프링 물리 기반 키네틱 타이포에 Remotion이 더 직접적이라 엔진으로 채택하지 않았습니다.

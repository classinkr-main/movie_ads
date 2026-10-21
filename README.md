# Classin 커머셜 쇼릴

[Remotion](https://www.remotion.dev/) 4로 만든 Classin 커머셜 영상 두 편입니다. 카피·수치·색·타이밍을 코드에서 바꾸고 다시 렌더할 수 있습니다.

| 컴포지션 | 내용 | 규격 | 경로 |
| --- | --- | --- | --- |
| `BrandReel` (v7) | 학원·교육기관 대상 브랜드 쇼릴 — 실제 학원·쇼룸 사진 + Classin 스톡 영상 | 1920×1080 · **60fps** · 24s · H.264 · yuv420p bt709 | `out/classin-brand-reel-60fps.mp4` (무음) · `out/classin-brand-reel-60fps-guide-sfx.mp4` (가이드 사운드) |
| `Showreel` (v4) | Classin AI 기능 5종 소개 | 1920×1080 · 30fps · 30s | `out/classin-ai-showreel.mp4` |

---

# BrandReel — 24초 · 60fps 브랜드 쇼릴 (v7)

**"미래의 수업, 이미 학원에서 시작됐습니다."** → **"좋은 수업을, 강사의 개인기에서 학원의 시스템으로."** → **목동 쇼룸 CTA**.
학원 원장·교육기관 의사결정자를 겨냥한 다크 시네마틱 커머셜입니다. Drive `0. 사진창고`의 실제 학원·쇼룸 사진과
`classinkr-web/public/video`의 Classin 스톡 영상을 모션그래픽으로 묶었습니다.

> v7 변경: 20초 → **24초**(섹션마다 여유 — 흐름 비트 1.1s → 1.33s, 칠판 3.2s → 4.3s 등) · 교안 비트 카드를 **EDB 교안 카드 덱**으로 재설계
> (Unit 5 세 페이지: 마인드맵 · 확인 문제 · 판서 템플릿, 저장 진행 → 저장됨) · 그리드 타일 디테일(지역 라벨 · 번호 · REC · 유리 · 회로선) ·
> 칠판 **질감**(분필 얼룩·지운 판서 흔적·분필 획·그레인·유리 반사)과 **수업 화면 UI**(툴바·상태 바·페이지 스트립·학생 영상 타일·Tip 메모·스타일러스·지우개 가루).
> v6(20초)·v5는 git 히스토리에 있습니다.

## 스토리 (6씬 · 1440f @60fps)

| # | 글로벌 프레임 | 길이 | 화면 |
| --- | --- | --- | --- |
| S1 훅 | 0–220 | 3.7s | 2.39:1 레터박스. 거대 타이포 "미래의 수업" — 글자 안에서 스톡 영상(SPACE TRAVEL 전자칠판, 0.57배 슬로모션)이 재생 → 글자로 줌스루하며 화면비가 16:9로 열림 + 플레어 → "이미, 학원에서 시작됐습니다." |
| S2 흐름 | 208–620 | 6.9s | 5비트 휩 몽타주(비트당 1.33s, 랙 포커스·라이트 릭): **판서**(EDB 저장) · **녹화**(카메라 모니터 너머 수업, REC 뷰파인더) · **교안**(EDB 교안 카드 덱 — 도입 마인드맵 · 확인 문제 정답 선택 · 판서 템플릿 아크를 스타일러스가 그림 → "우수 강사 템플릿으로 저장됨") · **복습**(자동 녹화 · LMS 다시보기) · **데이터**(수업 리포트). 상단 흐름 레일 |
| S3 그리드 | 608–812 | 3.4s | 전국 학원·쇼룸 사진과 수업 영상 15타일이 피사계 심도 속에서 3D로 날아와 정렬 — 지역 라벨 · 번호 · REC 타임코드 · 유리 글레어, 타일 틈으로 빛이 흐르는 회로선 → "하나의 흐름으로." → 중앙 칠판 타일로 줌스루(그 사이 칠판이 켜지고 예문이 쓰임) |
| S4 히어로 | 812–1068 | 4.3s | **스크린 리플레이스** — 실제 교실 사진 속 빈 전자칠판에 예시 영어 수업(현재완료). Classin 수업 화면 UI(상태 바 · 좌측 툴바 · 페이지 스트립 · 학생 영상 타일) + 분필 질감 판서(주석 · 동그라미 · 별 · 스타일러스가 긋는 2021→Now 아크) · Tip 메모 · 학생 질문 → 지우개(분필 가루, 희미한 흔적) → "좋은 수업을, 강사의 개인기에서 / 학원의 시스템으로." |
| S5 스케일 | 1056–1278 | 3.7s | 서울에서부터 켜지는 점 지구본(Natural Earth 육지 3,538점) + 대륙을 잇는 아크 + 160+ 개국 서비스 · 6만+ 교육기관 · 5,000만+ 교사·학습자 · 3,000만+ 월간 수업(슬롯 롤) |
| S6 엔드 | 1266–1440 | 2.9s | 민트 링 아이리스 → 보케 사진 월 위로 Classin 마크(플레어)·워드마크 → 태그라인 · 수업 시스템 OS · CTA "목동 쇼룸에서 실제 수업 흐름 보기" · classin.co.kr |

전환: 휩 푸시+블러+플래시(S1→S2, S2 비트 사이) → 3D 그리드 줌스루(S3→S4, 같은 칠판 시계를 공유해 끊김 없음) → 민트 사선 스윕(S4→S5) → 민트 링 아이리스(S5→S6).
임팩트 3곳(f146 글자 줌스루 · f812 칠판 도착 · f1274 로고 착지)에서 펀치 인 + 감쇠 흔들림 + 아나모픽 플레어.

## 60fps 처리

- 컴포지션 자체가 60fps이고 모든 모션(스프링·카메라·마스크·지구본 회전)이 프레임 단위로 계산됩니다.
- 스톡 영상(25fps)은 `ffmpeg minterpolate`(mci · aobmc · bidir)로 **움직임 보간한 60fps 클립**으로 미리 만들어 `public/reel/video/`에 두었습니다.
  24초 버전에서 훅(space 0.57배) · 복습(laptop 0.8배) · 그리드 타일(phone 0.62배 · tablet 0.75배) 클립을 슬로모션으로 다시 보간했습니다.
  원본 home-hero.mp4의 레터박스(위아래 60px)는 잘라냈습니다.

## 소재와 출처

- **사진** (`public/reel/photos/`, 24장, 최대 2560px · EXIF/GPS 제거): Drive `0. 사진창고` — classin korea 목동쇼룸, classin 연출(빈 전자칠판),
  수학의심장을달다(목동), 그릿831(대구), 라임라잇수학(부산), 정율사관(부천), 과사람(부산), 윤유경플러스(평택), 원더스잉글리시(서울), 이센스영어(울산).
  녹화 비트 사진(`academy-rec.jpg`, 수심달)은 카메라 본체의 제조사 로고를 리터칭으로 지웠습니다.
  뉴스 매체 사진(정율사관 폴더의 `news-p…jpg`)과 직원 행사 사진(클래스인사이드)은 쓰지 않았습니다.
- **영상** (`public/reel/video/`): `classinkr-web/public/video/home-hero.mp4`, `Interactive Learning with ClassIn.mp4` 구간 발췌 → 60fps 보간.
- **질감 텍스처** (`public/reel/tex/`): `scripts/make_textures.py`로 생성 — 칠판 분필 얼룩·지운 판서 흔적(`chalk.png`), 그레인(`grain.png`),
  교실 유리 반사(`reflection.jpg`, 쇼룸 사진을 반전·블러). 분필 획 자체는 SVG 필터(`ChalkFilter`)로 깎습니다.
- **그리드 지역 라벨**은 사진창고 폴더명(지역_학원명) 기준 시·구 단위만 표기하고 학원명은 쓰지 않았습니다.
- **지구본**: [world-atlas@2.0.2](https://github.com/topojson/world-atlas) `land-110m`(Natural Earth, 퍼블릭 도메인) → `scripts/land_dots.py`로 피보나치 구면 점 샘플링 → `src/reel/data/landDots.ts`.
  아크 끝점은 대륙 위치를 잡기 위한 좌표일 뿐 특정 도시·고객을 뜻하지 않아 라벨이 없습니다(서울만 표기).
- **수치**: `classinkr-web/docs/active/brand-canon/company-facts.md` §3(EEO 공식, classin.com) — 화면에 "전 세계 누적 수치 · EEO 공식 소개 기준" 캡션 표기.
- **카피**: 헤드라인·CTA는 `classinkr-web/lib/classin-positioning.ts`(heroHeadline · primaryCtas[0]) 정본, "감이 아니라 기준으로"는 보이스 헌장 권장어.
- 칠판 화면·플레이어·수업 리포트·EDB 카드는 **예시 화면(콘셉트 목업)**이며 S4 좌하단에 "예시 화면" 라벨을 둡니다. 학생 이름(지민·도윤·서아)은 가상입니다.

### 외부 배포 전 확인할 것

- 사진 속 인물(원장·강사·참석자)과 학원 간판·화면의 **초상권·사용 동의** — 사진창고 소재라도 광고 집행 전 해당 학원 확인 권장.
- "자동 녹화" 표현은 실제 제공 방식(학원 설정에 따른 자동 녹화 범위)과 맞는지 확인하세요.
- 가이드 사운드는 편집 확인용 절차적 사운드입니다. 집행본은 라이선스 BGM으로 교체하세요(90 BPM이면 S2 컷이 박에 맞습니다).

## 디자인 톤

- 베이스 딥 그린 블랙 `#030B08` · 브랜드 그린 `#084734`/`#00A86B` · **강조 민트 `#6EE7B7`**(DESIGN.md Green Muted) · 흰 타이포(Pretendard 600–900)
- 강조색은 `src/reel/theme.ts`의 `accent`·`accentRgb` 두 줄로 바뀝니다(하이라이터·레일·CTA·글로우·플레어가 모두 따라감).
- 사진 그레이드: 채도 −14% · 대비 +8% + 포레스트 그린 soft-light 톤 + 비네트, 필름 그레인(overlay) 전역
- 시네마틱 장치(`src/reel/fx.tsx`): Letterbox · AnaFlare · LightLeak · Dust · shakeAt, 그리고 S2 랙 포커스 · S3 피사계 심도 · S6 보케 사진 월
- 질감 장치(`src/reel/fx.tsx`): TexImg(미리 구운 텍스처) · GrainTiles · ChalkFilter — 텍스처는 CSS background가 아닌 `<Img>`로 깔아 Remotion이 로드를 기다린다
- HUD 장치: 타임코드, 뷰파인더 브래킷, REC, 흐름 레일, 모노 대문자 라벨

## 구조

```
src/reel/
  BrandReel.tsx      # 6씬 타임라인 + 임팩트 카메라(펀치 인·흔들림) + 아나모픽 플레어 + 비네트·그레인
  theme.ts           # 팔레트(강조 토큰) · 60fps · 씬 경계(T) · HERO_CLOCK · IMPACTS
  media.tsx          # Photo · Clip (켄 번스 카메라 + 그레이드)
  fx.tsx             # FilmGrain · Vignette · Flash · LightSweep · Mono · Timecode · Brackets · RecDot · AnaFlare · LightLeak · Dust · Letterbox
  type.tsx           # MaskLine · Chars · Highlight · CountUp
  homography.ts      # 4점 → CSS matrix3d (스크린 리플레이스)
  HeroShot.tsx       # 빈 전자칠판 사진 + 칠판 화면(수업 UI · 예시 영어 수업 · 분필 질감 → 지우개 → 헤드라인)
  EdbDeck.tsx        # S2 교안 비트의 EDB 교안 카드 덱(3페이지 + 저장 칩)
  data/landDots.ts   # 지구본 육지 점
  scenes/S1Hook · S2Flow · S3Grid · S4Hero · S5Proof · S6End
scripts/
  board_corners.py   # 사진 속 빈 칠판 꼭짓점 검출
  land_dots.py       # 지구본 육지 점 생성
  make_textures.py   # 칠판·그레인·반사 텍스처 생성
  guide_sfx.py       # 가이드 사운드(휩·임팩트·펄스·패드) 생성
public/reel/photos · public/reel/video · public/reel/tex
```

## 실행

```bash
npm run render:reel                                   # out/classin-brand-reel-60fps.mp4
python3 scripts/guide_sfx.py out/brand-reel-guide-sfx.wav   # numpy · scipy 필요
ffmpeg -i out/classin-brand-reel-60fps.mp4 -i out/brand-reel-guide-sfx.wav -c:v copy -c:a aac -b:a 256k -shortest out/classin-brand-reel-60fps-guide-sfx.mp4
```

수정 포인트: 씬 길이 `src/reel/theme.ts`의 `T`, 흐름 비트 카피·사진 `scenes/S2Flow.tsx`의 `BEATS`, 그리드 타일 `scenes/S3Grid.tsx`의 `TILES`,
칠판 화면 내용 `HeroShot.tsx`의 `Lesson`, 교안 카드 `EdbDeck.tsx`, 수치 `scenes/S5Proof.tsx`의 `STATS`, 아크 `ARCS`, CTA `scenes/S6End.tsx`.

---

# Showreel — Classin AI 커머셜 쇼릴 (30초, v4)

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

- **Remotion 4.0.533** — 프레임 결정론적 React 렌더, `spring`/`interpolate`, `@remotion/fonts`, `@remotion/transitions`(TransitionSeries + 커스텀 프레젠테이션).
- **HyperFrames**(`hyperframes` npm, HeyGen) — HTML/GSAP 타임라인 기반 영상 합성 CLI. 검토했으나 한글 폰트 번들과 스프링 물리 기반 키네틱 타이포에 Remotion이 더 직접적이라 엔진으로 채택하지 않았습니다.

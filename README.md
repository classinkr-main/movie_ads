# Classin AI 강의 분석 커머셜 쇼릴 (23초, v2)

Classin **AI 강의 분석**(AI Lesson Analysis)을 키네틱 타이포그래피와 모션그래픽으로 소개하고
**"지금 문의하기"** CTA로 끝나는 23초 가로(16:9) 커머셜 쇼릴입니다. [Remotion](https://www.remotion.dev/) 4 기반이라
카피·수치·색·타이밍을 코드에서 바꾸고 다시 렌더할 수 있습니다.

| 산출물 | 규격 | 경로 |
| --- | --- | --- |
| 메인 (16:9) | 1920×1080 · 30fps · 23s · H.264 · yuv420p bt709 · 무음 | `out/classin-ai-showreel.mp4` |

> v1(20초, 다크 포레스트 톤, AI 학습 활동 포함, 9:16 변형)은 git 히스토리의 첫 커밋에 남아 있습니다.

## 디자인 톤 (v2)

- **베이스**: 화이트·아이보리(`#FFFFFF` / `#FAF8F2` / `#F3EFE4`) + 헤어라인 그리드 + 천천히 떠다니는 연두 글로우
- **포인트**: 연두 그린(`#C8F05A` 형광펜·칩·스티커·전환 띠, `#8BC926` 선·아이콘, `#3C6B12` 연두 맥락 소문자)
- **강조 텍스트·CTA 채움**: Classin Green `#084734` (classinkr-web `DESIGN.md`의 유일한 포화 액센트)
- 연두 풀블리드는 포지셔닝 라인 한 장면(S6 후반)에만 씁니다.

## 스토리 (7씬 · 690f)

| # | 글로벌 프레임 | 길이 | 내용 | 주요 모션 |
| --- | --- | --- | --- | --- |
| S1 훅 | 0–96 | 3.2s | "수업은 매일 쌓입니다." 12개 수업 타일 + 롤링 숫자 12 | 글자 스태거, 타일 팝, 오도미터, 타임코드, 고스트 워드 |
| S2 질문 | 76–176 | 3.3s | "좋은 수업이었는지는, **누가** 알 수 있을까요?" | 거대 아웃라인 ?, 형광펜 스트로크, 떠다니는 '아직 보지 않음' 카드 |
| S3 리빌 | 152–264 | 3.7s | ClassIn **AI 강의 분석** · "녹화만 하면, AI가 수업을 읽습니다." | 로고 낙하 스쿼시, 방사형 버스트, 글자 회전 스태거, 형광펜, NEW 스티커 |
| S4 분석 | 242–360 | 3.9s | 녹화 파형을 AI 스캐너가 읽고 발화·상호작용·수업 분위기·언어 표현 태그를 남김 → 리포트 카드 생성 | 스캐너 글로우, 태그 레일, 진행률, 리포트 카드 팝 + 버스트 |
| S5 리포트 | 338–484 | 4.9s | 4개 영역 · 11개 항목, 종합 점수 링, 영역별 바와 항목 칩 | 롤링 숫자, 회전 눈금 링, 유리 카드 캐스케이드, 예시 스티커 |
| S6 가치 | 462–592 | 4.3s | A: "교사 역량 개발을, 감이 아니라 데이터로." 관리자 대시보드 / 클래스인 앱 카드 → B: 연두 풀블리드 "좋은 수업을, ~~강사의 개인기에서~~ 학원의 시스템으로" | 카드 슬라이드-틸트, 패널 와이프, 취소선·밑줄 드로우 |
| S7 CTA | 568–690 | 4.1s | 로고 + **지금 문의하기 →** + classin.co.kr/contact | 버스트, 펄스 링, 형광펜 URL, 엔드카드 홀드 |

전환(`src/Showreel.tsx`, `@remotion/transitions` TransitionSeries): 연두 스윕(기울어진 띠가 앞장서는 클립 와이프) → 연두 아이리스(원형 리빌 + 링) →
줌 스루(확대·블러) → 푸시 슬라이드 → 연두 스윕(역방향) → 연두 아이리스. 전환 길이 20–24f로 v1보다 넉넉합니다.

## 콘텐츠 출처

- **AI 강의 분석 기능 소개 (2026.04.23)** — Notion `클래스인 신규 업데이트 안내 모음 / 2026.04`. 4개 영역 · 11개 항목(수업 전달 / 수업 분위기 /
  수업 상호작용 / 언어 표현)과 세부 항목명, 리포트 확인 위치(관리자 대시보드 → 교사 개발, 클래스인 앱 → 수업 다시보기), "데이터 기반 교사 역량 개발" 메시지.
- **브랜드 토큰·카피** — `classinkr-web/DESIGN.md`, `lib/classin-positioning.ts`의 heroHeadline, 로고 PNG. CTA URL은 정본 도메인 `classin.co.kr/contact`.

### 마케팅 검수 시 참고할 사실 관계

- Notion 원문 기준 **AI 강의 분석은 현재 중국어 수업에만 제공**(데이터 학습은 한국어 포함 가능)되며 **실시간 수업**에만 적용됩니다(수동 업로드 녹화 미지원).
  영상은 언어를 단정하지 않도록 썼고 S4 하단에 "실시간 수업 녹화에서 자동 생성"을 표기했습니다. 집행 전 언어 범위 안내 여부를 결정해야 합니다.
- 리포트 점수(종합 88, 영역별 92/88/85/90)는 **예시 수치**이며 S5에 "예시 리포트" 스티커와 "점수는 예시 화면입니다" 문구를 넣었습니다.
- "수업 12개", "강사 열 명" 같은 훅 수치는 연출용 설정값입니다.

## 프로젝트 구조

```
src/
  Root.tsx                  # Showreel(16:9) 컴포지션
  Showreel.tsx              # TransitionSeries 타임라인 + 커스텀 전환(연두 스윕·아이리스·줌 스루)
  scenes/Hook · Question · Reveal · Analysis · Dashboard · Value · Cta
  components/Flourish.tsx   # Highlighter · SketchCircle · Chars · RollingNumber · Burst · Dots · GlassCard · GhostWord
  components/Kinetic.tsx    # WordPop · MaskText · CountUp · DrawLine
  components/Ui.tsx         # Eyebrow · Chip · Sticker · Pop · Rise · 로고
  components/Backgrounds.tsx# IvoryStage(카메라 드리프트 포함) · LimeStage · PanelWipe · Grain
  lib/theme.ts              # v2 팔레트 · FPS · 길이(690f)
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

- **카피** — 각 씬 파일의 JSX 문자열과 상단 상수(`TAGS`, `AREAS`, `CTA_URL`).
- **타이밍** — `src/Showreel.tsx`의 `TIMELINE`(씬 길이, 전환 겹침 포함)과 `TRANSITIONS`(전환 길이). 합계 − 전환 합계 = 690이어야 합니다.
- **색** — `src/lib/theme.ts`. 연두는 도형·형광펜·칩에, Classin Green은 강조 텍스트·CTA에만.
- **BGM/SFX** — `Showreel.tsx`에 `<Audio src={staticFile("audio/bgm.mp3")} />`를 추가. 전환 시작 프레임(누적 `TIMELINE` − `TRANSITIONS`)에 whoosh를 올리면 모션과 맞습니다.

## 참고한 라이브러리

- **Remotion 4.0.533** — 프레임 결정론적 React 렌더, `spring`/`interpolate`, `@remotion/fonts`, `@remotion/transitions`(TransitionSeries + 커스텀 프레젠테이션).
- **HyperFrames**(`hyperframes` npm, HeyGen) — HTML/GSAP 타임라인 기반 영상 합성 CLI. 검토했으나 한글 폰트 번들과 스프링 물리 기반 키네틱 타이포에 Remotion이 더 직접적이라 엔진으로 채택하지 않았습니다.

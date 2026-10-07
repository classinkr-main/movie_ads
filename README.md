# Classin AI 커머셜 쇼릴 (20초)

Classin의 **AI 기능**(AI 강의 분석 · AI 학습 활동)을 키네틱 타이포그래피와 모션그래픽으로 소개하고,
**"지금 문의하기"** CTA로 끝나는 20초 커머셜 쇼릴입니다. [Remotion](https://www.remotion.dev/) 4 기반으로
모든 모션을 코드(React/TypeScript)로 작성해, 카피·수치·색을 바꾸고 다시 렌더할 수 있습니다.

| 산출물 | 규격 | 경로 |
| --- | --- | --- |
| 메인 (16:9) | 1920×1080 · 30fps · 20s · H.264 · bt709 | `out/classin-ai-showreel.mp4` |
| 세로 (9:16) | 1080×1920 · 30fps · 20s · H.264 · bt709 | `out/classin-ai-showreel-9x16.mp4` |

## 콘텐츠 출처

- **AI 강의 분석 기능 소개 (2026.04.23)** — Notion `클래스인 신규 업데이트 안내 모음 / 2026.04`.
  "수업 녹화본에서 자동으로 강의 품질을 진단", 4개 영역 · 11개 항목(수업 전달 / 수업 분위기 / 수업 상호작용 / 언어 표현),
  리포트 확인 위치(관리자 대시보드 → 교사 개발, 클래스인 앱 → 수업 다시보기)를 그대로 사용했습니다.
- **ClassIn 6.0.6 업데이트 (2026.04.23)** — 같은 Notion 모음. AI 학습 활동 3종(따라읽기 · 받아쓰기 · 외워말하기)과
  평가 기준(정확도 · 유창성 · 완성도)을 사용했습니다.
- **브랜드 토큰·카피** — `classinkr-web/DESIGN.md`(Classin Green `#084734`, Page White `#FAFAF8`, 웜 뉴트럴),
  `lib/classin-positioning.ts`의 heroHeadline("좋은 수업을, 강사의 개인기에서 학원의 시스템으로"), 로고 PNG.
- CTA URL은 사이트 정본 도메인 `classin.co.kr/contact`(`lib/seo.ts` SITE_URL 기본값)입니다.

### 마케팅 검수 시 참고할 사실 관계

- Notion 원문 기준 **AI 강의 분석은 현재 중국어 수업에만 제공**되며(데이터 학습은 한국어 포함 가능), **실시간 수업**에만
  적용됩니다(수동 업로드 녹화 미지원). 영상은 언어를 단정하지 않도록 썼지만, 집행 전 이 범위를 자막·랜딩에서 안내할지 결정이 필요합니다.
- 리포트 점수(종합 88, 영역별 92/88/85/90, 활동별 98/95/97)는 **예시 수치**이며 영상 안에 "점수는 예시 화면입니다"를 표기했습니다.
- "오늘도 수업 12개가 끝났습니다", "강사 열 명" 같은 훅 수치는 연출용 설정값입니다.

## 씬 구성 (30fps · 600f)

| # | 프레임 | 길이 | 내용 | 주요 모션 |
| --- | --- | --- | --- | --- |
| S1 훅 | 0–72 | 2.4s | "오늘도 수업 12개가 끝났습니다." | 단어 펀치-인, 카운터 1→12, 타임코드, 12틱 점등 |
| S2 질문 | 72–132 | 2.0s | "그 수업, 다 들어볼 수 있을까요?" | 녹화본 카드 12장 스택, "다" 강조·흔들림 |
| S3 리빌 | 132–222 | 3.0s | ClassIn AI 강의 분석 | 글자 마스크 리빌, 음성 파형 + 스캐너, 분석 축 태그 |
| S4 파이프라인 | 222–300 | 2.6s | 실시간 녹화 → AI 분석 → 강의 리포트 | 노드 팝, 커넥터 드로우, 칩 비행, 점수 배지 |
| S5 리포트 | 300–405 | 3.5s | 4개 영역 · 11개 항목 | 종합 점수 링, 영역 바 카운트업, 11개 항목 칩 캐스케이드 |
| S6 AI 학습활동 | 405–483 | 2.6s | 따라읽기 · 받아쓰기 · 외워말하기 | 3D 카드 회전 진입, 점수 팝 + 링 버스트 |
| S7 밸류 | 483–543 | 2.0s | 좋은 수업을, ~~강사의 개인기에서~~ 학원의 시스템으로 | 브랜드 그린 플래시, 취소선·밑줄 드로우 |
| S8 CTA | 543–600 | 1.9s | 로고 + **지금 문의하기 →** + URL | 펄스 링, 화살표 너지, 엔드카드 홀드 |

씬 경계마다 기울어진 2장 패널 와이프(`PanelWipe`)가 방향을 바꿔가며 지나가고, 전체에 미세 그레인이 얹힙니다.

## 프로젝트 구조

```
src/
  Root.tsx              # Showreel(16:9) · ShowreelVertical(9:16) 컴포지션 등록
  Showreel.tsx          # 씬 타임라인(SCENES) + 와이프 지점(WIPES)
  scenes/S1Hook.tsx … S8Cta.tsx
  components/Kinetic.tsx     # WordPop · MaskText · CountUp · DrawLine
  components/Ui.tsx          # Text · Eyebrow · Chip · Pop · Rise · 로고 · PulseRings
  components/Backgrounds.tsx # DarkStage · LightStage · BrandStage · PanelWipe · Grain
  lib/theme.ts          # 브랜드 색 토큰 · FPS · 길이
  lib/motion.ts         # 스프링 프리셋(PUNCH/SNAP/SMOOTH) · 이징
  lib/fonts.ts          # Pretendard 6굵기 로드(@remotion/fonts)
  lib/layout.ts         # 16:9 기준 치수를 세로 캔버스로 환산하는 단위(u)
public/fonts/           # Pretendard (SIL OFL 1.1, LICENSE-Pretendard.txt)
public/brand/           # Classin 마크·워드마크·스택 로고
```

## 실행

```bash
npm install
npm run dev              # Remotion Studio (http://localhost:3000) — 타임라인에서 씬별로 확인
npm run render           # out/classin-ai-showreel.mp4
npm run render:vertical  # out/classin-ai-showreel-9x16.mp4
npm run typecheck
```

Chrome Headless Shell이 없는 환경에서는 Remotion이 자동으로 내려받습니다. 이미 설치된 브라우저를 쓰려면
`REMOTION_BROWSER_EXECUTABLE=/path/to/headless_shell`을 지정합니다(`remotion.config.ts`).

## 수정 가이드

- **카피** — 각 씬 파일 상단 상수(`TITLE`, `TAGS`, `AREAS`, `CARDS`, `CTA_URL`)와 JSX 문자열.
- **타이밍** — `src/Showreel.tsx`의 `SCENES`(from/duration)와 `WIPES`(at). 씬 내부 지연은 `delay` 프레임 값.
- **색** — `src/lib/theme.ts`. CTA·강조는 Classin Green(`#084734`)과 로고 그린(`#009060`) 두 가지만 씁니다.
- **BGM/SFX** — `Showreel.tsx`에 `<Audio src={staticFile("audio/bgm.mp3")} />`를 추가하면 됩니다. 와이프 지점(`WIPES[].at`)에
  `<Sequence from={at - 4}>`로 whoosh를 올리면 모션과 맞습니다. 현재 영상은 무음입니다.

## 참고한 라이브러리

- **Remotion 4.0.533** — 프레임 결정론적 React 렌더, `spring`/`interpolate`, `@remotion/fonts`, `@remotion/transitions`(패널 와이프는 커스텀 구현).
- **HyperFrames**(`hyperframes` npm, HeyGen) — HTML/GSAP 타임라인 기반 영상 합성 CLI. 검토했으나 Pretendard 폰트 번들·세로 변형·
  스프링 물리 기반 키네틱 타이포에 Remotion이 더 직접적이라 엔진으로 채택하지 않았습니다. 이 저장소의 씬 구조(상수 → 타임라인 → 컴포넌트)는
  필요 시 HyperFrames 컴포지션으로도 옮길 수 있게 유지했습니다.

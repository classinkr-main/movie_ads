# Classin AI 커머셜 쇼릴 (25초, v3)

**"Classin AI로, 수업을 업그레이드."** — Classin의 AI 기능 다섯 가지를 에디토리얼 톤의 키네틱 모션그래픽으로 소개하고
**"지금 문의하기"** CTA로 끝나는 25초 가로(16:9) 커머셜 쇼릴입니다. [Remotion](https://www.remotion.dev/) 4 기반이라
카피·수치·색·타이밍을 코드에서 바꾸고 다시 렌더할 수 있습니다.

| 산출물 | 규격 | 경로 |
| --- | --- | --- |
| 메인 (16:9) | 1920×1080 · 30fps · 25s · H.264 · yuv420p bt709 · 무음 | `out/classin-ai-showreel.mp4` |

> v1(20초 다크 톤 · 9:16 포함)과 v2(23초 AI 강의 분석 단독)는 git 히스토리에 남아 있습니다.

## 디자인 톤 (v3)

- **베이스**: 화이트·아이보리(`#FFFFFF` / `#FAF8F2` / `#F3EFE4`), 헤어라인 그리드, 느린 카메라 드리프트
- **포인트**: 연두 그린(`#C8F05A` 형광펜·칩·스티커·전환 띠, `#8BC926` 선·아이콘·거대 아웃라인 인덱스, `#3C6B12` 소문자)
- **강조 텍스트·CTA 채움**: Classin Green `#084734`
- **에디토리얼 장치**: 좌측 챕터 레일(01–05), 상단 "Classin AI · 01 — 05" 라벨, 기능별 거대 아웃라인 번호 워터마크, 유리 카드 UI 목업

## 스토리 (7씬 · 750f)

| # | 글로벌 프레임 | 길이 | 내용 | 카드 UI · 모션 |
| --- | --- | --- | --- | --- |
| S1 오프닝 | 0–110 | 3.7s | "Classin AI로, 수업을 업그레이드." + 5개 기능 목차 스트립 | 거대 "AI" 아웃라인, 로고 낙하 + 버스트, 글자 회전 스태거, 형광펜 |
| 01 AI 강의 평가 | 90–220 | 4.3s | 녹화된 수업을 AI가 4개 영역 11개 항목으로 평가 | 파형 스캐너 → 종합 링 88 + 영역 바 롤링 숫자 |
| 02 AI 스크립트 · 강의 요약 | 202–326 | 4.1s | 타임스탬프 스크립트 → AI 요약 한 장 | 스크립트 줄 스트리밍, 핵심 줄 형광, 요약 패널 팝 |
| 03 AI 숙제 출제 · 채점 | 308–432 | 4.1s | 수업 범위로 출제, 제출 즉시 채점 | 출제→채점 토글, 문항 생성, ✓/✗ 스탬프, 80점 배지 + 버스트 |
| 04 AI 자동 번역 · 실시간 자막 | 414–538 | 4.1s | 말하는 순간 번역 자막 | LIVE 교실 프레임, 한국어→영어 타이핑 자막, 언어 칩 순환 |
| 05 AI 에이전트 | 520–668 | 4.9s | 원하는 AI 비서 세팅(역할·말투·근거·모델), 강의 기반 Q&A, 학생 성취도 상담 | 설정 패널 + 채팅(타이핑 인디케이터, 근거 답변, 성취도 차트, 상담 포인트 칩) |
| S7 CTA | 644–750 | 3.5s | "Classin AI로, 수업을 업그레이드" + 5개 기능 칩 + 지금 문의하기 | 버스트, 펄스 링 버튼, URL |

전환: 연두 스윕(오프닝→01) → 패럴랙스 푸시 ×4(기능 사이) → 연두 아이리스(05→CTA). 챕터 레일과 상단 라벨은 기능 씬 동안 고정됩니다.

## 콘텐츠 출처와 검수 참고

- 기능 구성(강의 평가 / 스크립트·요약 / 숙제 출제·채점 / 자동 번역·실시간 자막 / AI 에이전트)은 마케팅 측 지시 목록을 따릅니다.
  AI 강의 평가의 4개 영역 11개 항목·리포트 위치는 Notion "AI 강의 분석 기능 소개 (2026.04.23)" 원문입니다.
- **AI 강의 평가는 Notion 기준 현재 중국어 수업·실시간 수업에만 제공**됩니다. 영상은 언어를 단정하지 않습니다.
- 02·03·04·05의 UI는 **콘셉트 목업**이며 스크립트 본문은 스켈레톤 바로 추상화했습니다. 자막 예문(한국어→영어)과 언어 칩(English·中文·日本語·Tiếng Việt),
  에이전트의 "모델 선택(기본·경량·고급)"은 연출 설정값이므로 실제 지원 범위에 맞춰 조정이 필요합니다.
- 점수(88, 92/88/85/90, 80점 4/5)와 "제출 24/28", "제출률 92%"는 예시 수치입니다.
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
  lib/theme.ts              # 팔레트 · FPS · 길이(750f)
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
- **타이밍** — `src/Showreel.tsx`의 `TIMELINE`(씬 길이, 전환 겹침 포함)과 `TRANSITIONS`. 합계 − 전환 합계 = 750.
- **색** — `src/lib/theme.ts`.
- **BGM/SFX** — `Showreel.tsx`에 `<Audio src={staticFile("audio/bgm.mp3")} />` 추가. 전환 시작 프레임은 `starts` 배열 참고.

## 참고한 라이브러리

- **Remotion 4.0.533** — 프레임 결정론적 React 렌더, `spring`/`interpolate`, `@remotion/fonts`, `@remotion/transitions`(TransitionSeries + 커스텀 프레젠테이션).
- **HyperFrames**(`hyperframes` npm, HeyGen) — HTML/GSAP 타임라인 기반 영상 합성 CLI. 검토했으나 한글 폰트 번들과 스프링 물리 기반 키네틱 타이포에 Remotion이 더 직접적이라 엔진으로 채택하지 않았습니다.

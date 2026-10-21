# Classin 광고 영상 (Remotion)

| 영상 | 규격 | 경로 |
| --- | --- | --- |
| 광저우 탐방 브이로그 × Classin (9:16) | 1080×1920 · 30fps · 30s · H.264 · AAC 48kHz · -14 LUFS | `out/guangzhou-vlog.mp4` |
| Classin AI 커머셜 쇼릴 (16:9) | 1920×1080 · 30fps · 30s · H.264 · 무음 | `out/classin-ai-showreel.mp4` |

## 광저우 탐방 브이로그 × Classin (30초, 세로)

"2026 글로벌 교육 인사이트 · 광저우"(2026.01.22–24, 한국 교육 리더 방문단) 현장 촬영본으로 만든 브이로그형 광고입니다.
릴스·쇼츠·틱톡용 9:16이며, 마지막 5초에 "광저우에서 만난 수업의 미래, 이제 우리 학원에서." → Classin 엔드카드로 이어집니다.

### 구성 (900f · 120BPM — 모든 컷이 한 박(15f) 그리드 위)

| 구간 | 프레임 | 내용 |
| --- | --- | --- |
| 훅 | 0–90 | "중국 교실은 / 지금 어디까지 / 왔을까?" — 주강신도시 빌딩숲 → 야경 → 휩 업 → 광저우타워 + "그래서, 직접 보고 왔습니다" |
| 항로 | 90–150 | 줌 스루 → 동아시아 도트 맵, 한국 → 광저우 비행 + "3일간의 교육 탐방" |
| 타이틀 | 150–210 | 드롭 임팩트(플래시·셰이크·색수차) — 공항 현수막(실제 행사명) 위 "Global Education Insight · 광저우 广州" |
| DAY 1 | 210–390 | DAY 와이프 → 버스 창밖 주강 · 광장 · 환영 만찬(현장 박수) · 야식 폴라로이드 · 광저우 타워(줌 블러) · 무지개 타워 |
| DAY 2 | 390–630 | 교육기관 방문 · 교류단 복도 입장 · 환영 배너 → 강당 리빌(속도 램프) · 딤섬 폴라로이드 · 온라인 강의 스튜디오 · 연회(현장 환호) |
| DAY 3 | 630–750 | 파저우 빌딩 · EEO 로고 월 · Classin 스마트 교실 · Classin 보드 시연 · 차 · 단체 사진 폴라로이드 |
| 메시지 | 750–810 | 브랜드 드롭 — "광저우에서 만난 수업의 미래," |
| 엔드카드 | 810–900 | 그린 아이리스 → "이제, 우리 학원에서." · Classin 로고 · 수업 시스템 OS · 지금 문의하기 · classin.co.kr |

### 편집·이펙트

- **색**: 아이폰 16 Pro 4K 120fps HLG 원본 → hable 톤매핑 → 자체 룩 LUT 3종(주간·야간·사진, `scripts/guangzhou/make_lut.py`).
- **리타이머** (`scripts/guangzhou/prep_clip.py`): PCHIP 속도 램프 + 180° 셔터 모션블러(120fps 프레임 블렌딩), 컷마다 8f 핸들 → 1440×2560 클립.
- **전환**: 휩 팬(방향성 모션블러), 줌 블러, 줌 스루, 임팩트(플래시·셰이크·RGB 분리), 셔터, DAY 와이프, 그린 아이리스 — `src/guangzhou/GuangzhouVlog.tsx`.
- **그래픽**: 키네틱 타이포(Pretendard), 손글씨 캡션(나눔펜, 쓰기 리빌 + 밑줄), 위치 칩, 필름 날짜 각인(DSEG7), 폴라로이드 포토덤프, 비트 펄스, 라이트 릭, 필름 그레인, 비네트.
- **오디오** (`scripts/guangzhou/make_audio.py`): BGM(120BPM F장조, 인트로 → 드롭 → 빌드업 → 브랜드 드롭)·효과음·현장음 믹스를 직접 합성 — 샘플·라이선스 음원 없음. -14 LUFS / True Peak -1.5 dBTP.

### 카피·사실 확인 참고

- 행사명 "2026 글로벌 교육 인사이트 · 광저우"와 "한국 교육 리더 방문단"은 현장 현수막(韩国教育领袖访华团) 기준, 날짜는 촬영 메타데이터(2026-01-22~24) 기준입니다.
- 현수막 번역 자막은 "热烈欢迎韩国教培交流团莅临交流"의 의역입니다. 방문 기관명은 자막에 쓰지 않았습니다(화면 속 간판·배너로만 노출).
- 3일차 장소는 EEO(Classin 개발사) 로고 월과 Classin 보드가 있는 교실 촬영본입니다.
- 브랜드 카피는 `classinkr-web` 정본(카테고리명 "수업 시스템 OS", 보이스 헌장)을 따랐고, 회사 수치는 넣지 않았습니다.
- 행사 참가자 얼굴이 나옵니다. 외부 게시 전에 출연자 동의 범위를 확인해 주세요.

### 실행

```bash
npm run render:guangzhou                    # out/guangzhou-vlog-master.mp4(CRF 17) → out/guangzhou-vlog.mp4(업로드용 2-pass 9Mbps)
python3 scripts/guangzhou/prepare.py        # 소스 재생성: Drive 원본 → 컷·사진·현장음·BGM (public/guangzhou)
node scripts/guangzhou/stills.mjs <dir> 180 400 780   # 지정 프레임 스틸 확인
```

- 타임라인(컷·전환)은 `src/guangzhou/timeline.json` 하나가 영상과 효과음 배치를 함께 결정합니다. 컷 길이를 바꾸면 `make_audio.py`를 다시 돌립니다.
- 컷 구간·속도 램프는 `scripts/guangzhou/shots.json`, 캡션 문구는 `GuangzhouVlog.tsx`의 `ShotDecor`·`GlobalCaptions`, 엔드카드는 `scenes.tsx`의 `EndCard`.
- 서체: 나눔펜·Instrument Serif·Noto Serif SC(서브셋)·DSEG7 — 모두 SIL OFL 1.1 (`public/guangzhou/fonts/LICENSE-*`).

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

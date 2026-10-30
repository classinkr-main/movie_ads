# Classin 쇼릴 v5 — "남는 수업" (22초 · 60fps)

**"수업이 끝나면, 수업은 어디로 갈까?"** 라는 Vox식 질문으로 열고, 비트 드롭과 함께 **"미래의 학원은, 남긴다."** 로 뒤집은 뒤
**"좋은 수업을, 학원의 시스템으로."** 와 Classin 로고·쇼룸 CTA로 끝나는 22초 가로(16:9) 브랜드 쇼릴입니다.
뮤직비디오 커머셜의 비트 컷·슬램 타이포에 Vox 해설 영상의 지면·주석·지도 문법을 섞었고, 대상은 교육·미래·학원(원장·운영 책임자)입니다.
[Remotion](https://www.remotion.dev/) 4 기반이라 카피·사진·색·타이밍을 코드에서 바꾸고 다시 렌더할 수 있으며, 음악도 코드로 합성합니다.

| 산출물 | 규격 | 경로 |
| --- | --- | --- |
| 메인 (16:9) | 1920×1080 · **60fps** · **22.0s (1320f)** · H.264 yuv420p bt709 · AAC 스테레오 | `out/classin-showreel-v5.mp4` |
| 사운드트랙 | 자체 합성 원곡 · 120 BPM · 48kHz 16bit 스테레오 WAV · −14 LUFS · 트루피크 −1 dBTP 이하 | `public/audio/classin-v5.wav` |

> v1(20초 다크 톤 · 9:16 포함), v2(23초 AI 강의 분석 단독), v3(25초 5개 기능 · 스켈레톤 UI), v4(30초 Classin AI 5개 기능 · 중2 국어 예시 수업, 커밋 `692395e`)는 git 히스토리에 남아 있습니다.

## 컨셉 — 남는 수업

판서는 지워지고, 설명은 흩어지고, 노하우는 강사와 함께 퇴근한다 → Classin에서는 **판서는 파일로, 설명은 영상으로, 복습은 앱으로, 운영은 데이터로** 남는다.
드롭("남긴다.")부터 캠코더 **REC HUD**가 화면을 감싸며 타임코드가 흐르고, 엔드 카드에서 **SAVED** 로 바뀌며 "수업이 남았다"로 닫힙니다.

- **뮤직비디오 커머셜** — 120 BPM 그리드(1박 = 30f)에 맞춘 하드 컷, 슬램 타이포(스프링 + RGB 분리 잔상 + 셰이크), 8분음표 스트로브, 대형 아웃라인 마퀴, 링·스피드 라인
- **Vox 해설** — 모눈종이 지면, 타자기 타이핑, 형광펜, 손그림 동그라미·화살표·밑줄·취소선, 종이 라벨, 고무 도장, 테이프 붙인 컷아웃 사진, 하프톤 망점, 노선도·한국 지도·점묘 세계지도, 출처 캡션

## 디자인 — 파스텔 연두 지면

- **색**: 배경은 파스텔 연두 `#E2F4B9`(무대) · `#EDF8D4`(모눈종이 지면)이고 글자는 잉크 `#0A0B14`입니다. 포인트는 코발트 `#2F3CFF`(UI·블록·노선도 역)와 시그널 오렌지 `#FF5A1F`(손그림 첨삭·핀·도장), 보조 글자·점은 올리브 `#4A6B12`. 실제 학원 사진·영상이 깔리는 컷(챈트 A박·미래 교실 사진 컷·피날레)만 어둡고, 소등 순간(3.4–4.0s)은 잉크 화면입니다. `src/lib/theme.ts`
- **서체**(모두 SIL OFL 1.1, `public/fonts/`): Hahmlet(한글 헤드라인, 가변 100–900) · IBM Plex Sans KR(라벨·UI) · Anton(숫자·영문) · IBM Plex Mono(캡션·타임코드)
- **로고**: 엔드 카드는 공식 컬러 로고(`public/brand/classin-mark.png` + `classin-wordmark.png`)를 연두 위에 그대로 씁니다.

## 스토리 (10씬 · 1320f · 11마디)

모든 씬 경계와 히트 프레임은 `src/data/cues.json` 한 곳에 있고, 영상과 사운드트랙이 함께 읽습니다.

| # | 프레임 | 마디 | 화면 |
| --- | --- | --- | --- |
| S1 훅 | 0–120 | 1 | 모눈종이 위 타자기 "수업이 끝나면, / 수업은 어디로 갈까?" — "어디로" 형광펜, "?" 동그라미 |
| S2 상실 | 120–240 | 2 | 아래 지면으로 휩 팬 → 부산 학원 수업 사진(컷아웃·흑백): ① 판서는, 지워지고(지우개가 칠판을 지움) ② 설명은, 흩어지고(말풍선이 점으로 흩어짐) ③ 노하우는, 퇴근한다(도장) → 소등, "미래의 학원은," 타이핑 |
| S3 드롭 | 240–270 | 3 | 파스텔 연두 위 "남긴다." 슬램 + 링·스피드 라인, REC 시작 |
| S4 챈트 | 270–510 | 3–5 | 한 박에 한 단어: 판서는, **파일로.**(EDB 교안 카드) · 설명은, **영상으로.**(녹화 플레이어) · 복습은, **앱으로.**(복습 앱) · 운영은, **데이터로.**(AI 강의 분석 리포트 — 점수 카운트업·역량 레이더·평가 차원 막대) |
| S5 미래 교실 | 510–600 | 5 | 8분음표 컷 6개(전자칠판·AI 카메라 누끼·AI 강의 분석 앱 화면·학원 수업·천안 학원 교실·전자칠판 양방향 수업 시연) + FUTURE CLASSROOM 마퀴(카메라 컷에서는 제품 뒤로 지나감) |
| S6 시스템 | 600–840 | 6–7 | "수업 시스템 OS" 노선도 — EDB 교안 → 전자칠판 → 수업 녹화 → 복습·LMS → 관리자 데이터(수업 전·중·후), 점선 루프 → "한 흐름으로." → 줌 스루 |
| S7 지도 | 840–960 | 8 | "서울에서 부산까지, 학원의 교실에서." 한국 지도에 8분음표마다 핀 8개 + 폴라로이드(서울 대치·서울 목동·평택·천안·청주·대구·울산·부산) |
| S8 글로벌 | 960–1080 | 9 | 점묘 세계지도 + 스톱타임 히트 3번: **160+ 개국 · 6만+ 교육기관 · 5,000만+ 교사·학습자** (EEO 공식 소개 기준 캡션) |
| S9 피날레 | 1080–1200 | 10 | 실제 학원 사진 8분음표 스트로브 위 "좋은 수업을, ~~강사의 개인기에서~~ **학원의 시스템으로.**" |
| S10 엔드 | 1200–1320 | 11 | Classin 로고 + 수업 시스템 OS + "목동 쇼룸에서 실제 수업 흐름 보기 →" + classin.co.kr, HUD SAVED |

## 사운드트랙 (자체 합성 원곡)

샘플·외부 음원 없이 `tools/music/compose.py`가 numpy/scipy로 모든 소리를 합성합니다(120 BPM, A단조로 열어 C장조로 닫는 퓨처팝). 저작권 걱정 없이 쓸 수 있고, `cues.json`을 바꾸면 소리도 다시 맞춰집니다. 악보(코드 진행·보컬 찹·훅)는 파일 상단 `CHORDS`·`DROP_CHOPS`·`HOOK`에 있습니다.

| 마디 | 구간 | 화성 | 편곡 |
| --- | --- | --- | --- |
| 1–2 | 인트로 | Am9 → Fmaj7 → G6 | 로파이 필터 건 FM 일렉트릭 피아노 + 유리 플럭 모티프 + 바이닐, 2마디부터 심장박동 킥·셰이커·라이저. 화면 타자기와 1:1인 타건음·형광펜·지우개·도장 폴리. 소등 순간 테이프 스톱 → 잔향까지 끊은 0.4초 침묵 → 숨소리 |
| 3–4 | 드롭·챈트 | F–G–Em–Am(왕도 진행) | 붐 + 크래시 + 4-on-the-floor(오픈 하이햇·고스트 스네어), 화면 단어(정박)마다 슈퍼소 + 일렉트릭 피아노 코드 히트, 사이 뒷박마다 포먼트 보컬 찹이 대답, 사이드체인 패드·옥타브 베이스 |
| 5 | 미래 교실 | F → G | 16분 트랜스 게이트 코드 + 보컬 스터터 → 보컬 글리산도 + 스네어 롤 |
| 6–7 | 시스템 | C–G/B–Am–F | 하우스 피아노 오프비트 + 16분 FM 아르페지오 + 림, 역마다 상행 벨, "한 흐름으로"에 보컬 롱톤, 탐 필 |
| 8 | 지도 | Dm7 → G7sus4 | 핀마다 상행 펜타토닉 플럭, 워킹 베이스, 16분 스네어 빌드 |
| 9 | 글로벌 | F · G · Am 히트 | 드럼이 멎는 스톱타임 히트 3번 → 스네어 롤 + 상행 보컬 + 라이저 |
| 10 | 피날레 | F → G | 풀 코러스, 슈퍼소 리드 훅 + 한 옥타브 아래 보컬 레이어 |
| 11 | 엔드 | Cmaj9 | 로고 히트에서 해결, 벨 반짝임, SAVED 비프, 0.9초 페이드 |

- 마스터: 드럼 버스 컴프·병렬 새추레이션, 대형 홀·룸 잔향, 저역 모노화, EQ·글루 컴프 → 룩어헤드 리미터, −14 LUFS(온라인 기준) · 트루피크 −1 dBTP 이하

## 소스 사진·영상과 검수 참고

| 소스 | 사용처 | 파일 |
| --- | --- | --- |
| 드라이브 `0. 사진창고/목동_수학의심장을달다` (2026-08-19) | 챈트 판서·운영, 지도 서울 목동, 피날레 | `public/photos/mokdong-*.jpg` |
| 드라이브 `0. 사진창고/울산 정원준수학` (2026-10-01) | 지도 울산 | `public/photos/ulsan-room.jpg` |
| 홈페이지 스톡 `classinkr-web/public/images/case-studies` | 상실 장면, 챈트, 지도, 피날레 | `public/photos/case-*.jpg` (+ 하프톤 `case-busan-dots.png`) |
| 홈페이지 스톡 `classinkr-web/public/images/product/hw` | 미래 교실 — 전자칠판 `hw-board-stand.jpg` = `hero/hero-board-stand.png`, AI 카메라 누끼 `hw-camera-cutout.png` = `camera/camera-dual-premium.png`을 `tools/assets/cutout_dark.py`로 오려냄(저장소의 `camera-dual-premium-cutout.png`는 알파가 뒤집혀 있음), 9.5초 교실 컷 `jayscan-room.jpg` = `sizes/room-86-jayescan` · 노선도 카드 | `public/photos/hw-*`, `jayscan-room.jpg` |
| 드라이브 `202609_박람회` (2026-09-18, Classin 부스) | 미래 교실 마지막 컷 `06 / INTERACTIVE` — 전자칠판 양방향 수업 시연 | `public/photos/expo-dualscreen.jpg` |
| 홈페이지 스톡 `classinkr-web/public/video` — `home-hero.mp4`(글로벌), `쿼드러닝 수업_클립1.mp4`(국내 학원) | 녹화 플레이어·노선도 카드(`class`·`phone`), 미래 교실(`quad-board`), 챈트 복습(`quad-tablet`) | `public/clips/*.mp4` (해당 구간만 잘라 재인코딩) |
| 제공받은 Classin 앱 캡처 — 수업 다시보기 + AI 강의 분석(이름 등 개인정보 모자이크 처리본) | 미래 교실 9.0초 컷 `03 / AI ANALYSIS` | `public/photos/ai-analysis.jpg` |
| 제공받은 AI 강의 분석 예시 리포트(과학 · 전자기 유도 법칙의 이해와 적용, 93점) | 챈트 "데이터로." 카드의 수치를 코드로 다시 그림 | `src/scenes/Chant.tsx`의 `REPORT` |

- **초상권**: 학원 현장 사진·클립에 학생과 강사 얼굴이, 박람회 컷(`expo-dualscreen.jpg`)에 부스 직원과 관람객이 보입니다. 외부 송출 전 해당 학원·인물의 사용 동의 범위를 확인하세요. 지도에는 학원명이 아니라 지역명만 표기했습니다.
- **글로벌 클립**(`class.mp4`·`phone.mp4`)은 홈페이지 히어로 영상(EEO 글로벌 소재)에서, `quad-*.mp4`는 홈페이지의 국내 학원 수업 클립에서 잘랐습니다. 광고 집행 범위가 홈페이지와 다르면 사용 범위를 확인하세요. 하드웨어 이미지 일부는 렌더(생성) 이미지입니다.
- **수치**: 160+개국 · 6만+ 기관 · 5,000만+ 명은 classinkr-web `docs/active/brand-canon/company-facts.md`의 EEO 공식 소개(classin.com) 기준 전 세계 누적값이며, 화면에 같은 출처 캡션을 넣었습니다. 국내 도입 기관 수는 쓰지 않았습니다.
- **카피**: 카테고리명 "수업 시스템 OS", 피날레 문장 "좋은 수업을, 강사의 개인기에서 학원의 시스템으로"(홈 히어로 헤드라인), CTA "목동 쇼룸에서 실제 수업 흐름 보기"는 `lib/classin-positioning.ts` 정본을 그대로 따릅니다. 챈트의 EDB 파일명·녹화 시간·복습 앱 목록은 연출용 예시입니다. "데이터로." 카드의 AI 강의 분석 수치(93점·평가 차원 5개·역량 레이더)는 제공받은 예시 리포트 값을 그대로 옮겼고, 레이더 축 이름은 원본에서 잘려 보여 퍼센트만 표기했습니다.
- **광과민**: 풀 화이트 플래시는 드롭(4.0s)과 로고(20.0s) 두 번뿐이고, 나머지 플래시는 강도 0.22–0.5, 초당 3회 이하입니다.
- **지도 데이터**: 한국 시도 경계는 [southkorea-maps](https://github.com/southkorea/southkorea-maps)(KOSTAT 2013 간소화), 세계 육지는 [world-atlas](https://github.com/topojson/world-atlas)(Natural Earth 110m)를 투영해 `src/data/geo.json`으로 구웠습니다.

## 프로젝트 구조

```
src/
  Root.tsx                  # Showreel(16:9 · 60fps · 1320f) 컴포지션
  Showreel.tsx              # 씬 시퀀스 + REC HUD · 그레인 · 비네트 + 사운드트랙
  data/cues.json            # 타이밍 SSOT(씬 경계 · 타자기 · 히트 프레임) — 사운드트랙과 공유
  data/geo.json             # 한국 시도 경계 path · 핀 좌표 · 점묘 세계지도 좌표
  scenes/Intro(S1–2) · Drop · Chant · Future · System · MapScene · Scale · Finale · End
  components/Stage.tsx      # GraphPaper · LimeStage · Grain · Vignette · Camera
  components/Media.tsx      # Photo · Clip · Cutout · Tape
  components/Marks.tsx      # Vox 주석: HandCircle · HandArrow · HandLine · Highlighter · Tag · Stamp
  components/Type.tsx       # Typewriter · Slam · MaskUp · Counter · Caption
  components/Fx.tsx         # Flash · Rings · SpeedLines · LightLeak · Marquee
  components/Hud.tsx        # 캠코더 REC HUD(타임코드 → SAVED)
  components/Icons.tsx      # 노선도 역 아이콘
  lib/theme.ts · motion.ts · fonts.ts
public/photos · clips · brand · fonts · textures · audio
tools/music/compose.py      # 사운드트랙 합성기
tools/assets/halftone.py    # 사진 → 하프톤 망점 PNG
tools/assets/cutout_dark.py # 검은 배경 제품 사진 → 알파 누끼 PNG(pymatting)
tools/stills.mjs            # 검수용 스틸 일괄 렌더
```

## 실행

```bash
npm install
npm run dev        # Remotion Studio — 타임라인에서 씬·히트 확인
npm run render     # out/classin-showreel-v5.mp4
npm run stills     # 1초 간격 검수 스틸 → out/preview-*.jpg
npm run music      # 사운드트랙 재합성 → public/audio/classin-v5.wav (numpy · scipy · numba · pyloudnorm 필요)
npm run typecheck
```

Chrome Headless Shell이 없으면 Remotion이 자동으로 내려받습니다. 설치된 브라우저를 쓰려면 `REMOTION_BROWSER_EXECUTABLE`을 지정합니다.

## 수정 가이드

- **타이밍** — `src/data/cues.json`만 고친 뒤 `npm run music` → `npm run render`. 1박 = 30f, 1마디 = 120f.
- **카피** — 각 씬 파일 상단 상수와 JSX 문자열(`PAIRS`, `STATIONS`, `PLACES`, `STATS` 등). 타자기 문장은 `cues.json`의 `typing`.
- **사진 교체** — `public/photos/`에 넣고 씬의 파일명·`pos`(object-position)를 바꿉니다. 하프톤이 필요하면 `python3 -I tools/assets/halftone.py <입력> <출력.png>`, 검은 배경 제품 사진의 누끼는 `python3 -I tools/assets/cutout_dark.py <입력> <출력.png> <미리보기.jpg>`(pymatting 필요).
- **색·서체** — `src/lib/theme.ts`, `src/lib/fonts.ts`.
- **음악 교체** — 라이선스 음원을 쓰려면 `public/audio/classin-v5.wav`를 같은 길이(22.0s, 120 BPM이면 비트가 맞음)로 덮어쓰면 됩니다.

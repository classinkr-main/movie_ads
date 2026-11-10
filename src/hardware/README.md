# Classin Board 하드웨어 광고 (45초)

**"공간이 바뀌면, 공부가 바뀝니다."** — 전자칠판 하드웨어 자체를 시네마틱 톤으로 보여주는 45초 가로(16:9) 광고입니다.
다크 베이스에 제품 사진을 느리게 푸시인(켄 번즈)하고, 사진 속 화면 영역에는 실제 Classin UI를 투영 변환(homography)으로 끼워 넣었습니다.
다섯 챕터(디자인 · 디스플레이 · 퍼포먼스 · AI 트래킹 카메라 · 생태계)와 라인업·CTA 엔드카드로 구성됩니다.

| 영상 | 컴포지션 | 규격 | 경로 |
| --- | --- | --- | --- |
| Classin Board 하드웨어 광고 (45초) | `Hardware` | 1920×1080 · 30fps · H.264 · yuv420p bt709 · 무음 | `out/classin-board-hardware.mp4` |

## 디자인 톤

- **베이스**: 거의 검정(`#070908` / `#0D1110`), 라디얼 글로우, 필름 그레인, 비네팅. 오프닝과 CTA에서만 2.0:1 레터박스.
- **포인트**: 민트(`#6EE7B7`) 스펙 수치·레티클·연결선, 브랜드 그린(`#00A36C`) CTA 채움. AI 쇼릴의 아이보리·연두와는 의도적으로 다른 톤.
- **타이포**: Pretendard. 헤드라인은 600 굵기, 한 줄씩 아래에서 마스크로 올라옴. 챕터 태그 `01 — DESIGN` + 가는 민트 라인.
- **사진 처리**: 색 보정은 렌더 시 CSS `filter`(brightness · contrast · saturate)와 그라데이션 셰이드로 걸고, 원본은 크롭·리사이즈만 합니다(`scripts/prep-hw-assets.py`).

## 스토리 (7씬 · 1350f)

| # | 글로벌 프레임 | 길이 | 사진 | 화면 속 장치 |
| --- | --- | --- | --- | --- |
| S0 오프닝 | 0–150 | 5.0s | 다크 스튜디오 스탠드 보드 | 빛줄기 스윕과 함께 보드가 드러남. "공간이 바뀌면, 공부가 바뀝니다." |
| 01 디자인 | 132–372 | 8.0s | **목동 쇼룸 실물 촬영본**(두 대 벽걸이) | 오른쪽 보드로 푸시인, 화면이 스캔라인과 함께 켜지며 Classin 판서 UI 표시 → 베젤 매크로·측면·벽걸이 모서리 트립틱 |
| 02 디스플레이 | 354–584 | 7.7s | 벽걸이 보드(다크) | 화면에 형광등 반사 띠가 지나가다 **AG 코팅** 라벨과 함께 사라짐 → 지문 6개가 찍혔다가 **AF 마감** 라벨과 함께 왼쪽부터 닦임. 4K UHD · 178° · 90% 투과율 |
| 03 퍼포먼스 | 566–786 | 7.3s | OPS 칩 | 보드 프레임 속 데스크톱에 창 3개(Classin 수업 · 교안.pptx · 브라우저)가 또각또각 열림, 펜 선이 지연 없이 그려짐, i5 · 16GB · 256GB · 0.03s, 지연 비교 바 |
| 04 AI 트래킹 카메라 | 768–1008 | 8.0s | **쇼룸 실물 상단 카메라 모듈** → 교실 판서 사진 | 카메라 모듈로 푸시인 → 강사를 따라가는 트래킹 레티클 + REC 00:12:40 + 4K 뱃지 → "수업 종료 · 영상 자동 업로드" 진행 바 |
| 05 생태계 | 992–1202 | 7.0s | — | 보드 카드 → Classin Cloud 허브 → 노트북(교사)·태블릿(학생)·스마트폰(학부모)·관리자 대시보드로 연결선이 그려지고 펄스가 흐름. 표준화 · 언제 어디서나 · 한 곳에서 관리 |
| S6 CTA | 1184–1350 | 5.5s | 65/75/86/110 라인업 | 스택 로고 + "교실의 기준이 되는 보드" + S65–S110 칩 + 지금 문의하기 + classin.co.kr/contact |

전환: 시네 디졸브(앞 씬 살짝 확대·어두워짐, 뒤 씬 줌아웃) × 5, 카메라→생태계는 가로 모션 블러 위프. 상단 워드마크·챕터 카운터(`DESIGN | 01 / 05`)와 하단 진행선은 챕터 씬 동안 고정.

## 사진 출처

- `classinkr-web/public/images/product/hw/**` — 제품 페이지용 이미지(스튜디오 렌더·교실 연출 사진). `hero-stand` · `bezel-macro` · `side-profile` · `bezel-wall` · `display-wall` · `teacher-writing` · `ops-chip` · `lineup`.
- `classinkr-web/public/images/home/` — 화면 콘텐츠로 쓴 실제 UI 스크린샷(`ui-board-class` 개인칠판 수업 화면, `ui-earth` 홈 히어로).
- **Google Drive `0. 사진창고 / 제품 사진, 전자칠판`** (2026-11-03 촬영) — `showroom-wall.jpg`(두 대 벽걸이, 4:3→16:9 크롭), `real-camera-bezel.jpg`(상단 카메라 모듈 크롭). 화면 네 꼭짓점 좌표는 스크립트가 검출해 `H1Design.tsx`에 상수로 들어 있습니다.
- 다시 만들려면: `python3 scripts/prep-hw-assets.py --web ../classinkr-web/public/images --drive <실물 사진 폴더>`

## 카피·수치 검수 참고

- 스펙은 `classinkr-web/lib/hardware/board-specs.ts`(규격서 정본)와 `/product/hw` 페이지 카피를 따랐습니다: AG/AF 강화유리, 4K(3840×2160), 178° 시야각, 90% 투과율·풀 라미네이션, i5 OPS 표준 탑재 · 16GB RAM · 256GB SSD, 0.03s 터치 응답(30ms, 일반 전자칠판 80–120ms), 4K AI 트래킹 카메라(자동 추적·줌·녹화), 라인업 S65·S75·S86·S110.
- "8mm 슬림 베젤 · 매트 화이트 마감"은 제품 페이지 카피 기준입니다. 두께·무게 같은 모델별 수치는 영상에 넣지 않았습니다.
- 퍼포먼스 씬의 데스크톱(창 제목·학생 이름·교안 제목)과 트래킹 씬의 REC 타이머, 업로드 진행 바는 **연출용 목업**입니다.
- "30일 만족 보장 · 설치와 교사 온보딩 포함"은 `/product/hw` ValueAnchor 섹션 문구입니다. 정책이 바뀌면 `H6Cta.tsx`를 고칩니다.
- CTA URL은 사이트 정본 도메인 `classin.co.kr/contact`.

## 수정 가이드

- **씬 길이·전환** — `src/hardware/Hardware.tsx`의 `HW_TIMELINE` / `HW_TRANSITIONS`. 합계 − 전환 합계 = 1350 이 아니면 빌드 시 에러.
- **카피** — 각 `src/hardware/scenes/H*.tsx` 의 `Lines` / `Fade` 안 문자열, 스펙은 `Spec` 컴포넌트의 `value`/`label`.
- **사진 교체** — `public/hw/` 에 같은 이름으로 넣거나 `Plate` 의 `src`·`w`·`h` 를 바꿉니다. 화면 합성이 있는 씬은 `Screen` 의 `quad`(이미지 픽셀 좌표 네 꼭짓점)도 함께 맞춥니다.
- **색** — `src/hardware/hwTheme.ts`.
- **BGM/SFX** — `Hardware.tsx` 에 `<Audio src={staticFile("audio/bgm.mp3")} />` 추가.

## 프로젝트 구조

```
src/hardware/
  Hardware.tsx              # Hardware(16:9) 타임라인 + 시네 디졸브·위프 전환 + 워드마크·챕터 카운터·진행선·레터박스
  scenes/H0Opening · H1Design · H2Display · H3Performance · H4Camera · H5Ecosystem · H6Cta
  Cine.tsx                  # Lines · Fade · ChapterTag · Spec · DarkStage · Plate(켄 번즈 플레이트) · Screen(투영 합성) · Shade · Vignette · Letterbox · LightSweep · FilmGrain · Reticle · Fingerprint
  hwTheme.ts                # 다크 팔레트 · 길이(1350f) · 챕터 목록
  homography.ts             # 사각형 → 사변형 matrix3d
scripts/prep-hw-assets.py   # 제품 사진 크롭·리사이즈, 쇼룸 사진 화면 꼭짓점 검출
public/hw/                  # 영상이 참조하는 사진
```

## 실행

```bash
npm run render:hw    # out/classin-board-hardware.mp4
npm run still:hw     # out/hw-still.png (300프레임)
```

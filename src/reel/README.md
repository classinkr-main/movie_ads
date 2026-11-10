# BrandReel — 24초 · 60fps 브랜드 쇼릴 (v8)

**"미래의 수업, 이미 학원에서 시작됐습니다."** → **"좋은 수업을, 강사의 개인기에서 학원의 시스템으로."** → **목동 쇼룸 CTA**.
학원 원장·교육기관 의사결정자를 겨냥한 다크 시네마틱 커머셜입니다. Drive `0. 사진창고`의 실제 학원·쇼룸 사진과
`classinkr-web/public/video`의 Classin 스톡 영상을 모션그래픽으로 묶었습니다.

| 컴포지션 | 규격 | 경로 |
| --- | --- | --- |
| `BrandReel` (v8) | 1920×1080 · **60fps** · 24s · H.264 · yuv420p bt709 | `out/classin-brand-reel-60fps.mp4` (무음) · `out/classin-brand-reel-60fps-guide-sfx.mp4` (가이드 사운드) |

> v8 변경: **녹화 비트**를 "수업이 끝나면 **즉시 업로드**, 보강까지"로 — REC 타임코드가 45:00에 멈추며 수업 종료 → 녹화본 즉시 업로드(진행률) →
> **[보강] 결석생도 앱에서 바로 다시보기** · **데이터 비트**에 클래스인 **AI 강의 분석 리포트** 룩(AI 강의 분석 · AI 요약 · AI 스크립트 탭,
> 월계수 종합 점수 93 AI Eval., 4대 영역 레이더 · 영역별 점수 · 개선 포인트, 수업 시간 배분 도넛 · 발화 분포 타임라인, 민트 AI 스캔) ·
> 녹화·데이터 카피 위 **음영 미니멀 아이콘**(카메라 · 데이터) · 엔드 CTA를 알약 대신 **12px 모서리의 매트 민트 플랫 버튼**(그레인 질감 · 헤어라인 · 구분선 · 얇은 화살표 · 한 번 스치는 광택).
> 리포트 카드가 인물을 가리지 않도록 데이터 비트 사진을 `academy-green`으로 바꾸고, 그리드의 그 자리는 `academy-teacher`로 옮겼습니다. 가이드 사운드에 종료 비프 · 업로드 차임 · 점수 카운트 틱을 더했습니다.
>
> v7 변경: 20초 → **24초**(섹션마다 여유 — 흐름 비트 1.1s → 1.33s, 칠판 3.2s → 4.3s 등) · 교안 비트 카드를 **EDB 교안 카드 덱**으로 재설계
> (Unit 5 세 페이지: 마인드맵 · 확인 문제 · 판서 템플릿, 저장 진행 → 저장됨) · 그리드 타일 디테일(지역 라벨 · 번호 · REC · 유리 · 회로선) ·
> 칠판 **질감**(분필 얼룩·지운 판서 흔적·분필 획·그레인·유리 반사)과 **수업 화면 UI**(툴바·상태 바·페이지 스트립·학생 영상 타일·Tip 메모·스타일러스·지우개 가루).
> v6(20초)·v5는 git 히스토리에 있습니다.

## 스토리 (6씬 · 1440f @60fps)

| # | 글로벌 프레임 | 길이 | 화면 |
| --- | --- | --- | --- |
| S1 훅 | 0–220 | 3.7s | 2.39:1 레터박스. 거대 타이포 "미래의 수업" — 글자 안에서 스톡 영상(SPACE TRAVEL 전자칠판, 0.57배 슬로모션)이 재생 → 글자로 줌스루하며 화면비가 16:9로 열림 + 플레어 → "이미, 학원에서 시작됐습니다." |
| S2 흐름 | 208–620 | 6.9s | 5비트 휩 몽타주(비트당 1.33s, 랙 포커스·라이트 릭): **판서**(EDB 저장) · **녹화**(카메라 모니터 너머 수업, REC 뷰파인더 → 45:00 수업 종료 → 즉시 업로드 → [보강] 다시보기, 음영 카메라 아이콘) · **교안**(EDB 교안 카드 덱 — 도입 마인드맵 · 확인 문제 정답 선택 · 판서 템플릿 아크를 스타일러스가 그림 → "우수 강사 템플릿으로 저장됨") · **복습**(자동 녹화 · LMS 다시보기) · **데이터**(같은 Unit 5 수업의 AI 강의 분석 리포트, 음영 데이터 아이콘). 상단 흐름 레일 |
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
- **AI 강의 분석 리포트**(데이터 비트): 레이아웃은 클래스인 다시보기 창의 [AI 강의 분석] 패널과 AI 강의 분석 보고서 화면(참고 이미지)을,
  평가 영역(4대 영역 · 11개 지표)은 `classinkr-web/scripts/refine-update-articles.ts`의 6.0.9 업데이트 문서를 따랐습니다. 점수·시간 배분은 예시 수치입니다.
- **녹화 즉시 업로드 · 보강**: `classinkr-web/lib/docs.ts` "녹화본은 클래스인 스토리지에 저장되고, 수업이 끝나면 교사와 학생이 앱에서 바로 봅니다"와
  포지셔닝 정본의 "수업 후 복습과 보강 흐름"을 근거로 썼습니다.
- 칠판 화면·플레이어·업로드 카드·AI 강의 분석 리포트·EDB 카드는 **예시 화면(콘셉트 목업)**이며 S4 좌하단과 리포트 카드 탭 줄에 "예시 화면" 라벨을 둡니다. 학생 이름(지민·도윤·서아)과 "강사 A"는 가상입니다.

### 외부 배포 전 확인할 것

- 사진 속 인물(원장·강사·참석자)과 학원 간판·화면의 **초상권·사용 동의** — 사진창고 소재라도 광고 집행 전 해당 학원 확인 권장.
- "자동 녹화" 표현은 실제 제공 방식(학원 설정에 따른 자동 녹화 범위)과 맞는지 확인하세요.
- "즉시 업로드"는 화면 연출입니다. 실제로는 수업 종료 뒤 인코딩 시간이 있고, 결석생 다시보기는 코스 [다시보기] 권한 설정을 따릅니다.
- AI 강의 분석은 부가가치 서비스로 켜야 쓰는 기능이고(관리자 대시보드 [교사 개발 옵션]에서 열람), 보이는 범위는 기관 설정과 계약에 따라 다릅니다.
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
  AiReport.tsx       # S2 데이터 비트의 AI 강의 분석 리포트 카드(탭 · 월계수 점수 · 레이더 · 영역별 점수 · 시간 배분)
  ShadedIcon.tsx     # S2 녹화·데이터 카피 위 음영 미니멀 아이콘(camera · data)
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
칠판 화면 내용 `HeroShot.tsx`의 `Lesson`, 교안 카드 `EdbDeck.tsx`, AI 리포트 영역·점수 `AiReport.tsx`의 `AREAS`·`SLICES`,
녹화 종료·업로드 타이밍 `scenes/S2Flow.tsx`의 `END_AT`·`UP_TO`, 수치 `scenes/S5Proof.tsx`의 `STATS`, 아크 `ARCS`, CTA `scenes/S6End.tsx`의 `Cta`.

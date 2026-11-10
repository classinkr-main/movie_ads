# 선생님들은 멘탈이 나가 버렸습니다 — ClassIn 자동 녹화 쇼릴

"~들은 완전히 멘탈이 나가 버렸습니다" 밈 형식의 **스토리형 3D 쇼릴**입니다. 더빙은 따로 녹음하는 것을 전제로 한 **무음 영상**이고,
대사 한 구절(쉼표 단위)마다 화면 동작이 하나씩 걸려 있습니다.

- 엔진: [Remotion](https://www.remotion.dev/) 4 + `@remotion/three`(Three.js) — 실제 3D 장면을 프레임마다 렌더
- 제작 방식: [OpenMontage](https://github.com/calesthio/OpenMontage) `animation` 파이프라인 · 아틀리에(직접 작성) 모드
- 스타일: **3D Vox** — 블록 장난감 디오라마(3D) 위에 Vox 해설 영상식 편집 주석(형광펜 자막·꼬리표·도장·큰 글자)

## 산출물

| 파일 | 규격 | 용도 |
| --- | --- | --- |
| `renders/final.mp4` | 1920×1080 · 30fps · H.264 · 무음 · 자막 포함 | 메인. 화면을 보며 더빙 |
| `renders/final-vertical.mp4` | 1080×1920 · 30fps · H.264 · 무음 · 자막 포함 | 쇼츠·릴스용 세로 |
| `deliverables/dubbing-script.md` | 문장별 시작·끝 타임코드 | 녹음용 대본 |
| `deliverables/narration-guide.srt` | 구절 단위 SRT | 편집 툴에 얹는 가이드 자막 |
| `deliverables/contact-sheet.jpg` | 장면별 대표 프레임 | 한눈에 보는 스토리보드 |

자막 없는 버전이 필요하면 `npm run mental:render:clean` 으로 뽑습니다(`renders/final-clean.mp4`).

알아 둘 점

- **무음**입니다. 더빙·음악·효과음은 들어 있지 않습니다(음악은 더빙 믹스 때 얹는 것을 전제로 뺐습니다).
- 세로 버전은 같은 3D 장면을 9:16 으로 다시 잡은 것입니다. 교실·연구소처럼 가로로 넓은 세트는 좌우가 잘려 보입니다.
- 렌더는 장면 18개를 나눠 뽑은 뒤 이어 붙입니다. 한 장면만 고쳤다면 `node projects/teachers-lost-their-minds/scripts/render-segments.mjs --only s05` 처럼 그 장면만 다시 렌더할 수 있습니다(세로는 `--vertical` 추가).
- OpenMontage 승인 게이트는 열려 있습니다: `checkpoint_proposal.json` 이 `awaiting_human`, 이후 단계는 초안(`in_progress`)으로 기록돼 있습니다. 콘셉트·'3D Vox' 해석을 확인해 주시면 완료로 바꿉니다.

## 더빙 워크플로

영상 타이밍은 **초당 6.3음절**(밈 쇼츠의 빠르고 건조한 낭독)로 추정해 잠갔습니다. 길이 2분 11초.

**A. 화면에 맞춰 녹음** — `final.mp4` 를 틀어 놓고 자막이 바뀌는 순간에 맞춰 읽습니다. 문장 시작 시각은 `deliverables/dubbing-script.md`.

**B. 편하게 녹음하고 영상을 목소리에 맞추기**

1. 원하는 속도로 녹음합니다.
2. Vrew·캡컷·프리미어 등으로 그 녹음의 자동 자막을 SRT 로 내보냅니다(어떻게 끊겨 있든, 오타가 조금 있든 상관없습니다).
3. 영상을 다시 맞춥니다.

```bash
npm run mental:sync -- path/to/녹음.srt
```

```bash
npm run mental:timeline
```

```bash
npm run mental:render
```

`mental:sync` 는 SRT 글자를 대본과 정렬해 `story/timing.ts` 의 `BEAT_SECONDS`(문장 길이)·`PHRASE_STARTS`(구절 시작)를 실제 녹음값으로 채웁니다.
3D 동작·카메라·자막·메모가 전부 그 값을 따라 움직입니다. 손으로 고쳐도 됩니다.

전체 속도만 바꾸고 싶으면 `story/timing.ts` 의 `PACE` 하나만 고치면 됩니다(느리게 읽으면 숫자를 낮춤).

## 실행

```bash
npm install
```

```bash
npm run mental:dev
```

```bash
npm run mental:render
```

```bash
npm run mental:render:vertical
```

```bash
npm run mental:snapshots
```

- GPU 가 없는 리눅스(클라우드·CI)에서는 소프트웨어 GL(`swangle`)로 렌더합니다 — `remotion.config.ts` 가 자동으로 고릅니다. 4코어 기준 1080p 한 편에 30~40분.
- 렌더 스크립트는 세그먼트를 CRF 16 으로 뽑고 납품본을 한 번 더 인코딩합니다(`CRF=22 npm run mental:render` 처럼 조절. 저장소의 파일은 CRF 22).
- 맥·윈도우에서 다른 GL 백엔드를 쓰려면 `REMOTION_GL=angle` 처럼 지정합니다.

## 이야기 구조 (4막 · 18장면)

| 막 | 장면 | 대사 | 화면 |
| --- | --- | --- | --- |
| 1 문제 | s01 전시대 | 옛날 선생님들은 완전히 멘탈이 나가 버렸습니다 | "옛날 선생님" 명판 위 피규어 셋 — 나선 눈, 식은땀, 영혼 가출 |
| | s02 교실 | 수업이 끝나면 일이 끝나질 않았거든요 / 보존해야 하니까요 | 종이 울리자 교탁에 일 더미 낙하 → 칠판 내용이 '보존' 상자로 |
| | s03 촬영 | 핸드폰을 세우고, 각도를 맞추고, 저장 공간을 확인하고요 | 삼각대·기울기·"저장 공간 97%" → 원본 파일 큐브가 쿵 |
| | s05 밤 편집 | 자르고, 붙이고, 용량을 줄이고, 자막을 넣고요 | 떠 있는 타임라인에 칼날·스냅·프레스·자막 띠, 시계는 새벽 2시 |
| | s06 업로드 | 어디에 올릴지 정하고, 폴더를 만들고, 링크를 공유하고요 | 구름 사이를 헤매는 파일 → 폴더 4단 → 휴대폰 5대 |
| | s08 시청 체크 | 미시청 학생을 찾고, 다시 안내하고, 확인을 받고요 | 계단석 12명의 표시등, 돋보기, 말풍선 |
| | s09 방전 | 너무 많은 에너지를 낭비하게 된 겁니다 | 머리 위 작업 블록 4단, 배터리 3% |
| 2 첫 시도 | s10 연구소 | 똑똑한 에듀테크 업체가… 촬영을 쉽게 해 보자고 했죠 | 할 일 넷 중 ①번만 동그라미 |
| | s11 장비 | 카메라를 달고, 마이크를 붙이고, 저장 장치를 늘렸습니다 / 그림으로는 가능해 보였습니다 | 장비 3종 → **화면 전체가 청사진으로** |
| | s12 스테이션 | 버튼을 누르고, 파일을 옮기고, 업로드하고, 체크까지… 그대로였죠 | 네 곳을 뛰어다니는 선생님, 다시 영혼 가출 |
| 3 해결 | s13 공사팀 | "선생님이 해야 하는 일을 통째로 시스템이 받자" | 크레인이 작업 블록 4단을 **통째로** 들어 시스템 상자에 |
| | s14 버튼 | 녹화 버튼 하나만 누르면 | 빨간 버튼, 바닥 파동 |
| | s15 자동화 | 자동으로 촬영 · 업로드 · 시청 체크 · 관리 | 펄스가 기계 4대를 차례로 켬, 메모의 항목이 '자동'으로 |
| | s16 나무 | 마치 땅에서 쭉 올라온 나무처럼… 흔들릴수록 더 단단하게 | 줄기가 솟아 수업 받침을 떠받침, 뿌리가 넓고 굵어짐 |
| 4 결과 | s17 소멸 | '수업 후 작업'이 완벽하게 사라졌습니다 | 블록이 터져 사라지고 할 일 메모가 날아감 |
| | s18 전시대 | 촬영 장비 · 밤샘 · 링크 · 시청 체크 | 유리 덮개 속 전시품이 되어 '은퇴' 도장 |
| | s19 교실 | 맘 편히 수업… 수업이 끝나면 진짜로 끝 | 영혼이 돌아오고, 교탁에는 잎 하나만 |
| | s21 엔드카드 | 클래스인 하나로요! | "요즘 선생님" 명판, 로고 |

아트 디렉션(팔레트·타이포·모션·시그니처 장치)은 [`art-direction.md`](art-direction.md).

## 코드 구조

```
index.tsx · Root.tsx        # 컴포지션 등록: TeachersMental(16:9) · TeachersMentalVertical(9:16)
Film.tsx                    # 프레임 → 장면 선택, 휩 팬·청사진 후처리, 오버레이 합성
story/
  timing.ts                 # ★ 더빙 타이밍 — 여기만 고치면 전체가 따라옴
  beats.ts                  # 대본 35비트(의뢰 원문 그대로) → 구절별 프레임
  scene-map.ts              # 장면 ↔ 비트 대응표
three/
  Stage.tsx                 # ThreeCanvas, 조명·그림자, 카메라 리그, 3D→화면 투영기
  kit.tsx                   # 블록 키트: 피규어(표정·포즈), 영혼, 소품 20여 종, 캔버스 인쇄면
overlay/
  kit.tsx                   # 꼬리표·큰 글자·도장·칩·종이 배경·와이프
  chrome.tsx                # 구절 자막, '수업 끝나고 할 일' 메모, 막 레일
scenes/
  sets.tsx                  # 교실 세트, 나무 구조, 작업 블록
  act1a · act1b · act2 · act3 · act4   # 장면 18개
scripts/
  timeline.ts               # 타임라인 JSON · 더빙 대본 · 가이드 SRT 생성
  sync-from-srt.ts          # 녹음 SRT → timing.ts
  build_artifacts.py        # OpenMontage 아티팩트 생성·스키마 검증
artifacts/                  # OpenMontage 단계별 아티팩트(JSON)
```

## 수정 가이드

- **대사 문구** — `story/beats.ts` 의 `RAW`. 쉼표 단위(`phrases`)가 화면 동작의 기준점입니다.
- **화면 속 글자** — 각 장면 파일의 `Tag`/`Slam`/`Chip`/`Sign` 문자열.
- **색** — `lib/theme.ts`.
- **장면 동작 타이밍** — 각 장면 상단의 상수(예: `const cubeLand = b06.start + 9`). 모두 비트·구절 시작 프레임 기준입니다.
- **자막 끄기** — `--props` 로 `{"captions": false}`.

## 화면 속 수치에 대해

"저장 공간 97%", "8.4GB → 0.9GB", "시청 7명 · 미시청 5명", "선생님 에너지 3%", "4K 카메라", "저장 장치 ×5"는 모두
**옛날 방식의 고충을 그린 연출용 예시**이며 제품 성능 수치가 아닙니다. ClassIn 에 대해서는 대본이 말한 것만 보여 줍니다 —
녹화 버튼 하나, 자동 촬영·업로드·시청 체크·관리. 대본의 자동 항목에 '편집'은 없어서 메모에서는 '자동' 배지 대신 취소선으로 처리했습니다.

## OpenMontage 로 렌더하기 (선택)

이 폴더는 OpenMontage 프로젝트 워크스페이스 규격(`artifacts/` · `checkpoint_*.json` · `renders/`)을 그대로 따릅니다.
OpenMontage 체크아웃의 `projects/teachers-lost-their-minds` 에 이 폴더를 두거나 심볼릭 링크하면 됩니다.

```bash
cd OpenMontage/remotion-composer && npm install && npm install --no-save three @react-three/fiber@8 @remotion/three
```

```python
from tools.video.video_compose import VideoCompose
import json
ed = json.load(open("projects/teachers-lost-their-minds/artifacts/edit_decisions.json"))
VideoCompose().execute({"operation": "render", "output_path": "projects/teachers-lost-their-minds/renders/final.mp4", "edit_decisions": ed})
```

리눅스 무GPU 환경에서는 `remotion-composer/remotion.config.ts` 에 `Config.setChromiumOpenGlRenderer("swangle")` 가 필요합니다.

단계별 기록: `artifacts/research_brief.json` → `proposal_packet.json`(콘셉트 3안·비용 0) → `script.json` → `scene_plan.json` →
`asset_manifest.json` → `edit_decisions.json` → `render_report.json` · `final_review.json`, 결정 근거는 `decision_log.json`.

## 폰트 · 라이선스

- Pretendard — SIL OFL 1.1 (`public/fonts/LICENSE-Pretendard.txt`)
- Black Han Sans — SIL OFL 1.1 (`public/fonts/LICENSE-BlackHanSans.txt`)
- ClassIn 로고 — `public/brand/` (이 저장소의 기존 브랜드 자산)

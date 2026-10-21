# movie_ads

Classin 영상 광고 모음입니다. 폴더는 Google Drive `ClassIn Korea / 혁님 작업 / [영상_ai_프로젝트(마케팅,혁)](https://drive.google.com/drive/folders/1kfof3LwlePQhLExUu-cVSqq0t3xnh33e)`의 **프로젝트 번호·이름을 그대로** 따릅니다.
코드로 만드는 영상은 [Remotion](https://www.remotion.dev/) 4 워크스페이스 하나에서 관리하고, 기획서·생성 이미지·영상 원본 같은 대용량 자료는 Drive에 둡니다.

## 프로젝트 목록

| 폴더 | 코드 | 컴포지션 id | Drive 기준 상태 |
| --- | --- | --- | --- |
| [00_공통에셋](public/00_공통에셋) | 에셋 | – | 공식 로고·Pretendard 폰트 ([Drive](https://drive.google.com/drive/folders/1X7t0H6oLzrNI0sW2xRGO9Uvqhy3mXzAK)) |
| [01_갈매기_Vox_문제해결형](src/projects/01_갈매기_Vox_문제해결형) | – | – | v7.1 대본·스토리보드, 21초 구도 테스트 |
| [02_브랜드_타이포와앱패키징](src/projects/02_브랜드_타이포와앱패키징) | – | – | v13 35초 가이드 사운드 시안 |
| [03_발표자_통합플랫폼_30초_v0.6](src/projects/03_발표자_통합플랫폼_30초_v0.6) | – | – | 촬영 대본·HTML 구도 시안 |
| [04_갈매기_35초_릴스_Higgsfield](src/projects/04_갈매기_35초_릴스_Higgsfield) | – | – | 제작팩 v2·심도 기획 v3, 생성 영상 없음 |
| [05_멘탈_설명형_시리즈](src/projects/05_멘탈_설명형_시리즈) | – | – | 질문 · 녹화 · 어디서나수업 3편 검토 단계 |
| [06_수업전중후케어_40초](src/projects/06_수업전중후케어_40초) | – | – | 기획·녹음 대본만 |
| [07_수업표준화_45초](src/projects/07_수업표준화_45초) | – | – | 기획·녹음 대본만 |
| [08_정글대타_63초_32컷](src/projects/08_정글대타_63초_32컷) | – | – | r10 63초 렌더 검토본(Blender), 70초 이하 v2 검토 중 |
| [09_ClassinAI_기능소개_30초](src/projects/09_ClassinAI_기능소개_30초) | **Remotion** | `p09-classin-ai-features-30s` | v4 30초 렌더 완료(콘셉트 목업) · Drive 폴더 아직 없음 |

01–08 폴더에는 Drive 링크·상태·다음 작업을 적은 README만 있습니다. 상태는 Drive 정리 문서(2026-10-12 진행표, 08은 10-14 진행현황) 기준입니다.

## 폴더 규칙

```
src/
  index.ts · Root.tsx            # 프로젝트별 <Folder>, 영상별 <Composition> 등록
  shared/                        # 모든 영상 공용 코드 (fonts · motion)
  projects/<번호>_<이름>/        # Drive 프로젝트 폴더와 같은 이름. 시리즈(05)는 하위에 <번호>_<편> 폴더
public/
  00_공통에셋/                   # brand · fonts → staticFile("00_공통에셋/…")
  <번호>_<이름>/                 # 프로젝트 전용 에셋(필요할 때)
out/<번호>_<이름>/*.mp4           # 렌더 결과
```

- 폴더 이름은 Drive와 똑같이 씁니다. 새 프로젝트를 만들면 Drive와 이 저장소에 **같은 번호·이름**으로 만듭니다.
- Remotion의 `<Folder>` 이름과 컴포지션 id는 한글을 받지 않으므로 `p<번호>-<영문 이름>`으로 씁니다.

### 영상을 코드로 만들기 시작할 때

1. `src/projects/<번호>_<이름>/`에 메인 컴포넌트를 둡니다(09 폴더를 참고).
2. `src/Root.tsx`에 `<Folder name="p<번호>-…"><Composition id="p<번호>-…" …/></Folder>`를 추가합니다.
3. `package.json`에 `render:p<번호>` 스크립트를 추가하고 위 표를 갱신합니다.

## 실행

```bash
npm install
npm run dev          # Remotion Studio
npm run render:p09   # out/09_ClassinAI_기능소개_30초/ClassinAI_기능소개_30초_v4.mp4
npm run typecheck
```

Chrome Headless Shell이 없으면 Remotion이 자동으로 내려받습니다. 설치된 브라우저를 쓰려면 `REMOTION_BROWSER_EXECUTABLE`을 지정합니다(`remotion.config.ts`).

# movie_ads

Classin 영상 광고 모음입니다. [Remotion](https://www.remotion.dev/) 4 워크스페이스 하나에서 **프로젝트 → 영상** 단위로 폴더를 나눠 관리합니다.

## 영상 목록

| 프로젝트 | 영상 | 컴포지션 id | 규격 | 산출물 | 문서 |
| --- | --- | --- | --- | --- | --- |
| classin-ai | showreel (v4, 30s) | `classin-ai-showreel` | 1920×1080 · 30fps | `out/classin-ai/showreel.mp4` | [README](src/projects/classin-ai/showreel/README.md) |

## 폴더 규칙

```
src/
  index.ts · Root.tsx            # Root가 프로젝트별 <Folder>, 영상별 <Composition>을 등록
  shared/                        # 모든 영상 공용 (fonts · motion)
  projects/<프로젝트>/<영상>/    # 영상 하나 = 폴더 하나 (타임라인 · theme · scenes · components · README)
public/
  fonts/                         # 공용 폰트 (Pretendard)
  projects/<프로젝트>/           # 프로젝트 에셋 (brand · audio …) → staticFile("projects/<프로젝트>/…")
out/<프로젝트>/<영상>.mp4         # 렌더 결과
```

- 컴포지션 id는 `<프로젝트>-<영상>` (Remotion id는 영문·숫자·하이픈만 허용).
- 같은 프로젝트의 영상끼리 컴포넌트를 함께 쓰게 되면 `projects/<프로젝트>/_shared/`로 올립니다.

### 새 영상 추가

1. `src/projects/<프로젝트>/<영상>/`을 만들고 메인 컴포넌트와 `README.md`를 둡니다(기존 영상 폴더를 복사해 시작해도 됩니다).
2. `src/Root.tsx`의 해당 프로젝트 `<Folder>` 안에 `<Composition id="<프로젝트>-<영상>" …/>`를 추가합니다.
3. `package.json`에 `render:<프로젝트>/<영상>` 스크립트를 추가하고, 위 영상 목록 표에 한 줄 적습니다.

## 실행

```bash
npm install
npm run dev                              # Remotion Studio — 프로젝트 폴더별로 컴포지션이 보임
npm run render:classin-ai/showreel       # out/classin-ai/showreel.mp4
npm run typecheck
```

Chrome Headless Shell이 없으면 Remotion이 자동으로 내려받습니다. 설치된 브라우저를 쓰려면 `REMOTION_BROWSER_EXECUTABLE`을 지정합니다(`remotion.config.ts`).

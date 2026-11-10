# 브래그컷 v5 (9:16 · 20s · 시네마틱)

| 산출물 | 규격 | 컴포지션 | 경로 |
| --- | --- | --- | --- |
| 브래그컷 v5 | 1080×1920 · 30fps · 20s · H.264 · 음악·효과음 포함 · 시네마틱 | `Brag` | `out/brag/brag.mp4` (+ `brag.jpg` 포스터, `share-copy.txt`) |

[latent-spaces/brag](https://github.com/latent-spaces/brag)의 `/brag-slim` 스킬(`.claude/skills/brag-slim/`)을 이 레포의 Remotion에 맞춰 적용한 숏폼 런칭 컷입니다.
v4의 기능 5개 대신 **3개(분석 · 채점 · 통역)만, 일하는 장면으로** 보여 주고 "선생님은 가르치기만 하세요."로 닫습니다.
기획·스토리보드·사운드 설계는 `out/brag/brag-plan.md`에 있습니다.

- **조명 흐름**: 어둠(레터박스 콜드 오픈) → 화이트 플래시(타이틀) → 어두운 스튜디오의 3D 카드(하이라이트) → 플래시 → 밝은 엔딩(CTA).
- **타입(B · 하이패션 디돈)**: Noto Serif KR Light↔Black(국문 헤드라인) · Bodoni Moda(큰 숫자·영문 액센트·다이얼) · JetBrains Mono(HUD) · Pretendard(UI).
- **시간**: 콜드 오픈의 1시간은 크로노그래프 다이얼(`src/brag/Dial.tsx`) — 분 눈금·보도니 숫자·게이지 아크·바늘, 소리는 기계식 이스케이프먼트 틱과 크로노 푸셔.
- **로고·아이콘**: `Classin AI`의 AI는 워드마크의 획·사선 컷으로 직접 그린 SVG(`src/brag/Brand.tsx`), 분석·채점·통역은 라인 아이콘(`src/brag/Icons.tsx`).
- **타입셋**: 컴포지션 prop `typeset`(`src/brag/typeset.tsx`). 본편은 `couture`, 이전 본편(나눔명조 + Instrument Serif)은 `current`.
  4종 비교 보드는 `out/brag/typeset/`, 이전 버전 렌더는 `npx remotion render Brag out/brag/brag-raw.mp4 --props='{"typeset":"current"}' && sh scripts/brag-poster.sh`.
- **연출**: 카메라 풀백·푸시인, 깊이에서 회전하며 초점이 맞는 카드, 랙 포커스, 아나모픽 플레어, 필름 그레인·비네트, 플래시·줌 스루·휩 팬 전환.
- **사운드**: `scripts/brag-audio.py`가 numpy로 합성(D단조 → F장조 해결, 120 BPM, -14 LUFS). 장면 도착 3·5·9·13·17s가 모두 다운비트입니다.
- **타이밍은 한 곳**: `src/brag/cues.json`을 영상과 오디오 스크립트가 함께 읽습니다. 큐를 바꾸면 `npm run brag`으로 오디오와 영상을 다시 만듭니다.

## 구조

```
src/brag/                       # Brag.tsx(타임라인) · cues.json(영상·오디오 공용 큐) · Cinema.tsx(카메라·조명·필름 룩) · Layout.tsx · scenes/
src/shared/brand/Transitions.tsx# 커스텀 전환(v4: 스윕·푸시·아이리스 / 브래그컷: 플래시·줌 스루·휩 팬)
src/shared/fonts.ts             # Pretendard + 브래그컷용 Noto Serif KR · Bodoni Moda · JetBrains Mono (+ 이전 타입셋 나눔명조 · Instrument Serif)
scripts/brag-audio.py           # 사운드트랙 합성 → public/audio/brag-mix.wav
scripts/brag-poster.sh          # 포스터 프레임 추출 + 0번 프레임에 굽기
public/fonts/                   # Noto Serif KR(서브셋) · Bodoni Moda · JetBrains Mono · 나눔명조 · Instrument Serif (모두 SIL OFL 1.1)
```

## 실행

```bash
npm run brag       # 오디오 합성 → 렌더 → 포스터 굽기 → out/brag/brag.mp4 (python3 + numpy, ffmpeg 필요)
```

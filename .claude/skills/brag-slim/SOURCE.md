# 출처

`SKILL.md`는 [latent-spaces/brag](https://github.com/latent-spaces/brag)의 `skills/brag-slim/SKILL.md`를 그대로 옮긴 것입니다
(커밋 `069432cac935ed1895859df201c31436c07fb74e`, MIT — `LICENSE` 참고). 원본을 고치지 않고, 이 레포에서의 적용 방식은 아래에 따로 적습니다.

## 이 레포에서 쓸 때

- **엔진**: Hyperframes 대신 이 레포의 Remotion을 씁니다. brag-slim은 엔진을 강제하지 않습니다.
- **재사용**: `src/components/`(Kinetic · Flourish · Feature · Ui · Backgrounds)와 `src/lib/theme.ts` 팔레트를 그대로 씁니다.
- **산출물 위치**: `brag-output/` 대신 `out/brag/`(brag.mp4 · brag.jpg · share-copy.txt · brag-plan.md).
- **오디오**: brag 풀 버전의 동봉 음악은 라이선스 확인 전이라 쓰지 않습니다. `scripts/brag-audio.py`가 음악과 효과음을 같은 키로 합성합니다.
- **Classin 검수 규칙**: 화면 속 수업·학생·점수는 예시이며 "예시 화면" 라벨을 붙입니다. 실제 지원 범위(언어, 채점 범위)는 README의 검수 참고를 따릅니다.

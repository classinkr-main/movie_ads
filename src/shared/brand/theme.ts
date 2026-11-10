// Classin 브랜드 팔레트 — 모든 영상 공용(09 쇼릴 v2 톤에서 시작).
// v2 팔레트 — 화이트·아이보리 베이스 + 연두 그린 포인트.
// 텍스트 강조와 CTA 채움에는 Classin Green(DESIGN.md)을, 하이라이터·도형·칩에는 연두를 쓴다.
export const C = {
  // 베이스
  ivory: "#FAF8F2",
  ivory2: "#F3EFE4",
  white: "#FFFFFF",
  // 텍스트
  ink: "#1C1B17",
  gray: "#6B675F",
  gray300: "#A9A49A",
  hairline: "rgba(28,27,23,0.08)",
  // 연두 포인트
  lime: "#C8F05A",
  limeBright: "#D8FF5C",
  limeSoft: "#EAF7C0",
  limeDeep: "#8BC926",
  limeInk: "#3C6B12",
  // 브랜드 그린(강조 텍스트·CTA)
  forest: "#084734",
  brand: "#009060",
} as const;

// 기본 프레임레이트 — 따로 정하지 않은 영상(숏폼·포럼·강사 관리 등)이 쓴다.
// 60fps·24fps 영상과 번호 프로젝트(06·07·09)는 각자 파일에서 FPS를 정한다.
export const FPS = 30;

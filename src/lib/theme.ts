// 브랜드 토큰 — classinkr-web/DESIGN.md + 로고 실측색을 따른다.
export const C = {
  forest: "#084734", // Classin Green (DESIGN.md 주 액센트)
  forestDeep: "#052B20", // 다크 배경 하단 톤
  forestHover: "#065c41",
  brand: "#009060", // 로고 워드마크 실측 그린
  brandBright: "#00A870", // 로고 마크 그라데이션 밝은 쪽
  mint: "#6EE7B7", // Green Muted
  surface50: "#ECFDF5",
  surface100: "#D1FAE5",
  page: "#FAFAF8",
  ink: "#111110",
  warmDark: "#31302E",
  warmGray: "#615D59",
  warmGray300: "#A39E98",
  warmWhite: "#F6F5F4",
  white: "#FFFFFF",
  hairline: "rgba(0,0,0,0.08)",
} as const;

export const FPS = 30;
export const DURATION_SEC = 20;
export const DURATION_FRAMES = FPS * DURATION_SEC; // 600

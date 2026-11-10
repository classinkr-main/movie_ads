// 드로잉 쇼릴 팔레트 — 종이 + 연필 잉크 + 연두 마커. 브랜드 그린 계열만 쓰고 파랑은 쓰지 않는다.
export const P = {
  paper: "#FBF8EE",
  paper2: "#F3EEDF",
  sheet: "#FFFDF6",
  ink: "#2A2823",
  ink2: "#57534A",
  pencil: "#B4AD9D",
  // 연두 마커
  lime: "#C8F05A",
  limeLight: "#E2F8A3",
  limeSoft: "#EEF9CC",
  limeDeep: "#8BC926",
  limeInk: "#3C6B12",
  // 브랜드 그린
  forest: "#084734",
  brand: "#009060",
  board: "#17503C",
  boardDeep: "#0F3E2E",
  mint: "#CFEFDA",
  sea: "#9ADFBC",
  // 따뜻한 포인트(부리·발·볼·포스트잇)
  orange: "#FFA23A",
  orangeDeep: "#E9781A",
  blush: "#FFB4B0",
  note: "#FFE27A",
  noteDeep: "#F2C63E",
  chalk: "#FBFAF3",
  red: "#E8573F",
} as const;

export const G_FPS = 30;

// 씬 길이(프레임). 120BPM 기준 한 마디 = 60f 이라 음악과 맞물린다.
export const SCENES = {
  open: 180,
  keep: 300,
  evalu: 300,
  data: 420,
  scale: 120,
  cta: 150,
} as const;

export const G_DURATION = SCENES.open + SCENES.keep + SCENES.evalu + SCENES.data + SCENES.scale + SCENES.cta; // 1470f = 49s

export const JUA = "Jua";
export const GAEGU = "Gaegu";

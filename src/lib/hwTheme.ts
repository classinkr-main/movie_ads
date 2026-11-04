// 하드웨어 광고 팔레트 — 다크 시네마틱. 제품 사진(다크 스튜디오·쇼룸)과 어울리도록 거의 검정 베이스에
// Classin 브랜드 그린(민트 쪽으로 밝힌 톤)을 포인트로 쓴다. AI 쇼릴(아이보리·연두)과는 의도적으로 다른 톤.
export const H = {
  bg: "#070908",
  bg2: "#0D1110",
  bg3: "#141A17",
  panel: "rgba(255,255,255,0.055)",
  panel2: "rgba(255,255,255,0.09)",
  line: "rgba(255,255,255,0.14)",
  line2: "rgba(255,255,255,0.26)",
  text: "#F4F3EF",
  muted: "rgba(244,243,239,0.64)",
  dim: "rgba(244,243,239,0.38)",
  green: "#00A36C", // 다크 배경용 브랜드 그린
  mint: "#6EE7B7", // 하이라이트·스펙 수치
  mintSoft: "rgba(110,231,183,0.16)",
  brand: "#009060",
  orange: "#E8873A", // 펜 트레이 색 — 아주 드물게
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const HW_FPS = 30;
export const HW_DURATION_SEC = 45;
export const HW_DURATION_FRAMES = HW_FPS * HW_DURATION_SEC; // 1350

export const CHAPTERS = [
  { n: "01", en: "DESIGN", ko: "디자인" },
  { n: "02", en: "DISPLAY", ko: "디스플레이" },
  { n: "03", en: "PERFORMANCE", ko: "퍼포먼스" },
  { n: "04", en: "AI TRACKING", ko: "트래킹 카메라" },
  { n: "05", en: "ECOSYSTEM", ko: "생태계" },
] as const;

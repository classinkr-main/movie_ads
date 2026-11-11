// 시네마틱 커머셜(20s) 전용 팔레트·타이밍.
// 다크 스테이지 + 민트 림라이트. 포화 컬러는 Classin Green 계열 하나만 쓴다(DESIGN.md).
export const K = {
  black: "#020403",
  stage: "#050908",
  slate: "#0B1512", // 칠판 면
  slateHi: "#14251F",
  white: "#F4F6F2",
  chalk: "#F3F4EC",
  dim: "rgba(244,246,242,0.62)",
  faint: "rgba(244,246,242,0.34)",
  hair: "rgba(244,246,242,0.14)",
  mint: "#6EE7B7", // 다크 면 위 포인트(DESIGN.md Green Muted)
  mintHot: "#C9FFE8",
  green: "#0B7A52", // Classin Green
  forest: "#084734",
  rec: "#FF5343",
  amber: "#FFCF99",
} as const;

export const rgba = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// 120 BPM · 30fps → 한 박 15f, 한 마디 60f. 컷은 모두 마디 선에 놓인다.
export const BEAT = 15;
export const BAR = 60;
export const T = {
  open: 0, // 판서 매크로 → 지우개
  reveal: 120, // 임팩트 1 · 풀백 · 헤드라인
  p1: 240, // 01 자동 녹화
  p2: 300, // 02 AI 강의 평가
  p3: 360, // 03 EDB 교안
  scale: 420, // 글로벌 스케일
  end: 480, // 임팩트 2 · 로고 · CTA
  total: 600,
} as const;

// 2.39:1 시네마스코프 레터박스(1920×804 화면)
export const BAR_H = Math.round((H - W / 2.39) / 2); // 138

// 보드 프레임 이미지(1408×807) 안의 화면 영역
export const BOARD = { w: 1408, h: 807, sx: 58, sy: 43, sw: 1291, sh: 681 } as const;

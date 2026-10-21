// Classin 브랜드 쇼릴(20초 · 60fps) — 다크 시네마틱 베이스 + 브랜드 그린 + 민트 강조.
// 기존 AI 쇼릴(lib/theme.ts)과 팔레트 이름을 맞추되, 사진·영상 위에 얹는 다크 톤을 기본으로 쓴다.
export const R = {
  // 베이스(딥 그린 블랙)
  night: "#030B08",
  night2: "#06150F",
  deep: "#0A2219",
  // 브랜드
  forest: "#084734",
  brand: "#00A86B",
  brandSoft: "#3FD39A",
  // 강조 톤 — DESIGN.md "Green Muted" 민트. 하이라이터·레일·CTA·글로우가 모두 이 토큰을 쓴다.
  // 다른 톤으로 바꾸려면 accent·accentRgb 두 줄만 고치면 된다.
  accent: "#6EE7B7",
  accentRgb: "110,231,183",
  accentInk: "#084734",
  // 텍스트
  white: "#FFFFFF",
  paper: "#F4F1EA",
  ink: "#111110",
  mute: "rgba(255,255,255,0.62)",
  faint: "rgba(255,255,255,0.32)",
  hair: "rgba(255,255,255,0.14)",
  // 칠판(Classin 보드 화면)
  board: "#0F2A21",
  board2: "#14362A",
} as const;

export const FPS = 60;
export const DURATION_SEC = 20;
export const DURATION_FRAMES = FPS * DURATION_SEC; // 1200

// 초 → 프레임. 씬 안의 타이밍은 60fps 프레임 숫자로 직접 썼다(주석에 초를 함께 적었다).
export const sec = (s: number) => Math.round(s * FPS);

// 약 109 BPM 박자 — 1박 = 0.55초 = 33f. S2 한 컷(66f)이 두 박이라 BGM을 109 BPM 근처로 고르면
// 휩 컷이 박에 떨어진다. scripts/guide_sfx.py 의 가이드 사운드도 같은 박을 쓴다.
export const BEAT = sec(0.55);

// 씬 경계(글로벌 프레임). 겹침 구간은 각 씬이 직접 들어오고 나간다.
export const T = {
  hook: { from: 0, to: 180 },
  flow: { from: 168, to: 510 }, // 5비트 × 66f, 첫 12f는 훅과 겹친다
  grid: { from: 498, to: 690 },
  hero: { from: 690, to: 882 },
  proof: { from: 870, to: 1062 },
  end: { from: 1050, to: 1200 },
} as const;

// 히어로 칠판 화면 콘텐츠의 시작 프레임. 그리드 중앙 타일(S3)과 풀스크린(S4)이 같은 시계를 공유해야 줌인이 이어진다.
export const HERO_CLOCK = 570;

// 카메라 임팩트(미세 흔들림 + 아나모픽 플레어) 프레임 — 글자 줌스루, 칠판 도착, 로고 착지
export const IMPACTS = [122, 690, 1058] as const;

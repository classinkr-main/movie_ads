import cues from "../data/cues.json";

// v5 팔레트 — 기존 그린·아이보리·연두를 쓰지 않는 새 체계.
// 코발트(미래)·시그널 오렌지(에너지·첨삭)·잉크(뮤비 무대)·모눈종이 화이트(Vox 해설 지면).
export const C = {
  ink: "#0A0B14",
  ink2: "#161927",
  cobalt: "#2F3CFF",
  cobaltDeep: "#141A86",
  cobaltSoft: "#C9CEFF",
  signal: "#FF5A1F",
  signalSoft: "#FFD3C2",
  paper: "#F2F4F8",
  paper2: "#E4E8F1",
  white: "#FFFFFF",
  muted: "#7D8399",
  grid: "rgba(47,60,255,0.12)",
  gridMajor: "rgba(47,60,255,0.22)",
} as const;

// 등록용 패밀리 이름(fonts.ts)과 CSS 스택(FONT)을 나눈다. 영문 전용 서체(Anton·Plex Mono)에 한글이 섞이면
// 시스템 폰트가 아니라 번들된 한글 서체로 떨어지도록 스택을 고정한다.
export const FAMILY = {
  display: "Hahmlet", // 한글 헤드라인 — 가변 100–900
  sans: "IBM Plex Sans KR", // 라벨·UI
  num: "Anton", // 숫자·영문 대형
  mono: "IBM Plex Mono", // 캡션·타임코드
} as const;

export const FONT = {
  display: `"${FAMILY.display}", "${FAMILY.sans}"`,
  sans: `"${FAMILY.sans}"`,
  num: `"${FAMILY.num}", "${FAMILY.display}"`,
  mono: `"${FAMILY.mono}", "${FAMILY.sans}"`,
} as const;

export const FPS = cues.fps; // 60
export const BEAT = cues.beat; // 30f = 120 BPM
export const BAR = BEAT * 4;
export const DURATION_FRAMES = cues.durationInFrames; // 1320f = 22s
export const W = 1920;
export const H = 1080;

export const CUES = cues;
export type SceneId = keyof typeof cues.scenes;
export const scene = (id: SceneId) => {
  const [from, to] = cues.scenes[id];
  return { from, to, len: to - from };
};

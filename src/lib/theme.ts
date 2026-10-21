import cues from "../data/cues.json";

// v5 팔레트 — 파스텔 연두 지면 + 잉크 글자. 포인트는 코발트(UI·블록)와 시그널 오렌지(손그림 첨삭).
export const C = {
  ink: "#0A0B14",
  lime: "#E2F4B9", // 파스텔 연두 — 무대 배경
  limeLight: "#EDF8D4", // 모눈종이 지면
  limeDeep: "#CDEA92", // 블록·강조 바탕
  olive: "#4A6B12", // 연두 위 보조 글자·점
  cobalt: "#2F3CFF",
  signal: "#FF5A1F",
  white: "#FFFFFF",
  muted: "#5F6E48",
  grid: "rgba(74,107,18,0.13)",
  gridMajor: "rgba(74,107,18,0.24)",
  shadow: "rgba(30,44,6,0.28)", // 연두 위 카드 그림자
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

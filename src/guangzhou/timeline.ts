import data from "./timeline.json";

export type TransitionKind =
  | "fadeBlack"
  | "punch"
  | "whipLeft"
  | "whipUp"
  | "zoomThrough"
  | "zoomBlur"
  | "impact"
  | "shutter"
  | "dayWipe"
  | "greenWipe";

export type Shot = {
  id: string;
  type: "video" | "photo" | "print" | "graphic";
  from: number;
  dur: number;
  in: TransitionKind;
};

export const FPS = data.fps;
export const TOTAL = data.frames;
export const BEAT = data.beatFrames;
export const HANDLE = data.handle;
export const SHOTS = data.shots as Shot[];

// 들어오는 컷 기준 전환 창: pre = 컷 이전 프레임, post = 컷 이후 프레임
// incomingBefore/outgoingAfter = 컷을 넘어 두 레이어가 함께 보이는 구간
export const TRANSITION: Record<TransitionKind, { pre: number; post: number; incomingBefore: number; outgoingAfter: number }> = {
  fadeBlack: { pre: 0, post: 8, incomingBefore: 0, outgoingAfter: 0 },
  punch: { pre: 0, post: 7, incomingBefore: 0, outgoingAfter: 0 },
  whipLeft: { pre: 4, post: 5, incomingBefore: 4, outgoingAfter: 5 },
  whipUp: { pre: 4, post: 5, incomingBefore: 4, outgoingAfter: 5 },
  zoomThrough: { pre: 7, post: 8, incomingBefore: 0, outgoingAfter: 0 },
  zoomBlur: { pre: 5, post: 6, incomingBefore: 0, outgoingAfter: 0 },
  impact: { pre: 0, post: 12, incomingBefore: 0, outgoingAfter: 0 },
  shutter: { pre: 0, post: 7, incomingBefore: 0, outgoingAfter: 0 },
  dayWipe: { pre: 8, post: 12, incomingBefore: 0, outgoingAfter: 0 },
  greenWipe: { pre: 10, post: 6, incomingBefore: 10, outgoingAfter: 0 },
};

export const shotById = (id: string) => {
  const s = SHOTS.find((x) => x.id === id);
  if (!s) throw new Error(`unknown shot ${id}`);
  return s;
};

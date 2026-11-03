import { createContext, useContext } from "react";
import cues22 from "../data/cues.json";
import cues30 from "../data/cues-30s.json";

// 타이밍 SSOT — 버전마다 cues JSON 하나(영상과 사운드트랙이 함께 읽는다). 컴포지션이 TimingProvider로 골라 내려 준다.
// 22초판은 120 BPM 그리드에 1박 1단어, 30초 여유판은 같은 템포에서 단어·카드·컷이 머무는 시간을 늘렸다.
export type Cues = typeof cues22;
export type SceneId = keyof Cues["scenes"];

const v22: Cues = cues22;
const v30: Cues = cues30;
export const VERSIONS = {
  v22: { cues: v22, audio: "audio/classin-v5.wav" },
  v30: { cues: v30, audio: "audio/classin-v5-30s.wav" },
} as const;
export type VersionId = keyof typeof VERSIONS;

const TimingContext = createContext<Cues>(v22);
export const TimingProvider = TimingContext.Provider;
export const useCues = (): Cues => useContext(TimingContext);

export const sceneSpan = (cues: Cues, id: SceneId) => {
  const [from, to] = cues.scenes[id];
  return { from, to, len: to - from };
};

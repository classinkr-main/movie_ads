import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeInOutCubic } from "../lib/motion";
import { R } from "./theme";

// 카메라 — 스케일(s)과 이동(x·y, 화면 %), 회전(r, deg)
export type Cam = { s: number; x?: number; y?: number; r?: number };

export const camAt = (frame: number, from: Cam, to: Cam, dur: number, delay = 0, easing = easeInOutCubic) => {
  const p = interpolate(frame - delay, [0, dur], [0, 1], { ...clamp, easing });
  const l = (a = 0, b = 0) => a + (b - a) * p;
  return `translate(${l(from.x, to.x)}%, ${l(from.y, to.y)}%) scale(${l(from.s, to.s)}) rotate(${l(from.r, to.r)}deg)`;
};

// 사진·영상 공통 그레이드 — 형광등 아래 폰 사진들을 한 톤으로 묶는다
type Grade = "cine" | "soft" | "none";
const FILTER: Record<Grade, string> = {
  cine: "saturate(0.86) contrast(1.08) brightness(0.93)",
  soft: "saturate(0.92) contrast(1.04) brightness(0.96)",
  none: "none",
};

const Tone: React.FC<{ grade: Grade }> = ({ grade }) =>
  grade === "none" ? null : (
    <>
      <AbsoluteFill style={{ background: R.forest, mixBlendMode: "soft-light", opacity: grade === "cine" ? 0.42 : 0.26 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(2,10,7,0.55) 100%)" }} />
    </>
  );

type MediaProps = {
  src: string;
  from?: Cam;
  to?: Cam;
  dur?: number;
  delay?: number;
  grade?: Grade;
  position?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export const Photo: React.FC<MediaProps> = ({ src, from = { s: 1.08 }, to = { s: 1 }, dur = 90, delay = 0, grade = "cine", position = "50% 50%", style, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: R.night, ...style }}>
      <AbsoluteFill style={{ transform: camAt(frame, from, to, dur, delay), transformOrigin: "50% 50%" }}>
        <Img src={staticFile(`reel/photos/${src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position, filter: FILTER[grade] }} />
        <Tone grade={grade} />
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Clip: React.FC<MediaProps & { rate?: number }> = ({ src, from = { s: 1.06 }, to = { s: 1 }, dur = 120, delay = 0, grade = "soft", position = "50% 50%", rate = 1, style, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: R.night, ...style }}>
      <AbsoluteFill style={{ transform: camAt(frame, from, to, dur, delay), transformOrigin: "50% 50%" }}>
        <OffthreadVideo src={staticFile(`reel/video/${src}.mp4`)} muted playbackRate={rate} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position, filter: FILTER[grade] }} />
        <Tone grade={grade} />
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

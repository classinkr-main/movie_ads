import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile } from "remotion";
import { C } from "../lib/theme";

type Fit = { pos?: string; scale?: number; x?: number; y?: number; filter?: string; style?: React.CSSProperties };

// 풀블리드 사진 — object-fit: cover + 확대·이동(켄 번스)
export const Photo: React.FC<Fit & { src: string }> = ({ src, pos = "50% 50%", scale = 1, x = 0, y = 0, filter, style }) => (
  <AbsoluteFill style={{ overflow: "hidden", ...style }}>
    <Img
      src={staticFile(`photos/${src}`)}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `translate(${x}px, ${y}px) scale(${scale})`, filter }}
    />
  </AbsoluteFill>
);

// 영상 클립 — Sequence 시작 시점부터 재생
export const Clip: React.FC<Fit & { src: string; rate?: number; trimBefore?: number }> = ({ src, pos = "50% 50%", scale = 1, x = 0, y = 0, filter, style, rate = 1, trimBefore = 0 }) => (
  <AbsoluteFill style={{ overflow: "hidden", ...style }}>
    <OffthreadVideo
      src={staticFile(`clips/${src}`)}
      muted
      playbackRate={rate}
      trimBefore={trimBefore}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `translate(${x}px, ${y}px) scale(${scale})`, filter }}
    />
  </AbsoluteFill>
);

// 마스킹 테이프 조각
export const Tape: React.FC<{ x: number; y: number; w?: number; rotate?: number; color?: string }> = ({ x, y, w = 150, rotate = -8, color = "rgba(255,90,31,0.78)" }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - 18,
      width: w,
      height: 36,
      background: color,
      transform: `rotate(${rotate}deg)`,
      clipPath: "polygon(2% 8%, 98% 0%, 100% 30%, 97% 52%, 100% 74%, 98% 100%, 1% 94%, 3% 70%, 0% 48%, 3% 26%)",
      boxShadow: "0 2px 6px rgba(10,11,20,0.15)",
    }}
  />
);

// 오려 붙인 사진 — 흰 테두리 + 그림자 + 기울기
export const Cutout: React.FC<{ x: number; y: number; w: number; h: number; rotate?: number; border?: number; children: React.ReactNode; shadow?: number }> = ({
  x,
  y,
  w,
  h,
  rotate = 0,
  border = 14,
  children,
  shadow = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      padding: border,
      boxSizing: "border-box",
      background: C.white,
      transform: `rotate(${rotate}deg)`,
      boxShadow: `0 ${18 * shadow}px ${44 * shadow}px rgba(10,11,20,${0.22 * shadow}), 0 2px 4px rgba(10,11,20,0.12)`,
    }}
  >
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>{children}</div>
  </div>
);

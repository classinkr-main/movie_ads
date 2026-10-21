import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOutExpo, sp } from "../lib/motion";
import { FONT_FAMILY } from "../lib/fonts";
import { R } from "./theme";

const easeIn = (t: number) => t * t * t;

// 마스크 라인 — 줄 단위로 아래에서 밀려 올라오고, out 프레임부터 위로 빠진다
export const MaskLine: React.FC<{
  at: number;
  out?: number;
  dur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  from?: "bottom" | "top" | "left";
}> = ({ at, out, dur = 26, children, style, from = "bottom" }) => {
  const frame = useCurrentFrame();
  const pin = interpolate(frame - at, [0, dur], [1, 0], { ...clamp, easing: easeOutExpo });
  const pout = out === undefined ? 0 : interpolate(frame - out, [0, 14], [0, 1], { ...clamp, easing: easeIn });
  const y = from === "bottom" ? pin * 110 - pout * 110 : from === "top" ? -pin * 110 + pout * 110 : 0;
  const x = from === "left" ? -pin * 105 : 0;
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em", ...style }}>
      <div style={{ transform: `translate(${x}%, ${y}%)`, willChange: "transform" }}>{children}</div>
    </div>
  );
};

// 글자 단위 스프링 — 블러에서 선명하게 떠오른다
export const Chars: React.FC<{ text: string; at: number; stagger?: number; style?: React.CSSProperties; lift?: number }> = ({ text, at, stagger = 3, style, lift = 0.6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span style={{ display: "inline-block", whiteSpace: "pre", ...style }}>
      {Array.from(text).map((ch, i) => {
        const f = frame - at - i * stagger;
        const s = sp(f, fps, { damping: 16, stiffness: 180, mass: 0.8 });
        const o = interpolate(f, [0, 10], [0, 1], clamp);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: o,
              transform: `translateY(${(1 - s) * lift}em) scale(${0.9 + 0.1 * s})`,
              filter: `blur(${(1 - Math.min(1, s)) * 10}px)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

// 형광펜 — 텍스트 뒤로 연두 띠가 좌→우로 그어진다
export const Highlight: React.FC<{ at: number; dur?: number; children: React.ReactNode; color?: string; height?: string; style?: React.CSSProperties }> = ({
  at,
  dur = 18,
  children,
  color = R.lime,
  height = "0.42em",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, dur], [0, 1], { ...clamp, easing: easeOutExpo });
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span style={{ position: "absolute", left: "-0.06em", right: "-0.06em", bottom: "0.06em", height, background: color, transform: `scaleX(${p})`, transformOrigin: "0 50%", zIndex: 0, borderRadius: 4 }} />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};

// 카운트업 — 정수 부분을 굴리고 접미사(만+ 등)는 고정
export const CountUp: React.FC<{ to: number; at: number; dur?: number; suffix?: string; style?: React.CSSProperties; comma?: boolean }> = ({ to, at, dur = 48, suffix = "", style, comma = true }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, dur], [0, 1], { ...clamp, easing: easeOutExpo });
  const v = Math.round(to * p);
  const txt = comma ? v.toLocaleString("en-US") : String(v);
  return (
    <span style={{ fontFamily: FONT_FAMILY, fontVariantNumeric: "tabular-nums", ...style }}>
      {txt}
      {suffix}
    </span>
  );
};

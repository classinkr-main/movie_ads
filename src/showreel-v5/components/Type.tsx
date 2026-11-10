import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { SLAM, clamp, ease, prog, sp } from "../lib/motion";

// 타자기 — cues.json의 start/step과 같은 프레임에 글자가 찍힌다(사운드트랙 타건음과 1:1).
// 아직 안 찍힌 글자도 자리를 차지해 줄 바꿈·정렬이 흔들리지 않는다.
export const Typewriter: React.FC<{
  text: string;
  start: number;
  step: number;
  style?: React.CSSProperties;
  caret?: boolean;
  caretColor?: string;
  caretUntil?: number;
}> = ({ text, start, step, style, caret = true, caretColor = C.signal, caretUntil = Infinity }) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);
  const shown = Math.max(0, Math.min(chars.length, Math.floor((frame - start) / step) + 1));
  const done = shown === chars.length;
  const blinkOn = !done || Math.floor((frame - start - chars.length * step) / 16) % 2 === 0;
  const caretVisible = caret && frame >= start - 6 && frame < caretUntil && blinkOn;
  return (
    <span style={{ position: "relative", whiteSpace: "pre", ...style }}>
      {chars.map((ch, i) => {
        const at = start + i * step;
        const t = frame - at;
        const on = t >= 0;
        const s = on ? interpolate(t, [0, 4], [1.22, 1], clamp) : 1;
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", opacity: on ? 1 : 0, transform: `scale(${s})`, transformOrigin: "50% 80%" }}>
            {ch === " " ? " " : ch}
            {caretVisible && i === Math.max(0, shown - 1) && (
              <span
                style={{
                  position: "absolute",
                  left: shown === 0 ? "-0.08em" : "calc(100% + 0.06em)",
                  top: "0.12em",
                  width: "0.07em",
                  height: "0.95em",
                  background: caretColor,
                }}
              />
            )}
          </span>
        );
      })}
    </span>
  );
};

// 슬램 — 크게 들어와 박히는 헤드라인. RGB 분리 잔상이 함께 사라진다
export const Slam: React.FC<{
  children: React.ReactNode;
  start: number;
  from?: number;
  rgb?: boolean;
  style?: React.CSSProperties;
  origin?: string;
}> = ({ children, start, from = 1.6, rgb = true, style, origin = "50% 60%" }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  const s = sp(t, SLAM);
  const scale = from + (1 - from) * s;
  const blur = interpolate(t, [0, 6], [10, 0], clamp);
  const split = rgb ? interpolate(t, [0, 12], [14, 0], { ...clamp, easing: ease.out }) : 0;
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: origin,
        filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
        textShadow: split > 0.2 ? `${split}px 0 0 ${C.signal}, ${-split}px 0 0 rgba(47,60,255,0.9)` : undefined,
        opacity: interpolate(t, [0, 2], [0, 1], clamp),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// 마스크 업 — 기준선 아래에서 밀려 올라오는 줄
export const MaskUp: React.FC<{ children: React.ReactNode; start: number; dur?: number; style?: React.CSSProperties; distance?: number }> = ({ children, start, dur = 12, style, distance = 1.05 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, start + dur, ease.outQuint);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.08em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * distance * 100}%)` }}>{children}</div>
    </div>
  );
};

// 숫자 롤업
export const Counter: React.FC<{ value: number; start: number; dur?: number; format?: (n: number) => string; style?: React.CSSProperties }> = ({
  value,
  start,
  dur = 12,
  format = (n) => Math.round(n).toLocaleString("en-US"),
  style,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, start + dur, ease.outQuint);
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{format(value * p)}</span>;
};

// 모노 캡션 — Vox식 출처·설명 줄
export const Caption: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = C.muted, size = 20, style }) => (
  <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: size, letterSpacing: "0.08em", color, ...style }}>{children}</div>
);

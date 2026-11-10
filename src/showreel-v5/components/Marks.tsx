import React from "react";
import { random, useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { POP, ease, prog, sp } from "../lib/motion";

// Vox식 손그림 주석 키트 — 동그라미·화살표·밑줄·취소선·형광펜·라벨·도장.
// 모든 선은 stroke-dashoffset으로 그려지며, start/dur(프레임)로 타이밍을 맞춘다.

type Pt = [number, number];
const toPath = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
const lengthOf = (pts: Pt[]) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

const Svg: React.FC<{ children: React.ReactNode; w?: number; h?: number }> = ({ children, w = 1920, h = 1080 }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
    {children}
  </svg>
);

const Stroke: React.FC<{ pts: Pt[]; p: number; color: string; width: number; opacity?: number }> = ({ pts, p, color, width, opacity = 1 }) => {
  const L = lengthOf(pts);
  if (p <= 0) return null;
  return (
    <path
      d={toPath(pts)}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={L}
      strokeDashoffset={L * (1 - p)}
      opacity={opacity}
    />
  );
};

// 손으로 두른 동그라미 — 한 바퀴 조금 넘게 돌며 끝이 살짝 어긋난다
export const HandCircle: React.FC<{ cx: number; cy: number; rx: number; ry: number; start: number; dur?: number; color?: string; width?: number; seed?: string; tilt?: number; w?: number; h?: number }> = ({
  cx,
  cy,
  rx,
  ry,
  start,
  dur = 14,
  color = C.signal,
  width = 7,
  seed = "c",
  tilt = -8,
  w,
  h,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, start + dur, ease.inOut);
  const ph1 = random(`${seed}1`) * 6.28;
  const ph2 = random(`${seed}2`) * 6.28;
  const a0 = -2.2 + random(`${seed}3`) * 0.6;
  const tr = (tilt * Math.PI) / 180;
  const pts: Pt[] = [];
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * 1.14;
    const th = a0 + t * Math.PI * 2;
    const f = 1 + 0.035 * Math.sin(3 * th + ph1) + 0.02 * Math.sin(5 * th + ph2) + 0.05 * t;
    const x = rx * f * Math.cos(th);
    const y = ry * f * Math.sin(th);
    pts.push([cx + x * Math.cos(tr) - y * Math.sin(tr), cy + x * Math.sin(tr) + y * Math.cos(tr)]);
  }
  return (
    <Svg w={w} h={h}>
      <Stroke pts={pts} p={p} color={color} width={width} />
    </Svg>
  );
};

// 휘어진 화살표 — 몸통을 그린 뒤 촉을 긋는다
export const HandArrow: React.FC<{ from: Pt; to: Pt; bend?: number; start: number; dur?: number; color?: string; width?: number; head?: number; w?: number; h?: number }> = ({
  from,
  to,
  bend = 0.25,
  start,
  dur = 12,
  color = C.signal,
  width = 6,
  head = 26,
  w,
  h,
}) => {
  const frame = useCurrentFrame();
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend;
  const my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const shaft: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    shaft.push([(1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2]);
  }
  const ang = Math.atan2(y2 - my, x2 - mx);
  const wing = (s: number): Pt[] => [
    [x2 - head * Math.cos(ang + s * 0.5), y2 - head * Math.sin(ang + s * 0.5)],
    [x2, y2],
  ];
  const ps = prog(frame, start, start + dur * 0.72, ease.inOut);
  const ph = prog(frame, start + dur * 0.7, start + dur, ease.out);
  return (
    <Svg w={w} h={h}>
      <Stroke pts={shaft} p={ps} color={color} width={width} />
      <Stroke pts={wing(1)} p={ph} color={color} width={width} />
      <Stroke pts={wing(-1)} p={ph} color={color} width={width} />
    </Svg>
  );
};

// 직선 계열 — 밑줄(살짝 휘고 끝이 올라감) / 취소선
export const HandLine: React.FC<{ from: Pt; to: Pt; start: number; dur?: number; color?: string; width?: number; wobble?: number; hook?: boolean; seed?: string; w?: number; h?: number }> = ({
  from,
  to,
  start,
  dur = 10,
  color = C.signal,
  width = 8,
  wobble = 4,
  hook = false,
  seed = "l",
  w,
  h,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, start + dur, ease.out);
  const pts: Pt[] = [];
  const ph = random(seed) * 6.28;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    pts.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t + Math.sin(t * Math.PI * 1.5 + ph) * wobble]);
  }
  if (hook) {
    const [ex, ey] = pts[pts.length - 1];
    pts.push([ex + 18, ey - 14], [ex + 6, ey - 26]);
  }
  return (
    <Svg w={w} h={h}>
      <Stroke pts={pts} p={p} color={color} width={width} />
    </Svg>
  );
};

// 형광펜 — 글자 뒤로 왼쪽에서 오른쪽으로 칠해진다
export const Highlighter: React.FC<{ x: number | string; y: number | string; w: number | string; h: number | string; start: number; dur?: number; color?: string; blend?: React.CSSProperties["mixBlendMode"]; skew?: number }> = ({
  x,
  y,
  w,
  h,
  start,
  dur = 10,
  color = C.signal,
  blend = "multiply",
  skew = -2,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, start + dur, ease.out);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        background: color,
        mixBlendMode: blend,
        transform: `skewX(${skew}deg) scaleX(${p})`,
        transformOrigin: "0% 50%",
        clipPath: "polygon(0.6% 6%, 30% 0%, 70% 4%, 100% 0%, 99.4% 50%, 100% 96%, 60% 100%, 25% 95%, 0% 100%, 0.8% 50%)",
      }}
    />
  );
};

// 종이 라벨 — 번호 + 문구, 팝으로 붙는다
export const Tag: React.FC<{ x: number; y: number; start: number; index?: string; text: string; size?: number; rotate?: number; dark?: boolean; anchor?: "left" | "right" | "center" }> = ({
  x,
  y,
  start,
  index,
  text,
  size = 40,
  rotate = -2,
  dark = false,
  anchor = "left",
}) => {
  const frame = useCurrentFrame();
  const s = sp(frame - start, POP);
  if (frame < start) return null;
  const tx = anchor === "left" ? "0%" : anchor === "right" ? "-100%" : "-50%";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) rotate(${rotate}deg) scale(${0.6 + 0.4 * s})`,
        transformOrigin: anchor === "right" ? "100% 50%" : anchor === "center" ? "50% 50%" : "0% 50%",
        opacity: Math.min(1, s * 1.6),
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: `${size * 0.28}px ${size * 0.45}px`,
        background: dark ? C.ink : C.white,
        color: dark ? C.white : C.ink,
        boxShadow: "0 10px 24px rgba(10,11,20,0.22)",
        whiteSpace: "nowrap",
      }}
    >
      {index && <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: size * 0.5, color: C.signal, letterSpacing: "0.06em" }}>{index}</span>}
      <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: size, letterSpacing: "-0.02em" }}>{text}</span>
    </div>
  );
};

// 고무 도장 — 크게 내려찍힌 뒤 살짝 튄다
export const Stamp: React.FC<{ x: number; y: number; start: number; text: string; sub?: string; size?: number; rotate?: number; color?: string }> = ({
  x,
  y,
  start,
  text,
  sub,
  size = 120,
  rotate = -12,
  color = C.signal,
}) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = frame - start;
  const s = t < 5 ? 1.9 - (0.9 * t) / 5 : 1 + 0.04 * Math.exp(-(t - 5) / 3) * Math.cos((t - 5) * 1.4);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${s})`,
        opacity: Math.min(1, t / 3) * 0.92,
        border: `${size * 0.06}px solid ${color}`,
        borderRadius: size * 0.08,
        padding: `${size * 0.06}px ${size * 0.22}px ${size * 0.1}px`,
        color,
        textAlign: "center",
        mixBlendMode: "multiply",
      }}
    >
      <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: size, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{text}</div>
      {sub && <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: size * 0.2, letterSpacing: "0.3em", marginTop: size * 0.02 }}>{sub}</div>}
    </div>
  );
};

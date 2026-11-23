import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { FONT, HAND, HEAD, INK, Paper } from "./theme";

/* ───────── 공통 유틸 ───────── */

export const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const eOut = Easing.out(Easing.cubic);
export const eOutExpo = Easing.out(Easing.exp);
export const eOutBack = Easing.out(Easing.back(1.5));
export const eInOut = Easing.inOut(Easing.cubic);
export const eIn = Easing.in(Easing.cubic);

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ramp = (f: number, a: number, b: number, ease: (x: number) => number = eOut) =>
  interpolate(f, [a, b], [0, 1], { ...CL, easing: ease });

export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

export const shake = (frame: number, amp: number, seed = "s") => ({
  x: noise2D(seed + "x", frame * 0.35, 0) * amp,
  y: noise2D(seed + "y", 0, frame * 0.35) * amp,
});

const hex = (h: string) => {
  const v = h.replace("#", "");
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};
export const mixHex = (a: string, b: string, k: number) => {
  const A = hex(a);
  const B = hex(b);
  const c = A.map((x, i) => Math.round(lerp(x, B[i], Math.max(0, Math.min(1, k)))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
export const alpha = (h: string, a: number) => {
  const [r, g, b] = hex(h);
  return `rgba(${r},${g},${b},${a})`;
};

// 글자 스타일 — 앱 UI(Pretendard) / 제목(고운바탕) / 손글씨(나눔손글씨 펜)
export const t = (size: number, weight = 600, color: string = INK.graphite, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: FONT,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: size >= 28 ? "-0.02em" : "-0.01em",
  lineHeight: 1.25,
  ...extra,
});
export const hand = (size: number, color: string = INK.navy, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: HAND,
  fontSize: size,
  fontWeight: 400,
  color,
  letterSpacing: "0.005em",
  lineHeight: 1.05,
  ...extra,
});

/* ───────── 종이 배경 ───────── */

export const PaperBg: React.FC<{ paper: Paper; to?: Paper; k?: number; ruled?: number; grid?: number; margin?: boolean; lineGap?: number; gridGap?: number }> = ({
  paper,
  to,
  k = 0,
  ruled = 0,
  grid = 0,
  margin = false,
  lineGap = 54,
  gridGap = 36,
}) => {
  const f = useCurrentFrame();
  const T = to ?? paper;
  const base = mixHex(paper.base, T.base, k);
  const tint = mixHex(paper.tint, T.tint, k);
  const gx = 30 + noise2D("pbx", f * 0.003, 0) * 10;
  const gy = 25 + noise2D("pby", 0, f * 0.003) * 8;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(80% 90% at ${gx}% ${gy}%, ${base} 0%, ${base} 45%, ${tint} 100%)` }}>
      {ruled > 0 ? (
        <AbsoluteFill style={{ opacity: ruled, backgroundImage: `linear-gradient(transparent ${lineGap - 2}px, ${paper.rule ?? "rgba(90,120,170,0.2)"} ${lineGap - 2}px, ${paper.rule ?? "rgba(90,120,170,0.2)"} ${lineGap}px)`, backgroundSize: `100% ${lineGap}px`, backgroundPosition: "0 18px" }} />
      ) : null}
      {grid > 0 ? (
        <AbsoluteFill
          style={{
            opacity: grid,
            backgroundImage: `linear-gradient(${paper.grid ?? "rgba(0,0,0,0.08)"} 1px, transparent 1px), linear-gradient(90deg, ${paper.grid ?? "rgba(0,0,0,0.08)"} 1px, transparent 1px)`,
            backgroundSize: `${gridGap}px ${gridGap}px`,
          }}
        />
      ) : null}
      {margin ? <div style={{ position: "absolute", left: 96, top: 0, bottom: 0, width: 2, background: paper.margin ?? "rgba(214,96,96,0.45)" }} /> : null}
      <AbsoluteFill style={{ mixBlendMode: "soft-light", opacity: 0.75 }}>
        <Img src={staticFile("gb/paper/paper.png")} style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────── 연필·잉크 필터 (루트에 한 번) ───────── */

export const FilterDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="gb-pencil" filterUnits="userSpaceOnUse" x={-400} y={-400} width={2800} height={1900}>
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={2.6} xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="1.9" numOctaves={1} seed={9} result="g" />
        <feColorMatrix in="g" type="luminanceToAlpha" result="ga" />
        <feComponentTransfer in="ga" result="gm">
          <feFuncA type="linear" slope={2.6} intercept={-0.32} />
        </feComponentTransfer>
        <feComposite in="rough" in2="gm" operator="in" />
      </filter>
      <filter id="gb-ink" filterUnits="userSpaceOnUse" x={-400} y={-400} width={2800} height={1900}>
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={2} seed={2} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6} xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves={2} seed={12} result="g" />
        <feColorMatrix in="g" type="luminanceToAlpha" result="ga" />
        <feComponentTransfer in="ga" result="gm">
          <feFuncA type="linear" slope={3.2} intercept={-0.45} />
        </feComponentTransfer>
        <feComposite in="rough" in2="gm" operator="in" />
      </filter>
    </defs>
  </svg>
);

/* ───────── 손그림 경로 생성 ───────── */

type Pt = [number, number];

export const smooth = (pts: Pt[]) => {
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};

// 손으로 그은 선: 중간점이 조금씩 흔들리고 끝이 살짝 넘친다
export const roughLine = (x1: number, y1: number, x2: number, y2: number, seed = 1, amp = 1.6): string => {
  const r = rng(seed);
  const len = Math.hypot(x2 - x1, y2 - y1);
  const n = Math.max(3, Math.round(len / 70));
  const nx = -(y2 - y1) / (len || 1);
  const ny = (x2 - x1) / (len || 1);
  const ext = 3 + r() * 4;
  const ux = (x2 - x1) / (len || 1);
  const uy = (y2 - y1) / (len || 1);
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const o = i === 0 || i === n ? (r() - 0.5) * amp : (r() - 0.5) * amp * 2;
    pts.push([x1 + (x2 - x1) * k + nx * o - (i === 0 ? ux * ext : 0) + (i === n ? ux * ext : 0), y1 + (y2 - y1) * k + ny * o - (i === 0 ? uy * ext : 0) + (i === n ? uy * ext : 0)]);
  }
  return smooth(pts);
};

// 여러 점을 지나는 손그림 선
export const roughPoly = (pts: Pt[], seed = 1, amp = 1.4): string => {
  const r = rng(seed);
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(2, Math.round(len / 60));
    for (let j = 0; j < n; j++) {
      const k = j / n;
      out.push([ax + (bx - ax) * k + (r() - 0.5) * amp * 2, ay + (by - ay) * k + (r() - 0.5) * amp * 2]);
    }
  }
  out.push(pts[pts.length - 1]);
  return smooth(out);
};

// 손그림 사각형: 네 변을 따로 긋고 모서리가 조금 넘친다
export const roughRect = (x: number, y: number, w: number, h: number, seed = 1, amp = 1.6): string =>
  [roughLine(x, y, x + w, y, seed, amp), roughLine(x + w, y, x + w, y + h, seed + 1, amp), roughLine(x + w, y + h, x, y + h, seed + 2, amp), roughLine(x, y + h, x, y, seed + 3, amp)].join(" ");

// 손그림 동그라미: 한 바퀴보다 조금 더 돌고, 반지름이 흔들린다
export const roughEllipse = (cx: number, cy: number, rx: number, ry: number, seed = 1, turns = 1.12, startDeg = -160): string => {
  const r = rng(seed);
  const N = 36;
  const pts: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const a = ((startDeg + (360 * turns * i) / N) * Math.PI) / 180;
    const j = 1 + (r() - 0.5) * 0.06 + (i / N) * 0.05;
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  return smooth(pts);
};

// 물결 밑줄
export const wavyLine = (x1: number, x2: number, y: number, seed = 1, amp = 3): string => {
  const r = rng(seed);
  const n = Math.max(4, Math.round((x2 - x1) / 40));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) pts.push([x1 + ((x2 - x1) * i) / n, y + Math.sin(i * 1.7 + r()) * amp * 0.6 + (r() - 0.5) * amp + (i / n) * -3]);
  return smooth(pts);
};

// 손그림 화살표(곡선 + 화살촉)
export const roughArrow = (from: Pt, to: Pt, bend = 0.2, seed = 1): { body: string; head: string } => {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const c: Pt = [mx - dy * bend, my + dx * bend];
  const r = rng(seed);
  const pts: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    const k = i / 8;
    const x = (1 - k) * (1 - k) * from[0] + 2 * (1 - k) * k * c[0] + k * k * to[0];
    const y = (1 - k) * (1 - k) * from[1] + 2 * (1 - k) * k * c[1] + k * k * to[1];
    pts.push([x + (i > 0 && i < 8 ? (r() - 0.5) * 2 : 0), y + (i > 0 && i < 8 ? (r() - 0.5) * 2 : 0)]);
  }
  const tx = to[0] - pts[7][0];
  const ty = to[1] - pts[7][1];
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl;
  const uy = ty / tl;
  const s = 18;
  const a1: Pt = [to[0] - ux * s - uy * s * 0.6, to[1] - uy * s + ux * s * 0.6];
  const a2: Pt = [to[0] - ux * s + uy * s * 0.6, to[1] - uy * s - ux * s * 0.6];
  return { body: smooth(pts), head: `M ${a1[0]} ${a1[1]} L ${to[0]} ${to[1]} L ${a2[0]} ${a2[1]}` };
};

/* ───────── 손그림 컴포넌트 ───────── */

// 획이 그려지는 잉크 선 (pathLength 정규화)
export const Ink: React.FC<{ d: string; color: string; width?: number; at: number; dur?: number; filter?: "pencil" | "ink" | "none"; opacity?: number; cap?: "round" | "butt" }> = ({
  d,
  color,
  width = 4,
  at,
  dur = 14,
  filter = "ink",
  opacity = 1,
  cap = "round",
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + dur, eInOut);
  if (p <= 0) return null;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap={cap}
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - p}
      opacity={opacity}
      filter={filter === "none" ? undefined : `url(#gb-${filter})`}
    />
  );
};

// 전체 화면 크기의 SVG 레이어
export const Layer: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none", ...style }}>
    {children}
  </svg>
);

// 형광펜: 글자 아래 절반을 왼→오로 칠한다
export const Highlighter: React.FC<{ x: number; y: number; w: number; h: number; color?: string; at: number; dur?: number; skew?: number }> = ({ x, y, w, h, color = INK.hiYellow, at, dur = 10, skew = -4 }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + dur, eOut);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w * p,
        height: h,
        background: color,
        transform: `skewX(${skew}deg) rotate(-0.6deg)`,
        borderRadius: "3px 8px 4px 9px",
        mixBlendMode: "multiply",
      }}
    />
  );
};

// 손글씨: 왼쪽부터 써 내려가듯 드러난다
export const HandText: React.FC<{ children: React.ReactNode; x: number; y: number; size: number; color?: string; at: number; dur?: number; rotate?: number; style?: React.CSSProperties }> = ({
  children,
  x,
  y,
  size,
  color = INK.navy,
  at,
  dur = 16,
  rotate = -1.5,
  style,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + dur, (v) => v);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rotate}deg)`, transformOrigin: "0% 50%", whiteSpace: "nowrap", clipPath: `inset(-20% ${(1 - p) * 100}% -30% -2%)`, ...hand(size, color), ...style }}>
      {children}
    </div>
  );
};

// 포스트잇
export const Sticky: React.FC<{ x: number; y: number; w?: number; h?: number; color: string; rot?: number; at: number; children?: React.ReactNode; shadow?: number }> = ({
  x,
  y,
  w = 150,
  h = 128,
  color,
  rot = 0,
  at,
  children,
  shadow = 1,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const p = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 210, mass: 0.6 } });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `translateY(${(1 - p) * -40}px) rotate(${rot + (1 - p) * 8}deg) scale(${lerp(1.25, 1, p)})`,
        opacity: interpolate(f - at, [0, 2], [0, 1], CL),
        background: `linear-gradient(180deg, ${color} 0%, ${color} 70%, ${alpha(color.startsWith("#") ? color : "#FFFFFF", 0.92)} 100%)`,
        boxShadow: `0 ${12 * shadow}px ${22 * shadow}px rgba(70,50,20,0.18), 0 2px 3px rgba(70,50,20,0.14)`,
        borderRadius: 2,
        padding: "16px 14px 12px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 22, background: "rgba(0,0,0,0.045)" }} />
      {children}
    </div>
  );
};

// 마스킹 테이프
export const Tape: React.FC<{ x: number; y: number; w?: number; rot?: number; color?: string; opacity?: number }> = ({ x, y, w = 120, rot = -4, color = "rgba(250,244,220,0.78)", opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: 30,
      background: color,
      transform: `rotate(${rot}deg)`,
      opacity,
      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
      clipPath: "polygon(0% 8%, 4% 0%, 8% 10%, 12% 0%, 88% 2%, 92% 10%, 96% 0%, 100% 8%, 100% 92%, 96% 100%, 92% 90%, 88% 100%, 12% 98%, 8% 90%, 4% 100%, 0% 92%)",
    }}
  />
);

// 도장 (상태 표시 · 초안)
export const Stamp: React.FC<{ children: React.ReactNode; color: string; at: number; rot?: number; size?: number; style?: React.CSSProperties; pad?: string }> = ({ children, color, at, rot = -3, size = 24, style, pad = "10px 18px" }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 7], [0, 1], { ...CL, easing: eOutBack });
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", transform: `rotate(${rot}deg) scale(${lerp(1.7, 1, p)})`, opacity: interpolate(f, [at, at + 3], [0, 1], CL), ...style }}>
      <div style={{ position: "relative", padding: pad, filter: "url(#gb-ink)" }}>
        <div style={{ position: "absolute", inset: 0, border: `3px solid ${color}`, borderRadius: 4 }} />
        <div style={{ position: "absolute", inset: 5, border: `1.5px solid ${color}`, borderRadius: 2, opacity: 0.8 }} />
        <div style={{ position: "relative", ...t(size, 800, color, { lineHeight: 1.1, whiteSpace: "nowrap", letterSpacing: "-0.01em" }) }}>{children}</div>
      </div>
    </div>
  );
};

// 상태 도장 — 우측 상단 고정
export const StatusStamp: React.FC<{ kind: "example" | "now"; at: number }> = ({ kind, at }) => {
  const isEx = kind === "example";
  const col = isEx ? "#C8432F" : "#0B8F5E";
  return (
    <Stamp color={col} at={at} rot={-2} size={23} style={{ right: 64, top: 48, zIndex: 50 }} pad="12px 20px">
      <span style={{ fontSize: 13, letterSpacing: "0.16em", display: "block", marginBottom: 4, fontWeight: 800 }}>{isEx ? "EXAMPLE" : "AVAILABLE NOW"}</span>
      {isEx ? "방향 예시 · 개발필요 · 가상 데이터" : "지금 됨 · ClassIn 화면 재구성 · 가상 데이터"}
    </Stamp>
  );
};

// 좌상단 머리글 — 공책 쪽수
export const Hud: React.FC<{ page: number; label?: string; at?: number; out?: number; color?: string }> = ({ page, label = "개별진도 × ClassIn + AI", at = 0, out, color = INK.sub }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 10);
  const o = out !== undefined ? ramp(f, out, out + 8) : 0;
  return (
    <div style={{ position: "absolute", top: 50, left: 120, display: "flex", alignItems: "baseline", gap: 16, opacity: p * (1 - o), zIndex: 40 }}>
      <span style={hand(34, INK.red)}>p.{page}</span>
      <span style={t(17, 600, color, { letterSpacing: "0.02em" })}>{label}</span>
    </div>
  );
};

/* ───────── 키네틱 타이포 (제목) ───────── */

export type Seg = { t: string; c?: string; w?: number };

export const KText: React.FC<{
  lines: Seg[][];
  at: number;
  size: number;
  weight?: number;
  color?: string;
  font?: string;
  stagger?: number;
  out?: number;
  outDur?: number;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  style?: React.CSSProperties;
}> = ({ lines, at, size, weight = 700, color = INK.head, font = HEAD, stagger = 1.4, out, outDur = 8, align = "left", lineHeight = 1.24, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let gi = 0;
  return (
    <div style={{ textAlign: align, fontFamily: font, fontSize: size, fontWeight: weight, color, letterSpacing: "-0.015em", ...style }}>
      {lines.map((line, li) => (
        <div key={li} style={{ whiteSpace: "pre", lineHeight, height: size * lineHeight }}>
          {line.map((seg, si) =>
            Array.from(seg.t).map((ch, ci) => {
              const i = gi++;
              const local = frame - at - i * stagger;
              const p = spring({ frame: local, fps, config: { damping: 18, stiffness: 150, mass: 0.7 } });
              let tr = `translateY(${(1 - p) * 0.45}em)`;
              let op = interpolate(local, [0, 5], [0, 1], CL);
              let bl = (1 - Math.min(1, p)) * 6;
              if (out !== undefined) {
                const o = interpolate(frame - out - i * 0.4, [0, outDur], [0, 1], { ...CL, easing: eIn });
                tr += ` translateY(${-o * 0.3}em)`;
                op *= 1 - o;
                bl += o * 8;
              }
              return (
                <span key={`${li}-${si}-${ci}`} style={{ display: "inline-block", transform: tr, opacity: op, filter: bl > 0.3 ? `blur(${bl}px)` : undefined, color: seg.c ?? color, fontWeight: seg.w ?? weight }}>
                  {ch}
                </span>
              );
            }),
          )}
        </div>
      ))}
    </div>
  );
};

/* ───────── 커서 · 전환 ───────── */

export const Cursor: React.FC<{ path: Array<{ f: number; x: number; y: number }>; clicks: number[]; show: [number, number] }> = ({ path, clicks, show }) => {
  const f = useCurrentFrame();
  if (f < show[0] || f > show[1]) return null;
  let x = path[0].x;
  let y = path[0].y;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (f >= a.f && f <= b.f) {
      const k = interpolate(f, [a.f, b.f], [0, 1], { ...CL, easing: eInOut });
      x = lerp(a.x, b.x, k);
      y = lerp(a.y, b.y, k);
    } else if (f > b.f) {
      x = b.x;
      y = b.y;
    }
  }
  const op = interpolate(f, [show[0], show[0] + 5, show[1] - 5, show[1]], [0, 1, 1, 0], CL);
  const press = clicks.some((c) => f >= c && f < c + 4) ? 0.85 : 1;
  return (
    <>
      {clicks.map((c) => {
        const k = interpolate(f, [c, c + 14], [0, 1], { ...CL, easing: eOut });
        if (f < c || k >= 1) return null;
        return <div key={c} style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, border: `2.5px solid #00A975`, borderRadius: 999, transform: `scale(${0.25 + k * 1.1})`, opacity: 1 - k, zIndex: 60 }} />;
      })}
      <svg width={44} height={52} viewBox="0 0 44 52" style={{ position: "absolute", left: x - 6, top: y - 4, opacity: op, transform: `scale(${press})`, transformOrigin: "6px 4px", zIndex: 61, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.28))" }}>
        <path d="M6 4 L6 40 L15.5 31 L22 46 L29 43 L22.5 28.5 L36 28.5 Z" fill="#141414" stroke="#FFFFFF" strokeWidth={2.5} strokeLinejoin="round" />
      </svg>
    </>
  );
};

export const Sheen: React.FC<{ at: number; dur?: number; angle?: number; strength?: number }> = ({ at, dur = 22, angle = 115, strength = 0.35 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [-0.4, 1.4], CL);
  if (f < at || f > at + dur) return null;
  return <AbsoluteFill style={{ background: `linear-gradient(${angle}deg, rgba(255,255,255,0) ${p * 100 - 16}%, rgba(255,255,255,${strength}) ${p * 100}%, rgba(255,255,255,0) ${p * 100 + 16}%)`, pointerEvents: "none" }} />;
};

export const Flash: React.FC<{ at: number; dur?: number; color?: string; peak?: number }> = ({ at, dur = 10, color = "#FFFDF7", peak = 0.8 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - 1, at, at + dur], [0, peak, 0], { ...CL, easing: eOut });
  if (o <= 0.001) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none", zIndex: 80 }} />;
};

export const HBlurDefs: React.FC<{ id: string; amount: number }> = ({ id, amount }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id={id} x="-20%" y="-5%" width="140%" height="110%">
        <feGaussianBlur stdDeviation={`${Math.max(0, amount)} 0`} />
      </filter>
    </defs>
  </svg>
);

export const Whip: React.FC<{ id: string; enter?: number; exit?: number; children: React.ReactNode; dur?: number }> = ({ id, enter, exit, children, dur = 8 }) => {
  const f = useCurrentFrame();
  let x = 0;
  let blur = 0;
  let op = 1;
  if (enter !== undefined) {
    const p = interpolate(f, [enter, enter + dur], [0, 1], { ...CL, easing: eOutExpo });
    x += (1 - p) * 520;
    blur += (1 - p) * 50;
    op *= interpolate(f, [enter, enter + 3], [0, 1], CL);
  }
  if (exit !== undefined) {
    const p = interpolate(f, [exit - dur, exit], [0, 1], { ...CL, easing: eIn });
    x -= p * 520;
    blur += p * 50;
    op *= 1 - interpolate(f, [exit - 3, exit], [0, 1], CL);
  }
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)`, opacity: op, filter: blur > 0.5 ? `url(#${id})` : undefined }}>
      {blur > 0.5 ? <HBlurDefs id={id} amount={blur} /> : null}
      {children}
    </AbsoluteFill>
  );
};

import React, { useId } from "react";
import { Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { arrow, hatch, roughEllipse, roughLine, roughPoly, roughRect, scribble } from "./sketch";
import type { Pt } from "./sketch";
import { GAEGU, G_FPS, P } from "./theme";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** 선이 끓는 주기 — 4프레임마다 3장의 그림을 돌려 쓴다(손그림 애니메이션의 line boil) */
export const useBoil = (rate = 4, cycle = 3) => Math.floor(useCurrentFrame() / rate) % cycle;

/** 0→1 진행값(이징 포함) */
export const prog = (frame: number, from: number, dur: number, easing: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(frame, [from, from + dur], [0, 1], { ...CLAMP, easing });

export const ease = {
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
  in: Easing.in(Easing.cubic),
  expo: Easing.out(Easing.exp),
  back: Easing.out(Easing.back(1.7)),
  linear: (t: number) => t,
};

export const POP = { damping: 11, stiffness: 240, mass: 0.6 };
export const SOFTPOP = { damping: 15, stiffness: 200, mass: 0.7 };
export const SETTLE = { damping: 200, stiffness: 140, mass: 0.8 };

/** 스프링(프레임 오프셋만 넘기면 된다) */
export const pop = (f: number, config: { damping: number; stiffness: number; mass: number } = POP) => spring({ frame: f, fps: G_FPS, config });

/** 잉크 선 — draw(0~1)로 그려지는 과정을 표현한다 */
export const Stroke: React.FC<{
  d: string;
  color?: string;
  w?: number;
  draw?: number;
  opacity?: number;
  cap?: "round" | "butt" | "square";
  dash?: string;
  blend?: React.CSSProperties["mixBlendMode"];
}> = ({ d, color = P.ink, w = 5, draw = 1, opacity = 1, cap = "round", dash, blend }) => {
  if (draw <= 0.001 || !d) return null;
  const partial = draw < 0.999;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeLinecap={cap}
      strokeLinejoin="round"
      opacity={opacity}
      pathLength={partial ? 1 : undefined}
      strokeDasharray={partial ? "1 1" : dash}
      strokeDashoffset={partial ? 1 - draw : undefined}
      style={blend ? { mixBlendMode: blend } : undefined}
    />
  );
};

/** 마커로 칠하듯 드러내기 — 지그재그 마스크가 영역을 덮어 간다 */
export const MarkerReveal: React.FC<{
  box: readonly [number, number, number, number];
  p: number;
  seed: string;
  gap?: number;
  angle?: number;
  children: React.ReactNode;
}> = ({ box, p, seed, gap, angle = -12, children }) => {
  const id = useId().replace(/:/g, "");
  if (p <= 0.001) return null;
  if (p >= 0.999) return <>{children}</>;
  const [x, y, w, h] = box;
  const g = gap ?? Math.max(24, Math.min(w, h) / 5);
  const pad = g * 0.8;
  return (
    <>
      <mask id={id} maskUnits="userSpaceOnUse" x={x - pad * 2} y={y - pad * 2} width={w + pad * 4} height={h + pad * 4}>
        <path
          d={scribble(x - pad, y - pad, w + pad * 2, h + pad * 2, seed, { gap: g, angle })}
          fill="none"
          stroke="#fff"
          strokeWidth={g * 2.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - p}
        />
      </mask>
      <g mask={`url(#${id})`}>{children}</g>
    </>
  );
};

type ShapeBase = {
  seed: string;
  fill?: string;
  stroke?: string | null;
  w?: number;
  /** 윤곽선 드로온 0~1 */
  draw?: number;
  /** 채우기 드러남 0~1 (마커 칠) */
  ink?: number;
  /** 채우기 어긋남(인쇄 판이 살짝 밀린 느낌) */
  off?: readonly [number, number];
  rough?: number;
  fillOpacity?: number;
  /** boil 끄기 */
  still?: boolean;
  opacity?: number;
  /** 한 번 더 덧그린 가는 선(스케치 느낌). 기본 켜짐 */
  twice?: boolean;
};

const FillPath: React.FC<{ d: string; fill: string; off: readonly [number, number]; ink: number; box: readonly [number, number, number, number]; seed: string; opacity: number }> = ({
  d,
  fill,
  off,
  ink,
  box,
  seed,
  opacity,
}) => (
  <MarkerReveal box={box} p={ink} seed={`${seed}mk`}>
    <path d={d} fill={fill} opacity={opacity} transform={`translate(${off[0]} ${off[1]})`} />
  </MarkerReveal>
);

export const SRect: React.FC<ShapeBase & { x: number; y: number; width: number; height: number; r?: number }> = ({
  x,
  y,
  width,
  height,
  r = 0,
  seed,
  fill,
  stroke = P.ink,
  w = 5,
  draw = 1,
  ink = 1,
  off = [4, 5],
  rough = 1,
  fillOpacity = 1,
  still,
  opacity = 1,
  twice = true,
}) => {
  const b = useBoil();
  const s = still ? seed : `${seed}:${b}`;
  const d = roughRect(x, y, width, height, s, { r, rough });
  const d2 = roughRect(x, y, width, height, still ? `${seed}2` : `${seed}2:${b}`, { r, rough: rough * 1.25 });
  return (
    <g opacity={opacity}>
      {fill && <FillPath d={roughRect(x, y, width, height, `${seed}f`, { r, rough: rough * 0.6 })} fill={fill} off={off} ink={ink} box={[x, y, width, height]} seed={seed} opacity={fillOpacity} />}
      {stroke && twice && <Stroke d={d2} color={stroke} w={w * 0.5} draw={Math.max(0, draw * 1.25 - 0.25)} opacity={0.55} />}
      {stroke && <Stroke d={d} color={stroke} w={w} draw={draw} />}
    </g>
  );
};

export const SEllipse: React.FC<ShapeBase & { cx: number; cy: number; rx: number; ry?: number; overlap?: number }> = ({
  cx,
  cy,
  rx,
  ry,
  seed,
  fill,
  stroke = P.ink,
  w = 5,
  draw = 1,
  ink = 1,
  off = [3, 4],
  rough = 1,
  fillOpacity = 1,
  still,
  overlap,
  opacity = 1,
  twice = false,
}) => {
  const b = useBoil();
  const s = still ? seed : `${seed}:${b}`;
  const ryy = ry ?? rx;
  return (
    <g opacity={opacity}>
      {fill && (
        <FillPath d={`${roughEllipse(cx, cy, rx, ryy, `${seed}f`, { rough: rough * 0.5, overlap: 0 })}Z`} fill={fill} off={off} ink={ink} box={[cx - rx, cy - ryy, rx * 2, ryy * 2]} seed={seed} opacity={fillOpacity} />
      )}
      {stroke && twice && <Stroke d={roughEllipse(cx, cy, rx + 1, ryy + 1, still ? `${seed}2` : `${seed}2:${b}`, { rough: rough * 1.3, overlap: 0.05, start: 0.4 })} color={stroke} w={w * 0.5} draw={Math.max(0, draw * 1.25 - 0.25)} opacity={0.55} />}
      {stroke && <Stroke d={roughEllipse(cx, cy, rx, ryy, s, { rough, overlap })} color={stroke} w={w} draw={draw} />}
    </g>
  );
};

export const SPoly: React.FC<ShapeBase & { pts: readonly Pt[]; closed?: boolean }> = ({
  pts,
  closed = true,
  seed,
  fill,
  stroke = P.ink,
  w = 5,
  draw = 1,
  ink = 1,
  off = [3, 4],
  rough = 1,
  fillOpacity = 1,
  still,
  opacity = 1,
  twice = false,
}) => {
  const b = useBoil();
  const s = still ? seed : `${seed}:${b}`;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const box = [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)] as const;
  return (
    <g opacity={opacity}>
      {fill && <FillPath d={`${roughPoly(pts, `${seed}f`, { closed: true, rough: rough * 0.6 })}Z`} fill={fill} off={off} ink={ink} box={box} seed={seed} opacity={fillOpacity} />}
      {stroke && twice && <Stroke d={roughPoly(pts, still ? `${seed}2` : `${seed}2:${b}`, { closed, rough: rough * 1.25 })} color={stroke} w={w * 0.5} draw={Math.max(0, draw * 1.25 - 0.25)} opacity={0.55} />}
      {stroke && <Stroke d={roughPoly(pts, s, { closed, rough })} color={stroke} w={w} draw={draw} />}
    </g>
  );
};

export const SLine: React.FC<{ a: Pt; b: Pt; seed: string; color?: string; w?: number; draw?: number; rough?: number; still?: boolean; opacity?: number; dash?: string }> = ({
  a,
  b,
  seed,
  color = P.ink,
  w = 5,
  draw = 1,
  rough = 1,
  still,
  opacity = 1,
  dash,
}) => {
  const boil = useBoil();
  return <Stroke d={roughLine(a, b, still ? seed : `${seed}:${boil}`, rough)} color={color} w={w} draw={draw} opacity={opacity} dash={dash} />;
};

/** 손으로 그린 화살표. draw가 0.75를 넘으면 촉이 그려진다 */
export const SArrow: React.FC<{ a: Pt; b: Pt; seed: string; color?: string; w?: number; draw?: number; bend?: number; head?: number; still?: boolean }> = ({
  a,
  b,
  seed,
  color = P.ink,
  w = 4.5,
  draw = 1,
  bend = 0.18,
  head = 20,
  still,
}) => {
  const boil = useBoil();
  const { shaft, head: h } = arrow(a, b, still ? seed : `${seed}:${boil}`, { bend, head });
  return (
    <g>
      <Stroke d={shaft} color={color} w={w} draw={Math.min(1, draw / 0.75)} />
      <Stroke d={h} color={color} w={w} draw={Math.max(0, (draw - 0.7) / 0.3)} />
    </g>
  );
};

/** 빗금 채우기 — 주어진 사각 영역을 빗금으로 덮는다(필요하면 clipPath로 잘라 쓴다) */
export const Hatch: React.FC<{ box: readonly [number, number, number, number]; seed: string; color?: string; w?: number; gap?: number; angle?: number; draw?: number; opacity?: number; clip?: string }> = ({
  box,
  seed,
  color = P.ink,
  w = 2.5,
  gap = 14,
  angle = -45,
  draw = 1,
  opacity = 1,
  clip,
}) => {
  const id = useId().replace(/:/g, "");
  const lines = hatch(box[0], box[1], box[2], box[3], seed, { gap, angle });
  const n = lines.length;
  return (
    <g opacity={opacity}>
      <clipPath id={id}>{clip ? <path d={clip} /> : <rect x={box[0]} y={box[1]} width={box[2]} height={box[3]} />}</clipPath>
      <g clipPath={`url(#${id})`}>
        {lines.map((d, i) => {
          const local = Math.max(0, Math.min(1, draw * (n + 3) - i) / 3);
          return <Stroke key={i} d={d} color={color} w={w} draw={local} />;
        })}
      </g>
    </g>
  );
};

/** 마커 낙서 덩어리(형광펜·강조용) */
export const Scribble: React.FC<{ box: readonly [number, number, number, number]; seed: string; color?: string; w?: number; gap?: number; angle?: number; draw?: number; opacity?: number; still?: boolean; blend?: boolean }> = ({
  box,
  seed,
  color = P.lime,
  w,
  gap = 26,
  angle = -6,
  draw = 1,
  opacity = 1,
  still,
  blend = true,
}) => {
  const boil = useBoil(5, 3);
  return (
    <Stroke d={scribble(box[0], box[1], box[2], box[3], still ? seed : `${seed}:${boil}`, { gap, angle })} color={color} w={w ?? gap * 1.25} draw={draw} opacity={opacity} blend={blend ? "multiply" : undefined} />
  );
};

/** SVG 손글씨 라벨 */
export const Label: React.FC<{
  x: number;
  y: number;
  size: number;
  children: React.ReactNode;
  font?: string;
  color?: string;
  anchor?: "start" | "middle" | "end";
  rotate?: number;
  weight?: number;
  opacity?: number;
  /** 0~1 등장(팝) 진행값 */
  p?: number;
  spacing?: string;
}> = ({ x, y, size, children, font = GAEGU, color = P.ink, anchor = "start", rotate = 0, weight = 700, opacity = 1, p = 1, spacing }) => {
  const ls = spacing ?? (font === GAEGU ? "-0.04em" : "-0.01em");
  if (p <= 0.001) return null;
  const sc = 0.5 + 0.5 * p;
  return (
    <text
      x={0}
      y={0}
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${sc})`}
      fontFamily={font}
      fontSize={size}
      fontWeight={weight}
      fill={color}
      textAnchor={anchor}
      opacity={opacity * Math.min(1, p * 2.5)}
      style={{ letterSpacing: ls, wordSpacing: font === GAEGU ? "-0.12em" : undefined }}
    >
      {children}
    </text>
  );
};

/** Gaegu 손글씨의 대략적인 가로 폭(px) — 형광펜 길이를 글자에 맞추는 데 쓴다 */
export const handWidth = (text: string, size: number) =>
  Array.from(text).reduce((w, ch) => w + (ch === " " ? 0.3 : /[가-힣]/.test(ch) ? 0.76 : /[A-Z0-9]/.test(ch) ? 0.56 : 0.44), 0) * size;

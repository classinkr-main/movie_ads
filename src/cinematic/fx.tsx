import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { BAR_H, H, K, W, rgba } from "./theme";

export const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** 아나모픽 렌즈 플레어 — 가로 스트릭 + 코어 + 고스트. screen 합성. */
export const Flare: React.FC<{
  x: number;
  y: number;
  power: number; // 0~1.4
  length?: number; // 스트릭 길이(px)
  color?: string;
  ghosts?: boolean;
  core?: number; // 코어 반지름 배율
}> = ({ x, y, power, length = 2000, color = K.mint, ghosts = true, core = 1 }) => {
  if (power <= 0.004) return null;
  const p = Math.min(1.4, power);
  const L = length * (0.55 + p * 0.5);
  const R = 150 * core * (0.6 + p * 0.5);
  const cx = W / 2;
  const cy = H / 2;
  const ghost = (k: number, size: number, col: string, a: number, ring = false) => (
    <div
      key={k}
      style={{
        position: "absolute",
        left: (cx - x) * k - size / 2,
        top: (cy - y) * k - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: ring
          ? `radial-gradient(circle, transparent 54%, ${rgba(col, a)} 62%, ${rgba(col, a * 0.5)} 68%, transparent 72%)`
          : `radial-gradient(circle, ${rgba(col, a)} 0%, ${rgba(col, a * 0.6)} 45%, transparent 70%)`,
      }}
    />
  );
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, mixBlendMode: "screen", opacity: Math.min(1, p), pointerEvents: "none" }}>
      {/* 넓고 부드러운 스트릭 */}
      <div style={{ position: "absolute", left: -L / 2, top: -46, width: L, height: 92, background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(color, 0.5)} 0%, ${rgba(color, 0.16)} 36%, transparent 70%)` }} />
      {/* 얇고 뜨거운 스트릭 */}
      <div
        style={{
          position: "absolute",
          left: -L * 0.62,
          top: -3.5,
          width: L * 1.24,
          height: 7,
          borderRadius: 7,
          background: `linear-gradient(90deg, transparent 0%, ${rgba(color, 0.25)} 16%, ${rgba(color, 0.95)} 40%, #ffffff 50%, ${rgba(color, 0.95)} 60%, ${rgba(color, 0.25)} 84%, transparent 100%)`,
          filter: "blur(1.6px)",
        }}
      />
      <div style={{ position: "absolute", left: -L * 0.4, top: -1, width: L * 0.8, height: 2, background: `linear-gradient(90deg, transparent, #ffffff 50%, transparent)` }} />
      {/* 세로 스파이크 */}
      <div style={{ position: "absolute", left: -1.5, top: -R * 0.9, width: 3, height: R * 1.8, background: `linear-gradient(180deg, transparent, ${rgba(K.mintHot, 0.8)} 50%, transparent)`, filter: "blur(1px)" }} />
      {/* 할로 + 코어 */}
      <div style={{ position: "absolute", left: -R * 2.6, top: -R * 2.6, width: R * 5.2, height: R * 5.2, borderRadius: "50%", background: `radial-gradient(circle, ${rgba(color, 0.3)} 0%, ${rgba(color, 0.1)} 34%, transparent 68%)` }} />
      <div style={{ position: "absolute", left: -R, top: -R, width: R * 2, height: R * 2, borderRadius: "50%", background: `radial-gradient(circle, #ffffff 0%, ${rgba(K.mintHot, 0.9)} 14%, ${rgba(color, 0.42)} 34%, transparent 68%)` }} />
      {ghosts && (
        <>
          {ghost(0.55, 46, K.mint, 0.22)}
          {ghost(0.82, 110, "#8AD8FF", 0.1, true)}
          {ghost(1.32, 70, K.amber, 0.12)}
          {ghost(1.62, 190, K.mint, 0.08, true)}
          {ghost(1.95, 36, "#8AD8FF", 0.2)}
        </>
      )}
    </div>
  );
};

/** 전체 화면 블룸(할레이션) — 뒤 화면을 흐리게 떠서 screen으로 얹는다. */
export const Bloom: React.FC<{ amount?: number; radius?: number }> = ({ amount = 0.5, radius = 22 }) => (
  <AbsoluteFill style={{ backdropFilter: `blur(${radius}px) contrast(1.45) brightness(1.02)`, WebkitBackdropFilter: `blur(${radius}px) contrast(1.45) brightness(1.02)`, mixBlendMode: "screen", opacity: amount, pointerEvents: "none" }} />
);

/** 레터박스 — h=BAR_H 이면 2.39:1 */
export const Letterbox: React.FC<{ h?: number }> = ({ h = BAR_H }) =>
  h <= 0.2 ? null : (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: h, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, width: W, height: h, background: "#000" }} />
    </>
  );

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.7 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 72% 78% at 50% 50%, transparent 48%, rgba(0,0,0,${strength * 0.55}) 80%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: "none" }} />
);

/** 필름 그레인 — 프레임마다 시드가 바뀌는 타일 노이즈 */
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.5 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`fg${frame}`) * 997);
  const ox = Math.floor(random(`fgx${frame}`) * 256);
  const oy = Math.floor(random(`fgy${frame}`) * 256);
  const url = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
  return (
    <>
      <AbsoluteFill style={{ backgroundImage: url, backgroundSize: "256px 256px", backgroundPosition: `${ox}px ${oy}px`, mixBlendMode: "overlay", opacity, pointerEvents: "none" }} />
      <AbsoluteFill style={{ backgroundImage: url, backgroundSize: "256px 256px", backgroundPosition: `${oy}px ${ox}px`, mixBlendMode: "screen", opacity: opacity * 0.09, pointerEvents: "none" }} />
    </>
  );
};

/** 컷을 가로지르는 라이트 리크 */
export const LightLeak: React.FC<{ at: number; dur?: number; color?: string; dir?: 1 | -1; strength?: number; y?: number }> = ({ at, dur = 14, color = K.mint, dir = 1, strength = 0.55, y = 0.5 }) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  if (f < -dur / 2 || f > dur / 2) return null;
  const t = (f + dur / 2) / dur; // 0→1
  const x = dir === 1 ? interpolate(t, [0, 1], [-0.25, 1.25]) : interpolate(t, [0, 1], [1.25, -0.25]);
  const a = Math.sin(Math.PI * t) * strength;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: a, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x * W - 700, top: y * H - 900, width: 1400, height: 1800, background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(color, 0.85)} 0%, ${rgba(color, 0.35)} 32%, transparent 70%)` }} />
      <div style={{ position: "absolute", left: x * W - 1100 * dir, top: y * H - 500, width: 900, height: 1000, background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${rgba(K.amber, 0.5)} 0%, transparent 68%)` }} />
    </AbsoluteFill>
  );
};

/** 임팩트 플래시 */
export const Flash: React.FC<{ at: number; dur?: number; color?: string; strength?: number }> = ({ at, dur = 9, color = K.mintHot, strength = 0.75 }) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  if (f < 0 || f > dur) return null;
  const a = Math.pow(1 - f / dur, 2.2) * strength;
  return <AbsoluteFill style={{ background: color, opacity: a, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

/** 임팩트 카메라 셰이크 — transform 문자열 */
export const shake = (frame: number, hits: Array<[number, number]>): string => {
  let x = 0;
  let y = 0;
  let r = 0;
  let s = 0;
  for (const [at, amp] of hits) {
    const f = frame - at;
    if (f < 0 || f > 22) continue;
    const d = Math.exp(-f / 4.2) * amp;
    x += (random(`sx${at}-${f}`) - 0.5) * 2 * d;
    y += (random(`sy${at}-${f}`) - 0.5) * 2 * d;
    r += (random(`sr${at}-${f}`) - 0.5) * 0.05 * d;
    s += d * 0.0016;
  }
  return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg) scale(${(1 + s).toFixed(4)})`;
};

/** 공기 중 먼지·보케 — 깊이(z)에 따라 크기·선명도·패럴랙스가 달라진다 */
export const Dust: React.FC<{
  count?: number;
  seed?: string;
  px?: number; // 카메라 패럴랙스(px)
  py?: number;
  wind?: number; // 프레임당 가로 이동
  rise?: number; // 프레임당 세로 이동(음수=위로)
  opacity?: number;
  color?: string;
  near?: number; // 큰 보케 비율 0~1
}> = ({ count = 70, seed = "d", px = 0, py = 0, wind = 0.25, rise = -0.12, opacity = 1, color = K.mintHot, near = 0.22 }) => {
  const frame = useCurrentFrame();
  if (opacity <= 0.005) return null;
  const MW = W + 400;
  const MH = H + 300;
  const items = [];
  for (let i = 0; i < count; i++) {
    const r1 = random(`${seed}a${i}`);
    const r2 = random(`${seed}b${i}`);
    const r3 = random(`${seed}c${i}`);
    const r4 = random(`${seed}d${i}`);
    const isNear = r3 < near;
    const z = isNear ? 0.7 + r4 * 0.3 : r4 * 0.6; // 0 멀리 · 1 가까이
    const depth = 0.25 + z * 1.6;
    let x = r1 * MW + (px + frame * wind) * depth + Math.sin(frame / (38 + r2 * 40) + r1 * 20) * 14 * depth;
    let y = r2 * MH + (py + frame * rise) * depth + Math.cos(frame / (44 + r1 * 36) + r2 * 20) * 10 * depth;
    x = ((x % MW) + MW) % MW - 200;
    y = ((y % MH) + MH) % MH - 150;
    const size = isNear ? 26 + r4 * 70 : 2 + z * 7;
    const tw = 0.55 + 0.45 * Math.sin(frame / (9 + r3 * 14) + r1 * 30);
    const a = (isNear ? 0.09 + r1 * 0.08 : 0.25 + z * 0.6) * tw;
    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          opacity: a,
          background: isNear
            ? `radial-gradient(circle, ${rgba(color, 0.55)} 0%, ${rgba(color, 0.6)} 52%, ${rgba(color, 0.95)} 66%, transparent 72%)`
            : `radial-gradient(circle, #ffffff 0%, ${rgba(color, 0.9)} 35%, transparent 70%)`,
        }}
      />,
    );
  }
  return <AbsoluteFill style={{ mixBlendMode: "screen", opacity, pointerEvents: "none" }}>{items}</AbsoluteFill>;
};

/** 가로 모션 블러(휩 팬) — children 전체에 방향성 블러를 건다 */
export const WhipBlur: React.FC<{ id: string; amount: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ id, amount, children, style }) => {
  const on = amount > 0.6;
  return (
    <AbsoluteFill style={{ ...style, filter: on ? `url(#${id})` : undefined }}>
      {on && (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={id} x="-10%" y="0%" width="120%" height="100%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${amount.toFixed(1)} 0`} />
          </filter>
        </svg>
      )}
      {children}
    </AbsoluteFill>
  );
};

/** 다크 스테이지 배경 — 깊은 그린 블랙 + 바닥 빛 웅덩이 */
export const Stage: React.FC<{ glowX?: number; glowY?: number; glow?: number; children?: React.ReactNode }> = ({ glowX = 0.5, glowY = 0.5, glow = 0.5, children }) => (
  <AbsoluteFill style={{ background: K.stage }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 70% at ${glowX * 100}% ${glowY * 100}%, ${rgba(K.green, 0.42 * glow)} 0%, ${rgba(K.forest, 0.26 * glow)} 38%, transparent 72%)` }} />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 58%, ${rgba(K.forest, 0.22 * glow)} 78%, rgba(0,0,0,0.5) 100%)` }} />
    {children}
  </AbsoluteFill>
);

export const fade = (frame: number, a: number, b: number, c: number, d: number) => interpolate(frame, [a, b, c, d], [0, 1, 1, 0], cl);

/* ───────── 어제 — 옛 필름 ───────── */

/** 좌우 필러박스(4:3 게이트). w=0 이면 없음 */
export const Pillarbox: React.FC<{ w: number }> = ({ w }) =>
  w <= 0.2 ? null : (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: H, background: "#000" }} />
      <div style={{ position: "absolute", right: 0, top: 0, width: w, height: H, background: "#000" }} />
    </>
  );

/** 필름 손상 — 세로 스크래치 · 먼지 · 머리카락 · 깜박임 · 게이트 비네트. x0~x1 범위(게이트 안)에만 그린다 */
export const FilmDamage: React.FC<{ x0: number; x1: number; strength?: number }> = ({ x0, x1, strength = 1 }) => {
  const frame = useCurrentFrame();
  if (strength <= 0.01) return null;
  const gw = x1 - x0;
  const r = (k: string) => random(`fd-${k}-${frame}`);
  // 몇 프레임씩 이어지는 긴 스크래치
  const scratches = [0, 1, 2].map((i) => {
    const life = Math.floor(frame / (7 + i * 5));
    const on = random(`fd-on${i}-${life}`) < 0.62;
    const x = x0 + random(`fd-x${i}-${life}`) * gw + (r(`j${i}`) - 0.5) * 3;
    return on ? <div key={`s${i}`} style={{ position: "absolute", left: x, top: 0, width: 1.5 + random(`fd-w${i}-${life}`) * 1.5, height: H, background: `linear-gradient(180deg, transparent ${r(`a${i}`) * 20}%, rgba(255,240,205,${0.1 + r(`o${i}`) * 0.18}) 30%, rgba(255,240,205,0.05) ${70 + r(`b${i}`) * 30}%, transparent)` }} /> : null;
  });
  const specks = Array.from({ length: 9 }).map((_, i) => {
    if (r(`sp${i}`) > 0.55) return null;
    const size = 2 + r(`sz${i}`) * (r(`big${i}`) < 0.12 ? 22 : 7);
    const dark = r(`dk${i}`) < 0.6;
    return <div key={`p${i}`} style={{ position: "absolute", left: x0 + r(`px${i}`) * gw, top: r(`py${i}`) * H, width: size, height: size * (0.6 + r(`pa${i}`) * 0.8), borderRadius: "50%", background: dark ? "rgba(0,0,0,0.75)" : "rgba(255,244,214,0.6)", filter: "blur(0.6px)", transform: `rotate(${r(`pr${i}`) * 180}deg)` }} />;
  });
  const hair = r("hair") < 0.07;
  const hx = x0 + r("hx") * gw;
  const hy = r("hy") * H;
  const flicker = 0.02 + r("fl") * 0.07 + (r("dip") < 0.05 ? 0.1 : 0);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: strength }}>
      {/* 깜박임 */}
      <div style={{ position: "absolute", left: x0, top: 0, width: gw, height: H, background: "#000", opacity: flicker }} />
      {/* 가장자리 타는 듯한 텅스텐 리크 */}
      <div style={{ position: "absolute", left: x0, top: 0, width: gw, height: H, mixBlendMode: "screen", opacity: 0.5 + r("lk") * 0.2, background: `radial-gradient(ellipse 30% 60% at 0% ${40 + Math.sin(frame / 23) * 14}%, ${rgba(K.tungsten, 0.2)} 0%, transparent 70%)` }} />
      {scratches}
      {specks}
      {hair && (
        <svg width={120} height={120} style={{ position: "absolute", left: hx, top: hy, transform: `rotate(${r("hr") * 360}deg)` }}>
          <path d="M10 60 C 40 10, 70 110, 110 50" stroke="rgba(0,0,0,0.7)" strokeWidth={1.6} fill="none" />
        </svg>
      )}
      {/* 게이트 — 둥근 모서리와 깊은 비네트 */}
      <div style={{ position: "absolute", left: x0, top: 0, width: gw, height: H, boxShadow: "inset 0 0 0 3px #000, inset 0 0 140px 40px rgba(0,0,0,0.78)", borderRadius: 34 }} />
      <svg width={gw} height={H} style={{ position: "absolute", left: x0, top: 0 }}>
        <path d={`M0 0 H${gw} V${H} H0 Z M34 0 A34 34 0 0 0 0 34 V${H - 34} A34 34 0 0 0 34 ${H} H${gw - 34} A34 34 0 0 0 ${gw} ${H - 34} V34 A34 34 0 0 0 ${gw - 34} 0 Z`} fill="#000" fillRule="evenodd" />
      </svg>
    </AbsoluteFill>
  );
};

/** 게이트 위브 — 영사기에서 필름이 미세하게 흔들린다 */
export const gateWeave = (frame: number, amp = 1) => {
  const x = (random(`gw-x${frame}`) - 0.5) * 2.6 * amp;
  const y = (random(`gw-y${frame}`) - 0.5) * 3.4 * amp + (random(`gw-j${frame}`) < 0.04 ? 7 * amp : 0);
  return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
};

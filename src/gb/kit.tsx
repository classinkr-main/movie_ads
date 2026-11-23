import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { FONT, MONO, TONES, Tone } from "./theme";

/* ───────── 공통 유틸 ───────── */

export const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const eOut = Easing.out(Easing.cubic);
export const eOutExpo = Easing.out(Easing.exp);
export const eOutBack = Easing.out(Easing.back(1.4));
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

export const t = (size: number, weight = 700, color = "#fff", extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: FONT,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: size >= 60 ? "-0.04em" : size >= 28 ? "-0.025em" : "-0.012em",
  lineHeight: 1.18,
  ...extra,
});

export const mono = (size: number, weight = 500, color = "#fff", extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: `${MONO}, ${FONT}`,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: "0.04em",
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1,
  ...extra,
});

/* ───────── 배경 ───────── */

// 장면 색조. from → to 로 장면 안에서 천천히 물든다.
export const Backdrop: React.FC<{ from: Tone; to?: Tone; k?: number; grid?: number; gridSize?: number }> = ({ from, to, k = 0, grid = 0, gridSize = 120 }) => {
  const f = useCurrentFrame();
  const T = to ?? from;
  const bg = mixHex(from.bg, T.bg, k);
  const bg2 = mixHex(from.bg2, T.bg2, k);
  const glow = mixHex(from.glow, T.glow, k);
  const gx = 30 + noise2D("bgx", f * 0.004, 0) * 14;
  const gy = 28 + noise2D("bgy", 0, f * 0.004) * 10;
  const dark = from.dark;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(70% 80% at ${gx}% ${gy}%, ${glow.replace("rgb", "rgba").replace(")", `,${dark ? 0.55 : 0.9})`)} 0%, rgba(0,0,0,0) 70%), linear-gradient(160deg, ${bg2} 0%, ${bg} 70%)`,
      }}
    >
      {grid > 0 ? (
        <AbsoluteFill
          style={{
            opacity: grid,
            backgroundImage: `linear-gradient(${from.line} 1px, transparent 1px), linear-gradient(90deg, ${from.line} 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundPosition: "0 0",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity, pointerEvents: "none" }}>
      <Img src={staticFile(`gb/grain/g${f % 8}.png`)} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(90% 90% at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: "none" }} />
);

/* ───────── 프레임 장식 (크롭 마크 · 눈금 · 타임코드) ───────── */

export const FrameMarks: React.FC<{ tone: Tone; at?: number; out?: number }> = ({ tone, at = 0, out }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 14);
  const o = out !== undefined ? ramp(f, out, out + 6) : 0;
  const col = alpha(tone.dark ? "#FFFFFF" : "#0D1A14", tone.dark ? 0.34 : 0.32);
  const L = 26 * p;
  const I = 36;
  const corner = (x: number, y: number, sx: number, sy: number) => (
    <path key={`${x}-${y}`} d={`M ${x} ${y + sy * L} V ${y} H ${x + sx * L}`} fill="none" stroke={col} strokeWidth={1.6} />
  );
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - o, pointerEvents: "none", zIndex: 40 }}>
      {corner(I, I, 1, 1)}
      {corner(1920 - I, I, -1, 1)}
      {corner(I, 1080 - I, 1, -1)}
      {corner(1920 - I, 1080 - I, -1, -1)}
      {/* 가장자리 중앙 눈금 */}
      <path d={`M 960 ${I - 4} V ${I + 10 * p}`} stroke={col} strokeWidth={1.6} />
      <path d={`M 960 ${1080 - I + 4} V ${1080 - I - 10 * p}`} stroke={col} strokeWidth={1.6} />
      <path d={`M ${I - 4} 540 H ${I + 10 * p}`} stroke={col} strokeWidth={1.6} />
      <path d={`M ${1920 - I + 4} 540 H ${1920 - I - 10 * p}`} stroke={col} strokeWidth={1.6} />
    </svg>
  );
};

export const Timecode: React.FC<{ tone: Tone; offset: number }> = ({ tone, offset }) => {
  const f = useCurrentFrame() + offset;
  const s = Math.floor(f / 30);
  const fr = f % 30;
  return (
    <div style={{ position: "absolute", right: 64, bottom: 52, ...mono(15, 500, tone.sub, { letterSpacing: "0.12em" }), zIndex: 40 }}>
      00:{String(s).padStart(2, "0")}:{String(fr).padStart(2, "0")}
    </div>
  );
};

// 좌상단 섹션 표기
export const Hud: React.FC<{ tone: Tone; chapter: number; label: string; at?: number; out?: number }> = ({ tone, chapter, label, at = 0, out }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 10);
  const o = out !== undefined ? ramp(f, out, out + 8) : 0;
  return (
    <div style={{ position: "absolute", top: 60, left: 120, display: "flex", alignItems: "center", gap: 16, opacity: p * (1 - o), zIndex: 40 }}>
      <span style={mono(17, 700, tone.ink)}>{String(chapter).padStart(2, "0")}</span>
      <span style={mono(17, 500, tone.sub)}>/ 07</span>
      <div style={{ width: 44 * p, height: 1.5, background: tone.sub, opacity: 0.6 }} />
      <span style={mono(16, 500, tone.sub, { letterSpacing: "0.1em" })}>{label}</span>
    </div>
  );
};

/* ───────── 키네틱 타이포 ───────── */

export type Seg = { t: string; c?: string; w?: number; u?: string };
type Mode = "rise" | "slam" | "type";

export const KText: React.FC<{
  lines: Seg[][];
  at: number;
  size: number;
  weight?: number;
  color?: string;
  stagger?: number;
  out?: number;
  outDur?: number;
  mode?: Mode;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  style?: React.CSSProperties;
}> = ({ lines, at, size, weight = 800, color = "#fff", stagger = 1.5, out, outDur = 10, mode = "rise", align = "left", lineHeight = 1.16, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let gi = 0;
  return (
    <div style={{ textAlign: align, fontFamily: FONT, fontSize: size, fontWeight: weight, color, letterSpacing: size >= 60 ? "-0.045em" : "-0.02em", ...style }}>
      {lines.map((line, li) => (
        <div key={li} style={{ whiteSpace: "pre", lineHeight, height: size * lineHeight }}>
          {line.map((seg, si) => {
            const segStart = gi;
            const glyphs = Array.from(seg.t).map((ch, ci) => {
              const i = gi++;
              const local = frame - at - i * stagger;
              let tr = "";
              let op = 1;
              let bl = 0;
              if (mode === "rise") {
                const p = spring({ frame: local, fps, config: { damping: 17, stiffness: 170, mass: 0.7 } });
                tr = `translateY(${(1 - p) * 0.7}em)`;
                op = interpolate(local, [0, 4], [0, 1], CL);
                bl = (1 - Math.min(1, p)) * 8;
              } else if (mode === "slam") {
                const p = interpolate(local, [0, 6], [0, 1], { ...CL, easing: eOutExpo });
                tr = `scale(${lerp(1.7, 1, p)})`;
                op = interpolate(local, [0, 2], [0, 1], CL);
                bl = (1 - p) * 18;
              } else {
                op = local >= 0 ? 1 : 0;
              }
              if (out !== undefined) {
                const o = interpolate(frame - out - i * 0.5, [0, outDur], [0, 1], { ...CL, easing: eIn });
                tr += ` translateY(${-o * 0.35}em)`;
                op *= 1 - o;
                bl += o * 10;
              }
              return (
                <span
                  key={`${li}-${si}-${ci}`}
                  style={{ display: "inline-block", transform: tr, opacity: op, filter: bl > 0.3 ? `blur(${bl}px)` : undefined, color: seg.c ?? color, fontWeight: seg.w ?? weight }}
                >
                  {ch}
                </span>
              );
            });
            if (!seg.u) return <React.Fragment key={si}>{glyphs}</React.Fragment>;
            // 밑줄: 글자가 다 올라온 뒤 왼→오로 그어진다
            const uAt = at + (segStart + Array.from(seg.t).length) * stagger + 4;
            const up = ramp(frame, uAt, uAt + 12, eOutExpo);
            const uo = out !== undefined ? ramp(frame, out, out + outDur) : 0;
            return (
              <span key={si} style={{ position: "relative", display: "inline-block" }}>
                {glyphs}
                <span style={{ position: "absolute", left: 0, bottom: "0.02em", height: Math.max(3, size * 0.055), width: `${up * 100}%`, background: seg.u, opacity: 1 - uo }} />
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ───────── 상태 표시 (코너 브래킷 태그) ───────── */

export const Bracket: React.FC<{ color: string; size?: number; w?: number }> = ({ color, size = 12, w = 2 }) => {
  const s: React.CSSProperties = { position: "absolute", width: size, height: size, borderColor: color, borderStyle: "solid", borderWidth: 0 };
  return (
    <>
      <span style={{ ...s, left: 0, top: 0, borderLeftWidth: w, borderTopWidth: w }} />
      <span style={{ ...s, right: 0, top: 0, borderRightWidth: w, borderTopWidth: w }} />
      <span style={{ ...s, left: 0, bottom: 0, borderLeftWidth: w, borderBottomWidth: w }} />
      <span style={{ ...s, right: 0, bottom: 0, borderRightWidth: w, borderBottomWidth: w }} />
    </>
  );
};

export const StatusTag: React.FC<{ kind: "example" | "now"; tone: Tone; at: number; out?: number }> = ({ kind, tone, at, out }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 12, eOutExpo);
  const o = out !== undefined ? ramp(f, out, out + 6) : 0;
  const isEx = kind === "example";
  const col = isEx ? (tone.dark ? "#FFC266" : "#A86400") : tone.dark ? "#7DF2C8" : "#00875C";
  const label = isEx ? "방향 예시 · 개발필요 · 가상 데이터" : "지금 됨 · ClassIn 기능";
  return (
    <div
      style={{
        position: "absolute",
        top: 46,
        right: 64,
        padding: "13px 22px 13px 22px",
        opacity: p * (1 - o),
        transform: `translateY(${(1 - p) * -10}px)`,
        background: tone.dark ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.55)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Bracket color={col} />
      <span style={mono(14, 700, col, { letterSpacing: "0.14em" })}>{isEx ? "EXAMPLE" : "LIVE"}</span>
      <span style={{ width: 1.5, height: 18, background: col, opacity: 0.5 }} />
      <span style={t(23, 700, col, { lineHeight: 1, letterSpacing: "-0.01em" })}>{label}</span>
    </div>
  );
};

/* ───────── 커서 ───────── */

export const Cursor: React.FC<{ path: Array<{ f: number; x: number; y: number }>; clicks: number[]; show: [number, number]; dark?: boolean }> = ({ path, clicks, show, dark = true }) => {
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
  const ring = dark ? "#BFFFE6" : "#00875C";
  return (
    <>
      {clicks.map((c) => {
        const k = interpolate(f, [c, c + 14], [0, 1], { ...CL, easing: eOut });
        if (f < c || k >= 1) return null;
        return (
          <div key={c} style={{ position: "absolute", left: x - 36, top: y - 36, width: 72, height: 72, border: `2.5px solid ${ring}`, borderRadius: 999, transform: `scale(${0.25 + k * 1.1})`, opacity: 1 - k, zIndex: 60 }} />
        );
      })}
      <svg width={44} height={52} viewBox="0 0 44 52" style={{ position: "absolute", left: x - 6, top: y - 4, opacity: op, transform: `scale(${press})`, transformOrigin: "6px 4px", zIndex: 61, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))" }}>
        <path d="M6 4 L6 40 L15.5 31 L22 46 L29 43 L22.5 28.5 L36 28.5 Z" fill={dark ? "#FFFFFF" : "#0D1A14"} stroke={dark ? "#0B1712" : "#FFFFFF"} strokeWidth={2.5} strokeLinejoin="miter" />
      </svg>
    </>
  );
};

/* ───────── 면 · 장식 ───────── */

export const panel = (tone: Tone, extra: React.CSSProperties = {}): React.CSSProperties => ({
  position: "absolute",
  borderRadius: 4,
  background: tone.dark ? "linear-gradient(170deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))" : "#FFFFFF",
  border: `1.2px solid ${tone.dark ? "rgba(255,255,255,0.13)" : "rgba(13,26,20,0.12)"}`,
  boxShadow: tone.dark ? "0 30px 80px rgba(0,0,0,0.45)" : "0 24px 60px rgba(30,60,45,0.14), 0 2px 6px rgba(30,60,45,0.06)",
  overflow: "hidden",
  ...extra,
});

export const Sheen: React.FC<{ at: number; dur?: number; angle?: number; strength?: number }> = ({ at, dur = 22, angle = 115, strength = 0.12 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [-0.4, 1.4], CL);
  if (f < at || f > at + dur) return null;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, rgba(255,255,255,0) ${p * 100 - 16}%, rgba(255,255,255,${strength}) ${p * 100}%, rgba(255,255,255,0) ${p * 100 + 16}%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

export const Flash: React.FC<{ at: number; dur?: number; color?: string; peak?: number }> = ({ at, dur = 10, color = "#F3FFF9", peak = 0.85 }) => {
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
    blur += (1 - p) * 60;
    op *= interpolate(f, [enter, enter + 3], [0, 1], CL);
  }
  if (exit !== undefined) {
    const p = interpolate(f, [exit - dur, exit], [0, 1], { ...CL, easing: eIn });
    x -= p * 520;
    blur += p * 60;
    op *= 1 - interpolate(f, [exit - 3, exit], [0, 1], CL);
  }
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)`, opacity: op, filter: blur > 0.5 ? `url(#${id})` : undefined }}>
      {blur > 0.5 ? <HBlurDefs id={id} amount={blur} /> : null}
      {children}
    </AbsoluteFill>
  );
};

// 각진 라벨
export const Tag: React.FC<{ children: React.ReactNode; color: string; bg?: string; size?: number; style?: React.CSSProperties; border?: boolean }> = ({ children, color, bg = "transparent", size = 16, style, border = true }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: `${size * 0.36}px ${size * 0.62}px`,
      borderRadius: 2,
      background: bg,
      border: border ? `1.2px solid ${color}` : undefined,
      ...t(size, 700, color, { lineHeight: 1, whiteSpace: "nowrap" }),
      ...style,
    }}
  >
    {children}
  </span>
);

// 공용: 장면에 쓰는 기본 톤
export const tone = TONES;

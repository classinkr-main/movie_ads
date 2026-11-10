import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, FONT } from "../lib/theme";
import { clamp, E, tw } from "../lib/motion";

// ─────────────────────────────────────────────────────────────────────────────
// 편집 디자인 레이어 — 3D 디오라마 위에 얹는 "Vox 식" 주석: 형광펜, 꼬리표, 도장, 큰 글자.
// 3D 좌표에서 투영한 화면 좌표(px)를 받아 그립니다. 글자는 HTML 이라 최종 해상도에서 선명합니다.
// ─────────────────────────────────────────────────────────────────────────────

export type Tone = "ink" | "red" | "green" | "cobalt" | "paper" | "lime" | "amber";
const TONE: Record<Tone, { bg: string; fg: string; line: string }> = {
  ink: { bg: C.ink, fg: "#FFFFFF", line: C.ink },
  red: { bg: C.red, fg: "#FFFFFF", line: C.red },
  green: { bg: C.forest, fg: "#FFFFFF", line: C.forest },
  cobalt: { bg: C.cobalt, fg: "#FFFFFF", line: C.cobalt },
  paper: { bg: "#FFFFFF", fg: C.ink, line: C.ink },
  lime: { bg: C.lime, fg: C.ink, line: C.forest },
  amber: { bg: C.amber, fg: C.ink, line: C.ink },
};

/** 꼬리표 주석: 3D 물체의 화면 좌표(at)에 점을 찍고, 선을 그어 라벨을 붙입니다. */
export const Tag: React.FC<{
  f: number;
  t0: number;
  t1?: number;
  at: { x: number; y: number };
  dx: number;
  dy: number;
  text: string;
  sub?: string;
  tone?: Tone;
  u: number;
  size?: number;
}> = ({ f, t0, t1 = 1e9, at, dx, dy, text, sub, tone = "paper", u, size = 34 }) => {
  const { width: W, height: H } = useVideoConfig();
  if (f < t0 || f > t1 + 6) return null;
  const col = TONE[tone];
  const out = 1 - tw(f, t1, 6, E.in);
  const dot = tw(f, t0, 6, E.back);
  const ln = tw(f, t0 + 2, 7, E.out);
  const chip = tw(f, t0 + 6, 9, E.out5);
  const fs = size * u;
  const right = dx >= 0;
  // 라벨이 화면 밖으로 나가지 않게 잡아 둡니다(세로 영상에서 특히 필요). 글자 폭은 한글 0.92em·그 외 0.55em 로 어림합니다.
  const em = (t: string) => [...t].reduce((a, c) => a + (/[\u3131-\uD7A3]/.test(c) ? 0.92 : 0.55), 0);
  const boxW = Math.max(em(text) * fs, sub ? em(sub) * fs * 0.62 : 0) + fs * 1.4;
  const m = 28 * u;
  const rawX = at.x + dx * u;
  const ex = right ? Math.max(m, Math.min(W - m - boxW, rawX)) : Math.min(W - m, Math.max(m + boxW, rawX));
  const ey = Math.max(m + fs, Math.min(H - m - fs, at.y + dy * u));
  return (
    <AbsoluteFill style={{ opacity: out, pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={at.x} y1={at.y} x2={at.x + (ex - at.x) * ln} y2={at.y + (ey - at.y) * ln} stroke={col.line} strokeWidth={3 * u} strokeLinecap="round" />
        <circle cx={at.x} cy={at.y} r={8 * u * dot} fill="#FFFFFF" stroke={col.line} strokeWidth={3.5 * u} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: ex,
          top: ey,
          transform: `translate(${right ? "0%" : "-100%"}, -50%)`,
          clipPath: right ? `inset(-20% ${(1 - chip) * 100}% -20% -5%)` : `inset(-20% -5% -20% ${(1 - chip) * 100}%)`,
        }}
      >
        <div
          style={{
            background: col.bg,
            color: col.fg,
            fontFamily: FONT.body,
            fontWeight: 800,
            fontSize: fs,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            padding: `${fs * 0.34}px ${fs * 0.56}px ${fs * 0.36}px`,
            borderRadius: fs * 0.28,
            border: tone === "paper" ? `${3 * u}px solid ${C.ink}` : "none",
            boxShadow: `${5 * u}px ${5 * u}px 0 rgba(27,26,23,0.9)`,
            whiteSpace: "nowrap",
          }}
        >
          {text}
          {sub && <div style={{ fontWeight: 600, fontSize: fs * 0.62, opacity: 0.78, marginTop: fs * 0.1, letterSpacing: "-0.01em" }}>{sub}</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** 큰 글자 강타. 줄마다 형광펜 띠 위에 찍힙니다. 자막 대신 쓰는 구절에만 씁니다. */
export const Slam: React.FC<{
  f: number;
  t0: number;
  t1: number;
  lines: string[];
  u: number;
  size?: number;
  tone?: "red" | "lime" | "ink" | "cobalt" | "white";
  x?: number; // 0..1
  y?: number; // 0..1
  rotate?: number;
  stagger?: number;
  align?: "center" | "left";
  w: number;
  h: number;
}> = ({ f, t0, t1, lines, u, size = 150, tone = "red", x = 0.5, y = 0.5, rotate = -3, stagger = 4, align = "center", w, h }) => {
  if (f < t0 || f > t1 + 8) return null;
  const out = 1 - tw(f, t1, 7, E.in);
  const band = tone === "red" ? C.red : tone === "lime" ? C.lime : tone === "cobalt" ? C.cobalt : tone === "white" ? "#FFFFFF" : C.ink;
  const fg = tone === "lime" || tone === "white" ? C.ink : "#FFFFFF";
  const fs = size * u;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: x * w,
          top: y * h,
          transform: `translate(${align === "center" ? "-50%" : "0%"}, -50%) rotate(${rotate}deg) scale(${0.96 + out * 0.04})`,
          opacity: out,
          display: "flex",
          flexDirection: "column",
          alignItems: align === "center" ? "center" : "flex-start",
          gap: fs * 0.1,
        }}
      >
        {lines.map((ln, i) => {
          const s = t0 + i * stagger;
          const hit = tw(f, s, 6, E.expo);
          const sc = 1.7 - 0.7 * hit + Math.sin(clamp((f - s - 6) / 8) * Math.PI) * 0.03;
          const wipe = tw(f, s, 5, E.out);
          return (
            <div key={i} style={{ position: "relative", opacity: f >= s ? 1 : 0, transform: `scale(${sc}) rotate(${i % 2 ? 0.8 : -0.5}deg)` }}>
              <div style={{ position: "absolute", inset: `${fs * 0.06}px ${-fs * 0.16}px ${fs * 0.02}px`, background: band, borderRadius: fs * 0.08, transformOrigin: "left center", transform: `scaleX(${wipe})`, boxShadow: `${8 * u}px ${8 * u}px 0 rgba(27,26,23,0.92)` }} />
              <div style={{ position: "relative", fontFamily: FONT.slam, fontSize: fs, lineHeight: 1.16, color: fg, whiteSpace: "nowrap", letterSpacing: "-0.01em", padding: `0 ${fs * 0.06}px` }}>{ln}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** 빨간 도장 */
export const Stamp: React.FC<{ f: number; t0: number; t1?: number; text: string; x: number; y: number; u: number; size?: number; color?: string; rotate?: number; bg?: string }> = ({
  f,
  t0,
  t1 = 1e9,
  text,
  x,
  y,
  u,
  size = 90,
  color = C.red,
  rotate = -12,
  bg = "rgba(255,255,255,0.82)",
}) => {
  if (f < t0 || f > t1 + 6) return null;
  const hit = tw(f, t0, 5, E.expo);
  const out = 1 - tw(f, t1, 6, E.in);
  const fs = size * u;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(${2.2 - 1.2 * hit})`,
        opacity: Math.min(hit * 1.4, 1) * out,
        fontFamily: FONT.slam,
        fontSize: fs,
        color,
        border: `${fs * 0.09}px solid ${color}`,
        borderRadius: fs * 0.16,
        padding: `${fs * 0.02}px ${fs * 0.26}px ${fs * 0.06}px`,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        background: bg,
      }}
    >
      {text}
    </div>
  );
};

/** 화면에 고정된 작은 칩(수치·상태 표시) */
export const Chip: React.FC<{ f: number; t0: number; t1?: number; x: number; y: number; text: string; tone?: Tone; u: number; size?: number; anchor?: "center" | "left" | "right" }> = ({
  f,
  t0,
  t1 = 1e9,
  x,
  y,
  text,
  tone = "ink",
  u,
  size = 34,
  anchor = "center",
}) => {
  if (f < t0 || f > t1 + 6) return null;
  const col = TONE[tone];
  const p = tw(f, t0, 9, E.back);
  const out = 1 - tw(f, t1, 6, E.in);
  const fs = size * u;
  const tx = anchor === "center" ? "-50%" : anchor === "left" ? "0%" : "-100%";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) scale(${p})`,
        opacity: out,
        background: col.bg,
        color: col.fg,
        fontFamily: FONT.body,
        fontWeight: 800,
        fontSize: fs,
        letterSpacing: "-0.02em",
        padding: `${fs * 0.3}px ${fs * 0.55}px`,
        borderRadius: fs * 0.3,
        border: tone === "paper" ? `${3 * u}px solid ${C.ink}` : "none",
        boxShadow: `${5 * u}px ${5 * u}px 0 rgba(27,26,23,0.9)`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

/** 종이 배경: 가운데가 밝고 가장자리가 눌린 종이 + 옅은 모눈. 3D 캔버스 뒤에 깝니다. */
export const PaperBG: React.FC<{ color: string; grid?: number; gridColor?: string; u: number }> = ({ color, grid = 0.5, gridColor = "rgba(27,26,23,0.05)", u }) => (
  <AbsoluteFill style={{ background: color }}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${gridColor} ${2 * u}px, transparent ${2 * u}px), linear-gradient(90deg, ${gridColor} ${2 * u}px, transparent ${2 * u}px)`,
        backgroundSize: `${96 * u}px ${96 * u}px`,
        opacity: grid,
      }}
    />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 58%)" }} />
  </AbsoluteFill>
);

/** 인쇄 질감 + 비네트. 맨 위에 덮습니다. */
export const Finish: React.FC<{ dark?: number }> = ({ dark = 0 }) => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(20,14,6,${0.22 + dark * 0.2}) 100%)`, pointerEvents: "none" }} />
    <AbsoluteFill style={{ backgroundImage: NOISE, opacity: 0.14, mixBlendMode: "multiply", pointerEvents: "none" }} />
  </>
);

/** 화면 전체를 쓸고 지나가는 색면 전환. at 프레임에 화면을 완전히 덮습니다(그 아래에서 장면이 바뀜). */
export const Wipe: React.FC<{ f: number; at: number; color: string; color2?: string; cover?: number; reveal?: number }> = ({ f, at, color, color2, cover = 8, reveal = 10 }) => {
  if (f < at - cover || f > at + reveal) return null;
  const a = f < at ? E.in(clamp((f - (at - cover)) / cover)) : 1;
  const b = f >= at ? E.out(clamp((f - at) / reveal)) : 0;
  // 사선으로 들어와 덮고, 같은 방향으로 빠져나갑니다.
  const poly = (from: number, to: number) => `polygon(${from * 130 - 30}% 0%, ${to * 130}% 0%, ${to * 130 - 30}% 100%, ${from * 130 - 60}% 100%)`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {color2 && <AbsoluteFill style={{ background: color2, clipPath: poly(b * 0.92, Math.min(1, a * 1.08)) }} />}
      <AbsoluteFill style={{ background: color, clipPath: poly(b, a) }} />
    </AbsoluteFill>
  );
};

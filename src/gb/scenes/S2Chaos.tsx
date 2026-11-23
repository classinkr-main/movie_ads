import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { AMBER, CORAL, LINE, STUDENTS, TONES } from "../theme";
import { Icon, IconName } from "../icons";
import { Backdrop, CL, FrameMarks, Hud, KText, Timecode, eIn, eOutBack, eOutExpo, lerp, mono, ramp, shake, t } from "../kit";

// 과부하(열기) — 학생 6명 × 할 일 6가지 = 36칸이 순식간에 찬다.
const T = TONES.ember;
export const COLS: Array<{ label: string; icon: IconName }> = [
  { label: "진도 배정", icon: "route" },
  { label: "테스트 채점", icon: "test" },
  { label: "숙제", icon: "book" },
  { label: "질문", icon: "chat" },
  { label: "상담", icon: "consult" },
  { label: "학부모 보고", icon: "report" },
];
const SLAMS = [
  { w: "진도표,", at: 0, col: 0 },
  { w: "채점,", at: 15, col: 1 },
  { w: "상담,", at: 30, col: 4 },
  { w: "보고까지.", at: 45, col: 5 },
];
export const GRID = { x: 820, y: 214, cw: 163, ch: 98, head: 92 };
export const cellXY = (c: number, r: number) => ({ x: GRID.x + c * GRID.cw, y: GRID.y + GRID.head + r * GRID.ch });

// 칸이 채워지는 시점
export const cellAt = (c: number, r: number) => {
  const s = SLAMS.find((x) => x.col === c);
  if (s) return s.at + 2 + r * 1.5;
  return (c === 2 ? 50 : 57) + r * 1.2;
};

const Cell: React.FC<{ c: number; r: number; f: number; heat: number }> = ({ c, r, f, heat }) => {
  const at = cellAt(c, r);
  const local = f - at;
  if (local < 0) return null;
  const p = interpolate(local, [0, 8], [0, 1], { ...CL, easing: eOutBack });
  const { x, y } = cellXY(c, r);
  const sid = STUDENTS[r].id;
  const attn = sid === "C" || sid === "E";
  const j = heat * 5;
  const jx = noise2D("jx" + c + r, f * 0.3, 0) * j;
  const jy = noise2D("jy" + c + r, 0, f * 0.3) * j;
  // 알림 깜빡임
  const blink = heat > 0.05 && Math.sin(f * 0.9 + c * 1.7 + r * 2.3) > 0.55;
  const border = blink ? (attn ? CORAL : AMBER) : "rgba(255,210,190,0.18)";
  return (
    <div
      style={{
        position: "absolute",
        left: x + 6 + jx,
        top: y + 6 + jy,
        width: GRID.cw - 12,
        height: GRID.ch - 12,
        borderRadius: 3,
        border: `1.3px solid ${border}`,
        background: blink ? "rgba(255,150,90,0.10)" : "rgba(255,235,225,0.035)",
        transform: `scale(${lerp(0.55, 1, p)})`,
        opacity: interpolate(local, [0, 3], [0, 1], CL),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 14px 0 16px",
      }}
    >
      <Icon name={COLS[c].icon} size={30} color={attn ? "#FFD3B8" : "#F3D9CC"} draw={ramp(f, at, at + 10)} stroke={1.7} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <div style={{ width: 16, height: 16, border: `1.5px solid ${attn ? CORAL : "rgba(255,220,200,0.55)"}` }} />
        <span style={mono(12, 700, attn ? CORAL : T.sub, { letterSpacing: "0.1em" })}>{attn ? "급함" : "대기"}</span>
      </div>
    </div>
  );
};

const Matrix: React.FC<{ f: number; heat: number }> = ({ f, heat }) => {
  const lines = ramp(f, -8, 12, eOutExpo);
  return (
    <>
      {/* 격자선 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 8 }, (_, i) => {
          const y = GRID.y + (i === 0 ? 0 : GRID.head + (i - 1) * GRID.ch);
          return <line key={"r" + i} x1={GRID.x - 70} x2={GRID.x - 70 + (6 * GRID.cw + 70) * lines} y1={y} y2={y} stroke="rgba(255,210,190,0.16)" strokeWidth={1.2} />;
        })}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={"c" + i} x1={GRID.x + i * GRID.cw} x2={GRID.x + i * GRID.cw} y1={GRID.y} y2={GRID.y + (GRID.head + 6 * GRID.ch) * lines} stroke="rgba(255,210,190,0.12)" strokeWidth={1.2} />
        ))}
      </svg>
      {/* 열 머리: 아이콘 + 이름 */}
      {COLS.map((col, c) => {
        const s = SLAMS.find((x) => x.col === c);
        const hot = s ? Math.max(0, 1 - Math.abs(f - s.at - 3) / 10) : 0;
        const at = c * 2;
        return (
          <div key={col.label} style={{ position: "absolute", left: GRID.x + c * GRID.cw, top: GRID.y + 14, width: GRID.cw, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: ramp(f, at, at + 8) }}>
            <Icon name={col.icon} size={30} color={hot > 0.05 ? AMBER : "#F6E4DA"} draw={ramp(f, at, at + 14)} stroke={1.8} style={{ transform: `scale(${1 + hot * 0.3})` }} />
            <span style={t(17, 700, hot > 0.05 ? AMBER : T.ink, { lineHeight: 1 })}>{col.label}</span>
          </div>
        );
      })}
      {/* 행 머리: 학생 */}
      {STUDENTS.map((s, r) => (
        <div key={s.id} style={{ position: "absolute", left: GRID.x - 64, top: GRID.y + GRID.head + r * GRID.ch + 30, display: "flex", alignItems: "center", gap: 6, opacity: ramp(f, 2 + r, 10 + r) }}>
          <span style={mono(20, 700, LINE[s.id])}>{s.id}</span>
          <Icon name="student" size={22} color={T.sub} draw={ramp(f, 2 + r, 14 + r)} stroke={1.8} />
        </div>
      ))}
      {COLS.map((_, c) => STUDENTS.map((__, r) => <Cell key={`${c}-${r}`} c={c} r={r} f={f} heat={heat} />))}
    </>
  );
};

const SlamWord: React.FC<{ w: string; at: number; f: number; out: number }> = ({ w, at, f, out }) => {
  const local = f - at;
  const p = interpolate(local, [0, 6], [0, 1], { ...CL, easing: eOutExpo });
  const o = ramp(f, out, out + 8, eIn);
  if (local < 0) return <div style={{ height: 150 }} />;
  return (
    <div
      style={{
        height: 150,
        transformOrigin: "0% 60%",
        transform: `scale(${lerp(1.6, 1, p)}) translateY(${-o * 40}px)`,
        opacity: interpolate(local, [-1, 1], [0, 1], CL) * (1 - o),
        filter: p < 0.98 || o > 0.01 ? `blur(${(1 - p) * 16 + o * 14}px)` : undefined,
        ...t(140, 800, T.ink, { letterSpacing: "-0.05em", lineHeight: 1.05 }),
      }}
    >
      {w}
    </div>
  );
};

// 빠르게 도는 시계 — 시간 압박
const RushClock: React.FC<{ f: number }> = ({ f }) => {
  const speed = lerp(4, 26, ramp(f, 40, 120, eIn));
  const a = (f * speed) % 360;
  return (
    <svg width={64} height={64} viewBox="0 0 64 64">
      <circle cx={32} cy={32} r={27} fill="none" stroke={T.ink} strokeWidth={2.4} />
      {Array.from({ length: 12 }, (_, i) => {
        const r = (i * 30 * Math.PI) / 180;
        return <line key={i} x1={32 + Math.sin(r) * 21} y1={32 - Math.cos(r) * 21} x2={32 + Math.sin(r) * 25} y2={32 - Math.cos(r) * 25} stroke={T.sub} strokeWidth={1.6} />;
      })}
      <line x1={32} y1={32} x2={32 + Math.sin((a * Math.PI) / 180) * 18} y2={32 - Math.cos((a * Math.PI) / 180) * 18} stroke={AMBER} strokeWidth={3} />
      <line x1={32} y1={32} x2={32 + Math.sin((a * Math.PI) / 2160) * 12} y2={32 - Math.cos((a * Math.PI) / 2160) * 12} stroke={T.ink} strokeWidth={3} />
    </svg>
  );
};

export const S2Chaos: React.FC = () => {
  const f = useCurrentFrame();
  const punch = SLAMS.reduce((acc, s) => acc + Math.max(0, 1 - Math.abs(f - s.at - 1) / 5) * 0.018, 0);
  const heat = ramp(f, 66, 118, eIn);
  const shk = shake(f, lerp(0.8, 8, heat), "s2");
  let count = 0;
  for (let c = 0; c < 6; c++) for (let r = 0; r < 6; r++) if (f >= cellAt(c, r)) count++;
  const ab = ramp(f, 104, 120, eIn) * 6;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop from={T} to={TONES.void} k={ramp(f, 96, 120) * 0.6} grid={0.35} gridSize={40} />
      <AbsoluteFill style={{ transform: `translate(${shk.x}px, ${shk.y}px) scale(${1 + punch})` }}>
        <Matrix f={f} heat={heat} />
        {/* 1) 단어 네 개가 박자마다 꽂힌다 */}
        <div style={{ position: "absolute", left: 116, top: 198 }}>
          {SLAMS.map((s) => (
            <SlamWord key={s.w} w={s.w} at={s.at} f={f} out={58} />
          ))}
        </div>
        {/* 2) 개별진도는 손이 많이 갑니다. */}
        <div style={{ position: "absolute", left: 116, top: 372, textShadow: ab > 0.2 ? `${ab}px 0 0 rgba(255,60,80,0.6), ${-ab}px 0 0 rgba(60,200,255,0.6)` : undefined }}>
          <KText lines={[[{ t: "개별진도는" }], [{ t: "손이 많이", c: AMBER, u: AMBER }], [{ t: "갑니다." }]]} at={62} size={128} color={T.ink} stagger={1.3} lineHeight={1.12} />
        </div>
      </AbsoluteFill>
      {/* 카운터 */}
      <div style={{ position: "absolute", right: 64, top: 50, display: "flex", alignItems: "center", gap: 22, opacity: ramp(f, 0, 8) }}>
        <RushClock f={f} />
        <div style={{ textAlign: "right" }}>
          <div style={t(20, 600, T.sub, { lineHeight: 1 })}>오늘 챙길 일</div>
          <div style={mono(88, 700, count > 24 ? AMBER : T.ink, { lineHeight: 1.02 })}>{String(count).padStart(2, "0")}</div>
        </div>
      </div>
      <Hud tone={T} chapter={2} label="손이 많이 가는 이유" />
      <FrameMarks tone={T} />
      <Timecode tone={T} offset={120} />
    </AbsoluteFill>
  );
};

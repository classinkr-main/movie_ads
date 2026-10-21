import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, CUES, FONT, FPS } from "../lib/theme";
import { clamp } from "../lib/motion";

// 캠코더 REC HUD — 드롭("남긴다.")부터 수업이 녹화되는 것처럼 프레임을 감싸고,
// 엔드에서 SAVED로 바뀌며 '수업이 남았다'로 닫는다.
const pad = (n: number) => String(n).padStart(2, "0");
const timecode = (f: number) => {
  const s = Math.floor(f / FPS);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % FPS)}`;
};

const [paperFrom, paperTo] = [CUES.scenes.system[0], CUES.scenes.system[1]];

export const RecHud: React.FC = () => {
  const frame = useCurrentFrame();
  const from = CUES.scenes.drop[0];
  const savedAt = CUES.end.saved;
  if (frame < from) return null;
  const onPaper = frame >= paperFrom && frame < paperTo - 12;
  const color = onPaper ? C.ink : C.white;
  const appear = interpolate(frame, [from, from + 8], [0, 1], clamp);
  const saved = frame >= savedAt;
  const blink = Math.floor((frame - from) / 30) % 2 === 0;
  const inset = 44;
  const arm = 54;
  const corner = (x: number, y: number, sx: number, sy: number) => (
    <path key={`${x}-${y}`} d={`M${x + sx * arm},${y} L${x},${y} L${x},${y + sy * arm}`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="square" />
  );
  const label: React.CSSProperties = { fontFamily: FONT.mono, fontWeight: 600, fontSize: 22, letterSpacing: "0.12em", color };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: appear * 0.9, pointerEvents: "none" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {corner(inset, inset, 1, 1)}
        {corner(1920 - inset, inset, -1, 1)}
        {corner(inset, 1080 - inset, 1, -1)}
        {corner(1920 - inset, 1080 - inset, -1, -1)}
      </svg>
      <div style={{ position: "absolute", top: inset + 22, right: inset + 30, display: "flex", alignItems: "center", gap: 14 }}>
        {saved ? (
          <>
            <svg width={26} height={26} viewBox="0 0 26 26">
              <circle cx={13} cy={13} r={12} fill={C.white} />
              <path d="M7,13.5 L11.2,17.5 L19,9" fill="none" stroke={C.cobalt} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={label}>SAVED</span>
          </>
        ) : (
          <>
            <span style={{ width: 18, height: 18, borderRadius: 99, background: C.signal, opacity: blink ? 1 : 0.25 }} />
            <span style={label}>REC</span>
          </>
        )}
        <span style={{ ...label, fontWeight: 500, opacity: 0.85, fontVariantNumeric: "tabular-nums" }}>{timecode(frame - from)}</span>
      </div>
      <div style={{ position: "absolute", bottom: inset + 20, left: inset + 30, ...label, fontWeight: 500, fontSize: 18, opacity: 0.75 }}>CAM 01 · 1080p60</div>
      <div style={{ position: "absolute", bottom: inset + 22, right: inset + 30, display: "flex", alignItems: "center", gap: 3 }}>
        <div style={{ width: 44, height: 20, border: `2.5px solid ${color}`, borderRadius: 3, padding: 2.5, boxSizing: "border-box", display: "flex", gap: 2.5 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ flex: 1, background: color }} />
          ))}
        </div>
        <div style={{ width: 4, height: 9, background: color, borderRadius: 1 }} />
      </div>
    </div>
  );
};

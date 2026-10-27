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

// 배경이 사진(어두움)인지 파스텔 연두(밝음)인지에 따라 HUD 색을 좌우 따로 정한다
const S = CUES.scenes;
const within = (f: number, [a, b]: number[]) => f >= a && f < b;
const hudColors = (frame: number): { left: string; right: string } => {
  const onPhoto = { left: C.white, right: C.white };
  const onLime = { left: C.ink, right: C.ink };
  if (within(frame, S.chant)) {
    // 챈트: 왼쪽은 늘 사진, 오른쪽은 B박에 연두 패널이 밀려 들어온 뒤부터 밝다
    const i = CUES.chant.reduce((acc, f, k) => (frame >= f ? k : acc), 0);
    return { left: C.white, right: i % 2 === 1 && frame >= CUES.chant[i] + 4 ? C.ink : C.white };
  }
  if (within(frame, S.future)) return frame >= CUES.future[1] && frame < CUES.future[3] ? onLime : onPhoto; // AI 카메라(연두)·AI 강의 분석(앱 화면) 컷만 밝다
  if (within(frame, S.finale)) return onPhoto;
  return onLime;
};

export const RecHud: React.FC = () => {
  const frame = useCurrentFrame();
  const from = S.drop[0];
  const savedAt = CUES.end.saved;
  if (frame < from) return null;
  const { left, right } = hudColors(frame);
  const appear = interpolate(frame, [from, from + 8], [0, 1], clamp);
  const saved = frame >= savedAt;
  const blink = Math.floor((frame - from) / 30) % 2 === 0;
  const inset = 44;
  const arm = 54;
  const corner = (x: number, y: number, sx: number, sy: number, color: string) => (
    <path key={`${x}-${y}`} d={`M${x + sx * arm},${y} L${x},${y} L${x},${y + sy * arm}`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="square" />
  );
  const label = (color: string): React.CSSProperties => ({ fontFamily: FONT.mono, fontWeight: 600, fontSize: 22, letterSpacing: "0.12em", color });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: appear * 0.9, pointerEvents: "none" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {corner(inset, inset, 1, 1, left)}
        {corner(1920 - inset, inset, -1, 1, right)}
        {corner(inset, 1080 - inset, 1, -1, left)}
        {corner(1920 - inset, 1080 - inset, -1, -1, right)}
      </svg>
      <div style={{ position: "absolute", top: inset + 22, right: inset + 30, display: "flex", alignItems: "center", gap: 14 }}>
        {saved ? (
          <>
            <svg width={26} height={26} viewBox="0 0 26 26">
              <circle cx={13} cy={13} r={12} fill={right} />
              <path d="M7,13.5 L11.2,17.5 L19,9" fill="none" stroke={right === C.ink ? C.lime : C.cobalt} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={label(right)}>SAVED</span>
          </>
        ) : (
          <>
            <span style={{ width: 18, height: 18, borderRadius: 99, background: C.signal, opacity: blink ? 1 : 0.25 }} />
            <span style={label(right)}>REC</span>
          </>
        )}
        <span style={{ ...label(right), fontWeight: 500, opacity: 0.85, fontVariantNumeric: "tabular-nums" }}>{timecode(frame - from)}</span>
      </div>
      <div style={{ position: "absolute", bottom: inset + 20, left: inset + 30, ...label(left), fontWeight: 500, fontSize: 18, opacity: 0.75 }}>CAM 01 · 1080p60</div>
      <div style={{ position: "absolute", bottom: inset + 22, right: inset + 30, display: "flex", alignItems: "center", gap: 3 }}>
        <div style={{ width: 44, height: 20, border: `2.5px solid ${right}`, borderRadius: 3, padding: 2.5, boxSizing: "border-box", display: "flex", gap: 2.5 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ flex: 1, background: right }} />
          ))}
        </div>
        <div style={{ width: 4, height: 9, background: right, borderRadius: 1 }} />
      </div>
    </div>
  );
};

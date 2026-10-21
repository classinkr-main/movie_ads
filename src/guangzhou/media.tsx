import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../lib/theme";
import { HAND } from "./fonts";
import { clampX, easeInOut } from "./fx";
import { HANDLE, Shot } from "./timeline";

/* ---------- 컷별 카메라 무브 (켄 번즈) ---------- */
type Move = { s0: number; s1: number; x0?: number; x1?: number; y0?: number; y1?: number };
const MOVES: Record<string, Move> = {
  h1_cbd: { s0: 1.12, s1: 1.02, y0: -2, y1: 1 },
  h2_skyline: { s0: 1.02, s1: 1.1 },
  h3_swirl: { s0: 1.06, s1: 1.0 },
  d1_bus: { s0: 1.0, s1: 1.07, x0: 1.5, x1: -1.5 },
  d1_plaza: { s0: 1.04, s1: 1.1 },
  d1_dinner: { s0: 1.06, s1: 1.0 },
  d1_redtower: { s0: 1.02, s1: 1.1, y0: 2, y1: -1 },
  d1_rainbow: { s0: 1.08, s1: 1.0 },
  d2_walk: { s0: 1.02, s1: 1.08 },
  d2_sign: { s0: 1.1, s1: 1.18 },
  d2_corridor: { s0: 1.0, s1: 1.07 },
  d2_reveal: { s0: 1.0, s1: 1.05 },
  d2_hall: { s0: 1.06, s1: 1.0 },
  d2_studio: { s0: 1.0, s1: 1.08 },
  d2_cheer: { s0: 1.02, s1: 1.1 },
  d3_board: { s0: 1.0, s1: 1.07 },
  d3_tea: { s0: 1.1, s1: 1.16 },
  msg_class: { s0: 1.0, s1: 1.08 },
  p_pazhou: { s0: 1.06, s1: 1.16, y0: 2, y1: -2 },
  p_eeo: { s0: 1.14, s1: 1.04 },
  p_board: { s0: 1.04, s1: 1.14 },
};

export const moveStyle = (id: string, local: number, dur: number): React.CSSProperties => {
  const m = MOVES[id] ?? { s0: 1.0, s1: 1.05 };
  const p = interpolate(local, [0, dur], [0, 1], clampX);
  const s = m.s0 + (m.s1 - m.s0) * p;
  const x = (m.x0 ?? 0) + ((m.x1 ?? 0) - (m.x0 ?? 0)) * p;
  const y = (m.y0 ?? 0) + ((m.y1 ?? 0) - (m.y0 ?? 0)) * p;
  return { transform: `translate(${x}%, ${y}%) scale(${s})` };
};

/* ---------- 영상 컷 ---------- */
// 클립에는 앞뒤 HANDLE 프레임 핸들이 들어 있다. 시퀀스는 from − HANDLE에서 시작한다.
export const VideoShot: React.FC<{ shot: Shot; local: number }> = ({ shot, local }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
    <AbsoluteFill style={moveStyle(shot.id, local, shot.dur)}>
      <OffthreadVideo src={staticFile(`guangzhou/clips/${shot.id}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  </AbsoluteFill>
);
export const videoSequenceFrom = (shot: Shot) => shot.from - HANDLE;

/* ---------- 풀블리드 사진 ---------- */
export const PhotoShot: React.FC<{ shot: Shot; local: number; objectPosition?: string }> = ({ shot, local, objectPosition = "50% 50%" }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
    <AbsoluteFill style={moveStyle(shot.id, local, shot.dur)}>
      <Img src={staticFile(`guangzhou/photos/${shot.id}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition }} />
    </AbsoluteFill>
  </AbsoluteFill>
);

/* ---------- 공항 현수막 (가로 사진을 세로 프레임에서 패닝) ---------- */
export const AirportShot: React.FC<{ local: number; dur: number }> = ({ local, dur }) => {
  // 원본 2880×2160 → 높이 1920 기준 2560×1920. 현수막 문구가 프레임 안으로 흘러 들어오도록 왼→오 패닝
  const p = interpolate(local, [0, dur], [0, 1], { ...clampX, easing: easeInOut });
  const scale = 1.12 + 0.08 * p;
  const W = 2560 * scale;
  const H = 1920 * scale;
  const cx = 1180 + 360 * p; // 원본(2560 스케일) 기준 화면 중심 x
  const left = 540 - cx * scale;
  const top = (1920 - H) / 2 - 40 * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Img src={staticFile("guangzhou/photos/p_airport.jpg")} style={{ position: "absolute", width: W, height: H, left, top }} />
    </AbsoluteFill>
  );
};

/* ---------- 폴라로이드 프린트 ---------- */
type PrintSpec = { w: number; aspect: number; rot: number; dx: number; dy: number; caption?: string; objectPosition?: string };
export const PRINTS: Record<string, PrintSpec> = {
  p_food1: { w: 760, aspect: 4 / 3, rot: -7, dx: -60, dy: -40, caption: "야식은 못 참지" },
  p_food2: { w: 760, aspect: 4 / 3, rot: 5, dx: 70, dy: 40 },
  p_dimsum: { w: 760, aspect: 4 / 3, rot: 6, dx: 60, dy: -50, caption: "점심은 딤섬!" },
  p_lunch: { w: 760, aspect: 4 / 3, rot: -5, dx: -60, dy: 50 },
  p_group: { w: 960, aspect: 2 / 3, rot: -3, dx: 0, dy: -30, caption: "함께라서 더 좋았던 3일" },
};

const PrintCard: React.FC<{ id: string; t: number; settled?: boolean }> = ({ id, t, settled }) => {
  const { fps } = useVideoConfig();
  const spec = PRINTS[id];
  const s = settled ? 1 : spring({ frame: t, fps, config: { damping: 12, stiffness: 180, mass: 0.8 } });
  const scale = 1.45 - 0.45 * s;
  const rot = spec.rot + (1 - s) * (spec.rot > 0 ? 14 : -14);
  const o = settled ? 1 : interpolate(t, [0, 2], [0, 1], clampX);
  const border = 30;
  const photoW = spec.w - border * 2;
  const photoH = photoW * spec.aspect;
  const bottom = spec.caption ? 150 : border * 3;
  return (
    <div
      style={{
        position: "absolute",
        left: 540 + spec.dx,
        top: 900 + spec.dy,
        width: spec.w,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`,
        opacity: o,
        background: "#FBFAF6",
        padding: `${border}px ${border}px ${bottom}px`,
        boxShadow: "0 30px 60px rgba(0,0,0,0.45), 0 6px 14px rgba(0,0,0,0.3)",
        borderRadius: 6,
      }}
    >
      <Img src={staticFile(`guangzhou/photos/${id}.jpg`)} style={{ display: "block", width: photoW, height: photoH, objectFit: "cover", objectPosition: spec.objectPosition ?? "50% 50%" }} />
      {spec.caption && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", fontFamily: HAND, fontSize: 76, color: "#1C1B17", transform: "rotate(-1.5deg)" }}>{spec.caption}</div>
      )}
    </div>
  );
};

// stackUnder: 먼저 떨어진 프린트들을 아래에 깐다(포토덤프 느낌)
export const PrintShot: React.FC<{ shot: Shot; local: number; stackUnder?: string[]; bgId?: string }> = ({ shot, local, stackUnder = [], bgId }) => {
  const bg = bgId ?? stackUnder[0] ?? shot.id;
  const drift = interpolate(local, [0, shot.dur], [1.25, 1.32], clampX);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.ink }}>
      <AbsoluteFill style={{ transform: `scale(${drift})`, filter: "blur(34px) brightness(0.55) saturate(1.15)" }}>
        <Img src={staticFile(`guangzhou/photos/${bg}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      {stackUnder.map((id) => (
        <PrintCard key={id} id={id} t={99} settled />
      ))}
      <PrintCard id={shot.id} t={local} />
    </AbsoluteFill>
  );
};

/* ---------- 셔터 오버레이 (프린트 컷 진입) ---------- */
export const shutterOpacity = (t: number) => {
  // 0: 검은 한 프레임 → 1~5: 하얀 플래시가 빠르게 빠진다
  if (t === 0) return { black: 0.85, white: 0 };
  return { black: 0, white: interpolate(t, [1, 5], [0.7, 0], clampX) };
};


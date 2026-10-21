import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { clamp, easeOutExpo, sp } from "../lib/motion";
import { FONT_FAMILY } from "../lib/fonts";
import { quadToMatrix3d, type Pt } from "./homography";
import { Mono } from "./fx";
import { R } from "./theme";

/*
 * 히어로 샷 — 클래스인 쇼룸의 빈 전자칠판 사진(board-dual-blank) 위에 1920×1080 칠판 화면을 원근 매핑한다.
 * f = HERO_CLOCK 기준 프레임. 그리드 중앙 타일(S3)과 풀스크린(S4)이 같은 f를 넘겨 줌인이 끊기지 않는다.
 *
 * 칠판 화면 타임라인(f)
 *   0–40    화면이 켜지고 상단 바·툴바가 올라온다
 *   20–150  예시 수업: 좌표축 → 포물선 → 식 → 꼭짓점 → 점이 곡선을 따라 이동, 우측 학생 타일
 *   150–176 지우개 스윕으로 판서를 걷어낸다
 *   168–    헤드라인 "좋은 수업을, 강사의 개인기에서 / 학원의 시스템으로." 가 칠판에 쓰인다
 */

// 사진(2560×1920)을 1920 폭으로 깔았을 때의 칠판 화면 꼭짓점 — scripts/board_corners.py 로 검출한 값에서 2px 안쪽으로 줄였다
const PHOTO_W = 1920;
const PHOTO_H = 1440;
const QUAD: [Pt, Pt, Pt, Pt] = [
  [275, 374],
  [1714, 377],
  [1717, 1192],
  [272, 1201],
];
const SCREEN_W = 1920;
const SCREEN_H = 1080;
const MATRIX = quadToMatrix3d(SCREEN_W, SCREEN_H, QUAD);

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: easeOutExpo });

// 포물선 y = x² − 4x + 3 (x: −0.6 … 4.6) → 그래프 박스 좌표
const GX = 150;
const GY = 210;
const GW = 980;
const GH = 640;
const toPx = (x: number, y: number): [number, number] => [GX + ((x + 1) / 6.2) * GW, GY + GH - ((y + 2) / 9) * GH];
const PARABOLA = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const x = -0.6 + (5.2 * i) / 64;
    const [px, py] = toPx(x, x * x - 4 * x + 3);
    pts.push(`${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return pts.join(" ");
})();

const STUDENTS = [
  { n: "지민", c: "#3FD39A" },
  { n: "도윤", c: "#C8F05A" },
  { n: "서아", c: "#7FD8FF" },
];

const Lesson: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const axes = ease(f, 18, 48);
  const curve = ease(f, 38, 98);
  const dotP = interpolate(f, [100, 156], [0, 1], clamp);
  const dx = -0.4 + 4.8 * dotP;
  const [dpx, dpy] = toPx(dx, dx * dx - 4 * dx + 3);
  const vtx = sp(f - 92, fps, { damping: 12, stiffness: 220, mass: 0.6 });
  const [vx, vy] = toPx(2, -1);
  const formula = "y = x² − 4x + 3";
  const shown = Math.round(interpolate(f, [50, 82], [0, formula.length], clamp));
  return (
    <>
      <svg width={SCREEN_W} height={SCREEN_H} style={{ position: "absolute", inset: 0 }}>
        {/* 격자 */}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`v${i}`} x1={GX + (i * GW) / 6.2 + GW / 6.2} y1={GY} x2={GX + (i * GW) / 6.2 + GW / 6.2} y2={GY + GH} stroke="rgba(255,255,255,0.06)" strokeWidth={2} />
        ))}
        {/* 축 */}
        <line x1={GX} y1={toPx(0, 0)[1]} x2={GX + GW * axes} y2={toPx(0, 0)[1]} stroke="rgba(255,255,255,0.7)" strokeWidth={4} strokeLinecap="round" />
        <line x1={toPx(0, 0)[0]} y1={GY + GH} x2={toPx(0, 0)[0]} y2={GY + GH - GH * axes} stroke="rgba(255,255,255,0.7)" strokeWidth={4} strokeLinecap="round" />
        {/* 포물선 */}
        <path d={PARABOLA} fill="none" stroke={R.lime} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - curve} style={{ filter: "drop-shadow(0 0 10px rgba(200,240,90,0.55))" }} />
        {/* 꼭짓점 */}
        <circle cx={vx} cy={vy} r={16 * vtx} fill={R.white} />
        <circle cx={vx} cy={vy} r={34 * vtx} fill="none" stroke={R.lime} strokeWidth={3} opacity={0.7} />
        {/* 곡선을 따라 움직이는 점 */}
        {f > 100 && f < 176 && <circle cx={dpx} cy={dpy} r={14} fill="#FF6B5A" style={{ filter: "drop-shadow(0 0 12px rgba(255,107,90,0.8))" }} />}
      </svg>
      <div style={{ position: "absolute", left: vx + 40, top: vy - 10, opacity: vtx, fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 700, color: R.white }}>꼭짓점 (2, −1)</div>
      <div style={{ position: "absolute", left: 640, top: 250, fontFamily: FONT_FAMILY, fontSize: 64, fontWeight: 800, color: R.white, letterSpacing: "-0.01em" }}>
        {formula.slice(0, shown)}
        {shown < formula.length && f > 50 && <span style={{ opacity: Math.floor(f / 15) % 2 ? 0 : 1, color: R.lime }}>|</span>}
      </div>
      {/* 학생 타일 */}
      <div style={{ position: "absolute", right: 60, top: 150, display: "flex", flexDirection: "column", gap: 22 }}>
        {STUDENTS.map((s, i) => {
          const k = sp(f - 30 - i * 8, fps, { damping: 15, stiffness: 200, mass: 0.7 });
          const hand = i === 1 && f > 118;
          return (
            <div
              key={s.n}
              style={{
                width: 360,
                height: 200,
                borderRadius: 22,
                background: `linear-gradient(150deg, ${R.board2} 0%, #0B1F18 100%)`,
                border: `2px solid ${hand ? R.lime : "rgba(255,255,255,0.12)"}`,
                position: "relative",
                transform: `translateX(${(1 - k) * 120}%)`,
                opacity: Math.min(1, k * 1.4),
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", left: "50%", top: 38, width: 92, height: 92, marginLeft: -46, borderRadius: 999, background: s.c, opacity: 0.9 }} />
              <div style={{ position: "absolute", left: "50%", top: 108, width: 150, height: 90, marginLeft: -75, borderRadius: "75px 75px 0 0", background: s.c, opacity: 0.55 }} />
              <div style={{ position: "absolute", left: 16, bottom: 12, fontFamily: FONT_FAMILY, fontSize: 26, fontWeight: 700, color: R.white }}>{s.n}</div>
              {hand && (
                <div style={{ position: "absolute", right: 14, top: 14, background: R.lime, color: R.ink, borderRadius: 999, padding: "4px 14px", fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 800, transform: `scale(${sp(f - 118, fps, { damping: 10, stiffness: 260, mass: 0.6 })})` }}>
                  ✋ 질문
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

const Headline: React.FC<{ f: number }> = ({ f }) => {
  const l1 = ease(f, 168, 196);
  const l2 = ease(f, 184, 214);
  const und = interpolate(f, [206, 236], [0, 1], { ...clamp, easing: easeOutExpo });
  const sign = ease(f, 226, 250);
  return (
    <div style={{ position: "absolute", left: 150, top: 300, fontFamily: FONT_FAMILY, color: R.white }}>
      <div style={{ overflow: "hidden" }}>
        <div style={{ fontSize: 78, fontWeight: 700, letterSpacing: "-0.03em", transform: `translateY(${(1 - l1) * 110}%)` }}>좋은 수업을, 강사의 개인기에서</div>
      </div>
      <div style={{ overflow: "hidden", marginTop: 6, paddingBottom: 24 }}>
        <div style={{ fontSize: 172, fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.05, color: R.lime, transform: `translateY(${(1 - l2) * 110}%)`, textShadow: "0 0 40px rgba(200,240,90,0.35)" }}>학원의 시스템으로.</div>
      </div>
      <svg width={1300} height={60} style={{ display: "block", marginTop: -30 }}>
        <path d="M8,34 C260,14 520,48 820,26 S1180,30 1290,20" fill="none" stroke={R.white} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - und} opacity={0.9} />
      </svg>
      <div style={{ marginTop: 34, opacity: sign, transform: `translateY(${(1 - sign) * 20}px)` }}>
        <Mono size={30} color="rgba(255,255,255,0.7)">Classin · 수업 시스템 OS</Mono>
      </div>
    </div>
  );
};

const BoardScreen: React.FC<{ f: number }> = ({ f }) => {
  const on = ease(f, 0, 22);
  const wipe = interpolate(f, [150, 176], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const wipeX = wipe * (SCREEN_W + 200) - 100;
  const bar = ease(f, 8, 34);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: SCREEN_W,
        height: SCREEN_H,
        transformOrigin: "0 0",
        transform: MATRIX,
        overflow: "hidden",
        background: `radial-gradient(ellipse 90% 80% at 40% 40%, ${R.board2} 0%, ${R.board} 60%, #0A1E17 100%)`,
        opacity: on,
        boxShadow: "0 0 160px rgba(63,211,154,0.22)",
      }}
    >
      {/* 상단 바 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, display: "flex", alignItems: "center", padding: "0 56px", gap: 26, background: "rgba(0,0,0,0.22)", transform: `translateY(${(1 - bar) * -100}%)` }}>
        <span style={{ width: 16, height: 16, borderRadius: 999, background: R.brandSoft }} />
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 34, fontWeight: 800, color: R.white }}>Classin</span>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>3단원 · 이차함수의 그래프</span>
        <span style={{ flex: 1 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: 700, color: R.white }}>
          <span style={{ width: 14, height: 14, borderRadius: 999, background: "#FF4D3D", opacity: Math.floor(f / 30) % 2 ? 0.35 : 1 }} />
          녹화 중
        </span>
      </div>
      {/* 판서 — 지우개 스윕 왼쪽은 지워진다 */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${Math.max(0, wipeX)}px)` }}>
        <Lesson f={f} />
      </div>
      {f >= 150 && f <= 178 && <div style={{ position: "absolute", top: 92, bottom: 0, left: wipeX - 30, width: 60, background: R.lime, boxShadow: "0 0 60px rgba(200,240,90,0.8)" }} />}
      {f >= 166 && <Headline f={f} />}
      {/* 하단 툴바 */}
      <div style={{ position: "absolute", left: "50%", bottom: 30, transform: `translate(-50%, ${(1 - bar) * 160}%)`, display: "flex", gap: 22, alignItems: "center", background: "rgba(0,0,0,0.3)", borderRadius: 999, padding: "14px 30px" }}>
        {["#FFFFFF", R.lime, "#FF6B5A", "#7FD8FF"].map((c) => (
          <span key={c} style={{ width: 30, height: 30, borderRadius: 999, background: c, border: c === R.lime ? "4px solid rgba(255,255,255,0.9)" : "none" }} />
        ))}
        <span style={{ width: 2, height: 30, background: "rgba(255,255,255,0.25)" }} />
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>EDB 1 / 50</span>
      </div>
      {/* 유리 반사 */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.04) 100%)" }} />
    </div>
  );
};

export const HeroShot: React.FC<{ f: number; push?: number; dim?: number }> = ({ f, push = 0, dim = 0 }) => {
  // 칠판 중앙(사진 좌표 995, 787 → 화면 995, 607)을 향해 밀고 들어간다
  const s = 1 + push * 0.14;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: R.night }}>
      <div style={{ position: "absolute", left: 0, top: -180, width: PHOTO_W, height: PHOTO_H, transform: `scale(${s})`, transformOrigin: "995px 787px" }}>
        <Img src={staticFile("reel/photos/board-dual-blank.jpg")} style={{ position: "absolute", inset: 0, width: PHOTO_W, height: PHOTO_H, filter: "saturate(0.8) contrast(1.06) brightness(0.8)" }} />
        <div style={{ position: "absolute", inset: 0, background: R.forest, mixBlendMode: "soft-light", opacity: 0.5 }} />
        <BoardScreen f={f} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 70% at 50% 52%, rgba(0,0,0,0) 55%, rgba(2,10,7,0.6) 100%)" }} />
      {dim > 0 && <AbsoluteFill style={{ background: R.night, opacity: dim }} />}
    </AbsoluteFill>
  );
};

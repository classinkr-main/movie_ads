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
 *   16–156  예시 영어 수업(현재완료): 예문 타이핑 → have + p.p. 주석 → 2021→Now 타임라인 아크 → 어휘 칩, 우측 학생 타일·질문
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

// 영어 수업(현재완료) — 예문 타이핑 → have + p.p. 주석 → 타임라인 아크 → 어휘 칩, 우측 학생 타일
const LINE1: Array<{ t: string; key?: boolean }> = [{ t: "I " }, { t: "have lived", key: true }, { t: " in Seoul" }];
const LINE2 = "for five years.";
const LINE1_LEN = LINE1.reduce((n, s) => n + s.t.length, 0);
const TL_Y = 780; // 타임라인 기준선
const TL_X0 = 250;
const TL_X1 = 1050;
const ARC = `M${TL_X0},${TL_Y} C${TL_X0 + 180},${TL_Y - 170} ${TL_X1 - 180},${TL_Y - 170} ${TL_X1},${TL_Y}`;
// 3차 베지어 위 점(아크를 따라 움직이는 점)
const arcAt = (u: number): [number, number] => {
  const p0 = [TL_X0, TL_Y];
  const p1 = [TL_X0 + 180, TL_Y - 170];
  const p2 = [TL_X1 - 180, TL_Y - 170];
  const p3 = [TL_X1, TL_Y];
  const a = (1 - u) ** 3;
  const b = 3 * (1 - u) ** 2 * u;
  const c = 3 * (1 - u) * u * u;
  const d = u ** 3;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
};
const WORDS = ["for", "since", "already", "yet", "ever"];

const STUDENTS = [
  { n: "지민", c: "#3FD39A" },
  { n: "도윤", c: "#A7F3D0" },
  { n: "서아", c: "#D6D3CC" },
];

const Lesson: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const n1 = Math.round(interpolate(f, [16, 50], [0, LINE1_LEN], clamp));
  const n2 = Math.round(interpolate(f, [48, 72], [0, LINE2.length], clamp));
  const marker = ease(f, 74, 94);
  const note = sp(f - 82, fps, { damping: 13, stiffness: 220, mass: 0.6 });
  const noteArrow = ease(f, 86, 104);
  const base = ease(f, 56, 86);
  const arc = ease(f, 86, 120);
  const arcLabel = ease(f, 108, 124);
  const dotU = interpolate(f, [112, 156], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const [dx, dy] = arcAt(dotU);
  const caret = Math.floor(f / 15) % 2 === 0;
  let left = n1;
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: 150 }}>
        <Mono size={22} color={R.accent}>{`Today's grammar · Present perfect`}</Mono>
      </div>
      {/* 예문 */}
      <div style={{ position: "absolute", left: 150, top: 300, fontFamily: FONT_FAMILY, fontSize: 96, fontWeight: 800, color: R.white, letterSpacing: "-0.02em", lineHeight: 1.12, whiteSpace: "pre" }}>
        <div>
          {LINE1.map((seg) => {
            const shown = seg.t.slice(0, Math.max(0, Math.min(seg.t.length, left)));
            left -= seg.t.length;
            if (!seg.key) return <span key={seg.t}>{shown}</span>;
            return (
              <span key={seg.t} style={{ position: "relative", display: "inline-block", color: marker > 0.5 ? R.accent : R.white }}>
                <span style={{ position: "absolute", left: -6, right: -6, bottom: 6, height: 22, borderRadius: 6, background: `rgba(${R.accentRgb},0.28)`, transform: `scaleX(${marker})`, transformOrigin: "0 50%" }} />
                <span style={{ position: "relative" }}>{shown}</span>
              </span>
            );
          })}
          {n1 < LINE1_LEN && f > 16 && <span style={{ opacity: caret ? 1 : 0, color: R.accent }}>|</span>}
        </div>
        <div>
          {LINE2.slice(0, n2)}
          {n1 >= LINE1_LEN && n2 < LINE2.length && <span style={{ opacity: caret ? 1 : 0, color: R.accent }}>|</span>}
        </div>
      </div>
      {/* have + p.p. 주석 */}
      <div style={{ position: "absolute", left: 640, top: 196, transform: `scale(${note})`, transformOrigin: "0% 100%", opacity: Math.min(1, note * 1.5) }}>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 34, fontWeight: 800, color: R.accentInk, background: R.accent, borderRadius: 999, padding: "8px 22px" }}>have + p.p.</span>
      </div>
      <svg width={SCREEN_W} height={SCREEN_H} style={{ position: "absolute", inset: 0 }}>
        <path d="M600,232 C540,236 470,262 452,300" fill="none" stroke={R.accent} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - noteArrow} />
        {/* 타임라인 */}
        <line x1={150} y1={TL_Y} x2={150 + 1000 * base} y2={TL_Y} stroke="rgba(255,255,255,0.7)" strokeWidth={4} strokeLinecap="round" />
        <circle cx={TL_X0} cy={TL_Y} r={12 * base} fill={R.white} />
        <circle cx={TL_X1} cy={TL_Y} r={14 * base} fill={R.accent} />
        <path d={ARC} fill="none" stroke={R.accent} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arc} style={{ filter: `drop-shadow(0 0 10px rgba(${R.accentRgb},0.6))` }} />
        {f > 112 && f < 176 && <circle cx={dx} cy={dy} r={14} fill={R.white} style={{ filter: `drop-shadow(0 0 14px rgba(${R.accentRgb},0.9))` }} />}
      </svg>
      <div style={{ position: "absolute", left: TL_X0 - 50, top: TL_Y + 28, opacity: base }}>
        <Mono size={26} color="rgba(255,255,255,0.7)">2021</Mono>
      </div>
      <div style={{ position: "absolute", left: TL_X1 - 36, top: TL_Y + 28, opacity: base }}>
        <Mono size={26} color={R.accent}>Now</Mono>
      </div>
      <div style={{ position: "absolute", left: (TL_X0 + TL_X1) / 2 - 150, top: TL_Y - 186, width: 300, textAlign: "center", opacity: arcLabel, transform: `translateY(${(1 - arcLabel) * 16}px)`, fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 700, color: R.white }}>
        for five years
      </div>
      {/* 어휘 칩 */}
      <div style={{ position: "absolute", left: 150, top: 880, display: "flex", gap: 18 }}>
        {WORDS.map((w, i) => {
          const k = sp(f - 96 - i * 6, fps, { damping: 14, stiffness: 230, mass: 0.6 });
          const on = i === 0;
          return (
            <span
              key={w}
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 36,
                fontWeight: 700,
                color: on ? R.accentInk : R.white,
                background: on ? R.accent : "rgba(255,255,255,0.08)",
                border: on ? "none" : "2px solid rgba(255,255,255,0.18)",
                borderRadius: 999,
                padding: "8px 28px",
                transform: `scale(${k})`,
                opacity: Math.min(1, k * 1.5),
              }}
            >
              {w}
            </span>
          );
        })}
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
                border: `2px solid ${hand ? R.accent : "rgba(255,255,255,0.12)"}`,
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
                <div style={{ position: "absolute", right: 14, top: 14, background: R.accent, color: R.accentInk, borderRadius: 999, padding: "4px 14px", fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 800, transform: `scale(${sp(f - 118, fps, { damping: 10, stiffness: 260, mass: 0.6 })})` }}>
                  ✋ 질문
                </div>
              )}
            </div>
          );
        })}
      </div>
      {f > 124 && (
        <div style={{ position: "absolute", right: 440, top: 392, background: R.white, color: R.ink, borderRadius: "22px 22px 4px 22px", padding: "14px 24px", fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 700, transform: `scale(${sp(f - 124, fps, { damping: 12, stiffness: 240, mass: 0.6 })})`, transformOrigin: "100% 100%", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
          since랑 for, 언제 써요?
        </div>
      )}
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
        <div style={{ fontSize: 172, fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.05, color: R.accent, transform: `translateY(${(1 - l2) * 110}%)`, textShadow: `0 0 40px rgba(${R.accentRgb},0.35)` }}>학원의 시스템으로.</div>
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
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>English B반 · Unit 5 현재완료</span>
        <span style={{ flex: 1 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: 700, color: R.white }}>
          <span style={{ width: 14, height: 14, borderRadius: 999, background: "#FF4D3D", opacity: Math.floor(f / 30) % 2 ? 0.35 : 1 }} />
          자동 녹화 중
        </span>
      </div>
      {/* 판서 — 지우개 스윕 왼쪽은 지워진다 */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${Math.max(0, wipeX)}px)` }}>
        <Lesson f={f} />
      </div>
      {f >= 150 && f <= 178 && <div style={{ position: "absolute", top: 92, bottom: 0, left: wipeX - 30, width: 60, background: R.accent, boxShadow: `0 0 60px rgba(${R.accentRgb},0.8)` }} />}
      {f >= 166 && <Headline f={f} />}
      {/* 하단 툴바 */}
      <div style={{ position: "absolute", left: "50%", bottom: 30, transform: `translate(-50%, ${(1 - bar) * 160}%)`, display: "flex", gap: 22, alignItems: "center", background: "rgba(0,0,0,0.3)", borderRadius: 999, padding: "14px 30px" }}>
        {["#FFFFFF", R.accent, "#FF6B5A", "#7FD8FF"].map((c) => (
          <span key={c} style={{ width: 30, height: 30, borderRadius: 999, background: c, border: c === R.accent ? "4px solid rgba(255,255,255,0.9)" : "none" }} />
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

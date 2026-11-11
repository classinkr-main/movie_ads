import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Lesson, LESSON_FULL, Slate, lessonAt, tipAt } from "../Chalk";
import { FONT_FAMILY } from "../fonts";
import { Flare, cl, fade } from "../fx";
import { BAR_H, BOARD, H, K, W, rgba } from "../theme";

// S1 (0–120f) — 어둠 속 매크로: 분필이 식과 포물선을 그리고, 지우개가 두 번 훑는다.

type Key = [number, number, number, number]; // frame, focusX, focusY, scale
const CAM: Key[] = [
  [0, 300, 222, 2.55],
  [25, 425, 232, 2.44],
  [35, 850, 430, 2.06],
  [46, 905, 372, 1.98],
  [70, 968, 330, 1.86],
  [84, 900, 338, 1.7],
  [112, 652, 342, 1.5],
  [120, 646, 341, 1.47],
];

// Catmull-Rom 보간 — 키프레임에서 멈칫하지 않는 카메라
const spline = (f: number, keys: Key[], idx: 1 | 2 | 3) => {
  if (f <= keys[0][0]) return keys[0][idx];
  if (f >= keys[keys.length - 1][0]) return keys[keys.length - 1][idx];
  let i = 0;
  while (i < keys.length - 2 && f > keys[i + 1][0]) i++;
  const p0 = keys[Math.max(0, i - 1)];
  const p1 = keys[i];
  const p2 = keys[i + 1];
  const p3 = keys[Math.min(keys.length - 1, i + 2)];
  const t = (f - p1[0]) / (p2[0] - p1[0]);
  const m1 = ((p2[idx] - p0[idx]) / (p2[0] - p0[0])) * (p2[0] - p1[0]);
  const m2 = ((p3[idx] - p1[idx]) / (p3[0] - p1[0])) * (p2[0] - p1[0]);
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p1[idx] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[idx] + (t3 - t2) * m2;
};

export const camAt = (f: number) => ({ fx: spline(f, CAM, 1), fy: spline(f, CAM, 2), s: spline(f, CAM, 3) });

// 지우개 — 세 번의 긴 스윕(→ ← →). 지워지는 영역은 경로를 따라가는 굵은 획으로 마스킹한다.
const ERASE: [number, number] = [82, 114];
const PASS_Y = [114, 340, 567];
const EX0 = -220;
const EX1 = BOARD.sw + 220;
const PASS_W = 236;
const LEN_PASS = EX1 - EX0;
const LEN_TURN = PASS_Y[1] - PASS_Y[0];
const LEN_TOTAL = LEN_PASS * 3 + LEN_TURN * 2;
const ERASE_PATH = `M${EX0} ${PASS_Y[0]} L${EX1} ${PASS_Y[0]} L${EX1} ${PASS_Y[1]} L${EX0} ${PASS_Y[1]} L${EX0} ${PASS_Y[2]} L${EX1} ${PASS_Y[2]}`;
const ease = (t: number) => 0.5 - Math.cos(Math.PI * Math.max(0, Math.min(1, t))) / 2;

/** 지우개가 지나간 거리(경로 길이 기준) */
const eraseDist = (f: number) => {
  const t = f - ERASE[0];
  if (t <= 0) return 0;
  if (t < 10) return ease(t / 10) * LEN_PASS;
  if (t < 11) return LEN_PASS + (t - 10) * LEN_TURN;
  if (t < 21) return LEN_PASS + LEN_TURN + ease((t - 11) / 10) * LEN_PASS;
  if (t < 22) return LEN_PASS * 2 + LEN_TURN + (t - 21) * LEN_TURN;
  if (t < 32) return LEN_PASS * 2 + LEN_TURN * 2 + ease((t - 22) / 10) * LEN_PASS;
  return LEN_TOTAL;
};
const erasePos = (dist: number): { x: number; y: number; dir: 1 | -1; turning: boolean } => {
  let r = dist;
  if (r <= LEN_PASS) return { x: EX0 + r, y: PASS_Y[0], dir: 1, turning: false };
  r -= LEN_PASS;
  if (r <= LEN_TURN) return { x: EX1, y: PASS_Y[0] + r, dir: -1, turning: true };
  r -= LEN_TURN;
  if (r <= LEN_PASS) return { x: EX1 - r, y: PASS_Y[1], dir: -1, turning: false };
  r -= LEN_PASS;
  if (r <= LEN_TURN) return { x: EX0, y: PASS_Y[1] + r, dir: 1, turning: true };
  r -= LEN_TURN;
  return { x: EX0 + Math.min(LEN_PASS, r), y: PASS_Y[2], dir: 1, turning: false };
};

const Eraser: React.FC<{ x: number; y: number; dir: 1 | -1; speed: number }> = ({ x, y, dir, speed }) => {
  const blur = Math.min(30, speed * 0.16);
  return (
    <div style={{ position: "absolute", left: x - 160, top: y - 130, width: 320, height: 260, filter: blur > 1 ? "url(#eraser-blur)" : undefined }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="eraser-blur" x="-60%" y="-10%" width="220%" height="120%">
          <feGaussianBlur stdDeviation={`${blur.toFixed(1)} 0`} />
        </filter>
      </svg>
      {/* 그림자 */}
      <div style={{ position: "absolute", left: 104, top: 22, width: 112, height: 232, borderRadius: 18, background: "rgba(0,0,0,0.55)", filter: "blur(14px)" }} />
      {/* 펠트 */}
      <div style={{ position: "absolute", left: 108, top: 12, width: 104, height: 236, borderRadius: 16, background: `linear-gradient(${dir === 1 ? 90 : 270}deg, #141917 0%, #2a322e 55%, #414c47 100%)` }} />
      {/* 손잡이 */}
      <div style={{ position: "absolute", left: 122, top: 26, width: 76, height: 208, borderRadius: 11, background: "linear-gradient(180deg, #C4A47C 0%, #A07F56 50%, #6F5435 100%)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.28), inset 0 -3px 6px rgba(0,0,0,0.35)" }} />
      <div style={{ position: "absolute", left: 122, top: 112, width: 76, height: 36, background: rgba(K.green, 0.9) }} />
    </div>
  );
};

// 분필 가루 — 지우개가 지나간 자리에서 피어오른다
const N_DUST = 190;
const EraseDust: React.FC<{ f: number }> = ({ f }) => {
  const items = [];
  for (let i = 0; i < N_DUST; i++) {
    const t0 = ERASE[0] + random(`ed-t${i}`) * (ERASE[1] - ERASE[0]);
    const age = f - t0;
    if (age < 0) continue;
    const e = erasePos(eraseDist(t0));
    if (e.turning) continue;
    const big = random(`ed-b${i}`) < 0.16;
    const sp = 8 + random(`ed-s${i}`) * 30;
    const drag = 1 - Math.exp(-age / 10);
    const x = e.x + e.dir * sp * 9 * drag + Math.sin(age / 15 + i) * 7;
    const y = e.y + (random(`ed-y${i}`) - 0.5) * PASS_W + (random(`ed-v${i}`) - 0.6) * 90 * drag - age * 0.3 + Math.sin(age / 12 + i * 2) * 5;
    const life = 50 + random(`ed-l${i}`) * 70;
    const al = Math.max(0, 1 - age / life) * Math.min(1, age / 2);
    if (al <= 0.01) continue;
    const size = (big ? 10 + random(`ed-z${i}`) * 16 : 2 + random(`ed-z${i}`) * 6) + age * 0.1;
    items.push(<circle key={i} cx={x} cy={y} r={size / 2} fill={K.chalk} opacity={al * (big ? 0.12 + random(`ed-a${i}`) * 0.12 : 0.3 + random(`ed-a${i}`) * 0.55)} />);
  }
  return (
    <svg width={BOARD.sw} height={BOARD.sh} viewBox={`0 0 ${BOARD.sw} ${BOARD.sh}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: "blur(1.2px)", mixBlendMode: "screen" }}>
      {items}
    </svg>
  );
};

// 분필 끝에서 떨어지는 가루
const TipDust: React.FC<{ f: number }> = ({ f }) => {
  const items = [];
  for (let g = Math.max(0, Math.floor(f) - 26); g <= f; g++) {
    for (let k = 0; k < 3; k++) {
      const tip = tipAt(g + k / 3);
      if (tip.on < 0.5) continue;
      const age = f - g - k / 3;
      if (age < 0) continue;
      const r = random(`td${g}-${k}`);
      const x = tip.x + (r - 0.5) * age * 1.7;
      const y = tip.y + age * age * 0.085 + age * 0.5;
      const al = Math.max(0, 1 - age / 26) * 0.75;
      items.push(<circle key={`${g}-${k}`} cx={x} cy={y} r={1.1 + r * 1.5} fill={K.chalk} opacity={al} />);
    }
  }
  return (
    <svg width={BOARD.sw} height={BOARD.sh} viewBox={`0 0 ${BOARD.sw} ${BOARD.sh}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {items}
    </svg>
  );
};

export const Open: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const drift = { x: Math.sin(f / 17) * 3 + Math.sin(f / 7.3) * 1.2, y: Math.cos(f / 21) * 2.4 };
  const tx = W / 2 - cam.fx * cam.s + drift.x;
  const ty = H / 2 - cam.fy * cam.s + drift.y;
  const tip = tipAt(f);
  const tipX = tx + tip.x * cam.s;
  const tipY = ty + tip.y * cam.s;

  const dist = eraseDist(f);
  const erasing = f >= ERASE[0];
  const er = erasePos(dist);
  const speed = eraseDist(f + 0.5) - eraseDist(f - 0.5);
  const eraseP = dist / LEN_TOTAL;
  const eraseMask = (
    <>
      <filter id="open-erase-soft" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <mask id="open-erase" maskUnits="userSpaceOnUse" x={-400} y={-150} width={BOARD.sw + 800} height={BOARD.sh + 300}>
        <rect x={-400} y={-150} width={BOARD.sw + 800} height={BOARD.sh + 300} fill="#fff" />
        {eraseP > 0.0005 && <path d={ERASE_PATH} stroke="#000" strokeWidth={PASS_W} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - eraseP} filter="url(#open-erase-soft)" />}
      </mask>
    </>
  );

  // 조명 — 분필 끝을 따라가는 스폿 → 지우개 구간에서 넓게 열린다
  const open = interpolate(f, [76, 90], [0, 1], cl);
  const lightIn = interpolate(f, [2, 12], [0, 1], cl);
  const spotX = interpolate(open, [0, 1], [tipX, W * 0.5]);
  const spotY = interpolate(open, [0, 1], [tipY, H * 0.5]);
  const spotR = interpolate(open, [0, 1], [820, 1500]);
  const dark = interpolate(open, [0, 1], [0.86, 0.5]);
  const out = interpolate(f, [114, 119.5], [1, 0.25], cl);

  const caption = fade(f, 56, 68, 106, 115);

  return (
    <AbsoluteFill style={{ background: K.black }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: BOARD.sw, height: BOARD.sh, transform: `translate(${tx}px, ${ty}px) scale(${cam.s}) rotate(${-0.6 + Math.sin(f / 40) * 0.25}deg)`, transformOrigin: "0 0", opacity: lightIn * out }}>
        <Slate id="open-slate" />
        {/* 지운 자국 */}
        {erasing && (
          <>
            <div style={{ position: "absolute", inset: 0, opacity: 0.13, filter: "blur(5px)" }}>
              <Lesson id="open-ghost" p={LESSON_FULL} rough={false} />
            </div>
            <svg width={BOARD.sw} height={BOARD.sh} viewBox={`0 0 ${BOARD.sw} ${BOARD.sh}`} style={{ position: "absolute", left: 0, top: 0, filter: "blur(10px)" }}>
              <path d={ERASE_PATH} stroke={rgba(K.chalk, 0.07)} strokeWidth={PASS_W * 0.82} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - eraseP} />
              <path d={ERASE_PATH} stroke={rgba(K.chalk, 0.05)} strokeWidth={PASS_W * 0.3} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - eraseP} />
            </svg>
          </>
        )}
        <div style={{ position: "absolute", inset: 0 }}>
          <Lesson id="open-lesson" p={lessonAt(f)} defs={erasing ? eraseMask : undefined} maskId={erasing ? "open-erase" : undefined} />
        </div>
        <TipDust f={f} />
        {erasing && <EraseDust f={f} />}
        {erasing && f < ERASE[1] + 0.5 && !er.turning && <Eraser x={er.x} y={er.y} dir={er.dir} speed={Math.abs(speed)} />}
      </div>

      {/* 비스듬히 떨어지는 약한 주변광 */}
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: lightIn * out, background: `linear-gradient(118deg, transparent 22%, ${rgba(K.mintHot, 0.035)} 40%, ${rgba(K.mintHot, 0.06)} 50%, transparent 68%)` }} />
      {/* 스폿 조명 밖은 어둠 */}
      <AbsoluteFill style={{ background: `radial-gradient(circle ${spotR}px at ${spotX}px ${spotY}px, transparent 0%, rgba(0,0,0,${dark * 0.3}) 38%, rgba(0,0,0,${dark}) 84%)` }} />
      <AbsoluteFill style={{ mixBlendMode: "screen", background: `radial-gradient(circle ${spotR * 0.6}px at ${spotX}px ${spotY}px, ${rgba(K.mint, 0.13 * lightIn * out)} 0%, transparent 70%)` }} />

      {/* 얕은 심도 — 위·아래 가장자리 포커스 아웃(카메라가 빠지면 풀린다) */}
      <div style={{ position: "absolute", left: 0, top: BAR_H, width: W, height: 200, backdropFilter: `blur(${(9 * (1 - open * 0.75)).toFixed(1)}px)`, WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 100%)" }} />
      <div style={{ position: "absolute", left: 0, bottom: BAR_H, width: W, height: 220, backdropFilter: `blur(${(10 * (1 - open * 0.75)).toFixed(1)}px)`, WebkitMaskImage: "linear-gradient(0deg, #000 0%, transparent 100%)" }} />
      {/* 자막 스크림 */}
      <div style={{ position: "absolute", left: 0, bottom: BAR_H, width: W, height: 230, opacity: caption, background: "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)" }} />

      {/* 분필 끝 — 작은 빛 */}
      <Flare x={tipX} y={tipY} power={tip.on * (0.46 + Math.sin(f * 1.7) * 0.05) * out} length={560} core={0.36} ghosts={false} />

      {/* 자막 */}
      <div style={{ position: "absolute", left: 0, width: W, bottom: BAR_H + 58, textAlign: "center", opacity: caption, transform: `translateY(${(1 - Math.min(1, caption * 1.4)) * 10}px)` }}>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 54, fontWeight: 500, color: K.white, letterSpacing: `${interpolate(caption, [0, 1], [0.06, -0.01])}em`, textShadow: "0 2px 24px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.9)" }}>칠판은 지워져도,</span>
      </div>
    </AbsoluteFill>
  );
};

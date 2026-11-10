import React from "react";
import { Img, staticFile } from "remotion";
import { B } from "../story/beats";
import { C } from "../lib/theme";
import { camLive, camPath, clamp, E, lerp, lerp3, pop, ring, tw, V3 } from "../lib/motion";
import { Burst, Bx, Check, ChoreBlock, Cloud, Cy, OUTFIT, Person, Pose, RecButton, Sign, Slab, Soul, Sp, Torus } from "../three/kit";
import { DAY } from "../three/Stage";
import { Chip, Slam, Tag } from "../overlay/kit";
import { CHORES, Tree, treeTop } from "./sets";
import type { SceneDef } from "./types";

const GREEN_BG = "#E7F0E4";

/** 워드마크가 든 흰 카드(화면 고정). */
export const LogoCard: React.FC<{ f: number; t0: number; t1?: number; x: number; y: number; u: number; h?: number; stacked?: boolean }> = ({ f, t0, t1 = 1e9, x, y, u, h = 74, stacked }) => {
  if (f < t0 || f > t1 + 6) return null;
  const p = tw(f, t0, 10, E.back);
  const out = 1 - tw(f, t1, 6, E.in);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${p}) rotate(${-2 + p * 0}deg)`,
        opacity: out,
        background: "#FFFFFF",
        border: `${4 * u}px solid ${C.ink}`,
        borderRadius: h * u * 0.32,
        boxShadow: `${7 * u}px ${7 * u}px 0 ${C.ink}`,
        padding: `${h * u * 0.34}px ${h * u * 0.5}px`,
        display: "flex",
      }}
    >
      <Img src={staticFile(stacked ? "brand/classin-logo-stacked.png" : "brand/classin-wordmark.png")} style={{ height: h * u, display: "block" }} />
    </div>
  );
};

// ── S13 · 공사팀: 통째로 시스템이 받자 ───────────────────────────────────────
const b22 = B.b22;
const b23 = B.b23;
const TX = -1.0; // 선생님 위치
const SX = 4.5; // 시스템 상자 위치
const craneIn = b22.ph[1].start - 4;
const idea = b22.ph[1].start + 6;
const hookDown = b23.start + 1;
const liftT = b23.ph[0].start + Math.round((b23.ph[1].start - b23.ph[0].start) * 0.55);
const moveT = b23.ph[1].start + 1;
const lowerT = moveT + 13;
const shutT = lowerT + 13;
const BOX_H = 3.0;
const JIB_Y = 7.1;

const S13World: React.FC<{ f: number }> = ({ f }) => {
  const mast = tw(f, craneIn, 14, E.out);
  const lifted = tw(f, liftT, 10, E.io);
  const moved = tw(f, moveT, 13, E.io);
  const lowered = tw(f, lowerT, 12, E.io);
  const trolleyX = lerp(TX, SX, moved);
  const stackRest = 0.14 + 1.62 * 0.2; // 납작해진 선생님 위
  const stackY = lerp(stackRest, 3.6, lifted) - lowered * (3.6 - 0.25);
  const hookY = f < liftT ? lerp(JIB_Y - 0.6, stackRest + 4 * 0.53 + 0.35, tw(f, hookDown, liftT - hookDown - 2, E.io)) : stackY + 4 * 0.53 + 0.35 + (f >= shutT ? tw(f, shutT, 10, E.io) * 3 : 0);
  const swing = Math.sin(f * 0.25) * 0.05 * (lifted - lowered) + ring(f, moveT + 13, 0.08, 0.5, 0.1);
  const free = f >= liftT + 2 ? tw(f, liftT + 2, 10, E.elastic) : 0;
  const shut = tw(f, shutT, 8, E.out);
  const boot = f >= shutT + 6;
  const tPose: Pose =
    free > 0
      ? { squash: lerp(0.2, 1, free), armL: [2.4, 0], armR: [2.4, 0], eyes: free > 0.6 ? "wide" : "x", mouth: free > 0.6 ? "smile" : "flat", headPitch: -0.3, bounce: Math.abs(ring(f, liftT + 6, 0.2, 0.9, 0.2)) }
      : { squash: 0.2, armL: [1.5, 0], armR: [1.5, 0], eyes: "x", mouth: "flat" };
  return (
    <group>
      <Slab w={15.5} d={5.4} c="#EFE8D4" edge="#C8BC9C" p={[0.6, 0, 0.2]} />
      {/* 공사팀 */}
      {[-6.1, -5.0, -3.9].map((x, i) => {
        const inn = pop(f, b22.start + 3 + i * 3, 13);
        const lead = i === 1;
        const cheer = f >= idea ? tw(f, idea, 8, E.back) : 0;
        const pointing = f >= b23.start ? tw(f, b23.start, 8, E.back) : 0;
        return (
          <group key={i} position={[x, 0, lead ? 0.9 : 0.4]} scale={[inn, inn, inn]}>
            <Person
              yaw={0.55}
              outfit={OUTFIT.crew}
              pose={{
                armR: lead ? [0.2 + pointing * 1.9 + cheer * (1 - pointing) * 2.5, 0.3] : [0.2 + cheer * 2.5, 0],
                armL: [0.2 + cheer * (lead ? 0.6 : 2.5), 0],
                mouth: f >= idea ? (lead && f >= b23.start && Math.floor(f / 4) % 2 ? "open" : "smile") : "flat",
                eyes: f >= idea ? "happy" : "dot",
                bounce: Math.abs(ring(f, idea + i * 2, 0.16, 0.9, 0.2)),
                headYaw: f >= b23.start ? 0.3 : lead ? 0 : (i === 0 ? 0.5 : -0.5),
              }}
            />
          </group>
        );
      })}
      <Sign text="공사팀" w={1.9} h={0.48} size={0.28} color={C.ink} bg="#FFC83D" radius={0.08} p={[-5.0, 0.3, 1.9]} r={[-0.35, 0, 0]} weight={900} sc={pop(f, b22.start + 10, 10)} />
      {/* 전구 */}
      <group position={[-5.0, 2.45 + Math.sin(f * 0.2) * 0.04, 0.9]} scale={pop(f, idea, 10)}>
        <Sp rr={0.26} c={C.lime} em={C.lime} ei={1.2} cast={false} />
        <Cy rr={0.12} h={0.17} c={C.metal} p={[0, -0.29, 0]} />
      </group>
      <Burst frame={f} t0={idea + 2} p={[-5.0, 2.45, 0.9]} colors={[C.lime, "#FFFFFF"]} n={12} reach={1.0} size={0.07} dur={14} />
      {/* 받침 위 선생님 */}
      <Cy rr={[1.5, 1.62]} h={0.2} c="#FFFDF6" p={[TX, -0.04, 0]} seg={48} />
      <Person p={[TX, 0.06, 0]} outfit={OUTFIT.teacher} pose={tPose} />
      {/* 타워 크레인 */}
      <group position={[1.75, 0, -1.7]} scale={[1, mast, 1]} visible={f >= craneIn}>
        <Bx s={[1.5, 0.3, 1.5]} rad={0.06} c="#5C646E" p={[0, 0.15, 0]} />
        <Bx s={[0.5, JIB_Y + 0.4, 0.5]} rad={0.05} c="#FFC83D" p={[0, (JIB_Y + 0.4) / 2, 0]} />
        {Array.from({ length: 9 }).map((_, i) => (
          <Bx key={i} s={[0.54, 0.07, 0.54]} rad={0.01} c="#E0A82A" p={[0, 0.7 + i * 0.75, 0]} cast={false} />
        ))}
        <Bx s={[0.8, 0.6, 0.8]} rad={0.08} c="#F4F1E6" p={[0, JIB_Y + 0.55, 0]} />
      </group>
      {mast > 0.95 && (
        <group position={[0, JIB_Y, -1.7]}>
          <Bx s={[11.5, 0.34, 0.4]} rad={0.05} c="#FFC83D" p={[1.2, 0, 0]} />
          <Bx s={[1.3, 0.9, 0.8]} rad={0.08} c="#5C646E" p={[-3.9, -0.3, 0]} />
          {/* 트롤리 · 케이블 · 후크 */}
          <Bx s={[0.6, 0.24, 0.5]} rad={0.04} c="#2A2D36" p={[trolleyX, -0.28, 0]} />
        </group>
      )}
      {mast > 0.95 && (
        <group position={[trolleyX, 0, 0]}>
          <group position={[0, JIB_Y - 0.4, -1.7]} rotation={[Math.atan2(1.7, JIB_Y - 0.4 - hookY), 0, 0]}>
            <Cy rr={0.022} h={Math.hypot(JIB_Y - 0.4 - hookY, 1.7)} c={C.ink} p={[0, -Math.hypot(JIB_Y - 0.4 - hookY, 1.7) / 2, 0]} cast={false} />
          </group>
          <group position={[0, hookY, 0]} rotation={[0, 0, swing]}>
            <Bx s={[0.34, 0.3, 0.3]} rad={0.05} c="#FFC83D" />
            <Torus rr={0.14} tube={0.045} arc={Math.PI * 1.4} c="#2A2D36" p={[0, -0.26, 0]} r={[0, 0, Math.PI * 0.8]} />
          </group>
        </group>
      )}
      {/* 수업 후 작업 네 덩어리 — 통째로 들려 갑니다 */}
      <group position={[lerp(TX, SX, moved), stackY, 0]} rotation={[0, 0, swing]} visible={lowered < 0.98}>
        {CHORES.map((c, i) => (
          <ChoreBlock key={i} label={c.label} c={c.c} p={[0, i * 0.53, 0]} r={[0, i % 2 ? -0.1 : 0.12, f < liftT ? (i % 2 ? 0.1 : -0.08) * (1 - lifted) : 0]} sc={[1, 0.86, 1]} />
        ))}
      </group>
      {/* 시스템 상자 */}
      <group position={[SX, ring(f, shutT + 6, 0.12, 0.9, 0.2), 0]}>
        <Bx s={[2.7, BOX_H, 1.9]} rad={0.14} c={C.forest} p={[0, BOX_H / 2, 0]} />
        <Bx s={[2.2, 0.06, 1.4]} rad={0.02} c="#04261C" p={[0, BOX_H + 0.005, 0]} cast={false} />
        <Bx s={[2.5, 0.16, 1.7]} rad={0.05} c={C.brand} p={[lerp(-2.6, 0, shut), BOX_H + 0.08, 0]} vis={f >= shutT} />
        <Sign text="시스템" w={2.1} h={0.78} size={0.5} color="#FFFFFF" slam p={[0, BOX_H * 0.6, 0.955]} />
        {Array.from({ length: 5 }).map((_, i) => {
          const on = boot && f >= shutT + 6 + i * 2;
          return <Sp key={i} rr={0.08} c={on ? C.lime : "#0B5A43"} em={C.lime} ei={on ? 1.4 : 0} p={[-0.7 + i * 0.35, BOX_H * 0.28, 0.96]} cast={false} />;
        })}
      </group>
      <Burst frame={f} t0={shutT + 6} p={[SX, BOX_H + 0.3, 0.6]} colors={[C.lime, "#FFFFFF", C.leaf]} n={18} reach={2.0} size={0.1} dur={22} />
    </group>
  );
};

const S13: SceneDef = {
  id: "s13",
  name: "공사팀 — 통째로 시스템이 받자",
  start: b22.start,
  end: b23.end,
  bg: GREEN_BG,
  look: { ...DAY, reach: 13, shadow: 0.18 },
  tallK: 1.5,
  cam: (f, tall) =>
    camLive(
      camPath(f, [
        [b22.start, { p: [-3.6, 2.6, 9.0], t: [-4.2, 1.3, 0.4], fov: 30 }],
        [craneIn, { p: [-3.2, 2.8, 9.6], t: [-3.9, 1.4, 0.4], fov: 30 }, E.lin],
        [craneIn + 16, { p: [-0.2, 4.6, 17.0], t: [-0.4, 3.2, 0], fov: 30 }, E.io],
        [moveT, { p: [0.4, 4.6, 17.4], t: [tall ? TX : 0.2, 3.2, 0], fov: 30 }, E.lin],
        [lowerT + 8, { p: [1.6, 4.4, 17.0], t: [tall ? SX - 0.8 : 1.0, 3.1, 0], fov: 30 }, E.io],
        [b23.end, { p: [1.9, 4.3, 16.6], t: [tall ? SX - 0.8 : 1.1, 3.1, 0], fov: 30 }, E.lin],
      ]),
      f,
      { shakeAt: [shutT + 6], shakeAmp: 0.18 },
    ),
  World: S13World,
  Over: ({ f, u, w, h, tall }) => (
    <Slam
      f={f}
      t0={b23.start + 1}
      t1={b23.end - 5}
      lines={tall ? ["“선생님이", "해야 하는 일을", "통째로", "시스템이 받자.”"] : ["“선생님이 해야 하는 일을", "통째로 시스템이 받자.”"]}
      u={u}
      size={tall ? 92 : 78}
      tone="lime"
      x={tall ? 0.5 : 0.56}
      y={tall ? 0.29 : 0.17}
      w={w}
      h={h}
      rotate={-2}
      stagger={Math.max(4, b23.ph[1].start - b23.ph[0].start)}
    />
  ),
};

// ── S14 · 녹화 버튼 하나 ──────────────────────────────────────────────────────
const b24 = B.b24;
const pressT = b24.ph[1].start + Math.round((b24.speechEnd - b24.ph[1].start) * 0.66);

const S14World: React.FC<{ f: number }> = ({ f }) => {
  const hop = clamp((f - (pressT - 9)) / 9);
  const press = tw(f, pressT, 3, E.out);
  const jumpY = f < pressT ? Math.sin(hop * Math.PI) * 0.55 : Math.abs(ring(f, pressT, 0.1, 1.0, 0.25));
  const reach = tw(f, b24.ph[1].start, 8, E.io);
  return (
    <group>
      <Cy rr={[3.3, 3.5]} h={0.24} c="#FFFDF6" p={[0, -0.1, 0]} seg={64} />
      <Cy rr={[1.55, 1.75]} h={0.36} c={C.forest} p={[0, 0.2, 0]} seg={48} />
      <Cy rr={1.2} h={0.05} c={C.lime} em={C.lime} ei={0.3 + press * 0.9} p={[0, 0.39, 0]} seg={48} cast={false} />
      <RecButton p={[0, 0.38, 0]} sc={1.3} press={press} glow={0.5 + press * 1.3 + Math.max(0, Math.sin(f * 0.3)) * 0.2} />
      <Person
        p={[-1.5, 0.02 + jumpY, 0.25]}
        yaw={1.35}
        outfit={OUTFIT.teacher}
        pose={{ armR: [0.35, 0.4 + reach * 0.95], armL: [0.35, 0.4 + reach * 0.95 * (f >= pressT - 9 ? 1 : 0.2)], eyes: f >= pressT ? "happy" : "dot", mouth: f >= pressT ? "smile" : "o", pitch: press * 0.16, squash: f >= pressT ? 1 - Math.abs(ring(f, pressT, 0.12, 1.1, 0.25)) : 1, headYaw: -0.2 }}
      />
      {/* 바닥으로 퍼지는 파동 */}
      {[0, 1, 2].map((i) => {
        const k = clamp((f - (pressT + i * 5)) / 26);
        if (k <= 0 || k >= 1) return null;
        const r = lerp(0.9, 7.5, E.out(k));
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} scale={[r, r, 1]} dispose={null}>
            <torusGeometry args={[1, 0.02 + 0.03 * (1 - k), 8, 72]} />
            <meshBasicMaterial color={C.brand} transparent opacity={(1 - k) * 0.9} toneMapped={false} />
          </mesh>
        );
      })}
      <Burst frame={f} t0={pressT} p={[0, 1.1, 0]} colors={[C.lime, "#FFFFFF", C.red]} n={16} reach={2.0} size={0.1} dur={20} />
    </group>
  );
};

const S14: SceneDef = {
  id: "s14",
  name: "녹화 버튼 하나",
  start: b24.start,
  end: b24.end,
  bg: GREEN_BG,
  look: DAY,
  enter: "whip",
  tallK: 1.35,
  cam: (f) =>
    camLive(
      camPath(f, [
        [b24.start, { p: [4.4, 3.2, 8.6], t: [-0.3, 1.0, 0], fov: 30 }],
        [pressT - 2, { p: [3.6, 2.7, 7.2], t: [-0.3, 1.0, 0], fov: 30 }, E.io],
        [pressT + 4, { p: [3.1, 2.4, 6.2], t: [-0.25, 0.95, 0], fov: 30 }, E.expo],
        [b24.end, { p: [3.5, 2.8, 7.4], t: [-0.25, 1.0, 0], fov: 30 }, E.out],
      ]),
      f,
      { shakeAt: [pressT], shakeAmp: 0.26 },
    ),
  World: S14World,
  Over: ({ f, pr, u, w, h, tall }) => {
    const btn = pr([0.6, 1.25, 0]);
    return (
      <>
        <LogoCard f={f} t0={b24.start + 3} t1={b24.end - 3} x={w * (tall ? 0.5 : 0.5)} y={h * (tall ? 0.24 : 0.17)} u={u} h={tall ? 84 : 88} />
        <Tag f={f} t0={pressT + 5} t1={b24.end - 3} at={btn} dx={tall ? 40 : 230} dy={tall ? -210 : -90} text="선생님이 누른 버튼: 1개" tone="lime" u={u} size={38} />
      </>
    );
  },
};

// ── S15 · 자동 네 단계 ────────────────────────────────────────────────────────
const b25 = B.b25;
const ST = [-4.8, -1.6, 1.6, 4.8];
const LABEL = ["촬영", "업로드", "시청 체크", "관리"];
const act = (i: number) => b25.ph[i].start + Math.round((b25.ph[i].end - b25.ph[i].start) * 0.42);
const wideT = b25.ph[4].start;

const S15World: React.FC<{ f: number }> = ({ f }) => {
  // 바닥 레일을 따라 달리는 펄스
  const stops: Array<[number, number]> = [[b25.start, -7.4], ...ST.map((x, i) => [act(i), x] as [number, number]), [wideT + 10, 7.4]];
  let px = stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (f >= stops[i - 1][0]) px = lerp(stops[i - 1][1], stops[i][1], E.io(clamp((f - stops[i - 1][0]) / Math.max(1, stops[i][0] - stops[i - 1][0]))));
  }
  return (
    <group>
      <Bx s={[16.4, 0.34, 4.2]} rad={0.12} c={C.forest} p={[0, -0.17, 0]} />
      <Bx s={[15.6, 0.05, 0.14]} rad={0.02} c="#0B5A43" p={[0, 0.02, 1.55]} cast={false} />
      <Bx s={[1, 0.06, 0.16]} rad={0.02} c={C.lime} em={C.lime} ei={0.8} p={[(px - 7.4) / 2 - 0.0, 0.03, 1.55]} sc={[Math.max(0.01, px + 7.4), 1, 1]} cast={false} />
      <Sp rr={0.16} c="#FFFFFF" em={C.lime} ei={2} p={[px, 0.14, 1.55]} cast={false} />
      {ST.map((x, i) => {
        const a = act(i);
        const on = f >= a;
        const inn = pop(f, a, 12);
        const t = f - a;
        return (
          <group key={i} position={[x, 0, 0]}>
            <Bx s={[2.5, 0.16, 2.3]} rad={0.07} c="#0B5A43" p={[0, 0.08, -0.1]} />
            {/* 기계 이름표 + AUTO 등 */}
            <group position={[0, 0.3, 1.02]} rotation={[-0.42, 0, 0]}>
              <Bx s={[2.0, 0.5, 0.08]} rad={0.07} c="#04261C" />
              <Sign text={LABEL[i]} w={1.4} h={0.4} size={0.25} color={on ? C.forest : "#9FB8AD"} bg={on ? C.lime : "#0B5A43"} radius={0.07} p={[-0.2, 0, 0.046]} weight={900} />
              <Sp rr={0.09} c={on ? C.lime : "#0B5A43"} em={C.lime} ei={on ? 1.6 : 0} p={[0.75, 0, 0.06]} cast={false} />
            </group>
            {i === 0 && (
              <group scale={[inn, inn, inn]} position={[0, 0.16, -0.2]}>
                <Cy rr={0.09} h={1.3} c={C.metal} p={[0, 0.65, 0]} />
                <group position={[0, 1.5, 0]} rotation={[0.1, Math.sin(t * 0.09) * 0.5, 0]}>
                  <Bx s={[0.9, 0.56, 0.62]} rad={0.08} c="#2A2D36" />
                  <Cy rr={[0.22, 0.2]} h={0.4} c="#15171D" p={[0, 0, 0.5]} r={[Math.PI / 2, 0, 0]} />
                  <Cy rr={0.15} h={0.02} c="#5B8DEF" em="#5B8DEF" ei={0.8} p={[0, 0, 0.71]} r={[Math.PI / 2, 0, 0]} cast={false} />
                  <Sp rr={0.07} c={C.red} em={C.red} ei={Math.floor(t / 8) % 2 ? 0.3 : 1.6} p={[0.3, 0.34, 0.22]} cast={false} />
                </group>
              </group>
            )}
            {i === 1 && (
              <group scale={[inn, inn, inn]} position={[0, 0.16, -0.2]}>
                <Cy rr={0.42} h={2.5} c="#CFE8FF" op={0.22} gloss p={[0, 1.25, 0]} cast={false} />
                <Cy rr={0.5} h={0.14} c="#0B5A43" p={[0, 0.07, 0]} />
                <Cloud p={[0, 3.25 + Math.abs(Math.sin((t / 20) * Math.PI)) * 0.08, 0]} sc={0.95} em={0.35} />
                {on &&
                  [0, 1].map((k) => {
                    const ph = (t / 20 + k * 0.5) % 1;
                    return <Bx key={k} s={[0.42, 0.42, 0.42]} rad={0.07} c={C.amber} em={C.amber} ei={0.3} p={[0, 0.35 + ph * 2.5, 0]} sc={1 - ph * 0.55} r={[0, ph * 3, 0]} cast={false} />;
                  })}
              </group>
            )}
            {i === 2 && (
              <group scale={[inn, inn, inn]} position={[0, 0.16, -0.3]} rotation={[-0.16, 0, 0]}>
                <Bx s={[2.0, 1.6, 0.12]} rad={0.07} c="#FFFDF4" p={[0, 1.0, 0]} />
                {Array.from({ length: 12 }).map((_, k) => {
                  const lit = t >= 3 + k * 1.6;
                  return <Sp key={k} rr={0.13} c={lit ? C.leaf : "#D9D3C2"} em={C.leaf} ei={lit ? 0.9 : 0} p={[-0.66 + (k % 4) * 0.44, 1.45 - Math.floor(k / 4) * 0.44, 0.09]} sc={lit ? 1 + Math.max(0, 0.5 - (t - 3 - k * 1.6) * 0.1) : 1} cast={false} />;
                })}
                <Check p={[1.25, 1.9, 0.2]} sc={1.3 * pop(f, a + 24, 9)} />
              </group>
            )}
            {i === 3 && (
              <group scale={[inn, inn, inn]} position={[0, 0.16, -0.3]}>
                <Bx s={[2.0, 2.2, 0.1]} rad={0.05} c="#0B5A43" p={[0, 1.1, -0.36]} />
                {[0.1, 0.8, 1.5, 2.2].map((y) => (
                  <Bx key={y} s={[2.0, 0.08, 0.76]} rad={0.03} c="#F4F1E6" p={[0, y, 0]} />
                ))}
                {Array.from({ length: 9 }).map((_, k) => {
                  const k0 = clamp((t - 2 - k * 3) / 9);
                  if (k0 <= 0) return null;
                  const to: V3 = [-0.6 + (k % 3) * 0.6, 0.38 + Math.floor(k / 3) * 0.7, 0];
                  const p = lerp3([-2.2, 2.6, 0.9], to, E.out(k0));
                  return <Bx key={k} s={[0.44, 0.44, 0.44]} rad={0.07} c={[C.amber, "#5BA7E8", "#9B7BE0"][k % 3]} p={[p[0], p[1] + Math.sin(k0 * Math.PI) * 0.5, p[2]]} />;
                })}
              </group>
            )}
            <Burst frame={f} t0={a} p={[0, 1.2, 0.4]} colors={[C.lime, "#FFFFFF"]} n={12} reach={1.3} size={0.08} dur={16} />
          </group>
        );
      })}
      {/* 손 놓은 선생님 */}
      <Person p={[-7.1, 0, 0.5]} yaw={0.8} outfit={OUTFIT.teacher} pose={{ armL: [2.85, -0.4], armR: [2.85, -0.4], eyes: "happy", mouth: "smile", lean: Math.sin(f * 0.08) * 0.06, blush: true }} />
    </group>
  );
};

const S15: SceneDef = {
  id: "s15",
  name: "자동 네 단계",
  start: b25.start,
  end: b25.end,
  bg: GREEN_BG,
  look: { ...DAY, reach: 12 },
  tallK: 1.45,
  cam: (f, tall) =>
    camLive(
      camPath(f, [
        [b25.start, { p: [ST[0] - 1.6, 3.5, 10.4], t: [ST[0] - 1.4, 1.0, 0], fov: 30 }],
        ...ST.map((x, i) => [act(i) + 4, { p: [x + 1.4, 3.5, 10.2], t: [x, 1.0, 0], fov: 30 }, E.io] as [number, { p: V3; t: V3; fov: number }, (t: number) => number]),
        [wideT + 2, { p: [ST[3] + 1.5, 3.5, 10.3], t: [ST[3], 1.0, 0], fov: 30 }, E.lin],
        [wideT + 20, tall ? { p: [0.5, 5.0, 15.0], t: [0, 1.2, 0], fov: 30 } : { p: [0.6, 5.6, 17.4], t: [-0.6, 0.9, 0], fov: 30 }, E.io],
        [b25.end, tall ? { p: [0.3, 4.9, 14.6], t: [0, 1.2, 0], fov: 30 } : { p: [0.2, 5.4, 16.9], t: [-0.6, 0.9, 0], fov: 30 }, E.lin],
      ]),
      f,
    ),
  World: S15World,
  Over: ({ f, w, h, u, tall }) => <Chip f={f} t0={wideT + 22} t1={b25.end - 3} x={w * 0.5} y={h * (tall ? 0.22 : 0.2)} text="버튼 이후로는 전부 시스템 몫" tone="lime" u={u} size={tall ? 40 : 46} />,
};

// ── S16 · 땅에서 솟은 나무 구조 ──────────────────────────────────────────────
const b26 = B.b26;
const b27 = B.b27;
const firmT = b27.ph[1].start;

const S16World: React.FC<{ f: number }> = ({ f }) => {
  const grow = tw(f, b26.start + 9, 24, E.out);
  const branch = tw(f, b26.ph[1].start - 2, 18, E.out);
  const sw = tw(f, b27.start, 8) * (1 - tw(f, b27.ph[2].start + 4, 14) * 0.75);
  const firm = tw(f, firmT, 16, E.out);
  const wave = Math.sin((f - b27.start) * 0.42);
  const tilt = wave * 0.085 * sw * (1 - firm * 0.86);
  return (
    <Tree f={f} grow={grow} branch={grow} leaves={branch} roots={tw(f, b26.start + 6, 18, E.out) + firm} thick={1 + firm * 0.3} tilt={tilt} signs={tw(f, b26.ph[1].start + 8, 22, E.lin)}>
      {/* 받침 위의 작은 교실 */}
      <Bx s={[1.5, 1.0, 0.1]} rad={0.04} c={C.boardFrame} p={[-0.85, 0.62, -0.85]} />
      <Bx s={[1.36, 0.86, 0.02]} rad={0.01} c={C.board} p={[-0.85, 0.62, -0.79]} cast={false} />
      <Person
        p={[0.45 + wave * 0.5 * sw, 0, 0.1]}
        outfit={OUTFIT.teacher}
        pose={{
          lean: -wave * 0.34 * sw,
          armL: [1.3 + sw * (1.2 + wave * 0.4), 0],
          armR: [1.3 + sw * (1.2 - wave * 0.4), 0],
          eyes: firm > 0.5 ? "happy" : sw > 0.3 ? "wide" : "dot",
          mouth: firm > 0.5 ? "smile" : sw > 0.3 ? "o" : "smile",
          bounce: Math.abs(Math.sin((f - b27.start) * 0.42)) * 0.12 * sw + Math.abs(ring(f, b26.start + 31, 0.2, 0.9, 0.2)),
          headRoll: wave * 0.18 * sw,
        }}
      />
      <Burst frame={f} t0={firmT + 8} p={[0, -1.2, 0.6]} colors={[C.lime, "#FFFFFF", C.leaf]} n={14} reach={1.8} size={0.09} dur={18} />
    </Tree>
  );
};

const S16: SceneDef = {
  id: "s16",
  name: "나무 구조 — 흔들릴수록 단단하게",
  start: b26.start,
  end: b27.end,
  bg: GREEN_BG,
  look: { ...DAY, reach: 9, keyPos: [5, 12, 7] },
  enter: "whip",
  tallK: 1.8,
  cam: (f) =>
    camLive(
      camPath(f, [
        [b26.start, { p: [1.2, 1.5, 10.5], t: [0, 1.1, 0], fov: 30 }],
        [b26.start + 8, { p: [1.3, 1.6, 10.8], t: [0, 1.15, 0], fov: 30 }, E.lin],
        [b26.start + 34, { p: [3.4, 3.0, 16.5], t: [0, 2.9, 0], fov: 30 }, E.io],
        [b27.start, { p: [2.4, 2.9, 16.0], t: [0, 3.0, 0], fov: 30 }, E.lin],
        [firmT + 14, { p: [-3.0, 1.9, 15.4], t: [0, 2.9, 0], fov: 30 }, E.io],
        [b27.end, { p: [-3.6, 1.7, 14.8], t: [0, 2.95, 0], fov: 30 }, E.lin],
      ]),
      f,
      { shakeAt: [b26.start + 10], shakeAmp: 0.14 },
    ),
  World: S16World,
  Over: ({ f, pr, u, tall }) => {
    const root = pr([-2.0, 0.3, 1.0]);
    const top = pr([1.9, treeTop(1) + 0.4, 1.2]);
    return (
      <>
        <Tag f={f} t0={b27.start + 10} t1={firmT + 2} at={top} dx={tall ? -30 : 170} dy={-120} text="흔들림 ↑" tone="paper" u={u} />
        <Tag f={f} t0={firmT + 10} t1={b27.end - 4} at={root} dx={tall ? -20 : -170} dy={tall ? 150 : -110} text="뿌리가 더 넓게, 더 굵게" tone="lime" u={u} />
      </>
    );
  },
};

void Soul;
export const ACT3: SceneDef[] = [S13, S14, S15, S16];

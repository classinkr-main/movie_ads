import React from "react";
import { B } from "../story/beats";
import { C } from "../lib/theme";
import { camLive, camPath, clamp, drop, E, lerp, lerp3, pop, ring, tw, V3 } from "../lib/motion";
import { Bx, Cy, kidOutfit, OUTFIT, Person, Pose, Sign, Soul, Sweat } from "../three/kit";
import { DAY } from "../three/Stage";
import { Chip, Slam, Tag } from "../overlay/kit";
import { BOARD, BoardCopy, Classroom, DESK_X, DESK_Z, TEACHER_DESK } from "./sets";
import type { SceneDef } from "./types";

/** 멘탈 붕괴 포즈: 머리를 세차게 흔들고 팔을 휘젓습니다. amt 0→1 */
export const panic = (f: number, seed: number, amt: number): Pose => ({
  armL: [0.15 + amt * (2.3 + Math.sin(f * 0.9 + seed) * 0.45), amt * 0.3],
  armR: [0.15 + amt * (2.3 + Math.cos(f * 0.8 + seed * 2) * 0.45), amt * 0.3],
  headYaw: Math.sin(f * 1.35 + seed) * 0.42 * amt,
  headRoll: Math.sin(f * 0.7 + seed * 3) * 0.14 * amt,
  lean: Math.sin(f * 0.6 + seed) * 0.07 * amt,
  bounce: Math.abs(Math.sin(f * 0.75 + seed)) * 0.07 * amt,
  eyes: amt > 0.5 ? "spiral" : "dot",
  spin: f * 0.5,
  mouth: amt > 0.5 ? "wavy" : "flat",
  brow: amt,
});

// ── S01 · 전시대 위의 '옛날 선생님들' ────────────────────────────────────────
const b01 = B.b01;
const snap = b01.ph[1].start;

const S01World: React.FC<{ f: number }> = ({ f }) => {
  const amt = tw(f, snap, 5, E.out);
  const xs = [-2.3, 0, 2.3];
  const fits = [OUTFIT.teacherB, OUTFIT.teacher, OUTFIT.teacherC];
  return (
    <group>
      {/* 박물관 전시대 */}
      <Bx s={[8.2, 0.5, 3.0]} rad={0.14} c="#E4DAC2" p={[0, -0.09, 0]} />
      <Bx s={[8.5, 0.14, 3.3]} rad={0.06} c="#B9AB8A" p={[0, -0.27, 0]} />
      <Sign text="옛날 선생님" w={2.5} h={0.42} size={0.25} color="#FFFFFF" bg={C.ink} radius={0.07} p={[0, -0.05, 1.515]} weight={900} />
      {xs.map((x, i) => {
        const inn = pop(f, -14 + i * 3, 14); // 첫 프레임(썸네일)부터 세 명이 서 있도록
        const pose = panic(f, i * 2.1, amt);
        const soulT = clamp((f - (snap + 5 + i * 3)) / 40);
        return (
          <group key={i} position={[x, 0.16, 0]}>
            <Cy rr={[0.62, 0.68]} h={0.14} c="#FFFDF6" p={[0, 0.07, 0]} seg={36} />
            <group scale={[inn, inn, inn]}>
              <Person p={[0, 0.14, 0]} outfit={fits[i]} pose={pose} yaw={i === 0 ? 0.25 : i === 2 ? -0.25 : 0} />
            </group>
            <Sweat frame={f} t0={snap + 3} p={[0, 1.55, 0.1]} n={5} />
            {soulT > 0 && <Soul frame={f + i * 9} p={[Math.sin(f * 0.13 + i) * 0.16, 1.9 + E.out(soulT) * 0.5 + Math.sin(f * 0.17 + i) * 0.05, 0.05]} sc={0.9 * E.back(clamp(soulT * 3))} />}
          </group>
        );
      })}
    </group>
  );
};

const S01: SceneDef = {
  id: "s01",
  name: "전시대 — 옛날 선생님들",
  start: 0,
  end: b01.end,
  bg: C.paper,
  look: DAY,
  exit: "whip",
  tallK: 2.3,
  cam: (f) =>
    camLive(
      camPath(f, [
        [0, { p: [0.6, 3.4, 13.5], t: [0, 0.95, 0], fov: 30 }],
        [snap - 2, { p: [0.3, 2.7, 11.2], t: [0, 1.0, 0], fov: 30 }, E.out],
        [snap + 5, { p: [0.9, 2.6, 9.4], t: [0, 2.05, 0], fov: 30, roll: -0.04 }, E.expo],
        [b01.end, { p: [1.3, 2.55, 8.8], t: [0, 2.1, 0], fov: 30, roll: -0.045 }, E.lin],
      ]),
      f,
      { shakeAt: [snap + 1], shakeAmp: 0.32 },
    ),
  World: S01World,
  Over: ({ f, w, h, u, tall }) => (
    <>
      <Slam f={f} t0={snap} t1={b01.end - 5} lines={tall ? ["완전히", "멘탈이", "나가 버렸습니다"] : ["완전히", "멘탈이 나가 버렸습니다"]} u={u} size={tall ? 128 : 112} tone="red" x={0.5} y={tall ? 0.29 : 0.17} w={w} h={h} rotate={-2.5} />
    </>
  ),
};

// ── S02 · 교실: 수업이 끝나도 끝나지 않는 일 ─────────────────────────────────
const b02 = B.b02;
const b03 = B.b03;
const bell = b02.ph[1].start + 6;
const pile0 = b02.ph[2].start + 2;
const PILE = ["#F4F1E6", "#F2C0B4", "#F4F1E6", "#F6D98A", "#F2C0B4"];

const S02World: React.FC<{ f: number }> = ({ f }) => {
  const talking = f < bell;
  // 수업이 끝나면 선생님이 교탁 쪽으로 걸어갑니다.
  const walk = tw(f, bell + 2, 22, E.io);
  const tp = lerp3([-2.2, 0, -1.9], [1.75, 0, -1.5], walk);
  const lands = PILE.map((_, i) => pile0 + i * 6);
  const flinch = lands.reduce((a, t0) => a + ring(f, t0, 0.07, 1.4, 0.3), 0);
  const worry = tw(f, pile0, 8);
  const pose: Pose = talking
    ? { armR: [2.0 + Math.sin(f * 0.35) * 0.12, 0.2], armL: [0.2, 0.3], mouth: Math.floor(f / 4) % 2 ? "open" : "flat", headYaw: -0.25 }
    : {
        armL: [0.2 + worry * 1.9, worry * 0.5],
        armR: [0.2 + worry * 1.9, worry * 0.5],
        bounce: Math.abs(Math.sin((f - bell) * 0.5)) * 0.05 * (1 - worry) * walk * (1 - walk) * 4 + Math.abs(flinch),
        headYaw: lerp(0.3, 0.25, walk),
        eyes: worry > 0.4 ? "wide" : "dot",
        mouth: worry > 0.4 ? "o" : "flat",
        brow: worry,
        squash: 1 - Math.abs(flinch) * 0.6,
      };
  // b03: 칠판 내용이 카드로 떠서 보관함으로 들어갑니다.
  const lift = tw(f, b03.start + 4, 14, E.out);
  const fly = tw(f, b03.start + 22, 20, E.io);
  const boxAt: V3 = [-0.9, 0, -1.25];
  const cardP = lerp3(lerp3([-0.5, BOARD.y, BOARD.z + 0.1], [-0.5, BOARD.y + 0.1, BOARD.z + 1.0], lift), [boxAt[0], 1.0 - fly * 0.4, boxAt[2]], fly);
  const cardS = lerp(1, 0.2, fly);
  const boxIn = pop(f, b03.start + 8, 12);
  const lid = tw(f, b03.start + 44, 8, E.out);
  const boxBounce = ring(f, b03.start + 42, 0.06, 1.2, 0.25);
  return (
    <Classroom hour={lerp(2.62, 3.0, tw(f, b02.ph[1].start - 6, 14, E.io))} clockJolt={ring(f, bell, 0.22, 1.9, 0.14)} boardGlow={f >= b03.start ? 0.25 * (1 - fly) : 0}>
      <Person p={tp} yaw={talking ? 0.35 : lerp(0.35, 0.85, walk)} outfit={OUTFIT.teacher} pose={pose} />
      {/* 학생들: 종이 울리면 폴짝 뛰어 사라집니다. */}
      {DESK_Z.map((z, zi) =>
        DESK_X.map((x, xi) => {
          const i = zi * 3 + xi;
          const leave = bell + 3 + i * 2;
          const k = clamp((f - leave) / 12);
          if (k >= 1) return null;
          return (
            <Person
              key={i}
              p={[x, 0.02 + Math.sin(k * Math.PI) * 0.5, z + 0.45]}
              yaw={Math.PI}
              sc={0.82 * (1 - E.in(k))}
              outfit={kidOutfit(i)}
              pose={{ sit: true, bounce: Math.max(0, Math.sin(f * 0.22 + i * 1.7)) * 0.03, armR: i === 4 && talking ? [2.9, 0] : [0.15, 0], headYaw: Math.sin(f * 0.05 + i) * 0.2 }}
            />
          );
        }),
      )}
      {/* 교탁 위로 떨어지는 일 더미 */}
      {PILE.map((c, i) => {
        const d = drop(f, lands[i], 5.5, 8);
        if (!d.vis) return null;
        const wob = ring(f, lands[PILE.length - 1], 0.05, 0.5, 0.05) * (i / PILE.length);
        return (
          <group key={i} position={[TEACHER_DESK[0] + ((i * 37) % 7) * 0.02 - 0.06 + wob * i, 0.85 + i * 0.2 + d.y, TEACHER_DESK[2] + ((i * 13) % 5) * 0.02]} rotation={[0, (i % 2 ? 0.12 : -0.1) + i * 0.05, wob]} scale={[d.sxz, d.sy, d.sxz]}>
            <Bx s={[0.82, 0.19, 0.56]} rad={0.04} c={c} p={[0, 0.095, 0]} />
            <Bx s={[0.2, 0.2, 0.03]} rad={0.01} c={i % 2 ? C.red : C.amber} p={[0.2, 0.095, 0.285]} cast={false} />
          </group>
        );
      })}
      {/* 보존 카드와 보관함 */}
      {f >= b03.start + 4 && fly < 1 && <BoardCopy p={cardP} sc={cardS} r={[-fly * 1.2, 0, fly * 0.2]} glow={0.5} />}
      <group position={[boxAt[0], boxBounce, boxAt[2]]} scale={[boxIn, boxIn, boxIn]} visible={f >= b03.start + 8}>
        <Bx s={[1.25, 0.72, 0.92]} rad={0.05} c={C.cardboard} p={[0, 0.36, 0]} />
        <Bx s={[1.12, 0.05, 0.8]} rad={0.01} c="#8A6436" p={[0, 0.7, 0]} cast={false} />
        <Sign text="보존" w={0.8} h={0.36} size={0.24} color={C.ink} bg="#FFFDF4" radius={0.05} p={[0, 0.36, 0.466]} weight={900} />
        <group position={[-0.625, 0.72, 0]} rotation={[0, 0, lerp(2.2, 0, lid)]}>
          <Bx s={[0.63, 0.05, 0.92]} rad={0.02} c="#B88750" p={[0.315, 0, 0]} />
        </group>
        <group position={[0.625, 0.72, 0]} rotation={[0, 0, lerp(-2.2, 0, lid)]}>
          <Bx s={[0.63, 0.05, 0.92]} rad={0.02} c="#B88750" p={[-0.315, 0, 0]} />
        </group>
      </group>
    </Classroom>
  );
};

const S02: SceneDef = {
  id: "s02",
  name: "교실 — 끝나지 않는 일",
  start: b02.start,
  end: b03.end,
  bg: C.paper,
  look: DAY,
  enter: "whip",
  cam: (f) =>
    camLive(
      camPath(f, [
        [b02.start, { p: [8.6, 7.0, 10.6], t: [0.2, 1.0, -0.5], fov: 30 }],
        [b02.ph[2].start - 4, { p: [8.0, 6.3, 9.8], t: [0.4, 1.0, -0.6], fov: 30 }, E.lin],
        [b02.ph[2].start + 12, { p: [7.4, 4.3, 5.6], t: [2.3, 1.15, -1.5], fov: 30 }, E.io],
        [b03.start - 2, { p: [7.2, 4.1, 5.3], t: [2.3, 1.2, -1.5], fov: 30 }, E.lin],
        [b03.start + 16, { p: [3.6, 4.6, 7.4], t: [-0.6, 1.3, -1.9], fov: 30 }, E.io],
        [b03.end, { p: [3.2, 4.3, 6.8], t: [-0.6, 1.15, -1.7], fov: 30 }, E.lin],
      ]),
      f,
      { shakeAt: PILE.map((_, i) => pile0 + i * 6), shakeAmp: 0.09 },
    ),
  World: S02World,
  Over: ({ f, pr, u }) => {
    const clock = pr([3.55, 2.72, -3.1]);
    const pile = pr([TEACHER_DESK[0], 1.95, TEACHER_DESK[2]]);
    const box = pr([-0.9, 0.78, -0.8]);
    return (
      <>
        <Chip f={f} t0={bell} t1={b02.ph[2].start + 2} x={clock.x - 150 * u} y={clock.y + 10 * u} text="딩동댕 ♪ 수업 끝" tone="amber" u={u} size={32} />
        <Tag f={f} t0={pile0 + 20} t1={b02.end - 4} at={pile} dx={150} dy={-150} text="수업 후 작업" sub="끝이 없음" tone="red" u={u} />
        <Tag f={f} t0={b03.start + 30} t1={b03.end - 4} at={box} dx={210} dy={-110} text="수업 내용 → 보존" sub="남겨야 다시 볼 수 있으니까" tone="paper" u={u} />
      </>
    );
  },
};

export const ACT1A: SceneDef[] = [S01, S02];

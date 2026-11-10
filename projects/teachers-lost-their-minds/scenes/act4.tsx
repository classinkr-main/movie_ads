import React from "react";
import { B, TOTAL_FRAMES } from "../story/beats";
import { C } from "../lib/theme";
import { camLive, camPath, clamp, drop, E, lerp, lerp3, pop, ring, tw, V3 } from "../lib/motion";
import { Burst, Bx, ChoreBlock, Cy, Folder, kidOutfit, Laptop, Magnifier, Mug, OUTFIT, Person, Phone, Pose, Sign, Soul, Torus, Tripod } from "../three/kit";
import { DAY, Look } from "../three/Stage";
import { Chip, Slam, Stamp, Tag } from "../overlay/kit";
import { LogoCard } from "./act3";
import { CHORES, Classroom, DESK_X, DESK_Z, TEACHER_DESK, Tree, treeTop } from "./sets";
import type { SceneDef } from "./types";

const GREEN_BG = "#E7F0E4";

// ── S17 · '수업 후 작업'이 사라지다 ──────────────────────────────────────────
const b28 = B.b28;
const STACK_X = -4.2;
const TREE_X = 2.2;
const poof = (i: number) => b28.ph[2].start + 4 + (3 - i) * 4; // 위에서부터

const S17World: React.FC<{ f: number }> = ({ f }) => {
  const tremble = tw(f, b28.ph[1].start, 10) * (f < poof(3) ? 1 : 0.4);
  const cheer = f >= poof(0) ? tw(f, poof(0), 8, E.back) : 0;
  return (
    <group>
      <group position={[TREE_X, 0, 0]}>
        <Tree f={f} grow={1} branch={1} roots={2} thick={1.3} signs={1}>
          <Bx s={[1.5, 1.0, 0.1]} rad={0.04} c={C.boardFrame} p={[-0.85, 0.62, -0.85]} />
          <Bx s={[1.36, 0.86, 0.02]} rad={0.01} c={C.board} p={[-0.85, 0.62, -0.79]} cast={false} />
          <Person
            p={[0.45, 0, 0.1]}
            yaw={-0.5}
            outfit={OUTFIT.teacher}
            pose={{ armL: [0.2 + cheer * 2.6, 0], armR: [2.6, Math.sin(f * 0.4) * 0.3], eyes: "happy", mouth: "smile", bounce: Math.abs(ring(f, poof(0), 0.3, 0.8, 0.14)), blush: true, headYaw: -0.3 }}
          />
        </Tree>
      </group>
      {/* 땅에 남아 있던 수업 후 작업 네 덩어리 */}
      <Cy rr={[1.5, 1.62]} h={0.2} c="#FFFDF6" p={[STACK_X, -0.04, 0]} seg={48} />
      {CHORES.map((c, i) => {
        if (f >= poof(i)) return null;
        const j = Math.sin(f * 1.7 + i * 2) * 0.03 * tremble;
        return <ChoreBlock key={i} label={c.label} c={c.c} p={[STACK_X + j, 0.06 + i * 0.62, 0]} r={[0, i % 2 ? -0.12 : 0.1, j * 1.5]} />;
      })}
      {CHORES.map((c, i) => (
        <Burst key={i} frame={f} t0={poof(i)} p={[STACK_X, 0.4 + i * 0.62, 0.2]} colors={[c.c, "#FFFFFF", C.lime]} n={16} reach={2.1} size={0.14} dur={24} />
      ))}
      <Burst frame={f} t0={poof(0) + 3} p={[STACK_X, 1.4, 0.4]} colors={[C.lime, C.leaf, "#FFFFFF", C.amber]} n={26} reach={3.4} size={0.11} dur={32} />
    </group>
  );
};

const S17: SceneDef = {
  id: "s17",
  name: "수업 후 작업 — 소멸",
  start: b28.start,
  end: b28.end,
  bg: GREEN_BG,
  look: { ...DAY, reach: 12, keyPos: [5, 12, 7] },
  tallK: 1.45,
  cam: (f, tall) =>
    camLive(
      camPath(f, [
        [b28.start, { p: [1.0, 3.0, 16.8], t: [1.4, 3.5, 0], fov: 30 }],
        [b28.ph[1].start + 6, { p: [-1.6, 3.0, 16.4], t: [tall ? STACK_X + 0.6 : -1.6, 2.65, 0], fov: 30 }, E.io],
        [b28.ph[2].start + 2, { p: [-1.8, 3.0, 16.0], t: [tall ? STACK_X + 0.6 : -1.6, 2.65, 0], fov: 30 }, E.lin],
        [b28.end, { p: [-0.8, 3.1, 17.0], t: [tall ? -0.6 : -0.9, 2.9, 0], fov: 30 }, E.io],
      ]),
      f,
      { shakeAt: CHORES.map((_, i) => poof(i)), shakeAmp: 0.1 },
    ),
  World: S17World,
};

// ── S18 · '옛날 방식' 전시대: 장비·밤샘·링크·명단 ────────────────────────────
const RETIRED = [B.b29, B.b30, B.b31, B.b32];
const EX = [-5.7, -1.9, 1.9, 5.7];
const PLAQUE = ["촬영 장비", "밤샘 편집", "링크 찾기", "시청 명단 체크"];
const domeT = (i: number) => RETIRED[i].ph[1].start + 2;
const s18Start = B.b29.start;
const s18End = B.b32.end;

const S18World: React.FC<{ f: number }> = ({ f }) => {
  const walkX = lerp(-8.2, 8.4, clamp((f - s18Start) / (s18End - s18Start)));
  return (
    <group>
      <Bx s={[16.6, 0.5, 3.2]} rad={0.14} c="#E4DAC2" p={[0, -0.09, 0]} />
      <Bx s={[16.9, 0.14, 3.5]} rad={0.06} c="#B9AB8A" p={[0, -0.27, 0]} />
      {EX.map((x, i) => {
        const d = drop(f, domeT(i), 5.5, 8);
        return (
          <group key={i} position={[x, 0.16, 0]}>
            <Cy rr={[1.12, 1.2]} h={0.14} c="#FFFDF6" p={[0, 0.07, 0]} seg={40} />
            <group position={[0, 0.36, 1.36]} rotation={[-0.5, 0, 0]}>
              <Bx s={[2.3, 0.5, 0.07]} rad={0.07} c={C.ink} />
              <Sign text={PLAQUE[i]} w={2.2} h={0.44} size={0.25} color="#FFFFFF" p={[0, 0, 0.04]} weight={900} />
            </group>
            <group position={[0, 0.14, 0]}>
              {i === 0 && (
                <Tripod rise={0.5} yaw={0.4} p={[0, 0, 0]}>
                  <Phone glow={0.1} />
                </Tripod>
              )}
              {i === 1 && (
                <>
                  <Laptop p={[-0.1, 0, 0]} yaw={0.3} open={0.75} glow={0.15} />
                  <Mug p={[0.62, 0, 0.3]} />
                  <Mug p={[0.78, 0, 0.02]} />
                  <Mug p={[0.52, 0, -0.28]} />
                </>
              )}
              {i === 2 && (
                <>
                  <Folder p={[-0.25, 0, -0.1]} sc={1.25} r={[0, 0.3, 0]} />
                  <Torus rr={0.24} tube={0.065} c={C.cobalt} p={[0.5, 0.3, 0.3]} r={[0.3, 0.5, 0]} />
                  <Torus rr={0.24} tube={0.065} c={C.cobalt} p={[0.78, 0.36, 0.3]} r={[1.3, 0.3, 0.4]} />
                </>
              )}
              {i === 3 && (
                <>
                  <group position={[-0.2, 0.6, 0]} rotation={[-0.2, 0.3, 0]}>
                    <Bx s={[0.8, 1.1, 0.06]} rad={0.03} c="#FFFDF4" />
                    <Bx s={[0.3, 0.12, 0.09]} rad={0.03} c={C.metalDark} p={[0, 0.52, 0.02]} />
                    {[0.28, 0.08, -0.12, -0.32].map((y) => (
                      <Bx key={y} s={[0.52, 0.045, 0.01]} rad={0.01} c="#B9B4A6" p={[0.04, y, 0.034]} cast={false} />
                    ))}
                  </group>
                  <Magnifier p={[0.55, 0.6, 0.4]} sc={0.8} r={[0, -0.3, 0.2]} />
                </>
              )}
            </group>
            {/* 유리 덮개 */}
            {d.vis && (
              <group position={[0, 0.14 + d.y, 0]} scale={[d.sxz, d.sy, d.sxz]}>
                <Bx s={[2.0, 2.2, 1.7]} rad={0.14} c="#CFE8FF" gloss op={0.2} p={[0, 1.1, 0]} cast={false} />
                <Bx s={[2.06, 0.08, 1.76]} rad={0.03} c={C.forest} p={[0, 0.04, 0]} cast={false} />
                <Cy rr={0.1} h={0.14} c={C.forest} p={[0, 2.26, 0]} cast={false} />
              </group>
            )}
            <Burst frame={f} t0={domeT(i)} p={[0, 0.4, 0.9]} colors={["#FFFFFF", C.lime]} n={10} reach={1.4} size={0.07} dur={16} up={0.5} />
          </group>
        );
      })}
      {/* 전시대 뒤를 산책하듯 지나가는 선생님 */}
      <Person
        p={[walkX, 0, -2.3]}
        yaw={0.9}
        outfit={OUTFIT.teacher}
        sc={1.15}
        pose={{ bounce: Math.abs(Math.sin(f * 0.34)) * 0.07, armL: [0.2, Math.sin(f * 0.34) * 0.5], armR: [0.2, -Math.sin(f * 0.34) * 0.5], eyes: "happy", mouth: Math.floor(f / 9) % 2 ? "o" : "smile", headYaw: -0.3, blush: true }}
      />
    </group>
  );
};

const S18: SceneDef = {
  id: "s18",
  name: "옛날 방식 전시대",
  start: s18Start,
  end: s18End,
  bg: C.paper,
  look: { ...DAY, reach: 12 },
  enter: "whip",
  exit: "whip",
  tallK: 1.3,
  cam: (f) =>
    camLive(
      camPath(f, [
        [s18Start, { p: [EX[0] - 0.6, 2.9, 10.0], t: [EX[0] - 0.6, 0.9, 0], fov: 30 }],
        ...EX.flatMap((x, i) => {
          const b = RETIRED[i];
          const arrive: [number, { p: V3; t: V3; fov: number }, (t: number) => number] = [b.start + 12, { p: [x + 1.3, 2.8, 9.2], t: [x + 0.2, 0.9, 0], fov: 30 }, E.io];
          const hold: [number, { p: V3; t: V3; fov: number }, (t: number) => number] = [b.end - 2, { p: [x + 1.7, 2.7, 8.8], t: [x + 0.3, 0.9, 0], fov: 30 }, E.lin];
          return [arrive, hold];
        }),
      ]),
      f,
      { shakeAt: EX.map((_, i) => domeT(i)), shakeAmp: 0.1 },
    ),
  World: S18World,
  Over: ({ f, pr, u, tall }) => (
    <>
      {EX.map((x, i) => {
        const p = pr([x - 0.85, 2.35, 0.86]);
        return <Stamp key={i} f={f} t0={domeT(i) + 5} t1={RETIRED[i].end - 3} text="은퇴" x={Math.max(150 * u, p.x)} y={p.y} u={u} size={tall ? 84 : 88} color={C.forest} rotate={i % 2 ? 9 : -11} />;
      })}
    </>
  ),
};

// ── S19 · 맘 편한 수업, 그리고 진짜로 끝 ─────────────────────────────────────
const b33 = B.b33;
const b34 = B.b34;
const soulIn = b33.start + 6;
const absorbed = b33.ph[1].start + 2;
const bell2 = b34.ph[1].start + 5;
const lookAtDesk = b34.ph[2].start + 4;
const leaveT = b34.ph[2].start + Math.round((b34.end - b34.ph[2].start) * 0.55);
const leafLand = b34.ph[2].start + 16;

const SUNSET: Look = { ambient: 1.12, ambientColor: "#FFE9D2", key: 2.7, keyColor: "#FFBE7A", keyPos: [8, 6, 5], fill: 0.5, fillColor: "#FFD9C2", shadow: 0.24, shadowColor: "#5A3418" };
const mixLook = (a: Look, b: Look, t: number): Look => ({
  ...a,
  ambient: lerp(a.ambient, b.ambient, t),
  key: lerp(a.key, b.key, t),
  keyColor: t > 0.5 ? b.keyColor : a.keyColor,
  ambientColor: t > 0.5 ? b.ambientColor : a.ambientColor,
  keyPos: lerp3(a.keyPos ?? [5, 10, 6], b.keyPos ?? [5, 10, 6], t),
  fill: lerp(a.fill ?? 0.6, b.fill ?? 0.6, t),
  shadow: lerp(a.shadow ?? 0.2, b.shadow ?? 0.2, t),
});

const S19World: React.FC<{ f: number }> = ({ f }) => {
  const sk = clamp((f - soulIn) / Math.max(1, absorbed - soulIn));
  const happy = f >= absorbed;
  const over = f >= bell2;
  const walk = tw(f, bell2 + 6, 20, E.io);
  const leave = tw(f, leaveT, 26, E.in);
  const tp = lerp3(lerp3([-2.2, 0, -1.9], [1.7, 0, -1.45], walk), [7.4, 0, -0.6], leave);
  const lookDown = f >= lookAtDesk && f < leaveT ? tw(f, lookAtDesk, 6) : 0;
  const pose: Pose = !over
    ? {
        armR: [2.0 + Math.sin(f * 0.3) * 0.15, 0.2],
        armL: happy ? [1.4 + Math.sin(f * 0.3 + 1) * 0.3, 0.3] : [0.2, 0.3],
        mouth: Math.floor(f / 4) % 2 ? "open" : "smile",
        eyes: happy ? "happy" : "dot",
        headYaw: -0.2,
        blush: happy,
        bounce: Math.abs(ring(f, absorbed, 0.18, 0.9, 0.2)) + (happy ? Math.max(0, Math.sin(f * 0.25)) * 0.03 : 0),
      }
    : f < leaveT
      ? { headYaw: lerp(0.3, 0.7, lookDown), headPitch: lookDown * 0.3, eyes: lookDown > 0.5 && f < lookAtDesk + 16 ? "wide" : "happy", mouth: lookDown > 0.5 && f < lookAtDesk + 16 ? "o" : "smile", armL: [0.2, 0], armR: [0.2, 0], bounce: Math.abs(Math.sin(f * 0.4)) * 0.05 * walk * (1 - walk) * 4, blush: true }
      : { eyes: "happy", mouth: "smile", armR: [2.7, Math.sin(f * 0.6) * 0.35], armL: [0.2, Math.sin(f * 0.4) * 0.4], bounce: Math.abs(Math.sin(f * 0.4)) * 0.07, blush: true, headYaw: -0.4 };
  const leafK = clamp((f - (leafLand - 26)) / 26);
  return (
    <Classroom hour={over ? 4.0 : lerp(3.6, 4.0, tw(f, b34.ph[1].start - 6, 12, E.io))} clockJolt={ring(f, bell2, 0.22, 1.9, 0.14)}>
      <Sign text="● 자동 녹화 중" w={2.3} h={0.42} size={0.23} color={C.forest} bg={C.lime} radius={0.1} p={[2.0, 3.2, -3.2]} weight={900} />
      <Person p={tp} yaw={over ? lerp(0.35, 0.9, walk) + leave * 0.7 : 0.35} outfit={OUTFIT.teacher} pose={pose} />
      {/* 돌아오는 영혼 */}
      {f >= soulIn && sk < 1 && <Soul frame={f} face="smile" p={[-2.2 + Math.sin(f * 0.2) * 0.25 * (1 - sk), lerp(4.0, 1.75, E.io(sk)), -1.75]} sc={lerp(1.35, 0.5, E.in(sk))} />}
      <Burst frame={f} t0={absorbed} p={[-2.2, 1.6, -1.7]} colors={[C.lime, "#FFFFFF", C.amber]} n={18} reach={1.7} size={0.09} dur={22} />
      {DESK_Z.map((z, zi) =>
        DESK_X.map((x, xi) => {
          const i = zi * 3 + xi;
          const leaveK = clamp((f - (bell2 + 3 + i * 2)) / 12);
          if (leaveK >= 1) return null;
          const hand = i % 2 === 0;
          return (
            <Person
              key={i}
              p={[x, 0.02 + Math.sin(leaveK * Math.PI) * 0.5, z + 0.45]}
              yaw={Math.PI}
              sc={0.82 * (1 - E.in(leaveK))}
              outfit={kidOutfit(i)}
              pose={{ sit: true, bounce: Math.max(0, Math.sin(f * 0.3 + i * 1.3)) * 0.07, armR: hand ? [2.85, 0] : [0.15, 0], armL: !hand && happy ? [2.85, 0] : [0.15, 0], headYaw: Math.sin(f * 0.07 + i) * 0.2 }}
            />
          );
        }),
      )}
      {/* 교탁 위로 내려앉는 잎 하나 — 일 더미 대신 */}
      {leafK > 0 && (
        <Bx
          s={[0.34, 0.07, 0.24]}
          rad={0.03}
          c={C.leaf}
          p={[TEACHER_DESK[0] + Math.sin(leafK * 7) * 0.5 * (1 - leafK), 0.88 + (1 - E.out(leafK)) * 3.2, TEACHER_DESK[2] + 0.05]}
          r={[Math.sin(leafK * 9) * 0.5 * (1 - leafK), leafK * 3, Math.sin(leafK * 7) * 0.6 * (1 - leafK)]}
        />
      )}
    </Classroom>
  );
};

const S19: SceneDef = {
  id: "s19",
  name: "교실 — 맘 편한 수업, 진짜 끝",
  start: b33.start,
  end: b34.end,
  bg: (f) => (f >= b34.ph[2].start + 8 ? "#F5E4CC" : C.paper),
  look: (f) => mixLook(DAY, SUNSET, tw(f, b34.ph[2].start, 22, E.io)),
  cam: (f) =>
    camLive(
      camPath(f, [
        [b33.start, { p: [8.8, 6.8, 11.0], t: [0, 1.4, -0.7], fov: 30 }],
        [b34.start, { p: [7.4, 5.6, 9.4], t: [-0.2, 1.3, -0.8], fov: 30 }, E.out],
        [b34.ph[1].start, { p: [7.0, 5.3, 9.0], t: [-0.2, 1.3, -0.8], fov: 30 }, E.lin],
        [b34.ph[2].start + 14, { p: [7.2, 4.2, 5.4], t: [2.5, 1.1, -1.5], fov: 30 }, E.io],
        [b34.end, { p: [7.6, 4.3, 5.9], t: [2.9, 1.1, -1.4], fov: 30 }, E.lin],
      ]),
      f,
    ),
  World: S19World,
  Over: ({ f, pr, u, tall }) => {
    const clock = pr([3.55, 2.72, -3.1]);
    const desk = pr([TEACHER_DESK[0], 0.95, TEACHER_DESK[2] + 0.2]);
    return (
      <>
        <Chip f={f} t0={bell2} t1={b34.ph[2].start + 6} x={clock.x - 150 * u} y={clock.y + 10 * u} text="딩동댕 ♪ 수업 끝" tone="amber" u={u} size={32} />
        <Tag f={f} t0={leafLand + 2} t1={b34.end - 3} at={desk} dx={tall ? -60 : -230} dy={tall ? -220 : -130} text="교탁 위에 남은 일: 없음" tone="lime" u={u} size={38} />
      </>
    );
  },
};

// ── S21 · 엔드카드: 요즘 선생님 ──────────────────────────────────────────────
const b35 = B.b35;

const S21World: React.FC<{ f: number }> = ({ f }) => {
  const xs = [-2.3, 0, 2.3];
  const fits = [OUTFIT.teacherB, OUTFIT.teacher, OUTFIT.teacherC];
  return (
    <group>
      <Bx s={[8.2, 0.5, 3.0]} rad={0.14} c="#E4DAC2" p={[0, -0.09, 0]} />
      <Bx s={[8.5, 0.14, 3.3]} rad={0.06} c="#B9AB8A" p={[0, -0.27, 0]} />
      <Sign text="요즘 선생님" w={2.5} h={0.42} size={0.25} color="#FFFFFF" bg={C.forest} radius={0.07} p={[0, -0.05, 1.515]} weight={900} />
      {xs.map((x, i) => {
        const inn = pop(f, b35.start + 1 + i * 3, 12);
        const wave = Math.sin(f * 0.42 + i * 1.5);
        return (
          <group key={i} position={[x, 0.16, 0]}>
            <Cy rr={[0.62, 0.68]} h={0.14} c="#FFFDF6" p={[0, 0.07, 0]} seg={36} />
            <group scale={[inn, inn, inn]}>
              <Person
                p={[0, 0.14, 0]}
                outfit={fits[i]}
                yaw={i === 0 ? 0.2 : i === 2 ? -0.2 : 0}
                pose={{ armR: [2.65, wave * 0.3], armL: i === 1 ? [2.65, -wave * 0.3] : [0.2, 0], eyes: "happy", mouth: "smile", blush: true, bounce: Math.abs(Math.sin(f * 0.21 + i)) * 0.05, headRoll: wave * 0.05 }}
              />
            </group>
            <Soul frame={f + i * 11} face="smile" p={[0.52, 1.62 + Math.sin(f * 0.11 + i) * 0.05, 0.1]} sc={0.62 * inn} />
          </group>
        );
      })}
      <Burst frame={f} t0={b35.start + 3} p={[0, 2.0, 0.6]} colors={[C.lime, C.leaf, "#FFFFFF", C.amber]} n={30} reach={4.2} size={0.11} dur={36} />
    </group>
  );
};

const S21: SceneDef = {
  id: "s21",
  name: "엔드카드 — 요즘 선생님",
  start: b35.start,
  end: TOTAL_FRAMES + 2,
  bg: C.paper,
  look: DAY,
  enter: "whip",
  tallK: 1.5,
  cam: (f) =>
    camLive(
      camPath(f, [
        [b35.start, { p: [0.4, 2.9, 14.0], t: [0, 2.35, 0], fov: 30 }],
        [TOTAL_FRAMES, { p: [-0.3, 2.8, 13.2], t: [0, 2.3, 0], fov: 30 }, E.out],
      ]),
      f,
      { drift: 0.03 },
    ),
  World: S21World,
  Over: ({ f, u, w, h, tall }) => (
    <>
      <Slam f={f} t0={b35.start + 2} t1={1e9} lines={tall ? ["클래스인", "하나로요!"] : ["클래스인 하나로요!"]} u={u} size={tall ? 150 : 128} tone="lime" x={0.5} y={tall ? 0.18 : 0.15} w={w} h={h} rotate={-2} />
      <LogoCard f={f} t0={b35.speechEnd + 2} x={w * 0.5} y={h * (tall ? 0.36 : 0.37)} u={u} h={tall ? 100 : 96} />
      <Chip f={f} t0={b35.speechEnd + 12} x={w * 0.5} y={h * (tall ? 0.445 : 0.5)} text="classin.co.kr" tone="ink" u={u} size={tall ? 38 : 36} />
    </>
  ),
};

void treeTop;
void Tag;
export const ACT4: SceneDef[] = [S17, S18, S19, S21];

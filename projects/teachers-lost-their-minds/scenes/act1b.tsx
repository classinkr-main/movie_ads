import React from "react";
import { B } from "../story/beats";
import { C } from "../lib/theme";
import { camLive, camPath, clamp, drop, E, lerp, lerp3, pop, ring, tw, V3 } from "../lib/motion";
import { Arrow, Battery, Bubble, Burst, Bx, ChoreBlock, Cloud, Clock, Cy, Desk, Disc, FileCube, Folder, kidOutfit, Laptop, Magnifier, Mug, OUTFIT, Paint, Person, Phone, Pose, roundRect, Sign, Slab, Soul, Sp, Sweat, Tripod } from "../three/kit";
import { DAY, NIGHT } from "../three/Stage";
import { Chip, Slam, Tag } from "../overlay/kit";
import { CHORES, Classroom } from "./sets";
import type { SceneDef } from "./types";

// ── S03 · 직접 촬영: 세우고, 각도 맞추고, 저장 공간 확인 ────────────────────
const b04 = B.b04;
const b05 = B.b05;
const b06 = B.b06;
const TRI: V3 = [0.1, 0, -0.55];
const plant = b04.ph[1].start + 2;
const cubeLand = b06.start + 9;

const drawRecScreen = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  ctx.fillStyle = "#2E6B55";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(W * 0.14, H * 0.3, W * 0.5, H * 0.03);
  ctx.fillRect(W * 0.14, H * 0.38, W * 0.36, H * 0.02);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = W * 0.03;
  const c = W * 0.14;
  [
    [0.08, 0.06, 1, 1],
    [0.92, 0.06, -1, 1],
    [0.08, 0.94, 1, -1],
    [0.92, 0.94, -1, -1],
  ].forEach(([x, y, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(W * x + c * sx, H * y);
    ctx.lineTo(W * x, H * y);
    ctx.lineTo(W * x, H * y + c * sy);
    ctx.stroke();
  });
  ctx.fillStyle = "#FF3B1F";
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.86, W * 0.1, 0, Math.PI * 2);
  ctx.fill();
};

const drawStorageScreen = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  ctx.fillStyle = "#FFF4F1";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#F0553A";
  ctx.font = `900 ${W * 0.2}px "Pretendard"`;
  ctx.textAlign = "center";
  ctx.fillText("저장 공간", W / 2, H * 0.2);
  ctx.fillText("부족", W / 2, H * 0.36);
  ctx.fillStyle = "#E7DFCC";
  roundRect(ctx, W * 0.12, H * 0.5, W * 0.76, H * 0.1, W * 0.04);
  ctx.fill();
  ctx.fillStyle = "#F0553A";
  roundRect(ctx, W * 0.12, H * 0.5, W * 0.73, H * 0.1, W * 0.04);
  ctx.fill();
  ctx.fillStyle = "#1B1A17";
  ctx.font = `900 ${W * 0.3}px "Pretendard"`;
  ctx.fillText("97%", W / 2, H * 0.84);
};

const S03World: React.FC<{ f: number }> = ({ f }) => {
  const walk = tw(f, b04.start, plant - b04.start, E.out);
  const tp = lerp3([-5.6, 0, -0.2], [-1.15, 0, -0.35], walk);
  const planted = tw(f, plant, 8, E.back);
  const rise = tw(f, b05.ph[0].start + 2, 14, E.back);
  const tiltK = clamp((f - b05.ph[1].start) / Math.max(1, b05.ph[2].start - b05.ph[1].start));
  const tilt = f < b05.ph[1].start ? 0 : Math.sin(tiltK * Math.PI * 3.2) * 0.42 * (1 - tiltK * 0.75) - 0.1 * tiltK;
  const storage = f >= b05.ph[2].start + 3;
  const blinkOn = storage && Math.floor((f - b05.ph[2].start) / 5) % 2 === 0;
  const phoneIn = pop(f, plant + 7, 11);
  // b06: 촬영이 끝나자 통째로 떨어지는 원본 파일
  const d = drop(f, cubeLand, 6, 8);
  const scare = tw(f, cubeLand, 5);
  const step = tw(f, cubeLand, 8, E.out);
  const stepBack = b05.ph[1].start;
  const back = tw(f, stepBack, 10, E.io) * 0.35;
  const pose: Pose =
    f < plant
      ? { armL: [0.9, 1.1], armR: [0.3, 0.2], bounce: Math.abs(Math.sin(f * 0.55)) * 0.06, lean: -0.05 }
      : f < cubeLand
        ? {
            armL: [0.5, 1.25 + Math.sin(f * 0.5) * 0.12],
            armR: [0.5, 1.25 + Math.cos(f * 0.5) * 0.12],
            headPitch: f >= b05.ph[1].start && !storage ? 0.12 : -0.05,
            headRoll: f >= b05.ph[1].start && !storage ? Math.sin(f * 0.25) * 0.14 : 0,
            eyes: storage ? "wide" : "dot",
            mouth: storage ? "o" : "flat",
            brow: storage ? 1 : 0.3,
          }
        : { armL: [2.4, 0.2], armR: [2.4, 0.2], eyes: "wide", mouth: "open", brow: 1, bounce: Math.abs(ring(f, cubeLand, 0.3, 0.8, 0.2)), lean: 0.12 * scare };
  return (
    <Classroom hour={3.2}>
      <Person p={[tp[0] - back - step * 0.7, 0, tp[2] + step * 0.35]} yaw={1.2 - step * 0.35} outfit={OUTFIT.teacher} pose={pose} />
      <Sweat frame={f} t0={b05.ph[2].start + 4} until={cubeLand - 1} p={[tp[0] - back, 1.5, tp[2]]} n={4} />
      <group position={f < plant ? [tp[0] + 0.75, 0.25, tp[2]] : TRI} rotation={f < plant ? [0, 0, -0.5] : [0, 0, 0]}>
        <Tripod rise={rise} fold={1 - planted} yaw={0.4}>
          <group scale={[phoneIn, phoneIn, phoneIn]} rotation={[tilt, 0, 0]}>
            <Phone glow={storage ? (blinkOn ? 1.6 : 0.5) : 0.7} screen={storage ? <Paint id="scr-storage" w={0.3} h={0.62} draw={drawStorageScreen} /> : <Paint id="scr-rec" w={0.3} h={0.62} draw={drawRecScreen} />} />
          </group>
        </Tripod>
      </group>
      {d.vis && (
        <group position={[1.85, d.y, 0.45]} scale={[d.sxz, d.sy, d.sxz]}>
          <FileCube size={1.45} c={C.red} label="원본.mp4" sub="1시간 12분" r={[0, 0.35, 0]} />
        </group>
      )}
      <Burst frame={f} t0={cubeLand} p={[1.85, 0.1, 0.45]} colors={["#F4F1E6", "#F2C0B4", C.amber]} n={12} reach={1.5} size={0.12} />
    </Classroom>
  );
};

const S03: SceneDef = {
  id: "s03",
  name: "교실 — 직접 촬영",
  start: b04.start,
  end: b06.end,
  bg: C.paper,
  look: DAY,
  exit: "whip",
  cam: (f) =>
    camLive(
      camPath(f, [
        [b04.start, { p: [6.4, 4.5, 8.6], t: [-0.8, 1.1, -0.5], fov: 30 }],
        [plant + 6, { p: [5.6, 4.0, 7.6], t: [-0.4, 1.1, -0.5], fov: 30 }, E.out],
        [b05.start + 12, { p: [4.0, 3.1, 5.6], t: [-0.3, 1.4, -0.5], fov: 30 }, E.io],
        [b05.ph[2].start - 2, { p: [3.7, 3.0, 5.3], t: [-0.3, 1.45, -0.5], fov: 30 }, E.lin],
        [b05.ph[2].start + 8, { p: [2.2, 2.5, 3.4], t: [-0.25, 1.68, -0.5], fov: 30 }, E.io],
        [b06.start, { p: [2.1, 2.45, 3.3], t: [-0.25, 1.68, -0.5], fov: 30 }, E.lin],
        [cubeLand + 2, { p: [5.6, 3.9, 8.6], t: [0.2, 1.75, -0.1], fov: 30 }, E.expo],
        [b06.end, { p: [5.4, 3.8, 8.2], t: [0.2, 1.75, -0.1], fov: 30 }, E.lin],
      ]),
      f,
      { shakeAt: [cubeLand], shakeAmp: 0.34 },
    ),
  World: S03World,
  Over: ({ f, pr, u, w, h, tall }) => {
    const head = pr([TRI[0], 0.95, TRI[2]]);
    const phone = pr([TRI[0] + 0.16, 1.8, TRI[2]]);
    const cube = pr([2.5, 1.0, 1.1]);
    return (
      <>
        <Tag f={f} t0={b05.ph[0].start + 10} t1={b05.ph[1].start - 2} at={head} dx={190} dy={40} text="삼각대 높이 조절" tone="paper" u={u} />
        <Tag f={f} t0={b05.ph[1].start + 4} t1={b05.ph[2].start - 2} at={phone} dx={180} dy={-70} text="기울기 −8°… 아니 +3°" tone="paper" u={u} />
        <Tag f={f} t0={b05.ph[2].start + 9} t1={b06.start - 2} at={phone} dx={170} dy={-70} text="남은 용량 3%" sub="지울 사진부터 골라야 함" tone="red" u={u} />
        {!tall && <Tag f={f} t0={cubeLand + 8} t1={b06.end - 4} at={cube} dx={tall ? -60 : 110} dy={tall ? 210 : -150} text="자르기 전 원본" sub="수업 한 번 = 파일 한 덩어리" tone="paper" u={u} />}
        <Slam f={f} t0={b06.start + 1} t1={b06.end - 5} lines={["그런데 이게", "문제였습니다"]} u={u} size={tall ? 124 : 118} tone="red" x={0.5} y={tall ? 0.29 : 0.2} w={w} h={h} />
      </>
    );
  },
};

// ── S05 · 밤샘 편집: 자르고, 붙이고, 줄이고, 자막 넣고 ───────────────────────
const b07 = B.b07;
const b08 = B.b08;
const b09 = B.b09;
const cutA = b08.ph[0].start + 2;
const cutB = b08.ph[0].start + 8;
const glue = b08.ph[1].start + 2;
const press = b08.ph[2].start + 2;
const subs = b08.ph[3].start + 1;
const done = b09.start + 4;
const TL_Y = 2.55;

const drawWindow = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  ctx.fillStyle = "#0D1230";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#FFF3C4";
  ctx.beginPath();
  ctx.arc(W * 0.66, H * 0.36, W * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0D1230";
  ctx.beginPath();
  ctx.arc(W * 0.58, H * 0.31, W * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  [
    [0.2, 0.2],
    [0.3, 0.6],
    [0.84, 0.74],
    [0.14, 0.82],
    [0.44, 0.16],
    [0.9, 0.2],
  ].forEach(([x, y], i) => {
    ctx.beginPath();
    ctx.arc(W * x, H * y, W * (0.012 + (i % 2) * 0.008), 0, Math.PI * 2);
    ctx.fill();
  });
};

const S05World: React.FC<{ f: number }> = ({ f }) => {
  const hour = lerp(23, 26.2, tw(f, b07.start, b09.start - b07.start, E.lin));
  const tlIn = pop(f, b07.ph[1].start + 4, 12);
  const cut1 = tw(f, cutA, 4, E.out);
  const cut2 = tw(f, cutB, 4, E.out);
  const midGone = tw(f, cutB + 3, 10, E.in);
  const gl = tw(f, glue, 6, E.in);
  const snap = ring(f, glue + 6, 0.16, 1.3, 0.3);
  const pr = tw(f, press, 12, E.io);
  const rebound = ring(f, press + 12, 0.08, 1.1, 0.25);
  const collapse = tw(f, done - 4, 8, E.in);
  const fileIn = pop(f, done + 3, 12);
  const mugs = 1 + [b08.ph[1].start, b08.ph[2].start, b08.ph[3].start].filter((t) => f >= t).length;
  const sleepy = clamp((f - b07.start) / (b09.start - b07.start));
  const nod = Math.max(0, Math.sin(f * 0.16)) * 0.22 * sleepy;
  const cheer = f >= done + 4 ? tw(f, done + 4, 8, E.back) : 0;
  // 타임라인 클립: 왼쪽 / 가운데(NG) / 오른쪽
  const gap = 0.16;
  const lx = -0.95 - gap * cut1 * (1 - gl) + gl * 0.0;
  const rx = 1.15 + gap * cut2 * (1 - gl) - gl * 0.72;
  return (
    <group>
      <Slab w={7.4} d={5.2} c="#3A4374" edge="#232A52" />
      <Bx s={[7.2, 3.9, 0.22]} rad={0.06} c="#333C6B" p={[0, 1.95, -2.4]} />
      {/* 창문과 달 */}
      <group position={[-2.2, 2.45, -2.27]}>
        <Bx s={[1.9, 1.7, 0.1]} rad={0.04} c="#F4F1E6" />
        <Paint id="night-window" w={1.66} h={1.46} draw={drawWindow} p={[0, 0, 0.056]} />
        <Bx s={[0.06, 1.5, 0.03]} rad={0.01} c="#F4F1E6" p={[0, 0, 0.07]} cast={false} />
        <Bx s={[1.7, 0.06, 0.03]} rad={0.01} c="#F4F1E6" p={[0, 0, 0.07]} cast={false} />
      </group>
      <Clock p={[2.35, 2.9, -2.26]} hour={hour} ring="#F4F1E6" sc={1.05} />
      {/* 책상 */}
      <Desk p={[0, 0, -0.5]} w={3.4} d={1.25} h={0.82} c="#B98552" />
      <Laptop p={[-0.1, 0.87, -0.42]} glow={1.4} />
      {/* 스탠드 */}
      <group position={[1.25, 0.87, -0.7]}>
        <Cy rr={0.16} h={0.05} c="#2A2D36" p={[0, 0.025, 0]} />
        <Cy rr={0.025} h={0.62} c="#2A2D36" p={[0, 0.33, 0]} />
        <group position={[0, 0.64, 0]} rotation={[0, 0, 0.9]}>
          <Cy rr={0.025} h={0.46} c="#2A2D36" p={[0, 0.23, 0]} />
        </group>
        <group position={[-0.36, 0.9, 0]} rotation={[0, 0, 0.55]}>
          <Cy rr={[0.1, 0.24]} h={0.24} c={C.amber} em={C.lamp} ei={0.9} p={[0, 0, 0]} />
        </group>
        <pointLight position={[-0.5, 0.75, 0.25]} intensity={9} color={C.lamp} distance={7} decay={1.6} />
      </group>
      {Array.from({ length: mugs }).map((_, i) => (
        <Mug key={i} p={[-1.42 + (i % 2) * 0.26, 0.87, -0.3 - Math.floor(i / 2) * 0.28]} />
      ))}
      {/* 선생님 */}
      <Person
        p={[-0.1, 0.3, -1.25]}
        outfit={OUTFIT.teacher}
        pose={
          cheer > 0
            ? { sit: true, armL: [2.6 * cheer, 0], armR: [2.6 * cheer, 0], eyes: "happy", mouth: "smile", bounce: Math.abs(ring(f, done + 4, 0.1, 0.9, 0.2)) }
            : { sit: true, armL: [0.25, 1.15 + Math.sin(f * 0.9) * 0.08], armR: [0.25, 1.15 + Math.cos(f * 0.9) * 0.08], headPitch: 0.1 + nod, eyes: sleepy > 0.2 ? "tired" : "dot", brow: 0.9, mouth: "flat", headRoll: Math.sin(f * 0.07) * 0.05 * sleepy }
        }
      />
      {/* 떠 있는 편집 타임라인 */}
      <group position={[0.1, TL_Y, 0.15]} scale={[tlIn * (1 - collapse), tlIn * (1 - collapse), tlIn * (1 - collapse)]} rotation={[0.12, 0, 0]}>
        <Bx s={[4.5, 0.08, 0.74]} rad={0.03} c="#1C2242" p={[0, -0.08, 0]} />
        {/* 눈금 */}
        {Array.from({ length: 11 }).map((_, i) => (
          <Bx key={i} s={[0.02, 0.012, 0.74]} rad={0.004} c="#5B6699" p={[-2 + i * 0.4, -0.035, 0]} cast={false} />
        ))}
        {/* 클립 3조각(자르기 전에는 한 줄로 붙어 있음) */}
        <group position={[lx, 0, -0.1]} scale={[1 + snap, 1 - snap * 0.6, 1]}>
          <Bx s={[1.9, 0.26, 0.4]} rad={0.05} c={C.amber} em={C.amber} ei={0.25} p={[0, 0.12, 0]} />
        </group>
        <group position={[0.36, midGone * 1.3, -0.1]} rotation={[0, 0, midGone * 1.4]} scale={[1 - midGone, 1 - midGone, 1 - midGone]} visible={midGone < 1}>
          <Bx s={[0.72, 0.26, 0.4]} rad={0.05} c={f >= cutB ? C.red : C.amber} em={f >= cutB ? C.red : C.amber} ei={0.3} p={[0, 0.12, 0]} />
          {f >= cutB && <Sign text="NG" w={0.6} h={0.22} size={0.17} color="#FFFFFF" slam p={[0, 0.12, 0.206]} />}
        </group>
        <group position={[rx, 0, -0.1]} scale={[1 + snap, 1 - snap * 0.6, 1]}>
          <Bx s={[0.86, 0.26, 0.4]} rad={0.05} c={C.amber} em={C.amber} ei={0.25} p={[0, 0.12, 0]} />
        </group>
        {/* 칼날 */}
        {[
          [cutA, 0.0],
          [cutB, 0.72],
        ].map(([t0, x], i) => {
          const k = clamp((f - (t0 - 5)) / 5);
          const up = clamp((f - (t0 + 3)) / 6);
          if (f < t0 - 5 || up >= 1) return null;
          return <Bx key={i} s={[0.04, 0.9, 0.62]} rad={0.012} c="#FFFFFF" em="#FFFFFF" ei={0.8} p={[x, lerp(1.6, 0.3, E.in(k)) + up * 1.4, -0.1]} />;
        })}
        {/* 자막 띠 */}
        {[-1.35, -0.55, 0.3].map((x, i) => {
          const p = pop(f, subs + i * 4, 9);
          return <Bx key={i} s={[0.66, 0.1, 0.16]} rad={0.03} c="#FFFFFF" em="#FFFFFF" ei={0.5} p={[x, 0.07, 0.26]} sc={[p, p, p]} />;
        })}
      </group>
      <Burst frame={f} t0={glue + 6} p={[0.2, TL_Y + 0.2, 0.2]} colors={["#FFFFFF", C.amber]} n={10} reach={0.8} size={0.08} dur={14} />
      {/* 용량 줄이기: 원본 큐브를 프레스로 누름 */}
      <group position={[2.75, 0, -0.55]}>
        <FileCube size={1.2} c={C.red} label="원본.mp4" sub={pr > 0.9 ? "0.9GB" : "8.4GB"} r={[0, -0.25, 0]} sc={[lerp(1, 0.66, pr) + rebound, lerp(1, 0.5, pr) - rebound, lerp(1, 0.66, pr) + rebound]} />
        {f >= press - 6 && f < b08.ph[3].start + 6 && <Bx s={[1.3, 0.14, 1.3]} rad={0.04} c="#C9CED6" em="#8FA0E8" ei={0.3} p={[0, lerp(2.3, 0.67, pr) + tw(f, b08.ph[3].start - 2, 8, E.in) * 2.4, 0]} r={[0, -0.25, 0]} />}
      </group>
      {/* 완성 파일 */}
      <group position={[0.1, TL_Y - 0.5 + fileIn * 0.15 + Math.sin(f * 0.15) * 0.04, 0.2]} scale={[fileIn, fileIn, fileIn]} rotation={[0, Math.sin(f * 0.06) * 0.25, 0]}>
        <FileCube size={0.86} c={C.amber} label="최종_진짜최종" sub=".mp4" labelSize={0.11} />
      </group>
      <Burst frame={f} t0={done + 3} p={[0.1, TL_Y, 0.2]} colors={["#FFFFFF", C.amber, C.lamp]} n={16} reach={1.3} size={0.09} dur={18} />
    </group>
  );
};

const S05: SceneDef = {
  id: "s05",
  name: "밤 책상 — 편집",
  start: b07.start,
  end: b09.ph[1].start,
  bg: C.night,
  dark: true,
  look: { ...NIGHT, reach: 9 },
  enter: "whip",
  cam: (f) =>
    camLive(
      camPath(f, [
        [b07.start, { p: [6.4, 4.6, 9.6], t: [0.2, 1.6, -0.4], fov: 30 }],
        [b08.start, { p: [4.6, 3.8, 8.6], t: [0.3, 1.85, -0.2], fov: 30 }, E.io],
        [b08.ph[2].start - 2, { p: [4.0, 3.6, 8.2], t: [0.35, 1.9, -0.1], fov: 30 }, E.lin],
        [b08.ph[2].start + 8, { p: [5.0, 3.2, 8.0], t: [1.5, 1.45, -0.3], fov: 30 }, E.io],
        [b08.ph[3].start + 6, { p: [3.6, 3.5, 7.8], t: [0.4, 1.9, -0.1], fov: 30 }, E.io],
        [b09.ph[1].start, { p: [2.4, 3.2, 6.4], t: [0.15, 2.0, 0], fov: 30 }, E.io],
      ]),
      f,
      { drift: 0.04, shakeAt: [press + 11], shakeAmp: 0.12 },
    ),
  World: S05World,
  Over: ({ f, pr, u, tall }) => {
    const clock = pr([2.35, 2.9, -2.2]);
    const tl = pr([0.1, TL_Y + 0.25, 0.2]);
    const cube = pr([3.2, 0.75, 0.0]);
    const hr = lerp(23, 26.2, tw(f, b07.start, b09.start - b07.start, E.lin));
    const hh = Math.floor(hr) % 24;
    const label = `${hh >= 12 ? "PM" : "AM"} ${hh % 12 === 0 ? 12 : hh % 12}:${String(Math.floor((hr % 1) * 6) * 10).padStart(2, "0")}`;
    return (
      <>
        <Chip f={f} t0={b07.start + 8} t1={b09.ph[1].start - 4} x={clock.x} y={clock.y - 78 * u} text={label} tone="amber" u={u} size={34} />
        <Tag f={f} t0={cutB + 4} t1={b08.ph[1].start - 2} at={tl} dx={tall ? -40 : -260} dy={-120} text="NG 컷 찾아서 잘라내기" tone="paper" u={u} />
        <Tag f={f} t0={press + 12} t1={b08.ph[3].start + 6} at={cube} dx={tall ? -200 : 60} dy={tall ? -230 : 150} text="8.4GB → 0.9GB" sub="인코딩 기다리는 중…" tone="amber" u={u} />
      </>
    );
  },
};

// ── S06 · 업로드: 어디에 올리지 → 폴더 → 링크 ───────────────────────────────
const b10 = B.b10;
const b11 = B.b11;
const upT = b09.ph[1].start;
const CLOUDS: Array<{ p: V3; q: string }> = [
  { p: [-3.3, 3.45, -1.0], q: "드라이브?" },
  { p: [0, 4.2, -1.6], q: "카페 게시판?" },
  { p: [3.3, 3.5, -1.0], q: "단톡방?" },
];
const PHONES = [-3.2, -1.6, 0, 1.6, 3.2];
const READ = [true, false, true, false, false];
const FOLDERS = ["2학기", "3반", "11월", "2주차"];
const linkT = b10.ph[2].start + 2;

const S06World: React.FC<{ f: number }> = ({ f }) => {
  const rise = tw(f, upT + 2, 16, E.out);
  // 큐브가 구름 사이를 헤맵니다 → 가운데로 정함
  const d0 = b10.ph[0].start;
  const d1 = b10.ph[1].start;
  const k = clamp((f - d0) / Math.max(1, d1 - d0 - 4));
  const wander = Math.sin(k * Math.PI * 2.5) * 3.0 * (1 - E.in(k));
  const decide = tw(f, d1 - 6, 8, E.io);
  const cx = f < d0 ? 0 : wander;
  const cy = lerp(1.55, 2.75, rise) + (f >= d0 ? Math.abs(Math.sin(k * Math.PI * 2.5)) * 0.25 * (1 - decide) : 0) + decide * 0.0;
  const intoFolder = tw(f, d1 + FOLDERS.length * 5 + 4, 10, E.io);
  const cubeP = lerp3([cx, cy, 0.4], [2.15, 3.45, -0.75], intoFolder);
  const look = f < d0 ? 0 : clamp(-cx / 3.2, -1, 1) * 0.5;
  // b11: 이야기가 휴대폰 줄로 넘어가면 구름·폴더는 물러납니다.
  const clear = 1 - tw(f, b11.start + 1, 9, E.in);
  return (
    <group>
      <Slab w={9.4} d={3.4} c="#EBD3AA" edge="#C9A46E" p={[0, 0, 1.5]} />
      <Person p={[0, 0, 0.75]} outfit={OUTFIT.teacher} pose={{ armL: [2.5 - decide * 2.2, 0.3], armR: [2.5 - decide * 2.2, 0.3], headPitch: f >= b11.start + 4 ? 0.35 : -0.5, headYaw: look, eyes: (f >= d0 && decide < 1) || f >= b11.start + 8 ? "wide" : "dot", mouth: f >= b11.start + 8 ? "o" : f >= d0 && decide < 1 ? "wavy" : "flat", brow: 0.8, lean: -look * 0.15 }} />
      {/* 구름 세 곳 */}
      {CLOUDS.map((c, i) => {
        const inn = pop(f, upT + 6 + i * 4, 14);
        const qIn = pop(f, d0 + 3 + i * 6, 9) * (1 - decide);
        const chosen = i === 1 ? 1 + decide * 0.12 : 1 - decide * 0.25;
        return (
          <group key={i} position={[c.p[0], c.p[1] + Math.sin(f * 0.05 + i * 2) * 0.1, c.p[2]]}>
            <Cloud sc={1.25 * inn * chosen * clear} em={i === 1 ? 0.15 + decide * 0.25 : 0.15} />
            <group scale={[qIn, qIn, qIn]} position={[0, 1.0, 0.3]}>
              <Sign text={c.q} w={1.9} h={0.46} size={0.26} color="#FFFFFF" bg={C.ink} radius={0.1} weight={900} />
            </group>
          </group>
        );
      })}
      {/* 폴더 속 폴더 속 폴더 */}
      {FOLDERS.map((name, i) => {
        const p = pop(f, d1 + 2 + i * 5, 10);
        return <Folder key={i} p={[-2.35 + i * 1.5, 1.95 + i * 0.3, -0.9 + i * 0.02]} sc={[p * 1.75 * clear, p * 1.75 * clear, p * 1.75 * clear]} label={name} r={[0, -0.12, 0]} />;
      })}
      {/* 완성 파일 */}
      <FileCube p={cubeP} size={0.78} c={C.amber} label="최종.mp4" labelSize={0.13} r={[0, Math.sin(f * 0.1) * 0.3, Math.sin(f * 0.3) * 0.08 * (1 - decide)]} sc={(1 - intoFolder * 0.45) * clear} />
      {f >= upT + 2 && f < d0 + 4 && <Arrow p={[0, 0.9 + rise * 0.6, 0.4]} len={0.9} c={C.red} w={0.14} />}
      {/* 학생들 휴대폰 */}
      {PHONES.map((x, i) => {
        const hit = linkT + 6 + i * 4;
        const buzz = ring(f, hit, 0.3, 2.2, 0.16);
        const inn = pop(f, b10.ph[2].start - 6 + i * 2, 10);
        const lit = f >= hit;
        const read = READ[i] && f >= b11.start + 4 + i * 2;
        return (
          <group key={i} position={[x, 0.02, 2.55]} scale={[inn, inn, inn]}>
            <Phone r={[-0.5, 0, buzz]} glow={lit ? 1.3 : 0.15} sc={1.15} />
            {lit && !read && <Sp rr={0.11} c={C.red} em={C.red} ei={0.6} p={[0.21, 0.84, 0.3]} sc={pop(f, hit, 7)} cast={false} />}
            {read && <Sp rr={0.11} c={C.leaf} em={C.leaf} ei={0.6} p={[0.21, 0.84, 0.3]} sc={pop(f, b11.start + 4 + i * 2, 7)} cast={false} />}
          </group>
        );
      })}
    </group>
  );
};

const S06: SceneDef = {
  id: "s06",
  name: "업로드 — 구름·폴더·링크",
  start: b09.ph[1].start,
  end: b11.end,
  bg: "#E4EEF3",
  look: { ...DAY, shadow: 0.16 },
  exit: "whip",
  tallK: 1.6,
  cam: (f) =>
    camLive(
      camPath(f, [
        [upT, { p: [0.4, 2.2, 9.5], t: [-0.6, 1.6, 0.4], fov: 30 }],
        [upT + 18, { p: [0.1, 3.6, 14.2], t: [-0.7, 2.5, 0], fov: 30 }, E.out],
        [b10.ph[2].start - 4, { p: [-1.1, 3.7, 13.8], t: [-0.7, 2.5, 0], fov: 30 }, E.lin],
        [b10.ph[2].start + 12, { p: [0.0, 4.6, 13.2], t: [-0.4, 1.9, 0.6], fov: 30 }, E.io],
        [b11.start, { p: [0.2, 4.7, 12.8], t: [-0.4, 1.8, 0.7], fov: 30 }, E.lin],
        [b11.start + 10, { p: [1.6, 3.9, 10.2], t: [0.1, 1.35, 1.9], fov: 30 }, E.io],
        [b11.end, { p: [1.9, 3.8, 9.8], t: [0.15, 1.35, 1.9], fov: 30 }, E.lin],
      ]),
      f,
    ),
  World: S06World,
  Over: ({ f, pr, u, w, h, tall }) => {
    const src = pr([2.15, 3.3, -0.75]);
    const ends = PHONES.map((x) => pr([x, 0.75, 2.75]));
    const unread = pr([1.6, 0.95, 2.8]);
    return (
      <>
        {/* 링크가 한 명씩 날아갑니다 */}
        <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
          {ends.map((e, i) => {
            const t0 = linkT + i * 4;
            const k = tw(f, t0, 7, E.out);
            const out = 1 - tw(f, b11.start - 4, 8);
            if (k <= 0 || out <= 0) return null;
            const mx = (src.x + e.x) / 2;
            const my = Math.min(src.y, e.y) - 40 * u;
            const d = `M ${src.x} ${src.y} Q ${mx} ${my} ${e.x} ${e.y}`;
            return <path key={i} d={d} fill="none" stroke={C.cobalt} strokeWidth={5 * u} strokeLinecap="round" strokeDasharray={`${14 * u} ${12 * u}`} pathLength={1} style={{ strokeDasharray: `${k} 1`, opacity: out }} />;
          })}
        </svg>
        <Tag f={f} t0={linkT + 14} t1={b10.end - 4} at={src} dx={tall ? -120 : 230} dy={tall ? -240 : -90} text="복사 → 붙여넣기 → 전송" sub="× 반 인원수" tone="cobalt" u={u} />
        <Tag f={f} t0={b11.start + 16} t1={b11.end - 5} at={unread} dx={170} dy={-130} text="안 읽음 3명" tone="red" u={u} />
        <Slam f={f} t0={b11.ph[1].start} t1={b11.end - 5} lines={["끝이 아니었습니다"]} u={u} size={tall ? 110 : 118} tone="red" x={0.56} y={tall ? 0.29 : 0.16} w={w} h={h} />
      </>
    );
  },
};

// ── S08 · 시청 체크: 찾고, 다시 안내하고, 확인받고 ───────────────────────────
const b12 = B.b12;
const b13 = B.b13;
const COLS = [-2.55, -0.85, 0.85, 2.55];
const ROWS: Array<[number, number]> = [
  [0.95, 0],
  [-0.45, 0.62],
  [-1.85, 1.24],
];
const UNWATCHED = [1, 4, 6, 9, 10];
const seatPos = (i: number): V3 => [COLS[i % 4], ROWS[Math.floor(i / 4)][1], ROWS[Math.floor(i / 4)][0]];
const reveal = b12.ph[1].start + 2;
const TEACH: V3 = [-4.7, 0, 1.9];

const S08World: React.FC<{ f: number }> = ({ f }) => {
  const find0 = b13.ph[0].start;
  const find1 = b13.ph[1].start;
  const conf = b13.ph[2].start;
  const seg = (find1 - find0) / UNWATCHED.length;
  const fi = clamp(Math.floor((f - find0) / seg), 0, UNWATCHED.length - 1);
  const fk = E.io(clamp(((f - find0) % seg) / (seg * 0.6)));
  const from = seatPos(UNWATCHED[Math.max(0, fi - 1)]);
  const to = seatPos(UNWATCHED[fi]);
  const mag = lerp3(fi === 0 ? [-4.2, 2.4, 2.2] : [from[0], from[1] + 1.25, from[2] + 0.55], [to[0], to[1] + 1.25, to[2] + 0.55], fk);
  const sweep = clamp((f - b12.start) / Math.max(1, reveal - b12.start));
  return (
    <group>
      <Slab w={11.4} d={5.6} c="#E9E1CC" edge="#C4B690" p={[-0.5, 0, 0.4]} />
      <Bx s={[7.6, 0.62, 1.4]} rad={0.06} c="#DCCFAE" p={[0, 0.31, -0.45]} />
      <Bx s={[7.6, 1.24, 1.4]} rad={0.06} c="#D0C19C" p={[0, 0.62, -1.85]} />
      {Array.from({ length: 12 }).map((_, i) => {
        const p = seatPos(i);
        const bad = UNWATCHED.includes(i);
        const order = UNWATCHED.indexOf(i);
        const known = f >= reveal + (i % 4) * 2 + Math.floor(i / 4) * 2;
        const found = bad && f >= find0 + order * seg + seg * 0.5;
        const fixedAt = conf + 3 + order * 5;
        const fixed = bad && order < UNWATCHED.length - 1 && f >= fixedAt;
        const state = !known ? "unknown" : bad && !fixed ? "bad" : "ok";
        const lamp = state === "unknown" ? "#B9B4A6" : state === "bad" ? C.red : C.leaf;
        const spot = Math.abs(sweep * 5 - 0.5 - (i % 4)) < 0.6 && f < reveal ? 0.06 : 0;
        const jump = known ? Math.abs(ring(f, reveal + (i % 4) * 2 + Math.floor(i / 4) * 2, 0.16, 1.0, 0.22)) : 0;
        const fix = fixed ? Math.abs(ring(f, fixedAt, 0.22, 1.0, 0.2)) : 0;
        const dimmed = f >= find0 && !bad ? 0.9 : 1;
        return (
          <group key={i} position={[p[0], p[1], p[2]]}>
            <Person
              sc={0.84 * dimmed}
              outfit={kidOutfit(i)}
              pose={{
                bounce: jump + fix + spot,
                eyes: state === "bad" ? (found ? "wide" : "closed") : state === "ok" ? "happy" : "dot",
                mouth: state === "bad" ? (found ? "o" : "flat") : state === "ok" ? "smile" : "flat",
                headYaw: state === "bad" && !found ? (i % 2 ? 0.5 : -0.5) : 0,
                armL: fixed ? [2.7, 0] : [0.15, 0],
                armR: [0.15, 0],
                brow: state === "bad" && found ? 1 : 0,
              }}
            />
            <Sp rr={0.1} c={lamp} em={lamp} ei={state === "unknown" ? 0 : 0.7} p={[0, 1.52 + jump + fix, 0]} sc={1 + jump * 2 + fix * 2} cast={false} />
            {bad && !fixed && f >= find0 && f < find1 + 4 && !found && <Sign text="Zzz" w={0.6} h={0.3} size={0.2} color={C.ink} p={[0.45, 1.6, 0.2]} weight={900} />}
          </group>
        );
      })}
      {/* 선생님과 돋보기 */}
      <Person
        p={TEACH}
        yaw={0.95}
        outfit={OUTFIT.teacher}
        pose={
          f < find0
            ? { armR: [1.2, 0.9], headYaw: Math.sin(f * 0.12) * 0.35, brow: 0.5 }
            : f < find1
              ? { armR: [1.9, 0.9], armL: [0.3, 0.2], headYaw: 0.2, brow: 0.7, bounce: Math.abs(Math.sin(f * 0.5)) * 0.03 }
              : f < conf
                ? { armR: [2.0, 1.0], armL: [2.0, 1.0], mouth: Math.floor(f / 3) % 2 ? "open" : "o", brow: 0.6 }
                : { armL: [0.2, 0], armR: [0.6 + tw(f, b13.end - 14, 8) * 1.6, 1.2], eyes: f >= b13.end - 12 ? "closed" : "dot", mouth: f >= b13.end - 12 ? "frown" : "flat", headPitch: tw(f, b13.end - 12, 8) * 0.3 }
        }
      />
      {f >= find0 && f < find1 + 3 && <Magnifier p={mag} sc={1.05 * pop(f, find0, 8) * (1 - tw(f, find1 - 2, 5, E.in))} r={[0, 0, Math.sin(f * 0.3) * 0.08]} />}
      {/* 다시 안내: 말풍선이 한 명씩 날아갑니다 */}
      {UNWATCHED.map((si, i) => {
        const t0 = find1 + 1 + i * 3;
        const k = clamp((f - t0) / 14);
        if (k <= 0 || f > conf + 6 + i * 5) return null;
        const to2 = seatPos(si);
        const p = lerp3([TEACH[0] + 0.5, 2.0, TEACH[2]], [to2[0] + 0.25, to2[1] + 2.25, to2[2] + 0.2], E.out(k));
        return <Bubble key={i} p={[p[0], p[1] + Math.sin(k * Math.PI) * 0.7, p[2]]} sc={0.95 * E.back(clamp(k * 2.5))} text="다시 봐 주세요" c={C.amber} w={1.5} />;
      })}
    </group>
  );
};

const S08: SceneDef = {
  id: "s08",
  name: "시청 체크 — 명단 확인",
  start: b12.start,
  end: b13.end,
  bg: C.paper,
  look: DAY,
  enter: "whip",
  tallK: 2.25,
  cam: (f) =>
    camLive(
      camPath(f, [
        [b12.start, { p: [1.6, 6.6, 13.2], t: [-0.6, 1.6, -0.4], fov: 30 }],
        [b13.start, { p: [0.8, 6.2, 12.2], t: [-0.6, 1.6, -0.4], fov: 30 }, E.out],
        [b13.end, { p: [-0.6, 5.8, 11.6], t: [-0.7, 1.55, -0.4], fov: 30 }, E.lin],
      ]),
      f,
    ),
  World: S08World,
  Over: ({ f, pr, u, w, h, tall }) => {
    const top = pr([0, 3.75, -1.85]);
    const last = seatPos(UNWATCHED[UNWATCHED.length - 1]);
    const lastP = pr([last[0], last[1] + 1.7, last[2]]);
    const conf = b13.ph[2].start;
    const fixedN = UNWATCHED.slice(0, -1).filter((_, i) => f >= conf + 3 + i * 5).length;
    return (
      <>
        <Chip f={f} t0={b12.start + 6} t1={reveal + 6} x={top.x} y={top.y - 20 * u} text="누가 봤고, 누가 안 봤지?" tone="ink" u={u} size={tall ? 34 : 38} />
        <Chip f={f} t0={reveal + 8} t1={b13.end - 2} x={top.x} y={top.y - 20 * u} text={`시청 ${7 + fixedN}명 · 미시청 ${5 - fixedN}명`} tone={fixedN >= 4 ? "amber" : "red"} u={u} size={tall ? 34 : 38} />
        <Tag f={f} t0={b13.end - 22} t1={b13.end - 3} at={lastP} dx={tall ? -30 : 150} dy={-110} text="끝까지 안 보는 한 명" tone="red" u={u} />
        <div style={{ display: "none" }}>{w + h}</div>
      </>
    );
  },
};

// ── S09 · 에너지 방전 ─────────────────────────────────────────────────────────
const b14 = B.b14;
const stackT = (i: number) => b14.start + 4 + i * 6;
const fall = b14.ph[3].start + 12;

const S09World: React.FC<{ f: number }> = ({ f }) => {
  const n = CHORES.filter((_, i) => f >= stackT(i)).length;
  const col = tw(f, fall, 7, E.in);
  const squash = lerp(1 - n * 0.075, 0.2, col);
  const knee = Math.sin(f * 1.5) * 0.02 * n * (1 - col);
  const topY = 0.14 + 1.62 * squash;
  const level = 1 - tw(f, b14.ph[2].start, b14.ph[3].start + 8 - b14.ph[2].start, E.io) * 0.97;
  const batIn = pop(f, b14.ph[2].start - 4, 12);
  const soulK = clamp((f - (fall + 6)) / 40);
  return (
    <group>
      <Cy rr={[1.5, 1.62]} h={0.2} c="#FFFDF6" p={[0, -0.04, 0]} seg={48} />
      <Cy rr={1.75} h={0.1} c="#D9CFB6" p={[0, -0.19, 0]} seg={48} />
      <Person
        p={[knee, 0.06, 0]}
        outfit={OUTFIT.teacher}
        pose={{
          squash,
          armL: [lerp(2.7, 1.5, col), 0],
          armR: [lerp(2.7, 1.5, col), 0],
          eyes: col > 0.5 ? "x" : n >= 3 ? "spiral" : n >= 1 ? "wide" : "dot",
          spin: f * 0.4,
          mouth: col > 0.5 ? "flat" : n >= 2 ? "wavy" : "o",
          brow: 1,
          lean: Math.sin(f * 0.4) * 0.02 * n,
        }}
      />
      <Sweat frame={f} t0={stackT(1)} until={fall} p={[0, topY - 0.2, 0.1]} n={5} />
      {CHORES.map((c, i) => {
        const d = drop(f, stackT(i), 6, 8);
        if (!d.vis) return null;
        const wob = Math.sin(f * 0.35 + i) * 0.035 * (i + 1) * (1 - col);
        return (
          <group key={i} position={[wob * (i + 1) * 0.6, topY + i * 0.62 * lerp(1, 0.86, col) + d.y, 0]} rotation={[0, (i % 2 ? -0.1 : 0.12) + col * (i - 1.5) * 0.12, wob + col * (i % 2 ? 0.1 : -0.08)]} scale={[d.sxz, d.sy, d.sxz]}>
            <ChoreBlock label={c.label} c={c.c} />
          </group>
        );
      })}
      <group position={[3.5, -0.02, 0.4]} scale={[batIn, batIn, batIn]} rotation={[0, -0.25, ring(f, b14.ph[3].start + 8, 0.08, 1.4, 0.15)]}>
        <Battery level={level} blink={level < 0.1 ? (Math.floor(f / 4) % 2 ? 1 : 0) : 0} />
      </group>
      {soulK > 0 && <Soul frame={f} p={[0.2 + Math.sin(f * 0.12) * 0.2, topY + 2.75 + E.out(soulK) * 1.0, 0.3]} sc={1.5 * E.back(clamp(soulK * 3))} />}
      <Burst frame={f} t0={fall + 6} p={[0, 0.3, 0.6]} colors={["#F4F1E6", "#D9CFB6"]} n={12} reach={1.8} size={0.1} up={0.4} />
    </group>
  );
};

const S09: SceneDef = {
  id: "s09",
  name: "에너지 방전 — 네 덩어리의 무게",
  start: b14.start,
  end: b14.end,
  bg: C.paper,
  look: DAY,
  enter: "whip",
  tallK: 1.55,
  cam: (f) =>
    camLive(
      camPath(f, [
        [b14.start, { p: [5.2, 3.0, 12.6], t: [1.1, 2.1, 0], fov: 30 }],
        [fall, { p: [4.2, 3.2, 11.2], t: [1.2, 2.2, 0], fov: 30 }, E.lin],
        [fall + 14, { p: [4.4, 2.6, 11.4], t: [1.2, 1.9, 0], fov: 30 }, E.out],
        [b14.end, { p: [4.2, 2.6, 11.0], t: [1.2, 2.0, 0], fov: 30 }, E.lin],
      ]),
      f,
      { shakeAt: [...CHORES.map((_, i) => stackT(i)), fall + 6], shakeAmp: 0.16 },
    ),
  World: S09World,
  Over: ({ f, pr, u, tall }) => {
    const n = CHORES.filter((_, i) => f >= stackT(i)).length;
    const squash = 1 - n * 0.075;
    const stack = pr([-0.95, 0.14 + 1.62 * squash + 1.25, 0.5]);
    const bat = pr([3.5, 1.95, 0.7]);
    const level = Math.round((1 - tw(f, b14.ph[2].start, b14.ph[3].start + 8 - b14.ph[2].start, E.io) * 0.97) * 100);
    return (
      <>
        <Tag f={f} t0={b14.ph[1].start + 2} t1={fall - 2} at={stack} dx={tall ? -40 : -210} dy={tall ? -400 : -60} text="전부 수업 ‘외’ 시간" tone="red" u={u} />
        <Tag f={f} t0={b14.ph[2].start + 4} t1={b14.end - 4} at={bat} dx={tall ? -10 : 130} dy={-120} text={`선생님 에너지 ${level}%`} tone={level < 25 ? "red" : "paper"} u={u} />
      </>
    );
  },
};

void Disc;
void Cy;
export const ACT1B: SceneDef[] = [S03, S05, S06, S08, S09];

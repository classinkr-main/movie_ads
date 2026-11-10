import React from "react";
import { AbsoluteFill } from "remotion";
import { B } from "../story/beats";
import { C, FONT } from "../lib/theme";
import { camLive, camPath, clamp, drop, E, lerp, pop, ring, tw, V3 } from "../lib/motion";
import { Arrow, Burst, Bx, Check, Cloud, Cy, Desk, FileCube, OUTFIT, Paint, Person, Pose, RecButton, Sign, Slab, Soul, Sp, Sweat } from "../three/kit";
import { DAY } from "../three/Stage";
import { Slam, Stamp, Tag } from "../overlay/kit";
import { panic } from "./act1a";
import { Classroom } from "./sets";
import type { SceneDef } from "./types";

// ── 장비 3종(카메라·마이크·저장 장치) — S11·S12 가 같이 씁니다 ──────────────
const CAM_AT: V3 = [0.6, 3.25, 0.9];
const MIC_AT: V3 = [-3.55, 0, -1.25];
const DRV_AT: V3 = [4.05, 0, 0.95];

const Gadgets: React.FC<{ f: number; camT: number; micT: number; drvT: number; alert?: boolean }> = ({ f, camT, micT, drvT, alert }) => {
  const cd = drop(f, camT, 4.5, 8);
  const mic = pop(f, micT, 12);
  const blink = (i: number) => (alert && Math.floor((f + i * 3) / 4) % 2 === 0 ? 1 : 0);
  return (
    <group>
      {/* 천장 카메라 */}
      {cd.vis && (
        <group position={[CAM_AT[0], CAM_AT[1] + cd.y, CAM_AT[2]]} scale={[cd.sxz, cd.sy, cd.sxz]}>
          <Cy rr={0.05} h={3.2} c={C.metalDark} p={[0, 1.85, 0]} />
          <Bx s={[0.3, 0.14, 0.3]} rad={0.03} c={C.metalDark} p={[0, 0.3, 0]} />
          <group rotation={[0.42, 0, 0]}>
            <Bx s={[0.74, 0.46, 0.56]} rad={0.07} c="#2A2D36" />
            <Cy rr={[0.19, 0.17]} h={0.36} c="#15171D" p={[0, 0, -0.44]} r={[Math.PI / 2, 0, 0]} />
            <Cy rr={0.13} h={0.02} c="#5B8DEF" em="#5B8DEF" ei={0.6} p={[0, 0, -0.63]} r={[Math.PI / 2, 0, 0]} cast={false} />
            <Sp rr={0.055} c={C.red} em={C.red} ei={1.2} p={[0.24, 0.26, 0.2]} cast={false} />
          </group>
          {alert && <Sign text="!" w={0.46} h={0.46} size={0.36} color="#FFFFFF" bg={C.red} radius={0.23} slam p={[0, 0.95, 0.4]} sc={0.8 + blink(0) * 0.35} />}
        </group>
      )}
      {/* 마이크 스탠드 */}
      <group position={MIC_AT} scale={[mic, mic, mic]} visible={f >= micT}>
        <Cy rr={0.28} h={0.06} c={C.metalDark} p={[0, 0.03, 0]} />
        <Cy rr={0.03} h={1.5} c={C.metal} p={[0, 0.78, 0]} />
        <group position={[0, 1.5, 0]} rotation={[0, 0, -0.9]}>
          <Cy rr={0.025} h={1.1} c={C.metal} p={[0, 0.45, 0]} />
          <group position={[0, 1.0, 0]}>
            <Cy rr={0.075} h={0.3} c="#2A2D36" />
            <Sp rr={0.13} c="#4A4F5C" p={[0, 0.22, 0]} />
          </group>
        </group>
        {alert && <Sign text="!" w={0.46} h={0.46} size={0.36} color="#FFFFFF" bg={C.red} radius={0.23} slam p={[0.4, 2.55, 0.2]} sc={0.8 + blink(1) * 0.35} />}
      </group>
      {/* 저장 장치 탑 */}
      {Array.from({ length: 5 }).map((_, i) => {
        const d = drop(f, drvT + i * 4, 4, 7);
        if (!d.vis) return null;
        return (
          <group key={i} position={[DRV_AT[0], i * 0.29 + d.y, DRV_AT[2]]} scale={[d.sxz, d.sy, d.sxz]} rotation={[0, (i % 2 ? 0.06 : -0.05) - 0.3, 0]}>
            <Bx s={[0.95, 0.27, 0.7]} rad={0.045} c={i % 2 ? "#3A3F4B" : "#2A2D36"} p={[0, 0.135, 0]} />
            <Sp rr={0.035} c={C.leaf} em={C.leaf} ei={Math.floor((f + i * 5) / 6) % 2 ? 1.4 : 0.2} p={[0.36, 0.135, 0.355]} cast={false} />
            <Bx s={[0.5, 0.03, 0.01]} rad={0.004} c="#6B7280" p={[-0.12, 0.135, 0.352]} cast={false} />
          </group>
        );
      })}
      {alert && f >= drvT + 20 && <Sign text="!" w={0.46} h={0.46} size={0.36} color="#FFFFFF" bg={C.red} radius={0.23} slam p={[DRV_AT[0], 2.0, DRV_AT[2]]} sc={0.8 + blink(2) * 0.35} />}
    </group>
  );
};

// ── S10 · 에듀테크 업체 등장 ──────────────────────────────────────────────────
const b15 = B.b15;
const b16 = B.b16;
const circleT = b16.ph[1].start + 3;
const NOTE_ROWS = ["촬영", "편집", "업로드", "시청 체크"];

const drawPlan = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  ctx.fillStyle = "#2450D6";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += W / 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += H / 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "#FFFFFF";
  ctx.lineWidth = H * 0.016;
  ctx.font = `800 ${H * 0.12}px "Pretendard"`;
  ctx.textBaseline = "middle";
  ctx.fillText("촬영 개선안 v1", W * 0.05, H * 0.14);
  // 카메라
  ctx.strokeRect(W * 0.08, H * 0.42, W * 0.16, H * 0.26);
  ctx.beginPath();
  ctx.arc(W * 0.16, H * 0.55, H * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  // 마이크
  ctx.beginPath();
  ctx.arc(W * 0.46, H * 0.46, H * 0.08, 0, Math.PI * 2);
  ctx.moveTo(W * 0.46, H * 0.54);
  ctx.lineTo(W * 0.46, H * 0.74);
  ctx.moveTo(W * 0.4, H * 0.74);
  ctx.lineTo(W * 0.52, H * 0.74);
  ctx.stroke();
  // 저장 장치
  [0, 1, 2].forEach((i) => ctx.strokeRect(W * 0.7, H * (0.38 + i * 0.13), W * 0.2, H * 0.1));
  // 화살표
  ctx.setLineDash([H * 0.03, H * 0.03]);
  ctx.beginPath();
  ctx.moveTo(W * 0.27, H * 0.56);
  ctx.lineTo(W * 0.36, H * 0.56);
  ctx.moveTo(W * 0.56, H * 0.56);
  ctx.lineTo(W * 0.67, H * 0.56);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `700 ${H * 0.075}px "Pretendard"`;
  ctx.fillText("카메라", W * 0.1, H * 0.86);
  ctx.fillText("마이크", W * 0.4, H * 0.86);
  ctx.fillText("저장 장치", W * 0.69, H * 0.86);
};

const S10World: React.FC<{ f: number }> = ({ f }) => {
  const aIn = pop(f, b15.start + 3, 13);
  const bIn = pop(f, b15.start + 8, 13);
  const point = tw(f, b15.ph[1].start, 9, E.back);
  const idea = pop(f, b16.start + 2, 10);
  const roll = tw(f, b16.ph[1].start + 2, 16, E.out);
  const ringIn = tw(f, circleT, 8, E.out);
  const poseA: Pose = {
    armR: [0.2 + point * 2.3, 0.2],
    armL: [0.2, 0.3],
    headYaw: point * 0.5,
    mouth: f >= b16.start ? "smile" : "flat",
    eyes: "dot",
    bounce: Math.abs(ring(f, b16.start + 2, 0.12, 0.9, 0.2)),
    brow: -0.2,
  };
  const poseB: Pose = { armR: [1.6, 1.3 + Math.sin(f * 0.2) * 0.05], armL: [0.3, 0.6], headYaw: -0.25 + point * 0.6, mouth: "flat", bounce: Math.max(0, Math.sin(f * 0.25)) * 0.03 };
  return (
    <group>
      <Slab w={10.4} d={6.0} c="#DDE5F2" edge="#AEBBD6" />
      <Bx s={[10.2, 3.9, 0.22]} rad={0.06} c="#EEF2FA" p={[0, 1.95, -2.8]} />
      {/* 코르크 보드에 붙은 '할 일' */}
      <group position={[2.3, 2.25, -2.66]}>
        <Bx s={[3.0, 2.5, 0.1]} rad={0.05} c="#D9B88A" />
        <Bx s={[2.3, 2.1, 0.03]} rad={0.03} c="#FFFDF4" p={[0, 0, 0.06]} />
        <Sign text="수업 끝나고 할 일" w={2.3} h={0.42} size={0.2} color="#FFFFFF" bg={C.red} radius={0.03} p={[0, 0.84, 0.08]} weight={900} />
        {NOTE_ROWS.map((r, i) => (
          <group key={r} position={[0, 0.42 - i * 0.37, 0.08]}>
            <Bx s={[0.22, 0.22, 0.01]} rad={0.04} c={C.ink} p={[-0.86, 0, 0]} cast={false} />
            <Bx s={[0.16, 0.16, 0.012]} rad={0.025} c="#FFFDF4" p={[-0.86, 0, 0.002]} cast={false} />
            <Sign text={r} w={1.4} h={0.32} size={0.22} color={C.ink} p={[0.0, 0, 0.003]} weight={800} />
          </group>
        ))}
        {/* ①번만 동그라미 */}
        <mesh position={[0, 0.42, 0.1]} scale={[1.5 * ringIn, 0.36 * ringIn, 1]} dispose={null}>
          <torusGeometry args={[0.72, 0.03, 8, 48]} />
          <meshBasicMaterial color={C.cobalt} toneMapped={false} />
        </mesh>
        <Sp rr={0.07} c={C.red} p={[0, 1.12, 0.1]} />
      </group>
      {/* 작업대 */}
      <Desk p={[-1.7, 0, -0.5]} w={4.6} d={1.5} h={0.95} c="#F7F7F2" />
      <Sign text="에듀테크 업체" w={2.4} h={0.44} size={0.25} color="#FFFFFF" bg={C.cobalt} radius={0.08} p={[-1.7, 0.6, 0.27]} weight={900} />
      {/* 설계도가 펼쳐집니다 */}
      <group position={[-2.9, 1.0, -0.5]}>
        <group scale={[roll, 1, 1]} position={[1.3 * roll, 0, 0]}>
          <Paint id="plan-v1" w={2.6} h={1.2} draw={drawPlan} lit em={0.2} r={[-Math.PI / 2, 0, 0]} p={[0, 0.006, 0]} />
        </group>
        <Cy rr={0.07} h={1.26} c="#F4F1E6" p={[2.6 * roll, 0.07, 0]} r={[Math.PI / 2, 0, 0]} vis={f >= b16.ph[1].start && roll < 0.98} />
        <Cy rr={0.07} h={1.26} c="#F4F1E6" p={[0, 0.07, 0]} r={[Math.PI / 2, 0, 0]} vis={f >= b16.ph[1].start} />
      </group>
      <group scale={[aIn, aIn, aIn]} position={[-0.2, 0, -1.45]}>
        <Person outfit={OUTFIT.engineer} pose={poseA} yaw={0.2} />
      </group>
      <group scale={[bIn, bIn, bIn]} position={[-3.3, 0, -1.45]}>
        <Person outfit={OUTFIT.engineerB} pose={poseB} yaw={0.1} />
      </group>
      {/* 안경 반짝 · 전구 */}
      <Burst frame={f} t0={b15.start + 16} p={[-0.2, 1.4, -1.0]} colors={["#FFFFFF", "#CFE0FF"]} n={8} reach={0.5} size={0.05} dur={12} />
      <Burst frame={f} t0={b15.start + 20} p={[-3.3, 1.4, -1.0]} colors={["#FFFFFF", "#CFE0FF"]} n={8} reach={0.5} size={0.05} dur={12} />
      <group position={[-0.2, 2.25 + Math.sin(f * 0.2) * 0.04, -1.3]} scale={[idea, idea, idea]}>
        <Sp rr={0.24} c="#FFE14D" em="#FFE14D" ei={1.1} cast={false} />
        <Cy rr={0.11} h={0.16} c={C.metal} p={[0, -0.27, 0]} />
      </group>
      <Burst frame={f} t0={b16.start + 4} p={[-0.2, 2.25, -1.3]} colors={["#FFE14D", "#FFFFFF"]} n={10} reach={0.9} size={0.06} dur={14} />
    </group>
  );
};

const S10: SceneDef = {
  id: "s10",
  name: "에듀테크 업체 — 첫 번째 계획",
  start: b15.start,
  end: b16.end,
  bg: "#E3EAF6",
  look: { ...DAY, fillColor: "#CFE0FF" },
  tallK: 2.1,
  cam: (f) =>
    camLive(
      camPath(f, [
        [b15.start, { p: [4.6, 4.6, 12.4], t: [-0.3, 1.6, -0.8], fov: 30 }],
        [b15.ph[1].start, { p: [4.0, 4.3, 11.4], t: [-0.1, 1.65, -0.8], fov: 30 }, E.out],
        [b16.start + 4, { p: [3.6, 4.1, 10.6], t: [0.2, 1.75, -1.0], fov: 30 }, E.io],
        [b16.ph[1].start + 10, { p: [2.6, 3.9, 9.4], t: [0.3, 1.7, -1.2], fov: 30 }, E.io],
        [b16.end, { p: [2.4, 3.8, 9.0], t: [0.3, 1.7, -1.2], fov: 30 }, E.lin],
      ]),
      f,
    ),
  World: S10World,
  Over: ({ f, pr, u, tall }) => {
    const row = pr([1.25, 2.67, -2.5]);
    return <Tag f={f} t0={circleT + 6} t1={b16.end - 4} at={row} dx={tall ? -160 : -230} dy={tall ? -210 : -150} text="넷 중 ①번만 손봄" tone="cobalt" u={u} />;
  },
};

// ── S11 · 장비를 달고, 설계도로는 완벽 ───────────────────────────────────────
const b17 = B.b17;
const b18 = B.b18;
const camT = b17.ph[0].start + 9;
const micT = b17.ph[1].start + 3;
const drvT = b17.ph[2].start + 4;

const S11World: React.FC<{ f: number }> = ({ f }) => {
  const look = f < micT ? 0.5 : f < drvT ? -0.6 : 0.9;
  return (
    <Classroom hour={10.2}>
      <Person
        p={[-2.2, 0, -1.9]}
        yaw={0.35}
        outfit={OUTFIT.teacher}
        pose={{ headYaw: look, headPitch: f < micT ? -0.35 : 0, eyes: "wide", mouth: "o", armL: [0.3, 0.2], armR: [0.3, 0.2], bounce: Math.abs(ring(f, camT, 0.14, 1, 0.22)) + Math.abs(ring(f, micT, 0.1, 1, 0.22)) }}
      />
      <Gadgets f={f} camT={camT} micT={micT} drvT={drvT} />
      <Burst frame={f} t0={camT} p={[CAM_AT[0], CAM_AT[1], CAM_AT[2]]} colors={["#FFFFFF", C.sky]} n={10} reach={1.0} size={0.07} dur={14} />
    </Classroom>
  );
};

const BpNote: React.FC<{ f: number; t0: number; x: number; y: number; text: string; u: number; w?: number }> = ({ f, t0, x, y, text, u, w = 150 }) => {
  if (f < t0) return null;
  const p = tw(f, t0, 8, E.out);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(0,-50%)", display: "flex", alignItems: "center", gap: 10 * u, opacity: p }}>
      <div style={{ width: w * u * p, height: 3 * u, background: "#fff" }} />
      <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30 * u, color: "#fff", letterSpacing: "0.02em", border: `${3 * u}px solid #fff`, padding: `${6 * u}px ${14 * u}px`, borderRadius: 6 * u, whiteSpace: "nowrap" }}>{text}</div>
    </div>
  );
};

const S11: SceneDef = {
  id: "s11",
  name: "교실 — 장비 3종과 설계도",
  start: b17.start,
  end: b18.end,
  bg: C.paper,
  look: DAY,
  enter: "whip",
  blueprint: (f) => (f >= b18.start ? 1 : 0),
  cam: (f) =>
    camLive(
      camPath(f, [
        [b17.start, { p: [8.8, 6.6, 11.4], t: [0.5, 1.6, -0.4], fov: 30 }],
        [b17.end, { p: [8.0, 6.2, 10.6], t: [0.6, 1.6, -0.4], fov: 30 }, E.lin],
        [b18.end, { p: [7.6, 6.4, 11.4], t: [0.6, 1.5, -0.4], fov: 30 }, E.out],
      ]),
      f,
      { shakeAt: [camT], shakeAmp: 0.12 },
    ),
  World: S11World,
  Over: ({ f, pr, u, w, h, tall }) => {
    const cam = pr([CAM_AT[0], CAM_AT[1], CAM_AT[2]]);
    const mic = pr([MIC_AT[0] - 0.6, 2.2, MIC_AT[2]]);
    const drv = pr([DRV_AT[0], 1.5, DRV_AT[2] + 0.3]);
    const bp = f >= b18.start;
    return (
      <>
        {!bp && (
          <>
            <Tag f={f} t0={camT + 6} t1={b17.end - 2} at={cam} dx={tall ? -40 : 150} dy={-110} text="4K 카메라" tone="cobalt" u={u} />
            <Tag f={f} t0={micT + 8} t1={b17.end - 2} at={mic} dx={tall ? 30 : -70} dy={tall ? -120 : 230} text="지향성 마이크" tone="cobalt" u={u} />
            <Tag f={f} t0={drvT + 18} t1={b17.end - 2} at={drv} dx={tall ? -170 : 90} dy={tall ? -150 : -150} text="저장 장치 ×5" tone="cobalt" u={u} />
          </>
        )}
        {bp && (
          <>
            {/* 설계도 전환 순간의 플래시 */}
            <AbsoluteFill style={{ background: "#fff", opacity: 1 - tw(f, b18.start, 5, E.out) }} />
            <BpNote f={f} t0={b18.start + 4} x={cam.x + 50 * u} y={cam.y - 30 * u} text="CAM-01" u={u} />
            <BpNote f={f} t0={b18.start + 7} x={mic.x + 40 * u} y={mic.y} text="MIC-01" u={u} w={90} />
            <BpNote f={f} t0={b18.start + 10} x={drv.x + 60 * u} y={drv.y} text="HDD ×5" u={u} w={70} />
            <Stamp f={f} t0={b18.ph[1].start + 2} t1={b18.end - 3} text="설계상 문제없음 ✓" x={w * (tall ? 0.5 : 0.36)} y={h * (tall ? 0.3 : 0.34)} u={u} size={tall ? 70 : 84} color="#FFFFFF" bg="rgba(30,72,196,0.86)" rotate={-8} />
          </>
        )}
      </>
    );
  },
};

// ── S12 · 그래도 전부 선생님 손 — 멘탈은 그대로 ──────────────────────────────
const b19 = B.b19;
const b20 = B.b20;
const b21 = B.b21;
const ST_X = [-3.6, -1.2, 1.2, 3.6];
const ST_Z = 1.5;
const ST_LABEL = ["버튼", "파일", "업로드", "체크"];
const visit = (i: number) => b20.ph[i].start + 4;
const snapT = b21.ph[1].start;

const S12World: React.FC<{ f: number }> = ({ f }) => {
  // 선생님이 스테이션 사이를 뛰어다닙니다.
  const stops: Array<[number, V3]> = [[b19.start, [-1.6, 0, -0.9]], ...ST_X.map((x, i) => [visit(i), [x, 0, ST_Z - 0.85] as V3] as [number, V3]), [b21.start + 8, [0, 0, 0.55]]];
  let pos: V3 = stops[0][1];
  let vx = 0;
  for (let i = 1; i < stops.length; i++) {
    const [t1, p1] = stops[i];
    const p0 = stops[i - 1][1];
    const k = clamp((f - (t1 - 7)) / 7);
    if (f >= t1 - 7) {
      const e = E.io(k);
      pos = [lerp(p0[0], p1[0], e), 0, lerp(p0[2], p1[2], e)];
      vx = k > 0 && k < 1 ? Math.sign(p1[0] - p0[0]) : 0;
    }
  }
  const amt = f >= snapT ? tw(f, snapT, 5) : 0;
  const cur = ST_X.findIndex((_, i) => f >= visit(i) && f < visit(i) + 12);
  const pose: Pose =
    f >= snapT
      ? panic(f, 1.3, amt)
      : f < b20.start
        ? { headYaw: Math.sin(f * 0.45) * 0.9, eyes: "wide", mouth: "wavy", brow: 1, armL: [0.9, 0.2], armR: [0.9, 0.2], bounce: Math.abs(Math.sin(f * 0.5)) * 0.04 }
        : { lean: -vx * 0.3, armL: [0.3, cur >= 0 ? 1.3 : 0.6], armR: [0.3, cur >= 0 ? 1.3 : 0.6], eyes: "wide", mouth: "open", brow: 1, bounce: vx !== 0 ? 0.12 : Math.abs(ring(f, cur >= 0 ? visit(cur) : -99, 0.08, 1.1, 0.25)), squash: vx !== 0 ? 0.92 : 1 };
  const soulK = clamp((f - (snapT + 5)) / 34);
  return (
    <Classroom hour={10.6} desks={false}>
      <Gadgets f={f} camT={-99} micT={-99} drvT={-99} alert={f < b21.start} />
      {ST_X.map((x, i) => {
        const v = visit(i);
        const hit = ring(f, v, 0.2, 1.2, 0.2);
        const on = f >= v;
        return (
          <group key={i} position={[x, 0, ST_Z]}>
            <Cy rr={[0.56, 0.62]} h={0.62} c="#FFFDF6" p={[0, 0.31, 0]} seg={36} />
            <Sign text={ST_LABEL[i]} w={0.9} h={0.3} size={0.2} color="#FFFFFF" bg={C.ink} radius={0.07} p={[0, 0.3, 0.63]} weight={900} />
            {i === 0 && <RecButton p={[0, 0.62, 0]} sc={0.62} press={on ? clamp(1 - (f - v) / 9) : 0} glow={on ? 1.2 : 0.3} />}
            {i === 1 && <FileCube p={[0, 0.62 + Math.abs(hit) * 2.2, 0]} size={0.6} c={C.amber} label="MP4" r={[0, on ? (f - v) * 0.14 : 0, 0]} />}
            {i === 2 && (
              <>
                <Cloud p={[0, 1.95, 0]} sc={0.62} em={on ? 0.5 : 0.1} />
                <Arrow p={[0, 0.7, 0]} len={0.3 + tw(f, v, 8, E.back) * 0.7} c={on ? C.cobalt : "#B9B4A6"} w={0.13} />
              </>
            )}
            {i === 3 && (
              <>
                <Bx s={[0.62, 0.8, 0.06]} rad={0.03} c="#FFFDF4" p={[0, 1.08, 0]} r={[-0.25, 0, 0]} />
                <Bx s={[0.26, 0.1, 0.08]} rad={0.03} c={C.metalDark} p={[0, 1.46, -0.09]} r={[-0.25, 0, 0]} />
                <Check p={[0, 1.1, 0.1]} sc={0.9 * pop(f, v, 9)} />
              </>
            )}
            <Burst frame={f} t0={v} p={[0, 0.8, 0]} colors={["#FFFFFF", C.amber]} n={8} reach={0.8} size={0.06} dur={12} />
          </group>
        );
      })}
      <Person p={pos} outfit={OUTFIT.teacher} pose={pose} />
      <Sweat frame={f} t0={b19.start + 6} p={[pos[0], 1.5, pos[2] + 0.1]} n={5} />
      {soulK > 0 && <Soul frame={f} p={[pos[0] + Math.sin(f * 0.13) * 0.15, 1.95 + E.out(soulK) * 0.7, pos[2] + 0.1]} sc={1.1 * E.back(clamp(soulK * 3))} />}
    </Classroom>
  );
};

const S12: SceneDef = {
  id: "s12",
  name: "교실 — 그래도 전부 선생님 손",
  start: b19.start,
  end: b21.end,
  bg: C.paper,
  look: DAY,
  cam: (f) =>
    camLive(
      camPath(f, [
        [b19.start, { p: [8.6, 6.4, 11.2], t: [0.5, 1.6, -0.4], fov: 30 }],
        [b20.start - 6, { p: [8.0, 6.0, 10.6], t: [0.5, 1.6, -0.4], fov: 30 }, E.lin],
        [b20.start + 8, { p: [0.4, 5.0, 13.6], t: [0, 1.25, 0.3], fov: 30 }, E.io],
        [b21.start, { p: [0.8, 4.8, 13.0], t: [0, 1.25, 0.3], fov: 30 }, E.lin],
        [snapT + 4, { p: [1.3, 3.3, 8.2], t: [0, 2.0, 0.5], fov: 30, roll: -0.04 }, E.io],
        [b21.end, { p: [1.6, 3.2, 7.7], t: [0, 2.05, 0.5], fov: 30, roll: -0.045 }, E.lin],
      ]),
      f,
      { shakeAt: [snapT + 1, ...ST_X.map((_, i) => visit(i))], shakeAmp: 0.12 },
    ),
  World: S12World,
  Over: ({ f, pr, u, w, h, tall }) => {
    const cam = pr([CAM_AT[0], CAM_AT[1] + 0.4, CAM_AT[2]]);
    return (
      <>
        <Tag f={f} t0={b19.ph[1].start + 2} t1={b20.start - 3} at={cam} dx={tall ? -60 : -180} dy={-100} text="챙길 장비만 3개 늘어남" tone="red" u={u} />
        <Slam f={f} t0={snapT} t1={b21.end - 5} lines={["그대로였죠"]} u={u} size={tall ? 150 : 150} tone="red" x={0.5} y={tall ? 0.29 : 0.17} w={w} h={h} />
      </>
    );
  },
};

void Sp;
export const ACT2: SceneDef[] = [S10, S11, S12];

import React from "react";
import { C } from "../lib/theme";
import { V3 } from "../lib/motion";
import { Bx, Clock, Cy, Desk, Paint, Sign, Slab } from "../three/kit";
import { clamp, E, rnd } from "../lib/motion";

// 여러 장면이 같이 쓰는 세트(교실). 장면마다 카메라·소품·상태가 달라집니다.

const drawBoard = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
  ctx.fillStyle = C.board;
  ctx.fillRect(0, 0, W, H);
  // 분필 자국
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 40; i++) {
    const x = ((i * 137) % 100) / 100;
    const y = ((i * 61) % 100) / 100;
    ctx.fillRect(x * W, y * H, W * 0.18, H * 0.012);
  }
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = "#F8F6EC";
  ctx.font = `800 ${H * 0.2}px "Pretendard"`;
  ctx.textBaseline = "middle";
  ctx.fillText("오늘의 수업", W * 0.07, H * 0.24);
  ctx.strokeStyle = "#F6D35B";
  ctx.lineWidth = H * 0.022;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(W * 0.07, H * 0.38);
  ctx.lineTo(W * 0.47, H * 0.38);
  ctx.stroke();
  ctx.strokeStyle = "#F8F6EC";
  ctx.lineWidth = H * 0.016;
  // 도형과 줄글 낙서
  ctx.beginPath();
  ctx.moveTo(W * 0.66, H * 0.72);
  ctx.lineTo(W * 0.78, H * 0.28);
  ctx.lineTo(W * 0.9, H * 0.72);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W * 0.78, H * 0.2, H * 0.05, 0, Math.PI * 2);
  ctx.stroke();
  [0.52, 0.64, 0.76].forEach((y, i) => {
    ctx.beginPath();
    ctx.moveTo(W * 0.08, H * y);
    ctx.lineTo(W * (0.5 - i * 0.07), H * y);
    ctx.stroke();
  });
  ctx.fillStyle = "#F4A79A";
  ctx.font = `800 ${H * 0.1}px "Pretendard"`;
  ctx.fillText("★ 시험에 나옴", W * 0.08, H * 0.89);
};

export const BOARD = { w: 4.5, h: 1.75, y: 1.82, z: -3.0 };

export const Board: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <group position={[-0.5, BOARD.y, BOARD.z]}>
    <Bx s={[BOARD.w + 0.26, BOARD.h + 0.26, 0.1]} rad={0.04} c={C.boardFrame} />
    <Paint id="board" w={BOARD.w} h={BOARD.h} draw={drawBoard} lit em={0.12 + glow} p={[0, 0, 0.056]} />
    <Bx s={[BOARD.w * 0.6, 0.07, 0.16]} rad={0.02} c={C.boardFrame} p={[0, -BOARD.h / 2 - 0.12, 0.1]} />
    <Bx s={[0.22, 0.05, 0.06]} rad={0.015} c="#FFFFFF" p={[-0.6, -BOARD.h / 2 - 0.07, 0.12]} />
    <Bx s={[0.3, 0.09, 0.1]} rad={0.02} c="#5A5F6B" p={[0.5, -BOARD.h / 2 - 0.05, 0.12]} />
  </group>
);

/** 낙서 없는 칠판 인쇄면(보존 카드·복제용) */
export const BoardCopy: React.FC<{ p: V3; sc: number; r?: V3; glow?: number; op?: number }> = ({ p, sc, r, glow = 0.6, op = 1 }) => (
  <group position={p} rotation={r ?? [0, 0, 0]} scale={sc}>
    <Bx s={[BOARD.w + 0.1, BOARD.h + 0.1, 0.05]} rad={0.03} c="#FFFDF4" em="#FFF6C8" ei={glow} op={op} cast={false} />
    <Paint id="board" w={BOARD.w} h={BOARD.h} draw={drawBoard} lit em={0.3 + glow} op={op} p={[0, 0, 0.03]} />
  </group>
);

export const DESK_X = [-2.5, 0, 2.5];
export const DESK_Z = [0.7, 2.15];
export const TEACHER_DESK: V3 = [3.0, 0, -1.55];

export const Classroom: React.FC<{ hour?: number; clockJolt?: number; boardGlow?: number; desks?: boolean; children?: React.ReactNode; floor?: string; wall?: string }> = ({
  hour = 2.6,
  clockJolt = 0,
  boardGlow = 0,
  desks = true,
  children,
  floor = "#EBD3AA",
  wall = "#D6E4DF",
}) => (
  <group>
    <Slab w={9.6} d={7.2} c={floor} edge="#C9A46E" />
    {/* 뒷벽 */}
    <Bx s={[9.4, 3.5, 0.22]} rad={0.06} c={wall} p={[0, 1.75, -3.35]} />
    <Bx s={[9.42, 0.5, 0.26]} rad={0.05} c="#B9CFC8" p={[0, 0.25, -3.34]} />
    <Board glow={boardGlow} />
    <Clock p={[3.55, 2.72, -3.2]} hour={hour} r={[0, 0, clockJolt]} />
    {/* 교탁 */}
    <Desk p={TEACHER_DESK} w={1.75} d={0.86} h={0.8} />
    {desks &&
      DESK_Z.map((z) =>
        DESK_X.map((x) => (
          <group key={`${x}|${z}`} position={[x, 0, z]}>
            <Desk w={1.25} d={0.7} h={0.6} c="#E5B77C" />
          </group>
        )),
      )}
    {children}
  </group>
);

/** 수업 후 작업 네 덩어리(1막에서 쌓이고, 3막에서 통째로 넘어갑니다) */
export const CHORES = [
  { label: "촬영", c: "#F0553A" },
  { label: "편집", c: "#F6B73C" },
  { label: "업로드", c: "#5BA7E8" },
  { label: "시청 체크", c: "#9B7BE0" },
] as const;

export const CHORE_SIZE: V3 = [1.7, 0.62, 0.95];

// ── 나무 구조(3막의 시그니처) ─────────────────────────────────────────────────
// 땅에서 솟은 줄기가 '수업' 받침을 떠받치고, 가지 넷이 모서리를 잡습니다.
export const TREE_H = 3.1;
export const treeTop = (grow: number) => 0.3 + (TREE_H + 0.95) * grow;
const LEAF = ["#3FB86B", "#2E9E59", "#7BD68F", "#C8F05A"];
const AUTOS: Array<{ text: string; p: V3 }> = [
  { text: "자동 촬영", p: [-2.95, 3.0, 1.75] },
  { text: "자동 업로드", p: [2.95, 3.0, 1.75] },
  { text: "자동 시청 체크", p: [-2.6, 1.65, 1.5] },
  { text: "자동 관리", p: [2.6, 1.65, 1.5] },
];

export const Tree: React.FC<{
  f: number;
  /** 줄기 성장 0→1 */
  grow: number;
  /** 가지 0→1 */
  branch: number;
  /** 잎 0→1 (생략하면 가지와 같이) */
  leaves?: number;
  /** 뿌리 0→2 (1 = 기본, 2 = 더 넓고 굵게) */
  roots: number;
  /** 줄기 굵기 배율 */
  thick?: number;
  /** 받침 기울기(라디안) */
  tilt?: number;
  /** 팻말 0→1 */
  signs?: number;
  children?: React.ReactNode;
}> = ({ f, grow, branch, leaves, roots, thick = 1, tilt = 0, signs = 0, children }) => {
  const lf = leaves ?? branch;
  const top = treeTop(grow);
  const tr = TREE_H * grow;
  return (
    <group>
      {/* 흙 둔덕 */}
      <Cy rr={[2.3, 2.7]} h={0.3} c="#D6C7A3" p={[0, -0.12, 0]} seg={48} />
      <Cy rr={[1.2, 1.5]} h={0.18} c="#B99B6B" p={[0, 0.1, 0]} seg={40} />
      {/* 뿌리 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const extra = i >= 6;
        const k = clamp(extra ? roots - 1 : roots);
        if (k <= 0) return null;
        const a = (i / 6) * Math.PI * 2 + (extra ? 0.52 : 0);
        const len = (extra ? 2.5 : 1.75) * E.out(k);
        const th = (extra ? 0.26 : 0.34) * (0.8 + clamp(roots - 1) * 0.45);
        return (
          <group key={i} rotation={[0, a, 0]}>
            <Bx s={[1, 0.3, 0.42]} rad={0.1} c={i % 2 ? "#7A4E2B" : "#8A5A33"} p={[0.3 + len / 2, 0.16, 0]} sc={[len, th / 0.3, th / 0.34]} />
          </group>
        );
      })}
      {/* 줄기 */}
      {Array.from({ length: 5 }).map((_, i) => {
        const y0 = (i / 5) * tr;
        const h = tr / 5;
        if (h < 0.01) return null;
        const w = (0.98 - i * 0.07) * thick;
        return <Bx key={i} s={[1, 1, 1]} rad={0.08} c={i % 2 ? "#7A4E2B" : "#8A5A33"} p={[(rnd(i) - 0.5) * 0.06, 0.2 + y0 + h / 2, 0]} sc={[w, h * 1.04, w]} />;
      })}
      {/* 받침을 잡는 가지 넷 + 팻말용 아래 가지 둘 */}
      {branch > 0 &&
        [
          [-1, 1],
          [1, 1],
          [-1, -1],
          [1, -1],
        ].map(([sx, sz], i) => {
          const from: V3 = [0, 0.2 + tr * 0.94, 0];
          const to: V3 = [sx * 1.5, top - 0.14, sz * 0.9];
          const d = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
          const len = Math.hypot(d[0], d[1], d[2]) * E.out(clamp(branch));
          const yaw = Math.atan2(-d[2], d[0]);
          const pitch = Math.atan2(d[1], Math.hypot(d[0], d[2]));
          return (
            <group key={i} position={from} rotation={[0, yaw, 0]}>
              <group rotation={[0, 0, pitch]}>
                <Bx s={[1, 0.36, 0.36]} rad={0.1} c="#8A5A33" p={[len / 2, 0, 0]} sc={[len, thick, thick]} />
              </group>
            </group>
          );
        })}
      {branch > 0 &&
        [-1, 1].map((sx) => {
          const len = 2.0 * E.out(clamp(branch));
          return (
            <group key={sx} position={[0, 0.2 + tr * 0.52, 0.2]} rotation={[0, sx > 0 ? -0.2 : Math.PI + 0.2, 0]}>
              <group rotation={[0, 0, 0.42]}>
                <Bx s={[1, 0.3, 0.3]} rad={0.09} c="#7A4E2B" p={[len / 2, 0, 0]} sc={[len, thick, thick]} />
              </group>
            </group>
          );
        })}
      {/* 잎 */}
      {Array.from({ length: 22 }).map((_, i) => {
        const k = clamp(lf * 1.7 - i * 0.03);
        if (k <= 0) return null;
        const side = i % 2 ? 1 : -1;
        const low = i >= 16;
        const base: V3 = low ? [side * (2.0 + rnd(i) * 0.5), 0.2 + tr * 0.52 + 0.75 + rnd(i + 5) * 0.4, 0.3 + (rnd(i + 2) - 0.5) * 0.7] : [side * (1.0 + rnd(i) * 1.5), top - 0.55 - rnd(i + 3) * 0.75, (rnd(i + 7) - 0.5) * 2.5];
        const s = (0.34 + rnd(i * 3) * 0.3) * E.back(k);
        const flutter = Math.sin(f * 0.11 + i) * 0.06;
        return <Bx key={i} s={[1, 1, 1]} rad={0.2} c={LEAF[i % LEAF.length]} p={[base[0], base[1] + flutter, base[2]]} r={[rnd(i) * 0.6, rnd(i + 1) * 1.2 + flutter, rnd(i + 2) * 0.6]} sc={s} />;
      })}
      {/* 가지에 걸린 팻말 */}
      {AUTOS.map((a, i) => {
        const k = clamp(signs * 4 - i);
        if (k <= 0) return null;
        const sw = Math.sin(f * 0.13 + i * 1.7) * 0.05;
        return (
          <group key={i} position={a.p} rotation={[0, 0, sw]} scale={E.back(k)}>
            <Bx s={[1.86, 0.5, 0.08]} rad={0.08} c={C.forest} />
            <Sign text={a.text} w={1.74} h={0.4} size={0.215} color={C.forest} bg={C.lime} radius={0.07} p={[0, 0, 0.046]} weight={900} />
            <Cy rr={0.014} h={0.34} c={C.ink} p={[-0.6, 0.4, 0]} />
            <Cy rr={0.014} h={0.34} c={C.ink} p={[0.6, 0.4, 0]} />
          </group>
        );
      })}
      {/* '수업' 받침 */}
      <group position={[0, top, 0]} rotation={[0, 0, tilt]}>
        <Bx s={[3.8, 0.26, 2.5]} rad={0.08} c={C.forest} p={[0, -0.02, 0]} />
        <Bx s={[3.6, 0.1, 2.3]} rad={0.04} c="#EBD3AA" p={[0, 0.13, 0]} />
        <group position={[0, 0.18, 0]}>{children}</group>
      </group>
    </group>
  );
};

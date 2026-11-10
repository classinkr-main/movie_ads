import React, { useId } from "react";
import { useCurrentFrame } from "remotion";
import { Hatch, Stroke, useBoil } from "./Ink";
import { blob, jitter, roughEllipse, roughLine, roughPoly, spline } from "./sketch";
import type { Pt } from "./sketch";
import { P } from "./theme";

// 연두 갈매기 — 로컬 좌표의 원점은 두 발 사이 바닥. 몸 높이는 약 320.
// 정면을 보고 서 있고, 날 때는 양 날개를 퍼덕인다.

const BODY: Pt[] = [
  [0, -274],
  [50, -264],
  [92, -228],
  [114, -176],
  [121, -122],
  [108, -70],
  [72, -38],
  [0, -28],
  [-72, -38],
  [-108, -70],
  [-121, -122],
  [-114, -176],
  [-92, -228],
  [-50, -264],
];

// 어깨 관절 기준, +x 방향으로 뻗은 날개
const WING: Pt[] = [
  [-12, -16],
  [16, -30],
  [50, -31],
  [80, -18],
  [98, 2],
  [85, 9],
  [82, 22],
  [65, 21],
  [58, 32],
  [38, 28],
  [12, 23],
  [-12, 10],
];

const SHOULDER: Pt = [90, -158];
const WING_TIP = 92;

export const GULL_BODY = BODY;
export const GULL_SHOULDER = SHOULDER;
/** 날개에 쥔 소품의 원점까지 거리(어깨 기준) */
export const GULL_GRIP = WING_TIP - 14;

const leafPts = (len: number, w: number): Pt[] => [
  [0, 5],
  [-w * 0.92, -len * 0.3],
  [-w * 0.7, -len * 0.72],
  [0, -len],
  [w * 0.7, -len * 0.72],
  [w * 0.92, -len * 0.3],
];
const FOOT_PTS: Pt[] = [
  [0, -9],
  [-14, -7],
  [-23, 1],
  [-17, 9],
  [-8, 3],
  [-4, 10],
  [4, 10],
  [8, 3],
  [17, 9],
  [23, 1],
  [14, -7],
];
const BEAK_PTS: Pt[] = [
  [-17, -173],
  [0, -182],
  [17, -173],
  [9, -160],
  [0, -152],
  [-9, -160],
];

const win = (v: number, a: number, b: number) => Math.max(0, Math.min(1, (v - a) / (b - a)));

export type GullProps = {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  /** 몸 기울기(deg) */
  rotate?: number;
  /** + 면 납작, − 면 길쭉 */
  squash?: number;
  /** 바닥에서 뜬 높이(px, 스케일 전) */
  lift?: number;
  /** 날개 각도(deg). 68 = 내린 상태, 음수 = 들어 올림 */
  wingL?: number;
  wingR?: number;
  wingLen?: number;
  eyes?: "auto" | "open" | "closed" | "happy" | "wide";
  look?: readonly [number, number];
  /** 부리 벌림 0~1 */
  beak?: number;
  tuft?: number;
  blush?: number;
  feet?: "stand" | "tuck";
  shadow?: number;
  /** 선만 그리는 스케치 단계: 0~1 드로온 */
  draw?: number;
  mono?: boolean;
  seed?: string;
  /** 오른쪽 날개 끝에 쥔 소품(원점 = 날개 끝, +x = 바깥쪽) */
  hold?: React.ReactNode;
  holdL?: React.ReactNode;
  sweat?: number;
  bob?: boolean;
  blinkOffset?: number;
};

export const Gull: React.FC<GullProps> = ({
  x,
  y,
  scale = 1,
  flip = false,
  rotate = 0,
  squash = 0,
  lift = 0,
  wingL = 68,
  wingR = 68,
  wingLen = 1,
  eyes = "auto",
  look = [0, 0],
  beak = 0,
  tuft = 0,
  blush = 1,
  feet = "stand",
  shadow = 1,
  draw = 1,
  mono = false,
  seed = "gull",
  hold,
  holdL,
  sweat = 0,
  bob = true,
  blinkOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const b = useBoil(4, 3);
  const id = useId().replace(/:/g, "");
  /** 부위별 seed — "이름+부위:boil" 꼴이라 고정 비뚤빼뚤함은 유지되고 boil만 살짝 떨린다 */
  const sd = (k: string) => `${seed}${k}:${b}`;

  const breathe = bob ? Math.sin(frame / 9) * 0.012 : 0;
  const sq = squash + breathe;

  // 눈 깜빡임
  const bf = (frame + blinkOffset) % 96;
  const blinking = bf < 3 || (bf >= 9 && bf < 11);
  const eyeMode = eyes === "auto" ? (blinking ? "closed" : "open") : eyes;

  const fillOf = (c: string) => (mono ? P.paper : c);
  const dBody = win(draw, 0, 0.42);
  const dTuft = win(draw, 0.3, 0.55);
  const dFace = win(draw, 0.5, 0.68);
  const dWing = win(draw, 0.6, 0.86);
  const dFeet = win(draw, 0.78, 1);

  const bodyFill = blob(BODY, `${seed}bf`, 0.6);
  const bj = jitter(BODY, sd("b"), 3.5);
  const bodyLine = spline([...bj, [bj[0][0] + 3, bj[0][1] + 2], jitter(BODY, sd("b2"), 4.2)[1]], false);

  const wingPts = WING.map((p) => [p[0] * (p[0] > 0 ? wingLen : 1), p[1]] as const);
  const wingFill = blob(wingPts, `${seed}wf`, 0.5);
  const wingLine = (side: number) => `${spline(jitter(wingPts, sd(`w${side}`), 2.7), true)}Z`;

  const wing = (side: 1 | -1, angle: number, prop?: React.ReactNode) => (
    <g transform={`translate(${SHOULDER[0] * side} ${SHOULDER[1]}) scale(${side} 1) rotate(${angle})`}>
      <path d={wingFill} fill={fillOf(P.limeDeep)} transform={mono ? undefined : "translate(2.5 3)"} />
      {!mono && (
        <g clipPath={`url(#${id}w)`} transform="translate(2.5 3)">
          <path d={`M${74 * wingLen},-44 L${116 * wingLen},-44 L${116 * wingLen},44 L${58 * wingLen},44Z`} fill={P.forest} opacity={0.92} />
        </g>
      )}
      <Stroke d={wingLine(side)} w={5} draw={dWing} />
      {/* 깃 결 */}
      <Stroke d={roughLine([36 * wingLen, -14], [40 * wingLen, 16], sd(`wf${side}`), 0.5)} w={3.2} draw={dWing} color={mono ? P.ink : P.limeInk} />
      {prop && <g transform={`translate(${WING_TIP * wingLen - 14} 2)`}>{prop}</g>}
    </g>
  );

  const eye = (side: 1 | -1) => {
    const ex = 38 * side + look[0];
    const ey = -186 + look[1];
    if (dFace <= 0) return null;
    if (eyeMode === "closed") return <Stroke d={`M${ex - 11},${ey} Q${ex},${ey + 8} ${ex + 11},${ey}`} w={5} />;
    if (eyeMode === "happy") return <Stroke d={`M${ex - 12},${ey + 4} Q${ex},${ey - 13} ${ex + 12},${ey + 4}`} w={5.5} />;
    const r = (eyeMode === "wide" ? 12.5 : 10.5) * (0.4 + 0.6 * dFace);
    return (
      <g>
        <ellipse cx={ex} cy={ey} rx={r} ry={r * 1.08} fill={P.ink} />
        <circle cx={ex - r * 0.32} cy={ey - r * 0.38} r={r * 0.34} fill="#fff" />
        {eyeMode === "wide" && <circle cx={ex + r * 0.3} cy={ey + r * 0.34} r={r * 0.16} fill="#fff" />}
      </g>
    );
  };

  const o = Math.max(0, Math.min(1, beak));
  const leg = (side: 1 | -1) => (
    <g transform={`translate(${32 * side} ${feet === "tuck" ? -20 : 0})`}>
      <Stroke d={roughLine([-2 * side, -36], [0, -6], sd(`lg${side}`), 0.4)} color={mono ? P.ink : P.orangeDeep} w={7} draw={dFeet} />
      <g transform={`rotate(${feet === "tuck" ? 18 * side : 0})`}>
        <path d={blob(FOOT_PTS, `${seed}ft${side}`, 0.6)} fill={fillOf(P.orange)} />
        <Stroke d={`${spline(jitter(FOOT_PTS, sd(`f${side}`), 1.2), true)}Z`} w={4} draw={dFeet} />
      </g>
    </g>
  );

  const shadowScale = Math.max(0.35, 1 - lift / 520);

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {shadow > 0 && !mono && (
        <ellipse cx={0} cy={6} rx={104 * shadowScale} ry={13 * shadowScale} fill={P.ink} opacity={0.11 * shadow * shadowScale} />
      )}
      <g transform={`scale(${flip ? -1 : 1} 1) translate(0 ${-lift}) rotate(${rotate} 0 -150) scale(${1 + sq} ${1 - sq})`}>
        {/* 다리·발 */}
        {leg(-1)}
        {leg(1)}

        {/* 머리 깃 */}
        <g transform={`translate(0 -266) rotate(${tuft})`}>
          {([-38, 38, 0] as const).map((a) => (
            <g key={a} transform={`rotate(${a + tuft * 0.5})`}>
              <path d={blob(leafPts(a === 0 ? 54 : 40, a === 0 ? 16 : 13), `${seed}lf${a}`, 0.8)} fill={fillOf(P.limeDeep)} />
              <Stroke d={`${spline(jitter(leafPts(a === 0 ? 54 : 40, a === 0 ? 16 : 13), sd(`l${a}`), 1.7), true)}Z`} w={4.5} draw={dTuft} />
            </g>
          ))}
        </g>

        {/* 몸 */}
        <clipPath id={`${id}b`}>
          <path d={bodyFill} />
        </clipPath>
        <clipPath id={`${id}w`}>
          <path d={wingFill} />
        </clipPath>
        <path d={bodyFill} fill={fillOf(P.lime)} transform={mono ? undefined : "translate(3 4)"} />
        {!mono && (
          <g clipPath={`url(#${id}b)`}>
            <Hatch box={[40, -150, 94, 124]} seed={`${seed}sh`} color={P.limeDeep} w={3} gap={13} angle={-58} opacity={0.55} />
            <path d={`${roughEllipse(0, -84, 80, 58, `${seed}belly`, { overlap: 0, rough: 0.6 })}Z`} fill={P.sheet} transform="translate(3 4)" />
          </g>
        )}
        <Stroke d={bodyLine} w={5.5} draw={dBody} />

        {/* 볼 */}
        {!mono && blush > 0 && (
          <g opacity={0.8 * blush}>
            <ellipse cx={-72} cy={-160} rx={15} ry={9.5} fill={P.blush} />
            <ellipse cx={72} cy={-160} rx={15} ry={9.5} fill={P.blush} />
          </g>
        )}

        {/* 눈 */}
        {eye(-1)}
        {eye(1)}

        {/* 부리 */}
        {dFace > 0 && (
          <g transform={`translate(${look[0] * 0.5} ${look[1] * 0.5})`}>
            {o > 0.02 && (
              <g>
                <path d={`M-13,-166 Q0,${-152 + o * 24} 13,-166Z`} fill={fillOf("#B8432B")} />
                <Stroke d={`M-13,-166 Q0,${-152 + o * 24} 13,-166`} w={4} />
              </g>
            )}
            <path d={blob(BEAK_PTS, `${seed}bkf`, 0.5)} fill={fillOf(P.orange)} transform={mono ? undefined : "translate(1 1.5)"} />
            <Stroke d={`${spline(jitter(BEAK_PTS, sd("bk"), 1.3), true)}Z`} w={4.5} draw={dFace} />
          </g>
        )}

        {/* 땀방울 */}
        {sweat > 0 && (
          <g opacity={sweat}>
            <path d="M104,-246 q-9,15 0,21 q9,-6 0,-21Z" fill="#fff" stroke={P.ink} strokeWidth={3.5} strokeLinejoin="round" />
            <path d="M126,-214 q-6,10 0,14 q6,-4 0,-14Z" fill="#fff" stroke={P.ink} strokeWidth={3} strokeLinejoin="round" />
          </g>
        )}

        {/* 날개 */}
        {wing(-1, wingL, holdL)}
        {wing(1, wingR, hold)}
      </g>
    </g>
  );
};

/** 연필 소품 — 원점은 쥐는 지점, +x 방향이 심 끝 */
export const Pencil: React.FC<{ scale?: number; rotate?: number; seed?: string }> = ({ scale = 1, rotate = 0, seed = "pencil" }) => {
  const b = useBoil(4, 3);
  /** 부위별 seed — "이름+부위:boil" 꼴이라 고정 비뚤빼뚤함은 유지되고 boil만 살짝 떨린다 */
  const sd = (k: string) => `${seed}${k}:${b}`;
  const body: Pt[] = [
    [-52, -9],
    [50, -9],
    [50, 9],
    [-52, 9],
  ];
  const tip: Pt[] = [
    [50, -9],
    [80, 0],
    [50, 9],
  ];
  const er: Pt[] = [
    [-68, -9],
    [-52, -9],
    [-52, 9],
    [-68, 9],
  ];
  return (
    <g transform={`rotate(${rotate}) scale(${scale})`}>
      <path d={`${roughPoly(er, `${seed}ef`, { closed: true, rough: 0.4 })}Z`} fill={P.blush} />
      <path d={`${roughPoly(body, `${seed}bf`, { closed: true, rough: 0.4 })}Z`} fill={P.note} transform="translate(1.5 2)" />
      <path d={`${roughPoly(tip, `${seed}tf`, { closed: true, rough: 0.4 })}Z`} fill="#F6DDB6" />
      <path d="M70,-3.2 L80,0 L70,3.2Z" fill={P.ink} />
      <Stroke d={roughPoly(er, sd("e"), { closed: true, rough: 0.45 })} w={3.5} />
      <Stroke d={roughPoly(body, sd("b"), { closed: true, rough: 0.45 })} w={3.5} />
      <Stroke d={roughPoly(tip, sd("t"), { closed: false, rough: 0.45 })} w={3.5} />
      <Stroke d={roughLine([-40, -9], [-40, 9], sd("f"), 0.3)} w={3} />
      <Stroke d={roughLine([-30, 0], [40, 0], sd("m"), 0.3)} w={2.2} color={P.noteDeep} />
    </g>
  );
};

/** 날갯짓 각도(대칭) — 위아래로 퍼덕인다 */
export const flap = (frame: number, speed = 0.9, up = -52, down = 30) => {
  const t = (Math.sin(frame * speed) + 1) / 2;
  return up + (down - up) * t;
};

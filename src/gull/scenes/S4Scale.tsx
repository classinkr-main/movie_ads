import React, { useId } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Gull, Pencil, flap } from "../Gull";
import { Label, Stroke, ease, pop, prog, useBoil } from "../Ink";
import { Canvas, Paper } from "../Paper";
import { Burst, PageMark, TitleLine } from "../parts";
import { blob, roughEllipse, spline } from "../sketch";
import type { Pt } from "../sketch";
import { FONT_FAMILY } from "../../lib/fonts";
import { GAEGU, JUA, P } from "../theme";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const CX = 520;
const CY = 630;
const R = 262;

// 출처: classin-web 홈 히어로 지표(EEO 공식 기준 · 전 세계 누적)
const STATS = [
  { value: 160, unit: "+", label: "서비스 국가", at: 15 },
  { value: 6, unit: "만+", label: "교육기관", at: 37.5 },
  { value: 3000, unit: "만+", label: "월간 수업", at: 60 },
];

const LAND: Pt[][] = [
  [
    [-150, -90],
    [-96, -132],
    [-30, -120],
    [-10, -60],
    [-60, -10],
    [-120, -30],
  ],
  [
    [40, 10],
    [110, -20],
    [170, 30],
    [150, 100],
    [80, 120],
    [30, 70],
  ],
  [
    [-110, 80],
    [-50, 60],
    [-20, 110],
    [-60, 170],
    [-120, 140],
  ],
  [
    [230, -130],
    [300, -150],
    [340, -90],
    [290, -40],
    [230, -70],
  ],
];

// S4 — 전 세계 교실이 이미 쓰고 있어요
export const S4Scale: React.FC = () => {
  const frame = useCurrentFrame();
  const boil = useBoil();
  const id = useId().replace(/:/g, "");

  const globeIn = pop(frame - 4, { damping: 14, stiffness: 160, mass: 0.8 });
  const spin = frame * 2.2; // 대륙이 흘러가는 속도(px)
  const merid = (k: number) => Math.abs(Math.sin(frame * 0.03 + (k * Math.PI) / 3));

  // 갈매기가 지구 둘레를 돈다
  const a = frame * 0.055 - 1.9;
  const ox = CX + Math.cos(a) * 372;
  const oy = CY - 60 + Math.sin(a) * 120;
  const front = Math.sin(a) > -0.2;

  const gull = (
    <Gull
      x={ox}
      y={oy + 92}
      scale={0.58}
      rotate={Math.cos(a) * -14}
      wingL={flap(frame, 1.1)}
      wingR={flap(frame, 1.1)}
      wingLen={1.32}
      feet="tuck"
      eyes="happy"
      shadow={0}
      tuft={-10}
      hold={<Pencil rotate={-58} />}
      flip={Math.sin(a) < 0}
    />
  );

  return (
    <Paper>
      <Canvas>
        {!front && gull}

        {/* ── 지구 ── */}
        <g transform={`translate(${CX} ${CY}) scale(${0.3 + 0.7 * globeIn}) translate(${-CX} ${-CY})`}>
          <clipPath id={`${id}g`}>
            <circle cx={CX} cy={CY} r={R - 3} />
          </clipPath>
          <path d={`${roughEllipse(CX, CY, R, R, "globef", { overlap: 0, rough: 0.5 })}Z`} fill={P.mint} transform="translate(5 6)" />
          <g clipPath={`url(#${id}g)`}>
            {/* 흘러가는 대륙(두 벌을 이어 붙여 끊김 없이) */}
            {[0, 1].map((rep) => (
              <g key={rep} transform={`translate(${CX + ((spin + rep * 620) % 1240) - 620} ${CY})`}>
                {LAND.map((l, k) => (
                  <path key={k} d={blob(l, `land${k}`, 3)} fill={P.lime} stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />
                ))}
              </g>
            ))}
            {/* 경선·위선 */}
            {[0, 1, 2].map((k) => (
              <ellipse key={k} cx={CX} cy={CY} rx={R * merid(k)} ry={R} fill="none" stroke={P.ink} strokeWidth={2.5} opacity={0.28} />
            ))}
            <Stroke d={spline([[CX - R, CY - 96], [CX, CY - 70], [CX + R, CY - 96]])} w={2.5} opacity={0.28} />
            <Stroke d={spline([[CX - R, CY + 96], [CX, CY + 122], [CX + R, CY + 96]])} w={2.5} opacity={0.28} />
          </g>
          <Stroke d={roughEllipse(CX, CY, R, R, `globe:${boil}`, { overlap: 0.1, rough: 0.9 })} w={6} />
          {/* 핀 */}
          {(
            [
              [-120, -70],
              [70, -110],
              [130, 40],
              [-40, 100],
              [10, -10],
            ] as Pt[]
          ).map((p, k) => {
            const at = 14 + k * 9;
            if (frame < at) return null;
            const s = pop(frame - at);
            return (
              <g key={k} transform={`translate(${CX + p[0]} ${CY + p[1]}) scale(${s})`}>
                <path d="M0,0 C-16,-22 -18,-44 0,-50 C18,-44 16,-22 0,0Z" fill={P.orange} stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />
                <circle cx={0} cy={-32} r={6} fill={P.sheet} />
              </g>
            );
          })}
        </g>
        <Burst x={CX} y={CY} at={8} r={R + 60} n={16} w={6} color={P.limeDeep} />

        {front && gull}

        {/* 궤도 점선 */}
        <ellipse cx={CX} cy={CY - 60} rx={372} ry={120} fill="none" stroke={P.pencil} strokeWidth={3} strokeDasharray="4 16" strokeLinecap="round" opacity={0.6 * prog(frame, 10, 10)} />

        {/* ── 지표 ── */}
        {STATS.map((s, i) => {
          if (frame < s.at) return null;
          const y = 392 + i * 214;
          const k = pop(frame - s.at);
          const cnt = prog(frame, s.at, 22.5, ease.out);
          const num = Math.round(s.value * cnt).toLocaleString("en-US");
          return (
            <g key={s.label} transform={`translate(${(1 - k) * 60} 0)`} opacity={Math.min(1, (frame - s.at) / 4)}>
              <text x={1040} y={y} fontFamily={JUA} fontSize={170} fill={P.forest} style={{ letterSpacing: "-0.02em" }}>
                {num}
                <tspan fontSize={104}>{s.unit}</tspan>
              </text>
              <Label x={1044} y={y + 68} size={58} color={P.ink} font={GAEGU} p={prog(frame, s.at + 6, 6)}>
                {s.label}
              </Label>
            </g>
          );
        })}
      </Canvas>

      <TitleLine a="전 세계 교실이" b="이미 쓰고 있어요" atA={8} atB={18} left={118} seed="w" />

      <div style={{ position: "absolute", left: 1046, top: 946, fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: 24, color: P.ink2, letterSpacing: "-0.01em", opacity: interpolate(frame, [66, 76], [0, 0.85], CLAMP) }}>
        EEO 공식 기준 · 전 세계 누적
      </div>

      <PageMark page="06" />
    </Paper>
  );
};

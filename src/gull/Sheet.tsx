import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Gull, Pencil, flap } from "./Gull";
import { Label, MarkerReveal, SArrow, SRect } from "./Ink";
import { Hand, Mark, Note } from "./Lettering";
import { Canvas, Paper, PaperFinish } from "./Paper";
import { PageMark } from "./parts";
import { P } from "./theme";

const SWATCH: Array<[string, string]> = [
  [P.lime, "몸 #C8F05A"],
  [P.limeDeep, "날개 #8BC926"],
  [P.forest, "날개 끝 #084734"],
  [P.sheet, "배 #FFFDF6"],
  [P.orange, "부리·발 #FFA23A"],
  [P.blush, "볼 #FFB4B0"],
];

// 캐릭터 시트 — 포즈·표정·색 확인용 스틸 (npm run still:gull)
export const GullSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const poses: Array<{ x: number; label: string; node: React.ReactNode }> = [
    { x: 250, label: "기본", node: <Gull x={250} y={640} scale={1.12} /> },
    { x: 590, label: "인사", node: <Gull x={590} y={640} scale={1.12} wingR={-48} eyes="happy" beak={0.8} tuft={8} /> },
    { x: 930, label: "그리기", node: <Gull x={930} y={640} scale={1.12} wingR={-12} hold={<Pencil rotate={-62} />} look={[4, -2]} /> },
    {
      x: 1290,
      label: "날기",
      node: <Gull x={1290} y={640} scale={1.12} lift={44} rotate={12} wingL={flap(frame, 0.9)} wingR={flap(frame, 0.9)} wingLen={1.32} feet="tuck" eyes="happy" tuft={-10} />,
    },
    { x: 1650, label: "깜짝", node: <Gull x={1650} y={640} scale={1.12} eyes="wide" sweat={1} wingL={8} wingR={8} beak={0.9} tuft={-10} /> },
  ];
  return (
    <AbsoluteFill>
      <Paper>
        <Canvas>
          {poses.map((p) => (
            <g key={p.label}>
              {p.node}
              <Label x={p.x} y={710} size={44} anchor="middle" color={P.ink2}>
                {p.label}
              </Label>
            </g>
          ))}

          {/* 스케치 → 색 */}
          <Gull x={230} y={1010} scale={0.78} mono draw={0.7} />
          <SArrow a={[340, 900]} b={[410, 900]} seed="s1" bend={-0.2} />
          <Gull x={520} y={1010} scale={0.78} mono draw={1} />
          <SArrow a={[630, 900]} b={[700, 900]} seed="s2" bend={-0.2} />
          <Gull x={810} y={1010} scale={0.78} mono draw={1} />
          <MarkerReveal box={[810 - 130, 1010 - 270, 260, 290]} p={0.56} seed="rv" gap={40}>
            <Gull x={810} y={1010} scale={0.78} />
          </MarkerReveal>
          <SArrow a={[920, 900]} b={[990, 900]} seed="s3" bend={-0.2} />
          <Gull x={1100} y={1010} scale={0.78} eyes="happy" />

          {/* 색 */}
          {SWATCH.map(([c, name], i) => {
            const x = 1290 + (i % 2) * 290;
            const y = 786 + Math.floor(i / 2) * 82;
            return (
              <g key={name}>
                <SRect x={x} y={y} width={62} height={56} r={10} seed={`sw${i}`} fill={c} w={4} twice={false} />
                <Label x={x + 78} y={y + 40} size={32} color={P.ink2}>
                  {name}
                </Label>
              </g>
            );
          })}
        </Canvas>

        <div style={{ position: "absolute", left: 100, top: 60, display: "flex", alignItems: "baseline", whiteSpace: "pre" }}>
          <Hand text="클래스인 " size={92} delay={-40} />
          <Mark delay={-40}>
            <Hand text="연두 갈매기" size={92} delay={-40} color={P.forest} />
          </Mark>
          <Hand text=" 캐릭터 시트" size={92} delay={-40} />
        </div>
        <Note delay={-40} size={40} style={{ position: "absolute", left: 106, top: 178 }}>
          연두 몸 · 흰 배 · 짙은 초록 날개 끝 · 머리 깃 세 장 — 선은 비뚤빼뚤, 색은 살짝 밀리게
        </Note>
        <PageMark page="00" label="Classin 드로잉 노트 · 캐릭터" />
      </Paper>
      <PaperFinish />
    </AbsoluteFill>
  );
};

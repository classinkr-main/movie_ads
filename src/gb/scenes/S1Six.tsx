import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { INK, PAPER, PENCIL, STUDENTS } from "../theme";
import { CL, HandText, Hud, Ink, KText, Layer, PaperBg, eInOut, hand, lerp, ramp, roughEllipse, roughLine, roughPoly, roughRect, wavyLine } from "../kit";

// 저녁 공책 — 연필로 그린 교실 자리표에서 학생마다 다른 색연필 노선이 뻗어 나간다.
const ROOM = { x: 760, y: 440, w: 540, h: 420 };
const DESK: Record<string, [number, number]> = {
  A: [840, 566],
  B: [1030, 566],
  C: [1220, 566],
  D: [840, 724],
  E: [1030, 724],
  F: [1220, 724],
};
const ROUTE: Record<string, { pts: Array<[number, number]>; side: "left" | "right" }> = {
  A: { pts: [[840, 566], [646, 566]], side: "left" },
  D: { pts: [[840, 724], [740, 724], [672, 800], [646, 800]], side: "left" },
  B: { pts: [[1030, 566], [1030, 478], [1104, 404], [1440, 404]], side: "right" },
  C: { pts: [[1220, 566], [1440, 566]], side: "right" },
  F: { pts: [[1220, 724], [1440, 724]], side: "right" },
  E: { pts: [[1030, 724], [1030, 900], [1092, 962], [1300, 962]], side: "right" },
};
export const BRANCH_AT: Record<string, number> = { A: 15, B: 23, C: 30, D: 38, E: 45, F: 53 };
const UNIT: Record<string, string> = {
  A: "일차방정식 활용",
  B: "연립방정식 도입",
  C: "중1 일차방정식 복습",
  D: "일차부등식",
  E: "일차방정식 활용 · 부호 정리",
  F: "연립방정식 활용",
};
const SEED: Record<string, number> = { A: 11, B: 22, C: 33, D: 44, E: 55, F: 66 };

const Sketch: React.FC = () => {
  const pencil = "#46464A";
  const R = ROOM;
  return (
    <Layer>
      <g>
        <Ink d={roughRect(R.x, R.y, R.w, R.h, 3, 2)} color={pencil} width={3} at={0} dur={22} filter="pencil" />
        <Ink d={roughLine(R.x + 140, R.y + 26, R.x + 400, R.y + 26, 7, 1)} color={pencil} width={6} at={8} dur={10} filter="pencil" />
        <Ink d={roughRect(R.x + 230, R.y + 54, 80, 30, 9, 1)} color={pencil} width={2.2} at={12} dur={10} filter="pencil" opacity={0.75} />
        {/* 문 */}
        <Ink d={roughLine(R.x + 30, R.y + R.h, R.x + 30, R.y + R.h - 70, 12, 1)} color={pencil} width={2.6} at={14} dur={8} filter="pencil" />
        <Ink d={`M ${R.x + 100} ${R.y + R.h} A 70 70 0 0 0 ${R.x + 30} ${R.y + R.h - 70}`} color={pencil} width={1.8} at={16} dur={10} filter="pencil" opacity={0.6} />
        {STUDENTS.map((s, i) => {
          const [x, y] = DESK[s.id];
          return <Ink key={s.id} d={roughRect(x - 64, y - 34, 128, 68, 20 + i * 4, 1.3)} color={pencil} width={2.4} at={8 + i * 2.5} dur={12} filter="pencil" />;
        })}
      </g>
    </Layer>
  );
};

const Routes: React.FC<{ f: number }> = ({ f }) => (
  <Layer>
    {STUDENTS.map((s) => {
      const r = ROUTE[s.id];
      const at = BRANCH_AT[s.id];
      const last = r.pts[r.pts.length - 1];
      return (
        <g key={s.id}>
          <Ink d={roughPoly(r.pts, SEED[s.id], 1.2)} color={PENCIL[s.id]} width={8} at={at} dur={22} filter="pencil" />
          {/* 종점: 색연필 동그라미 */}
          <Ink d={roughEllipse(last[0] + (r.side === "left" ? -16 : 16), last[1], 26, 24, SEED[s.id] + 3)} color={PENCIL[s.id]} width={3} at={at + 18} dur={10} filter="pencil" />
        </g>
      );
    })}
  </Layer>
);

const Labels: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {STUDENTS.map((s) => {
        const r = ROUTE[s.id];
        const last = r.pts[r.pts.length - 1];
        const at = BRANCH_AT[s.id] + 18;
        const left = r.side === "left";
        const cx = last[0] + (left ? -16 : 16);
        const p = spring({ frame: f - at, fps, config: { damping: 16, stiffness: 160 } });
        return (
          <React.Fragment key={s.id}>
            <div style={{ position: "absolute", left: cx - 14, top: last[1] - 30, width: 28, textAlign: "center", ...hand(46, PENCIL[s.id]), opacity: interpolate(f - at, [0, 4], [0, 1], CL), transform: `scale(${lerp(0.6, 1, p)})` }}>
              {s.id}
            </div>
            <HandText x={left ? cx - 44 : cx + 40} y={last[1] - 24} size={42} color={INK.graphite} at={at + 2} dur={14} rotate={-1} style={left ? { transform: "translateX(-100%) rotate(-1deg)", transformOrigin: "100% 50%" } : undefined}>
              {UNIT[s.id]}
            </HandText>
          </React.Fragment>
        );
      })}
    </>
  );
};

// 책상 위 학생 이니셜(연필)
const Initials: React.FC<{ f: number }> = ({ f }) => (
  <>
    {STUDENTS.map((s, i) => {
      const [x, y] = DESK[s.id];
      return (
        <HandText key={s.id} x={x - 12} y={y - 26} size={44} color="#5A5A5E" at={16 + i * 2.5} dur={6} rotate={0}>
          {s.id}
        </HandText>
      );
    })}
    <HandText x={ROOM.x + 300} y={ROOM.y + 30} size={30} color="#6A6A6E" at={18} dur={8} rotate={0}>
      칠판
    </HandText>
  </>
);

export const S1Six: React.FC = () => {
  const f = useCurrentFrame();
  const push = lerp(1, 1.035, interpolate(f, [0, 120], [0, 1], { ...CL, easing: eInOut }));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg paper={PAPER.evening} to={PAPER.desk} k={ramp(f, 80, 120) * 0.35} ruled={1} margin />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "1030px 680px" }}>
        <Sketch />
        <Routes f={f} />
        <Initials f={f} />
        <Labels f={f} />
      </AbsoluteFill>
      <Hud page={1} at={2} />
      <KText lines={[[{ t: "한 반에 여섯 명," }]]} at={6} size={104} style={{ position: "absolute", left: 116, top: 118 }} />
      <KText lines={[[{ t: "진도는 " }, { t: "여섯 갈래.", c: INK.red }]]} at={40} size={104} style={{ position: "absolute", left: 116, top: 246 }} />
      <Layer>
        <Ink d={wavyLine(460, 1010, 384, 5, 5)} color={INK.red} width={6} at={66} dur={14} />
      </Layer>
      <HandText x={124} y={420} size={40} color={INK.sub} at={70} dur={18} rotate={-1}>
        가상 반 · 중2 수학 개별진도반 A
      </HandText>
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { evolvePath, getLength } from "@remotion/paths";
import { LINE, STUDENTS, TONES } from "../theme";
import { Icon } from "../icons";
import { Backdrop, Bracket, CL, FrameMarks, Hud, KText, StatusTag, Timecode, Whip, eInOut, eOut, eOutExpo, lerp, mono, ramp, t } from "../kit";

// 새벽(청록) — AI가 진단 결과로 학생별 4주 노선을 설계한다. 설명회 페이지의 가상 커리큘럼 값.
const T = TONES.dawn;
// 같은 단원에 겹치는 역은 노선도처럼 나란히 비켜 놓는다(A·E 2주, D·F 3주).
const LV: Record<string, number[]> = {
  A: [2.3, 2.3, 3.2, 4, 5],
  B: [3.0, 3.0, 4, 5, 6],
  C: [0, 0, 1, 2, 3],
  D: [3.7, 4, 6, 7, 7.7],
  E: [1.7, 2, 2.8, 3.6, 4.2],
  F: [4.3, 4.3, 5, 6.6, 8.4],
};
const DIAG: Record<string, string> = { A: "표준", B: "앞선 진도", C: "보완", D: "약간 앞섬", E: "표준 · 활용 미달", F: "가장 앞섬" };
const END: Record<string, string> = { A: "연립방정식 활용", B: "일차부등식", C: "일차방정식 활용 기본", D: "연립부등식 맛보기", E: "연립방정식 기본", F: "일차함수 도입" };
const COLS = ["진단", "1주", "2주 · 오늘", "3주", "4주"];
const XS = [440, 720, 1000, 1280, 1560];
const ly = (l: number) => 930 - l * 54;
const START = (i: number) => 30 + i * 3;
const DRAW = 54;

// 팔방향 노선: 수평 → 45° → 수평
export const metroPath = (pts: Array<{ x: number; y: number }>) => {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const dy = b.y - a.y;
    if (Math.abs(dy) < 0.5) {
      d += ` H ${b.x}`;
    } else {
      const x0 = b.x - 34 - Math.abs(dy);
      d += ` H ${x0} L ${b.x - 34} ${b.y} H ${b.x}`;
    }
  }
  return d;
};

const Map: React.FC<{ f: number }> = ({ f }) => {
  const cols = ramp(f, 4, 18, eOutExpo);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* 주차 세로선 */}
      {XS.map((x, i) => (
        <line key={x} x1={x} x2={x} y1={462} y2={462 + 490 * cols} stroke={i === 2 ? "rgba(150,255,220,0.5)" : "rgba(150,255,220,0.16)"} strokeWidth={i === 2 ? 1.6 : 1.2} strokeDasharray={i === 2 ? "8 6" : "3 7"} />
      ))}
      {/* 노선 */}
      {STUDENTS.map((s, i) => {
        const pts = LV[s.id].map((l, k) => ({ x: XS[k], y: ly(l) }));
        const d = metroPath(pts);
        const p = ramp(f, START(i), START(i) + DRAW, eInOut);
        const len = getLength(d);
        const col = LINE[s.id];
        const ev = evolvePath(Math.max(0.0001, p), d);
        const hl = 40;
        const trainK = ((f - START(i) - DRAW) / 46 + i * 0.21) % 1;
        return (
          <g key={s.id}>
            {p > 0 ? <path d={d} fill="none" stroke={col} strokeWidth={7} strokeLinejoin="miter" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} /> : null}
            {p > 0 && p < 1 ? <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={7} strokeDasharray={`${hl} ${len + hl}`} strokeDashoffset={-(len * p - hl)} /> : null}
            {p >= 1 ? <path d={d} fill="none" stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={3} strokeDasharray={`26 ${len + 26}`} strokeDashoffset={-(len * trainK - 26)} /> : null}
            {/* 역 */}
            {pts.map((pt, k) => {
              if (k === 0) {
                const on = ramp(f, 12 + i * 2, 18 + i * 2);
                return <rect key={k} x={pt.x - 8} y={pt.y - 8} width={16} height={16} fill={T.bg} stroke="#FFFFFF" strokeWidth={2.4} opacity={on} />;
              }
              const on = ramp(f, START(i) + DRAW * (k / 4) - 3, START(i) + DRAW * (k / 4) + 4);
              if (k === 2) return <rect key={k} x={pt.x - 9} y={pt.y - 9} width={18} height={18} fill="#FFFFFF" stroke={col} strokeWidth={3} transform={`rotate(${(1 - on) * 45} ${pt.x} ${pt.y})`} opacity={on} />;
              return <rect key={k} x={pt.x - 3.5} y={pt.y - 13} width={7} height={26 * on} fill={col} />;
            })}
          </g>
        );
      })}
      {/* AI → 진단 역으로 퍼지는 배정선 */}
      {STUDENTS.map((s, i) => {
        const y = ly(LV[s.id][0]);
        const d = `M 262 620 H 330 L ${330 + Math.min(70, Math.abs(y - 620))} ${y} H 432`;
        const p = ramp(f, 20 + i, 30 + i, eOut);
        if (p <= 0) return null;
        const ev = evolvePath(p, d);
        return <path key={s.id} d={d} fill="none" stroke="rgba(150,255,220,0.55)" strokeWidth={1.6} strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />;
      })}
    </svg>
  );
};

const AiModule: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - 16, fps, config: { damping: 14, stiffness: 160 } });
  const pulse = Math.max(0, 1 - Math.abs(f - 26) / 10);
  return (
    <div style={{ position: "absolute", left: 140, top: 572 }}>
      <div style={{ position: "relative", width: 104, height: 96, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${lerp(0.7, 1, p)})`, opacity: interpolate(f, [14, 18], [0, 1], CL) }}>
        <Bracket color={T.accent} size={16} w={2.4} />
        <Icon name="ai" size={54} color={T.accent} draw={ramp(f, 16, 32)} stroke={1.6} style={{ filter: pulse > 0 ? `drop-shadow(0 0 ${pulse * 14}px ${T.accent})` : undefined }} />
      </div>
      <div style={{ marginTop: 16, ...t(22, 800, T.accent, { lineHeight: 1, opacity: ramp(f, 20, 28) }) }}>AI 진도 설계</div>
      <div style={{ marginTop: 10, ...mono(13, 500, T.sub, { opacity: ramp(f, 22, 30) }) }}>진단 → 4주 경로</div>
    </div>
  );
};

const DiagList: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ position: "absolute", left: 140, top: 770, display: "flex", flexDirection: "column", gap: 9 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, opacity: ramp(f, 8, 14) }}>
      <Icon name="target" size={18} color={T.sub} draw={ramp(f, 8, 20)} />
      <span style={mono(13, 700, T.sub, { letterSpacing: "0.14em" })}>진단 결과</span>
    </div>
    {STUDENTS.map((s, i) => {
      const p = ramp(f, 10 + i * 2.2, 16 + i * 2.2);
      return (
        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, opacity: p, transform: `translateX(${(1 - p) * -10}px)` }}>
          <span style={mono(16, 700, LINE[s.id])}>{s.id}</span>
          <span style={t(17, 600, T.ink, { lineHeight: 1 })}>{DIAG[s.id]}</span>
        </div>
      );
    })}
  </div>
);

const Headers: React.FC<{ f: number }> = ({ f }) => (
  <>
    {COLS.map((c, i) => (
      <div key={c} style={{ position: "absolute", left: XS[i] - 80, width: 160, top: 424, textAlign: "center", ...mono(16, 700, i === 2 ? T.accent : T.sub, { letterSpacing: "0.1em", opacity: ramp(f, 4 + i * 2, 12 + i * 2) }) }}>
        {c}
      </div>
    ))}
  </>
);

const EndLabels: React.FC<{ f: number }> = ({ f }) => (
  <>
    {STUDENTS.map((s, i) => {
      const y = ly(LV[s.id][4]);
      const p = ramp(f, START(i) + DRAW - 6, START(i) + DRAW + 6);
      return (
        <div key={s.id} style={{ position: "absolute", left: XS[4] + 26, top: y - 13, display: "flex", alignItems: "center", gap: 10, opacity: p, transform: `translateX(${(1 - p) * -12}px)`, whiteSpace: "nowrap" }}>
          <span style={mono(16, 700, LINE[s.id])}>{s.id}</span>
          <span style={t(20, 600, T.ink, { lineHeight: 1 })}>{END[s.id]}</span>
        </div>
      );
    })}
  </>
);

export const S4Paths: React.FC = () => {
  const f = useCurrentFrame();
  const push = lerp(1, 1.04, interpolate(f, [0, 120], [0, 1], { ...CL, easing: eInOut }));
  return (
    <Whip id="s4whip" exit={120}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Backdrop from={T} to={TONES.blue} k={ramp(f, 60, 120) * 0.35} grid={0.5} gridSize={60} />
        <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "1000px 700px" }}>
          <Map f={f} />
          <Headers f={f} />
          <EndLabels f={f} />
          <AiModule f={f} />
          <DiagList f={f} />
        </AbsoluteFill>
        <KText lines={[[{ t: "진단 결과로," }]]} at={6} size={88} color={T.ink} style={{ position: "absolute", left: 116, top: 124 }} />
        <KText lines={[[{ t: "학생마다 " }, { t: "진도 경로", c: T.accent, u: T.accent }, { t: "를 짜고," }]]} at={24} size={88} color={T.ink} style={{ position: "absolute", left: 116, top: 230 }} />
        <Hud tone={T} chapter={4} label="AI 진도 설계" />
        <StatusTag kind="example" tone={T} at={4} />
        <FrameMarks tone={T} />
        <Timecode tone={T} offset={300} />
      </AbsoluteFill>
    </Whip>
  );
};

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { evolvePath, getLength } from "@remotion/paths";
import { LINE, STUDENTS, TONES } from "../theme";
import { Icon } from "../icons";
import { Backdrop, CL, FrameMarks, Hud, KText, Timecode, eInOut, eOut, lerp, mono, ramp, t } from "../kit";

// 교실 평면도(밤) — 책상 여섯 개에서 학생마다 다른 노선이 뻗어 나간다.
const T = TONES.night;
const ROOM = { x: 900, y: 262, w: 560, h: 420 };
export const DESKS: Record<string, { x: number; y: number }> = {
  A: { x: 1000, y: 446 },
  B: { x: 1180, y: 446 },
  C: { x: 1360, y: 446 },
  D: { x: 1000, y: 588 },
  E: { x: 1180, y: 588 },
  F: { x: 1360, y: 588 },
};
// 팔방향(수평·수직·45°) 노선 — 종점과 라벨 방향
const ROUTES: Record<string, { pts: Array<[number, number]>; side: "left" | "right" | "up" | "down" }> = {
  A: { pts: [[1000, 446], [850, 446], [770, 366], [700, 366]], side: "left" },
  D: { pts: [[1000, 588], [870, 588], [810, 528], [700, 528]], side: "left" },
  B: { pts: [[1180, 446], [1180, 214], [1110, 144], [780, 144]], side: "left" },
  C: { pts: [[1360, 446], [1360, 214], [1430, 144], [1560, 144]], side: "right" },
  F: { pts: [[1360, 588], [1500, 588], [1560, 528], [1560, 420]], side: "up" },
  E: { pts: [[1180, 588], [1180, 774], [1226, 820], [1310, 820]], side: "right" },
};
export const BRANCH_AT: Record<string, number> = { A: 15, B: 23, C: 30, D: 38, E: 45, F: 53 };
const DRAW = 24;

const toD = (pts: Array<[number, number]>) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

const Plan: React.FC<{ f: number }> = ({ f }) => {
  const wall = ramp(f, 0, 22, eInOut);
  const inner = ramp(f, 4, 24, eInOut);
  const door = ramp(f, 14, 28);
  const dim = ramp(f, 16, 34, eInOut);
  const ink = "rgba(220,226,255,0.82)";
  const faint = "rgba(200,210,255,0.35)";
  const R = ROOM;
  // 벽(문 자리는 비운다: 아래 벽 x 930–1010)
  const outer = `M 930 ${R.y + R.h} H ${R.x} V ${R.y} H ${R.x + R.w} V ${R.y + R.h} H 1010`;
  const innerD = `M 930 ${R.y + R.h - 12} H ${R.x + 12} V ${R.y + 12} H ${R.x + R.w - 12} V ${R.y + R.h - 12} H 1010`;
  const ev = (p: number, d: string) => evolvePath(Math.max(0.0001, p), d);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* 벽 */}
      <path d={outer} fill="none" stroke={ink} strokeWidth={2.2} {...ev(wall, outer)} />
      <path d={innerD} fill="none" stroke={ink} strokeWidth={1.2} {...ev(inner, innerD)} />
      {/* 창(오른쪽 벽) */}
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={ramp(f, 16 + i * 2, 22 + i * 2)}>
          <line x1={R.x + R.w - 12} x2={R.x + R.w} y1={R.y + 60 + i * 120} y2={R.y + 60 + i * 120} stroke={ink} strokeWidth={1.2} />
          <line x1={R.x + R.w - 12} x2={R.x + R.w} y1={R.y + 140 + i * 120} y2={R.y + 140 + i * 120} stroke={ink} strokeWidth={1.2} />
          <line x1={R.x + R.w - 6} x2={R.x + R.w - 6} y1={R.y + 60 + i * 120} y2={R.y + 140 + i * 120} stroke={ink} strokeWidth={1.2} />
        </g>
      ))}
      {/* 문과 문 열림 호 */}
      <line x1={930} y1={R.y + R.h} x2={930 + 80 * Math.cos((-Math.PI / 2) * door)} y2={R.y + R.h + 80 * Math.sin((-Math.PI / 2) * door)} stroke={ink} strokeWidth={2} />
      <path d={`M 1010 ${R.y + R.h} A 80 80 0 0 0 930 ${R.y + R.h - 80}`} fill="none" stroke={faint} strokeWidth={1.2} strokeDasharray="5 5" opacity={door} />
      {/* 칠판 */}
      <line x1={1090} x2={lerp(1090, 1270, ramp(f, 6, 18))} y1={R.y + 24} y2={R.y + 24} stroke={ink} strokeWidth={5} />
      <text x={1270} y={R.y + 52} textAnchor="middle" fill={faint} style={mono(13, 500, faint)} opacity={ramp(f, 14, 22)}>
        칠판
      </text>
      {/* 교사 책상 */}
      <rect x={1140} y={R.y + 70} width={80} height={30} fill="none" stroke={faint} strokeWidth={1.2} opacity={ramp(f, 10, 18)} />
      {/* 치수선 */}
      <g opacity={dim}>
        <line x1={R.x} x2={R.x + R.w * dim} y1={R.y - 40} y2={R.y - 40} stroke={faint} strokeWidth={1.2} />
        <line x1={R.x} x2={R.x} y1={R.y - 48} y2={R.y - 32} stroke={faint} strokeWidth={1.2} />
        <line x1={R.x + R.w} x2={R.x + R.w} y1={R.y - 48} y2={R.y - 32} stroke={faint} strokeWidth={1.2} opacity={dim > 0.95 ? 1 : 0} />
        <line x1={R.x - 40} x2={R.x - 40} y1={R.y} y2={R.y + R.h * dim} stroke={faint} strokeWidth={1.2} />
        <line x1={R.x - 48} x2={R.x - 32} y1={R.y} y2={R.y} stroke={faint} strokeWidth={1.2} />
        <line x1={R.x - 48} x2={R.x - 32} y1={R.y + R.h} y2={R.y + R.h} stroke={faint} strokeWidth={1.2} opacity={dim > 0.95 ? 1 : 0} />
      </g>
      {/* 방위표 */}
      <g transform={`translate(${R.x + R.w + 70} ${R.y + R.h - 40})`} opacity={ramp(f, 20, 30)}>
        <circle r={20} fill="none" stroke={faint} strokeWidth={1.2} />
        <path d="M 0 -15 L 6 6 L 0 2 L -6 6 Z" fill={ink} />
        <text y={-26} textAnchor="middle" style={mono(12, 700, faint)} fill={faint}>
          N
        </text>
      </g>
      {/* 책상 */}
      {STUDENTS.map((s, i) => {
        const d = DESKS[s.id];
        const p = ramp(f, 8 + i * 2.5, 18 + i * 2.5, eOut);
        const deskD = `M ${d.x - 60} ${d.y - 30} H ${d.x + 60} V ${d.y + 30} H ${d.x - 60} Z`;
        return (
          <g key={s.id}>
            <path d={deskD} fill="rgba(160,175,255,0.05)" stroke={ink} strokeWidth={1.4} {...ev(p, deskD)} />
            <rect x={d.x - 20} y={d.y + 38} width={40} height={14} fill="none" stroke={faint} strokeWidth={1.2} opacity={p} />
          </g>
        );
      })}
    </svg>
  );
};

const Routes: React.FC<{ f: number }> = ({ f }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    {STUDENTS.map((s) => {
      const r = ROUTES[s.id];
      const d = toD(r.pts);
      const at = BRANCH_AT[s.id];
      const p = ramp(f, at, at + DRAW, eInOut);
      if (p <= 0) return null;
      const ev = evolvePath(p, d);
      const len = getLength(d);
      const last = r.pts[r.pts.length - 1];
      const prev = r.pts[r.pts.length - 2];
      const vertical = Math.abs(last[0] - prev[0]) < 1;
      const done = ramp(f, at + DRAW - 3, at + DRAW + 5);
      // 머리: 노선 끝의 짧은 흰 구간
      const hl = 34;
      return (
        <g key={s.id}>
          <path d={d} fill="none" stroke={LINE[s.id]} strokeWidth={7} strokeLinejoin="miter" strokeLinecap="butt" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
          {p < 1 ? <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={7} strokeDasharray={`${hl} ${len + hl}`} strokeDashoffset={-(len * p - hl)} /> : null}
          {/* 종점 역 표시(노선에 수직인 막대) */}
          {vertical ? (
            <rect x={last[0] - 15 * done} y={last[1] - 3.5} width={30 * done} height={7} fill={LINE[s.id]} />
          ) : (
            <rect x={last[0] - 3.5} y={last[1] - 15 * done} width={7} height={30 * done} fill={LINE[s.id]} />
          )}
          {/* 출발역(책상): 흰 사각 */}
          <rect x={r.pts[0][0] - 8} y={r.pts[0][1] - 8} width={16} height={16} fill="#0B0E20" stroke="#FFFFFF" strokeWidth={2.4} opacity={ramp(f, at - 2, at + 3)} />
        </g>
      );
    })}
  </svg>
);

const Labels: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {STUDENTS.map((s) => {
        const r = ROUTES[s.id];
        const last = r.pts[r.pts.length - 1];
        const at = BRANCH_AT[s.id] + DRAW - 6;
        const p = spring({ frame: f - at, fps, config: { damping: 18, stiffness: 180 } });
        const unit = s.id === "E" ? "일차방정식 활용 · 부호 정리" : s.today;
        const left = r.side === "left";
        const up = r.side === "up";
        const style: React.CSSProperties = {
          position: "absolute",
          display: "flex",
          alignItems: "center",
          gap: 12,
          whiteSpace: "nowrap",
          opacity: interpolate(f - at, [0, 6], [0, 1], CL),
        };
        if (left) Object.assign(style, { right: 1920 - last[0] + 26, top: last[1] - 22, transform: `translateX(${(1 - p) * 20}px)` });
        else if (up) Object.assign(style, { left: last[0] - 12, top: last[1] - 66, transform: `translateY(${(1 - p) * 12}px)` });
        else Object.assign(style, { left: last[0] + 26, top: last[1] - 22, transform: `translateX(${(1 - p) * -20}px)` });
        const draw = ramp(f, at, at + 14);
        return (
          <div key={s.id} style={style}>
            {left ? null : <Icon name="student" size={30} color={LINE[s.id]} draw={draw} stroke={2} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: left ? "flex-end" : "flex-start" }}>
              <span style={mono(14, 700, LINE[s.id], { letterSpacing: "0.16em" })}>학생 {s.id}</span>
              <span style={t(24, 700, T.ink, { lineHeight: 1 })}>{unit}</span>
            </div>
            {left ? <Icon name="student" size={30} color={LINE[s.id]} draw={draw} stroke={2} /> : null}
          </div>
        );
      })}
    </>
  );
};

// 노선 범례 — 학생 여섯 = 노선 여섯
const Legend: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ position: "absolute", left: 124, top: 978, display: "flex", alignItems: "center", gap: 18 }}>
    <span style={mono(13, 700, T.sub, { letterSpacing: "0.16em", opacity: ramp(f, 70, 80) })}>노선 = 학생</span>
    {STUDENTS.map((s, i) => {
      const p = ramp(f, 72 + i * 2, 80 + i * 2, eOut);
      return (
        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 7, opacity: p }}>
          <div style={{ width: 30 * p, height: 5, background: LINE[s.id] }} />
          <span style={mono(13, 700, T.ink)}>{s.id}</span>
        </div>
      );
    })}
  </div>
);

export const S1Six: React.FC = () => {
  const f = useCurrentFrame();
  const push = lerp(1, 1.045, interpolate(f, [0, 120], [0, 1], { ...CL, easing: eInOut }));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop from={T} to={TONES.ember} k={ramp(f, 70, 120) * 0.35} grid={0.55} gridSize={40} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "1180px 470px" }}>
        <Plan f={f} />
        <Routes f={f} />
        <Labels f={f} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 124, top: 646, ...mono(15, 700, T.accent, { letterSpacing: "0.18em", opacity: ramp(f, 2, 12) }) }}>가상 반 · 중2 수학 개별진도반 A</div>
      <KText lines={[[{ t: "한 반에 여섯 명," }]]} at={6} size={110} color={T.ink} style={{ position: "absolute", left: 116, top: 688 }} />
      <KText lines={[[{ t: "진도는 " }, { t: "여섯 갈래.", c: T.accent, u: T.accent }]]} at={42} size={110} color={T.ink} style={{ position: "absolute", left: 116, top: 816 }} />
      <Legend f={f} />
      <Hud tone={T} chapter={1} label="개별진도 × ClassIn + AI" at={2} />
      <FrameMarks tone={T} />
      <Timecode tone={T} offset={0} />
    </AbsoluteFill>
  );
};

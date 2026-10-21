import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { InkStage } from "../components/Stage";
import { Flash, Rings } from "../components/Fx";
import { Caption, Counter, MaskUp } from "../components/Type";
import { C, CUES, FONT, scene } from "../lib/theme";
import { SLAM, clamp, ease, prog, shake, sp } from "../lib/motion";
import geo from "../data/geo.json";

// S8 글로벌 수치 (960–1080f) — 드럼이 멎는 스톱타임 히트 3번에 맞춰 숫자가 박힌다.
// 수치는 EEO 공식 소개(classin.com) 기준 전 세계 누적값 — classinkr-web docs/active/brand-canon/company-facts.md
const { from } = scene("scale");
const HITS = CUES.scale.hits.map((f) => f - from);
const CAPTION = CUES.scale.caption - from;

const STATS: Array<{ value: number; unit?: string; label: string; format?: (n: number) => string }> = [
  { value: 160, label: "개국" },
  { value: 6, unit: "만", label: "교육기관" },
  { value: 5000, unit: "만", label: "교사·학습자", format: (n) => Math.round(n).toLocaleString("en-US") },
];

const STAT_X = [150, 640, 1110];

const WorldDots: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = prog(frame, 0, 16);
  const [kx, ky] = geo.world.korea;
  return (
    <svg width={1920} height={1080} viewBox={`0 0 ${geo.world.width} ${geo.world.height}`} style={{ position: "absolute", left: 0, top: 0, opacity: 0.55 * appear }}>
      {geo.world.dots.map(([x, y], i) => {
        const tw = 0.55 + 0.45 * Math.sin(frame * 0.12 + random(`d${i}`) * 6.28);
        return <circle key={i} cx={x} cy={y} r={3.4} fill={C.cobalt} opacity={tw} />;
      })}
      {[0, 30, 60, 90].map((o) => {
        const t = ((frame - o) % 60) / 60;
        if (frame < o) return null;
        return <circle key={o} cx={kx} cy={ky} r={10 + t * 70} fill="none" stroke={C.signal} strokeWidth={4 * (1 - t)} opacity={1 - t} />;
      })}
      <circle cx={kx} cy={ky} r={9} fill={C.signal} />
    </svg>
  );
};

const Stat: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const at = HITS[i];
  if (frame < at) return null;
  const t = frame - at;
  const s = sp(t, SLAM);
  const st = STATS[i];
  const sh = shake(frame, at, 14, 14, `st${i}`);
  return (
    <div
      style={{
        position: "absolute",
        left: STAT_X[i],
        top: 470,
        transform: `translate(${sh.x}px, ${sh.y}px) scale(${1.5 - 0.5 * s})`,
        transformOrigin: "0% 100%",
        opacity: interpolate(t, [0, 3], [0, 1], clamp),
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", color: C.white, lineHeight: 1 }}>
        <Counter value={st.value} start={at} dur={14} format={st.format} style={{ fontFamily: FONT.num, fontSize: 196, letterSpacing: "0.005em" }} />
        {st.unit && <span style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 124, marginLeft: 6, letterSpacing: "-0.04em" }}>{st.unit}</span>}
        <span style={{ fontFamily: FONT.num, fontSize: 140, color: C.signal, marginLeft: 6 }}>+</span>
      </div>
      <div style={{ height: 6, width: 120, background: C.signal, margin: "18px 0 18px", transform: `scaleX(${prog(frame, at + 4, at + 14)})`, transformOrigin: "0 50%" }} />
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 58, letterSpacing: "-0.03em", color: C.white }}>{st.label}</div>
    </div>
  );
};

export const Scale: React.FC = () => {
  const frame = useCurrentFrame();
  const cap = prog(frame, CAPTION, CAPTION + 10);
  const out = interpolate(frame, [104, 120], [1, 1.06], { ...clamp, easing: ease.in });
  return (
    <InkStage glow={0.8}>
      <AbsoluteFill style={{ transform: `scale(${out})` }}>
        <WorldDots />
        <div style={{ position: "absolute", left: 160, top: 150 }}>
          <Caption size={22} color={C.white} style={{ opacity: 0.7, letterSpacing: "0.24em", fontWeight: 600 }}>
            GLOBAL · SINCE 2014
          </Caption>
          <MaskUp start={0} dur={12} style={{ marginTop: 14 }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 84, letterSpacing: "-0.04em", color: C.white, lineHeight: 1.1 }}>그리고 전 세계에서.</div>
          </MaskUp>
        </div>
        {HITS.map((h, i) => (
          <React.Fragment key={h}>
            <Rings start={h} x={STAT_X[i] + [170, 140, 300][i]} y={600} count={2} maxR={520} width={8} />
            <Stat i={i} />
          </React.Fragment>
        ))}
        <Caption size={20} color={C.white} style={{ position: "absolute", left: 160, bottom: 140, opacity: cap * 0.7 }}>
          * 전 세계 누적 수치 · EEO 공식 소개(classin.com) 기준
        </Caption>
      </AbsoluteFill>
      {HITS.map((h) => (
        <Flash key={h} at={h} dur={6} max={0.22} />
      ))}
    </InkStage>
  );
};

import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ChipDark, td } from "../../components/Dark";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { D } from "../../lib/themeDark";
import { TmbLayout } from "./TmbLayout";

// 01 — 피드백 루프: 수업 → 녹화 → AI 강의 평가 → 면담·개선. 빛이 한 바퀴 돌며 노드를 켜고, 이후 계속 돈다. 강사 일은 늘지 않는다.
const NODES = [
  { label: "수업", sub: "온라인 · 대면", glyph: "▶" },
  { label: "자동 녹화", sub: "칠판 · 음성", glyph: "REC" },
  { label: "AI 강의 평가", sub: "4개 영역 · 11개 항목", glyph: "AI" },
  { label: "면담 · 개선", sub: "강점 먼저 · 하나만", glyph: "✓" },
];
const SIZE = 640;
const R = 232;
const LOOP_START = 36;
const LOOP_LEN = 84; // 첫 바퀴
const DRAW = 20;

export const LoopB: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = sp(frame - DRAW, fps, SMOOTH, 40);
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  // 빛의 각도(도) — 첫 바퀴는 LOOP_LEN 프레임, 이후 조금 느리게 계속
  const t = frame - LOOP_START;
  const turns = t < 0 ? 0 : t <= LOOP_LEN ? t / LOOP_LEN : 1 + (t - LOOP_LEN) / 110;
  const angle = -90 + turns * 360;
  const rad = (a: number) => (a * Math.PI) / 180;
  const litCount = Math.min(4, Math.floor(turns * 4 + 1e-6) + (t >= 0 ? 1 : 0));
  const arcLen = 0.09;
  const center = sp(frame - (LOOP_START + LOOP_LEN - 10), fps, SMOOTH, 22);

  return (
    <TmbLayout
      step={0}
      title={
        <>
          매 수업,
          <br />
          피드백 루프가 돕니다
        </>
      }
      sub={
        <>
          수업 → 자동 녹화 → AI 강의 평가 → 면담. 참관할 때만 가끔 돌던 루프가 매 수업 돕니다. <span style={{ color: D.ink, fontWeight: 700 }}>녹화도 분석도 자동이라, 강사의 일은 늘지 않습니다.</span>
        </>
      }
      bullets={["자동 녹화", "수업 끝나면 리포트", "강사 일 +0"]}
    >
      <div style={{ position: "relative", width: SIZE, height: SIZE, opacity: interpolate(frame - 6, [0, 10], [0, 1], clamp) }}>
        <svg width={SIZE} height={SIZE} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id="arcGrad" gradientUnits="userSpaceOnUse" x1={cx + Math.cos(rad(angle - 40)) * R} y1={cy + Math.sin(rad(angle - 40)) * R} x2={cx + Math.cos(rad(angle)) * R} y2={cy + Math.sin(rad(angle)) * R}>
              <stop offset="0%" stopColor={D.lime} stopOpacity={0} />
              <stop offset="100%" stopColor={D.lime} stopOpacity={1} />
            </linearGradient>
          </defs>
          {/* 베이스 링 */}
          <circle cx={cx} cy={cy} r={R} stroke={D.line2} strokeWidth={2} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
          {/* 지나간 구간(첫 바퀴) */}
          {t >= 0 && (
            <circle cx={cx} cy={cy} r={R} stroke={D.limeDeep} strokeWidth={2} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, turns)} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" opacity={0.7} />
          )}
          {/* 달리는 빛 */}
          {t >= 0 && (
            <>
              <circle cx={cx} cy={cy} r={R} stroke="url(#arcGrad)" strokeWidth={6} fill="none" pathLength={1} strokeDasharray={`${arcLen} ${1 - arcLen}`} strokeDashoffset={-(turns % 1) + arcLen} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
              <circle cx={cx + Math.cos(rad(angle)) * R} cy={cy + Math.sin(rad(angle)) * R} r={9} fill={D.lime} style={{ filter: "drop-shadow(0 0 14px rgba(200,240,90,0.9))" }} />
            </>
          )}
          {/* 화살 표시(방향) */}
          {[45, 135, 225, 315].map((a) => (
            <polygon key={a} points="0,-5 8,0 0,5" fill={D.faint} transform={`translate(${cx + Math.cos(rad(a)) * R} ${cy + Math.sin(rad(a)) * R}) rotate(${a + 90})`} opacity={ring} />
          ))}
        </svg>

        {/* 노드 */}
        {NODES.map((n, i) => {
          const a = -90 + i * 90;
          const x = cx + Math.cos(rad(a)) * R;
          const y = cy + Math.sin(rad(a)) * R;
          const d = DRAW + 6 + i * 8;
          const s = sp(frame - d, fps, SMOOTH, 18);
          const lit = i < litCount;
          const litS = lit ? sp(frame - (LOOP_START + (i / 4) * LOOP_LEN), fps, { damping: 12, stiffness: 220, mass: 0.7 }) : 0;
          const labelSide = i === 1 ? "right" : i === 3 ? "left" : i === 0 ? "top" : "bottom";
          return (
            <div key={n.label} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", opacity: interpolate(frame - d, [0, 6], [0, 1], clamp) }}>
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  background: lit ? D.lime : "#0F2A20",
                  border: `2px solid ${lit ? D.lime : D.line2}`,
                  boxShadow: lit ? `0 0 ${30 + litS * 10}px rgba(200,240,90,${0.45 * litS})` : "none",
                  transform: `scale(${0.7 + s * 0.3 + litS * 0.08})`,
                  ...td(n.glyph.length > 1 ? 16 : 24, 900, lit ? "#0A1A14" : D.mute),
                  letterSpacing: n.glyph.length > 1 ? "0.06em" : "0",
                }}
              >
                {n.glyph}
              </div>
              <div
                style={{
                  position: "absolute",
                  whiteSpace: "nowrap",
                  ...(labelSide === "right" ? { left: 112, top: "50%", transform: "translateY(-50%)", textAlign: "left" as const } : labelSide === "left" ? { right: 112, top: "50%", transform: "translateY(-50%)", textAlign: "right" as const } : labelSide === "top" ? { bottom: 108, left: "50%", transform: "translateX(-50%)", textAlign: "center" as const } : { top: 108, left: "50%", transform: "translateX(-50%)", textAlign: "center" as const }),
                }}
              >
                <div style={td(21, 800, lit ? D.ink : D.mute)}>{n.label}</div>
                <div style={{ ...td(14, 600, D.faint), marginTop: 3 }}>{n.sub}</div>
              </div>
            </div>
          );
        })}

        {/* 중앙 */}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%,-50%) scale(${0.85 + center * 0.15})`, textAlign: "center", opacity: center }}>
          <div style={td(18, 700, D.faint, { letterSpacing: "0.2em" })}>AUTOMATIC</div>
          <div style={{ ...td(64, 900, D.ink), letterSpacing: "-0.04em", marginTop: 2 }}>전부 자동</div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
            <ChipDark delay={LOOP_START + LOOP_LEN} tone="solid" size={15}>
              강사 추가 업무 0
            </ChipDark>
          </div>
        </div>
      </div>
    </TmbLayout>
  );
};

import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Chip } from "../../components/Ui";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { C } from "../../lib/theme";
import { tx } from "../tm/TmLayout";
import { TmvLayout } from "./TmvLayout";

// 01 — 수업의 퀄리티가 복리로 쌓입니다.
// 점선 트랙 위를 혜성(빛 + 꼬리 입자)이 돌며 아이콘 노드 카드를 차례로 켜고(리플), 첫 바퀴가 끝나면 트랙이 발광한다.
// 가운데에는 루프가 돌수록 올라가는 '복리 곡선'이 그려진다. 강사 일은 늘지 않는다.
const NODES = [
  { label: "수업", sub: "온라인 · 대면", icon: "play" },
  { label: "자동 녹화", sub: "칠판 · 음성", icon: "rec" },
  { label: "AI 강의 평가", sub: "4개 영역 · 11개 항목", icon: "ai" },
  { label: "면담 · 개선", sub: "강점 먼저 · 하나만", icon: "talk" },
] as const;
const SIZE = 640;
const R = 232;
const NODE = 96;
const DRAW = 14;
const LOOP_START = 34;
const LOOP_LEN = 80; // 첫 바퀴
const CURVE_W = 236;
const CURVE_H = 104;
const rad = (a: number) => (a * Math.PI) / 180;

const Icon: React.FC<{ kind: (typeof NODES)[number]["icon"]; color: string }> = ({ kind, color }) => {
  if (kind === "play") return <path d="M-10,-15 L15,0 L-10,15 Z" fill={color} />;
  if (kind === "rec")
    return (
      <>
        <circle r={14} fill="none" stroke={color} strokeWidth={3.2} />
        <circle r={6.5} fill={color} />
      </>
    );
  if (kind === "ai") return <path d="M0,-17 C2.2,-6.5 6.5,-2.2 17,0 C6.5,2.2 2.2,6.5 0,17 C-2.2,6.5 -6.5,2.2 -17,0 C-6.5,-2.2 -2.2,-6.5 0,-17 Z" fill={color} />;
  return (
    <>
      <path d="M-17,-13 h34 a4,4 0 0 1 4,4 v17 a4,4 0 0 1 -4,4 h-15 l-8,7 v-7 h-11 a4,4 0 0 1 -4,-4 v-17 a4,4 0 0 1 4,-4 z" fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
      <path d="M-7,-1 l5,5 l9,-10" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
};

export const LoopV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const track = sp(frame - DRAW, fps, SMOOTH, 40);
  const t = frame - LOOP_START;
  const turns = t < 0 ? 0 : t <= LOOP_LEN ? t / LOOP_LEN : 1 + (t - LOOP_LEN) / 110;
  const angle = -90 + turns * 360;
  const firstLap = Math.min(1, turns);
  const glow = sp(frame - (LOOP_START + LOOP_LEN), fps, SMOOTH, 24);
  const litCount = t < 0 ? 0 : Math.min(4, Math.floor(turns * 4 + 1e-6) + 1);
  const arcLen = 0.1;
  const head = { x: cx + Math.cos(rad(angle)) * R, y: cy + Math.sin(rad(angle)) * R };

  // 복리 곡선 — 첫 바퀴 동안 그려진다. x∈[0,1], y = x^2.3 (뒤로 갈수록 가파르다)
  const curveP = t < 0 ? 0 : interpolate(firstLap, [0.05, 1], [0, 1], clamp);
  const N = 40;
  const pts = Array.from({ length: N + 1 }).map((_, i) => {
    const x = i / N;
    return [8 + x * (CURVE_W - 16), CURVE_H - 10 - Math.pow(x, 2.3) * (CURVE_H - 26)] as const;
  });
  const line = pts.map((q, i) => `${i === 0 ? "M" : "L"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[N][0].toFixed(1)},${CURVE_H - 4} L${pts[0][0].toFixed(1)},${CURVE_H - 4} Z`;
  const tip = pts[Math.round(curveP * N)];
  const centerIn = interpolate(frame - (LOOP_START + 4), [0, 12], [0, 1], clamp);
  const label = sp(frame - (LOOP_START + LOOP_LEN - 8), fps, SMOOTH, 20);

  return (
    <TmvLayout
      step={0}
      lines={["수업의 퀄리티가", "복리로 쌓입니다"]}
      sub={
        <>
          수업 → 자동 녹화 → AI 강의 평가 → 면담. 루프가 매 수업 돌면서 작은 개선이 다음 수업에 얹힙니다. <span style={{ color: C.ink, fontWeight: 700 }}>녹화도 분석도 자동이라, 강사의 일은 늘지 않습니다.</span>
        </>
      }
      bullets={["매 수업 자동 반복", "작은 개선의 누적", "강사 일 +0"]}
    >
      <div style={{ position: "relative", width: SIZE, height: SIZE, opacity: interpolate(frame - 6, [0, 10], [0, 1], clamp) }}>
        {/* 떠다니는 입자 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = random(`la${i}`) * 360 + frame * (0.15 + random(`lv${i}`) * 0.2) * (i % 2 ? 1 : -1);
          const rr = R + 40 + random(`lr${i}`) * 90;
          const sz = 3 + random(`ls${i}`) * 5;
          return <div key={i} style={{ position: "absolute", left: cx + Math.cos(rad(a)) * rr - sz / 2, top: cy + Math.sin(rad(a)) * rr - sz / 2, width: sz, height: sz, borderRadius: 999, background: C.lime, opacity: 0.35 + 0.4 * random(`lo${i}`) }} />;
        })}

        <svg width={SIZE} height={SIZE} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id="cometGrad" gradientUnits="userSpaceOnUse" x1={cx + Math.cos(rad(angle - 46)) * R} y1={cy + Math.sin(rad(angle - 46)) * R} x2={head.x} y2={head.y}>
              <stop offset="0%" stopColor={C.lime} stopOpacity={0} />
              <stop offset="100%" stopColor={C.limeDeep} stopOpacity={1} />
            </linearGradient>
            <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.lime} stopOpacity={0.7} />
              <stop offset="100%" stopColor={C.lime} stopOpacity={0} />
            </linearGradient>
            <clipPath id="curveClip">
              <rect x={0} y={0} width={CURVE_W * curveP} height={CURVE_H} />
            </clipPath>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          {/* 발광 링(첫 바퀴 후) */}
          <circle cx={cx} cy={cy} r={R} stroke={C.lime} strokeWidth={18} fill="none" opacity={0.55 * glow} filter="url(#softGlow)" />
          {/* 점선 트랙 */}
          <circle cx={cx} cy={cy} r={R} stroke="rgba(28,27,23,0.22)" strokeWidth={2} fill="none" strokeDasharray="3 9" strokeLinecap="round" opacity={track} transform={`rotate(${-90 + frame * 0.2} ${cx} ${cy})`} />
          {/* 지나간 구간 */}
          {t >= 0 && <circle cx={cx} cy={cy} r={R} stroke={C.lime} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - firstLap} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" opacity={0.9} />}
          {/* 방향 화살 */}
          {[45, 135, 225, 315].map((a, i) => {
            const passed = t >= 0 && firstLap >= (i + 0.5) / 4 - 0.125;
            return <polygon key={a} points="0,-6 9,0 0,6" fill={passed ? C.limeDeep : C.gray300} transform={`translate(${cx + Math.cos(rad(a)) * R} ${cy + Math.sin(rad(a)) * R}) rotate(${a + 90})`} opacity={track} />;
          })}
          {/* 혜성 */}
          {t >= 0 && (
            <>
              <circle cx={cx} cy={cy} r={R} stroke="url(#cometGrad)" strokeWidth={8} fill="none" pathLength={1} strokeDasharray={`${arcLen} ${1 - arcLen}`} strokeDashoffset={-(turns % 1) + arcLen} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
              {[1, 2, 3, 4, 5].map((k) => {
                const a = angle - k * 8;
                const wob = Math.sin(frame / 3 + k) * (k * 2.2);
                return <circle key={k} cx={cx + Math.cos(rad(a)) * (R + wob)} cy={cy + Math.sin(rad(a)) * (R + wob)} r={5.5 - k * 0.8} fill={C.lime} opacity={0.9 - k * 0.15} />;
              })}
              <circle cx={head.x} cy={head.y} r={16} fill={C.lime} opacity={0.35} />
              <circle cx={head.x} cy={head.y} r={9} fill={C.forest} style={{ filter: "drop-shadow(0 0 10px rgba(200,240,90,0.95))" }} />
            </>
          )}
          {/* 노드 리플 */}
          {NODES.map((n, i) => {
            const litAt = LOOP_START + (i / 4) * LOOP_LEN;
            const f = frame - litAt;
            if (t < 0 || f < 0 || f > 26) return null;
            const q = f / 26;
            const a = -90 + i * 90;
            return <circle key={n.label} cx={cx + Math.cos(rad(a)) * R} cy={cy + Math.sin(rad(a)) * R} r={52 + q * 48} fill="none" stroke={C.limeDeep} strokeWidth={3 * (1 - q)} opacity={(1 - q) * 0.8} />;
          })}

          {/* 가운데 복리 곡선 */}
          <g transform={`translate(${cx - CURVE_W / 2} ${cy - CURVE_H / 2 - 6})`} opacity={centerIn}>
            {[0.33, 0.66].map((g) => (
              <line key={g} x1={8} x2={CURVE_W - 8} y1={CURVE_H - 10 - g * (CURVE_H - 26)} y2={CURVE_H - 10 - g * (CURVE_H - 26)} stroke={C.hairline} strokeWidth={1} />
            ))}
            <line x1={8} x2={CURVE_W - 8} y1={CURVE_H - 10} y2={CURVE_H - 10} stroke="rgba(28,27,23,0.14)" strokeWidth={1.5} />
            <path d={area} fill="url(#curveFill)" clipPath="url(#curveClip)" />
            <path d={line} stroke={C.forest} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - curveP} />
            {curveP > 0.01 && <circle cx={tip[0]} cy={tip[1]} r={6} fill={C.limeDeep} stroke={C.white} strokeWidth={2} />}
            {/* 바퀴 눈금 */}
            {[0.25, 0.5, 0.75, 1].map((x, i) => {
              const on = curveP >= x - 0.01;
              const px = 8 + x * (CURVE_W - 16);
              return <circle key={i} cx={px} cy={CURVE_H - 10} r={on ? 3.5 : 2} fill={on ? C.limeDeep : C.gray300} />;
            })}
          </g>
        </svg>

        {/* 가운데 텍스트 */}
        <div style={{ position: "absolute", left: cx - CURVE_W / 2, top: cy - CURVE_H / 2 - 40, width: CURVE_W, ...tx(12, 800, C.limeInk, { letterSpacing: "0.2em" }), opacity: centerIn }}>QUALITY COMPOUNDS</div>
        <div style={{ position: "absolute", left: cx - 150, top: cy + CURVE_H / 2 + 2, width: 300, textAlign: "center", opacity: label, transform: `translateY(${(1 - label) * 10}px)` }}>
          <div style={{ ...tx(22, 900, C.ink), letterSpacing: "-0.03em" }}>루프가 돌수록, 수업이 좋아집니다</div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 6 }}>
            <Chip delay={LOOP_START + LOOP_LEN} size={13} bg={C.forest} color={C.white}>
              전부 자동
            </Chip>
            <Chip delay={LOOP_START + LOOP_LEN + 5} size={13} bg={C.lime} color={C.ink}>
              강사 추가 업무 0
            </Chip>
          </div>
        </div>

        {/* 노드 카드 */}
        {NODES.map((n, i) => {
          const a = -90 + i * 90;
          const x = cx + Math.cos(rad(a)) * R;
          const y = cy + Math.sin(rad(a)) * R;
          const d = DRAW + 6 + i * 7;
          const s = sp(frame - d, fps, SMOOTH, 18);
          const lit = i < litCount;
          const litS = lit ? sp(frame - (LOOP_START + (i / 4) * LOOP_LEN), fps, { damping: 11, stiffness: 240, mass: 0.7 }) : 0;
          const labelSide = i === 1 ? "right" : i === 3 ? "left" : i === 0 ? "top" : "bottom";
          return (
            <div key={n.label} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", opacity: interpolate(frame - d, [0, 6], [0, 1], clamp) }}>
              <div
                style={{
                  width: NODE,
                  height: NODE,
                  borderRadius: 28,
                  display: "grid",
                  placeItems: "center",
                  background: lit ? `linear-gradient(160deg, ${C.limeBright} 0%, ${C.lime} 100%)` : C.white,
                  border: `2px solid ${lit ? C.limeDeep : C.hairline}`,
                  boxShadow: lit ? `0 ${14 + litS * 6}px ${34 + litS * 10}px rgba(139,201,38,${0.4 * litS}), inset 0 1px 0 rgba(255,255,255,0.8)` : "0 12px 32px rgba(28,27,23,0.08)",
                  transform: `rotate(${(1 - s) * -12}deg) scale(${0.6 + s * 0.4 + litS * 0.08})`,
                }}
              >
                <svg width={44} height={44} viewBox="-22 -22 44 44">
                  <Icon kind={n.icon} color={lit ? C.forest : C.gray300} />
                </svg>
              </div>
              <div
                style={{
                  position: "absolute",
                  whiteSpace: "nowrap",
                  ...(labelSide === "right" ? { left: NODE + 18, top: "50%", transform: "translateY(-50%)", textAlign: "left" as const } : labelSide === "left" ? { right: NODE + 18, top: "50%", transform: "translateY(-50%)", textAlign: "right" as const } : labelSide === "top" ? { bottom: NODE + 14, left: "50%", transform: "translateX(-50%)", textAlign: "center" as const } : { top: NODE + 14, left: "50%", transform: "translateX(-50%)", textAlign: "center" as const }),
                }}
              >
                <div style={tx(21, 800, lit ? C.ink : C.gray)}>{n.label}</div>
                <div style={{ ...tx(14, 600, C.gray300), marginTop: 3 }}>{n.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </TmvLayout>
  );
};

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { MONO } from "../lib/fonts";
import { clamp } from "../lib/motion";
import { C } from "../lib/theme";
import { K } from "./Cinema";
import { useType } from "./typeset";

// 크로노그래프 다이얼 — 수업 1시간을 아날로그 시계로 보여 준다.
// 기요셰 문양 다이얼, 60개 분 눈금(5분마다 긴 눈금 + 보도니 숫자), 바늘 뒤의 빛 꼬리, 연두 게이지 아크.
// 바늘이 지나간 눈금·숫자가 차례로 켜지고, 12시에 닿으면 살짝 흔들리다 멈춘다.
const R = 300; // viewBox 반지름

const polar = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: Math.sin(a) * r, y: -Math.cos(a) * r };
};

export const ChronoDial: React.FC<{
  progress: number; // 0–1, 바늘 위치(이징 적용된 값)
  settleAt: number; // 바늘이 12시에 닿는 로컬 프레임
  endAt: number; // 세션 종료(펄스·라벨) 로컬 프레임
  appearAt: number;
  size: number;
  readout: string; // "MM:SS"
}> = ({ progress, settleAt, endAt, appearAt, size, readout }) => {
  const frame = useCurrentFrame();
  const { ts } = useType();
  const ended = frame >= endAt;
  const appear = interpolate(frame - appearAt, [0, 12], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const t = frame - settleAt;
  const settle = t >= 0 ? 2.6 * Math.exp(-t / 4.5) * Math.sin(t * 0.95) : 0;
  const angle = progress * 360 + settle;
  const sweeping = progress > 0 && progress < 1;
  const trail = interpolate(frame - settleAt, [0, 10], [1, 0], clamp) * Math.min(1, progress * 6);
  const pulse = frame - endAt;
  const circ = 2 * Math.PI * 258;
  const lit = (i: number) => Math.min(1, Math.max(0, (progress * 60 - i) * 2 + 0.5));
  const numeral = { fontFamily: ts.timer.family, fontWeight: ts.timer.weight(400), fontVariantNumeric: "lining-nums" as const };

  return (
    <div style={{ position: "relative", width: size, height: size, opacity: appear, transform: `scale(${0.94 + appear * 0.06})`, filter: appear < 0.99 ? `blur(${(1 - appear) * 12}px)` : undefined }}>
      {/* 다이얼 면 + 기요셰 */}
      <div style={{ position: "absolute", inset: "1.3%", borderRadius: "50%", background: `radial-gradient(circle at 50% 42%, #164A36 0%, #0C2C20 55%, #061810 100%)`, boxShadow: `inset 0 0 60px rgba(0,0,0,0.55), 0 40px 120px rgba(0,0,0,0.5)` }} />
      <div style={{ position: "absolute", inset: "14%", borderRadius: "50%", background: "repeating-radial-gradient(circle at 50% 50%, rgba(244,241,232,0.05) 0 1px, rgba(244,241,232,0) 1px 7px)" }} />
      <div style={{ position: "absolute", inset: "14%", borderRadius: "50%", background: "repeating-conic-gradient(from 0deg, rgba(244,241,232,0.025) 0deg 1deg, rgba(244,241,232,0) 1deg 4deg)" }} />
      {/* 바늘 뒤 빛 꼬리 */}
      {trail > 0.01 && (
        <div style={{ position: "absolute", inset: "4%", borderRadius: "50%", opacity: trail, background: `conic-gradient(from ${angle - 55}deg, rgba(200,240,90,0) 0deg, rgba(200,240,90,0.24) 55deg, rgba(200,240,90,0) 55.3deg)` }} />
      )}
      <svg viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} width={size} height={size} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id="dial-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="dial-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* 베젤 */}
        <circle r={296} fill="none" stroke="rgba(244,241,232,0.28)" strokeWidth={1.5} />
        <circle r={310} fill="none" stroke="rgba(244,241,232,0.10)" strokeWidth={1} />
        <circle r={208} fill="none" stroke="rgba(244,241,232,0.10)" strokeWidth={1} />

        {/* 게이지 아크 */}
        <circle r={258} fill="none" stroke={C.lime} strokeWidth={10} opacity={0.35} strokeDasharray={`${progress * circ} ${circ}`} transform="rotate(-90)" filter="url(#dial-glow)" />
        <circle r={258} fill="none" stroke={C.lime} strokeWidth={3} strokeLinecap="round" strokeDasharray={`${progress * circ} ${circ}`} transform="rotate(-90)" />

        {/* 분 눈금 */}
        {Array.from({ length: 60 }).map((_, i) => {
          const major = i % 5 === 0;
          const quarter = i % 15 === 0;
          const len = quarter ? 30 : major ? 20 : 10;
          const a = polar(i * 6, 284);
          const b = polar(i * 6, 284 - len);
          const on = lit(i);
          const color = major ? C.lime : K.paper;
          return (
            <g key={i}>
              {major && on > 0 && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.lime} strokeWidth={8} opacity={0.4 * on} filter="url(#dial-glow)" />}
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on > 0 ? color : K.paper} strokeOpacity={0.28 + 0.72 * on} strokeWidth={quarter ? 3.4 : major ? 2.4 : 1.3} strokeLinecap="butt" />
            </g>
          );
        })}

        {/* 5분 숫자 */}
        {Array.from({ length: 12 }).map((_, k) => {
          const p = polar(k * 30, 230);
          const on = lit(k * 5);
          return (
            <text key={k} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={k % 3 === 0 ? 36 : 28} fill={on > 0.5 ? C.lime : K.paper} fillOpacity={0.55 + 0.45 * on} style={numeral}>
              {k === 0 ? 60 : k * 5}
            </text>
          );
        })}

        {/* 문자판 글자 + 디지털 창 */}
        <text y={-118} textAnchor="middle" fontSize={15} fill={K.paper} fillOpacity={0.5} letterSpacing="0.32em" style={{ fontFamily: MONO, fontWeight: 600 }}>
          CLASSIN AI
        </text>
        <text y={34} textAnchor="middle" fontSize={14} fill={K.paper} fillOpacity={0.45} letterSpacing="0.34em" style={{ fontFamily: MONO, fontWeight: 500 }}>
          LESSON
        </text>
        <text y={124} textAnchor="middle" fontSize={84} fill={ended ? C.lime : K.paper} style={{ ...numeral, fontVariantNumeric: "tabular-nums lining-nums", letterSpacing: "-0.01em" }}>
          {readout}
        </text>
        <text y={166} textAnchor="middle" fontSize={14} fill={C.lime} fillOpacity={ended ? interpolate(pulse, [0, 8], [0, 1], clamp) : 0} letterSpacing="0.34em" style={{ fontFamily: MONO, fontWeight: 600 }}>
          SESSION END
        </text>

        {/* 바늘 — 그림자, 빛, 본체 */}
        <g transform={`translate(5 7) rotate(${angle})`} opacity={0.45} filter="url(#dial-shadow)">
          <path d="M -3 0 L -0.9 -272 L 0.9 -272 L 3 0 Z" fill="#000" />
          <rect x={-3} y={0} width={6} height={64} fill="#000" />
        </g>
        <g transform={`rotate(${angle})`}>
          {sweeping && <path d="M -3 0 L -0.9 -272 L 0.9 -272 L 3 0 Z" fill={C.lime} opacity={0.5} filter="url(#dial-glow)" />}
          <path d="M -3 0 L -0.9 -272 L 0.9 -272 L 3 0 Z" fill={C.limeBright} />
          <rect x={-3} y={0} width={6} height={58} fill={C.limeBright} />
          <circle cy={52} r={11} fill={K.night} stroke={C.limeBright} strokeWidth={3} />
        </g>
        <circle r={16} fill="#0B2A1F" stroke={C.limeBright} strokeWidth={3} />
        <circle r={4.5} fill={C.limeBright} />

        {/* 종료 펄스 */}
        {pulse >= 0 && pulse < 22 && <circle r={296 + pulse * 1.6} fill="none" stroke={C.lime} strokeWidth={3} opacity={0.7 * (1 - pulse / 22)} />}
      </svg>
    </div>
  );
};

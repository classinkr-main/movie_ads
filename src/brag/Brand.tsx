import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp } from "../lib/motion";

// "Classin AI" 로크업 — AI를 폰트가 아니라 워드마크의 조형 규칙으로 그린다.
// 좌표는 classin-wordmark.png의 픽셀(797×224) 단위: 캡 높이 21–200, 획 두께 33(l 스템),
// 사선 컷 기울기 0.40(i·n의 컷 ≈ 0.36–0.43). A는 n의 아치를 벌린 형태, I는 i 스템의 사선 컷을 따른다.
const WM = { w: 797, h: 224 };
const AI_W = 217;
const WORD_GAP = 46;
const STROKE = 33;
const A_ARCH = "M16.50 230.00 L36.35 75.04 A43.00 43.00 0 0 1 121.65 75.04 L141.50 230.00";
const A_BAR = "M29.51 128.40 L128.49 128.40";
const A_FEET = "M-60 -60 L218.00 -60 L218.00 232.14 L79.00 176.54 L-60 232.14 Z";
const I_STEM = "M184.00 14.40 L217.00 27.60 L217.00 193.40 L184.00 206.60 Z";

const easeOut = Easing.out(Easing.cubic);

export const ClassinAI: React.FC<{ height: number; aiAt: number; id?: string }> = ({ height, aiAt, id = "cai" }) => {
  const frame = useCurrentFrame();
  const f = frame - aiAt;
  const arch = interpolate(f, [0, 16], [0, 1], { ...clamp, easing: easeOut });
  const bar = interpolate(f, [8, 18], [0, 1], { ...clamp, easing: easeOut });
  const stem = interpolate(f, [6, 18], [0, 1], { ...clamp, easing: easeOut });
  const sheen = interpolate(f, [18, 40], [-60, AI_W + 60], clamp);
  const scale = height / WM.h;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: WORD_GAP * scale }}>
      <Img src={staticFile("brand/classin-wordmark.png")} style={{ height, width: "auto", display: "block" }} />
      <svg viewBox={`0 0 ${AI_W} ${WM.h}`} style={{ height, width: AI_W * scale, overflow: "visible", display: "block" }}>
        <defs>
          {/* 새 마크의 그라데이션(#00B67E → #007954)을 써서 'AI'가 지능 쪽임을 살짝 구분한다 */}
          <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1="0" y1="20" x2={AI_W} y2="210">
            <stop offset="0" stopColor="#00B67E" />
            <stop offset="0.55" stopColor="#009B6B" />
            <stop offset="1" stopColor="#007954" />
          </linearGradient>
          <clipPath id={`${id}-feet`}>
            <path d={A_FEET} />
          </clipPath>
          <clipPath id={`${id}-stem`}>
            <rect x={150} y={230 - 240 * stem} width={100} height={240} />
          </clipPath>
          <linearGradient id={`${id}-sheen`} gradientUnits="userSpaceOnUse" x1={sheen - 40} y1="0" x2={sheen + 40} y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[`url(#${id}-g)`, `url(#${id}-sheen)`].map((paint, k) => (
          <g key={k} opacity={k === 1 ? (f > 18 && f < 40 ? 1 : 0) : 1}>
            <g clipPath={`url(#${id}-feet)`}>
              <path d={A_ARCH} fill="none" stroke={paint} strokeWidth={STROKE} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - arch} />
            </g>
            <path d={A_BAR} stroke={paint} strokeWidth={STROKE * 0.82} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - bar} />
            <path d={I_STEM} fill={paint} clipPath={`url(#${id}-stem)`} />
          </g>
        ))}
      </svg>
    </div>
  );
};

import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../lib/motion";

// 분석 · 채점 · 통역 아이콘 — 64 단위 그리드, 둥근 끝 라인, 아이콘마다 포인트 획 하나.
// 획은 그려지듯 나타나고(pathLength 대시), 포인트 획이 마지막에 들어온다.
export type IconKind = "analyze" | "grade" | "translate";

type Stroke = { d: string; accent?: boolean; knockout?: boolean };

const ICONS: Record<IconKind, Stroke[]> = {
  // 렌즈 속 파형 — 수업 음성을 들여다본다
  analyze: [
    { d: "M10 27 A17 17 0 1 0 44 27 A17 17 0 1 0 10 27" },
    { d: "M39.6 39.6 L53 53" },
    { d: "M19 24.5 V29.5 M23 20.5 V33.5 M27 16.5 V37.5 M31 21.5 V32.5 M35 24.5 V29.5", accent: true },
  ],
  // 답안지 + 체크 — 체크가 종이 밖으로 뻗는다
  grade: [
    { d: "M21 9 H37 L47 19 V51 Q47 55 43 55 H21 Q17 55 17 51 V13 Q17 9 21 9 Z" },
    { d: "M37 9 V15.5 Q37 19 40.5 19 H47" },
    { d: "M24 28 H40 M24 35 H34" },
    { d: "M29 45 L35 51 L53 32", accent: true, knockout: true },
  ],
  // 말풍선 두 개 — '가'가 'A'가 된다
  translate: [
    { d: "M13 8 H33 Q38 8 38 13 V25 Q38 30 33 30 H18 L11 36 V30 Q8 29.2 8 25 V13 Q8 8 13 8 Z" },
    { d: "M14 14 H20.5 Q20.5 21.5 14.5 25.5 M25 12.5 V26.5 M25 19.5 H29" },
    { d: "M31 32 H51 Q56 32 56 37 V49 Q56 54 51 54 V59 L45 54 H31 Q26 54 26 49 V37 Q26 32 31 32 Z", accent: true, knockout: true },
    { d: "M36 49 L41 37 L46 49 M38.1 44.5 H43.9", accent: true },
  ],
};

const easeOut = Easing.out(Easing.cubic);

export const DrawIcon: React.FC<{
  kind: IconKind;
  delay: number;
  size: number;
  color: string;
  accent: string;
  bg: string; // 겹치는 획을 끊어 주는 녹아웃 색(배경색)
  stroke?: number;
  style?: React.CSSProperties;
}> = ({ kind, delay, size, color, accent, bg, stroke = 2.2, style }) => {
  const frame = useCurrentFrame();
  const strokes = ICONS[kind];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ display: "block", overflow: "visible", ...style }}>
      {strokes.map((s, i) => {
        const start = delay + i * 4 + (s.accent ? 4 : 0);
        const p = interpolate(frame - start, [0, 14], [0, 1], { ...clamp, easing: easeOut });
        const common = { pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - p, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
        return (
          <g key={i}>
            {s.knockout && <path d={s.d} stroke={bg} strokeWidth={stroke * 3.2} fill={s.d.endsWith("Z") ? bg : "none"} fillOpacity={Math.min(1, p * 4)} {...common} />}
            <path d={s.d} stroke={s.accent ? accent : color} strokeWidth={stroke} {...common} />
          </g>
        );
      })}
    </svg>
  );
};

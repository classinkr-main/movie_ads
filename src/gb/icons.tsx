import React from "react";

// 자체 제작 라인 아이콘 세트 — 24×24 격자, 각진 끝(square cap)·각진 이음(miter).
// draw(0→1)로 획이 그려지며 등장한다.

type Prim = { d: string } | { c: [number, number, number] };

const P = (d: string): Prim => ({ d });
const C = (cx: number, cy: number, r: number): Prim => ({ c: [cx, cy, r] });

export const ICONS = {
  student: [C(12, 7.5, 3.6), P("M4.5 20.5 C5.2 15.9 8.2 13.6 12 13.6 C15.8 13.6 18.8 15.9 19.5 20.5")],
  route: [P("M5 16.5 V12 H12 V5.5 H17"), P("M3 16.5 H7 V20.5 H3 Z"), P("M17 3.5 H21 V7.5 H17 Z")],
  test: [P("M5.5 2.5 H14.5 L18.5 6.5 V21.5 H5.5 Z"), P("M14.5 2.5 V6.5 H18.5"), P("M8.5 14 L11 16.5 L15.5 11.5")],
  book: [P("M3 5 H10 Q12 5 12 7 V20.5 Q12 18.5 10 18.5 H3 Z"), P("M21 5 H14 Q12 5 12 7 V20.5 Q12 18.5 14 18.5 H21 Z")],
  chat: [P("M3 4 H21 V16 H11 L6.5 19.5 V16 H3 Z"), P("M7 8.5 H17"), P("M7 11.8 H13")],
  consult: [P("M2.5 3.5 H14 V11.5 H7.5 L4.5 14 V11.5 H2.5 Z"), P("M16.5 7.5 H21.5 V15.5 H19.5 V18.5 L16 15.5 H9.5 V14")],
  report: [P("M5 2.5 H19 V21.5 H5 Z"), P("M8 7 H16"), P("M8 10.5 H16"), P("M8 14 H12"), P("M13.5 17 L15.2 18.7 L18 15.5")],
  record: [P("M2.5 6 H15.5 V18 H2.5 Z"), P("M15.5 10.5 L21.5 7 V17 L15.5 13.5")],
  ai: [P("M12 2.5 L20.2 7.25 V16.75 L12 21.5 L3.8 16.75 V7.25 Z"), P("M12 7.3 L13.4 10.6 L16.7 12 L13.4 13.4 L12 16.7 L10.6 13.4 L7.3 12 L10.6 10.6 Z")],
  dashboard: [P("M3 3 H10.5 V10.5 H3 Z"), P("M13.5 3 H21 V7.5 H13.5 Z"), P("M13.5 10.5 H21 V21 H13.5 Z"), P("M3 13.5 H10.5 V21 H3 Z")],
  clock: [C(12, 12, 8.8), P("M12 6.8 V12 L15.6 14.2")],
  flag: [P("M6 21.5 V2.5"), P("M6 3.5 H17.5 L15 8 L17.5 12.5 H6")],
  bell: [P("M6 17 V11 Q6 5 12 5 Q18 5 18 11 V17 L19.5 18.5 H4.5 Z"), P("M10 21 H14"), P("M12 2.8 V5")],
  eye: [P("M2 12 Q7 5 12 5 Q17 5 22 12 Q17 19 12 19 Q7 19 2 12 Z"), C(12, 12, 3.2)],
  play: [P("M8 5 L19 12 L8 19 Z")],
  pencil: [P("M4 20 L5 15.5 L15.5 5 L19 8.5 L8.5 19 Z"), P("M13 7.5 L16.5 11")],
  arrow: [P("M3.5 12 H19.5"), P("M14 6.5 L19.5 12 L14 17.5")],
  check: [P("M4.5 12.5 L9.5 17.5 L19.5 6.5")],
  target: [C(12, 12, 8.5), C(12, 12, 3.8), P("M12 1.5 V5"), P("M12 19 V22.5"), P("M1.5 12 H5"), P("M19 12 H22.5")],
  spark: [P("M12 2 L14.3 9.7 L22 12 L14.3 14.3 L12 22 L9.7 14.3 L2 12 L9.7 9.7 Z")],
  megaphone: [P("M3.5 9.5 H7.5 L15.5 5 V19 L7.5 14.5 H3.5 Z"), P("M7.5 14.5 L9 20.5"), P("M18.5 9 Q20.8 12 18.5 15")],
  sun: [C(12, 12, 4), P("M12 2.5 V5"), P("M12 19 V21.5"), P("M2.5 12 H5"), P("M19 12 H21.5"), P("M5.3 5.3 L7 7"), P("M17 17 L18.7 18.7"), P("M5.3 18.7 L7 17"), P("M17 7 L18.7 5.3")],
  interact: [P("M3.5 8.5 H18"), P("M14.5 5 L18 8.5 L14.5 12"), P("M20.5 15.5 H6"), P("M9.5 12 L6 15.5 L9.5 19")],
  voice: [P("M3 10.5 V13.5"), P("M7 7.5 V16.5"), P("M11 4 V20"), P("M15 8 V16"), P("M19 10 V14")],
  calendar: [P("M3.5 5 H20.5 V20.5 H3.5 Z"), P("M3.5 9.5 H20.5"), P("M8 2.5 V7"), P("M16 2.5 V7")],
  list: [P("M9.5 6 H20.5"), P("M9.5 12 H20.5"), P("M9.5 18 H20.5"), P("M3.5 4.5 H6.5 V7.5 H3.5 Z"), P("M3.5 10.5 H6.5 V13.5 H3.5 Z"), P("M3.5 16.5 H6.5 V19.5 H3.5 Z")],
  trend: [P("M3 20.5 H21"), P("M4 16 L9 11 L13 14 L20 6.5"), P("M15.5 6.5 H20 V11")],
  warning: [P("M12 3 L22 20.5 H2 Z"), P("M12 9.5 V14"), P("M12 16.3 V17.6")],
  layers: [P("M12 3 L21.5 8 L12 13 L2.5 8 Z"), P("M2.5 12 L12 17 L21.5 12"), P("M2.5 16 L12 21 L21.5 16")],
} as const;

export type IconName = keyof typeof ICONS;

export const Icon: React.FC<{
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number; // 24 격자 기준 획 두께
  draw?: number; // 0→1 그려지기
  fill?: string;
  style?: React.CSSProperties;
}> = ({ name, size = 24, color = "currentColor", stroke = 1.8, draw = 1, fill = "none", style }) => {
  const prims = ICONS[name] as ReadonlyArray<Prim>;
  const n = prims.length;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: "visible", flexShrink: 0, ...style }}>
      {prims.map((p, i) => {
        // 요소마다 조금씩 늦게 그려진다
        const a = (i / Math.max(1, n)) * 0.45;
        const k = Math.max(0, Math.min(1, (draw - a) / 0.55));
        const common = {
          fill: i === 0 ? fill : "none",
          stroke: color,
          strokeWidth: stroke,
          strokeLinecap: "square" as const,
          strokeLinejoin: "miter" as const,
          pathLength: 1,
          strokeDasharray: "1 1",
          strokeDashoffset: 1 - k,
          opacity: k > 0 ? 1 : 0,
        };
        if ("d" in p) return <path key={i} d={p.d} {...common} />;
        return <circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.c[2]} {...common} />;
      })}
    </svg>
  );
};

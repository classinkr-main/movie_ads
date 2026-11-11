import React from "react";
import { interpolate } from "remotion";
import { CHALK_FONT } from "./fonts";
import { cl } from "./fx";
import { BOARD, K, rgba } from "./theme";

// 판서 한 판 — 중3 수학 · 이차함수의 그래프  y = (x − 2)² + 1
// 좌표계는 보드 화면(1291×681). 그래프 원점 (800,540), 1칸 = 80px.

type Pt = [number, number];
const O: Pt = [800, 540];
const U = 80;
const gx = (x: number) => O[0] + x * U;
const gy = (y: number) => O[1] - y * U;

// 손 떨림 — 저주파 사인 두 개
const wob = (pts: Pt[], phase: number, amp = 1.6): Pt[] => pts.map(([x, y], i) => [x + Math.sin(i * 0.37 + phase) * amp + Math.sin(i * 0.11 + phase * 2) * amp * 0.6, y + Math.cos(i * 0.29 + phase * 1.7) * amp]);
const seg = (a: Pt, b: Pt, n = 24): Pt[] => Array.from({ length: n + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n] as Pt);
const d = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

const X_AXIS = wob(seg([690, 540], [1222, 540], 40), 0.4, 1.3);
const Y_AXIS = wob(seg([800, 628], [800, 96], 40), 1.9, 1.3);
const X_HEAD = d([[1200, 527], [1224, 540], [1200, 553]]);
const Y_HEAD = d([[787, 120], [800, 94], [813, 120]]);
const CURVE: Pt[] = wob(
  Array.from({ length: 71 }, (_, i) => {
    const x = -0.12 + (4.24 * i) / 70;
    return [gx(x), gy((x - 2) * (x - 2) + 1)] as Pt;
  }),
  3.1,
  1.1,
);
const SYM_N = 13;
const SYM: Array<[Pt, Pt]> = Array.from({ length: SYM_N }, (_, i) => {
  const y0 = 150 + i * 30;
  return [[960 + Math.sin(i) * 0.8, y0], [960 + Math.cos(i) * 0.8, y0 + 17]] as [Pt, Pt];
});
const TICKS: Array<[Pt, Pt]> = [
  [[880, 532], [880, 548]],
  [[960, 532], [960, 548]],
  [[1040, 532], [1040, 548]],
  [[1120, 532], [1120, 548]],
  [[792, 460], [808, 460]],
  [[792, 380], [808, 380]],
  [[792, 300], [808, 300]],
  [[792, 220], [808, 220]],
  [[792, 140], [808, 140]],
];
const TITLE_UL = d(wob(seg([66, 136], [548, 140], 30), 5.2, 1.4));
const BOX = d(wob([[58, 176], [668, 172], [674, 298], [62, 304], [58, 176]].flatMap((p, i, a) => (i < a.length - 1 ? seg(p as Pt, a[i + 1] as Pt, 12).slice(0, -1) : [p as Pt])), 7.7, 1.2));

export type LessonP = {
  title: number;
  formula: number;
  xAxis: number;
  yAxis: number;
  curve: number;
  sym: number;
  dot: number;
  label: number;
  bullets: number;
  box: number;
};
export const LESSON_FULL: LessonP = { title: 1, formula: 1, xAxis: 1, yAxis: 1, curve: 1, sym: 1, dot: 1, label: 1, bullets: 1, box: 1 };
export const LESSON_NONE: LessonP = { title: 0, formula: 0, xAxis: 0, yAxis: 0, curve: 0, sym: 0, dot: 0, label: 0, bullets: 0, box: 0 };

const pr = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], cl);

/** 오프닝 매크로 샷의 판서 진행(로컬 프레임) */
export const lessonAt = (f: number): LessonP => ({
  title: 1,
  formula: pr(f, 6, 30),
  xAxis: pr(f, 31, 37),
  yAxis: pr(f, 36, 42),
  curve: pr(f, 41, 70),
  sym: pr(f, 64, 74),
  dot: pr(f, 69, 72),
  label: pr(f, 72, 80),
  bullets: pr(f, 50, 78),
  box: pr(f, 30, 44),
});

const along = (pts: Pt[], t: number): Pt => {
  const k = Math.max(0, Math.min(1, t)) * (pts.length - 1);
  const i = Math.min(pts.length - 2, Math.floor(k));
  const u = k - i;
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
};

const FORMULA_X = 84;
const FORMULA_W = 560;

/** 분필 끝 위치(보드 좌표)와 밝기 */
export const tipAt = (f: number): { x: number; y: number; on: number } => {
  if (f < 6) return { x: FORMULA_X, y: 236, on: pr(f, 2, 6) };
  if (f <= 30) {
    const t = pr(f, 6, 30);
    return { x: FORMULA_X + t * FORMULA_W, y: 236 + Math.sin(f * 2.1) * 20 + Math.sin(f * 0.9) * 8, on: 1 };
  }
  if (f < 36.5) {
    const [x, y] = along(X_AXIS, pr(f, 31, 37));
    return { x, y, on: f < 31 ? 0.35 : 1 };
  }
  if (f < 41.5) {
    const [x, y] = along(Y_AXIS, pr(f, 36, 42));
    return { x, y, on: 1 };
  }
  if (f <= 70) {
    const [x, y] = along(CURVE, pr(f, 41, 70));
    return { x, y, on: 1 };
  }
  if (f <= 80) {
    const t = pr(f, 70, 80);
    return { x: 985 + t * 110, y: 492 + Math.sin(f * 2.3) * 9, on: 1 - pr(f, 76, 80) };
  }
  return { x: 1095, y: 492, on: 0 };
};

const Stroke: React.FC<{ d: string; p: number; w?: number; color: string; opacity?: number }> = ({ d: path, p, w = 5.5, color, opacity = 1 }) =>
  p <= 0.002 ? null : <path d={path} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, p)} opacity={opacity} />;

/**
 * 판서 레이어(SVG, 투명 배경).
 * tint 0 = 분필 흰색 · 1 = 민트로 발광(되살아난 수업)
 */
export const Lesson: React.FC<{
  id: string;
  p: LessonP;
  width?: number;
  tint?: number;
  rough?: boolean; // 분필 질감 필터
  opacity?: number;
  style?: React.CSSProperties;
  defs?: React.ReactNode; // 추가 <defs> (지우개 마스크 등)
  maskId?: string;
}> = ({ id, p, width = BOARD.sw, tint = 0, rough = true, opacity = 1, style, defs, maskId }) => {
  const c = tint > 0.5 ? K.mintHot : K.chalk;
  const accent = K.mint;
  const height = (width * BOARD.sh) / BOARD.sw;
  const text: React.CSSProperties = { fontFamily: CHALK_FONT, fontWeight: 700 };
  const wipe = (key: string, x: number, y: number, w: number, h: number, t: number) => (
    <clipPath id={`${id}-${key}`}>
      <rect x={x} y={y} width={w * Math.min(1, t)} height={h} />
    </clipPath>
  );
  const bullets: Array<[string, string, number]> = [
    ["꼭짓점", "(2, 1)", 392],
    ["축", "x = 2", 470],
    ["y절편", "5", 548],
  ];
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${BOARD.sw} ${BOARD.sh}`}
      style={{ display: "block", opacity, overflow: "visible", filter: tint > 0.02 ? `drop-shadow(0 0 ${6 * tint}px ${rgba(K.mint, 0.85 * tint)}) drop-shadow(0 0 ${22 * tint}px ${rgba(K.mint, 0.45 * tint)})` : undefined, ...style }}
    >
      <defs>
        <filter id={`${id}-chalk`} x="-2%" y="-4%" width="104%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.92" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="disp" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.15" result="holes" />
          <feComposite in="disp" in2="holes" operator="in" />
        </filter>
        {wipe("title", 60, 60, 520, 90, p.title)}
        {wipe("formula", FORMULA_X - 10, 170, FORMULA_W + 30, 140, p.formula)}
        {wipe("label", 975, 455, 150, 70, p.label)}
        {bullets.map(([, , y], i) => wipe(`b${i}`, 70, y - 50, 520, 70, interpolate(p.bullets, [i / 3, (i + 1) / 3], [0, 1], cl)))}
        {defs}
      </defs>
      <g mask={maskId ? `url(#${maskId})` : undefined}>
      <g filter={rough ? `url(#${id}-chalk)` : undefined}>
        {/* 단원 제목 */}
        <g clipPath={`url(#${id}-title)`}>
          <text x={70} y={118} fontSize={50} fill={c} opacity={0.88} style={text}>
            3단원 · 이차함수의 그래프
          </text>
        </g>
        <Stroke d={TITLE_UL} p={p.title} w={4} color={c} opacity={0.7} />

        {/* 식 */}
        <g clipPath={`url(#${id}-formula)`}>
          <text x={FORMULA_X} y={266} fontSize={84} fill={c} style={text} textLength={FORMULA_W} lengthAdjust="spacingAndGlyphs">
            y = (x − 2)
            <tspan dy={-32} fontSize={52}>
              2
            </tspan>
            <tspan dy={32}> + 1</tspan>
          </text>
        </g>
        <Stroke d={BOX} p={p.box} w={4} color={accent} opacity={0.9} />

        {/* 정리 */}
        {bullets.map(([k, v, y], i) => (
          <g key={k} clipPath={`url(#${id}-b${i})`}>
            <text x={84} y={y} fontSize={46} fill={c} opacity={0.9} style={text}>
              <tspan fill={accent}>{`· ${k}`}</tspan>
              <tspan dx={22}>{v}</tspan>
            </text>
          </g>
        ))}

        {/* 좌표축 */}
        <Stroke d={d(X_AXIS)} p={p.xAxis} color={c} w={4.5} />
        {p.xAxis > 0.95 && <path d={X_HEAD} stroke={c} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
        <Stroke d={d(Y_AXIS)} p={p.yAxis} color={c} w={4.5} />
        {p.yAxis > 0.95 && <path d={Y_HEAD} stroke={c} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
        {TICKS.map(([a, b], i) => {
          // 축이 지나간 뒤에 눈금이 찍힌다
          const passed = i < 4 ? p.xAxis > (a[0] - 690) / 532 + 0.06 : p.yAxis > (628 - a[1]) / 532 + 0.06;
          return passed && <path key={i} d={d([a, b])} stroke={c} strokeWidth={3.5} strokeLinecap="round" opacity={0.8} />;
        })}
        {p.xAxis > 0.98 && (
          <text x={1232} y={578} fontSize={40} fill={c} opacity={0.85} style={text}>
            x
          </text>
        )}
        {p.yAxis > 0.98 && (
          <text x={826} y={112} fontSize={40} fill={c} opacity={0.85} style={text}>
            y
          </text>
        )}
        {p.xAxis > 0.98 && (
          <text x={766} y={580} fontSize={34} fill={c} opacity={0.7} style={text}>
            O
          </text>
        )}

        {/* 대칭축(점선) */}
        {SYM.map(([a, b], i) => p.sym * SYM_N > i && <path key={i} d={d([a, b])} stroke={accent} strokeWidth={4} strokeLinecap="round" opacity={0.9} />)}

        {/* 포물선 */}
        <Stroke d={d(CURVE)} p={p.curve} w={7} color={c} />

        {/* 꼭짓점 */}
        {p.dot > 0 && <circle cx={960} cy={460} r={10 * Math.min(1, p.dot) + (p.dot < 1 ? 4 : 0)} fill={accent} />}
        <g clipPath={`url(#${id}-label)`}>
          <text x={982} y={506} fontSize={44} fill={accent} style={text}>
            (2, 1)
          </text>
        </g>
      </g>
      </g>
    </svg>
  );
};

/** 칠판 면 — 슬레이트 그라디언트 + 지운 자국 + 미세 질감 */
export const Slate: React.FC<{ width?: number; id: string; style?: React.CSSProperties }> = ({ width = BOARD.sw, id, style }) => {
  const height = (width * BOARD.sh) / BOARD.sw;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${BOARD.sw} ${BOARD.sh}`} style={{ display: "block", ...style }}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#11211B" />
          <stop offset="0.55" stopColor={K.slate} />
          <stop offset="1" stopColor="#070E0C" />
        </linearGradient>
        <filter id={`${id}-tex`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="3" seed="11" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.75  0 0 0 0 0.9  0 0 0 0 0.82  0 0 0 0.55 -0.2" />
        </filter>
        <filter id={`${id}-fine`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="5" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 -0.2" />
        </filter>
      </defs>
      <rect width={BOARD.sw} height={BOARD.sh} fill={`url(#${id}-g)`} />
      {/* 예전에 지운 자국 — 가로로 번진 분필 가루 */}
      <rect width={BOARD.sw} height={BOARD.sh} filter={`url(#${id}-tex)`} opacity={0.2} />
      <rect width={BOARD.sw} height={BOARD.sh} filter={`url(#${id}-fine)`} opacity={0.07} />
    </svg>
  );
};

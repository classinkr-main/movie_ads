import React from "react";
import { Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Label, MarkerReveal, POP, SOFTPOP, Stroke, pop, useBoil } from "./Ink";
import { Hand, Mark } from "./Lettering";
import { roughEllipse, roughLine, roughPoly, roughRect, rs, scribble, spline } from "./sketch";
import type { Pt } from "./sketch";
import { GAEGU, JUA, P } from "./theme";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** 팡! — 손그림 방사선 */
export const Burst: React.FC<{ x: number; y: number; at: number; r?: number; n?: number; color?: string; w?: number; dur?: number; seed?: string }> = ({
  x,
  y,
  at,
  r = 90,
  n = 9,
  color = P.ink,
  w = 5,
  dur = 12,
  seed = "bu",
}) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  if (f < 0 || f > dur) return null;
  const t = f / dur;
  const e = 1 - Math.pow(1 - t, 3);
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + rs(`${seed}a${i}`) * 0.18;
        const r0 = r * (0.5 + e * 0.45);
        const len = r * 0.34 * (1 - t) * (0.7 + random(`${seed}l${i}`) * 0.6);
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * r0}
            y1={y + Math.sin(a) * r0}
            x2={x + Math.cos(a) * (r0 + len)}
            y2={y + Math.sin(a) * (r0 + len)}
            stroke={color}
            strokeWidth={w * (1 - t * 0.5)}
            strokeLinecap="round"
            opacity={1 - t * t}
          />
        );
      })}
    </g>
  );
};

/** 번호 배지 — 연두 마커 동그라미 + 숫자 */
export const Badge: React.FC<{ x: number; y: number; text: string; at?: number; r?: number; seed?: string }> = ({ x, y, text, at = 0, r = 50, seed = "bd" }) => {
  const frame = useCurrentFrame();
  const boil = useBoil();
  const s = pop(frame - at, POP);
  if (frame < at) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.3 + 0.7 * s}) rotate(${(1 - s) * -30 - 5})`}>
      <path d={`${roughEllipse(0, 0, r, r, `${seed}f`, { overlap: 0, rough: 0.6 })}Z`} fill={P.lime} transform="translate(4 4)" />
      <Stroke d={roughEllipse(0, 0, r, r, `${seed}:${boil}`, { overlap: 0.14 })} w={5} />
      <text x={0} y={r * 0.36} textAnchor="middle" fontFamily={JUA} fontSize={r * 1.05} fill={P.ink}>
        {text}
      </text>
    </g>
  );
};

/** 씬 상단 제목 줄(HTML). 앞 문장은 먹색, 뒷 문장은 브랜드 그린 + 형광펜 */
export const TitleLine: React.FC<{
  a: string;
  b: string;
  atA: number;
  atB: number;
  size?: number;
  left?: number;
  top?: number;
  markFrom?: number; // b 문장에서 형광펜을 칠할 시작 글자 인덱스
  markTo?: number;
  seed?: string;
}> = ({ a, b, atA, atB, size = 90, left = 196, top = 64, markFrom = 0, markTo, seed = "ti" }) => {
  const frame = useCurrentFrame();
  const chars = Array.from(b);
  const to = markTo ?? chars.length;
  const pre = chars.slice(0, markFrom).join("");
  const mid = chars.slice(markFrom, to).join("");
  const post = chars.slice(to).join("");
  return (
    <div style={{ position: "absolute", left, top, display: "flex", alignItems: "baseline", whiteSpace: "pre" }}>
      <Hand text={a} size={size} delay={atA} seed={`${seed}a`} />
      {frame >= atB - 1 && (
        <span style={{ marginLeft: size * 0.36, display: "inline-flex", alignItems: "baseline" }}>
          {pre && <Hand text={pre} size={size} delay={atB} seed={`${seed}p`} color={P.forest} />}
          <Mark delay={atB + pre.length * 1.6 + 8} duration={12} seed={`${seed}m`}>
            <Hand text={mid} size={size} delay={atB + pre.length * 1.6} seed={`${seed}b`} color={P.forest} />
          </Mark>
          {post && <Hand text={post} size={size} delay={atB + (pre.length + mid.length) * 1.6} seed={`${seed}q`} color={P.forest} />}
        </span>
      )}
    </div>
  );
};

/** 포스트잇 */
export const Sticky: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  at: number;
  rotate?: number;
  color?: string;
  seed?: string;
  children?: React.ReactNode;
  tape?: boolean;
}> = ({ x, y, w, h, at, rotate = -3, color = P.note, seed = "st", children, tape = true }) => {
  const frame = useCurrentFrame();
  const boil = useBoil();
  const s = pop(frame - at, SOFTPOP);
  if (frame < at) return null;
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotate + (1 - s) * 14}) scale(${0.4 + 0.6 * s}) translate(${-w / 2} ${-h / 2})`} opacity={Math.min(1, (frame - at) / 3)}>
      <path d={`${roughRect(6, 8, w, h, `${seed}sh`, { rough: 0.5 })}Z`} fill={P.ink} opacity={0.1} />
      <path d={`${roughRect(0, 0, w, h, `${seed}f`, { rough: 0.6 })}Z`} fill={color} />
      <Stroke d={roughRect(0, 0, w, h, `${seed}:${boil}`, { rough: 0.9 })} w={4} />
      {tape && (
        <g transform={`translate(${w / 2 - 44} -16) rotate(-4)`}>
          <rect x={0} y={0} width={88} height={30} fill="#FFFFFF" opacity={0.72} />
          <rect x={0} y={0} width={88} height={30} fill="none" stroke={P.ink} strokeWidth={2} opacity={0.25} />
        </g>
      )}
      {children}
    </g>
  );
};

/** 말풍선 — 타원 + 꼬리 */
export const Bubble: React.FC<{ cx: number; cy: number; rx: number; ry: number; at: number; tail: Pt; seed?: string; fill?: string; children?: React.ReactNode }> = ({
  cx,
  cy,
  rx,
  ry,
  at,
  tail,
  seed = "bb",
  fill = P.sheet,
  children,
}) => {
  const frame = useCurrentFrame();
  const boil = useBoil();
  const s = pop(frame - at, POP);
  if (frame < at) return null;
  // 꼬리가 붙는 타원 위의 두 점
  const ang = Math.atan2(tail[1] - cy, tail[0] - cx);
  const p1: Pt = [cx + Math.cos(ang - 0.22) * rx * 0.96, cy + Math.sin(ang - 0.22) * ry * 0.96];
  const p2: Pt = [cx + Math.cos(ang + 0.22) * rx * 0.96, cy + Math.sin(ang + 0.22) * ry * 0.96];
  const tailD = roughPoly([p1, tail, p2], `${seed}t:${boil}`, { closed: false, rough: 0.7 });
  return (
    <g transform={`translate(${tail[0]} ${tail[1]}) scale(${0.2 + 0.8 * s}) translate(${-tail[0]} ${-tail[1]})`} opacity={Math.min(1, (frame - at) / 2)}>
      <path d={`${roughEllipse(cx, cy, rx, ry, `${seed}f`, { overlap: 0, rough: 0.5 })}Z`} fill={fill} transform="translate(4 5)" />
      <path d={`M${p1[0]},${p1[1]} L${tail[0]},${tail[1]} L${p2[0]},${p2[1]}Z`} fill={fill} />
      <Stroke d={roughEllipse(cx, cy, rx, ry, `${seed}:${boil}`, { overlap: 0.06, start: ang + 0.3 })} w={4.5} />
      <path d={`M${p1[0]},${p1[1]} L${p2[0]},${p2[1]}`} stroke={fill} strokeWidth={9} strokeLinecap="round" />
      <Stroke d={tailD} w={4.5} />
      {children}
    </g>
  );
};

/** 화면 모서리의 스케치북 표시 — 쪽 번호와 작은 로고 */
export const PageMark: React.FC<{ page: string; label?: string; logo?: boolean }> = ({ page, label = "Classin 드로잉 노트", logo = true }) => (
  <>
    {label && <div style={{ position: "absolute", left: 64, bottom: 34, fontFamily: GAEGU, fontWeight: 700, fontSize: 26, color: P.pencil, letterSpacing: "0.02em" }}>{label}</div>}
    <div style={{ position: "absolute", right: 64, bottom: 34, fontFamily: GAEGU, fontWeight: 700, fontSize: 26, color: P.pencil, letterSpacing: "0.04em" }}>p. {page}</div>
    {logo && <Img src={staticFile("00_공통에셋/brand/classin-wordmark.png")} style={{ position: "absolute", right: 64, top: 44, height: 34, width: "auto", opacity: 0.92 }} />}
  </>
);

/** 화면을 덮었다 걷히는 마커 스와이프(씬 전환). 0→1: 덮임, 1→2: 걷힘 */
export const MarkerWipe: React.FC<{ t: number; color?: string; color2?: string; seed?: string; reverse?: boolean }> = ({ t, color = P.lime, color2 = P.limeDeep, seed = "wipe", reverse = false }) => {
  if (t <= 0 || t >= 2) return null;
  const d = scribble(-80, -60, 2080, 1200, seed, { gap: 210, angle: reverse ? 7 : -7, rough: 0.7, over: 0.06 });
  const a = t <= 1 ? 0 : t - 1; // 지워지는 시작점
  const b = Math.min(1, t); // 그려진 끝점
  const seg = (lead: number, c: string, w: number) => {
    const bb = Math.min(1, b + lead);
    const aa = Math.max(0, a - (t > 1 ? 0 : 0));
    return (
      <path
        d={d}
        fill="none"
        stroke={c}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={`${Math.max(0.0001, bb - aa)} 2`}
        strokeDashoffset={-aa}
      />
    );
  };
  return (
    <g transform={reverse ? "translate(1920 0) scale(-1 1)" : undefined}>
      {seg(0.02, color2, 470)}
      {seg(0, color, 440)}
    </g>
  );
};

/** 점선 궤적을 따라 날아가는 작은 알갱이들(판서 → 파일, 수업 → 데이터) */
export const Motes: React.FC<{
  from: readonly Pt[];
  to: readonly Pt[];
  at: number;
  dur?: number;
  n: number;
  seed?: string;
  colors?: readonly string[];
  spread?: number;
  arc?: number;
  r?: number;
  stagger?: number;
}> = ({ from, to, at, dur = 26, n, seed = "mo", colors = [P.chalk, P.lime, P.limeDeep], spread = 26, arc = -120, r = 7, stagger = 0.9 }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const f = frame - at - i * stagger;
        if (f < 0 || f > dur) return null;
        const t = f / dur;
        const e = t * t * (3 - 2 * t);
        const a = from[i % from.length];
        const b = to[Math.floor(random(`${seed}t${i}`) * to.length) % to.length];
        const ax = a[0] + rs(`${seed}ax${i}`) * spread;
        const ay = a[1] + rs(`${seed}ay${i}`) * spread;
        const bx = b[0] + rs(`${seed}bx${i}`) * spread * 0.5;
        const by = b[1] + rs(`${seed}by${i}`) * spread * 0.5;
        const lift = Math.sin(e * Math.PI) * (arc + rs(`${seed}arc${i}`) * 60);
        const x = ax + (bx - ax) * e;
        const y = ay + (by - ay) * e + lift;
        const rr = r * (0.6 + random(`${seed}r${i}`) * 0.8) * (1 - t * 0.35);
        return <circle key={i} cx={x} cy={y} r={rr} fill={colors[i % colors.length]} stroke={P.ink} strokeWidth={2.4} opacity={interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0], CLAMP)} />;
      })}
    </g>
  );
};

/** 손으로 그린 작은 종이(카드) — 접힌 귀퉁이 */
export const Sheet: React.FC<{ x: number; y: number; w: number; h: number; seed: string; fold?: number; fill?: string; draw?: number; ink?: number; children?: React.ReactNode; lw?: number }> = ({
  x,
  y,
  w,
  h,
  seed,
  fold = 34,
  fill = P.sheet,
  draw = 1,
  ink = 1,
  children,
  lw = 4.5,
}) => {
  const boil = useBoil();
  const pts: Pt[] = [
    [x, y],
    [x + w - fold, y],
    [x + w, y + fold],
    [x + w, y + h],
    [x, y + h],
  ];
  return (
    <g>
      <MarkerReveal box={[x, y, w, h]} p={ink} seed={`${seed}rv`}>
        <path d={`${roughPoly(pts, `${seed}sh`, { closed: true, rough: 0.4 })}Z`} fill={P.ink} opacity={0.09} transform="translate(8 10)" />
        <path d={`${roughPoly(pts, `${seed}f`, { closed: true, rough: 0.5 })}Z`} fill={fill} />
      </MarkerReveal>
      <Stroke d={roughPoly(pts, `${seed}:${boil}`, { closed: true })} w={lw} draw={draw} />
      {fold > 0 && <Stroke d={roughPoly([[x + w - fold, y], [x + w - fold, y + fold], [x + w, y + fold]], `${seed}fd:${boil}`, { rough: 0.6 })} w={lw * 0.8} draw={Math.max(0, draw * 2 - 1)} />}
      {children}
    </g>
  );
};

/** 여러 점을 잇는 손그림 꺾은선(차트용) */
export const ChartLine: React.FC<{ pts: readonly Pt[]; seed: string; color?: string; w?: number; draw?: number; smooth?: boolean }> = ({ pts, seed, color = P.limeDeep, w = 6, draw = 1, smooth = true }) => {
  const boil = useBoil();
  const j = pts.map((p, i) => [p[0] + rs(`${seed}x${i}:${boil}`) * 1.2, p[1] + rs(`${seed}y${i}:${boil}`) * 1.2] as const);
  return <Stroke d={smooth ? spline(j, false, 0.7) : roughPoly(pts, `${seed}:${boil}`, { rough: 0.6 })} color={color} w={w} draw={draw} />;
};

/** 손그림 물음표·느낌표 같은 작은 글자 기호(팝 등장) */
export const Glyph: React.FC<{ x: number; y: number; at: number; text: string; size?: number; color?: string; rotate?: number; until?: number; font?: string }> = ({
  x,
  y,
  at,
  text,
  size = 60,
  color = P.ink,
  rotate = 0,
  until,
  font = JUA,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const s = pop(frame - at, POP);
  const out = until !== undefined ? interpolate(frame, [until, until + 6], [1, 0], CLAMP) : 1;
  if (out <= 0) return null;
  return (
    <Label x={x} y={y} size={size} font={font} color={color} anchor="middle" rotate={rotate + (1 - s) * 20} p={s * out} weight={400}>
      {text}
    </Label>
  );
};

export { roughLine };

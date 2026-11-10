import { random } from "remotion";

// 손그림 경로 생성기 — 전부 결정론적(seed 기반)이라 프레임마다 같은 결과가 나온다.
// seed 끝에 boil 인덱스를 붙여 주면 선이 살짝씩 달라지며 "끓는" 손그림 애니메이션 느낌이 난다.

export type Pt = readonly [number, number];

/** -1..1 */
export const rs = (seed: string) => random(seed) * 2 - 1;

/** 선 전체의 비뚤빼뚤함 배율 */
export const WOBBLE = 2.3;

/**
 * 흔들림 값(-1..1 근처). seed가 "이름:boil" 꼴이면
 * 고정 성분(그림마다 정해진 비뚤빼뚤함) + boil 성분(프레임마다 살짝 떨리는 생동감)으로 나눠 섞는다.
 */
export const rj = (seed: string, key: string) => {
  const i = seed.lastIndexOf(":");
  if (i < 0) return rs(seed + key);
  return rs(seed.slice(0, i) + key) * 0.78 + rs(seed + key) * 0.42;
};
const f = (n: number) => Math.round(n * 10) / 10;

/** Catmull-Rom 스플라인 → 큐빅 베지어 경로(단일 서브패스 → 드로온 가능) */
export const spline = (pts: readonly Pt[], closed = false, k = 1): string => {
  const n = pts.length;
  if (n < 2) return "";
  const get = (i: number) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * k;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * k;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * k;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * k;
    d += `C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
};

/** 점마다 살짝 흔들기 */
export const jitter = (pts: readonly Pt[], seed: string, amp: number): Pt[] =>
  pts.map((p, i) => [p[0] + rj(seed, `x${i}`) * amp, p[1] + rj(seed, `y${i}`) * amp] as const);

/** a→b 사이를 일정 간격으로 나눈 점들을 수직 방향으로 흔든다(끝점 제외) */
const wobbleBetween = (a: Pt, b: Pt, seed: string, amp: number, step = 46): Pt[] => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const n = Math.max(2, Math.round(len / step));
  const bow = rj(seed, "bow") * amp * 0.9;
  const out: Pt[] = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const o = bow * Math.sin(t * Math.PI) + rj(seed, `m${i}`) * amp;
    const along = rj(seed, `t${i}`) * Math.min(6, len * 0.02);
    out.push([a[0] + dx * t + nx * o + (dx / len) * along, a[1] + dy * t + ny * o + (dy / len) * along]);
  }
  return out;
};

/** 손으로 그은 직선 — 끝점이 어긋나고 중간중간 비뚤빼뚤하다 */
export const roughLine = (a: Pt, b: Pt, seed: string, rough = 1): string => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const k = rough * WOBBLE;
  const amp = Math.min(0.9 + len * 0.008, 3.4) * k;
  const e = 1.5 * k;
  const a2: Pt = [a[0] + rj(seed, "ax") * e, a[1] + rj(seed, "ay") * e];
  const b2: Pt = [b[0] + rj(seed, "bx") * e, b[1] + rj(seed, "by") * e];
  return spline([a2, ...wobbleBetween(a2, b2, seed, amp), b2]);
};

/** 꺾은선 — 모서리는 각지게(살짝 삐져나오게), 각 변은 비뚤빼뚤하게. 닫으면 끝점이 시작점을 지나친다 */
export const roughPoly = (pts: readonly Pt[], seed: string, opts: { closed?: boolean; rough?: number } = {}): string => {
  const { closed = false, rough = 1 } = opts;
  const k = rough * WOBBLE;
  const e = 1.5 * k;
  const v = jitter(pts, `${seed}`, e);
  const n = v.length;
  let d = `M${f(v[0][0])},${f(v[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = v[i];
    const b: Pt = i + 1 < n ? v[i + 1] : [v[0][0] + rj(seed, "cx") * e * 1.8, v[0][1] + rj(seed, "cy") * e * 1.8];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const amp = Math.min(0.8 + len * 0.007, 3) * k;
    const mids = wobbleBetween(a, b, `${seed}`.replace(/(:[^:]*)?$/, (m) => `s${i}${m}`), amp);
    // 변 하나를 스플라인으로 잇되, 꼭짓점에서는 꺾이도록 변마다 따로 만든다
    const seg = spline([a, ...mids, b]);
    d += seg.slice(seg.indexOf("C"));
  }
  return d;
};

/** 사각형. r > 0 이면 모서리를 굴린다(스플라인으로 자연스럽게) */
export const roughRect = (x: number, y: number, w: number, h: number, seed: string, opts: { rough?: number; r?: number } = {}): string => {
  const { rough = 1, r = 0 } = opts;
  if (r <= 0) {
    return roughPoly(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      seed,
      { closed: true, rough },
    );
  }
  const rr = Math.min(r, w / 2, h / 2);
  const c = rr * 0.29; // 모서리 곡률 보정점
  const pts: Pt[] = [
    [x + rr, y],
    [x + w / 2, y],
    [x + w - rr, y],
    [x + w - c, y + c],
    [x + w, y + rr],
    [x + w, y + h / 2],
    [x + w, y + h - rr],
    [x + w - c, y + h - c],
    [x + w - rr, y + h],
    [x + w / 2, y + h],
    [x + rr, y + h],
    [x + c, y + h - c],
    [x, y + h - rr],
    [x, y + h / 2],
    [x, y + rr],
    [x + c, y + c],
  ];
  const j = jitter(pts, seed, 1.5 * rough * WOBBLE);
  // 시작점을 살짝 지나쳐 겹치게 닫는다
  return spline([...j, [j[0][0] + rj(seed, "ox") * 4, j[0][1] + rj(seed, "oy") * 4], [j[1][0] + rj(seed, "px") * 4, j[1][1] + rj(seed, "py") * 4]], false);
};

/** 타원 — 손으로 한 바퀴 돌리고 조금 더 겹쳐 그린 느낌 */
export const roughEllipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: string,
  opts: { rough?: number; overlap?: number; start?: number; n?: number } = {},
): string => {
  const { rough = 1, overlap = 0.12, start = -Math.PI * 0.62, n = 12 } = opts;
  const amp = (Math.min(rx, ry) * 0.024 + 0.8) * rough * WOBBLE;
  const total = Math.ceil(n * (1 + overlap));
  const pts: Pt[] = [];
  for (let i = 0; i <= total; i++) {
    const a = start + (i / n) * Math.PI * 2;
    const drift = i > n ? (i - n) * amp * 0.5 : 0; // 겹치는 구간은 살짝 안쪽으로
    const jr = rj(seed, `r${i}`) * amp - drift;
    pts.push([cx + Math.cos(a) * (rx + jr), cy + Math.sin(a) * (ry + jr)]);
  }
  return spline(pts, false);
};

/** 닫힌 덩어리(캐릭터 몸통 등) — 채우기용 */
export const blob = (pts: readonly Pt[], seed: string, amp = 1.2): string => `${spline(jitter(pts, seed, amp), true)}Z`;

/** 마커 지그재그 — 사각 영역을 왔다 갔다 칠한다. 채우기 리빌 마스크·형광펜·전환에 쓴다 */
export const scribble = (
  x: number,
  y: number,
  w: number,
  h: number,
  seed: string,
  opts: { gap?: number; angle?: number; rough?: number; over?: number } = {},
): string => {
  const { gap = 30, angle = -8, rough = 1, over = 0.03 } = opts;
  const rows = Math.max(2, Math.ceil(h / gap) + 1);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const pts: Pt[] = [];
  for (let i = 0; i < rows; i++) {
    const t = rows === 1 ? 0.5 : i / (rows - 1);
    const py = y + t * h;
    const l = x - w * over + rj(seed, `l${i}`) * gap * 0.3 * rough;
    const r = x + w * (1 + over) + rj(seed, `r${i}`) * gap * 0.3 * rough;
    const jy = rj(seed, `y${i}`) * gap * 0.16 * rough;
    const row: Pt[] = i % 2 === 0 ? [[l, py + jy], [r, py + jy + gap * 0.25]] : [[r, py + jy], [l, py + jy + gap * 0.25]];
    for (const p of row) {
      const dx = p[0] - cx;
      const dy = p[1] - cy;
      pts.push([cx + dx * cos - dy * sin, cy + dx * sin + dy * cos]);
    }
  }
  return spline(pts, false, 0.55);
};

/** 빗금 — 영역을 덮는 평행선들. clipPath와 함께 쓴다 */
export const hatch = (x: number, y: number, w: number, h: number, seed: string, opts: { gap?: number; angle?: number; rough?: number } = {}): string[] => {
  const { gap = 14, angle = -45, rough = 1 } = opts;
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const half = Math.hypot(w, h) / 2;
  const count = Math.ceil((half * 2) / gap);
  const out: string[] = [];
  for (let i = 0; i <= count; i++) {
    const off = -half + i * gap + rj(seed, `o${i}`) * gap * 0.18 * rough;
    const ox = cx + -dy * off;
    const oy = cy + dx * off;
    out.push(roughLine([ox - dx * half, oy - dy * half], [ox + dx * half, oy + dy * half], `${seed}h${i}`, rough * 0.7));
  }
  return out;
};

/** 휘어진 화살표 — 몸통과 촉을 따로 돌려준다 */
export const arrow = (a: Pt, b: Pt, seed: string, opts: { bend?: number; head?: number; rough?: number } = {}): { shaft: string; head: string } => {
  const { bend = 0.18, head = 20, rough = 1 } = opts;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const m: Pt = [a[0] + dx * 0.5 + nx * len * bend, a[1] + dy * 0.5 + ny * len * bend];
  const e = 1.4 * rough;
  const a2: Pt = [a[0] + rj(seed, `ax`) * e, a[1] + rj(seed, `ay`) * e];
  const b2: Pt = [b[0] + rj(seed, `bx`) * e, b[1] + rj(seed, `by`) * e];
  const shaft = spline([a2, m, b2], false);
  // 끝 방향 = 가운데 제어점 → 끝점
  const tx = b2[0] - m[0];
  const ty = b2[1] - m[1];
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl;
  const uy = ty / tl;
  const wing = (s: number): Pt => {
    const ang = s * 0.5 + rj(seed, `w${s}`) * 0.08;
    const c = Math.cos(ang);
    const sn = Math.sin(ang);
    return [b2[0] - (ux * c - uy * sn) * head, b2[1] - (uy * c + ux * sn) * head];
  };
  const w1 = wing(1);
  const w2 = wing(-1);
  const headPath = `M${f(w1[0])},${f(w1[1])}L${f(b2[0])},${f(b2[1])}L${f(w2[0])},${f(w2[1])}`;
  return { shaft, head: headPath };
};

/** 네 꼭지 반짝이 */
export const sparkle = (cx: number, cy: number, r: number, seed: string): string => {
  const k = 0.28;
  const pts: Pt[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * k;
    pts.push([cx + Math.cos(a) * rr + rj(seed, `x${i}`) * r * 0.05, cy + Math.sin(a) * rr + rj(seed, `y${i}`) * r * 0.05]);
  }
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 1; i <= 8; i++) {
    const p = pts[i % 8];
    d += `Q${f(cx + (pts[i - 1][0] + p[0] - 2 * cx) * 0.22)},${f(cy + (pts[i - 1][1] + p[1] - 2 * cy) * 0.22)} ${f(p[0])},${f(p[1])}`;
  }
  return `${d}Z`;
};

/** 별(다섯 꼭지) */
export const star = (cx: number, cy: number, r: number, seed: string, inner = 0.46): string => {
  const pts: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * inner;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return roughPoly(pts, seed, { closed: true, rough: Math.max(0.4, r / 40) });
};

/** 체크 표시 */
export const check = (x: number, y: number, s: number, seed: string): string =>
  spline(
    jitter(
      [
        [x, y + s * 0.5],
        [x + s * 0.36, y + s * 0.86],
        [x + s * 1.05, y],
      ],
      seed,
      s * 0.03,
    ),
    false,
    0.3,
  );

/** 물결선 */
export const wave = (x: number, y: number, w: number, seed: string, opts: { amp?: number; len?: number; phase?: number } = {}): string => {
  const { amp = 10, len = 80, phase = 0 } = opts;
  const n = Math.ceil(w / (len / 2));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const px = x + (i / n) * w;
    pts.push([px, y + Math.sin((i * Math.PI) + phase) * amp + rj(seed, `${i}`) * amp * 0.12]);
  }
  return spline(pts, false);
};

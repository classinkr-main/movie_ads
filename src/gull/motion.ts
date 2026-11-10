import { interpolate } from "remotion";
import type { Pt } from "./sketch";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** 폴짝 — 움츠렸다(ant) 뛰고(air) 착지하며 눌린다(land) */
export const hop = (f: number, start: number, opts: { ant?: number; air?: number; height?: number; land?: number } = {}) => {
  const { ant = 5, air = 14, height = 120, land = 9 } = opts;
  const t = f - start;
  if (t < 0) return { lift: 0, squash: 0, air: false };
  if (t < ant) return { lift: 0, squash: 0.17 * Math.sin(((t + 1) / ant) * (Math.PI / 2)), air: false };
  if (t < ant + air) {
    const k = (t - ant + 0.5) / air;
    return { lift: height * 4 * k * (1 - k), squash: -0.11 * Math.abs(2 * k - 1), air: true };
  }
  if (t < ant + air + land) {
    const k = (t - ant - air) / land;
    return { lift: 0, squash: 0.19 * (1 - k) * Math.cos(k * Math.PI * 1.4), air: false };
  }
  return { lift: 0, squash: 0, air: false };
};

/** 닫힌 꺾은선 위의 t(0~1) 지점 */
export const pointOn = (pts: readonly Pt[], t: number, closed = true): Pt => {
  const n = pts.length;
  const segs = closed ? n : n - 1;
  const u = Math.max(0, Math.min(0.9999, t)) * segs;
  const i = Math.floor(u);
  const k = u - i;
  const a = pts[i % n];
  const b = pts[(i + 1) % n];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
};

/** 여러 키프레임 사이를 부드럽게 잇는 2D 보간 */
export const path2 = (frame: number, keys: readonly (readonly [number, number, number])[], easing?: (t: number) => number): Pt => {
  const fs = keys.map((k) => k[0]);
  return [interpolate(frame, fs, keys.map((k) => k[1]), { ...CLAMP, easing }), interpolate(frame, fs, keys.map((k) => k[2]), { ...CLAMP, easing })];
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
/** from~to 구간에서만 1(양끝 fade 프레임만큼 부드럽게) */
export const span = (frame: number, from: number, to: number, fade = 6) => interpolate(frame, [from, from + fade, to - fade, to], [0, 1, 1, 0], CLAMP);

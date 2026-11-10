import { Easing, interpolate, spring } from "remotion";

export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// 스프링 프리셋 — 키네틱 타이포용(오버슈트) / 레이아웃용(무오버슈트)
export const PUNCH = { damping: 14, stiffness: 230, mass: 0.75 };
export const SNAP = { damping: 18, stiffness: 320, mass: 0.6 };
export const SMOOTH = { damping: 200, stiffness: 120, mass: 1 };
export const SOFT = { damping: 26, stiffness: 110, mass: 1 };

export const easeOutExpo = Easing.out(Easing.exp);
export const easeInOutCubic = Easing.inOut(Easing.cubic);
export const easeOutBack = Easing.out(Easing.back(1.6));

export const sp = (
  frame: number,
  fps: number,
  config: { damping: number; stiffness: number; mass: number } = PUNCH,
  durationInFrames?: number,
) => spring({ frame, fps, config, durationInFrames });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const progress = (frame: number, from: number, to: number, easing = easeOutExpo) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing });

export const fadeOut = (frame: number, end: number, len = 8) =>
  interpolate(frame, [end - len, end], [1, 0], clamp);

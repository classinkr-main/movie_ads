import { Easing, interpolate, random, spring } from "remotion";
import { FPS } from "./theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 스프링 프리셋 — 60fps 기준. 슬램(오버슈트) / 스냅(빠른 안착) / 팝(라벨) / 소프트(카메라)
type SpringConfig = { damping: number; stiffness: number; mass: number };
export const SLAM: SpringConfig = { damping: 12, stiffness: 340, mass: 0.7 };
export const SNAP: SpringConfig = { damping: 22, stiffness: 420, mass: 0.6 };
export const POP: SpringConfig = { damping: 13, stiffness: 280, mass: 0.6 };
export const SOFT: SpringConfig = { damping: 30, stiffness: 110, mass: 1 };

export const ease = {
  out: Easing.out(Easing.cubic),
  outExpo: Easing.out(Easing.exp),
  outQuint: Easing.out(Easing.poly(5)),
  in: Easing.in(Easing.cubic),
  inExpo: Easing.in(Easing.exp),
  inOut: Easing.inOut(Easing.cubic),
  outBack: Easing.out(Easing.back(1.7)),
};

export const sp = (frame: number, config: SpringConfig = SLAM) => spring({ frame, fps: FPS, config });

export const prog = (frame: number, from: number, to: number, easing: (t: number) => number = ease.out) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 결정론적 흔들림 — start부터 decay 프레임 동안 제곱으로 줄어든다
export const shake = (frame: number, start: number, amp: number, decay = 16, seed = "s") => {
  const t = frame - start;
  if (t < 0 || t > decay) return { x: 0, y: 0, r: 0 };
  const k = (1 - t / decay) ** 2 * amp;
  return {
    x: (random(`${seed}x${frame}`) - 0.5) * 2 * k,
    y: (random(`${seed}y${frame}`) - 0.5) * 2 * k,
    r: (random(`${seed}r${frame}`) - 0.5) * k * 0.06,
  };
};

// 주어진 히트 프레임들 중 가장 최근 히트로부터 지난 프레임 수
export const sinceLast = (frame: number, hits: readonly number[]) => {
  let best = Infinity;
  for (const h of hits) if (frame >= h) best = Math.min(best, frame - h);
  return best;
};

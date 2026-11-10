// 프레임 결정론적 모션 유틸. 모든 값은 frame 의 순수 함수입니다(Math.random 금지).
export type V3 = [number, number, number];

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export const E = {
  lin: (t: number) => t,
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  out5: (t: number) => 1 - Math.pow(1 - t, 5),
  in: (t: number) => t * t * t,
  io: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  ioSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  expo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  back: (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  backBig: (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const c1 = 2.8;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  backIn: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  elastic: (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

/** [start, start+dur] 구간을 0→1 로. */
export const tw = (frame: number, start: number, dur: number, ease: (t: number) => number = E.out) =>
  ease(clamp((frame - start) / Math.max(1, dur)));

/** 오버슈트가 있는 등장 스케일 0→1 */
export const pop = (frame: number, start: number, dur = 13) => (frame < start ? 0 : E.back(clamp((frame - start) / dur)));

/** 등장 후 퇴장까지: 0→1→0 */
export const inOut = (frame: number, start: number, end: number, din = 10, dout = 8) =>
  Math.min(tw(frame, start, din, E.back), 1 - tw(frame, end - dout, dout, E.in));

/** t0 이후 감쇠 진동(충격·흔들림). */
export const ring = (frame: number, t0: number, amp = 1, freq = 0.9, decay = 0.13) =>
  frame < t0 ? 0 : amp * Math.exp(-decay * (frame - t0)) * Math.sin(freq * (frame - t0));

/** land 프레임에 착지하는 낙하. y 오프셋과 스쿼시(sy: 세로, sxz: 가로)를 돌려줍니다. */
export const drop = (frame: number, land: number, height = 5, fall = 9) => {
  if (frame < land - fall) return { y: height, sy: 1, sxz: 1, vis: false };
  if (frame < land) {
    const t = (frame - (land - fall)) / fall;
    return { y: height * (1 - t * t), sy: 1 + 0.16 * t, sxz: 1 - 0.07 * t, vis: true };
  }
  const k = frame - land;
  const s = Math.exp(-0.24 * k) * Math.cos(k * 0.95) * 0.3;
  return { y: 0, sy: 1 - s, sxz: 1 + s * 0.6, vis: true };
};

const fract = (x: number) => x - Math.floor(x);
/** 시드 기반 0..1 난수 */
export const rnd = (seed: number) => fract(Math.sin(seed * 127.1 + 311.7) * 43758.5453);
/** 부드러운 흔들림 -1..1 */
export const wig = (frame: number, seed = 0, speed = 1) =>
  Math.sin(frame * 0.071 * speed + seed * 7.31) * 0.6 + Math.sin(frame * 0.163 * speed + seed * 3.17) * 0.4;

export type Cam = { p: V3; t: V3; fov: number; roll?: number };

export const camMix = (a: Cam, b: Cam, t: number): Cam => ({
  p: lerp3(a.p, b.p, t),
  t: lerp3(a.t, b.t, t),
  fov: lerp(a.fov, b.fov, t),
  roll: lerp(a.roll ?? 0, b.roll ?? 0, t),
});

/** 카메라 키프레임 보간. keys = [프레임, 카메라, 이 키로 들어올 때의 이징] */
export const camPath = (frame: number, keys: Array<[number, Cam, ((t: number) => number)?]>): Cam => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (frame <= keys[i][0]) {
      const [f0, c0] = keys[i - 1];
      const [f1, c1, ease] = keys[i];
      return camMix(c0, c1, (ease ?? E.io)(clamp((frame - f0) / Math.max(1, f1 - f0))));
    }
  }
  return keys[keys.length - 1][1];
};

/** 손떨림 수준의 미세한 드리프트 + 충격 셰이크를 얹습니다. */
export const camLive = (cam: Cam, frame: number, opts: { drift?: number; shakeAt?: number[]; shakeAmp?: number } = {}): Cam => {
  const d = opts.drift ?? 0.06;
  let sx = wig(frame, 1, 0.6) * d;
  let sy = wig(frame, 2, 0.5) * d * 0.6;
  for (const t0 of opts.shakeAt ?? []) {
    const a = (opts.shakeAmp ?? 0.22) * (frame >= t0 ? Math.exp(-0.28 * (frame - t0)) : 0);
    sx += Math.sin((frame - t0) * 2.9) * a;
    sy += Math.cos((frame - t0) * 3.7) * a;
  }
  return { ...cam, p: [cam.p[0] + sx, cam.p[1] + sy, cam.p[2]], t: [cam.t[0] + sx * 0.5, cam.t[1] + sy * 0.5, cam.t[2]] };
};

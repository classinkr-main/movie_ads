// 시네마틱 브랜드 필름(20초 · 600f @30fps)의 스코어 + 사운드 디자인을 코드로 합성한다(샘플·외부 음원·npm 의존성 없음).
//   node scripts/make-cinematic-score.mjs   → public/audio/cinematic-score.wav (48 kHz · 16-bit · stereo · 정확히 960000 샘플)
//   ffmpeg -y -loglevel error -i public/audio/cinematic-score.wav -c:a aac -b:a 256k public/audio/cinematic-score.m4a
//   SCORE_DEBUG=1 node scripts/make-cinematic-score.mjs   → 그룹(스템)별 레벨 표까지 출력
//
// 120 BPM · 4/4 · D minor → 마지막에 D major. 한 박 = 15f, 한 마디 = 60f, 1f = 1600 샘플(정수)이라
// 모든 큐는 프레임 단위로 샘플 정확도를 갖는다. 영상 타이밍(src/cinematic/*)을 바꾸면 아래 "큐 시트"도 함께 고친다.
// 결정적(deterministic): 시드 고정 PRNG 만 쓰므로 몇 번을 돌려도 같은 파일이 나온다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SR = 48000;
const FPS = 30;
const SPF = SR / FPS; // 프레임당 1600 샘플
const TOTAL_FRAMES = 600;
const N = TOTAL_FRAMES * SPF; // 960000
const TAU = Math.PI * 2;

const HIT1 = 120; // IMPACT 1 (3마디 첫 박)
const HIT2 = 480; // IMPACT 2 (9마디 첫 박)
const EIGHTH = 7.5;
const SIXTEENTH = 3.75;

const DEBUG = !!process.env.SCORE_DEBUG;

// ───────────────────────── 유틸 ─────────────────────────
const dB = (v) => Math.pow(10, v / 20);
const toDb = (v) => 20 * Math.log10(Math.max(v, 1e-12));
const smooth = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
const expLerp = (a, b, k) => a * Math.pow(b / a, k);
const cents = (c) => Math.pow(2, c / 1200);
const F = (frame) => Math.round(frame * SPF);

// 시드 고정 PRNG — 큐 묶음마다 reseed 해서, 한 악기를 고쳐도 다른 악기의 난수가 바뀌지 않게 한다
const SEED = 20261111;
const hashStr = (s) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const mulberry32 = (a) => () => {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
let rnd = mulberry32(SEED);
const reseed = (label) => {
  rnd = mulberry32(hashStr(label) ^ SEED);
};
const noise = () => rnd() * 2 - 1;
const rr = (a, b) => a + (b - a) * rnd();

const NOTE = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const n2f = (name) => {
  const m = /^([A-G][#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`bad note ${name}`);
  return 440 * Math.pow(2, (NOTE[m[1]] + (Number(m[2]) + 1) * 12 - 69) / 12);
};

// ───────────────────────── 믹스 버스 ─────────────────────────
// 구간 A(0–f120) · B(f120–f480) · C(f480–) 가 각자 드라이/리버브 버스를 가진다.
// 임팩트 직전의 "진공"에서 앞 구간을 리버브 꼬리까지 통째로 잘라내기 위해서다.
const newBus = () => [new Float32Array(N), new Float32Array(N)];
const SECTIONS = [0, 1, 2].map(() => ({ dry: newBus(), rev: newBus() }));
const STEMS = DEBUG ? new Map() : null;

/** 신호(모노 Float32Array 또는 {L,R})를 프레임 위치에 올린다. pan 은 숫자 또는 (0..1)=>pan 함수 */
function place(sig, frame, { gain = 1, pan = 0, send = 0, dry = 1, group = "misc", section } = {}) {
  const start = F(frame);
  const stereo = !(sig instanceof Float32Array);
  const sl = stereo ? sig.L : sig;
  const sr = stereo ? sig.R : sig;
  const secIdx = section ?? (start < F(HIT1) ? 0 : start < F(HIT2) ? 1 : 2);
  const [dl, dr] = SECTIONS[secIdx].dry;
  const [rl, rrr] = SECTIONS[secIdx].rev;
  let stem = null;
  if (STEMS) {
    if (!STEMS.has(group)) STEMS.set(group, newBus());
    stem = STEMS.get(group);
  }
  const panFn = typeof pan === "function" ? pan : null;
  let gl = 0;
  let gr = 0;
  const setPan = (p) => {
    if (stereo) {
      gl = gain * Math.min(1, 1 - p);
      gr = gain * Math.min(1, 1 + p);
    } else {
      const a = ((Math.max(-1, Math.min(1, p)) + 1) * Math.PI) / 4;
      gl = gain * Math.cos(a);
      gr = gain * Math.sin(a);
    }
  };
  if (!panFn) setPan(pan);
  const len = sl.length;
  for (let i = 0; i < len; i++) {
    const j = start + i;
    if (j < 0) continue;
    if (j >= N) break;
    if (panFn && (i & 63) === 0) setPan(panFn(i / len));
    const l = sl[i] * gl;
    const r = sr[i] * gr;
    dl[j] += l * dry;
    dr[j] += r * dry;
    if (send > 0) {
      rl[j] += l * send;
      rrr[j] += r * send;
    }
    if (stem) {
      stem[0][j] += l * dry;
      stem[1][j] += r * dry;
    }
  }
}

// ───────────────────────── DSP 기본기 ─────────────────────────
const onePoleLP = (x, hz) => {
  const a = 1 - Math.exp((-TAU * hz) / SR);
  let y = 0;
  for (let i = 0; i < x.length; i++) {
    y += a * (x[i] - y);
    x[i] = y;
  }
  return x;
};
const onePoleHP = (x, hz) => {
  const a = 1 - Math.exp((-TAU * hz) / SR);
  let y = 0;
  for (let i = 0; i < x.length; i++) {
    y += a * (x[i] - y);
    x[i] -= y;
  }
  return x;
};

const LP = 0;
const BP = 1; // 중심 주파수에서 이득 1 로 정규화한 밴드패스
const HP = 2;
/** TPT 상태변수 필터(높은 컷오프·빠른 스윕에도 안정). fc 는 Hz 또는 (k 0..1, i)=>Hz */
function svf(x, type, fc, q = 0.707) {
  const fn = typeof fc === "function" ? fc : null;
  const k = 1 / q;
  let ic1 = 0;
  let ic2 = 0;
  let a1 = 0;
  let a2 = 0;
  let a3 = 0;
  const set = (hz) => {
    const g = Math.tan((Math.PI * Math.min(Math.max(hz, 10), SR * 0.45)) / SR);
    a1 = 1 / (1 + g * (g + k));
    a2 = g * a1;
    a3 = g * a2;
  };
  if (!fn) set(fc);
  const n = x.length;
  for (let i = 0; i < n; i++) {
    if (fn && (i & 15) === 0) set(fn(i / n, i));
    const v3 = x[i] - ic2;
    const v1 = a1 * ic1 + a2 * v3;
    const v2 = ic2 + a2 * ic1 + a3 * v3;
    ic1 = 2 * v1 - ic1;
    ic2 = 2 * v2 - ic2;
    x[i] = type === LP ? v2 : type === BP ? k * v1 : x[i] - k * v1 - v2;
  }
  return x;
}

/** RBJ 바이쿼드(마스터용). coef = [b0,b1,b2,a1,a2] (a0 정규화) */
function biquad(x, [b0, b1, b2, a1, a2]) {
  let z1 = 0;
  let z2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = x[i];
    const y = b0 * v + z1;
    z1 = b1 * v - a1 * y + z2;
    z2 = b2 * v - a2 * y;
    x[i] = y;
  }
  return x;
}
const hpCoef = (hz, q = Math.SQRT1_2) => {
  const w = (TAU * hz) / SR;
  const c = Math.cos(w);
  const al = Math.sin(w) / (2 * q);
  const a0 = 1 + al;
  return [(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0, (-2 * c) / a0, (1 - al) / a0];
};

/** 양끝 레이즈드 코사인 페이드 — 모든 보이스에 걸어 클릭을 없앤다 */
function fadeEdges(x, inSec, outSec) {
  const a = Math.min(x.length, Math.round(inSec * SR));
  const r = Math.min(x.length, Math.round(outSec * SR));
  for (let i = 0; i < a; i++) x[i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / a);
  for (let i = 0; i < r; i++) x[x.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / r);
  return x;
}
const fadeSt = (s, a, r) => {
  fadeEdges(s.L, a, r);
  fadeEdges(s.R, a, r);
  return s;
};
/** 피크를 1 로 맞춘다(모노/스테레오). 게인 스테이징을 dB 로 예측 가능하게 하기 위함 */
function normalize(sig, peak = 1) {
  const chans = sig instanceof Float32Array ? [sig] : [sig.L, sig.R];
  let m = 0;
  for (const c of chans) for (let i = 0; i < c.length; i++) m = Math.max(m, Math.abs(c[i]));
  if (m > 0) for (const c of chans) for (let i = 0; i < c.length; i++) c[i] *= peak / m;
  return sig;
}
const len = (sec) => Math.max(16, Math.round(sec * SR));

/** PolyBLEP 톱니파(에일리어싱 억제). freq 는 Hz 또는 (i)=>Hz */
function saw(n, freq, phase = rnd()) {
  const out = new Float32Array(n);
  const fn = typeof freq === "function" ? freq : null;
  let dt = fn ? 0 : freq / SR;
  let p = phase % 1;
  for (let i = 0; i < n; i++) {
    if (fn) dt = fn(i) / SR;
    let v = 2 * p - 1;
    if (p < dt) {
      const t = p / dt;
      v -= t + t - t * t - 1;
    } else if (p > 1 - dt) {
      const t = (p - 1) / dt;
      v -= t * t + t + t + 1;
    }
    out[i] = v;
    p += dt;
    if (p >= 1) p -= 1;
  }
  return out;
}

// @@INSTRUMENTS@@

// @@ARRANGEMENT@@

// ───────────────────────── 리버브: 16-라인 FDN ─────────────────────────
// 프리딜레이 → 입력 확산(올패스 4단) → 하다마드 피드백 딜레이 네트워크(16라인, 라인마다 변조) →
// 피드백 안의 로우패스 댐핑(고역이 먼저 죽는 어두운 꼬리) → 서로 직교하는 탭으로 L/R 을 뽑아 넓게.
function reverb(inL, inR, s0, s1, { rt60 = 3.1, hfRatio = 0.2, preMs = 32, lowCut = 170, highCut = 6500 } = {}) {
  const n = s1 - s0;
  const xl = inL.slice(s0, s1);
  const xr = inR.slice(s0, s1);
  for (const x of [xl, xr]) {
    onePoleHP(x, lowCut);
    onePoleHP(x, lowCut);
    onePoleLP(x, 9500);
  }
  // 프리딜레이(L/R 을 살짝 다르게)
  const pre = [Math.round((preMs / 1000) * SR), Math.round(((preMs + 4.3) / 1000) * SR)];
  [xl, xr].forEach((x, c) => {
    const d = pre[c];
    for (let i = n - 1; i >= 0; i--) x[i] = i >= d ? x[i - d] : 0;
  });
  // 입력 확산
  const AP = [
    [229, 173, 613, 449],
    [241, 181, 587, 479],
  ];
  [xl, xr].forEach((x, c) => {
    AP[c].forEach((d, k) => {
      const g = k < 2 ? 0.72 : 0.6;
      const b = new Float32Array(d);
      let idx = 0;
      for (let i = 0; i < n; i++) {
        const z = b[idx];
        const y = z - g * x[i];
        b[idx] = x[i] + g * y;
        x[i] = y;
        idx = idx + 1 === d ? 0 : idx + 1;
      }
    });
  });
  // FDN
  const LINES = 16;
  const DLY = [1693, 1867, 2053, 2251, 2399, 2617, 2797, 3001, 3209, 3433, 3643, 3877, 4127, 4391, 4663, 4937];
  const SIZE = 8192;
  const MASK = SIZE - 1;
  const bufs = DLY.map(() => new Float32Array(SIZE));
  const gain = new Float64Array(LINES);
  const damp = new Float64Array(LINES);
  const lp = new Float64Array(LINES);
  const v = new Float64Array(LINES);
  const lfoRate = new Float64Array(LINES);
  const lfoPh = new Float64Array(LINES);
  const sign = (i, r) => {
    let b = i & r;
    let p = 0;
    while (b) {
      p ^= b & 1;
      b >>= 1;
    }
    return p ? -1 : 1;
  };
  const bL = new Float64Array(LINES);
  const bR = new Float64Array(LINES);
  const cL = new Float64Array(LINES);
  const cR = new Float64Array(LINES);
  const lfoRng = mulberry32(SEED ^ 0x5eed);
  for (let i = 0; i < LINES; i++) {
    const g = Math.pow(10, (-3 * DLY[i]) / (SR * rt60));
    const b = 1 - 2 / (1 + Math.pow(g, 1 - 1 / hfRatio)); // Jot: 나이퀴스트에서 RT60 × hfRatio
    gain[i] = g * (1 - b);
    damp[i] = b;
    lfoRate[i] = (TAU * (0.23 + 0.71 * lfoRng())) / SR;
    lfoPh[i] = lfoRng() * TAU;
    bL[i] = sign(i, 3) * 0.25;
    bR[i] = sign(i, 12) * 0.25;
    cL[i] = sign(i, 5) * 0.25;
    cR[i] = sign(i, 10) * 0.25;
  }
  const MOD = 6; // 샘플
  const outL = new Float32Array(n);
  const outR = new Float32Array(n);
  let w = 0;
  for (let t = 0; t < n; t++) {
    let ol = 0;
    let or = 0;
    for (let i = 0; i < LINES; i++) {
      const d = DLY[i] + MOD * Math.sin(lfoPh[i] + lfoRate[i] * t);
      const di = Math.floor(d);
      const fr = d - di;
      const b = bufs[i];
      const a0 = b[(w - di) & MASK];
      const a1 = b[(w - di - 1) & MASK];
      const y = a0 + (a1 - a0) * fr;
      lp[i] = gain[i] * y + damp[i] * lp[i];
      v[i] = lp[i];
      ol += cL[i] * lp[i];
      or += cR[i] * lp[i];
    }
    // 고속 월시–하다마드 변환(정규화 1/4)
    for (let h = 1; h < LINES; h <<= 1) {
      for (let i = 0; i < LINES; i += h << 1) {
        for (let j = i; j < i + h; j++) {
          const a = v[j];
          const b = v[j + h];
          v[j] = a + b;
          v[j + h] = a - b;
        }
      }
    }
    const il = xl[t];
    const ir = xr[t];
    for (let i = 0; i < LINES; i++) bufs[i][w] = v[i] * 0.25 + il * bL[i] + ir * bR[i];
    w = (w + 1) & MASK;
    outL[t] = ol;
    outR[t] = or;
  }
  for (const o of [outL, outR]) {
    onePoleLP(o, highCut);
    onePoleLP(o, highCut * 1.6);
  }
  return [outL, outR];
}

// ───────────────────────── 계측(BS.1770 라우드니스 · 트루 피크) ─────────────────────────
function lufs(L, R) {
  const kw = (x) => {
    const y = Float64Array.from(x);
    biquad(y, [1.53512485958697, -2.69169618940638, 1.19839281085285, -1.69065929318241, 0.73248077421585]);
    biquad(y, [1.0, -2.0, 1.0, -1.99004745483398, 0.99007225036621]);
    return y;
  };
  const kl = kw(L);
  const kr = kw(R);
  const BL = Math.round(0.4 * SR);
  const HOP = Math.round(0.1 * SR);
  const blocks = [];
  for (let s = 0; s + BL <= L.length; s += HOP) {
    let e = 0;
    for (let i = s; i < s + BL; i++) e += kl[i] * kl[i] + kr[i] * kr[i];
    blocks.push(e / BL);
  }
  const loud = (e) => -0.691 + 10 * Math.log10(Math.max(e, 1e-20));
  const mean = (a) => a.reduce((p, c) => p + c, 0) / Math.max(1, a.length);
  const abs = blocks.filter((e) => loud(e) > -70);
  const rel = loud(mean(abs)) - 10;
  return loud(mean(abs.filter((e) => loud(e) > rel)));
}
/** 4배 오버샘플(윈도드 싱크) 트루 피크 추정 */
function truePeak(chans) {
  const TAPS = 24;
  const half = TAPS / 2;
  const coef = [1, 2, 3].map((p) => {
    const h = new Float64Array(TAPS);
    for (let k = 0; k < TAPS; k++) {
      const t = k - half + 1 - p / 4;
      const wnd = 0.5 + 0.5 * Math.cos((Math.PI * t) / half);
      h[k] = (t === 0 ? 1 : Math.sin(Math.PI * t) / (Math.PI * t)) * wnd;
    }
    return h;
  });
  let peak = 0;
  for (const x of chans) {
    let sp = 0;
    for (let i = 0; i < x.length; i++) sp = Math.max(sp, Math.abs(x[i]));
    peak = Math.max(peak, sp);
    const thr = sp * 0.6;
    for (let i = half; i < x.length - half; i++) {
      if (Math.abs(x[i]) < thr && Math.abs(x[i + 1]) < thr) continue;
      for (const h of coef) {
        let s = 0;
        for (let k = 0; k < TAPS; k++) s += h[k] * x[i - half + 1 + k];
        if (Math.abs(s) > peak) peak = Math.abs(s);
      }
    }
  }
  return peak;
}

// ───────────────────────── 마스터 ─────────────────────────
const TARGET_LUFS = -15;
const CEILING = dB(-2.6); // 샘플 피크 천장(AAC 인코딩 뒤에도 트루 피크 ≤ −1.5 dBTP 가 되도록 여유)
const INTRO_PEAK = dB(-18); // 오프닝(f0–f96)의 피크 목표
const WET = 0.5;
const FADE_FROM = 565;
const FADE_TO = 598;

// 구간 엔벨로프 — 임팩트 직전의 진공을 만든다
const GAP1 = [F(117.25), F(118)]; // f118–120: 정적
const GAP2 = [F(476) + Math.round(0.03 * SR), F(476) + Math.round(0.045 * SR)]; // f476 의 마지막 타격을 30ms 만에 초크 → f480 까지 정적
const SEC_RANGE = [
  [0, GAP1[1]],
  [F(HIT1), GAP2[1]],
  [F(HIT2), N],
];
const secEnv = [
  (i) => 1 - smooth((i - GAP1[0]) / (GAP1[1] - GAP1[0])),
  (i) => 1 - smooth((i - GAP2[0]) / (GAP2[1] - GAP2[0])),
  () => 1,
];

console.error("reverb…");
const SEC_MIX = SECTIONS.map((sec, s) => {
  const [s0, s1] = SEC_RANGE[s];
  const [wl, wr] = reverb(sec.rev[0], sec.rev[1], s0, s1);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  for (let i = s0; i < s1; i++) {
    const e = secEnv[s](i);
    L[i] = (sec.dry[0][i] + wl[i - s0] * WET) * e;
    R[i] = (sec.dry[1][i] + wr[i - s0] * WET) * e;
  }
  return [L, R];
});

/** 리미터: 필요한 감쇠량을 구한 뒤 릴리스(전방)·룩어헤드 어택(후방)으로 다듬는다. 지연 없음 */
function limiter(L, R, thr, { attackMs = 3, releaseMs = 140 } = {}) {
  const n = L.length;
  const g = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    g[i] = p > thr ? thr / p : 1;
  }
  const rel = 1 - Math.exp(-1 / ((releaseMs / 1000) * SR));
  const att = 1 - Math.exp(-1 / ((attackMs / 1000) * SR));
  for (let i = 1; i < n; i++) g[i] = Math.min(g[i], g[i - 1] + (1 - g[i - 1]) * rel);
  for (let i = n - 2; i >= 0; i--) g[i] = Math.min(g[i], g[i + 1] + (1 - g[i + 1]) * att);
  let minG = 1;
  for (let i = 0; i < n; i++) {
    L[i] *= g[i];
    R[i] *= g[i];
    if (g[i] < minG) minG = g[i];
  }
  return minG;
}
/** 소프트 클립: knee 아래는 선형, 위는 tanh 로 천장에 수렴 */
function softClip(x, knee, ceil) {
  const span = ceil - knee;
  for (let i = 0; i < x.length; i++) {
    const a = Math.abs(x[i]);
    if (a > knee) x[i] = Math.sign(x[i]) * (knee + span * Math.tanh((a - knee) / span));
  }
  return x;
}

function master(trimA) {
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  SEC_MIX.forEach(([sl, sr], s) => {
    const g = s === 0 ? trimA : 1;
    for (let i = 0; i < N; i++) {
      L[i] += sl[i] * g;
      R[i] += sr[i] * g;
    }
  });
  // 하이패스 25 Hz(4차) — 초저역 럼블과 DC 제거
  for (const ch of [L, R]) {
    biquad(ch, hpCoef(25, 0.5412));
    biquad(ch, hpCoef(25, 1.3066));
  }
  // 120 Hz 아래는 모노: 사이드 채널을 4차 하이패스
  const side = new Float32Array(N);
  for (let i = 0; i < N; i++) side[i] = (L[i] - R[i]) * 0.5;
  biquad(side, hpCoef(120));
  biquad(side, hpCoef(120));
  for (let i = 0; i < N; i++) {
    const m = (L[i] + R[i]) * 0.5;
    L[i] = m + side[i];
    R[i] = m - side[i];
  }
  // 엔딩 페이드(f565 → f598 에서 디지털 무음)
  const f0 = F(FADE_FROM);
  const f1 = F(FADE_TO);
  for (let i = f0; i < N; i++) {
    const k = Math.min(1, (i - f0) / (f1 - f0));
    const e = i >= f1 ? 0 : Math.pow(Math.cos((Math.PI / 2) * k), 2);
    L[i] *= e;
    R[i] *= e;
  }
  // 목표 라우드니스로 수렴: 게인 → 리미터 → 소프트 클립 → 재측정
  let gain = dB(TARGET_LUFS - lufs(L, R));
  let oL;
  let oR;
  let gr = 1;
  let loud = 0;
  for (let it = 0; it < 6; it++) {
    oL = Float32Array.from(L, (v) => v * gain);
    oR = Float32Array.from(R, (v) => v * gain);
    gr = limiter(oL, oR, CEILING * dB(3));
    softClip(oL, CEILING * dB(-4), CEILING);
    softClip(oR, CEILING * dB(-4), CEILING);
    loud = lufs(oL, oR);
    if (Math.abs(loud - TARGET_LUFS) < 0.02) break;
    gain *= dB(TARGET_LUFS - loud);
  }
  return { L: oL, R: oR, gain, gr, loud };
}

const peakIn = (m, fa, fb) => {
  let p = 0;
  for (let i = F(fa); i < F(fb); i++) p = Math.max(p, Math.abs(m.L[i]), Math.abs(m.R[i]));
  return p;
};
const rmsIn = (m, fa, fb) => {
  let e = 0;
  for (let i = F(fa); i < F(fb); i++) e += m.L[i] * m.L[i] + m.R[i] * m.R[i];
  return Math.sqrt(e / (2 * (F(fb) - F(fa))));
};

console.error("master…");
// 1차로 전체 게인을 구하고, 오프닝 피크가 −18 dBFS 가 되도록 구간 A 를 트림한 뒤 다시 마스터링
let trimA = 1;
let M = master(trimA);
for (let it = 0; it < 2; it++) {
  const p = peakIn(M, 0, 96);
  if (p <= 0) break;
  trimA *= INTRO_PEAK / p;
  M = master(trimA);
}

// ───────────────────────── WAV 저장 ─────────────────────────
const pcm = Buffer.alloc(N * 4);
let dc = [0, 0];
for (let i = 0; i < N; i++) {
  const l = Math.max(-32768, Math.min(32767, Math.round(M.L[i] * 32767)));
  const r = Math.max(-32768, Math.min(32767, Math.round(M.R[i] * 32767)));
  pcm.writeInt16LE(l, i * 4);
  pcm.writeInt16LE(r, i * 4 + 2);
  dc[0] += l;
  dc[1] += r;
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

const outPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/audio/cinematic-score.wav");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, Buffer.concat([header, pcm]));

const tp = truePeak([M.L, M.R]);
console.log(
  [
    `wrote ${outPath}`,
    `${N} samples · ${(N / SR).toFixed(3)} s · ${SR} Hz · 16-bit stereo`,
    `integrated ${M.loud.toFixed(2)} LUFS · sample peak ${toDb(peakIn(M, 0, TOTAL_FRAMES)).toFixed(2)} dBFS · true peak ≈ ${toDb(tp).toFixed(2)} dBTP`,
    `master gain ${toDb(M.gain).toFixed(2)} dB · limiter max GR ${toDb(M.gr).toFixed(2)} dB · intro trim ${toDb(trimA).toFixed(2)} dB`,
    `peaks: intro f0–96 ${toDb(peakIn(M, 0, 96)).toFixed(1)} · riser f96–118 ${toDb(peakIn(M, 96, 118)).toFixed(1)} · gap f118.2–120 ${toDb(peakIn(M, 118.2, 120)).toFixed(1)} · hit1 f120–135 ${toDb(peakIn(M, 120, 135)).toFixed(1)} · gap f477.5–480 ${toDb(peakIn(M, 477.5, 480)).toFixed(1)} · hit2 f480–495 ${toDb(peakIn(M, 480, 495)).toFixed(1)} dBFS`,
    `rms 0.5 s: hit1 ${toDb(rmsIn(M, 120, 135)).toFixed(1)} · bars5–7 ${toDb(rmsIn(M, 240, 420)).toFixed(1)} · bar8 ${toDb(rmsIn(M, 420, 476)).toFixed(1)} · hit2 ${toDb(rmsIn(M, 480, 495)).toFixed(1)} dBFS · DC ${(dc[0] / N / 32768).toExponential(1)}/${(dc[1] / N / 32768).toExponential(1)}`,
  ].join("\n"),
);

if (STEMS) {
  const g = M.gain;
  console.log("\n── stems (dry, post master gain; A 구간은 intro trim 포함) ──");
  for (const [name, [l, r]] of [...STEMS.entries()].sort()) {
    let p = 0;
    let e = 0;
    let cnt = 0;
    let first = -1;
    let last = -1;
    for (let i = 0; i < N; i++) {
      const t = i < F(HIT1) ? trimA : 1;
      const a = Math.max(Math.abs(l[i]), Math.abs(r[i])) * t;
      if (a > 1e-5) {
        if (first < 0) first = i;
        last = i;
        e += (l[i] * l[i] + r[i] * r[i]) * t * t;
        cnt += 2;
      }
      if (a > p) p = a;
    }
    console.log(`${name.padEnd(12)} peak ${toDb(p * g).toFixed(1).padStart(6)} dBFS · rms(active) ${toDb(Math.sqrt(e / Math.max(1, cnt)) * g).toFixed(1).padStart(6)} · f${(first / SPF).toFixed(1)}–f${(last / SPF).toFixed(1)}`);
  }
}

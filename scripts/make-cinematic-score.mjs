// 시네마틱 브랜드 필름(20초 · 600f @30fps)의 스코어 + 사운드 디자인을 코드로 합성한다(샘플·외부 음원·npm 의존성 없음).
//   node scripts/make-cinematic-score.mjs   → public/audio/cinematic-score.wav (48 kHz · 16-bit · stereo · 정확히 960000 샘플)
//   ffmpeg -y -loglevel error -i public/audio/cinematic-score.wav -c:a aac -b:a 256k public/audio/cinematic-score.m4a
//   SCORE_DEBUG=1 node scripts/make-cinematic-score.mjs   → 그룹(스템)별 레벨 표까지 출력
//   SCORE_SOLO=chalk,piano SCORE_OUT=/tmp/solo.wav node scripts/make-cinematic-score.mjs   → 일부 그룹만 따로 렌더(점검용)
//
// 120 BPM · 4/4 · D minor → 마지막에 D major. 한 박 = 15f, 한 마디 = 60f, 1f = 1600 샘플(정수)이라
// 모든 큐는 프레임 단위로 샘플 정확도를 갖는다. 영상 타이밍(src/cinematic/*)을 바꾸면 아래 "큐 시트"도 함께 고친다.
// 결정적(deterministic): 시드 고정 PRNG 만 쓰므로 몇 번을 돌려도 같은 파일이 나온다.
//
// 구성(세 시대):
//   어제  f0–118    옛 필름 — 영사기 베드·분필·낡은 업라이트. 250 Hz–4.5 kHz 로 좁힌 "광학 트랙" 버스, 피크 ≈ −18 dBFS
//         f118–120  정적
//   오늘  f120      IMPACT 1 → 풀레인지 와이드 스테레오. 오스티나토 + 패드 + 컷마다 휩/히트 (3–6마디)
//   내일  f360–476  푸시스루 → 홀로그램, 에어 패드가 얹힌다. 8마디는 라이저 + 드럼 롤로 빌드업
//         f476–480  진공
//         f480      IMPACT 2(가장 큰 순간, D major) → 벨 모티프 → f565–598 페이드
// 신호 흐름: 보이스 → 구간별 드라이/리버브 버스 → FDN 리버브 → (구간 A 만 광학 트랙 처리) → HP 25 Hz · 120 Hz 아래 모노
//           → 구간 엔벨로프(진공) → 합 → 엔딩 페이드 → 라우드니스 목표 게인 → 룩어헤드 리미터 → 소프트 클립 → 16-bit WAV
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

const DEBUG = !!process.env.SCORE_DEBUG;
// 믹스 점검용: SCORE_SOLO=projector,chalk 처럼 그룹만 골라 렌더(이때는 SCORE_OUT 으로 다른 파일에 쓴다)
const SOLO = process.env.SCORE_SOLO ? process.env.SCORE_SOLO.split(",") : null;

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
// 구간 A(0–f120, 어제) · B(f120–f480, 오늘→내일) · C(f480–) 가 각자 드라이/리버브 버스를 가진다.
// 임팩트 직전의 "진공"에서 앞 구간을 리버브 꼬리까지 통째로 잘라내기 위해서다.
// 구간 A 는 통째로 "옛 광학 사운드트랙"(대역 제한 + 포화 + 좁은 스테레오) 처리를 거친다 → f120 에서 풀레인지
// 와이드 스테레오로 열리는 대비가 핵심. 예외는 route 로 지정한다:
//   "clean"(3번) = 드론·험처럼 그 대역 밖에 있어야 하는 소리, "swell"(4번) = 대역 제한만 걸고 포화는 건너뛰는 리버스 스웰.
const newBus = () => [new Float32Array(N), new Float32Array(N)];
const SECTIONS = [0, 1, 2, 3, 4].map(() => ({ dry: newBus(), rev: newBus() }));
const A_ROUTE = { optical: 0, clean: 3, swell: 4 };
const STEMS = DEBUG ? new Map() : null;

/** 신호(모노 Float32Array 또는 {L,R})를 프레임 위치에 올린다. pan 은 숫자 또는 (0..1)=>pan 함수.
 *  send = 리버브 센드(구간 A 의 clean·swell 경로에서는 무시된다), route 는 구간 A 에서만 의미가 있다 */
function place(sig, frame, { gain = 1, pan = 0, send = 0, dry = 1, group = "misc", route = "optical" } = {}) {
  if (SOLO && !SOLO.includes(group)) return;
  const start = F(frame);
  const stereo = !(sig instanceof Float32Array);
  const sl = stereo ? sig.L : sig;
  const sr = stereo ? sig.R : sig;
  const secIdx = start < F(HIT1) ? A_ROUTE[route] : start < F(HIT2) ? 1 : 2;
  const [dl, dr] = SECTIONS[secIdx].dry;
  const [rl, rrr] = SECTIONS[secIdx].rev;
  let stem = null;
  if (STEMS) {
    if (!STEMS.has(group)) STEMS.set(group, Object.assign(newBus(), { clean: route === "clean" }));
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
  const count = sl.length;
  for (let i = 0; i < count; i++) {
    const j = start + i;
    if (j < 0) continue;
    if (j >= N) break;
    if (panFn && (i & 63) === 0) setPan(panFn(i / count));
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

const lpCoef = (hz, q = Math.SQRT1_2) => {
  const w = (TAU * hz) / SR;
  const c = Math.cos(w);
  const al = Math.sin(w) / (2 * q);
  const a0 = 1 + al;
  return [(1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0, (-2 * c) / a0, (1 - al) / a0];
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

// ───────────────────────── 악기 · 사운드 디자인 ─────────────────────────
// 모든 제너레이터는 피크 1 근처로 정규화한 버퍼를 돌려준다 → 큐 시트의 gain(dB)이 곧 레벨이다.

const panGains = (pan) => {
  const a = ((pan + 1) * Math.PI) / 4;
  return [Math.cos(a), Math.sin(a)];
};
const stereoNoise = (n) => {
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    L[i] = noise();
    R[i] = noise();
  }
  return { L, R };
};

/** 저음 드론(D): D1 사인 + 살짝 비팅하는 D2 사인쌍 + 로우패스 톱니(L/R 디튠) */
function drone(dur) {
  const n = len(dur);
  const D1 = n2f("D1");
  const D2 = n2f("D2");
  const A2 = n2f("A2");
  const sL = svf(saw(n, D2 * cents(-5)), LP, (k, i) => 240 + 110 * Math.sin((TAU * 0.13 * i) / SR - 1.2), 0.9);
  const sR = svf(saw(n, D2 * cents(5)), LP, (k, i) => 240 + 110 * Math.sin((TAU * 0.13 * i) / SR - 0.6), 0.9);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const m =
      0.5 * Math.sin(TAU * D1 * t) +
      0.46 * Math.sin(TAU * D2 * t) +
      0.16 * Math.sin(TAU * D2 * 1.0042 * t + 1.1) +
      0.1 * smooth((t - 1.2) / 2) * Math.sin(TAU * A2 * 1.0007 * t);
    const swell = smooth(t / 1.5) * (0.82 + 0.18 * Math.sin(TAU * 0.17 * t - 1.3)) * (0.7 + 0.3 * (t / dur));
    L[i] = (m + 0.5 * sL[i]) * swell;
    R[i] = (m + 0.5 * sR[i]) * swell;
  }
  return normalize(fadeSt({ L, R }, 0.01, 0.05));
}

/** 고역 쉬머: 트레몰로가 걸린 사인 클러스터 + 공기 노이즈 */
function shimmer(freqs, dur, { attack = 0.15, tau = 0.8, air = 0.3 } = {}) {
  const n = len(dur);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const f of freqs) {
    for (let v = 0; v < 2; v++) {
      const w = (TAU * f * cents(rr(-6, 6))) / SR;
      const ph = rnd() * TAU;
      const tr = rr(3, 7.5);
      const trPh = rnd() * TAU;
      const [gl, gr] = panGains(rr(-0.9, 0.9));
      const amp = Math.pow(1175 / f, 0.6);
      for (let i = 0; i < n; i++) {
        const s = Math.sin(w * i + ph) * (0.55 + 0.45 * Math.sin((TAU * tr * i) / SR + trPh)) * amp;
        L[i] += s * gl;
        R[i] += s * gr;
      }
    }
  }
  normalize({ L, R });
  const a = stereoNoise(n);
  svf(a.L, HP, 6500, 0.7);
  svf(a.R, HP, 6500, 0.7);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = smooth(t / attack) * Math.exp(-t / tau);
    L[i] = (L[i] + air * a.L[i]) * env;
    R[i] = (R[i] + air * a.R[i]) * env;
  }
  return normalize(fadeSt({ L, R }, 0.005, Math.min(0.6, dur * 0.3)));
}

/** 부드럽게 부풀었다 꺼지는 서브 */
function subSwell(freq, dur) {
  const n = len(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.sin((TAU * freq * i) / SR) * Math.pow(Math.sin((Math.PI * i) / n), 2);
  return out;
}

/** 분필이 칠판에 닿는 "톡" */
function chalkTap() {
  const n = len(0.03);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] =
      Math.min(1, i / 8) *
      (noise() * 0.7 * Math.exp(-t / 0.0006) +
        0.5 * Math.sin(TAU * 1320 * t) * Math.exp(-t / 0.0032) +
        0.32 * Math.sin(TAU * 2450 * t) * Math.exp(-t / 0.0015) +
        0.3 * Math.sin(TAU * 410 * t) * Math.exp(-t / 0.006));
  }
  return normalize(fadeEdges(onePoleHP(out, 300), 0, 0.004));
}

/** 분필 획: 스틱–슬립 알갱이(불규칙 진폭 변조)를 입힌 노이즈 → 포먼트 2개 + 칠판 울림. speed(k) 가 음량·밝기를 끈다 */
function chalkStroke(dur, { speed = () => 1, bright = 1, tap = 0.7 } = {}) {
  const n = len(dur);
  const x = new Float32Array(n);
  let hold = 0;
  let lvl = 0;
  let target = 0;
  let slow = 0.7;
  let slowT = 0.7;
  let slowHold = 0;
  for (let i = 0; i < n; i++) {
    if (hold-- <= 0) {
      hold = Math.floor(rr(0.0004, 0.002) * SR);
      target = Math.pow(rnd(), 1.6);
    }
    lvl += (target - lvl) * 0.25;
    if (slowHold-- <= 0) {
      slowHold = Math.floor(rr(0.012, 0.035) * SR);
      slowT = rr(0.45, 1);
    }
    slow += (slowT - slow) * 0.004;
    x[i] = noise() * (0.28 + lvl) * slow * Math.pow(Math.max(0, speed(i / n)), 0.8);
  }
  const a = Float32Array.from(x);
  const b = Float32Array.from(x);
  const c = Float32Array.from(x);
  svf(a, BP, (k) => 2600 * bright * (0.55 + 0.7 * speed(k)), 0.9);
  svf(b, BP, (k) => 5600 * bright * (0.8 + 0.3 * speed(k)), 1.6);
  svf(c, BP, 1150, 2.5);
  for (let i = 0; i < n; i++) x[i] = a[i] - 0.6 * b[i] - 0.3 * c[i]; // 이웃 밴드는 극성을 번갈아(사이 대역이 상쇄되지 않게)
  onePoleHP(x, 600);
  normalize(fadeEdges(x, 0.004, 0.012));
  for (let i = 0; i < n; i++) x[i] = Math.tanh(1.4 * x[i]) / Math.tanh(1.4); // 튀는 알갱이를 살짝 눌러 몸통이 들리게
  if (tap > 0) {
    const t = chalkTap();
    for (let i = 0; i < t.length && i < n; i++) x[i] += t[i] * tap;
  }
  return x;
}

/** 옛 영사기: 프레임마다 "틱-탁" 하는 클로 기구(초당 ~14회, 살짝 불규칙) + 모터 소음. 처음 0.6초는 돌기 시작하는 속도 */
function projector(dur, rate = 14) {
  const n = len(dur);
  const x = new Float32Array(n);
  const body = new Float32Array(n);
  const m = len(0.03);
  const mb = len(0.06);
  let t = 0.02;
  while (t < dur) {
    const s = Math.round(t * SR);
    const a = rr(0.7, 1);
    // 주 클릭 + 약 23 ms 뒤의 약한 두 번째 클릭(클로가 걸렸다 빠진다)
    for (const [off, amp, tau] of [
      [0, 1, 0.005],
      [rr(0.02, 0.026), 0.5, 0.004],
    ]) {
      const s2 = s + Math.round(off * SR);
      for (let i = 0; i < m && s2 + i < n; i++) x[s2 + i] += noise() * a * amp * Math.min(1, i / 12) * Math.exp(-i / (tau * SR));
    }
    // 금속 몸통의 짧은 울림
    const fr = rr(280, 380);
    for (let i = 0; i < mb && s + i < n; i++) body[s + i] += a * 0.22 * Math.min(1, i / 24) * Math.sin((TAU * fr * i) / SR) * Math.exp(-i / (0.007 * SR));
    t += (1 / (rate * (0.62 + 0.38 * smooth(t / 0.6)))) * rr(0.93, 1.07);
  }
  const a = svf(Float32Array.from(x), BP, 1350, 1.4);
  const b = svf(Float32Array.from(x), BP, 2700, 2.0);
  for (let i = 0; i < n; i++) x[i] = a[i] - 0.6 * b[i] + body[i];
  normalize(x);
  for (let i = 0; i < n; i++) x[i] = Math.tanh(2.5 * x[i]) / Math.tanh(2.5); // 클릭 피크를 눌러 낮은 레벨에서도 몸통이 들리게
  // 모터: 클릭 주기로 살짝 떨리는 중역 노이즈
  const mot = new Float32Array(n);
  for (let i = 0; i < n; i++) mot[i] = noise();
  normalize(svf(mot, BP, 620, 0.9));
  for (let i = 0; i < n; i++) x[i] += 0.16 * mot[i] * (0.7 + 0.3 * Math.sin((TAU * rate * i) / SR));
  return fadeEdges(x, 0.25, 0.02);
}

/** 광학 트랙/바이닐 크래클: 드문드문 튀는 팝(대부분 작고 가끔 크다) + 아주 옅은 히스 */
function crackle(dur, perSec = 7) {
  const n = len(dur);
  const x = new Float32Array(n);
  let t = rr(0.05, 0.25);
  while (t < dur) {
    const s = Math.round(t * SR);
    const a = Math.pow(rnd(), 3) * (rnd() < 0.5 ? -1 : 1);
    const w = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < w && s + i < n; i++) x[s + i] += a;
    t += -Math.log(1 - rnd()) / perSec; // 포아송 간격
  }
  normalize(svf(x, BP, 2200, 0.6));
  const h = new Float32Array(n);
  for (let i = 0; i < n; i++) h[i] = noise();
  normalize(svf(h, BP, 1800, 0.5));
  for (let i = 0; i < n; i++) x[i] += 0.035 * h[i];
  return fadeEdges(x, 0.2, 0.02);
}

/** 옅은 전원 험: A1(55 Hz) + 배음 — 50–60 Hz 대역이면서 D 드론과 5도로 어울린다 */
function hum(dur) {
  const n = len(dur);
  const out = new Float32Array(n);
  const w = (TAU * 55) / SR;
  for (let i = 0; i < n; i++) {
    out[i] = (Math.sin(w * i) + 0.5 * Math.sin(2 * w * i + 0.7) + 0.3 * Math.sin(3 * w * i + 1.9) + 0.12 * Math.sin(5 * w * i + 0.3)) * (0.9 + 0.1 * Math.sin((TAU * 0.4 * i) / SR));
  }
  return normalize(fadeEdges(out, 0.4, 0.03));
}

/** 조율이 살짝 틀어진 옛 업라이트 피아노: 어긋난 세 줄(비팅) + 단단한 해머 + 필름의 와우·플러터 */
function uprightPiano(freq, dur = 2.8) {
  const n = len(dur);
  const out = new Float32Array(n);
  const amps = [1, 0.7, 0.45, 0.3, 0.2, 0.13, 0.08, 0.05];
  const wowRate = (TAU * 0.7) / SR;
  const wowPh = rnd() * TAU;
  const flRate = (TAU * 6.3) / SR;
  const flPh = rnd() * TAU;
  const wob = new Float32Array(n);
  for (let i = 0; i < n; i++) wob[i] = 1 + 0.0035 * Math.sin(wowPh + wowRate * i) + 0.0009 * Math.sin(flPh + flRate * i);
  for (const [det, lv] of [
    [-9, 1],
    [2, 0.9],
    [11, 0.8],
  ]) {
    amps.forEach((a, idx) => {
      const k = idx + 1;
      const w = (TAU * freq * cents(det) * k * Math.sqrt(1 + 0.0009 * k * k)) / SR;
      const decay = 1.6 + 0.9 * k;
      let ph = rnd() * TAU;
      for (let i = 0; i < n; i++) {
        ph += w * wob[i];
        out[i] += lv * a * Math.exp((-decay * i) / SR) * Math.sin(ph);
      }
    });
  }
  const hb = new Float32Array(len(0.04));
  for (let i = 0; i < hb.length; i++) hb[i] = noise() * Math.exp(-i / (0.004 * SR));
  svf(hb, BP, 900, 1);
  for (let i = 0; i < hb.length; i++) out[i] += hb[i] * 1.2;
  return normalize(fadeEdges(out, 0.003, 0.2));
}

/** 유리 벨: 거의 사인에 가까운 기음 + 약한 비조화 배음, 긴 꼬리 */
function glassBell(freq, dur = 2.6, { bright = 1, soft = 0.004 } = {}) {
  const n = len(dur);
  const out = new Float32Array(n);
  const parts = [
    [1, 1, 1.5],
    [1.003, 0.35, 1.7],
    [2.0, 0.22 * bright, 2.6],
    [2.76, 0.16 * bright, 3.6],
    [4.07, 0.06 * bright, 5.5],
    [5.4, 0.035 * bright, 8],
  ];
  const fast = Math.pow(freq / 880, 0.3) * (2.6 / dur);
  for (const [ratio, amp, decay] of parts) {
    if (freq * ratio > 15000) continue;
    const w = (TAU * freq * ratio) / SR;
    const ph = rnd() * TAU;
    for (let i = 0; i < n; i++) out[i] += amp * Math.exp((-decay * fast * i) / SR) * Math.sin(w * i + ph);
  }
  return normalize(fadeEdges(out, soft, 0.1));
}

/** 지우개: 둔탁한 펠트 스윕(300–1500 Hz) */
function eraser(dur) {
  const n = len(dur);
  const x = new Float32Array(n);
  let fl = 0.8;
  let flT = 0.8;
  let hold = 0;
  for (let i = 0; i < n; i++) {
    if (hold-- <= 0) {
      hold = Math.floor(rr(0.015, 0.04) * SR);
      flT = rr(0.6, 1);
    }
    fl += (flT - fl) * 0.003;
    x[i] = noise() * Math.pow(Math.sin((Math.PI * i) / n), 1.3) * fl;
  }
  svf(x, BP, (k) => 480 + 720 * Math.sin(Math.PI * Math.pow(k, 0.8)), 0.7);
  onePoleLP(x, 1500);
  onePoleLP(x, 1900);
  onePoleHP(x, 260);
  return normalize(fadeEdges(x, 0.01, 0.02));
}

/** 리버스 스웰: 지수적으로 차오르는 화음(리버스 리버브 느낌) + 상승하는 필터드 노이즈 */
function reverseSwell(dur, notes) {
  const n = len(dur);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const name of notes) {
    const f = n2f(name);
    for (let v = 0; v < 4; v++) {
      const s = saw(n, f * cents(rr(-12, 12)));
      const [gl, gr] = panGains(rr(-0.9, 0.9));
      for (let i = 0; i < n; i++) {
        L[i] += s[i] * gl;
        R[i] += s[i] * gr;
      }
    }
  }
  for (const c of [L, R]) {
    svf(c, LP, (k) => expLerp(350, 5200, Math.pow(k, 1.4)), 0.8);
    onePoleHP(c, 140);
  }
  normalize({ L, R });
  const nz = stereoNoise(n);
  for (const c of [nz.L, nz.R]) svf(c, BP, (k) => expLerp(450, 7500, Math.pow(k, 1.2)), 1.3);
  normalize(nz);
  const den = Math.exp(4.6) - 1;
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const env = (Math.exp(4.6 * k) - 1) / den;
    const ne = Math.pow(k, 2.6);
    L[i] = L[i] * env * 0.8 + nz.L[i] * ne * 0.6;
    R[i] = R[i] * env * 0.8 + nz.R[i] * ne * 0.6;
  }
  return normalize(fadeSt({ L, R }, 0.02, 0.004));
}

/** 서브 붐: 피치가 떨어지는 사인 + 펀치 + 짧은 클릭. 위상 0 에서 시작하므로 타격점이 샘플 단위로 정확하다 */
function subBoom({ f0 = 70, f1 = 36.71, drop = 0.09, tail = 1.8, drive = 1.5, punch = 0.5, click = 0.25 } = {}) {
  const n = len(tail);
  const out = new Float32Array(n);
  const cl = new Float32Array(len(0.02));
  for (let i = 0; i < cl.length; i++) cl[i] = noise() * Math.exp(-i / (0.0018 * SR));
  onePoleLP(cl, 2200);
  let ph = 0;
  let ph2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (TAU * (f1 + (f0 - f1) * Math.exp(-t / drop))) / SR;
    ph2 += (TAU * (50 + 130 * Math.exp(-t / 0.022))) / SR;
    const env = Math.min(1, i / 72) * (0.6 * Math.exp(-t / (tail * 0.1)) + 0.4 * Math.exp(-t / (tail * 0.27)));
    out[i] = Math.tanh(drive * (Math.sin(ph) * env + punch * Math.sin(ph2) * Math.exp(-t / 0.055))) + (i < cl.length ? cl[i] * click : 0);
  }
  return normalize(fadeEdges(out, 0, Math.min(0.12, tail * 0.3)));
}

/** 둔탁한 저역 노이즈 "퍽" */
function thud(dur = 0.2) {
  const n = len(dur);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = noise() * Math.min(1, i / 24) * Math.exp(-i / (0.03 * SR));
  onePoleLP(x, 650);
  onePoleLP(x, 900);
  onePoleHP(x, 90);
  return normalize(fadeEdges(x, 0, 0.03));
}

/** 브람: 디튠 톱니 묶음 → 열렸다 닫히는 로우패스 → 드라이브. 살짝 아래에서 밀려 올라오는 피치 */
function braam(notes, dur, { fcPeak = 2200, fcEnd = 240, open = 0.11, close = 0.7, drive = 2.4, voices = 7, spread = 16, bend = -40, hold = 0.35, decay = 0.55 } = {}) {
  const n = len(dur);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const [name, lvl = 1] of notes) {
    const f = n2f(name);
    for (let v = 0; v < voices; v++) {
      const det = cents(((v / (voices - 1)) * 2 - 1) * spread + rr(-2, 2));
      const s = saw(n, (i) => f * det * cents(bend * Math.exp(-i / (0.05 * SR))));
      const [gl, gr] = panGains(v === 0 ? 0 : (v % 2 ? 1 : -1) * rr(0.2, 0.95));
      for (let i = 0; i < n; i++) {
        L[i] += s[i] * gl * lvl;
        R[i] += s[i] * gr * lvl;
      }
    }
  }
  const norm = 1 / Math.sqrt(notes.length * voices);
  const fc = (k, i) => {
    const t = i / SR;
    return t < open ? 170 + (fcPeak - 170) * smooth(t / open) : fcEnd + (fcPeak - fcEnd) * Math.exp(-(t - open) / close);
  };
  for (const c of [L, R]) {
    svf(c, LP, fc, 1.15);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.012) * (t < hold ? 1 : Math.exp(-(t - hold) / decay));
      c[i] = Math.tanh(c[i] * norm * drive * 1.6) * env;
    }
    onePoleLP(c, 5200);
    onePoleHP(c, 45);
  }
  return normalize(fadeSt({ L, R }, 0.002, 0.25));
}

/** 어두운 노이즈 크래시(대부분 리버브로 보낸다) */
function darkCrash(dur) {
  const n = len(dur);
  const s = stereoNoise(n);
  for (const c of [s.L, s.R]) {
    svf(c, LP, (k, i) => 650 + 5200 * Math.exp(-(i / SR) / 0.22), 0.7);
    onePoleHP(c, 160);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      c[i] *= Math.min(1, i / 96) * (0.7 * Math.exp(-t / 0.16) + 0.3 * Math.exp(-t / 0.6));
    }
  }
  return normalize(fadeSt(s, 0, 0.2));
}

/** 심벌 같은 밝은 워시: 하이패스 노이즈 + 공명 몇 개, 컷오프가 서서히 내려온다 */
function wash(dur, { hp = 3200, tau = 0.75 } = {}) {
  const n = len(dur);
  const s = stereoNoise(n);
  [s.L, s.R].forEach((c, ci) => {
    const src = Float32Array.from(c);
    svf(c, HP, hp, 0.7);
    for (const f of [4700, 6900, 9400]) {
      const r = svf(Float32Array.from(src), BP, f * (ci ? 1.04 : 0.97), 5);
      for (let i = 0; i < n; i++) c[i] += r[i] * 1.6;
    }
    svf(c, LP, (k, i) => 5500 + 9500 * Math.exp(-(i / SR) / 0.5), 0.7);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      c[i] *= smooth(t / 0.025) * (0.65 * Math.exp(-t / tau) + 0.35 * Math.exp(-t / (tau * 2.6)));
    }
  });
  return normalize(fadeSt(s, 0, 0.3));
}

/** 오스티나토 한 음: 톱니 2 + 옥타브 → 짧게 닫히는 로우패스(첼로 스피카토/신스 플럭) */
function ostNote(freq, vel = 1, dur = 0.23) {
  const n = len(dur);
  const a = saw(n, freq * cents(rr(-4, -2)));
  const b = saw(n, freq * cents(rr(2, 4)));
  const c = saw(n, freq * 2 * cents(rr(-3, 3)));
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = 0.5 * a[i] + 0.5 * b[i] + 0.28 * c[i] + 0.18 * noise() * Math.exp(-i / (0.01 * SR));
  const peak = 650 + 2500 * vel;
  svf(out, LP, (k, i) => 170 + peak * Math.exp(-i / SR / 0.05), 1.3);
  const tau = 0.085 + 0.03 * vel;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = Math.tanh(out[i] * Math.min(1, t / 0.003) * Math.exp(-t / tau) * 2.2) / 0.976;
  }
  return fadeEdges(out, 0.001, 0.03);
}

/** 패드: 음마다 디튠 톱니 여러 개를 좌우로 펼치고 24 dB/oct 로우패스. 느린 어택, 따뜻하고 넓게 */
function pad(notes, dur, { attack = 0.7, release = 0.9, fc = 1500, voices = 5, spread = 10 } = {}) {
  const n = len(dur);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const [name, lvl = 1] of notes) {
    const f = n2f(name);
    const tilt = lvl * Math.pow(220 / Math.max(220, f), 0.35);
    for (let v = 0; v < voices; v++) {
      const det = cents(((v / (voices - 1)) * 2 - 1) * spread + rr(-1.5, 1.5));
      const lfoRate = (TAU * rr(0.07, 0.23)) / SR;
      const lfoPh = rnd() * TAU;
      const depth = cents(3) - 1;
      const s = saw(n, (i) => f * det * (1 + depth * Math.sin(lfoPh + lfoRate * i)));
      const [gl, gr] = panGains((v % 2 ? 1 : -1) * rr(0.35, 0.95));
      for (let i = 0; i < n; i++) {
        L[i] += s[i] * gl * tilt;
        R[i] += s[i] * gr * tilt;
      }
    }
  }
  const ph0 = rnd() * TAU;
  [L, R].forEach((c, ci) => {
    svf(c, LP, (k, i) => fc * (1 + 0.18 * Math.sin((TAU * 0.11 * i) / SR + ph0 + ci * 0.9)), 0.7);
    svf(c, LP, fc * 1.3, 0.6);
    onePoleHP(c, 110);
  });
  return normalize(fadeSt({ L, R }, attack, release));
}

/** 길게 받쳐 주는 서브 베이스 */
function subNote(freq, dur, attack = 0.08) {
  const n = len(dur);
  const out = new Float32Array(n);
  const w = (TAU * freq) / SR;
  for (let i = 0; i < n; i++) out[i] = (Math.sin(w * i) + 0.18 * Math.sin(2 * w * i) + 0.06 * Math.sin(3 * w * i)) / 1.15;
  return fadeEdges(out, attack, 0.18);
}

/** 타이코/로 탐: 피치가 살짝 떨어지는 막 진동 + 스킨 슬랩 + 스틱 */
function taiko(f = 98, { dur = 0.9, slap = 0.35 } = {}) {
  const n = len(dur);
  const out = new Float32Array(n);
  const sk = new Float32Array(len(0.12));
  for (let i = 0; i < sk.length; i++) sk[i] = noise() * Math.exp(-i / (0.022 * SR));
  svf(sk, BP, 420, 0.9);
  normalize(onePoleLP(sk, 1500));
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (TAU * f * (1 + 0.55 * Math.exp(-t / 0.02))) / SR;
    const body = Math.sin(ph) * Math.exp(-t / 0.17) + 0.32 * Math.sin(1.59 * ph + 0.4) * Math.exp(-t / 0.085) + 0.18 * Math.sin(2.14 * ph + 1.1) * Math.exp(-t / 0.055);
    out[i] = Math.tanh(1.4 * Math.min(1, i / 40) * body) + (i < sk.length ? slap * sk[i] : 0) + 0.15 * Math.min(1, i / 6) * Math.sin(TAU * 2300 * t) * Math.exp(-t / 0.0012);
  }
  return normalize(fadeEdges(out, 0, 0.1));
}

/** 휩 팬 우쉬: 컷에서 정점을 찍는 밴드 스윕 + 공기층 */
function whip(dur) {
  const n = len(dur);
  const x = new Float32Array(n);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = noise();
    y[i] = noise();
  }
  svf(x, BP, (k) => 480 + 4300 * Math.exp(-Math.pow((k - 0.5) / 0.2, 2)), 1.3);
  svf(y, HP, 4500, 0.7);
  normalize(x);
  normalize(y);
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const env = k < 0.5 ? Math.pow(k / 0.5, 2.6) : Math.exp(-(k - 0.5) * 9);
    x[i] = x[i] * env + 0.3 * y[i] * Math.pow(env, 1.5);
  }
  return normalize(fadeEdges(x, 0.005, 0.02));
}

/** 짧은 공기 스위시(밴드가 f0→f1 로 이동). shape = 정점 위치(0..1) */
function swish(dur, f0, f1, q = 1.2, shape = 0.25) {
  const n = len(dur);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = noise();
  svf(x, BP, (k) => expLerp(f0, f1, k), q);
  for (let i = 0; i < n; i++) {
    const k = i / n;
    x[i] *= k < shape ? smooth(k / shape) : Math.pow(1 - (k - shape) / (1 - shape), 2.2);
  }
  return normalize(fadeEdges(x, 0.003, 0.01));
}

/** 깨끗한 비프 */
function beep(freq, dur = 0.065) {
  const n = len(dur);
  const out = new Float32Array(n);
  const w = (TAU * freq) / SR;
  for (let i = 0; i < n; i++) out[i] = Math.sin(w * i) + 0.03 * Math.sin(2 * w * i);
  return fadeEdges(out, 0.005, 0.012);
}

/** 아주 짧은 틱 */
function tick(hz = 4200, tau = 0.0011, noiseAmt = 0.25) {
  const n = len(0.014);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = Math.min(1, i / 6) * (Math.sin(TAU * hz * t) + noiseAmt * noise()) * Math.exp(-t / tau);
  }
  return normalize(fadeEdges(out, 0, 0.002));
}

/** UI 팝: 살짝 내려앉는 사인 + 미세한 클릭 */
function uiPop(fTo, fFrom) {
  const n = len(0.09);
  const out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (TAU * (fTo + (fFrom - fTo) * Math.exp(-t / 0.008))) / SR;
    out[i] = Math.min(1, i / 40) * Math.sin(ph) * Math.exp(-t / 0.016) + 0.2 * Math.min(1, i / 6) * Math.sin(TAU * 3200 * t) * Math.exp(-t / 0.0008);
  }
  return normalize(fadeEdges(out, 0, 0.01));
}

/** 스캔 스윕: 고정된 음 위를 Q 높은 밴드패스가 훑어 올라가 배음이 차례로 떠오른다.
 *  소스는 옥타브·5도·9도 배음만 쌓은 가산 합성 — 톱니의 5번째 배음(장3도)이 단화음과 부딪히지 않게 */
function scanSweep(dur, notes) {
  const n = len(dur);
  const x = new Float32Array(n);
  const HARM = [1, 2, 3, 4, 6, 8, 9, 12, 16, 18, 24, 32];
  for (const name of notes) {
    for (const d of [-6, 6]) {
      const f = n2f(name) * cents(d);
      for (const h of HARM) {
        if (f * h > 9000) continue;
        const w = (TAU * f * h) / SR;
        const ph = rnd() * TAU;
        for (let i = 0; i < n; i++) x[i] += Math.sin(w * i + ph) / h;
      }
    }
  }
  for (let i = 0; i < n; i++) x[i] = x[i] / (notes.length * 2) + 0.04 * noise();
  svf(x, BP, (k) => expLerp(320, 4400, Math.pow(k, 0.9)), 7);
  for (let i = 0; i < n; i++) x[i] *= 0.6 + 0.4 * (i / n);
  return normalize(fadeEdges(x, 0.09, 0.14));
}

/** 라이저: 상승하는 노이즈 밴드 + 공기 + 점점 빨라지는 트레몰로가 걸린 상승 톤 */
function riser(dur, fA, fB) {
  const n = len(dur);
  const nz = stereoNoise(n);
  for (const c of [nz.L, nz.R]) svf(c, BP, (k) => expLerp(320, 8500, Math.pow(k, 1.25)), 1.5);
  normalize(nz);
  const air = stereoNoise(n);
  for (const c of [air.L, air.R]) svf(c, HP, 6000, 0.7);
  normalize(air);
  const pitch = (i) => expLerp(fA, fB, Math.pow(i / n, 1.3));
  const tone = { L: saw(n, (i) => pitch(i) * cents(-7)), R: saw(n, (i) => pitch(i) * cents(7)) };
  for (const c of [tone.L, tone.R]) svf(c, LP, (k, i) => Math.min(9000, pitch(i) * 5), 0.9);
  normalize(tone);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  let trPh = 0;
  for (let i = 0; i < n; i++) {
    const k = i / n;
    trPh += (TAU * expLerp(4, 18, k)) / SR;
    const trem = 1 - 0.4 * (0.5 + 0.5 * Math.cos(trPh));
    const a = Math.pow(k, 2.2) * 0.8;
    const b = Math.pow(k, 3.2) * 0.3;
    const c = Math.pow(k, 1.7) * 0.55 * trem;
    L[i] = nz.L[i] * a + air.L[i] * b + tone.L[i] * c;
    R[i] = nz.R[i] * a + air.R[i] * b + tone.R[i] * c;
  }
  return normalize(fadeSt({ L, R }, 0.02, 0.002));
}

/** 푸시스루 우쉬: 가운데(컷)에서 정점을 찍으며 좌우로 활짝 벌어지는 큰 통과음 + 저역 럼블 */
function pushThrough(dur) {
  const n = len(dur);
  const fcFn = (k) => 300 + 5200 * Math.exp(-Math.pow((k - 0.5) / 0.17, 2));
  const mono = new Float32Array(n);
  const rum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    mono[i] = noise();
    rum[i] = noise();
  }
  normalize(svf(mono, BP, fcFn, 1.1));
  onePoleLP(rum, 200);
  normalize(onePoleLP(rum, 260));
  const st = stereoNoise(n);
  svf(st.L, BP, (k) => fcFn(k) * 1.15, 1.1);
  svf(st.R, BP, (k) => fcFn(k) * 0.87, 1.1);
  normalize(st);
  const air = stereoNoise(n);
  svf(air.L, HP, 5000, 0.7);
  svf(air.R, HP, 5000, 0.7);
  normalize(air);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const env = k < 0.5 ? Math.pow(k / 0.5, 2.2) : Math.exp(-(k - 0.5) * 7.5);
    const w = smooth((k - 0.2) / 0.3); // 폭: 컷에서 활짝
    const c = mono[i] * (1 - 0.7 * w) + rum[i] * 0.5;
    L[i] = (c + st.L[i] * w + air.L[i] * 0.35 * env) * env;
    R[i] = (c + st.R[i] * w + air.R[i] * 0.35 * env) * env;
  }
  return normalize(fadeSt({ L, R }, 0.01, 0.03));
}

/** 홀로그램 파워업: 화음 음이 아래에서 위로 차례로 켜지는 유리질 사인 스택(느린 트레몰로) + 상승하는 공기 */
function holoPowerUp(dur, notes) {
  const n = len(dur);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  notes.forEach((name, j) => {
    const f = n2f(name);
    const on = Math.round((j / notes.length) * dur * 0.5 * SR);
    const amp = Math.pow(880 / f, 0.5);
    for (let v = 0; v < 2; v++) {
      const w = (TAU * f * cents(v ? 5 : -5)) / SR;
      const [gl, gr] = panGains((v ? 1 : -1) * rr(0.4, 0.95));
      const trRate = rr(3.5, 5.5);
      const trPh = rnd() * TAU;
      let ph = rnd() * TAU;
      for (let i = on; i < n; i++) {
        const t = (i - on) / SR;
        ph += w * cents(-240 * Math.exp(-t / 0.07)); // 아래에서 미끄러져 올라온다
        const s = (Math.sin(ph) + 0.18 * Math.sin(2.76 * ph)) * smooth(t / 0.14) * (0.6 + 0.4 * Math.sin(TAU * trRate * t + trPh)) * amp;
        L[i] += s * gl;
        R[i] += s * gr;
      }
    }
  });
  normalize({ L, R });
  const air = stereoNoise(n);
  for (const c of [air.L, air.R]) svf(c, BP, (k) => expLerp(1800, 8000, k), 2);
  normalize(air);
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const env = k < 0.6 ? smooth(k / 0.6) : 1 - 0.75 * smooth((k - 0.6) / 0.4);
    L[i] = (L[i] + 0.3 * air.L[i] * Math.pow(k, 1.5)) * env;
    R[i] = (R[i] + 0.3 * air.R[i] * Math.pow(k, 1.5)) * env;
  }
  return normalize(fadeSt({ L, R }, 0.01, 0.2));
}

/** 에어 패드: 한 옥타브 위의 유리질 사인 화음(음마다 느린 트레몰로) + 화음에 조율한 고-Q 노이즈 "숨결". 넓고 가볍게 */
function glassPad(notes, dur, { attack = 0.8, release = 0.8, air = 0.5 } = {}) {
  const n = len(dur);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const name of notes) {
    const f = n2f(name);
    const amp = Math.pow(880 / f, 0.5);
    for (let v = 0; v < 4; v++) {
      const w = (TAU * f * cents(rr(-8, 8))) / SR;
      const ph = rnd() * TAU;
      const tr = (TAU * rr(0.25, 0.9)) / SR;
      const trPh = rnd() * TAU;
      const [gl, gr] = panGains((v % 2 ? 1 : -1) * rr(0.5, 1));
      for (let i = 0; i < n; i++) {
        const s = (Math.sin(w * i + ph) + 0.12 * Math.sin(2 * w * i + ph)) * (0.6 + 0.4 * Math.sin(tr * i + trPh)) * amp;
        L[i] += s * gl;
        R[i] += s * gr;
      }
    }
  }
  normalize({ L, R });
  if (air > 0) {
    const src = stereoNoise(n);
    const a = { L: new Float32Array(n), R: new Float32Array(n) };
    for (const name of notes) {
      const f = n2f(name) * 2;
      if (f > 9000) continue;
      const l = svf(Float32Array.from(src.L), BP, f * cents(rr(-5, 5)), 30);
      const r = svf(Float32Array.from(src.R), BP, f * cents(rr(-5, 5)), 30);
      for (let i = 0; i < n; i++) {
        a.L[i] += l[i];
        a.R[i] += r[i];
      }
    }
    normalize(a);
    for (let i = 0; i < n; i++) {
      L[i] += air * a.L[i];
      R[i] += air * a.R[i];
    }
  }
  return normalize(fadeSt({ L, R }, attack, release));
}

// ═════════════════════════ 큐 시트 (단위: 프레임) ═════════════════════════
// 세 시대: 어제(1–2마디, 옛 필름) → 오늘(3–6마디) → 내일(7–10마디). 컷: f120 · 240 · 300 · 360 · 420 · 480.
console.error("synth…");

// ── 1–2마디 (f0–120) 어제: 4:3 세피아 무성영화 — 칠판 위 분필, 이어서 지우개 ──
// 이 구간의 소리는 전부 광학 트랙 처리(250 Hz–4.5 kHz, 포화, 좁은 스테레오)를 거친다. route: "clean" · "swell" 만 예외.

// f0–118 옛 영사기 베드: 기계 플러터 + 드문 크래클 + 옅은 험. f118 에서 뚝 끊긴다
reseed("projector");
place(projector(118 / FPS), 0, { gain: dB(-14), pan: -0.1, send: 0.04, group: "projector" });
place(crackle(118 / FPS), 0, { gain: dB(-13), pan: 0.1, group: "projector" });
place(hum(118 / FPS), 0, { gain: dB(-27), route: "clean", group: "hum" });

// f0–118 드론(D) — 여기서는 은은하게
reseed("drone");
place(drone(118 / FPS), 0, { gain: dB(-17), route: "clean", group: "drone" });

// f4 영사 램프가 켜진다: (대역 제한된) 옅은 쉬머 + 작은 서브 스웰
reseed("ignite");
place(shimmer([n2f("D6"), n2f("A6"), n2f("D7"), n2f("A7")], 1.5, { attack: 0.09, tau: 0.42 }), 4, { gain: dB(-20), send: 0.5, group: "ignite" });
place(subSwell(n2f("D2"), 1.0), 4, { gain: dB(-19), route: "clean", group: "ignitesub" });

// 분필 폴리(드라이·근접, 쓰는 방향을 따라 왼→오). 광학 버스가 폭을 35% 로 좁히므로 이 구간의 팬은 넓게 적는다
reseed("chalk");
const chalk = (frame, durFrames, opt, mix) => place(chalkStroke(durFrames / FPS, opt), frame, { send: 0.05, group: "chalk", ...mix });
// f11–35 손글씨: 짧은 획 8개
[
  [11, 2.4],
  [14.1, 2.0],
  [17, 2.6],
  [20.3, 1.8],
  [22.8, 2.4],
  [25.9, 2.0],
  [28.6, 2.8],
  [32, 3.0],
].forEach(([f, d], i) => {
  const skew = rr(0.7, 1.3);
  chalk(f, d, { speed: (k) => Math.pow(Math.sin(Math.PI * Math.pow(k, skew)), 0.6), bright: rr(0.9, 1.15), tap: rr(0.5, 0.8) }, { gain: dB(rr(-7.5, -4.5)), pan: -0.6 + 0.9 * (i / 7) });
});
// f36–42 · f41–47 긴 직선 두 획. 화면에서는 1프레임씩 겹치지만 소리는 다음 획이 시작하는 프레임에서 분필을 뗀다
// (f36–41 · f41–46) — 겹치면 한 획처럼 뭉개져서, 획마다 "톡" 으로 시작해 끝에서 힘이 빠지게 했다
const straight = (k) => (0.8 + 0.2 * smooth(k * 4)) * (1 - 0.55 * smooth((k - 0.7) / 0.3));
chalk(36, 5, { speed: straight, bright: 1.05, tap: 0.9 }, { gain: dB(-4), pan: (k) => -0.7 + 1.2 * k });
chalk(41, 5, { speed: straight, bright: 1.0, tap: 0.85 }, { gain: dB(-4.5), pan: (k) => -0.6 + 1.2 * k });
// f46–75 긴 곡선 한 획: 가운데에서 느려지며 어두워졌다가 다시 밝아진다
chalk(46, 29, { speed: (k) => (1 - 0.6 * Math.pow(Math.sin(Math.PI * k), 1.5)) * (0.8 + 0.35 * k), bright: 1.0, tap: 0.7 }, { gain: dB(-4), pan: (k) => -0.6 + 1.1 * k + 0.16 * Math.sin(Math.PI * k) });
// f75 점 하나
place(chalkTap(), 75, { gain: dB(-5), pan: 0.6, send: 0.06, group: "chalk" });
// f78–86 짧은 대시 4개
[
  [78, 1.9],
  [80.2, 1.8],
  [82.3, 1.8],
  [84.3, 1.7],
].forEach(([f, d], i) => {
  chalk(f, d, { speed: (k) => 0.7 + 0.3 * Math.sin(Math.PI * k), bright: rr(0.95, 1.1), tap: 0.7 }, { gain: dB(rr(-6.5, -5)), pan: (k) => -0.2 + 0.24 * i + 0.2 * k });
});

// 낡은 업라이트 피아노 두 음: D4 @f8, A4 @f60
reseed("piano");
place(uprightPiano(n2f("D4")), 8, { gain: dB(-7), pan: -0.1, send: 0.55, group: "piano" });
place(uprightPiano(n2f("A4")), 60, { gain: dB(-8), pan: 0.1, send: 0.55, group: "piano" });

// 지우개 스윕 3번: f86–95(L→R) · f96–105(R→L) · f106–115(L→R)
reseed("eraser");
[
  [86, 1],
  [96, -1],
  [106, 1],
].forEach(([f, dir]) => place(eraser(9 / FPS), f, { gain: dB(-8), pan: (k) => dir * (-1 + 2 * k), send: 0.1, group: "eraser" }));

// f100–118 리버스 스웰 → f118–120 정적
reseed("swell");
place(reverseSwell(18 / FPS, ["D3", "A3", "D4", "F4", "A4", "D5"]), 100, { gain: dB(3.5), route: "swell", group: "swell" });

// ── f120: IMPACT 1 — 오늘. 풀레인지·와이드 스테레오로 열리며 헤드라인이 떨어진다 ──
reseed("impact1");
place(subBoom({ f0: 70, f1: n2f("D1"), tail: 1.8 }), HIT1, { gain: dB(-9), group: "boom" });
place(
  braam(
    [
      ["D2", 1],
      ["A2", 0.8],
      ["D3", 0.7],
    ],
    2.2,
    { fcPeak: 2100 },
  ),
  HIT1,
  { gain: dB(-10.5), send: 0.35, group: "braam" },
);
place(darkCrash(1.6), HIT1, { gain: dB(-16), send: 0.9, group: "crash" });
place(shimmer([n2f("D6"), n2f("A6"), n2f("D7"), n2f("F7")], 2.4, { attack: 0.2, tau: 0.9 }), HIT1, { gain: dB(-27), send: 0.7, group: "shimmer" });

// f120–540 오스티나토: 8분음표 저음 스타카토, 화음 근음을 따라간다(3+3+2 악센트, 점8분 스테레오 딜레이)
reseed("ostinato");
const ostRoot = (f) => (f < 240 ? "D2" : f < 300 ? "Bb1" : f < 360 ? "F2" : f < 420 ? "C2" : f < 450 ? "G2" : f < 480 ? "A2" : "D2");
const ostLevel = (f) => (f < 240 ? -5 : f < 300 ? -2.5 : f < 360 ? -2 : f < 420 ? -1.5 : f < 480 ? -1 + (2 * (f - 420)) / 60 : -6 - (5 * (f - 480)) / 60);
const ACCENT = [1, 0.55, 0.62, 0.85, 0.55, 0.62, 0.9, 0.58];
for (let i = 0; HIT1 + i * EIGHTH < 540; i++) {
  const f = HIT1 + i * EIGHTH;
  const vel = ACCENT[i % 8];
  const note = ostNote(n2f(ostRoot(f)), vel);
  const g = dB(-8.5 + ostLevel(f)) * (0.55 + 0.45 * vel);
  place(note, f, { gain: g, send: 0.12, group: "ost" });
  const echo = onePoleHP(onePoleLP(Float32Array.from(note), 1400), 160);
  for (const [df, eg, ep] of [
    [11.25, -13, -0.65],
    [22.5, -20, 0.65],
  ]) {
    if (f < HIT2 && f + df >= 476) continue; // 진공·임팩트 2 를 넘어가는 에코는 버린다
    place(echo, f + df, { gain: g * dB(eg), pan: ep, send: 0.2, group: "ost" });
  }
}

// 패드: 구간마다 화음 하나(경계 조금 앞에서 피어올라 크로스페이드)
reseed("pads");
const padCue = (from, to, notes, { gain = -11, attack = 0.6, release = 0.6, fc = 1500, lead = 7, send = 0.45 } = {}) => {
  const start = from - lead;
  place(pad(notes, (to - start) / FPS + release, { attack, release, fc }), start, { gain: dB(gain), send, group: "pad" });
};
// 3–4마디 Dm9
padCue(120, 240, [["D3"], ["A3"], ["F4"], ["A4", 0.8], ["C5", 0.8], ["E5", 0.7]], { lead: 0, attack: 0.9, gain: -12.5 });
// 5마디 B♭maj7
padCue(240, 300, [["Bb2"], ["F3"], ["D4"], ["F4"], ["A4", 0.85], ["D5", 0.7]]);
// 6마디 Fadd9
padCue(300, 360, [["F3"], ["C4"], ["F4"], ["G4", 0.85], ["A4"], ["C5", 0.75]]);
// 7마디 Csus2/add9
padCue(360, 420, [["C3"], ["G3"], ["D4"], ["E4", 0.6], ["G4"], ["D5", 0.75]], { gain: -11.5, fc: 1700 });
// 8마디 Gm → Asus4 → A(3음 없음)
padCue(420, 450, [["G3"], ["Bb3"], ["D4"], ["G4"], ["Bb4", 0.85], ["D5", 0.75]], { gain: -11, fc: 1900, release: 0.5, lead: 6 });
padCue(450, 465, [["A3"], ["E4"], ["A4"], ["D5"], ["E5", 0.8]], { gain: -11.5, fc: 2200, attack: 0.3, release: 0.35, lead: 4 });
padCue(465, 478, [["A3"], ["E4"], ["A4"], ["E5"], ["A5", 0.7]], { gain: -11, fc: 2500, attack: 0.25, release: 0.2, lead: 3 });
// 9–10마디 Dadd9 MAJOR — 밝은 해결
padCue(480, 600, [["D3"], ["A3"], ["D4"], ["E4", 0.8], ["F#4"], ["A4"], ["D5", 0.8], ["F#5", 0.6]], { lead: 0, attack: 0.3, release: 0.5, fc: 2600, gain: -10 });

// 에어 패드(f360–): "내일" 구간부터 한 옥타브 위에 얹는 유리질 고역 레이어 — 3–6마디보다 열리고 투명하게
reseed("air");
const airCue = (from, to, notes, { gain = -23, attack = 0.8, release = 0.8, lead = 6 } = {}) => {
  const start = from - lead;
  place(glassPad(notes, (to - start) / FPS + release, { attack, release }), start, { gain: dB(gain), send: 0.7, group: "air" });
};
airCue(360, 420, ["G5", "C6", "D6", "E6", "G6"], { lead: 0, attack: 1.0 });
airCue(420, 450, ["G5", "Bb5", "D6", "G6"], { gain: -22, release: 0.5 });
airCue(450, 465, ["A5", "D6", "E6", "A6"], { gain: -21, attack: 0.3, release: 0.35, lead: 4 });
airCue(465, 478, ["A5", "E6", "A6"], { gain: -20.5, attack: 0.25, release: 0.2, lead: 3 });
airCue(480, 600, ["F#5", "A5", "D6", "E6", "F#6", "A6"], { gain: -21, lead: 0, attack: 0.5, release: 0.5 });

// 서브 베이스(근음을 길게)
reseed("sub");
const subCue = (from, to, name, g = -17, attack = 0.08) => place(subNote(n2f(name), (to - from) / FPS + 0.1, attack), from, { gain: dB(g), group: "sub" });
subCue(150, 240, "D2", -18, 0.6);
subCue(240, 300, "Bb1");
subCue(300, 360, "F2", -18);
subCue(360, 420, "C2");
subCue(420, 450, "G1", -16);
subCue(450, 477, "A1", -15);
subCue(495, 585, "D2", -17, 0.5);

// 타이포 히트(부드러운 저음 "툭" + 짧은 공기): f128 · f136, 그리고 "내일" 샷의 f368 · f376
reseed("type");
const typeHit = (f, g, pan) => {
  place(subBoom({ f0: 95, f1: 52, drop: 0.04, tail: 0.35, punch: 0.3, click: 0.12 }), f, { gain: dB(-15 + g), group: "typehit" });
  place(swish(0.16, 2600, 7000, 0.9, 0.2), f, { gain: dB(-23 + g), pan, send: 0.4, group: "typehit" });
};
typeHit(128, 0, -0.2);
typeHit(136, -1, 0.2);
typeHit(368, 0, -0.2);
typeHit(376, -1, 0.2);

// f132–165 상승하는 유리 벨 아르페지오(D 마이너 펜타토닉) — f135 부터는 16분 그리드
reseed("arp");
const ARP_NOTES = ["A4", "D5", "F5", "A5", "C6", "D6", "F6", "G6", "A6", "D7"];
const ARP_FRAMES = [132, 135, 138.75, 142.5, 146.25, 150, 153.75, 157.5, 161.25, 165];
ARP_NOTES.forEach((name, i) => {
  place(glassBell(n2f(name), 2.2, { bright: 0.7 }), ARP_FRAMES[i], { gain: dB(-21 - 0.45 * i), pan: (i % 2 ? 1 : -1) * (0.25 + 0.05 * i), send: 0.85, group: "arp" });
});

// f180 서브 펄스 + 작은 핑
reseed("pulse");
place(subBoom({ f0: 92, f1: n2f("D2"), drop: 0.07, tail: 0.6, drive: 0.8, punch: 0, click: 0 }), 180, { gain: dB(-12), group: "pulse" });
place(glassBell(n2f("A6"), 1.4, { bright: 0.6 }), 180, { gain: dB(-27), pan: 0.3, send: 0.9, group: "pulse" });

// ── 컷: f240 · f300 · f420 은 휩 팬 + 중간 크기 저음 히트, f360 은 푸시스루 ──
reseed("cuts");
const CUT_ROOT = { 240: "Bb1", 300: "F1", 420: "G1" };
[240, 300, 420].forEach((f, i) => {
  const dir = i % 2 ? -1 : 1;
  place(whip(12 / FPS), f - 6, { gain: dB(-9.5), pan: (k) => dir * (-0.85 + 1.7 * smooth(k)), send: 0.25, group: "whip" });
  place(subBoom({ f0: 100, f1: n2f(CUT_ROOT[f]), drop: 0.05, tail: 0.8, punch: 0.45, click: 0.2 }), f, { gain: dB(-13.5), group: "cuthit" });
  place(thud(0.2), f, { gain: dB(-13), send: 0.5, group: "cuthit" });
});

// 5마디 (f240–300) 자동 녹화: REC 비프 2번, 타임코드 틱, "저장됨" 차임(F5→A5, B♭maj7 안)
reseed("bar5");
place(beep(n2f("Bb5")), 250, { gain: dB(-27), pan: 0.2, send: 0.15, group: "sfx" });
place(beep(n2f("Bb5")), 254, { gain: dB(-27), pan: 0.2, send: 0.15, group: "sfx" });
for (let f = 256; f <= 285; f += 3) place(tick(rr(3800, 4400), 0.0009, 0.3), f, { gain: dB(-31), pan: 0.25, group: "sfx" });
place(glassBell(n2f("F5"), 1.6), 288, { gain: dB(-21), pan: -0.2, send: 0.7, group: "chime" });
place(glassBell(n2f("A5"), 2.0), 292, { gain: dB(-20), pan: 0.2, send: 0.7, group: "chime" });

// 6마디 (f300–360) 수업 파일: 피치가 올라가는 페이지 플릭 4번, 클릭 + 차임(A5→C6, F 안)
reseed("bar6");
[306, 312, 318, 324].forEach((f, i) => {
  const fc = [1100, 1450, 1900, 2500][i];
  place(swish(0.11, fc, fc * 1.7, 1.4, 0.2), f, { gain: dB(-22), pan: i % 2 ? 0.3 : -0.3, send: 0.3, group: "sfx" });
});
place(tick(1800, 0.0016, 0.5), 338, { gain: dB(-26), send: 0.15, group: "sfx" });
place(glassBell(n2f("A5"), 1.6), 338, { gain: dB(-21), pan: -0.2, send: 0.7, group: "chime" });
place(glassBell(n2f("C6"), 2.0), 342, { gain: dB(-20), pan: 0.2, send: 0.7, group: "chime" });

// ── 7마디 (f360–420) 내일: 칠판을 뚫고 홀로그램 공간으로 ──
reseed("bar7");
// f352–368 푸시스루 우쉬(넓게) + f360 서브 드롭
place(pushThrough(16 / FPS), 352, { gain: dB(-12.5), send: 0.3, group: "push" });
place(subBoom({ f0: 120, f1: n2f("C1"), drop: 0.14, tail: 1.1, drive: 1.3, punch: 0.4, click: 0.2 }), 360, { gain: dB(-12.5), group: "push" });
place(thud(0.2), 360, { gain: dB(-14), send: 0.5, group: "push" });
// f360–384 홀로그램 파워업(Csus2/add9 음으로 아래→위). 버퍼는 f386 까지(마지막 0.2 s 는 페이드), 꼬리는 리버브가 잇는다
place(holoPowerUp(26 / FPS, ["C5", "G5", "D6", "E6", "G6", "C7", "D7"]), 360, { gain: dB(-18), send: 0.75, group: "holo" });

// ── 8마디 (f420–480) AI 강의 리포트 + 피날레로 빌드업 ──
reseed("bar8");
// f426–452 스캔 스윕, f430–456 가속하는 카운트업 틱, f458 점수 "딩"(A5+D6 — Asus4 안, 으뜸음을 예고)
place(scanSweep(26 / FPS, ["G3", "D4", "G4"]), 426, { gain: dB(-23), pan: (k) => -0.4 + 0.8 * k, send: 0.3, group: "sfx" });
const COUNT_SCALE = ["G6", "Bb6", "D7", "D7", "E7", "A7"];
const COUNT_N = 14;
for (let j = 0; j < COUNT_N; j++) {
  const u = j / (COUNT_N - 1);
  const f = 430 + (26 * (1 - Math.exp(-1.4 * u))) / (1 - Math.exp(-1.4));
  place(tick(n2f(COUNT_SCALE[Math.floor((j * COUNT_SCALE.length) / COUNT_N)]), 0.0014, 0.2), f, { gain: dB(-30 + 2 * u), pan: -0.2, send: 0.1, group: "sfx" });
}
place(glassBell(n2f("D6"), 1.6), 458, { gain: dB(-19), pan: 0.15, send: 0.7, group: "chime" });
place(glassBell(n2f("A5"), 1.6), 458, { gain: dB(-21), pan: -0.15, send: 0.7, group: "chime" });
// f420–476 라이저(f476 직후 초크될 때까지 최대치 유지)
place(riser(57 / FPS, n2f("A3"), n2f("A5")), 420, { gain: dB(-9.5), send: 0.3, group: "riser" });
// 가속하는 저음 드럼 롤
[
  [450, -12],
  [457.5, -11],
  [465, -10],
  [469, -9],
  [473, -9],
  [476, -8.5],
].forEach(([f, g]) => place(taiko(n2f("A1"), { dur: 0.7 }), f, { gain: dB(g), send: 0.3, group: "roll" }));
// f476–480: 진공(구간 B 엔벨로프가 리버브 꼬리까지 잘라낸다)

// ── f480: IMPACT 2 — 로고 리빌, 곡에서 가장 큰 순간 ──
reseed("impact2");
place(subBoom({ f0: 82, f1: n2f("D1"), tail: 2.2, drive: 1.8, punch: 0.6, click: 0.3 }), HIT2, { gain: dB(-7), group: "boom" });
place(taiko(n2f("D2"), { dur: 1.2 }), HIT2, { gain: dB(-11), send: 0.5, group: "boom" });
place(
  braam(
    [
      ["D2", 1],
      ["A2", 0.85],
      ["D3", 0.8],
      ["F#3", 0.7],
      ["A3", 0.6],
      ["D4", 0.4],
    ],
    2.8,
    { fcPeak: 3600, fcEnd: 320, close: 0.9, hold: 0.45, decay: 0.75 },
  ),
  HIT2,
  { gain: dB(-5), send: 0.4, group: "braam" },
);
place(wash(3.0), HIT2, { gain: dB(-12), send: 0.6, group: "wash" });
place(shimmer([n2f("D6"), n2f("F#6"), n2f("A6"), n2f("D7"), n2f("F#7"), n2f("A7")], 3.2, { attack: 0.25, tau: 1.3 }), HIT2, { gain: dB(-22), send: 0.7, group: "shimmer" });

// f486–500 라이트 스윕(렌즈 플레어가 로고를 훑는다) + 반짝임
reseed("sweep");
place(swish(14 / FPS, 3600, 11000, 2.2, 0.5), 486, { gain: dB(-21), pan: (k) => -0.7 + 1.4 * k, send: 0.5, group: "sweep" });
["D7", "F#7", "A7", "D8", "A7", "F#7"].forEach((name, j) => {
  place(glassBell(n2f(name), 0.6, { bright: 0.4 }), 487 + j * 2.2, { gain: dB(-31), pan: -0.6 + 0.24 * j, send: 0.8, group: "sweep" });
});

// 벨 모티프: F♯5 @f495 · A5 @f510 · D6 @f525
reseed("motif");
[
  ["F#5", 495, -0.25],
  ["A5", 510, 0.2],
  ["D6", 525, 0],
].forEach(([name, f, pan]) => {
  place(glassBell(n2f(name), 3.2, { bright: 0.9 }), f, { gain: dB(-11.5), pan, send: 0.8, group: "motif" });
  place(glassBell(n2f(name) / 2, 2.4, { bright: 0.3, soft: 0.012 }), f, { gain: dB(-22), pan: -pan, send: 0.6, group: "motif" });
});

// f528 UI 클릭/팝(CTA 버튼)
reseed("ui");
place(uiPop(n2f("A5"), n2f("D6") * 1.12), 528, { gain: dB(-23), pan: 0.1, send: 0.2, group: "sfx" });

// ───────────────────────── 리버브: 16-라인 FDN ─────────────────────────
// 프리딜레이 → 입력 확산(올패스 4단) → 하다마드 피드백 딜레이 네트워크(16라인, 라인마다 변조) →
// 피드백 안의 로우패스 댐핑(고역이 먼저 죽는 어두운 꼬리) → 서로 직교하는 탭으로 L/R 을 뽑아 넓게.
// 임펄스 응답 실측: RT60 ≈ 3.0 s(250 Hz–1 kHz) · 2 s 안팎(4 kHz 이상), 꼬리의 L/R 상관 ≈ 0.
function reverb(inL, inR, s0, s1, { rt60 = 3.1, hfRatio = 0.14, preMs = 20, lowCut = 170, highCut = 6500, early = 0.12 } = {}) {
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
    // 확산된 입력을 조금 섞어 초기 반사로 쓴다(프리딜레이 직후 ~ FDN 첫 도달 사이를 메운다)
    outL[t] = ol + early * il;
    outR[t] = or + early * ir;
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
const TARGET_LUFS = -14.9; // ffmpeg loudnorm 은 ebur128 보다 0.2–0.3 LU 낮게 읽는다 → 두 미터의 가운데가 −15 가 되게
const CEILING = dB(-2.2); // 샘플 피크 천장(AAC 인코딩 뒤에도 트루 피크 ≤ −1.5 dBTP 가 되도록 여유)
const INTRO_PEAK = dB(-18); // 오프닝(f0–f100)의 피크 목표
const WET = 0.5;
const OPTICAL_BAND = [250, 4500]; // Hz
const OPTICAL_WIDTH = 0.35;
const OPTICAL_CREST_DB = 12.5; // 광학 트랙 포화의 기준: 버스 RMS 보다 이만큼 위에서 tanh 가 눕는다
const INTRO_END = 100; // 오프닝 피크를 재는 구간의 끝(리버스 스웰 시작 전)
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
// 구간별 믹스: 드라이 + 웻 → 하이패스 25 Hz(4차, 초저역 럼블·DC 제거) → 120 Hz 아래 모노 → 구간 엔벨로프.
// 필터를 엔벨로프보다 먼저 걸어야 진공 구간에 필터 링잉이 남지 않는다(완전한 디지털 무음).
const SEC_MIX = SECTIONS.slice(0, 3).map((sec, s) => {
  const [s0, s1] = SEC_RANGE[s];
  const n = s1 - s0;
  const [wl, wr] = reverb(sec.rev[0], sec.rev[1], s0, s1);
  const l = new Float32Array(n);
  const r = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    l[i] = sec.dry[0][s0 + i] + wl[i] * WET;
    r[i] = sec.dry[1][s0 + i] + wr[i] * WET;
  }
  if (s === 0) {
    // 어제(옛 필름): 250 Hz–4.5 kHz 대역 제한(HP 2차 · LP 4차) → 광학 트랙식 포화(다이내믹이 눌린 옛 녹음) → 폭 35%.
    // 리버스 스웰은 대역 제한만, 드론·험(clean)은 그대로 더한다.
    const band = (ch) => {
      biquad(ch, hpCoef(OPTICAL_BAND[0]));
      biquad(ch, lpCoef(OPTICAL_BAND[1], 0.5412));
      biquad(ch, lpCoef(OPTICAL_BAND[1], 1.3066));
    };
    band(l);
    band(r);
    // 포화 기준 레벨 = RMS + OPTICAL_CREST_DB → 드문 스파이크(분필 탭·크래클)가 눌려 같은 피크에서 몸통이 더 잘 들린다
    let e = 0;
    for (let i = 0; i < n; i++) e += l[i] * l[i] + r[i] * r[i];
    const ref = Math.sqrt(e / (2 * n)) * dB(OPTICAL_CREST_DB);
    if (ref > 0) {
      for (let i = 0; i < n; i++) {
        l[i] = Math.tanh(l[i] / ref) * ref;
        r[i] = Math.tanh(r[i] / ref) * ref;
      }
      biquad(l, lpCoef(OPTICAL_BAND[1]));
      biquad(r, lpCoef(OPTICAL_BAND[1]));
    }
    const sw = SECTIONS[4].dry.map((c) => c.slice(s0, s1));
    band(sw[0]);
    band(sw[1]);
    const clean = SECTIONS[3].dry;
    for (let i = 0; i < n; i++) {
      const lo = l[i] + sw[0][i];
      const ro = r[i] + sw[1][i];
      const m = (lo + ro) * 0.5;
      const sd = (lo - ro) * 0.5 * OPTICAL_WIDTH;
      l[i] = m + sd + clean[0][s0 + i];
      r[i] = m - sd + clean[1][s0 + i];
    }
  }
  for (const ch of [l, r]) {
    biquad(ch, hpCoef(25, 0.5412));
    biquad(ch, hpCoef(25, 1.3066));
  }
  const side = new Float32Array(n);
  for (let i = 0; i < n; i++) side[i] = (l[i] - r[i]) * 0.5;
  biquad(side, hpCoef(120));
  biquad(side, hpCoef(120));
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  for (let i = 0; i < n; i++) {
    const e = secEnv[s](s0 + i);
    const m = (l[i] + r[i]) * 0.5;
    L[s0 + i] = (m + side[i]) * e;
    R[s0 + i] = (m - side[i]) * e;
  }
  return [L, R];
});

/** 룩어헤드 리미터(지연 없음): 앞으로 W 샘플의 최소 필요 게인 → 느린 릴리스 → W 샘플 이동 평균.
 *  게인이 파형의 마루 하나하나가 아니라 엔벨로프를 따라가므로 저음 마루가 평평하게 깎이지 않는다. 감쇠 곡선을 돌려준다 */
function limiter(L, R, thr, { lookMs = 5, releaseMs = 220 } = {}) {
  const n = L.length;
  const W = Math.max(1, Math.round((lookMs / 1000) * SR));
  const req = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    req[i] = p > thr ? thr / p : 1;
  }
  const ahead = new Float32Array(n);
  const dq = new Int32Array(n);
  let head = 0;
  let tail = 0;
  for (let i = n - 1; i >= 0; i--) {
    while (tail > head && req[dq[tail - 1]] >= req[i]) tail--;
    dq[tail++] = i;
    while (dq[head] > i + W - 1) head++;
    ahead[i] = req[dq[head]];
  }
  const rel = 1 - Math.exp(-1 / ((releaseMs / 1000) * SR));
  for (let i = 1; i < n; i++) ahead[i] = Math.min(ahead[i], ahead[i - 1] + (1 - ahead[i - 1]) * rel);
  const g = new Float32Array(n);
  let acc = 0;
  for (let i = 0; i < n; i++) {
    acc += ahead[i];
    if (i >= W) acc -= ahead[i - W];
    g[i] = Math.min(req[i], i >= W - 1 ? acc / W : (acc + (W - 1 - i)) / W);
    L[i] *= g[i];
    R[i] *= g[i];
  }
  return g;
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
  let gr = null;
  let loud = 0;
  for (let it = 0; it < 6; it++) {
    oL = Float32Array.from(L, (v) => v * gain);
    oR = Float32Array.from(R, (v) => v * gain);
    gr = limiter(oL, oR, CEILING * dB(1.5));
    softClip(oL, CEILING * dB(-3), CEILING);
    softClip(oR, CEILING * dB(-3), CEILING);
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

const grIn = (fa, fb) => {
  let m = 1;
  for (let i = F(fa); i < F(fb); i++) if (M.gr[i] < m) m = M.gr[i];
  return toDb(m).toFixed(2);
};

console.error("master…");
// 1차로 전체 게인을 구하고, 오프닝 피크가 −18 dBFS 가 되도록 구간 A 를 트림한 뒤 다시 마스터링
let trimA = 1;
let M = master(trimA);
for (let it = 0; it < 2; it++) {
  const p = peakIn(M, 0, INTRO_END);
  if (p <= 0) break;
  trimA *= INTRO_PEAK / p;
  M = master(trimA);
}

// ───────────────────────── WAV 저장 ─────────────────────────
const pcm = Buffer.alloc(N * 4);
const dc = [0, 0];
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

const outPath = process.env.SCORE_OUT ? path.resolve(process.env.SCORE_OUT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/audio/cinematic-score.wav");
if (SOLO && !process.env.SCORE_OUT) throw new Error("SCORE_SOLO 는 SCORE_OUT 과 함께 쓴다(정식 출력 파일을 덮어쓰지 않도록)");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, Buffer.concat([header, pcm]));

const tp = truePeak([M.L, M.R]);
console.log(
  [
    `wrote ${outPath}`,
    `${N} samples · ${(N / SR).toFixed(3)} s · ${SR} Hz · 16-bit stereo`,
    `integrated ${M.loud.toFixed(2)} LUFS · sample peak ${toDb(peakIn(M, 0, TOTAL_FRAMES)).toFixed(2)} dBFS · true peak ≈ ${toDb(tp).toFixed(2)} dBTP`,
    `master gain ${toDb(M.gain).toFixed(2)} dB · intro trim ${toDb(trimA).toFixed(2)} dB · limiter GR (dB): hit1 ${grIn(120, 150)} · bars5–7 ${grIn(240, 420)} · bar8 ${grIn(420, 478)} · hit2 ${grIn(480, 540)}`,
    `peaks: intro f0–100 ${toDb(peakIn(M, 0, INTRO_END)).toFixed(1)} · swell f100–118 ${toDb(peakIn(M, INTRO_END, 118)).toFixed(1)} · gap f118.2–120 ${toDb(peakIn(M, 118.2, 120)).toFixed(1)} · hit1 f120–135 ${toDb(peakIn(M, 120, 135)).toFixed(1)} · gap f477.5–480 ${toDb(peakIn(M, 477.5, 480)).toFixed(1)} · hit2 f480–495 ${toDb(peakIn(M, 480, 495)).toFixed(1)} dBFS`,
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
  console.log(`\n── 구간 A 스템: 광학 트랙 처리 뒤(리버브 제외), f0–${INTRO_END} ──`);
  for (const [name, bus] of [...STEMS.entries()].sort()) {
    const n = F(118);
    const l = bus[0].slice(0, n);
    const r = bus[1].slice(0, n);
    if (!l.some((v) => v !== 0) && !r.some((v) => v !== 0)) continue;
    if (!bus.clean) {
      for (const ch of [l, r]) {
        biquad(ch, hpCoef(OPTICAL_BAND[0]));
        biquad(ch, lpCoef(OPTICAL_BAND[1], 0.5412));
        biquad(ch, lpCoef(OPTICAL_BAND[1], 1.3066));
      }
      for (let i = 0; i < n; i++) {
        const m = (l[i] + r[i]) * 0.5;
        const sd = (l[i] - r[i]) * 0.5 * OPTICAL_WIDTH;
        l[i] = m + sd;
        r[i] = m - sd;
      }
    }
    const st = { L: l, R: r };
    const k = trimA * g;
    console.log(`${name.padEnd(12)} peak ${toDb(peakIn(st, 0, INTRO_END) * k).toFixed(1).padStart(6)} · rms f0–${INTRO_END} ${toDb(rmsIn(st, 0, INTRO_END) * k).toFixed(1).padStart(6)} · rms f100–118 ${toDb(rmsIn(st, INTRO_END, 118) * k).toFixed(1).padStart(6)}`);
  }
  for (const [label, fa, fb] of [
    ["hit1 f120–135", 120, 135],
    ["cut f240–247", 240, 247],
    ["cut f300–307", 300, 307],
    ["push f352–368", 352, 368],
    ["cut f420–427", 420, 427],
    ["bar8 f450–477", 450, 477],
    ["hit2 f480–495", 480, 495],
  ]) {
    const rows = [...STEMS.entries()]
      .map(([name, bus]) => [name, peakIn({ L: bus[0], R: bus[1] }, fa, fb) * g, rmsIn({ L: bus[0], R: bus[1] }, fa, fb) * g])
      .filter((r) => r[1] > 1e-4)
      .sort((a, b) => b[1] - a[1]);
    console.log(`\n── ${label}: 스템 피크/RMS (dry, post gain) ──\n` + rows.map(([nm, pk, rm]) => `${nm} ${toDb(pk).toFixed(1)}/${toDb(rm).toFixed(1)}`).join(" · "));
  }
  const ev = [];
  for (let f = 120; f < 600; f += 2.5) {
    const v = Number(grIn(f, f + 2.5));
    if (v < -0.3) ev.push(`f${f}:${v.toFixed(1)}`);
  }
  console.log("\n── limiter GR < −0.3 dB (2.5f 창) ──\n" + ev.join(" "));
}

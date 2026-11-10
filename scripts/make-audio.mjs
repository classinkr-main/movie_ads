// 갈매기 드로잉 쇼릴의 BGM + 효과음을 코드로 합성한다(샘플·외부 음원 없음).
//   node scripts/make-audio.mjs            → public/audio/gull-reel.wav
//   npm run audio                          → wav 합성 후 ffmpeg 로 m4a 인코딩
// 120 BPM · 30fps 기준: 한 박 = 15f, 한 마디 = 60f. 씬 타이밍(src/gull/scenes/*)과 맞물려 있으니
// 영상 타이밍을 바꾸면 아래 CUE 표도 함께 고친다.
import fs from "node:fs";
import path from "node:path";

const SR = 48000;
const FPS = 30;
const TOTAL_FRAMES = 1470;
const N = Math.ceil((TOTAL_FRAMES / FPS) * SR);
const TAU = Math.PI * 2;

// ── 믹스 버스 ──
const bus = () => [new Float32Array(N), new Float32Array(N)];
const DRY = bus();
const REV = bus(); // 리버브로 보낼 신호

let seed = 20261110;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;

const f2s = (frame) => Math.round((frame / FPS) * SR);
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const NOTE = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
const n2f = (name) => {
  const m = /^([A-G]#?)(\d)$/.exec(name);
  return midi(NOTE[m[1]] + (Number(m[2]) + 1) * 12);
};

/** 모노 신호를 팬·게인·리버브 센드와 함께 버스에 더한다 */
const add = (buf, start, { gain = 1, pan = 0, send = 0 } = {}) => {
  const l = gain * Math.cos(((pan + 1) * Math.PI) / 4);
  const r = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < buf.length; i++) {
    const j = start + i;
    if (j < 0 || j >= N) continue;
    DRY[0][j] += buf[i] * l;
    DRY[1][j] += buf[i] * r;
    if (send > 0) {
      REV[0][j] += buf[i] * l * send;
      REV[1][j] += buf[i] * r * send;
    }
  }
};

// 1극 필터들
const lowpass = (buf, hz) => {
  const a = 1 - Math.exp((-TAU * hz) / SR);
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    y += a * (buf[i] - y);
    buf[i] = y;
  }
  return buf;
};
const highpass = (buf, hz) => {
  const a = 1 - Math.exp((-TAU * hz) / SR);
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    y += a * (buf[i] - y);
    buf[i] -= y;
  }
  return buf;
};
/** 2극 밴드패스(상태변수 필터). hz는 함수여도 된다(스윕) */
const bandpass = (buf, hz, q = 2) => {
  let low = 0;
  let band = 0;
  const fn = typeof hz === "function" ? hz : () => hz;
  for (let i = 0; i < buf.length; i++) {
    const f = 2 * Math.sin((Math.PI * Math.min(fn(i / buf.length), SR / 6.5)) / SR);
    low += f * band;
    const high = buf[i] - low - band / q;
    band += f * high;
    buf[i] = band;
  }
  return buf;
};

// ── 악기 ──

/** 나일론 줄 뜯는 소리(우쿨렐레) — 배음마다 감쇠가 다른 가산 합성 */
const pluck = (freq, dur = 0.9, { bright = 1, pos = 0.22 } = {}) => {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  const H = Math.min(14, Math.floor(9000 / freq));
  for (let k = 1; k <= H; k++) {
    const amp = (Math.sin(Math.PI * k * pos) / Math.pow(k, 0.72)) * (k > 1 ? Math.pow(bright, 0.6) : 1);
    if (Math.abs(amp) < 0.004) continue;
    const decay = 3.2 + 0.26 * k * k * (1 / bright);
    const w = (TAU * freq * k * (1 + 0.00035 * k * k)) / SR; // 약간의 비조화
    const ph = rnd() * 0.4;
    for (let i = 0; i < len; i++) out[i] += amp * Math.exp((-decay * i) / SR) * Math.sin(w * i + ph);
  }
  // 손톱 어택
  for (let i = 0; i < 300; i++) out[i] += noise() * 0.3 * Math.exp(-i / 60);
  const fade = Math.floor(0.02 * SR);
  for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
  for (let i = 0; i < 48; i++) out[i] *= i / 48;
  return out;
};

/** 글로켄슈필/벨 */
const bell = (freq, dur = 1.4, { hard = 1 } = {}) => {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  const parts = [
    [1, 1, 3.2],
    [2.756, 0.34 * hard, 5.5],
    [5.404, 0.13 * hard, 9],
    [8.933, 0.05 * hard, 14],
  ];
  for (const [ratio, amp, decay] of parts) {
    if (freq * ratio > 16000) continue;
    const w = (TAU * freq * ratio) / SR;
    for (let i = 0; i < len; i++) out[i] += amp * Math.exp((-decay * i) / SR) * Math.sin(w * i);
  }
  for (let i = 0; i < 96; i++) out[i] *= i / 96;
  const fade = Math.floor(0.03 * SR);
  for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
  return out;
};

/** 마림바(나무 건반) */
const marimba = (freq, dur = 0.7) => {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  const parts = [
    [1, 1, 7],
    [3.98, 0.22, 22],
    [9.4, 0.06, 40],
  ];
  for (const [ratio, amp, decay] of parts) {
    const w = (TAU * freq * ratio) / SR;
    for (let i = 0; i < len; i++) out[i] += amp * Math.exp((-decay * i) / SR) * Math.sin(w * i);
  }
  for (let i = 0; i < 200; i++) out[i] += noise() * 0.1 * Math.exp(-i / 30);
  for (let i = 0; i < 48; i++) out[i] *= i / 48;
  const fade = Math.floor(0.02 * SR);
  for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
  return out;
};

/** 둥근 베이스(업라이트 느낌) */
const bass = (freq, dur = 0.5) => {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  const w = (TAU * freq) / SR;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.min(1, i / 180) * Math.exp(-5.5 * t);
    out[i] = env * (0.8 * Math.sin(w * i) + 0.6 * Math.sin(2 * w * i) * Math.exp(-4 * t) + 0.3 * Math.sin(3 * w * i) * Math.exp(-7 * t) + 0.12 * Math.sin(4 * w * i) * Math.exp(-10 * t));
  }
  const fade = Math.floor(0.03 * SR);
  for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
  return out;
};

const kick = () => {
  const len = Math.floor(0.22 * SR);
  const out = new Float32Array(len);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const f = 46 + 90 * Math.exp(-t * 34);
    ph += (TAU * f) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 22) * Math.min(1, i / 40) + noise() * 0.12 * Math.exp(-t * 180);
  }
  return out;
};

const shaker = (accent = 1) => {
  const len = Math.floor(0.07 * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) out[i] = noise() * Math.exp(-i / (SR * 0.014)) * Math.min(1, i / 70) * accent;
  return highpass(out, 5200);
};

/** 손가락 스냅 */
const snap = () => {
  const len = Math.floor(0.12 * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const e = Math.exp(-t * 60) + 0.5 * Math.exp(-Math.max(0, t - 0.009) * 80) * (t > 0.009 ? 1 : 0);
    out[i] = noise() * e;
  }
  return bandpass(out, 1900, 1.6);
};

/** 따뜻한 패드(화음) */
const pad = (freqs, dur) => {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  for (const f of freqs) {
    for (const det of [-0.004, 0.003]) {
      const w = (TAU * f * (1 + det)) / SR;
      const ph = rnd() * TAU;
      for (let i = 0; i < len; i++) out[i] += Math.sin(w * i + ph) + 0.3 * Math.sin(2 * w * i + ph);
    }
  }
  const a = Math.floor(0.5 * SR);
  const r = Math.floor(0.6 * SR);
  for (let i = 0; i < len; i++) {
    const env = Math.min(1, i / a) * Math.min(1, (len - i) / r);
    out[i] *= env / (freqs.length * 2.6);
  }
  return lowpass(out, 3200);
};

// ── 효과음 ──

/** 뿅 — 위로 휘는 사인 */
const popSfx = (f0 = 320, f1 = 900, dur = 0.09) => {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const k = i / len;
    ph += (TAU * (f0 + (f1 - f0) * Math.pow(k, 0.6))) / SR;
    out[i] = Math.sin(ph) * Math.pow(1 - k, 1.6) * Math.min(1, i / 30);
  }
  return out;
};

/** 갈매기 목소리 — 짧고 귀여운 삐약(주파수 변조) */
const chirp = (base = 1500, dur = 0.16, rise = 1.5) => {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const k = i / len;
    const f = base * (1 + (rise - 1) * Math.sin(k * Math.PI * 0.9)) * (1 + 0.035 * Math.sin(TAU * 38 * (i / SR)));
    ph += (TAU * f) / SR;
    const env = Math.sin(Math.PI * Math.min(1, k * 1.04)) ** 0.7;
    out[i] = (Math.sin(ph) + 0.28 * Math.sin(2 * ph) + 0.08 * Math.sin(3 * ph)) * env;
  }
  return out;
};

/** 휘익 — 대역이 쓸려 올라가는(또는 내려가는) 노이즈 */
const whoosh = (dur = 0.45, f0 = 300, f1 = 3200, q = 1.2) => {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) out[i] = noise() * Math.sin((Math.PI * i) / len) ** 1.4;
  return bandpass(out, (k) => f0 * Math.pow(f1 / f0, k), q);
};

/** 연필 사각사각 — 획마다 끊기는 밴드 노이즈 */
const scratch = (dur, { hz = 4200, rate = 9 } = {}) => {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  let i = 0;
  while (i < len) {
    const stroke = Math.floor(((0.55 + rnd() * 0.7) / rate) * SR);
    const gap = Math.floor(((0.12 + rnd() * 0.25) / rate) * SR);
    const a = 0.55 + rnd() * 0.45;
    for (let j = 0; j < stroke && i + j < len; j++) out[i + j] = noise() * a * Math.sin((Math.PI * j) / stroke) ** 0.6;
    i += stroke + gap;
  }
  bandpass(out, hz, 0.9);
  const fade = Math.floor(0.03 * SR);
  for (let k = 0; k < fade && k < len; k++) {
    out[k] *= k / fade;
    out[len - 1 - k] *= k / fade;
  }
  return out;
};

/** 톡 — 분필·타자 */
const tick = (hz = 2600) => {
  const len = Math.floor(0.03 * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) out[i] = (noise() * 0.6 + Math.sin((TAU * hz * i) / SR)) * Math.exp(-i / (SR * 0.004));
  return out;
};

/** 쿵 — 착지 */
const thud = () => {
  const len = Math.floor(0.16 * SR);
  const out = new Float32Array(len);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += (TAU * (70 + 80 * Math.exp(-t * 40))) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 26) + noise() * 0.25 * Math.exp(-t * 90);
  }
  return lowpass(out, 900);
};

/** 종이 넘기는 소리 */
const paper = (dur = 0.5) => {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const k = i / len;
    out[i] = noise() * (Math.sin(Math.PI * k) ** 2) * (0.6 + 0.4 * Math.sin(k * 46));
  }
  return bandpass(out, (k) => 900 + 2600 * k, 0.8);
};

/** 날갯짓 */
const flaps = (count, gapSec = 0.14) => {
  const len = Math.floor((count * gapSec + 0.1) * SR);
  const out = new Float32Array(len);
  for (let c = 0; c < count; c++) {
    const s = Math.floor(c * gapSec * SR);
    const l = Math.floor(0.09 * SR);
    for (let i = 0; i < l && s + i < len; i++) out[s + i] += noise() * Math.sin((Math.PI * i) / l) ** 2 * (0.7 + 0.3 * rnd());
  }
  return bandpass(out, 700, 0.8);
};

// ── 배치 헬퍼 ──
const at = (frame, buf, opts) => add(buf, f2s(frame), opts);
const scale = (buf, g) => {
  const o = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) o[i] = buf[i] * g;
  return o;
};

// ══════════════ 음악 ══════════════
const BAR = 60; // frames
const EIGHTH = 7.5;

// 우쿨렐레 보이싱(4줄: G C E A 조율)
const CH = {
  C: ["G4", "C4", "E4", "C5"],
  G: ["G4", "D4", "G4", "B4"],
  Am: ["A4", "C4", "E4", "A4"],
  F: ["A4", "C4", "F4", "A4"],
  Em: ["G4", "E4", "G4", "B4"],
  Gsus: ["G4", "D4", "G4", "C5"],
  Cadd9: ["G4", "C4", "E4", "D5"],
};
const ROOT = { C: "C3", G: "G2", Am: "A2", F: "F2", Em: "E2", Gsus: "G2", Cadd9: "C3" };
const FIFTH = { C: "G2", G: "D3", Am: "E3", F: "C3", Em: "B2", Gsus: "D3", Cadd9: "G2" };

/** 스트럼 한 번 — 줄마다 살짝 시차를 둔다 */
const strum = (frame, chord, { up = false, gain = 0.2, dur = 0.8, mute = false } = {}) => {
  const notes = up ? [...CH[chord]].reverse().slice(0, 3) : CH[chord];
  notes.forEach((n, i) => {
    const b = pluck(n2f(n), mute ? 0.09 : dur, { bright: up ? 1.1 : 0.9 });
    add(b, f2s(frame) + Math.floor(i * 0.011 * SR), { gain: gain * 1.15 * (up ? 0.7 : 1) * (0.85 + rnd() * 0.3), pan: -0.35 + i * 0.12, send: 0.14 });
  });
};

/** 섬 스트럼 한 마디: D . D U . U D U */
const strumBar = (bar, chord, { gain = 0.2, chord2 } = {}) => {
  const f = (bar - 1) * BAR;
  const c2 = chord2 ?? chord;
  strum(f, chord, { gain: gain * 1.15 });
  strum(f + EIGHTH * 2, chord, { gain });
  strum(f + EIGHTH * 3, chord, { up: true, gain });
  strum(f + EIGHTH * 5, c2, { up: true, gain });
  strum(f + EIGHTH * 6, c2, { gain });
  strum(f + EIGHTH * 7, c2, { up: true, gain: gain * 0.9 });
};

/** 아르페지오 한 마디(손가락으로 뜯는 8분음표) */
const arpBar = (bar, chord, { gain = 0.2, order = [1, 2, 3, 2, 0, 2, 3, 2] } = {}) => {
  const f = (bar - 1) * BAR;
  order.forEach((s, i) => at(f + i * EIGHTH, pluck(n2f(CH[chord][s]), 1.1, { bright: 0.85 }), { gain: gain * (i % 4 === 0 ? 1.15 : 0.9), pan: -0.3 + s * 0.2, send: 0.22 }));
};

const bassBar = (bar, chord, { gain: g0 = 0.34, chord2, walk } = {}) => {
  const gain = g0 * 0.9;
  const f = (bar - 1) * BAR;
  const c2 = chord2 ?? chord;
  at(f, bass(n2f(ROOT[chord]), 0.55), { gain });
  at(f + EIGHTH * 3, bass(n2f(ROOT[chord]), 0.2), { gain: gain * 0.55 });
  at(f + EIGHTH * 4, bass(n2f(chord2 ? ROOT[c2] : FIFTH[chord]), 0.5), { gain: gain * 0.9 });
  if (walk) at(f + EIGHTH * 7, bass(n2f(walk), 0.22), { gain: gain * 0.7 });
};

const drumBar = (bar, { kickOn = [0, 4], snapOn = [2, 6], shake = true, gain = 1 } = {}) => {
  const f = (bar - 1) * BAR;
  kickOn.forEach((e) => at(f + e * EIGHTH, kick(), { gain: 0.34 * gain }));
  snapOn.forEach((e) => at(f + e * EIGHTH, snap(), { gain: 0.62 * gain, pan: 0.15, send: 0.25 }));
  if (shake) for (let e = 0; e < 8; e++) at(f + e * EIGHTH, shaker(e % 2 === 0 ? 0.6 : 1), { gain: 0.2 * gain, pan: 0.4 });
};

/** 글로켄슈필 멜로디: [8분음표 위치, 음, 길이(8분 단위)] */
const melody = (bar, notes, { gain = 0.13, oct = 0 } = {}) => {
  const f = (bar - 1) * BAR;
  notes.forEach(([e, n, len = 2]) => {
    const fr = n2f(n) * Math.pow(2, oct);
    at(f + e * EIGHTH, bell(fr, 0.5 + len * 0.22), { gain: gain * 1.45, pan: 0.25, send: 0.45 });
  });
};

// ── 편곡 ──
// 1–3마디(S0): 연필 소리로 시작 → 2마디부터 우쿨렐레가 들어온다
arpBar(2, "C", { gain: 0.17 });
bassBar(2, "C", { gain: 0.26 });
strumBar(3, "F", { gain: 0.17, chord2: "G" });
bassBar(3, "F", { chord2: "G", gain: 0.3, walk: "B2" });
drumBar(3, { kickOn: [0, 4], snapOn: [6], shake: true, gain: 0.8 });
melody(2, [
  [1, "G5", 1],
  [3, "C6", 2],
  [6, "E6", 2],
]);
melody(3, [
  [0, "D6", 2],
  [3, "C6", 1],
  [4, "B5", 2],
  [7, "G5", 1],
]);

// 4–8마디(S1) · 9–13마디(S2): A 구간
const A = ["C", "G", "Am", "F", "G"];
const A_MEL = [
  [
    [0, "E5", 2],
    [2, "G5", 2],
    [4, "A5", 1],
    [5, "G5", 1],
    [6, "E5", 2],
  ],
  [
    [0, "D5", 2],
    [2, "G5", 2],
    [4, "B5", 1],
    [5, "A5", 1],
    [6, "G5", 2],
  ],
  [
    [0, "C5", 2],
    [2, "E5", 2],
    [4, "A5", 2],
    [6, "G5", 1],
    [7, "E5", 1],
  ],
  [
    [0, "F5", 2],
    [2, "A5", 2],
    [4, "C6", 2],
    [6, "A5", 2],
  ],
  [
    [0, "G5", 2],
    [2, "B5", 2],
    [4, "D6", 2],
    [6, "G5", 1],
    [7, "A5", 1],
  ],
];
for (let rep = 0; rep < 2; rep++) {
  const first = 4 + rep * 5;
  A.forEach((ch, i) => {
    const bar = first + i;
    const last = i === 4;
    strumBar(bar, ch, { gain: 0.19, chord2: last ? "Gsus" : undefined });
    bassBar(bar, ch, { walk: last ? "B2" : i === 0 ? "B2" : i === 1 ? "A2" : i === 2 ? "G2" : "G2" });
    drumBar(bar, last ? { kickOn: [0, 3, 4], snapOn: [2, 6, 7] } : {});
    // 효과음이 많은 구간이라 멜로디는 2마디 주고받기
    if (rep === 0 ? i !== 2 : i !== 1) melody(bar, A_MEL[i], { gain: rep === 0 ? 0.11 : 0.12, oct: rep === 1 && i === 4 ? 0 : 0 });
  });
}

// 14–17마디(S3 데이터 보드): B 구간 — 아르페지오로 가볍고 궁금하게
const B = ["F", "G", "Em", "Am"];
B.forEach((ch, i) => {
  const bar = 14 + i;
  arpBar(bar, ch, { gain: 0.2 });
  bassBar(bar, ch, { gain: 0.3 });
  drumBar(bar, { kickOn: [0], snapOn: [4], shake: true, gain: 0.7 });
  add(pad(CH[ch].map((n) => n2f(n)), 2.1), f2s((bar - 1) * BAR), { gain: 0.07, send: 0.4 });
});
melody(16, [
  [0, "B5", 3],
  [4, "G5", 2],
  [6, "E5", 2],
]);
melody(17, [
  [0, "A5", 3],
  [4, "C6", 2],
  [6, "E6", 2],
]);

// 18–20마디(S3 비행): 차오르는 빌드업
const LIFT = ["F", "G", "Gsus"];
LIFT.forEach((ch, i) => {
  const bar = 18 + i;
  strumBar(bar, ch, { gain: 0.17 + i * 0.02, chord2: i === 2 ? "G" : undefined });
  bassBar(bar, ch, { gain: 0.32 });
  drumBar(bar, { kickOn: i === 2 ? [0, 2, 4, 5, 6, 7] : [0, 2, 4, 6], snapOn: i === 2 ? [2, 6, 7] : [2, 6], gain: 0.8 + i * 0.1 });
  add(pad(CH[ch].map((n) => n2f(n) * 2), 2.1), f2s((bar - 1) * BAR), { gain: 0.06 + i * 0.02, send: 0.5 });
});
// 상승 아르페지오(글로켄)
const RISE = ["C5", "F5", "A5", "C6", "D5", "G5", "B5", "D6", "G5", "C6", "D6", "G6"];
RISE.forEach((n, i) => at((18 - 1) * BAR + i * 15, bell(n2f(n), 1.0), { gain: 0.1 + i * 0.004, pan: -0.2 + (i % 4) * 0.15, send: 0.5 }));

// 21–22마디(S4 지구): 밝게 터진다
[
  ["C", undefined],
  ["G", undefined],
].forEach(([ch], i) => {
  const bar = 21 + i;
  strumBar(bar, ch, { gain: 0.22 });
  bassBar(bar, ch, { gain: 0.36, walk: i === 1 ? "E2" : "B2" });
  drumBar(bar, { kickOn: [0, 3, 4], snapOn: [2, 6] });
});
melody(21, [
  [0, "C6", 2],
  [2, "G5", 1],
  [3, "C6", 1],
  [4, "E6", 2],
  [6, "D6", 1],
  [7, "C6", 1],
], { gain: 0.14 });
melody(22, [
  [0, "D6", 2],
  [2, "B5", 2],
  [4, "G5", 2],
  [6, "A5", 1],
  [7, "B5", 1],
], { gain: 0.14 });

// 23–24.5마디(S5 엔드카드): F–G → C 로 풀리고, 마지막 한 방
strumBar(23, "F", { gain: 0.2, chord2: "G" });
bassBar(23, "F", { chord2: "G", gain: 0.34, walk: "B2" });
drumBar(23, { kickOn: [0, 4], snapOn: [2, 6, 7] });
melody(23, [
  [0, "A5", 2],
  [2, "C6", 2],
  [4, "B5", 2],
  [6, "D6", 2],
], { gain: 0.13 });
// 24마디: 버튼이 뜨는 다운비트(1380f)에 C
{
  const f = 23 * BAR;
  strum(f, "C", { gain: 0.26, dur: 1.4 });
  at(f, bass(n2f("C3"), 0.9), { gain: 0.26 });
  at(f, kick(), { gain: 0.38 });
  strum(f + EIGHTH * 2, "C", { gain: 0.18 });
  strum(f + EIGHTH * 3, "C", { up: true, gain: 0.17 });
  at(f + EIGHTH * 2, snap(), { gain: 0.4, send: 0.25 });
  melody(24, [
    [0, "E6", 2],
    [2, "G5", 1],
    [3, "C6", 1],
  ], { gain: 0.14 });
  // 마지막 한 방(1410f) — Cadd9 가 울리며 끝난다
  const e = f + EIGHTH * 4;
  strum(e, "Cadd9", { gain: 0.3, dur: 2.4 });
  at(e, bass(n2f("C3"), 1.6), { gain: 0.28 });
  at(e, kick(), { gain: 0.4 });
  at(e, snap(), { gain: 0.36, send: 0.3 });
  ["C6", "E6", "G6", "C7"].forEach((n, i) => at(e + i * 2.2, bell(n2f(n), 2.2), { gain: 0.13, pan: -0.3 + i * 0.2, send: 0.6 }));
}

// ══════════════ 효과음(씬 타이밍과 1:1) ══════════════
const S0 = 0;
const S1 = 180;
const S2 = 480;
const S3 = 780;
const S4 = 1200;
const S5 = 1320;
const PENT = ["C5", "D5", "E5", "G5", "A5", "C6", "D6", "E6", "G6"];
const glitter = (frame, count = 7, { gain = 0.07, step = 1.6, from = 2 } = {}) => {
  for (let i = 0; i < count; i++) at(frame + i * step, bell(n2f(PENT[Math.min(PENT.length - 1, from + i)]) * 2, 0.5), { gain, pan: -0.4 + (i / count) * 0.8, send: 0.6 });
};

// ── S0 오프닝 ──
at(S0 + 5, scratch(1.02, { hz: 4300, rate: 10 }), { gain: 0.3, pan: 0.1, send: 0.08 });
at(S0 + 33, whoosh(0.5, 500, 2600, 1.5), { gain: 0.2, send: 0.2 }); // 색칠
glitter(S0 + 46, 5, { gain: 0.06 });
at(S0 + 59, popSfx(260, 760, 0.16), { gain: 0.26 }); // 폴짝
at(S0 + 67.5, popSfx(500, 1500, 0.07), { gain: 0.3, send: 0.2 }); // 뿅! 연필 낚아채기
at(S0 + 69, chirp(1700, 0.15, 1.5), { gain: 0.17, pan: -0.1, send: 0.25 });
at(S0 + 73, thud(), { gain: 0.3 });
[80, 85, 90, 95].forEach((f, i) => at(S0 + f, tick(1500 + (i % 2) * 300), { gain: 0.1, pan: -0.3 }));
at(S0 + 86, popSfx(420, 980, 0.07), { gain: 0.2 }); // 말풍선
at(S0 + 87, chirp(1500, 0.11, 1.35), { gain: 0.12, send: 0.2 });
at(S0 + 92, chirp(1850, 0.12, 1.3), { gain: 0.11, send: 0.2 });
at(S0 + 116, whoosh(0.3, 900, 2600, 2.2), { gain: 0.12 }); // 형광펜
at(S0 + 128, whoosh(0.34, 1200, 2400, 2.6), { gain: 0.1 }); // 동그라미
at(S0 + 153, popSfx(300, 200, 0.12), { gain: 0.14 }); // 움츠림
at(S0 + 158, flaps(5, 0.12), { gain: 0.3, pan: 0.3 });
at(S0 + 160, chirp(1900, 0.14, 1.4), { gain: 0.13, pan: 0.3, send: 0.25 });
at(S0 + 166, whoosh(0.85, 240, 3400, 1.0), { gain: 0.42, send: 0.15 }); // 마커 스와이프

// ── S1 저절로 남는 수업 ──
at(S1 + 2, scratch(0.5, { hz: 3600, rate: 9 }), { gain: 0.2, pan: -0.3 });
at(S1 + 4, flaps(3, 0.12), { gain: 0.2, pan: 0.2 });
at(S1 + 18, thud(), { gain: 0.32, pan: 0.1 });
at(S1 + 24, bell(n2f("A6"), 0.25), { gain: 0.07, pan: -0.2 }); // REC
// 분필 판서
for (let f = 22; f < 80; f += 2.5 + rnd() * 2.5) at(S1 + f, tick(2100 + rnd() * 900), { gain: 0.055 + rnd() * 0.04, pan: -0.45 + rnd() * 0.3 });
at(S1 + 34, scratch(0.9, { hz: 2900, rate: 7 }), { gain: 0.1, pan: -0.4 });
// 지우개
[90, 97, 104, 111].forEach((f, i) => at(S1 + f, whoosh(0.3, i % 2 ? 1500 : 600, i % 2 ? 600 : 1500, 0.9), { gain: 0.26, pan: -0.5 + i * 0.12 }));
at(S1 + 93, chirp(1300, 0.2, 1.9), { gain: 0.16, pan: 0.05, send: 0.2 }); // 앗!
glitter(S1 + 104, 12, { gain: 0.055, step: 2.3, from: 0 }); // 알갱이가 날아간다
at(S1 + 135, popSfx(360, 1000, 0.08), { gain: 0.28, pan: 0.2 });
at(S1 + 135, bell(n2f("E6"), 0.9), { gain: 0.1, pan: 0.2, send: 0.5 });
at(S1 + 142.5, popSfx(420, 1150, 0.08), { gain: 0.28, pan: 0.5 });
at(S1 + 142.5, bell(n2f("A6"), 0.9), { gain: 0.1, pan: 0.5, send: 0.5 });
at(S1 + 128, whoosh(0.3, 900, 2600, 2.2), { gain: 0.11 }); // 제목 형광펜
for (let f = 154; f < 190; f += 2.5 + rnd() * 2.5) at(S1 + f, tick(2100 + rnd() * 900), { gain: 0.05 + rnd() * 0.03, pan: -0.45 + rnd() * 0.3 });
[0, 1, 2].forEach((k) => at(S1 + 173 + k * 7.5, marimba(n2f(["E5", "G5", "C6"][k]), 0.4), { gain: 0.16, pan: 0.35, send: 0.3 })); // 차곡차곡
at(S1 + 210, paper(0.2), { gain: 0.3, pan: 0.2 });
at(S1 + 210, popSfx(300, 700, 0.07), { gain: 0.2, pan: 0.2 });
at(S1 + 225, paper(0.2), { gain: 0.3, pan: 0.5 });
at(S1 + 225, popSfx(360, 820, 0.07), { gain: 0.2, pan: 0.5 });
at(S1 + 236, chirp(1700, 0.14, 1.45), { gain: 0.14, send: 0.25 });
at(S1 + 244, chirp(2000, 0.12, 1.3), { gain: 0.11, send: 0.25 });
at(S2 - 2, paper(0.7), { gain: 0.5, send: 0.15 }); // 스케치북 장 넘김

// ── S2 AI 강의 평가 ──
[4, 7, 10, 13, 16, 19].forEach((f, i) => at(S2 + f + 4, tick(1700 + i * 120), { gain: 0.07, pan: -0.5 + i * 0.1 }));
at(S2 + 16, popSfx(700, 420, 0.1), { gain: 0.16, pan: -0.05 }); // ?
at(S2 + 26, popSfx(820, 500, 0.1), { gain: 0.13, pan: 0.1 });
at(S2 + 60, bell(n2f("B5"), 1.3), { gain: 0.19, pan: -0.3, send: 0.55 }); // 딩 (G 화음의 3음)
at(S2 + 67.5, bell(n2f("G5"), 1.6), { gain: 0.19, pan: -0.3, send: 0.55 }); // 동
at(S2 + 61, chirp(1500, 0.12, 1.6), { gain: 0.12, send: 0.2 });
at(S2 + 62, popSfx(380, 900, 0.08), { gain: 0.2 }); // AI 배지
// AI가 분석 중 — 빠른 블립
for (let i = 0; i < 16; i++) at(S2 + 68 + i * 2.2, bell(n2f(PENT[(i * 3) % 7]) * 2, 0.16, { hard: 0.4 }), { gain: 0.05, pan: -0.1 + (i % 3) * 0.1, send: 0.3 });
at(S2 + 102, whoosh(0.4, 400, 2400, 1.3), { gain: 0.26, pan: 0.2 }); // 리포트가 튀어나온다
at(S2 + 109, paper(0.22), { gain: 0.3, pan: 0.4 });
at(S2 + 112, popSfx(300, 860, 0.1), { gain: 0.24, pan: 0.4 });
// 점수가 차오른다
for (let i = 0; i < 12; i++) at(S2 + 126 + i * 2, tick(1400 + i * 110), { gain: 0.06, pan: 0.35 });
at(S2 + 150, bell(n2f("E6"), 1.2), { gain: 0.14, pan: 0.35, send: 0.55 }); // 88점!
// 교실마다 점수 태그
[0, 1, 2, 3, 4, 5].forEach((k) => at(S2 + 150 + k * 7.5, marimba(n2f(["C5", "E5", "G5", "A5", "D5", "C6"][k]), 0.4), { gain: k === 4 ? 0.13 : 0.16, pan: -0.5 + (k % 3) * 0.15, send: 0.3 }));
at(S2 + 195, whoosh(0.32, 700, 2000, 2.4), { gain: 0.14, pan: -0.4 }); // 자
at(S2 + 225, tick(1200), { gain: 0.14, pan: 0.6 });
at(S2 + 232.5, tick(900), { gain: 0.14, pan: 0.6 });
at(S2 + 239, popSfx(360, 900, 0.07), { gain: 0.18, pan: 0.6 });
at(S2 + 254, chirp(1700, 0.14, 1.45), { gain: 0.14, send: 0.25 });
at(S2 + 262, chirp(2050, 0.12, 1.3), { gain: 0.11, send: 0.25 });
at(S3 - 14, whoosh(0.85, 3200, 260, 1.0), { gain: 0.4, send: 0.15 }); // 마커 스와이프(반대 방향)

// ── S3 데이터 ──
at(S3 + 4, flaps(3, 0.12), { gain: 0.2, pan: -0.5 });
at(S3 + 18, thud(), { gain: 0.3, pan: -0.5 });
glitter(S3 + 26, 8, { gain: 0.045, step: 1.4, from: 0 });
["C5", "D5", "E5", "G5", "A5"].forEach((n, k) => {
  at(S3 + 37.5 + k * 7.5, marimba(n2f(n), 0.6), { gain: 0.2, pan: -0.4 + k * 0.2, send: 0.35 });
  at(S3 + 37.5 + k * 7.5, popSfx(300 + k * 40, 760 + k * 60, 0.06), { gain: 0.12, pan: -0.4 + k * 0.2 });
});
at(S3 + 90, bell(n2f("A6"), 0.3), { gain: 0.07, pan: -0.3, send: 0.4 }); // 열쇠
at(S3 + 91.5, bell(n2f("E7"), 0.3), { gain: 0.05, pan: -0.3, send: 0.4 });
["D5", "E5", "G5"].forEach((n, k) => {
  at(S3 + 105 + k * 15, marimba(n2f(n), 0.8), { gain: 0.22, pan: -0.3 + k * 0.3, send: 0.3 });
  at(S3 + 105 + k * 15, paper(0.16), { gain: 0.2, pan: -0.3 + k * 0.3 });
});
at(S3 + 150, chirp(1700, 0.14, 1.45), { gain: 0.13, pan: -0.5, send: 0.25 });
at(S3 + 234, popSfx(300, 200, 0.12), { gain: 0.14, pan: -0.5 });
at(S3 + 238, flaps(9, 0.13), { gain: 0.26, pan: -0.4 });
at(S3 + 238, whoosh(1.05, 200, 2600, 0.9), { gain: 0.3, send: 0.25 }); // 날아오른다
at(S3 + 300, popSfx(520, 780, 0.08), { gain: 0.15, pan: -0.1 });
at(S3 + 322.5, popSfx(580, 880, 0.08), { gain: 0.15, pan: 0.15 });
at(S3 + 345, popSfx(640, 980, 0.08), { gain: 0.15, pan: 0.35 });
at(S3 + 360, chirp(1900, 0.16, 1.5), { gain: 0.14, pan: 0.5, send: 0.3 });
glitter(S3 + 360, 6, { gain: 0.05, step: 1.6, from: 3 });
at(S4 - 4, whoosh(0.6, 500, 3000, 1.6), { gain: 0.24, pan: 0.5, send: 0.2 }); // 아이리스

// ── S4 지구 ──
at(S4 + 6, popSfx(240, 700, 0.14), { gain: 0.26, pan: -0.3 });
[14, 23, 32, 41, 50].forEach((f, k) => at(S4 + f, tick(1800 + k * 140), { gain: 0.08, pan: -0.5 + k * 0.08 }));
[15, 37.5, 60].forEach((f, k) => {
  for (let i = 0; i < 9; i++) at(S4 + f + i * 2.4, tick(1300 + i * 120), { gain: 0.05, pan: 0.35 });
  at(S4 + f + 22.5, bell(n2f(["E6", "G6", "D7"][k]), 1.3), { gain: 0.14, pan: 0.35, send: 0.6 });
  at(S4 + f, popSfx(340 + k * 40, 900 + k * 80, 0.07), { gain: 0.16, pan: 0.35 });
});
at(S5 - 14, whoosh(0.85, 240, 3400, 1.0), { gain: 0.4, send: 0.15 }); // 마커 스와이프

// ── S5 엔드카드 ──
at(S5 + 6, flaps(4, 0.12), { gain: 0.22, pan: -0.5 });
at(S5 + 27, thud(), { gain: 0.3, pan: -0.5 });
at(S5 + 30, popSfx(300, 880, 0.1), { gain: 0.24, pan: 0.4 }); // 로고
glitter(S5 + 31, 6, { gain: 0.06, step: 1.5, from: 3 });
at(S5 + 34, whoosh(0.34, 900, 2600, 2.2), { gain: 0.11, pan: -0.3 }); // 형광펜
[0, 1, 2].forEach((k) => at(S5 + 37.5 + k * 7.5, marimba(n2f(["D5", "G5", "B5"][k]), 0.4), { gain: 0.16, pan: -0.4 + k * 0.2, send: 0.3 }));
at(S5 + 60, popSfx(220, 660, 0.14), { gain: 0.3, pan: 0.4 }); // 버튼
at(S5 + 72, popSfx(420, 980, 0.07), { gain: 0.18, pan: -0.2 }); // 말풍선
at(S5 + 73, chirp(1500, 0.11, 1.35), { gain: 0.12, pan: -0.5, send: 0.2 });
at(S5 + 79, chirp(1850, 0.12, 1.3), { gain: 0.11, pan: -0.5, send: 0.2 });
for (let i = 0; i < 16; i++) at(S5 + 70 + i * 1.1, tick(2000 + (i % 4) * 200), { gain: 0.045, pan: 0.4 });
at(S5 + 92, whoosh(0.36, 800, 2400, 2.4), { gain: 0.13, pan: 0.4 }); // 밑줄
at(S5 + 91, chirp(1900, 0.16, 1.5), { gain: 0.14, pan: -0.5, send: 0.3 });

// ══════════════ 리버브(슈뢰더) + 마스터 ══════════════
const reverb = (inp) => {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422, 1277, 1356].map((d) => Math.floor((d * SR) / 44100));
  const fb = 0.8;
  for (const d of combs) {
    const buf = new Float32Array(d);
    let idx = 0;
    let lp = 0;
    for (let i = 0; i < N; i++) {
      const y = buf[idx];
      lp = y * 0.72 + lp * 0.28; // 고역 감쇠
      buf[idx] = inp[i] + lp * fb;
      out[i] += y;
      idx = idx + 1 === d ? 0 : idx + 1;
    }
  }
  for (const d0 of [225, 556, 441]) {
    const d = Math.floor((d0 * SR) / 44100);
    const buf = new Float32Array(d);
    let idx = 0;
    for (let i = 0; i < N; i++) {
      const b = buf[idx];
      const x = out[i];
      buf[idx] = x + b * 0.5;
      out[i] = b - x * 0.5;
      idx = idx + 1 === d ? 0 : idx + 1;
    }
  }
  return out;
};
// 좌우 채널에 프리딜레이를 다르게 줘 넓게
const wetL = reverb(REV[0]);
const wetR = reverb(REV[1]);
const PRE = [Math.floor(0.011 * SR), Math.floor(0.017 * SR)];
const OUT = bus();
for (let i = 0; i < N; i++) {
  OUT[0][i] = DRY[0][i] + (i >= PRE[0] ? wetL[i - PRE[0]] : 0) * 0.16;
  OUT[1][i] = DRY[1][i] + (i >= PRE[1] ? wetR[i - PRE[1]] : 0) * 0.16;
}
for (const ch of OUT) {
  highpass(ch, 38);
  // 틸트 EQ — 150Hz 아래를 살짝 덜고, 3kHz 위를 올린다(+4dB)
  const low = lowpass(Float32Array.from(ch), 150);
  const high = highpass(Float32Array.from(ch), 3000);
  for (let i = 0; i < N; i++) ch[i] = ch[i] - low[i] * 0.15 + high[i] * 0.6;
}

// 끝 페이드(마지막 0.5초) + 소프트 클립 + 정규화
const fadeLen = Math.floor(0.5 * SR);
let peak = 0;
for (const ch of OUT) {
  for (let i = 0; i < N; i++) {
    if (i > N - fadeLen) ch[i] *= (N - i) / fadeLen;
    ch[i] = Math.tanh(ch[i] * 1.5) / 1.5;
    peak = Math.max(peak, Math.abs(ch[i]));
  }
}
const norm = 0.66 / peak; // 통합 음량 약 −15 LUFS
let sumSq = 0;
const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  for (let c = 0; c < 2; c++) {
    const v = OUT[c][i] * norm;
    sumSq += v * v;
    pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), i * 4 + c * 2);
  }
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

const outPath = path.resolve("public/audio/gull-reel.wav");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, Buffer.concat([header, pcm]));
const rms = Math.sqrt(sumSq / (N * 2));
console.log(`wrote ${outPath} · ${(N / SR).toFixed(2)}s · peak ${(20 * Math.log10(0.66)).toFixed(1)} dBFS · rms ${(20 * Math.log10(rms)).toFixed(1)} dBFS (pre-norm peak ${peak.toFixed(3)})`);

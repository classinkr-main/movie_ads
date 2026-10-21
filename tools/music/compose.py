#!/usr/bin/env python3
"""Classin v5 쇼릴 사운드트랙 합성기.

120 BPM · 22초 · 48kHz 스테레오. 샘플이나 외부 음원 없이 모든 소리를 numpy로 합성한다.
타이밍은 영상과 같은 SSOT인 src/data/cues.json을 읽으므로, 컷·타이핑·핀 프레임을 바꾸면
이 스크립트를 다시 돌려 소리를 맞춘다.

    python3 tools/music/compose.py            # → public/audio/classin-v5.wav
    python3 tools/music/compose.py --stems    # 버스별 스템도 out/stems/에 저장

필요 패키지: numpy, scipy, numba, pyloudnorm
"""
from __future__ import annotations

import argparse
import json
import math
import pathlib

import numpy as np
import pyloudnorm
from numba import njit
from scipy import signal
from scipy.io import wavfile
from scipy.ndimage import minimum_filter1d, uniform_filter1d

ROOT = pathlib.Path(__file__).resolve().parents[2]
CUES = json.loads((ROOT / "src/data/cues.json").read_text())

SR = 48000
FPS = CUES["fps"]
BPM = CUES["bpm"]
N = int(round(CUES["durationInFrames"] / FPS * SR))  # 22.0s
SPB = SR * 60 / BPM  # 1박 샘플 수
TARGET_LUFS = -14.0
CEILING_DB = -1.0

rng = np.random.default_rng(20261021)


# ───────────────────────── 시간·음높이 ─────────────────────────
def fs(frame: float) -> int:
    """영상 프레임 → 샘플 위치."""
    return int(round(frame / FPS * SR))


def bs(beat: float) -> int:
    """박(0부터) → 샘플 위치. 1박 = 30프레임."""
    return int(round(beat * SPB))


_NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(name: str) -> float:
    """'A4' → 440.0"""
    pitch, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((12 * (octave + 1) + _NOTE[pitch] - 69) / 12)


def chord(*names: str) -> list[float]:
    return [hz(n) for n in names]


def tvec(n: int) -> np.ndarray:
    return np.arange(n) / SR


def secs(s: float) -> int:
    return int(round(s * SR))


# ───────────────────────── 필터 ─────────────────────────
def biquad(kind: str, f0: float, q: float = 0.707, gain_db: float = 0.0):
    w0 = 2 * math.pi * min(f0, SR * 0.45) / SR
    cw, sw = math.cos(w0), math.sin(w0)
    alpha = sw / (2 * q)
    amp = 10 ** (gain_db / 40)
    if kind == "lp":
        b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "hp":
        b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "bp":
        b = [alpha, 0.0, -alpha]
        a = [1 + alpha, -2 * cw, 1 - alpha]
    elif kind == "peak":
        b = [1 + alpha * amp, -2 * cw, 1 - alpha * amp]
        a = [1 + alpha / amp, -2 * cw, 1 - alpha / amp]
    elif kind in ("lowshelf", "highshelf"):
        sq = 2 * math.sqrt(amp) * alpha
        if kind == "lowshelf":
            b = [amp * ((amp + 1) - (amp - 1) * cw + sq), 2 * amp * ((amp - 1) - (amp + 1) * cw), amp * ((amp + 1) - (amp - 1) * cw - sq)]
            a = [(amp + 1) + (amp - 1) * cw + sq, -2 * ((amp - 1) + (amp + 1) * cw), (amp + 1) + (amp - 1) * cw - sq]
        else:
            b = [amp * ((amp + 1) + (amp - 1) * cw + sq), -2 * amp * ((amp - 1) + (amp + 1) * cw), amp * ((amp + 1) + (amp - 1) * cw - sq)]
            a = [(amp + 1) - (amp - 1) * cw + sq, 2 * ((amp - 1) - (amp + 1) * cw), (amp + 1) - (amp - 1) * cw - sq]
    else:
        raise ValueError(kind)
    return np.array(b) / a[0], np.array(a) / a[0]


def filt(x: np.ndarray, kind: str, f0: float, q: float = 0.707, gain_db: float = 0.0) -> np.ndarray:
    b, a = biquad(kind, f0, q, gain_db)
    return signal.lfilter(b, a, x, axis=0)


@njit(cache=True)
def _svf(x, fc, q, mode, sr):
    # TPT 상태변수 필터 — 컷오프가 샘플마다 바뀌어도 안정적이다. mode 0=LP 1=BP 2=HP
    out = np.empty_like(x)
    ic1 = 0.0
    ic2 = 0.0
    k = 1.0 / q
    for i in range(x.shape[0]):
        f = fc[i]
        if f > sr * 0.45:
            f = sr * 0.45
        g = math.tan(math.pi * f / sr)
        a1 = 1.0 / (1.0 + g * (g + k))
        a2 = g * a1
        a3 = g * a2
        v3 = x[i] - ic2
        v1 = a1 * ic1 + a2 * v3
        v2 = ic2 + a2 * ic1 + a3 * v3
        ic1 = 2.0 * v1 - ic1
        ic2 = 2.0 * v2 - ic2
        if mode == 0:
            out[i] = v2
        elif mode == 1:
            out[i] = v1
        else:
            out[i] = x[i] - k * v1 - v2
    return out


def svf(x: np.ndarray, fc, q: float = 0.707, mode: str = "lp") -> np.ndarray:
    fc_arr = np.broadcast_to(np.asarray(fc, dtype=np.float64), x.shape[:1]).copy()
    m = {"lp": 0, "bp": 1, "hp": 2}[mode]
    if x.ndim == 1:
        return _svf(x.astype(np.float64), fc_arr, q, m, float(SR))
    return np.stack([_svf(x[:, c].astype(np.float64), fc_arr, q, m, float(SR)) for c in range(x.shape[1])], 1)


# ───────────────────────── 발진기·엔벌로프 ─────────────────────────
def phase_of(freq, n: int, phase0: float = 0.0) -> np.ndarray:
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    return (phase0 + np.cumsum(f) / SR) % 1.0


def sine(freq, n: int, phase0: float = 0.0) -> np.ndarray:
    return np.sin(2 * math.pi * phase_of(freq, n, phase0))


def saw(freq, n: int, phase0: float = 0.0) -> np.ndarray:
    # PolyBLEP 톱니파 — 앨리어싱을 줄인다
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    dt = f / SR
    t = (phase0 + np.cumsum(dt)) % 1.0
    y = 2.0 * t - 1.0
    m = t < dt
    x = t[m] / dt[m]
    y[m] -= x + x - x * x - 1.0
    m = t > 1.0 - dt
    x = (t[m] - 1.0) / dt[m]
    y[m] -= x * x + x + x + 1.0
    return y


def noise(n: int) -> np.ndarray:
    return rng.standard_normal(n)


def adsr(n: int, a: float, d: float, s: float, r: float, hold: float) -> np.ndarray:
    """hold초 동안 누르고 r초 동안 놓는 ADSR. 길이 n 샘플."""
    t = tvec(n)
    env = np.where(t < a, t / max(a, 1e-6), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-6)))
    rel = t > hold
    env[rel] = env[rel] * np.exp(-(t[rel] - hold) / max(r, 1e-6))
    return env


def fade(x: np.ndarray, fin: float = 0.002, fout: float = 0.01) -> np.ndarray:
    n = x.shape[0]
    a, b = min(secs(fin), n), min(secs(fout), n)
    env = np.ones(n)
    if a:
        env[:a] = np.linspace(0, 1, a)
    if b:
        env[n - b:] *= np.linspace(1, 0, b)
    return x * (env[:, None] if x.ndim == 2 else env)


def drive(x: np.ndarray, amount: float) -> np.ndarray:
    return np.tanh(amount * x) / math.tanh(amount)


# ───────────────────────── 믹서 ─────────────────────────
class Bus:
    def __init__(self, name: str):
        self.name = name
        self.x = np.zeros((N, 2))

    def add(self, sig: np.ndarray, start: int, gain_db: float = 0.0, pan: float = 0.0) -> None:
        if start >= N:
            return
        g = 10 ** (gain_db / 20)
        if sig.ndim == 1:
            sig = np.stack([sig * min(1.0, 1.0 - pan), sig * min(1.0, 1.0 + pan)], 1)
        if start < 0:
            sig, start = sig[-start:], 0
        end = min(N, start + sig.shape[0])
        self.x[start:end] += sig[: end - start] * g


def make_ir(t60: float, predelay: float = 0.018, dark_after: float = 0.5, seed: int = 7) -> np.ndarray:
    """잡음 기반 스테레오 잔향 IR. 꼬리로 갈수록 어둡게 만든다."""
    local = np.random.default_rng(seed)
    n = secs(t60 * 1.1)
    t = tvec(n)
    env = np.exp(-6.9078 * t / t60)
    ir = np.zeros((n, 2))
    mix = np.clip(t / (t60 * dark_after), 0, 1)
    for c in range(2):
        nz = local.standard_normal(n)
        bright = filt(nz, "lp", 9000)
        dark = filt(nz, "lp", 1800)
        ir[:, c] = (bright * (1 - mix) + dark * mix) * env
    ir = np.vstack([np.zeros((secs(predelay), 2)), ir])
    ir /= np.sqrt((ir ** 2).sum(0, keepdims=True))
    return ir


def convolve(x: np.ndarray, ir: np.ndarray) -> np.ndarray:
    out = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:N] for c in range(2)], 1)
    return out


def pingpong(x: np.ndarray, delay_s: float, fb: float, repeats: int = 6, tone: float = 5000) -> np.ndarray:
    """스테레오 핑퐁 딜레이(웻 신호만)."""
    d = secs(delay_s)
    mono = x.mean(1)
    wet = np.zeros_like(x)
    tap = mono.copy()
    for k in range(1, repeats + 1):
        tap = filt(tap, "lp", tone) * fb
        ch = (k + 1) % 2
        if k * d < N:
            wet[k * d:, ch] += tap[: N - k * d]
    return wet


def sidechain(hits: list[int], depth: float = 0.62, release: float = 0.17, attack: float = 0.004) -> np.ndarray:
    """킥 위치에서 볼륨을 눌렀다가 풀어 주는 펌핑 게인 곡선."""
    gain = np.ones(N)
    rel_n = secs(release * 5)
    t = tvec(rel_n)
    shape = 1 - depth * np.where(t < attack, t / attack, np.exp(-(t - attack) / release))
    for h in hits:
        end = min(N, h + rel_n)
        gain[h:end] = np.minimum(gain[h:end], shape[: end - h])
    return gain


# ───────────────────────── 악기 ─────────────────────────
def kick(f0=165.0, f1=47.0, ptau=0.034, atau=0.31, click=0.28, amount=1.7, dur=0.55) -> np.ndarray:
    n = secs(dur)
    t = tvec(n)
    body = sine(f1 + (f0 - f1) * np.exp(-t / ptau), n)
    env = np.exp(-t / atau) * np.minimum(1, t / 0.0012)
    c = filt(noise(n), "hp", 2600) * np.exp(-t / 0.0035) * click
    return fade(drive(body * env + c, amount), 0, 0.03)


def soft_kick() -> np.ndarray:
    return filt(kick(f0=120, f1=45, ptau=0.03, atau=0.22, click=0.0, amount=1.2), "lp", 240)


def clap() -> np.ndarray:
    n = secs(0.7)
    t = tvec(n)
    nz = noise(n)
    body = filt(filt(nz, "bp", 1250, 0.8), "hp", 500)
    env = np.zeros(n)
    for k, off in enumerate((0.0, 0.0085, 0.017, 0.026)):
        tt = t - off
        m = tt >= 0
        env[m] += np.exp(-tt[m] / (0.0045 if k < 3 else 0.15)) * (0.75 if k < 3 else 1.0)
    air = filt(nz, "hp", 5000) * np.exp(-t / 0.05) * 0.22
    return fade(body * env * 1.6 + air, 0, 0.05)


def snare(vel=1.0, tone=188.0) -> np.ndarray:
    n = secs(0.35)
    t = tvec(n)
    nz = filt(filt(noise(n), "hp", 1500), "lp", 9000) * np.exp(-t / 0.075)
    body = sine(tone * (1 + 0.6 * np.exp(-t / 0.01)), n) * np.exp(-t / 0.05) * 0.55
    return fade((nz * 0.9 + body) * vel, 0, 0.03)


def hat(open_=False, vel=1.0) -> np.ndarray:
    n = secs(0.45 if open_ else 0.09)
    t = tvec(n)
    nz = filt(filt(noise(n), "hp", 7500), "peak", 10500, 1.2, 5)
    return fade(nz * np.exp(-t / (0.16 if open_ else 0.022)) * vel, 0, 0.01)


def shaker(vel=1.0) -> np.ndarray:
    n = secs(0.08)
    t = tvec(n)
    nz = filt(noise(n), "bp", 7800, 1.4)
    env = np.minimum(1, t / 0.006) * np.exp(-t / 0.028)
    return nz * env * vel


def crash(dur=2.6) -> np.ndarray:
    n = secs(dur)
    t = tvec(n)
    nz = noise(n)
    y = filt(nz, "hp", 4200) * np.exp(-t / 0.95) + filt(nz, "bp", 8500, 0.7) * np.exp(-t / 0.35) * 0.6
    ring = sum(np.sign(np.sin(2 * math.pi * f * t + i)) for i, f in enumerate((3150, 4365, 5112, 6373, 7419, 8811)))
    y += filt(ring / 6.0, "hp", 3800) * np.exp(-t / 0.7) * 0.25
    stereo = np.stack([y, np.roll(y, 37)], 1)
    return fade(stereo * 0.55, 0.0005, 0.3)


def boom(dur=2.2, f0=95.0, f1=31.0) -> np.ndarray:
    n = secs(dur)
    t = tvec(n)
    body = sine(f1 + (f0 - f1) * np.exp(-t / 0.13), n) * np.exp(-t / 0.75)
    burst = filt(noise(n), "lp", 700) * np.exp(-t / 0.07) * 0.5
    return fade(drive(body + burst, 1.6), 0.0008, 0.4)


def riser(dur: float, f_lo=350.0, f_hi=9000.0, pitch=(110.0, 440.0), curve=2.2) -> np.ndarray:
    n = secs(dur)
    t = tvec(n) / dur
    fc = f_lo * (f_hi / f_lo) ** (t ** 1.4)
    amp = t ** curve
    out = []
    for _ in range(2):
        out.append(svf(noise(n), fc, 2.2, "bp") * amp)
    y = np.stack(out, 1)
    tone_f = pitch[0] * (pitch[1] / pitch[0]) ** t
    tone = filt(saw(tone_f, n) + saw(tone_f * 1.007, n), "lp", 2400) * amp * 0.12
    return fade(y * 0.9 + tone[:, None], 0.01, 0.005)


def whoosh(dur=0.45, f_lo=300.0, f_hi=5200.0, pan_sweep=True) -> np.ndarray:
    n = secs(dur)
    t = tvec(n) / dur
    hump = np.sin(math.pi * t) ** 1.5
    fc = f_lo + (f_hi - f_lo) * np.sin(math.pi * t) ** 2
    y = svf(noise(n), fc, 1.4, "bp") * hump
    if not pan_sweep:
        return y
    p = -0.8 + 1.6 * t
    return np.stack([y * np.minimum(1, 1 - p), y * np.minimum(1, 1 + p)], 1)


def reverse_crash(dur: float) -> np.ndarray:
    c = crash(3.0)[::-1]
    c = c[-secs(dur):]
    ramp = np.linspace(0, 1, c.shape[0]) ** 2.2
    return c * ramp[:, None]


def type_key(vel=1.0) -> np.ndarray:
    n = secs(0.09)
    t = tvec(n)
    nz = noise(n)
    click = filt(nz, "bp", 3300 * rng.uniform(0.9, 1.1), 1.3) * np.exp(-t / 0.0024) * 1.6
    thock = sine(150 * rng.uniform(0.92, 1.08), n) * np.exp(-t / 0.011) * 0.75
    late = t > 0.018
    rattle = filt(nz, "bp", 1900, 2.0) * np.where(late, np.exp(-(t - 0.018) / 0.008), 0) * 0.35
    return fade((click + thock + rattle) * vel, 0, 0.01)


def ding() -> np.ndarray:
    n = secs(1.2)
    t = tvec(n)
    f = 2093.0
    y = sine(f, n) * np.exp(-t / 0.55) + 0.35 * sine(f * 2.76, n) * np.exp(-t / 0.22) + 0.18 * sine(f * 5.4, n) * np.exp(-t / 0.09)
    return fade(y * np.minimum(1, t / 0.0015), 0, 0.2)


def marker(dur=0.22, bright=1.0) -> np.ndarray:
    n = secs(dur)
    t = tvec(n) / dur
    jitter = 1 + 0.35 * np.sin(2 * math.pi * 23 * t * dur) * np.sin(2 * math.pi * 7 * t * dur)
    y = svf(noise(n), 3800 * bright * jitter, 1.6, "bp")
    env = np.sin(math.pi * np.clip(t, 0, 1)) ** 0.7
    return y * env * 0.9


def pop(f0=1250.0, f1=330.0) -> np.ndarray:
    n = secs(0.16)
    t = tvec(n)
    y = sine(f1 + (f0 - f1) * np.exp(-t / 0.012), n) * np.exp(-t / 0.045)
    c = filt(noise(n), "hp", 3000) * np.exp(-t / 0.002) * 0.3
    return fade(y + c, 0.0005, 0.02)


def stamp() -> np.ndarray:
    n = secs(0.5)
    t = tvec(n)
    thud = sine(105 * (1 + 0.5 * np.exp(-t / 0.01)), n) * np.exp(-t / 0.085)
    slap = filt(noise(n), "bp", 1800, 0.9) * np.exp(-t / 0.012) * 0.8
    body = filt(noise(n), "lp", 900) * np.exp(-t / 0.03) * 0.6
    return fade(drive(thud + slap + body, 1.3), 0, 0.05)


def eraser(dur: float) -> np.ndarray:
    n = secs(dur)
    t = tvec(n)
    strokes = np.abs(np.sin(2 * math.pi * 6.5 * t)) ** 0.6
    y = svf(noise(n), 1500 + 900 * strokes, 0.9, "bp") * strokes
    env = np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.05)
    return y * env


def sparkle(dur=0.35, count=14) -> np.ndarray:
    n = secs(dur)
    y = np.zeros(n)
    for i in range(count):
        st = int(rng.uniform(0, 0.75) * n)
        ln = secs(0.03)
        tt = tvec(ln)
        f = rng.uniform(2800, 6200)
        blip = sine(f, ln) * np.exp(-tt / 0.008) * (1 - st / n)
        y[st:st + ln] += blip[: n - st]
    return y * 0.5


def switch_click() -> np.ndarray:
    n = secs(0.12)
    t = tvec(n)
    return filt(noise(n), "bp", 2400, 1.5) * np.exp(-t / 0.004) + sine(80, n) * np.exp(-t / 0.03) * 0.5


def fm_pluck(f: float, dur=0.9, ratio=3.0, index=1.8, itau=0.07, atau=0.38) -> np.ndarray:
    n = secs(dur)
    t = tvec(n)
    mod = index * np.exp(-t / itau) * np.sin(2 * math.pi * f * ratio * t)
    y = np.sin(2 * math.pi * f * t + mod) * np.exp(-t / atau) * np.minimum(1, t / 0.002)
    return fade(y, 0, 0.05)


def bell(f: float, dur=2.4) -> np.ndarray:
    return fm_pluck(f, dur, ratio=3.5, index=2.4, itau=0.25, atau=0.9) + 0.25 * fm_pluck(f * 2, dur, ratio=1.0, index=0.6, itau=0.1, atau=0.5)


def supersaw(freqs: list[float], dur: float, hold: float, cut=(6500.0, 1400.0, 0.18), detune=16.0, voices=7,
             a=0.004, d=0.25, s=0.75, r=0.18, hp_hz=140.0) -> np.ndarray:
    """디튠 톱니 7성부 코드. 성부를 좌우로 벌려 스테레오 폭을 만든다."""
    n = secs(dur)
    t = tvec(n)
    out = np.zeros((n, 2))
    for f in freqs:
        for v in range(voices):
            spread = (v - (voices - 1) / 2) / ((voices - 1) / 2)
            ff = f * 2 ** (spread * detune / 1200)
            y = saw(ff, n, rng.uniform())
            pan = spread * 0.85
            out[:, 0] += y * min(1, 1 - pan)
            out[:, 1] += y * min(1, 1 + pan)
    out /= voices * max(1, len(freqs)) ** 0.5
    fc = cut[1] + (cut[0] - cut[1]) * np.exp(-t / cut[2])
    out = svf(out, fc, 0.9, "lp")
    out = filt(out, "hp", hp_hz)
    env = adsr(n, a, d, s, r, hold)
    return out * env[:, None]


def bass_note(f: float, dur: float, hold: float, sub=0.85, mid=0.4) -> np.ndarray:
    n = secs(dur)
    t = tvec(n)
    s_ = sine(f, n)
    m_ = saw(f, n) + 0.6 * saw(f * 1.006, n)
    m_ = svf(m_, 260 + 1700 * np.exp(-t / 0.05), 1.1, "lp")
    env = adsr(n, 0.003, 0.12, 0.85, 0.035, hold)
    return drive((s_ * sub + m_ * mid) * env, 1.4)


def tape_stop(x: np.ndarray, start: int, length: int) -> np.ndarray:
    """start부터 length 동안 재생 속도를 1→0으로 떨어뜨리고, 그 뒤는 무음."""
    y = x.copy()
    k = np.arange(length)
    rate = (1 - k / length) ** 1.6
    pos = start + np.cumsum(rate)
    for c in range(2):
        y[start:start + length, c] = np.interp(pos, np.arange(N), x[:, c])
    fade_n = min(secs(0.02), length)
    y[start + length - fade_n:start + length] *= np.linspace(1, 0, fade_n)[:, None]
    y[start + length:] = 0
    return y


# ───────────────────────── 편곡 ─────────────────────────
def compose() -> dict[str, np.ndarray]:
    drums, bass, music, stabs, intro, fx, foley = (Bus(n) for n in ("drums", "bass", "music", "stabs", "intro", "fx", "foley"))
    rev_send = Bus("rev")
    dly_send = Bus("dly")
    loss = CUES["loss"]
    LIGHTS_OFF = fs(loss["lightsOff"])
    DROP = fs(CUES["scenes"]["drop"][0])

    # ── 인트로(0–4s): 앰비언트 패드 + 유리 플럭 모티프 + 바이닐 노이즈
    pad = supersaw(chord("A2", "E3", "A3", "B3", "C4", "E4"), 4.6, 4.2, cut=(1100, 700, 1.0), detune=11, a=0.9, d=1.0, s=0.9, r=0.8, hp_hz=180)
    intro.add(pad, 0, -11)
    motif = [("A4", "E5"), ("C5", "E5"), ("G5", "E5"), ("C5", "B4"), ("A4", "E5"), ("C5", "E5"), ("A5", "G5"), ("E5", "C5")]
    for b, pair in enumerate(motif):
        for k, note in enumerate(pair):
            if b * 2 + k >= 14:  # 마지막 박은 비워 소등 순간을 만든다
                continue
            p = fm_pluck(hz(note), 1.1, ratio=4.0, index=1.2, itau=0.05, atau=0.42)
            start = bs(b + k * 0.5)
            intro.add(p, start, -13, pan=-0.25 if k else 0.2)
            dly_send.add(p, start, -24)
    for b in (4, 5, 6):
        intro.add(soft_kick(), bs(b), -5)
    intro.add(riser(LIGHTS_OFF / SR - 2.0, f_lo=300, f_hi=6000, pitch=(98, 392)), secs(2.0), -20)
    crackle = np.zeros(N)
    hits = rng.random(N) < 22 / SR
    crackle[hits] = rng.uniform(-1, 1, hits.sum()) * rng.uniform(0.2, 1.0, hits.sum())
    crackle = filt(crackle, "hp", 1200) + filt(noise(N), "lp", 4000) * 0.012
    intro.add(np.stack([crackle, np.roll(crackle, 211)], 1), 0, -27)
    intro.x = tape_stop(intro.x, LIGHTS_OFF, secs(0.32))

    # ── 인트로 폴리: 타자기·형광펜·지우개·도장 (cues.json과 1:1)
    for line in CUES["typing"].values():
        for i, ch in enumerate(line["text"]):
            vel = 0.55 if ch == " " else rng.uniform(0.8, 1.0)
            foley.add(type_key(vel), fs(line["start"] + i * line["step"]), -12, pan=rng.uniform(-0.25, 0.25))
    hook = CUES["hook"]
    foley.add(ding(), fs(hook["ding"]), -25, pan=0.3)
    foley.add(marker(0.2, 1.1), fs(hook["highlight"]), -19)
    foley.add(marker(0.24, 0.9), fs(hook["circle"]), -21, pan=0.3)
    foley.add(whoosh(0.42, 250, 3800), fs(loss["whip"]) - secs(0.1), -16)
    foley.add(stamp() * 0.6, fs(loss["land"]), -16)
    foley.add(marker(0.26), fs(loss["circle"]), -19, pan=-0.2)
    for k in ("label1", "label2", "label3"):
        foley.add(pop(), fs(loss[k]), -20, pan=0.15)
    e0, e1 = loss["erase"]
    foley.add(eraser((e1 - e0) / FPS), fs(e0), -17, pan=-0.1)
    foley.add(marker(0.18, 1.2), fs(loss["arrow"]), -20, pan=0.25)
    foley.add(sparkle(), fs(loss["scatter"]), -22, pan=0.3)
    foley.add(stamp(), fs(loss["stamp"]), -10)
    foley.add(switch_click(), LIGHTS_OFF, -12)
    fx.add(reverse_crash(0.42), DROP - secs(0.42), -14)

    # ── 드롭 이후의 리듬 그리드
    kicks: list[int] = []

    def kick_at(sample: int, gain=-7.5):
        drums.add(kick(), sample, gain)
        kicks.append(sample)

    def groove(b0: int, b1: int, claps=True, hats="8", shaker_on=True, kick_on=True):
        for b in range(b0, b1):
            if kick_on:
                kick_at(bs(b))
            if claps and b % 2 == 1:
                c = clap()
                drums.add(c, bs(b), -10.5)
                rev_send.add(c, bs(b), -16)
            if hats == "8":
                drums.add(hat(), bs(b + 0.5), -17, pan=0.25)
            elif hats == "16":
                for k, v in ((0.25, 0.55), (0.5, 1.0), (0.75, 0.55)):
                    drums.add(hat(vel=v), bs(b + k), -18, pan=0.25)
            if shaker_on:
                for k in range(4):
                    drums.add(shaker(0.9 if k % 2 else 0.5), bs(b + k / 4), -27, pan=-0.35)

    def roll(b0: float, beats: float, gain=-12.0):
        # 16분 → 32분으로 촘촘해지는 스네어 롤
        steps = []
        t = 0.0
        while t < beats - 1e-6:
            steps.append(t)
            t += 0.25 if t < beats * 0.5 else (0.125 if t < beats * 0.75 else 0.0625)
        for i, st in enumerate(steps):
            vel = 0.35 + 0.65 * (i / max(1, len(steps) - 1)) ** 1.5
            drums.add(snare(vel), bs(b0 + st), gain)

    def stab(names: tuple[str, ...], b: float, length=0.32, gain=-11.0, bright=7500.0):
        s = supersaw(chord(*names), length + 0.35, length, cut=(bright, 1600, 0.12), detune=18, a=0.002, d=0.18, s=0.55, r=0.14)
        stabs.add(s, bs(b), gain + 10)
        rev_send.add(s, bs(b), gain - 9)

    def held(names: tuple[str, ...], b0: float, beats: float, gain=-15.0, cut=(4200.0, 2200.0, 0.6)):
        s = supersaw(chord(*names), beats * 0.5 + 0.6, beats * 0.5, cut=cut, detune=20, a=0.01, d=0.5, s=0.85, r=0.3)
        music.add(s, bs(b0), gain + 6)
        rev_send.add(s, bs(b0), gain - 10)

    def bassline(root: str, b0: float, beats: float, gain=-9.0, pattern=(0, 0, 12, 0)):
        base = hz(root)
        for i in range(int(beats * 2)):
            f = base * 2 ** (pattern[i % len(pattern)] / 12)
            bass.add(bass_note(f, 0.3, 0.2), bs(b0 + i * 0.5), gain)

    AM, F, C, G = ("A3", "C4", "E4", "A4"), ("F3", "A3", "C4", "F4"), ("G3", "C4", "E4", "G4"), ("G3", "B3", "D4", "G4")

    # ── 드롭 + 챈트 (4–10s): 단어마다 코드 스탭
    drop_b = 8
    fx.add(boom(), bs(drop_b), -4)
    fx.add(crash(), bs(drop_b), -9)
    stab(("A2", "E3", "A3", "C4", "E4", "A4"), drop_b, 0.5, -8, 9000)
    groove(8, 19)
    bassline("A1", 8, 4)
    bassline("F1", 12, 4)
    bassline("C2", 16, 2)
    bassline("G1", 18, 1)
    for i, f in enumerate(CUES["chant"]):
        names = AM if f < 360 else (F if f < 480 else C)
        stab(names, f / 30, 0.24, -12 if i % 2 == 0 else -10.5)
        if i % 2 == 1:
            foley.add(whoosh(0.2, 800, 6000, False), fs(f) - secs(0.08), -24)
    # 미래 교실 스트로브(8분 컷) — 컷마다 게이트 스탭
    for i, f in enumerate(CUES["future"]):
        stab(C if f < 540 else G, f / 30, 0.11, -15, 6000)
    roll(19, 1.0, -13)
    fx.add(riser(0.9, 600, 9000, (196, 784)), bs(18.2), -17)

    # ── 시스템 흐름 (12–16s): 아르페지오 + 역마다 벨
    fx.add(crash(), bs(20), -12)
    groove(20, 28, hats="16")
    bassline("A1", 20, 2, -11)
    bassline("F1", 22, 2, -11)
    bassline("C2", 24, 2, -11)
    bassline("G1", 26, 2, -11)
    arp_chords = [("A4", "C5", "E5", "A5"), ("F4", "A4", "C5", "F5"), ("G4", "C5", "E5", "G5"), ("G4", "B4", "D5", "G5")]
    for i in range(32):
        notes = arp_chords[i // 8]
        p = fm_pluck(hz(notes[i % 4]), 0.5, ratio=2.0, index=1.4, itau=0.04, atau=0.16)
        music.add(p, bs(20 + i * 0.25), -21, pan=0.3 if i % 2 else -0.3)
        dly_send.add(p, bs(20 + i * 0.25), -27)
    held(AM, 20, 2, -19)
    held(F, 22, 2, -19)
    held(C, 24, 2, -19)
    held(G, 26, 2, -19)
    for f, note in zip(CUES["system"]["stations"], ("A5", "C6", "D6", "E6", "G6")):
        b_ = bell(hz(note), 1.6)
        stabs.add(b_, fs(f), -13, pan=0.0)
        rev_send.add(b_, fs(f), -18)
    l0, l1 = CUES["system"]["loop"]
    foley.add(whoosh((l1 - l0) / FPS, 400, 4500), fs(l0), -17)
    flow = CUES["system"]["flow"]
    stab(G, flow / 30, 0.4, -11, 9000)
    foley.add(marker(0.2, 1.1), fs(flow) + secs(0.05), -19)
    z0, z1 = CUES["system"]["zoom"]
    fx.add(riser((z1 - z0) / FPS, 500, 10000, (220, 880)), fs(z0), -16)
    foley.add(whoosh(0.35, 500, 6000), fs(z1) - secs(0.2), -15)

    # ── 지도 (16–18s): 핀마다 상행 플럭
    fx.add(crash(), bs(28), -12)
    groove(28, 32, hats="8")
    bassline("A1", 28, 2, -10)
    bassline("F1", 30, 2, -10)
    held(AM, 28, 2, -17, cut=(5000, 2600, 0.8))
    held(F, 30, 2, -17, cut=(5000, 2600, 0.8))
    for f, note in zip(CUES["map"]["pins"], ("A4", "C5", "D5", "E5", "G5", "A5", "C6", "D6")):
        p = fm_pluck(hz(note), 0.8, ratio=3.0, index=2.0, itau=0.05, atau=0.3)
        music.add(p, fs(f), -14, pan=rng.uniform(-0.4, 0.4))
        dly_send.add(p, fs(f), -24)
        foley.add(pop(900, 260), fs(f), -25)

    # ── 글로벌 수치 (18–20s): 스톱타임 히트 3번 → 롤
    for f, names, root in zip(CUES["scale"]["hits"], (("C3", "G3", "C4", "E4", "G4"), ("B2", "D3", "G3", "B3", "D4"), ("A2", "E3", "A3", "C4", "E4")), ("C2", "B1", "A1")):
        s = supersaw(chord(*names), 1.4, 0.35, cut=(9000, 1500, 0.2), detune=22, a=0.002, d=0.4, s=0.4, r=0.4)
        stabs.add(s, fs(f), -5)
        rev_send.add(s, fs(f), -13)
        fx.add(boom(1.4, 80, 34), fs(f), -9)
        fx.add(crash(1.6), fs(f), -15)
        bass.add(bass_note(hz(root), 0.9, 0.5), fs(f), -9)
        kicks.append(fs(f))
        drums.add(kick(), fs(f), -7)
    for b in (32, 33, 34):
        for k in (0.5, 0.75):
            drums.add(hat(vel=0.5), bs(b + k), -23, pan=0.25)
    cap = CUES["scale"]["caption"]
    roll(cap / 30, 1.0, -11)
    fx.add(riser(1.0, 400, 11000, (174, 698)), fs(cap) - secs(0.05), -14)

    # ── 피날레 (20–22s 직전): 풀 코러스 + 리드
    fx.add(crash(), bs(36), -9)
    groove(36, 40, hats="16")
    bassline("F1", 36, 2, -8)
    bassline("G1", 38, 2, -8)
    held(("F3", "A3", "C4", "F4", "A4"), 36, 2, -12, cut=(6500, 3500, 0.5))
    held(("G3", "B3", "D4", "G4", "B4"), 38, 2, -12, cut=(6500, 3500, 0.5))
    lead = [("C6", 36, 1), ("A5", 37, 1), ("D6", 38, 1), ("B5", 39, 0.85)]
    for note, b, ln in lead:
        s = supersaw([hz(note)], ln * 0.5 + 0.4, ln * 0.5, cut=(7000, 3000, 0.3), detune=12, voices=5, a=0.006, d=0.3, s=0.8, r=0.12)
        music.add(s, bs(b), -9)
        dly_send.add(s, bs(b), -18)
    for f in CUES["finale"]["lines"]:
        foley.add(whoosh(0.18, 900, 7000, False), fs(f) - secs(0.06), -24)
    roll(39.5, 0.4, -12)

    # ── 엔드 (20–22s): 로고 히트 + C 장조 해결 + 저장 비프
    end = CUES["end"]
    logo = fs(end["logo"])
    fx.add(boom(2.6, 100, 30), logo, -3)
    fx.add(crash(3.0), logo, -8)
    kicks.append(logo)
    drums.add(kick(), logo, -5)
    final = supersaw(chord("C3", "G3", "C4", "E4", "G4", "C5"), 2.2, 1.0, cut=(8000, 900, 0.9), detune=20, a=0.002, d=0.8, s=0.6, r=0.9)
    stabs.add(final, logo, -7)
    rev_send.add(final, logo, -12)
    bass.add(bass_note(hz("C2"), 1.6, 1.0), logo, -8)
    for i, note in enumerate(("C6", "E6", "G6", "C7")):
        b_ = bell(hz(note), 2.0)
        stabs.add(b_, logo + secs(0.1 + i * 0.11), -17, pan=-0.3 + i * 0.2)
        rev_send.add(b_, logo + secs(0.1 + i * 0.11), -20)
    for k in range(2):
        n = secs(0.07)
        beep = sine(1760, n) * np.minimum(1, tvec(n) / 0.003)
        foley.add(fade(beep, 0.002, 0.01), fs(end["saved"]) + secs(k * 0.11), -24)

    # ── 사이드체인 · 센드 · 페이드
    pump = sidechain(sorted(set(k for k in kicks if k >= DROP)))
    bass.x *= pump[:, None]
    music.x *= (0.35 + 0.65 * pump)[:, None]
    dly = pingpong(dly_send.x, 60 / BPM * 0.75, 0.38)
    rev = convolve(rev_send.x + dly * 0.3, make_ir(2.1))
    music.x += dly * 0.8
    stems = {"drums": drums.x, "bass": bass.x, "music": music.x, "stabs": stabs.x, "intro": intro.x, "fx": fx.x, "foley": foley.x, "reverb": rev * 0.55}
    tail = np.ones(N)
    f0 = fs(CUES["durationInFrames"] - 54)
    tail[f0:] = np.linspace(1, 0, N - f0) ** 1.5
    for k in stems:
        stems[k] = stems[k] * tail[:, None]
    return stems


# ───────────────────────── 마스터 ─────────────────────────
@njit(cache=True)
def _release(g, a):
    out = np.empty_like(g)
    cur = 1.0
    for i in range(g.shape[0]):
        cur = g[i] if g[i] < cur else a * cur + (1.0 - a) * g[i]
        out[i] = cur
    return out


def limiter(x: np.ndarray, ceiling_db: float, lookahead=0.004, release=0.09) -> np.ndarray:
    """미리보기 피크 리미터 — 피크 전 lookahead 동안 게인을 부드럽게 내리고, release로 천천히 복귀."""
    ceil = 10 ** (ceiling_db / 20)
    need = np.minimum(1.0, ceil / np.maximum(np.abs(x).max(1), 1e-9))
    la = secs(lookahead)
    g = uniform_filter1d(minimum_filter1d(need, size=2 * la + 1, mode="nearest"), size=la, mode="nearest")
    g = _release(np.minimum(g, need), math.exp(-1 / (release * SR)))
    return np.clip(x * g[:, None], -ceil, ceil)


def true_peak_db(x: np.ndarray) -> float:
    up = signal.resample_poly(x, 4, 1, axis=0)
    return 20 * math.log10(np.abs(up).max() + 1e-12)


def master(stems: dict[str, np.ndarray]) -> np.ndarray:
    mix = sum(stems.values())
    mix = filt(mix, "hp", 28)
    mix = filt(mix, "lowshelf", 90, 0.7, 1.5)
    mix = filt(mix, "highshelf", 9000, 0.7, 1.5)
    mix = drive(mix * 0.9, 1.15)
    meter = pyloudnorm.Meter(SR)
    for _ in range(4):
        loud = meter.integrated_loudness(mix)
        mix = mix * 10 ** ((TARGET_LUFS - loud) / 20)
        mix = limiter(mix, CEILING_DB - 0.6)
    tp = true_peak_db(mix)
    if tp > CEILING_DB:
        mix *= 10 ** ((CEILING_DB - tp) / 20)
    return mix


def write_wav(path: pathlib.Path, x: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tpdf = (rng.random(x.shape) - rng.random(x.shape)) / 32768
    pcm = np.clip((x + tpdf) * 32767, -32768, 32767).astype(np.int16)
    wavfile.write(path, SR, pcm)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(ROOT / "public/audio/classin-v5.wav"))
    ap.add_argument("--stems", action="store_true")
    args = ap.parse_args()
    stems = compose()
    mix = master(stems)
    write_wav(pathlib.Path(args.out), mix)
    if args.stems:
        for k, v in stems.items():
            write_wav(ROOT / f"out/stems/{k}.wav", v * 0.5)
    meter = pyloudnorm.Meter(SR)
    print(f"wrote {args.out}: {N / SR:.2f}s · {meter.integrated_loudness(mix):.1f} LUFS · true peak {true_peak_db(mix):.1f} dBTP")


if __name__ == "__main__":
    main()

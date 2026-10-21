#!/usr/bin/env python3
"""Classin v5 쇼릴 사운드트랙 합성기 — 퓨처팝 편곡.

120 BPM · 22초 · 48kHz 스테레오. 샘플이나 외부 음원 없이 모든 소리를 numpy로 합성한다.
타이밍은 영상과 같은 SSOT인 src/data/cues.json을 읽으므로, 컷·타이핑·핀 프레임을 바꾸면
이 스크립트를 다시 돌려 소리를 맞춘다.

    python3 tools/music/compose.py            # → public/audio/classin-v5.wav
    python3 tools/music/compose.py --stems    # 버스별 스템도 out/stems/에 저장

편곡(11마디):
  1–2  인트로   A단조 일렉트릭 피아노(로파이 필터) + 유리 플럭 모티프, 심장박동 킥, 라이저 → 소등 테이프 스톱
  3–5  드롭     F–G–Em–Am 왕도 진행. 화면 단어마다 코드 히트, 사이 8분음표에 보컬 찹이 대답 → 트랜스 게이트
  6–7  시스템   C–G/B–Am–F, 하우스 피아노 오프비트 + 16분 아르페지오 + 역마다 벨, "한 흐름으로"에 보컬 롱톤
  8    지도     Dm7–G7sus4, 핀마다 상행 펜타토닉 플럭, 워킹 베이스
  9    글로벌   스톱타임 히트 3번(F·G·Am) → 스네어 롤 + 보컬 글리산도
  10   피날레   F–G 코러스, 슈퍼소 리드 + 한 옥타브 아래 보컬 레이어 훅
  11   엔드     로고에서 Cmaj9로 해결, 벨 반짝임, SAVED 비프

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
    # TPT 상태변수 필터 — 컷오프가 샘플마다 바뀌어도 안정적이다. mode 0=LP 1=BP(피크 이득 Q) 2=HP
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
def sine(freq, n: int, phase0: float = 0.0) -> np.ndarray:
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (n,))
    return np.sin(2 * math.pi * ((phase0 + np.cumsum(f) / SR) % 1.0))


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


def norm(x: np.ndarray) -> np.ndarray:
    return x / (np.abs(x).max() + 1e-9)


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
    return np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:N] for c in range(2)], 1)


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


@njit(cache=True)
def _comp_gain(env_db, thr, ratio, att_c, rel_c):
    g = np.empty_like(env_db)
    cur = 0.0
    for i in range(env_db.shape[0]):
        over = env_db[i] - thr
        target = -over * (1.0 - 1.0 / ratio) if over > 0.0 else 0.0
        if target < cur:
            cur = att_c * cur + (1.0 - att_c) * target
        else:
            cur = rel_c * cur + (1.0 - rel_c) * target
        g[i] = cur
    return g


def compress(x: np.ndarray, thr_db: float, ratio: float, att: float = 0.01, rel: float = 0.15, makeup_db: float = 0.0) -> np.ndarray:
    """RMS 검출 피드포워드 컴프레서(글루·드럼 버스용)."""
    lvl = np.sqrt(uniform_filter1d((x ** 2).mean(1), size=secs(0.012)) + 1e-12)
    gdb = _comp_gain(20 * np.log10(lvl), thr_db, ratio, math.exp(-1 / (att * SR)), math.exp(-1 / (rel * SR)))
    return x * (10 ** ((gdb + makeup_db) / 20))[:, None]


def mono_low(x: np.ndarray, fc: float = 140.0) -> np.ndarray:
    """사이드 채널의 저역을 걷어 베이스·킥을 가운데로 모은다."""
    mid = (x[:, 0] + x[:, 1]) / 2
    side = filt((x[:, 0] - x[:, 1]) / 2, "hp", fc)
    return np.stack([mid + side, mid - side], 1)


# ───────────────────────── 드럼 ─────────────────────────
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


def clap_snare() -> np.ndarray:
    c = clap()
    s = snare(0.8)
    out = c.copy()
    out[: s.shape[0]] += s * 0.55
    return out


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


def rim(vel=1.0) -> np.ndarray:
    n = secs(0.09)
    t = tvec(n)
    tone = sine(1700, n) * np.exp(-t / 0.012) + 0.6 * sine(820, n) * np.exp(-t / 0.02)
    click = filt(noise(n), "bp", 3200, 1.5) * np.exp(-t / 0.004)
    return fade((tone * 0.6 + click) * vel, 0, 0.01)


def tom(f: float, vel=1.0) -> np.ndarray:
    n = secs(0.5)
    t = tvec(n)
    y = sine(f * (1 + 0.6 * np.exp(-t / 0.04)), n) * np.exp(-t / 0.22) + 0.15 * filt(noise(n), "bp", f * 4, 1.0) * np.exp(-t / 0.05)
    return fade(drive(y * vel, 1.3), 0, 0.05)


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


# ───────────────────────── FX·폴리 ─────────────────────────
def riser(dur: float, f_lo=350.0, f_hi=9000.0, pitch=(110.0, 440.0), curve=2.2) -> np.ndarray:
    n = secs(dur)
    t = tvec(n) / dur
    fc = f_lo * (f_hi / f_lo) ** (t ** 1.4)
    amp = t ** curve
    y = np.stack([svf(noise(n), fc, 2.2, "bp") * amp for _ in range(2)], 1)
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
    return y * np.sin(math.pi * np.clip(t, 0, 1)) ** 0.7 * 0.9


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
    return y * np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.05)


def sparkle(dur=0.35, count=14) -> np.ndarray:
    n = secs(dur)
    y = np.zeros(n)
    for _ in range(count):
        st = int(rng.uniform(0, 0.75) * n)
        ln = secs(0.03)
        blip = sine(rng.uniform(2800, 6200), ln) * np.exp(-tvec(ln) / 0.008) * (1 - st / n)
        y[st:st + ln] += blip[: n - st]
    return y * 0.5


def switch_click() -> np.ndarray:
    n = secs(0.12)
    t = tvec(n)
    return filt(noise(n), "bp", 2400, 1.5) * np.exp(-t / 0.004) + sine(80, n) * np.exp(-t / 0.03) * 0.5


def tape_stop(x: np.ndarray, start: int, length: int) -> np.ndarray:
    """start부터 length 동안 재생 속도를 1→0으로 떨어뜨리고, 그 뒤는 무음."""
    y = x.copy()
    k = np.arange(length)
    pos = start + np.cumsum((1 - k / length) ** 1.6)
    for c in range(2):
        y[start:start + length, c] = np.interp(pos, np.arange(N), x[:, c])
    fade_n = min(secs(0.02), length)
    y[start + length - fade_n:start + length] *= np.linspace(1, 0, fade_n)[:, None]
    y[start + length:] = 0
    return y


# ───────────────────────── 선율 악기 ─────────────────────────
def fm_pluck(f: float, dur=0.9, ratio=3.0, index=1.8, itau=0.07, atau=0.38) -> np.ndarray:
    n = secs(dur)
    t = tvec(n)
    mod = index * np.exp(-t / itau) * np.sin(2 * math.pi * f * ratio * t)
    y = np.sin(2 * math.pi * f * t + mod) * np.exp(-t / atau) * np.minimum(1, t / 0.002)
    return fade(y, 0, 0.05)


def bell(f: float, dur=2.4) -> np.ndarray:
    return fm_pluck(f, dur, ratio=3.5, index=2.4, itau=0.25, atau=0.9) + 0.25 * fm_pluck(f * 2, dur, ratio=1.0, index=0.6, itau=0.1, atau=0.5)


def epiano_note(f: float, dur: float, vel=1.0) -> np.ndarray:
    """FM 일렉트릭 피아노(1:1 캐리어·모듈레이터 + 13.7배 틴). 낮은 음일수록 길게 운다."""
    n = secs(dur)
    t = tvec(n)
    index = (1.5 * vel) * np.exp(-t / 0.45) + 0.18
    car = np.sin(2 * math.pi * f * t + index * np.sin(2 * math.pi * f * t))
    tine = 0.2 * vel * np.sin(2 * math.pi * f * 13.7 * t) * np.exp(-t / 0.025)
    env = np.minimum(1, t / 0.003) * np.exp(-t / (0.9 + 160 / f))
    return fade((car + tine) * env * vel, 0, 0.04)


def epiano(names: tuple[str, ...], dur: float, vel=1.0, strum=0.006, trem=True) -> np.ndarray:
    n = secs(dur + 0.02 * len(names))
    out = np.zeros((n, 2))
    for i, nm in enumerate(names):
        note = epiano_note(hz(nm), dur, vel)
        st = secs(i * strum)
        pan = -0.35 + 0.7 * i / max(1, len(names) - 1)
        out[st:st + note.shape[0], 0] += note[: n - st] * min(1, 1 - pan)
        out[st:st + note.shape[0], 1] += note[: n - st] * min(1, 1 + pan)
    if trem:
        t = tvec(n)
        out[:, 0] *= 1 - 0.12 * (0.5 + 0.5 * np.sin(2 * math.pi * 4.6 * t))
        out[:, 1] *= 1 - 0.12 * (0.5 + 0.5 * np.sin(2 * math.pi * 4.6 * t + math.pi))
    return out / max(1, len(names)) ** 0.6


def supersaw(freqs: list[float], dur: float, hold: float, cut=(6500.0, 1400.0, 0.18), detune=16.0, voices=7,
             a=0.004, d=0.25, s=0.75, r=0.18, hp_hz=140.0) -> np.ndarray:
    """디튠 톱니 7성부 코드. 성부를 좌우로 벌려 스테레오 폭을 만든다."""
    n = secs(dur)
    t = tvec(n)
    out = np.zeros((n, 2))
    for f in freqs:
        for v in range(voices):
            spread = (v - (voices - 1) / 2) / ((voices - 1) / 2)
            y = saw(f * 2 ** (spread * detune / 1200), n, rng.uniform())
            pan = spread * 0.85
            out[:, 0] += y * min(1, 1 - pan)
            out[:, 1] += y * min(1, 1 + pan)
    out /= voices * max(1, len(freqs)) ** 0.5
    out = svf(out, cut[1] + (cut[0] - cut[1]) * np.exp(-t / cut[2]), 0.9, "lp")
    out = filt(out, "hp", hp_hz)
    return out * adsr(n, a, d, s, r, hold)[:, None]


def bass_note(f: float, dur: float, hold: float, sub=0.85, mid=0.4, glide_from: float | None = None) -> np.ndarray:
    n = secs(dur)
    t = tvec(n)
    pitch = f if glide_from is None else f * (glide_from / f) ** np.exp(-t / 0.05)
    s_ = sine(pitch, n)
    m_ = saw(pitch, n) + 0.6 * saw(np.asarray(pitch) * 1.006, n)
    m_ = svf(m_, 260 + 1700 * np.exp(-t / 0.05), 1.1, "lp")
    env = adsr(n, 0.003, 0.12, 0.85, 0.035, hold)
    return drive((s_ * sub + m_ * mid) * env, 1.4)


# 포먼트 보컬 — 톱니 성대음 + 숨소리를 모음별 공명대(F1–F4)에 통과시킨다
FORMANTS = {
    "a": [(800, 80, 1.0), (1150, 90, 0.5), (2900, 120, 0.25), (3900, 130, 0.1)],
    "o": [(450, 70, 1.0), (800, 80, 0.45), (2830, 100, 0.12), (3800, 120, 0.06)],
    "u": [(325, 50, 1.0), (700, 60, 0.3), (2530, 170, 0.08)],
    "e": [(400, 60, 1.0), (1700, 90, 0.45), (2600, 110, 0.25), (3200, 120, 0.15)],
}


def vox(f0: float, dur: float, vowel="a", slide=1.5, glide_to: float | None = None, vib=5.4, vib_depth=0.011, att=0.012, rel=0.07, breath=0.05) -> np.ndarray:
    """보컬 찹. slide 반음 위에서 미끄러져 들어오고, glide_to가 있으면 그 음으로 글리산도."""
    n = secs(dur + rel * 4)
    t = tvec(n)
    target = f0 if glide_to is None else f0 * (glide_to / f0) ** np.clip(t / dur, 0, 1)
    vib_env = np.clip((t - 0.1) / 0.12, 0, 1)
    pitch = target * 2 ** (slide * np.exp(-t / 0.035) / 12) * (1 + vib_depth * np.sin(2 * math.pi * vib * t) * vib_env)
    src = 0.6 * saw(pitch, n) + 0.4 * saw(pitch * 1.0035, n)
    src = filt(src, "lp", 5200) + filt(noise(n), "hp", 2500) * breath
    out = np.zeros(n)
    for F, bw, g in FORMANTS[vowel]:
        q = F / bw
        out += g / q * svf(src, F, q, "bp")
    env = adsr(n, att, 0.12, 0.82, rel, dur)
    return fade(norm(out) * env, 0, 0.02)


# ───────────────────────── 악보 ─────────────────────────
# (시작 박, 길이 박, 보이싱, 베이스 루트)
CHORDS: list[tuple[float, float, tuple[str, ...], str]] = [
    (0, 4, ("A3", "C4", "E4", "G4", "B4"), "A1"),  # Am9
    (4, 2, ("F3", "A3", "C4", "E4"), "F1"),  # Fmaj7
    (6, 2, ("G3", "B3", "D4", "E4"), "G1"),  # G6
    (8, 2, ("F3", "A3", "C4", "E4"), "F1"),  # Fmaj7 — 드롭
    (10, 2, ("G3", "B3", "D4", "E4"), "G1"),  # G6
    (12, 2, ("E3", "G3", "B3", "D4"), "E1"),  # Em7
    (14, 2, ("A3", "C4", "E4", "G4"), "A1"),  # Am7
    (16, 2, ("F3", "A3", "C4", "E4"), "F1"),  # Fmaj7 — 미래 교실
    (18, 2, ("G3", "B3", "D4", "G4"), "G1"),  # G
    (20, 2, ("C4", "D4", "E4", "G4"), "C2"),  # Cadd9 — 시스템
    (22, 2, ("B3", "D4", "G4", "B4"), "B1"),  # G/B
    (24, 2, ("A3", "C4", "E4", "G4"), "A1"),  # Am7
    (26, 2, ("F3", "A3", "C4", "E4"), "F1"),  # Fmaj7
    (28, 2, ("D4", "F4", "A4", "C5"), "D2"),  # Dm7 — 지도
    (30, 2, ("G3", "C4", "D4", "F4"), "G1"),  # G7sus4
    (32, 1, ("F3", "A3", "C4", "E4", "A4"), "F1"),  # 스톱타임 히트
    (33, 1, ("G3", "B3", "D4", "E4", "G4"), "G1"),
    (34, 1, ("A3", "C4", "E4", "G4", "A4"), "A1"),
    (35, 1, ("B3", "D4", "G4", "B4"), "B1"),  # G/B — 롤
    (36, 2, ("F3", "A3", "C4", "E4", "A4"), "F1"),  # 피날레
    (38, 2, ("G3", "B3", "D4", "E4", "G4"), "G1"),
    (40, 4, ("C3", "G3", "B3", "D4", "E4", "G4"), "C2"),  # Cmaj9 — 로고
]


def chord_at(beat: float) -> tuple[tuple[str, ...], str]:
    for st, ln, voicing, root in CHORDS:
        if st <= beat < st + ln:
            return voicing, root
    return CHORDS[-1][2], CHORDS[-1][3]


def up(name: str, octaves: int = 1) -> str:
    return name[:-1] + str(int(name[-1]) + octaves)


INTRO_MOTIF = [(0, "A4"), (0.5, "E5"), (1, "B4"), (1.5, "E5"), (2, "C5"), (2.5, "E5"), (3, "B4"), (3.5, "G4"),
               (4, "A4"), (4.5, "C5"), (5, "E5"), (5.5, "C5"), (6, "D5"), (6.5, "B4")]
# 드롭: 화면 단어(정박) 사이 8분음표 뒷박에 보컬이 대답한다
DROP_CHOPS = [(8.5, "A4", "a"), (9.5, "C5", "a"), (10.5, "B4", "o"), (11.5, "D5", "a"),
              (12.5, "G4", "a"), (13.5, "B4", "o"), (14.5, "C5", "a"), (15.5, "E5", "a")]
STROBE_CHOPS = [(16.5, "A4"), (16.75, "A4"), (17.5, "C5"), (17.75, "C5"), (18.5, "D5"), (18.75, "D5")]
# 피날레 훅 — 리드는 이 음 그대로, 보컬은 한 옥타브 아래
HOOK = [(36, "E6"), (36.5, "D6"), (37, "C6"), (37.5, "D6"), (38, "E6"), (38.5, "G6"), (39, "E6"), (39.5, "D6")]


# ───────────────────────── 편곡 ─────────────────────────
def compose() -> dict[str, np.ndarray]:
    drums, bass, pads, keys, leads, voxb, stabs, intro, fx, foley = (
        Bus(n) for n in ("drums", "bass", "pads", "keys", "leads", "vox", "stabs", "intro", "fx", "foley")
    )
    hall = Bus("hall")  # 신스·보컬 큰 잔향
    room = Bus("room")  # 드럼 짧은 잔향
    dly = Bus("delay")
    loss = CUES["loss"]
    LIGHTS_OFF = fs(loss["lightsOff"])
    DROP = fs(CUES["scenes"]["drop"][0])
    kicks: list[int] = []

    # ── 1–2마디 인트로: 로파이 일렉트릭 피아노 + 유리 플럭 + 바이닐, 2마디부터 심장박동 킥과 라이저
    for st, ln, voicing, _ in CHORDS[:3]:
        ep = epiano(voicing, ln * 0.5 + 1.2, vel=0.7, strum=0.012)
        intro.add(ep, bs(st), -9)
        hall.add(ep, bs(st), -20)
    for b, note in INTRO_MOTIF:
        p = fm_pluck(hz(note), 1.1, ratio=4.0, index=1.1, itau=0.05, atau=0.42)
        intro.add(p, bs(b), -15, pan=0.25 if b % 1 else -0.2)
        dly.add(p, bs(b), -22)
    pad = supersaw([hz(n) for n in ("A2", "E3", "A3", "C4", "E4")], 4.6, 4.0, cut=(900, 600, 1.0), detune=10, a=1.2, d=1.0, s=0.9, r=0.8, hp_hz=180)
    intro.add(pad, 0, -19)
    for b in (4, 5, 6):
        intro.add(soft_kick(), bs(b), -4)
    for k in range(4):
        intro.add(shaker(0.4 + 0.15 * k), bs(5 + k * 0.5), -24, pan=-0.3)
    intro.add(riser(LIGHTS_OFF / SR - 2.0, f_lo=300, f_hi=6000, pitch=(98, 392)), secs(2.0), -19)
    crackle = np.zeros(N)
    hits = rng.random(N) < 22 / SR
    crackle[hits] = rng.uniform(-1, 1, hits.sum()) * rng.uniform(0.2, 1.0, hits.sum())
    crackle = filt(crackle, "hp", 1200) + filt(noise(N), "lp", 4000) * 0.012
    intro.add(np.stack([crackle, np.roll(crackle, 211)], 1), 0, -27)
    intro.x = filt(intro.x, "lp", 5200)  # 옆방에서 들리는 듯한 로파이 톤
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
    # 소등 뒤 침묵 속 보컬 숨 들이쉬기(드롭 직전)
    breath = filt(noise(secs(0.3)), "bp", 1800, 0.7) * np.linspace(0, 1, secs(0.3)) ** 2
    voxb.add(breath, DROP - secs(0.3), -26)

    # ── 리듬 도우미
    def kick_at(sample: int, gain=-7.5):
        drums.add(kick(), sample, gain)
        kicks.append(sample)

    def groove(b0: int, b1: int, style: str):
        """style: drop(풀) / system(가볍게) / map(빌드) / finale(최대)"""
        for b in range(b0, b1):
            kick_at(bs(b), -8.5 if style == "system" else -7.5)
            if b % 2 == 1:
                c = clap_snare()
                drums.add(c, bs(b), -10)
                room.add(c, bs(b), -14)
            if style in ("drop", "finale"):
                drums.add(hat(open_=True, vel=0.85), bs(b + 0.5), -19, pan=0.2)
                for k, v in ((0.25, 0.45), (0.75, 0.55)):
                    drums.add(hat(vel=v), bs(b + k), -20, pan=0.3)
                if b % 4 == 2:
                    drums.add(snare(0.35), bs(b + 0.75), -18)  # 고스트
            elif style == "system":
                drums.add(hat(vel=0.8), bs(b + 0.5), -18, pan=0.25)
                drums.add(rim(0.8), bs(b + 0.75 if b % 2 else b + 0.25), -22, pan=-0.2)
            elif style == "map":
                for k, v in ((0.25, 0.4), (0.5, 0.9), (0.75, 0.5)):
                    drums.add(hat(vel=v), bs(b + k), -19, pan=0.25)
            for k in range(4):
                drums.add(shaker(0.9 if k % 2 else 0.5), bs(b + k / 4), -28, pan=-0.35)

    def roll(b0: float, beats: float, gain=-12.0):
        # 16분 → 32분 → 64분으로 촘촘해지는 스네어 롤
        steps, t = [], 0.0
        while t < beats - 1e-6:
            steps.append(t)
            t += 0.25 if t < beats * 0.5 else (0.125 if t < beats * 0.75 else 0.0625)
        for i, st in enumerate(steps):
            drums.add(snare(0.35 + 0.65 * (i / max(1, len(steps) - 1)) ** 1.5), bs(b0 + st), gain)

    def hit(b: float, length=0.26, gain=-6.0, bright=8000.0):
        """화면 단어와 같은 박에 떨어지는 코드 히트 — 슈퍼소 + 일렉트릭 피아노 어택. 사이드체인 없음."""
        voicing, _ = chord_at(b)
        s = supersaw([hz(n) for n in voicing], length + 0.4, length, cut=(bright, 1700, 0.11), detune=18, a=0.002, d=0.16, s=0.5, r=0.14)
        stabs.add(s, bs(b), gain)
        hall.add(s, bs(b), gain - 12)
        stabs.add(epiano(tuple(up(n) for n in voicing[-3:]), 0.5, vel=0.9, strum=0.0, trem=False), bs(b), gain - 3)

    def pad_chords(b0: float, b1: float, gain=-14.0, cut=(4500.0, 2400.0, 0.6)):
        for st, ln, voicing, _ in CHORDS:
            if st >= b0 and st < b1:
                p = supersaw([hz(n) for n in voicing], ln * 0.5 + 0.6, ln * 0.5, cut=cut, detune=20, a=0.02, d=0.5, s=0.85, r=0.3)
                pads.add(p, bs(st), gain)
                hall.add(p, bs(st), gain - 10)

    def bassline(b0: float, b1: float, pattern=(0, 12, 0, 12), gain=-9.0, step=0.5):
        b = b0
        i = 0
        while b < b1 - 1e-6:
            _, root = chord_at(b)
            f = hz(root) * 2 ** (pattern[i % len(pattern)] / 12)
            bass.add(bass_note(f, step * 0.5 + 0.12, step * 0.42), bs(b), gain)
            b += step
            i += 1

    # ── 3–5마디 드롭 + 챈트 + 미래 교실
    fx.add(boom(), DROP, -4)
    fx.add(crash(), DROP, -9)
    kick_at(DROP, -6)
    hit(8, 0.45, -4, 9500)
    groove(9, 19, "drop")
    for f in CUES["chant"]:
        b = f / 30
        hit(b, 0.24, -6.0 if b % 2 == 0 else -7.0)  # B박(두 번째 단어)을 조금 더 세게
    for f in CUES["chant"][1::2]:
        foley.add(whoosh(0.2, 800, 6000, False), fs(f) - secs(0.08), -25)
    pad_chords(8, 16, -8)
    bassline(8, 19, pattern=(0, 12, 0, 12, 0, 12, 7, 12))
    for b, note, vowel in DROP_CHOPS:
        v = vox(hz(note), 0.2, vowel, slide=1.5)
        voxb.add(v, bs(b), -7, pan=0.12)
        hall.add(v, bs(b), -19)
        dly.add(v, bs(b), -22)
        leads.add(fm_pluck(hz(up(note)), 0.4, ratio=2.0, index=1.0, itau=0.03, atau=0.14), bs(b), -17, pan=-0.2)
    # 미래 교실: 16분 트랜스 게이트 + 스터터 찹 + 롤
    for st, ln, voicing, _ in CHORDS:
        if 16 <= st < 19:
            for k in range(int(ln * 4)):
                b = st + k * 0.25
                if b >= 19:
                    break
                g = supersaw([hz(n) for n in voicing], 0.2, 0.07, cut=(7000, 2500, 0.05), detune=20, a=0.002, d=0.06, s=0.5, r=0.04)
                stabs.add(g, bs(b), -1 + (2 if k % 4 == 0 else 0))
    for b, note in STROBE_CHOPS:
        voxb.add(vox(hz(note), 0.1, "a", slide=0.8), bs(b), -8, pan=-0.15 if b % 0.5 else 0.15)
    gl = vox(hz("G4"), 0.48, "a", slide=0, glide_to=hz("D5"))
    voxb.add(gl, bs(19), -10)
    hall.add(gl, bs(19), -18)
    roll(19, 1.0, -13)
    fx.add(riser(0.9, 600, 9000, (196, 784)), bs(18.2), -17)

    # ── 6–7마디 시스템: 하우스 피아노 오프비트 + 16분 아르페지오 + 역 벨
    fx.add(crash(), bs(20), -12)
    groove(20, 27, "system")
    bassline(20, 28, pattern=(0, 7, 12, 7), gain=-11)
    pad_chords(20, 28, -12, cut=(3200, 1800, 0.8))
    for b in np.arange(20.5, 28, 1.0):
        voicing, _ = chord_at(b)
        sk = epiano(tuple(up(n) for n in voicing), 0.22, vel=0.85, strum=0.004, trem=False)
        keys.add(sk, bs(b), -7)
        room.add(sk, bs(b), -18)
    for i in range(32):
        b = 20 + i * 0.25
        voicing, _ = chord_at(b)
        note = up(voicing[i % len(voicing)])
        p = fm_pluck(hz(note), 0.45, ratio=2.0, index=1.3, itau=0.04, atau=0.15)
        keys.add(p, bs(b), -18, pan=0.35 if i % 2 else -0.35)
        dly.add(p, bs(b), -27)
    for f, note in zip(CUES["system"]["stations"], ("C6", "D6", "E6", "G6", "A6")):
        bl = bell(hz(note), 1.6)
        stabs.add(bl, fs(f), -16)
        hall.add(bl, fs(f), -18)
    l0, l1 = CUES["system"]["loop"]
    foley.add(whoosh((l1 - l0) / FPS, 400, 4500), fs(l0), -17)
    flow = CUES["system"]["flow"]
    hit(flow / 30, 0.4, -7, 9000)
    long_vox = vox(hz("E5"), 0.9, "a", slide=2.0)
    voxb.add(long_vox, fs(flow), -9)
    hall.add(long_vox, fs(flow), -15)
    foley.add(marker(0.2, 1.1), fs(flow) + secs(0.05), -19)
    z0, z1 = CUES["system"]["zoom"]
    fx.add(riser((z1 - z0) / FPS, 500, 10000, (220, 880)), fs(z0), -16)
    for k, (b, f) in enumerate(((27.0, 196.0), (27.25, 165.0), (27.5, 131.0), (27.75, 110.0))):
        drums.add(tom(f, 0.8 + 0.07 * k), bs(b), -12, pan=0.4 - 0.25 * k)
    foley.add(whoosh(0.35, 500, 6000), fs(z1) - secs(0.2), -15)

    # ── 8마디 지도: 핀마다 상행 펜타토닉 플럭, 워킹 베이스, 마지막 박 스네어 8분 빌드
    fx.add(crash(), bs(28), -12)
    groove(28, 32, "map")
    pad_chords(28, 32, -9, cut=(5000, 2600, 0.8))
    for b, note in ((28, "D2"), (28.5, "D2"), (29, "E2"), (29.5, "F2"), (30, "G1"), (30.5, "G2"), (31, "A1"), (31.5, "B1")):
        bass.add(bass_note(hz(note), 0.36, 0.22), bs(b), -10)
    for f, note in zip(CUES["map"]["pins"], ("C5", "D5", "E5", "G5", "A5", "C6", "D6", "E6")):
        p = fm_pluck(hz(note), 0.8, ratio=3.0, index=2.0, itau=0.05, atau=0.3)
        keys.add(p, fs(f), -13, pan=rng.uniform(-0.4, 0.4))
        dly.add(p, fs(f), -23)
        foley.add(pop(900, 260), fs(f), -26)
    for k in range(4):
        drums.add(snare(0.3 + 0.15 * k), bs(31 + k * 0.25), -16)

    # ── 9마디 글로벌: 드럼이 멎는 스톱타임 히트 3번 → 롤 + 보컬 글리산도
    for f in CUES["scale"]["hits"]:
        b = f / 30
        voicing, root = chord_at(b)
        s = supersaw([hz(n) for n in voicing], 1.4, 0.35, cut=(9000, 1500, 0.2), detune=22, a=0.002, d=0.4, s=0.4, r=0.4)
        stabs.add(s, fs(f), -3)
        hall.add(s, fs(f), -11)
        stabs.add(epiano(tuple(up(n) for n in voicing[-3:]), 0.9, vel=1.0, trem=False), fs(f), -6)
        fx.add(boom(1.4, 80, 34), fs(f), -9)
        fx.add(crash(1.6), fs(f), -15)
        bass.add(bass_note(hz(root), 0.9, 0.5), fs(f), -9)
        kick_at(fs(f), -7)
    for b in (32, 33, 34):
        for k in (0.5, 0.75):
            drums.add(hat(vel=0.5), bs(b + k), -23, pan=0.25)
    cap = CUES["scale"]["caption"] / 30
    roll(cap, 1.0, -11)
    rise_vox = vox(hz("G4"), 0.5, "a", slide=0, glide_to=hz("G5"))
    voxb.add(rise_vox, bs(cap), -10)
    hall.add(rise_vox, bs(cap), -17)
    fx.add(riser(1.0, 400, 11000, (174, 698)), bs(cap) - secs(0.05), -14)

    # ── 10마디 피날레: 풀 코러스 + 리드 훅(보컬은 한 옥타브 아래)
    fx.add(crash(), bs(36), -9)
    fx.add(crash(1.8), bs(38), -15)
    groove(36, 40, "finale")
    pad_chords(36, 40, -7, cut=(6800, 3600, 0.5))
    bassline(36, 40, pattern=(0, 12, 0, 12))
    for i, (b, note) in enumerate(HOOK):
        ln = 0.5 if i < len(HOOK) - 1 else 0.42
        s = supersaw([hz(note)], ln * 0.5 + 0.35, ln * 0.45, cut=(7500, 3200, 0.25), detune=12, voices=5, a=0.004, d=0.25, s=0.8, r=0.1)
        leads.add(s, bs(b), -5)
        dly.add(s, bs(b), -18)
        v = vox(hz(up(note, -1)), ln * 0.5, "a" if i % 2 == 0 else "o", slide=1.0)
        voxb.add(v, bs(b), -8)
        hall.add(v, bs(b), -17)
    roll(39.5, 0.4, -12)

    # ── 11마디 엔드: 로고에서 Cmaj9로 해결 + 벨 반짝임 + 저장 비프
    end = CUES["end"]
    logo = fs(end["logo"])
    fx.add(boom(2.6, 100, 30), logo, -3)
    fx.add(crash(3.0), logo, -8)
    kick_at(logo, -5)
    voicing, root = chord_at(40)
    final = supersaw([hz(n) for n in voicing], 2.2, 1.0, cut=(8000, 900, 0.9), detune=20, a=0.002, d=0.8, s=0.6, r=0.9)
    stabs.add(final, logo, -6)
    hall.add(final, logo, -11)
    fin_ep = epiano(tuple(up(n) for n in voicing[1:]), 2.0, vel=0.9, strum=0.02)
    keys.add(fin_ep, logo, -8)
    hall.add(fin_ep, logo, -16)
    fin_vox = vox(hz("C5"), 1.2, "a", slide=2.0)
    voxb.add(fin_vox, logo, -11)
    hall.add(fin_vox, logo, -14)
    leads.add(supersaw([hz("C6")], 1.6, 0.6, cut=(7000, 2000, 0.5), detune=12, voices=5, a=0.004, d=0.6, s=0.5, r=0.6), logo, -12)
    bass.add(bass_note(hz(root), 1.6, 1.0), logo, -8)
    for i, note in enumerate(("C6", "E6", "G6", "B6", "D7")):
        bl = bell(hz(note), 2.0)
        stabs.add(bl, logo + secs(0.1 + i * 0.09), -18, pan=-0.4 + i * 0.2)
        hall.add(bl, logo + secs(0.1 + i * 0.09), -19)
    for k in range(2):
        n = secs(0.07)
        beep = fade(sine(1760, n) * np.minimum(1, tvec(n) / 0.003), 0.002, 0.01)
        foley.add(beep, fs(end["saved"]) + secs(k * 0.11), -24)

    # ── 사이드체인 · 버스 처리 · 센드
    pump = sidechain(sorted(set(k for k in kicks if k >= DROP)))
    bass.x *= pump[:, None]
    pads.x *= (0.25 + 0.75 * pump)[:, None]
    keys.x *= (0.55 + 0.45 * pump)[:, None]
    leads.x *= (0.6 + 0.4 * pump)[:, None]
    drums.x = compress(drums.x, -16, 3.0, att=0.004, rel=0.09, makeup_db=2.0)
    drums.x = drums.x * 0.8 + drive(drums.x * 1.6, 1.2) * 0.2  # 병렬 새추레이션
    voxb.x = filt(voxb.x, "hp", 180)
    delay = pingpong(dly.x, 60 / BPM * 0.75, 0.38)
    hall_wet = convolve(hall.x + delay * 0.3, make_ir(2.4, predelay=0.03))
    room_wet = convolve(room.x, make_ir(0.7, predelay=0.008, seed=11))
    # 소등 뒤 드롭 전까지는 잔향·딜레이 꼬리까지 끊어 완전한 침묵을 만든다
    gate = np.ones(N)
    g1 = LIGHTS_OFF + secs(0.25)
    gate[LIGHTS_OFF:g1] = np.linspace(1, 0, g1 - LIGHTS_OFF)
    gate[g1:DROP] = 0
    delay *= gate[:, None]
    hall_wet *= gate[:, None]
    stems = {
        "drums": drums.x, "bass": bass.x, "pads": pads.x, "keys": keys.x, "leads": leads.x + delay * 0.6,
        "vox": voxb.x, "stabs": stabs.x, "intro": intro.x, "fx": fx.x, "foley": foley.x,
        "reverb": hall_wet * 0.55 + room_wet * 0.35,
    }
    tail = np.ones(N)
    t0 = fs(CUES["durationInFrames"] - 54)
    tail[t0:] = np.linspace(1, 0, N - t0) ** 1.5
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
    up4 = signal.resample_poly(x, 4, 1, axis=0)
    return 20 * math.log10(np.abs(up4).max() + 1e-12)


def master(stems: dict[str, np.ndarray]) -> np.ndarray:
    mix = sum(stems.values())
    mix = mono_low(filt(mix, "hp", 28))
    mix = filt(mix, "lowshelf", 90, 0.7, 1.0)
    mix = filt(mix, "peak", 350, 0.8, -1.5)  # 탁한 중저역 정리
    mix = filt(mix, "highshelf", 9500, 0.7, 2.0)  # 공기감
    mix = compress(mix, -20, 1.8, att=0.02, rel=0.2)  # 글루
    mix = drive(mix * 0.9, 1.1)
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

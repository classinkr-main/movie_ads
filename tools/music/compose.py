#!/usr/bin/env python3
"""Classin v5 쇼릴 사운드트랙 합성기 — 펑크·뉴디스코 편곡.

120 BPM · 22초 · 48kHz 스테레오. 샘플이나 외부 음원 없이 모든 소리를 numpy로 합성한다.
타이밍은 영상과 같은 SSOT인 src/data/cues.json을 읽으므로, 컷·타이핑·핀 프레임을 바꾸면
이 스크립트를 다시 돌려 소리를 맞춘다.

    python3 tools/music/compose.py            # → public/audio/classin-v5.wav
    python3 tools/music/compose.py --stems    # 버스별 스템도 out/stems/에 저장

밴드: 슬랩 베이스 · 클라비넷(오토 와) · 펑크 기타(16분 스크래치·커팅·와우) · 3성부 혼(트럼펫·알토·트롬본)
      · 로즈 · 해먼드풍 오르간 · 펑크 드럼(고스트 노트·탬버린, 16분 56% 스윙)
화성은 E 도리안 펑크(Em9·A9·B7#9 …)와 블루 노트로 쓰고, 장조 펜타토닉 선율·플럭·벨은 쓰지 않는다.

편곡(11마디):
  1–2  인트로   옆방에서 새어 나오는 펑크 잼(로파이 필터가 점점 열림) → 도장에서 B7#9 히트 → 소등 테이프 스톱
  3–5  드롭     "남긴다."에 밴드 전체 E9 히트(혼 폴). 챈트는 첫 단어 = 기타·클라브, 결과 단어 = 혼 "다-답!" 콜 앤 리스폰스
                → 미래 교실은 디스코 4비트 + 옥타브 베이스 + 와우 기타, 혼 립
  6–7  노선도   역마다 혼이 한 칸씩 걸어 오름(Em9 → F#m7 → Gmaj9 → A9 → B7#9), 점선 루프에 립, "한 흐름으로."에서 Em9 해결
  8    지도     핀마다 반음씩 오르는 9화음 스탭(G#9 → D#9)
  9    글로벌   밴드가 멎었다 치는 스톱타임 3번(E9 · G9 · A9) → 스네어 필 + 립
  10   피날레   풀 그루브 + 혼 훅(E 도리안 6음 C# · 블루 노트 A#) + 오르간
  11   엔드     로고에서 E13 — 혼 셰이크 후 폴, SAVED 비프

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


# ───────────────────────── 펑크 밴드 ─────────────────────────
def mhz(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


def epiano_note(f: float, dur: float, vel=1.0) -> np.ndarray:
    """FM 일렉트릭 피아노(1:1 캐리어·모듈레이터 + 13.7배 틴). 낮은 음일수록 길게 운다."""
    n = secs(dur)
    t = tvec(n)
    index = (1.5 * vel) * np.exp(-t / 0.45) + 0.18
    car = np.sin(2 * math.pi * f * t + index * np.sin(2 * math.pi * f * t))
    tine = 0.2 * vel * np.sin(2 * math.pi * f * 13.7 * t) * np.exp(-t / 0.025)
    env = np.minimum(1, t / 0.003) * np.exp(-t / (0.9 + 160 / f))
    return fade((car + tine) * env * vel, 0, 0.04)


def tamb(vel=1.0) -> np.ndarray:
    """탬버린 — 징글 공진 + 밝은 잡음."""
    n = secs(0.2)
    t = tvec(n)
    jingles = sum(sine(f, n, rng.uniform()) for f in (5300, 6450, 7900, 9350)) / 4
    nz = filt(noise(n), "bp", 8600, 1.0)
    env = np.minimum(1, t / 0.002) * (np.exp(-t / 0.032) + 0.3 * np.exp(-t / 0.09))
    return fade((jingles * 0.45 + nz) * env * vel, 0, 0.02)


def funk_kick(vel=1.0) -> np.ndarray:
    """짧고 단단한 펑크 킥(붐을 줄이고 클릭을 살렸다)."""
    return kick(f0=160, f1=60, ptau=0.024, atau=0.16, click=0.45, amount=1.8, dur=0.4) * vel


def slap_bass(f: float, dur: float, kind: str = "slap", vel: float = 1.0) -> np.ndarray:
    """신스 슬랩 베이스. slap=엄지(묵직한 저음 + 어택) · pop=손가락 팝(쨍한 고음) · ghost=뮤트 고스트 노트."""
    n = secs(dur + 0.06)
    t = tvec(n)
    if kind == "ghost":
        y = filt(noise(n), "lp", 520) * np.exp(-t / 0.011) * 0.6 + sine(f, n) * np.exp(-t / 0.016) * 0.7
        return fade(y * vel * 0.55, 0, 0.01)
    pop_ = kind == "pop"
    pitch = f * 2 ** ((0.35 if pop_ else 0.15) * np.exp(-t / 0.006) / 12)
    body = sine(pitch, n) * 0.7 + 0.55 * saw(pitch, n, rng.uniform()) + 0.22 * saw(pitch * 2, n, rng.uniform())
    fc = 380 + (5400 if pop_ else 2600) * vel * np.exp(-t / (0.035 if pop_ else 0.06))
    y = svf(body, fc, 1.1, "lp")
    snap = filt(noise(n), "hp", 1900 if pop_ else 900) * np.exp(-t / 0.003) * (0.5 if pop_ else 0.3)
    amp = adsr(n, 0.0015, 0.16, 0.62, 0.03, dur)
    return fade(drive((y * amp + snap) * vel, 1.7), 0, 0.02)


def clav_note(f: float, dur: float, vel: float = 1.0) -> np.ndarray:
    """클라비넷 — 좁은 펄스파 + 엔벌로프 필터(오토 와)로 '꽥' 하는 어택."""
    n = secs(dur + 0.04)
    t = tvec(n)
    ph = rng.uniform()
    pulse = saw(f, n, ph) - saw(f, n, (ph + 0.27) % 1.0)
    env = np.minimum(1, t / 0.001) * np.exp(-t / (0.12 + 0.05 * vel))
    env[t > dur] *= np.exp(-(t[t > dur] - dur) / 0.01)
    src = pulse * env
    wah = svf(src, 650 + 3600 * vel * np.exp(-t / 0.045), 3.2, "bp")
    thin = filt(src, "hp", 1100) * 0.3
    click = filt(noise(n), "bp", 3800, 1.1) * np.exp(-t / 0.0018) * 0.25 * vel
    return fade(drive((wah * 0.9 + thin + click) * vel, 1.5), 0, 0.01)


def clav_chord(notes: list[int], dur: float, vel: float = 1.0) -> np.ndarray:
    n = secs(dur + 0.06)
    out = np.zeros(n)
    for i, m in enumerate(notes):
        c = clav_note(mhz(m), dur, vel * rng.uniform(0.9, 1.0))
        st = secs(0.0012 * i)
        out[st:st + c.shape[0]] += c[: n - st]
    return out / len(notes) ** 0.7


@njit(cache=True)
def _ks(exc, period, loss, n):
    # 카플러스–스트롱 현: 한 주기 길이의 지연선 안을 도는 잡음을 평균 필터로 깎아 현 소리를 만든다
    out = np.zeros(n)
    for i in range(n):
        x = exc[i] if i < exc.shape[0] else 0.0
        d = i - period
        if d >= 1.0:
            j = int(d)
            fr = d - j
            a = out[j] * (1.0 - fr) + out[j + 1] * fr
            b = out[j - 1] * (1.0 - fr) + out[j] * fr
            x += loss * 0.5 * (a + b)
        out[i] = x
    return out


def guitar_note(f: float, dur: float, vel: float = 1.0, mute: bool = False) -> np.ndarray:
    n = secs(dur + (0.02 if mute else 0.08))
    period = SR / f - 0.5
    L = int(period) + 1
    exc = filt(noise(L), "lp", 2600 if mute else 5200)
    exc = exc - np.roll(exc, max(1, int(L * 0.16)))  # 브리지 가까이서 친 얇은 소리
    y = _ks(exc * vel, period, 0.86 if mute else 0.9965, n)
    t = tvec(n)
    if mute:
        y = y + filt(noise(n), "bp", 1800, 0.9) * np.exp(-t / 0.006) * 0.4 * vel  # '칙' 하는 뮤트 소리
    else:
        y = y * np.where(t < dur, 1.0, np.exp(-(t - dur) / 0.015))  # 왼손을 떼어 끊는다
    return y


def guitar_chop(notes: list[int], dur: float, vel: float = 1.0, mute: bool = False, up: bool = False) -> np.ndarray:
    """펑크 기타 커팅 — 다운/업 스트로크로 현을 몇 ms씩 어긋나게 친다. mute=True면 '칙' 하는 스크래치."""
    order = notes[::-1] if up else notes
    n = secs(dur + 0.12)
    out = np.zeros(n)
    for i, m in enumerate(order):
        g = guitar_note(mhz(m), dur, vel * rng.uniform(0.85, 1.0), mute)
        st = secs(i * (0.0035 if mute else 0.006))
        out[st:st + g.shape[0]] += g[: n - st]
    out = filt(filt(filt(out, "hp", 160), "peak", 2600, 1.0, 5), "lp", 6500)
    return drive(out * 0.6, 1.8)


def ep_chord(notes: list[int], dur: float, vel=1.0, strum=0.006, trem=True) -> np.ndarray:
    """FM 일렉트릭 피아노(로즈) 코드 — 성부를 좌우로 벌리고 트레몰로를 건다."""
    n = secs(dur + 0.02 * len(notes))
    out = np.zeros((n, 2))
    for i, m in enumerate(notes):
        note = epiano_note(mhz(m), dur, vel)
        st = secs(i * strum)
        pan = -0.35 + 0.7 * i / max(1, len(notes) - 1)
        out[st:st + note.shape[0], 0] += note[: n - st] * min(1, 1 - pan)
        out[st:st + note.shape[0], 1] += note[: n - st] * min(1, 1 + pan)
    if trem:
        t = tvec(n)
        out[:, 0] *= 1 - 0.12 * (0.5 + 0.5 * np.sin(2 * math.pi * 4.6 * t))
        out[:, 1] *= 1 - 0.12 * (0.5 + 0.5 * np.sin(2 * math.pi * 4.6 * t + math.pi))
    return out / max(1, len(notes)) ** 0.6


def organ_chord(notes: list[int], dur: float, hold: float, vel: float = 1.0) -> np.ndarray:
    """해먼드풍 오르간 — 드로바 배음 + 키 클릭 + 로터리 스피커(좌우 트레몰로·도플러)."""
    n = secs(dur)
    t = tvec(n)
    y = np.zeros(n)
    for m in notes:
        f = mhz(m)
        for mult, w in ((0.5, 0.45), (1.0, 1.0), (1.5, 0.5), (2.0, 0.55), (3.0, 0.25), (4.0, 0.15)):
            if f * mult < 9000:
                y += w * sine(f * mult, n, rng.uniform())
    y = y / len(notes) * adsr(n, 0.006, 0.3, 1.0, 0.09, hold)
    y += filt(noise(n), "bp", 2600, 0.9) * np.exp(-t / 0.003) * 0.15
    lfo = np.sin(2 * math.pi * 6.2 * t)
    idx = np.arange(n, dtype=np.float64)
    d = secs(0.0007)
    left = np.interp(idx - d * (1 + lfo), idx, y) * (1 - 0.09 * (1 + lfo))
    right = np.interp(idx - d * (1 - lfo), idx, y) * (1 - 0.09 * (1 - lfo))
    return drive(np.stack([left, right], 1) * vel * 0.8, 1.3)


# 혼 섹션 — 성부마다 밝기·콧소리가 다르다(위에서부터 트럼펫·알토 색소폰·트롬본)
HORN_VOICES = {
    "tp": {"bright": 1.15, "nasal": 0.0, "pan": 0.18},
    "as": {"bright": 0.85, "nasal": 1.0, "pan": -0.32},
    "tb": {"bright": 0.7, "nasal": 0.3, "pan": 0.4},
}


def brass(f: float, dur: float, hold: float, vel: float = 1.0, kind: str = "tp", scoop: float = 0.6, scoop_t: float = 0.028,
          fall: float = 0.0, shake: float = 0.0, attack: float = 0.012) -> np.ndarray:
    """금관 — 아래에서 밀어 올려 들어가고(scoop), 세게 불수록 필터가 열린다. fall은 끝에서 떨어지는 폴, shake는 셰이크."""
    n = secs(dur)
    t = tvec(n)
    semis = -scoop * np.exp(-t / scoop_t)
    if fall:
        semis = semis - fall * np.clip((t - hold) / 0.22, 0, 1) ** 1.6
    if shake:
        semis = semis + shake * (np.sin(2 * math.pi * 7.5 * t) > 0) * np.clip((t - 0.12) / 0.1, 0, 1)
    semis = semis + 0.16 * np.sin(2 * math.pi * 5.4 * t) * np.clip((t - 0.25) / 0.25, 0, 1)
    pitch = f * 2 ** (semis / 12)
    src = 0.62 * saw(pitch, n, rng.uniform()) + 0.38 * saw(pitch * 1.0045, n, rng.uniform())
    amp = adsr(n, attack, 0.09, 0.78, 0.06, hold)
    v = HORN_VOICES[kind]
    y = svf(src, np.minimum(f * (1.3 + 6.5 * vel * v["bright"] * amp ** 1.5), 15000), 0.75, "lp")
    if v["nasal"]:
        y = y + v["nasal"] * 0.5 * filt(y, "bp", 1350, 1.4)
    y = filt(y, "hp", 140) + filt(noise(n), "bp", 2200, 0.7) * 0.03 * amp
    return fade(drive(y * amp * vel, 1.6), 0.001, 0.02)


def horn_section(notes: list[int], dur: float, hold: float, vel: float = 1.0, **kw) -> np.ndarray:
    """3성부 혼 — 낮은 음부터 트롬본·알토·트럼펫. 연주자마다 몇 ms씩 어긋난다."""
    n = secs(dur + 0.03)
    out = np.zeros((n, 2))
    for m, kind in zip(sorted(notes), ("tb", "as", "tp")):
        y = brass(mhz(m), dur, hold, vel * rng.uniform(0.93, 1.0), kind, **kw)
        st = secs(rng.uniform(0, 0.006))
        p = HORN_VOICES[kind]["pan"]
        out[st:st + y.shape[0], 0] += y[: n - st] * min(1, 1 - p)
        out[st:st + y.shape[0], 1] += y[: n - st] * min(1, 1 + p)
    return out * 0.6


# ───────────────────────── 악보 ─────────────────────────
# 120 BPM · E 도리안 펑크. 1박 = 30프레임, 16분음표 = 7.5프레임. 장조 펜타토닉 선율·플럭·벨은 쓰지 않는다.
_PC = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
# 화음 성질 → (키보드·기타 4성부, 혼 3성부) — 근음 위 반음
QUAL = {
    "m9": ((3, 10, 14, 19), (3, 7, 10)),  # 혼은 9음을 빼고 b3·5·b7로 단단하게
    "m7": ((3, 7, 10, 12), (3, 7, 10)),
    "9": ((4, 10, 14, 19), (4, 10, 14)),
    "7#9": ((4, 10, 15, 19), (4, 10, 15)),
    "13": ((4, 10, 14, 21), (10, 16, 21)),
    "maj9": ((4, 11, 14, 19), (4, 11, 14)),
}


def _place(pcs: list[int], lo: int, hi: int) -> list[int]:
    """같은 음 이름을 유지한 채 옥타브만 옮겨 [lo, hi] 안에 가장 잘 들어가게 놓는다."""
    best, score = None, 1e9
    for k in range(0, 10):
        notes = [p + 12 * k for p in pcs]
        s = max(0, lo - min(notes)) + max(0, max(notes) - hi) + abs(sum(notes) / len(notes) - (lo + hi) / 2) * 0.01
        if s < score:
            best, score = notes, s
    return best


def _horn_voicing(pcs: list[int], top: int = 75) -> list[int]:
    """3성부 혼 — 전위(돌려 쌓기)와 옥타브를 골라 맨 윗음이 top에 가장 가깝게. 화음이 바뀌어도 음역이 튀지 않는다."""
    best, score = None, 1e9
    for rot in range(len(pcs)):
        order = pcs[rot:] + pcs[:rot]
        for base in range(48, 84):
            if base % 12 != order[0] % 12:
                continue
            notes = [base]
            for p in order[1:]:
                nxt = notes[-1] + 1
                while nxt % 12 != p % 12:
                    nxt += 1
                notes.append(nxt)
            s = abs(notes[-1] - top) + 0.01 * (notes[-1] - notes[0])
            if s < score:
                best, score = notes, s
    return best


def chord(name: str) -> dict:
    root, q = name.split(":")
    r = _PC[root]
    keys_iv, horn_iv = QUAL[q]
    bass_root = _place([r], 33, 44)[0]  # A1–G#2 — 기본음이 55Hz 아래로 내려가 뭉개지지 않게
    keys = _place([r + i for i in keys_iv], 52, 76)
    horn = _horn_voicing([r + i for i in horn_iv])
    return {"name": name, "root": bass_root, "keys": keys, "gtr": _place([r + i for i in keys_iv], 55, 78), "horn": horn}


# (시작 박, 화음) — cues.json 박 그리드와 같은 축
CHART: list[tuple[float, str]] = [
    (0, "E:m9"), (4, "A:9"), (6, "C:9"), (6.53, "B:7#9"),  # 1–2마디 인트로·상실(6.53박 = 도장)
    (8, "E:9"),  # 드롭 히트 "남긴다."
    (8.5, "E:m9"), (10, "A:9"), (12, "E:m9"), (14, "A:9"),  # 챈트 — 단어마다 콜 앤 리스폰스
    (16, "C:9"), (18, "B:7#9"),  # "데이터로." → 미래 교실 디스코
    (20, "E:m9"), (21, "F#:m7"), (22, "G:maj9"), (23, "A:9"), (24, "B:7#9"),  # 노선도 역마다 한 칸씩 걸어 오른다
    (26, "E:m9"),  # "한 흐름으로."
    (28, "G#:9"), (28.5, "A:9"), (29, "A#:9"), (29.5, "B:9"), (30, "C:9"), (30.5, "C#:9"), (31, "D:9"), (31.5, "D#:9"),  # 지도: 반음씩 오르는 9화음
    (32, "E:9"), (33, "G:9"), (34, "A:9"), (35, "B:7#9"),  # 글로벌 스톱타임
    (36, "E:m9"), (38, "A:9"),  # 피날레
    (40, "E:13"),  # 엔드 로고
]


def chord_at(beat: float) -> dict:
    cur = CHART[0][1]
    for st, nm in CHART:
        if st <= beat + 1e-6:
            cur = nm
    return chord(cur)


SWING = 0.03  # 16분 뒷박을 0.03박(15ms) 늦춘다 ≈ 56% 스윙


def step_beat(b0: float, s: int) -> float:
    return b0 + s * 0.25 + (SWING if s % 2 else 0.0)


# 베이스 리프(2박 = 16분 8칸): (칸, 근음 위 반음 | None=고스트 | "app"=다음 근음으로 반음 접근, 주법, 길이 칸)
RIFF_A = [(0, 0, "slap", 2), (2, 12, "pop", 1), (3, None, "ghost", 1), (4, 10, "slap", 1), (5, 12, "pop", 1), (6, None, "ghost", 1), (7, 7, "slap", 1)]
RIFF_B = [(0, 0, "slap", 2), (2, 12, "pop", 1), (3, 10, "pop", 1), (4, 7, "slap", 1), (5, None, "ghost", 1), (6, 5, "slap", 1), (7, "app", "slap", 1)]
# 클라비넷(1마디 16칸): 정박을 비우고 뒷박 16분에 꽂는다
CLAV = [(1, 0.85), (3, 0.6), (6, 0.9), (9, 0.75), (11, 0.6), (14, 0.85)]
# 피날레 혼 훅(트럼펫 · 알토는 한 옥타브 아래) — E 도리안 6음(C#) + 블루 노트(A#)
HOOK = [(36.0, "E5", 0.4), (36.75, "G5", 0.2), (37.0, "A5", 0.35), (37.5, "A#5", 0.15), (37.75, "B5", 0.4),
        (38.0, "C#6", 0.55), (38.75, "B5", 0.2), (39.0, "A5", 0.35), (39.5, "G5", 0.2), (39.75, "E5", 0.3)]
# 드럼(1마디 16칸): (칸, 세기)
FUNK_KICK = [(0, 1.0), (3, 0.7), (6, 0.85), (8, 1.0), (10, 0.8)]
VERSE_KICK = [(0, 1.0), (6, 0.8), (8, 0.95), (11, 0.7)]
INTRO_KICK = [(0, 0.8), (10, 0.6)]
GHOSTS = [(2, 0.16), (7, 0.24), (9, 0.18), (15, 0.26)]


def chart_segments(b0: float, b1: float) -> list[tuple[float, float, dict]]:
    """[b0, b1) 안의 화음 구간들 — (시작 박, 끝 박, 화음)."""
    out = []
    for i, (st, nm) in enumerate(CHART):
        en = CHART[i + 1][0] if i + 1 < len(CHART) else 1e9
        a, b = max(st, b0), min(en, b1)
        if b - a > 1e-6:
            out.append((a, b, chord(nm)))
    return out


# ───────────────────────── 편곡 ─────────────────────────
def compose() -> dict[str, np.ndarray]:
    names = ("drums", "bass", "gtr", "clav", "keys", "organ", "horns", "intro", "fx", "foley")
    drums, bass, gtr, clav, keys, organ, horns, intro, fx, foley = (Bus(n) for n in names)
    plate = Bus("plate")  # 혼·건반 플레이트 잔향
    loss = CUES["loss"]
    LIGHTS_OFF = fs(loss["lightsOff"])
    DROP = fs(CUES["scenes"]["drop"][0])

    def hum(b: float) -> int:
        """사람 손맛 — 박 위치에 ±2ms 흔들림."""
        return bs(b) + int(rng.normal(0, 0.002) * SR)

    # ── 파트 도우미 (target 버스를 받는다 — 인트로는 따로 모아 필터·테이프 스톱을 건다)
    def drum_bar(b0: float, style: str, tgt: Bus | None = None, vel: float = 1.0, lo: float = -1e9, hi: float = 1e9):
        d = tgt or drums

        def put(sig, s, gain, pan=0.0):
            b = step_beat(b0, s)
            if lo - 1e-6 <= b < hi - 1e-6:
                d.add(sig, hum(b), gain, pan)

        if style == "disco":  # 4비트 킥 + 2·4박 클랩 + 뒷박 오픈 하이햇
            for s in (0, 4, 8, 12):
                put(funk_kick(vel), s, -6)
            for s in (4, 12):
                put(clap(), s, -13)
                put(snare(0.8 * vel), s, -12)
            for s in (2, 6, 10, 14):
                put(hat(True, 0.8 * vel), s, -18, 0.25)
            for s in range(1, 16, 2):
                put(hat(False, 0.35 * vel), s, -21, 0.25)
            for s in range(0, 16, 2):
                put(tamb(0.5 * vel), s, -25, -0.35)
            return
        for s, v in {"funk": FUNK_KICK, "verse": VERSE_KICK, "intro": INTRO_KICK}[style]:
            put(funk_kick(v * vel), s, -6)
        for s in (4, 12):
            if style == "intro":
                put(rim(0.9 * vel), s, -14)
            else:
                put(snare(vel, tone=205), s, -8)
        for s, v in GHOSTS:
            put(snare(v * vel, tone=205), s, -10)
        for s in range(16):
            if style == "funk" and s in (14, 15):
                continue
            if style in ("verse", "intro") and s % 2:
                continue
            put(hat(False, (0.75 if s % 2 == 0 else 0.4) * vel), s, -17, 0.25)
        if style == "funk":
            put(hat(True, 0.7 * vel), 14, -18, 0.25)
        if style != "intro":
            for s in (4, 12):
                put(tamb(0.8 * vel), s, -21, -0.35)

    def tom_fill(b0: float, beats: float = 1.0, gain: float = -11.0):
        pitches = (200.0, 165.0, 131.0, 110.0)
        for k in range(int(beats * 4)):
            drums.add(tom(pitches[min(k, 3)], 0.8 + 0.05 * k), hum(b0 + k * 0.25), gain, pan=0.4 - 0.25 * min(k, 3))

    def snare_fill(b0: float, beats: float = 1.0, gain: float = -11.0):
        steps = int(beats * 4)
        for k in range(steps):
            drums.add(snare(0.35 + 0.65 * (k / max(1, steps - 1)) ** 1.5, tone=205), hum(b0 + k * 0.25), gain)

    def bass_part(b0: float, b1: float, tgt: Bus, gain: float = -6.5):
        """화음 구간마다 2박 리프. 구간의 마지막 2박은 다음 근음으로 반음 접근하는 RIFF_B."""
        for st, en, ch in chart_segments(b0, b1):
            r = ch["root"]
            b = st
            while b < en - 1e-6:
                riff = RIFF_B if b + 2 >= en - 1e-6 else RIFF_A
                for s, iv, kind, ln in riff:
                    bb = step_beat(b, s)
                    if bb >= en - 1e-6:
                        break
                    if iv is None:
                        m = r + 12
                    elif iv == "app":
                        nr = chord_at(en)["root"]
                        m = nr - 1 if nr - 1 >= 33 else nr + 11
                    else:
                        m = r + iv
                    tgt.add(slap_bass(mhz(m), ln * 0.125 * 0.92, kind, rng.uniform(0.88, 1.0)), hum(bb), gain - (1.5 if kind == "pop" else 0))
                b += 2

    def octave_bass(b0: float, b1: float, gain: float = -6.5):
        """디스코 8분 옥타브 — 정박 근음, 16분 뒤 한 옥타브 위."""
        for bb in np.arange(b0, b1 - 1e-6, 0.5):
            r = chord_at(bb)["root"]
            bass.add(slap_bass(mhz(r), 0.11, "slap"), hum(bb), gain)
            bass.add(slap_bass(mhz(r + 12), 0.08, "pop", 0.85), hum(bb + 0.25 + SWING), gain - 3)

    def clav_part(b0: float, b1: float, tgt: Bus, gain: float = -12.0):
        for bar in np.arange(math.floor(b0 / 4) * 4, b1, 4):
            for s, v in CLAV:
                b = step_beat(bar, s)
                if b0 - 1e-6 <= b < b1 - 1e-6:
                    tgt.add(clav_chord(chord_at(b)["gtr"][-3:], 0.09, v), hum(b), gain, pan=0.45)

    def gtr_part(b0: float, b1: float, tgt: Bus, gain: float = -17.0):
        """16분 스크래치(뮤트) + 2·4박 커팅."""
        for bar in np.arange(math.floor(b0 / 4) * 4, b1, 4):
            for s in range(16):
                b = step_beat(bar, s)
                if not (b0 - 1e-6 <= b < b1 - 1e-6):
                    continue
                notes = chord_at(b)["gtr"]
                if s in (4, 12):
                    tgt.add(guitar_chop(notes, 0.11, 0.95), hum(b), gain + 2, pan=-0.45)
                else:
                    tgt.add(guitar_chop(notes, 0.05, 0.55 if s % 2 == 0 else 0.35, mute=True, up=bool(s % 2)), hum(b), gain, pan=-0.45)

    def keys_part(b0: float, b1: float, tgt: Bus, gain: float = -12.0, send: bool = True):
        """로즈 컴핑 — 화음이 바뀌는 정박에 길게, 1.5박 뒤 뒷박에 짧게."""
        for st, en, ch in chart_segments(b0, b1):
            ep = ep_chord(ch["keys"], min(0.9, (en - st) * 0.5), 0.75)
            tgt.add(ep, hum(st), gain)
            if send:
                plate.add(ep, bs(st), gain - 12)
            if en - st >= 2 - 1e-6:
                tgt.add(ep_chord(ch["keys"], 0.16, 0.6, trem=False), hum(step_beat(st, 6)), gain - 3)

    def organ_part(b0: float, b1: float, gain: float = -16.0):
        for st, en, ch in chart_segments(b0, b1):
            ln = (en - st) * 0.5
            o = organ_chord(ch["keys"], ln + 0.25, ln, 0.9)
            organ.add(o, bs(st), gain)
            plate.add(o, bs(st), gain - 10)

    def horn_hit(b: float, name: str | None = None, hold: float = 0.1, vel: float = 1.0, gain: float = -7.0,
                 at: int | None = None, tgt: Bus | None = None, send: bool = True, **kw):
        ch = chord(name) if name else chord_at(b)
        h = horn_section(ch["horn"], hold + 0.42, hold, vel, **kw)
        st = at if at is not None else hum(b)
        (tgt or horns).add(h, st, gain)
        if send:
            plate.add(h, st, gain - 9)

    def band_hit(b: float, name: str, at: int, hold: float, gain: float = -5.0, **kw):
        """밴드 전체 히트 — 혼 + 기타 커팅 + 슬랩(근음·옥타브) + 킥."""
        ch = chord(name)
        horn_hit(b, name, hold=hold, gain=gain, at=at, **kw)
        gtr.add(guitar_chop(ch["gtr"], min(0.5, hold + 0.1), 1.0), at, -11, pan=-0.45)
        bass.add(slap_bass(mhz(ch["root"]), min(0.45, hold + 0.05), "slap"), at, -5)
        bass.add(slap_bass(mhz(ch["root"] + 12), min(0.3, hold), "pop"), at + secs(0.004), -10)
        drums.add(funk_kick(), at, -5)

    # ── 1–2마디 인트로: 옆방에서 새어 나오는 펑크 잼(로파이 필터가 점점 열린다) → 도장에서 히트 → 소등에 테이프 스톱
    stamp_at = fs(loss["stamp"])
    stamp_b = loss["stamp"] / 30
    for bar in (0, 4):
        drum_bar(bar, "intro", intro, vel=0.85, hi=stamp_b)
    bass_part(0, stamp_b, intro, -9)
    clav_part(0, stamp_b, intro, -15)
    gtr_part(0, stamp_b, intro, -18)
    keys_part(0, stamp_b, intro, -11, send=False)
    ch_stamp = chord("B:7#9")
    intro.add(horn_section(ch_stamp["horn"], 0.6, 0.18, 0.95, fall=3.0), stamp_at, -7)
    intro.add(guitar_chop(ch_stamp["gtr"], 0.2, 1.0), stamp_at, -11, pan=-0.45)
    intro.add(slap_bass(mhz(ch_stamp["root"]), 0.25, "slap"), stamp_at, -7)
    intro.add(funk_kick(), stamp_at, -6)
    crackle = np.zeros(N)
    pops_ = rng.random(N) < 22 / SR
    crackle[pops_] = rng.uniform(-1, 1, pops_.sum()) * rng.uniform(0.2, 1.0, pops_.sum())
    crackle = filt(crackle, "hp", 1200) + filt(noise(N), "lp", 4000) * 0.012
    intro.add(np.stack([crackle, np.roll(crackle, 211)], 1), 0, -27)
    ramp = np.clip(tvec(N) / (LIGHTS_OFF / SR), 0, 1)
    intro.x = svf(intro.x, 1300 * (5200 / 1300) ** ramp, 0.9, "lp") * (10 ** ((-11 + 7 * ramp) / 20))[:, None]
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
    foley.add(stamp(), stamp_at, -10)
    foley.add(switch_click(), LIGHTS_OFF, -12)
    fx.add(reverse_crash(0.42), DROP - secs(0.42), -14)
    breath = filt(noise(secs(0.3)), "bp", 1800, 0.7) * np.linspace(0, 1, secs(0.3)) ** 2
    foley.add(breath, DROP - secs(0.3), -26)
    for k, b in enumerate((7.75, 7.875)):  # 드롭 직전 스네어 픽업 "다-당"
        drums.add(snare(0.6 + 0.25 * k, tone=205), bs(b), -11)

    # ── 3–5마디 드롭 + 챈트: "남긴다."에 밴드 전체가 터지고, 단어마다 콜 앤 리스폰스
    fx.add(boom(), DROP, -10)
    fx.add(crash(), DROP, -11)
    band_hit(8, "E:9", DROP, hold=0.42, gain=-4, fall=5.0)
    drum_bar(8, "funk", lo=8.25)
    drum_bar(12, "funk")
    drum_bar(16, "funk", hi=17)
    bass_part(8.5, 17, bass)
    clav_part(9, 17, clav)
    gtr_part(9, 17, gtr)
    for i, f in enumerate(CUES["chant"]):
        b = f / 30
        notes = chord_at(b)["gtr"]
        if i % 2 == 0:  # A 단어(첫 단어): 기타·클라브 액센트
            gtr.add(guitar_chop(notes, 0.16, 1.0), fs(f), -10, pan=-0.45)
            clav.add(clav_chord(notes[-3:], 0.12, 1.0), fs(f), -11, pan=0.45)
        else:  # B 단어(결과물): 16분 앞꾸밈 "다-" + 혼 스탭 "답!"
            horn_hit(b - 0.25, chord_at(b)["name"], hold=0.05, vel=0.75, gain=-11)  # 다음 화음을 16분 먼저 당겨 친다
            horn_hit(b, hold=0.14, vel=1.0, gain=-5, at=fs(f))

    # ── 5마디 후반 미래 교실: 디스코 4비트 + 옥타브 베이스 + 와우 기타, 혼 립 → 스탭 → 탐 필
    fx.add(crash(1.6), bs(17), -14)
    drum_bar(16, "disco", lo=17, hi=19.5)
    octave_bass(17, 19.5)
    gtr_part(17, 19.5, gtr, -14)
    horn_hit(17, hold=0.3, vel=1.0, gain=-6, scoop=9.0, scoop_t=0.07)  # 립 — 아래에서 쓸어 올린다
    for b, hold in ((18, 0.18), (19, 0.08), (19.25, 0.08)):
        horn_hit(b, hold=hold, vel=0.95, gain=-7)
    tom_fill(19.5, 0.5)
    fx.add(riser(0.9, 600, 9000, (196, 784)), bs(19.1), -19)
    w0, w1 = bs(17), bs(19.5)
    seg = gtr.x[w0:w1]
    tb = tvec(seg.shape[0]) * BPM / 60
    gtr.x[w0:w1] = svf(seg, 450 + 2300 * (0.5 - 0.5 * np.cos(2 * math.pi * 2 * tb)), 2.4, "bp") * 1.6 + seg * 0.3  # 8분마다 와우 페달

    # ── 6–7마디 노선도: 역이 켜질 때마다 혼이 한 칸씩 걸어 오르고(Em9 → F#m7 → Gmaj9 → A9 → B7#9) "한 흐름으로."에서 Em9로 해결
    fx.add(crash(), bs(20), -14)
    drum_bar(20, "verse")
    drum_bar(24, "verse", hi=27)
    for f in CUES["system"]["stations"]:
        b = f / 30
        ch = chord_at(b)
        last = b >= 24
        horn_hit(b, hold=0.3 if last else 0.1, vel=0.95, gain=-6, at=fs(f), shake=1.0 if last else 0.0)
        bass.add(slap_bass(mhz(ch["root"]), 0.2, "slap"), fs(f), -6)
        if not last:  # 마지막 역부터는 리프가 이어받는다
            bass.add(slap_bass(mhz(ch["root"] + 12), 0.08, "pop", 0.8), hum(b + 0.5), -10)
        keys.add(ep_chord(ch["keys"], 0.45, 0.8), fs(f), -12)
    gtr_part(20, 27, gtr, -17)
    clav_part(24, 27, clav, -15)
    bass_part(24.5, 26, bass)
    l0, l1 = CUES["system"]["loop"]
    foley.add(whoosh((l1 - l0) / FPS, 400, 4500), fs(l0), -18)
    horn_hit(l0 / 30, "B:7#9", hold=(l1 - l0) / FPS * 0.8, vel=0.85, gain=-10, at=fs(l0), scoop=12.0, scoop_t=0.18)  # 점선 루프를 따라 올라가는 립
    flow = CUES["system"]["flow"]
    fx.add(crash(), fs(flow), -12)
    band_hit(flow / 30, "E:m9", fs(flow), hold=0.4, gain=-4, fall=4.0)
    foley.add(marker(0.2, 1.1), fs(flow) + secs(0.05), -20)
    bass_part(26.5, 27, bass)
    keys_part(26, 27, keys)
    z0, z1 = CUES["system"]["zoom"]
    tom_fill(z0 / 30, 1.0)
    fx.add(riser((z1 - z0) / FPS, 500, 10000, (220, 880)), fs(z0), -18)
    horn_hit(z0 / 30, "D#:9", hold=0.42, vel=0.8, gain=-11, at=fs(z0), attack=0.4)  # 줌과 함께 부풀어 오르는 스웰
    foley.add(whoosh(0.35, 500, 6000), fs(z1) - secs(0.2), -16)

    # ── 8마디 지도: 핀마다 반음씩 오르는 9화음 스탭(G#9 → D#9) — 혼 + 클라비넷, 베이스는 근음·옥타브
    fx.add(crash(), bs(28), -13)
    drum_bar(28, "funk")
    for f in CUES["map"]["pins"]:
        b = f / 30
        ch = chord_at(b)
        horn_hit(b, hold=0.08, vel=0.9, gain=-8, at=fs(f))
        clav.add(clav_chord(ch["gtr"][-3:], 0.08, 0.9), fs(f), -13, pan=0.45)
        bass.add(slap_bass(mhz(ch["root"]), 0.11, "slap"), fs(f), -7)
        bass.add(slap_bass(mhz(ch["root"] + 12), 0.06, "pop", 0.8), hum(b + 0.25 + SWING), -11)
        foley.add(pop(900, 260), fs(f), -28)
    gtr_part(28, 32, gtr, -17)
    snare_fill(31, 1.0, -15)

    # ── 9마디 글로벌: 밴드가 멎었다 치는 스톱타임 3번(E9 → G9 → A9) → 필 + 립으로 피날레에 올라탄다
    for k, f in enumerate(CUES["scale"]["hits"]):
        b = f / 30
        band_hit(b, chord_at(b)["name"], fs(f), hold=0.32, gain=-5, shake=1.0 if k == 2 else 0.0)
        fx.add(crash(1.6), fs(f), -16)
        fx.add(boom(1.2, 80, 36), fs(f), -17)
    for b in np.arange(32.5, 35, 0.5):  # 멎은 사이 하이햇·탬버린만 시간을 지킨다
        drums.add(hat(False, 0.45), hum(b), -21, pan=0.25)
        drums.add(tamb(0.4), hum(b + 0.25 + SWING), -26, pan=-0.35)
    cap = CUES["scale"]["caption"] / 30
    horn_hit(cap, "B:7#9", hold=0.12, vel=0.9, gain=-7)
    bass.add(slap_bass(mhz(chord("B:7#9")["root"]), 0.2, "slap"), bs(cap), -7)
    snare_fill(cap, 0.75, -11)
    tom_fill(cap + 0.75, 0.25, -11)
    horn_hit(cap + 0.5, "E:m9", hold=0.2, vel=0.9, gain=-9, scoop=9.0, scoop_t=0.07)
    fx.add(riser(1.0, 400, 11000, (174, 698)), bs(cap) - secs(0.05), -16)

    # ── 10마디 피날레: 풀 그루브 + 혼 훅(트럼펫 + 한 옥타브 아래 알토) + 오르간
    fx.add(crash(), bs(36), -11)
    strike = CUES["finale"]["strike"]
    fx.add(crash(1.8), fs(strike), -14)
    drum_bar(36, "funk", hi=39.5)
    bass_part(36, 40, bass)
    clav_part(36, 40, clav, -15)
    gtr_part(36, 40, gtr, -16)
    organ_part(36, 40)
    for b, note, hold in HOOK:
        f = hz(note)
        accent = note == "C#6"
        tp = brass(f, hold + 0.45, hold, 1.0, "tp", scoop=0.5, shake=0.8 if accent else 0.0)
        alto = brass(f / 2, hold + 0.45, hold, 0.95, "as", scoop=0.5)
        horns.add(tp, hum(b), -6 + (1 if accent else 0), pan=0.15)
        horns.add(alto, hum(b), -9, pan=-0.3)
        plate.add(tp, bs(b), -15)
    gtr.add(guitar_chop(chord("A:9")["gtr"], 0.3, 1.0), fs(strike), -11, pan=-0.45)
    drums.add(funk_kick(), fs(strike), -5)
    snare_fill(39.5, 0.5, -11)

    # ── 11마디 엔드: 로고에서 E13 마지막 히트 — 혼은 셰이크 후 폴, 로즈·오르간·기타가 울리며 끝난다
    end = CUES["end"]
    logo = fs(end["logo"])
    ch = chord("E:13")
    fx.add(boom(2.6, 100, 30), logo, -9)
    fx.add(crash(3.0), logo, -10)
    drums.add(funk_kick(), logo, -4)
    fin = horn_section(ch["horn"], 2.0, 0.95, 1.0, shake=0.8, fall=6.0)
    horns.add(fin, logo, -5)
    plate.add(fin, logo, -12)
    ep = ep_chord(ch["keys"], 2.0, 0.9, strum=0.02)
    keys.add(ep, logo, -9)
    plate.add(ep, logo, -18)
    organ.add(organ_chord(ch["keys"], 2.2, 1.6, 0.9), logo, -14)
    gtr.add(guitar_chop(ch["gtr"], 1.2, 1.0), logo, -11, pan=-0.45)
    bass.add(slap_bass(mhz(ch["root"]), 1.0, "slap"), logo, -6)
    for k in range(2):
        n = secs(0.07)
        beep = fade(sine(1760, n) * np.minimum(1, tvec(n) / 0.003), 0.002, 0.01)
        foley.add(beep, fs(end["saved"]) + secs(k * 0.11), -24)

    # ── 버스 처리 · 센드(펑크답게 펌핑 없이 건조하게, 혼·건반만 플레이트)
    drums.x = compress(drums.x, -16, 3.0, att=0.004, rel=0.09, makeup_db=2.0)
    drums.x = drums.x * 0.8 + drive(drums.x * 1.6, 1.2) * 0.2  # 병렬 새추레이션
    bass.x = compress(bass.x, -18, 3.0, att=0.003, rel=0.08, makeup_db=1.5)
    horns.x = compress(horns.x, -18, 2.5, att=0.006, rel=0.12, makeup_db=1.0)
    plate_wet = convolve(plate.x, make_ir(1.4, predelay=0.012, dark_after=0.6))
    room_wet = convolve(drums.x * 0.22 + gtr.x * 0.35 + clav.x * 0.3, make_ir(0.55, predelay=0.006, seed=11))
    # 소등 뒤 드롭 전까지는 잔향 꼬리까지 끊어 완전한 침묵을 만든다(타자기 소리만 남는다)
    gate = np.ones(N)
    g1 = LIGHTS_OFF + secs(0.25)
    gate[LIGHTS_OFF:g1] = np.linspace(1, 0, g1 - LIGHTS_OFF)
    gate[g1:DROP] = 0
    plate_wet *= gate[:, None]
    room_wet *= gate[:, None]
    stems = {
        "drums": drums.x, "bass": bass.x, "gtr": gtr.x, "clav": clav.x, "keys": keys.x, "organ": organ.x,
        "horns": horns.x, "intro": intro.x, "fx": fx.x, "foley": foley.x, "reverb": plate_wet * 0.6 + room_wet * 0.5,
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

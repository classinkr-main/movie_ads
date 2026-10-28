#!/usr/bin/env python3
"""브래그컷 사운드트랙 — src/brag/cues.json을 읽어 음악과 효과음을 한 곡으로 합성한다.

numpy와 ffmpeg(라우드니스 정규화)만 쓴다. 영상과 같은 큐 파일을 읽으므로 타이밍을 바꾸면 다시 실행하면 된다.

    python3 scripts/brag-audio.py [out.wav]   # 기본값 public/audio/brag-mix.wav

구성(120 BPM, 마디 경계 1.0s 오프셋 → 3·5·9·13·17s가 다운비트):
  0–3s   콜드 오픈: D 드론, 타임코드 틱, 세션 종료 붐, 알림 차임, 라이저
  3s     드롭: 브람(저음 금관풍 톱니파) + 서브 붐 + 크래시
  5–17s  하이라이트: 16분 펄스 오스티나토 · 스트링 패드 · 킥/타이코, 장면마다 한 단계씩 고조
  17–20s 엔딩: 플래시 뒤 F장조로 해결, 벨 아르페지오
효과음은 모두 같은 조(D단조/F장조)의 음높이로 맞추고, 음악 밑에 깔리도록 낮게 섞는다.
"""
import json
import os
import subprocess
import sys
import tempfile
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUES = json.load(open(os.path.join(ROOT, "src", "brag", "cues.json"), encoding="utf-8"))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "public", "audio", "brag-mix.wav")

SR = 48000
FPS = CUES["fps"]
DUR = CUES["frames"] / FPS
N = int(round(DUR * SR))
BEAT = 60 / CUES["bpm"]
BAR = BEAT * 4
OFF = CUES["barOffsetSec"]
rng = np.random.default_rng(7)

# ---------- 타임라인 ----------
STARTS = []
_f = 0
for _i, _s in enumerate(CUES["scenes"]):
    STARTS.append(_f)
    _f += _s["frames"] - (CUES["transitions"][_i] if _i < len(CUES["transitions"]) else 0)
TRANS = CUES["transitions"]


def cue(name):
    if isinstance(name, (int, float)):
        return name / FPS
    if name.startswith("transition."):
        return STARTS[int(name.split(".")[1])] / FPS
    return CUES["cues"][name] / FPS


def arrive(i):
    return (STARTS[i] + TRANS[i - 1]) / FPS


T_DROP = cue("reveal.logo")
T_EVAL, T_GRADE, T_CAP, T_END = arrive(2), arrive(3), arrive(4), arrive(5)
T_FLASH = (STARTS[5] + TRANS[4] / 2) / FPS


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------- 기본 도구 ----------
def tt(n):
    return np.arange(n) / SR


def place(buf, x, t0, gain=1.0, pan=0.0):
    """mono 또는 stereo 신호를 t0초에 더한다. pan -1(좌)~1(우), 등전력."""
    i0 = int(round(t0 * SR))
    if x.ndim == 1:
        a = (pan + 1) * np.pi / 4
        x = np.stack([x * np.cos(a), x * np.sin(a)], 1) * np.sqrt(2)
    if i0 < 0:
        x = x[-i0:]
        i0 = 0
    n = min(len(x), len(buf) - i0)
    if n > 0:
        buf[i0 : i0 + n] += x[:n] * gain


def saw(freq, n, fc=4000.0, slope=1.0, phase=0.0):
    """대역 제한 톱니파 — 배음마다 저역통과 가중치를 줘서 필터 없이 음색을 만든다."""
    t = tt(n)
    out = np.zeros(n)
    kmax = max(1, int(min(16000, fc * 4) / freq))
    for k in range(1, kmax + 1):
        w = (1 / k**slope) / np.sqrt(1 + (k * freq / fc) ** 4)
        out += w * np.sin(2 * np.pi * k * freq * t + phase * k)
    return out


def bell(freq, n, decay=1.2, bright=1.0):
    t = tt(n)
    parts = [(1, 1.0, 1.0), (2.0, 0.5, 0.7), (3.01, 0.25 * bright, 0.45), (4.2, 0.14 * bright, 0.3), (5.43, 0.08 * bright, 0.2)]
    out = np.zeros(n)
    for ratio, amp, dk in parts:
        out += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t / (decay * dk))
    return out * (1 - np.exp(-t / 0.002))


def ar(n, attack, release):
    e = np.ones(n)
    a = min(n, int(attack * SR))
    r = min(n, int(release * SR))
    if a:
        e[:a] = np.linspace(0, 1, a) ** 2
    if r:
        e[n - r :] *= np.linspace(1, 0, r) ** 2
    return e


def fft_filter(x, lo=0.0, hi=SR / 2, soft=1.15):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-9
    g = np.ones_like(f)
    if lo > 0:
        g *= 1 / np.sqrt(1 + (lo / f) ** (4 * soft))
    if hi < SR / 2:
        g *= 1 / np.sqrt(1 + (f / hi) ** (4 * soft))
    return np.fft.irfft(X * g, len(x))


def stft_filter(x, gain_fn, nfft=2048, hop=512):
    """시간에 따라 변하는 필터 — gain_fn(t초, freqs) → 이득 배열."""
    win = np.hanning(nfft)
    freqs = np.fft.rfftfreq(nfft, 1 / SR)
    pad = np.concatenate([np.zeros(nfft), x, np.zeros(nfft)])
    out = np.zeros(len(pad))
    wsum = np.zeros(len(pad))
    for i in range(0, len(pad) - nfft, hop):
        seg = pad[i : i + nfft] * win
        g = gain_fn((i + nfft / 2 - nfft) / SR, freqs)
        out[i : i + nfft] += np.fft.irfft(np.fft.rfft(seg) * g, nfft) * win
        wsum[i : i + nfft] += win**2
    return (out / np.maximum(wsum, 1e-6))[nfft : nfft + len(x)]


def bandpass_gain(center, width=0.9):
    def g(_t, f):
        c = center(_t) if callable(center) else center
        return np.exp(-0.5 * (np.log2((f + 1) / c) / width) ** 2)

    return g


def noise(n):
    return rng.standard_normal(n)


# ---------- 악기 ----------
def kick(n_sec=0.5, f0=150, f1=55, click=0.5):
    n = int(n_sec * SR)
    t = tt(n)
    f = f1 + (f0 - f1) * np.exp(-t / 0.045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / (n_sec * 0.38))
    c = fft_filter(noise(n), 1500, 6000) * np.exp(-t / 0.006) * click
    return np.tanh(1.6 * (body + c))


def taiko(n_sec=1.2):
    n = int(n_sec * SR)
    t = tt(n)
    f = 52 + 60 * np.exp(-t / 0.06)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.35)
    skin = fft_filter(noise(n), 120, 900) * np.exp(-t / 0.05) * 0.5
    return np.tanh(1.4 * (body + skin))


def hat(n_sec=0.05, open_=False):
    n = int((0.22 if open_ else n_sec) * SR)
    t = tt(n)
    return fft_filter(noise(n), 7000, 16000) * np.exp(-t / (0.06 if open_ else 0.012))


def pad_note(freq, n, fc=2200, detune=7.0, voices=3):
    out = np.zeros(n)
    for v in range(voices):
        cents = (v - (voices - 1) / 2) * detune
        out += saw(freq * 2 ** (cents / 1200), n, fc=fc, slope=1.15, phase=rng.uniform(0, 2 * np.pi))
    return out / voices


def chord_pad(notes, t0, t1, gain, fc=2200, attack=0.5, release=0.8, width=0.6):
    n = int((t1 - t0 + release) * SR)
    env = ar(n, attack, release)
    for j, m in enumerate(notes):
        pan = (j / max(1, len(notes) - 1) * 2 - 1) * width
        x = pad_note(midi(m), n, fc=fc) * env
        place(MUSIC, x, t0, gain / len(notes) ** 0.5, pan)
        place(SEND, x, t0, gain * 0.5 / len(notes) ** 0.5, pan)


def pluck(freq, dur=0.11, fc=1800, tau=0.07):
    n = int((dur + 0.15) * SR)
    t = tt(n)
    x = saw(freq, n, fc=fc, slope=1.0) + 0.5 * saw(freq * 1.004, n, fc=fc, slope=1.0)
    return x * np.exp(-t / tau) * (1 - np.exp(-t / 0.002))


# ---------- 버스 ----------
MUSIC = np.zeros((N, 2))
SFX = np.zeros((N, 2))
SEND = np.zeros((N, 2))  # 리버브 센드
KICKS = []  # 사이드체인 트리거 시각

# 화음(MIDI) — D단조 i–VI–III–VII, 엔딩 F장조
DM = [50, 57, 62, 65, 69]
BB = [46, 53, 58, 62, 65]
FM = [41, 53, 57, 60, 65]
CM = [48, 55, 60, 64, 67]
FMAJ9 = [41, 53, 57, 64, 67, 72]
# (시작, 화음, 베이스 근음)
PROG = [(T_EVAL, DM, 38), (T_EVAL + BAR, BB, 34), (T_GRADE, FM, 41), (T_GRADE + BAR, CM, 36), (T_CAP, DM, 38), (T_CAP + BAR, CM, 36)]

# ---------- 음악 ----------
# 콜드 오픈 드론 — D1 사인 + 어두운 톱니 패드, 천천히 부풀어 오른다
n = int((T_DROP + 0.05) * SR)
t = tt(n)
swell = np.clip(t / 1.4, 0, 1) ** 1.5 * (0.75 + 0.25 * np.clip((t - cue("hook.ended")) / 0.4, 0, 1))
drone = 0.4 * np.sin(2 * np.pi * midi(26) * t) + 0.5 * pad_note(midi(38), n, fc=480) + 0.3 * pad_note(midi(50), n, fc=700)
drone *= swell * ar(n, 0.01, 0.04)
place(MUSIC, drone, 0, 0.4)
air = fft_filter(noise(n), 2500, 7000) * swell * 0.05
place(MUSIC, np.stack([air, np.roll(air, 900)], 1), 0, 1.0)

# 드롭 — 브람(옥타브로 쌓은 톱니, 필터가 닫히며 사라짐) + 서브 붐 + 크래시
n = int(3.2 * SR)
t = tt(n)
braam = np.zeros(n)
for m, a in [(26, 0.8), (38, 0.9), (45, 0.5), (50, 0.6), (57, 0.25)]:
    braam += a * (saw(midi(m), n, fc=5000, slope=1.0) + saw(midi(m) * 1.006, n, fc=5000, slope=1.0))
braam = np.tanh(0.9 * braam)
braam = stft_filter(braam, lambda tc, f: 1 / np.sqrt(1 + (f / (180 + 3800 * np.exp(-tc / 0.5))) ** 4))
braam *= np.exp(-t / 1.1) * (1 - np.exp(-t / 0.004))
place(MUSIC, np.stack([braam, np.roll(braam, 240)], 1), T_DROP, 0.75)
place(SEND, braam, T_DROP, 0.35)
boom = taiko(2.0) * 1.0
place(MUSIC, boom, T_DROP, 0.9)
crash = fft_filter(noise(int(2.8 * SR)), 3000, 15000) * np.exp(-tt(int(2.8 * SR)) / 0.7)
place(MUSIC, np.stack([crash, np.roll(crash, 700)], 1), T_DROP, 0.09)
place(SEND, crash, T_DROP, 0.08)
KICKS.append(T_DROP)

# 타이틀 패드(3–5s) — 브람 뒤에 남는 D단조
chord_pad(DM, T_DROP, T_EVAL, 0.16, fc=1600, attack=0.3, release=0.4)

# 하이라이트(5–17s) — 패드 · 펄스 · 서브 · 드럼, 장면마다 강도 증가
INTENSITY = [(T_EVAL, 0.5), (T_GRADE, 0.75), (T_CAP, 1.0)]


def intensity_at(x):
    v = 0.0
    for t0, k in INTENSITY:
        if x >= t0:
            v = k
    return v


for i, (t0, ch, root) in enumerate(PROG):
    t1 = PROG[i + 1][0] if i + 1 < len(PROG) else T_FLASH
    k = intensity_at(t0 + 0.01)
    chord_pad(ch, t0, t1, 0.11 + 0.08 * k, fc=1400 + 1400 * k, attack=0.25, release=0.3)
    # 16분 펄스: 근음-근음-5도-옥타브 패턴, 박 머리에 악센트
    steps = int(round((t1 - t0) / (BEAT / 4)))
    pattern = [0, 0, 7, 0, 12, 0, 7, 12]
    for s in range(steps):
        ts = t0 + s * BEAT / 4
        m = root + 24 + pattern[s % len(pattern)]
        acc = 1.0 if s % 4 == 0 else 0.62
        p = pluck(midi(m), fc=700 + 2300 * k, tau=0.05 + 0.03 * k)
        place(MUSIC, p, ts, 0.075 * acc * (0.7 + 0.5 * k), pan=0.25 if s % 2 else -0.25)
        place(SEND, p, ts, 0.03 * acc)
    # 서브 — 8분 근음
    for s in range(int(round((t1 - t0) / (BEAT / 2)))):
        ts = t0 + s * BEAT / 2
        nn = int(BEAT / 2 * SR * 0.95)
        sub = np.sin(2 * np.pi * midi(root) * tt(nn)) * ar(nn, 0.005, 0.06)
        place(MUSIC, sub, ts, 0.2 + 0.08 * k)

# 드럼
for b in range(int(round((T_FLASH - T_EVAL) / BEAT))):
    tb = T_EVAL + b * BEAT
    if tb >= T_FLASH - 0.01:
        break
    k = intensity_at(tb + 0.001)
    beat_in_bar = int(round((tb - OFF) / BEAT)) % 4
    if k < 0.6:
        if beat_in_bar in (0, 2):
            place(MUSIC, kick(), tb, 0.75)
            KICKS.append(tb)
    else:
        place(MUSIC, kick(), tb, 0.8)
        KICKS.append(tb)
        place(MUSIC, hat(), tb + BEAT / 2, 0.05 + 0.04 * k, pan=0.3)
        if beat_in_bar in (1, 3):
            place(MUSIC, taiko(0.9), tb, 0.32 * k)
            place(SEND, taiko(0.9), tb, 0.12 * k)
    if k >= 1.0:
        place(MUSIC, hat(), tb + BEAT / 4, 0.035, pan=-0.3)
        place(MUSIC, hat(), tb + 3 * BEAT / 4, 0.035, pan=-0.3)

# 장면 다운비트 임팩트(휩 착지)
for tb in (T_GRADE, T_CAP):
    place(MUSIC, taiko(1.4), tb, 0.6)
    place(SEND, taiko(1.4), tb, 0.25)
    KICKS.append(tb)

# 마지막 마디 타이코 필(16분 크레셴도) → 플래시 정점에서 끊김
fill_t0 = T_FLASH - BEAT * 1.5
s = 0
while fill_t0 + s * BEAT / 4 < T_FLASH - 0.02:
    ts = fill_t0 + s * BEAT / 4
    place(MUSIC, taiko(0.5), ts, 0.18 + 0.05 * s)
    s += 1

# 엔딩(17–20s) — F장조 해결, 밝은 패드 + 벨 아르페지오
chord_pad(FMAJ9, T_END, DUR, 0.22, fc=3200, attack=0.12, release=1.2, width=0.8)
place(MUSIC, np.sin(2 * np.pi * midi(29) * tt(int(3 * SR))) * ar(int(3 * SR), 0.05, 1.5), T_END, 0.28)
for j, m in enumerate([77, 81, 84, 88, 84, 81]):
    b = bell(midi(m), int(2.2 * SR), decay=1.0, bright=0.7)
    place(MUSIC, b, T_END + j * BEAT / 2, 0.07, pan=(-0.4 + 0.16 * j))
    place(SEND, b, T_END + j * BEAT / 2, 0.06)

# ---------- 효과음 ----------
def sfx_ticks(t0, t1, g):
    # 타임코드 롤과 같은 이징(smoothstep)으로 24번 — 가운데에서 가장 빠르다
    for i in range(1, 25):
        u = i / 25
        lo, hi = 0.0, 1.0
        for _ in range(30):
            mid = (lo + hi) / 2
            if mid * mid * (3 - 2 * mid) < u:
                lo = mid
            else:
                hi = mid
        ts = t0 + (t1 - t0) * lo
        nn = int(0.03 * SR)
        x = (np.sin(2 * np.pi * midi(93) * tt(nn)) + 0.4 * np.sin(2 * np.pi * midi(100) * tt(nn))) * np.exp(-tt(nn) / 0.006)
        place(SFX, x, ts, g * 0.38, pan=0.2 if i % 2 else -0.2)


def sfx_boom(t0, g):
    nn = int(1.6 * SR)
    t = tt(nn)
    f = 34 + 50 * np.exp(-t / 0.12)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45)
    x += fft_filter(noise(nn), 60, 500) * np.exp(-t / 0.08) * 0.4
    place(SFX, np.tanh(1.3 * x), t0, g * 0.4)
    place(SEND, x, t0, g * 0.2)
    KICKS.append(t0)


def sfx_chime(t0, g):
    for j, m in enumerate([81, 86]):
        b = bell(midi(m), int(1.6 * SR), decay=0.8)
        place(SFX, b, t0 + j * 0.09, g * 0.16, pan=0.15)
        place(SEND, b, t0 + j * 0.09, g * 0.12)


def sfx_riser(t0, t1, g):
    nn = int((t1 - t0) * SR)
    t = tt(nn)
    u = t / (t1 - t0)
    x = stft_filter(noise(nn), bandpass_gain(lambda tc: 300 * (8000 / 300) ** np.clip(tc / (t1 - t0), 0, 1), 0.7))
    tone = np.sin(2 * np.pi * np.cumsum(midi(50) * 2 ** (u * 2)) / SR) * 0.25
    x = (x * 0.9 + tone) * u**2.2 * ar(nn, 0.01, 0.03)
    place(SFX, np.stack([x, np.roll(x, 400)], 1), t0, g * 0.22)
    place(SEND, x, t0, g * 0.18)


def sfx_bell(t0, g, pitch):
    b = bell(midi(74) * pitch, int(1.8 * SR), decay=0.9)
    place(SFX, b, t0, g * 0.13, pan=0.0)
    place(SEND, b, t0, g * 0.12)


def sfx_suck(t0, g, dur):
    # 줌 스루 — 역방향 우시(점점 커지다 착지 직전에 끊김) + 착지 타이코
    nn = int(dur * SR)
    t = tt(nn)
    u = t / dur
    x = stft_filter(noise(nn), bandpass_gain(lambda tc: 600 * (5000 / 600) ** np.clip(tc / dur, 0, 1), 0.8)) * u**2.5
    place(SFX, np.stack([x, np.roll(x, 300)], 1), t0, g * 0.3)
    place(SFX, taiko(1.2), t0 + dur, g * 0.55)
    place(SEND, taiko(1.2), t0 + dur, g * 0.25)
    KICKS.append(t0 + dur)


def sfx_whip(t0, g, dur):
    nn = int(dur * SR)
    t = tt(nn)
    u = t / dur
    bell_env = np.sin(np.pi * u) ** 2
    x = stft_filter(noise(nn), bandpass_gain(lambda tc: 900 * (4 ** np.sin(np.pi * np.clip(tc / dur, 0, 1))), 0.9)) * bell_env
    pan_l = np.cos((1 - u) * np.pi / 2)
    pan_r = np.sin((1 - u) * np.pi / 2)
    place(SFX, np.stack([x * pan_l, x * pan_r], 1) * 1.4, t0, g * 0.32)


def sfx_scan(t0, t1, g):
    nn = int((t1 - t0) * SR)
    t = tt(nn)
    u = t / (t1 - t0)
    x = np.sin(2 * np.pi * np.cumsum(midi(69) * 2 ** (u * 1.0)) / SR) * 0.3
    x += stft_filter(noise(nn), bandpass_gain(lambda tc: 1500 * 2 ** np.clip(tc / (t1 - t0), 0, 1) * 2, 0.5)) * 0.4
    x *= np.sin(np.pi * u) ** 1.5
    place(SFX, x, t0, g * 0.09, pan=-0.2)


def sfx_roll(t0, t1, g):
    # 숫자 롤 — 점점 느려지는 작은 틱
    ts = t0
    step = 0.035
    while ts < t1:
        nn = int(0.02 * SR)
        x = np.sin(2 * np.pi * midi(98) * tt(nn)) * np.exp(-tt(nn) / 0.004)
        place(SFX, x, ts, g * 0.05, pan=0.25)
        ts += step
        step *= 1.12


def sfx_pop(t0, g, pitch):
    nn = int(0.18 * SR)
    t = tt(nn)
    f = midi(81) * pitch * (1 + 0.6 * np.exp(-t / 0.012))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05)
    place(SFX, x, t0, g * 0.1)
    place(SEND, x, t0, g * 0.05)


def sfx_stamp(t0, g, pitch):
    nn = int(0.35 * SR)
    t = tt(nn)
    f = midi(50) * pitch * (1 + 1.2 * np.exp(-t / 0.01))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.07)
    x += fft_filter(noise(nn), 1200, 5000) * np.exp(-t / 0.004) * 0.6
    x += 0.25 * bell(midi(74) * pitch, nn, decay=0.25)
    place(SFX, np.tanh(1.5 * x), t0, g * 0.24, pan=0.15)
    place(SEND, x, t0, g * 0.06)


def sfx_type(t0, t1, g):
    ts = t0
    while ts < t1:
        nn = int(0.012 * SR)
        x = fft_filter(noise(nn), 2500, 9000) * np.exp(-tt(nn) / 0.002)
        place(SFX, x, ts, g * 0.05 * rng.uniform(0.6, 1.0), pan=rng.uniform(-0.3, 0.3))
        ts += rng.uniform(0.045, 0.085)


def sfx_hit(t0, g):
    place(SFX, taiko(1.0), t0, g * 0.4)
    for j, m in enumerate([74, 77, 81]):
        b = bell(midi(m), int(1.8 * SR), decay=0.9, bright=0.8)
        place(SFX, b, t0 + j * 0.03, g * 0.08, pan=(j - 1) * 0.3)
        place(SEND, b, t0 + j * 0.03, g * 0.08)
    KICKS.append(t0)


def sfx_blip(t0, g, pitch):
    b = bell(midi(81) * pitch, int(0.6 * SR), decay=0.25, bright=0.5)
    place(SFX, b, t0, g * 0.08, pan=0.3)
    place(SEND, b, t0, g * 0.05)


def sfx_flash(t0, g, dur):
    # 플래시 — 역방향 심벌 스웰이 정점(전환 중간)에서 끊기고, 반짝이는 벨 클러스터
    peak = t0 + dur / 2
    nn = int((peak - t0 + 0.6) * SR)
    t = tt(nn)
    sw = fft_filter(noise(nn), 4000, 16000) * np.clip(t / (peak - t0 + 0.6), 0, 1) ** 3
    place(SFX, np.stack([sw, np.roll(sw, 500)], 1), peak - (peak - t0 + 0.6), g * 0.22)
    for j, m in enumerate([84, 89, 91, 96]):
        b = bell(midi(m), int(1.5 * SR), decay=0.7, bright=0.6)
        place(SFX, b, peak + j * 0.025, g * 0.05, pan=(j - 1.5) * 0.25)
        place(SEND, b, peak + j * 0.025, g * 0.08)


def sfx_click(t0, g):
    nn = int(0.03 * SR)
    c = fft_filter(noise(nn), 1500, 7000) * np.exp(-tt(nn) / 0.003)
    place(SFX, c, t0, g * 0.25, pan=0.2)
    b = bell(midi(89), int(2.0 * SR), decay=1.0, bright=0.6)
    place(SFX, b, t0 + 0.02, g * 0.12)
    place(SEND, b, t0 + 0.02, g * 0.12)


for s in CUES["sfx"]:
    k = s["kind"]
    t0 = cue(s["at"])
    t1 = cue(s["to"]) if "to" in s else None
    g = s.get("gain", 1.0)
    p = s.get("pitch", 1.0)
    if k == "drone":
        continue  # 음악 파트에서 처리
    elif k == "ticks":
        sfx_ticks(t0, t1, g)
    elif k == "boom":
        sfx_boom(t0, g)
    elif k == "chime":
        sfx_chime(t0, g)
    elif k == "riser":
        sfx_riser(t0, t1 - 0.03, g)
    elif k == "impact":
        continue  # 드롭은 음악 파트에서 처리
    elif k == "bell":
        sfx_bell(t0, g, p)
    elif k == "suck":
        sfx_suck(t0, g, TRANS[1] / FPS)
    elif k == "whip":
        idx = int(s["at"].split(".")[1])
        sfx_whip(t0, g, TRANS[idx - 1] / FPS)
    elif k == "scan":
        sfx_scan(t0, t1, g)
    elif k == "roll":
        sfx_roll(t0, t1, g)
    elif k == "pop":
        sfx_pop(t0, g, p)
    elif k == "stamp":
        sfx_stamp(t0, g, p)
    elif k == "type":
        sfx_type(t0, t1, g)
    elif k == "hit":
        sfx_hit(t0, g)
    elif k == "blip":
        sfx_blip(t0, g, p)
    elif k == "flash":
        sfx_flash(t0, g, TRANS[4] / FPS)
    elif k == "click":
        sfx_click(t0, g)
    else:
        raise SystemExit(f"unknown sfx kind: {k}")

# ---------- 믹스 ----------
# 사이드체인 — 킥·타이코·임팩트마다 음악 버스를 살짝 눌러 펀치를 만든다
t = tt(N)
duck = np.ones(N)
for kt in KICKS:
    i0 = int(kt * SR)
    seg = t[i0:] - kt
    duck[i0:] *= 1 - 0.35 * np.exp(-seg / 0.16)
music = MUSIC * duck[:, None]


def reverb_ir(seconds=2.6, predelay=0.025):
    n = int(seconds * SR)
    tl = tt(n)
    chans = []
    for _ in range(2):
        x = noise(n) * np.exp(-tl * 6.9 / seconds)
        x = fft_filter(x, 120, 7000)
        chans.append(np.concatenate([np.zeros(int(predelay * SR)), x]))
    ir = np.stack(chans, 1)
    return ir / np.sqrt(np.sum(ir**2) / 2)


def convolve(x, ir):
    n = len(x) + len(ir) - 1
    nfft = 1 << (n - 1).bit_length()
    out = np.zeros((len(x), 2))
    for c in range(2):
        y = np.fft.irfft(np.fft.rfft(x[:, c], nfft) * np.fft.rfft(ir[:, c], nfft), nfft)
        out[:, c] = y[: len(x)]
    return out


wet = convolve(SEND, reverb_ir()) * 0.32
mix = music + SFX + wet

# 페이드: 시작은 바로, 끝은 0.5s
fade = int(0.5 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]

# 소프트 클립 후 라우드니스 정규화(-14 LUFS, 트루피크 -1.5 dBTP)
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.9
mix = np.tanh(1.2 * mix) / np.tanh(1.2)


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


with tempfile.TemporaryDirectory() as tmp:
    raw = os.path.join(tmp, "raw.wav")
    write_wav(raw, mix)
    probe = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
        capture_output=True,
        text=True,
        check=True,
    ).stderr
    m = json.loads(probe[probe.rindex("{") : probe.rindex("}") + 1])
    af = (
        "loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:"
        f"measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}"
    )
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", af, "-ar", str(SR), "-c:a", "pcm_s16le", OUT], check=True)

print(f"wrote {OUT} ({DUR:.1f}s) · drop {T_DROP:.2f}s · scenes {[round(x, 2) for x in (T_EVAL, T_GRADE, T_CAP, T_END)]}")

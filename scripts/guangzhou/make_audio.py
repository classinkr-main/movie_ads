"""Original BGM + SFX + ambience mix for the Guangzhou vlog (30s, 120 BPM).

Everything is synthesized here (no samples), so the track is license-free.
Timing comes from src/guangzhou/timeline.json: bar downbeats sit on
firstDownbeat + 60k frames, so every cut lands on the grid.

Usage: python3 make_audio.py <ambience_dir> <out_wav>
"""
import json
import os
import sys

import numpy as np
from scipy import signal

SR = 48000
ROOT = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(ROOT, "../../src/guangzhou/timeline.json")))
FPS = TL["fps"]
DUR = TL["frames"] / FPS
BEAT = 60.0 / TL["bpm"]
S16 = BEAT / 4
T0 = TL["firstDownbeat"] / FPS  # first bar downbeat (s)
N = int(SR * (DUR + 0.05))
rng = np.random.default_rng(7)


def tb(bar, pos16=0.0):
    """time of a 16th position inside a bar (bar 0 starts at T0; bar -1 is the pickup)"""
    return T0 + bar * 4 * BEAT + pos16 * S16


def tf(frame):
    return frame / FPS


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6,
        "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}


def n2m(name):
    p, o = name[:-1], int(name[-1])
    return 12 * (o + 1) + NOTE[p]


# ---------------------------------------------------------------- buses
def bus():
    return np.zeros((N, 2), np.float32)


def add(dst, x, t, gain=1.0, pan=0.0):
    """mix mono (n,) or stereo (n,2) x into dst at time t (s)"""
    i = int(round(t * SR))
    if i >= N:
        return
    if x.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4)
        r = np.sin((pan + 1) * np.pi / 4)
        x = np.stack([x * l * 1.414, x * r * 1.414], 1)
    j0 = max(0, -i)
    i = max(i, 0)
    n = min(len(x) - j0, N - i)
    if n > 0:
        dst[i:i + n] += gain * x[j0:j0 + n]


# ---------------------------------------------------------------- dsp helpers
def env_exp(n, tau, attack=0.002):
    t = np.arange(n) / SR
    a = np.clip(t / attack, 0, 1) if attack > 0 else 1.0
    return (a * np.exp(-t / tau)).astype(np.float32)


def adsr(n, a, d, s, r, hold):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / d, s))
    rel = np.clip((t - hold) / r, 0, 1)
    return (e * (1 - rel)).astype(np.float32)


def bq(kind, f, q=0.707, gain_db=0.0):
    f = min(max(f, 10.0), SR * 0.45)
    w = 2 * np.pi * f / SR
    al = np.sin(w) / (2 * q)
    c = np.cos(w)
    A = 10 ** (gain_db / 40)
    if kind == "lp":
        b = [(1 - c) / 2, 1 - c, (1 - c) / 2]; a = [1 + al, -2 * c, 1 - al]
    elif kind == "hp":
        b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]; a = [1 + al, -2 * c, 1 - al]
    elif kind == "bp":
        b = [al, 0, -al]; a = [1 + al, -2 * c, 1 - al]
    elif kind == "peak":
        b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]
    elif kind == "lshelf":
        sq = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) - (A - 1) * c + sq), 2 * A * ((A - 1) - (A + 1) * c), A * ((A + 1) - (A - 1) * c - sq)]
        a = [(A + 1) + (A - 1) * c + sq, -2 * ((A - 1) + (A + 1) * c), (A + 1) + (A - 1) * c - sq]
    else:
        raise ValueError(kind)
    return np.array(b) / a[0], np.array(a) / a[0]


def filt(x, kind, f, q=0.707, gain_db=0.0):
    b, a = bq(kind, f, q, gain_db)
    return signal.lfilter(b, a, x, axis=0).astype(np.float32)


def sweep_filter(x, kind, f_start, f_end, q=0.707, block=256, curve="exp"):
    """time-varying biquad, block-wise with carried state (mono)"""
    y = np.zeros_like(x)
    zi = np.zeros(2)
    nb = (len(x) + block - 1) // block
    for k in range(nb):
        u = k / max(nb - 1, 1)
        f = f_start * (f_end / f_start) ** u if curve == "exp" else f_start + (f_end - f_start) * u
        b, a = bq(kind, f, q)
        seg = x[k * block:(k + 1) * block]
        y[k * block:k * block + len(seg)], zi = signal.lfilter(b, a, seg, zi=zi)
    return y


def polyblep_saw(f, n, phase=None):
    phase = rng.random() if phase is None else phase
    dt = f / SR
    p = (phase + dt * np.arange(n)) % 1.0
    y = 2 * p - 1
    m = p < dt
    x = p[m] / dt
    y[m] -= x + x - x * x - 1
    m = p > 1 - dt
    x = (p[m] - 1) / dt
    y[m] -= x * x + x + x + 1
    return y.astype(np.float32)


def sine(f, n, phase=0.0):
    return np.sin(2 * np.pi * (f * np.arange(n) / SR + phase)).astype(np.float32)


def noise(n):
    return rng.standard_normal(n).astype(np.float32)


def make_ir(seconds=2.2, predelay=0.018, damp=6500, seed=3):
    r = np.random.default_rng(seed)
    n = int(SR * seconds)
    t = np.arange(n) / SR
    ir = np.zeros((n + int(predelay * SR), 2), np.float32)
    for ch in range(2):
        nz = r.standard_normal(n).astype(np.float32) * np.exp(-t / (seconds / 6.9))
        nz = signal.lfilter(*bq("lp", damp), nz)
        ir[int(predelay * SR):, ch] = nz
    ir /= np.sqrt((ir ** 2).sum() / 2)
    return ir


IR_HALL = make_ir(2.4, 0.022, 5500)
IR_ROOM = make_ir(0.9, 0.008, 7000, seed=5)


def reverb(x, ir, wet):
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    out = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return (out * wet).astype(np.float32)


def delay_pingpong(x, t, fb=0.38, taps=5, hp=500, lp=6000):
    """stereo ping-pong delay (mono in -> stereo out wet)"""
    d = int(t * SR)
    src = filt(filt(x, "hp", hp), "lp", lp)
    out = np.zeros((len(x), 2), np.float32)
    for k in range(1, taps + 1):
        g = fb ** k
        ch = (k - 1) % 2
        if d * k < len(x):
            out[d * k:, ch] += g * src[:len(x) - d * k]
    return out


def soft(x, drive=1.0):
    return np.tanh(x * drive) / np.tanh(drive)


# ---------------------------------------------------------------- instruments
def kick(punch=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t / 0.035) + 40 * np.exp(-t / 0.006)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.26) * np.clip(t / 0.0015, 0, 1)
    click = filt(noise(n), "hp", 3500) * np.exp(-t / 0.004) * 0.35 * punch
    return soft((body + click).astype(np.float32), 1.6) * 0.95


def clap():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    nz = filt(noise(n), "bp", 1500, 0.9)
    e = np.zeros(n, np.float32)
    for off in (0.0, 0.009, 0.018):
        e += np.where(t >= off, np.exp(-(t - off) / 0.006), 0)
    e += np.where(t >= 0.024, 0.55 * np.exp(-(t - 0.024) / 0.12), 0)
    return (nz * e * 0.9).astype(np.float32)


def snare(tone=190):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    nz = filt(filt(noise(n), "hp", 900), "lp", 7000) * np.exp(-t / 0.11)
    body = sine(tone, n) * np.exp(-t / 0.06)
    return ((nz * 0.8 + body * 0.6) * np.clip(t / 0.001, 0, 1)).astype(np.float32)


def hat(open_=False):
    n = int((0.35 if open_ else 0.08) * SR)
    t = np.arange(n) / SR
    nz = filt(filt(noise(n), "hp", 7200), "peak", 10500, 1.0, 5)
    return (nz * np.exp(-t / (0.16 if open_ else 0.028)) * 0.55).astype(np.float32)


def shaker():
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    nz = filt(filt(noise(n), "hp", 4500), "lp", 11000)
    e = np.clip(t / 0.008, 0, 1) * np.exp(-t / 0.035)
    return (nz * e * 0.35).astype(np.float32)


def wood(f=820):
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    y = sine(f, n) * np.exp(-t / 0.03) + 0.5 * sine(f * 2.37, n) * np.exp(-t / 0.015)
    return (y * 0.35).astype(np.float32)


def pluck(m, dur, bright=1.0):
    """additive pluck: harmonics decay faster the higher they are"""
    f = mtof(m)
    n = int((dur + 0.6) * SR)
    t = np.arange(n) / SR
    y = np.zeros(n, np.float32)
    for k in range(1, 24):
        fk = f * k
        if fk > SR * 0.45:
            break
        amp = (1.0 / k) * (1 if k % 2 else 0.6)
        dec = 0.55 / (1 + 0.55 * k * bright)
        y += (amp * np.sin(2 * np.pi * fk * t + rng.random() * 0.3) * np.exp(-t / dec)).astype(np.float32)
    rel = np.clip((t - dur) / 0.25, 0, 1)
    return (y * (1 - rel) * np.clip(t / 0.002, 0, 1) * 0.5).astype(np.float32)


def supersaw_chord(midis, dur, cutoff=5200, voices=7, detune=0.18, att=0.004, rel=0.08):
    n = int((dur + rel + 0.02) * SR)
    L = np.zeros(n, np.float32)
    R = np.zeros(n, np.float32)
    for m in midis:
        f0 = mtof(m)
        for v in range(voices):
            dc = (v - (voices - 1) / 2) / ((voices - 1) / 2) * detune  # semitones
            x = polyblep_saw(f0 * 2 ** (dc / 12), n)
            pan = (v - (voices - 1) / 2) / ((voices - 1) / 2)
            L += x * (0.5 - 0.45 * pan)
            R += x * (0.5 + 0.45 * pan)
    e = adsr(n, att, 0.12, 0.75, rel, dur)
    st = np.stack([L * e, R * e], 1) / (len(midis) * voices) * 2.2
    st = filt(filt(st, "lp", cutoff, 0.8), "hp", 160)
    return st.astype(np.float32)


def pad(midis, dur, cutoff=1800):
    n = int((dur + 0.6) * SR)
    L = np.zeros(n, np.float32)
    R = np.zeros(n, np.float32)
    for m in midis:
        f0 = mtof(m)
        for d, p in ((-0.09, -0.8), (0.0, 0.0), (0.09, 0.8)):
            x = polyblep_saw(f0 * 2 ** (d / 12), n) * 0.6 + sine(f0, n) * 0.4
            L += x * (0.5 - 0.4 * p)
            R += x * (0.5 + 0.4 * p)
    e = adsr(n, 0.35, 0.4, 0.8, 0.5, dur)
    st = np.stack([L * e, R * e], 1) / (len(midis) * 3)
    return filt(filt(st, "lp", cutoff, 0.6), "hp", 180).astype(np.float32)


def bass_note(m, dur):
    f = mtof(m)
    n = int((dur + 0.05) * SR)
    x = sine(f, n) * 0.85 + filt(polyblep_saw(f, n), "lp", 520, 0.9) * 0.35
    e = adsr(n, 0.004, 0.12, 0.7, 0.03, dur)
    return soft(x * e, 1.3).astype(np.float32) * 0.8


def impact(size=1.0):
    n = int(2.6 * SR)
    t = np.arange(n) / SR
    f = 32 + 48 * np.exp(-t / 0.25)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7) * np.clip(t / 0.002, 0, 1)
    crash = filt(filt(noise(n), "hp", 2500), "lp", 12000) * np.exp(-t / 0.9) * 0.22
    hit = filt(noise(n), "lp", 900) * np.exp(-t / 0.05) * 0.6
    x = (boom * 0.95 + hit) * size
    st = np.stack([x + crash, x + np.roll(crash, 37)], 1).astype(np.float32)
    return st + reverb(st[:, 0] * 0.5, IR_HALL, 0.35)


def riser(dur, f0=300, f1=9000, pitch=True):
    n = int(dur * SR)
    t = np.arange(n) / SR
    u = t / dur
    nz = sweep_filter(noise(n), "bp", f0, f1, q=1.6)
    amp = u ** 2.2
    y = nz * amp * 0.9
    if pitch:
        fr = 110 * 2 ** (u * 3.0)
        ph = np.cumsum(fr) / SR
        saws = sum(((2 * ((ph * 2 ** (d / 12)) % 1) - 1) for d in (-0.15, 0, 0.15)))
        y = y + filt(saws.astype(np.float32), "lp", 3000) * amp * 0.12
    st = np.stack([y, np.roll(y, 211)], 1).astype(np.float32)
    return st + reverb(y * 0.6, IR_HALL, 0.25)


def reverse_cymbal(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    nz = filt(filt(noise(n), "hp", 3800), "lp", 13000)
    e = np.exp((t - dur) / (dur * 0.28))
    y = nz * e * 0.45
    return np.stack([y, np.roll(y, 97)], 1).astype(np.float32)


def whoosh(dur=0.42, f_peak=3500, pan_from=-0.6, pan_to=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    u = t / dur
    nz = noise(n)
    f = 400 * (f_peak / 400) ** np.sin(np.pi * u)
    y = np.zeros(n, np.float32)
    zi = np.zeros(2)
    blk = 128
    for k in range(0, n, blk):
        b, a = bq("bp", float(f[k]), 1.1)
        y[k:k + blk], zi = signal.lfilter(b, a, nz[k:k + blk], zi=zi)
    e = np.sin(np.pi * u) ** 1.6
    y = y * e * 0.9
    p = pan_from + (pan_to - pan_from) * u
    st = np.stack([y * np.cos((p + 1) * np.pi / 4), y * np.sin((p + 1) * np.pi / 4)], 1) * 1.4
    return st.astype(np.float32)


def shutter():
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    y = np.zeros(n, np.float32)
    for off, g in ((0.0, 1.0), (0.055, 0.7)):
        m = t >= off
        tt = t[m] - off
        y[m] += g * (filt(noise(m.sum()), "bp", 3200, 1.8) * np.exp(-tt / 0.006)
                     + 0.4 * filt(noise(m.sum()), "hp", 6000) * np.exp(-tt / 0.002))
    return (y * 0.7).astype(np.float32)


def pop(f0=1100, f1=380):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.012)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03) * np.clip(t / 0.001, 0, 1)
    return (y * 0.5).astype(np.float32)


def scribble(dur=0.32):
    """펜 긁는 소리 — 대역통과 노이즈를 획 단위로 끊는다"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    nz = filt(filt(noise(n), "bp", 2600, 0.9), "hp", 900)
    strokes = 0.55 + 0.45 * np.sin(2 * np.pi * 15 * t + 2.0 * np.sin(2 * np.pi * 4 * t))
    e = np.clip(t / 0.01, 0, 1) * np.clip((dur - t) / 0.06, 0, 1)
    return (nz * strokes * e * 0.35).astype(np.float32)


def chime(m=88):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    fc = mtof(m)
    idx = 2.2 * np.exp(-t / 0.25)
    y = np.sin(2 * np.pi * fc * t + idx * np.sin(2 * np.pi * fc * 3.5 * t)) * np.exp(-t / 0.55)
    y += 0.5 * np.sin(2 * np.pi * fc * 2.0 * t) * np.exp(-t / 0.3)
    y = y * 0.3
    return (np.stack([y, y], 1) + reverb(y, IR_HALL, 0.3)).astype(np.float32)


def plane(dur=2.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    u = t / dur
    nz = sweep_filter(noise(n), "lp", 600, 4500, q=0.9) * 0.5
    nz = nz * (0.5 + 0.5 * np.sin(np.pi * u)) * np.sin(np.pi * u) ** 0.7
    tone = filt(polyblep_saw(140, n), "lp", 900) * 0.05 * np.sin(np.pi * u)
    y = nz + tone
    p = -0.8 + 1.6 * u
    st = np.stack([y * np.cos((p + 1) * np.pi / 4), y * np.sin((p + 1) * np.pi / 4)], 1) * 1.3
    return st.astype(np.float32)


def tape_stop_glitch():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    y = filt(noise(n), "bp", 1800, 3) * (np.sin(2 * np.pi * 60 * t) > 0) * np.exp(-t / 0.05)
    return (y * 0.5).astype(np.float32)


# ---------------------------------------------------------------- song data
F = lambda *ns: [n2m(x) for x in ns]
CH = {
    "F": dict(tri=F("F3", "A3", "C4", "F4"), stab=F("A3", "C4", "F4", "A4"), bass=n2m("F1")),
    "C": dict(tri=F("E3", "G3", "C4", "E4"), stab=F("G3", "C4", "E4", "G4"), bass=n2m("C1")),
    "Dm": dict(tri=F("D3", "F3", "A3", "D4"), stab=F("F3", "A3", "D4", "F4"), bass=n2m("D1")),
    "Bb": dict(tri=F("D3", "F3", "Bb3", "D4"), stab=F("F3", "Bb3", "D4", "F4"), bass=n2m("Bb0")),
    "Gm": dict(tri=F("D3", "G3", "Bb3", "D4"), stab=F("G3", "Bb3", "D4", "G4"), bass=n2m("G1")),
    "Csus": dict(tri=F("F3", "G3", "C4", "F4"), stab=F("G3", "C4", "F4", "G4"), bass=n2m("C1")),
}
# per bar: list of (chord, start16, len16)
PROG = {
    0: [("Dm", 0, 16)],
    1: [("Bb", 0, 8), ("C", 8, 8)],
    2: [("F", 0, 16)], 3: [("C", 0, 16)], 4: [("Dm", 0, 16)], 5: [("Bb", 0, 16)],
    6: [("F", 0, 16)], 7: [("C", 0, 16)], 8: [("Dm", 0, 16)], 9: [("Bb", 0, 16)],
    10: [("Gm", 0, 16)], 11: [("Csus", 0, 8), ("C", 8, 8)],
    12: [("F", 0, 16)], 13: [("Bb", 0, 8), ("C", 8, 8)], 14: [("F", 0, 8)],
}
# melody (bar, pos16, len16, note)
MEL_A = [
    (0, 2, "A4"), (2, 2, "C5"), (4, 3, "F5"), (7, 1, "E5"), (8, 2, "D5"), (10, 2, "C5"), (12, 4, "A4")]
MEL_B = [
    (0, 2, "G4"), (2, 2, "C5"), (4, 3, "E5"), (7, 1, "D5"), (8, 2, "C5"), (10, 2, "G4"), (12, 4, "E4")]
MEL_C = [
    (0, 2, "F4"), (2, 2, "A4"), (4, 3, "D5"), (7, 1, "C5"), (8, 2, "A4"), (10, 2, "D5"), (12, 4, "F5")]
MEL_D = [
    (0, 2, "F5"), (2, 2, "D5"), (4, 2, "Bb4"), (6, 2, "C5"), (8, 4, "D5"), (12, 2, "C5"), (14, 2, "A4")]
MEL_HOOK = {
    12: [(0, 2, "C5"), (2, 2, "F5"), (4, 4, "A5"), (8, 2, "G5"), (10, 2, "F5"), (12, 4, "C5")],
    13: [(0, 2, "D5"), (2, 2, "F5"), (4, 4, "Bb5"), (8, 2, "G5"), (10, 2, "E5"), (12, 4, "C5")],
    14: [(0, 8, "F5")],
}


def chords_in(bar):
    return PROG.get(bar, [])


def render(amb_dir):
    drums, bass_b, chord_b, lead_b, pad_b, fx_b, amb_b = (bus() for _ in range(7))
    kick_times = []

    K, CL, SN = kick(), clap(), snare()
    HC, HO, SH, WB = hat(False), hat(True), shaker(), wood()

    def groove_bar(b, full=True, hats=True, perc=True, kick_on=True):
        for q in range(4):
            if kick_on:
                add(drums, K, tb(b, q * 4), 1.0)
                kick_times.append(tb(b, q * 4))
            if full and q in (1, 3):
                add(drums, CL, tb(b, q * 4), 0.55, 0.05)
                add(drums, reverb(CL, IR_ROOM, 0.25), tb(b, q * 4), 0.6)
        if hats:
            for s in range(16):
                vel = 0.55 if s % 2 else 0.28
                if s % 4 == 2:
                    add(drums, HO, tb(b, s), 0.32, 0.25)
                else:
                    add(drums, HC, tb(b, s), vel * 0.55, 0.3 if s % 2 else -0.2)
        if perc:
            for s in (0, 3, 6, 10, 12):
                add(drums, WB, tb(b, s), 0.32, -0.45)
            for s in range(16):
                add(drums, SH, tb(b, s), 0.30 if s % 2 else 0.18, 0.5)

    # ---- pickup (frames 0-30): reverse swell + soft pluck arpeggio
    add(fx_b, reverse_cymbal(1.0), 0.0, 0.8)
    for i, nm in enumerate(["C5", "A4", "F4", "D5"]):
        add(lead_b, pluck(n2m(nm), 0.2, 0.7), tb(-1, 8 + i * 2), 0.32, -0.3 + i * 0.2)

    # ---- intro bars 0-1: filtered chords, shaker, rim, kick on 1
    for b in (0, 1):
        for (c, s0, ln) in chords_in(b):
            add(pad_b, pad(CH[c]["tri"], ln * S16, cutoff=1200 + 600 * b), tb(b, s0), 0.38)
            for s in (0, 3, 6, 10, 12):
                if s0 <= s < s0 + ln:
                    st = supersaw_chord(CH[c]["stab"], S16 * 1.5, cutoff=1500 + 900 * b)
                    add(chord_b, st, tb(b, s), 0.45)
            add(bass_b, bass_note(CH[c]["bass"] + 12, BEAT * 0.9), tb(b, s0), 0.3)
        add(drums, K, tb(b, 0), 0.6)
        kick_times.append(tb(b, 0))
        for s in range(16):
            add(drums, SH, tb(b, s), 0.26 if s % 2 else 0.14, 0.4)
        add(drums, WB, tb(b, 4), 0.35, -0.4)
        add(drums, WB, tb(b, 12), 0.35, -0.4)
    # arpeggio in the hook (bar 0) - airy plucks
    arp = ["D4", "F4", "A4", "D5", "A4", "F4", "A4", "C5"]
    for s in range(0, 16, 2):
        add(lead_b, pluck(n2m(arp[s // 2]), 0.18, 0.8), tb(0, s), 0.26, -0.4 if s % 4 else 0.4)
    arp2 = ["D4", "F4", "Bb4", "D5", "E4", "G4", "C5", "E5"]
    for s in range(0, 16, 2):
        add(lead_b, pluck(n2m(arp2[s // 2]), 0.18, 0.8), tb(1, s), 0.28, -0.4 if s % 4 else 0.4)
    # build into the title drop: snare roll + riser + plane fly-by on the map
    for i, s in enumerate(np.concatenate([np.arange(8, 12, 1.0), np.arange(12, 16, 0.5)])):
        add(drums, SN, tb(1, s), 0.12 + 0.30 * i / 12, 0.0)
    add(fx_b, riser(1.95), tb(1, 0) + 0.05, 0.55)
    add(fx_b, plane(1.9), tf(92), 0.38)

    # ---- drop 1 + main grooves (bars 2-10)
    add(fx_b, impact(1.0), tb(2, 0), 0.85)
    for b in range(2, 11):
        groove_bar(b, full=True, hats=True, perc=(b >= 6))
        for (c, s0, ln) in chords_in(b):
            # pumping offbeat stabs
            for s in range(s0, s0 + ln):
                if s % 4 == 2:
                    add(chord_b, supersaw_chord(CH[c]["stab"], S16 * 1.6, cutoff=5200), tb(b, s), 0.55)
            add(pad_b, pad(CH[c]["tri"], ln * S16, cutoff=2400), tb(b, s0), 0.35)
            # octave bass on 8ths
            for s in range(s0, s0 + ln, 2):
                m = CH[c]["bass"] + (12 if (s // 2) % 2 else 0)
                add(bass_b, bass_note(m + 12, S16 * 1.7), tb(b, s), 0.55)
        # melody
        mel = {2: MEL_A, 3: MEL_B, 4: MEL_C, 5: MEL_D, 6: MEL_A, 7: MEL_B, 8: MEL_C, 9: MEL_D}.get(b)
        if mel:
            for (s, ln, nm) in mel:
                gain = 0.40 if b < 6 else 0.46
                p = pluck(n2m(nm), ln * S16 * 0.9, 1.0)
                add(lead_b, p, tb(b, s), gain, 0.0)
                if b >= 6:  # octave double for lift in the second phrase
                    add(lead_b, pluck(n2m(nm) + 12, ln * S16 * 0.9, 1.2), tb(b, s), 0.12, 0.3)
        if b == 10:  # B-part arp
            arpg = ["G4", "Bb4", "D5", "G5", "D5", "Bb4", "D5", "F5"]
            for s in range(0, 16, 2):
                add(lead_b, pluck(n2m(arpg[s // 2]), 0.2, 1.0), tb(b, s), 0.36, -0.3 if s % 4 else 0.3)

    # ---- build bar 11: half-time kick, snare roll, riser, filter-y chords, gap before drop
    for q in range(2):
        add(drums, K, tb(11, q * 8), 0.9)
        kick_times.append(tb(11, q * 8))
    roll = list(np.arange(0, 8, 2.0)) + list(np.arange(8, 12, 1.0)) + list(np.arange(12, 15, 0.5))
    for i, s in enumerate(roll):
        add(drums, SN, tb(11, s), 0.10 + 0.34 * i / len(roll), 0.0)
    for (c, s0, ln) in chords_in(11):
        for s in range(s0, s0 + ln, 2):
            add(chord_b, supersaw_chord(CH[c]["stab"], S16 * 1.2, cutoff=1800 + 300 * s), tb(11, s), 0.42)
        add(bass_b, bass_note(CH[c]["bass"] + 12, ln * S16 * 0.9), tb(11, s0), 0.5)
    add(fx_b, riser(1.85, 250, 10000), tb(11, 0) + 0.1, 0.65)

    # ---- drop 2 (bar 12-13) brand message + end card, final hit bar 14
    add(fx_b, impact(1.1), tb(12, 0), 0.9)
    for b in (12, 13):
        groove_bar(b, full=True, hats=True, perc=True, kick_on=True)
        for (c, s0, ln) in chords_in(b):
            for s in range(s0, s0 + ln):
                if s % 4 == 2:
                    add(chord_b, supersaw_chord(CH[c]["stab"], S16 * 1.6, cutoff=6500), tb(b, s), 0.6)
            add(pad_b, pad(CH[c]["tri"], ln * S16, cutoff=3000), tb(b, s0), 0.42)
            for s in range(s0, s0 + ln, 2):
                m = CH[c]["bass"] + (12 if (s // 2) % 2 else 0)
                add(bass_b, bass_note(m + 12, S16 * 1.7), tb(b, s), 0.58)
    for b in (12, 13, 14):
        for (s, ln, nm) in MEL_HOOK[b]:
            add(lead_b, pluck(n2m(nm), ln * S16 * 0.9, 1.0), tb(b, s), 0.5, 0.0)
            add(lead_b, pluck(n2m(nm) - 12, ln * S16 * 0.9, 0.8), tb(b, s), 0.22, -0.2)
    # final hit
    add(drums, K, tb(14, 0), 1.0)
    kick_times.append(tb(14, 0))
    add(fx_b, impact(0.9), tb(14, 0), 0.75)
    add(chord_b, supersaw_chord(CH["F"]["stab"] + [n2m("C5")], 0.9, cutoff=7000, rel=0.6), tb(14, 0), 0.75)
    add(pad_b, pad(CH["F"]["tri"], 0.9, cutoff=3200), tb(14, 0), 0.5)
    add(bass_b, bass_note(CH["F"]["bass"] + 12, 0.8), tb(14, 0), 0.6)
    add(fx_b, chime(84), tf(836), 0.55)  # CTA 버튼 등장

    # ---- transition SFX from the timeline
    for sh in TL["shots"]:
        f = sh["from"]
        kind = sh["in"]
        if kind in ("whipLeft", "whipUp"):
            add(fx_b, whoosh(0.36, 4200, 0.7, -0.7), tf(f) - 0.2, 0.55)
        elif kind == "zoomThrough":
            add(fx_b, whoosh(0.5, 2600, -0.2, 0.2), tf(f) - 0.25, 0.6)
        elif kind == "zoomBlur":
            add(fx_b, whoosh(0.4, 3000, 0.0, 0.0), tf(f) - 0.22, 0.5)
        elif kind == "dayWipe":
            add(fx_b, whoosh(0.45, 3800, -0.7, 0.7), tf(f) - 0.25, 0.55)
        elif kind == "greenWipe":
            add(fx_b, whoosh(0.5, 2400, -0.5, 0.5), tf(f) - 0.25, 0.5)
        elif kind == "shutter":
            add(fx_b, shutter(), tf(f), 0.75, 0.15)
        elif kind == "punch":
            add(fx_b, tape_stop_glitch(), tf(f), 0.12, 0.0)
    # text SFX — Remotion 자막 등장 프레임과 1:1
    for i, f in enumerate((5, 18, 34, 104, 156, 163, 334, 438, 470, 574, 648, 663, 754, 766, 812, 832)):
        add(fx_b, pop(1000 + 160 * (i % 3), 360 + 40 * (i % 2)), tf(f), 0.2, 0.12 * ((i % 3) - 1))
    for f in (66, 216, 274, 364, 513, 604, 707):
        add(fx_b, scribble(), tf(f), 0.5, 0.1)
    add(fx_b, pop(1500, 500), tf(128), 0.28, -0.2)  # 광저우 핀
    add(fx_b, whoosh(0.3, 2000, 0.0, 0.0), tf(820), 0.35)  # 로고 등장

    # ---- ambience from the shots themselves
    def amb(name, src_t, at, length, gain):
        p = os.path.join(amb_dir, name)
        if not os.path.exists(p):
            return
        import wave
        w = wave.open(p)
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float32) / 32768
        i0 = int(src_t * SR)
        seg = a[i0:i0 + int(length * SR)].copy()
        fade = int(0.08 * SR)
        seg[:fade] *= np.linspace(0, 1, fade)[:, None]
        seg[-fade:] *= np.linspace(1, 0, fade)[:, None]
        seg = filt(seg, "hp", 180)
        add(amb_b, seg, at, gain)

    amb("amb_dinner.wav", 1.4, tf(268), 1.15, 0.9)   # applause (src 5.9s)
    amb("amb_cheer.wav", 1.4, tf(598), 1.05, 0.7)    # banquet cheer (src 7.9s)

    # ---- sidechain + bus processing
    t = np.arange(N) / SR
    sc = np.ones(N, np.float32)
    for kt in kick_times:
        i = int(kt * SR)
        n = min(int(0.32 * SR), N - i)
        if n <= 0:
            continue
        tt = np.arange(n) / SR
        g = 1 - 0.62 * np.exp(-tt / 0.10) * np.clip(tt / 0.004, 0, 1)
        sc[i:i + n] = np.minimum(sc[i:i + n], g)
    sc2 = sc[:, None]
    chord_b *= sc2
    pad_b *= 0.6 + 0.4 * sc2
    bass_b *= 0.25 + 0.75 * sc2

    lead_wet = delay_pingpong(lead_b.mean(1), BEAT * 0.75, 0.33, 5) * 0.32
    lead = lead_b + lead_wet + reverb(lead_b.mean(1), IR_HALL, 0.22)
    chords = chord_b + reverb(chord_b.mean(1), IR_HALL, 0.18)
    pads = pad_b + reverb(pad_b.mean(1), IR_HALL, 0.3)
    drums_m = drums + reverb(drums.mean(1) * 0.25, IR_ROOM, 0.1)

    music = (drums_m * 0.9 + filt(bass_b, "lp", 2500) * 0.95 + chords * 0.62 + pads * 0.7 + lead * 0.78)
    # ambience ducks the music a touch
    amb_env = np.abs(amb_b).max(1)
    amb_env = signal.lfilter([0.002], [1, -0.998], amb_env)
    duck = 1 - np.clip(amb_env * 6, 0, 0.35)
    music *= duck[:, None]

    mix = music + fx_b * 0.9 + amb_b
    mix = filt(mix, "hp", 28)
    mix = filt(mix, "lshelf", 90, 0.7, 1.5)
    # bus glue: slow RMS compressor
    rms = np.sqrt(signal.lfilter([0.0015], [1, -0.9985], (mix ** 2).mean(1)) + 1e-9)
    thr = 0.18
    gain = np.where(rms > thr, (thr / rms) ** 0.35, 1.0)
    mix *= gain[:, None]
    # tail fade
    fo = int(0.35 * SR)
    mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
    mix = mix[: int(DUR * SR)]
    return master(mix, target_lufs=-14.0)


def limiter(x, ceil=0.891, look_ms=3.0, release_ms=60.0):
    look = int(look_ms * SR / 1000)
    peak = np.abs(x).max(1)
    pw = np.lib.stride_tricks.sliding_window_view(np.pad(peak, (0, look)), look + 1).max(1)
    target = np.minimum(1.0, ceil / (pw + 1e-9))
    rel = np.exp(-1.0 / (release_ms * SR / 1000))
    g = np.empty_like(target)
    cur = 1.0
    for i in range(len(target)):
        tv = target[i]
        cur = tv if tv < cur else tv + (cur - tv) * rel
        g[i] = cur
    return x * g[:, None]


def master(mix, target_lufs=-14.0):
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    gain = 1.0
    for _ in range(4):
        y = limiter(mix * gain)
        lufs = meter.integrated_loudness(y)
        gain *= 10 ** ((target_lufs - lufs) / 20)
    y = limiter(mix * gain)
    print(f"master: {meter.integrated_loudness(y):.2f} LUFS, peak {20*np.log10(np.abs(y).max()):.2f} dBFS")
    return np.clip(y, -1, 1)



def main():
    amb_dir = sys.argv[1]
    out = sys.argv[2]
    mix = render(amb_dir)
    import wave
    w = wave.open(out, "wb")
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
    w.close()
    print("wrote", out, mix.shape[0] / SR, "s")


if __name__ == "__main__":
    main()

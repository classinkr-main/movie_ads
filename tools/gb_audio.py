#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Procedural 30-second music + SFX bed for the ClassIn 개별진도 (GB) showreel.

Run from the repo root:

    python3 tools/gb_audio.py          # -> public/gb/audio/gb_score.wav

Everything is synthesised from scratch with numpy + scipy (no samples, no
downloaded audio). Every random choice comes from a seeded generator keyed by
the event name and time, so the render is reproducible bit for bit.

Grid: 120 BPM, 4/4 -> beat = 0.5 s, bar = 2 s, 15 bars = 30 s. Hits are placed
by `smp(t) = round(t * 48000)`, so they land on the exact sample of each cut.

  bars 1-2    0-4 s   intro "six paths": A1+E2 drone swell, six-note felt-bell
                      motif (A minor pentatonic) at 0.50-1.75 s, clock ticks
  bars 3-4    4-8 s   chaos: slams at 4.0/4.5/5.0/5.5, ticks -> 8ths -> 16ths,
                      notification blips, drone + Bb with opening filter,
                      medium hit at 6.0, riser 6.0-7.95, implosion into 8.0
  bar  5      8-10 s  the turn: hard stop at 8.0, sub heartbeat 8.0/9.0, UI pops
                      8.40/8.87, reverse swell + accelerating roll, 50 ms gap
  bars 6-12  10-24 s  drop: impact at 10.0, groove, Am|F|C|G|Am|F|G(sus4->G),
                      transition SFX layered on top, fill + riser into 24.0
  bars 13-15 24-30 s  resolve: final impact, Cmaj9 swell, motif in C major,
                      sub thump at 26.0, fade to digital silence by 29.9 s

Signal flow
  instrument functions -> Event list -> Section buses (a section can be hard
  gated, dry signal *and* reverb tails, for the cuts at 8.0 and 9.95) -> bus FX
  (kick sidechain, dotted-8th ping-pong, filters) -> FFT-convolution reverbs with
  synthetic stereo IRs -> master chain (DC/sub HPF, mono below 120 Hz, tilt EQ,
  loudness normalisation, soft saturation, look-ahead limiter, end fade, gated
  TPDF dither) -> 48 kHz / 16-bit / stereo WAV of exactly 1,440,000 frames.
"""
from __future__ import annotations

import sys
import time
import zlib
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

import numpy as np
from scipy import signal
from scipy.io import wavfile
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

# =============================================================================
# Constants and grid
# =============================================================================
SR = 48_000
DUR = 30.0
N_TOTAL = int(round(DUR * SR))          # 1,440,000 frames
NYQ = SR / 2.0
BPM = 120.0
BEAT = 60.0 / BPM                       # 0.5 s
BAR = 4 * BEAT                          # 2.0 s
S16 = BEAT / 4                          # 16th note = 0.125 s

REPO = Path(__file__).resolve().parents[1]
OUT_WAV = REPO / "public" / "gb" / "audio" / "gb_score.wav"

TARGET_LUFS = -15.0                     # integrated (BS.1770-4, approx.)
CEILING_DB = -1.15                      # limiter ceiling, sample peak
FADE_OUT = (27.4, 29.9)                 # master fade to digital silence
TWO_PI = 2.0 * np.pi


def smp(t: float) -> int:
    """Seconds -> sample index. The single rounding rule used for every event."""
    return int(round(t * SR))


def tvec(n: int) -> np.ndarray:
    return np.arange(n) / SR


def undb(d: float) -> float:
    return 10.0 ** (d / 20.0)


def to_db(x: float) -> float:
    return 20.0 * np.log10(max(float(x), 1e-12))


def rng_for(*key) -> np.random.Generator:
    """Deterministic generator per event, independent of render order."""
    return np.random.default_rng(zlib.crc32(repr(key).encode("utf-8")))


_PC = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def hz(name: str) -> float:
    """Note name ('A4', 'Bb2', 'C#6') -> frequency, A4 = 440 Hz."""
    letter, rest, acc = name[0].upper(), name[1:], 0
    while rest and rest[0] in "#b":
        acc += 1 if rest[0] == "#" else -1
        rest = rest[1:]
    midi = 12 * (int(rest) + 1) + _PC[letter] + acc
    return 440.0 * 2.0 ** ((midi - 69) / 12.0)


# =============================================================================
# Envelopes, filters, panning
# =============================================================================
def _rc(n: int) -> np.ndarray:
    """Raised-cosine ramp 0 -> ~1 over n samples (first sample exactly 0)."""
    if n <= 0:
        return np.ones(0)
    return 0.5 - 0.5 * np.cos(np.pi * np.arange(n) / n)


def fades(x: np.ndarray, fin: float = 0.0005, fout: float = 0.004) -> np.ndarray:
    """Copy of x with raised-cosine fade-in/out (seconds) on the last axis.
    The last sample is exactly 0, so no note can end with a click."""
    y = np.array(x, dtype=float, copy=True)
    n = y.shape[-1]
    a = min(n // 2, int(round(fin * SR)))
    b = min(n // 2, int(round(fout * SR)))
    if a > 0:
        y[..., :a] *= _rc(a)
    if b > 0:
        y[..., n - b:] *= _rc(b)[::-1]
    return y


def env_perc(n: int, attack: float = 0.001, decay: float = 0.2, hold: float = 0.0,
             release: float = 0.004) -> np.ndarray:
    """Percussive envelope: raised-cosine attack, hold, exponential decay,
    and a short release to exactly zero at the end of the buffer."""
    t = tvec(n)
    e = np.exp(-np.maximum(t - attack - hold, 0.0) / decay)
    a = min(n, int(round(attack * SR)))
    if a > 0:
        e[:a] *= _rc(a)
    r = min(n, int(round(release * SR)))
    if r > 0:
        e[n - r:] *= _rc(r)[::-1]
    return e


def env_asr(n: int, attack: float, release: float) -> np.ndarray:
    """Attack -> sustain -> release (release ends at the buffer end)."""
    e = np.ones(n)
    a = min(n // 2, int(round(attack * SR)))
    r = min(n - a, int(round(release * SR)))
    if a > 0:
        e[:a] = _rc(a)
    if r > 0:
        e[n - r:] *= _rc(r)[::-1]
    return e


def smoothstep(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def _bw(kind: str, fc, order: int = 2):
    if np.ndim(fc):
        fc = [float(np.clip(f, 5.0, NYQ * 0.98)) for f in fc]
    else:
        fc = float(np.clip(fc, 5.0, NYQ * 0.98))
    return signal.butter(order, fc, btype=kind, fs=SR, output="sos")


def lp(x, fc, order: int = 2):
    return signal.sosfilt(_bw("lowpass", fc, order), x, axis=-1)


def hp(x, fc, order: int = 2):
    return signal.sosfilt(_bw("highpass", fc, order), x, axis=-1)


def bp(x, lo, hi, order: int = 2):
    return signal.sosfilt(_bw("bandpass", [lo, hi], order), x, axis=-1)


def pan_gains(pan):
    """Constant-power pan law, pan in [-1, 1] (scalar or array)."""
    th = (np.clip(pan, -1.0, 1.0) + 1.0) * np.pi / 4.0
    return np.cos(th), np.sin(th)


def to_stereo(x: np.ndarray, pan=0.0) -> np.ndarray:
    """Mono -> stereo with constant-power pan; stereo -> stereo with balance."""
    x = np.asarray(x, dtype=float)
    if x.ndim == 2:
        if np.isscalar(pan) and pan == 0.0:
            return x
        return np.stack([x[0] * np.clip(1.0 - np.asarray(pan), 0, 1),
                         x[1] * np.clip(1.0 + np.asarray(pan), 0, 1)])
    gl, gr = pan_gains(pan)
    return np.stack([x * gl, x * gr])


def peak_norm(x: np.ndarray, peak: float = 1.0) -> np.ndarray:
    m = float(np.max(np.abs(x)))
    return x * (peak / m) if m > 0 else x


def shaped_noise(n: int, rng: np.random.Generator,
                 mag: Callable[[np.ndarray, np.ndarray], np.ndarray],
                 channels: int = 1, nperseg: int = 1024) -> np.ndarray:
    """White noise through a time-varying magnitude response mag(f_Hz, t_s),
    applied frame by frame in the STFT domain (Hann, 75 % overlap)."""
    hop = nperseg // 4
    out = []
    for _ in range(channels):
        x = rng.standard_normal(n)
        f, tt, z = signal.stft(x, fs=SR, window="hann", nperseg=nperseg,
                               noverlap=nperseg - hop)
        _, y = signal.istft(z * mag(f[:, None], tt[None, :]), fs=SR, window="hann",
                            nperseg=nperseg, noverlap=nperseg - hop)
        y = y[:n] if len(y) >= n else np.pad(y, (0, n - len(y)))
        out.append(y)
    return np.array(out) if channels > 1 else out[0]


def band_mag(f, lo=None, hi=None, order: int = 2):
    """Butterworth-like magnitude used inside STFT masks."""
    m = np.ones_like(f, dtype=float)
    fs = np.maximum(f, 1.0)
    if lo is not None:
        m = m * (fs / lo) ** order / np.sqrt(1.0 + (fs / lo) ** (2 * order))
    if hi is not None:
        m = m / np.sqrt(1.0 + (fs / hi) ** (2 * order))
    return m


# =============================================================================
# Oscillators (band-limited wavetables + additive)
# =============================================================================
TABLE_LEN = 16384
_X = np.arange(TABLE_LEN) / TABLE_LEN


def harmonic_table(weights) -> np.ndarray:
    """One period from harmonic amplitudes (index 0 = fundamental), sine phase."""
    w = np.asarray(weights, dtype=float)
    keep = np.nonzero(np.abs(w) > 1e-5)[0]
    tab = np.zeros(TABLE_LEN)
    for i0 in range(0, len(keep), 64):          # chunked to bound memory
        k = keep[i0:i0 + 64]
        tab += w[k] @ np.sin(TWO_PI * np.outer(k + 1, _X))
    return tab


def saw_weights(f0: float, fc: float, order: int = 2, f_max: float | None = None):
    """Band-limited sawtooth harmonics through a Butterworth-shaped low-pass."""
    f_max = min(NYQ * 0.9, f_max or NYQ, fc * 6.0)
    kmax = max(1, int(f_max // f0))
    k = np.arange(1, kmax + 1)
    return (1.0 / k) / np.sqrt(1.0 + (k * f0 / fc) ** (2 * order))


def tri_weights(f0: float, f_max: float = 6000.0):
    kmax = max(1, int(min(f_max, NYQ * 0.9) // f0))
    w = np.zeros(kmax)
    for k in range(1, kmax + 1, 2):
        w[k - 1] = (-1) ** ((k - 1) // 2) / k ** 2
    return w


def osc_phase(freq, n: int, phase0: float = 0.0) -> np.ndarray:
    """Normalised phase (cycles, 0..1) for a constant or per-sample frequency."""
    if np.isscalar(freq):
        ph = phase0 + float(freq) * np.arange(n) / SR
    else:
        f = np.asarray(freq, dtype=float)
        ph = phase0 + np.concatenate(([0.0], np.cumsum(f[:-1]))) / SR
    return ph % 1.0


def wt_read(table: np.ndarray, ph: np.ndarray) -> np.ndarray:
    idx = ph * TABLE_LEN
    i0 = idx.astype(np.int64) % TABLE_LEN
    fr = idx - np.floor(idx)
    i1 = (i0 + 1) % TABLE_LEN
    return table[i0] + fr * (table[i1] - table[i0])


def sine_glide(f_start: float, f_end: float, tau: float, n: int) -> np.ndarray:
    """Sine whose pitch falls exponentially from f_start to f_end (phase starts at 0)."""
    f = f_end + (f_start - f_end) * np.exp(-tvec(n) / tau)
    return np.sin(TWO_PI * osc_phase(f, n))


# =============================================================================
# Reverb impulse responses (synthetic, stereo)
# =============================================================================
def make_ir(length: float, predelay: float, t60, seed: int, lo: float = 170.0,
            hi: float = 9000.0, build: float = 0.014) -> np.ndarray:
    """Stereo IR = two decorrelated noises with frequency-dependent exponential
    decay (t60 in seconds at 125 / 500 / 2k / 6k / 12k Hz), band-limited,
    soft onset, pre-delay. Each channel is normalised to unit energy."""
    rng = np.random.default_rng(seed)
    n = smp(length)
    fp = np.log([125.0, 500.0, 2000.0, 6000.0, 12000.0])
    t60 = np.asarray(t60, dtype=float)

    def mag(f, t):
        t60f = np.interp(np.log(np.maximum(f, 20.0)), fp, t60)
        return band_mag(f, lo, hi) * 10.0 ** (-3.0 * t / t60f)

    ir = shaped_noise(n, rng, mag, channels=2, nperseg=2048)
    onset = np.ones(n)
    b = smp(build)
    onset[:b] = _rc(b) ** 1.5
    ir = fades(ir * onset, fin=0.0, fout=0.08)
    ir = np.concatenate([np.zeros((2, smp(predelay))), ir], axis=1)
    return ir / np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))


# =============================================================================
# Tonal instruments
# =============================================================================
def felt_piano(f0: float, dur: float = 3.6, vel: float = 0.8,
               rng: np.random.Generator | None = None, bright: float = 1.0) -> np.ndarray:
    """Soft felt-piano note: slightly inharmonic partials, two detuned strings,
    two-stage decay, felt-darkened spectrum, soft 4 ms attack."""
    rng = rng or np.random.default_rng(0)
    n = smp(dur)
    t = tvec(n)
    inh = 0.00022 * (f0 / 440.0) ** 0.5
    f_cap = 8500.0
    kmax = max(1, min(28, int(f_cap // f0)))
    k = np.arange(1, kmax + 1)
    fk = f0 * k * np.sqrt(1.0 + inh * k ** 2)
    fc = (650.0 + 1700.0 * vel) * bright
    amp = k ** -1.1 / np.sqrt(1.0 + (fk / fc) ** 4)
    tau_s = 3.0 * (440.0 / f0) ** 0.45 / (1.0 + 0.32 * (k - 1))
    tau_f = 0.2 * tau_s
    r1, r2 = 2.0 ** (0.45 / 1200), 2.0 ** (-0.45 / 1200)
    y = np.zeros(n)
    for i in range(kmax):
        if fk[i] >= f_cap:
            break
        e = 0.55 * np.exp(-t / tau_f[i]) + 0.45 * np.exp(-t / tau_s[i])
        s = np.sin(TWO_PI * fk[i] * r1 * t) + np.sin(TWO_PI * fk[i] * r2 * t + rng.uniform(0, 0.4))
        y += amp[i] * e * s
    y *= 0.5
    y += lp(rng.standard_normal(n) * np.exp(-t / 0.005), 900.0) * 0.03
    return peak_norm(fades(y, fin=0.004, fout=0.3), vel)


def soft_bell(f0: float, dur: float = 3.2, vel: float = 0.8) -> np.ndarray:
    n = smp(dur)
    t = tvec(n)
    sc = (660.0 / f0) ** 0.3
    parts = [(1.0, 1.0, 2.4), (2.0, 0.22, 0.9), (3.0, 0.07, 0.45), (4.16, 0.035, 0.25)]
    y = np.zeros(n)
    for r, a, tau in parts:
        if f0 * r < 12000.0:
            y += a * np.exp(-t / (tau * sc)) * np.sin(TWO_PI * f0 * r * t)
    return peak_norm(fades(y, 0.002, 0.25), vel)


def motif_note(f0: float, dur: float = 3.6, vel: float = 0.8,
               rng: np.random.Generator | None = None, bell: float = 0.38) -> np.ndarray:
    """The six-paths motif voice: felt piano with a soft bell halo."""
    y = 0.78 * felt_piano(f0, dur, vel, rng) + bell * soft_bell(f0, dur, vel)
    return peak_norm(y, vel)


def drone_part(dur: float = 8.02, rng: np.random.Generator | None = None) -> np.ndarray:
    """Intro/chaos drone: A1 + E2 (triangle core + detuned saw edge), swelling
    from silence; Bb2 joins at 4.0 (dissonant colour) while the low-pass opens,
    and a 16th-note tremolo creeps in from 6.0."""
    rng = rng or np.random.default_rng(1)
    n = smp(dur)
    t = tvec(n)
    u = np.where(t < 4.0, 0.3 * t / 4.0, 0.3 + 1.7 * np.clip((t - 4.0) / 4.0, 0, 1) ** 1.5)
    c0 = np.clip(1.0 - u, 0, 1)
    c2 = np.clip(u - 1.0, 0, 1)
    c1 = 1.0 - c0 - c2
    swell = np.sin(0.5 * np.pi * np.clip(t / 3.7, 0, 1)) ** 2
    lift = 1.0 + 0.35 * smoothstep((t - 4.0) / 4.0)
    depth = 0.32 * smoothstep((t - 6.0) / 1.5)
    trem = 1.0 - depth * (0.5 - 0.5 * np.cos(TWO_PI * 8.0 * (t - 6.0)))
    out = np.zeros((2, n))
    for name, lvl, fin in (("A1", 1.0, None), ("E2", 0.62, None), ("Bb2", 0.5, (4.0, 5.8))):
        f0 = hz(name)
        g = lvl * (np.ones(n) if fin is None else smoothstep((t - fin[0]) / (fin[1] - fin[0])))
        core = wt_read(harmonic_table(tri_weights(f0, 3000.0)), osc_phase(f0, n, rng.random()))
        out += 0.8 * 0.7071 * core * g
        tabs = [harmonic_table(saw_weights(f0, fc)) for fc in (170.0, 600.0, 2100.0)]
        for cents, pan in ((-6.0, -0.55), (6.0, 0.55)):
            ph = osc_phase(f0 * 2.0 ** (cents / 1200), n, rng.random())
            s = c0 * wt_read(tabs[0], ph) + c1 * wt_read(tabs[1], ph) + c2 * wt_read(tabs[2], ph)
            out += to_stereo(0.42 * s * g, pan)
    return fades(out * swell * lift * trem, fin=0.0, fout=0.005)


def pad_note(f0: float, dur: float, attack: float = 0.12, release: float = 0.5,
             fc: float = 1500.0, rng: np.random.Generator | None = None,
             width: float = 0.75, drift: float = 0.1) -> np.ndarray:
    """Warm pad voice: four detuned band-limited saws spread across the stereo
    field, gentle low-pass, slow independent amplitude drift."""
    rng = rng or np.random.default_rng(2)
    n = smp(dur)
    t = tvec(n)
    tab = harmonic_table(saw_weights(f0, fc))
    out = np.zeros((2, n))
    for cents, pan in ((-9.0, -width), (-3.0, -width / 3), (3.5, width / 3), (9.5, width)):
        ph = osc_phase(f0 * 2.0 ** (cents / 1200), n, rng.random())
        lfo = 1.0 + drift * np.sin(TWO_PI * rng.uniform(0.07, 0.22) * t + rng.uniform(0, TWO_PI))
        out += to_stereo(wt_read(tab, ph) * lfo, pan)
    return out * env_asr(n, attack, release) * 0.25


def pad_chord(notes, dur: float, rng: np.random.Generator | None = None, **kw) -> np.ndarray:
    rng = rng or np.random.default_rng(3)
    out = sum(pad_note(hz(nm), dur, rng=rng, **kw) for nm in notes)
    return out / np.sqrt(len(notes))


def bass_line(segments, t0: float, t1: float, stop_at: float,
              rng: np.random.Generator | None = None) -> np.ndarray:
    """Sub bass on the chord roots with an 8th-note pulse. One continuous-phase
    oscillator, gated per 8th (3 ms attack, 28 ms release), lightly saturated."""
    n = smp(t1) - smp(t0)
    freq = np.full(n, hz(segments[0][2]))
    for ts, te, note in segments:
        freq[smp(ts) - smp(t0): smp(te) - smp(t0)] = hz(note)
    y = wt_read(harmonic_table([1.0, 0.32, 0.12, 0.05, 0.02]), osc_phase(freq, n))
    nl = smp(0.235)
    shape = env_asr(nl, 0.003, 0.028) * (0.82 + 0.18 * np.exp(-tvec(nl) / 0.09))
    gate = np.zeros(n)
    for k in range(int(round((stop_at - t0) / (BEAT / 2)))):
        i = smp(t0 + k * BEAT / 2) - smp(t0)
        seg = gate[i:i + nl]
        gate[i:i + nl] = np.maximum(seg, shape[:len(seg)])
    y = np.tanh(1.3 * y * gate) / np.tanh(1.3)
    return lp(y, 420.0, 2)


def pluck(f0: float, fc: float, dur: float = 0.36, vel: float = 1.0) -> np.ndarray:
    """Arp pluck: saw whose brightness falls from 3x fc to fc in ~50 ms (filter
    envelope via wavetable morph) plus a glassy octave on the attack."""
    n = smp(dur)
    t = tvec(n)
    ph = osc_phase(f0, n)
    m = np.exp(-t / 0.05)
    y = (m * wt_read(harmonic_table(saw_weights(f0, min(fc * 3.0, 14000.0))), ph)
         + (1.0 - m) * wt_read(harmonic_table(saw_weights(f0, fc)), ph))
    y += 0.25 * np.sin(TWO_PI * 2.0 * f0 * t) * np.exp(-t / 0.07)
    return y * env_perc(n, attack=0.0015, decay=0.16, release=0.03) * vel * 0.6


def chime_tone(f0: float, dur: float = 0.8) -> np.ndarray:
    n = smp(dur)
    t = tvec(n)
    y = np.zeros(n)
    for r, a, tau in ((1.0, 1.0, 0.42), (2.0, 0.2, 0.16), (3.0, 0.06, 0.08)):
        y += a * np.exp(-t / tau) * np.sin(TWO_PI * f0 * r * t)
    return fades(y, 0.001, 0.05)


def ui_chime(notes=("G5", "C6"), gap: float = 0.085,
             rng: np.random.Generator | None = None) -> np.ndarray:
    """Two-note chat chime (second note starts `gap` s after the first)."""
    a, b = chime_tone(hz(notes[0])), chime_tone(hz(notes[1]))
    g = smp(gap)
    y = np.zeros(g + len(b))
    y[:len(a)] += 0.85 * a
    y[g:g + len(b)] += b
    return peak_norm(y)


def warm_ping(f0: float, rng: np.random.Generator | None = None) -> np.ndarray:
    """Warm 'attention' ping: sine with a sub-octave body and faint bell partials."""
    n = smp(1.4)
    t = tvec(n)
    y = (np.sin(TWO_PI * f0 * t) * np.exp(-t / 0.6)
         + 0.35 * np.sin(TWO_PI * 0.5 * f0 * t) * np.exp(-t / 0.5)
         + 0.12 * np.sin(TWO_PI * 2.0 * f0 * t) * np.exp(-t / 0.16)
         + 0.04 * np.sin(TWO_PI * 3.01 * f0 * t) * np.exp(-t / 0.07))
    return peak_norm(fades(y, 0.0025, 0.1))


def sparkle(rng: np.random.Generator, notes=("D6", "G6", "B6", "D7", "G7"),
            step: float = 0.034) -> np.ndarray:
    """Shimmer sparkle: a fast rising G-major bell flourish plus glitter grains."""
    n = smp(1.6)
    out = np.zeros((2, n))
    for i, name in enumerate(notes):
        f0, o = hz(name), smp(i * step)
        tt = tvec(n - o)
        y = np.sin(TWO_PI * f0 * tt) + 0.15 * np.sin(TWO_PI * 2.0 * f0 * tt) * np.exp(-tt / 0.1)
        y *= env_perc(n - o, 0.001, 0.32, release=0.05) * 0.9 ** i
        out[:, o:] += to_stereo(y, -0.45 + 0.9 * i / (len(notes) - 1))
    gl = smp(0.004)
    for _ in range(28):
        tg = 0.4 * rng.random() ** 1.6
        ig = smp(tg)
        grain = hp(rng.standard_normal(gl), 6000.0) * np.hanning(gl) * 0.08 * np.exp(-tg / 0.25)
        out[:, ig:ig + gl] += to_stereo(grain, rng.uniform(-0.8, 0.8))
    return peak_norm(fades(out, 0.001, 0.2))


def shimmer_pad(dur: float, notes=("G5", "B5", "D6", "E6"), attack: float = 1.8,
                release: float = 1.5, rng: np.random.Generator | None = None) -> np.ndarray:
    """High, soft Cmaj9 upper-structure shimmer with slow independent tremolos."""
    rng = rng or np.random.default_rng(4)
    n = smp(dur)
    t = tvec(n)
    out = np.zeros((2, n))
    for i, name in enumerate(notes):
        f0 = hz(name)
        vib = 1.0 + 0.0012 * np.sin(TWO_PI * 4.6 * t + rng.uniform(0, TWO_PI))
        ph = osc_phase(f0 * vib, n, rng.random())
        y = np.sin(TWO_PI * ph) + 0.08 * np.sin(2.0 * TWO_PI * ph)
        am = 0.55 + 0.45 * np.sin(TWO_PI * rng.uniform(0.25, 0.6) * t + rng.uniform(0, TWO_PI))
        out += to_stereo(y * am, (-0.7, 0.7, -0.35, 0.35)[i % 4])
    return out * env_asr(n, attack, release) / len(notes)


def tonal_bloom(notes=("C2", "G2", "C3", "E3"), dur: float = 3.2, fc: float = 650.0,
                rng: np.random.Generator | None = None) -> np.ndarray:
    """Low C-major saw stack under the final impact (fast attack, long decay)."""
    rng = rng or np.random.default_rng(5)
    n = smp(dur)
    out = sum(pad_note(hz(nm), dur, attack=0.008, release=0.3, fc=fc, rng=rng, width=0.4,
                       drift=0.0) for nm in notes)
    return out * env_perc(n, 0.0, 1.1, release=0.3)


def sub_sustain(f0: float, dur: float, attack: float, release: float) -> np.ndarray:
    n = smp(dur)
    t = tvec(n)
    y = np.sin(TWO_PI * f0 * t) + 0.2 * np.sin(2 * TWO_PI * f0 * t) + 0.05 * np.sin(3 * TWO_PI * f0 * t)
    return y * env_asr(n, attack, release) / 1.2


# =============================================================================
# Drums and percussion
# =============================================================================
def kick(rng: np.random.Generator, f_hi: float = 155.0, f_lo: float = 47.0,
         tau_p: float = 0.032, decay: float = 0.17, length: float = 0.42) -> np.ndarray:
    """Clean, deep, short kick: pitch-swept sine + tiny filtered click, warm tanh."""
    n = smp(length)
    t = tvec(n)
    body = sine_glide(f_hi, f_lo, tau_p, n) * np.exp(-np.maximum(t - 0.025, 0.0) / decay)
    click = bp(rng.standard_normal(n), 1500.0, 6000.0) * np.exp(-t / 0.0025) * 0.18
    y = np.tanh(1.5 * (body + click)) / np.tanh(1.5)
    return peak_norm(fades(y, fin=0.0004, fout=0.03))


def clap(rng: np.random.Generator, vel: float = 1.0) -> np.ndarray:
    """Clap/snare layer: four micro-bursts then a filtered tail, plus a 190 Hz body."""
    n = smp(0.45)
    t = tvec(n)
    env = np.zeros(n)
    for k, off in enumerate((0.0, 0.0085, 0.0175, 0.0265)):
        i = smp(off)
        tt = t[i:] - off
        env[i:] += 0.85 ** k * np.exp(-tt / 0.0045) * np.minimum(tt / 0.0004, 1.0)
    ti = smp(0.027)
    tt = t[ti:] - 0.027
    env[ti:] += 0.55 * np.exp(-tt / 0.11) * np.minimum(tt / 0.001, 1.0)
    out = np.stack([bp(rng.standard_normal(n), 900.0, 5200.0) * env for _ in range(2)])
    body = sine_glide(230.0, 190.0, 0.01, n) * np.exp(-t / 0.04) * 0.35
    out = lp(out + to_stereo(body), 7500.0)
    return peak_norm(fades(out, 0.0003, 0.04), vel)


def hat(rng: np.random.Generator, vel: float = 1.0, decay: float = 0.035) -> np.ndarray:
    """Closed hat: high-passed noise + inharmonic metallic partials, decorrelated L/R."""
    n = smp(0.12)
    t = tvec(n)
    e = env_perc(n, 0.0004, decay, release=0.01)
    out = np.zeros((2, n))
    for ch in range(2):
        metal = sum(np.sin(TWO_PI * f * t + rng.uniform(0, TWO_PI))
                    for f in (6100.0, 7300.0, 8150.0, 9050.0, 10400.0)) * 0.12
        out[ch] = (hp(rng.standard_normal(n), 7000.0, 2) + metal) * e
    return peak_norm(lp(out, 13000.0), vel)


def shaker(rng: np.random.Generator, vel: float = 1.0) -> np.ndarray:
    n = smp(0.09)
    e = env_perc(n, 0.006, 0.025, release=0.01)
    out = np.stack([bp(rng.standard_normal(n), 4500.0, 11000.0) * e for _ in range(2)])
    return peak_norm(out, vel)


def snare(rng: np.random.Generator, vel: float = 1.0, lpf: float = 8000.0,
          decay: float = 0.11, length: float = 0.25) -> np.ndarray:
    """Tight snare for rolls and fills; per-hit low-pass (rising filter in builds)."""
    n = smp(length)
    t = tvec(n)
    body = (sine_glide(205.0, 185.0, 0.01, n) * np.exp(-t / 0.045)
            + 0.5 * np.sin(TWO_PI * 330.0 * t) * np.exp(-t / 0.025)) * 0.55
    e = env_perc(n, 0.0004, decay, release=0.02)
    out = np.stack([bp(rng.standard_normal(n), 1200.0, 9000.0) * e for _ in range(2)])
    out = lp(out + to_stereo(body), lpf)
    return peak_norm(fades(out, 0.0003, 0.02), vel)


def clock_tick(rng: np.random.Generator, tock: bool = False) -> np.ndarray:
    n = smp(0.05)
    t = tvec(n)
    f1, f2 = (2600.0, 1380.0) if tock else (3100.0, 1650.0)
    y = (0.6 * np.sin(TWO_PI * f1 * t) * np.exp(-t / 0.0035)
         + 0.4 * np.sin(TWO_PI * f2 * t) * np.exp(-t / 0.007)
         + 0.3 * hp(rng.standard_normal(n), 2500.0) * np.exp(-t / 0.0012))
    return peak_norm(fades(y, 0.0002, 0.01))


def text_tick(rng: np.random.Generator, vel: float = 1.0) -> np.ndarray:
    """Very small 'typing' tick for the text-generation bursts."""
    n = smp(0.03)
    t = tvec(n)
    f = 4200.0 * rng.uniform(0.94, 1.06)
    y = np.sin(TWO_PI * f * t) * np.exp(-t / 0.002) + 0.4 * hp(rng.standard_normal(n), 3000.0) * np.exp(-t / 0.0008)
    return peak_norm(fades(y, 0.0002, 0.006), vel)


def mouse_click(rng: np.random.Generator) -> np.ndarray:
    """Press + softer release 75 ms later."""
    n = smp(0.14)
    y = np.zeros(n)
    for off, a, f in ((0.0, 1.0, 2400.0), (0.075, 0.45, 2900.0)):
        i = smp(off)
        tt = tvec(n - i)
        y[i:] += a * (bp(rng.standard_normal(n - i), 1800.0, 7000.0) * np.exp(-tt / 0.0015)
                      + 0.5 * np.sin(TWO_PI * f * tt) * np.exp(-tt / 0.003))
    return peak_norm(fades(y, 0.0002, 0.01))


# =============================================================================
# UI / sound-design elements
# =============================================================================
def ui_blip(f0: float, kind: int, rng: np.random.Generator) -> np.ndarray:
    """Tiny notification blip: 0 = beep, 1 = double beep, 2 = rising bloop."""
    n = smp(0.2)
    t = tvec(n)
    if kind == 2:
        f = f0 * (1.0 - 0.25 * np.exp(-t / 0.008))
        ph = osc_phase(f, n)
        y = (np.sin(TWO_PI * ph) + 0.1 * np.sin(3 * TWO_PI * ph)) * env_perc(n, 0.001, 0.055)
    else:
        y = (np.sin(TWO_PI * f0 * t) + 0.12 * np.sin(TWO_PI * 3 * f0 * t)) * env_perc(n, 0.001, 0.045)
        if kind == 1:
            r = 2.0 ** (rng.choice([1, 6, -1]) / 12.0)
            i = smp(0.05)
            tt = tvec(n - i)
            y[i:] += 0.8 * np.sin(TWO_PI * f0 * r * tt) * env_perc(n - i, 0.001, 0.04)
    return peak_norm(fades(y, 0.0005, 0.02))


def ui_pop(rng: np.random.Generator, f_hi: float = 900.0, f_lo: float = 620.0) -> np.ndarray:
    """Soft text 'pop': short sine with a small downward pitch flick."""
    n = smp(0.18)
    t = tvec(n)
    y = sine_glide(f_hi, f_lo, 0.012, n) * env_perc(n, 0.001, 0.05, release=0.02)
    y += 0.08 * hp(rng.standard_normal(n), 3000.0) * np.exp(-t / 0.0008)
    return peak_norm(lp(y, 6000.0))


def heartbeat(rng: np.random.Generator, f_hi: float = 70.0, f_lo: float = 42.0,
              tau: float = 0.055, length: float = 0.4) -> np.ndarray:
    """Soft sub heartbeat / thump (fast decay so the gap still reads as silence)."""
    n = smp(length)
    t = tvec(n)
    y = sine_glide(f_hi, f_lo, 0.025, n) * env_perc(n, 0.002, tau, hold=0.01, release=0.05)
    y += 0.15 * np.sin(TWO_PI * 2 * f_lo * t) * env_perc(n, 0.002, tau * 0.7, release=0.05)
    y += 0.2 * lp(rng.standard_normal(n), 200.0) * np.exp(-t / 0.015)
    return peak_norm(y)


def sub_boom(f_hi: float = 110.0, f_lo: float = 44.0, tau_p: float = 0.09,
             decay: float = 0.75, length: float = 2.5, drive: float = 1.4) -> np.ndarray:
    """Impact sub boom with pitch drop, saturated for presence, low-passed."""
    n = smp(length)
    t = tvec(n)
    y = sine_glide(f_hi, f_lo, tau_p, n) * np.exp(-np.maximum(t - 0.04, 0.0) / decay)
    y = lp(np.tanh(drive * y) / np.tanh(drive), 400.0)
    return peak_norm(fades(y, 0.0006, 0.3))


def noise_crash(rng: np.random.Generator, length: float = 2.4, decay: float = 0.9,
                lo: float = 1800.0, hi: float = 12500.0) -> np.ndarray:
    """Bright noise crash; higher frequencies decay faster (stereo, decorrelated)."""
    n = smp(length)

    def mag(f, t):
        tau = decay * (2500.0 / np.maximum(f, 500.0)) ** 0.35
        return band_mag(f, lo, hi) * np.exp(-t / tau)

    y = shaped_noise(n, rng, mag, channels=2)
    return peak_norm(fades(y, 0.0004, 0.1))


IMPACT_SIZES = {
    #          boom: f_hi  f_lo  tau_p decay length   crash: len decay lo     body
    "light":  dict(boom=(85.0, 46.0, 0.07, 0.35, 1.2), crash=(1.2, 0.35, 2600.0), body=0.10),
    "medium": dict(boom=(95.0, 44.0, 0.08, 0.50, 1.8), crash=(1.8, 0.55, 2000.0), body=0.12),
    "big":    dict(boom=(110.0, 44.0, 0.09, 0.80, 2.6), crash=(2.6, 0.95, 1800.0), body=0.15),
    "huge":   dict(boom=(120.0, 40.0, 0.11, 1.30, 4.5), crash=(4.0, 1.50, 1500.0), body=0.18),
}


def impact_boom(size: str, rng: np.random.Generator | None = None) -> np.ndarray:
    return sub_boom(*IMPACT_SIZES[size]["boom"])


def impact_crash(size: str, rng: np.random.Generator) -> np.ndarray:
    length, decay, lo = IMPACT_SIZES[size]["crash"]
    return noise_crash(rng, length, decay, lo)


def impact_body(size: str, rng: np.random.Generator) -> np.ndarray:
    """Low-mid 'thud' and transient click glued to the boom."""
    tau = IMPACT_SIZES[size]["body"]
    n = smp(tau * 6)
    t = tvec(n)
    y = lp(rng.standard_normal(n), 380.0, 2) * np.exp(-t / tau)
    y += 0.5 * bp(rng.standard_normal(n), 1500.0, 9000.0) * np.exp(-t / 0.003)
    return peak_norm(fades(y, 0.0003, 0.05))


def whoosh(dur: float, peak_at: float, rng: np.random.Generator, f_lo: float = 350.0,
           f_hi: float = 4000.0, bw_oct: float = 1.3, pan_from: float = -0.7,
           pan_to: float = 0.7, rise_pow: float = 2.0, fall_pow: float = 1.5) -> np.ndarray:
    """Air whoosh: band-passed noise whose centre sweeps up to f_hi at `peak_at`
    (seconds from the start) and back down, loudest at the peak, panned across."""
    n = smp(dur)
    t = tvec(n)
    tail = dur - peak_at

    def fc_of(tt):
        up = f_lo * (f_hi / f_lo) ** (np.clip(tt / peak_at, 0, 1) ** 1.5)
        down = f_hi * ((1.6 * f_lo) / f_hi) ** np.clip((tt - peak_at) / tail, 0, 1)
        return np.where(tt <= peak_at, up, down)

    def mag(f, tt):
        return np.exp(-0.5 * (np.log2(np.maximum(f, 20.0) / fc_of(tt)) / bw_oct) ** 2)

    x = shaped_noise(n, rng, mag, channels=3, nperseg=512)
    a = np.where(t <= peak_at, (t / peak_at) ** rise_pow,
                 np.clip((dur - t) / tail, 0, 1) ** fall_pow)
    pan = pan_from + (pan_to - pan_from) * smoothstep(t / dur)
    out = to_stereo(x[0] * a, pan) + 0.3 * x[1:] * a
    return peak_norm(fades(out, 0.002, 0.004))


def riser(dur: float, f_start: float, f_end: float, rng: np.random.Generator,
          n_lo: float = 300.0, n_hi: float = 8000.0, tone: float = 0.45) -> np.ndarray:
    """Noise + pitch riser: band-pass noise sweeping n_lo -> n_hi and a detuned
    saw pair gliding f_start -> f_end (accelerating), both crescendo."""
    n = smp(dur)
    t = tvec(n)
    x = t / dur

    def mag(f, tt):
        fc = n_lo * (n_hi / n_lo) ** (np.clip(tt / dur, 0, 1) ** 1.3)
        return np.exp(-0.5 * (np.log2(np.maximum(f, 20.0) / fc) / 1.2) ** 2)

    nz = peak_norm(shaped_noise(n, rng, mag, channels=2) * x ** 2.2)
    f = f_start * (f_end / f_start) ** (x ** 1.6)
    tab = harmonic_table(saw_weights(f_end, 2400.0))      # built for the top pitch
    ton = np.zeros((2, n))
    for cents, pan in ((-8.0, -0.6), (8.0, 0.6)):
        ton += to_stereo(wt_read(tab, osc_phase(f * 2.0 ** (cents / 1200), n, rng.random())), pan)
    ton += to_stereo(0.4 * np.sin(TWO_PI * osc_phase(2.0 * f, n)))
    ton = peak_norm(ton * x ** 1.8)
    return peak_norm(fades((1.0 - tone) * nz + tone * ton, 0.01, 0.012))


def implosion(rng: np.random.Generator, length: float = 0.30, after: float = 0.010) -> np.ndarray:
    """Reverse 'implosion': a short burst rendered forwards, then reversed so it
    swells and culminates exactly `length` s after its start; the waveform then
    continues mirrored and falls to zero over `after` s (the hard stop)."""
    n = smp(length)
    t = tvec(n)
    crash = noise_crash(rng, length, decay=0.07, lo=600.0, hi=11000.0)
    body = peak_norm(lp(rng.standard_normal(n), 900.0) * np.exp(-t / 0.05))
    boom = sine_glide(120.0, 45.0, 0.05, n) * np.exp(-t / 0.08)
    fwd = 0.6 * crash + to_stereo(0.5 * body + 0.6 * boom)
    rev = fwd[:, ::-1] * (t / length) ** 1.2
    k = smp(after)
    tail = fwd[:, 1:k + 1] * _rc(k)[::-1]
    out = np.concatenate([rev, tail], axis=1)
    return peak_norm(fades(out, 0.02, 0.0))


def reverse_cymbal(dur: float, rng: np.random.Generator) -> np.ndarray:
    """Reverse-cymbal swell that peaks at the very end of the buffer."""
    n = smp(dur)
    t = tvec(n)
    fwd = noise_crash(rng, dur, decay=0.42, lo=2500.0, hi=13000.0)
    metal = sum(np.sin(TWO_PI * f * t + rng.uniform(0, TWO_PI))
                for f in (3170.0, 4430.0, 5210.0, 6390.0, 7740.0)) * np.exp(-t / 0.35) * 0.05
    rev = (fwd + to_stereo(metal))[:, ::-1]
    return peak_norm(fades(rev * smoothstep(t / dur) ** 0.5, 0.05, 0.003))


def slam(rng: np.random.Generator, pitch: float = 1.0, pre: float = 0.05) -> np.ndarray:
    """Word slam: short pre-swish (pre s, culminating on the hit), then a tight low
    thud + body + paper snap/flutter. The hit itself starts at sample smp(pre)."""
    n_pre, n_hit = smp(pre), smp(0.4)
    out = np.zeros((2, n_pre + n_hit))
    tt = tvec(n_pre)
    out[:, :n_pre] += to_stereo(bp(rng.standard_normal(n_pre), 1200.0, 6000.0) * (tt / pre) ** 2.5 * 0.3)
    t = tvec(n_hit)
    thud = sine_glide(72.0 * pitch, 46.0 * pitch, 0.02, n_hit) * env_perc(n_hit, 0.0005, 0.06, hold=0.01, release=0.05)
    thud = np.tanh(1.8 * thud) / np.tanh(1.8)
    body = peak_norm(lp(rng.standard_normal(n_hit), 500.0) * np.exp(-t / 0.025)) * 0.45
    snap = np.stack([bp(rng.standard_normal(n_hit), 1400.0, 7000.0) for _ in range(2)])
    snap = peak_norm(snap * env_perc(n_hit, 0.0003, 0.022)) * 0.5
    flut = np.stack([bp(rng.standard_normal(n_hit), 2000.0, 8000.0) for _ in range(2)])
    flut = peak_norm(flut * np.exp(-t / 0.03) * (0.5 + 0.5 * np.sin(TWO_PI * 120.0 * t))) * 0.18
    out[:, n_pre:] += to_stereo(thud + body) + snap + flut
    return fades(out, 0.002, 0.05)


# =============================================================================
# Mixer: events -> sections -> buses -> FX -> reverb -> gate
# =============================================================================
@dataclass
class Event:
    """One sound on the timeline. `t` is the musical anchor (onset / culmination);
    the buffer starts `anchor` seconds earlier (pre-roll such as a pre-swish)."""
    t: float
    section: str
    name: str
    sound: Callable[[np.random.Generator], np.ndarray]
    gain_db: float = 0.0
    pan: float = 0.0
    bus: str = "sfx"
    send: dict = field(default_factory=dict)
    anchor: float = 0.0


def sidechain_curve(n: int, t0: float, triggers, depth: float, release: float,
                    attack: float = 0.004, hold: float = 0.012) -> np.ndarray:
    """Gain curve ducking on each trigger (t, depth_scale, release_scale):
    raised-cosine attack ending on the hit, hold, raised-cosine release."""
    duck = np.zeros(n)
    for tk, dsc, rsc in triggers:
        a, h, r = smp(attack), smp(hold), smp(release * rsc)
        shape = np.concatenate([_rc(a), np.ones(h), _rc(r)[::-1]]) * dsc
        i = smp(tk) - smp(t0) - a
        lo, hi = max(i, 0), min(i + len(shape), n)
        if hi > lo:
            duck[lo:hi] = np.maximum(duck[lo:hi], shape[lo - i:hi - i])
    return 1.0 - depth * np.clip(duck, 0.0, 1.0)


def pingpong(x: np.ndarray, delay: float = 0.375, fb: float = 0.38, echoes: int = 5,
             mix: float = 0.33, tone: float = 3400.0) -> np.ndarray:
    """Tempo-synced (dotted 8th) ping-pong delay; each echo darker than the last."""
    y = x.copy()
    e = 0.5 * (x[0] + x[1])
    for k in range(1, echoes + 1):
        e = lp(e, tone, 1)
        d = smp(k * delay)
        if d >= x.shape[1]:
            break
        y[k % 2, d:] += mix * fb ** (k - 1) * e[:-d]
    return y


def gate_curve(n: int, t0: float, fade_start: float, fade_end: float) -> np.ndarray:
    """1 before fade_start, raised-cosine to exactly 0 at fade_end, 0 after."""
    g = np.ones(n)
    a, b = smp(fade_start) - smp(t0), smp(fade_end) - smp(t0)
    g[a:b] = _rc(b - a)[::-1]
    g[b:] = 0.0
    return g


class Section:
    """A span of the timeline with its own buses and reverb sends. Its gate can
    cut the dry signal and (optionally) the reverb tails at a hard edit point."""

    def __init__(self, name: str, t_start: float, t_end: float, gate=None, gate_wet=True):
        self.name, self.t0 = name, t_start
        self.i0 = smp(t_start)
        self.n = smp(t_end) - self.i0
        self.gate, self.gate_wet = gate, gate_wet
        self.buses: dict[str, np.ndarray] = {}
        self.sends: dict[str, np.ndarray] = {}
        self.fx: dict[str, list[Callable[[np.ndarray], np.ndarray]]] = {}

    def _buf(self, store: dict, key: str) -> np.ndarray:
        if key not in store:
            store[key] = np.zeros((2, self.n))
        return store[key]

    def add(self, ev: Event, x: np.ndarray) -> None:
        st = to_stereo(x, ev.pan) * undb(ev.gain_db)
        start = smp(ev.t) - smp(ev.anchor) - self.i0
        if start < 0:
            raise ValueError(f"{ev.name}@{ev.t}: starts before section {self.name}")
        end = min(self.n, start + st.shape[1])
        if end <= start:
            return
        seg = st[:, :end - start]
        self._buf(self.buses, ev.bus)[:, start:end] += seg
        for rv, amt in ev.send.items():
            self._buf(self.sends, rv)[:, start:end] += amt * seg

    def render(self, irs: dict[str, np.ndarray], log: Callable[[str], None]) -> np.ndarray:
        g = gate_curve(self.n, self.t0, *self.gate) if self.gate else None
        mix = np.zeros((2, self.n))
        for bus, x in self.buses.items():
            for fn in self.fx.get(bus, []):
                x = fn(x)
            if g is not None and not self.gate_wet:
                x = x * g
            log(f"    {self.name}.{bus:<7} rms {to_db(np.sqrt(np.mean(x ** 2))):6.1f} dBFS"
                f"  peak {to_db(np.max(np.abs(x))):6.1f} dBFS")
            mix += x
        for rv, s in self.sends.items():
            if g is not None and not self.gate_wet:
                s = s * g
            ir = irs[rv]
            for ch in range(2):
                mix[ch] += signal.fftconvolve(s[ch], ir[ch])[:self.n]
        if g is not None and self.gate_wet:
            mix *= g
        return mix

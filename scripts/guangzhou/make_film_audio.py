"""Score + sound-bite mix for the 90s Guangzhou event film (16:9, 24fps, 120 BPM).

Reuses the synth voices of make_audio.py (same key, tempo and hook as the 30s vlog).
Everything is driven by src/guangzhou/film.json: drums drop to a breakdown under
each sound bite, the music is side-chain ducked by the speech envelope, and SFX
land on the cut/graphic frames.

Usage (repo 루트에서): python3 scripts/guangzhou/make_film_audio.py public/guangzhou/film/audio public/guangzhou/film/audio/mix.wav
"""
import json
import os
import sys
import wave

import numpy as np
from scipy import signal
from scipy.ndimage import maximum_filter1d

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_audio as V  # noqa: E402  (synth voices, DSP helpers, master)

SR = V.SR
ROOT = os.path.dirname(os.path.abspath(__file__))
FILM = json.load(open(os.path.join(ROOT, "../../src/guangzhou/film.json")))
FPS = FILM["fps"]
DUR = FILM["frames"] / FPS
BEAT = 60.0 / FILM["bpm"]
S16 = BEAT / 4
BAR = 4 * BEAT
N = int(SR * (DUR + 0.05))
n2m = V.n2m


def tf(frame):
    return frame / FPS


def bus():
    return np.zeros((N, 2), np.float32)


def add(dst, x, t, gain=1.0, pan=0.0):
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


def load_wav(path):
    w = wave.open(path)
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    a = a.reshape(-1, w.getnchannels())
    if a.shape[1] == 1:
        a = np.repeat(a, 2, 1)
    return a


# ---------------------------------------------------------------- harmony
F = lambda *ns: [n2m(x) for x in ns]
CH = {
    "F": dict(tri=F("F3", "A3", "C4", "F4"), stab=F("A3", "C4", "F4", "A4"), bass=n2m("F1")),
    "Fmaj7": dict(tri=F("F3", "A3", "C4", "E4"), stab=F("A3", "C4", "E4", "A4"), bass=n2m("F1")),
    "C": dict(tri=F("E3", "G3", "C4", "E4"), stab=F("G3", "C4", "E4", "G4"), bass=n2m("C1")),
    "Dm": dict(tri=F("D3", "F3", "A3", "D4"), stab=F("F3", "A3", "D4", "F4"), bass=n2m("D1")),
    "Dm7": dict(tri=F("D3", "F3", "A3", "C4"), stab=F("F3", "A3", "C4", "F4"), bass=n2m("D1")),
    "Bb": dict(tri=F("D3", "F3", "Bb3", "D4"), stab=F("F3", "Bb3", "D4", "F4"), bass=n2m("Bb0")),
    "Gm": dict(tri=F("D3", "G3", "Bb3", "D4"), stab=F("G3", "Bb3", "D4", "G4"), bass=n2m("G1")),
    "Csus": dict(tri=F("F3", "G3", "C4", "F4"), stab=F("G3", "C4", "F4", "G4"), bass=n2m("C1")),
}
NBARS = int(np.ceil(DUR / BAR))
LOOP_A = ["F", "C", "Dm", "Bb"]
LOOP_C = ["Gm", "Bb", "F", "C"]


def chord_of(bar):
    if bar == 0:
        return "Fmaj7"
    if bar == 1:
        return "Dm7"
    if bar == 2:
        return "Bb"
    if bar == 3:
        return "Csus"
    if 28 <= bar < 36:
        return LOOP_C[(bar - 28) % 4]
    if bar in (36, 37):
        return "Csus" if bar == 36 else "C"
    if bar >= 42:
        return "F"
    return LOOP_A[(bar - 4) % 4]


# section map (frames) — drums on/off and intensity
BITES = [(b["at"], b["at"] + int(round(len(load_wav(os.path.join(sys.argv[1], b["id"] + ".wav"))) / SR * FPS)) + 6)
         for b in FILM["bites"]]


def in_bite(t):
    f = t * FPS
    return any(a - 2 <= f < b for a, b in BITES)


def energy(t):
    """0 intro/title · 1 groove A · 2 groove B · 3 groove C · 4 build · 5 finale · 6 message lift · 7 end"""
    f = t * FPS
    if f < 192:
        return 0
    if f < 576:
        return 1
    if f < 1344:
        return 2
    if f < 1716:
        return 3
    if f < 1824:
        return 4
    if f < 1992:
        return 5
    if f < 2052:
        return 6
    return 7


def render(audio_dir):
    drums, bass_b, chord_b, lead_b, pad_b, fx_b, speech_b, amb_b = (bus() for _ in range(8))
    K, CL, SN = V.kick(), V.clap(), V.snare()
    HC, HO, SH, WB = V.hat(False), V.hat(True), V.shaker(), V.wood()
    kick_times = []

    # ---- harmony bed (pads always; stabs/bass by section)
    for bar in range(NBARS):
        t0 = bar * BAR
        if t0 >= DUR:
            break
        c = CH[chord_of(bar)]
        e = energy(t0)
        pad_gain = 0.42 if e in (0, 6, 7) else 0.30
        add(pad_b, V.pad(c["tri"], BAR, cutoff=1500 if e == 0 else 2600), t0, pad_gain)
        for q in range(4):
            tb = t0 + q * BEAT
            eb = energy(tb)
            bite = in_bite(tb)
            # bass: sustained in intro/title/bites, 8th octave pattern in grooves
            if eb in (0, 6) or bite:
                if q == 0:
                    add(bass_b, V.bass_note(c["bass"] + 12, BAR * 0.95), tb, 0.16 if bite else 0.34)
            elif eb != 7:
                for k in range(2):
                    m = c["bass"] + 12 + (12 if k else 0)
                    add(bass_b, V.bass_note(m, S16 * 1.7), tb + k * 2 * S16, 0.42 if eb < 5 else 0.55)
            # chord stabs on the off-beat in grooves
            if not bite and eb in (2, 3, 5):
                add(chord_b, V.supersaw_chord(c["stab"], S16 * 1.6, cutoff=4200 if eb < 5 else 6200), tb + 2 * S16, 0.42 if eb < 5 else 0.55)
            # piano-ish plucks (arpeggio) — soft under bites, brighter in grooves
            arp = [c["tri"][(q * 2 + k) % 4] + 12 for k in range(2)]
            if eb in (0, 1, 3, 4) or bite:
                for k, m in enumerate(arp):
                    add(lead_b, V.pluck(m, 0.3, 0.6 if bite else 0.9), tb + k * 2 * S16, 0.16 if bite else 0.22, -0.3 if k else 0.3)

    # ---- drums per beat (off during bites, intro and the message lift)
    total_beats = int(DUR / BEAT)
    for bi in range(total_beats):
        tb = bi * BEAT
        e = energy(tb)
        if e in (0, 6, 7):
            continue
        q = bi % 4
        if in_bite(tb):  # 발언 중에는 하프타임 킥 + 셰이커만 남겨 흐름을 잇는다(음성 덕킹이 함께 걸린다)
            if q in (0, 2):
                add(drums, K, tb, 0.5)
                kick_times.append(tb)
            for s in (1, 3):
                add(drums, SH, tb + s * S16, 0.1, 0.4)
            continue
        if e == 1:  # half-time, light
            if q in (0, 2):
                add(drums, K, tb, 0.75)
                kick_times.append(tb)
            if q == 2:
                add(drums, CL, tb, 0.35, 0.05)
            for s in range(4):
                add(drums, SH, tb + s * S16, 0.26 if s % 2 else 0.15, 0.4)
        else:
            add(drums, K, tb, 0.9 if e < 5 else 1.0)
            kick_times.append(tb)
            if q in (1, 3):
                add(drums, CL, tb, 0.5, 0.05)
                add(drums, V.reverb(CL, V.IR_ROOM, 0.25), tb, 0.5)
            add(drums, HO, tb + 2 * S16, 0.26, 0.25)
            for s in (1, 3):
                add(drums, HC, tb + s * S16, 0.22, -0.2)
            if e in (3, 4, 5):
                for s in range(4):
                    add(drums, SH, tb + s * S16, 0.22 if s % 2 else 0.12, 0.45)
            if e == 5 and q in (0, 3):
                add(drums, WB, tb + 3 * S16, 0.25, -0.4)

    # ---- melodies: motif in grooves, the vlog hook in the finale
    MOTIF = [(0, 2, "A4"), (2, 2, "C5"), (4, 3, "F5"), (7, 1, "E5"), (8, 2, "D5"), (10, 2, "C5"), (12, 4, "A4")]
    for bar in range(4, 28):
        t0 = bar * BAR
        if in_bite(t0) or in_bite(t0 + BAR * 0.5):
            continue
        if bar % 4 == 0 and energy(t0) in (1, 2):
            for (s, ln, nm) in MOTIF:
                add(lead_b, V.pluck(n2m(nm), ln * S16 * 0.9, 1.0), t0 + s * S16, 0.32)
    HOOK = [
        [(0, 2, "C5"), (2, 2, "F5"), (4, 4, "A5"), (8, 2, "G5"), (10, 2, "F5"), (12, 4, "C5")],
        [(0, 2, "D5"), (2, 2, "F5"), (4, 4, "Bb5"), (8, 2, "G5"), (10, 2, "E5"), (12, 4, "C5")],
    ]
    for k, bar in enumerate(range(38, 42)):
        t0 = bar * BAR
        for (s, ln, nm) in HOOK[k % 2]:
            add(lead_b, V.pluck(n2m(nm), ln * S16 * 0.9, 1.0), t0 + s * S16, 0.46)
            add(lead_b, V.pluck(n2m(nm) - 12, ln * S16 * 0.9, 0.8), t0 + s * S16, 0.2, -0.2)

    # ---- FX
    add(fx_b, V.reverse_cymbal(1.6), 0.0, 0.5)
    add(fx_b, V.riser(1.9, 300, 7000, pitch=False), tf(96) - 1.95, 0.35)
    add(fx_b, V.impact(1.0), tf(96), 0.8)  # title
    add(fx_b, V.riser(3.4, 250, 10000), tf(1824) - 3.45, 0.6)  # into the finale
    for i, s in enumerate(np.concatenate([np.arange(0, 8, 1.0), np.arange(8, 16, 0.5)])):
        add(drums, SN, tf(1776) + s * S16, 0.1 + 0.3 * i / 24, 0.0)
    add(fx_b, V.impact(1.1), tf(1824), 0.85)  # finale drop
    add(fx_b, V.impact(0.6), tf(1920), 0.45)  # group photo
    add(fx_b, V.impact(1.0), tf(2052), 0.8)  # end card
    add(chord_b, V.supersaw_chord(CH["F"]["stab"] + [n2m("C5")], 1.6, cutoff=7000, rel=1.2), tf(2052), 0.6)
    add(bass_b, V.bass_note(CH["F"]["bass"] + 12, 1.4), tf(2052), 0.55)
    add(fx_b, V.chime(84), tf(2086), 0.5)  # CTA
    for sh in FILM["shots"]:
        t = tf(sh["from"])
        if sh["in"] == "dip":
            add(fx_b, V.whoosh(0.6, 2600, -0.4, 0.4), t - 0.3, 0.45)
            add(fx_b, V.chime(91), t + 0.05, 0.18)
        elif sh["in"] == "push":
            add(fx_b, V.whoosh(0.36, 4200, 0.7, -0.7), t - 0.2, 0.42)
        elif sh["kind"] == "split" and sh["in"] == "cut":
            add(fx_b, V.whoosh(0.3, 3800, -0.6, 0.6), t - 0.12, 0.3)
    for f, _ in FILM["recapWords"]:
        add(fx_b, V.pop(1200, 420), tf(f), 0.22)
    for ch in FILM["chapters"]:
        add(fx_b, V.pop(900, 300), tf(ch["at"] + 10), 0.15)

    # ---- speech + ambience
    for b in FILM["bites"]:
        add(speech_b, load_wav(os.path.join(audio_dir, b["id"] + ".wav")), tf(b["at"]), 1.0)
    for a in FILM["ambience"]:
        add(amb_b, load_wav(os.path.join(audio_dir, a["file"] + ".wav")), tf(a["at"]), a["gain"])

    # ---- sidechains: kick pump + speech ducking
    sc = np.ones(N, np.float32)
    for kt in kick_times:
        i = int(kt * SR)
        n = min(int(0.32 * SR), N - i)
        if n <= 0:
            continue
        tt = np.arange(n) / SR
        g = 1 - 0.55 * np.exp(-tt / 0.10) * np.clip(tt / 0.004, 0, 1)
        sc[i:i + n] = np.minimum(sc[i:i + n], g)
    chord_b *= sc[:, None]
    pad_b *= (0.65 + 0.35 * sc)[:, None]
    bass_b *= (0.3 + 0.7 * sc)[:, None]

    lead = lead_b + V.delay_pingpong(lead_b.mean(1), BEAT * 0.75, 0.3, 5) * 0.28 + V.reverb(lead_b.mean(1), V.IR_HALL, 0.22)
    chords = chord_b + V.reverb(chord_b.mean(1), V.IR_HALL, 0.18)
    pads = pad_b + V.reverb(pad_b.mean(1), V.IR_HALL, 0.32)
    drums_m = drums + V.reverb(drums.mean(1) * 0.25, V.IR_ROOM, 0.1)
    music = drums_m * 0.88 + V.filt(bass_b, "lp", 2500) * 0.92 + chords * 0.6 + pads * 0.72 + lead * 0.75

    # 음성 엔벨로프(30ms 평균) → 0.4s 최대값 홀드(앞뒤로 퍼져 미리 내려가고 천천히 올라온다)
    a = 1 - np.exp(-1.0 / (0.03 * SR))
    env = signal.lfilter([a], [1, -(1 - a)], np.abs(speech_b).max(1))
    env = maximum_filter1d(env, size=int(0.4 * SR))
    red = np.clip(env * 9, 0, 0.72)  # 감쇠량 — 0에서 시작하므로 필터 초기 상태 0이 맞다
    b = 1 - np.exp(-1.0 / (0.02 * SR))
    duck = 1 - signal.lfilter([b], [1, -(1 - b)], red)
    music *= duck[:, None]
    amb_env = signal.lfilter([0.002], [1, -0.998], np.abs(amb_b).max(1))
    music *= (1 - np.clip(amb_env * 5, 0, 0.3))[:, None]

    mix = music * 0.8 + fx_b * 0.8 + amb_b + speech_b * 1.9
    mix = V.filt(mix, "hp", 28)
    rms = np.sqrt(signal.lfilter([0.0015], [1, -0.9985], (mix ** 2).mean(1)) + 1e-9)
    thr = 0.18
    mix *= np.where(rms > thr, (thr / rms) ** 0.3, 1.0)[:, None]
    fo = int(0.6 * SR)
    mix = mix[: int(DUR * SR)]
    mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
    return master(mix, target_lufs=-14.0)


def master(mix, target_lufs=-14.0, ceil=0.72):
    """V.master와 같되 천장을 낮춰 인터샘플 피크(True Peak)까지 -1 dBTP 아래로"""
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    gain = 1.0
    for _ in range(4):
        y = V.limiter(mix * gain, ceil=ceil)
        gain *= 10 ** ((target_lufs - meter.integrated_loudness(y)) / 20)
    y = V.limiter(mix * gain, ceil=ceil)
    print(f"master: {meter.integrated_loudness(y):.2f} LUFS, peak {20*np.log10(np.abs(y).max()):.2f} dBFS")
    return np.clip(y, -1, 1)


def main():
    audio_dir, out = sys.argv[1], sys.argv[2]
    mix = render(audio_dir)
    w = wave.open(out, "wb")
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
    w.close()
    print("wrote", out, mix.shape[0] / SR, "s")


if __name__ == "__main__":
    main()

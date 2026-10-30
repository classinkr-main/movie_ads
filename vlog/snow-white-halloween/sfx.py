"""Synthesize a small library of comedic vlog sound effects (48kHz stereo WAV)."""
import sys, os, wave
import numpy as np

SR = 48000
out = sys.argv[1]
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def save(name, x, gain=0.9, stereo_spread=0.0):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        l = r = x
        if stereo_spread:
            d = int(SR * 0.004)
            r = np.concatenate([np.zeros(d), x[:-d]])
        x = np.stack([l, r], 1)
    peak = np.max(np.abs(x)) or 1
    x = x / peak * gain
    # tiny fades to avoid clicks
    f = min(240, len(x) // 4)
    ramp = np.linspace(0, 1, f)[:, None]
    x[:f] *= ramp
    x[-f:] *= ramp[::-1]
    pcm = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(out, name + ".wav"), "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def env_adsr(n, a, d, s, r):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sl = max(n - a - d - r, 0)
    e = np.concatenate([np.linspace(0, 1, a), np.linspace(1, s, d), np.full(sl, s), np.linspace(s, 0, r)])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def bandpass_sweep(noise, f0, f1, q=6.0):
    """Time-varying 2-pole resonant bandpass (state-variable filter)."""
    n = len(noise)
    fc = np.geomspace(f0, f1, n) if f0 > 0 and f1 > 0 else np.linspace(f0, f1, n)
    y = np.zeros(n); low = band = 0.0
    damp = 1.0 / q
    for i in range(n):
        f = 2 * np.sin(np.pi * fc[i] / SR)
        high = noise[i] - low - damp * band
        band += f * high
        low += f * band
        y[i] = band
    return y


def bell(freq, d, decay=3.0, partials=((1, 1), (2.76, 0.4), (5.4, 0.2), (8.93, 0.1))):
    tt = t(d)
    x = sum(a * np.sin(2 * np.pi * freq * m * tt) * np.exp(-decay * m ** 0.5 * tt) for m, a in partials)
    return x


def mix(length, items):
    buf = np.zeros(int(SR * length))
    for start, x in items:
        s = int(start * SR)
        e = min(len(buf), s + len(x))
        buf[s:e] += x[: e - s]
    return buf


# 1. whoosh (transition)
n = int(SR * 0.55)
w = bandpass_sweep(rng.standard_normal(n), 300, 4500, q=3) * np.sin(np.linspace(0, np.pi, n)) ** 2
save("whoosh", w, 0.8, stereo_spread=1)

# 1b. reverse whoosh into hit
n = int(SR * 0.45)
w2 = bandpass_sweep(rng.standard_normal(n), 5000, 400, q=3) * np.linspace(0, 1, n) ** 3
save("swoosh_in", w2, 0.8, stereo_spread=1)

# 2. pop (caption pop)
tt = t(0.09)
f = 900 * np.exp(-tt * 30) + 300
pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 45)
save("pop", pop, 0.7)

# 3. ding
save("ding", bell(1568, 1.2, decay=4), 0.6)

# 4. magic sparkle (transformation)
notes = [1046.5, 1318.5, 1568.0, 2093.0, 2637.0, 3136.0, 4186.0]
items = [(i * 0.06, bell(fq, 1.4, decay=5) * (0.9 - i * 0.05)) for i, fq in enumerate(notes)]
shimmer_n = int(SR * 1.6)
shimmer = bandpass_sweep(rng.standard_normal(shimmer_n), 6000, 9000, q=8) * np.exp(-t(1.6) * 2.5) * 0.6
items.append((0.0, shimmer))
save("magic", mix(1.9, items), 0.75, stereo_spread=1)

# 5. boing
tt = t(0.6)
fq = 180 + 140 * np.exp(-tt * 4) * (1 + 0.5 * np.sin(2 * np.pi * 14 * tt))
boing = np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-tt * 5)
save("boing", boing, 0.75)

# 6. record scratch
tt = t(0.5)
fq = 900 + 700 * np.sin(2 * np.pi * 7 * tt) * np.exp(-tt * 2)
scr = bandpass_sweep(rng.standard_normal(len(tt)), 2000, 600, q=2) * 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(fq) / SR)
scr *= env_adsr(len(tt), 0.005, 0.1, 0.6, 0.25)
save("scratch", scr, 0.7)


# 7. rimshot (ba-dum-tss)
def drum(f0, d, noise_amt=0.3):
    tt = t(d)
    body = np.sin(2 * np.pi * np.cumsum(f0 * (1 + np.exp(-tt * 40))) / SR) * np.exp(-tt * 18)
    return body + noise_amt * rng.standard_normal(len(tt)) * np.exp(-tt * 30)


def snare(d=0.18):
    tt = t(d)
    return 0.5 * np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 25) + bandpass_sweep(rng.standard_normal(len(tt)), 3500, 3000, q=1.2) * np.exp(-tt * 22)


def cymbal(d=1.4):
    tt = t(d)
    return bandpass_sweep(rng.standard_normal(len(tt)), 8000, 7000, q=1.5) * np.exp(-tt * 3.5)


save("badumtss", mix(1.9, [(0, drum(140, 0.25)), (0.16, drum(110, 0.3)), (0.42, cymbal() * 1.2), (0.42, snare() * 0.6)]), 0.8)

# 8. drumroll (2s, crescendo)
items = []
tm = 0.0
while tm < 1.9:
    items.append((tm, snare(0.08) * (0.3 + 0.7 * tm / 1.9)))
    tm += 0.045
save("drumroll", mix(2.0, items), 0.7)
save("drumroll_end", mix(3.4, items + [(2.0, cymbal(1.4) * 1.5), (2.0, drum(90, 0.3))]), 0.8)


# 9. ta-da fanfare (square-ish brass)
def brass(freq, d):
    tt = t(d)
    x = sum(np.sin(2 * np.pi * freq * k * tt) / k for k in range(1, 8, 1)) * env_adsr(len(tt), 0.02, 0.08, 0.7, 0.2)
    return x * (1 + 0.02 * np.sin(2 * np.pi * 5.5 * tt))


chord2 = sum(brass(f, 1.1) for f in (523.25, 659.25, 783.99, 1046.5))
save("tada", mix(1.4, [(0, sum(brass(f, 0.16) for f in (523.25, 659.25, 783.99))), (0.2, chord2)]), 0.7)

# 10. censor beep
tt = t(0.4)
save("beep", np.sin(2 * np.pi * 1000 * tt), 0.45)

# 11. camera shutter
c1 = rng.standard_normal(int(SR * 0.03)) * np.exp(-t(0.03) * 120)
c2 = rng.standard_normal(int(SR * 0.05)) * np.exp(-t(0.05) * 80)
save("shutter", mix(0.2, [(0, c1), (0.07, c2)]), 0.7)


# 12. dun dun dun (dramatic)
def low_brass(freq, d):
    tt = t(d)
    x = sum(np.sin(2 * np.pi * freq * k * tt) / k ** 0.8 for k in range(1, 12)) * env_adsr(len(tt), 0.015, 0.1, 0.75, 0.25)
    return x


save("dundun", mix(2.4, [(0, low_brass(146.8, 0.35)), (0.42, low_brass(130.8, 0.35)), (0.84, low_brass(123.5, 1.5))]), 0.8)

# 13. crickets (awkward silence)
items = []
for k in range(5):
    base = k * 0.42
    for j in range(3):
        tt = t(0.035)
        items.append((base + j * 0.05, np.sin(2 * np.pi * 4300 * tt) * np.sin(np.pi * tt / 0.035) * 0.4))
save("crickets", mix(2.2, items), 0.35)

# 14. slide whistle up / down
tt = t(0.6)
up = np.sin(2 * np.pi * np.cumsum(np.geomspace(500, 1800, len(tt))) / SR) * env_adsr(len(tt), 0.03, 0.1, 0.8, 0.1)
save("whistle_up", up, 0.5)
dn = np.sin(2 * np.pi * np.cumsum(np.geomspace(1800, 400, len(tt))) / SR) * env_adsr(len(tt), 0.03, 0.1, 0.8, 0.1)
save("whistle_down", dn, 0.5)

# 15. impact / hit
tt = t(0.6)
hit = np.sin(2 * np.pi * np.cumsum(60 + 120 * np.exp(-tt * 25)) / SR) * np.exp(-tt * 6) + 0.3 * rng.standard_normal(len(tt)) * np.exp(-tt * 40)
save("impact", hit, 0.9)

# 16. ascending "glitter" short (for title)
save("twinkle", mix(0.9, [(i * 0.05, bell(f, 0.6, decay=8) * 0.6) for i, f in enumerate((2093, 2637, 3136, 4186))]), 0.5)

# 17. quick tick (typing/text)
tick = rng.standard_normal(int(SR * 0.012)) * np.exp(-t(0.012) * 400)
save("tick", tick, 0.4)

# 18. "wrong" buzzer
tt = t(0.6)
bz = np.sign(np.sin(2 * np.pi * 110 * tt)) * 0.5 + np.sign(np.sin(2 * np.pi * 116 * tt)) * 0.5
save("buzzer", bz * env_adsr(len(tt), 0.01, 0.05, 0.9, 0.08), 0.35)

# 19. "correct" chime (two-note)
save("correct", mix(0.9, [(0, bell(1318.5, 0.6, decay=6)), (0.12, bell(1760, 0.8, decay=5))]), 0.55)

# 20. heartbeat / tension (2 beats)
def thump(d=0.15):
    tt = t(d)
    return np.sin(2 * np.pi * 55 * tt) * np.exp(-tt * 25)
save("heartbeat", mix(1.6, [(0, thump()), (0.22, thump() * 0.7), (0.8, thump()), (1.02, thump() * 0.7)]), 0.9)

print("done", sorted(os.listdir(out)))

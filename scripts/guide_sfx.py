"""BrandReel 가이드 사운드(20초) — 컷 타이밍 확인용 절차적 사운드 디자인.

최종 납품용 BGM이 아니다. 라이선스 음원을 고르기 전까지 편집 박자(휩 · 줌스루 · 로고 임팩트)를
소리로 확인하려는 용도이며, 타이밍 상수는 src/reel/theme.ts 의 씬 경계(60fps 프레임)를 초로 옮긴 값이다.

  python3 scripts/guide_sfx.py out/brand-reel-guide-sfx.wav
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, lfilter, sosfilt

SR = 48000
DUR = 20.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

L = np.zeros(N)
Rr = np.zeros(N)
SEND = np.zeros(N)  # 리버브 센드(모노)


def f2s(frame):
    return frame / 60.0


def note(name):
    names = {"C": 0, "C#": 1, "Db": 1, "D": 2, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "Ab": 8, "A": 9, "Bb": 10, "B": 11}
    p, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[p] + 12 * (o + 1) - 69) / 12)


def place(sig, at, gain=1.0, pan=0.0, send=0.0):
    i = int(at * SR)
    if i >= N:
        return
    s = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i : i + len(s)] += s * l
    Rr[i : i + len(s)] += s * r
    SEND[i : i + len(s)] += s * send


def place_st(sl, sr, at, gain=1.0, send=0.0):
    i = int(at * SR)
    n = min(len(sl), N - i)
    L[i : i + n] += sl[:n] * gain
    Rr[i : i + n] += sr[:n] * gain
    SEND[i : i + n] += (sl[:n] + sr[:n]) * 0.5 * gain * send


def env_adsr(n, a, d, s, r, total):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), 1.0)
    e = np.where((t >= a) & (t < a + d), 1 - (1 - s) * (t - a) / max(d, 1e-4), e)
    e = np.where(t >= a + d, s, e)
    rel = np.clip((t - (total - r)) / max(r, 1e-4), 0, 1)
    return e * (1 - rel)


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


# ---------- 악기 ----------

def kick(gain=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t * 400) * 0.25
    return np.tanh((body + click) * 1.4) * gain


def hat(gain=1.0, decay=70):
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    return lp(hp(rng.standard_normal(n), 6500, 4), 11000) * np.exp(-t * decay) * gain * 0.6


def whoosh(dur, peak_frac=0.8, lo=250, hi=4200):
    """노이즈 스윕 — peak_frac 지점에서 정점, 이후 빠르게 빠진다. (L, R) 반환."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    out = np.zeros(n)
    blocks = 64
    edges = np.linspace(0, n, blocks + 1).astype(int)
    zi = None
    for b in range(blocks):
        a, e = edges[b], edges[b + 1]
        p = (a + e) / 2 / n
        k = p / peak_frac if p < peak_frac else 1 - (p - peak_frac) / (1 - peak_frac) * 0.6
        fc = lo * (hi / lo) ** np.clip(k, 0, 1)
        bb, aa = butter(2, fc, "low", fs=SR)
        if zi is None:
            zi = np.zeros(max(len(aa), len(bb)) - 1)
        out[a:e], zi = lfilter(bb, aa, x[a:e], zi=zi)
    pk = int(peak_frac * n)
    envl = np.concatenate([np.linspace(0, 1, pk) ** 2.2, np.exp(-np.linspace(0, 6, n - pk))])
    s = out * envl
    pan = np.linspace(-0.7, 0.7, n)
    return s * np.cos((pan + 1) * np.pi / 4), s * np.sin((pan + 1) * np.pi / 4)


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    p = t / dur
    noise = lp(hp(rng.standard_normal(n), 600), 4500) * p**2.5 * 0.5
    f = 180 * (8 ** p)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * p**3 * 0.25
    return (noise + tone) * np.minimum(1, (1 - p) * 40)


def impact(gain=1.0):
    n = int(2.6 * SR)
    t = np.arange(n) / SR
    f = 38 + 70 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    crack = lp(rng.standard_normal(n), 3000) * np.exp(-t * 18) * 0.5
    return np.tanh((boom * 1.2 + crack) * 1.3) * gain


def bell(freq, dur=2.4, gain=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    idx = 2.2 * np.exp(-t * 3)
    s = np.sin(2 * np.pi * freq * t + idx * np.sin(2 * np.pi * freq * 3.5 * t)) * np.exp(-t * 2.6)
    s += 0.35 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t * 4)
    return s * gain


def pad_chord(notes, dur, gain=1.0, bright=1600):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sl = np.zeros(n)
    sr = np.zeros(n)
    for k, nm in enumerate(notes):
        f0 = note(nm)
        for j, det in enumerate((-0.11, 0.0, 0.12)):
            f = f0 * 2 ** (det / 12)
            ph = rng.uniform(0, 1)
            saw = 2 * ((f * t + ph) % 1) - 1
            pan = (j - 1) * 0.6
            sl += saw * np.cos((pan + 1) * np.pi / 4)
            sr += saw * np.sin((pan + 1) * np.pi / 4)
    e = env_adsr(n, min(0.35, dur * 0.3), 0.2, 0.85, min(0.6, dur * 0.4), dur)
    sl, sr = lp(sl, bright) * e, lp(sr, bright) * e
    norm = 2.4 / (len(notes) * 3)  # 패드는 킥 사이를 메우는 바닥이므로 넉넉히
    return sl * norm * gain, sr * norm * gain


def bass(nm, dur, gain=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = note(nm)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return np.tanh(s * 1.5) * env_adsr(n, 0.01, 0.15, 0.7, 0.12, dur) * gain


def pluck(nm, gain=1.0):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = note(nm)
    tri = 2 * np.abs(2 * ((f * t) % 1) - 1) - 1
    return lp(tri, 3500) * np.exp(-t * 9) * gain


# ---------- 편곡(초) ----------
S2_CUTS = [f2s(168 + 6 + 72 * i) for i in range(5)]  # 휩 컷 플래시 정점
GRID = f2s(528)
ZOOM_END = f2s(720)
ERASE = f2s(600 + 150)
HEADLINE = f2s(600 + 184)
PROOF = f2s(900)
LOGO = f2s(1050 + 6)
BEAT = 0.6  # 100 BPM — S2 한 컷(72f = 1.2s)이 두 박

# A. 인트로 드론 + 라이저 → 글자 줌스루 임팩트(2.0s)
drone_l, drone_r = pad_chord(["D2", "A2", "D3"], 3.2, gain=0.55, bright=500)
place_st(drone_l, drone_r, 0.0, gain=0.8, send=0.3)
place(riser(1.5), 0.55, gain=0.55, send=0.2)
place(impact(0.9), f2s(120), send=0.35)
place(bell(note("A5"), 2.6, 0.18), f2s(122), pan=0.2, send=0.6)

# B–C. 흐름 몽타주 — 컷마다 휩, 박마다 킥, 8분 하이햇, 1.2s마다 코드
CHORDS_C = [["D3", "F3", "A3", "C4", "E4"], ["Bb2", "D3", "F3", "A3"], ["A2", "C3", "F3", "A3"], ["C3", "E3", "G3", "D4"], ["D3", "F3", "A3", "C4"]]
BASS_C = ["D2", "Bb1", "F2", "C2", "D2"]
for i, cut in enumerate(S2_CUTS):
    wl, wr = whoosh(0.42, 0.86)
    place_st(wl, wr, cut - 0.36, gain=0.32, send=0.1)
    pl, pr = pad_chord(CHORDS_C[i], 1.3, gain=0.5)
    place_st(pl, pr, cut, gain=0.55, send=0.35)
    place(bass(BASS_C[i], 1.18, 0.32), cut)
    tones = CHORDS_C[i][1:] + [CHORDS_C[i][1][:-1] + str(int(CHORDS_C[i][1][-1]) + 1)]
    for k in range(8):  # 16분 아르페지오
        nm = tones[k % len(tones)]
        nm = nm[:-1] + str(int(nm[-1]) + 1)
        place(pluck(nm, 0.12), cut + k * BEAT / 4, pan=(-0.4 if k % 2 else 0.4), send=0.25)
for k in range(11):
    tt = S2_CUTS[0] + k * BEAT
    place(kick(0.75), tt)
    place(hat(0.16), tt + BEAT / 2, pan=0.25)

# D. 그리드 — 하프타임 킥, 흐름 펄스 상행 아르페지오, 줌 라이저 → 임팩트(12.0s)
for k in range(3):
    place(kick(0.6), GRID + 0.1 + k * 1.2)
gl, gr = pad_chord(["G2", "Bb2", "D3", "F3", "A3"], 2.75, gain=0.5, bright=1200)
place_st(gl, gr, GRID, gain=0.6, send=0.4)
for k, nm in enumerate(["D5", "F5", "A5", "C6", "D6", "F6"]):
    place(pluck(nm, 0.14), f2s(528 + 46) + k * 0.15, pan=-0.6 + k * 0.24, send=0.4)
al, ar = pad_chord(["A2", "D3", "E3", "G3"], 1.2, gain=0.5, bright=2200)
place_st(al, ar, ZOOM_END - 1.2, gain=0.6, send=0.4)
place(riser(1.25), ZOOM_END - 1.25, gain=0.7, send=0.2)
wl, wr = whoosh(0.9, 0.95, 200, 5500)
place_st(wl, wr, ZOOM_END - 0.86, gain=0.35)
place(impact(1.0), ZOOM_END, send=0.4)

# E. 히어로 — 밝은 장조(F)로 풀린다. 지우개 휩, 헤드라인 벨
fl, fr = pad_chord(["F2", "C3", "F3", "A3", "E4"], 1.6, gain=0.55, bright=2000)
place_st(fl, fr, ZOOM_END, gain=0.6, send=0.45)
cl, cr = pad_chord(["E2", "C3", "E3", "G3", "D4"], 1.6, gain=0.55, bright=2000)
place_st(cl, cr, ZOOM_END + 1.5, gain=0.6, send=0.45)
for k in range(5):
    place(kick(0.55), ZOOM_END + 0.6 + k * BEAT)
    place(hat(0.12), ZOOM_END + 0.9 + k * BEAT, pan=-0.2)
wl, wr = whoosh(0.5, 0.6, 400, 4500)
place_st(wl, wr, ERASE - 0.1, gain=0.25)
place(bell(note("C6"), 2.2, 0.2), HEADLINE, pan=-0.15, send=0.6)
place(bell(note("F5"), 2.2, 0.16), HEADLINE + 0.3, pan=0.15, send=0.6)

# F. 스케일 — 사선 스윕 휩, 숫자 롤 틱, 4박
wl, wr = whoosh(0.45, 0.8, 300, 5000)
place_st(wl, wr, PROOF - 0.32, gain=0.35)
bl, br = pad_chord(["Bb2", "D3", "F3", "A3", "C4"], 1.3, gain=0.5, bright=2200)
place_st(bl, br, PROOF, gain=0.6, send=0.4)
c2l, c2r = pad_chord(["C3", "E3", "G3", "D4"], 1.25, gain=0.5, bright=2200)
place_st(c2l, c2r, PROOF + 1.25, gain=0.6, send=0.4)
place(bass("Bb1", 1.2, 0.3), PROOF)
place(bass("C2", 1.2, 0.3), PROOF + 1.25)
for k in range(4):
    place(kick(0.6), PROOF + k * BEAT)
    place(hat(0.14), PROOF + BEAT / 2 + k * BEAT, pan=0.3)
for k in range(26):
    place(hat(0.07, decay=180), f2s(924) + k * 0.035 + (k // 9) * 0.12, pan=-0.3 + (k % 3) * 0.3)

# G. 엔드 — 아이리스 휩, 로고 임팩트 + 벨, F add9 해결 화음, 페이드
wl, wr = whoosh(0.4, 0.75, 300, 5000)
place_st(wl, wr, f2s(1050) - 0.28, gain=0.3)
place(impact(0.75), LOGO, send=0.5)
for k, nm in enumerate(["F5", "A5", "C6", "G6"]):
    place(bell(note(nm), 2.4, 0.12), LOGO + 0.05 + k * 0.09, pan=-0.3 + k * 0.2, send=0.7)
el, er = pad_chord(["F2", "C3", "F3", "A3", "C4", "G4"], DUR - LOGO, gain=0.6, bright=2400)
place_st(el, er, LOGO, gain=0.65, send=0.5)
place(bass("F1", 2.0, 0.35), LOGO)

# ---------- 리버브 · 마스터 ----------
ir_n = int(2.2 * SR)
ir_t = np.arange(ir_n) / SR
ir_l = rng.standard_normal(ir_n) * np.exp(-ir_t * 2.6)
ir_r = rng.standard_normal(ir_n) * np.exp(-ir_t * 2.6)
ir_l, ir_r = lp(ir_l, 6000), lp(ir_r, 6000)
ir_l /= np.sqrt(np.sum(ir_l**2))
ir_r /= np.sqrt(np.sum(ir_r**2))
wet_l = fftconvolve(SEND, ir_l)[:N] * 0.5
wet_r = fftconvolve(SEND, ir_r)[:N] * 0.5

mix = np.stack([L + wet_l, Rr + wet_r])
mix = hp(mix, 28)
fade = np.clip((DUR - t_all) / 0.9, 0, 1) ** 1.5
fade_in = np.clip(t_all / 0.05, 0, 1)
mix *= fade * fade_in
# 버스 컴프 대용: 부드러운 새추레이션 후 피크 정규화(-1 dBFS)
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix *= 10 ** (-1 / 20) / max(1e-9, np.max(np.abs(mix)))
rms = np.sqrt(np.mean(mix**2))
target = 10 ** (-16 / 20)
if rms > target:
    mix *= target / rms
    rms = target
print(f"peak {20 * np.log10(np.max(np.abs(mix))):.1f} dBFS · rms {20 * np.log10(rms):.1f} dBFS")

out = sys.argv[1] if len(sys.argv) > 1 else "out/brand-reel-guide-sfx.wav"
pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out)

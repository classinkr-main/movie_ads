"""부산 포럼 스케치용 오리지널 음악(MIDI). tools/forum/music.sh 가 FluidR3 GM 사운드폰트로 렌더한다.

usage: compose_music.py <highlight|live> <out.mid>   (pip install mido)
  highlight  100 BPM, D장조 I–V–vi–IV, 32마디(76.8초): 인트로 4 · A 8 · B 8 · A' 8 · 아웃트로 4
  live        84 BPM, 피아노·현악·벨만 쓰는 잔잔한 28마디(80초)
"""
import sys, random
import mido
random.seed(7)
variant, out = sys.argv[1], sys.argv[2]
TPB = 480
BPM = 100 if variant == "highlight" else 84
mid = mido.MidiFile(ticks_per_beat=TPB)
def track(ch, program, name, vol=100, pan=64, rev=60, cho=0):
    t = mido.MidiTrack(); mid.tracks.append(t)
    t.append(mido.MetaMessage("track_name", name=name))
    if ch != 9: t.append(mido.Message("program_change", channel=ch, program=program))
    for cc, v in ((7, vol), (10, pan), (91, rev), (93, cho)):
        t.append(mido.Message("control_change", channel=ch, control=cc, value=v))
    return t
events = {}  # track -> list of (tick, msg)
def note(tr, ch, pitch, start_beat, dur_beat, vel):
    s = int(start_beat * TPB); e = int((start_beat + dur_beat) * TPB)
    events.setdefault(id(tr), (tr, []))[1].extend([(s, mido.Message("note_on", channel=ch, note=pitch, velocity=max(1, min(127, vel)))), (e, mido.Message("note_off", channel=ch, note=pitch, velocity=0))])
# D major: I V vi IV  -> D A Bm G ; second half: G A F#m Bm -> resolves
D, A, Bm, G, Em, Fsm = [62, 66, 69], [57, 61, 64], [59, 62, 66], [55, 59, 62], [52, 55, 59], [54, 57, 61]
roots = {"D": 38, "A": 33, "Bm": 35, "G": 31, "Em": 28, "F#m": 30}
chords = {"D": D, "A": A, "Bm": Bm, "G": G, "Em": Em, "F#m": Fsm}
prog_a = ["D", "A", "Bm", "G"]
prog_b = ["G", "A", "F#m", "Bm", "G", "A", "D", "D"]
tempo_tr = mido.MidiTrack(); mid.tracks.insert(0, tempo_tr)
tempo_tr.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(BPM)))
piano = track(0, 0, "piano", vol=96, pan=58, rev=70)
strings = track(1, 48, "strings", vol=70, pan=72, rev=90, cho=30)
bass = track(2, 33, "bass", vol=92, pan=64, rev=20)
pluck = track(3, 11 if variant == "highlight" else 8, "bell", vol=58, pan=80, rev=90)  # vibraphone / celesta
drums = track(9, 0, "drums", vol=90, pan=64, rev=35)

def piano_arp(bar, ch_name, vel=70, density=8):
    c = chords[ch_name]; tones = [c[0] - 12, c[0], c[1], c[2], c[0] + 12, c[2], c[1], c[0]]
    for i in range(density):
        step = 4 / density
        note(piano, 0, tones[i % len(tones)], bar * 4 + i * step, step * 1.6, vel + random.randint(-6, 6) - (4 if i % 2 else 0))
def piano_block(bar, ch_name, vel=62):
    c = chords[ch_name]
    for p in [c[0] - 12] + c: note(piano, 0, p, bar * 4, 3.8, vel + random.randint(-4, 4))
def pad(bar, ch_name, vel=52, bars=1):
    for p in chords[ch_name]: note(strings, 1, p - 12, bar * 4, 4 * bars - 0.1, vel)
    note(strings, 1, chords[ch_name][0] + 12, bar * 4, 4 * bars - 0.1, vel - 12)
def bassline(bar, ch_name, vel=86, style="drive"):
    r = roots[ch_name]
    if style == "long": note(bass, 2, r, bar * 4, 3.9, vel); return
    for i, (b, d) in enumerate([(0, 0.9), (1.5, 0.45), (2, 0.9), (3, 0.45), (3.5, 0.45)]):
        note(bass, 2, r + (12 if i == 4 else 0), bar * 4 + b, d, vel - (8 if i else 0))
def melody_bar(bar, seq, vel=70):
    for b, p, d in seq: note(pluck, 3, p, bar * 4 + b, d, vel + random.randint(-5, 5))
KICK, SNARE, CLAP, HAT, OHAT, SHAKER, CRASH, RIDE = 36, 38, 39, 42, 46, 70, 49, 51
def drum_bar(bar, level):
    o = bar * 4
    if level >= 1:
        for i in range(8): note(drums, 9, HAT, o + i * 0.5, 0.2, 58 if i % 2 else 72)
    if level >= 2:
        for b in (0, 2.5) if level == 2 else (0, 1, 2, 3): note(drums, 9, KICK, o + b, 0.3, 96)
        for b in (1, 3): note(drums, 9, CLAP, o + b, 0.3, 78 if level == 2 else 90)
    if level >= 3:
        for i in range(16):
            if i % 4 == 2: note(drums, 9, SHAKER, o + i * 0.25, 0.15, 60)
        note(drums, 9, OHAT, o + 3.5, 0.4, 70)
# melodic motif (vibraphone) over D A Bm G
motif = {
    "D": [(0, 74, 0.75), (1, 76, 0.5), (1.5, 78, 1.5), (3, 76, 1)],
    "A": [(0, 73, 0.75), (1, 74, 0.5), (1.5, 76, 1.5), (3, 73, 1)],
    "Bm": [(0, 71, 0.75), (1, 73, 0.5), (1.5, 74, 1.5), (3, 78, 1)],
    "G": [(0, 79, 1.5), (1.5, 78, 0.5), (2, 76, 1.0), (3, 74, 1)],
    "F#m": [(0, 73, 1.5), (1.5, 76, 0.5), (2, 78, 2)],
    "Em": [(0, 71, 2), (2, 74, 2)],
}
if variant == "highlight":
    # 32 bars @100bpm = 76.8s : intro 4 | A 8 | B 8 | A' 8 | outro 4
    bar = 0
    for i in range(4):  # intro: piano arps + soft pad
        c = prog_a[i % 4]; piano_arp(bar, c, 58, 8); pad(bar, c, 40); bar += 1
    for i in range(8):  # A: + hats + motif + bass long
        c = prog_a[i % 4]; piano_arp(bar, c, 64); pad(bar, c, 50); bassline(bar, c, 80, "long"); drum_bar(bar, 1)
        if i >= 4: melody_bar(bar, motif[c], 62)
        bar += 1
    note(drums, 9, CRASH, bar * 4, 2, 80)
    for i in range(8):  # B: lift, drums level 2, driving bass
        c = prog_b[i]; piano_arp(bar, c, 70); pad(bar, c, 58); bassline(bar, c, 88); drum_bar(bar, 2); melody_bar(bar, motif[c], 70); bar += 1
    note(drums, 9, CRASH, bar * 4, 2, 92)
    for i in range(8):  # A': full
        c = prog_a[i % 4]; piano_arp(bar, c, 74); pad(bar, c, 62); bassline(bar, c, 92); drum_bar(bar, 3); melody_bar(bar, motif[c], 76); bar += 1
    note(drums, 9, CRASH, bar * 4, 3, 84)
    for i, c in enumerate(["G", "A", "D", "D"]):  # outro
        if i < 3: piano_arp(bar, c, 62 - i * 4, 8)
        else: piano_block(bar, "D", 58)
        pad(bar, c, 50 - i * 4); bassline(bar, c, 76, "long"); bar += 1
else:
    # live: gentle 84bpm, 28 bars ~80s, piano + strings + soft bells, no drums except light shaker mid
    bar = 0
    seq = prog_a * 2 + prog_b + prog_a * 2 + ["G", "A", "D", "D"]
    for i, c in enumerate(seq):
        piano_arp(bar, c, 56 if i < 8 else 62, 8)
        pad(bar, c, 38 if i < 4 else 48)
        if i >= 4: bassline(bar, c, 70, "long")
        if 8 <= i < 24: melody_bar(bar, motif[c], 56)
        if 8 <= i < 16:
            for k in range(8): note(drums, 9, SHAKER, bar * 4 + k * 0.5, 0.15, 40 + (8 if k % 2 == 0 else 0))
        bar += 1
for key, (tr, evs) in events.items():
    evs.sort(key=lambda x: (x[0], 0 if x[1].type == "note_off" else 1))
    last = 0
    for t, m in evs:
        tr.append(m.copy(time=t - last)); last = t
mid.save(out)
print("bars", bar, "sec", bar * 4 * 60 / BPM)

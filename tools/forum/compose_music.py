"""부산 포럼 스케치용 오리지널 음악(MIDI). tools/forum/music.sh 가 FluidR3 GM 사운드폰트로 렌더한다.

usage: compose_music.py <highlight|live|speakers|sketch> <out.mid>   (pip install mido)
  highlight  100 BPM, D장조 I–V–vi–IV, 32마디(76.8초): 인트로 4 · A 8 · B 8 · A' 8 · 아웃트로 4
  live        84 BPM, 피아노·현악·벨만 쓰는 잔잔한 28마디(80초)
  speakers   100 BPM, 50마디(120초): 인트로 4 · 연설 8 · 발표 8 · 발표 10 · 빌드 2 · 몽타주 6 · 피날레 8 · 아웃트로 4
  sketch     100 BPM, 24마디(57.6초): 타이틀 2 · 탐방 9 · 포럼 2 · 연사 5 · 바이트 2 · 단체 사진 2 · 아웃트로 2
  style      120 BPM, B단조 vi–IV–I–V 하우스 그루브, 29마디(58초): 인트로 2 · 탐방 11 · 포럼 9 · 빌드 1 · 드롭 3 · 아웃트로 3
  short      120 BPM, style 과 같은 재료로 15마디(30초): 인트로 2 · 탐방 5 · 포럼 4 · 빌드 1 · 드롭 2 · 아웃트로 1
"""
import sys, random
import mido
random.seed(7)
variant, out = sys.argv[1], sys.argv[2]
TPB = 480
BPM = {"live": 84, "style": 120, "short": 120}.get(variant, 100)
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
elif variant == "speakers":
    # 하이라이트편(연사): 연사 사운드바이트 구간은 가볍게, 몽타주에서 올리고, 단체 사진 구호 구간은 비운다
    bar = 0
    for i in range(4):  # intro
        c = prog_a[i % 4]; piano_arp(bar, c, 58, 8); pad(bar, c, 40); bar += 1
    for blk in range(2):  # 연설·발표 1–3: hats + long bass, motif only in second half
        for i in range(8):
            c = prog_a[i % 4]; piano_arp(bar, c, 62); pad(bar, c, 48); bassline(bar, c, 76, "long"); drum_bar(bar, 1)
            if blk == 1 and i >= 4: melody_bar(bar, motif[c], 58)
            bar += 1
    for i in range(10):  # 발표 3–6: lift to B progression, light kick
        c = (prog_b + ["G", "A"])[i]; piano_arp(bar, c, 66); pad(bar, c, 54); bassline(bar, c, 82); drum_bar(bar, 2 if i >= 2 else 1); bar += 1
    for i, c in enumerate(["G", "A"]):  # build
        piano_arp(bar, c, 70, 16 if i else 8); pad(bar, c, 60); bassline(bar, c, 86); drum_bar(bar, 2)
        if i: [note(drums, 9, SNARE, bar * 4 + k * 0.25, 0.2, 50 + k * 4) for k in range(16)]
        bar += 1
    note(drums, 9, CRASH, bar * 4, 2, 92)
    for i in range(6):  # 몽타주: full
        c = prog_a[i % 4]; piano_arp(bar, c, 74); pad(bar, c, 62); bassline(bar, c, 92); drum_bar(bar, 3); melody_bar(bar, motif[c], 76); bar += 1
    note(drums, 9, CRASH, bar * 4, 2, 84)
    for i in range(8):  # 피날레: bars 2–5 thin out for the group-photo countdown
        c = prog_b[i]; quiet = 2 <= i <= 5
        piano_arp(bar, c, 56 if quiet else 70, 4 if quiet else 8); pad(bar, c, 44 if quiet else 58)
        bassline(bar, c, 70 if quiet else 88, "long" if quiet else "drive")
        if not quiet: drum_bar(bar, 2); melody_bar(bar, motif[c], 70)
        bar += 1
    note(drums, 9, CRASH, bar * 4, 3, 80)
    for i, c in enumerate(["G", "A", "D", "D"]):  # outro
        if i < 3: piano_arp(bar, c, 62 - i * 4, 8)
        else: piano_block(bar, "D", 58)
        pad(bar, c, 50 - i * 4); bassline(bar, c, 74, "long"); bar += 1
elif variant == "sketch":
    # 1분 스케치: 탐방은 가볍게 걷는 느낌, 포럼에서 한 단계 올리고, 바이트 구간은 비우고, 단체 사진에서 터뜨린다
    bar = 0
    for i, c in enumerate(["D", "A"]):  # 타이틀
        piano_arp(bar, c, 60, 8); pad(bar, c, 42); bar += 1
    for i in range(9):  # 탐방
        c = (prog_a * 3)[i]; piano_arp(bar, c, 64); pad(bar, c, 50); bassline(bar, c, 80, "long"); drum_bar(bar, 1)
        if i >= 4: melody_bar(bar, motif[c], 62)
        bar += 1
    note(drums, 9, CRASH, bar * 4, 2, 84)
    for i in range(7):  # 포럼 2 + 연사 5
        c = prog_b[i]; piano_arp(bar, c, 70); pad(bar, c, 58); bassline(bar, c, 88); drum_bar(bar, 2); melody_bar(bar, motif[c], 70); bar += 1
    for i, c in enumerate(["G", "A"]):  # 바이트: 얇게 깔고 끝에서 스네어 롤로 올린다
        piano_arp(bar, c, 56, 4); pad(bar, c, 46); bassline(bar, c, 70, "long")
        if i: [note(drums, 9, SNARE, bar * 4 + 2 + k * 0.25, 0.2, 44 + k * 6) for k in range(8)]
        bar += 1
    note(drums, 9, CRASH, bar * 4, 2, 96)
    for i, c in enumerate(["D", "A"]):  # 단체 사진
        piano_arp(bar, c, 76); pad(bar, c, 62); bassline(bar, c, 92); drum_bar(bar, 3); melody_bar(bar, motif[c], 78); bar += 1
    note(drums, 9, CRASH, bar * 4, 3, 80)
    piano_arp(bar, "G", 62, 8); pad(bar, "G", 50); bassline(bar, "G", 74, "long"); bar += 1
    piano_block(bar, "D", 60); pad(bar, "D", 46); bassline(bar, "D", 72, "long"); bar += 1
elif variant == "live":
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
if variant in ("style", "short"):
    # 스타일편: 4박 킥·오프비트 베이스·EP 스탭, 패드는 박마다 볼륨을 눌러 사이드체인처럼 숨 쉬게 한다
    ep = track(10, 4, "ep", vol=84, pan=56, rev=55)
    warm = track(11, 89, "pad", vol=78, pan=70, rev=80, cho=40)
    sbass = track(12, 38, "synth bass", vol=96, pan=64, rev=10)
    glock = track(13, 9, "glock", vol=60, pan=82, rev=85)
    lift = track(14, 48, "strings", vol=66, pan=44, rev=90, cho=30)
    sweep = track(15, 119, "reverse cymbal", vol=70, pan=64, rev=60)
    S = {"Bm": [59, 62, 66], "G": [59, 62, 67], "D": [57, 62, 66], "A": [57, 61, 64]}
    R = {"Bm": 35, "G": 31, "D": 38, "A": 33}
    loop = ["Bm", "G", "D", "A"]
    hook = {"Bm": [(0, 78, 0.5), (0.5, 81, 0.5), (1, 83, 1), (2.5, 81, 0.5), (3, 78, 1)],
            "G": [(0, 79, 0.5), (0.5, 78, 0.5), (1, 74, 1.5), (3, 76, 1)],
            "D": [(0, 74, 0.5), (0.5, 76, 0.5), (1, 78, 1), (2.5, 81, 0.5), (3, 78, 1)],
            "A": [(0, 76, 1), (1, 73, 1), (2, 76, 0.5), (2.5, 78, 0.5), (3, 76, 1)]}
    def cc(tr, ch, beat, ctl, val):
        events.setdefault(id(tr), (tr, []))[1].append((int(beat * TPB), mido.Message("control_change", channel=ch, control=ctl, value=val)))
    def pump(bar, depth=1.0):
        for b in range(4):
            for off, v in ((0, 40), (0.12, 62), (0.25, 84), (0.5, 104), (0.75, 116)):
                cc(warm, 11, bar * 4 + b + off, 11, int(116 - (116 - v) * depth))
    def groove(bar, c, level):
        # level 0 인트로(킥만) · 1 탐방 · 2 포럼 · 3 드롭
        o = bar * 4
        for b in range(4): note(drums, 9, KICK, o + b, 0.3, 100 if level else 84)
        for p in S[c]: note(warm, 11, p - 12, o, 3.95, 54 if level < 2 else 62)
        pump(bar, 0.6 if level else 0.3)
        if level == 0:
            for p in S[c]: note(ep, 10, p, o, 0.4, 64)
            return
        for b in (1, 3): note(drums, 9, CLAP, o + b, 0.3, 84 if level == 1 else 96)
        for b in range(4):
            note(drums, 9, OHAT, o + b + 0.5, 0.3, 62 if level == 1 else 72)
            note(sbass, 12, R[c] + (12 if level >= 2 and b % 2 else 0), o + b + 0.5, 0.42, 92)
            for p in S[c]: note(ep, 10, p, o + b + 0.5, 0.22, 60 + random.randint(-4, 4))
        note(sbass, 12, R[c], o, 0.3, 80)
        if level >= 2:
            for i in range(16):
                if i % 2: note(drums, 9, HAT, o + i * 0.25, 0.1, 50 + (10 if i % 4 == 3 else 0))
            for p in S[c]: note(lift, 14, p, o, 3.9, 46 if level == 2 else 58)
        if level >= 3:
            for i in range(8): note(drums, 9, 54, o + i * 0.5 + 0.25, 0.1, 56)  # tambourine
    def melody(bar, c, vel=70):
        for b, p, d in hook[c]: note(glock, 13, p, bar * 4 + b, d, vel + random.randint(-4, 4))
    def roll(bar, start=2):
        for k in range(int((4 - start) * 4)): note(drums, 9, SNARE, bar * 4 + start + k * 0.25, 0.2, 46 + k * 6)
    def riser(bar):
        note(sweep, 15, 60, bar * 4, 3.9, 90)
    plan = ([("intro", 2), ("tour", 11), ("forum", 9), ("build", 1), ("drop", 3), ("outro", 3)] if variant == "style"
            else [("intro", 2), ("tour", 5), ("forum", 4), ("build", 1), ("drop", 2), ("outro", 1)])
    bar = 0
    for part, n in plan:
        for i in range(n):
            c = loop[bar % 4]
            if part == "intro":
                groove(bar, c, 0)
                if i == n - 1: riser(bar)
            elif part == "tour":
                if i == 0: note(drums, 9, CRASH, bar * 4, 2, 88)
                groove(bar, c, 1)
                if i >= 4: melody(bar, c, 62)
                if i == n - 1: roll(bar, 3)
            elif part == "forum":
                if i == 0: note(drums, 9, CRASH, bar * 4, 2, 96)
                groove(bar, c, 2); melody(bar, c, 72)
            elif part == "build":
                for p in S[c]: note(warm, 11, p - 12, bar * 4, 3.95, 60)
                for b in (0, 1): note(drums, 9, KICK, bar * 4 + b, 0.3, 96)
                roll(bar, 1.5); riser(bar)
            elif part == "drop":
                if i == 0: note(drums, 9, CRASH, bar * 4, 3, 104)
                groove(bar, c, 3); melody(bar, c, 80)
            else:
                if i == 0: note(drums, 9, CRASH, bar * 4, 3, 84)
                last = i == n - 1
                for p in S["D" if last else c]: note(warm, 11, p - 12, bar * 4, 3.95, 56 - i * 4); note(ep, 10, p, bar * 4, 3.0 if last else 1.0, 62)
                note(sbass, 12, R["D" if last else c], bar * 4, 3.5, 78)
                if not last: melody(bar, c, 58)
                cc(warm, 11, bar * 4, 11, 116)
            bar += 1

for key, (tr, evs) in events.items():
    evs.sort(key=lambda x: (x[0], 0 if x[1].type == "note_off" else 1))
    last = 0
    for t, m in evs:
        tr.append(m.copy(time=t - last)); last = t
mid.save(out)
print("bars", bar, "sec", bar * 4 * 60 / BPM)

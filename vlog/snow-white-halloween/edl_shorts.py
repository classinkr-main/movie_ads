"""Edit decision list for the 9:16 shorts cut (under 60s).

Same conventions as edl.py. Vertical shots crop an 810x1080 (3:4) window from the 16:9 source and
follow `vcx` keyframes [(source_t, center_x_px), ...] produced by track.py; `layout="fit"` shows the
whole 16:9 frame over a blurred fill instead (used where two people and their hands must stay in shot).
Captions are Nanum Myeongjo only, with plain fades: no pop-up stickers or gag sounds.
"""

SIZE = (1080, 1920)
VIDEO_WINDOW = (1440, 360)  # picture height and top offset; title sits in the band above

CLIP_GAIN_DB = {"0520": 5, "0521": 5, "0523": 7, "0525": 3, "0526": 7, "0527": 3, "0528": 0, "0529": 0, "0530": 4}

SW = "SubSW"  # Snow White
Q = "SubQ"    # crew
N = "Sub"     # kids / unclear speaker

STYLES = """[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: SubSW,NanumMyeongjoExtraBold,68,&H00FFFFFF,&H00FFFFFF,&H00101010,&H8C000000,0,0,0,0,100,100,1,0,1,4,2,2,60,60,370,1
Style: SubQ,NanumMyeongjo,62,&H00B8F1FF,&H00FFFFFF,&H00101010,&H8C000000,-1,0,0,0,100,100,1,0,1,4,2,2,60,60,370,1
Style: Sub,NanumMyeongjo,62,&H00DDDDDD,&H00FFFFFF,&H00101010,&H8C000000,-1,0,0,0,100,100,1,0,1,4,2,2,60,60,370,1
Style: Note,NanumMyeongjo,48,&H00F0F0F0,&H00FFFFFF,&H00101010,&H8C000000,-1,0,0,0,100,100,2,0,1,3,2,8,70,70,405,1
Style: Kicker,NanumMyeongjo,44,&H00CFCFCF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,6,0,1,0,0,5,40,40,0,1
Style: Title,NanumMyeongjoExtraBold,82,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,2,0,1,0,0,5,40,40,0,1
Style: Princess,NanumMyeongjoExtraBold,80,&H00FFFFFF,&H00FFFFFF,&H00B98CFF,&H00000000,0,0,0,0,100,100,8,0,1,5,0,2,60,60,400,1
Style: Draw,Arial,20,&H00FFFFFF,&H00FFFFFF,&H00FFFFFF,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
"""
SUB_ANIM = r"{\fad(90,70)}"
CAP_ANIM = r"{\fad(120,90)}"

GLOBAL_CAPS = [
    (0.0, None, "할로윈 벌칙 브이로그", "Kicker", (540, 182)),
    (0.0, None, "가위바위보 지면 백설공주", "Title", (540, 268)),
]


def clip(src, a, b, **kw):
    return {"kind": "clip", "src": src, "a": a, "b": b, **kw}


def freeze(src, t, dur, **kw):
    return {"kind": "freeze", "src": src, "t": t, "dur": dur, **kw}


def sparkles(t0, t1, n, seed, x=(90, 990), y=(450, 1680), size=(18, 46)):
    """Twinkling four-point stars (ASS vector drawings) scattered over the picture between t0 and t1."""
    import random
    rnd = random.Random(seed)
    colors = ["&HFFFFFF&", "&H9CE8FF&", "&HD9C2FF&"]  # white, pale gold, pale pink (BGR)
    out = []
    for i in range(n):
        r = rnd.randint(*size)
        w = max(2, r // 6)
        c = r
        star = (f"m {c} 0 b {c + w} {c - w} {c + w} {c - w} {2 * r} {c} b {c + w} {c + w} {c + w} {c + w} {c} {2 * r} "
                f"b {c - w} {c + w} {c - w} {c + w} 0 {c} b {c - w} {c - w} {c - w} {c - w} {c} 0")
        d = rnd.uniform(0.45, 0.85)
        st = t0 + (t1 - t0 - d) * i / max(1, n - 1) + rnd.uniform(-0.08, 0.08)
        st = min(max(t0, st), t1 - d)
        ms = int(d * 1000)
        tag = (f"{{\\an5\\pos({rnd.randint(*x)},{rnd.randint(*y)})\\bord0\\shad0\\blur{rnd.choice([1, 2, 3])}"
               f"\\1c{rnd.choice(colors)}\\fscx0\\fscy0\\frz{rnd.randint(0, 45)}"
               f"\\t(0,{ms // 2},\\fscx100\\fscy100)\\t({ms // 2},{ms},\\fscx0\\fscy0\\frz{rnd.randint(46, 90)})\\p1}}")
        out.append((round(st, 3), round(st + d, 3), tag + star + "{\\p0}", "Draw"))
    return out


# ── transformation light show (ASS vector drawings, clipped to the picture window) ──────────────
WIN_CLIP = r"\clip(0,360,1080,1800)"
GLITTER = ["&HFFFFFF&", "&H9CE8FF&", "&HD9C2FF&", "&HFFE0C8&", "&H80F0FF&"]  # white, gold, pink, lavender, yellow


def _star(r, waist=6):
    w, c = max(2, r // waist), r
    return (f"m {c} 0 b {c + w} {c - w} {c + w} {c - w} {2 * r} {c} b {c + w} {c + w} {c + w} {c + w} {c} {2 * r} "
            f"b {c - w} {c + w} {c - w} {c + w} 0 {c} b {c - w} {c - w} {c - w} {c - w} {c} 0")


def _disc(r):
    k = 0.5523 * r
    return (f"m {r} 0 b {r + k:.0f} 0 {2 * r} {r - k:.0f} {2 * r} {r} b {2 * r} {r + k:.0f} {r + k:.0f} {2 * r} {r} {2 * r} "
            f"b {r - k:.0f} {2 * r} 0 {r + k:.0f} 0 {r} b 0 {r - k:.0f} {r - k:.0f} 0 {r} 0")


def burst(t, cx, cy, n, seed, dist=(240, 560), life=(0.55, 1.05), size=(10, 28)):
    """Glitter exploding outward from (cx, cy)."""
    import math, random
    rnd = random.Random(seed)
    out = []
    for i in range(n):
        a = 2 * math.pi * i / n + rnd.uniform(-0.2, 0.2)
        d, life_s, r = rnd.uniform(*dist), rnd.uniform(*life), rnd.randint(*size)
        x2, y2 = int(cx + d * math.cos(a)), int(cy + d * math.sin(a))
        ms = int(life_s * 1000)
        tag = (f"{{\\an5\\move({cx},{cy},{x2},{y2},0,{ms}){WIN_CLIP}\\bord0\\shad0\\blur2\\1c{rnd.choice(GLITTER)}"
               f"\\fad(0,{ms // 2})\\frz{rnd.randint(0, 45)}\\t(\\frz{rnd.randint(90, 200)})\\p1}}")
        st = t + rnd.uniform(0, 0.08)
        out.append((round(st, 3), round(st + life_s, 3), tag + _star(r) + "{\\p0}", "Draw"))
    return out


def rays(t, cx, cy, dur, n=16, radius=900, seed=1, color="&H9CE8FF&", alpha="&H50&", spin=28):
    """Thin light rays fanning out from (cx, cy), spinning slowly while they swell and fade."""
    import math, random
    rnd = random.Random(seed)
    R = radius
    path = []
    for i in range(n):
        a = 2 * math.pi * i / n + rnd.uniform(-0.08, 0.08)
        w = rnd.uniform(0.025, 0.06)
        L = R * rnd.uniform(0.6, 1.0)
        p1 = (R + L * math.cos(a - w), R + L * math.sin(a - w))
        p2 = (R + L * math.cos(a + w), R + L * math.sin(a + w))
        path.append(f"m {R} {R} l {p1[0]:.0f} {p1[1]:.0f} {p2[0]:.0f} {p2[1]:.0f}")
    # invisible corner points pin the drawing's box to 0..2R so \an5 centres it on (cx, cy)
    path.append(f"m 0 0 l 1 0 1 1 m {2 * R} {2 * R} l {2 * R - 1} {2 * R} {2 * R - 1} {2 * R - 1}")
    ms = int(dur * 1000)
    tag = (f"{{\\an5\\pos({cx},{cy}){WIN_CLIP}\\bord0\\shad0\\blur10\\1c{color}\\1a{alpha}\\fscx35\\fscy35"
           f"\\t(0,{int(ms * 0.35)},\\fscx115\\fscy115)\\t(0,{ms},\\frz{spin})\\fad(60,{int(ms * 0.55)})\\p1}}")
    return [(round(t, 3), round(t + dur, 3), tag + " ".join(path) + "{\\p0}", "Draw")]


def glow(t, cx, cy, dur, r=300, color="&HC8F4FF&"):
    """Soft radial bloom that blooms out of the flash."""
    ms = int(dur * 1000)
    tag = (f"{{\\an5\\pos({cx},{cy}){WIN_CLIP}\\bord0\\shad0\\blur60\\1c{color}\\1a&H40&\\fscx50\\fscy50"
           f"\\t(0,{ms},\\fscx170\\fscy170\\1a&HFF&)\\p1}}")
    return [(round(t, 3), round(t + dur, 3), tag + _disc(r) + "{\\p0}", "Draw")]


def glitter_rain(t0, t1, n, seed, x=(40, 1040)):
    """Fine glitter drifting down through the window."""
    import random
    rnd = random.Random(seed)
    out = []
    for i in range(n):
        life_s = rnd.uniform(1.2, 2.2)
        st = t0 + (t1 - t0 - life_s) * i / max(1, n - 1) + rnd.uniform(-0.1, 0.1)
        st = min(max(t0, st), t1 - life_s)
        x1 = rnd.randint(*x)
        y1 = rnd.randint(360, 900)
        ms = int(life_s * 1000)
        r = rnd.randint(4, 11)
        shape = _star(r * 2) if rnd.random() < 0.4 else _disc(r)
        tag = (f"{{\\an5\\move({x1},{y1},{x1 + rnd.randint(-60, 60)},{y1 + rnd.randint(380, 700)},0,{ms}){WIN_CLIP}"
               f"\\bord0\\shad0\\blur1\\1c{rnd.choice(GLITTER)}\\fad(150,{ms // 2})\\p1}}")
        out.append((round(st, 3), round(st + life_s, 3), tag + shape + "{\\p0}", "Draw"))
    return out


def rise(t0, t1, n, seed, x=(260, 800), y=(1250, 1700)):
    """Sparkles spiralling up around the figure before the change."""
    import random
    rnd = random.Random(seed)
    out = []
    for i in range(n):
        st = t0 + (t1 - t0) * i / max(1, n) + rnd.uniform(0, 0.05)
        life_s = min(t1 - st + 0.05, rnd.uniform(0.35, 0.6))
        x1, y1 = rnd.randint(*x), rnd.randint(*y)
        ms = int(life_s * 1000)
        tag = (f"{{\\an5\\move({x1},{y1},{x1 + rnd.randint(-120, 120)},{y1 - rnd.randint(350, 700)},0,{ms}){WIN_CLIP}"
               f"\\bord0\\shad0\\blur2\\1c{rnd.choice(GLITTER)}\\fad(60,{ms // 3})\\frz{rnd.randint(0, 45)}\\p1}}")
        out.append((round(st, 3), round(st + life_s, 3), tag + _star(rnd.randint(12, 26)) + "{\\p0}", "Draw"))
    return out


SHOTS = [
    # "bored?" -> the bet
    clip("0520", 33.55, 36.85, label="bored",
         vcx=[(33.55, 540), (33.85, 560), (34.35, 600), (34.85, 720), (35.85, 840), (36.85, 860)],
         subs=[(33.75, 35.2, "아 오늘 뭐 심심한데\\N뭐 없나요?", Q), (35.75, 36.85, "오늘 또 할로윈인데", Q)]),
    clip("0520", 37.55, 42.24, label="bet", vcx=[(37.55, 858)],
         subs=[(37.6, 39.6, "어 그러면\\N가위바위보 진 사람이", Q), (39.6, 41.62, "공주님 분장하고\\N공원 한 바퀴 돌기", Q),
               (41.62, 42.24, "어 좋은데요?", Q)]),
    # the throw itself: 0.7s, no caption
    clip("0520", 43.0, 43.7, label="rps", layout="fit",
         fx=[(0.42, "impact", -16)]),

    # costume, then the turn: same crop on both sides of the match cut, the princess half in soft bloom
    clip("0523", 0.4, 4.3, label="costume",
         vcx=[(0.4, 1405), (1.6, 1394), (2.0, 1350), (2.4, 1297), (2.8, 1241), (3.2, 1209), (3.6, 1188), (4.0, 1174), (4.3, 1169)],
         subs=[(0.5, 2.86, "진짜 해야 돼요?", SW), (2.86, 4.26, "아 무조건 해야죠", Q)]),
    # turn: glitter spirals up and the picture whites out, then the princess half bursts in with rays, a bloom,
    # an outward glitter burst and falling glitter; a second smaller burst lands on the final pose
    clip("0522", 0.35, 1.62, label="turn-before", vcx=[(0.35, 880)], flash_out=0.32,
         caps=rise(0.45, 1.27, 22, seed=5) + sparkles(0.7, 1.27, 8, seed=3),
         fx=[(0.45, "whoosh", -10), (0.75, "swoosh_in", -9)]),
    clip("0524", 0.92, 4.85, speed=0.82, label="turn-after", flash=0.45, grade="dazzle", vcx=[(0.92, 880)],
         caps=(glow(0.0, 520, 900, 1.0) + rays(0.0, 520, 900, 1.5, seed=2)
               + rays(0.05, 520, 900, 1.2, n=10, radius=650, seed=4, color="&HFFFFFF&", alpha="&H70&", spin=-22)
               + burst(0.05, 520, 900, 34, seed=8) + glitter_rain(0.3, 4.75, 46, seed=12)
               + sparkles(0.0, 4.75, 44, seed=7) + sparkles(3.2, 4.75, 12, seed=11, size=(40, 70))
               + burst(3.35, 520, 620, 18, seed=13, dist=(160, 380), size=(8, 20))
               + rays(3.3, 520, 620, 1.4, n=12, radius=520, seed=6, alpha="&H80&", spin=18)
               + [(3.4, None, "{\\blur3}백설공주 등장", "Princess")]),
         fx=[(0.0, "magic", -4), (0.05, "twinkle", -9), (3.35, "twinkle", -9), (3.35, "ding", -18)]),

    # first words as Snow White
    clip("0525", 0.0, 3.4, label="how-feel",
         vcx=[(0.0, 826), (1.2, 886), (1.6, 979), (2.0, 1080), (2.4, 1152), (2.8, 1177), (3.4, 1177)],
         subs=[(0.0, 1.3, "지금 어떠세요?", Q), (1.6, 3.35, "독사과 먹고 싶습니다", SW)]),
    clip("0527", 37.9, 39.6, label="hello", vcx=[(37.9, 1145)],
         subs=[(38.15, 39.55, "안녕하세요. 백설공주입니다.", SW)]),

    # park lap (0528, 17:20): skirt-run across the crosswalk, a traffic tip, a curtsy, then the plaza verdict
    clip("0528", 81.75, 84.2, gain_adj=6, label="park-ask",
         vcx=[(81.75, 1450), (82.5, 1330), (83.0, 1120), (83.5, 880), (84.2, 700)],
         caps=[(0.0, None, "공원 한 바퀴", "Note")],
         subs=[(81.85, 83.25, "치마 잡고 뛰어주세요", Q)]),
    clip("0528", 85.3, 88.6, speed=1.5, gain_adj=-4, label="park-run", vcx=[(85.3, 720)],
         caps=[(0.0, None, "공원 한 바퀴", "Note")],
         fx=[(0.0, "whoosh", -14)]),
    clip("0528", 442.45, 443.98, label="park-cars", vcx=[(442.45, 700), (443.5, 860), (443.98, 860)],
         caps=[(0.0, None, "공원 한 바퀴", "Note")],
         subs=[(442.5, 443.05, "장점이 있습니다.", SW), (443.05, 443.98, "차들이 절대 먼저", SW)]),
    clip("0528", 444.82, 445.65, label="park-cars2", vcx=[(444.82, 800), (445.65, 700)],
         caps=[(0.0, None, "공원 한 바퀴", "Note")],
         subs=[(444.82, 445.65, "멈춰줍니다.", SW)]),
    clip("0528", 597.3, 599.3, label="park-curtsy", vcx=[(597.3, 1150), (597.9, 1010), (598.3, 960), (599.3, 960)],
         caps=[(0.0, None, "공원 한 바퀴", "Note")] + sparkles(0.55, 1.95, 9, seed=21),
         subs=[(597.35, 598.5, "감사합니다", SW)],
         fx=[(0.6, "twinkle", -14)]),
    clip("0529", 16.1, 17.95, label="boy-princess", vcx=[(16.1, 1021)],
         caps=[(0.0, None, "공원 한 바퀴 후", "Note")],
         subs=[(16.14, 17.9, "“어떻게 공주가 남자야~”", SW)]),

    # back in the building
    clip("0530", 15.4, 20.0, label="looks",
         vcx=[(15.4, 540), (16.2, 582), (16.6, 599), (17.4, 556), (18.2, 504), (19.4, 485), (20.0, 473)],
         subs=[(15.4, 18.6, "일단 많은 분들의\\N애정 어린 시선 잘 봤습니다", SW), (19.0, 19.95, "눈총.", SW)]),
    clip("0530", 115.2, 118.8, label="kids-scared",
         vcx=[(115.2, 538), (116.0, 568), (116.8, 623), (117.6, 644), (118.4, 622), (118.8, 616)],
         caps=[(0.0, None, "3층 학원가", "Note")],
         subs=[(115.3, 116.6, "무서워", N), (116.9, 118.75, "미안해 얘들아.\\N해치지 않아. 해치지 않아", SW)]),
    clip("0530", 121.9, 124.6, label="kids-run", vcx=[(121.9, 1121), (124.6, 1114)],
         caps=[(0.0, None, "3층 학원가", "Note")],
         subs=[(122.0, 124.55, "아 무서워!", N)]),
    clip("0530", 159.4, 164.3, label="elevator", vcx=[(159.4, 439)],
         caps=[(0.0, None, "엘리베이터", "Note")],
         subs=[(159.6, 160.6, "먹고 살기 힘드시죠?", Q), (160.65, 163.3, "저는 이 고요한 침묵이\\N너무 힘들어요", SW)],
         fx=[(3.9, "crickets", -14)]),
    # 8 floors in 2.5s, with the line he said at the top laid over the climb
    clip("0530", 216.2, 231.0, speed=6, gain_adj=-18, label="stairs", vcx=[(216.2, 960)],
         vo=[("0530", 231.1, 232.95, 0.45)],
         caps=[(0.0, None, "8층까지 계단으로", "Note"), (0.45, 2.4, "어쩌면 인생이\\N이런 거 아닐까요?", "SubSW")],
         fx=[(0.0, "whoosh", -12)]),
    clip("0530", 256.2, 259.2, label="office",
         vcx=[(256.2, 883), (257.4, 868), (257.8, 831), (258.2, 767), (258.6, 704), (259.2, 670)],
         caps=[(0.0, None, "사무실 복귀", "Note")],
         subs=[(256.4, 259.0, "이리 오너라~!", SW)]),
    # ending, documentary style: right after "이리 오너라~!" the voice line (ending_voice) plays over the walk into
    # the office, then the ending music (ending_music) runs under four stills that dissolve on its accents
    # (2.35s, 4.69s, 7.05s) and fade out with it. Both sounds are user-supplied files placed in the sfx dir.
    clip("0530", 259.2, 261.95, label="office-voice", vcx=[(259.2, 420)], grade="docu", gain_adj=-12,
         caps=[(0.25, 2.55, "돈 벌기 참 힘들다.", "SubSW")],
         fx=[(-0.2, "ending_voice", 5)]),
    {"kind": "stills", "src": "0530", "label": "ending", "grade": "docu", "xfade": 0.35, "fade_out": 0.9,
     "kenburns": (1.0, 1.06),
     "items": [{"src": "0530", "t": 274.55, "vcx": 760, "dur": 2.525, "kenburns": (1.0, 1.08)},  # last frame
               {"src": "0528", "t": 87.0, "vcx": 800, "dur": 2.69},    # skirt-run across the crosswalk
               {"src": "0528", "t": 270.0, "vcx": 600, "dur": 2.71},   # autumn path, from behind
               {"src": "0528", "t": 561.0, "vcx": 890, "dur": 2.265}], # alone on the plaza
     "caps": [(7.05, None, "{\\fad(250,850)}벌칙 수행 완료.", "SubSW")],  # fades out with the picture
     "fx": [(0.0, "ending_music", -10)]},
]

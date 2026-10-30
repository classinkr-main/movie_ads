"""Edit decision list for the 9:16 shorts cut (under 60s).

Same conventions as edl.py. Vertical shots crop an 810x1080 (3:4) window from the 16:9 source and
follow `vcx` keyframes [(source_t, center_x_px), ...] produced by track.py; `layout="fit"` shows the
whole 16:9 frame over a blurred fill instead (used where two people and their hands must stay in shot).
Captions are Nanum Myeongjo only, with plain fades: no pop-up stickers or gag sounds.
"""

SIZE = (1080, 1920)
VIDEO_WINDOW = (1440, 360)  # picture height and top offset; title sits in the band above

CLIP_GAIN_DB = {"0520": 5, "0521": 5, "0523": 7, "0525": 3, "0526": 7, "0527": 3, "0529": 0, "0530": 4}

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


SHOTS = [
    # the bet
    clip("0520", 37.55, 42.24, label="bet", vcx=[(37.55, 858)],
         subs=[(37.6, 39.6, "어 그러면\\N가위바위보 진 사람이", Q), (39.6, 41.62, "공주님 분장하고\\N공원 한 바퀴 돌기", Q),
               (41.62, 42.24, "어 좋은데요?", Q)]),
    clip("0520", 42.24, 43.55, label="rps", layout="fit",
         subs=[(42.24, 43.55, "안 내면 진다 가위바위보!", Q)]),
    freeze("0520", 43.55, 1.9, label="rps-result", layout="fit",
           caps=[(0.15, None, "가위, 가위, 그리고 보.\\N카메라맨이 졌다.", "SubSW")],
           fx=[(0.0, "impact", -16)]),

    # costume and the turn
    clip("0523", 0.0, 4.3, label="costume",
         vcx=[(0.0, 1411), (1.6, 1394), (2.0, 1350), (2.4, 1297), (2.8, 1241), (3.2, 1209), (3.6, 1188), (4.0, 1174), (4.3, 1169)],
         subs=[(0.5, 2.86, "진짜 해야 돼요?", SW), (2.86, 4.26, "아 무조건 해야죠", Q)]),
    clip("0522", 0.35, 1.62, label="turn-before", vcx=[(0.35, 880)],  # same crop on both sides of the match cut
         fx=[(0.5, "whoosh", -10)]),
    clip("0524", 0.92, 4.7, label="turn-after", flash=0.2, vcx=[(0.92, 880)],
         fx=[(0.0, "magic", -7)]),

    # first words as Snow White
    clip("0525", 0.0, 3.4, label="how-feel",
         vcx=[(0.0, 826), (1.2, 886), (1.6, 979), (2.0, 1080), (2.4, 1152), (2.8, 1177), (3.4, 1177)],
         subs=[(0.0, 1.3, "지금 어떠세요?", Q), (1.6, 3.35, "독사과 먹고 싶습니다", SW)]),
    clip("0527", 37.9, 39.6, label="hello", vcx=[(37.9, 1145)],
         subs=[(38.15, 39.55, "안녕하세요. 백설공주입니다.", SW)]),

    # park lap, then the verdict
    clip("0529", 5.2, 7.05, label="kids-avoid", vcx=[(5.2, 1084), (6.0, 1089), (7.05, 1094)],
         caps=[(0.0, None, "공원 한 바퀴 후", "Note")],
         subs=[(5.2, 7.0, "일단 애들이 피합니다", SW)]),
    clip("0529", 9.45, 12.7, label="horror", vcx=[(9.45, 1161)],
         caps=[(0.0, None, "공원 한 바퀴 후", "Note")],
         subs=[(9.45, 12.65, "공포 분장을 하지 않았는데도\\N도망갑니다", SW)]),
    clip("0529", 16.1, 19.98, label="boy-princess", vcx=[(16.1, 1021)],
         caps=[(0.0, None, "공원 한 바퀴 후", "Note")],
         subs=[(16.14, 17.85, "“어떻게 공주가 남자야~”", SW), (17.85, 19.95, "“어떻게 공주가 저래~”", SW)]),

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
    clip("0530", 159.4, 164.8, label="elevator", vcx=[(159.4, 439)],
         caps=[(0.0, None, "엘리베이터", "Note")],
         subs=[(159.6, 160.6, "먹고 살기 힘드시죠?", Q), (160.65, 163.3, "저는 이 고요한 침묵이\\N너무 힘들어요", SW)],
         fx=[(4.0, "crickets", -14)]),
    clip("0530", 216.2, 230.8, speed=5, gain_adj=-10, label="stairs", vcx=[(216.2, 960)],
         caps=[(0.0, None, "8층까지 계단으로", "Note")],
         fx=[(0.0, "whoosh", -12)]),
    clip("0530", 231.0, 233.0, label="life",
         vcx=[(231.0, 1483), (231.4, 1429), (231.8, 1314), (232.2, 1197), (232.6, 1082), (233.0, 1077)],
         subs=[(231.1, 232.95, "어쩌면 인생이\\N이런 거 아닐까요?", SW)]),
    clip("0530", 256.2, 259.2, label="office",
         vcx=[(256.2, 883), (257.4, 868), (257.8, 831), (258.2, 767), (258.6, 704), (259.2, 670)],
         caps=[(0.0, None, "사무실 복귀", "Note")],
         subs=[(256.4, 259.0, "이리 오너라~!", SW)]),
    clip("0530", 273.1, 274.55, label="last-look", vcx=[(273.1, 760)]),
    freeze("0530", 274.55, 1.6, label="end", vcx=[(274.55, 760)], fade_out=0.6,
           caps=[(0.1, None, "벌칙 수행 완료.", "SubSW")],
           fx=[(0.0, "shutter", -12)]),
]

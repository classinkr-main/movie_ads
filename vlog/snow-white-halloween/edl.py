"""Edit decision list for the Snow White Halloween vlog.

Clip shots use source seconds for a/b and for `subs`; `caps` and `fx` are seconds from the
start of the shot in the edited timeline. Styles are defined in render.py.
"""

CLIP_GAIN_DB = {"0520": 5, "0521": 5, "0523": 7, "0525": 3, "0526": 7, "0527": 3, "0529": 0, "0530": 4}

SW = "SubSW"  # Snow White's lines
Q = "SubQ"    # crew / interviewer


def ring(cx, cy, r, color="&H3C3CFF&", width=10):
    """ASS vector circle outline (path in 0..2r so libass centers it on \\an5) that pops in."""
    k = 0.5523 * r
    c = r
    pts = (f"m {c} {c - r} b {c + k:.0f} {c - r} {c + r} {c - k:.0f} {c + r} {c} "
           f"b {c + r} {c + k:.0f} {c + k:.0f} {c + r} {c} {c + r} "
           f"b {c - k:.0f} {c + r} {c - r} {c + k:.0f} {c - r} {c} "
           f"b {c - r} {c - k:.0f} {c - k:.0f} {c - r} {c} {c - r}")
    return ("{\\an5\\pos(" + f"{cx},{cy}" + ")\\1a&HFF&\\3c" + color + "\\bord" + str(width) +
            "\\shad0\\fscx40\\fscy40\\t(0,140,\\fscx100\\fscy100)\\p1}" + pts + "{\\p0}")


def clip(src, a, b, **kw):
    return {"kind": "clip", "src": src, "a": a, "b": b, **kw}


def freeze(src, t, dur, **kw):
    return {"kind": "freeze", "src": src, "t": t, "dur": dur, **kw}


SHOTS = [
    # ── cold open ────────────────────────────────────────────────
    clip("0529", 16.30, 18.90, label="teaser", zoom=(1.0, 1.22, 0.5, 0.35, 0.5), afade_in=0.05,
         subs=[(16.38, 18.78, "어떻게 공주가 남자야~", SW)],
         caps=[(0.35, None, "공주가 남자야?!", "BigY", (960, 200))],
         fx=[(0.3, "boing", -8)]),
    freeze("0524", 4.6, 3.2, label="title", flash=0.25, zoom=(1.0, 1.08, 0.5, 0.5),
           caps=[(0.15, None, "가위바위보 한 판에", "Title", (960, 120)),
                 (0.75, None, "백설공주가 되었다", "BigY", (960, 930))],
           fx=[(0.0, "twinkle", -6), (0.75, "impact", -6)]),

    # ── setup: take 1 (NG) ───────────────────────────────────────
    clip("0520", 0.0, 5.75, label="take1", whip=True,
         subs=[(0.0, 1.92, "아 심심한데 뭐 없나요?", Q), (2.98, 4.14, "제가 말해야 되는 거 아니에요?", Q),
               (4.62, 5.64, "알겠습니다 시작", Q)],
         caps=[(0.0, None, "TAKE 1", "Label", (60, 50)), (3.0, 4.6, "NG", "BigR", (1450, 330))],
         fx=[(0.0, "whoosh", -8), (3.0, "buzzer", -10)]),
    clip("0520", 6.4, 32.6, speed=13, gain_adj=-14, label="rewind", grade="bw",
         caps=[(0.0, None, "다시 갑니다 ≫≫", "Label", (60, 50))],
         fx=[(0.0, "scratch", -6)]),

    # ── setup: take 2 ────────────────────────────────────────────
    clip("0520", 32.85, 43.55, label="take2", flash=0.15,
         subs=[(32.94, 35.18, "아 오늘 뭐 심심한데 뭐 없나요?", Q), (35.78, 36.62, "오늘 또 할로윈인데", Q),
               (37.64, 39.60, "어 그러면 가위바위보 진 사람이", Q), (39.60, 41.62, "공주님 분장하고 공원 한 바퀴 돌기", Q),
               (41.62, 42.24, "어 좋은데요?", Q), (42.24, 43.55, "안 내면 진다 가위바위보!", Q)],
         caps=[(0.0, 2.2, "TAKE 2", "Label", (60, 50)),
               (6.8, None, "벌칙: 공주님 분장 + 공원 한 바퀴", "LabelY", (60, 50))],
         fx=[(6.8, "ding", -12)]),
    freeze("0520", 43.55, 3.6, label="rps-freeze", zoom=(1.06, 1.06, 0.55, 0.75), shake=(26, 5, 2.0),
           caps=[(0.0, 1.0, "결과는?!", "Big", (960, 190)),
                 (0.95, None, "가위  ·  가위  ·  보", "BigY", (960, 190)),
                 (1.3, None, ring(945, 895, 155), "Draw"),
                 (1.3, None, "카메라맨 손", "LabelY", (520, 880)),
                 (2.0, None, "카메라맨 패배", "BigR", (960, 520))],
           fx=[(0.0, "drumroll", -6), (1.3, "pop", -6), (2.0, "dundun", -4)]),
    clip("0520", 43.55, 45.70, gain_adj=-3, label="smug",
         caps=[(0.2, None, "ㅋㅋㅋㅋㅋㅋ", "Big", (960, 200)), (0.9, None, "(승자의 여유)", "Note", (960, 320))]),

    # ── the loser: costume time ─────────────────────────────────
    clip("0521", 0.0, 2.6, label="handover", whip=True,
         subs=[(0.0, 2.52, "이거 앞에 조이스틱 따닥 하면은 정렬돼요", SW)],
         caps=[(0.0, None, "패배자, 카메라 인수인계 중", "Label", (60, 50))],
         fx=[(0.0, "whoosh", -8)]),
    clip("0523", 0.0, 10.6, label="costume",
         subs=[(0.0, 2.86, "진짜 해야 돼요?", SW), (2.86, 4.26, "아 무조건 해야죠", Q),
               (6.0, 8.22, "빨리 갈아입으세요", Q)],
         caps=[(0.0, 2.0, "오늘의 의상", "LabelY", (60, 50)), (8.4, None, "(체념)", "Note", (960, 300))],
         fx=[(0.05, "impact", -8), (8.4, "whistle_down", -10)]),

    # ── transformation (match cut on the turn) ──────────────────
    clip("0522", 0.35, 1.62, label="turn-before",
         caps=[(0.0, None, "변신 3초 전", "Label", (60, 50))],
         fx=[(0.55, "whoosh", -6)]),
    clip("0524", 0.92, 5.9, label="turn-after", flash=0.3,
         caps=[(3.2, None, "백설공주 등장", "BigY", (960, 180))],
         fx=[(0.0, "magic", -3), (3.2, "tada", -6)]),

    # ── first interview ─────────────────────────────────────────
    clip("0525", 0.0, 7.9, label="how-feel",
         subs=[(0.0, 1.3, "지금 어떠세요?", Q), (1.6, 3.2, "독사과 먹고 싶습니다", SW)],
         caps=[(2.0, 4.6, "(진심)", "Note", (960, 300)), (5.9, None, "근육 공주", "BigY", (960, 170))],
         fx=[(3.0, "badumtss", -10), (5.9, "boing", -8)]),
    clip("0526", 0.0, 5.6, label="crew-selfie", whip=True,
         subs=[(0.0, 2.35, "아 진짜 너무 예뻐요", Q)],
         caps=[(0.0, None, "같이 간 동료", "Label", (60, 50)), (2.4, 3.6, "(영혼 없음)", "Note", (960, 300))],
         fx=[(0.0, "whoosh", -8)]),

    # ── off we go ───────────────────────────────────────────────
    clip("0527", 1.6, 23.2, speed=3, gain_adj=-10, label="walk-out",
         caps=[(0.0, None, "공원으로 출발  x3", "Label", (60, 50))],
         fx=[(0.0, "whoosh", -8), (6.9, "whoosh", -10)]),
    clip("0527", 24.6, 28.6, label="mirror",
         caps=[(0.4, None, "출격 전 거울 체크", "LabelY", (60, 50))],
         fx=[(0.5, "twinkle", -10)]),
    clip("0527", 34.3, 39.6, label="mic-check",
         subs=[(34.52, 35.14, "연결되나요?", SW), (35.76, 36.6, "하나, 둘", SW), (38.18, 39.5, "안녕하세요. 백설공주입니다.", SW)],
         caps=[(0.0, 2.6, "마이크 테스트", "Label", (60, 50)), (3.9, None, "백설공주 리포터", "BigY", (960, 170))],
         fx=[(3.9, "ding", -10)]),
    clip("0527", 40.3, 46.9, label="mission",
         subs=[(40.45, 43.75, "오늘 할로윈인데 아이들이 어떤 코스튬을 입었는지 한번 보러 가겠습니다", SW),
               (44.0, 46.6, "잊을 수 없는 기억을 남겨주셨으면 좋겠습니다", SW)],
         caps=[(0.0, None, "오늘의 미션: 꼬마 코스튬 구경", "LabelY", (60, 50))],
         fx=[(6.2, "whoosh", -8)]),

    # ── plaza interview ─────────────────────────────────────────
    clip("0529", 0.0, 3.8, speed=2, mute=True, label="plaza-arrive", whip=True,
         caps=[(0.0, None, "공원 한 바퀴 완료", "LabelY", (60, 50)), (0.4, None, "Q. 돌아본 소감은?", "Big", (960, 200))],
         fx=[(0.0, "whoosh", -8), (0.4, "pop", -8)]),
    clip("0529", 5.15, 8.95, label="kids-avoid",
         subs=[(5.15, 6.98, "일단 애들이 피합니다", SW), (6.98, 8.95, "굉장히 무서워하고요", SW)],
         caps=[(0.0, None, "Q. 돌아본 소감은?", "Label", (60, 50)), (1.9, None, "애들이 피함", "BigY", (960, 170))],
         fx=[(1.9, "impact", -10)]),
    clip("0529", 9.45, 12.65, label="horror",
         subs=[(9.45, 12.65, "공포적인 분장을 하지 않았는데도 도망갑니다", SW)],
         caps=[(0.0, None, "Q. 돌아본 소감은?", "Label", (60, 50)), (1.2, None, "(공포 분장 아님)", "Note", (960, 300))],
         fx=[(2.4, "crickets", -14)]),
    clip("0529", 12.7, 16.1, label="parents",
         subs=[(12.7, 16.1, "그리고 애들이 백설공주야~ 부모님들이 말씀하시면", SW)],
         caps=[(0.0, None, "Q. 돌아본 소감은?", "Label", (60, 50))]),
    clip("0529", 16.1, 19.98, label="boy-princess", zoom=(1.0, 1.28, 0.5, 0.32, 0.25),
         subs=[(16.14, 17.85, "어떻게 공주가 남자야~", SW), (17.85, 19.98, "어떻게 공주가 저래~", SW)],
         caps=[(0.2, None, "팩트 폭격", "BigR", (960, 170))],
         fx=[(0.05, "swoosh_in", -10), (0.25, "impact", -8)]),
    clip("0529", 20.0, 26.5, label="whisper",
         subs=[(20.0, 24.1, "이런 발언들을 하는데 아직까지 대한민국 문화가", SW),
               (24.1, 26.45, "아이들 보시겠어요? 수근수근 거리는 거 보이시죠?", SW)],
         caps=[(0.0, None, "Q. 돌아본 소감은?", "Label", (60, 50)), (4.6, None, "(수근수근)", "Note", (560, 420))]),
    clip("0529", 27.1, 32.2, label="culture",
         subs=[(27.16, 29.25, "아직까지 대한민국 문화가 건전하다", SW), (30.1, 32.15, "이상한 거를 알 수 있다", SW)],
         caps=[(0.0, None, "Q. 돌아본 소감은?", "Label", (60, 50)), (2.9, None, "갑자기 사회 비평", "BigY", (960, 170))],
         fx=[(2.9, "dundun", -12)]),
    clip("0529", 33.4, 35.6, label="hope", zoom=(1.12, 1.12, 0.5, 0.4),
         subs=[(33.5, 35.0, "아직은 희망이 있는 거 같습니다", SW)],
         caps=[(1.0, None, "훈훈한 마무리", "BigY", (960, 170))],
         fx=[(1.0, "ding", -8)]),

    # ── back inside: building tour ──────────────────────────────
    clip("0530", 13.8, 20.0, label="scar", whip=True,
         subs=[(14.0, 15.3, "상처만 남은 것 같은데?", Q),
               (15.4, 18.6, "아니요. 일단 많은 분들의 애정 어린 시선 잘 봤습니다", SW),
               (19.0, 20.0, "눈총.", SW)],
         caps=[(0.0, None, "다시 건물 안으로", "Label", (60, 50)), (5.2, None, "(정정)", "Note", (960, 300))],
         fx=[(0.0, "whoosh", -8), (5.2, "scratch", -12)]),
    clip("0530", 21.9, 23.7, label="scar2",
         subs=[(22.0, 23.6, "이런 것들 받으니까", SW)],
         caps=[(0.0, None, "다시 건물 안으로", "Label", (60, 50))]),
    clip("0530", 69.8, 73.0, label="dwarfs", whip=True,
         subs=[(71.0, 72.8, "일곱 난쟁이 찾으러 갑니다", SW)],
         caps=[(0.0, None, "엘리베이터 독백", "Label", (60, 50)), (1.3, None, "일곱 난쟁이 찾는 중", "BigY", (960, 170))],
         fx=[(0.0, "whoosh", -8), (1.3, "pop", -8)]),
    clip("0530", 75.4, 78.9, label="dwarfs2",
         subs=[(75.6, 76.5, "백설공주.", Q), (76.55, 78.0, "아 백설공주 일곱 난쟁이", Q), (78.0, 78.85, "맞습니다", SW)],
         caps=[(0.0, None, "엘리베이터 독백", "Label", (60, 50))],
         fx=[(2.6, "correct", -10)]),
    clip("0530", 89.5, 91.3, label="3f-arrive", whip=True,
         caps=[(0.0, None, "3층 학원가", "LabelY", (60, 50))],
         fx=[(0.0, "whoosh", -8)]),
    clip("0530", 96.7, 99.0, gain_adj=3, label="3f-surprised",
         subs=[(97.3, 98.8, "상당히 놀라셨습니다", SW)],
         caps=[(0.0, None, "3층 학원가", "LabelY", (60, 50)), (0.4, None, "(행인 1 깜짝)", "Note", (960, 300))]),
    clip("0530", 110.2, 120.4, label="kids-scared",
         subs=[(110.6, 112.3, "어, 안녕~", SW), (112.5, 113.9, "안녕하세요", "Sub"), (114.3, 115.1, "무서워...", "Sub"),
               (115.3, 116.6, "무서워", "Sub"), (116.9, 118.75, "미안해 얘들아. 해치지 않아. 해치지 않아", SW),
               (118.8, 120.2, "어서, 어서, 어서...", SW)],
         caps=[(0.0, None, "3층 학원가", "LabelY", (60, 50)), (4.1, 6.6, "무서워...", "BigR", (960, 170))],
         fx=[(4.1, "dundun", -14)]),
    clip("0530", 121.5, 125.2, label="kids-run",
         subs=[(122.0, 124.6, "아 무서워!", "Sub")],
         caps=[(0.0, None, "3층 학원가", "LabelY", (60, 50)), (1.5, None, "(전력 질주)", "BigY", (960, 170))],
         fx=[(1.4, "whoosh", -4), (2.0, "whistle_up", -12)]),
    clip("0530", 126.9, 129.2, label="horror-halloween",
         subs=[(127.3, 128.8, "호러 할로윈 그 자체입니다", SW)],
         caps=[(0.0, None, "3층 학원가", "LabelY", (60, 50)), (0.5, None, "호러 그 자체", "BigR", (960, 170))],
         fx=[(0.5, "impact", -8), (1.9, "boing", -10)]),
    clip("0530", 148.6, 153.8, label="elevator-thanks", whip=True, zoom=(1.38, 1.38, 0.0, 0.2),
         subs=[(149.0, 149.8, "고마워~", SW), (149.9, 150.9, "고마워요~", SW), (151.0, 152.4, "고마워~ 고마워~", SW),
               (152.4, 153.7, "고마워. 너희도 너무 예뻐", SW)],
         caps=[(0.0, None, "엘리베이터", "Label", (60, 50)), (0.4, None, "(아이들의 칭찬 세례)", "Note", (960, 300))],
         fx=[(0.0, "whoosh", -8), (0.4, "twinkle", -12)]),
    clip("0530", 159.4, 170.0, label="elevator-silence",
         subs=[(159.6, 160.6, "먹고 살기 힘드시죠?", Q), (160.65, 163.2, "저는 이 고요한 침묵이 너무 힘들어요", SW)],
         caps=[(0.0, None, "엘리베이터", "Label", (60, 50)), (4.3, None, "(정적)", "Big", (960, 170))],
         fx=[(4.3, "crickets", -8), (6.7, "crickets", -10)]),
    clip("0530", 214.8, 216.2, label="stairs-go",
         subs=[(215.0, 216.0, "계단으로 가시죠", Q)],
         caps=[(0.0, None, "8층 사무실까지", "LabelY", (60, 50))],
         fx=[(0.9, "dundun", -12)]),
    clip("0530", 216.2, 231.2, speed=2.5, gain_adj=-8, label="stairs-climb",
         caps=[(0.0, None, "8층까지 계단으로  x2.5", "LabelY", (60, 50)), (1.0, None, "(드레스 들고 등산 중)", "Note", (960, 300))],
         fx=[(0.0, "whoosh", -10), (0.6, "heartbeat", -6), (2.2, "heartbeat", -6), (3.8, "heartbeat", -6)]),
    clip("0530", 231.0, 233.6, label="stairs-life", zoom=(1.15, 1.15, 0.5, 0.4),
         subs=[(231.2, 233.0, "어쩌면 인생이 이런 거 아닐까요?", SW)],
         caps=[(0.9, None, "득도", "BigY", (960, 170))],
         fx=[(0.9, "ding", -8)]),
    clip("0530", 238.6, 242.7, label="instructor",
         subs=[(238.8, 240.55, "근데 만약에 강사였는데 이러고 가면은", SW), (240.55, 242.5, "진짜 인기 폭발이 될 거 같긴 하네요", SW)],
         caps=[(0.0, None, "8층 도착", "Label", (60, 50)), (2.2, None, "(긍정왕)", "Note", (960, 300))],
         fx=[(2.2, "twinkle", -10)]),
    clip("0530", 243.2, 255.7, speed=3, gain_adj=-10, label="to-office",
         caps=[(0.0, None, "사무실 복귀  x3", "Label", (60, 50))],
         fx=[(0.0, "whoosh", -8), (4.6, "whoosh", -10)]),
    clip("0530", 255.7, 259.4, label="office-call",
         subs=[(256.4, 259.0, "이리 오너라~!", SW)],
         caps=[(0.0, None, "사무실 복귀", "Label", (60, 50)), (0.7, None, "(사극 톤)", "Note", (960, 300))],
         fx=[(0.7, "tada", -12)]),
    clip("0530", 259.4, 266.2, speed=2, gain_adj=-6, label="office-walk",
         caps=[(0.0, None, "사무실 복귀  x2", "Label", (60, 50))]),
    clip("0530", 266.2, 274.6, label="office-react",
         subs=[(266.5, 268.4, "애들이 기겁하면서 도망칩니다", "Sub")],
         caps=[(0.0, None, "사무실 복귀", "Label", (60, 50)), (2.6, None, "(동료들 반응)", "Note", (1500, 300))],
         fx=[(2.6, "pop", -10)]),

    # ── ending ──────────────────────────────────────────────────
    freeze("0530", 274.55, 4.2, label="ending", zoom=(1.0, 1.12, 0.5, 0.4), fade_out=0.8,
           caps=[(0.1, None, "벌칙 수행 완료", "BigY", (960, 160)),
                 (1.0, None, "가위바위보는 신중하게", "Title", (960, 900))],
           fx=[(0.0, "shutter", -6), (0.1, "tada", -8), (1.0, "badumtss", -10)]),
]


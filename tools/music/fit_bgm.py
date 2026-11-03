#!/usr/bin/env python3
"""외부 음원(제미나이로 만든 곡)을 영상 타이밍에 맞춰 편집하고, 화면 효과음을 얹어 사운드트랙을 만든다.

    python3 tools/music/fit_bgm.py                                   # 22초판 → public/audio/classin-v5.wav
    python3 tools/music/fit_bgm.py --cues src/data/cues-30s.json \\
        --out public/audio/classin-v5-30s.wav                        # 30초 여유판
    python3 tools/music/fit_bgm.py <원곡> [--cues …] [--out …]

기본 원곡 "Breakthrough at the Board"(제미나이 생성 · 120 BPM · 118.8초)는 마디선이 0.05 + 2k초에 있어,
영상 마디선(2k초)에 맞춰 구간을 이어 붙이면 모든 박이 화면 큐와 같은 그리드에 놓인다.
편집표(EDL)는 큐 시트에서 계산하므로 22초판·30초판이 같은 구성(도입 → 드롭부터 지도까지 원곡 그대로 → 스톱타임 히트 3번
→ 재진입 피날레 → 마지막 히트 엔드)을 따른다. 구간 경계는 다음 구간의 어택(마디선 최대 26ms 전부터 시작)이 다치지 않도록
마디선 45→30ms 전에 15ms 등전력 크로스페이드한다. 효과음은 compose.py의 foley_bus()를 같은 큐 시트로 만든다.
"""
from __future__ import annotations

import argparse
import math
import os
import pathlib
import subprocess
import sys

import numpy as np
import pyloudnorm

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SOURCE = ROOT / "tools/music/source/breakthrough-at-the-board.m4a"
PRE = 0.045  # 구간 앞에 더 가져오는 길이 — 어택 보호
XF = 0.015  # 크로스페이드 길이

# 원곡에서 쓰는 지점(원곡 초, 마디선 기준)
SONG = {"intro": 0.05, "fill": 9.80, "groove": 10.05, "hits": (88.05, 89.55, 90.05), "breath": 91.55, "reentry": 92.05, "final": 115.05}


def edl(cues: dict) -> list[tuple[float, float, float, float | None, str]]:
    """(원곡 초, 영상 시작 초, 길이 초, 페이드인 초 | None=XF, 메모) — 큐 시트에서 영상 쪽 시점을 계산한다."""
    sec = lambda f: f / cues["fps"]  # noqa: E731
    drop, scale0 = sec(cues["scenes"]["drop"][0]), sec(cues["scenes"]["scale"][0])
    finale, end, total = sec(cues["scenes"]["finale"][0]), sec(cues["scenes"]["end"][0]), sec(cues["durationInFrames"])
    hits = [sec(f) for f in cues["scale"]["hits"]]
    return [
        (SONG["intro"], 0.0, drop, None, "도입부 — 질문 타이핑, 상실 장면, 소등에서 테이프 스톱"),
        (SONG["fill"], drop - 0.25, 0.25, 0.04, "드롭 직전 필 — 침묵 속 '미래의 학원은,' 끝에서"),
        (SONG["groove"], drop, scale0 - drop, None, "드롭 '남긴다.' → 챈트 → 미래 교실 → 노선도 → 지도(원곡 그대로)"),
        *[(s, h, 0.5, None, f"스톱타임 히트 {k + 1} — 통계") for k, (s, h) in enumerate(zip(SONG["hits"], hits))],
        (SONG["breath"], finale - 0.5, 0.5, None, "재진입 전 숨"),
        (SONG["reentry"], finale, end - finale, None, "피날레 재진입"),
        (SONG["final"], end, total - end, None, "곡의 마지막 히트 → 로고, 울림 뒤 페이드"),
    ]


def load(path: pathlib.Path, sr: int) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "2", "-ar", str(sr), "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def place(dst: np.ndarray, src: np.ndarray, sr: int, s: float, v: float, ln: float, fin: float | None) -> None:
    """원곡 [s-PRE, s+ln-PRE+XF)를 영상 [v-PRE, …)에 놓는다. 앞뒤는 등전력(사인/코사인) 페이드."""
    sm = lambda t: int(round(t * sr))  # noqa: E731
    seg = src[sm(s - PRE): sm(s - PRE) + sm(ln + XF)].copy()
    n = seg.shape[0]
    fi, fo = sm(fin if fin is not None else XF), sm(XF)
    env = np.ones(n)
    env[:fi] = np.sin(0.5 * math.pi * np.arange(fi) / fi)
    env[n - fo:] = np.cos(0.5 * math.pi * np.arange(fo) / fo)
    seg *= env[:, None]
    st = sm(v - PRE)
    if st < 0:
        seg, st = seg[-st:], 0
    end = min(dst.shape[0], st + seg.shape[0])
    dst[st:end] += seg[: end - st]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("source", nargs="?", default=str(SOURCE))
    ap.add_argument("--cues", default="src/data/cues.json", help="큐 시트(ROOT 기준) — 30초 여유판은 src/data/cues-30s.json")
    ap.add_argument("--out", default=str(ROOT / "public/audio/classin-v5.wav"))
    args = ap.parse_args()
    os.environ["CLASSIN_CUES"] = args.cues  # compose.py가 같은 큐 시트로 길이·효과음을 만든다
    sys.path.insert(0, str(HERE))
    import compose as cp  # noqa: E402

    cues = cp.CUES
    plan = edl(cues)
    src = load(pathlib.Path(args.source), cp.SR)
    intro = np.zeros((cp.N, 2))
    place(intro, src, cp.SR, *plan[0][:4])
    music = cp.tape_stop(intro, cp.fs(cues["loss"]["lightsOff"]), cp.secs(0.32))  # 소등과 함께 테이프가 멈춘다
    for s, v, ln, fin, _ in plan[1:]:
        place(music, src, cp.SR, s, v, ln, fin)

    meter = pyloudnorm.Meter(cp.SR)
    music *= 10 ** ((cp.TARGET_LUFS - meter.integrated_loudness(music)) / 20)
    mix = music + cp.foley_bus().x
    tail = np.ones(cp.N)
    t0 = cp.fs(cues["durationInFrames"] - 54)
    tail[t0:] = np.linspace(1, 0, cp.N - t0) ** 1.5
    mix *= tail[:, None]
    for _ in range(3):
        mix *= 10 ** ((cp.TARGET_LUFS - meter.integrated_loudness(mix)) / 20)
        mix = cp.limiter(mix, cp.CEILING_DB - 0.6)
    tp = cp.true_peak_db(mix)
    if tp > cp.CEILING_DB:
        mix *= 10 ** ((cp.CEILING_DB - tp) / 20)
    cp.write_wav(pathlib.Path(args.out), mix)
    print(f"wrote {args.out}: {cp.N / cp.SR:.2f}s · {meter.integrated_loudness(mix):.1f} LUFS · true peak {cp.true_peak_db(mix):.1f} dBTP")
    for s, v, ln, _, note in plan:
        print(f"  영상 {v:6.2f}–{v + ln:6.2f}s ← 원곡 {s:7.2f}–{s + ln:7.2f}s  {note}")


if __name__ == "__main__":
    main()

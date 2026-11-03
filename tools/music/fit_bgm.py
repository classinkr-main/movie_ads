#!/usr/bin/env python3
"""외부 음원(제미나이로 만든 곡)을 영상 타이밍에 맞춰 22초로 편집하고, 화면 효과음을 얹어 사운드트랙을 만든다.

    python3 tools/music/fit_bgm.py                     # 기본 원곡 → public/audio/classin-v5.wav
    python3 tools/music/fit_bgm.py <원곡> [--out 경로]

기본 원곡 "Breakthrough at the Board"(제미나이 생성 · 120 BPM · 118.8초)는 마디선이 0.05 + 2k초에 있어,
영상 마디선(2k초)에 맞춰 구간을 이어 붙이면 모든 박이 화면 큐와 같은 그리드에 놓인다(EDL).
구간 경계는 다음 구간의 어택(마디선 최대 26ms 전부터 시작)이 다치지 않도록
마디선 45→30ms 전에 15ms 등전력 크로스페이드한다. 효과음은 compose.py의 foley_bus()를 그대로 쓴다.
"""
from __future__ import annotations

import argparse
import math
import pathlib
import subprocess
import sys

import numpy as np
import pyloudnorm

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from compose import CEILING_DB, CUES, FPS, N, ROOT, SR, TARGET_LUFS, foley_bus, fs, limiter, secs, tape_stop, true_peak_db, write_wav  # noqa: E402

SOURCE = ROOT / "tools/music/source/breakthrough-at-the-board.m4a"
PRE = 0.045  # 구간 앞에 더 가져오는 길이 — 어택 보호
XF = 0.015  # 크로스페이드 길이

# (원곡 마디선 초, 영상 시작 초, 길이 초, 페이드인 초 | None=XF, 메모)
EDL: list[tuple[float, float, float, float | None, str]] = [
    (0.05, 0.0, 4.0, None, "인트로·상실 — 첫 히트가 '?' 동그라미, 첫 마디가 휩 팬 착지. 소등(3.43초)에서 테이프 스톱"),
    (9.80, 3.75, 0.25, 0.04, "드롭 직전 필 — 침묵 속 '미래의 학원은,' 타이핑 끝에서 드롭으로"),
    (10.05, 4.0, 12.0, None, "드롭 '남긴다.' → 챈트 → 미래 교실 → 노선도 → 지도"),
    (88.05, 16.0, 0.5, None, "스톱타임 히트 1 — 160+ 개국"),
    (89.55, 16.5, 0.5, None, "히트 2 — 6만+ 기관"),
    (90.05, 17.0, 0.5, None, "히트 3 — 5,000만+ 명"),
    (91.55, 17.5, 0.5, None, "재진입 전 숨"),
    (92.05, 18.0, 2.0, None, "피날레 재진입 — '좋은 수업을, … 학원의 시스템으로.'"),
    (115.05, 20.0, 2.0, None, "곡의 마지막 히트 → 로고, 울림 뒤 페이드"),
]


def load(path: pathlib.Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def place(dst: np.ndarray, src: np.ndarray, s: float, v: float, ln: float, fin: float | None) -> None:
    """원곡 [s-PRE, s+ln-PRE+XF)를 영상 [v-PRE, …)에 놓는다. 앞뒤는 등전력(사인/코사인) 페이드."""
    n = secs(ln + XF)
    seg = src[secs(s - PRE): secs(s - PRE) + n].copy()
    n = seg.shape[0]
    fi, fo = secs(fin if fin is not None else XF), secs(XF)
    env = np.ones(n)
    env[:fi] = np.sin(0.5 * math.pi * np.arange(fi) / fi)
    env[n - fo:] = np.cos(0.5 * math.pi * np.arange(fo) / fo)
    seg *= env[:, None]
    st = secs(v - PRE)
    if st < 0:
        seg, st = seg[-st:], 0
    end = min(dst.shape[0], st + seg.shape[0])
    dst[st:end] += seg[: end - st]


def build(src: np.ndarray) -> np.ndarray:
    lights_off = fs(CUES["loss"]["lightsOff"])
    intro = np.zeros((N, 2))
    place(intro, src, *EDL[0][:4])
    intro = tape_stop(intro, lights_off, secs(0.32))  # 소등과 함께 테이프가 멈춘다
    music = intro
    for s, v, ln, fin, _ in EDL[1:]:
        place(music, src, s, v, ln, fin)
    return music


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("source", nargs="?", default=str(SOURCE))
    ap.add_argument("--out", default=str(ROOT / "public/audio/classin-v5.wav"))
    args = ap.parse_args()
    meter = pyloudnorm.Meter(SR)
    music = build(load(pathlib.Path(args.source)))
    music *= 10 ** ((TARGET_LUFS - meter.integrated_loudness(music)) / 20)
    mix = music + foley_bus().x
    tail = np.ones(N)
    t0 = fs(CUES["durationInFrames"] - 54)
    tail[t0:] = np.linspace(1, 0, N - t0) ** 1.5
    mix *= tail[:, None]
    for _ in range(3):
        mix *= 10 ** ((TARGET_LUFS - meter.integrated_loudness(mix)) / 20)
        mix = limiter(mix, CEILING_DB - 0.6)
    tp = true_peak_db(mix)
    if tp > CEILING_DB:
        mix *= 10 ** ((CEILING_DB - tp) / 20)
    write_wav(pathlib.Path(args.out), mix)
    print(f"wrote {args.out}: {N / SR:.2f}s · {meter.integrated_loudness(mix):.1f} LUFS · true peak {true_peak_db(mix):.1f} dBTP · {len(EDL)} cuts @ {FPS}fps grid")


if __name__ == "__main__":
    main()

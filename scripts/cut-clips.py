#!/usr/bin/env python3
"""숏폼 스펙(src/shorts/specs/*.json)의 segments대로 원본에서 구간을 잘라 이어 붙인다.

사용: python3 scripts/cut-clips.py <원본 영상> [스펙 id ...]
출력: public/shorts/<id>.mp4 — 1920×1080 · 30fps · H.264 · AAC, 라우드니스 -14 LUFS(숏폼 플랫폼 기준)
구간 경계마다 오디오를 30ms 페이드해 이음새의 딸깍 소리를 없앤다.
"""
import json
import math
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SPECS = ROOT / "src" / "shorts" / "specs"
OUT = ROOT / "public" / "shorts"
FADE = 0.03
FPS = 30


def frames(seg: dict) -> int:
    # 구간 길이를 프레임 단위로 고정한다. src/shorts/timeline.ts의 segmentFrames와 같은 규칙
    return math.floor((seg["to"] - seg["from"]) * FPS + 0.5)


def build(source: str, spec_path: pathlib.Path) -> None:
    spec = json.loads(spec_path.read_text())
    segments = spec["segments"]
    args = ["ffmpeg", "-v", "error", "-y"]
    for s in segments:
        args += ["-ss", f"{s['from']:.3f}", "-t", f"{s['to'] - s['from'] + 0.2:.3f}", "-i", source]
    chains, pairs = [], []
    for i, s in enumerate(segments):
        n = frames(s)
        d = n / FPS
        chains.append(f"[{i}:v]fps={FPS},trim=end_frame={n},scale=1920:1080,setsar=1,setpts=PTS-STARTPTS[v{i}]")
        chains.append(
            f"[{i}:a]aresample=48000,atrim=end={d:.4f},asetpts=PTS-STARTPTS,"
            f"afade=t=in:d={FADE},afade=t=out:st={max(d - FADE, 0):.3f}:d={FADE}[a{i}]"
        )
        pairs.append(f"[v{i}][a{i}]")
    chains.append(f"{''.join(pairs)}concat=n={len(segments)}:v=1:a=1[v][acat]")
    chains.append("[acat]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]")
    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / f"{spec['id']}.mp4"
    args += [
        "-filter_complex", ";".join(chains),
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
        str(out),
    ]
    subprocess.run(args, check=True)
    total = sum(frames(s) for s in segments) / FPS
    print(f"{out.relative_to(ROOT)}  {total:.2f}s  ({len(segments)}개 구간)")


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    source, ids = sys.argv[1], set(sys.argv[2:])
    for path in sorted(SPECS.glob("*.json")):
        if not ids or path.stem in ids:
            build(source, path)


if __name__ == "__main__":
    main()

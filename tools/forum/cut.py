"""부산 포럼 스케치 — EDL(JSON)의 컷을 1920x1080 30fps 중간 파일로 잘라 public/forum/clips 에 쓴다.

usage: python3 tools/forum/cut.py <footage_dir> <edl.json> [<edl.json> ...]

샷 항목:
  id    출력 파일명 (clips/<id>.mp4)
  src   footage_dir 기준 원본 경로
  in    시작 초, dur 길이 초
  crop  [x, y, w] — 원본 대비 비율. 16:9 영역의 왼쪽 위(x, y)와 너비(w). 세로 원본은 w=1 로 가로 띠를 잘라낸다.
  lufs  현장음 목표 라우드니스 (기본 -23)

src 가 없는 샷은 clip 이 가리키는 기존 중간본을 재사용하므로 건너뛴다.
bites 항목(인터뷰·연설 사운드바이트)은 오디오만 잘라 public/forum/audio/<id>.wav 로 쓴다.
src 가 "bite:<파일명>" 이면 이미 처리된 바이트에서 다시 잘라 낸다.
말소리 대역 EQ·노이즈 저감·컴프레서를 거쳐 목표 라우드니스(기본 -18 LUFS)에 맞춘다.
"""
import json, os, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public", "forum", "clips")
AUDIO_OUT = os.path.join(ROOT, "public", "forum", "audio")
SPEECH = "highpass=f=110,lowpass=f=9500,afftdn=nf=-28,equalizer=f=2800:t=q:w=1.2:g=3,acompressor=threshold=-22dB:ratio=3:attack=8:release=180:makeup=3"
GRADE = "eq=contrast=1.04:saturation=1.07,unsharp=5:5:0.35"


def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                        "-of", "csv=p=0", path], capture_output=True, text=True, check=True)
    w, h = r.stdout.strip().split(",")[:2]
    return int(w), int(h)


def loudness(path, t0, dur):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-ss", str(t0), "-t", str(dur), "-i", path, "-vn", "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    return float(m[-1]) if m else -70.0


def cut(footage, shot):
    if "src" not in shot:
        return shot["id"], f"reuse {shot.get('clip', shot['id'])}"
    src = os.path.join(footage, shot["src"])
    dst = os.path.join(OUT, f"{shot['id']}.mp4")
    if os.path.exists(dst) and (os.path.getmtime(dst) > os.path.getmtime(shot["_edl"]) or not os.path.exists(src)):
        return shot["id"], "skip"
    w, h = probe(src)
    x, y, cw = shot.get("crop", [0, 0, 1])
    cw_px = int(w * cw) // 2 * 2
    ch_px = int(cw_px * 9 / 16) // 2 * 2
    cx, cy = int(w * x) // 2 * 2, int(h * y) // 2 * 2
    cy = max(0, min(cy, h - ch_px)); cx = max(0, min(cx, w - cw_px))
    vf = f"crop={cw_px}:{ch_px}:{cx}:{cy},scale=1920:1080:flags=lanczos,fps=30,{GRADE},format=yuv420p"
    lufs = loudness(src, shot["in"], shot["dur"])
    gain = max(-20.0, min(24.0, shot.get("lufs", -23.0) - lufs)) if lufs > -60 else 0.0
    af = f"volume={gain:.1f}dB,alimiter=limit=0.89,aresample=48000"
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(shot["in"]), "-i", src, "-t", str(shot["dur"]),
           "-map", "0:v:0", "-map", "0:a:0", "-vf", vf, "-af", af,
           "-c:v", "libx264", "-preset", "medium", "-crf", "15", "-g", "15", "-bf", "0",
           "-c:a", "aac", "-b:a", "192k", "-ac", "2", "-movflags", "+faststart", dst]
    subprocess.run(cmd, check=True)
    return shot["id"], f"{w}x{h} crop {cw_px}x{ch_px}+{cx}+{cy} gain {gain:+.1f}dB"


def bite(footage, b):
    dst = os.path.join(AUDIO_OUT, f"{b['id']}.wav")
    src_path = os.path.join(AUDIO_OUT, b["src"][5:]) if b["src"].startswith("bite:") else os.path.join(footage, b["src"])
    if os.path.exists(dst) and (os.path.getmtime(dst) > os.path.getmtime(b["_edl"]) or not os.path.exists(src_path)):
        return b["id"], "skip"
    if b["src"].startswith("bite:"):
        # 이미 말소리 처리를 거친 바이트에서 다시 잘라 낸다
        src = os.path.join(AUDIO_OUT, b["src"][5:])
        af = f"afade=t=in:d=0.08,afade=t=out:st={b['dur'] - 0.12:.2f}:d=0.12"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(b["in"]), "-i", src, "-t", str(b["dur"]), "-af", af, dst], check=True)
        return b["id"], f"trim {b['src'][5:]}"
    src = os.path.join(footage, b["src"])
    lufs = loudness(src, b["in"], b["dur"])
    gain = max(-20.0, min(30.0, b.get("lufs", -18.0) - lufs - 2.0))
    af = f"{SPEECH},volume={gain:.1f}dB,alimiter=limit=0.89,afade=t=in:d=0.08,afade=t=out:st={b['dur'] - 0.12:.2f}:d=0.12"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(b["in"]), "-i", src, "-t", str(b["dur"]), "-vn",
                    "-af", af, "-ar", "48000", "-ac", "2", dst], check=True)
    return b["id"], f"bite gain {gain:+.1f}dB"


def main():
    footage = sys.argv[1]
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(AUDIO_OUT, exist_ok=True)
    shots, bites = {}, {}
    for p in sys.argv[2:]:
        edl = json.load(open(p))
        for s in edl["shots"]:
            s["_edl"] = p
            shots[s["id"]] = s
        for b in edl.get("bites", []):
            b["_edl"] = p
            bites[b["id"]] = b
    with ThreadPoolExecutor(3) as ex:
        for sid, msg in ex.map(lambda s: cut(footage, s), shots.values()):
            print(sid, msg, flush=True)
        for bid, msg in ex.map(lambda b: bite(footage, b), bites.values()):
            print(bid, msg, flush=True)


if __name__ == "__main__":
    main()

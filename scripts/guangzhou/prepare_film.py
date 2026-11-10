"""90초 가로 행사 영상 소스 준비 — repo 루트에서 실행한다.

1) 휴대폰 원본은 Drive(링크 공유)에서 통째로, DJI 강의 원본(1-10GB)은 필요한 시간 구간만
   범위 요청으로 받는다(dji_ranged.py).
2) 컷마다 리타임·그레이딩(prep_clip.py, 1920×1080 · 24fps)
3) 가로 사진은 Drive 썸네일 API(최대 3000px)로 받아 사진용 LUT를 입힌다.
4) 발언(사운드바이트)·현장음을 잘라 정리하고 BGM 믹스(make_film_audio.py)까지 만든다.

인자로 shot id를 주면 그 컷만 다시 만든다.
"""
import json
import os
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
os.chdir(ROOT)
SPEC = "scripts/guangzhou/film_shots.json"
spec = json.load(open(SPEC))
SRC = spec["src_dir"]
AUDIO = "public/guangzhou/film/audio"
for d in (SRC, spec["out_dir"], "public/guangzhou/film/photos", AUDIO):
    os.makedirs(d, exist_ok=True)
DL = "https://drive.usercontent.google.com/download?id={}&export=download&confirm=t"
THUMB = "https://drive.google.com/thumbnail?id={}&sz=w3000"


def run(cmd):
    print("+", " ".join(cmd))
    subprocess.run(cmd, check=True)


def fetch(url, out):
    if os.path.exists(out) and os.path.getsize(out) > 0:
        return
    run(["curl", "-sS", "-L", "--retry", "3", "-o", out + ".part", url])
    if open(out + ".part", "rb").read(64).lstrip().startswith(b"<"):
        os.remove(out + ".part")
        sys.exit(f"Drive returned HTML for {out} (quota?) — retry later")
    os.replace(out + ".part", out)


only = set(sys.argv[1:])
run([sys.executable, "scripts/guangzhou/make_lut.py", spec["lut_dir"]])
for name, fid in spec["sources"].items():
    fetch(DL.format(fid), os.path.join(SRC, name))
run([sys.executable, "scripts/guangzhou/dji_ranged.py", SRC, *spec["dji_windows"]])
for shot in spec["shots"]:
    if not only or shot["id"] in only:
        run([sys.executable, "scripts/guangzhou/prep_clip.py", SPEC, shot["id"]])
for pid, p in spec["photos"].items():
    if only and pid not in only:
        continue
    raw = os.path.join(SRC, f"{pid}_raw.jpg")
    fetch(THUMB.format(p["drive"]), raw)
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-vf",
         f"scale='min(2880,iw)':-2:flags=lanczos,lut3d=file={spec['lut_dir']}/look_photo.cube", "-q:v", "3",
         f"public/guangzhou/film/photos/{pid}.jpg"])
for b in spec["bites_audio"]:
    fade = f"afade=t=in:d=0.03,afade=t=out:st={max(0, b['dur'] - 0.05):.3f}:d=0.05"
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(b["start"]), "-t", str(b["dur"]), "-i", os.path.join(SRC, b["src"]),
         "-map", "0:a:0", "-ac", "1", "-ar", "48000", "-af", f"{spec['bite_filter']},{fade}", f"{AUDIO}/{b['id']}.wav"])
for a in spec["ambience"]:
    fade = f"afade=t=in:d=0.04,afade=t=out:st={max(0, a['dur'] - 0.12):.3f}:d=0.12"
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(a["start"]), "-t", str(a["dur"]), "-i", os.path.join(SRC, a["src"]),
         "-map", "0:a:0", "-ac", "2", "-ar", "48000", "-af", f"highpass=f=120,{fade}", f"{AUDIO}/{a['id']}.wav"])
run([sys.executable, "scripts/guangzhou/make_film_audio.py", AUDIO, f"{AUDIO}/mix.wav"])
print("done")

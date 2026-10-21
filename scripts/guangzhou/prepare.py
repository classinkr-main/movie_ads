"""광저우 브이로그 소스 준비 — repo 루트에서 실행한다.

1) Drive(링크 공유)에서 사용 컷의 원본을 내려받고
2) 룩 LUT를 만들고
3) 컷마다 리타임·톤매핑·그레이딩(prep_clip.py)
4) 사진은 Drive 썸네일 API(최대 3000px, HEIC→JPEG)로 받아 LUT를 입히고
5) 현장음(박수·환호)을 잘라 BGM 믹스(make_audio.py)까지 만든다.

Drive가 'Quota exceeded'를 돌려주면(대용량 원본을 짧은 시간에 여러 번 받을 때) 시간을 두고 다시 실행한다.
"""
import json
import os
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
os.chdir(ROOT)
SPEC_PATH = "scripts/guangzhou/shots.json"
spec = json.load(open(SPEC_PATH))
SRC = spec["src_dir"]
os.makedirs(SRC, exist_ok=True)
os.makedirs(spec["out_dir"], exist_ok=True)
os.makedirs("public/guangzhou/photos", exist_ok=True)
os.makedirs("public/guangzhou/audio", exist_ok=True)
DL = "https://drive.usercontent.google.com/download?id={}&export=download&confirm=t"
THUMB = "https://drive.google.com/thumbnail?id={}&sz=w3000"


def run(cmd):
    print("+", " ".join(cmd) if isinstance(cmd, list) else cmd)
    subprocess.run(cmd, check=True)


def fetch(url, out):
    if os.path.exists(out) and os.path.getsize(out) > 0:
        return
    run(["curl", "-sS", "-L", "--retry", "3", "-o", out + ".part", url])
    head = open(out + ".part", "rb").read(64)
    if head.lstrip().startswith(b"<"):
        os.remove(out + ".part")
        sys.exit(f"Drive returned HTML for {out} (quota?) — retry later")
    os.replace(out + ".part", out)


only = set(sys.argv[1:])
run([sys.executable, "scripts/guangzhou/make_lut.py", spec["lut_dir"]])
for name, fid in spec["sources"].items():
    fetch(DL.format(fid), os.path.join(SRC, name))
for shot in spec["shots"]:
    if only and shot["id"] not in only:
        continue
    run([sys.executable, "scripts/guangzhou/prep_clip.py", SPEC_PATH, shot["id"]])
for pid, p in spec["photos"].items():
    if only and pid not in only:
        continue
    raw = os.path.join(SRC, f"{pid}_raw.jpg")
    fetch(THUMB.format(p["drive"]), raw)
    vf = f"lut3d=file={spec['lut_dir']}/look_photo.cube"
    if p["size"] != "full":
        w, h = p["size"].split("x")
        vf = f"scale={w}:{h}:flags=lanczos," + vf
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-vf", vf, "-q:v", "3", f"public/guangzhou/photos/{pid}.jpg"])
for a in spec["ambience"]:
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(a["start"]), "-t", str(a["dur"]), "-i", os.path.join(SRC, a["src"]),
         "-vn", "-ac", "2", "-ar", "48000", os.path.join(SRC, a["file"])])
run([sys.executable, "scripts/guangzhou/make_audio.py", SRC, "public/guangzhou/audio/mix.wav"])
print("done")

#!/usr/bin/env python3
"""영상 갤러리 빌드.

gallery/videos.json(영상 목록)을 읽어 각 파일의 규격을 ffprobe로 재고, 포스터를 뽑고, 갤러리 HTML을 만든다.

  python3 gallery/build.py
      → gallery/index.html + gallery/posters/*.jpg
        저장소를 받은 뒤 브라우저로 gallery/index.html을 열면 out/의 원본 영상을 그대로 재생한다.

  python3 gallery/build.py --web DIR
      → DIR/index.html + DIR/posters/ + DIR/web/*.mp4
        공유용: 원본을 540p 웹 미리보기(파일당 15MB 이하)로 다시 인코딩해 페이지 옆에 둔다.

영상을 추가·교체하면 videos.json만 고치고 다시 실행한다. 포스터는 이미 있으면 다시 뽑지 않으므로,
포스터 시점(posterAt)을 바꿨거나 영상을 다시 렌더했다면 gallery/posters/<id>-<n>.jpg를 지우고 실행한다.
"""
import argparse
import datetime
import html
import json
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(ROOT, "gallery")
REPO_URL = "https://github.com/classinkr-main/movie_ads"
WEB_MAX_BYTES = 14_500_000


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate",
         "-of", "json", path], capture_output=True, text=True, check=True).stdout
    info = json.loads(out)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    num, den = v["r_frame_rate"].split("/")
    return {
        "duration": round(float(info["format"]["duration"]), 2),
        "width": v["width"], "height": v["height"],
        "fps": round(int(num) / int(den)),
        "audio": any(s["codec_type"] == "audio" for s in info["streams"]),
        "bytes": os.path.getsize(path),
    }


def updated(rel):
    out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", rel], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    return out or datetime.date.today().isoformat()


def poster(src, dst, meta, at=None):
    """포스터 프레임: videos.json의 posterAt(초)이 있으면 그 시점, 없으면 길이의 40% 지점."""
    if os.path.exists(dst):
        return
    t = at if at is not None else meta["duration"] * 0.4
    scale = "scale=-2:480" if meta["height"] > meta["width"] else "scale=854:-2"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", src, "-frames:v", "1", "-vf", scale,
                    "-q:v", "4", dst], check=True)


def web_copy(src, dst, meta):
    if os.path.exists(dst):
        return
    scale = "scale=-2:540" if meta["width"] > meta["height"] else "scale=540:-2"
    budget_kbps = int(WEB_MAX_BYTES * 8 / meta["duration"] / 1000) - 96
    vk = max(250, min(900, budget_kbps))
    fps = min(meta["fps"], 30)
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", f"{scale},fps={fps}", "-c:v", "libx264", "-preset", "medium",
           "-b:v", f"{vk}k", "-maxrate", f"{int(vk * 1.3)}k", "-bufsize", f"{vk * 2}k", "-pix_fmt", "yuv420p",
           "-movflags", "+faststart"]
    cmd += ["-c:a", "aac", "-b:a", "80k"] if meta["audio"] else ["-an"]
    subprocess.run(cmd + [dst], check=True)


def build(web_dir=None, branch="main"):
    data = json.load(open(os.path.join(HERE, "videos.json"), encoding="utf-8"))
    out_dir = web_dir or HERE
    os.makedirs(os.path.join(out_dir, "posters"), exist_ok=True)
    if web_dir:
        os.makedirs(os.path.join(web_dir, "web"), exist_ok=True)

    for v in data["videos"]:
        for i, var in enumerate(v["variants"]):
            src = os.path.join(ROOT, var["file"])
            if not os.path.exists(src):
                sys.exit(f"없는 파일: {var['file']}")
            meta = probe(src)
            var.update(meta)
            var["updated"] = updated(var["file"])
            name = f"{v['id']}-{i + 1}"
            poster(src, os.path.join(HERE, "posters", f"{name}.jpg"), meta, v.get("posterAt") if i == 0 else None)
            var["poster"] = f"posters/{name}.jpg"
            var["github"] = f"{REPO_URL}/blob/{branch}/{var['file']}"
            if web_dir:
                shutil.copyfile(os.path.join(HERE, "posters", f"{name}.jpg"), os.path.join(web_dir, "posters", f"{name}.jpg"))
                web_copy(src, os.path.join(web_dir, "web", f"{name}.mp4"), meta)
                var["src"] = f"web/{name}.mp4"
            else:
                var["src"] = "../" + var["file"]
            print(f"  {name:22s} {meta['width']}x{meta['height']} {meta['duration']:6.1f}s", file=sys.stderr)

    data["mode"] = "web" if web_dir else "repo"
    data["repo"] = REPO_URL
    data["branch"] = branch
    data["built"] = datetime.date.today().isoformat()
    template = open(os.path.join(HERE, "template.html"), encoding="utf-8").read()
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    page = template.replace("/*__DATA__*/null", payload)
    if not web_dir:  # 로컬에서 바로 여는 파일 — 아티팩트 게시 때는 스켈레톤이 붙으므로 웹 빌드에는 넣지 않는다
        page = '<!doctype html>\n<html lang="ko">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + page
    with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(page)
    print(f"→ {os.path.relpath(os.path.join(out_dir, 'index.html'), ROOT)}", file=sys.stderr)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--web", metavar="DIR", help="공유용 웹 미리보기 빌드 위치")
    ap.add_argument("--branch", default=None, help="GitHub 링크에 쓸 브랜치(기본: 현재 브랜치)")
    a = ap.parse_args()
    br = a.branch or subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    build(os.path.abspath(a.web) if a.web else None, br)

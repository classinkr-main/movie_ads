"""Read only the needed parts of the large DJI lecture recordings on Drive.

The DJI files are 1-10 GB with the index (moov) at the end. A full download is
wasteful and trips Drive's per-file download quota, so this:
  1) walks the top-level MP4 boxes with 16-byte range reads,
  2) writes every non-media box (ftyp/free/moov) into a sparse local file of the
     original size, so ffmpeg sees a normal MP4 with correct offsets,
  3) fetches media bytes only for the requested time windows (bounded ranges).

Usage (repo 루트에서):
  python3 scripts/guangzhou/dji_ranged.py DIR NAME:t0:t1 [NAME:t0:t1 ...]   # t1=-1 → 끝까지
"""
import json
import os
import struct
import subprocess
import sys

URL = "https://drive.usercontent.google.com/download?id={}&export=download&confirm=t"
FILES = {
    "DJI_0018": ("18_7vkiJSWLmE3w3EqY3_o6Uoxw_1l8Mz", 7839565416),
    "DJI_0019": ("1KI2cOC3x8uJ9FOiRwkyO0kWDh3m39Fut", 4436809795),
    "DJI_0020": ("1P_6L_bFVHmOwCTKv74hBydPDP-mZZplQ", 3958590962),
    "DJI_0028": ("1w476LAE0LIw8uoBMHUoLGI8ance4GSvA", 5750061834),
    "DJI_0030": ("1MzOH4-hc6f7sciDRuifiUB3BoJqAAdHH", 717139009),
    "DJI_0039": ("1C16HhDdJWtCB_SiQXrwMjAxhwcs7gjYT", 10515168300),
    "DJI_0042": ("1dbM1PyyzzuLayCZ0Bj94xdXdDXo-w7vE", 1053393283),
    "DJI_0043": ("1wOC4mGs185H1I4h6gHEDJQlUKRdKCKJK", 1106883117),
    "DJI_0050": ("1W-VrOX2HyU7Qa-6lnLOGEjfXcOz7QHTf", 9367127311),
}
CHUNK = 16 * 1024 * 1024


def get_range(fid, start, end):
    out = subprocess.run(["curl", "-sS", "-L", "--retry", "3", "-r", f"{start}-{end}", URL.format(fid)],
                         capture_output=True, check=True).stdout
    if out[:15].lstrip().startswith(b"<"):
        sys.exit(f"Drive returned HTML for {fid} @ {start} (quota?) — retry later")
    if len(out) != end - start + 1:
        sys.exit(f"short read for {fid} @ {start}: {len(out)} of {end - start + 1}")
    return out


def index(d, name):
    """sparse file + packet tables; idempotent"""
    fid, size = FILES[name]
    path = os.path.join(d, f"{name}.mp4")
    boxes_path = os.path.join(d, f".{name}.boxes.json")
    if os.path.exists(boxes_path) and os.path.exists(path):
        return path
    boxes, off = [], 0
    while off < size:
        hdr = get_range(fid, off, min(off + 15, size - 1))
        bsize, btype = struct.unpack(">I4s", hdr[:8])
        hlen = 8
        if bsize == 1:
            bsize, hlen = struct.unpack(">Q", hdr[8:16])[0], 16
        elif bsize == 0:
            bsize = size - off
        boxes.append({"type": btype.decode("latin1"), "off": off, "size": bsize, "hlen": hlen})
        off += bsize
    with open(path, "wb") as f:
        f.truncate(size)
        for b in boxes:
            f.seek(b["off"])
            n = b["hlen"] if b["type"] == "mdat" else b["size"]
            f.write(get_range(fid, b["off"], b["off"] + n - 1))
    for sel, tag in (("v:0", "v"), ("a:0", "a")):
        csv = subprocess.run(["ffprobe", "-v", "error", "-select_streams", sel, "-show_entries",
                              "packet=pts_time,pos,size,flags", "-of", "csv=p=0", path], capture_output=True, text=True).stdout
        open(os.path.join(d, f".{name}.{tag}.csv"), "w").write(csv)
    json.dump(boxes, open(boxes_path, "w"))
    return path


def packets(d, name, tag):
    rows = []
    for line in open(os.path.join(d, f".{name}.{tag}.csv")):
        p = line.strip().split(",")
        if len(p) >= 4 and p[0] not in ("", "N/A"):
            rows.append((float(p[0]), int(p[2]), int(p[1]), "K" in p[3]))  # pts, pos, size, key
    return rows


def fetch_window(d, name, t0, t1):
    fid, _ = FILES[name]
    path = index(d, name)
    vid = packets(d, name, "v")
    pk = vid + packets(d, name, "a")
    if t1 < 0:
        t1 = max(p[0] for p in pk) + 1
    keys = [p for p in vid if p[3] and p[0] <= t0]
    k0 = max(keys, key=lambda p: p[0])[0] if keys else 0.0
    sel = [p for p in pk if k0 - 0.05 <= p[0] <= t1 + 0.5]
    a, b = min(p[1] for p in sel), max(p[1] + p[2] for p in sel)
    done_path = os.path.join(d, f".{name}.fetched.json")
    done = json.load(open(done_path)) if os.path.exists(done_path) else []
    todo, s = [], a
    for x, y in sorted(done):
        if y <= s or x >= b:
            continue
        if x > s:
            todo.append((s, x))
        s = max(s, y)
    if s < b:
        todo.append((s, b))
    with open(path, "r+b") as f:
        for x, y in todo:
            pos = x
            while pos < y:
                e = min(y, pos + CHUNK) - 1
                f.seek(pos)
                f.write(get_range(fid, pos, e))
                pos = e + 1
    merged = []
    for x, y in sorted(done + [[a, b]]):
        if merged and x <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], y)
        else:
            merged.append([x, y])
    json.dump(merged, open(done_path, "w"))
    print(f"{name} {t0:.0f}-{t1:.0f}s → {(b - a) / 1e6:.0f} MB", flush=True)


if __name__ == "__main__":
    d = sys.argv[1]
    os.makedirs(d, exist_ok=True)
    for arg in sys.argv[2:]:
        name, t0, t1 = arg.split(":")
        fetch_window(d, name, float(t0), float(t1))

"""Retime + grade one shot for the Guangzhou vlog.

Decodes the source (HLG iPhone or SDR Samsung), tone maps to BT.709, applies the
look LUT, crops to 9:16 and scales to OUT_W x OUT_H, then builds every output
frame from a time-remap curve with shutter blending (frame averaging over the
source frames the virtual shutter was open for).

Usage (repo 루트에서): python3 scripts/guangzhou/prep_clip.py scripts/guangzhou/shots.json shot_id
"""
import json, subprocess, sys, os
import numpy as np
from scipy.interpolate import PchipInterpolator

OUT_W, OUT_H, OUT_FPS = 1440, 2560, 30


def build_filter(shot, src_w, src_h, hdr, lut):
    z = shot.get("zoom", 1.0)
    cx, cy = shot.get("cx", 0.5), shot.get("cy", 0.5)
    # largest 9:16 window inside the (rotated) source, then zoom
    if src_w / src_h > 9 / 16:
        ch = src_h
        cw = src_h * 9 / 16
    else:
        cw = src_w
        ch = src_w * 16 / 9
    cw, ch = cw / z, ch / z
    x = min(max(cx * src_w - cw / 2, 0), src_w - cw)
    y = min(max(cy * src_h - ch / 2, 0), src_h - ch)
    cw, ch, x, y = int(cw) // 2 * 2, int(ch) // 2 * 2, int(x) // 2 * 2, int(y) // 2 * 2
    chain = [f"crop={cw}:{ch}:{x}:{y}"]
    if hdr:
        chain += [
            f"zscale=w={OUT_W}:h={OUT_H}:filter=lanczos:t=linear:npl=100",
            "format=gbrpf32le",
            "zscale=p=bt709",
            "tonemap=tonemap=hable:desat=0",
            "zscale=t=bt709:m=bt709:r=tv",
        ]
    else:
        chain += [f"scale={OUT_W}:{OUT_H}:flags=lanczos"]
    chain += [f"lut3d=file={lut}", "format=rgb24"]
    return ",".join(chain)


def main():
    spec = json.load(open(sys.argv[1]))
    shot = next(s for s in spec["shots"] if s["id"] == sys.argv[2])
    src = os.path.join(spec["src_dir"], shot["src"])
    out = os.path.join(spec["out_dir"], f"{shot['id']}.mp4")
    lut = os.path.join(spec["lut_dir"], shot.get("lut", "look.cube"))

    info = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0", "-print_format", "json",
        "-show_streams", src]))["streams"][0]
    w, h = info["width"], info["height"]
    rot = 0
    for sd in info.get("side_data_list", []) or []:
        rot = sd.get("rotation", rot)
    if abs(int(rot)) % 180 == 90:
        w, h = h, w
    hdr = info.get("color_transfer") == "arib-std-b67"
    dur = float(json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", src]))["format"]["duration"])
    n, d = info["avg_frame_rate"].split("/")
    src_fps = 120 if float(n) / float(d) > 90 else 30

    # time remap: keyframes [[out_frame, src_seconds], ...] (monotone cubic)
    keys = np.array(shot["map"], dtype=float)
    H = int(spec.get("handle", 8))
    nvis = int(shot["frames"])
    nframes = nvis + 2 * H
    core = PchipInterpolator(keys[:, 0], keys[:, 1], extrapolate=False)
    s_in = (keys[1, 1] - keys[0, 1]) / (keys[1, 0] - keys[0, 0])
    s_out = (keys[-1, 1] - keys[-2, 1]) / (keys[-1, 0] - keys[-2, 0])

    def remap(j):
        i = j - H  # visible frame index
        if i < keys[0, 0]:
            v = keys[0, 1] + (i - keys[0, 0]) * s_in
        elif i > keys[-1, 0]:
            v = keys[-1, 1] + (i - keys[-1, 0]) * s_out
        else:
            v = float(core(i))
        return min(max(v, 0.0), dur - 1.0 / src_fps)
    shutter = float(shot.get("shutter", 0.5))
    gain = float(shot.get("gain", 1.0)); gamma = float(shot.get("gamma", 1.0))
    tone = None
    if gain != 1.0 or gamma != 1.0:
        x = np.arange(256) / 255.0
        tone = np.clip(255 * (np.clip(x * gain, 0, 1) ** gamma) + 0.5, 0, 255).astype(np.uint8)

    t0 = max(float(remap(0)) - 0.05, 0.0)
    t1 = min(float(remap(nframes - 1 + shutter)) + 0.1, dur)
    vf = build_filter(shot, w, h, hdr, lut)
    dec = subprocess.Popen([
        "ffmpeg", "-v", "error", "-ss", f"{t0:.4f}", "-i", src, "-t", f"{t1 - t0:.4f}",
        "-vf", vf, "-r", str(src_fps), "-fps_mode", "cfr", "-an",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, bufsize=10**8)
    enc = subprocess.Popen([
        "ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{OUT_W}x{OUT_H}", "-r", str(OUT_FPS), "-i", "-",
        "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
        "-c:v", "libx264", "-preset", "slow", "-crf", str(spec.get("crf", 15)),
        "-x264-params", "keyint=15:min-keyint=1",
        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
        "-movflags", "+faststart", out], stdin=subprocess.PIPE)

    fsize = OUT_W * OUT_H * 3
    buf = {}  # src frame index -> array
    next_idx = 0
    eof = False

    def read_until(k):
        nonlocal next_idx, eof
        while not eof and next_idx <= k:
            raw = dec.stdout.read(fsize)
            if len(raw) < fsize:
                eof = True
                break
            buf[next_idx] = np.frombuffer(raw, np.uint8).reshape(OUT_H, OUT_W, 3)
            next_idx += 1

    last = None
    for i in range(nframes):
        a = (float(remap(i)) - t0) * src_fps
        b = (float(remap(i + shutter)) - t0) * src_fps
        ka = int(round(a))
        kb = max(ka, int(round(b)) - 1)
        read_until(kb)
        frames = [buf[k] for k in range(ka, kb + 1) if k in buf]
        if not frames:
            frames = [last] if last is not None else [buf[max(buf)]]
        if len(frames) == 1:
            img = frames[0]
        else:
            img = (np.mean(np.stack(frames).astype(np.float32), axis=0) + 0.5).astype(np.uint8)
        if tone is not None:
            img = tone[img]
        enc.stdin.write(img.tobytes())
        last = frames[-1]
        for k in [k for k in buf if k < ka]:
            del buf[k]
    enc.stdin.close()
    enc.wait()
    dec.stdout.close()
    dec.kill()
    print(f"{shot['id']}: {nvis}f (+{H} handles) from {shot['src']} {remap(H):.2f}-{remap(H + nvis):.2f}s")


if __name__ == "__main__":
    main()

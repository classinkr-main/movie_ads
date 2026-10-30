"""Propose horizontal crop centers for 9:16 reframing by tracking the main face/person.

usage: python track.py <raw_dir> <src> <a> <b> [fps]
prints keyframes [(t_src, cx_px), ...] in source pixels (1920-wide frame), ready for `vcx` in edl_shorts.py.
Needs opencv-python-headless < 5 (Haar cascades).
"""
import subprocess, sys
import cv2
import numpy as np

raw_dir, src, a, b = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
fps = float(sys.argv[5]) if len(sys.argv) > 5 else 5.0
SW, SH = 640, 360
scale = 1920 / SW
DEAD_ZONE = 110   # source px the subject may drift before the crop follows
HALF_CROP = 405   # half of the 810px-wide crop used for the 3:4 shorts window

cmd = ["ffmpeg", "-v", "error", "-ss", f"{a}", "-t", f"{b - a}", "-i", f"{raw_dir}/{src}.mp4", "-map", "0:v:0",
       "-vf", f"fps={fps},scale={SW}:{SH}", "-f", "rawvideo", "-pix_fmt", "gray", "-"]
raw = subprocess.run(cmd, capture_output=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, SH, SW)

front = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
prof = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")
hog = cv2.HOGDescriptor()
hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

xs = []
prev = None
for f in frames:
    cands = []
    for (x, y, w, h) in front.detectMultiScale(f, 1.1, 5, minSize=(28, 28)):
        cands.append((w * h, x + w / 2))
    for (x, y, w, h) in prof.detectMultiScale(f, 1.1, 5, minSize=(28, 28)):
        cands.append((w * h, x + w / 2))
    for (x, y, w, h) in prof.detectMultiScale(cv2.flip(f, 1), 1.1, 5, minSize=(28, 28)):
        cands.append((w * h, SW - (x + w / 2)))
    if not cands:
        rects, _ = hog.detectMultiScale(f, winStride=(8, 8))
        cands = [(w * h, x + w / 2) for (x, y, w, h) in rects]
    if cands:
        if prev is None:
            cx = max(cands)[1]
        else:  # stay on the subject: prefer big and close to the previous center
            cx = min(cands, key=lambda c: abs(c[1] - prev) - 0.002 * c[0])[1]
        prev = cx
    xs.append(prev)

# fill gaps, median filter, then "lazy follow": the crop only moves once the subject leaves a dead zone
arr = np.array([np.nan if v is None else v for v in xs], float) * scale
if np.all(np.isnan(arr)):
    arr[:] = 960
idx = np.arange(len(arr))
ok = ~np.isnan(arr)
arr = np.interp(idx, idx[ok], arr[ok])
med = np.array([np.median(arr[max(0, i - 2): i + 3]) for i in range(len(arr))])
c, follow = med[0], []
for v in med:
    if v - c > DEAD_ZONE:
        c = v - DEAD_ZONE
    elif c - v > DEAD_ZONE:
        c = v + DEAD_ZONE
    follow.append(c)
sm = np.convolve(np.pad(np.array(follow), 3, mode="edge"), np.ones(7) / 7, mode="valid")
half = HALF_CROP
kf = []
step = max(1, int(round(fps * 0.4)))
for i in list(range(0, len(sm), step)) + [len(sm) - 1]:
    x = int(np.clip(sm[i], half, 1920 - half))
    if not kf or abs(x - kf[-1][1]) > 4 or i == len(sm) - 1:
        kf.append((round(a + i / fps, 2), x))
print(kf)

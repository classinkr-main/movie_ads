#!/usr/bin/env python3
"""사진 → 45° 하프톤 망점 PNG(투명 배경 위 잉크 점).

Vox식 '인쇄물' 질감을 위해 영상 안에서 사진 위에 겹쳐 쓴다. 점 색은 컴포넌트에서 CSS로 입힌다.
    python3 -I tools/assets/halftone.py <입력> <출력.png> [--cell 9] [--width 1600]
"""
import argparse
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps


def halftone(src: str, dst: str, cell: float, width: int, gamma: float) -> None:
    img = ImageOps.exif_transpose(Image.open(src)).convert("L")
    img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    img = ImageOps.autocontrast(img, cutoff=1).filter(ImageFilter.GaussianBlur(cell * 0.25))
    g = np.asarray(img, dtype=np.float32) / 255.0
    h, w = g.shape
    scale = 3  # 슈퍼샘플링 후 축소해 점 가장자리를 부드럽게
    out = Image.new("L", (w * scale, h * scale), 0)
    draw = ImageDraw.Draw(out)
    ang = math.radians(45)
    ca, sa = math.cos(ang), math.sin(ang)
    diag = int(math.hypot(w, h) / cell) + 2
    for i in range(-diag, diag):
        for j in range(-diag, diag):
            x = (i * ca - j * sa) * cell + w / 2
            y = (i * sa + j * ca) * cell + h / 2
            if not (0 <= x < w and 0 <= y < h):
                continue
            dark = (1.0 - g[int(y), int(x)]) ** gamma
            r = cell * 0.72 * math.sqrt(dark)
            if r < 0.35:
                continue
            draw.ellipse([(x - r) * scale, (y - r) * scale, (x + r) * scale, (y + r) * scale], fill=255)
    alpha = out.resize((w, h), Image.LANCZOS)
    rgba = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rgba.putalpha(alpha)
    rgba.save(dst, optimize=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--cell", type=float, default=9.0)
    ap.add_argument("--width", type=int, default=1600)
    ap.add_argument("--gamma", type=float, default=1.1)
    a = ap.parse_args()
    halftone(a.src, a.dst, a.cell, a.width, a.gamma)

"""BrandReel 질감 텍스처 생성 — 런타임 SVG 필터 대신 미리 구운 이미지로 렌더 비용을 줄인다.

  python3 scripts/make_textures.py

출력(public/reel/tex/):
  grain.png       512² 회색 필름/화면 그레인(타일링) — soft-light/overlay 블렌드용
  chalk.png       1920×1080 칠판 분필 가루 얼룩 · 지우개 자국 · 지워진 판서 흔적(흰색 + 알파) — screen 블렌드용
  reflection.jpg  960×540 교실 사진을 좌우 반전·강하게 흐린 유리 반사(어둡게)
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "public", "reel", "tex")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)


def value_noise(w, h, cell, octaves=3):
    """부드러운 저주파 노이즈(0..1) — 작은 난수 격자를 바이큐빅으로 키워 옥타브 합성."""
    acc = np.zeros((h, w))
    amp, total = 1.0, 0.0
    for o in range(octaves):
        c = max(2, cell // (2**o))
        gw, gh = w // c + 2, h // c + 2
        g = Image.fromarray((rng.random((gh, gw)) * 255).astype("uint8"))
        g = np.asarray(g.resize((gw * c, gh * c), Image.BICUBIC), dtype=float)[:h, :w] / 255
        acc += g * amp
        total += amp
        amp *= 0.5
    return acc / total


# 1) grain — 타일링되는 회색 그레인
g = rng.normal(128, 34, (512, 512))
g = np.clip(g, 0, 255).astype("uint8")
Image.fromarray(g, "L").filter(ImageFilter.GaussianBlur(0.6)).save(os.path.join(OUT, "grain.png"))

# 2) chalk — 분필 가루 얼룩 + 지우개 자국 + 지워진 판서 흔적
W, H = 1920, 1080
alpha = np.zeros((H, W))
blot = value_noise(W, H, 220, 4)
alpha += np.clip((blot - 0.45) * 0.45, 0, None)  # 얼룩(최대 ~0.25)

smear = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(smear)
for _ in range(26):  # 지우개가 지나간 넓은 사선 자국
    x = rng.uniform(-200, W)
    y = rng.uniform(-100, H)
    ln = rng.uniform(300, 900)
    ang = math.radians(rng.uniform(-28, -8))
    wdt = int(rng.uniform(40, 120))
    d.line([(x, y), (x + ln * math.cos(ang), y + ln * math.sin(ang))], fill=int(rng.uniform(18, 40)), width=wdt)
smear = smear.filter(ImageFilter.GaussianBlur(28))
alpha += np.asarray(smear, dtype=float) / 255

ghost = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(ghost)
font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
scribbles = ["y = x² − 4x + 3", "since 2019", "Unit 4 · past simple", "√(a² + b²)", "x = 2", "→ review", "p.11", "I went to ...", "a + b = 7", "Q3. ( ✓ )"]
for s in scribbles:
    f = ImageFont.truetype(font_path, int(rng.uniform(46, 96)))
    layer = Image.new("L", (W, H), 0)
    ImageDraw.Draw(layer).text((rng.uniform(0, W - 600), rng.uniform(60, H - 120)), s, font=f, fill=int(rng.uniform(70, 120)))
    layer = layer.rotate(rng.uniform(-6, 6), resample=Image.BICUBIC)
    ghost = Image.fromarray(np.maximum(np.asarray(ghost), np.asarray(layer)))
for _ in range(14):  # 지워진 낙서 곡선
    pts = []
    x, y = rng.uniform(0, W), rng.uniform(0, H)
    for k in range(8):
        x += rng.uniform(-90, 90)
        y += rng.uniform(-50, 50)
        pts.append((x, y))
    ImageDraw.Draw(ghost).line(pts, fill=int(rng.uniform(60, 100)), width=int(rng.uniform(5, 10)), joint="curve")
ghost = ghost.filter(ImageFilter.GaussianBlur(5))
alpha += np.asarray(ghost, dtype=float) / 255 * 0.34

specks = rng.random((H, W)) > 0.9965  # 분필 가루 점
alpha += specks * rng.uniform(0.15, 0.45, (H, W))

alpha = np.clip(alpha, 0, 1)
rgba = np.zeros((H, W, 4), dtype="uint8")
rgba[..., :3] = 255
rgba[..., 3] = (alpha * 255).astype("uint8")
Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, "chalk.png"), optimize=True)

# 3) reflection — 교실 사진 반전 + 강한 블러 + 어둡게
src = Image.open(os.path.join(ROOT, "public", "reel", "photos", "showroom-wide.jpg")).convert("RGB")
r = src.transpose(Image.FLIP_LEFT_RIGHT).resize((960, 720), Image.BICUBIC).crop((0, 90, 960, 630))
r = r.filter(ImageFilter.GaussianBlur(14))
arr = np.asarray(r, dtype=float) * 0.8
Image.fromarray(np.clip(arr, 0, 255).astype("uint8")).save(os.path.join(OUT, "reflection.jpg"), quality=82)

for name in sorted(os.listdir(OUT)):
    print(name, os.path.getsize(os.path.join(OUT, name)) // 1024, "KB")

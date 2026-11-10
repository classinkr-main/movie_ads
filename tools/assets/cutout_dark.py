#!/usr/bin/env python3
"""검은 배경 제품 사진 → 알파 누끼 PNG(밝은 금속 제품 전용).

미래 교실 AI 카메라 컷의 `public/photos/hw-camera-cutout.png`를 classinkr-web `hw/camera/camera-dual-premium.png`에서 이렇게 만들었다
(저장소의 `camera-dual-premium-cutout.png`는 알파가 뒤집혀 있어 쓰지 않는다). 결과는 알파 bbox에 여백 30px을 두고 잘라 쓴다.
    pip install pymatting
    python3 -I tools/assets/cutout_dark.py <입력.png> <출력.png> <미리보기.jpg>
1) 밝은 금속(L>0.2) 중 테두리에 닿지 않는 큰 덩어리 → 닫기 + 구멍 메우기(렌즈·방열판 틈)로 실루엣
2) 실루엣 경계 띠만 미지 영역으로 둔 트라이맵 → closed-form 매팅 → 전경색 복원(검은 테두리 제거)
미리보기는 연두·흰·잉크 위 합성을 나란히 저장한다.
"""
import sys

import numpy as np
from PIL import Image
from pymatting import estimate_alpha_cf, estimate_foreground_ml
from scipy import ndimage as ndi

src, out, preview = sys.argv[1:4]
img = np.asarray(Image.open(src).convert("RGB")).astype(np.float64) / 255
L = 0.2126 * img[..., 0] + 0.7152 * img[..., 1] + 0.0722 * img[..., 2]
H, W = L.shape


def disk(r: int) -> np.ndarray:
    y, x = np.ogrid[-r : r + 1, -r : r + 1]
    return x * x + y * y <= r * r


def keep_inner(mask: np.ndarray, min_size: int) -> np.ndarray:
    lab, n = ndi.label(mask)
    if n == 0:
        return mask
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    sizes = ndi.sum(mask, lab, range(1, n + 1))
    keep = [i + 1 for i, s in enumerate(sizes) if s >= min_size and (i + 1) not in border]
    return np.isin(lab, keep)


# 배경에도 L 0.1–0.18 정도의 옅은 빛 번짐이 있어, 실루엣은 밝은 금속(L>0.2)만으로 잡고 경계는 매팅에 맡긴다
# 렌즈 왼쪽 위로 들어오는 빛줄기는 푸른 기(B−(R+G)/2 ≈ 0.07)가 있는 어두운 회색이라 금속과 구분된다
glow = (img[..., 2] - (img[..., 0] + img[..., 1]) / 2 > 0.05) & (L < 0.42)
core = keep_inner((L > 0.2) & ~glow, 20000)
sil = ndi.binary_fill_holes(ndi.binary_closing(core, structure=disk(8)))  # 렌즈 안쪽 푸른 반사는 테두리에 둘러싸여 다시 채워진다
sil = ndi.binary_opening(sil, structure=disk(2))

fg = ndi.binary_erosion(sil, structure=disk(2))
bg = ~ndi.binary_dilation(sil, structure=disk(4))  # 바깥 띠를 좁혀 빛 번짐이 반투명으로 남지 않게
bg |= glow & ~ndi.binary_erosion(sil, structure=disk(3))
trimap = np.full(L.shape, 0.5)
trimap[fg] = 1.0
trimap[bg] = 0.0

alpha = estimate_alpha_cf(img, trimap)
alpha = np.clip(alpha, 0, 1)
alpha[bg] = 0
alpha[fg] = 1
fore = estimate_foreground_ml(img, alpha)
fore = np.clip(fore, 0, 1)

rgba = np.dstack([fore, alpha])
Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), "RGBA").save(out, optimize=True)

# 미리보기: 연두 · 흰 · 잉크 위 합성
tiles = []
for bgc in [(226, 244, 185), (255, 255, 255), (10, 11, 20)]:
    base = np.ones_like(fore) * np.array(bgc) / 255
    comp = fore * alpha[..., None] + base * (1 - alpha[..., None])
    tiles.append(Image.fromarray((comp * 255).astype(np.uint8)).resize((W // 2, H // 2), Image.LANCZOS))
sheet = Image.new("RGB", (W // 2 * 3, H // 2))
for i, t in enumerate(tiles):
    sheet.paste(t, (i * (W // 2), 0))
sheet.save(preview, quality=88)
ys, xs = np.nonzero(alpha > 0.02)
print(f"alpha bbox x {xs.min()}–{xs.max()} y {ys.min()}–{ys.max()}  opaque {(alpha > 0.98).mean() * 100:.1f}%  partial {((alpha > 0.02) & (alpha <= 0.98)).mean() * 100:.2f}%")

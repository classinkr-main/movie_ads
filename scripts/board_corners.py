"""사진 속 빈 전자칠판(어두운 화면) 네 꼭짓점 검출 — 스크린 리플레이스(src/reel/HeroShot.tsx QUAD)용.

  python3 scripts/board_corners.py public/reel/photos/board-dual-blank.jpg [임계값=60]

가장 큰 어두운 연결 영역을 찾아 x+y / x−y 극값으로 좌상·우상·우하·좌하를 고른다.
출력 좌표는 원본 사진 픽셀이며, HeroShot은 사진을 1920 폭으로 깔기 때문에 0.75배(2560→1920)해서 쓴다.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image

path = sys.argv[1]
thr = int(sys.argv[2]) if len(sys.argv) > 2 else 60
im = Image.open(path).convert("L")
W, H = im.size
k = 4
small = np.array(im.resize((W // k, H // k)))
mask = small < thr
h, w = mask.shape
seen = np.zeros((h, w), bool)
best = []
for y in range(h):
    for x in range(w):
        if mask[y, x] and not seen[y, x]:
            q = deque([(y, x)])
            seen[y, x] = True
            pts = []
            while q:
                cy, cx = q.popleft()
                pts.append((cy, cx))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
            if len(pts) > len(best):
                best = pts
pts = np.array(best) * k
ys, xs = pts[:, 0], pts[:, 1]
s, d = xs + ys, xs - ys
corners = {
    "tl": (xs[s.argmin()], ys[s.argmin()]),
    "tr": (xs[d.argmax()], ys[d.argmax()]),
    "br": (xs[s.argmax()], ys[s.argmax()]),
    "bl": (xs[d.argmin()], ys[d.argmin()]),
}
print(f"{path} {W}x{H}")
for name, (cx, cy) in corners.items():
    print(f"{name}: {int(cx)}, {int(cy)}  (×0.75 → {cx * 1920 / W:.0f}, {cy * 1920 / W:.0f})")

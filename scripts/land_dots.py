"""S5 지구본용 육지 점 생성 — python3 scripts/land_dots.py land-110m.json mask.png 13000 dots.json

land-110m.json: https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json (Natural Earth, 퍼블릭 도메인)
출력 dots.json을 src/reel/data/landDots.ts 의 평탄 배열로 옮긴다.
"""
import json, math, sys
from PIL import Image, ImageDraw
topo = json.load(open(sys.argv[1]))
sx, sy = topo['transform']['scale']; tx, ty = topo['transform']['translate']
arcs = []
for arc in topo['arcs']:
    x = y = 0; pts = []
    for dx, dy in arc:
        x += dx; y += dy
        pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)
def ring(idxs):
    out = []
    for i in idxs:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        out.extend(a if not out else a[1:])
    return out
W, H = 1440, 720
im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im)
for g in topo['objects']['land']['geometries']:
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
    for poly in polys:
        for k, r in enumerate(poly):
            raw = ring(r); un = []; off = 0
            for j, (lon, lat) in enumerate(raw):
                if j:
                    dl = lon - raw[j - 1][0]
                    if dl > 180: off -= 360
                    elif dl < -180: off += 360
                un.append((lon + off, lat))
            for shift in (-360, 0, 360):
                pts = [((lon + shift + 180) / 360 * W, (90 - lat) / 180 * H) for lon, lat in un]
                if len(pts) > 2:
                    d.polygon(pts, fill=255 if k == 0 else 0)
im.save(sys.argv[2])
# 피보나치 구면 점 — 균일 분포
n = int(sys.argv[3]); keep = []
ga = math.pi * (3 - math.sqrt(5))
px = im.load()
for i in range(n):
    yv = 1 - 2 * (i + 0.5) / n
    lat = math.degrees(math.asin(yv)); lon = math.degrees((i * ga) % (2 * math.pi)) - 180
    if lat < -60: continue  # 남극 제외
    u = int((lon + 180) / 360 * (W - 1)); v = int((90 - lat) / 180 * (H - 1))
    if px[u, v] > 128: keep.append((round(lat, 1), round(lon, 1)))
print(len(keep))
json.dump(keep, open(sys.argv[4], 'w'), separators=(',', ':'))

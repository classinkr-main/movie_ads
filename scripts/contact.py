# 개발용: 스틸 여러 장을 한 장의 콘택트 시트로 묶는다.
#   python3 scripts/contact.py <outPng> <cols> <file...>
import sys
from PIL import Image, ImageDraw
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ims = [Image.open(f).convert("RGB") for f in files]
w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * h), "white")
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * w, (i // cols) * h
    sheet.paste(im, (x, y))
    label = f.rsplit("-", 1)[-1].split(".")[0]
    d.rectangle([x, y, x + 74, y + 24], fill="black")
    d.text((x + 6, y + 5), "f" + label, fill="white")
sheet.save(out)
print(out, sheet.size)

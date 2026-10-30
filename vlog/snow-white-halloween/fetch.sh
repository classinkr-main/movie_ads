#!/usr/bin/env bash
# Download the source clips (Drive folder "클래스인사이드") and the OFL display fonts.
# The Drive files must be shared as "anyone with the link - viewer" while this runs.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p raw fonts

while read -r name id; do
  [ -z "$name" ] && continue
  if [ ! -s "raw/$name.mp4" ]; then
    curl -sSL --retry 4 -o "raw/$name.mp4" "https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t"
    file "raw/$name.mp4" | grep -q "ISO Media" || { echo "raw/$name.mp4 is not a video (is link sharing on?)" >&2; exit 1; }
  fi
done <<'EOF'
0520 1-bhkVi8K2m1Ty8psr2xps7hyFGZq10FE
0521 1Fyd99l9NNl46HmXFu5-ryGJvCZxdJdzb
0522 14b7YYA_QKvY2znUOLH-NqdffyP1AM2_B
0523 1AqBq79jNmumvdqWbACIOkxV2RzA89tbT
0524 14mLIm1j4S4RJTXCU5-xUx0mT2GaT02Pi
0525 1jwZyFgo1PY65WGfxe3u81xQiG2kbrB8H
0526 1SvDjsQKnwas2v9ktHIQ1PdHxfeBr-eox
0527 1dt5ObajfboBxYb5cbXZrIecr0-hDupoB
0529 1ehnU3jAKfdK7otySUjBwZcWKh12iGPNG
0530 1W-SmeRbuBSn2gSnusmFUmA5JHlBVTEZl
EOF

for p in ofl/blackhansans/BlackHanSans-Regular.ttf ofl/jua/Jua-Regular.ttf ofl/dohyeon/DoHyeon-Regular.ttf \
         ofl/nanummyeongjo/NanumMyeongjo-Regular.ttf ofl/nanummyeongjo/NanumMyeongjo-Bold.ttf \
         ofl/nanummyeongjo/NanumMyeongjo-ExtraBold.ttf; do
  f="fonts/$(basename "$p")"
  [ -s "$f" ] || curl -sSL --retry 4 -o "$f" "https://cdn.jsdelivr.net/gh/google/fonts@main/$p"
done
echo "sources ready"

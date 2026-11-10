#!/bin/sh
# 브래그컷 납품 — 가장 좋은 '안착한' 프레임을 brag.jpg로 뽑고, 같은 프레임을 brag.mp4의 0번 프레임에 굽는다.
# 프레임을 추가하지 않고 0번을 교체하므로 길이·오디오 싱크는 그대로다.
#
#   sh scripts/brag-poster.sh [포스터 프레임]   # 기본 252 = 01 분석 장면, 종합 88 안착 직후
set -eu
FRAME=${1:-252}
DIR=out/brag
RAW=$DIR/brag-raw.mp4

ffmpeg -v error -y -i "$RAW" -vf "select=eq(n\,$FRAME)" -frames:v 1 "$DIR/poster.png"
ffmpeg -v error -y -i "$DIR/poster.png" -q:v 2 "$DIR/brag.jpg"
ffmpeg -v error -y -i "$RAW" -i "$DIR/poster.png" \
  -filter_complex "[1:v]format=yuv420p[p];[0:v][p]overlay=enable='eq(n,0)'" \
  -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a copy -movflags +faststart "$DIR/brag.mp4"
rm -f "$DIR/poster.png" "$RAW"
echo "wrote $DIR/brag.mp4 · $DIR/brag.jpg (poster frame $FRAME)"

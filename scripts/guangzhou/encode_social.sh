#!/usr/bin/env bash
# Remotion 마스터 → 업로드용 H.264 (2-pass 9Mbps, 오디오는 원본 WAV에서 AAC 256k) — repo 루트에서 실행
set -euo pipefail
cd "$(dirname "$0")/../.."
IN=out/guangzhou-vlog-master.mp4
OUT=out/guangzhou-vlog.mp4
LOG=$(mktemp -d)/x264
V="-c:v libx264 -preset slow -b:v 9M -maxrate 13M -bufsize 18M -profile:v high -level 4.2 -pix_fmt yuv420p -x264-params keyint=60:min-keyint=1"
ffmpeg -v error -y -i "$IN" $V -pass 1 -passlogfile "$LOG" -an -f mp4 /dev/null
ffmpeg -v error -y -i "$IN" -i public/guangzhou/audio/mix.wav -map 0:v -map 1:a $V -pass 2 -passlogfile "$LOG" \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$OUT"
ls -la "$OUT"

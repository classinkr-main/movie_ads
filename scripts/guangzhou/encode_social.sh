#!/usr/bin/env bash
# Remotion 마스터 → 업로드용 H.264 2-pass (오디오는 원본 WAV에서 AAC 256k) — repo 루트에서 실행
#   bash scripts/guangzhou/encode_social.sh                       # 30초 세로 브이로그 (9 Mbps)
#   bash scripts/guangzhou/encode_social.sh film                  # 90초 가로 행사 영상 (8 Mbps — GitHub 100MB 파일 한도 안)
set -euo pipefail
cd "$(dirname "$0")/../.."
if [ "${1:-vlog}" = "film" ]; then
  IN=out/guangzhou-event-film-master.mp4; OUT=out/guangzhou-event-film.mp4; WAV=public/guangzhou/film/audio/mix.wav
  RATE=8M; MAX=12M; BUF=16M; GOP=48
else
  IN=out/guangzhou-vlog-master.mp4; OUT=out/guangzhou-vlog.mp4; WAV=public/guangzhou/audio/mix.wav
  RATE=9M; MAX=13M; BUF=18M; GOP=60
fi
LOG=$(mktemp -d)/x264
V="-c:v libx264 -preset slow -b:v $RATE -maxrate $MAX -bufsize $BUF -profile:v high -level 4.2 -pix_fmt yuv420p -x264-params keyint=$GOP:min-keyint=1"
ffmpeg -v error -y -i "$IN" $V -pass 1 -passlogfile "$LOG" -an -f mp4 /dev/null
ffmpeg -v error -y -i "$IN" -i "$WAV" -map 0:v -map 1:a $V -pass 2 -passlogfile "$LOG" \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$OUT"
ls -la "$OUT"

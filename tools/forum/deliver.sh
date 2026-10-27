#!/usr/bin/env bash
# 마스터 렌더 → 납품본: 라우드니스 -16 LUFS(2-pass loudnorm) + x264 2-pass 비트레이트 인코딩.
# usage: tools/forum/deliver.sh <master.mp4> <out.mp4> <video kbps>
set -euo pipefail
in="$1"; out="$2"; kbps="$3"
tmp="$(mktemp -d)"
stats=$(ffmpeg -hide_banner -i "$in" -vn -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ln="loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true"
common=(-c:v libx264 -preset slow -b:v "${kbps}k" -maxrate "$((kbps * 2))k" -bufsize "$((kbps * 4))k" -pix_fmt yuv420p
        -color_primaries bt709 -color_trc bt709 -colorspace bt709 -g 60 -profile:v high)
ffmpeg -v error -y -i "$in" "${common[@]}" -pass 1 -passlogfile "$tmp/x264" -an -f mp4 /dev/null
ffmpeg -v error -y -i "$in" "${common[@]}" -pass 2 -passlogfile "$tmp/x264" \
  -af "$ln,aresample=48000" -c:a aac -b:a 192k -movflags +faststart "$out"
rm -rf "$tmp"

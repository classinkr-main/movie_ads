#!/usr/bin/env bash
# 오리지널 음악 렌더 — fluidsynth + fluid-soundfont-gm(FluidR3_GM, MIT) 필요.
# usage: tools/forum/music.sh   → public/forum/audio/music-{highlight,live}.wav
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../../public/forum/audio"
sf2="${SF2:-/usr/share/sounds/sf2/FluidR3_GM.sf2}"
tmp="$(mktemp -d)"
mkdir -p "$out"
for v in highlight live; do
  python3 "$here/compose_music.py" "$v" "$tmp/$v.mid"
  fluidsynth -ni -g 0.7 -r 48000 -R 1 -C 1 -F "$tmp/$v.raw.wav" "$sf2" "$tmp/$v.mid" > /dev/null
  ffmpeg -v error -y -i "$tmp/$v.raw.wav" \
    -af "highpass=f=30,acompressor=threshold=-18dB:ratio=2.5:attack=20:release=250:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=9" \
    -ar 48000 "$out/music-$v.wav"
done
rm -rf "$tmp"

#!/usr/bin/env bash
# 부산 포럼 원본(Google Drive "260529 부산 포럼(영상)" 폴더)을 내려받는다. 링크 공유된 파일만 받을 수 있다.
# usage: tools/forum/fetch.sh <footage_dir>
set -euo pipefail
out="${1:?footage dir}"
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$out/main" "$out/cn"
while IFS=$'\t' read -r id folder name; do
  [ -z "$id" ] && continue
  dst="$out/$folder/$name"
  [ -s "$dst" ] && continue
  for i in 1 2 3 4; do
    if curl -sS -L --fail -o "$dst.part" "https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t"; then
      mv "$dst.part" "$dst"; break
    fi
    sleep $((2 ** i))
  done
  echo "$folder/$name"
done < "$here/footage.tsv"

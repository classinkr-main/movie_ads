#!/usr/bin/env bash
# 부산 포럼 원본을 내려받는다. 링크 공유된 파일만 받을 수 있다.
#   main·cn  — "260529 부산 포럼(영상)" 폴더의 카메라 원본
#   kakao·photos — "260528 학원 탐방" 폴더의 핸드폰 영상·카메라 사진, photos 에는 "260529 부산 포럼(사진)" 카메라 사진도 함께 둔다
# usage: tools/forum/fetch.sh <footage_dir>
set -euo pipefail
out="${1:?footage dir}"
here="$(cd "$(dirname "$0")" && pwd)"
while IFS=$'\t' read -r id folder name; do
  [ -z "$id" ] && continue
  mkdir -p "$out/$folder"
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

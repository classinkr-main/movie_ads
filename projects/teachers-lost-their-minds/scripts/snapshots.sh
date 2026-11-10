#!/usr/bin/env bash
# 장면별 대표 프레임을 snapshots/<scene_id>.png 로 뽑고, deliverables/contact-sheet.jpg 를 만듭니다.
#   npm run mental:snapshots
# renders/final.mp4 가 있으면 거기서 프레임을 꺼내고(빠름), 없으면 Remotion 으로 스틸을 렌더합니다.
# (OpenMontage Backlot 보드의 필름스트립이 snapshots/ 를 읽습니다.)
set -euo pipefail
cd "$(dirname "$0")/../../.."
P=projects/teachers-lost-their-minds
mkdir -p "$P/snapshots" "$P/deliverables"

# 장면 id : 대표 프레임 (30fps 기준 추정 타이밍. 타이밍을 바꿨다면 프레임도 같이 옮기세요.)
SHOTS="s01:118 s02:232 s03:520 s05:765 s06:1040 s08:1290 s09:1450 s10:1700 s11:1920 s12:2230 s13:2440 s14:2560 s15:2775 s16:2990 s17:3110 s18:3440 s19:3790 s21:3920"

if [ -f "$P/renders/final.mp4" ]; then
  for shot in $SHOTS; do
    id=${shot%%:*}; frame=${shot##*:}
    ffmpeg -y -loglevel error -i "$P/renders/final.mp4" -vf "select=eq(n\\,$frame),scale=960:-2" -frames:v 1 "$P/snapshots/$id.png"
  done
else
  running=0
  for shot in $SHOTS; do
    id=${shot%%:*}; frame=${shot##*:}
    npx remotion still "$P/index.tsx" TeachersMental "$P/snapshots/$id.png" --frame="$frame" --public-dir="$P/public" --scale=0.5 --log=error &
    running=$((running + 1))
    if [ "$running" -ge 3 ]; then wait; running=0; fi
  done
  wait
fi

ffmpeg -y -loglevel error -pattern_type glob -i "$P/snapshots/s*.png" -vf "tile=3x6:padding=10:margin=10:color=0x1B1A17" -frames:v 1 -q:v 3 "$P/deliverables/contact-sheet.jpg"
echo "snapshots: $(ls "$P"/snapshots/*.png | wc -l) · contact sheet: $P/deliverables/contact-sheet.jpg"

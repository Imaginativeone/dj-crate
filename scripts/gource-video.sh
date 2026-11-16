#!/usr/bin/env bash
# Renders gource/dj-crate.mp4 (1080p, 60fps) from this repo's history.
# Needs: gource and ffmpeg  (macOS: brew install gource ffmpeg)
set -euo pipefail
cd "$(dirname "$0")/.."

node scripts/gource-log.mjs "${1:---evenly}"

gource gource/dj-crate.log \
  --title "DJ Crate: building a Next.js app, commit by commit" \
  --seconds-per-day 3 \
  --auto-skip-seconds 1 \
  --stop-at-end \
  --file-idle-time 0 \
  --key \
  --hide date \
  --highlight-users \
  --bloom-multiplier 0.6 \
  --background-colour 12101a \
  -1920x1080 \
  --output-framerate 60 \
  --output-ppm-stream - \
| ffmpeg -y -r 60 -f image2pipe -vcodec ppm -i - \
    -vcodec libx264 -preset medium -crf 18 -pix_fmt yuv420p \
    gource/dj-crate.mp4

echo "Done: gource/dj-crate.mp4"

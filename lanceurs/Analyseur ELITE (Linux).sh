#!/bin/bash
cd "$(dirname "$0")" || exit 1
HTML="$PWD/analyseur-plagiat.html"
URL="file://$HTML"
for b in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge brave-browser; do
  if command -v "$b" >/dev/null 2>&1; then
    "$b" --app="$URL" >/dev/null 2>&1 &
    exit 0
  fi
done
xdg-open "$HTML" >/dev/null 2>&1 &

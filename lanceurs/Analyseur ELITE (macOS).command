#!/bin/bash
cd "$(dirname "$0")" || exit 1
HTML="$PWD/analyseur-plagiat.html"
if [ -d "/Applications/Google Chrome.app" ]; then
  open -na "Google Chrome" --args --app="file://$HTML"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
  open -na "Microsoft Edge" --args --app="file://$HTML"
else
  open "$HTML"
fi

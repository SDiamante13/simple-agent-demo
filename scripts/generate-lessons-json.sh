#!/usr/bin/env bash
#
# Generate lessons.json from lessons-source/*/COMMIT_MSG.
#
# Folder name `NN-foo-bar` → tag `lesson-N-foo-bar`.
# COMMIT_MSG line 1 (`Lesson N: <title>`) → title.
# First non-blank line of body → blurb (truncated to 70 chars).
#
# Writes lessons.json at the repo root.

set -euo pipefail

readonly REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly SOURCE_DIR="$REPO_DIR/lessons-source"
readonly OUT="$REPO_DIR/lessons.json"

[ -d "$SOURCE_DIR" ] || { echo "!! missing $SOURCE_DIR" >&2; exit 1; }

extract_title() {
  # Line 1: "Lesson N: <title>" -> "<title>"
  head -n 1 "$1" | sed -E 's/^Lesson [0-9]+:[[:space:]]*//'
}

extract_blurb() {
  # First non-blank line after line 1, truncated to 70 chars.
  awk 'NR>1 && NF { print; exit }' "$1" | cut -c 1-70
}

json_escape() {
  python3 -c 'import json,sys; sys.stdout.write(json.dumps(sys.stdin.read().rstrip()))'
}

generate() {
  local first=1
  printf '[\n'
  local dir name num slug tag title blurb
  for dir in "$SOURCE_DIR"/[0-9][0-9]-*/; do
    name="$(basename "$dir")"
    num="${name%%-*}"
    slug="${name#*-}"
    tag="lesson-$((10#$num))-$slug"
    [ -f "$dir/COMMIT_MSG" ] || { echo "!! missing $dir/COMMIT_MSG" >&2; exit 1; }
    title="$(extract_title "$dir/COMMIT_MSG")"
    blurb="$(extract_blurb "$dir/COMMIT_MSG")"
    if [ $first -eq 0 ]; then printf ',\n'; fi
    first=0
    printf '  { "tag": "%s", "title": %s, "blurb": %s }' \
      "$tag" \
      "$(printf %s "$title" | json_escape)" \
      "$(printf %s "$blurb" | json_escape)"
  done
  printf '\n]\n'
}

generate > "$OUT"
echo "✓ wrote $OUT"

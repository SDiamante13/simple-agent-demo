#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

TAGS=(
  lesson-1-agentic-loop
  lesson-2-conversation-history
  lesson-3-date-tool
  lesson-4-observability
  lesson-5-external-api
  lesson-6-system-prompt
  lesson-7-quote-tool
  lesson-8-parallel-tools
  lesson-9-mcp
  lesson-10-evals
)

OUT_HTML=/tmp/diff-html
OUT_IMG=diff-images
mkdir -p "$OUT_HTML" "$OUT_IMG"

# L9→L10 has a huge snapshot dir; filter to real lesson content
filter_paths_for_pair() {
  local a=$1 b=$2
  if [[ "$a" == "lesson-9-mcp" && "$b" == "lesson-10-evals" ]]; then
    echo "promptfoo/ src/ :!**/package-lock.json :!**/lessons-source/**"
  else
    echo ""
  fi
}

manifest=/tmp/diff-html/manifest.txt
: > "$manifest"

for ((i=0; i<${#TAGS[@]}-1; i++)); do
  a=${TAGS[$i]}
  b=${TAGS[$i+1]}
  pair="L$((i+1))-to-L$((i+2))"
  paths=$(filter_paths_for_pair "$a" "$b")

  mkdir -p "$OUT_HTML/$pair" "$OUT_IMG/$pair"

  # shellcheck disable=SC2086
  files=$(rtk proxy git diff --name-only "$a" "$b" -- $paths)

  while IFS= read -r f; do
    [ -z "$f" ] && continue
    safe=$(echo "$f" | tr '/' '_')
    diff_file="$OUT_HTML/$pair/$safe.diff"
    html_file="$OUT_HTML/$pair/$safe.html"
    png_file="$OUT_IMG/$pair/$safe.png"

    # shellcheck disable=SC2086
    rtk proxy git diff "$a" "$b" -- "$f" > "$diff_file"
    [ ! -s "$diff_file" ] && continue

    rtk proxy npx -y -p diff2html-cli diff2html -s side -i file -F "$html_file" -- "$diff_file" >/dev/null 2>&1
    rtk proxy sed -i '' 's|<h1>Diff to HTML by <a href="https://github.com/rtfpessoa">rtfpessoa</a></h1>||' "$html_file"

    echo "$pair|$safe|$html_file|$png_file" >> "$manifest"
  done <<< "$files"
done

echo "Manifest: $manifest"
wc -l "$manifest"

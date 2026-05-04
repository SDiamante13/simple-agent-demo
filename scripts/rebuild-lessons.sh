#!/usr/bin/env bash
#
# Rebuilds the lesson-1..lesson-9 git tags from snapshots in lessons-source/.
# Each snapshot is a complete file tree for that lesson; this script materializes
# them as a sequence of commits on a branch, tagging each one.
#
# Usage:
#   ./scripts/rebuild-lessons.sh                # build locally on lessons-rebuild branch
#   ./scripts/rebuild-lessons.sh --push         # force-update origin tags + drop lesson-9-streaming
#
# Idempotent: re-run any time. Destroys + re-creates the lessons-rebuild branch.

set -euo pipefail

readonly REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly SOURCE_DIR="$REPO_DIR/lessons-source"
readonly BUILD_BRANCH="lessons-rebuild"

readonly LESSON_DIRS=(
  "01-agentic-loop"
  "02-conversation-history"
  "03-date-tool"
  "04-observability"
  "05-external-api"
  "06-system-prompt"
  "07-quote-tool"
  "08-parallel-tools"
  "09-mcp"
)

readonly TAG_NAMES=(
  "lesson-1-agentic-loop"
  "lesson-2-conversation-history"
  "lesson-3-date-tool"
  "lesson-4-observability"
  "lesson-5-external-api"
  "lesson-6-system-prompt"
  "lesson-7-quote-tool"
  "lesson-8-parallel-tools"
  "lesson-9-mcp"
)

banner() { printf '\n==> %s\n' "$1"; }
note()   { printf '    %s\n' "$1"; }
fail()   { printf '\n!! %s\n' "$1" >&2; exit 1; }

require_clean_tree() {
  if ! git -C "$REPO_DIR" diff-index --quiet HEAD --; then
    fail "Working tree is dirty. Commit or stash before rebuilding."
  fi
}

# The lesson-relevant top-level files we wipe between lessons. Anything not
# listed here (e.g. node_modules, .git, lessons-source itself, scripts/) is
# preserved across snapshot applications.
readonly LESSON_FILES=(
  "src"
  "prompt.md"
  "package.json"
  "package-lock.json"
  ".env.example"
  ".gitignore"
  "tsconfig.json"
  "CLAUDE.md"
)

wipe_lesson_files() {
  local f
  for f in "${LESSON_FILES[@]}"; do
    rm -rf "$REPO_DIR/$f"
  done
}

apply_snapshot() {
  local snapshot_dir="$1"
  # cp -R "$snapshot_dir/." "$REPO_DIR/" preserves dotfiles and dirs.
  cp -R "$snapshot_dir/." "$REPO_DIR/"
}

reset_to_empty_root() {
  # Switch to a fresh branch with no parent commit so each lesson sequence
  # starts from a known clean state. This isolates the rebuild from main.
  git -C "$REPO_DIR" checkout --orphan "$BUILD_BRANCH"
  git -C "$REPO_DIR" rm -rf --quiet --cached . 2>/dev/null || true
  # Now the index is empty but the working tree still has main's files.
  # Wipe lesson files; leave lessons-source/, scripts/, .git/, node_modules/ alone.
  wipe_lesson_files
}

build_one_lesson() {
  local lesson_dir="$1" tag="$2"
  local snapshot="$SOURCE_DIR/$lesson_dir/snapshot"
  local commit_msg="$SOURCE_DIR/$lesson_dir/COMMIT_MSG"
  banner "Building $tag from $lesson_dir"

  [ -d "$snapshot" ]    || fail "missing snapshot: $snapshot"
  [ -f "$commit_msg" ]  || fail "missing COMMIT_MSG: $commit_msg"

  wipe_lesson_files
  apply_snapshot "$snapshot"
  ( cd "$REPO_DIR" && npm install --silent --no-audit --no-fund >/dev/null 2>&1 ) \
    || fail "npm install failed for $tag"

  # -A captures deletions inside the listed paths (in case a future lesson
  # removes a file). Filter to existing paths only — `git add` aborts the
  # entire command on a single missing pathspec (e.g. prompt.md before lesson 6).
  local present=()
  local f
  for f in "${LESSON_FILES[@]}"; do
    [ -e "$REPO_DIR/$f" ] && present+=("$f")
  done
  git -C "$REPO_DIR" add -A -- "${present[@]}"
  git -C "$REPO_DIR" commit --quiet -F "$commit_msg"
  git -C "$REPO_DIR" tag -f "$tag"
  note "✓ tagged $tag"
}

build_all_lessons() {
  local i
  for i in "${!LESSON_DIRS[@]}"; do
    build_one_lesson "${LESSON_DIRS[$i]}" "${TAG_NAMES[$i]}"
  done
}

push_tags() {
  banner "Force-updating tags on origin"
  local tag
  for tag in "${TAG_NAMES[@]}"; do
    note "Pushing $tag"
    # Plain --force: --force-with-lease doesn't track tag refs and
    # falsely rejects every locally-recreated tag.
    git -C "$REPO_DIR" push --force origin "$tag"
  done
  banner "Deleting obsolete tags from origin"
  for tag in lesson-2-tools lesson-3-observability lesson-4-external-api \
             lesson-5-system-prompt lesson-6-quote-tool lesson-7-parallel-tools \
             lesson-8-mcp lesson-9-streaming; do
    if git ls-remote --tags origin | grep -q "refs/tags/$tag$"; then
      note "Deleting origin tag: $tag"
      git -C "$REPO_DIR" push origin ":refs/tags/$tag" || note "  (delete failed, continuing)"
    fi
  done
}

main() {
  require_clean_tree

  banner "Resetting to empty root on $BUILD_BRANCH"
  git -C "$REPO_DIR" branch -D "$BUILD_BRANCH" 2>/dev/null || true
  reset_to_empty_root

  build_all_lessons

  banner "Rebuild complete"
  note "Branch:  $BUILD_BRANCH"
  note "Tags:    ${TAG_NAMES[*]}"
  note "Inspect: git log --oneline $BUILD_BRANCH"
  note "Push:    ./scripts/rebuild-lessons.sh --push"

  if [ "${1:-}" = "--push" ]; then
    push_tags
  fi
}

main "${1:-}"

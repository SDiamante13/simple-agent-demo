#!/usr/bin/env bash
#
# Workshop setup. Walks an attendee from "fresh clone" to "ready for lesson 1".
# Idempotent: re-running skips anything already done.
#
# Each step prints what it's about to do before doing it, so an attendee
# can follow along or run the step by hand if it fails.

set -euo pipefail

readonly REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly ENV_FILE="$REPO_DIR/.env"
readonly ENV_EXAMPLE="$REPO_DIR/.env.example"
readonly PLACEHOLDER="your_api_key_here"
readonly REQUIRED_NODE_MAJOR=22
readonly STARTING_TAG="lesson-1-agentic-loop"
readonly OLLAMA_MODEL="qwen2.5:3b"
readonly OLLAMA_BASE_URL="http://localhost:11434/v1"

banner() {
  printf '\n==> %s\n' "$1"
}

note() {
  printf '    %s\n' "$1"
}

fail() {
  printf '\n!! %s\n' "$1" >&2
  exit 1
}

open_url() {
  # Best-effort. We always print the URL too — attendees on headless
  # boxes or with no default browser still get the link.
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 || true
  fi
}

env_has_real_value() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null || true)"
  [ -n "$line" ] && [ "$line" != "${key}=" ] && [ "$line" != "${key}=${PLACEHOLDER}" ]
}

# Atomic: write to a tempfile and mv into place so a Ctrl-C mid-write
# can never leave a half-written .env behind.
write_env_var() {
  local key="$1" value="$2"
  local tmp="${ENV_FILE}.tmp"
  grep -v -E "^${key}=" "$ENV_FILE" > "$tmp" || true
  printf '%s=%s\n' "$key" "$value" >> "$tmp"
  mv "$tmp" "$ENV_FILE"
}

check_node_version() {
  banner "Step 1: Check Node.js >= ${REQUIRED_NODE_MAJOR}"
  if ! command -v node >/dev/null 2>&1; then
    note "Install Node ${REQUIRED_NODE_MAJOR}+ via:  brew install node   (or use nvm)"
    fail "node not found on PATH"
  fi
  local version major
  version="$(node --version)"  # e.g. v22.5.0
  major="$(printf '%s' "$version" | sed -E 's/^v([0-9]+)\..*/\1/')"
  if [ "$major" -lt "$REQUIRED_NODE_MAJOR" ]; then
    note "Found $version. Need >= v${REQUIRED_NODE_MAJOR}."
    note "Upgrade:  brew upgrade node   (or:  nvm install ${REQUIRED_NODE_MAJOR} && nvm use ${REQUIRED_NODE_MAJOR})"
    fail "Node version too old"
  fi
  note "✓ $version"
}

install_dependencies() {
  banner "Step 2: Install npm dependencies"
  local stamp="$REPO_DIR/node_modules/.package-lock.json"
  if [ -d "$REPO_DIR/node_modules" ] && [ -f "$stamp" ] && [ "$stamp" -nt "$REPO_DIR/package-lock.json" ]; then
    note "✓ node_modules up to date, skipping"
    return
  fi
  note "Running: npm install"
  (cd "$REPO_DIR" && npm install)
}

ensure_env_file() {
  banner "Step 3: Ensure .env exists"
  if [ -f "$ENV_FILE" ]; then
    note "✓ $ENV_FILE already exists"
    return
  fi
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  note "Created $ENV_FILE from .env.example"
}

validate_openai() {
  local key="$1"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' \
    -H "Authorization: Bearer $key" \
    https://api.openai.com/v1/models)"
  [ "$code" = "200" ]
}

validate_giphy() {
  local key="$1"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' \
    "https://api.giphy.com/v1/gifs/search?api_key=${key}&q=test&limit=1")"
  [ "$code" = "200" ]
}

validate_tavily() {
  local key="$1"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' \
    -X POST -H 'Content-Type: application/json' \
    -d "{\"api_key\":\"${key}\",\"query\":\"test\"}" \
    https://api.tavily.com/search)"
  [ "$code" = "200" ]
}

read_secret() {
  local prompt="$1"
  local value
  printf '    %s' "$prompt"
  read -rs value
  printf '\n'
  printf '%s' "$value" | tr -d '[:space:]'
}

prompt_for_key() {
  local key="$1" url="$2" label="$3" lesson="$4" validator="$5" extra_note="${6:-}"
  banner "Step: $label ($key)"
  if env_has_real_value "$key"; then
    note "✓ found in .env, skipping"
    return
  fi
  note "Used by: $lesson"
  [ -n "$extra_note" ] && note "$extra_note"
  note "Sign up / get key here: $url"
  open_url "$url"
  local attempt
  for attempt in 1 2 3; do
    local key_value
    key_value="$(read_secret "Paste your $key and press Enter: ")"
    if [ -z "$key_value" ]; then
      note "Empty input — try again."
      continue
    fi
    note "Validating against the API..."
    if "$validator" "$key_value"; then
      write_env_var "$key" "$key_value"
      note "✓ key works, written to .env"
      return
    fi
    note "Key didn't validate (attempt ${attempt}/3)."
  done
  fail "Could not validate $key after 3 attempts. Add it to $ENV_FILE manually and re-run."
}

choose_llm_provider() {
  banner "Step 4: Choose your LLM provider"
  if env_has_real_value OPENAI_BASE_URL; then
    note "✓ OPENAI_BASE_URL already set in .env — using local Ollama"
    LLM_PROVIDER="ollama"
    return
  fi
  if env_has_real_value OPENAI_API_KEY; then
    note "✓ OPENAI_API_KEY already set in .env — using OpenAI"
    LLM_PROVIDER="openai"
    return
  fi
  note "1) OpenAI gpt-4o-mini  (paid, requires API key + ~\$5 credit)"
  note "2) Ollama ${OLLAMA_MODEL}  (free, runs locally, ~1.9GB download)"
  local choice
  while true; do
    printf '    Pick 1 or 2: '
    read -r choice
    case "$choice" in
      1) LLM_PROVIDER="openai"; return ;;
      2) LLM_PROVIDER="ollama"; return ;;
      *) note "Please enter 1 or 2." ;;
    esac
  done
}

setup_ollama() {
  banner "Step: Install + prepare Ollama (${OLLAMA_MODEL})"
  if ! command -v ollama >/dev/null 2>&1; then
    note "ollama not found on PATH."
    note "Install from: https://ollama.com/download"
    note "macOS:  brew install ollama   (then: brew services start ollama)"
    fail "ollama missing — install it and re-run setup.sh"
  fi
  if ! curl -sf "${OLLAMA_BASE_URL%/v1}/api/version" >/dev/null 2>&1; then
    note "Ollama daemon not responding at ${OLLAMA_BASE_URL%/v1}."
    note "Start it with:  ollama serve   (or: brew services start ollama)"
    fail "ollama daemon not running"
  fi
  if ollama list 2>/dev/null | awk '{print $1}' | grep -qx "$OLLAMA_MODEL"; then
    note "✓ ${OLLAMA_MODEL} already pulled"
  else
    note "Pulling ${OLLAMA_MODEL} (~1.9GB, one-time)..."
    ollama pull "$OLLAMA_MODEL"
  fi
  write_env_var OPENAI_BASE_URL "$OLLAMA_BASE_URL"
  write_env_var MODEL "$OLLAMA_MODEL"
  write_env_var OPENAI_API_KEY "ollama"
  note "✓ .env configured for local Ollama"
}

collect_keys() {
  if [ "$LLM_PROVIDER" = "ollama" ]; then
    setup_ollama
  else
    prompt_for_key OPENAI_API_KEY \
      "https://platform.openai.com/api-keys" \
      "OpenAI API key" \
      "lesson 1+ (the LLM that powers the agent)" \
      validate_openai \
      "Heads up: OpenAI requires a payment method and ~\$5 of credit before gpt-4o-mini will work."
  fi

  prompt_for_key GIPHY_API_KEY \
    "https://developers.giphy.com/dashboard/" \
    "Giphy API key" \
    "lesson 4+ (gif search tool)" \
    validate_giphy

  prompt_for_key TAVILY_API_KEY \
    "https://app.tavily.com/" \
    "Tavily API key" \
    "lesson 8 (MCP web search)" \
    validate_tavily
}

checkout_starting_lesson() {
  banner "Step 7: Check out $STARTING_TAG"
  local current
  current="$(cd "$REPO_DIR" && git rev-parse --abbrev-ref HEAD)"
  if [ "$current" = "HEAD" ] && (cd "$REPO_DIR" && git describe --tags --exact-match 2>/dev/null | grep -qx "$STARTING_TAG"); then
    note "✓ already on $STARTING_TAG"
    return
  fi
  if ! (cd "$REPO_DIR" && git diff-index --quiet HEAD --); then
    note "Working tree is dirty — leaving you on '$current'."
    note "When ready:  git stash && git checkout $STARTING_TAG"
    return
  fi
  (cd "$REPO_DIR" && git checkout "$STARTING_TAG")
  note "✓ on $STARTING_TAG"
}

print_next_steps() {
  banner "Setup complete"
  note "Start lesson 1:   npm start"
  note "List lessons:     git tag -l 'lesson-*'"
  note "Next lesson:      git checkout <tag>"
}

main() {
  check_node_version
  install_dependencies
  ensure_env_file
  choose_llm_provider
  collect_keys
  checkout_starting_lesson
  print_next_steps
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  main "$@"
fi

#!/usr/bin/env bash
# YZI Execution Harness Lite v0.1 — PreToolUse hook
# Blocks creation of long .md documents outside the evidence path, to keep
# documentation short by default. Deterministic line-count check only.

set -uo pipefail

MAX_LINES=120
EVIDENCE_PATH_MARKER="docs/specs/implementation/evidence"

INPUT="$(cat)"

FILE_PATH="$(echo "$INPUT" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n1 | sed -E 's/.*:[[:space:]]*"(.*)"/\1/')"

case "$FILE_PATH" in
  *.md) ;;
  *) exit 0 ;;
esac

case "$FILE_PATH" in
  *"$EVIDENCE_PATH_MARKER"*)
    exit 0
    ;;
esac

CONTENT="$(echo "$INPUT" | grep -oE '"content"[[:space:]]*:[[:space:]]*".*' | head -n1 || true)"
LINE_COUNT="$(printf '%s' "$CONTENT" | grep -o '\\n' | wc -l || true)"
LINE_COUNT="${LINE_COUNT:-0}"

if [ "$LINE_COUNT" -gt "$MAX_LINES" ]; then
  echo "BLOCKED by warn-long-doc.sh: new .md file '$FILE_PATH' has ~$LINE_COUNT lines (limit: $MAX_LINES outside $EVIDENCE_PATH_MARKER)." >&2
  echo "YZI OS rule: avoid long documentation. Use a short evidence record under $EVIDENCE_PATH_MARKER instead, or get explicit human authorization for this specific long document." >&2
  exit 2
fi

exit 0

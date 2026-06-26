#!/usr/bin/env bash
# YZI Execution Harness Lite v0.1 — PreToolUse hook
# Warns (non-blocking) when an Edit/Write/MultiEdit targets a file outside
# the paths authorized for this harness task: .claude/ and docs/.
# Read-only operations are never affected. Deterministic grep only.

set -euo pipefail

INPUT="$(cat)"

FILE_PATH="$(echo "$INPUT" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n1 | sed -E 's/.*:[[:space:]]*"(.*)"/\1/')"

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

case "$FILE_PATH" in
  *".claude/"*|*".claude\\"*|*"/docs/"*|*"\\docs\\"*)
    exit 0
    ;;
  *)
    echo "WARNING by warn-out-of-path.sh: writing outside the paths authorized for this harness task (.claude/, docs/): $FILE_PATH" >&2
    echo "This is a non-blocking advisory. Confirm this edit is in scope for the current task before proceeding." >&2
    exit 0
    ;;
esac

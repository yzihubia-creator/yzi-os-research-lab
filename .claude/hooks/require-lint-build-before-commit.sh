#!/usr/bin/env bash
# YZI Execution Harness Lite v0.1 — PreToolUse hook
# Blocks `git commit` until `npm run lint` and `npm run build` pass in
# platform/. Runs them synchronously here — deterministic, no LLM, no MCP.

set -uo pipefail

INPUT="$(cat)"

if ! echo "$INPUT" | grep -qE 'git[[:space:]]+commit'; then
  exit 0
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLATFORM_DIR="$REPO_ROOT/platform"

if [ ! -f "$PLATFORM_DIR/package.json" ]; then
  echo "BLOCKED by require-lint-build-before-commit.sh: no platform/package.json found, cannot validate lint/build." >&2
  echo "Run lint/build manually in the correct app directory before committing, or get explicit human authorization to bypass." >&2
  exit 2
fi

cd "$PLATFORM_DIR"

if ! npm run lint > /tmp/yzi_hook_lint.log 2>&1; then
  echo "BLOCKED by require-lint-build-before-commit.sh: 'npm run lint' failed in platform/." >&2
  tail -n 40 /tmp/yzi_hook_lint.log >&2
  exit 2
fi

if ! npm run build > /tmp/yzi_hook_build.log 2>&1; then
  echo "BLOCKED by require-lint-build-before-commit.sh: 'npm run build' failed in platform/." >&2
  tail -n 40 /tmp/yzi_hook_build.log >&2
  exit 2
fi

exit 0

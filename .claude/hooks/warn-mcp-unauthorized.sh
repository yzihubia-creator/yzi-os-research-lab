#!/usr/bin/env bash
# YZI Execution Harness Lite v0.1 — PreToolUse hook
# Blocks MCP tool calls / MCP config edits unless an explicit per-task
# authorization flag file exists. Deterministic grep only.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ALLOW_FLAG="$REPO_ROOT/.claude/ALLOW_MCP_FOR_THIS_TASK"

if [ -f "$ALLOW_FLAG" ]; then
  exit 0
fi

INPUT="$(cat)"

PATTERN='mcp__|"mcp"|mcp-config|model context protocol|\.mcp\.json'

if echo "$INPUT" | grep -qiE "$PATTERN"; then
  echo "BLOCKED by warn-mcp-unauthorized.sh: MCP usage is not authorized by default in YZI OS." >&2
  echo "If this task explicitly authorizes MCP, create the flag file '.claude/ALLOW_MCP_FOR_THIS_TASK' (manually, by a human) and retry." >&2
  exit 2
fi

exit 0

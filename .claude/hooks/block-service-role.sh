#!/usr/bin/env bash
# YZI Execution Harness Lite v0.1 — PreToolUse hook
# Blocks any Bash/Edit/Write/MultiEdit call that references service_role credentials.
# Deterministic grep only. No LLM, no MCP, no network.

set -euo pipefail

INPUT="$(cat)"

PATTERN='service_role|SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY'

if echo "$INPUT" | grep -qiE "$PATTERN"; then
  echo "BLOCKED by block-service-role.sh: detected reference to service_role / SUPABASE_SERVICE_ROLE_KEY." >&2
  echo "YZI OS rule: no service_role usage. If this is a false positive (e.g. documentation explicitly prohibiting it), rephrase to avoid the literal token and retry, or get explicit human authorization to bypass this hook for this one action." >&2
  exit 2
fi

exit 0

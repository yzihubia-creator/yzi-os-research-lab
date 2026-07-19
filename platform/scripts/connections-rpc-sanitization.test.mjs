import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const MIGRATION_SQL = readFileSync(
  "../supabase/migrations/20260719003000_yzi_imob_connections_whatsapp_sanitized_assets_v1.sql",
  "utf8",
);
const ACCESS_FIX_SQL = readFileSync(
  "../supabase/migrations/20260719004500_yzi_imob_connections_rpc_access_fix_v1.sql",
  "utf8",
);

test("connections RPC returns WhatsApp assets with sanitized metadata allowlists", () => {
  assert.match(MIGRATION_SQL, /create or replace function public\.get_yzi_imob_tenant_connections/);
  assert.match(MIGRATION_SQL, /'whatsapp_business_account'/);
  assert.match(MIGRATION_SQL, /'whatsapp_phone_number'/);
  assert.match(MIGRATION_SQL, /'verified_name'/);
  assert.match(MIGRATION_SQL, /'code_verification_status'/);
  assert.match(MIGRATION_SQL, /'platform_type'/);
  assert.match(MIGRATION_SQL, /'discovery_complete'/);
  assert.match(MIGRATION_SQL, /'graph_confirmed'/);
});

test("connections RPC omits technical WhatsApp IDs and secret-shaped fields from asset projection", () => {
  assert.match(MIGRATION_SQL, /when a\.kind in \('whatsapp_business_account', 'waba', 'whatsapp_phone_number'\) then null/);
  assert.doesNotMatch(MIGRATION_SQL, /vault_secret_id/);
  assert.doesNotMatch(MIGRATION_SQL, /access_token/);
  assert.doesNotMatch(MIGRATION_SQL, /app_secret/);
  assert.doesNotMatch(MIGRATION_SQL, /payload_min/);
  assert.doesNotMatch(MIGRATION_SQL, /parent_waba_id/);
});

test("connections RPC access fix keeps invoker grants narrow", () => {
  assert.match(ACCESS_FIX_SQL, /grant select \(\s*metadata\s*\) on public\.tenant_connection_assets to authenticated;/i);
  assert.match(ACCESS_FIX_SQL, /revoke all on function public\.get_yzi_imob_tenant_connections\(uuid\)\s*from public, anon, authenticated;/i);
  assert.match(ACCESS_FIX_SQL, /grant execute on function public\.get_yzi_imob_tenant_connections\(uuid\)\s*to authenticated;/i);
  assert.doesNotMatch(ACCESS_FIX_SQL, /to anon/i);
  assert.doesNotMatch(ACCESS_FIX_SQL, /security definer/i);
});

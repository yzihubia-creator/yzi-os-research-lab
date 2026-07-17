import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const migration = readFileSync(
  new URL("../../supabase/migrations/20260716171713_yzi_imob_meta_ads_readonly_validation_v1.sql", import.meta.url),
  "utf8",
);
const server = readFileSync(
  new URL("../src/lib/yzi-imob/connections/meta-ads-readonly-validation-server.ts", import.meta.url),
  "utf8",
);
const validation = readFileSync(
  new URL("../src/lib/yzi-imob/connections/meta-ads-readonly-validation.ts", import.meta.url),
  "utf8",
);

test("migration provisions an isolated, non-callback validation boundary", () => {
  assert.match(migration, /create role yzi_meta_ads_validation_executor\s+nologin/);
  assert.match(migration, /create role yzi_meta_ads_validation_runtime\s+login/);
  assert.match(migration, /grant yzi_meta_ads_validation_executor to yzi_meta_ads_validation_runtime/);
  assert.match(migration, /grant execute on function yzi_meta_ads_private\.bootstrap_meta_ads_readonly_connection/);
  assert.match(migration, /grant execute on function yzi_meta_ads_private\.get_meta_ads_readonly_validation_context/);
  assert.match(migration, /grant execute on function yzi_meta_ads_private\.complete_meta_ads_readonly_validation/);
  assert.match(migration, /grant execute on function yzi_meta_ads_private\.fail_meta_ads_readonly_validation/);
  assert.doesNotMatch(migration, /grant .*service_role/);
  assert.match(migration, /credential_purpose.*meta_ads_readonly/);
  assert.match(migration, /'pending_validation'/);
});

test("server adapter only permits the dedicated runtime role and fixed provider reads", () => {
  assert.match(server, /yzi_meta_ads_validation_runtime/);
  assert.doesNotMatch(server, /service_role/);
  assert.match(validation, /\/debug_token/);
  assert.match(validation, /\/me\/permissions/);
  assert.match(validation, /META_ADS_READONLY_EXTERNAL_ID/);
  assert.doesNotMatch(validation, /POST|PUT|PATCH|DELETE/);
});

test("the app id is fixed in server validation code", () => {
  assert.match(validation, /1501572615104757/);
  assert.match(validation, /META_APP_ID/);
});

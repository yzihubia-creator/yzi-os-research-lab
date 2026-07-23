import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const HELPER_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/connections/meta-whatsapp-database.ts", import.meta.url),
  "utf8",
);
const SERVER_SOURCE = readFileSync(
  new URL("../src/lib/yzi-imob/connections/meta-whatsapp-server.ts", import.meta.url),
  "utf8",
);

test("meta whatsapp database helper canonicalizes shared pooler project ref from the proven inbound runtime", () => {
  assert.match(HELPER_SOURCE, /process\.env\.META_WHATSAPP_DATABASE_URL/);
  assert.match(HELPER_SOURCE, /process\.env\.YZI_IMOB_INBOUND_OPERATIONS_DATABASE_URL/);
  assert.match(HELPER_SOURCE, /hostname\.endsWith\(SUPABASE_POOLER_SUFFIX\)/);
  assert.match(HELPER_SOURCE, /url\.username = `\$\{rolePrefix\}\.\$\{inboundProjectRef\}`/);
});

test("outbound server verifies live runtime identity after opening the connection", () => {
  assert.match(SERVER_SOURCE, /verifyExpectedRuntimeIdentity/);
  assert.match(SERVER_SOURCE, /identityVerified = true/);
  assert.match(HELPER_SOURCE, /select current_user as current_user_name, session_user as session_user_name/i);
});

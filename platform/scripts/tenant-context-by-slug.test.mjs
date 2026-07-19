import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const TENANT_CONTEXT_SOURCE = readFileSync("src/lib/tenant/tenant-context.ts", "utf8");
const TENANT_ROUTE_SOURCE = readFileSync(
  "src/app/cockpit/t/[tenantSlug]/yzi-imob/conexoes/page.tsx",
  "utf8",
);
const LEGACY_ROUTE_SOURCE = readFileSync("src/app/cockpit/yzi-imob/conexoes/page.tsx", "utf8");

test("getTenantContextBySlug keeps the existing discriminated contract", () => {
  assert.match(
    TENANT_CONTEXT_SOURCE,
    /export async function getTenantContextBySlug\(\s*slug: string\s*\): Promise<TenantContext>/,
  );
  assert.match(TENANT_CONTEXT_SOURCE, /return \{ status: "no_session" \}/);
  assert.match(TENANT_CONTEXT_SOURCE, /return \{\s*status: "tenant_found"/);
  assert.match(TENANT_CONTEXT_SOURCE, /return \{ status: "no_membership"/);
  assert.match(TENANT_CONTEXT_SOURCE, /return \{ status: "error"/);
});

test("slug is validated before tenant or membership lookup", () => {
  const fnIndex = TENANT_CONTEXT_SOURCE.indexOf("getTenantContextBySlug");
  const validationIndex = TENANT_CONTEXT_SOURCE.indexOf("TENANT_SLUG_RE.test(slug)", fnIndex);
  const tenantLookupIndex = TENANT_CONTEXT_SOURCE.indexOf('.from("tenants")', fnIndex);
  assert.ok(validationIndex > fnIndex, "missing strict slug validation");
  assert.ok(tenantLookupIndex > validationIndex, "tenant lookup must happen after slug validation");
  assert.match(TENANT_CONTEXT_SOURCE, /const TENANT_SLUG_RE = \/\^\[a-z0-9\]/);
});

test("active requested tenant and active membership are both required", () => {
  assert.match(
    TENANT_CONTEXT_SOURCE,
    /\.from\("tenants"\)[\s\S]+\.eq\("slug", slug\)[\s\S]+\.eq\("status", "active"\)/,
  );
  assert.match(
    TENANT_CONTEXT_SOURCE,
    /\.from\("tenant_memberships"\)[\s\S]+\.eq\("tenant_id", id\)[\s\S]+\.eq\("user_id", user\.id\)[\s\S]+\.eq\("status", "active"\)/,
  );
});

test("multiple memberships resolve the requested tenant instead of implicit order", () => {
  const fnBody = TENANT_CONTEXT_SOURCE.slice(TENANT_CONTEXT_SOURCE.indexOf("getTenantContextBySlug"));
  assert.match(fnBody, /\.eq\("tenant_id", id\)/);
  assert.doesNotMatch(fnBody, /\.order\("created_at"/);
  assert.doesNotMatch(fnBody, /\.limit\(1\)/);
});

test("expected fail-closed cases are represented without condition leakage", () => {
  assert.match(TENANT_CONTEXT_SOURCE, /if \(!tenant\) \{[\s\S]+status: "no_membership"/);
  assert.match(TENANT_CONTEXT_SOURCE, /if \(!membership\) \{[\s\S]+status: "no_membership"/);
  assert.match(TENANT_CONTEXT_SOURCE, /if \(!TENANT_SLUG_RE\.test\(slug\)\) \{[\s\S]+status: "no_membership"/);
});

test("absence of session is handled before slug resolution", () => {
  const fnIndex = TENANT_CONTEXT_SOURCE.indexOf("getTenantContextBySlug");
  const userIndex = TENANT_CONTEXT_SOURCE.indexOf("const user = await getSessionUser();", fnIndex);
  const slugIndex = TENANT_CONTEXT_SOURCE.indexOf("TENANT_SLUG_RE.test(slug)", fnIndex);
  assert.ok(userIndex > fnIndex);
  assert.ok(userIndex < slugIndex);
});

test("tenant route reuses the existing connections RPC, parser, and workspace", () => {
  assert.match(TENANT_ROUTE_SOURCE, /getTenantContextBySlug\(tenantSlug\)/);
  assert.match(TENANT_ROUTE_SOURCE, /get_yzi_imob_tenant_connections/);
  assert.match(TENANT_ROUTE_SOURCE, /buildConnectionsCatalogFromRpcPayload/);
  assert.match(TENANT_ROUTE_SOURCE, /YziImobConnectionsWorkspace/);
});

test("tenant route has sanitized treatment for session, access denied, and internal errors", () => {
  assert.match(TENANT_ROUTE_SOURCE, /redirect\("\/login"\)/);
  assert.match(TENANT_ROUTE_SOURCE, /tenantContext\.status === "no_membership"/);
  assert.match(TENANT_ROUTE_SOURCE, /Acesso não disponível/);
  assert.match(TENANT_ROUTE_SOURCE, /tenantContext\.status === "error"/);
  assert.match(TENANT_ROUTE_SOURCE, /Conexões indisponíveis/);
});

test("legacy route remains independent from explicit tenant slug", () => {
  assert.match(LEGACY_ROUTE_SOURCE, /getTenantContext\(\)/);
  assert.doesNotMatch(LEGACY_ROUTE_SOURCE, /getTenantContextBySlug|tenantSlug|\[tenantSlug\]/);
});

test("implementation has no service role usage or hardcoded tenant ids", () => {
  const combined = `${TENANT_CONTEXT_SOURCE}\n${TENANT_ROUTE_SOURCE}`;
  const serviceRoleEnv = ["SUPABASE", "SERVICE", "ROLE", "KEY"].join("_");
  const serviceRoleSnake = ["service", "role"].join("_");
  assert.equal(combined.includes(serviceRoleEnv), false);
  assert.equal(combined.includes(serviceRoleSnake), false);
  assert.doesNotMatch(
    combined,
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
  );
});

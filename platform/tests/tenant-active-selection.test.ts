import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { selectActiveTenantMembership } from "../src/lib/tenant/active-tenant.ts";

const OCM = { tenant_id: "tenant-ocm", role: "owner" };
const HORIZONTE = { tenant_id: "tenant-horizonte", role: "admin" };

test("uma única membership ativa é resolvida automaticamente", () => {
  assert.deepEqual(selectActiveTenantMembership([HORIZONTE], null), {
    status: "selected",
    membership: HORIZONTE,
  });
});

test("a seleção explícita resolve uma membership válida entre várias", () => {
  assert.deepEqual(
    selectActiveTenantMembership([OCM, HORIZONTE], HORIZONTE.tenant_id),
    { status: "selected", membership: HORIZONTE },
  );
});

test("múltiplas memberships sem seleção explícita falham fechadas", () => {
  assert.deepEqual(selectActiveTenantMembership([OCM, HORIZONTE], null), {
    status: "selection_required",
  });
});

test("tenant selecionado fora das memberships nunca é aceito", () => {
  assert.deepEqual(
    selectActiveTenantMembership([OCM, HORIZONTE], "tenant-sem-membership"),
    { status: "selection_required" },
  );
});

test("ausência de membership permanece um estado vazio honesto", () => {
  assert.deepEqual(selectActiveTenantMembership([], null), {
    status: "no_membership",
  });
});

test("preferência obsoleta não impede o fallback seguro de membership única", () => {
  assert.deepEqual(
    selectActiveTenantMembership([HORIZONTE], "tenant-antigo"),
    { status: "selected", membership: HORIZONTE },
  );
});

test("resolver implícito não usa limit(1) nem ordenação acidental", () => {
  const source = readFileSync("src/lib/tenant/tenant-context.ts", "utf8");
  const implicitResolver = source.slice(
    source.indexOf("export async function getTenantContext()"),
    source.indexOf("export async function getTenantContextBySlug"),
  );

  assert.doesNotMatch(implicitResolver, /\.limit\(1\)/);
  assert.doesNotMatch(implicitResolver, /\.order\(/);
  assert.match(implicitResolver, /\.eq\("status", "active"\)/);
  assert.match(implicitResolver, /ACTIVE_TENANT_COOKIE/);
});

test("endpoint de seleção revalida slug e membership antes do cookie", () => {
  const source = readFileSync(
    "src/app/cockpit/t/[tenantSlug]/route.ts",
    "utf8",
  );
  const validationIndex = source.indexOf("getTenantContextBySlug(tenantSlug)");
  const cookieIndex = source.indexOf("response.cookies.set(");

  assert.ok(validationIndex > -1);
  assert.ok(cookieIndex > validationIndex);
  assert.match(source, /tenantContext\.status === "no_membership"/);
  assert.match(source, /status: 403/);
  assert.doesNotMatch(source, /service_role|SUPABASE_SECRET_KEY/i);
  assert.doesNotMatch(source, /export async function GET/);
});

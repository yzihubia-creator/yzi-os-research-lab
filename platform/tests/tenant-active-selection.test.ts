import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  getRequiredTenantSelectionOptions,
  listActiveTenantSelectionOptions,
  selectActiveTenantMembership,
} from "../src/lib/tenant/active-tenant.ts";

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

test("tenant inativo não é exposto como opção de acesso", () => {
  const options = listActiveTenantSelectionOptions([OCM, HORIZONTE], [
    {
      id: OCM.tenant_id,
      slug: "ocm-negocios-imobiliarios-ltda",
      name: "OCM NEGÓCIOS IMOBILIÁRIOS LTDA",
    },
  ]);

  assert.deepEqual(options, [
    {
      slug: "ocm-negocios-imobiliarios-ltda",
      name: "OCM NEGÓCIOS IMOBILIÁRIOS LTDA",
    },
  ]);
});

test("tenant sem membership nunca é exposto pelo seletor", () => {
  const options = listActiveTenantSelectionOptions([OCM], [
    {
      id: "tenant-sem-membership",
      slug: "operacao-indevida",
      name: "Operação indevida",
    },
  ]);

  assert.deepEqual(options, []);
});

test("cookie válido entre várias operações não exige nova escolha", () => {
  const activeTenants = [
    { id: OCM.tenant_id, slug: "ocm", name: "OCM" },
    { id: HORIZONTE.tenant_id, slug: "horizonte", name: "Horizonte" },
  ];

  assert.equal(
    getRequiredTenantSelectionOptions(
      [OCM, HORIZONTE],
      activeTenants,
      OCM.tenant_id,
    ),
    null,
  );
});

test("cookie de tenant inativo oferece somente operações ativas", () => {
  const options = getRequiredTenantSelectionOptions(
    [OCM, HORIZONTE],
    [{ id: OCM.tenant_id, slug: "ocm", name: "OCM" }],
    HORIZONTE.tenant_id,
  );

  assert.deepEqual(options, [{ slug: "ocm", name: "OCM" }]);
});

test("múltiplas operações sem cookie exigem escolha explícita", () => {
  const activeTenants = [
    { id: OCM.tenant_id, slug: "ocm", name: "OCM" },
    { id: HORIZONTE.tenant_id, slug: "horizonte", name: "Horizonte" },
  ];

  assert.deepEqual(
    getRequiredTenantSelectionOptions([OCM, HORIZONTE], activeTenants, null),
    [
      { slug: "horizonte", name: "Horizonte" },
      { slug: "ocm", name: "OCM" },
    ],
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

test("layout intercepta somente o estado que exige escolha explícita", () => {
  const source = readFileSync("src/app/cockpit/layout.tsx", "utf8");

  assert.match(source, /getTenantSelectionState\(\)/);
  assert.match(source, /tenantSelection\.status === "selection_required"/);
  assert.match(source, /<YziOperationSelector operations=/);
});

test("seletor usa o POST protegido e preserva exatamente a rota atual", () => {
  const source = readFileSync(
    "src/components/yzi-os/yzi-operation-selector.tsx",
    "utf8",
  );

  assert.match(source, /`\/cockpit\/t\/\$\{encodeURIComponent\(operation\.slug\)\}`/);
  assert.match(source, /method: "POST"/);
  assert.match(source, /credentials: "same-origin"/);
  assert.match(source, /window\.location\.reload\(\)/);
  assert.doesNotMatch(source, /tenant_id|yzi_active_tenant_id/);
  assert.doesNotMatch(source, /router\.push|window\.location\.href\s*=/);
});

test("somente tenants ativos e visíveis viram opções de seleção", () => {
  const source = readFileSync("src/lib/tenant/tenant-context.ts", "utf8");
  const selector = source.slice(
    source.indexOf("export async function getTenantSelectionState()"),
    source.indexOf("export async function getTenantContext()"),
  );

  assert.match(selector, /\.eq\("status", "active"\)/);
  assert.match(selector, /\.select\("id, slug, name"\)/);
  assert.match(selector, /getRequiredTenantSelectionOptions/);
  assert.doesNotMatch(selector, /service_role|SUPABASE_SECRET_KEY/i);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { OfficialMetricoolDiscoveryTransport } from "../src/lib/yzi-imob/metricool/transport.ts";

const TOKEN_FIXTURE = "synthetic-token-never-persisted";

function discoveryTransport(payload: unknown) {
  return new OfficialMetricoolDiscoveryTransport({
    credentials: { apiToken: TOKEN_FIXTURE },
    fetchImpl: async (_url, init) => {
      assert.equal(new Headers(init?.headers).get("X-Mc-Auth"), TOKEN_FIXTURE);
      return Response.json(payload);
    },
  });
}

test("Metricool discovery: one account is returned as an unambiguous candidate", async () => {
  const result = await discoveryTransport([
    { id: 20001, userId: 10001, label: "OCM Negócios Imobiliários" },
  ]).discoverAccounts();
  assert.deepEqual(result, {
    status: "ok",
    value: [{
      externalUserId: "10001",
      externalBlogId: "20001",
      displayName: "OCM Negócios Imobiliários",
    }],
  });
});

test("Metricool discovery: multiple accounts remain explicit for selection", async () => {
  const result = await discoveryTransport([
    { id: 20001, userId: 10001, label: "OCM" },
    { id: 20002, userId: 10001, label: "Outra marca" },
  ]).discoverAccounts();
  assert.equal(result.status, "ok");
  assert.equal(result.status === "ok" ? result.value.length : 0, 2);
});

test("Metricool discovery: no account is represented explicitly", async () => {
  const result = await discoveryTransport([]).discoverAccounts();
  assert.deepEqual(result, { status: "ok", value: [] });
});

test("bootstrap SQL keeps credential, tenant scope, binding and validation gates separated", async () => {
  const migration = await readFile(
    new URL(
      "../../supabase/migrations/20260814144230_yzi_imob_metricool_secure_bootstrap_v1.sql",
      import.meta.url,
    ),
    "utf8",
  );
  const configureBody = section(
    migration,
    "create function public.configure_yzi_imob_metricool_credential",
    "create function yzi_imob_metricool_private.claim_yzi_imob_metricool_discoveries",
  );
  assert.match(configureBody, /vault\.create_secret/);
  assert.match(configureBody, /vault\.update_secret/);
  assert.match(configureBody, /tm\.tenant_id = p_tenant_id/);
  assert.match(configureBody, /array\['owner', 'admin'\]/);
  assert.match(configureBody, /return query select v_connection\.id, v_connection\.status/);
  assert.doesNotMatch(configureBody, /return query[^;]*(?:p_api_token|v_secret_id)/);

  const discoveryBody = section(
    migration,
    "create function yzi_imob_metricool_private.complete_yzi_imob_metricool_discovery",
    "create function public.get_yzi_imob_metricool_account_candidates",
  );
  assert.match(discoveryBody, /v_count = 0[\s\S]*v_status := 'error'/);
  assert.match(discoveryBody, /v_count = 1[\s\S]*v_status := 'pending_validation'/);
  assert.match(discoveryBody, /v_status := 'account_selection_required'/);

  const bindingBody = section(
    migration,
    "create function public.bind_yzi_imob_metricool_account",
    "create or replace function public.request_yzi_imob_metricool_validation",
  );
  assert.match(bindingBody, /c\.tenant_id=p_tenant_id/);
  assert.match(bindingBody, /status='pending_validation'/);

  const validationBody = section(
    migration,
    "create or replace function public.request_yzi_imob_metricool_validation",
    "revoke all on function public.configure_yzi_imob_metricool_credential",
  );
  assert.match(validationBody, /tc\.status='pending_validation'/);
  assert.match(validationBody, /tc\.vault_secret_id is not null/);
  assert.match(validationBody, /tc\.external_user_id is not null/);
  assert.match(validationBody, /tc\.external_blog_id is not null/);
});

function section(source: string, start: string, end: string): string {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(startIndex, -1);
  assert.notEqual(endIndex, -1);
  return source.slice(startIndex, endIndex);
}

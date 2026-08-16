import assert from "node:assert/strict";
import test from "node:test";

import { buildConnectionsViewModelFromRpcPayload } from "../src/lib/yzi-imob/connections/view-model.ts";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";

/** Espelha exatamente o que `toRegistryRow` publica para a tela. */
function registryRow(overrides: Record<string, unknown>): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    id: "20945234-863c-4d22-af9a-3e186c2dff84",
    tenant_id: TENANT_ID,
    status: "active",
    auth_state: "authorized",
    connection_state: "ready",
    health_state: "healthy",
    granted_scopes: ["openid", "email", "offline_access"],
    capability_snapshot: [],
    connected_at: now,
    validated_at: now,
    last_checked_at: now,
    expires_at: new Date(Date.now() + 86_400_000).toISOString(),
    assets: [],
    pending_publications: 0,
    recent_failures: 0,
    ...overrides,
  };
}

function itemFor(payload: unknown, id: string) {
  const viewModel = buildConnectionsViewModelFromRpcPayload(payload, TENANT_ID);
  assert.equal(viewModel.loadState, "ready");
  const item = viewModel.items.find((candidate) => candidate.id === id);
  assert.ok(item, `item ${id} ausente no view model`);
  return item;
}

test("conexão criativa autorizada, pronta e saudável é Conectado mesmo sem capability descoberta", () => {
  // Estado real observado após o OAuth Higgsfield: 86 tools listadas, nenhuma
  // classificada — o snapshot de capability fica vazio por governança.
  const item = itemFor(
    [registryRow({ provider: "higgsfield", catalog_id: "higgsfield", display_name: "Geracao criativa" })],
    "producao-criativa-complementar",
  );

  assert.equal(item.status, "Ativo");
  // Prontidão de CAPABILITY continua fechada: nada é prometido à operação.
  assert.deepEqual(item.capabilitiesDisponiveis, []);
  // Conexão saudável não pede reconfiguração.
  assert.equal(item.podeConfigurar, false);
  assert.equal(item.aguardandoVerificacaoExterna, false);
});

test("capability vazia continua bloqueando a operação, não a conexão", () => {
  const item = itemFor(
    [registryRow({ provider: "higgsfield", catalog_id: "higgsfield", display_name: "Geracao criativa" })],
    "producao-criativa-complementar",
  );

  assert.ok(
    !item.capabilitiesDisponiveis.includes("Produzir criativos"),
    "nenhuma capability paga pode aparecer disponível sem contrato de tool verificado",
  );
});

test("conexão criativa não autorizada não vira Conectado", () => {
  const item = itemFor(
    [
      registryRow({
        provider: "higgsfield",
        catalog_id: "higgsfield",
        status: "awaiting_authorization",
        auth_state: "pending",
        connection_state: "awaiting_authorization",
        health_state: "unknown",
        granted_scopes: [],
        validated_at: null,
        last_checked_at: null,
      }),
    ],
    "producao-criativa-complementar",
  );

  assert.notEqual(item.status, "Ativo");
});

test("conexão criativa degradada não vira Conectado", () => {
  const item = itemFor(
    [registryRow({ provider: "higgsfield", catalog_id: "higgsfield", health_state: "degraded" })],
    "producao-criativa-complementar",
  );

  assert.notEqual(item.status, "Ativo");
});

test("a regra de capability segue valendo para as conexões que não são criativas externas", () => {
  // Metricool preserva a semântica antiga: sem capability descoberta, a conexão
  // não é anunciada como pronta.
  const item = itemFor(
    [registryRow({ provider: "metricool", catalog_id: "metricool", display_name: "Metricool" })],
    "publicacao-social",
  );

  assert.notEqual(item.status, "Ativo");
  assert.deepEqual(item.capabilitiesDisponiveis, []);
});

test("estado de outro tenant nunca alimenta a tela", () => {
  const viewModel = buildConnectionsViewModelFromRpcPayload(
    [registryRow({ provider: "higgsfield", catalog_id: "higgsfield", tenant_id: "22222222-2222-4222-8222-222222222222" })],
    TENANT_ID,
  );

  assert.notEqual(viewModel.loadState, "ready");
});

// YZI IMOB Runtime — Policy / Governance Engine (Runtime Foundation, unidade 1).
//
// Responsabilidade ÚNICA: validar tenant boundary, presença de usuário/papel e
// a política de aprovação ANTES de montar contexto. Não monta contexto, não
// chama tool, não cria approval. Runtime Architecture §4, §8, §9.
//
// Skeleton: as regras finas (permissões por plano/módulo/conexão, RLS, RPCs
// seguras) são TODO. Aqui há apenas as verificações mínimas do boundary e da
// exigência de aprovação declarada pelo workflow.

import type {
  IntentClassification,
  PolicyCheck,
  PolicyDecision,
  RuntimeRequest,
  SelectedWorkflow,
} from "./types";

/**
 * Aplica a policy sobre a requisição e o workflow selecionado. Retorna uma
 * decisão honesta: se algo falha, `allowed=false` com `error_state` explícito.
 *
 * Ordem das verificações reflete a defesa em profundidade (Runtime Arch §8):
 * tenant → usuário → papel. TODO(runtime): validar permissões reais do papel,
 * plano, módulo e conexões via camada segura (RLS + RPCs), nunca no frontend.
 */
export function applyPolicy(
  request: RuntimeRequest,
  workflow: SelectedWorkflow,
  intent: IntentClassification,
): PolicyDecision {
  const checks: PolicyCheck[] = [];

  const tenant_ok = Boolean(request.tenant_id);
  checks.push({
    name: "tenant_boundary",
    passed: tenant_ok,
    detail: tenant_ok
      ? `tenant_id="${request.tenant_id}" presente.`
      : "tenant_id ausente — nenhum dado operacional confiável.",
  });

  const user_ok = Boolean(request.user_id);
  checks.push({
    name: "user_present",
    passed: user_ok,
    detail: user_ok
      ? `user_id="${request.user_id}" presente.`
      : "user_id ausente.",
  });

  const role_ok = Boolean(request.user_role);
  checks.push({
    name: "user_role_present",
    passed: role_ok,
    // TODO(runtime): validar que o papel autoriza os workflows disponíveis.
    detail: role_ok
      ? `user_role="${request.user_role}" declarado (autorização fina é TODO).`
      : "user_role ausente.",
  });

  // Aprovação exigida = declarada pelo workflow (Approval First). Neste workflow
  // read-only nenhum passo exige approval; ainda assim o runtime PARA no handoff.
  const approval_required = intent.approval_required;
  checks.push({
    name: "approval_policy",
    passed: true,
    detail: approval_required
      ? "workflow exige aprovação humana antes de qualquer execução."
      : "workflow read-only — nenhum passo exige aprovação (mesmo assim, PARA antes de executar).",
  });

  if (!tenant_ok) {
    return decision(false, tenant_ok, user_ok, approval_required, "tenant_missing", checks,
      "Bloqueado: tenant boundary — sem tenant_id não há operação confiável.");
  }
  if (!user_ok) {
    return decision(false, tenant_ok, user_ok, approval_required, "user_missing", checks,
      "Bloqueado: usuário ausente.");
  }
  if (!role_ok) {
    return decision(false, tenant_ok, user_ok, approval_required, "permission_denied", checks,
      "Bloqueado: papel do usuário não declarado.");
  }

  return decision(true, tenant_ok, user_ok, approval_required, null, checks,
    `Policy aprovada para ${workflow.definition.workflow_id}; execução permanece gated.`);
}

function decision(
  allowed: boolean,
  tenant_ok: boolean,
  user_ok: boolean,
  approval_required: boolean,
  error_state: PolicyDecision["error_state"],
  checks: readonly PolicyCheck[],
  reason: string,
): PolicyDecision {
  return { allowed, tenant_ok, user_ok, approval_required, error_state, reason, checks };
}

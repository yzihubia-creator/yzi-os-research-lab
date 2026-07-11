// Tipos mínimos da camada YZI OS — primeira integração frontend ↔ backend real.
//
// Estes tipos descrevem o que o cockpit consome das RPCs SEGURAS já existentes
// no Supabase (security_definer = false → executam como o caller, sob RLS):
//   - public.yzi_get_tenant_operating_context(p_tenant_id)
//   - public.yzi_create_chat_session(...)
//   - public.yzi_create_user_chat_message(...)
//   - public.yzi_create_action_request(...)
//
// Módulo PURO de tipos: sem `use client`, sem I/O, sem Supabase, sem env, sem
// service role, sem SQL. Nenhum backend novo é definido aqui — apenas a forma
// (camelCase, saneada) com que o frontend lê o snapshot/linhas retornados.

/** Flags de runtime do tenant — honestas sobre o que ainda NÃO está habilitado. */
export type YziRuntimeFlags = {
  externalExecutionEnabled: boolean;
  agentResponseEnabled: boolean;
  creditConsumptionEnabled: boolean;
  authorizationRequiredForSideEffects: boolean;
};

/**
 * Snapshot operacional do tenant, normalizado a partir do JSON retornado por
 * `yzi_get_tenant_operating_context`. Apenas os campos que o cockpit exibe.
 */
export type TenantOperatingContext = {
  tenant: { name: string };
  membership: { role: string; status: string };
  credits: {
    planKey: string;
    creditsBalance: number;
    mediaBudgetCents: number;
  };
  counts: {
    activeChatSessions: number;
    pendingActionRequests: number;
    openRecommendations: number;
    newRadarSignals: number;
  };
  runtime: YziRuntimeFlags;
};

export type TenantOperatingContextResult =
  | { status: "loaded"; context: TenantOperatingContext }
  | { status: "error"; message: string };

/** Sessão de conversa criada via `yzi_create_chat_session`. */
export type YziChatSession = {
  id: string;
  title: string;
  mode: string;
};

export type CreateChatSessionResult =
  | { status: "created"; session: YziChatSession }
  | { status: "error"; message: string };

/** Mensagem do usuário registrada via `yzi_create_user_chat_message`. */
export type YziChatMessage = {
  /** Identificador retornado pelo backend, quando disponível. */
  id: string | null;
  /** Conteúdo exibido — é o texto que o usuário escreveu e foi persistido. */
  content: string;
  /** Timestamp retornado pelo backend, quando disponível. */
  createdAt: string | null;
};

export type CreateChatMessageResult =
  | { status: "created"; message: YziChatMessage }
  | { status: "error"; message: string };

/**
 * Solicitação de ação PREPARADA via `yzi_create_action_request`. Nesta fase a
 * intenção apenas fica REGISTRADA como pendente — nenhuma execução externa,
 * consumo de crédito ou efeito colateral é disparado pelo frontend.
 */
export type YziActionRequest = {
  id: string | null;
  actionType: string;
  riskLevel: string | null;
  status: string | null;
};

export type CreateActionRequestResult =
  | { status: "prepared"; actionRequest: YziActionRequest }
  | { status: "error"; message: string };

// ── Persisted Run Slice (Unidade 3) ──────────────────────────────────────
//
// Tipos do primeiro workflow persistido de ponta a ponta: PREPARE_PROPERTY_
// CONTACT. Espelham `yzi_runs` / `yzi_run_steps` / `yzi_artifacts` / a
// extensão de `yzi_action_requests` (ver SQL pack). Escrita acontece
// exclusivamente via RPC `security_definer = false`; leitura via SELECT sob
// RLS. Nenhum dado é inventado — ausência de linha é estado honesto.

export type YziRunStatus =
  | "running"
  | "awaiting_approval"
  | "done"
  | "failed"
  | "cancelled";

export type YziRunStepStatus = "pending" | "running" | "completed" | "failed";

export type YziArtifactVisibility = "approval" | "final";

export type YziArtifactStatus = "written" | "sealed" | "superseded";

/** Decisão institucional registrada em `yzi_action_requests` (Approval Queue Spec §6/§7). */
export type YziApprovalStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "expired"
  | "cancelled";

/** Razão fechada da rejeição — mapeia o comportamento validado do Agent Lab (ajustar/reformular) sobre o enum institucional. */
export type YziDecisionReason = "adjust" | "rework";

export type YziRun = {
  id: string;
  tenantId: string;
  workflowId: string;
  status: YziRunStatus;
  cursorStep: string;
  activeAssetId: string;
  contextFingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type YziRunStep = {
  id: string;
  runId: string;
  stepKey: string;
  attempt: number;
  status: YziRunStepStatus;
  startedAt: string | null;
  completedAt: string | null;
};

export type YziArtifact = {
  id: string;
  runId: string;
  runStepId: string;
  contractKey: string;
  version: number;
  visibility: YziArtifactVisibility;
  status: YziArtifactStatus;
  content: Record<string, unknown>;
  contentHash: string;
  createdAt: string;
};

export type YziRunActionRequest = {
  id: string;
  runId: string;
  runStepId: string;
  artifactId: string;
  artifactHash: string;
  status: YziApprovalStatus;
  decisionReason: YziDecisionReason | null;
  decisionNote: string | null;
  decidedBy: string | null;
  decidedAt: string | null;
  createdAt: string;
};

/** Estado agregado de uma run — o que o cockpit precisa para renderizar tudo. */
export type YziRunState = {
  run: YziRun;
  steps: readonly YziRunStep[];
  artifacts: readonly YziArtifact[];
  actionRequests: readonly YziRunActionRequest[];
};

export type RunStateResult =
  | { status: "no_run" }
  | { status: "loaded"; state: YziRunState }
  | { status: "error"; message: string };

export type StartRunResult =
  | { status: "started"; state: YziRunState }
  | { status: "blocked"; reason: string }
  | { status: "error"; message: string };

export type DecisionResult =
  | { status: "decided"; state: YziRunState }
  | { status: "error"; message: string };

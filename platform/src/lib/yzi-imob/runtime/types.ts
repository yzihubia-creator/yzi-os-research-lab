// YZI IMOB Runtime — Contratos e Tipos (Runtime Foundation, unidade 1).
//
// Módulo PURO e declarativo: apenas TIPOS e CONTRATOS do menor Runtime
// executável possível. Nenhuma lógica de negócio, nenhuma query, nenhum banco,
// nenhuma env, nenhum service role, nenhuma tool executada, nenhum approval
// criado. Deriva fielmente do Execution Pack v0.1 (não cria nova spec):
//   - Runtime Backend Architecture v0.1 (§3, §4, §7)
//   - Intent Router + Workflow Selector Spec v0.1 (§4, §6, §7, §12)
//   - Context Builder Spec v0.1 (§4, §5, §6, §9, §10, §11, §13)
//   - Tool Registry Spec v0.1 (§4, §5)
//
// Estados honestos: todo bloqueio é explícito; nada é disfarçado de completo.

// ── Intenção ─────────────────────────────────────────────────────────────────

/**
 * Tipos de intenção — união fiel ao Intent Router Spec v0.1 §4.
 *
 * LACUNA REGISTRADA (regra de Fallback do AGENTS.md): a spec §4 não define um
 * intent de LEITURA PURA de imóvel, exigido pelo workflow
 * `READ_ONLY_PROPERTY_LOOKUP` autorizado por esta unidade. `property_lookup` é
 * um acréscimo SKELETON explícito, não uma alteração de arquitetura.
 * TODO(spec): reconciliar `property_lookup` em uma futura revisão do
 *   Intent Router Spec (read-only intents) antes de sair do skeleton.
 *
 * LACUNA REGISTRADA #2 (unidade 2 — Approval-Only Vertical Slice): a spec §4/§5
 * também não define um intent de preparo de CONTATO ancorado no IMÓVEL (apenas
 * `lead_followup_prepare`, cujo workflow §5 é "Lead Context → Follow-up Draft →
 * Approval" — ancorado no LEAD, não no imóvel). Como a tese do produto é
 * property-centered (não CRM genérico), `property_contact_prepare` é outro
 * acréscimo SKELETON explícito e honesto, análogo em forma a
 * `lead_followup_prepare` mas com o imóvel como ativo central.
 * TODO(spec): reconciliar `property_contact_prepare` com `lead_followup_prepare`
 *   em uma futura revisão do Intent Router Spec.
 *
 * LACUNA REGISTRADA #3 (Property Search v0 — 1ª capability de produto): a spec
 * §4 não define um intent de BUSCA/descoberta de imóvel a partir do critério do
 * cliente (o cliente ainda não tem um imóvel ativo; ele procura um). Como a tese
 * é property-centered, `property_search` é a intenção que abre a primeira
 * experiência de produto do YZI IMOB: matching read-only sobre o catálogo do
 * tenant, sem efeito colateral. Acréscimo SKELETON explícito e honesto.
 * TODO(spec): reconciliar `property_search` (read-only discovery intent) em uma
 *   futura revisão do Intent Router Spec.
 */
export type IntentType =
  | "property_lookup" // SKELETON/ASSUNÇÃO — reconciliar com a spec (ver acima)
  | "property_search" // SKELETON/ASSUNÇÃO #3 — 1ª capability de produto (ver abaixo)
  | "property_contact_prepare" // SKELETON/ASSUNÇÃO #2 — reconciliar com a spec (ver acima)
  | "property_register"
  | "property_update"
  | "property_publish_prepare"
  | "content_generate_prepare"
  | "ad_campaign_prepare"
  | "lead_qualify"
  | "lead_followup_prepare"
  | "visit_schedule_prepare"
  | "pipeline_update_prepare"
  | "document_prepare"
  | "commission_update_prepare"
  | "connection_setup_prepare"
  | "runtime_question"
  | "blocked_or_unknown";

// ── Workflow ─────────────────────────────────────────────────────────────────

/**
 * Identificador de workflow. Unidade 1 implementou `READ_ONLY_PROPERTY_LOOKUP`;
 * unidade 2 (Approval-Only Vertical Slice) adiciona `PREPARE_PROPERTY_CONTACT`
 * — primeiro workflow que atravessa a fronteira de aprovação (sem executar). A
 * união cresce em unidades futuras conforme os workflows do Intent Router
 * Spec §5.
 */
export type WorkflowId =
  | "READ_ONLY_PROPERTY_LOOKUP"
  | "PROPERTY_SEARCH"
  | "PREPARE_PROPERTY_CONTACT";

// ── Tools e contexto (catálogo declarativo) ──────────────────────────────────

/**
 * Tools do runtime — nomes fiéis ao Tool Registry Spec v0.1 §5. Nenhuma executa.
 * `yzi_imob_search_properties` é um acréscimo SKELETON (read-only discovery)
 * introduzido pela capability Property Search v0; alinha em forma às tools
 * `read_context` da spec (side_effect `none`).
 * TODO(spec): reconciliar `yzi_imob_search_properties` no Tool Registry Spec §5.
 */
export type RuntimeToolName =
  | "yzi_imob_get_property_context"
  | "yzi_imob_search_properties"
  | "yzi_imob_prepare_property_page"
  | "yzi_imob_prepare_ad_brief"
  | "yzi_imob_get_lead_context"
  | "yzi_imob_prepare_followup"
  | "yzi_imob_submit_for_human_approval"
  | "yzi_imob_record_learning"
  | "yzi_imob_check_connection_status";

/** Efeitos colaterais declarados por tool — Tool Registry Spec §4. */
export type SideEffect =
  | "none"
  | "draft_only"
  | "approval_queue"
  | "external_execution"
  | "memory_write";

/** Nível de risco — Tool Registry Spec §4. */
export type RiskLevel = "low" | "medium" | "high" | "critical";

/** Context Sources — Context Builder Spec §4 (origens conceituais). */
export type ContextSourceId =
  | "tenant"
  | "user"
  | "conversation"
  | "lead"
  | "crm"
  | "workflow"
  | "policies"
  | "memory"
  | "knowledge"
  | "tool_registry"
  | "approval_queue"
  | "runtime"
  | "evidence"
  | "usage"
  | "credits";

/** Context Blocks — Context Builder Spec §5 (blocos montados). */
export type ContextBlockId =
  | "core"
  | "tenant"
  | "workflow"
  | "conversation"
  | "knowledge"
  | "memory"
  | "tool"
  | "approval"
  | "evidence"
  | "execution";

// ── Ativo ativo ──────────────────────────────────────────────────────────────

export type ActiveAssetType = "property" | "lead" | "deal" | "connection" | "none";

// ── Estados do runtime ───────────────────────────────────────────────────────

/**
 * Estágios do pipeline, para PARADA honesta e rastreável (diagrama da task).
 * `tool_registry` foi adicionado na unidade 2: o Tool Registry Spec §2 posiciona
 * o Registry ENTRE o Orchestrator e a Approval Queue — o runtime agora para
 * ali (após validar elegibilidade da tool, nunca executá-la), para os dois
 * workflows existentes.
 */
export type RuntimeStage =
  | "runtime_api"
  | "intent_router"
  | "workflow_selector"
  | "policy"
  | "context_builder"
  | "orchestrator"
  | "tool_registry";

/**
 * Status terminal honesto do runtime.
 * - `READY_FOR_APPROVAL`: pipeline montou intenção + workflow + policy + contexto
 *   e PAROU no ponto de handoff governado. NENHUMA tool executou, NENHUM approval
 *   foi criado, NENHUM efeito externo ocorreu.
 * - `BLOCKED`: parada honesta antes do fim (ver `error_state` + `blocking_reason`).
 */
export type RuntimeStatus = "READY_FOR_APPROVAL" | "BLOCKED";

/**
 * Estados de erro honestos — união do Intent Router Spec §12 com o subconjunto
 * aplicável do Context Builder Spec §13 e do Tool Registry Spec §15
 * (`tool_not_registered`, adicionado na unidade 2). Sem estados inventados.
 */
export type RuntimeErrorState =
  | "tenant_missing"
  | "user_missing"
  | "intent_unknown"
  | "intent_ambiguous"
  | "workflow_not_allowed"
  | "workflow_missing"
  | "asset_missing"
  | "permission_denied"
  | "connection_required"
  | "approval_policy_missing"
  | "context_required"
  | "context_incomplete"
  | "blocked_by_policy"
  | "tool_not_registered";

// ── Entrada ──────────────────────────────────────────────────────────────────

/**
 * Requisição de entrada do Runtime — Input mínimo do Intent Router Spec §6.
 * Todo request carrega `tenant_id` e `user_id` (multi-tenant, defesa em
 * profundidade). Nenhuma credencial trafega aqui.
 */
export type RuntimeRequest = {
  tenant_id: string;
  user_id: string;
  route: string;
  module: string;
  raw_intent: string;
  active_asset_type: ActiveAssetType;
  active_asset_id: string | null;
  user_role: string;
  available_connections: readonly string[];
  requested_action: string;
};

// ── Saída do Intent Router + Workflow Selector ───────────────────────────────

/**
 * Classificação de intenção — Output mínimo do Intent Router Spec §7.
 *
 * Produzida em DUAS etapas do pipeline (single-responsibility):
 *  - Intent Router preenche `intent_type` / `confidence` / bloqueio;
 *  - Workflow Selector enriquece `workflow_id` / `allowed_tools` /
 *    `required_context` / `approval_required` / `risk_level`.
 */
export type IntentClassification = {
  intent_type: IntentType;
  confidence: number;
  workflow_id: WorkflowId | null;
  required_context: readonly ContextSourceId[];
  allowed_tools: readonly RuntimeToolName[];
  approval_required: boolean;
  risk_level: RiskLevel;
  blocking_reason: string | null;
  next_question: string | null;
};

/** Um passo declarativo do workflow. Nenhum passo é executado nesta unidade. */
export type WorkflowStep = {
  id: string;
  label: string;
  tool: RuntimeToolName | null;
  side_effect: SideEffect;
  requires_approval: boolean;
  /**
   * Unidade 3 (Persisted Run Slice) — gate nomeado que este step produz para
   * aprovação, quando aplicável. Campo aditivo/opcional: não afeta o pipeline
   * puro (o Orchestrator desta unidade só lê `steps[0]` e ignora este campo).
   */
  approval_gate?: string;
  /**
   * Unidade 3 — exige uma decisão `approved` registrada para este gate antes
   * de o step ficar elegível (production lock). Verificado exclusivamente
   * pela camada de persistência (`lib/yzi-imob/runtime/persistence.ts` +
   * RPC), nunca pelo pipeline puro nem confiado a partir do cliente.
   */
  requires_approval_gate?: string;
};

/** Definição declarativa de um workflow do runtime. */
export type WorkflowDefinition = {
  workflow_id: WorkflowId;
  title: string;
  /** Intents que este workflow atende (Workflow Selector Spec §5, §11). */
  intents: readonly IntentType[];
  /** Contexto exigido antes de decidir a próxima ação (Context Builder §12). */
  required_context: readonly ContextSourceId[];
  /** Tools permitidas por este workflow (Tool Registry §11). */
  allowed_tools: readonly RuntimeToolName[];
  steps: readonly WorkflowStep[];
  /** Nível de risco agregado do workflow. */
  risk_level: RiskLevel;
  /** Status terminal esperado ao final do pipeline (antes de qualquer execução). */
  terminal_status: RuntimeStatus;
};

/** Resultado do Workflow Selector. */
export type SelectedWorkflow = {
  definition: WorkflowDefinition;
  reason: string;
};

// ── Policy / Governance ──────────────────────────────────────────────────────

export type PolicyCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

/** Decisão da Policy/Governance Engine (Runtime Architecture §4). */
export type PolicyDecision = {
  allowed: boolean;
  tenant_ok: boolean;
  user_ok: boolean;
  approval_required: boolean;
  error_state: RuntimeErrorState | null;
  reason: string;
  checks: readonly PolicyCheck[];
};

// ── Context Builder ──────────────────────────────────────────────────────────

/** Frescor de um bloco de contexto — Context Builder Spec §10. */
export type Freshness = "fresh" | "stale" | "expired";

/** Um bloco de contexto montado, com proveniência e frescor (Spec §5, §9, §10). */
export type ContextBlock = {
  id: ContextBlockId;
  /** Prioridade conceitual (Context Builder Spec §6): menor = preservado primeiro. */
  priority: number;
  /** Origem rastreável (Spec §9): de qual source veio, sob qual tenant/user. */
  provenance: string;
  freshness: Freshness;
  /** Alto sinal, compacto — nunca payload cru, nunca segredo (Spec §2). */
  summary: string;
};

/**
 * Pacote de contexto entregue ao Orchestrator. `fingerprint` é conceitual
 * (Spec §11) — assinatura textual dos blocos/fontes, sem hash real.
 */
export type BuiltContext = {
  workflow_id: WorkflowId;
  blocks: readonly ContextBlock[];
  fingerprint: string;
  complete: boolean;
  error_state: RuntimeErrorState | null;
};

// ── Tool Registry (catálogo declarativo + elegibilidade — NÃO executa) ──────

/**
 * Metadados declarativos de uma tool — Tool Registry Spec v0.1 §4. Identidade +
 * elegibilidade; nunca produz efeito externo (Spec §3: "Registry decide o que
 * pode; o Executor faz o que foi aprovado").
 */
export type ToolMetadata = {
  tool_name: RuntimeToolName;
  description: string;
  category: string;
  /** Escopo — Spec §9: toda tool pertence a um tenant ou é global read-only. */
  tenant_scope: "tenant" | "global_read_only";
  side_effects: SideEffect;
  risk_level: RiskLevel;
  /** Workflows que esta tool serve — Spec §11. */
  supported_workflows: readonly WorkflowId[];
  /** Contexto exigido para a tool ficar elegível — Spec §10. */
  required_context: readonly ContextSourceId[];
  /** Approval Awareness — Spec §8: a tool já sabe, por contrato, se exige aprovação. */
  approval_required: boolean;
};

/** Resultado da checagem de elegibilidade do Tool Registry (Spec §2, §15). */
export type ToolEligibilityResult = {
  eligible: boolean;
  tool: ToolMetadata | null;
  reason: string;
  error_state: RuntimeErrorState | null;
};

// ── Approval Descriptor (contrato — NÃO cria, NÃO persiste) ──────────────────

/**
 * Descritor do que SERIA submetido à Approval Queue. Contrato mínimo exigido
 * pela unidade 2 (Approval-Only Vertical Slice). `approval_id` é
 * temporário/mock — determinístico, sem persistência, sem fila, sem banco.
 * `created` é sempre `false`: a Approval Queue está fora do escopo desta
 * unidade (não implementada).
 */
export type ApprovalDescriptor = {
  /** Identificador temporário/mock — determinístico, nunca persistido. */
  approval_id: string;
  workflow_id: WorkflowId;
  intent: IntentType;
  tenant_id: string;
  tool_id: RuntimeToolName;
  risk_level: RiskLevel;
  reason: string;
  requested_action: string;
  estimated_side_effect: SideEffect;
  /** Conceitual — Tool Registry Spec §14: "sem tarifa ou algoritmo". */
  estimated_usage: string;
  /** Conceitual — Usage/Credits Engine fora do escopo desta unidade. */
  estimated_credits: string;
  /** Invariante honesta: nada foi criado/persistido. */
  created: false;
};

// ── Handoff de aprovação (descritor — NÃO cria nada) ─────────────────────────

/**
 * Descritor do que SERIA enviado à Approval Queue no futuro. Nesta unidade o
 * runtime PARA antes: `created` é sempre `false`. Approval Queue está fora do
 * escopo desta unidade (não implementada).
 */
export type ApprovalHandoff = {
  /** Invariante honesta: nada foi criado na Approval Queue. */
  created: false;
  /** Se o próximo passo (fora desta unidade) exigiria approval item. */
  would_submit: boolean;
  tool: RuntimeToolName | null;
  side_effect: SideEffect;
  note: string;
  /** Contrato mínimo do Approval Descriptor — presente quando `would_submit=true`. */
  descriptor: ApprovalDescriptor | null;
};

// ── Evidência (trace honesto, sem efeito externo) ────────────────────────────

/** Trilha auditável do que o runtime viu/decidiu — Evidence First, sem I/O. */
export type RuntimeEvidence = {
  received_request: RuntimeRequest;
  stages_completed: readonly RuntimeStage[];
  decisions: readonly string[];
  /** Invariante do skeleton: nenhum efeito colateral externo ocorreu. */
  no_side_effects: true;
};

// ── Resultado final do Runtime ───────────────────────────────────────────────

/**
 * Objeto honesto retornado pela Runtime API. Indica intenção identificada,
 * workflow escolhido, contexto montado e o status terminal — parando SEMPRE
 * antes de qualquer execução, criação de approval ou alteração de estado.
 */
export type RuntimeResult = {
  status: RuntimeStatus;
  stopped_at: RuntimeStage;
  intent: IntentClassification | null;
  workflow: SelectedWorkflow | null;
  policy: PolicyDecision | null;
  context: BuiltContext | null;
  approval: ApprovalHandoff | null;
  error_state: RuntimeErrorState | null;
  blocking_reason: string | null;
  evidence: RuntimeEvidence;
  notes: readonly string[];
};

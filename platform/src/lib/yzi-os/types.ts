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

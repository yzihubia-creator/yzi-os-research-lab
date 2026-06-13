// Fronteira de permissão do operador (Lane 8 — Role / Permission Boundary).
// Módulo PURO, declarativo e read-only: nenhuma query, nenhum schema, nenhuma
// policy, nenhum service role, nenhuma escrita, nenhuma env. Traduz o papel REAL
// da membership (vindo do RLS read-only da Lane 3) em uma fronteira HONESTA do
// que o operador pode e ainda não pode fazer no cockpit.
//
// Verdade de produto nesta fase: o RLS tem APENAS policies SELECT
// (`memberships_select_own`, `tenants_select_member`) — nenhum caminho de
// escrita existe para NENHUM papel. Logo a fronteira efetiva hoje é
// "leitura + presença de sessão" para todos. O gradiente de privilégio
// (owner > admin > operator > viewer) existe no modelo de dados, mas o cockpit
// ainda não expõe ações elevadas. Não inventamos capacidades que o produto não
// tem: nada aqui descreve um botão, uma ação administrativa ou uma escrita que
// não exista de verdade.

/** Papéis institucionais reais (CHECK da coluna `tenant_memberships.role`). */
export type MembershipRole = "owner" | "admin" | "operator" | "viewer";

export type PermissionBoundary = {
  /** Rótulo humano do papel — sem expor o valor cru como console técnico. */
  label: string;
  /** Uma linha honesta sobre o que o papel significa nesta fase do produto. */
  summary: string;
  /** O que o operador realmente consegue fazer no cockpit hoje. */
  can: readonly string[];
  /** O que o cockpit ainda não permite — honesto, sem ação falsa. */
  cannotYet: readonly string[];
};

// Fronteira efetiva comum a todos os papéis hoje: o produto só expõe leitura e
// controle da própria sessão. Compartilhada para não fabricar diferenças que o
// cockpit ainda não consegue demonstrar.
const READ_ONLY_TODAY = {
  can: [
    "Ver esta operação — o tenant ao qual você está vinculado.",
    "Ver o seu próprio vínculo: o papel e o pertencimento a este tenant.",
    "Encerrar a sua sessão quando quiser.",
  ],
  cannotYet: [
    "Criar, editar ou excluir dados — o cockpit ainda não expõe nenhuma ação de escrita.",
    "Criar ou operar agentes — a base de operação agentic está vazia.",
    "Administrar membros, papéis ou configurações do tenant.",
  ],
} as const;

const BOUNDARIES: Record<MembershipRole, PermissionBoundary> = {
  viewer: {
    label: "Viewer — observador",
    summary:
      "Nível de menor privilégio do modelo: um vínculo de observação da operação.",
    ...READ_ONLY_TODAY,
  },
  operator: {
    label: "Operator — operador",
    summary:
      "Privilégio maior que viewer no modelo; o cockpit ainda não expõe ações de operação.",
    ...READ_ONLY_TODAY,
  },
  admin: {
    label: "Admin — administrador",
    summary:
      "Privilégio de gestão no modelo; o cockpit ainda não expõe ações administrativas.",
    ...READ_ONLY_TODAY,
  },
  owner: {
    label: "Owner — dono",
    summary:
      "Maior privilégio do modelo; o cockpit ainda não expõe ações elevadas.",
    ...READ_ONLY_TODAY,
  },
};

// Papel fora do conjunto conhecido: ainda honesto, sem afirmar capacidades.
const UNKNOWN_BOUNDARY: PermissionBoundary = {
  label: "Vínculo registrado",
  summary: "Seu papel está registrado, mas o cockpit ainda não o detalha.",
  ...READ_ONLY_TODAY,
};

/**
 * Traduz o papel real da membership na fronteira de permissão honesta. Aceita
 * `string` cru (vindo do banco) e degrada com segurança para um papel não
 * reconhecido — nunca lança, nunca inventa capacidade.
 */
export function getPermissionBoundary(role: string): PermissionBoundary {
  return (
    (BOUNDARIES as Record<string, PermissionBoundary>)[role] ?? UNKNOWN_BOUNDARY
  );
}

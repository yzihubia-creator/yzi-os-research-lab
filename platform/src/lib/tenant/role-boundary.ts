// Fronteira de permissão do operador (Lane 8 — Role / Permission Boundary).
// Módulo puro e declarativo: nenhuma query, nenhum schema, nenhum service role.
// Traduz o papel real da membership em linguagem de produto, mantendo o
// contrato canônico do banco: owner, admin, operator, viewer.

/** Papéis institucionais reais (CHECK da coluna `tenant_memberships.role`). */
export type MembershipRole = "owner" | "admin" | "operator" | "viewer";

export type PermissionBoundary = {
  label: string;
  summary: string;
  can: readonly string[];
  cannotYet: readonly string[];
};

const SHARED_CAN = [
  "Ver esta operação — o tenant ao qual você está vinculado.",
  "Ver o próprio vínculo, papel, status e disponibilidade operacional.",
  "Atualizar a própria disponibilidade operacional.",
  "Encerrar a própria sessão quando quiser.",
] as const;

const BOUNDARIES: Record<MembershipRole, PermissionBoundary> = {
  viewer: {
    label: "Somente acompanhamento",
    summary: "Vínculo de acompanhamento com menor privilégio.",
    can: SHARED_CAN,
    cannotYet: [
      "Administrar convites, membros, funções ou suspensão de acessos.",
      "Alterar configurações estruturais da operação.",
      "Executar ações reais de integração sem aprovação humana.",
    ],
  },
  operator: {
    label: "Operação",
    summary: "Vínculo operacional sem administração estrutural da equipe.",
    can: SHARED_CAN,
    cannotYet: [
      "Administrar convites, membros, funções ou suspensão de acessos.",
      "Alterar configurações estruturais da operação.",
      "Executar ações reais de integração sem aprovação humana.",
    ],
  },
  admin: {
    label: "Gestão",
    summary: "Gestão da operação e da equipe dentro do tenant ativo.",
    can: [
      ...SHARED_CAN,
      "Listar a equipe do tenant.",
      "Criar e revogar convites.",
      "Alterar funções, status e disponibilidade de membros do tenant.",
    ],
    cannotYet: [
      "Enviar ou reenviar e-mail de convite sem provedor conectado.",
      "Executar ações reais de integração sem aprovação humana.",
    ],
  },
  owner: {
    label: "Responsável principal",
    summary: "Maior privilégio operacional do tenant.",
    can: [
      ...SHARED_CAN,
      "Listar a equipe do tenant.",
      "Criar e revogar convites.",
      "Alterar funções, status e disponibilidade de membros do tenant.",
    ],
    cannotYet: [
      "Enviar ou reenviar e-mail de convite sem provedor conectado.",
      "Executar ações reais de integração sem aprovação humana.",
    ],
  },
};

const UNKNOWN_BOUNDARY: PermissionBoundary = {
  label: "Vínculo registrado",
  summary: "Seu papel está registrado, mas o cockpit ainda não o detalha.",
  can: SHARED_CAN,
  cannotYet: ["Administrar equipe ou configurações até o papel ser reconhecido."],
};

export function getPermissionBoundary(role: string): PermissionBoundary {
  return (BOUNDARIES as Record<string, PermissionBoundary>)[role] ?? UNKNOWN_BOUNDARY;
}

import { createServerSupabaseClient, getSessionUser } from "@/lib/auth/session";

// Resolução read-only do contexto de tenant (Lane 4, Step 5, gate L4-G3).
// Exercita as policies RLS da Lane 3 (`memberships_select_own` →
// `tenants_select_member`) usando EXCLUSIVAMENTE SELECT sobre
// `tenant_memberships` e `tenants`. Sem service role, sem SQL raw, sem RPC,
// sem qualquer escrita. Ausência de membership/tenant é estado vazio honesto
// (sucesso), nunca tenant inventado.

/** Objeto mínimo e seguro do tenant exposto quando encontrado. */
export type TenantSummary = {
  id: string;
  slug: string;
  name: string;
};

/**
 * Contexto de tenant do usuário atual, como união discriminada que distingue
 * explicitamente os quatro estados possíveis. Mensagens/erros são literais
 * saneados — nunca vazam detalhes do backend.
 */
export type TenantContext =
  | { status: "no_session" }
  | { status: "no_membership"; userId: string; message: string }
  | { status: "tenant_found"; userId: string; tenant: TenantSummary; role: string }
  | { status: "error"; error: string };

const NO_MEMBERSHIP_MESSAGE = "Você ainda não pertence a um tenant.";

/**
 * Obtém o contexto de tenant do usuário autenticado via RLS, somente leitura.
 *
 * - `no_session`: não há usuário autenticado;
 * - `no_membership`: há sessão, mas o usuário não é membro de nenhum tenant
 *   (estado vazio honesto — banco limpo retorna isto);
 * - `tenant_found`: tenant resolvido via membership;
 * - `error`: falha sanitizada, sem vazar detalhes sensíveis.
 */
export async function getTenantContext(): Promise<TenantContext> {
  const user = await getSessionUser();
  if (!user) {
    return { status: "no_session" };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // RLS (`memberships_select_own`) já restringe ao próprio user_id. Lê também
    // `role` — coberto pela MESMA policy SELECT; sem schema novo, sem policy
    // nova, sem escrita. O papel alimenta a fronteira de permissão honesta
    // exibida no cockpit (Lane 8).
    const { data: membership, error: membershipError } = await supabase
      .from("tenant_memberships")
      .select("tenant_id, role")
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      return { status: "error", error: "Falha ao resolver a membership do tenant." };
    }

    if (!membership) {
      return { status: "no_membership", userId: user.id, message: NO_MEMBERSHIP_MESSAGE };
    }

    const { tenant_id: tenantId, role } = membership as {
      tenant_id: string;
      role: string;
    };

    // RLS (`tenants_select_member`) só permite ver o tenant se houver membership.
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, slug, name")
      .eq("id", tenantId)
      .maybeSingle();

    if (tenantError) {
      return { status: "error", error: "Falha ao resolver o tenant." };
    }

    if (!tenant) {
      // Membership existe mas o tenant não está visível: estado vazio honesto,
      // nunca um tenant fabricado para "preencher" o vazio.
      return { status: "no_membership", userId: user.id, message: NO_MEMBERSHIP_MESSAGE };
    }

    const { id, slug, name } = tenant as TenantSummary;
    return {
      status: "tenant_found",
      userId: user.id,
      tenant: { id, slug, name },
      role,
    };
  } catch {
    return { status: "error", error: "Erro inesperado ao resolver o contexto de tenant." };
  }
}

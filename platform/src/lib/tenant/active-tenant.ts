export const ACTIVE_TENANT_COOKIE = "yzi_active_tenant_id";

export const ACTIVE_TENANT_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export type ActiveTenantMembership = {
  tenant_id: string;
  role: string;
};

export type ActiveTenantMembershipSelection =
  | { status: "no_membership" }
  | { status: "selection_required" }
  | { status: "selected"; membership: ActiveTenantMembership };

/**
 * Resolve a preferência explícita somente dentro das memberships ativas já
 * visíveis pela sessão. A preferência nunca é tratada como autorização.
 */
export function selectActiveTenantMembership(
  memberships: ActiveTenantMembership[],
  selectedTenantId: string | null,
): ActiveTenantMembershipSelection {
  if (memberships.length === 0) return { status: "no_membership" };

  if (selectedTenantId) {
    const selected = memberships.filter(
      (membership) => membership.tenant_id === selectedTenantId,
    );
    if (selected.length === 1) {
      return { status: "selected", membership: selected[0] };
    }
  }

  if (memberships.length === 1) {
    return { status: "selected", membership: memberships[0] };
  }

  return { status: "selection_required" };
}

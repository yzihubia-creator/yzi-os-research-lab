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

export type ActiveTenantSelectionOption = {
  slug: string;
  name: string;
};

type ActiveTenantRecord = ActiveTenantSelectionOption & {
  id: string;
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

export function listActiveTenantSelectionOptions(
  memberships: ActiveTenantMembership[],
  activeTenants: ActiveTenantRecord[],
): ActiveTenantSelectionOption[] {
  const membershipTenantIds = new Set(
    memberships.map((membership) => membership.tenant_id),
  );

  return activeTenants
    .filter((tenant) => membershipTenantIds.has(tenant.id))
    .map(({ slug, name }) => ({ slug, name }))
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
}

export function getRequiredTenantSelectionOptions(
  memberships: ActiveTenantMembership[],
  activeTenants: ActiveTenantRecord[],
  selectedTenantId: string | null,
): ActiveTenantSelectionOption[] | null {
  const selection = selectActiveTenantMembership(memberships, selectedTenantId);
  if (selection.status === "no_membership") return null;

  if (
    selection.status === "selected" &&
    activeTenants.some(
      (tenant) => tenant.id === selection.membership.tenant_id,
    )
  ) {
    return null;
  }

  const options = listActiveTenantSelectionOptions(memberships, activeTenants);
  return options.length > 0 ? options : null;
}

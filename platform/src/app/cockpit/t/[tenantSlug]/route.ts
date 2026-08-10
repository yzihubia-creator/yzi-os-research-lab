import { NextResponse, type NextRequest } from "next/server";

import {
  ACTIVE_TENANT_COOKIE,
  ACTIVE_TENANT_COOKIE_OPTIONS,
} from "@/lib/tenant/active-tenant";
import { getTenantContextBySlug } from "@/lib/tenant/tenant-context";

async function selectTenant(
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params;
  const tenantContext = await getTenantContextBySlug(tenantSlug);

  if (tenantContext.status === "no_session") {
    return NextResponse.json({ error: "Sessão obrigatória." }, { status: 401 });
  }
  if (tenantContext.status === "no_membership") {
    return NextResponse.json({ error: "Tenant não permitido para esta sessão." }, { status: 403 });
  }
  if (tenantContext.status === "error") {
    return NextResponse.json({ error: "Não foi possível selecionar o tenant." }, { status: 500 });
  }

  const response = NextResponse.json({
    tenant: {
      slug: tenantContext.tenant.slug,
      name: tenantContext.tenant.name,
    },
  });
  response.cookies.set(
    ACTIVE_TENANT_COOKIE,
    tenantContext.tenant.id,
    ACTIVE_TENANT_COOKIE_OPTIONS,
  );
  return response;
}

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ tenantSlug: string }> },
) {
  return selectTenant(context);
}

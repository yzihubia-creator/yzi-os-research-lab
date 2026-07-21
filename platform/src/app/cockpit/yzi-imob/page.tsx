import { YziImobHomeV2 } from "@/components/yzi-imob/yzi-imob-home-v2";
import { createServerSupabaseClient, getSessionUser } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { computePropertyCompleteness } from "@/lib/yzi-imob/properties/completeness";
import { listProperties } from "@/lib/yzi-imob/properties/repository";

const RECENT_DAYS = 30;

function isRecent(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  return Date.now() - created <= RECENT_DAYS * 24 * 60 * 60 * 1000;
}

// A vertical YZI IMOB abre pela YZI hero-first (contrato visual v1.2), como o
// YZI OS: presença central, saudação, composer, ações por job. Nesta unidade,
// a home passa a refletir somente a leitura operacional mínima de imóveis
// reais; o restante da superfície permanece honesto quando ainda não há fonte.
export default async function YziImobIndexPage() {
  const operator = await getSessionUser();
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "tenant_found") {
    const supabase = await createServerSupabaseClient();
    const result = await listProperties(supabase, tenantContext.tenant.id);

    if (result.status === "ok") {
      const properties = result.value.items;
      const metrics = {
        total: result.value.total,
        active: properties.filter((property) => property.status === "active").length,
        incomplete: properties.filter(
          (property) => computePropertyCompleteness(property).percentage < 100,
        ).length,
        recent: properties.filter((property) => isRecent(property.createdAt)).length,
      };

      return (
        <YziImobHomeV2
          operatorEmail={operator?.email}
          dataState="tenant_found"
          metrics={metrics}
        />
      );
    }

    return (
      <YziImobHomeV2
        operatorEmail={operator?.email}
        dataState="error"
        metrics={null}
      />
    );
  }

  return (
    <YziImobHomeV2
      operatorEmail={operator?.email}
      dataState={tenantContext.status}
      metrics={null}
    />
  );
}

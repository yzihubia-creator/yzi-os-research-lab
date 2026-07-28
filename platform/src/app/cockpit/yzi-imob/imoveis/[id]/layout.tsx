import type { ReactNode } from "react";

import {
  YziImobPropertyPublicationWorkspaceProvider,
  type PropertyPublicationWorkspaceContextValue,
} from "@/components/yzi-imob/yzi-imob-property-publication-workspace-adapter";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { derivePropertyPublicSlug } from "@/lib/yzi-imob/publication/payload";
import { evaluatePropertyPublicationReadiness } from "@/lib/yzi-imob/publication/readiness";
import { getPropertyPublicationWorkspace } from "@/lib/yzi-imob/publication/repository";
import { getPropertyById } from "@/lib/yzi-imob/properties/repository";

async function loadPublicationContext(
  propertyId: string,
): Promise<PropertyPublicationWorkspaceContextValue | null> {
  const tenantContext = await getTenantContext();
  if (tenantContext.status !== "tenant_found") return null;

  const supabase = await createServerSupabaseClient();
  const [propertyResult, publicationResult] = await Promise.all([
    getPropertyById(supabase, tenantContext.tenant.id, propertyId),
    getPropertyPublicationWorkspace(
      supabase,
      tenantContext.tenant.id,
      propertyId,
    ),
  ]);
  if (propertyResult.status === "error") return null;

  const workspace =
    publicationResult.status === "ok" ? publicationResult.value : null;
  const suggestedSlug =
    workspace?.state?.publicSlug ??
    derivePropertyPublicSlug(propertyResult.value);

  return {
    propertyId,
    suggestedSlug,
    readiness: evaluatePropertyPublicationReadiness({
      property: propertyResult.value,
      publicSlug: suggestedSlug,
      media: workspace?.media ?? [],
    }),
    workspace,
    unavailable: publicationResult.status === "error",
  };
}

export default async function YziImobPropertyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const publicationContext = await loadPublicationContext(id);

  return (
    <YziImobPropertyPublicationWorkspaceProvider value={publicationContext}>
      {children}
    </YziImobPropertyPublicationWorkspaceProvider>
  );
}

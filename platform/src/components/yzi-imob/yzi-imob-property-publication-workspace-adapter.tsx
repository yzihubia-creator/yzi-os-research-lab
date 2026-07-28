"use client";

import { createContext, useContext, type ReactNode } from "react";

import { YziImobPropertyPublicationPanel } from "@/components/yzi-imob/yzi-imob-property-publication-panel";
import type {
  PropertyPublicationReadiness,
  PropertyPublicationWorkspace,
} from "@/lib/yzi-imob/publication/types";

export type PropertyPublicationWorkspaceContextValue = {
  propertyId: string;
  suggestedSlug: string;
  readiness: PropertyPublicationReadiness;
  workspace: PropertyPublicationWorkspace | null;
  unavailable: boolean;
};

const PropertyPublicationWorkspaceContext =
  createContext<PropertyPublicationWorkspaceContextValue | null>(null);

export function YziImobPropertyPublicationWorkspaceProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: PropertyPublicationWorkspaceContextValue | null;
}) {
  return (
    <PropertyPublicationWorkspaceContext value={value}>
      {children}
    </PropertyPublicationWorkspaceContext>
  );
}

export function YziImobPropertyPublicationWorkspaceSlot() {
  const publication = useContext(PropertyPublicationWorkspaceContext);

  if (!publication) {
    return (
      <div className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-5 py-8">
        <p className="text-[0.84rem] text-[var(--yzi-text-primary)]">
          Publicação indisponível
        </p>
        <p className="mt-2 text-[0.76rem] text-[var(--yzi-text-secondary)]">
          Não foi possível avaliar o contrato governado deste imóvel.
        </p>
      </div>
    );
  }

  return (
    <YziImobPropertyPublicationPanel
      propertyId={publication.propertyId}
      suggestedSlug={publication.suggestedSlug}
      readiness={publication.readiness}
      workspace={publication.workspace}
      unavailable={publication.unavailable}
    />
  );
}

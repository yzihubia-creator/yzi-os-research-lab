import type { Metadata } from "next";

import { YziOperationSelector } from "@/components/yzi-os/yzi-operation-selector";
import { YziShell } from "@/components/yzi-os/yzi-shell";
import { getSessionUser } from "@/lib/auth/session";
import { getTenantSelectionState } from "@/lib/tenant/tenant-context";

export const metadata: Metadata = {
  title: "YZI OS",
  description:
    "Superfície operacional do YZI OS: Assistente YZI no centro e módulos institucionais em ativação.",
};

export default async function CockpitLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Leitura read-only só para exibir o operador no rodapé da sidebar. A
  // proteção de sessão efetiva permanece na page (/cockpit) e no proxy/middleware.
  const [operator, tenantSelection] = await Promise.all([
    getSessionUser(),
    getTenantSelectionState(),
  ]);

  const content =
    tenantSelection.status === "selection_required" ? (
      <YziOperationSelector operations={tenantSelection.operations} />
    ) : (
      children
    );

  return <YziShell operatorEmail={operator?.email}>{content}</YziShell>;
}

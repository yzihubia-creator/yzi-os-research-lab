import { redirect } from "next/navigation";

import { YziImobBrokerWorkspace } from "@/components/yzi-imob/yzi-imob-broker-workspace";
import { createServerSupabaseClient } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { getBrokerWorkspace } from "@/lib/yzi-imob/brokers/repository";
import { respondToAssignmentAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function YziImobCorretorWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenantContext = await getTenantContext();
  if (tenantContext.status === "no_session") redirect("/login");
  if (tenantContext.status !== "tenant_found") {
    return (
      <YziImobBrokerWorkspace
        data={null}
        canRespond={false}
        action={respondToAssignmentAction}
        notFoundMessage="A operacao nao esta disponivel para esta conta."
      />
    );
  }

  const supabase = await createServerSupabaseClient();
  const result = await getBrokerWorkspace(
    supabase,
    tenantContext.tenant.id,
    tenantContext.userId,
    id,
  );
  if (result.status === "error") {
    return (
      <YziImobBrokerWorkspace
        data={null}
        canRespond={false}
        action={respondToAssignmentAction}
        notFoundMessage={
          result.code === "not_found"
            ? "Este corretor não existe nesta operação ou não está visível para sua conta."
            : "O workspace do corretor nao pode ser lido agora."
        }
      />
    );
  }

  return (
    <YziImobBrokerWorkspace
      data={result.value}
      canRespond={tenantContext.userId === result.value.broker.userId}
      action={respondToAssignmentAction}
    />
  );
}

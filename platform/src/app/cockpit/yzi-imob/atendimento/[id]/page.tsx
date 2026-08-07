import Link from "next/link";
import { redirect } from "next/navigation";

import { YziImobConversationWorkspace } from "@/components/yzi-imob/yzi-imob-conversation-workspace";
import { YziAlert, YziPanel } from "@/components/yzi-os/yzi-primitives";
import { createServerSupabaseClient, getSessionUser } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { getConversation, listRecentMessages } from "@/lib/yzi-imob/conversations/queries";

// Conversation Workspace page — busca conversation + lead + histórico real
// server-side, tenant-scoped, e entrega tudo pronto ao componente cliente
// (sem fetch client-side, sem mock). Estados honestos: sem sessão → login;
// sem membership/erro de tenant → mesmo padrão da lista; conversation
// inexistente ou de outro tenant → "conversation não encontrada" (RLS +
// filtro explícito por tenant_id já impedem o cross-tenant antes disso).

type LeadRow = { id: string; full_name: string; phone: string | null; email: string | null };

async function getLead(tenantId: string, leadId: string): Promise<LeadRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("yzi_imob_leads")
    .select("id, full_name, phone, email")
    .eq("tenant_id", tenantId)
    .eq("id", leadId)
    .maybeSingle();
  return (data as LeadRow | null) ?? null;
}

export default async function YziImobConversationWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const operator = await getSessionUser();
  if (!operator) {
    redirect("/login");
  }

  const { id: conversationId } = await params;
  const tenantContext = await getTenantContext();

  if (tenantContext.status === "no_membership") {
    return (
      <section className="mx-auto flex max-w-2xl flex-col gap-4 px-8 py-10">
        <YziPanel className="p-5">
          <p className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
            Sua operação ainda não está disponível
          </p>
          <p className="mt-1 text-[0.82rem] text-[var(--yzi-text-secondary)]">
            Não encontramos uma imobiliária vinculada à sua conta. Verifique o acesso ou fale com o
            administrador.
          </p>
        </YziPanel>
      </section>
    );
  }

  if (tenantContext.status === "error") {
    return (
      <section className="mx-auto flex max-w-2xl flex-col gap-4 px-8 py-10">
        <YziAlert tone="blocked" title="Esta conversa não pôde ser carregada">
          Tente novamente em alguns instantes. Se o problema continuar, verifique o acesso com o
          administrador.
        </YziAlert>
      </section>
    );
  }

  if (tenantContext.status === "no_session") {
    redirect("/login");
  }

  const tenantId = tenantContext.tenant.id;
  const conversationResult = await getConversation({ tenantId, conversationId });

  if (conversationResult.status === "error") {
    return (
      <section className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center gap-3 px-8 py-10 text-center">
        <p className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">
          Conversation não encontrada.
        </p>
        <p className="text-[0.86rem] text-[var(--yzi-text-secondary)]">
          Esta conversa não existe nesta operação ou não está disponível para sua conta.
        </p>
        <Link
          href="/cockpit/yzi-imob/atendimento"
          className="mt-2 text-[0.82rem] text-[rgb(var(--imob-ice))] hover:underline"
        >
          Voltar ao Atendimento
        </Link>
      </section>
    );
  }

  const conversation = conversationResult.conversation;
  const [lead, messagesResult] = await Promise.all([
    conversation.leadId ? getLead(tenantId, conversation.leadId) : Promise.resolve(null),
    listRecentMessages({ tenantId, conversationId, limit: 50 }),
  ]);

  const messages = messagesResult.status === "ok" ? messagesResult.messages : [];
  const messagesError = messagesResult.status === "error" ? messagesResult.message : null;

  return (
    <YziImobConversationWorkspace
      conversation={conversation}
      lead={lead}
      messages={messages}
      messagesError={messagesError}
    />
  );
}

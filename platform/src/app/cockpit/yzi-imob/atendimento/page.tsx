import Link from "next/link";
import { redirect } from "next/navigation";

import { YziAlert, YziPanel } from "@/components/yzi-os/yzi-primitives";
import { createServerSupabaseClient, getSessionUser } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { listConversations } from "@/lib/yzi-imob/conversations/queries";
import type { Conversation } from "@/lib/yzi-imob/conversations/types";

// Atendimento — lista real de conversations do tenant (Discover Surface).
// Substitui o kanban mockado por LeadStage (campo que não existe no schema)
// por colunas agrupadas por `Conversation.status` real (open/paused/closed +
// "outro" honesto para valores fora do vocabulário recomendado). Preserva a
// estética de colunas/cards do kanban anterior sem inventar dado: cada card
// mostra só o que é real (lead, canal, status, última atividade). Clique
// abre o Conversation Workspace real em `[id]`.

const STATUS_ORDER = ["open", "paused", "closed"] as const;
const STATUS_LABEL: Record<string, string> = {
  open: "Em aberto",
  paused: "Pausada",
  closed: "Encerrada",
};
const STATUS_ACCENT: Record<string, string> = {
  open: "var(--imob-cold)",
  paused: "var(--imob-amber, 200, 160, 90)",
  closed: "var(--yzi-text-faint)",
};

type LeadSummary = { id: string; fullName: string };

function formatLastActivity(conversation: Conversation): string {
  const iso = conversation.lastMessageAt ?? conversation.startedAt;
  if (!iso) return "Sem atividade registrada";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

async function listLeadsForConversations(
  tenantId: string,
  leadIds: readonly string[],
): Promise<Map<string, LeadSummary>> {
  if (leadIds.length === 0) return new Map();
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("yzi_imob_leads")
    .select("id, full_name")
    .eq("tenant_id", tenantId)
    .in("id", leadIds as string[]);
  return new Map(
    (data ?? []).map((row) => [row.id as string, { id: row.id as string, fullName: row.full_name as string }]),
  );
}

export default async function YziImobAtendimentoPage() {
  const operator = await getSessionUser();
  if (!operator) {
    redirect("/login");
  }

  const tenantContext = await getTenantContext();

  return (
    <section className="flex w-full flex-col gap-6 px-8 py-10">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">
          Atendimento
        </h1>
        <p className="max-w-2xl text-[0.82rem] text-[var(--yzi-text-secondary)]">
          Conversas da operação agrupadas por estado. Selecione uma conversa para consultar
          o histórico de mensagens.
        </p>
      </header>

      {tenantContext.status === "no_membership" ? (
        <YziPanel className="max-w-2xl p-5">
          <p className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
            Sua operação ainda não está disponível
          </p>
          <p className="mt-1 text-[0.82rem] text-[var(--yzi-text-secondary)]">
            Não encontramos uma imobiliária vinculada à sua conta. Verifique o acesso ou fale com o
            administrador.
          </p>
        </YziPanel>
      ) : null}

      {tenantContext.status === "error" ? (
        <YziAlert tone="blocked" title="O atendimento não pôde ser carregado">
          Tente novamente em alguns instantes. Se o problema continuar, verifique o acesso com o
          administrador.
        </YziAlert>
      ) : null}

      {tenantContext.status === "tenant_found" ? (
        <ConversationBoard tenantId={tenantContext.tenant.id} />
      ) : null}
    </section>
  );
}

async function ConversationBoard({ tenantId }: { tenantId: string }) {
  const result = await listConversations({ tenantId, limit: 50 });

  if (result.status === "error") {
    return (
      <YziAlert tone="blocked" title="Não foi possível carregar as conversas">
        {result.message}
      </YziAlert>
    );
  }

  const conversations = result.conversations;

  if (conversations.length === 0) {
    return (
      <p className="rounded-[var(--yzi-radius-sm)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-6 text-center text-[0.8rem] text-[var(--yzi-text-faint)]">
        Nenhuma conversa registrada ainda.
      </p>
    );
  }

  const leadIds = Array.from(
    new Set(conversations.map((c) => c.leadId).filter((leadId): leadId is string => Boolean(leadId))),
  );
  const leadsById = await listLeadsForConversations(tenantId, leadIds);

  const knownStatuses = new Set<string>(STATUS_ORDER);
  const otherStatuses = Array.from(
    new Set(conversations.map((c) => c.status).filter((status) => !knownStatuses.has(status))),
  );
  const columns = [...STATUS_ORDER, ...otherStatuses];

  return (
    <div className="yzi-imob-kanban-track flex w-full gap-3 overflow-x-auto pb-3">
      {columns.map((status) => {
        const columnConversations = conversations.filter((c) => c.status === status);
        const accent = STATUS_ACCENT[status] ?? "var(--yzi-text-faint)";
        const label = STATUS_LABEL[status] ?? status;
        return (
          <div key={status} className="flex w-[236px] shrink-0 flex-col gap-2.5">
            <div
              className="flex items-center justify-between rounded-t-[var(--yzi-radius-sm)] px-1 pb-2 pt-0.5"
              style={{ borderTop: `2px solid rgb(${accent})` }}
            >
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: `rgb(${accent})` }}
                />
                <span className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[var(--yzi-text-secondary)]">
                  {label}
                </span>
              </span>
              <span className="rounded-full border border-[color:var(--yzi-border-subtle)] px-1.5 py-0.5 text-[0.62rem] text-[var(--yzi-text-faint)]">
                {columnConversations.length}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {columnConversations.length === 0 ? (
                <p className="rounded-[var(--yzi-radius-sm)] border border-dashed border-[color:var(--yzi-border-subtle)] px-2.5 py-3 text-center text-[0.68rem] text-[var(--yzi-text-faint)]">
                  Nenhuma conversa neste estado.
                </p>
              ) : (
                columnConversations.map((conversation) => {
                  const lead = conversation.leadId ? leadsById.get(conversation.leadId) : null;
                  const title = conversation.isExternalContact
                    ? "Contato externo"
                    : lead?.fullName ?? "Lead não encontrado";
                  const subtitle = conversation.isExternalContact
                    ? `${conversation.channelLabel} · ${conversation.externalIdentityMasked ?? "identidade indisponível"}`
                    : `Canal: ${conversation.channelLabel}`;
                  return (
                    <Link
                      key={conversation.id}
                      href={`/cockpit/yzi-imob/atendimento/${conversation.id}`}
                      className="group flex flex-col gap-1 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-2.5 py-2 transition-colors hover:border-[color:rgba(var(--imob-ice),0.32)]"
                      style={{ borderLeft: `2px solid rgb(${accent})` }}
                    >
                      <span className="truncate text-[0.78rem] font-medium text-[var(--yzi-text-primary)]">
                        {title}
                      </span>
                      <span className="truncate text-[0.66rem] text-[var(--yzi-text-secondary)]">
                        {subtitle}
                      </span>
                      <span className="truncate text-[0.6rem] text-[var(--yzi-text-faint)]">
                        {formatLastActivity(conversation)}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

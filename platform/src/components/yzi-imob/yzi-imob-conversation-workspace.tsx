"use client";

import Link from "next/link";

import { WorkspaceField } from "@/components/yzi-imob/yzi-imob-workspace-fields";
import type { Conversation, Message } from "@/lib/yzi-imob/conversations/types";

// Conversation Workspace — versão real (tenant-scoped). Recebe conversation,
// lead e histórico de mensagens já resolvidos no server (page.tsx), sem
// nenhum fetch client-side e sem mock. Mostra só o que existe de fato no
// schema (`yzi_imob_conversations`/`yzi_imob_messages`/`yzi_imob_leads`):
// nenhum campo de qualificação (estágio, score, bairro desejado, agenda,
// corretor vinculado etc.) foi inventado aqui — esses campos não existem no
// banco hoje; ver relatório da unidade para a decisão de produto pendente.
//
// Composer removido: envio real de mensagem está fora do escopo deste
// batch. Nenhuma ação é simulada como se fosse real.

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Em aberto",
  paused: "Pausada",
  closed: "Encerrada",
};

const DIRECTION_LABEL: Record<string, string> = {
  inbound: "Recebida",
  outbound: "Enviada",
};

const SENDER_LABEL: Record<string, string> = {
  lead: "Lead",
  external_contact: "Contato externo",
  yzi: "YZI",
  human: "Humano",
};

function formatTimestamp(iso: string): string {
  if (!iso) return "";
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

type LeadInfo = { id: string; full_name: string; phone: string | null; email: string | null } | null;

export function YziImobConversationWorkspace({
  conversation,
  lead,
  messages,
  messagesError,
}: {
  conversation: Conversation;
  lead: LeadInfo;
  messages: Message[];
  messagesError: string | null;
}) {
  // A query devolve mais recente primeiro; a exibição do histórico de chat é
  // cronológica (mais antiga primeiro), então invertemos só na apresentação.
  const chronologicalMessages = [...messages]
    .filter((message) => message.direction === "inbound" || message.direction === "outbound")
    .reverse();
  const isExternalContact = conversation.isExternalContact;
  const title = isExternalContact ? "Contato externo" : lead?.full_name ?? "Lead não encontrado neste tenant";
  const channelLabel = CHANNEL_LABEL[conversation.channel] ?? conversation.channelLabel;
  const identitySubtitle = isExternalContact
    ? `${channelLabel} · ${conversation.externalIdentityMasked ?? "identidade indisponível"}`
    : channelLabel;

  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-8 pt-10">
        <div className="flex items-center gap-2.5">
          <Link
            href="/cockpit/yzi-imob/atendimento"
            className="text-[0.72rem] text-[var(--yzi-text-faint)] transition-colors hover:text-[var(--yzi-text-secondary)]"
          >
            ← Atendimento
          </Link>
          <span aria-hidden className="text-[var(--yzi-text-faint)]">
            /
          </span>
          <span className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[var(--yzi-text-secondary)]">
            Conversation Workspace
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-balance text-[1.9rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--yzi-text-primary)]">
            {title}
          </h1>
          <span className="rounded-full border border-[color:rgba(var(--imob-ice),0.4)] bg-[rgba(var(--imob-cold),0.12)] px-2.5 py-1 text-[0.66rem] text-[rgb(var(--imob-ice))]">
            {STATUS_LABEL[conversation.status] ?? conversation.status}
          </span>
          <span className="rounded-full border border-[color:var(--yzi-border-subtle)] px-2.5 py-1 text-[0.66rem] text-[var(--yzi-text-faint)]">
            {identitySubtitle}
          </span>
        </div>
        {isExternalContact ? (
          <p className="text-[0.78rem] text-[var(--yzi-text-secondary)]">
            Ainda não qualificado como lead.
          </p>
        ) : null}
      </section>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-7 px-8 py-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Histórico real de mensagens — sem composer: envio fora do escopo deste batch */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
              Conversa
            </h2>
            <span className="text-[0.66rem] text-[var(--yzi-text-faint)]">
              Histórico real · somente leitura
            </span>
          </div>

          <div className="flex flex-col gap-3 rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4">
            {messagesError ? (
              <p className="text-[0.8rem] text-[var(--yzi-text-secondary)]">{messagesError}</p>
            ) : chronologicalMessages.length === 0 ? (
              <p className="rounded-[var(--yzi-radius-sm)] border border-dashed border-[color:var(--yzi-border-subtle)] px-3 py-4 text-center text-[0.76rem] text-[var(--yzi-text-faint)]">
                Nenhuma mensagem registrada nesta conversation ainda.
              </p>
            ) : (
              chronologicalMessages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.direction === "outbound"
                      ? "ml-auto flex max-w-[78%] flex-col gap-1"
                      : "mr-auto flex max-w-[78%] flex-col gap-1"
                  }
                >
                  <span
                    className="block rounded-[var(--yzi-radius-md)] px-3.5 py-2.5 text-[0.82rem] leading-relaxed text-[var(--yzi-text-primary)]"
                    style={
                      message.direction === "outbound"
                        ? {
                            borderRadius:
                              "var(--yzi-radius-md) var(--yzi-radius-md) 4px var(--yzi-radius-md)",
                            border: "1px solid rgba(var(--imob-ice), 0.32)",
                            backgroundColor: "rgba(var(--imob-cold), 0.14)",
                          }
                        : {
                            borderRadius:
                              "var(--yzi-radius-md) var(--yzi-radius-md) var(--yzi-radius-md) 4px",
                            border: "1px solid var(--yzi-border-subtle)",
                            backgroundColor: "var(--yzi-bg-deep)",
                          }
                    }
                  >
                    {message.body}
                  </span>
                  <span
                    className={
                      message.direction === "outbound"
                        ? "self-end text-[0.6rem] text-[var(--yzi-text-faint)]"
                        : "self-start text-[0.6rem] text-[var(--yzi-text-faint)]"
                    }
                  >
                    {SENDER_LABEL[message.senderType] ?? message.senderType} ·{" "}
                    {DIRECTION_LABEL[message.direction] ?? message.direction} ·{" "}
                    {formatTimestamp(message.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-[var(--yzi-radius-lg)] border border-dashed border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-3">
            <p className="text-[0.76rem] leading-relaxed text-[var(--yzi-text-faint)]">
              Envio de mensagem está fora do escopo desta entrega. Nenhum composer ativo nesta tela —
              nenhuma mensagem é enviada por aqui.
            </p>
          </div>
        </div>

        {/* Dados reais do lead e da conversation */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4">
            <h2 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
              {isExternalContact ? "Contato" : "Dados do lead"}
            </h2>
            {isExternalContact ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <WorkspaceField label="Tipo" value="Contato externo" readOnly />
                <WorkspaceField label="Qualificação" value="Ainda não qualificado como lead" readOnly />
                <WorkspaceField label="Canal" value={channelLabel} readOnly />
                <WorkspaceField
                  label="Identidade"
                  value={conversation.externalIdentityMasked ?? "Identidade externa indisponível"}
                  readOnly
                />
              </div>
            ) : lead ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <WorkspaceField label="Nome" value={lead.full_name} readOnly />
                <WorkspaceField label="ID do lead" value={lead.id} readOnly />
                <WorkspaceField label="Telefone" value={lead.phone || "Não informado"} readOnly />
                <WorkspaceField label="Email" value={lead.email || "Não informado"} readOnly />
              </div>
            ) : (
              <p className="text-[0.8rem] text-[var(--yzi-text-secondary)]">
                O lead vinculado a esta conversation não foi encontrado neste tenant.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4">
            <h2 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
              Dados da conversation
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <WorkspaceField label="ID" value={conversation.id} readOnly />
              <WorkspaceField
                label="Canal"
                value={channelLabel}
                readOnly
              />
              <WorkspaceField
                label="Status"
                value={STATUS_LABEL[conversation.status] ?? conversation.status}
                readOnly
              />
              <WorkspaceField label="Iniciada em" value={formatTimestamp(conversation.startedAt)} readOnly />
              <WorkspaceField
                label="Última mensagem"
                value={conversation.lastMessageAt ? formatTimestamp(conversation.lastMessageAt) : "Sem mensagens"}
                readOnly
              />
            </div>
          </div>

          <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
            {isExternalContact
              ? "Dados reais, tenant-scoped. Este contato externo não é tratado como lead: ficha, score, temperatura, imóvel, corretor, pipeline, proposta e visita permanecem indisponíveis nesta unidade."
              : "Dados reais, tenant-scoped. Estágio de qualificação, agenda, corretor vinculado e ações manuais não estão disponíveis nesta tela: dependem de campos que ainda não existem no schema atual e não foram inventados aqui."}
          </p>
        </div>
      </section>
    </div>
  );
}

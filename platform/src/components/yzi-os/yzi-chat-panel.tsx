"use client";

import { useState, useTransition } from "react";

import {
  YziAlert,
  YziButton,
  YziPanel,
  YziStatusBadge,
} from "@/components/yzi-os/yzi-primitives";
import {
  sendYziUserChatMessageAction,
  startYziChatSessionAction,
} from "@/lib/yzi-os/actions";
import type { YziChatMessage } from "@/lib/yzi-os/types";

const PENDING_RESPONSE_NOTICE =
  "Mensagem registrada. Resposta da YZI indisponível nesta fase.";

export function YziChatPanel({ tenantId }: { tenantId: string }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<YziChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleStart() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await startYziChatSessionAction({ tenantId });
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setSessionId(result.session.id);
      setNotice("Sessão iniciada.");
    });
  }

  function handleSend() {
    setError(null);
    const content = draft.trim();
    if (!content) {
      setError("Escreva uma mensagem antes de enviar.");
      return;
    }
    if (!sessionId) {
      setError("Inicie uma conversa antes de enviar a mensagem.");
      return;
    }
    startTransition(async () => {
      const result = await sendYziUserChatMessageAction({
        tenantId,
        sessionId,
        content,
      });
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setMessages((prev) => [...prev, result.message]);
      setDraft("");
      setNotice(PENDING_RESPONSE_NOTICE);
    });
  }

  return (
    <YziPanel variant="presence" className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--yzi-accent-action)]">
            Conversa com a YZI · real
          </h2>
          <p className="text-xs text-[var(--yzi-text-faint)]">
            Registra mensagens reais. A YZI ainda não responde nesta fase.
          </p>
        </div>
        <YziStatusBadge tone={sessionId ? "action" : "preview"}>
          {sessionId ? "sessão ativa" : "sem sessão"}
        </YziStatusBadge>
      </div>

      {messages.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <li
              key={message.id ?? `local-${index}`}
              className="flex flex-col gap-1 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-3"
            >
              <span className="text-[0.65rem] uppercase tracking-wide text-[var(--yzi-text-faint)]">
                Você
                {message.createdAt ? ` · ${message.createdAt}` : ""}
              </span>
              <p className="text-sm text-[var(--yzi-text-primary)]">
                {message.content}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="yzi-chat-input" className="sr-only">
          Mensagem para a YZI
        </label>
        <textarea
          id="yzi-chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          placeholder={
            sessionId
              ? "Escreva sua mensagem…"
              : "Inicie a conversa para registrar mensagens."
          }
          disabled={pending}
          className="w-full resize-y rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-2 text-sm text-[var(--yzi-text-primary)] placeholder:text-[var(--yzi-text-faint)] focus:border-[color:rgba(63,224,197,0.42)] focus:outline-none disabled:opacity-60"
        />

        <div className="flex flex-wrap items-center gap-3">
          {sessionId ? (
            <YziButton
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSend}
              disabled={pending}
            >
              {pending ? "Registrando…" : "Enviar mensagem"}
            </YziButton>
          ) : (
            <YziButton
              type="button"
              variant="authorization"
              size="sm"
              onClick={handleStart}
              disabled={pending}
            >
              {pending ? "Iniciando…" : "Iniciar conversa"}
            </YziButton>
          )}
          <span className="text-[0.65rem] text-[var(--yzi-text-faint)]">
            Execução externa, automação e consumo de crédito desabilitados.
          </span>
        </div>
      </div>

      {notice ? <YziAlert tone="info">{notice}</YziAlert> : null}

      {error ? <YziAlert tone="risk">{error}</YziAlert> : null}
    </YziPanel>
  );
}

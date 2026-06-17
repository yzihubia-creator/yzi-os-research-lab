"use client";

import { useState, useTransition } from "react";

import {
  sendYziUserChatMessageAction,
  startYziChatSessionAction,
} from "@/lib/yzi-os/actions";
import type { YziChatMessage } from "@/lib/yzi-os/types";

// Chat mínimo REAL do cockpit (Client Component). Cria a sessão e registra a
// mensagem do usuário via Server Actions → RPCs seguras (RLS, sem service role,
// sem SQL, sem MCP). HONESTIDADE OBRIGATÓRIA: a YZI ainda NÃO responde — nada é
// sintetizado como se fosse IA real. Nenhum efeito externo, nenhum consumo de
// crédito. Apenas a mensagem persistida do próprio usuário aparece na tela.

const PENDING_RESPONSE_NOTICE =
  "Mensagem registrada. A resposta da YZI ainda não está habilitada nesta fase.";

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
      setNotice("Sessão de conversa iniciada (modo decidir).");
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
    <section className="flex flex-col gap-4 rounded-xl border border-indigo-400/30 bg-indigo-400/[0.04] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-300">
            Conversa com a YZI · real
          </h2>
          <p className="text-xs text-zinc-500">
            Cria sessão e registra sua mensagem no backend via RPC segura (RLS).
            A YZI ainda não responde nesta fase.
          </p>
        </div>
        <span className="rounded-full border border-indigo-400/30 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-indigo-300/80">
          {sessionId ? "sessão ativa" : "sem sessão"}
        </span>
      </div>

      {/* Mensagens já registradas (somente do usuário — a YZI não responde). */}
      {messages.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <li
              key={message.id ?? `local-${index}`}
              className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-3"
            >
              <span className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
                Você
                {message.createdAt ? ` · ${message.createdAt}` : ""}
              </span>
              <p className="text-sm text-zinc-200">{message.content}</p>
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
          className="w-full resize-y rounded-lg border border-white/15 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-400/50 focus:outline-none disabled:opacity-60"
        />

        <div className="flex flex-wrap items-center gap-3">
          {sessionId ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={pending}
              className="rounded-md bg-indigo-400/90 px-3 py-1.5 text-xs font-medium text-zinc-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Registrando…" : "Enviar mensagem"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              disabled={pending}
              className="rounded-md border border-indigo-400/40 px-3 py-1.5 text-xs font-medium text-indigo-200 transition-colors hover:border-indigo-400/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Iniciando…" : "Iniciar conversa"}
            </button>
          )}
          <span className="text-[0.65rem] text-zinc-500">
            Execução externa, automação e consumo de crédito desabilitados.
          </span>
        </div>
      </div>

      {notice ? (
        <p className="rounded-lg border border-indigo-400/20 bg-indigo-400/[0.04] px-3 py-2 text-xs text-indigo-200/90">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-400/30 bg-amber-400/[0.05] px-3 py-2 text-xs text-amber-300"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}

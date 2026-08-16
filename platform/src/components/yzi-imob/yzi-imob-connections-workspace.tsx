"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { CSSProperties, FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  bindMetricoolAccountAction,
  configureMetricoolConnectionAction,
  discoverMetricoolAccountsAction,
  requestMetricoolValidationAction,
  runConnectionCommandAction,
  startCanvaMcpAuthorizationAction,
  startMetricoolMcpAuthorizationAction,
} from "@/app/cockpit/yzi-imob/conexoes/actions";
import type { MetricoolAccountCandidate } from "@/app/cockpit/yzi-imob/conexoes/action-types";
import type {
  ConnectionHumanStatus,
  ConnectionsViewModel,
  ConnectionViewModelItem,
} from "@/lib/yzi-imob/connections/public-view-model";
import {
  ANNOUNCED_PROVIDERS,
  CONNECTION_ORDER,
  providerFor,
  type AnnouncedProvider,
  type ConnectionProviderIdentity,
} from "@/components/yzi-imob/connections/yzi-imob-connection-providers";
import {
  SurfaceCanvas,
  SurfaceHeader,
  SurfaceState,
  TYPE,
  cx,
  toneColor,
  type SurfaceTone,
} from "@/components/yzi-imob/yzi-imob-surface-kit";

// Conexões — "o que está conectado e onde eu clico para conectar o que falta?".
//
// Regra desta superfície: clicar em conectar ABRE a autorização sobre a tela.
// Nunca é apenas uma troca de texto dentro do card. A tela de Conexões
// permanece atrás; o estado do card só muda quando o servidor confirma.
//
// Dois caminhos reais, escolhidos pelo que o backend do serviço realmente usa:
//
//   1. OAuth externo  → janela do provedor aberta no gesto do clique e
//      navegada quando a action devolve a URL de autorização. O retorno chega
//      por `postMessage` de mesma origem.
//   2. O provedor social principal também usa a janela externa; o servidor
//      resolve o protocolo MCP, autorização, discovery e health.
//
// Nenhum caminho marca conexão como ativa por conta própria: ao terminar, a
// tela relê o estado do servidor.

type AuthorizationCallbackStatus =
  | "success"
  | "cancelled"
  | "expired"
  | "invalid_state"
  | "provider_error"
  | "internal_error";

type ConnectionsWorkspaceProps = {
  viewModel: ConnectionsViewModel;
  authorizationCallbackStatus?: AuthorizationCallbackStatus | null;
  /** Nome real da operação ativa. Ausente = não exibido; nunca inventado. */
  operationName?: string | null;
};

/** Entrada visual da conexão social principal. */
const METRICOOL_CONNECTION_ID = "publicacao-social";
const CANVA_CONNECTION_ID = "canva";

/** Conexões sem nenhuma autorização implementada no servidor hoje. */
const CONNECTIONS_WITHOUT_AUTH: Record<string, string> = {
  "producao-criativa-complementar":
    "A conta externa conhecida ainda não possui autenticação configurada no projeto.",
};

/* ------------------------------------------------------------------ */
/* Janela de autorização                                               */
/* ------------------------------------------------------------------ */

const AUTH_MESSAGE_TYPE = "yzi-connection-auth-complete";
const AUTH_WINDOW_FEATURES = "popup=yes,width=620,height=760,resizable=yes,scrollbars=yes";

const AUTH_WINDOW_BLOCKED_MESSAGE =
  "O navegador bloqueou a janela de autorização. Permita pop-ups para este site e tente novamente.";
const AUTH_WINDOW_LOST_MESSAGE =
  "A janela de autorização foi fechada antes de abrir. Tente novamente.";

const AUTH_WINDOW_PLACEHOLDER =
  '<!doctype html><meta charset="utf-8"><title>Autorização</title>' +
  '<body style="margin:0;display:grid;place-items:center;height:100vh;' +
  'background:#0b0f14;color:#9fb0c4;font:500 14px/1.5 system-ui,sans-serif">' +
  "Abrindo autorização…</body>";

/** Só o host. Nunca querystring, state, client_id ou PKCE. */
function authorizationHostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

type AuthCompleteMessage = {
  type: typeof AUTH_MESSAGE_TYPE;
  provider: string;
  status: string;
};

function isAuthCompleteMessage(value: unknown): value is AuthCompleteMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    message.type === AUTH_MESSAGE_TYPE &&
    typeof message.provider === "string" &&
    typeof message.status === "string"
  );
}

/**
 * A janela precisa nascer no próprio gesto do clique, senão o navegador a
 * bloqueia. Por isso ela abre vazia primeiro e só depois é navegada para a URL
 * que a action do servidor devolveu — o componente nunca conhece a URL do
 * provedor.
 */
function useAuthWindow(provider: string) {
  const windowRef = useRef<Window | null>(null);

  const openBlank = useCallback(() => {
    // A URL precisa ser "about:blank" explícito, não string vazia: com string
    // vazia o navegador reaproveita uma janela de mesmo nome SEM navegá-la, e
    // uma tentativa anterior parada no provedor volta cross-origin — aí
    // escrever o placeholder estoura SecurityError e o clique morre calado.
    let authWindow: Window | null = null;
    try {
      authWindow = window.open("about:blank", `yzi-${provider}-auth`, AUTH_WINDOW_FEATURES);
    } catch {
      authWindow = null;
    }
    windowRef.current = authWindow;
    if (!authWindow || authWindow.closed) return null;

    try {
      // Placeholder de mesma origem: evita a janela branca vazia enquanto o
      // servidor gera a URL. Sem dado dinâmico, sem interpolação.
      authWindow.document.write(AUTH_WINDOW_PLACEHOLDER);
      authWindow.document.close();
    } catch {
      // Conforto visual nunca pode impedir a navegação: segue sem placeholder.
    }
    return authWindow;
  }, [provider]);

  /** `true` só quando a janela existe e a navegação foi de fato executada. */
  const navigateTo = useCallback((url: string) => {
    const authWindow = windowRef.current;
    if (!authWindow || authWindow.closed) return false;
    try {
      authWindow.location.replace(url);
      authWindow.focus();
      return true;
    } catch {
      return false;
    }
  }, []);

  const close = useCallback(() => {
    const authWindow = windowRef.current;
    if (authWindow && !authWindow.closed) authWindow.close();
    windowRef.current = null;
  }, []);

  return { openBlank, navigateTo, close };
}

/* ------------------------------------------------------------------ */
/* Leitura de estado                                                   */
/* ------------------------------------------------------------------ */

type CardShape =
  | "connect"
  | "connected"
  | "attention"
  | "progress"
  /** Existe na operação, mas a conexão não é iniciada por esta tela. */
  | "offline"
  /** Não faz parte do produto hoje. Nem botão, nem promessa. */
  | "unavailable";

type CardState = {
  shape: CardShape;
  tone: SurfaceTone;
  /** Frase curta de estado. Vazia quando o botão já diz tudo. */
  stateLabel: string | null;
};

const SETUP_ELSEWHERE_REASON =
  "Esta conexão é liberada durante a implantação da operação, fora desta tela.";

function readCardState(item: ConnectionViewModelItem): CardState {
  if (item.aguardandoVerificacaoExterna) {
    return { shape: "attention", tone: "pending", stateLabel: "Aguardando verificação" };
  }

  // Uma ação que o servidor não consegue concluir não vira botão: ela vira a
  // afordância desativada com o motivo real.
  const canOpenAuthorization =
    item.podeConfigurar && !(item.id in CONNECTIONS_WITHOUT_AUTH);

  const status: ConnectionHumanStatus = item.status;

  switch (status) {
    case "Ativo":
      return { shape: "connected", tone: "ok", stateLabel: "Conectado" };
    case "Conectando":
      return { shape: "progress", tone: "pending", stateLabel: "Validando conexão…" };
    case "Aguardando autorização":
      return canOpenAuthorization
        ? { shape: "connect", tone: "pending", stateLabel: null }
        : { shape: "progress", tone: "pending", stateLabel: "Aguardando autorização" };
    case "Autorização expirada":
      return canOpenAuthorization
        ? { shape: "attention", tone: "attention", stateLabel: "Autorização necessária" }
        : { shape: "attention", tone: "attention", stateLabel: "Autorização expirada" };
    case "Precisa de atenção":
      return canOpenAuthorization
        ? { shape: "attention", tone: "attention", stateLabel: "Autorização necessária" }
        : { shape: "attention", tone: "attention", stateLabel: "Precisa de atenção" };
    case "Indisponível":
      return { shape: "unavailable", tone: "idle", stateLabel: "Ainda não faz parte do produto" };
    case "Não conectado":
      return canOpenAuthorization
        ? { shape: "connect", tone: "idle", stateLabel: null }
        : { shape: "offline", tone: "idle", stateLabel: null };
  }
}

/** Rótulo da ação principal — verbo humano, nunca nome de estado interno. */
function connectLabel(item: ConnectionViewModelItem, serviceName: string): string {
  if (item.id === METRICOOL_CONNECTION_ID && item.status !== "Ativo") return `Conectar ${serviceName}`;
  switch (item.status) {
    case "Aguardando autorização":
      return "Continuar autorização";
    case "Autorização expirada":
    case "Precisa de atenção":
      return "Reconectar";
    default:
      return `Conectar ${serviceName}`;
  }
}

function displayDate(value: string | null): string {
  if (!value) return "Ainda não verificada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Ainda não verificada";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function initialsOf(value: string): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "—";
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

function callbackNotice(
  status: AuthorizationCallbackStatus | null | undefined,
): { tone: SurfaceTone; title: string; body: string } | null {
  switch (status) {
    case "success":
      return {
        tone: "ok",
        title: "Autorização concluída",
        body: "O estado abaixo já reflete a autorização que você acabou de conceder.",
      };
    case "cancelled":
      return {
        tone: "idle",
        title: "Autorização cancelada",
        body: "Nada foi alterado. Você pode recomeçar quando quiser.",
      };
    case "expired":
      return {
        tone: "pending",
        title: "A autorização expirou antes de concluir",
        body: "O tempo para concluir acabou. Comece o processo novamente.",
      };
    case "invalid_state":
      return {
        tone: "pending",
        title: "Esta autorização não é mais válida",
        body: "Ela já foi usada ou expirou. Comece o processo novamente.",
      };
    case "provider_error":
    case "internal_error":
      return {
        tone: "attention",
        title: "Não foi possível concluir a autorização",
        body: "Nada foi alterado na sua operação. Tente novamente em alguns minutos.",
      };
    case null:
    case undefined:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Peças do card                                                       */
/* ------------------------------------------------------------------ */

/** A ação domina o card: um único bloco, sempre da mesma altura. */
const ACTION_BLOCK =
  "flex h-[3.25rem] w-full items-center justify-between gap-3 rounded-[10px] border px-3.5 text-[0.8rem]";

function ProviderBadge({
  provider,
  muted = false,
}: {
  provider: ConnectionProviderIdentity;
  muted?: boolean;
}) {
  return (
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border"
      style={{
        borderColor: `rgba(${provider.rgb}, ${muted ? 0.16 : 0.3})`,
        backgroundColor: `rgba(${provider.rgb}, ${muted ? 0.05 : 0.11})`,
        color: `rgba(${provider.rgb}, ${muted ? 0.5 : 0.96})`,
      }}
    >
      <provider.Mark className="h-[18px] w-[18px]" />
    </span>
  );
}

function AccountAvatar({ label }: { label: string }) {
  return (
    <span
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)] text-[0.6rem] font-semibold tracking-[0.02em] text-[var(--yzi-text-secondary)]"
      aria-hidden
    >
      {initialsOf(label)}
    </span>
  );
}

/**
 * A ação que o serviço terá — visível, desativada e com o motivo real. Melhor
 * que esconder o serviço: o gestor vê que ele existe e por que ainda não pode
 * clicar, sem nenhum retorno falso de sucesso.
 */
function UnavailableConnect({
  provider,
  reason,
}: {
  provider: ConnectionProviderIdentity;
  reason: string;
}) {
  return (
    <span
      aria-disabled
      title={reason}
      className={cx(
        ACTION_BLOCK,
        "cursor-not-allowed border-dashed border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-faint)]",
      )}
    >
      <span className="truncate">Conectar {provider.serviceName}</span>
      <span className="sr-only"> — {reason}</span>
      <provider.Mark className="h-[18px] w-[18px] shrink-0 opacity-40" />
    </span>
  );
}

/** Menu discreto: comandos secundários e o detalhe técnico, sob demanda. */
function ConnectionMenu({
  item,
  disabled,
  onCommand,
}: {
  item: ConnectionViewModelItem;
  disabled: boolean;
  onCommand: (command: "test" | "disconnect") => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const panelId = `conexao-${item.id}-detalhes`;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={cx(
          "grid h-7 w-7 place-items-center rounded-[var(--yzi-radius-sm)] text-[var(--yzi-text-faint)] transition-colors duration-[var(--duration-fast)]",
          "hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)]",
          open && "bg-[var(--yzi-surface-elevated)] text-[var(--yzi-text-primary)]",
        )}
      >
        <span className="sr-only">Gerenciar {item.nome}</span>
        <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden focusable="false">
          <circle cx="4.5" cy="10" r="1.35" fill="currentColor" />
          <circle cx="10" cy="10" r="1.35" fill="currentColor" />
          <circle cx="15.5" cy="10" r="1.35" fill="currentColor" />
        </svg>
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={`Detalhes de ${item.nome}`}
          className="absolute right-0 top-[calc(100%+0.4rem)] z-30 flex w-[17.5rem] flex-col gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-elevated)] p-3 shadow-[0_18px_44px_-24px_rgba(0,0,0,0.85)]"
        >
          {item.podeTestar || item.podeDesconectar ? (
            <div className="flex flex-col">
              {item.podeTestar ? (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setOpen(false);
                    onCommand("test");
                  }}
                  className="rounded-[var(--yzi-radius-sm)] px-2 py-1.5 text-left text-[0.75rem] text-[var(--yzi-text-secondary)] transition-colors hover:bg-[var(--yzi-surface-base)] hover:text-[var(--yzi-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Verificar conexão
                </button>
              ) : null}
              {item.podeDesconectar ? (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setOpen(false);
                    onCommand("disconnect");
                  }}
                  className="rounded-[var(--yzi-radius-sm)] px-2 py-1.5 text-left text-[0.75rem] transition-colors hover:bg-[var(--yzi-surface-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ color: toneColor("blocked", 0.95) }}
                >
                  Remover conexão
                </button>
              ) : null}
            </div>
          ) : null}

          <dl className="flex flex-col gap-2.5 border-t border-[color:var(--yzi-border-subtle)] pt-3">
            <div className="flex flex-col gap-1">
              <dt className={TYPE.label}>Para que serve</dt>
              <dd className={TYPE.body}>{item.finalidade}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className={TYPE.label}>Situação</dt>
              <dd className={TYPE.body}>{item.resumo}</dd>
            </div>
            {item.capabilitiesDisponiveis.length ? (
              <div className="flex flex-col gap-1">
                <dt className={TYPE.label}>Já liberado</dt>
                <dd className={TYPE.body}>{item.capabilitiesDisponiveis.join(" · ")}</dd>
              </div>
            ) : null}
            {item.incidentesHumanos.length ? (
              <div className="flex flex-col gap-1">
                <dt className={TYPE.label}>Pontos de atenção</dt>
                <dd className={cx(TYPE.body, "flex flex-col gap-0.5")}>
                  {item.incidentesHumanos.map((incident) => (
                    <span key={incident}>{incident}</span>
                  ))}
                </dd>
              </div>
            ) : null}
            {item.proximaAcao ? (
              <div className="flex flex-col gap-1">
                <dt className={TYPE.label}>Próximo passo</dt>
                <dd className={TYPE.body}>{item.proximaAcao}</dd>
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <dt className={TYPE.label}>Última verificação</dt>
              <dd className={TYPE.meta}>{displayDate(item.ultimaVerificacao)}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Caminho API avançado preservado, sem entrada no card do MVP         */
/* ------------------------------------------------------------------ */

type MetricoolStep = "credential" | "account" | "validating";

/**
 * UI legada preservada apenas para o futuro metricool_api_advanced_path.
 * Não é montada nem chamada pelo fluxo principal do card.
 */
function MetricoolAuthDialog({
  serviceName,
  onClose,
  onConnected,
}: {
  serviceName: string;
  onClose: () => void;
  onConnected: () => void;
}) {
  const [step, setStep] = useState<MetricoolStep>("credential");
  const [token, setToken] = useState("");
  const [accounts, setAccounts] = useState<readonly MetricoolAccountCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const tokenRef = useRef<HTMLInputElement | null>(null);
  const titleId = "metricool-auth-titulo";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (step === "credential") tokenRef.current?.focus();
    else panelRef.current?.focus();
  }, [step]);

  async function loadAccounts() {
    setIsBusy(true);
    const discovery = await discoverMetricoolAccountsAction();
    setIsBusy(false);

    if (discovery.status === "error") {
      setError(
        discovery.code === "access_denied"
          ? "Sua conta não pode concluir esta configuração."
          : "Não foi possível listar as contas agora. Nada foi alterado.",
      );
      return;
    }
    if (!discovery.accounts.length) {
      setError("Nenhuma conta foi encontrada para esta credencial.");
      setAccounts([]);
      return;
    }
    setError(null);
    setAccounts(discovery.accounts);
  }

  async function submitCredential(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsBusy(true);
    const result = await configureMetricoolConnectionAction(token);
    setIsBusy(false);

    if (result.status === "error") {
      setError(
        result.code === "access_denied"
          ? "Sua conta não pode configurar esta conexão."
          : result.code === "configuration_required"
            ? "Esta credencial não foi aceita. Confira e tente novamente."
            : "Não foi possível concluir. Nada foi alterado na sua operação.",
      );
      return;
    }

    setToken("");
    setStep("account");
    await loadAccounts();
  }

  async function selectAccount(account: MetricoolAccountCandidate) {
    setError(null);
    setIsBusy(true);

    const bound = await bindMetricoolAccountAction({
      externalUserId: account.externalUserId,
      externalBlogId: account.externalBlogId,
    });
    if (bound.status === "error") {
      setIsBusy(false);
      setError(
        bound.code === "access_denied"
          ? "Sua conta não pode concluir esta configuração."
          : "Não foi possível vincular esta conta. Nada foi alterado.",
      );
      return;
    }

    setStep("validating");
    const validated = await requestMetricoolValidationAction();
    setIsBusy(false);

    if (validated.status === "error") {
      setStep("account");
      setError("A validação não pôde ser iniciada agora. Tente novamente.");
      return;
    }

    // O card não é marcado como conectado aqui: a tela relê o servidor.
    onConnected();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[rgba(4,8,13,0.74)] backdrop-blur-[3px]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex w-full max-w-[26rem] flex-col gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-elevated)] p-5 shadow-[0_32px_80px_-32px_rgba(0,0,0,0.9)] focus-visible:outline-none"
      >
        <div className="flex flex-col gap-1">
          <h2
            id={titleId}
            className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]"
          >
            Conectar {serviceName}
          </h2>
          <p className={TYPE.body}>
            {step === "credential"
              ? "Cole a chave de API da conta que a operação usa. Ela é guardada com segurança e nunca volta para a tela."
              : step === "account"
                ? "Escolha a conta que o YZI IMOB vai operar."
                : "Validando a conexão com o serviço."}
          </p>
        </div>

        {step === "credential" ? (
          <form onSubmit={submitCredential} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={TYPE.label}>Chave de API</span>
              <input
                ref={tokenRef}
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                required
                minLength={8}
                className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2 text-[0.8rem] text-[var(--yzi-text-primary)] placeholder:text-[var(--yzi-text-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)]"
                placeholder="Chave de API do serviço"
              />
            </label>

            {error ? (
              <p role="alert" className={TYPE.body} style={{ color: toneColor("attention", 0.97) }}>
                {error}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3.5 py-2 text-[0.75rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isBusy || token.trim().length < 8}
                className="rounded-[var(--yzi-radius-sm)] border border-[color:rgba(var(--imob-ice),0.3)] bg-[rgba(var(--imob-cold),0.16)] px-3.5 py-2 text-[0.75rem] font-semibold text-[rgb(var(--imob-ice))] transition-colors hover:bg-[rgba(var(--imob-cold),0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBusy ? "Enviando…" : "Continuar"}
              </button>
            </div>
          </form>
        ) : null}

        {step === "account" ? (
          <div className="flex flex-col gap-3">
            {isBusy && !accounts.length ? (
              <p className={TYPE.body} aria-live="polite">
                Procurando contas disponíveis…
              </p>
            ) : null}

            {accounts.length ? (
              <ul className="flex max-h-[15rem] flex-col gap-1.5 overflow-y-auto">
                {accounts.map((account) => (
                  <li key={`${account.externalUserId}:${account.externalBlogId}`}>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => selectAccount(account)}
                      className="flex w-full items-center gap-2.5 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2.5 text-left transition-colors hover:border-[color:var(--yzi-border-strong)] hover:bg-[var(--yzi-surface-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <AccountAvatar label={account.displayName} />
                      <span className="min-w-0 truncate text-[0.78rem] text-[var(--yzi-text-primary)]">
                        {account.displayName}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {error ? (
              <p role="alert" className={TYPE.body} style={{ color: toneColor("attention", 0.97) }}>
                {error}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={loadAccounts}
                className="rounded-[var(--yzi-radius-sm)] px-2 py-2 text-[0.75rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Procurar de novo
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3.5 py-2 text-[0.75rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)]"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : null}

        {step === "validating" ? (
          <p className={TYPE.body} aria-live="polite">
            Validando conexão…
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card de conexão                                                     */
/* ------------------------------------------------------------------ */

function ConnectionCard({ item }: { item: ConnectionViewModelItem }) {
  const router = useRouter();
  const provider = providerFor(item.id);
  const authWindow = useAuthWindow(item.id);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const connectRef = useRef<HTMLButtonElement | null>(null);

  const state = readCardState(item);
  const hasMenu = item.podeTestar || item.podeDesconectar || item.status !== "Indisponível";

  /**
   * Início da autorização. A janela abre AQUI, no gesto do clique; a URL vem
   * depois, da action do servidor. Metricool não usa OAuth: abre o diálogo
   * próprio, também sobre a tela.
   */
  function startAuthorization() {
    setMessage(null);

    // A janela nasce ANTES de qualquer await, no próprio gesto do clique.
    const popup = authWindow.openBlank();
    if (!popup) {
      // Bloqueio de pop-up é um fato, não um detalhe: a tela precisa dizer.
      setMessage(AUTH_WINDOW_BLOCKED_MESSAGE);
      return;
    }

    startTransition(async () => {
      try {
        const result = item.id === METRICOOL_CONNECTION_ID
          ? await startMetricoolMcpAuthorizationAction()
          : item.id === CANVA_CONNECTION_ID
            ? await startCanvaMcpAuthorizationAction()
            : await runConnectionCommandAction({ connectionId: item.id, command: "configure" });

        if (
          process.env.NODE_ENV !== "production" &&
          item.id === METRICOOL_CONNECTION_ID
        ) {
          console.log("[Metricool MCP RESULT]", {
            status: result?.status ?? null,
            code: "code" in result ? result.code : null,
            connectionStatus:
              "connectionStatus" in result ? result.connectionStatus : null,
            hasAuthorizationUrl:
              "authorizationUrl" in result &&
              typeof result.authorizationUrl === "string" &&
              result.authorizationUrl.length > 0,
            authorizationHost:
              "authorizationUrl" in result &&
              typeof result.authorizationUrl === "string"
                ? new URL(result.authorizationUrl).host
                : null,
          });
        }

        if (result.status === "ok" && result.authorizationUrl) {
          const navigationAttempted = authWindow.navigateTo(result.authorizationUrl);
          if (process.env.NODE_ENV !== "production" && item.id === METRICOOL_CONNECTION_ID) {
            console.log("[Metricool MCP NAVIGATION]", {
              navigationAttempted,
              authorizationHost: authorizationHostOf(result.authorizationUrl),
            });
          }
          if (navigationAttempted) return;
          authWindow.close();
          setMessage(AUTH_WINDOW_LOST_MESSAGE);
          return;
        }

        authWindow.close();
        setMessage(
          result.status === "error" && result.code === "configuration_required"
            ? "Esta conexão ainda depende de uma liberação que não está do seu lado."
            : result.status === "error" && result.code === "access_denied"
              ? "Sua sessão não pode abrir esta autorização."
              : "Não foi possível abrir a autorização. Nada foi alterado na sua operação.",
        );
      } catch (error) {
        authWindow.close();
        if (process.env.NODE_ENV !== "production") {
          console.error("[Metricool MCP client failure]", {
            name: error instanceof Error ? error.name : "Unknown",
          });
        }
        setMessage("Não foi possível abrir a autorização. Nada foi alterado na sua operação.");
      }
    });
  }

  function runSecondary(command: "test" | "disconnect") {
    setMessage(null);
    startTransition(async () => {
      const result = await runConnectionCommandAction({ connectionId: item.id, command });

      if (result.status === "ok") {
        setMessage(
          command === "test"
            ? "Verificação em andamento. O estado se atualiza em instantes."
            : "Conexão removida da sua operação.",
        );
        router.refresh();
        return;
      }

      setMessage(
        result.code === "configuration_required"
          ? "Esta conexão ainda depende de uma liberação que não está do seu lado."
          : "Não foi possível concluir. Nada foi alterado na sua operação.",
      );
    });
  }

  const brandStyle = {
    "--pv-line": `rgba(${provider.rgb}, 0.34)`,
    "--pv-soft": `rgba(${provider.rgb}, 0.13)`,
    "--pv-strong": `rgba(${provider.rgb}, 0.22)`,
    "--pv-text": `rgba(${provider.rgb}, 0.97)`,
  } as CSSProperties;

  return (
    <article className="flex flex-col gap-3.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 shadow-[var(--yzi-edge-highlight)]">
      <div className="flex items-start gap-3">
        <ProviderBadge provider={provider} muted={state.shape === "unavailable"} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-[0.84rem] font-medium text-[var(--yzi-text-primary)]">
            {provider.serviceName}
          </h3>
          <p className="truncate text-[0.66rem] leading-relaxed text-[var(--yzi-text-faint)]">
            {item.nome}
          </p>
        </div>
        {hasMenu ? (
          <ConnectionMenu item={item} disabled={isPending} onCommand={runSecondary} />
        ) : null}
      </div>

      {state.shape === "connect" ? (
        <button
          ref={connectRef}
          type="button"
          disabled={isPending}
          onClick={startAuthorization}
          style={brandStyle}
          className={cx(
            ACTION_BLOCK,
            "border-[color:var(--pv-line)] bg-[var(--pv-soft)] font-semibold text-[color:var(--pv-text)]",
            "transition-[background-color,border-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
            "hover:bg-[var(--pv-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--yzi-bg-base)]",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          <span className="truncate">
            {isPending ? "Abrindo autorização…" : connectLabel(item, provider.serviceName)}
          </span>
          <provider.Mark className="h-[18px] w-[18px] shrink-0 opacity-70" />
        </button>
      ) : null}

      {state.shape === "connected" ? (
        <div
          className={cx(
            ACTION_BLOCK,
            "border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-elevated)]",
          )}
        >
          {item.contaConectada ? (
            <span className="flex min-w-0 items-center gap-2.5">
              <AccountAvatar label={item.contaConectada} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[0.78rem] text-[var(--yzi-text-primary)]">
                  {item.contaConectada}
                </span>
                <span
                  className="text-[0.66rem] font-medium"
                  style={{ color: toneColor("ok", 0.95) }}
                >
                  Conectado
                </span>
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: toneColor("ok", 0.95) }}
              />
              <span className="text-[0.78rem] font-medium" style={{ color: toneColor("ok", 0.95) }}>
                Conectado
              </span>
            </span>
          )}
        </div>
      ) : null}

      {state.shape === "attention" ? (
        item.podeConfigurar && !(item.id in CONNECTIONS_WITHOUT_AUTH) ? (
          <button
            ref={connectRef}
            type="button"
            disabled={isPending}
            onClick={startAuthorization}
            className={cx(
              ACTION_BLOCK,
              "font-semibold transition-[background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(var(--imob-ice),0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--yzi-bg-base)]",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
            style={{
              borderColor: toneColor(state.tone, 0.34),
              backgroundColor: toneColor(state.tone, 0.12),
              color: toneColor(state.tone, 0.97),
            }}
          >
            <span className="flex min-w-0 flex-col items-start">
              <span className="text-[0.66rem] font-medium opacity-80">{state.stateLabel}</span>
              <span className="truncate">
                {isPending ? "Abrindo autorização…" : connectLabel(item, provider.serviceName)}
              </span>
            </span>
            <provider.Mark className="h-[18px] w-[18px] shrink-0 opacity-60" />
          </button>
        ) : (
          <div
            className={ACTION_BLOCK}
            style={{
              borderColor: toneColor(state.tone, 0.28),
              backgroundColor: toneColor(state.tone, 0.07),
            }}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: toneColor(state.tone, 0.95) }}
              />
              <span
                className="truncate text-[0.78rem] font-medium"
                style={{ color: toneColor(state.tone, 0.97) }}
              >
                {state.stateLabel}
              </span>
            </span>
          </div>
        )
      ) : null}

      {state.shape === "progress" ? (
        <div
          className={ACTION_BLOCK}
          aria-live="polite"
          style={{
            borderColor: toneColor(state.tone, 0.28),
            backgroundColor: toneColor(state.tone, 0.07),
          }}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full motion-safe:animate-pulse"
              style={{ backgroundColor: toneColor(state.tone, 0.95) }}
            />
            <span
              className="truncate text-[0.78rem] font-medium"
              style={{ color: toneColor(state.tone, 0.97) }}
            >
              {state.stateLabel}
            </span>
          </span>
        </div>
      ) : null}

      {state.shape === "offline" ? (
        <UnavailableConnect
          provider={provider}
          reason={CONNECTIONS_WITHOUT_AUTH[item.id] ?? SETUP_ELSEWHERE_REASON}
        />
      ) : null}

      {state.shape === "unavailable" ? (
        <div
          className={cx(
            ACTION_BLOCK,
            "border-dashed border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-faint)]",
          )}
        >
          <span className="truncate text-[0.76rem]">{state.stateLabel}</span>
        </div>
      ) : null}

      {message ? (
        <p role="status" aria-live="polite" className={TYPE.meta}>
          {message}
        </p>
      ) : null}

    </article>
  );
}

/** Serviço reconhecido pelo produto que ainda não tem conexão no servidor. */
function AnnouncedCard({ provider }: { provider: AnnouncedProvider }) {
  return (
    <article className="flex flex-col gap-3.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 shadow-[var(--yzi-edge-highlight)]">
      <div className="flex items-start gap-3">
        <ProviderBadge provider={provider} muted />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-[0.84rem] font-medium text-[var(--yzi-text-primary)]">
            {provider.serviceName}
          </h3>
          <p className="truncate text-[0.66rem] leading-relaxed text-[var(--yzi-text-faint)]">
            {provider.role}
          </p>
        </div>
      </div>
      <UnavailableConnect provider={provider} reason={provider.unavailableReason} />
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Superfície                                                          */
/* ------------------------------------------------------------------ */

function OperationContext({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3 shadow-[var(--yzi-edge-highlight)]">
      <AccountAvatar label={name} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className={TYPE.label}>Operação</span>
        <span className="truncate text-[0.84rem] font-medium text-[var(--yzi-text-primary)]">
          {name}
        </span>
      </div>
    </div>
  );
}

export function YziImobConnectionsWorkspace({
  viewModel,
  authorizationCallbackStatus,
  operationName,
}: ConnectionsWorkspaceProps) {
  const router = useRouter();
  const notice = callbackNotice(authorizationCallbackStatus);

  /**
   * Esta mesma tela é o destino do callback do provedor. Quando ela abre
   * DENTRO da janela de autorização, seu trabalho é só avisar a janela
   * principal — de mesma origem — e sair de cena.
   */
  useEffect(() => {
    if (!authorizationCallbackStatus) return;
    const opener = window.opener as Window | null;
    if (!opener || opener === window || opener.closed) return;

    const message: AuthCompleteMessage = {
      type: AUTH_MESSAGE_TYPE,
      provider: "meta",
      status: authorizationCallbackStatus,
    };
    opener.postMessage(message, window.location.origin);
    window.close();
  }, [authorizationCallbackStatus]);

  /**
   * Retorno da autorização. A origem é validada e o sucesso NUNCA é assumido:
   * a mensagem só dispara a releitura do estado real no servidor.
   */
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isAuthCompleteMessage(event.data)) return;
      router.refresh();
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  const items = useMemo(() => {
    if (viewModel.loadState !== "ready") return [];
    const rank = new Map(CONNECTION_ORDER.map((id, index) => [id, index]));
    return [...viewModel.items].sort(
      (left, right) =>
        (rank.get(left.id) ?? CONNECTION_ORDER.length) -
        (rank.get(right.id) ?? CONNECTION_ORDER.length),
    );
  }, [viewModel]);

  const header = (
    <SurfaceHeader
      kicker="Sistema"
      title="Conexões"
      lead="Conecte os serviços usados pela operação."
      secondaryActions={[{ label: "Ver consumo", href: "/cockpit/yzi-imob/apis-creditos" }]}
      aside={operationName ? <OperationContext name={operationName} /> : undefined}
    />
  );

  if (viewModel.loadState !== "ready") {
    const tone: SurfaceTone =
      viewModel.loadState === "empty"
        ? "idle"
        : viewModel.loadState === "no_membership" || viewModel.loadState === "no_session"
          ? "pending"
          : "attention";
    return (
      <SurfaceCanvas>
        {header}
        <SurfaceState
          tone={tone}
          title={
            viewModel.loadState === "empty"
              ? "Nenhuma conexão configurada ainda"
              : "Não foi possível ler suas conexões agora"
          }
          body={viewModel.message}
        />
      </SurfaceCanvas>
    );
  }

  return (
    <SurfaceCanvas>
      {header}

      {notice ? (
        <SurfaceState compact tone={notice.tone} title={notice.title} body={notice.body} />
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ConnectionCard key={item.id} item={item} />
        ))}
        {ANNOUNCED_PROVIDERS.map((provider) => (
          <AnnouncedCard key={provider.id} provider={provider} />
        ))}
      </div>
    </SurfaceCanvas>
  );
}

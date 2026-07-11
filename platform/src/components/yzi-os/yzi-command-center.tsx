"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { ComponentType, FormEvent, ReactNode, SVGProps } from "react";

import {
  YziAlert,
  YziButton,
  YziDivider,
  YziInput,
  YziPanel,
  YziPresence,
  YziStatusBadge,
} from "@/components/yzi-os/yzi-primitives";
import {
  ActionsIcon,
  AssetsIcon,
  AuditIcon,
  AuthorizationIcon,
  ChannelsIcon,
  CommandCenterIcon,
  DashboardIcon,
  OpportunityIcon,
  RadarIcon,
  SendIcon,
  SidebarToggleIcon,
  TrafficIcon,
  YziAssistantIcon,
} from "@/components/yzi-os/yzi-icons";
import {
  hourGreeting,
  operatorName,
  subscribeNoop,
} from "@/lib/yzi-os/hero-greeting";

// Ações rápidas do hero (contrato v1.2 §2): lideradas por job, navegando para
// superfícies reais. Nenhuma resposta simulada.
const HERO_ACTIONS: Array<{
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  { label: "Criar campanha", href: "/cockpit/trafego-pago", icon: TrafficIcon },
  {
    label: "Cadastrar imóvel",
    href: "/cockpit/yzi-imob/imoveis",
    icon: AssetsIcon,
  },
  { label: "Criar site", href: "/cockpit/yzi-imob/site", icon: CommandCenterIcon },
  { label: "Analisar operação", href: "/cockpit/dashboard", icon: DashboardIcon },
  { label: "Conectar canal", href: "/cockpit/canais", icon: ChannelsIcon },
];

type Tone = "preview" | "waiting" | "action";

const STATUS_TONE: Record<
  Tone,
  "preview" | "risk" | "action"
> = {
  preview: "preview",
  waiting: "risk",
  action: "action",
};

function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  return <YziStatusBadge tone={STATUS_TONE[tone]}>{label}</YziStatusBadge>;
}

function SurfaceCard({
  icon: Glyph,
  title,
  status,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  status?: { label: string; tone: Tone };
  children: ReactNode;
}) {
  return (
    <YziPanel variant="command" className="p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="text-[var(--yzi-text-secondary)]">
            <Glyph className="h-4.5 w-4.5" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-[var(--yzi-text-primary)]">
            {title}
          </h2>
        </div>
        {status ? <StatusPill label={status.label} tone={status.tone} /> : null}
      </div>
      {children}
    </YziPanel>
  );
}

function RailCard({
  icon: Glyph,
  title,
  children,
  variant = "default",
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  children: ReactNode;
  variant?: "default" | "authorization" | "trust";
}) {
  return (
    <YziPanel variant={variant} className="p-4">
      <div className="mb-2 flex items-center gap-2 text-[var(--yzi-text-secondary)]">
        <Glyph className="h-4 w-4" />
        <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
          {title}
        </h3>
      </div>
      {children}
    </YziPanel>
  );
}

export function YziCommandCenter({
  operatorEmail,
}: {
  operatorEmail?: string | null;
}) {
  const [auditOpen, setAuditOpen] = useState(false);
  const [ask, setAsk] = useState("");
  const router = useRouter();
  const name = operatorName(operatorEmail);

  // Saudação pela hora local do cliente sem divergir da hidratação: o servidor
  // renderiza o fallback "Olá" e o cliente resolve a hora real.
  const greeting = useSyncExternalStore(
    subscribeNoop,
    () => hourGreeting(new Date().getHours()),
    () => "Olá",
  );

  function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/cockpit/assistente");
  }

  return (
    <div className="yzi-atmosphere flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-7 px-6 pb-16 pt-10 text-center md:pt-14">
        <span
          aria-hidden
          className="relative grid h-12 w-12 place-items-center rounded-full border border-[color:rgba(63,224,197,0.28)] bg-[var(--yzi-surface-elevated)] text-[var(--yzi-accent-action)] shadow-[var(--yzi-glow-presence)]"
        >
          <YziPresence
            state="ready"
            animated
            className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5"
          />
          <YziAssistantIcon className="h-6 w-6" />
        </span>

        <div className="flex flex-col gap-2">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-[var(--yzi-text-secondary)]">
            YZI · sistema operacional
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--yzi-text-primary)] md:text-4xl">
            {greeting}
            {name ? `, ${name}` : ""}.
          </h1>
          <p className="text-lg text-[var(--yzi-text-secondary)]">
            O que vamos resolver hoje?
          </p>
        </div>

        <form onSubmit={handleAsk} className="flex w-full items-center gap-2">
          <label htmlFor="yzi-hero-ask" className="sr-only">
            Converse com a YZI sobre sua operação
          </label>
          <YziInput
            id="yzi-hero-ask"
            value={ask}
            onChange={(event) => setAsk(event.target.value)}
            placeholder="Converse com a YZI sobre sua operação..."
            variant="composer"
            className="yzi-glass-panel min-w-0 flex-1"
          />
          <YziButton
            type="submit"
            variant="primary"
            size="md"
            aria-label="Enviar para a YZI"
            title="Enviar para a YZI"
            className="h-12 w-12 shrink-0 p-0"
          >
            <SendIcon className="h-5 w-5" />
          </YziButton>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {HERO_ACTIONS.map((action) => {
            const Glyph = action.icon;
            return (
              <YziButton
                key={action.href}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push(action.href)}
              >
                <Glyph className="h-3.5 w-3.5 shrink-0" />
                {action.label}
              </YziButton>
            );
          })}
        </div>

        <p className="flex items-center gap-1.5 text-[0.68rem] text-[var(--yzi-text-faint)]">
          <AuthorizationIcon className="h-3.5 w-3.5 shrink-0 text-[var(--yzi-accent-authorization)]" />
          Preview. Ações externas exigem autorização.
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[var(--yzi-text-secondary)]">
            Operação
          </span>
          <StatusPill label="preview · sem dados reais" tone="preview" />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <SurfaceCard
            icon={CommandCenterIcon}
            title="Estado da operação"
            status={{ label: "aguardando conexão", tone: "waiting" }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="relative mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-elevated)] text-[var(--yzi-accent-action)]"
                >
                  <YziPresence
                    state="ready"
                    className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5"
                  />
                  <YziAssistantIcon className="h-5 w-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-[var(--yzi-text-primary)]">
                    YZI pronta para leitura operacional.
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
                    Conecte um canal para iniciar a leitura.
                  </p>
                </div>
              </div>

              <YziAlert tone="authorization" title="Ações externas exigem autorização." />

              <div className="flex flex-wrap items-center gap-2">
                <YziButton
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => router.push("/cockpit/canais")}
                >
                  <ChannelsIcon className="h-4 w-4" />
                  Conectar canal
                </YziButton>
                <YziButton
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => router.push("/cockpit/radar")}
                >
                  <RadarIcon className="h-4 w-4" />
                  O que a YZI vai observar
                </YziButton>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard
            icon={RadarIcon}
            title="Radar"
            status={{ label: "sem sinais", tone: "preview" }}
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full border border-[color:var(--yzi-border-subtle)]"
              >
                <span className="absolute inset-2 rounded-full border border-[color:var(--yzi-border-subtle)]" />
                <YziPresence state="ready" animated className="h-1.5 w-1.5" />
              </span>
              <p className="text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
                Sem sinais. A YZI avisa quando houver leitura confiável.
              </p>
            </div>
          </SurfaceCard>

          <SurfaceCard
            icon={OpportunityIcon}
            title="Próxima oportunidade"
            status={{ label: "preview", tone: "preview" }}
          >
            <p className="text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
              Oportunidades aparecem com razão, fit e ação.
            </p>
          </SurfaceCard>
        </div>

        <aside className="flex flex-col gap-4">
          <RailCard icon={ActionsIcon} title="Ações">
            <p className="text-sm text-[var(--yzi-text-primary)]">Nada pendente.</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
              Ações preparadas aparecem com razão e dono.
            </p>
          </RailCard>

          <RailCard
            icon={AuthorizationIcon}
            title="Autorizações"
            variant="authorization"
          >
            <p className="text-sm text-[var(--yzi-text-primary)]">
              Sem ação sensível pendente.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
              Ações externas mostram risco e impacto.
            </p>
          </RailCard>

          <YziPanel variant="trust" className="p-0">
            <button
              type="button"
              onClick={() => setAuditOpen((value) => !value)}
              aria-expanded={auditOpen}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-[var(--yzi-text-secondary)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--yzi-text-primary)]"
            >
              <span className="flex items-center gap-2">
                <AuditIcon className="h-4 w-4" />
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
                  Rastro · Auditoria
                </span>
              </span>
              <SidebarToggleIcon
                aria-hidden
                className={`h-4 w-4 transition-transform duration-[var(--duration-moderate)] ease-[var(--ease-standard)] ${
                  auditOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {auditOpen ? (
              <>
                <YziDivider />
                <p className="px-4 py-3 text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
                  Rastro disponível após execução.
                </p>
              </>
            ) : null}
          </YziPanel>
        </aside>
        </div>
      </section>
    </div>
  );
}

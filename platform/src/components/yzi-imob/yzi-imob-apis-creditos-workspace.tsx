"use client";

import type { ComponentType, SVGProps } from "react";

import {
  DEMO_CONNECTIONS,
  TRUST_PILLARS,
  type ConnectionCapability,
  type DemoConnection,
} from "@/components/yzi-imob/yzi-imob-apis-creditos-mock";
import {
  CampaignIcon,
  CardIcon,
  CreativeIcon,
  InboxIcon,
  InsightIcon,
  SearchIcon,
  ShieldIcon,
  SiteIcon,
  OperationIcon,
} from "@/components/yzi-imob/yzi-imob-icons-v2";
import { WorkspaceSection } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";

// Contas & Consumo (APIs & Créditos) — o cliente conecta a operação dele,
// nunca "configura APIs". Primeira dobra: suas contas, seu cartão, seu
// controle. Depois, capacidades (nunca ferramentas ou infraestrutura).
// Estado honesto: nenhuma conta conectada de verdade, nenhum consumo real,
// nada é cobrado ou autorizado daqui.

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

const CAPABILITY_ICON: Record<ConnectionCapability, Glyph> = {
  inteligencia: InsightIcon,
  marketing: CampaignIcon,
  whatsapp: InboxIcon,
  site: SiteIcon,
  seo: SearchIcon,
  criacao: CreativeIcon,
};

const PILLAR_ICONS: Glyph[] = [ShieldIcon, CardIcon, OperationIcon];

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[0.72rem]">
      <span className="shrink-0 text-[var(--yzi-text-faint)]">{label}</span>
      <span className="truncate text-right text-[var(--yzi-text-secondary)]">{value}</span>
    </div>
  );
}

function CapabilityCard({ connection }: { connection: DemoConnection }) {
  const connected = connection.status === "conectado";
  const role = connected ? "coldGreen" : "graphite";
  const Glyph = CAPABILITY_ICON[connection.id];

  return (
    <div className="flex flex-col gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-4 shadow-[var(--yzi-edge-highlight)]">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--yzi-radius-md)] border"
          style={{
            borderColor: imobRgba(role, 0.3),
            backgroundColor: imobRgba(role, 0.1),
            color: imobRgba(connected ? "coldGreen" : "neutral", 0.95),
          }}
        >
          <Glyph className="h-[17px] w-[17px]" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[0.88rem] font-medium text-[var(--yzi-text-primary)]">
          {connection.label}
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.64rem]"
          style={{
            borderColor: imobRgba(role, 0.32),
            backgroundColor: imobRgba(role, 0.1),
            color: imobRgba(role, 0.95),
          }}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: imobRgba(role, 0.9) }}
          />
          {connected ? "Conectado" : "Não conectado"}
        </span>
      </div>

      <p className="text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {connection.description}
      </p>

      {connected ? (
        <div className="flex flex-col gap-1.5 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3.5 py-3">
          <MetaRow label="Conta" value={connection.accountLabel ?? "—"} />
          <MetaRow label="Última sincronização" value={connection.lastSyncLabel ?? "—"} />
          <MetaRow label="Consumo" value={connection.usageLabel ?? "—"} />
          <MetaRow label="Renovação" value={connection.renewalLabel ?? "—"} />
        </div>
      ) : (
        <p className="rounded-[var(--yzi-radius-sm)] border border-dashed border-[color:var(--yzi-border-subtle)] px-3.5 py-3 text-[0.72rem] text-[var(--yzi-text-faint)]">
          Conecte a conta da sua imobiliária para ativar esta capacidade.
        </p>
      )}

      <button
        type="button"
        disabled
        title="Em preparação"
        className="mt-auto w-fit cursor-not-allowed rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-1.5 text-[0.72rem] text-[var(--yzi-text-faint)] opacity-60"
      >
        {connected ? "Gerenciar conexão" : "Conectar"}
      </button>
    </div>
  );
}

export function YziImobApisCreditosWorkspace() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 py-10">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">
          Contas &amp; Consumo
        </h1>
        <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">
          Você conecta a sua operação. A YZI trabalha por cima — sempre em seu nome.
        </p>
      </header>

      <div className="flex flex-col gap-7">
        {/* Primeira dobra — suas contas, seu cartão, seu controle. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TRUST_PILLARS.map((pillar, index) => {
            const Glyph = PILLAR_ICONS[index] ?? ShieldIcon;
            return (
              <div
                key={pillar.title}
                className="flex flex-col gap-2.5 rounded-[var(--yzi-radius-md)] border px-5 py-4"
                style={{
                  borderColor: imobRgba("cyan", 0.22),
                  backgroundColor: imobRgba("cyan", 0.05),
                }}
              >
                <Glyph
                  aria-hidden
                  className="h-[18px] w-[18px]"
                  style={{ color: imobRgba("cyan", 0.9) }}
                />
                <p className="text-[0.86rem] font-medium text-[var(--yzi-text-primary)]">
                  {pillar.title}
                </p>
                <p className="text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        <WorkspaceSection
          title="Capacidades da sua operação"
          description="Cada capacidade depende de uma conta sua — nada roda em nome de outra imobiliária."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_CONNECTIONS.map((connection) => (
              <CapabilityCard key={connection.id} connection={connection} />
            ))}
          </div>
        </WorkspaceSection>

        <WorkspaceSection
          title="Seu consumo"
          description="Uso da inteligência YZI dentro da sua operação — separado das contas conectadas acima."
        >
          <div
            className="flex flex-col gap-2 rounded-[var(--yzi-radius-md)] border px-5 py-4"
            style={{
              borderColor: imobRgba("cyan", 0.28),
              backgroundColor: imobRgba("cyan", 0.06),
            }}
          >
            <div className="flex items-center justify-between text-[0.78rem]">
              <span className="text-[var(--yzi-text-secondary)]">Créditos usados este mês</span>
              <span className="text-[var(--yzi-text-primary)]">Ilustrativo — sem consumo real</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--yzi-bg-deep)]">
              <div
                className="h-full w-0 rounded-full"
                style={{ backgroundColor: imobRgba("cyan", 0.8) }}
              />
            </div>
          </div>
        </WorkspaceSection>
      </div>

      <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Demonstração — nenhuma conta é conectada e nenhum consumo é medido de verdade ainda.
      </p>
    </section>
  );
}

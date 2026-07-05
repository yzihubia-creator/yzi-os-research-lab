"use client";

import { useEffect, useMemo, useState } from "react";

import {
  WorkspaceTabs,
  cx,
} from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import { imobRgba, type YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";
import { AuthorizationIcon } from "@/components/yzi-os/yzi-icons";

type GrowthSurface = "estrategia" | "conteudo" | "campanhas" | "biblioteca" | "resultados";
type CreativeStatus = "Gerando" | "Em revisão" | "Aprovado" | "Falhou";
type CreativeFormat = "Reel" | "Story" | "Carrossel" | "Meta Feed" | "Site";

type CreativeItem = {
  id: string;
  name: string;
  property: string;
  propertyId: string;
  channel: string;
  format: CreativeFormat;
  status: CreativeStatus;
  credits: string;
  creditMode: "consumidos" | "reservados" | "não consumidos";
  objective: string;
  recommendedAction: string;
  readiness: number;
  usedData: string[];
  pendencies: string[];
  palette: [YziImobRole, YziImobRole];
  headline: string;
  supportingText: string;
};

const SURFACES: Array<{ id: GrowthSurface; label: string; soon?: boolean }> = [
  { id: "estrategia", label: "Estratégia", soon: true },
  { id: "conteudo", label: "Conteúdo" },
  { id: "campanhas", label: "Campanhas", soon: true },
  { id: "biblioteca", label: "Biblioteca", soon: true },
  { id: "resultados", label: "Resultados", soon: true },
];

const COUNTERS = [
  { label: "Criativos", value: "12", detail: "mock operacional do tenant" },
  { label: "Em revisão", value: "4", detail: "dependem de aprovação humana" },
  { label: "Gerando", value: "3", detail: "estado visual simulado" },
  { label: "Reservados", value: "84", detail: "créditos separados" },
  { label: "Disponíveis", value: "1.144", detail: "saldo conceitual" },
];

const MOCK_CREATIVES: CreativeItem[] = [
  {
    id: "asset_altiplano_reel_01",
    name: "Reel Premium",
    property: "Apartamento Altiplano",
    propertyId: "property_altiplano_001",
    channel: "Instagram Reels",
    format: "Reel",
    status: "Em revisão",
    credits: "18",
    creditMode: "consumidos",
    objective: "Gerar desejo por visita qualificada",
    recommendedAction: "Aprovar para preparar a campanha",
    readiness: 92,
    usedData: ["bairro", "varanda", "metragem", "diferenciais", "preço sob consulta"],
    pendencies: ["Aprovação humana antes de uso em campanha"],
    palette: ["primary", "lilac"],
    headline: "Vista alta, rotina leve",
    supportingText: "Apartamento pronto para visita com varanda e acabamento premium.",
  },
  {
    id: "asset_cabo_branco_carrossel_01",
    name: "Carrossel Alto Padrão",
    property: "Cobertura Cabo Branco",
    propertyId: "property_cabo_branco_014",
    channel: "Instagram Feed",
    format: "Carrossel",
    status: "Gerando",
    credits: "12",
    creditMode: "reservados",
    objective: "Organizar argumentos de valor",
    recommendedAction: "Aguardar conclusão do preview",
    readiness: 68,
    usedData: ["cobertura", "vista mar", "área gourmet", "suítes"],
    pendencies: ["Preview ainda em preparação visual"],
    palette: ["petrol", "primary"],
    headline: "Cobertura com presença",
    supportingText: "Sequência visual para destacar vista, planta e área social.",
  },
  {
    id: "asset_manaira_story_01",
    name: "Story Visita",
    property: "Manaíra Residence",
    propertyId: "property_manaira_009",
    channel: "Instagram Stories",
    format: "Story",
    status: "Aprovado",
    credits: "6",
    creditMode: "consumidos",
    objective: "Convidar para visita no fim de semana",
    recommendedAction: "Preparar distribuição no canal escolhido",
    readiness: 100,
    usedData: ["localização", "data de visita", "perfil familiar"],
    pendencies: ["Canal ainda não conectado nesta unidade"],
    palette: ["ice", "cyan"],
    headline: "Visita neste sábado",
    supportingText: "Story curto para captar interesse e levar ao atendimento.",
  },
  {
    id: "asset_jardim_oceania_meta_01",
    name: "Meta Feed",
    property: "Jardim Oceania",
    propertyId: "property_jardim_oceania_004",
    channel: "Meta Feed",
    format: "Meta Feed",
    status: "Falhou",
    credits: "0",
    creditMode: "não consumidos",
    objective: "Testar oferta de captação",
    recommendedAction: "Solicitar nova versão após revisar dados do imóvel",
    readiness: 24,
    usedData: ["bairro", "tipo do imóvel"],
    pendencies: ["Faltam diferenciais claros do imóvel", "Nenhum crédito consumido"],
    palette: ["coldRed", "amber"],
    headline: "Oferta em ajuste",
    supportingText: "A peça precisa de mais informação para parecer pronta.",
  },
  {
    id: "asset_bessa_site_01",
    name: "Destaque Site",
    property: "Bessa Garden",
    propertyId: "property_bessa_022",
    channel: "Site",
    format: "Site",
    status: "Em revisão",
    credits: "10",
    creditMode: "consumidos",
    objective: "Abrir seção de imóvel em página de campanha",
    recommendedAction: "Aprovar após checar chamada principal",
    readiness: 88,
    usedData: ["fachada", "planta", "CTA", "benefícios do bairro"],
    pendencies: ["Revisar CTA antes de publicar manualmente"],
    palette: ["primary", "petrol"],
    headline: "Bessa Garden",
    supportingText: "Página de entrada com argumento claro para lead qualificado.",
  },
];

const STATUS_ACCENT: Record<CreativeStatus, YziImobRole> = {
  Gerando: "amber",
  "Em revisão": "lilac",
  Aprovado: "primary",
  Falhou: "coldRed",
};

function CounterStrip() {
  return (
    <div className="yzi-imob-strip grid w-full grid-cols-1 overflow-hidden sm:grid-cols-2 lg:grid-cols-5">
      {COUNTERS.map((counter, index) => (
        <div
          key={counter.label}
          className={cx(
            "flex flex-col gap-2 border-[color:var(--yzi-border-subtle)] px-5 py-4",
            index > 0 && "border-t sm:border-l sm:border-t-0",
            index === 4 && "lg:border-t-0",
          )}
        >
          <span className="text-[0.58rem] font-medium uppercase tracking-[0.18em] text-[var(--yzi-text-faint)]">
            {counter.label}
          </span>
          <span className="text-[1.8rem] font-semibold leading-none tracking-tight text-[var(--yzi-text-primary)] tabular-nums">
            {counter.value}
          </span>
          <span className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-secondary)]">
            {counter.detail}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: CreativeStatus }) {
  const role = STATUS_ACCENT[status];
  return (
    <span
      className="inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.66rem] font-medium"
      style={{
        color: imobRgba(role, 0.98),
        borderColor: imobRgba(role, 0.32),
        backgroundColor: imobRgba(role, 0.1),
      }}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: imobRgba(role, 0.9) }}
      />
      {status}
    </span>
  );
}

function Thumbnail({ item, active }: { item: CreativeItem; active: boolean }) {
  return (
    <div
      className={cx(
        "relative h-16 w-12 shrink-0 overflow-hidden rounded-[var(--yzi-radius-sm)] border",
        active ? "border-[rgba(var(--imob-ice),0.5)]" : "border-[color:var(--yzi-border-subtle)]",
      )}
      style={{
        background: `linear-gradient(145deg, ${imobRgba(item.palette[0], 0.26)}, ${imobRgba(
          item.palette[1],
          0.1,
        )}), var(--yzi-surface-elevated)`,
      }}
    >
      <div className="absolute inset-x-2 top-2 h-5 rounded bg-white/10" />
      <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
        <span className="h-1 rounded bg-white/30" />
        <span className="h-1 w-2/3 rounded bg-white/15" />
      </div>
    </div>
  );
}

function QueueCard({
  item,
  active,
  onSelect,
}: {
  item: CreativeItem;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "flex w-full gap-3 rounded-[var(--yzi-radius-md)] border p-3 text-left transition-colors",
        active
          ? "border-[rgba(var(--imob-ice),0.34)] bg-[rgba(var(--imob-cold),0.08)]"
          : "border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] hover:bg-[var(--yzi-surface-elevated)]",
      )}
    >
      <Thumbnail item={item} active={active} />
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
              {item.name}
            </span>
            <span className="block truncate text-[0.72rem] text-[var(--yzi-text-secondary)]">
              {item.property}
            </span>
          </span>
          <StatusPill status={item.status} />
        </span>
        <span className="flex flex-wrap items-center gap-2 text-[0.68rem] text-[var(--yzi-text-faint)]">
          <span>{item.format}</span>
          <span aria-hidden>·</span>
          <span>{item.channel}</span>
          <span aria-hidden>·</span>
          <span>
            {item.credits} {item.credits === "1" ? "crédito" : "créditos"} {item.creditMode}
          </span>
        </span>
      </span>
    </button>
  );
}

function PreviewFrame({ item }: { item: CreativeItem }) {
  const isWide = item.format === "Site" || item.format === "Meta Feed" || item.format === "Carrossel";
  const frameClass =
    item.format === "Site"
      ? "aspect-[16/10] w-full max-w-[760px]"
      : item.format === "Meta Feed" || item.format === "Carrossel"
        ? "aspect-square w-full max-w-[520px]"
        : "aspect-[9/16] h-[min(62vh,620px)] min-h-[440px] w-auto";

  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[radial-gradient(circle_at_50%_0%,rgba(var(--imob-cold),0.14),transparent_34%),var(--yzi-bg-deep)] p-6 shadow-[var(--yzi-edge-highlight)]">
      <div
        className={cx("relative overflow-hidden rounded-[28px] border border-white/15 shadow-2xl", frameClass)}
        style={{
          background: `linear-gradient(145deg, ${imobRgba(item.palette[0], 0.38)}, ${imobRgba(
            item.palette[1],
            0.18,
          )} 52%, rgba(9,12,18,0.96))`,
        }}
      >
        <div className="absolute left-5 right-5 top-5 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.16em] text-white/60">
          <span>{item.channel}</span>
          <span>{item.format}</span>
        </div>

        <div
          className={cx(
            "absolute rounded-[24px] border border-white/10 bg-white/[0.08]",
            isWide ? "left-8 right-8 top-16 h-[42%]" : "left-6 right-6 top-20 h-[46%]",
          )}
        >
          <div className="absolute inset-4 rounded-[18px] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.03))]" />
          <div className="absolute bottom-5 left-5 right-5 flex gap-2">
            <span className="h-2 flex-1 rounded bg-white/35" />
            <span className="h-2 w-1/4 rounded bg-white/15" />
          </div>
        </div>

        <div className={cx("absolute flex flex-col", isWide ? "bottom-8 left-8 right-8" : "bottom-10 left-6 right-6")}>
          <span className="mb-3 w-fit rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-white/70">
            Preview
          </span>
          <h2 className="text-balance text-[clamp(1.35rem,4vw,3rem)] font-semibold leading-[0.98] text-white">
            {item.headline}
          </h2>
          <p className="mt-3 max-w-lg text-[0.82rem] leading-relaxed text-white/68">
            {item.supportingText}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/12 px-3 py-1 text-[0.66rem] text-white/72">
              {item.property}
            </span>
            <span className="rounded-full bg-white/12 px-3 py-1 text-[0.66rem] text-white/72">
              {item.objective}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[color:var(--yzi-border-subtle)] py-2.5 last:border-b-0">
      <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
        {label}
      </span>
      <span className="text-right text-[0.8rem] text-[var(--yzi-text-primary)]">{value}</span>
    </div>
  );
}

function CostPanel() {
  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-[rgba(var(--imob-ice),0.22)] bg-[rgba(var(--imob-cold),0.07)] p-4">
      <div className="mb-3 flex items-center gap-2 text-[0.82rem] font-semibold text-[var(--yzi-text-primary)]">
        <AuthorizationIcon className="h-4 w-4 text-[rgb(var(--imob-ice))]" />
        Confirmar custo da nova versão
      </div>
      <div className="grid grid-cols-2 gap-2 text-[0.76rem]">
        <DetailRow label="Saldo disponível" value="1.144" />
        <DetailRow label="Custo estimado" value="8 créditos" />
        <DetailRow label="Reservados" value="84" />
        <DetailRow label="Saldo após confirmação" value="1.136" />
      </div>
      <p className="mt-3 text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Estado visual mockado. Nenhuma geração real foi executada.
      </p>
    </div>
  );
}

export function YziImobGrowthContentV0() {
  const [activeSurface, setActiveSurface] = useState<GrowthSurface>("conteudo");
  const [selectedId, setSelectedId] = useState(MOCK_CREATIVES[0].id);
  const [actionMode, setActionMode] = useState<"none" | "version" | "adjust">("none");
  const { select } = useYziImobWorkspace();

  const selected = useMemo(
    () => MOCK_CREATIVES.find((item) => item.id === selectedId) ?? MOCK_CREATIVES[0],
    [selectedId],
  );

  useEffect(() => {
    select({
      name: selected.name,
      subtitle: `${selected.property} · ${selected.channel}`,
      statusLabel: selected.status,
      situation:
        selected.status === "Em revisão"
          ? "A peça está pronta para decisão humana, com preview, imóvel, canal e custo visíveis."
          : selected.status === "Aprovado"
            ? "A peça já foi aprovada e aguarda uso operacional em canal autorizado."
            : selected.status === "Gerando"
              ? "A peça está em preparação visual mockada, com créditos reservados."
              : "A peça falhou antes de consumir créditos e precisa de nova versão.",
      pendencies: selected.pendencies,
      checklist: [
        { label: "Imóvel vinculado ao tenant ativo", done: true },
        { label: "Canal e formato definidos", done: true },
        { label: "Preview disponível", done: selected.status !== "Gerando" && selected.status !== "Falhou" },
        { label: "Aprovação humana registrada", done: selected.status === "Aprovado" },
      ],
      score: selected.readiness,
      scoreLabel: "Prontidão do criativo",
      nextAction: selected.recommendedAction,
      suggestions: [
        `Canal recomendado: ${selected.channel}.`,
        `Dados usados: ${selected.usedData.join(", ")}.`,
        "Nota honesta: Mock visual. Nenhuma geração real foi executada.",
      ],
      history: [
        `tenant_id: tenant_mock_growth_001`,
        `property_id: ${selected.propertyId}`,
        `${selected.credits} créditos ${selected.creditMode}.`,
      ],
    });
  }, [select, selected]);

  return (
    <section className="flex min-h-full w-full flex-col gap-7 px-6 pb-10 pt-6 xl:px-8">
      <header className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-[var(--yzi-text-secondary)]">
            Growth OS · Mock operacional
          </span>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.01em] text-[var(--yzi-text-primary)]">
                Conteúdo
              </h1>
              <p className="max-w-2xl text-[0.92rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                Criativos produzidos pela YZI para aprovação.
              </p>
            </div>
            <span className="rounded-full border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-1.5 text-[0.7rem] text-[var(--yzi-text-secondary)] shadow-[var(--yzi-edge-highlight)]">
              tenant_id: tenant_mock_growth_001
            </span>
          </div>
        </div>

        <CounterStrip />

        <WorkspaceTabs
          tabs={SURFACES}
          active={activeSurface}
          onChange={(id) => setActiveSurface(id as GrowthSurface)}
        />

        {activeSurface !== "conteudo" ? (
          <div className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-3 text-[0.78rem] text-[var(--yzi-text-secondary)]">
            Em construção para {SURFACES.find((surface) => surface.id === activeSurface)?.label}.
          </div>
        ) : null}
      </header>

      <div className="grid min-h-0 grid-cols-1 gap-5 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.9rem] font-semibold text-[var(--yzi-text-primary)]">
              Fila de criativos
            </h2>
            <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">Dados mockados</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {MOCK_CREATIVES.map((item) => (
              <QueueCard
                key={item.id}
                item={item}
                active={item.id === selected.id}
                onSelect={() => {
                  setSelectedId(item.id);
                  setActionMode("none");
                }}
              />
            ))}
          </div>
        </aside>

        <div className="grid min-w-0 grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="flex min-w-0 flex-col gap-4">
            <PreviewFrame item={selected} />
            <div className="grid grid-cols-1 gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 md:grid-cols-2">
              <DetailRow label="Canal" value={selected.channel} />
              <DetailRow label="Objetivo" value={selected.objective} />
              <DetailRow label="Imóvel" value={selected.property} />
              <DetailRow label="Formato" value={selected.format} />
              <DetailRow
                label="Créditos"
                value={`${selected.credits} ${selected.credits === "1" ? "crédito" : "créditos"} ${selected.creditMode}`}
              />
              <DetailRow label="Status" value={selected.status} />
              <div className="md:col-span-2">
                <DetailRow label="Ação recomendada da YZI" value={selected.recommendedAction} />
              </div>
            </div>
          </main>

          <aside className="flex min-w-0 flex-col gap-4">
            <section className="yzi-lens flex flex-col gap-4 rounded-[var(--yzi-radius-lg)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">
                    Aprovação
                  </h2>
                  <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                    Decisão visual mockada. Nada será publicado ou gerado.
                  </p>
                </div>
                <StatusPill status={selected.status} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.34)] bg-[rgba(var(--imob-cold),0.14)] px-3 py-2 text-[0.78rem] font-medium text-[var(--yzi-text-primary)] transition-colors hover:bg-[rgba(var(--imob-cold),0.2)]"
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  onClick={() => setActionMode("version")}
                  className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.78rem] text-[var(--yzi-text-secondary)] transition-colors hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]"
                >
                  Nova versão
                </button>
                <button
                  type="button"
                  onClick={() => setActionMode("adjust")}
                  className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.78rem] text-[var(--yzi-text-secondary)] transition-colors hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]"
                >
                  Solicitar ajuste
                </button>
                <button
                  type="button"
                  className="rounded-[var(--yzi-radius-sm)] border px-3 py-2 text-[0.78rem] transition-colors hover:bg-[rgba(196,108,108,0.12)]"
                  style={{
                    color: imobRgba("coldRed", 0.96),
                    borderColor: imobRgba("coldRed", 0.28),
                  }}
                >
                  Rejeitar
                </button>
              </div>

              {actionMode === "version" ? <CostPanel /> : null}

              {actionMode === "adjust" ? (
                <label className="flex flex-col gap-2">
                  <span className="text-[0.72rem] font-medium text-[var(--yzi-text-secondary)]">
                    Descreva o ajuste em linguagem natural.
                  </span>
                  <textarea
                    className="min-h-28 resize-none rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2 text-[0.82rem] leading-relaxed text-[var(--yzi-text-primary)] outline-none placeholder:text-[var(--yzi-text-faint)] focus:border-[rgba(var(--imob-ice),0.38)]"
                    placeholder="Quero uma versão mais premium, com menos texto e foco na varanda."
                  />
                </label>
              ) : null}
            </section>

            <section className="rounded-[var(--yzi-radius-lg)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 shadow-[var(--yzi-edge-highlight)]">
              <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">
                Inspector YZI
              </h2>
              <div className="mt-4 flex flex-col gap-4 text-[0.78rem] leading-relaxed">
                <div>
                  <span className="block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
                    Por que está pronta
                  </span>
                  <p className="mt-1 text-[var(--yzi-text-secondary)]">
                    Imóvel, objetivo, canal, formato, preview e custo estão visíveis para decisão.
                  </p>
                </div>
                <div>
                  <span className="block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
                    Dados do imóvel usados
                  </span>
                  <p className="mt-1 text-[var(--yzi-text-secondary)]">
                    {selected.usedData.join(", ")}.
                  </p>
                </div>
                <div>
                  <span className="block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
                    Canal recomendado
                  </span>
                  <p className="mt-1 text-[var(--yzi-text-secondary)]">{selected.channel}.</p>
                </div>
                <div>
                  <span className="block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
                    Pendências
                  </span>
                  <ul className="mt-1 flex flex-col gap-1 text-[var(--yzi-text-secondary)]">
                    {selected.pendencies.map((pendency) => (
                      <li key={pendency}>{pendency}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
                    Próxima ação recomendada
                  </span>
                  <p className="mt-1 text-[var(--yzi-text-primary)]">
                    {selected.recommendedAction}
                  </p>
                </div>
                <p className="border-t border-[color:var(--yzi-border-subtle)] pt-3 text-[0.7rem] text-[var(--yzi-text-faint)]">
                  Mock visual. Nenhuma geração real foi executada.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

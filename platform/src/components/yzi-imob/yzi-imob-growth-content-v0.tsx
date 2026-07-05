"use client";

import { useEffect, useMemo, useState } from "react";

import {
  GrowthApprovalActions,
  GrowthCounterStrip,
  GrowthCreditPanel,
  GrowthDetailRow,
  GrowthInspectorPanel,
  GrowthMockNotice,
  GrowthNavigation,
  GrowthPreviewFrame,
  GrowthQueueCard,
  GrowthSurfaceHeader,
  type GrowthSurface,
  type GrowthStatusAccent,
} from "@/components/yzi-imob/yzi-imob-growth-components";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import type { YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

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

const STATUS_ACCENT: GrowthStatusAccent = {
  Gerando: "amber",
  "Em revisão": "lilac",
  Aprovado: "primary",
  Falhou: "coldRed",
};

function creditLabel(item: CreativeItem) {
  return `${item.credits} ${item.credits === "1" ? "crédito" : "créditos"} ${item.creditMode}`;
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
        "tenant_id: tenant_mock_growth_001",
        `property_id: ${selected.propertyId}`,
        `${selected.credits} créditos ${selected.creditMode}.`,
      ],
    });
  }, [select, selected]);

  return (
    <section className="flex min-h-full w-full flex-col gap-7 px-6 pb-10 pt-6 xl:px-8">
      <header className="flex flex-col gap-5">
        <GrowthSurfaceHeader
          title="Conteúdo"
          subtitle="Criativos produzidos pela YZI para aprovação."
        />

        <GrowthCounterStrip counters={COUNTERS} />

        <GrowthNavigation active={activeSurface} onChange={setActiveSurface} />
        <GrowthMockNotice active={activeSurface} />
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
              <GrowthQueueCard
                key={item.id}
                title={item.name}
                subtitle={item.property}
                status={item.status}
                accents={STATUS_ACCENT}
                palette={item.palette}
                active={item.id === selected.id}
                onSelect={() => {
                  setSelectedId(item.id);
                  setActionMode("none");
                }}
                meta={
                  <>
                    <span>{item.format}</span>
                    <span aria-hidden>·</span>
                    <span>{item.channel}</span>
                    <span aria-hidden>·</span>
                    <span>{creditLabel(item)}</span>
                  </>
                }
              />
            ))}
          </div>
        </aside>

        <div className="grid min-w-0 grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="flex min-w-0 flex-col gap-4">
            <GrowthPreviewFrame
              channel={selected.channel}
              format={selected.format}
              palette={selected.palette}
              headline={selected.headline}
              supportingText={selected.supportingText}
              badges={[selected.property, selected.objective]}
            />

            <div className="grid grid-cols-1 gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4 md:grid-cols-2">
              <GrowthDetailRow label="Canal" value={selected.channel} />
              <GrowthDetailRow label="Objetivo" value={selected.objective} />
              <GrowthDetailRow label="Imóvel" value={selected.property} />
              <GrowthDetailRow label="Formato" value={selected.format} />
              <GrowthDetailRow label="Créditos" value={creditLabel(selected)} />
              <GrowthDetailRow label="Status" value={selected.status} />
              <div className="md:col-span-2">
                <GrowthDetailRow label="Ação recomendada da YZI" value={selected.recommendedAction} />
              </div>
            </div>
          </main>

          <aside className="flex min-w-0 flex-col gap-4">
            <GrowthApprovalActions
              status={selected.status}
              accents={STATUS_ACCENT}
              onVersion={() => setActionMode("version")}
              onAdjust={() => setActionMode("adjust")}
            />

            {actionMode === "version" ? (
              <GrowthCreditPanel
                rows={[
                  { label: "Saldo disponível", value: "1.144" },
                  { label: "Custo estimado", value: "8 créditos" },
                  { label: "Reservados", value: "84" },
                  { label: "Saldo após confirmação", value: "1.136" },
                ]}
              />
            ) : null}

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

            <GrowthInspectorPanel
              sections={[
                {
                  label: "Por que está pronta",
                  value: "Imóvel, objetivo, canal, formato, preview e custo estão visíveis para decisão.",
                },
                {
                  label: "Dados do imóvel usados",
                  value: `${selected.usedData.join(", ")}.`,
                },
                {
                  label: "Canal recomendado",
                  value: `${selected.channel}.`,
                },
                {
                  label: "Pendências",
                  value: (
                    <ul className="flex flex-col gap-1">
                      {selected.pendencies.map((pendency) => (
                        <li key={pendency}>{pendency}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  label: "Próxima ação recomendada",
                  value: <p className="text-[var(--yzi-text-primary)]">{selected.recommendedAction}</p>,
                },
              ]}
              note="Mock visual. Nenhuma geração real foi executada."
            />
          </aside>
        </div>
      </div>
    </section>
  );
}

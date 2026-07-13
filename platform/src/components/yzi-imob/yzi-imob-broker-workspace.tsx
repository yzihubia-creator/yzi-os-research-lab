"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ATUACAO_BAIRROS,
  ATUACAO_ESPECIALIDADES,
  ATUACAO_TIPOS,
  BROKER_STATUS_LABEL,
  BROKER_UPLOAD_CATEGORIES,
  DEMO_BROKERS,
  brokerCounters,
  brokerFiles,
  toBrokerInspection,
  type DemoBroker,
} from "@/components/yzi-imob/yzi-imob-entity-workspace-mock";
import {
  ComingSoonPanel,
  CounterStrip,
  EntityHero,
  WorkspaceGrid,
  WorkspaceSection,
  WorkspaceTabs,
} from "@/components/yzi-imob/yzi-imob-workspace-kit";
import {
  WorkspaceField,
  WorkspaceMultiSelect,
  WorkspaceTextarea,
} from "@/components/yzi-imob/yzi-imob-workspace-fields";
import { WorkspaceUploader } from "@/components/yzi-imob/yzi-imob-workspace-uploader";
import { BrokerOperationTab } from "@/components/yzi-imob/yzi-imob-broker-operation-tab";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import {
  BROKER_STATUS_ACCENT,
  imobRgba,
} from "@/components/yzi-imob/yzi-imob-status-colors";

// Broker Workspace (Entity Workspace Pattern): mesma arquitetura, mesmo
// Material System e mesmos componentes do Property Workspace — EntityHero →
// CounterStrip → Tabs + Inspector v2 (no Shell). Quem abre um deve reconhecer
// o outro. Estado local, mock honesto: sem backend, banco, Runtime ou upload
// reais.

// Operação primeiro: o corretor é um posto de operação, não uma ficha de RH.
// O cadastro vira aba secundária.
const TABS = [
  { id: "operacao", label: "Operação" },
  { id: "informacoes", label: "Cadastro" },
  { id: "arquivos", label: "Arquivos" },
  { id: "conhecimento", label: "Conhecimento da YZI" },
  { id: "indicadores", label: "Indicadores" },
  { id: "ia", label: "IA", soon: true },
];

const HERO_BY_STATUS: Record<DemoBroker["status"], string> = {
  ativo: "Estou encaminhando leads compatíveis com a área de atuação dele.",
  "em integração": "Ainda estou validando os dados antes de encaminhar leads.",
  inativo: "Este corretor não está recebendo leads no momento.",
};

type BrokerRecord = {
  telefone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  cidade: string;
  bairro: string;
  bairrosAtuacao: string[];
  tiposImovel: string[];
  especialidades: string[];
  conhecimento: string;
};

function toBrokerRecord(broker: DemoBroker | null): BrokerRecord {
  return {
    telefone: broker?.telefone ?? "",
    whatsapp: broker?.whatsapp ?? "",
    email: broker?.email ?? "",
    instagram: broker?.instagram ?? "",
    cidade: broker?.cidade ?? "",
    bairro: broker?.bairro ?? "",
    bairrosAtuacao: broker?.bairrosAtuacao ?? [],
    tiposImovel: broker?.tiposImovel ?? [],
    especialidades: broker?.especialidades ?? [],
    conhecimento: broker?.conhecimento ?? "",
  };
}

export function YziImobBrokerWorkspace() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { select } = useYziImobWorkspace();

  const id = params.id;
  const isNew = id === "novo";
  const broker: DemoBroker | null = isNew
    ? null
    : (DEMO_BROKERS.find((b) => b.id === id) ?? null);
  const notFound = !isNew && !broker;

  // Corretor existente abre em Operação; corretor novo abre no Cadastro
  // (não faz sentido abrir uma Operação vazia de quem ainda não existe).
  const [tab, setTab] = useState<string>(isNew ? "informacoes" : "operacao");
  const [record, setRecord] = useState<BrokerRecord>(() => toBrokerRecord(broker));

  useEffect(() => {
    if (notFound) return;
    if (broker) select(toBrokerInspection(broker));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (notFound) {
    return (
      <section className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center gap-3 px-8 py-10 text-center">
        <p className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">
          Corretor não encontrado.
        </p>
        <p className="text-[0.86rem] text-[var(--yzi-text-secondary)]">
          Este corretor não existe no catálogo de demonstração.
        </p>
        <Link
          href="/cockpit/yzi-imob/corretores"
          className="mt-2 text-[0.82rem] text-[rgb(var(--imob-ice))] hover:underline"
        >
          Voltar ao catálogo
        </Link>
      </section>
    );
  }

  function set<K extends keyof BrokerRecord>(key: K, value: BrokerRecord[K]) {
    setRecord((current) => ({ ...current, [key]: value }));
  }

  const statusLabel = broker ? BROKER_STATUS_LABEL[broker.status] : "Novo";
  const heroSubtitle = broker
    ? HERO_BY_STATUS[broker.status]
    : "Vamos cadastrar este corretor para começar a encaminhar leads.";
  const counters = broker
    ? brokerCounters(broker)
    : [
        { label: "Imóveis ativos", value: "0", detail: "Nenhum vínculo ainda" },
        { label: "Vendas no ano", value: "0", detail: "Sem meta definida" },
        { label: "Locações no ano", value: "0", detail: "Sem histórico" },
        { label: "Lead response", value: "—", detail: "Sem histórico ainda" },
      ];

  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 pt-10">
        <EntityHero
          backHref="/cockpit/yzi-imob/corretores"
          backLabel="Corretores"
          kicker="Broker Workspace"
          title={broker?.nome ?? "Novo corretor"}
          subtitle={heroSubtitle}
          statusLabel={statusLabel}
          composerPlaceholder="Pergunte à YZI sobre este corretor — carteira, leads, indicadores..."
          quickActions={[
            { label: "Como está a carteira dele?" },
            { label: "Quais leads encaminhar?" },
            { label: "Resumir o corretor" },
          ]}
          onAsk={() => router.push("/cockpit/yzi-imob/briefing")}
        />
        {broker ? (
          <div
            className="flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem]"
            style={{
              borderColor: imobRgba(BROKER_STATUS_ACCENT[broker.status], 0.32),
              backgroundColor: imobRgba(BROKER_STATUS_ACCENT[broker.status], 0.1),
              color: imobRgba(BROKER_STATUS_ACCENT[broker.status], 0.95),
            }}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: imobRgba(BROKER_STATUS_ACCENT[broker.status], 0.9) }}
            />
            {statusLabel}
          </div>
        ) : null}
      </section>

      {/* Counter Strip — full-bleed, mesma banda estrutural da Home. */}
      <section className="w-full py-7">
        <CounterStrip counters={counters} />
      </section>

      {/* Workspace Body — conteúdo principal; o Inspector v2 (copiloto) é
          renderizado pelo Shell, nunca duplicado aqui. */}
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-8 pb-10">
        <WorkspaceTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "operacao" ? (
          <BrokerOperationTab brokerId={id} />
        ) : tab === "informacoes" ? (
          <div className="flex flex-col gap-7">
            <WorkspaceSection
              first
              title="Identidade"
              description="Quem é este corretor dentro da operação. Os IDs são gerados pelo sistema."
            >
              <WorkspaceGrid>
                <WorkspaceField label="Nome" value={broker?.nome ?? "Gerado ao salvar"} readOnly />
                <WorkspaceField label="ID do corretor" value={broker?.corretorId ?? "—"} readOnly />
                <WorkspaceField label="CRECI" value={broker?.creci ?? ""} readOnly />
                <WorkspaceField label="Status" value={statusLabel} readOnly />
              </WorkspaceGrid>
            </WorkspaceSection>

            <WorkspaceSection title="Contato">
              <WorkspaceGrid>
                <WorkspaceField
                  label="Telefone"
                  value={record.telefone}
                  onChange={(value) => set("telefone", value)}
                />
                <WorkspaceField
                  label="WhatsApp"
                  value={record.whatsapp}
                  onChange={(value) => set("whatsapp", value)}
                />
                <WorkspaceField
                  label="Email"
                  value={record.email}
                  onChange={(value) => set("email", value)}
                />
                <WorkspaceField
                  label="Instagram"
                  value={record.instagram}
                  onChange={(value) => set("instagram", value)}
                  placeholder="@usuario"
                />
              </WorkspaceGrid>
            </WorkspaceSection>

            <WorkspaceSection title="Endereço">
              <WorkspaceGrid>
                <WorkspaceField
                  label="Cidade"
                  value={record.cidade}
                  onChange={(value) => set("cidade", value)}
                />
                <WorkspaceField
                  label="Bairro"
                  value={record.bairro}
                  onChange={(value) => set("bairro", value)}
                />
              </WorkspaceGrid>
            </WorkspaceSection>

            <WorkspaceSection
              title="Área de atuação"
              description="Define para quais leads a YZI encaminha este corretor."
            >
              <WorkspaceMultiSelect
                label="Bairros"
                options={ATUACAO_BAIRROS}
                value={record.bairrosAtuacao}
                onChange={(value) => set("bairrosAtuacao", value)}
                span2
              />
              <WorkspaceMultiSelect
                label="Tipos de imóveis"
                options={ATUACAO_TIPOS}
                value={record.tiposImovel}
                onChange={(value) => set("tiposImovel", value)}
                span2
              />
              <WorkspaceMultiSelect
                label="Especialidades"
                options={ATUACAO_ESPECIALIDADES}
                value={record.especialidades}
                onChange={(value) => set("especialidades", value)}
                span2
              />
            </WorkspaceSection>
          </div>
        ) : tab === "arquivos" ? (
          <WorkspaceUploader
            key={id}
            categories={BROKER_UPLOAD_CATEGORIES}
            initialFiles={broker ? brokerFiles(broker) : []}
          />
        ) : tab === "conhecimento" ? (
          <WorkspaceSection
            first
            title="Conhecimento da YZI"
            description="Perfil comercial, especialidades e estilo de venda deste corretor — usado pela YZI para triar e encaminhar leads compatíveis."
          >
            <WorkspaceTextarea
              label="Conhecimento da YZI"
              value={record.conhecimento}
              onChange={(value) => set("conhecimento", value)}
              rows={14}
              placeholder={
                "Descreva o perfil comercial deste corretor.\n\nEspecialidades · estilo de venda · pontos fortes · observações."
              }
            />
          </WorkspaceSection>
        ) : tab === "indicadores" ? (
          <WorkspaceSection
            first
            title="Indicadores"
            description="Estado apenas — nada executa daqui. Números ilustrativos de demonstração."
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="rounded-full border px-2.5 py-1 text-[0.66rem]"
                style={{
                  borderColor: imobRgba("primary", 0.3),
                  color: imobRgba("ice", 0.95),
                  backgroundColor: imobRgba("primary", 0.1),
                }}
              >
                Comissão e fechamento
              </span>
              <span
                className="rounded-full border px-2.5 py-1 text-[0.66rem]"
                style={{
                  borderColor: imobRgba("cyan", 0.3),
                  color: imobRgba("cyan", 0.95),
                  backgroundColor: imobRgba("cyan", 0.1),
                }}
              >
                Meta em andamento
              </span>
            </div>
            <WorkspaceGrid>
              <WorkspaceField label="Comissão" value={broker?.comissao ?? "—"} readOnly />
              <WorkspaceField label="Meta" value={broker?.meta ?? "—"} readOnly />
              <WorkspaceField
                label="Vendas no ano"
                value={broker ? String(broker.vendasAno) : "—"}
                readOnly
              />
              <WorkspaceField
                label="Locações no ano"
                value={broker ? String(broker.locacoesAno) : "—"}
                readOnly
              />
              <WorkspaceField
                label="Lead Response Time"
                value={broker?.leadResponse ?? "—"}
                readOnly
              />
              <WorkspaceField label="NPS" value={broker?.nps ?? "—"} readOnly />
            </WorkspaceGrid>
          </WorkspaceSection>
        ) : (
          <ComingSoonPanel
            label="IA"
            note="A YZI já está no Inspector — mais ações chegam aqui."
          />
        )}

        <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
          Workspace de demonstração. Nenhum dado é salvo, nenhum upload é enviado e
          nenhuma alteração acontece sem autorização.
        </p>
      </section>
    </div>
  );
}

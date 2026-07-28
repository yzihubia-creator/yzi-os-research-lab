"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ACTIVATION_LEVELS,
  ACTIVATION_META,
  DEMO_PROPERTIES,
  STATUS_META,
  WORKSPACE_HERO,
  emptyInspection,
  resolveWorkspaceState,
  toInspection,
  type ActivationLevel,
  type DemoProperty,
} from "@/components/yzi-imob/yzi-imob-catalog-mock";
import {
  FINALIDADE_OPTIONS,
  LAZER_OPTIONS,
  PROPERTY_UPLOAD_CATEGORIES,
  SOLAR_OPTIONS,
  propertyCounters,
  propertyFiles,
  toPropertyRecord,
  DEMO_BROKERS,
  type PropertyRecord,
} from "@/components/yzi-imob/yzi-imob-entity-workspace-mock";
import {
  ComingSoonPanel,
  CounterStrip,
  EntityHero,
  WorkspaceGrid,
  WorkspaceSection,
  WorkspaceTabs,
} from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { YziImobPropertyPublicationWorkspaceSlot } from "@/components/yzi-imob/yzi-imob-property-publication-workspace-adapter";
import {
  GROWTH_ASSET_STATUS_ACCENT,
  GROWTH_CAMPAIGN_STATUS_ACCENT,
  GrowthStatusBadge,
  MOCK_GROWTH_ASSETS,
  MOCK_GROWTH_CAMPAIGNS,
  useGrowthCampaignState,
} from "@/components/yzi-imob/growth";
import {
  WorkspaceDropdown,
  WorkspaceField,
  WorkspaceMultiSelect,
  WorkspaceTagInput,
  WorkspaceTextarea,
  WorkspaceToggle,
} from "@/components/yzi-imob/yzi-imob-workspace-fields";
import { WorkspaceUploader } from "@/components/yzi-imob/yzi-imob-workspace-uploader";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import { imobRgba, PROPERTY_STATUS_ACCENT } from "@/components/yzi-imob/yzi-imob-status-colors";

// Property Workspace v2 (Entity Workspace Pattern): o imóvel é a origem da
// operação — site, anúncios, criativos e atendimento consomem daqui. A tela é
// o schema visual do futuro banco, organizado em seções, nunca um formulário
// tradicional. Composição canônica compartilhada com o Broker Workspace:
// EntityHero → CounterStrip → Tabs + Inspector v2 (no Shell). Estado local,
// mock honesto: sem backend, banco, Runtime, upload ou publicação reais.

const TABS = [
  { id: "informacoes", label: "Informações" },
  { id: "arquivos", label: "Arquivos" },
  { id: "conhecimento", label: "Conhecimento da YZI" },
  { id: "seo", label: "SEO", soon: true },
  { id: "publicacao", label: "Publicação" },
  { id: "ia", label: "IA", soon: true },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "terreno", label: "Terreno" },
  { value: "comercial", label: "Comercial" },
];

export function YziImobPropertyWorkspace() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { select } = useYziImobWorkspace();

  const id = params.id;
  const isNew = id === "novo";
  const property: DemoProperty | null = isNew
    ? null
    : (DEMO_PROPERTIES.find((p) => p.id === id) ?? null);
  const notFound = !isNew && !property;

  const [tab, setTab] = useState<string>("informacoes");
  const [record, setRecord] = useState<PropertyRecord>(() =>
    toPropertyRecord(property),
  );
  const [brokerName, setBrokerName] = useState(property?.responsavel.nome ?? "");
  const { statusFor } = useGrowthCampaignState();

  // Reflexo do Growth OS: os dois catálogos mock ainda não são unificados
  // (ver growthPropertyId em yzi-imob-catalog-mock.ts). Só aparece campanha
  // aqui quando o imóvel de demonstração tem essa ponte definida.
  const growthPropertyId = property?.growthPropertyId;
  const relatedCampaigns = growthPropertyId
    ? MOCK_GROWTH_CAMPAIGNS.map((campaign) => ({
        campaign,
        pieces: campaign.pieceIds
          .map((pieceId) => MOCK_GROWTH_ASSETS.find((asset) => asset.id === pieceId))
          .filter(
            (piece): piece is (typeof MOCK_GROWTH_ASSETS)[number] =>
              Boolean(piece) && piece?.propertyId === growthPropertyId,
          ),
      })).filter((entry) => entry.pieces.length > 0)
    : [];

  useEffect(() => {
    if (notFound) return;
    select(property ? toInspection(property) : emptyInspection());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (notFound) {
    return (
      <section className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center gap-3 px-8 py-10 text-center">
        <p className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">
          Imóvel não encontrado.
        </p>
        <p className="text-[0.86rem] text-[var(--yzi-text-secondary)]">
          Este imóvel não existe no catálogo de demonstração.
        </p>
        <Link
          href="/cockpit/yzi-imob/imoveis"
          className="mt-2 text-[0.82rem] text-[rgb(var(--imob-ice))] hover:underline"
        >
          Voltar ao catálogo
        </Link>
      </section>
    );
  }

  function set<K extends keyof PropertyRecord>(key: K, value: PropertyRecord[K]) {
    setRecord((current) => ({ ...current, [key]: value }));
  }

  const state = resolveWorkspaceState(property);
  const missingBroker = state === "missing-broker";
  const linkedBroker = DEMO_BROKERS.find((b) => b.nome === brokerName) ?? null;
  const isTerreno = record.tipo === "terreno";
  const activation: ActivationLevel = record.nivelAtivacao;
  const activationPlan = ACTIVATION_META[activation].plano;
  const statusLabel = property
    ? missingBroker
      ? "Sem responsável"
      : STATUS_META[property.status].label
    : "Novo";

  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 pt-10">
        <EntityHero
          backHref="/cockpit/yzi-imob/imoveis"
          backLabel="Imóveis"
          kicker="Property Workspace"
          title={property?.name ?? "Novo imóvel"}
          subtitle={WORKSPACE_HERO[state]}
          statusLabel={statusLabel}
          composerPlaceholder="Pergunte à YZI sobre este imóvel — pendências, leads, publicação..."
          quickActions={[
            { label: "O que falta para publicar?" },
            { label: "Preparar criativo" },
            { label: "Resumir o imóvel" },
          ]}
          onAsk={() => router.push("/cockpit/yzi-imob/briefing")}
        />
        {property && !missingBroker ? (
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem]"
              style={{
                borderColor: imobRgba(PROPERTY_STATUS_ACCENT[property.status], 0.32),
                backgroundColor: imobRgba(PROPERTY_STATUS_ACCENT[property.status], 0.1),
                color: imobRgba(PROPERTY_STATUS_ACCENT[property.status], 0.95),
              }}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: imobRgba(PROPERTY_STATUS_ACCENT[property.status], 0.9) }}
              />
              {statusLabel}
            </div>
            <div
              className="flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem]"
              style={{
                borderColor: imobRgba(ACTIVATION_META[activation].accent, 0.32),
                backgroundColor: imobRgba(ACTIVATION_META[activation].accent, 0.1),
                color: imobRgba(ACTIVATION_META[activation].accent, 0.95),
              }}
              title={ACTIVATION_META[activation].objetivo}
            >
              {ACTIVATION_META[activation].label}
            </div>
          </div>
        ) : null}
        {missingBroker ? (
          <div
            className="flex flex-wrap items-center gap-3 rounded-[var(--yzi-radius-md)] border px-4 py-3"
            style={{
              borderColor: imobRgba("amber", 0.32),
              backgroundColor: imobRgba("amber", 0.1),
            }}
          >
            <span className="text-[0.82rem]" style={{ color: imobRgba("amber", 0.95) }}>
              Vincular corretor responsável
            </span>
            <span className="text-[0.74rem] text-[var(--yzi-text-secondary)]">
              A YZI não prepara visita, campanha ou atendimento sem responsável definido.
            </span>
          </div>
        ) : null}
      </section>

      {/* Counter Strip — full-bleed, mesma banda estrutural da Home. */}
      <section className="w-full py-7">
        <CounterStrip counters={propertyCounters(property)} />
      </section>

      {/* Workspace Body — conteúdo principal; o Inspector v2 (copiloto) é
          renderizado pelo Shell, nunca duplicado aqui. */}
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-8 pb-10">
        <WorkspaceTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "informacoes" ? (
          <div className="flex flex-col gap-7">
            <WorkspaceSection
              first
              title="Identidade"
              description="Quem é este imóvel dentro da operação. Os IDs são gerados pelo sistema."
            >
              <WorkspaceGrid>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[0.72rem] text-[var(--yzi-text-secondary)]">
                    ID do imóvel
                  </span>
                  <span
                    className="w-full rounded-[var(--yzi-radius-md)] border bg-[var(--yzi-bg-deep)] px-3 py-2.5 font-mono text-[0.8rem] tracking-[0.04em]"
                    style={{
                      borderColor: imobRgba("primary", 0.28),
                      color: imobRgba("ice", 0.9),
                    }}
                  >
                    {property?.idImovel ?? "Gerado ao salvar"}
                  </span>
                </div>
                <WorkspaceDropdown
                  label="Finalidade"
                  value={record.finalidade}
                  onChange={(value) => set("finalidade", value)}
                  options={FINALIDADE_OPTIONS}
                />
                <WorkspaceField
                  label="Corretor responsável"
                  value={brokerName}
                  onChange={setBrokerName}
                  suggestions={DEMO_BROKERS.map((b) => b.nome)}
                  placeholder="Comece a digitar o nome"
                  hint={
                    missingBroker
                      ? undefined
                      : "Sem responsável, o imóvel não avança para publicação, visita ou campanha."
                  }
                />
                <WorkspaceField
                  label="ID do corretor"
                  value={linkedBroker?.corretorId ?? "—"}
                  readOnly
                />
              </WorkspaceGrid>
              {missingBroker ? (
                <p className="text-[0.72rem]" style={{ color: imobRgba("amber", 0.9) }}>
                  Sem responsável, o imóvel não avança para publicação, visita ou campanha.
                </p>
              ) : null}
            </WorkspaceSection>

            <WorkspaceSection
              title="Campanhas & Criativos"
              description="O que a YZI preparou para este imóvel em Growth OS e o que ainda depende da sua aprovação."
            >
              {relatedCampaigns.length === 0 ? (
                <p className="text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                  Nenhuma campanha vinculada a este imóvel ainda. Prepare uma em{" "}
                  <Link href="/cockpit/yzi-imob/growth/campanhas" className="text-[rgb(var(--imob-ice))] hover:underline">
                    Growth OS / Campanhas
                  </Link>
                  .
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {relatedCampaigns.map(({ campaign, pieces }) => (
                    <div
                      key={campaign.id}
                      className="flex flex-col gap-2.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[0.84rem] font-medium text-[var(--yzi-text-primary)]">
                          {campaign.name}
                        </span>
                        <GrowthStatusBadge status={campaign.status} accents={GROWTH_CAMPAIGN_STATUS_ACCENT} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {pieces.map((piece) => (
                          <div key={piece.id} className="flex items-center justify-between gap-2 text-[0.76rem]">
                            <span className="min-w-0 truncate text-[var(--yzi-text-secondary)]">{piece.name}</span>
                            <GrowthStatusBadge
                              status={statusFor(piece.id, piece.status)}
                              accents={GROWTH_ASSET_STATUS_ACCENT}
                            />
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/cockpit/yzi-imob/growth/campanhas"
                        className="w-fit text-[0.72rem] text-[rgb(var(--imob-ice))] hover:underline"
                      >
                        Revisar na mesa de campanhas
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </WorkspaceSection>

            <WorkspaceSection
              title="Nível de Ativação"
              description="Você define o objetivo comercial; a YZI recomenda plano, peças, canais e próximos passos. Nenhuma ferramenta para escolher."
            >
              <div className="flex flex-col gap-2" role="radiogroup" aria-label="Nível de Ativação">
                {ACTIVATION_LEVELS.map((level) => {
                  const meta = ACTIVATION_META[level];
                  const selected = level === activation;
                  return (
                    <button
                      key={level}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => set("nivelAtivacao", level)}
                      className="flex flex-col gap-0.5 rounded-[var(--yzi-radius-md)] border px-4 py-3 text-left transition-colors duration-[var(--duration-fast)]"
                      style={{
                        borderColor: selected
                          ? imobRgba(meta.accent, 0.45)
                          : "var(--yzi-border-subtle)",
                        backgroundColor: selected
                          ? imobRgba(meta.accent, 0.08)
                          : "var(--yzi-surface-base)",
                      }}
                    >
                      <span
                        className="text-[0.84rem] font-medium"
                        style={{
                          color: selected
                            ? imobRgba(meta.accent, 0.95)
                            : "var(--yzi-text-primary)",
                        }}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[0.74rem] text-[var(--yzi-text-secondary)]">
                        {meta.objetivo}
                      </span>
                      <span className="text-[0.7rem] text-[var(--yzi-text-faint)]">
                        {meta.consequencia}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3.5 shadow-[var(--yzi-edge-highlight)]">
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--yzi-text-secondary)]">
                  O que a YZI vai fazer
                </span>
                {activationPlan.pecas.length === 0 ? (
                  <p className="text-[0.78rem] text-[var(--yzi-text-secondary)]">
                    Nenhuma peça será preparada. O imóvel fica organizado no banco,
                    pronto para ativar quando você decidir.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <PlanColumn label="Peças" items={activationPlan.pecas} />
                    <PlanColumn label="Canais" items={activationPlan.canais} />
                    <PlanColumn label="Próximos passos" items={activationPlan.proximosPassos} />
                  </div>
                )}
                <p className="text-[0.68rem] text-[var(--yzi-text-faint)]">
                  Recomendação de demonstração — o plano real da YZI entra com o
                  backend. Nada é gerado nem publicado sem sua aprovação.
                </p>
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Localização">
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
                <WorkspaceField
                  label="Endereço"
                  value={record.endereco}
                  onChange={(value) => set("endereco", value)}
                  placeholder="Rua, número"
                />
                <WorkspaceField
                  label="Complemento"
                  value={record.complemento}
                  onChange={(value) => set("complemento", value)}
                />
                <WorkspaceField
                  label="CEP"
                  value={record.cep}
                  onChange={(value) => set("cep", value)}
                />
                <WorkspaceField
                  label="Referência"
                  value={record.referencia}
                  onChange={(value) => set("referencia", value)}
                  placeholder="Ponto de referência próximo"
                />
              </WorkspaceGrid>
            </WorkspaceSection>

            <WorkspaceSection title="Características">
              <WorkspaceGrid>
                <WorkspaceDropdown
                  label="Tipo"
                  value={record.tipo}
                  onChange={(value) => set("tipo", value)}
                  options={PROPERTY_TYPE_OPTIONS}
                />
                <WorkspaceField
                  label="Área (m²)"
                  value={record.area}
                  onChange={(value) => set("area", value)}
                />
                {!isTerreno ? (
                  <>
                    <WorkspaceField
                      label="Quartos"
                      value={record.quartos}
                      onChange={(value) => set("quartos", value)}
                    />
                    <WorkspaceField
                      label="Suítes"
                      value={record.suites}
                      onChange={(value) => set("suites", value)}
                    />
                    <WorkspaceField
                      label="Banheiros"
                      value={record.banheiros}
                      onChange={(value) => set("banheiros", value)}
                    />
                    <WorkspaceField
                      label="Garagem (vagas)"
                      value={record.garagem}
                      onChange={(value) => set("garagem", value)}
                    />
                    <WorkspaceDropdown
                      label="Posição solar"
                      value={record.posicaoSolar}
                      onChange={(value) => set("posicaoSolar", value)}
                      options={SOLAR_OPTIONS}
                    />
                  </>
                ) : null}
              </WorkspaceGrid>
              <WorkspaceGrid>
                {!isTerreno ? (
                  <>
                    <WorkspaceToggle
                      label="Mobiliado"
                      value={record.mobiliado}
                      onChange={(value) => set("mobiliado", value)}
                    />
                    <WorkspaceToggle
                      label="Porteira fechada"
                      value={record.porteiraFechada}
                      onChange={(value) => set("porteiraFechada", value)}
                    />
                  </>
                ) : null}
                <WorkspaceToggle
                  label="Aceita financiamento"
                  value={record.aceitaFinanciamento}
                  onChange={(value) => set("aceitaFinanciamento", value)}
                />
                <WorkspaceToggle
                  label="Aceita permuta"
                  value={record.aceitaPermuta}
                  onChange={(value) => set("aceitaPermuta", value)}
                />
              </WorkspaceGrid>
              {!isTerreno ? (
                <WorkspaceMultiSelect
                  label="Lazer"
                  options={LAZER_OPTIONS}
                  value={record.lazer}
                  onChange={(value) => set("lazer", value)}
                />
              ) : null}
              <WorkspaceTagInput
                label="Diferenciais"
                value={record.diferenciais}
                onChange={(value) => set("diferenciais", value)}
                placeholder="Digite e pressione Enter"
              />
            </WorkspaceSection>

            <WorkspaceSection title="Valores">
              <WorkspaceGrid>
                <WorkspaceField
                  label="Venda"
                  value={record.valorVenda}
                  onChange={(value) => set("valorVenda", value)}
                  placeholder="R$"
                />
                <WorkspaceField
                  label="Aluguel"
                  value={record.valorAluguel}
                  onChange={(value) => set("valorAluguel", value)}
                  placeholder="R$/mês"
                />
                <WorkspaceField
                  label="Condomínio"
                  value={record.condominio}
                  onChange={(value) => set("condominio", value)}
                  placeholder="R$/mês"
                />
                <WorkspaceField
                  label="IPTU"
                  value={record.iptu}
                  onChange={(value) => set("iptu", value)}
                />
                <WorkspaceField
                  label="Taxas"
                  value={record.taxas}
                  onChange={(value) => set("taxas", value)}
                  placeholder="Outras taxas recorrentes"
                />
              </WorkspaceGrid>
            </WorkspaceSection>
          </div>
        ) : tab === "arquivos" ? (
          <WorkspaceUploader
            key={id}
            categories={PROPERTY_UPLOAD_CATEGORIES}
            initialFiles={propertyFiles(property)}
          />
        ) : tab === "conhecimento" ? (
          <WorkspaceSection
            first
            title="Base de Conhecimento do imóvel"
            description="Não é uma descrição comum: é o contexto que a YZI usa em site, SEO, criativos, campanhas, chat, atendimento, follow-up e memória. Quanto mais você ensinar aqui, melhor tudo que nasce deste imóvel."
          >
            <WorkspaceTextarea
              label="Conhecimento da YZI"
              value={record.conhecimento}
              onChange={(value) => set("conhecimento", value)}
              rows={14}
              placeholder={
                "Escreva como se estivesse apresentando este imóvel para um cliente.\n\nDescrição aprofundada · diferenciais · história · perfil ideal · objeções · motivos de compra · estilo de vida · pontos fortes · pontos fracos."
              }
            />
          </WorkspaceSection>
        ) : tab === "seo" ? (
          <ComingSoonPanel label="SEO — em breve" note="Entra com o Site." />
        ) : tab === "publicacao" ? (
          <YziImobPropertyPublicationWorkspaceSlot />
        ) : (
          <ComingSoonPanel
            label="IA"
            note="A YZI já está no Inspector — mais ações chegam aqui."
          />
        )}

        <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
          Workspace de demonstração. Nenhum dado é salvo, nenhum upload é enviado e
          nenhuma publicação acontece sem autorização.
        </p>
      </section>
    </div>
  );
}

function PlanColumn({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--yzi-text-faint)]">
        {label}
      </span>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item} className="text-[0.76rem] leading-snug text-[var(--yzi-text-primary)]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  CLIENT_FINALIDADE_OPTIONS,
  CLIENT_STATUS_LABEL,
  DEMO_CLIENTS,
  clientCounters,
  toClientInspection,
  type DemoClient,
} from "@/components/yzi-imob/yzi-imob-entity-workspace-mock";
import {
  ATUACAO_BAIRROS,
  ATUACAO_TIPOS,
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
  WorkspaceDropdown,
  WorkspaceField,
  WorkspaceMultiSelect,
  WorkspaceTextarea,
} from "@/components/yzi-imob/yzi-imob-workspace-fields";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import {
  CLIENT_STAGE_ACCENT,
  imobRgba,
  type YziImobRole,
} from "@/components/yzi-imob/yzi-imob-status-colors";

// Client Workspace (Entity Workspace Pattern): mesma arquitetura do Property e
// Broker Workspace. Cliente != lead cru — tem vínculo consolidado (visita
// marcada, proposta, reserva, contrato, pós-venda). Estado local, mock
// honesto: sem backend, banco ou persistência real.

const TABS = [
  { id: "perfil", label: "Perfil" },
  { id: "interesses", label: "Interesses" },
  { id: "imoveis", label: "Imóveis" },
  { id: "visitas", label: "Visitas" },
  { id: "propostas", label: "Propostas" },
  { id: "documentos", label: "Documentos" },
  { id: "historico", label: "Histórico" },
  { id: "ia", label: "IA" },
];

const HERO_BY_STATUS: Record<DemoClient["status"], string> = {
  lead: "Ainda não qualificado. Estou acompanhando o primeiro contato.",
  qualificado: "Interesse confirmado. Estou acompanhando a busca e preferências dele.",
  cliente: "Vínculo consolidado. Acompanho visitas, propostas e novidades compatíveis.",
  inativo: "Sem atividade recente. Nenhuma ação automática está em andamento.",
};

type ClientRecord = {
  telefone: string;
  whatsapp: string;
  email: string;
  cidade: string;
  bairrosInteresse: string[];
  tiposImovel: string[];
  finalidade: string;
  valorMin: string;
  valorMax: string;
  conhecimento: string;
  consentimento: boolean;
  newsletter: boolean;
};

function toClientRecord(client: DemoClient | null): ClientRecord {
  return {
    telefone: client?.telefone ?? "",
    whatsapp: client?.whatsapp ?? "",
    email: client?.email ?? "",
    cidade: client?.cidade ?? "",
    bairrosInteresse: client?.bairrosInteresse ?? [],
    tiposImovel: client?.tiposImovel ?? [],
    finalidade: client?.finalidade ?? "compra",
    valorMin: client?.valorMin ?? "",
    valorMax: client?.valorMax ?? "",
    conhecimento: client?.conhecimento ?? "",
    consentimento: Boolean(client && client.whatsapp.trim().length > 0),
    newsletter: Boolean(client && client.email.trim().length > 0),
  };
}

// Visitas, propostas e imóveis relacionados são demonstrativos — derivados do
// cliente mock, sem depender de dado real de catálogo/corretor.
function demoVisitas(client: DemoClient) {
  if (client.imoveisVisitados === 0) return [];
  return Array.from({ length: client.imoveisVisitados }).map((_, index) => ({
    id: `${client.id}-visita-${index + 1}`,
    imovel: index === 0 ? "Imóvel de interesse principal" : `Imóvel visitado ${index + 1}`,
    corretor: client.corretorResponsavel || "Sem corretor",
    status: index === 0 ? "Realizada" : "Realizada",
    feedback: index === 0 ? "Gostou muito, aguardando decisão." : "Feedback registrado.",
    data: index === 0 ? client.ultimaInteracao : "Data anterior",
  }));
}

function demoPropostas(client: DemoClient) {
  if (client.propostasAtivas === 0) return [];
  return [
    {
      id: `${client.id}-proposta-1`,
      imovel: "Imóvel de interesse principal",
      valor: client.valorMax || "Não informado",
      status: "Em análise",
      proximaAcao: "Aguardar retorno do proprietário.",
    },
  ];
}

// Cada evento do histórico carrega um papel de cor por TIPO de evento — não
// decorativo: criação/lead = cyan, comunicação (WhatsApp/email) = cyan,
// visita = lilás (decisão/agenda), proposta = âmbar (aguardando decisão),
// vínculo consolidado = primária fria (estado pronto/ativo).
type HistoricoItem = { label: string; role: YziImobRole };

function demoHistorico(client: DemoClient): HistoricoItem[] {
  const items: HistoricoItem[] = [
    { label: "Lead criado a partir do primeiro contato.", role: "cyan" },
  ];
  if (client.whatsapp) items.push({ label: "Conversa iniciada via WhatsApp.", role: "cyan" });
  if (client.email) items.push({ label: "Email capturado.", role: "cyan" });
  if (client.imoveisVisitados > 0) {
    items.push({
      label: `${client.imoveisVisitados} visita(s) marcada(s) e realizada(s).`,
      role: "lilac",
    });
  }
  if (client.propostasAtivas > 0) items.push({ label: "Proposta enviada.", role: "amber" });
  if (client.status === "cliente") {
    items.push({ label: "Vínculo consolidado como cliente.", role: "primary" });
  }
  return items;
}

export function YziImobClientWorkspace() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { select } = useYziImobWorkspace();

  const id = params.id;
  const isNew = id === "novo";
  const client: DemoClient | null = isNew
    ? null
    : (DEMO_CLIENTS.find((c) => c.id === id) ?? null);
  const notFound = !isNew && !client;

  const [tab, setTab] = useState<string>("perfil");
  const [record, setRecord] = useState<ClientRecord>(() => toClientRecord(client));

  useEffect(() => {
    if (notFound) return;
    if (client) select(toClientInspection(client));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (notFound) {
    return (
      <section className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center gap-3 px-8 py-10 text-center">
        <p className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">
          Cliente não encontrado.
        </p>
        <p className="text-[0.86rem] text-[var(--yzi-text-secondary)]">
          Este cliente não existe na base de demonstração.
        </p>
        <Link
          href="/cockpit/yzi-imob/clientes"
          className="mt-2 text-[0.82rem] text-[rgb(var(--imob-ice))] hover:underline"
        >
          Voltar aos clientes
        </Link>
      </section>
    );
  }

  function set<K extends keyof ClientRecord>(key: K, value: ClientRecord[K]) {
    setRecord((current) => ({ ...current, [key]: value }));
  }

  const statusLabel = client ? CLIENT_STATUS_LABEL[client.status] : "Novo";
  const heroSubtitle = client
    ? HERO_BY_STATUS[client.status]
    : "Vamos cadastrar este cliente para começar a acompanhar a busca dele.";
  const counters = client
    ? clientCounters(client)
    : [
        { label: "Imóveis visitados", value: "0", detail: "Nenhuma visita ainda" },
        { label: "Propostas ativas", value: "0", detail: "Nenhuma no momento" },
        { label: "Última interação", value: "—", detail: "Sem histórico" },
        { label: "Corretor responsável", value: "—", detail: "Ainda sem vínculo" },
      ];

  const visitas = client ? demoVisitas(client) : [];
  const propostas = client ? demoPropostas(client) : [];
  const historico = client ? demoHistorico(client) : [];

  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 pt-10">
        <EntityHero
          backHref="/cockpit/yzi-imob/clientes"
          backLabel="Clientes"
          kicker="Client Workspace"
          title={client?.nome ?? "Novo cliente"}
          subtitle={heroSubtitle}
          statusLabel={statusLabel}
          composerPlaceholder="Pergunte à YZI sobre este cliente — preferências, imóveis, propostas..."
          quickActions={[
            { label: "O que sabemos sobre este cliente?" },
            { label: "Quais imóveis sugerir?" },
            { label: "Resumir o cliente" },
          ]}
          onAsk={() => router.push("/cockpit/yzi-imob/briefing")}
        />
        {client ? (
          <div
            className="flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem]"
            style={{
              borderColor: imobRgba(CLIENT_STAGE_ACCENT[client.status], 0.32),
              backgroundColor: imobRgba(CLIENT_STAGE_ACCENT[client.status], 0.1),
              color: imobRgba(CLIENT_STAGE_ACCENT[client.status], 0.95),
            }}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: imobRgba(CLIENT_STAGE_ACCENT[client.status], 0.9) }}
            />
            {statusLabel}
          </div>
        ) : null}
      </section>

      <section className="w-full py-7">
        <CounterStrip counters={counters} />
      </section>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-8 pb-10">
        <WorkspaceTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "perfil" ? (
          <div className="flex flex-col gap-7">
            <WorkspaceSection
              first
              title="Identidade"
              description="Quem é este cliente dentro da operação. Os IDs são gerados pelo sistema."
            >
              <WorkspaceGrid>
                <WorkspaceField label="Nome" value={client?.nome ?? "Gerado ao salvar"} readOnly />
                <WorkspaceField label="ID do cliente" value={client?.clienteId ?? "—"} readOnly />
                <WorkspaceField label="Origem" value={client?.origem ?? "—"} readOnly />
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
              </WorkspaceGrid>
            </WorkspaceSection>

            <WorkspaceSection title="Localização">
              <WorkspaceGrid>
                <WorkspaceField
                  label="Cidade/Estado"
                  value={record.cidade}
                  onChange={(value) => set("cidade", value)}
                />
                <WorkspaceField
                  label="Corretor responsável"
                  value={client?.corretorResponsavel || "Sem corretor vinculado"}
                  readOnly
                />
              </WorkspaceGrid>
            </WorkspaceSection>

            <WorkspaceSection
              title="Consentimento"
              description="Base para contato e comunicação com este cliente."
            >
              <WorkspaceGrid>
                <label
                  className="flex items-center gap-2 text-[0.82rem]"
                  style={{
                    color: record.consentimento ? imobRgba("cyan", 0.9) : "var(--yzi-text-secondary)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={record.consentimento}
                    onChange={(event) => set("consentimento", event.target.checked)}
                  />
                  Consentimento para contato
                </label>
                <label
                  className="flex items-center gap-2 text-[0.82rem]"
                  style={{
                    color: record.newsletter ? imobRgba("cyan", 0.9) : "var(--yzi-text-secondary)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={record.newsletter}
                    onChange={(event) => set("newsletter", event.target.checked)}
                  />
                  Newsletter / novidades por email
                </label>
              </WorkspaceGrid>
            </WorkspaceSection>
          </div>
        ) : tab === "interesses" ? (
          <div className="flex flex-col gap-7">
            <WorkspaceSection
              first
              title="Interesses de busca"
              description="Usado pela YZI para sugerir imóveis compatíveis."
            >
              <WorkspaceGrid>
                <WorkspaceDropdown
                  label="Finalidade"
                  value={record.finalidade}
                  onChange={(value) => set("finalidade", value)}
                  options={CLIENT_FINALIDADE_OPTIONS}
                />
                <WorkspaceField
                  label="Faixa de valor — mínimo"
                  value={record.valorMin}
                  onChange={(value) => set("valorMin", value)}
                />
                <WorkspaceField
                  label="Faixa de valor — máximo"
                  value={record.valorMax}
                  onChange={(value) => set("valorMax", value)}
                />
              </WorkspaceGrid>
              <WorkspaceMultiSelect
                label="Tipo de imóvel"
                options={ATUACAO_TIPOS}
                value={record.tiposImovel}
                onChange={(value) => set("tiposImovel", value)}
                span2
              />
              <WorkspaceMultiSelect
                label="Bairros de interesse"
                options={ATUACAO_BAIRROS}
                value={record.bairrosInteresse}
                onChange={(value) => set("bairrosInteresse", value)}
                span2
              />
            </WorkspaceSection>

            <WorkspaceSection
              title="Perfil da busca"
              description="Contexto adicional para qualificar o interesse."
            >
              <WorkspaceGrid>
                <WorkspaceField label="Quartos" value="Não informado" readOnly />
                <WorkspaceField label="Vagas" value="Não informado" readOnly />
                <WorkspaceField label="Prazo" value="Não informado" readOnly />
                <WorkspaceField label="Motivação" value="Não informado" readOnly />
              </WorkspaceGrid>
              <WorkspaceTextarea
                label="Objeções"
                value=""
                onChange={() => undefined}
                rows={2}
                placeholder="Objeções observadas durante o atendimento."
                span2
              />
              <WorkspaceTextarea
                label="Observações internas"
                value=""
                onChange={() => undefined}
                rows={2}
                placeholder="Observações internas da equipe."
                span2
              />
            </WorkspaceSection>
          </div>
        ) : tab === "imoveis" ? (
          <WorkspaceSection
            first
            title="Imóveis relacionados"
            description="Situação deste cliente em relação aos imóveis do catálogo."
          >
            {client && client.imoveisVisitados > 0 ? (
              <ul className="flex flex-col gap-2">
                {visitas.map((visita) => (
                  <li
                    key={visita.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3 text-[0.82rem]"
                  >
                    <span className="text-[var(--yzi-text-primary)]">{visita.imovel}</span>
                    <span
                      className="rounded-full border px-2.5 py-1 text-[0.66rem]"
                      style={{
                        borderColor: imobRgba("lilac", 0.32),
                        backgroundColor: imobRgba("lilac", 0.1),
                        color: imobRgba("lilac", 0.95),
                      }}
                    >
                      Visitado
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[0.8rem] text-[var(--yzi-text-faint)]">
                Nenhum imóvel relacionado ainda.
              </p>
            )}
          </WorkspaceSection>
        ) : tab === "visitas" ? (
          <WorkspaceSection first title="Visitas" description="Histórico de visitas deste cliente.">
            {visitas.length ? (
              <ul className="flex flex-col gap-2">
                {visitas.map((visita) => (
                  <li
                    key={visita.id}
                    className="flex flex-col gap-1 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3 text-[0.82rem]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[var(--yzi-text-primary)]">{visita.imovel}</span>
                      <span className="text-[0.68rem] text-[var(--yzi-text-faint)]">{visita.data}</span>
                    </div>
                    <span className="text-[0.72rem] text-[var(--yzi-text-secondary)]">
                      Corretor: {visita.corretor} · {visita.status}
                    </span>
                    <span className="text-[0.72rem] text-[var(--yzi-text-faint)]">
                      Feedback: {visita.feedback}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[0.8rem] text-[var(--yzi-text-faint)]">
                Nenhuma visita registrada ainda.
              </p>
            )}
          </WorkspaceSection>
        ) : tab === "propostas" ? (
          <WorkspaceSection
            first
            title="Propostas"
            description="Demonstração — nenhuma proposta é real."
          >
            {propostas.length ? (
              <ul className="flex flex-col gap-2">
                {propostas.map((proposta) => (
                  <li
                    key={proposta.id}
                    className="flex flex-col gap-1 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3 text-[0.82rem]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[var(--yzi-text-primary)]">{proposta.imovel}</span>
                      <span
                        className="rounded-full border px-2.5 py-1 text-[0.66rem]"
                        style={{
                          borderColor: imobRgba("amber", 0.32),
                          backgroundColor: imobRgba("amber", 0.1),
                          color: imobRgba("amber", 0.95),
                        }}
                      >
                        {proposta.status}
                      </span>
                    </div>
                    <span className="text-[0.72rem] text-[var(--yzi-text-secondary)]">
                      Valor proposto: {proposta.valor}
                    </span>
                    <span className="text-[0.72rem] text-[var(--yzi-text-faint)]">
                      Próxima ação: {proposta.proximaAcao}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[0.8rem] text-[var(--yzi-text-faint)]">
                Nenhuma proposta ativa no momento.
              </p>
            )}
          </WorkspaceSection>
        ) : tab === "documentos" ? (
          <ComingSoonPanel
            label="Documentos"
            note="Em breve. Nenhum upload real acontece nesta demonstração."
          />
        ) : tab === "historico" ? (
          <WorkspaceSection first title="Histórico" description="Linha do tempo deste cliente.">
            <ul className="flex flex-col gap-1.5">
              {historico.map((item) => (
                <li
                  key={item.label}
                  className="flex items-start gap-2 text-[0.8rem] leading-snug text-[var(--yzi-text-secondary)]"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: imobRgba(item.role, 0.85) }}
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          </WorkspaceSection>
        ) : (
          <WorkspaceSection
            first
            title="Conhecimento da YZI"
            description="Preferências, contexto familiar, objeções, estilo de vida e urgência — usado pela YZI para sugerir imóveis compatíveis."
          >
            <WorkspaceTextarea
              label="Conhecimento da YZI"
              value={record.conhecimento}
              onChange={(value) => set("conhecimento", value)}
              rows={14}
              placeholder={
                "Descreva o que sabemos sobre este cliente.\n\nPreferências · contexto familiar · objeções · estilo de vida · urgência · notas importantes."
              }
            />
          </WorkspaceSection>
        )}

        <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
          Workspace de demonstração. Nenhum dado é salvo e nenhuma alteração acontece sem
          autorização.
        </p>
      </section>
    </div>
  );
}

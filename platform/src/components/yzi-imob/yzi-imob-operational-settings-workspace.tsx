"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { INITIAL_OPERATIONAL_SETTINGS_SAVE_STATE } from "@/app/cockpit/yzi-imob/configuracoes/action-state";
import { saveOperationalSettingsAction } from "@/app/cockpit/yzi-imob/configuracoes/actions";
import type {
  OperationalSettingsViewModel,
} from "@/lib/tenant/operational-settings";
import {
  CounterStrip,
  EntityHero,
  WorkspaceGrid,
  WorkspaceSection,
  WorkspaceTabs,
  cx,
  type CounterItem,
  type WorkspaceTab,
} from "@/components/yzi-imob/yzi-imob-workspace-kit";
import {
  WorkspaceDropdown,
  WorkspaceField,
  WorkspaceMultiSelect,
  WorkspaceTagInput,
  WorkspaceTextarea,
  WorkspaceToggle,
} from "@/components/yzi-imob/yzi-imob-workspace-fields";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";
import { YziPresence } from "@/components/yzi-os/yzi-primitives";

// Configurações Operacionais v1 — a MESMA configuração criada pelo Onboarding
// Operacional, agora como manutenção contínua: ler, revisar e atualizar, sem
// segundo cadastro. Estrutura da família aprovada: EntityHero → CounterStrip →
// abas → WorkspaceSections. O salvamento é real e passa pela mesma RPC do
// onboarding (payload completo, atômico); nada aqui finge persistência.

/* ------------------------------------------------------------------ */
/* Opções — os mesmos vocabulários canônicos do onboarding             */
/* ------------------------------------------------------------------ */

const UF_LIST = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const UF_OPTIONS = [
  { value: "", label: "Selecione" },
  ...UF_LIST.map((uf) => ({ value: uf, label: uf })),
];

const OPERATION_TYPE_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "imobiliaria", label: "Imobiliária" },
  { value: "alto-padrao", label: "Alto padrão" },
  { value: "lancamentos", label: "Lançamentos" },
  { value: "locacao", label: "Locação" },
  { value: "mista", label: "Operação mista" },
];

const COMMERCIAL_FOCUS_OPTIONS = ["Venda", "Locação", "Lançamentos", "Alto padrão"];

const PROPERTY_TYPE_OPTIONS = [
  "Apartamento",
  "Casa",
  "Terreno",
  "Comercial",
  "Lançamento",
  "Outros",
];

const LEAD_DISTRIBUTION_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "captador", label: "Prioridade para quem captou o imóvel" },
  { value: "rodizio", label: "Rodízio entre corretores" },
  { value: "manual", label: "Escolha manual do gestor" },
  { value: "yzi", label: "YZI recomenda por disponibilidade e perfil" },
];

const RESPONSE_TIME_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "5", label: "Até 5 minutos" },
  { value: "15", label: "Até 15 minutos" },
  { value: "30", label: "Até 30 minutos" },
  { value: "personalizado", label: "Personalizado" },
];

const POSITIONING_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "premium", label: "Premium" },
  { value: "proximo", label: "Próximo e consultivo" },
  { value: "direto", label: "Direto" },
  { value: "institucional", label: "Institucional" },
  { value: "personalizado", label: "Personalizado" },
];

const AUDIENCE_OPTIONS = [
  "Famílias",
  "Investidores",
  "Primeira compra",
  "Alto padrão",
  "Empresas",
  "Lançamentos",
];

const TONE_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "consultivo", label: "Consultivo" },
  { value: "sofisticado", label: "Sofisticado" },
  { value: "acolhedor", label: "Acolhedor" },
  { value: "objetivo", label: "Objetivo" },
];

const CHANNEL_OPTIONS = [
  "WhatsApp",
  "Site",
  "Instagram",
  "Facebook",
  "YouTube",
  "Portais imobiliários",
];

const SERVICE_DAY_OPTIONS = ["Segunda a sexta", "Sábado", "Domingo"];

const YZI_GOAL_OPTIONS = [
  "Organizar imóveis",
  "Qualificar leads",
  "Preparar conteúdo",
  "Agendar visitas",
  "Apoiar corretores",
];

const INVITE_ROLE_LABELS: Record<string, string> = {
  corretor: "Corretor",
  gestor: "Gestor",
  atendimento: "Atendimento",
};

const INVITE_STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando entrada na operação",
  sent: "Convite enviado",
  accepted: "Já faz parte da operação",
  revoked: "Convite cancelado",
};

/* ------------------------------------------------------------------ */
/* Draft editável — o mesmo shape do contrato do onboarding            */
/* ------------------------------------------------------------------ */

type SettingsDraft = {
  companyName: string;
  tradeName: string;
  city: string;
  state: string;
  whatsapp: string;
  email: string;
  website: string;
  cnpj: string;
  operationType: string;
  commercialFocus: string[];
  regions: string[];
  propertyTypes: string[];
  leadDistribution: string;
  standaloneCaptador: boolean;
  launchBelongsToOperation: boolean;
  captadorPriority: boolean;
  responseTime: string;
  responseTimeCustom: string;
  positioning: string;
  positioningCustom: string;
  audience: string[];
  tone: string;
  channels: string[];
  serviceDays: string[];
  serviceStart: string;
  serviceEnd: string;
  afterHoursYzi: boolean;
  yziGoals: string[];
  ownerName: string;
  ownerPhone: string;
  ownerRole: string;
};

function responseTimeFromMinutes(minutes: number | null): {
  responseTime: string;
  responseTimeCustom: string;
} {
  if (minutes === null) return { responseTime: "", responseTimeCustom: "" };
  if (minutes === 5 || minutes === 15 || minutes === 30) {
    return { responseTime: String(minutes), responseTimeCustom: "" };
  }
  return { responseTime: "personalizado", responseTimeCustom: String(minutes) };
}

function draftFromSettings(settings: OperationalSettingsViewModel): SettingsDraft {
  const responseTime = responseTimeFromMinutes(
    settings.operation?.responseTimeMinutes ?? null,
  );
  return {
    companyName: settings.companyName,
    tradeName: settings.profile?.tradeName ?? "",
    city: settings.profile?.city ?? "",
    state: settings.profile?.state ?? "",
    whatsapp: settings.profile?.whatsapp ?? "",
    email: settings.profile?.email ?? "",
    website: settings.profile?.website ?? "",
    cnpj: settings.profile?.cnpj ?? "",
    operationType: settings.profile?.operationType ?? "",
    commercialFocus: settings.operation?.commercialFocus ?? [],
    regions: settings.operation?.regions ?? [],
    propertyTypes: settings.operation?.propertyTypes ?? [],
    leadDistribution: settings.operation?.leadDistribution ?? "",
    standaloneCaptador: settings.operation?.standaloneCaptador ?? true,
    launchBelongsToOperation: settings.operation?.launchBelongsToOperation ?? true,
    captadorPriority: settings.operation?.captadorPriority ?? true,
    responseTime: responseTime.responseTime,
    responseTimeCustom: responseTime.responseTimeCustom,
    positioning: settings.brand?.positioning ?? "",
    positioningCustom: settings.brand?.positioningCustom ?? "",
    audience: settings.brand?.audience ?? [],
    tone: settings.brand?.tone ?? "",
    channels: settings.brand?.channels ?? [],
    serviceDays: settings.communication?.serviceDays ?? [],
    serviceStart: settings.communication?.serviceStart ?? "",
    serviceEnd: settings.communication?.serviceEnd ?? "",
    afterHoursYzi: settings.communication?.afterHoursYzi ?? true,
    yziGoals: settings.communication?.yziGoals ?? [],
    ownerName: settings.owner?.name ?? "",
    ownerPhone: settings.owner?.phone ?? "",
    ownerRole: settings.owner?.roleTitle ?? "",
  };
}

// Payload completo da RPC governada: as configurações são salvas em conjunto
// (contrato atômico do onboarding). Os convites pendentes da implantação são
// reenviados exatamente como estão para que a atualização não os apague.
function buildPayload(
  draft: SettingsDraft,
  settings: OperationalSettingsViewModel,
): string {
  const invites = settings.invitations
    .filter(
      (invite) => invite.onboardingPosition !== null && invite.status === "pending",
    )
    .map((invite) => ({
      name: invite.name,
      email: invite.email,
      whatsapp: invite.whatsapp,
      role: invite.roleIntent,
    }));

  const inviteMode =
    invites.length > 0 ? "agora" : settings.owner?.teamSetupMode ?? "depois";

  return JSON.stringify({
    ...draft,
    inviteMode,
    invites,
  });
}

/* ------------------------------------------------------------------ */
/* Estados incompletos — derivados só do que existe de verdade         */
/* ------------------------------------------------------------------ */

function pendingItems(draft: SettingsDraft, settings: OperationalSettingsViewModel) {
  const items: string[] = [];
  if (!settings.onboardingComplete) {
    items.push("A implantação inicial ainda não foi concluída.");
  }
  if (!draft.companyName || !draft.city || !draft.state) {
    items.push("Identificação da imobiliária (nome, cidade e estado).");
  }
  if (!draft.leadDistribution) items.push("Distribuição de leads não definida.");
  if (draft.commercialFocus.length === 0) items.push("Foco comercial não definido.");
  if (!draft.serviceStart || !draft.serviceEnd) {
    items.push("Horário de atendimento não definido.");
  }
  if (draft.serviceDays.length === 0) items.push("Dias de atendimento não definidos.");
  if (!draft.tone) items.push("Tom da comunicação não definido.");
  return items;
}

/* ------------------------------------------------------------------ */
/* Workspace                                                           */
/* ------------------------------------------------------------------ */

type TabId = "imobiliaria" | "operacao" | "marca" | "atendimento" | "equipe";

const TABS: WorkspaceTab[] = [
  { id: "imobiliaria", label: "Imobiliária" },
  { id: "operacao", label: "Operação" },
  { id: "marca", label: "Marca e comunicação" },
  { id: "atendimento", label: "Atendimento e YZI" },
  { id: "equipe", label: "Equipe e implantação" },
];

export function YziImobOperationalSettingsWorkspace({
  settings,
  canEdit,
}: {
  settings: OperationalSettingsViewModel;
  canEdit: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("imobiliaria");
  const [draft, setDraft] = useState<SettingsDraft>(() => draftFromSettings(settings));
  const [baseline, setBaseline] = useState<SettingsDraft>(draft);
  const [assistantNote, setAssistantNote] = useState<string | null>(null);

  const [saveState, saveAction, isSaving] = useActionState(
    saveOperationalSettingsAction,
    INITIAL_OPERATIONAL_SETTINGS_SAVE_STATE,
  );

  // Baseline acompanha o último save bem-sucedido: o draft enviado passa a
  // ser o estado "limpo".
  const submittedDraftRef = useRef<SettingsDraft | null>(null);
  const appliedRevisionRef = useRef(0);
  useEffect(() => {
    if (
      saveState.status === "saved" &&
      saveState.revision !== appliedRevisionRef.current &&
      submittedDraftRef.current
    ) {
      appliedRevisionRef.current = saveState.revision;
      setBaseline(submittedDraftRef.current);
    }
  }, [saveState]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(baseline),
    [draft, baseline],
  );

  // Alterações não salvas: aviso do navegador antes de sair da página.
  useEffect(() => {
    if (!isDirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  function set<K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const pending = pendingItems(draft, settings);
  const configured = settings.onboardingComplete && pending.length === 0;

  const pendingInvites = settings.invitations.filter(
    (invite) => invite.status === "pending" || invite.status === "sent",
  );

  const counters: CounterItem[] = [
    {
      label: "Configuração geral",
      value: configured ? "Completa" : "Incompleta",
      detail: configured
        ? "A YZI opera com o contexto definido aqui."
        : `${pending.length} ponto${pending.length === 1 ? "" : "s"} em aberto.`,
      accent: !configured,
    },
    {
      label: "Operação",
      value: draft.leadDistribution ? "Regras definidas" : "Sem regras",
      detail: draft.leadDistribution
        ? "Distribuição de leads e prioridades ativas."
        : "Defina como os leads são distribuídos.",
    },
    {
      label: "Atendimento",
      value:
        draft.serviceStart && draft.serviceEnd
          ? `${draft.serviceStart}–${draft.serviceEnd}`
          : "Sem horário",
      detail:
        draft.serviceStart && draft.serviceEnd
          ? draft.afterHoursYzi
            ? "Fora do horário, a YZI segue atendendo."
            : "Fora do horário, a YZI aguarda a equipe."
          : "Defina a janela de atendimento.",
    },
    {
      label: "Equipe",
      value: String(pendingInvites.length),
      detail:
        pendingInvites.length === 1
          ? "convite pendente de entrada."
          : "convites pendentes de entrada.",
    },
  ];

  function answer(text: string) {
    const normalized = text.trim().toLowerCase();
    if (!normalized) return;
    if (normalized.includes("incompleto")) {
      setAssistantNote(
        pending.length === 0
          ? "Nada está em aberto — sua configuração está completa. Sempre que a rotina mudar, atualize aqui."
          : `Pontos em aberto: ${pending.join(" ")}`,
      );
      return;
    }
    if (normalized.includes("operação") || normalized.includes("regras")) {
      setActiveTab("operacao");
      setAssistantNote("Abri a aba Operação — as regras de distribuição e captação ficam aqui.");
      return;
    }
    if (normalized.includes("atendimento")) {
      setActiveTab("atendimento");
      setAssistantNote("Abri a aba Atendimento e YZI — horários e comportamento ficam aqui.");
      return;
    }
    if (normalized.includes("equipe")) {
      setActiveTab("equipe");
      setAssistantNote("Abri a aba Equipe e implantação — responsável e convites ficam aqui.");
      return;
    }
    setAssistantNote(
      "Ainda não converso livremente nesta tela. Use as ações rápidas ou navegue pelas abas para revisar cada área.",
    );
  }

  const statusLabel = configured ? "Operação configurada" : "Configuração incompleta";

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 py-10">
      <EntityHero
        backHref="/cockpit/yzi-imob"
        backLabel="Início"
        kicker="Configurações"
        title="Configurações da operação"
        subtitle="Mantenha atualizadas as informações que orientam como a YZI organiza sua imobiliária, sua equipe e seu atendimento."
        statusLabel={statusLabel}
        composerPlaceholder="Pergunte sobre a configuração da sua operação"
        quickActions={[
          { label: "O que está incompleto?" },
          { label: "Revisar regras da operação" },
          { label: "Revisar atendimento" },
          { label: "Ver equipe pendente" },
        ]}
        assistantMessage={
          assistantNote ??
          "Estas definições orientam como eu organizo sua operação. Sempre que sua rotina mudar, atualize aqui para que eu continue trabalhando com o contexto correto."
        }
        onAsk={answer}
      />

      <CounterStrip counters={counters} />

      {!canEdit ? (
        <p className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-4 py-3 text-[0.78rem] text-[var(--yzi-text-secondary)]">
          Você pode ver estas configurações, mas somente quem administra a
          operação pode alterá-las.
        </p>
      ) : null}

      <div className="flex flex-col gap-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <WorkspaceTabs
            tabs={TABS}
            active={activeTab}
            onChange={(id) => setActiveTab(id as TabId)}
          />
          {isDirty ? (
            <span
              className="rounded-full border px-3 py-1 text-[0.7rem]"
              style={{
                borderColor: imobRgba("amber", 0.35),
                backgroundColor: imobRgba("amber", 0.1),
                color: imobRgba("amber", 0.95),
              }}
            >
              Alterações não salvas
            </span>
          ) : null}
        </div>

        {/* fieldset desabilita todos os controles quando o papel não permite
            editar — leitura honesta, sem botão que finge funcionar. */}
        <fieldset
          disabled={!canEdit || isSaving}
          className={cx("m-0 min-w-0 border-0 p-0", !canEdit && "opacity-90")}
        >
          {activeTab === "imobiliaria" ? (
            <ImobiliariaTab draft={draft} set={set} hasLogo={settings.profile?.hasLogo ?? false} />
          ) : null}
          {activeTab === "operacao" ? <OperacaoTab draft={draft} set={set} /> : null}
          {activeTab === "marca" ? <MarcaTab draft={draft} set={set} /> : null}
          {activeTab === "atendimento" ? (
            <AtendimentoTab draft={draft} set={set} />
          ) : null}
          {activeTab === "equipe" ? (
            <EquipeTab draft={draft} set={set} settings={settings} canEdit={canEdit} />
          ) : null}
        </fieldset>
      </div>

      {/* Barra de salvamento — o contrato é atômico: todas as áreas são salvas
          em conjunto, exatamente como no onboarding. */}
      {canEdit ? (
        <form
          action={saveAction}
          onSubmit={() => {
            submittedDraftRef.current = draft;
          }}
          className="flex flex-wrap items-center gap-3 border-t border-[color:var(--yzi-border-subtle)] pt-6"
        >
          <input type="hidden" name="payload" value={buildPayload(draft, settings)} />
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className={cx(
              "rounded-full border px-4 py-2 text-[0.8rem] font-medium transition-colors",
              isDirty && !isSaving
                ? "border-[color:rgba(var(--imob-ice),0.4)] bg-[rgba(var(--imob-cold),0.16)] text-[rgb(var(--imob-ice))] hover:bg-[rgba(var(--imob-cold),0.24)]"
                : "cursor-not-allowed border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-faint)] opacity-70",
            )}
          >
            {isSaving ? "Salvando…" : "Salvar alterações"}
          </button>
          <span className="text-[0.7rem] text-[var(--yzi-text-faint)]">
            As áreas são salvas em conjunto — uma única confirmação atualiza toda a
            configuração.
          </span>
          <span aria-live="polite" className="min-w-0">
            {isSaving ? (
              <span className="text-[0.74rem] text-[var(--yzi-text-secondary)]">
                Salvando alterações…
              </span>
            ) : saveState.status === "saved" && !isDirty ? (
              <span
                className="text-[0.74rem]"
                style={{ color: imobRgba("coldGreen", 0.95) }}
              >
                Alterações salvas.
              </span>
            ) : null}
          </span>
          {!isSaving && saveState.status === "error" ? (
            <span
              role="alert"
              className="w-full text-[0.76rem] leading-relaxed"
              style={{ color: "rgb(255,170,170)" }}
            >
              {saveState.message}
            </span>
          ) : null}
        </form>
      ) : null}

      <div className="flex items-start gap-2.5 text-[0.72rem] leading-relaxed text-[var(--yzi-text-faint)]">
        <YziPresence state="ready" />
        <p className="max-w-3xl">
          Estas configurações nasceram na implantação inicial e continuam vivas
          aqui — a YZI usa exatamente o que está definido nesta tela para
          organizar imóveis, leads, comunicação e equipe.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Abas                                                                */
/* ------------------------------------------------------------------ */

type TabProps = {
  draft: SettingsDraft;
  set: <K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) => void;
};

function ImobiliariaTab({ draft, set, hasLogo }: TabProps & { hasLogo: boolean }) {
  return (
    <div className="flex flex-col gap-7">
      <WorkspaceSection
        first
        title="Identificação"
        description="Estas informações identificam sua operação nos pontos em que sua marca precisa ser reconhecida."
      >
        <WorkspaceGrid>
          <WorkspaceField
            label="Nome da imobiliária"
            value={draft.companyName}
            onChange={(v) => set("companyName", v)}
            required
            autoComplete="organization"
          />
          <WorkspaceField
            label="Nome fantasia"
            value={draft.tradeName}
            onChange={(v) => set("tradeName", v)}
          />
          <WorkspaceField
            label="Cidade"
            value={draft.city}
            onChange={(v) => set("city", v)}
            required
          />
          <WorkspaceDropdown
            label="Estado"
            value={draft.state}
            onChange={(v) => set("state", v)}
            options={UF_OPTIONS}
            required
          />
        </WorkspaceGrid>
      </WorkspaceSection>

      <WorkspaceSection
        title="Contato"
        description="Canais oficiais pelos quais clientes e equipe encontram a imobiliária."
      >
        <WorkspaceGrid>
          <WorkspaceField
            label="WhatsApp principal"
            value={draft.whatsapp}
            onChange={(v) => set("whatsapp", v)}
            inputMode="tel"
            autoComplete="tel"
          />
          <WorkspaceField
            label="E-mail principal"
            value={draft.email}
            onChange={(v) => set("email", v)}
            type="email"
            inputMode="email"
            autoComplete="email"
          />
          <WorkspaceField
            label="Site"
            value={draft.website}
            onChange={(v) => set("website", v)}
            inputMode="url"
            placeholder="https://"
          />
          <WorkspaceField
            label="CNPJ"
            value={draft.cnpj}
            onChange={(v) => set("cnpj", v)}
            inputMode="numeric"
          />
        </WorkspaceGrid>
      </WorkspaceSection>

      <WorkspaceSection
        title="Perfil da operação"
        description="O tipo de operação orienta como a YZI prioriza imóveis e oportunidades."
      >
        <WorkspaceGrid>
          <WorkspaceDropdown
            label="Tipo de operação"
            value={draft.operationType}
            onChange={(v) => set("operationType", v)}
            options={OPERATION_TYPE_OPTIONS}
          />
        </WorkspaceGrid>
        <p className="text-[0.72rem] text-[var(--yzi-text-faint)]">
          {hasLogo
            ? "A logo da sua marca já está registrada."
            : "O envio da logo ainda não está disponível nesta tela — em preparação."}
        </p>
      </WorkspaceSection>
    </div>
  );
}

function OperacaoTab({ draft, set }: TabProps) {
  return (
    <div className="flex flex-col gap-7">
      <WorkspaceSection
        first
        title="Foco comercial"
        description="Essas regras orientam como a YZI organiza imóveis, oportunidades e participação da equipe."
      >
        <WorkspaceGrid>
          <WorkspaceMultiSelect
            label="Foco comercial"
            options={COMMERCIAL_FOCUS_OPTIONS}
            value={draft.commercialFocus}
            onChange={(v) => set("commercialFocus", v)}
            span2
          />
          <WorkspaceMultiSelect
            label="Tipos de imóveis"
            options={PROPERTY_TYPE_OPTIONS}
            value={draft.propertyTypes}
            onChange={(v) => set("propertyTypes", v)}
            span2
          />
          <WorkspaceTagInput
            label="Regiões principais"
            value={draft.regions}
            onChange={(v) => set("regions", v)}
            placeholder="Digite uma região e pressione Enter"
            hint="Bairros, zonas ou cidades atendidas pela operação."
            span2
          />
        </WorkspaceGrid>
      </WorkspaceSection>

      <WorkspaceSection
        title="Distribuição e captação"
        description="Como os leads chegam aos corretores e qual o papel de quem captou o imóvel."
      >
        <WorkspaceGrid>
          <WorkspaceDropdown
            label="Distribuição de leads"
            value={draft.leadDistribution}
            onChange={(v) => set("leadDistribution", v)}
            options={LEAD_DISTRIBUTION_OPTIONS}
          />
          <WorkspaceDropdown
            label="Tempo esperado de resposta"
            value={draft.responseTime}
            onChange={(v) => set("responseTime", v)}
            options={RESPONSE_TIME_OPTIONS}
          />
          {draft.responseTime === "personalizado" ? (
            <WorkspaceField
              label="Tempo personalizado (minutos)"
              value={draft.responseTimeCustom}
              onChange={(v) => set("responseTimeCustom", v)}
              inputMode="numeric"
              hint="Entre 1 e 1440 minutos."
            />
          ) : null}
        </WorkspaceGrid>
        <div className="flex flex-col gap-3">
          <WorkspaceToggle
            label="Captador tem prioridade"
            value={draft.captadorPriority}
            onChange={(v) => set("captadorPriority", v)}
            hint="Quem captou o imóvel recebe o lead primeiro."
          />
          <WorkspaceToggle
            label="Imóvel avulso tem captador"
            value={draft.standaloneCaptador}
            onChange={(v) => set("standaloneCaptador", v)}
            hint="Imóveis fora de lançamento têm um corretor captador definido."
          />
          <WorkspaceToggle
            label="Lançamentos pertencem à operação"
            value={draft.launchBelongsToOperation}
            onChange={(v) => set("launchBelongsToOperation", v)}
            hint="Leads de lançamento são da imobiliária, não de um corretor específico."
          />
        </div>
      </WorkspaceSection>
    </div>
  );
}

function MarcaTab({ draft, set }: TabProps) {
  return (
    <div className="flex flex-col gap-7">
      <WorkspaceSection
        first
        title="Posicionamento"
        description="Como a YZI se apresenta e escreve em nome da sua marca."
      >
        <WorkspaceGrid>
          <WorkspaceDropdown
            label="Posicionamento"
            value={draft.positioning}
            onChange={(v) => set("positioning", v)}
            options={POSITIONING_OPTIONS}
          />
          <WorkspaceDropdown
            label="Tom da comunicação"
            value={draft.tone}
            onChange={(v) => set("tone", v)}
            options={TONE_OPTIONS}
          />
          {draft.positioning === "personalizado" ? (
            <div className="sm:col-span-2">
              <WorkspaceTextarea
                label="Descreva o posicionamento"
                value={draft.positioningCustom}
                onChange={(v) => set("positioningCustom", v)}
                rows={3}
                placeholder="Como sua marca quer ser percebida"
              />
            </div>
          ) : null}
        </WorkspaceGrid>
      </WorkspaceSection>

      <WorkspaceSection
        title="Público e canais"
        description="Para quem a comunicação fala e onde ela acontece. Nenhum canal é conectado a partir daqui."
      >
        <WorkspaceGrid>
          <WorkspaceMultiSelect
            label="Público prioritário"
            options={AUDIENCE_OPTIONS}
            value={draft.audience}
            onChange={(v) => set("audience", v)}
            span2
          />
          <WorkspaceMultiSelect
            label="Canais utilizados"
            options={CHANNEL_OPTIONS}
            value={draft.channels}
            onChange={(v) => set("channels", v)}
            span2
          />
        </WorkspaceGrid>
        <p className="text-[0.72rem] text-[var(--yzi-text-faint)]">
          Cor da marca, estilo de linguagem e expressões proibidas ainda não são
          registrados — em preparação.
        </p>
      </WorkspaceSection>
    </div>
  );
}

function AtendimentoTab({ draft, set }: TabProps) {
  return (
    <div className="flex flex-col gap-7">
      <WorkspaceSection
        first
        title="Janela de atendimento"
        description="A YZI usa essas definições para responder e operar de acordo com a rotina da imobiliária."
      >
        <WorkspaceGrid>
          <WorkspaceMultiSelect
            label="Dias de atendimento"
            options={SERVICE_DAY_OPTIONS}
            value={draft.serviceDays}
            onChange={(v) => set("serviceDays", v)}
            span2
          />
          <WorkspaceField
            label="Início do atendimento"
            value={draft.serviceStart}
            onChange={(v) => set("serviceStart", v)}
            type="time"
          />
          <WorkspaceField
            label="Fim do atendimento"
            value={draft.serviceEnd}
            onChange={(v) => set("serviceEnd", v)}
            type="time"
          />
        </WorkspaceGrid>
        <WorkspaceToggle
          label="YZI atende fora do horário"
          value={draft.afterHoursYzi}
          onChange={(v) => set("afterHoursYzi", v)}
          hint="Fora da janela, a YZI acolhe o lead e organiza o retorno da equipe."
        />
      </WorkspaceSection>

      <WorkspaceSection
        title="Objetivo da YZI"
        description="O que a YZI prioriza no dia a dia da operação."
      >
        <WorkspaceGrid>
          <WorkspaceMultiSelect
            label="Objetivos"
            options={YZI_GOAL_OPTIONS}
            value={draft.yziGoals}
            onChange={(v) => set("yziGoals", v)}
            span2
          />
        </WorkspaceGrid>
        <p className="text-[0.72rem] text-[var(--yzi-text-faint)]">
          Automações e conexões reais de canais são configuradas em outra etapa —
          nada é ativado a partir desta tela.
        </p>
      </WorkspaceSection>
    </div>
  );
}

function EquipeTab({
  draft,
  set,
  settings,
  canEdit,
}: TabProps & { settings: OperationalSettingsViewModel; canEdit: boolean }) {
  const completedLabel = settings.owner?.completedAt
    ? new Date(settings.owner.completedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col gap-7">
      <WorkspaceSection
        first
        title="Responsável pela implantação"
        description="Quem respondeu pela configuração inicial da operação."
      >
        <WorkspaceGrid>
          <WorkspaceField
            label="Nome"
            value={draft.ownerName}
            onChange={(v) => set("ownerName", v)}
            autoComplete="name"
          />
          <WorkspaceField
            label="Telefone"
            value={draft.ownerPhone}
            onChange={(v) => set("ownerPhone", v)}
            inputMode="tel"
            autoComplete="tel"
          />
          <WorkspaceField
            label="Cargo"
            value={draft.ownerRole}
            onChange={(v) => set("ownerRole", v)}
          />
        </WorkspaceGrid>
        <p className="text-[0.72rem] text-[var(--yzi-text-faint)]">
          {completedLabel
            ? `Implantação concluída em ${completedLabel}.`
            : "A implantação inicial ainda não foi concluída."}
          {" "}
          Equipe configurada no modo{" "}
          {settings.owner?.teamSetupMode === "agora"
            ? "“convidar agora”"
            : "“adicionar depois”"}
          .
        </p>
      </WorkspaceSection>

      <WorkspaceSection
        title="Convites da implantação"
        description="Pessoas adicionadas durante a implantação. O envio real do convite ainda não acontece por aqui."
      >
        {!canEdit ? (
          <p className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-4 text-[0.78rem] text-[var(--yzi-text-secondary)]">
            Os convites da implantação são visíveis apenas para quem administra a
            operação.
          </p>
        ) : settings.invitations.length === 0 ? (
          <p className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-4 text-[0.78rem] text-[var(--yzi-text-secondary)]">
            Nenhum convite registrado na implantação. A gestão completa da equipe
            acontece em Corretores.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {settings.invitations.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-4 py-3"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="text-[0.82rem] font-medium text-[var(--yzi-text-primary)]">
                    {invite.name}
                    {invite.roleIntent ? (
                      <span className="ml-2 text-[0.7rem] font-normal text-[var(--yzi-text-secondary)]">
                        {INVITE_ROLE_LABELS[invite.roleIntent] ?? invite.roleIntent}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[0.7rem] text-[var(--yzi-text-faint)]">
                    {[invite.email, invite.whatsapp].filter(Boolean).join(" · ") ||
                      "Sem contato registrado"}
                  </span>
                </div>
                <span
                  className="rounded-full border px-2.5 py-1 text-[0.66rem]"
                  style={{
                    borderColor: imobRgba(
                      invite.status === "accepted" ? "coldGreen" : "amber",
                      0.32,
                    ),
                    backgroundColor: imobRgba(
                      invite.status === "accepted" ? "coldGreen" : "amber",
                      0.1,
                    ),
                    color: imobRgba(
                      invite.status === "accepted" ? "coldGreen" : "amber",
                      0.95,
                    ),
                  }}
                >
                  {INVITE_STATUS_LABELS[invite.status] ?? invite.status}
                </span>
              </div>
            ))}
          </div>
        )}
        <Link
          href="/cockpit/yzi-imob/corretores"
          className="w-fit rounded-full border border-[color:rgba(var(--imob-ice),0.35)] bg-[color:rgba(var(--imob-ice),0.1)] px-3.5 py-1.5 text-[0.78rem] font-medium text-[rgb(var(--imob-ice))] transition-colors hover:bg-[color:rgba(var(--imob-ice),0.16)]"
        >
          Abrir Corretores
        </Link>
      </WorkspaceSection>
    </div>
  );
}

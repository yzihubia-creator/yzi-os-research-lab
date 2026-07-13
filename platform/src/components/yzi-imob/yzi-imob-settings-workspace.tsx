"use client";

import { useState, type ReactElement } from "react";

import {
  BACKUP_FREQUENCY_OPTIONS,
  BRAND_TONE_OPTIONS,
  DEFAULT_BROKER_OPERATION_SETTINGS,
  DEMO_ACTIVE_SESSIONS,
  DEMO_AUTOMATION_RULES,
  DEMO_BRAND_SETTINGS,
  DEMO_COMPANY_SETTINGS,
  DEMO_LAST_BACKUP_LABEL,
  DEMO_PERMISSION_ROWS,
  DEMO_SEO_SETTINGS,
  DEMO_SITE_SETTINGS,
  DEMO_WHATSAPP_SETTINGS,
  FALLBACK_MODE_OPTIONS,
  IA_APPROVAL_REQUIRED_ACTIONS,
  IA_AUTONOMOUS_ACTIONS,
  LAUNCH_ELIGIBILITY_OPTIONS,
  SETTINGS_SECTIONS,
  SYSTEM_ENVIRONMENT_LABEL,
  SYSTEM_VERSION_LABEL,
  describeBrokerOperation,
  type AutomationRule,
  type BackupFrequency,
  type BrandSettings,
  type BrandTone,
  type BrokerOperationSettings,
  type CompanySettings,
  type FallbackMode,
  type LaunchEligibility,
  type SeoSettings,
  type SettingsSectionId,
  type SiteSettings,
  type WhatsappSettings,
} from "@/components/yzi-imob/yzi-imob-settings-mock";
import {
  WorkspaceGrid,
  WorkspaceSection,
  cx,
} from "@/components/yzi-imob/yzi-imob-workspace-kit";
import {
  WorkspaceDropdown,
  WorkspaceField,
  WorkspaceTextarea,
  WorkspaceToggle,
} from "@/components/yzi-imob/yzi-imob-workspace-fields";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";
import { YziPresence } from "@/components/yzi-os/yzi-primitives";

// Configurações do YZI IMOB — onde a imobiliária define como opera, não um
// cemitério de opções. Sub-nav lateral de seções + uma seção por vez no
// canvas. Só "Corretores" é editável neste MVP (estado local, mock honesto:
// nada é salvo nem aplicado); as demais se declaram em preparação. Política
// comercial é placeholder sem campos. Sem botão "Salvar" fake — ausência
// honesta em vez de persistência fingida.

function numberField(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? fallback : parsed;
}

/* ------------------------------------------------------------------ */
/* Eco operacional — como as regras "aparecem" na operação             */
/* ------------------------------------------------------------------ */

function OperationEcho({ settings }: { settings: BrokerOperationSettings }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-[var(--yzi-radius-lg)] border px-5 py-5"
      style={{
        borderColor: imobRgba("cyan", 0.3),
        backgroundColor: imobRgba("cyan", 0.07),
      }}
    >
      <div className="flex items-center gap-2.5">
        <YziPresence state="ready" animated />
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--yzi-text-primary)]">
          Como a YZI vai operar com essas regras
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {describeBrokerOperation(settings).map((line) => (
          <li key={line} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: imobRgba("cyan", 0.85) }}
            />
            <span className="text-[0.8rem] leading-relaxed text-[var(--yzi-text-primary)]">
              {line}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[0.68rem] text-[var(--yzi-text-faint)]">
        A YZI segue exatamente o que está definido acima — nada além disso.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Seção Corretores — a única ativa no MVP                             */
/* ------------------------------------------------------------------ */

function BrokerRulesSection() {
  const [settings, setSettings] = useState<BrokerOperationSettings>(
    DEFAULT_BROKER_OPERATION_SETTINGS,
  );

  function set<K extends keyof BrokerOperationSettings>(
    key: K,
    value: BrokerOperationSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-7">
      <WorkspaceSection
        first
        title="Prioridade do captador"
        description="Corretor que capta o imóvel recebe o lead primeiro. A prioridade depende de disponibilidade, aceite e prazo — não é propriedade do imóvel."
      >
        <WorkspaceGrid>
          <WorkspaceField
            label="Prazo de prioridade (minutos)"
            value={String(settings.captadorPriorityMinutes)}
            onChange={(value) =>
              set(
                "captadorPriorityMinutes",
                numberField(value, settings.captadorPriorityMinutes),
              )
            }
            hint="Tempo que o captador tem para aceitar antes da reoferta."
          />
        </WorkspaceGrid>
      </WorkspaceSection>

      <WorkspaceSection
        title="Janela e aceite"
        description="Quando os prazos correm e o que acontece quando o corretor não responde."
      >
        <WorkspaceGrid>
          <WorkspaceField
            label="Início da janela de atendimento"
            value={settings.atendimentoWindowStart}
            onChange={(value) => set("atendimentoWindowStart", value)}
            placeholder="08:00"
          />
          <WorkspaceField
            label="Fim da janela de atendimento"
            value={settings.atendimentoWindowEnd}
            onChange={(value) => set("atendimentoWindowEnd", value)}
            placeholder="20:00"
          />
          <WorkspaceDropdown
            label="Quando o corretor não responde"
            value={settings.fallbackMode}
            onChange={(value) => set("fallbackMode", value as FallbackMode)}
            options={FALLBACK_MODE_OPTIONS}
          />
        </WorkspaceGrid>
      </WorkspaceSection>

      <WorkspaceSection
        title="Lançamentos"
        description="Leads quentes de lançamento disparam para os elegíveis — o primeiro que aceitar assume."
      >
        <WorkspaceGrid>
          <WorkspaceDropdown
            label="Quem recebe o disparo"
            value={settings.launchEligibility}
            onChange={(value) => set("launchEligibility", value as LaunchEligibility)}
            options={LAUNCH_ELIGIBILITY_OPTIONS}
          />
          <WorkspaceField
            label="Prazo de aceite (minutos)"
            value={String(settings.launchAcceptMinutes)}
            onChange={(value) =>
              set("launchAcceptMinutes", numberField(value, settings.launchAcceptMinutes))
            }
            hint="Janela da corrida de aceite entre os elegíveis."
          />
        </WorkspaceGrid>
      </WorkspaceSection>

      <WorkspaceSection
        title="Feedback e pendências"
        description="O feedback pós-visita atualiza o estado do lead e do imóvel. Pendências geram bloqueio leve, nunca punição."
      >
        <div className="flex flex-col gap-4">
          <WorkspaceToggle
            label="Feedback pós-visita obrigatório"
            value={settings.feedbackObrigatorio}
            onChange={(value) => set("feedbackObrigatorio", value)}
            hint="A YZI pede o retorno pelo WhatsApp após cada visita."
          />
          <WorkspaceGrid>
            <WorkspaceField
              label="Prazo do feedback (horas)"
              value={String(settings.feedbackDeadlineHours)}
              onChange={(value) =>
                set(
                  "feedbackDeadlineHours",
                  numberField(value, settings.feedbackDeadlineHours),
                )
              }
              hint="Sem retorno nesse prazo, vira pendência na fila."
            />
            <WorkspaceField
              label="Pendências para pausar ofertas"
              value={String(settings.softBlockThreshold)}
              onChange={(value) =>
                set("softBlockThreshold", numberField(value, settings.softBlockThreshold))
              }
              hint="Só vale com o bloqueio leve ligado."
            />
          </WorkspaceGrid>
          <WorkspaceToggle
            label="Bloqueio leve por pendência"
            value={settings.softBlockOnPendency}
            onChange={(value) => set("softBlockOnPendency", value)}
            hint="Pausa novas ofertas até o corretor resolver as pendências."
          />
        </div>
      </WorkspaceSection>

      <OperationEcho settings={settings} />

      {/* Política Comercial — placeholder futuro, sem campos. */}
      <WorkspaceSection
        title="Política Comercial"
        description="Divisão de corretagem e comissão são decisão da sua imobiliária."
      >
        <div
          className="rounded-[var(--yzi-radius-md)] border border-dashed px-4 py-4"
          style={{ borderColor: imobRgba("graphite", 0.45) }}
        >
          <p className="text-[0.8rem] text-[var(--yzi-text-secondary)]">
            Em preparação — nada é aplicado pelo sistema hoje. Quando estiver
            pronta, esta seção vai guardar as regras comerciais definidas por
            vocês, sem interferir na fila de atendimento.
          </p>
        </div>
      </WorkspaceSection>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Demonstração — nota curta reutilizada em cada seção mock             */
/* ------------------------------------------------------------------ */

function DemoNote({ text }: { text: string }) {
  return <p className="text-[0.72rem] text-[var(--yzi-text-faint)]">{text}</p>;
}

/* ------------------------------------------------------------------ */
/* Empresa                                                             */
/* ------------------------------------------------------------------ */

function CompanySection() {
  const [company, setCompany] = useState<CompanySettings>(DEMO_COMPANY_SETTINGS);
  function set<K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) {
    setCompany((current) => ({ ...current, [key]: value }));
  }
  return (
    <WorkspaceSection
      first
      title="Empresa"
      description="Dados jurídicos usados em contratos, site e materiais oficiais."
    >
      <WorkspaceGrid>
        <WorkspaceField label="Razão social" value={company.razaoSocial} onChange={(v) => set("razaoSocial", v)} />
        <WorkspaceField label="CNPJ" value={company.cnpj} onChange={(v) => set("cnpj", v)} />
        <WorkspaceField label="CRECI jurídico" value={company.creciJuridico} onChange={(v) => set("creciJuridico", v)} />
        <WorkspaceField label="Cidade sede" value={company.cidadeSede} onChange={(v) => set("cidadeSede", v)} />
        <WorkspaceField label="Telefone" value={company.telefone} onChange={(v) => set("telefone", v)} />
        <WorkspaceField label="Email" value={company.email} onChange={(v) => set("email", v)} />
      </WorkspaceGrid>
      <DemoNote text="Demonstração — dados de exemplo, nada é salvo." />
    </WorkspaceSection>
  );
}

/* ------------------------------------------------------------------ */
/* Marca                                                               */
/* ------------------------------------------------------------------ */

function BrandSection() {
  const [brand, setBrand] = useState<BrandSettings>(DEMO_BRAND_SETTINGS);
  function set<K extends keyof BrandSettings>(key: K, value: BrandSettings[K]) {
    setBrand((current) => ({ ...current, [key]: value }));
  }
  return (
    <WorkspaceSection
      first
      title="Marca"
      description="Como a YZI se apresenta em nome da sua imobiliária."
    >
      <WorkspaceGrid>
        <WorkspaceField label="Nome exibido" value={brand.nomeExibido} onChange={(v) => set("nomeExibido", v)} />
        <div className="flex items-end gap-3">
          <WorkspaceField label="Cor primária" value={brand.corPrimaria} onChange={(v) => set("corPrimaria", v)} />
          <span
            aria-hidden
            className="mb-0.5 h-9 w-9 shrink-0 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)]"
            style={{ backgroundColor: brand.corPrimaria }}
          />
        </div>
        <WorkspaceDropdown
          label="Tom de voz"
          value={brand.tom}
          onChange={(v) => set("tom", v as BrandTone)}
          options={BRAND_TONE_OPTIONS}
        />
      </WorkspaceGrid>
      <DemoNote text="Demonstração — nenhum material real é gerado a partir daqui." />
    </WorkspaceSection>
  );
}

/* ------------------------------------------------------------------ */
/* Site                                                                */
/* ------------------------------------------------------------------ */

function SiteSection() {
  const [site, setSite] = useState<SiteSettings>(DEMO_SITE_SETTINGS);
  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSite((current) => ({ ...current, [key]: value }));
  }
  return (
    <WorkspaceSection
      first
      title="Site"
      description="O que aparece na vitrine pública de imóveis."
    >
      <WorkspaceGrid>
        <WorkspaceField label="Domínio" value={site.dominio} readOnly onChange={() => {}} />
        <WorkspaceField
          label="Status de publicação"
          value={site.status === "publicado" ? "Publicado" : "Rascunho"}
          readOnly
          onChange={() => {}}
        />
      </WorkspaceGrid>
      <WorkspaceToggle
        label="Aceitar leads pelo site"
        value={site.aceitaLeadsPeloSite}
        onChange={(v) => set("aceitaLeadsPeloSite", v)}
        hint="Com o toggle desligado, o formulário do site fica visível, mas não envia."
      />
      <DemoNote text="Demonstração — nenhuma página real é publicada a partir daqui." />
    </WorkspaceSection>
  );
}

/* ------------------------------------------------------------------ */
/* SEO                                                                 */
/* ------------------------------------------------------------------ */

function SeoSection() {
  const [seo, setSeo] = useState<SeoSettings>(DEMO_SEO_SETTINGS);
  function set<K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) {
    setSeo((current) => ({ ...current, [key]: value }));
  }
  return (
    <WorkspaceSection
      first
      title="SEO"
      description="Como o site aparece nos resultados de busca."
    >
      <WorkspaceGrid>
        <WorkspaceField label="Título do site" value={seo.tituloSite} onChange={(v) => set("tituloSite", v)} span2 />
      </WorkspaceGrid>
      <WorkspaceTextareaField
        value={seo.metaDescription}
        onChange={(v) => set("metaDescription", v)}
      />
      <WorkspaceToggle
        label="Indexável pelo Google"
        value={seo.indexavel}
        onChange={(v) => set("indexavel", v)}
        hint="Desligado, o site fica fora dos resultados de busca."
      />
      <DemoNote text="Demonstração — nenhuma alteração real de indexação acontece." />
    </WorkspaceSection>
  );
}

// Pequeno wrapper local para reaproveitar WorkspaceTextarea com label fixo.
function WorkspaceTextareaField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <WorkspaceGrid>
      <div className="sm:col-span-2">
        <WorkspaceTextarea
          label="Meta description"
          value={value}
          onChange={onChange}
          rows={3}
        />
      </div>
    </WorkspaceGrid>
  );
}

/* ------------------------------------------------------------------ */
/* WhatsApp                                                            */
/* ------------------------------------------------------------------ */

function WhatsappSection() {
  const [wa, setWa] = useState<WhatsappSettings>(DEMO_WHATSAPP_SETTINGS);
  function set<K extends keyof WhatsappSettings>(key: K, value: WhatsappSettings[K]) {
    setWa((current) => ({ ...current, [key]: value }));
  }
  return (
    <WorkspaceSection
      first
      title="WhatsApp"
      description="Número conectado e janela em que a YZI atende os leads."
    >
      <div
        className="flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem]"
        style={{
          borderColor: imobRgba(wa.conectado ? "coldGreen" : "amber", 0.32),
          backgroundColor: imobRgba(wa.conectado ? "coldGreen" : "amber", 0.1),
          color: imobRgba(wa.conectado ? "coldGreen" : "amber", 0.95),
        }}
      >
        {wa.conectado ? "Conectado — demonstração" : "Desconectado — demonstração"}
      </div>
      <WorkspaceGrid>
        <WorkspaceField label="Número conectado" value={wa.numeroConectado} readOnly onChange={() => {}} />
        <WorkspaceField label="Início da janela" value={wa.janelaInicio} onChange={(v) => set("janelaInicio", v)} />
        <WorkspaceField label="Fim da janela" value={wa.janelaFim} onChange={(v) => set("janelaFim", v)} />
      </WorkspaceGrid>
      <DemoNote text="Demonstração — nenhuma conexão real com o WhatsApp acontece aqui." />
    </WorkspaceSection>
  );
}

/* ------------------------------------------------------------------ */
/* IA — política do produto, read-only                                 */
/* ------------------------------------------------------------------ */

function IaSection() {
  return (
    <WorkspaceSection
      first
      title="IA"
      description="O que é regra do produto YZI, igual para todos os tenants — não configurável."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[var(--yzi-text-secondary)]">
            A YZI faz sozinha
          </p>
          <ul className="flex flex-col gap-1.5">
            {IA_AUTONOMOUS_ACTIONS.map((action) => (
              <li key={action} className="text-[0.8rem] text-[var(--yzi-text-primary)]">
                {action}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[var(--yzi-text-secondary)]">
            A YZI sempre pede aprovação
          </p>
          <ul className="flex flex-col gap-1.5">
            {IA_APPROVAL_REQUIRED_ACTIONS.map((action) => (
              <li key={action} className="text-[0.8rem] text-[var(--yzi-text-primary)]">
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <DemoNote text="Lista de referência — não é configurável por tenant." />
    </WorkspaceSection>
  );
}

/* ------------------------------------------------------------------ */
/* Automações                                                          */
/* ------------------------------------------------------------------ */

function AutomationsSection() {
  const [rules, setRules] = useState<AutomationRule[]>(DEMO_AUTOMATION_RULES);
  function toggle(id: string) {
    setRules((current) =>
      current.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)),
    );
  }
  return (
    <WorkspaceSection
      first
      title="Automações"
      description="Rotinas automáticas de apoio à operação."
    >
      <div className="flex flex-col gap-3">
        {rules.map((rule) => (
          <WorkspaceToggle
            key={rule.id}
            label={rule.label}
            value={rule.enabled}
            onChange={() => toggle(rule.id)}
            hint={rule.description}
          />
        ))}
      </div>
      <DemoNote text="Demonstração — nenhuma automação dispara de verdade." />
    </WorkspaceSection>
  );
}

/* ------------------------------------------------------------------ */
/* Permissões (read-only)                                              */
/* ------------------------------------------------------------------ */

function PermissionsSection() {
  return (
    <WorkspaceSection
      first
      title="Permissões"
      description="Quem vê e quem faz o quê dentro da plataforma."
    >
      <div className="flex flex-col gap-2">
        {DEMO_PERMISSION_ROWS.map((row) => (
          <div
            key={row.papel}
            className="flex flex-col gap-0.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-4 py-3"
          >
            <span className="text-[0.82rem] font-medium text-[var(--yzi-text-primary)]">{row.papel}</span>
            <span className="text-[0.74rem] text-[var(--yzi-text-secondary)]">{row.descricao}</span>
          </div>
        ))}
      </div>
      <DemoNote text="Demonstração — papéis ilustrativos; edição de permissões é FUTURO." />
    </WorkspaceSection>
  );
}

/* ------------------------------------------------------------------ */
/* Segurança                                                           */
/* ------------------------------------------------------------------ */

function SecuritySection() {
  const [require2fa, setRequire2fa] = useState(false);
  return (
    <WorkspaceSection
      first
      title="Segurança"
      description="Acessos ativos e proteção da conta da imobiliária."
    >
      <div className="flex flex-col gap-2">
        {DEMO_ACTIVE_SESSIONS.map((session) => (
          <div
            key={session.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-4 py-3"
          >
            <div className="flex flex-col">
              <span className="text-[0.8rem] text-[var(--yzi-text-primary)]">{session.device}</span>
              <span className="text-[0.7rem] text-[var(--yzi-text-faint)]">{session.location}</span>
            </div>
            <span className="text-[0.7rem] text-[var(--yzi-text-secondary)]">{session.lastActiveLabel}</span>
          </div>
        ))}
      </div>
      <WorkspaceToggle
        label="Exigir autenticação em duas etapas"
        value={require2fa}
        onChange={setRequire2fa}
        hint="Em preparação — o toggle não ativa nada ainda."
      />
      <DemoNote text="Demonstração — sessões ilustrativas, nenhum acesso real é encerrado daqui." />
    </WorkspaceSection>
  );
}

/* ------------------------------------------------------------------ */
/* Backups                                                             */
/* ------------------------------------------------------------------ */

function BackupsSection() {
  const [frequency, setFrequency] = useState<BackupFrequency>("diario");
  return (
    <WorkspaceSection
      first
      title="Backups"
      description="Cópias dos dados operacionais e como recuperá-los."
    >
      <WorkspaceGrid>
        <WorkspaceField label="Última cópia" value={DEMO_LAST_BACKUP_LABEL} readOnly onChange={() => {}} />
        <WorkspaceDropdown
          label="Frequência"
          value={frequency}
          onChange={(v) => setFrequency(v as BackupFrequency)}
          options={BACKUP_FREQUENCY_OPTIONS}
        />
      </WorkspaceGrid>
      <button
        type="button"
        disabled
        title="Em preparação"
        className="w-fit cursor-not-allowed rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3.5 py-2 text-[0.78rem] text-[var(--yzi-text-faint)] opacity-60"
      >
        Gerar cópia agora
      </button>
      <DemoNote text="Em preparação — nenhuma cópia real é gerada ou recuperada daqui." />
    </WorkspaceSection>
  );
}

/* ------------------------------------------------------------------ */
/* Sistema                                                             */
/* ------------------------------------------------------------------ */

function SystemSection() {
  return (
    <WorkspaceSection
      first
      title="Sistema"
      description="Ambiente e versão em que esta plataforma está rodando."
    >
      <WorkspaceGrid>
        <WorkspaceField label="Ambiente" value={SYSTEM_ENVIRONMENT_LABEL} readOnly onChange={() => {}} />
        <WorkspaceField label="Versão" value={SYSTEM_VERSION_LABEL} readOnly onChange={() => {}} />
      </WorkspaceGrid>
      <DemoNote text="Demonstração — uso de créditos e faturamento reais são FUTURO." />
    </WorkspaceSection>
  );
}

// Agrupamento da sub-nav — leitura por área, na ordem em que a imobiliária
// pensa: primeiro como opera, depois quem ela é, onde aparece e a conta.
const NAV_GROUPS: Array<{ label: string; ids: SettingsSectionId[] }> = [
  { label: "Operação", ids: ["corretores", "ia", "automacoes"] },
  { label: "Identidade", ids: ["empresa", "marca"] },
  { label: "Presença", ids: ["site", "seo", "whatsapp"] },
  { label: "Conta", ids: ["permissoes", "seguranca", "backups", "sistema"] },
];

const SECTION_COMPONENTS: Partial<Record<SettingsSectionId, () => ReactElement>> = {
  empresa: CompanySection,
  marca: BrandSection,
  site: SiteSection,
  seo: SeoSection,
  whatsapp: WhatsappSection,
  ia: IaSection,
  automacoes: AutomationsSection,
  permissoes: PermissionsSection,
  seguranca: SecuritySection,
  backups: BackupsSection,
  sistema: SystemSection,
};

/* ------------------------------------------------------------------ */
/* Workspace                                                           */
/* ------------------------------------------------------------------ */

export function YziImobSettingsWorkspace() {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("corretores");
  const active = SETTINGS_SECTIONS.find((section) => section.id === activeSection)!;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-8 py-10">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">
          Configurações
        </h1>
        <p className="text-[0.82rem] text-[var(--yzi-text-secondary)]">
          Como a sua imobiliária opera. A YZI segue o que está definido aqui.
        </p>
      </header>

      <div className="flex flex-col gap-8 md:flex-row md:gap-10">
        {/* Sub-nav de seções — agrupada como navegação, não lista plana.
            Mesma gramática dos grupos da sidebar (eyebrow leve + itens). */}
        <nav className="flex shrink-0 flex-col gap-6 md:w-52">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <span className="px-3 pb-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-[var(--yzi-text-faint)]">
                {group.label}
              </span>
              {group.ids.map((id) => {
                const section = SETTINGS_SECTIONS.find((entry) => entry.id === id);
                if (!section) return null;
                const isActive = section.id === activeSection;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cx(
                      "flex items-center justify-between gap-2 rounded-[var(--yzi-radius-sm)] px-3 py-2 text-left text-[0.8rem] transition-colors",
                      isActive
                        ? "bg-[var(--yzi-surface-base)] font-medium text-[var(--yzi-text-primary)] shadow-[var(--yzi-edge-highlight)]"
                        : "text-[var(--yzi-text-secondary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--yzi-text-primary)]",
                    )}
                  >
                    <span>{section.label}</span>
                    <span
                      aria-hidden
                      title={section.status === "ativa" ? "Regra ativa" : "Demonstração"}
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          section.status === "ativa"
                            ? imobRgba("coldGreen", 0.9)
                            : imobRgba("cyan", 0.45),
                      }}
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Largura de leitura limitada — reduz a sensação de formulário longo. */}
        <div className="min-w-0 flex-1 md:max-w-3xl">
          {active.id === "corretores" ? (
            <BrokerRulesSection />
          ) : SECTION_COMPONENTS[active.id] ? (
            (() => {
              const SectionComponent = SECTION_COMPONENTS[active.id]!;
              return <SectionComponent />;
            })()
          ) : (
            <div className="flex flex-col gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-5 py-6 shadow-[var(--yzi-edge-highlight)]">
              <h2 className="text-[0.95rem] font-semibold text-[var(--yzi-text-primary)]">
                {active.label}
              </h2>
              <p className="text-[0.8rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                {active.description}
              </p>
              <p className="text-[0.72rem] text-[var(--yzi-text-faint)]">
                Em preparação — esta seção ainda não está configurável.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
        Demonstração — nada é salvo e nenhuma regra é aplicada à operação ainda.
      </p>
    </section>
  );
}

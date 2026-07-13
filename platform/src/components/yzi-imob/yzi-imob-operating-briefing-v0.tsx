import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";

import {
  ActionsIcon,
  AuthorizationIcon,
  CommandCenterIcon,
  RadarIcon,
} from "@/components/yzi-os/yzi-icons";
import {
  YziAlert,
  YziBadge,
  YziDivider,
  YziPanel,
  YziPresence,
  YziStatusBadge,
} from "@/components/yzi-os/yzi-primitives";

// YZI IMOB Operating Briefing (v0) — a Home da Operating Surface. Quando o gestor
// abre o dia, a YZI mostra, NESTA ordem (yzi-imob-ux-composition-v1): (1) a
// prioridade do dia; (2) o que aguarda autorização; (3) o que está travado;
// (4) sinais do Radar; e ela mesma aparece como presença operacional, nunca
// como chatbot.
//
// Runtime INVISÍVEL: esta tela não invoca intent, workflow, tool nem
// fingerprint. Não toca banco, API, Supabase ou credenciais. Todo o conteúdo
// abaixo é DADO DE EXEMPLO, declarado como exemplo, e reutiliza o Dashboard
// Visual System (primitives + tokens) sem arquitetura paralela.
//
// Limites da Operating Surface respeitados: no máximo uma decisão principal por
// bloco, três ações relevantes na tela (Revisar publicação · Ver aprovações ·
// Conectar canal) e cinco indicadores simultâneos.

type BriefingItem = {
  id: string;
  title: string;
  detail: string;
  channel: string;
  tone: "authorization" | "blocked" | "risk" | "opportunity";
  status: string;
};

// A prioridade do dia: uma única decisão de maior impacto, em uma frase.
const PRIORITY = {
  operationalId: "IMV-2041",
  channel: "Meta Ads · página do site",
  decision:
    "Publicar o imóvel da Vila Nova é a decisão de maior impacto agora.",
  currentState: "Página, copy e público sugerido prontos. Falta sua autorização.",
  yziPrepared:
    "A YZI montou a página, escreveu a copy e sugeriu o público. Não publica sozinha.",
  humanDependency: "Publicação exige sua autorização.",
  evidence: "18 leads em um imóvel semelhante no mês passado.",
};

// O que aguarda autorização dele (aprovações pendentes).
const APPROVALS: BriefingItem[] = [
  {
    id: "IMV-1802",
    title: "Criativo do imóvel Jardim",
    detail: "YZI gerou o criativo. Uso externo exige sua aprovação.",
    channel: "Creative Studio",
    tone: "authorization",
    status: "Aguardando criativo",
  },
  {
    id: "CMP-334",
    title: "Campanha Vila Nova",
    detail: "Campanha montada por imóvel. Orçamento aguarda você.",
    channel: "Meta Ads",
    tone: "authorization",
    status: "Aguardando orçamento",
  },
  {
    id: "LEAD-771",
    title: "Atribuição de lead ao corretor",
    detail: "Corretor recomendado com motivo. Política do tenant pede confirmar.",
    channel: "Assignment Engine",
    tone: "authorization",
    status: "Aguardando confirmação",
  },
];

// O que está travado esperando ação.
const BLOCKS: BriefingItem[] = [
  {
    id: "CATALOGO",
    title: "Catálogo sem canal conectado",
    detail: "Conecte um canal para iniciar a leitura.",
    channel: "Conexões",
    tone: "blocked",
    status: "Bloqueado",
  },
  {
    id: "IMV-1990",
    title: "Imóvel sem fotos aprovadas",
    detail: "Sem foto aprovada a página não publica.",
    channel: "Property Catalog",
    tone: "blocked",
    status: "Bloqueado",
  },
];

// Sinais do Radar que valem atenção. Leitura, não análise: cada sinal traz
// evidência e volume ao lado, sem gráfico e sem CTA (análise sob demanda).
const RADAR: BriefingItem[] = [
  {
    id: "RDR-Centro",
    title: "Busca por 2 quartos no Centro subindo",
    detail: "Alta de 40% na semana. Vale um imóvel dedicado.",
    channel: "Lead Intelligence",
    tone: "opportunity",
    status: "Oportunidade",
  },
  {
    id: "CMP-201",
    title: "Custo por lead acima da meta",
    detail: "Anúncio ativo com custo acima do alvo do tenant.",
    channel: "Tráfego",
    tone: "risk",
    status: "Atenção",
  },
];

// Ação navegável com aparência de botão do visual system. Usamos <Link> (âncora)
// em vez de YziButton porque estas ações levam a rotas reais do cockpit.
const ACTION_VARIANTS = {
  primary:
    "border-transparent bg-[var(--yzi-accent-action)] px-4 py-2 text-sm text-[#04231F] shadow-[var(--yzi-glow-action)] hover:brightness-110",
  authorization:
    "border-[color:rgba(167,139,250,0.45)] bg-[var(--yzi-accent-authorization-soft)] px-3 py-1.5 text-xs text-[var(--yzi-accent-authorization)] hover:border-[color:rgba(167,139,250,0.65)]",
  secondary:
    "border-[color:var(--yzi-border-strong)] bg-[var(--yzi-surface-base)] px-3 py-1.5 text-xs text-[var(--yzi-text-primary)] hover:bg-[var(--yzi-surface-elevated)]",
} as const;

function LinkAction({
  href,
  variant,
  children,
}: {
  href: string;
  variant: keyof typeof ACTION_VARIANTS;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--yzi-radius-sm)] border font-semibold tracking-[0.01em] transition-[background,border-color,filter] duration-[var(--duration-fast)] ease-[var(--ease-standard)] ${ACTION_VARIANTS[variant]}`}
    >
      {children}
    </Link>
  );
}

function BlockHeading({
  icon: Icon,
  presence,
  eyebrow,
  title,
}: {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  presence?: "blocked";
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="grid h-7 w-7 shrink-0 place-items-center rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] text-[var(--yzi-text-secondary)]"
      >
        {presence ? (
          <YziPresence state="blocked" />
        ) : Icon ? (
          <Icon className="h-4 w-4" />
        ) : null}
      </span>
      <div className="flex flex-col">
        <span className="text-[0.58rem] font-medium uppercase tracking-[0.2em] text-[var(--yzi-text-faint)]">
          {eyebrow}
        </span>
        <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
          {title}
        </h2>
      </div>
    </div>
  );
}

function ItemRow({ item }: { item: BriefingItem }) {
  return (
    <li className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-[var(--yzi-text-primary)]">
            {item.title}
          </span>
          <YziBadge tone="neutral" className="shrink-0 font-mono text-[10px]">
            {item.id}
          </YziBadge>
        </div>
        <YziStatusBadge tone={item.tone}>{item.status}</YziStatusBadge>
      </div>
      <p className="text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
        {item.detail}
      </p>
      <span className="text-[0.62rem] uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
        Canal: {item.channel}
      </span>
    </li>
  );
}

function ItemList({ items }: { items: BriefingItem[] }) {
  return (
    <ul className="flex flex-col divide-y divide-[color:var(--yzi-border-subtle)]">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </ul>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[0.58rem] font-medium uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
        {label}
      </span>
      <span className="text-xs leading-relaxed text-[var(--yzi-text-secondary)]">
        {children}
      </span>
    </div>
  );
}

export function YziImobOperatingBriefingV0() {
  return (
    <section className="mx-auto flex min-h-full w-full max-w-4xl flex-col gap-6 px-6 py-10">
      {/* Cabeçalho + presença da YZI como briefing operacional (não chatbot). */}
      <div className="flex flex-col gap-4">
        <Link
          href="/cockpit/yzi-imob/studio"
          className="inline-flex w-fit items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-1.5 text-xs text-[var(--yzi-text-secondary)] transition-colors hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]"
        >
          <CommandCenterIcon className="h-3.5 w-3.5" />
          Voltar ao Estúdio
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[var(--yzi-text-secondary)]">
            YZI IMOB · Briefing Operacional · v0
          </span>
          <YziBadge tone="preview">Exemplo</YziBadge>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
            Seu dia, em segundos.
          </h1>
          <div className="flex items-start gap-3 rounded-[var(--yzi-radius-md)] border border-[color:rgba(63,224,197,0.28)] bg-[linear-gradient(180deg,rgba(63,224,197,0.06),var(--yzi-surface-base))] p-4">
            <YziPresence state="ready" animated className="mt-1.5" />
            <div className="flex flex-col gap-1">
              <p className="text-sm leading-relaxed text-[var(--yzi-text-primary)]">
                A YZI preparou o dia. Três pontos aguardam você, duas travas e
                dois sinais no Radar.
              </p>
              <p className="text-xs text-[var(--yzi-text-secondary)]">
                Ela prepara e para. Recomenda, nunca executa sozinha.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estado honesto: nada conectado, tudo exemplo. */}
      <YziAlert tone="warning" title="Estado honesto">
        Dados de exemplo. Nenhum banco, API ou canal está conectado. Nenhuma
        ação externa é executada aqui.
      </YziAlert>

      {/* 1 · Prioridade do dia — uma única decisão principal. */}
      <YziPanel variant="command" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BlockHeading
            icon={ActionsIcon}
            eyebrow="Prioridade do dia"
            title="A decisão de maior impacto agora"
          />
          <YziBadge tone="neutral" className="font-mono text-[10px]">
            {PRIORITY.operationalId}
          </YziBadge>
        </div>

        <p className="text-base font-medium leading-snug text-[var(--yzi-text-primary)]">
          {PRIORITY.decision}
        </p>

        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <Fact label="Estado atual">{PRIORITY.currentState}</Fact>
          <Fact label="O que a YZI fez">{PRIORITY.yziPrepared}</Fact>
          <Fact label="Depende de você">{PRIORITY.humanDependency}</Fact>
          <Fact label="Canal envolvido">{PRIORITY.channel}</Fact>
          <Fact label="Evidência">{PRIORITY.evidence}</Fact>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <LinkAction href="/cockpit/autorizacoes" variant="primary">
            Revisar publicação
          </LinkAction>
          <span className="text-[0.62rem] uppercase tracking-[0.12em] text-[var(--yzi-text-faint)]">
            Autorização exigida
          </span>
        </div>
      </YziPanel>

      {/* 2 · Aguarda autorização — aprovações pendentes. */}
      <YziPanel variant="authorization" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BlockHeading
            icon={AuthorizationIcon}
            eyebrow="Aguarda você"
            title="Aprovações pendentes"
          />
          <YziStatusBadge tone="authorization">3 pendentes</YziStatusBadge>
        </div>
        <ItemList items={APPROVALS} />
        <div className="flex justify-start pt-1">
          <LinkAction href="/cockpit/autorizacoes" variant="authorization">
            Ver aprovações
          </LinkAction>
        </div>
      </YziPanel>

      {/* 3 · Travado — bloqueios esperando ação. */}
      <YziPanel variant="risk" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BlockHeading
            presence="blocked"
            eyebrow="Travado"
            title="Esperando ação para destravar"
          />
          <YziStatusBadge tone="blocked">2 travas</YziStatusBadge>
        </div>
        <ItemList items={BLOCKS} />
        <div className="flex justify-start pt-1">
          <LinkAction href="/cockpit/canais" variant="secondary">
            Conectar canal
          </LinkAction>
        </div>
      </YziPanel>

      {/* 4 · Sinais do Radar — leitura, não análise. Sem CTA. */}
      <YziPanel variant="trust" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BlockHeading
            icon={RadarIcon}
            eyebrow="Radar"
            title="Sinais que valem atenção"
          />
          <YziStatusBadge tone="trust">2 sinais</YziStatusBadge>
        </div>
        <ItemList items={RADAR} />
        <p className="text-[0.62rem] leading-relaxed text-[var(--yzi-text-faint)]">
          Análise profunda existe sob demanda. Aqui, só o que sustenta a decisão.
        </p>
      </YziPanel>

      <YziDivider />

      {/* Papel da YZI: presença operacional, aprendizado contínuo. */}
      <div className="flex items-start gap-3 text-xs text-[var(--yzi-text-secondary)]">
        <YziPresence state="ready" className="mt-1" />
        <p className="leading-relaxed">
          A YZI recua quando não é preciso. Aparece com decisão, razão e
          evidência, e aprende com cada visita para devolver recomendações
          melhores.
        </p>
      </div>
    </section>
  );
}

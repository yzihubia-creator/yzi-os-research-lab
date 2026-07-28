import Link from "next/link";

import { WorkspaceSection } from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";
import type {
  OperationalConsumptionSummary,
  SystemResourceState,
  SystemResourceStatus,
} from "@/lib/yzi-imob/consumption/types";

type AccessState =
  | "ready"
  | "no_session"
  | "no_membership"
  | "tenant_error"
  | "read_error";

const STATUS_LABEL: Record<SystemResourceStatus, string> = {
  available: "Disponível",
  partial: "Parcial",
  unavailable: "Indisponível",
  configuration_required: "Configuração necessária",
  stale: "Desatualizado",
  error: "Requer atenção",
};

const UNIT_LABEL: Record<SystemResourceState["usage_unit"], [string, string]> = {
  messages: ["mensagem", "mensagens"],
  publications: ["publicação", "publicações"],
  executions: ["execução", "execuções"],
};

function statusRole(status: SystemResourceStatus) {
  if (status === "available") return "coldGreen" as const;
  if (status === "partial" || status === "stale" || status === "configuration_required") {
    return "amber" as const;
  }
  if (status === "error") return "wine" as const;
  return "graphite" as const;
}

function formatUpdatedAt(value: string | null): string {
  if (!value) return "Sem leitura disponível";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function UsageValue({ resource }: { resource: SystemResourceState }) {
  if (!resource.usage_available || resource.usage_value === null) {
    return (
      <span className="text-[0.76rem] text-[var(--yzi-text-faint)]">
        Uso operacional indisponível
      </span>
    );
  }
  const unit = UNIT_LABEL[resource.usage_unit];
  return (
    <span className="text-[0.88rem] font-medium tabular-nums text-[var(--yzi-text-primary)]">
      {resource.usage_value.toLocaleString("pt-BR")}{" "}
      {resource.usage_value === 1 ? unit[0] : unit[1]}
    </span>
  );
}

function ResourceRow({ resource }: { resource: SystemResourceState }) {
  const role = statusRole(resource.status);
  return (
    <article className="grid gap-4 border-b border-[color:var(--yzi-border-subtle)] py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <h3 className="text-[0.88rem] font-medium text-[var(--yzi-text-primary)]">
            {resource.label}
          </h3>
          <span
            className="rounded-full border px-2 py-0.5 text-[0.62rem]"
            style={{
              borderColor: imobRgba(role, 0.32),
              color: imobRgba(role, 0.95),
              backgroundColor: imobRgba(role, 0.08),
            }}
          >
            {STATUS_LABEL[resource.status]}
          </span>
        </div>
        <p className="text-[0.75rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          {resource.description}
        </p>
        <p className="mt-1 text-[0.66rem] text-[var(--yzi-text-faint)]">
          Atualizado em {formatUpdatedAt(resource.last_updated_at)}
        </p>
      </div>
      <div className="flex items-center gap-4 sm:justify-end">
        <UsageValue resource={resource} />
        <Link
          href={resource.action_href}
          className="shrink-0 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-1.5 text-[0.72rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
        >
          Abrir
        </Link>
      </div>
    </article>
  );
}

function AvailabilityNotice({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-5 py-4">
      <p className="text-[0.82rem] font-medium text-[var(--yzi-text-primary)]">{title}</p>
      <p className="mt-1 text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {body}
      </p>
    </div>
  );
}

function AccessNotice({ accessState }: { accessState: Exclude<AccessState, "ready"> }) {
  const content = {
    no_session: ["Sessão necessária", "Entre novamente para consultar o estado da operação."],
    no_membership: [
      "Operação não vinculada",
      "Sua conta ainda não pertence a uma imobiliária. Nenhum consumo foi consultado.",
    ],
    tenant_error: [
      "Operação indisponível",
      "Não foi possível resolver sua operação agora. Nenhum valor foi estimado.",
    ],
    read_error: [
      "Leitura indisponível",
      "As fontes operacionais não responderam. Recarregue a página para tentar novamente.",
    ],
  }[accessState];

  return <AvailabilityNotice title={content[0]} body={content[1]} />;
}

export function YziImobApisCreditosWorkspace({
  summary,
  accessState,
}: {
  summary: OperationalConsumptionSummary | null;
  accessState: AccessState;
}) {
  const integrationResources =
    summary?.resources.filter((resource) => resource.connection_status !== null) ?? [];
  const attentionResources =
    summary?.resources.filter((resource) =>
      ["partial", "unavailable", "configuration_required", "stale", "error"].includes(
        resource.status,
      ),
    ) ?? [];

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.01em] text-[var(--yzi-text-primary)]">
          APIs &amp; Créditos
        </h1>
        <p className="max-w-2xl text-[0.82rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          Estado das integrações e consumo operacional registrado. Cobrança financeira
          só aparece quando houver uma fonte real do provedor.
        </p>
      </header>

      {accessState !== "ready" || !summary ? (
        <AccessNotice
          accessState={accessState === "ready" ? "read_error" : accessState}
        />
      ) : (
        <div className="flex flex-col gap-7">
          <WorkspaceSection
            title="1. Estado das integrações"
            description="Conexão e saúde são independentes da disponibilidade de uso e custo."
          >
            <div className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-5">
              {integrationResources.map((resource) => (
                <ResourceRow key={`${resource.provider}:${resource.capability}`} resource={resource} />
              ))}
            </div>
          </WorkspaceSection>

          <WorkspaceSection
            title="2. Uso operacional"
            description={`${summary.period.label}. Contagens do backend da operação; não representam cobrança do provedor.`}
          >
            <div className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-5">
              {summary.resources.map((resource) => (
                <ResourceRow key={`${resource.provider}:${resource.capability}:usage`} resource={resource} />
              ))}
            </div>
          </WorkspaceSection>

          <WorkspaceSection title="3. Custos conhecidos">
            <AvailabilityNotice
              title="Consumo financeiro ainda não disponível"
              body="Não há fonte de cobrança real integrada para WhatsApp, Metricool ou execuções operacionais. Zero não é usado como custo."
            />
          </WorkspaceSection>

          <WorkspaceSection title="4. Limites conhecidos">
            <AvailabilityNotice
              title="Limites de provedor ainda não disponíveis"
              body="Nenhum limite de API, crédito mensal ou orçamento foi registrado por fonte confiável."
            />
          </WorkspaceSection>

          <WorkspaceSection
            title="5. Itens com atenção"
            description="Configuração, falhas de leitura e dados desatualizados."
          >
            {attentionResources.length ? (
              <div className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] px-5">
                {attentionResources.map((resource) => (
                  <ResourceRow key={`${resource.provider}:${resource.capability}:attention`} resource={resource} />
                ))}
              </div>
            ) : (
              <AvailabilityNotice
                title="Nenhum item exige atenção agora"
                body="As fontes operacionais consultadas estão disponíveis."
              />
            )}
          </WorkspaceSection>
        </div>
      )}
    </section>
  );
}

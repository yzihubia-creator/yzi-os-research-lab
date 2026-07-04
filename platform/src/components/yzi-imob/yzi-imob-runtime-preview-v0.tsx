import Link from "next/link";
import type { ReactNode } from "react";

import {
  AuditIcon,
  AuthorizationIcon,
  CommandCenterIcon,
} from "@/components/yzi-os/yzi-icons";
import {
  YziAlert,
  YziBadge,
  YziPanel,
  YziStatusBadge,
} from "@/components/yzi-os/yzi-primitives";

import {
  demoPreparePropertyContact,
  demoReadOnlyPropertyLookup,
  type RuntimeResult,
} from "@/lib/yzi-imob/runtime";

// YZI IMOB Runtime Preview (v0) — superfície de INSPEÇÃO, não de operação. YZI
// IMOB é vertical sobre o core YZI OS: esta tela reutiliza o Dashboard Visual
// System (YziPanel/YziBadge/YziStatusBadge/YziAlert), não introduz arquitetura
// paralela. Renderiza o objeto honesto retornado pelos dois demos do Runtime
// (`demoReadOnlyPropertyLookup`, `demoPreparePropertyContact`) — funções PURAS,
// síncronas, com dados mockados internos.
//
// Esta tela NÃO executa tool, NÃO cria approval real, NÃO toca banco/API/
// Supabase/credenciais. Todo o conteúdo é o mesmo objeto já validado nas
// unidades anteriores do Runtime Foundation — aqui apenas exibido.

function statusTone(status: RuntimeResult["status"]): "opportunity" | "blocked" {
  return status === "READY_FOR_APPROVAL" ? "opportunity" : "blocked";
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${full ? "sm:col-span-2" : ""}`}>
      <dt className="text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--yzi-text-secondary)]">
        {label}
      </dt>
      <dd className="text-[var(--yzi-text-primary)]">{children}</dd>
    </div>
  );
}

function RuntimeResultPanel({
  title,
  result,
}: {
  title: string;
  result: RuntimeResult;
}) {
  const descriptor = result.approval?.descriptor ?? null;

  return (
    <YziPanel
      variant={descriptor ? "authorization" : "default"}
      className="flex flex-col gap-4 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
          <AuditIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            {title}
          </h2>
        </div>
        <YziStatusBadge tone={statusTone(result.status)}>
          {result.status}
        </YziStatusBadge>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
        <Field label="Intent">
          {result.intent
            ? `${result.intent.intent_type} (confiança ${result.intent.confidence})`
            : "—"}
        </Field>
        <Field label="Workflow">
          {result.workflow?.definition.workflow_id ?? "—"}
        </Field>
        <Field label="Parou em (stopped_at)">{result.stopped_at}</Field>
        <Field label="approval.created">
          <YziBadge tone="neutral" className="normal-case">
            {String(result.approval?.created ?? false)}
          </YziBadge>
        </Field>
        <Field label="approval.would_submit">
          {String(result.approval?.would_submit ?? false)}
        </Field>
        <Field label="evidence.no_side_effects">
          <YziBadge tone="opportunity" className="normal-case">
            {String(result.evidence.no_side_effects)}
          </YziBadge>
        </Field>
        <Field label="Context fingerprint" full>
          <code className="break-all text-[0.66rem] text-[var(--yzi-text-faint)]">
            {result.context?.fingerprint ?? "—"}
          </code>
        </Field>
        {result.blocking_reason ? (
          <Field label="blocking_reason" full>
            <span className="text-[var(--yzi-state-blocked)]">
              {result.blocking_reason}
            </span>
          </Field>
        ) : null}
      </dl>

      {descriptor ? (
        <div className="flex flex-col gap-2 rounded-[var(--yzi-radius-md)] border border-[color:rgba(167,139,250,0.35)] bg-[rgba(167,139,250,0.05)] p-3">
          <div className="flex items-center gap-2 text-[var(--yzi-accent-authorization)]">
            <AuthorizationIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold uppercase tracking-[0.08em]">
              Approval Descriptor — não criado
            </span>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-[0.7rem] sm:grid-cols-2">
            <Field label="approval_id">{descriptor.approval_id}</Field>
            <Field label="tool_id">{descriptor.tool_id}</Field>
            <Field label="risk_level">{descriptor.risk_level}</Field>
            <Field label="estimated_side_effect">
              {descriptor.estimated_side_effect}
            </Field>
            <Field label="requested_action" full>
              {descriptor.requested_action}
            </Field>
            <Field label="reason" full>
              {descriptor.reason}
            </Field>
            <Field label="estimated_usage" full>
              {descriptor.estimated_usage}
            </Field>
            <Field label="estimated_credits" full>
              {descriptor.estimated_credits}
            </Field>
            <Field label="created">
              <YziBadge tone="blocked" className="normal-case">
                {String(descriptor.created)}
              </YziBadge>
            </Field>
          </dl>
        </div>
      ) : (
        <p className="text-[0.68rem] text-[var(--yzi-text-faint)]">
          Este workflow não exige aprovação (read-only) — nenhum descriptor foi
          gerado.
        </p>
      )}
    </YziPanel>
  );
}

export function YziImobRuntimePreviewV0() {
  const readOnlyResult = demoReadOnlyPropertyLookup();
  const prepareContactResult = demoPreparePropertyContact();

  return (
    <section className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-4">
        <Link
          href="/cockpit/yzi-imob/studio"
          className="inline-flex w-fit items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-strong)] px-3 py-1.5 text-xs text-[var(--yzi-text-secondary)] transition-colors hover:bg-[var(--yzi-surface-elevated)] hover:text-[var(--yzi-text-primary)]"
        >
          <CommandCenterIcon className="h-3.5 w-3.5" />
          Voltar ao Estúdio
        </Link>
        <div className="flex flex-col gap-2">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-[var(--yzi-text-secondary)]">
            YZI IMOB · Runtime Preview · v0.1
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--yzi-text-primary)]">
            Inspeção do Runtime (somente leitura)
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--yzi-text-secondary)]">
            Mostra o resultado honesto de dois demos internos do Runtime YZI
            IMOB — nenhuma tool é executada, nenhum approval é criado e nenhum
            banco é tocado.
          </p>
        </div>
      </div>

      <YziAlert tone="info" title="Superfície somente leitura — sem execução real">
        Esta tela não cria approval, não chama API, não usa Supabase nem
        credenciais. Ela apenas invoca as funções puras
        demoReadOnlyPropertyLookup() e demoPreparePropertyContact() do Runtime e
        exibe o objeto de resultado retornado por elas.
      </YziAlert>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RuntimeResultPanel
          title="READ_ONLY_PROPERTY_LOOKUP"
          result={readOnlyResult}
        />
        <RuntimeResultPanel
          title="PREPARE_PROPERTY_CONTACT"
          result={prepareContactResult}
        />
      </div>
    </section>
  );
}

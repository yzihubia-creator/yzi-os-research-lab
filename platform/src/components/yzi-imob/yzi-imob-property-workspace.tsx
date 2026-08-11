"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ComingSoonPanel,
  CounterStrip,
  EntityHero,
  WorkspaceGrid,
  WorkspaceSection,
  WorkspaceTabs,
  type CounterItem,
} from "@/components/yzi-imob/yzi-imob-workspace-kit";
import { useYziImobWorkspace } from "@/components/yzi-imob/yzi-imob-workspace-context";
import { imobRgba } from "@/components/yzi-imob/yzi-imob-status-colors";
import { YziImobPropertyPublicationWorkspaceSlot } from "@/components/yzi-imob/yzi-imob-property-publication-workspace-adapter";
import { YziImobPropertyMediaGuidance } from "@/components/yzi-imob/properties/yzi-imob-property-media-guidance";
import {
  formatPropertyLocation,
  formatPropertyPrice,
  propertyStatusAccent,
  propertyStatusLabel,
} from "@/components/yzi-imob/properties/property-view-helpers";
import {
  acceptDescriptionRevisionAction,
  createDescriptionRevisionAction,
  createProximityAction,
  rejectDescriptionRevisionAction,
  updatePropertyCoreAction,
  upsertPrivateLocationAction,
} from "@/app/cockpit/yzi-imob/imoveis/[id]/actions";
import {
  INITIAL_PROPERTY_WORKSPACE_ACTION_STATE,
  type PropertyWorkspaceActionState,
} from "@/app/cockpit/yzi-imob/imoveis/[id]/action-state";
import { computePropertyCompleteness } from "@/lib/yzi-imob/properties/completeness";
import { computePropertyQuality } from "@/lib/yzi-imob/properties/quality";
import {
  PROPERTY_COMMERCIAL_STAGE_OPTIONS,
  PROPERTY_FLOOR_DESIGNATION_OPTIONS,
  PROPERTY_PRICE_QUALIFIER_OPTIONS,
  PROPERTY_RECORD_KIND_OPTIONS,
  PROPERTY_TRANSACTION_OPTIONS,
  PROPERTY_TYPE_LEGACY_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  type ContractOption,
} from "@/lib/yzi-imob/properties/contract";
import {
  completenessFieldLabel,
  PROPERTY_AVAILABILITY_STATUS_OPTIONS,
  PROPERTY_EDITORIAL_STATUS_OPTIONS,
  PROPERTY_FURNISHED_STATUS_OPTIONS,
  PROPERTY_OPERATIONAL_STATUS_LEGACY_OPTIONS,
  PROPERTY_OPERATIONAL_STATUS_OPTIONS,
  PROPERTY_PROXIMITY_SOURCE_OPTIONS,
  PROPERTY_PROXIMITY_TRAVEL_MODE_OPTIONS,
  PROPERTY_SOLAR_ORIENTATION_OPTIONS,
  PROPERTY_STAGE_OPTIONS,
  qualityCheckLabel,
} from "@/lib/yzi-imob/properties/labels";
import type { PropertyPublicationMedia } from "@/lib/yzi-imob/publication/types";
import {
  PROPERTY_PROXIMITY_DISTANCE_UNIT_VALUES,
  type Property,
  type PropertyDescriptionRevision,
  type PropertyPrivateLocation,
  type PropertyProximity,
} from "@/lib/yzi-imob/properties/types";

const TABS = [
  { id: "informacoes", label: "Informações" },
  { id: "midias", label: "Mídias" },
  { id: "publicacao", label: "Publicação" },
  { id: "ia", label: "IA", soon: true },
];

const inputClass =
  "w-full rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2.5 text-[0.84rem] text-[var(--yzi-text-primary)] outline-none transition-colors placeholder:text-[var(--yzi-text-faint)] focus:border-[rgba(var(--imob-ice),0.45)]";

function textValue(value: string | null | undefined): string {
  return value ?? "";
}

function numberValue(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

function formatArea(value: number | null | undefined): string {
  return value !== null && value !== undefined ? `${value} m2` : "Não informado";
}

function formatCount(value: number | null | undefined): string {
  return value !== null && value !== undefined ? String(value) : "Não informado";
}

function formatRevisionStatus(status: PropertyDescriptionRevision["status"]): string {
  if (status === "accepted") return "Aceita";
  if (status === "rejected") return "Rejeitada";
  return "Proposta";
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.72rem] text-[var(--yzi-text-secondary)]">{label}</span>
      {children}
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.72rem] text-[var(--yzi-text-secondary)]">{label}</span>
      <span className="w-full rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-2.5 text-[0.84rem] text-[var(--yzi-text-primary)]">
        {value}
      </span>
    </div>
  );
}

function ActionMessage({ state }: { state: PropertyWorkspaceActionState }) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <div
      className={
        state.status === "ok"
          ? "rounded-[var(--yzi-radius-md)] border border-[rgba(var(--imob-ice),0.25)] bg-[rgba(var(--imob-ice),0.08)] px-3 py-2 text-[0.78rem] text-[rgb(var(--imob-ice))]"
          : "rounded-[var(--yzi-radius-md)] border border-[rgba(255,120,120,0.25)] bg-[rgba(255,120,120,0.08)] px-3 py-2 text-[0.78rem] text-[rgb(255,170,170)]"
      }
    >
      <p>{state.message}</p>
      {state.fieldErrors && state.fieldErrors.length > 0 ? (
        <p className="mt-1 text-[0.7rem] opacity-80">{state.fieldErrors.join(", ")}</p>
      ) : null}
    </div>
  );
}

function SubmitButton({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-fit rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.32)] bg-[rgba(var(--imob-ice),0.12)] px-3 py-2 text-[0.76rem] font-medium text-[rgb(var(--imob-ice))] transition-colors hover:bg-[rgba(var(--imob-ice),0.18)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Salvando..." : label}
    </button>
  );
}

function SelectField({
  name,
  defaultValue,
  values,
  options,
}: {
  name: string;
  defaultValue?: string | null;
  values?: readonly string[];
  options?: readonly ContractOption<string>[];
}) {
  const resolved = options ?? (values ?? []).map((value) => ({ value, label: value }));
  const hasPersistedValue = resolved.some((option) => option.value === defaultValue);
  return (
    <select name={name} defaultValue={defaultValue ?? ""} className={inputClass}>
      <option value="">Não informado</option>
      {defaultValue && !hasPersistedValue ? <option value={defaultValue}>{defaultValue} (valor legado, não catalogado)</option> : null}
      {resolved.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

type Props = {
  tenantId: string;
  property: Property | null;
  proximities?: readonly PropertyProximity[];
  privateLocation?: PropertyPrivateLocation | null;
  privateLocationError?: string | null;
  descriptionRevisions?: readonly PropertyDescriptionRevision[];
  media?: readonly PropertyPublicationMedia[];
  mediaUnavailable?: boolean;
  mediaUploadEnabled?: boolean;
};

export function YziImobPropertyWorkspace({
  tenantId,
  property,
  proximities = [],
  privateLocation = null,
  privateLocationError = null,
  descriptionRevisions = [],
  media = [],
  mediaUnavailable = false,
  mediaUploadEnabled = false,
}: Props) {
  const router = useRouter();
  const { select, clear } = useYziImobWorkspace();
  const [tab, setTab] = useState<string>("informacoes");
  const [coreState, coreAction, corePending] = useActionState(
    updatePropertyCoreAction,
    INITIAL_PROPERTY_WORKSPACE_ACTION_STATE,
  );
  const [privateState, privateAction, privatePending] = useActionState(
    upsertPrivateLocationAction,
    INITIAL_PROPERTY_WORKSPACE_ACTION_STATE,
  );
  const [proximityState, proximityAction, proximityPending] = useActionState(
    createProximityAction,
    INITIAL_PROPERTY_WORKSPACE_ACTION_STATE,
  );
  const [revisionState, revisionAction, revisionPending] = useActionState(
    createDescriptionRevisionAction,
    INITIAL_PROPERTY_WORKSPACE_ACTION_STATE,
  );

  useEffect(() => {
    if (window.location.hash !== "#midias") return;
    const frame = window.requestAnimationFrame(() => setTab("midias"));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!property) {
      clear();
      return;
    }
    const completeness = computePropertyCompleteness(property);
    const quality = computePropertyQuality(property);
    select({
      name: property.title,
      subtitle: [property.neighborhood, property.city].filter(Boolean).join(" - ") || "Localização não informada",
      statusLabel: propertyStatusLabel(property.status),
      situation:
        quality.level === "ready"
          ? "Cadastro pronto para publicação."
          : quality.level === "basic"
            ? "Cadastro básico; ainda faltam itens para publicação."
            : "Cadastro insuficiente para publicação.",
      pendencies:
        completeness.missingFields.length > 0
          ? completeness.missingFields.map((field) => `Campo pendente: ${completenessFieldLabel(field)}`)
          : ["Nenhuma pendência de cadastro registrada."],
      checklist: quality.checks.map((check) => ({ label: qualityCheckLabel(check.name), done: check.passed })),
      score: completeness.percentage,
      scoreLabel: "Property Readiness",
      nextAction:
        quality.level === "ready" ? "Cadastro completo." : "Completar os campos pendentes do cadastro.",
      suggestions: [],
      history: [],
    });
  }, [clear, property, select]);

  if (!property) {
    return (
      <section className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center gap-3 px-8 py-10 text-center">
        <p className="text-[1.1rem] font-semibold text-[var(--yzi-text-primary)]">
          Imóvel não encontrado.
        </p>
        <p className="text-[0.86rem] text-[var(--yzi-text-secondary)]">
          Este imóvel não existe ou não pertence à sua imobiliária.
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

  const completeness = computePropertyCompleteness(property);
  const quality = computePropertyQuality(property);
  const proposedRevisions = descriptionRevisions.filter((revision) => revision.status === "proposed");

  const counters: CounterItem[] = [
    { label: "Completude", value: `${completeness.percentage}%`, detail: "Campos de cadastro preenchidos." },
    {
      label: "Qualidade",
      value: quality.level === "ready" ? "Pronto" : quality.level === "basic" ? "Básico" : "Insuficiente",
      detail: "Checagem mínima para site/atendimento.",
    },
    { label: "Status", value: propertyStatusLabel(property.status), detail: "Estado operacional atual do imóvel." },
    { label: "Preço", value: formatPropertyPrice(property.price), detail: "Valor cadastrado para este imóvel." },
  ];

  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 pt-10">
        <EntityHero
          backHref="/cockpit/yzi-imob/imoveis"
          backLabel="Imóveis"
          kicker="Property Workspace"
          title={property.title}
          subtitle={formatPropertyLocation(property.city, property.neighborhood)}
          statusLabel={propertyStatusLabel(property.status)}
          composerPlaceholder="Pergunte a YZI sobre este imóvel..."
          quickActions={[]}
          onAsk={() => router.push("/cockpit/yzi-imob/radar")}
        />
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem]"
            style={{
              borderColor: imobRgba(propertyStatusAccent(property.status), 0.32),
              backgroundColor: imobRgba(propertyStatusAccent(property.status), 0.1),
              color: imobRgba(propertyStatusAccent(property.status), 0.95),
            }}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: imobRgba(propertyStatusAccent(property.status), 0.9) }}
            />
            {propertyStatusLabel(property.status)}
          </div>
        </div>
      </section>

      <section className="w-full py-7">
        <CounterStrip counters={counters} />
      </section>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-8 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <WorkspaceTabs tabs={TABS} active={tab} onChange={setTab} />
          <Link
            href={`/cockpit/yzi-imob/imoveis/${encodeURIComponent(property.id)}/creative`}
            className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.32)] bg-[rgba(var(--imob-ice),0.08)] px-3 py-2 text-[0.74rem] text-[rgb(var(--imob-ice))]"
          >
            Artes e vídeos
          </Link>
        </div>

        {tab === "informacoes" ? (
          <div className="flex flex-col gap-7">
            <form action={coreAction} className="flex flex-col gap-7">
              <input type="hidden" name="propertyId" value={property.id} />
              <WorkspaceSection first title="Identidade">
                <WorkspaceGrid>
                  <FormField label="Referência">
                    <input name="referenceCode" defaultValue={textValue(property.referenceCode)} className={inputClass} />
                  </FormField>
                  <FormField label="Título">
                    <input name="title" required defaultValue={property.title} className={inputClass} />
                  </FormField>
                  <FormField label="Tipo">
                    <SelectField
                      name="propertyType"
                      defaultValue={property.propertyType}
                      options={[...PROPERTY_TYPE_OPTIONS, ...PROPERTY_TYPE_LEGACY_OPTIONS]}
                    />
                  </FormField>
                  <FormField label="Transação">
                    <SelectField name="transactionType" defaultValue={property.transactionType} options={PROPERTY_TRANSACTION_OPTIONS} />
                  </FormField>
                  <FormField label="Cadastro representa">
                    <SelectField name="recordKind" defaultValue={String(property.commercialContext.record_kind ?? "unit")} options={PROPERTY_RECORD_KIND_OPTIONS} />
                  </FormField>
                  <FormField label="Fase comercial">
                    <SelectField name="commercialStage" defaultValue={property.commercialContext.commercial_stage as string | undefined} options={PROPERTY_COMMERCIAL_STAGE_OPTIONS} />
                  </FormField>
                  <FormField label="Status">
                    <SelectField
                      name="status"
                      defaultValue={property.status}
                      options={[...PROPERTY_OPERATIONAL_STATUS_OPTIONS, ...PROPERTY_OPERATIONAL_STATUS_LEGACY_OPTIONS]}
                    />
                  </FormField>
                  <FormField label="Etapa">
                    <SelectField name="stage" defaultValue={property.stage} options={PROPERTY_STAGE_OPTIONS} />
                  </FormField>
                  <FormField label="Disponibilidade">
                    <SelectField
                      name="availabilityStatus"
                      defaultValue={property.availabilityStatus}
                      options={PROPERTY_AVAILABILITY_STATUS_OPTIONS}
                    />
                  </FormField>
                  <FormField label="Editorial">
                    <SelectField
                      name="editorialStatus"
                      defaultValue={property.editorialStatus}
                      options={PROPERTY_EDITORIAL_STATUS_OPTIONS}
                    />
                  </FormField>
                </WorkspaceGrid>
              </WorkspaceSection>

              <WorkspaceSection
                title="Corretores e comissão"
                description="A YZI ainda não registra corretor captador, parceiro de captação ou comissão por imóvel — este cadastro só guarda quem o criou no sistema. Corretor responsável pelo lead é definido apenas quando um atendimento é assumido, na aba de leads."
              >
                <ReadOnlyField
                  label="Cadastrado por"
                  value={property.createdByUserId ? "Registrado no sistema" : "Não informado"}
                />
              </WorkspaceSection>

              <WorkspaceSection title="Localização pública">
                <WorkspaceGrid>
                  <FormField label="Cidade">
                    <input name="city" defaultValue={textValue(property.city)} className={inputClass} />
                  </FormField>
                  <FormField label="Bairro">
                    <input name="neighborhood" defaultValue={textValue(property.neighborhood)} className={inputClass} />
                  </FormField>
                </WorkspaceGrid>
              </WorkspaceSection>

              <WorkspaceSection title="Características">
                <WorkspaceGrid>
                  <FormField label="Área privativa">
                    <input
                      name="privateArea"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={numberValue(property.privateArea)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Área total">
                    <input
                      name="totalArea"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={numberValue(property.totalArea)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Quartos">
                    <input
                      name="bedrooms"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={numberValue(property.bedrooms)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Suítes">
                    <input
                      name="suites"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={numberValue(property.suites)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Banheiros">
                    <input
                      name="bathrooms"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={numberValue(property.bathrooms)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Vagas">
                    <input
                      name="parkingSpaces"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={numberValue(property.parkingSpaces)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Andar">
                    <SelectField
                      name="floorDesignation"
                      defaultValue={
                        property.attributes.floorDesignation ??
                        (property.floor === 0 ? "ground" : property.floor !== null ? "number" : null)
                      }
                      options={PROPERTY_FLOOR_DESIGNATION_OPTIONS}
                    />
                    <input
                      name="floor"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={numberValue(property.floor)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Orientação solar">
                    <SelectField
                      name="solarOrientation"
                      defaultValue={property.solarOrientation}
                      options={PROPERTY_SOLAR_ORIENTATION_OPTIONS}
                    />
                  </FormField>
                  <FormField label="Mobília">
                    <SelectField
                      name="furnishedStatus"
                      defaultValue={property.furnishedStatus}
                      options={PROPERTY_FURNISHED_STATUS_OPTIONS}
                    />
                  </FormField>
                </WorkspaceGrid>
              </WorkspaceSection>

              <WorkspaceSection title="Valores">
                <WorkspaceGrid>
                  <FormField label="Preço">
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={numberValue(property.price)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Referência do preço">
                    <SelectField
                      name="priceQualifier"
                      defaultValue={String(property.commercialContext.price_qualifier ?? "exact")}
                      options={PROPERTY_PRICE_QUALIFIER_OPTIONS}
                    />
                  </FormField>
                  <FormField label="Condomínio">
                    <input
                      name="condominiumFee"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={numberValue(property.condominiumFee)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="IPTU">
                    <input
                      name="iptuValue"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={numberValue(property.iptuValue)}
                      className={inputClass}
                    />
                  </FormField>
                </WorkspaceGrid>
              </WorkspaceSection>

              <WorkspaceSection title="Conhecimento da YZI">
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Descrição original">
                    <textarea
                      name="originalDescription"
                      rows={5}
                      defaultValue={textValue(property.originalDescription ?? property.description)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Resumo curto">
                    <textarea
                      name="shortSummary"
                      rows={3}
                      defaultValue={textValue(property.shortSummary)}
                      className={inputClass}
                    />
                  </FormField>
                  <ReadOnlyField
                    label="Descrição otimizada"
                    value={property.optimizedDescription ?? "Nenhuma descrição otimizada aceita ainda."}
                  />
                </div>
              </WorkspaceSection>

              <ActionMessage state={coreState} />
              <SubmitButton label="Salvar cadastro" pending={corePending} />
            </form>

            <WorkspaceSection
              title="Endereço privado"
              description="O endereço exato é protegido e não aparece na divulgação pública do imóvel."
            >
              <form action={privateAction} className="flex flex-col gap-4">
                <input type="hidden" name="propertyId" value={property.id} />
                {privateLocationError ? (
                  <p className="text-[0.76rem] text-[rgb(255,170,170)]">
                    Endereço privado indisponível para seu perfil.
                  </p>
                ) : null}
                <WorkspaceGrid>
                  <FormField label="CEP">
                    <input name="postalCode" defaultValue={textValue(privateLocation?.postalCode)} className={inputClass} />
                  </FormField>
                  <FormField label="Rua">
                    <input name="street" defaultValue={textValue(privateLocation?.street)} className={inputClass} />
                  </FormField>
                  <FormField label="Número">
                    <input name="number" defaultValue={textValue(privateLocation?.number)} className={inputClass} />
                  </FormField>
                  <FormField label="Complemento">
                    <input name="complement" defaultValue={textValue(privateLocation?.complement)} className={inputClass} />
                  </FormField>
                  <FormField label="Condomínio">
                    <input
                      name="condominiumName"
                      defaultValue={textValue(privateLocation?.condominiumName)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Bloco">
                    <input name="block" defaultValue={textValue(privateLocation?.block)} className={inputClass} />
                  </FormField>
                  <FormField label="Unidade">
                    <input name="unit" defaultValue={textValue(privateLocation?.unit)} className={inputClass} />
                  </FormField>
                  <FormField label="Latitude">
                    <input
                      name="latitude"
                      type="number"
                      step="0.000001"
                      defaultValue={numberValue(privateLocation?.latitude)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Longitude">
                    <input
                      name="longitude"
                      type="number"
                      step="0.000001"
                      defaultValue={numberValue(privateLocation?.longitude)}
                      className={inputClass}
                    />
                  </FormField>
                </WorkspaceGrid>
                <FormField label="Instruções de acesso">
                  <textarea
                    name="accessInstructions"
                    rows={3}
                    defaultValue={textValue(privateLocation?.accessInstructions)}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Ponto de encontro">
                  <textarea
                    name="meetingPoint"
                    rows={3}
                    defaultValue={textValue(privateLocation?.meetingPoint)}
                    className={inputClass}
                  />
                </FormField>
                <ActionMessage state={privateState} />
                <SubmitButton label="Salvar endereço privado" pending={privatePending} />
              </form>
            </WorkspaceSection>

            <WorkspaceSection
              title="Proximidades"
              description="Pontos de referência perto do imóvel, usados para localizar o cliente na região."
            >
              <div className="flex flex-col gap-4">
                {proximities.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {proximities.map((proximity) => (
                      <div
                        key={proximity.id}
                        className="flex flex-col gap-1.5 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[0.84rem] font-medium text-[var(--yzi-text-primary)]">
                            {proximity.label}
                          </p>
                          <span
                            className={
                              proximity.isConfirmed
                                ? "w-fit rounded-full border border-[rgba(var(--imob-ice),0.32)] bg-[rgba(var(--imob-ice),0.1)] px-2 py-0.5 text-[0.66rem] text-[rgb(var(--imob-ice))]"
                                : "w-fit rounded-full border border-[color:var(--yzi-border-subtle)] px-2 py-0.5 text-[0.66rem] text-[var(--yzi-text-faint)]"
                            }
                          >
                            {proximity.isConfirmed ? "Distância confirmada" : "Distância a confirmar"}
                          </span>
                        </div>
                        <p className="text-[0.72rem] text-[var(--yzi-text-secondary)]">
                          {proximity.placeType}
                          {proximity.distanceValue !== null
                            ? ` · ${proximity.distanceValue}${proximity.distanceUnit ?? ""}`
                            : ""}
                          {proximity.estimatedMinutes !== null
                            ? ` · ${proximity.estimatedMinutes} min`
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[0.78rem] text-[var(--yzi-text-secondary)]">
                    Nenhuma proximidade cadastrada.
                  </p>
                )}

                <form action={proximityAction} className="flex flex-col gap-4">
                  <input type="hidden" name="propertyId" value={property.id} />
                  <WorkspaceGrid>
                    <FormField label="Tipo de local">
                      <input name="placeType" className={inputClass} />
                    </FormField>
                    <FormField label="Nome">
                      <input name="label" className={inputClass} />
                    </FormField>
                    <FormField label="Distância">
                      <input name="distanceValue" type="number" min="0" step="0.01" className={inputClass} />
                    </FormField>
                    <FormField label="Unidade">
                      <SelectField name="distanceUnit" values={PROPERTY_PROXIMITY_DISTANCE_UNIT_VALUES} />
                    </FormField>
                    <FormField label="Modo de deslocamento">
                      <SelectField name="travelMode" options={PROPERTY_PROXIMITY_TRAVEL_MODE_OPTIONS} />
                    </FormField>
                    <FormField label="Minutos estimados">
                      <input name="estimatedMinutes" type="number" min="0" step="1" className={inputClass} />
                    </FormField>
                    <FormField label="Origem do registro">
                      <SelectField name="source" defaultValue="manual" options={PROPERTY_PROXIMITY_SOURCE_OPTIONS} />
                    </FormField>
                    <label className="flex items-center gap-2 pt-6 text-[0.78rem] text-[var(--yzi-text-secondary)]">
                      <input name="isConfirmed" type="checkbox" className="h-4 w-4" />
                      Distância confirmada
                    </label>
                  </WorkspaceGrid>
                  <ActionMessage state={proximityState} />
                  <SubmitButton label="Adicionar proximidade" pending={proximityPending} />
                </form>
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Sugestão editorial">
              <div className="flex flex-col gap-4">
                <WorkspaceGrid>
                  <ReadOnlyField label="Área privativa" value={formatArea(property.privateArea)} />
                  <ReadOnlyField label="Área total" value={formatArea(property.totalArea)} />
                  <ReadOnlyField label="Quartos" value={formatCount(property.bedrooms)} />
                  <ReadOnlyField label="Banheiros" value={formatCount(property.bathrooms)} />
                </WorkspaceGrid>

                <form action={revisionAction} className="flex flex-col gap-4">
                  <input type="hidden" name="propertyId" value={property.id} />
                  <FormField label="Texto original">
                    <textarea
                      name="originalText"
                      rows={4}
                      defaultValue={textValue(property.originalDescription ?? property.description)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Texto sugerido">
                    <textarea name="suggestedText" rows={5} className={inputClass} />
                  </FormField>
                  <ActionMessage state={revisionState} />
                  <SubmitButton label="Registrar proposta" pending={revisionPending} />
                </form>

                {descriptionRevisions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {descriptionRevisions.map((revision) => (
                      <div
                        key={revision.id}
                        className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-[0.78rem] font-medium text-[var(--yzi-text-primary)]">
                            {formatRevisionStatus(revision.status)}
                          </p>
                          {revision.status === "proposed" ? (
                            <div className="flex flex-wrap gap-2">
                              <form action={acceptDescriptionRevisionAction}>
                                <input type="hidden" name="propertyId" value={property.id} />
                                <input type="hidden" name="revisionId" value={revision.id} />
                                <button
                                  type="submit"
                                  className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.32)] px-2.5 py-1.5 text-[0.7rem] text-[rgb(var(--imob-ice))]"
                                >
                                  Aceitar
                                </button>
                              </form>
                              <form action={rejectDescriptionRevisionAction}>
                                <input type="hidden" name="propertyId" value={property.id} />
                                <input type="hidden" name="revisionId" value={revision.id} />
                                <button
                                  type="submit"
                                  className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-2.5 py-1.5 text-[0.7rem] text-[var(--yzi-text-secondary)]"
                                >
                                  Rejeitar
                                </button>
                              </form>
                            </div>
                          ) : null}
                        </div>
                        <p className="mt-2 whitespace-pre-line text-[0.78rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                          {revision.suggestedText}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[0.78rem] text-[var(--yzi-text-secondary)]">
                    Nenhuma proposta editorial registrada.
                  </p>
                )}
                {proposedRevisions.length > 0 ? (
                  <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">
                    Ao aceitar, a descrição otimizada passa a valer para este imóvel.
                  </p>
                ) : null}
              </div>
            </WorkspaceSection>
          </div>
        ) : tab === "midias" ? (
          <YziImobPropertyMediaGuidance
            tenantId={tenantId}
            propertyId={property.id}
            propertyTitle={property.title}
            propertyType={property.propertyType}
            propertyFactsComplete={Boolean(property.title && property.city)}
            media={media}
            mediaUnavailable={mediaUnavailable}
            uploadEnabled={mediaUploadEnabled}
          />
        ) : tab === "publicacao" ? (
          <YziImobPropertyPublicationWorkspaceSlot />
        ) : (
          <ComingSoonPanel label="IA" note="A YZI já está no Inspector; mais ações chegam aqui." />
        )}

        <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
          Dados confirmados desta operação. O endereço exato permanece protegido e fora da divulgação pública.
        </p>
      </section>
    </div>
  );
}

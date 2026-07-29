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
  INITIAL_PROPERTY_WORKSPACE_ACTION_STATE,
  rejectDescriptionRevisionAction,
  updatePropertyCoreAction,
  upsertPrivateLocationAction,
  type PropertyWorkspaceActionState,
} from "@/app/cockpit/yzi-imob/imoveis/[id]/actions";
import { computePropertyCompleteness } from "@/lib/yzi-imob/properties/completeness";
import { computePropertyQuality } from "@/lib/yzi-imob/properties/quality";
import {
  PROPERTY_AVAILABILITY_STATUS_VALUES,
  PROPERTY_EDITORIAL_STATUS_VALUES,
  PROPERTY_FURNISHED_STATUS_VALUES,
  PROPERTY_PROXIMITY_DISTANCE_UNIT_VALUES,
  PROPERTY_PROXIMITY_SOURCE_VALUES,
  PROPERTY_PROXIMITY_TRAVEL_MODE_VALUES,
  PROPERTY_SOLAR_ORIENTATION_VALUES,
  PROPERTY_STAGE_VALUES,
  PROPERTY_STATUS_VALUES,
  type Property,
  type PropertyDescriptionRevision,
  type PropertyPrivateLocation,
  type PropertyProximity,
} from "@/lib/yzi-imob/properties/types";

const TABS = [
  { id: "informacoes", label: "Informacoes" },
  { id: "arquivos", label: "Arquivos", soon: true },
  { id: "publicacao", label: "Publicacao" },
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
  return value !== null && value !== undefined ? `${value} m2` : "Nao informado";
}

function formatCount(value: number | null | undefined): string {
  return value !== null && value !== undefined ? String(value) : "Nao informado";
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
}: {
  name: string;
  defaultValue?: string | null;
  values: readonly string[];
}) {
  return (
    <select name={name} defaultValue={defaultValue ?? ""} className={inputClass}>
      <option value="">Nao informado</option>
      {values.map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </select>
  );
}

type Props = {
  property: Property | null;
  proximities?: readonly PropertyProximity[];
  privateLocation?: PropertyPrivateLocation | null;
  privateLocationError?: string | null;
  descriptionRevisions?: readonly PropertyDescriptionRevision[];
};

export function YziImobPropertyWorkspace({
  property,
  proximities = [],
  privateLocation = null,
  privateLocationError = null,
  descriptionRevisions = [],
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
    if (!property) {
      clear();
      return;
    }
    const completeness = computePropertyCompleteness(property);
    const quality = computePropertyQuality(property);
    select({
      name: property.title,
      subtitle: [property.neighborhood, property.city].filter(Boolean).join(" - ") || "Localizacao nao informada",
      statusLabel: propertyStatusLabel(property.status),
      situation:
        quality.level === "ready"
          ? "Cadastro pronto para publicacao."
          : quality.level === "basic"
            ? "Cadastro basico; ainda faltam itens para publicacao."
            : "Cadastro insuficiente para publicacao.",
      pendencies:
        completeness.missingFields.length > 0
          ? completeness.missingFields.map((field) => `Campo pendente: ${field}`)
          : ["Nenhuma pendencia de cadastro registrada."],
      checklist: quality.checks.map((check) => ({ label: check.name, done: check.passed })),
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
          Imovel nao encontrado.
        </p>
        <p className="text-[0.86rem] text-[var(--yzi-text-secondary)]">
          Este imovel nao existe ou nao pertence a sua imobiliaria.
        </p>
        <Link
          href="/cockpit/yzi-imob/imoveis"
          className="mt-2 text-[0.82rem] text-[rgb(var(--imob-ice))] hover:underline"
        >
          Voltar ao catalogo
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
      value: quality.level === "ready" ? "Pronto" : quality.level === "basic" ? "Basico" : "Insuficiente",
      detail: "Checagem minima para site/atendimento.",
    },
    { label: "Status", value: propertyStatusLabel(property.status), detail: "Estado operacional atual do imovel." },
    { label: "Preco", value: formatPropertyPrice(property.price), detail: "Valor cadastrado para este imovel." },
  ];

  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 pt-10">
        <EntityHero
          backHref="/cockpit/yzi-imob/imoveis"
          backLabel="Imoveis"
          kicker="Property Workspace"
          title={property.title}
          subtitle={formatPropertyLocation(property.city, property.neighborhood)}
          statusLabel={propertyStatusLabel(property.status)}
          composerPlaceholder="Pergunte a YZI sobre este imovel..."
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
        <WorkspaceTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "informacoes" ? (
          <div className="flex flex-col gap-7">
            <form action={coreAction} className="flex flex-col gap-7">
              <input type="hidden" name="propertyId" value={property.id} />
              <WorkspaceSection first title="Identidade">
                <WorkspaceGrid>
                  <FormField label="Referencia">
                    <input name="referenceCode" defaultValue={textValue(property.referenceCode)} className={inputClass} />
                  </FormField>
                  <FormField label="Titulo">
                    <input name="title" required defaultValue={property.title} className={inputClass} />
                  </FormField>
                  <FormField label="Tipo">
                    <input name="propertyType" defaultValue={textValue(property.propertyType)} className={inputClass} />
                  </FormField>
                  <FormField label="Transacao">
                    <input
                      name="transactionType"
                      defaultValue={textValue(property.transactionType)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Status">
                    <SelectField name="status" defaultValue={property.status} values={PROPERTY_STATUS_VALUES} />
                  </FormField>
                  <FormField label="Etapa">
                    <SelectField name="stage" defaultValue={property.stage} values={PROPERTY_STAGE_VALUES} />
                  </FormField>
                  <FormField label="Disponibilidade">
                    <SelectField
                      name="availabilityStatus"
                      defaultValue={property.availabilityStatus}
                      values={PROPERTY_AVAILABILITY_STATUS_VALUES}
                    />
                  </FormField>
                  <FormField label="Editorial">
                    <SelectField
                      name="editorialStatus"
                      defaultValue={property.editorialStatus}
                      values={PROPERTY_EDITORIAL_STATUS_VALUES}
                    />
                  </FormField>
                </WorkspaceGrid>
              </WorkspaceSection>

              <WorkspaceSection
                title="Corretor responsavel"
                description="O vinculo formal de captador ainda nao existe no schema real."
              >
                <ReadOnlyField
                  label="Criado por"
                  value={property.createdByUserId ? "Usuario autenticado registrado" : "Nao informado"}
                />
              </WorkspaceSection>

              <WorkspaceSection title="Localizacao publica">
                <WorkspaceGrid>
                  <FormField label="Cidade">
                    <input name="city" defaultValue={textValue(property.city)} className={inputClass} />
                  </FormField>
                  <FormField label="Bairro">
                    <input name="neighborhood" defaultValue={textValue(property.neighborhood)} className={inputClass} />
                  </FormField>
                </WorkspaceGrid>
              </WorkspaceSection>

              <WorkspaceSection title="Caracteristicas">
                <WorkspaceGrid>
                  <FormField label="Area privativa">
                    <input
                      name="privateArea"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={numberValue(property.privateArea)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Area total">
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
                  <FormField label="Suites">
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
                    <input
                      name="floor"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={numberValue(property.floor)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Orientacao solar">
                    <SelectField
                      name="solarOrientation"
                      defaultValue={property.solarOrientation}
                      values={PROPERTY_SOLAR_ORIENTATION_VALUES}
                    />
                  </FormField>
                  <FormField label="Mobilia">
                    <SelectField
                      name="furnishedStatus"
                      defaultValue={property.furnishedStatus}
                      values={PROPERTY_FURNISHED_STATUS_VALUES}
                    />
                  </FormField>
                </WorkspaceGrid>
              </WorkspaceSection>

              <WorkspaceSection title="Valores">
                <WorkspaceGrid>
                  <FormField label="Preco">
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={numberValue(property.price)}
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Condominio">
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
                  <FormField label="Descricao original">
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
                    label="Descricao otimizada"
                    value={property.optimizedDescription ?? "Nenhuma descricao otimizada aceita ainda."}
                  />
                </div>
              </WorkspaceSection>

              <ActionMessage state={coreState} />
              <SubmitButton label="Salvar cadastro" pending={corePending} />
            </form>

            <WorkspaceSection
              title="Endereco privado"
              description="Endereco exato separado do payload publico. Acesso ocorre somente pelas RPCs governadas."
            >
              <form action={privateAction} className="flex flex-col gap-4">
                <input type="hidden" name="propertyId" value={property.id} />
                {privateLocationError ? (
                  <p className="text-[0.76rem] text-[rgb(255,170,170)]">
                    Endereco privado indisponivel para seu perfil.
                  </p>
                ) : null}
                <WorkspaceGrid>
                  <FormField label="CEP">
                    <input name="postalCode" defaultValue={textValue(privateLocation?.postalCode)} className={inputClass} />
                  </FormField>
                  <FormField label="Rua">
                    <input name="street" defaultValue={textValue(privateLocation?.street)} className={inputClass} />
                  </FormField>
                  <FormField label="Numero">
                    <input name="number" defaultValue={textValue(privateLocation?.number)} className={inputClass} />
                  </FormField>
                  <FormField label="Complemento">
                    <input name="complement" defaultValue={textValue(privateLocation?.complement)} className={inputClass} />
                  </FormField>
                  <FormField label="Condominio">
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
                <FormField label="Instrucoes de acesso">
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
                <SubmitButton label="Salvar endereco privado" pending={privatePending} />
              </form>
            </WorkspaceSection>

            <WorkspaceSection title="Proximidades">
              <div className="flex flex-col gap-4">
                {proximities.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {proximities.map((proximity) => (
                      <div
                        key={proximity.id}
                        className="rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] px-3 py-3"
                      >
                        <p className="text-[0.84rem] font-medium text-[var(--yzi-text-primary)]">
                          {proximity.label}
                        </p>
                        <p className="mt-1 text-[0.72rem] text-[var(--yzi-text-secondary)]">
                          {proximity.placeType}
                          {proximity.distanceValue !== null
                            ? ` - ${proximity.distanceValue}${proximity.distanceUnit ?? ""}`
                            : ""}
                          {proximity.estimatedMinutes !== null
                            ? ` - ${proximity.estimatedMinutes} min`
                            : ""}
                          {proximity.isConfirmed ? " - confirmada" : " - nao confirmada"}
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
                    <FormField label="Distancia">
                      <input name="distanceValue" type="number" min="0" step="0.01" className={inputClass} />
                    </FormField>
                    <FormField label="Unidade">
                      <SelectField name="distanceUnit" values={PROPERTY_PROXIMITY_DISTANCE_UNIT_VALUES} />
                    </FormField>
                    <FormField label="Modo">
                      <SelectField name="travelMode" values={PROPERTY_PROXIMITY_TRAVEL_MODE_VALUES} />
                    </FormField>
                    <FormField label="Minutos estimados">
                      <input name="estimatedMinutes" type="number" min="0" step="1" className={inputClass} />
                    </FormField>
                    <FormField label="Origem">
                      <SelectField name="source" defaultValue="manual" values={PROPERTY_PROXIMITY_SOURCE_VALUES} />
                    </FormField>
                    <label className="flex items-center gap-2 pt-6 text-[0.78rem] text-[var(--yzi-text-secondary)]">
                      <input name="isConfirmed" type="checkbox" className="h-4 w-4" />
                      Confirmada
                    </label>
                  </WorkspaceGrid>
                  <ActionMessage state={proximityState} />
                  <SubmitButton label="Adicionar proximidade" pending={proximityPending} />
                </form>
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Sugestao editorial">
              <div className="flex flex-col gap-4">
                <WorkspaceGrid>
                  <ReadOnlyField label="Area privativa" value={formatArea(property.privateArea)} />
                  <ReadOnlyField label="Area total" value={formatArea(property.totalArea)} />
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
                  <WorkspaceGrid>
                    <FormField label="Provider">
                      <input name="provider" defaultValue="manual" className={inputClass} />
                    </FormField>
                    <FormField label="Modelo">
                      <input name="model" className={inputClass} />
                    </FormField>
                  </WorkspaceGrid>
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
                    O aceite atualiza a descricao otimizada por RPC governada.
                  </p>
                ) : null}
              </div>
            </WorkspaceSection>
          </div>
        ) : tab === "arquivos" ? (
          <ComingSoonPanel
            label="Arquivos - em breve"
            note="Upload e organizacao de midia ainda nao estao conectados a dados reais."
          />
        ) : tab === "publicacao" ? (
          <YziImobPropertyPublicationWorkspaceSlot />
        ) : (
          <ComingSoonPanel label="IA" note="A YZI ja esta no Inspector; mais acoes chegam aqui." />
        )}

        <p className="text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
          Dados reais desta operacao, com tenant boundary aplicado no servidor. Endereco exato nao entra em
          selects comuns nem em payload publico.
        </p>
      </section>
    </div>
  );
}

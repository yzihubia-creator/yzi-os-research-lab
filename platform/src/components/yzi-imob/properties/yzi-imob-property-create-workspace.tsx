"use client";

import { useActionState, useState } from "react";

import { createPropertyAction } from "@/app/cockpit/yzi-imob/imoveis/novo/actions";
import { INITIAL_CREATE_PROPERTY_STATE } from "@/app/cockpit/yzi-imob/imoveis/novo/action-state";
import {
  CounterStrip,
  EntityHero,
  WorkspaceGrid,
  WorkspaceSection,
  WorkspaceTabs,
  type CounterItem,
} from "@/components/yzi-imob/yzi-imob-workspace-kit";
import {
  WorkspaceDropdown,
  WorkspaceField,
  WorkspaceMultiSelect,
  WorkspaceTextarea,
  WorkspaceToggle,
} from "@/components/yzi-imob/yzi-imob-workspace-fields";
import { PlusIcon, ShieldIcon } from "@/components/yzi-imob/yzi-imob-icons-v2";
import {
  PROPERTY_AVAILABILITY_STATUS_VALUES,
  PROPERTY_FURNISHED_STATUS_VALUES,
  PROPERTY_PROXIMITY_DISTANCE_UNIT_VALUES,
  PROPERTY_PROXIMITY_SOURCE_VALUES,
  PROPERTY_PROXIMITY_TRAVEL_MODE_VALUES,
  PROPERTY_SOLAR_ORIENTATION_VALUES,
  PROPERTY_STATUS_VALUES,
} from "@/lib/yzi-imob/properties/types";

const TABS = [
  { id: "cadastro", label: "Cadastro" },
  { id: "localizacao", label: "Localização" },
  { id: "caracteristicas", label: "Características" },
  { id: "conhecimento", label: "Conhecimento da YZI" },
];

const QUICK_ACTIONS = [
  { label: "O que falta para publicar?" },
  { label: "Melhorar descrição" },
  { label: "Analisar posicionamento" },
  { label: "Preparar para site e redes" },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "terreno", label: "Terreno" },
  { value: "comercial", label: "Comercial" },
  { value: "outro", label: "Outro" },
];

const TRANSACTION_TYPE_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
  { value: "ambos", label: "Venda ou aluguel" },
];

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
  sold: "Vendido",
  rented: "Alugado",
  archived: "Arquivado",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  available: "Disponível",
  reserved: "Reservado",
  sold: "Vendido",
  rented: "Alugado",
  unavailable: "Indisponível",
};

const FURNISHED_LABELS: Record<string, string> = {
  unfurnished: "Sem mobília",
  semi_furnished: "Semi-mobiliado",
  furnished: "Mobiliado",
};

const SOLAR_LABELS: Record<string, string> = {
  north: "Norte",
  south: "Sul",
  east: "Leste / nascente",
  west: "Oeste / poente",
  northeast: "Nordeste",
  northwest: "Noroeste",
  southeast: "Sudeste",
  southwest: "Sudoeste",
};

const FEATURE_OPTIONS = [
  "varanda",
  "vista para o mar",
  "posição nascente",
  "dependência",
  "escritório",
  "área de serviço",
];

const AMENITY_OPTIONS = [
  "piscina",
  "academia",
  "salão de festas",
  "portaria",
  "elevador",
  "espaço gourmet",
];

const SURROUNDING_OPTIONS = [
  "praia",
  "escolas",
  "hospitais",
  "comércio",
  "parques",
  "mobilidade",
];

type ProximityDraft = {
  id: string;
  placeType: string;
  label: string;
  distance: string;
  distanceUnit: string;
  travelMode: string;
  minutes: string;
  source: string;
  confirmed: boolean;
};

type PropertyDraft = {
  title: string;
  referenceCode: string;
  propertyType: string;
  transactionType: string;
  status: string;
  availabilityStatus: string;
  bedrooms: string;
  suites: string;
  bathrooms: string;
  parkingSpaces: string;
  floor: string;
  furnishedStatus: string;
  solarOrientation: string;
  privateArea: string;
  totalArea: string;
  priceCents: string;
  condominiumFeeCents: string;
  iptuValueCents: string;
  city: string;
  neighborhood: string;
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  condominiumName: string;
  block: string;
  unit: string;
  latitude: string;
  longitude: string;
  accessInstructions: string;
  meetingPoint: string;
  propertyFeatures: string[];
  condominiumAmenities: string[];
  surroundings: string[];
  commercialPaymentConditions: string;
  commercialOccupancyStatus: string;
  commercialNotes: string;
  originalDescription: string;
  shortSummary: string;
};

const INITIAL_DRAFT: PropertyDraft = {
  title: "",
  referenceCode: "",
  propertyType: "",
  transactionType: "",
  status: "draft",
  availabilityStatus: "available",
  bedrooms: "",
  suites: "",
  bathrooms: "",
  parkingSpaces: "",
  floor: "",
  furnishedStatus: "",
  solarOrientation: "",
  privateArea: "",
  totalArea: "",
  priceCents: "",
  condominiumFeeCents: "",
  iptuValueCents: "",
  city: "",
  neighborhood: "",
  postalCode: "",
  street: "",
  number: "",
  complement: "",
  condominiumName: "",
  block: "",
  unit: "",
  latitude: "",
  longitude: "",
  accessInstructions: "",
  meetingPoint: "",
  propertyFeatures: [],
  condominiumAmenities: [],
  surroundings: [],
  commercialPaymentConditions: "",
  commercialOccupancyStatus: "",
  commercialNotes: "",
  originalDescription: "",
  shortSummary: "",
};

const MONEY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function currencyDisplay(cents: string): string {
  if (!cents) return "";
  return MONEY_FORMATTER.format(Number(cents) / 100);
}

function currencyPayload(cents: string): string {
  return cents ? String(Number(cents) / 100) : "";
}

function enumOptions(values: readonly string[], labels: Record<string, string>) {
  return [
    { value: "", label: "Não informado" },
    ...values.map((value) => ({ value, label: labels[value] ?? value })),
  ];
}

function newProximity(): ProximityDraft {
  return {
    id: `proximity-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    placeType: "",
    label: "",
    distance: "",
    distanceUnit: "m",
    travelMode: "walk",
    minutes: "",
    source: "manual",
    confirmed: false,
  };
}

function completionState(draft: PropertyDraft) {
  const commercialContext = Boolean(
    draft.priceCents || draft.commercialPaymentConditions.trim() || draft.commercialNotes.trim(),
  );
  const configuration = Boolean(
    draft.bedrooms || draft.suites || draft.bathrooms || draft.parkingSpaces || draft.privateArea,
  );
  const privateLocation = Boolean(
    (draft.street.trim() && draft.number.trim()) || draft.meetingPoint.trim(),
  );
  const checks = [
    ["título", Boolean(draft.title.trim())],
    ["tipo", Boolean(draft.propertyType)],
    ["transação", Boolean(draft.transactionType)],
    ["cidade", Boolean(draft.city.trim())],
    ["bairro", Boolean(draft.neighborhood.trim())],
    ["contexto comercial", commercialContext],
    ["descrição original", draft.originalDescription.trim().length >= 20],
    ["configuração", configuration],
    ["localização confidencial", privateLocation],
  ] as const;
  const completed = checks.filter(([, done]) => done).length;
  return {
    percentage: Math.round((completed / checks.length) * 100),
    missing: checks.filter(([, done]) => !done).map(([label]) => label),
  };
}

function HiddenDraftFields({ draft }: { draft: PropertyDraft }) {
  const regularFields: Array<[keyof PropertyDraft, string]> = [
    ["title", "title"],
    ["referenceCode", "referenceCode"],
    ["propertyType", "propertyType"],
    ["transactionType", "transactionType"],
    ["status", "status"],
    ["availabilityStatus", "availabilityStatus"],
    ["bedrooms", "bedrooms"],
    ["suites", "suites"],
    ["bathrooms", "bathrooms"],
    ["parkingSpaces", "parkingSpaces"],
    ["floor", "floor"],
    ["furnishedStatus", "furnishedStatus"],
    ["solarOrientation", "solarOrientation"],
    ["privateArea", "privateArea"],
    ["totalArea", "totalArea"],
    ["city", "city"],
    ["neighborhood", "neighborhood"],
    ["postalCode", "postalCode"],
    ["street", "street"],
    ["number", "number"],
    ["complement", "complement"],
    ["condominiumName", "condominiumName"],
    ["block", "block"],
    ["unit", "unit"],
    ["latitude", "latitude"],
    ["longitude", "longitude"],
    ["accessInstructions", "accessInstructions"],
    ["meetingPoint", "meetingPoint"],
    ["commercialPaymentConditions", "commercialPaymentConditions"],
    ["commercialOccupancyStatus", "commercialOccupancyStatus"],
    ["commercialNotes", "commercialNotes"],
    ["originalDescription", "originalDescription"],
    ["shortSummary", "shortSummary"],
  ];

  return (
    <>
      {regularFields.map(([key, name]) => (
        <input key={name} type="hidden" name={name} value={String(draft[key])} />
      ))}
      <input type="hidden" name="price" value={currencyPayload(draft.priceCents)} />
      <input
        type="hidden"
        name="condominiumFee"
        value={currencyPayload(draft.condominiumFeeCents)}
      />
      <input type="hidden" name="iptuValue" value={currencyPayload(draft.iptuValueCents)} />
      {draft.propertyFeatures.map((value) => (
        <input key={`feature-${value}`} type="hidden" name="propertyFeatures" value={value} />
      ))}
      {draft.condominiumAmenities.map((value) => (
        <input key={`amenity-${value}`} type="hidden" name="condominiumAmenities" value={value} />
      ))}
      {draft.surroundings.map((value) => (
        <input key={`surrounding-${value}`} type="hidden" name="surroundings" value={value} />
      ))}
    </>
  );
}

export function YziImobPropertyCreateWorkspace() {
  const [tab, setTab] = useState("cadastro");
  const [draft, setDraft] = useState<PropertyDraft>(INITIAL_DRAFT);
  const [proximities, setProximities] = useState<ProximityDraft[]>([]);
  const [assistantMessage, setAssistantMessage] = useState(
    "Ainda não tenho informações suficientes sobre este imóvel. Comece pelo cadastro e eu mostro o que falta para prepará-lo.",
  );
  const [state, formAction, pending] = useActionState(
    createPropertyAction,
    INITIAL_CREATE_PROPERTY_STATE,
  );

  const completion = completionState(draft);
  const counters: CounterItem[] = [
    {
      label: "Completude",
      value: `${completion.percentage}%`,
      detail: `${completion.missing.length} itens centrais pendentes`,
    },
    { label: "Estado editorial", value: "Rascunho", detail: "Sem revisão aceita" },
    { label: "Publicação", value: "Não publicado", detail: "Depende de decisão do gestor" },
    { label: "Nível de ativação", value: "L0", detail: "Cadastro" },
  ];

  function set<K extends keyof PropertyDraft>(key: K, value: PropertyDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateProximity<K extends keyof ProximityDraft>(
    id: string,
    key: K,
    value: ProximityDraft[K],
  ) {
    setProximities((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  }

  function handleAsk(text: string) {
    const normalized = text.toLocaleLowerCase("pt-BR");
    if (normalized.includes("falta") || normalized.includes("publicar")) {
      setAssistantMessage(
        completion.missing.length > 0
          ? `Para preparar a publicação, ainda faltam: ${completion.missing.join(", ")}. Nenhuma publicação será feita sem sua autorização.`
          : "O núcleo do cadastro está preenchido. Ainda será preciso revisar mídia, conteúdo e autorização antes de publicar.",
      );
      return;
    }
    if (normalized.includes("descrição")) {
      setAssistantMessage(
        draft.originalDescription.trim().length >= 20
          ? "A descrição original já oferece contexto. A sugestão editorial ainda não foi gerada nesta etapa."
          : "Preencha a descrição original com fatos do imóvel. Eu não vou completar informações que não foram fornecidas.",
      );
      return;
    }
    if (normalized.includes("posicionamento")) {
      const positioningMissing = [
        !draft.propertyType && "tipo",
        !draft.neighborhood.trim() && "bairro",
        !draft.priceCents && "valor",
      ].filter(Boolean);
      setAssistantMessage(
        positioningMissing.length > 0
          ? `Para analisar o posicionamento sem inventar dados, informe ${positioningMissing.join(", ")}.`
          : "Já existe base para uma análise de posicionamento. A análise automática não é executada nesta unidade.",
      );
      return;
    }
    if (normalized.includes("site") || normalized.includes("redes")) {
      setAssistantMessage(
        `O imóvel está em ${completion.percentage}% de completude cadastral. Site e redes continuam não conectados e exigem autorização do gestor.`,
      );
      return;
    }
    setAssistantMessage(
      `Posso orientar este cadastro com base nos ${completion.percentage}% já preenchidos. Nenhuma chamada externa foi executada.`,
    );
  }

  const error = (field: string) => state.fieldErrors?.[field];

  return (
    <div className="flex w-full flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-8 sm:px-8 sm:pt-10">
        <EntityHero
          backHref="/cockpit/yzi-imob/imoveis"
          backLabel="Imóveis"
          kicker="Property Workspace"
          title="Novo imóvel"
          subtitle="Cadastre as informações que você já tem. A YZI organiza, identifica pendências e prepara o imóvel para publicação e operação."
          statusLabel="Rascunho"
          composerPlaceholder="Pergunte à YZI sobre este imóvel — descrição, posicionamento, informações faltantes..."
          quickActions={QUICK_ACTIONS}
          assistantMessage={assistantMessage}
          onAsk={handleAsk}
        />
      </section>

      <section className="w-full py-7">
        <CounterStrip counters={counters} />
      </section>

      <form
        action={formAction}
        className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-4 pb-10 sm:px-8"
      >
        <HiddenDraftFields draft={draft} />
        {proximities.map((proximity) => (
          <span key={`hidden-${proximity.id}`}>
            <input type="hidden" name="proximityPlaceType" value={proximity.placeType} />
            <input type="hidden" name="proximityLabel" value={proximity.label} />
            <input type="hidden" name="proximityDistance" value={proximity.distance} />
            <input type="hidden" name="proximityDistanceUnit" value={proximity.distanceUnit} />
            <input type="hidden" name="proximityTravelMode" value={proximity.travelMode} />
            <input type="hidden" name="proximityMinutes" value={proximity.minutes} />
            <input type="hidden" name="proximitySource" value={proximity.source} />
            <input type="hidden" name="proximityConfirmed" value={String(proximity.confirmed)} />
          </span>
        ))}
        <WorkspaceTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "cadastro" ? (
          <div className="flex flex-col gap-7">
            <WorkspaceSection first title="Identificação">
              <WorkspaceGrid>
                <WorkspaceField
                  label="Título"
                  value={draft.title}
                  onChange={(value) => set("title", value)}
                  placeholder="Ex.: Apartamento com varanda no Bessa"
                  required
                  error={error("title")}
                  span2
                />
                <WorkspaceField
                  label="Código de referência"
                  value={draft.referenceCode}
                  onChange={(value) => set("referenceCode", value)}
                  placeholder="Gerado ou informado pela operação"
                />
                <WorkspaceDropdown
                  label="Tipo de imóvel"
                  value={draft.propertyType}
                  onChange={(value) => set("propertyType", value)}
                  options={PROPERTY_TYPE_OPTIONS}
                />
                <WorkspaceDropdown
                  label="Transação"
                  value={draft.transactionType}
                  onChange={(value) => set("transactionType", value)}
                  options={TRANSACTION_TYPE_OPTIONS}
                />
                <WorkspaceDropdown
                  label="Status"
                  value={draft.status}
                  onChange={(value) => set("status", value)}
                  options={enumOptions(PROPERTY_STATUS_VALUES, STATUS_LABELS)}
                  error={error("status")}
                />
                <WorkspaceDropdown
                  label="Disponibilidade"
                  value={draft.availabilityStatus}
                  onChange={(value) => set("availabilityStatus", value)}
                  options={enumOptions(
                    PROPERTY_AVAILABILITY_STATUS_VALUES,
                    AVAILABILITY_LABELS,
                  )}
                  error={error("availabilityStatus")}
                />
              </WorkspaceGrid>
            </WorkspaceSection>

            <WorkspaceSection title="Configuração">
              <WorkspaceGrid>
                {(
                  [
                    ["bedrooms", "Quartos"],
                    ["suites", "Suítes"],
                    ["bathrooms", "Banheiros"],
                    ["parkingSpaces", "Vagas"],
                    ["floor", "Andar"],
                  ] as const
                ).map(([key, label]) => (
                  <WorkspaceField
                    key={key}
                    label={label}
                    value={draft[key]}
                    onChange={(value) => set(key, value)}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    error={error(key)}
                  />
                ))}
                <WorkspaceDropdown
                  label="Mobília"
                  value={draft.furnishedStatus}
                  onChange={(value) => set("furnishedStatus", value)}
                  options={enumOptions(PROPERTY_FURNISHED_STATUS_VALUES, FURNISHED_LABELS)}
                  error={error("furnishedStatus")}
                />
                <WorkspaceDropdown
                  label="Orientação solar"
                  value={draft.solarOrientation}
                  onChange={(value) => set("solarOrientation", value)}
                  options={enumOptions(PROPERTY_SOLAR_ORIENTATION_VALUES, SOLAR_LABELS)}
                  error={error("solarOrientation")}
                />
              </WorkspaceGrid>
            </WorkspaceSection>

            <WorkspaceSection title="Áreas e valores">
              <WorkspaceGrid>
                <WorkspaceField
                  label="Área privativa (m²)"
                  value={draft.privateArea}
                  onChange={(value) => set("privateArea", value)}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  error={error("privateArea")}
                />
                <WorkspaceField
                  label="Área total (m²)"
                  value={draft.totalArea}
                  onChange={(value) => set("totalArea", value)}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  error={error("totalArea")}
                />
                <WorkspaceField
                  label="Preço"
                  value={currencyDisplay(draft.priceCents)}
                  onChange={(value) => set("priceCents", value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  error={error("price")}
                />
                <WorkspaceField
                  label="Condomínio"
                  value={currencyDisplay(draft.condominiumFeeCents)}
                  onChange={(value) => set("condominiumFeeCents", value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  error={error("condominiumFee")}
                />
                <WorkspaceField
                  label="IPTU"
                  value={currencyDisplay(draft.iptuValueCents)}
                  onChange={(value) => set("iptuValueCents", value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  error={error("iptuValue")}
                />
              </WorkspaceGrid>
            </WorkspaceSection>
          </div>
        ) : tab === "localizacao" ? (
          <div className="flex flex-col gap-7">
            <WorkspaceSection first title="Localização pública">
              <WorkspaceGrid>
                <WorkspaceField
                  label="Cidade"
                  value={draft.city}
                  onChange={(value) => set("city", value)}
                />
                <WorkspaceField
                  label="Bairro"
                  value={draft.neighborhood}
                  onChange={(value) => set("neighborhood", value)}
                />
              </WorkspaceGrid>
            </WorkspaceSection>

            <WorkspaceSection
              title="Endereço confidencial"
              description="Mantido em uma camada privada e usado apenas pela operação autorizada."
            >
              <div className="flex items-start gap-2.5 border-y border-[color:var(--yzi-border-subtle)] py-3 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--imob-ice))]" />
                <p>
                  O endereço exato é confidencial e não aparece no site, catálogo, SEO ou
                  atendimento público.
                </p>
              </div>
              <WorkspaceGrid>
                <WorkspaceField
                  label="CEP"
                  value={draft.postalCode}
                  onChange={(value) => set("postalCode", value)}
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
                <WorkspaceField
                  label="Logradouro"
                  value={draft.street}
                  onChange={(value) => set("street", value)}
                  autoComplete="street-address"
                />
                <WorkspaceField
                  label="Número"
                  value={draft.number}
                  onChange={(value) => set("number", value)}
                />
                <WorkspaceField
                  label="Complemento"
                  value={draft.complement}
                  onChange={(value) => set("complement", value)}
                />
                <WorkspaceField
                  label="Condomínio"
                  value={draft.condominiumName}
                  onChange={(value) => set("condominiumName", value)}
                />
                <WorkspaceField
                  label="Bloco"
                  value={draft.block}
                  onChange={(value) => set("block", value)}
                />
                <WorkspaceField
                  label="Unidade"
                  value={draft.unit}
                  onChange={(value) => set("unit", value)}
                />
                <WorkspaceField
                  label="Latitude"
                  value={draft.latitude}
                  onChange={(value) => set("latitude", value)}
                  type="number"
                  inputMode="decimal"
                  min={-90}
                  max={90}
                  step="0.000001"
                  error={error("latitude")}
                />
                <WorkspaceField
                  label="Longitude"
                  value={draft.longitude}
                  onChange={(value) => set("longitude", value)}
                  type="number"
                  inputMode="decimal"
                  min={-180}
                  max={180}
                  step="0.000001"
                  error={error("longitude")}
                />
              </WorkspaceGrid>
              <WorkspaceTextarea
                label="Instruções de acesso"
                value={draft.accessInstructions}
                onChange={(value) => set("accessInstructions", value)}
                rows={3}
                span2
              />
              <WorkspaceTextarea
                label="Ponto de encontro"
                value={draft.meetingPoint}
                onChange={(value) => set("meetingPoint", value)}
                rows={3}
                span2
              />
            </WorkspaceSection>
          </div>
        ) : tab === "caracteristicas" ? (
          <div className="flex flex-col gap-7">
            <WorkspaceSection first title="Características do imóvel">
              <WorkspaceMultiSelect
                label="Selecione o que foi confirmado"
                options={FEATURE_OPTIONS}
                value={draft.propertyFeatures}
                onChange={(value) => set("propertyFeatures", value)}
                span2
              />
            </WorkspaceSection>
            <WorkspaceSection title="Comodidades do condomínio">
              <WorkspaceMultiSelect
                label="Estrutura disponível"
                options={AMENITY_OPTIONS}
                value={draft.condominiumAmenities}
                onChange={(value) => set("condominiumAmenities", value)}
                span2
              />
            </WorkspaceSection>
            <WorkspaceSection title="Entorno">
              <WorkspaceMultiSelect
                label="Pontos relevantes"
                options={SURROUNDING_OPTIONS}
                value={draft.surroundings}
                onChange={(value) => set("surroundings", value)}
                span2
              />
            </WorkspaceSection>
            <WorkspaceSection
              title="Contexto comercial"
              description="Informações operacionais persistidas como contexto estruturado, sem editor JSON."
            >
              <WorkspaceGrid>
                <WorkspaceField
                  label="Condições de pagamento"
                  value={draft.commercialPaymentConditions}
                  onChange={(value) => set("commercialPaymentConditions", value)}
                  placeholder="Ex.: aceita financiamento"
                />
                <WorkspaceField
                  label="Situação de ocupação"
                  value={draft.commercialOccupancyStatus}
                  onChange={(value) => set("commercialOccupancyStatus", value)}
                  placeholder="Ex.: desocupado"
                />
              </WorkspaceGrid>
              <WorkspaceTextarea
                label="Observações comerciais"
                value={draft.commercialNotes}
                onChange={(value) => set("commercialNotes", value)}
                rows={4}
                span2
              />
            </WorkspaceSection>
          </div>
        ) : (
          <div className="flex flex-col gap-7">
            <WorkspaceSection
              first
              title="Descrição original"
              description="Texto factual fornecido pela imobiliária ou pelo corretor."
            >
              <WorkspaceTextarea
                label="Descrição do imóvel"
                value={draft.originalDescription}
                onChange={(value) => set("originalDescription", value)}
                rows={8}
                placeholder="Apresente apenas informações confirmadas sobre o imóvel."
                span2
              />
              <WorkspaceTextarea
                label="Resumo curto"
                value={draft.shortSummary}
                onChange={(value) => set("shortSummary", value)}
                rows={3}
                span2
              />
            </WorkspaceSection>

            <WorkspaceSection
              title="Sugestão da YZI"
              description="A revisão editorial só aparece depois que uma proposta real for registrada."
            >
              <div className="border-y border-[color:var(--yzi-border-subtle)] py-5">
                <p className="text-[0.84rem] font-medium text-[var(--yzi-text-primary)]">
                  Sem revisão
                </p>
                <p className="mt-1 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                  Nenhuma descrição foi gerada automaticamente nesta unidade.
                </p>
              </div>
            </WorkspaceSection>

            <WorkspaceSection title="Ações editoriais">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled
                  className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.76rem] text-[var(--yzi-text-faint)] opacity-60"
                >
                  Aceitar
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.76rem] text-[var(--yzi-text-faint)] opacity-60"
                >
                  Rejeitar
                </button>
              </div>
              <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">
                Após o cadastro, as decisões editoriais ficam registradas no histórico do imóvel.
                Workspace.
              </p>
            </WorkspaceSection>

            <WorkspaceSection
              title="Proximidades"
              description="Registre apenas locais conhecidos. Extrações de texto sempre nascem não confirmadas."
            >
              {proximities.length === 0 ? (
                <p className="text-[0.78rem] text-[var(--yzi-text-secondary)]">
                  Nenhuma proximidade cadastrada.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {proximities.map((proximity, index) => (
                    <div
                      key={proximity.id}
                      className="flex flex-col gap-4 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[0.78rem] font-medium text-[var(--yzi-text-primary)]">
                          Proximidade {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setProximities((current) =>
                              current.filter((item) => item.id !== proximity.id),
                            )
                          }
                          className="text-[0.7rem] text-[var(--yzi-text-faint)] hover:text-[var(--yzi-text-secondary)]"
                        >
                          Remover
                        </button>
                      </div>
                      <WorkspaceGrid>
                        <WorkspaceField
                          label="Tipo"
                          value={proximity.placeType}
                          onChange={(value) =>
                            updateProximity(proximity.id, "placeType", value)
                          }
                          placeholder="Ex.: escola"
                        />
                        <WorkspaceField
                          label="Nome"
                          value={proximity.label}
                          onChange={(value) => updateProximity(proximity.id, "label", value)}
                        />
                        <WorkspaceField
                          label="Distância"
                          value={proximity.distance}
                          onChange={(value) => updateProximity(proximity.id, "distance", value)}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="0.01"
                        />
                        <WorkspaceDropdown
                          label="Unidade"
                          value={proximity.distanceUnit}
                          onChange={(value) =>
                            updateProximity(proximity.id, "distanceUnit", value)
                          }
                          options={PROPERTY_PROXIMITY_DISTANCE_UNIT_VALUES.map((value) => ({
                            value,
                            label: value,
                          }))}
                        />
                        <WorkspaceDropdown
                          label="Modo"
                          value={proximity.travelMode}
                          onChange={(value) =>
                            updateProximity(proximity.id, "travelMode", value)
                          }
                          options={PROPERTY_PROXIMITY_TRAVEL_MODE_VALUES.map((value) => ({
                            value,
                            label:
                              value === "walk"
                                ? "A pé"
                                : value === "drive"
                                  ? "Carro"
                                  : value === "transit"
                                    ? "Transporte público"
                                    : "Bicicleta",
                          }))}
                        />
                        <WorkspaceField
                          label="Minutos"
                          value={proximity.minutes}
                          onChange={(value) => updateProximity(proximity.id, "minutes", value)}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={1}
                        />
                        <WorkspaceDropdown
                          label="Fonte"
                          value={proximity.source}
                          onChange={(value) => {
                            updateProximity(proximity.id, "source", value);
                            if (value === "extracted_from_text") {
                              updateProximity(proximity.id, "confirmed", false);
                            }
                          }}
                          options={PROPERTY_PROXIMITY_SOURCE_VALUES.filter(
                            (value) => value !== "external_api",
                          ).map((value) => ({
                            value,
                            label:
                              value === "manual"
                                ? "Manual"
                                : value === "extracted_from_text"
                                  ? "Extraída do texto"
                                  : "Importada",
                          }))}
                        />
                        <WorkspaceToggle
                          label="Confirmada"
                          value={proximity.confirmed}
                          onChange={(value) =>
                            updateProximity(proximity.id, "confirmed", value)
                          }
                          disabled={proximity.source === "extracted_from_text"}
                          hint={
                            proximity.source === "extracted_from_text"
                              ? "Extrações de texto não podem nascer confirmadas."
                              : "Confirmação humana da informação."
                          }
                        />
                      </WorkspaceGrid>
                    </div>
                  ))}
                </div>
              )}
              {error("proximities") ? (
                <p role="alert" className="text-[0.7rem] text-[rgb(255,170,170)]">
                  {error("proximities")}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setProximities((current) => [...current, newProximity()])}
                className="inline-flex w-fit items-center gap-2 rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] px-3 py-2 text-[0.76rem] text-[var(--yzi-text-secondary)] transition-colors hover:text-[var(--yzi-text-primary)]"
              >
                <PlusIcon className="h-4 w-4" />
                Adicionar proximidade
              </button>
            </WorkspaceSection>
          </div>
        )}

        {state.message ? (
          <div
            aria-live="polite"
            className={
              state.status === "partial"
                ? "border-y border-[rgba(255,196,120,0.28)] bg-[rgba(255,196,120,0.06)] px-4 py-3 text-[0.78rem] leading-relaxed text-[rgb(255,211,153)]"
                : "border-y border-[rgba(255,120,120,0.25)] bg-[rgba(255,120,120,0.06)] px-4 py-3 text-[0.78rem] leading-relaxed text-[rgb(255,170,170)]"
            }
          >
            <p>{state.message}</p>
            {state.createdPropertyId ? (
              <p className="mt-1 text-[0.7rem] opacity-80">
                Imóvel preservado: {state.createdPropertyId}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--yzi-border-subtle)] pt-6">
          <p className="max-w-xl text-[0.7rem] leading-relaxed text-[var(--yzi-text-faint)]">
            O imóvel será criado nesta operação. O endereço confidencial permanece protegido;
            nenhuma publicação ou ação externa acontece neste salvamento.
          </p>
          <button
            type="submit"
            disabled={pending || state.status === "membership_missing"}
            className="rounded-[var(--yzi-radius-sm)] border border-[rgba(var(--imob-ice),0.36)] bg-[rgba(var(--imob-cold),0.16)] px-4 py-2.5 text-[0.8rem] font-medium text-[rgb(var(--imob-ice))] transition-colors hover:bg-[rgba(var(--imob-cold),0.24)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending
              ? "Salvando..."
              : state.status === "partial"
                ? "Retomar salvamento"
                : "Salvar imóvel"}
          </button>
        </div>
      </form>
    </div>
  );
}

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
import {
  CampaignIcon,
  CardIcon,
  CreativeIcon,
  ImageIcon,
  LockIcon,
  PlusIcon,
  PropertyIcon,
  ShieldIcon,
  StackIcon,
  TargetIcon,
} from "@/components/yzi-imob/yzi-imob-icons-v2";
import { StateTag, cx, type SurfaceTone } from "@/components/yzi-imob/yzi-imob-surface-kit";
import {
  GUIDED_MEDIA_SLOT_DEFINITIONS,
  type GuidedMediaSlotDefinition,
  type GuidedMediaSlotKey,
} from "@/lib/yzi-imob/creative/media/guided-journey";
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
  { id: "midias", label: "Mídias" },
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

type MediaGroupIcon = typeof PropertyIcon;

type MediaGroupConfig = {
  title: string;
  hint: string;
  icon: MediaGroupIcon;
  slotKeys: readonly GuidedMediaSlotKey[];
  gridClassName: string;
  featuredKey?: GuidedMediaSlotKey;
};

const MEDIA_GROUPS: readonly MediaGroupConfig[] = [
  {
    title: "Essenciais para começar",
    hint: "O que apresenta o imóvel de primeira.",
    icon: PropertyIcon,
    slotKeys: ["primary", "facade", "location_view"],
    gridClassName: "grid grid-cols-1 gap-4 sm:grid-cols-2",
    featuredKey: "primary",
  },
  {
    title: "Experiência do imóvel",
    hint: "O que mostra como é viver ali.",
    icon: StackIcon,
    slotKeys: ["entrance", "common_area", "leisure", "interior"],
    gridClassName: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
  },
  {
    title: "Decisão e fechamento",
    hint: "O que ajuda a fechar a visita.",
    icon: TargetIcon,
    slotKeys: ["floor_plan", "commercial_material", "closing_cta"],
    gridClassName: "grid grid-cols-1 gap-4 sm:grid-cols-3",
  },
];

const MEDIA_SLOT_PHRASES: Record<GuidedMediaSlotKey, string> = {
  primary: "A capa que abre a apresentação.",
  facade: "A fachada ou identidade externa.",
  location_view: "Entorno, acesso ou vista confirmada.",
  entrance: "A chegada até os ambientes internos.",
  common_area: "Por enquanto, organizada junto com Lazer.",
  leisure: "Piscina, rooftop e espaços de convívio.",
  interior: "Sala, quartos, cozinha, suíte e banheiro.",
  floor_plan: "A planta e a distribuição dos espaços.",
  commercial_material: "Marca do imóvel; documentos vêm depois.",
  closing_cta: "O fechamento é gerado automaticamente.",
};

const MEDIA_SLOT_BY_KEY = new Map<GuidedMediaSlotKey, GuidedMediaSlotDefinition>(
  GUIDED_MEDIA_SLOT_DEFINITIONS.map((slot) => [slot.key, slot]),
);

function slotImportanceLabel(slot: GuidedMediaSlotDefinition): string {
  if (slot.support === "pending") return "Em breve";
  if (slot.importance === "required") return "Obrigatório";
  if (slot.importance === "recommended") return "Recomendado";
  return "Opcional";
}

function slotImportanceTone(label: string): SurfaceTone {
  if (label === "Obrigatório") return "info";
  if (label === "Recomendado") return "pending";
  return "idle";
}

const RELEASE_CARDS: { title: string; detail: string; icon: MediaGroupIcon }[] = [
  {
    title: "Carrossel",
    detail: "Capa e uma seleção mínima de imagens aprovadas.",
    icon: CardIcon,
  },
  {
    title: "Vídeo tour",
    detail: "Capa, volume mínimo e variedade de ambientes.",
    icon: CreativeIcon,
  },
  {
    title: "Anúncios",
    detail: "Dados do imóvel e material suficiente para a peça.",
    icon: CampaignIcon,
  },
];

/** Campo de mídia individual — o "slot" no padrão de anexo estilo Airtable:
 * papel do arquivo, importância e uma área de anexo (bloqueada até salvar). */
function MediaSlotCard({
  slotKey,
  featured = false,
}: {
  slotKey: GuidedMediaSlotKey;
  featured?: boolean;
}) {
  const slot = MEDIA_SLOT_BY_KEY.get(slotKey);
  if (!slot) return null;

  const importance = slotImportanceLabel(slot);
  const tone = slotImportanceTone(importance);
  const isPending = slot.support === "pending";

  return (
    <div
      className={cx(
        "flex flex-col gap-3 rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] bg-[var(--yzi-surface-base)] p-4",
        featured && "sm:col-span-2",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.82rem] font-medium text-[var(--yzi-text-primary)]">{slot.label}</p>
        <StateTag tone={tone} label={importance} />
      </div>
      <p className="text-[0.72rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        {MEDIA_SLOT_PHRASES[slotKey]}
      </p>

      <div
        className={cx(
          "flex cursor-not-allowed flex-col items-center justify-center gap-1.5 rounded-[var(--yzi-radius-sm)] border border-dashed border-[color:var(--yzi-border-subtle)] bg-[rgba(255,255,255,0.015)] px-3 text-center",
          featured ? "aspect-[21/9]" : "aspect-[4/3]",
        )}
      >
        <ImageIcon aria-hidden className="h-5 w-5 text-[var(--yzi-text-faint)]" />
        {isPending ? (
          <p className="text-[0.68rem] text-[var(--yzi-text-faint)]">Ainda não disponível</p>
        ) : (
          <>
            <p className="text-[0.72rem] font-medium text-[var(--yzi-text-secondary)]">
              Salvar para adicionar mídia
            </p>
            <p className="flex items-center gap-1 text-[0.62rem] text-[var(--yzi-text-faint)]">
              <LockIcon aria-hidden className="h-3 w-3" />
              Disponível depois de salvar
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function MediaGroupSection({ group }: { group: MediaGroupConfig }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid h-7 w-7 shrink-0 place-items-center rounded-[var(--yzi-radius-sm)] border border-[color:var(--yzi-border-subtle)] text-[var(--yzi-text-secondary)]"
        >
          <group.icon className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[0.8rem] font-semibold text-[var(--yzi-text-primary)]">{group.title}</p>
          <p className="text-[0.7rem] text-[var(--yzi-text-faint)]">{group.hint}</p>
        </div>
      </div>
      <div className={group.gridClassName}>
        {group.slotKeys.map((key) => (
          <MediaSlotCard key={key} slotKey={key} featured={key === group.featuredKey} />
        ))}
      </div>
    </div>
  );
}

function MediaPreparationTab() {
  return (
    <div className="flex flex-col gap-7">
      <WorkspaceSection
        first
        title="Mídias do imóvel"
        description="Separe os arquivos pelo papel que eles cumprem na apresentação."
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-3 rounded-[var(--yzi-radius-md)] border border-[color:rgba(var(--imob-ice),0.28)] bg-[rgba(var(--imob-cold),0.08)] px-4 py-3.5 sm:px-5">
            <LockIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--imob-ice))]" />
            <div>
              <p className="text-[0.82rem] font-medium text-[var(--yzi-text-primary)]">
                Salve o imóvel para liberar os campos de mídia.
              </p>
              <p className="mt-1 text-[0.74rem] leading-relaxed text-[var(--yzi-text-secondary)]">
                Nenhuma mídia é enviada ou registrada antes de o imóvel existir — assim que você
                salvar, cada campo abaixo passa a aceitar arquivo.
              </p>
            </div>
          </div>

          {MEDIA_GROUPS.map((group) => (
            <MediaGroupSection key={group.title} group={group} />
          ))}
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        title="O que isso libera"
        description="Calculado depois do salvamento, a partir dos dados e das mídias reais do imóvel."
      >
        <div className="grid grid-cols-1 divide-y divide-[color:var(--yzi-border-subtle)] rounded-[var(--yzi-radius-md)] border border-[color:var(--yzi-border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {RELEASE_CARDS.map((card) => (
            <div key={card.title} className="flex items-start gap-2.5 px-4 py-3.5">
              <card.icon aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--yzi-text-faint)]" />
              <div>
                <p className="text-[0.76rem] font-medium text-[var(--yzi-text-primary)]">{card.title}</p>
                <p className="mt-0.5 text-[0.68rem] leading-relaxed text-[var(--yzi-text-faint)]">
                  {card.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </WorkspaceSection>

      <WorkspaceSection title="Depois de salvar">
        <div className="flex items-start gap-2.5 text-[0.76rem] leading-relaxed text-[var(--yzi-text-secondary)]">
          <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--imob-ice))]" />
          <p className="max-w-2xl">
            Ao salvar, você é levado direto à aba Mídias deste imóvel para organizar o que já
            tiver. O upload real depende do imóvel já existir, então ele é liberado só a partir
            daí. A YZI prepara criativos apenas quando houver dados e mídias suficientes — nada é
            gerado sem essa confirmação.
          </p>
        </div>
      </WorkspaceSection>
    </div>
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
        ) : tab === "conhecimento" ? (
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
        ) : (
          <MediaPreparationTab />
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
            O imóvel será criado nesta operação. Depois, você poderá organizar as mídias vinculadas
            por papel; nenhuma publicação ou ação externa acontece neste salvamento.
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
                : "Salvar e organizar mídias"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { PROPERTY_EDITORIAL_V1 } from "./template-registry.ts";
import {
  CAROUSEL_CARD_ROLES,
  CAROUSEL_TEMPLATE_KEY,
  type CarouselCard,
  type CarouselDiagnostic,
  type CarouselEditorialPlan,
  type CarouselFact,
  type CarouselMediaCandidate,
  type CarouselPropertyFacts,
} from "./types.ts";

function money(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}
function compactFeature(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    for (const key of ["label", "name", "value"]) {
      if (typeof record[key] === "string" && record[key].trim()) return record[key].trim();
    }
  }
  return null;
}

export function selectGovernedCarouselMedia(
  tenantId: string,
  propertyId: string,
  candidates: readonly CarouselMediaCandidate[],
): readonly CarouselMediaCandidate[] {
  return candidates
    .filter(
      (media) =>
        media.tenantId === tenantId &&
        media.propertyId === propertyId &&
        media.mediaType === "image" &&
        media.isPublicationAllowed &&
        media.processingStatus === "ready",
    )
    .sort(
      (left, right) =>
        Number(right.isCover) - Number(left.isCover) ||
        left.sortOrder - right.sortOrder ||
        left.id.localeCompare(right.id),
    );
}

function fact(
  key: CarouselFact["key"],
  value: string | number | null,
  sourceField: string,
  display?: string,
): CarouselFact | null {
  if (value === null || value === "") return null;
  return { key, displayValue: display ?? String(value), sourceField };
}

function cardDiagnostics(card: Omit<CarouselCard, "diagnostics">): CarouselDiagnostic[] {
  const limits = PROPERTY_EDITORIAL_V1.limits[card.role];
  const diagnostics: CarouselDiagnostic[] = [];
  if (card.headline.length > limits.headline) {
    diagnostics.push({
      code: "headline_overflow",
      severity: "blocking",
      message: "Headline excede o limite seguro do template.",
      cardPosition: card.position,
    });
  }
  if ((card.body?.length ?? 0) > limits.body) {
    diagnostics.push({
      code: "body_overflow",
      severity: "blocking",
      message: "Texto de apoio excede o limite seguro do template.",
      cardPosition: card.position,
    });
  }
  if (card.position <= 5 && !card.mediaId) {
    diagnostics.push({
      code: "missing_media",
      severity: "warning",
      message: "Card sem imagem canônica disponível.",
      cardPosition: card.position,
    });
  }
  return diagnostics;
}

function withDiagnostics(card: Omit<CarouselCard, "diagnostics">): CarouselCard {
  return { ...card, diagnostics: cardDiagnostics(card) };
}

export function validateCarouselPlan(plan: CarouselEditorialPlan): readonly CarouselDiagnostic[] {
  const diagnostics = [...plan.cards.flatMap((card) => card.diagnostics)];
  if (plan.cards.length !== 7) {
    diagnostics.push({
      code: "invalid_card_count",
      severity: "blocking",
      message: "O template exige exatamente sete cards.",
    });
  }
  if (plan.cards.some((card, index) => card.position !== index + 1)) {
    diagnostics.push({
      code: "invalid_card_order",
      severity: "blocking",
      message: "A ordem editorial dos cards é inválida.",
    });
  }
  CAROUSEL_CARD_ROLES.forEach((role, index) => {
    if (plan.cards[index]?.role !== role) {
      diagnostics.push({
        code: "missing_required_card",
        severity: "blocking",
        message: `O card obrigatório ${role} está ausente.`,
        cardPosition: index + 1,
      });
    }
  });
  return diagnostics;
}

export function buildCarouselEditorialPlan(input: {
  property: CarouselPropertyFacts;
  media: readonly CarouselMediaCandidate[];
  objective?: "present_property" | "generate_visits";
}): CarouselEditorialPlan {
  const { property } = input;
  const media = selectGovernedCarouselMedia(property.tenantId, property.id, input.media);
  const mediaFor = (position: number) =>
    media.length ? media[(position - 1) % Math.min(media.length, 5)]?.id : undefined;
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ");
  const features = property.propertyFeatures.map(compactFeature).filter(Boolean).slice(0, 3) as string[];
  const essentialFacts = [
    fact("price", property.price, "price", property.price === null ? undefined : money(property.price)),
    fact("private_area", property.privateArea, "private_area", property.privateArea === null ? undefined : `${property.privateArea} m²`),
    fact("bedrooms", property.bedrooms, "bedrooms", property.bedrooms === null ? undefined : `${property.bedrooms} quartos`),
    fact("suites", property.suites, "suites", property.suites === null ? undefined : `${property.suites} suítes`),
    fact("parking_spaces", property.parkingSpaces, "parking_spaces", property.parkingSpaces === null ? undefined : `${property.parkingSpaces} vagas`),
  ].filter(Boolean) as CarouselFact[];

  const cards: CarouselCard[] = [
    withDiagnostics({
      position: 1,
      role: "cover",
      headline: property.title,
      body: location || undefined,
      facts: [fact("title", property.title, "title")!, fact("neighborhood", property.neighborhood, "neighborhood")].filter(Boolean) as CarouselFact[],
      mediaId: mediaFor(1),
      layoutVariant: "image_full",
    }),
    withDiagnostics({
      position: 2,
      role: "core_experience",
      headline: property.shortSummary ?? "Um imóvel para viver bem",
      body: location ? `Uma leitura editorial a partir do imóvel em ${location}.` : undefined,
      facts: [],
      mediaId: mediaFor(2),
      layoutVariant: "image_split",
    }),
    withDiagnostics({
      position: 3,
      role: "primary_space",
      headline: "Espaços que acolhem a rotina",
      body: "Conheça os ambientes registrados nas mídias deste imóvel.",
      facts: [],
      mediaId: mediaFor(3),
      layoutVariant: "image_full",
    }),
    withDiagnostics({
      position: 4,
      role: "differentiators",
      headline: features.length ? "Diferenciais cadastrados" : "Detalhes do imóvel",
      body: features.length ? features.join(" • ") : "Consulte a ficha completa para conhecer todos os detalhes.",
      facts: features.map((value) => ({
        key: "property_feature",
        displayValue: value,
        sourceField: "property_features",
      })),
      mediaId: mediaFor(4),
      layoutVariant: "facts_over_image",
    }),
    withDiagnostics({
      position: 5,
      role: "location_context",
      headline: property.neighborhood ?? property.city ?? "Localização cadastrada",
      body: location || "Consulte a localização disponível na ficha do imóvel.",
      facts: [
        fact("neighborhood", property.neighborhood, "neighborhood"),
        fact("city", property.city, "city"),
      ].filter(Boolean) as CarouselFact[],
      mediaId: mediaFor(5),
      layoutVariant: "location_over_image",
    }),
    withDiagnostics({
      position: 6,
      role: "essential_facts",
      headline: "Ficha essencial",
      body: essentialFacts.map((item) => item.displayValue).join(" • ") || "Dados essenciais ainda não cadastrados.",
      facts: essentialFacts,
      layoutVariant: "facts_panel",
    }),
    withDiagnostics({
      position: 7,
      role: "closing",
      headline: input.objective === "generate_visits" ? "Vamos agendar uma visita?" : "Quer conhecer este imóvel?",
      body: property.referenceCode ? `Referência ${property.referenceCode}` : "Fale com a equipe responsável por este imóvel.",
      facts: [fact("reference_code", property.referenceCode, "reference_code")].filter(Boolean) as CarouselFact[],
      layoutVariant: "brand_closing",
    }),
  ];

  const globalDiagnostics: CarouselDiagnostic[] = [];
  if (media.length < 5) {
    globalDiagnostics.push({
      code: "insufficient_media",
      severity: media.length === 0 ? "blocking" : "warning",
      message: `${media.length} imagem(ns) canônica(s) disponível(is); a reutilização será controlada.`,
    });
  }
  if (media.length > 0 && media.length < 3) {
    globalDiagnostics.push({
      code: "excessive_media_reuse",
      severity: "blocking",
      message: "Há poucas imagens para manter diversidade visual segura em sete cards.",
    });
  }

  const factualSources = [...new Set(cards.flatMap((card) => card.facts.map((item) => item.sourceField)))]
    .map((field) => ({ field, source: "yzi_imob_properties" as const }));
  const base: CarouselEditorialPlan = {
    kind: "carousel_editorial_plan",
    propertyId: property.id,
    templateKey: CAROUSEL_TEMPLATE_KEY,
    templateVersion: 1,
    objective: input.objective ?? "present_property",
    selectedMediaIds: media.slice(0, 5).map((item) => item.id),
    cards,
    caption: {
      text: `${property.title}${location ? `, em ${location}` : ""}. Conheça os dados e ambientes cadastrados e fale com nossa equipe para saber mais.`,
      hashtags: ["#Imóveis", "#YZiImob"],
    },
    factualSources,
    diagnostics: globalDiagnostics,
    approvalBlocked: false,
  };
  const diagnostics = [...globalDiagnostics, ...validateCarouselPlan(base)];
  return {
    ...base,
    diagnostics,
    approvalBlocked: diagnostics.some((item) => item.severity === "blocking"),
  };
}

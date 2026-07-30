export const CAROUSEL_TEMPLATE_KEY = "property_editorial_v1" as const;

export const CAROUSEL_CARD_ROLES = [
  "cover",
  "core_experience",
  "primary_space",
  "differentiators",
  "location_context",
  "essential_facts",
  "closing",
] as const;

export type CarouselCardRole = (typeof CAROUSEL_CARD_ROLES)[number];
export type CarouselDiagnosticSeverity = "warning" | "blocking";

export type CarouselDiagnostic = {
  code:
    | "headline_overflow"
    | "body_overflow"
    | "missing_media"
    | "insufficient_media"
    | "excessive_media_reuse"
    | "invalid_card_count"
    | "invalid_card_order"
    | "missing_required_card"
    | "unverified_fact";
  severity: CarouselDiagnosticSeverity;
  message: string;
  cardPosition?: number;
};

export type CarouselFact = {
  key:
    | "title"
    | "reference_code"
    | "price"
    | "neighborhood"
    | "city"
    | "private_area"
    | "total_area"
    | "bedrooms"
    | "suites"
    | "parking_spaces"
    | "availability_status"
    | "property_feature";
  displayValue: string;
  sourceField: string;
};

export type CarouselCard = {
  position: number;
  role: CarouselCardRole;
  headline: string;
  body?: string;
  facts: readonly CarouselFact[];
  mediaId?: string;
  layoutVariant: string;
  diagnostics: readonly CarouselDiagnostic[];
};

export type CarouselCaption = {
  text: string;
  hashtags: readonly string[];
};

export type CarouselEditorialPlan = {
  kind: "carousel_editorial_plan";
  propertyId: string;
  templateKey: typeof CAROUSEL_TEMPLATE_KEY;
  templateVersion: 1;
  objective: "present_property" | "generate_visits";
  selectedMediaIds: readonly string[];
  cards: readonly CarouselCard[];
  caption: CarouselCaption;
  factualSources: readonly {
    field: string;
    source: "yzi_imob_properties";
  }[];
  diagnostics: readonly CarouselDiagnostic[];
  approvalBlocked: boolean;
};

export type CarouselPropertyFacts = {
  id: string;
  tenantId: string;
  referenceCode: string | null;
  title: string;
  city: string | null;
  neighborhood: string | null;
  price: number | null;
  privateArea: number | null;
  totalArea: number | null;
  bedrooms: number | null;
  suites: number | null;
  parkingSpaces: number | null;
  availabilityStatus: string | null;
  shortSummary: string | null;
  propertyFeatures: readonly unknown[];
};

export type CarouselMediaCandidate = {
  id: string;
  tenantId: string;
  propertyId: string;
  mediaType: "image" | "video";
  sortOrder: number;
  isCover: boolean;
  isPublicationAllowed: boolean;
  processingStatus: string;
};

export type CarouselAdjustment =
  | { kind: "swap_media"; cardPosition: number; replacementMediaId: string; note?: string }
  | { kind: "shorten_headline"; cardPosition: number; note?: string }
  | { kind: "remove_fact"; cardPosition: number; note?: string }
  | { kind: "change_cta"; cardPosition: 7; note: string }
  | { kind: "correct_fact"; cardPosition: number; note?: string }
  | { kind: "use_approved_media"; cardPosition: number; replacementMediaId: string; note?: string };

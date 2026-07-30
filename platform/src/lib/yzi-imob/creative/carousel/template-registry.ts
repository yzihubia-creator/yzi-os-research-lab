import {
  CAROUSEL_TEMPLATE_KEY,
  type CarouselCardRole,
} from "./types.ts";

export type CarouselTemplate = {
  key: typeof CAROUSEL_TEMPLATE_KEY;
  version: 1;
  width: 1080;
  height: 1350;
  cardCount: 7;
  safeArea: { top: 96; right: 84; bottom: 96; left: 84 };
  typography: { headline: 68; body: 34; fact: 30; caption: 28 };
  spacing: { xs: 12; sm: 20; md: 32; lg: 48; xl: 72 };
  logoArea: { width: 220; height: 72 };
  ctaArea: { minHeight: 128 };
  roleVariants: Readonly<Record<CarouselCardRole, readonly string[]>>;
  limits: Readonly<Record<CarouselCardRole, { headline: number; body: number }>>;
  overflowPolicy: "shorten_then_variant_then_block";
};

export const PROPERTY_EDITORIAL_V1: CarouselTemplate = {
  key: CAROUSEL_TEMPLATE_KEY,
  version: 1,
  width: 1080,
  height: 1350,
  cardCount: 7,
  safeArea: { top: 96, right: 84, bottom: 96, left: 84 },
  typography: { headline: 68, body: 34, fact: 30, caption: 28 },
  spacing: { xs: 12, sm: 20, md: 32, lg: 48, xl: 72 },
  logoArea: { width: 220, height: 72 },
  ctaArea: { minHeight: 128 },
  roleVariants: {
    cover: ["image_full", "image_split"],
    core_experience: ["image_full", "image_split"],
    primary_space: ["image_full", "image_split"],
    differentiators: ["facts_over_image", "facts_panel"],
    location_context: ["location_over_image", "location_panel"],
    essential_facts: ["facts_panel"],
    closing: ["brand_closing"],
  },
  limits: {
    cover: { headline: 58, body: 90 },
    core_experience: { headline: 62, body: 150 },
    primary_space: { headline: 62, body: 150 },
    differentiators: { headline: 52, body: 180 },
    location_context: { headline: 54, body: 160 },
    essential_facts: { headline: 46, body: 210 },
    closing: { headline: 50, body: 120 },
  },
  overflowPolicy: "shorten_then_variant_then_block",
};

export const CAROUSEL_TEMPLATE_REGISTRY = {
  [CAROUSEL_TEMPLATE_KEY]: PROPERTY_EDITORIAL_V1,
} as const;

export function getCarouselTemplate(key: string): CarouselTemplate | null {
  return key === CAROUSEL_TEMPLATE_KEY ? PROPERTY_EDITORIAL_V1 : null;
}

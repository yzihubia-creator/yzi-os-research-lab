export type PropertyDemoAssetKind =
  | "carousel"
  | "drone"
  | "facade"
  | "floorplan"
  | "living"
  | "story"
  | "suite"
  | "thumbnail"
  | "balcony";

export type PropertyDemoAssetAspect = "1:1" | "4:5" | "9:16" | "16:9" | "wide";

export type PropertyDemoAsset = {
  id: string;
  label: string;
  kind: PropertyDemoAssetKind;
  src: string;
  aspect: PropertyDemoAssetAspect;
  simulated: true;
};

// Fonte única dos caminhos de mídia demo: todo imageSrc mockado deve vir
// deste manifesto (imóvel fictício "Cobertura Atlântico — Cabo Branco").
export function propertyDemoAssetSrc(kind: PropertyDemoAssetKind): string {
  const asset = PROPERTY_DEMO_ASSETS.find((item) => item.kind === kind);
  return asset ? asset.src : "";
}

export const PROPERTY_DEMO_ASSETS: PropertyDemoAsset[] = [
  {
    id: "cobertura-atlantico-cabo-branco-carousel",
    label: "Carrossel",
    kind: "carousel",
    src: "/demo/yzi-imob/properties/cobertura-atlantico-cabo-branco/carousel-01.png",
    aspect: "1:1",
    simulated: true,
  },
  {
    id: "cobertura-atlantico-cabo-branco-drone",
    label: "Drone",
    kind: "drone",
    src: "/demo/yzi-imob/properties/cobertura-atlantico-cabo-branco/drone-01.png",
    aspect: "16:9",
    simulated: true,
  },
  {
    id: "cobertura-atlantico-cabo-branco-facade",
    label: "Fachada",
    kind: "facade",
    src: "/demo/yzi-imob/properties/cobertura-atlantico-cabo-branco/facade-01.png",
    aspect: "16:9",
    simulated: true,
  },
  {
    id: "cobertura-atlantico-cabo-branco-floorplan",
    label: "Planta",
    kind: "floorplan",
    src: "/demo/yzi-imob/properties/cobertura-atlantico-cabo-branco/floorplan-01.png",
    aspect: "1:1",
    simulated: true,
  },
  {
    id: "cobertura-atlantico-cabo-branco-living",
    label: "Sala",
    kind: "living",
    src: "/demo/yzi-imob/properties/cobertura-atlantico-cabo-branco/living-01.png",
    aspect: "4:5",
    simulated: true,
  },
  {
    id: "cobertura-atlantico-cabo-branco-story",
    label: "Story",
    kind: "story",
    src: "/demo/yzi-imob/properties/cobertura-atlantico-cabo-branco/story-01.png",
    aspect: "9:16",
    simulated: true,
  },
  {
    id: "cobertura-atlantico-cabo-branco-suite",
    label: "Suíte",
    kind: "suite",
    src: "/demo/yzi-imob/properties/cobertura-atlantico-cabo-branco/suite-01.png",
    aspect: "4:5",
    simulated: true,
  },
  {
    id: "cobertura-atlantico-cabo-branco-thumbnail",
    label: "Thumbnail",
    kind: "thumbnail",
    src: "/demo/yzi-imob/properties/cobertura-atlantico-cabo-branco/thumbnail-01.png",
    aspect: "1:1",
    simulated: true,
  },
  {
    id: "cobertura-atlantico-cabo-branco-balcony",
    label: "Varanda",
    kind: "balcony",
    src: "/demo/yzi-imob/properties/cobertura-atlantico-cabo-branco/balcony-01.png",
    aspect: "4:5",
    simulated: true,
  },
];

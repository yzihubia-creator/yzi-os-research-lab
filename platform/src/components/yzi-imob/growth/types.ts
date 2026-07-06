import type { ReactNode } from "react";

import type { YziImobRole } from "@/components/yzi-imob/yzi-imob-status-colors";

export type GrowthSurface = "briefing" | "conteudo" | "biblioteca" | "campanhas" | "resultados";

export type GrowthStatus =
  | "Gerando"
  | "Em revisão"
  | "Em revisao"
  | "Aprovado"
  | "Falhou"
  | "Em uso"
  | "Arquivado"
  | "Pronto para campanha"
  | "Pendente"
  | "Planejado";

export type GrowthLifecycle = "draft" | "generating" | "review" | "approved" | "active" | "archived" | "failed";
export type GrowthConfidence = "baixa" | "media" | "alta";
export type GrowthRecommendationState = "nova" | "em_analise" | "aceita" | "rejeitada" | "executada";

export type GrowthCounter = {
  label: string;
  value: string;
  detail: string;
};

export type GrowthStatusAccent = Record<string, YziImobRole>;

export type GrowthDetail = {
  label: string;
  value: ReactNode;
};

export type GrowthCreditState = {
  tenantId: string;
  available: number;
  reserved: number;
  consumed: number;
  estimatedCost?: number;
  note: string;
};

export type GrowthProperty = {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  status: GrowthStatus;
  lifecycle: GrowthLifecycle;
  readiness: number;
  palette: [YziImobRole, YziImobRole];
  tags: string[];
  summary: string;
};

export type GrowthAsset = {
  id: string;
  tenantId: string;
  propertyId: string;
  title: string;
  type: "Foto" | "Video" | "Planta" | "Tour 360" | "Documento" | "Marketing Asset";
  channel: string;
  status: GrowthStatus;
  credits: number;
  reuses: number;
  headline: string;
  supportingText: string;
  palette: [YziImobRole, YziImobRole];
};

export type GrowthPackage = {
  id: string;
  tenantId: string;
  propertyId?: string;
  collectionId?: string;
  title: string;
  format: string;
  status: GrowthStatus;
  credits: number;
  assets: string[];
  recommendedUse: string;
};

export type GrowthCampaign = {
  id: string;
  tenantId: string;
  title: string;
  channel: string;
  status: GrowthStatus;
  propertyIds: string[];
  packageIds: string[];
  objective: string;
};

export type GrowthCollection = {
  id: string;
  tenantId: string;
  name: string;
  kind: "Property" | "Collection";
  status: GrowthStatus;
  subtitle: string;
  assets: Array<{ label: string; value: string; role: YziImobRole }>;
  packages: string[];
  marketingAssets: string[];
  campaigns: string[];
  knowledge: Array<{ label: string; value: string }>;
  reusableReason: string;
  campaignOpportunity: string;
  palette: [YziImobRole, YziImobRole];
  items: GrowthCollectionItem[];
};

export type GrowthCollectionItem = {
  id: string;
  title: string;
  type: "Package" | "Marketing Asset";
  property: string;
  channel: string;
  status: GrowthStatus;
  credits: string;
  reuses: string;
  lastCampaign: string;
  headline: string;
  supportingText: string;
  palette: [YziImobRole, YziImobRole];
};

export type GrowthEvidence = {
  id: string;
  tenantId: string;
  title: string;
  detail: string;
  source: string;
  confidence: GrowthConfidence;
};

export type GrowthInsight = {
  id: string;
  tenantId: string;
  title: string;
  summary: string;
  evidenceIds: string[];
  confidence: GrowthConfidence;
};

export type GrowthRecommendation = {
  id: string;
  tenantId: string;
  title: string;
  rationale: string;
  nextAction: string;
  state: GrowthRecommendationState;
  confidence: GrowthConfidence;
  evidenceIds: string[];
};

export type GrowthAction = {
  id: string;
  label: string;
  tone?: "primary" | "neutral" | "danger";
  disabled?: boolean;
  onClick?: () => void;
};

// Contrato Brain ↔ Surface Briefing (Growth Intelligence Surface).
// A Surface consome apenas estas leituras; nenhum componente calcula estratégia.
// Fontes: docs/yzi-imob/growth-os/growth-intelligence-briefing-v1-*.md e
// growth-intelligence-engine-v1-*.md. Tudo mockado, sem Runtime, sem APIs.

export type BriefingConfidence = "baixa" | "media" | "alta";

// Caminhos de decisão do roteamento (doc voz-decisoes §8).
export type BriefingRoute = "conteudo" | "experimento" | "campanha" | "adiar";

export type BriefingEvidence = {
  id: string;
  tenantId: string;
  simulated: true;
  fact: string;
  source: string;
  period: string;
};

// Os 7 blocos do Recommendation Composer na voz da YZI.
export type BriefingRecommendation = {
  observei: string;
  interpretei: string;
  impactoEsperado: string;
  recomendo: string;
  porQue: string;
  confianca: BriefingConfidence;
  confiancaBase: string;
  proximaAcao: string;
};

export type BriefingItemKind = "oportunidade" | "atencao";

export type BriefingItem = {
  id: string;
  tenantId: string;
  simulated: true;
  kind: BriefingItemKind;
  title: string;
  impact: string;
  confidence: BriefingConfidence;
  nextAction: string;
  evidenceIds: string[];
  recommendation: BriefingRecommendation;
  // Caminhos permitidos pelo roteamento. Alerta fora do growth bloqueia campanha;
  // confiança baixa nunca autoriza gasto (só experimento).
  allowedRoutes: BriefingRoute[];
  routeNote?: string;
};

// Narrativa de abertura em 4 movimentos (doc experiencia §5).
export type BriefingGreeting = {
  saudacao: string;
  oQueAconteceu: string;
  oQueEncontrei: string[];
  porOndeComecaria: string;
};

export type BriefingPanoramaCard = {
  id: string;
  label: string;
  value: string;
  reading: string;
};

export type BriefingLearning = {
  id: string;
  title: string;
  detail: string;
};

export type BriefingPendingDecision = {
  id: string;
  label: string;
  status: string;
};

// Mock Brain — contrato Brain ↔ Surface Briefing.
// 4 leituras (briefing, itens, panorama, aprendizados) + 1 escrita (decisão).
// Determinístico: mesmas chamadas, mesmas respostas. Nada aqui executa efeito
// real — a "escrita" apenas devolve o estado honesto que a Surface exibe.

import {
  MOCK_BRIEFING_EVIDENCE,
  MOCK_BRIEFING_GREETING,
  MOCK_BRIEFING_ITEMS,
  MOCK_BRIEFING_LEARNINGS,
  MOCK_BRIEFING_PANORAMA,
  MOCK_BRIEFING_PENDING,
} from "./mock-briefing-data";
import type { BriefingEvidence, BriefingItem, BriefingRoute } from "./types";

export const SIMULATION_LABEL = "Dados de demonstração";
export const SIMULATION_NOTE = "Exemplo — estou trabalhando com dados de demonstração.";

export function getBriefingGreeting() {
  return MOCK_BRIEFING_GREETING;
}

export function getAttentionItems(): BriefingItem[] {
  return MOCK_BRIEFING_ITEMS.filter((item) => item.kind === "atencao");
}

export function getOpportunities(): BriefingItem[] {
  return MOCK_BRIEFING_ITEMS.filter((item) => item.kind === "oportunidade");
}

export function getPanorama() {
  return MOCK_BRIEFING_PANORAMA;
}

export function getLearnings() {
  return MOCK_BRIEFING_LEARNINGS;
}

export function getPendingDecisions() {
  return MOCK_BRIEFING_PENDING;
}

export function getEvidenceByIds(ids: string[]): BriefingEvidence[] {
  return MOCK_BRIEFING_EVIDENCE.filter((evidence) => ids.includes(evidence.id));
}

// Rótulos executivos dos caminhos de decisão (linguagem da Surface).
export const ROUTE_LABELS: Record<BriefingRoute, string> = {
  conteudo: "Produzir conteúdo",
  experimento: "Criar experimento",
  campanha: "Preparar campanha",
  adiar: "Agora não",
};

// Estado honesto devolvido após uma decisão mockada. Nenhum caminho executa,
// publica ou gasta — aprovar apenas encaminha, conforme governança congelada.
export function routeDecision(route: BriefingRoute): string {
  switch (route) {
    case "conteudo":
      return "Combinado. Preparei o pacote e mandei para Conteúdo como pendente — nada vai ao ar sem a sua revisão. (Simulação: nenhuma peça foi gerada.)";
    case "campanha":
      return "Combinado. A campanha nasceu em rascunho em Campanhas — orçamento e ativação continuam com você. (Simulação: nada foi criado em canal real.)";
    case "experimento":
      return "Combinado. Registrei o experimento — o resultado me ensina o que funciona para a sua carteira. (Simulação: nenhum teste real foi iniciado.)";
    case "adiar":
      return "Sem problema, deixo em espera. A recomendação continua válida por enquanto — volto a falar dela se algo mudar.";
  }
}

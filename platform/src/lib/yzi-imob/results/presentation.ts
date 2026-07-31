import type { ResultsMetricValue } from "@/lib/yzi-imob/results/types";

// Camada de apresentação dos indicadores de Resultados.
//
// O repositório rotula e descreve as métricas em vocabulário de banco —
// "Assignments", "Mensagens inbound", "Status failed no período.",
// "delivery_status delivered ou read.", "Pending com due_at vencido.". Correto
// para quem mantém o sistema; ilegível para quem opera a imobiliária.
//
// A tradução acontece aqui, na fronteira de leitura. O contrato de dados não
// muda: `id` continua sendo a chave, só o texto exibido é substituído.

type MetricCopy = { label: string; detail: string };

export const RESULTS_METRIC_COPY: Record<string, MetricCopy> = {
  // Panorama
  "active-properties": {
    label: "Imóveis ativos",
    detail: "No catálogo agora, prontos para receber contato.",
  },
  "incomplete-properties": {
    label: "Imóveis incompletos",
    detail: "Falta informação essencial ou foto para publicar bem.",
  },
  "published-properties": {
    label: "Publicações concluídas",
    detail: "Conteúdos que foram ao ar no período.",
  },
  "pending-publications": {
    label: "Publicações programadas",
    detail: "Com data marcada e ainda não publicadas.",
  },
  "failed-publications": {
    label: "Publicações que não saíram",
    detail: "Tentaram publicar e não concluíram.",
  },
  "period-leads": {
    label: "Leads no período",
    detail: "Pessoas novas que entraram em contato.",
  },
  "period-interests": {
    label: "Interesses em imóveis",
    detail: "Registros de interesse por um imóvel específico.",
  },
  "period-conversations": {
    label: "Conversas iniciadas",
    detail: "Atendimentos que começaram no período.",
  },
  "period-visits": {
    label: "Visitas",
    detail: "Visitas marcadas para o período.",
  },
  "period-feedback": {
    label: "Retornos de visita",
    detail: "Visitas em que alguém registrou o resultado.",
  },
  "period-assignments": {
    label: "Leads encaminhados",
    detail: "Leads entregues a um corretor responsável.",
  },
  "period-followups": {
    label: "Próximos passos combinados",
    detail: "Retornos com data marcada no período.",
  },

  // Atendimento
  "inbound-messages": {
    label: "Mensagens recebidas",
    detail: "Clientes que escreveram para a operação.",
  },
  "outbound-messages": {
    label: "Mensagens enviadas",
    detail: "Respostas que a operação mandou.",
  },
  "delivered-messages": {
    label: "Mensagens entregues",
    detail: "Chegaram ao aparelho do cliente.",
  },
  "read-messages": {
    label: "Mensagens lidas",
    detail: "O cliente abriu a mensagem.",
  },
  "failed-messages": {
    label: "Mensagens que não chegaram",
    detail: "O envio falhou e o cliente não recebeu.",
  },
  "open-conversations": {
    label: "Conversas em aberto",
    detail: "Ainda não foram encerradas pela equipe.",
  },

  // Comercial
  "assigned-leads": {
    label: "Leads com corretor",
    detail: "Já têm alguém responsável pelo atendimento.",
  },
  "accepted-assignments": {
    label: "Aceitos pelo corretor",
    detail: "O corretor assumiu o atendimento.",
  },
  "declined-assignments": {
    label: "Recusados pelo corretor",
    detail: "Voltaram para redistribuição.",
  },
  "pending-assignments": {
    label: "Aguardando aceite",
    detail: "Encaminhados e ainda sem dono confirmado.",
  },
  "scheduled-visits": {
    label: "Visitas agendadas",
    detail: "Marcadas e ainda não realizadas.",
  },
  "completed-visits": {
    label: "Visitas realizadas",
    detail: "Aconteceram no período.",
  },
  "cancelled-visits": {
    label: "Visitas canceladas",
    detail: "Foram desmarcadas antes de acontecer.",
  },
  "visits-without-feedback": {
    label: "Visitas sem retorno",
    detail: "Aconteceram e ninguém registrou o resultado.",
  },
  "post-visit-interest": {
    label: "Interesse após a visita",
    detail: "Visitas que terminaram com sinal positivo.",
  },
  "next-actions": {
    label: "Próximos passos definidos",
    detail: "Visitas que saíram com um combinado claro.",
  },

  // Conteúdo
  "approved-revisions": {
    label: "Peças aprovadas",
    detail: "Prontas para receber data e canal.",
  },
  "scheduled-content": {
    label: "Peças programadas",
    detail: "Com data marcada para ir ao ar.",
  },
  "published-content": {
    label: "Peças publicadas",
    detail: "Já estão no ar.",
  },
  "failed-content": {
    label: "Peças que não saíram",
    detail: "Tentaram publicar e não concluíram.",
  },

  // Onde travou
  "bottleneck-overdue-followups": {
    label: "Retornos atrasados",
    detail: "Passaram da data combinada com o cliente.",
  },
  "bottleneck-pending-assignments": {
    label: "Leads sem dono confirmado",
    detail: "Foram encaminhados e ninguém assumiu.",
  },
  "bottleneck-visits-feedback": {
    label: "Visitas sem retorno",
    detail: "Aconteceram e o resultado não foi registrado.",
  },
  "bottleneck-message-failures": {
    label: "Mensagens que não chegaram",
    detail: "O cliente não recebeu o retorno.",
  },
  "bottleneck-publication-failures": {
    label: "Publicações que não saíram",
    detail: "Não chegaram a ir ao ar.",
  },
};

export const RESULTS_RATE_COPY: Record<string, string> = {
  "assignment-acceptance": "Leads aceitos pelo corretor",
  "visit-feedback": "Visitas com retorno registrado",
};

/**
 * Rede de segurança: métrica sem tradução não empurra o texto do contrato para
 * a tela. O rótulo do contrato é curto e costuma ser aceitável; a descrição é
 * que carrega vocabulário de banco, então ela simplesmente não aparece.
 */
export function describeMetric(metric: ResultsMetricValue): MetricCopy {
  return RESULTS_METRIC_COPY[metric.id] ?? { label: metric.label, detail: "" };
}

export function describeRate(id: string, fallback: string): string {
  return RESULTS_RATE_COPY[id] ?? fallback;
}

/**
 * Separa o que aconteceu do que não aconteceu.
 *
 * Uma operação nova produz dezenas de indicadores em zero. Listar todos com o
 * mesmo peso vira parede de zeros: o gestor não consegue achar o número que
 * importa. Zero continua sendo verdade e continua visível — só deixa de ocupar
 * o mesmo espaço de um número que se moveu.
 *
 * `null` (leitura indisponível) NUNCA é agrupado com zero: não saber é
 * diferente de não ter acontecido.
 */
export function splitByMovement(metrics: readonly ResultsMetricValue[]): {
  moved: ResultsMetricValue[];
  idle: ResultsMetricValue[];
  unavailable: ResultsMetricValue[];
} {
  const moved: ResultsMetricValue[] = [];
  const idle: ResultsMetricValue[] = [];
  const unavailable: ResultsMetricValue[] = [];

  for (const metric of metrics) {
    if (metric.value === null || metric.availability !== "available") {
      unavailable.push(metric);
    } else if (metric.value === 0) {
      idle.push(metric);
    } else {
      moved.push(metric);
    }
  }

  return { moved, idle, unavailable };
}

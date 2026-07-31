import type {
  RadarSignal,
  RadarSignalCategory,
  RadarSignalType,
} from "@/lib/yzi-imob/radar/types";

// Camada de apresentação dos sinais do Radar.
//
// O repositório produz título e descrição em vocabulário de engenharia —
// "Runner sem execução recente", "Metricool aguardando configuração",
// "A conexão registra estado not_configured", "Lead quente sem assignment",
// "delivery_status failed", "Job processing sem atualização". Esse texto é
// correto para quem mantém o sistema e ilegível para quem opera a imobiliária.
//
// O contrato de dados não muda: a tradução acontece aqui, na fronteira de
// leitura, e é a MESMA usada por Radar e por Sistema — as duas telas não podem
// descrever a mesma pendência com palavras diferentes.

type SignalCopy = {
  /** O que aconteceu, na língua de quem opera. */
  title: string;
  /** Por que isso importa para a operação. */
  why: string;
  /**
   * Alguns sinais carregam o nome do imóvel dentro da descrição do contrato.
   * Nesses casos a descrição original é preservada — ela é específica e não
   * carrega vocabulário interno; `why` entra como leitura complementar.
   */
  keepContractDescription?: true;
};

export const RADAR_SIGNAL_COPY: Record<RadarSignalType, SignalCopy> = {
  property_incomplete: {
    title: "Imóvel com informações faltando",
    why: "Anúncio incompleto rende menos contato e trava a publicação.",
    keepContractDescription: true,
  },
  property_media_insufficient: {
    title: "Imóvel com poucas fotos",
    why: "Abaixo do mínimo para publicar com qualidade.",
    keepContractDescription: true,
  },
  publication_waiting_approval: {
    title: "Peça aguardando sua aprovação",
    why: "Enquanto espera, o imóvel não ganha alcance novo.",
  },
  publication_failed: {
    title: "Publicação não chegou a sair",
    why: "Nada foi publicado. O conteúdo segue aprovado e pode ser programado de novo.",
  },
  property_publication_inconsistent: {
    title: "Publicação com registro incompleto",
    why: "A publicação consta como concluída, mas sem a data em que foi ao ar.",
  },
  hot_lead_without_assignment: {
    title: "Lead quente sem corretor responsável",
    why: "Lead quente sem dono esfria rápido: ninguém está encarregado do retorno.",
  },
  assignment_waiting_acceptance: {
    title: "Lead encaminhado e ainda não aceito",
    why: "O corretor ainda não assumiu o atendimento deste lead.",
  },
  lead_without_next_action: {
    title: "Lead sem próximo passo definido",
    why: "Ninguém combinou o que fazer em seguida, então o lead tende a parar aqui.",
  },
  follow_up_overdue: {
    title: "Retorno combinado passou do prazo",
    why: "O cliente esperava contato e ele não aconteceu.",
  },
  conversation_waiting_response: {
    title: "Conversa esperando resposta",
    why: "Cliente sem resposta há horas costuma procurar outra imobiliária.",
  },
  visit_unconfirmed: {
    title: "Visita próxima sem confirmação",
    why: "Visita não confirmada costuma virar horário vazio na agenda do corretor.",
  },
  visit_without_feedback: {
    title: "Visita aconteceu e ninguém registrou o resultado",
    why: "Sem o retorno, o lead fica sem próxima ação e o imóvel sem leitura de interesse.",
  },
  cancelled_visit_follow_up_pending: {
    title: "Visita cancelada com retorno pendente",
    why: "A visita caiu, mas o combinado com o cliente continua em aberto.",
  },
  feedback_next_action_overdue: {
    title: "Próximo passo pós-visita venceu",
    why: "O que foi combinado depois da visita passou da data.",
  },
  outbound_failed: {
    title: "Mensagem não chegou ao cliente",
    why: "O envio falhou e o cliente não recebeu o retorno.",
  },
  message_status_stale: {
    title: "Mensagem sem confirmação de entrega",
    why: "Não sabemos se o cliente recebeu. Vale confirmar por outro caminho.",
  },
  inbound_operation_failed: {
    title: "Atendimento automático falhou",
    why: "Uma mensagem recebida não foi processada até o fim.",
  },
  runner_stale: {
    title: "Atendimento automático sem atividade recente",
    why: "As rotinas que respondem sozinhas não rodaram no período esperado.",
  },
  recoverable_operation: {
    title: "Falha que o sistema pode recuperar sozinho",
    why: "Já está na fila de recuperação automática. Nenhuma ação sua é necessária agora.",
  },
  whatsapp_attention_required: {
    title: "Canal de mensagens precisa de atenção",
    why: "Enquanto isso, mensagens podem não sair nem chegar.",
  },
  metricool_configuration_required: {
    title: "Publicação em redes aguardando liberação",
    why: "Suas peças continuam sendo produzidas e aprovadas; só a publicação automática está parada.",
  },
  metricool_token_invalid: {
    title: "Canal de publicação precisa ser reconectado",
    why: "A autorização deixou de valer e nada é publicado até religar.",
  },
  metricool_rate_limited: {
    title: "Canal recusou publicações por excesso no período",
    why: "Programar para outro horário costuma resolver.",
  },
  social_sync_stale: {
    title: "Desempenho das publicações desatualizado",
    why: "Os números de alcance podem estar atrasados em relação ao que já saiu.",
  },
  social_publication_stalled: {
    title: "Publicação parada no meio do envio",
    why: "Começou a sair e não concluiu. Ainda não está no ar.",
  },
  job_stalled: {
    title: "Rotina automática travada",
    why: "Uma tarefa que roda sozinha começou e não terminou.",
  },
  recovery_limit_reached: {
    title: "Falha que o sistema não conseguiu recuperar",
    why: "As tentativas automáticas acabaram. Agora precisa de alguém olhando.",
  },
  attempts_exhausted: {
    title: "Tarefa desistiu após várias tentativas",
    why: "O limite de tentativas foi atingido e ela não será repetida sozinha.",
  },
};

/**
 * Rede de segurança: se o contrato ganhar um tipo novo antes de a tradução
 * existir, o texto do repositório NÃO vai para a tela. O gestor lê uma frase
 * honesta e genérica em vez de vocabulário interno.
 */
const FALLBACK_COPY: SignalCopy = {
  title: "Item precisa de revisão",
  why: "A operação registrou algo fora do combinado nesta área.",
};

export type DescribedSignal = {
  title: string;
  description: string;
};

export function describeSignal(signal: RadarSignal): DescribedSignal {
  const copy = RADAR_SIGNAL_COPY[signal.type] ?? FALLBACK_COPY;

  return {
    title: copy.title,
    description: copy.keepContractDescription
      ? `${signal.description} ${copy.why}`
      : copy.why,
  };
}

/**
 * Áreas da operação, compartilhadas por Radar e Sistema. Enquanto cada tela
 * agrupava do seu jeito, as duas conseguiam discordar sobre a mesma pendência.
 */
export type OperationalArea = "imoveis" | "comercial" | "atendimento" | "canais" | "rotinas";

export const AREA_BY_CATEGORY: Record<RadarSignalCategory, OperationalArea> = {
  ativo: "imoveis",
  lead: "comercial",
  visita: "comercial",
  atendimento: "atendimento",
  conexao: "canais",
  sistema: "rotinas",
};

export const AREA_COPY: Record<
  OperationalArea,
  { label: string; description: string; affected: string; href: string }
> = {
  imoveis: {
    label: "Imóveis e publicação",
    description: "Cadastro, fotos, aprovação e envio das páginas de imóvel.",
    affected: "Imóveis · Marketing",
    href: "/cockpit/yzi-imob/imoveis",
  },
  comercial: {
    label: "Leads e visitas",
    description: "Distribuição de leads, próximos passos, agenda e retorno de visita.",
    affected: "Leads · Agenda · Corretores",
    href: "/cockpit/yzi-imob/clientes",
  },
  atendimento: {
    label: "Atendimento",
    description: "Recebimento e envio de mensagens da operação.",
    affected: "Atendimento",
    href: "/cockpit/yzi-imob/atendimento",
  },
  canais: {
    label: "Canais conectados",
    description: "Autorização e saúde dos canais usados para atender e publicar.",
    affected: "Conexões · Marketing",
    href: "/cockpit/yzi-imob/conexoes",
  },
  rotinas: {
    label: "Rotinas automáticas",
    description: "Tarefas que a operação executa sozinha em segundo plano.",
    affected: "Marketing · Atendimento",
    href: "/cockpit/yzi-imob/sistema",
  },
};

/**
 * Sinais que descrevem uma capacidade AINDA NÃO liberada — não algo que
 * quebrou. Conexões, Sistema e Radar precisam concordar nisso: dizer "parou de
 * funcionar" sobre uma verificação que nunca terminou é mentir para o gestor.
 */
const AWAITING_RELEASE: ReadonlySet<RadarSignalType> = new Set([
  "metricool_configuration_required",
]);

export function isAwaitingRelease(signal: RadarSignal): boolean {
  return AWAITING_RELEASE.has(signal.type);
}

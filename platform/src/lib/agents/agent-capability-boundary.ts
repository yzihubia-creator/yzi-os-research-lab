// Agent Capability Boundary Layer (Lane 11).
// Módulo PURO, declarativo e read-only: nenhuma query, nenhum schema, nenhuma
// policy, nenhum service role, nenhuma escrita, nenhuma env e NENHUM runtime
// agentic. Não cria agente, runner, MCP, tool ou memória; apenas texto.
//
// Decisão de produto (Lane 11): antes de qualquer agente operar, o cockpit
// expõe HONESTAMENTE o LIMITE de cada capacidade planejada (Lane 10). Continua
// JOB-ANCHORED — lidera pelo resultado/capacidade, nunca por nomes de agentes.
// Para cada capacidade planejada, declara: finalidade, status, o que PODERÁ
// fazer no futuro, o que ainda NÃO pode fazer, dependências futuras e a
// ausência de execução. Não promete, não aciona e não simula nada ativo.
//
// Verdade de produto nesta fase: nenhuma capacidade está ativa, nada executa,
// nenhum agente roda, não há MCP/runner/tool/memória, não há schema/tabela de
// agents e não há policy de escrita. O limite é a verdade exibida — antes de
// existir capacidade real, existe a fronteira honesta dela.

/** Fronteira honesta de UMA capacidade planejada (job-anchored). */
export type CapabilityBoundary = {
  /** Nome da capacidade pelo RESULTADO/job — nunca um nome de agente. */
  capability: string;
  /** Finalidade honesta: o resultado operacional que a capacidade entregará. */
  purpose: string;
  /** O que a capacidade PODERÁ fazer no futuro — declarativo, não acionável. */
  futureAbility: string;
  /** O que a capacidade ainda NÃO pode fazer hoje — honesto, sem ação falsa. */
  notYet: string;
  /** Dependência futura que precisa fechar antes de a capacidade existir. */
  dependency: string;
};

/** Configuração read-only da camada de fronteira de capacidades planejadas. */
export type AgentCapabilityBoundaryConfig = {
  /** Título da seção. */
  title: string;
  /** Uma linha honesta: limite antes de capacidade; nada está ativo. */
  intro: string;
  /** Rótulo de status uniforme exibido em cada capacidade. */
  status: string;
  /** A fronteira por capacidade (job-anchored, alinhada à Lane 10). */
  capabilities: readonly CapabilityBoundary[];
  /** Afirmação de ausência de execução — vale para TODAS as capacidades. */
  noExecution: readonly string[];
};

/**
 * Retorna a configuração declarativa da fronteira de capacidades planejadas.
 * Função PURA: não recebe dados, não consulta nada, não depende de tenant/role —
 * o conteúdo é estático e honesto, porque NADA está ativo. O status uniforme
 * "Planejado — limite definido, sem execução" é a verdade de cada capacidade.
 */
export function getAgentCapabilityBoundary(): AgentCapabilityBoundaryConfig {
  return {
    title: "Limites das capacidades planejadas",
    intro:
      "Antes de qualquer capacidade operar, este é o limite honesto de cada uma: o que poderá fazer, o que ainda não pode e do que depende. Nenhuma está ativa e nenhuma executa nada.",
    status: "Planejado — limite definido, sem execução",
    capabilities: [
      {
        capability: "Qualificação de oportunidades",
        purpose:
          "Separar e priorizar as oportunidades de crescimento que valem trabalho.",
        futureAbility:
          "Poderá, no futuro, propor uma priorização das oportunidades a partir de dados já visíveis na operação.",
        notYet:
          "Ainda não lê dados de oportunidade, não pontua e não decide nada — não há fonte conectada nem execução.",
        dependency:
          "Depende de uma fonte de dados operacional governada e da camada de execução controlada (lanes futuras).",
      },
      {
        capability: "Radar de oportunidades",
        purpose:
          "Detectar sinais de crescimento onde eles hoje vazam — visitas, leads, conversas.",
        futureAbility:
          "Poderá, no futuro, sinalizar onde há crescimento vazando, a partir de sinais que a operação já capture.",
        notYet:
          "Ainda não observa nenhuma fonte, não capta sinais e não emite alerta — não há integração nem tool.",
        dependency:
          "Depende de integrações de sinal governadas (tools) e da fronteira de tools/memória (lane futura).",
      },
      {
        capability: "Follow-up operacional",
        purpose:
          "Trabalhar o follow-up das oportunidades ao longo do funil, sem deixar ninguém esfriar.",
        futureAbility:
          "Poderá, no futuro, organizar e lembrar o follow-up devido, sob a fronteira do papel do operador.",
        notYet:
          "Ainda não envia mensagem, não agenda e não toca nenhum canal externo — não há runner nem envio.",
        dependency:
          "Depende de canais governados, de aprovação por papel e da operação controlada (lanes futuras).",
      },
      {
        capability: "Nutrição e reativação",
        purpose:
          "Nutrir e reativar oportunidades para recuperar receita que iria vazar.",
        futureAbility:
          "Poderá, no futuro, sugerir nutrição e reativação para oportunidades esfriando, sempre sob revisão.",
        notYet:
          "Ainda não dispara nutrição, não reativa ninguém e não escreve em lugar nenhum — sem execução.",
        dependency:
          "Depende de memória operacional governada e de canais aprovados por papel (lanes futuras).",
      },
      {
        capability: "Memória operacional futura",
        purpose:
          "Acumular o contexto do negócio para a operação ficar cada vez mais inteligente.",
        futureAbility:
          "Poderá, no futuro, reter contexto operacional governado para qualificar as demais capacidades.",
        notYet:
          "Ainda não armazena nada, não lê histórico e não persiste contexto — não há memória criada.",
        dependency:
          "Depende da fronteira de tools/memória e de uma camada de persistência governada (lanes futuras).",
      },
      {
        capability: "Supervisão executiva",
        purpose:
          "Dar visão executiva de onde o crescimento está vazando e quanto está sendo recuperado.",
        futureAbility:
          "Poderá, no futuro, consolidar uma leitura executiva a partir do que as demais capacidades produzirem.",
        notYet:
          "Ainda não consolida indicador, não calcula recuperação e não reporta nada — não há dado a supervisionar.",
        dependency:
          "Depende de as capacidades anteriores existirem e de uma leitura operacional governada (lanes futuras).",
      },
    ],
    noExecution: [
      "Nenhuma capacidade está ativa e nenhuma executa nada automaticamente.",
      "Nenhum agente roda por baixo destes limites.",
      "Sem MCP, sem runner, sem tools, sem memória operacional.",
      "Nenhum dado é lido, escrito ou decidido a partir desta seção — é somente leitura.",
    ],
  };
}

// Agent Definition / Read-only Configuration Layer (Lane 10).
// Módulo PURO, declarativo e read-only: nenhuma query, nenhum schema, nenhuma
// policy, nenhum service role, nenhuma escrita, nenhuma env e NENHUM runtime
// agentic. Não cria agente, runner, MCP, tool ou memória; apenas texto.
//
// Decisão de produto (Lane 10): a definição é JOB-ANCHORED — lidera pelo
// RESULTADO/capacidade, não por nomes de agentes. Os agentes são o motor por
// baixo da operação, nunca a superfície; por isso NENHUM nome de agente é
// apresentado aqui como se já existisse institucionalmente. Fonte das
// capacidades: Growth OS (`docs/specs/product/yzi-os-operating-model-v1.md` e
// `yzi-os-product-architecture-plan-v1.md`). Honra a regra de posicionamento
// "Lead with the operator, not the OS. Sell the outcome, not the architecture."
//
// Verdade de produto nesta fase: nenhuma capacidade está ativa, nada executa
// automaticamente, nenhum agente roda, não há MCP/runner/tool/memória, não há
// schema/tabela de agents e não há policy de escrita. Cada capacidade é
// PLANEJADA e depende de lanes futuras.

/** Uma capacidade planejada, em linguagem de produto (job/resultado). */
export type PlannedCapability = {
  /** Nome da capacidade pelo RESULTADO/job — nunca um nome de agente. */
  capability: string;
  /** Finalidade honesta: o resultado operacional que a capacidade entregará. */
  purpose: string;
};

/** Configuração read-only da camada de definição de capacidades planejadas. */
export type AgentDefinitionConfig = {
  /** Título da seção, em linguagem de operação de crescimento. */
  title: string;
  /** Uma linha honesta: lidera pelo resultado; nada está ativo. */
  intro: string;
  /** Rótulo de status uniforme exibido em cada capacidade. */
  status: string;
  /** As capacidades planejadas (job-anchored). */
  capabilities: readonly PlannedCapability[];
  /** Limites honestos que valem para TODAS as capacidades nesta fase. */
  limits: readonly string[];
  /** Dependência honesta: tudo abaixo depende de lanes futuras. */
  dependency: string;
};

/**
 * Retorna a configuração declarativa das capacidades planejadas. Função PURA:
 * não recebe dados, não consulta nada, não depende de tenant/role — o conteúdo
 * é estático e honesto, porque NADA está ativo. O status uniforme
 * "Planejado — não ativo" é a verdade de cada capacidade nesta fase.
 */
export function getAgentDefinitionConfig(): AgentDefinitionConfig {
  return {
    title: "Operação de crescimento — capacidades planejadas",
    intro:
      "Estas são as capacidades que a operação vai habilitar — descritas pelo resultado que entregam, não por agentes. Nenhuma está ativa; cada uma depende de lanes futuras.",
    status: "Planejado — não ativo",
    capabilities: [
      {
        capability: "Qualificação de oportunidades",
        purpose:
          "Separar e priorizar as oportunidades de crescimento que valem trabalho.",
      },
      {
        capability: "Radar de oportunidades",
        purpose:
          "Detectar sinais de crescimento onde eles hoje vazam — visitas, leads, conversas.",
      },
      {
        capability: "Follow-up operacional",
        purpose:
          "Trabalhar o follow-up das oportunidades ao longo do funil, sem deixar ninguém esfriar.",
      },
      {
        capability: "Nutrição e reativação",
        purpose:
          "Nutrir e reativar oportunidades para recuperar receita que iria vazar.",
      },
      {
        capability: "Memória operacional futura",
        purpose:
          "Acumular o contexto do negócio para a operação ficar cada vez mais inteligente.",
      },
      {
        capability: "Supervisão executiva",
        purpose:
          "Dar visão executiva de onde o crescimento está vazando e quanto está sendo recuperado.",
      },
    ],
    limits: [
      "Não está ativa e não executa nada automaticamente.",
      "Nenhum agente está rodando por baixo dela.",
      "Sem MCP, sem runner, sem tools, sem memória operacional.",
      "Não decide, não escreve dados e não toca o tenant.",
    ],
    dependency:
      "Cada capacidade depende de lanes futuras — definição operacional, governança e execução virão com seus próprios gates.",
  };
}

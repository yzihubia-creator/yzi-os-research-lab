// Agent Registry Shell (Lane 9 — Agent Registry Shell / Agent Existence Layer).
// Módulo PURO, declarativo e read-only: nenhuma query, nenhum schema, nenhuma
// policy, nenhum service role, nenhuma escrita, nenhuma env e NENHUM runtime
// agentic. Descreve HONESTAMENTE a área de registro de agentes do cockpit no
// seu estado inaugural: NENHUM agente existe, NENHUM agente executa, e nada
// aqui aciona runner, MCP, tool ou memória. Apenas texto declarativo.
//
// Verdade de produto nesta fase: não há tabela de agents, não há registry real,
// não há runner, não há MCP, não há tools, não há memória operacional. O
// "registro" é uma SUPERFÍCIE DE EXISTÊNCIA vazia e governada — mostra que a
// área existe e está vazia, e o que será habilitado no futuro, sem prometer,
// sem acionar e sem simular nenhuma capacidade ativa. Não há botão, não há
// ação: o operador apenas LÊ que ainda não há agentes.

/** Uma capacidade futura — declarativa, descreve o que SERÁ, não o que é. */
export type AgentRegistryCapability = {
  /** Nome curto da capacidade futura. */
  title: string;
  /** Uma linha honesta sobre o que será habilitado — não sobre o que já existe. */
  description: string;
};

/** Conteúdo declarativo da superfície de existência de agentes no cockpit. */
export type AgentRegistryShell = {
  /** Rótulo da área no cockpit. */
  title: string;
  /** Subtítulo: o que esta área é nesta fase (vazia e governada). */
  subtitle: string;
  /** Estado vazio honesto: manchete + corpo, sem simular nenhum agente. */
  emptyState: { headline: string; body: string };
  /** Fronteira de execução honesta: o que esta área NÃO faz hoje. */
  boundary: readonly string[];
  /** Capacidades que serão habilitadas no futuro — declarativas, não acionáveis. */
  futureCapabilities: readonly AgentRegistryCapability[];
};

/**
 * Retorna o conteúdo declarativo do Agent Registry Shell. Função PURA: não
 * recebe dados de banco, não consulta nada, não depende de tenant/role — porque
 * NÃO HÁ agentes a listar. O vazio é a verdade, e é exibido de forma honesta.
 */
export function getAgentRegistryShell(): AgentRegistryShell {
  return {
    title: "Registro de agentes",
    subtitle:
      "A área onde os agentes institucionais desta operação vão existir. Hoje ela está vazia e não executa nada.",
    emptyState: {
      headline: "Nenhum agente ativo",
      body:
        "Nenhum agente foi criado nesta operação e nenhum agente está em execução. Esta área não simula agentes nem oferece ação para ativá-los: ela apenas mostra, de forma honesta, que ainda não há nenhum.",
    },
    boundary: [
      "Nenhum agente executa a partir daqui — não há runner.",
      "Nenhuma ferramenta (tool) está conectada.",
      "Nenhuma memória operacional foi criada.",
      "Nenhum MCP está conectado.",
      "Esta área é somente leitura: não há ação que crie ou ative agentes.",
    ],
    futureCapabilities: [
      {
        title: "Registrar agentes",
        description:
          "Declarar os agentes institucionais desta operação — quando o registro real existir.",
      },
      {
        title: "Ferramentas e memória",
        description:
          "Associar ferramentas e memória operacional a cada agente — ainda não habilitado.",
      },
      {
        title: "Execução governada",
        description:
          "Executar agentes sob governança e sob a fronteira do seu papel — ainda não habilitado.",
      },
    ],
  };
}

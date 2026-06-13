// Tool / Memory Boundary Layer (Lane 12).
// Módulo PURO, declarativo e read-only: nenhuma query, nenhum schema, nenhuma
// policy, nenhum service role, nenhuma escrita, nenhuma env e NENHUM runtime
// agentic. Não cria tool, MCP, runner, agente, vector store, embedding,
// memória operacional nem tabela de memória; apenas texto.
//
// Decisão de produto (Lane 12): antes de qualquer ferramenta conectar ou
// qualquer memória ativar, o cockpit expõe HONESTAMENTE o LIMITE futuro de
// tools e memória das capacidades planejadas (Lanes 10/11). Continua
// JOB-ANCHORED — lidera pelo resultado, nunca por nomes de agentes ou de tools.
//
// A memória do YZI OS NÃO é chat history nem RAG genérico. Este módulo PRESERVA
// a arquitetura de memória já definida na base do projeto (docs/specs/memory/):
//   - Raw Event Memory          — registro bruto de eventos (não consolida).
//   - Reflective Memory         — consolida experiência em tópicos/decisões.
//   - Retrieval Evidence Layer  — proveniência/evidência antes do uso (não é retriever).
//   - Memory Governance         — decide lembrar/atualizar/esquecer/bloquear/citar/usar.
//   - Context / Evidence Trace  — trilha que liga decisão à origem.
//   - RAG / Semantic Knowledge  — SEPARADO de memória operacional; não se mistura.
// Aqui a memória é tratada como BOUNDARY/GOVERNANÇA read-only, jamais como
// implementação operacional.
//
// Verdade de produto nesta fase: nenhuma tool conectada, nenhuma memória
// operacional ativa, nenhum vector store, nenhum embedding, nenhum agente
// lê/escreve memória, nada é salvo automaticamente, nenhuma execução agentic.
// O limite é a verdade exibida — antes de existir tool/memória real, existe a
// fronteira honesta delas.

/** Fronteira honesta de UMA camada de memória (arquitetura preservada). */
export type MemoryLayerBoundary = {
  /** Nome da camada conforme a arquitetura de memória já definida na base. */
  layer: string;
  /** Finalidade honesta da camada — o que ela organizará/controlará no futuro. */
  purpose: string;
  /** Restrição honesta: o que a camada NÃO faz hoje (e o que ela não é). */
  restriction: string;
  /** Selo de status honesto da camada (planejada / não ativa). */
  status: string;
};

/** Configuração read-only da fronteira de ferramentas e memória planejadas. */
export type ToolMemoryBoundaryConfig = {
  /** Título da seção no cockpit. */
  title: string;
  /** Uma linha honesta: limite antes de tool/memória; nada está ativo. */
  intro: string;
  /** Bloco de ferramentas (tools) futuras — não conectadas, sem execução. */
  tools: {
    title: string;
    intro: string;
    /** Selo de status uniforme das tools (não conectada / sem execução). */
    status: string;
    /** Restrições honestas que valem para todas as tools futuras. */
    constraints: readonly string[];
  };
  /** Bloco de memória — boundary read-only que preserva a arquitetura da base. */
  memory: {
    title: string;
    intro: string;
    /** Camadas de memória planejadas/não ativas (arquitetura preservada). */
    layers: readonly MemoryLayerBoundary[];
    /** Separação explícita: RAG/conhecimento semântico ≠ memória operacional. */
    ragSeparation: { title: string; status: string; body: string };
  };
  /** Relação honesta entre as capacidades planejadas e tools/memória. */
  capabilityRelation: {
    title: string;
    items: readonly string[];
  };
  /** Afirmação de ausência de ativação — vale para tools E memória. */
  noActivation: readonly string[];
};

/**
 * Retorna a configuração declarativa da fronteira de tools e memória. Função
 * PURA: não recebe dados, não consulta nada, não depende de tenant/role — o
 * conteúdo é estático e honesto, porque NADA está conectado/ativo. Cada selo de
 * status é a verdade da fase: tools "Não conectada — sem execução"; camadas de
 * memória "Planejada — não ativa"; RAG "Separado — não é memória operacional".
 */
export function getToolMemoryBoundary(): ToolMemoryBoundaryConfig {
  return {
    title: "Ferramentas e memória — limites planejados",
    intro:
      "Antes de qualquer ferramenta conectar ou qualquer memória ativar, este é o limite honesto de ambas: o que existirá no futuro, sob governança, e por que nada está ativo agora. Tudo aqui é somente leitura.",
    tools: {
      title: "Ferramentas (tools) futuras",
      intro:
        "As capacidades planejadas poderão, no futuro, usar ferramentas governadas. Hoje nenhuma está conectada e nenhuma executa nada.",
      status: "Não conectada — sem execução",
      constraints: [
        "Nenhuma ferramenta está conectada.",
        "Nenhuma execução acontece a partir daqui.",
        "Sem MCP conectado.",
        "Sem API externa chamada.",
        "Dependem de lanes futuras, sob governança e sob a fronteira do papel do operador.",
      ],
    },
    memory: {
      title: "Memória — fronteira e governança (read-only)",
      intro:
        "A memória do YZI OS não é histórico de chat nem RAG genérico. Estas são as camadas da arquitetura de memória já definida — todas planejadas e não ativas. Aqui elas aparecem como fronteira e governança, não como implementação.",
      layers: [
        {
          layer: "Raw Event Memory",
          purpose:
            "Registrar de forma bruta eventos, mensagens, resultados e mudanças de estado da operação.",
          restriction:
            "Não consolida, não decide importância e não julga relevância — e hoje nada é registrado.",
          status: "Planejada — não ativa",
        },
        {
          layer: "Reflective Memory",
          purpose:
            "Consolidar a experiência da operação em tópicos, resumos, decisões e padrões ao longo do tempo.",
          restriction:
            "Não cria embedding nem banco e não executa — hoje nada é consolidado.",
          status: "Planejada — não ativa",
        },
        {
          layer: "Retrieval Evidence Layer",
          purpose:
            "Preservar a origem (proveniência) e a evidência de cada informação antes de ser citada ou usada.",
          restriction:
            "Não é retriever, reranker, embeddings nem vector search — hoje nada é recuperado.",
          status: "Planejada — não ativa",
        },
        {
          layer: "Memory Governance",
          purpose:
            "Decidir, por política e autorização, o que pode ser lembrado, atualizado, esquecido, bloqueado, citado ou usado.",
          restriction:
            "Não é automação e não substitui autorização humana — hoje nada é governado em runtime.",
          status: "Planejada — não ativa",
        },
        {
          layer: "Context / Evidence Trace",
          purpose:
            "Manter a trilha de contexto e de evidência que liga cada decisão à sua origem.",
          restriction:
            "Não rastreia execução real — como não há execução, não há trace ativo.",
          status: "Planejado — não ativo",
        },
      ],
      ragSeparation: {
        title: "RAG / Conhecimento semântico",
        status: "Separado — não é memória operacional",
        body:
          "RAG recupera conhecimento e documentos: é uma camada separada da memória operacional. O YZI OS não trata RAG e memória reflexiva como a mesma coisa, e não os mistura. Também não está ativo: nenhum vector store, nenhum embedding e nenhuma recuperação acontece.",
      },
    },
    capabilityRelation: {
      title: "Relação com as capacidades planejadas",
      items: [
        "Cada capacidade planejada poderá, no futuro, depender de ferramentas e/ou memória governadas.",
        "Nenhuma capacidade usa ferramenta ou memória agora.",
        "Nenhum agente tem acesso a memória agora.",
      ],
    },
    noActivation: [
      "Nenhuma ferramenta está conectada e nada executa automaticamente.",
      "Nenhuma memória operacional está ativa.",
      "Nenhum vector store ou embedding foi criado.",
      "Nenhum agente lê ou escreve memória.",
      "Nada é salvo automaticamente; nenhum agente decide o que salvar.",
      "RAG/conhecimento semântico não se mistura com memória operacional.",
      "Nenhuma execução agentic acontece a partir desta seção — é somente leitura.",
    ],
  };
}

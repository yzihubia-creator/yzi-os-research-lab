// First Controlled Agent Operation / Dry-run Layer (Lane 13).
// Módulo PURO, declarativo e read-only: nenhuma query, nenhum schema, nenhuma
// policy, nenhum service role, nenhuma escrita, nenhuma env, nenhum fetch e
// NENHUM runtime agentic. Não cria agente, runner, MCP, tool, memória, tabela de
// runs nem side effect; apenas texto.
//
// Decisão de produto (Lane 13): esta é a PRIMEIRA operação agentic do YZI OS,
// executada em modo DRY-RUN / pré-visualização controlada. Ela prova que o
// sistema consegue REPRESENTAR uma operação agentic de forma governada — sem
// executar produção, sem efeito externo e sem tocar nada. NÃO é um agente real
// de produção.
//
// A operação é local/declarativa e baseada no estado JÁ EXISTENTE do cockpit:
// recebe apenas o nome do tenant e o rótulo do papel — dados que o cockpit já
// carregou via getTenantContext()/getPermissionBoundary() — e NÃO consulta nada
// novo, não lê banco, não lê memória e não chama tool. Os "insumos" exibidos são
// apenas a leitura honesta do que já está na tela.
//
// Verdade de produto nesta fase: nenhuma fonte de dados é lida, nada é pontuado,
// nenhuma tool é chamada, nenhuma memória é acessada, nenhum agente está ativo em
// produção. A conclusão da operação é honesta: bloqueada para execução real até
// lanes futuras, cada uma com seu próprio gate humano.

/** Um insumo da operação — rótulo + valor (leitura do estado já existente). */
export type ControlledOperationInput = {
  /** Rótulo do insumo (ex.: "Tenant", "Papel do operador"). */
  label: string;
  /** Valor honesto do insumo — já visível no cockpit, sem ID/slug/token cru. */
  value: string;
};

/** Dados já carregados pelo cockpit, passados como insumo (sem consulta nova). */
export type ControlledOperationContext = {
  /** Nome do tenant real já resolvido pelo cockpit (nunca id/slug cru). */
  tenantName: string;
  /** Rótulo humano do papel já resolvido pela fronteira de permissão. */
  roleLabel: string;
};

/** Configuração read-only da primeira operação controlada (dry-run). */
export type ControlledAgentOperation = {
  /** Título da seção no cockpit. */
  title: string;
  /** Uma linha honesta: primeira operação, em dry-run, sem efeito. */
  intro: string;
  /** Selo de status uniforme — deixa explícito que é pré-visualização. */
  status: string;
  /** Capacidade que a operação representa (job-anchored, sem nome de agente). */
  capabilityAnalyzed: { label: string; capability: string; note: string };
  /** Insumos usados — leitura do estado já existente; nenhuma consulta nova. */
  inputs: { title: string; items: readonly ControlledOperationInput[] };
  /** Conclusão honesta: bloqueada para execução real até lanes futuras. */
  conclusion: { title: string; body: string };
  /** Ausência de side effects — vale para toda a operação. */
  safety: readonly string[];
};

/**
 * Retorna a configuração declarativa da primeira operação controlada (dry-run).
 * Função quase PURA: o único input é o estado JÁ CARREGADO pelo cockpit (nome do
 * tenant e rótulo do papel) — não consulta banco, não lê memória, não chama tool
 * e não produz efeito. Cada selo é a verdade da fase: status
 * "Dry-run — pré-visualização, sem execução real"; conclusão "bloqueada para
 * execução real até lanes futuras".
 */
export function getControlledAgentOperation(
  context: ControlledOperationContext,
): ControlledAgentOperation {
  return {
    title: "Primeira operação controlada (dry-run)",
    intro:
      "Esta é a primeira operação agentic do YZI OS, executada em modo dry-run — uma pré-visualização controlada. Ela prova que a operação pode ser representada de forma governada, sem executar nada em produção e sem nenhum efeito.",
    status: "Dry-run — pré-visualização, sem execução real",
    capabilityAnalyzed: {
      label: "Capacidade analisada",
      capability: "Qualificação de oportunidades",
      note: "Pré-visualização controlada: nenhuma fonte de dados foi lida e nada foi pontuado. A operação apenas representa, sob governança, o que seria considerado — não o resultado de uma análise real.",
    },
    inputs: {
      title: "Insumos da operação (apenas leitura do estado já existente)",
      items: [
        { label: "Tenant", value: context.tenantName },
        { label: "Papel do operador", value: context.roleLabel },
        {
          label: "Limite de capacidade",
          value: "Definido e sem execução (Lane 11).",
        },
        {
          label: "Fronteira de tools/memória",
          value: "Tools não conectadas; memória não ativa (Lane 12).",
        },
      ],
    },
    conclusion: {
      title: "Conclusão da operação",
      body: "Operação bloqueada para execução real até lanes futuras. Para sair do dry-run seriam necessários runner, tool governada e/ou memória operacional — nenhum existe ainda, e cada um virá com seu próprio gate humano.",
    },
    safety: [
      "Nenhum efeito colateral (side effect): nada foi criado, alterado ou enviado.",
      "Nenhuma ferramenta (tool) foi chamada.",
      "Nenhuma memória foi acessada, lida ou escrita.",
      "Nenhum agente está ativo em produção.",
      "Sem MCP, sem runner, sem chamada externa, sem escrita em banco.",
      "Somente leitura: não há botão que prometa ou dispare execução real.",
    ],
  };
}

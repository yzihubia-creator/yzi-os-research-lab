// Controlled Run Record / Run State Boundary Layer (Lane 14).
// Módulo PURO, declarativo e read-only: nenhuma query, nenhum schema, nenhuma
// policy, nenhum service role, nenhuma escrita, nenhuma env, nenhum fetch e
// NENHUM runtime agentic. Não cria agente, runner, MCP, tool, memória, tabela de
// runs nem side effect; apenas texto. Acima de tudo: NÃO PERSISTE NADA.
//
// Decisão de produto (Lane 14): transformar o dry-run da Lane 13 em um modelo
// visual/declarativo de RUN GOVERNADO, exibido ANTES de existir qualquer
// persistência real. A seção mostra honestamente o que SERIA um registro de
// execução controlada ("run"): seu estado, seus insumos, seus bloqueios, a
// ausência de side effects, o que seria persistido no futuro, o que ainda NÃO é
// persistido e quais gates futuros seriam necessários para persistência real.
//
// O run é local/declarativo e baseado no estado JÁ EXISTENTE do cockpit: recebe
// apenas o nome do tenant e o rótulo do papel — dados que o cockpit já carregou
// via getTenantContext()/getPermissionBoundary() — e NÃO consulta nada novo, não
// lê banco, não lê memória, não chama tool e NÃO grava run em lugar nenhum.
//
// Verdade de produto nesta fase: o run é simulado/pré-persistência. run mode é
// dry-run/preview/read-only; run status é simulated / blocked_for_real_execution
// / not_persisted; side effects = none; persistence = not persisted. A execução
// real e a persistência real permanecem bloqueadas até lanes futuras, cada uma
// com seu próprio gate humano (schema, RLS, write policy, evidence trace,
// rollback/audit).

/** Um campo de estado do run — rótulo + valor honesto (sem ID/slug/token cru). */
export type RunStateField = {
  /** Rótulo do campo (ex.: "Run mode", "Run status", "Tenant"). */
  label: string;
  /** Valor honesto do campo — já visível/derivável do estado do cockpit. */
  value: string;
};

/** Dados já carregados pelo cockpit, passados como insumo (sem consulta nova). */
export type ControlledRunContext = {
  /** Nome do tenant real já resolvido pelo cockpit (nunca id/slug cru). */
  tenantName: string;
  /** Rótulo humano do papel já resolvido pela fronteira de permissão. */
  roleLabel: string;
};

/** Configuração read-only do registro de operação controlada (run governado). */
export type ControlledRunRecord = {
  /** Título da seção no cockpit. */
  title: string;
  /** Uma linha honesta: run governado, pré-persistência, sem efeito. */
  intro: string;
  /** Selo de status uniforme — deixa explícito que nada foi persistido. */
  status: string;
  /** Estado do run — run mode, run status, capability, tenant, operator role. */
  runState: { title: string; items: readonly RunStateField[] };
  /** Insumos (input sources) — leitura do estado já existente; sem consulta nova. */
  inputSources: { title: string; items: readonly string[] };
  /** Resultado honesto: execução real bloqueada até lanes futuras. */
  result: { title: string; body: string };
  /** Persistência: o que NÃO é persistido agora (ausência explícita). */
  persistence: { title: string; items: readonly string[] };
  /** Requisitos futuros de persistência real — cada um com gate próprio. */
  futurePersistence: { title: string; items: readonly string[] };
};

/**
 * Retorna a configuração declarativa do registro de operação controlada (run
 * governado, pré-persistência). Função quase PURA: o único input é o estado JÁ
 * CARREGADO pelo cockpit (nome do tenant e rótulo do papel) — não consulta banco,
 * não lê memória, não chama tool, não produz efeito e NÃO PERSISTE run. Cada selo
 * é a verdade da fase: run mode "dry-run / preview / read-only"; run status
 * "simulated · blocked_for_real_execution · not_persisted"; side effects "none";
 * persistence "not persisted".
 */
export function getControlledRunRecord(
  context: ControlledRunContext,
): ControlledRunRecord {
  return {
    title: "Registro de operação controlada (run governado — pré-persistência)",
    intro:
      "Este é o registro de uma operação controlada (“run”) em modo governado, exibido ANTES de existir qualquer persistência real. Ele mostra honestamente o que SERIA um run — estado, insumos, bloqueios e ausência de efeitos — e deixa explícito o que ainda não é persistido e quais gates seriam necessários para persistir de verdade.",
    status: "Run não persistido — simulado, bloqueado para execução real",
    runState: {
      title: "Estado do run",
      items: [
        { label: "Run mode", value: "dry-run / preview / read-only" },
        {
          label: "Run status",
          value:
            "simulated · blocked_for_real_execution · not_persisted",
        },
        { label: "Capability", value: "Qualificação de oportunidades" },
        { label: "Tenant", value: context.tenantName },
        { label: "Operator role", value: context.roleLabel },
        { label: "Side effects", value: "none" },
        { label: "Persistence", value: "not persisted" },
      ],
    },
    inputSources: {
      title: "Insumos do run (input sources — apenas leitura do estado já existente)",
      items: [
        "Tenant context — vínculo real do operador (Lanes 3/6), lido sem consulta nova.",
        "Role boundary — fronteira de permissão do papel (Lane 8).",
        "Capability boundary — limite definido e sem execução (Lane 11).",
        "Tool/memory boundary — tools não conectadas e memória não ativa (Lane 12).",
      ],
    },
    result: {
      title: "Resultado do run",
      body: "Execução real bloqueada até lanes futuras. Este run apenas representa, sob governança, o que seria considerado — não o resultado de uma execução real. Para sair do estado simulado seriam necessários runner, tool governada e/ou memória operacional, e a persistência viria com seus próprios gates humanos.",
    },
    persistence: {
      title: "Persistência — o que ainda NÃO acontece",
      items: [
        "Nenhum run é gravado em banco: persistence = not persisted.",
        "Nenhuma tabela de runs ou de agents foi criada ou escrita.",
        "Nenhum SQL, schema ou policy (RLS/escrita) foi criado ou executado.",
        "Nenhum evidence trace operacional foi persistido.",
        "Nenhum side effect, tool call, acesso a memória, MCP, runner ou chamada externa.",
        "Somente leitura: não há botão que prometa ou dispare persistir/executar um run real.",
      ],
    },
    futurePersistence: {
      title: "Requisitos futuros para persistência real (cada um com gate próprio)",
      items: [
        "Schema — tabela de runs (e relação com tenant/agents) ainda não criada.",
        "RLS — políticas de isolamento por tenant para leitura dos runs.",
        "Write policy — política de escrita governada (quem grava, quando, sob qual papel).",
        "Evidence trace — rastro de evidência/auditoria do que cada run considerou e produziu.",
        "Rollback / audit strategy — reversão e auditoria antes de qualquer efeito real.",
      ],
    },
  };
}

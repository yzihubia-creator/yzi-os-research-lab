# Lane 18 - Cockpit Read-only Controlled Run Records Integration: Execution Program v1

Branch: `lane-1-6-foundation`

Readiness de entrada:
`POST_SQL_HUMAN_VALIDATION_APPROVED_LANE_18_READY_TO_OPEN`

Readiness esperado:
`LANE_18_COCKPIT_READONLY_RUN_RECORDS_CLOSED_VALIDATED_NO_WRITE`

## 1. Objetivo

Integrar a leitura real de `public.controlled_run_records` ao cockpit em modo estritamente read-only,
tenant-scoped via RLS e filtragem pelo tenant atual.

## 2. Escopo permitido

- Criar helper read-only para buscar os ultimos registros persistidos do tenant atual.
- Usar a sessao Supabase autenticada do operador.
- Usar apenas cliente Supabase existente baseado em URL publica + anon key.
- Exibir no cockpit a secao `Registros persistidos de operacoes controladas`.
- Mostrar estado vazio honesto quando nao houver registros.
- Mostrar campos de auditoria de registros existentes, sem expor secrets.
- Rodar `lint` e `build`.
- Parar para validacao runtime/browser humana antes da Lane 19.

## 3. Escopo proibido

- Insert, update, delete ou qualquer escrita.
- Service role.
- SQL executado pelo agente.
- MCP.
- API externa.
- Agente real, runner, scheduler, tool real ou memoria operacional.
- Botao de persistencia ou execucao.
- Alteracao de auth, tenant, membership ou schema.
- Abertura da Lane 19 antes do gate humano.

## 4. Implementacao

Arquivos de codigo:

- `platform/src/lib/agents/controlled-run-records-readonly.ts`
- `platform/src/app/cockpit/page.tsx`

Comportamento:

- Query read-only em `controlled_run_records`.
- Filtro por `tenant_id` do tenant atual.
- Ordenacao por `created_at desc`.
- Limite conservador de 5 registros, com teto interno de 10.
- Campos exibidos: `capability_key`, `run_mode`, `run_status`, `persistence_status`,
  `side_effects`, `operator_role`, `created_at`, `result_summary`.

## 5. Gate humano obrigatorio

Antes de abrir a Lane 19, o humano precisa confirmar:

- `/cockpit` abriu autenticado.
- Tenant `YZI OS - Operacao Inicial` exibido.
- Role `viewer` exibida.
- Secao da Lane 14 preservada.
- Nova secao `Registros persistidos de operacoes controladas` apareceu.
- Como o count atual era 0 antes da Lane 19, estado vazio honesto apareceu.
- Nenhum botao de persistir/executar apareceu na Lane 18.
- Sem hydration overlay.
- Sem token/cookie/OAuth code exposto.

Frase de desbloqueio:
`RUNTIME LANE 18 APROVADO`

## 6. Estado deste programa

Este programa abre apenas a Lane 18. Ele nao abre Lane 19, nao cria persistencia e nao faz push.

# Pack 04 — Tenant Context Read v1

> Pack documental da Lane 4 — Cockpit Skeleton. Não executa nada agora. Corresponde ao Step 5 do runbook. Gate requerido: L4-G3.

## Objetivo

Implementar (quando autorizado) a resolução read-only do contexto de tenant do usuário autenticado, exercitando as policies RLS da Lane 3 (`memberships_select_own` → `tenants_select_member`) e produzindo estado vazio tipado quando não há membership.

## Escopo Autorizado

- `platform/src/lib/tenant/tenant-context.ts` — somente leitura via SELECT nas tabelas `tenant_memberships` e `tenants`.

## Escopo Proibido

- Qualquer escrita no banco (INSERT/UPDATE/DELETE — sem policy por design);
- Service role;
- Cache enganoso ou dado inventado para preencher o vazio;
- Multi-tenant avançado (troca de tenant, convites, roles).

## Entradas

- Gate L4-G3;
- Sessão funcional do Pack 03;
- Skill spec `tenant-context-empty-state-skill-v1`;
- Subagent spec `tenant-context-reviewer-agent-spec-v1`.

## Saídas Esperadas

- Função tipada que distingue: tenant presente / sem membership / sem sessão;
- Nenhum erro de RLS vazando como crash.

## Validação

- Parecer APROVADO conforme skill `tenant-context-empty-state-skill-v1`;
- Com banco limpo, retorno é estado vazio tipado — verificado no Step 8.

## Stop Conditions

- Escrita no banco proposta → `UNAUTHORIZED_SQL_EXECUTION`;
- Dado inventado → `DISHONEST_EMPTY_STATE`;
- Arquivo fora da lista → `OUT_OF_SCOPE_WRITE`.

## Evidence Esperado

`evidence/templates/lane-4-tenant-context-evidence-template-v1.md` preenchido com comportamento observado.

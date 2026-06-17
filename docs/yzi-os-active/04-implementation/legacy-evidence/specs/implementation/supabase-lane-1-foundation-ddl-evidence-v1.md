# Supabase Lane 1 — Foundation DDL Evidence v1

## Readiness Statement

`LANE_1_DDL_VALIDATED_SUCCESS`

Este documento é o **evidence record versionado** do resultado da Lane 1 — Supabase Foundation, conforme o mapa operacional [`yzi-os-spec-harness-execution-map-v1`](../yzi-os-spec-harness-execution-map-v1.md). Ele **registra** o estado pós-DDL validado; **não executa SQL, não usa MCP, não cria migrations, não cria policies, não insere dados e não altera `platform/`**. Foi produzido exclusivamente a partir dos outputs da validação pós-DDL informados pelo humano.

---

## Contexto da Execução

- **Lane:** Lane 1 — Supabase Foundation
- **Data:** 2026-06-11
- **Executor do DDL:** humano, manualmente, no Supabase SQL Editor (projeto `thwsltjcjrvtidhnfukc`)
- **MCP:** não utilizado nesta execução
- **Evidence anterior:** [`supabase-project-baseline-evidence-v1`](supabase-project-baseline-evidence-v1.md) (baseline: `tenants` existia sem policies; `tenant_memberships` não existia)

---

## Decisão

`LANE_1_DDL_VALIDATED_SUCCESS` — o DDL patchado da fundação foi executado e validado com sucesso. O schema de fundação multi-tenant (tabelas `tenants` e `tenant_memberships`) existe no estado esperado.

---

## Resumo do Que Foi Criado/Confirmado

| Objeto | Estado validado |
| --- | --- |
| `public.tenants` | existe, RLS habilitado, 0 linhas |
| `public.tenant_memberships` | existe, RLS habilitado, 0 linhas |
| PK de `tenant_memberships` | `id` |
| FK `tenant_memberships.tenant_id` | → `public.tenants(id)` ON DELETE CASCADE |
| FK `tenant_memberships.user_id` | → `auth.users(id)` ON DELETE CASCADE |
| Unique | `(tenant_id, user_id)` |
| Índices | `tenant_id`, `user_id`, `role`, `status` |

---

## Validação Pós-DDL

- `public.tenants` existe — confirmado;
- `public.tenant_memberships` existe — confirmado;
- RLS habilitado em ambas as tabelas — confirmado;
- **nenhuma policy criada** em nenhuma das tabelas — confirmado;
- 0 linhas em ambas as tabelas — confirmado;
- nenhum seed criado — confirmado;
- nenhum tenant real inserido — confirmado.

---

## Restrições Preservadas

- `platform/` não foi alterado;
- MCP não foi usado nesta execução;
- SQL executado exclusivamente pelo humano, de forma manual;
- nenhuma migration criada ou registrada;
- nenhum código de backend/frontend criado;
- nenhum subagent criado;
- arquitetura não expandida além das specs aprovadas.

---

## Riscos / Remanescentes

- **RLS habilitado sem policies** em `tenants` e `tenant_memberships`: ambas as tabelas ficam inacessíveis via API até que policies sejam definidas (estado intencional nesta fase; policies exigirão pack próprio com gate humano).
- **DDL aplicado manualmente, sem migration registrada**: o histórico formal de migrations permanece vazio; a reconciliação entre estado real e histórico formal segue pendente (ver Pending Decision do evidence baseline).
- **Nenhum dado de teste**: validações funcionais de comportamento (cascade, unique) ainda não foram exercitadas com linhas reais.

`This evidence record does NOT authorize:` executar SQL, usar MCP, criar policies, criar migrations, inserir dados, alterar `platform/` ou iniciar a Lane 2.

---

## Próxima Ação Recomendada

Preparar a **Lane 2 — Platform Foundation**, **somente após** atualizar/confirmar o índice/status do pacote de execução (mapa operacional e registro de packs refletindo a Lane 1 como concluída).

---

## Final Status

`LANE_1_DDL_VALIDATED_SUCCESS`

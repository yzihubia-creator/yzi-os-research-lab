# YZI OS Reflective Memory Governance Boundary

## 1. Objetivo

Definir, em nível arquitetural e não técnico, o boundary de governança da camada `YZI OS Reflective Memory` para seis decisões: lembrar, atualizar, esquecer, bloquear, citar e usar. Esta task não cria banco, embeddings, retriever, runtime, política executável, código nem execução técnica. Implementação técnica = 0%.

## 2. Fonte do Boundary

- Architecture boundary: `/docs/specs/memory/yzi-os-reflective-memory-architecture-boundary.md`.
- Concept map: `/docs/specs/memory/yzi-os-reflective-memory-concept-map.md` (quatro componentes confirmados).
- Readiness de entrada: `TASK_249_YZI_OS_REFLECTIVE_MEMORY_CONCEPT_MAP_CREATED_DOCUMENTARY_ONLY`.

## 3. Definição de Memory Governance

`Memory Governance` é a camada conceitual que decide, por política, evidência e autorização, o que a Reflective Memory pode lembrar, atualizar, esquecer, bloquear, citar ou usar. Ela **não é**: automação; runtime; política executável; banco; retriever; reranker; sistema de permissão técnico; substituto da revisão humana.

## 4. Tabela de Decisões de Governança

| Governance Decision | What It Controls | Required Evidence | Status |
| ------------------- | ---------------- | ----------------- | ------ |
| Remember | o que vira memória reflexiva | origem rastreável + relevância | REQUIRES_EVIDENCE |
| Update | consolidar/corrigir memória existente | nova evidência ou mudança de estado | REQUIRES_EVIDENCE |
| Forget | descartar memória obsoleta/irrelevante | justificativa + política de retenção | REQUIRES_HUMAN_AUTHORIZATION |
| Block | impedir uso de memória sensível/sem origem | política + ausência/fragilidade de origem | NOT_AUTHORIZED_FOR_AUTOMATION |
| Cite | expor a origem de uma memória usada | proveniência via Retrieval Evidence Layer | REQUIRES_EVIDENCE |
| Use | aplicar memória numa resposta/decisão | autorização + escopo de tenant/agente | REQUIRES_HUMAN_AUTHORIZATION |
| Cross-tenant use | uso de memória entre tenants | autorização explícita por política | NOT_AUTHORIZED_FOR_AUTOMATION |

## 5. Critérios para Lembrar (Remember)

Relevância; recorrência; impacto operacional; evidência de origem; autorização; vínculo com tenant/agente/usuário/projeto. Sem origem rastreável, a informação não deve virar memória forte.

## 6. Critérios para Atualizar (Update)

Nova evidência; mudança de preferência; mudança de estado; correção de dado; resolução de conflito. A atualização preserva proveniência e não apaga a trilha de evidência.

## 7. Critérios para Esquecer (Forget)

Obsolescência; irrelevância; expiração por política de retenção; pedido de remoção; risco de privacidade. Esquecer é decisão governada, nunca automática, e exige autorização.

## 8. Critérios para Bloquear (Block)

Origem ausente ou fraca; conteúdo sensível; conflito de política; suspeita de violação de governança; ausência de autorização. Memória sem origem rastreável deve ser bloqueada ou marcada como fraca.

## 9. Critérios para Citar (Cite)

Toda memória usada deve poder apontar sua origem via Retrieval Evidence Layer: spec, KB, conversation, tool result, lead state, project state ou evidence record. Citação não substitui autorização humana.

## 10. Critérios para Usar (Use)

Escopo correto de tenant/agente/usuário/projeto; autorização aplicável; memória não bloqueada; evidência disponível. Uso fora de escopo ou cross-tenant exige autorização explícita por política.

## 11. Relação com Evidência

Toda memória deve ter origem rastreável; memória sem origem rastreável deve ser bloqueada ou marcada como fraca; a evidência pode vir de spec, KB, conversation, tool result, lead state, project state ou evidence record; evidence record não é memória, mas pode provar uso, origem ou decisão; citação não substitui autorização humana.

## 12. Relação com Produtos YZI OS (apenas conceitual)

- Ju / YZI IMOB: preferências de lead, imóveis apresentados, handoff, follow-up, mudanças de intenção;
- Café com Pam: briefing, estilo, orçamento, decisões de projeto, pendências;
- multi-tenant: memória nunca deve cruzar tenant sem autorização explícita;
- agentes institucionais: memória deve respeitar agente, escopo, política e origem.

Nada é implementado.

## 13. Usos Proibidos Nesta Fase

Criar banco, tabelas, schema, embeddings, vector store, retriever, reranker, RL, runtime, política executável ou permissão técnica; alterar n8n, Supabase, frontend, Jurema ou Café com Pam; criar código, integração, automação ou execução técnica.

## 14. Próxima Task Recomendada

`Task 251 — Create YZI OS Reflective Memory Evidence Model Boundary` — definir documentalmente quais tipos de evidência podem sustentar memória reflexiva (spec, KB, conversation, tool result, state, evidence record e human authorization), sem implementação técnica; requer nova autorização humana explícita.

## 15. Readiness Statement Final

`TASK_250_YZI_OS_REFLECTIVE_MEMORY_GOVERNANCE_BOUNDARY_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhum código, banco, tabelas, schema, embeddings, vector store, retriever, reranker, RL, runtime, política executável, permissão técnica, loader, registry, runner, `.claude/`, hook, MCP ou integração criado ou alterado.

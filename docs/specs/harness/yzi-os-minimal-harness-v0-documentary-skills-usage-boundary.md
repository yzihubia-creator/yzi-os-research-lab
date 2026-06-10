# YZI OS Minimal Harness v0 — Documentary Skills Usage Boundary

## 1. Objetivo

Definir o limite documental de uso das cinco skills do `YZI OS Minimal Harness v0`: como podem ser referenciadas em futuras tasks documentais, sem permitir execução técnica, automação, carregamento, registry ou runner. Esta task não altera os cinco `SKILL.md`, não cria novas skills e não cria loader/registry/runner/hook/MCP/execução. Implementação técnica = 0%.

## 2. Fonte do Boundary

- Evidência: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-skills-materialization-evidence-record.md`.
- Readiness de entrada: `TASK_226_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_SKILLS_MATERIALIZATION_EVIDENCE_RECORD_CREATED_DOCUMENTARY_ONLY`.

## 3. Skills Documentais Cobertas

| Skill | Documentary Use Allowed | Technical Use Forbidden | Status |
| ----- | ----------------------- | ----------------------- | ------ |
| read-approved-specs | orientar leitura de specs aprovadas | execução/loader/registry/runner/hook/MCP/código | DOCUMENTARY_REFERENCE_ONLY |
| validate-scope-boundaries | orientar validação de escopo | execução/loader/registry/runner/hook/MCP/código | DOCUMENTARY_REFERENCE_ONLY |
| inspect-authorized-paths | orientar inspeção de paths autorizados | execução/loader/registry/runner/hook/MCP/código | DOCUMENTARY_REFERENCE_ONLY |
| detect-governance-violation | orientar detecção de violação de governança | execução/loader/registry/runner/hook/MCP/código | DOCUMENTARY_REFERENCE_ONLY |
| write-evidence-record | orientar registro de evidência | execução/loader/registry/runner/hook/MCP/código | DOCUMENTARY_REFERENCE_ONLY |

## 4. Usos Permitidos

As cinco skills podem ser usadas apenas como referência documental para: orientar leitura de specs aprovadas; orientar validação de escopo; orientar inspeção de paths autorizados; orientar detecção de violação de governança; orientar registro de evidência; estruturar futuras tasks documentais; reduzir erro operacional em prompts de execução documental.

## 5. Usos Proibidos

As cinco skills não podem ser usadas para: executar comandos; carregar automaticamente comportamento; operar como runtime; operar como registry; operar como loader; operar como runner; acionar hooks; configurar MCP; criar código; alterar specs; alterar paths; autorizar próxima task; substituir revisão humana; executar qualquer ação técnica.

## 6. Regra de Referência em Futuras Tasks

Futuras tasks documentais podem referenciar essas skills apenas pelo path do respectivo `SKILL.md`. A referência a uma skill documental não concede autorização de execução e não substitui: autorização humana explícita; escopo permitido/proibido da task; validação de path; evidence record; revisão humana.

## 7. Decisão de Não-Execução

Este boundary é apenas documental. Não altera os `SKILL.md`, não cria novas skills, não cria loader/registry/runner/hook/MCP, não cria execução automática. Qualquer etapa técnica futura exige nova autorização humana explícita.

## 8. Próxima Task Recomendada

`Task 228 — Create YZI OS Minimal Harness v0 Documentary Skills Reference Checklist` — apenas um checklist documental curto para futuras tasks citarem as skills corretamente, sem loader, registry, runner ou execução técnica; requer nova autorização humana explícita.

## 9. Readiness Statement Final

`TASK_227_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_SKILLS_USAGE_BOUNDARY_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhum `SKILL.md` alterado; nenhuma skill nova, código, loader, registry, runner, hook, MCP, `.claude/`, script ou runtime criado ou alterado.

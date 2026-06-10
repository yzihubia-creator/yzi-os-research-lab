# YZI OS Minimal Harness v0 — Documentary Command Candidate Boundary

## 1. Objetivo

Definir o boundary documental para futuros command candidates do `YZI OS Minimal Harness v0`: o que um command candidate documental pode ou não ser, antes de qualquer decisão de criação. Não cria commands reais, não cria `.claude/commands`, não cria código, loader, registry, runner, hook, MCP nem execução técnica. Implementação técnica = 0%.

## 2. Fonte do Boundary

- Contexto de governança: `/docs/specs/execution-readiness/compact-operational-governance-context.md`.
- Fechamento da fase de skills: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-skills-phase-closure-record.md`.
- Readiness de entrada: `TASK_229_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_SKILLS_PHASE_CLOSED_DOCUMENTARY_ONLY`.

## 3. Definição de Command Candidate Documental

Artefato documental futuro que poderá descrever uma ação humana/assistida recorrente baseada nas cinco skills documentais, mas que não executa comandos, não aciona ferramentas, não cria automação e não substitui autorização humana.

## 4. Relação com as Cinco Skills Documentais

Qualquer futuro command candidate documental só poderá referenciar as cinco skills pelo path canônico do respectivo `SKILL.md`, conforme o reference checklist. A referência não concede execução.

1. `/docs/specs/harness/skills/read-approved-specs/SKILL.md`
2. `/docs/specs/harness/skills/validate-scope-boundaries/SKILL.md`
3. `/docs/specs/harness/skills/inspect-authorized-paths/SKILL.md`
4. `/docs/specs/harness/skills/detect-governance-violation/SKILL.md`
5. `/docs/specs/harness/skills/write-evidence-record/SKILL.md`

## 5. Tabela do Boundary

| Boundary Item | Decision | Status |
| ------------- | -------- | ------ |
| Natureza do command candidate | apenas documental, não-executável | DOCUMENTARY_BOUNDARY_ONLY |
| Referência às cinco skills | só por path canônico do SKILL.md | DOCUMENTARY_BOUNDARY_ONLY |
| Execução de comandos | proibida | NOT_AUTHORIZED_FOR_EXECUTION |
| Criação de `.claude/commands` | proibida | NOT_AUTHORIZED_FOR_EXECUTION |
| Criação de command real | proibida | NOT_AUTHORIZED_FOR_EXECUTION |
| Loader/registry/runner/hook/MCP | proibidos | NOT_AUTHORIZED_FOR_EXECUTION |
| Criação futura de command candidates | só com nova autorização humana | REQUIRES_FUTURE_HUMAN_AUTHORIZATION |

## 6. Usos Permitidos

Futuros command candidates documentais poderão, se autorizados em task posterior: descrever uma sequência documental recorrente; referenciar skills documentais por path; padronizar prompts de operação documental; reduzir erro operacional; apoiar revisão humana; apoiar criação de evidence records.

## 7. Usos Proibidos

Futuros command candidates documentais não poderão: executar comandos; criar `.claude/commands`; criar commands reais; acionar ferramentas; chamar scripts; operar como runner/registry/loader/hook; configurar MCP; criar código; alterar arquivos automaticamente; autorizar próxima task; substituir revisão humana.

## 8. Critérios para Futura Criação de Command Candidates

Uma futura task só poderá criar command candidates documentais se: (1) houver nova autorização humana explícita; (2) criar apenas arquivos documentais; (3) não criar `.claude/commands`; (4) não criar commands reais; (5) não criar código; (6) não criar execução automática; (7) citar skills apenas pelo path canônico; (8) preservar implementação técnica em 0%.

## 9. Próxima Task Recomendada

`Task 231 — Draft YZI OS Minimal Harness v0 Documentary Command Candidate Convention` — definir apenas uma convenção documental mínima para futuros command candidates, sem criar command real, sem `.claude/commands`, sem código e sem execução técnica; requer nova autorização humana explícita.

## 10. Readiness Statement Final

`TASK_230_YZI_OS_MINIMAL_HARNESS_V0_DOCUMENTARY_COMMAND_CANDIDATE_BOUNDARY_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhum command real, `.claude/`, `.claude/commands`, `SKILL.md` alterado, skill nova, código, loader, registry, runner, hook, MCP, script ou runtime criado ou alterado.

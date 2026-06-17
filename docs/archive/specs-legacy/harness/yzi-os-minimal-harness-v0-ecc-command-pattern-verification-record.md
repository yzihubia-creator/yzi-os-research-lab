# YZI OS Minimal Harness v0 — ECC Command Pattern Verification Record

## 1. Objetivo

Verificar, a partir das fontes públicas do ECC (`github.com/affaan-m/ECC`), como o ECC estrutura commands, antes de expandir os command candidates documentais do `YZI OS Minimal Harness v0`. Decisão baseada apenas nas fontes ECC consultadas; sem inferência e sem conhecimento geral. Não cria command real, `.claude/commands`, código, loader, registry, runner, hook, MCP nem execução técnica. Implementação técnica = 0%.

## 2. Fonte da Verificação

- Contexto de governança: `/docs/specs/execution-readiness/compact-operational-governance-context.md`.
- Boundary: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-command-candidate-boundary.md`.
- Convenção: `/docs/specs/harness/yzi-os-minimal-harness-v0-documentary-command-candidate-convention.md`.
- Review record: `/docs/specs/harness/yzi-os-minimal-harness-v0-command-candidate-controlled-documentary-task-review-review-record.md`.
- Readiness de entrada: `TASK_233_YZI_OS_MINIMAL_HARNESS_V0_COMMAND_CANDIDATE_REVIEW_RECORD_CREATED_DOCUMENTARY_ONLY`.

## 3. Fontes ECC Consultadas

- AGENTS.md — github.com/affaan-m/ECC/blob/main/AGENTS.md
- CLAUDE.md — github.com/affaan-m/ECC/blob/main/CLAUDE.md
- package.json — github.com/affaan-m/ECC/blob/main/package.json
- cross-harness.md — github.com/affaan-m/ECC/blob/main/docs/architecture/cross-harness.md
- commands/ — github.com/affaan-m/ECC/tree/main/commands

## 4. Tabela de Verificação do Padrão de Commands

| ECC Command Pattern Observed | ECC Source URL | Evidence | YZI OS Decision | Status |
| ---------------------------- | -------------- | -------- | --------------- | ------ |
| Commands ficam em `commands/` | ECC/AGENTS.md | "commands/ is a legacy slash-entry compatibility surface" | Manter conceito documental, sem `.claude/commands` | CONFIRMED_IN_ECC_SOURCE |
| Commands são arquivos Markdown | ECC/CLAUDE.md + ECC/commands | "Commands: Markdown with description frontmatter"; 127 arquivos `.md` | Manter candidates como Markdown documental | CONFIRMED_IN_ECC_SOURCE |
| Commands têm frontmatter/metadata | ECC/CLAUDE.md | "Markdown with description frontmatter" | Convenção usa name/description (alinhado) | CONFIRMED_IN_ECC_SOURCE |
| Commands são shims/legacy compat | ECC/AGENTS.md | "should only be added or updated when a shim is still required for migration or cross-harness parity" | Tratar candidates como documentais subordinados a skills | CONFIRMED_IN_ECC_SOURCE |
| Direção skills-first | ECC/AGENTS.md | "The long-term direction is skills-first"; "New workflow contributions should land in skills/ first" | Priorizar skills; candidate só referencia skills | ADAPT_PATTERN_DOCUMENTARY_ONLY |
| Existe quick reference de commands | ECC/CLAUDE.md | tabela "/tdd ... /plan ... /e2e ... /code-review" | Adiar; nenhum quick reference agora | CONFIRMED_IN_ECC_SOURCE |
| Scripts de validação de commands | ECC/package.json | "validate-commands.js" no target `test`; "generate-command-registry.js" | Adotar apenas checklist documental; não copiar script | DO_NOT_COPY |
| Separação real vs legacy command shims | ECC/AGENTS.md | "skills-first" vs "commands/ ... legacy ... compatibility surface" | Manter separação documental skills/commands | CONFIRMED_IN_ECC_SOURCE |
| Campo explícito de `references` a skills no command | ECC/CLAUDE.md | não há campo `references`; apenas "description frontmatter" | Manter `references` como adição documental YZI (não conflita) | NOT_CONFIRMED_IN_ECC_SOURCE |
| Relação com `.claude/commands` | ECC/docs/architecture/cross-harness.md | não menciona `.claude/commands`; "command routing at the harness edge" | Não criar `.claude/commands` | NOT_CONFIRMED_IN_ECC_SOURCE |
| Regra de install/copy/adapt por harness | ECC/docs/architecture/cross-harness.md | "If a change requires editing three harness copies ... Put the workflow back in skills/, then adapt only loading, event shape, or command routing at the harness edge" | Manter adapter/execução fina e documental | ADAPT_PATTERN_DOCUMENTARY_ONLY |

## 5. Padrões Não Confirmados

- campo explícito `references` skill→command no ECC: `NOT_CONFIRMED_IN_ECC_SOURCE`;
- uso de `.claude/commands` no ECC: `NOT_CONFIRMED_IN_ECC_SOURCE`.

## 6. Decisão sobre a Convenção YZI OS

`KEEP_CURRENT_YZI_DOCUMENTARY_COMMAND_CONVENTION`

Justificativa baseada apenas nas fontes ECC: o ECC confirma commands como Markdown com `description` frontmatter, tratados como legacy/compatibility shims subordinados a uma direção skills-first. A convenção documental YZI (`name`/`description`/`references`, citando skills por path canônico, sem execução) é coerente e mais conservadora que o ECC, e não conflita com nenhuma evidência ECC consultada. O campo `references` é adição documental YZI (`NOT_CONFIRMED_IN_ECC_SOURCE`), não um conflito. Nada nas fontes ECC exige alterar a convenção atual.

## 7. Limites de Não-Execução

Documento apenas. Nenhum ECC instalado/clonado; nenhum command real, `.claude/`, `.claude/commands`, `SKILL.md` alterado, skill nova, código, loader, registry, runner, hook, MCP, agent, adapter, script, YAML operacional, JSON ou contrato machine-readable criado. Candidate (Task 232) e convenção (Task 231) inalterados. `/tools/controlled-harness/`, banco, runtime, frontend e workflows n8n inalterados.

## 8. Próxima Task Recomendada

`Task 235 — Create YZI OS Minimal Harness v0 Documentary Command Candidates Expansion Gate` — definir o gate documental para expandir command candidates mantendo a convenção atual, sem command real, sem `.claude/commands`, sem código e sem execução técnica; requer nova autorização humana explícita.

## 9. Readiness Statement Final

`TASK_234_ECC_COMMAND_PATTERN_VERIFICATION_RECORD_CREATED_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhum ECC instalado/clonado, nenhum command real, `.claude/`, código, loader, registry, runner, hook, MCP, script ou runtime criado ou alterado.

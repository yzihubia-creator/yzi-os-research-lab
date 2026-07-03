# YZI IMOB — Skill Graph v0.1

Grafo operacional de commands e subagentes do YZI IMOB. Usado pela YZI Orquestradora (`yzi-imob-orchestrator-v0.1.md`) para escolher a sequência de cada unidade sem depender de prompt manual.

## 1. Entrada padrão

Toda unidade YZI IMOB começa por:

1. Ler `CLAUDE.md`, `AGENTS.md` e `memory/MEMORY.md` quando relevante.
2. Executar lógica equivalente a `/yzi-imob-read-operating-map`.
3. Classificar o tipo de unidade (ver orchestrator, seção 5).
4. Selecionar subagentes conforme a seção 3 abaixo.
5. Validar boundary antes de implementar e antes de fechar.

## 2. Commands classificados

| Command | Tipo |
|---|---|
| `/yzi-imob-read-operating-map` | micro-skill |
| `/yzi-imob-design-screen` | micro-skill |
| `/yzi-imob-plan-integration` | micro-skill |
| `/yzi-imob-validate-tenant-boundary` | constraint-skill |
| `/yzi-imob-close-unit` | constraint/procedural close skill |

## 3. Subagentes por tipo de unidade

- **documentation-unit**: Product Architect; Evidence Closer.
- **screen-unit**: Product Architect; UX/UI Architect; Frontend Implementer; Tenant Boundary Reviewer; Evidence Closer.
- **navigation-unit**: UX/UI Architect; Frontend Implementer; Evidence Closer.
- **integration-plan-unit**: Product Architect; Integration Planner; Tenant Boundary Reviewer; Evidence Closer.
- **backend-spec-unit**: Product Architect; Tenant Boundary Reviewer; Integration Planner (se houver API/credencial); Evidence Closer.
- **backend-code-unit**: Product Architect; Frontend Implementer (ou futuro Backend Implementer, se existir); Tenant Boundary Reviewer; Integration Planner (se houver API); Evidence Closer.
- **close-unit**: Evidence Closer; Tenant Boundary Reviewer quando houver dado/código.

## 4. Workflows padrão

### Tela nova

`read-operating-map → product-review → ux-ui-review → design-screen → implement → tenant-boundary-review → lint/build → evidence-close → human commit authorization`

### Integração

`read-operating-map → integration-plan → tenant-boundary-review → approval-policy → evidence-close → human authorization`

### Backend spec

`read-operating-map → runtime-architecture-check → tenant-boundary-review → data/action model → approval-policy → evidence-close`

### Fechamento

`scope-check → status-check → staged-files-check → validation-summary → human authorization → commit local → no push`

## 5. Self-correction sem self-approval

Loops de autocorreção são permitidos como padrão futuro, mas nunca com autoaprovação.

`Self-correction loop sim. Self-approval não.`

Qualquer loop precisa terminar em:

- validação de escopo;
- tenant boundary review;
- lint/build quando houver código;
- evidência;
- autorização humana para commit;
- sem push.

## 6. Próxima evolução

Uma futura meta-skill/command poderá materializar este grafo — `/yzi-imob-orchestrate-unit` ou `/yzi-imob-build-unit` — em unidade própria autorizada. Esta unidade não cria command.

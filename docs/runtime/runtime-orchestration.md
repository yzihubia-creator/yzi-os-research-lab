# YZI OS — Orquestração do Runtime

> Camada `runtime`. Detalha a orquestração de operações multi-passo e multi-agente. Complementa a
> [filosofia de runtime](runtime-philosophy.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[HARNESS-RT]` `[CE]`

---

## 1. Propósito

Define a **orquestração leve**: como o runtime coordena múltiplos passos e sub-agentes sem deter
autoridade. Sem implementação.

## 2. Orquestração coordena; não governa

A orquestração roteia tarefas, monta o contexto de cada passo e sequencia a execução governada.
É coordenação — a decisão é dos services, o permitido é das policies, a verdade é do estado. (`P6`)

## 3. Delegação ≠ decomposição

Decompor parte a tarefa; **delegar transfere autoridade, responsabilidade e confiança**. `[PYR]`
Sem essa distinção, a orquestração multi-agente degenera num monólito distribuído com ilusão de
independência. `[PYR]` A orquestração do YZI OS delega com responsabilidade atribuível.

## 4. Atenuação de privilégio e isolamento

Cada sub-agente recebe apenas a **fatia necessária** de contexto e direitos; cada elo estreita as
permissões. `[PYR]` (`DO2`) Sub-agentes não veem o contexto uns dos outros nem cruzam tenants.
(`P10`)

## 5. Contract-first

Um passo só é delegado quando possui **método de verificação definido**; caso contrário, é
decomposto até ser verificável. `[PYR]` A orquestração nunca delega o não-verificável.

## 6. Observável e reversível

Cada decisão de orquestração é observável (decision observability) e reversível em granularidade
fina. `[AHE]` A trilha de coordenação forma-se organicamente. `[CE]` (`P9`)

## 7. Fronteiras (o que NÃO está aqui)

- **Não** define o ciclo de vida do agente — ver [agent-lifecycle](../agents/agent-lifecycle.md).
- **Não** define a governança da delegação — ver [governance/](../governance/operational-boundaries.md).
- **Não** define código nem grafo de execução concreto.

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P6` runtime executa, não governa | §2 |
| `P16` harnesses orquestram | §2, §5 |
| `DO2` isolamento contextual | §4 |
| `P9` ação auditável | §6 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

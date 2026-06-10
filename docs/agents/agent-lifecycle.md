# YZI OS — Ciclo de Vida do Agente

> Camada `agents`. Define como um agente institucional é criado, configurado, operado e versionado.
> Complementa [institutional-agents](institutional-agents.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[CE]`

---

## 1. Propósito

Define o ciclo de vida do agente, da criação à aposentadoria, sempre governado por specification.
Sem implementação.

## 2. Criação por specification, não por improviso

Um agente nasce de **specifications e policies**, não de um prompt avulso. Agente criado sem
specification carrega **specification debt**: decide por heurísticas do contexto disponível. `[PYR]`
"Quanto mais fácil criar, mais crítico definir o que 'criado bem' significa." `[PYR]`

## 3. Configuração governada

A configuração do agente declara: a specification que o governa, os contratos comportamentais, as
policies vigentes, o corpus de retrieval e o perímetro de tenant. A configuração é **versionada** e
coerente. `[PYR]`

## 4. Operação dentro do contrato

Em operação, o agente propõe dentro de sua specification e do ciclo governado; cada operação é um
episódio auditável. (`P9`) A continuidade do agente vem do **estado** e da Referência Mestra, não da
memória do modelo. `[CE]` (`P3` `P17`)

## 5. Versionamento e aposentadoria

Mudança de estratégia institucional propaga-se por **nova versão** de specification/policy — não por
ajuste verbal. Agentes são versionados e aposentados sob governança, preservando continuidade e
auditabilidade.

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define memória — ver [agent-memory](agent-memory.md).
- **Não** define execução — ver [agent-execution-model](agent-execution-model.md).
- **Não** define framework, runtime concreto ou código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P15` specifications governam contratos | §2, §3 |
| `P3`/`P17` estado/continuidade | §4 |
| `P9` ação auditável | §4 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

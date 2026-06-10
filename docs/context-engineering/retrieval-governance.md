# YZI OS — Governança de Retrieval

> Camada `context-engineering`. Define como a recuperação é governada como parte do contexto.
> É a contraparte de engenharia da [arquitetura de
> retrieval](../architecture/retrieval-architecture.md) e da [arquitetura de
> governança](../architecture/governance-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[CE]` `[PYR]`

---

## 1. Propósito

Define as regras que governam a operação **select** do contexto — o que pode ser recuperado, por
quem, quando e sob qual política. Sem implementação.

## 2. Retrieval é a face de recuperação da governança

Conforme a decisão arquitetural aprovada, **governance** define *o que é permitido* e **retrieval**
é a *face de recuperação/contextualização* da governança comportamental — os dois permanecem
**separados, não fundidos**. Governar o retrieval **é** governar o comportamento, porque o que o
agente recupera determina como ele decide. `[PYR]` (`P4`)

## 3. Recuperação é orquestrada por política, não ad hoc

A recuperação não é busca livre: é **orquestrada por política**. `[PYR]` (`DO3`) A política
define o corpus acessível, as fronteiras de visibilidade (por agente e por tenant) e as
circunstâncias de recuperação. Recuperação fora de política não compõe contexto.

## 4. O que a governança de retrieval impõe

- **Relevância e suficiência** — recuperar o mínimo suficiente, evitando *lost-in-the-middle* e
  alucinação por lacuna. `[PYR]`
- **Isolamento** — nunca cruzar fronteira de tenant; respeitar a fatia atenuada do agente (ver
  [context-isolation](context-isolation.md)).
- **Proveniência** — todo fragmento recuperado carrega origem/momento/confiança (ver
  [context-provenance](context-provenance.md)).
- **Economia** — minimizar tokens e recomposições preservando qualidade. `[PYR]`

## 5. Defesa contra conteúdo adversário

Fontes recuperadas são **entrada não confiável** até governadas. `[CE]` Como entram em papéis de
prioridade **inferior** à Authority, uma instrução injetada não pode legitimamente sobrepor-se à
governança; o que escapar é capturado pela verificação independente. `[CE]`

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define o papel arquitetural do retrieval — ver [retrieval-architecture](../architecture/retrieval-architecture.md).
- **Não** define o conteúdo das policies — camada `governance` (Fase posterior).
- **Não** define busca vetorial, índices ou código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P4` retrieval governa comportamento | §2 |
| `P5` RAG + Policies governam agentes | §3 |
| `DO3` orquestração de retrieval | §3 |
| `P10`/`DO2` isolamento | §4 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

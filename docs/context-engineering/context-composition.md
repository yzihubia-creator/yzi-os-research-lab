# YZI OS — Composição de Contexto

> Camada `context-engineering`. Define como o pacote de contexto é composto e como conflitos
> internos se resolvem. Complementa o [context-model](context-model.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[CE]` `[PYR]`

---

## 1. Propósito

Define a **composição** do pacote de contexto: atribuição de papéis, prioridade e resolução de
conflito **dentro** de uma operação. Sem implementação.

## 2. Atribuição explícita de papéis

Compor contexto é **atribuir papéis** a cada elemento: este governa (Authority), este exemplifica
(Exemplar), este limita (Constraint), este avalia (Rubric), este informa (Metadata). `[CE]` O ato
de atribuir papéis força a pergunta "o que cada elemento contribui?", revelando ruído. `[CE]`

## 3. Os cinco critérios de qualidade da composição

O contexto composto deve satisfazer: **relevância, suficiência, isolamento, economia,
proveniência**. `[PYR]` Suficiência é guarda arquitetural contra alucinação; relevância evita
*lost-in-the-middle*; economia é unidade econômica; isolamento e proveniência são tratados em
[context-isolation](context-isolation.md) e [context-provenance](context-provenance.md).

## 4. Resolução de conflito dentro do pacote

Quando elementos conflitam, prevalece a **maior prioridade de papel**: Authority › Exemplar ›
Constraint › Rubric › Metadata. `[CE]` Assim, uma Constraint não sobrepõe uma Authority, e o
prompt (Metadata) jamais sobrepõe a governança (Authority). (`P1`)

Esta prioridade **de papel** opera dentro de uma operação. A resolução de conflito **entre
princípios** do sistema segue a **ordem de valores** institucional (verdade operacional ›
segurança › isolamento › auditabilidade › …). As duas não se confundem: uma rege o pacote, a
outra rege a doutrina (ver [`principles.md`](../foundation/principles.md)).

## 5. Estrutura sobre volume

A composição prioriza **estrutura**, não quantidade: um pacote enxuto com Authority supera um
volumoso sem ela. `[CE]` Adicionar elementos sem papel declarado aumenta ruído sem aumentar
sinal. A composição é compressão governada, não acumulação.

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define o ciclo de vida/eviction — ver [context-lifecycle](context-lifecycle.md).
- **Não** define o que pode ser recuperado — ver [retrieval-governance](retrieval-governance.md).
- **Não** define formatos concretos nem código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P1` LLM não é fonte de verdade | Prioridade de papel (§4) |
| `P11` contexto modular | §2, §5 |
| `P12` governança separada da linguagem | Authority › Metadata (§4) |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

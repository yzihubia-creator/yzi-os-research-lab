# YZI OS — Contratos Comportamentais

> Camada `specification-engineering`. Define os contratos que governam o que o agente deve
> buscar e o que pode/não pode fazer — a codificação de intenção. Deriva da [filosofia de
> specification](specification-philosophy.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[HE-GOV]`

---

## 1. Propósito

Define o **contrato comportamental**: a codificação institucional de intenção, prioridades,
hierarquias de trade-off e fronteiras de decisão. Sem implementação.

## 2. Contexto sem intenção é ruído

Um agente com contexto perfeito ainda pode otimizar o objetivo errado — déficit de **intenção**,
não de dados. `[PYR]` O contrato comportamental fecha esse déficit: codifica **o que o agente deve
buscar** (e o que pode sacrificar), não apenas o que ele sabe. "Contexto sem intenção é ruído." `[PYR]`

## 3. O que o contrato comportamental codifica

`[PYR]`
- **Prioridades e hierarquias de trade-off** — situacionalmente ranqueadas (ex.: precisão vs.
  velocidade; conformidade vs. experiência), variando por domínio.
- **Valores e princípios** institucionais aplicáveis ao comportamento.
- **Fronteiras de decisão** — onde o agente decide e onde deve escalar.

## 4. Contra o reward hacking e o specification gaming

Sem intenção formalizada, o agente otimiza o **proxy** mensurável em vez do objetivo (problema
principal-agente; reward hacking; specification gaming). `[PYR]` O contrato comportamental define o
objetivo real e os trade-offs admissíveis, removendo o incentivo a otimizar a letra contra o
espírito.

## 5. Relação com governança e Guidance/Enforcement

O contrato comportamental é **declarado** aqui e **aplicado** pela camada de governança: parte
opera como Guidance (orienta a proposta do agente) e parte como Enforcement (verifica a saída).
`[HE-GOV]` O contrato comportamental não é texto de prompt — é artefato versionado, separado da
linguagem. (`P12`)

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define o que a operação produz — ver [operational-specifications](operational-specifications.md).
- **Não** define a execução — ver [execution-contracts](execution-contracts.md).
- **Não** define o enforcement em si — camada `governance` (posterior).

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P15` specifications governam contratos | §3 |
| `P5` RAG + Policies governam agentes | §5 |
| `P12` governança separada da linguagem | §5 (não é prompt) |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

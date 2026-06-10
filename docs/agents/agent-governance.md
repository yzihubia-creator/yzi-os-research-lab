# YZI OS — Governança do Agente

> Camada `agents`. Define como o comportamento do agente é governado. Complementa a [governança
> comportamental](../governance/behavioral-governance.md) e os [contratos
> comportamentais](../specification-engineering/behavioral-contracts.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[HE-GOV]` `[CE]`

---

## 1. Propósito

Define o modelo de governança do agente: como RAG, XML e policies governam seu comportamento, e
como a intenção é aplicada. Sem implementação.

## 2. O agente é governado, não confiável

A confiança não está no agente nem no modelo, mas na **arquitetura**: o agente opera dentro de
fronteiras que restringem seu espaço de ação, independentemente de seu raciocínio. `[CE]` (`P5`)
"Restringir habilita autonomia." `[HE-GOV]`

## 3. RAG + XML + Policies governam o agente

O que o agente sabe (RAG), a estrutura de sua operação (XML/contratos) e o que pode/não pode
(policies) governam seu comportamento — não a formulação do prompt. (`P4` `P5` `P12`) A intenção
codificada (contratos comportamentais) define o que ele deve buscar; "contexto sem intenção é
ruído". `[PYR]`

## 4. Guidance e Enforcement aplicados ao agente

Parte da governança orienta a proposta do agente (Guidance, pré); parte verifica sua saída
(Enforcement, pós). `[HE-GOV]` Só o enforcement garante; a eloquência do agente (Metadata) não
sobrepõe a Authority. `[CE]` (`P1`)

## 5. Escalação como fronteira

Quando a operação excede a fronteira de decisão do agente, escala-se ao humano conforme o [modelo de
escalação](../governance/escalation-model.md) — preservando a responsabilidade do operador. `[PYR]`

## 6. Comportamento rastreável

O comportamento governado do agente é **reconstruível a partir de traces** (behavioral
traceability), e toda ação é auditável. `[AHE]` (`DO7` `P9`)

## 7. Fronteiras (o que NÃO está aqui)

- **Não** define o conteúdo dos contratos — ver [specification-engineering/](../specification-engineering/behavioral-contracts.md).
- **Não** define o substrato de enforcement — ver [governance-harness](../harness-engineering/governance-harness.md).
- **Não** define código.

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P5` RAG + Policies governam agentes | §2, §3 |
| `P4` retrieval governa comportamento | §3 |
| `P12` governança separada da linguagem | §4 |
| `DO7` rastreabilidade comportamental | §6 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

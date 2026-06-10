# YZI OS — Governança Comportamental

> Camada `governance`. Detalha como o comportamento dos agentes é governado por RAG, XML e
> policies. Complementa os [contratos comportamentais](../specification-engineering/behavioral-contracts.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[HE-GOV]` `[CE]`

---

## 1. Propósito

Define o modelo de governança comportamental: como intenção, prioridades e fronteiras de decisão
governam o agente. Sem implementação.

## 2. RAG + XML + Policies governam o comportamento

O comportamento é governado pela combinação de **recuperação contextual (RAG/XML)** e **policies**,
não pela formulação do prompt. (`P5`) O que o agente recupera determina como se comporta (`P4`); o
que pode/não pode é determinado pelas policies.

## 3. Intenção codificada, não implícita

A governança comportamental aplica a intenção codificada nos contratos comportamentais —
prioridades, hierarquias de trade-off, fronteiras de decisão. "Contexto sem intenção é ruído." `[PYR]`
Sem isso, o agente otimiza o proxy mensurável (reward hacking / specification gaming). `[PYR]`

## 4. Guidance orienta, Enforcement garante

Parte da governança comportamental opera como **Guidance** (orienta a proposta do agente) e parte
como **Enforcement** (verifica a saída). `[HE-GOV]` Só o enforcement garante; a eloquência do agente
(Metadata) jamais sobrepõe a Authority. `[CE]` (`P1`)

## 5. Rastreabilidade comportamental

O comportamento governado é **reconstruível a partir de traces** (behavioral traceability). `[AHE]`
(`DO7`) A governança comportamental e a auditabilidade são complementares: uma restringe, a outra
comprova.

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define o conteúdo do contrato comportamental — ver [behavioral-contracts](../specification-engineering/behavioral-contracts.md).
- **Não** define o ciclo de vida do agente — ver [agents/](../agents/agent-governance.md).
- **Não** define código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P4` retrieval governa comportamento | §2 |
| `P5` RAG + Policies governam agentes | §2 |
| `P12` governança separada da linguagem | §4 |
| `DO7` rastreabilidade comportamental | §5 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

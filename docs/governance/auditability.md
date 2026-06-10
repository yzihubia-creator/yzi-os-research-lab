# YZI OS — Auditabilidade

> Camada `governance`. Define a auditabilidade como requisito de governança. Complementa a
> [arquitetura de observabilidade](../architecture/observability-architecture.md) e o
> [audit-harness](../harness-engineering/audit-harness.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[HARNESS-RT]` `[CE]` `[PYR]` `[AHE]`

---

## 1. Propósito

Define a auditabilidade como exigência de governança: toda ação operacional deve ser auditável.
(`P9`) Sem implementação.

## 2. Toda ação operacional é auditável

Nenhuma ação ocorre sem trilha reconstruível. (`P9`) A unidade é o **pacote de episódio** (traces,
verificação, atribuição, entropia, intervenção, resultado). `[HARNESS-RT]` A trilha **forma-se
organicamente** quando cada estágio preserva sua saída. `[CE]`

## 3. Proveniência é pré-requisito

Sem proveniência (origem/momento/confiança), não há auditoria de decisão, depuração nem
conformidade. `[PYR]` (`DO6`) A auditabilidade exige que cada fragmento de contexto e cada decisão
sejam rastreáveis à origem, com responsabilidade transitiva em cadeias de delegação. `[PYR]`

## 4. Auditor independente

Quem executa não audita; a avaliação independente captura erros que a auto-revisão ignora. `[CE]`
A governança institui essa separação como regra, não preferência.

## 5. Controlabilidade read-only

A auditabilidade é protegida pelo invariante de controlabilidade: o executor **não pode desligar a
própria fiscalização** (verificador/tracer/config read-only). `[AHE]` Sem isso, a trilha seria
manipulável e a auditoria, vazia.

## 6. Auditabilidade como valor

Auditabilidade é a **4ª posição** da ordem de valores. Nenhuma resolução de conflito pode produzir
uma ação não-auditável para satisfazer um valor inferior.

## 7. Fronteiras (o que NÃO está aqui)

- **Não** define o substrato de auditoria — ver [audit-harness](../harness-engineering/audit-harness.md).
- **Não** define formatos de log/assinatura nem código.

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P9` ação auditável | §2, §3 |
| `P8` observabilidade obrigatória | §2 |
| `DO6` provenance tracking | §3 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

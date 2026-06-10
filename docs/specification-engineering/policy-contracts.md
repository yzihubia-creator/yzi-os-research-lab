# YZI OS — Contratos de Política

> Camada `specification-engineering`. Define os contratos de política — o que é permitido,
> proibido e quando escalar. Deriva da [filosofia de specification](specification-philosophy.md)
> e alimenta a [arquitetura de governança](../architecture/governance-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[HE-GOV]`

---

## 1. Propósito

Define o **contrato de política**: a declaração versionada do permitido, do proibido e dos pontos
de escalação. Sem implementação.

## 2. Política é enforcement, não guidance

O contrato de política é **determinístico**: declara regras que produzem veredito pass/fail
independente de qual agente operou. `[HE-GOV]` Difere de guidance (instrução probabilística) —
"guidance demais vira não-guidance". `[HE-GOV]` (`DO5` `P12`) A política é parte da Authority, não
do prompt.

## 3. O que o contrato de política declara

`[PYR]`
- o que o agente **pode** fazer;
- o que é **proibido**;
- **quando escalar** a um humano (gatilhos de escalação — ver
  [escalation-harness](../harness-engineering/escalation-harness.md)).

## 4. Política aplicada nas duas pontas

A política age **antes** da decisão (restringe o espaço de ação) e **depois** da execução
(verifica conformidade), conforme o ciclo governado da [arquitetura
operacional](../architecture/operational-architecture.md). Operação fora de política não
prossegue.

## 5. Política como redução do espaço de escolha

O contrato de política estreita o espaço de decisões por eliminação, canalização e
canonicalização. `[HE-GOV]` Quanto mais abrangente, mais o resultado torna-se propriedade da
governança, não do autor (independência de agente).

## 6. Política e a ordem de valores

A política respeita e operacionaliza a **ordem de valores** institucional (verdade operacional ›
segurança › isolamento multi-tenant › auditabilidade › …) na resolução de tensões. Nenhuma política
pode subordinar um valor superior a um inferior.

## 7. Fronteiras (o que NÃO está aqui)

- **Não** define o motor/aplicação das policies — camada `governance` (posterior).
- **Não** define o conteúdo das policies de um tenant específico — ver [tenant-contracts](tenant-contracts.md).
- **Não** define formato concreto nem código.

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P5` RAG + Policies governam agentes | §3 |
| `P12` governança separada da linguagem | §2 |
| `DO5` policy enforcement determinístico | §2, §4, §5 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

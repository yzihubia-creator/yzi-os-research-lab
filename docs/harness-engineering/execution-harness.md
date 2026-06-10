# YZI OS — Execution Harness

> Camada `harness-engineering`. Detalha o harness de execução controlada — tools, permissão e
> verificação. Deriva da [filosofia de harness](harness-philosophy.md), dos [contratos de
> execução](../specification-engineering/execution-contracts.md) e da [arquitetura de
> services](../architecture/service-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[HARNESS-RT]` `[PYR]` `[HE-GOV]`

---

## 1. Propósito

Detalha o **execution harness**: o substrato que coordena a execução por tools sob contrato,
permissão e verificação. Sem implementação.

## 2. Execução sob fronteira de permissão

As tools executam **apenas sob fronteira de permissão explícita**, e cada invocação é traçada
(registro de tools + permission boundary). `[HARNESS-RT]` (`P14`) O harness aciona a execução; a
decisão pertence aos services, e o que é permitido pertence às policies. Acionar ≠ decidir.

## 3. Verificação vinculada à execução

A conclusão é objeto evidenciário: requisitos mapeados a evidência determinística, com a disciplina
**reproduzir → atribuir → corrigir → verificar → reportar** e atribuição **antes** de nova ação.
`[HARNESS-RT]` (`DO9`) Só se executa o que tem método de verificação definido (contract-first). `[PYR]`

## 4. Decidir ≠ executar

O harness respeita a fronteira: services decidem, tools executam, o modelo apenas descreve a
invocação. `[PYR]` (`P2` `P14`) Nenhuma decisão de verdade operacional ocorre aqui.

## 5. Gates e enforcement

Aplica gates de aprovação para ações arriscadas e bloqueia ações fora do contrato de execução
(enforcement determinístico). `[HE-GOV]` (`DO5`) Estabilidade de tool (timeouts, falhas) é tratada
como recurso de runtime analisável, não como incidente. `[HARNESS-RT]`

## 6. Entropia da execução

Registra o ônus de manutenção introduzido pela execução, encaminhado ao [audit-harness](audit-harness.md).
`[HARNESS-RT]` (`DO10`)

## 7. Fronteiras (o que NÃO está aqui)

- **Não** decide — ver [service-architecture](../architecture/service-architecture.md).
- **Não** define o que é permitido — ver [governance-harness](governance-harness.md).
- **Não** define microservices, APIs, schema ou código.

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P14` services/tools executam | §2, §4 |
| `DO9` verificação como runtime | §3 |
| `DO4` execução baseada em specification | §3 |
| `DO5` policy enforcement | §5 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

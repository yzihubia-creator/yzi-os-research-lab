# YZI OS — Contratos de Execução

> Camada `specification-engineering`. Define os contratos que governam a execução por services e
> tools — o que pode ser executado e como se verifica. Deriva da [filosofia de
> specification](specification-philosophy.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[HARNESS-RT]` `[HE-GOV]`

---

## 1. Propósito

Define o **contrato de execução**: o que uma tool pode fazer, sob qual fronteira de permissão, e
como o resultado é verificado. Sem implementação.

## 2. Execução é controlada por contrato

Tools executam **apenas sob fronteira de permissão explícita**, e cada invocação é traçada. `[HARNESS-RT]`
(`P14`) O contrato de execução declara as ações permitidas, os comandos admissíveis e os limites —
o registro de tools e a fronteira de permissão são responsabilidades de runtime governadas por
este contrato. `[HARNESS-RT]`

## 3. Verificação vinculada ao contrato

Pela regra contract-first, só se executa/delegar o que possui **método de verificação precisamente
definido**. `[PYR]` O contrato de execução mapeia requisitos a **evidência determinística** e
adota a disciplina **reproduzir → atribuir → corrigir → verificar → reportar**, com atribuição de
falha **antes** de qualquer nova ação. `[HARNESS-RT]` (`DO9`)

## 4. Decisão fica nos services; execução nas tools

O contrato de execução respeita a fronteira **decidir ≠ executar**: os services decidem dentro do
contrato; as tools realizam a ação. `[PYR]` (`P2` `P14`) O modelo apenas descreve a invocação;
nunca executa. `[PYR]`

## 5. Permissão e gates

O contrato define **gates de aprovação** para ações arriscadas e a fronteira de permissão que
restringe ações destrutivas. `[HARNESS-RT]` Operação fora do contrato de execução não prossegue
(enforcement determinístico). `[HE-GOV]` (`DO5`)

## 6. Entropia da execução

O contrato considera o **ônus de manutenção** que uma execução pode introduzir (resíduo, deriva),
auditado conforme [audit-harness](../harness-engineering/audit-harness.md). `[HARNESS-RT]` (`DO10`)

## 7. Fronteiras (o que NÃO está aqui)

- **Não** define a lógica de decisão — ver [service-architecture](../architecture/service-architecture.md).
- **Não** define microservices, APIs, schema ou código.
- **Não** define o enforcement em si — camada `governance` (posterior).

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P14` services/tools executam | §2, §4 |
| `DO4` execução baseada em specification | §3 |
| `DO9` verificação como runtime | §3 |
| `DO5` policy enforcement | §5 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

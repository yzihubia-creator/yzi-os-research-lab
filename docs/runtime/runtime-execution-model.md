# YZI OS — Modelo de Execução do Runtime

> Camada `runtime`. Detalha como o runtime conduz a execução de uma operação sem decidir nem
> governar. Complementa o [execution-harness](../harness-engineering/execution-harness.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[HARNESS-RT]` `[PYR]` `[HE-GOV]`

---

## 1. Propósito

Define o **modelo de execução** do runtime: como ele aciona decisão, execução e verificação,
mantendo cada autoridade em sua camada. Sem implementação.

## 2. Aciona, não decide

O runtime conduz a operação acionando os detentores de autoridade: roteia à governança (pré),
aos **services** (decisão), às **tools** (execução) e à verificação (pós). Ele **aciona**; não
decide a verdade nem define o permitido. (`P2` `P6` `P14`)

## 3. O LLM é invocado como serviço

Quando compreensão ou geração linguística é necessária, o runtime invoca o LLM como **serviço
externo**, sem autoridade. `[PYR]` (`P1`) O modelo descreve invocações; o runtime as encaminha às
tools sob permissão — nunca executa por conta do modelo.

## 4. Execução sob permissão e contrato

Toda execução ocorre sob **fronteira de permissão explícita** e dentro do contrato de execução;
cada invocação é traçada. `[HARNESS-RT]` (`P14`) Operação fora de contrato/policy é bloqueada
(enforcement determinístico). `[HE-GOV]` (`DO5`)

## 5. Verificação acionada, não julgada

O runtime **aciona** a verificação (reproduzir → atribuir → corrigir → verificar → reportar) e
registra o resultado, mas o **critério** de aprovação pertence à governança. `[HARNESS-RT]` (`DO9`)
A atribuição de falha precede qualquer nova ação corretiva.

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define a lógica de decisão — ver [service-architecture](../architecture/service-architecture.md).
- **Não** define o que é permitido — ver [governance/](../governance/operational-boundaries.md).
- **Não** define microservices, APIs ou código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P2` backend decide | §2 |
| `P6` runtime executa, não governa | §2, §5 |
| `P14` services/tools executam | §4 |
| `P1` LLM sem autoridade | §3 |
| `DO9` verificação como runtime | §5 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

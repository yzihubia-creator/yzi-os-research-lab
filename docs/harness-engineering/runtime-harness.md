# YZI OS — Runtime Harness

> Camada `harness-engineering`. Detalha o harness de **coordenação** — o runtime leve. Deriva da
> [filosofia de harness](harness-philosophy.md) e da [arquitetura de
> runtime](../architecture/runtime-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[HARNESS-RT]` `[AHE]` `[HE-GOV]`

---

## 1. Propósito

Detalha o **runtime harness**: a coordenação operacional que monta contexto, roteia, orquestra,
chama tools, registra eventos e aciona verificações — **sem** decidir a verdade nem governar
comportamento. (`P6` `P13`) Sem implementação.

## 2. As responsabilidades de coordenação

O runtime harness coordena (não detém autoridade sobre) as onze responsabilidades de runtime:
task interface, context manager, tool registry, project memory, task state, observability layer,
failure attribution, verification protocol, permission boundary, entropy auditor, intervention
logger. `[HARNESS-RT]` (Ver tabela "autoridade pertence a" em
[runtime-architecture §4](../architecture/runtime-architecture.md).)

## 3. O laço de coordenação

Observar estado → montar contexto → rotear → orquestrar tools (sob permissão) → registrar
evidência. `[HE-GOV]` (laço de controle cibernético) O runtime garante a **ordem governada** e a
observabilidade de cada passo; não julga, não decide, não define o permitido.

## 4. Componentes desacoplados e reversíveis

Cada componente do harness é um artefato isolado e **reversível**; cada mudança mapeia a um
componente, com reversão em granularidade fina. `[AHE]` Isso mantém o runtime leve e a atribuição
limpa.

## 5. Contratos falsificáveis e controlabilidade

Decisões de coordenação são pareadas a predições verificáveis (decision observability). `[AHE]`
O verificador, o tracer e a configuração são **read-only** para o executor: o runtime não pode
desligar a própria fiscalização. `[AHE]` (`P9`)

## 6. Independência de modelo

Como a autoridade vive fora do runtime e do modelo, o LLM é substituível sem alterar o harness,
o estado, as policies ou as specifications. `[PYR]` (`P1`)

## 7. Fronteiras (o que NÃO está aqui)

- **Não** governa comportamento — ver [governance-harness](governance-harness.md).
- **Não** decide — ver [service-architecture](../architecture/service-architecture.md).
- **Não** define processo, framework ou código.

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P6` runtime executa, não governa | §1, §3 |
| `P13` runtime leve | §4 |
| `P16` harnesses orquestram | §2, §3 |
| `P9` ação auditável | §5 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

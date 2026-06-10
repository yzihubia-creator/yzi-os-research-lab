# YZI OS — Observability Harness

> Camada `harness-engineering`. Detalha o harness que produz e estrutura a evidência. Deriva da
> [filosofia de harness](harness-philosophy.md) e da [arquitetura de
> observabilidade](../architecture/observability-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[AHE]` `[HARNESS-RT]` `[CE]`

---

## 1. Propósito

Detalha o **observability harness**: o substrato que torna cada operação rastreável e
analisável. Sem implementação.

## 2. Os três pilares

`[AHE]`
- **Component observability** — cada componente como artefato isolado e reversível.
- **Experience observability** — traços brutos destilados em corpus de evidência em camadas,
  consumível por divulgação progressiva.
- **Decision observability** — cada decisão pareada a predição falsificável, verificada na rodada
  seguinte (contrato versionado). (`DO7`)

## 3. O pacote de episódio

O harness produz, por operação, o **pacote de episódio**: traces (ação, tool, contexto,
verificação), relatório de verificação, atribuição de falha, auditoria de entropia, registro de
intervenção e resultado. `[HARNESS-RT]` A trilha forma-se **organicamente** quando cada estágio
preserva sua saída. `[CE]` (`P8` `P9`)

## 4. Sustenta a controlabilidade

O observability harness mantém verificador/tracer/config **read-only** para o executor, de modo
que ninguém desligue a própria fiscalização e todo ganho permaneça atribuível. `[AHE]`

## 5. Fronteiras (o que NÃO está aqui)

- **Não** julga conformidade (governança) nem decide (services).
- **Não** define a auditoria/atribuição em profundidade — ver [audit-harness](audit-harness.md).
- **Não** define dashboards, formatos de log ou código.

## 6. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P8` observabilidade obrigatória | §2, §3 |
| `P9` ação auditável | §3, §4 |
| `DO7` rastreabilidade comportamental | §2 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

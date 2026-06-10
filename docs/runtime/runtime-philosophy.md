# YZI OS — Filosofia de Runtime

> Camada `runtime`. Detalha a **mecânica operacional** do runtime leve. Recorte distinto da
> [arquitetura de runtime](../architecture/runtime-architecture.md) (posição estrutural) e do
> [runtime-harness](../harness-engineering/runtime-harness.md) (substrato).
>
> Status: canônico · Versão: v1 · Proveniência: `[HARNESS-RT]` `[HE-GOV]` `[AHE]` `[PYR]`

---

## 1. Propósito

Define a filosofia operacional do runtime: por que ele é leve, o que faz e o que recusa fazer ao
**executar**. Sem implementação.

## 2. Coordena, não governa

O runtime **coordena** a operação: monta contexto, roteia, orquestra, chama tools, registra
eventos, aciona verificações. Ele **não decide a verdade operacional** (estado/services) nem
**governa comportamento** (policies/specifications). (`P6`) Acionar uma verificação não é julgá-la;
o critério de aprovação é da governança.

## 3. Leve por princípio

O runtime não acumula lógica institucional (services) nem governança (policies). (`P13`) Mantê-lo
mínimo é o que permite que a autoridade comportamental viva fora dele — e é o que torna o sistema
**independente de modelo**: trocar o LLM não altera o runtime. `[PYR]` (`P1`)

## 4. Restringir habilita autonomia

A confiança para delegar cresce quando o espaço de ação é deliberadamente estreitado. `[HE-GOV]`
O runtime aplica fronteiras (permissão, contrato, isolamento) — estreitar não é governar a
verdade, é tornar a delegação confiável.

## 5. Externo ao modelo e observável

O runtime é um substrato **externo ao modelo** cujas decisões de coordenação são observáveis e
reversíveis (decision/component observability). `[AHE]` Opera sob o invariante de controlabilidade:
não pode desligar a própria fiscalização. `[AHE]`

## 6. Fronteiras (o que NÃO está aqui)

- **Não** redefine a posição estrutural — ver [runtime-architecture](../architecture/runtime-architecture.md).
- **Não** governa nem decide.
- **Não** define processo, framework ou código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P6` runtime executa, não governa | §2 |
| `P13` runtime leve | §3 |
| `P1` LLM não é fonte de verdade | §3 |
| `P9` ação auditável | §5 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

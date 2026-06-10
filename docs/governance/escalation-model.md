# YZI OS — Modelo de Escalação

> Camada `governance`. Define o modelo de escalação ao humano — regras e gatilhos. Complementa o
> [escalation-harness](../harness-engineering/escalation-harness.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[HARNESS-RT]`

---

## 1. Propósito

Define **quando e por que** uma operação escala ao humano — o modelo de governança da escalação
(o substrato é o escalation-harness). Sem implementação.

## 2. Escalação é governada, não improvisada

Os gatilhos de escalação são definidos por **policies e contratos** — fronteiras de decisão, gates
de aprovação, limites institucionais. `[PYR]` A escalação é parte da governança, não uma reação ad
hoc do agente.

## 3. Intervenção como sinal diagnóstico

A intervenção humana **não é ruído**: indica uma responsabilidade de governança ausente. `[HARNESS-RT]`
A governança trata cada intervenção evitável como **lacuna a fechar** (reduzir M-HIR), não como
operação normal.

## 4. Gradiente de autoridade

Quando a distância de capacidade entre orquestrador e sub-agente é grande, tarefas mal-especificadas
passam sem sinalização (sicofância); um **falso pressuposto de suficiência** é defeito a escalar.
`[PYR]` O modelo de escalação vigia esse gradiente.

## 5. Escalação preserva responsabilidade

A escalação mantém a responsabilidade no **operador** e evita a "zona de amortecimento moral" (humano
formalmente responsável, sem influência real). `[PYR]` Devolve ao humano o que excede a fronteira de
decisão do agente, mantendo a autoridade delegada **exercível**.

## 6. Escalação e a ordem de valores

A escalação prioriza **segurança** (2ª posição): diante de risco operacional ou incerteza acima do
limite, escalar prevalece sobre continuidade autônoma.

## 7. Fronteiras (o que NÃO está aqui)

- **Não** define o substrato de escalação — ver [escalation-harness](../harness-engineering/escalation-harness.md).
- **Não** define UI de aprovação, fila ou código.

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P5` policies governam agentes | §2 |
| `P9` ação auditável | §3 (registro de intervenção) |
| `P2` backend decide | §5 (fronteira de decisão) |
| `P8` observabilidade obrigatória | §3 (M-HIR) |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md) (segurança é a
2ª posição).

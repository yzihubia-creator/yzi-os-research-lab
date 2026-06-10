# YZI OS — Escalation Harness

> Camada `harness-engineering`. Detalha o harness de escalação — quando e como a operação retorna
> ao humano. Deriva da [filosofia de harness](harness-philosophy.md) e dos [contratos de
> política](../specification-engineering/policy-contracts.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[HARNESS-RT]` `[PYR]`

---

## 1. Propósito

Detalha o **escalation harness**: o substrato que decide quando uma operação deve ser escalada a
um humano e registra essa escalação. Sem implementação.

## 2. Intervenção humana é sinal diagnóstico

A intervenção humana **não é ruído**: é sinal de uma responsabilidade de governança ausente. `[HARNESS-RT]`
O harness registra cada intervenção, sua **evitabilidade** e a fronteira de governança a que
corresponde — convertendo intervenção evitável em lacuna a fechar (M-HIR). `[HARNESS-RT]`

## 3. Gatilhos de escalação por contrato

Quando escalar é definido pelos **contratos de política** (`policy-contracts`), não improvisado:
fronteiras de decisão, gates de aprovação para ações arriscadas, e limites institucionais. `[PYR]`
A escalação é governada, não ad hoc.

## 4. Gradiente de autoridade e sicofância

O harness vigia o **gradiente de autoridade**: quando a distância de capacidade entre orquestrador
e sub-agente é grande, tarefas mal-especificadas passam sem sinalização (sicofância). `[PYR]` Um
**falso pressuposto de suficiência** — não a falta de dados — é um defeito a escalar. `[PYR]`

## 5. Escalação preserva responsabilidade

A escalação mantém a responsabilidade no **operador** e evita a "zona de amortecimento moral" (o
humano formalmente responsável sem influência real). `[PYR]` O harness garante que a autoridade
delegada permaneça exercível — devolvendo ao humano o que excede a fronteira de decisão do agente.

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define o conteúdo dos gatilhos — ver [policy-contracts](../specification-engineering/policy-contracts.md) e camada `governance`.
- **Não** define UI de aprovação, fila de tarefas ou código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P9` ação auditável | §2 (registro de intervenção) |
| `P5` RAG + Policies governam agentes | §3 |
| `P8` observabilidade obrigatória | §2 (M-HIR) |
| `P2` backend decide | §5 (fronteira de decisão) |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md) (segurança é a
2ª posição).

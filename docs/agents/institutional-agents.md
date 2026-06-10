# YZI OS — Agentes Institucionais

> Camada `agents`. Define o que é um agente institucional no YZI OS. Detalha a [arquitetura de
> agentes](../architecture/agent-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[CE]`

---

## 1. Propósito

Define a natureza do **agente institucional**: interface linguística, representante da instituição,
sem autoridade operacional. Sem implementação.

## 2. O agente é interface, não decisor

O agente é a **interface linguística institucional**: recebe intenção e a traduz em operação
proposta. Ele **propõe**, não decide (services) nem executa (tools). (`P7` `P18`) Sua proposta entra
no contexto como **Metadata** — o papel de menor autoridade. `[CE]` (`P1`)

## 3. Representante institucional

O agente é o **representante digital** que age em nome da instituição, sob suas regras e
responsabilidade — não uma "IA falante" autônoma. `[PYR]` A figura accountável é o **operador**; a
responsabilidade recai sobre a instituição. `[PYR]`

## 4. Agente ≠ LLM

O agente é um construto institucional que **usa** o LLM como componente; o LLM é motor linguístico
probabilístico sem autoridade. `[PYR]` (`P1`) Trocar o modelo não altera o agente, suas policies,
sua memória ou seu contrato.

## 5. Opera dentro do tenant

Todo agente opera no perímetro de um **tenant**, com a visibilidade e os direitos atenuadamente
concedidos. `[PYR]` (`P10` `DO2`) Não vê o contexto de outros agentes nem cruza tenants.

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define ciclo de vida — ver [agent-lifecycle](agent-lifecycle.md).
- **Não** define memória — ver [agent-memory](agent-memory.md).
- **Não** define framework, prompt concreto ou código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P7` agentes são interfaces institucionais | §2, §3 |
| `P18` linguagem desacoplada da operação | §2 |
| `P1` LLM não é fonte de verdade | §4 |
| `P10`/`DO2` isolamento | §5 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

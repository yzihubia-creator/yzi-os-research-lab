# YZI OS — Governance Harness

> Camada `harness-engineering`. Detalha o harness que **aplica** a governança comportamental.
> Deriva da [filosofia de harness](harness-philosophy.md) e da [arquitetura de
> governança](../architecture/governance-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[HE-GOV]` `[PYR]`

---

## 1. Propósito

Detalha o **governance harness**: o substrato que aplica policies e contratos de forma
determinística (Enforcement). Sem implementação.

## 2. A dimensão Constraint

O governance harness é a materialização da dimensão **Constraint** da tríade: Guidance
(pré-geração) + Enforcement (pós-geração). `[HE-GOV]` Ele aplica o que as camadas
`specification-engineering` (policy-contracts) e `governance` declaram, mantendo a governança
**fora da linguagem**. (`P12`)

## 3. Enforcement determinístico

O harness produz veredito **pass/fail** independente do autor (independência de agente). `[HE-GOV]`
(`DO5`) Operação fora de policy/contrato não prossegue. A garantia é estrutural, não
probabilística.

## 4. Redução do espaço de escolha

Aplica os três mecanismos de estreitamento: **eliminação**, **canalização**, **canonicalização**.
`[HE-GOV]` Quanto mais abrangente o enforcement, mais o resultado é propriedade da governança.

## 5. Authority dentro da operação

Garante a prioridade do pacote de contexto — **Authority › … › Metadata** — de modo que o prompt
não sobreponha a governança (Paradoxo do Metadado). `[CE]` (`P1`) É também defesa contra injeção.

## 6. Convergência

A governança evolui por **Convergence**: refino iterativo das regras até idempotência estrutural
(reaplicar não muda mais). `[HE-GOV]` Gaps de enforcement são lacunas a fechar, não exceções a
tolerar.

## 7. Fronteiras (o que NÃO está aqui)

- **Não** define o conteúdo das policies — camada `governance` (posterior) e [policy-contracts](../specification-engineering/policy-contracts.md).
- **Não** coordena (runtime) nem decide (services).
- **Não** define motor de regras nem código.

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P5` RAG + Policies governam agentes | §2 |
| `P12` governança separada da linguagem | §2, §5 |
| `DO5` policy enforcement determinístico | §3, §4 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

# YZI OS — Governança de Políticas

> Camada `governance`. Detalha o modelo de governança por políticas. Complementa a [arquitetura
> de governança](../architecture/governance-architecture.md) e os [contratos de
> política](../specification-engineering/policy-contracts.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[HE-GOV]` `[PYR]` `[CE]`

---

## 1. Propósito

Define como as políticas governam o comportamento: o modelo de enforcement, não o motor de regras.
Sem implementação.

## 2. Política é enforcement determinístico

A política produz veredito **pass/fail** independente do autor (independência de agente). `[HE-GOV]`
(`DO5`) Difere de guidance, que é probabilística. A política é parte da **Authority**, não do
prompt — governança fora da linguagem. (`P12`)

## 3. Aplicação nas duas pontas

A política age **antes** da decisão (restringe o espaço de ação) e **depois** da execução (verifica
conformidade). Guidance pré não garante; só o enforcement pós comprova. `[HE-GOV]` Operação fora de
política não prossegue.

## 4. Política como Authority na operação

Dentro do pacote de contexto, a política compõe a Authority (prioridade 1), sobrepondo-se sempre ao
prompt (Metadata). `[CE]` (`P1`) É também defesa contra injeção.

## 5. Convergência das políticas

As políticas evoluem por refino iterativo até **idempotência estrutural** (reaplicar não muda
mais). `[HE-GOV]` Gaps são lacunas a fechar, não exceções a tolerar.

## 6. Política respeita a ordem de valores

Nenhuma política pode subordinar um valor superior a um inferior (verdade operacional › segurança
› isolamento multi-tenant › auditabilidade › …). A política operacionaliza essa ordem.

## 7. Fronteiras (o que NÃO está aqui)

- **Não** define o conteúdo de uma política específica — declarado em [policy-contracts](../specification-engineering/policy-contracts.md).
- **Não** define o substrato aplicador — ver [governance-harness](../harness-engineering/governance-harness.md).
- **Não** define motor de regras nem código.

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P5` RAG + Policies governam agentes | §2, §3 |
| `P12` governança separada da linguagem | §2, §4 |
| `DO5` policy enforcement determinístico | §2, §3, §5 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

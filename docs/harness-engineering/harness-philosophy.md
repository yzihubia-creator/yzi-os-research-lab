# YZI OS — Filosofia de Harness

> Camada `harness-engineering`. Define o que é um harness no YZI OS e os princípios que governam
> todos os harnesses especializados. Detalha a [arquitetura de
> runtime](../architecture/runtime-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[HE-GOV]` `[AHE]` `[HARNESS-RT]` `[CE]`

---

## 1. Propósito

Define a **filosofia de harness engineering** do YZI OS: o harness como sistema de governança e
substrato de runtime que orquestra a cognição operacional. Sem implementação.

## 2. O que é um harness

Um harness é um **substrato externo ao modelo** que media como o agente observa, age, recebe
feedback e estabelece conclusão. `[HARNESS-RT]` É, simultaneamente, um **sistema de governança da
consistência estrutural** dos artefatos. `[HE-GOV]` (`P16`) A capacidade operacional é propriedade
do sistema `modelo–harness–ambiente`, não do modelo — e o harness é o que converte capacidade
latente em comportamento auditável. `[HARNESS-RT]`

## 3. Restringir habilita autonomia

> O runtime tem de ser **restringido** para haver mais autonomia. `[HE-GOV]`

A confiança para delegar cresce na medida em que o espaço de ação é deliberadamente estreitado.
Mas restringir ≠ governar a verdade: o harness coordena e aplica fronteiras; a **autoridade**
permanece no estado, services, policies, specifications e observabilidade. (`P6` `P13`)

## 4. Constrange o que é permissível, não quem produz

O harness governa **o que pode ser produzido**, não **quem** produz. `[HE-GOV]` Daí a
**independência de agente**: com enforcement abrangente, a identidade do autor é irrelevante ao
resultado estrutural. `[HE-GOV]`

## 5. Guidance vs. Enforcement

Todo harness opera nos dois regimes: **Guidance** (pré-geração, probabilístico) e **Enforcement**
(pós-geração, determinístico). `[HE-GOV]` Guidance orienta; só Enforcement garante. (`DO5`)

## 6. A tríade Context · Constraint · Convergence

`[HE-GOV]` **Context** informa (declarativo + procedural); **Constraint** governa (Guidance +
Enforcement); **Convergence** refina iterativamente até **idempotência estrutural** (reaplicar não
muda mais). As três formam o laço de governança do harness.

## 7. Contratos falsificáveis e controlabilidade

Cada edição/decisão do harness é pareada a uma **predição falsificável**, verificada pela rodada
seguinte — tornando-se contrato versionado com reversão fina. `[AHE]` E o invariante de
**controlabilidade**: o executor não pode desligar a própria fiscalização (verificador/tracer/config
read-only). `[AHE]` É a contraparte de runtime de "confie na arquitetura, não no modelo". `[CE]`

## 8. Os harnesses do YZI OS

Esta camada especializa o harness em: **runtime** (coordenação), **governance** (enforcement),
**observability** (evidência), **retrieval** (contexto), **audit** (auditoria), **escalation**
(escalação), **execution** (execução controlada). Cada um é detalhado em documento próprio e
**coordena** seu recurso sem deter autoridade sobre a verdade operacional.

## 9. Fronteiras (o que NÃO está aqui)

- **Não** define implementação, framework, processo ou código.
- **Não** redefine a arquitetura — detalha-a.

## 10. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P16` harnesses orquestram cognição | §2, §8 |
| `P6`/`P13` runtime executa, leve | §3 |
| `P12` governança separada da linguagem | §5 |
| `DO7` rastreabilidade comportamental | §7 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

# YZI OS — Documentação Institucional

> **Índice canônico.** A documentação do YZI OS *é o produto*: uma arquitetura institucional
> completa, escrita em camadas. Este índice define a **ordem de leitura** e o papel de cada
> camada. Não há código, API, schema, frontend nem roadmap de implementação neste repositório
> de documentação — apenas arquitetura.
>
> Status: canônico · Versão: v1 · Data: 2026-06-03
> Proveniência transversal: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]` (ver
> [`terminology.md`](foundation/terminology.md))

---

## O que é o YZI OS

Uma **infraestrutura operacional cognitiva stateful, multi-tenant e governada por
especificações**, para a operação de **agentes institucionais**. É um sistema operacional para
cognição institucional — usa modelos de linguagem como componente substituível, **não** como
autoridade.

> **O YZI OS não é governado pelo LLM, pelo runtime ou pelo agente. Ele é governado pela
> combinação entre estado persistido, services institucionais, specifications, policies,
> retrieval contextual e observabilidade operacional.**

Ele **não** é chatbot, wrapper de LLM, SaaS de IA genérico, automação simples nem runtime
centrado no modelo. Ver o [Manifesto](foundation/manifesto.md) para a recusa arquitetural
completa.

---

## Por onde começar

| Você quer… | Comece por |
| --- | --- |
| A visão consolidada de todo o sistema | **[PRD Institucional v1](prd/yzi-os-prd-v1.md)** |
| Os fundamentos e princípios invioláveis | [`foundation/`](#1-foundation--fundação) |
| Entender a arquitetura como sistema | [`architecture/`](#2-architecture--arquitetura) |
| O vocabulário canônico | [`terminology.md`](foundation/terminology.md) |

A regra de resolução de conflitos entre princípios é a **ordem de valores** de
[`principles.md`](foundation/principles.md); a hierarquia entre documentos é
`manifesto` › `mission`/`philosophy` › `principles` › arquitetura › demais.

---

## Ordem de leitura canônica

### 1. `foundation/` — Fundação
O porquê e as regras invioláveis. Leia primeiro, na ordem da hierarquia.
1. [`manifesto.md`](foundation/manifesto.md) — natureza do sistema, a inversão, o que ele recusa ser.
2. [`mission.md`](foundation/mission.md) — o problema institucional e a missão.
3. [`philosophy.md`](foundation/philosophy.md) — a visão de mundo operacional (as inversões).
4. [`principles.md`](foundation/principles.md) — os 18 princípios + 10 corolários; regra de conflito.
5. [`terminology.md`](foundation/terminology.md) — vocabulário e códigos de proveniência.

### 2. `architecture/` — Arquitetura
O *o quê* do sistema: camadas, papéis e relações.
1. [`conceptual-architecture.md`](architecture/conceptual-architecture.md) — espinha dorsal: camadas e eixos de separação.
2. [`operational-architecture.md`](architecture/operational-architecture.md) — o ciclo governado de uma operação.
3. [`runtime-architecture.md`](architecture/runtime-architecture.md) — o perímetro do runtime leve.
4. [`state-architecture.md`](architecture/state-architecture.md) — estado como verdade operacional.
5. [`governance-architecture.md`](architecture/governance-architecture.md) — governança comportamental.
6. [`retrieval-architecture.md`](architecture/retrieval-architecture.md) — face contextual da governança.
7. [`observability-architecture.md`](architecture/observability-architecture.md) — auditoria e evidência.
8. [`tenant-architecture.md`](architecture/tenant-architecture.md) — multi-tenant por desenho.
9. [`service-architecture.md`](architecture/service-architecture.md) — decisão institucional.
10. [`agent-architecture.md`](architecture/agent-architecture.md) — posição do agente.

### 3. `context-engineering/` — Engenharia de Contexto
O contexto como OS do agente.
- [`context-model.md`](context-engineering/context-model.md) · [`context-lifecycle.md`](context-engineering/context-lifecycle.md) · [`context-composition.md`](context-engineering/context-composition.md) · [`authority-model.md`](context-engineering/authority-model.md) · [`retrieval-governance.md`](context-engineering/retrieval-governance.md) · [`context-isolation.md`](context-engineering/context-isolation.md) · [`context-provenance.md`](context-engineering/context-provenance.md)

### 4. `specification-engineering/` — Engenharia de Specification
As specifications como constituição.
- [`specification-philosophy.md`](specification-engineering/specification-philosophy.md) · [`operational-specifications.md`](specification-engineering/operational-specifications.md) · [`behavioral-contracts.md`](specification-engineering/behavioral-contracts.md) · [`execution-contracts.md`](specification-engineering/execution-contracts.md) · [`policy-contracts.md`](specification-engineering/policy-contracts.md) · [`tenant-contracts.md`](specification-engineering/tenant-contracts.md)

### 5. `harness-engineering/` — Engenharia de Harness
O substrato de runtime que medeia e governa.
- [`harness-philosophy.md`](harness-engineering/harness-philosophy.md) · [`runtime-harness.md`](harness-engineering/runtime-harness.md) · [`governance-harness.md`](harness-engineering/governance-harness.md) · [`observability-harness.md`](harness-engineering/observability-harness.md) · [`retrieval-harness.md`](harness-engineering/retrieval-harness.md) · [`audit-harness.md`](harness-engineering/audit-harness.md) · [`escalation-harness.md`](harness-engineering/escalation-harness.md) · [`execution-harness.md`](harness-engineering/execution-harness.md)

### 6. `runtime/` — Runtime
A mecânica operacional do runtime leve.
- [`runtime-philosophy.md`](runtime/runtime-philosophy.md) · [`runtime-lifecycle.md`](runtime/runtime-lifecycle.md) · [`runtime-state-management.md`](runtime/runtime-state-management.md) · [`runtime-execution-model.md`](runtime/runtime-execution-model.md) · [`runtime-orchestration.md`](runtime/runtime-orchestration.md)

### 7. `governance/` — Governança
A aplicação determinística das regras.
- [`policy-governance.md`](governance/policy-governance.md) · [`behavioral-governance.md`](governance/behavioral-governance.md) · [`tenant-governance.md`](governance/tenant-governance.md) · [`operational-boundaries.md`](governance/operational-boundaries.md) · [`auditability.md`](governance/auditability.md) · [`escalation-model.md`](governance/escalation-model.md)

### 8. `agents/` — Agentes
O agente como interface institucional governada.
- [`institutional-agents.md`](agents/institutional-agents.md) · [`agent-lifecycle.md`](agents/agent-lifecycle.md) · [`agent-memory.md`](agents/agent-memory.md) · [`agent-execution-model.md`](agents/agent-execution-model.md) · [`agent-governance.md`](agents/agent-governance.md)

### Consolidação
- [`prd/yzi-os-prd-v1.md`](prd/yzi-os-prd-v1.md) — **PRD Institucional v1**: integra e torna citável todas as camadas acima.

---

## As três altitudes (como as camadas se relacionam)

O mesmo conceito aparece em recortes diferentes — sem redundância nociva, porque cada camada o
trata de um ângulo distinto:

- **`architecture/`** — a **posição estrutural** do conceito no sistema.
- **`harness-engineering/`** — o **substrato** que o sustenta e governa.
- **`runtime/`** — a **mecânica operacional** que o executa.

`context-engineering`, `specification-engineering`, `governance` e `agents` aprofundam,
respectivamente, o contexto, a constituição, a aplicação das regras e a interface linguística.

---

## Convenções do corpus

- **Idioma:** PT-BR, preservando termos técnicos em inglês (runtime, harness, retrieval,
  multi-tenant).
- **Proveniência inline:** cada afirmação derivada da base teórica carrega seu código
  (`[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]`).
- **Conformidade:** cada documento traz uma tabela `P*`/`DO*` e uma seção de **fronteiras**
  ("o que NÃO está aqui").
- **Resolução de conflitos:** por **ordem de valores** (ver [`principles.md`](foundation/principles.md)),
  não por número de princípio.
- **Sem implementação:** nenhum documento contém código, API, schema, microservice, frontend
  ou pipeline de deploy.

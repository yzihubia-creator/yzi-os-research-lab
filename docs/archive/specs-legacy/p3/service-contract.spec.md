# service-contract

> **Specification documental (governança-first, contract-first, linguagem natural estruturada).**
> Primeira spec do **bloco Execution** da Onda P3. Define o que é um **service** no YZI OS — a **lógica
> institucional que decide** uma operação **dentro do contrato de specification aplicável** — e o
> **contrato mínimo** que todo service deve honrar. Service **decide**; não executa (tool), não propõe
> (agent), não coordena (runtime), não governa comportamento (policies) e não é a verdade (estado).
> **Não** é machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código, contrato técnico
> executável, código, API, configuração nem plano de implementação.
>
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## 1. Identificação da spec

| Campo | Valor |
| --- | --- |
| **Nome** | `service-contract` |
| **Arquivo** | `/docs/specs/p3/service-contract.spec.md` |
| **Classe de operação** | decisão-institucional / contrato-de-service |
| **Candidatura** | `service` (lógica institucional) + `execution-harness` (futuro) |
| **Proveniência** | `[PYR]` `[HE-GOV]` `[HARNESS-RT]` |

## 2. Status, camada, onda e owner arquitetural

| Campo | Valor |
| --- | --- |
| **Status** | proposta para aprovação · Versão v1 · Data 2026-06-03 |
| **Camada** | `services` (decisão institucional) |
| **Onda** | P3 (Execution + Observability) — bloco Execution (primeira) |
| **Owner arquitetural** | Services / Governança |
| **Tenant-scope** | Per-tenant |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P2` (backend decide), `P14` (services/tools executam), `P15` (specifications governam contratos), `DO4`, `DO5`.
- [`/docs/architecture/service-architecture.md`](../../architecture/service-architecture.md) — services decidem dentro de contratos; services vs. tools; services não coordenam/não governam/não são a verdade.
- [`/docs/specification-engineering/execution-contracts.md`](../../specification-engineering/execution-contracts.md) — execução controlada por contrato; decidir≠executar; contract-first; verificação vinculada.
- [`/docs/architecture/operational-architecture.md`](../../architecture/operational-architecture.md) §3.3, §4 — services decidem no ciclo governado.

---

## 3. Propósito

Fixar, como **contrato operacional verificável**, o que é um **service** no YZI OS e qual **contrato
mínimo** ele deve honrar. O service é a camada da **lógica institucional, das regras e das validações**
que **decide** a operação (`P2`) — **dentro** do contrato de specification aplicável (`P15`), nunca
livremente. A decisão é propriedade de **lógica institucional verificável**, não de geração
probabilística: o modelo informa, os services decidem, o estado registra.

A spec **extrai** (não inventa nem resume) o princípio "o backend decide" e a fronteira decidir≠executar.
**Abre o bloco Execution** da Onda P3; nenhum service é implementado antes de seu contrato aprovado.

---

## 4. Escopo

- Definir o service como lógica institucional que **decide** dentro de contrato (§6, §7).
- Distinguir service de tool, agent, prompt, runtime e LLM (§8).
- Definir o **contrato mínimo de service** (§9), as **decisões possíveis** (§10) e o que o service
  **valida**.
- Definir as relações com tenant scope, estado, policies/boundaries, escalation, futura tool execution e
  o bloco Observability (trace/log/verification/attribution/entropy/intervention).
- Definir **quando bloquear, pendenciar evidência ou escalar**.

## 5. Fora de escopo

- **Não** define a **execução** (tools) — isso é `tool-execution`/`tool-registry`/`tool-permission`
  (futuras).
- **Não** define **teste técnico**: o service é testável **por contrato** no futuro, mas esta spec não
  define teste.
- **Não** define microservices, APIs, endpoints, schema nem código; **não** infere stack; **não**
  implementa service algum (implementação só após contrato aprovado).
- **Não** cria tool, skill, subagente, harness executável, frontend, backlog, sprint plan, YAML/JSON,
  contrato machine-readable ou implementation harness; **não** reposiciona o YZI OS.

---

## 6. Definição de service

**Service** é a camada da **lógica institucional** que **decide** uma operação **dentro do contrato de
specification aplicável**. Características:

1. **Decide (não executa):** determina **o que** fazer; a tool realiza a ação (§8).
2. **Dentro de contrato:** decide dentro da specification aplicável (`P15`), nunca livremente.
3. **Verificável e contract-first:** só decide/delega o que tem **método de verificação precisamente
   definido**; caso contrário, decompõe até cada parte ser verificável.
4. **Concentra validação:** aplica as regras que determinam se uma operação é admissível, coerente e
   conforme.

---

## 7. Service como lógica institucional

1. **O backend decide** (`P2`): a autoridade decisória reside no service, **não** na linguagem nem no
   runtime.
2. O service **preserva o estado como verdade operacional**: decide sobre o estado, mas **não é** a
   verdade — a verdade é o estado.
3. O service **não acumula** coordenação (runtime) nem governança de comportamento (policies): contém a
   **lógica de decisão institucional** — e apenas isso.
4. O service **NÃO dá ao LLM, agente, prompt ou runtime autoridade operacional**: nenhum deles decide a
   operação em seu lugar.

---

## 8. Diferença entre service, tool, agent, prompt, runtime e LLM

| Peça | Papel | Autoridade |
| --- | --- | --- |
| **Service** | **decide** (lógica institucional, dentro de contrato) | sobre a decisão, dentro do contrato |
| **Tool** | **executa** (sob permissão explícita) | nenhuma — age sob permissão |
| **Agent** | **propõe** (interface linguística) | Metadata |
| **Prompt** | instrução pontual | Metadata (menor) |
| **Runtime** | **coordena** (leve) | coordenação; não decide a verdade |
| **LLM** | motor probabilístico | nenhuma autoridade operacional |

**Service decision ≠ tool execution:** o service pode **solicitar** tool execution futura, mas **decidir**
não é **executar** — confundi-los é erro de arquitetura (§15).

---

## 9. Contrato mínimo de service

Todo contrato de service **DEVE** declarar, em linguagem natural estruturada:

1. A **classe de operação** que decide e a **specification** dentro da qual decide (`P15`).
2. O que **valida**: **intenção operacional, estado operacional, tenant scope, policy pack, retrieval
   scope, permissions, evidência mínima, authority layer, contexto relevante e limites da operação**.
3. As **decisões possíveis** (§10).
4. O **método de verificação** (requisitos ↔ evidência determinística), contract-first.
5. A **evidência** que produz/alimenta (episode trace, audit log, eventos).
6. As **fronteiras** que não pode ultrapassar (tenant, policy, estado, authority).
7. A **proveniência** e a autoridade que o define.

O service é **testável futuramente por contrato**; esta spec **não** define teste técnico. Um service
**não pode ser implementado antes de seu contrato estar aprovado**.

---

## 10. Decisões possíveis de service

Toda decisão de service é **uma** destas, registrada e verificável:

| Decisão | Significado |
| --- | --- |
| **Autorizar** | a operação é admissível dentro do contrato; pode prosseguir |
| **Bloquear** | a operação viola contrato/policy/fronteira; não prossegue |
| **Pendenciar evidência** | falta evidência mínima; aguarda até existir |
| **Escalar** | excede a fronteira automática; segue para o operador (registrado) |

O service **pode solicitar tool execution futura** após autorizar — mas a decisão (service) e a execução
(tool) permanecem **distintas** (§15).

---

## 11. Relação com tenant scope

O service **valida o tenant scope** e **preserva a fronteira de tenant** ([`tenant-boundary`](../p0/tenant-boundary.spec.md),
[`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md), [`tenant-retrieval-scope`](../p2/tenant-retrieval-scope.spec.md)):
nenhuma decisão de service cruza tenant; **tenant ambiguity** leva a bloqueio/pendência/escalada (§23).

## 12. Relação com estado operacional

O service **preserva o estado como verdade operacional** ([`operational-state`](../p1/operational-state.spec.md)):
decide sobre o estado lido, mas não o inventa nem o sobrescreve implicitamente. Quando a decisão **altera
estado** ou **bloqueia uma alteração relevante**, o service **DEVE produzir evento auditável**
([`event-driven-state`](../p1/event-driven-state.spec.md)) — o estado evolui por evento, não por mutação.

## 13. Relação com policies e boundaries

O service decide **dentro** das policies e fronteiras: **honra** [`operational-boundaries`](../p2/operational-boundaries.spec.md),
valida o [`tenant-policy-pack`](../p2/tenant-policy-pack.spec.md) e opera sob o enforcement determinístico
de [`policy-enforcement`](../p2/policy-enforcement.spec.md). A **validação** do service (decisão) é a
contraparte do **enforcement** da governança (permissão): juntas impedem operação fora de contrato/política.

## 14. Relação com escalation

O service **não substitui** a [`escalation-policy`](../p2/escalation-policy.spec.md): ele **pode escalar**
uma operação (decisão §10), mas a escalação como mecanismo de governança permanece definida por aquela
spec. Decisão escalada só vira verdade após retorno do operador e validação.

## 15. Relação com futura tool execution

O service **pode solicitar tool execution futura**, mas **NÃO DEVE confundir service decision com tool
execution**: decidir (service) precede e governa executar (tool, sob permissão explícita, `P14`). Quando
existirem, `tool-permission`/`tool-execution` herdam essa fronteira. Esta spec **prepara** a solicitação
sem criar tool alguma.

## 16. Relação com episode trace e audit log

**Toda decisão de service DEVE gerar ou alimentar** [`episode-trace`](episode-trace.spec.md) e
[`audit-log`](audit-log.spec.md): o que foi decidido, com qual evidência, qual tenant e qual camada
responsável — de forma proveniente e tenant-scoped.

## 17. Relação com verification report

A decisão de service **DEVE ser verificável** por [`verification-report`](verification-report.spec.md):
requisitos ↔ evidência determinística. Decisão sem evidência mínima não é "verificada".

## 18. Relação com failure attribution

**Falha de service DEVE ser atribuível** por [`failure-attribution`](failure-attribution.spec.md): a
falha aponta a decisão/camada/contrato envolvido, **sem** culpa genérica e **antes** de qualquer correção.

## 19. Relação com entropy audit

**Entropia causada por service DEVE ser auditável** por [`entropy-audit`](entropy-audit.spec.md): deriva,
resíduo ou enfraquecimento de verificação introduzidos por uma decisão são tratados dentro do laço (`DO10`).

## 20. Relação com intervention log

**Intervenção humana/institucional relacionada a service DEVE ser registrada** por
[`intervention-log`](intervention-log.spec.md): como sinal diagnóstico de um déficit de governança na
decisão, não como falha escondida.

---

## 21. Critérios de aceite

1. Define o service como lógica institucional que **decide dentro de contrato** (§6, §7) e o distingue de
   tool/agent/prompt/runtime/LLM (§8).
2. Fixa o **contrato mínimo** (§9), incluindo a lista de validação, e as **decisões possíveis** (§10).
3. Preserva o estado como verdade e produz eventos ao alterar/bloquear alteração relevante (§12).
4. Honra policies/boundaries, não substitui escalation, e mantém service decision ≠ tool execution
   (§13–§15).
5. Liga toda decisão a trace/log e a torna verificável/atribuível/auditável/registrável pelo bloco
   Observability (§16–§20).
6. Não dá autoridade ao LLM/agente/prompt/runtime; service não é implementado antes do contrato aprovado;
   revisável por humano.

## 22. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Faz o service decidir **fora** de contrato, ou confunde decidir com executar/coordenar/governar.
2. Confunde service decision com tool execution, ou executa tool sem permissão explícita.
3. Dá ao LLM/agente/prompt/runtime autoridade operacional sobre a decisão.
4. Trata o service como a verdade (em vez do estado), ou altera estado sem evento auditável.
5. Substitui a escalation-policy, ou ignora tenant scope/boundary.
6. Não gera/alimenta trace/log, ou produz decisão sem evidência mínima/verificação.
7. Permite implementar o service antes do contrato aprovado, ou define teste técnico/stack.
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 23. Quando bloquear, pendenciar evidência ou escalar

1. **Bloquear** quando a operação violar contrato, policy, fronteira de tenant ou authority.
2. **Pendenciar evidência** quando faltar evidência mínima para decidir.
3. **Escalar** quando exceder a fronteira automática, houver conflito não resolvido, ou exigir autoridade
   humana. **Ausência, ambiguidade ou conflito no contrato de service** **DEVE** gerar **bloqueio,
   pendência de evidência ou escalada** — nunca decisão silenciosa.

## 24. Riscos arquiteturais evitados

- **Decisão delegada ao modelo** — inferência decidindo no lugar do backend (`P2`).
- **Decisão fora de contrato** — service decidindo livremente.
- **Confusão decidir/executar** — service decision tratada como tool execution.
- **Autoridade indevida** — LLM/agente/prompt/runtime ganhando autoridade operacional.
- **Mudança implícita de estado** — alterar/bloquear sem evento auditável.
- **Implementação prematura** — service implementado antes do contrato aprovado.

## 25. Dependências

[`operational-state`](../p1/operational-state.spec.md), [`event-driven-state`](../p1/event-driven-state.spec.md),
[`tenant-boundary`](../p0/tenant-boundary.spec.md), [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md),
[`layer-authority-model`](../p0/layer-authority-model.spec.md), [`policy-enforcement`](../p2/policy-enforcement.spec.md),
[`operational-boundaries`](../p2/operational-boundaries.spec.md), [`escalation-policy`](../p2/escalation-policy.spec.md),
[`tenant-policy-pack`](../p2/tenant-policy-pack.spec.md), [`tenant-retrieval-scope`](../p2/tenant-retrieval-scope.spec.md),
[`episode-trace`](episode-trace.spec.md), [`audit-log`](audit-log.spec.md),
[`verification-report`](verification-report.spec.md), [`failure-attribution`](failure-attribution.spec.md),
[`entropy-audit`](entropy-audit.spec.md), [`intervention-log`](intervention-log.spec.md).

## 26. Próxima spec recomendada

`tool-registry` (registro de tools), depois `tool-permission`, `tool-execution`, `tool-result-verification`
— ver [Specification Map](../../specification-engineering/specification-map.md). **Recomendação, não
autorização.** Esta spec **não** inicia `tool-registry`.

## 27. Checkpoint

Spec única criada: `/docs/specs/p3/service-contract.spec.md`. Documental, governance-first, contract-first,
em linguagem natural estruturada. **Abre o bloco Execution** da Onda P3. Não cria nenhuma outra spec,
tool, service, skill, subagente, harness, código, API, schema, YAML/JSON nem contrato machine-readable.
Conformidade com `P2`/`P14`/`P15`/`DO4`/`DO5` e com a ordem de valores (verdade operacional 1ª; governança
institucional 5ª). Aguarda revisão e aprovação humana.

---

## Proveniência

`[PYR]` Context→Intent→Specification — decisão dentro do contrato; contract-first; decidir≠executar.
`[HE-GOV]` Harness Engineering / Governança — validação como contraparte do enforcement; operação fora de
contrato não prossegue. `[HARNESS-RT]` AI Harness Runtime — services decidem, tools executam sob permissão;
trace por decisão.

## Fronteiras (o que NÃO está aqui)

- **Não** substitui `P2`/`P14`/`P15` nem a arquitetura de services: é a spec que os **opera** como
  contrato de service verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza `tool-registry` nem nenhuma spec futura — apenas fixa o contrato de service que as
  demais herdam.

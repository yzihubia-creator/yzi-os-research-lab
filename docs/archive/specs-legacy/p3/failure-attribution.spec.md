# failure-attribution

> **Specification documental (governança-first, observability-first, linguagem natural estruturada).**
> Terceira spec da **Onda P3 (Execution + Observability)**. Define como o YZI OS **atribui falhas
> operacionais** de forma **auditável, revisável e não destrutiva** — sem culpar genericamente o LLM, o
> agente, o usuário ou o runtime. A atribuição **explica** a falha (separando observação, comportamento
> esperado e diagnóstico) e ocorre **antes** de qualquer ação corretiva; **não** altera estado nem
> corrige automaticamente. **Não** é machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código,
> contrato técnico executável, código, API, configuração nem plano de implementação.
>
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## 1. Identificação da spec

| Campo | Valor |
| --- | --- |
| **Nome** | `failure-attribution` |
| **Arquivo** | `/docs/specs/p3/failure-attribution.spec.md` |
| **Classe de operação** | atribuição-de-falha / observabilidade |
| **Candidatura** | `harness` (`audit-harness` + `observability-harness`) |
| **Proveniência** | `[HARNESS-RT]` `[CE]` `[PYR]` `[AHE]` |

## 2. Status, camada, onda e owner arquitetural

| Campo | Valor |
| --- | --- |
| **Status** | proposta para aprovação · Versão v1 · Data 2026-06-03 |
| **Camada** | `observability` / `audit` |
| **Onda** | P3 (Execution + Observability) |
| **Owner arquitetural** | Observabilidade / Governança |
| **Tenant-scope** | Per-tenant |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P8`, `P9`, `DO6`, `DO9` (verificação como runtime; atribuição antes de recuperação), `DO10`.
- [`/docs/architecture/observability-architecture.md`](../../architecture/observability-architecture.md) §5 — atribuição separa observação/comportamento esperado/diagnóstico; ocorre antes de nova ação; auditor independente.
- [`/docs/architecture/operational-architecture.md`](../../architecture/operational-architecture.md) §5 — reproduzir→atribuir→corrigir→verificar→reportar; separa comportamento da operação de qualidade da evidência.
- [`/docs/harness-engineering/audit-harness.md`](../../harness-engineering/audit-harness.md) §2–§3 — atribuição antes de recuperação; quem executa não audita.

---

## 3. Propósito

Fixar, como **contrato operacional verificável**, **como o YZI OS atribui falhas operacionais**: de
forma **auditável, revisável e não destrutiva**, identificando **onde** a falha ocorreu e **qual camada,
contrato, policy, specification, estado, evento, contexto, retrieval, agent, runtime coordination ou
futura tool/service** está envolvida — **sem culpar genericamente** o LLM, o agente, o usuário ou o
runtime. A atribuição **separa causa provável de evidência insuficiente** e preserva a **responsabilidade
institucional**.

A spec **extrai** (não inventa nem resume) a atribuição de falha da arquitetura de observabilidade e da
disciplina de verificação. É a terceira spec da Onda P3 e apoia `verification-report`, `entropy-audit` e
`intervention-log` futuros.

---

## 4. Escopo

- Definir o que é failure attribution e o que ela produz (explicação auditável, não culpa).
- Definir os **tipos de falha operacional**, a **evidência mínima** e os **graus de confiança**.
- Definir **quando registrar "causa indeterminada com evidência insuficiente"**.
- Definir as relações com episode-trace, audit-log, state/event, governance/context/retrieval, futuras
  tools/services, agents/runtime e observabilidade/auditoria.
- Definir **quando bloquear, pendenciar evidência ou escalar**.

## 5. Fora de escopo

- **Não** corrige a falha nem altera estado operacional (apenas atribui).
- **Não** define verification report, entropy audit nem intervention log em detalhe — apenas os apoia.
- **Não** define dashboards, formato de log nem pipelines técnicos.
- **Não** cria tool, service, skill, subagente, harness, código, API, schema, frontend, backlog, sprint
  plan, YAML/JSON, contrato machine-readable ou implementation harness; **não** infere stack técnica;
  **não** reposiciona o YZI OS.

---

## 6. Definição de failure attribution

**Failure attribution** é a **explicação auditável** de uma falha operacional: o procedimento que
**separa observação, comportamento esperado e diagnóstico** e atribui a falha à **camada/origem**
envolvida, com **evidência** e **grau de confiança** — **antes** de qualquer nova ação corretiva (`DO9`).
Características:

1. **Explicação, não culpa:** identifica onde/por que a falha ocorreu; **não** imputa genericamente a um
   ator.
2. **Antes da correção:** ocorre antes de qualquer recuperação, evitando "remendos aleatórios" (`[HARNESS-RT]`).
3. **Auditável, revisável e não destrutiva:** reconstruível, revisável por humano, sem apagar/alterar
   evidência ou estado.
4. **Proveniente e tenant-scoped:** preserva proveniência, tenant scope e authority layer.

---

## 7. Failure attribution como explicação auditável, não culpa genérica

1. A atribuição **NÃO DEVE culpar genericamente o LLM** — a probabilidade do modelo não é, por si,
   diagnóstico; o LLM é Metadata, sem autoridade operacional.
2. A atribuição **NÃO DEVE culpar genericamente o usuário** — "erro do usuário" sem evidência é
   atribuição vazia.
3. A atribuição **NÃO DEVE** imputar a falha vagamente ao "runtime" ou ao "agente": deve apontar a
   **camada/contrato/policy/specification/estado/evento/contexto/retrieval** específico, com evidência.
4. Vale o **auditor independente**: quem executou a operação **não** atribui a própria falha (`[CE]`).
5. A atribuição **preserva a responsabilidade institucional**: a responsabilidade é da instituição/
   operador, tornada **exercível** pela explicação, não diluída em um ator abstrato.

---

## 8. Tipos de falha operacional

A falha é classificada por **onde** ocorreu, nunca por "quem é culpado genericamente":

| Tipo | Origem provável |
| --- | --- |
| **Falha de contexto** | contexto mal montado/insuficiente/contaminado (`context-assembly`/`context-isolation`) |
| **Falha de retrieval** | recuperação fora de escopo/sem proveniência (`retrieval-governance`/`tenant-retrieval-scope`) |
| **Falha de policy/specification** | contrato/policy violado ou ausente (`behavioral-governance`/`policy-enforcement`) |
| **Falha de enforcement** | veredito não aplicado ou contornado (`policy-enforcement`) |
| **Falha de estado/evento** | estado inconsistente ou evento não auditável (`operational-state`/`event-driven-state`) |
| **Falha de fronteira** | tentativa/ocorrência de travessia de tenant ou de authority (`tenant-boundary`) |
| **Falha de coordenação (runtime)** | coordenação que ampliou escopo ou não acionou registro |
| **Falha de agent boundary** | proposta fora do papel/escopo do agente |
| **Falha de tool/service (futura)** | quando existirem, execução fora de permissão (`P14`) |
| **Causa indeterminada** | evidência insuficiente para atribuir com segurança (§11) |

---

## 9. Evidência mínima para atribuição

Toda atribuição **DEVE** registrar, reconstruível a partir de [`episode-trace`](episode-trace.spec.md) e
[`audit-log`](audit-log.spec.md):

- **Saída observada** (o que ocorreu) e **comportamento esperado** (segundo spec/contrato).
- **Tipo de falha** (§8) e a **camada/origem** envolvida.
- **Evidência** que sustenta a atribuição e **explicações alternativas** consideradas.
- **Evidência ausente**, quando a sua falta motivar bloqueio/pendência/escalada.
- **Tenant, authority layer e proveniência** do que foi atribuído.
- **Ação diagnóstica recomendada** (próximo passo), **impacto**, **severidade** e **se exige escalada**.

A falha **DEVE** ser classificada **sem inventar evidência**.

---

## 10. Graus de confiança da atribuição

| Grau | Significado |
| --- | --- |
| **Causa determinada** | evidência suficiente e consistente aponta a origem; atribuição de alta confiança |
| **Causa provável** | evidência parcial sugere origem; atribuição com confiança declarada e alternativas registradas |
| **Causa indeterminada com evidência insuficiente** | não há evidência segura para atribuir; resultado §11 |

O grau é **declarado e auditável** — pareável a uma predição falsificável (decision observability, `DO7`)
verificada contra o resultado seguinte. Nunca se eleva o grau sem evidência correspondente.

---

## 11. Quando registrar causa indeterminada

Quando a causa **não puder ser determinada com segurança**, o resultado **DEVE** ser:

> **"causa indeterminada com evidência insuficiente"**, com **pendência de evidência ou escalada**.

Nunca se **inventa evidência** nem se **força** uma atribuição para "fechar" o caso. A ausência de
evidência é, ela própria, registrada como fato auditável ([`escalation-policy`](../p2/escalation-policy.spec.md)).

---

## 12. Relação com episode-trace

A atribuição **deriva** do [`episode-trace`](episode-trace.spec.md): a falha **DEVE** ser reconstruível a
partir do trace do episódio (o que aconteceu, estado lido, contexto, retrieval, decisões, camada
responsável, resultado). Sem trace reconstruível, não há atribuição segura — registra-se causa
indeterminada (§11).

## 13. Relação com audit-log

A atribuição apoia-se no [`audit-log`](audit-log.spec.md) como trilha institucional: cross-episódio,
proveniente e tenant-scoped. Ausência/corrupção/inconsistência do audit log que impeça atribuir leva a
bloqueio/pendência/escalada. A própria atribuição entra no audit log como registro **não destrutivo**.

## 14. Relação com state/event specs

A atribuição lê — mas **não altera** — o estado ([`operational-state`](../p1/operational-state.spec.md))
e referencia os eventos ([`event-driven-state`](../p1/event-driven-state.spec.md)). Uma falha pode ser de
estado inconsistente ou de evento não auditável; a atribuição a aponta **sem** mutar estado por si só
(§16) e respeita [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md).

## 15. Relação com governance/context/retrieval specs

A atribuição usa os contratos de governança e contexto como **referência de comportamento esperado**:
[`policy-enforcement`](../p2/policy-enforcement.spec.md), [`behavioral-governance`](../p2/behavioral-governance.spec.md),
[`operational-boundaries`](../p2/operational-boundaries.spec.md), [`context-assembly`](../p2/context-assembly.spec.md),
[`context-isolation`](../p2/context-isolation.spec.md), [`context-provenance`](../p2/context-provenance.spec.md),
[`retrieval-governance`](../p2/retrieval-governance.spec.md). A divergência entre o esperado (contrato) e
o observado (trace) é a base da atribuição.

## 16. Relação com futuras tools/services

Quando **existirem**, tools/services entram como possível origem de falha (execução fora de permissão,
resultado não verificado). Esta spec **prepara** essa classificação (§8) **sem** criar tool/service nem
inferir sua execução.

## 17. Relação com agents e runtime coordination

O **agente** pode ser origem de falha apenas no seu papel (proposta fora de escopo), **não** como "culpa
genérica"; o **runtime** pode ser origem por coordenação (ampliação de escopo, registro não acionado),
**não** como decisor de verdade. A atribuição aponta a **responsabilidade da camada**, respeitando o
[`layer-authority-model`](../p0/layer-authority-model.spec.md).

## 18. Relação com observabilidade e auditoria

A atribuição é parte da camada de **observabilidade** (que comprova) e do **audit-harness**: ocorre
**antes** da recuperação (`DO9`), com **auditor independente**, e alimenta a auditoria de entropia
(`DO10`). É **read-only para o executor** (invariante de controlabilidade).

---

## 19. Critérios de aceite

1. Define failure attribution como explicação auditável (não culpa genérica) (§6, §7).
2. Distingue **causa provável** de **evidência insuficiente**; classifica sem inventar evidência.
3. Não culpa genericamente o LLM nem o usuário; aponta camada/origem específica com evidência.
4. Exige reconstrução a partir de episode-trace e audit-log; respeita tenant scope/boundary.
5. Fixa evidência mínima (§9), graus de confiança (§10) e a regra de causa indeterminada (§11).
6. É auditável, revisável e **não destrutiva**; não altera estado nem corrige automaticamente (§16–17).
7. Indica que revisão a falha exige (§18-condição) e quando bloquear/pendenciar/escalar (§21).

## 20. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Culpa genericamente o LLM, o usuário, o agente ou o runtime, sem evidência/camada específica.
2. Inventa evidência ou força atribuição quando a causa é indeterminada.
3. Não permite reconstrução a partir de episode-trace/audit-log.
4. Cruza/expõe outro tenant, ou ignora authority layer/proveniência.
5. Altera estado operacional por si só, ou corrige a falha automaticamente.
6. É destrutiva (apaga/sobrescreve evidência) ou não revisável por humano.
7. Permite que quem executou atribua a própria falha (quebra auditor independente).
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; infere stack; transforma em plano de
   implementação; ou reposiciona o YZI OS.

---

## 21. Quando bloquear, pendenciar evidência ou escalar

1. **Bloquear** execução futura quando a falha indicar violação de fronteira/policy/estado não resolvida.
2. **Pendenciar evidência** quando a atribuição depender de evidência ainda inexistente (causa
   indeterminada, §11).
3. **Escalar** quando a causa exigir autoridade humana, quando houver conflito não resolvido, ou quando a
   falha exigir **revisão de spec, policy, state, retrieval, context, tool/service futuro, agent
   boundary, tenant config ou operação humana**.

A atribuição **indica** qual dessas revisões a falha exige — mas **não** a executa.

---

## 22. Riscos arquiteturais evitados

- **Culpa genérica** — "foi o LLM/o usuário" sem evidência nem camada (atribuição vazia).
- **Remendo aleatório** — correção antes do diagnóstico (`DO9`).
- **Evidência inventada** — fechar a causa sem suporte.
- **Atribuição destrutiva** — apagar/alterar evidência ou estado ao atribuir.
- **Auto-absolvição** — quem executou atribuindo a própria falha.
- **Vazamento cross-tenant** — atribuição expondo outro tenant.

---

## 23. Dependências

[`episode-trace`](episode-trace.spec.md), [`audit-log`](audit-log.spec.md),
[`operational-state`](../p1/operational-state.spec.md), [`event-driven-state`](../p1/event-driven-state.spec.md),
[`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md),
[`layer-authority-model`](../p0/layer-authority-model.spec.md), [`policy-enforcement`](../p2/policy-enforcement.spec.md),
[`escalation-policy`](../p2/escalation-policy.spec.md), [`context-provenance`](../p2/context-provenance.spec.md),
[`retrieval-governance`](../p2/retrieval-governance.spec.md).

## 24. Próxima spec recomendada

`verification-report` (relatório de verificação requisitos↔evidência), depois `entropy-audit` e
`intervention-log` — ver [Specification Map](../../specification-engineering/specification-map.md).
**Recomendação, não autorização.** Esta spec **não** inicia `verification-report`.

## 25. Checkpoint

Spec única criada: `/docs/specs/p3/failure-attribution.spec.md`. Documental, governance-first,
observability-first, em linguagem natural estruturada. Não cria nenhuma outra spec, tool, service,
skill, subagente, harness, código, API, schema, YAML/JSON nem contrato machine-readable. Conformidade
com `P8`/`P9`/`DO6`/`DO9`/`DO10` e com a ordem de valores (auditabilidade, 4ª posição). Aguarda revisão e
aprovação humana.

---

## Proveniência

`[HARNESS-RT]` AI Harness Runtime — atribuição antes de recuperação; separa observação/esperado/
diagnóstico; classifica resultado. `[CE]` Context Engineering — auditor independente; proveniência;
trilha orgânica. `[PYR]` Context→Intent→Specification — responsabilidade institucional à origem. `[AHE]`
Agentic Harness Engineering — decision observability (predição falsificável); controlabilidade read-only.

## Fronteiras (o que NÃO está aqui)

- **Não** substitui `DO9` nem a arquitetura de observabilidade: é a spec que os **opera** como contrato
  de atribuição de falha verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma spec futura da Onda P3 — apenas fixa a atribuição de falha que as demais
  herdam.

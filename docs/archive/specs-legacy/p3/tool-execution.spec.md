# tool-execution

> **Specification documental (governança-first, execution-aware, linguagem natural estruturada).**
> Quarta spec do **bloco Execution** da Onda P3. Define a **tool execution** do YZI OS: a **execução
> operacional controlada** de uma tool **registrada**, que só ocorre **após service decision válida** e
> **tool permission explícita registrada**. **Execution ≠ decisão (service) ≠ permissão ≠ registro.** O
> runtime **aciona, não decide**; LLM/agente/prompt **não executam tool diretamente**; cada invocação é
> **traçada**. Execução produz efeito operacional e, por isso, **exige verificação posterior**. **Não** é
> machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código, contrato técnico executável,
> código, API, configuração nem plano de implementação.
>
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## 1. Identificação da spec

| Campo | Valor |
| --- | --- |
| **Nome** | `tool-execution` |
| **Arquivo** | `/docs/specs/p3/tool-execution.spec.md` |
| **Classe de operação** | execução-operacional-controlada |
| **Candidatura** | `harness` (`execution-harness` + `runtime-harness`, futuros) |
| **Proveniência** | `[HARNESS-RT]` `[PYR]` `[HE-GOV]` |

## 2. Status, camada, onda e owner arquitetural

| Campo | Valor |
| --- | --- |
| **Status** | proposta para aprovação · Versão v1 · Data 2026-06-04 |
| **Camada** | `tools` (execução controlada) / `runtime` (acionamento) |
| **Onda** | P3 (Execution + Observability) — bloco Execution (quarta) |
| **Owner arquitetural** | Execution / Runtime |
| **Tenant-scope** | Per-tenant |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P14` (services/tools executam), `P6` (runtime executa, não governa), `P2`, `P1`, `DO4`, `DO5`, `DO9`.
- [`/docs/runtime/runtime-execution-model.md`](../../runtime/runtime-execution-model.md) §2, §4, §5 — runtime aciona, não decide; execução sob permissão e contrato, cada invocação traçada; verificação acionada, não julgada.
- [`/docs/harness-engineering/execution-harness.md`](../../harness-engineering/execution-harness.md) §2–§5 — execução sob fronteira de permissão; gates; decidir≠executar; entropia da execução.
- [`/docs/architecture/service-architecture.md`](../../architecture/service-architecture.md) §4 e [`/docs/architecture/operational-architecture.md`](../../architecture/operational-architecture.md) §3.4, §4 — tools executam sob permissão, com trace.

---

## 3. Propósito

Fixar, como **contrato operacional verificável**, o que é a **tool execution**: a **execução operacional
controlada** de uma tool **registrada** ([`tool-registry`](tool-registry.spec.md)), que realiza **o
efeito da operação no mundo** — mas **só** após **service decision válida** ([`service-contract`](service-contract.spec.md))
e **tool permission explícita registrada** ([`tool-permission`](tool-permission.spec.md)). A execução
**não decide** (isso é do service) e **não se autoriza** (isso é da permissão): ela **realiza** sob
permissão, com trace. O runtime **aciona, não decide**; o modelo apenas descreve a invocação.

A spec **extrai** (não inventa nem resume) a execução sob permissão e contrato. É a quarta spec do bloco
Execution; **executar é a última etapa**, e por produzir efeito **exige verificação posterior**.

---

## 4. Escopo

- Definir a tool execution como execução operacional controlada de tool registrada, **após** decisão e
  permissão (§6, §7).
- Distinguir **execution ≠ decisão (service) ≠ permissão ≠ registro** (§8).
- Definir o **registro mínimo de execução** (§9) e a obrigação de **evento auditável** ao causar efeito.
- Definir as relações com tenant scope, service/permission/registry, policies/boundaries, runtime e o
  bloco Observability (trace/log/verification/attribution/entropy/intervention).
- Definir **quando bloquear, pendenciar evidência ou escalar**.

## 5. Fora de escopo

- **Não** define a **verificação do resultado** (`tool-result-verification`) — apenas a **execução** e a
  referencia (a execução **exige** verificação posterior).
- **Não** decide (service), **não** autoriza (permission) nem **registra** a tool (registry).
- **Não** integra tool externa concreta, nem cria endpoint, API, schema ou código; **não** infere stack;
  **não** implementa execução alguma.
- **Não** cria tool, service, skill, subagente, harness executável, frontend, backlog, sprint plan,
  YAML/JSON, contrato machine-readable ou implementation harness; **não** reposiciona o YZI OS.

---

## 6. Definição de tool execution

**Tool execution** é a **execução operacional controlada** de uma tool registrada. Características:

1. **Realiza o efeito:** produz o efeito da operação no mundo; as tools **executam**, não decidem.
2. **Pré-condicionada:** só ocorre **após service decision válida** e **tool permission explícita
   registrada**, sobre uma tool **registrada no tool registry**.
3. **Traçada:** **cada invocação é traçada** e alimenta o episode trace e o audit log.
4. **Produz efeito → exige verificação:** porque causa efeitos operacionais, a execução **exige
   verificação posterior** ([`verification-report`](verification-report.spec.md), `tool-result-verification`
   futura).
5. **Sem autoridade própria:** executar **não** confere autoridade; a tool age **sob** permissão.

---

## 7. Tool execution como etapa final controlada

1. **Ordem obrigatória:** registro → decisão (service) → permissão → **execução** → verificação. A
   execução é a **última etapa de ação** e só ocorre quando as anteriores estão satisfeitas.
2. **O runtime aciona, não decide:** pode coordenar a execução, mas **não decide sozinho se a tool deve
   executar** (`P6`). **LLM, agente e prompt não executam tool diretamente** nem por inferência (`P1`).
3. **Execução não amplia escopo:** a execução **NÃO PODE ampliar o escopo concedido pela permission**
   nem contornar a governança (§16).
4. **Tool execution ≠ service decision ≠ tool permission:** executar não é decidir nem autorizar.

---

## 8. Execution ≠ registro ≠ decisão ≠ permissão

| Etapa | Spec | O que estabelece |
| --- | --- | --- |
| **Registro** | [`tool-registry`](tool-registry.spec.md) | que a tool **existe**, descrita e governada |
| **Decisão** | [`service-contract`](service-contract.spec.md) | que a operação foi **decidida** dentro de contrato |
| **Permissão** | [`tool-permission`](tool-permission.spec.md) | **quando/para quem/sob que limites** a tool pode ser usada |
| **Execução** | `tool-execution` (esta) | a **realização** da ação, sob permissão, com trace |
| **Verificação** | `tool-result-verification` (futura) | a **comprovação** do resultado por evidência |

Esta spec fixa **apenas a execução**. Executar **não** registra, **não** decide e **não** autoriza.

---

## 9. Registro mínimo de uma execução

Cada execução **DEVE** registrar, em linguagem natural estruturada:

| Elemento | O que registra |
| --- | --- |
| **Tool executada** | qual tool (registrada) executou |
| **Tenant** | o tenant da execução |
| **Service decision relacionada** | a decisão que a precedeu |
| **Permission relacionada** | a permissão que a autorizou |
| **Estado/contexto relevante** | o estado lido e o contexto pertinente |
| **Parâmetros operacionais** | em linguagem natural (não machine-readable) |
| **Efeito esperado** | o efeito que se pretendia |
| **Efeito observado** | o efeito que de fato ocorreu |
| **Evidência disponível / ausente** | o que sustenta o resultado e o que falta |
| **Resultado inicial** | o desfecho preliminar (sujeito a verificação) |
| **Camada responsável** | a camada responsável pela execução |
| **Momento operacional** | timestamp/momento da execução |

A execução **gera/alimenta** episode trace e audit log (§17) e **produz evento auditável** quando causa
efeito, altera estado ou bloqueia alteração relevante (§12).

---

## 10. Pré-condições obrigatórias da execução

A execução **só ocorre** quando **todas** estas condições estão satisfeitas:

1. A tool está **registrada** no tool registry.
2. Há **service decision válida**.
3. Há **tool permission explícita registrada** (permission **antes** de execution).
4. **Tenant scope válido**, preservando a fronteira de tenant.
5. **Policy enforcement** satisfeito; **operational boundaries** e **authority layer** respeitados.
6. **Permissions aprovadas** e **evidência mínima** exigida presentes.

Falha de qualquer pré-condição ⇒ **não executa**: bloqueio, pendência de evidência ou escalada (§21).

---

## 11. Decisões possíveis sobre a execução

| Decisão | Significado |
| --- | --- |
| **Executar** | pré-condições satisfeitas; a tool realiza a ação, traçada |
| **Bloquear** | pré-condição ausente/violada; a tool não executa |
| **Pendenciar evidência** | falta evidência mínima; aguarda |
| **Escalar** | excede a fronteira automática; segue para o operador (registrado) |

Toda decisão é **auditável**; nenhuma execução ocorre **sem** registro.

---

## 12. Relação com estado e eventos

A execução **preserva o estado como verdade** ([`operational-state`](../p1/operational-state.spec.md)):
não inventa nem sobrescreve estado implicitamente. **Quando causa efeito operacional, altera estado ou
bloqueia alteração relevante**, a execução **DEVE produzir evento auditável** ([`event-driven-state`](../p1/event-driven-state.spec.md))
— o estado evolui por evento, não por mutação implícita.

## 13. Relação com tenant scope

A execução **respeita tenant scope válido** e **preserva a fronteira de tenant** ([`tenant-boundary`](../p0/tenant-boundary.spec.md),
[`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md)): nenhuma execução cruza ou expõe outro
tenant. Ambiguidade de tenant ⇒ bloqueio/pendência/escalada.

## 14. Relação com service-contract, tool-permission e tool-registry

A execução é a **realização** do que o **service decidiu** ([`service-contract`](service-contract.spec.md)),
a **permission autorizou** ([`tool-permission`](tool-permission.spec.md)) e o **registry tornou existente**
([`tool-registry`](tool-registry.spec.md)). **Tool execution não é service decision nem tool permission**;
e **não pode ampliar o escopo concedido pela permission**.

## 15. Relação com runtime

O **runtime aciona** a execução, mas **não decide sozinho** se a tool deve executar (`P6`,
[`layer-authority-model`](../p0/layer-authority-model.spec.md)). **LLM, agente e prompt não executam tool
diretamente**: o modelo descreve a invocação; o runtime a encaminha à tool **sob permissão**, nunca
executa "por conta do modelo".

## 16. Relação com policies e boundaries

A execução **respeita policy enforcement, operational boundaries e authority layer** e **NÃO PODE
contornar service contract, policy enforcement, tenant boundary, operational boundaries ou authority
layer** ([`policy-enforcement`](../p2/policy-enforcement.spec.md), [`operational-boundaries`](../p2/operational-boundaries.spec.md)).
Operação fora de contrato/policy é **bloqueada** (enforcement determinístico, `DO5`).

## 17. Relação com episode trace e audit log

**Cada invocação** **DEVE** **gerar/alimentar** [`episode-trace`](episode-trace.spec.md) e
[`audit-log`](audit-log.spec.md), de forma proveniente e tenant-scoped — com a anatomia do §9. Execução
sem trace não é execução válida.

## 18. Relação com verification, failure attribution, entropy e intervention

- **Verificável** por [`verification-report`](verification-report.spec.md) e pela futura
  `tool-result-verification` — a execução **exige verificação posterior**.
- **Falha** atribuível por [`failure-attribution`](failure-attribution.spec.md).
- **Entropia** causada pela execução auditável por [`entropy-audit`](entropy-audit.spec.md).
- **Intervenção** relacionada registrada por [`intervention-log`](intervention-log.spec.md).

---

## 19. Critérios de aceite

1. Define a execução como execução operacional controlada de tool registrada (§6), realizada **após**
   service decision e tool permission (§7, §10).
2. Distingue execution ≠ registro ≠ decisão ≠ permissão (§8); execução não amplia escopo da permission.
3. Fixa o registro mínimo (§9) e o **evento auditável** ao causar efeito/alterar/bloquear estado (§12).
4. Mantém runtime acionando (não decidindo sozinho); LLM/agente/prompt não executam diretamente (§15).
5. Respeita tenant scope/boundary, policy enforcement, operational boundaries e authority layer; não
   contorna governança (§13, §16).
6. Liga cada invocação a trace/log e a torna verificável/atribuível/auditável/registrável (§17, §18);
   revisável por humano.

## 20. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Executa sem service decision válida, sem permissão registrada, ou sobre tool não registrada.
2. Confunde execução com decisão (service), permissão ou registro.
3. Faz LLM/agente/prompt executar tool diretamente, ou o runtime decidir sozinho a execução.
4. Amplia o escopo concedido pela permission, ou contorna service contract/policy/tenant boundary/
   operational boundaries/authority layer.
5. Não respeita tenant scope, ou cruza/expõe outro tenant.
6. Causa efeito/altera/bloqueia estado **sem** evento auditável, ou executa sem trace/log.
7. Trata a execução como conclusão verificada (dispensa verificação posterior).
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; infere stack; ou reposiciona o YZI OS.

---

## 21. Quando bloquear, pendenciar evidência ou escalar

1. **Bloquear** quando faltar registro/decisão/permissão, ou a ação violar tenant/policy/boundary/
   authority, ou tentar ampliar o escopo da permission.
2. **Pendenciar evidência** quando faltar evidência mínima exigida.
3. **Escalar** quando exceder a fronteira automática ou exigir autoridade humana. **Ausência, ambiguidade
   ou conflito** nas pré-condições **DEVE** gerar **bloqueio, pendência de evidência ou escalada** — nunca
   execução silenciosa.

## 22. Riscos arquiteturais evitados

- **Execução sem decisão/permissão** — tool agindo fora da ordem registro→decisão→permissão→execução.
- **Execução pelo modelo** — LLM/agente/prompt disparando tool diretamente.
- **Runtime decidindo execução** — coordenação confundida com decisão.
- **Ampliação de escopo** — execução excedendo o que a permission concedeu.
- **Efeito sem evento** — alterar/bloquear estado sem evento auditável.
- **Execução como conclusão** — tratar o efeito como verificado sem verificação posterior.

## 23. Dependências

[`tool-registry`](tool-registry.spec.md), [`tool-permission`](tool-permission.spec.md),
[`service-contract`](service-contract.spec.md), [`operational-state`](../p1/operational-state.spec.md),
[`event-driven-state`](../p1/event-driven-state.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md),
[`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md),
[`policy-enforcement`](../p2/policy-enforcement.spec.md), [`operational-boundaries`](../p2/operational-boundaries.spec.md),
[`escalation-policy`](../p2/escalation-policy.spec.md), [`tenant-retrieval-scope`](../p2/tenant-retrieval-scope.spec.md),
[`episode-trace`](episode-trace.spec.md), [`audit-log`](audit-log.spec.md),
[`verification-report`](verification-report.spec.md), [`failure-attribution`](failure-attribution.spec.md),
[`entropy-audit`](entropy-audit.spec.md), [`intervention-log`](intervention-log.spec.md).

## 24. Próxima spec recomendada

`tool-result-verification` (comprovação do resultado da execução por evidência) — **fecha o bloco
Execution e a Onda P3** — ver [Specification Map](../../specification-engineering/specification-map.md).
**Recomendação, não autorização.** Esta spec **não** inicia `tool-result-verification`.

## 25. Checkpoint

Spec única criada: `/docs/specs/p3/tool-execution.spec.md`. Documental, governance-first, execution-aware,
em linguagem natural estruturada. Não cria nenhuma outra spec, tool, service, skill, subagente, harness,
código, API, schema, YAML/JSON nem contrato machine-readable. Conformidade com `P14`/`P6`/`P2`/`P1`/`DO5`/
`DO9` e com a ordem de valores (verdade operacional 1ª; segurança 2ª; isolamento 3ª; auditabilidade 4ª).
Aguarda revisão e aprovação humana.

---

## Proveniência

`[HARNESS-RT]` AI Harness Runtime — execução sob permissão e contrato; cada invocação traçada; runtime
aciona, não decide; verificação acionada. `[PYR]` Context→Intent→Specification — decidir≠executar;
contract-first; o modelo descreve a invocação. `[HE-GOV]` Harness Engineering / Governança — operação
fora de contrato/policy é bloqueada; sem bypass.

## Fronteiras (o que NÃO está aqui)

- **Não** substitui `P14`/`P6` nem a execução governada: é a spec que os **opera** como contrato de
  execução de tool verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza `tool-result-verification` nem nenhuma spec futura — apenas fixa a execução de tool que
  a verificação herda.

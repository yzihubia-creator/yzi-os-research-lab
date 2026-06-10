# tool-permission

> **Specification documental (governança-first, execution-aware, linguagem natural estruturada).**
> Terceira spec do **bloco Execution** da Onda P3. Define a **tool permission** do YZI OS: a **fronteira
> de permissão explícita e governada** que determina **quando, para quem e sob que limites** uma tool
> **registrada** pode vir a ser executada. **Permission ≠ registro ≠ decisão ≠ execução.** A permissão
> **precede** a execução; **nenhuma tool pode ser executada sem permissão explícita registrada**. O que é
> permitido pertence às **policies**; acionar ≠ decidir. **Não** é machine-readable: não contém YAML,
> JSON, schema, DSL, pseudo-código, contrato técnico executável, código, API, configuração nem plano de
> implementação.
>
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## 1. Identificação da spec

| Campo | Valor |
| --- | --- |
| **Nome** | `tool-permission` |
| **Arquivo** | `/docs/specs/p3/tool-permission.spec.md` |
| **Classe de operação** | fronteira-de-permissão-de-tool |
| **Candidatura** | `harness` (`execution-harness` + `governance-harness`, futuros) |
| **Proveniência** | `[HARNESS-RT]` `[PYR]` `[HE-GOV]` |

## 2. Status, camada, onda e owner arquitetural

| Campo | Valor |
| --- | --- |
| **Status** | proposta para aprovação · Versão v1 · Data 2026-06-03 |
| **Camada** | `governance` (o que é permitido) / `tools` (execução controlada) |
| **Onda** | P3 (Execution + Observability) — bloco Execution (terceira) |
| **Owner arquitetural** | Execution / Governança |
| **Tenant-scope** | Per-tenant |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P14` (services/tools executam), `P12` (governança fora da linguagem), `DO4`, `DO5`.
- [`/docs/harness-engineering/execution-harness.md`](../../harness-engineering/execution-harness.md) §2, §5 — execução sob fronteira de permissão explícita; gates de aprovação; bloqueio fora do contrato; acionar≠decidir.
- [`/docs/specification-engineering/execution-contracts.md`](../../specification-engineering/execution-contracts.md) §2, §5 — fronteira de permissão restringe ações destrutivas; gates; operação fora do contrato não prossegue.
- [`/docs/architecture/service-architecture.md`](../../architecture/service-architecture.md) §4 — tools agem sob permissão; nenhuma autoridade própria.

---

## 3. Propósito

Fixar, como **contrato operacional verificável**, o que é a **tool permission**: a **fronteira de
permissão explícita e governada** que determina **quando, para quem e sob que limites** uma tool
**registrada** ([`tool-registry`](tool-registry.spec.md)) pode vir a ser executada. **O que é permitido
pertence às policies** (`P12`); a permissão **não** decide a operação (isso é do service) nem a executa
(isso é da tool): ela **restringe** o espaço de execução. A permissão **precede** a execução e **nenhuma
tool é executada sem permissão explícita registrada**.

A spec **extrai** (não inventa nem resume) a fronteira de permissão da execução governada. É a terceira
spec do bloco Execution; **permission antes de execution**.

---

## 4. Escopo

- Definir a tool permission como fronteira de permissão explícita e governada (§6, §7).
- Distinguir **permission ≠ registro ≠ decisão (service) ≠ execução (tool)** (§8).
- Definir a **anatomia mínima de uma permissão** (§9) e os **gates de aprovação** para ações arriscadas
  (§10).
- Definir as relações com tenant scope, service-contract, tool-registry, futura tool-execution,
  policies/boundaries e o bloco Observability.
- Definir **quando bloquear, pendenciar evidência ou escalar**.

## 5. Fora de escopo

- **Não** define a **execução** (`tool-execution`) nem a **verificação do resultado**
  (`tool-result-verification`) — apenas a **permissão** e as referencia.
- **Não** registra a tool (isso é `tool-registry`) nem decide a operação (isso é `service-contract`).
- **Não** cria tool, service, skill, subagente, harness executável, código, API, schema, frontend,
  backlog, sprint plan, YAML/JSON, contrato machine-readable ou implementation harness; **não** infere
  stack; **não** reposiciona o YZI OS.

---

## 6. Definição de tool permission

**Tool permission** é a **autorização governada para o uso de uma tool registrada** — a **fronteira de
permissão explícita e governada** que condiciona quando/para quem/sob que limites a tool pode ser
executada. **Não é registry, não é decisão (service) e não é execução (tool).** Características:

1. **Explícita e registrada:** a permissão existe como declaração governada; **nenhuma tool é executada
   sem permissão explícita registrada**.
2. **Governada por policy:** o que é permitido pertence às **policies** (`P12`), não à linguagem nem à
   integração externa.
3. **Restritiva:** define **quando, para quem e sob que limites** (ações admissíveis, limites, gates);
   restringe ações arriscadas/destrutivas.
4. **Precede a execução:** **tool permission ocorre antes de tool execution**.
5. **Sem autoridade própria:** conceder permissão **não** confere autoridade operacional à tool, ao LLM,
   ao agente, ao prompt ou ao runtime.

---

## 7. Permission como fronteira governada

1. **O que é permitido pertence às policies**; **acionar ≠ decidir**: o runtime/harness pode **acionar** a
   execução, mas a **permissão** é das policies e a **decisão** é do service.
2. A permissão **restringe o espaço de execução antes** da ação — enforcement determinístico, não guidance
   (`DO5`).
3. Uma tool **registrada não opera fora do seu tenant scope** e **não viola a fronteira de tenant**: a
   permissão é **tenant-scoped** e nunca abre travessia.
4. Uma tool **não pode ser acionada diretamente por LLM, agente ou prompt** sem **service decision** e
   **permissão** válidas; o **runtime pode coordenar** a chamada futura, mas **não decide** permissão nem
   verdade.
5. **Tool permission NÃO é decisão do LLM, NÃO é decisão livre do agente e NÃO é inferência do prompt**:
   **LLM, agente e prompt não autorizam tool usage**. O **runtime pode coordenar a checagem** de
   permissão, mas **não decide sozinho** se a tool é permitida.

---

## 8. Permission ≠ registro ≠ decisão ≠ execução

| Etapa | Spec | O que estabelece |
| --- | --- | --- |
| **Registro** | [`tool-registry`](tool-registry.spec.md) | que a tool **existe**, descrita e governada |
| **Decisão** | [`service-contract`](service-contract.spec.md) | que a operação foi **decidida** dentro de contrato |
| **Permissão** | `tool-permission` (esta) | **quando/para quem/sob que limites** a tool pode ser usada |
| **Execução** | `tool-execution` (futura) | a **realização** da ação, sob permissão, com trace |

Esta spec fixa **apenas a permissão**. Conceder permissão **não** registra, **não** decide e **não**
executa. Em termos diretos: **tool permission é autorização governada para uso de uma tool registrada —
não é execução, não é registry e não é decisão de service.**

---

## 9. Anatomia mínima de uma permissão

Cada permissão **DEVE** declarar, em linguagem natural estruturada:

1. **Qual tool** (registrada) e **qual tenant/escopo** (tenant-specific ou global).
2. **Ações admissíveis e limites** (o que pode/não pode fazer).
3. **Condições** sob as quais é válida (incl. **service decision** prévia exigida).
4. **Gates de aprovação** para ações arriscadas/destrutivas (§10).
5. **Authority layer** e a subordinação a policies/operational boundaries.
6. **Evidência mínima** exigida para conceder/manter a permissão.
7. **Proveniência** e a autoridade que concedeu.

**Pré-condições obrigatórias da permissão.** Conceder permissão **EXIGE**: que a tool **exista no tool
registry**; **service decision válida**; **tenant scope válido** (preservando a fronteira de tenant);
**policy enforcement satisfeito** (ou decisão de pendência/escalada); respeito a **operational boundaries**
e ao **authority layer**; e **evidência mínima suficiente**.

**Toda concessão DEVE considerar**, no mínimo:

- **tool registry status** (incl. deprecated/blocked/experimental/tenant-specific/globally available);
- **service contract** relacionado;
- **tenant policy pack**;
- **tenant retrieval scope** (quando aplicável);
- **permissions necessárias**;
- **risco operacional**;
- **tipo de efeito possível**;
- **condições de bloqueio**;
- **condições de escalada**;
- **evidência disponível**;
- **evidência ausente**.

A permissão é **auditável e revisável por humano**; **ausência/ambiguidade/conflito** leva a bloqueio/
pendência/escalada (§21).

---

## 10. Gates de aprovação e ações arriscadas

1. Ações **arriscadas ou destrutivas** **DEVEM** passar por **gates de aprovação** explícitos antes da
   execução.
2. O gate é **determinístico**: operação fora do contrato de permissão **não prossegue** (`DO5`).
3. A ausência de um gate exigido é tratada como **falta de permissão** — bloqueio/pendência/escalada,
   nunca execução por omissão.

---

## 11. Decisões possíveis de permissão

| Decisão | Significado |
| --- | --- |
| **Permitido (conceder)** | a tool pode ser executada dentro dos limites declarados |
| **Negado (bloquear)** | a permissão não é concedida; a tool não executa |
| **Pendente de evidência** | falta evidência mínima para conceder; aguarda |
| **Escalado** | excede a fronteira automática; segue para o operador (registrado) |

Toda decisão de permissão (**permitido, negado, pendente de evidência ou escalado**) é **registrada em
episode trace e audit log** (§17), **verificável por verification report** (§18), **auditável** e **não
destrutiva**. **Falha de tool permission** é **atribuível por failure attribution** (§18).

---

## 12. Relação com tenant scope

A permissão é **tenant-scoped**: uma tool registrada **não opera fora do seu tenant scope** e **não viola
a fronteira de tenant** ([`tenant-boundary`](../p0/tenant-boundary.spec.md), [`tenant-retrieval-scope`](../p2/tenant-retrieval-scope.spec.md)).
Ambiguidade de tenant na permissão leva a bloqueio/pendência/escalada.

## 13. Relação com service-contract

O **service decide**; a **permissão restringe**; a **tool executa**. Uma tool **não pode ser acionada
diretamente por LLM/agente/prompt** sem **service decision** ([`service-contract`](service-contract.spec.md))
**e** permissão válidas. **Service decision ≠ tool permission ≠ tool execution.**

## 14. Relação com tool-registry

Só uma tool **registrada** ([`tool-registry`](tool-registry.spec.md)) pode receber permissão: o registro
estabelece **existência**; a permissão estabelece **quando/para quem/sob que limites**. Tool não
registrada não recebe permissão nem executa.

## 15. Relação com futura tool-execution

**Tool permission ocorre antes de tool execution**, e **nenhuma tool pode ser executada sem permissão
explícita registrada**. A `tool-execution` (futura) herda esta fronteira; cada invocação será traçada
(`P14`). Esta spec **prepara** a execução **sem** criá-la.

## 16. Relação com policies e operational boundaries

A permissão é **enforcement determinístico** ([`policy-enforcement`](../p2/policy-enforcement.spec.md)):
**exige policy enforcement satisfeito** ou uma decisão de **pendência/escalada**, **respeita o authority
layer** e **não permite bypass** de policy, tenant scope, operational boundary ou authority layer
([`operational-boundaries`](../p2/operational-boundaries.spec.md)). A permissão **NÃO PODE contornar
service contract, policy enforcement, tenant boundary ou operational boundaries**. Conceder permissão
**nunca** abre exceção à governança.

## 17. Relação com episode trace e audit log

Toda **concessão/negação/alteração de permissão** e toda **invocação futura** sob permissão **DEVE**
gerar/alimentar [`episode-trace`](episode-trace.spec.md) e [`audit-log`](audit-log.spec.md), de forma
proveniente e tenant-scoped. Mudança de permissão é **evento auditável** ([`event-driven-state`](../p1/event-driven-state.spec.md)).

## 18. Relação com verification, failure attribution, entropy e intervention

A execução permitida herda o bloco Observability: resultado **verificável**
([`verification-report`](verification-report.spec.md)); falha **atribuível**
([`failure-attribution`](failure-attribution.spec.md)); entropia **auditável**
([`entropy-audit`](entropy-audit.spec.md)); intervenção **registrada**
([`intervention-log`](intervention-log.spec.md)).

---

## 19. Critérios de aceite

1. Define a tool permission como fronteira de permissão explícita e governada (§6, §7).
2. Fixa **permission antes de execution** e **nenhuma execução sem permissão explícita registrada**
   (§6, §15).
3. Distingue permission ≠ registro ≠ decisão ≠ execução (§8); o que é permitido pertence às policies.
4. Fixa a anatomia mínima (§9) e os gates de aprovação para ações arriscadas (§10).
5. Mantém tenant-scope/boundary; tool não acionada por LLM/agente/prompt sem service decision + permissão;
   runtime coordena, não decide.
6. Impede bypass de policy/tenant/boundary/authority; liga permissão/invocação a trace/log; revisável por
   humano.

## 20. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Permite executar tool sem permissão explícita registrada, ou permissão depois da execução.
2. Confunde permissão com registro, decisão (service) ou execução (tool).
3. Faz a permissão conceder autoridade operacional à tool/LLM/agente/prompt/runtime.
4. Permite tool operar fora do tenant scope ou violar a fronteira de tenant.
5. Permite acionamento direto por LLM/agente/prompt sem service decision + permissão.
6. Dispensa gates de aprovação para ações arriscadas/destrutivas, ou executa por omissão de gate.
7. Permite bypass de policy/tenant/boundary/authority, ou altera permissão sem evento auditável.
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; infere stack; ou reposiciona o YZI OS.

---

## 21. Quando bloquear, pendenciar evidência ou escalar

1. **Bloquear** quando a tool não estiver registrada, faltar service decision, ou a ação violar policy/
   tenant/boundary/authority.
2. **Pendenciar evidência** quando faltar evidência mínima ou um gate de aprovação exigido.
3. **Escalar** quando a permissão exceder a fronteira automática ou exigir autoridade humana. **Ausência,
   ambiguidade ou conflito na permissão** **DEVE** gerar **bloqueio, pendência de evidência ou escalada**
   — nunca execução silenciosa.

## 22. Riscos arquiteturais evitados

- **Execução sem permissão** — tool agindo sem fronteira explícita registrada.
- **Permissão após execução** — autorizar depois do efeito.
- **Permissão como autoridade** — conceder permissão e, com isso, conferir autoridade decisória.
- **Acionamento direto pelo modelo** — LLM/agente/prompt disparando tool sem service decision + permissão.
- **Ação destrutiva sem gate** — risco executado sem aprovação.
- **Bypass via permissão** — permitir para escapar de policy/tenant/boundary/authority.

## 23. Dependências

[`tool-registry`](tool-registry.spec.md), [`service-contract`](service-contract.spec.md),
[`operational-state`](../p1/operational-state.spec.md), [`event-driven-state`](../p1/event-driven-state.spec.md),
[`tenant-boundary`](../p0/tenant-boundary.spec.md), [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md),
[`layer-authority-model`](../p0/layer-authority-model.spec.md), [`policy-enforcement`](../p2/policy-enforcement.spec.md),
[`operational-boundaries`](../p2/operational-boundaries.spec.md), [`escalation-policy`](../p2/escalation-policy.spec.md),
[`tenant-retrieval-scope`](../p2/tenant-retrieval-scope.spec.md), [`episode-trace`](episode-trace.spec.md),
[`audit-log`](audit-log.spec.md), [`verification-report`](verification-report.spec.md),
[`failure-attribution`](failure-attribution.spec.md), [`entropy-audit`](entropy-audit.spec.md),
[`intervention-log`](intervention-log.spec.md).

## 24. Próxima spec recomendada

`tool-execution` (realização da ação sob permissão, com trace), depois `tool-result-verification` — ver
[Specification Map](../../specification-engineering/specification-map.md). **Recomendação, não
autorização.** Esta spec **não** inicia `tool-execution`.

## 25. Checkpoint

Spec única criada: `/docs/specs/p3/tool-permission.spec.md`. Documental, governance-first, execution-aware,
em linguagem natural estruturada. Não cria nenhuma outra spec, tool, service, skill, subagente, harness,
código, API, schema, YAML/JSON nem contrato machine-readable. Conformidade com `P14`/`P12`/`DO4`/`DO5` e
com a ordem de valores (verdade operacional 1ª; segurança 2ª; isolamento 3ª; auditabilidade 4ª). Aguarda
revisão e aprovação humana.

---

## Proveniência

`[HARNESS-RT]` AI Harness Runtime — execução sob fronteira de permissão explícita; gates de aprovação;
acionar≠decidir; trace por invocação. `[PYR]` Context→Intent→Specification — contract-first; decidir≠
permitir≠executar. `[HE-GOV]` Harness Engineering / Governança — o permitido pertence às policies;
operação fora do contrato não prossegue; sem bypass.

## Fronteiras (o que NÃO está aqui)

- **Não** substitui `P14`/`P12` nem a execução governada: é a spec que os **opera** como contrato de
  permissão de tool verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza `tool-execution`/`tool-result-verification` nem nenhuma spec futura — apenas fixa a
  permissão de tool que as demais herdam.

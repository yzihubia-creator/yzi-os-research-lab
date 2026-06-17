# entropy-audit

> **Specification documental (governança-first, observability-first, linguagem natural estruturada).**
> Quinta spec da **Onda P3 (Execution + Observability)**. Define a **entropy audit** do YZI OS: a
> auditoria que **detecta e registra o ônus de manutenção** (resíduo, deriva, enfraquecimento de
> verificação, violação de fronteira) introduzido pelas operações — context rot, retrieval ruim, policy
> gap, conflito de autoridade, memória contaminada, prompt/role drift, loop conversacional, ausência de
> evidência, excesso de escaladas, falha repetida de enforcement. A entropia é tratada **dentro do laço**
> (`DO10`); a auditoria **não altera estado, não corrige automaticamente e não autoriza improviso**.
> **Não** é machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código, contrato técnico
> executável, código, API, configuração nem plano de implementação.
>
> Onda: P3 (execução + observabilidade) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `entropy-audit` |
| **Camada** | `observability` / `audit` |
| **Owner arquitetural** | Observabilidade / Governança |
| **Tenant-scope** | Per-tenant |
| **Classe de operação** | auditoria-de-entropia |
| **Candidatura** | `harness` (`audit-harness` + `observability-harness`) |
| **Dependências** | [`episode-trace`](episode-trace.spec.md), [`audit-log`](audit-log.spec.md), [`verification-report`](verification-report.spec.md), [`failure-attribution`](failure-attribution.spec.md), [`escalation-policy`](../p2/escalation-policy.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md) |
| **Proveniência** | `[HARNESS-RT]` `[CE]` `[PYR]` `[AHE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P8`, `P9`, `DO6`, `DO10` (auditoria de entropia).
- [`/docs/architecture/observability-architecture.md`](../../architecture/observability-architecture.md) §7 — observabilidade detecta e registra o ônus de manutenção; entropia tratada dentro do laço.
- [`/docs/architecture/operational-architecture.md`](../../architecture/operational-architecture.md) §7 — entropia operacional (resíduo, deriva, enfraquecimento de verificação, violação de fronteira) dentro do ciclo.
- [`/docs/harness-engineering/audit-harness.md`](../../harness-engineering/audit-harness.md) §5 — auditoria de entropia; auditor independente.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, a **entropy audit**: a auditoria que **identifica,
registra e analisa** a **entropia operacional/cognitiva** — degradação, incerteza, drift, ruído,
conflito ou **perda de controle operacional** — ou seja, o ônus de manutenção (resíduo, deriva,
enfraquecimento de verificação, violação de fronteira) que operações autônomas produzem além dos seus
resultados. A entropia é tratada **dentro do laço**, não como preocupação externa (`DO10`): à medida que
a instituição delega mais operação contínua, gerir entropia torna-se tão importante quanto a operação
imediata.

A spec **extrai** (não inventa nem resume) a auditoria de entropia da arquitetura de observabilidade e
operacional. É a quinta spec da Onda P3 e apoia `intervention-log` e a melhoria futura.

---

## 2. Problema que resolve

Operações autônomas não produzem apenas resultados — produzem **resíduo**: estado obsoleto, deriva de
comportamento, enfraquecimento de verificação, violação de fronteira. Se esse ônus não for auditado
**dentro do ciclo**, ele se acumula silenciosamente, degrada o sistema e só aparece como falha tardia e
difusa.

Esta spec elimina o risco fixando a entropy audit como **detecção e registro governados** da entropia:
fonte provável, evidência, impacto e severidade declarados, com indicação de revisão necessária — **sem**
corrigir automaticamente nem autorizar improviso.

---

## 3. Autoridade envolvida

- **Detecta e registra a entropia:** a **Observabilidade** e o `audit-harness`, sob policies, com
  **auditor independente** (quem executou não audita a própria entropia, `[CE]`).
- **Coordena (não decide a verdade):** o **Runtime** pode coordenar a auditoria, mas **não decide** a
  verdade auditável nem autoriza correção por conta própria.
- **NÃO improvisam solução:** a entropy audit **NÃO autoriza** LLM, agente, prompt ou runtime a
  **improvisar** uma solução; ela **indica**, não executa (`P1`, `DO10`).

---

## 4. Entradas esperadas

- O [`episode-trace`](episode-trace.spec.md), o [`audit-log`](audit-log.spec.md), o
  [`verification-report`](verification-report.spec.md) e a [`failure-attribution`](failure-attribution.spec.md)
  do episódio/histórico — tenant-scoped e provenientes.
- O **estado** e o **comportamento esperado** como referência de deriva/obsolescência.

## 5. Saídas esperadas

- Um **registro de entropia** por tenant: fonte provável, evidência disponível/ausente, impacto,
  severidade e indicação de revisão/escalada — auditável, revisável e não destrutivo.
- Quando a entropia não for atribuível com segurança: **"entropia indeterminada com evidência
  insuficiente"**, com pendência ou escalada.

---

## 6. Definição de entropy audit

**Entropy audit** é a auditoria que **detecta, classifica e registra** a entropia operacional — o ônus de
manutenção que se acumula no sistema. Características:

1. **Dentro do laço:** a entropia é tratada como parte do ciclo operacional, não como preocupação
   externa (`DO10`).
2. **Detecção, não correção:** **indica** a entropia e a revisão necessária; **não** corrige nem altera
   estado.
3. **Proveniente e tenant-scoped:** preserva proveniência, tenant scope e authority layer.
4. **Auditável, revisável e não destrutiva:** reconstruível, revisável por humano, sem apagar/alterar
   evidência ou estado.
5. **Separação de papéis:** preserva a separação entre **análise** (o que a entropy audit faz),
   **decisão** (de quem tem autoridade), **correção** (executada fora dela) e **implementação** (fase
   futura) — a auditoria **analisa**, não decide, não corrige, não implementa.

---

## 7. Fontes e tipos de entropia

A entropy audit **DEVE** detectar e classificar, no mínimo:

| Fonte de entropia | Natureza |
| --- | --- |
| **Estado obsoleto / insuficiente** | verdade operacional desatualizada ou incompleta |
| **Context rot** | contexto contaminado/monolítico degradando a decisão |
| **Retrieval ruim** | recuperação imprecisa, fora de escopo ou sem proveniência |
| **Policy gap** | lacuna de governança (regra ausente onde necessária) |
| **Conflito de autoridade** | camadas disputando autoridade indevidamente |
| **Memória contaminada** | memória sem proveniência ou cruzando fronteira |
| **Prompt drift** | deriva da instrução pontual sobre a governança |
| **Role drift** | deriva do papel do agente para fora do seu escopo |
| **Loop conversacional** | repetição improdutiva sem progresso de estado |
| **Ausência de evidência** | decisão/operação sem suporte verificável |
| **Excesso de escaladas** | escalada recorrente sinalizando lacuna de governança |
| **Falha repetida de enforcement** | mesma violação reincidindo |

Tipos canônicos subjacentes (`DO10`): **resíduo, deriva, enfraquecimento de verificação, violação de
fronteira**.

---

## 8. Conteúdo mínimo de um registro de entropia

Cada registro **DEVE** indicar:

1. **Fonte provável** da entropia (§7), apontada com evidência — nunca culpa genérica.
2. **Evidência disponível** e **evidência ausente** (reconstruível via trace/log/report/atribuição).
3. **Impacto operacional** e **severidade**.
4. **Indicação de revisão**: se exige **escalada, intervenção humana, revisão de policy, revisão de
   retrieval, revisão de contexto, revisão de agent boundary, revisão de spec, revisão de tenant
   configuration, revisão de policy pack ou revisão de future tool/service contract**.
5. **Tenant, authority layer e proveniência**.

A entropy audit **indica** a revisão; **não** a executa.

---

## 9. Entropia indeterminada

Quando a entropia **não puder ser atribuída com segurança**, o resultado **DEVE** ser:

> **"entropia indeterminada com evidência insuficiente"**, com **pendência de evidência ou escalada**.

Nunca se **inventa evidência** nem se força a atribuição da entropia a uma fonte. A insuficiência é, ela
própria, registrada como fato auditável.

---

## 10. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Tratar a entropia **dentro do laço** (`DO10`), detectando e registrando o ônus de manutenção.
2. Detectar e classificar as fontes do §7 (e os tipos canônicos resíduo/deriva/enfraquecimento/violação).
3. Usar episode-trace, audit-log, verification-report e failure-attribution como evidência.
4. Indicar fonte provável, evidência disponível/ausente, impacto, severidade e revisão necessária (§8).
5. Registrar **entropia indeterminada com evidência insuficiente** quando não atribuível com segurança.
6. Manter a auditoria **tenant-scoped**, com proveniência/authority layer; preservar a fronteira de
   tenant.
7. **Não alterar estado**, **não corrigir automaticamente** e **não autorizar** LLM/agente/prompt/runtime
   a improvisar.
8. Preservar **auditor independente**; manter o runtime como coordenador, não decisor da verdade.
9. Preservar a **separação entre análise, decisão, correção e implementação** (§6.5).
10. Ser **auditável, revisável e não destrutiva**; apoiar **intervention-log, melhoria futura, revisão de
    specifications, revisão de policies, revisão de context/retrieval e revisão de agent/subagent
    boundaries**.

---

## 11. Critérios de aceite

1. Referencia `DO10`/`P8`/`P9` e a auditoria de entropia sem contradizê-los nem duplicá-los.
2. Define entropy audit como detecção/registro dentro do laço (§6) e fixa as fontes/tipos (§7).
3. Fixa o conteúdo mínimo do registro (§8) e a regra de entropia indeterminada (§9).
4. Usa trace/log/report/atribuição como evidência; respeita tenant scope/boundary.
5. Não altera estado, não corrige, não autoriza improviso; preserva auditor independente.
6. É auditável, revisável, não destrutiva; apoia intervention-log e melhoria futura; revisável por humano.

---

## 12. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Trata a entropia como preocupação externa, fora do laço.
2. Não detecta/classifica as fontes do §7 ou não indica fonte provável com evidência.
3. Inventa evidência ou força atribuição quando a entropia é indeterminada.
4. Altera estado, corrige automaticamente, ou autoriza LLM/agente/prompt/runtime a improvisar.
5. Cruza/expõe outro tenant, ou ignora authority layer/proveniência.
6. É destrutiva, não revisável, ou permite que quem executou audite a própria entropia.
7. Introduz código/API/schema/YAML/JSON/contrato machine-readable; infere stack; transforma em plano de
   implementação; ou reposiciona o YZI OS.

---

## 13. Relação com episode-trace, audit-log, verification-report e failure-attribution

A entropy audit **consome** essas quatro fontes: o [`episode-trace`](episode-trace.spec.md) e o
[`audit-log`](audit-log.spec.md) fornecem o histórico reconstruível; o
[`verification-report`](verification-report.spec.md) revela enfraquecimento de verificação; a
[`failure-attribution`](failure-attribution.spec.md) revela falhas reincidentes. A entropia é uma leitura
**transversal** dessas evidências — não as substitui.

## 14. Relação com state e governance/context/retrieval specs

A entropy audit **lê — não altera** — o estado ([`operational-state`](../p1/operational-state.spec.md)) e
usa os contratos de governança/contexto/retrieval como referência de deriva: policy gap
([`policy-enforcement`](../p2/policy-enforcement.spec.md)), context rot
([`context-assembly`](../p2/context-assembly.spec.md)/[`context-isolation`](../p2/context-isolation.spec.md)),
retrieval ruim ([`retrieval-governance`](../p2/retrieval-governance.spec.md)), memória contaminada
([`memory-model`](../p1/memory-model.spec.md)).

## 15. Relação com agents, runtime e futuras tools/services

Detecta **role drift** (agente fora do papel) e **prompt drift** (instrução sobrepondo governança) sem
culpar genericamente; aponta coordenação de runtime que amplie escopo. Quando **existirem**,
tools/services entram como possível fonte de entropia (falha repetida de execução). Esta spec **prepara**
essa detecção sem criar tool/service.

## 16. Relação com observabilidade e auditoria

A entropy audit é parte da camada de **observabilidade** (que comprova) e do **audit-harness**: trata a
entropia dentro do laço (`DO10`), é **read-only para o executor** e alimenta a melhoria contínua sem
substituir a auditoria. Vale o **auditor independente**.

## 17. Relação com intervention-log (futuro) e melhoria contínua

A entropy audit **apoia**: o `intervention-log` futuro, a **melhoria futura**, a **revisão de
specifications**, a **revisão de policies**, a **revisão de context/retrieval** e a **revisão de
agent/subagent boundaries**. Entropia evitável sinaliza uma responsabilidade de governança ausente, e a
intervenção humana correspondente é o sinal diagnóstico que fecha a lacuna. Esta spec **não** cria
intervention-log nem executa qualquer dessas revisões — apenas as **indica**.

---

## 18. Quando bloquear, pendenciar evidência ou escalar

1. **Pendenciar evidência** quando a entropia depende de evidência ainda inexistente (entropia
   indeterminada, §9).
2. **Escalar** quando a entropia exigir autoridade humana, ou quando indicar revisão de
   policy/retrieval/contexto/agent boundary/spec.
3. **Bloquear** execução futura quando a entropia indicar violação de fronteira/enfraquecimento de
   verificação não resolvido. A entropy audit **indica**; a correção é decidida fora dela.

---

## 19. Riscos arquiteturais evitados

- **Entropia silenciosa** — ônus de manutenção acumulando fora do laço (`DO10`).
- **Correção automática / improviso** — agir sobre a entropia sem governança.
- **Culpa genérica** — atribuir entropia sem evidência/fonte específica.
- **Evidência inventada** — fechar a causa da entropia sem suporte.
- **Auditoria destrutiva** — alterar estado/evidência ao auditar.
- **Auto-auditoria** — quem executou auditando a própria entropia.

---

## 20. Fora de escopo

- **Não** corrige a entropia nem altera estado — apenas detecta, classifica e indica.
- **Não** decide nem implementa correção — preserva a separação análise/decisão/correção/implementação.
- **Não** define intervention-log em detalhe — apenas o apoia.
- **Não** cria o `audit-harness`/`observability-harness` executável nem nenhuma outra spec.
- **Não** cria tool, service, skill, subagente, harness, código, API, schema, frontend, backlog, sprint
  plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 21. Dependências

[`episode-trace`](episode-trace.spec.md), [`audit-log`](audit-log.spec.md),
[`verification-report`](verification-report.spec.md), [`failure-attribution`](failure-attribution.spec.md),
[`operational-state`](../p1/operational-state.spec.md), [`memory-model`](../p1/memory-model.spec.md),
[`policy-enforcement`](../p2/policy-enforcement.spec.md), [`context-isolation`](../p2/context-isolation.spec.md),
[`retrieval-governance`](../p2/retrieval-governance.spec.md), [`escalation-policy`](../p2/escalation-policy.spec.md),
[`tenant-boundary`](../p0/tenant-boundary.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md).

## 22. Próxima spec recomendada

`intervention-log` (registro de intervenção humana como sinal diagnóstico) — ver
[Specification Map](../../specification-engineering/specification-map.md). **Recomendação, não
autorização.** Esta spec **não** inicia `intervention-log`.

## 23. Checkpoint

Spec única criada: `/docs/specs/p3/entropy-audit.spec.md`. Documental, governance-first,
observability-first, em linguagem natural estruturada. Não cria nenhuma outra spec, tool, service, skill,
subagente, harness, código, API, schema, YAML/JSON nem contrato machine-readable. Conformidade com
`P8`/`P9`/`DO6`/`DO10` e com a ordem de valores (auditabilidade, 4ª posição). Aguarda revisão e aprovação
humana.

---

## 21. Proveniência

`[HARNESS-RT]` AI Harness Runtime — auditoria de entropia; ônus de manutenção dentro do laço; gestão de
entropia tão importante quanto a operação. `[CE]` Context Engineering — auditor independente; trilha
orgânica; proveniência. `[PYR]` Context→Intent→Specification — responsabilidade à origem. `[AHE]` Agentic
Harness Engineering — controlabilidade read-only; entropia como dimensão de observabilidade.

---

## 22. Fronteiras (o que NÃO está aqui)

- **Não** substitui `DO10` nem a arquitetura de observabilidade: é a spec que os **opera** como contrato
  de auditoria de entropia verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma spec futura da Onda P3 — apenas fixa a entropy audit que as demais herdam.

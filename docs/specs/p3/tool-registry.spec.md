# tool-registry

> **Specification documental (governança-first, contract-first, linguagem natural estruturada).**
> Segunda spec do **bloco Execution** da Onda P3. Define o que é o **tool registry** do YZI OS: o
> **inventário governado** das ferramentas operacionais disponíveis — **não** um catálogo solto de
> funções. Uma tool **só existe** se estiver **registrada, descrita e autorizada**; tool não registrada
> não pode ser executada. O registro **não concede execução por si** (registro ≠ permissão ≠ execução) e
> **nunca** transforma integração externa em autoridade operacional. **Não** é machine-readable: não
> contém YAML, JSON, schema, DSL, pseudo-código, contrato técnico executável, código, API, configuração
> nem plano de implementação.
>
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## 1. Identificação da spec

| Campo | Valor |
| --- | --- |
| **Nome** | `tool-registry` |
| **Arquivo** | `/docs/specs/p3/tool-registry.spec.md` |
| **Classe de operação** | inventário-governado-de-tools |
| **Candidatura** | `harness` (`execution-harness` + `runtime-harness`, futuros) |
| **Proveniência** | `[HARNESS-RT]` `[PYR]` `[HE-GOV]` |

## 2. Status, camada, onda e owner arquitetural

| Campo | Valor |
| --- | --- |
| **Status** | proposta para aprovação · Versão v1 · Data 2026-06-03 |
| **Camada** | `tools` (execução controlada) / `runtime` (registro governado) |
| **Onda** | P3 (Execution + Observability) — bloco Execution (segunda) |
| **Owner arquitetural** | Execution / Governança |
| **Tenant-scope** | Per-tenant e/ou global (escopo declarado no registro) |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P14` (services/tools executam operações), `P2`, `DO4`, `DO5`.
- [`/docs/specification-engineering/execution-contracts.md`](../../specification-engineering/execution-contracts.md) §2, §5 — registro de tools e fronteira de permissão governados por contrato; ações permitidas/limites; operação fora do contrato não prossegue.
- [`/docs/architecture/service-architecture.md`](../../architecture/service-architecture.md) §4 — tools executam sob permissão explícita, com trace; nenhuma autoridade própria.
- [`/docs/architecture/operational-architecture.md`](../../architecture/operational-architecture.md) §3.4 — tools como execução operacional controlada.

---

## 3. Propósito

Fixar, como **contrato operacional verificável**, o que é o **tool registry**: o **inventário governado**
das ferramentas operacionais (tools) disponíveis no YZI OS. O registry **não** é um catálogo solto de
funções: é o **registro institucional** que determina **quais tools existem**, **como são descritas** e
**sob que governança** podem vir a ser permitidas e executadas. Uma tool **só pode existir se estiver
registrada, descrita e autorizada**.

A spec **extrai** (não inventa nem resume) o registro de tools como responsabilidade de runtime governada
por contrato e a fronteira tools-executam-sob-permissão. É a segunda spec do bloco Execution; **registrar
não é permitir nem executar**.

---

## 4. Escopo

- Definir o tool registry como inventário governado (não catálogo) e a **existência registral** de uma
  tool (§6, §7).
- Definir o **registro mínimo de uma tool** (§9) e o escopo (tenant-specific ou globally available).
- Distinguir **registro ≠ permissão ≠ execução ≠ verificação de resultado** (§8, §15).
- Definir as relações com service, futura permission/execution/result-verification, tenant scope,
  policies/boundaries e o bloco Observability.
- Definir **quando bloquear, pendenciar evidência ou escalar**.

## 5. Fora de escopo

- **Não** define **permissão** de tool (`tool-permission`), **execução** (`tool-execution`) nem
  **verificação de resultado** (`tool-result-verification`) — apenas o **registro** e os referencia.
- **Não** integra tool externa concreta, nem cria endpoint, API, schema ou código; **não** infere stack;
  **não** implementa tool alguma.
- **Não** cria service, skill, subagente, harness executável, frontend, backlog, sprint plan, YAML/JSON,
  contrato machine-readable ou implementation harness; **não** reposiciona o YZI OS.

---

## 6. Definição de tool registry

**Tool registry** é o **inventário governado** das tools operacionais. Características:

1. **Inventário governado, não catálogo solto:** cada tool é uma entrada **descrita e governada**, não
   uma função arbitrária disponível.
2. **Existência registral:** uma tool **só existe** se registrada, descrita e autorizada; **tool não
   registrada não pode ser executada** nem referenciada como disponível.
3. **Escopo declarado:** cada tool é **tenant-specific** ou **globally available** — o escopo é parte do
   registro.
4. **Sem autoridade própria:** o registro **não** confere autoridade operacional à tool nem à integração
   externa; a tool **executa sob permissão**, nunca decide.

---

## 7. Tool registry como inventário institucional

1. O registry é **institucional**: o que entra nele é decidido por Authority (specifications/policies),
   não por linguagem nem por integração externa.
2. **Registrar ≠ permitir ≠ executar:** o registro estabelece **existência**; a permissão
   (`tool-permission`) estabelece **quando/para quem**; a execução (`tool-execution`) realiza a ação sob
   permissão; a verificação (`tool-result-verification`) comprova o resultado.
3. O registry **NÃO transforma integração externa em autoridade operacional**: uma conexão com sistema
   externo registrada continua sendo **execução controlada**, não decisão.
4. **LLM, agente, prompt e runtime não registram tools por conta própria** nem se autoatribuem tools fora
   do registro governado.
5. **O tool registry NÃO executa tools** e **NÃO concede permissão por si só**: registrar estabelece
   apenas **existência governada**, nunca execução nem permissão.
6. **Nenhuma tool pode ser considerada disponível se não estiver registrada**: ausência de registro =
   tool inexistente para a operação.
7. O tool registry **NÃO substitui** o [`service-contract`](service-contract.spec.md) (decisão), nem o
   `tool-permission` (permissão), o `tool-execution` (execução) ou o `tool-result-verification`
   (verificação de resultado) — apenas os **antecede** como inventário.
8. O tool registry é **governado por specification e revisável por humano**, e **não contém implementação
   técnica nesta fase**.

---

## 8. Registro ≠ permissão ≠ execução ≠ verificação

| Etapa | Spec | O que estabelece |
| --- | --- | --- |
| **Registro** | `tool-registry` (esta) | que a tool **existe**, descrita e governada |
| **Permissão** | `tool-permission` (futura) | quando/para quem/sob que fronteira pode ser usada |
| **Execução** | `tool-execution` (futura) | a realização da ação, sob permissão e com trace |
| **Verificação** | `tool-result-verification` (futura) | a comprovação do resultado por evidência |

Esta spec fixa **apenas a primeira etapa**. Confundir registro com permissão ou execução é erro de
arquitetura.

---

## 9. Registro mínimo de uma tool

Cada entrada do registry **DEVE** declarar, em linguagem natural estruturada:

1. **Nome** da tool.
2. **Finalidade** — o que ela faz (execução controlada), de forma descrita e não ambígua.
3. **Status / escopo**: **deprecated, blocked, experimental, tenant-specific (qual tenant) ou globally
   available** — o estado de disponibilidade governada é parte do registro.
4. **Fronteira de permissão pretendida** (ações admissíveis, limites) — detalhada por `tool-permission`.
5. **Authority layer** e a subordinação a policies/operational boundaries.
6. **Método de verificação** do resultado (contract-first) — detalhado por `tool-result-verification`.
7. **Proveniência** e a autoridade que registrou.
8. **Relação com o bloco Observability**: obrigação de **trace** e de alimentar **audit log,
   verification report, failure attribution, entropy audit e intervention log** (§16, §17).

O registro é **governado por specification e revisável por humano**, e **não contém implementação técnica
nesta fase**. Uma tool **não pode ser executada** sem registro válido; **registro ambíguo/ausente/
conflitante** leva a bloqueio/pendência/escalada (§20).

---

## 10. Decisões possíveis sobre o registro

| Decisão | Significado |
| --- | --- |
| **Registrar** | a tool passa a existir, descrita e governada |
| **Bloquear registro** | descrição/autoridade/escopo insuficientes; a tool não existe |
| **Pendenciar evidência** | falta evidência mínima para registrar; aguarda |
| **Escalar** | o registro excede a fronteira automática; segue para o operador |

Toda decisão de registro é **auditável** e **não destrutiva**.

---

## 11. Relação com tenant scope

O registry respeita o **tenant scope**: tools tenant-specific só existem para o seu tenant; tools
globally available não podem, via registro, **expor ou cruzar** dados entre tenants
([`tenant-boundary`](../p0/tenant-boundary.spec.md), [`tenant-retrieval-scope`](../p2/tenant-retrieval-scope.spec.md)).
Ambiguidade de tenant no registro leva a bloqueio/pendência/escalada.

## 12. Relação com estado operacional

O registry **preserva o estado como verdade** ([`operational-state`](../p1/operational-state.spec.md)):
o registro é metadado governado, não a verdade operacional. **Alteração do registro** (incluir, alterar,
remover uma tool) **DEVE gerar evento auditável** ([`event-driven-state`](../p1/event-driven-state.spec.md)).

## 13. Relação com policies e boundaries

O registry **não permite bypass** de **policy, tenant scope, operational boundary ou authority layer**
([`policy-enforcement`](../p2/policy-enforcement.spec.md), [`operational-boundaries`](../p2/operational-boundaries.spec.md)):
registrar uma tool **nunca** abre uma exceção à governança. Toda tool registrada permanece **subordinada**
às policies e fronteiras.

## 14. Relação com service-contract

O **service decide**; a **tool executa** ([`service-contract`](service-contract.spec.md)). O registry é
o inventário do que a decisão de um service **pode solicitar** executar — mas **service decision ≠ tool
execution**: o registro não decide, apenas torna a tool existente e governada.

## 15. Relação com futura tool-permission, tool-execution e tool-result-verification

O registry é a **base** das três specs seguintes do bloco Execution: `tool-permission` (fronteira de
permissão), `tool-execution` (realização sob permissão, com trace) e `tool-result-verification`
(comprovação do resultado). Esta spec **prepara** essas etapas **sem** criá-las nem autorizá-las.

## 16. Relação com episode trace e audit log

Toda **alteração do registry** e toda **invocação futura** de uma tool registrada **DEVE** gerar/alimentar
[`episode-trace`](episode-trace.spec.md) e [`audit-log`](audit-log.spec.md), de forma proveniente e
tenant-scoped. Tool fora do registry **não** produz operação válida.

## 17. Relação com verification, failure attribution, entropy e intervention

A tool registrada herda o bloco Observability: seu resultado é **verificável**
([`verification-report`](verification-report.spec.md)); sua falha é **atribuível**
([`failure-attribution`](failure-attribution.spec.md)); a entropia que introduz é **auditável**
([`entropy-audit`](entropy-audit.spec.md)); intervenção relacionada é **registrada**
([`intervention-log`](intervention-log.spec.md)).

---

## 18. Critérios de aceite

1. Define o tool registry como inventário governado (não catálogo) e a existência registral (§6, §7).
2. Fixa que **uma tool só existe se registrada, descrita e autorizada**; tool não registrada não executa.
3. Fixa o registro mínimo (§9), incluindo nome, finalidade e **status** (deprecated/blocked/experimental/
   tenant-specific/globally available), governado por specification e revisável por humano.
4. Distingue registro ≠ permissão ≠ execução ≠ verificação (§8); registro não executa, não concede
   permissão, não confere autoridade e não substitui service-contract nem as demais specs de tool.
5. Impede bypass de policy/tenant/boundary/authority; não transforma integração externa em autoridade.
6. Gera evento auditável em alteração; liga registro/invocação a trace/log; revisável por humano.

## 19. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Trata o registry como catálogo solto de funções.
2. Permite tool existir/ser executada sem registro, descrição ou autorização.
3. Confunde registro com permissão ou execução.
4. Transforma integração externa em autoridade operacional, ou dá autoridade à tool/LLM/agente/prompt/
   runtime.
5. Permite bypass de policy, tenant scope, operational boundary ou authority layer.
6. Não trata ausência/ambiguidade/conflito por bloqueio/pendência/escalada.
7. Altera o registry sem evento auditável, ou não liga registro/invocação a trace/log.
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; infere stack; ou reposiciona o YZI OS.

---

## 20. Quando bloquear, pendenciar evidência ou escalar

1. **Bloquear** o registro/uso quando descrição, autoridade, escopo ou subordinação a policy forem
   insuficientes — **tool não registrada não pode ser executada**.
2. **Pendenciar evidência** quando faltar evidência mínima para registrar/manter a tool.
3. **Escalar** quando o registro exceder a fronteira automática ou exigir autoridade humana. **Ausência,
   ambiguidade ou conflito no registro de uma tool** **DEVE** gerar **bloqueio, pendência de evidência ou
   escalada** — nunca uso silencioso.

## 21. Riscos arquiteturais evitados

- **Catálogo solto** — funções arbitrárias disponíveis sem governança.
- **Tool fantasma** — execução de tool não registrada/descrita.
- **Integração como autoridade** — conexão externa decidindo em vez de executar.
- **Bypass via registro** — registrar para escapar de policy/tenant/boundary/authority.
- **Confusão registro/permissão/execução** — etapas colapsadas.
- **Alteração opaca** — mudar o registry sem evento auditável.

## 22. Dependências

[`service-contract`](service-contract.spec.md), [`operational-state`](../p1/operational-state.spec.md),
[`event-driven-state`](../p1/event-driven-state.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md),
[`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md),
[`policy-enforcement`](../p2/policy-enforcement.spec.md), [`operational-boundaries`](../p2/operational-boundaries.spec.md),
[`tenant-retrieval-scope`](../p2/tenant-retrieval-scope.spec.md), [`episode-trace`](episode-trace.spec.md),
[`audit-log`](audit-log.spec.md), [`verification-report`](verification-report.spec.md),
[`failure-attribution`](failure-attribution.spec.md), [`entropy-audit`](entropy-audit.spec.md),
[`intervention-log`](intervention-log.spec.md).

## 23. Próxima spec recomendada

`tool-permission` (fronteira de permissão por tool), depois `tool-execution` e `tool-result-verification`
— ver [Specification Map](../../specification-engineering/specification-map.md). **Recomendação, não
autorização.** Esta spec **não** inicia `tool-permission`.

## 24. Checkpoint

Spec única criada: `/docs/specs/p3/tool-registry.spec.md`. Documental, governance-first, contract-first,
em linguagem natural estruturada. Não cria nenhuma outra spec, tool, service, skill, subagente, harness,
código, API, schema, YAML/JSON nem contrato machine-readable. Conformidade com `P14`/`P2`/`DO4`/`DO5` e
com a ordem de valores (verdade operacional 1ª; segurança/isolamento; auditabilidade 4ª). Aguarda revisão
e aprovação humana.

---

## Proveniência

`[HARNESS-RT]` AI Harness Runtime — registro de tools e fronteira de permissão governados por contrato;
tools executam sob permissão, com trace. `[PYR]` Context→Intent→Specification — contract-first; registrar≠
permitir≠executar. `[HE-GOV]` Harness Engineering / Governança — operação fora do contrato não prossegue;
sem bypass de policy.

## Fronteiras (o que NÃO está aqui)

- **Não** substitui `P14` nem a arquitetura de tools: é a spec que os **opera** como contrato de registro
  de tools verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza `tool-permission`/`tool-execution`/`tool-result-verification` nem nenhuma spec futura —
  apenas fixa o registro de tools que as demais herdam.

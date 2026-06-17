# tenant-harness

> **Specification documental de harness (governança-first, tenant-first, harness-preparation,
> linguagem natural estruturada).** Quarta peça do conjunto mínimo de **harnesses documentais da P4**
> — completa os quatro fundacionais (runtime · governance · observability · tenant). Fixa o **contrato
> documental do tenant-harness** — o substrato que **verifica se o isolamento multi-tenant está
> preservado** — **sem implementar isolamento**, sem virar middleware/RLS/banco de dados e sem virar
> harness executável. **Não** é machine-readable: não contém código, API, schema, YAML, JSON, DSL,
> pseudo-código, configuração nem contrato técnico executável. Apenas **referencia** o cânone
> aprovado; não o duplica, resume nem substitui.
>
> Onda: **P4** (harness documental mínimo) · Status: proposta para aprovação · Versão: v1 ·
> Data: 2026-06-04 · Documento normativo (DEVE / NÃO DEVE / NUNCA têm força contratual).
> Proveniência: `[PYR]` `[CE]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]`.

> **Briefing completo (transparência).** Diferente das peças anteriores, o briefing desta spec chegou
> **íntegro**: as **35 condições obrigatórias (1–35)** e as **28 seções** vieram sem truncamento.
> **Nenhuma condição foi reconstruída** — todas são literais conforme o operador.

> **Correção conceitual registrada.** O [Operational Harness Map §8](../../../harness-engineering/operational-harness-map.md)
> rotula o `tenant-harness` como **Onda P5**. A **decisão vigente do operador** posiciona os
> **harnesses mínimos documentais** na **P4**. Esta spec adota **P4**; divergência apenas de rotulagem
> de onda, sem alterar papel, fronteira ou doutrina.

---

## 1. Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `tenant-harness` |
| **Tipo de peça** | harness operacional — **documental nesta fase** (não executável) |
| **Função primária** | verificação de preservação do isolamento multi-tenant |
| **Classe** | fundacional ([Operational Harness Map §14](../../../harness-engineering/operational-harness-map.md)) |
| **Tenant-scope** | Per-tenant (é o substrato da partição) |
| **Proveniência** | `[PYR]` `[CE]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]` |

**Fontes consolidadas (referência, não duplicação):**
- [`operational-harness-map.md`](../../../harness-engineering/operational-harness-map.md) §4, §5, §6, §9.4, §14, §16, §19.
- [`controlled-execution-plan.md`](../../../implementation/controlled-execution-plan.md) §12.
- [`runtime-harness.spec.md`](runtime-harness.spec.md), [`governance-harness.spec.md`](governance-harness.spec.md), [`observability-harness.spec.md`](observability-harness.spec.md) (peças-par; §18–§20).
- Raiz multi-tenant: [`tenant-boundary`](../../p0/tenant-boundary.spec.md) (P0); [`tenant-state-isolation`](../../p1/tenant-state-isolation.spec.md) (P1); [`tenant-configuration`](../../p2/tenant-configuration.spec.md), [`tenant-policy-pack`](../../p2/tenant-policy-pack.spec.md), [`tenant-retrieval-scope`](../../p2/tenant-retrieval-scope.spec.md) (P2).
- [`specs-p0-p3-checkpoint.md`](../../specs-p0-p3-checkpoint.md). Specs P0–P4 em **§26 (Dependências)**.

---

## 2. Status, camada, onda e owner arquitetural

| Campo | Valor |
| --- | --- |
| **Status** | proposta para aprovação · architecture-only · governance-first · tenant-first |
| **Camada** | `specs/p4/harnesses` |
| **Onda** | **P4** (harness documental mínimo; correção P5→P4 registrada no topo) |
| **Owner arquitetural** | Tenant / Arquitetura |
| **Natureza** | harness **documental**, **não** executável; **verifica** o isolamento multi-tenant, **não** o implementa |
| **Modularidade** | modular, revisável e subordinado a specification ([condição 34](#11-limites-do-harness)) |

---

## 3. Propósito

Fixar, como **contrato documental verificável**, **como o tenant-harness verifica que o isolamento
multi-tenant está preservado** no YZI OS — garantindo que **tenant scope, tenant boundary, tenant
policy pack, tenant retrieval scope, estado, memória, contexto, retrieval, traces, evidências, tools,
services e futuras execuções** permaneçam **isolados por tenant** — e **impedindo que qualquer
operação futura prossiga com tenant ausente, ambíguo, conflitante ou cruzado**. Esta peça **não
implementa isolamento**, **não é** middleware, RLS ou banco de dados, e **preserva a tenant boundary
como invariante, não como configuração opcional**.

O propósito é operar, em fase documental, o invariante-raiz de
[`tenant-boundary`](../../p0/tenant-boundary.spec.md): *a fronteira entre tenants é invariante de
engenharia, não configuração*; *nenhum caminho atravessa a fronteira*; *dúvida sobre fronteira
bloqueia ou escala*. O tenant-harness é o **substrato transversal** onde se verifica que nenhuma
camada — LLM, agente, runtime, subagente, tool ou prompt — infere, relaxa ou cruza a fronteira.

---

## 4. Escopo

Esta spec cobre, em linguagem natural estruturada:

1. a **definição documental** do tenant-harness como substrato de verificação de isolamento (§6);
2. a distinção **verificação de isolamento ≠ implementação de isolamento** (§7, §11);
3. a **diferença** entre tenant-harness, tenant boundary, tenant state isolation, tenant retrieval
   scope, tenant policy pack, RLS, middleware, runtime, service e tool (§8);
4. as **entradas e saídas conceituais** do harness (§9, §10);
5. as **relações** com P0–P4, runtime/governance/observability-harness e execution governance
   (§12–§21);
6. os **critérios de aceite e rejeição** e o **protocolo de bloqueio/pendência/escalada** (§22–§24).

Tudo é **descritivo e revisável por humano**, jamais executável.

---

## 5. Fora de escopo

Esta spec **NÃO**:

- cria `execution-harness.spec.md` nem qualquer outro harness ([condição 35](#5-fora-de-escopo));
- cria harness **executável**, implementation harness, middleware, RLS, banco de dados, runtime
  paralelo, policy engine ou implementação de isolamento ([condições 1–8, 35](#5-fora-de-escopo));
- cria subagentes executáveis, skills executáveis, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, DSL, pseudo-código, configuração ou contrato machine-readable;
- infere stack técnica nem se transforma em plano de implementação;
- **decide operação, autoriza ação, executa tool ou altera estado** ([condições 9–12](#7-tenant-harness-como-verificação-de-isolamento-não-implementação));
- **implementa** o isolamento (isso é dos services/estado/policies, sob as specs por-tenant) — apenas
  **verifica** que ele está preservado.

---

## 6. Definição do harness

> **Tenant-harness** = **substrato documental que verifica que o isolamento multi-tenant está
> preservado** — confirmando que tenant scope, boundary, policy pack, retrieval scope, estado,
> memória, contexto, retrieval, traces, evidências e futuras execuções permanecem **isolados por
> tenant**, e **impedindo que qualquer operação prossiga com tenant ausente, ambíguo, conflitante ou
> cruzado** — **sem implementar isolamento** e **sem definir** middleware, RLS, banco de dados ou
> stack de persistência. Ele **verifica a partição**; não a executa nem a contém. `[PYR]` `[CE]`

Nesta fase, o tenant-harness é **harness documental, não executável**: ele **verifica** isolamento
multi-tenant, mas **não o implementa**. Não é implementation harness, não é código, não é API, **não
é middleware executável**, **não é RLS**, **não é banco de dados**; **não decide operação**, **não
autoriza ação**, **não executa tool** nem **altera estado** (cond. 1–12). Opera o invariante de
[`tenant-boundary`](../../p0/tenant-boundary.spec.md): a fronteira é **invariante de engenharia, não
configuração** (cond. 26), e a verticalização **nunca** a rompe (cond. 27). É **transversal** às 9
camadas — não uma etapa, mas uma **condição de contorno** de todas
([Operational Harness Map §9.4, §19](../../../harness-engineering/operational-harness-map.md)).

---

## 7. Tenant-harness como verificação de isolamento, não implementação

O tenant-harness existe para **verificar que o isolamento está preservado**, não para construí-lo.
Fixa, como contrato, a fronteira entre o que ele **deve verificar/impedir/exigir** e o que **jamais
pode implementar, decidir ou executar**.

**Bloco natureza/identidade — condições 1–12:**

| # | Condição | Status |
| --- | --- | --- |
| 1 | tenant-harness é **harness documental, não harness executável** nesta fase | literal |
| 2 | **verifica** isolamento multi-tenant, mas **não implementa** isolamento | literal |
| 3 | **não é** implementation harness | literal |
| 4 | **não é** código | literal |
| 5 | **não é** API | literal |
| 6 | **não é** middleware executável | literal |
| 7 | **não é** RLS | literal |
| 8 | **não é** banco de dados | literal |
| 9 | **não decide** operação | literal |
| 10 | **não autoriza** ação | literal |
| 11 | **não executa** tool | literal |
| 12 | **não altera** estado | literal |

**Bloco "deve verificar" — condições 13–22 (literais):** o tenant-harness **deve verificar** tenant
scope (13), tenant boundary (14), tenant policy pack (15), tenant retrieval scope (16), tenant state
isolation (17), **isolamento de memória por tenant** (18), **isolamento de contexto por tenant** (19),
**isolamento de retrieval por tenant** (20), **isolamento de traces, audit logs e evidence packages
por tenant** (21), e que **services e tools futuras não atuem fora do tenant autorizado** (22).

**Bloco "deve impedir" — condições 23–27 (literais):** o tenant-harness **deve impedir** inferência de
tenant pelo LLM, agente, runtime, subagente, tool ou prompt (23); que tenant **ausente, ambíguo,
conflitante ou cruzado** seja tratado como válido (24); **cruzamento** de estado, memória, contexto,
retrieval, policy, trace, evidence, service ou tool execution entre tenants (25); que **configuração
de tenant vire exceção à tenant boundary** (26); e que **verticalização rompa isolamento** (27).

**Bloco "deve exigir / observabilidade / modularidade" — condições 28–35 (literais):** **exigir
bloqueio, pendência de evidência ou escalada** quando tenant scope/boundary não puder ser validado
(28); **exigir evidência auditável de tenant scope** quando aplicável (29); **alimentar ou exigir**
episode trace e audit log quando futuramente implementado (30); **falha** atribuível por failure
attribution (31); **entropia** auditável por entropy audit (32); **intervenção** registrada por
intervention log (33); **permanecer modular, revisável e subordinado a specification** (34); e **não
virar** middleware prematuro, RLS, banco de dados, runtime paralelo, policy engine, executor ou
implementação de isolamento (35).

---

## 8. Diferença entre tenant-harness, tenant boundary, tenant state isolation, tenant retrieval scope, tenant policy pack, RLS, middleware, runtime, service e tool

Extraída de [`tenant-boundary`](../../p0/tenant-boundary.spec.md),
[`tenant-state-isolation`](../../p1/tenant-state-isolation.spec.md) e
[Operational Harness Map §9.4](../../../harness-engineering/operational-harness-map.md), sem inventar
doutrina:

| Conceito | É… | Implementa isolamento? | O tenant-harness… |
| --- | --- | --- | --- |
| **Tenant-harness (este)** | substrato documental de **verificação** de isolamento | **não** | é o próprio substrato |
| **Tenant boundary** | a **regra-raiz**: fronteira como invariante de engenharia (P0) | não (declara) | **verifica** que é preservada; não a substitui (cond. 14, 26) |
| **Tenant state isolation** | especialização da fronteira no **estado** (P1) | não (declara) | **verifica** (cond. 17) |
| **Tenant retrieval scope** | especialização no **retrieval** (P2) | não (declara) | **verifica** (cond. 16, 20) |
| **Tenant policy pack** | verticalização governada de policies por tenant (P2) | não (declara) | **verifica**; impede virar exceção (cond. 15, 26) |
| **RLS** | mecanismo técnico de isolamento em dados (futuro) | sim (executável) | **não é** RLS (cond. 7, 35) |
| **Middleware** | camada técnica de interceptação (futuro) | sim (executável) | **não é** middleware (cond. 6, 35) |
| **Runtime** | coordenação leve do episódio | não | impede que **infira** tenant (cond. 23); não vira runtime paralelo (cond. 35) |
| **Service** | decisão institucional em contrato | não | verifica que **age só no tenant autorizado** (cond. 22) |
| **Tool** | execução de efeito sob permissão | não | verifica que **não atua fora do tenant** (cond. 22, 25) |

Distinção essencial `[PYR]`: a **fronteira é invariante de engenharia, não configuração** — o
tenant-harness **verifica** que assim permanece (cond. 26), mas **não é** o mecanismo técnico (RLS,
middleware, banco) que a executa (cond. 6–8, 35). Verificar o isolamento ≠ implementá-lo.

---

## 9. Entradas conceituais do harness

Em linguagem natural (nenhuma é estrutura de máquina):

1. a **identidade de tenant** de cada operação, estado, memória, contexto, fragmento, retrieval,
   trace, evidence, service ou tool execution;
2. qualquer **caminho de acesso** (leitura, recuperação, execução, delegação) a verificar contra a
   fronteira;
3. o **tenant policy pack** e o **tenant retrieval scope** vigentes (verticalização governada);
4. os **sinais de tenant ausente, ambíguo, conflitante ou cruzado** que exigem bloqueio/escalada;
5. as **configurações de tenant** a verificar quanto a não virarem exceção à fronteira.

O que chega como **inferência de tenant** por LLM/agente/runtime/subagente/tool/prompt **não** é
aceito como identidade válida (cond. 23); tenant ausente/ambíguo/conflitante/cruzado **nunca** é
tratado como válido (cond. 24).

---

## 10. Saídas conceituais do harness

1. um **veredito de isolamento** por acesso/operação: dentro do tenant / cruzamento detectado /
   ambíguo;
2. **bloqueio** de operação futura com tenant ausente, ambíguo, conflitante ou cruzado (cond. 24, 28);
3. **exigência de evidência auditável de tenant scope** quando aplicável (cond. 29);
4. **eventos** a alimentar/exigir em episode trace e audit log futuros (cond. 30);
5. **exigência de bloqueio, pendência de evidência ou escalada** quando scope/boundary não puder ser
   validado (cond. 28);
6. preservação registrada da **tenant boundary como invariante** — configuração e verticalização não
   a relaxam (cond. 26, 27).

Nenhuma saída é **implementação de isolamento, decisão de operação, autorização, execução ou
alteração de estado** — essas pertencem a estado/services/policies/tools sob as specs por-tenant.

---

## 11. Limites do harness

Limites invioláveis (o harness os verifica e os respeita; nunca os relaxa):

- **verifica** isolamento, mas **não o implementa**; não é middleware, RLS nem banco de dados (6–8);
  **não decide operação, não autoriza ação, não executa tool nem altera estado** (cond. 9–12);
- **deve verificar** scope/boundary/policy pack/retrieval scope/state isolation e o isolamento de
  memória/contexto/retrieval/traces-audit-evidence, e que services/tools não atuem fora do tenant
  (cond. 13–22);
- **deve impedir** inferência de tenant, tenant inválido tratado como válido, cruzamento entre
  tenants, configuração virando exceção e verticalização rompendo isolamento (cond. 23–27);
- **deve exigir** bloqueio/pendência/escalada e evidência auditável de tenant scope (cond. 28, 29);
- **deve alimentar/exigir** trace/audit log e ser atribuível/auditável/registrável por failure
  attribution/entropy audit/intervention log (cond. 30–33);
- **permanece modular, revisável e subordinado a specification** ([34](#11-limites-do-harness));
- **não vira** middleware prematuro, RLS, banco de dados, runtime paralelo, policy engine, executor
  ou implementação de isolamento ([35](#5-fora-de-escopo)).

---

## 12. Relação com P0

Herda como invariantes **aprovados** ([P0](../../p0/)):

- [`tenant-boundary`](../../p0/tenant-boundary.spec.md) — **regra-raiz**: o harness **verifica tenant
  boundary** (cond. 14), trata-a como **invariante, não configuração** (cond. 26), e **impede** que
  LLM/agente/runtime/prompt autorizem cruzamento (cond. 23, 25); aplica **atenuação de privilégio** na
  delegação (sempre dentro do tenant);
- [`core-operational-principles`](../../p0/core-operational-principles.spec.md) — `P10` (multi-tenant
  por desenho), `DO2` (isolamento contextual): partição por desenho, não opcional;
- [`layer-authority-model`](../../p0/layer-authority-model.spec.md) — autoridade sobre a fronteira é
  de Estado/Tenant/Services, **nunca** de Agents/Tools/LLM/Runtime (cond. 23);
- [`conflict-resolution`](../../p0/conflict-resolution.spec.md) — **isolamento multi-tenant é o valor
  3** da ordem de valores; dúvida de fronteira **bloqueia ou escala** (cond. 24, 28), nunca presume.

---

## 13. Relação com P1

- [`tenant-state-isolation`](../../p1/tenant-state-isolation.spec.md) — o harness **verifica tenant
  state isolation** (cond. 17): nenhum estado é lido/inferido/composto/recuperado/projetado/alterado
  cross-tenant; **impede o runtime de inferir tenant** (cond. 23);
- [`operational-state`](../../p1/operational-state.spec.md) — o estado é a verdade; o harness **não o
  altera** (cond. 12), apenas verifica que está particionado;
- [`event-driven-state`](../../p1/event-driven-state.spec.md) — todo evento carrega tenant scope;
  evento sem tenant é inválido (bloqueio/escalada — cond. 24, 28);
- [`memory-model`](../../p1/memory-model.spec.md) — o harness **verifica isolamento de memória por
  tenant** (cond. 18): working/episódica/semântica/procedural isoladas.

---

## 14. Relação com P2

- [`tenant-configuration`](../../p2/tenant-configuration.spec.md) — verticalização por **configuração
  declarada por tenant**; o harness **impede que configuração vire exceção à fronteira** (cond. 26) e
  que **verticalização rompa isolamento** (cond. 27) — configurar adiciona perímetro, não o remove;
- [`tenant-policy-pack`](../../p2/tenant-policy-pack.spec.md) — **verifica tenant policy pack** aplicado
  por tenant (cond. 15), sem permitir bypass;
- [`tenant-retrieval-scope`](../../p2/tenant-retrieval-scope.spec.md) — **verifica tenant retrieval
  scope** (cond. 16) e **isolamento de retrieval por tenant** (cond. 20);
- [`context-isolation`](../../p2/context-isolation.spec.md), [`context-assembly`](../../p2/context-assembly.spec.md),
  [`context-provenance`](../../p2/context-provenance.spec.md) — **verifica isolamento de contexto por
  tenant** (cond. 19), sem contaminação cross-tenant;
- [`retrieval-governance`](../../p2/retrieval-governance.spec.md) — retrieval governado dentro do
  tenant; [`policy-enforcement`](../../p2/policy-enforcement.spec.md), [`operational-boundaries`](../../p2/operational-boundaries.spec.md),
  [`escalation-policy`](../../p2/escalation-policy.spec.md) — fundam o **bloqueio/escalada** (cond. 28)
  e o enforcement do tenant (verificado, não substituído).

---

## 15. Relação com P3

- [`episode-trace`](../../p3/episode-trace.spec.md), [`audit-log`](../../p3/audit-log.spec.md) — o
  harness **verifica isolamento de traces, audit logs e evidence packages por tenant** (cond. 21) e
  **alimenta/exige** trace e audit log (cond. 30);
- [`failure-attribution`](../../p3/failure-attribution.spec.md) — **falha do tenant-harness é
  atribuível** (cond. 31); falha de fronteira é tipo de falha atribuível;
- [`entropy-audit`](../../p3/entropy-audit.spec.md) — **entropia causada pelo harness é auditável**
  (cond. 32);
- [`intervention-log`](../../p3/intervention-log.spec.md) — **intervenção é registrada** (cond. 33);
- [`verification-report`](../../p3/verification-report.spec.md) — exige **evidência auditável de
  tenant scope** quando aplicável (cond. 29); conclusão = evidência;
- cadeia de execução ([`service-contract`](../../p3/service-contract.spec.md),
  [`tool-registry`](../../p3/tool-registry.spec.md), [`tool-permission`](../../p3/tool-permission.spec.md),
  [`tool-execution`](../../p3/tool-execution.spec.md), [`tool-result-verification`](../../p3/tool-result-verification.spec.md)) —
  **verifica que services e tools futuras não atuem fora do tenant autorizado** (cond. 22) e que
  nenhuma tool execution cruza tenants (cond. 25).

---

## 16. Relação com P4 skills mínimas

| Skill mínima | Relação com a verificação de isolamento |
| --- | --- |
| [`intent-extraction`](../skills/intent-extraction-skill.spec.md) | a intenção (Metadata) **não** pode inferir nem trocar tenant; o harness impede inferência (cond. 23) |
| [`context-assembly`](../skills/context-assembly-skill.spec.md) | o harness verifica **isolamento de contexto por tenant** no pacote montado (cond. 19) |
| [`provenance-tagging`](../skills/provenance-tagging-skill.spec.md) | proveniência por fragmento carrega tenant; sustenta a evidência auditável de scope (cond. 29) |
| [`evidence-compilation`](../skills/evidence-compilation-skill.spec.md) | a evidência compilada é tenant-scoped; ausência de prova de scope ⇒ bloqueio/escalada (cond. 28) |

As skills operam **dentro** do tenant-scope; o harness **verifica** que nenhuma recupera, compõe ou
infere fora do tenant — sem implementar a partição.

---

## 17. Relação com P4 subagentes mínimos

| Subagente mínimo | Relação com o tenant-harness |
| --- | --- |
| [`interface-subagent`](../subagents/interface-subagent.spec.md) | impede que linguagem/prompt atravesse a fronteira ou infira tenant (cond. 23, 25) |
| [`retrieval-subagent`](../subagents/retrieval-subagent.spec.md) | verifica **isolamento de retrieval por tenant** (cond. 20); recuperação read-only, tenant-scoped |
| [`verification-subagent`](../subagents/verification-subagent.spec.md) | auditor independente verifica scope; o harness exige **evidência auditável de tenant scope** (cond. 29) |

Na delegação entre subagentes, vale a **atenuação de privilégio**, **sempre dentro do mesmo tenant**;
delegar não transfere acesso cross-tenant (cond. 25).

---

## 18. Relação com runtime-harness

- O [`runtime-harness`](runtime-harness.spec.md) **coordena** o episódio **sempre dentro** do
  tenant-scope que o tenant-harness impõe/verifica; o runtime **não infere tenant** (cond. 23) — é o
  tenant-harness que verifica essa fronteira.
- **Transversalidade:** o tenant-harness **não é uma etapa** coordenada pelo runtime; é uma **condição
  de contorno** de toda coordenação ([Operational Harness Map §19](../../../harness-engineering/operational-harness-map.md)).
- **Composição, não contenção:** o runtime delega o isolamento a este substrato, que permanece
  desacoplado; o tenant-harness **não vira runtime paralelo** (cond. 35).

---

## 19. Relação com governance-harness

- O [`governance-harness`](governance-harness.spec.md) **aplica/verifica governança**; o
  tenant-harness **verifica a partição** sob a qual essa governança opera — incluindo o **tenant
  policy pack** (cond. 15), que o governance aplica e o tenant-harness verifica isolado por tenant.
- **Complementares:** o tenant-harness **impede bypass de tenant boundary** (cond. 25, 26) — uma das
  fronteiras que o governance-harness também protege; juntos garantem que **verticalização não rompe
  isolamento** (cond. 27) nem governança.
- O tenant-harness **não é policy engine** (cond. 35): verifica a partição, não aplica a regra.

---

## 20. Relação com observability-harness

- O [`observability-harness`](observability-harness.spec.md) verifica **presença/coerência da
  evidência**; o tenant-harness verifica que essa evidência — **traces, audit logs e evidence
  packages — está isolada por tenant** (cond. 21).
- **Complementares:** observability exige que a evidência exista; tenant exige que ela **não cruze
  tenants**. Ambos sustentam **evidência auditável de tenant scope** (cond. 29) e a independência
  executor↔auditoria, isolada por tenant.
- O tenant-harness **alimenta/exige** trace e audit log (cond. 30), que o observability-harness
  verifica — sem que nenhum dos dois implemente a observabilidade.

---

## 21. Relação com execution governance

O tenant-harness **verifica a fronteira de tenant** ao longo da cadeia de execução; a **coordenação** é
do runtime-harness, a **governança** do governance-harness, e a **execução controlada** será do futuro
**execution-harness** (**não criado aqui**):

- registro (tool-registry) → decisão (service-contract) → permissão (tool-permission) → execução
  (tool-execution) → verificação (tool-result-verification);
- o harness **verifica que services e tools futuras não atuem fora do tenant autorizado** (cond. 22) e
  **impede cruzamento de tool execution entre tenants** (cond. 25);
- **não executa, não autoriza, não decide, não altera estado** (cond. 9–12) — apenas verifica a
  partição e bloqueia/escala violações (cond. 28).

---

## 22. Critérios de aceite

A spec é aceita quando:

1. trata o tenant-harness como **harness documental, não executável**, que **verifica isolamento sem
   implementá-lo** — não é middleware, RLS, banco de dados, código nem API, e não decide/autoriza/
   executa/altera estado (cond. 1–12);
2. **verifica** tenant scope, boundary, policy pack, retrieval scope, state isolation, e o isolamento
   de memória/contexto/retrieval/traces-audit-evidence, e que services/tools não atuem fora do tenant
   (cond. 13–22);
3. **impede** inferência de tenant, tenant inválido como válido, cruzamento entre tenants,
   configuração como exceção e verticalização rompendo isolamento (cond. 23–27);
4. **exige** bloqueio/pendência/escalada quando scope/boundary não puder ser validado (28) e
   **evidência auditável de tenant scope** quando aplicável (29);
5. **alimenta/exige** trace e audit log (30); falha/entropia/intervenção **atribuíveis/auditáveis/
   registradas** (31–33);
6. permanece **modular, revisável e subordinado a specification** (34) e **não vira** middleware
   prematuro, RLS, banco de dados, runtime paralelo, policy engine, executor ou implementação de
   isolamento (35);
7. **referencia** o cânone P0–P4 sem duplicá-lo, resumi-lo ou inventar doutrina; é revisável por
   humano.

---

## 23. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. trata o harness como **executável**, implementation harness, código, API, schema, middleware, RLS,
   banco de dados, runtime paralelo, policy engine ou implementação de isolamento (viola cond. 1–8,
   35);
2. **decide operação, autoriza ação, executa tool ou altera estado** por conta própria (viola cond.
   9–12);
3. **deixa de verificar** scope/boundary/policy pack/retrieval scope/state isolation ou o isolamento
   de memória/contexto/retrieval/traces/evidence, ou que services/tools não atuem fora do tenant
   (viola cond. 13–22);
4. permite **inferência de tenant** por qualquer camada, ou trata **tenant ausente/ambíguo/
   conflitante/cruzado como válido** (viola cond. 23, 24);
5. permite **cruzamento** de estado/memória/contexto/retrieval/policy/trace/evidence/service/tool
   execution entre tenants (viola cond. 25);
6. permite **configuração virar exceção** à boundary ou **verticalização romper isolamento** (viola
   cond. 26, 27);
7. **absorve silenciosamente** scope/boundary não validável em vez de **bloquear/pendenciar/escalar**,
   ou dispensa **evidência auditável de tenant scope** (viola cond. 28, 29);
8. dispensa trace/audit log, ou a atribuição/auditoria/registro de falha, entropia ou intervenção
   (viola cond. 30–33);
9. cria **outro harness**, harness executável, subagente/skill executável, código, API, schema,
   frontend, backlog, YAML/JSON ou contrato machine-readable (viola guardrails / cond. 35);
10. **infere stack técnica**, vira plano de implementação, **resume/duplica/inventa** doutrina, ou
    reposiciona o YZI OS como chatbot, SaaS genérico, automação simples ou wrapper de LLM.

---

## 24. Quando bloquear, pendenciar evidência ou escalar

O tenant-harness **impede absorção silenciosa** e **exige bloqueio, pendência de evidência ou escalada
quando o tenant scope/boundary não puder ser validado** ([condição 28](#24-quando-bloquear-pendenciar-evidência-ou-escalar)):

| Gatilho | Resposta obrigatória |
| --- | --- |
| **tenant ausente** | bloquear (sem tenant não há operação — cond. 24, 28) |
| **tenant ambíguo ou conflitante** | bloquear ou escalar; **nunca** inferir (cond. 23, 24) |
| **cruzamento detectado** (estado/memória/contexto/retrieval/policy/trace/evidence/service/tool) | bloquear (cond. 25) |
| **scope/boundary não validável** | bloqueio, pendência de evidência ou escalada (cond. 28) |
| **evidência de tenant scope ausente** | pendenciar evidência; exigir prova auditável (cond. 29) |
| **configuração como exceção à boundary** | rejeitar e registrar (cond. 26) |
| **verticalização rompendo isolamento** | bloquear e escalar (cond. 27) |
| **inferência de tenant** por LLM/agente/runtime/subagente/tool/prompt | bloquear (cond. 23) |

Regra-mãe: **nunca admissão silenciosa**. Dúvida de fronteira → **bloqueio, pendência ou escalada
registrada**, conforme [`conflict-resolution`](../../p0/conflict-resolution.spec.md) (valor 3),
[`escalation-policy`](../../p2/escalation-policy.spec.md) e [`intervention-log`](../../p3/intervention-log.spec.md).

---

## 25. Riscos arquiteturais evitados

| Risco | Como esta spec o evita |
| --- | --- |
| **Vazamento cross-tenant** | impede cruzamento de estado/memória/contexto/retrieval/policy/trace/evidence/service/tool (cond. 25) |
| **Inferência de tenant** | impede LLM/agente/runtime/subagente/tool/prompt de inferir tenant (cond. 23) |
| **Tenant inválido tratado como válido** | tenant ausente/ambíguo/conflitante/cruzado nunca é válido (cond. 24) |
| **Isolamento como configuração** | boundary é invariante; configuração não vira exceção (cond. 26) |
| **Verticalização por fork / quebra de isolamento** | verticalização não rompe isolamento (cond. 27) |
| **Harness implementando isolamento** | verifica, não implementa; não é middleware/RLS/banco (cond. 2, 6–8, 35) |
| **Tool/service fora do tenant** | verifica que não atuam fora do tenant autorizado (cond. 22) |
| **Absorção silenciosa de dúvida de fronteira** | bloqueio/pendência/escalada obrigatórios (cond. 28) |
| **Trace/evidence vazado** | isolamento de traces/audit logs/evidence por tenant (cond. 21) |
| **Falha não atribuível** | failure attribution / entropy audit / intervention log (cond. 31–33) |

---

## 26. Dependências

**Aprovadas (referenciadas, não duplicadas):**

- **Mapas/processo/pares:** [`operational-harness-map.md`](../../../harness-engineering/operational-harness-map.md),
  [`controlled-execution-plan.md`](../../../implementation/controlled-execution-plan.md),
  [`runtime-harness.spec.md`](runtime-harness.spec.md), [`governance-harness.spec.md`](governance-harness.spec.md),
  [`observability-harness.spec.md`](observability-harness.spec.md),
  [`specs-p0-p3-checkpoint.md`](../../specs-p0-p3-checkpoint.md).
- **P0:** `core-operational-principles`, `layer-authority-model`, `conflict-resolution`,
  `tenant-boundary` (raiz).
- **P1:** `operational-state`, `event-driven-state`, `tenant-state-isolation`, `memory-model`.
- **P2:** `policy-enforcement`, `behavioral-governance`, `operational-boundaries`,
  `escalation-policy`, `context-assembly`, `context-isolation`, `context-provenance`,
  `retrieval-governance`, `tenant-configuration`, `tenant-policy-pack`, `tenant-retrieval-scope`.
- **P3:** `episode-trace`, `audit-log`, `failure-attribution`, `verification-report`,
  `entropy-audit`, `intervention-log`, `service-contract`, `tool-registry`, `tool-permission`,
  `tool-execution`, `tool-result-verification`.
- **P4 skills mínimas:** `intent-extraction`, `context-assembly`, `provenance-tagging`,
  `evidence-compilation`.
- **P4 subagentes mínimos:** `interface-subagent`, `retrieval-subagent`, `verification-subagent`.

**Futuras (pendentes; bloqueiam a promoção executável):** specs de tenant do mapa (consolidação
`tenant-harness` transversal); o `execution-harness` (quando houver tool com efeito); o Implementation
Harness / Spec Executor. Enquanto não aprovados, a promoção **executável** do isolamento permanece
bloqueada (contract-first, `P15`/`DO4`).

---

## 27. Próxima peça recomendada

Direção recomendada — **a confirmar separadamente, sem autorização de execução aqui**: com os **quatro
harnesses fundacionais documentais** (runtime, governance, observability, tenant) completos, a próxima
peça natural é **`execution-harness.spec.md`** — substrato de execução controlada (tool sob permissão,
gates, verificação de resultado) — que [Operational Harness Map §16](../../../harness-engineering/operational-harness-map.md)
prevê **assim que houver a primeira tool/serviço com efeito**. Alternativamente, um **checkpoint do
conjunto mínimo de harnesses** (consolidando os quatro). Documental, **uma peça por vez, com
checkpoint**. **Esta spec não autoriza a próxima peça** e **não avança para o próximo harness**.

---

## 28. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/harnesses/tenant-harness.spec.md`. Nenhum outro arquivo
   criado ou alterado.
2. **Natureza respeitada:** architecture-only · governance-first · tenant-first · harness-preparation ·
   linguagem natural estruturada. Harness **documental, não executável**; **não** é implementation
   harness, middleware, RLS, banco de dados, código, API, schema, YAML/JSON nem contrato
   machine-readable.
3. **Estrutura:** exatamente as **28 seções** exigidas.
4. **35 condições obrigatórias:** todas **explícitas e literais** (§7), **sem reconstrução** — o
   briefing chegou íntegro. Blocos: identidade 1–12, "deve verificar" 13–22, "deve impedir" 23–27,
   "deve exigir/observabilidade/modularidade" 28–35.
5. **Correção conceitual:** onda **P5→P4** registrada; divergência apenas de rotulagem.
6. **Cânone:** P0–P4, mapa de harnesses, plano de execução e os três harnesses-par **referenciados,
   não duplicados**; nenhuma doutrina nova inventada (`tenant-boundary`/`tenant-state-isolation` lidos
   na íntegra).
7. **Confirmação de fronteira:** **nenhum** outro harness (`execution` ou qualquer outro), harness
   executável, implementation harness, subagente/skill executável, código, API, schema, frontend,
   backlog, YAML/JSON ou contrato machine-readable foi criado. Specs P0–P4, mapas e checkpoints
   anteriores **não** modificados. Nenhuma stack inferida.

**Parado aqui. Não avancei para o próximo harness.**

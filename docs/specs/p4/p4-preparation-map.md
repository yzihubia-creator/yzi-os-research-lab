# YZI OS — P4 Preparation Map

> **Documento de arquitetura (ponte), architecture/process-only · governance-first.** Mapa de
> **preparação** da Onda P4. **Não** é uma spec operacional individual, nem inicia P4. Apenas
> organiza, deriva e consolida — a partir dos mapas e checkpoints já aprovados — **quais**
> skills, subagentes e harnesses futuros P4 deverá considerar, e **como** as specs P0–P3 já
> aprovadas os governam. **Não** cria skill, subagente ou harness executável, código, API,
> schema, frontend, backlog, sprint plan, roadmap técnico, contrato machine-readable, YAML/JSON
> ou DSL. A arquitetura continua sendo o produto.
>
> Camada: `specs/p4` (preparação) · Status: preparação · Versão: v1 · Data: 2026-06-04
> Natureza: consolidation/bridge · architecture/process-only · spec-driven · checkpoint-based.
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]`.

> **Nota de reconstrução (transparência).** O briefing desta fase chegou truncado: a lista
> numerada de seções obrigatórias perdeu os itens **1–3** (o texto sobrevivente começa no item 4,
> "skills futuras") e cortou a partir do item **12** ("Critério…"). A estrutura abaixo foi
> **reconstruída** a partir (a) dos itens 4–12 sobreviventes, (b) do padrão dos mapas anteriores
> (skill-map, subagent-map, operational-harness-map) e (c) da "Entrega esperada" do próprio
> briefing. Os itens reconstruídos (1–3, 13 em diante) estão sinalizados. Disponível para **ajuste
> aditivo direcionado** caso a numeração pretendida divirja.

---

## 1. Propósito do P4 Preparation Map *(seção reconstruída)*

Este documento responde a uma pergunta de preparação, **não** de execução:

> Concluídas e seladas as ondas de specs P0–P3 (31 specs), **o que** P4 deve considerar — quais
> skills, subagentes e harnesses futuros — e **sob qual governança já aprovada** esses elementos
> futuros operarão, sem que nenhum deles seja criado agora?

É a ponte entre as 31 specs aprovadas + os três mapas de capacidade (skills, subagentes,
harnesses) + o plano de execução controlada, de um lado, e a futura Onda P4, de outro. **Orienta**
P4; não a inicia.

---

## 2. Natureza do documento — o que é e o que NÃO é *(seção reconstruída)*

**É:** mapa de preparação · consolidation/bridge · governance-first · architecture/process-only ·
linguagem natural estruturada · curto e revisável · derivado fielmente das fontes canônicas.

**NÃO é:** spec P4 individual · spec operacional · plano técnico de implementação · backlog ·
sprint plan · roadmap técnico/de código · contrato machine-readable · YAML/JSON/schema/DSL ·
inferência de stack técnica · skill/subagente/harness executável.

Este documento **referencia** as fontes; **não** as duplica, resume ou substitui, e **não**
modifica nenhuma spec P0–P3 nem os checkpoints anteriores.

---

## 3. Status consolidado das fases e ondas anteriores *(seção reconstruída)*

| Fase / Onda | Entrega | Status |
| --- | --- | --- |
| Fases 1–7 | foundation → architecture → PRD → specification-map → skill/subagent maps → harness map → controlled-execution-plan | ✅ Aprovadas |
| **P0** (4) | core-operational-principles · layer-authority-model · conflict-resolution · tenant-boundary | ✅ Concluída |
| **P1** (4) | operational-state · event-driven-state · tenant-state-isolation · memory-model | ✅ Concluída |
| **P2** (12) | governance (4) + context/retrieval (5) + multi-tenant (3) | ✅ Concluída |
| **P3** (11) | observability (6) + execution (5) | ✅ Concluída |
| Checkpoints | `specs-p0-p2-checkpoint.md` · `specs-p0-p3-checkpoint.md` | ✅ Aprovados |
| **P4** | — | ⏸ **Não iniciada** (este documento apenas prepara) |

**Total selado: 31 specs documentais aprovadas.**

---

## 4. Skills futuras a considerar (do Skill Map) — sem criar nenhuma skill executável

Derivado fielmente do [Skill Map](../../skills/skill-map.md): **9 skills futuras** em 5 grupos.
P4 deve **considerá-las como candidatas governadas**, nunca criá-las aqui.

| Skill | Grupo | Specs governantes (já aprovadas) |
| --- | --- | --- |
| `context-assembly` | S-A Contexto | context-assembly, context-lifecycle |
| `context-curation` | S-A Contexto | context-lifecycle |
| `provenance-tagging` | S-A Contexto | context-provenance |
| `retrieval-query` | S-B Recuperação | retrieval-governance, tenant-retrieval-scope |
| `intent-extraction` | S-C Linguagem/Intenção | behavioral-governance (+ institutional-agent, futura) |
| `synthesis` | S-C Linguagem/Intenção | context-assembly, service-contract |
| `evidence-compilation` | S-D Verificação | verification-report, tool-result-verification |
| `failure-diagnosis` | S-D Verificação | failure-attribution |
| `escalation-trigger` | S-E Fronteira | escalation-policy, operational-boundaries |

**Conjunto mínimo inicial recomendado** (Skill Map §8), apenas como direção: `intent-extraction`,
`context-assembly`, `provenance-tagging`, `evidence-compilation`. As demais entram quando suas
specs governantes estabilizam.

> Invariante preservado: uma skill **não detém autoridade comportamental** — propõe/transforma
> dentro de fronteiras; os services decidem, as tools executam, o estado é a verdade. (`P2` `P14`)

---

## 5. Subagentes futuros a considerar (do Subagent Map) — sem criar nenhum subagente executável

Derivado fielmente do [Subagent Map](../../subagents/subagent-map.md): **6 subagentes futuros**.

| Subagente | Papel | Specs governantes (já aprovadas) | Skills que compõe |
| --- | --- | --- | --- |
| `interface-subagent` | interface linguística institucional | behavioral-governance (+ agent specs futuras) | intent-extraction, context-assembly |
| `retrieval-subagent` | recuperação governada por tenant | retrieval-governance, tenant-retrieval-scope, context-assembly | retrieval-query, provenance-tagging, context-curation |
| `execution-proposal-subagent` | propor invocação sob permissão | tool-execution, tool-permission | (consome tools; não decide) |
| `verification-subagent` | auditor independente de conclusões | verification-report, failure-attribution, tool-result-verification | evidence-compilation, failure-diagnosis |
| `escalation-subagent` | escalada e intervenção humana | escalation-policy, intervention-log, operational-boundaries | escalation-trigger |
| `synthesis-subagent` | síntese de sinal para suporte à decisão | context-assembly, behavioral-governance, service-contract | synthesis, context-assembly |

**Conjunto mínimo inicial recomendado** (Subagent Map §8), apenas como direção: `interface-subagent`,
`retrieval-subagent`, `verification-subagent` — garantindo a **independência do auditor** desde o
início. Os demais entram quando as specs de execução, escalação e síntese estabilizam.

> Invariantes preservados: subagentes **propõem e operam dentro de fronteiras** (`P7`); **delegação
> ≠ composição**, com **atenuação de privilégio** (o privilégio só decresce, `[PYR]`); o
> **executor nunca audita** (`verification-subagent` read-only, ≠ executor, `[CE]`).

---

## 6. Harnesses futuros a considerar (do Operational Harness Map) — sem criar nenhum harness executável

Derivado fielmente do [Operational Harness Map](../../harness-engineering/operational-harness-map.md):
**9 harnesses futuros** (5 fundacionais + 4 posteriores), todos mapeados na Onda P5 do Specification
Map.

| # | Harness | Classe | Specs governantes (já aprovadas) |
| --- | --- | --- | --- |
| 1 | `runtime-harness` | fundacional | operational-state, event-driven-state (+ runtime specs futuras) |
| 2 | `governance-harness` | fundacional | policy-enforcement, behavioral-governance, operational-boundaries |
| 3 | `observability-harness` | fundacional | episode-trace, verification-report, failure-attribution |
| 4 | `tenant-harness` | fundacional | tenant-boundary, tenant-configuration, tenant-policy-pack, tenant-retrieval-scope, tenant-state-isolation |
| 5 | `execution-harness` | fundacional | tool-registry, tool-execution, tool-permission, tool-result-verification |
| 6 | `context-harness` | posterior | context-assembly, context-lifecycle, context-isolation, context-provenance |
| 7 | `retrieval-harness` | posterior | retrieval-governance, context-provenance, context-isolation, tenant-retrieval-scope |
| 8 | `audit-harness` | posterior | audit-log, entropy-audit, intervention-log |
| 9 | `escalation-harness` | posterior | escalation-policy, operational-boundaries, intervention-log |

**Conjunto mínimo inicial recomendado** (Harness Map §16), apenas como direção: `runtime-harness`,
`governance-harness`, `observability-harness`, `tenant-harness`; o `execution-harness` entra assim
que a primeira tool com efeito existir. Os posteriores (context, retrieval, audit, escalation)
entram quando a fundação estabiliza — evitando decomposição prematura.

> Invariantes preservados: um harness **coordena, restringe, verifica e audita — sem autoridade
> sobre a verdade operacional**; *nenhuma execução sem trace*; é **desacoplável** e
> **não-desativável pelo que fiscaliza** (`[HARNESS-RT]` `[AHE]` `[CE]`). O
> **Implementation/Spec Executor Harness permanece futuro e não especificado** (Harness Map §17).

---

## 7. Como as specs P0 governam qualquer skill, subagente ou harness futuro

As specs P0 (core-operational-principles, layer-authority-model, conflict-resolution,
tenant-boundary) são **raiz e bloqueantes**: nenhum elemento futuro pode contrariá-las.

- **Autoridade estratificada / LLM sem autoridade** → nenhuma skill, subagente ou harness detém
  autoridade comportamental; propõem/coordenam/verificam, mas não decidem a verdade.
- **Resolução por ordem de valores** (não por número) → todo conflito de comportamento futuro
  resolve-se por verdade operacional › segurança › isolamento multi-tenant › auditabilidade › …
- **Tenant boundary inviolável** → todo elemento futuro nasce particionado por tenant; a fronteira
  é invariante de engenharia, não configuração.

---

## 8. Como as specs P1 governam estado, memória e eventos para qualquer elemento futuro

As specs P1 (operational-state, event-driven-state, tenant-state-isolation, memory-model) fixam:

- **Estado persistido é a verdade operacional** → skills/subagentes tratam memória como **ambiente**
  (estado), nunca como campo interno; nenhum elemento futuro é fonte de verdade.
- **Evento é a unidade de mudança verificável** → toda mudança que um elemento futuro provoca passa
  por evento auditável, não por afirmação em linguagem.
- **Isolamento de estado por tenant** → nenhuma skill, subagente ou harness atravessa a fronteira
  de estado entre tenants.

---

## 9. Como as specs P2 governam contexto, retrieval, policies e tenant para qualquer elemento futuro

As 12 specs P2 fixam o envelope de governança em que os elementos futuros operam:

- **Governança** (policy-enforcement, behavioral-governance, operational-boundaries,
  escalation-policy) → enforcement é **determinístico e fora do prompt**; comportamento não vem de
  persona; boundaries restringem autonomia; escalada é governança, não falha.
- **Contexto/Retrieval** (context-assembly, context-lifecycle, context-isolation,
  context-provenance, retrieval-governance) → contexto é **pacote governado** (Authority › … ›
  Metadata), perecível, isolado, com proveniência por fragmento; retrieval é **face contextual da
  governança**, não busca livre.
- **Multi-tenant** (tenant-configuration, tenant-policy-pack, tenant-retrieval-scope) → a
  verticalização é configuração governada; o core prevalece; o escopo de retrieval respeita
  soberania de dados por tenant.

---

## 10. Como as specs P3 governam observabilidade, service/tool execution e verificação para qualquer elemento futuro

As 11 specs P3 fixam o substrato de comprovação e a cadeia de execução:

- **Observability** (episode-trace, audit-log, failure-attribution, verification-report,
  entropy-audit, intervention-log) → *observability antes de execução confiável*; toda atuação
  futura é episódio auditável; falha é **atribuída antes de corrigida**; conclusão = evidência, não
  asserção; intervenção é sinal diagnóstico.
- **Execution** (service-contract, tool-registry, tool-permission, tool-execution,
  tool-result-verification) → **registro → decisão (service) → permissão → execução → verificação**;
  o service decide dentro de contrato; a tool só existe se registrada; permissão vem antes de
  execução; a tool **não valida o próprio resultado**; nenhum resultado é confiável sem verificação.

> Consequência para P4: **nenhuma execução futura sem spec, boundary, permission, trace, audit log,
> evidência e verification.**

---

## 11. Critérios para uma capability futura virar skill

Derivado do [Skill Map §5](../../skills/skill-map.md). Uma capability só é promovida a skill quando:

1. é **modular e reutilizável** em mais de um contexto/papel;
2. é **governada por uma specification** aprovada (sem spec, não há skill — `P15` `DO4`);
3. tem **entradas, saídas e limites** explícitos;
4. tem **critério de sucesso verificável** e **observabilidade esperada** declarada (`P8`);
5. **não decide nem executa autonomamente** — propõe/transforma dentro de fronteiras (`P2` `P14`);
6. trata **memória como ambiente** (estado), não como campo interno (`P17`).

---

## 12. Critérios para uma responsabilidade futura virar subagente *(seção reconstruída a partir do item 12 truncado)*

Derivado do [Subagent Map §5](../../subagents/subagent-map.md). Uma responsabilidade só é promovida
a subagente quando:

1. é um **papel operacional especializado** e nomeável;
2. é **governada por specification** com **autoridade limitada** e **escopo claro**;
3. tem **permissões explícitas** e respeita **atenuação de privilégio** na delegação (`[PYR]`);
4. tem **método de verificação** e **fronteira de decisão/escalação** definidos;
5. **nunca** detém autoridade comportamental nem decide no lugar dos services (`P2` `P7`);
6. respeita o **isolamento por tenant** (`P10`) e a **independência do auditor** quando aplicável.

---

## 13. Critérios para um substrato futuro virar harness *(seção reconstruída)*

Derivado do [Operational Harness Map §7](../../harness-engineering/operational-harness-map.md). Um
substrato só é promovido a harness quando:

1. é **responsabilidade de substrato, não de domínio** (coordena/restringe/verifica/audita; não
   contém a lógica de decisão nem a verdade do domínio);
2. é **governado por specification** (contract-first);
3. **não tem autoridade sobre a verdade operacional** (aplica decisões/políticas de
   estado/services/policies);
4. **produz evidência obrigatória** (nenhuma execução sem trace);
5. **respeita o isolamento multi-tenant** (fronteira invariante);
6. é **desacoplável e editável isoladamente** (evita monólito distribuído);
7. é **não-desativável pelo que fiscaliza** (auditoria read-only para o executor).

---

## 14. Ordem/sequência de preparação recomendada *(seção reconstruída)*

Apenas direção (sem iniciar nada), alinhada à sequência futura do
[Plano de Execução Controlada §18](../../implementation/controlled-execution-plan.md):

| Etapa futura | Foco | Pré-condição |
| --- | --- | --- |
| Skills mínimas | intent-extraction, context-assembly, provenance-tagging, evidence-compilation | specs governantes aprovadas (✅ P0–P3) |
| Subagentes mínimos | interface, retrieval, verification | skills mínimas especificadas |
| Harnesses mínimos | runtime, governance, observability, tenant (execution quando houver tool com efeito) | specs governantes aprovadas |
| Implementation/Spec Executor Harness | especificação do executor de specs | tudo acima aprovado |

**Regra mantida:** uma peça por vez, com checkpoint por peça; dependência antes de dependente;
nada inicia sem brief e autorização nominal.

---

## 15. O que P4 NÃO deve criar — guardrails preservados

P4, quando iniciada, **continua proibida** de criar (até autorização de fase própria e distinta):
spec P4 individual antes de brief específico · skill/subagente/harness **executável** ·
implementation harness · código · API · schema · frontend · microservices · backlog · sprint plan ·
roadmap técnico/de código · plano de deploy · YAML/JSON/DSL/pseudo-código · contrato
machine-readable · prompt executável de skill · configuração real de subagente. **Não inferir stack
técnica.** **Não transformar** o YZI OS em chatbot, SaaS genérico ou wrapper de LLM. **Não
modificar** specs P0–P3 nem os checkpoints anteriores. **Não duplicar** os documentos — apenas
referenciar.

---

## 16. Riscos arquiteturais a preservar antes de skills, subagentes, harnesses ou código *(seção reconstruída)*

| Risco | Mitigação herdada |
| --- | --- |
| Skill virar prompt gigante/persona | definição + critérios de promoção (Skill Map §2/§5) |
| Subagente virar chatbot/decisor autônomo | sem autoridade comportamental (Subagent Map §2/§10) |
| Escalonamento de privilégio na delegação | atenuação de privilégio; privilégio só decresce (`[PYR]`) |
| Auditor que também executa | verification-subagent/audit-harness read-only, ≠ executor (`[CE]`) |
| Harness com autoridade / monólito distribuído | critérios de promoção a harness §13 |
| Decomposição prematura | context/retrieval/audit/escalation são posteriores (Harness Map §15) |
| Execução sem trace / conclusão por asserção | observability obrigatória; verification obrigatória (P3) |
| Vazamento cross-tenant | tenant boundary invariante (P0) em todas as camadas |
| Implementation Harness prematuro | permanece futuro e não especificado (Harness Map §17) |
| Implementação prematura | viés de adiamento; contract-first absoluto (Plano §3/§16) |

---

## 17. Decisões preservadas / invariantes selados *(seção reconstruída)*

P4 herda como **verdade já fechada** (não reabrível sem revisão formal): LLM sem autoridade ·
runtime coordena mas não governa · estado persistido é verdade · conversa é projeção · evento é
unidade de mudança verificável · tenant boundary inviolável · contexto é pacote governado ·
retrieval é face contextual da governança · enforcement determinístico · escalada é governança ·
observability antes de execução confiável · service decide dentro de contrato · tool registry não é
catálogo solto · permission antes de execution · tool execution não valida o próprio resultado ·
tool result verification obrigatória · **nenhuma execução futura sem spec, boundary, permission,
trace, audit log, evidência e verification.**

---

## 18. Próxima fronteira recomendada *(seção reconstruída)*

Direção recomendada — **a confirmar separadamente, sem autorização de execução aqui**: P4 como
**preparação de Skills/Subagents/Harness**, ainda **documental**. Quando (e somente quando)
autorizada por brief próprio com path + critérios, a primeira peça seria uma **skill mínima**
(`intent-extraction` ou `context-assembly`), uma por vez, com checkpoint por peça — jamais um lote,
jamais código.

**Este documento não autoriza P4.** Apenas a prepara e a condiciona à autorização explícita.

---

## 19. Fronteiras (o que NÃO está aqui)

- **Não** cria specs P4 individuais, skills, subagentes, harnesses executáveis, services/tools ou
  código.
- **Não** define plano técnico, backlog, sprint, roadmap de código ou deploy.
- **Não** introduz sintaxe de máquina (YAML/JSON/schema/DSL/pseudo-código) nem contrato
  machine-readable.
- **Não** modifica specs P0–P3, os mapas anteriores ou os checkpoints — apenas os **referencia**.
- **Não** autoriza, por si, a Onda P4 — apenas a organiza e a condiciona à autorização explícita do
  operador.

---

## 20. Checkpoint *(seção reconstruída)*

1. **Arquivo criado:** apenas `/docs/specs/p4/p4-preparation-map.md` (pasta `/docs/specs/p4/`
   criada). Nenhum outro arquivo criado ou alterado.
2. **Natureza respeitada:** consolidation/bridge · governance-first · architecture/process-only ·
   linguagem natural estruturada · curto e revisável. **Não** é spec P4 individual, plano técnico,
   backlog, contrato machine-readable nem YAML/JSON/schema.
3. **Derivação fiel:** skills (9), subagentes (6) e harnesses (9) derivados dos mapas canônicos;
   governança P0–P3 referenciada sem duplicação. Specs P0–P3 e checkpoints **não** modificados.
4. **Reconstrução sinalizada:** itens 1–3 e 13–20 reconstruídos (briefing truncado nos itens 1–3 e
   a partir do 12); itens 4–12 conforme o briefing. Disponível para ajuste aditivo direcionado.
5. **Confirmação de fronteira:** **nenhuma** spec P4 individual, skill, subagente, harness
   executável, código, API, schema, frontend, backlog, YAML/JSON ou contrato machine-readable foi
   criado.
6. **Estado:** 31 specs aprovadas + 2 checkpoints + este mapa de preparação. **P4 não iniciada.**

**Parado aqui. Não avancei para nenhuma spec P4 individual.**

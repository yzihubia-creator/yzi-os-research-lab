# observability-harness

> **Specification documental de harness (observability-first, governança-first, harness-preparation,
> linguagem natural estruturada).** Terceira peça do conjunto mínimo de **harnesses documentais da
> P4**. Fixa o **contrato documental do observability-harness** — o substrato que **verifica a
> presença, a suficiência e a coerência da observabilidade** — **sem implementar observabilidade**,
> sem virar ferramenta de logging/dashboard/analytics e sem virar harness executável. **Não** é
> machine-readable: não contém código, API, schema, YAML, JSON, DSL, pseudo-código, configuração nem
> contrato técnico executável. Apenas **referencia** o cânone aprovado; não o duplica, resume nem
> substitui.
>
> Onda: **P4** (harness documental mínimo) · Status: proposta para aprovação · Versão: v1 ·
> Data: 2026-06-04 · Documento normativo (DEVE / NÃO DEVE / NUNCA têm força contratual).
> Proveniência: `[AHE]` `[CE]` `[HARNESS-RT]` `[PYR]` `[HE-GOV]`.

> **Nota de proveniência das condições (transparência).** As **36 condições** estão agora **literais**
> conforme o operador. O briefing chegou em partes truncadas e foi completado por **ajustes aditivos
> direcionados sucessivos**: as **condições 1–5 e 23–36** vieram na redação inicial; as **6–19** foram
> aplicadas no primeiro ajuste (renumerando o bloco "não substitui" para 13–18 e inserindo decide/
> autoriza/executa/altera em 9–12); as **20–22** foram aplicadas no ajuste final (episode trace/audit
> log existem quando exigidos; evidence e provenance preservadas), substituindo o status provisório.
> **Não há mais condição provisória.**

> **Correção conceitual registrada.** O [Operational Harness Map §8](../../../harness-engineering/operational-harness-map.md)
> rotula o `observability-harness` como **Onda P5**. A **decisão vigente do operador** posiciona os
> **harnesses mínimos documentais** na **P4**. Esta spec adota **P4**; divergência apenas de rotulagem
> de onda, sem alterar papel, fronteira ou doutrina.

---

## 1. Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `observability-harness` |
| **Tipo de peça** | harness operacional — **documental nesta fase** (não executável) |
| **Função primária** | verificação de presença, suficiência e coerência da observabilidade |
| **Classe** | fundacional ([Operational Harness Map §14](../../../harness-engineering/operational-harness-map.md)) |
| **Tenant-scope** | Global/instância (verificação por tenant; isolamento preservado) |
| **Proveniência** | `[AHE]` `[CE]` `[HARNESS-RT]` `[PYR]` `[HE-GOV]` |

**Fontes consolidadas (referência, não duplicação):**
- [`operational-harness-map.md`](../../../harness-engineering/operational-harness-map.md) §4, §5, §6, §9.3, §12, §14, §16.
- [`controlled-execution-plan.md`](../../../implementation/controlled-execution-plan.md) §12.
- [`runtime-harness.spec.md`](runtime-harness.spec.md), [`governance-harness.spec.md`](governance-harness.spec.md) (peças-par; §18, §19).
- P3 observabilidade: [`episode-trace`](../../p3/episode-trace.spec.md), [`audit-log`](../../p3/audit-log.spec.md), [`verification-report`](../../p3/verification-report.spec.md), [`failure-attribution`](../../p3/failure-attribution.spec.md), [`entropy-audit`](../../p3/entropy-audit.spec.md), [`intervention-log`](../../p3/intervention-log.spec.md).
- [`specs-p0-p3-checkpoint.md`](../../specs-p0-p3-checkpoint.md). Specs P0–P4 em **§25 (Dependências)**.

---

## 2. Status, camada, onda e owner arquitetural

| Campo | Valor |
| --- | --- |
| **Status** | proposta para aprovação · architecture-only · observability-first · governance-first |
| **Camada** | `specs/p4/harnesses` |
| **Onda** | **P4** (harness documental mínimo; correção P5→P4 registrada no topo) |
| **Owner arquitetural** | Observabilidade / Arquitetura |
| **Natureza** | harness **documental**, **não** executável; **verifica** a observabilidade, **não** a implementa |
| **Modularidade** | modular, revisável e subordinado a specification ([condição 35](#11-limites-do-harness)) |

---

## 3. Propósito

Fixar, como **contrato documental verificável**, **como o observability-harness verifica a presença,
a suficiência e a coerência da observabilidade** no YZI OS — confirmando que os artefatos de
evidência (episode trace, audit log, verification report, failure attribution, entropy audit,
intervention log) **existem, são coerentes, tenant-scoped, rastreáveis e revisáveis** — e
**impedindo que qualquer operação seja tratada como confiável sem evidência observável**. Esta peça
**não implementa observabilidade**, **não substitui** nenhum artefato de evidência e **não** é
ferramenta de logging, dashboard ou analytics.

O propósito é materializar, em fase documental, o invariante *"nenhuma execução sem trace"* `[AHE]` e
a regra *conclusão = evidência, não asserção* (`DO9`): o harness é o lugar onde se verifica que a
**evidência existe e basta** antes que confiança operacional seja concedida, e onde se exige
**reconstrução de episódio, atribuição de falha ou escalada** quando a evidência é insuficiente —
preservando a **independência entre executor e auditoria**.

---

## 4. Escopo

Esta spec cobre, em linguagem natural estruturada:

1. a **definição documental** do observability-harness como substrato de verificação de evidência (§6);
2. a distinção **verificação de evidência ≠ logging** (§7, §11);
3. a **diferença** entre observability-harness, episode trace, audit log, verification report,
   failure attribution, entropy audit, intervention log, dashboard e analytics (§8);
4. as **entradas e saídas conceituais** do harness (§9, §10);
5. as **relações** com P0–P4, runtime-harness, governance-harness e execution governance (§12–§20);
6. os **critérios de aceite e rejeição** e o **protocolo de bloqueio/pendência/escalada** (§21–§23).

Tudo é **descritivo e revisável por humano**, jamais executável.

---

## 5. Fora de escopo

Esta spec **NÃO**:

- cria `tenant-harness.spec.md`, `execution-harness.spec.md` nem qualquer outro harness
  ([condição 36](#5-fora-de-escopo));
- cria harness **executável**, implementation harness, ferramenta de logging, dashboard, analytics,
  runtime paralelo ou implementação de observabilidade ([condições 1–8, 36](#5-fora-de-escopo));
- cria subagentes executáveis, skills executáveis, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, DSL, pseudo-código, configuração ou contrato machine-readable;
- infere stack técnica nem se transforma em plano de implementação;
- **decide operação, autoriza ação, executa tool, altera estado ou corrige** evidência (apenas
  verifica que existe, basta e é coerente) ([condições 9–12](#7-observability-harness-como-verificação-de-evidência-não-logging));
- substitui `episode-trace`, `audit-log`, `verification-report`, `failure-attribution`,
  `entropy-audit` ou `intervention-log` ([condições 13–18](#7-observability-harness-como-verificação-de-evidência-não-logging)).

---

## 6. Definição do harness

> **Observability-harness** = **substrato documental que verifica a presença, a suficiência e a
> coerência da observabilidade** — confirmando que os artefatos de evidência existem, são coerentes,
> isolados por tenant, rastreáveis e revisáveis, e **impedindo confiança operacional sem evidência
> observável** — **sem produzir, decidir ou corrigir** a evidência, e **sem definir** dashboards,
> formatos de log ou pipelines técnicos. Ele **comprova que se comprova**; não contém o domínio.
> `[AHE]` `[HARNESS-RT]`

Nesta fase, o observability-harness é **harness documental, não executável**: ele **verifica**
observabilidade, mas **não a implementa**. Não é implementation harness, não é código, não é API,
**não é ferramenta de logging executável** (6), **não é dashboard** (7), **não é analytics solto**
(8); **não decide operação** (9), **não autoriza ação** (10), **não executa tool** (11) nem **altera
estado** (12). Materializa o invariante *"nenhuma execução
sem trace"* `[AHE]` e a disciplina *conclusão = evidência, não asserção* (`DO9`), apoiando-se nos
**três pilares de observabilidade** — componente, experiência e decisão
([`episode-trace`](../../p3/episode-trace.spec.md) §18).

> **Nota de coerência com o mapa.** O [Operational Harness Map §9.3](../../../harness-engineering/operational-harness-map.md)
> descreve o **futuro** `observability-harness` executável como **produtor** dos pilares de evidência.
> Esta spec documental fixa o **contrato de verificação** que ele honrará — presença/suficiência/
> coerência da evidência — **sem** antecipar a produção (que pertence aos artefatos P3 e à camada de
> observabilidade). Verificar a evidência ≠ produzi-la.

---

## 7. Observability-harness como verificação de evidência, não logging

O observability-harness existe para **verificar que a evidência existe e basta**, não para produzir
logs. Fixa, como contrato, a fronteira entre o que ele **deve verificar** e o que **jamais pode
implementar, substituir ou decidir**.

**Bloco condições 1–36** *(todas literais conforme o operador; 6–19 e 20–22 aplicadas por ajustes
aditivos direcionados sucessivos; ver nota de proveniência e a coluna **Status**)*:

| # | Condição | Status |
| --- | --- | --- |
| 1 | observability-harness é **harness documental, não harness executável** nesta fase | literal |
| 2 | **verifica** observabilidade, mas **não implementa** observabilidade | literal |
| 3 | **não é** implementation harness | literal |
| 4 | **não é** código | literal |
| 5 | **não é** API | literal |
| 6 | **não é** ferramenta de logging executável | literal |
| 7 | **não é** dashboard | literal |
| 8 | **não é** analytics solto | literal |
| 9 | **não decide** operação | literal |
| 10 | **não autoriza** ação | literal |
| 11 | **não executa** tool | literal |
| 12 | **não altera** estado | literal |
| 13 | **não substitui** episode trace | literal |
| 14 | **não substitui** audit log | literal |
| 15 | **não substitui** verification report | literal |
| 16 | **não substitui** failure attribution | literal |
| 17 | **não substitui** entropy audit | literal |
| 18 | **não substitui** intervention log | literal |
| 19 | **deve verificar** se cada episódio possui **evidência mínima observável** | literal |
| 20 | **deve verificar** se **episode trace existe** quando exigido | literal |
| 21 | **deve verificar** se **audit log existe** quando exigido | literal |
| 22 | **deve verificar** se **evidence e provenance** estão **preservadas** | literal |
| 23 | **deve verificar** se **tenant scope** está presente | literal |
| 24 | **deve verificar** se **tenant boundary** foi preservada | literal |
| 25 | **deve verificar** se **decisões, bloqueios, pendências, escaladas e verificações** são rastreáveis | literal |
| 26 | **deve verificar** se **failure attribution, entropy audit e intervention log** são acionáveis quando aplicável | literal |
| 27 | **deve impedir** que operação seja tratada como confiável **sem trace, audit log, evidência ou verification** quando aplicável | literal |
| 28 | **deve impedir** que **ausência de evidência** seja tratada como **sucesso** | literal |
| 29 | **deve impedir** que **logging decorativo** seja tratado como observabilidade institucional | literal |
| 30 | **deve impedir** que **dashboard visual** substitua **evidência auditável** | literal |
| 31 | **deve exigir** **reconstrução posterior de episódio** quando necessário | literal |
| 32 | **deve exigir** **atribuição de falha** quando houver inconsistência, falha ou não conformidade | literal |
| 33 | **deve exigir** **escalada** quando evidência, trace, log, provenance ou verification forem insuficientes | literal |
| 34 | **deve preservar independência** entre **executor e auditoria** | literal |
| 35 | **deve permanecer** modular, revisável e subordinado a specification | literal |
| 36 | **não deve virar** ferramenta de log prematura, dashboard, analytics solto, auditor autônomo absoluto, runtime paralelo ou implementação de observabilidade | literal |

---

## 8. Diferença entre observability-harness, episode trace, audit log, verification report, failure attribution, entropy audit, intervention log, dashboard e analytics

Extraída do cânone P3 e de [Operational Harness Map §9.3](../../../harness-engineering/operational-harness-map.md),
sem inventar doutrina:

| Conceito | É… | Papel | O observability-harness… |
| --- | --- | --- | --- |
| **Observability-harness (este)** | substrato documental de **verificação** de evidência | confirma presença/suficiência/coerência | é o próprio substrato |
| **Episode trace** | registro auditável mínimo do episódio | **comprova** o que aconteceu | **verifica** que existe/coerente; **não o substitui** (cond. 13) |
| **Audit log** | trilha institucional cross-episódio | preserva histórico auditável | verifica que existe/rastreável; **não o substitui** (cond. 14) |
| **Verification report** | objeto evidenciário (requisitos↔evidência) | classifica resultado por evidência | verifica que existe/acionável; **não o substitui** (cond. 15) |
| **Failure attribution** | explicação auditável de falha | atribui antes de corrigir | exige quando há falha; **não a substitui** (cond. 16, 32) |
| **Entropy audit** | auditoria de deriva/resíduo/violação | detecta entropia | verifica acionável; **não a substitui** (cond. 17, 26) |
| **Intervention log** | registro de intervenção humana (M-HIR) | preserva responsabilidade | verifica acionável; **não o substitui** (cond. 18, 26) |
| **Dashboard** | visualização | apresenta | **não é** dashboard; impede que substitua evidência auditável (cond. 7, 30) |
| **Analytics** | métrica agregada | mede tendência | **não é** analytics solto (cond. 8); não confunde métrica com evidência institucional |

Distinção essencial `[AHE]`: **logging decorativo ≠ observabilidade institucional** (cond. 29). A
observabilidade institucional é **evidência auditável, reconstruível e revisável** — não enfeite
visual nem métrica solta. *Nenhuma execução sem trace*; *conclusão = evidência, não asserção*.

---

## 9. Entradas conceituais do harness

Em linguagem natural (nenhuma é estrutura de máquina):

1. os **artefatos de evidência** a verificar — episode trace, audit log, verification report, failure
   attribution, entropy audit, intervention log (produzidos fora do harness);
2. o **tenant-scope** vigente, contra o qual presença e isolamento dos artefatos são verificados;
3. a **operação/episódio** cuja confiabilidade depende de evidência observável suficiente;
4. os **requisitos de rastreabilidade** (decisões, bloqueios, pendências, escaladas, verificações);
5. os **sinais de inconsistência, falha ou não conformidade** que exigem atribuição de falha ou
   escalada.

O que chega como **logging decorativo, dashboard visual ou métrica agregada** **não** é aceito como
evidência institucional (cond. 29, 30); a ausência de evidência é registrada como **fato**, nunca
como sucesso (cond. 28).

---

## 10. Saídas conceituais do harness

1. um **veredito de observabilidade** por operação/episódio: a evidência **existe, basta e é
   coerente** (tenant-scoped, rastreável, revisável) — ou **não**;
2. **bloqueio de confiança operacional** quando falta trace, audit log, evidência ou verification
   aplicável (cond. 27);
3. **exigência de reconstrução de episódio** quando necessário (cond. 31);
4. **exigência de atribuição de falha** diante de inconsistência/falha/não conformidade (cond. 32);
5. **exigência de escalada** quando evidência/trace/log/provenance/verification forem insuficientes
   (cond. 33);
6. preservação registrada da **independência entre executor e auditoria** (cond. 34).

Nenhuma saída é **produção de evidência, decisão de conformidade ou correção** — essas pertencem aos
artefatos de observabilidade, à governança/verification e à futura execução, respectivamente.

---

## 11. Limites do harness

Limites invioláveis (o harness os verifica e os respeita; nunca os relaxa):

- **verifica** observabilidade, mas **não a implementa**; não é ferramenta de logging, dashboard nem
  analytics (6–8); **não decide operação, não autoriza ação, não executa tool nem altera estado**
  (cond. 9–12);
- **não substitui** os seis artefatos de evidência P3 (cond. 13–18);
- **deve impedir** confiança sem trace/audit log/evidência/verification (27), ausência de evidência
  como sucesso (28), logging decorativo como observabilidade (29) e dashboard substituindo evidência
  (30);
- **deve exigir** reconstrução de episódio (31), atribuição de falha (32) e escalada (33) quando
  aplicável;
- **deve preservar independência** entre **executor e auditoria** ([34](#11-limites-do-harness)) —
  quem executa/recupera/media **não** audita a si mesmo; o verificador é **read-only** para o
  executor (controlabilidade);
- **permanece modular, revisável e subordinado a specification** ([35](#11-limites-do-harness));
- **não vira** ferramenta de log prematura, dashboard, analytics solto, auditor autônomo absoluto,
  runtime paralelo ou implementação de observabilidade ([36](#5-fora-de-escopo)).

---

## 12. Relação com P0

Herda como invariantes **aprovados** ([P0](../../p0/)):

- [`core-operational-principles`](../../p0/core-operational-principles.spec.md) — `P8`
  (observabilidade obrigatória), `P9` (ação auditável): nenhuma operação confiável sem evidência;
- [`layer-authority-model`](../../p0/layer-authority-model.spec.md) — observabilidade é a camada que
  **comprova** (não decide); o harness verifica que cada decisão é atribuível à camada responsável,
  sem conceder autoridade ao LLM/prompt (Metadata);
- [`conflict-resolution`](../../p0/conflict-resolution.spec.md) — **auditabilidade** é valor de alta
  prioridade na ordem de valores; conflitos resolvidos por ordem de valores, não numeração;
- [`tenant-boundary`](../../p0/tenant-boundary.spec.md) — **deve verificar tenant scope** (cond. 23) e
  **tenant boundary preservada** (cond. 24); nenhum artefato mistura ou expõe outro tenant.

---

## 13. Relação com P1

- [`operational-state`](../../p1/operational-state.spec.md) — o estado é a verdade; a evidência
  **comprova** o que foi lido dela; o harness **não altera estado** ao verificar;
- [`event-driven-state`](../../p1/event-driven-state.spec.md) — toda mudança relevante é evento
  auditável; o harness verifica que as transições são rastreáveis (cond. 25);
- [`tenant-state-isolation`](../../p1/tenant-state-isolation.spec.md) — verificação sempre dentro do
  estado particionado por tenant (reforça cond. 23, 24);
- [`memory-model`](../../p1/memory-model.spec.md) — memória do modelo não é evidência; o harness não
  aceita memória conversacional como prova.

---

## 14. Relação com P2

- [`context-provenance`](../../p2/context-provenance.spec.md) — a proveniência por fragmento é insumo
  da rastreabilidade; o harness **verifica que evidence e provenance estão preservadas** (cond. 22) e
  exige escalada quando **provenance** é insuficiente (cond. 33);
- [`policy-enforcement`](../../p2/policy-enforcement.spec.md), [`behavioral-governance`](../../p2/behavioral-governance.spec.md),
  [`operational-boundaries`](../../p2/operational-boundaries.spec.md) — o harness verifica que
  decisões, bloqueios e vereditos de governança são **rastreáveis** (cond. 25), sem julgar
  conformidade (isso é do `governance-harness`, §19);
- [`escalation-policy`](../../p2/escalation-policy.spec.md) — fundamenta a **exigência de escalada**
  por evidência insuficiente (cond. 33) e a verificação de que escaladas são rastreáveis (cond. 25);
- [`context-assembly`](../../p2/context-assembly.spec.md), [`retrieval-governance`](../../p2/retrieval-governance.spec.md),
  [`tenant-retrieval-scope`](../../p2/tenant-retrieval-scope.spec.md), [`tenant-policy-pack`](../../p2/tenant-policy-pack.spec.md) —
  o harness verifica que contexto/retrieval usados no episódio são reconstruíveis e tenant-scoped.

---

## 15. Relação com P3

P3 é o **núcleo dos artefatos** que este harness **verifica** (sem produzir nem substituir):

- [`episode-trace`](../../p3/episode-trace.spec.md) — verifica **evidência mínima observável** e que o
  **episode trace existe quando exigido**, e exige **reconstrução posterior de episódio** quando
  necessário (cond. 19, 20, 31); **não o substitui** (cond. 13);
- [`audit-log`](../../p3/audit-log.spec.md) — verifica que a trilha institucional **existe quando
  exigido** (cond. 21) e é rastreável; **não o substitui** (cond. 14);
- [`verification-report`](../../p3/verification-report.spec.md) — verifica que a conclusão é
  **evidência, não asserção**; impede operação confiável sem verification aplicável (cond. 15, 27);
  **não o substitui**;
- [`failure-attribution`](../../p3/failure-attribution.spec.md) — **exige atribuição de falha** diante
  de inconsistência/falha/não conformidade (cond. 32); **não a substitui** (cond. 16);
- [`entropy-audit`](../../p3/entropy-audit.spec.md) — verifica que a auditoria de entropia é
  **acionável** quando aplicável (cond. 17, 26);
- [`intervention-log`](../../p3/intervention-log.spec.md) — verifica que a intervenção é registrável e
  **acionável** (cond. 18, 26);
- cadeia de execução ([`service-contract`](../../p3/service-contract.spec.md),
  [`tool-registry`](../../p3/tool-registry.spec.md), [`tool-permission`](../../p3/tool-permission.spec.md),
  [`tool-execution`](../../p3/tool-execution.spec.md), [`tool-result-verification`](../../p3/tool-result-verification.spec.md)) —
  o harness verifica que **nenhuma execução ocorre sem trace** e que resultados têm verificação
  associada (cond. 27).

---

## 16. Relação com P4 skills mínimas

| Skill mínima | Relação com a verificação de evidência |
| --- | --- |
| [`intent-extraction`](../skills/intent-extraction-skill.spec.md) | a intenção é Metadata; o harness verifica que a leitura de intenção é rastreável, não verdade |
| [`context-assembly`](../skills/context-assembly-skill.spec.md) | o harness verifica que o pacote montado é reconstruível e tenant-scoped (cond. 19, 23) |
| [`provenance-tagging`](../skills/provenance-tagging-skill.spec.md) | a proveniência por fragmento sustenta a rastreabilidade; o harness verifica que evidence e provenance estão preservadas (cond. 22, 25, 33) |
| [`evidence-compilation`](../skills/evidence-compilation-skill.spec.md) | **compõe a evidência** que o harness verifica existir e bastar; ausência de evidência ⇒ não sucesso (cond. 19, 28) |

As skills **compõem/marcam/organizam** evidência; o harness **verifica** que ela existe, basta e é
coerente — sem produzi-la.

---

## 17. Relação com P4 subagentes mínimos

| Subagente mínimo | Relação com o observability-harness |
| --- | --- |
| [`interface-subagent`](../subagents/interface-subagent.spec.md) | o harness verifica que a mediação linguagem↔operação deixa trace rastreável |
| [`retrieval-subagent`](../subagents/retrieval-subagent.spec.md) | verifica que a recuperação é tenant-scoped e com proveniência reconstruível (cond. 23, 25) |
| [`verification-subagent`](../subagents/verification-subagent.spec.md) | **auditor independente**: o harness **preserva a independência executor↔auditoria** (cond. 34); o verificador é read-only ao executor; o harness **não substitui** o auditor nem vira auditor autônomo absoluto (cond. 36) |

---

## 18. Relação com runtime-harness

- O [`runtime-harness`](runtime-harness.spec.md) **coordena** o episódio e **alimenta** trace e audit
  log; o observability-harness **verifica** que essa evidência existe, basta e é coerente. Coordenar
  ≠ comprovar que se comprova.
- **Composição, não contenção**: o runtime-harness delega a verificação de evidência a este
  substrato, que permanece **desacoplado e editável isoladamente**.
- O harness verifica o invariante que o runtime deve honrar: **nenhuma execução confiável sem trace**
  (cond. 27) — sem virar runtime paralelo (cond. 36).

---

## 19. Relação com governance-harness

- O [`governance-harness`](governance-harness.spec.md) **aplica e verifica governança** (enforcement
  determinístico); o observability-harness **verifica a evidência** dessa governança — que decisões,
  bloqueios, pendências, escaladas e verificações são **rastreáveis** (cond. 25).
- **Complementares e desacoplados:** governance julga conformidade; observability comprova que há
  evidência auditável do julgamento. O observability-harness **não julga conformidade** (isso é do
  governance-harness) e o governance-harness **não produz evidência** (isso é dos artefatos
  verificados aqui).
- Juntos sustentam *conclusão = evidência, não asserção* (`DO9`): governance exige o veredito,
  observability exige que o veredito seja evidenciado.

---

## 20. Relação com execution governance

O observability-harness **verifica** a evidência da cadeia de execução; a **coordenação** é do
runtime-harness e a **execução controlada** será do futuro **execution-harness** (**não criado
aqui**):

- registro (tool-registry) → decisão (service-contract) → permissão (tool-permission) → execução
  (tool-execution) → verificação (tool-result-verification);
- o harness verifica que **cada elo deixa trace** e que **nenhuma operação é confiável sem trace,
  audit log, evidência ou verification** (cond. 27);
- **não decide operação, não autoriza ação, não executa tool nem altera estado** (cond. 9–12) —
  apenas verifica a existência/suficiência/coerência da evidência e bloqueia/exige reconstrução/
  atribuição/escalada (cond. 31–33).

---

## 21. Critérios de aceite

A spec é aceita quando:

1. trata o observability-harness como **harness documental, não executável**, que **verifica
   observabilidade sem implementá-la** — não é implementation harness, código, API, ferramenta de
   logging, dashboard nem analytics; **não decide operação, não autoriza ação, não executa tool nem
   altera estado** (cond. 1–12);
2. **não substitui** episode trace, audit log, verification report, failure attribution, entropy
   audit nem intervention log (cond. 13–18);
3. **verifica** que cada episódio possui **evidência mínima observável**, que **episode trace e audit
   log existem quando exigidos** e que **evidence e provenance estão preservadas** (cond. 19–22),
   **impedindo confiança operacional sem evidência observável** (cond. 27);
4. **verifica** tenant scope presente (23), tenant boundary preservada (24), rastreabilidade de
   decisões/bloqueios/pendências/escaladas/verificações (25) e acionabilidade de failure attribution/
   entropy audit/intervention log (26);
5. **impede** operação confiável sem trace/audit log/evidência/verification (27), ausência de
   evidência como sucesso (28), logging decorativo como observabilidade (29) e dashboard substituindo
   evidência (30);
6. **exige** reconstrução de episódio (31), atribuição de falha (32) e escalada por evidência
   insuficiente (33); **preserva independência** executor↔auditoria (34);
7. permanece **modular, revisável e subordinado a specification** (35) e **não vira** ferramenta de
   log prematura, dashboard, analytics solto, auditor autônomo absoluto, runtime paralelo ou
   implementação de observabilidade (36);
8. **referencia** o cânone P0–P4 sem duplicá-lo, resumi-lo ou inventar doutrina; é revisável por
   humano.

---

## 22. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. trata o harness como **executável**, implementation harness, código, API, schema, ferramenta de
   logging, dashboard, analytics, runtime paralelo ou implementação de observabilidade (viola cond.
   1–12, 36);
2. **substitui** episode trace, audit log, verification report, failure attribution, entropy audit ou
   intervention log (viola cond. 13–18);
3. **decide operação, autoriza ação, executa tool, altera estado ou corrige** evidência por conta
   própria, em vez de verificar existência/suficiência/coerência (viola cond. 2, 9–12, 19–22);
4. **aceita confiança operacional sem evidência observável**, ou trata **ausência de evidência como
   sucesso** (viola cond. 27, 28);
5. trata **logging decorativo** como observabilidade institucional ou deixa **dashboard** substituir
   evidência auditável (viola cond. 29, 30);
6. **deixa de verificar** tenant scope/boundary, rastreabilidade ou acionabilidade dos artefatos
   (viola cond. 23–26);
7. **não exige** reconstrução de episódio, atribuição de falha ou escalada nos gatilhos exigidos
   (viola cond. 31–33);
8. **quebra a independência** executor↔auditoria, ou vira **auditor autônomo absoluto** (viola cond.
   34, 36);
9. cria **outro harness**, harness executável, subagente/skill executável, código, API, schema,
   frontend, backlog, YAML/JSON ou contrato machine-readable (viola guardrails / cond. 36);
10. **infere stack técnica**, vira plano de implementação, **resume/duplica/inventa** doutrina, ou
    reposiciona o YZI OS como chatbot, SaaS genérico, automação simples ou wrapper de LLM.

---

## 23. Quando bloquear, pendenciar evidência ou escalar

O observability-harness **impede confiança sem evidência** e **exige** reconstrução/atribuição/
escalada:

| Gatilho | Resposta obrigatória |
| --- | --- |
| **operação sem trace/audit log/evidência/verification aplicável** | bloquear confiança operacional (cond. 27) |
| **ausência de evidência** | registrar como fato; **nunca** tratar como sucesso (cond. 28) |
| **episódio não reconstruível** | exigir **reconstrução posterior de episódio** (cond. 31) |
| **inconsistência, falha ou não conformidade** | exigir **atribuição de falha** (cond. 32) |
| **evidência/trace/log/provenance/verification insuficientes** | **escalar** (cond. 33) |
| **logging decorativo / dashboard como prova** | rejeitar e registrar (cond. 29, 30) |
| **tenant scope ausente ou boundary violada** | bloquear (cond. 23, 24) |
| **executor auditando a si mesmo** | bloquear — independência executor↔auditoria (cond. 34) |

Regra-mãe: **nunca admissão silenciosa**. Evidência insuficiente → **bloqueio, pendência ou
escalada registrada**, conforme [`escalation-policy`](../../p2/escalation-policy.spec.md) e
[`intervention-log`](../../p3/intervention-log.spec.md).

---

## 24. Riscos arquiteturais evitados

| Risco | Como esta spec o evita |
| --- | --- |
| **Operação caixa-preta / confiança sem trace** | impede confiança sem evidência observável (cond. 27) |
| **Ausência de evidência tratada como sucesso** | ausência registrada como fato, nunca sucesso (cond. 28) |
| **Logging decorativo como observabilidade** | logging decorativo ≠ observabilidade institucional (cond. 29) |
| **Dashboard substituindo evidência auditável** | dashboard não substitui evidência (cond. 30) |
| **Conclusão por asserção** | conclusão = evidência; verification report acionável (cond. 15, 26) |
| **Remendo antes do diagnóstico** | exige atribuição de falha antes (cond. 32) |
| **Executor desligando a própria fiscalização** | independência executor↔auditoria; read-only (cond. 34) |
| **Auditor autônomo absoluto** | harness documental subordinado a spec; não vira auditor absoluto (cond. 36) |
| **Vazamento cross-tenant** | verifica tenant scope/boundary (cond. 23, 24) |
| **Observabilidade prematura / implementação** | harness documental; não vira ferramenta de log/runtime (cond. 1, 36) |

---

## 25. Dependências

**Aprovadas (referenciadas, não duplicadas):**

- **Mapas/processo/pares:** [`operational-harness-map.md`](../../../harness-engineering/operational-harness-map.md),
  [`controlled-execution-plan.md`](../../../implementation/controlled-execution-plan.md),
  [`runtime-harness.spec.md`](runtime-harness.spec.md), [`governance-harness.spec.md`](governance-harness.spec.md),
  [`specs-p0-p3-checkpoint.md`](../../specs-p0-p3-checkpoint.md).
- **P0:** `core-operational-principles`, `layer-authority-model`, `conflict-resolution`,
  `tenant-boundary`.
- **P1:** `operational-state`, `event-driven-state`, `tenant-state-isolation`, `memory-model`.
- **P2:** `policy-enforcement`, `behavioral-governance`, `operational-boundaries`,
  `escalation-policy`, `context-assembly`, `context-provenance`, `retrieval-governance`,
  `tenant-policy-pack`, `tenant-retrieval-scope`.
- **P3:** `episode-trace`, `audit-log`, `failure-attribution`, `verification-report`,
  `entropy-audit`, `intervention-log`, `service-contract`, `tool-registry`, `tool-permission`,
  `tool-execution`, `tool-result-verification`.
- **P4 skills mínimas:** `intent-extraction`, `context-assembly`, `provenance-tagging`,
  `evidence-compilation`.
- **P4 subagentes mínimos:** `interface-subagent`, `retrieval-subagent`, `verification-subagent`.

**Futuras (pendentes; bloqueiam a promoção executável):** specs de observabilidade do mapa
(consolidação `observability-harness`); os harnesses mínimos restantes (`tenant`, `execution`); o
`audit-harness` posterior; o Implementation Harness / Spec Executor. Enquanto não aprovados, a
promoção **executável** da observabilidade permanece bloqueada (contract-first, `P15`/`DO4`).

---

## 26. Próxima peça recomendada

Direção recomendada — **a confirmar separadamente, sem autorização de execução aqui**: o próximo
harness fundacional documental do conjunto mínimo ([Operational Harness Map §16](../../../harness-engineering/operational-harness-map.md)),
**`tenant-harness.spec.md`** (substrato de isolamento multi-tenant: escopo, policy pack, fronteira
invariante), completando os quatro fundacionais; **`execution-harness`** entra quando houver tool com
efeito. Documental, **uma peça por vez, com checkpoint**. **Esta spec não autoriza a próxima peça** e
**não avança para o próximo harness**.

---

## 27. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/harnesses/observability-harness.spec.md`. Nenhum outro
   arquivo criado ou alterado.
2. **Natureza respeitada:** architecture-only · observability-first · governance-first ·
   harness-preparation · linguagem natural estruturada. Harness **documental, não executável**;
   **não** é implementation harness, ferramenta de logging, dashboard, analytics, código, API, schema,
   runtime, YAML/JSON nem contrato machine-readable.
3. **Estrutura:** exatamente as **27 seções** exigidas.
4. **36 condições obrigatórias:** todas **explícitas e literais**, **sem status provisório** (§7).
   Aplicadas por ajustes aditivos sucessivos: 1–5/23–36 (inicial), 6–19 (renumeração do bloco "não
   substitui" para 13–18 + inserção de decide/autoriza/executa/altera em 9–12) e **20–22** (episode
   trace/audit log existem quando exigidos; evidence e provenance preservadas). Referências cruzadas
   realinhadas à numeração final.
5. **Correção conceitual:** onda **P5→P4** registrada; divergência apenas de rotulagem. Nota de
   coerência com o mapa §9.3 (produtor futuro vs. verificador documental).
6. **Cânone:** P0–P4, mapa de harnesses, plano de execução, `runtime-harness`, `governance-harness` e
   specs P3 de observabilidade **referenciados, não duplicados**; nenhuma doutrina nova inventada.
7. **Confirmação de fronteira:** **nenhum** outro harness (`tenant`, `execution` ou qualquer outro),
   harness executável, implementation harness, subagente/skill executável, código, API, schema,
   frontend, backlog, YAML/JSON ou contrato machine-readable foi criado. Specs P0–P4, mapas e
   checkpoints anteriores **não** modificados. Nenhuma stack inferida.

**Parado aqui. Não avancei para o próximo harness.**

# Checkpoint — Conjunto Mínimo de Harnesses da P4

> **Documento de consolidação (checkpoint), consolidation-only · governance-first ·
> architecture/process-only · linguagem natural estruturada.** Consolida os **5 harnesses documentais
> mínimos** já aprovados na P4. **Não** é novo harness, **não** cria harness executável, implementation
> harness, skill, subagente, código, API, schema, frontend, backlog, YAML/JSON nem contrato
> machine-readable. Apenas **referencia** as specs aprovadas; não as duplica, resume nem substitui.
>
> Camada: `specs/p4/harnesses` (consolidação) · Status: consolidação · Versão: v1 · Data: 2026-06-04
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]`.

---

## 1. Propósito do checkpoint

Consolidar, em documento curto e revisável, o **conjunto mínimo de harnesses documentais** da P4 —
quais foram aprovados, o papel e as fronteiras de cada um, as specs P0–P3 que os governam, quais
skills mínimas e subagentes mínimos eles protegem, os invariantes preservados e os riscos reduzidos —
sem iniciar qualquer nova peça. Marca o fechamento do **conjunto mínimo de harnesses fundacionais**
([Operational Harness Map §16](../../../harness-engineering/operational-harness-map.md)) e prepara
(sem autorizar) a próxima fronteira. **Não é novo harness nem peça executável** — apenas referencia o
que já foi aprovado.

---

## 2. Status dos 5 harnesses mínimos

| Onda / bloco | Entrega | Status |
| --- | --- | --- |
| P4 · Preparation Map | `p4-preparation-map.md` | ✅ Aprovado |
| P4 · Skills mínimas (4) + checkpoint | intent-extraction · context-assembly · provenance-tagging · evidence-compilation | ✅ Aprovados |
| P4 · Subagentes mínimos (3) + checkpoint | interface · retrieval · verification | ✅ Aprovados |
| **P4 · Harnesses mínimos (5)** | runtime · governance · observability · tenant · execution | ✅ **Aprovados** |
| P4 · Checkpoint dos harnesses mínimos | **este documento** | — consolidação |

**Conjunto mínimo de harnesses fundacionais — completo (5/5).** Todos documentais, não executáveis.
Próximas fronteiras (checkpoint P4 consolidado; Execution Handoff Pack) **não iniciadas**.

---

## 3. Lista dos harnesses aprovados

| # | Harness | Função | Arquivo | Condições |
| --- | --- | --- | --- | --- |
| 1 | `runtime-harness` | coordenação do episódio (guarda-chuva) | [runtime-harness.spec.md](runtime-harness.spec.md) | 35 |
| 2 | `governance-harness` | enforcement determinístico de policies/specs | [governance-harness.spec.md](governance-harness.spec.md) | 37 |
| 3 | `observability-harness` | verificação de presença/suficiência/coerência da evidência | [observability-harness.spec.md](observability-harness.spec.md) | 36 |
| 4 | `tenant-harness` | verificação do isolamento multi-tenant | [tenant-harness.spec.md](tenant-harness.spec.md) | 35 |
| 5 | `execution-harness` | verificação da execução controlada (cadeia registro→…→verificação) | [execution-harness.spec.md](execution-harness.spec.md) | 43 |

Todos: documentais · governados por specification · sem autoridade sobre a verdade operacional ·
revisáveis por humano.

---

## 4. Papel de runtime-harness

- **Papel:** delimita e **verifica o papel de coordenação do runtime** no episódio — montar contexto,
  rotear, sequenciar etapas, orquestrar componentes desacoplados — **sem implementar runtime**.
- **Mantém o runtime como coordenador, não governança:** pode coordenar sequência, acionar etapas,
  registrar eventos, rotear; **não** decide verdade, conformidade, service decision, policy
  enforcement, permission, execução nem verificação por si.
- **Specs governantes:** P0 (autoridade/conflito/tenant); P1 (estado/eventos); P2 (governança/
  contexto); P3 (execução/observabilidade). **Não:** agente, LLM, policy engine, service, tool,
  authority layer.

---

## 5. Papel de governance-harness

- **Papel:** **verifica e limita a aplicação de governança** — enforcement **determinístico e
  independente de agente** (pós-geração), reduzindo o espaço de escolha e verificando conformidade —
  **sem implementar governança** e **sem definir a regra**.
- **Mantém enforcement como determinístico, não guidance fraca:** *guidance ≠ enforcement*; **prompt
  não é policy**; impede captura de autoridade de governança e bypass de fronteiras.
- **Specs governantes:** `policy-enforcement`, `behavioral-governance`, `operational-boundaries`,
  `escalation-policy` (P2); `conflict-resolution`, `layer-authority-model` (P0). **Não:** policy
  engine executável, runtime paralelo, service, tool, decisor de operação.

---

## 6. Papel de observability-harness

- **Papel:** **verifica a presença, a suficiência e a coerência da observabilidade** — confirma que
  episode trace, audit log, verification report, failure attribution, entropy audit e intervention log
  **existem, são coerentes, tenant-scoped, rastreáveis e revisáveis** — **sem implementar
  observabilidade**.
- **Impede confiança sem evidência observável:** ausência de evidência ≠ sucesso; logging decorativo ≠
  observabilidade institucional; dashboard não substitui evidência auditável; preserva **independência
  executor↔auditoria**.
- **Specs governantes:** `episode-trace`, `audit-log`, `verification-report`, `failure-attribution`,
  `entropy-audit`, `intervention-log` (P3); `P8`/`P9` (P0). **Não:** ferramenta de logging, dashboard,
  analytics, runtime, auditor autônomo absoluto.

---

## 7. Papel de tenant-harness

- **Papel:** **verifica que o isolamento multi-tenant está preservado** — tenant scope, boundary,
  policy pack, retrieval scope, estado, memória, contexto, retrieval, traces, evidências, tools,
  services e execuções **isolados por tenant** — **sem implementar isolamento**.
- **Preserva tenant boundary como invariante** (não configuração): impede inferência de tenant,
  tenant ausente/ambíguo/conflitante/cruzado tratado como válido, cruzamento entre tenants,
  configuração como exceção e verticalização rompendo isolamento.
- **Specs governantes:** `tenant-boundary` (P0, raiz), `tenant-state-isolation` (P1),
  `tenant-configuration`/`tenant-policy-pack`/`tenant-retrieval-scope` (P2). **Não:** middleware, RLS,
  banco de dados, runtime paralelo, policy engine, executor.

---

## 8. Papel de execution-harness

- **Papel:** **verifica que a execução é controlada** — toda execução futura respeita a cadeia
  **registro (tool-registry) → decisão (service-contract) → permissão (tool-permission) → execução
  (tool-execution) → verificação (tool-result-verification)**, dentro do tenant, sob governança, com
  trace, evento auditável e verificação posterior — **sem executar**.
- **Impede execução sem contrato, permissão, tenant, trace, audit log, evidência e verification:**
  impede acionamento/execução fora de contrato por LLM/agente/prompt/runtime/subagente/tool; impede
  sucesso sem verificação e efeito sem evento auditável; exige TRV, verification report, failure
  attribution, entropy audit e intervention log.
- **Specs governantes:** `service-contract`, `tool-registry`, `tool-permission`, `tool-execution`,
  `tool-result-verification` (P3, cadeia). **Não:** executor, runtime paralelo, policy engine,
  service, tool, automação, orquestrador real, implementação de execução. **Ativa-se quando houver a
  primeira tool/serviço com efeito.**

---

## 9. Fronteiras comuns dos harnesses

Invariante comum a todos: **nenhum** implementa runtime, governança, observabilidade, isolamento ou
execução; **nenhum** decide operação, autoriza ação, executa tool ou altera estado; **nenhum** detém
autoridade sobre a verdade operacional. Todos são **substratos documentais nesta fase**, **modulares,
revisáveis e subordinados a specification**, e **não** viram código, API, YAML/JSON, contrato
machine-readable, executor, runtime paralelo, policy engine ou implementação. Todos **respeitam tenant
scope** e **preservam tenant boundary**, e tratam ausência/ambiguidade/conflito/insuficiência por
**bloqueio, pendência de evidência ou escalada** — nunca admissão silenciosa.

**Composição, não contenção** ([Operational Harness Map §19](../../../harness-engineering/operational-harness-map.md)):
o `runtime-harness` é o guarda-chuva que **delega** — governança → `governance-harness`, evidência →
`observability-harness`, isolamento → `tenant-harness` (transversal), execução → `execution-harness`.
Cada um permanece desacoplado e editável isoladamente; o auditor é read-only para o executor.

---

## 10. Relação com as skills mínimas

Os harnesses **protegem** o envelope sob o qual as 4 skills mínimas operam (composição ≠ implementação):

| Skill mínima | Harness que a protege |
| --- | --- |
| [`intent-extraction`](../skills/intent-extraction-skill.spec.md) | runtime (coordena entrada); governance (intenção é Metadata, não policy) |
| [`context-assembly`](../skills/context-assembly-skill.spec.md) | runtime (monta no ciclo); observability (pacote reconstruível); tenant (contexto isolado) |
| [`provenance-tagging`](../skills/provenance-tagging-skill.spec.md) | observability (rastreabilidade); tenant (proveniência por tenant) |
| [`evidence-compilation`](../skills/evidence-compilation-skill.spec.md) | observability (evidência existe/basta); execution (evidência da execução/resultado) |

As skills **propõem/montam/marcam/organizam**; **nenhuma executa, decide ou governa** — os harnesses
verificam que assim permanece. Ver [checkpoint das skills mínimas](../skills/p4-minimum-skills-checkpoint.md).

---

## 11. Relação com os subagentes mínimos

| Subagente mínimo | Harness que o protege |
| --- | --- |
| [`interface-subagent`](../subagents/interface-subagent.spec.md) | runtime (entrada do episódio); governance (linguagem ≠ permissão, prompt ≠ policy); execution (proposta ≠ execução) |
| [`retrieval-subagent`](../subagents/retrieval-subagent.spec.md) | tenant (retrieval isolado por tenant); observability (recuperação rastreável) |
| [`verification-subagent`](../subagents/verification-subagent.spec.md) | observability (independência executor↔auditoria); execution (verificação posterior do resultado) |

A delegação preserva **atenuação de privilégio**, sempre dentro do mesmo tenant; a **independência do
auditor** é estrutural. Ver [checkpoint dos subagentes mínimos](../subagents/p4-minimum-subagents-checkpoint.md).

---

## 12. Dependências P0–P3

Os 5 harnesses herdam, como dependências **aprovadas**: invariantes **P0** (autoridade/conflito/tenant
boundary); estado/eventos/memória/isolamento **P1**; governança + contexto/retrieval + multi-tenant
**P2**; observabilidade + cadeia de execução + verificação **P3** (specs governantes por harness nos
§4–§8). Dependências **futuras (pendentes):** harnesses posteriores (`context`, `retrieval`, `audit`,
`escalation`); `execution-proposal-subagent`; a **primeira tool/serviço com efeito** (gatilho do
`execution-harness`); o Implementation Harness / Spec Executor. Enquanto não aprovados, a promoção
**executável** permanece bloqueada (contract-first, `P15`/`DO4`).

---

## 13. Invariantes preservados

- harnesses são **documentais nesta fase** e **não executáveis**;
- harnesses **não** são implementation harnesses, código, API, YAML/JSON nem contratos machine-readable;
- harnesses **não implementam** runtime, governança, observabilidade, isolamento ou execução;
- harnesses **não decidem operação, não autorizam ação, não executam tool, não alteram estado**;
- **runtime-harness** mantém o runtime como **coordenador, não governança**;
- **governance-harness** mantém o enforcement **determinístico, não guidance fraca**;
- **observability-harness** **impede confiança sem evidência observável**;
- **tenant-harness** **preserva tenant boundary como invariante** (não configuração);
- **execution-harness** **impede execução sem contrato, permissão, tenant, trace, audit log, evidência
  e verification**;
- todos os harnesses operam **subordinados às specs**;
- todos devem ser **auditáveis, rastreáveis e revisáveis** quando futuramente promovidos;
- **nenhum harness pode virar código sem autorização futura**;
- LLM sem autoridade · runtime coordena mas não governa · estado é verdade · tenant boundary
  inviolável · conclusão = evidência (nunca asserção) · observability antes de execução confiável ·
  nenhuma execução sem trace.

---

## 14. Riscos reduzidos

| Risco | Mitigação herdada |
| --- | --- |
| Runtime pesado acumulando governança | `runtime-harness` (coordena, não governa) |
| Governança no prompt / agente governando a si mesmo | `governance-harness` (enforcement determinístico; guidance ≠ enforcement) |
| Confiança sem evidência / logging decorativo como observabilidade | `observability-harness` (impede confiança sem evidência observável) |
| Vazamento cross-tenant / isolamento como configuração | `tenant-harness` (boundary invariante; impede cruzamento e inferência) |
| Execução sem cadeia / modelo executando / efeito sem evento | `execution-harness` (cadeia registro→…→verificação; impede fora de contrato) |
| Harness com autoridade / implementação prematura | fronteiras comuns (§9); documental, subordinado a spec |
| Monólito distribuído | composição ≠ contenção; harnesses desacopláveis |
| Executor desligando a própria fiscalização | independência executor↔auditoria; controlabilidade read-only |

---

## 15. O que ainda está fora de escopo

Permanecem **fora de escopo** até autorização formal e separada:

- **checkpoint consolidado da P4 inteira** — **não criar agora**;
- **Execution Handoff Pack para Codex** — **não criar agora**;
- harnesses **posteriores** (`context`, `retrieval`, `audit`, `escalation`);
- qualquer harness/skill/subagente **executável**, implementation harness, código, API, schema,
  frontend, backlog, sprint plan, YAML/JSON, DSL, contrato machine-readable;
- inferência de stack técnica; plano de implementação.

O trabalho permanece **arquitetura/documentação em linguagem natural estruturada**.

---

## 16. Próxima fronteira recomendada

Direção recomendada — **a confirmar separadamente, sem autorização de execução aqui**:

1. **Checkpoint consolidado da P4 inteira** (Preparation Map + 4 skills + 3 subagentes + 5 harnesses e
   seus checkpoints);
2. Depois, **Execution Handoff Pack para Codex** — o pacote de transição para a construção controlada
   sob harness, trace e verificação ([Controlled Execution Plan §15–§18](../../../implementation/controlled-execution-plan.md)).

**Não criar nenhum desses agora.** Documental, uma peça por vez, com checkpoint. **Este documento não
autoriza a próxima peça.**

---

## 17. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/harnesses/p4-minimum-harnesses-checkpoint.md`. Nenhum
   outro arquivo criado ou alterado.
2. **Natureza respeitada:** consolidation-only · governance-first · architecture/process-only ·
   linguagem natural estruturada. **Não** é novo harness, harness executável, implementation harness,
   skill, subagente, spec nova, código, API, schema, YAML/JSON ou contrato machine-readable.
3. **Estrutura:** **exatamente as 17 seções** confirmadas pelo operador.
4. **Consolidação:** os 5 harnesses mínimos (runtime, governance, observability, tenant, execution),
   papéis, fronteiras comuns, specs P0–P3 governantes, relação com skills e subagentes mínimos,
   invariantes e riscos — **referenciados, não duplicados**.
5. **Próxima fronteira:** **checkpoint consolidado P4** e depois **Execution Handoff Pack para Codex** —
   recomendados, **não iniciados**.
6. **Confirmação de fronteira:** **nenhum** checkpoint P4 consolidado, Execution Handoff Pack, novo
   harness, harness executável, implementation harness, skill/subagente executável, código, API,
   schema, frontend, backlog, YAML/JSON ou contrato machine-readable foi criado. Specs P0–P4, mapas e
   checkpoints anteriores **não** modificados. Nenhuma stack inferida.

**Parado aqui. Não avancei para o checkpoint P4 consolidado nem para o Execution Handoff Pack.**

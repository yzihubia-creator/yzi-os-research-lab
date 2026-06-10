# interface-subagent — Subagente Spec (documental)

> **Spec documental de subagente (P4), architecture-only · governance-first · subagent-preparation ·
> linguagem natural estruturada.** Define o **contrato do papel** `interface-subagent` — o que ele
> é, o que medeia, seus limites, critérios de aceite/rejeição, observabilidade e proveniência.
> **Não** é subagente executável, prompt final, persona final nem machine-readable. **Não** usa
> YAML, JSON, schema, DSL, pseudo-código, contrato técnico executável, código, API, configuração ou
> plano de implementação. **Descreve o papel; não o implementa.** A arquitetura continua sendo o
> produto.
>
> Derivada fielmente de: [Subagent Map](../../../subagents/subagent-map.md) (card
> `interface-subagent`), [p4-preparation-map](../p4-preparation-map.md),
> [p4-minimum-skills-checkpoint](../skills/p4-minimum-skills-checkpoint.md),
> [Skill Map](../../../skills/skill-map.md),
> [controlled-execution-plan](../../../implementation/controlled-execution-plan.md),
> [checkpoint P0–P3](../../specs-p0-p3-checkpoint.md), as specs P0–P3 aprovadas e as 4 skills
> mínimas P4. **Não inventa doutrina; extrai o contrato já consolidado.**
>
> *Briefing recebido íntegro: 33 condições obrigatórias e 27 seções obrigatórias — sem reconstrução.*

---

## 1. Identificação

| Campo | Valor |
| --- | --- |
| Nome | `interface-subagent` (Agente Institucional) |
| Tipo | Subagente (papel operacional especializado) — **documental nesta fase** |
| Grupo | Sub-A Interface (Subagent Map §6) |
| Camada | agents |
| Specs governantes (aprovadas) | `behavioral-governance`, `policy-enforcement`, `operational-boundaries`, `escalation-policy`, `context-assembly`, `context-provenance` (P2); invariantes P0; observabilidade P3 |
| Specs governantes (futuras) | `institutional-agent`, `agent-execution`, `agent-governance` (grupo Agent, ainda não criadas) |
| Skills que compõe | `intent-extraction`, `context-assembly` (+ apoia-se em `provenance-tagging`, `evidence-compilation`) |
| Tenant-scope | Global/instância |
| Proveniência | `[PYR]` `[CE]` |
| Status | Spec documental de preparação P4 — **não executável** |

---

## 2. Status, camada, onda e owner arquitetural

- **Status:** documental · subagent-preparation · não executável · proposta para aprovação.
- **Camada:** agents (interface linguística institucional).
- **Onda:** P4 (preparação de subagentes), primeira peça do bloco de subagentes; sucede o conjunto
  mínimo de skills.
- **Owner arquitetural:** Agents / Specification Engineering.

---

## 3. Propósito

Definir o contrato do **papel especializado que medeia a interação entre linguagem humana, intenção
operacional candidata, contexto governado e resposta institucional** (condição 2). O
`interface-subagent` **traduz intenção em operação proposta** (Metadata) e devolve resposta
institucional — **sem decidir, executar, autorizar ou governar**. Define-se o papel **sem promovê-lo
a executor, decisor, runtime ou chatbot** (condições 1, 3, 33).

---

## 4. Escopo

- Mediar **linguagem ↔ operação proposta**: receber entrada linguística, acionar `intent-extraction`
  e `context-assembly`, e formular resposta/encaminhamento institucional.
- Operar dentro de specs, tenant boundary, policies, contexto autorizado e observabilidade
  (condições 12–14, 18, 19, 28).
- Registrar ambiguidades, lacunas, conflitos e limitações (condição 20); pendenciar/escalar quando
  faltar intenção, contexto ou evidência (condição 21).
- Encaminhar a subagentes futuros (`retrieval-subagent`, `verification-subagent`) quando aplicável
  (condições 22, 23).

---

## 5. Fora de escopo

Esta spec **não** contém: subagente executável · prompt/persona final · configuração · código · API
· schema · frontend · backlog · sprint plan · roadmap técnico · plano de implementação · YAML/JSON ·
DSL · pseudo-código · contrato machine-readable · inferência de stack. O papel **não** decide
operação, não autoriza ação, não executa tool, não altera estado, e **não substitui** service
decision, policy enforcement nem verification (condições 6–11). **Não** governa comportamento sozinho
(condição §11/objetivo).

---

## 6. Definição do subagente

**É:** **papel operacional especializado**, governado por specification, com **autoridade limitada**,
escopo claro (linguagem ↔ proposta), permissões explícitas e método de verificação. Compõe skills
(`intent-extraction`, `context-assembly`) sob a sua fronteira (condições 1, 32).

**NÃO é** (condições 3–5, 33): chatbot autônomo · persona livre · LLM com autoridade · decisor
autônomo · runtime · executor · mini-agente generalista.

> Invariante: o `interface-subagent` **não detém autoridade comportamental** — propõe e opera dentro
> de fronteiras; os services decidem, as tools executam, o estado é a verdade, a governança
> restringe. (`P2` `P7` `P14`)

---

## 7. Interface-subagent como mediação, não decisão

O papel **media linguagem e operação, mas não decide operação** (condição 2). Ele traduz a entrada
em **proposta** (Metadata) e devolve resposta/encaminhamento institucional, **sem**:

- **autorizar ação** (6) · **executar tool** (7) · **alterar estado** (8);
- **substituir** service decision (9), policy enforcement (10) nem verification (11);
- **governar comportamento sozinho** (objetivo) — a governança é das policies/specs.

A proposta passa por **enforcement pré** antes de qualquer efeito; a decisão é dos **services**.

---

## 8. Diferença entre subagente, skill, agent, LLM, runtime, service e tool

Extraído do [Operational Harness Map §5](../../../harness-engineering/operational-harness-map.md) e
do [Subagent Map §2/§9](../../../subagents/subagent-map.md):

| Conceito | É… | Autoridade | Decide? | Executa efeito? |
| --- | --- | --- | --- | --- |
| **Estado** | verdade operacional | máxima | sim (verdade) | não |
| **Service** | lógica institucional de decisão | alta (em contrato) | decide a operação | não |
| **Policy/RAG/XML** | governança comportamental | governança | não | não |
| **Subagente** | papel operacional especializado | limitada e explícita | propõe/verifica | não |
| **Skill** | capacidade modular reutilizável | nenhuma | não | não |
| **Runtime** | coordenação leve | nenhuma | não | orquestra |
| **Tool** | execução controlada de efeito | nenhuma | não | sim (sob permissão) |
| **LLM** | motor probabilístico | mínima | não | não |

O `interface-subagent` é **subagente** (papel): **compõe** skills (usar capacidade) e pode **delegar**
a sub-papéis com **atenuação de privilégio** (delegação ≠ composição). Não é skill, não é runtime,
não é service, não é tool, não é o LLM.

---

## 9. Entradas conceituais do subagente

- Entrada **linguística** institucional, dentro de um tenant.
- **Intenção operacional candidata** de `intent-extraction` (como leitura de intenção, não verdade —
  condição 15).
- **Proposta de pacote de contexto** de `context-assembly` (como proposta governada, não prompt
  solto — condição 16), com proveniência (`provenance-tagging`) e evidência (`evidence-compilation`).
- Policies/specs aplicáveis, tenant boundary, operational boundaries e escalation policy.

---

## 10. Saídas conceituais do subagente

- Uma **resposta institucional** ou **encaminhamento** (a service, a `retrieval-subagent` futuro, a
  `verification-subagent` futuro, ou escalada), formulada **preservando provenance e evidence**
  (condição 17).
- O **registro** de ambiguidades, lacunas, conflitos e limitações (condição 20).
- **Nenhuma** decisão, permissão, execução ou veredito — esses pertencem a outras camadas.

---

## 11. Limites do subagente

O `interface-subagent` (condições 6–11, 24–27, 33):

- **não** autoriza ação · **não** executa tool · **não** altera estado;
- **não** substitui service decision, policy enforcement nem verification;
- **não** governa comportamento sozinho;
- **não** transforma linguagem em permissão (24);
- **não** transforma prompt em policy (25);
- **não** amplia authority layer (26);
- **não** permite bypass de tenant boundary, policy enforcement ou operational boundaries (27);
- **não** vira chatbot generalista, mini-agente autônomo, runtime ou executor (33).

---

## 12. Relação com P0

- **layer-authority-model:** opera com **autoridade mínima** (propõe como Metadata); **não amplia
  authority layer** (26); a proposta nunca sobrepõe Authority.
- **conflict-resolution:** conflitos são registrados (§23) e resolvidos por ordem de valores, não
  por preferência do modelo.
- **tenant-boundary:** **respeita tenant scope** (12) e **preserva tenant boundary** (13); não
  permite bypass (27).

---

## 13. Relação com P1

- **operational-state / event-driven-state:** **respeita o estado como verdade operacional** (14) e
  **não o altera** (8); não decide estado.
- **memory-model:** usa apenas memória permitida e proveniente; conversa não é verdade.
- **tenant-state-isolation:** opera dentro do tenant ativo, isolado.

---

## 14. Relação com P2

- **behavioral-governance / policy-enforcement:** **opera sob** ambas (18); o comportamento não vem
  de persona/prompt; a proposta passa por enforcement determinístico **fora** do subagente.
- **operational-boundaries / escalation-policy:** **respeita** as fronteiras e a política de escalada
  (19); fora de competência → escalada (§23).
- **context-assembly / context-provenance / retrieval-governance:** usa o pacote de contexto como
  **proposta governada** (16) e **preserva provenance** (17); não transforma prompt em contexto
  governante; não recupera por conta própria.
- **tenant-policy-pack / tenant-retrieval-scope:** opera dentro da verticalização governada do tenant.

---

## 15. Relação com P3

- **episode-trace / audit-log:** quando futuramente promovido, **alimenta** episode trace e audit
  log (28); nenhuma mediação sem trace.
- **service-contract:** encaminha a proposta; **a decisão é do service** — não a substitui (9).
- **tool-permission / tool-execution / tool-result-verification:** **não** autoriza (24), **não**
  executa (7) e **não** verifica resultado; apenas medeia.
- **failure-attribution / entropy-audit / intervention-log:** falha é **atribuível** (29), entropia é
  **auditável** (30), intervenção é **registrada** (31).

---

## 16. Relação com as skills mínimas

- **`intent-extraction`:** o subagente a **compõe** — usa a intenção como **leitura**, não como
  verdade (15); a intenção declarada/inferida não governa.
- **`context-assembly`:** **compõe** — usa o pacote como **proposta de contexto**, não prompt solto
  (16).
- **`provenance-tagging`:** apoia-se nela para **preservar provenance** na resposta/encaminhamento
  (17).
- **`evidence-compilation`:** apoia-se nela para **preservar evidence** ao formular
  resposta/encaminhamento (17); não conclui por asserção.

---

## 17. Relação com retrieval-subagent futuro

Quando o contexto precisar ser **recuperado**, o `interface-subagent` **encaminha** ao
`retrieval-subagent` futuro (condição 22), com **atenuação de privilégio** — não recupera por conta
própria nem amplia escopo. (Esta spec **não** cria `retrieval-subagent.spec.md`.)

---

## 18. Relação com verification-subagent futuro

Quando **conformidade/evidência** precisar ser verificada, o `interface-subagent` **encaminha** ao
`verification-subagent` futuro (condição 23) — auditor independente; quem medeia não verifica a si
mesmo. (Esta spec **não** cria `verification-subagent.spec.md`.)

---

## 19. Relação com behavioral-governance

O comportamento do `interface-subagent` é governado por `behavioral-governance` e por
`policy-enforcement` (18), **não** por persona, tom ou prompt. **Não transforma prompt em policy**
(25) e **não governa comportamento sozinho**: a regra é das policies/specs, aplicada por enforcement
determinístico.

---

## 20. Relação com observability

A mediação é **observável e auditável**: registra ambiguidades, lacunas, conflitos e limitações (20);
quando promovido, alimenta episode trace e audit log (28); é atribuível por failure-attribution (29),
auditável por entropy-audit (30) e registrável por intervention-log (31). *Nenhuma mediação confiável
sem observabilidade.*

---

## 21. Critérios de aceite

O subagente é aceito (quando, no futuro, promovido) somente se:

1. permanece **documental, modular, limitado, revisável e subordinado a specification** (1, 32);
2. **media linguagem ↔ proposta** sem decidir operação (2); proposta entra como Metadata;
3. **não** autoriza, executa, altera estado, nem substitui service decision / policy enforcement /
   verification (6–11); **não** governa comportamento sozinho;
4. **respeita** tenant scope (12), **preserva** tenant boundary (13) e **respeita** estado como
   verdade (14);
5. usa `intent-extraction` como **leitura de intenção** (15) e `context-assembly` como **proposta de
   contexto** (16); **preserva provenance e evidence** (17);
6. **opera sob** behavioral-governance/policy-enforcement (18) e **respeita** operational-boundaries/
   escalation-policy (19);
7. **registra** ambiguidades/lacunas/conflitos/limitações (20) e **pendencia/escala** quando faltar
   intenção/contexto/evidência (21);
8. pode **encaminhar** a `retrieval-subagent` (22) e `verification-subagent` (23) futuros;
9. **alimenta** episode trace e audit log quando promovido (28); é atribuível (29)/auditável
   (30)/registrável (31);
10. é reconstruível e revisável por humano (prosa estruturada, sem sintaxe de máquina).

---

## 22. Critérios de rejeição

O subagente é rejeitado se:

1. é/atua como **chatbot autônomo, persona livre, LLM com autoridade, decisor, runtime ou executor**
   (3–5, 33);
2. **decide operação, autoriza ação, executa tool ou altera estado** (6–8); ou **substitui** service
   decision / policy enforcement / verification (9–11); ou **governa comportamento sozinho**;
3. **transforma linguagem em permissão** (24) ou **prompt em policy** (25);
4. **amplia authority layer** (26) ou **permite bypass** de tenant boundary / policy enforcement /
   operational boundaries (27);
5. trata **intenção** (de intent-extraction) como **verdade** (15) ou **contexto** (de
   context-assembly) como **prompt solto** (16);
6. **não preserva** provenance/evidence (17); ou **não registra** ambiguidades/lacunas/conflitos/
   limitações (20);
7. **não pendencia/escala** quando falta intenção/contexto/evidência (21);
8. introduz sintaxe de máquina ou peça executável; ou reposiciona o YZI OS.

---

## 23. Quando pendenciar evidência ou escalar

Extraído de [`escalation-policy`](../../p2/escalation-policy.spec.md),
[`verification-report`](../../p3/verification-report.spec.md) §18 e
[`context-provenance`](../../p2/context-provenance.spec.md) §8 (condições 20, 21):

| Situação | Resposta registrada |
| --- | --- |
| Sem intenção identificável | registrar lacuna; **pendência** ou pedir confirmação |
| Sem contexto suficiente | **encaminhar a `retrieval-subagent`** futuro ou **pendência de evidência** |
| Sem evidência suficiente | **pendência de evidência**; **encaminhar a `verification-subagent`** futuro |
| Ambiguidade / conflito | **registrar**; pendenciar ou **escalar** se irreconciliável |
| Fora da fronteira de decisão | **escalar** (escalation-policy); preservar autoridade humana |

Nunca há **admissão silenciosa**: toda lacuna/ambiguidade/conflito é registrada e tratada por
pendência de evidência ou escalada.

---

## 24. Riscos arquiteturais evitados

| Risco | Mitigação nesta spec |
| --- | --- |
| Subagente virar chatbot/persona/decisor autônomo | §6, §7, §22.1 (condições 3–5, 33) |
| Linguagem virar permissão / prompt virar policy | §11 (condições 24, 25) |
| Escalonamento de authority / bypass de fronteira | §11, §12 (condições 26, 27) |
| Intenção tratada como verdade / contexto como prompt solto | §16 (condições 15, 16) |
| Mediação sem observabilidade / sem registro | §20, §23 (condições 20, 28–31) |
| Auto-verificação (quem medeia verificando-se) | §18; encaminha a verification-subagent |
| Perda de provenance/evidence na resposta | §16, §10 (condição 17) |

---

## 25. Dependências

- **Aprovadas:** `behavioral-governance`, `policy-enforcement`, `operational-boundaries`,
  `escalation-policy`, `context-assembly`, `context-provenance`, `retrieval-governance`,
  `tenant-policy-pack`, `tenant-retrieval-scope` (P2); invariantes P0; `operational-state`,
  `memory-model`, `tenant-state-isolation` (P1); observabilidade + `service-contract`,
  `tool-permission`, `tool-execution`, `tool-result-verification` (P3); skills mínimas P4
  (`intent-extraction`, `context-assembly`, `provenance-tagging`, `evidence-compilation`).
- **Futuras (pendentes):** `institutional-agent`, `agent-execution`, `agent-governance` (grupo
  Agent); `runtime-harness` / `governance-harness` (P5) que o coordenam; `retrieval-subagent` e
  `verification-subagent` (subagentes futuros). Enquanto não aprovados, a promoção **executável**
  permanece bloqueada (contract-first); esta spec é **documental**.

---

## 26. Próxima peça recomendada

Seguindo o conjunto mínimo de subagentes do [Subagent Map §8](../../../subagents/subagent-map.md), a
próxima peça recomendada é o **`retrieval-subagent`** (recuperação governada por tenant) — uma peça
por vez, com checkpoint. **Não avancei para ele** (e os guardrails proíbem criar
`retrieval-subagent.spec.md` e `verification-subagent.spec.md` agora).

---

## 27. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/subagents/interface-subagent.spec.md` (pasta
   `/docs/specs/p4/subagents/` criada). Nenhum outro arquivo criado ou alterado.
2. **Natureza respeitada:** spec documental de subagente · governance-first · subagent-preparation ·
   linguagem natural estruturada. **Sem** YAML/JSON/schema/DSL/pseudo-código/contrato
   machine-readable/código/API/configuração/plano de implementação; sem inferência de stack.
3. **Estrutura obrigatória:** as **27 seções** entregues na ordem definida.
4. **Condições obrigatórias:** as **33 condições** incorporadas e citadas por número ao longo do
   texto. **Briefing recebido íntegro — sem reconstrução nesta peça.**
5. **Derivação fiel:** contrato extraído do cânone aprovado (Subagent Map, skills mínimas, P0–P3);
   **sem inventar doutrina, sem duplicar**. Specs P0–P3, mapas e checkpoints **não** modificados.
   Dependências futuras (agent specs, harnesses, subagentes) sinalizadas.
6. **Confirmação de fronteira:** **nenhum** subagente executável, skill executável, harness, código,
   API, schema, frontend, backlog, YAML/JSON ou contrato machine-readable foi criado. **Não** foram
   criados `retrieval-subagent.spec.md` nem `verification-subagent.spec.md`.

**Parado aqui. Não avancei para o próximo subagente.**

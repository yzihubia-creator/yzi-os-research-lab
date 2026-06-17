# context-assembly — Skill Spec (documental)

> **Spec documental de skill (P4), architecture-only · governance-first · skill-preparation ·
> linguagem natural estruturada.** Define o **contrato** da capacidade `context-assembly` — o que
> ela é, o que propõe, seus limites, critérios de aceite/rejeição, observabilidade e proveniência.
> **Não** é skill executável, prompt final nem machine-readable. **Não** usa YAML, JSON, schema,
> DSL, pseudo-código, contrato técnico executável, código, API, configuração ou plano de
> implementação. **Descreve o contrato; não o implementa.** A arquitetura continua sendo o produto.
>
> Derivada fielmente de: [p4-preparation-map](../p4-preparation-map.md),
> [intent-extraction-skill](intent-extraction-skill.spec.md), [Skill Map](../../../skills/skill-map.md),
> [controlled-execution-plan](../../../implementation/controlled-execution-plan.md),
> [checkpoint P0–P3](../../specs-p0-p3-checkpoint.md) e as specs P0–P3 aprovadas — em especial
> [`context-assembly`](../../p2/context-assembly.spec.md),
> [`context-isolation`](../../p2/context-isolation.spec.md) e
> [`context-provenance`](../../p2/context-provenance.spec.md). **Não inventa doutrina; extrai o
> contrato já consolidado.**

---

## 1. Identificação

| Campo | Valor |
| --- | --- |
| Nome | `context-assembly` |
| Tipo | Skill (capacidade modular reutilizável) — **documental nesta fase** |
| Grupo | S-A Contexto (Skill Map §6) |
| Camada | context-engineering |
| Specs governantes (aprovadas) | `context-assembly`, `context-lifecycle`, `context-isolation`, `context-provenance`, `retrieval-governance` (P2); invariantes P0; estado/memória P1; observabilidade P3 |
| Tenant-scope | Per-tenant |
| Proveniência | `[PYR]` `[CE]` |
| Status | Spec documental de preparação P4 — **não executável** |

---

## 2. Status, camada, onda e owner arquitetural

- **Status:** documental · skill-preparation · não executável · proposta para aprovação.
- **Camada:** context-engineering.
- **Onda:** P4 (preparação de skills), segunda peça individual; sucede `intent-extraction`.
- **Owner arquitetural:** Context Engineering / Specification Engineering.

---

## 3. Propósito

Definir o contrato da capacidade que **monta uma proposta de pacote de contexto** just-in-time, a
partir de estado, memória permitida, retrieval governado e evidência relevante — modular,
tenant-scoped, com proveniência e prioridade explícitas (Authority › Exemplar › Constraint › Rubric
› Metadata). A skill **ajuda o sistema a sair de uma intenção operacional candidata para um pacote
de contexto governado**, sem transformar contexto em prompt solto nem permitir context rot
(condição 1, 2, 16).

---

## 4. Escopo

- Montar **proposta** de pacote de contexto a partir das fontes permitidas, provenientes e
  tenant-scoped (condição 14).
- Considerar os doze insumos da condição 15 (§8).
- Produzir um pacote proposto com os doze indicadores da condição 17 (§9).
- Respeitar os cinco critérios de qualidade (relevância, suficiência, isolamento, economia,
  proveniência) e prevenir os quatro modos de context rot (§10–§11).
- Registrar ambiguidade, lacunas e conflitos (condição 25) e sinalizar quando isolar, descartar,
  pendenciar evidência ou escalar (§24).

---

## 5. Fora de escopo

Esta spec **não** contém: skill executável · prompt final/de skill · configuração · código · API ·
schema · frontend · microservices · backlog · sprint plan · roadmap técnico · plano de
implementação · YAML/JSON · DSL · pseudo-código · contrato machine-readable · inferência de stack
técnica. A skill **não** decide operação, não autoriza ação, não executa tool, não altera estado, e
não substitui service decision, policy enforcement, retrieval governance, tool permission nem
verification (condições 2–10, §12).

---

## 6. Definição da skill

**É:** capacidade **modular, reutilizável e subordinada a specification** (condição 31) que recebe
uma intenção operacional candidata + insumos governados e produz uma **proposta de pacote de
contexto** montada just-in-time (condição 1, 16).

**NÃO é:** prompt gigante · persona · mini-agente autônomo · comportamento solto · instrução textual
sem contrato · decisor · executor · enforcement · retrieval governance · verificação (condição 32,
§12).

> Invariante: `context-assembly` **não detém autoridade comportamental** — propõe um ambiente
> (contexto), não uma decisão; os services decidem, as tools executam, o estado é a verdade.
> (`P2` `P14`)

---

## 7. Context assembly como proposta de pacote de contexto, não decisão

A skill **prepara o pacote de contexto, mas não decide a operação** (condição 2). O que ela entrega
é uma **proposta** — um ambiente montado e rotulado — submetido depois a governança (enforcement),
decisão (service) e verificação. A montagem:

- **não autoriza ação** (condição 3);
- **não executa tool** (condição 4);
- **não altera estado** (condição 5);
- **não substitui** service decision (6), policy enforcement (7), retrieval governance (8), tool
  permission (9) nem verification (10).

A proposta entra como **ambiente** (Authority/Exemplar/Constraint/Rubric/Metadata por fragmento),
nunca como veredito.

---

## 8. Entradas conceituais da skill

A skill **deve considerar** (condição 15), sempre tenant-scoped, permitido e proveniente (condição
14):

- intenção operacional candidata (de `intent-extraction`);
- estado operacional relevante (P1);
- policies aplicáveis (P2);
- specifications aplicáveis;
- tenant policy pack;
- tenant retrieval scope;
- memória permitida (com proveniência);
- retrieval permitido (governado);
- evidência disponível;
- evidência ausente;
- provenance;
- limitações conhecidas.

Memória sem proveniência e fragmento fora de tenant/autoridade **não** entram como fonte governante
(condição 20, 24).

---

## 9. Saídas conceituais da skill

A skill produz **uma proposta de pacote de contexto, não uma decisão** (condição 16). O pacote
proposto **deve indicar** (condição 17):

- objetivo operacional;
- tenant scope;
- fontes usadas;
- fontes excluídas (quando relevante);
- motivo de inclusão;
- motivo de exclusão (quando relevante);
- authority layer dos fragmentos;
- evidência disponível;
- evidência ausente;
- limitações;
- risco de context rot;
- necessidade de confirmação, pendência ou escalada.

---

## 10. Critérios de qualidade do contexto

O pacote proposto **deve respeitar os cinco critérios** (condição 18), extraídos de
[`context-assembly`](../../p2/context-assembly.spec.md) §8:

| Critério | Significado |
| --- | --- |
| **Relevância** | só entra o que serve à decisão atual |
| **Suficiência** | entra o mínimo suficiente para a decisão |
| **Isolamento** | sem contaminação entre papéis e tenants (`DO2`) |
| **Economia** | divulgação progressiva; não desperdiça recurso |
| **Proveniência** | cada fragmento tem origem, momento, confiança (`DO6`) |

A prioridade do pacote **decresce**: **Authority › Exemplar › Constraint › Rubric › Metadata**; o
pacote **não pode elevar Metadata acima de Authority** (condição 22) nem transformar prompt em
contexto governante (condição 23).

---

## 11. Riscos de context rot

A skill **deve prevenir context rot** (condição 19), extraído de
[`context-isolation`](../../p2/context-isolation.spec.md) §7:

| Modo | O que é | Prevenção |
| --- | --- | --- |
| **Poisoning** | informação falsa/sem origem referenciada | escopo + proveniência barram fragmento sem origem válida |
| **Distraction** | contexto cresce e desvia do essencial | atenuação/economia: entrega o mínimo necessário |
| **Confusion** | conteúdo supérfluo influencia a resposta | seleção escopada exclui o irrelevante |
| **Clash** | partes do contexto se contradizem | isolamento por papel/tenant; conflito registrado (§24) |

---

## 12. Limites da skill

A skill `context-assembly` (condições 2–10, 20–24, 32):

- **não decide** operação · **não autoriza** ação · **não executa** tool · **não altera** estado;
- **não substitui** service decision, policy enforcement, retrieval governance, tool permission nem
  verification;
- **não pode** incluir contexto sem proveniência suficiente como fonte governante (20);
- **não pode** cruzar contexto entre tenants (21);
- **não pode** elevar Metadata acima de Authority (22);
- **não pode** transformar prompt em contexto governante (23);
- **não pode** usar memória do modelo como verdade operacional (24);
- **não deve** virar prompt gigante, persona ou mini-agente autônomo (32).

---

## 13. Relação com P0

- **core-operational-principles / layer-authority-model:** a proposta respeita a autoridade
  decrescente; o pacote ordena fragmentos por authority layer e nunca eleva Metadata sobre Authority
  (condição 22).
- **conflict-resolution:** conflitos de contexto resolvem-se por ordem de valores e são registrados
  (§24), não por preferência do modelo.
- **tenant-boundary:** a montagem **preserva o tenant boundary**; nenhum fragmento cruza tenant
  (condições 12, 21).

---

## 14. Relação com P1

- **operational-state / event-driven-state:** a skill **respeita o estado como verdade operacional**
  (condição 13) e **não o altera** (condição 5); considera estado relevante como insumo (§8).
- **tenant-state-isolation:** o estado considerado é o do tenant ativo, isolado.
- **memory-model:** usa apenas **memória permitida e proveniente**; **não usa memória do modelo como
  verdade operacional** (condição 24); memória sem proveniência não governa (condição 20).

---

## 15. Relação com P2

- **context-assembly / context-lifecycle / context-isolation / context-provenance:** a skill **opera
  o contrato já fixado** — montagem just-in-time, cinco critérios, isolamento (poisoning/distraction/
  confusion/clash), proveniência por fragmento. Não o redefine.
- **retrieval-governance / tenant-retrieval-scope:** usa apenas **retrieval permitido e governado**,
  dentro do escopo do tenant; **não substitui** retrieval governance (condição 8).
- **policy-enforcement / behavioral-governance / tenant-policy-pack:** considera policies e o policy
  pack do tenant como insumo (§8); **não substitui** enforcement (condição 7).

---

## 16. Relação com P3

- **episode-trace / audit-log:** a montagem é episódio observável; **deve alimentar** episode trace
  e audit log futuros (condição 27).
- **failure-attribution:** falha de context assembly **deve ser atribuível** por failure attribution
  (condição 28) — a proveniência por fragmento sustenta a atribuição.
- **entropy-audit:** entropia causada pela skill (context rot, ruído) **deve ser auditável** por
  entropy audit (condição 29).
- **intervention-log:** intervenção relacionada à skill **deve ser registrada** por intervention log
  (condição 30).
- **verification-report / service-contract:** a skill **não substitui** verification (condição 10)
  nem service decision (condição 6).

---

## 17. Relação com intent-extraction-skill

`context-assembly` recebe a **intenção operacional candidata** produzida por
[`intent-extraction`](intent-extraction-skill.spec.md) (Metadata) e a usa como **um** insumo entre
os doze (§8) — **sem promovê-la a verdade ou autoridade**. A intenção declarada/inferida não
governa o pacote; só a intenção operacional **validável** entra, e ainda assim como candidata,
sujeita a governança e verificação.

---

## 18. Relação com retrieval-governance

A skill consome o **resultado do retrieval governado** (face contextual da governança), nunca uma
busca livre: cada fragmento recuperado chega com proveniência e dentro do tenant retrieval scope. A
skill **não recupera por conta própria** nem **substitui** retrieval governance (condição 8); apenas
**compõe** o que o retrieval governado entregou.

---

## 19. Relação com behavioral-governance

A proposta de contexto entra no envelope de `behavioral-governance` e passa por **enforcement
determinístico fora da skill**. A skill **não substitui** policy enforcement (condição 7); ela
prepara o ambiente sobre o qual o enforcement e os services atuam.

---

## 20. Relação com service-contract

A skill entrega a proposta de contexto; **a decisão é do service** (`service-contract`). A montagem
**não decide a operação** (condição 2) nem **substitui service decision** (condição 6) — alimenta a
decisão, não a toma.

---

## 21. Relação com observability

A montagem é **observável e auditável**: registra fontes usadas/excluídas, motivos, authority layer,
evidência disponível/ausente, limitações e risco de context rot (§9). Alimenta episode trace e audit
log (27), é atribuível por failure attribution (28), auditável por entropy audit (29) e tem
intervenção registrada por intervention log (30). *Nenhuma montagem sem trace.*

---

## 22. Critérios de aceite

A skill é aceita (quando, no futuro, promovida) somente se:

1. permanece **documental** nesta fase, **modular, reutilizável e subordinada a specification**
   (condições 1, 31);
2. produz **proposta de pacote de contexto, não decisão** (condições 2, 16), com os doze indicadores
   do §9 (condição 17);
3. considera os doze insumos do §8, todos **permitidos, provenientes e tenant-scoped** (condições
   14, 15);
4. respeita os **cinco critérios de qualidade** (condição 18) e a ordem Authority › … › Metadata;
5. **previne** poisoning/distraction/confusion/clash (condição 19);
6. **respeita** tenant scope (11), preserva tenant boundary (12) e respeita estado como verdade (13);
7. **registra** ambiguidade, lacunas e conflitos (condição 25);
8. **alimenta** retrieval-governance, behavioral-governance, service-contract, episode trace e audit
   log futuros (condição 27);
9. é **atribuível** por failure attribution (28), **auditável** por entropy audit (29) e tem
   intervenção **registrada** por intervention log (30);
10. é reconstruível e revisável por humano (prosa estruturada, sem sintaxe de máquina).

---

## 23. Critérios de rejeição

A skill é rejeitada se:

1. **decide** operação, **autoriza** ação, **executa** tool ou **altera** estado (condições 2–5);
2. **substitui** service decision, policy enforcement, retrieval governance, tool permission ou
   verification (condições 6–10);
3. inclui **contexto sem proveniência suficiente** como fonte governante (condição 20);
4. **cruza contexto entre tenants** (condição 21);
5. **eleva Metadata acima de Authority** (condição 22);
6. **transforma prompt em contexto governante** (condição 23);
7. **usa memória do modelo como verdade operacional** (condição 24);
8. **não registra** ambiguidade, lacunas e conflitos (condição 25);
9. admite contexto **ambíguo, insuficiente, contaminado, contraditório ou sem proveniência** sem
   isolar, descartar, pendenciar evidência ou escalar (condição 26);
10. **vira prompt gigante, persona ou mini-agente autônomo** (condição 32);
11. introduz sintaxe de máquina ou peça executável; ou reposiciona o YZI OS.

---

## 24. Quando isolar, descartar, pendenciar evidência ou escalar

Derivado de [`context-isolation`](../../p2/context-isolation.spec.md) §6.6 e
[`context-provenance`](../../p2/context-provenance.spec.md) §8 (condições 25, 26):

| Situação do contexto | Resposta registrada |
| --- | --- |
| Sem escopo / sem proveniência suficiente | **isolar** ou **descartar**; não governa decisão |
| Ambíguo | **registrar** ambiguidade; **pendenciar** ou pedir confirmação |
| Insuficiente / evidência ausente | **pendência de evidência** |
| Contaminado (poisoning) | **descartar**/isolar; **escalar** se persistente |
| Contraditório (clash) | **registrar** conflito; isolar fontes; **escalar** se irreconciliável |
| Cross-tenant / autoridade indevida | **bloquear**; gerar evidência auditável |

Nunca há **admissão silenciosa**: toda lacuna, ambiguidade ou conflito é registrada (condição 25) e
tratada por isolamento, descarte, pendência de evidência ou escalada (condição 26).

---

## 25. Riscos arquiteturais evitados

| Risco | Mitigação nesta spec |
| --- | --- |
| Context rot (poisoning/distraction/confusion/clash) | §11; cinco critérios; isolamento |
| Prompt sobre Authority / prompt virando contexto governante | §10; condições 22, 23 |
| Memória do modelo como verdade | condição 24; memória permitida e proveniente (§8/§14) |
| Vazamento cross-tenant | condições 11, 12, 21; tenant boundary preservado |
| Fragmento opaco governando | condição 20; proveniência obrigatória |
| Skill assumir decisão/execução/enforcement/verificação | §7, §12 (condições 2–10) |
| Skill virar prompt gigante/persona/mini-agente | condição 32; §6 definição |
| Falha não atribuível / entropia não auditável | §16, §21 (condições 28, 29) |

---

## 26. Dependências

- **Aprovadas:** `context-assembly`, `context-lifecycle`, `context-isolation`, `context-provenance`,
  `retrieval-governance`, `tenant-retrieval-scope`, `tenant-policy-pack`, `behavioral-governance`,
  `policy-enforcement` (P2); invariantes P0; `operational-state`, `memory-model`,
  `tenant-state-isolation` (P1); observabilidade e `service-contract` (P3); par
  `intent-extraction-skill` (P4).
- **Futuras (pendentes):** `context-harness`/`retrieval-harness` (P5, mapeados) administram a skill
  quando promovida. Enquanto não aprovados, a promoção **executável** permanece bloqueada
  (contract-first); a presente spec é **documental**.

---

## 27. Próxima peça recomendada

Seguindo o conjunto mínimo do [Skill Map §8](../../../skills/skill-map.md) e a sequência do
[controlled-execution-plan §18](../../../implementation/controlled-execution-plan.md), a próxima
skill recomendada é **`provenance-tagging`** (anexar origem/momento/confiança a cada fragmento) —
uma peça por vez, com checkpoint. **Não avancei para ela.**

---

## 28. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/skills/context-assembly-skill.spec.md`. Nenhum outro
   arquivo criado ou alterado.
2. **Natureza respeitada:** spec documental de skill · governance-first · skill-preparation ·
   linguagem natural estruturada. **Sem** YAML/JSON/schema/DSL/pseudo-código/contrato
   machine-readable/código/API/configuração/plano de implementação; sem inferência de stack.
3. **Estrutura obrigatória:** as **28 seções** entregues na ordem definida.
4. **Condições obrigatórias:** as **32 condições** incorporadas e mapeadas às seções (citadas por
   número ao longo do texto).
5. **Derivação fiel:** contrato extraído do cânone aprovado (context-assembly/isolation/provenance
   P2, P0/P1/P3, skill-map, mapas, intent-extraction); **sem inventar doutrina, sem duplicar**.
   Specs P0–P3, mapas e checkpoints **não** modificados. Dependência futura (harnesses) sinalizada.
6. **Confirmação de fronteira:** **nenhuma** skill executável, subagente, harness, código, API,
   schema, frontend, backlog, YAML/JSON ou contrato machine-readable foi criado.

**Parado aqui. Não avancei para a próxima skill.**

# intent-extraction — Skill Spec (documental)

> **Spec documental de skill (P4), architecture-only · linguagem natural estruturada.** Define o
> **contrato** da capacidade `intent-extraction` — o que ela é, o que produz, seus limites,
> critérios de aceite/rejeição, observabilidade e proveniência. **Não** cria skill executável,
> prompt, configuração, código, API, schema, frontend, backlog, YAML/JSON, DSL nem contrato
> machine-readable. **Descreve o contrato; não o implementa.** A arquitetura continua sendo o
> produto.

> **Nota de reconstrução (transparência).** O briefing desta peça chegou truncado: a lista de
> critérios obrigatórios perdeu os **itens 1–6** (o texto sobrevivente começa perto do item 7) e
> cortou o **item 16** ("…quando houver contexto, e…"), com fragmentos colados ("jervice",
> "esriar JSON"). Os **itens 7–16 visíveis** foram incorporados literalmente. Os **itens 1–6** e o
> **fecho do item 16** foram **reconstruídos** a partir do card `intent-extraction` do
> [Skill Map §7](../../../skills/skill-map.md), dos critérios de promoção a skill
> [§5](../../../skills/skill-map.md) e do padrão das specs P0–P3. Reconstruções sinalizadas; aberto
> a **ajuste aditivo direcionado**.

---

## 1. Identificação

| Campo | Valor |
| --- | --- |
| Nome | `intent-extraction` |
| Tipo | Skill (capacidade modular reutilizável) — **documental nesta fase** |
| Grupo | S-C Linguagem/Intenção (Skill Map §6) |
| Camada | agents / governance |
| Owner arquitetural | Specification Engineering / Context Engineering |
| Specs governantes (aprovadas) | `behavioral-governance` (P2); invariantes P0; observabilidade P3 |
| Specs governantes (futuras) | `institutional-agent` (grupo Agent, ainda não criada) |
| Tenant-scope | Global/instância (definição global, instância por tenant) |
| Proveniência | `[PYR]` `[CE]` |
| Status | Spec documental de preparação P4 — **não executável** |

---

## 2. Propósito

Definir o contrato da capacidade que **extrai a intenção institucional de uma entrada linguística e
produz uma proposta operacional estruturada** — entregue ao sistema como **Metadata** (menor
prioridade no pacote de contexto). A skill **traduz linguagem em proposta**; **não** decide, não
executa, não governa e não verifica.

---

## 3. Problema que resolve

Sem uma capacidade dedicada e governada de extração de intenção, o sistema tende a tratar a
formulação linguística do usuário (ou a inferência do LLM) como se fosse verdade operacional ou
autoridade. Isso colapsa as preocupações (linguagem ↔ operação ↔ estado ↔ governança) e viola a
autoridade decrescente. `intent-extraction` isola a tradução linguagem→proposta em uma fronteira
explícita, preservando o LLM como motor sem autoridade.

---

## 4. Definição da skill — o que é e o que NÃO é

**É:** capacidade **modular e reutilizável**, governada por specification, que recebe entrada
linguística e produz uma **proposta operacional estruturada** (intenção operacional candidata),
entregue como **Metadata**.

**NÃO é:** prompt gigante · persona · comportamento solto · automação improvisada · instrução
textual sem contrato · decisor · executor · enforcement · recuperação · verificação.

> Invariante: `intent-extraction` **não detém autoridade comportamental** — propõe/transforma
> dentro de fronteiras; os services decidem, as tools executam, o estado é a verdade. (`P2` `P14`)

---

## 5. Autoridade envolvida

- **LLM/skill:** autoridade **mínima** — apenas **propõe** (Metadata). Nunca decide nem executa.
- **Decisão da operação:** pertence aos **services** (`service-contract`, P3).
- **Verdade operacional:** pertence ao **estado** (P1).
- **Governança comportamental:** pertence a **policies/specs** (P2), aplicada por enforcement
  determinístico fora da proposta.

---

## 6. Entradas esperadas

- Entrada linguística institucional (texto do usuário/agente), dentro de um tenant.
- Contexto montado disponível (quando houver), respeitando a prioridade Authority › Exemplar ›
  Constraint › Rubric › **Metadata**.
- Escopo de tenant ativo (a entrada nunca atravessa a fronteira de tenant).

---

## 7. Saídas esperadas

- **Proposta operacional estruturada** (intenção operacional candidata) entregue como **Metadata** —
  jamais como Authority.
- A proposta carrega a distinção entre **intenção declarada**, **intenção inferida** e **intenção
  operacional validável** (§9).
- Nenhuma decisão, permissão, execução ou veredito de verificação é produzida pela skill.

---

## 8. Contrato esperado (linguagem natural)

Dada uma entrada linguística dentro de um tenant, `intent-extraction` produz uma proposta fiel à
intenção institucional, **sem assumir autoridade**. A proposta:

- entra no pacote de contexto como **Metadata** (menor prioridade);
- é **rastreável** à entrada original (trace intenção→proposta);
- distingue explicitamente intenção **declarada**, **inferida** e **operacional validável**;
- **não** decide a operação, **não** concede permissão, **não** executa efeito e **não** emite
  verificação — esses atos pertencem a services, fronteira de permissão, tools e verificação,
  respectivamente.

A skill é **reutilizável** por mais de um papel (p. ex. `interface-subagent`) e trata memória como
**ambiente** (estado), nunca como campo interno.

---

## 9. Distinção obrigatória — intenção declarada / inferida / operacional validável

Derivado dos critérios 13–16 do briefing:

- **Intenção declarada** (pelo usuário): o que a entrada afirma querer. **Não é automaticamente
  verdade operacional** (critério 14).
- **Intenção inferida** (pelo LLM): hipótese do motor probabilístico sobre a intenção. **Não é
  autoridade** (critério 15).
- **Intenção operacional validável:** a proposta candidata a operação. **Só pode ser usada quando
  houver contexto montado, governança aplicada e evidência/validação** — nunca por mera declaração
  ou inferência (critério 16). *(fecho do critério 16 reconstruído; ver nota de reconstrução.)*

A skill **produz e rotula** essas três camadas; **não** promove nenhuma delas a verdade ou
autoridade por conta própria.

---

## 10. Limites e fronteiras de função

Derivado dos critérios 5–9 do briefing (5–6 reconstruídos; 7–9 literais):

- `intent-extraction` **não é** policy enforcement (5). *(reconstruído)*
- `intent-extraction` **não é** service decision (6). *(reconstruído)*
- **Não substitui** policy enforcement (7).
- **Não substitui** tool permission (8).
- **Não substitui** verification (9).

A proposta entra **antes** e **abaixo** do enforcement, da permissão e da verificação — nunca os
contorna nem os antecipa.

---

## 11. Relação com a governança P0–P3

- **P0:** respeita autoridade decrescente (a proposta é Metadata, autoridade mínima) e o **tenant
  boundary** (critério 11); conflitos resolvem-se por ordem de valores.
- **P1:** respeita o **estado como verdade operacional** (critério 12); a intenção declarada não
  sobrepõe o estado; memória é ambiente.
- **P2:** opera **dentro** do envelope de `behavioral-governance`; a proposta passa por enforcement
  determinístico **fora** da skill; respeita o **tenant scope** (critério 10) e o Paradoxo do
  Metadado (proposta = menor prioridade).
- **P3:** produz o **trace intenção→proposta** (observabilidade obrigatória); não emite veredito de
  verificação — isso é de `verification-report`/`tool-result-verification`.

---

## 12. Critérios de aceite

A skill `intent-extraction` é aceita (quando, no futuro, promovida) somente se:

1. é **capacidade modular e reutilizável** governada por specification (`P15` `DO4`). *(reconstruído)*
2. **extrai a intenção institucional** da entrada e **produz proposta estruturada**. *(reconstruído)*
3. entrega a proposta como **Metadata** (menor prioridade no pacote de contexto). *(reconstruído)*
4. **não decide nem executa** — propõe dentro de fronteiras (`P2` `P14`). *(reconstruído)*
10. respeita o **tenant scope** (critério 10).
11. preserva o **tenant boundary** (critério 11).
12. respeita o **estado como verdade operacional** (critério 12).
13. **distingue** intenção declarada, inferida e operacional validável (critério 13).
- produz **trace intenção→proposta** auditável (observabilidade esperada, §15);
- é **reconstruível e revisável por humano** (prosa estruturada, sem sintaxe de máquina).

---

## 13. Critérios de rejeição

A skill é rejeitada se:

5. for tratada **como** policy enforcement (critério 5). *(reconstruído)*
6. for tratada **como** service decision (critério 6). *(reconstruído)*
7. **substituir** policy enforcement (critério 7).
8. **substituir** tool permission (critério 8).
9. **substituir** verification (critério 9).
14. tratar **intenção declarada** como verdade operacional automática (critério 14).
15. tratar **intenção inferida** pelo LLM como autoridade (critério 15).
16. usar **intenção operacional** sem contexto, governança e evidência/validação (critério 16).
- assumir autoridade comportamental, decidir, conceder permissão, executar efeito ou emitir
  veredito de verificação;
- atravessar a fronteira de tenant ou acessar estado/tools diretamente sem passar pela governança e
  pela fronteira de permissão;
- degenerar em prompt gigante, persona, comportamento solto ou instrução sem contrato.

---

## 14. Método de verificação

- **Fidelidade:** a proposta reflete a intenção da entrada sem assumir autoridade (revisão por
  evidência, não por asserção).
- **Não-usurpação:** verificação de que a proposta **não** decide, **não** permite, **não** executa
  e **não** verifica (cada um pertence a outra camada).
- **Rotulagem:** verificação de que declarada/inferida/validável estão explicitamente distinguidas.
- **Tenant:** verificação de tenant-scope e de não-vazamento cross-tenant.
- **Rastreabilidade:** o trace intenção→proposta reconstrói a origem.

A verificação é **externa à skill** (auditor independente; a skill não valida a si mesma).

---

## 15. Observabilidade esperada

- **Trace intenção→proposta:** entrada → proposta (com rótulos declarada/inferida/validável),
  tenant, contexto considerado, momento.
- A proposta é **Metadata observável**; sua proveniência é registrável e auditável.
- Nenhuma execução sem trace (P3).

---

## 16. Dependências

- **Aprovadas:** `behavioral-governance` (P2); invariantes P0 (autoridade/conflito/tenant);
  `context-assembly`/`context-provenance` (P2) para o pacote de contexto; observabilidade P3 para o
  trace.
- **Futuras (pendentes):** `institutional-agent` (grupo Agent, ainda não criada). **Enquanto não
  aprovada**, a promoção executável de `intent-extraction` permanece bloqueada (contract-first); a
  presente spec é **documental**.

> Nota: o controlled-execution-plan §6 exige "nenhuma dependência pendente" para **promoção**. Esta
> spec é de **preparação documental**; a dependência futura está **sinalizada**, não satisfeita.

---

## 17. Riscos arquiteturais evitados

| Risco | Mitigação nesta spec |
| --- | --- |
| Intenção virar autoridade/verdade | proposta = Metadata; §9 distingue camadas; §5 autoridade mínima |
| Skill substituir enforcement/permissão/verificação | §10 limites de função (critérios 5–9) |
| Skill virar prompt gigante/persona | §4 definição; §13 rejeição |
| Vazamento cross-tenant | §11/§12 tenant scope e boundary (10, 11) |
| Conclusão por asserção | §14 verificação externa; §15 trace |

---

## 18. Relação com skills / subagentes / harnesses / services / tools

- **Skills:** par de `synthesis` e `context-assembly` (compõem o ciclo de contexto); reutilizável.
- **Subagentes:** composta por `interface-subagent` (entrada do episódio); a proposta segue para
  enforcement e para os services.
- **Harnesses:** opera dentro do `runtime-harness` (coordenação) e sob o `governance-harness`
  (enforcement) e o `tenant-harness` (isolamento) — todos futuros (Harness Map).
- **Services:** entrega a proposta; **a decisão é do service** (`service-contract`).
- **Tools:** **não** invoca tools; não executa efeito.

---

## 19. Tenant-scope

**Global/instância:** a definição da skill é global; sua operação é **instanciada e isolada por
tenant**. A entrada, o contexto e a proposta permanecem dentro do tenant; a fronteira de tenant é
invariante (critérios 10–11).

---

## 20. Proveniência

`[PYR]` (Context→Intent→Specification; intenção como etapa governada, não autoridade) ·
`[CE]` (confiança na arquitetura, não no modelo; proposta como Metadata).

---

## 21. Fora de escopo

Esta spec **não** contém: skill executável · prompt de skill · configuração · código · API · schema
· frontend · microservices · backlog · sprint plan · roadmap técnico · plano de implementação ·
YAML/JSON · DSL · pseudo-código · contrato machine-readable · inferência de stack técnica.

---

## 22. Fronteiras (o que NÃO está aqui)

- **Não** cria a skill executável nem qualquer artefato de implementação — apenas descreve o
  contrato.
- **Não** modifica specs P0–P3, os mapas anteriores ou os checkpoints.
- **Não** autoriza a próxima skill nem qualquer outra peça — uma peça por vez.

---

## 23. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/skills/intent-extraction-skill.spec.md` (pasta
   `/docs/specs/p4/skills/` criada). Nenhum outro arquivo criado ou alterado.
2. **Natureza respeitada:** spec documental de skill, architecture-only, linguagem natural
   estruturada. **Sem** YAML/JSON/schema/DSL/contrato machine-readable; sem inferência de stack; não
   é plano de implementação.
3. **Critérios incorporados:** itens **7–16 literais**; itens **1–6** e fecho do **item 16**
   **reconstruídos** do Skill Map (card + §5) e do padrão P0–P3, **sinalizados** no arquivo.
4. **Derivação fiel:** card `intent-extraction` do Skill Map e governança P0–P3 referenciados sem
   duplicação; dependência futura (`institutional-agent`) sinalizada, não satisfeita.
5. **Confirmação de fronteira:** **nenhuma** skill executável, subagente, harness, código, API,
   schema, frontend, backlog, YAML/JSON ou contrato machine-readable foi criado.

**Parado aqui. Não avancei para a próxima skill.**

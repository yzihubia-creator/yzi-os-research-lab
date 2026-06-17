# context-assembly

> **Specification documental (governança-first, contract-first, linguagem natural estruturada).**
> Primeira spec do grupo **Context/Retrieval** da Onda P2. Define a **montagem do pacote de contexto**:
> sob demanda (just-in-time), modular, tenant-scoped, auditável e verificável, a partir de estado,
> memória permitida, retrieval governado e evidência relevante, respeitando a prioridade **Authority ›
> Exemplar › Constraint › Rubric › Metadata** (o prompt é Metadata). **Não** é machine-readable: não
> contém YAML, JSON, schema, DSL, pseudo-código nem contrato técnico executável.
>
> Onda: P2 (governança + contexto) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `context-assembly` |
| **Camada** | `context-engineering` |
| **Owner arquitetural** | Contexto |
| **Tenant-scope** | Per-tenant |
| **Classe de operação** | recuperação-contextual / composição |
| **Candidatura** | `skill` (montagem de contexto) + `harness` (`context-harness`) |
| **Dependências** | [`operational-state`](../p1/operational-state.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`memory-model`](../p1/memory-model.spec.md) |
| **Proveniência** | `[PYR]` `[CE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P11` (contexto modular/recuperável), `DO2` (isolamento contextual).
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §3 — contexto é o OS do agente; logística just-in-time; "o mínimo suficiente para a decisão".
- [`/docs/specs/p1/memory-model.spec.md`](../p1/memory-model.spec.md) e [`operational-state`](../p1/operational-state.spec.md) — memória administrada; estado-verdade.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, **como o pacote de contexto é montado** no YZI OS: o
contexto é o **ambiente de execução** do agente (o seu sistema operacional), montado **sob demanda**, de
forma **modular, tenant-scoped, auditável e verificável**, a partir de **estado, memória permitida,
retrieval governado e evidência relevante** — respeitando a prioridade **Authority › Exemplar ›
Constraint › Rubric › Metadata**, na qual o prompt é Metadata (menor autoridade).

A spec **extrai** (não inventa nem resume) `P11`/`DO2`, a engenharia de contexto e a filosofia §3. É a
raiz do grupo Context/Retrieval e candidata principal a **skill**.

---

## 2. Problema que resolve

Fornecer ao agente "tudo o que está disponível" como um bloco monolítico degrada a decisão (context
rot), vaza entre papéis/tenants e desperdiça recurso. Sem montagem governada, o contexto vira ruído.

Esta spec elimina o risco fixando a montagem como **logística just-in-time**: o mínimo suficiente para
a decisão, modular, isolado, com proveniência e prioridade explícitas.

---

## 3. Autoridade envolvida

- **Governa a montagem:** a camada de Contexto/Retrieval sob policies, com o Estado como fonte de
  verdade e as Specifications/Policies como Authority.
- **Administra (não decide a verdade):** Runtime/Services montam o pacote como ambiente.
- **NÃO eleva a própria autoridade:** o prompt/agente/LLM entram como **Metadata** — nunca sobrepõem
  Authority (`P1`, Paradoxo do Metadado).

---

## 4. Entradas esperadas

Fontes de composição, todas tenant-scoped e com proveniência:
- **Estado** operacional relevante ([`operational-state`](../p1/operational-state.spec.md)).
- **Memória permitida** (working/episódica/semântica/procedural), com proveniência
  ([`memory-model`](../p1/memory-model.spec.md)).
- **Retrieval governado** (face contextual da governança; `retrieval-governance`, futura).
- **Evidência relevante** à operação.

## 5. Saídas esperadas

- Um **pacote de contexto** montado just-in-time que satisfaz os cinco critérios (§8) e respeita a
  ordem de prioridade (§9), com proveniência por fragmento.

---

## 6. Contrato esperado (linguagem natural)

1. O contexto **DEVE** ser montado **sob demanda** (just-in-time), não fornecido como bloco monolítico.
2. O contexto **DEVE** ser **modular, tenant-scoped, auditável e verificável**.
3. O contexto é montado a partir de **estado, memória permitida (com proveniência), retrieval governado
   e evidência relevante** (§4).
4. O pacote **DEVE** respeitar a prioridade **Authority › Exemplar › Constraint › Rubric › Metadata**;
   o **prompt é Metadata** e **NUNCA** sobrepõe Authority.
5. O pacote **DEVE** satisfazer os cinco critérios: **relevância, suficiência, isolamento, economia,
   proveniência** (§8).
6. Memória sem proveniência **NÃO DEVE** entrar no pacote que governa decisão (`memory-model`).
7. Nenhum fragmento **DEVE** cruzar a fronteira de tenant ([`tenant-boundary`](../p0/tenant-boundary.spec.md)).

---

## 7. Fontes de composição

| Fonte | Papel na montagem | Condição |
| --- | --- | --- |
| **Estado** | a verdade operacional relevante | recuperável, tenant-scoped |
| **Memória permitida** | working/episódica/semântica/procedural | com proveniência; isolada por tenant |
| **Retrieval governado** | o que o agente "sabe" (RAG) | por política; proveniência por fragmento |
| **Evidência relevante** | suporte verificável à operação | auditável |

O contexto é **representação compilada** de um sistema stateful mais rico, não uma string de texto.

---

## 8. Os cinco critérios do pacote de contexto

| Critério | Significado |
| --- | --- |
| **Relevância** | só entra o que serve à decisão atual |
| **Suficiência** | entra o **mínimo suficiente** para a decisão |
| **Isolamento** | sem contaminação entre papéis e tenants (`DO2`) |
| **Economia** | divulgação progressiva; não desperdiça recurso/tokens |
| **Proveniência** | cada fragmento tem origem, momento e confiança (`DO6`) |

Um pacote que falhe em qualquer critério é não-conforme.

---

## 9. Ordem de prioridade do pacote (Paradoxo do Metadado)

Dentro do pacote, a autoridade **DECRESCE**:

> **Authority › Exemplar › Constraint › Rubric › Metadata**

- **Authority** — specs, policies, estado (governam).
- **Exemplar / Constraint / Rubric** — exemplos, restrições e critérios de avaliação.
- **Metadata** — o prompt/instrução pontual (menor prioridade).

O **prompt nunca sobrepõe Authority**: ele inicia a interação, mas não a governa.

---

## 10. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Montar contexto just-in-time, modular, tenant-scoped, auditável e verificável.
2. Compor a partir de estado/memória permitida/retrieval governado/evidência (§7).
3. Satisfazer os cinco critérios (§8).
4. Respeitar a ordem de prioridade do pacote; manter o prompt como Metadata (§9).
5. Excluir memória sem proveniência do que governa decisão.
6. Impedir fragmentos de cruzar a fronteira de tenant.
7. Registrar proveniência por fragmento (auditabilidade).

---

## 11. Critérios de aceite

1. Referencia `P11`/`DO2` e a engenharia de contexto sem contradizê-las nem duplicá-las.
2. Fixa montagem just-in-time, modular, tenant-scoped, auditável e verificável (§6).
3. Fixa as fontes de composição (§7) e os cinco critérios (§8).
4. Fixa a prioridade Authority › … › Metadata (§9).
5. Exige proveniência por fragmento e isolamento por tenant.
6. É candidata coerente a skill/harness; revisável por humano.

---

## 12. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Fornece contexto monolítico em vez de modular/just-in-time.
2. Monta contexto não-verificável, não-auditável ou não-tenant-scoped.
3. Viola qualquer dos cinco critérios (relevância/suficiência/isolamento/economia/proveniência).
4. Permite o prompt sobrepor Authority (quebra o Paradoxo do Metadado).
5. Admite memória sem proveniência governando decisão.
6. Deixa fragmento cruzar a fronteira de tenant.
7. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 13. Relação com as camadas do YZI OS

A montagem de contexto serve a camada de **Contexto/Retrieval** (face contextual da governança),
alimentada pelo Estado (verdade) e governada por Policies/Specifications (Authority). O `context-harness`
a administra; o `retrieval-harness` governa a recuperação; Agents recebem o pacote para **propor**.
Herda autoridade de [`layer-authority-model`](../p0/layer-authority-model.spec.md) e isolamento de
[`tenant-boundary`](../p0/tenant-boundary.spec.md).

---

## 14. Relação com specifications futuras

Raiz do grupo Context/Retrieval: sustenta `context-lifecycle` (write/select/compress/isolate),
`context-isolation`, `context-provenance` e `retrieval-governance` — ver
[Specification Map](../../specification-engineering/specification-map.md). É a principal candidata a
**skill** (`context-assembly`) e parte do `context-harness`. Depende de `operational-state` e
`memory-model` (Onda P1).

---

## 15. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Relação com a montagem de contexto |
| --- | --- |
| **Skill** | `context-assembly` é a skill de montagem; `provenance-tagging`/`context-curation` apoiam |
| **Subagente** | `interface-subagent`/`retrieval-subagent` consomem o pacote montado |
| **Harness** | o `context-harness` administra a montagem; o `retrieval-harness` governa o retrieval |
| **Service** | compõe o pacote como ambiente, sob policy |
| **Tool** | fornece fragmentos (via evento/retrieval) com proveniência e tenant context |
| **LLM / agente de código** | recebe o pacote; sua instrução é Metadata, não Authority |

---

## 16. Método de verificação

1. **Cinco critérios:** verificar que o pacote satisfaz relevância/suficiência/isolamento/economia/
   proveniência.
2. **Prioridade:** verificar que Authority sobrepõe Metadata (prompt não governa).
3. Verificar proveniência por fragmento e ausência de memória sem proveniência governando decisão.
4. Verificar isolamento por tenant (nenhum fragmento cruza a fronteira).
5. Verificar montagem just-in-time e modular (não monolítica).
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 17. Observabilidade esperada

- Registro, por pacote: fragmentos · fonte · proveniência · tenant · critério atendido · prioridade.
- Registro de exclusões (memória sem proveniência, fragmento cross-tenant barrado).
- Trilha auditável e read-only para o artefato que ela fiscaliza (`P9`, `DO6`).

---

## 18. Riscos arquiteturais evitados

- **Context rot** — contexto contaminado/monolítico degradando a decisão.
- **Prompt sobre Authority** — quebra do Paradoxo do Metadado (`P1`).
- **Vazamento entre papéis/tenants** — falta de isolamento (`DO2`).
- **Memória sem proveniência governando** — fragmento opaco dirigindo decisão.
- **Desperdício** — contexto sem economia/relevância.

---

## 19. Fora de escopo

- **Não** define o ciclo de vida do contexto em detalhe (`context-lifecycle`), o retrieval governado
  (`retrieval-governance`), o isolamento em detalhe (`context-isolation`) nem a proveniência em detalhe
  (`context-provenance`) — apenas a **montagem** e os referencia.
- **Não** cria a skill/`context-harness` executável nem nenhuma outra spec.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 20. Proveniência

`[PYR]` Context→Intent→Specification — contexto é o OS do agente; logística just-in-time; operações
write/select/compress/isolate; isolamento de visibilidade. `[CE]` Context Engineering — Authority › … ›
Metadata; Paradoxo do Metadado; proveniência; "o mínimo suficiente para a decisão".

---

## 21. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P11`/`DO2` nem a engenharia de contexto: é a spec que os **opera** como contrato
  de montagem de contexto verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa a montagem de contexto que as demais herdam.

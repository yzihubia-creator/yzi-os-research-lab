# context-lifecycle

> **Specification documental (governança-first, contract-first, linguagem natural estruturada).**
> Segunda spec do grupo **Context/Retrieval** da Onda P2. Define o **ciclo de vida do contexto** no
> YZI OS: o contexto **tem ciclo de vida governado** e **não permanece válido indefinidamente** — pode
> ser **escrito, selecionado, comprimido, isolado, descartado ou escalado**, respeitando as operações
> **write, select, compress e isolate**. **Não** é machine-readable: não contém YAML, JSON, schema,
> DSL, pseudo-código nem contrato técnico executável.
>
> Onda: P2 (governança + contexto) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `context-lifecycle` |
| **Camada** | `context-engineering` |
| **Owner arquitetural** | Contexto |
| **Tenant-scope** | Per-tenant |
| **Classe de operação** | gestão-de-ciclo-de-vida-contextual |
| **Candidatura** | `harness` (`context-harness`) + `skill` (operações de contexto) |
| **Dependências** | [`context-assembly`](context-assembly.spec.md), [`memory-model`](../p1/memory-model.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md) |
| **Proveniência** | `[PYR]` `[CE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P11` (contexto modular/recuperável), `DO2` (isolamento contextual).
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §3 — contexto é o OS do agente; logística just-in-time; operações write/select/compress/isolate; "o mínimo suficiente para a decisão".
- [`/docs/specs/p2/context-assembly.spec.md`](context-assembly.spec.md) — montagem do pacote; cinco critérios; prioridade Authority › … › Metadata.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, o **ciclo de vida do contexto** no YZI OS: o contexto
não é um bloco perpétuo nem uma memória livre do modelo — é um **artefato governado e perecível**, que
nasce montado sob demanda (`context-assembly`), é **mantido, transformado e encerrado** por operações
explícitas — **write, select, compress, isolate** — e que pode ainda ser **descartado** ou **escalado**
quando deixa de ser válido, suficiente ou seguro.

A spec **extrai** (não inventa nem resume) `P11`/`DO2`, a engenharia de contexto e a filosofia §3.
**Complementa** `context-assembly`: enquanto aquela fixa **como o pacote é montado**, esta fixa **como
o contexto evolui e termina ao longo do tempo**.

---

## 2. Problema que resolve

Tratar o contexto como permanente — "uma vez no contexto, sempre no contexto" — produz **context rot**:
acúmulo de fragmentos obsoletos, vazamento entre operações/tenants, perda de proveniência e degradação
da decisão. Sem ciclo de vida governado, o contexto envelhece sem controle e contamina o que vem
depois.

Esta spec elimina o risco fixando que **todo contexto é perecível e administrado**: tem validade
limitada, operações de transformação explícitas e um encerramento auditável (descarte ou escalada).

---

## 3. Autoridade envolvida

- **Governa o ciclo de vida:** a camada de Contexto/Retrieval sob policies, com o **Estado** como fonte
  de verdade e as **Specifications/Policies** como Authority.
- **Administra (não decide a verdade):** o Runtime/Services e o `context-harness` executam as operações
  write/select/compress/isolate como **gestão de ambiente**, não como decisão sobre o estado.
- **NÃO eleva a própria autoridade:** o prompt/agente/LLM **não** decidem por conta própria manter,
  descartar ou validar contexto fora das policies — entram como **Metadata** (`P1`, Paradoxo do
  Metadado).

---

## 4. Entradas esperadas

- O **pacote de contexto** já montado por [`context-assembly`](context-assembly.spec.md) e seus
  fragmentos (com fonte, proveniência e tenant).
- As **policies/specifications** aplicáveis ao ciclo de vida (validade, compressão, descarte,
  escalada).
- O **estado** e a operação em curso que determinam relevância e suficiência ao longo do tempo.

## 5. Saídas esperadas

- Um contexto cujo **estado de ciclo de vida** é sempre explícito e auditável: montado · mantido ·
  transformado (select/compress/isolate) · **descartado** ou **escalado**.
- O **registro auditável** de cada operação de ciclo de vida (operação, motivo, momento, tenant,
  proveniência afetada).

---

## 6. Contrato esperado (linguagem natural)

1. O contexto **DEVE** ter **ciclo de vida governado**: cada fragmento e cada pacote têm estado
   explícito ao longo do tempo.
2. O contexto **NÃO DEVE** permanecer válido **indefinidamente**: validade é limitada e verificável,
   não perpétua.
3. O contexto **DEVE** poder ser **escrito (write), selecionado (select), comprimido (compress),
   isolado (isolate), descartado (discard) ou escalado (escalate)**.
4. As operações de transformação de contexto **DEVEM** respeitar **write, select, compress e isolate**
   como o conjunto canônico de operações governadas (§7).
5. O contexto **DEVE** continuar montado **sob demanda** e **para a decisão** — "o mínimo suficiente",
   nunca acumulado como bloco perpétuo ([`context-assembly`](context-assembly.spec.md)).
6. Nenhuma operação de ciclo de vida **DEVE** violar proveniência, isolamento ou fronteira de tenant
   ([`tenant-boundary`](../p0/tenant-boundary.spec.md), [`memory-model`](../p1/memory-model.spec.md)).
7. Em dúvida sobre validade, suficiência ou segurança do contexto, a operação **DEVE descartar** o
   fragmento ou **escalar** — nunca manter contexto duvidoso governando decisão.

---

## 7. Operações de ciclo de vida do contexto

Operações **canônicas e governadas** (`[CE]`/`[PYR]`):

| Operação | Significado | Condição de governança |
| --- | --- | --- |
| **Write** | escrever/registrar contexto novo no pacote | tenant-scoped; com proveniência |
| **Select** | selecionar o subconjunto relevante para a decisão | satisfaz relevância/suficiência (`context-assembly` §8) |
| **Compress** | comprimir/resumir preservando proveniência e sentido | não perde proveniência nem cria autoridade nova |
| **Isolate** | isolar fragmentos por papel/operação/tenant | sem contaminação cruzada (`DO2`) |

Operações **de encerramento**, derivadas das anteriores:

| Operação | Significado | Condição de governança |
| --- | --- | --- |
| **Discard** | descartar contexto inválido, obsoleto ou insuficiente | registrado; não silencioso |
| **Escalate** | escalar quando manter ou descartar excede a fronteira automática | registrado; segue para o operador ([`escalation-policy`](escalation-policy.spec.md)) |

Write/select/compress/isolate são o **conjunto canônico** de transformação; discard/escalate fecham o
ciclo. Nenhuma delas decide a **verdade** — apenas administram o **ambiente** de contexto.

---

## 8. Validade e expiração do contexto

1. Todo contexto tem **validade limitada**: relevância e suficiência são propriedades **do momento da
   decisão**, não permanentes.
2. Contexto que deixou de ser relevante, suficiente, isolado, econômico ou com proveniência válida
   (os cinco critérios de [`context-assembly`](context-assembly.spec.md) §8) **expira** e **DEVE** ser
   comprimido, isolado, descartado ou escalado — nunca arrastado.
3. A expiração é **governada e auditável**, não um efeito colateral implícito.
4. Mudança no **estado** pode invalidar contexto previamente válido; o estado prevalece sobre o
   contexto retido.

---

## 9. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Tratar o contexto como **perecível e governado**, com estado de ciclo de vida explícito.
2. Impedir validade indefinida; aplicar expiração verificável.
3. Suportar as operações write/select/compress/isolate e o encerramento discard/escalate (§7).
4. Manter a montagem sob demanda/just-in-time e "o mínimo suficiente" (§6.5).
5. Preservar proveniência em toda transformação (inclusive na compressão).
6. Impedir que qualquer operação de ciclo de vida cruze a fronteira de tenant.
7. Descartar ou escalar contexto duvidoso, em vez de mantê-lo governando decisão.
8. Registrar cada operação de ciclo de vida como evidência auditável (`P9`, `DO6`).

---

## 10. Critérios de aceite

1. Referencia `P11`/`DO2`, a engenharia de contexto e `context-assembly` sem contradizê-las nem
   duplicá-las.
2. Fixa que o contexto tem ciclo de vida governado e **não** é válido indefinidamente (§6, §8).
3. Fixa as operações write/select/compress/isolate e o encerramento discard/escalate (§7).
4. Fixa expiração governada e a prevalência do estado sobre o contexto retido (§8).
5. Exige proveniência preservada na transformação e isolamento por tenant.
6. É candidata coerente a harness/skill; revisável por humano.

---

## 11. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Trata o contexto como permanente ou válido indefinidamente.
2. Não suporta write/select/compress/isolate, ou não admite descarte/escalada.
3. Comprime contexto perdendo proveniência ou criando autoridade nova.
4. Mantém contexto duvidoso, obsoleto ou insuficiente governando decisão.
5. Deixa uma operação de ciclo de vida cruzar a fronteira de tenant.
6. Permite o prompt/agente/LLM decidir manter/descartar/validar contexto fora das policies.
7. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 12. Relação com as camadas do YZI OS

O ciclo de vida do contexto opera na camada de **Contexto/Retrieval** (face contextual da governança),
alimentada pelo **Estado** (verdade) e governada por **Policies/Specifications** (Authority). O
`context-harness` administra as operações; o `governance-harness` aplica as policies de validade/
descarte; o `escalation` ([`escalation-policy`](escalation-policy.spec.md)) recebe os casos que excedem
a fronteira automática. Herda autoridade de
[`layer-authority-model`](../p0/layer-authority-model.spec.md) e isolamento de
[`tenant-boundary`](../p0/tenant-boundary.spec.md).

---

## 13. Relação com specifications futuras

Integra o grupo Context/Retrieval: complementa [`context-assembly`](context-assembly.spec.md)
(montagem) e antecede `context-isolation` (isolamento em detalhe), `context-provenance` (proveniência
em detalhe) e `retrieval-governance` (recuperação governada) — ver
[Specification Map](../../specification-engineering/specification-map.md). É candidata a parte do
`context-harness` e a skills de operação de contexto. Depende de `memory-model` (Onda P1) e das specs
P0 de autoridade e tenant.

---

## 14. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Relação com o ciclo de vida do contexto |
| --- | --- |
| **Skill** | skills de operação (`context-curation`, `context-compression`) executam write/select/compress/isolate sob policy |
| **Subagente** | `retrieval-subagent`/`interface-subagent` consomem contexto vivo; não decidem sua validade |
| **Harness** | o `context-harness` administra o ciclo; o `governance-harness` aplica validade/descarte |
| **Service** | executa as operações como gestão de ambiente, dentro de contrato |
| **Tool** | fornece fragmentos (write) com proveniência e tenant; não prolonga validade por conta própria |
| **LLM / agente de código** | recebe contexto vivo; não decide manter/descartar fora das policies (Metadata) |

---

## 15. Método de verificação

1. **Perecibilidade:** verificar que nenhum contexto é tratado como válido indefinidamente.
2. **Operações:** verificar que write/select/compress/isolate e discard/escalate estão disponíveis e
   governadas.
3. **Proveniência na transformação:** verificar que a compressão preserva proveniência e não cria
   autoridade.
4. **Expiração:** verificar que contexto obsoleto/insuficiente é comprimido, isolado, descartado ou
   escalado — não arrastado.
5. **Isolamento:** verificar que nenhuma operação de ciclo de vida cruza a fronteira de tenant.
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 16. Observabilidade esperada

- Registro, por operação de ciclo de vida: operação (write/select/compress/isolate/discard/escalate) ·
  motivo · momento · tenant · proveniência afetada.
- Registro de expirações e descartes, com causa (irrelevância/insuficiência/obsolescência/risco).
- Registro de escaladas até resolução.
- Trilha auditável e read-only para o artefato que ela fiscaliza (`P9`, `DO6`).

---

## 17. Riscos arquiteturais evitados

- **Context rot** — acúmulo de contexto obsoleto degradando a decisão.
- **Contexto perpétuo** — validade indefinida sem expiração governada.
- **Compressão com perda de proveniência** — fragmento opaco governando decisão.
- **Descarte silencioso** — perda de auditabilidade ao remover contexto sem registro.
- **Vazamento no ciclo de vida** — operação de transformação cruzando papel/tenant (`DO2`).

---

## 18. Fora de escopo

- **Não** redefine a **montagem** do pacote (`context-assembly`), o **isolamento** em detalhe
  (`context-isolation`), a **proveniência** em detalhe (`context-provenance`) nem o **retrieval
  governado** (`retrieval-governance`) — apenas o **ciclo de vida** e os referencia.
- **Não** cria o `context-harness` executável nem nenhuma outra spec.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 19. Proveniência

`[PYR]` Context→Intent→Specification — contexto é o OS do agente; logística just-in-time; operações
write/select/compress/isolate; contexto perecível e administrado. `[CE]` Context Engineering — gestão
de ciclo de vida do contexto; expiração governada; proveniência preservada na compressão; "o mínimo
suficiente para a decisão".

---

## 20. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P11`/`DO2` nem a engenharia de contexto: é a spec que os **opera** como contrato
  de ciclo de vida de contexto verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa o ciclo de vida do contexto que as demais herdam.

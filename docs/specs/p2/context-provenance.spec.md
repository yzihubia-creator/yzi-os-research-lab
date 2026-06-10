# context-provenance

> **Specification documental (governança-first, contract-first, linguagem natural estruturada).**
> Quarta spec do grupo **Context/Retrieval** da Onda P2. Define a **proveniência do contexto** no
> YZI OS: **todo fragmento de contexto carrega origem, momento, confiança, tenant e autoridade**, de
> modo que o contexto seja **auditável, reconstruível e sujeito a atribuição de falha**. Proveniência é
> a condição que torna possíveis **observabilidade, auditoria e atribuição de falha**; fragmento sem
> proveniência **não governa decisão**. **Não** é machine-readable: não contém YAML, JSON, schema, DSL,
> pseudo-código nem contrato técnico executável.
>
> Onda: P2 (governança + contexto) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `context-provenance` |
| **Camada** | `context-engineering` / `observability` |
| **Owner arquitetural** | Contexto + Observabilidade |
| **Tenant-scope** | Per-tenant |
| **Classe de operação** | proveniência-contextual / auditoria |
| **Candidatura** | `harness` (`context-harness` + `audit`) + `skill` (`provenance-tagging`) |
| **Dependências** | [`context-assembly`](context-assembly.spec.md), [`context-lifecycle`](context-lifecycle.spec.md), [`context-isolation`](context-isolation.spec.md), [`memory-model`](../p1/memory-model.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md) |
| **Proveniência** | `[CE]` `[HE-GOV]` `[HARNESS-RT]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `DO6` (proveniência/auditabilidade), `P9` (evidência verificável).
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §6 — proveniência e auditabilidade; "nada governa decisão sem origem rastreável".
- [`/docs/specs/p2/context-assembly.spec.md`](context-assembly.spec.md) §8 — critério **proveniência** (origem, momento, confiança por fragmento).

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, a **proveniência do contexto** no YZI OS: cada
fragmento que entra no pacote de contexto carrega **origem, momento, confiança, tenant e autoridade**.
A proveniência é a propriedade que torna o contexto **auditável, reconstruível e atribuível** — sem
ela não há **observabilidade, auditoria nem atribuição de falha**, e o fragmento **não pode governar
decisão**.

A spec **extrai** (não inventa nem resume) `DO6`/`P9`, a proveniência da filosofia §6 e o critério
*proveniência* de [`context-assembly`](context-assembly.spec.md). **Detalha** esse critério como
contrato próprio e o conecta à observabilidade.

---

## 2. Problema que resolve

Contexto sem proveniência é **opaco**: não se sabe de onde veio, quando, com que confiança, de qual
tenant ou autoridade. Decisões tomadas sobre fragmentos opacos não podem ser auditadas nem ter a falha
atribuída à sua causa, e abrem espaço para **poisoning** (informação falsa referenciada sem origem).

Esta spec elimina o risco fixando a proveniência como **obrigatória e por fragmento**: tudo o que
governa decisão tem origem rastreável, e tudo o que não a tem é barrado.

---

## 3. Autoridade envolvida

- **Garante a proveniência:** a camada de Contexto/Retrieval e a **Observabilidade**, sob policies,
  com o **Estado** como verdade e as **Specifications/Policies** como Authority.
- **Registra (não decide a verdade):** o **Runtime/Services** registram proveniência como evidência —
  **não** decidem o que é verdadeiro nem elevam a confiança de um fragmento por conta própria.
- **NÃO podem forjar nem remover proveniência:** **LLM, agente e prompt** não inventam origem, não
  alteram confiança e não removem proveniência (`P1`, `DO6`).

---

## 4. Entradas esperadas

- Os **fragmentos de contexto** (estado, memória, retrieval, evidência) montados por
  [`context-assembly`](context-assembly.spec.md) e geridos por [`context-lifecycle`](context-lifecycle.spec.md).
- As **policies** de proveniência (o que é exigido, quando um fragmento é admissível, como a confiança é
  atribuída).

## 5. Saídas esperadas

- Um contexto em que **cada fragmento é proveniente**: origem, momento, confiança, tenant e autoridade
  explícitos e verificáveis.
- A **trilha auditável** que sustenta observabilidade, auditoria e **atribuição de falha** (qual
  fragmento/origem causou determinada decisão).

---

## 6. Contrato esperado (linguagem natural)

1. **Todo fragmento de contexto DEVE carregar proveniência**: origem, rastreabilidade, momento,
   confiança, **limitações**, tenant, autoridade e **vínculo à sua fonte** (§7).
2. **Ausência, conflito ou fragilidade** de proveniência **NÃO DEVE** governar decisão e **DEVE**
   gerar uma resposta registrada: **bloqueio, isolamento, descarte, pendência de evidência ou
   escalada** ([`context-isolation`](context-isolation.spec.md), [`context-lifecycle`](context-lifecycle.spec.md), [`escalation-policy`](escalation-policy.spec.md)).
3. A proveniência **DEVE** tornar o contexto **auditável, reconstruível e atribuível** — base de
   **observabilidade, auditoria e atribuição de falha**.
4. A proveniência **DEVE** ser **preservada em toda transformação** do ciclo de vida — inclusive na
   **compressão** ([`context-lifecycle`](context-lifecycle.spec.md) §9.5).
5. A **autoridade** de um fragmento (camada/origem) é parte da proveniência e sustenta a ordem
   **Authority › … › Metadata** ([`layer-authority-model`](../p0/layer-authority-model.spec.md)).
6. **Contexto de Authority DEVE exigir proveniência mais forte do que Metadata**: quanto maior a
   autoridade pretendida do fragmento, mais forte e verificável precisa ser a sua origem.
7. **Prompt/conversa do usuário NÃO é proveniência suficiente para verdade operacional**; **services,
   policies, estado e documentos de Authority têm maior peso de proveniência** que conversa ou prompt.
8. **Memória recuperada** sem proveniência válida **NÃO DEVE** entrar no que governa decisão
   ([`memory-model`](../p1/memory-model.spec.md)); **retrieval/RAG** carrega proveniência **por
   fragmento**.
9. **Runtime/Services** registram proveniência mas **não decidem a verdade nem inventam fonte**; o
   **agente não declara origem sem evidência**; o **LLM não fabrica proveniência**; **prompt/agente/LLM
   não forjam, elevam nem removem** proveniência.
10. A proveniência **NÃO DEVE** cruzar fronteira de tenant nem expor dados de outro tenant
    ([`tenant-boundary`](../p0/tenant-boundary.spec.md)).

---

## 7. Anatomia da proveniência de um fragmento

| Elemento | Significado | Uso |
| --- | --- | --- |
| **Origem** | de onde o fragmento veio (estado, memória, retrieval, evidência, tool) | rastreabilidade |
| **Vínculo à fonte** | a ligação verificável entre o fragmento e a fonte que o produziu | reconstrução/atribuição |
| **Momento** | quando foi produzido/recuperado | validade temporal ([`context-lifecycle`](context-lifecycle.spec.md)) |
| **Confiança** | grau de confiança/qualidade atribuído | seleção e ponderação |
| **Limitações** | restrições/fraquezas conhecidas da fonte ou do fragmento | uso prudente; não superestimar |
| **Tenant** | a qual tenant pertence | isolamento ([`context-isolation`](context-isolation.spec.md)) |
| **Autoridade** | camada/origem de autoridade (Authority…Metadata) | prioridade do pacote |

A proveniência é **dado de primeira classe** do fragmento, não anotação opcional. A **força exigida da
proveniência é graduada pela autoridade pretendida**: Authority exige proveniência mais forte que
Metadata, e prompt/conversa **não** basta como proveniência para verdade operacional.

---

## 8. Proveniência, observabilidade e atribuição de falha

1. **Observabilidade:** a proveniência por fragmento permite observar **o que** entrou no contexto,
   **de onde** e **com que confiança**.
2. **Auditoria:** a trilha de proveniência é **read-only** e reconstruível — sustenta a auditoria
   posterior (`P9`, `DO6`).
3. **Atribuição de falha:** quando uma decisão se revela errada, a proveniência permite **atribuir a
   falha** ao fragmento/origem que a causou — não a uma caixa-preta.
4. Sem proveniência não há observabilidade, auditoria nem atribuição de falha: por isso ela é
   **condição de admissibilidade** do contexto.
5. **Ausência, conflito ou fragilidade** de proveniência **DEVE** gerar uma das respostas registradas —
   **bloqueio, isolamento, descarte, pendência de evidência ou escalada** — nunca a admissão silenciosa
   do fragmento.

---

## 9. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Anexar proveniência (origem/vínculo à fonte/momento/confiança/limitações/tenant/autoridade) a todo
   fragmento (§7).
2. Tratar **ausência, conflito ou fragilidade** de proveniência por **bloqueio/isolamento/descarte/
   pendência de evidência/escalada registrada** — nunca admissão silenciosa.
3. Exigir **proveniência mais forte para Authority** que para Metadata; **não** aceitar prompt/conversa
   como proveniência suficiente para verdade operacional.
4. Dar a **services/policies/estado/documentos de Authority** maior peso de proveniência que a
   conversa/prompt.
5. Preservar proveniência em toda transformação, inclusive compressão.
6. Exigir proveniência de memória e de retrieval/RAG (por fragmento).
7. Manter Runtime/Services como **registradores**, não decisores de verdade nem inventores de fonte;
   impedir o **agente** de declarar origem sem evidência e o **LLM** de fabricar proveniência.
8. Impedir que a proveniência cruze tenant ou exponha outro tenant.
9. Manter a trilha de proveniência **auditável e read-only**, alimentando **observabilidade, auditoria
   e atribuição de falha** (`P9`, `DO6`).

---

## 10. Critérios de aceite

1. Referencia `DO6`/`P9` e a proveniência da filosofia §6 sem contradizê-los nem duplicá-los.
2. Fixa proveniência obrigatória por fragmento, com a anatomia do §7.
3. Fixa que fragmento sem proveniência não governa decisão.
4. Liga proveniência a observabilidade, auditoria e **atribuição de falha** (§8).
5. Fixa preservação na transformação (compressão) e proveniência de memória/retrieval.
6. Exige trilha auditável read-only e isolamento por tenant; revisável por humano.

---

## 11. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Admite fragmento com proveniência **ausente, em conflito ou frágil** governando decisão (sem
   bloqueio/isolamento/descarte/pendência de evidência/escalada).
2. Não registra origem/vínculo à fonte/momento/confiança/limitações/tenant/autoridade.
3. Trata **prompt/conversa** como proveniência suficiente para verdade operacional, ou não exige
   proveniência mais forte para Authority que para Metadata.
4. Perde proveniência em alguma transformação (ex.: compressão que apaga origem).
5. Não sustenta observabilidade, auditoria ou atribuição de falha.
6. Permite LLM fabricar, agente declarar origem sem evidência, ou runtime inventar fonte; ou permite
   forjar/elevar/remover proveniência.
7. Atribui ao runtime a decisão sobre a verdade/confiança de um fragmento.
8. Deixa proveniência cruzar tenant ou expor outro tenant.
9. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 12. Relação com as camadas do YZI OS

A proveniência conecta a camada de **Contexto/Retrieval** à de **Observabilidade**: o Estado é a
verdade, as Policies/Specifications são Authority, e a Observabilidade guarda a evidência. O
`context-harness` anexa a proveniência; o `audit`/`observability-harness` a preserva e a torna
auditável; o `retrieval-harness` a exige por fragmento. Herda autoridade de
[`layer-authority-model`](../p0/layer-authority-model.spec.md), isolamento de
[`context-isolation`](context-isolation.spec.md)/[`tenant-boundary`](../p0/tenant-boundary.spec.md) e o
ciclo de vida de [`context-lifecycle`](context-lifecycle.spec.md).

---

## 13. Relação com specifications futuras

Integra o grupo Context/Retrieval: detalha o critério *proveniência* de
[`context-assembly`](context-assembly.spec.md), complementa
[`context-lifecycle`](context-lifecycle.spec.md) e [`context-isolation`](context-isolation.spec.md), e
alimenta `retrieval-governance` (proveniência do que é recuperado) — ver
[Specification Map](../../specification-engineering/specification-map.md). Sustenta a observabilidade e a
auditoria de toda a Onda P2.

---

## 14. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Relação com a proveniência |
| --- | --- |
| **Skill** | `provenance-tagging` anexa proveniência; nenhuma skill governa decisão sem ela |
| **Subagente** | `verification-subagent`/`audit-subagent` checam proveniência e atribuem falha |
| **Harness** | o `context-harness` anexa; o `audit`/`observability-harness` preserva e audita |
| **Service** | registra proveniência como evidência, dentro de contrato |
| **Tool** | emite fragmentos com origem/momento/confiança/tenant; não forja proveniência |
| **LLM / agente de código** | não inventa origem nem eleva confiança; sua instrução é Metadata |

---

## 15. Método de verificação

1. **Cobertura:** verificar que **todo** fragmento que governa decisão tem proveniência completa (§7).
2. **Barreira:** verificar que fragmento sem proveniência é bloqueado/isolado/descartado/escalado.
3. **Preservação:** comprimir/transformar contexto e verificar que a proveniência sobrevive.
4. **Atribuição de falha:** dada uma decisão errada, verificar que a proveniência aponta o
   fragmento/origem causador.
5. **Integridade:** verificar que LLM/agente/prompt não forjaram/elevaram/removeram proveniência.
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 16. Observabilidade esperada

- Registro, por fragmento: origem · momento · confiança · tenant · autoridade.
- Registro de fragmentos barrados por ausência/insuficiência de proveniência.
- Trilha de atribuição: qual fragmento/origem sustentou cada decisão (atribuição de falha).
- Trilha auditável e read-only que preserva a auditoria posterior (`P9`, `DO6`).

---

## 17. Riscos arquiteturais evitados

- **Contexto opaco** — fragmento sem origem governando decisão.
- **Poisoning** — informação falsa referenciada sem proveniência ([`context-isolation`](context-isolation.spec.md) §7).
- **Perda de proveniência na compressão** — transformação apagando origem/confiança.
- **Proveniência forjada** — LLM/agente inventando ou elevando confiança.
- **Falha não atribuível** — decisão errada sem causa rastreável.
- **Vazamento via proveniência** — metadado de origem expondo outro tenant.

---

## 18. Fora de escopo

- **Não** redefine a **montagem** (`context-assembly`), o **ciclo de vida** (`context-lifecycle`), o
  **isolamento** (`context-isolation`) nem o **retrieval governado** (`retrieval-governance`) — apenas
  a **proveniência** e os referencia.
- **Não** define o modelo de observabilidade em detalhe (isso é a camada/harness de Observabilidade) —
  apenas a proveniência que a alimenta.
- **Não** cria o `context-harness`/`audit` executável nem nenhuma outra spec.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 19. Proveniência

`[CE]` Context Engineering — proveniência por fragmento (origem, momento, confiança); "o mínimo
suficiente" com origem rastreável; prevenção de poisoning. `[HE-GOV]` Harness Engineering / Governança
— evidência auditável; trilha read-only; auditoria e atribuição de falha. `[HARNESS-RT]` AI Harness
Runtime — observabilidade do que compõe o contexto ao longo do tempo.

---

## 20. Fronteiras (o que NÃO está aqui)

- **Não** substitui `DO6`/`P9` nem a proveniência da filosofia §6: é a spec que os **opera** como
  contrato de proveniência de contexto verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa a proveniência de contexto que as demais herdam.

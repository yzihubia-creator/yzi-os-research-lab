# behavioral-governance

> **Specification documental (governança-first, linguagem natural estruturada).** Spec da Onda P2
> (Governance). Define como o **comportamento dos agentes institucionais é governado** no YZI OS: por
> **RAG + XML + Policies** — não pelo prompt, não pelo LLM, não por persona/role solta. O comportamento
> é **reconstruível a partir de policies/contratos**, evitando o déficit duplo (intenção sem contexto,
> contexto sem intenção). **Não** é machine-readable: não contém YAML, JSON, schema, DSL,
> pseudo-código nem contrato técnico executável.
>
> Onda: P2 (governança + contexto) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `behavioral-governance` |
| **Camada** | `governance` |
| **Owner arquitetural** | Governança |
| **Tenant-scope** | Global/instância (definição global, instância por tenant) |
| **Classe de operação** | governança comportamental |
| **Candidatura** | `harness` (`governance-harness`) + `gov-doc` |
| **Dependências** | [`policy-enforcement`](./policy-enforcement.spec.md), [`conflict-resolution`](../p0/conflict-resolution.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md) |
| **Dependência futura (Onda P2)** | `retrieval-governance` (a face contextual da governança; ainda não criada) |
| **Proveniência** | `[HE-GOV]` `[PYR]` `[CE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P4`, `P5`, `P12`, `DO3`, `DO5`.
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §4 — RAG + XML + Policies; specifications são a constituição; governança fora da linguagem.
- [`/docs/specs/p2/policy-enforcement.spec.md`](./policy-enforcement.spec.md) — enforcement determinístico; decisões verificáveis.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, que o **comportamento** dos agentes institucionais
é **governado por RAG + XML + Policies** — não pela formulação do prompt nem pela inferência do LLM. O
comportamento **DEVE** ser **reconstruível a partir de policies/contratos**, e não do que um agente
"diz". A governança comportamental codifica **contexto + intenção institucional**, evitando o **déficit
duplo**: intenção sem contexto é ruído; contexto sem intenção também é ruído.

A spec **extrai** (não inventa nem resume) `P4`/`P5`/`P12` e a filosofia de governança. Apoia-se no
enforcement determinístico de [`policy-enforcement`](./policy-enforcement.spec.md).

---

## 2. Problema que resolve

Quando o comportamento é governado pelo prompt (ou pela "personalidade" do agente), ele se torna
probabilístico, sujeito a deriva e a contorno. O **déficit duplo** agrava: dar **intenção sem
contexto** produz ruído; dar **contexto sem intenção** também. O resultado são agentes que derivam de
papel, ignoram policies ou inventam autoridade.

Esta spec elimina o risco fixando o comportamento como **propriedade da governança estrutural** (RAG +
XML + Policies), verificável e reconstruível — independente da eloquência do agente.

---

## 3. Autoridade envolvida

- **Governam o comportamento:** **RAG/XML/Policies** (posição 3) e **Specifications** (a constituição),
  aplicadas por enforcement determinístico.
- **NÃO governam o comportamento:** o **prompt** (Metadata), o **LLM** e o **agente** — não são fonte
  de governança; propõem dentro do que já está governado (`P1`, `P7`, `P18`).
- **Aplica/verifica:** Services e o `governance-harness`, dentro de contratos.

---

## 4. Entradas esperadas

- A operação proposta pelo agente (linguagem), com seu tenant.
- O **contexto recuperado governado** (RAG) e as **policies/specifications** aplicáveis (XML/Policies).

## 5. Saídas esperadas

- Comportamento **conforme** (operação que respeita policies/contratos), reconstruível a partir deles; **ou**
- Uma **decisão de governança** (§9): bloqueio · evidência pendente · escalada registrada.

---

## 6. Contrato esperado (linguagem natural)

1. O comportamento **NÃO É governado pelo prompt**.
2. O comportamento **NÃO É governado pelo LLM**.
3. O comportamento **NÃO É governado por persona/role solta** nem pela eloquência do agente.
4. O comportamento **É governado por RAG + XML + Policies** (contexto + intenção institucional).
5. O comportamento **DEVE** ser **reconstruível a partir de policies/contratos**, não do prompt (`P12`).
6. A governança comportamental **DEVE** evitar o **déficit duplo**: intenção sem contexto é ruído,
   contexto sem intenção também.
7. Quando o comportamento não puder ser garantido, a governança **DEVE** gerar **bloqueio, evidência
   pendente ou escalada registrada** (coerente com [`policy-enforcement`](./policy-enforcement.spec.md)).
8. A governança comportamental **DEVE** evitar **prompt drift, role drift, policy bypass, hallucinated
   authority e comportamento fora do tenant**.

---

## 7. Como o comportamento é governado (RAG + XML + Policies)

| Componente | Papel na governança comportamental |
| --- | --- |
| **RAG (retrieval)** | governa **o que o agente sabe** e, portanto, como se comporta (`P4`, `DO3`) |
| **XML / contratos** | estrutura a intenção institucional e o contrato da operação |
| **Policies** | definem o que o agente **pode e não pode** fazer, aplicadas por enforcement (`P5`, `DO5`) |
| **Specifications** | a **constituição**: o que uma classe de operação deve produzir (`P15`) |

O prompt é uma **ação pontual** (Metadata), nunca a fonte da governança. Specifications são a
constituição; as intenções, as leis; o contexto, a aplicação; o prompt, uma ação específica.

---

## 8. O déficit duplo

- **Intenção sem contexto = ruído:** dizer ao agente o que fazer sem montar o mundo informacional
  correto produz comportamento mal-formado.
- **Contexto sem intenção = ruído:** fornecer dados sem a intenção institucional codificada produz
  comportamento sem direção.

A governança comportamental **codifica os dois**: contexto governado (RAG) **e** intenção institucional
(XML/Policies/Specifications). Faltando um, a operação não é conforme.

---

## 9. Decisões da governança comportamental

Quando o comportamento não puder ser garantido como conforme, a governança produz **uma**:

| Decisão | Significado |
| --- | --- |
| **Bloqueio** | a operação viola a governança comportamental; não prossegue |
| **Evidência pendente** | falta evidência/contexto verificável; aguarda até existir |
| **Escalada registrada** | excede a fronteira automática; segue ao operador humano, com registro |

Nenhuma operação comportamentalmente não-garantida prossegue silenciosamente.

---

## 10. Falhas que a governança comportamental evita

| Falha | Descrição | Como é evitada |
| --- | --- | --- |
| **Prompt drift** | comportamento deriva por mudança/injeção no prompt | governança fora da linguagem (`P12`) |
| **Role drift** | o agente abandona seu papel institucional | papel fixado por specification/policies, não por persona |
| **Policy bypass** | a operação contorna uma policy | enforcement determinístico (`policy-enforcement`) |
| **Hallucinated authority** | o agente age como se tivesse autoridade que não tem | autoridade só nas camadas que a detêm (`layer-authority-model`) |
| **Comportamento fora do tenant** | ação cruza a fronteira de tenant | tenant-scope obrigatório (`tenant-boundary`) |

---

## 11. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Governar comportamento por RAG + XML + Policies, não por prompt/LLM/persona (`P5`, `P12`).
2. Garantir comportamento reconstruível a partir de policies/contratos.
3. Codificar contexto **e** intenção (evitar o déficit duplo).
4. Produzir bloqueio/evidência pendente/escalada quando não houver garantia.
5. Evitar prompt drift, role drift, policy bypass, hallucinated authority e comportamento fora do tenant.
6. Submeter-se ao enforcement determinístico (não autodeclarar conformidade).
7. Operar dentro do tenant-scope.
8. Registrar a governança aplicada como evidência auditável (`P9`, `DO6`).

---

## 12. Critérios de aceite

1. Referencia `P4`/`P5`/`P12` e a filosofia de governança sem contradizê-las nem duplicá-las.
2. Fixa que o comportamento não vem do prompt/LLM/persona e sim de RAG + XML + Policies (§6, §7).
3. Fixa o comportamento como reconstruível a partir de policies/contratos.
4. Fixa o déficit duplo (§8) e as decisões de governança (§9).
5. Enumera as falhas evitadas (§10).
6. Apoia-se em enforcement determinístico; é revisável por humano.

---

## 13. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Governa comportamento pelo prompt, pelo LLM ou por persona/role solta.
2. Torna o comportamento não-reconstruível a partir de policies/contratos.
3. Codifica intenção sem contexto ou contexto sem intenção (déficit duplo).
4. Não produz decisão (bloqueio/evidência pendente/escalada) quando falta garantia.
5. Permite prompt drift, role drift, policy bypass, hallucinated authority ou comportamento fora do tenant.
6. Permite ao agente autodeclarar conformidade sem enforcement.
7. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 14. Relação com as camadas do YZI OS

A governança comportamental é a camada **RAG/XML/Policies** (posição 3) somada às **Specifications**:
governa o comportamento dos Agents (posição 7), que apenas **propõem**. O `governance-harness`
aplica/verifica; o runtime aciona sem decidir; o retrieval governa o que o agente sabe
(`retrieval-governance`, futura). Herda autoridade de
[`layer-authority-model`](../p0/layer-authority-model.spec.md) e fronteira de
[`tenant-boundary`](../p0/tenant-boundary.spec.md).

---

## 15. Relação com specifications futuras

Depende de [`policy-enforcement`](./policy-enforcement.spec.md) e da futura `retrieval-governance` (a
face contextual da governança). Sustenta `agent-governance` (Onda P4), `operational-boundaries` e
`escalation-policy` — ver
[Specification Map](../../specification-engineering/specification-map.md). O `governance-harness` é a
sua materialização como substrato.

---

## 16. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Relação com a governança comportamental |
| --- | --- |
| **Skill** | opera dentro do comportamento governado; não define o próprio comportamento |
| **Subagente** | papel fixado por specification/policies, não por persona; sujeito à governança |
| **Harness** | o `governance-harness` aplica/verifica; o `retrieval-harness` governa o que o agente sabe |
| **Service** | aplica policies comportamentais dentro de contrato |
| **Tool** | só executa comportamento já governado e permitido |
| **LLM / agente de código** | propõe dentro da governança; eloquência não vira autoridade |

---

## 17. Método de verificação

1. **Reconstrução:** reconstruir o comportamento a partir de policies/contratos (não do prompt) e
   verificar coerência.
2. Verificar que mudar o prompt **não** muda o comportamento governado (ausência de prompt drift).
3. Verificar que o papel do agente se mantém (ausência de role drift) e que nenhuma policy foi
   contornada (policy bypass).
4. Verificar ausência de hallucinated authority e de comportamento fora do tenant.
5. Verificar que faltas de garantia geraram bloqueio/evidência pendente/escalada.
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 18. Observabilidade esperada

- Registro, por operação: policies/contexto que governaram o comportamento · decisão (conforme/
  bloqueio/pendente/escalada) · tenant · proveniência.
- Registro de tentativas de drift/bypass/hallucinated authority e sua contenção.
- Trilha auditável e read-only para o artefato que ela fiscaliza (`P9`, `DO6`).

---

## 19. Riscos arquiteturais evitados

- **Governança no prompt** — comportamento confiado à linguagem (`P12`).
- **Déficit duplo** — intenção sem contexto / contexto sem intenção.
- **Drift e bypass** — prompt drift, role drift, policy bypass.
- **Hallucinated authority** — agente agindo com autoridade inexistente.
- **Comportamento fora do tenant** — ação cruzando a fronteira.

---

## 20. Fora de escopo

- **Não** define o **mecanismo** de enforcement (isso é `policy-enforcement`), o retrieval governado
  em detalhe (`retrieval-governance`), as fronteiras de ação (`operational-boundaries`) nem a
  escalação (`escalation-policy`) — apenas referencia.
- **Não** cria o `governance-harness` executável nem nenhuma outra spec.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 21. Proveniência

`[HE-GOV]` Harness Engineering / Governança — Enforcement determinístico; governança fora da linguagem.
`[PYR]` Context→Intent→Specification — RAG + XML + Policies; specifications como constituição; retrieval
governa comportamento; déficit duplo. `[CE]` Context Engineering — prompt é Metadata; confiar na
arquitetura.

---

## 22. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P5`/`P12` nem a filosofia de governança: é a spec que os **opera** como contrato
  de governança comportamental verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa a governança comportamental que as demais herdam.

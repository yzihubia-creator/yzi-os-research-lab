# layer-authority-model

> **Specification documental (governança-first, linguagem natural estruturada).** Segunda spec da
> Onda P0. Fixa a **distribuição de autoridade entre as 9 camadas** do YZI OS (do Estado ao LLM) e
> o **Paradoxo do Metadado** como invariante contratual. **Não** é machine-readable: não contém
> YAML, JSON, schema, DSL, pseudo-código nem contrato técnico executável.
>
> Onda: P0 (fundacional) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `layer-authority-model` |
| **Camada** | `architecture` |
| **Owner arquitetural** | Arquitetura |
| **Tenant-scope** | Global (invariante cross-tenant) |
| **Classe de operação** | invariante de autoridade |
| **Candidatura** | `gov-doc` (governança documental) |
| **Dependências** | [`core-operational-principles`](./core-operational-principles.spec.md) |
| **Proveniência** | `[CE]` `[PYR]` `[HARNESS-RT]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/prd/yzi-os-prd-v1.md`](../../prd/yzi-os-prd-v1.md) §7 — tabela camada→autoridade.
- [`/docs/architecture/conceptual-architecture.md`](../../architecture/conceptual-architecture.md) §3 e [`governance-architecture.md`](../../architecture/governance-architecture.md).
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P1`, `P2`, `P6`, `P7`, `P13`, `P14`, `P18`.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, **quem detém autoridade e quem não detém** no YZI
OS: a autoridade operacional **decresce do Estado ao LLM**, e o LLM, o agente e o runtime **nunca**
detêm autoridade comportamental. Esta spec opera a tese central de governança do sistema:

> **O YZI OS não é governado pelo LLM, pelo runtime ou pelo agente. Ele é governado pela combinação
> entre estado persistido, services institucionais, specifications, policies, retrieval contextual e
> observabilidade operacional.**

A spec **extrai** (não inventa nem resume) a distribuição já consolidada no PRD §7 e na arquitetura
de governança, convertendo-a em invariante contratual.

---

## 2. Problema que resolve

A falha recorrente dos sistemas centrados no modelo é colocar o LLM (ou o runtime, ou o agente) no
centro da autoridade — creditando ao componente probabilístico a decisão, a verdade e a governança.
Isso produz erro de atribuição, governança no prompt e perda de auditabilidade.

Esta spec elimina o risco fixando uma **ordem de autoridade inviolável** entre camadas, verificável
em qualquer trace, e proíbe que decisão ou governança comportamental seja atribuída ao LLM/agente/
runtime.

---

## 3. Autoridade envolvida

- **Detêm autoridade (em ordem decrescente):** Estado › Services › RAG/XML/Policies › Retrieval ›
  Observabilidade (governam); Runtime (coordena).
- **NÃO detêm autoridade comportamental:** Agents, Tools e LLM.
- O **prompt** é Metadata — o nível de menor autoridade no pacote de contexto.

---

## 4. Entradas esperadas

- A tabela camada→autoridade do [PRD §7](../../prd/yzi-os-prd-v1.md) e a arquitetura de governança.
- Qualquer **operação ou artefato** cuja atribuição de autoridade precise ser verificada (trace,
  spec, decisão, execução).

## 5. Saídas esperadas

- Um **veredito de autoridade** por operação/artefato: a ordem de autoridade é respeitada / violada.
- Quando violada: identificação da camada que assumiu autoridade indevida e **escalada registrada**.

---

## 6. Contrato esperado (linguagem natural)

1. A autoridade operacional **DEVE** decrescer do Estado ao LLM, conforme a escada da §7.
2. O LLM, o agente e o runtime **NUNCA DEVEM** deter autoridade comportamental ou decisória.
3. Toda decisão operacional **DEVE** ser atribuível a Estado/Services/Policies — **nunca** ao
   modelo, ao prompt ou à eloquência de um agente.
4. O **prompt é Metadata** (menor prioridade); nenhuma formulação textual sobrepõe Authority.
5. A ordem de autoridade **DEVE** ser reconstruível e verificável em **qualquer** trace de operação.

---

## 7. Distribuição de autoridade entre as camadas

O sistema **não é modelado com o LLM no centro**. A autoridade distribui-se por 9 camadas, com o LLM
na posição de **menor** autoridade. Escada de autoridade (fonte canônica:
[PRD §7](../../prd/yzi-os-prd-v1.md); ver `conceptual-architecture` §3 e `governance-architecture`):

| Posição | Camada | Papel / autoridade | Princípios |
| --- | --- | --- | --- |
| 1 (máxima) | **Estado (Supabase)** | verdade operacional, persistência, continuidade, histórico | `P3` `P17` `DO1` `DO8` |
| 2 | **Services** | lógica institucional e decisão dentro de contratos | `P2` `P14` |
| 3 | **RAG / XML / Policies** | governança comportamental | `P4` `P5` `P12` `DO3` `DO5` |
| 4 | **Retrieval** | face contextual e de recuperação da governança | `P4` `P11` `DO3` |
| 5 | **Observabilidade** | auditoria, rastreabilidade e evidência | `P8` `P9` `DO6` `DO7` |
| 6 | **Runtime leve** | coordenação operacional (não governa) | `P6` `P13` `P16` |
| 7 | **Agents** | interface linguística institucional (propõe) | `P7` |
| 8 | **Tools** | execução operacional controlada | `P14` |
| 9 (mínima) | **LLM** | motor probabilístico **sem autoridade operacional** | `P1` `P18` |

> Leitura essencial: **o estado, os services, a governança/retrieval e a observabilidade governam;
> o runtime coordena; agents, tools e LLM não detêm autoridade comportamental.** Esta spec ordena as
> camadas por autoridade; a ordenação por **etapa de execução** (runtime antes de agents/tools) é
> tratada em `lightweight-runtime` e nos harnesses — **não** confundir posição-de-autoridade com
> sequência-de-execução.

---

## 8. O Paradoxo do Metadado e a prioridade do pacote de contexto

Dentro do pacote de contexto, a prioridade **DECRESCE** assim:

> **Authority › Exemplar › Constraint › Rubric › Metadata**

O elemento **gerado/instruído pelo modelo** (o prompt) ocupa o nível **Metadata** — o de **menor**
autoridade (o **Paradoxo do Metadado**). `[CE]` Consequências contratuais:

1. Nenhuma instrução de prompt sobrepõe uma fonte Authority (estado, spec, policy).
2. A eloquência ou confiança de um agente **não** eleva a autoridade da sua saída.
3. A confiança do sistema reside na **arquitetura**, não na formulação linguística.

---

## 9. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Atribuir decisão a Services/Estado, **nunca** ao LLM/agente/prompt (`P1`, `P2`).
2. Manter o runtime **coordenando, não governando** (`P6`, `P13`).
3. Tratar Agents e Tools como **propositores/executores sem autoridade comportamental**
   (`P7`, `P14`, `P18`).
4. Manter o prompt como **Metadata** (menor prioridade) (`[CE]`, `P1`).
5. Preservar a tese central de governança (§1) sem exceção.
6. Permitir a **reconstrução da ordem de autoridade** em qualquer trace (`P8`, `P9`, `DO7`).

---

## 10. Critérios de aceite

1. Referencia a tabela canônica (PRD §7) sem contradizê-la nem duplicá-la integralmente.
2. Fixa a escada de autoridade Estado→LLM como invariante verificável (§7).
3. Fixa o Paradoxo do Metadado e a prioridade do pacote (§8).
4. Reproduz **verbatim** a tese central de governança (§1).
5. Define método de verificação aplicável a qualquer trace/operação (§15).
6. Não atribui autoridade ao LLM/agente/runtime/prompt e é revisável por humano.

---

## 11. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Coloca o LLM, o runtime ou o agente como autoridade decisória ou comportamental.
2. Permite que o prompt sobreponha uma fonte Authority.
3. Funde posição-de-autoridade com sequência-de-execução de modo a conceder governança ao runtime.
4. Atribui ao modelo a decisão, a verdade ou a governança.
5. Altera a tese central de governança (§1) ou a contradiz.
6. Introduz código, API, schema, YAML/JSON, DSL ou contrato machine-readable.
7. Resume/duplica/inventa doutrina em vez de referenciar a fonte canônica.
8. Reposiciona o YZI OS como chatbot, SaaS genérico, automação simples ou wrapper de LLM.

---

## 12. Relação com as camadas do YZI OS

Esta spec **é** o modelo de autoridade das 9 camadas: ela ordena e governa a relação entre todas.
Detalha a distribuição que `core-operational-principles` enuncia (`P1`, `P2`, `P6`, `P7`, `P13`,
`P14`, `P18`) e prepara o terreno para `conflict-resolution` (como resolver tensões pela ordem de
valores) e `tenant-boundary` (como a autoridade se particiona por tenant).

---

## 13. Relação com specifications futuras

Toda spec futura **DEVE** respeitar esta escada de autoridade: nenhuma classe de operação pode
atribuir decisão/governança a uma camada acima da sua posição. As specs de Runtime (C), Agent (F),
Service/Tool (G) e Harness (J) do [Specification Map](../../specification-engineering/specification-map.md)
herdam diretamente este invariante. Conflitos resolvem-se pela **ordem de valores**, detalhada na
spec `conflict-resolution` (Spec 3/4 da Onda P0, ainda não criada).

---

## 14. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Posição na escada e limite |
| --- | --- |
| **Skill** | sem autoridade; capacidade modular invocada sob spec |
| **Subagente** | autoridade limitada e explícita; propõe/verifica, não governa nem decide a verdade |
| **Harness** | coordena/restringe/verifica/audita; **não** ocupa a posição de governança (estado/policies) |
| **Service** | posição 2 — decide dentro de contrato; nenhuma decisão atribuível ao modelo |
| **Tool** | posição 8 — executa sob permissão; o modelo apenas descreve a invocação |
| **LLM / agente de código** | posição 9 — sem autoridade; opera sob harness, permissão e verificação |

---

## 15. Método de verificação

1. Para cada operação, reconstruir a partir do trace **qual camada deteve a autoridade** em cada
   decisão/execução.
2. Verificar que a autoridade nunca subiu para Runtime/Agents/Tools/LLM além da sua posição.
3. Verificar que nenhuma instrução de prompt sobrepôs uma fonte Authority.
4. Violação ⇒ **escalada registrada** com identificação da camada e bloqueio até decisão humana.
5. A verificação é **independente do agente** e reconstruível (`P8`, `P9`, `DO7`).

---

## 16. Observabilidade esperada

- Registro, por operação, da camada que deteve autoridade em cada decisão/execução.
- Registro de qualquer tentativa de o prompt/agente sobrepor Authority (e sua rejeição).
- Trilha auditável e read-only para a camada que ela fiscaliza (`P9`).

---

## 17. Riscos arquiteturais evitados

- **Modelo no centro** — LLM/runtime/agente assumindo autoridade (`P1`, `P6`).
- **Governança no prompt** — instrução textual sobrepondo policy/estado (`P12`, Paradoxo do Metadado).
- **Erro de atribuição** — creditar decisão/verdade ao componente probabilístico.
- **Confusão autoridade × execução** — runtime governando por estar "antes" na sequência.
- **Reposicionamento indevido** — tratar o YZI OS como chatbot/SaaS/automação/wrapper.

---

## 18. Fora de escopo

- **Não** redefine os princípios (isso é `core-operational-principles`).
- **Não** define o procedimento de resolução de conflito em detalhe (isso é `conflict-resolution`).
- **Não** define a partição multi-tenant em detalhe (isso é `tenant-boundary`).
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  YAML/JSON ou contrato machine-readable.

---

## 19. Proveniência

`[CE]` Context Engineering — Paradoxo do Metadado; prioridade Authority › … › Metadata; confiar na
arquitetura. `[PYR]` Context→Intent→Specification — backend decide; agente é interface; tools
executam. `[HARNESS-RT]` AI Harness Runtime — runtime coordena sem governar; LLM sem autoridade;
erro de atribuição.

---

## 20. Fronteiras (o que NÃO está aqui)

- **Não** substitui o PRD §7 nem a arquitetura de governança: é a spec que os **opera** como
  contrato de autoridade verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa o invariante de autoridade que todas herdam.

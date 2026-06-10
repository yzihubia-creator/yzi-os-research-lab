# core-operational-principles

> **Specification documental (governança-first, linguagem natural estruturada).** Primeira spec da
> Onda P0 — raiz do Spec-Driven Development do YZI OS. Fixa os princípios operacionais
> **invioláveis** como contrato verificável que governa toda spec, skill, subagente, harness,
> service, tool e código futuros. **Não** é machine-readable: não contém YAML, JSON, schema, DSL,
> pseudo-código nem contrato técnico executável.
>
> Onda: P0 (fundacional/raiz) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `core-operational-principles` |
| **Camada** | `foundation` |
| **Owner arquitetural** | Fundação |
| **Tenant-scope** | Global (invariante cross-tenant) |
| **Classe de operação** | invariante institucional (meta-governança) |
| **Candidatura** | `gov-doc` (governança documental) |
| **Dependências** | nenhuma (raiz; bloqueia todas as demais specs) |
| **Proveniência** | `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — registro canônico da doutrina.
- [`/docs/specification-engineering/specification-map.md`](../../specification-engineering/specification-map.md) — cadeia de dependências das specs.
- [`/docs/implementation/controlled-execution-plan.md`](../../implementation/controlled-execution-plan.md) — processo de execução controlada.

---

## 1. Propósito

Estabelecer, como **contrato operacional verificável**, que os 18 princípios (`P1–P18`) e os 10
corolários (`DO1–DO10`) registrados em [`principles.md`](../../foundation/principles.md) são
**invioláveis** e governam toda decisão de arquitetura, runtime, governança, specification e
construção futura do YZI OS.

Esta spec **não** redefine nem resume os princípios — ela **extrai e converte** o contrato já
consolidado em invariante contratual: fixa que nenhum artefato pode violá-los sem escalada
registrada, e define como essa conformidade é verificada.

Responde às perguntas fundacionais da Fase 8:
- **Quais princípios operacionais são invioláveis?** → §7.
- **Como esses princípios governam specs futuras?** → §12.
- **O que qualquer futura implementação deve preservar?** → §6, §8.
- **O que nunca pode ser violado por skill, subagente, harness, service, tool ou código?** → §8, §13.

---

## 2. Problema que resolve

Sem um invariante de raiz, cada spec, agente ou trecho de código poderia reinterpretar
silenciosamente a doutrina do YZI OS — creditando verdade ao modelo, deslocando autoridade para o
runtime, ou diluindo a governança no prompt. O resultado seria deriva arquitetural não-auditável.

Esta spec elimina esse risco fixando um **registro único de invariantes** contra o qual **todo**
artefato é verificável, e fora do qual **nenhum** artefato pode operar sem escalada explícita.

---

## 3. Autoridade envolvida

- **Detém autoridade:** a Fundação (registro de princípios) e o estado/services/policies que os
  aplicam.
- **NÃO detém autoridade:** o LLM, o agente de código (Claude Code/Codex), o runtime e qualquer
  subagente — todos permanecem subordinados a este invariante.
- O **prompt** é Metadata (menor prioridade); nenhuma formulação textual sobrepõe um princípio.

---

## 4. Entradas esperadas

- O registro canônico de princípios [`principles.md`](../../foundation/principles.md) (`P1–P18`,
  `DO1–DO10`, ordem de valores).
- Qualquer **artefato candidato** a verificação: uma spec, skill, subagente, harness, service, tool
  ou unidade de código proposta.

## 5. Saídas esperadas

- Um **veredito de conformidade** por artefato: conforme / não-conforme.
- Quando não-conforme: a identificação do(s) invariante(s) violado(s) e o registro de **escalada**
  (nenhuma violação é absorvida silenciosamente).

---

## 6. Contrato esperado (linguagem natural)

1. **Toda** decisão de arquitetura, runtime, governança ou specification **DEVE** ser verificável
   contra `P1–P18` e `DO1–DO10`.
2. **Nenhum** artefato (spec, skill, subagente, harness, service, tool ou código) **DEVE** violar um
   invariante sem **escalada registrada** e decisão humana explícita.
3. Em conflito aparente entre princípios, a resolução **DEVE** preservar a **ordem de valores** (§7),
   **NUNCA** a numeração `P*`.
4. A confiança do sistema reside na **arquitetura**, não no modelo: nenhum invariante pode ser
   relaxado com base na competência percebida de um modelo ou agente.
5. A conformidade é **pré-condição** para promoção: nenhum artefato avança de fase sem veredito
   conforme (ou escalada aprovada).

---

## 7. Princípios invioláveis (registro normativo)

Os invariantes são os definidos em [`principles.md`](../../foundation/principles.md), aqui
**referenciados** (não reproduzidos) como índice estável. A força normativa e o texto completo
permanecem no registro canônico.

**Princípios (`P1–P18`):**

| Código | Invariante (rótulo de referência) |
| --- | --- |
| `P1` | O LLM não é fonte de verdade |
| `P2` | O backend decide |
| `P3` | Estado persistido governa a continuidade |
| `P4` | Retrieval governa comportamento |
| `P5` | RAG + Policies governam os agentes |
| `P6` | O runtime executa, mas não governa o comportamento |
| `P7` | Agentes são interfaces institucionais |
| `P8` | Observabilidade é obrigatória |
| `P9` | Toda ação operacional deve ser auditável |
| `P10` | Multi-tenant por desenho |
| `P11` | Contexto deve ser modular e recuperável |
| `P12` | Governança deve ser separada da linguagem |
| `P13` | O runtime deve permanecer leve |
| `P14` | Services e Tools executam as operações |
| `P15` | Specifications governam os contratos operacionais |
| `P16` | Harnesses orquestram a cognição operacional |
| `P17` | Estado operacional > memória conversacional |
| `P18` | A linguagem deve ser desacoplada da operação |

**Corolários operacionais (`DO1–DO10`):** `DO1` cognição stateful · `DO2` isolamento contextual ·
`DO3` orquestração de retrieval · `DO4` execução baseada em specification · `DO5` policy enforcement
determinístico · `DO6` provenance tracking · `DO7` behavioral traceability · `DO8` event-driven
operational state · `DO9` verificação como runtime · `DO10` auditoria de entropia.

**Ordem de valores (resolução de conflito):** verdade operacional › segurança › isolamento
multi-tenant › auditabilidade › governança institucional › continuidade de estado › desacoplamento
linguagem/operação › leveza do runtime. Esta ordem — e **não** o número do princípio — governa toda
resolução.

---

## 8. Regras de conformidade

Todo artefato do YZI OS **DEVE**, sem exceção:

1. **Não atribuir verdade ou decisão ao LLM/agente** (`P1`, `P2`, `P18`).
2. **Derivar continuidade do estado persistido**, nunca da conversa ou da memória do modelo
   (`P3`, `P17`, `DO1`, `DO8`).
3. **Manter governança fora da linguagem** — enforcement determinístico, não guidance em prompt
   (`P5`, `P12`, `DO5`).
4. **Manter o runtime leve e sem autoridade comportamental** (`P6`, `P13`).
5. **Produzir observabilidade e trilha de auditoria** — nenhuma execução sem trace
   (`P8`, `P9`, `DO6`, `DO7`, `DO9`).
6. **Respeitar o isolamento multi-tenant** como invariante, não configuração (`P10`, `DO2`).
7. **Executar apenas via service/tool registrado, sob contrato e permissão** (`P14`, `P15`, `DO4`).
8. **Tratar conflitos pela ordem de valores**, jamais pela numeração (§7).

Qualquer artefato que viole uma destas regras é **rejeitado** (§10) ou **escalado** — nunca
silenciosamente aceito.

---

## 9. Critérios de aceite

Esta spec é aceita quando:

1. Referencia o registro canônico [`principles.md`](../../foundation/principles.md) sem
   contradizê-lo nem duplicar seu texto integral, e sem inventar doutrina nova.
2. Enumera os invariantes (`P1–P18`, `DO1–DO10`) e a ordem de valores como contrato verificável.
3. Define um **método de verificação** de conformidade aplicável a qualquer artefato (§14).
4. Fixa a escalada como única alternativa à conformidade (sem violação silenciosa).
5. Não atribui autoridade ao LLM/agente e preserva todos os invariantes que ela própria enuncia.
6. É revisável por humano, em linguagem natural estruturada, sem sintaxe de máquina.

---

## 10. Critérios de rejeição

Esta spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Atribui verdade, decisão ou autoridade comportamental ao LLM, agente, runtime ou prompt.
2. Faz a continuidade depender da conversa ou da memória do modelo.
3. Codifica governança no prompt em vez de enforcement determinístico.
4. Permite execução sem service/tool registrado, sem permissão ou sem trace.
5. Cruza a fronteira multi-tenant ou trata o isolamento como configuração.
6. Resolve conflitos pela numeração de princípio em vez da ordem de valores.
7. Introduz código, API, schema, YAML/JSON, DSL ou contrato machine-readable nesta fase documental.
8. Resume ou duplica o conteúdo dos documentos anteriores em vez de referenciá-lo, ou inventa
   doutrina nova.
9. Reposiciona o YZI OS como chatbot, SaaS genérico, automação simples ou wrapper de LLM.

---

## 11. Relação com as camadas do YZI OS

Este invariante é **transversal** às 9 camadas: Estado, Services, Policies/RAG/XML, Retrieval,
Agents, Tools, Observabilidade, Runtime e LLM. Ele fixa a **distribuição de autoridade** (decrescente
do Estado ao LLM) que as demais specs P0 (`layer-authority-model`, `conflict-resolution`,
`tenant-boundary`) detalham. Nenhuma camada pode operar fora dele.

---

## 12. Relação com specifications futuras

`core-operational-principles` é a **raiz** da cadeia de dependências do
[Specification Map](../../specification-engineering/specification-map.md): **toda** spec futura (das
Ondas P0 a P5) herda estes invariantes e **DEVE** ser verificável contra eles. Uma spec que conflite
com este registro é inválida até que o conflito seja escalado e resolvido pela ordem de valores. Esta
spec não decide o conteúdo das demais — ela define o **limite inviolável** dentro do qual todas
existem. O processo dessa transição controlada está em
[`controlled-execution-plan.md`](../../implementation/controlled-execution-plan.md).

---

## 13. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | O que NUNCA pode violar |
| --- | --- |
| **Skill** | não decide, não governa, não detém verdade; opera como capacidade modular sob spec (`P1`, `P15`) |
| **Subagente** | autoridade limitada e explícita; propõe/verifica, não decide a verdade (`P2`, `P7`) |
| **Harness** | coordena/restringe/verifica/audita, sem autoridade sobre a verdade; produz trace (`P6`, `P8`, `P9`, `P16`) |
| **Service** | decide só dentro de contrato verificável; nenhuma decisão atribuível ao modelo (`P2`, `P15`) |
| **Tool** | executa só via registro, com permissão e trace; o modelo apenas descreve a invocação (`P14`, `P18`) |
| **Código** (Claude Code/Codex) | executor governado sem autoridade; opera sob harness, permissão e verificação (`P1`, `P6`, `DO4`, `DO9`) |

---

## 14. Método de verificação

A conformidade é verificada por **checagem de cada artefato contra o registro de invariantes**:

1. Para cada artefato candidato, percorrer `P1–P18` e `DO1–DO10` e registrar conforme / não-conforme.
2. Ausência de qualquer violação não-justificada ⇒ veredito **conforme**.
3. Qualquer violação ⇒ **escalada registrada** (com identificação do invariante) e bloqueio da
   promoção até decisão humana.
4. A verificação é **independente do agente** que produziu o artefato e **reconstruível** a partir
   do registro de conformidade (`DO7`, `DO9`).

---

## 15. Observabilidade esperada

- Registro de conformidade por artefato verificado (qual invariante, qual veredito).
- Registro de toda escalada (violação identificada, decisão humana, resolução por ordem de valores).
- A trilha de verificação é auditável e read-only para o artefato que ela fiscaliza (`P9`, `DO10`).

---

## 16. Riscos arquiteturais evitados

- **Erro de atribuição** — creditar verdade/decisão ao modelo isolado (`P1`).
- **Deriva doutrinária** — specs/agentes reinterpretando a doutrina sem controle (§2).
- **Colapso de camadas** — fusão de linguagem, operação, estado, governança, execução e
  observabilidade.
- **Governança probabilística** — regra de comportamento no prompt em vez de enforcement (`P12`).
- **Violação silenciosa** — quebra de invariante sem escalada nem registro.
- **Reposicionamento indevido** — tratar o YZI OS como chatbot/SaaS/automação/wrapper.

---

## 17. Fora de escopo

- **Não** redefine, reescreve nem resume os princípios — apenas os fixa como contrato (fonte:
  `principles.md`).
- **Não** cria as demais specs P0 nem qualquer outra spec.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  YAML/JSON ou contrato machine-readable.
- **Não** define o modelo de autoridade por camada em detalhe (isso é `layer-authority-model`) nem o
  procedimento de resolução de conflito em detalhe (isso é `conflict-resolution`).

---

## 18. Proveniência

`[CE]` Context Engineering (Paradoxo do Metadado; confiar na arquitetura) · `[PYR]`
Context→Intent→Specification (constituição/leis/contexto/prompt; contract-first) · `[HE-GOV]`
Harness Engineering / Governança (guidance ≠ enforcement) · `[AHE]` Agentic Harness Engineering
(observabilidade e evolução auditável) · `[HARNESS-RT]` AI Harness Runtime
(`C_sistema = F(C_modelo, C_harness, C_ambiente, T)`; erro de atribuição).

---

## 19. Fronteiras (o que NÃO está aqui)

- **Não** substitui [`principles.md`](../../foundation/principles.md): é a spec que o **opera** como
  contrato verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa o invariante que todas elas herdam.

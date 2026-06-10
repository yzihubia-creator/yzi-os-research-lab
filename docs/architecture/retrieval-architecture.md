# YZI OS — Arquitetura de Retrieval

> Documento de arquitetura. Define o retrieval do YZI OS como mecanismo que **governa o
> comportamento** ao governar o que o agente sabe. Detalha a face de recuperação da camada 3
> da [arquitetura conceitual](conceptual-architecture.md).
>
> Camada: `architecture` · Status: canônico · Versão: v1
> Proveniência: `[CE]` `[PYR]` `[AHE]`

---

## 1. Propósito e escopo

O retrieval é o mecanismo pelo qual o conhecimento relevante é recuperado e montado no contexto
de uma operação. No YZI OS, ele é tratado como **decisão de governança** — porque **o que o
agente recupera determina como ele se comporta**. (`P4`) Este documento define o papel
arquitetural do retrieval; o pipeline detalhado de composição de contexto pertence à camada
`context-engineering`.

Sem implementação: sem motores de busca vetorial, embeddings concretos, índices ou código.

---

## 2. Retrieval governa comportamento

Governar o retrieval **é** governar o comportamento. (`P4`) Quem controla o contexto — políticas,
memória, recuperação de dados, fronteiras de visibilidade — controla o comportamento, o custo e a
conformidade. `[PYR]` Por isso o retrieval **não** é um detalhe de implementação: é parte da
camada de governança, sujeito a política e a proveniência.

A recuperação é **orquestrada por política, não ad hoc** (`DO3`): o que pode ser recuperado, por
quem e em que circunstância é uma decisão governada.

---

## 3. Retrieval como acesso à memória semântica

O retrieval é o acesso governado à **memória semântica** — o conhecimento institucional
estruturado (políticas, documentação, bases de referência), distinto das memórias working,
episódica e procedural. `[PYR]` (Ver [arquitetura de estado](state-architecture.md §5.)

A recuperação é **logística just-in-time**: o que incluir, quando, em que forma, por quanto tempo
e para qual agente/sub-agente. `[PYR]` (`P11`) Bom retrieval não é "tudo o que existe"; é "o
mínimo suficiente para a decisão".

---

## 4. Os critérios de qualidade do retrieval

Todo contexto recuperado deve satisfazer os cinco critérios de qualidade: `[PYR]`

| Critério | No retrieval significa |
| --- | --- |
| **Relevance** | recuperar só o necessário ao passo atual (evita *lost-in-the-middle*) |
| **Sufficiency** | recuperar tudo o necessário para decidir sem adivinhação (anti-alucinação) |
| **Isolation** | recuperar apenas dentro da fronteira de visibilidade do agente/tenant |
| **Economy** | mínimo de tokens e de recomposições, preservando qualidade |
| **Provenance** | cada fragmento recuperado é rastreável à origem |

A violação desses critérios produz **context rot**: envenenamento, distração, confusão,
conflito. `[PYR]` O retrieval governado é a primeira defesa contra a degradação de contexto.

---

## 5. Isolamento no retrieval

O retrieval respeita o isolamento multi-tenant como invariante: a recuperação **nunca** cruza a
fronteira de tenant, e dentro de um tenant respeita a fatia de visibilidade atenuada de cada
agente. `[PYR]` (`P10` `DO2`) Isolamento é, aqui, simultaneamente critério de qualidade
(`Isolation`) e invariante de segurança.

---

## 6. Proveniência do contexto recuperado

Cada fragmento recuperado carrega **proveniência**: de qual fonte veio, quando, com que nível de
confiança. `[PYR]` (`DO6`) Sem isso, é impossível, após uma decisão, determinar **qual** fragmento
a provocou. `[PYR]` A proveniência do retrieval alimenta a auditabilidade da
[observabilidade](observability-architecture.md) e a atribuição de falha.

Quando o contexto é exposto à análise, vale a **divulgação progressiva**: a evidência é
disponibilizada em camadas (raiz → drill-down), economizando custo e melhorando a decisão. `[AHE]`

---

## 7. Defesa contra conteúdo adversário

Como o retrieval traz conteúdo externo ao contexto, ele é um vetor de injeção. A defesa é a mesma
prioridade do pacote de contexto: conteúdo recuperado entra em papéis de **menor** prioridade que
a Authority, de modo que uma instrução injetada não pode legitimamente sobrepor-se à governança;
e o que escapar é capturado pela verificação independente. `[CE]` Fontes recuperadas são tratadas
como **entrada não confiável** até governadas.

---

## 8. Fronteiras desta camada (o que NÃO está aqui)

- **Não** define o pipeline de composição de contexto (write/select/compress/isolate) em
  detalhe — isso é da camada `context-engineering`.
- **Não** define busca vetorial, embeddings, índices ou código.
- **Não** define o conteúdo das policies de recuperação — isso é da camada `governance`.

---

## 9. Conformidade com os princípios da fundação

| Princípio | Como esta arquitetura o instancia |
| --- | --- |
| `P4` retrieval governa comportamento | §2 |
| `P5` RAG + Policies governam agentes | §2, §3 |
| `P11` contexto modular e recuperável | §3 (JIT logistics) |
| `P10`/`DO2` isolamento | §5 |
| `DO3` orquestração de retrieval | §2 |
| `DO6` provenance tracking | §6 |

Resolução de conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

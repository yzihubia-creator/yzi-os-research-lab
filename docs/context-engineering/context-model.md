# YZI OS — Modelo de Contexto

> Camada `context-engineering`. Define o que é o contexto no YZI OS e como ele se estrutura.
> Detalha a face de contexto da [arquitetura conceitual](../architecture/conceptual-architecture.md)
> e da [arquitetura de retrieval](../architecture/retrieval-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[CE]` `[PYR]`

---

## 1. Propósito

Define o **modelo de contexto** do YZI OS: a natureza do contexto, seus papéis e sua função.
As demais peças desta camada detalham ciclo de vida, composição, isolamento, proveniência,
autoridade e governança de retrieval. Sem implementação.

## 2. Contexto é o sistema operacional do agente

O contexto não é "dado de entrada"; é o **ambiente de execução** do agente — seu sistema
operacional. `[PYR]` Como um OS, gerencia memória (o que reter/descartar), aloca recursos (que
dados a quem), isola processos (a saída de um não contamina outro) e oferece interface aos
sistemas externos. É um ambiente ativo, **não um buffer passivo de prompts**. `[PYR]`

Por isso o contexto é uma **representação compilada de um sistema stateful mais rico** — não uma
string. `[PYR]` Ele é derivado do estado (ver [state-architecture](../architecture/state-architecture.md)),
nunca o define. (`P11`)

## 3. Os três déficits que o contexto administra

`[PYR]`
- **Déficit de relevância** — só o necessário ao passo atual é fornecido.
- **Déficit de memória** — o que excede a janela vive fora dela (estado), recuperável.
- **Déficit de orçamento** — cada token custa; a arquitetura de contexto é unidade econômica.

## 4. O pacote de contexto e seus papéis

Toda operação recebe um **pacote de contexto** com papéis e prioridade explícitos: `[CE]`

| Prioridade | Papel | Função |
| --- | --- | --- |
| 1 | **Authority** | concede permissão, define fronteiras e critérios de sucesso — **governa** |
| 2 | **Exemplar** | fornece padrões/exemplos |
| 3 | **Constraint** | especifica limites e requisitos |
| 4 | **Rubric** | define critérios de avaliação |
| 5 | **Metadata** | informação contextual / prompt do agente |

**Paradoxo do Metadado:** o prompt do agente é o elemento de **menor** prioridade; ele *inicia*
a operação, mas a **Authority governa** o resultado. `[CE]` (`P1`) No YZI OS, a Authority
corresponde a estado + governança + specification (ver [authority-model](authority-model.md)).

## 5. Estrutura importa mais que volume

Um pacote com uma Authority bem estruturada supera um pacote volumoso sem Authority. `[CE]` A
variável crítica não é quantidade, mas a presença de um documento governante e papéis
explícitos. Daí a regra: **declarar papéis** antes de acumular arquivos.

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define o pipeline de montagem em detalhe — ver [context-composition](context-composition.md).
- **Não** define decaimento/eviction — ver [context-lifecycle](context-lifecycle.md).
- **Não** define busca vetorial, embeddings ou código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P1` LLM não é fonte de verdade | Paradoxo do Metadado (§4) |
| `P11` contexto modular e recuperável | §2, §3 |
| `P4` retrieval governa comportamento | §2 (contexto = OS) |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

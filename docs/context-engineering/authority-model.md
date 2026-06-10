# YZI OS — Modelo de Autoridade

> Camada `context-engineering`. Define o papel **Authority** do pacote de contexto e como a
> autoridade governa cada operação. Complementa o [context-model](context-model.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[CE]` `[PYR]`

---

## 1. Propósito

Define o **modelo de autoridade** no contexto: o que é a Authority, de onde vem e por que
governa. Sem implementação.

## 2. Authority governa; o prompt inicia

A **Authority** é o papel de **maior prioridade** do pacote de contexto: concede permissão,
define fronteiras e critérios de sucesso. `[CE]` O prompt do agente (Metadata) *inicia* a
operação, mas não a governa — **a Authority governa** (Paradoxo do Metadado). `[CE]` (`P1`)

## 3. A Authority do YZI OS é institucional, não verbal

No YZI OS, a Authority **não** é uma instrução em linguagem natural. Ela é composta por:

- **estado** (a verdade operacional);
- **specifications** (o que a operação deve produzir — a constituição); `[PYR]`
- **policies** (o que é permitido/proibido).

Autoridade **baseada em arquivo/contrato é mais forte que verbal**: produz maior conformidade de
primeira passagem e correções mais localizadas. `[CE]` Por isso a governança institucional
substitui a "autoridade implícita" do operador por autoridade **explícita e versionada**.

## 4. Operator Authority e Referência Mestra

Dois padrões fundam a continuidade da autoridade: `[CE]`

- **Operator Authority** — documento versionado que externaliza padrões e restrições recorrentes,
  incluído em toda operação; elimina uma classe inteira de iteração corretiva.
- **Referência Mestra** — artefato que acumula decisões/restrições ao longo do tempo,
  reintroduzido a cada operação, garantindo continuidade **sem** memória do modelo. (`P3` `P17`)

## 5. Hierarquia de autoridade

Dentro de uma operação: **Authority › Exemplar › Constraint › Rubric › Metadata**. `[CE]` Entre
documentos do sistema: `manifesto › mission/philosophy › principles › demais`. Entre princípios:
a **ordem de valores** (não a numeração). As três hierarquias coexistem sem se confundir.

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define o conteúdo das specifications/policies — camadas `specification-engineering` e
  `governance`.
- **Não** define formato de arquivo nem código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P1` LLM não é fonte de verdade | Authority governa, prompt inicia (§2) |
| `P3`/`P17` estado/continuidade | Referência Mestra (§4) |
| `P15` specifications governam contratos | Authority = estado+spec+policy (§3) |
| `P12` governança separada da linguagem | Autoridade institucional, não verbal (§3) |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

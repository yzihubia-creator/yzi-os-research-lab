# YZI OS — Specifications Operacionais

> Camada `specification-engineering`. Define o que é uma specification operacional — a descrição
> do que uma classe de operação deve produzir. Deriva da [filosofia de
> specification](specification-philosophy.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[CE]` `[HARNESS-RT]`

---

## 1. Propósito

Define a **specification operacional**: o contrato que governa o resultado de uma **classe** de
operações (não de uma operação isolada). Sem implementação.

## 2. O que é (e o que não é)

Uma specification operacional descreve, de forma **estruturada, coerente e versionada**, o que a
saída de uma dada classe de tarefas deve ser — em normas de qualidade **mensuráveis**. `[PYR]` Não
é o prompt de um agente específico nem a intenção codificada para um agente específico: opera sobre
**classes** de operação. `[PYR]`

## 3. Contrato de saída e critérios

Toda specification operacional declara:
- o **objetivo** da classe de operação e seus **requisitos**;
- o **contrato de saída** — o que deve ser produzido, em que forma, sob quais critérios de
  aceitação;
- a **rubric** — os critérios de avaliação da qualidade (papel Rubric do pacote de contexto). `[CE]`

A conclusão de uma operação é vinculada a **evidência determinística** contra esse contrato, não a
asserção. `[HARNESS-RT]` (`DO9`)

## 4. Verificação como parte da specification

Pela regra contract-first, a specification define **como o resultado será verificado** antes de
definir o que produzir. `[PYR]` A disciplina de verificação (reproduzir → atribuir → corrigir →
verificar → reportar) opera contra a specification. `[HARNESS-RT]`

## 5. Coerência e versionamento

Specifications operacionais são **versionadas** e mantidas coerentes entre si e entre
departamentos. `[PYR]` Mudança de estratégia institucional propaga-se por nova versão de
specification, não por ajuste verbal — preservando a continuidade governada.

## 6. Reuso

Uma specification validada torna-se **modelo reutilizável** para operações futuras da mesma
classe, com qualidade crescente conforme acumula refinamentos auditados. `[CE]`

## 7. Fronteiras (o que NÃO está aqui)

- **Não** define comportamento do agente — ver [behavioral-contracts](behavioral-contracts.md).
- **Não** define execução — ver [execution-contracts](execution-contracts.md).
- **Não** define schema, formato concreto ou código.

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P15` specifications governam contratos | §2, §3 |
| `DO4` execução baseada em specification | §3, §4 |
| `DO9` verificação como runtime | §4 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

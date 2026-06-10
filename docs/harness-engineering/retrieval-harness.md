# YZI OS — Retrieval Harness

> Camada `harness-engineering`. Detalha o harness que coordena a recuperação e a montagem de
> contexto. Deriva da [filosofia de harness](harness-philosophy.md), da [arquitetura de
> retrieval](../architecture/retrieval-architecture.md) e da [governança de
> retrieval](../context-engineering/retrieval-governance.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[CE]` `[AHE]`

---

## 1. Propósito

Detalha o **retrieval harness**: a coordenação da operação **select** e da composição do contexto
de trabalho. Sem implementação.

## 2. Coordena a face contextual da governança

O retrieval harness opera a **face de recuperação/contextualização** da governança comportamental
— separada da camada que define o permitido (governance). `[PYR]` (`P4`) Ele coordena a
recuperação **orquestrada por política**, não ad hoc. (`DO3`)

## 3. Aplica os critérios de qualidade

A cada montagem, o harness impõe **relevância, suficiência, isolamento, economia, proveniência**.
`[PYR]` Recupera o **mínimo suficiente** (evita *lost-in-the-middle* e alucinação) e compõe via
write/select/compress/isolate. `[PYR]` (`P11`)

## 4. Isolamento e proveniência na recuperação

Nunca cruza fronteira de tenant; respeita a fatia atenuada do agente. `[PYR]` (`DO2`) Cada
fragmento recuperado carrega proveniência (origem/momento/confiança) para auditoria e atribuição.
`[PYR]` (`DO6`) Expõe evidência por **divulgação progressiva**. `[AHE]`

## 5. Defesa contra injeção

Fontes recuperadas entram em prioridade inferior à Authority e são tratadas como **não confiáveis**
até governadas; o que escapar é capturado pela verificação independente. `[CE]`

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define o que é permitido — ver [governance-harness](governance-harness.md).
- **Não** define busca vetorial, índices, embeddings ou código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P4` retrieval governa comportamento | §2 |
| `P11` contexto modular e recuperável | §3 |
| `DO3` orquestração de retrieval | §2 |
| `DO2`/`DO6` isolamento/proveniência | §4 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

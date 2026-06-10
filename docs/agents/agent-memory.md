# YZI OS — Memória do Agente

> Camada `agents`. Define como o agente lida com memória — administrada como ambiente, não confiada
> ao modelo. Complementa a [arquitetura de estado](../architecture/state-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[CE]`

---

## 1. Propósito

Define a memória do agente: as quatro formas, sua administração e sua relação com o estado. Sem
implementação.

## 2. Memória é ambiente, não campo

A memória do agente é um **ambiente que se administra**, não um campo que se preenche. `[PYR]` O
agente não "lembra"; o estado persiste e o contexto é montado a cada operação a partir dele. (`P3`
`P17`)

## 3. As quatro formas

`[PYR]`
- **Working** — a janela atual; efêmera; montada pelo runtime.
- **Episodic** — log de interações/decisões; no estado persistido.
- **Semantic** — conhecimento institucional; recuperado via RAG (retrieval governado).
- **Procedural** — capacidade governada por specification.

O agente não confunde as quatro: cada uma tem custo, isolamento e ciclo de vida próprios. `[PYR]`

## 4. Continuidade sem memória do modelo

A continuidade do agente vem do **estado** e da **Referência Mestra**, reintroduzida a cada operação
— nunca da "memória" do modelo, que é opaca, não-portável e não-administrável como controle. `[CE]`
`[PYR]` (`P17`) A conversa é projeção do estado, não fonte de verdade.

## 5. Isolamento e proveniência

A memória do agente é isolada por tenant e por fatia de visibilidade (atenuação de privilégio); cada
fragmento recuperado carrega proveniência. `[PYR]` (`P10` `DO2` `DO6`)

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define persistência/schema — ver [state-architecture](../architecture/state-architecture.md).
- **Não** define o pipeline de contexto — ver [context-engineering/](../context-engineering/context-lifecycle.md).
- **Não** define vector store ou código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P3`/`P17` estado governa continuidade | §2, §4 |
| `DO1` cognição stateful | §3 |
| `P10`/`DO2` isolamento | §5 |
| `DO6` provenance tracking | §5 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

# YZI OS — Gestão de Estado pelo Runtime

> Camada `runtime`. Detalha como o runtime lê e escreve estado **sem** ser a fonte de verdade.
> Complementa a [arquitetura de estado](../architecture/state-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[HARNESS-RT]` `[CE]`

---

## 1. Propósito

Define a relação do runtime com o estado: ele **coordena o acesso**, mas não detém a verdade. Sem
implementação.

## 2. O runtime acessa, o estado é a verdade

O runtime lê o estado para montar contexto e escreve eventos como resultado — mas a **verdade
operacional permanece no estado**, não no runtime. (`P1` `P3`) A working memory que o runtime
monta é uma **projeção efêmera** do estado, descartada ao fim do episódio. `[PYR]`

## 3. Escrita por evento

O runtime não muta estado implicitamente: registra **eventos auditáveis**. (`DO8`) Cada escrita
carrega proveniência (origem/momento/confiança) para auditoria e atribuição. `[PYR]` (`DO6`)

## 4. As quatro memórias sob coordenação

O runtime coordena o acesso às quatro formas de memória, sem confundi-las: working (monta),
episódica e semântica (lê do estado/RAG), procedural (governada por specification). `[PYR]`
(Ver [agent-memory](../agents/agent-memory.md) e [state-architecture §5](../architecture/state-architecture.md).)

## 5. Continuidade sem memória do modelo

O runtime restabelece estado a partir do persistido e da Referência Mestra — **nunca** confia na
"memória" do modelo. `[CE]` (`P17`) A conversa é projeção do estado, não fonte; o runtime nunca a
trata como verdade.

## 6. Isolamento no acesso

Todo acesso a estado respeita a fronteira de **tenant** e a fatia atenuada do agente. `[PYR]`
(`P10` `DO2`) O runtime não pode montar contexto que cruze tenants.

## 7. Fronteiras (o que NÃO está aqui)

- **Não** define o modelo de persistência/schema — proibido; ver [state-architecture](../architecture/state-architecture.md).
- **Não** define código nem store concreto.

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P1` LLM não é fonte de verdade | §2 |
| `P17` estado > memória conversacional | §2, §5 |
| `DO8` event-driven state | §3 |
| `DO6` provenance tracking | §3 |
| `P10`/`DO2` isolamento | §6 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

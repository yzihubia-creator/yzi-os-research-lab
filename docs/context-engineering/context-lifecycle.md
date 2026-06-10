# YZI OS — Ciclo de Vida do Contexto

> Camada `context-engineering`. Define como o contexto nasce, é usado, decai e é descartado.
> Complementa o [context-model](context-model.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[CE]` `[PYR]` `[AHE]`

---

## 1. Propósito

Define o **ciclo de vida** do contexto como logística just-in-time, não como buffer permanente.
Sem implementação.

## 2. Logística just-in-time

A engenharia de contexto é **logística de conhecimento JIT**: o que incluir, **quando** fornecer,
**em que forma**, por **quanto tempo** e para **qual** agente/sub-agente. `[PYR]` (`P11`) O
contexto é montado por operação e descartado, não mantido indefinidamente.

## 3. O pipeline de três estágios

A montagem segue o estágio: `[PYR]`

```
armazenamento (estado/RAG) → pipeline de transformações → contexto de trabalho compilado
      (durável)                (compressão/filtragem/enriquecimento)        (o que o agente vê)
```

O **contexto de trabalho** (working memory) é efêmero — vive a operação; as fontes (episódica,
semântica) são estado durável. Ver [state-architecture §5](../architecture/state-architecture.md).

## 4. As quatro operações de ciclo de vida

`[PYR]`
- **write** — registrar novo conhecimento no estado.
- **select** — recuperar o relevante (retrieval governado).
- **compress** — condensar histórico sem perder significado.
- **isolate** — restringir visibilidade entre agentes/tenants.

Estas operações, arranjadas em ciclo, é o que transforma "lista de operações" em engenharia: a
cada passo o agente recebe um contexto recém-montado. `[PYR]`

## 5. Decaimento e eviction

O contexto tem **tempo de vida**: a utilidade de um fragmento decai. `[CE]` A eviction (o que
descartar da working memory) é decisão de desenho, não efeito colateral. O acúmulo não-governado
produz **context rot** — envenenamento, distração, confusão, conflito. `[PYR]` O ciclo de vida é
a primeira defesa contra a degradação.

## 6. Divulgação progressiva

Para análise e consumo, o contexto/evidência é exposto em camadas — raiz → drill-down —
economizando custo e melhorando a decisão (**progressive disclosure**). `[AHE]`

## 7. Fronteiras (o que NÃO está aqui)

- **Não** define a estrutura do pacote — ver [context-model](context-model.md).
- **Não** define a política de retrieval — ver [retrieval-governance](retrieval-governance.md).
- **Não** define persistência — ver [state-architecture](../architecture/state-architecture.md).

## 8. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P11` contexto modular e recuperável | §2, §3, §4 |
| `DO3` orquestração de retrieval | §4 (select governado) |
| `DO1` cognição stateful | §3 (working efêmero, estado durável) |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

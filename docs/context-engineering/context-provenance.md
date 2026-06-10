# YZI OS — Proveniência de Contexto

> Camada `context-engineering`. Define a proveniência de cada elemento de contexto. Alimenta a
> [arquitetura de observabilidade](../architecture/observability-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[CE]` `[PYR]`

---

## 1. Propósito

Define a **proveniência** como propriedade obrigatória de todo fragmento de contexto. Sem
implementação.

## 2. Todo fragmento é rastreável à origem

Cada elemento de contexto carrega **proveniência**: de qual sistema veio, **quando**, e com que
**nível de confiança**. `[PYR]` (`DO6`) Sem proveniência, não há auditoria de decisão, depuração
de erro nem conformidade. `[PYR]`

## 3. Proveniência permite atribuição

Sem proveniência, é impossível, após uma decisão, determinar **qual** fragmento a provocou. `[PYR]`
A proveniência é o que torna a atribuição de falha possível (ver
[observability-architecture §5](../architecture/observability-architecture.md)) e o que liga cada
requisito verificado à sua evidência.

## 4. Responsabilidade transitiva por atestação

Quando um agente passa contexto a outro, o contexto pode distorcer-se. A defesa é a
**responsabilidade transitiva via atestação**: numa cadeia A → B → C, cada elo assina um relatório
verificável sobre o trabalho do próximo, de modo que todo elemento seja rastreável à origem por uma
cadeia de assinaturas. `[PYR]` Proveniência não é só etiqueta de origem — é cadeia de
responsabilidade.

## 5. Fontes como entrada não confiável

Conteúdo recuperado/externo é tratado como **não confiável** até governado: revisado quanto a
instruções anômalas, separado por convenção de delimitação, e mantido em prioridade inferior à
Authority. `[CE]` A proveniência registra o nível de confiança de cada fonte para essa avaliação.

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define o registro/trilha de auditoria em si — ver [observability-architecture](../architecture/observability-architecture.md).
- **Não** define formatos de assinatura nem código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P9` ação auditável | §2, §3 |
| `DO6` provenance tracking | §2, §4 |
| `P8` observabilidade obrigatória | Alimenta atribuição (§3) |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

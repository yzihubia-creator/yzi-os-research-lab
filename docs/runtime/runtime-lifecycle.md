# YZI OS — Ciclo de Vida do Runtime

> Camada `runtime`. Detalha o ciclo de vida operacional do runtime — por operação e por sessão.
> Complementa a [filosofia de runtime](runtime-philosophy.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[HARNESS-RT]` `[CE]` `[PYR]`

---

## 1. Propósito

Define como o runtime conduz uma operação do início ao fechamento, e como preserva continuidade
entre sessões. Sem implementação.

## 2. Ciclo por operação (episódio)

A unidade de vida do runtime é o **episódio**. `[HARNESS-RT]` Por operação, o runtime:

1. **inicia** o episódio (tenant, agente/operador, specification aplicável);
2. **monta** o pacote de contexto a partir do estado e do retrieval governado;
3. **roteia** à governança (enforcement pré) e aos services;
4. **orquestra** a execução por tools sob permissão;
5. **persiste** o resultado como evento;
6. **aciona** a verificação;
7. **fecha** o episódio com o pacote de evidência.

É um **ciclo governado**, não um workflow fixo: admite iteração e retrocesso (reproduzir →
atribuir → corrigir → verificar → reportar), e o enforcement pode interromper a qualquer ponto.

## 3. Continuidade entre sessões

O runtime **não** retém a verdade entre sessões — o **estado** o faz. (`P3` `P17`) A continuidade
é restabelecida montando o contexto a partir do estado e da **Referência Mestra**, sem depender da
memória do modelo. `[CE]` Encerrar a sessão ou trocar o modelo não interrompe a continuidade.

## 4. Início e encerramento limpos

Cada episódio inicia de um recorte de estado bem definido e encerra com evidência preservada. A
working memory é **efêmera** (vive o episódio); o que persiste vira estado/evento. `[PYR]` Isso
mantém a atribuição limpa e a trilha de auditoria orgânica. `[CE]`

## 5. Fronteiras (o que NÃO está aqui)

- **Não** define a semântica de decisão — ver [operational-architecture](../architecture/operational-architecture.md).
- **Não** define persistência — ver [state-architecture](../architecture/state-architecture.md).
- **Não** define código.

## 6. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P3`/`P17` estado governa continuidade | §3 |
| `P16` harnesses orquestram | §2 |
| `P9` ação auditável | §2, §4 |
| `DO9` verificação como runtime | §2 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

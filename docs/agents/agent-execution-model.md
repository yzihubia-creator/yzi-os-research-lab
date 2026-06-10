# YZI OS — Modelo de Execução do Agente

> Camada `agents`. Define como um agente opera dentro do ciclo governado — propõe, não decide nem
> executa. Complementa o [modelo de execução do runtime](../runtime/runtime-execution-model.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]` `[CE]` `[HARNESS-RT]`

---

## 1. Propósito

Define o modelo de execução do agente: seu papel no ciclo governado e seus limites. Sem
implementação.

## 2. O agente propõe; o sistema dispõe

O agente recebe intenção e produz uma **operação proposta**. A decisão é dos services, a execução é
das tools, a verdade é do estado. (`P2` `P7` `P14`) A proposta do agente entra como **Metadata** —
prioridade mínima; a Authority governa. `[CE]` (`P1`)

## 3. Dentro do ciclo governado

O agente opera dentro do ciclo: sua proposta passa por enforcement pré, decisão dos services,
execução por tools sob permissão, persistência e verificação. O agente **não** salta etapas nem
executa por conta própria. (`P6`)

## 4. Delegação com atenuação de privilégio

Quando delega a um sub-agente, transfere autoridade e responsabilidade (não o conjunto de direitos),
estreitando permissões a cada elo; só delega o **verificável** (contract-first). `[PYR]` (`DO2`)

## 5. Conclusão por evidência

A conclusão de uma operação do agente é **objeto evidenciário**, não asserção: requisitos mapeados a
verificação determinística, com atribuição antes de recuperação. `[HARNESS-RT]` (`DO9`)

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define a coordenação — ver [runtime/](../runtime/runtime-execution-model.md).
- **Não** define a decisão — ver [service-architecture](../architecture/service-architecture.md).
- **Não** define framework ou código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P7` agentes são interfaces | §2 |
| `P18` linguagem desacoplada da operação | §2, §3 |
| `P2`/`P14` backend decide / tools executam | §2 |
| `DO9` verificação como runtime | §5 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md).

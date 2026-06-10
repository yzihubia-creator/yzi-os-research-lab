# YZI OS — Governança Multi-Tenant

> Camada `governance`. Detalha como a governança se aplica e se isola por tenant. Complementa a
> [arquitetura multi-tenant](../architecture/tenant-architecture.md) e os [contratos de
> tenant](../specification-engineering/tenant-contracts.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]`

---

## 1. Propósito

Define o modelo de governança por tenant: isolamento como invariante de governança e
verticalização governada. Sem implementação.

## 2. Isolamento é invariante de governança

A governança garante que policies, specifications, retrieval, estado e memória de um tenant sejam
**inacessíveis** a partir de outro. `[PYR]` (`P10`) O isolamento é a 3ª posição da ordem de valores
— acima de auditabilidade, abaixo de segurança. Nenhuma regra de governança pode atravessar a
fronteira de tenant.

## 3. Governança por tenant, núcleo único

Cada tenant governa-se por seus próprios contratos de política e comportamentais, **declarados**
dentro de sua partição, sobre um núcleo de governança **único e estável**. A verticalização é
declarada, não bifurcada.

## 4. Atenuação de privilégio intra-tenant

Dentro do tenant, a delegação obedece à atenuação de privilégio: cada sub-agente recebe apenas a
fatia necessária de direitos. `[PYR]` (`DO2`) É a contraparte intra-tenant do isolamento
inter-tenant.

## 5. Soberania de dados governada

As restrições regulatórias de residência são governadas por tenant e tornam-se restrições sobre o
que pode ser retido e onde — sempre dentro da fronteira de tenant. `[PYR]`

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define a partição arquitetural — ver [tenant-architecture](../architecture/tenant-architecture.md).
- **Não** define o conteúdo dos contratos — ver [tenant-contracts](../specification-engineering/tenant-contracts.md).
- **Não** define namespaces, RLS ou código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P10` multi-tenant por desenho | §2, §3 |
| `DO2` isolamento contextual | §2, §4 |
| `P5` policies governam agentes | §3 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md) (isolamento
multi-tenant é a 3ª posição).

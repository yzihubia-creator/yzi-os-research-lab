# YZI OS — Contratos de Tenant

> Camada `specification-engineering`. Define os contratos que especializam e isolam um tenant.
> Deriva da [filosofia de specification](specification-philosophy.md) e da [arquitetura
> multi-tenant](../architecture/tenant-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]`

---

## 1. Propósito

Define o **contrato de tenant**: como uma instituição especializa o YZI OS dentro de sua partição,
sem alterar o núcleo. Sem implementação.

## 2. Verticalização por contrato, não por bifurcação

A verticalização de um domínio expressa-se por **specifications, policies, retrieval e estado
próprios do tenant** — declarados em contrato, **sem** alterar o núcleo de governança, runtime ou
estado. (`P10`) Verticalizar é **declarar** a especialização, não bifurcar o sistema.

## 3. O contrato de tenant define a partição

O contrato declara, para o tenant:
- as **specifications operacionais e comportamentais** aplicáveis;
- os **contratos de política** vigentes;
- o **corpus de retrieval** e suas fronteiras de visibilidade;
- as fronteiras de **isolamento** de estado e memória.

A memória de um tenant é **inacessível** a partir de outro — invariante de engenharia, não
configuração. `[PYR]` (`DO2`)

## 4. Residência e soberania de dados

O contrato de tenant fixa o **regime de residência** (nuvem, on-premise, híbrido) como decisão de
controle e conformidade, e as restrições regulatórias de residência tornam-se restrições
arquiteturais sobre o que pode ser retido e onde — sempre **dentro** da fronteira de tenant. `[PYR]`
(Ver [state-architecture §9](../architecture/state-architecture.md).)

## 5. Núcleo estável, especialização declarada

O núcleo do YZI OS é único e estável; o contrato de tenant é a superfície onde a instituição
configura sua constituição (specifications), suas regras (policies) e seu conhecimento (retrieval).
Isso preserva coerência entre tenants e governabilidade em escala. `[PYR]`

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define o particionamento técnico — ver [tenant-architecture](../architecture/tenant-architecture.md).
- **Não** define namespaces, RLS, schema ou código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P10` multi-tenant por desenho | §2, §3 |
| `DO2` isolamento contextual | §3 |
| `P15` specifications governam contratos | §2, §3 |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md) (isolamento
multi-tenant é a 3ª posição).

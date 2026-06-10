# YZI OS — Isolamento de Contexto

> Camada `context-engineering`. Define o isolamento contextual entre agentes, sub-agentes e
> tenants. Complementa a [arquitetura multi-tenant](../architecture/tenant-architecture.md).
>
> Status: canônico · Versão: v1 · Proveniência: `[PYR]`

---

## 1. Propósito

Define o **isolamento** como invariante de engenharia do contexto. Sem implementação.

## 2. Cada agente vê apenas o seu contexto

Em sistemas multi-agente, **cada agente/papel vê apenas o seu próprio contexto**; vazamento entre
papéis é problema de controlabilidade **e** de segurança. `[PYR]` (`P10` `DO2`) O isolamento é
**invariante de engenharia**, não recomendação. `[PYR]`

## 3. Atenuação de privilégio na delegação

Na delegação, um agente transfere apenas a **fatia estritamente necessária** de seus direitos a
um sub-agente, e **cada elo da cadeia estreita** as permissões (privilege attenuation). `[PYR]`
Tecnicamente, isso se expressa por autorizações limitadas que se estreitam a cada nível de
delegação. A delegação transfere autoridade e responsabilidade — não o conjunto completo de
direitos.

## 4. Contaminação cruzada e isolamento entre passos

Sem isolamento, a saída de uma tool ou sub-agente **contamina** o contexto dos passos seguintes
(dados irrelevantes carregados adiante). `[PYR]` O coordenador não precisa de resultados brutos —
precisa de um veredito e uma confiança; o isolamento filtra entre sub-agentes para que só o
essencial atravesse. `[PYR]`

## 5. Isolamento como propriedade de segurança

O isolamento previne explorações: agentes com acesso indevido a artefatos de avaliação podem
explorá-los em vez de resolver a tarefa (reward hacking); remover esses artefatos do perímetro de
visibilidade resolve o problema. `[PYR]` Isolamento é, portanto, simultaneamente qualidade de
contexto e controle de segurança.

## 6. Fronteiras (o que NÃO está aqui)

- **Não** define a partição multi-tenant arquitetural — ver [tenant-architecture](../architecture/tenant-architecture.md).
- **Não** define mecanismos técnicos de autorização nem código.

## 7. Conformidade

| Princípio | Instanciação |
| --- | --- |
| `P10` multi-tenant por desenho | §2 |
| `DO2` isolamento contextual | §2, §3, §4 |
| `P9` ação auditável | Isolamento preserva atribuição |

Conflitos: **ordem de valores** de [`principles.md`](../foundation/principles.md) (isolamento
multi-tenant é a 3ª posição).

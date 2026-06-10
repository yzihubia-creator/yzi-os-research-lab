# YZI OS — Arquitetura Multi-Tenant

> Documento de arquitetura. Define a multi-tenancy do YZI OS como **partição transversal a
> todas as camadas** e invariante de engenharia. Detalha a dimensão multi-tenant da
> [arquitetura conceitual](conceptual-architecture.md).
>
> Camada: `architecture` · Status: canônico · Versão: v1
> Proveniência: `[PYR]`

---

## 1. Propósito e escopo

A multi-tenancy não é um recurso adicional; é uma **premissa arquitetural** (`P10`). Este
documento define o isolamento entre instituições como invariante que atravessa estado,
contexto, retrieval, memória e políticas.

Sem implementação: descrevemos o modelo de tenancy, não estratégias de particionamento de
banco, namespaces técnicos ou infraestrutura de deploy.

---

## 2. Tenancy como partição transversal

A multi-tenancy **não é uma camada** — é uma partição que **atravessa todas as camadas**. `[PYR]`
Cada camada da [arquitetura conceitual](conceptual-architecture.md) é particionada por tenant:

| Camada | Partição por tenant |
| --- | --- |
| State | estado, histórico e eventos isolados por tenant |
| Governance | policies e contratos próprios do tenant |
| Retrieval | corpus semântico e fronteiras de visibilidade do tenant |
| Memory | memória episódica e semântica isoladas |
| Agents | agentes operando no perímetro do tenant |

O núcleo de governança é **estável e compartilhado**; o que é específico do tenant é **declarado**,
não modificado no núcleo.

---

## 3. O isolamento é um invariante de engenharia

Em sistemas multi-agente e multi-tenant, cada agente/papel vê **apenas o seu próprio
contexto**; vazamento entre papéis é, simultaneamente, problema de controlabilidade e de
segurança. `[PYR]` O isolamento de memória é **arquitetural**: a memória de um tenant é
**inacessível** a partir de outro. `[PYR]`

Por isso, nenhuma operação, retrieval ou montagem de contexto pode atravessar a fronteira de
tenant. O isolamento é a 3ª posição da ordem de valores de resolução de conflitos — abaixo de
verdade operacional e segurança, acima de auditabilidade. (Ver
[`principles.md`](../foundation/principles.md).)

---

## 4. Atenuação de privilégio na delegação

Dentro de um tenant, a delegação entre agentes obedece à **atenuação de privilégio**: um agente
transfere apenas a **fatia estritamente necessária** de seus direitos a um sub-agente, e cada elo
da cadeia **estreita** as permissões. `[PYR]` (`DO2`)

Esta é a contraparte intra-tenant do isolamento inter-tenant: assim como tenants não se veem,
sub-agentes só veem a fatia de contexto e direitos necessária à sua sub-operação. Delegar
transfere autoridade e responsabilidade — não o conjunto completo de direitos. `[PYR]`

---

## 5. Verticalização

A **verticalização** de um domínio institucional (financeiro, jurídico, saúde, etc.) expressa-se
por **specifications, policies, retrieval e estado próprios do tenant** — **sem** alterar o
núcleo de governança, runtime ou estado.

Verticalizar, no YZI OS, é **declarar** a especialização nas camadas governadas, não **bifurcar**
o sistema. O núcleo permanece único; a instituição configura sua constituição (specifications),
suas regras (policies) e seu conhecimento (retrieval) dentro de sua partição.

---

## 6. Residência e soberania de dados

A residência do estado de um tenant (nuvem, on-premise, híbrido) é uma decisão de **controle e
conformidade**, não de desempenho. `[PYR]` Restrições regulatórias de residência tornam-se
restrições arquiteturais sobre **o que pode ser retido e onde** — e essas restrições são sempre
aplicadas **dentro** da fronteira de tenant. O detalhamento conceitual está na [arquitetura de
estado](state-architecture.md §9); aqui registra-se que a soberania de dados é uma propriedade
por-tenant.

---

## 7. Fronteiras desta camada (o que NÃO está aqui)

- **Não** define particionamento técnico, namespaces, RLS ou estratégia de banco.
- **Não** define o conteúdo das specifications/policies do tenant — camadas
  `specification-engineering` e `governance`.
- **Não** define código, schema ou deploy.

---

## 8. Conformidade com os princípios da fundação

| Princípio | Como esta arquitetura o instancia |
| --- | --- |
| `P10` multi-tenant por desenho | Partição transversal (§2); invariante (§3) |
| `DO2` isolamento contextual | §3, §4 (atenuação de privilégio) |
| `P9` ação auditável | Isolamento preserva atribuição por tenant |

Resolução de conflitos: **ordem de valores** — isolamento multi-tenant é a 3ª posição, sustentada
diretamente por esta camada.

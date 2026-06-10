# YZI OS — Arquitetura Conceitual

> Documento de arquitetura (espinha dorsal). Define o modelo conceitual do YZI OS: suas
> camadas, os papéis de cada uma e como se relacionam. Deriva da
> [`foundation/`](../foundation/manifesto.md) e é vinculante para os demais documentos de
> arquitetura.
>
> Camada: `architecture` · Status: canônico · Versão: v1
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]` (ver [`terminology.md`](../foundation/terminology.md))

---

## 1. Propósito e escopo

Este documento descreve **o que o YZI OS é como sistema**: as partes que o compõem, a
responsabilidade de cada parte e as relações entre elas. É a espinha dorsal conceitual da
qual a [arquitetura operacional](operational-architecture.md), a [arquitetura de
runtime](runtime-architecture.md) e a [arquitetura de estado](state-architecture.md) são
detalhamentos.

Este documento **não** descreve implementação. Não há código, API, schema, microservice nem
topologia de deploy aqui. A arquitetura conceitual é o produto desta camada.

---

## 2. O frame organizador: capacidade é propriedade do sistema

O YZI OS organiza-se em torno de uma única equação conceitual: `[HARNESS-RT]`

> **C_sistema = F( C_modelo , C_harness , C_ambiente , T )**

A capacidade operacional do sistema é uma **propriedade emergente** da composição
`modelo–harness–ambiente` sobre uma distribuição de tarefas `T`, e **não** uma propriedade do
modelo isolado. `[HARNESS-RT]` (`P1`)

- `C_modelo` — a capacidade latente do LLM (compreensão, raciocínio, geração).
- `C_harness` — o substrato de runtime que media observação, ação, feedback e conclusão.
- `C_ambiente` — o que o ambiente institucional expõe (estado, services, tools, dados).
- `T` — as classes de operação que a instituição delega.

Toda a arquitetura existe para **desenhar deliberadamente `C_harness` e `C_ambiente`**, de modo
que a capacidade latente do modelo se converta em **comportamento institucional auditável**.

---

## 3. As camadas conceituais

O sistema não é centrado no modelo. A autoridade distribui-se por camadas, com o LLM na
posição de menor autoridade operacional. Cada camada tem uma responsabilidade conceitual
única.

| # | Camada | Responsabilidade conceitual | Princípios |
| --- | --- | --- | --- |
| 1 | **State** (Supabase / persistência) | Verdade operacional: estado, continuidade, histórico | `P3` `P17` `DO1` `DO8` |
| 2 | **Services** | Lógica institucional, regras, validações; **decide** | `P2` `P14` |
| 3 | **Governance** (RAG / XML / Policies) | Governança comportamental e recuperação contextual | `P4` `P5` `P12` `DO3` `DO5` |
| 4 | **Agents** | Interface linguística institucional | `P7` |
| 5 | **Tools** | Execução operacional controlada | `P14` |
| 6 | **Observability** | Auditoria, rastreabilidade, análise operacional | `P8` `P9` `DO6` `DO7` |
| 7 | **Runtime (leve)** | Coordenação: montagem de contexto, roteamento, orquestração | `P6` `P13` `P16` |
| 8 | **LLM** | Motor linguístico probabilístico, **sem autoridade operacional** | `P1` `P18` |

A leitura essencial da tabela: **as camadas 1–3 e 6 governam; a camada 7 coordena; as camadas
4–5 e 8 não detêm autoridade comportamental**. O agente e o LLM propõem em linguagem; os
services decidem; as tools executam; o estado registra; a governança restringe; a
observabilidade comprova.

---

## 4. Os dois eixos de separação

A arquitetura conceitual é estruturada por dois eixos ortogonais de separação. Compreendê-los
é compreender o sistema.

### 4.1 Eixo linguagem ↔ operação

A **camada linguística** (Agents, LLM) é desacoplada da **camada operacional** (Services,
Tools, State). `[CE]` (`P18`) A linguagem **propõe**; a operação **dispõe**.

O LLM é um "cérebro sem mãos": descreve invocações, não as executa; a execução, o tratamento
do resultado e a decisão de próximo passo pertencem ao sistema externo. `[PYR]` Esta fronteira
é a manifestação arquitetural da separação de preocupações entre compreender, planejar,
executar e avaliar. `[CE]`

### 4.2 Eixo guidance ↔ enforcement

A governança comportamental existe em dois regimes: `[HE-GOV]`

- **Guidance** (pré-geração, na camada linguística) — instruções, exemplos, contexto.
  **Probabilístico**: aumenta a probabilidade de conformidade, não a garante.
- **Enforcement** (pós-geração, nas camadas de governança/services) — políticas, contratos,
  gates verificáveis. **Determinístico**: veredito pass/fail independente de qual agente
  produziu a operação (**independência de agente**). `[HE-GOV]`

A combinação dos dois eixos produz o invariante central: **a autoridade comportamental nunca
reside na linguagem nem no modelo**. Reside no estado, no retrieval governado e nas policies.

### 4.3 Separação de preocupações entre as camadas

Além dos dois eixos, a arquitetura mantém **seis preocupações distintas e não-colapsáveis**, cada
uma com sua própria responsabilidade e modo de falha. Colapsá-las — fazer o modelo decidir, ou o
runtime governar, ou a conversa virar verdade — é precisamente o erro que o YZI OS recusa. `[CE]`

| Preocupação | Camada(s) responsável(is) | Nunca confundir com |
| --- | --- | --- |
| **Linguagem** | Agents, LLM | operação |
| **Operação** | Services, Tools | linguagem |
| **Estado** (verdade) | State | memória conversacional |
| **Governança** | RAG / XML / Policies | guidance no prompt |
| **Execução** | Tools | decisão |
| **Observabilidade** | Observability | execução |

Esta separação é a leitura horizontal da tabela de camadas (§3): cada preocupação é isolável,
testável e substituível sem romper as demais. (`P18` e princípios correlatos)

---

## 5. O pacote de contexto como interface conceitual

Entre a camada linguística e as camadas de governança/estado, a unidade de troca não é o
prompt — é o **pacote de contexto**: o conjunto de informação montado para cada operação, com
papéis e prioridade explícitos. `[CE]`

Os papéis, em prioridade decrescente, são **Authority › Exemplar › Constraint › Rubric ›
Metadata**, e o prompt do agente ocupa o nível de **Metadata** — o de menor autoridade (o
"Paradoxo do Metadado"). `[CE]` Conceitualmente: o pacote de contexto é a forma pela qual a
governança (Authority) sobrepõe-se à linguagem (Metadata) **dentro de cada operação**, não
apenas entre camadas.

O contexto é, ele próprio, uma **representação compilada de um sistema stateful mais rico** —
não uma string — montada por um pipeline de seleção, compressão, filtragem e isolamento. `[PYR]`
(`P11`) Seu detalhamento pertence à camada `context-engineering`.

---

## 6. Fluxo conceitual de uma operação

Em alto nível, toda operação institucional percorre o seguinte ciclo conceitual. (A semântica
detalhada está na [arquitetura operacional](operational-architecture.md).)

1. **Intenção** entra pela camada de **Agents** (linguagem).
2. O **Runtime** monta o **pacote de contexto** a partir do **State** e do **Governance**
   (retrieval), respeitando isolamento de tenant. `[PYR]`
3. A **Governance** (policies/specifications) restringe o espaço de ação de forma
   determinística. `[HE-GOV]`
4. Os **Services** decidem a operação, dentro do contrato de specification. `[PYR]` (`P2` `P15`)
5. As **Tools** executam a operação, sob fronteira de permissão explícita. (`P14`)
6. O **State** persiste o resultado como evento auditável. (`DO8`)
7. A **Observability** registra proveniência, verificação e atribuição — fechando o episódio
   como objeto auditável. `[HARNESS-RT]` (`P8` `P9`)

O LLM participa apenas como motor invocado nos passos onde compreensão ou geração linguística
é necessária. Ele **nunca** ocupa os passos 4–6.

---

## 7. Multi-tenancy como partição transversal

A multi-tenancy não é uma camada; é uma **partição que atravessa todas as camadas**. `[PYR]`
(`P10`) Estado, contexto, memória e políticas são particionados por tenant, e a fronteira entre
tenants é um invariante de engenharia — não uma configuração. A memória de um tenant é
inacessível a partir de outro. `[PYR]`

A **verticalização** de um domínio institucional expressa-se por specifications, policies e
retrieval próprios do tenant — **sem** alterar o núcleo de governança. O núcleo é estável; a
especialização é declarada.

---

## 8. Specifications como constituição

Acima das operações individuais está o corpus de **specifications**: a descrição machine-readable,
coerente e versionada do que cada classe de operação deve produzir. `[PYR]` (`P15`)

Conceitualmente, as specifications são a **constituição** do sistema: as intenções são as leis
promulgadas sob ela, o contexto é sua aplicação, e o prompt é uma ação pontual numa situação
específica. `[PYR]` A governança comportamental das camadas 3 e 2 é, em última instância, a
aplicação dessa constituição. O detalhamento pertence à camada `specification-engineering`.

---

## 9. Fronteiras desta camada (o que NÃO está aqui)

- **Não** define implementação: sem código, API, schema, microservice ou deploy.
- **Não** define a semântica passo a passo da execução — isso é da [arquitetura
  operacional](operational-architecture.md).
- **Não** define o ciclo de vida do runtime — isso é da [arquitetura de
  runtime](runtime-architecture.md).
- **Não** define o modelo de persistência e continuidade — isso é da [arquitetura de
  estado](state-architecture.md).
- **Não** consolida o PRD — Fase 3.

---

## 10. Conformidade com os princípios da fundação

| Princípio | Como esta arquitetura o instancia |
| --- | --- |
| `P1` LLM não é fonte de verdade | LLM na camada 8, sem autoridade; capacidade é do sistema (§2) |
| `P2` backend decide | Services (camada 2) decidem no fluxo (§6, passo 4) |
| `P6` runtime executa, não governa | Runtime coordena (camada 7); autoridade fora dele (§3) |
| `P10` multi-tenant por desenho | Partição transversal (§7) |
| `P12` governança separada da linguagem | Eixo guidance↔enforcement (§4.2) |
| `P15` specifications governam contratos | Constituição (§8) |
| `P18` linguagem desacoplada da operação | Eixo linguagem↔operação (§4.1) |

A resolução de conflitos entre princípios segue a **ordem de valores** definida em
[`principles.md`](../foundation/principles.md), não a numeração.

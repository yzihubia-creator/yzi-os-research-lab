# YZI OS — Arquitetura de Estado

> Documento de arquitetura (espinha dorsal). Define o **estado persistido como verdade
> operacional** do YZI OS: persistência, continuidade, memória, isolamento e proveniência.
> Detalha a camada 1 da [arquitetura conceitual](conceptual-architecture.md).
>
> Camada: `architecture` · Status: canônico · Versão: v1
> Proveniência: `[CE]` `[PYR]` `[HARNESS-RT]`

---

## 1. Propósito e escopo

O estado é a **verdade operacional** do YZI OS. Este documento define como o estado governa a
continuidade, como se distingue da memória conversacional, como se organiza em formas distintas
de memória, e como permanece isolado por tenant e rastreável à origem.

Não há implementação aqui: **nenhum schema de banco, tabela, modelo de dados ou DDL**. O estado
é descrito como **modelo conceitual de verdade operacional**. O substrato de persistência
(camada Supabase/State) é referido apenas no plano arquitetural.

---

## 2. O estado é a fonte de verdade

A primeira posição do valor de resolução de conflitos do YZI OS é **verdade operacional**, e
ela reside no estado persistido e na lógica institucional — não no modelo, não na conversa. (`P1`)

Disto decorre a inversão central desta camada: **estado operacional importa mais que memória
conversacional**. (`P17`) Memória conversacional é frágil, opaca à auditoria e não-portável: o
usuário recebe um instrumento de escrita, mas não de controle. `[PYR]` Estado operacional
persistido é recuperável, isolável e auditável — por isso é a verdade.

> A conversa é uma **projeção** do estado. Nunca o contrário. (`P17` `DO1`)

---

## 3. Estado governa a continuidade

A continuidade operacional é função do estado, **não** da memória do modelo nem da sessão. (`P3`)
Operação institucional é stateful; o modo conversacional é stateless e recomeça em branco a cada
chamada. `[PYR]`

O padrão conceitual que garante isso é a **Referência Mestra**: um artefato de autoridade
versionado que acumula decisões, restrições e escolhas ao longo do tempo, reintroduzido a cada
operação — provendo continuidade entre sessões **sem** depender da memória do modelo. `[CE]`
A continuidade, portanto, vem do **estado recuperável**, não do "lembrar".

Consequência operacional invariante:

> Encerrar uma sessão ou substituir o modelo **não pode** interromper a continuidade.

---

## 4. Estado evolui por eventos

O estado não sofre mutação implícita: ele **evolui por eventos auditáveis**. (`DO8`) Cada
operação que altera o estado o faz através de um evento registrado, de modo que o histórico seja
reconstruível e cada transição tenha proveniência.

Esta é a base da auditabilidade (`P9`): o pacote de episódio referido na [arquitetura
operacional](operational-architecture.md) ancora-se no histórico de eventos do estado. O estado
é, simultaneamente, a verdade do **agora** e o registro do **como se chegou aqui**.

---

## 5. As quatro formas de memória

A "memória" não é uma coisa só. O YZI OS modela quatro formas distintas, cada uma com custo,
isolamento e ciclo de vida próprios. Tratá-las como unidade é o erro que esta arquitetura
evita. `[PYR]`

| Forma | O que é | Onde vive (conceitual) | Ciclo de vida |
| --- | --- | --- | --- |
| **Working** | conteúdo da janela de contexto agora | pacote de contexto montado | efêmero (a operação) |
| **Episodic** | log de interações/decisões passadas | estado persistido (histórico de eventos) | durável, compressível |
| **Semantic** | conhecimento institucional estruturado | retrieval governado (RAG) | durável, versionado |
| **Procedural** | capacidade de executar uma classe de operação | specifications / harness | governado por contrato |

A **working memory** é montada pelo runtime a partir das demais; a **episódica** e a
**semântica** são estado; a **procedural** é governada por specifications. A administração
dessas formas é uma decisão de desenho — não um efeito colateral da escolha de ferramenta. `[PYR]`

> Memória é um **ambiente que se administra**, não um campo que se preenche. `[PYR]`

---

## 6. Contexto é estado compilado

O pacote de contexto (detalhado na camada `context-engineering`) é uma **representação compilada
de um sistema stateful mais rico** — não uma string. `[PYR]` Conceitualmente, o contexto é a
projeção, montada just-in-time, do recorte de estado relevante para uma operação, sujeita aos
critérios de qualidade (relevância, suficiência, isolamento, economia, proveniência). `[PYR]`
(`P11`)

A relação entre estado e contexto é direcional: **o estado é a fonte; o contexto é o recorte
compilado**. O estado não é definido pelo que aparece no contexto; o contexto é derivado do que
existe no estado.

---

## 7. Isolamento multi-tenant do estado

O isolamento multi-tenant é a terceira posição da ordem de valores e um invariante desta
camada. (`P10`) Estado, memória episódica, conhecimento semântico e políticas são **particionados
por tenant**, e a memória de um tenant é **inacessível** a partir de outro. `[PYR]`

O isolamento do estado é arquitetural, não configuracional: nenhuma operação, retrieval ou
montagem de contexto pode atravessar a fronteira de tenant. A verticalização de um domínio
expressa-se por estado, specifications e retrieval próprios do tenant — sem alterar o núcleo.

---

## 8. Proveniência do estado

Cada fragmento de estado e cada transição carregam **proveniência**: de qual sistema/origem
vieram, quando, e com que nível de confiança. `[PYR]` (`P9` `DO6`) Sem proveniência, não há
auditoria de decisão, depuração de erro nem conformidade.

A proveniência do estado é o que torna possível, na verificação operacional, vincular cada
requisito a evidência rastreável e atribuir corretamente uma falha à sua origem — em vez de
"adivinhar" qual fragmento provocou uma decisão. `[PYR]` `[HARNESS-RT]`

---

## 9. Regimes de residência do estado

A escolha entre residência em nuvem e on-premise para o estado é uma **decisão de controle de
dados e conformidade**, não de desempenho. `[PYR]` Em arquiteturas híbridas, a memória é
**federada**: estado estratégico (metas, planos entre sessões, contexto institucional acumulado)
reside no núcleo, enquanto recortes mínimos e task-scoped são montados sob demanda. O que cruza
cada fronteira é uma **questão de desenho de contexto**, não de rede — e restrições regulatórias
de residência tornam-se restrições arquiteturais sobre **o que o sistema pode reter e onde**. `[PYR]`

Este documento registra o regime como dimensão conceitual; sua materialização pertence às
camadas posteriores e nunca contradiz o isolamento de tenant (§7).

---

## 10. Fronteiras desta camada (o que NÃO está aqui)

- **Não** define schema, tabela, modelo de dados, DDL ou migração — proibido nesta entrega.
- **Não** define o pipeline de montagem de contexto — isso é da camada `context-engineering`.
- **Não** define a coordenação que lê/escreve o estado — isso é da [arquitetura de
  runtime](runtime-architecture.md).
- **Não** define a semântica da operação que gera eventos — isso é da [arquitetura
  operacional](operational-architecture.md).

---

## 11. Conformidade com os princípios da fundação

| Princípio | Como esta arquitetura o instancia |
| --- | --- |
| `P1` LLM não é fonte de verdade | Estado é a verdade (§2) |
| `P3` estado governa continuidade | §3 (Referência Mestra) |
| `P10` multi-tenant por desenho | Isolamento do estado (§7) |
| `P17` estado > memória conversacional | §2 (conversa é projeção) |
| `DO1` cognição stateful | §3, §5 |
| `DO6` provenance tracking | §8 |
| `DO8` event-driven operational state | §4 |

A resolução de conflitos entre princípios segue a **ordem de valores** de
[`principles.md`](../foundation/principles.md) — cujas três primeiras posições (verdade
operacional, segurança, isolamento multi-tenant) são diretamente sustentadas por esta camada.

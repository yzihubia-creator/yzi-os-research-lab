# YZI OS — PRD Institucional · v1

> **Documento de produto institucional (PRD).** Consolida, num único registro de
> referência, a arquitetura do YZI OS já documentada nas oito camadas canônicas. Este PRD
> **não** introduz doutrina nova: ele integra, ordena e torna citável o que os documentos de
> `foundation`, `architecture`, `context-engineering`, `specification-engineering`,
> `harness-engineering`, `runtime`, `governance` e `agents` já estabelecem.
>
> Camada: `prd` · Status: canônico · Versão: v1 · Data: 2026-06-03
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]` (ver
> [`terminology.md`](../foundation/terminology.md))

---

## 0. Natureza e leitura deste documento

Este é um **PRD arquitetural**, não um plano comercial. Seu objeto é a **infraestrutura
institucional** — a arquitetura é o produto. Ele descreve *o que o YZI OS é, por que existe e
como se governa*, sem especificar implementação.

O PRD é deliberadamente **derivado**: cada seção sintetiza uma camada canônica e remete a ela
para o detalhe. Em caso de divergência entre este PRD e um documento de camada, prevalece a
**hierarquia documental** (`manifesto` › `mission`/`philosophy` › `principles` › arquitetura ›
demais), e a resolução de conflitos entre princípios segue a **ordem de valores** de
[`principles.md`](../foundation/principles.md) — nunca a numeração.

Códigos de proveniência usados em todo o corpus: `[CE]` Context Engineering · `[PYR]`
Context→Intent→Specification · `[HE-GOV]` Harness Engineering (Governança) · `[AHE]` Agentic
Harness Engineering · `[HARNESS-RT]` AI Harness Runtime.

---

## 1. Visão

O YZI OS é uma **infraestrutura operacional cognitiva stateful, multi-tenant e governada por
especificações**, destinada à operação de **agentes institucionais**. Ele é um **sistema
operacional para cognição institucional**: uma camada que monta contexto, aplica governança,
executa operações controladas, persiste estado e produz evidência auditável — usando modelos
de linguagem como **componente substituível, não como autoridade**.
(Ver [`manifesto.md`](../foundation/manifesto.md).)

A visão organiza-se em torno de uma **inversão arquitetural**: a capacidade operacional não é
propriedade do modelo, mas propriedade **emergente do sistema `modelo–harness–ambiente`**.
`[HARNESS-RT]` Atribuir competência ou falha ao modelo isolado é **erro de atribuição**. O YZI
OS é o desenho deliberado da estrutura que converte capacidade latente do modelo em
**comportamento institucional auditável, verificável e mantível**.

---

## 2. Missão e problema institucional

**Missão:** *tornar capacidade cognitiva probabilística em operação institucional governada.*
(Ver [`mission.md`](../foundation/mission.md).)

O problema é **arquitetural, não estatístico**: organizações implantam agentes mais rápido do
que conseguem governá-los. Ele se decompõe em quatro déficits, cada um endereçado por uma
camada do YZI OS: `[PYR]`

| Déficit | Descrição | Endereçado por |
| --- | --- | --- |
| **Contexto** | `context rot`: contexto contaminado degrada a decisão; o mundo montado para o agente é mal formado | `context-engineering`, retrieval governado |
| **Estado e continuidade** | o modo conversacional é stateless; operação institucional é stateful e exige continuidade entre sessões | `state-architecture`, Referência Mestra |
| **Intenção e governança comportamental** | contexto presente, intenção ausente (caso Klarna); governança por prompt é probabilística | `governance`, policies + specifications |
| **Especificação (specification debt)** | conhecimento institucional informal é incompatível com sistemas autônomos | `specification-engineering` |

A figura central deixa de ser o *usuário* e passa a ser o **operador**: quem define o objetivo
do agente, o configura e **responde** pelo resultado. A infraestrutura existe para tornar essa
responsabilidade **exercível** — governar o que se pede, governar o que o agente faz e **provar
depois** o que foi feito. `[PYR]`

---

## 3. O que o YZI OS é — e o que recusa ser

O YZI OS é, por desenho e simultaneamente: infraestrutura operacional cognitiva stateful;
plataforma institucional multi-tenant; sistema operacional para agentes institucionais;
arquitetura governance-first; infraestrutura specification-driven; ecossistema de runtime
harness; plataforma operacional governada por contexto.
(Ver [`manifesto.md`](../foundation/manifesto.md) §3.)

A recusa abaixo é **arquitetural, não retórica** — cada item é um modelo de sistema cujas
premissas o YZI OS contradiz:

- **Não é um chatbot** — o estado persistido, não a conversa, governa a continuidade.
- **Não é um wrapper de LLM** — o backend decide; o modelo não detém autoridade decisória.
- **Não é uma automação simples** — executa operações governadas por specifications, com
  atribuição de falha, verificação e proveniência de primeira classe.
- **Não é um SaaS de IA genérico nem plataforma de prompts** — o objeto de otimização é o
  ambiente informacional e o estado operacional, não a formulação de uma consulta.
- **Não é um runtime centrado no modelo** — o runtime é leve e coordena; a governança vive
  fora da linguagem.
- **Não é frontend-first** — a interface é projeção do estado, nunca sua fonte.

---

## 4. Filosofia arquitetural

A filosofia do YZI OS é um conjunto de **inversões** em relação ao paradigma centrado no
modelo (ver [`philosophy.md`](../foundation/philosophy.md) §9):

| Paradigma centrado no modelo | Filosofia do YZI OS |
| --- | --- |
| O modelo decide | O backend decide; o estado governa |
| Memória conversacional | Estado operacional persistido |
| Governança no prompt (probabilística) | Governança estrutural (determinística) `[HE-GOV]` |
| Capacidade é do modelo | Capacidade é do sistema `modelo–harness–ambiente` `[HARNESS-RT]` |
| Conclusão por asserção | Conclusão por evidência verificada `[HARNESS-RT]` |
| Contexto é entrada | Contexto é o OS do agente `[PYR]` |
| Linguagem = operação | Linguagem desacoplada da operação |
| Confie no modelo | **Confie na arquitetura** `[CE]` |

Princípio diretor: **Confie na arquitetura, não no modelo.** A segurança e a coerência do
sistema são **propriedades da infraestrutura**, não de qualquer modelo específico, e devem
sobreviver à substituição do provedor de modelo sem alteração do runtime, das specifications
ou da camada de verificação. `[CE]` Daí o paradoxo produtivo: **restringir habilita
autonomia** — a confiança para delegar cresce na exata medida em que o espaço de ação é
estreitado por enforcement. `[HE-GOV]`

---

## 5. Princípios

O YZI OS é governado por **18 princípios invioláveis** (`P1`–`P18`) e **10 corolários
operacionais** (`DO1`–`DO10`), registrados em [`principles.md`](../foundation/principles.md). A
numeração é **referência estável de citação**, não prioridade. Síntese vinculante:

- `P1` o LLM não é fonte de verdade · `P2` o backend decide · `P3` estado persistido governa a
  continuidade · `P4` retrieval governa comportamento · `P5` RAG + Policies governam os agentes
  · `P6` o runtime executa, mas não governa · `P7` agentes são interfaces institucionais ·
  `P8` observabilidade é obrigatória · `P9` toda ação operacional deve ser auditável ·
  `P10` multi-tenant por desenho · `P11` contexto modular e recuperável · `P12` governança
  separada da linguagem · `P13` o runtime permanece leve · `P14` services e tools executam ·
  `P15` specifications governam os contratos · `P16` harnesses orquestram a cognição
  operacional · `P17` estado operacional > memória conversacional · `P18` linguagem
  desacoplada da operação.
- Corolários `DO1`–`DO10`: cognição stateful, isolamento contextual, orquestração de retrieval,
  execução baseada em specification, policy enforcement determinístico, provenance tracking,
  behavioral traceability, event-driven operational state, verificação como runtime, auditoria
  de entropia.

---

## 6. Arquitetura conceitual

O sistema organiza-se em torno de uma equação conceitual: `[HARNESS-RT]`

> **C_sistema = F( C_modelo , C_harness , C_ambiente , T )**

A capacidade operacional é propriedade **emergente** da composição `modelo–harness–ambiente`
sobre uma distribuição de tarefas `T`. Toda a arquitetura existe para **desenhar
deliberadamente `C_harness` e `C_ambiente`**. (Ver
[`conceptual-architecture.md`](../architecture/conceptual-architecture.md).)

Dois eixos ortogonais de separação estruturam o sistema:

- **Linguagem ↔ operação** (`P18`): a camada linguística (Agents, LLM) **propõe**; a camada
  operacional (Services, Tools, State) **dispõe**. O LLM é "cérebro sem mãos". `[PYR]`
- **Guidance ↔ enforcement** (`P12`): guidance (pré-geração, linguística) é **probabilístico**;
  enforcement (pós-geração, governança/services) é **determinístico**, com veredito pass/fail
  independente do agente (**independência de agente**). `[HE-GOV]`

A unidade de troca entre linguagem e governança/estado não é o prompt — é o **pacote de
contexto**, com papéis em prioridade decrescente **Authority › Exemplar › Constraint › Rubric
› Metadata**; o prompt ocupa o nível de **Metadata**, o de menor autoridade (o **Paradoxo do
Metadado**). `[CE]`

---

## 7. Separação de camadas (o modelo de governança)

O sistema **não é modelado com o LLM no centro**. A autoridade distribui-se por camadas, com o
LLM na posição de **menor** autoridade operacional. (Ver
[`conceptual-architecture.md`](../architecture/conceptual-architecture.md) §3 e
[`governance-architecture.md`](../architecture/governance-architecture.md).)

| Camada | Papel / autoridade | Princípios |
| --- | --- | --- |
| **Estado (Supabase)** | Verdade operacional, persistência, continuidade, histórico | `P3` `P17` `DO1` `DO8` |
| **Services** | Lógica institucional e decisão dentro de contratos | `P2` `P14` |
| **RAG / XML / Policies** | Governança comportamental | `P4` `P5` `P12` `DO3` `DO5` |
| **Retrieval** | Face contextual e de recuperação da governança | `P4` `P11` `DO3` |
| **Agents** | Interface linguística institucional | `P7` |
| **Tools** | Execução operacional controlada | `P14` |
| **Observabilidade** | Auditoria, rastreabilidade e evidência | `P8` `P9` `DO6` `DO7` |
| **Runtime leve** | Coordenação operacional | `P6` `P13` `P16` |
| **LLM** | Motor linguístico probabilístico **sem autoridade operacional** | `P1` `P18` |

Leitura essencial: **o estado, os services, a governança/retrieval e a observabilidade
governam; o runtime coordena; agents, tools e LLM não detêm autoridade comportamental.**

> **O YZI OS não é governado pelo LLM, pelo runtime ou pelo agente. Ele é governado pela
> combinação entre estado persistido, services institucionais, specifications, policies,
> retrieval contextual e observabilidade operacional.**

---

## 8. Estado persistido — a verdade operacional

O **estado persistido** é a fonte de verdade do sistema: recuperável, isolável e auditável. A
continuidade operacional é função do estado, **não** da conversa nem da memória do modelo
(`P3` `P17`). A **conversa é projeção do estado**, nunca sua fonte; o estado evolui por
**eventos auditáveis** (`DO8`), e a **Referência Mestra** garante continuidade entre sessões e
sob troca de modelo, sem depender da memória opaca do modelo. `[CE]` `[PYR]`
(Ver [`state-architecture.md`](../architecture/state-architecture.md) e
[`runtime-state-management.md`](../runtime/runtime-state-management.md).)

---

## 9. Services e Tools — decisão e execução

A **autoridade decisória** pertence aos **services** (lógica institucional, regras,
validações), dentro do contrato de specification (`P2` `P15`). A **execução** pertence às
**tools** — execução operacional controlada, com **fronteira de permissão explícita** e trace
(`P14`). Nenhuma execução ocorre fora de uma tool registrada; o modelo apenas **descreve** a
invocação, nunca a executa. `[PYR]` `[HARNESS-RT]`
(Ver [`service-architecture.md`](../architecture/service-architecture.md) e
[`execution-harness.md`](../harness-engineering/execution-harness.md).)

---

## 10. Governança comportamental — RAG + XML + Policies

A governança comportamental vive **fora da linguagem** e é **determinística**: o que o agente
sabe (RAG), a estrutura de sua operação (XML/contratos) e o que pode/não pode (policies)
governam o comportamento — não a formulação do prompt (`P4` `P5` `P12`). Guidance orienta a
proposta (pré); **só o Enforcement garante** (pós), independentemente da eloquência do agente.
`[HE-GOV]` `[CE]`
(Ver [`governance-architecture.md`](../architecture/governance-architecture.md),
[`behavioral-governance.md`](../governance/behavioral-governance.md),
[`policy-governance.md`](../governance/policy-governance.md) e
[`governance-harness.md`](../harness-engineering/governance-harness.md).)

## 11. Retrieval governado — a face contextual da governança

O **retrieval** é a **face contextual e de recuperação** da governança — separado dela, não
fundido. Governar o que o agente recupera é governar como ele se comporta (`P4`); a recuperação
é **orquestrada por política** (`DO3`), com proveniência por fragmento (`DO6`) e respeito ao
isolamento de tenant. `[PYR]`
(Ver [`retrieval-architecture.md`](../architecture/retrieval-architecture.md),
[`retrieval-governance.md`](../context-engineering/retrieval-governance.md) e
[`retrieval-harness.md`](../harness-engineering/retrieval-harness.md).)

---

## 12. Agents — interface linguística institucional

Um agente é a **interface linguística da instituição**, não um decisor autônomo (`P7`). Ele
recebe intenção e produz **operação proposta**, que entra como **Metadata** (prioridade
mínima); a decisão é dos services, a execução é das tools, a verdade é do estado. O agente é
**governado, não confiado**: opera dentro de fronteiras que restringem seu espaço de ação,
independentemente de seu raciocínio. Sua continuidade vem do **estado** e da Referência
Mestra; sua memória tem quatro formas distintas (working, episódica, semântica, procedural).
`[PYR]` `[CE]`
(Ver camada [`agents/`](../agents/institutional-agents.md) e
[`agent-architecture.md`](../architecture/agent-architecture.md).)

---

## 13. Runtime leve e Runtime Harness Systems

O **runtime é leve por princípio**: coordena (monta contexto, roteia, orquestra, executa o
ciclo), mas **não detém autoridade comportamental** (`P6` `P13`). A operação é um **ciclo
governado, não um workflow fixo**. A cognição operacional é orquestrada por **harnesses** —
substratos de runtime que expõem, traçam e governam os recursos do agente, com **onze
responsabilidades de runtime** (interface de tarefa, contexto, ferramentas, memória de projeto,
estado de tarefa, observabilidade, atribuição de falha, verificação, permissão, auditoria de
entropia, registro de intervenção) (`P16`). A **verificação é capacidade de runtime**:
reproduzir → atribuir → corrigir → verificar → reportar (`DO9`). `[HARNESS-RT]` `[AHE]`
(Ver camada [`runtime/`](../runtime/runtime-philosophy.md),
[`runtime-architecture.md`](../architecture/runtime-architecture.md) e
[`runtime-harness.md`](../harness-engineering/runtime-harness.md).)

---

## 14. Context Engineering

O **contexto é o sistema operacional do agente** — ambiente de execução, não dado de entrada;
uma **representação compilada de um sistema stateful mais rico**, montada por um pipeline de
seleção, compressão, filtragem e isolamento (`P11`). Qualidade do contexto tem cinco critérios:
**relevância, suficiência, isolamento, economia, proveniência**. A autoridade dentro do pacote
segue **Authority › Exemplar › Constraint › Rubric › Metadata**. `[CE]` `[PYR]`
(Ver camada [`context-engineering/`](../context-engineering/context-model.md).)

## 15. Specification Engineering

As **specifications são a constituição** do sistema: a descrição machine-readable, coerente e
versionada do que cada classe de operação deve produzir (`P15`). As intenções são as leis
promulgadas sob ela; o contexto é sua aplicação; o prompt é uma ação pontual. Agente criado sem
specification carrega **specification debt**. Decomposição é **contract-first**: só se delega o
**verificável**, com **atenuação de privilégio** na delegação. `[PYR]`
(Ver camada [`specification-engineering/`](../specification-engineering/specification-philosophy.md).)

## 16. Harness Engineering

A **engenharia de harness** desenha o substrato de runtime que medeia observação, ação,
feedback e conclusão — distinto do modelo e da governança. Distingue **Guidance** (probabilístico,
pré) de **Enforcement** (determinístico, pós), do que decorre a **independência de agente** e o
princípio "restringir habilita autonomia". Os componentes do harness são desacoplados,
editáveis isoladamente e formam uma **superfície externalizada e auditável** de evolução.
`[HE-GOV]` `[AHE]` `[HARNESS-RT]`
(Ver camada [`harness-engineering/`](../harness-engineering/harness-philosophy.md).)

---

## 17. Observabilidade, auditoria e evidência

**Observabilidade é obrigatória** (`P8`): sucesso não verificável e falha não diagnosticável
são inaceitáveis. São três pilares — de **componente**, de **experiência** e de **decisão**.
`[AHE]` **Toda ação operacional é auditável** (`P9`): cada operação é um **episódio auditável**
com pacote de evidência; a trilha de auditoria **forma-se organicamente** quando cada estágio
preserva sua saída (`DO6` `DO7`). A conclusão é **objeto evidenciário**, não asserção (`DO9`).
Vale o **invariante de controlabilidade**: quem executa não desliga a própria fiscalização — o
verificador, o tracer e a configuração são read-only para o executor. `[AHE]`
(Ver [`observability-architecture.md`](../architecture/observability-architecture.md),
[`auditability.md`](../governance/auditability.md),
[`observability-harness.md`](../harness-engineering/observability-harness.md) e
[`audit-harness.md`](../harness-engineering/audit-harness.md).)

---

## 18. Segurança e isolamento multi-tenant

A **multi-tenancy é por desenho** (`P10`): não é uma camada, mas uma **partição transversal**
que atravessa estado, contexto, memória e políticas. A fronteira entre tenants é um
**invariante de engenharia**, não uma configuração — a memória de um tenant é inacessível a
partir de outro. A segurança apoia-se em **atenuação de privilégio** na delegação (cada elo
estreita permissões) e na distinção entre **delegar** (transfere autoridade e responsabilidade)
e **decompor** (parte a tarefa). `[PYR]`
(Ver [`tenant-architecture.md`](../architecture/tenant-architecture.md),
[`tenant-governance.md`](../governance/tenant-governance.md),
[`tenant-contracts.md`](../specification-engineering/tenant-contracts.md),
[`context-isolation.md`](../context-engineering/context-isolation.md) e
[`operational-boundaries.md`](../governance/operational-boundaries.md).)

---

## 19. Verticalização

A **verticalização** de um domínio institucional expressa-se por **specifications, policies e
retrieval próprios do tenant — sem alterar o núcleo de governança**. O núcleo é estável; a
especialização é **declarada**, não programada. Isto preserva o isolamento multi-tenant e a
coerência do sistema enquanto permite que cada instituição opere sob suas próprias regras.
`[PYR]`
(Ver [`conceptual-architecture.md`](../architecture/conceptual-architecture.md) §7 e
[`tenant-architecture.md`](../architecture/tenant-architecture.md).)

---

## 20. Critérios de sucesso

O YZI OS cumpre sua missão quando (ver [`mission.md`](../foundation/mission.md) §5):

- a **continuidade operacional** sobrevive ao fim de qualquer sessão e à substituição de
  qualquer modelo;
- nenhuma **ação operacional** ocorre sem proveniência e sem possibilidade de auditoria;
- o **comportamento** dos agentes é governado por políticas e specifications, não pela
  eloquência do prompt;
- a **escala** (muitos agentes, muitos tenants) não degrada a coerência, porque a coerência é
  propriedade das specifications, não da coordenação manual.

Em uma frase: **quem controla o contexto controla o comportamento; quem controla a intenção
controla a estratégia; quem controla as specifications controla a escala.** `[PYR]`

---

## 21. Evolução futura

A evolução do YZI OS é **governada e auditável** — o harness é a superfície externalizada onde a
experiência se acumula (`P16`, `DO10`). `[AHE]` Direções já antecipadas pela arquitetura, **sem
compromisso de implementação neste PRD**:

- aprofundamento dos harnesses especializados (runtime, governança, observabilidade, retrieval,
  auditoria, escalação, execução);
- um possível **Spec Executor Harness** — registrado como direção futura, **não** especificado
  aqui;
- continuidade do caminho Spec-Driven a jusante deste PRD (ver §22).

Mudança de estratégia institucional propaga-se por **nova versão** de specification/policy —
não por ajuste verbal.

---

## 22. Caminho do projeto (posição deste PRD)

O YZI OS segue desenvolvimento **Spec-Driven**. Este PRD é o **primeiro** marco consolidado da
cadeia; os marcos a jusante **não** fazem parte desta entrega:

> **PRD institucional** → specs executáveis → mapa de skills → mapa de subagentes → harnesses →
> plano de implementação → código.

Este documento encerra a consolidação arquitetural. Nenhum artefato a jusante (specs
executáveis, código, APIs, schema, frontend, backlog, roadmap de implementação) é produzido
aqui.

---

## 23. Mapa documental (camadas canônicas)

As oito camadas que este PRD consolida (índice de leitura completo em
[`README.md`](../README.md)):

- [`foundation/`](../foundation/manifesto.md) — manifesto, missão, filosofia, princípios, terminologia.
- [`architecture/`](../architecture/conceptual-architecture.md) — arquitetura conceitual, operacional, runtime, estado, observabilidade, governança, tenant, service, agent, retrieval.
- [`context-engineering/`](../context-engineering/context-model.md) — modelo, ciclo de vida, composição, autoridade, retrieval governado, isolamento, proveniência.
- [`specification-engineering/`](../specification-engineering/specification-philosophy.md) — filosofia e contratos operacionais, comportamentais, de execução, de política e de tenant.
- [`harness-engineering/`](../harness-engineering/harness-philosophy.md) — filosofia e harnesses de runtime, governança, observabilidade, retrieval, auditoria, escalação, execução.
- [`runtime/`](../runtime/runtime-philosophy.md) — filosofia, ciclo de vida, gestão de estado, modelo de execução, orquestração.
- [`governance/`](../governance/policy-governance.md) — governança de política, comportamental, de tenant, fronteiras operacionais, auditabilidade, escalação.
- [`agents/`](../agents/institutional-agents.md) — agentes institucionais, ciclo de vida, memória, modelo de execução, governança.

---

## 24. Fronteiras (o que este PRD NÃO é)

- **Não** contém código, API, schema, microservice, frontend, UI, fluxos de tela, deploy ou
  pipeline.
- **Não** contém backlog nem roadmap de implementação.
- **Não** reformula o YZI OS como chatbot, wrapper de LLM, SaaS genérico, automação simples ou
  runtime centrado no modelo.
- **Não** substitui as camadas canônicas: é consolidação e referência, não a sua fonte.

---

## 25. Conformidade com os princípios da fundação

| Princípio | Onde o PRD o instancia |
| --- | --- |
| `P1` LLM não é fonte de verdade | §1, §6, §7 |
| `P2`/`P14` backend decide; tools executam | §9 |
| `P3`/`P17` estado governa a continuidade | §8 |
| `P4`/`P5`/`P12` governança fora da linguagem | §10, §11 |
| `P6`/`P13`/`P16` runtime leve, harnesses orquestram | §13 |
| `P7`/`P18` agentes são interface; linguagem desacoplada | §12, §6 |
| `P8`/`P9` observabilidade e auditabilidade | §17 |
| `P10` multi-tenant por desenho | §18, §19 |
| `P11` contexto modular e recuperável | §14 |
| `P15` specifications governam contratos | §15 |
| `DO1`–`DO10` corolários operacionais | §5 e seções correlatas |

Conflitos entre princípios: **ordem de valores** de
[`principles.md`](../foundation/principles.md) (verdade operacional › segurança › isolamento
multi-tenant › auditabilidade › governança institucional › continuidade de estado ›
desacoplamento linguagem/operação › leveza do runtime) — nunca a numeração.

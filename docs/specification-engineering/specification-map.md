# YZI OS — Mapa de Specifications Executáveis

> **Documento de arquitetura (ponte).** Cataloga, nomeia e estrutura as **specifications
> executáveis futuras** do YZI OS — o conjunto de contratos que levarão o sistema da fundação
> institucional para construção controlada. Este documento **não** cria as specs: ele as
> **mapeia**. A arquitetura continua sendo o produto.
>
> Camada: `specification-engineering` · Status: canônico · Versão: v1 · Data: 2026-06-03
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]` (ver
> [`terminology.md`](../foundation/terminology.md))

---

## 1. Propósito do Specification Map

Este mapa responde a uma pergunta: **quais specifications executáveis precisam existir para o
YZI OS sair da fundação institucional e entrar em construção controlada — e em que ordem?**

Ele transforma o [PRD institucional](../prd/yzi-os-prd-v1.md) e as oito camadas de arquitetura
em uma **lista organizada, priorizada e governada** de specifications a serem criadas
posteriormente. Para cada specification futura, o mapa fixa: nome, camada, propósito, classe de
operação, contrato esperado em linguagem natural, método de verificação esperado, owner
arquitetural, tenant-scope, dependências, proveniência teórica e candidatura futura (skill,
subagente, harness, service/tool ou governança documental).

O mapa **não** contém specs implementáveis, schema, contratos machine-readable, YAML/JSON,
código ou exemplos reais. É a **ponte** entre o PRD e a futura criação controlada das specs.

---

## 2. Relação com o PRD institucional

O [PRD](../prd/yzi-os-prd-v1.md) consolidou *o que o YZI OS é e como se governa*. Este mapa dá
o passo seguinte: *o que precisa ser especificado para construí-lo sob governança*. Cada grupo
de specs deste mapa instancia uma seção do PRD:

| Seção do PRD | Grupo de specs correspondente |
| --- | --- |
| §7 separação de camadas; §5 princípios | A. Core Institutional |
| §8 estado persistido | B. State |
| §13 runtime leve | C. Runtime |
| §14 context engineering; §11 retrieval | D. Context / Retrieval |
| §10 governança comportamental | E. Governance |
| §12 agents | F. Agent |
| §9 services e tools | G. Service / Tool |
| §17 observabilidade e auditoria | H. Observability |
| §18 segurança e multi-tenant; §19 verticalização | I. Multi-Tenant |
| §13/§16 harness engineering | J. Harness |

O PRD permanece a autoridade; este mapa não o contradiz — apenas o decompõe em contratos
futuros.

---

## 3. Relação com Spec-Driven Development

Posição deste documento no caminho do projeto:

> PRD institucional → **[ESTE: Mapa de Specifications Executáveis]** → specs executáveis →
> mapa de skills → mapa de subagentes → harnesses → plano de implementação → código.

O mapa é o artefato que **orienta** as fases seguintes, sem executá-las. Criar as specs em si,
o mapa de skills, o mapa de subagentes, os harnesses operacionais e o plano de implementação
são **fases futuras distintas**, fora do escopo desta entrega.

---

## 4. Princípios de decomposição das specs

A decomposição segue regras herdadas da [filosofia de
specification](specification-philosophy.md) e da fundação:

1. **Uma spec = uma classe de operação verificável.** Specifications são a constituição; cada
   uma descreve o que uma classe de operação deve produzir, de forma coerente e versionada.
   `[PYR]` (`P15`)
2. **Contract-first.** Só se especifica (e depois se delega) aquilo que tem **método de
   verificação precisamente definido**. Sem verificação, não há spec. `[PYR]` (`DO4`)
3. **Decompor ≠ delegar.** Decomposição parte a operação em classes; delegação transfere
   autoridade e responsabilidade — com **atenuação de privilégio** a cada elo. `[PYR]`
4. **Seis preocupações não-colapsáveis.** Linguagem, operação, estado, governança, execução e
   observabilidade permanecem separadas; nenhuma spec pode colapsá-las. `[CE]`
5. **Governança fora da linguagem.** Specs comportamentais codificam enforcement determinístico,
   não guidance em prompt. `[HE-GOV]` (`P12`)
6. **Multi-tenant transversal.** Toda spec declara seu tenant-scope; o isolamento é invariante,
   não configuração. `[PYR]` (`P10`)
7. **Resolução por ordem de valores.** Conflitos entre specs resolvem-se pela ordem de valores
   de [`principles.md`](../foundation/principles.md), nunca por número.

---

## 5. Ordem macro de criação

A criação futura das specs segue **ondas de prioridade** (`P0`–`P5`), por dependência
arquitetural. Uma onda só abre quando a anterior estabiliza.

| Onda | Foco | Grupos | Por que vem aqui |
| --- | --- | --- | --- |
| **P0** | Fundacional / bloqueante | A. Core + `tenant-boundary` | Definem autoridade, conflito e a partição multi-tenant que tudo pressupõe |
| **P1** | Verdade operacional | B. State | Estado é a fonte de verdade; nada decide sem ele |
| **P2** | Governança + contexto | E. Governance + D. Context/Retrieval + parte de I | O que restringe e o que monta o mundo do agente |
| **P3** | Superfície de execução + evidência-base | G. Service/Tool + C. Runtime + núcleo de H | Quem decide/executa e o que registra cada execução |
| **P4** | Interface linguística | F. Agent | O agente propõe dentro do que já está governado |
| **P5** | Maturidade + integração | resto de H + J. Harness | Auditoria de entropia, intervenção e os harnesses que integram tudo |

**Transversal:** o grupo I (Multi-Tenant) atravessa todas as ondas — `tenant-boundary` é `P0`;
os demais entram em P2.

---

## 6. Taxonomia das specifications

Dez grupos (A–J), 47 specifications futuras. A taxonomia segue a sugestão da Fase 4, mantida
porque é coerente com as oito camadas canônicas; nenhum ajuste foi exigido pela documentação.

| Grupo | Camada canônica | Nº specs | Onda dominante |
| --- | --- | --- | --- |
| A. Core Institutional | `foundation` / `architecture` | 3 | P0 |
| B. State | `architecture/state` + `runtime/state` | 4 | P1 |
| C. Runtime | `runtime` | 4 | P3 |
| D. Context / Retrieval | `context-engineering` | 5 | P2 |
| E. Governance | `governance` | 4 | P2 |
| F. Agent | `agents` | 5 | P4 |
| G. Service / Tool | `architecture/service` + `harness/execution` | 5 | P3 |
| H. Observability | `architecture/observability` + `governance/audit` | 6 | P3–P5 |
| I. Multi-Tenant | `architecture/tenant` + `governance/tenant` | 4 | P0–P2 |
| J. Harness | `harness-engineering` | 7 | P5 |

Legenda dos campos de cada card (§7): **Camada · Owner · Tenant-scope · Proveniência ·
Propósito · Classe de operação · Contrato (NL) · Verificação · Dependências · Candidatura.**

---

## 7. Lista priorizada de specifications

> Tenant-scope: **Global** = invariante cross-tenant · **Per-tenant** = particionado ·
> **Global/inst.** = definição global, instância por tenant.
> Candidatura: `skill` · `subagente` · `harness` · `service/tool` · `gov-doc` (governança documental).

### Grupo A — Core Institutional Specs · Onda P0 (fundacional, bloqueante)

#### `core-operational-principles.spec.md`
- **Camada:** foundation · **Owner:** Fundação · **Tenant-scope:** Global · **Proveniência:** `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]`
- **Propósito:** fixar os 18 princípios + 10 corolários como invariantes verificáveis do sistema.
- **Classe de operação:** invariante institucional (meta-governança).
- **Contrato (NL):** toda decisão de arquitetura, runtime, governança ou spec deve ser verificável contra `P1–P18`/`DO1–DO10`; nenhuma viola um invariante sem escalada.
- **Verificação:** checagem de conformidade de cada artefato contra o registro de princípios; ausência de violação não justificada.
- **Dependências:** nenhuma (raiz).
- **Candidatura:** `gov-doc`.

#### `layer-authority-model.spec.md`
- **Camada:** architecture · **Owner:** Arquitetura · **Tenant-scope:** Global · **Proveniência:** `[CE]` `[HARNESS-RT]`
- **Propósito:** fixar a distribuição de autoridade entre as 9 camadas (Estado…LLM) e o Paradoxo do Metadado.
- **Classe de operação:** invariante de autoridade.
- **Contrato (NL):** a autoridade operacional decresce de Estado a LLM; o LLM e o agente nunca detêm autoridade comportamental; o prompt é Metadata (menor prioridade).
- **Verificação:** nenhuma operação atribui decisão ao LLM/agente; a ordem de autoridade é respeitável em qualquer trace.
- **Dependências:** `core-operational-principles`.
- **Candidatura:** `gov-doc`.

#### `conflict-resolution.spec.md`
- **Camada:** foundation · **Owner:** Fundação · **Tenant-scope:** Global · **Proveniência:** `[CE]`
- **Propósito:** definir a resolução de conflitos por **ordem de valores** (não por número de princípio).
- **Classe de operação:** arbitragem / resolução.
- **Contrato (NL):** ao conflitar, preserva-se verdade operacional › segurança › isolamento multi-tenant › auditabilidade › governança › continuidade › desacoplamento › leveza do runtime.
- **Verificação:** toda resolução registrada é reconstruível e ordenável segundo a hierarquia de valores.
- **Dependências:** `core-operational-principles`.
- **Candidatura:** `gov-doc`.

### Grupo B — State Specs · Onda P1 (verdade operacional)

#### `operational-state.spec.md`
- **Camada:** state · **Owner:** Estado · **Tenant-scope:** Global/inst. · **Proveniência:** `[PYR]` `[CE]`
- **Propósito:** definir o estado persistido como fonte de verdade e a conversa como sua projeção.
- **Classe de operação:** persistência / verdade operacional.
- **Contrato (NL):** a continuidade deriva do estado, não da conversa; encerrar sessão ou trocar modelo não interrompe a continuidade.
- **Verificação:** continuidade sobrevive a fim de sessão e troca de modelo; a conversa nunca é fonte de verdade.
- **Dependências:** `layer-authority-model`, `tenant-boundary`.
- **Candidatura:** `service/tool` (state service) + `gov-doc`.

#### `event-driven-state.spec.md`
- **Camada:** state · **Owner:** Estado · **Tenant-scope:** Global/inst. · **Proveniência:** `[HARNESS-RT]` `[CE]`
- **Propósito:** o estado evolui por eventos auditáveis, não por mutação implícita.
- **Classe de operação:** transição-de-estado por evento.
- **Contrato (NL):** toda mudança de estado é um evento com origem, momento e proveniência; não há mutação silenciosa.
- **Verificação:** reconstrução do estado a partir do log de eventos; ausência de mutação não-evento.
- **Dependências:** `operational-state`.
- **Candidatura:** `service/tool` + `gov-doc`.

#### `tenant-state-isolation.spec.md`
- **Camada:** state / tenant · **Owner:** Estado + Tenant · **Tenant-scope:** Per-tenant · **Proveniência:** `[PYR]`
- **Propósito:** garantir que o estado de um tenant é inacessível a partir de outro.
- **Classe de operação:** isolamento de estado.
- **Contrato (NL):** estado, histórico e memória são particionados por tenant; nenhuma leitura cruza a fronteira.
- **Verificação:** teste de vazamento cross-tenant retorna negativo em qualquer caminho.
- **Dependências:** `operational-state`, `tenant-boundary`.
- **Candidatura:** `service/tool` + `gov-doc`.

#### `memory-model.spec.md`
- **Camada:** state / agents · **Owner:** Estado · **Tenant-scope:** Global/inst. · **Proveniência:** `[PYR]` `[CE]`
- **Propósito:** definir as quatro formas de memória (working, episódica, semântica, procedural) e a Referência Mestra.
- **Classe de operação:** modelagem de memória.
- **Contrato (NL):** cada forma tem custo, isolamento e ciclo de vida próprios; a continuidade vem do estado e da Referência Mestra, não da memória do modelo.
- **Verificação:** as quatro formas são distinguíveis e isoláveis; continuidade não depende de memória do modelo.
- **Dependências:** `operational-state`, `event-driven-state`.
- **Candidatura:** `gov-doc` + `service/tool` (memória episódica/semântica).

### Grupo C — Runtime Specs · Onda P3 (coordenação)

#### `lightweight-runtime.spec.md`
- **Camada:** runtime · **Owner:** Runtime · **Tenant-scope:** Global · **Proveniência:** `[HARNESS-RT]` `[HE-GOV]`
- **Propósito:** fixar o runtime como leve — coordena, não governa.
- **Classe de operação:** coordenação.
- **Contrato (NL):** o runtime monta contexto, roteia e orquestra; não decide o que é permitido nem acumula lógica institucional.
- **Verificação:** ausência de autoridade comportamental no runtime; lógica institucional reside em services/policies.
- **Dependências:** `layer-authority-model`.
- **Candidatura:** `harness`.

#### `runtime-lifecycle.spec.md`
- **Camada:** runtime · **Owner:** Runtime · **Tenant-scope:** Global · **Proveniência:** `[HARNESS-RT]`
- **Propósito:** definir o ciclo de vida de uma operação como ciclo governado (não workflow fixo).
- **Classe de operação:** ciclo operacional.
- **Contrato (NL):** intenção → montagem de contexto → enforcement → decisão → execução → persistência → observabilidade, sem saltar etapas.
- **Verificação:** todo episódio percorre as etapas na ordem; nenhuma etapa é pulada.
- **Dependências:** `lightweight-runtime`, `operational-state`.
- **Candidatura:** `harness`.

#### `runtime-orchestration.spec.md`
- **Camada:** runtime · **Owner:** Runtime · **Tenant-scope:** Global · **Proveniência:** `[HARNESS-RT]` `[AHE]`
- **Propósito:** definir roteamento e orquestração entre componentes desacoplados.
- **Classe de operação:** orquestração.
- **Contrato (NL):** componentes são desacoplados e editáveis isoladamente; a orquestração não embute domínio.
- **Verificação:** substituição de um componente não rompe os demais (independência estrutural).
- **Dependências:** `runtime-lifecycle`.
- **Candidatura:** `harness`.

#### `runtime-permission-boundaries.spec.md`
- **Camada:** runtime · **Owner:** Runtime · **Tenant-scope:** Global · **Proveniência:** `[HARNESS-RT]`
- **Propósito:** definir a fronteira de permissão que o runtime aplica antes de qualquer execução.
- **Classe de operação:** fronteira de permissão.
- **Contrato (NL):** nenhuma tool executa sem permissão explícita registrada; a fronteira é verificável fora da linguagem.
- **Verificação:** execução sem permissão registrada é bloqueada e auditada.
- **Dependências:** `lightweight-runtime`, `tool-permission`.
- **Candidatura:** `harness`.

### Grupo D — Context / Retrieval Specs · Onda P2 (mundo do agente)

#### `context-assembly.spec.md`
- **Camada:** context-engineering · **Owner:** Contexto · **Tenant-scope:** Per-tenant · **Proveniência:** `[PYR]` `[CE]`
- **Propósito:** definir a montagem do pacote de contexto com papéis e prioridade (Authority › Exemplar › Constraint › Rubric › Metadata).
- **Classe de operação:** recuperação-contextual / composição.
- **Contrato (NL):** o contexto é montado just-in-time, com os cinco critérios (relevância, suficiência, isolamento, economia, proveniência); o prompt é Metadata.
- **Verificação:** o pacote satisfaz os cinco critérios; Authority sobrepõe Metadata.
- **Dependências:** `operational-state`, `layer-authority-model`.
- **Candidatura:** `skill` (montagem de contexto) + `harness`.

#### `context-lifecycle.spec.md`
- **Camada:** context-engineering · **Owner:** Contexto · **Tenant-scope:** Per-tenant · **Proveniência:** `[PYR]`
- **Propósito:** definir write/select/compress/isolate e o tempo de vida do contexto.
- **Classe de operação:** ciclo-de-vida de contexto.
- **Contrato (NL):** o contexto tem operações explícitas e descarte governado; nada permanece além do seu tempo de vida.
- **Verificação:** cada unidade de contexto tem origem, tempo de vida e descarte rastreáveis.
- **Dependências:** `context-assembly`.
- **Candidatura:** `harness` + `gov-doc`.

#### `retrieval-governance.spec.md`
- **Camada:** context-engineering · **Owner:** Governança/Retrieval · **Tenant-scope:** Per-tenant · **Proveniência:** `[PYR]`
- **Propósito:** governar o retrieval como decisão de governança (governar o que se recupera = governar o comportamento).
- **Classe de operação:** recuperação governada.
- **Contrato (NL):** a recuperação é orquestrada por política, com proveniência por fragmento e respeito ao tenant-scope.
- **Verificação:** nenhuma recuperação ad hoc; cada fragmento carrega política e proveniência.
- **Dependências:** `context-assembly`, `tenant-retrieval-scope`.
- **Candidatura:** `harness`.

#### `context-isolation.spec.md`
- **Camada:** context-engineering · **Owner:** Contexto · **Tenant-scope:** Per-tenant · **Proveniência:** `[PYR]`
- **Propósito:** garantir isolamento de contexto entre papéis e atenuação de privilégio na delegação.
- **Classe de operação:** isolamento contextual.
- **Contrato (NL):** cada agente/sub-agente vê apenas o seu recorte; a delegação estreita permissões.
- **Verificação:** ausência de contaminação de contexto entre papéis; privilégio só decresce na cadeia.
- **Dependências:** `context-assembly`, `tenant-state-isolation`.
- **Candidatura:** `harness` + `gov-doc`.

#### `context-provenance.spec.md`
- **Camada:** context-engineering · **Owner:** Contexto/Observabilidade · **Tenant-scope:** Per-tenant · **Proveniência:** `[CE]` `[PYR]`
- **Propósito:** anexar origem, momento e confiança a cada fragmento de contexto.
- **Classe de operação:** proveniência.
- **Contrato (NL):** todo fragmento recuperado tem proveniência; sem proveniência não entra no pacote.
- **Verificação:** 100% dos fragmentos têm origem/momento/confiança auditáveis.
- **Dependências:** `context-assembly`.
- **Candidatura:** `harness` + `gov-doc`.

### Grupo E — Governance Specs · Onda P2 (o que restringe)

#### `policy-enforcement.spec.md`
- **Camada:** governance · **Owner:** Governança · **Tenant-scope:** Global/inst. · **Proveniência:** `[HE-GOV]`
- **Propósito:** aplicar políticas de forma determinística (Enforcement), com independência de agente.
- **Classe de operação:** enforcement.
- **Contrato (NL):** políticas são aplicadas e verificadas pós-geração; o veredito pass/fail independe de quem produziu a operação.
- **Verificação:** mesma operação recebe o mesmo veredito independentemente do agente; guidance não substitui enforcement.
- **Dependências:** `layer-authority-model`, `conflict-resolution`.
- **Candidatura:** `harness` (governance-harness).

#### `behavioral-governance.spec.md`
- **Camada:** governance · **Owner:** Governança · **Tenant-scope:** Global/inst. · **Proveniência:** `[HE-GOV]` `[PYR]`
- **Propósito:** codificar a intenção institucional (contexto + intenção), evitando o déficit duplo.
- **Classe de operação:** governança comportamental.
- **Contrato (NL):** o comportamento é governado por RAG + XML + policies, não pela formulação do prompt; intenção sem contexto é ruído, contexto sem intenção também.
- **Verificação:** comportamento reconstruível a partir de policies/contratos, não do prompt.
- **Dependências:** `policy-enforcement`, `retrieval-governance`.
- **Candidatura:** `harness` + `gov-doc`.

#### `escalation-policy.spec.md`
- **Camada:** governance · **Owner:** Governança · **Tenant-scope:** Global/inst. · **Proveniência:** `[PYR]` `[HE-GOV]`
- **Propósito:** definir quando a operação excede a fronteira de decisão e deve escalar ao humano.
- **Classe de operação:** escalação.
- **Contrato (NL):** ultrapassada a fronteira de decisão do agente, escala-se ao operador, preservando responsabilidade.
- **Verificação:** toda operação fora de fronteira gera escalada registrada; nenhuma é silenciosamente absorvida.
- **Dependências:** `operational-boundaries`.
- **Candidatura:** `harness` (escalation-harness).

#### `operational-boundaries.spec.md`
- **Camada:** governance · **Owner:** Governança · **Tenant-scope:** Global/inst. · **Proveniência:** `[HE-GOV]` `[PYR]`
- **Propósito:** declarar as fronteiras operacionais que restringem o espaço de ação do agente.
- **Classe de operação:** delimitação de fronteira.
- **Contrato (NL):** "restringir habilita autonomia"; o espaço de ação é deliberadamente estreitado por enforcement.
- **Verificação:** ações fora da fronteira são bloqueadas; a fronteira é verificável independentemente do agente.
- **Dependências:** `policy-enforcement`.
- **Candidatura:** `gov-doc` + `harness`.

### Grupo F — Agent Specs · Onda P4 (interface linguística)

#### `institutional-agent.spec.md`
- **Camada:** agents · **Owner:** Agents · **Tenant-scope:** Global/inst. · **Proveniência:** `[PYR]` `[CE]`
- **Propósito:** definir o agente como interface linguística institucional, não decisor autônomo.
- **Classe de operação:** interface / proposta.
- **Contrato (NL):** o agente recebe intenção e produz operação proposta (Metadata); a decisão é dos services, a execução das tools, a verdade do estado.
- **Verificação:** nenhuma operação é decidida/executada pelo agente; sua saída entra como proposta de menor prioridade.
- **Dependências:** `layer-authority-model`, `behavioral-governance`.
- **Candidatura:** `subagente` + `gov-doc`.

#### `agent-lifecycle.spec.md`
- **Camada:** agents · **Owner:** Agents · **Tenant-scope:** Global/inst. · **Proveniência:** `[PYR]`
- **Propósito:** definir criação, configuração, operação, versionamento e aposentadoria por specification.
- **Classe de operação:** ciclo-de-vida do agente.
- **Contrato (NL):** um agente nasce de specifications e policies versionadas, não de prompt avulso; mudança de estratégia gera nova versão.
- **Verificação:** todo agente tem specification, policies, corpus e perímetro versionados e coerentes.
- **Dependências:** `institutional-agent`, `tenant-configuration`.
- **Candidatura:** `subagente` + `gov-doc`.

#### `agent-memory.spec.md`
- **Camada:** agents · **Owner:** Agents/Estado · **Tenant-scope:** Per-tenant · **Proveniência:** `[PYR]` `[CE]`
- **Propósito:** definir como o agente administra memória como ambiente, isolada por tenant.
- **Classe de operação:** administração de memória.
- **Contrato (NL):** o agente não "lembra"; o estado persiste e o contexto é montado a cada operação; memória é isolada por tenant e por fatia de visibilidade.
- **Verificação:** continuidade vem do estado; memória respeita isolamento e proveniência.
- **Dependências:** `memory-model`, `context-isolation`.
- **Candidatura:** `subagente` + `service/tool`.

#### `agent-execution.spec.md`
- **Camada:** agents · **Owner:** Agents · **Tenant-scope:** Global/inst. · **Proveniência:** `[PYR]` `[HARNESS-RT]`
- **Propósito:** definir o papel do agente no ciclo governado — propõe, não salta etapas.
- **Classe de operação:** execução do agente (proposta).
- **Contrato (NL):** a proposta passa por enforcement pré, decisão, execução sob permissão, persistência e verificação; conclusão é objeto evidenciário.
- **Verificação:** nenhum salto de etapa; conclusão vinculada a evidência determinística.
- **Dependências:** `runtime-lifecycle`, `institutional-agent`.
- **Candidatura:** `subagente` + `harness`.

#### `agent-governance.spec.md`
- **Camada:** agents · **Owner:** Agents/Governança · **Tenant-scope:** Global/inst. · **Proveniência:** `[PYR]` `[HE-GOV]` `[CE]`
- **Propósito:** definir como RAG + XML + policies governam o agente e como o comportamento é rastreável.
- **Classe de operação:** governança do agente.
- **Contrato (NL):** o agente é governado, não confiado; comportamento reconstruível a partir de traces; eloquência (Metadata) não sobrepõe Authority.
- **Verificação:** comportamento auditável por trace; governança independente do que o agente "diz".
- **Dependências:** `behavioral-governance`, `agent-execution`.
- **Candidatura:** `harness` + `gov-doc`.

### Grupo G — Service / Tool Specs · Onda P3 (decisão e execução)

#### `service-contract.spec.md`
- **Camada:** services · **Owner:** Services · **Tenant-scope:** Global/inst. · **Proveniência:** `[PYR]`
- **Propósito:** definir que os services decidem a operação dentro do contrato de specification.
- **Classe de operação:** decisão institucional.
- **Contrato (NL):** toda decisão operacional passa por lógica institucional verificável, não por inferência livre.
- **Verificação:** nenhuma decisão atribuível ao modelo; cada decisão referencia seu contrato.
- **Dependências:** `operational-state`, `policy-enforcement`.
- **Candidatura:** `service/tool`.

#### `tool-registry.spec.md`
- **Camada:** tools · **Owner:** Execução · **Tenant-scope:** Global/inst. · **Proveniência:** `[HARNESS-RT]`
- **Propósito:** definir o registro de ferramentas disponíveis e suas fronteiras.
- **Classe de operação:** registro de execução.
- **Contrato (NL):** toda execução passa por uma tool registrada; o que não está no registro não executa.
- **Verificação:** execuções fora do registro são impossíveis/bloqueadas e auditadas.
- **Dependências:** `lightweight-runtime`.
- **Candidatura:** `service/tool` + `harness`.

#### `tool-execution.spec.md`
- **Camada:** tools · **Owner:** Execução · **Tenant-scope:** Global/inst. · **Proveniência:** `[PYR]` `[HARNESS-RT]`
- **Propósito:** definir a execução controlada (o modelo descreve a invocação; a tool executa).
- **Classe de operação:** execução.
- **Contrato (NL):** o modelo apenas descreve a invocação; a execução real, o tratamento do resultado e o próximo passo pertencem ao sistema.
- **Verificação:** nenhuma execução é feita pelo modelo; toda execução tem trace.
- **Dependências:** `tool-registry`, `tool-permission`.
- **Candidatura:** `service/tool`.

#### `tool-permission.spec.md`
- **Camada:** tools · **Owner:** Execução/Governança · **Tenant-scope:** Global/inst. · **Proveniência:** `[HARNESS-RT]`
- **Propósito:** definir a fronteira de permissão explícita por tool e por tenant.
- **Classe de operação:** permissão de execução.
- **Contrato (NL):** cada tool tem permissão explícita; a permissão é atenuada na delegação e particionada por tenant.
- **Verificação:** execução sem permissão é bloqueada; permissão só decresce na cadeia.
- **Dependências:** `tool-registry`, `tenant-boundary`.
- **Candidatura:** `service/tool` + `harness`.

#### `tool-result-verification.spec.md`
- **Camada:** tools · **Owner:** Execução/Observabilidade · **Tenant-scope:** Global/inst. · **Proveniência:** `[HARNESS-RT]`
- **Propósito:** definir verificação determinística do resultado da execução (verificação como runtime).
- **Classe de operação:** verificação.
- **Contrato (NL):** o resultado é verificado contra requisitos determinísticos, com atribuição antes de recuperação.
- **Verificação:** conclusão vinculada a evidência; diagnóstico separado da ação corretiva.
- **Dependências:** `tool-execution`, `verification-report`.
- **Candidatura:** `harness` (execution-harness).

### Grupo H — Observability Specs · Ondas P3–P5 (evidência)

#### `episode-trace.spec.md`
- **Camada:** observability · **Owner:** Observabilidade · **Tenant-scope:** Global/inst. · **Proveniência:** `[HARNESS-RT]` · **Onda:** P3
- **Propósito:** definir cada operação como episódio auditável com pacote de evidência.
- **Classe de operação:** rastreamento de episódio.
- **Contrato (NL):** toda operação produz um episódio reconstruível (entrada, contexto, decisão, execução, resultado).
- **Verificação:** qualquer operação é reconstruível a partir do seu episódio.
- **Dependências:** `runtime-lifecycle`, `event-driven-state`.
- **Candidatura:** `harness` (observability-harness).

#### `audit-log.spec.md`
- **Camada:** observability/governance · **Owner:** Observabilidade · **Tenant-scope:** Global/inst. · **Proveniência:** `[CE]` `[PYR]` · **Onda:** P3
- **Propósito:** definir a trilha de auditoria que se forma organicamente quando cada estágio preserva sua saída.
- **Classe de operação:** auditoria.
- **Contrato (NL):** nenhuma ação operacional ocorre sem trilha reconstruível; a trilha não é esforço documental à parte.
- **Verificação:** toda ação tem entrada de auditoria com proveniência.
- **Dependências:** `episode-trace`.
- **Candidatura:** `harness` (audit-harness) + `gov-doc`.

#### `failure-attribution.spec.md`
- **Camada:** observability · **Owner:** Observabilidade/Runtime · **Tenant-scope:** Global/inst. · **Proveniência:** `[HARNESS-RT]` · **Onda:** P3
- **Propósito:** atribuir falha antes de qualquer ação corretiva (reproduzir → atribuir → corrigir → verificar → reportar).
- **Classe de operação:** atribuição de falha.
- **Contrato (NL):** a atribuição precede a correção; diagnóstico é separado de ação para evitar remendos.
- **Verificação:** toda correção registra atribuição prévia.
- **Dependências:** `episode-trace`.
- **Candidatura:** `harness`.

#### `verification-report.spec.md`
- **Camada:** observability · **Owner:** Observabilidade · **Tenant-scope:** Global/inst. · **Proveniência:** `[HARNESS-RT]` · **Onda:** P3
- **Propósito:** definir a conclusão como objeto evidenciário, com requisitos mapeados a verificações.
- **Classe de operação:** relatório de verificação.
- **Contrato (NL):** conclusão = evidência (requisitos↔verificação, comportamento preservado, limitações reportadas), não asserção.
- **Verificação:** nenhuma conclusão sem relatório de evidência verificável.
- **Dependências:** `failure-attribution`.
- **Candidatura:** `harness`.

#### `entropy-audit.spec.md`
- **Camada:** observability · **Owner:** Observabilidade · **Tenant-scope:** Global/inst. · **Proveniência:** `[HARNESS-RT]` `[AHE]` · **Onda:** P5
- **Propósito:** detectar e registrar o ônus de manutenção introduzido por operações autônomas (resíduo, deriva, violação de fronteira).
- **Classe de operação:** auditoria de entropia.
- **Contrato (NL):** o sistema mede e registra a entropia que a autonomia introduz; ganho permanece atribuível.
- **Verificação:** deriva/resíduo/violação são detectáveis e registrados; o executor não desliga a própria fiscalização.
- **Dependências:** `verification-report`, `audit-log`.
- **Candidatura:** `harness` (audit-harness).

#### `intervention-log.spec.md`
- **Camada:** observability/governance · **Owner:** Observabilidade/Governança · **Tenant-scope:** Global/inst. · **Proveniência:** `[HARNESS-RT]` · **Onda:** P5
- **Propósito:** registrar intervenção humana (M-HIR) preservando a controlabilidade.
- **Classe de operação:** registro de intervenção.
- **Contrato (NL):** toda intervenção humana é registrada como evento auditável, com responsabilidade do operador preservada.
- **Verificação:** intervenções são reconstruíveis e atribuíveis; o verificador/tracer/config são read-only para o executor.
- **Dependências:** `escalation-policy`, `audit-log`.
- **Candidatura:** `harness` + `gov-doc`.

### Grupo I — Multi-Tenant Specs · Ondas P0–P2 (partição transversal)

#### `tenant-boundary.spec.md`
- **Camada:** tenant · **Owner:** Tenant · **Tenant-scope:** Per-tenant · **Proveniência:** `[PYR]` · **Onda:** P0
- **Propósito:** declarar a fronteira entre tenants como invariante de engenharia.
- **Classe de operação:** isolamento (fronteira).
- **Contrato (NL):** estado, contexto, memória e políticas são particionados por tenant; a fronteira não é configuração.
- **Verificação:** nenhum caminho atravessa a fronteira entre tenants.
- **Dependências:** `layer-authority-model`.
- **Candidatura:** `gov-doc` + `harness`.

#### `tenant-configuration.spec.md`
- **Camada:** tenant · **Owner:** Tenant · **Tenant-scope:** Per-tenant · **Proveniência:** `[PYR]` · **Onda:** P2
- **Propósito:** definir a configuração versionada de um tenant (specs, policies, corpus, perímetro).
- **Classe de operação:** configuração.
- **Contrato (NL):** a verticalização expressa-se por configuração declarada, sem alterar o núcleo de governança.
- **Verificação:** mudar um tenant não altera o núcleo; configuração é versionada e coerente.
- **Dependências:** `tenant-boundary`.
- **Candidatura:** `gov-doc` + `service/tool`.

#### `tenant-policy-pack.spec.md`
- **Camada:** tenant/governance · **Owner:** Tenant/Governança · **Tenant-scope:** Per-tenant · **Proveniência:** `[PYR]` `[HE-GOV]` · **Onda:** P2
- **Propósito:** definir o pacote de políticas específico do tenant (verticalização governada).
- **Classe de operação:** política por tenant.
- **Contrato (NL):** cada tenant tem seu pacote de policies aplicado por enforcement; o núcleo permanece estável.
- **Verificação:** policies de um tenant não vazam para outro; enforcement determinístico por tenant.
- **Dependências:** `policy-enforcement`, `tenant-configuration`.
- **Candidatura:** `gov-doc` + `harness`.

#### `tenant-retrieval-scope.spec.md`
- **Camada:** tenant/retrieval · **Owner:** Tenant/Retrieval · **Tenant-scope:** Per-tenant · **Proveniência:** `[PYR]` · **Onda:** P2
- **Propósito:** definir o escopo de retrieval por tenant (corpus e visibilidade).
- **Classe de operação:** escopo de recuperação.
- **Contrato (NL):** o retrieval recupera apenas dentro do corpus e da fatia de visibilidade do tenant.
- **Verificação:** nenhuma recuperação cruza o escopo do tenant.
- **Dependências:** `tenant-boundary`, `retrieval-governance`.
- **Candidatura:** `harness` + `gov-doc`.

### Grupo J — Harness Specs · Onda P5 (integração)

> Cada harness é o **substrato** que expõe, traça e governa os recursos correspondentes —
> distinto do framework de agente e do OS de agente; medeia, não contém o domínio. `[HARNESS-RT]`

#### `runtime-harness.spec.md`
- **Camada:** harness-engineering · **Owner:** Harness · **Tenant-scope:** Global · **Proveniência:** `[HARNESS-RT]`
- **Propósito:** substrato que cobre as onze responsabilidades de runtime.
- **Classe de operação:** substrato de coordenação.
- **Contrato (NL):** expõe interface de tarefa, contexto, ferramentas, memória, estado, observabilidade, atribuição, verificação, permissão, entropia e intervenção — sem deter autoridade comportamental.
- **Verificação:** as onze responsabilidades são cobertas e auditáveis; o harness não governa comportamento.
- **Dependências:** specs C (Runtime) + B (State).
- **Candidatura:** `harness`.

#### `governance-harness.spec.md`
- **Camada:** harness-engineering · **Owner:** Harness/Governança · **Tenant-scope:** Global/inst. · **Proveniência:** `[HE-GOV]`
- **Propósito:** substrato de enforcement determinístico (guidance↔enforcement).
- **Classe de operação:** substrato de governança.
- **Contrato (NL):** aplica policies pós-geração com independência de agente; guidance não substitui enforcement.
- **Verificação:** veredito pass/fail reproduzível; enforcement separado da linguagem.
- **Dependências:** specs E (Governance).
- **Candidatura:** `harness`.

#### `retrieval-harness.spec.md`
- **Camada:** harness-engineering · **Owner:** Harness/Retrieval · **Tenant-scope:** Per-tenant · **Proveniência:** `[PYR]` `[HARNESS-RT]`
- **Propósito:** substrato que executa o retrieval governado e com proveniência.
- **Classe de operação:** substrato de recuperação.
- **Contrato (NL):** recupera por política, com proveniência e tenant-scope; é a face contextual da governança.
- **Verificação:** nenhuma recuperação fora de política; proveniência completa.
- **Dependências:** specs D (Context/Retrieval) + `tenant-retrieval-scope`.
- **Candidatura:** `harness`.

#### `observability-harness.spec.md`
- **Camada:** harness-engineering · **Owner:** Harness/Observabilidade · **Tenant-scope:** Global/inst. · **Proveniência:** `[AHE]` `[HARNESS-RT]`
- **Propósito:** substrato dos três pilares (componente, experiência, decisão).
- **Classe de operação:** substrato de observabilidade.
- **Contrato (NL):** toda operação produz observabilidade; contratos falsificáveis e reversíveis em granularidade fina.
- **Verificação:** sucesso verificável e falha diagnosticável em qualquer operação.
- **Dependências:** `episode-trace`, `verification-report`.
- **Candidatura:** `harness`.

#### `audit-harness.spec.md`
- **Camada:** harness-engineering · **Owner:** Harness/Auditoria · **Tenant-scope:** Global/inst. · **Proveniência:** `[AHE]` `[CE]`
- **Propósito:** substrato de auditoria e do invariante de controlabilidade.
- **Classe de operação:** substrato de auditoria.
- **Contrato (NL):** trilha forma-se organicamente; quem executa não desliga a própria fiscalização (verificador/tracer/config read-only).
- **Verificação:** auditoria completa e não-desativável pelo executor.
- **Dependências:** `audit-log`, `entropy-audit`.
- **Candidatura:** `harness`.

#### `escalation-harness.spec.md`
- **Camada:** harness-engineering · **Owner:** Harness/Governança · **Tenant-scope:** Global/inst. · **Proveniência:** `[PYR]` `[HARNESS-RT]`
- **Propósito:** substrato que opera a escalação ao humano nas fronteiras de decisão.
- **Classe de operação:** substrato de escalação.
- **Contrato (NL):** ultrapassada a fronteira, escala-se ao operador, registrando a intervenção.
- **Verificação:** toda fronteira excedida gera escalada e registro.
- **Dependências:** `escalation-policy`, `intervention-log`.
- **Candidatura:** `harness`.

#### `execution-harness.spec.md`
- **Camada:** harness-engineering · **Owner:** Harness/Execução · **Tenant-scope:** Global/inst. · **Proveniência:** `[HARNESS-RT]` `[PYR]`
- **Propósito:** substrato que executa tools sob permissão e verifica o resultado.
- **Classe de operação:** substrato de execução.
- **Contrato (NL):** execução só via tool registrada, com permissão explícita, trace e verificação determinística do resultado.
- **Verificação:** nenhuma execução fora de permissão; resultado sempre verificado.
- **Dependências:** specs G (Service/Tool) + `tool-result-verification`.
- **Candidatura:** `harness`.

---

## 8. Dependências entre specifications

Cadeia de bloqueio (quem precisa existir antes de quem):

```
P0  core-operational-principles ─┬─> layer-authority-model ──> conflict-resolution
                                 └─> tenant-boundary
P1  layer-authority-model + tenant-boundary ──> operational-state ──> event-driven-state
                                                              └─> memory-model
                                  tenant-boundary + operational-state ──> tenant-state-isolation
P2  policy-enforcement ──> behavioral-governance ; operational-boundaries ──> escalation-policy
    context-assembly ──> context-lifecycle / context-isolation / context-provenance
    context-assembly + tenant-retrieval-scope ──> retrieval-governance
    tenant-boundary ──> tenant-configuration ──> tenant-policy-pack ; tenant-retrieval-scope
P3  operational-state + policy-enforcement ──> service-contract
    lightweight-runtime ──> tool-registry ──> tool-permission ──> tool-execution ──> tool-result-verification
    lightweight-runtime ──> runtime-lifecycle ──> runtime-orchestration ; runtime-permission-boundaries
    runtime-lifecycle + event-driven-state ──> episode-trace ──> audit-log / failure-attribution ──> verification-report
P4  institutional-agent ──> agent-lifecycle / agent-memory / agent-execution / agent-governance
P5  verification-report + audit-log ──> entropy-audit ; escalation-policy + audit-log ──> intervention-log
    (specs C/B) ──> runtime-harness ; (specs E) ──> governance-harness ; (specs D) ──> retrieval-harness
    episode-trace ──> observability-harness ; audit-log ──> audit-harness
    escalation-policy ──> escalation-harness ; (specs G) ──> execution-harness
```

**Specs fundacionais que bloqueiam outras:** `core-operational-principles`,
`layer-authority-model`, `conflict-resolution`, `tenant-boundary`, `operational-state`,
`policy-enforcement`, `lightweight-runtime`. Nenhuma spec de onda superior deve ser criada antes
das suas dependências de onda inferior.

---

## 9. Critérios de aceite por grupo

| Grupo | Critério de aceite (resumo) | Risco arquitetural que evita |
| --- | --- | --- |
| **A. Core** | Cada spec é um invariante verificável contra `principles.md`; conflito resolvido por ordem de valores | Erro de atribuição (creditar verdade ao modelo); colapso de camadas |
| **B. State** | Estado é fonte de verdade; continuidade sobrevive a sessão e troca de modelo; eventos auditáveis; isolado por tenant | Perda de continuidade; conversa virar verdade; mutação implícita |
| **C. Runtime** | Runtime sem autoridade comportamental; leve; ciclo governado; permissão explícita | Runtime pesado acumulando governança; workflow rígido |
| **D. Context/Retrieval** | Cinco critérios de contexto; retrieval orquestrado por política; proveniência por fragmento; isolamento | `context rot`; vazamento entre papéis; contexto monolítico |
| **E. Governance** | Enforcement determinístico e independente de agente; governança separada da linguagem | Governança probabilística no prompt; déficit de intenção (Klarna) |
| **F. Agent** | Agente propõe, nunca decide/executa; continuidade do estado; memória em quatro formas isoladas | Agente decidindo/executando; dependência da memória do modelo |
| **G. Service/Tool** | Backend decide; execução só via tool registrada com permissão e trace; resultado verificado | Execução fora de tool; modelo executando; conclusão por asserção |
| **H. Observability** | Toda operação produz observabilidade; conclusão evidenciária; executor não desliga fiscalização | Sucesso não verificável / falha não diagnosticável; auto-modificador irrestrito |
| **I. Multi-Tenant** | Fronteira inviolável; verticalização por specs/policies/retrieval sem tocar o núcleo | Vazamento entre tenants; verticalização alterando o núcleo |
| **J. Harness** | Componentes desacoplados e editáveis isoladamente; harness medeia, não contém domínio; 11 responsabilidades cobertas | Monólito distribuído com ilusão de independência; substrato contendo domínio |

---

## 10. Matriz: spec → camada → finalidade → dependências → saída esperada

| Spec | Camada | Finalidade | Dependências | Saída esperada |
| --- | --- | --- | --- | --- |
| core-operational-principles | foundation | invariantes do sistema | — | conformidade verificável |
| layer-authority-model | architecture | distribuição de autoridade | core-principles | ordem de autoridade auditável |
| conflict-resolution | foundation | arbitragem por valores | core-principles | resolução ordenável |
| operational-state | state | verdade operacional | authority, tenant-boundary | continuidade persistida |
| event-driven-state | state | transição por evento | operational-state | estado reconstruível |
| tenant-state-isolation | state/tenant | isolamento de estado | operational-state, tenant-boundary | zero vazamento |
| memory-model | state/agents | quatro memórias + Ref. Mestra | operational-state, event-state | memórias isoláveis |
| lightweight-runtime | runtime | coordenação leve | authority | runtime sem autoridade |
| runtime-lifecycle | runtime | ciclo governado | lightweight-runtime, op-state | episódio sem saltos |
| runtime-orchestration | runtime | orquestração desacoplada | runtime-lifecycle | componentes substituíveis |
| runtime-permission-boundaries | runtime | fronteira de permissão | lightweight-runtime, tool-permission | execução só com permissão |
| context-assembly | context-eng | montagem do pacote | op-state, authority | pacote com 5 critérios |
| context-lifecycle | context-eng | write/select/compress/isolate | context-assembly | descarte governado |
| retrieval-governance | context-eng | recuperação por política | context-assembly, tenant-retrieval | retrieval governado |
| context-isolation | context-eng | isolamento de contexto | context-assembly, tenant-state-iso | sem contaminação |
| context-provenance | context-eng | proveniência de fragmento | context-assembly | fragmentos rastreáveis |
| policy-enforcement | governance | enforcement determinístico | authority, conflict-resolution | veredito reproduzível |
| behavioral-governance | governance | intenção + comportamento | policy-enforcement, retrieval-gov | comportamento por policy |
| escalation-policy | governance | escalação na fronteira | operational-boundaries | escalada registrada |
| operational-boundaries | governance | fronteiras de ação | policy-enforcement | ação restringida |
| institutional-agent | agents | interface linguística | authority, behavioral-gov | proposta como Metadata |
| agent-lifecycle | agents | ciclo do agente | institutional-agent, tenant-config | agente versionado |
| agent-memory | agents | memória administrada | memory-model, context-isolation | memória isolada |
| agent-execution | agents | proposta no ciclo | runtime-lifecycle, inst-agent | sem saltos; evidência |
| agent-governance | agents | governança do agente | behavioral-gov, agent-execution | comportamento auditável |
| service-contract | services | decisão institucional | op-state, policy-enforcement | decisão verificável |
| tool-registry | tools | registro de execução | lightweight-runtime | execução só registrada |
| tool-execution | tools | execução controlada | tool-registry, tool-permission | execução com trace |
| tool-permission | tools | permissão por tool/tenant | tool-registry, tenant-boundary | permissão atenuada |
| tool-result-verification | tools | verificação do resultado | tool-execution, verification-report | conclusão por evidência |
| episode-trace | observability | episódio auditável | runtime-lifecycle, event-state | operação reconstruível |
| audit-log | observability/gov | trilha de auditoria | episode-trace | ação rastreável |
| failure-attribution | observability | atribuir antes de corrigir | episode-trace | correção atribuída |
| verification-report | observability | conclusão evidenciária | failure-attribution | relatório de evidência |
| entropy-audit | observability | auditoria de entropia | verification-report, audit-log | deriva registrada |
| intervention-log | observability/gov | registro de intervenção | escalation-policy, audit-log | intervenção atribuível |
| tenant-boundary | tenant | fronteira inviolável | authority | partição transversal |
| tenant-configuration | tenant | config versionada | tenant-boundary | verticalização declarada |
| tenant-policy-pack | tenant/gov | policies por tenant | policy-enforcement, tenant-config | enforcement por tenant |
| tenant-retrieval-scope | tenant/retrieval | escopo de retrieval | tenant-boundary, retrieval-gov | recuperação no escopo |
| runtime-harness | harness-eng | substrato de runtime | C + B | 11 responsabilidades |
| governance-harness | harness-eng | substrato de enforcement | E | veredito reproduzível |
| retrieval-harness | harness-eng | substrato de retrieval | D + tenant-retrieval | recuperação governada |
| observability-harness | harness-eng | substrato dos 3 pilares | episode-trace, verification | observabilidade total |
| audit-harness | harness-eng | substrato de auditoria | audit-log, entropy-audit | auditoria não-desativável |
| escalation-harness | harness-eng | substrato de escalação | escalation-policy, intervention | escalada operada |
| execution-harness | harness-eng | substrato de execução | G + tool-result-verif | execução verificada |

---

## 11. Matriz: spec → candidata a skill / subagente / harness / service-tool / governança documental

> Uma spec pode ter mais de uma candidatura futura. Esta matriz **não** decide as fases de
> skills/subagentes/harnesses — apenas as antecipa.

| Spec | skill | subagente | harness | service/tool | gov-doc |
| --- | :-: | :-: | :-: | :-: | :-: |
| core-operational-principles | | | | | ✓ |
| layer-authority-model | | | | | ✓ |
| conflict-resolution | | | | | ✓ |
| operational-state | | | | ✓ | ✓ |
| event-driven-state | | | | ✓ | ✓ |
| tenant-state-isolation | | | | ✓ | ✓ |
| memory-model | | | | ✓ | ✓ |
| lightweight-runtime | | | ✓ | | |
| runtime-lifecycle | | | ✓ | | |
| runtime-orchestration | | | ✓ | | |
| runtime-permission-boundaries | | | ✓ | | |
| context-assembly | ✓ | | ✓ | | |
| context-lifecycle | | | ✓ | | ✓ |
| retrieval-governance | | | ✓ | | |
| context-isolation | | | ✓ | | ✓ |
| context-provenance | | | ✓ | | ✓ |
| policy-enforcement | | | ✓ | | |
| behavioral-governance | | | ✓ | | ✓ |
| escalation-policy | | | ✓ | | |
| operational-boundaries | | | ✓ | | ✓ |
| institutional-agent | | ✓ | | | ✓ |
| agent-lifecycle | | ✓ | | | ✓ |
| agent-memory | | ✓ | | ✓ | |
| agent-execution | | ✓ | ✓ | | |
| agent-governance | | | ✓ | | ✓ |
| service-contract | | | | ✓ | |
| tool-registry | | | ✓ | ✓ | |
| tool-execution | | | | ✓ | |
| tool-permission | | | ✓ | ✓ | |
| tool-result-verification | | | ✓ | | |
| episode-trace | | | ✓ | | |
| audit-log | | | ✓ | | ✓ |
| failure-attribution | | | ✓ | | |
| verification-report | | | ✓ | | |
| entropy-audit | | | ✓ | | |
| intervention-log | | | ✓ | | ✓ |
| tenant-boundary | | | ✓ | | ✓ |
| tenant-configuration | | | | ✓ | ✓ |
| tenant-policy-pack | | | ✓ | | ✓ |
| tenant-retrieval-scope | | | ✓ | | ✓ |
| runtime-harness | | | ✓ | | |
| governance-harness | | | ✓ | | |
| retrieval-harness | | | ✓ | | |
| observability-harness | | | ✓ | | |
| audit-harness | | | ✓ | | |
| escalation-harness | | | ✓ | | |
| execution-harness | | | ✓ | | |

Leitura: a maioria das specs de infraestrutura é candidata a **harness**; as de estado/execução
a **service/tool**; as de agente a **subagente**; `context-assembly` é a principal candidata a
**skill**; as de núcleo/fronteira permanecem como **governança documental**.

---

## 12. Specs que NÃO devem existir agora

Para evitar avanço prematuro à implementação, as seguintes specs **não** entram neste mapa nem
devem ser criadas nesta fase:

- **Specs de implementação** (estrutura de código, módulos, classes).
- **Specs de schema / persistência física** (tabelas, índices, migrations).
- **Specs de API** (endpoints, contratos HTTP, payloads).
- **Specs de deploy / infraestrutura** (topologia, pipelines, ambientes).
- **Specs de UI / frontend / fluxos de tela.**
- **Mapa de skills, mapa de subagentes, implementation harness** — fases futuras próprias.
- **Os próprios arquivos `.spec.md`** — este documento os mapeia, não os cria.

---

## 13. Fora de escopo

Esta fase **não** produz: código · frontend · APIs · banco/schema · microservices · backlog ·
plano de implementação · mapa de skills · mapa de subagentes · implementation harness ·
contratos machine-readable · YAML/JSON formal · exemplos implementáveis reais · arquivos
`.spec.md` individuais. A arquitetura continua sendo o produto; este mapa é a ponte entre o PRD
e a futura criação controlada das specs.

---

## 14. Próximo checkpoint recomendado

Recomendação (sem iniciar): a **Fase 5** deve ser a **criação controlada das specs da Onda P0**
(`core-operational-principles`, `layer-authority-model`, `conflict-resolution`,
`tenant-boundary`) — as fundacionais que desbloqueiam todas as demais — uma a uma, com
checkpoint por spec. Só após a estabilização de P0 abre-se P1 (State), e assim por diante.

Alternativamente, se preferir manter o eixo de mapeamento antes de criar specs, o próximo marco
pode ser o **Mapa de Skills** ou o **Mapa de Subagentes** (também architecture-only), derivados
da coluna de candidatura da §11.

Em ambos os casos, **nada será criado** até autorização explícita da próxima fase.

---

## Conformidade com os princípios da fundação

| Princípio | Como este mapa o instancia |
| --- | --- |
| `P15` specifications governam contratos | Todo o mapa: cada classe de operação vira uma spec verificável |
| `P10` multi-tenant por desenho | Tenant-scope em cada card; grupo I transversal (§7, §9) |
| `P12` governança separada da linguagem | Grupo E e harness de governança; enforcement determinístico |
| `P8`/`P9` observabilidade e auditabilidade | Grupo H; critérios de aceite (§9) |
| `P1`/`P6` LLM/runtime sem autoridade | Grupos A e C; matriz de finalidade (§10) |
| `DO4` execução baseada em specification | Princípio de decomposição contract-first (§4) |

Conflitos entre specs: **ordem de valores** de
[`principles.md`](../foundation/principles.md), nunca a numeração.

---

## Fronteiras (o que NÃO está aqui)

- **Não** cria specs executáveis nem arquivos `.spec.md` — ver §12, §13.
- **Não** define schema, contrato machine-readable, YAML/JSON ou código.
- **Não** define o mapa de skills nem o de subagentes — fases futuras.
- **Não** substitui a camada [`specification-engineering/`](specification-philosophy.md): é o
  mapa que orienta a criação futura dos contratos detalhados nela.

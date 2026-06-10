# YZI OS — Mapa de Harnesses Operacionais

> **Documento de arquitetura (ponte).** Cataloga, classifica e estrutura os **harnesses
> operacionais futuros** do YZI OS — os substratos que vão **coordenar, restringir, verificar e
> auditar** a operação. Este documento **não** cria harnesses executáveis, implementation harness,
> código, configuração, schema ou contratos machine-readable: ele os **mapeia**. A arquitetura
> continua sendo o produto.
>
> Camada: `harness-engineering` · Status: canônico · Versão: v1 · Data: 2026-06-03
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]` (ver
> [`terminology.md`](../foundation/terminology.md))

---

## 1. Propósito do Mapa de Harnesses Operacionais

Este mapa responde a uma pergunta: **quais harnesses operacionais precisam existir para que o YZI
OS coordene, restrinja, verifique e audite a sua operação — e como cada um se governa, do que
depende e o que jamais lhe é permitido decidir?**

Ele transforma as oito camadas de arquitetura, o [PRD institucional](../prd/yzi-os-prd-v1.md), o
[Specification Map](../specification-engineering/specification-map.md), o
[Skill Map](../skills/skill-map.md) e o [Subagent Map](../subagents/subagent-map.md) em uma
**lista organizada e governada** de harnesses futuros. Para cada harness, fixa: papel, specs que o
governam, skills e subagentes dependentes, tools/services que coordena, evidências/traces que
produz, policies que aplica ou verifica, riscos arquiteturais que evita, tenant-scope, proveniência
teórica e fronteira (o que o harness **não** faz).

O mapa **não** contém harness implementável, código, configuração, YAML/JSON, schema ou contratos
machine-readable. É a **ponte** entre os mapas anteriores e a futura criação controlada dos
harnesses.

> **Nota de reconstrução (transparência).** O briefing da Fase 6 chegou com o trecho central
> truncado: a lista de perguntas e a lista de seções obrigatórias vieram renumeradas/cortadas
> (itens `1…11` repetidos) e o caminho do arquivo apareceu corrompido
> (`/docs/harneserational-harness-map.md`). A estrutura abaixo foi **reconstruída** a partir do
> padrão das Fases 4–5 e o caminho foi fixado conforme o bloco **CHECKPOINT**
> (`/docs/harness-engineering/operational-harness-map.md`). Sinalizado para correção, se necessário.

---

## 2. Relação com PRD, Specification Map, Skill Map e Subagent Map

| Artefato anterior | O que fixou | O que este mapa acrescenta |
| --- | --- | --- |
| [PRD](../prd/yzi-os-prd-v1.md) | o que o YZI OS é e como se governa (8 camadas, LLM sem autoridade) | os substratos que **operam** essa governança em tempo de execução |
| [Specification Map](../specification-engineering/specification-map.md) | 47 specs futuras; grupo J = 7 harness specs; coluna de candidatura `harness` | agrupa as specs candidatas em **harnesses concretos** e fixa quem governa cada um |
| [Skill Map](../skills/skill-map.md) | 9 skills (capacidades modulares) | de **qual harness** cada skill depende para operar sob governança |
| [Subagent Map](../subagents/subagent-map.md) | 6 subagentes (papéis especializados) | de **qual harness** cada subagente depende para coordenar e verificar |

Os artefatos anteriores permanecem autoridade; este mapa não os contradiz — apenas os integra na
camada de coordenação operacional. **Nenhum** dos mapas anteriores é modificado por esta fase
(salvo erro factual grave, que seria apenas reportado — nenhum foi encontrado).

---

## 3. Relação com Spec-Driven Development

Posição deste documento no caminho do projeto:

> PRD institucional → Specification Map → Skill Map → Subagent Map →
> **[ESTE: Mapa de Harnesses Operacionais]** → specs executáveis → harnesses → plano de
> implementação → código.

O mapa **orienta** as fases seguintes sem executá-las. Criar as specs executáveis, os harnesses
reais, o Implementation Harness e o plano de implementação são **fases futuras distintas**, fora do
escopo desta entrega.

---

## 4. Definição: o que é um harness operacional

> **Harness operacional** = **substrato de coordenação e governança que envolve o motor
> probabilístico (LLM) e os componentes da operação, impondo o invariante**
> `C_sistema = F(C_modelo, C_harness, C_ambiente, T)`. **Ele coordena, restringe, verifica e
> audita a execução — expõe interfaces, aplica fronteiras, produz evidência — sem deter autoridade
> sobre a verdade operacional (estado), sobre a decisão institucional (services) ou sobre a
> governança comportamental (policies/RAG/XML). O harness medeia; não contém o domínio.**
> `[HARNESS-RT]`

A confiança do sistema migra do modelo para a arquitetura: *"Confie na arquitetura, não no
modelo"* `[CE]`. O harness é o lugar onde essa confiança é **operacionalizada** — onde o
comportamento probabilístico do modelo é envolvido por coordenação, restrição e verificação
determinísticas.

**Um harness operacional NÃO é:**

- **NÃO** é o runtime — o runtime é leve e coordena dentro do harness; o harness é o substrato que
  expõe, restringe e traça (um runtime pode operar dentro de um ou mais harnesses). `[HARNESS-RT]`
- **NÃO** é um agente, persona ou chatbot — não fala, não decide, não tem voz.
- **NÃO** é uma skill nem um subagente — não é capacidade modular nem papel; é o substrato sob o
  qual skills e subagentes operam.
- **NÃO** é uma tool nem um service — não decide a operação (service) nem executa o efeito (tool);
  coordena e verifica essas execuções.
- **NÃO** é uma policy — não é a regra; é o substrato que **aplica e verifica** o cumprimento da
  regra de forma determinística.
- **NÃO** é o Implementation Harness / Spec Executor Harness — esse é futuro, não especificado e
  fora desta fase (§17).
- **NÃO** detém autoridade comportamental — restringe e verifica, mas **não decide a verdade
  operacional**.

---

## 5. Diferença entre harness, runtime, skill, subagente, tool, service e policy

| Conceito | É… | Autoridade | Decide verdade? | Governa comportamento? | Executa efeito? | Proveniência |
| --- | --- | --- | --- | --- | --- | --- |
| **Estado** | verdade operacional persistida | **máxima** | **sim** (fonte de verdade) | não | não | `[PYR]` `[CE]` |
| **Service** | lógica institucional de decisão | alta (dentro de contrato) | decide a operação | não | não | `[PYR]` |
| **Policy/RAG/XML** | regra de governança comportamental | governança | não | **sim** | não | `[HE-GOV]` `[CE]` |
| **Harness** | substrato de coordenação/verificação/auditoria | **nenhuma sobre a verdade** | **não** | **aplica/verifica**, não define | coordena, não executa | `[HARNESS-RT]` |
| **Runtime** | coordenação leve dentro do harness | nenhuma | não | não | orquestra | `[HARNESS-RT]` |
| **Subagente** | papel operacional especializado | limitada e explícita | propõe/verifica | não | não | `[PYR]` |
| **Skill** | capacidade modular reutilizável | nenhuma | não | não | não | `[CE]` `[PYR]` |
| **Tool** | execução controlada de efeito | nenhuma | não | não | **sim** (sob permissão) | `[HARNESS-RT]` |
| **LLM** | motor probabilístico | **mínima** | não | não | não | `[CE]` |

Leitura: o **harness** ocupa uma posição única — não decide, não governa por si, não executa o
efeito; ele é o **substrato** onde verdade (estado), decisão (service), governança (policy),
execução (tool), coordenação (runtime), papel (subagente) e capacidade (skill) se encontram **sob
restrição e evidência**. É a materialização operacional do invariante
`C_sistema = F(C_modelo, C_harness, C_ambiente, T)`.

---

## 6. Papel dos harnesses operacionais no YZI OS

Os harnesses cumprem quatro funções, nunca uma quinta:

1. **Coordenar** — montar o episódio, rotear, sequenciar etapas, compor contexto, orquestrar
   tools/services e skills/subagentes, **sem decidir** o que é permitido nem o que é verdadeiro.
   `[HARNESS-RT]`
2. **Restringir** — aplicar fronteiras determinísticas (permissão, escopo de tenant, espaço de
   ação), reduzindo o espaço de escolha do modelo. *"Restringir habilita autonomia."* `[HE-GOV]`
3. **Verificar** — checar conformidade pós-geração (enforcement), verificar resultado de execução
   e atribuir falha antes de qualquer correção. `[HARNESS-RT]` `[AHE]`
4. **Auditar** — produzir traces, episode packages, evidências e registros de decisão; preservar o
   invariante de controlabilidade (quem executa não desliga a própria fiscalização). `[AHE]` `[CE]`

O que os harnesses **não** fazem: não detêm verdade (estado), não decidem a operação (services),
não definem a regra de comportamento (policies), não executam o efeito (tools), não falam
(agentes). Eles são o **substrato** que torna a operação coordenada, restrita, verificável e
auditável — preservando o LLM como motor sem autoridade.

---

## 7. Critérios de promoção a harness

Um substrato só é promovido a **harness operacional** quando satisfaz todos os critérios:

1. **Responsabilidade de substrato, não de domínio.** Coordena/restringe/verifica/audita uma
   classe de operação — **não** contém a lógica de decisão nem a verdade do domínio. `[HARNESS-RT]`
2. **Governado por specification.** Existe (ou está mapeada) ao menos uma spec que o governa; sem
   contrato verificável, não há harness (contract-first). `[PYR]` (`DO4`)
3. **Sem autoridade sobre a verdade operacional.** Não decide o que é verdadeiro nem o que é
   permitido por si; aplica decisões/políticas vindas de estado/services/policies.
4. **Produz evidência obrigatória.** Toda operação que atravessa o harness gera trace/evidência;
   *nenhuma execução sem trace*. `[AHE]`
5. **Respeita o isolamento multi-tenant.** Opera dentro do tenant-scope; a fronteira é invariante,
   não configuração. `[PYR]` (`P10`)
6. **Desacoplável e editável isoladamente.** Pode ser substituído sem romper os demais — evita o
   "monólito distribuído com ilusão de independência". `[HARNESS-RT]`
7. **Não-desativável pelo que ele fiscaliza.** O substrato de verificação/auditoria é read-only
   para o executor (independência do auditor; invariante de controlabilidade). `[AHE]` `[CE]`

---

## 8. Taxonomia de harnesses operacionais

Nove harnesses operacionais futuros, derivados da taxonomia sugerida na Fase 6 (mantida porque é
coerente com as oito camadas e com o grupo J do Specification Map). Mais o **Implementation Harness
/ Spec Executor Harness**, citado apenas como direção futura (§17).

| # | Harness | Função primária | Onda (Spec Map) | Classe |
| --- | --- | --- | --- | --- |
| 1 | **Runtime Harness** | coordenação do episódio (substrato-guarda-chuva) | P5 | fundacional |
| 2 | **Governance Harness** | enforcement determinístico de policies/specs | P5 | fundacional |
| 3 | **Observability Harness** | produção de traces, episódios e evidência | P5 | fundacional |
| 4 | **Tenant Harness** | escopo, isolamento e policy pack multi-tenant | P5 (raiz P0) | fundacional |
| 5 | **Execution Harness** | execução controlada de tools/services + verificação | P5 | fundacional |
| 6 | **Context Harness** | composição, lifecycle e proveniência de contexto | P5 | posterior |
| 7 | **Retrieval Harness** | recuperação governada, isolada e com proveniência | P5 | posterior |
| 8 | **Audit Harness** | auditor independente, atribuição de falha, entropia | P5 | posterior |
| 9 | **Escalation Harness** | gatilhos, fronteiras e protocolos de escalação | P5 | posterior |
| — | *Implementation / Spec Executor Harness* | *executar specs aprovadas* | *futuro* | *não especificado (§17)* |

> Por que todos em P5 no Specification Map: harnesses **integram** specs de ondas anteriores; só
> estabilizam depois que estado, governança, contexto, execução e observabilidade existem. A
> distinção **fundacional vs posterior** abaixo é interna ao domínio de harnesses (§14–§15).

---

## 9. Harnesses mapeados

> Campos de cada card: **Papel · Specs que governam · Skills dependentes · Subagentes dependentes ·
> Tools/services coordenados · Evidências/traces · Policies aplicadas/verificadas · Riscos evitados
> · Tenant-scope · Proveniência · Fronteira (o que NÃO faz).**
> Tenant-scope: **Global** = invariante cross-tenant · **Per-tenant** = particionado ·
> **Global/inst.** = definição global, instância por tenant.

### 9.1 `runtime-harness` — Substrato de coordenação (guarda-chuva)

- **Papel:** coordenar o episódio operacional ponta a ponta — montar contexto, rotear, sequenciar
  o ciclo governado, orquestrar componentes desacoplados — **sem** deter autoridade comportamental.
  É o substrato que **compõe** os demais harnesses (cobre as onze responsabilidades de runtime).
- **Specs que governam:** `lightweight-runtime`, `runtime-lifecycle`, `runtime-orchestration`,
  `runtime-permission-boundaries`; integra `operational-state`, `event-driven-state`; consolidada
  em `runtime-harness.spec.md`.
- **Skills dependentes:** `intent-extraction`, `context-assembly`, `synthesis` (executam **dentro**
  do ciclo que ele coordena).
- **Subagentes dependentes:** `interface-subagent` (entrada do episódio); coordena todos os demais.
- **Tools/services coordenados:** state service; orquestração de runtime; delega execução real ao
  `execution-harness` e governança ao `governance-harness`.
- **Evidências/traces:** episode package (via `observability-harness`), traces de ciclo de vida,
  decisões de roteamento, ordem de etapas.
- **Policies aplicadas/verificadas:** `runtime-permission-boundaries` (fronteira pré-execução);
  delega enforcement comportamental ao `governance-harness`.
- **Riscos evitados:** runtime pesado acumulando governança; workflow rígido; salto de etapas do
  ciclo; lógica institucional embutida na coordenação.
- **Tenant-scope:** Global (opera sempre dentro do `tenant-harness`). · **Proveniência:** `[HARNESS-RT]`.
- **Fronteira (NÃO faz):** não decide verdade, não governa comportamento, não executa efeito, não
  recupera nem audita por si — delega a estado/services/policies/tools e aos harnesses
  especializados.

### 9.2 `governance-harness` — Substrato de enforcement

- **Papel:** aplicar policies/specifications de forma **determinística e independente de agente**
  (Enforcement, pós-geração), reduzindo o espaço de escolha e verificando conformidade.
- **Specs que governam:** `policy-enforcement`, `behavioral-governance`, `operational-boundaries`;
  consolidada em `governance-harness.spec.md`.
- **Skills dependentes:** nenhuma *produz* governança; ele **governa** o envelope em que
  `intent-extraction` e `synthesis` operam (guidance ≠ enforcement).
- **Subagentes dependentes:** governa todos; opera junto ao `verification-subagent`.
- **Tools/services coordenados:** `service-contract` (decisão dentro de contrato); não executa
  tools.
- **Evidências/traces:** vereditos pass/fail reproduzíveis, registros de conformidade com policy,
  violações bloqueadas.
- **Policies aplicadas/verificadas:** `behavioral-governance`, `operational-boundaries`,
  `tenant-policy-pack` (via `tenant-harness`).
- **Riscos evitados:** governança probabilística no prompt; déficit duplo (intenção sem contexto /
  contexto sem intenção); agente governando a si mesmo.
- **Tenant-scope:** Global/inst. · **Proveniência:** `[HE-GOV]`.
- **Fronteira (NÃO faz):** não define a regra (isso é policy/spec), não decide a operação (service),
  não fala; aplica e verifica.

### 9.3 `observability-harness` — Substrato de evidência

- **Papel:** produzir os três pilares de observabilidade (componente, experiência, decisão) —
  traces, episode packages, logs, registros de decisão, relatórios de verificação. Materializa
  *"nenhuma execução sem trace"*.
- **Specs que governam:** `episode-trace`, `verification-report`; integra `failure-attribution`;
  consolidada em `observability-harness.spec.md`.
- **Skills dependentes:** `evidence-compilation` (compila evidência), `failure-diagnosis` (consome
  traces).
- **Subagentes dependentes:** `verification-subagent`, `synthesis-subagent`.
- **Tools/services coordenados:** armazenamento de traces e de episode packages (abstratos).
- **Evidências/traces:** **é o produtor** — episode packages reconstruíveis, logs deduplicados,
  registros de decisão, relatórios de verificação (conclusão = evidência, não asserção).
- **Policies aplicadas/verificadas:** observabilidade obrigatória; contratos falsificáveis e
  reversíveis em granularidade fina.
- **Riscos evitados:** sucesso não verificável / falha não diagnosticável; execução sem trace;
  conclusão por asserção.
- **Tenant-scope:** Global/inst. · **Proveniência:** `[AHE]` `[HARNESS-RT]`.
- **Fronteira (NÃO faz):** não decide, não corrige (apenas registra/atribui), não governa
  comportamento.

### 9.4 `tenant-harness` — Substrato de isolamento multi-tenant

- **Papel:** garantir escopo, isolamento, policy pack e fronteiras multi-tenant **durante** a
  operação; o isolamento é invariante de engenharia, não configuração.
- **Specs que governam:** `tenant-boundary` (raiz P0), `tenant-configuration`,
  `tenant-policy-pack`, `tenant-retrieval-scope`, `tenant-state-isolation`.
- **Skills dependentes:** nenhuma *produz*; **restringe** todas (toda skill opera dentro de um
  tenant-scope).
- **Subagentes dependentes:** restringe todos (todo papel é particionado por tenant).
- **Tools/services coordenados:** serviço de configuração de tenant; carregador de policy pack.
- **Evidências/traces:** asserção de tenant-scope por operação, resultados de teste de isolamento,
  provas de ausência de vazamento cross-tenant.
- **Policies aplicadas/verificadas:** `tenant-boundary` (invariante), `tenant-policy-pack`
  (verticalização governada por tenant).
- **Riscos evitados:** vazamento entre tenants; verticalização alterando o núcleo; fronteira
  tratada como mera configuração.
- **Tenant-scope:** Per-tenant (é o substrato da partição). · **Proveniência:** `[PYR]`.
- **Fronteira (NÃO faz):** não decide o conteúdo da operação; apenas impõe e verifica a fronteira e
  o pacote de políticas de cada tenant.

### 9.5 `execution-harness` — Substrato de execução controlada

- **Papel:** coordenar a execução de tools/services sob **permissão explícita**, com gates,
  tratamento de side effects e **verificação determinística do resultado**.
- **Specs que governam:** `tool-registry`, `tool-execution`, `tool-permission`,
  `tool-result-verification`; consolidada em `execution-harness.spec.md`.
- **Skills dependentes:** nenhuma executa (skills não têm efeito); `evidence-compilation` verifica
  resultados produzidos.
- **Subagentes dependentes:** `execution-proposal-subagent` (propõe execução; o harness aplica o
  gate e verifica).
- **Tools/services coordenados:** todas as tools registradas; decisões de `service-contract`;
  gates de permissão.
- **Evidências/traces:** traces de execução, verificação de resultado, registros de side effect,
  concessões de permissão.
- **Policies aplicadas/verificadas:** `tool-permission`, `runtime-permission-boundaries`; atenuação
  de privilégio na delegação.
- **Riscos evitados:** execução fora de tool registrada; modelo executando; conclusão por asserção;
  side effect sem trace.
- **Tenant-scope:** Global/inst. · **Proveniência:** `[HARNESS-RT]` `[PYR]`.
- **Fronteira (NÃO faz):** não decide *se* deve executar (isso é decisão de service sob policy);
  apenas executa o que foi permitido e verifica o resultado.

### 9.6 `context-harness` — Substrato de contexto

- **Papel:** coordenar composição, lifecycle (write/select/compress/isolate), isolamento e
  proveniência do contexto, com os cinco critérios (relevância, suficiência, isolamento, economia,
  proveniência) e a prioridade Authority › Exemplar › Constraint › Rubric › Metadata.
- **Specs que governam:** `context-assembly`, `context-lifecycle`, `context-isolation`,
  `context-provenance`.
- **Skills dependentes:** `context-assembly`, `context-curation`, `provenance-tagging`.
- **Subagentes dependentes:** `interface-subagent`, `retrieval-subagent` (consomem o pacote de
  contexto).
- **Tools/services coordenados:** armazenamento e compressão de contexto (abstratos).
- **Evidências/traces:** proveniência por fragmento, traces de lifecycle (origem/tempo de
  vida/descarte), registros de isolamento.
- **Policies aplicadas/verificadas:** cinco critérios de contexto; Paradoxo do Metadado (prompt =
  menor prioridade); isolamento por papel.
- **Riscos evitados:** *context rot*; contaminação de contexto entre papéis; contexto monolítico;
  violação da ordem de autoridade do pacote.
- **Tenant-scope:** Per-tenant · **Proveniência:** `[CE]` `[PYR]`.
- **Fronteira (NÃO faz):** não recupera do corpus (isso é `retrieval-harness`), não decide, não
  governa comportamento; monta e isola contexto.

### 9.7 `retrieval-harness` — Substrato de recuperação governada

- **Papel:** executar a recuperação contextual **governada por policy**, com isolamento por tenant,
  proveniência por fragmento e defesa contra injeção. É a **face contextual da governança**.
- **Specs que governam:** `retrieval-governance`, `context-provenance`, `context-isolation`,
  `tenant-retrieval-scope`; consolidada em `retrieval-harness.spec.md`.
- **Skills dependentes:** `retrieval-query`, `provenance-tagging`, `context-curation`.
- **Subagentes dependentes:** `retrieval-subagent`.
- **Tools/services coordenados:** serviços de recuperação/corpus; índice (abstrato), sempre dentro
  do escopo do tenant.
- **Evidências/traces:** proveniência por fragmento, traces de decisão de recuperação, registros de
  defesa contra injeção.
- **Policies aplicadas/verificadas:** `retrieval-governance`, `tenant-retrieval-scope`; política
  anti-injeção.
- **Riscos evitados:** recuperação ad hoc; vazamento cross-tenant; injeção via conteúdo recuperado;
  retrieval como operação não-governada.
- **Tenant-scope:** Per-tenant · **Proveniência:** `[PYR]` `[CE]`.
- **Fronteira (NÃO faz):** não monta o pacote final de contexto (isso é `context-harness`), não
  decide, não governa por si; recupera sob política e proveniência.

### 9.8 `audit-harness` — Substrato de auditoria

- **Papel:** garantir **auditor independente**, atribuição de falha (reproduzir → atribuir →
  corrigir → verificar → reportar), auditoria de entropia e o **invariante de controlabilidade**
  (quem executa não desliga a própria fiscalização).
- **Specs que governam:** `audit-log`, `entropy-audit`, `intervention-log`; consolidada em
  `audit-harness.spec.md`.
- **Skills dependentes:** `failure-diagnosis` (atribuição antes da correção).
- **Subagentes dependentes:** `verification-subagent` (auditor independente; executor ≠ auditor).
- **Tools/services coordenados:** armazenamento de trilha de auditoria (read-only para o executor).
- **Evidências/traces:** trilha de auditoria orgânica, registros de entropia (deriva/resíduo/
  violação de fronteira), atribuição de falha, registros de intervenção (M-HIR).
- **Policies aplicadas/verificadas:** independência do auditor; invariante de controlabilidade
  (verificador/tracer/config read-only para o executor).
- **Riscos evitados:** executor desligando a própria fiscalização; auto-modificador irrestrito;
  falha não-atribuível; remendo antes do diagnóstico.
- **Tenant-scope:** Global/inst. · **Proveniência:** `[AHE]` `[CE]`.
- **Fronteira (NÃO faz):** não executa, não corrige (atribui e registra), não governa
  comportamento; audita e preserva controlabilidade.

### 9.9 `escalation-harness` — Substrato de escalação

- **Papel:** definir e operar gatilhos, fronteiras e protocolos de **escalação humana ou
  institucional**, preservando a responsabilidade do operador quando a operação excede a fronteira
  de decisão do agente.
- **Specs que governam:** `escalation-policy`, `operational-boundaries`, `intervention-log`;
  consolidada em `escalation-harness.spec.md`.
- **Skills dependentes:** `escalation-trigger`.
- **Subagentes dependentes:** `escalation-subagent`.
- **Tools/services coordenados:** handoff humano / notificação (abstratos); serviço de registro de
  intervenção.
- **Evidências/traces:** eventos de escalação, registro de intervenção (M-HIR), registros de
  fronteira excedida.
- **Policies aplicadas/verificadas:** `escalation-policy`, `operational-boundaries`;
  responsabilidade humana preservada.
- **Riscos evitados:** fronteira excedida silenciosamente absorvida; perda de autoridade humana;
  autonomia sem boundary/permissionamento/verificação.
- **Tenant-scope:** Global/inst. · **Proveniência:** `[PYR]` `[HE-GOV]`.
- **Fronteira (NÃO faz):** não decide o mérito da operação escalada; detecta a fronteira, escala e
  registra.

---

## 10. Matriz: harness → specs que o governam

| Harness | Specs governantes (Specification Map) | Spec consolidadora (grupo J) |
| --- | --- | --- |
| runtime-harness | lightweight-runtime, runtime-lifecycle, runtime-orchestration, runtime-permission-boundaries, operational-state, event-driven-state | `runtime-harness.spec.md` |
| governance-harness | policy-enforcement, behavioral-governance, operational-boundaries | `governance-harness.spec.md` |
| observability-harness | episode-trace, verification-report, failure-attribution | `observability-harness.spec.md` |
| tenant-harness | tenant-boundary, tenant-configuration, tenant-policy-pack, tenant-retrieval-scope, tenant-state-isolation | — (transversal; raiz `tenant-boundary` P0) |
| execution-harness | tool-registry, tool-execution, tool-permission, tool-result-verification | `execution-harness.spec.md` |
| context-harness | context-assembly, context-lifecycle, context-isolation, context-provenance | — (substrato extraído do runtime) |
| retrieval-harness | retrieval-governance, context-provenance, context-isolation, tenant-retrieval-scope | `retrieval-harness.spec.md` |
| audit-harness | audit-log, entropy-audit, intervention-log | `audit-harness.spec.md` |
| escalation-harness | escalation-policy, operational-boundaries, intervention-log | `escalation-harness.spec.md` |

---

## 11. Matriz: harness → skills/subagentes relacionados → papel

| Harness | Skills dependentes | Subagentes dependentes | Papel da relação |
| --- | --- | --- | --- |
| runtime-harness | intent-extraction, context-assembly, synthesis | interface-subagent (+ coordena todos) | coordena o episódio onde skills/subagentes operam |
| governance-harness | — (governa o envelope) | verification-subagent (+ governa todos) | aplica enforcement sobre o que skills/subagentes produzem |
| observability-harness | evidence-compilation, failure-diagnosis | verification-subagent, synthesis-subagent | produz a evidência que skills/subagentes consomem |
| tenant-harness | — (restringe todas) | — (restringe todos) | impõe o tenant-scope a toda skill/subagente |
| execution-harness | evidence-compilation (verifica resultado) | execution-proposal-subagent | executa sob permissão a proposta do subagente |
| context-harness | context-assembly, context-curation, provenance-tagging | interface-subagent, retrieval-subagent | monta/isola o contexto que skills/subagentes recebem |
| retrieval-harness | retrieval-query, provenance-tagging, context-curation | retrieval-subagent | recupera, com proveniência, o que alimenta o contexto |
| audit-harness | failure-diagnosis | verification-subagent (auditor independente) | audita skills/subagentes sem ser desativável por eles |
| escalation-harness | escalation-trigger | escalation-subagent | opera a escalação detectada por skill/subagente |

---

## 12. Matriz: harness → evidências/traces esperados

| Harness | Evidências/traces produzidos |
| --- | --- |
| runtime-harness | traces de ciclo de vida, decisões de roteamento, ordem de etapas do episódio |
| governance-harness | vereditos pass/fail reproduzíveis, registros de conformidade, violações bloqueadas |
| observability-harness | episode packages, logs deduplicados, registros de decisão, relatórios de verificação |
| tenant-harness | asserção de tenant-scope por operação, testes de isolamento, provas de não-vazamento |
| execution-harness | traces de execução, verificação de resultado, registros de side effect, concessões de permissão |
| context-harness | proveniência por fragmento, traces de lifecycle (origem/vida/descarte), registros de isolamento |
| retrieval-harness | proveniência por fragmento, traces de decisão de recuperação, registros anti-injeção |
| audit-harness | trilha de auditoria orgânica, registros de entropia, atribuição de falha, registros de intervenção |
| escalation-harness | eventos de escalação, registro de intervenção (M-HIR), registros de fronteira excedida |

---

## 13. Matriz: harness → policies/constraints aplicáveis

| Harness | Policies/constraints aplicadas ou verificadas |
| --- | --- |
| runtime-harness | runtime-permission-boundaries (fronteira pré-execução); delega enforcement ao governance-harness |
| governance-harness | behavioral-governance, operational-boundaries, tenant-policy-pack; guidance ≠ enforcement |
| observability-harness | observabilidade obrigatória; contratos falsificáveis e reversíveis |
| tenant-harness | tenant-boundary (invariante), tenant-policy-pack (verticalização por tenant) |
| execution-harness | tool-permission, runtime-permission-boundaries; atenuação de privilégio |
| context-harness | cinco critérios de contexto; Paradoxo do Metadado; isolamento por papel |
| retrieval-harness | retrieval-governance, tenant-retrieval-scope; política anti-injeção |
| audit-harness | independência do auditor; invariante de controlabilidade (read-only ao executor) |
| escalation-harness | escalation-policy, operational-boundaries; responsabilidade humana preservada |

---

## 14. Harnesses fundacionais

Os harnesses **fundacionais** são aqueles sem os quais **nenhuma operação governada** pode ocorrer
— estabelecem os invariantes de coordenação, enforcement, evidência, isolamento e execução
controlada:

1. **`runtime-harness`** — sem coordenação não há episódio; é o substrato-guarda-chuva.
2. **`governance-harness`** — sem enforcement determinístico, a governança vaza para o prompt.
3. **`observability-harness`** — *nenhuma execução sem trace*; sem evidência não há auditabilidade.
4. **`tenant-harness`** — multi-tenant por desenho; o isolamento é invariante desde P0
   (`tenant-boundary`).
5. **`execution-harness`** — assim que a primeira tool é introduzida, nenhuma execução pode ocorrer
   fora de permissão e verificação.

Esses cinco materializam, juntos, os valores de maior prioridade da resolução de conflitos: verdade
operacional, segurança, isolamento multi-tenant e auditabilidade.

---

## 15. Harnesses posteriores

Entram quando a fundação estabiliza e a maturidade do sistema os justifica — evitando decomposição
prematura ("monólito distribuído com ilusão de independência"):

6. **`context-harness`** — a composição de contexto **começa embutida** no `runtime-harness` e é
   **promovida a substrato próprio** quando lifecycle/compressão/isolamento exigem evolução
   independente.
7. **`retrieval-harness`** — depende de corpus/RAG maduros e de `tenant-retrieval-scope` estável;
   só então a recuperação governada vira substrato dedicado.
8. **`audit-harness`** — auditoria de entropia e auditor independente são preocupações de
   **maturidade** (Onda P5): entram quando há volume de operação autônoma a fiscalizar.
9. **`escalation-harness`** — protocolos de escalação humana ganham substrato próprio quando as
   fronteiras de decisão e os fluxos de intervenção estão estabilizados.

> A promoção de cada harness posterior é **architecture-only** até autorização: este mapa indica
> *quando* e *por quê*, não *como*.

---

## 16. Conjunto mínimo inicial recomendado

Para sair da fundação sem violar nenhum invariante, o conjunto mínimo viável de harnesses é:

| Harness | Por que é mínimo |
| --- | --- |
| **`runtime-harness`** | nenhuma operação ocorre sem coordenação do episódio |
| **`governance-harness`** | sem enforcement determinístico, comportamento volta a ser confiado ao modelo |
| **`observability-harness`** | *nenhuma execução sem trace* — pré-requisito de auditabilidade |
| **`tenant-harness`** | isolamento multi-tenant é invariante, não opcional |

**`execution-harness`** entra **imediatamente** assim que a primeira tool/serviço com efeito for
introduzido (até lá, não há execução a controlar). Os demais (`context`, `retrieval`, `audit`,
`escalation`) são posteriores (§15).

Este conjunto mínimo espelha a ordem de valores da resolução de conflitos: **verdade operacional ›
segurança › isolamento multi-tenant › auditabilidade** — antes de qualquer otimização de contexto,
recuperação ou escalação.

---

## 17. Harnesses que NÃO devem existir agora

- **Implementation Harness / Spec Executor Harness** — citado **apenas como direção futura**.
  Status nesta fase: **futuro · não especificado · não executável · dependente de specs P0
  aprovadas · dependente deste mapa de harnesses aprovado.** **Não** são criados detalhes
  operacionais implementáveis para ele.
- **Qualquer harness executável** — esta fase mapeia, não constrói.
- **Harnesses de implementação** (estrutura de código, módulos, runtime real).
- **Harnesses de deploy / infraestrutura / pipeline.**
- **Harnesses de API / schema / persistência física.**
- **Harnesses de UI / frontend.**
- **Plano de implementação, backlog, configuração, YAML/JSON, contratos machine-readable.**

---

## 18. Riscos arquiteturais (domínio harnesses)

| Risco | Descrição | Harness/critério que o evita |
| --- | --- | --- |
| **Harness com autoridade** | substrato decidindo verdade/comportamento | def. §4; critério 3; runtime/governance separados |
| **Monólito distribuído** | harnesses acoplados com ilusão de independência | critério 6 (desacoplável e editável isoladamente) |
| **Substrato contendo domínio** | harness embutindo lógica de decisão | critério 1; fronteira de cada card (§9) |
| **Decomposição prematura** | extrair context/retrieval/audit/escalation cedo demais | §15 (posteriores; context começa no runtime) |
| **Execução sem trace** | efeito sem evidência | observability-harness; critério 4 |
| **Executor fiscalizando a si** | quem executa desligando a auditoria | audit-harness; critério 7 (read-only ao executor) |
| **Vazamento cross-tenant** | operação atravessando a fronteira de tenant | tenant-harness; critério 5 |
| **Governança no prompt** | enforcement virando guidance probabilístico | governance-harness; guidance ≠ enforcement |
| **Injeção via retrieval** | conteúdo recuperado manipulando comportamento | retrieval-harness; política anti-injeção |
| **Escalação silenciosa** | fronteira excedida absorvida sem registro | escalation-harness; intervention-log |
| **Implementation Harness prematuro** | construir o executor de specs antes das specs P0 | §17 (futuro, não especificado) |

---

## 19. Relação entre os harnesses (composição, não redundância)

- **`runtime-harness` é o guarda-chuva.** Ele **compõe** os demais; não os duplica. As onze
  responsabilidades de runtime são **delegadas** aos substratos especializados (governança →
  governance, evidência → observability, execução → execution, isolamento → tenant, contexto →
  context, recuperação → retrieval, auditoria → audit, escalação → escalation).
- **Composição ≠ contenção.** O runtime-harness coordena, mas não contém a lógica dos outros —
  cada um permanece desacoplado e editável isoladamente (critério 6).
- **Sobreposições resolvidas por fronteira explícita:** `context-harness` monta/isola contexto;
  `retrieval-harness` recupera do corpus; a fronteira entre eles está fixada em §9.6/§9.7. Enquanto
  o `context-harness` não é extraído, sua função vive **dentro** do `runtime-harness` (§15).
- **`tenant-harness` é transversal.** Todo harness opera **dentro** do tenant-scope que o
  tenant-harness impõe; ele não é uma etapa, é uma condição de contorno de todos.
- **`audit-harness` é independente do executor.** Por construção (critério 7), não é desativável
  pelos harnesses que fiscaliza — preserva o invariante de controlabilidade.

---

## 20. Conformidade com os princípios da fundação

| Princípio | Como este mapa o instancia |
| --- | --- |
| `P1`/`P6` LLM/runtime sem autoridade | def. §4; matriz de conceitos §5; runtime-harness coordena, não governa |
| `P12` governança separada da linguagem | governance-harness; enforcement determinístico (§9.2, §13) |
| `P8`/`P9` observabilidade e auditabilidade | observability-harness e audit-harness; *nenhuma execução sem trace* (§12) |
| `P10` multi-tenant por desenho | tenant-harness transversal (§9.4, §19) |
| `P15` specifications governam contratos | cada harness é governado por specs mapeadas (§10) |
| `DO4` execução baseada em specification | critério de promoção 2 (contract-first, §7) |

Conflitos entre harnesses: **ordem de valores** de
[`principles.md`](../foundation/principles.md) — verdade operacional › segurança › isolamento
multi-tenant › auditabilidade › governança › continuidade › desacoplamento › leveza do runtime —
**nunca** a numeração de princípios.

---

## 21. Fronteiras (o que NÃO está aqui)

- **Não** cria harnesses executáveis, implementation harness, código, configuração, YAML/JSON,
  schema, API, frontend, backlog ou plano de implementação — ver §17.
- **Não** cria contratos machine-readable nem specs individuais `.spec.md`.
- **Não** modifica Specification Map, Skill Map ou Subagent Map (nenhum erro factual grave foi
  encontrado; se houvesse, seria apenas reportado).
- **Não** detalha o Implementation Harness / Spec Executor Harness além de citá-lo como direção
  futura.
- **Não** substitui a camada [`harness-engineering/`](harness-philosophy.md): é o mapa que orienta
  a futura criação controlada dos harnesses descritos nela.

---

## 22. Próximo checkpoint recomendado

Recomendação (sem iniciar): após a aprovação deste mapa, a próxima fase pode ser **a criação
controlada das specs da Onda P0** (`core-operational-principles`, `layer-authority-model`,
`conflict-resolution`, `tenant-boundary`) — as fundacionais que desbloqueiam estado, governança e
todos os harnesses — uma a uma, com checkpoint por spec. Só então abre-se a especificação dos
harnesses fundacionais (`runtime`, `governance`, `observability`, `tenant`, `execution`).

O **Implementation Harness / Spec Executor Harness** permanece **futuro**: só pode ser considerado
**depois** das specs P0 aprovadas **e** deste mapa de harnesses aprovado.

Em qualquer caso, **nada será criado** até autorização explícita da próxima fase. A arquitetura
continua sendo o produto.

# runtime-harness

> **Specification documental de harness (governança-first, linguagem natural estruturada).** Primeira
> peça do conjunto mínimo de **harnesses documentais da P4**. Fixa o **contrato documental do
> runtime-harness** — o substrato de coordenação do episódio operacional — **sem** implementar
> runtime, sem conceder-lhe autoridade e sem virar harness executável. **Não** é machine-readable:
> não contém código, API, schema, YAML, JSON, DSL, pseudo-código nem contrato técnico executável.
> Apenas **referencia** o cânone aprovado; não o duplica, resume nem substitui.
>
> Onda: **P4** (harness documental mínimo) · Status: proposta para aprovação · Versão: v1 ·
> Data: 2026-06-04 · Documento normativo (DEVE / NÃO DEVE / NUNCA têm força contratual).
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]`.

> **Correção conceitual registrada.** O [Operational Harness Map §8](../../../harness-engineering/operational-harness-map.md)
> rotula o `runtime-harness` como **Onda P5**. A **decisão vigente do operador** posiciona os
> **harnesses mínimos documentais** na **P4** (camada `specs/p4/harnesses`), ao lado das skills e
> subagentes mínimos já aprovados. Esta spec adota **P4** como onda. A divergência é apenas de
> rotulagem de onda; **não** altera o papel, a fronteira nem a doutrina do harness fixados no mapa.

---

## 1. Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `runtime-harness` |
| **Tipo de peça** | harness operacional — **documental nesta fase** (não executável) |
| **Função primária** | coordenação do episódio operacional (substrato-guarda-chuva) |
| **Classe** | fundacional ([Operational Harness Map §14](../../../harness-engineering/operational-harness-map.md)) |
| **Tenant-scope** | Global (opera sempre **dentro** do tenant-harness / `tenant-boundary`) |
| **Proveniência** | `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]` |

**Fontes consolidadas (referência, não duplicação):**
- [`operational-harness-map.md`](../../../harness-engineering/operational-harness-map.md) §4, §5, §6, §7, §9.1, §14, §16, §19.
- [`controlled-execution-plan.md`](../../../implementation/controlled-execution-plan.md) §12, §16, §17.
- [`specs-p0-p3-checkpoint.md`](../../specs-p0-p3-checkpoint.md).
- Specs P0–P4 listadas em **§24 (Dependências)**.

---

## 2. Status, camada, onda e owner arquitetural

| Campo | Valor |
| --- | --- |
| **Status** | proposta para aprovação · architecture-only · governance-first |
| **Camada** | `specs/p4/harnesses` |
| **Onda** | **P4** (harness documental mínimo; correção P5→P4 registrada no topo) |
| **Owner arquitetural** | Arquitetura |
| **Natureza** | harness **documental**, **não** executável; verifica o papel do runtime, **não** o implementa |
| **Modularidade** | modular, revisável e subordinado a specification ([condição 34](#1-identificação)) |

---

## 3. Propósito

Fixar, como **contrato documental verificável**, **como o runtime-harness verifica o papel do
runtime** dentro do episódio operacional do YZI OS — e **o que jamais lhe é permitido decidir,
governar ou executar**. O runtime-harness é o **substrato de coordenação** que envolve o ciclo
governado (montar contexto, rotear, sequenciar etapas, orquestrar componentes desacoplados) **sem
deter autoridade comportamental** sobre a verdade operacional (estado), a decisão institucional
(services) ou a governança (policies/RAG/XML).

O propósito é **delimitar o runtime**: o harness é o lugar onde se verifica que o runtime **coordena
mas não governa**, **aciona mas não decide conformidade**, **registra mas não substitui estado**,
**roteia mas não substitui service decision**. Esta peça **não implementa runtime** e **não concede
autoridade ao runtime** — apenas extrai do cânone o contrato que o runtime deverá honrar quando (e
somente quando) for futuramente implementado sob autorização própria.

---

## 4. Escopo

Esta spec cobre, em linguagem natural estruturada:

1. a **definição documental** do runtime-harness como substrato de coordenação (§6);
2. o **limite do runtime** que o harness materializa — coordenação sem autoridade (§7, §11);
3. a **distinção** entre runtime, harness, implementation harness, service, tool, agent, LLM e
   policy engine (§8);
4. as **entradas e saídas conceituais** do harness (§9, §10);
5. as **relações de governança** com P0–P4, observability e execution governance (§12–§19);
6. os **critérios de aceite e rejeição** e o **protocolo de bloqueio/pendência/escalada** (§20–§22).

Tudo é **descritivo e revisável por humano**, jamais executável.

---

## 5. Fora de escopo

Esta spec **NÃO**:

- cria `governance-harness.spec.md`, `observability-harness.spec.md`, `tenant-harness.spec.md`,
  `execution-harness.spec.md` nem qualquer outro harness ([condição 35](#5-fora-de-escopo));
- cria harness **executável**, implementation harness, runtime real ou runtime paralelo
  ([condições 1–6, 35](#5-fora-de-escopo));
- cria subagentes executáveis, skills executáveis, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, DSL, pseudo-código ou contrato machine-readable;
- infere stack técnica nem se transforma em plano de implementação;
- concede autoridade ao runtime, nem o promove a agente, LLM, service, tool, policy engine ou
  authority layer ([condições 7, 17–23](#11-limites-do-harness));
- redefine princípios, autoridade de camadas, governança, contexto, retrieval, execução ou
  verificação — isso pertence às specs P0–P3 (apenas referenciadas).

---

## 6. Definição do harness

> **Runtime-harness** = **substrato documental que delimita e verifica o papel de coordenação do
> runtime** dentro do episódio operacional — montando a sequência governada (contexto → roteamento →
> etapas → orquestração de componentes desacoplados) **sem deter autoridade sobre a verdade
> operacional (estado), a decisão institucional (services) ou a governança comportamental
> (policies/RAG/XML)**. Ele coordena, restringe e prepara a verificação; **não** contém o domínio.
> `[HARNESS-RT]`

Nesta fase, o runtime-harness é **harness documental, não harness executável**
([condição 1](#6-definição-do-harness)): ele **verifica o papel do runtime, mas não implementa
runtime** ([condição 2](#6-definição-do-harness)). Não é implementation harness
([condição 3](#6-definição-do-harness)), não é código ([condição 4](#6-definição-do-harness)), não é
API ([condição 5](#6-definição-do-harness)) e não é orquestrador executável
([condição 6](#6-definição-do-harness)). É o substrato-guarda-chuva que **compõe** (não contém) os
demais harnesses ([Operational Harness Map §9.1, §19](../../../harness-engineering/operational-harness-map.md)).

A confiança migra do modelo para a arquitetura — *"confie na arquitetura, não no modelo"* `[CE]`. O
runtime-harness é onde se verifica que a coordenação permanece **leve, sem autoridade e auditável**.

---

## 7. Runtime-harness como limite do runtime, não implementação

O runtime-harness existe para **delimitar o runtime**, não para construí-lo. Ele fixa, como
contrato, a fronteira entre o que o runtime **pode coordenar** e o que **jamais pode decidir**:

| O runtime PODE… | …mas NÃO pode (o harness verifica o limite) | Condição |
| --- | --- | --- |
| coordenar a **sequência operacional** | **decidir a verdade** (verdade é do estado) | [9](#7-runtime-harness-como-limite-do-runtime-não-implementação) |
| **acionar etapas** do ciclo | **decidir conformidade** (conformidade é enforcement) | [10](#7-runtime-harness-como-limite-do-runtime-não-implementação) |
| **registrar eventos** | **substituir o estado** (estado é a verdade persistida) | [11](#7-runtime-harness-como-limite-do-runtime-não-implementação) |
| **rotear** entre componentes | **substituir service decision** | [12](#7-runtime-harness-como-limite-do-runtime-não-implementação) |
| **invocar checagens futuras** | **substituir policy enforcement** | [13](#7-runtime-harness-como-limite-do-runtime-não-implementação) |
| **coordenar tool permission** | **conceder permissão sozinho** | [14](#7-runtime-harness-como-limite-do-runtime-não-implementação) |
| **coordenar tool execution** | **executar sem permission registrada** | [15](#7-runtime-harness-como-limite-do-runtime-não-implementação) |
| **coordenar verification** | **declarar resultado verdadeiro sozinho** | [16](#7-runtime-harness-como-limite-do-runtime-não-implementação) |

O runtime **continua coordenador, não governança** ([condição 8](#7-runtime-harness-como-limite-do-runtime-não-implementação)).
O harness é o **limite documental** desse papel: descreve a fronteira, não o mecanismo. **Não**
implementa o runtime, **não** o substitui e **não** lhe concede autoridade
([condição 7](#11-limites-do-harness)).

---

## 8. Diferença entre runtime, harness, implementation harness, service, tool, agent, LLM e policy engine

Extraída de [Operational Harness Map §5](../../../harness-engineering/operational-harness-map.md) e
[layer-authority-model §7](../../p0/layer-authority-model.spec.md), sem inventar doutrina:

| Conceito | É… | Decide verdade? | Governa comportamento? | Executa efeito? | O runtime-harness… |
| --- | --- | --- | --- | --- | --- |
| **Runtime** | coordenação leve do episódio | não | não | orquestra (não executa efeito) | **delimita e verifica** este papel |
| **Harness (este)** | substrato de coordenação/verificação documental | **não** | aplica/verifica, não define | coordena, não executa | é o próprio substrato |
| **Implementation harness** | futuro executor de specs aprovadas | não | não | executa specs (futuro) | **não é** — §17 do mapa; fora desta fase |
| **Service** | decisão institucional dentro de contrato | **sim** (a operação) | não | não | runtime **não** o substitui |
| **Tool** | execução de efeito sob permissão | não | não | **sim** | runtime **coordena**, não vira tool |
| **Agent** | interface linguística que **propõe** | não | não | não | runtime **não** vira agente |
| **LLM** | motor probabilístico sem autoridade | não | não | não | runtime **não** vira LLM |
| **Policy engine** | enforcement determinístico da regra | não | **aplica** a regra | não | runtime **não** vira policy engine |

Leitura: o runtime-harness ocupa a posição de **substrato** — não decide verdade, não governa por si,
não executa o efeito. As condições [17–22](#11-limites-do-harness) proíbem que o runtime absorva
qualquer um desses papéis (agente, LLM, policy engine, service, tool, authority layer).

---

## 9. Entradas conceituais do harness

Em linguagem natural (nenhuma é estrutura de máquina):

1. o **episódio operacional** a coordenar — a sequência governada de etapas proposta;
2. o **tenant-scope** vigente, herdado do `tenant-boundary` / tenant-harness (sempre presente);
3. o **estado persistido** como verdade operacional de referência (lido, nunca substituído);
4. as **propostas** dos componentes desacoplados (interface-subagent na entrada; skills no ciclo);
5. as **fronteiras de permissão** pré-execução a respeitar (delegadas ao execution governance);
6. os **pontos de checagem** onde policy enforcement, tool permission e verification serão exigidos
   (invocados, nunca decididos pelo runtime).

O harness **não inventa** entradas: o que não chega com proveniência, tenant-scope e contrato é
tratado por **bloqueio, pendência de evidência ou escalada** (§22).

---

## 10. Saídas conceituais do harness

1. uma **coordenação verificável** do episódio — ordem de etapas, decisões de roteamento e pontos de
   acionamento, **reconstruíveis em trace** (alimentando observability quando implementada);
2. **acionamentos** das etapas governadas (policy enforcement, tool permission, tool execution,
   verification) — como **invocação**, nunca como decisão própria;
3. **eventos de ciclo de vida** a registrar/alimentar em episode trace e audit log futuros
   ([condição 27](#18-relação-com-observability));
4. um **veredito de fronteira**: cada operação futura possui (ou não) spec, tenant scope, boundary,
   trace, audit log, evidência e verification quando aplicável
   ([condição 31](#20-critérios-de-aceite));
5. quando algo falta: **bloqueio, pendência de evidência ou escalada** registrados — nunca absorção
   silenciosa ([condições 32, 33](#22-quando-bloquear-pendenciar-evidência-ou-escalar)).

Nenhuma saída é **decisão de verdade, conformidade, permissão ou resultado verificado** — essas
pertencem a estado, policies, tool-permission e verification, respectivamente.

---

## 11. Limites do harness

Limites invioláveis do runtime (o harness os verifica; nunca os relaxa):

- runtime **não pode virar agente** ([17](#11-limites-do-harness));
- runtime **não pode virar LLM** ([18](#11-limites-do-harness));
- runtime **não pode virar policy engine** ([19](#11-limites-do-harness));
- runtime **não pode virar service** ([20](#11-limites-do-harness));
- runtime **não pode virar tool** ([21](#11-limites-do-harness));
- runtime **não pode virar authority layer** ([22](#11-limites-do-harness));
- runtime **não pode decidir comportamento institucional** ([23](#11-limites-do-harness));
- runtime **deve respeitar tenant scope** ([24](#12-relação-com-p0)) e **preservar tenant boundary**
  ([25](#12-relação-com-p0));
- runtime **deve respeitar o estado persistido como verdade operacional** ([26](#13-relação-com-p1)).

Limites do **próprio harness** ([condições 34, 35](#5-fora-de-escopo)): permanece **modular,
revisável e subordinado a specification**; **não** vira implementação prematura, runtime paralelo,
meta-agente, policy engine, executor ou corretor automático.

---

## 12. Relação com P0

Herda como invariantes **aprovados** ([P0](../../p0/)):

- [`core-operational-principles`](../../p0/core-operational-principles.spec.md) — princípios e
  corolários (LLM/runtime sem autoridade; observabilidade obrigatória; multi-tenant por desenho);
- [`layer-authority-model`](../../p0/layer-authority-model.spec.md) — escada de autoridade
  Estado→LLM; **runtime na posição 6 (coordena, não governa)**; Paradoxo do Metadado;
- [`conflict-resolution`](../../p0/conflict-resolution.spec.md) — conflitos por **ordem de valores**
  (verdade operacional › segurança › isolamento multi-tenant › auditabilidade › governança ›
  continuidade › desacoplamento › **leveza do runtime**), nunca por numeração;
- [`tenant-boundary`](../../p0/tenant-boundary.spec.md) — fronteira multi-tenant invariante: o
  runtime **deve respeitar tenant scope** ([condição 24](#11-limites-do-harness)) e **preservar
  tenant boundary** ([condição 25](#11-limites-do-harness)).

---

## 13. Relação com P1

- [`operational-state`](../../p1/operational-state.spec.md) — o estado é a **verdade operacional**:
  o runtime **deve respeitá-lo como verdade** ([condição 26](#11-limites-do-harness)) e **não pode
  substituí-lo** ([condição 11](#7-runtime-harness-como-limite-do-runtime-não-implementação));
- [`event-driven-state`](../../p1/event-driven-state.spec.md) — o runtime **pode registrar eventos**,
  mas o evento é mudança verificável de estado, **não** substituição da verdade;
- [`tenant-state-isolation`](../../p1/tenant-state-isolation.spec.md) — coordenação sempre dentro do
  estado particionado por tenant (reforça [condições 24–25](#11-limites-do-harness));
- [`memory-model`](../../p1/memory-model.spec.md) — memória do modelo **não** é verdade; o runtime
  coordena sem promover memória a estado.

---

## 14. Relação com P2

- [`policy-enforcement`](../../p2/policy-enforcement.spec.md) — o runtime **pode invocar checagens
  futuras**, mas **não substitui policy enforcement** ([condição 13](#7-runtime-harness-como-limite-do-runtime-não-implementação));
- [`behavioral-governance`](../../p2/behavioral-governance.spec.md) — governança comportamental é
  das policies; o runtime **não decide comportamento institucional** ([condição 23](#11-limites-do-harness));
- [`operational-boundaries`](../../p2/operational-boundaries.spec.md) — fronteiras operacionais que o
  runtime respeita ao sequenciar;
- [`escalation-policy`](../../p2/escalation-policy.spec.md) — fundamenta o **dever de escalar** (§22);
- [`context-assembly`](../../p2/context-assembly.spec.md), [`context-provenance`](../../p2/context-provenance.spec.md) —
  o runtime coordena a **montagem** do contexto (função que vive **dentro** do runtime-harness até o
  `context-harness` ser extraído — [mapa §15, §19](../../../harness-engineering/operational-harness-map.md)),
  preservando proveniência e a prioridade Authority › … › Metadata;
- [`retrieval-governance`](../../p2/retrieval-governance.spec.md),
  [`tenant-retrieval-scope`](../../p2/tenant-retrieval-scope.spec.md),
  [`tenant-policy-pack`](../../p2/tenant-policy-pack.spec.md) — recuperação e policy pack governados;
  o runtime **roteia** ao retrieval, sem recuperar nem governar por si.

---

## 15. Relação com P3

O runtime-harness **prepara** (não executa) a cadeia de execução e verificação P3:

- [`service-contract`](../../p3/service-contract.spec.md) — o runtime **roteia** à decisão, mas
  **não substitui service decision** ([condição 12](#7-runtime-harness-como-limite-do-runtime-não-implementação));
- [`tool-registry`](../../p3/tool-registry.spec.md), [`tool-permission`](../../p3/tool-permission.spec.md) —
  o runtime **coordena tool permission**, mas **não concede permissão sozinho** ([condição 14](#7-runtime-harness-como-limite-do-runtime-não-implementação));
- [`tool-execution`](../../p3/tool-execution.spec.md) — o runtime **coordena tool execution**, mas
  **não executa sem permission registrada** ([condição 15](#7-runtime-harness-como-limite-do-runtime-não-implementação));
- [`tool-result-verification`](../../p3/tool-result-verification.spec.md) — o runtime **coordena
  verification**, mas **não declara resultado verdadeiro sozinho** ([condição 16](#7-runtime-harness-como-limite-do-runtime-não-implementação));
- [`episode-trace`](../../p3/episode-trace.spec.md), [`audit-log`](../../p3/audit-log.spec.md) — o
  runtime **deve registrar ou alimentar** episode trace e audit log quando futuramente implementados
  ([condição 27](#18-relação-com-observability));
- [`failure-attribution`](../../p3/failure-attribution.spec.md) — **falha de runtime deve ser
  atribuível** por failure attribution ([condição 28](#18-relação-com-observability));
- [`entropy-audit`](../../p3/entropy-audit.spec.md) — **entropia causada pelo runtime deve ser
  auditável** ([condição 29](#18-relação-com-observability));
- [`intervention-log`](../../p3/intervention-log.spec.md) — **intervenção relacionada ao runtime deve
  ser registrada** ([condição 30](#18-relação-com-observability));
- [`verification-report`](../../p3/verification-report.spec.md) — conclusão = evidência, não asserção
  (o runtime coordena a verificação; não a declara).

---

## 16. Relação com P4 skills mínimas

As 4 skills mínimas **executam dentro** do ciclo que o runtime coordena — o runtime **não** as
substitui nem assume sua capacidade:

| Skill mínima | Papel no ciclo coordenado |
| --- | --- |
| [`intent-extraction`](../skills/intent-extraction-skill.spec.md) | produz proposta como **Metadata** na entrada do episódio |
| [`context-assembly`](../skills/context-assembly-skill.spec.md) | propõe o pacote de contexto que o runtime sequencia (função embutida no runtime-harness até o context-harness ser extraído) |
| [`provenance-tagging`](../skills/provenance-tagging-skill.spec.md) | marca proveniência por fragmento, preservada na coordenação |
| [`evidence-compilation`](../skills/evidence-compilation-skill.spec.md) | organiza evidência disponível/ausente para a verificação que o runtime aciona |

O runtime **coordena** essas capacidades sob a sua fronteira; **nenhuma** lhe transfere autoridade.

---

## 17. Relação com P4 subagentes mínimos

| Subagente mínimo | Papel na coordenação |
| --- | --- |
| [`interface-subagent`](../subagents/interface-subagent.spec.md) | **entrada do episódio**: medeia linguagem↔operação proposta; o runtime sequencia o que ele propõe |
| [`retrieval-subagent`](../subagents/retrieval-subagent.spec.md) | recuperação governada read-only **acionada** pela coordenação, sem o runtime recuperar por si |
| [`verification-subagent`](../subagents/verification-subagent.spec.md) | **auditor independente**: o runtime **coordena** a verificação, mas não verifica nem se autoverifica (independência preservada) |

A delegação preserva **atenuação de privilégio** (privilégio só decresce). O runtime **coordena
todos**, mas **não** decide a verdade, a conformidade nem o resultado de nenhum deles.

---

## 18. Relação com observability

O runtime-harness é **fonte de evidência**, não verificador da própria evidência:

- **deve registrar ou alimentar** episode trace e audit log quando futuramente implementados
  ([condição 27](#18-relação-com-observability));
- **falha de runtime deve ser atribuível** por failure attribution ([condição 28](#18-relação-com-observability));
- **entropia causada pelo runtime deve ser auditável** por entropy audit ([condição 29](#18-relação-com-observability));
- **intervenção relacionada ao runtime deve ser registrada** por intervention log ([condição 30](#18-relação-com-observability)).

A produção de traces, episode packages e relatórios pertence ao **observability-harness** (futuro,
**não criado aqui**). O runtime **alimenta** essa observabilidade; **não a substitui** e **não
declara resultado verificado sozinho** ([condição 16](#7-runtime-harness-como-limite-do-runtime-não-implementação)).
Vale o invariante *"nenhuma execução sem trace"* `[AHE]`.

---

## 19. Relação com execution governance

O runtime **prepara e coordena** a cadeia de execução, mas a **governança da execução** permanece em
estado/services/policies/tools, futuramente coordenada pelo **execution-harness** (**não criado
aqui**):

- registro (tool-registry) → decisão (service-contract) → permissão (tool-permission) → execução
  (tool-execution) → verificação (tool-result-verification);
- o runtime **roteia** à decisão (não a substitui — [12](#7-runtime-harness-como-limite-do-runtime-não-implementação)),
  **coordena** a permissão (não a concede sozinho — [14](#7-runtime-harness-como-limite-do-runtime-não-implementação)),
  **coordena** a execução (não executa sem permission registrada — [15](#7-runtime-harness-como-limite-do-runtime-não-implementação)),
  **coordena** a verificação (não declara resultado verdadeiro sozinho — [16](#7-runtime-harness-como-limite-do-runtime-não-implementação)).

Atenuação de privilégio: a coordenação **nunca** eleva o privilégio de um componente ao delegar.

---

## 20. Critérios de aceite

A spec é aceita quando:

1. trata o runtime-harness como **harness documental, não executável** nesta fase (cond. 1);
2. **verifica o papel do runtime sem implementá-lo** (cond. 2); não é implementation harness, código,
   API nem orquestrador executável (cond. 3–6);
3. **não concede autoridade ao runtime** (cond. 7); mantém o runtime **coordenador, não governança**
   (cond. 8);
4. preserva os oito limites coordenar/decidir (verdade, conformidade, estado, service decision,
   policy enforcement, tool permission, tool execution, verification — cond. 9–16);
5. preserva as sete proibições de identidade (agente, LLM, policy engine, service, tool, authority
   layer, comportamento institucional — cond. 17–23);
6. exige respeito a **tenant scope/boundary** (cond. 24–25) e ao **estado como verdade** (cond. 26);
7. exige que o runtime **registre/alimente** episode trace e audit log (cond. 27) e que falha,
   entropia e intervenção do runtime sejam **atribuíveis/auditáveis/registradas** (cond. 28–30);
8. exige que o runtime-harness **verifique** se cada operação futura possui **spec, tenant scope,
   boundary, trace, audit log, evidência e verification** quando aplicável
   ([condição 31](#20-critérios-de-aceite));
9. **impede** que o runtime absorva silenciosamente falhas, conflitos, ambiguidade ou ausência de
   evidência ([condição 32](#22-quando-bloquear-pendenciar-evidência-ou-escalar));
10. exige **bloqueio, pendência de evidência ou escalada** nos gatilhos do §22
    ([condição 33](#22-quando-bloquear-pendenciar-evidência-ou-escalar));
11. permanece **modular, revisável e subordinado a specification** (cond. 34) e **não** vira
    implementação prematura, runtime paralelo, meta-agente, policy engine, executor ou corretor
    automático (cond. 35);
12. **referencia** o cânone P0–P4 sem duplicá-lo, resumi-lo ou inventar doutrina nova; é revisável
    por humano.

---

## 21. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. trata o runtime-harness como **executável**, implementation harness, código, API, schema,
   orquestrador executável, runtime real ou runtime paralelo (viola cond. 1–6, 35);
2. **concede autoridade** ao runtime ou o coloca como governança, authority layer ou decisor
   comportamental (viola cond. 7, 8, 22, 23);
3. permite o runtime **decidir verdade, conformidade ou resultado verificado**, **substituir estado,
   service decision ou policy enforcement**, **conceder permissão sozinho** ou **executar sem
   permission registrada** (viola cond. 9–16, 26);
4. permite o runtime **virar** agente, LLM, policy engine, service ou tool (viola cond. 17–21);
5. ignora **tenant scope/boundary** ou trata a fronteira como configuração (viola cond. 24–25);
6. dispensa **trace/atribuição/auditoria/registro** de falha, entropia ou intervenção do runtime
   (viola cond. 27–30);
7. deixa o runtime **absorver silenciosamente** falha, conflito, ambiguidade ou ausência de evidência
   em vez de **bloquear, pendenciar ou escalar** (viola cond. 31–33);
8. cria **outro harness** (governance, observability, tenant, execution ou qualquer outro), harness
   executável, subagente/skill executável, código, API, schema, frontend, backlog, YAML/JSON ou
   contrato machine-readable (viola guardrails / cond. 35);
9. **infere stack técnica**, vira plano de implementação, ou **resume/duplica/inventa** doutrina em
   vez de referenciar o cânone;
10. reposiciona o YZI OS como chatbot, SaaS genérico, automação simples ou wrapper de LLM.

---

## 22. Quando bloquear, pendenciar evidência ou escalar

O runtime-harness **impede a absorção silenciosa** ([condição 32](#22-quando-bloquear-pendenciar-evidência-ou-escalar))
e **exige bloqueio, pendência de evidência ou escalada** ([condição 33](#22-quando-bloquear-pendenciar-evidência-ou-escalar))
quando o runtime encontra:

| Gatilho | Resposta obrigatória |
| --- | --- |
| **estado ambíguo** | bloquear ou pendenciar evidência (estado é verdade; não inferir) |
| **tenant ausente** | bloquear (sem tenant scope não há operação — cond. 24–25) |
| **policy pendente** | pendenciar evidência ou escalar (não substituir enforcement — cond. 13) |
| **permission ausente** | bloquear (não executar sem permission registrada — cond. 15) |
| **evidência insuficiente** | pendenciar evidência (conclusão = evidência, não asserção) |
| **verification ausente** | bloquear ou escalar (não declarar resultado verdadeiro sozinho — cond. 16) |
| **conflito** | resolver por **ordem de valores** ([`conflict-resolution`](../../p0/conflict-resolution.spec.md)) ou escalar |

Regra-mãe: **nunca admissão silenciosa**. Falha, conflito, ambiguidade ou ausência de evidência →
**bloqueio, pendência ou escalada registrada**, conforme [`escalation-policy`](../../p2/escalation-policy.spec.md)
e [`intervention-log`](../../p3/intervention-log.spec.md).

---

## 23. Riscos arquiteturais evitados

| Risco | Como esta spec o evita |
| --- | --- |
| **Runtime pesado acumulando governança** | runtime leve, coordenador; governança delegada (cond. 8, 13, 19, 23) |
| **Runtime com autoridade** | proibições de identidade e de decisão (cond. 7, 9–23) |
| **Estado substituído pela coordenação** | estado é verdade; runtime registra eventos, não substitui (cond. 11, 26) |
| **Execução sem permissão/sem trace** | não executar sem permission registrada; alimentar trace (cond. 15, 27) |
| **Conclusão por asserção** | runtime coordena verification; não declara resultado sozinho (cond. 16) |
| **Vazamento cross-tenant** | respeitar tenant scope e preservar boundary (cond. 24–25) |
| **Absorção silenciosa de falha/ambiguidade** | bloqueio/pendência/escalada obrigatórios (cond. 31–33) |
| **Implementation harness prematuro** | runtime-harness documental; não é executor de specs (§8; cond. 1–6, 35) |
| **Decomposição prematura** | context vive **dentro** do runtime-harness até extração ([mapa §15, §19](../../../harness-engineering/operational-harness-map.md)) |
| **Corretor automático / meta-agente** | proibido; modular, revisável, subordinado a spec (cond. 34–35) |

---

## 24. Dependências

**Aprovadas (referenciadas, não duplicadas):**

- **Mapas/processo:** [`operational-harness-map.md`](../../../harness-engineering/operational-harness-map.md),
  [`controlled-execution-plan.md`](../../../implementation/controlled-execution-plan.md),
  [`specs-p0-p3-checkpoint.md`](../../specs-p0-p3-checkpoint.md).
- **P0:** `core-operational-principles`, `layer-authority-model`, `conflict-resolution`,
  `tenant-boundary`.
- **P1:** `operational-state`, `event-driven-state`, `tenant-state-isolation`, `memory-model`.
- **P2:** `policy-enforcement`, `behavioral-governance`, `operational-boundaries`,
  `escalation-policy`, `context-assembly`, `context-provenance`, `retrieval-governance`,
  `tenant-policy-pack`, `tenant-retrieval-scope`.
- **P3:** `episode-trace`, `audit-log`, `failure-attribution`, `verification-report`,
  `entropy-audit`, `intervention-log`, `service-contract`, `tool-registry`, `tool-permission`,
  `tool-execution`, `tool-result-verification`.
- **P4 skills mínimas:** `intent-extraction`, `context-assembly`, `provenance-tagging`,
  `evidence-compilation`.
- **P4 subagentes mínimos:** `interface-subagent`, `retrieval-subagent`, `verification-subagent`.

**Futuras (pendentes; bloqueiam a promoção executável):** specs de runtime do mapa
(`lightweight-runtime`, `runtime-lifecycle`, `runtime-orchestration`,
`runtime-permission-boundaries`); os harnesses mínimos restantes (`governance`, `observability`,
`tenant`, `execution`); o Implementation Harness / Spec Executor. Enquanto não aprovados, a promoção
**executável** do runtime permanece bloqueada (contract-first, `P15`/`DO4`).

---

## 25. Próxima peça recomendada

Direção recomendada — **a confirmar separadamente, sem autorização de execução aqui**: o próximo
harness fundacional documental do conjunto mínimo ([Operational Harness Map §16](../../../harness-engineering/operational-harness-map.md)),
**`governance-harness.spec.md`** (substrato de enforcement determinístico), seguido por
`observability-harness` e `tenant-harness`; `execution-harness` entra quando houver tool com efeito.
Documental, **uma peça por vez, com checkpoint**. **Esta spec não autoriza a próxima peça** e
**não avança para o próximo harness**.

---

## 26. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/harnesses/runtime-harness.spec.md`. Nenhum outro
   arquivo criado ou alterado.
2. **Natureza respeitada:** architecture-only · governance-first · linguagem natural estruturada.
   Harness **documental, não executável**; **não** é implementation harness, código, API, schema,
   orquestrador executável, YAML/JSON nem contrato machine-readable.
3. **Estrutura:** exatamente as **26 seções** exigidas.
4. **35 condições obrigatórias:** todas preservadas e referenciadas no corpo (limites do runtime
   §7/§11; identidade §8/§11; tenant/estado §12–§13; observability §18; execução §19; verificação de
   fronteira §20; anti-absorção/escalada §22; modularidade §11/§20).
5. **Correção conceitual:** onda **P5→P4** registrada no topo; divergência apenas de rotulagem,
   sem alterar papel ou fronteira.
6. **Cânone:** P0–P4, mapa de harnesses e plano de execução **referenciados, não duplicados**;
   nenhuma doutrina nova inventada.
7. **Confirmação de fronteira:** **nenhum** outro harness (`governance`, `observability`, `tenant`,
   `execution` ou qualquer outro), harness executável, implementation harness, subagente/skill
   executável, código, API, schema, frontend, backlog, YAML/JSON ou contrato machine-readable foi
   criado. Specs P0–P4, mapas e checkpoints anteriores **não** modificados. Nenhuma stack inferida.

**Parado aqui. Não avancei para o próximo harness.**

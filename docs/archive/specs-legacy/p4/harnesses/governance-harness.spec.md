# governance-harness

> **Specification documental de harness (governança-first, linguagem natural estruturada).** Segunda
> peça do conjunto mínimo de **harnesses documentais da P4**. Fixa o **contrato documental do
> governance-harness** — o substrato que **verifica e limita a aplicação de governança** (enforcement
> determinístico, independente de agente) — **sem implementar governança**, sem virar policy engine e
> sem virar harness executável. **Não** é machine-readable: não contém código, API, schema, YAML,
> JSON, DSL, pseudo-código nem contrato técnico executável. Apenas **referencia** o cânone aprovado;
> não o duplica, resume nem substitui.
>
> Onda: **P4** (harness documental mínimo) · Status: proposta para aprovação · Versão: v1 ·
> Data: 2026-06-04 · Documento normativo (DEVE / NÃO DEVE / NUNCA têm força contratual).
> Proveniência: `[HE-GOV]` `[CE]` `[PYR]` `[AHE]` `[HARNESS-RT]`.

> **Nota de proveniência das condições (transparência).** As **condições 14–37** foram aplicadas na
> redação inicial (briefing parcial). As **condições 1–13** chegaram depois, em **lista literal do
> operador**, e foram aplicadas por **ajuste aditivo direcionado** (§7), substituindo a reconstrução
> provisória anterior. As **37 condições** estão agora explícitas conforme o texto do operador; nada
> além do bloco 1–13 foi reescrito.

> **Correção conceitual registrada.** O [Operational Harness Map §8](../../../harness-engineering/operational-harness-map.md)
> rotula o `governance-harness` como **Onda P5**. A **decisão vigente do operador** posiciona os
> **harnesses mínimos documentais** na **P4**. Esta spec adota **P4**; divergência apenas de rotulagem
> de onda, sem alterar papel, fronteira ou doutrina.

---

## 1. Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `governance-harness` |
| **Tipo de peça** | harness operacional — **documental nesta fase** (não executável) |
| **Função primária** | enforcement determinístico de policies/specs (substrato de governança) |
| **Classe** | fundacional ([Operational Harness Map §14](../../../harness-engineering/operational-harness-map.md)) |
| **Tenant-scope** | Global/instância (definição global, policy pack por tenant) |
| **Proveniência** | `[HE-GOV]` `[CE]` `[PYR]` `[AHE]` `[HARNESS-RT]` |

**Fontes consolidadas (referência, não duplicação):**
- [`operational-harness-map.md`](../../../harness-engineering/operational-harness-map.md) §4, §5, §6, §7, §9.2, §13, §14, §16, §18, §19.
- [`controlled-execution-plan.md`](../../../implementation/controlled-execution-plan.md) §12.
- [`runtime-harness.spec.md`](runtime-harness.spec.md) (peça-par; §18 desta spec).
- [`specs-p0-p3-checkpoint.md`](../../specs-p0-p3-checkpoint.md). Specs P0–P4 em **§25 (Dependências)**.

---

## 2. Status, camada, onda e owner arquitetural

| Campo | Valor |
| --- | --- |
| **Status** | proposta para aprovação · architecture-only · governance-first |
| **Camada** | `specs/p4/harnesses` |
| **Onda** | **P4** (harness documental mínimo; correção P5→P4 registrada no topo) |
| **Owner arquitetural** | Arquitetura |
| **Natureza** | harness **documental**, **não** executável; **verifica e limita** a aplicação de governança, **não** a implementa |
| **Modularidade** | modular, revisável e subordinado a specification ([condição 36](#11-limites-do-harness)) |

---

## 3. Propósito

Fixar, como **contrato documental verificável**, **como o governance-harness verifica e limita a
aplicação de governança** no YZI OS — aplicando policies/specifications de forma **determinística e
independente de agente** (enforcement pós-geração), reduzindo o espaço de escolha do modelo e
verificando conformidade — **sem implementar governança, sem definir a regra e sem deter a decisão da
operação**.

O propósito é **delimitar a governança em execução**: o harness é o lugar onde se verifica que
*guidance ≠ enforcement*, que **o prompt não é policy**, que **nenhuma camada probabilística
(LLM/agente/runtime/subagente/tool) assume autoridade de governança**, e que **nenhum bypass** de
tenant boundary, policy enforcement, operational boundaries, authority layer ou escalation-policy
ocorre silenciosamente. Esta peça **não implementa governança** e **não vira policy engine** — extrai
do cânone o contrato que o enforcement deverá honrar quando (e somente quando) for futuramente
implementado sob autorização própria.

---

## 4. Escopo

Esta spec cobre, em linguagem natural estruturada:

1. a **definição documental** do governance-harness como substrato de enforcement (§6);
2. o **limite da governança** que o harness verifica — aplica/verifica a regra, não a define (§7, §11);
3. a **distinção** entre governance-harness, policy enforcement, policy engine, runtime, LLM, prompt,
   service, tool e verification-subagent (§8);
4. as **entradas e saídas conceituais** do harness (§9, §10);
5. as **relações de governança** com P0–P4, runtime-harness, observability e execution governance
   (§12–§20);
6. os **critérios de aceite e rejeição** e o **protocolo de bloqueio/pendência/escalada** (§21–§23).

Tudo é **descritivo e revisável por humano**, jamais executável.

---

## 5. Fora de escopo

Esta spec **NÃO**:

- cria `observability-harness.spec.md`, `tenant-harness.spec.md`, `execution-harness.spec.md` nem
  qualquer outro harness ([condição 37](#5-fora-de-escopo));
- cria harness **executável**, implementation harness, policy engine real ou runtime paralelo
  ([condições 1–7, 37](#5-fora-de-escopo));
- cria subagentes executáveis, skills executáveis, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, DSL, pseudo-código ou contrato machine-readable;
- infere stack técnica nem se transforma em plano de implementação;
- **define a regra** (isso é policy/spec) nem **decide a operação** (isso é service);
- substitui `policy-enforcement`, `conflict-resolution`, `escalation-policy` ou
  `operational-boundaries` ([condições 15–18](#7-governance-harness-como-verificação-de-governança-não-implementação)) — apenas
  os **verifica/aciona**.

---

## 6. Definição do harness

> **Governance-harness** = **substrato documental que verifica e limita a aplicação de governança** —
> aplicando policies/specifications de forma **determinística e independente de agente** (Enforcement,
> pós-geração), reduzindo o espaço de escolha do modelo e verificando conformidade — **sem definir a
> regra (isso é policy/spec), sem decidir a operação (isso é service) e sem deter autoridade sobre a
> verdade operacional**. Ele **aplica e verifica**; não contém o domínio. `[HE-GOV]`

Nesta fase, o governance-harness é **harness documental, não executável**: ele **verifica** a
aplicação de governança, mas **não a implementa**. Não é implementation harness, não é código, não é
API, **não é policy engine executável**; **não é runtime, LLM, prompt, service decision nem
verification-subagent**; **não executa tool nem altera estado** (cond. 1–13). *"Restringir habilita
autonomia"* `[HE-GOV]`: a governança
determinística é o que permite delegar tarefas ao modelo sem confiar a ele a regra. A confiança
reside na **arquitetura**, não na formulação do prompt `[CE]` — por isso o prompt permanece
**Metadata** ([layer-authority-model §8](../../p0/layer-authority-model.spec.md)) e **nunca** é
tratado como policy ([condição 27](#11-limites-do-harness)).

---

## 7. Governance-harness como verificação de governança, não implementação

O governance-harness existe para **verificar e limitar** a governança, não para construí-la. Fixa,
como contrato, a fronteira entre o que a governança em execução **deve verificar** e o que **jamais
pode substituir, definir ou decidir**.

**Bloco natureza/identidade — condições 1–14** *(condições 1–13 aplicadas conforme a lista literal do
operador; ver checkpoint §27)*:

| # | Condição | Status |
| --- | --- | --- |
| 1 | governance-harness é **harness documental, não harness executável** nesta fase | aplicada |
| 2 | **verifica** aplicação de governança, mas **não implementa** governança | aplicada |
| 3 | **não é** implementation harness | aplicada |
| 4 | **não é** código | aplicada |
| 5 | **não é** API | aplicada |
| 6 | **não é** policy engine executável | aplicada |
| 7 | **não é** runtime | aplicada |
| 8 | **não é** LLM | aplicada |
| 9 | **não é** prompt | aplicada |
| 10 | **não é** service decision | aplicada |
| 11 | **não é** verification-subagent | aplicada |
| 12 | **não executa tool** | aplicada |
| 13 | **não altera estado** | aplicada |
| 14 | **não decide a operação por conta própria** | aplicada |

**Bloco "não substitui" — condições 15–18 (visíveis):** o governance-harness **não substitui**
`policy-enforcement` (15), `conflict-resolution` (16), `escalation-policy` (17) nem
`operational-boundaries` (18) — apenas os **verifica e aciona**.

**Bloco "deve verificar" — condições 19–25 (visíveis):** o governance-harness **deve verificar**
subordinação a **core principles** (19), **authority layer** (20), **tenant boundary** (21),
**policy enforcement determinístico** (22), **operational boundaries** (23), **conflict-resolution
quando houver conflito** (24) e **escalation-policy quando houver incerteza, risco, ausência de
evidência, conflito ou limite de autoridade** (25).

---

## 8. Diferença entre governance-harness, policy enforcement, policy engine, runtime, LLM, prompt, service, tool e verification-subagent

Extraída de [Operational Harness Map §5, §9.2](../../../harness-engineering/operational-harness-map.md)
e [layer-authority-model §7–§8](../../p0/layer-authority-model.spec.md), sem inventar doutrina:

| Conceito | É… | Define a regra? | Aplica/verifica? | Decide a operação? | O governance-harness… |
| --- | --- | --- | --- | --- | --- |
| **Governance-harness (este)** | substrato documental de enforcement | não | **sim** (determinístico) | não | é o próprio substrato |
| **Policy enforcement** | ato de aplicar a policy | não | sim | não | **verifica/aciona**, não substitui (cond. 15, 22) |
| **Policy engine** | mecanismo executável de enforcement (futuro) | não | sim (executável) | não | **não é** policy engine executável (cond. 6, 37) |
| **Policy / spec / RAG / XML** | a **regra** de governança | **sim** | não | não | **não a define**; verifica seu cumprimento, não a implementa (cond. 2) |
| **Runtime** | coordenação leve do episódio | não | não | não | **não é runtime**; não confunde coordenação com governança (cond. 7) |
| **LLM** | motor probabilístico sem autoridade | não | não | não | **não é LLM**; impede que assuma autoridade de governança (cond. 8, 28) |
| **Prompt** | Metadata (menor prioridade) | não | não | não | **não é prompt**; impede que seja tratado como policy (cond. 9, 27) |
| **Service** | decisão institucional em contrato | não | não | **sim** (a operação) | **não é service decision**; não decide a operação por si (cond. 10, 14) |
| **Tool** | execução de efeito sob permissão | não | não | não | **não executa tool**; impede que assuma autoridade de governança (cond. 12, 28) |
| **Verification-subagent** | auditor independente (parecer por evidência) | não | verifica resultado/conformidade | não | **não é verification-subagent** (cond. 11); **complementar**: governance aplica enforcement, o auditor verifica independentemente (§17) |

Distinção essencial `[HE-GOV]`: **guidance ≠ enforcement**. Orientação textual (guidance) é
sugestão sem força; enforcement é **determinístico, reproduzível e independente de agente**. A
condição [26](#11-limites-do-harness) proíbe tratar guidance como enforcement.

---

## 9. Entradas conceituais do harness

Em linguagem natural (nenhuma é estrutura de máquina):

1. as **policies/specifications** aplicáveis (a regra — definida fora do harness; ele a aplica/verifica);
2. o **tenant-scope** e o **policy pack** vigentes, herdados de `tenant-boundary`/`tenant-policy-pack`;
3. a **saída a verificar** — proposta de operação, contexto montado, resultado de etapa (pós-geração);
4. o **estado/contexto de conflito ou incerteza** que pode acionar `conflict-resolution` ou
   `escalation-policy`;
5. as **fronteiras operacionais** (`operational-boundaries`) e a **escada de autoridade**
   (`layer-authority-model`) contra as quais a conformidade é verificada.

O que chega como **guidance, prompt ou eloquência de agente** **não** é tratado como regra
([condições 26, 27, 28](#11-limites-do-harness)); o que não puder ser governado é **bloqueado,
pendenciado ou escalado** (§23).

---

## 10. Saídas conceituais do harness

1. um **veredito de conformidade** reproduzível (pass/fail) por operação/artefato — conclusão por
   **evidência**, não por asserção;
2. **violações bloqueadas** e registros de não-conformidade (não executa tool nem altera estado para
   "corrigir" — cond. 12, 13);
3. **acionamento** de `conflict-resolution` (quando há conflito) e de `escalation-policy` (quando há
   incerteza, risco, ausência de evidência, conflito ou limite de autoridade — cond. 24, 25);
4. exigência de que **decisões governadas sejam auditáveis e rastreáveis** ([condição 30](#19-relação-com-observability));
5. **eventos** a alimentar/exigir em episode trace e audit log futuros ([condição 31](#19-relação-com-observability));
6. quando a governança não pode ser satisfeita: **bloqueio, pendência de evidência ou escalada**
   registrados ([condição 35](#23-quando-bloquear-pendenciar-evidência-ou-escalar)).

Nenhuma saída é **definição de regra, decisão de operação ou correção executada** — essas pertencem a
policies/specs, services e à futura execução governada, respectivamente.

---

## 11. Limites do harness

Limites invioláveis (o harness os verifica e os respeita; nunca os relaxa):

- **não substitui** policy enforcement (15), conflict-resolution (16), escalation-policy (17) nem
  operational-boundaries (18);
- **deve impedir** que **guidance** seja tratado como **enforcement** ([26](#11-limites-do-harness));
- **deve impedir** que **prompt** seja tratado como **policy** ([27](#11-limites-do-harness));
- **deve impedir** que LLM, agente, runtime, subagente ou tool **assumam autoridade de governança**
  ([28](#11-limites-do-harness));
- **deve impedir bypass** de tenant boundary, policy enforcement, operational boundaries, authority
  layer ou escalation-policy ([29](#11-limites-do-harness));
- **deve exigir** que decisões governadas sejam **auditáveis e rastreáveis** ([30](#19-relação-com-observability));
- **permanece modular, revisável e subordinado a specification** ([36](#11-limites-do-harness));
- **não vira** policy engine prematuro, runtime paralelo, meta-agente, executor, corretor automático
  ou implementação de governança ([37](#5-fora-de-escopo)).

---

## 12. Relação com P0

Herda como invariantes **aprovados** ([P0](../../p0/)), e **deve verificar** subordinação a eles:

- [`core-operational-principles`](../../p0/core-operational-principles.spec.md) — o harness **deve
  verificar subordinação a core principles** ([condição 19](#7-governance-harness-como-verificação-de-governança-não-implementação));
- [`layer-authority-model`](../../p0/layer-authority-model.spec.md) — **deve verificar a authority
  layer** ([condição 20](#7-governance-harness-como-verificação-de-governança-não-implementação)):
  governança é das policies, não do LLM/agente/runtime; prompt é Metadata;
- [`conflict-resolution`](../../p0/conflict-resolution.spec.md) — **deve verificar
  conflict-resolution quando houver conflito** ([condição 24](#7-governance-harness-como-verificação-de-governança-não-implementação)),
  pela **ordem de valores** (não pela numeração de princípios);
- [`tenant-boundary`](../../p0/tenant-boundary.spec.md) — **deve verificar tenant boundary**
  ([condição 21](#7-governance-harness-como-verificação-de-governança-não-implementação)) e impedir
  seu bypass ([condição 29](#11-limites-do-harness)).

---

## 13. Relação com P1

- [`operational-state`](../../p1/operational-state.spec.md) — o estado é a verdade operacional; o
  harness **não altera estado** ([condição 13](#7-governance-harness-como-verificação-de-governança-não-implementação))
  nem decide a verdade;
- [`event-driven-state`](../../p1/event-driven-state.spec.md) — vereditos e violações são eventos
  verificáveis, não mudança silenciosa de estado;
- [`tenant-state-isolation`](../../p1/tenant-state-isolation.spec.md) — enforcement sempre dentro do
  estado particionado por tenant (reforça cond. 21, 29);
- [`memory-model`](../../p1/memory-model.spec.md) — memória do modelo não é regra nem verdade; não é
  fonte de governança.

---

## 14. Relação com P2

P2 é o **núcleo da regra** que este harness **aplica e verifica** (sem definir nem substituir):

- [`policy-enforcement`](../../p2/policy-enforcement.spec.md) — **deve verificar policy enforcement
  determinístico** ([condição 22](#7-governance-harness-como-verificação-de-governança-não-implementação));
  **não o substitui** ([condição 15](#7-governance-harness-como-verificação-de-governança-não-implementação));
- [`behavioral-governance`](../../p2/behavioral-governance.spec.md) — governança comportamental
  determinística e independente de agente (guidance ≠ enforcement — cond. 26);
- [`operational-boundaries`](../../p2/operational-boundaries.spec.md) — **deve verificar operational
  boundaries** ([condição 23](#7-governance-harness-como-verificação-de-governança-não-implementação));
  **não os substitui** ([condição 18](#7-governance-harness-como-verificação-de-governança-não-implementação));
- [`escalation-policy`](../../p2/escalation-policy.spec.md) — **deve verificar escalation-policy**
  diante de incerteza, risco, ausência de evidência, conflito ou limite de autoridade
  ([condição 25](#7-governance-harness-como-verificação-de-governança-não-implementação)); **não a
  substitui** ([condição 17](#7-governance-harness-como-verificação-de-governança-não-implementação));
- [`tenant-policy-pack`](../../p2/tenant-policy-pack.spec.md) — verticalização governada por tenant
  (Global/instância); o harness aplica o pacote do tenant sem permitir bypass (cond. 29);
- [`context-assembly`](../../p2/context-assembly.spec.md), [`context-provenance`](../../p2/context-provenance.spec.md),
  [`retrieval-governance`](../../p2/retrieval-governance.spec.md),
  [`tenant-retrieval-scope`](../../p2/tenant-retrieval-scope.spec.md) — o harness verifica que
  contexto/retrieval respeitam a prioridade Authority › … › Metadata e a proveniência, sem o prompt
  virar policy (cond. 27).

---

## 15. Relação com P3

O governance-harness aciona/verifica governança ao longo da cadeia de execução e observabilidade P3:

- [`service-contract`](../../p3/service-contract.spec.md) — a **decisão** é do service dentro de
  contrato; o harness verifica conformidade, **não decide a operação** (cond. 14);
- [`tool-permission`](../../p3/tool-permission.spec.md), [`tool-execution`](../../p3/tool-execution.spec.md),
  [`tool-registry`](../../p3/tool-registry.spec.md) — verifica que permissão/execução respeitam a
  governança; impede bypass (cond. 29); a execução em si é coordenada pelo futuro `execution-harness` (§20);
- [`tool-result-verification`](../../p3/tool-result-verification.spec.md),
  [`verification-report`](../../p3/verification-report.spec.md) — conclusão = evidência; vereditos
  reproduzíveis e auditáveis (cond. 30);
- [`episode-trace`](../../p3/episode-trace.spec.md), [`audit-log`](../../p3/audit-log.spec.md) — **deve
  alimentar ou exigir** episode trace e audit log quando futuramente implementados
  ([condição 31](#19-relação-com-observability));
- [`failure-attribution`](../../p3/failure-attribution.spec.md) — **falha do governance-harness deve
  ser atribuível** ([condição 32](#19-relação-com-observability));
- [`entropy-audit`](../../p3/entropy-audit.spec.md) — **entropia causada pelo harness deve ser
  auditável** ([condição 33](#19-relação-com-observability));
- [`intervention-log`](../../p3/intervention-log.spec.md) — **intervenção relacionada ao harness deve
  ser registrada** ([condição 34](#19-relação-com-observability)).

---

## 16. Relação com P4 skills mínimas

O harness **governa o envelope** em que as skills operam — nenhuma skill *produz* governança:

| Skill mínima | Relação com o enforcement |
| --- | --- |
| [`intent-extraction`](../skills/intent-extraction-skill.spec.md) | a intenção é **Metadata**; o harness impede que vire policy ou autoridade (cond. 27, 28) |
| [`context-assembly`](../skills/context-assembly-skill.spec.md) | o harness verifica conformidade do pacote (Authority › … › Metadata; cinco critérios) |
| [`provenance-tagging`](../skills/provenance-tagging-skill.spec.md) | proveniência por fragmento sustenta a auditabilidade do veredito (cond. 30) |
| [`evidence-compilation`](../skills/evidence-compilation-skill.spec.md) | organiza evidência disponível/ausente; ausência de evidência ⇒ pendência/escalada, nunca aprovação (cond. 25, 35) |

As skills **propõem/montam/marcam/organizam**; o harness **aplica e verifica** o envelope sob o qual
elas operam — *guidance ≠ enforcement*.

---

## 17. Relação com P4 subagentes mínimos

| Subagente mínimo | Relação com o governance-harness |
| --- | --- |
| [`interface-subagent`](../subagents/interface-subagent.spec.md) | governa que linguagem **não** vira permissão e prompt **não** vira policy (cond. 27, 28) |
| [`retrieval-subagent`](../subagents/retrieval-subagent.spec.md) | verifica retrieval governado, tenant-scoped, sem bypass (cond. 21, 29) |
| [`verification-subagent`](../subagents/verification-subagent.spec.md) | **complementar e independente**: o harness aplica enforcement; o auditor verifica por evidência. O harness **não** substitui o auditor, e o auditor **não** é desativável pelo que fiscaliza (independência preservada) |

O harness **governa todos** os subagentes, mas **nenhum** lhe transfere — nem dele recebe —
autoridade de governança fora de specification (cond. 28).

---

## 18. Relação com runtime-harness

- O [`runtime-harness`](runtime-harness.spec.md) **coordena** o episódio; o governance-harness
  **aplica e verifica** a governança desse episódio. Coordenação ≠ governança: o runtime **invoca
  checagens**, mas **não substitui policy enforcement** — o enforcement determinístico é deste harness.
- **Composição, não contenção** ([Operational Harness Map §19](../../../harness-engineering/operational-harness-map.md)):
  o runtime-harness **delega** a governança a este substrato, que permanece **desacoplado e editável
  isoladamente**.
- O runtime **não vira policy engine** e o governance-harness **não vira runtime paralelo** (cond. 37):
  fronteiras explícitas evitam o "monólito distribuído com ilusão de independência".

---

## 19. Relação com observability

O governance-harness é **fonte de evidência auditável**, não verificador da própria evidência:

- **deve exigir** que decisões governadas sejam **auditáveis e rastreáveis** ([condição 30](#19-relação-com-observability));
- **deve alimentar ou exigir** episode trace e audit log quando futuramente implementados ([condição 31](#19-relação-com-observability));
- **falha** do harness **deve ser atribuível** por failure attribution ([condição 32](#19-relação-com-observability));
- **entropia** causada pelo harness **deve ser auditável** por entropy audit ([condição 33](#19-relação-com-observability));
- **intervenção** relacionada ao harness **deve ser registrada** por intervention log ([condição 34](#19-relação-com-observability)).

A produção de traces/episode packages/relatórios pertence ao **observability-harness** (futuro, **não
criado aqui**). Vale *"nenhuma execução sem trace"* `[AHE]`.

---

## 20. Relação com execution governance

O governance-harness **verifica** a governança da cadeia de execução; a **coordenação** da execução é
do runtime-harness e a **execução controlada** será do futuro **execution-harness** (**não criado
aqui**):

- registro (tool-registry) → decisão (service-contract) → permissão (tool-permission) → execução
  (tool-execution) → verificação (tool-result-verification);
- o harness **verifica conformidade** em cada elo e **impede bypass** de policy enforcement,
  operational boundaries, authority layer, tenant boundary ou escalation-policy (cond. 29);
- **não executa tool, não altera estado e não decide a operação** (cond. 12, 13, 14) — apenas
  aplica/verifica a regra e bloqueia/escala violações.

---

## 21. Critérios de aceite

A spec é aceita quando:

1. trata o governance-harness como **harness documental, não executável**, que **verifica a aplicação
   de governança sem implementá-la** — não é implementation harness, código, API nem policy engine
   executável (cond. 1–6);
2. preserva a **identidade** do harness: **não é** runtime, LLM, prompt, service decision nem
   verification-subagent, **não executa tool** e **não altera estado** (cond. 7–13);
3. **não decide a operação** (cond. 14) e **não substitui** policy enforcement, conflict-resolution,
   escalation-policy nem operational-boundaries (cond. 15–18);
4. **verifica** subordinação a core principles, authority layer, tenant boundary, policy enforcement
   determinístico, operational boundaries, conflict-resolution (em conflito) e escalation-policy (em
   incerteza/risco/ausência de evidência/conflito/limite de autoridade) (cond. 19–25);
5. **impede** guidance=enforcement (26), prompt=policy (27), captura de autoridade de governança por
   LLM/agente/runtime/subagente/tool (28) e **bypass** de tenant boundary/policy enforcement/
   operational boundaries/authority layer/escalation-policy (29);
6. exige decisões governadas **auditáveis e rastreáveis** (30) e **alimenta/exige** episode trace e
   audit log (31); falha/entropia/intervenção do harness **atribuíveis/auditáveis/registradas**
   (32–34);
7. exige **bloqueio, pendência de evidência ou escalada** quando a governança não pode ser satisfeita
   (35);
8. permanece **modular, revisável e subordinado a specification** (36) e **não vira** policy engine
   prematuro, runtime paralelo, meta-agente, executor, corretor automático ou implementação de
   governança (37);
9. **referencia** o cânone P0–P4 sem duplicá-lo, resumi-lo ou inventar doutrina; é revisável por
   humano.

---

## 22. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. trata o harness como **executável**, implementation harness, código, API, schema, policy engine
   executável ou runtime paralelo, ou o confunde com runtime, LLM, prompt, service decision ou
   verification-subagent (viola cond. 1–11, 37);
2. **implementa governança**, **decide a operação**, **executa tool** ou **altera estado** por conta
   própria (viola cond. 2, 12, 13, 14);
3. **substitui** policy enforcement, conflict-resolution, escalation-policy ou operational-boundaries
   (viola cond. 15–18);
4. **deixa de verificar** core principles, authority layer, tenant boundary, enforcement
   determinístico, operational boundaries, conflict-resolution ou escalation-policy nos gatilhos
   exigidos (viola cond. 19–25);
5. trata **guidance como enforcement** ou **prompt como policy** (viola cond. 26–27);
6. permite **LLM/agente/runtime/subagente/tool** assumir autoridade de governança, ou permite
   **bypass** de qualquer fronteira de governança (viola cond. 28–29);
7. dispensa **auditabilidade/rastreabilidade**, trace/audit log, ou a atribuição/auditoria/registro
   de falha, entropia ou intervenção (viola cond. 30–34);
8. **absorve silenciosamente** governança não satisfeita em vez de **bloquear, pendenciar ou escalar**
   (viola cond. 35);
9. cria **outro harness**, harness executável, subagente/skill executável, código, API, schema,
   frontend, backlog, YAML/JSON ou contrato machine-readable (viola guardrails / cond. 37);
10. **infere stack técnica**, vira plano de implementação, **resume/duplica/inventa** doutrina, ou
    reposiciona o YZI OS como chatbot, SaaS genérico, automação simples ou wrapper de LLM.

---

## 23. Quando bloquear, pendenciar evidência ou escalar

O governance-harness **exige bloqueio, pendência de evidência ou escalada quando a governança não
puder ser satisfeita** ([condição 35](#23-quando-bloquear-pendenciar-evidência-ou-escalar)), e
**impede absorção silenciosa**:

| Gatilho | Resposta obrigatória |
| --- | --- |
| **violação de policy enforcement** | bloquear (enforcement determinístico; cond. 15, 22, 26) |
| **conflito** | acionar `conflict-resolution` pela ordem de valores, ou escalar (cond. 16, 24) |
| **incerteza, risco, ausência de evidência, limite de autoridade** | acionar `escalation-policy` (cond. 17, 25) |
| **operational boundary excedida** | bloquear ou escalar (cond. 18, 23) |
| **tentativa de bypass** (tenant/policy/boundaries/authority/escalation) | bloquear (cond. 29) |
| **guidance apresentado como enforcement / prompt como policy** | rejeitar e registrar (cond. 26, 27) |
| **captura de autoridade de governança** por LLM/agente/runtime/subagente/tool | bloquear e escalar (cond. 28) |
| **decisão não auditável/rastreável** | pendenciar evidência (cond. 30) |

Regra-mãe: **nunca admissão silenciosa**. Governança não satisfeita → **bloqueio, pendência ou
escalada registrada**, conforme [`escalation-policy`](../../p2/escalation-policy.spec.md) e
[`intervention-log`](../../p3/intervention-log.spec.md).

---

## 24. Riscos arquiteturais evitados

| Risco | Como esta spec o evita |
| --- | --- |
| **Governança no prompt** | enforcement determinístico; prompt = Metadata; guidance ≠ enforcement (cond. 26, 27) |
| **Agente governando a si mesmo** | enforcement independente de agente; ninguém captura autoridade de governança (cond. 28) |
| **Déficit duplo** (intenção sem contexto / contexto sem intenção) | o envelope governado verifica conformidade do que skills/subagentes produzem (§16) |
| **Bypass de fronteira** | impedir bypass de tenant/policy/boundaries/authority/escalation (cond. 29) |
| **Harness com autoridade / definindo a regra** | não implementa governança; não é service decision; não decide a operação (cond. 2, 10, 14) |
| **Policy engine prematuro / implementação de governança** | harness documental; não vira policy engine, executor ou corretor (cond. 37) |
| **Conclusão por asserção** | vereditos reproduzíveis, auditáveis e rastreáveis (cond. 30) |
| **Absorção silenciosa** | bloqueio/pendência/escalada obrigatórios (cond. 35) |
| **Monólito distribuído** | composição, não contenção; desacoplado do runtime (§18) |
| **Falha não atribuível** | failure attribution / entropy audit / intervention log (cond. 32–34) |

---

## 25. Dependências

**Aprovadas (referenciadas, não duplicadas):**

- **Mapas/processo/par:** [`operational-harness-map.md`](../../../harness-engineering/operational-harness-map.md),
  [`controlled-execution-plan.md`](../../../implementation/controlled-execution-plan.md),
  [`runtime-harness.spec.md`](runtime-harness.spec.md),
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

**Futuras (pendentes; bloqueiam a promoção executável):** specs de governança do mapa
(consolidação `governance-harness`); os harnesses mínimos restantes (`observability`, `tenant`,
`execution`); o Implementation Harness / Spec Executor. Enquanto não aprovados, a promoção
**executável** da governança permanece bloqueada (contract-first, `P15`/`DO4`).

---

## 26. Próxima peça recomendada

Direção recomendada — **a confirmar separadamente, sem autorização de execução aqui**: o próximo
harness fundacional documental do conjunto mínimo ([Operational Harness Map §16](../../../harness-engineering/operational-harness-map.md)),
**`observability-harness.spec.md`** (substrato de evidência: traces, episode packages, relatórios de
verificação — *nenhuma execução sem trace*), seguido por `tenant-harness`; `execution-harness` entra
quando houver tool com efeito. Documental, **uma peça por vez, com checkpoint**. **Esta spec não
autoriza a próxima peça** e **não avança para o próximo harness**.

---

## 27. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/harnesses/governance-harness.spec.md`. Nenhum outro
   arquivo criado ou alterado.
2. **Natureza respeitada:** architecture-only · governance-first · harness-preparation · linguagem
   natural estruturada. Harness **documental, não executável**; **não** é implementation harness,
   policy engine executável, código, API, schema, runtime, YAML/JSON nem contrato
   machine-readable.
3. **Estrutura:** exatamente as **27 seções** exigidas.
4. **37 condições obrigatórias:** todas explícitas e referenciadas no corpo. **Condições 1–13
   aplicadas conforme a lista literal do operador** (§7), por ajuste aditivo direcionado que
   substituiu a reconstrução provisória anterior (§8 reforça 6–12). **Condições 14–37** mantidas
   como aplicadas na redação inicial. Nenhum trecho além do bloco 1–13 (e suas referências cruzadas)
   foi reescrito.
5. **Correção conceitual:** onda **P5→P4** registrada; divergência apenas de rotulagem.
6. **Cânone:** P0–P4, mapa de harnesses, plano de execução e `runtime-harness` **referenciados, não
   duplicados**; nenhuma doutrina nova inventada.
7. **Confirmação de fronteira:** **nenhum** outro harness (`observability`, `tenant`, `execution` ou
   qualquer outro), harness executável, implementation harness, subagente/skill executável, código,
   API, schema, frontend, backlog, YAML/JSON ou contrato machine-readable foi criado. Specs P0–P4,
   mapas e checkpoints anteriores **não** modificados. Nenhuma stack inferida.

**Parado aqui. Não avancei para o próximo harness.**

# execution-harness

> **Specification documental de harness (governança-first, execution-aware, harness-preparation,
> linguagem natural estruturada).** Quinta peça do conjunto de harnesses documentais da P4 — o
> **substrato de execução controlada**, que o [Operational Harness Map §16](../../../harness-engineering/operational-harness-map.md)
> prevê **assim que houver a primeira tool/serviço com efeito**. Fixa o **contrato documental do
> execution-harness** — o substrato que **verifica que a execução governada respeita a cadeia
> registro→decisão→permissão→execução→verificação** — **sem executar**, sem conceder permissão e sem
> virar harness executável. **Não** é machine-readable: não contém código, API, schema, YAML, JSON,
> DSL, pseudo-código, configuração nem contrato técnico executável. Apenas **referencia** o cânone
> aprovado; não o duplica, resume nem substitui.
>
> Onda: **P4** (harness documental) · Status: proposta para aprovação · Versão: v1 ·
> Data: 2026-06-04 · Documento normativo (DEVE / NÃO DEVE / NUNCA têm força contratual).
> Proveniência: `[HARNESS-RT]` `[PYR]` `[HE-GOV]` `[CE]` `[AHE]`.

> **Nota de proveniência das condições (transparência).** As **43 condições** estão agora **literais**
> conforme o operador. O briefing chegou em partes truncadas e foi completado por **ajustes aditivos
> direcionados sucessivos**: **8–20 e 39–43** na redação inicial; **1–7** num ajuste; e o bloco
> **21–38** em **passada única** (após receber 26–34), substituindo a reconstrução provisória e
> realinhando todas as referências cruzadas à numeração final. **Não há mais condição reconstruída.**
> *Observação fiel:* as condições **31 e 39** trazem o mesmo enunciado ("execução futura não contorne
> service contract/policy enforcement/tenant boundary/operational boundaries/authority layer") — ambas
> mantidas conforme a lista do operador (39 estava entre as preservadas); sinalizado para deduplicação,
> se desejada.

> **Correção conceitual registrada.** O [Operational Harness Map §8](../../../harness-engineering/operational-harness-map.md)
> rotula o `execution-harness` como **Onda P5**. A **decisão vigente do operador** posiciona os
> **harnesses documentais** na **P4**. Esta spec adota **P4**; divergência apenas de rotulagem de onda,
> sem alterar papel, fronteira ou doutrina.

---

## 1. Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `execution-harness` |
| **Tipo de peça** | harness operacional — **documental nesta fase** (não executável) |
| **Função primária** | verificação da execução controlada (cadeia registro→decisão→permissão→execução→verificação) |
| **Classe** | fundacional — entra **quando houver tool/serviço com efeito** ([Operational Harness Map §16](../../../harness-engineering/operational-harness-map.md)) |
| **Tenant-scope** | Global/instância (verificação por tenant; isolamento preservado) |
| **Proveniência** | `[HARNESS-RT]` `[PYR]` `[HE-GOV]` `[CE]` `[AHE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`operational-harness-map.md`](../../../harness-engineering/operational-harness-map.md) §4, §5, §6, §9.5, §14, §16, §19.
- [`controlled-execution-plan.md`](../../../implementation/controlled-execution-plan.md) §12, §13.
- [`runtime-harness.spec.md`](runtime-harness.spec.md), [`governance-harness.spec.md`](governance-harness.spec.md), [`observability-harness.spec.md`](observability-harness.spec.md), [`tenant-harness.spec.md`](tenant-harness.spec.md) (peças-par; §18–§21).
- Cadeia de execução P3: [`service-contract`](../../p3/service-contract.spec.md), [`tool-registry`](../../p3/tool-registry.spec.md), [`tool-permission`](../../p3/tool-permission.spec.md), [`tool-execution`](../../p3/tool-execution.spec.md), [`tool-result-verification`](../../p3/tool-result-verification.spec.md).
- [`specs-p0-p3-checkpoint.md`](../../specs-p0-p3-checkpoint.md). Specs P0–P4 em **§27 (Dependências)**.

---

## 2. Status, camada, onda e owner arquitetural

| Campo | Valor |
| --- | --- |
| **Status** | proposta para aprovação · architecture-only · governance-first · execution-aware |
| **Camada** | `specs/p4/harnesses` |
| **Onda** | **P4** (harness documental; correção P5→P4 registrada no topo) |
| **Owner arquitetural** | Execution / Arquitetura |
| **Natureza** | harness **documental**, **não** executável; **verifica** a execução governada, **não** executa |
| **Modularidade** | modular, revisável e subordinado a specification ([condição 42](#11-limites-do-harness)) |

---

## 3. Propósito

Fixar, como **contrato documental verificável**, **como o execution-harness verifica que a execução é
controlada** no YZI OS — garantindo que toda execução futura respeite a cadeia **registro
(tool-registry) → decisão (service-contract) → permissão (tool-permission) → execução (tool-execution)
→ verificação (tool-result-verification)**, dentro do tenant autorizado, sob policy enforcement,
operational boundaries e authority layer, com trace, evento auditável e verificação posterior. Esta
peça **não executa**, **não concede tool permission**, **não decide a operação** e **não altera
estado** — apenas **verifica** que a execução governada não contorna a cadeia nem a governança.

O propósito é operar, em fase documental, os invariantes da execução governada `[HARNESS-RT]`:
*decidir ≠ permitir ≠ executar ≠ verificar*; *o runtime aciona, não decide*; *LLM/agente/prompt não
executam tool diretamente*; *nenhuma tool executa sem permissão explícita registrada*; *nenhum
resultado é confiável sem verification*. O execution-harness é o **substrato-gate** onde se verifica
que o efeito operacional só ocorre sob a cadeia completa e auditável.

---

## 4. Escopo

Esta spec cobre, em linguagem natural estruturada:

1. a **definição documental** do execution-harness como substrato de verificação de execução (§6);
2. a distinção **verificação de execução ≠ execução** (§7, §11);
3. a **diferença** entre execution-harness, runtime, service, tool, service contract, tool registry,
   tool permission, tool execution e tool result verification (§8);
4. as **entradas e saídas conceituais** do harness (§9, §10);
5. as **relações** com P0–P4, os quatro harnesses-par e a execution governance (§12–§22);
6. os **critérios de aceite e rejeição** e o **protocolo de bloqueio/pendência/escalada** (§23–§25).

Tudo é **descritivo e revisável por humano**, jamais executável.

---

## 5. Fora de escopo

Esta spec **NÃO**:

- cria **checkpoint de harnesses** (guardrail explícito) nem qualquer outro harness ([condição 43](#5-fora-de-escopo));
- cria harness **executável**, implementation harness, executor real, runtime paralelo, policy engine,
  service, tool, automação ou orquestrador real ([condições 1–9, 43](#7-execution-harness-como-verificação-de-execução-não-execução));
- cria subagentes executáveis, skills executáveis, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, DSL, pseudo-código, configuração ou contrato machine-readable;
- infere stack técnica nem se transforma em plano de implementação;
- **decide operação, autoriza ação, concede tool permission, executa tool ou altera estado**
  ([condições 10–14](#7-execution-harness-como-verificação-de-execução-não-execução));
- substitui `service-contract`, `tool-registry`, `tool-permission`, `tool-execution` ou
  `tool-result-verification` ([condições 15–19](#7-execution-harness-como-verificação-de-execução-não-execução)).

---

## 6. Definição do harness

> **Execution-harness** = **substrato documental que verifica que a execução é controlada** —
> confirmando que toda execução futura respeita a cadeia **registro → decisão → permissão → execução →
> verificação**, dentro do tenant autorizado, sob governança, com trace, evento auditável e
> verificação posterior — **sem executar, sem decidir, sem conceder permissão e sem alterar estado**.
> Ele **verifica a execução**; não a realiza nem a contém. `[HARNESS-RT]` `[HE-GOV]`

Nesta fase, o execution-harness é **harness documental, não executável**: ele **verifica** execução
governada, mas **não executa**. Não é implementation harness, não é código, não é API, **não é
runtime**, **não é service**, **não é tool** e **não é executor**; **não decide operação**, **não
autoriza ação**, **não concede tool permission**, **não executa tool** nem **altera estado** (cond.
1–14). Opera a ordem obrigatória da execução governada (`tool-execution` §7): *registro → decisão
(service) → permissão → execução → verificação* — a execução é a **última etapa de ação** e só ocorre
quando as anteriores estão satisfeitas. Por delegação do runtime-harness ([Operational Harness Map
§9.1, §9.5, §19](../../../harness-engineering/operational-harness-map.md)), é o substrato onde o
**efeito** é verificado sob permissão e gate — *acionar ≠ decidir ≠ executar*.

---

## 7. Execution-harness como verificação de execução, não execução

O execution-harness existe para **verificar que a execução é controlada**, não para executá-la. Fixa,
como contrato, a fronteira entre o que ele **deve verificar/impedir/exigir** e o que **jamais pode
executar, decidir, autorizar ou alterar**.

**Bloco natureza/identidade — condições 1–14** *(1–14 literais conforme o operador — ver nota
de proveniência e a coluna **Status**)*:

| # | Condição | Status |
| --- | --- | --- |
| 1 | execution-harness é **harness documental, não harness executável** nesta fase | literal |
| 2 | **verifica** execução futura, mas **não implementa** execução | literal |
| 3 | **não é** implementation harness | literal |
| 4 | **não é** código | literal |
| 5 | **não é** API | literal |
| 6 | **não é** runtime | literal |
| 7 | **não é** service | literal |
| 8 | **não é** tool | literal |
| 9 | **não é** executor | literal |
| 10 | **não decide** operação | literal |
| 11 | **não autoriza** ação por conta própria | literal |
| 12 | **não concede** tool permission | literal |
| 13 | **não executa** tool | literal |
| 14 | **não altera** estado | literal |

**Bloco "não substitui" — condições 15–19 (literais):** o execution-harness **não substitui**
`service contract` (15), `tool registry` (16), `tool permission` (17), `tool execution` (18) nem
`tool result verification` (19) — apenas **verifica** que cada etapa ocorreu na ordem e sob governança.

**Bloco "deve verificar / exigir / impedir" — condições 20–39** *(todas literais conforme o operador):*

| # | Condição | Status |
| --- | --- | --- |
| 20 | deve verificar se existe **service contract aplicável** antes de qualquer execução futura | literal |
| 21 | deve verificar se a **tool está registrada** antes de qualquer tool execution futura | literal |
| 22 | deve verificar se há **tool permission explícita** antes de qualquer tool execution futura | literal |
| 23 | deve verificar **tenant scope** antes de qualquer execução futura | literal |
| 24 | deve verificar **tenant boundary** antes de qualquer execução futura | literal |
| 25 | deve verificar **policy enforcement** antes de qualquer execução futura | literal |
| 26 | deve verificar **operational boundaries** antes de qualquer execução futura | literal |
| 27 | deve verificar **authority layer** antes de qualquer execução futura | literal |
| 28 | deve verificar **episode trace e audit log** antes, durante ou depois da execução futura, quando aplicável | literal |
| 29 | deve verificar **evidência mínima** antes de tratar execução como confiável | literal |
| 30 | deve verificar que execução futura **não amplie escopo da permission** | literal |
| 31 | deve verificar que execução futura **não contorne** service contract, policy enforcement, tenant boundary, operational boundaries ou authority layer | literal |
| 32 | deve exigir **tool result verification** depois de tool execution futura | literal |
| 33 | deve exigir **verification report** quando a execução sustentar decisão, auditoria, falha, intervenção ou confiança operacional | literal |
| 34 | deve exigir **failure attribution** quando execução falhar, divergir, violar contrato ou produzir resultado inconsistente | literal |
| 35 | deve exigir **entropy audit** quando execução repetidamente degradar, gerar ruído, produzir drift ou indicar perda de controle | literal |
| 36 | deve exigir **intervention log** quando houver intervenção humana ou institucional sobre execução | literal |
| 37 | deve impedir **execução sem contrato, permissão, tenant scope, boundary, trace, audit log, evidência ou verification** quando aplicável | literal |
| 38 | deve impedir que **LLM, agente, prompt, runtime, subagente ou tool executem fora de contrato** | literal |
| 39 | deve verificar que **execução futura não contorne** service contract, policy enforcement, tenant boundary, operational boundaries ou authority layer | literal |

**Bloco "deve impedir / exigir / modularidade" — condições 40–43 (literais):** **impedir** que efeito
operacional **sem evento auditável** seja aceito (40); **exigir bloqueio, pendência de evidência ou
escalada** quando contrato, permissão, tenant, evidence, trace, log ou verification estiverem
ausentes, ambíguos ou conflitantes (41); **permanecer modular, revisável e subordinado a
specification** (42); e **não virar** executor prematuro, runtime paralelo, policy engine, service,
tool, automação, orquestrador real ou implementação de execução (43).

---

## 8. Diferença entre execution-harness, runtime, service, tool, service contract, tool registry, tool permission, tool execution e tool result verification

Extraída de [`service-contract`](../../p3/service-contract.spec.md) §8,
[`tool-permission`](../../p3/tool-permission.spec.md) §8, [`tool-execution`](../../p3/tool-execution.spec.md) §8,
[`tool-result-verification`](../../p3/tool-result-verification.spec.md) e
[Operational Harness Map §9.5](../../../harness-engineering/operational-harness-map.md), sem inventar
doutrina:

| Conceito | Papel | Decide? | Executa? | O execution-harness… |
| --- | --- | --- | --- | --- |
| **Execution-harness (este)** | substrato documental de **verificação** da execução | não | **não** | é o próprio substrato |
| **Runtime** | coordena/aciona (leve) | não | aciona, não executa | impede que **execute fora de contrato** (cond. 38); não é runtime (cond. 6) |
| **Service** | **decide** a operação dentro de contrato | **sim** | não | verifica que há **service contract**; não é service nem decide (cond. 7, 10, 15, 20) |
| **Tool** | **executa** o efeito sob permissão | não | **sim** | não é tool; verifica execução, não executa (cond. 8, 13, 18) |
| **Service contract** | decisão institucional em contrato | declara | não | **verifica** que existe aplicável; não o substitui (cond. 15, 20, 39) |
| **Tool registry** | que a tool **existe**, governada | declara | não | **verifica** registro; não o substitui (cond. 16, 21) |
| **Tool permission** | **quando/para quem/sob que limites** | declara | não | **verifica** permissão; **não concede** nem substitui (cond. 12, 17, 22) |
| **Tool execution** | **realiza** a ação sob permissão, traçada | não | **sim** | **verifica**; não executa nem substitui (cond. 13, 18, 28) |
| **Tool result verification** | **comprova** o resultado por evidência | não | não | **verifica**/**exige**; não a substitui (cond. 19, 32) |

Distinção essencial `[HARNESS-RT]`: **decidir ≠ permitir ≠ executar ≠ verificar**. O runtime
**aciona, não decide**; o service **decide**; a permission **autoriza**; a tool **executa**; a
verification **comprova**. O execution-harness **verifica que essa cadeia foi respeitada** — sem ser
nenhuma de suas etapas (cond. 6–19, 43).

---

## 9. Entradas conceituais do harness

Em linguagem natural (nenhuma é estrutura de máquina):

1. a **operação com efeito** a executar e a **cadeia** que a precede (registro, decisão, permissão);
2. o **service contract aplicável**, a **tool registry status**, a **tool permission** registrada e o
   **tenant scope** vigente;
3. as **policies/operational boundaries/authority layer** contra as quais a execução é verificada;
4. os **gates de aprovação** exigidos para ações arriscadas/destrutivas;
5. o **trace, evento auditável e verificação posterior** que a execução deve produzir;
6. os **sinais de ausência/ambiguidade/conflito** em contrato/permissão/tenant/evidence/trace/log/
   verification que exigem bloqueio/escalada.

O que chega como **acionamento direto** por LLM/agente/prompt/subagente/tool/runtime **não** é aceito
como execução válida (cond. 38); nenhuma execução sem registro/decisão/permissão é admitida (cond.
37).

---

## 10. Saídas conceituais do harness

1. um **veredito de execução controlada**: a cadeia registro→decisão→permissão→execução→verificação
   foi respeitada, dentro do tenant e da governança — ou **não**;
2. **bloqueio** de execução futura sem service contract, permission, registro, tenant válido ou
   verificação (cond. 37, 41);
3. **exigência de tool permission** (incl. gates de aprovação para ações arriscadas/destrutivas)
   (cond. 22);
4. **exigência de evento auditável** ao causar efeito e de **verificação posterior** do resultado
   (cond. 28, 32, 40);
5. **exigência de bloqueio, pendência de evidência ou escalada** quando contrato/permissão/tenant/
   evidence/trace/log/verification ausentes, ambíguos ou conflitantes (cond. 41);
6. veredito registrado de que a execução **não contornou** a governança (cond. 39).

Nenhuma saída é **execução, decisão, concessão de permissão ou alteração de estado** — essas pertencem
a tool/service/permission/estado sob as specs P3.

---

## 11. Limites do harness

Limites invioláveis (o harness os verifica e os respeita; nunca os relaxa):

- **verifica** execução, mas **não executa**; não é runtime, service, tool nem executor (6–9);
  **não decide, não autoriza, não concede permission, não executa, não altera estado** (cond. 10–14);
- **não substitui** as cinco etapas da cadeia (cond. 15–19);
- **deve verificar** contrato/registro/permissão/tenant scope/boundary/policy/operational boundaries/
  authority/trace+audit log/evidência mínima/não-amplição de escopo/não-contorno da governança
  (cond. 20–31, 39);
- **deve exigir** tool result verification, verification report, failure attribution, entropy audit e
  intervention log (cond. 32–36);
- **deve impedir** execução sem contrato/permissão/tenant/boundary/trace/audit log/evidência/
  verification, que LLM/agente/prompt/runtime/subagente/tool executem fora de contrato, e efeito sem
  evento auditável (cond. 37, 38, 40);
- **deve exigir** bloqueio/pendência/escalada nos gatilhos do §25 (cond. 41);
- **permanece modular, revisável e subordinado a specification** ([42](#11-limites-do-harness));
- **não vira** executor prematuro, runtime paralelo, policy engine, service, tool, automação,
  orquestrador real ou implementação de execução ([43](#5-fora-de-escopo)).

---

## 12. Relação com P0

Herda como invariantes **aprovados** ([P0](../../p0/)):

- [`core-operational-principles`](../../p0/core-operational-principles.spec.md) — `P14` (services/tools
  executam), `P6` (runtime aciona, não governa), `P2` (backend decide): execução nunca é do modelo;
- [`layer-authority-model`](../../p0/layer-authority-model.spec.md) — **deve verificar authority
  layer** (cond. 27): tool/LLM/agente não detêm autoridade; o harness impede execução fora de contrato (38);
- [`conflict-resolution`](../../p0/conflict-resolution.spec.md) — conflito na cadeia resolve-se por
  **ordem de valores** ou escalada (cond. 41);
- [`tenant-boundary`](../../p0/tenant-boundary.spec.md) — **deve verificar tenant scope/boundary** na
  execução (cond. 23, 24); nenhuma execução cruza tenant (verificado, não implementado).

---

## 13. Relação com P1

- [`operational-state`](../../p1/operational-state.spec.md) — o estado é a verdade; o harness **não
  altera estado** (cond. 14), apenas verifica que a execução o preserva;
- [`event-driven-state`](../../p1/event-driven-state.spec.md) — **deve verificar evento auditável** ao
  causar efeito/alterar estado (cond. 28) e **impedir efeito sem evento auditável** (cond. 40);
- [`tenant-state-isolation`](../../p1/tenant-state-isolation.spec.md) — execução sempre dentro do
  estado particionado; reforça cond. 23, 24;
- [`memory-model`](../../p1/memory-model.spec.md) — memória do modelo não autoriza nem executa.

---

## 14. Relação com P2

- [`policy-enforcement`](../../p2/policy-enforcement.spec.md) — **deve verificar policy enforcement
  satisfeito** (cond. 25); enforcement determinístico, operação fora de contrato é bloqueada;
- [`operational-boundaries`](../../p2/operational-boundaries.spec.md) — **deve verificar operational
  boundaries** (cond. 26) e que a execução **não as contorna** (cond. 31, 39);
- [`escalation-policy`](../../p2/escalation-policy.spec.md) — fundamenta a **exigência de escalada**
  (cond. 41) quando a cadeia não pode ser validada;
- [`behavioral-governance`](../../p2/behavioral-governance.spec.md), [`tenant-policy-pack`](../../p2/tenant-policy-pack.spec.md),
  [`tenant-retrieval-scope`](../../p2/tenant-retrieval-scope.spec.md), [`context-assembly`](../../p2/context-assembly.spec.md),
  [`context-provenance`](../../p2/context-provenance.spec.md), [`retrieval-governance`](../../p2/retrieval-governance.spec.md) —
  a execução verificada respeita governança, policy pack e escopo de tenant; o harness verifica, não
  aplica (isso é do governance-harness, §19).

---

## 15. Relação com P3

P3 é o **núcleo da cadeia** que este harness **verifica** (sem executar nem substituir):

- [`service-contract`](../../p3/service-contract.spec.md) — **verifica service contract aplicável
  antes da execução** (cond. 20); a **decisão** é do service, não do harness (cond. 10, 15);
- [`tool-registry`](../../p3/tool-registry.spec.md) — **verifica que a tool está registrada** (cond.
  21); não a substitui (cond. 16);
- [`tool-permission`](../../p3/tool-permission.spec.md) — **verifica tool permission explícita
  registrada** e os **gates de aprovação** (cond. 22); **não concede permission** (cond. 12, 17);
- [`tool-execution`](../../p3/tool-execution.spec.md) — **verifica a ordem**, que a execução **não
  amplia escopo** e que **cada invocação é traçada** (cond. 20–22, 30, 28); **não executa** (cond. 13,
  18);
- [`tool-result-verification`](../../p3/tool-result-verification.spec.md) — **verifica que o resultado
  é submetido a verificação posterior** e **impede confiança sem verification** (cond. 32, 29); não a
  substitui (cond. 19);
- observabilidade ([`episode-trace`](../../p3/episode-trace.spec.md), [`audit-log`](../../p3/audit-log.spec.md),
  [`failure-attribution`](../../p3/failure-attribution.spec.md), [`entropy-audit`](../../p3/entropy-audit.spec.md),
  [`intervention-log`](../../p3/intervention-log.spec.md), [`verification-report`](../../p3/verification-report.spec.md)) —
  alimenta/exige trace, audit log e evento auditável (cond. 28, 40); **exige** verification report,
  failure attribution, entropy audit e intervention log (cond. 33–36).

---

## 16. Relação com P4 skills mínimas

| Skill mínima | Relação com a verificação de execução |
| --- | --- |
| [`intent-extraction`](../skills/intent-extraction-skill.spec.md) | a intenção (Metadata) **não** aciona execução; o harness impede execução fora de contrato (cond. 38) |
| [`context-assembly`](../skills/context-assembly-skill.spec.md) | o contexto montado informa a decisão/permissão; o harness verifica a cadeia, não o pacote |
| [`provenance-tagging`](../skills/provenance-tagging-skill.spec.md) | proveniência sustenta a evidência mínima da execução verificada (cond. 29) |
| [`evidence-compilation`](../skills/evidence-compilation-skill.spec.md) | organiza a evidência de execução/resultado; ausência ⇒ pendência/escalada (cond. 41) |

As skills **propõem/montam/marcam/organizam**; **nenhuma executa** — o harness verifica que a execução
permanece da tool sob permissão, nunca da skill.

---

## 17. Relação com P4 subagentes mínimos

| Subagente mínimo | Relação com o execution-harness |
| --- | --- |
| [`interface-subagent`](../subagents/interface-subagent.spec.md) | impede que linguagem/proposta vire execução fora de contrato (cond. 38) |
| [`retrieval-subagent`](../subagents/retrieval-subagent.spec.md) | recuperação read-only; não executa efeito — o harness verifica essa fronteira |
| [`verification-subagent`](../subagents/verification-subagent.spec.md) | auditor independente; sustenta a **verificação posterior** do resultado (cond. 32, 33), preservando independência executor↔auditoria |

O futuro `execution-proposal-subagent` **propõe** execução; o harness **aplica o gate e verifica**
([Operational Harness Map §9.5](../../../harness-engineering/operational-harness-map.md)) — propor ≠
executar.

---

## 18. Relação com runtime-harness

- O [`runtime-harness`](runtime-harness.spec.md) **coordena/aciona** o episódio; o execution-harness
  **verifica a execução** que o runtime aciona. O runtime **aciona, não decide** a execução — o
  execution-harness **impede que o runtime execute fora de contrato** (cond. 38).
- **Composição, não contenção** ([Operational Harness Map §19](../../../harness-engineering/operational-harness-map.md)):
  o runtime-harness **delega a execução real** a este substrato; ambos permanecem desacoplados.
- O execution-harness **não vira runtime paralelo nem orquestrador real** (cond. 43).

---

## 19. Relação com governance-harness

- O [`governance-harness`](governance-harness.spec.md) **aplica/verifica governança**; o
  execution-harness **verifica que a execução respeita** policy enforcement, operational boundaries e
  authority layer (cond. 25–27) e **não os contorna** (cond. 31, 39).
- **Complementares:** governance julga conformidade; execution verifica que o **efeito** só ocorre sob
  a cadeia. O execution-harness **não é policy engine** (cond. 43) — verifica a execução, não aplica a
  regra.

---

## 20. Relação com observability-harness

- O [`observability-harness`](observability-harness.spec.md) verifica **presença/coerência da
  evidência**; o execution-harness exige que **cada invocação seja traçada** (cond. 28), **produza
  evento auditável** (cond. 40) e **resultado verificável** (cond. 32).
- **Complementares:** observability exige que a evidência exista; execution exige que a execução a
  **gere**. Juntos sustentam *nenhuma execução sem trace* e *nenhum resultado confiável sem
  verification* (cond. 29).

---

## 21. Relação com tenant-harness

- O [`tenant-harness`](tenant-harness.spec.md) verifica **isolamento multi-tenant**; o
  execution-harness verifica que **a execução ocorre dentro do tenant autorizado** (cond. 23, 24) e
  **não cruza tenant** — uma das fronteiras que a execução **não pode contornar** (cond. 39).
- **Complementares:** tenant garante a partição; execution garante que o efeito respeita essa
  partição. Nenhum dos dois implementa o isolamento (cond. 14, 43; tenant cond. 2).

---

## 22. Relação com execution governance

O execution-harness é o substrato que **verifica** a execution governance ao longo da cadeia (a
coordenação é do runtime, a governança do governance, a evidência do observability, a partição do
tenant):

- **registro** (tool-registry) → **decisão** (service-contract) → **permissão** (tool-permission) →
  **execução** (tool-execution) → **verificação** (tool-result-verification);
- o harness **verifica cada elo, a ordem e a não-amplição de escopo** (cond. 20–31) e **impede**
  execução sem cadeia, execução fora de contrato e confiança sem verification (cond. 29, 37, 38);
- **não executa, não autoriza, não concede permission, não decide, não altera estado** (cond. 10–14)
  — apenas verifica a cadeia e bloqueia/escala violações (cond. 41).

---

## 23. Critérios de aceite

A spec é aceita quando:

1. trata o execution-harness como **harness documental, não executável**, que **verifica execução sem
   executá-la** — não é runtime, service, tool, executor, implementation harness, código nem API, e
   não decide/autoriza/concede permission/executa/altera estado (cond. 1–14);
2. **não substitui** service contract, tool registry, tool permission, tool execution nem tool result
   verification (cond. 15–19);
3. **verifica** contrato aplicável, registro, permissão, tenant scope/boundary, policy enforcement,
   operational boundaries, authority layer, trace e audit log, evidência mínima, não-amplição de
   escopo e não-contorno, e **exige** tool result verification, verification report, failure
   attribution, entropy audit e intervention log (cond. 20–36);
4. **impede** execução sem contrato/permissão/tenant/boundary/trace/audit log/evidência/verification e
   que LLM/agente/prompt/runtime/subagente/tool **executem fora de contrato**, e exige que a execução
   **não contorne** a governança (cond. 31, 37, 38, 39);
5. **impede** efeito sem evento auditável (40) e **exige** bloqueio/pendência/escalada quando a cadeia
   não puder ser validada (41);
6. permanece **modular, revisável e subordinado a specification** (42) e **não vira** executor
   prematuro, runtime paralelo, policy engine, service, tool, automação, orquestrador real ou
   implementação de execução (43);
7. **referencia** o cânone P0–P4 sem duplicá-lo, resumi-lo ou inventar doutrina; é revisável por
   humano.

---

## 24. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. trata o harness como **executável**, implementation harness, código, API, schema, executor,
   runtime paralelo, policy engine, service, tool, automação ou orquestrador real (viola cond. 1–9,
   43);
2. **decide operação, autoriza ação, concede tool permission, executa tool ou altera estado** por
   conta própria (viola cond. 10–14);
3. **substitui** service contract, tool registry, tool permission, tool execution ou tool result
   verification (viola cond. 15–19);
4. **deixa de verificar** contrato/registro/permissão/tenant/policy/boundaries/authority/trace+audit/
   evidência/escopo/não-contorno, ou de **exigir** TRV/verification report/failure attribution/
   entropy audit/intervention log (viola cond. 20–36);
5. permite **execução sem service contract, sem permission ou sem registro**, ou que LLM/agente/
   prompt/runtime/subagente/tool **executem fora de contrato** (viola cond. 37, 38);
6. trata **resultado como confiável sem verification** ou dispensa a verificação posterior (viola
   cond. 29, 32);
7. permite execução **contornar** service contract/policy/tenant boundary/operational boundaries/
   authority layer, ou aceita **efeito sem evento auditável** (viola cond. 39, 40);
8. **absorve silenciosamente** ausência/ambiguidade/conflito na cadeia em vez de bloquear/pendenciar/
   escalar (viola cond. 41);
9. cria **checkpoint de harnesses**, outro harness, harness executável, subagente/skill executável,
   código, API, schema, frontend, backlog, YAML/JSON ou contrato machine-readable (viola guardrails /
   cond. 43);
10. **infere stack técnica**, vira plano de implementação, **resume/duplica/inventa** doutrina, ou
    reposiciona o YZI OS como chatbot, SaaS genérico, automação simples ou wrapper de LLM.

---

## 25. Quando bloquear, pendenciar evidência ou escalar

O execution-harness **impede absorção silenciosa** e **exige bloqueio, pendência de evidência ou
escalada quando contrato, permissão, tenant, evidence, trace, log ou verification estiverem ausentes,
ambíguos ou conflitantes** ([condição 41](#25-quando-bloquear-pendenciar-evidência-ou-escalar)):

| Gatilho | Resposta obrigatória |
| --- | --- |
| **service contract ausente/ambíguo** | bloquear (sem decisão não há execução — cond. 20, 37) |
| **tool não registrada** | bloquear (cond. 21, 37) |
| **tool permission ausente** | bloquear (cond. 22, 37) |
| **ordem da cadeia violada** | bloquear (registro→decisão→permissão→execução→verificação — cond. 20–22) |
| **tenant ausente/ambíguo/cruzado** | bloquear ou escalar (cond. 23, 24) |
| **policy/boundary/authority não satisfeitos ou contornados** | bloquear (cond. 25–27, 31, 39) |
| **ação arriscada sem gate** | tratar como falta de permissão; bloquear (cond. 22) |
| **ampliação de escopo da permission** | bloquear (cond. 30) |
| **execução sem trace / efeito sem evento auditável** | bloquear (cond. 28, 40) |
| **resultado sem verification** | não tratar como confiável; pendenciar/escalar (cond. 29, 32) |
| **acionamento direto / execução fora de contrato pelo modelo ou runtime** | bloquear (cond. 38) |
| **evidence/trace/log/verification insuficientes** | pendência de evidência ou escalada (cond. 29, 41) |

Regra-mãe: **nunca admissão silenciosa**. Falha na cadeia → **bloqueio, pendência ou escalada
registrada**, conforme [`escalation-policy`](../../p2/escalation-policy.spec.md) e
[`intervention-log`](../../p3/intervention-log.spec.md).

---

## 26. Riscos arquiteturais evitados

| Risco | Como esta spec o evita |
| --- | --- |
| **Execução sem decisão/permissão/registro** | verifica a cadeia completa; bloqueia (cond. 20–22, 37) |
| **Execução pelo modelo** | impede que LLM/agente/prompt/runtime/subagente/tool executem fora de contrato (cond. 38) |
| **Runtime decidindo execução** | aciona ≠ decide; impede execução fora de contrato (cond. 38) |
| **Ampliação de escopo** | verifica não-amplição do escopo da permission (cond. 30) |
| **Ação destrutiva sem gate** | exige tool permission com gates de aprovação (cond. 22) |
| **Efeito sem evento / sem trace** | exige trace+audit log e evento auditável (cond. 28, 40) |
| **Confiabilidade presumida** | resultado não é confiável sem verification (cond. 29, 32) |
| **Bypass de governança** | execução não contorna contract/policy/tenant/boundaries/authority (cond. 31, 39) |
| **Cruzamento cross-tenant na execução** | verifica tenant scope/boundary (cond. 23, 24) |
| **Executor prematuro / harness executando** | harness documental; não vira executor/runtime/orquestrador (cond. 1, 43) |

---

## 27. Dependências

**Aprovadas (referenciadas, não duplicadas):**

- **Mapas/processo/pares:** [`operational-harness-map.md`](../../../harness-engineering/operational-harness-map.md),
  [`controlled-execution-plan.md`](../../../implementation/controlled-execution-plan.md),
  [`runtime-harness.spec.md`](runtime-harness.spec.md), [`governance-harness.spec.md`](governance-harness.spec.md),
  [`observability-harness.spec.md`](observability-harness.spec.md), [`tenant-harness.spec.md`](tenant-harness.spec.md),
  [`specs-p0-p3-checkpoint.md`](../../specs-p0-p3-checkpoint.md).
- **P0:** `core-operational-principles`, `layer-authority-model`, `conflict-resolution`,
  `tenant-boundary`.
- **P1:** `operational-state`, `event-driven-state`, `tenant-state-isolation`, `memory-model`.
- **P2:** `policy-enforcement`, `behavioral-governance`, `operational-boundaries`,
  `escalation-policy`, `context-assembly`, `context-provenance`, `retrieval-governance`,
  `tenant-policy-pack`, `tenant-retrieval-scope`.
- **P3 (cadeia de execução, central):** `service-contract`, `tool-registry`, `tool-permission`,
  `tool-execution`, `tool-result-verification`; e `episode-trace`, `audit-log`, `failure-attribution`,
  `verification-report`, `entropy-audit`, `intervention-log`.
- **P4 skills mínimas:** `intent-extraction`, `context-assembly`, `provenance-tagging`,
  `evidence-compilation`.
- **P4 subagentes mínimos:** `interface-subagent`, `retrieval-subagent`, `verification-subagent`.

**Futuras (pendentes; bloqueiam a promoção executável):** o `execution-proposal-subagent`; specs de
execução do mapa (consolidação `execution-harness`); o Implementation Harness / Spec Executor; e a
**primeira tool/serviço com efeito** (gatilho de ativação — [Operational Harness Map §16](../../../harness-engineering/operational-harness-map.md)).
Enquanto não aprovados, a promoção **executável** da execução permanece bloqueada (contract-first,
`P15`/`DO4`).

---

## 28. Próxima peça recomendada

Direção recomendada — **a confirmar separadamente, sem autorização de execução aqui**: com os **cinco
harnesses** fundacionais documentais (runtime · governance · observability · tenant · execution)
escritos, a próxima peça natural é o **checkpoint do conjunto mínimo de harnesses** (consolidando os
cinco), **expressamente vedado neste briefing** — portanto só sob autorização própria. Alternativamente,
os **harnesses posteriores** do mapa (`context`, `retrieval`, `audit`, `escalation`). Documental, **uma
peça por vez, com checkpoint**. **Esta spec não autoriza a próxima peça**, **não avança para o próximo
harness** e **não cria checkpoint de harnesses**.

---

## 29. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/harnesses/execution-harness.spec.md`. Nenhum outro
   arquivo criado ou alterado.
2. **Natureza respeitada:** architecture-only · governance-first · execution-aware · harness-preparation ·
   linguagem natural estruturada. Harness **documental, não executável**; **não** é implementation
   harness, executor, runtime, service, tool, código, API, schema, YAML/JSON nem contrato
   machine-readable.
3. **Estrutura:** exatamente as **29 seções** exigidas.
4. **43 condições obrigatórias:** todas **explícitas e literais**, **sem status reconstruído** (§7).
   Aplicadas por ajustes aditivos sucessivos: 8–20/39–43 (inicial), 1–7 (ajuste), e **21–38 em passada
   única** (após 26–34), com **todas as referências cruzadas realinhadas** à numeração final do
   operador. Observação fiel: **31 e 39** têm enunciado idêntico ("não contorne…"), ambas mantidas
   conforme a lista; sinalizado para deduplicação se desejada.
5. **Correção conceitual:** onda **P5→P4** registrada; divergência apenas de rotulagem.
6. **Cânone:** P0–P4, mapa de harnesses, plano de execução e os quatro harnesses-par **referenciados,
   não duplicados**; nenhuma doutrina nova inventada.
7. **Confirmação de fronteira:** **nenhum checkpoint de harnesses**, nenhum outro harness, harness
   executável, implementation harness, subagente/skill executável, código, API, schema, frontend,
   backlog, YAML/JSON ou contrato machine-readable foi criado. Specs P0–P4, mapas e checkpoints
   anteriores **não** modificados. Nenhuma stack inferida.

**Parado aqui. Não avancei para o próximo harness nem para o checkpoint de harnesses.**

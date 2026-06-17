# tenant-policy-pack

> **Specification documental (governança-first, contract-first, linguagem natural estruturada).**
> Segunda spec do grupo **Multi-Tenant** da Onda P2. Define o **pacote de policies por tenant**: a
> instanciação **governada** das policies core para cada tenant — **subordinada** a `policy-enforcement`,
> `behavioral-governance`, `operational-boundaries`, `escalation-policy` e `retrieval-governance`. O
> policy pack **verticaliza por governança, não por exceção informal**, e **nunca** prevalece sobre a
> core policy. **Não** é machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código nem
> contrato técnico executável.
>
> Onda: P2 (governança + contexto) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `tenant-policy-pack` |
| **Camada** | `tenant` / `governance` |
| **Owner arquitetural** | Multi-Tenant / Governança |
| **Tenant-scope** | Per-tenant (instância das policies core) |
| **Classe de operação** | policy-institucional-por-tenant |
| **Candidatura** | `harness` (`tenant-harness` + `governance-harness`) |
| **Dependências** | [`tenant-configuration`](tenant-configuration.spec.md), [`policy-enforcement`](policy-enforcement.spec.md), [`behavioral-governance`](behavioral-governance.spec.md), [`operational-boundaries`](operational-boundaries.spec.md), [`escalation-policy`](escalation-policy.spec.md), [`retrieval-governance`](retrieval-governance.spec.md), [`conflict-resolution`](../p0/conflict-resolution.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`event-driven-state`](../p1/event-driven-state.spec.md) |
| **Proveniência** | `[HE-GOV]` `[PYR]` `[AHE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — governança fora da linguagem; isolamento multi-tenant; prevalência da regra core.
- [`/docs/foundation/manifesto.md`](../../foundation/manifesto.md) §4–§5 — governança determinística; configuração parametriza, não reescreve.
- [`/docs/specs/p2/tenant-configuration.spec.md`](tenant-configuration.spec.md) §8 — **policies** como eixo governado de verticalização (eixo 3).

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, o que é o **pacote de policies de um tenant**: a
**instanciação governada** das policies core para cada tenant — o eixo de verticalização §8.3 de
[`tenant-configuration`](tenant-configuration.spec.md). O policy pack **parametriza** o comportamento e
as fronteiras de um tenant **dentro** das policies core, **nunca acima** delas: ele herda
`policy-enforcement` (mecanismo), `behavioral-governance` (comportamento), `operational-boundaries`
(fronteiras), `escalation-policy` (escalada) e `retrieval-governance` (recuperação).

A spec **extrai** (não inventa nem resume) a governança determinística e a verticalização sem ruptura.
É a segunda spec do grupo Multi-Tenant.

---

## 2. Problema que resolve

Sem um pacote **governado**, a personalização de policies por cliente viraria **exceção informal**:
regras "combinadas" no prompt, brechas de cross-tenant, autoridade operacional concedida ao LLM/agente.
Isso dissolveria o enforcement determinístico e o isolamento.

Esta spec elimina o risco fixando que toda policy de tenant vive **dentro** de um pacote declarado,
auditável e subordinado à core policy — e que **alteração gera evento auditável**, conflito resolve a
favor da core, e ausência/ambiguidade bloqueia/escala.

---

## 3. Autoridade envolvida

- **Governa o policy pack:** as **policies core** (Authority) e o `governance-harness`/`tenant-harness`,
  com o **Estado** como verdade.
- **Aplica (não cria exceção):** o **Runtime/Services** aplicam o policy pack **dentro** do enforcement
  determinístico — não decidem conformidade nem ampliam escopo.
- **NÃO recebem autoridade do pack:** **LLM, agente, prompt e runtime** não ganham autoridade
  operacional via policy pack; **prompt não vira policy** (`P1`, `P12`).

---

## 4. Entradas esperadas

- As **policies core** que o pack instancia: [`policy-enforcement`](policy-enforcement.spec.md),
  [`behavioral-governance`](behavioral-governance.spec.md), [`operational-boundaries`](operational-boundaries.spec.md),
  [`escalation-policy`](escalation-policy.spec.md), [`retrieval-governance`](retrieval-governance.spec.md).
- A **configuração do tenant** ([`tenant-configuration`](tenant-configuration.spec.md)) que define o
  espaço de parametrização.

## 5. Saídas esperadas

- Um **pacote de policies por tenant** declarado, auditável e proveniente — instanciando as core
  policies sem sobrepô-las.
- Um **evento auditável** a cada alteração do pack ([`event-driven-state`](../p1/event-driven-state.spec.md)),
  preservando auditabilidade e observabilidade **por tenant**.

---

## 6. Contrato esperado (linguagem natural)

1. O tenant policy pack **instancia e herda** das policies core — `policy-enforcement`,
   `behavioral-governance`, `operational-boundaries`, `escalation-policy` e `retrieval-governance` — e
   lhes é **subordinado**.
2. O policy pack **NÃO PODE autorizar cross-tenant access** ([`tenant-boundary`](../p0/tenant-boundary.spec.md)).
3. O policy pack **NÃO PODE transformar prompt em policy**: policy crítica não nasce de linguagem
   ([`policy-enforcement`](policy-enforcement.spec.md), [`behavioral-governance`](behavioral-governance.spec.md)).
4. O policy pack **NÃO PODE dar ao LLM, agente, prompt ou runtime autoridade operacional**.
5. O policy pack **DEVE preservar auditabilidade e observabilidade por tenant**.
6. **Toda alteração do policy pack DEVE gerar evento auditável** ([`event-driven-state`](../p1/event-driven-state.spec.md)).
7. **Ausência, ambiguidade ou conflito** no policy pack **DEVE** gerar **bloqueio, pendência de
   evidência ou escalada** ([`escalation-policy`](escalation-policy.spec.md)).
8. **Quando o tenant policy pack conflitar com a core policy, a core policy prevalece**
   ([`conflict-resolution`](../p0/conflict-resolution.spec.md)).
9. A **verticalização DEVE ocorrer por policy pack governado**, **não por exceção informal**.

---

## 7. Herança das policies core

| Core policy | O que o policy pack instancia por tenant | Limite |
| --- | --- | --- |
| [`policy-enforcement`](policy-enforcement.spec.md) | enforcement determinístico aplicado ao tenant | não enfraquece o veredito; não vira Guidance |
| [`behavioral-governance`](behavioral-governance.spec.md) | comportamento governado do tenant | não nasce de prompt/persona |
| [`operational-boundaries`](operational-boundaries.spec.md) | fronteiras de ação do tenant | não expande o espaço de ação |
| [`escalation-policy`](escalation-policy.spec.md) | gatilhos/escalada do tenant | não suprime escalada |
| [`retrieval-governance`](retrieval-governance.spec.md) | governança de recuperação do tenant | não abre busca livre/cross-tenant |

O pack **escolhe dentro** de cada core policy; **nunca** a contradiz nem a suspende.

---

## 8. Prevalência e tratamento de conflito

1. **Core policy prevalece** sobre o policy pack do tenant, sempre.
2. **Conflito** entre packs, ou entre pack e core, resolve-se por
   [`conflict-resolution`](../p0/conflict-resolution.spec.md) a favor da core; o pack em conflito é
   **bloqueado ou escalado**.
3. **Ausência ou ambiguidade** de regra aplicável **não** é permissão: gera **bloqueio, pendência de
   evidência ou escalada** — nunca decisão silenciosa.
4. Toda resolução é **registrada** como evidência ([`event-driven-state`](../p1/event-driven-state.spec.md)).

---

## 9. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Manter o policy pack **subordinado** às policies core que instancia (§7).
2. Impedir que o pack autorize cross-tenant access.
3. Impedir que o pack transforme prompt em policy.
4. Impedir que o pack conceda autoridade operacional a LLM/agente/prompt/runtime.
5. Preservar auditabilidade e observabilidade por tenant.
6. Gerar evento auditável a cada alteração do pack.
7. Tratar ausência/ambiguidade/conflito por bloqueio/pendência de evidência/escalada.
8. Resolver conflito pack×core a favor da core policy.
9. Verticalizar apenas por pack governado, nunca por exceção informal.

---

## 10. Critérios de aceite

1. Referencia as policies core e a verticalização governada sem contradizê-las nem duplicá-las.
2. Fixa o pack como instância subordinada das cinco core policies (§6.1, §7).
3. Fixa as proibições: cross-tenant, prompt-como-policy, autoridade a LLM/agente/prompt/runtime.
4. Fixa auditabilidade/observabilidade por tenant e evento auditável em alteração.
5. Fixa ausência/ambiguidade/conflito → bloqueio/pendência/escalada e prevalência da core.
6. Fixa verticalização por pack governado, não por exceção informal; revisável por humano.

---

## 11. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Coloca o policy pack acima de qualquer core policy, ou permite suspendê-la.
2. Autoriza cross-tenant access.
3. Transforma prompt em policy.
4. Concede autoridade operacional a LLM/agente/prompt/runtime.
5. Quebra auditabilidade/observabilidade por tenant, ou não gera evento em alteração.
6. Trata ausência/ambiguidade/conflito como permissão (sem bloqueio/pendência/escalada).
7. Resolve conflito pack×core a favor do pack.
8. Permite verticalização por exceção informal.
9. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 12. Relação com as camadas do YZI OS

O policy pack opera na camada **RAG/XML/Policies** (governança) instanciada por **Tenant**: parametriza
o comportamento e as fronteiras do tenant **sob** o enforcement determinístico
([`policy-enforcement`](policy-enforcement.spec.md)) e **sobre** o Estado como verdade, preservando o
isolamento de [`tenant-boundary`](../p0/tenant-boundary.spec.md). O `governance-harness` aplica/verifica;
o `tenant-harness` administra; conflitos resolvem-se por
[`conflict-resolution`](../p0/conflict-resolution.spec.md). É o eixo §8.3 de
[`tenant-configuration`](tenant-configuration.spec.md).

---

## 13. Relação com specifications futuras

Segunda spec do grupo Multi-Tenant: sucede [`tenant-configuration`](tenant-configuration.spec.md) e
antecede `tenant-retrieval-scope` (eixo §8.4) — ver
[Specification Map](../../specification-engineering/specification-map.md). É a base das policies do
`tenant-harness`/`governance-harness`. **Não autoriza** a criação de `tenant-retrieval-scope` nem de
qualquer outra spec.

---

## 14. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Relação com o policy pack |
| --- | --- |
| **Skill** | sua saída é submetida ao pack do tenant; a skill não se autodeclara conforme |
| **Subagente** | opera dentro do pack; o `verification-subagent` checa conformidade |
| **Harness** | o `governance-harness` aplica o pack; o `tenant-harness` o administra |
| **Service** | aplica o pack dentro de contrato; não cria exceção |
| **Tool** | só executa sob decisão "permitido" do pack do tenant |
| **LLM / agente de código** | não recebe autoridade do pack; prompt não vira policy |

---

## 15. Método de verificação

1. **Subordinação:** verificar que nenhum pack se sobrepõe a uma core policy (prevalência da core).
2. **Proibições:** verificar ausência de cross-tenant, prompt-como-policy e autoridade indevida.
3. **Auditoria:** verificar que toda alteração do pack gera evento auditável por tenant.
4. **Lacuna/conflito:** introduzir ausência/ambiguidade/conflito ⇒ deve bloquear/pender/escalar.
5. **Observabilidade:** verificar auditabilidade e observabilidade por tenant.
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 16. Observabilidade esperada

- Registro, por tenant: pack vigente · core policies instanciadas · autoridade que o definiu · versão.
- **Evento auditável** por alteração do pack (o quê mudou, por quem, quando).
- Registro de bloqueios/pendências/escaladas por ausência/ambiguidade/conflito.
- Trilha auditável e read-only por tenant (`P9`, `DO6`).

---

## 17. Riscos arquiteturais evitados

- **Exceção informal** — policy "combinada" fora de pack governado.
- **Pack acima da core** — tenant suspendendo a regra core.
- **Cross-tenant via policy** — pack autorizando travessia de fronteira.
- **Prompt-como-policy** — regra crítica nascendo da linguagem.
- **Autoridade indevida** — pack elevando LLM/agente/prompt/runtime.
- **Alteração opaca** — mudança de pack sem evento auditável.

---

## 18. Fora de escopo

- **Não** redefine as policies core (apenas as **instancia** por tenant) nem o **escopo de retrieval
  por tenant** (`tenant-retrieval-scope`) — apenas o prepara e o referencia.
- **Não** define a configuração de tenant em geral (isso é `tenant-configuration`) — apenas o seu eixo
  de policies (§8.3 daquela spec).
- **Não** cria o `tenant-harness`/`governance-harness` executável nem nenhuma outra spec.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 19. Proveniência

`[HE-GOV]` Harness Engineering / Governança — policies por tenant sob enforcement determinístico;
evento auditável; prevalência da core. `[PYR]` Context→Intent→Specification — pack instancia **sob** a
constituição; não reescreve a lei. `[AHE]` Agentic Harness Engineering — multi-tenancy por pack
governado, não por exceção; isolamento preservado.

---

## 20. Fronteiras (o que NÃO está aqui)

- **Não** substitui as policies core nem o isolamento multi-tenant: é a spec que os **opera** como
  contrato de pacote de policies por tenant verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura nem `tenant-retrieval-scope` — apenas fixa o policy pack que as
  demais herdam.

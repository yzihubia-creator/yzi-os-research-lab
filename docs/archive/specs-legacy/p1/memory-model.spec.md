# memory-model

> **Specification documental (governança-first, linguagem natural estruturada).** Quarta e última
> spec da Onda P1 (State). Define as **quatro formas de memória** (working, episódica, semântica,
> procedural) e a **Referência Mestra**, fixando que a memória é **subordinada ao estado e à
> proveniência**: nunca sobrescreve estado, nunca cruza tenant, nunca contorna policies. **Não** é
> machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código nem contrato técnico
> executável.
>
> Onda: P1 (verdade operacional) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `memory-model` |
| **Camada** | `state` / `agents` |
| **Owner arquitetural** | Estado |
| **Tenant-scope** | Global/instância (definição global, instância por tenant) |
| **Classe de operação** | modelagem de memória |
| **Candidatura** | `gov-doc` + `service/tool` (memória episódica/semântica) |
| **Dependências** | [`operational-state`](./operational-state.spec.md), [`event-driven-state`](./event-driven-state.spec.md), [`tenant-state-isolation`](./tenant-state-isolation.spec.md), [`conflict-resolution`](../p0/conflict-resolution.spec.md) |
| **Proveniência** | `[PYR]` `[CE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P11` (contexto modular/recuperável), `P17` (estado > memória conversacional), `DO2`, `DO6`.
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §2 — quatro formas de memória; memória como ambiente que se administra; Referência Mestra.
- [`/docs/specs/p1/operational-state.spec.md`](./operational-state.spec.md) e [`tenant-state-isolation`](./tenant-state-isolation.spec.md) — estado-verdade; isolamento por tenant.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, o **modelo de memória** do YZI OS: quatro formas
distintas — **working, episódica, semântica, procedural** — cada uma com custo, isolamento e ciclo de
vida próprios, e a **Referência Mestra** que garante continuidade. A memória é **subordinada**: a
continuidade vem do estado e da Referência Mestra, **não** da memória do modelo; a memória nunca
sobrescreve estado, nunca cruza tenant, nunca governa decisão sem proveniência.

A spec **extrai** (não inventa nem resume) `P11`/`P17`/`DO2`/`DO6` e a filosofia de memória. Encerra
a Onda P1, completando o conjunto State: `operational-state` + `event-driven-state` +
`tenant-state-isolation` + `memory-model`.

---

## 2. Problema que resolve

Tratar "memória" como uma coisa só — um campo que se preenche e no qual o modelo "lembra" — colapsa
naturezas distintas, permite que conteúdo recuperado sem proveniência governe decisões, e abre caminho
para que a memória sobrescreva o estado ou contorne policies. É a porta para alucinação tratada como
verdade e para vazamento cross-tenant.

Esta spec elimina o risco distinguindo as quatro formas, exigindo proveniência, e subordinando a
memória ao estado, à fronteira de tenant e às policies.

---

## 3. Autoridade envolvida

- **Detém a verdade:** o **Estado** — a memória nunca o sobrescreve nem o substitui.
- **Governa o comportamento:** as **Policies/Specifications** — a memória nunca as contorna.
- **Administra a memória:** Services/Runtime, como **ambiente** (write/select/compress/isolate), sem
  conferir-lhe autoridade.
- **NÃO podem "lembrar" como verdade:** LLM, agente e prompt — não tratam memória como verdade
  operacional sem validação contra estado e proveniência (`P1`, `P17`).

---

## 4. Entradas esperadas

- A operação e seu recorte de memória relevante (working/episódica/semântica/procedural), com tenant
  e proveniência.
- O estado vigente e as policies aplicáveis (para validação de prevalência).

## 5. Saídas esperadas

- Memória **validada** (com proveniência, dentro do tenant) disponível para compor contexto; **ou**
- Memória **descartada, comprimida, isolada ou escalada** quando ambígua, contaminada ou sem
  proveniência.

---

## 6. Contrato esperado (linguagem natural)

1. A memória recuperada **DEVE** respeitar o **tenant scope** ([`tenant-state-isolation`](./tenant-state-isolation.spec.md)).
2. Memória recuperada **DEVE** possuir **proveniência**; memória **sem proveniência NÃO DEVE** governar decisão.
3. A memória **NÃO DEVE** sobrescrever estado.
4. A memória **NÃO DEVE** atravessar a tenant boundary.
5. A memória **NÃO DEVE** ser usada para contornar policies, specifications ou
   [`conflict-resolution`](../p0/conflict-resolution.spec.md).
6. LLM, agente ou prompt **NÃO DEVEM** "lembrar" algo como verdade operacional **sem validação contra
   estado e proveniência**.
7. Em **conflito memória × estado**, **o estado prevalece** (`P17`).
8. Em **conflito memória × policy**, **a policy prevalece** (`P12`).
9. Memória **ambígua, contaminada ou sem proveniência DEVE** ser **descartada, comprimida, isolada ou
   escalada** (`P11`; write/select/compress/isolate).
10. A **continuidade** vem do estado e da **Referência Mestra**, **não** da memória do modelo (`P3`, `P17`).

---

## 7. As quatro formas de memória e a Referência Mestra

Quatro formas distintas, cada uma com custo, isolamento e ciclo de vida próprios (`philosophy.md` §2):

| Forma | O que é | Natureza |
| --- | --- | --- |
| **Working** | a janela atual de trabalho | efêmera; descartável ao fim do ciclo |
| **Episódica** | log externo de interações/eventos | auditável; alinhada a `event-driven-state` |
| **Semântica** | conhecimento estruturado recuperado via RAG | governada por retrieval e proveniência |
| **Procedural** | capacidade codificada | versionada; governada por specification |

**Referência Mestra:** o mecanismo que garante continuidade entre sessões e sob troca de modelo, **a
partir do estado** — não da memória opaca do modelo. Tratá-las como uma coisa só é o erro que esta
spec evita.

---

## 8. Memória como ambiente administrado

A memória é **um ambiente que se administra, não um campo que se preenche** (`philosophy.md` §2). As
operações sobre memória/contexto são explícitas (`P11`):

- **Write** — registrar (memória episódica = eventos auditáveis).
- **Select** — escolher o recorte mínimo suficiente para a decisão.
- **Compress** — reduzir preservando proveniência.
- **Isolate** — manter fronteiras (por tenant e por papel), sem contaminação.

Nada permanece além do seu ciclo de vida; o descarte é governado.

---

## 9. Proveniência obrigatória

1. Toda memória que entra na composição de contexto **carrega proveniência** (origem, momento,
   confiança) (`DO6`).
2. **Memória sem proveniência NÃO governa decisão** — pode, no máximo, ser sinalizada e isolada.
3. A proveniência é a condição para a memória semântica (RAG) influenciar comportamento — coerente
   com "retrieval governa comportamento" (`P4`).

---

## 10. Prevalência e limites

- **Estado > memória:** em conflito, o estado prevalece; a memória nunca o sobrescreve (`P17`).
- **Policy > memória:** em conflito, a policy prevalece; a memória nunca contorna policy/spec/
  conflict-resolution (`P12`).
- **Tenant:** a memória nunca atravessa a fronteira de tenant.
- **Verdade:** LLM/agente/prompt não convertem "lembrança" em verdade sem validação contra estado e
  proveniência.

Estas prevalências aplicam a ordem de valores de
[`conflict-resolution`](../p0/conflict-resolution.spec.md) (verdade operacional e governança acima de
continuidade conversacional).

---

## 11. Tratamento de memória ambígua, contaminada ou sem proveniência

Quando a memória for **ambígua, contaminada ou sem proveniência**, a operação **DEVE** adotar uma de:

- **Descartar** — remover do contexto.
- **Comprimir** — reduzir a sinal mínimo verificável.
- **Isolar** — manter fora da composição que governa decisão.
- **Escalar** — registrar e escalar quando exigir decisão.

Nunca **promover** memória duvidosa a verdade operacional.

---

## 12. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Distinguir e isolar as quatro formas de memória (§7).
2. Derivar continuidade do estado e da Referência Mestra, não da memória do modelo.
3. Exigir proveniência para memória que governe decisão (§9).
4. Impedir memória de sobrescrever estado, cruzar tenant ou contornar policies/specs/conflict-resolution.
5. Aplicar prevalência estado>memória e policy>memória (§10).
6. Tratar memória ambígua/contaminada/sem proveniência por descarte/compressão/isolamento/escalada.
7. Impedir LLM/agente/prompt de tratar lembrança como verdade sem validação.
8. Produzir evidência auditável das operações de memória (`P9`, `DO6`).

---

## 13. Critérios de aceite

1. Referencia `P11`/`P17`/`DO2`/`DO6` e a filosofia de memória sem contradizê-las nem duplicá-las.
2. Define as quatro formas + Referência Mestra (§7) e a memória como ambiente administrado (§8).
3. Fixa proveniência obrigatória e a regra "sem proveniência não governa" (§9).
4. Fixa prevalência estado>memória e policy>memória e os limites de cruzamento/sobrescrita (§10).
5. Fixa o tratamento de memória duvidosa (§11).
6. Proíbe lembrança como verdade sem validação; é revisável por humano.

---

## 14. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Colapsa as quatro formas de memória em uma só.
2. Deriva continuidade da memória do modelo em vez do estado/Referência Mestra.
3. Deixa memória sem proveniência governar decisão.
4. Permite memória sobrescrever estado, cruzar tenant ou contornar policies/specs/conflict-resolution.
5. Inverte a prevalência (memória sobre estado, ou sobre policy).
6. Promove memória ambígua/contaminada a verdade operacional.
7. Permite LLM/agente/prompt tratar lembrança como verdade sem validação.
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 15. Relação com as camadas do YZI OS

A memória serve à composição de contexto (camada de contexto/retrieval) mas é **subordinada** ao
Estado (verdade) e às Policies (governança); o Runtime a administra como ambiente sem deter
autoridade; Agents/LLM não a convertem em verdade. Herda o isolamento de
[`tenant-state-isolation`](./tenant-state-isolation.spec.md) e a escada de
[`layer-authority-model`](../p0/layer-authority-model.spec.md).

---

## 16. Relação com specifications futuras

Encerra a Onda P1. Sustenta as specs de contexto/retrieval da Onda P2 (`context-assembly`,
`context-lifecycle`, `retrieval-governance`, `context-provenance`, `context-isolation`) e a
`agent-memory` da Onda P4 — ver
[Specification Map](../../specification-engineering/specification-map.md). A memória episódica
alinha-se a [`event-driven-state`](./event-driven-state.spec.md); a semântica, ao retrieval governado.

---

## 17. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Limite imposto pelo modelo de memória |
| --- | --- |
| **Skill** | usa memória com proveniência, dentro do tenant; nunca a promove a verdade |
| **Subagente** | recebe recorte de memória scoped; não cruza tenant nem sobrescreve estado |
| **Harness** | o `context-harness` administra write/select/compress/isolate; o `retrieval-harness` governa a memória semântica |
| **Service** | administra memória episódica/semântica como ambiente, sob contrato |
| **Tool** | produz memória episódica via evento auditável, com tenant context |
| **LLM / agente de código** | não "lembra" como verdade sem validação contra estado e proveniência |

---

## 18. Método de verificação

1. **Distinção e isolamento:** verificar que as quatro formas são distinguíveis e isoláveis.
2. **Continuidade:** verificar que a continuidade vem do estado/Referência Mestra, não da memória do
   modelo (sobrevive a troca de modelo).
3. Verificar que memória sem proveniência não governou decisão.
4. Verificar que nenhuma memória sobrescreveu estado, cruzou tenant ou contornou policy/spec/conflict.
5. Verificar a prevalência (estado>memória; policy>memória) em conflitos registrados.
6. Verificar que memória duvidosa foi descartada/comprimida/isolada/escalada.
7. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 19. Observabilidade esperada

- Registro, por uso de memória: forma · proveniência · tenant · decisão governada (ou não) · operação
  (write/select/compress/isolate) · descarte.
- Registro de conflitos memória×estado e memória×policy e da prevalência aplicada.
- Registro de memória duvidosa e seu tratamento (descarte/compressão/isolamento/escalada).
- Trilha auditável e read-only para o artefato que ela fiscaliza (`P9`, `DO6`).

---

## 20. Riscos arquiteturais evitados

- **Memória como uma coisa só** — colapso das quatro formas.
- **Lembrança como verdade** — modelo tratando memória como estado, sem validação (`P17`).
- **Memória sem proveniência governando** — conteúdo opaco dirigindo decisão.
- **Memória sobrescrevendo estado / contornando policy** — inversão da subordinação.
- **Memória cross-tenant** — vazamento via memória.
- **Continuidade frágil** — depender da memória do modelo em vez do estado.

---

## 21. Fora de escopo

- **Não** redefine o estado-verdade (`operational-state`), a evolução por evento
  (`event-driven-state`) nem o isolamento de estado (`tenant-state-isolation`) — apenas os referencia.
- **Não** define o pipeline de contexto/retrieval em detalhe (Onda P2) nem a `agent-memory` (Onda P4).
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 22. Proveniência

`[PYR]` Context→Intent→Specification — quatro formas de memória; memória como ambiente que se
administra; isolamento de memória de projeto; estado > memória conversacional. `[CE]` Context
Engineering — continuidade vem do arquivo (Referência Mestra); proveniência; trilha de auditoria
orgânica.

---

## 23. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P11`/`P17` nem a filosofia de memória: é a spec que os **opera** como contrato de
  modelo de memória verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa o modelo de memória que as demais herdam.

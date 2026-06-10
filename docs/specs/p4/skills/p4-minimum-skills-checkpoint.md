# Checkpoint — Conjunto Mínimo de Skills da P4

> **Documento de consolidação (checkpoint), consolidation-only · governance-first ·
> architecture/process-only · linguagem natural estruturada.** Consolida as **4 skills documentais
> mínimas** já aprovadas na P4. **Não** é nova skill, **não** cria skill executável, subagente,
> harness, código, API, schema, frontend, backlog, YAML/JSON nem contrato machine-readable. Apenas
> **referencia** as specs aprovadas; não as duplica, resume nem substitui.
>
> Camada: `specs/p4/skills` (consolidação) · Status: consolidação · Versão: v1 · Data: 2026-06-04
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]`.

> **Nota de reconstrução (transparência).** O briefing chegou truncado: o OBJETIVO sobreviveu em
> parte (consolidar as 4 skills, suas fronteiras, as specs P0–P3 governantes e "quais int…"), mas a
> **seção de estrutura obrigatória, o restante do objetivo, os guardrails e a entrega esperada não
> chegaram**. A estrutura abaixo foi **reconstruída** pelo padrão dos checkpoints consolidados já
> aprovados ([P0–P2](../../specs-p0-p2-checkpoint.md), [P0–P3](../../specs-p0-p3-checkpoint.md)) e
> pelos itens visíveis do objetivo. **Aberto a ajuste aditivo direcionado.**

---

## 1. Propósito do checkpoint

Consolidar, em documento curto e revisável, o **conjunto mínimo de skills** da P4 — quais foram
aprovadas, quais fronteiras cada uma respeita, quais specs P0–P3 as governam e como se integram —
sem iniciar qualquer nova peça. Marca o fechamento do conjunto mínimo do
[Skill Map §8](../../../skills/skill-map.md) e prepara (sem autorizar) a próxima fronteira.

---

## 2. Natureza do documento — o que é e o que NÃO é

**É:** checkpoint de consolidação · consolidation-only · governance-first · architecture/process-only
· linguagem natural estruturada.

**NÃO é:** nova skill · skill executável · subagente · harness · spec individual nova · código · API
· schema · frontend · backlog · sprint plan · YAML/JSON · DSL · contrato machine-readable.

Referencia as 4 specs de skill aprovadas; **não** as duplica nem as modifica.

---

## 3. As 4 skills mínimas aprovadas

| # | Skill | Grupo | Arquivo | Status |
| --- | --- | --- | --- | --- |
| 1 | `intent-extraction` | S-C Linguagem/Intenção | [intent-extraction-skill.spec.md](intent-extraction-skill.spec.md) | ✅ Aprovada |
| 2 | `context-assembly` | S-A Contexto | [context-assembly-skill.spec.md](context-assembly-skill.spec.md) | ✅ Aprovada |
| 3 | `provenance-tagging` | S-A Contexto | [provenance-tagging-skill.spec.md](provenance-tagging-skill.spec.md) | ✅ Aprovada (28 critérios) |
| 4 | `evidence-compilation` | S-D Verificação/Evidência | [evidence-compilation-skill.spec.md](evidence-compilation-skill.spec.md) | ✅ Aprovada (30 critérios) |

**Conjunto mínimo do Skill Map §8 — completo (4/4).** Todas documentais, não executáveis.

---

## 4. Fronteiras que cada skill respeita

Invariante comum: **nenhuma** decide operação, autoriza ação, executa tool ou altera estado; **nenhuma**
detém autoridade comportamental; todas são modulares, reutilizáveis e subordinadas a specification, e
**não** viram prompt gigante, persona ou mini-agente.

| Skill | Fronteiras específicas (resumo de referência) |
| --- | --- |
| `intent-extraction` | produz proposta como **Metadata**; distingue intenção **declarada / inferida / operacional validável**; intenção declarada não é verdade automática; intenção inferida não é autoridade; não substitui enforcement / service decision / permission / verification |
| `context-assembly` | monta **proposta** de pacote (não decisão); respeita os **cinco critérios** (relevância/suficiência/isolamento/economia/proveniência); previne **context rot** (poisoning/distraction/confusion/clash); não eleva Metadata acima de Authority; não transforma prompt em contexto governante; não usa memória do modelo como verdade |
| `provenance-tagging` | anexa proveniência **sem alterar o conteúdo** do fragmento; preserva proveniência na **compressão**; fragmento sem proveniência não governa decisão; não forja/eleva/remove proveniência; impede declarar origem sem evidência |
| `evidence-compilation` | organiza evidência **disponível e ausente** sem **concluir por asserção**; não cria evidência, não inventa fonte, não fabrica certeza; ausência de evidência ≠ sucesso; não substitui verification report / failure attribution / tool result verification / enforcement |

Fronteira compartilhada de tenant: todas **respeitam tenant scope** e **preservam tenant boundary**; e
tratam ambiguidade/ausência/conflito/contaminação por **isolamento, descarte, pendência de evidência
ou escalada** — nunca admissão silenciosa.

---

## 5. Specs P0–P3 que governam essas skills

| Skill | Specs governantes (aprovadas) |
| --- | --- |
| `intent-extraction` | `behavioral-governance` (P2); invariantes P0; observabilidade P3 · *(dep. futura: `institutional-agent`)* |
| `context-assembly` | `context-assembly`, `context-lifecycle`, `context-isolation`, `context-provenance`, `retrieval-governance` (P2); P0; `operational-state`, `memory-model`, `tenant-state-isolation` (P1); observabilidade + `service-contract` (P3) |
| `provenance-tagging` | `context-provenance` (principal), `context-assembly`, `context-isolation` (P2); P0; `memory-model` (P1); observabilidade P3 |
| `evidence-compilation` | `verification-report`, `tool-result-verification` (principais), `failure-attribution`, `episode-trace`, `audit-log`, `entropy-audit`, `intervention-log` (P3); `context-provenance` (P2); P0 |

**Regra herdada:** sem spec aprovada que a governe, não há skill (contract-first, `P15`/`DO4`).

---

## 6. Integração entre as 4 skills (como compõem o ciclo)

As skills formam um **ciclo governado de contexto a evidência**, sem que nenhuma assuma autoridade:

> `intent-extraction` (intenção → proposta/Metadata) → `context-assembly` (proposta de pacote de
> contexto) ← `provenance-tagging` (proveniência por fragmento, insumo da montagem e da evidência) →
> `evidence-compilation` (organiza evidência disponível/ausente para sustentar verificação/auditoria).

- `provenance-tagging` **apoia** `context-assembly` (critério proveniência) e `evidence-compilation`
  (vínculo evidência↔origem).
- `evidence-compilation` **apoia** `verification-report` e `tool-result-verification` (P3), sem
  substituí-los.
- A decisão permanece dos **services**, a execução das **tools**, a verdade do **estado**, a
  governança das **policies** — as skills apenas **propõem, montam, marcam e organizam**.

---

## 7. Invariantes preservados pelo conjunto mínimo

LLM sem autoridade · runtime coordena mas não governa · estado é verdade · evento é mudança
verificável · tenant boundary inviolável · contexto é pacote governado (Authority › … › Metadata) ·
proveniência por fragmento é obrigatória · retrieval é face contextual da governança · conclusão =
evidência (nunca asserção) · observability antes de execução confiável · **nenhuma skill decide,
autoriza, executa ou altera estado**; todas são governadas por specification.

---

## 8. O que NÃO foi criado (confirmação de fronteira)

Em todo o conjunto mínimo de skills da P4: **nenhuma** skill executável, subagente, harness
executável, implementation harness, código, API, schema, frontend, backlog, sprint plan, roadmap
técnico, plano de implementação, YAML/JSON, DSL, pseudo-código ou contrato machine-readable foi
criado. Specs P0–P3, mapas anteriores e checkpoints **não** foram modificados. Nenhuma stack técnica
inferida.

---

## 9. Próxima fronteira recomendada

Direção recomendada — **a confirmar separadamente, sem autorização de execução aqui**:

- **(a)** demais skills do Skill Map, uma por vez (`context-curation`, `retrieval-query`,
  `synthesis`, `failure-diagnosis`, `escalation-trigger`); ou
- **(b)** início dos **subagentes mínimos** documentais ([Subagent Map §8](../../../subagents/subagent-map.md)):
  `interface-subagent`, `retrieval-subagent`, `verification-subagent` (independência do auditor desde
  o início).

Em ambos os casos: documental, uma peça por vez, com checkpoint. **Este documento não autoriza a
próxima peça.**

---

## 10. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/skills/p4-minimum-skills-checkpoint.md`. Nenhum outro
   arquivo criado ou alterado.
2. **Natureza respeitada:** consolidation-only · governance-first · architecture/process-only ·
   linguagem natural estruturada. **Não** é nova skill, skill executável, subagente, harness, spec
   individual nova, código, API, schema, YAML/JSON ou contrato machine-readable.
3. **Consolidação:** as 4 skills mínimas aprovadas (intent-extraction, context-assembly,
   provenance-tagging, evidence-compilation), suas fronteiras, as specs P0–P3 governantes, a
   integração entre elas e os invariantes preservados — **referenciados, não duplicados**.
4. **Reconstrução sinalizada:** estrutura reconstruída pelo padrão dos checkpoints P0–P2/P0–P3
   (briefing truncado na estrutura/objetivo/guardrails/entrega). **Aberto a ajuste aditivo.**
5. **Confirmação de fronteira:** nenhuma skill executável, subagente, harness, código, API, schema,
   frontend, backlog, YAML/JSON ou contrato machine-readable foi criado.

**Parado aqui. Não avancei para a próxima peça.**

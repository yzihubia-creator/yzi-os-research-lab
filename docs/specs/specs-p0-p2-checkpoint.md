# Checkpoint Consolidado — Specs P0–P2

> **Documento de consolidação (consolidation-only, governance-first, architecture/process-only).**
> Consolida o que as ondas **P0, P1 e P2** da Fase 8 já fixaram, **antes** de avançar para P3. **Não é
> uma nova spec operacional**, plano técnico, backlog, roadmap de código nem contrato machine-readable.
> Não modifica nenhuma spec; apenas **referencia e consolida**.
>
> Fase: 8.1 · Status: proposta para aprovação · Data: 2026-06-03 · Linguagem natural estruturada.

---

## 1. Propósito do checkpoint

Registrar, de forma curta e revisável, o **estado estabilizado** das specs P0–P2: quais existem, quais
invariantes estão fechados, quais decisões não devem ser reabertas sem revisão formal, quais
dependências P3 pode assumir como verdade, quais riscos foram reduzidos e qual é a próxima fronteira
recomendada. Serve de **base de partida confiável** para P3, sem reabrir o que já foi aprovado.

---

## 2. Status das specs P0–P2 (inventário)

Todas aprovadas e concluídas. **20 specs**, todas documentais, em linguagem natural estruturada.

**P0 — Core / autoridade / conflito / tenant boundary** (4)
- [`core-operational-principles`](p0/core-operational-principles.spec.md)
- [`layer-authority-model`](p0/layer-authority-model.spec.md)
- [`conflict-resolution`](p0/conflict-resolution.spec.md)
- [`tenant-boundary`](p0/tenant-boundary.spec.md)

**P1 — Estado** (4)
- [`operational-state`](p1/operational-state.spec.md)
- [`event-driven-state`](p1/event-driven-state.spec.md)
- [`tenant-state-isolation`](p1/tenant-state-isolation.spec.md)
- [`memory-model`](p1/memory-model.spec.md)

**P2 — Governança / Contexto / Multi-Tenant** (12)
- Governance: [`policy-enforcement`](p2/policy-enforcement.spec.md) · [`behavioral-governance`](p2/behavioral-governance.spec.md) · [`operational-boundaries`](p2/operational-boundaries.spec.md) · [`escalation-policy`](p2/escalation-policy.spec.md)
- Context/Retrieval: [`context-assembly`](p2/context-assembly.spec.md) · [`context-lifecycle`](p2/context-lifecycle.spec.md) · [`context-isolation`](p2/context-isolation.spec.md) · [`context-provenance`](p2/context-provenance.spec.md) · [`retrieval-governance`](p2/retrieval-governance.spec.md)
- Multi-Tenant: [`tenant-configuration`](p2/tenant-configuration.spec.md) · [`tenant-policy-pack`](p2/tenant-policy-pack.spec.md) · [`tenant-retrieval-scope`](p2/tenant-retrieval-scope.spec.md)

---

## 3. Invariantes consolidados (fechados)

Fixados pelas specs acima; **estáveis** e herdados por P3:

1. **Estado persistido é a verdade operacional**; a conversa é projeção, não verdade (P1).
2. **O estado evolui apenas por eventos auditáveis**; nada altera estado sem evento (P1).
3. **Distribuição de autoridade em 9 camadas**; o **LLM não tem autoridade operacional**; o runtime
   coordena, não governa (P0).
4. **Paradoxo do Metadado** — `Authority › Exemplar › Constraint › Rubric › Metadata`; o **prompt é
   Metadata** e nunca sobrepõe Authority (P0/P2).
5. **Isolamento multi-tenant é invariante de segurança**; **nada** (estado, memória, contexto, policies,
   traces, evidências, retrieval) cruza a fronteira de tenant; **soberania de dados** preservada (P0/P1/P2).
6. **Enforcement é determinístico e pós-geração**; policy crítica **não** vive em prompt; **Guidance ≠
   Enforcement** (P2).
7. **Conflitos resolvem-se por value-order**, com prevalência da regra/policy core sobre instância de
   tenant (P0/P2).
8. **Escalation é mecanismo de governança, não falha**; ausência/ambiguidade/conflito → bloqueio,
   pendência de evidência ou escalada registrada (P2).
9. **Contexto é perecível e governado** — montado just-in-time, modular, isolado, com ciclo de vida
   (write/select/compress/isolate/discard/escalate); **context rot prevenido** (P2).
10. **Proveniência é obrigatória**; fonte/fragmento **sem proveniência suficiente não governa decisão**;
    proveniência, auditabilidade e observabilidade são transversais (P2).
11. **Retrieval é a face contextual da governança** — não é busca livre; tenant-scoped, policy-scoped,
    authority-aware, provenance-aware, auditável (P2).
12. **Verticalização ocorre por configuração governada** (configuration/contracts/policies/retrieval
    scope/services-tools autorizados), **não por ruptura/fork/exceção informal** (P2).

---

## 4. Decisões estabilizadas (não reabrir sem revisão formal)

- O conjunto **P1–P18 + DO1–DO10** e a **value-order** de resolução de conflito (P0).
- O **modelo de 9 camadas de autoridade** e a posição do LLM como motor sem autoridade.
- O **Paradoxo do Metadado** e a ordem de prioridade do pacote de contexto.
- A **fronteira de tenant** como invariante inviolável e a **soberania de dados**.
- O **enforcement determinístico** e a separação Guidance × Enforcement.
- A natureza **documental, governance-first, contract-first** das specs (sem código/contrato executável).

Reabrir qualquer um destes exige **revisão formal**, não ajuste informal em P3.

---

## 5. Dependências que P3 pode assumir como verdade

P3 pode construir sobre, sem redefinir:

- **Estado e eventos** (P1) como substrato de verdade e auditoria.
- **Autoridade, conflito e tenant boundary** (P0) como leis fixas.
- **Governança** (policy-enforcement, behavioral-governance, operational-boundaries, escalation-policy)
  como mecanismo de comportamento e fronteira.
- **Contexto e retrieval** (assembly, lifecycle, isolation, provenance, retrieval-governance) como
  logística governada do que o agente considera.
- **Verticalização multi-tenant** (configuration, policy-pack, retrieval-scope) como o modo único e
  governado de personalizar um tenant.

P3 **herda** esses contratos; não os reescreve.

---

## 6. Riscos arquiteturais reduzidos por P0–P2

- **Governança no prompt** (probabilística) → substituída por enforcement determinístico.
- **LLM/agente/runtime decidindo verdade ou autoridade** → autoridade fixada fora da linguagem.
- **Vazamento cross-tenant** (estado, memória, contexto, retrieval, evidências) → isolamento por
  construção + soberania de dados.
- **Context rot / poisoning / distraction / confusion / clash** → contexto perecível, isolado e
  proveniente.
- **Decisão não auditável / falha não atribuível** → proveniência e observabilidade obrigatórias.
- **Verticalização por fork/exceção** → verticalização só por configuração governada.
- **Estado corrompido por escrita não auditável** → evolução só por eventos.

---

## 7. Próxima fronteira recomendada

Avançar para a **Onda P3 do Specification Map** — ver
[Specification Map](../specification-engineering/specification-map.md) e
[Controlled Execution Plan](../implementation/controlled-execution-plan.md). Pelo que P0–P2 já cobrem
(princípios, estado, governança, contexto/retrieval, multi-tenant), a fronteira natural seguinte recai
sobre as camadas **operacionais/de execução e evidência** ainda não especificadas — candidatas a
**execução controlada, observabilidade/auditoria e tools/services governados** — sempre como specs
documentais, uma por vez, sob autorização explícita.

> **Recomendação, não autorização.** O conjunto exato e a ordem de P3 devem ser confirmados contra o
> Specification Map no início da próxima fase. **Este checkpoint não inicia P3.**

---

## 8. Fronteiras (o que este documento NÃO é)

- **Não** é nova spec operacional, plano de implementação, backlog, roadmap de código nem contrato
  machine-readable.
- **Não** infere stack técnica nem transforma decisões em plano de implementação.
- **Não** modifica nenhuma spec P0/P1/P2 — apenas as referencia e consolida.
- **Não** autoriza nem inicia P3 — apenas recomenda a fronteira seguinte.

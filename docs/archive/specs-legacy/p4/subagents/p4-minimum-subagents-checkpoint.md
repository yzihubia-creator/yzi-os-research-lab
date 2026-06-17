# Checkpoint — Conjunto Mínimo de Subagentes da P4

> **Documento de consolidação (checkpoint), consolidation-only · governance-first ·
> architecture/process-only · linguagem natural estruturada.** Consolida os **3 subagentes
> documentais mínimos** já aprovados na P4. **Não** é novo subagente, **não** cria subagente
> executável, skill executável, harness, código, API, schema, frontend, backlog, YAML/JSON nem
> contrato machine-readable. Apenas **referencia** as specs aprovadas; não as duplica, resume nem
> substitui.
>
> Camada: `specs/p4/subagents` (consolidação) · Status: consolidação · Versão: v1 · Data: 2026-06-04
> Proveniência: `[CE]` `[PYR]` `[HE-GOV]` `[AHE]` `[HARNESS-RT]`.
>
> *Estrutura alinhada às 14 seções obrigatórias confirmadas pelo operador; path confirmado.*

---

## 1. Propósito do checkpoint

Consolidar, em documento curto e revisável, o **conjunto mínimo de subagentes** da P4 — quais foram
aprovados, o papel e as fronteiras de cada um, as specs P0–P3 que os governam, como se integram e
como compõem as skills mínimas — sem iniciar qualquer nova peça. Marca o fechamento do conjunto
mínimo do [Subagent Map §8](../../../subagents/subagent-map.md) e prepara (sem autorizar) a próxima
fronteira. **Não é novo subagente nem peça executável** — apenas referencia o que já foi aprovado.

---

## 2. Status dos 3 subagentes mínimos

| Onda / bloco | Entrega | Status |
| --- | --- | --- |
| P4 · Preparation Map | `p4-preparation-map.md` | ✅ Aprovado |
| P4 · Skills mínimas (4) + checkpoint | intent-extraction · context-assembly · provenance-tagging · evidence-compilation | ✅ Aprovados |
| **P4 · Subagentes mínimos (3)** | interface · retrieval · verification | ✅ **Aprovados** |
| P4 · Checkpoint dos subagentes mínimos | **este documento** | — consolidação |

**Conjunto mínimo de subagentes do Subagent Map §8 — completo (3/3).** Todos documentais, não
executáveis. Próximo bloco (harnesses) **não iniciado**.

---

## 3. Lista dos subagentes aprovados

| # | Subagente | Grupo | Arquivo | Critérios |
| --- | --- | --- | --- | --- |
| 1 | `interface-subagent` | Sub-A Interface | [interface-subagent.spec.md](interface-subagent.spec.md) | 33 |
| 2 | `retrieval-subagent` | Sub-B Recuperação | [retrieval-subagent.spec.md](retrieval-subagent.spec.md) | 38 |
| 3 | `verification-subagent` | Sub-D Verificação | [verification-subagent.spec.md](verification-subagent.spec.md) | 34 |

Todos: documentais · governados por specification · sem autoridade comportamental · revisáveis por
humano.

---

## 4. Papel de interface-subagent

- **Papel:** media a interação entre **linguagem humana, intenção operacional candidata, contexto
  governado e resposta institucional** — traduz intenção em **operação proposta (Metadata)**.
- **Compõe:** `intent-extraction`, `context-assembly` (apoia-se em `provenance-tagging`,
  `evidence-compilation`).
- **Specs governantes:** `behavioral-governance`, `policy-enforcement`, `operational-boundaries`,
  `escalation-policy`, `context-assembly`, `context-provenance` (P2); invariantes P0; observabilidade
  P3.
- **Não:** chatbot/persona/LLM com autoridade; não decide, não autoriza, não executa, não altera
  estado; não transforma linguagem em permissão nem prompt em policy; não amplia authority layer; usa
  intenção como **leitura** (não verdade) e contexto como **proposta** (não prompt solto).

---

## 5. Papel de retrieval-subagent

- **Papel:** **recuperação governada read-only** dentro do escopo e da autoridade do tenant — a face
  contextual da governança, com proveniência por fragmento.
- **Compõe:** `provenance-tagging` (+ futuras `retrieval-query`, `context-curation`).
- **Specs governantes:** `retrieval-governance`, `tenant-retrieval-scope`, `tenant-policy-pack`,
  `context-assembly`, `context-isolation`, `context-provenance`, `operational-boundaries` (P2); P0;
  `memory-model`, `tenant-state-isolation` (P1); observabilidade P3.
- **Não:** busca livre/RAG autônomo/crawler/ferramenta/decisor; não recupera cross-tenant; não eleva a
  autoridade do recuperado nem Metadata>Authority; não permite prompt/LLM expandirem escopo; não monta
  o pacote final; **reporta, não inventa**.

---

## 6. Papel de verification-subagent

- **Papel:** **auditor independente** — verifica conclusões, conformidade, evidência e fronteiras de
  forma independente de quem executou/recuperou/mediou; emite **veredito/parecer por evidência**, não
  por asserção.
- **Compõe:** `evidence-compilation` (+ futura `failure-diagnosis`).
- **Specs governantes:** `verification-report`, `tool-result-verification`, `failure-attribution`,
  `episode-trace`, `audit-log`, `entropy-audit`, `intervention-log` (P3); `escalation-policy`,
  `context-provenance` (P2); P0.
- **Não:** executor/tool/service/decisor/LLM com autoridade/policy engine/juiz final; não decide, não
  corrige, não altera estado; não substitui report/attribution/tool-result-verification; **independência**
  (não se verifica) e **controlabilidade read-only** (não-desativável pelo que fiscaliza); ausência de
  evidência ≠ aprovação.

---

## 7. Fronteiras comuns dos subagentes

Invariante comum a todos: **nenhum** decide operação, autoriza ação, executa tool ou altera estado;
**nenhum** detém autoridade comportamental; todos são **modulares, limitados, revisáveis e
subordinados a specification**, e **não** viram chatbot, persona, runtime, executor ou mini-agente
autônomo. Todos **respeitam tenant scope** e **preservam tenant boundary**, e tratam
ambiguidade/lacuna/conflito/contaminação por **pendência de evidência ou escalada** — nunca admissão
silenciosa.

**Integração (ciclo governado mínimo):** `interface-subagent` (medeia → propõe) → **encaminha** ao
`retrieval-subagent` quando precisa de contexto → **encaminha** ao `verification-subagent` quando
conformidade/evidência precisa ser verificada. A delegação preserva **atenuação de privilégio**
(privilégio só decresce); a **independência do auditor** é estrutural (quem mediou ou recuperou não se
verifica). Decisão é dos services, execução das tools, verdade do estado, governança das policies.

---

## 8. Relação com as skills mínimas

Cada subagente **compõe** skills mínimas (composição ≠ delegação):

| Subagente | Skills mínimas que compõe |
| --- | --- |
| `interface-subagent` | `intent-extraction`, `context-assembly` (+ apoia `provenance-tagging`, `evidence-compilation`) |
| `retrieval-subagent` | `provenance-tagging` (+ futuras `retrieval-query`, `context-curation`) |
| `verification-subagent` | `evidence-compilation` (+ futura `failure-diagnosis`) |

As skills **propõem/montam/marcam/organizam**; os subagentes **orquestram** essas capacidades sob a
sua specification e fronteira. Ver [checkpoint das skills mínimas](../skills/p4-minimum-skills-checkpoint.md).

---

## 9. Dependências P0–P3

Os 3 subagentes herdam, como dependências **aprovadas**: invariantes **P0** (autoridade/conflito/
tenant); estado/eventos/memória/isolamento **P1**; governança + contexto/retrieval + multi-tenant
**P2**; observabilidade + execução + verificação **P3** (specs governantes por subagente nos §4–§6).
Dependências **futuras (pendentes):** agent specs (`institutional-agent`…), skills `retrieval-query`/
`context-curation`/`failure-diagnosis`, `escalation-subagent`, e os harnesses P5 (`runtime`,
`governance`, `observability`, `tenant`, `retrieval`, `audit`) que os coordenam/administram. Enquanto
não aprovados, a promoção **executável** permanece bloqueada (contract-first, `P15`/`DO4`).

---

## 10. Invariantes preservados

- subagentes são **documentais nesta fase** e **não executáveis**;
- subagentes **não são prompts finais** nem **personas**;
- subagentes **não detêm autoridade comportamental** e **não decidem operação**;
- subagentes **não autorizam, não executam, não alteram estado**;
- **delegação ≠ composição**, com **atenuação de privilégio** (privilégio só decresce);
- **independência do auditor**: quem executou/recuperou/mediou não se verifica;
- **controlabilidade read-only**: o auditor não é desativável pelo que fiscaliza;
- **tenant boundary inviolável**; contexto/retrieval governados; proveniência preservada;
- LLM sem autoridade · runtime coordena mas não governa · estado é verdade · observability antes de
  execução confiável.

---

## 11. Riscos reduzidos

| Risco | Mitigação herdada |
| --- | --- |
| Subagente virar chatbot/persona/decisor autônomo | definição + critérios (Subagent Map §2/§5); specs dos 3 |
| Escalonamento de privilégio na delegação | atenuação de privilégio (§7, §10) |
| Auto-verificação (executor/recuperador/mediador) | independência do auditor (`verification-subagent`) |
| Auditor desativável pelo que fiscaliza | controlabilidade read-only |
| Busca livre / vazamento cross-tenant | `retrieval-subagent` governado, tenant-scoped |
| Linguagem virando permissão / prompt virando policy | `interface-subagent` (limites) |
| Conclusão por asserção / ausência virando aprovação | `verification-subagent` (veredito por evidência) |

---

## 12. O que ainda está fora de escopo

Permanecem **fora de escopo** até autorização formal e separada:

- **harnesses** (P5: runtime, governance, observability, tenant, execution, context, retrieval,
  audit, escalation) — **não avançar para harnesses**;
- subagentes restantes do Subagent Map (`execution-proposal-subagent`, `escalation-subagent`,
  `synthesis-subagent`);
- qualquer subagente/skill/harness **executável**, implementation harness, código, API, schema,
  frontend, backlog, sprint plan, YAML/JSON, DSL, contrato machine-readable;
- inferência de stack técnica; plano de implementação.

O trabalho permanece **arquitetura/documentação em linguagem natural estruturada**.

---

## 13. Próxima fronteira recomendada

Direção recomendada — **a confirmar separadamente, sem autorização de execução aqui**:

- **(a)** os **subagentes restantes** do Subagent Map (`execution-proposal-subagent`,
  `escalation-subagent`, `synthesis-subagent`), uma peça por vez; ou
- **(b)** o início do bloco de **harnesses mínimos** documentais
  ([Operational Harness Map §16](../../../harness-engineering/operational-harness-map.md)): `runtime`,
  `governance`, `observability`, `tenant` (+ `execution` quando houver tool com efeito).

Em ambos os casos: documental, uma peça por vez, com checkpoint. **Este documento não autoriza a
próxima peça** e **não avança para harnesses**.

---

## 14. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/subagents/p4-minimum-subagents-checkpoint.md`. Nenhum
   outro arquivo criado ou alterado.
2. **Natureza respeitada:** consolidation-only · governance-first · architecture/process-only ·
   linguagem natural estruturada. **Não** é novo subagente, subagente executável, harness, spec nova,
   código, API, schema, YAML/JSON ou contrato machine-readable.
3. **Estrutura:** **exatamente as 14 seções** confirmadas pelo operador.
4. **Consolidação:** os 3 subagentes mínimos (interface, retrieval, verification), papéis, fronteiras
   comuns, integração, specs P0–P3 governantes, relação com as skills mínimas e invariantes —
   **referenciados, não duplicados**.
5. **Confirmação de fronteira:** **nenhum** harness, subagente executável, skill executável, código,
   API, schema, frontend, backlog, YAML/JSON ou contrato machine-readable foi criado. **Não avancei
   para harnesses.** Specs P0–P3, mapas e checkpoints anteriores **não** modificados.

**Parado aqui. Não avancei para harnesses.**

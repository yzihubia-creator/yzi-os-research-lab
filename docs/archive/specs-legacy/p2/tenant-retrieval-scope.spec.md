# tenant-retrieval-scope

> **Specification documental (governança-first, contract-first, linguagem natural estruturada).**
> Terceira e **última** spec do grupo **Multi-Tenant** e da **Onda P2**. Define o **escopo de retrieval
> por tenant**: quais fontes podem ser recuperadas para um tenant, **tenant-scoped, policy-scoped,
> authority-aware, provenance-aware e auditável**, subordinado ao core e à soberania de dados do tenant.
> **Não** é machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código nem contrato técnico
> executável.
>
> Onda: P2 (governança + contexto) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `tenant-retrieval-scope` |
| **Camada** | `tenant` / `retrieval` / `governance` |
| **Owner arquitetural** | Multi-Tenant / Retrieval |
| **Tenant-scope** | Per-tenant |
| **Classe de operação** | escopo-de-recuperação-por-tenant |
| **Candidatura** | `harness` (`tenant-harness` + `retrieval-harness`) |
| **Dependências** | [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md), [`tenant-configuration`](tenant-configuration.spec.md), [`tenant-policy-pack`](tenant-policy-pack.spec.md), [`retrieval-governance`](retrieval-governance.spec.md), [`context-provenance`](context-provenance.spec.md), [`conflict-resolution`](../p0/conflict-resolution.spec.md), [`escalation-policy`](escalation-policy.spec.md), [`event-driven-state`](../p1/event-driven-state.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md) |
| **Proveniência** | `[HE-GOV]` `[CE]` `[PYR]` `[AHE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — isolamento multi-tenant; `DO2`; governança fora da linguagem.
- [`/docs/specs/p2/retrieval-governance.spec.md`](retrieval-governance.spec.md) — retrieval como face contextual da governança; não é busca livre.
- [`/docs/specs/p2/tenant-configuration.spec.md`](tenant-configuration.spec.md) §8 — **retrieval scope** como eixo governado de verticalização (eixo 4).

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, o **escopo de retrieval por tenant**: **quais fontes**
— policies, documentos, memórias, embeddings, XMLs, knowledge bases e evidence packages — **podem ser
recuperadas para um tenant**, e sob que governança. O retrieval scope é o eixo de verticalização §8.4 de
[`tenant-configuration`](tenant-configuration.spec.md): delimita o universo recuperável de cada tenant
**dentro** da arquitetura, preservando a **soberania de dados** do tenant.

A spec **extrai** (não inventa nem resume) o isolamento multi-tenant, a governança de recuperação e a
proveniência. **Fecha** o grupo Multi-Tenant e a Onda P2.

---

## 2. Problema que resolve

Sem um escopo governado, o retrieval de um tenant poderia alcançar fontes de outro tenant, recuperar
dados sem proveniência ou ser expandido por prompt/LLM — quebrando isolamento, soberania de dados e
auditabilidade. "O que o tenant pode buscar" precisa ser **delimitado e governado**, não aberto.

Esta spec elimina o risco fixando o escopo como **tenant-scoped, policy-scoped, authority-aware,
provenance-aware e auditável**: o universo recuperável é declarado, isolado, proveniente e
reconstruível — e qualquer travessia é barrada.

---

## 3. Autoridade envolvida

- **Governa o escopo:** as **policies/specifications** (Authority) — em especial
  [`tenant-policy-pack`](tenant-policy-pack.spec.md) e [`retrieval-governance`](retrieval-governance.spec.md)
  — com o **Estado** como verdade e a **fronteira de tenant** como invariante.
- **Aplica (não decide a verdade):** o **Runtime/Services** e o `retrieval-harness`/`tenant-harness`
  aplicam o escopo — **não** decidem o que é verdadeiro nem ampliam o universo recuperável.
- **NÃO expandem o escopo:** **prompt, LLM, agente e runtime** não alargam o alcance da busca nem
  recuperam fora do tenant (`P1`, `P12`, `DO2`).

---

## 4. Entradas esperadas

- A **definição governada** do universo recuperável do tenant (policies, documentos, memórias,
  embeddings, XMLs, knowledge bases, evidence packages — todos tenant-scoped).
- As policies de [`tenant-policy-pack`](tenant-policy-pack.spec.md) e a governança de
  [`retrieval-governance`](retrieval-governance.spec.md).
- A **proveniência** exigida ([`context-provenance`](context-provenance.spec.md)) e o invariante de
  [`tenant-boundary`](../p0/tenant-boundary.spec.md).

## 5. Saídas esperadas

- Um **universo recuperável delimitado por tenant**, isolado e proveniente, pronto para a recuperação
  governada e a montagem de contexto.
- O **registro auditável** de toda recuperação (tenant scope, motivo de inclusão/exclusão, authority
  layer, limitações conhecidas) e um **evento auditável** a cada alteração do escopo.

---

## 6. Contrato esperado (linguagem natural)

1. O tenant retrieval scope **define quais fontes podem ser recuperadas** para o tenant: **policies,
   documentos, memórias, embeddings, XMLs, knowledge bases e evidence packages**.
2. O retrieval scope é **tenant-scoped, policy-scoped, authority-aware, provenance-aware e auditável**.
3. O retrieval scope **é parte da configuração governada do tenant**, mas **subordinado ao core** do
   YZI OS.
4. O retrieval scope **NÃO PODE autorizar cross-tenant retrieval**.
5. O retrieval scope **NÃO PODE recuperar dados, memória, contexto, policies, traces ou evidências de
   outro tenant**.
6. O retrieval scope **NÃO PODE elevar Metadata acima de Authority** (Paradoxo do Metadado).
7. O retrieval scope **NÃO PODE permitir que prompt ou LLM expandam o escopo de busca**.
8. O retrieval scope **DEVE respeitar** [`tenant-boundary`](../p0/tenant-boundary.spec.md),
   [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md),
   [`tenant-configuration`](tenant-configuration.spec.md), [`tenant-policy-pack`](tenant-policy-pack.spec.md),
   [`retrieval-governance`](retrieval-governance.spec.md) e [`context-provenance`](context-provenance.spec.md).
9. **Fontes recuperadas DEVEM possuir proveniência**; **fontes sem proveniência suficiente NÃO PODEM
   governar decisão**.
10. **Toda recuperação DEVE registrar**: tenant scope, **motivo de inclusão**, **motivo de exclusão
    (quando relevante)**, **authority layer** e **limitações conhecidas**.
11. **Ausência, ambiguidade ou conflito** no retrieval scope **DEVE** gerar **bloqueio, pendência de
    evidência ou escalada** ([`escalation-policy`](escalation-policy.spec.md)).
12. **Alteração no retrieval scope DEVE gerar evento auditável** ([`event-driven-state`](../p1/event-driven-state.spec.md)).
13. O retrieval scope **DEVE preservar a soberania de dados do tenant**.
14. A **verticalização via retrieval scope DEVE ocorrer por escopo governado, não por exceção informal**.
15. **Toda decisão influenciada por retrieval DEVE ser reconstruível e auditável dentro do tenant**.

---

## 7. Fontes sob escopo de retrieval

| Fonte | Condição de escopo |
| --- | --- |
| **Policies** | apenas as do tenant (via `tenant-policy-pack`); nunca de outro tenant |
| **Documentos** | tenant-scoped, com proveniência e authority layer |
| **Memórias** | working/episódica/semântica/procedural do tenant, com proveniência e policy |
| **Embeddings** | índices semânticos isolados por tenant |
| **XMLs** | governança comportamental do tenant |
| **Knowledge bases** | bases de conhecimento autorizadas para o tenant |
| **Evidence packages** | evidências do próprio tenant, auditáveis |

Nenhuma fonte fora do escopo do tenant é recuperável; **nada** atravessa para outro tenant.

---

## 8. Registro obrigatório de recuperação

Toda recuperação no escopo do tenant **DEVE** registrar:

1. **Tenant scope** — o tenant para o qual se recuperou.
2. **Motivo de inclusão** — por que cada fragmento entrou.
3. **Motivo de exclusão (quando relevante)** — por que fragmentos foram descartados.
4. **Authority layer** — a camada de autoridade do que foi recuperado.
5. **Limitações conhecidas** — fraquezas/restrições da fonte ([`context-provenance`](context-provenance.spec.md) §7).

Esse registro torna **toda decisão influenciada por retrieval reconstruível e auditável dentro do
tenant** (§6.15) e sustenta a soberania de dados.

---

## 9. Soberania de dados do tenant

1. Os dados recuperáveis de um tenant **pertencem ao tenant**: o escopo **preserva a soberania de
   dados** e impede que saiam do seu domínio.
2. Nenhuma recuperação expõe dados/memória/contexto/policies/traces/evidências de um tenant a outro.
3. A soberania é **invariante de segurança**, não preferência — herda
   [`tenant-boundary`](../p0/tenant-boundary.spec.md) e [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md).

---

## 10. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Delimitar o universo recuperável do tenant pelas fontes do §7, todas tenant-scoped.
2. Manter o escopo tenant-scoped/policy-scoped/authority-aware/provenance-aware/auditável (§6.2).
3. Subordinar o escopo ao core; verticalizar só por escopo governado, não por exceção informal.
4. Impedir cross-tenant retrieval e qualquer recuperação de dados de outro tenant.
5. Impedir elevar Metadata acima de Authority e impedir prompt/LLM de expandir a busca.
6. Exigir proveniência das fontes; barrar fonte sem proveniência suficiente de governar decisão.
7. Registrar tenant scope/motivo de inclusão/motivo de exclusão/authority layer/limitações (§8).
8. Tratar ausência/ambiguidade/conflito por bloqueio/pendência de evidência/escalada.
9. Gerar evento auditável a cada alteração do escopo; preservar soberania de dados.
10. Garantir que toda decisão influenciada por retrieval seja reconstruível e auditável no tenant.

---

## 11. Critérios de aceite

1. Referencia o isolamento multi-tenant, a governança de retrieval e a proveniência sem contradizê-los
   nem duplicá-los.
2. Define o universo recuperável (fontes do §7) e suas propriedades (§6.2).
3. Fixa subordinação ao core e verticalização por escopo governado.
4. Fixa as proibições: cross-tenant, dados de outro tenant, Metadata>Authority, expansão por prompt/LLM.
5. Exige proveniência, registro de recuperação (§8) e tratamento de lacuna/conflito.
6. Exige evento auditável em alteração, soberania de dados e reconstrutibilidade no tenant; revisável
   por humano.

---

## 12. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Autoriza cross-tenant retrieval ou recupera dados/memória/contexto/policies/traces/evidências de
   outro tenant.
2. Eleva Metadata acima de Authority.
3. Permite prompt/LLM expandir o escopo de busca.
4. Admite fonte sem proveniência suficiente governando decisão.
5. Não registra tenant scope/motivo de inclusão/motivo de exclusão/authority layer/limitações.
6. Trata ausência/ambiguidade/conflito como permissão (sem bloqueio/pendência/escalada).
7. Não gera evento auditável em alteração, ou quebra a soberania de dados do tenant.
8. Verticaliza por exceção informal, ou coloca o escopo acima do core.
9. Impede a reconstrução/auditoria, dentro do tenant, de decisão influenciada por retrieval.
10. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 13. Relação com as camadas do YZI OS

O retrieval scope opera entre as camadas **Tenant**, **Retrieval** e **Policies**: delimita o universo
recuperável **sob** a governança de [`retrieval-governance`](retrieval-governance.spec.md) e do
[`tenant-policy-pack`](tenant-policy-pack.spec.md), **sobre** o Estado como verdade, preservando o
isolamento de [`tenant-boundary`](../p0/tenant-boundary.spec.md)/[`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md)
e a proveniência de [`context-provenance`](context-provenance.spec.md). O `retrieval-harness` o aplica;
o `tenant-harness` o administra; conflitos resolvem-se por
[`conflict-resolution`](../p0/conflict-resolution.spec.md). É o eixo §8.4 de
[`tenant-configuration`](tenant-configuration.spec.md).

---

## 14. Relação com specifications futuras

**Última** spec do grupo Multi-Tenant e da Onda P2 — ver
[Specification Map](../../specification-engineering/specification-map.md). Fecha a verticalização por
tenant (configuration → policy-pack → retrieval-scope). É a base do escopo de recuperação do
`tenant-harness`/`retrieval-harness`. **Não autoriza** nenhuma onda futura nem specs P3.

---

## 15. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Relação com o retrieval scope |
| --- | --- |
| **Skill** | recupera apenas dentro do escopo do tenant; não o amplia |
| **Subagente** | o `retrieval-subagent` opera no escopo do tenant; não atravessa fronteira |
| **Harness** | o `retrieval-harness` aplica o escopo; o `tenant-harness` o administra; o `audit` registra |
| **Service** | recupera dentro do escopo, sob contrato; registra o exigido no §8 |
| **Tool** | fornece fragmentos do próprio tenant, com proveniência; não busca fora do escopo |
| **LLM / agente de código** | não expande a busca; o recuperado entra como Metadata, não como Authority |

---

## 16. Método de verificação

1. **Escopo:** verificar que só as fontes do §7, tenant-scoped, são recuperáveis.
2. **Cross-tenant:** tentar recuperar de outro tenant ⇒ deve ser barrado e gerar evidência.
3. **Autoridade:** verificar que Metadata não supera Authority e que prompt/LLM não expandem a busca.
4. **Proveniência/registro:** verificar proveniência das fontes e o registro completo do §8.
5. **Alteração/soberania:** alterar o escopo ⇒ deve gerar evento auditável; verificar soberania de
   dados.
6. **Reconstrutibilidade:** dada uma decisão influenciada por retrieval, reconstruí-la dentro do tenant.
7. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 17. Observabilidade esperada

- Registro, por recuperação: tenant scope · motivo de inclusão · motivo de exclusão · authority layer ·
  limitações conhecidas · proveniência.
- **Evento auditável** por alteração do escopo (o quê mudou, por quem, quando).
- Registro de recuperações barradas (cross-tenant, sem escopo, sem proveniência, autoridade indevida).
- Trilha auditável e read-only **dentro do tenant**, sustentando soberania e reconstrução (`P9`, `DO6`).

---

## 18. Riscos arquiteturais evitados

- **Cross-tenant retrieval** — recuperar fontes/dados de outro tenant (`DO2`, `tenant-boundary`).
- **Quebra de soberania de dados** — dados do tenant saindo do seu domínio.
- **Metadata sobre Authority** — escopo elevando prompt/recuperado acima de specs/estado.
- **Expansão por prompt/LLM** — busca alargada por linguagem.
- **Fonte sem proveniência** — fragmento opaco governando decisão.
- **Exceção informal** — escopo "combinado" fora de governança.
- **Decisão não reconstruível** — retrieval influenciando sem trilha auditável no tenant.

---

## 19. Fora de escopo

- **Não** redefine a **governança de retrieval** (`retrieval-governance`), o **policy pack**
  (`tenant-policy-pack`), a **configuração** (`tenant-configuration`) nem a **proveniência**
  (`context-provenance`) — apenas o **escopo de retrieval por tenant** e os referencia.
- **Não** cria o `retrieval-harness`/`tenant-harness` executável nem nenhuma outra spec.
- **Não** inicia nenhuma onda futura nem specs P3.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 20. Proveniência

`[HE-GOV]` Harness Engineering / Governança — escopo sob enforcement; evento auditável; registro de
inclusão/exclusão. `[CE]` Context Engineering — retrieval governado; proveniência por fragmento;
prevenção de poisoning. `[PYR]` Context→Intent→Specification — escopo subordinado à constituição;
Metadata não supera Authority. `[AHE]` Agentic Harness Engineering — soberania de dados por tenant;
isolamento por construção; verticalização por escopo governado.

---

## 21. Fronteiras (o que NÃO está aqui)

- **Não** substitui o isolamento multi-tenant, a governança de retrieval nem a proveniência: é a spec
  que os **opera** como contrato de escopo de retrieval por tenant verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura — apenas fixa o escopo de retrieval por tenant, **fechando a
  Onda P2**.

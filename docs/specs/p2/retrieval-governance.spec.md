# retrieval-governance

> **Specification documental (governança-first, contract-first, linguagem natural estruturada).**
> Última spec do grupo **Context/Retrieval** da Onda P2. Define a **governança da recuperação** no
> YZI OS: o retrieval (RAG/busca semântica) é a **face contextual da governança** — não é busca livre.
> Tudo o que é recuperado entra **sob policy, tenant-scoped, respeitando a camada de autoridade e com
> proveniência por fragmento**, alimentando a montagem de contexto sem jamais elevar a própria
> autoridade. **Não** é machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código nem
> contrato técnico executável.
>
> Onda: P2 (governança + contexto) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `retrieval-governance` |
| **Camada** | `context-engineering` / `retrieval` |
| **Owner arquitetural** | Contexto / Retrieval |
| **Tenant-scope** | Per-tenant |
| **Classe de operação** | recuperação-governada |
| **Candidatura** | `harness` (`retrieval-harness`) + subagente (`retrieval-subagent`) |
| **Dependências** | [`context-assembly`](context-assembly.spec.md), [`context-isolation`](context-isolation.spec.md), [`context-provenance`](context-provenance.spec.md), [`memory-model`](../p1/memory-model.spec.md), [`behavioral-governance`](behavioral-governance.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md) |
| **Proveniência** | `[CE]` `[HE-GOV]` `[PYR]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P11` (contexto modular/recuperável), `DO2` (isolamento contextual), `P12` (governança fora da linguagem).
- [`/docs/foundation/philosophy.md`](../../foundation/philosophy.md) §3–§4 — contexto como OS; retrieval como conhecimento governado; Guidance × Enforcement.
- [`/docs/prd/yzi-os-prd-v1.md`](../../prd/yzi-os-prd-v1.md) §7 — camada RAG/Retrieval como **face contextual da governança**.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, a **governança da recuperação** no YZI OS: o retrieval
(RAG, busca semântica, recuperação de memória/evidência) é a **face contextual da governança** — o modo
como o conhecimento governado é trazido para a decisão. Não é busca livre nem acesso irrestrito: tudo o
que é recuperado entra **sob policy, tenant-scoped, respeitando a camada de autoridade e com
proveniência por fragmento**.

A spec **extrai** (não inventa nem resume) `P11`/`DO2`/`P12`, a engenharia de contexto e a posição da
camada RAG/Retrieval no modelo de autoridade. **Fecha** o grupo Context/Retrieval, conectando montagem,
ciclo de vida, isolamento e proveniência ao ato de recuperar.

---

## 2. Problema que resolve

Retrieval livre é um vetor de risco: recupera dados de outro tenant, eleva conteúdo recuperado à
condição de autoridade, injeta fragmentos sem proveniência (**poisoning**) e infla o contexto
(**distraction/confusion**). Sem governança, "o que o agente sabe" passa a governar indevidamente o
que ele deve fazer.

Esta spec elimina o risco fixando a recuperação como **ato governado**: por policy, isolada por tenant,
subordinada à camada de autoridade e proveniente — com motivo de inclusão/exclusão registrado.

---

## 3. Autoridade envolvida

- **Governa a recuperação:** a camada de **Retrieval** sob **Policies/Specifications** (Authority), com
  o **Estado** como verdade. O retrieval é a **face contextual** dessa governança, não uma autoridade
  própria.
- **Coordena (não decide a verdade):** o **Runtime/Services** e o `retrieval-harness` executam a
  recuperação como ambiente — **não** decidem o que é verdadeiro nem elevam o recuperado a Authority.
- **NÃO ampliam escopo nem contornam policy:** **LLM, agente e prompt** não expandem o alcance do
  retrieval, não recuperam fora do tenant e não transformam conteúdo recuperado em autoridade (`P1`,
  `P12`, `DO2`).

---

## 4. Entradas esperadas

- A **necessidade de contexto** de uma operação (o que precisa ser sabido para a decisão atual),
  tenant-scoped.
- As **fontes recuperáveis**: memória semântica (RAG), documentos/policies, evidência — todas com
  tenant e autoridade declarados.
- As **policies de recuperação** aplicáveis (o que pode ser recuperado, por quem, com que escopo).

## 5. Saídas esperadas

- Um **conjunto recuperado governado**: fragmentos tenant-scoped, dentro da camada de autoridade, com
  **proveniência** ([`context-provenance`](context-provenance.spec.md)) e **motivo de inclusão/exclusão**
  registrado, pronto para a montagem ([`context-assembly`](context-assembly.spec.md)).
- O **registro auditável** da recuperação (consulta, fontes, escopo, motivos de inclusão/exclusão,
  tenant).

---

## 6. Contrato esperado (linguagem natural)

1. O retrieval **é a face contextual da governança**: recupera **conhecimento governado**, não faz
   busca livre nem acesso irrestrito.
2. Todo fragmento recuperado **DEVE** respeitar **tenant scope e a camada de autoridade**
   ([`context-isolation`](context-isolation.spec.md) §9; [`layer-authority-model`](../p0/layer-authority-model.spec.md)).
3. Todo fragmento recuperado **DEVE** carregar **proveniência** ([`context-provenance`](context-provenance.spec.md));
   memória recuperada respeita **tenant scope, provenance e policy** ([`memory-model`](../p1/memory-model.spec.md)).
4. O conteúdo recuperado **NÃO DEVE** elevar a própria autoridade: entra como conhecimento, **nunca**
   sobrepõe specifications, policies ou estado (Authority › … › Metadata).
5. A recuperação **DEVE** registrar **motivo de inclusão** e **motivo de exclusão (quando relevante)**,
   sustentando a reconstrução de episódio.
6. A recuperação **DEVE** satisfazer os cinco critérios do pacote — **relevância, suficiência,
   isolamento, economia, proveniência** ([`context-assembly`](context-assembly.spec.md) §8) — e ajudar
   a prevenir **poisoning, distraction, confusion e clash** ([`context-isolation`](context-isolation.spec.md) §7).
7. **Nenhuma recuperação DEVE cruzar a fronteira de tenant** ([`tenant-boundary`](../p0/tenant-boundary.spec.md)).
8. **Runtime/Services** coordenam a recuperação mas **não decidem a verdade**; **LLM/agente/prompt** não
   **expandem escopo, não recuperam fora do tenant e não contornam policy**.
9. Recuperação com **escopo ausente, autoridade indevida, conflito ou proveniência frágil** **DEVE**
   gerar **bloqueio, isolamento, descarte, pendência de evidência ou escalada registrada**.

---

## 7. Retrieval como face contextual da governança

| Aspecto | Como o retrieval se subordina à governança |
| --- | --- |
| **O que recupera** | apenas conhecimento **governado** (RAG/policies/evidência), não a web aberta nem dados arbitrários |
| **Para quem** | apenas dentro do **tenant** e da **autoridade** da operação |
| **Como entra** | como **Metadata/Constraint** governado, **nunca** como Authority sobre specs/estado |
| **Com o quê** | com **proveniência** e **motivo de inclusão/exclusão** registrados |
| **Sob qual regra** | sob **policy** (Enforcement), não sob a eloquência do prompt (Guidance) |

O retrieval é **onde a governança encontra o contexto**: ele não decide o comportamento, ele **fornece
de forma governada** o que o comportamento poderá considerar.

---

## 8. Governança de inclusão e exclusão

1. Cada fragmento recuperado tem um **motivo de inclusão** (por que serve à decisão atual) registrado.
2. Fragmentos **descartados** têm, quando relevante, um **motivo de exclusão** registrado (fora de
   escopo, sem proveniência, autoridade indevida, baixa relevância, economia).
3. Esses motivos **sustentam observabilidade, auditoria, atribuição de falha e reconstrução de
   episódio** ([`context-provenance`](context-provenance.spec.md) §8).
4. A decisão de incluir/excluir é **governada por policy**, não pela preferência do agente nem pela
   instrução do prompt.

---

## 9. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Tratar o retrieval como recuperação **governada** (face contextual da governança), não busca livre.
2. Garantir tenant scope e respeito à camada de autoridade em todo fragmento recuperado.
3. Exigir proveniência por fragmento e registrar motivo de inclusão/exclusão.
4. Impedir que o recuperado eleve a própria autoridade sobre specs/policies/estado.
5. Satisfazer os cinco critérios e ajudar a prevenir poisoning/distraction/confusion/clash.
6. Impedir qualquer recuperação cross-tenant.
7. Manter Runtime/Services como coordenadores; impedir LLM/agente/prompt de expandir escopo ou
   contornar policy.
8. Tratar escopo ausente/autoridade indevida/conflito/proveniência frágil por bloqueio/isolamento/
   descarte/pendência de evidência/escalada.
9. Registrar toda recuperação como evidência auditável (`P9`, `DO6`).

---

## 10. Critérios de aceite

1. Referencia `P11`/`DO2`/`P12` e a posição da camada RAG/Retrieval sem contradizê-las nem duplicá-las.
2. Fixa o retrieval como face contextual da governança (não busca livre) (§6, §7).
3. Fixa tenant scope + camada de autoridade + proveniência por fragmento recuperado.
4. Fixa que o recuperado não eleva autoridade e registra motivo de inclusão/exclusão.
5. Liga a recuperação aos cinco critérios e à prevenção dos quatro modos de falha.
6. Fixa o tratamento de recuperação sem escopo/autoridade/proveniência; revisável por humano.

---

## 11. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Trata o retrieval como busca livre ou acesso irrestrito.
2. Recupera fora do tenant scope ou da camada de autoridade.
3. Admite fragmento recuperado sem proveniência governando decisão.
4. Permite o recuperado sobrepor specifications, policies ou estado (eleva autoridade).
5. Não registra motivo de inclusão/exclusão, impedindo reconstrução de episódio.
6. Deixa LLM/agente/prompt expandir escopo, recuperar cross-tenant ou contornar policy.
7. Não trata escopo ausente/autoridade indevida/conflito/fragilidade por bloqueio/isolamento/descarte/
   pendência de evidência/escalada.
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; ou reposiciona o YZI OS.

---

## 12. Relação com as camadas do YZI OS

O retrieval é a **camada 4** (face contextual da governança) no modelo de autoridade: abaixo de
Estado/Services/Policies e a serviço da decisão. Recupera conhecimento governado para a montagem
([`context-assembly`](context-assembly.spec.md)), sob isolamento
([`context-isolation`](context-isolation.spec.md)) e proveniência
([`context-provenance`](context-provenance.spec.md)), dentro do comportamento fixado por
[`behavioral-governance`](behavioral-governance.spec.md). O `retrieval-harness` o executa; o
`governance-harness` aplica as policies; herda isolamento de [`tenant-boundary`](../p0/tenant-boundary.spec.md).

---

## 13. Relação com specifications futuras

Fecha o grupo Context/Retrieval e prepara o grupo **Multi-Tenant** — em especial `tenant-retrieval-scope`
(escopo de recuperação por tenant) e `tenant-policy-pack` — ver
[Specification Map](../../specification-engineering/specification-map.md). É a base do `retrieval-harness`
e do `retrieval-subagent`. **Não autoriza** a criação dessas specs futuras.

---

## 14. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Relação com a recuperação governada |
| --- | --- |
| **Skill** | skills de recuperação operam sob policy; não ampliam o próprio escopo |
| **Subagente** | o `retrieval-subagent` recupera dentro do tenant/autoridade; não decide verdade |
| **Harness** | o `retrieval-harness` executa; o `governance-harness` aplica as policies de recuperação |
| **Service** | recupera como ambiente, sob contrato; registra motivo de inclusão/exclusão |
| **Tool** | fornece fragmentos com tenant/proveniência; não recupera fora do escopo |
| **LLM / agente de código** | recebe o recuperado como Metadata; não expande escopo nem contorna policy |

---

## 15. Método de verificação

1. **Governança:** verificar que nenhuma recuperação é busca livre; toda recuperação passa por policy.
2. **Escopo/autoridade:** verificar tenant scope e camada de autoridade em cada fragmento.
3. **Proveniência:** verificar proveniência por fragmento e o registro de motivo de inclusão/exclusão.
4. **Não-elevação:** verificar que o recuperado não sobrepõe specs/policies/estado.
5. **Cross-tenant:** tentar recuperar de outro tenant ⇒ deve ser barrado e gerar evidência.
6. Violação ⇒ rejeição/escalada; verificação independente do agente e reconstruível.

---

## 16. Observabilidade esperada

- Registro, por recuperação: consulta · fontes · tenant · camada de autoridade · motivo de inclusão ·
  motivo de exclusão (quando relevante).
- Registro de recuperações barradas (cross-tenant, sem escopo, autoridade indevida, sem proveniência).
- Trilha auditável e read-only que sustenta a reconstrução de episódio (`P9`, `DO6`).

---

## 17. Riscos arquiteturais evitados

- **Busca livre** — retrieval irrestrito ignorando policy/escopo.
- **Vazamento cross-tenant** — recuperação cruzando fronteira (`DO2`, `tenant-boundary`).
- **Elevação de autoridade** — conteúdo recuperado sobrepondo specs/estado.
- **Poisoning/distraction/confusion/clash** — fragmentos sem governança degradando a decisão.
- **Recuperação opaca** — sem motivo de inclusão/exclusão, impedindo auditoria/reconstrução.

---

## 18. Fora de escopo

- **Não** redefine a **montagem** (`context-assembly`), o **ciclo de vida** (`context-lifecycle`), o
  **isolamento** (`context-isolation`) nem a **proveniência** (`context-provenance`) — apenas a
  **governança da recuperação** e os referencia.
- **Não** define o **escopo de retrieval por tenant** (`tenant-retrieval-scope`) nem o
  **tenant-policy-pack** — apenas os prepara.
- **Não** cria o `retrieval-harness` executável nem nenhuma outra spec.
- **Não** cria skill, subagente, harness, service, tool, código, API, schema, frontend, backlog,
  sprint plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 19. Proveniência

`[CE]` Context Engineering — retrieval/RAG como conhecimento governado; prevenção de poisoning;
proveniência por fragmento; "o mínimo suficiente". `[HE-GOV]` Harness Engineering / Governança —
recuperação sob policy (Enforcement); evidência auditável; motivo de inclusão/exclusão. `[PYR]`
Context→Intent→Specification — retrieval subordinado à camada de autoridade; conhecimento não sobrepõe
constituição.

---

## 20. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P11`/`DO2`/`P12` nem a engenharia de contexto: é a spec que os **opera** como
  contrato de recuperação governada verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma fase futura nem o grupo Multi-Tenant — apenas fixa a governança da
  recuperação que as demais herdam.

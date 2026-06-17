# retrieval-subagent — Subagente Spec (documental)

> **Spec documental de subagente (P4), architecture-only · governance-first · subagent-preparation ·
> linguagem natural estruturada.** Define o **contrato do papel** `retrieval-subagent` — o que ele é,
> o que recupera, seus limites, critérios de aceite/rejeição, observabilidade e proveniência. **Não**
> é subagente executável, prompt final, persona final nem machine-readable. **Não** usa YAML, JSON,
> schema, DSL, pseudo-código, contrato técnico executável, código, API, configuração ou plano de
> implementação. **Descreve o papel; não o implementa.** A arquitetura continua sendo o produto.
>
> Derivada fielmente de: [Subagent Map](../../../subagents/subagent-map.md) (card `retrieval-subagent`),
> [p4-preparation-map](../p4-preparation-map.md), [interface-subagent](interface-subagent.spec.md),
> [p4-minimum-skills-checkpoint](../skills/p4-minimum-skills-checkpoint.md),
> [checkpoint P0–P3](../../specs-p0-p3-checkpoint.md), as specs P0–P3 aprovadas e as 4 skills mínimas
> P4 — em especial [`retrieval-governance`](../../p2/retrieval-governance.spec.md),
> [`tenant-retrieval-scope`](../../p2/tenant-retrieval-scope.spec.md),
> [`context-isolation`](../../p2/context-isolation.spec.md) e
> [`context-provenance`](../../p2/context-provenance.spec.md). **Não inventa doutrina; extrai o
> contrato já consolidado.**

> **Nota de alinhamento (transparência).** Esta spec foi **alinhada estruturalmente** (por
> autorização explícita) para conter **exatamente as 27 seções obrigatórias**: a antiga seção
> autônoma "O que a recuperação deve registrar" foi **dobrada em §20 (Relação com observability)**, a
> menção a `tenant-retrieval-scope` foi **consolidada em §14 (Relação com P2)** e §8 foi **renomeada**
> para "subagente, skill, retrieval-governance, RAG, tool, LLM, runtime e service". **Nenhuma doutrina
> foi reescrita ou adicionada** — apenas renumeração e mesclagem. Os **38 critérios obrigatórios**
> (Set A 1–24 + Set B 8–21) estão mapeados no **Adendo** ao final.

---

## 1. Identificação

| Campo | Valor |
| --- | --- |
| Nome | `retrieval-subagent` |
| Tipo | Subagente (papel operacional especializado) — **documental nesta fase** |
| Grupo | Sub-B Recuperação (Subagent Map §6) |
| Camada | context-engineering / retrieval |
| Specs governantes (aprovadas) | `retrieval-governance`, `tenant-retrieval-scope`, `tenant-policy-pack`, `context-assembly`, `context-isolation`, `context-provenance`, `operational-boundaries` (P2); invariantes P0; `memory-model`, `tenant-state-isolation` (P1); observabilidade P3 |
| Skills que compõe | `provenance-tagging`; `retrieval-query`*, `context-curation`* (*specs futuras) |
| Tenant-scope | Per-tenant |
| Proveniência | `[PYR]` `[CE]` `[HE-GOV]` |
| Status | Spec documental de preparação P4 — **não executável** |

---

## 2. Status, camada, onda e owner arquitetural

- **Status:** documental · subagent-preparation · não executável · proposta para aprovação.
- **Camada:** context-engineering / retrieval.
- **Onda:** P4 (preparação de subagentes), segunda peça do bloco; sucede `interface-subagent`.
- **Owner arquitetural:** Contexto / Retrieval / Specification Engineering.

---

## 3. Propósito

Definir o contrato do **papel especializado de recuperação governada**: recuperar contexto **dentro
do escopo e da autoridade do tenant**, com proveniência por fragmento, sob policy — **a face
contextual da governança, não busca livre**. Define-se o papel **sem promovê-lo a executor, decisor,
crawler, ferramenta ou RAG autônomo** (Set A 1–5, 24).

---

## 4. Escopo

- Recuperar, **read-only por política**, fontes do escopo do tenant (policies, documentos, memórias,
  embeddings, XMLs, knowledge bases, evidence packages — `tenant-retrieval-scope` §7).
- Anexar/preservar **proveniência por fragmento** (Set A 16) e registrar **motivo de
  inclusão/exclusão**.
- Registrar os campos do §20; reportar (não inventar) quando a recuperação for ambígua/insuficiente.
- Entregar o recuperado à montagem (`context-assembly`) e ao `interface-subagent`; apoiar
  `evidence-compilation`; encaminhar ao `verification-subagent` futuro quando evidência precisar ser
  verificada.

---

## 5. Fora de escopo

Esta spec **não** contém: subagente executável · prompt/persona final · configuração · código · API
· schema · frontend · backlog · sprint plan · roadmap técnico · plano de implementação · YAML/JSON ·
DSL · pseudo-código · contrato machine-readable · inferência de stack. O papel **não** é buscador
livre, crawler, RAG autônomo, ferramenta, decisor nem LLM com autoridade; **não** decide operação,
autoriza ação, executa tool ou altera estado; **não monta** o pacote final de contexto (isso é
`context-assembly`).

---

## 6. Definição do subagente

**É:** **papel operacional especializado** que recupera contexto governado dentro do tenant, com
autoridade **read-only por política**, escopo = corpus e visibilidade do tenant, permissões = leitura
do corpus do tenant, verificação = proveniência por fragmento e nada fora da política. **Prepara
recuperação contextual governada, mas não decide operação** (Set A 2). Compõe skills de recuperação
(`provenance-tagging`; futuras `retrieval-query`, `context-curation`).

**NÃO é** (Set A 3–5, 24): busca livre · RAG autônomo · crawler · ferramenta/tool · decisor autônomo ·
LLM com autoridade · runtime · mini-agente generalista.

> Invariante: o `retrieval-subagent` **não detém autoridade comportamental** e **não decide a
> verdade** — recupera de forma governada e **reporta**, nunca inventa. (`P1` `P12` `DO2`)

---

## 7. Retrieval-subagent como recuperação governada, não busca livre

A recuperação é a **face contextual da governança** (`retrieval-governance` §6/§7): recupera
**conhecimento governado**, não faz busca livre nem acesso irrestrito. O conteúdo recuperado entra
como **Metadata/Constraint governado**, **nunca** sobrepõe specs/policies/estado (Set B 14: não eleva
Metadata acima de Authority); o papel **não** expande escopo por prompt/LLM (Set B 15, 16), **não**
recupera cross-tenant e **não** eleva a autoridade do recuperado. **Opera sob `retrieval-governance`**
(Set A 18) e **usa `context-assembly` como demanda de contexto, não como autorização de busca livre**
(Set A 19).

---

## 8. Diferença entre subagente, skill, retrieval-governance, RAG, tool, LLM, runtime e service

| Conceito | É… | Autoridade | Decide verdade? | Executa/efeito |
| --- | --- | --- | --- | --- |
| **retrieval-governance** | a **policy/governança** da recuperação (regra) | governança | não | não |
| **RAG / corpus** | o **acervo recuperável** (memória semântica, documentos, embeddings) | nenhuma | não | é fonte, não decide |
| **Subagente** (`retrieval-subagent`) | **papel** que recupera sob a governança, read-only | limitada e explícita | não (reporta) | não |
| **Skill** | capacidade modular (`provenance-tagging`, etc.) | nenhuma | não | não |
| **Tool** | execução controlada de efeito | nenhuma | não | sim (sob permissão) |
| **Service** | lógica institucional de decisão | alta (em contrato) | decide a operação | não |
| **Runtime** | coordenação leve | nenhuma | não | orquestra |
| **LLM** | motor probabilístico | mínima | não | não |

O `retrieval-subagent` **não é** a regra (`retrieval-governance`), **não é** o acervo (RAG/corpus),
**não é** a tool que entrega fragmentos, **não é** service, runtime nem o LLM. É o **papel** que
recupera **sob** a governança, com privilégio atenuado e read-only.

---

## 9. Entradas conceituais do subagente

- A **necessidade de contexto** de uma operação (o objetivo de recuperação), tenant-scoped.
- O **escopo de retrieval do tenant** (`tenant-retrieval-scope`) e as **policies de recuperação**
  (`retrieval-governance`, `tenant-policy-pack`).
- As **fontes recuperáveis** do tenant, com tenant e autoridade declarados.
- O invariante de `tenant-boundary` e a exigência de proveniência (`context-provenance`).

---

## 10. Saídas conceituais do subagente

- Um **conjunto recuperado governado**: fragmentos tenant-scoped, dentro da camada de autoridade, com
  **proveniência** e **motivo de inclusão/exclusão**, pronto para a montagem (`context-assembly`).
- O **registro auditável** da recuperação (anatomia completa no §20).
- A preservação de **evidence** quando houver evidência vinculada ao retrieval (Set A 17).
- **Nenhuma** decisão, montagem final de pacote, permissão, execução ou veredito de verificação.

---

## 11. Limites do subagente

O `retrieval-subagent`:

- **não** decide operação (Set A 2) · **não** autoriza ação (Set A 6) · **não** executa tool (Set A 7)
  · **não** altera estado (Set B 8);
- **não** substitui service decision (Set A 8), verification (Set A 9), retrieval-governance (Set B 9)
  nem policy enforcement (Set B 10); opera **sob/dentro** delas;
- **não** faz busca livre, crawl nem acesso irrestrito (Set A 3–5);
- **não** pode recuperar fora do tenant scope (Set B 12); **não** pode cruzar dados/contexto/memória/
  policies/traces/evidências entre tenants (Set B 13);
- **não** pode elevar Metadata acima de Authority (Set B 14); **não** pode transformar prompt em
  escopo de retrieval (Set B 15); **não** pode permitir que LLM/agente/prompt expandam escopo de
  busca (Set B 16);
- **não** pode permitir bypass de tenant boundary, retrieval-governance, policy enforcement ou
  operational boundaries (Set B 17);
- **não** monta o pacote final de contexto (isso é `context-assembly`); **não** inventa fonte,
  evidência ou proveniência;
- **não** vira buscador generalista, crawler autônomo, RAG livre, mini-agente autônomo, runtime ou
  executor (Set A 24).

---

## 12. Relação com P0

- **layer-authority-model:** recupera **sob** a camada de autoridade (Set A 15); o recuperado entra
  como Metadata/Constraint, nunca como Authority; **não eleva Metadata acima de Authority** (Set B 14).
- **conflict-resolution:** conflito/ambiguidade de recuperação é registrado e tratado (§23), por ordem
  de valores.
- **tenant-boundary:** **respeita tenant scope** (Set A 10) e **preserva tenant boundary** (Set A 11);
  nenhuma recuperação cruza tenant (Set B 12, 13).

---

## 13. Relação com P1

- **operational-state:** **não altera** estado (Set B 8); o estado é verdade, não fonte recuperável
  arbitrária.
- **memory-model:** memória recuperada respeita tenant scope, provenance e policy; memória sem
  proveniência não governa decisão.
- **tenant-state-isolation:** recupera apenas dentro do tenant ativo, isolado.

---

## 14. Relação com P2

- **retrieval-governance:** **opera sob** ela (Set A 18) — recuperação governada, motivo de
  inclusão/exclusão, não-elevação de autoridade.
- **tenant-retrieval-scope:** **deve respeitar** o escopo de retrieval por tenant (Set A 12) —
  universo recuperável do tenant (§7 da spec governante), soberania de dados, registro obrigatório,
  evento auditável em alteração. (Conteúdo consolidado aqui no alinhamento estrutural.)
- **tenant-policy-pack:** **deve respeitar** o policy pack do tenant (Set A 13).
- **operational-boundaries:** **deve respeitar** as fronteiras operacionais (Set A 14).
- **context-isolation / context-provenance:** ajuda a prevenir poisoning/distraction/confusion/clash;
  **preserva provenance por fragmento** (Set A 16).
- **behavioral-governance / policy-enforcement:** opera sob enforcement determinístico; não governa
  comportamento por si.

---

## 15. Relação com P3

- **episode-trace / audit-log:** quando promovido, **alimenta** ambos (Set B 19).
- **failure-attribution:** falha é **atribuível** (Set B 20).
- **entropy-audit:** entropia é **auditável** (Set B 21).
- **intervention-log:** intervenção relacionada é **registrada** (Set A 22).
- **service-contract / tool-permission / tool-result-verification:** não decide, não autoriza, não
  verifica resultado; apenas recupera.

---

## 16. Relação com as skills mínimas

- **`provenance-tagging`:** **usa-a para preservar a origem** (Set A 20) — proveniência por fragmento
  recuperado.
- **`context-assembly`:** entrega-lhe o recuperado e **a usa como demanda de contexto, não como
  autorização de busca livre** (Set A 19); **não** monta o pacote (fronteira distinta).
- **`evidence-compilation`:** **apoia-a** quando o retrieval sustentar verificação, falha, auditoria
  ou decisão futura (Set A 21); o recuperado e seus motivos de inclusão/exclusão são insumo
  evidenciário.
- **`retrieval-query`/`context-curation`** (skills futuras): o subagente as comporia quando
  especificadas.

---

## 17. Relação com interface-subagent

O [`interface-subagent`](interface-subagent.spec.md) **encaminha** ao `retrieval-subagent` quando o
contexto precisa ser recuperado (interface §17). O `retrieval-subagent` recebe o objetivo de
recuperação **com privilégio atenuado**, recupera dentro do escopo do tenant e devolve o conjunto
governado — sem decidir nem montar o pacote final.

---

## 18. Relação com verification-subagent futuro

Quando a **evidência recuperada** precisar ser verificada quanto à conformidade, o
`retrieval-subagent` **encaminha** ao `verification-subagent` futuro (auditor independente; quem
recupera não verifica a si mesmo). (Esta spec **não** cria `verification-subagent.spec.md`.)

---

## 19. Relação com retrieval-governance

`retrieval-governance` é a **spec governante** principal do papel: fixa **como** se recupera (face
contextual da governança, não busca livre; tenant scope + camada de autoridade + proveniência por
fragmento; motivo de inclusão/exclusão; não-elevação de autoridade; tratamento de escopo ausente/
autoridade indevida). O `retrieval-subagent` **a aplica como papel** (Set A 18), sem redefini-la nem
substituí-la (Set B 9).

---

## 20. Relação com observability

A recuperação é **observável e auditável**. **Toda recuperação deve registrar** (Set B 11):

- tenant;
- objetivo de recuperação;
- escopo permitido;
- fontes candidatas;
- fontes usadas;
- fontes excluídas (quando relevante);
- motivo de inclusão;
- motivo de exclusão (quando relevante);
- authority layer;
- provenance;
- evidência disponível;
- evidência ausente;
- limitações;
- risco de poisoning, distraction, confusion ou clash;
- necessidade de pendência ou escalada.

Também registra as recuperações barradas (cross-tenant, sem escopo, sem proveniência, autoridade
indevida); é read-only para o executor; sustenta a reconstrução de episódio **dentro do tenant**.
*Nenhuma recuperação confiável sem trilha auditável.* (Conteúdo da antiga seção "deve registrar"
consolidado aqui no alinhamento estrutural.)

---

## 21. Critérios de aceite

O subagente é aceito (quando, no futuro, promovido) somente se:

1. permanece **documental, modular, limitado, revisável e subordinado a specification** (Set A 1, 23);
2. **prepara recuperação governada read-only por política**, sem decidir operação (Set A 2);
3. **não** autoriza, executa, altera estado, nem substitui service decision / verification /
   retrieval-governance / policy enforcement (Set A 6–9; Set B 8–10);
4. **respeita** tenant scope (Set A 10), **preserva** tenant boundary (Set A 11), **respeita** tenant
   retrieval scope (Set A 12), tenant policy pack (Set A 13), operational boundaries (Set A 14) e
   authority layer (Set A 15); **não** recupera cross-tenant (Set B 12, 13);
5. **não** eleva Metadata acima de Authority (Set B 14); **não** transforma prompt em escopo (Set B
   15); **não** permite prompt/LLM expandirem a busca (Set B 16); **não** permite bypass (Set B 17);
6. **preserva provenance por fragmento** (Set A 16) e **evidence** quando vinculada (Set A 17);
   fragmento sem proveniência não governa decisão;
7. **opera sob** retrieval-governance (Set A 18); **usa** context-assembly como demanda (Set A 19) e
   provenance-tagging para preservar origem (Set A 20); **apoia** evidence-compilation (Set A 21);
8. **registra** os campos do §20 (Set B 11); trata retrieval ambíguo/insuficiente/contaminado/
   contraditório/sem proveniência/fora de escopo por isolamento/descarte/pendência/escalada (Set B 18);
9. **alimenta** context-assembly/evidence-compilation/episode trace/audit log quando promovido (Set B
   19); é atribuível por failure attribution (Set B 20), auditável por entropy audit (Set B 21),
   registrável por intervention log (Set A 22);
10. é reconstruível e revisável por humano (prosa estruturada, sem sintaxe de máquina).

---

## 22. Critérios de rejeição

O subagente é rejeitado se:

1. faz **busca livre / crawl / acesso irrestrito**, ou age como **RAG autônomo, crawler, ferramenta,
   decisor ou LLM com autoridade** (Set A 3–5, 24);
2. **decide operação, autoriza ação, executa tool ou altera estado** (Set A 2, 6, 7; Set B 8); ou
   **substitui** service decision / verification / retrieval-governance / policy enforcement (Set A
   8, 9; Set B 9, 10);
3. **recupera fora do tenant scope** (Set B 12) ou **cruza** entre tenants (Set B 13);
4. **eleva Metadata acima de Authority** (Set B 14), **transforma prompt em escopo** (Set B 15),
   **permite prompt/LLM expandirem a busca** (Set B 16) ou **permite bypass** (Set B 17);
5. admite fragmento **sem proveniência** governando decisão, **não preserva provenance/evidence**
   (Set A 16, 17), ou **inventa** fonte/evidência/proveniência;
6. **não registra** os campos do §20 (Set B 11), impedindo reconstrução/auditoria;
7. trata retrieval ambíguo/insuficiente/contaminado/contraditório/sem proveniência/fora de escopo
   **sem** isolamento/descarte/pendência/escalada (Set B 18);
8. **monta o pacote final** de contexto (papel de `context-assembly`);
9. **vira buscador generalista, crawler autônomo, RAG livre, mini-agente autônomo, runtime ou
   executor** (Set A 24);
10. introduz sintaxe de máquina ou peça executável; ou reposiciona o YZI OS.

---

## 23. Quando isolar, descartar, pendenciar evidência ou escalar

Extraído de [`retrieval-governance`](../../p2/retrieval-governance.spec.md) §9,
[`tenant-retrieval-scope`](../../p2/tenant-retrieval-scope.spec.md) §6.11 e
[`context-isolation`](../../p2/context-isolation.spec.md) §6.6 (Set B 18):

| Situação da recuperação | Resposta registrada |
| --- | --- |
| Escopo ausente / fora de escopo | **bloquear**/isolar; não recupera por padrão |
| Autoridade indevida | **bloquear**; gerar evidência auditável |
| Cross-tenant | **bloquear**; nunca atravessa fronteira |
| Proveniência ausente/frágil | **descartar**/isolar; **pendência de evidência** |
| Contaminado (poisoning) | **descartar**/isolar; **escalar** se persistente |
| Contraditório / conflito entre fontes | **registrar**; **escalar** se irreconciliável |
| Ambíguo / insuficiente | **reportar, não inventar**; pendência ou escalada |

Nunca há **admissão silenciosa** nem invenção: lacuna/ambiguidade/conflito/contaminação é registrada e
tratada por **isolamento, descarte, pendência de evidência ou escalada**.

---

## 24. Riscos arquiteturais evitados

| Risco | Mitigação nesta spec |
| --- | --- |
| Busca livre / RAG autônomo / crawler | §6, §7, §22.1 (Set A 3–5, 24) |
| Vazamento cross-tenant / quebra de soberania | §12, §22.3, §23 (Set B 12, 13) |
| Elevação de autoridade do recuperado / Metadata>Authority | §7, §11, §22.4 (Set B 14) |
| Expansão de escopo por prompt/LLM | §7, §11, §22.4 (Set B 15, 16) |
| Bypass de fronteira/governança | §11 (Set B 17) |
| Poisoning / fragmento sem proveniência | §14, §20, §23 (Set A 16) |
| Recuperação opaca (sem registro) | §20 (Set B 11) |
| Invenção de fonte/evidência | §11, §22.5, §23 ("reporta, não inventa") |
| Subagente montando o pacote ou virando executor | §5, §11, §22.8/§22.9 (Set A 24) |

---

## 25. Dependências

- **Aprovadas:** `retrieval-governance`, `tenant-retrieval-scope`, `tenant-policy-pack`,
  `context-assembly`, `context-isolation`, `context-provenance`, `operational-boundaries`,
  `behavioral-governance`, `policy-enforcement`, `escalation-policy` (P2); invariantes P0;
  `memory-model`, `tenant-state-isolation`, `operational-state` (P1); observabilidade P3; skills
  mínimas P4 (`provenance-tagging`, `context-assembly`, `evidence-compilation`); par
  `interface-subagent` (P4).
- **Futuras (pendentes):** skills `retrieval-query`, `context-curation`; `retrieval-harness` /
  `tenant-harness` (P5) que o aplicam/administram; `verification-subagent` futuro. Enquanto não
  aprovados, a promoção **executável** permanece bloqueada (contract-first); esta spec é
  **documental**.

---

## 26. Próxima peça recomendada

Seguindo o conjunto mínimo de subagentes do [Subagent Map §8](../../../subagents/subagent-map.md), a
próxima peça recomendada é o **`verification-subagent`** (auditor independente) — completando o mínimo
(interface → retrieval → verification). Uma peça por vez, com checkpoint. **Não avancei para ele** (e
os guardrails proíbem criar `verification-subagent.spec.md` agora).

---

## 27. Checkpoint

1. **Arquivo ajustado:** apenas `/docs/specs/p4/subagents/retrieval-subagent.spec.md`. Nenhum outro
   arquivo criado ou alterado.
2. **Natureza respeitada:** spec documental de subagente · governance-first · subagent-preparation ·
   linguagem natural estruturada. **Sem** YAML/JSON/schema/DSL/pseudo-código/contrato
   machine-readable/código/API/configuração/plano de implementação; sem inferência de stack.
3. **Estrutura:** **exatamente as 27 seções obrigatórias**, na ordem definida. O alinhamento dobrou a
   antiga seção "deve registrar" em §20, consolidou `tenant-retrieval-scope` em §14 e renomeou §8 —
   **sem reescrever nem adicionar doutrina**.
4. **Critérios obrigatórios:** os **38** (Set A 1–24 + Set B 8–21) estão explícitos e mapeados às
   seções (citados por número ao longo do texto e no Adendo).
5. **Confirmação de fronteira:** **nenhum** subagente executável, skill executável, harness, código,
   API, schema, frontend, backlog, YAML/JSON ou contrato machine-readable foi criado. **Não** foi
   criado `verification-subagent.spec.md`. Specs P0–P3, mapas e checkpoints **não** modificados.

**Parado aqui. Não avancei para o próximo subagente.**

---

## Adendo — Mapa dos 38 critérios obrigatórios

> Consolida o mapeamento dos **38 critérios** (Set A "faltantes", 1–24 + Set B "já aplicados", 8–21)
> às seções. Substitui os adendos parciais das voltas anteriores. **Todos explícitos.**

### Set A — critérios 1–24

| # | Critério (resumo) | Seções |
| --- | --- | --- |
| 1 | documental, não executável | §1, §2, §6 |
| 2 | prepara recuperação governada, não decide operação | §3, §6, §11 |
| 3 | não é busca livre | §6, §7, §22.1 |
| 4 | não é RAG autônomo | §6, §8, §22.1 |
| 5 | não é crawler | §6, §22.1 |
| 6 | não autoriza ação | §11 |
| 7 | não executa tool | §11 |
| 8 | não substitui service decision | §11, §22.2 |
| 9 | não substitui verification | §11, §22.2 |
| 10 | respeitar tenant scope | §12, §21.4 |
| 11 | preservar tenant boundary | §12, §21.4 |
| 12 | respeitar tenant retrieval scope | §14, §21.4 |
| 13 | respeitar tenant policy pack | §14, §21.4 |
| 14 | respeitar operational boundaries | §14, §21.4 |
| 15 | respeitar authority layer | §12, §21.4 |
| 16 | preservar provenance por fragmento | §14, §21.6 |
| 17 | preservar evidence quando vinculada | §10, §21.6 |
| 18 | operar sob retrieval-governance | §7, §14, §19 |
| 19 | usar context-assembly como demanda, não autorização de busca livre | §7, §16 |
| 20 | usar provenance-tagging para preservar origem | §16 |
| 21 | apoiar evidence-compilation quando sustentar verificação/falha/auditoria/decisão | §16 |
| 22 | intervenção registrada por intervention log | §15 |
| 23 | modular, limitado, revisável, subordinado a specification | §6, §21.1 |
| 24 | não virar buscador generalista/crawler autônomo/RAG livre/mini-agente/runtime/executor | §11, §22.9 |

### Set B — critérios 8–21 (já aplicados em volta anterior; permanecem explícitos)

| # | Critério (resumo) | Seções |
| --- | --- | --- |
| 8 | não altera estado | §11, §13 |
| 9 | não substitui retrieval-governance | §11, §19, §22.2 |
| 10 | não substitui policy enforcement | §11, §14, §22.2 |
| 11 | deve registrar [lista completa] | §20 |
| 12 | não pode recuperar fora do tenant scope | §11, §12, §23 |
| 13 | não pode cruzar entre tenants | §12, §22.3, §23 |
| 14 | não pode elevar Metadata acima de Authority | §7, §12, §22.4 |
| 15 | não pode transformar prompt em escopo de retrieval | §11, §22.4 |
| 16 | não pode permitir LLM/agente/prompt expandir escopo | §7, §11, §22.4 |
| 17 | não pode permitir bypass de tenant boundary/retrieval-governance/enforcement/operational boundaries | §11, §22.4 |
| 18 | retrieval ambíguo/insuficiente/contaminado/contraditório/sem proveniência/fora de escopo → isolamento/descarte/pendência/escalada | §23 |
| 19 | alimentar context-assembly/evidence-compilation/episode trace/audit log | §15, §16, §21.9 |
| 20 | falha atribuível por failure attribution | §15 |
| 21 | entropia auditável por entropy audit | §15 |

> **Certificação:** **38/38 critérios obrigatórios explícitos** (Set A 1–24 + Set B 8–21) e
> **estrutura com exatamente 27 seções**. Conteúdo preservado; nenhuma doutrina nova.

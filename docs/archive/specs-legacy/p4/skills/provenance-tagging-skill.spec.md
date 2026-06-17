# provenance-tagging — Skill Spec (documental)

> **Spec documental de skill (P4), architecture-only · governance-first · skill-preparation ·
> linguagem natural estruturada.** Define o **contrato** da capacidade `provenance-tagging` — o que
> ela é, o que anexa, seus limites, critérios de aceite/rejeição, observabilidade e proveniência.
> **Não** é skill executável, prompt final nem machine-readable. **Não** usa YAML, JSON, schema,
> DSL, pseudo-código, contrato técnico executável, código, API, configuração ou plano de
> implementação. **Descreve o contrato; não o implementa.** A arquitetura continua sendo o produto.
>
> Derivada fielmente de: [Skill Map](../../../skills/skill-map.md) (card `provenance-tagging`),
> [p4-preparation-map](../p4-preparation-map.md), [intent-extraction-skill](intent-extraction-skill.spec.md),
> [context-assembly-skill](context-assembly-skill.spec.md), [checkpoint P0–P3](../../specs-p0-p3-checkpoint.md)
> e as specs P0–P3 aprovadas — em especial [`context-provenance`](../../p2/context-provenance.spec.md),
> [`context-isolation`](../../p2/context-isolation.spec.md) e
> [`context-assembly`](../../p2/context-assembly.spec.md). **Não inventa doutrina; extrai o contrato
> já consolidado.**

> **Nota de reconstrução (transparência).** O briefing desta peça chegou truncado: a **lista de
> condições obrigatórias faltou inteira** e a **estrutura só sobreviveu dos itens 17–28**; os itens
> **1–16** da estrutura faltaram. Reconstruí (a) os **itens 1–16** por analogia direta à
> [`context-assembly-skill`](context-assembly-skill.spec.md) (mesmo template de 28 seções, com os
> itens 17–28 confirmados pelo briefing) e (b) as **condições obrigatórias** a partir do card
> `provenance-tagging` do Skill Map e, sobretudo, da spec aprovada
> [`context-provenance`](../../p2/context-provenance.spec.md) — da qual esta skill é a forma de
> capacidade. Todas as reconstruções estão sinalizadas; **aberto a ajuste aditivo direcionado** caso
> a numeração/condições pretendidas divirjam.

---

## 1. Identificação

| Campo | Valor |
| --- | --- |
| Nome | `provenance-tagging` |
| Tipo | Skill (capacidade modular reutilizável) — **documental nesta fase** |
| Grupo | S-A Contexto (Skill Map §6) |
| Camada | context-engineering / observability |
| Specs governantes (aprovadas) | `context-provenance` (P2, principal); `context-assembly`, `context-isolation` (P2); invariantes P0; `memory-model` (P1); observabilidade P3 |
| Tenant-scope | Per-tenant |
| Proveniência | `[CE]` `[PYR]` |
| Status | Spec documental de preparação P4 — **não executável** |

---

## 2. Status, camada, onda e owner arquitetural *(seção reconstruída)*

- **Status:** documental · skill-preparation · não executável · proposta para aprovação.
- **Camada:** context-engineering / observability.
- **Onda:** P4 (preparação de skills), terceira peça individual; sucede `context-assembly`.
- **Owner arquitetural:** Context Engineering + Observabilidade.

---

## 3. Propósito *(seção reconstruída)*

Definir o contrato da capacidade que **anexa proveniência a cada fragmento de contexto** — origem,
vínculo à fonte, momento, confiança, limitações, tenant e autoridade — de modo que o contexto seja
**auditável, reconstruível e atribuível**. Sem proveniência não há observabilidade, auditoria nem
atribuição de falha, e o fragmento **não pode governar decisão**. A skill **anexa** proveniência;
**não** decide, não executa, não governa, não verifica e **não altera o conteúdo do fragmento**.

---

## 4. Escopo *(seção reconstruída)*

- Anexar, a cada fragmento, a **anatomia da proveniência** (§10).
- Graduar a força da proveniência pela autoridade pretendida (Authority exige mais que Metadata).
- Marcar fragmentos com proveniência **ausente, em conflito ou frágil** para tratamento (§24).
- Alimentar observabilidade, auditoria e atribuição de falha (§16, §21).
- Permanecer modular, reutilizável e subordinada a specification.

---

## 5. Fora de escopo *(seção reconstruída)*

Esta spec **não** contém: skill executável · prompt final/de skill · configuração · código · API ·
schema · frontend · backlog · sprint plan · roadmap técnico · plano de implementação · YAML/JSON ·
DSL · pseudo-código · contrato machine-readable · inferência de stack. A skill **não** altera o
conteúdo do fragmento, não decide operação, não autoriza ação, não executa tool, não altera estado,
e não substitui service decision, policy enforcement, retrieval governance, tool permission nem
verification.

---

## 6. Definição da skill *(seção reconstruída)*

**É:** capacidade **modular, reutilizável e subordinada a specification** que recebe um fragmento e
devolve **o mesmo fragmento acrescido de proveniência** (entrada → saída: fragmento → fragmento com
proveniência), sem modificar o conteúdo.

**NÃO é:** prompt gigante · persona · mini-agente autônomo · decisor · executor · enforcement ·
verificação · fonte de verdade.

> Invariante: `provenance-tagging` **não detém autoridade comportamental** — anexa metadado de
> origem; não inventa, não eleva e não remove proveniência. (`P1` `DO6`)

---

## 7. Provenance tagging como anexação por fragmento, não decisão *(seção reconstruída)*

A skill **anexa proveniência por fragmento, mas não decide operação**. O que ela entrega é o
fragmento **rotulado** (origem/vínculo/momento/confiança/limitações/tenant/autoridade) — submetido
depois a isolamento, montagem, governança, decisão e verificação. A anexação:

- **não autoriza ação**;
- **não executa tool**;
- **não altera estado**;
- **não altera o conteúdo do fragmento** (limite do Skill Map);
- **não substitui** service decision, policy enforcement, retrieval governance, tool permission nem
  verification.

---

## 8. Entradas conceituais da skill *(seção reconstruída)*

- O **fragmento** a marcar (proveniente de estado, memória permitida, retrieval governado,
  evidência ou tool), dentro do tenant ativo.
- A **fonte** verificável que o produziu (para o vínculo à fonte).
- As **policies de proveniência** aplicáveis (o que é exigido; como a confiança é atribuída).
- O **authority layer** pretendido do fragmento (Authority … Metadata).

---

## 9. Saídas conceituais da skill *(seção reconstruída)*

- O **mesmo fragmento, acrescido de proveniência** completa (§10), sem alteração de conteúdo.
- A **marcação** de fragmentos com proveniência ausente/conflitante/frágil para tratamento (§24).
- A **trilha auditável** que sustenta observabilidade, auditoria e atribuição de falha.

---

## 10. Anatomia da proveniência de um fragmento

Extraído de [`context-provenance`](../../p2/context-provenance.spec.md) §7:

| Elemento | Significado |
| --- | --- |
| **Origem** | de onde o fragmento veio (estado, memória, retrieval, evidência, tool) |
| **Vínculo à fonte** | ligação verificável entre o fragmento e a fonte que o produziu |
| **Momento** | quando foi produzido/recuperado |
| **Confiança** | grau de confiança/qualidade atribuído |
| **Limitações** | restrições/fraquezas conhecidas da fonte ou do fragmento |
| **Tenant** | a qual tenant pertence |
| **Autoridade** | camada/origem de autoridade (Authority…Metadata) |

A proveniência é **dado de primeira classe**, não anotação opcional. A **força exigida é graduada
pela autoridade pretendida**: Authority exige proveniência mais forte que Metadata, e
prompt/conversa **não** basta como proveniência para verdade operacional.

---

## 11. Riscos de proveniência *(seção reconstruída)*

Extraído de [`context-provenance`](../../p2/context-provenance.spec.md) §17:

| Risco | Como a skill o evita |
| --- | --- |
| **Contexto opaco** | fragmento sem origem não governa decisão |
| **Poisoning** | proveniência barra fragmento falso/sem origem válida |
| **Proveniência forjada** | LLM/agente não inventa, não eleva e não remove proveniência |
| **Perda na compressão** | proveniência é preservada em toda transformação |
| **Falha não atribuível** | proveniência aponta o fragmento/origem causador |
| **Vazamento via proveniência** | metadado de origem não cruza tenant |

---

## 12. Limites da skill *(seção reconstruída)*

A skill `provenance-tagging`:

- **não** decide operação · **não** autoriza ação · **não** executa tool · **não** altera estado;
- **não** altera o conteúdo do fragmento;
- **não** substitui service decision, policy enforcement, retrieval governance, tool permission nem
  verification;
- **não** forja, eleva nem remove proveniência; **não** declara origem sem evidência;
- **não** cruza proveniência entre tenants nem expõe outro tenant;
- **não** vira prompt gigante, persona ou mini-agente autônomo.

---

## 13. Relação com P0 *(seção reconstruída)*

- **layer-authority-model:** a autoridade do fragmento é parte da proveniência e sustenta a ordem
  Authority › … › Metadata; Authority exige proveniência mais forte que Metadata.
- **conflict-resolution:** conflito de proveniência resolve-se por ordem de valores e é registrado
  (§24), nunca por preferência do modelo.
- **tenant-boundary:** a proveniência **preserva o tenant boundary**; não cruza tenant nem expõe
  outro tenant.

---

## 14. Relação com P1 *(seção reconstruída)*

- **operational-state:** a skill **respeita o estado como verdade** e **não o altera**.
- **memory-model:** memória recuperada sem proveniência válida **não** entra no que governa decisão;
  a skill exige proveniência da memória permitida.
- **tenant-state-isolation:** a proveniência é marcada dentro do tenant ativo, isolada.

---

## 15. Relação com P2 *(seção reconstruída)*

- **context-provenance:** a skill **opera o contrato já fixado** (anatomia, força graduada,
  preservação na compressão, barreira a fragmento sem proveniência). Não o redefine.
- **context-assembly / context-isolation:** fornece a proveniência que a montagem usa como critério
  e que o isolamento usa para barrar poisoning e fragmentos sem origem.
- **retrieval-governance:** todo fragmento recuperado carrega proveniência **por fragmento**; a
  skill a anexa, sem **substituir** retrieval governance.

---

## 16. Relação com P3 *(seção reconstruída)*

- **episode-trace / audit-log:** a proveniência é, ela própria, observável; alimenta episode trace e
  audit log futuros.
- **failure-attribution:** falha relacionada à proveniência **deve ser atribuível**; a proveniência
  por fragmento é a base da atribuição de falha.
- **entropy-audit:** entropia causada por proveniência ausente/frágil **deve ser auditável**.
- **intervention-log:** intervenção relacionada à proveniência **deve ser registrada**.
- **verification-report:** a skill **não substitui** verification; fornece a evidência de origem que
  a verificação usa.

---

## 17. Relação com intent-extraction-skill

A proposta de [`intent-extraction`](intent-extraction-skill.spec.md) entra como **Metadata**; a
proveniência marca essa origem como **prompt/intenção** — autoridade mínima. A skill **não** eleva a
intenção declarada/inferida a Authority por meio da proveniência: prompt/conversa **não** é
proveniência suficiente para verdade operacional.

---

## 18. Relação com context-assembly-skill

`provenance-tagging` **apoia** [`context-assembly`](context-assembly-skill.spec.md): a montagem
exige proveniência por fragmento (critério *proveniência*) e usa a marcação para incluir/excluir,
ordenar por authority layer e prevenir poisoning. A skill anexa; a montagem compõe — fronteiras
distintas.

---

## 19. Relação com retrieval-governance

O retrieval governado entrega fragmentos que **devem** carregar proveniência por fragmento; a skill
a anexa/valida. Ela **não recupera** e **não substitui** retrieval governance — apenas marca a
origem do que foi recuperado dentro do tenant retrieval scope.

---

## 20. Relação com evidence-compilation futura

A futura skill `evidence-compilation` (S-D Verificação) compõe o objeto evidenciário a partir de
requisitos e resultados; ela **depende da proveniência** que `provenance-tagging` anexa — sem origem
rastreável, evidência vira asserção. A relação é de **insumo** (proveniência → evidência), sem que
`provenance-tagging` conclua ou verifique.

---

## 21. Relação com observability

A proveniência é **a própria matéria** da observabilidade do contexto: registra, por fragmento,
origem · momento · confiança · tenant · autoridade, e os fragmentos barrados por ausência/
insuficiência. Sustenta a trilha read-only que preserva auditoria posterior e atribuição de falha.
*Nenhum fragmento governante sem proveniência.*

---

## 22. Critérios de aceite

A skill é aceita (quando, no futuro, promovida) somente se:

1. permanece **documental**, **modular, reutilizável e subordinada a specification**;
2. **anexa proveniência por fragmento** (§10) **sem alterar o conteúdo** do fragmento;
3. **não decide, não autoriza, não executa, não altera estado** e **não substitui** service
   decision / enforcement / retrieval governance / tool permission / verification;
4. **gradua** a força da proveniência pela autoridade (Authority > Metadata) e **não aceita**
   prompt/conversa como proveniência suficiente para verdade operacional;
5. **preserva** proveniência em toda transformação, inclusive compressão;
6. **respeita** tenant scope, **preserva** tenant boundary e **respeita** estado como verdade;
7. trata proveniência **ausente/conflitante/frágil** por isolamento/descarte/pendência/escalada (§24)
   — nunca admissão silenciosa;
8. **alimenta** observabilidade, auditoria e atribuição de falha; é **atribuível** por
   failure-attribution, **auditável** por entropy-audit e **registrável** por intervention-log;
9. impede LLM/agente de **forjar, elevar ou remover** proveniência;
10. é reconstruível e revisável por humano (prosa estruturada, sem sintaxe de máquina).

---

## 23. Critérios de rejeição

A skill é rejeitada se:

1. **altera o conteúdo** do fragmento ao marcá-lo;
2. **decide, autoriza, executa ou altera estado**; ou **substitui** service decision / enforcement /
   retrieval governance / tool permission / verification;
3. admite fragmento com proveniência **ausente, em conflito ou frágil** governando decisão (sem
   isolamento/descarte/pendência/escalada);
4. **não registra** origem/vínculo/momento/confiança/limitações/tenant/autoridade;
5. trata **prompt/conversa** como proveniência suficiente, ou **não** exige proveniência mais forte
   para Authority;
6. **perde** proveniência em alguma transformação (ex.: compressão que apaga origem);
7. permite **forjar, elevar ou remover** proveniência (LLM/agente/runtime);
8. **cruza** proveniência entre tenants ou expõe outro tenant;
9. **usa memória do modelo como verdade operacional**;
10. **vira prompt gigante, persona ou mini-agente autônomo**;
11. introduz sintaxe de máquina ou peça executável; ou reposiciona o YZI OS.

---

## 24. Quando isolar, descartar, pendenciar evidência ou escalar

Extraído de [`context-provenance`](../../p2/context-provenance.spec.md) §8 e
[`context-isolation`](../../p2/context-isolation.spec.md) §6.6:

| Situação da proveniência | Resposta registrada |
| --- | --- |
| Ausente | **isolar** ou **descartar**; não governa decisão |
| Frágil / confiança insuficiente | **pendência de evidência** |
| Em conflito entre fragmentos | **registrar** conflito; isolar fontes; **escalar** se irreconciliável |
| Suspeita de forja/poisoning | **descartar**/isolar; **escalar** |
| Cross-tenant / autoridade indevida | **bloquear**; gerar evidência auditável |

Nunca há **admissão silenciosa**: toda ausência, fragilidade ou conflito de proveniência é registrada
e tratada por isolamento, descarte, pendência de evidência ou escalada.

---

## 25. Riscos arquiteturais evitados *(seção reconstruída)*

| Risco | Mitigação nesta spec |
| --- | --- |
| Contexto opaco / fragmento sem origem governando | §10, §22; barreira a fragmento sem proveniência |
| Poisoning | §11, §24; proveniência barra fragmento falso |
| Proveniência forjada/elevada/removida | §12, §23; integridade da proveniência |
| Perda de proveniência na compressão | §11; preservação em toda transformação |
| Prompt/intenção virando Authority | §17; força graduada; prompt = Metadata |
| Vazamento cross-tenant via metadado | §13; tenant boundary preservado |
| Falha não atribuível / entropia não auditável | §16; alimenta failure-attribution/entropy-audit |
| Skill virar prompt gigante/persona/mini-agente | §6, §12 |

---

## 26. Dependências *(seção reconstruída)*

- **Aprovadas:** `context-provenance` (principal), `context-assembly`, `context-isolation`,
  `retrieval-governance`, `tenant-retrieval-scope` (P2); invariantes P0; `operational-state`,
  `memory-model`, `tenant-state-isolation` (P1); observabilidade P3; pares
  `intent-extraction-skill` e `context-assembly-skill` (P4).
- **Futuras (pendentes):** `context-harness` / `audit-harness` / `observability-harness` (P5,
  mapeados) administram a skill quando promovida; `evidence-compilation` (skill futura) a consome.
  Enquanto não aprovados, a promoção **executável** permanece bloqueada (contract-first); esta spec é
  **documental**.

---

## 27. Próxima peça recomendada *(seção reconstruída)*

Concluído o conjunto mínimo de **contexto** (intent-extraction → context-assembly →
provenance-tagging), a próxima peça recomendada do conjunto mínimo do
[Skill Map §8](../../../skills/skill-map.md) é **`evidence-compilation`** (S-D Verificação) — mapear
requisitos a verificações e compor o objeto evidenciário. Uma peça por vez, com checkpoint. **Não
avancei para ela** (e os guardrails proíbem criar `evidence-compilation-skill.spec.md` agora).

---

## 28. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/skills/provenance-tagging-skill.spec.md`. Nenhum outro
   arquivo criado ou alterado. **Não** foi criado `evidence-compilation-skill.spec.md`.
2. **Natureza respeitada:** spec documental de skill · governance-first · skill-preparation ·
   linguagem natural estruturada. **Sem** YAML/JSON/schema/DSL/pseudo-código/contrato
   machine-readable/código/API/configuração/plano de implementação; sem inferência de stack.
3. **Estrutura:** 28 seções entregues; itens **17–28** conforme o briefing; itens **1–16**
   **reconstruídos** por analogia à `context-assembly-skill` (sinalizados).
4. **Condições obrigatórias:** **faltaram inteiras no briefing** e foram **reconstruídas** a partir
   de `context-provenance` (P2) + card `provenance-tagging` (Skill Map), incorporadas aos §10–§24 e
   aos critérios de aceite/rejeição. **Sinalizado; aberto a ajuste aditivo direcionado.**
5. **Derivação fiel:** contrato extraído do cânone aprovado (`context-provenance` lido na íntegra);
   **sem inventar doutrina, sem duplicar**. Specs P0–P3, mapas e checkpoints **não** modificados.
6. **Confirmação de fronteira:** **nenhuma** skill executável, subagente, harness, código, API,
   schema, frontend, backlog, YAML/JSON ou contrato machine-readable foi criado.

**Parado aqui. Não avancei para a próxima skill.**

---

## Adendo — Reforço aditivo de critérios obrigatórios

> **Reforço aditivo (não reescrita).** Bloco acrescentado por autorização explícita para tornar os
> critérios obrigatórios **explícitos**. **Nenhuma** outra parte da spec foi reescrita; nenhum outro
> arquivo foi criado.
>
> **Transparência honesta:** a lista de critérios obrigatórios chegou **truncada**. Foram aplicados
> **apenas os critérios legíveis**; os demais permanecem **pendentes** e **não estão certificados**.
> Não certifico 28/28 sem conseguir lê-los.

### A — Critérios obrigatórios legíveis e aplicados

- **Critério 1 — `provenance-tagging` é skill documental, não executável nesta fase.**
  Reforça §1 (Status: documental — não executável), §2 e §6. **Aplicado.**
- **Critério 2 — a skill anexa e preserva proveniência, mas NÃO decide operação.**
  Reforça §6, §7 e §9 (anexa/preserva; entrega fragmento rotulado, não decisão). **Aplicado.**
- **Critério 3 — a skill NÃO autoriza ação.** Reforça §7 e §12. **Aplicado.**
- **Critério 4 — a skill NÃO executa tool.** Reforça §7 e §12. **Aplicado.**
- **Critério 5 — a skill NÃO altera estado.** Reforça §7, §12 e §14. **Aplicado.**
- **Critério 6 — a skill NÃO substitui verification.** Reforça §12, §16 e §23.2. **Aplicado.**
- **Critério 7 — a skill NÃO substitui policy enforcement.** (Recebido truncado em "polic"; texto
  inequívoco pelo padrão.) Reforça §12, §15 e §23.2. **Aplicado.**
- **Cláusula solta (sem número de critério) — a skill NÃO pode remover proveniência crítica.**
  Já coberta por §12 e §23.7 (não forja, não eleva, não remove proveniência). **Aplicada;** número
  de critério **não recebido**.
- **Critério 26 — a skill DEVE preservar auditabilidade e reconstrução posterior.**
  Reforça §16, §21 e §22.8 (trilha read-only; alimenta observabilidade/auditoria/atribuição de
  falha). **Aplicado.**
- **Critério 27 — a skill DEVE permanecer modular, reutilizável e subordinada a specification.**
  Reforça §4, §6 e §22.1. **Aplicado.**
- **Critério 28 — a skill NÃO DEVE virar prompt gigante, persona ou mini-agente autônomo.**
  Reforça §6, §12 e §23.10. **Aplicado.**

### B — Critérios obrigatórios 8–25 (recebidos íntegros e aplicados)

- **Critério 8 — NÃO substitui `context-provenance`.** Opera o contrato, não o redefine. Reforça
  §15 e §23.2. **Aplicado.**
- **Critério 9 — NÃO inventa fonte.** Reforça §12 e §23.7. **Aplicado.**
- **Critério 10 — NÃO fabrica evidência.** Reforça §12, §20 e §23.7. **Aplicado.**
- **Critério 11 — NÃO transforma prompt em Authority.** Reforça §10, §17 e §22.4. **Aplicado.**
- **Critério 12 — NÃO transforma memória do modelo em verdade operacional.** Reforça §14 e §23.9.
  **Aplicado.**
- **Critério 13 — DEVE respeitar tenant scope.** Reforça §13, §14 e §22.6. **Aplicado.**
- **Critério 14 — DEVE preservar tenant boundary.** Reforça §13 e §22.6. **Aplicado.**
- **Critério 15 — DEVE preservar o vínculo entre fragmento e origem.** Reforça §10 (vínculo à
  fonte). **Aplicado.**
- **Critério 16 — DEVE indicar, quando aplicável:** fonte · momento · tenant scope · camada de
  origem · motivo de inclusão · motivo de exclusão (quando relevante) · confiança conhecida ·
  limitações conhecidas · authority layer · relação com estado/policy/specification/retrieval/
  memória/evidência. Reforça §10 (anatomia) e §9. **Aplicado.**
- **Critério 17 — DEVE acompanhar fragmentos durante seleção, compressão, isolamento, descarte,
  escalada e composição de contexto.** Reforça §11 e §15 (preservação em toda transformação) e §24.
  **Aplicado.**
- **Critério 18 — Compressão NÃO pode remover proveniência crítica.** (Era a cláusula solta da
  volta anterior; agora numerada.) Reforça §11 e §22.5. **Aplicado.**
- **Critério 19 — Fragmento sem proveniência suficiente NÃO pode governar decisão.** Reforça §21,
  §22.2 e §24. **Aplicado.**
- **Critério 20 — Fragmento com proveniência ausente, frágil, contraditória ou contaminada DEVE
  gerar isolamento, descarte, pendência de evidência ou escalada.** Reforça §24. **Aplicado.**
- **Critério 21 — DEVE apoiar `context-assembly`, `retrieval-governance`, `evidence-compilation`,
  episode trace, audit log e verification report.** Reforça §16, §18, §19, §20 e §21. **Aplicado.**
- **Critério 22 — Falha DEVE ser atribuível por failure attribution.** Reforça §16. **Aplicado.**
- **Critério 23 — Entropia DEVE ser auditável por entropy audit.** Reforça §16. **Aplicado.**
- **Critério 24 — Intervenção DEVE ser registrada por intervention log.** Reforça §16. **Aplicado.**
- **Critério 25 — DEVE impedir que LLM, agente ou prompt declarem origem sem evidência.** Reforça
  §12 e §23.7. **Aplicado.**

### C — Certificação final

> **28/28 critérios obrigatórios explícitos.** Critérios **1–7 e 26–28** aplicados em voltas
> anteriores (Adendo A); critérios **8–25** recebidos íntegros e aplicados nesta volta (Adendo B).
> Todos os 28 estão agora explícitos nesta spec, ancorados nas seções indicadas. A cláusula que
> antes chegara solta ("compressão não remove proveniência crítica") corresponde ao **critério 18**.

**Parado aqui. Não avancei para a próxima skill.**

# evidence-compilation — Skill Spec (documental)

> **Spec documental de skill (P4), architecture-only · governance-first · skill-preparation ·
> linguagem natural estruturada.** Define o **contrato** da capacidade `evidence-compilation` — o
> que ela é, o que organiza, seus limites, critérios de aceite/rejeição, observabilidade e
> proveniência. **Não** é skill executável, prompt final nem machine-readable. **Não** usa YAML,
> JSON, schema, DSL, pseudo-código, contrato técnico executável, código, API, configuração ou plano
> de implementação. **Descreve o contrato; não o implementa.** A arquitetura continua sendo o
> produto.
>
> Derivada fielmente de: [Skill Map](../../../skills/skill-map.md) (card `evidence-compilation`),
> [p4-preparation-map](../p4-preparation-map.md), as skills P4 anteriores
> ([intent-extraction](intent-extraction-skill.spec.md),
> [context-assembly](context-assembly-skill.spec.md),
> [provenance-tagging](provenance-tagging-skill.spec.md)),
> [checkpoint P0–P3](../../specs-p0-p3-checkpoint.md) e as specs P3 aprovadas — em especial
> [`verification-report`](../../p3/verification-report.spec.md),
> [`tool-result-verification`](../../p3/tool-result-verification.spec.md),
> [`failure-attribution`](../../p3/failure-attribution.spec.md),
> [`episode-trace`](../../p3/episode-trace.spec.md), [`audit-log`](../../p3/audit-log.spec.md),
> [`entropy-audit`](../../p3/entropy-audit.spec.md),
> [`intervention-log`](../../p3/intervention-log.spec.md) e
> [`context-provenance`](../../p2/context-provenance.spec.md). **Não inventa doutrina; extrai o
> contrato já consolidado.**

> **Nota de reconstrução (transparência).** O briefing desta peça chegou com o **OBJETIVO DA SPEC
> completo**, mas a lista de condições obrigatórias chegou **truncada**: legíveis apenas as
> **condições 14, 15, 16, 17 e 18** (incorporadas literalmente). As **condições 1–13** (só sobreviveu
> o rabo "…sucesso") e as **condições 19 em diante** **não chegaram**, e **não veio a seção de
> estrutura obrigatória**. Reconstruí (a) a **estrutura de 28 seções** pelo template já consolidado
> nas skills P4 anteriores e (b) as **condições 1–13 e 19+** a partir do OBJETIVO explícito do
> briefing e do cânone P3 (`verification-report`, `tool-result-verification` e specs de
> observabilidade). Reconstruções sinalizadas; **aberto a ajuste aditivo direcionado** para fixar a
> numeração e o texto literal das condições que não chegaram.

---

## 1. Identificação

| Campo | Valor |
| --- | --- |
| Nome | `evidence-compilation` |
| Tipo | Skill (capacidade modular reutilizável) — **documental nesta fase** |
| Grupo | S-D Verificação/Evidência (Skill Map §6) |
| Camada | observability |
| Specs governantes (aprovadas) | `verification-report`, `tool-result-verification` (P3, principais); `failure-attribution`, `episode-trace`, `audit-log`, `entropy-audit`, `intervention-log` (P3); `context-provenance` (P2); invariantes P0 |
| Tenant-scope | Global/instância (definição global, instância por tenant) |
| Proveniência | `[HARNESS-RT]` `[CE]` |
| Status | Spec documental de preparação P4 — **não executável** |

---

## 2. Status, camada, onda e owner arquitetural

- **Status:** documental · skill-preparation · não executável · proposta para aprovação.
- **Camada:** observability.
- **Onda:** P4 (preparação de skills), quarta peça individual; sucede `provenance-tagging`.
- **Owner arquitetural:** Observabilidade / Specification Engineering.

---

## 3. Propósito

Definir o contrato da capacidade que **reúne, organiza e apresenta as evidências relevantes** para
verificar, explicar, auditar ou sustentar uma operação, decisão, proposta, falha, contexto,
escalation, intervention ou resultado observado. A skill **organiza** evidências disponíveis,
evidências ausentes, limites, fontes e vínculos de proveniência — de modo **rastreável, auditável e
revisável**. Ela permite que episódios, contexto, retrieval, service decisions, tool permissions,
executions, result verification, failures, entropy e interventions sejam **sustentados por
evidência**, sem concluir por asserção.

---

## 4. Escopo

- Reunir e organizar **evidência disponível e evidência ausente** em um objeto evidenciário
  rastreável.
- Preservar **proveniência** e **vínculo entre evidência e origem** (condição 16).
- **Distinguir** os tipos de evidência (condição 17, §10) e **indicar** os campos aplicáveis
  (condição 18, §11).
- Respeitar **tenant scope** (condição 14) e **preservar tenant boundary** (condição 15).
- Sinalizar quando isolar, descartar, pendenciar evidência ou escalar (§24).

---

## 5. Fora de escopo

Esta spec **não** contém: skill executável · prompt final/de skill · configuração · código · API ·
schema · frontend · backlog · sprint plan · roadmap técnico · plano de implementação · YAML/JSON ·
DSL · pseudo-código · contrato machine-readable · inferência de stack. A skill **não é** execução,
decisão operacional, policy enforcement, verification report, failure attribution nem tool result
verification; **não cria** evidência, **não inventa** fonte e **não transforma ausência de evidência
em certeza** (OBJETIVO; §6, §12).

---

## 6. Definição da skill

**É:** capacidade **modular, reutilizável e subordinada a specification** que recebe requisitos +
resultado/episódio e **compõe o objeto evidenciário** (entrada → saída: requisitos + resultado →
relatório/objeto de evidência), mapeando o que sustenta cada ponto e o que falta.

**NÃO é** (OBJETIVO): execução · decisão operacional · policy enforcement · verification report ·
failure attribution · tool result verification · prompt gigante · persona · mini-agente autônomo.
**NÃO** cria evidência, **não** inventa fonte, **não** transforma ausência de evidência em certeza.

> Invariante: `evidence-compilation` **não conclui por asserção** — **conclusão = evidência**; ela
> organiza, não decide nem verifica. (`DO9` `P9`)

---

## 7. Evidence compilation como organização de evidência, não decisão nem verificação

A skill **organiza evidências disponíveis e ausentes, limites, fontes e vínculos de proveniência** —
mas **não decide operação, não autoriza ação, não executa tool, não altera estado**. Ela **não
substitui**:

- **verification report** — não emite o veredito de conformidade (isso é `verification-report`);
- **failure attribution** — não atribui causa de falha (isso é `failure-attribution`);
- **tool result verification** — não verifica o resultado de uma execução (isso é
  `tool-result-verification`);
- **policy enforcement** — não aplica regra.

Ela **prepara o material evidenciário** que essas camadas consomem; a conclusão pertence a elas.

---

## 8. Entradas conceituais da skill

- Os **requisitos** da operação/decisão/proposta e o **comportamento esperado**.
- O **episódio** relacionado: `episode-trace` e `audit-log` (com proveniência e tenant).
- A **evidência determinística disponível** para cada ponto, e o registro do que **falta**.
- Os **fragmentos com proveniência** anexada por `provenance-tagging`.

---

## 9. Saídas conceituais da skill

- Um **objeto evidenciário** que organiza evidência disponível ↔ ausente, fontes, limites,
  proveniência e vínculos — tenant-scoped, auditável e revisável.
- A **marcação** de evidência frágil/contraditória/contaminada/insuficiente para tratamento (§24).
- **Nenhuma conclusão, veredito, atribuição de causa ou validação** — esses pertencem a outras
  camadas.

---

## 10. O que a evidência deve distinguir (condição 17)

A skill **deve distinguir**:

- evidência **disponível**;
- evidência **ausente**;
- evidência **frágil**;
- evidência **contraditória**;
- evidência **contaminada**;
- evidência **insuficiente**;
- evidência de **Authority**;
- evidência de **Metadata**.

A distinção é **explícita**: ausência de evidência **nunca** é apresentada como certeza (OBJETIVO).

---

## 11. O que o objeto evidenciário deve indicar (condição 18)

A skill **deve indicar, quando aplicável**:

- episódio relacionado;
- tenant;
- operação ou proposta relacionada;
- fontes usadas;
- fontes excluídas (quando relevante);
- provenance;
- authority layer;
- evidência disponível;
- evidência ausente;
- limitações;
- confiança conhecida;
- impacto operacional;
- necessidade de verificação/confirmação/escalada subsequente.

> *Reconstrução pontual:* o último item do briefing chegou cortado ("necessidade de … técnica"); foi
> reconstruído como **necessidade de verificação/confirmação/escalada subsequente**, coerente com o
> cânone (`verification-report` §18, `tool-result-verification` §25). Sinalizado para ajuste.

---

## 12. Limites da skill

A skill `evidence-compilation`:

- **não** executa · **não** decide operação · **não** autoriza ação · **não** altera estado;
- **não** é/substitui verification report, failure attribution, tool result verification nem policy
  enforcement;
- **não** cria evidência, **não** inventa fonte, **não** fabrica proveniência;
- **não** transforma ausência de evidência em certeza;
- **não** conclui por asserção (conclusão = evidência);
- **não** cruza evidência/proveniência entre tenants;
- **não** vira prompt gigante, persona ou mini-agente autônomo.

---

## 13. Relação com P0

- **layer-authority-model:** distingue **evidência de Authority** de **evidência de Metadata**
  (condição 17); a evidência de Authority tem peso maior; prompt/conversa não vira certeza.
- **conflict-resolution:** evidência contraditória é registrada e tratada (§24), por ordem de
  valores, não por preferência do modelo.
- **tenant-boundary:** **preserva tenant boundary** (condição 15); nenhuma evidência cruza tenant.

---

## 14. Relação com P1

- **operational-state:** **lê — não altera** — o estado como evidência; respeita o estado como
  verdade operacional.
- **memory-model:** usa apenas evidência **proveniente**; memória sem proveniência não vira
  evidência governante.
- **tenant-state-isolation:** a evidência considerada é a do tenant ativo, isolada.

---

## 15. Relação com P2

- **context-provenance:** **preserva provenance** (condição 16) e o vínculo evidência↔origem; sem
  proveniência, não há evidência confiável.
- **policy-enforcement / behavioral-governance / operational-boundaries:** usa os contratos como
  **referência de requisito/comportamento esperado**; **não substitui** enforcement.
- **escalation-policy:** evidência insuficiente/conflitante pode gerar escalada (§24).

---

## 16. Relação com P3

- **episode-trace / audit-log:** a evidência é **reconstruível** a partir do trace e do log; o
  objeto evidenciário **alimenta** ambos.
- **verification-report:** fornece o material organizado que o report consolida (§18).
- **tool-result-verification:** organiza a evidência que a verificação de resultado consome (§19).
- **failure-attribution / entropy-audit / intervention-log:** falha da skill é **atribuível**,
  entropia é **auditável**, intervenção é **registrada** (§20).

---

## 17. Relação com intent-extraction / context-assembly / provenance-tagging

- **intent-extraction:** a intenção (Metadata) pode ser objeto de evidência, sem virar certeza.
- **context-assembly:** o pacote de contexto e seus motivos de inclusão/exclusão são insumos
  evidenciários.
- **provenance-tagging:** fornece a **proveniência por fragmento** que a compilação de evidência
  preserva e organiza — relação direta de insumo (proveniência → evidência).

---

## 18. Relação com verification-report

`evidence-compilation` **apoia** [`verification-report`](../../p3/verification-report.spec.md): o
report mapeia requisitos ↔ evidência e **classifica** o resultado; a skill **organiza** a evidência
que sustenta esse mapeamento. A skill **não** emite a classificação (verificado/não verificado/
pendente/falha verificada) — isso é do report.

---

## 19. Relação com tool-result-verification

`evidence-compilation` **apoia** [`tool-result-verification`](../../p3/tool-result-verification.spec.md):
organiza efeito esperado × execução × efeito observado × evidência disponível/ausente que a
verificação de resultado confronta. A skill **não** verifica o resultado nem o declara verificado —
isso é da tool-result-verification, por evidência determinística.

---

## 20. Relação com failure-attribution / entropy-audit / intervention-log

- **failure-attribution:** a skill organiza a evidência da falha; **não** atribui a causa (a
  atribuição precede a correção, sem culpa genérica). Falha da própria skill é **atribuível**.
- **entropy-audit:** entropia causada por evidência frágil/ausente é **auditável**.
- **intervention-log:** intervenção relacionada à compilação de evidência é **registrada** como
  sinal diagnóstico.

---

## 21. Relação com observability

A skill é **observability-first**: o objeto evidenciário é, ele próprio, artefato observável e
**read-only para o executor**; preserva auditabilidade e reconstrução posterior; nunca apaga, altera
ou fabrica evidência. *Nenhuma conclusão sem evidência rastreável.*

---

## 22. Critérios de aceite

A skill é aceita (quando, no futuro, promovida) somente se:

1. permanece **documental, modular, reutilizável e subordinada a specification**;
2. **organiza** evidência disponível/ausente, fontes, limites, proveniência e vínculos — **sem
   concluir por asserção** (conclusão = evidência);
3. **não** executa, decide, autoriza ou altera estado; **não é/substitui** verification report,
   failure attribution, tool result verification nem policy enforcement;
4. **não cria** evidência, **não inventa** fonte, **não transforma** ausência de evidência em certeza;
5. **respeita tenant scope** (14) e **preserva tenant boundary** (15);
6. **preserva provenance** e o vínculo evidência↔origem (16);
7. **distingue** os oito tipos de evidência (17, §10) e **indica** os campos aplicáveis (18, §11);
8. **alimenta** verification-report, tool-result-verification, episode trace e audit log; é
   atribuível por failure-attribution, auditável por entropy-audit e registrável por intervention-log;
9. preserva **auditabilidade e reconstrução posterior**, read-only para o executor;
10. é reconstruível e revisável por humano (prosa estruturada, sem sintaxe de máquina).

---

## 23. Critérios de rejeição

A skill é rejeitada se:

1. **conclui por asserção** ou **transforma ausência de evidência em certeza**;
2. **cria** evidência, **inventa** fonte ou **fabrica** proveniência;
3. atua como/**substitui** verification report, failure attribution, tool result verification ou
   policy enforcement;
4. **executa, decide, autoriza ou altera estado**;
5. **não distingue** evidência disponível/ausente/frágil/contraditória/contaminada/insuficiente/
   Authority/Metadata (17);
6. **não preserva** proveniência ou o vínculo evidência↔origem (16);
7. **cruza** evidência/proveniência entre tenants ou viola tenant boundary (15);
8. trata evidência **frágil/contraditória/contaminada/insuficiente** sem isolar/descartar/pendenciar/
   escalar (§24);
9. **vira prompt gigante, persona ou mini-agente autônomo**;
10. introduz sintaxe de máquina ou peça executável; ou reposiciona o YZI OS.

---

## 24. Quando isolar, descartar, pendenciar evidência ou escalar

Extraído de [`verification-report`](../../p3/verification-report.spec.md) §9/§18,
[`tool-result-verification`](../../p3/tool-result-verification.spec.md) §25 e
[`context-provenance`](../../p2/context-provenance.spec.md) §8:

| Situação da evidência | Resposta registrada |
| --- | --- |
| Ausente | registrar **evidência ausente**; **pendência de evidência**; nunca apresentar como certeza |
| Frágil / confiança insuficiente | **pendência de evidência** |
| Contraditória | **registrar** conflito; isolar fontes; **escalar** se irreconciliável |
| Contaminada | **descartar**/isolar; **escalar** se persistente |
| Insuficiente | resultado **não sustentado**; pendência ou escalada |
| Cross-tenant / autoridade indevida | **bloquear**; gerar evidência auditável |

Nunca há **admissão silenciosa** nem conclusão por asserção: lacunas, fragilidades e conflitos são
registrados e tratados por isolamento, descarte, pendência de evidência ou escalada.

---

## 25. Riscos arquiteturais evitados

| Risco | Mitigação nesta spec |
| --- | --- |
| Conclusão por asserção / ausência virando certeza | §6, §10, §22.2; conclusão = evidência |
| Evidência inventada / fonte inventada / proveniência forjada | §12, §23.2 |
| Skill assumir verification/attribution/verification de resultado/enforcement | §7, §12 |
| Vazamento cross-tenant de evidência | §13, §15; tenant boundary preservado |
| Evidência opaca (sem proveniência) | §15, §16; preserva provenance e vínculo |
| Falha não atribuível / entropia não auditável | §16, §20 |
| Skill virar prompt gigante/persona/mini-agente | §6, §12, §23.9 |

---

## 26. Dependências

- **Aprovadas:** `verification-report`, `tool-result-verification`, `failure-attribution`,
  `episode-trace`, `audit-log`, `entropy-audit`, `intervention-log` (P3); `context-provenance`,
  `policy-enforcement`, `behavioral-governance`, `operational-boundaries`, `escalation-policy` (P2);
  invariantes P0; `operational-state`, `memory-model`, `tenant-state-isolation` (P1); pares
  `intent-extraction-skill`, `context-assembly-skill`, `provenance-tagging-skill` (P4).
- **Futuras (pendentes):** `observability-harness` / `audit-harness` / `execution-harness` (P5,
  mapeados) administram a skill quando promovida; `verification-subagent` a compõe. Enquanto não
  aprovados, a promoção **executável** permanece bloqueada (contract-first); esta spec é
  **documental**.

---

## 27. Próxima peça recomendada

Concluído o conjunto mínimo de skills do [Skill Map §8](../../../skills/skill-map.md)
(intent-extraction → context-assembly → provenance-tagging → evidence-compilation), a próxima peça
recomendada — **a confirmar separadamente** — seria uma das skills restantes do mapa
(`context-curation`, `retrieval-query`, `synthesis`, `failure-diagnosis` ou `escalation-trigger`),
ou o início do bloco de **subagentes mínimos** (interface, retrieval, verification). Uma peça por
vez, com checkpoint. **Não avancei para nenhuma.**

---

## 28. Checkpoint

1. **Arquivo criado:** apenas `/docs/specs/p4/skills/evidence-compilation-skill.spec.md`. Nenhum
   outro arquivo criado ou alterado.
2. **Natureza respeitada:** spec documental de skill · governance-first · skill-preparation ·
   linguagem natural estruturada. **Sem** YAML/JSON/schema/DSL/pseudo-código/contrato
   machine-readable/código/API/configuração/plano de implementação; sem inferência de stack.
3. **Estrutura:** 28 seções entregues; **reconstruídas** pelo template das skills P4 anteriores
   (briefing não trouxe a seção de estrutura). **Sinalizado.**
4. **Condições obrigatórias:** **14–18 incorporadas literalmente** (§10, §11, §13, §14, §15, §16);
   **1–13 e 19+ não chegaram** e foram **reconstruídas** do OBJETIVO explícito + cânone P3
   (`verification-report`, `tool-result-verification`), incorporadas aos §6–§24 e aos critérios de
   aceite/rejeição. **Não certifico um conjunto numerado completo sem o texto literal das condições
   ausentes; aberto a ajuste aditivo direcionado.**
5. **Derivação fiel:** contrato extraído do cânone aprovado (verification-report e
   tool-result-verification lidos na íntegra); **sem inventar doutrina, sem duplicar**. Specs P0–P3,
   mapas e checkpoints **não** modificados. Dependência futura (harnesses/subagente) sinalizada.
6. **Confirmação de fronteira:** **nenhuma** skill executável, subagente, harness, código, API,
   schema, frontend, backlog, YAML/JSON ou contrato machine-readable foi criado.

**Parado aqui. Não avancei para a próxima peça.**

---

## Adendo — Reforço aditivo de critérios obrigatórios

> **Reforço aditivo (não reescrita).** Bloco acrescentado por autorização explícita para tornar os
> **30 critérios obrigatórios** explícitos. **Nenhuma** outra parte da spec foi reescrita; nenhum
> outro arquivo foi criado.
>
> **Nota de numeração (transparência):** a lista recebida trouxe 1–13, depois um item rotulado
> "**14. deve apoiar…**" e em seguida 20–30 (pulando 15–19). Como o cabeçalho indicava "1–13 e
> 19–30" e que "14–18 já foram incorporados", e a contagem fecha em 30, o item impresso como "14"
> corresponde ao **critério 19** (a lista "deve apoiar"). Tratado como **critério 19**. Sinalizado.

### A — Critérios 14–18 (incorporados em volta anterior)

- **14 — respeitar tenant scope** → §4, §13, §14, §22.5.
- **15 — preservar tenant boundary** → §13, §22.5, §23.7.
- **16 — preservar provenance** → §15, §16, §22.6.
- **17 — distinguir os oito tipos de evidência** → §10, §22.7.
- **18 — indicar os campos aplicáveis** → §11, §22.7.

### B — Critérios 1–13 (recebidos íntegros e aplicados)

- **1 — skill documental, não executável nesta fase** → §1, §2, §6. **Aplicado.**
- **2 — reúne e organiza evidência, mas NÃO decide operação** → §3, §6, §7. **Aplicado.**
- **3 — NÃO autoriza ação** → §7, §12. **Aplicado.**
- **4 — NÃO executa tool** → §5, §12. **Aplicado.**
- **5 — NÃO altera estado** → §12, §14. **Aplicado.**
- **6 — NÃO substitui verification report** → §7, §18, §23.3. **Aplicado.**
- **7 — NÃO substitui failure attribution** → §7, §20, §23.3. **Aplicado.**
- **8 — NÃO substitui tool result verification** → §7, §19, §23.3. **Aplicado.**
- **9 — NÃO substitui policy enforcement** → §7, §15, §23.3. **Aplicado.**
- **10 — NÃO cria evidência** → §5, §6, §12, §23.2. **Aplicado.**
- **11 — NÃO inventa fonte** → §12, §23.2. **Aplicado.**
- **12 — NÃO fabrica certeza** → §6, §10, §23.1. **Aplicado.**
- **13 — NÃO transforma ausência de evidência em sucesso** → §10, §23.1, §24. **Aplicado.**

### C — Critérios 19–30 (recebidos íntegros e aplicados)

- **19 — DEVE apoiar `context-assembly`, `provenance-tagging`, `retrieval-governance`, episode
  trace, audit log, verification report, failure attribution, entropy audit, intervention log e
  tool result verification futura** (item rotulado "14" na transmissão) → §16, §17, §18, §19, §20,
  §22.8. **Aplicado.**
- **20 — Evidência sem proveniência suficiente NÃO pode sustentar decisão** → §15, §16, §22.6, §24.
  **Aplicado.**
- **21 — Evidência contraditória DEVE gerar pendência, failure attribution ou escalation** → §24.
  **Aplicado.**
- **22 — Evidência contaminada DEVE gerar isolamento, descarte, pendência ou escalation** → §24.
  **Aplicado.**
- **23 — Evidência ausente DEVE ser registrada como ausência, não inferida como confirmação** → §9,
  §10, §23.1, §24. **Aplicado.**
- **24 — DEVE impedir que LLM, agente ou prompt declarem evidência sem fonte** → §12, §23.2.
  **Aplicado.**
- **25 — DEVE preservar auditabilidade e reconstrução posterior** → §21, §22.9. **Aplicado.**
- **26 — Falha DEVE ser atribuível por failure attribution** → §16, §20. **Aplicado.**
- **27 — Entropia DEVE ser auditável por entropy audit** → §16, §20. **Aplicado.**
- **28 — Intervenção DEVE ser registrada por intervention log** → §16, §20. **Aplicado.**
- **29 — DEVE permanecer modular, reutilizável e subordinada a specification** → §4, §6, §22.1.
  **Aplicado.**
- **30 — NÃO deve virar prompt gigante, persona ou mini-agente autônomo** → §6, §12, §23.9.
  **Aplicado.**

### D — Certificação final

> **30/30 critérios obrigatórios explícitos.** Critérios **14–18** incorporados em volta anterior
> (Adendo A); critérios **1–13** e **19–30** recebidos íntegros e aplicados nesta volta (Adendos B e
> C). Todos os 30 estão agora explícitos nesta spec, ancorados nas seções indicadas. O item rotulado
> "14" na transmissão corresponde ao **critério 19** (lista "deve apoiar").

**Parado aqui. Não avancei para a próxima peça.**

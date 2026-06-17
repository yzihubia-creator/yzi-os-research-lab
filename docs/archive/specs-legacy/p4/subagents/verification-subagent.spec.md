# verification-subagent — Subagente Spec (documental)

> **Spec documental de subagente (P4), architecture-only · governance-first · subagent-preparation ·
> linguagem natural estruturada.** Define o **contrato do papel** `verification-subagent` — o
> **auditor documental independente**: o que ele é, o que verifica, seus limites, critérios de
> aceite/rejeição, observabilidade e proveniência. **Não** é subagente executável, prompt final,
> persona final nem machine-readable. **Não** usa YAML, JSON, schema, DSL, pseudo-código, contrato
> técnico executável, código, API, configuração ou plano de implementação. **Descreve o papel; não o
> implementa.** A arquitetura continua sendo o produto.
>
> Derivada fielmente de: [Subagent Map](../../../subagents/subagent-map.md) (card
> `verification-subagent`), [interface-subagent](interface-subagent.spec.md),
> [retrieval-subagent](retrieval-subagent.spec.md), as 4 skills mínimas P4 e as specs P0–P3
> aprovadas — em especial [`verification-report`](../../p3/verification-report.spec.md),
> [`tool-result-verification`](../../p3/tool-result-verification.spec.md),
> [`failure-attribution`](../../p3/failure-attribution.spec.md),
> [`escalation-policy`](../../p2/escalation-policy.spec.md),
> [`entropy-audit`](../../p3/entropy-audit.spec.md),
> [`intervention-log`](../../p3/intervention-log.spec.md),
> [`episode-trace`](../../p3/episode-trace.spec.md) e [`audit-log`](../../p3/audit-log.spec.md).
> **Não inventa doutrina; extrai o contrato já consolidado.**

> **Nota de alinhamento e reconstrução (transparência).** A spec foi **alinhada estruturalmente** à
> estrutura obrigatória de **27 seções** fornecida: §7 e §23 renomeados, §8 reordenado, **§19 passou a
> "Relação com observability"** e **§20 passou a "Relação com escalation"** (o conteúdo de
> verification-report/tool-result-verification foi **consolidado em §8 e §15/P3**). **Nenhuma doutrina
> reescrita ou adicionada.** Quanto aos critérios: **os 34 estão explícitos**
> (1–19, 26 e 27–33 em voltas anteriores; **20–25 e 34** nesta volta final). Mapa completo no Adendo.

---

## 1. Identificação

| Campo | Valor |
| --- | --- |
| Nome | `verification-subagent` (Auditor independente) |
| Tipo | Subagente (papel operacional especializado) — **documental nesta fase** |
| Grupo | Sub-D Verificação (Subagent Map §6) |
| Camada | observability / audit |
| Specs governantes (aprovadas) | `verification-report`, `failure-attribution`, `tool-result-verification` (P3, principais); `episode-trace`, `audit-log`, `entropy-audit`, `intervention-log` (P3); `escalation-policy`, `context-provenance` (P2); invariantes P0 |
| Skills que compõe | `evidence-compilation`; `failure-diagnosis`* (*spec futura) |
| Tenant-scope | Global/instância |
| Proveniência | `[HARNESS-RT]` `[CE]` `[AHE]` |
| Status | Spec documental de preparação P4 — **não executável** |

---

## 2. Status, camada, onda e owner arquitetural

- **Status:** documental · subagent-preparation · não executável · proposta para aprovação.
- **Camada:** observability / audit.
- **Onda:** P4 (preparação de subagentes), terceira peça; **completa o conjunto mínimo** (interface →
  retrieval → verification).
- **Owner arquitetural:** Observabilidade / Governança / Specification Engineering.

---

## 3. Propósito

Definir o contrato do **auditor independente**: o papel que **verifica conclusões, conformidade,
evidência e fronteiras de forma independente de quem executou, recuperou ou mediou**. Emite **veredito
de verificação por evidência determinística** — nunca por asserção — e é **read-only** para o que
fiscaliza. Define-se o papel **sem promovê-lo a executor, decisor, tool, runtime, policy engine ou
juiz final**.

---

## 4. Escopo

- Verificar, de forma **independente**, se uma operação/resultado satisfez seus requisitos
  (requisitos ↔ evidência, via `verification-report`/`tool-result-verification`).
- **Revisar** os elementos do §19 (evidência disponível/ausente, provenance, tenant scope/boundary,
  policies/specs aplicadas, operational boundaries, authority layer, episode trace, audit log,
  verification report, failure attribution, intervention log).
- Emitir **veredito** (verificado / não verificado / pendente / falha verificada / inconsistente /
  escalado); constatar falha e **encaminhar** à `failure-attribution` — sem corrigir.
- Operar **read-only** (controlabilidade); registrar ambiguidades/lacunas/conflitos;
  pendenciar/atribuir falha/escalar quando faltar evidência (§23).

---

## 5. Fora de escopo

Esta spec **não** contém: subagente executável · prompt/persona final · configuração · código · API
· schema · frontend · backlog · sprint plan · roadmap técnico · plano de implementação · YAML/JSON ·
DSL · pseudo-código · contrato machine-readable · inferência de stack. O papel **não** decide
operação, **não** executa (11), **não** autoriza (10), **não** corrige (13) nem altera estado (12), e
**não** é policy enforcement (6), failure attribution (7), tool result verification (8) **por si só**.

---

## 6. Definição do subagente

**É:** **papel operacional especializado** — o **auditor independente** — com autoridade de **emitir
veredito de verificação**, **read-only** sobre verificador/tracer/config, escopo = evidência de
episódios. **Revisa conformidade, evidência e fronteiras, mas não decide operação** (condição 2).
Compõe `evidence-compilation` (e a futura `failure-diagnosis`).

**NÃO é** (condições 3–9, 33): executor · tool · service decision · LLM com autoridade · policy
enforcement por si só · failure attribution por si só · tool result verification por si só · corretor
· runtime · policy engine · juiz final · mini-agente autônomo.

> Invariante de independência: **quem executou/recuperou/mediou NÃO verifica a si mesmo** (`[CE]`); o
> auditor é **read-only** para o executor (controlabilidade, `[AHE]`). O veredito é por **evidência**,
> não por opinião do LLM (`DO9`).

---

## 7. Verification-subagent como auditor documental independente, não decisão final

A verificação é **comprovação independente**, não decisão final nem execução:

- **não decide** a operação (2) — a decisão é dos services; o veredito **não** é decisão final;
- **não executa** (11) nem é tool (4); **não** é service decision (5); **não** é LLM com autoridade (9);
- **não** é policy enforcement (6), failure attribution (7) nem tool result verification (8) **por si
  só** — os **aplica/aciona**, não os substitui;
- **não corrige** automaticamente (13) nem **altera estado** (12);
- **não substitui decisão humana/institucional** quando a escalada for necessária (14).

A correção e a decisão final pertencem às camadas com autoridade — o auditor **comprova e classifica**.

---

## 8. Diferença entre subagente, skill, verification report, failure attribution, tool result verification, LLM, runtime, service e tool

| Conceito | É… | Papel na verificação |
| --- | --- | --- |
| **verification report** | objeto evidenciário (requisitos ↔ evidência) | artefato que a verificação produz/consolida |
| **failure attribution** | explicação auditável da falha | recebe a falha constatada; atribui causa antes da correção |
| **tool result verification** | etapa de verificar resultado de execução | contrato aplicado ao resultado de uma tool |
| **Subagente** (`verification-subagent`) | papel auditor independente, read-only | **emite o veredito** por evidência; ≠ executor |
| **Skill** | capacidade (`evidence-compilation`, `failure-diagnosis`) | **compõe** o trabalho do auditor |
| **LLM** | motor probabilístico | sem autoridade; não autodeclara conformidade |
| **Runtime** | coordenação leve | aciona a verificação; não julga a verdade |
| **Service** | decisão institucional | decide; o auditor não decide a operação |
| **Tool** | execução de efeito | objeto de verificação; não é o auditor |

O `verification-subagent` **aplica como papel** os contratos de `verification-report`,
`tool-result-verification` e `failure-attribution`; **não os substitui** (6–8) e **não é** tool,
service, runtime nem o LLM.

---

## 9. Entradas conceituais do subagente

- Os **requisitos** da operação e o **comportamento esperado** (segundo spec/contrato).
- O **`episode-trace`** e o **`audit-log`** do episódio (evidência reconstruível, com proveniência e
  tenant).
- A **evidência** determinística disponível e a **evidência ausente** (organizadas por
  `evidence-compilation`), com proveniência.
- O resultado a verificar (operação, proposta, resultado de tool execution).

---

## 10. Saídas conceituais do subagente

- Um **veredito de verificação** classificado (verificado / não verificado / pendente de evidência /
  falha verificada / inconsistente / escalado), com proveniência, tenant e authority layer.
- Um **parecer documental de verificação** — **não decisão final** (critério 20) — que **deve indicar**
  (critério 21): objeto revisado · tenant · critérios revisados · evidência disponível · evidência
  ausente · conformidades observadas · não conformidades observadas · pendências · riscos ·
  necessidade de escalation · necessidade de human review · limitações conhecidas.
- O **encaminhamento** de falha constatada à `failure-attribution` (sem corrigir) e de casos fora de
  fronteira à escalada (§20).
- **Nenhuma** decisão de operação, execução, correção ou alteração de estado.

---

## 11. Limites do subagente

O `verification-subagent`:

- **não** decide operação (2) · **não** autoriza ação (10) · **não** executa tool (11) · **não**
  altera estado (12) · **não** corrige automaticamente (13);
- **não** é policy enforcement (6), failure attribution (7), tool result verification (8) por si só,
  nem LLM com autoridade (9); **não** os substitui;
- **não** substitui decisão humana/institucional quando a escalada for necessária (14);
- **não** verifica a si mesmo nem a operação que ele próprio tenha executado/recuperado/mediado
  (independência);
- **não** é desativável pelo que fiscaliza (read-only sobre verificador/tracer/config);
- **não** valida sem evidência mínima, **não** inventa evidência, **não** depende da memória do LLM;
- **não** transforma ausência de evidência em aprovação (27), parecer em permissão (28) nem
  verification em execução (29);
- **não** permite bypass de tenant boundary, policy enforcement, operational boundaries ou authority
  layer (30); **não** cruza tenant;
- **não** vira auditor autônomo absoluto, runtime, executor, policy engine, juiz final ou mini-agente
  autônomo (33).

---

## 12. Relação com P0

- **layer-authority-model:** o veredito não decide a operação; o critério de verdade pertence à
  governança; o auditor **respeita authority layer** (18) e não amplia autoridade.
- **conflict-resolution:** conflito/fragilidade de evidência é registrado e tratado (§23), por ordem
  de valores.
- **tenant-boundary:** **respeita tenant scope** (15) e **preserva tenant boundary** (16); resultado
  que viola a fronteira é bloqueado, registrado e escalado (30).

---

## 13. Relação com P1

- **operational-state:** **respeita o estado como verdade operacional** (17); **lê — não altera** o
  estado; não corrige estado.
- **event-driven-state:** lê o estado/evento produzido ou bloqueado como evidência.
- **tenant-state-isolation:** verifica dentro do tenant; não atravessa fronteira.

---

## 14. Relação com P2

- **policy-enforcement / operational-boundaries / authority layer:** **deve respeitá-los** (18); usa
  os contratos de governança como referência de requisito/comportamento esperado; **não** substitui
  enforcement (6).
- **behavioral-governance:** o comportamento esperado a verificar vem das specs/policies, não de
  persona.
- **escalation-policy:** falha não atribuível / conflito de evidência / necessidade de autoridade
  humana → **escala** (§20).
- **context-provenance:** exige proveniência da evidência; evidência sem proveniência não sustenta
  veredito de "verificado".

---

## 15. Relação com P3

- **verification-report:** **aplica/produz** o objeto evidenciário requisitos↔evidência; **não** o
  substitui (spec governante).
- **tool-result-verification:** **aplica** o contrato de verificação ao resultado de uma tool
  execution; **não** o substitui (8) (spec governante).
- **failure-attribution:** **constata** a falha e a **encaminha** à atribuição (causa antes da
  correção, sem culpa genérica); **não** a substitui (7).
- **episode-trace / audit-log:** a evidência é reconstruível a partir deles; o veredito **alimenta** o
  audit log de forma não destrutiva.
- **entropy-audit:** entropia causada pela verificação **deve ser auditável** (26).
- **intervention-log:** intervenção relacionada à verificação **deve ser registrada** (27 — conforme
  a sub-lista do critério 19).

---

## 16. Relação com as skills mínimas

- **`evidence-compilation`:** **compõe-na** — organiza a evidência disponível/ausente que o veredito
  usa; o auditor **classifica**, a skill **organiza**.
- **`provenance-tagging`:** apoia-se na proveniência por fragmento da evidência.
- **`context-assembly` / `intent-extraction`:** o contexto e a intenção são objeto de verificação,
  não autoridade.
- **`failure-diagnosis`** (skill futura): o auditor a comporia para reproduzir/atribuir falha quando
  especificada.

---

## 17. Relação com interface-subagent

O [`interface-subagent`](interface-subagent.spec.md) **encaminha** ao `verification-subagent` quando
conformidade/evidência precisa ser verificada (interface §18). O auditor é **independente**: quem
mediou não verifica a si mesmo.

---

## 18. Relação com retrieval-subagent

O [`retrieval-subagent`](retrieval-subagent.spec.md) **encaminha** evidência recuperada para
verificação (retrieval §18). O auditor é **independente**: quem recuperou não verifica a si mesmo; o
auditor confere proveniência e escopo do que foi recuperado.

---

## 19. Relação com observability

A verificação é **observability-first** e **read-only para o executor** (controlabilidade). O auditor
**revisa** (critério 19): evidência disponível · evidência ausente · provenance · tenant scope ·
tenant boundary · policies aplicadas · specifications aplicadas · operational boundaries · authority
layer · episode trace · audit log · verification report · failure attribution (quando aplicável) ·
intervention log. Registra requisitos, verificações, evidência usada/ausente, limitações, veredito,
tenant e authority layer; alimenta `episode-trace`/`audit-log`; é auditável por `entropy-audit` (26) e
registrável por `intervention-log` (27). *Nenhum veredito confiável sem evidência rastreável; o
auditor não é desativável pelo que fiscaliza.*

---

## 20. Relação com escalation

A escalada é **governança, não falha** (`escalation-policy`). O `verification-subagent` **escala**
quando: a falha **não é atribuível**; há conflito/fragilidade de evidência não resolvível; ou a
verificação exige **autoridade humana/institucional**. O auditor **não substitui a decisão
humana/institucional** quando a escalada for necessária (14); preserva a responsabilidade do operador
e **encaminha** ao `escalation-subagent` futuro. Verificação ambígua/insuficiente/contraditória/
contaminada/sem evidência **gera pendência, failure attribution ou escalada** (31), nunca aprovação.

---

## 21. Critérios de aceite

O subagente é aceito (quando, no futuro, promovido) somente se:

1. permanece **documental, modular, independente, revisável e subordinado a specification** (1, 32);
2. **revisa conformidade, evidência e fronteiras** (incl. os itens do §19), sem decidir operação (2);
3. **não** é executor (11), tool (4), service decision (5), LLM com autoridade (9), policy
   enforcement/failure attribution/tool result verification por si só (6–8); **não** corrige (13) nem
   altera estado (12);
4. **emite veredito por evidência determinística**, nunca por asserção; não valida sem evidência
   mínima; não inventa evidência; não depende da memória do LLM;
5. preserva a **independência do auditor** (quem agiu não se verifica) e a **controlabilidade
   read-only** (não-desativável pelo que fiscaliza);
6. **respeita** tenant scope (15), **preserva** tenant boundary (16), **respeita** estado como verdade
   (17) e policy enforcement/operational boundaries/authority layer (18);
7. **não** transforma ausência de evidência em aprovação (27), parecer em permissão (28), verification
   em execução (29); **não** permite bypass (30);
8. **constata** falha e a **encaminha** à `failure-attribution`; **escala** quando necessário, sem
   substituir decisão humana/institucional (14); trata ambíguo/insuficiente/contraditório/contaminado/
   sem evidência por pendência/failure attribution/escalada (31);
9. **compõe** `evidence-compilation`; **alimenta** episode trace/audit log; é auditável por entropy
   audit (26) e registrável por intervention log; preserva provenance e evidência;
10. é reconstruível e revisável por humano (prosa estruturada, sem sintaxe de máquina).

---

## 22. Critérios de rejeição

O subagente é rejeitado se:

1. **decide operação, executa, autoriza, corrige ou altera estado**; ou age como **tool, service,
   runtime, policy engine, juiz final, decisor ou LLM com autoridade** (2–13, 33);
2. **autodeclara** conformidade ou aceita autodeclaração; emite veredito **sem evidência** /
   **inventando evidência** / dependente da memória do LLM;
3. **verifica a si mesmo** (quem executou/recuperou/mediou) — quebra a independência;
4. é **desativável** pelo que fiscaliza (quebra a controlabilidade read-only);
5. **substitui** verification-report, tool-result-verification, failure attribution ou policy
   enforcement (6–8); ou **substitui decisão humana/institucional** quando escalada necessária (14);
6. **corrige** automaticamente ou **altera estado** ao verificar (13, 12);
7. **transforma** ausência de evidência em aprovação (27), parecer em permissão (28) ou verification
   em execução (29); **permite bypass** de tenant/policy/boundary/authority (30); ou **cruza** tenant;
8. **não revisa** os itens do §19; **não alimenta** trace/log; **não** encaminha falha à atribuição
   nem escala quando necessário (31);
9. **vira** auditor autônomo absoluto, runtime, executor, policy engine, juiz final ou mini-agente
   autônomo (33);
10. introduz sintaxe de máquina ou peça executável; ou reposiciona o YZI OS.

---

## 23. Quando pendenciar, atribuir falha ou escalar

Extraído de [`verification-report`](../../p3/verification-report.spec.md) §9/§18,
[`tool-result-verification`](../../p3/tool-result-verification.spec.md) §25,
[`failure-attribution`](../../p3/failure-attribution.spec.md) e
[`escalation-policy`](../../p2/escalation-policy.spec.md) (condição 31):

| Situação | Resposta registrada |
| --- | --- |
| Evidência suficiente, requisitos satisfeitos | **verificado** |
| Sem evidência suficiente | **não verificado** (não é sucesso; ausência ≠ aprovação) |
| Evidência ainda pode existir | **pendência de evidência** |
| Requisito não satisfeito (com evidência) | **falha verificada** → **atribuir** via `failure-attribution` |
| Efeito observado conflita com esperado/evidência | **inconsistente** → `failure-attribution` |
| Ambíguo/insuficiente/contraditório/contaminado/sem evidência | **pendência, failure attribution ou escalada** |
| Falha não atribuível / exige autoridade humana | **escalada** (decisão humana/institucional preservada) |
| Viola tenant/policy/boundary/authority | **bloquear, registrar e escalar** |

Nunca se **valida para "fechar"**; ausência de evidência é registrada como fato.

---

## 24. Riscos arquiteturais evitados

| Risco | Mitigação nesta spec |
| --- | --- |
| Auto-verificação (executor/recuperador/mediador verificando-se) | §6, §11, §22.3 (independência) |
| Auditor desativável pelo que fiscaliza | §11, §19, §22.4 (controlabilidade read-only) |
| Autodeclaração / veredito por opinião | §7, §22.2 (`DO9`) |
| Ausência de evidência virando aprovação | §11, §20, §23 (27) |
| Parecer virando permissão / verification virando execução | §11, §22.7 (28, 29) |
| Verificação destrutiva / corretiva | §7, §11, §22.6 (12, 13) |
| Bypass de fronteira/governança | §11, §22.7 (30) |
| Auditor substituindo report/attribution/enforcement ou decisão humana | §7, §15, §22.5 (6–8, 14) |
| Auditor virando juiz final/policy engine/runtime/executor | §11, §22.9 (33) |

---

## 25. Dependências

- **Aprovadas:** `verification-report`, `tool-result-verification`, `failure-attribution`,
  `episode-trace`, `audit-log`, `entropy-audit`, `intervention-log` (P3); `escalation-policy`,
  `context-provenance`, `policy-enforcement`, `behavioral-governance`, `operational-boundaries` (P2);
  invariantes P0; `operational-state`, `event-driven-state`, `tenant-state-isolation` (P1); skills
  mínimas P4 (`evidence-compilation`, `provenance-tagging`); pares `interface-subagent`,
  `retrieval-subagent` (P4).
- **Futuras (pendentes):** skill `failure-diagnosis`; `escalation-subagent` futuro; `audit-harness` /
  `observability-harness` (P5, mapeados) que o administram. Enquanto não aprovados, a promoção
  **executável** permanece bloqueada (contract-first); esta spec é **documental**.

---

## 26. Próxima peça recomendada

Com `verification-subagent`, **o conjunto mínimo de subagentes (interface → retrieval → verification)
fica completo**. A próxima peça recomendada — **a confirmar separadamente** — seria o **checkpoint de
consolidação dos subagentes mínimos** (análogo ao `p4-minimum-skills-checkpoint`), ou os subagentes
restantes do Subagent Map (`execution-proposal-subagent`, `escalation-subagent`, `synthesis-subagent`).
**Não avancei para nenhuma** — e os guardrails proíbem criar o **checkpoint de subagentes** agora.

---

## 27. Checkpoint

1. **Arquivo ajustado:** apenas `/docs/specs/p4/subagents/verification-subagent.spec.md`. Nenhum
   outro arquivo criado ou alterado.
2. **Natureza respeitada:** spec documental de subagente · governance-first · subagent-preparation ·
   linguagem natural estruturada. **Sem** YAML/JSON/schema/DSL/pseudo-código/contrato
   machine-readable/código/API/configuração/plano de implementação; sem inferência de stack.
3. **Estrutura:** **exatamente as 27 seções obrigatórias**, na ordem fornecida (§19 = observability,
   §20 = escalation; §7/§8/§23 renomeados; verification-report/tool-result-verification consolidados
   em §8 e §15). **Sem reescrever nem adicionar doutrina.**
4. **Critérios obrigatórios:** **explícitos: 1–19, 26, 27–33**. **Pendentes (não recebidos): 20–25 e
   34** — ver Adendo. **Não certifico 34/34** sem o texto literal desses sete.
5. **Confirmação de fronteira:** **nenhum** subagente executável, skill executável, harness, código,
   API, schema, frontend, backlog, YAML/JSON ou contrato machine-readable foi criado. **Não** foi
   criado checkpoint de subagentes. Specs P0–P3, mapas e checkpoints **não** modificados.

**Parado aqui. Não avancei para o checkpoint de subagentes.**

---

## Adendo — Mapa dos critérios obrigatórios

> Total pretendido: **34**. **Honestamente:** os critérios **20–25 e 34 NÃO chegaram** no briefing
> (a sub-lista do critério 19 cortou em "…failure attribution qu…on log" e a mensagem pulou para o
> 27; a lista terminou no 33). **Não certifico 34/34** sem lê-los. Aplicados/explícitos abaixo.

### Explícitos e aplicados

| # | Critério (resumo) | Seções |
| --- | --- | --- |
| 1 | documental, não executável | §1, §2, §6 |
| 2 | revisa, mas não decide operação | §3, §6, §7 |
| 3 | não é executor | §6, §7, §11 |
| 4 | não é tool | §6, §8, §11 |
| 5 | não é service decision | §6, §8, §11 |
| 6 | não é policy enforcement por si só | §5, §7, §11, §14 |
| 7 | não é failure attribution por si só | §7, §11, §15 |
| 8 | não é tool result verification por si só | §7, §11, §15 |
| 9 | não é LLM com autoridade | §6, §11 |
| 10 | não autoriza ação | §11 |
| 11 | não executa tool | §11 |
| 12 | não altera estado | §11, §13 |
| 13 | não corrige automaticamente | §7, §11 |
| 14 | não substitui decisão humana/institucional quando escalada necessária | §7, §20, §22.5 |
| 15 | respeitar tenant scope | §12, §21.6 |
| 16 | preservar tenant boundary | §12, §21.6 |
| 17 | respeitar state como verdade operacional | §13, §21.6 |
| 18 | respeitar policy enforcement, operational boundaries e authority layer | §14, §21.6 |
| 19 | deve revisar [lista: evidência disp./ausente, provenance, tenant scope/boundary, policies, specs, operational boundaries, authority layer, episode trace, audit log, verification report, failure attribution, intervention log] | §19 |
| 26 | entropia auditável por entropy audit | §15, §19 |
| 27 | não transforma ausência de evidência em aprovação | §11, §20, §23 |
| 28 | não transforma parecer em permissão | §11, §22.7 |
| 29 | não transforma verification em execução | §11, §22.7 |
| 30 | não permite bypass de tenant boundary/policy enforcement/operational boundaries/authority layer | §11, §22.7 |
| 31 | ambíguo/insuficiente/contraditório/contaminado/sem evidência → pendência/failure attribution/escalada | §20, §23 |
| 32 | modular, independente, revisável, subordinado a specification | §6, §21.1 |
| 33 | não vira auditor autônomo absoluto/runtime/executor/policy engine/juiz final/mini-agente | §11, §22.9 |

### Critérios 20–25 e 34 (recebidos íntegros e aplicados nesta volta final)

| # | Critério (resumo) | Seções |
| --- | --- | --- |
| 20 | produzir parecer documental de verificação, mas não decisão final | §6, §7, §10, §20 |
| 21 | parecer deve indicar [objeto revisado, tenant, critérios revisados, evidência disp./ausente, conformidades/não conformidades, pendências, riscos, escalation, human review, limitações] | §10 |
| 22 | manter independência do executor, service, tool, interface-subagent e retrieval-subagent | §6, §17, §18, §22.3 |
| 23 | não verificar a si próprio quando for parte envolvida | §6, §11, §22.3 |
| 24 | alimentar episode trace e audit log quando promovido | §15, §19 |
| 25 | falha atribuível por failure attribution | §15 |
| 34 | não virar auditor autônomo absoluto/runtime/executor/policy engine/juiz final/mini-agente | §11, §22.9 |

### Certificação final

> **34/34 critérios obrigatórios explícitos.** Critérios 1–19, 26 e 27–33 aplicados em voltas
> anteriores; **20–25 e 34** recebidos íntegros e aplicados nesta volta final. Estrutura mantida em
> **exatamente 27 seções**. Conteúdo preservado; nenhuma doutrina nova.

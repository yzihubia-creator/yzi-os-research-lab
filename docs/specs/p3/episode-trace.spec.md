# episode-trace

> **Specification documental (governança-first, observability-first, linguagem natural estruturada).**
> Primeira spec da **Onda P3 (Execution + Observability)**. Define o que é um **episode trace** no
> YZI OS: o **registro auditável mínimo de um episódio operacional** — o que aconteceu, sob qual tenant,
> com qual estado, contexto, policies, retrieval, decisões, evidências, camada responsável e resultado.
> O episode trace **comprova**; não executa, não decide, não julga conformidade. **Não** é
> machine-readable: não contém YAML, JSON, schema, DSL, pseudo-código, contrato técnico executável,
> código, API, configuração nem plano de implementação.
>
> Onda: P3 (execução + observabilidade) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `episode-trace` |
| **Camada** | `observability` / `audit` |
| **Owner arquitetural** | Observabilidade |
| **Tenant-scope** | Per-tenant |
| **Classe de operação** | registro-auditável / observabilidade |
| **Candidatura** | `harness` (`observability-harness` + `audit-harness`) |
| **Dependências** | [`operational-state`](../p1/operational-state.spec.md), [`event-driven-state`](../p1/event-driven-state.spec.md), [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md), [`context-provenance`](../p2/context-provenance.spec.md), [`policy-enforcement`](../p2/policy-enforcement.spec.md), [`escalation-policy`](../p2/escalation-policy.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md) |
| **Proveniência** | `[HARNESS-RT]` `[CE]` `[PYR]` `[AHE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P8` (observabilidade obrigatória), `P9` (ação auditável), `DO6` (proveniência), `DO9` (verificação como runtime), `DO10` (auditoria de entropia).
- [`/docs/architecture/observability-architecture.md`](../../architecture/observability-architecture.md) §3 — o episódio como objeto auditável; anatomia do pacote de episódio.
- [`/docs/architecture/operational-architecture.md`](../../architecture/operational-architecture.md) §2, §4, §5 — o episódio como unidade de operação; ciclo governado; verificação.
- [`/docs/harness-engineering/audit-harness.md`](../../harness-engineering/audit-harness.md) e [`/docs/harness-engineering/observability-harness.md`](../../harness-engineering/observability-harness.md) — atribuição, auditor independente, trilha orgânica.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, o que é um **episode trace**: o **registro auditável
mínimo** de um episódio operacional no YZI OS. Antes de qualquer tool, service, agent execution ou
harness executável existir, o sistema precisa saber **como rastrear** o que acontece em uma operação —
de modo que todo episódio seja **reconstruível, auditável e atribuível**.

O episode trace **comprova**: não executa, não decide, não julga conformidade. Sua autoridade é sobre a
**evidência**, não sobre o comportamento (`P8`, `P9`). A spec **extrai** (não inventa nem resume) o
episódio como objeto auditável da arquitetura de observabilidade e operacional. É a raiz da Onda P3.

---

## 2. Problema que resolve

Sem um registro mínimo e governado, uma operação seria uma **caixa-preta**: não se saberia o que
aconteceu, sob qual tenant, com qual estado/contexto/policy/retrieval, quais decisões foram tomadas nem
por qual autoridade — tornando impossível reconstrução, auditoria posterior e atribuição de falha. Isso
viola `P8` (sucesso não verificável e falha não diagnosticável são inaceitáveis).

Esta spec elimina o risco fixando o episode trace como **evidência mínima obrigatória**: cada episódio
produz um registro auditável, isolado por tenant, com proveniência, que torna a operação demonstrável.

---

## 3. Autoridade envolvida

- **Produz e guarda o trace:** a **Observabilidade** (e o `audit-harness`), sob policies, com o
  **Estado** como verdade. A observabilidade **comprova**, não decide nem executa.
- **Read-only para o executor:** o tracer/verificador é **read-only** para quem executa — o executor
  **não** pode desligar a própria fiscalização (invariante de controlabilidade, `[AHE]`).
- **NÃO forjam nem suprimem o trace:** **LLM, agente, prompt e runtime** não inventam, não alteram e não
  suprimem o episode trace; o runtime pode **acionar** o registro, mas não decide a verdade registrada
  (`P1`, `P9`).

---

## 4. Entradas esperadas

- O **episódio operacional** em curso: tenant, operação iniciada, estado lido, contexto montado,
  policies/specifications aplicadas, retrieval usado, decisões tomadas, evidências produzidas.
- A **proveniência** de cada fragmento/transição ([`context-provenance`](../p2/context-provenance.spec.md))
  e os **eventos de estado** correspondentes ([`event-driven-state`](../p1/event-driven-state.spec.md)).

## 5. Saídas esperadas

- Um **episode trace** — o registro auditável mínimo do episódio — isolado por tenant, com proveniência,
  reconstruível e atribuível.
- A base sobre a qual o **pacote de episódio** (observabilidade) compõe traces, verificação, atribuição
  de falha, auditoria de entropia, intervenção humana e resultado final.

---

## 6. Definição de episode trace

**Episode trace** é o **registro auditável mínimo de um episódio operacional**: a espinha de evidência
que documenta **o que aconteceu** em uma operação, do início ao resultado, de forma **reconstruível,
auditável e atribuível**. Características:

1. **Mínimo e obrigatório:** todo episódio produz um trace; não há operação sem registro (`P8`).
2. **Auditável:** read-only e reconstruível; a trilha **forma-se organicamente** quando cada estágio
   preserva sua própria saída (`P9`, `[CE]`).
3. **Tenant-scoped:** isolado por tenant; nenhum trace mistura ou expõe outro tenant.
4. **Proveniente:** cada item registrado carrega origem, momento e confiança (`DO6`).
5. **Comprobatório, não decisório:** comprova o que ocorreu; não autoriza, não decide, não julga
   conformidade.

O episode trace é a **unidade mínima**; o **pacote de episódio** (observability-architecture §3) é o
container completo que o estende com verificação, atribuição, entropia, intervenção e resultado.

---

## 7. Episode trace como evidência operacional

O episode trace é **evidência operacional**, não log decorativo. Ele é a contraparte de prova da
inversão de governança ("confie na arquitetura, não no modelo"): se o estado é a verdade e a governança
é a restrição, o trace é a **demonstração verificável** de que a verdade foi preservada e a restrição
respeitada (`[CE]`, `P8`). Por isso:

1. Sucesso **não** verificável e falha **não** diagnosticável são inaceitáveis — o trace existe para
   tornar ambos verificáveis.
2. O trace separa **comportamento da operação** de **qualidade da evidência**: uma operação pode estar
   correta porém não verificada, e uma falha pode ser diagnosticamente útil (`[HARNESS-RT]`).

---

## 8. Anatomia mínima de um episode trace

Todo episode trace **DEVE** registrar, no mínimo:

| Elemento | O que registra |
| --- | --- |
| **O que aconteceu** | a operação/intenção e seu desenrolar |
| **Tenant** | qual tenant estava envolvido |
| **Operação iniciada** | qual operação foi disparada |
| **Estado lido** | qual estado operacional foi lido |
| **Contexto montado** | qual pacote de contexto foi montado |
| **Policies/specifications aplicadas** | quais policies/contratos governaram |
| **Retrieval usado** | qual recuperação foi empregada |
| **Decisões** | o que foi **permitido, bloqueado, escalado ou ficou pendente de evidência** |
| **Evidências produzidas** | quais evidências o episódio gerou |
| **Camada responsável** | qual camada teve responsabilidade por cada decisão relevante |
| **Resultado final** | a classificação final do episódio |

Cada elemento carrega **proveniência** (`DO6`). O trace **DEVE** permitir **reconstrução do episódio**,
**auditoria posterior** e **atribuição de falha** (`DO9`).

---

## 9. Relação com estado operacional

O estado é a **verdade**; o trace **comprova** o que foi lido dela, não a substitui
([`operational-state`](../p1/operational-state.spec.md)). O trace registra **qual estado foi lido** sem
se tornar fonte de verdade: a conversa e o trace são projeções/registros, o estado persistido é a
verdade. O trace **não** altera estado.

---

## 10. Relação com eventos de estado

Toda evolução de estado ocorre por **eventos auditáveis** ([`event-driven-state`](../p1/event-driven-state.spec.md)).
O episode trace **referencia** os eventos do episódio (não os duplica): a persistência do resultado é um
evento; o trace registra que ele ocorreu, com proveniência. Alteração relevante do registro/escopo de
observabilidade também **gera evento auditável**.

---

## 11. Relação com contexto e proveniência

O trace registra **qual contexto foi montado** e preserva a **proveniência** de cada fragmento
([`context-assembly`](../p2/context-assembly.spec.md), [`context-provenance`](../p2/context-provenance.spec.md)).
A observabilidade é a **guardiã da proveniência** ao longo de todo o episódio: é a proveniência que
permite responder, depois de uma decisão, **qual fragmento a provocou**. Fragmento sem proveniência não
governa decisão e o trace registra essa exclusão quando relevante.

---

## 12. Relação com retrieval

O trace registra **qual retrieval foi usado** e sob qual escopo/autoridade
([`retrieval-governance`](../p2/retrieval-governance.spec.md), [`tenant-retrieval-scope`](../p2/tenant-retrieval-scope.spec.md)).
Como o retrieval é a **face contextual da governança** (não busca livre), o trace torna **toda decisão
influenciada por retrieval reconstruível e auditável dentro do tenant**, com motivo de inclusão/exclusão
e authority layer.

---

## 13. Relação com policies e specifications

O trace registra **quais policies/specifications foram aplicadas** ao episódio
([`behavioral-governance`](../p2/behavioral-governance.spec.md), [`tenant-policy-pack`](../p2/tenant-policy-pack.spec.md)).
Ele **comprova** que a governança foi aplicada; **não** a define nem a julga — registra a aplicação e o
veredito, deixando o julgamento de conformidade para a governança.

---

## 14. Relação com enforcement

O enforcement é **determinístico e pós-geração** ([`policy-enforcement`](../p2/policy-enforcement.spec.md)).
O trace registra **a decisão de enforcement** — permitido, bloqueado, escalado ou pendente de evidência
— como evidência auditável, **independentemente do agente** que produziu a operação. O trace não decide
o veredito; registra-o com proveniência.

---

## 15. Relação com escalation

A escalation é **governança, não falha** ([`escalation-policy`](../p2/escalation-policy.spec.md)). O
trace registra **toda escalada** — gatilho, momento, camada responsável, evidência — e a sua resolução.
Decisão escalada só vira verdade após retorno do operador e validação; o trace documenta esse percurso,
preservando a responsabilidade.

---

## 16. Relação com tools/services futuros

Tools e services **ainda não existem** como peças executáveis. Quando existirem, o episode trace
**DEVE** registrar tools/services **solicitados, permitidos, bloqueados ou executados** — cada
invocação produz trace, sob fronteira de permissão explícita (`P14`,
[`operational-boundaries`](../p2/operational-boundaries.spec.md)). Esta spec **prepara** esse registro
sem criar tool/service algum.

---

## 17. Relação com camadas de autoridade

O trace registra **qual camada teve responsabilidade por cada decisão relevante**, conforme o modelo de
9 camadas ([`layer-authority-model`](../p0/layer-authority-model.spec.md)): estado, services, policies,
retrieval, observabilidade, runtime, agents, tools, LLM. Isso torna cada ganho ou ação **atribuível** à
camada correta e impede que a responsabilidade se dissolva. O LLM/prompt entram como Metadata; o trace
nunca lhes atribui autoridade que não têm.

---

## 18. Relação com observabilidade

O episode trace é a **unidade mínima** da camada de observabilidade, que **comprova** (não executa nem
decide) ([`observability-harness`](../../harness-engineering/observability-harness.md)). Compõe-se nos
três pilares: **component** (cada item isolado e reversível), **experience** (evidência em camadas, por
divulgação progressiva) e **decision** (cada decisão relevante pareada a uma predição falsificável,
`DO7`). O verificador/tracer é **read-only** para o executor.

---

## 19. Relação com auditoria

O trace alimenta a **auditoria** ([`audit-harness`](../../harness-engineering/audit-harness.md),
[`auditability`](../../governance/auditability.md)): proveniência, **atribuição de falha antes de
qualquer ação corretiva** (`DO9`), auditoria de entropia (`DO10`) e **auditor independente** — quem
executa **não** audita (`[CE]`). A trilha de auditoria **forma-se organicamente** quando cada estágio
preserva sua saída; o trace é onde isso acontece.

---

## 20. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Produzir um episode trace para **todo** episódio (não há operação sem registro).
2. Registrar a anatomia mínima do §8, com proveniência por item.
3. Manter o trace **tenant-scoped**; nunca misturar ou expor outro tenant.
4. Manter o trace **read-only para o executor**; impedir LLM/agente/prompt/runtime de forjar/alterar/
   suprimir.
5. Registrar a **camada responsável** por cada decisão relevante.
6. Permitir **reconstrução do episódio, auditoria posterior e atribuição de falha**.
7. Registrar decisões (permitido/bloqueado/escalado/pendente de evidência) e escaladas com evidência.
8. Preparar o registro de tools/services para quando existirem, sem criá-los.
9. Comprovar — não decidir, não executar, não julgar conformidade.

---

## 21. Critérios de aceite

1. Referencia `P8`/`P9`/`DO6`/`DO9`/`DO10` e o episódio como objeto auditável sem contradizê-los nem
   duplicá-los.
2. Define o episode trace como registro auditável mínimo (§6) e evidência operacional (§7).
3. Fixa a anatomia mínima (§8) com proveniência.
4. Fixa as relações com estado, eventos, contexto/proveniência, retrieval, policies, enforcement,
   escalation, tools/services futuros, camadas, observabilidade e auditoria (§§9–19).
5. Fixa reconstrução/auditoria posterior/atribuição de falha e o isolamento por tenant.
6. Mantém o trace comprobatório (não decisório) e read-only para o executor; revisável por humano.

---

## 22. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Admite episódio sem episode trace.
2. Omite qualquer elemento da anatomia mínima ou não registra proveniência.
3. Deixa o trace misturar ou expor outro tenant.
4. Permite LLM/agente/prompt/runtime forjar, alterar ou suprimir o trace; ou torna o tracer editável
   pelo executor.
5. Não permite reconstrução, auditoria posterior ou atribuição de falha.
6. Faz o trace decidir, executar ou julgar conformidade (extrapola "comprovar").
7. Não registra a camada responsável por cada decisão relevante.
8. Introduz código/API/schema/YAML/JSON/contrato machine-readable; infere stack técnica; transforma a
   spec em plano de implementação; ou reposiciona o YZI OS.

---

## 23. Método de verificação

1. **Cobertura:** verificar que todo episódio produz trace com a anatomia do §8.
2. **Reconstrutibilidade:** reconstruir um episódio a partir do seu trace.
3. **Atribuição:** dado um resultado, atribuir a falha/responsabilidade à camada/origem via trace.
4. **Isolamento:** verificar que o trace é tenant-scoped e não expõe outro tenant.
5. **Controlabilidade:** verificar que o executor não altera nem desliga o próprio trace.
6. Violação ⇒ rejeição/escalada; verificação independente do agente (auditor independente).

---

## 24. Observabilidade esperada

- Para cada episódio: trace com a anatomia do §8 · proveniência por item · camada responsável ·
  resultado final.
- Registro de decisões (permitido/bloqueado/escalado/pendente) e de escaladas até resolução.
- Evento auditável para alteração relevante do registro/escopo de observabilidade.
- Trilha auditável e read-only, isolada por tenant (`P9`, `DO6`).

---

## 25. Riscos arquiteturais evitados

- **Operação caixa-preta** — episódio sem registro reconstruível (`P8`).
- **Trace forjado/suprimido** — executor desligando a própria fiscalização.
- **Vazamento cross-tenant** — trace misturando ou expondo outro tenant.
- **Responsabilidade dissolvida** — decisão sem camada responsável registrada.
- **Remendo aleatório** — correção sem atribuição de falha prévia (`DO9`).
- **Trace que decide** — observabilidade extrapolando de "comprovar" para "decidir".

---

## 26. Fora de escopo

- **Não** define dashboards, formato de logs, ferramentas de tracing nem pipelines técnicos
  (observability-architecture §10).
- **Não** define o pacote de episódio completo nem os demais artefatos de verificação/atribuição em
  detalhe — apenas o **trace mínimo** e os referencia.
- **Não** cria o `observability-harness`/`audit-harness` executável nem nenhuma outra spec.
- **Não** cria tool, service, skill, subagente, harness, código, API, schema, frontend, backlog, sprint
  plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 27. Proveniência

`[HARNESS-RT]` AI Harness Runtime — o episódio como unidade auditável; pacote de episódio; verificação e
atribuição. `[CE]` Context Engineering — trilha orgânica; proveniência; auditor independente. `[PYR]`
Context→Intent→Specification — proveniência e responsabilidade; atribuição à origem. `[AHE]` Agentic
Harness Engineering — três pilares de observabilidade; invariante de controlabilidade (tracer read-only).

---

## 28. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P8`/`P9` nem a arquitetura de observabilidade: é a spec que os **opera** como
  contrato de registro auditável mínimo verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma spec futura da Onda P3 — apenas fixa o episode trace que as demais herdam.

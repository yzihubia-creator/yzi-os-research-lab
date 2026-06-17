# audit-log

> **Specification documental (governança-first, observability-first, linguagem natural estruturada).**
> Segunda spec da **Onda P3 (Execution + Observability)**. Define o **audit log** do YZI OS: a **trilha
> auditável institucional** — não log técnico decorativo — que registra episódios, traces, decisões,
> eventos, bloqueios, permissões, escaladas, tentativas de violação e alterações relevantes, de forma
> tenant-scoped, proveniente e reconstruível. **Não** é machine-readable: não contém YAML, JSON, schema,
> DSL, pseudo-código, contrato técnico executável, código, API, configuração nem plano de implementação.
>
> Onda: P3 (execução + observabilidade) · Status: proposta para aprovação · Versão: v1 · Data: 2026-06-03
> Documento normativo. Linguagem: DEVE / NÃO DEVE / NUNCA têm força contratual.

---

## Identificação

| Campo | Valor |
| --- | --- |
| **Nome** | `audit-log` |
| **Camada** | `observability` / `audit` / `governance` |
| **Owner arquitetural** | Observabilidade / Governança |
| **Tenant-scope** | Per-tenant |
| **Classe de operação** | trilha-auditável-institucional |
| **Candidatura** | `harness` (`audit-harness` + `observability-harness`) |
| **Dependências** | [`episode-trace`](episode-trace.spec.md), [`event-driven-state`](../p1/event-driven-state.spec.md), [`operational-state`](../p1/operational-state.spec.md), [`context-provenance`](../p2/context-provenance.spec.md), [`policy-enforcement`](../p2/policy-enforcement.spec.md), [`escalation-policy`](../p2/escalation-policy.spec.md), [`tenant-boundary`](../p0/tenant-boundary.spec.md), [`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md), [`layer-authority-model`](../p0/layer-authority-model.spec.md) |
| **Proveniência** | `[HARNESS-RT]` `[CE]` `[PYR]` `[AHE]` |

**Fontes consolidadas (referência, não duplicação):**
- [`/docs/foundation/principles.md`](../../foundation/principles.md) — `P8` (observabilidade obrigatória), `P9` (ação auditável), `DO6` (proveniência), `DO9`, `DO10`.
- [`/docs/governance/auditability.md`](../../governance/auditability.md) — toda ação operacional é auditável; proveniência como pré-requisito; auditor independente; controlabilidade read-only; auditabilidade = 4ª posição da ordem de valores.
- [`/docs/architecture/observability-architecture.md`](../../architecture/observability-architecture.md) e [`/docs/harness-engineering/audit-harness.md`](../../harness-engineering/audit-harness.md) — pacote de episódio; trilha orgânica; atribuição; entropia.

---

## 1. Propósito

Fixar, como **contrato operacional verificável**, o que é o **audit log** do YZI OS: a **trilha
auditável institucional** que registra, ao longo do tempo e por tenant, episódios, traces, decisões,
eventos, bloqueios, permissões, escaladas, tentativas de violação e alterações relevantes. O audit log
é o que torna **toda ação operacional auditável** (`P9`) e **suficiente para comprovar conformidade com
P0, P1 e P2**.

A spec **extrai** (não inventa nem resume) a auditabilidade como exigência de governança, o pacote de
episódio e a trilha orgânica. **Estende** o [`episode-trace`](episode-trace.spec.md): enquanto aquele
fixa o registro **mínimo de um episódio**, o audit log é a **trilha institucional transversal** que
acumula e torna consultável a evidência de todos os episódios.

---

## 2. Problema que resolve

Sem uma trilha auditável institucional, a evidência ficaria dispersa, manipulável ou dependente da
conversa — e a instituição não poderia **reconstruir o histórico**, **auditar por múltiplas dimensões**
nem **comprovar conformidade**. Um "log técnico decorativo" não cumpre essa função: não é proveniente,
não é tenant-scoped, não é read-only para o executor.

Esta spec elimina o risco fixando o audit log como **trilha institucional obrigatória, proveniente e
isolada por tenant**, cuja ausência/corrupção/inconsistência **bloqueia execução futura, gera pendência
de evidência ou escalada**.

---

## 3. Autoridade envolvida

- **Define o conteúdo verificável:** **services, policies, state, specifications, traces e harnesses
  futuros** — não a linguagem. O audit log registra o que essas camadas produzem.
- **Coordena a escrita (não decide a verdade):** o **Runtime** pode coordenar a escrita do audit log,
  mas **não decide a verdade auditável**.
- **NÃO fabricam o log:** **LLM, agente, prompt e runtime** não fabricam audit log; o log **não depende
  da memória conversacional** (`P1`, `P9`). O tracer/verificador é **read-only** para o executor.

---

## 4. Entradas esperadas

- Os **episode traces** ([`episode-trace`](episode-trace.spec.md)) e os **eventos de estado**
  ([`event-driven-state`](../p1/event-driven-state.spec.md)) de cada operação.
- As **decisões** (enforcement, escalada), **alterações relevantes** (estado, tenant configuration,
  policy pack, retrieval scope, futuras tools/services) e **tentativas de violação**.
- A **proveniência**, o **tenant** e a **camada de autoridade** de cada item.

## 5. Saídas esperadas

- Uma **trilha auditável institucional por tenant** — consultável por múltiplas dimensões, reconstruível
  e proveniente — suficiente para comprovar conformidade com P0/P1/P2.
- A base sobre a qual se apoiam **failure attribution, verification report, entropy audit e intervention
  log** futuros.

---

## 6. Definição de audit log

**Audit log** é a **trilha auditável institucional** do YZI OS: o registro acumulado, ao longo do tempo
e por tenant, de tudo o que tem relevância de governança em uma operação. Características:

1. **Institucional, não decorativo:** é evidência de governança, não log técnico para depuração casual.
2. **Auditável e reconstruível:** permite reconstrução histórica da operação; a trilha **forma-se
   organicamente** quando cada estágio preserva sua saída (`P9`, `[CE]`).
3. **Tenant-scoped:** isolado por tenant; preserva a fronteira de tenant.
4. **Proveniente:** cada registro carrega origem (quem/qual camada), momento (quando) e evidência
   (`DO6`).
5. **Read-only para o executor:** não fabricável, não suprimível, não dependente da conversa.

---

## 7. O que o audit log registra

O audit log **DEVE** registrar, por tenant:

| Categoria | Itens registrados |
| --- | --- |
| **Episódios e traces** | episódios e seus [`episode-trace`](episode-trace.spec.md) |
| **Decisões** | enforcement (permitido/bloqueado/escalado/pendente de evidência) |
| **Eventos** | eventos de estado produzidos ou bloqueados |
| **Bloqueios e permissões** | o que foi barrado e o que foi autorizado |
| **Escaladas** | escaladas, motivos, evidências disponíveis/ausentes, autoridade requerida |
| **Tentativas de violação** | tentativas de cruzar fronteira/contornar policy/expandir escopo |
| **Alterações relevantes** | estado, tenant configuration, policy pack, retrieval scope, futuras tools/services |

Cada registro inclui: **quem/qual camada originou** a ação · **quando** ocorreu · **qual evidência** a
sustentou · e, quando a **ausência de evidência** gerar bloqueio/pendência/escalada, esse fato também é
registrado.

---

## 8. Dimensões de auditoria

O audit log **DEVE** permitir auditoria por: **tenant, episódio, agente, service, tool, policy,
specification, estado, evento e camada de autoridade**. Cada dimensão é uma forma de reconstruir e
interrogar o histórico — sempre **dentro do tenant** ([`tenant-boundary`](../p0/tenant-boundary.spec.md)).
Isso torna toda ação **atribuível** à sua origem e à sua camada responsável
([`layer-authority-model`](../p0/layer-authority-model.spec.md)).

---

## 9. Integridade e indisponibilidade do audit log

1. **Ausência, corrupção ou inconsistência** no audit log **DEVE** **bloquear execução futura**, gerar
   **pendência de evidência** ou **escalada** ([`escalation-policy`](../p2/escalation-policy.spec.md)) —
   nunca prosseguir como se a trilha existisse.
2. O log **NÃO PODE** ser fabricado pelo LLM nem depender da memória conversacional.
3. O log é **read-only para o executor** (invariante de controlabilidade): quem executa não desliga a
   própria fiscalização (`[AHE]`).
4. Vale o **auditor independente**: quem executa não audita (`[CE]`).

---

## 10. Suficiência para comprovar conformidade com P0–P1–P2

O audit log **DEVE** ser **suficiente para comprovar conformidade** com as ondas já fechadas:

- **P0** — autoridade, conflito e fronteira de tenant respeitados (camada responsável registrada;
  nenhuma travessia de tenant).
- **P1** — estado como verdade e evolução por eventos auditáveis (eventos e estado lido/alterado
  registrados).
- **P2** — enforcement, contexto/proveniência, retrieval e verticalização governada (decisões, fontes,
  escopo e alterações de configuração/policy/retrieval registrados).

A comprovação é o **fechamento** da inversão de governança: a arquitetura é confiável **porque** é
demonstrável.

---

## 11. Regras de conformidade

Todo artefato/operação **DEVE**:

1. Tratar o audit log como **trilha auditável institucional**, não log decorativo.
2. Registrar episódios, traces, decisões, eventos, bloqueios, permissões, escaladas, tentativas de
   violação e alterações relevantes (§7).
3. Manter o log **tenant-scoped** e preservar a fronteira de tenant.
4. Permitir **reconstrução histórica** e auditoria pelas dimensões do §8.
5. Registrar **quem/qual camada originou**, **quando**, **qual evidência** sustentou — e **ausência de
   evidência** quando gerar bloqueio/pendência/escalada.
6. Registrar alterações em estado, tenant configuration, policy pack, retrieval scope e futuras
   tools/services.
7. Impedir fabricação pelo LLM e dependência da memória conversacional; manter o runtime como
   coordenador, não decisor da verdade auditável.
8. Preservar **provenance, tenant scope e authority layer** em cada registro.
9. Apoiar failure attribution, verification report, entropy audit e intervention log futuros.
10. Bloquear/pender/escalar diante de ausência/corrupção/inconsistência do log.
11. Ser suficiente para comprovar conformidade com P0/P1/P2.

---

## 12. Critérios de aceite

1. Referencia `P8`/`P9`/`DO6` e a auditabilidade como governança sem contradizê-los nem duplicá-los.
2. Define o audit log como trilha institucional (não decorativa) e fixa o que registra (§6, §7).
3. Fixa tenant-scope, preservação de fronteira e as dimensões de auditoria (§8).
4. Fixa origem/momento/evidência e o registro da ausência de evidência.
5. Fixa não-fabricação pelo LLM, independência da conversa, runtime coordenador não decisor.
6. Fixa integridade (ausência/corrupção → bloqueio/pendência/escalada), apoio às specs futuras e
   suficiência para P0/P1/P2; revisável por humano.

---

## 13. Critérios de rejeição

A spec — ou qualquer artefato verificado por ela — é **rejeitada** se:

1. Trata o audit log como log técnico decorativo.
2. Omite qualquer categoria do §7 ou não registra origem/momento/evidência.
3. Não é tenant-scoped, ou deixa o log cruzar/expor outro tenant.
4. Não permite reconstrução histórica ou auditoria pelas dimensões do §8.
5. Permite o LLM fabricar o log, ou faz o log depender da memória conversacional.
6. Atribui ao runtime a decisão sobre a verdade auditável, ou torna o log editável pelo executor.
7. Não bloqueia/pende/escala diante de ausência/corrupção/inconsistência.
8. Não é suficiente para comprovar conformidade com P0/P1/P2.
9. Introduz código/API/schema/YAML/JSON/contrato machine-readable; infere stack; transforma em plano de
   implementação; ou reposiciona o YZI OS.

---

## 14. Relação com as camadas do YZI OS

O audit log materializa a camada de **Observabilidade** (que comprova) sob exigência de **Governança**
(auditabilidade): registra o que **Estado/Services/Policies/Retrieval** produzem, atribui à **camada
responsável** ([`layer-authority-model`](../p0/layer-authority-model.spec.md)) e preserva o isolamento
de [`tenant-boundary`](../p0/tenant-boundary.spec.md)/[`tenant-state-isolation`](../p1/tenant-state-isolation.spec.md).
O `audit-harness`/`observability-harness` o sustentam; o runtime coordena a escrita sem decidir a
verdade.

---

## 15. Relação com specifications futuras

Estende [`episode-trace`](episode-trace.spec.md) e **apoia** as próximas specs da Onda P3:
`failure-attribution`, `verification-report`, `entropy-audit` e `intervention-log` — ver
[Specification Map](../../specification-engineering/specification-map.md). É a base da trilha do
`audit-harness`. **Não autoriza** a criação dessas specs.

---

## 16. Relação com skills, subagentes, harnesses, services e tools

| Peça futura | Relação com o audit log |
| --- | --- |
| **Skill** | sua execução é registrada; a skill não escreve a própria "aprovação" no log |
| **Subagente** | o `audit-subagent` consome o log; o `verification-subagent` o usa como evidência |
| **Harness** | o `audit-harness`/`observability-harness` produz e guarda a trilha (read-only para o executor) |
| **Service** | define conteúdo verificável; suas decisões entram no log |
| **Tool** | quando existir, cada invocação (solicitada/permitida/bloqueada/executada) entra no log |
| **LLM / agente de código** | não fabrica o log; sua proposta é Metadata, registrada como tal |

---

## 17. Método de verificação

1. **Cobertura:** verificar que toda ação/decisão/evento/alteração relevante entra no log (§7).
2. **Reconstrução:** reconstruir o histórico de uma operação a partir do log.
3. **Dimensões:** auditar por tenant/episódio/agente/service/tool/policy/specification/estado/evento/
   camada (§8).
4. **Integridade:** simular ausência/corrupção/inconsistência ⇒ deve bloquear/pender/escalar.
5. **Não-fabricação:** verificar que o log não é fabricado pelo LLM nem depende da conversa.
6. **Conformidade:** verificar que o log é suficiente para comprovar P0/P1/P2.
7. Violação ⇒ rejeição/escalada; verificação independente do agente.

---

## 18. Observabilidade esperada

- Por registro: origem (quem/qual camada) · momento · evidência · tenant · authority layer · proveniência.
- Registro de ausência de evidência quando gerar bloqueio/pendência/escalada.
- Registro de tentativas de violação e de alterações em estado/configuração/policy pack/retrieval scope.
- Trilha read-only, isolada por tenant, reconstruível (`P9`, `DO6`).

---

## 19. Riscos arquiteturais evitados

- **Log decorativo** — trilha sem valor de governança, não proveniente.
- **Trilha manipulável** — log fabricado/editável pelo executor ou dependente da conversa.
- **Vazamento cross-tenant** — log misturando ou expondo outro tenant.
- **Conformidade não demonstrável** — impossibilidade de comprovar P0/P1/P2.
- **Execução sobre trilha quebrada** — prosseguir com log ausente/corrompido/inconsistente.
- **Responsabilidade dissolvida** — ação sem origem/camada registrada.

---

## 20. Fora de escopo

- **Não** define dashboards, formato de log/assinatura nem pipelines técnicos (auditability §7;
  observability-architecture §10).
- **Não** define failure attribution, verification report, entropy audit nem intervention log em
  detalhe — apenas os **apoia** e os referencia.
- **Não** cria o `audit-harness`/`observability-harness` executável nem nenhuma outra spec.
- **Não** cria tool, service, skill, subagente, harness, código, API, schema, frontend, backlog, sprint
  plan, YAML/JSON, contrato machine-readable ou implementation harness.

---

## 21. Proveniência

`[HARNESS-RT]` AI Harness Runtime — pacote de episódio; trilha auditável; atribuição e entropia. `[CE]`
Context Engineering — trilha orgânica; auditor independente; proveniência. `[PYR]`
Context→Intent→Specification — proveniência como pré-requisito; responsabilidade transitiva à origem.
`[AHE]` Agentic Harness Engineering — invariante de controlabilidade (trilha read-only para o executor).

---

## 22. Fronteiras (o que NÃO está aqui)

- **Não** substitui `P8`/`P9` nem a auditabilidade de governança: é a spec que os **opera** como
  contrato de trilha auditável institucional verificável.
- **Não** introduz sintaxe de máquina nem peça executável.
- **Não** autoriza nenhuma spec futura da Onda P3 — apenas fixa o audit log que as demais herdam.

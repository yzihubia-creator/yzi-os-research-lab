# Lane 6 — Product Scope Candidate Review v1

> Relatório **curto de decisão** de produto. Avalia a candidata de escopo da Lane 6
> **sem abrir a Lane 6**, sem criar Execution Program, sem alterar código/`platform/`,
> sem SQL, sem MCP, sem criar tenant/membership/seed e sem atualizar o mapa operacional.
> É análise documental que conclui com uma recomendação objetiva.

Lane anterior: 5 — Agent Operations Layer · Status: **fechada**
(`LANE_5_AGENT_OPERATIONS_LAYER_CLOSED_NO_MEMBERSHIP_VALIDATED`)
Projeto Supabase: `thwsltjcjrvtidhnfukc` · Data: 2026-06-12 · Papel: **Product Architect**

---

## 0. Situação de Produto (de onde partimos)

A Lane 5 entregou o cockpit operador-facing mínimo: operador autenticado visível, estado
`no_membership` validado em runtime, tenant/membership boundary explicado, base agentic
nomeada como vazia/indisponível, **sem dado inventado** e **sem tenant/membership/agente
real**. Baseline limpo: 0 tenants, 0 memberships.

**Lacuna atual:** o operador entende que está autenticado mas **não pertence a nenhum
tenant**, e o sistema **não tem caminho governado** para criar/associar um tenant ou
membership real. Sem isso, o estado `tenant_found` nunca é exercitado e a operação
agentic real permanece inalcançável — falta um **boundary habitável**, não apenas legível.

---

## 1. Qual deve ser o objetivo de produto da Lane 6?

Criar o **primeiro caminho governado para ativar um tenant e um membership reais**, de
forma controlada e reversível — sem seed permanente, sem bypass de RLS, sem service role
no frontend e sem abrir execução real de agentes. O resultado de produto: o operador
deixa de estar perpetuamente em `no_membership` e passa a **pertencer** a um tenant, com
o cockpit renderizando `tenant_found` a partir de **dado real**.

## 2. Tenant/membership real ou logout/session controls?

**Tenant/membership real.** É o item no **caminho crítico**: desbloqueia `tenant_found`,
a habitação do boundary e, mais adiante, a operação agentic. **Logout/session controls** é
um gap de UX **menor e não bloqueante** (já registrado no closure gate da Lane 5); não
justifica uma lane inteira e pode ser absorvido como **tarefa menor** dentro da Lane 6 ou
de um incremento à parte. Priorizar logout agora seria otimizar a periferia ignorando o
bloqueio central.

## 3. O que precisa existir antes de agentes reais?

1. Um **tenant real** e um **membership real** ligando o operador a ele (boundary
   habitado, não só lido).
2. Uma **política de escrita mínima** (INSERT) para `tenants`/`tenant_memberships` — hoje
   só existem policies **SELECT** (`tenants_select_member`, `memberships_select_own`).
3. Um **modelo mínimo de quem pode ativar** um tenant/membership (conceito de bootstrap/
   owner) — sem hierarquia de papéis ampla.
4. O estado **`tenant_found` exercitado em runtime** com dado real (a Lane 5 só o
   desenhou).
5. Reversibilidade documentada (caminho de desfazer), preservando a disciplina de
   baseline limpo.

## 4. Riscos de criar tenant/membership agora

| Risco | Natureza | Mitigação proposta |
|---|---|---|
| **Primeiro caminho de ESCRITA** (INSERT) | Nova superfície de ataque; RLS de escrita é crítica | Policy mínima, revisada pelo Auth/RLS Reviewer antes de qualquer uso |
| **Escalonamento de privilégio** | User criar membership em tenant alheio / auto-conceder papel elevado | Policy restrita a `auth.uid()`; sem papel elevado nesta lane |
| **Service role no frontend** | Bootstrap tenta privilégio elevado | **Proibido**; ativação via SQL manual humano, não no cliente |
| **Seed permanente** | Polui o baseline limpo (0/0) cuidadosamente mantido | Ativação **reversível e documentada**, não seed durável |
| **Quebra de isolamento (P10)** | Policy de escrita malfeita rompe o tenant boundary | Revisão Auth/RLS obrigatória; testes de boundary |
| **Modelo de papéis prematuro** | Membership implica papel ("owner"/"member") ainda indefinido | Definir o **mínimo** necessário; diferir hierarquia |

## 5. Criação: SQL manual humano, admin controlado ou adiada?

**SQL manual pelo humano** (no SQL Editor), conforme a regra de harness vigente ("SQL é
executado manualmente pelo humano; agente não executa SQL"). É o caminho mais barato,
controlado, **reversível** e consistente com o projeto para a primeira ativação (policy de
escrita mínima + 1 tenant + 1 membership do operador validado).

- **Admin controlado (UI self-service)** → **adiado**: exige policy de escrita, modelo de
  papéis e UI, todos indefinidos; prematuro.
- **Adiar tudo** → não recomendado: o bloqueio de produto é real e o custo do incremento
  mínimo é baixo.

Papel do agente: **planejar** o SQL (Backend/Supabase Planner) e **revisar** (Auth/RLS);
a **execução do SQL é ação humana manual** sob gate próprio.

## 6. Agentes/papéis que devem participar

- **Product Architect** — superfície e Definição de Concluído da ativação.
- **Execution Coordinator** — sequenciar batches.
- **Backend/Supabase Planner** — **ativado nesta lane** (diferente da Lane 5): planeja a
  policy de escrita mínima e o SQL de ativação (sem executá-lo).
- **Auth/RLS Reviewer** — **crítico**: revisa que a policy de escrita preserva o boundary
  e o menor privilégio, sem escalonamento.
- **Frontend Implementer** — **somente se** houver reflexo de `tenant_found` no cockpit,
  sob gate com lista exata de arquivos.
- **UX/Cockpit Reviewer** — se houver UI tocada.
- **Evidence Auditor** — 1 evidence por batch real.

## 7. Menor incremento de produto verificável

Com **1 tenant real** e **1 membership real** (o operador já validado) criados por um
caminho **governado, manual e reversível**, o cockpit renderiza o estado **`tenant_found`**
honestamente em runtime — "Operação de {nome do tenant}", base agentic ainda vazia. Isso
**exercita o caminho que a Lane 5 só desenhou** e é verificável por observação runtime
humana. O incremento é **o caminho de ativação + `tenant_found` exercitado**, não uma UI
de criação self-service.

## 8. O que deve continuar explicitamente fora de escopo

- Agentes reais, execução agentic, runners, schedulers, MCP, subagents executáveis.
- **UI self-service** de criação de tenant para qualquer usuário (signup→tenant aberto).
- Hierarquia de papéis/permissões além do mínimo do membership.
- Billing, onboarding, dashboard, CRUD de dados de negócio.
- **Seed permanente**; **service role no frontend**; policies de escrita além do mínimo de
  ativação tenant/membership.
- Gestão multi-tenant em escala, convites em massa.

---

## Recomendação (objetiva)

> **A Lane 6 deve ser: Tenant Bootstrap / Membership Activation Layer.**

Justificativa: é o único candidato no **caminho crítico** — desbloqueia `tenant_found`, a
habitação do tenant boundary e a trajetória para operação agentic real; o closure gate da
Lane 5 já apontou `tenant_found`-com-tenant-real como o principal remanescente. As
alternativas são inferiores **agora**:

- **Session/Logout Controls** — gap menor e não bloqueante; absorver como tarefa menor,
  não como lane.
- **Agent Registry Placeholder** — prematuro: sem tenant habitado, registrar agentes
  (ainda que placeholder) não tem boundary onde existir.
- **Permanecer indefinida** — desperdiça um sinal de produto claro; não recomendado.

**Condições inegociáveis da Lane 6 (quando aberta):** ativação via **SQL manual humano**,
**reversível**, **sem seed permanente**, **sem service role no frontend**, **sem bypass de
RLS**, com **policy de escrita mínima revisada pelo Auth/RLS Reviewer** e **sem abrir
execução de agentes**. Logout pode entrar como tarefa menor oportunista.

---

## Confirmação de Não-Execução

Este relatório é documentário. **Não** abre a Lane 6, **não** cria Execution Program,
**não** altera código/`platform/`, **não** cria SQL, **não** cria tenant/membership/seed,
**não** usa MCP e **não** atualiza o mapa operacional. Apenas avalia e recomenda. A
abertura da Lane 6 exige a frase de autorização humana explícita definida no closure gate
da Lane 5.

---

## Readiness

`LANE_6_PRODUCT_SCOPE_CANDIDATE_REVIEW_CREATED_NOT_OPENED`

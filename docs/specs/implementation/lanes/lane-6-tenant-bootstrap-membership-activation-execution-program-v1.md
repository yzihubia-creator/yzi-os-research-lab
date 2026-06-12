# Lane 6 — Tenant Bootstrap / Membership Activation Layer: Execution Program v1

Status: **proposta — criado, NÃO aberto**
Modo: Execution Program Mode (sobre o SDD Lite / Execution Pack Mode)
Projeto Supabase: `thwsltjcjrvtidhnfukc`
Data: 2026-06-12

> Este documento é o **programa de execução proposto** da Lane 6. Ele **não abre a
> Lane 6**, não executa código, não executa SQL, não usa MCP, não modifica `platform/`,
> não cria tenant/membership/seed, não cria policy de escrita e não autoriza nenhuma ação
> por si só. Torna-se **programa ativo** apenas depois que o humano escrever a frase de
> abertura da Lane 6 (seção 10). Padrão idêntico ao usado na Lane 5, cujo programa foi
> criado como proposta documental antes do gate. Fundamenta-se na revisão de escopo
> candidata [`lane-6-product-scope-candidate-review-v1.md`](lane-6-product-scope-candidate-review-v1.md)
> (commit `94d7ec9`) e no closure gate da Lane 5
> [`lane-5-agent-operations-layer-closure-gate-v1.md`](lane-5-agent-operations-layer-closure-gate-v1.md).

---

## 1. Lane Identity

| Campo | Valor |
|---|---|
| **Nome** | Lane 6 — Tenant Bootstrap / Membership Activation Layer |
| **Objetivo de produto** | Criar o **primeiro caminho governado, reversível e auditável** para ativar **um tenant real** e **um membership real** do operador já validado, exercitando o estado `tenant_found` no cockpit — **sem** seed permanente, **sem** bypass de RLS, **sem** service role no frontend e **sem** abrir execução real de agentes. |
| **Readiness de entrada** | `LANE_5_AGENT_OPERATIONS_LAYER_CLOSED_NO_MEMBERSHIP_VALIDATED` · `LANE_6_PRODUCT_SCOPE_CANDIDATE_REVIEW_CREATED_NOT_OPENED` |
| **Readiness esperado de saída** | `LANE_6_TENANT_BOOTSTRAP_MEMBERSHIP_ACTIVATION_CLOSED` (token provisório; renomeável por decisão humana no closure gate da Lane 6) |
| **Readiness desta task** | `LANE_6_TENANT_BOOTSTRAP_EXECUTION_PROGRAM_CREATED_NOT_OPENED` |

### O que a Lane 6 deve tornar possível

Ao final da Lane 6, deve ser possível:

1. **Habitar o tenant boundary** — existir **um** tenant real e **um** membership real
   ligando o operador validado a ele, criados por caminho governado e **reversível**.
2. **Exercitar `tenant_found` real** — o cockpit (já implementado na Lane 5) renderiza, em
   runtime e com **dado real**, o estado `tenant_found` ("Operação de {nome do tenant}"),
   com a base agentic ainda vazia/honesta.
3. **Provar o caminho de escrita governado** — existir uma **policy de escrita mínima**
   (revisada) e um procedimento de ativação **manual humano** com **rollback explícito**,
   sem service role no frontend e sem seed permanente.

A Lane 6 **prepara o boundary habitado**; ela **não** entrega agentes operando. É a
transição de *base operacional supervisionável* (Lane 5) para *boundary habitado e
exercitado* — o degrau anterior à operação agentic real em lanes futuras.

---

## 2. Product Objective

### Por que tenant/membership real é o próximo passo antes de agentes reais
Configurar e operar agentes institucionais exige que o operador **pertença** a um tenant
sob um membership governado — é o membership que determina o que ele pode ver, aprovar e
operar (PRD §18 + patch). Hoje o operador está perpetuamente em `no_membership`: o
boundary é **legível**, mas **não habitável**. Sem um tenant/membership real, o caminho
`tenant_found` nunca é exercitado e não há fronteira de responsabilidade onde agentes
possam existir. A Lane 6 fecha essa lacuna **antes** de qualquer execução agentic.

### Exercitar `tenant_found` real
O objetivo verificável é **exercitar `tenant_found` em runtime com dado real** — o que a
Lane 5 apenas desenhou. Isso comprova que a leitura RLS, a UI e o boundary funcionam de
ponta a ponta com um tenant habitado, mantendo a honestidade (base agentic vazia, sem
dado inventado).

### Caminho governado, reversível e auditável
A ativação deve ser **governada** (gates humanos explícitos por etapa), **reversível**
(todo SQL com rollback documentado; sem seed permanente), e **auditável** (1 evidence por
batch real registrando SQL planejado, SQL executado pelo humano, rollback, revisão
Auth/RLS, validação runtime e ausência de service role/frontend bypass). O baseline limpo
(0 tenants, 0 memberships) é tratado como estado a que se pode **retornar**.

---

## 3. Non-Goals (explícitos)

A Lane 6 **NÃO**:

- cria **agentes reais**;
- cria **subagents executáveis**;
- cria **MCP** ou integração MCP;
- cria **runner**, orquestrador, scheduler ou pipeline;
- cria **UI self-service** de criação de tenant (signup→tenant aberto);
- cria **seed permanente** ou dado fictício irreversível;
- usa **service role no frontend**;
- cria **hierarquia complexa de papéis/permissões** (apenas o mínimo do membership);
- abre **execução automática de agentes**;
- transforma o tenant bootstrap em **onboarding comercial completo** (billing, dashboard,
  CRUD, perfis, convites em massa).

Tudo acima permanece diferido para lanes futuras, cada uma com seu próprio gate humano.

---

## 4. Agent Roles Ativados

Seis papéis. Diferente da Lane 5, o **Backend/Supabase Planner é ativado** (há policy de
escrita e SQL de ativação a planejar). Cada papel segue o template do
[`agentic-execution-operating-model-v1.md`](../agentic-execution-operating-model-v1.md) §3.

### 4.1 Product Architect
- **Responsabilidade:** traduzir o objetivo da Lane 6 em superfície de produto e Definição
  de Concluído; decidir o que é "tenant bootstrap mínimo" sem virar onboarding.
- **Contexto mínimo:** este programa, revisão de escopo (`94d7ec9`), PRD (§2, §8, §18 +
  patch), closure gate da Lane 5, mapa operacional.
- **Output esperado:** definição da superfície (Batch 6.1), Definição de Concluído da
  lane, lista ordenada de batches candidatos.
- **Limites:** não escreve em `platform/`, `sql/` (execução), evidence (execução) nem no
  mapa (fora de fechamento).
- **Handoff:** entrega ao Execution Coordinator; consulta o Evidence Auditor sobre estado
  real (baseline 0/0).

### 4.2 Execution Coordinator
- **Responsabilidade:** quebrar o programa em batches executáveis, sequenciar papéis,
  impedir microtask/over-documentação; garantir ordem plano→gate→execução manual→revisão→
  evidence.
- **Contexto mínimo:** programa da Lane 6, packs existentes, mapa, evidence da Lane 5.
- **Output esperado:** definição de cada batch (objetivo, passos, resultado esperado,
  papéis, gate aplicável) em `packs/`; ordem dos batches.
- **Limites:** não escreve em `platform/`, `sql/`, closure gates; não abre lane; não
  executa SQL.
- **Handoff:** despacha Backend/Supabase Planner, Auth/RLS Reviewer, UX/Cockpit Reviewer;
  aciona o Evidence Auditor ao fim do batch.

### 4.3 Backend/Supabase Planner  *(ativado nesta lane)*
- **Responsabilidade:** **planejar** (não executar) o SQL mínimo de ativação — policy de
  escrita mínima (INSERT) e a criação de 1 tenant + 1 membership do operador validado —
  **com rollback explícito** e sem seed permanente.
- **Contexto mínimo:** schema atual de `tenants`/`tenant_memberships`, policies SELECT da
  Lane 3 (`tenants_select_member`, `memberships_select_own`), plano SQL manual existente
  (`sql/yzi-os-manual-supabase-sql-plan-v1.md`), evidence da Lane 3.
- **Output esperado:** **plano SQL** em `docs/specs/implementation/sql/` com: DDL/DML
  mínimos, policy de escrita restrita a `auth.uid()`, **bloco de rollback**, critérios de
  verificação. **Nenhum SQL é executado pelo Planner.**
- **Limites:** **não executa SQL**, não usa MCP, não usa service role, não cria seed
  permanente, não escreve em `platform/`; não imprime secret/token/cookie.
- **Handoff:** entrega o plano ao Auth/RLS Reviewer (revisão da fronteira de escrita) e ao
  humano (execução manual sob gate); reporta ao Evidence Auditor.

### 4.4 Auth/RLS Reviewer
- **Responsabilidade:** revisar que a **policy de escrita** preserva o tenant boundary e o
  menor privilégio (sem escalonamento: o operador não pode inserir membership em tenant
  alheio nem auto-conceder papel elevado), e que há **reversibilidade** — sem alterar nada
  (read-only).
- **Contexto mínimo:** plano SQL do Planner, policies SELECT existentes,
  `platform/src/lib/auth/`, `tenant-context.ts`, `proxy.ts`.
- **Output esperado:** parecer (aprovado/bloqueado + motivo) como seção do evidence do
  batch; checklist de boundary e de rollback.
- **Limites:** não escreve em `platform/`/`sql/`; não executa SQL/MCP; não usa service
  role.
- **Handoff:** parecer "bloqueado" interrompe o batch até decisão humana; reporta ao
  Coordinator e ao Evidence Auditor.

### 4.5 UX/Cockpit Reviewer
- **Responsabilidade:** garantir que o `tenant_found` exercitado é **honesto** — mostra o
  nome real do tenant, base agentic ainda vazia, **sem** `id`/`slug` cru como produto,
  **sem** dado inventado, **sem** crash/loop/overlay; cockpit não vira console técnico.
- **Contexto mínimo:** `platform/src/app/cockpit/page.tsx` (já implementado), logs do dev
  server, evidence.
- **Output esperado:** parecer de UX (aprovado/bloqueado + observações) baseado em
  validação runtime observada (logs + observação humana no navegador).
- **Limites:** nenhuma escrita em `platform/`; sem SQL/MCP; nunca imprime
  secrets/tokens/cookies/OAuth `code`.
- **Handoff:** bloqueio de UX trava o fechamento do batch; reporta ao Coordinator e ao
  Evidence Auditor.

### 4.6 Evidence Auditor
- **Responsabilidade:** consolidar **um** evidence por batch concluído, auditável e curto;
  confirmar fronteiras preservadas e **reversibilidade** — sem inventar conclusão.
- **Contexto mínimo:** todos os pareceres e saídas verificadas do batch (SQL planejado,
  SQL executado pelo humano, rollback, revisões, runtime).
- **Output esperado:** evidence consolidado em `evidence/`, com readiness statement,
  validações, confirmações de não-execução (service role/frontend bypass ausentes) e gaps.
- **Limites:** não escreve em `platform/`/`sql/`/specs/mapa (fora de fechamento); não
  executa nada; não fecha lane.
- **Handoff:** reporta ao Product Architect/Coordinator para decisão do próximo batch ou
  fechamento.

---

## 5. Batches Propostos (planejamento seriado — NÃO execução)

> Estes batches são **plano**. Nenhum é executado nesta task. Cada um, quando a Lane 6
> estiver aberta, exige a(s) frase(s) de gate do(s) papel(éis) que toca limites (seção 8).

### Batch 6.1 — Product definition for tenant bootstrap
- **Papel principal:** Product Architect.
- **Objetivo:** definir, em produto, o que é "tenant bootstrap mínimo" (1 tenant + 1
  membership do operador) e a Definição de Concluído da lane, sem virar onboarding.
- **Toca limites?** Não (texto de spec). **Handoff:** → Coordinator (6.2).

### Batch 6.2 — SQL/manual activation plan for 1 tenant + 1 membership
- **Papéis:** Execution Coordinator → Backend/Supabase Planner.
- **Objetivo:** **planejar** o SQL mínimo (policy de escrita restrita + INSERT de 1 tenant
  + 1 membership), com **rollback explícito**, em `sql/`. **Nenhuma execução.**
- **Toca limites?** **Sim** — preparo de plano SQL (G6). Execução é ação humana (G7).
- **Handoff:** → Auth/RLS Reviewer (6.3).

### Batch 6.3 — Auth/RLS review plan for write boundary and reversibility
- **Papel principal:** Auth/RLS Reviewer.
- **Objetivo:** plano de revisão que verifica policy de escrita restrita a `auth.uid()`,
  ausência de escalonamento, isolamento (P10) preservado e rollback viável.
- **Toca limites?** Não (read-only). **Handoff:** → humano + Evidence Auditor.

### Batch 6.4 — Human SQL execution evidence plan
- **Papéis:** humano (executor) → Evidence Auditor.
- **Objetivo:** plano de como o **humano executa o SQL manualmente** no Supabase SQL
  Editor (sob G7), captura resultado e confirma rollback disponível; o que o evidence deve
  registrar. **O agente não executa SQL.**
- **Toca limites?** **Sim** — execução SQL manual humana (G7). **Handoff:** → 6.5.

### Batch 6.5 — Runtime validation of `tenant_found` in cockpit
- **Papéis:** humano (navegador) + UX/Cockpit Reviewer.
- **Objetivo:** com o tenant/membership reais ativos, validar em runtime que o cockpit
  renderiza `tenant_found` honesto; registrar achados.
- **Toca limites?** Validação runtime (G8 de validação). **Handoff:** → Evidence Auditor.

### Batch 6.6 — Closure/evidence plan
- **Papéis:** Evidence Auditor → Product Architect.
- **Objetivo:** consolidar evidence final e preparar o closure gate da Lane 6 (incluindo
  decisão de **reverter** ou **manter** o tenant/membership de ativação).
- **Toca limites?** Evidence + closure (gates próprios). **Handoff:** → fechamento.

---

## 6. File and Data Access Boundaries

- **`platform/` não deve ser alterado inicialmente** — o `tenant_found` já está
  implementado (Lane 5, `64d1c61`). Só se torna candidato a alteração se um refino for
  exigido, sob gate de Implementer com lista exata de arquivos.
- **SQL só como PLANO** em `sql/` para execução **humana manual**; o agente nunca executa
  SQL.
- **Nenhum secret, token, cookie ou OAuth `code`** é lido ou impresso por qualquer papel.
- **Service role proibido no frontend** (e em qualquer ponto de `platform/`); apenas
  valores públicos (`NEXT_PUBLIC_SUPABASE_URL` + anon key).
- **MCP proibido** sem gate específico.
- **Tenant/membership reais só podem ser criados por ação humana manual e reversível**
  (no SQL Editor), nunca pelo agente, nunca via frontend, nunca via service role.

---

## 7. SQL Policy

- **Plano SQL ≠ execução SQL.** O agente (Backend/Supabase Planner) **planeja**; o
  **humano executa** manualmente no Supabase SQL Editor.
- **Toda execução SQL é manual pelo humano**, sob o gate G7, jamais pelo agente, jamais
  via MCP nesta lane.
- **Todo SQL deve ter rollback explícito** documentado no plano (como desfazer a policy de
  escrita, o tenant e o membership criados).
- **Nenhum seed permanente** — a ativação é tratada como reversível; o baseline 0/0 é um
  estado de retorno.
- **Nenhum dado fictício irreversível** — nada que não possa ser desfeito de forma
  documentada.

---

## 8. Gates

| # | Gate | Frase literal (humano) | Desbloqueia |
|---|---|---|---|
| G0 | **Aprovar este Execution Program** | aprovação humana explícita deste documento | tornar o programa elegível a ativação |
| G1 | **Abrir a Lane 6** | `AUTORIZO ABERTURA DA LANE 6 — TENANT BOOTSTRAP / MEMBERSHIP ACTIVATION LAYER` | promoção do programa a ativo; criação de packs (não desbloqueia código/SQL/MCP) |
| G2 | **Promover o programa** | `AUTORIZO O PRODUCT ARCHITECT A DEFINIR O PROGRAMA DA LANE 6` | Product Architect detalhar DoD e batches |
| G3 | **Abrir um batch** | `AUTORIZO O EXECUTION COORDINATOR A ABRIR O BATCH <id> DA LANE 6` | Coordinator despachar papéis do batch |
| G4 | **Preparar plano SQL** | `AUTORIZO O PLANNER A PREPARAR O PLANO SQL DO BATCH <id> DA LANE 6, COM ROLLBACK EXPLÍCITO, SEM SEED PERMANENTE` | Backend/Supabase Planner escrever o plano SQL em `sql/` |
| G5 | **Revisar Auth/RLS** | `AUTORIZO O AUTH/RLS REVIEWER A REVISAR O BATCH <id> DA LANE 6` | parecer read-only sobre fronteira de escrita e rollback |
| G6 | **Execução SQL manual humana** | `AUTORIZO A EXECUÇÃO MANUAL DO PLANO SQL DO BATCH <id> DA LANE 6 NO SUPABASE SQL EDITOR, COM ROLLBACK DISPONÍVEL, SEM SERVICE ROLE NO FRONTEND` | execução é **ação humana** no SQL Editor (o agente não executa) |
| G7 | **Validar runtime `tenant_found`** | `AUTORIZO A VALIDAÇÃO RUNTIME DO tenant_found DO BATCH <id> DA LANE 6` | observação runtime/browser humana do estado real |
| G8 | **Consolidar evidence** | `AUTORIZO O EVIDENCE AUDITOR A CONSOLIDAR O EVIDENCE DO BATCH <id> DA LANE 6` | 1 evidence por batch concluído e verificado |
| G9 | **Closure da Lane 6** | `AUTORIZO O PRODUCT ARCHITECT A CRIAR O CLOSURE GATE DA LANE 6 E ATUALIZAR O MAPA OPERACIONAL` | fechamento documental + atualização do mapa |
| G+ | **Alterar `platform/`** (se necessário) | `AUTORIZO O IMPLEMENTER A ALTERAR platform/ NOS ARQUIVOS <lista> NO BATCH <id> DA LANE 6, SEM SQL/MCP/SERVICE ROLE` | escrita de código apenas se um refino de cockpit for exigido |

Frases insuficientes para qualquer gate: "vamos", "segue", "manda", "próximo", "ok",
"aprovado", "pode continuar", "faça", "sim", "bora", "continue".

---

## 9. Expected Evidence

- **Evidência só no final de um batch real**, executado e verificado — nunca por
  microação.
- **Um** evidence consolidado por batch, escrito pelo Evidence Auditor, registrando, no
  mínimo (conforme o batch):
  - **SQL planejado** (referência ao plano em `sql/`);
  - **SQL executado pelo humano** (resultado observado, sem secret/token);
  - **rollback** (disponível e/ou aplicado);
  - **revisão Auth/RLS** (parecer, fronteira de escrita, ausência de escalonamento);
  - **runtime `tenant_found`** (observação humana do cockpit com dado real);
  - **ausência de service role / frontend bypass**.
- **A Lane 6 só será fechada** quando houver ao menos um batch executado, verificado e
  auditado que entregue o boundary habitado e `tenant_found` exercitado, com fechamento
  sob closure gate próprio (Product Architect + frase humana).
- Nenhum evidence de execução é criado nesta task de programa.

---

## 10. Human Authorization Phrase (abertura futura da Lane 6)

A frase **literal** que abre a Lane 6 (token provisório, renomeável por decisão humana):

> `AUTORIZO ABERTURA DA LANE 6 — TENANT BOOTSTRAP / MEMBERSHIP ACTIVATION LAYER`

Sequência de ativação: **(1)** aprovação humana deste Execution Program (G0) → **(2)**
escrita da frase acima (G1), que **abre a Lane 6** e promove este programa a ativo →
**(3)** detalhamento e abertura de batches sob seus próprios gates (G2–G9). Escrever a
frase **não** desbloqueia, por si, código, SQL, MCP ou alteração de `platform/` — cada um
continua exigindo o gate correspondente.

---

## Confirmação de Não-Execução

Este documento é o **programa de execução proposto** da Lane 6. **Não abre a Lane 6**, não
executa código, não executa SQL, não usa MCP, não modifica `platform/`, não cria
tenant/membership/seed, não cria policy de escrita, não cria runner/subagent executável,
não atualiza o mapa operacional como Lane 6 aberta e não cria evidence de execução.
Qualquer ação concreta exige a frase de autorização humana do gate correspondente
(seção 8).

---

## Final Status

`LANE_6_TENANT_BOOTSTRAP_EXECUTION_PROGRAM_CREATED_NOT_OPENED`

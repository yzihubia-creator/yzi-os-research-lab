# Lane 7 — Operator Session & Control Layer: Execution Program v1

Status: **proposta — criado, NÃO aberto**
Modo: Execution Program Mode (sobre o SDD Lite / Execution Pack Mode)
Projeto Supabase: `thwsltjcjrvtidhnfukc`
Data: 2026-06-12

> Este documento é o **programa de execução proposto** da Lane 7. Ele **não abre a
> Lane 7**, não executa código, não modifica `platform/`, não roda build/lint, não executa
> SQL, não altera schema, não altera tenant/membership, não cria policy, não cria role
> model, não cria MCP/agente/registry/runner/tools/memória, não atualiza o mapa operacional
> como Lane 7 aberta e não cria evidence de execução. Torna-se **programa ativo** apenas
> depois que o humano escrever a frase de abertura da Lane 7 (seção 10). Padrão idêntico ao
> usado nas Lanes 5 e 6, cujos programas foram criados como proposta documental antes do
> gate. Fundamenta-se na revisão de escopo candidata
> [`lane-7-product-scope-candidate-review-v1.md`](lane-7-product-scope-candidate-review-v1.md)
> e no closure gate da Lane 6
> [`lane-6-tenant-bootstrap-membership-activation-closure-gate-v1.md`](lane-6-tenant-bootstrap-membership-activation-closure-gate-v1.md).

---

## 1. Lane Identity

| Campo | Valor |
|---|---|
| **Nome** | Lane 7 — Operator Session & Control Layer |
| **Objetivo de produto** | Fechar o **controle básico de sessão do operador** dentro do cockpit: permitir que o operador autenticado **encerre a sessão com segurança (logout)** e retorne ao fluxo de **login/re-login**, exibindo um **estado de sessão/identidade operacional honesto** — **sem** alterar dados de tenant/membership, **sem** criar agente real e **sem** expandir o escopo para registry/tools/memória. |
| **Readiness de entrada** | `LANE_6_TENANT_BOOTSTRAP_MEMBERSHIP_ACTIVATION_CLOSED_TENANT_FOUND_VALIDATED` · `LANE_7_PRODUCT_SCOPE_CANDIDATE_REVIEW_CREATED_NOT_OPENED` |
| **Readiness esperado de saída** | `LANE_7_OPERATOR_SESSION_CONTROL_CLOSED_LOGOUT_VALIDATED` (token provisório; renomeável por decisão humana no closure gate da Lane 7) |
| **Readiness desta task** | `LANE_7_OPERATOR_SESSION_CONTROL_EXECUTION_PROGRAM_CREATED_NOT_OPENED` |

### O que a Lane 7 deve tornar possível

Ao final da Lane 7, deve ser possível:

1. **Encerrar a sessão** — o operador autenticado dispara um **logout** a partir do
   `/cockpit`, a sessão é encerrada com segurança (sign-out via cliente de auth, valores
   públicos) e ele é redirecionado ao login.
2. **Re-autenticar** — o operador volta ao login, refaz o Google OAuth e retorna a
   `tenant_found` com o mesmo tenant real (`YZI OS — Operação Inicial`), sem estado
   corrompido.
3. **Ler o estado de sessão de forma honesta** — o cockpit exibe identidade operacional,
   tenant ativo e papel (`viewer`) como **estado seguro e legível**, derivado da sessão,
   sem dado inventado.

A Lane 7 **torna o cockpit operável com segurança de ponta a ponta** (entra-se **e** sai-se
de forma governada). Ela **não** entrega agentes, registry, tools ou memória — é o degrau de
**controle de sessão do operador humano** antes de qualquer operação agentic real.

---

## 2. Product Objective

### Por que controle de sessão é o próximo passo antes de agentes reais
Hoje o operador **entra** no cockpit (Google OAuth → `/cockpit` protegido → `tenant_found`
real), mas **não consegue sair** de forma governada: não há logout, não há encerramento
seguro, não há estado operacional explícito. Confiar controles agentic a uma sessão que não
se sabe encerrar é um *smell* de segurança. A Lane 7 fecha esse gap — sinalizado como
remanescente **tanto no closure da Lane 5 quanto no da Lane 6** ("Lane futura de ações de
cockpit") — **antes** de qualquer superfície de agente.

### Incremento verificável
O objetivo verificável é o **ciclo `tenant_found` → logout → login → re-login →
`tenant_found`** observado em runtime/browser por humano, sem crash/loop/overlay e sem
vazamento de token/cookie/OAuth `code`. É frontend-only: nenhuma escrita em dados de
negócio, nenhuma policy nova, nenhuma alteração de tenant/membership.

### Menor privilégio e honestidade preservados
O logout usa **apenas valores públicos** (`NEXT_PUBLIC_SUPABASE_URL` + anon key) via cliente
de auth; **sem service role**, **sem SQL**, **sem MCP**. A base agentic permanece
**vazia/honesta**. O papel `viewer` e o tenant real **não são alterados** — apenas a sessão
do operador é controlada.

---

## 3. Non-Goals (explícitos)

A Lane 7 **NÃO**:

- cria **agente real** nem subagent executável;
- cria **registry** (mesmo shell/placeholder);
- cria **MCP** ou integração MCP;
- cria **runner**, orquestrador, scheduler ou pipeline;
- cria **tools** ou camada de **memória**;
- **altera schema** de banco;
- cria ou executa **SQL**;
- **altera tenant/membership** existentes (nem cria novos);
- cria **policy** de escrita;
- cria **role model** / hierarquia de papéis além do `viewer` já existente;
- usa **service role no frontend** (ou em qualquer ponto de `platform/`);
- transforma o cockpit em **painel administrativo amplo** (gestão multi-sessão,
  multi-dispositivo, SSO além do Google OAuth, gestão de conta/perfil, CRUD de negócio).

Tudo acima permanece diferido para lanes futuras, cada uma com seu próprio gate humano.

---

## 4. Agent Roles Ativados

Seis papéis. Diferente da Lane 6, o **Backend/Supabase Planner NÃO é ativado** (não há SQL,
schema nem policy nesta lane); em compensação o **Frontend Platform Implementer é o papel
central** (há código de logout/sessão a implementar, sob gate). Cada papel segue o template
do [`agentic-execution-operating-model-v1.md`](../agentic-execution-operating-model-v1.md) §3.

### 4.1 Product Architect
- **Responsabilidade:** traduzir o objetivo da Lane 7 em superfície de produto e Definição
  de Concluído; decidir o que é "controle básico de sessão" sem virar painel administrativo.
- **Contexto mínimo:** este programa, revisão de escopo candidata da Lane 7, closure gate da
  Lane 6, mapa operacional.
- **Output esperado:** definição da superfície (Batch 7.1), Definição de Concluído da lane,
  lista ordenada de batches candidatos.
- **Limites:** não escreve em `platform/`, `sql/`, evidence (execução) nem no mapa (fora de
  fechamento); não abre lane.
- **Handoff:** entrega ao Execution Coordinator; consulta o Evidence Auditor sobre o estado
  real (tenant/membership ativos, `tenant_found` validado).

### 4.2 Execution Coordinator
- **Responsabilidade:** quebrar o programa em batches executáveis, sequenciar papéis,
  impedir microtask/over-documentação; garantir ordem plano→gate→implementação→revisão→
  runtime→evidence.
- **Contexto mínimo:** programa da Lane 7, packs existentes, mapa, evidence da Lane 6.
- **Output esperado:** definição de cada batch (objetivo, passos, resultado esperado,
  papéis, gate aplicável) em `packs/`; ordem dos batches.
- **Limites:** não escreve em `platform/`, `sql/`, closure gates; não abre lane; não executa
  código/build.
- **Handoff:** despacha Frontend Platform Implementer, Auth/RLS Reviewer, UX/Cockpit
  Reviewer; aciona o Evidence Auditor ao fim do batch.

### 4.3 Frontend Platform Implementer  *(papel central nesta lane)*
- **Responsabilidade:** implementar o incremento mínimo de **logout/encerramento de sessão**
  e o estado de sessão/identidade no cockpit — único papel com escrita em código, **somente**
  sob gate, com **lista exata de arquivos**.
- **Contexto mínimo:** batch autorizado + arquivos permitidos; `platform/src/app/cockpit/`,
  `platform/src/app/auth/`, `platform/src/lib/` (auth/cliente), guia local do Next em
  `platform/node_modules/next/dist/docs/`. **Não** lê `.env.local`/secrets.
- **Output esperado:** ação de **sign-out** (cliente de auth / server action) + controle de
  logout no cockpit + redirecionamento ao login, com `npm run lint` e `npm run build`
  **verdes** como verificação (executados sob o gate da lane aberta, não nesta task).
- **Limites:** **apenas** os arquivos de `platform/` listados no gate; **sem SQL, sem MCP,
  sem service role**; não instala dependência sem menção explícita no gate; não toca
  `.env.local`; não altera tenant/membership; nunca imprime token/cookie/OAuth `code`.
- **Handoff:** entrega ao Auth/RLS Reviewer e ao UX/Cockpit Reviewer; reporta ao Evidence
  Auditor.

### 4.4 Auth/RLS Reviewer
- **Responsabilidade:** revisar que o **encerramento de sessão** usa apenas valores públicos,
  **não** toca service role, **não** vaza token/cookie, e que sign-out + redirecionamento
  preservam o tenant boundary e o menor privilégio — sem alterar nada (read-only).
- **Contexto mínimo:** incremento do Implementer, `platform/src/lib/auth/`, `proxy.ts`,
  `tenant-context.ts`, rota(s) de auth.
- **Output esperado:** parecer (aprovado/bloqueado + motivo) como seção do evidence do
  batch; checklist de ausência de service role, ausência de leitura de token/cookie crus, e
  de sessão encerrada sem resíduo.
- **Limites:** não escreve em `platform/`/`sql/`; não executa SQL/MCP; não usa service role.
- **Handoff:** parecer "bloqueado" interrompe o batch até decisão humana; reporta ao
  Coordinator e ao Evidence Auditor.

### 4.5 UX/Cockpit Reviewer
- **Responsabilidade:** garantir que o ciclo de logout/login é **honesto** e robusto — botão
  de sair claro, redirecionamento correto, estado de sessão/identidade legível, **sem**
  crash/loop/overlay no logout, **sem** estado corrompido no re-login; cockpit não vira
  painel administrativo.
- **Contexto mínimo:** `platform/src/app/cockpit/page.tsx`, rota(s) de login/auth, logs do
  dev server, evidence.
- **Output esperado:** parecer de UX (aprovado/bloqueado + observações) baseado em validação
  runtime observada (logs + observação humana no navegador do ciclo logout→login→re-login).
- **Limites:** nenhuma escrita em `platform/`; sem SQL/MCP; nunca imprime
  secrets/tokens/cookies/OAuth `code`.
- **Handoff:** bloqueio de UX trava o fechamento do batch; reporta ao Coordinator e ao
  Evidence Auditor.

### 4.6 Evidence Auditor
- **Responsabilidade:** consolidar **um** evidence por batch concluído, auditável e curto;
  confirmar fronteiras preservadas (frontend-only, sem service role, sem SQL, base agentic
  vazia) — sem inventar conclusão.
- **Contexto mínimo:** todos os pareceres e saídas verificadas do batch (lint/build,
  revisões Auth/RLS e UX, observação runtime do ciclo de sessão).
- **Output esperado:** evidence consolidado em `evidence/`, com readiness statement,
  validações, confirmações de não-execução (service role/SQL/MCP ausentes; tenant/membership
  intactos) e gaps.
- **Limites:** não escreve em `platform/`/`sql/`/specs/mapa (fora de fechamento); não executa
  nada; não fecha lane.
- **Handoff:** reporta ao Product Architect/Coordinator para decisão do próximo batch ou
  fechamento.

---

## 5. Batches Propostos (planejamento seriado — NÃO execução)

> Estes batches são **plano**. Nenhum é executado nesta task. Cada um, quando a Lane 7
> estiver aberta, exige a(s) frase(s) de gate do(s) papel(éis) que toca limites (seção 8).

### Batch 7.1 — Product definition for operator session controls
- **Papel principal:** Product Architect.
- **Objetivo:** definir, em produto, o que é "controle básico de sessão do operador"
  (logout + re-login + estado de sessão honesto) e a Definição de Concluído da lane, sem
  virar painel administrativo.
- **Toca limites?** Não (texto de spec). **Handoff:** → Coordinator (7.2).

### Batch 7.2 — Minimal logout/session UX implementation plan
- **Papéis:** Execution Coordinator → (consulta) Frontend Platform Implementer.
- **Objetivo:** **planejar** o incremento mínimo de UI/fluxo: onde fica o controle de
  logout, qual mecanismo de sign-out (cliente de auth / server action), redirecionamento ao
  login, estado de sessão exibido — com **lista candidata exata de arquivos** de
  `platform/`. **Nenhuma escrita de código.**
- **Toca limites?** Não (plano em `packs/`). **Handoff:** → 7.3.

### Batch 7.3 — Minimal implementation in platform/ (logout/session)
- **Papel principal:** Frontend Platform Implementer.
- **Objetivo:** implementar o **mínimo** — ação de sign-out + controle de logout no cockpit +
  redirecionamento ao login + leitura honesta do estado de sessão; `lint` + `build` verdes.
- **Toca limites?** **Sim** — escrita em `platform/` (G4), com **lista exata de arquivos**,
  **sem SQL/MCP/service role**. **Handoff:** → 7.4.

### Batch 7.4 — Auth/RLS + UX review of the session increment
- **Papéis:** Auth/RLS Reviewer + UX/Cockpit Reviewer.
- **Objetivo:** revisar que o encerramento de sessão é seguro (valores públicos, sem service
  role, sem vazamento de token/cookie, boundary preservado) e que a UX do ciclo é honesta e
  robusta. **Read-only.**
- **Toca limites?** Não (read-only). **Handoff:** → 7.5.

### Batch 7.5 — Runtime validation of logout → login → re-login
- **Papéis:** humano (navegador) + UX/Cockpit Reviewer.
- **Objetivo:** validar em runtime o ciclo `tenant_found` → logout → login → re-login →
  `tenant_found`, sem crash/loop/overlay e sem token/cookie/OAuth `code` impresso; registrar
  achados.
- **Toca limites?** Validação runtime (gate de validação). **Handoff:** → Evidence Auditor.

### Batch 7.6 — Closure/evidence plan
- **Papéis:** Evidence Auditor → Product Architect.
- **Objetivo:** consolidar o evidence final e preparar o closure gate da Lane 7 (confirmando
  tenant/membership intactos e base agentic ainda vazia).
- **Toca limites?** Evidence + closure (gates próprios). **Handoff:** → fechamento.

---

## 6. File and Data Access Boundaries

- **`platform/` só é alterado no Batch 7.3**, sob gate de Implementer com **lista exata de
  arquivos** (candidatos: `platform/src/app/cockpit/page.tsx`, rota/ação de auth em
  `platform/src/app/auth/`, helper de cliente/sessão em `platform/src/lib/`). A lista final é
  fixada na frase de gate.
- **Nenhum SQL, schema, tenant/membership, policy ou role model** é tocado nesta lane.
- **Nenhum secret, token, cookie ou OAuth `code`** é lido ou impresso por qualquer papel;
  `.env.local` não é lido nem escrito.
- **Service role proibido** em `platform/` e em qualquer ponto; apenas valores públicos
  (`NEXT_PUBLIC_SUPABASE_URL` + anon key) via cliente de auth.
- **MCP proibido** sem gate específico (não previsto nesta lane).
- **Base agentic permanece vazia** — nenhum agente/registry/tool/memória é criado.

---

## 7. Definição de Concluído (DoD)

A Lane 7 está concluída quando, com pelo menos um batch executado, verificado e auditado:

1. o operador autenticado **encerra a sessão** a partir do `/cockpit` e é **redirecionado ao
   login**;
2. o operador **re-autentica** (Google OAuth) e retorna a **`tenant_found`** com o mesmo
   tenant real, sem estado corrompido;
3. o cockpit exibe **estado de sessão/identidade operacional honesto** (operador, tenant
   ativo, papel `viewer`);
4. `lint` e `build` **verdes**; revisões **Auth/RLS** e **UX/Cockpit** aprovadas;
5. **tenant/membership intactos**, **base agentic ainda vazia**, **sem service role**, **sem
   SQL**, **sem MCP**;
6. ciclo validado em **runtime/browser por humano**, sem crash/loop/overlay e sem vazamento
   de token/cookie/OAuth `code`;
7. **1 evidence consolidado** por batch real e **closure gate** próprio (Product Architect +
   frase humana).

---

## 8. Gates

| # | Gate | Frase literal (humano) | Desbloqueia |
|---|---|---|---|
| G0 | **Aprovar este Execution Program** | aprovação humana explícita deste documento | tornar o programa elegível a ativação |
| G1 | **Abrir a Lane 7** | `AUTORIZO ABERTURA DA LANE 7 — OPERATOR SESSION & CONTROL LAYER` | promoção do programa a ativo; criação de packs (não desbloqueia código/SQL/MCP) |
| G2 | **Promover o programa** | `AUTORIZO O PRODUCT ARCHITECT A DEFINIR O PROGRAMA DA LANE 7` | Product Architect detalhar DoD e batches |
| G3 | **Abrir um batch** | `AUTORIZO O EXECUTION COORDINATOR A ABRIR O BATCH <id> DA LANE 7` | Coordinator despachar papéis do batch |
| G4 | **Alterar `platform/`** | `AUTORIZO O IMPLEMENTER A ALTERAR platform/ NOS ARQUIVOS <lista> NO BATCH <id> DA LANE 7, SEM SQL/MCP/SERVICE ROLE` | Frontend Implementer escrever o incremento de logout/sessão + rodar lint/build |
| G5 | **Revisar Auth/RLS** | `AUTORIZO O AUTH/RLS REVIEWER A REVISAR O BATCH <id> DA LANE 7` | parecer read-only sobre encerramento de sessão e boundary |
| G6 | **Validar UX/Cockpit** | `AUTORIZO O UX/COCKPIT REVIEWER A VALIDAR O BATCH <id> DA LANE 7` | parecer de UX do ciclo de sessão |
| G7 | **Validar runtime do ciclo de sessão** | `AUTORIZO A VALIDAÇÃO RUNTIME DO CICLO LOGOUT/LOGIN DO BATCH <id> DA LANE 7` | observação runtime/browser humana do ciclo logout→login→re-login |
| G8 | **Consolidar evidence** | `AUTORIZO O EVIDENCE AUDITOR A CONSOLIDAR O EVIDENCE DO BATCH <id> DA LANE 7` | 1 evidence por batch concluído e verificado |
| G9 | **Closure da Lane 7** | `AUTORIZO O PRODUCT ARCHITECT A CRIAR O CLOSURE GATE DA LANE 7 E ATUALIZAR O MAPA OPERACIONAL` | fechamento documental + atualização do mapa |

Frases insuficientes para qualquer gate: "vamos", "segue", "manda", "próximo", "ok",
"aprovado", "pode continuar", "faça", "sim", "bora", "continue".

---

## 9. Expected Evidence / Validações Esperadas

- **Evidência só no final de um batch real**, executado e verificado — nunca por microação.
- **Um** evidence consolidado por batch, escrito pelo Evidence Auditor, registrando, no
  mínimo (conforme o batch):
  - **incremento implementado** (descrição do logout/sessão; lista de arquivos alterados);
  - **`lint` + `build` verdes** (resultado observado);
  - **revisão Auth/RLS** (parecer; ausência de service role; ausência de leitura/vazamento de
    token/cookie; boundary preservado);
  - **revisão UX/Cockpit** (estado honesto; sem crash/loop/overlay);
  - **runtime do ciclo de sessão** (observação humana de `tenant_found` → logout → login →
    re-login → `tenant_found`);
  - **confirmações de não-execução**: tenant/membership intactos, base agentic vazia, sem
    SQL/MCP/service role;
  - **ausência de token/cookie/OAuth `code` versionado** em qualquer evidência.
- **A Lane 7 só será fechada** quando houver ao menos um batch executado, verificado e
  auditado que entregue o ciclo de logout/login funcional, com fechamento sob closure gate
  próprio (Product Architect + frase humana).
- Nenhum evidence de execução é criado nesta task de programa.

---

## 10. Human Authorization Phrase (abertura futura da Lane 7)

A frase **literal** que abre a Lane 7 (token provisório, renomeável por decisão humana):

> `AUTORIZO ABERTURA DA LANE 7 — OPERATOR SESSION & CONTROL LAYER`

Sequência de ativação: **(1)** aprovação humana deste Execution Program (G0) → **(2)**
escrita da frase acima (G1), que **abre a Lane 7** e promove este programa a ativo → **(3)**
detalhamento e abertura de batches sob seus próprios gates (G2–G9). Escrever a frase **não**
desbloqueia, por si, código, SQL, MCP ou alteração de `platform/` — cada um continua exigindo
o gate correspondente (em especial G4 para tocar `platform/`).

---

## Confirmação de Não-Execução

Este documento é o **programa de execução proposto** da Lane 7. **Não abre a Lane 7**, não
implementa código, não modifica `platform/`, não executa build/lint, não cria/executa SQL,
não altera schema, não altera tenant/membership, não cria policy, não cria role model, não
cria MCP/agente/registry/runner/tools/memória, não transforma o cockpit em painel
administrativo, não atualiza o mapa operacional como Lane 7 aberta e não cria evidence de
execução. Qualquer ação concreta exige a frase de autorização humana do gate correspondente
(seção 8).

---

## Final Status

`LANE_7_OPERATOR_SESSION_CONTROL_EXECUTION_PROGRAM_CREATED_NOT_OPENED`

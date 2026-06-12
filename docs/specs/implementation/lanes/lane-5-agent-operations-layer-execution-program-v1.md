# Lane 5 — Agent Operations Layer: Execution Program v1

Status: **proposta — criado, NÃO aberto**
Modo: Execution Program Mode (sobre o SDD Lite / Execution Pack Mode)
Projeto Supabase: `thwsltjcjrvtidhnfukc`
Data: 2026-06-12

> Este documento é o **programa de execução proposto** da Lane 5. Ele **não abre a Lane 5**, não
> executa código, não executa SQL, não usa MCP, não modifica `platform/`, não cria
> tenant/membership/seed e não autoriza nenhuma ação por si só. Torna-se **programa ativo** apenas
> depois que o humano escrever a frase de abertura da Lane 5 (seção 9), conforme o gate definido no
> [`lane-4-cockpit-skeleton-closure-gate-v1.md`](lane-4-cockpit-skeleton-closure-gate-v1.md).
> Padrão idêntico ao usado na Lane 4, cujo programa foi criado como draft documental antes do gate.

---

## 1. Lane Identity

| Campo | Valor |
|---|---|
| **Nome** | Lane 5 — Agent Operations Layer |
| **Objetivo de produto** | Transformar o cockpit autenticado e vazio em uma **primeira camada operacional** onde o operador entende seu vínculo com tenant/membership e enxerga a **base da operação agentic** — sem inventar dados, sem criar tenant real, sem abrir execução técnica de agentes. |
| **Readiness de entrada** | `LANE_4_COCKPIT_SKELETON_CLOSED_DOCUMENTALLY` · `L4_GOOGLE_OAUTH_EMPTY_STATE_VALIDATED` · `YZI_OS_PRD_PRODUCT_CLARITY_PATCH_APPLIED_BEFORE_LANE_5` · `AGENTIC_EXECUTION_OPERATING_MODEL_V1_CREATED` |
| **Readiness esperado de saída** | `LANE_5_AGENT_OPERATIONS_LAYER_CLOSED` (token provisório; renomeável por decisão humana no closure gate da Lane 5) |
| **Readiness desta task** | `LANE_5_AGENT_OPERATIONS_EXECUTION_PROGRAM_CREATED_NOT_OPENED` |

### O que a Lane 5 deve tornar possível

Ao final da Lane 5, o operador autenticado deve, **no cockpit**:

1. **Entender quem ele é na operação** — identidade do operador derivada da sessão (sem inventar perfil).
2. **Entender seu vínculo** — o cockpit explicita o conceito de **membership** e o **tenant boundary**:
   o operador vê honestamente se pertence (ou não) a um tenant e o que isso significa para o que poderá
   ver, aprovar e operar.
3. **Enxergar a base da operação agentic** — uma superfície operacional mínima que **nomeia** a operação
   institucional que virá (onde agentes serão configurados, supervisionados e operados com governança),
   **sem** instanciar agentes, sem dados fabricados, com estado vazio honesto.

A Lane 5 **prepara a superfície**; ela **não** entrega agentes operando. É a transição do *esqueleto
navegável* (Lane 4) para a *base operacional supervisionável* — o degrau anterior à configuração e
operação reais de agentes institucionais em lanes futuras.

---

## 2. Product Objective

### Em termos de operador humano
O operador é quem **define o objetivo do agente, o configura e responde pelo resultado** (PRD §2). Hoje,
ao autenticar, ele chega a um cockpit que apenas diz "você não pertence a nenhum tenant". Isso é honesto,
mas **mudo**: não explica o vínculo, não mostra a operação, não orienta o próximo passo. A Lane 5 dá voz
a essa superfície: o operador passa a **entender seu lugar na operação** antes de qualquer agente existir.

### Papel do cockpit
O cockpit é a **superfície humana de supervisão do operador** — **projeção do estado operacional, nunca
fonte da verdade** (PRD §8, patch de clareza). Na Lane 5 ele lidera pelo **outcome operado** (o que será
supervisionado), não pela arquitetura interna. O cockpit **não pode** virar console técnico genérico
(agents/tools/state expostos): ele mostra a operação e o vínculo, não o diagrama de camadas.

### Papel de tenant / membership
**Tenant** é a partição transversal de isolamento (PRD §18, `P10`). **Membership** é o **vínculo governado
entre operador e tenant** que **determina o que o operador pode ver, aprovar e operar** no cockpit (PRD
§18, patch de clareza). A Lane 5 torna esse vínculo **legível na tela**: o operador entende o boundary
sem que o sistema invente pertencimento. O caminho `tenant_found` é **desenhado**, mas só será exercitado
em runtime com tenant real sob gate humano numa lane futura.

### Por que isso é necessário antes de agentes reais
Configurar e operar agentes institucionais exige primeiro que **a superfície de supervisão exista e seja
governada**: o operador precisa saber *em nome de qual tenant* opera, *sob qual membership* e *o que pode
aprovar*. Abrir agentes sem essa base produziria operação sem fronteira de responsabilidade legível —
exatamente o que a governança do YZI OS recusa. A Lane 5 fecha essa lacuna **antes** de qualquer execução
agentic, honrando o invariante de controlabilidade (PRD §17) e o tenant boundary (PRD §18).

---

## 3. Non-Goals (explícitos)

A Lane 5 **NÃO**:

- cria **agentes reais** (nenhuma instância de agente institucional operando);
- cria **subagents executáveis**;
- cria **MCP** ou qualquer integração MCP;
- cria **runner**, orquestrador, scheduler ou pipeline de execução de agentes;
- cria **tenant real**;
- cria **membership real**;
- cria **seed permanente**;
- cria **policy de escrita** (INSERT/UPDATE/DELETE) sem task específica e gate próprio;
- abre **execução automática de agentes**;
- transforma o **cockpit em console técnico genérico** (exposição de agents/tools/state como UI).

Tudo acima permanece diferido para lanes futuras, cada uma com seu próprio gate humano explícito.

---

## 4. Agent Roles Ativados (segundo o Agentic Execution Operating Model v1)

Seis papéis. O **Backend/Supabase Planner não é ativado** na Lane 5 (não há SQL/RLS/DDL prevista; o
caminho de dados permanece o RLS read-only já existente). Cada papel segue o template do
[`agentic-execution-operating-model-v1.md`](../agentic-execution-operating-model-v1.md) §3.

### 4.1 Product Architect
- **Responsabilidade:** traduzir o objetivo da Lane 5 em superfície de produto e Definição de Concluído;
  decidir o que entra e o que fica fora (especialmente: o que é "base agentic" sem virar agente real).
- **Contexto mínimo que recebe:** este programa, PRD (§2, §8, §18 + patch), revisão de clareza, mapa
  operacional, closure gate da Lane 4.
- **Output esperado:** definição da superfície (Batch 5.1), Definição de Concluído da lane, lista ordenada
  de batches candidatos (sem detalhar implementação).
- **Limites:** não escreve em `platform/`, `sql/`, evidence (execução) nem no mapa (fora de fechamento).
- **Handoff:** entrega ao **Execution Coordinator**; consulta o **Evidence Auditor** sobre estado real.

### 4.2 Execution Coordinator
- **Responsabilidade:** quebrar o programa em batches executáveis, sequenciar papéis, impedir
  microtask/over-documentação.
- **Contexto mínimo que recebe:** programa da Lane 5, packs existentes, mapa, evidence da Lane 4.
- **Output esperado:** definição de cada batch (objetivo, passos, resultado esperado, papéis, gate
  aplicável) em `packs/`; ordem dos batches.
- **Limites:** não escreve em `platform/`, `sql/`, closure gates; não abre lane.
- **Handoff:** despacha **Frontend Implementer** (sob gate) e os **Reviewers**; aciona **Evidence Auditor**
  ao fim do batch.

### 4.3 Frontend Platform Implementer
- **Responsabilidade:** implementar o incremento operador-facing em `platform/` — **único papel com escrita
  em código, e somente sob gate com lista exata de arquivos**.
- **Contexto mínimo que recebe:** o batch autorizado + **apenas** os arquivos de `platform/` listados;
  guias locais do Next em `platform/node_modules/next/dist/docs/`.
- **Output esperado:** incremento mínimo (cockpit operador-facing) com `npm run lint` + `npm run build`
  verdes.
- **Limites:** nada fora da lista do batch; sem `sql/`, schema, `.env.local`, secrets, service role; sem
  instalar dependência sem menção explícita na frase de gate.
- **Handoff:** entrega ao **Auth/RLS Reviewer** e ao **UX/Cockpit Reviewer**; reporta ao **Evidence Auditor**.

### 4.4 Auth/RLS Reviewer
- **Responsabilidade:** revisar que auth, sessão e RLS **preservam o tenant boundary** e o menor
  privilégio — sem alterar nada (read-only).
- **Contexto mínimo que recebe:** incremento + `platform/src/lib/auth/`, `proxy.ts`,
  `tenant-context.ts`, policies documentadas.
- **Output esperado:** parecer (aprovado/bloqueado + motivo) como seção do evidence do batch.
- **Limites:** não escreve em `platform/`/`sql/`; não executa SQL/MCP; não usa service role.
- **Handoff:** reporta ao **Execution Coordinator** e ao **Evidence Auditor**; parecer "bloqueado"
  interrompe o batch até decisão humana.

### 4.5 UX/Cockpit Reviewer
- **Responsabilidade:** garantir **estado vazio honesto**, ausência de dado fabricado, ausência de
  crash/loop/overlay e clareza do incremento; vigiar que o cockpit **não vira console técnico**.
- **Contexto mínimo que recebe:** rotas/UI em `platform/src/app/`, logs do dev server, evidence.
- **Output esperado:** parecer de UX (aprovado/bloqueado + observações) como seção do evidence do batch,
  baseado em validação runtime observada (logs + observação humana no navegador).
- **Limites:** nenhuma escrita em `platform/`; sem SQL/MCP; nunca imprime secrets/tokens/cookies/OAuth `code`.
- **Handoff:** reporta ao **Execution Coordinator** e ao **Evidence Auditor**; bloqueio de UX trava o
  fechamento do batch.

### 4.6 Evidence Auditor
- **Responsabilidade:** consolidar **um** evidence por batch concluído, auditável e curto; confirmar
  fronteiras preservadas — sem inventar conclusão.
- **Contexto mínimo que recebe:** todos os pareceres e saídas verificadas do batch.
- **Output esperado:** evidence consolidado em `evidence/`, com readiness statement, validações,
  confirmações de não-execução e gaps.
- **Limites:** não escreve em `platform/`/`sql/`/specs/mapa (fora de fechamento); não executa nada; não
  fecha lane (fechamento exige papel do Product Architect + frase humana).
- **Handoff:** reporta ao **Product Architect/Coordinator** para decisão do próximo batch ou fechamento.

---

## 5. Batches Propostos (planejamento seriado — NÃO execução)

> Estes batches são **plano**. Nenhum é executado nesta task. Cada um, quando a Lane 5 estiver aberta,
> exige a(s) frase(s) de gate do(s) papel(éis) que toca limites (seção 7).

### Batch 5.1 — Product surface definition for Agent Operations Layer
- **Papel principal:** Product Architect.
- **Objetivo:** definir, em termos de produto, **o que** a superfície da camada de operação de agentes é
  para o operador (o que ele vê/entende/aprovará), sem desenhar implementação e sem nomear agentes reais.
- **Resultado esperado:** definição de superfície + Definição de Concluído da lane (documento).
- **Toca limites?** Não (somente texto de spec/programa). Sem gate de `platform/`/SQL/MCP.
- **Handoff:** → Coordinator (5.2).

### Batch 5.2 — Cockpit tenant/membership operational state design
- **Papéis:** Product Architect + Execution Coordinator.
- **Objetivo:** desenhar os **estados operacionais** do cockpit (`no_session`, `no_membership`,
  `tenant_found`, `error`) como estados **operador-facing**, e como a **semântica de membership** e o
  **tenant boundary** aparecem honestamente em cada um; desenhar o **placeholder da base agentic** (nomear
  a operação futura sem instanciá-la).
- **Resultado esperado:** documento de design dos estados + cópia/conteúdo honesto por estado.
- **Toca limites?** Não (design documental). Sem gate de `platform/`/SQL/MCP.
- **Handoff:** → Coordinator define Batch 5.3.

### Batch 5.3 — Minimal UI implementation plan for operator-facing state
- **Papéis:** Execution Coordinator (pack) → Frontend Implementer (**somente quando autorizado**).
- **Objetivo:** **planejar** o incremento de UI mínimo do cockpit operador-facing — lista exata de arquivos
  de `platform/` candidatos, escopo do incremento, e lint/build como verificação. **A implementação real
  exige a frase de gate do Implementer** e ocorre **fora desta task**.
- **Resultado esperado (nesta fase de programa):** o **plano**/pack do batch (não o código).
- **Toca limites?** **Sim** — escrita em `platform/` na fase de execução. Exige frase do Implementer com
  lista exata de arquivos.
- **Handoff:** → Auth/RLS Reviewer + UX/Cockpit Reviewer (5.4/5.5).

### Batch 5.4 — Auth/RLS review plan
- **Papel principal:** Auth/RLS Reviewer.
- **Objetivo:** plano de revisão que verifica boundary de tenant preservado, uso exclusivo de valores
  públicos (nunca service role), ausência de consulta a tabelas protegidas fora do contrato e RLS intacto.
- **Resultado esperado:** plano de checagem + (na execução) parecer como seção do evidence do batch.
- **Toca limites?** Não (read-only).
- **Handoff:** → Evidence Auditor.

### Batch 5.5 — UX review and evidence plan
- **Papéis:** UX/Cockpit Reviewer → Evidence Auditor.
- **Objetivo:** plano de revisão de UX (estado vazio honesto, sem dado fabricado, sem crash/loop/overlay,
  cockpit não-console) e plano do **evidence único** consolidado ao fim do batch real.
- **Resultado esperado:** plano de UX + plano de evidence; (na execução) 1 evidence consolidado.
- **Toca limites?** Não (read-only + evidence).
- **Handoff:** → Coordinator/Architect decide próximo batch ou fechamento da lane.

---

## 6. File Access Boundaries

### Permitido por papel
| Papel | Leitura | Escrita |
|---|---|---|
| Product Architect | mapa, specs `docs/specs/implementation/*.md`, closure gates `lanes/`, evidence | specs e programa em `lanes/` |
| Execution Coordinator | programa, `packs/`, mapa, evidence | `packs/` |
| Frontend Implementer | specs, programa, packs, guias locais do Next; **só** arquivos de `platform/` do batch | `platform/src/` **só** arquivos listados no batch |
| Auth/RLS Reviewer | `platform/src/lib/auth/`, `proxy.ts`, `tenant-context.ts`, policies documentadas, evidence | seção no evidence do batch |
| UX/Cockpit Reviewer | rotas/UI em `platform/src/app/`, evidence, logs do dev server | seção no evidence do batch |
| Evidence Auditor | todos os artefatos do batch | `evidence/` (1 por batch) |

### Proibido (todos os papéis salvo gate explícito)
- `platform/` **só pode ser tocado futuramente com gate explícito** do Implementer (frase com lista exata
  de arquivos). Nenhuma escrita em `platform/` nesta task.
- `sql/`, schema, migrations: nenhuma criação na Lane 5 sem task/gate específicos.
- **`.env`/`.env.local`, secrets, tokens, cookies e OAuth `code` nunca são lidos nem impressos** por nenhum
  papel.
- Service role nunca usada; apenas valores públicos (`NEXT_PUBLIC_SUPABASE_URL` + anon key).
- Leitura mínima necessária: nenhum papel lê o repositório inteiro "por garantia".

---

## 7. Gates

| # | Gate | Frase literal (humano) | Desbloqueia |
|---|---|---|---|
| G0 | **Aprovar este Execution Program** | aprovação humana explícita deste documento | tornar o programa elegível a ativação |
| G1 | **Abrir a Lane 5** | `AUTORIZO ABERTURA DA LANE 5 — AGENT OPERATIONS LAYER` | promoção do programa a ativo; criação de packs de batch (não desbloqueia código/SQL/MCP) |
| G2 | **Promover o programa** | `AUTORIZO O PRODUCT ARCHITECT A DEFINIR O PROGRAMA DA LANE 5` | Product Architect detalhar Definição de Concluído e batches |
| G3 | **Abrir um batch** | `AUTORIZO O EXECUTION COORDINATOR A ABRIR O BATCH <id> DA LANE 5` | Coordinator despachar papéis do batch |
| G4 | **Alterar `platform/`** | `AUTORIZO O IMPLEMENTER A ALTERAR platform/ NOS ARQUIVOS <lista> NO BATCH <id>, SEM SQL/MCP/SERVICE ROLE` | escrita de código nos arquivos listados (Batch 5.3) |
| G5 | **Qualquer SQL manual** | `AUTORIZO O PLANNER A PREPARAR O PLANO SQL DO BATCH <id>` (execução é ação manual humana no SQL Editor) | preparo de plano SQL — **não previsto na Lane 5**; só se um batch exigir dados |
| G6 | **Revisões** | `AUTORIZO O AUTH/RLS REVIEWER A REVISAR O BATCH <id>` · `AUTORIZO O UX/COCKPIT REVIEWER A VALIDAR O BATCH <id>` | pareceres read-only |
| G7 | **Consolidar evidence** | `AUTORIZO O EVIDENCE AUDITOR A CONSOLIDAR O EVIDENCE DO BATCH <id>` | 1 evidence por batch concluído e verificado |

Frases insuficientes para qualquer gate: "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode
continuar", "faça", "sim", "bora", "continue".

---

## 8. Expected Evidence

- **Evidência só no final de um batch real**, executado e verificado — nunca por microação.
- **Um** evidence consolidado por batch, escrito pelo Evidence Auditor, com readiness statement,
  validações (lint/build e/ou observação runtime), confirmações de não-execução e gaps.
- **A Lane 5 só será fechada** quando houver **pelo menos um batch executado, verificado e auditado** que
  entregue o incremento operador-facing (mínimo: cockpit expressando vínculo tenant/membership com estado
  vazio honesto e base agentic nomeada). Fechamento exige closure gate próprio (Product Architect + frase
  humana), análogo ao da Lane 4.
- Nenhum evidence de execução é criado nesta task de programa.

---

## 9. Human Authorization Phrase (abertura futura da Lane 5)

A frase **literal** que abre a Lane 5, conforme já fixado no closure gate da Lane 4, é:

> `AUTORIZO ABERTURA DA LANE 5 — AGENT OPERATIONS LAYER`

Sequência de ativação: **(1)** aprovação humana deste Execution Program (G0) → **(2)** escrita da frase
acima (G1), que **abre a Lane 5** e promove este programa a ativo → **(3)** detalhamento e abertura de
batches sob seus próprios gates (G2–G7). Escrever a frase **não** desbloqueia, por si, código, SQL, MCP ou
alteração de `platform/` — cada um desses continua exigindo o gate correspondente dentro do programa.

---

## Confirmação de Não-Execução

Este documento é o **programa de execução proposto** da Lane 5. **Não abre a Lane 5**, não executa código,
não executa SQL, não usa MCP, não modifica `platform/`, não cria tenant/membership/seed, não cria policy
de escrita, não cria runner/subagent executável, não atualiza o mapa operacional como Lane 5 aberta e não
cria evidence de execução. Qualquer ação concreta exige a frase de autorização humana do gate
correspondente (seção 7).

---

## Final Status

`LANE_5_AGENT_OPERATIONS_EXECUTION_PROGRAM_CREATED_NOT_OPENED`

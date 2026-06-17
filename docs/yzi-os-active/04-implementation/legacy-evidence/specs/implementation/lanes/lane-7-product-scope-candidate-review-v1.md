# Lane 7 — Product Scope Candidate Review v1

> Relatório **curto de decisão** de produto. Avalia as candidatas de escopo da Lane 7
> **sem abrir a Lane 7**, sem criar Execution Program, sem alterar código/`platform/`,
> sem SQL, sem MCP, sem criar agente/registry/tool/memory, sem criar policy de escrita e
> sem atualizar o mapa operacional. É análise documental que conclui com uma recomendação
> objetiva.

Lane anterior: 6 — Tenant Bootstrap / Membership Activation Layer · Status: **fechada**
(`LANE_6_TENANT_BOOTSTRAP_MEMBERSHIP_ACTIVATION_CLOSED_TENANT_FOUND_VALIDATED`)
Projeto Supabase: `thwsltjcjrvtidhnfukc` · Data: 2026-06-12 · Papel: **Product Architect**

---

## 0. Situação de Produto (de onde partimos)

A Lane 6 entregou o **primeiro boundary habitado**: um tenant real (`YZI OS — Operação
Inicial`) e uma membership real (role `viewer`, `active`) para o operador validado,
ativados por **SQL manual humano, reversível, sem service role e sem seed permanente**. O
cockpit saiu de `no_membership` e renderizou **`tenant_found`** com dado real, validado em
runtime/browser por observação humana.

**Estado atual de produto:**

- Google OAuth funcionando; `/cockpit` protegido;
- 1 tenant real + 1 membership real (`viewer`);
- `tenant_found` exercitado e validado em runtime;
- Base agentic **vazia/honesta** — nenhum agente real, nenhum MCP, nenhum runner;
- **Nenhuma policy de escrita** de produção materializada (a ativação foi INSERT humano
  direto, não um caminho de escrita governado);
- **Nenhum service role no frontend**.

**Lacuna atual:** o operador agora **pertence** a um tenant, mas ainda **não controla a
própria sessão** — não há logout, não há encerramento seguro, não há estado operacional do
operador além do que a sessão crua expõe. O cockpit é entrável, mas não é **operável com
segurança** de ponta a ponta: entra-se, mas não se sai de forma governada. Esse gap foi
sinalizado como remanescente **tanto no closure da Lane 5 quanto no da Lane 6** ("Lane
futura de ações de cockpit").

---

## 1. Qual é o próximo passo mais seguro e mais útil para o produto?

**Lane 7 — Operator Session & Control Layer (Candidata 1).**

É o **menor incremento de produto verificável** que ainda está no caminho de habilitar a
operação agentic real, e é o **mais seguro** porque:

- fecha um gap **real e repetidamente sinalizado** (logout/encerramento de sessão);
- é, em princípio, **frontend-only** (sign-out via cliente Supabase + estado de sessão) —
  **não exige nova policy de escrita**, **nem novo modelo de dados**, **nem superfície de
  agente**, **nem registry**;
- estabelece o pré-requisito humano para confiar controles agentic ao operador: **não se
  entrega controle de agentes a uma sessão que não se sabe encerrar com segurança**.

As demais candidatas são inferiores **agora** (detalhe em §4 e na Recomendação):

- **Agent Registry Shell** — prematura e **sensível ao harness** ("registry" está na lista
  de itens que o harness não materializa); introduz caminho de escrita e modelo de dados de
  agente antes do básico de sessão e antes de fronteiras de tool/memory definidas.
- **Tool/Memory Boundary Layer** — foundational, mas **fora de ordem**: desenhar limites de
  tools/memória **antes de existir qualquer agente ou registry** é limitar algo que ainda
  não existe; gera retrabalho.
- **First Controlled Agent Operation** — **cedo demais** (confirmado): sem sessão
  controlada, sem caminho de escrita governado, sem registry, sem fronteira de
  tool/memory. Saltar para cá viola a disciplina de incremento mínimo.

## 2. O que precisa existir antes de agentes reais?

Ordem lógica de pré-requisitos (a Lane 7 candidata cobre apenas o item 1):

1. **Ciclo de sessão seguro do operador** — login (feito) **+ logout (ausente)** + estado
   de sessão + identidade operacional honesta. *(escopo da Lane 7 candidata)*
2. **Caminho de escrita governado** — hoje só existem policies **SELECT**
   (`tenants_select_member`, `memberships_select_own`); a ativação da Lane 6 foi INSERT
   humano direto, **sem policy de escrita de produção**. *(lane futura)*
3. **Matriz mínima de papéis** além de `viewer` — quem pode ver/aprovar/operar o quê.
   *(lane futura)*
4. **Superfície de existência de agente** (registry shell não-executável) — um lugar onde
   um agente "existe" antes de operar. *(lane futura)*
5. **Fronteira de tools/memória por tenant/agente** — limites antes de qualquer execução.
   *(lane futura)*
6. **Primeira operação de agente controlada** — só depois de 1–5. *(lane futura)*

## 3. O que o operador humano ainda NÃO consegue fazer no cockpit?

- **Sair / encerrar a sessão (logout)** — não existe; a sessão só termina por expiração ou
  ação externa ao produto.
- **Enxergar seu estado operacional de forma clara** (identidade operacional, tenant ativo,
  papel) como um estado seguro e legível, não apenas derivado da sessão crua.
- **Re-autenticar de forma governada** (sair e voltar) dentro do fluxo do produto.
- **Qualquer ação de escrita pela UI** — o tenant foi criado por SQL humano, não pelo
  cockpit; não há ação de produto que escreva.
- **Qualquer coisa agentic** — por design, base agentic vazia.

A Lane 7 candidata ataca os três primeiros itens; os dois últimos permanecem diferidos.

## 4. Riscos de pular direto para Agent Registry ou agente real

| Risco | Natureza | Por que pesa agora |
|---|---|---|
| **Caminho de ESCRITA prematuro** (INSERT em tabela de agentes) | Nova superfície de ataque antes de existir policy de escrita revisada | A Lane 6 deixou explícito que **nenhuma policy de escrita de produção** existe ainda |
| **Conflito com o harness** | "Registry"/runner/pipeline executável está na lista que o harness **não materializa** | Um "Agent Registry" mal escopado escorrega para algo executável proibido |
| **Modelo de dados prematuro** | Schema de agente desenhado antes da fronteira de tool/memory | Gera retrabalho quando os limites forem definidos depois |
| **Superfície decorativa** | Registry vazio sem agentes vira UI sem incremento de produto | Viola a regra anti-burocracia ("não usar agentes como decoração", "nenhum documento/superfície sem função") |
| **Sessão insegura sob controle agentic** | Operador não consegue **encerrar a sessão**, mas receberia controles de agente | Entregar controle agentic a uma sessão não-encerrável é um *smell* de segurança |
| **Quebra de isolamento (P10)** | Policy de escrita malfeita em tabela de agentes rompe o tenant boundary | Exigiria revisão Auth/RLS pesada antes de qualquer uso |
| **Agente real (Candidata 4)** | Execução, tools, memória, runner — tudo de uma vez | Sem 1–5 da §2, é salto direto ao fim da trilha |

## 5. Menor incremento verificável da Lane 7

Com a Lane 7 candidata = **Operator Session & Control Layer**, o menor incremento
verificável é:

> O operador autenticado consegue **encerrar a sessão (logout)** a partir do `/cockpit`,
> é redirecionado ao login, e **re-autentica com sucesso** voltando a `tenant_found`; o
> estado de sessão/identidade operacional é exibido de forma **honesta**; **sem service
> role**, **sem nova policy de escrita** em tabelas de negócio, **sem MCP**, com a base
> agentic ainda vazia.

Verificável por **observação runtime/browser humana**: `tenant_found` → logout → tela de
login → re-login → `tenant_found` novamente, sem crash/loop/overlay e sem token/cookie/OAuth
`code` impresso. É o caminho que torna o cockpit **operável com segurança de ponta a
ponta**, não apenas entrável.

## 6. Quais papéis agentic devem participar?

- **Product Architect** — superfície da Lane 7 e Definição de Concluído.
- **Execution Coordinator** — sequenciar os batches.
- **Frontend Platform Implementer** — **papel central** nesta lane: implementa a ação de
  sign-out e o estado de sessão/identidade, **somente** sob gate com **lista exata de
  arquivos** em `platform/`.
- **Auth/RLS Reviewer** — **crítico**: confirma que o sign-out usa apenas valores públicos,
  não toca service role, não vaza token/cookie, e que o encerramento de sessão preserva o
  tenant boundary.
- **UX/Cockpit Reviewer** — estados de sessão honestos, ausência de crash/loop no logout,
  redirecionamento correto.
- **Evidence Auditor** — 1 evidence por batch real.
- **Backend/Supabase Planner** — **provavelmente NÃO ativado**: se o logout for sign-out
  puro do cliente de auth, **não há SQL**. Só seria acionado se surgir necessidade real de
  persistência de estado de sessão (a evitar nesta lane).

## 7. O que deve ficar fora de escopo?

- **Agentes reais**, execução agentic, runners, schedulers, MCP, subagents executáveis.
- **Agent Registry** (mesmo shell/placeholder) — diferido para lane futura própria.
- **Tool/Memory Boundary Layer** — diferido para lane futura própria.
- **Nova policy de escrita** (INSERT/UPDATE/DELETE) em tabelas de negócio.
- **Expansão de hierarquia de papéis/permissões** além do mínimo já existente (`viewer`).
- **Gestão multi-sessão / multi-dispositivo**, SSO além do Google OAuth já existente.
- **Gestão de conta / perfil** (troca de senha, edição de perfil) além da identidade de
  sessão exibida.
- **Service role no frontend**, **seed permanente**, manipulação crua de token/cookie/OAuth
  `code`.

## 8. Qual readiness deve fechar a Lane 7 candidata?

Quando (e se) a Lane 7 for aberta como **Operator Session & Control Layer** e concluída, o
closure deve fechar com algo como:

> `LANE_7_OPERATOR_SESSION_CONTROL_CLOSED_LOGOUT_VALIDATED`

Critério de fechamento: logout funcional + re-login validado em runtime/browser humano,
estado de sessão/identidade honesto, **sem service role**, **sem nova policy de escrita**,
base agentic ainda vazia, sem vazamento de token/cookie. *(Token de readiness provisório;
renomeável por decisão humana ao abrir a Lane 7.)*

---

## Recomendação (objetiva)

> **A Lane 7 deve ser: Operator Session & Control Layer.**

Justificativa: é o **menor incremento verificável** ainda no caminho da operação agentic e o
**de menor risco** — frontend-only, sem nova policy de escrita, sem modelo de dados de
agente, sem registry (item sensível ao harness). Fecha um gap **real e duplamente
sinalizado** (logout, remanescente nos closures das Lanes 5 e 6) e estabelece o pré-requisito
de **estado seguro do operador** antes de qualquer controle agentic. As alternativas são
inferiores **agora**:

- **Agent Registry Shell** — prematura, sensível ao harness e introdutora de caminho de
  escrita/modelo de dados antes do básico de sessão; risco de superfície decorativa.
- **Tool/Memory Boundary Layer** — foundational mas fora de ordem: limita algo que ainda não
  existe.
- **First Controlled Agent Operation** — cedo demais; depende de 1–5 da §2.

**Condições inegociáveis da Lane 7 (quando aberta):** logout/encerramento via **cliente de
auth com valores públicos**, **sem service role**, **sem nova policy de escrita**, **sem
MCP**, **sem SQL** (a menos que um gate humano específico o justifique), **sem tocar a base
agentic**, com revisão **Auth/RLS** obrigatória do encerramento de sessão e validação
runtime/browser humana do ciclo logout→login.

---

## Confirmação de Não-Execução

Este relatório é documentário. **Não** abre a Lane 7, **não** cria Execution Program, **não**
altera código/`platform/`, **não** cria SQL, **não** cria agente/registry/tool/memory, **não**
cria policy de escrita, **não** usa MCP, **não** mexe em `main`, **não** faz push, **não** cria
commit e **não** atualiza o mapa operacional. Apenas avalia e recomenda. A abertura da Lane 7
exige a frase de autorização humana explícita definida no closure gate da Lane 6
(`AUTORIZO ABERTURA DA LANE 7`). Permanecem **insuficientes**: "vamos", "segue", "manda",
"próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", "continue".

---

## Readiness

`LANE_7_PRODUCT_SCOPE_CANDIDATE_REVIEW_CREATED_NOT_OPENED`

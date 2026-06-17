# Pack 03 — Lane 5 · Batch 5.3 — Minimal UI Implementation **Plan** (operator-facing state) v1

> Pack documental da **Lane 5 — Agent Operations Layer**, Batch 5.3 — **fase de PLANO**.
> **Não implementa nada**: não altera `platform/`, não altera código, não cria SQL, não
> usa MCP, não cria tenant/membership/seed, não cria evidence, não executa build, não
> executa lint, não abre o Batch 5.4, não atualiza o mapa operacional e não fecha a
> Lane 5. É **plano de implementação mínima** com **lista exata de arquivos** que
> poderão ser tocados sob autorização humana futura (G4).

Lane: 5 — Agent Operations Layer · Status da lane: **ABERTA (G1)** · Batch: **5.3 (plano)**
Modo: Execution Program Mode (sobre o SDD Lite / Execution Pack Mode)
Projeto Supabase: `thwsltjcjrvtidhnfukc`
Data: 2026-06-12
Papéis ativados: **Execution Coordinator** (sequenciamento/lista de arquivos) · **Frontend Platform Implementer** *como planejador, sem escrita em código* · **Auth/RLS Reviewer** *consultivo, sem revisão runtime* · **UX/Cockpit Reviewer** *consultivo*

Entradas lidas:
- [`lanes/lane-5-agent-operations-layer-execution-program-v1.md`](../../lanes/lane-5-agent-operations-layer-execution-program-v1.md)
- [`01-lane-5-batch-5.1-product-surface-definition-pack-v1.md`](01-lane-5-batch-5.1-product-surface-definition-pack-v1.md)
- [`02-lane-5-batch-5.2-cockpit-operational-state-design-pack-v1.md`](02-lane-5-batch-5.2-cockpit-operational-state-design-pack-v1.md)
- `platform/src/app/cockpit/page.tsx` (leitura para planejar pontos de alteração)
- `platform/src/lib/supabase/{client,server,health}.ts` (leitura — camada de dados; **não** será alterada)
- `platform/src/lib/auth/session.ts` (leitura — sessão; fonte de identidade do operador)
- `platform/src/proxy.ts` (leitura — proteção de rota; **não** será alterada)

---

## 0. Contexto de Gate (por que este batch — só o plano — pode rodar)

- Lane 5 **aberta** por G1. Batches 5.1 (`2a67e75`) e 5.2 (`9803825`) concluídos.
- Batch 5.3 tem **duas fases** (programa §5): **(a) PLANO** — não toca limites, é este
  documento; **(b) IMPLEMENTAÇÃO** — escrita em `platform/`, **exige G4** (frase do
  Implementer com lista exata de arquivos), **fora desta task**.
- Esta task é **somente a fase (a)**. A fase (b) **não** é executada aqui.
- Estado herdado relevante (leitura read-only): o cockpit **já** consome
  `getTenantContext()` e **já** renderiza os quatro estados. O trabalho de implementação
  futura é **refino presentacional operador-facing**, não nova camada de dados.

---

## 1. Resumo do Objetivo de UI

### O que o cockpit **deve comunicar**
- **Quem o operador é** na operação (identidade derivada da sessão real — Lane 4).
- **Seu vínculo**: membership e **tenant boundary** legíveis (pertence / não pertence e
  o que isso significa para ver/aprovar/operar).
- **A base da operação agentic** **nomeada** e **vazia/honesta** (sem agentes, sem dados
  fabricados) — conforme Batch 5.1 §4 e Batch 5.2 §4.
- O **próximo passo compreensível** em cada estado (entrar, entender o vínculo, tentar
  de novo) — outcome operado.

### O que o cockpit **não deve comunicar**
- Nenhum **dado fabricado** (tenant/agente/métrica/contagem/histórico).
- Nenhum **detalhe de console técnico**: IDs internos, `slug`/`tenant id` crus,
  `agents`/`tools`/`state`, schema, policies, claims, linhas de tabela.
- Nenhum **segredo**: token, cookie, OAuth `code`, service role, URL de callback.
- Nenhuma **promessa de operação ativa** que ainda não existe.

### Como manter **outcome operado** em vez de arquitetura exposta
- Falar em **"operação" e "vínculo"**, não em tabelas/camadas.
- Trocar a exibição atual de `slug`/`tenant id` (font-mono) por **identidade legível do
  tenant** (nome) — o ID cru é console técnico e sai da tela.
- A base agentic aparece como **lugar nomeado e vazio**, nunca como lista/console.

---

## 2. Estados a Renderizar

`no_session` · `no_membership` · `tenant_found` · `error` — os quatro já existem em
`getTenantContext()`; o plano refina **a apresentação** de cada um conforme Batch 5.2 §3.

---

## 3. Especificação por Estado (cópia de design — strings finais na implementação)

### 3.1 `no_session`
- **Mensagem principal:** "Entre para acessar sua operação."
- **Mensagem secundária:** "O cockpit do YZI OS exige uma sessão autenticada. Faça login
  para continuar."
- **Ações disponíveis:** link para `/login` (Google OAuth existente).
- **Ações bloqueadas:** todo o cockpit; ver tenant/membership; ver base agentic.
- **Dados reais necessários:** apenas o **fato de ausência de sessão** (já disponível;
  o `proxy.ts` normalmente já redireciona antes).
- **Fallback honesto:** se chegar aqui sem sessão, mostrar a porta de entrada; nunca
  pré-exibir conta/"último tenant".

### 3.2 `no_membership` (caminho real desta lane — banco limpo)
- **Mensagem principal:** "Você ainda não pertence a um tenant."
- **Mensagem secundária:** "Esta conta autenticada não está associada a nenhum tenant.
  Nenhum dado foi inventado para preencher esta tela. Quando você tiver um vínculo
  (membership) a um tenant, sua operação aparecerá aqui."
- **Ações disponíveis:** entender o conceito de tenant/membership (texto honesto);
  sair/encerrar sessão.
- **Ações bloqueadas:** criar tenant; criar membership; "entrar" em tenant; configurar
  agentes; qualquer escrita.
- **Dados reais necessários:** identidade da sessão + leitura RLS read-only confirmando
  **0 memberships** (já fornecido por `getTenantContext`).
- **Fallback honesto:** declarar a ausência de vínculo e a razão; **base agentic nomeada
  como indisponível até haver vínculo**; nenhum tenant fictício.

### 3.3 `tenant_found` (design; **não exercitado nesta lane** — banco limpo)
- **Mensagem principal (template):** "Operação de **{nome real do tenant}**."
  *(nome vem do membership real; jamais fabricado.)*
- **Mensagem secundária:** "Você está vinculado a este tenant. A base de operação
  agentic ainda não tem nada configurado — nenhum agente foi criado. Nada aqui é
  simulado."
- **Ações disponíveis:** ver o vínculo (qual tenant, o que o membership permite em termos
  de produto); sair.
- **Ações bloqueadas:** criar/configurar/instanciar agente; executar operação; criar
  membership/seed; qualquer escrita.
- **Dados reais necessários:** **membership real** legível via RLS read-only + **nome do
  tenant**; **sem** expor `id`/`slug` crus (sai da UI — anti-console).
- **Fallback honesto:** mesmo com tenant real, base agentic **vazia e honesta**; **nunca**
  criar seed/tenant fabricado só para "ver a tela" — este estado só renderiza com tenant
  real sob gate humano futuro.

### 3.4 `error`
- **Mensagem principal:** "Não foi possível carregar sua operação."
- **Mensagem secundária:** "Ocorreu uma falha ao confirmar sua sessão ou seu vínculo.
  Tente novamente. Nenhum dado foi exibido para não inventar um estado."
- **Ações disponíveis:** tentar novamente; sair/entrar de novo.
- **Ações bloqueadas:** qualquer operação que dependa de estado confiável; **não** assumir
  `no_membership`/`tenant_found`.
- **Dados reais necessários:** apenas o **sinal de falha** de leitura de sessão/contexto
  (estado `error` de `getTenantContext`).
- **Fallback honesto:** distinguir **erro** ("não sei agora") de **vazio** ("sei que você
  não pertence"); **nunca** stack/token/`code`/query na tela.

---

## 4. Lista Exata de Arquivos Candidatos de `platform/` (alteração **futura**, sob G4)

| # | Caminho completo | Motivo | Tipo de alteração prevista | Risco | Obrigatório? |
|---|---|---|---|---|---|
| 1 | `platform/src/app/cockpit/page.tsx` | Único ponto que renderiza os 4 estados; refinar para cópia operador-facing do Batch 5.2, adicionar identidade do operador (via `getSessionUser`), nomear a base agentic vazia e **remover exibição de `slug`/`tenant id` crus** (anti-console) | Edição presentacional de Server Component (JSX + cópia); adicionar import/uso de `getSessionUser` de `@/lib/auth/session`; **sem** nova query, **sem** service role, **sem** dado fabricado | Baixo–Médio (apresentacional; precisa preservar os 4 ramos e o estado vazio honesto) | **Obrigatório** |
| 2 | `platform/src/app/cockpit/layout.tsx` | Shell do cockpit; opcionalmente exibir **identidade do operador** (e-mail/nome da sessão) num cabeçalho honesto, em vez de inflar `page.tsx` | Edição presentacional leve; sem dados novos além da sessão já disponível | Baixo | **Opcional** |
| 3 | `platform/src/app/cockpit/_components/agentic-base-placeholder.tsx` (**novo**) | Extrair o **placeholder da base agentic** (nomeada/vazia) em componente reutilizável para `no_membership` e `tenant_found`, mantendo `page.tsx` enxuto | **Criação** de componente presentacional puro (sem estado, sem fetch, sem props sensíveis) | Baixo | **Opcional** |

> Notas de fronteira:
> - **Nada** fora desta tabela pode ser tocado na implementação futura.
> - A **camada de dados não muda**: `getTenantContext` já entrega os 4 estados e o nome
>   do tenant; `lib/supabase/*`, `lib/auth/session.ts` e `proxy.ts` permanecem
>   **inalterados** (apenas **importados/consumidos**, nunca editados).
> - Se a implementação revelar necessidade de novo campo de dados, isso é **mudança de
>   escopo** → parar e abrir batch/gate próprio (não improvisar em `tenant-context.ts`).

---

## 5. Arquivos Explicitamente Proibidos (nunca tocados nem lidos como segredo)

- `platform/.env`, `platform/.env.local` — **proibido** ler/editar/imprimir.
- Quaisquer **secrets**, **cookies**, **tokens**, **OAuth `code`** — nunca lidos nem
  exibidos.
- `sql/`, **migrations**, schema, policies — nenhuma criação/alteração.
- **Service role** — nunca usada em nenhum ponto.
- **Qualquer arquivo fora da lista candidata (§4)** — incluindo, explicitamente:
  `platform/src/proxy.ts`, `platform/src/lib/supabase/*`,
  `platform/src/lib/auth/session.ts`, `platform/src/lib/tenant/tenant-context.ts`,
  e qualquer outra rota/arquivo de `platform/`.

---

## 6. Dados e Queries Permitidos (na implementação futura)

- **Sessão Supabase** — via `getSessionUser()` / `getTenantContext()` (anon/publishable
  key, cookies do Next).
- **Membership via RLS read-only** — já encapsulado em `getTenantContext` (estados
  `no_membership`/`tenant_found`).
- **Tenant via RLS read-only quando existir** — apenas **nome** legível; **sem** `id`/
  `slug` crus na UI.
- **Nenhum service role.**
- **Nenhum dado fabricado** — zero mock/seed/exemplo; estado vazio honesto sempre.

---

## 7. Verificação Futura (na fase de implementação, **não agora**)

1. **Pré-implementação (obrigatório por `platform/AGENTS.md`):** ler os guias locais do
   Next em `platform/node_modules/next/dist/docs/` antes de escrever código (Next.js 16
   modificado: `proxy.ts` no lugar de middleware, convenções próprias).
2. `npm run lint` → exit 0.
3. `npm run build` → exit 0.
4. **Validação manual/browser** dos quatro estados (observação humana).
5. Confirmar que **`no_membership` continua honesto com banco vazio** (0 tenants/
   memberships): mensagens de vazio honesto, nada fabricado, sem crash/loop/overlay.
6. Confirmar que **`tenant_found` não inventa tenant**: só renderiza com tenant real; sem
   seed/tenant fabricado para visualizar; `id`/`slug` crus ausentes da UI.

> Nenhum desses passos é executado nesta task de plano. Build e lint **não** são rodados
> agora.

---

## 8. Gate Literal Futuro Proposto (autorização de alteração em `platform/` — G4)

Conforme o template do programa §7 (G4), a frase **exata** que autorizaria o Implementer
a tocar **apenas** os arquivos listados, no Batch 5.3:

**Variante obrigatória (mínima — só o arquivo obrigatório):**

> `AUTORIZO O IMPLEMENTER A ALTERAR platform/ NOS ARQUIVOS platform/src/app/cockpit/page.tsx NO BATCH 5.3 DA LANE 5, SEM SQL/MCP/SERVICE ROLE`

**Variante completa (inclui os opcionais §4 #2 e #3):**

> `AUTORIZO O IMPLEMENTER A ALTERAR platform/ NOS ARQUIVOS platform/src/app/cockpit/page.tsx, platform/src/app/cockpit/layout.tsx, platform/src/app/cockpit/_components/agentic-base-placeholder.tsx NO BATCH 5.3 DA LANE 5, SEM SQL/MCP/SERVICE ROLE`

Frases insuficientes (programa §7): "vamos", "segue", "manda", "próximo", "ok",
"aprovado", "pode continuar", "faça", "sim", "bora", "continue".

---

## 9. Escopo deste Batch (fase de plano)

### Autorizado
- Ler os specs da Lane 5 e os arquivos de `platform/` permitidos **apenas** para planejar
  pontos de alteração;
- Produzir este plano: objetivo de UI, estados, lista exata de candidatos, proibições,
  dados/queries permitidos, verificação futura e frase de gate G4.

### Proibido
- Escrever em `platform/` ou em código; SQL; MCP; service role; build; lint; instalação;
- Criar tenant/membership/seed; criar evidence;
- **Implementar** qualquer UI; abrir o Batch 5.4; atualizar o mapa operacional; fechar a
  Lane 5.

## 10. Pareceres Consultivos

- **Auth/RLS Reviewer (consultivo, sem runtime):** a lista candidata não introduz query
  nova nem service role; consumo permanece RLS read-only via `getTenantContext`; `proxy.ts`
  e `lib/supabase/*` intactos → **boundary preservado no plano**. Revisão runtime fica
  para a fase de implementação.
- **UX/Cockpit Reviewer (consultivo):** plano preserva estado vazio honesto, remove
  exposição de console (`id`/`slug` crus), nomeia base agentic vazia e distingue erro de
  vazio → **alinhado ao Batch 5.2**. Validação visual fica para a implementação.

## 11. Stop Conditions

- Necessidade de novo campo de dados/query → **parar**: mudança de escopo, exige batch/
  gate próprio.
- Pressão para implementar, rodar build/lint ou abrir o Batch 5.4 → recusar; não
  autorizado nesta fase.
- Pressão para criar seed/tenant para "ver" `tenant_found` → recusar.

---

## Confirmação de Não-Execução (nenhuma implementação foi feita)

Este artefato é **plano de implementação** em texto de spec. **Não** alterou `platform/`,
**não** alterou código, **não** criou SQL, **não** usou MCP, **não** criou tenant/
membership/seed, **não** criou evidence, **não** executou build nem lint, **não** abriu o
Batch 5.4, **não** atualizou o mapa operacional e **não** fechou a Lane 5. A leitura de
`platform/` foi **somente** para planejar pontos de alteração. A implementação real exige
a frase de gate G4 (§8), fora desta task.

---

## Readiness deste Batch

`LANE_5_BATCH_5_3_MINIMAL_UI_IMPLEMENTATION_PLAN_CREATED_NOT_IMPLEMENTED`

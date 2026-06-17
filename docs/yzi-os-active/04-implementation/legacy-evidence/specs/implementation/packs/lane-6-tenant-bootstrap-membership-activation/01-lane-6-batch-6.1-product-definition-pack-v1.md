# Pack 01 — Lane 6 · Batch 6.1 — Product Definition for Tenant Bootstrap v1

> Pack documental da **Lane 6 — Tenant Bootstrap / Membership Activation Layer**, Batch
> 6.1. **Não executa nada**: não prepara SQL, não executa SQL, não cria
> tenant/membership/seed/policy, não altera `platform/`/código, não usa MCP/service role,
> não atualiza o mapa operacional, não cria evidence e não abre o Batch 6.2. É **definição
> de produto** do tenant bootstrap, anterior a qualquer SQL.

Lane: 6 — Tenant Bootstrap / Membership Activation Layer · Status da lane: **ABERTA (G1)** · Batch: **6.1**
Modo: Execution Program Mode · Projeto Supabase: `thwsltjcjrvtidhnfukc` · Data: 2026-06-12
Papéis ativados: **Product Architect** (principal) · **Execution Coordinator** (handoff) · **Backend/Supabase Planner** *(consultivo, sem SQL)* · **Auth/RLS Reviewer** *(consultivo)*

Entradas lidas:
- [`lanes/lane-6-tenant-bootstrap-membership-activation-execution-program-v1.md`](../../lanes/lane-6-tenant-bootstrap-membership-activation-execution-program-v1.md) (`529bb12`)
- [`lanes/lane-6-product-scope-candidate-review-v1.md`](../../lanes/lane-6-product-scope-candidate-review-v1.md) (`94d7ec9`)
- [`lanes/lane-5-agent-operations-layer-closure-gate-v1.md`](../../lanes/lane-5-agent-operations-layer-closure-gate-v1.md)
- [`evidence/lane-5-batch-5.4-runtime-browser-no-membership-validated-evidence-v1.md`](../../evidence/lane-5-batch-5.4-runtime-browser-no-membership-validated-evidence-v1.md)
- [`docs/prd/yzi-os-prd-v1.md`](../../../../prd/yzi-os-prd-v1.md) (§2, §8, §18 + patch)

---

## 0. Contexto de Gate

- Lane 6 **aberta** por G1; Execution Program commitado (`529bb12`).
- Batch 6.1 **não toca limites** (programa §5: "Toca limites? Não — texto de spec").
  Executável sob a autorização humana deste batch, **sem** gate de SQL/`platform/`/MCP.
- Backend/Supabase Planner e Auth/RLS Reviewer entram **apenas consultivos** aqui — nenhum
  SQL é preparado nesta task (preparo de SQL é o Batch 6.2, sob G4).

---

## 1. Tenant Bootstrap — Product Definition

- **Nome do tenant operacional inicial (proposto):** `YZI OS — Operação Inicial`
  *(nome legível, exibido no cockpit; ajustável por decisão humana no Batch 6.2).*
- **Slug interno (se o schema exigir):** `operacao-inicial`
  *(o slug é **dado interno**; o cockpit **não** o exibe como produto — Lane 5 §UX).*
- **Finalidade:** ser o **primeiro tenant real** que **habita** o tenant boundary, para
  exercitar o estado `tenant_found` em runtime com o operador já validado. É um tenant
  **operacional de ativação**, **não** um tenant de cliente/comercial, **não** um espaço
  de negócio com dados reais de terceiros.
- **Por que é real e não seed permanente:** é uma **linha real** criada por **SQL manual
  humano governado** (Batch 6.2/6.4), mas tratada como **ativação reversível** — não é
  fixada por script de seed, não entra em migration, não é "dado de teste durável". O
  **baseline limpo (0 tenants, 0 memberships) permanece o estado de retorno**.
- **Como será revertido, se necessário (em linguagem de produto; SQL fica no Batch 6.2):**
  1. remover o **membership** de ativação (desfaz o vínculo do operador);
  2. remover o **tenant** de ativação (desfaz a linha do tenant);
  3. se uma **policy de escrita mínima** for criada só para esta ativação, removê-la;
  4. confirmar retorno ao baseline 0/0.
  > O rollback **executável** (sintaxe SQL) é definido pelo Backend/Supabase Planner no
  > Batch 6.2 e executado manualmente pelo humano — não aqui.

---

## 2. Membership Activation — Definition

- **Qual operador será associado:** o **operador autenticado validado no Batch 5.4**
  (a conta Google OAuth usada na validação runtime do `no_membership`, evidence
  `d9f6e3d`). É o **único** operador desta ativação.
- **Como identificar o operador sem expor token/cookie/OAuth `code`:** o identificador
  concreto **não** é cravado neste artefato versionado. No Batch 6.2/6.4, o **humano**, no
  Supabase SQL Editor, resolve o **`user_id` (UUID)** a partir do e‑mail do operador
  (ex.: consulta em `auth.users` por e‑mail), fornecendo o e‑mail **no momento da
  execução**. Nenhum token, cookie ou OAuth `code` é necessário ou usado. Convenção de
  placeholder para o handoff: `<OPERATOR_EMAIL>` → `<OPERATOR_USER_ID>` (preenchidos pelo
  humano na execução, nunca commitados).
- **Papel inicial recomendado (membership role):** **o mínimo necessário** para o operador
  **pertencer** ao tenant. Observação importante: a RLS `tenants_select_member` exige
  **apenas a existência do membership**, não um papel elevado — logo, `tenant_found` não
  depende de papel. Recomendação: **não introduzir papel elevado**; se o schema real de
  `public.tenant_memberships` **tiver** coluna de papel obrigatória, usar o **valor mínimo
  significativo** (ex.: `owner` como membro fundador único, ou `member`), a **confirmar
  pelo Backend/Supabase Planner no Batch 6.2** contra o schema real. Se **não** houver
  coluna de papel, **nenhum papel** é introduzido nesta lane.
- **Por que esse papel é mínimo:** evita criar hierarquia de permissões prematura (non-goal
  do programa §3); o objetivo é **pertencer e ver**, não administrar.

---

## 3. Before / After State

| Momento | Estado | O que o cockpit mostra |
|---|---|---|
| **Antes** | `no_membership` (validado Batch 5.4); `tenant_memberships` vazio, `tenants` vazio | "Você ainda não pertence a um tenant." + base agentic indisponível |
| **Depois (esperado)** | `tenant_found` real | "Operação de YZI OS — Operação Inicial" + identidade do operador + base agentic **vazia/honesta** |

- **O que o cockpit DEVE mostrar depois:** o **nome real** do tenant, a identidade do
  operador (e‑mail da sessão), e a base agentic ainda **vazia/indisponível** ("nenhum
  agente configurado").
- **O que NÃO deve aparecer:** `slug`/`id` cru como produto; agentes/contagens/métricas
  fabricadas; qualquer dado inventado; console técnico (agents/tools/state/schema).

---

## 4. Data Classification

| Categoria | Definição | Exemplos |
|---|---|---|
| **Dado real permitido** | derivado de fonte real (auth/RLS), mínimo necessário | 1 tenant (`name`, `slug` interno, `id`); 1 membership (`user_id`, `tenant_id`, [papel mínimo]); identidade do operador da sessão |
| **Dado proibido** | nunca lido/criado/impresso | service role; token/cookie/OAuth `code`; usuário fake; agente/métrica/contagem fabricada; tenant/membership de terceiros |
| **Dado temporário/reversível** | criado para a ativação, com rollback documentado | o tenant e o membership de ativação |
| **Não pode virar seed permanente** | nada fixado de forma durável/irreversível | scripts de seed; migrations que embutam o tenant; fixtures de teste |

---

## 5. Risk Controls

- **Sem service role no frontend** (nem em qualquer ponto de `platform/`): apenas valores
  públicos (`NEXT_PUBLIC_SUPABASE_URL` + anon key).
- **Sem bypass de RLS:** a leitura segue pelas policies SELECT da Lane 3; a escrita (Batch
  6.2) usa **policy mínima restrita a `auth.uid()`**, revisada pelo Auth/RLS Reviewer.
- **Sem usuário fake:** associa-se **apenas** o operador real validado; nenhum usuário
  fabricado.
- **Sem tenant/membership irreversível:** toda criação tem **rollback** documentado; sem
  seed permanente.
- **Sem policy ampla:** a policy de escrita é **mínima** (apenas o necessário para 1
  membership do próprio usuário), nunca genérica/INSERT livre.
- **Sem role/admin prematuro:** nenhuma hierarquia de papéis; papel mínimo (ou nenhum)
  conforme o schema real.

---

## 6. Eligibility Criteria for Batch 6.2 (handoff contract)

O Batch 6.2 (plano SQL) **só** se torna elegível quando este pack tiver fixado, de forma
inequívoca, os itens abaixo. Estado atual de cada item:

| Item | Definido neste pack? | Valor / regra |
|---|---|---|
| **Tenant name** | ✅ | `YZI OS — Operação Inicial` (ajustável pelo humano no 6.2) |
| **Tenant slug** (se necessário) | ✅ | `operacao-inicial` (interno; não exibido como produto) — confirmar se o schema exige |
| **User id / email do operador (de forma segura)** | ✅ (método) | operador validado no Batch 5.4; **`user_id` resolvido pelo humano** via e‑mail no SQL Editor (`<OPERATOR_EMAIL>` → `<OPERATOR_USER_ID>`), **não** commitado |
| **Membership role inicial** | ✅ (regra) | mínimo: nenhum papel elevado; se houver coluna obrigatória, menor valor significativo, **a confirmar pelo Planner contra o schema** |
| **Rollback esperado** | ✅ (em produto) | remover membership → remover tenant → remover policy (se criada) → confirmar baseline 0/0; **SQL do rollback é do 6.2** |
| **Validação pós-SQL** | ✅ | (a) `tenant_memberships`/`tenants` contêm exatamente 1 linha cada para o operador; (b) cockpit renderiza `tenant_found` real em runtime (observação humana — Batch 6.5) |

> Itens marcados "a confirmar pelo Planner" são **consultivos** e serão resolvidos contra
> o **schema real** no Batch 6.2 (sob G4), **não** nesta task.

---

## 7. Pareceres Consultivos (sem ação)

- **Backend/Supabase Planner (consultivo, sem SQL):** os campos necessários ao plano SQL
  (tenant `name`/`slug`/`id`, membership `user_id`/`tenant_id`/[papel]) estão nomeados; o
  schema real de `tenant_memberships` (existência/obrigatoriedade de coluna de papel) será
  confirmado no Batch 6.2. Nenhum SQL preparado aqui.
- **Auth/RLS Reviewer (consultivo):** a definição restringe a escrita ao próprio usuário e
  proíbe policy ampla/service role — direção compatível com o boundary; a revisão formal da
  policy ocorre no Batch 6.3 sobre o plano do 6.2.

---

## 8. Escopo deste Batch

### Autorizado
- Definir produto do tenant bootstrap (§1), membership (§2), before/after (§3),
  classificação de dados (§4), risk controls (§5) e o contrato de elegibilidade do 6.2 (§6).

### Proibido
- Preparar SQL; executar SQL; criar tenant/membership/seed/policy; alterar
  `platform/`/código; usar MCP/service role; atualizar mapa operacional; criar evidence;
  abrir o Batch 6.2.

## 9. Stop Conditions

- Necessidade de schema real para concluir uma decisão **bloqueante** → registrar como
  pendência para o Planner no 6.2; **não** inventar schema.
- Pressão para preparar/executar SQL, criar tenant/membership ou abrir o 6.2 → recusar;
  não autorizado neste batch.

---

## Confirmação de Não-Execução

Este artefato é **definição de produto** em texto de spec. **Não** preparou SQL, **não**
executou SQL, **não** criou tenant/membership/seed/policy, **não** alterou
`platform/`/código, **não** usou MCP/service role, **não** atualizou o mapa operacional,
**não** criou evidence e **não** abriu o Batch 6.2. `tenant_memberships` e `tenants`
permanecem **vazios** (baseline 0/0). Qualquer ação concreta exige a frase de autorização
humana do gate correspondente (programa §8).

---

## Readiness deste Batch

`LANE_6_BATCH_6_1_TENANT_BOOTSTRAP_PRODUCT_DEFINED_NOT_SQL_READY`

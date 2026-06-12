# Pack 03 — Lane 6 · Batch 6.3 — Auth/RLS Review of SQL Manual Activation Plan v1

> Pack documental da **Lane 6 — Tenant Bootstrap / Membership Activation Layer**, Batch
> 6.3. **PARECER READ-ONLY — NÃO executa nada**: não executa SQL, não cria
> tenant/membership/seed/policy, não altera schema, não altera `platform/`/código, não usa
> MCP/service role, não versiona e‑mail/UUID real, não lê/imprime token/cookie/OAuth
> `code`, não cria evidence e não abre o Batch 6.4. Revisa formalmente o plano SQL manual
> do **Batch 6.2** (`fdda440`) antes de qualquer execução humana no Supabase SQL Editor.

Lane: 6 · Status da lane: **ABERTA (G1)** · Batch: **6.3 (revisão Auth/RLS)**
Projeto Supabase: `thwsltjcjrvtidhnfukc` · Data: 2026-06-12
Papéis ativados: **Auth/RLS Reviewer** (principal, read-only) · **Execution Coordinator** (handoff)

Gate recebido (G5): `AUTORIZO O AUTH/RLS REVIEWER A REVISAR O BATCH 6.2 DA LANE 6`

---

## 1. Arquivos lidos (somente leitura)

- `packs/lane-6-.../02-lane-6-batch-6.2-sql-manual-activation-plan-v1.md` (`fdda440`) — plano sob revisão
- `packs/lane-6-.../01-lane-6-batch-6.1-product-definition-pack-v1.md` (`7392a86`) — definição de produto
- `lanes/lane-6-tenant-bootstrap-membership-activation-execution-program-v1.md` (`529bb12`) — programa/gates
- `sql/lane-3-auth-tenant-boundary/01-rls-policies.sql` — **policies RLS reais** (`tenants_select_member`, `memberships_select_own`)
- `sql/lane-3-auth-tenant-boundary/00-preflight-inspection.sql` — FKs, RLS, indexes esperados
- `sql/yzi-os-manual-supabase-sql-plan-v1.md` — **schema real** de `tenants` / `tenant_memberships` (Blocks 2, 3, 5)

> Nenhum arquivo foi alterado. Revisão estritamente read-only.

---

## 2. Veredito

### **APROVADO PARA EXECUÇÃO HUMANA MANUAL**

O plano SQL do Batch 6.2 é **compatível com o schema real**, **preserva o tenant boundary**,
**não introduz service role no frontend**, **não cria bypass de RLS em runtime** e é
**reversível**. As duas únicas decisões deixadas "a confirmar pelo Auth/RLS Reviewer" — (a)
**não criar policy de escrita** e (b) **papel inicial `viewer`** — são **ratificadas** abaixo
como a opção mais segura. **Nenhum achado bloqueante.** **Nenhum patch obrigatório ao 6.2**
antes da execução.

> Há **uma decisão de design ratificada que diverge** da linguagem original do programa
> (§4.3/§4.4/§7) e do Batch 6.1 (§5), que anteciparam "uma policy de escrita mínima restrita a
> `auth.uid()`". Esta revisão conclui que **não criar policy de escrita é mais seguro** para o
> bootstrap via SQL Editor (ver §4). É um **refino de design**, não um defeito — registrar no
> evidence/closure da lane.

---

## 3. Achados por área

### 3.1 Schema — **OK**
Conferido contra o schema real (`yzi-os-manual-supabase-sql-plan-v1.md`, Blocks 2/3):

| Item do plano 6.2 | Schema real | Veredito |
|---|---|---|
| `INSERT INTO public.tenants (slug, name)`; `status` assume default | `slug text NOT NULL UNIQUE`, `name text NOT NULL`, `status NOT NULL DEFAULT 'active'` | ✅ compatível |
| `INSERT INTO public.tenant_memberships (tenant_id, user_id, role)`; `status` assume default | `tenant_id`/`user_id` NOT NULL FK; `role NOT NULL` (sem default); `status NOT NULL DEFAULT 'active'` | ✅ compatível |
| `role` ∈ `('owner','admin','operator','viewer')`, sem default (§4.4) | CHECK idêntico | ✅ correto |
| CTE `WITH novo_tenant AS (INSERT ... RETURNING id) INSERT ...` | data-modifying CTE válido no Postgres 15 | ✅ correto |

> **Correção relevante do plano:** o Batch 6.1 (§2) sugeria `owner` **ou `member`** como papel
> mínimo. O valor `member` **não existe** no CHECK real — o plano 6.2 (§4.4) já o descartou e
> ancorou a recomendação em `viewer`. Boa aderência ao schema real.

### 3.2 RLS — **OK**
Conferido contra as policies reais (`01-rls-policies.sql`):
- `tenants_select_member`: `FOR SELECT TO authenticated USING (EXISTS … membership WHERE user_id = auth.uid())`.
- `memberships_select_own`: `FOR SELECT TO authenticated USING (user_id = auth.uid())`.
- **Nenhuma** policy INSERT/UPDATE/DELETE; **nenhuma** referência a service role.

Implicação confirmada: após a ativação, o operador verá **apenas o seu** tenant; o `tenant_found`
acende porque a `tenants_select_member` exige a **existência** do membership — não papel elevado.

### 3.3 Tenant boundary — **PRESERVADO**
- A escrita liga **exclusivamente** `<OPERATOR_USER_ID>` (do operador validado no 5.4) ao tenant
  recém-criado; nenhum vínculo cross-tenant.
- Com 1 tenant / 1 membership, o isolamento P10 é trivialmente mantido: não há outro tenant a
  vazar, e a RLS SELECT já restringe a visibilidade ao próprio tenant.
- A escrita ocorre **fora do caminho de runtime** (SQL Editor privilegiado), então o boundary de
  runtime (anon key + SELECT policies) permanece intacto.

### 3.4 Role inicial — **OK (`viewer`)**
Ver decisão formal §5. A RLS não deriva capacidade de `role`; `viewer` é suficiente e mínimo.

### 3.5 Rollback — **SEGURO E SUFICIENTE**
- §6 remove membership (por `tenant_id`+`user_id`) e tenant (por `id`), em transação, e
  reconfirma baseline 0/0.
- `ON DELETE CASCADE` em `tenant_memberships` tornaria o R1 redundante, mas o R1 explícito é
  **clareza**, não defeito.
- Sem seed/migration a desfazer; **nenhuma policy a remover** (nenhuma criada). Retorno integral a
  `0/0` garantido.
- **Idempotência por verificação:** `slug` UNIQUE e `(tenant_id,user_id)` UNIQUE fazem a
  re-execução falhar — o pré-check 0/0 (§7.A do 6.2) é o controle correto.

### 3.6 Dados sensíveis — **OK**
- Apenas placeholders versionados (`<OPERATOR_EMAIL>`, `<OPERATOR_USER_ID>`, `<TENANT_ID>`,
  `<TENANT_SLUG>`, `<TENANT_NAME>`, `<MEMBERSHIP_ROLE>`).
- E‑mail/UUID resolvidos **em runtime pelo humano** no SQL Editor; nenhum token, cookie ou OAuth
  `code` é lido, exigido ou impresso. Conforme §3/§8 do 6.2.

### 3.7 Frontend / service role — **OK**
- §2/§5/§8 do 6.2 proíbem service role em qualquer ponto e mantêm o frontend **read-only**
  (anon key + SELECT policies da Lane 3). A única escrita é a ação manual privilegiada.

### 3.8 Policy de escrita — **DECISÃO FORMAL: NÃO CRIAR** (ver §4)

---

## 4. Decisão formal sobre policy de escrita

**Decisão: NÃO CRIAR policy de escrita (INSERT/UPDATE/DELETE) nesta ativação.**

**Justificativa:**
1. **A policy seria inerte para o bootstrap.** A execução é manual no SQL Editor sob a role
   `postgres` (owner, `BYPASSRLS`); uma policy INSERT **não** é consultada nesse caminho — não
   habilita nada que o bootstrap precise.
2. **Criar policy INSERT agora amplia a superfície e ameaça o boundary.** Uma policy "ingênua"
   `WITH CHECK (user_id = auth.uid())` em `tenant_memberships` permitiria que **qualquer usuário
   autenticado se auto-inserisse em qualquer tenant** (bastando conhecer/adivinhar um
   `tenant_id`) — um escalonamento cross-tenant (viola P10). Restringi-la a "owner/admin do
   tenant" cria um problema de **bootstrap circular** para o primeiro membership. Logo, a única
   policy de escrita "correta" seria complexa e prematura.
3. **Princípio de menor superfície / "risco de policy incorreta > risco de ausência de policy"**
   (alinhado ao `yzi-os-manual-supabase-sql-plan-v1` §10/§15 e à security-review spec): ausência
   de policy de escrita mantém o frontend sem qualquer caminho de mutação — estado seguro.

**Risco mitigado:** escalonamento de privilégio / inserção cross-tenant via frontend
(`RLS_POLICY_UNAUTHORIZED`), e exposição de um caminho de escrita amplo no runtime.

**Divergência registrada:** o programa (§4.3/§4.4/§7) e o 6.1 (§5) anteciparam "policy de escrita
mínima restrita a `auth.uid()`". Esta revisão **substitui** essa antecipação pela conclusão
"sem policy de escrita; escrita só via SQL Editor manual e reversível". Refino de design a constar
no evidence/closure. Se, no futuro, uma UI self-service de membership for criada (non-goal da Lane
6, programa §3), uma policy de escrita **adequadamente escopada** (com checagem de papel
administrativo no tenant) deverá ser desenhada e revisada em pack próprio — e o seu `DROP` entrará
no rollback **daquele** plano.

---

## 5. Decisão formal sobre role inicial

**Decisão: `viewer`.**

**Justificativa:** é o menor valor do CHECK real (`owner/admin/operator/viewer`) e é **suficiente**
para o objetivo — o operador **pertencer** e o cockpit renderizar `tenant_found`.

**Impacto em RLS:** **nenhum.** As policies reais não derivam capacidade de `role`:
`tenants_select_member` testa a **existência** do membership; `memberships_select_own` testa
`user_id = auth.uid()`. Portanto `viewer` produz exatamente o mesmo `tenant_found` que `owner`,
sem conceder privilégio administrativo (evita `admin`/`operator`/`owner` prematuros — non-goal do
programa §3). Se o humano quiser que o operador seja administrador do tenant de ativação, `owner`
é a **única** alternativa aceitável e continua sem efeito sobre o boundary de leitura; a decisão
final é humana no gate de execução.

---

## 6. Condições obrigatórias para execução humana

A execução manual do plano 6.2, se autorizada, está condicionada a **todas** as condições abaixo:

1. **Usar o Supabase SQL Editor manualmente** (role `postgres`/privilegiada) — nunca via agente,
   nunca via MCP, nunca via frontend.
2. **Substituir os placeholders localmente** (`<OPERATOR_EMAIL>` → `<OPERATOR_USER_ID>` → demais)
   **sem commit** — nenhum valor real entra em artefato versionado.
3. **Não colar e‑mail/UUID real** (nem token/cookie/OAuth `code`) em **nenhum** arquivo
   versionado, log de chat ou evidence.
4. **Rodar o pré-check 0/0 (§5.A do 6.2) antes** de inserir; se baseline ≠ 0/0, **parar**.
5. **Manter o rollback (§6 do 6.2) disponível** durante e após a execução; usar a transação
   (`BEGIN … COMMIT/ROLLBACK`) revisando a saída **antes** do `COMMIT`.
6. **Confirmar role `viewer`** (ou `owner`, por decisão humana explícita) no momento do INSERT.
7. **Registrar o resultado depois em evidence** (sob G8, Batch 6.4+), sem dado sensível.
8. **Não usar service role no frontend** nem criar qualquer policy de escrita.
9. **Não criar seed permanente**, migration ou fixture; a ativação permanece reversível.

---

## 7. Frase literal para autorizar a execução humana do SQL (aprovada)

Estando o plano **aprovado**, a execução manual exige a frase literal do gate **G6** do programa
(§8), referente ao plano do Batch 6.2:

> `AUTORIZO A EXECUÇÃO MANUAL DO PLANO SQL DO BATCH 6.2 DA LANE 6 NO SUPABASE SQL EDITOR, COM ROLLBACK DISPONÍVEL, SEM SERVICE ROLE NO FRONTEND`

**O agente não executa SQL.** A execução é **ação humana** no Supabase SQL Editor. Frases
insuficientes: "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça",
"sim", "bora", "continue".

---

## 8. Escopo deste Batch

### Autorizado
- Emitir o parecer Auth/RLS read-only (§1–§7): leitura, veredito, achados por área, decisão sobre
  policy de escrita, decisão sobre role inicial, condições de execução humana e frase de gate.

### Proibido
- Executar SQL; criar tenant/membership/seed/policy; alterar schema/`platform/`/código; usar
  MCP/service role; versionar e‑mail/UUID real; ler/imprimir token/cookie/`code`; criar evidence;
  abrir o Batch 6.4.

## 9. Stop Conditions

- Schema real divergente do assumido neste parecer (ex.: `role`/CHECK diferente) → **parar** e
  revisar antes de qualquer execução.
- Pressão para criar policy de escrita, usar service role, executar SQL ou abrir o 6.4 → recusar;
  não autorizado.

---

## Confirmação de Não-Execução

Este artefato é **parecer Auth/RLS** em texto de spec. **Não** executou SQL, **não** criou
tenant/membership/seed/policy, **não** alterou schema/`platform/`/código, **não** usou MCP/service
role, **não** versionou e‑mail/UUID real, **não** leu/imprimiu token/cookie/OAuth `code`, **não**
criou evidence e **não** abriu o Batch 6.4. `public.tenants` e `public.tenant_memberships`
permanecem **vazios** (baseline 0/0). A execução exige a frase humana do gate G6 (§7).

---

## Readiness deste Batch

`LANE_6_BATCH_6_3_AUTH_RLS_SQL_PLAN_APPROVED_NOT_EXECUTED`

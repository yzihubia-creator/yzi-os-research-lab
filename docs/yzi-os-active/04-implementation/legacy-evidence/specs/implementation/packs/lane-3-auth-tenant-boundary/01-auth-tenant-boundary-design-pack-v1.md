# Pack 01 — Auth and Tenant Boundary Design v1

## Readiness Statement

`PACK_01_DESIGN_DEFINED_NO_EXECUTION_AUTHORIZED`

Este pack é documental. Define o design da fronteira de auth e tenant antes de qualquer SQL ou escrita em `platform/`. Não executa código, não modifica arquivos, não usa MCP.

---

## Objetivo

Confirmar o design das RLS policies mínimas da Lane 3 e as pré-condições herdadas antes de qualquer execução SQL. Produto deste pack: entendimento verificado e decisão de prosseguir para o Pack 02.

---

## Escopo Autorizado

- Leitura dos evidence records das Lanes 1 e 2;
- Verificação documental do estado herdado (tabelas, RLS status, ausência de policies);
- Confirmação do design das duas policies SELECT;
- Decisão de prosseguir ou bloquear baseada no estado verificado.

---

## Escopo Proibido

- Executar SQL por qualquer via;
- Modificar `platform/` ou qualquer arquivo de código;
- Usar MCP;
- Criar migrations;
- Criar policies agora;
- Inserir dados ou seed;
- Criar subagents reais ou skills executáveis.

---

## Entradas

| Entrada | Arquivo |
|---------|---------|
| Evidence Lane 1 | `docs/specs/implementation/evidence/supabase-lane-1-foundation-ddl-evidence-v1.md` |
| Evidence Lane 2 | `docs/specs/implementation/evidence/platform-lane-2-supabase-client-foundation-evidence-v1.md` |
| Pack existente | `docs/specs/implementation/packs/auth-tenant-boundary-execution-pack-v1.md` |
| Mapa operacional | `docs/specs/implementation/yzi-os-spec-harness-execution-map-v1.md` |

---

## Design das Policies

### Policy 1 — `tenants_select_member`

Tabela: `public.tenants`
Operação: SELECT
Role: authenticated
Semântica: usuário autenticado vê apenas tenants dos quais é membro via `tenant_memberships`.

```
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE tenant_memberships.tenant_id = tenants.id
      AND tenant_memberships.user_id = auth.uid()
  )
)
```

### Policy 2 — `memberships_select_own`

Tabela: `public.tenant_memberships`
Operação: SELECT
Role: authenticated
Semântica: usuário autenticado vê apenas suas próprias memberships.

```
USING (user_id = auth.uid())
```

### Invariantes de Segurança

- `auth.uid()` retorna NULL para sessões anônimas → RLS bloqueia acesso automaticamente;
- service role não aparece em nenhuma policy;
- nenhuma policy de INSERT, UPDATE ou DELETE é criada nesta lane;
- policies são idempotentes via `CREATE POLICY IF NOT EXISTS` ou verificação prévia.

---

## Saídas Esperadas

- Confirmação documental do estado herdado (pré-condições OK ou FAILED);
- Design das políticas validado documentalmente;
- Decisão de avançar para Pack 02 ou bloquear.

---

## Validação

| Check | Critério de Aceitação |
|-------|----------------------|
| `precondition-tables` | `tenants` e `tenant_memberships` existem com RLS habilitado |
| `precondition-policies` | zero policies existentes (estado intencional) |
| `precondition-platform` | `client.ts` e `server.ts` existem; `@supabase/supabase-js` instalada |
| `design-check` | policies usam `auth.uid()`, sem service role, apenas SELECT |

---

## Stop Conditions

- Pré-condição de tabela ou RLS não confirmada → `PRECONDITION_FAILED` → parar;
- Policy existente inesperada encontrada → `UNEXPECTED_POLICY_STATE` → reportar e aguardar gate;
- Ambiguidade sobre escopo → `SCOPE_AMBIGUITY` → bloquear, nunca presumir.

---

## Evidence Esperado

Confirmar no chat: pré-condições verificadas, design validado, decisão de avançar. Não requer arquivo de evidence próprio — o preflight SQL (Pack 02) produz o evidence formal.

---

## Final Status

`PACK_01_DESIGN_DEFINED_NO_EXECUTION_AUTHORIZED`

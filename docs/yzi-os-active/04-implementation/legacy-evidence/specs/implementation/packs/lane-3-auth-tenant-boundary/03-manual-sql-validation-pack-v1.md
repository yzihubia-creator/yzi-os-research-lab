# Pack 03 — Manual SQL Validation v1

## Readiness Statement

`PACK_03_VALIDATION_DEFINED_NO_EXECUTION_AUTHORIZED`

Este pack define a validação pós-policy via SQL manual. Depende da execução confirmada e evidenciada do Pack 02. Não executa SQL, não usa MCP, não modifica `platform/`.

---

## Objetivo

Verificar, via SQL manual executado pelo humano, que as policies RLS foram criadas corretamente e que o comportamento de isolamento de tenant está funcionando conforme o design da Lane 3.

---

## Escopo Autorizado

- Fornecer SQL de validação pós-policy para execução manual pelo humano;
- Confirmar que as duas policies existem, estão ativas e têm a semântica correta;
- Confirmar que RLS está habilitado nas duas tabelas;
- Documentar o resultado no evidence correspondente.

---

## Escopo Proibido

- Executar SQL por qualquer via;
- Modificar `platform/`;
- Criar políticas adicionais;
- Inserir dados de validação funcional (isso é responsabilidade do seed opcional);
- Usar MCP;
- Service role em qualquer contexto.

---

## Entradas

| Entrada | Arquivo/Origem |
|---------|---------------|
| Evidence do Pack 02 | `lane-3-sql-execution-evidence-template-v1.md` preenchido |
| Gate humano L3-G3 | Aprovação explícita do humano para executar validação |
| SQL de Validação | `docs/specs/implementation/sql/lane-3-auth-tenant-boundary/02-post-policy-validation.sql` |

---

## Sequência de Execução Manual

1. Humano confirma que o evidence do Pack 02 está preenchido;
2. Gate L3-G3 emitido pelo humano;
3. Humano cola o conteúdo de `02-post-policy-validation.sql` no Supabase SQL Editor;
4. Humano reporta o output completo no chat;
5. Claude valida que o output confirma as duas policies com a semântica correta.

---

## Saídas Esperadas

Output do SQL de validação deve confirmar:

| Verificação | Resultado esperado |
|-------------|-------------------|
| `pg_policies` — `tenants_select_member` | cmd=SELECT, roles=authenticated, qual contém `tenant_memberships.user_id = auth.uid()` |
| `pg_policies` — `memberships_select_own` | cmd=SELECT, roles=authenticated, qual = `(user_id = auth.uid())` |
| RLS em `tenants` | `relrowsecurity = true` |
| RLS em `tenant_memberships` | `relrowsecurity = true` |
| Contagem de policies em `tenants` | 1 |
| Contagem de policies em `tenant_memberships` | 1 |

---

## Validação

| Check | Critério de Aceitação |
|-------|----------------------|
| `policies-exist` | Ambas as policies encontradas em `pg_policies` |
| `rls-active` | RLS habilitado nas duas tabelas |
| `cmd-select-only` | `cmd = 'SELECT'` em ambas as policies |
| `roles-authenticated` | `roles = '{authenticated}'` em ambas |
| `no-extra-policies` | Contagem = 1 por tabela (apenas as policies desta lane) |

---

## Stop Conditions

- Policy ausente ou com semântica errada → `POLICY_VALIDATION_FAILED` → parar e reportar;
- RLS desabilitado em qualquer tabela → `RLS_DISABLED` → parar imediatamente;
- Policy extra inesperada encontrada → `UNEXPECTED_POLICY` → reportar antes de prosseguir;
- Output vazio ou truncado → solicitar reenvio.

---

## Evidence Esperado

Preencher após execução:
`docs/specs/implementation/evidence/templates/lane-3-policy-validation-evidence-template-v1.md`

com: data, output da validação, checks passados, stop events, decisão de avançar.

---

## Final Status

`PACK_03_VALIDATION_DEFINED_NO_EXECUTION_AUTHORIZED`

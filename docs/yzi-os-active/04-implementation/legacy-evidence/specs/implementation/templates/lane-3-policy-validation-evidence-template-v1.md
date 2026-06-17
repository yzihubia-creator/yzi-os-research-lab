# Lane 3 — Policy Validation Evidence Template v1

## Readiness Statement

`[PREENCHER: ex. LANE_3_POLICY_VALIDATION_PASSED ou LANE_3_POLICY_VALIDATION_FAILED]`

---

## Contexto

- **Lane:** Lane 3 — Auth and Tenant Boundary
- **Pack:** Pack 03 — Manual SQL Validation
- **Data de execução:** [PREENCHER]
- **Executor do SQL:** humano, manualmente, Supabase SQL Editor (projeto `thwsltjcjrvtidhnfukc`)
- **Evidence anterior:** `lane-3-sql-execution-evidence-template-v1.md` preenchido

---

## SQL de Validação Executado

- [ ] `02-post-policy-validation.sql`

---

## Output da Validação (colar saída do SQL Editor)

```
[COLAR OUTPUT COMPLETO AQUI]
```

---

## Checklist de Validação

| Check | Resultado | Observação |
|-------|-----------|------------|
| `policies-exist` | [PASSOU / FALHOU] | 2 policies encontradas em `pg_policies` |
| `rls-active` | [PASSOU / FALHOU] | RLS habilitado nas duas tabelas |
| `cmd-select-only` | [PASSOU / FALHOU] | `cmd = 'SELECT'` em ambas |
| `roles-authenticated` | [PASSOU / FALHOU] | `roles = '{authenticated}'` em ambas |
| `no-extra-policies` | [PASSOU / FALHOU] | Contagem = 1 por tabela |
| `no-write-policies` | [PASSOU / FALHOU] | Zero policies de INSERT/UPDATE/DELETE |
| `tenants-select-member-qual` | [PASSOU / FALHOU] | `qual` contém `tenant_memberships.user_id = auth.uid()` |
| `memberships-select-own-qual` | [PASSOU / FALHOU] | `qual = (user_id = auth.uid())` |

---

## Stop Events

`[NONE ou listar eventos com código]`

---

## Decisão de Avançar

- [ ] Todos os checks obrigatórios passaram → avançar para Pack 04 ou 05
- [ ] Um ou mais checks falharam → bloquear; descrever abaixo:

`[PREENCHER se bloqueado]`

---

## Próxima Ação

`[PREENCHER: avançar para Pack 04 (health check) / avançar para Pack 05 (evidence final) / bloquear por: ...]`

---

## Final Status

`[PREENCHER]`

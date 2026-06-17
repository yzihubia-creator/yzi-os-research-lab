# Skill Spec — RLS Policy Validation v1

## Status

`SPEC_ONLY_NO_SKILL_CREATED`

Esta é uma **especificação documental** de uma skill futura. Nenhuma skill executável foi criada. A criação da skill real exige task separada com gate humano explícito.

---

## Quando Usar

Ao receber do humano o output SQL do Supabase SQL Editor após execução das policies RLS, para confirmar que o estado do banco corresponde ao esperado pelo pack vigente.

---

## Inputs

| Input | Tipo |
|-------|------|
| Output SQL colado pelo humano | Texto |
| Estado esperado das policies (do pack) | Seção do pack vigente |
| Tabelas alvo | Lista: `tenants`, `tenant_memberships` |

---

## Passos

1. Extrair do output: lista de policies encontradas em `pg_policies`;
2. Verificar que `tenants_select_member` existe com `cmd=SELECT` e `roles={authenticated}`;
3. Verificar que `memberships_select_own` existe com `cmd=SELECT` e `roles={authenticated}`;
4. Verificar que `qual` da policy de tenants referencia `tenant_memberships.user_id = auth.uid()`;
5. Verificar que `qual` da policy de memberships é `(user_id = auth.uid())`;
6. Verificar contagem total de policies: exatamente 1 por tabela;
7. Verificar ausência de policies INSERT, UPDATE, DELETE ou ALL;
8. Verificar ausência de referência a service role em qualquer policy;
9. Verificar RLS habilitado nas duas tabelas.

---

## Outputs

| Output | Tipo |
|--------|------|
| Relatório: VALIDADO / FALHOU | Texto |
| Checks individuais com resultado | Tabela |
| Stop events identificados | Lista |
| Recomendação: avançar ou bloquear | Texto |

---

## Stop Conditions

- Qualquer policy com cmd≠SELECT → `UNEXPECTED_WRITE_POLICY`;
- Policy ausente → `POLICY_VALIDATION_FAILED`;
- Service role em qualquer policy → `SECRET_EXPOSURE` → parar imediatamente;
- RLS desabilitado em qualquer tabela → `RLS_DISABLED` → parar;
- Output incompleto → solicitar reenvio antes de concluir.

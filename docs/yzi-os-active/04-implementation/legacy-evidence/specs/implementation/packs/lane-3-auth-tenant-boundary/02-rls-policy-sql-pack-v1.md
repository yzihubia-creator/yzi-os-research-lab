# Pack 02 — RLS Policy SQL v1

## Readiness Statement

`PACK_02_RLS_SQL_DEFINED_NO_EXECUTION_AUTHORIZED`

Este pack define o SQL de RLS policies para execução manual pelo humano no Supabase SQL Editor. Não executa SQL, não usa MCP, não modifica `platform/`.

---

## Objetivo

Fornecer ao humano os arquivos SQL necessários para criar as policies RLS mínimas nas tabelas `public.tenants` e `public.tenant_memberships`, com verificação pós-execução embutida.

---

## Escopo Autorizado

- Gerar e apresentar os arquivos SQL da seção SQL desta lane;
- Orientar o humano sobre a sequência correta de execução manual;
- Receber o output reportado pelo humano e confirmar o estado esperado.

---

## Escopo Proibido

- Executar SQL por qualquer via (agente, MCP, migration);
- Modificar `platform/`;
- Criar policies programaticamente;
- Usar service role;
- Inserir dados ou tenants;
- Criar subagents reais ou skills executáveis.

---

## Entradas

| Entrada | Arquivo |
|---------|---------|
| Evidence do Pack 01 | Confirmação documental do design e pré-condições |
| SQL Preflight | `docs/specs/implementation/sql/lane-3-auth-tenant-boundary/00-preflight-inspection.sql` |
| SQL Policies | `docs/specs/implementation/sql/lane-3-auth-tenant-boundary/01-rls-policies.sql` |
| Gate humano L3-G2 | Aprovação explícita do humano para executar policies |

---

## Sequência de Execução Manual

1. Humano cola o conteúdo de `00-preflight-inspection.sql` no Supabase SQL Editor;
2. Humano reporta o output completo no chat;
3. Claude confirma que o output é consistente com o estado esperado;
4. Humano solicita gate L3-G2 para avançar para as policies;
5. Humano cola o conteúdo de `01-rls-policies.sql` no Supabase SQL Editor;
6. Humano reporta o output completo no chat;
7. Claude confirma as duas policies criadas.

---

## Saídas Esperadas

Após execução manual pelo humano:

| Objeto | Estado esperado |
|--------|----------------|
| Policy `tenants_select_member` | EXISTS em `public.tenants`, FOR SELECT, TO authenticated |
| Policy `memberships_select_own` | EXISTS em `public.tenant_memberships`, FOR SELECT, TO authenticated |
| RLS status | Habilitado nas duas tabelas (preservado) |
| Service role | Ausente em todas as policies |
| Linhas inseridas | Zero (policies não inserem dados) |

---

## Validação

| Check | Critério de Aceitação |
|-------|----------------------|
| `preflight-clean` | Output do preflight confirma zero policies e RLS ativo |
| `policy-created-tenants` | Output confirma `tenants_select_member` criada sem erro |
| `policy-created-memberships` | Output confirma `memberships_select_own` criada sem erro |
| `no-service-role` | Service role não aparece em nenhum output ou arquivo |
| `no-data-inserted` | Nenhum INSERT no output |

---

## Stop Conditions

- Output do preflight indicar policies existentes inesperadas → reportar e aguardar gate;
- Erro SQL no output das policies → `SQL_OUTPUT_ERROR` → parar;
- Qualquer menção a service role no output → `SECRET_EXPOSURE` → parar imediatamente;
- Output incompleto ou cortado → solicitar reenvio antes de prosseguir.

---

## Evidence Esperado

Após execução manual pelo humano, preencher:
`docs/specs/implementation/evidence/templates/lane-3-sql-execution-evidence-template-v1.md`

com: data, SQL executado, output reportado, checks passados, stop events, próxima ação.

---

## Final Status

`PACK_02_RLS_SQL_DEFINED_NO_EXECUTION_AUTHORIZED`

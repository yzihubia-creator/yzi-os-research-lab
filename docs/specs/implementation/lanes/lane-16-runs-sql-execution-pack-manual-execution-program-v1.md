# Lane 16 - Runs SQL Execution Pack Manual: Execution Program v1

Branch: `lane-1-6-foundation`

Readiness de fechamento esperado:
`LANE_16_RUNS_SQL_EXECUTION_PACK_MANUAL_CLOSED_NOT_EXECUTED`

## 1. Objetivo

Preparar um SQL pack manual para futura tabela e policies de controlled runs/evidence, alinhado ao
contrato documental da Lane 15.

Este programa e seu SQL associado sao artefatos documentais. O SQL sera salvo como arquivo, nao
executado nesta lane.

## 2. Declaracoes obrigatorias de nao execucao

- SQL sera salvo como arquivo, nao executado.
- Nenhuma tabela sera criada agora.
- Nenhuma policy sera criada agora.
- Nenhum schema sera alterado agora.
- Nenhuma persistencia sera ativada agora.
- Nenhum agente real, runner, scheduler, tool real ou memoria operacional sera criado.
- Nenhum dado sera inserido, atualizado ou removido.
- Nenhum efeito colateral sera produzido.

## 3. Escopo permitido

- DDL proposta para tabela futura de controlled runs/evidence.
- RLS proposta.
- Policies propostas tenant-scoped.
- Indices minimos para leitura por tenant e auditoria temporal.
- Comentarios de seguranca.
- Rollback manual.
- Checklist de aplicacao humana.
- Checklist de validacao pos-SQL.

## 4. Escopo proibido

- Executar SQL.
- Usar MCP.
- Usar service role.
- Criar seed.
- Fazer write em banco.
- Alterar auth, tenant ou membership.
- Criar trigger, funcao, scheduler, runner, tool real, agente real ou memoria operacional.
- Abrir Lane 18 ou criar qualquer execution program da Lane 18.

## 5. Artefato SQL esperado

Arquivo:
`docs/specs/implementation/sql/lane-16-runs-evidence-manual-sql-pack-v1.sql`

Natureza:
SQL manual, conservador, multi-tenant e fail-closed, contendo:

1. Header / finalidade / nao execucao.
2. DDL proposta para tabela de controlled runs/evidence.
3. RLS enable.
4. Policies propostas tenant-scoped.
5. Indices minimos.
6. Comentarios de seguranca.
7. Rollback manual.
8. Checklist de aplicacao humana.
9. Checklist de validacao pos-SQL.

## 6. Postura de seguranca

O pack deve partir de default-deny:

- RLS habilitada.
- Leitura somente para usuario autenticado com membership no tenant.
- Insert somente para usuario autenticado escrevendo como `operator_user_id = auth.uid()`, com
  membership no tenant e `side_effects = 'none'`.
- Sem policies iniciais de update/delete.
- Sem service role.
- Sem trigger.
- Sem funcao.
- Sem scheduler.

## 7. Criterios de fechamento

- SQL pack existe no caminho esperado.
- Evidence da Lane 16 existe.
- Closure gate da Lane 16 existe.
- Mapa/checklist compartilhados estao atualizados no bloco.
- Lint/build do `platform` permanecem verdes no fechamento do bloco.
- Nenhum SQL foi executado.
- Nenhum MCP foi usado.
- Nenhum push foi feito.

## 8. Readiness final da Lane 16

`LANE_16_RUNS_SQL_EXECUTION_PACK_MANUAL_CLOSED_NOT_EXECUTED`

Este readiness fecha apenas a preparacao documental do pack manual. Ele nao autoriza aplicacao em banco
e nao abre Lane 18.

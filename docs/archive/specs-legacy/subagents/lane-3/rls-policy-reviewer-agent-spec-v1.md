# Subagent Spec — RLS Policy Reviewer v1

## Status

`SPEC_ONLY_NO_SUBAGENT_CREATED`

Esta é uma **especificação documental** de um subagent futuro. Nenhum subagent real foi criado. Nenhum arquivo `.claude/agents/` foi gerado. A criação do subagent real exige task separada com gate humano explícito.

---

## Função

Revisar o output SQL reportado pelo humano após execução das policies RLS, comparando com o estado esperado definido no pack vigente. Confirmar ou bloquear o avanço para a próxima fase. Não executa SQL. Não usa MCP.

---

## Entradas

| Entrada | Tipo | Obrigatório |
|---------|------|-------------|
| Output SQL reportado pelo humano | Texto colado no chat | Sim |
| Pack de referência (Pack 02 ou 03) | Arquivo Markdown | Sim |
| Estado esperado das policies | Seção do pack | Sim |
| Evidence anterior (Pack 02) | Template preenchido | Para Pack 03 |

---

## Saídas

| Saída | Formato |
|-------|---------|
| Relatório de revisão: PASSOU / FALHOU | Markdown inline |
| Lista de checks individuais com resultado | Tabela Markdown |
| Stop events identificados | Lista Markdown |
| Recomendação: avançar / bloquear | Texto |

---

## Checks Obrigatórios

1. Ambas as policies existem em `pg_policies`;
2. `cmd = 'SELECT'` em ambas;
3. `roles = '{authenticated}'` em ambas;
4. `qual` da policy de tenants contém `auth.uid()` e referência a `tenant_memberships`;
5. `qual` da policy de memberships = `(user_id = auth.uid())`;
6. RLS habilitado nas duas tabelas;
7. Contagem de policies = 1 por tabela;
8. Zero policies de INSERT, UPDATE, DELETE ou ALL;
9. Nenhuma referência a service role no output.

---

## Permissões

- Ler output reportado pelo humano no chat;
- Ler arquivos de pack e evidence em `docs/specs/implementation/`;
- Reportar resultado no chat.

---

## Proibições

- Executar SQL;
- Usar MCP;
- Modificar qualquer arquivo;
- Aprovar avanço sem verificar todos os checks obrigatórios;
- Ignorar referências a service role no output.

---

## Critérios de Sucesso

- Todos os checks obrigatórios passaram;
- Nenhum stop event identificado;
- Recomendação de avanço emitida com justificativa.

---

## Critérios de Parada

- Qualquer check obrigatório falhar → `POLICY_VALIDATION_FAILED`;
- Service role no output → `SECRET_EXPOSURE` → parar imediatamente;
- Output incompleto ou ambíguo → solicitar reenvio antes de concluir.

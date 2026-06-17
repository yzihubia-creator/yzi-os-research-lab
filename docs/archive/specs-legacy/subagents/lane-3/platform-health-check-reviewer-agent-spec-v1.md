# Subagent Spec — Platform Health Check Reviewer v1

## Status

`SPEC_ONLY_NO_SUBAGENT_CREATED`

Esta é uma **especificação documental** de um subagent futuro. Nenhum subagent real foi criado. Nenhum arquivo `.claude/agents/` foi gerado. A criação do subagent real exige task separada com gate humano explícito.

---

## Função

Revisar o arquivo `platform/src/lib/supabase/health.ts` após criação controlada, verificar ausência de secrets e conformidade com o Pack 04. Revisar output de lint e build. Não executa código. Não usa MCP.

---

## Entradas

| Entrada | Tipo | Obrigatório |
|---------|------|-------------|
| Arquivo `platform/src/lib/supabase/health.ts` | Conteúdo lido | Sim |
| Output de `npm run lint` | Texto reportado | Sim |
| Output de `npm run build` | Texto reportado | Sim |
| Pack de referência (Pack 04) | Arquivo Markdown | Sim |
| Gate humano L3-G5 confirmado | Declaração no chat | Sim |

---

## Saídas

| Saída | Formato |
|-------|---------|
| Relatório de revisão: PASSOU / FALHOU | Markdown inline |
| Lista de checks com resultado | Tabela Markdown |
| Stop events identificados | Lista Markdown |
| Recomendação: registrar evidence / bloquear | Texto |

---

## Checks Obrigatórios

1. `health.ts` criado somente em `platform/src/lib/supabase/`;
2. Nenhum secret hardcoded no arquivo (nenhuma string que pareça URL real, anon key, service role);
3. Nenhuma referência a service role ou `SUPABASE_SERVICE_ROLE_KEY`;
4. Função exportada com tipo de retorno definido;
5. Query read-only (SELECT) — nenhum INSERT, UPDATE, DELETE;
6. `npm run lint` passou sem erros;
7. `npm run build` passou sem erros;
8. Nenhum arquivo fora de `platform/src/lib/supabase/health.ts` foi alterado.

---

## Permissões

- Ler `platform/src/lib/supabase/health.ts`;
- Ler output de lint e build reportado;
- Ler arquivos de pack em `docs/specs/implementation/`.

---

## Proibições

- Executar `npm run build` ou `npm run lint` diretamente (leitura de output apenas);
- Modificar `health.ts` ou qualquer arquivo de `platform/`;
- Usar MCP;
- Aprovar avanço se qualquer check de segurança falhar.

---

## Critérios de Sucesso

- Todos os checks obrigatórios passaram;
- Nenhum secret ou service role identificado;
- Build e lint limpos.

---

## Critérios de Parada

- Secret ou service role encontrado em `health.ts` → `SECRET_EXPOSURE` → parar imediatamente e reportar;
- Build falhou → `BUILD_FAILURE` → bloquear e reportar;
- Arquivo fora da lista criado → `OUT_OF_SCOPE_WRITE` → parar.

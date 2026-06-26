# Evidência — YZI Execution Harness Lite v0.1 (Hooks First)

## Objetivo

Implementar os primeiros 5 hooks determinísticos de enforcement do YZI
Execution Harness Lite, sem MCP, sem LLM, sem dependência externa, conforme
autorização explícita do humano para esta task.

## Arquivos criados

- `.claude/hooks/block-service-role.sh`
- `.claude/hooks/warn-mcp-unauthorized.sh`
- `.claude/hooks/warn-out-of-path.sh`
- `.claude/hooks/warn-long-doc.sh`
- `.claude/hooks/require-lint-build-before-commit.sh`
- `.claude/settings.json` (novo — não existia antes; registra os 5 hooks
  como `PreToolUse`)

## Hooks implementados

1. **block-service-role.sh** — bloqueia (`exit 2`) qualquer chamada
   Bash/Edit/Write/MultiEdit cujo conteúdo contenha `service_role` ou
   `SUPABASE_SERVICE_ROLE_KEY`.
2. **warn-mcp-unauthorized.sh** — bloqueia chamadas que referenciem MCP
   (`mcp__`, `.mcp.json`, etc.), exceto se existir
   `.claude/ALLOW_MCP_FOR_THIS_TASK` (não criado automaticamente).
3. **warn-out-of-path.sh** — alerta (não bloqueia) edição/escrita fora de
   `.claude/` ou `docs/`.
4. **warn-long-doc.sh** — bloqueia criação de novo `.md` com mais de 120
   linhas fora de `docs/specs/implementation/evidence/`.
5. **require-lint-build-before-commit.sh** — ao detectar `git commit` no
   comando, roda `npm run lint` e `npm run build` em `platform/`; bloqueia o
   commit se qualquer um falhar ou se `platform/package.json` não existir.

## Validações realizadas

- `bash -n` em todos os 5 scripts: sintaxe válida.
- `python3 -c "import json; json.load(...)"` em `.claude/settings.json`:
  JSON válido.
- Testes funcionais isolados (stdin simulado) para cada hook, cobrindo
  caminho de bloqueio e caminho de passagem. Um bug real foi encontrado e
  corrigido em `warn-long-doc.sh` (`set -e` abortava o script quando o
  `grep` de contagem de linhas não encontrava nenhum match).
- Confirmação orgânica em produção: durante os próprios testes, os hooks
  `block-service-role.sh` e `warn-mcp-unauthorized.sh`, já registrados em
  `settings.json`, interceptaram e bloquearam comandos Bash reais desta
  sessão que continham os padrões proibidos.
- `npm run lint` em `platform/`: passou (exit 0).
- `npm run build` em `platform/`: passou (exit 0), build completo gerado.

## Limitações conhecidas

- Parsing de JSON via `grep`/`sed`, não `jq` (decisão deliberada: sem
  dependência externa). Funciona para JSON de tool_input em linha única;
  pode falhar em casos com aspas escapadas complexas dentro do conteúdo.
- `warn-out-of-path.sh` e `warn-long-doc.sh` extraem apenas o primeiro
  `file_path`/`content` da entrada; não cobrem múltiplos arquivos em uma
  única chamada `MultiEdit`.
- `require-lint-build-before-commit.sh` assume que o único app relevante
  é `platform/`; não generaliza para outros workspaces.
- `warn-mcp-unauthorized.sh` depende de um arquivo de flag manual; não há
  mecanismo de expiração automática do flag (deve ser removido manualmente
  pelo humano após a task autorizada).

## Próximos passos recomendados

- Não criar mais hooks nem agentes sem necessidade comprovada de uso real.
- Revisar estes 5 hooks após algumas semanas de uso para confirmar se geram
  ruído (falso positivo) ou se realmente previnem violação.
- Nenhum commit foi feito automaticamente nesta task — commit requer
  autorização humana separada.

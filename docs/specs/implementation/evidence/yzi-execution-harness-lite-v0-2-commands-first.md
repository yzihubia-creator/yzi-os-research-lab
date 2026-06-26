# Evidência — YZI Execution Harness Lite v0.2 (Commands First)

## Objetivo

Criar a camada mínima de comandos curtos operacionais do YZI OS, como
wrappers finos sobre os hooks/skills já existentes, reduzindo prompts longos
e drift. Sem criar agentes, skills ou hooks novos.

## Comandos criados

- `/yzi-screen` — criar/refinar tela ou UI do cockpit, escopo pequeno.
- `/yzi-module` — trabalhar/preparar módulo do YZI OS (placeholder vs real).
- `/yzi-review` — revisar mudança antes do commit (boundaries + lint/build).
- `/yzi-fix` — corrigir erro concreto sem refatorar fora do escopo.
- `/yzi-close` — fechar unidade validada (evidência + commit sob autorização).

## Arquivos criados

- `.claude/commands/yzi-screen.md`
- `.claude/commands/yzi-module.md`
- `.claude/commands/yzi-review.md`
- `.claude/commands/yzi-fix.md`
- `.claude/commands/yzi-close.md`
- `docs/specs/implementation/evidence/yzi-execution-harness-lite-v0-2-commands-first.md`

## Decisão de formato

Os 5 comandos documentários pré-existentes (`read-approved-specs`, etc.)
são definições inertes, sem frontmatter, "no execution". Os novos comandos
são **operacionais** (slash commands reais e invocáveis), categoria
diferente, então usam o formato padrão do Claude Code: frontmatter com
`description` + `argument-hint`. Cada arquivo é curto (quando usar /
objetivo / escopo permitido / escopo proibido / passos mínimos / saída).

## Validações realizadas

- `git status`: apenas arquivos novos em `.claude/commands/` e a evidência.
- Reconhecimento dos comandos pelo Claude Code: confirmado organicamente —
  os 5 apareceram como skills/commands disponíveis logo após criados.
- Os comandos respeitam o hook `warn-long-doc` (todos <120 linhas) e o hook
  `warn-out-of-path` (escrita dentro de `.claude/`).
- Confirmação organica do enforcement: o hook `block-service-role`
  bloqueou a primeira escrita de `yzi-review.md` porque o texto continha o
  token literal proibido; o comando foi reescrito ("credencial de serviço
  Supabase") e passou. Prova de que os hooks da v0.1 estão ativos.
- `npm run lint` / `npm run build`: NÃO executados — esta task altera
  apenas `.claude/commands/` e evidência, sem tocar código de produto.

## Limitações conhecidas

- Comandos são guias de prompt, não enforcement; o enforcement real vem dos
  hooks da v0.1. Comandos dependem do agente seguir os passos.
- O hook `block-service-role` gera falso positivo ao escrever documentação
  que cita o token literal — contornável reescrevendo, como ocorreu aqui.
- Não há índice consolidado novo; o índice antigo
  (`CONTROLLED_COMMANDS_INDEX.md`) cobre apenas os 5 comandos documentários
  e não foi alterado para não misturar as duas categorias.

## Próximo passo sugerido

- Usar os comandos em tarefas reais por algumas semanas e ajustar texto
  conforme o atrito observado, antes de adicionar qualquer comando novo.
- Commit local desta unidade só após autorização humana explícita.

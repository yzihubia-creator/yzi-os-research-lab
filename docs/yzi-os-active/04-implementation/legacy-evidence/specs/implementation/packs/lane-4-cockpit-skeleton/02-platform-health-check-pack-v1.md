# Pack 02 — Platform Health Check v1

> Pack documental da Lane 4 — Cockpit Skeleton. Não executa nada agora. Corresponde ao Step 3 do runbook. Gate requerido: L4-G1.

## Objetivo

Implementar (quando autorizado) o health/check mínimo de conectividade TypeScript contra o Supabase real — diferido das Lanes 2 e 3 — provando que `platform/` alcança o banco com anon key antes de qualquer UI.

## Escopo Autorizado

- Criar `platform/src/lib/supabase/health.ts` usando apenas os clients existentes e anon key;
- Atualizar `platform/README.md` somente se precisar documentar configuração;
- TypeScript puro; nenhuma dependência nova.

## Escopo Proibido

- Service role ou qualquer secret;
- Dependência nova, migration, SQL, MCP;
- Build/execução neste step (validação fica no Step 7);
- Qualquer arquivo fora dos dois listados.

## Entradas

- Gate L4-G1 (frase explícita do humano);
- `client.ts`/`server.ts` existentes;
- Skill spec `supabase-client-boundary-skill-v1`.

## Saídas Esperadas

- `health.ts` criado, com retorno tipado (ok/erro) e sem secret em output.

## Validação

- Checklist da skill `supabase-client-boundary-skill-v1` PASSOU;
- Revisão documental conforme subagent spec `platform-frontend-planner-agent-spec-v1`;
- Execução real do check ocorre no Step 7/8 com output colado no evidence.

## Stop Conditions

- Necessidade de secret → `SECRET_EXPOSURE`;
- Arquivo fora da lista → `OUT_OF_SCOPE_WRITE`;
- Python proposto → `LANGUAGE_VIOLATION`.

## Evidence Esperado

`evidence/templates/lane-4-health-check-evidence-template-v1.md` preenchido com output real.

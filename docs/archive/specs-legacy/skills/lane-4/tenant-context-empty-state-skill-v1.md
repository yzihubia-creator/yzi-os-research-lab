# Skill Spec — Tenant Context Empty State (Lane 4) v1

> Spec documental apenas. Não é skill executável, não cria arquivo `.claude/`, não roda nada. Materialização exige task própria e gate humano.

## Quando Usar

Na revisão do Step 5 (tenant context) e do Step 8 (validação de estado vazio).

## Inputs

- `tenant-context.ts` (diff ou leitura);
- Estado do banco (reportado pelo humano: 0 tenants, 0 memberships);
- Renderização do cockpit observada pelo humano.

## Passos

1. Confirmar que o tipo de retorno distingue explicitamente: tenant presente / sem membership / sem sessão;
2. Confirmar que "sem membership" produz estado vazio tipado — nunca tenant fake, nunca mock;
3. Confirmar que nenhum erro de RLS vaza como crash não tratado;
4. Confirmar que a UI consome o estado vazio com mensagem honesta ("você ainda não pertence a um tenant" ou equivalente);
5. Confirmar que nenhum caminho de código insere dados para "resolver" o vazio;
6. Registrar resultado textual.

## Outputs

- Parecer APROVADO/REPROVADO com checklist;
- Descrição do comportamento observado por estado.

## Stop Conditions

- Dado inventado exibido → `DISHONEST_EMPTY_STATE`;
- Escrita no banco proposta para popular estado → `UNAUTHORIZED_SQL_EXECUTION`;
- Estado indistinguível (vazio vs erro) → REPROVADO, reportar.

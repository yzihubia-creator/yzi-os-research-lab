# Skill Spec — Supabase Client Boundary (Lane 4) v1

> Spec documental apenas. Não é skill executável, não cria arquivo `.claude/`, não roda nada. Materialização exige task própria e gate humano.

## Quando Usar

Sempre que código futuro da Lane 4 tocar Supabase (Steps 3, 4 e 5): health check, sessão, tenant context.

## Inputs

- Arquivo alvo e step vigente;
- `client.ts` / `server.ts` existentes (leitura);
- Evidence da Lane 3 (policies vigentes).

## Passos

1. Confirmar que somente os clients existentes (ou `@supabase/ssr` aprovada em D3) são usados — nenhum client novo paralelo;
2. Confirmar que apenas anon key/url públicas são referenciadas;
3. Confirmar que toda query é SELECT sobre `tenants`/`tenant_memberships` (RLS da Lane 3);
4. Confirmar que falha de RLS/ausência de linha é tratada como estado vazio, não como exceção silenciada nem dado inventado;
5. Registrar resultado textual.

## Outputs

- Checklist textual PASSOU/FALHOU;
- Lista de queries detectadas com tabela e operação.

## Stop Conditions

- Service role referenciada → `SECRET_EXPOSURE`;
- INSERT/UPDATE/DELETE detectado → `UNAUTHORIZED_SQL_EXECUTION` (escrita não tem policy por design);
- Client paralelo criado fora de `src/lib/supabase/` → `OUT_OF_SCOPE_WRITE`.

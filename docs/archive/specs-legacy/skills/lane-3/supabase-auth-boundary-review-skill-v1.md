# Skill Spec — Supabase Auth Boundary Review v1

## Status

`SPEC_ONLY_NO_SKILL_CREATED`

Esta é uma **especificação documental** de uma skill futura. Nenhuma skill executável foi criada. A criação da skill real exige task separada com gate humano explícito.

---

## Quando Usar

Ao revisar qualquer arquivo TypeScript de `platform/` que interaja com Supabase Auth, para garantir que a fronteira de autenticação e tenant está correta: sem service role, somente variáveis públicas, sem exposição de secrets, sem criação de dados não autorizados.

---

## Inputs

| Input | Tipo |
|-------|------|
| Conteúdo do arquivo TypeScript a ser revisado | Texto |
| Pack de referência autorizado | Arquivo Markdown |
| Variáveis de ambiente esperadas | Lista: `NEXT_PUBLIC_*` apenas |

---

## Passos

1. Verificar que nenhuma variável `SERVICE_ROLE` ou `SECRET` é importada ou referenciada;
2. Verificar que somente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` são usadas;
3. Verificar que o arquivo não lê `.env.local` diretamente (somente via `process.env.NEXT_PUBLIC_*`);
4. Verificar que nenhum INSERT, UPDATE ou DELETE é executado no arquivo;
5. Verificar que `auth.uid()` é o mecanismo de identificação (não hardcode de UUIDs);
6. Verificar que erros de autenticação são retornados como valores, não logados com conteúdo sensível;
7. Verificar que o arquivo está dentro do path autorizado pelo pack vigente;
8. Verificar ausência de `createClient` com service role key.

---

## Outputs

| Output | Tipo |
|--------|------|
| Resultado: APROVADO / BLOQUEADO | Texto |
| Checks individuais com resultado | Tabela |
| Justificativa de bloqueio (se houver) | Texto |

---

## Stop Conditions

- Service role encontrada → `SECRET_EXPOSURE` → bloquear imediatamente e não prosseguir;
- INSERT, UPDATE ou DELETE encontrados → `UNAUTHORIZED_WRITE` → bloquear;
- Arquivo fora do path autorizado → `OUT_OF_SCOPE_WRITE` → bloquear;
- Variável não-pública (`SUPABASE_*` sem `NEXT_PUBLIC_`) referenciada → `SCOPE_AMBIGUITY` → alertar e aguardar gate.

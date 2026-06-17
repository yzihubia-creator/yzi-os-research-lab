# Pack 04 — Platform Health Check v1

## Readiness Statement

`PACK_04_HEALTH_CHECK_DEFINED_NO_EXECUTION_AUTHORIZED`

Este pack é **opcional** nesta lane. Define o health/check mínimo de conectividade TypeScript contra o Supabase real, diferido da Lane 2. Só é executado mediante gate humano explícito L3-G5. Não executa código agora, não modifica `platform/`, não usa MCP.

---

## Objetivo

Criar um utilitário TypeScript mínimo de health/check em `platform/src/lib/supabase/health.ts` que confirme conectividade real com o Supabase do projeto `thwsltjcjrvtidhnfukc`, usando o client server existente com variáveis públicas. Não expõe secrets. Não cria tenant. Não insere dados.

---

## Escopo Autorizado

- Criar `platform/src/lib/supabase/health.ts` apenas;
- Usar o client server existente (`server.ts`) com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
- Query de saúde read-only: `SELECT 1` ou contagem de tabela sem filtro de auth;
- Verificar `npm run build` após escrita.

---

## Escopo Proibido

- Criar `platform/middleware.ts` ou qualquer outro arquivo de `platform/` neste pack;
- Usar service role;
- Criar tenant, inserir dados ou seed;
- Expor secrets em output ou log;
- Executar health/check em produção real sem gate humano;
- Usar MCP;
- Criar migrations ou subagents reais.

---

## Entradas

| Entrada | Arquivo/Origem |
|---------|---------------|
| Evidence do Pack 03 | `lane-3-policy-validation-evidence-template-v1.md` preenchido |
| Gate humano L3-G5 | Aprovação explícita do humano para criar `health.ts` |
| Client server existente | `platform/src/lib/supabase/server.ts` |
| Variáveis públicas | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (somente de `.env.example` ou `.env.local` pelo humano) |

---

## Arquivo Produzido

```
platform/src/lib/supabase/health.ts
```

Contrato mínimo:
- Função exportada `checkSupabaseHealth(): Promise<{ ok: boolean; error?: string }>`;
- Usa o client server (`createServerClient`);
- Executa query read-only para confirmar conectividade;
- Retorna `{ ok: true }` em sucesso ou `{ ok: false, error: mensagem }` em falha;
- Não loga secrets, não usa service role, não retorna dados de usuário.

---

## Saídas Esperadas

| Item | Estado esperado |
|------|----------------|
| `platform/src/lib/supabase/health.ts` | existe, sem service role, sem secrets hardcoded |
| `npm run build` | passa sem erros |
| `npm run lint` | passa sem erros |
| Secrets | zero em qualquer arquivo ou log |

---

## Validação

| Check | Critério de Aceitação |
|-------|----------------------|
| `path-check` | Somente `platform/src/lib/supabase/health.ts` criado |
| `secret-scan` | Nenhum secret real ou service role no arquivo |
| `build-check` | `npm run build` passou |
| `lint-check` | `npm run lint` passou |
| `no-insert-check` | Nenhum INSERT ou escrita de dados no utilitário |

---

## Stop Conditions

- `npm run build` falhar após escrita → `BUILD_FAILURE` → reverter e reportar;
- Secret ou service role aparecer no arquivo → `SECRET_EXPOSURE` → parar imediatamente;
- Escrita em arquivo fora da lista → `OUT_OF_SCOPE_WRITE` → parar;
- `npm audit` reportar vulnerabilidade crítica nova após qualquer instalação → reportar antes de prosseguir.

---

## Evidence Esperado

Preencher após execução:
`docs/specs/implementation/evidence/templates/lane-3-health-check-evidence-template-v1.md`

com: data, arquivo criado, outputs de lint e build, secret scan, stop events.

---

## Decisão de Pular Este Pack

Se o humano decidir não executar o health/check nesta lane, registrar explicitamente na sessão: `HEALTH_CHECK_DEFERRED_BY_HUMAN_DECISION`. O evidence final da Lane 3 deve mencionar essa decisão.

---

## Final Status

`PACK_04_HEALTH_CHECK_DEFINED_NO_EXECUTION_AUTHORIZED`

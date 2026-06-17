# Platform Foundation Execution Pack v1

## Readiness Statement

`PLATFORM_FOUNDATION_EXECUTION_PACK_V1_CREATED_DOCUMENTARY_ONLY_EXECUTION_NOT_AUTHORIZED`

Este documento é a **definição documental** do Execution Pack da Lane 2 — Platform Foundation, conforme o mapa operacional [`yzi-os-spec-harness-execution-map-v1`](../yzi-os-spec-harness-execution-map-v1.md). Ele segue Spec-Driven Development: **define** a execução futura, mas **não executa código, não modifica `platform/`, não instala dependências, não executa SQL, não usa MCP, não cria `.env`, não escreve secrets e não cria policies**. A execução exigirá gate humano próprio, posterior e explícito.

---

## Pack Name

`platform-foundation-execution-pack-v1`

---

## 1. Propósito da Lane 2

Preparar a **conexão segura do scaffold `platform/` com o Supabase** (projeto `thwsltjcjrvtidhnfukc`), em sequência futura curta e controlada — sem frontend real, sem cockpit real, sem auth completa e sem policies RLS. A Lane 2 entrega apenas a fundação de conectividade: inspeção do scaffold, estratégia de variáveis públicas e plano de client Supabase browser/server **sem service role**.

---

## 2. Pré-condições (herdadas da Lane 1)

Confirmadas em [`supabase-lane-1-foundation-ddl-evidence-v1`](../evidence/supabase-lane-1-foundation-ddl-evidence-v1.md) (`LANE_1_DDL_VALIDATED_SUCCESS`):

- `public.tenants` existe, RLS habilitado, 0 linhas;
- `public.tenant_memberships` existe, RLS habilitado, 0 linhas;
- nenhuma policy RLS funcional criada — tabelas inacessíveis via API (estado intencional);
- nenhum tenant real ou seed criado;
- `platform/` intocado até aqui.

Se qualquer pré-condição não se confirmar na execução futura: parar e reportar.

---

## 3. Escopo Autorizado Futuro (após gate humano)

Lista fechada do que a execução futura da Lane 2 **poderá** fazer, quando autorizada:

1. **Inspecionar a estrutura de `platform/`** — árvore de diretórios, arquivos de config do scaffold;
2. **Identificar dependências existentes** — leitura de `platform/package.json` e lockfile (sem instalar nada);
3. **Identificar estratégia segura de variáveis públicas** — uso de `NEXT_PUBLIC_SUPABASE_URL` e chave publishable/anon (valores públicos por design), documentada em `.env.example` com placeholders, nunca valores reais de secrets;
4. **Planejar o client Supabase browser/server** — desenho dos módulos de client (browser e server) **sem service role key em nenhuma hipótese**;
5. **Preparar health/check mínimo** — somente se aprovado em gate posterior específico; não incluído por default.

---

## 4. Escopo Proibido

Além do default (tudo fora da lista acima é proibido):

- frontend real / páginas de produto / cockpit;
- auth flow (login, signup, sessão, middleware de auth);
- RLS policies (criação, alteração ou remoção);
- backend real (rotas de negócio, API);
- SQL por qualquer via; MCP; migrations; seeds; tenants;
- service role key em qualquer arquivo, output ou log;
- criação de `.env` com valores reais;
- instalação de dependências sem gate humano explícito;
- alteração em `docs/**`, exceto o evidence final previsto na seção 8; `.claude/**`, `.agents/**` e `prototype/**` continuam proibidos;
- subagents; expansão de arquitetura além das specs aprovadas.

---

## 5. Arquivos Inspecionáveis na Execução Futura (read-only)

- `platform/**` — estrutura, configs, `package.json`, lockfile (leitura apenas);
- `docs/specs/implementation/yzi-os-platform-scaffold-spec-v1.md` — boundaries do scaffold;
- `docs/specs/implementation/yzi-os-supabase-mcp-governance-spec-v1.md` — regras de secrets;
- evidences da Lane 1 e baseline (`evidence/`);
- `.mcp.json` — apenas para confirmar `project_ref` (identificador público).

---

## 6. Arquivos Alteráveis Somente Após Autorização Humana

Lista fechada — nenhuma escrita ocorre sem gate humano explícito por item:

| Arquivo candidato | Conteúdo futuro |
| --- | --- |
| `platform/.env.example` | placeholders de `NEXT_PUBLIC_SUPABASE_URL` e chave publishable — sem valores reais |
| `platform/src/lib/supabase/client.ts` | client browser (somente chave pública) |
| `platform/src/lib/supabase/server.ts` | client server (somente chave pública; sem service role) |
| `platform/package.json` / lockfile | dependência `@supabase/supabase-js` (e auxiliares aprovadas), somente com gate de instalação |
| `platform/README.md` | nota curta de configuração Supabase |

Qualquer arquivo fora desta lista exige novo pack.

---

## 7. Verificação Esperada

| Check | Verificação | Aceitação |
| --- | --- | --- |
| `path-check` | arquivos tocados vs. lista da seção 6 | 100% dentro da lista |
| `secret-scan` | nenhum secret real em arquivo, output ou log | zero secrets; service role ausente |
| `no-sql-check` | nenhuma execução de SQL ou MCP | confirmado |
| `no-policy-check` | nenhuma policy RLS criada | confirmado |
| `git-status-check` | alterações somente nos paths autorizados | confirmado |
| `build-check` | `npm run build` em `platform/` (somente se escrita ocorreu e foi autorizada) | sem erros |

---

## 8. Evidência Esperada

Evidence versionado em `docs/specs/implementation/evidence/` ao final da execução futura, contendo: pack executado + data; o que foi inspecionado; o que foi escrito (se autorizado); confirmação de zero secrets, zero SQL, zero MCP, zero policies; saída dos checks da seção 7; stop events ou `NONE`; próxima ação recomendada.

---

## 9. Critérios de Bloqueio

Parar imediatamente e reportar ao humano se:

- qualquer passo exigir **service role key** ou qualquer secret real (`SECRET_EXPOSURE`);
- qualquer escrita for necessária fora da lista da seção 6;
- a execução exigir SQL, MCP, migration, seed ou policy;
- a instalação de dependências falhar ou exigir pacotes fora do aprovado;
- as pré-condições da Lane 1 (seção 2) não se confirmarem;
- houver qualquer ambiguidade de escopo — bloquear, nunca presumir.

---

## 10. Próximo Passo Após Aprovação do Pack

1. Humano aprova este pack (gate — ainda **não** ocorreu).
2. Execução futura inicia pela fase read-only (seções 3.1–3.3: inspeção e estratégia), sem escrita.
3. Escritas da seção 6 só ocorrem mediante gate humano adicional e explícito.
4. Evidence registrado conforme seção 8; mapa operacional atualizado em task própria.

---

## What This Does Not Authorize

`This pack spec does NOT authorize:` executar qualquer passo agora; modificar `platform/`; executar código ou build; instalar dependências; executar SQL; usar MCP; criar migrations, `.env`, secrets, backend, frontend real, auth flow, RLS policies ou subagents; expandir arquitetura.

Regra de gate: **um pack = um gate humano**. Este documento define o pack; a aprovação humana explícita da execução é o gate — e ainda não ocorreu.

---

## Final Status

`PACK_SPEC_COMPLETE_DOCUMENTARY_ONLY_EXECUTION_NOT_AUTHORIZED`

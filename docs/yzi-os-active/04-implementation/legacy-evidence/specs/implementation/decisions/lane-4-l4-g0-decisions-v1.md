# Lane 4 — L4-G0 Decisions v1

## Readiness Statement

`LANE_4_L4_G0_DECISIONS_REGISTERED_DOCUMENTARY_ONLY_NO_EXECUTION_AUTHORIZED`

Este documento é o **decision record versionado** das decisões humanas do gate L4-G0 da Lane 4 — Cockpit Skeleton, sob o [execution program v1](../lanes/lane-4-cockpit-skeleton-execution-program-v1.md) e o [Pack 01 — Product Boundary](../packs/lane-4-cockpit-skeleton/01-lane-4-product-boundary-pack-v1.md). Ele **registra decisões humanas**; não executa código, não modifica `platform/`, não instala dependências, não executa SQL e não usa MCP.

---

## Contexto

- **Lane:** Lane 4 — Cockpit Skeleton
- **Data:** 2026-06-12
- **Gate:** L4-G0 — confirmado pelo humano com a frase: "EU AUTORIZO O GATE L4-G0 — REVISÃO DO PROGRAMA DA LANE 4 APROVADA."
- **Base factual:** inspeção read-only do Step 1, concluída com `STEP_1_READONLY_INSPECTION_COMPLETE` (registrada no chat da task 231): `@supabase/supabase-js@2.108.1` presente; `@supabase/ssr` ausente; clients Supabase usam apenas anon key; `server.ts` não propaga sessão (`auth.uid()` será NULL em server components); `.env.local` existe e não foi lido; nenhum `middleware.ts` existe (nem raiz, nem `src/`); projeto usa `src/`; Next.js 16.2.9.

---

## Decisões Humanas Registradas

| # | Decisão | Resultado humano (L4-G0) |
|---|---------|--------------------------|
| D1 | Health/check na Lane 4 | **APROVADO** — Step 3, gate L4-G1 |
| D2 | Login + sessão mínima | **APROVADO** — Step 4, gate L4-G2; sem signup/recovery/onboarding |
| D3 | `@supabase/ssr` | **APROVADO para o gate L4-G2** — somente este pacote, com `npm audit` pós-instalação reportado |
| D4 | Seed temporário para RLS real | **NÃO executar agora** — mantido apenas como opcional tardio com gate próprio (L4-G5) |
| D5 | Estado vazio honesto | **APROVADO** como validação padrão (banco limpo 0/0) |
| D6 | Proteção de rota de `/cockpit` | **APROVADO** — deve usar `platform/src/proxy.ts`, conforme convenção do Next.js 16 |

---

## Correção do Caminho de Proteção de Rota (proxy.ts)

A lista fechada original previa `platform/middleware.ts`. Fonte canônica verificada (doc embarcada do Next.js 16.2.9, `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`):

> "Starting with Next.js 16, Middleware is now called Proxy to better reflect its purpose. The functionality remains the same."
> "Create a `proxy.ts` (or `.js`) file in the project root, or inside `src` if applicable, so that it is located at the same level as `pages` or `app`."

Como `platform/` usa estrutura `src/`, o caminho correto é **`platform/src/proxy.ts`**. Referências corrigidas nesta task:

- `lanes/lane-4-cockpit-skeleton-execution-program-v1.md` — lista fechada (seção 4), tabela de decisões (seção 5), sequência de steps (seção 6), tabela de gates (seção 7), riscos (seção 10);
- `runbooks/lane-4-cockpit-skeleton-serial-execution-v1.md` — Step 4, arquivos tocáveis;
- `packs/lane-4-cockpit-skeleton/03-minimal-auth-session-pack-v1.md` — escopo autorizado e saídas esperadas;
- `evidence/templates/lane-4-auth-session-evidence-template-v1.md` — contexto, arquivos tocados e verificação de sessão;
- `evidence/templates/lane-4-final-evidence-template-v1.md` — tabela de decisões;
- `subagents/lane-4/auth-session-reviewer-agent-spec-v1.md` — entradas;
- `skills/lane-4/auth-session-minimal-review-skill-v1.md` — inputs;
- `skills/lane-4/nextjs-16-platform-safety-skill-v1.md` — quando usar.

O [draft v1](../lanes/lane-4-cockpit-skeleton-execution-program-draft-v1.md) **não** foi alterado — permanece como registro histórico.

---

## O Que Este Decision Record NÃO Autoriza

`This decision record does NOT authorize:`

- executar qualquer step da Lane 4 (Steps 3+ permanecem bloqueados pelos gates L4-G1 a L4-G6);
- criar ou alterar arquivos em `platform/`;
- instalar `@supabase/ssr` (instalação só ocorre no Step 4, sob o gate L4-G2);
- executar SQL, seed ou usar MCP;
- criar subagents reais ou skills executáveis;
- atualizar o mapa operacional.

---

## Próximo Gate

O próximo avanço é o **gate L4-G1** (health/check, Step 3), que exige frase humana explícita. Permanecem insuficientes: "vamos", "segue", "manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", "continue".

---

## Final Status

`LANE_4_L4_G0_DECISIONS_REGISTERED_DOCUMENTARY_ONLY_NO_EXECUTION_AUTHORIZED`

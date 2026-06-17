# Platform Foundation — Language Decision v1

## Readiness Statement

`PLATFORM_FOUNDATION_LANGUAGE_TYPESCRIPT_DECIDED`

Este documento é o **decision record versionado** da decisão de linguagem da Lane 2 — Platform Foundation, sob o mapa operacional [`yzi-os-spec-harness-execution-map-v1`](../yzi-os-spec-harness-execution-map-v1.md) e o pack [`platform-foundation-execution-pack-v1`](../packs/platform-foundation-execution-pack-v1.md). Ele **registra uma decisão humana**; não executa código, não modifica `platform/`, não instala dependências, não executa SQL e não usa MCP.

---

## Contexto

- **Lane:** Lane 2 — Platform Foundation
- **Data:** 2026-06-11
- **Base factual:** inspeção read-only evidenciada em [`platform-lane-2-readonly-inspection-evidence-v1`](../evidence/platform-lane-2-readonly-inspection-evidence-v1.md)

Estado confirmado: `platform/` é Next.js 16.2.9, React 19.2.4, TypeScript 5 strict, Tailwind v4; `src/app/` existe; `src/lib/` ainda não existe; `@supabase/supabase-js` não está instalado; nenhum client Supabase existe; `platform/` continua intocado.

---

## Decisão

1. **A Platform Foundation do YZI OS usará TypeScript dentro de `platform/`.**
2. **Python não está autorizado dentro de `platform/` na Lane 2.**
3. **Banco continua sendo tratado por SQL manual executado pelo humano no Supabase SQL Editor. MCP não é rota padrão.**

---

## Escopo do TypeScript

- Todo código futuro autorizado dentro de `platform/` será TypeScript, alinhado ao scaffold existente (TS 5 strict, alias `@/*`);
- Inclui os clients Supabase planejados (`src/lib/supabase/client.ts` e `server.ts`) e qualquer módulo futuro da Platform Foundation;
- Não autoriza, por si, a criação de nenhum arquivo — apenas fixa a linguagem dos que vierem a ser autorizados.

---

## Escopo do SQL Manual

- Toda operação de banco (inspeção, DDL aprovado, futura policy) continua sendo SQL executado **manualmente pelo humano** no Supabase SQL Editor;
- Nenhum acesso a banco via código da aplicação, ORM ou migration é autorizado nesta fase;
- MCP não é rota padrão — só pode ser usado quando explicitamente autorizado em pack próprio.

---

## Exclusão de Python na Lane 2

- Nenhum arquivo, script, tooling ou dependência Python dentro de `platform/` durante a Lane 2;
- Qualquer uso futuro de Python em `platform/` exigirá decision record próprio com gate humano.

---

## O Que Esta Decisão NÃO Autoriza

`This decision record does NOT authorize:`

- executar o micro-pack Supabase Client Foundation;
- instalar dependências;
- criar ou alterar arquivos em `platform/`;
- executar SQL ou usar MCP;
- criar migrations, backend real, frontend real, auth flow, RLS policies ou subagents;
- expandir arquitetura.

---

## Impacto no Próximo Micro-Pack (Supabase Client Foundation)

O micro-pack candidato (ver [`platform-lane-2-readonly-inspection-evidence-v1`](../evidence/platform-lane-2-readonly-inspection-evidence-v1.md), Próxima Ação Recomendada) deve ser definido integralmente em TypeScript: `@supabase/supabase-js` como dependência, `client.ts` e `server.ts` em `platform/src/lib/supabase/`, somente chave publishable, sem service role. A camada de banco permanece fora do micro-pack — SQL manual segue sendo a rota. O gate humano do micro-pack continua pendente.

---

## Final Status

`PLATFORM_FOUNDATION_LANGUAGE_TYPESCRIPT_DECIDED`

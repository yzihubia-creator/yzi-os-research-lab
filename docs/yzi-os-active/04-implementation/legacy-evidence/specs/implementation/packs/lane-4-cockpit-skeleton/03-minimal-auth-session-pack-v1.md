# Pack 03 — Minimal Auth Session v1

> Pack documental da Lane 4 — Cockpit Skeleton. Não executa nada agora. Corresponde ao Step 4 do runbook. Gate requerido: L4-G2 (inclui decisões D3 e D6).

## Objetivo

Implementar (quando autorizado) a sessão/auth mínima: uma página de login e persistência de sessão — o suficiente para que `auth.uid()` exista nas queries RLS. Nada além.

## Escopo Autorizado

- `platform/src/lib/auth/session.ts`;
- `platform/src/app/login/page.tsx`;
- `platform/src/proxy.ts` — D6 aprovada em L4-G0 (Next.js 16: proxy substitui middleware; arquivo dentro de `src/`);
- `platform/package.json` + lockfile — somente `@supabase/ssr`, D3 aprovada em L4-G0, com `npm audit` pós-instalação reportado.

## Escopo Proibido

- Signup, recovery, onboarding, perfis, roles, gestão de usuários;
- Service role ou secrets hardcoded;
- Qualquer dependência além de `@supabase/ssr` aprovada;
- SQL, MCP, migration.

## Entradas

- Gate L4-G2 + decisões D3/D6 registradas (Pack 01);
- Skill spec `auth-session-minimal-review-skill-v1`;
- Subagent spec `auth-session-reviewer-agent-spec-v1`.

## Saídas Esperadas

- Login mínimo funcional; sessão persiste após reload;
- `/cockpit` sem sessão → redirect/bloqueio via proxy (D6 aprovada);
- Output de `npm audit` reportado (D3 aprovada).

## Validação

- Parecer APROVADO conforme skill `auth-session-minimal-review-skill-v1`;
- Verificação manual de sessão pelo humano (registrada no evidence).

## Stop Conditions

- Escopo crescer além de login + sessão → `SCOPE_AMBIGUITY`;
- Secret em código/log → `SECRET_EXPOSURE`;
- `npm audit` piorar sem reporte → parar.

## Evidence Esperado

`evidence/templates/lane-4-auth-session-evidence-template-v1.md` preenchido com outputs reais.

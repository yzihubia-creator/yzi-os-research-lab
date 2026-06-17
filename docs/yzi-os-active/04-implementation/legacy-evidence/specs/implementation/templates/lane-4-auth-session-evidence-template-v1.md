# Lane 4 — Auth Session Evidence Template v1

## Readiness Statement

`[PREENCHER: LANE_4_AUTH_SESSION_VALIDATED ou LANE_4_AUTH_SESSION_FAILED]`

## Contexto

- **Lane:** Lane 4 — Cockpit Skeleton — Step 4
- **Data:** [PREENCHER]
- **Gate L4-G2 confirmado:** [ ] Sim / [ ] Não
- **Decisão D3 (`@supabase/ssr`):** aprovada em L4-G0 — [ ] Instalada / [ ] Não necessária
- **Decisão D6 (proteção de rota via `proxy.ts`):** aprovada em L4-G0 — [ ] Implementado / [ ] Diferido

## Arquivos Tocados

- [ ] `platform/src/lib/auth/session.ts`
- [ ] `platform/src/app/login/page.tsx`
- [ ] `platform/src/proxy.ts` (D6 aprovada em L4-G0)
- [ ] `platform/package.json` + lockfile (somente `@supabase/ssr`, D3 aprovada em L4-G0)

## `npm audit` Pós-Instalação (se D3 aprovada — colar)

```
[COLAR OUTPUT AQUI ou N/A]
```

## Verificação de Sessão

- [ ] Login mínimo funciona com usuário de teste
- [ ] Sessão persiste após reload
- [ ] Sem signup/recovery/onboarding
- [ ] `/cockpit` sem sessão → redirect/bloqueio (se proxy ativo)

## Checks

| Check | Resultado |
|-------|-----------|
| `no-service-role` | [PASSOU / FALHOU] |
| `no-secret-in-code` | [PASSOU / FALHOU] |
| `scope-minimal-auth` | [PASSOU / FALHOU] |

## Stop Events

`[NONE ou listar]`

## Próxima Ação

`[PREENCHER]`

## Final Status

`[PREENCHER]`

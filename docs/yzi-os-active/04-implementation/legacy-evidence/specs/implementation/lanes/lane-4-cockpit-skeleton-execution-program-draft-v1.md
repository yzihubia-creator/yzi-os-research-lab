# Lane 4 — Cockpit Skeleton: Execution Program DRAFT v1

## Readiness Statement

`LANE_4_EXECUTION_PROGRAM_DRAFT_DOCUMENTARY_ONLY_NO_EXECUTION_AUTHORIZED`

Este documento é um **draft** do programa de execução da Lane 4 — Cockpit Skeleton. É uma proposta documental para revisão humana; **não é um execution program aprovado, não executa código, não modifica `platform/`, não executa SQL, não usa MCP e não autoriza nenhuma fase**. A promoção deste draft a `lane-4-cockpit-skeleton-execution-program-v1.md` exige a frase de autorização definida no [closure gate da Lane 3](lane-3-auth-tenant-boundary-closure-gate-v1.md).

---

## 1. Objetivo da Lane 4

Entregar o **esqueleto mínimo navegável do cockpit do YZI OS**: a primeira superfície visível do produto onde um usuário autenticado enxerga seu contexto de tenant. A Lane 4 transforma a fundação invisível (Lanes 1–3: schema, client, RLS) em algo que um humano consegue abrir no navegador e verificar.

Em uma frase: **sair de "infraestrutura validada por SQL" para "shell de produto verificável por olho humano"**.

---

## 2. Hipótese de Produto

> Se um usuário autenticado consegue entrar no cockpit e ver o tenant ao qual pertence (ou um estado vazio honesto quando não pertence a nenhum), então a fronteira auth/tenant construída nas Lanes 1–3 está correta de ponta a ponta — e o YZI OS tem uma base real sobre a qual cada feature futura (agent operations, dashboards, billing) é apenas uma nova tela dentro de um shell já confiável.

O cockpit skeleton é deliberadamente vazio de features: seu valor de produto é **provar o contrato auth → sessão → tenant → tela** uma única vez, para que nenhuma lane futura precise reprovar esse contrato.

---

## 3. Arquivos de `platform/` Que Poderão Ser Tocados Futuramente

Lista candidata fechada (a confirmar na promoção do draft; nenhum toque autorizado agora):

| Arquivo | Papel proposto |
|---------|----------------|
| `platform/src/lib/supabase/health.ts` | Health/check mínimo de conectividade (diferido das Lanes 2–3) |
| `platform/src/middleware.ts` | Auth session middleware (proteção de rotas do cockpit) |
| `platform/src/lib/supabase/tenant-context.ts` | Resolução de contexto de tenant do usuário autenticado |
| `platform/src/app/(cockpit)/layout.tsx` | Layout do shell do cockpit |
| `platform/src/app/(cockpit)/page.tsx` | Página inicial do cockpit (estado vazio honesto ou tenant atual) |
| `platform/src/app/login/page.tsx` | Página mínima de login (se auth flow for aprovado na promoção) |
| `platform/package.json` / lockfile | Somente se `@supabase/ssr` for aprovada em gate próprio |

Qualquer arquivo fora desta lista = `OUT_OF_SCOPE_WRITE` (stop condition).

---

## 4. O Que Fica Proibido na Lane 4

- Service role key em qualquer ponto (código, env, output, log);
- Policies de INSERT/UPDATE/DELETE (escrita continua bloqueada por design);
- SQL via agente, MCP ou migrations — SQL segue manual, pelo humano, com gate;
- Tenants reais, memberships reais ou seeds permanentes;
- Features de negócio (dashboards, agent operations, billing, configurações);
- Design system completo ou refinamento visual além do esqueleto;
- Signup/onboarding de produção (no máximo login mínimo, se aprovado);
- Subagents reais e skills executáveis;
- Expansão de arquitetura além das specs aprovadas.

---

## 5. Decisões de Escopo Propostas (a confirmar na promoção)

| Item | Entra na Lane 4? | Justificativa |
|------|------------------|---------------|
| **Health/check real** | **Sim — como primeira fase** | Diferido nas Lanes 2 e 3; é o pré-requisito mais barato para provar conectividade antes de qualquer UI |
| **Auth flow** | **Parcial — apenas login mínimo + sessão** | Sem sessão autenticada, as policies RLS SELECT tornam o cockpit inverificável; signup/recovery ficam fora |
| **Cockpit skeleton** | **Sim — é o núcleo da lane** | Layout + página inicial com contexto de tenant (ou estado vazio honesto) |
| Resolução de tenant context | Sim — mínima, read-only | Necessária para a página inicial mostrar algo verdadeiro |
| Seed de teste temporário | Decisão humana em gate próprio | Sem usuário/tenant de teste, a verificação fim a fim é impossível; se aprovado, com cleanup obrigatório evidenciado (padrão Lane 3) |
| `@supabase/ssr` | Decisão humana em gate próprio | Provável pré-requisito do middleware de sessão |

---

## 6. Sequência Sugerida

```
Fase 4.0 — Promoção do draft a execution program v1 (gate humano)
Fase 4.1 — Health/check mínimo (health.ts) + evidence
Fase 4.2 — Decisão @supabase/ssr + auth session middleware + evidence
Fase 4.3 — Login mínimo + sessão verificada manualmente + evidence
Fase 4.4 — Tenant context read-only (tenant-context.ts) + evidence
Fase 4.5 — Cockpit skeleton (layout + página inicial) + evidence
Fase 4.6 — Verificação fim a fim com seed de teste temporário (gate próprio)
            + cleanup evidenciado (padrão Lane 3)
Fase 4.7 — Evidence final + closure gate da Lane 4 + atualização do mapa
```

Cada fase exige gate humano explícito antes de executar. Uma fase por vez; evidence antes de avançar.

---

## 7. Riscos

| Risco | Probabilidade | Mitigação proposta |
|-------|--------------|--------------------|
| Middleware de sessão mal configurado bloqueando tudo ou nada | Média | Fase isolada (4.2) com verificação manual antes de qualquer UI |
| `auth.uid()` NULL em server components sem sessão propagada | Alta | Health/check e tenant-context testados antes do cockpit; estados vazios honestos |
| Escopo de UI inflar ("já que estamos na tela...") | Alta | Lista fechada de arquivos + proibições da seção 4; skeleton é deliberadamente feio |
| Verificação fim a fim exigir usuário/tenant de teste | Alta | Seed temporário com gate próprio e cleanup obrigatório evidenciado |
| `@supabase/ssr` introduzir vulnerabilidades novas no `npm audit` | Baixa | `npm audit` pós-instalação; reportar antes de prosseguir |
| Lane 4 virar "auth completa" disfarçada | Média | Login mínimo apenas; signup/recovery explicitamente proibidos |

---

## 8. Critérios de Pronto (Definition of Done Proposta)

A Lane 4 estará concluída quando **todas** as condições abaixo forem verdadeiras:

- [ ] Health/check real executado com sucesso e evidenciado;
- [ ] Usuário consegue autenticar via login mínimo e a sessão persiste;
- [ ] Rotas do cockpit protegidas: sem sessão → redirect/bloqueio; com sessão → acesso;
- [ ] Página inicial do cockpit mostra o tenant do usuário autenticado **ou** estado vazio honesto;
- [ ] Policies RLS exercitadas fim a fim com usuário autenticado real (via seed temporário aprovado);
- [ ] Todo dado de teste removido, com cleanup evidenciado (baseline limpo, padrão Lane 3);
- [ ] Nenhum secret exposto; service role ausente em toda a lane;
- [ ] Evidence registrado por fase + evidence final;
- [ ] Mapa operacional atualizado e closure gate da Lane 4 criado;
- [ ] Gate humano final confirmado.

---

## Confirmação de Não-Execução

Este draft não executa código, não executa SQL, não usa MCP, não modifica `platform/`, não instala dependências, não cria auth flow, não cria frontend ou backend real, não cria seeds, não cria subagents reais nem skills executáveis. Ele apenas propõe o programa da Lane 4 para revisão humana. Nenhuma fase está autorizada.

---

## Final Status

`LANE_4_EXECUTION_PROGRAM_DRAFT_DOCUMENTARY_ONLY_NO_EXECUTION_AUTHORIZED`

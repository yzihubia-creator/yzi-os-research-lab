# Lane 8 — Product Scope Candidate Review v1

> Relatório **curto de decisão** de produto. Avalia as candidatas de escopo da Lane 8 **sem
> abrir a Lane 8**, sem Execution Program, sem alterar código/`platform/`, sem SQL/MCP, sem criar
> agente/registry/tool/memory/policy, sem alterar tenant/membership e sem tocar o mapa operacional.

Lane anterior: 7 — Operator Session & Control Layer · **fechada**
(`LANE_7_OPERATOR_SESSION_CONTROL_CLOSED_LOGOUT_RELOGIN_TENANT_FOUND_VALIDATED`)
Data: 2026-06-12 · Papel: **Product Architect**

---

## 0. Situação de Produto (essencial)

- Google OAuth ok; `/cockpit` protegido; logout/re-login validado em runtime.
- 1 tenant real (`YZI OS — Operação Inicial`) + 1 membership real (`viewer`); `tenant_found`
  renderizado e validado por observação humana.
- Base agentic **vazia/honesta**: nenhum agente, registry, MCP, runner, tool/memória.
- Só policies **SELECT** (RLS read-only); **nenhuma policy de escrita**; **nenhum service role** no frontend.

**Lacuna:** o operador entra, vê seu tenant e sai com segurança — mas o cockpit **não torna explícito
o que `viewer` pode ou não pode fazer**. A fronteira de permissão existe só implícita no RLS; não é
legível nem governada como produto. Qualquer ação sensível seria construída sobre fronteira invisível.

---

## 1. Candidata mais segura e útil agora

**Candidata 2 — Role / Permission Boundary.** Menor incremento verificável e de menor risco:

- torna **explícita e legível** a fronteira de `viewer` (pode/não pode), hoje só implícita no RLS;
- escopável como **declarativa/read-only** — **sem nova policy de escrita**, sem modelo de dados de
  agente, sem registry (item **sensível ao harness**), sem MCP;
- está **na ordem certa** (§2): vem antes de registry e de tool/memória.

Inferiores **agora**: **C1 (Agent Registry Shell)** — prematura, sensível ao harness, introduz
escrita/modelo de agente antes da fronteira, risco decorativo; **C3 (Tool/Memory Boundary)** — fora
de ordem (limita algo inexistente); **C4 (First Controlled Agent Operation)** — cedo demais (§2).

## 2. O que precisa existir antes de agente real

1. **Fronteira de papel/permissão explícita**. *(Candidata 2)*
2. **Caminho de escrita governado** — hoje a ativação foi INSERT humano direto, sem policy de escrita. *(futura)*
3. **Superfície de existência de agente** (registry shell não-executável). *(futura)*
4. **Fronteira de tools/memória por tenant/agente**. *(futura)*
5. **Primeira operação de agente controlada** — só após 1–4. *(futura)*

## 3. O que o cockpit ainda NÃO mostra ao operador

- **Sua fronteira de permissão** — o que `viewer` autoriza/proíbe, de forma legível. *(Candidata 2)*
- **Qualquer caminho de escrita governado** — nenhuma ação de produto escreve. *(diferido)*
- **Qualquer superfície de agente** — base agentic vazia por design. *(diferido)*

## 4. Risco de pular direto para agente real

| Risco | Por que pesa agora |
|---|---|
| Execução + tools + memória + runner de uma vez | Sem 1–4 de §2, é salto ao fim da trilha |
| Caminho de escrita prematuro | Nenhuma policy de escrita de produção existe |
| Fronteira de permissão invisível | Ação sensível sobre `viewer` sem limite explícito é *smell* de segurança |
| Conflito com o harness | Runner/registry/MCP executável é item não materializável |
| Quebra de isolamento (tenant boundary) | Escrita/execução malfeita rompe o RLS multi-tenant |

## 5. Menor incremento verificável da Lane 8

> O cockpit **exibe de forma honesta e legível** o papel do operador (`viewer`) e a **fronteira de
> permissão** correspondente — o que pode e não pode fazer — de modo **declarativo/read-only**, **sem
> nova policy de escrita**, **sem service role**, **sem MCP**, base agentic ainda vazia.

Verificável por **observação runtime/browser humana**: operador vê papel e limites, sem dado
fabricado, sem crash/loop, sem vazamento de token/cookie.

## 6. Papéis agentic participantes

- **Product Architect** — superfície e Definição de Concluído.
- **Auth/RLS Reviewer** (**crítico**) — confirma que a fronteira exibida reflete o RLS real, sem
  service role, sem vazamento, sem ampliar permissão.
- **Frontend Platform Implementer** — exibe papel/fronteira só sob gate com lista exata de arquivos.
- **UX/Cockpit Reviewer** — fronteira honesta e legível, sem inventar capacidades.
- **Execution Coordinator** + **Evidence Auditor** — sequenciamento e 1 evidence por batch real.
- **Backend/Supabase Planner** — **provavelmente NÃO ativado** (declarativo/read-only, sem SQL).

## 7. O que fica fora de escopo

- **Agentes reais**, execução, runners, schedulers, MCP, subagents executáveis.
- **Agent Registry** (mesmo shell) e **Tool/Memory Boundary** — lanes próprias futuras.
- **Nova policy de escrita** (INSERT/UPDATE/DELETE) em tabelas de negócio.
- **Criar novos papéis/roles** além de tornar explícita a fronteira já existente (`viewer`).
- **Alterar tenant/membership**, **service role no frontend**, seed permanente.

## 8. Readiness sugerido para fechar a Lane 8 (se aberta)

> `LANE_8_ROLE_PERMISSION_BOUNDARY_CLOSED_VIEWER_BOUNDARY_VALIDATED`

Critério: fronteira de `viewer` exibida honestamente e validada em runtime/browser humano, fiel ao
RLS, sem nova policy de escrita, sem service role, sem MCP, base agentic vazia. *(Token provisório.)*

## Recomendação (objetiva)

> **A Lane 8 deve ser: Role / Permission Boundary (Candidata 2).** Menor incremento verificável e de
> menor risco — declarativo/read-only, sem policy de escrita, sem modelo de agente, sem registry
> (sensível ao harness), na ordem certa. Torna explícita a fronteira de segurança do operador
> **antes** de qualquer ação sensível ou agentic. Registry, tool/memória e agente real seguem prematuros.

---

## Confirmação de Não-Execução

Documentário. **Não** abre a Lane 8, **não** cria Execution Program/SQL/MCP/agente/registry/tool/
memory/policy/evidence, **não** altera código/`platform/`/tenant/membership, **não** mexe em `main`,
**não** faz push/commit e **não** atualiza o mapa operacional. Apenas avalia e recomenda. A abertura
exige frase humana explícita (ex.: `AUTORIZO ABERTURA DA LANE 8`); insuficientes: "vamos", "segue",
"manda", "próximo", "ok", "aprovado", "pode continuar", "faça", "sim", "bora", "continue".

---

## Readiness

`LANE_8_PRODUCT_SCOPE_CANDIDATE_REVIEW_CREATED_NOT_OPENED`

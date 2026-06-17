# Lane 8 — Role / Permission Boundary: Validated Evidence v1

Projeto Supabase: `thwsltjcjrvtidhnfukc` · Data: 2026-06-12 · Papel: Evidence Auditor

Registro de evidência **consolidado** da Lane 8 — Role / Permission Boundary, após validação
runtime humana. Documentário: **não** executa código, **não** executa SQL, **não** usa MCP,
**não** altera `platform/` adicionalmente, **não** usa service role, **não** versiona
token/cookie/OAuth `code`.

---

## 1. Escopo da Lane 8

Tornar **explícita e legível** no cockpit a fronteira de permissão do operador: exibir o
**papel real** (`viewer`) no estado `tenant_found` e o que esse papel **pode** e **ainda não
pode** fazer — sem policy nova, sem schema novo, sem registry, sem agente, sem caminho de
escrita.

## 2. Arquivos de código alterados/criados

| Arquivo | Mudança |
|---|---|
| `platform/src/lib/tenant/role-boundary.ts` | **novo** — helper puro/declarativo/read-only: papel → fronteira honesta (`label`, `summary`, `can`, `cannotYet`). |
| `platform/src/lib/tenant/tenant-context.ts` | passa a ler `role` na **mesma** query SELECT da membership (`select("tenant_id, role")`); o tipo `tenant_found` ganha `role: string`. |
| `platform/src/app/cockpit/page.tsx` | render da fronteira no estado `tenant_found` (papel humano + listas "pode" / "ainda não pode"). |

Docs: `lane-8-product-scope-candidate-review-v1.md`, `lane-8-role-permission-boundary-execution-program-v1.md`.

## 3. Role real `viewer` derivada da membership

O papel vem de **dado real**: `getTenantContext` lê `role` de `tenant_memberships` via a
policy RLS `memberships_select_own` (que já restringe a `auth.uid()`). Nenhum papel é
fabricado. Schema confirmado pelo DDL versionado: `role text NOT NULL CHECK IN
('owner','admin','operator','viewer')`.

## 4. Boundary `viewer` exibido no cockpit

No `tenant_found`: bloco "Seu papel nesta operação" → **Viewer — observador** + uma linha
honesta. Grade com **pode** (ver operação, ver vínculo, encerrar sessão) e **ainda não pode**
(escrever dados, operar agentes, administrar tenant). Honesto para a fase: o RLS só tem
policies SELECT — não há caminho de escrita para **nenhum** papel.

## 5. Lint / Build

- `npm run lint` — **verde**.
- `npm run build` — **verde** (Next.js 16.2.9; TypeScript ok; `ƒ /cockpit` server-rendered; 7/7 páginas).

## 6. Revisão Auth/RLS — aprovada

Papel de dado real; RLS read-only preservado (`select("tenant_id")` → `select("tenant_id,
role")`, **mesma** policy SELECT); **zero** INSERT/UPDATE/DELETE; sem service role; sem
vazamento de `id`/`slug` cru, token, cookie ou OAuth `code`.

## 7. Revisão UX/Cockpit — aprovada

Fronteira honesta e legível, **não** administrativa demais; "ainda não pode" reflete a
verdade; o helper **não** inventa capacidades de owner/admin/operator.

## 8. Validação humana runtime

Relato humano (2026-06-12): `/cockpit` autenticado; tenant **YZI OS — Operação Inicial**;
papel **Viewer — observador** (`viewer`); fronteira clara (pode / ainda não pode); base
agentic vazia/indisponível; nenhuma ação falsa; nenhum agente/registry/tool/memória; sem erro
visual/hydration overlay; sem token/cookie/OAuth `code` exposto.

## 9–15. Preservação e disciplina

9. **Tenant preservado:** `YZI OS — Operação Inicial`.
10. **Tenant/membership intactos** — nenhuma escrita; nenhum INSERT/UPDATE/DELETE.
11. **Base agentic** continua vazia/indisponível.
12. **Nenhum** agente/registry/tool/memória criado.
13. **Nenhum** SQL/MCP/service role.
14. **Nenhum** token/cookie/OAuth `code` versionado.
15. **Nenhuma** ação falsa ou botão inoperante.

---

## Final Status

`LANE_8_ROLE_PERMISSION_BOUNDARY_CLOSED_VIEWER_BOUNDARY_VALIDATED`

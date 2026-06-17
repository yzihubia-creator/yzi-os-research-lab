# Pack 01 — Lane 4 Product Boundary v1

> Pack documental da Lane 4 — Cockpit Skeleton. Não executa nada. Corresponde aos Steps 0–2 do runbook. Gate requerido: L4-G0.

## Objetivo

Fixar a fronteira de produto da Lane 4 antes de qualquer escrita: confirmar o contrato mínimo (`usuário autenticado → sessão → tenant_membership → tenant via RLS → cockpit skeleton → estado vazio honesto`), validar as pré-condições herdadas e resolver as decisões D3, D4 e D6 com o humano.

## Escopo Autorizado

- Revisão humana do execution program v1 (Step 0);
- Inspeção read-only de `platform/` para confirmar o Estado Herdado (Step 1);
- Registro textual das decisões D3 (`@supabase/ssr`), D4 (seed temporário) e D6 (proteção de rota via `src/proxy.ts`) (Step 2) — registradas em [`decisions/lane-4-l4-g0-decisions-v1`](../../decisions/lane-4-l4-g0-decisions-v1.md).

## Escopo Proibido

- Qualquer escrita em `platform/`;
- Qualquer comando de build, instalação, SQL ou MCP;
- Antecipar implementação de qualquer step posterior;
- Tratar decisão ambígua como decidida.

## Entradas

- `lanes/lane-4-cockpit-skeleton-execution-program-v1.md`;
- `runbooks/lane-4-cockpit-skeleton-serial-execution-v1.md`;
- Evidences das Lanes 2 e 3.

## Saídas Esperadas

- Gate L4-G0 confirmado (ou ajustes documentais solicitados);
- Pré-condições confirmadas por inspeção read-only;
- D3, D4 e D6 decididas e registradas textualmente.

## Validação

- Cada item do Estado Herdado (seção 3 do programa) marcado confirmado/divergente;
- Cada decisão com resultado explícito e autor humano.

## Stop Conditions

- Pré-condição divergente → `PRECONDITION_FAILED`;
- Decisão ambígua → `SCOPE_AMBIGUITY`;
- Programa rejeitado no Step 0 → parar a lane.

## Evidence Esperado

Registro textual no chat e, se o humano exigir, nota em `decisions/`. Não há evidence template próprio — este pack é pré-execução.

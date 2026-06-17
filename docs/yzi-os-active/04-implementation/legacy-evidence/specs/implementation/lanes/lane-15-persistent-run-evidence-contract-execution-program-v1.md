# Lane 15 — Persistent Run Evidence Contract: Execution Program v1

Projeto Supabase: `thwsltjcjrvtidhnfukc` · Modo: SDD Lite / Execution Program Mode · Branch: `lane-1-6-foundation`

Programa de execução **enxuto** da Lane 15, primeira lane do **Bloco 15–17** (preparação documental/manual
para persistência futura de controlled runs). Parte do readiness anterior
`LANE_14_CONTROLLED_RUN_RECORD_CLOSED_NOT_PERSISTED_VALIDATED`. Abertura autorizada por
`AUTORIZO O BLOCO 15–17`.

---

## 1. Objetivo

Criar um **contrato mínimo, prático e documental** para a **persistência futura** de controlled runs —
o que um "run governado persistível" precisaria conter, quais estados são permitidos e quais invariantes
valem — **sem executar SQL, sem escrever no banco e sem criar runtime real**. Esta lane é **documental
apenas**: nenhum schema, nenhuma tabela, nenhuma policy, nenhum run persistido.

## 2. Enquadramento (documental, contrato pré-persistência)

`estados permitidos → campos mínimos candidatos → invariantes → pré-condições de persistência`. O
contrato descreve o formato-alvo; não cria nada executável. A persistência real permanece diferida e,
quando vier, exigirá RLS, write policy, auditabilidade e rollback (Lanes 16/17 e além).

## 3. Contrato mínimo de run governado persistível

Um controlled run persistível é um **registro documental de uma operação controlada** — o que seria
gravado quando a persistência for ativada no futuro. Ele NÃO representa execução real: continua sendo a
representação governada de um run em modo dry-run/simulado/bloqueado, agora com forma persistível.

### 3.1 Estados permitidos e semântica (`run_status` / `run_mode`)

| Estado | Semântica |
|---|---|
| `dry_run` | Pré-visualização controlada; nenhuma fonte lida, nada pontuado (modo da Lane 13). |
| `simulated` | Run representado de forma governada; resultado é representação, não execução real. |
| `blocked_for_real_execution` | Execução real explicitamente bloqueada até gates futuros (runner/tool/memória). |
| `not_persisted` | Run não gravado em banco — estado atual de todo run até a persistência ser ativada. |
| `persisted` | **Estado FUTURO apenas** — reservado; **não usado ainda**. Só após Lanes 16/17 aplicadas e validadas. |

`run_mode` cobre `dry_run` / `simulated` (com `preview`/`read-only` como qualificadores); `run_status`
cobre `blocked_for_real_execution` / `not_persisted` / (`persisted` futuro).

### 3.2 Campos mínimos candidatos

| Campo | Tipo candidato | Descrição |
|---|---|---|
| `run_id` | uuid | Identidade do run. |
| `tenant_id` | uuid | Tenant dono do run (escopo de isolamento). |
| `operator_user_id` | uuid | Operador autenticado que originou o run (`auth.uid()`). |
| `operator_role` | text | Papel do operador no tenant (ex.: `viewer`). |
| `capability_key` | text | Capacidade job-anchored analisada (ex.: `qualificacao_oportunidades`). |
| `run_mode` | text | `dry_run` / `simulated` (+ qualificadores). |
| `run_status` | text | `blocked_for_real_execution` / `not_persisted` / (`persisted` futuro). |
| `side_effects` | text | Sempre `none` nesta fase. |
| `persistence_status` | text | `not_persisted` agora; `persisted` reservado para o futuro. |
| `input_context_snapshot` | jsonb | Snapshot dos insumos lidos do estado existente (tenant/papel/boundaries), sem secret. |
| `boundary_snapshot` | jsonb | Snapshot dos limites aplicados (capability boundary, tool/memory boundary). |
| `result_summary` | text | Resumo honesto: "execução real bloqueada até lanes futuras". |
| `created_at` | timestamptz | Momento da criação do registro. |

### 3.3 Invariantes do contrato

- Nenhum run real é executado.
- Nenhum side effect externo (`side_effects` = `none`).
- Nenhuma tool real conectada/chamada.
- Nenhuma memória operacional ativa (sem leitura/escrita de memória).
- Nenhuma automação.
- `persisted` é estado **futuro**, **não usado** até a persistência ser aplicada e validada.
- Persistência futura exige **RLS**, **write policy**, **auditabilidade** e **rollback** antes de qualquer gravação real.
- Snapshots não contêm secret, token, cookie, OAuth `code`, anon/service key nem PII desnecessária.

## 4. Arquivos

**Criados (documental):**
- `lanes/lane-15-persistent-run-evidence-contract-execution-program-v1.md` — este programa.
- `evidence/lane-15-persistent-run-evidence-contract-evidence-v1.md` — evidence documental.
- `lanes/lane-15-persistent-run-evidence-contract-closure-gate-v1.md` — closure gate.

**Atualizados:** `yzi-os-spec-harness-execution-map-v1.md`; `yzi-os-operational-checklist-architecture-agents-skills-v1.md` (no fechamento do bloco).

**Não alterados:** `platform/*` (nenhum código nesta lane), banco (nenhum SQL), tenant/membership.

## 5. Validações

Documental: revisão de coerência do contrato (estados/campos/invariantes) contra Lanes 13/14. `lint` e
`build` rodam no fechamento do **bloco 15–17** (sem mudança de código, devem permanecer verdes).

## 6. Restrições (non-goals)

Não executar SQL; não criar schema/tabela/policy/seed; não persistir run; não escrever em banco; não usar
MCP; não chamar API externa; não criar agente/runner/scheduler/tool/memória; não criar side effect; não
alterar tenant/membership/auth; não expor secret/token/cookie/OAuth `code`; não alterar `main`; não
resolver `9abc33e`; não fazer push; não commitar microetapa (commit único no fim do bloco).

## 7. Readiness esperado

`LANE_15_PERSISTENT_RUN_EVIDENCE_CONTRACT_CLOSED_DOCUMENTARY_ONLY`

# Lane 17 — Human SQL Application Gate / Pre-Execution Checklist: Execution Program v1

Projeto Supabase: `thwsltjcjrvtidhnfukc` · Modo: SDD Lite / Execution Program Mode · Branch: `lane-1-6-foundation`

Programa de execução **enxuto** da Lane 17, terceira lane do **Bloco 15–17**. Parte do readiness anterior
`LANE_16_RUNS_SQL_MANUAL_PACK_CLOSED_NOT_EXECUTED`. Abertura autorizada por `AUTORIZO O BLOCO 15–17`.

---

## 1. Objetivo

Criar o **gate humano** para a aplicação **futura** do SQL da Lane 16 — checklists de pré-execução e
pós-execução e os critérios para uma futura Lane 18 — **sem aplicar SQL agora**. Documental apenas:
nenhum SQL executado, nenhum banco alterado, nenhum MCP.

## 2. Enquadramento (gate humano, pré-execução)

`checklist pré-execução → (aplicação manual humana FUTURA, fora desta lane) → checklist pós-execução →
critérios da Lane 18`. Esta lane **não aplica** o SQL; apenas prepara as condições e a verificação que o
humano usará quando decidir aplicar.

## 3. Checklist PRÉ-execução humana (a confirmar antes de aplicar o SQL da Lane 16)

- [ ] **Branch confirmada** — `lane-1-6-foundation` (ou a branch correta do momento).
- [ ] **Projeto Supabase confirmado** — `thwsltjcjrvtidhnfukc` (conferir no dashboard, sem expor secrets).
- [ ] **Backup / rollback confirmado** — ponto de restauração e o bloco de rollback do SQL pack à mão.
- [ ] **Leitura completa do SQL** — `lane-16-runs-sql-execution-pack-manual-v1.sql` lido integralmente.
- [ ] **Nenhum MCP será usado** — aplicação não passa por Supabase MCP nem por agente.
- [ ] **Execução manual pelo humano** — colado e executado por pessoa no Supabase SQL Editor.
- [ ] **O SQL não ativa execução real** — sem runner/tool/memória/seed/insert; só DDL + RLS + SELECT policy + default-deny de escrita.

## 4. Checklist PÓS-execução humana FUTURA (a confirmar após aplicar o SQL)

- [ ] **Tabela criada** — `public.controlled_runs` existe com os campos do contrato (Lane 15).
- [ ] **RLS habilitada** — `enable` + `force row level security` ativos.
- [ ] **Policies criadas** — `controlled_runs_select_tenant_member` presente.
- [ ] **Inserts bloqueados para usuário sem permissão** — qualquer INSERT é negado (default-deny de escrita).
- [ ] **Select tenant-scoped** — operador só lê runs dos tenants aos quais pertence.
- [ ] **Rollback testável** — bloco de rollback do pack reverte tabela/índices/policy sem efeito colateral.
- [ ] **Cockpit ainda sem leitura real da tabela** — nenhuma integração de leitura criada (fica para a Lane 18).

## 5. Critérios para uma futura Lane 18

- **Somente depois** de o SQL ser aplicado **manualmente** e **validado** (checklist pós-execução completo).
- Primeira **integração read-only** do cockpit com a tabela real (`controlled_runs`), tenant-scoped via RLS.
- **Sem write automático** ainda — nenhuma gravação de run pelo cockpit; persistência de escrita segue diferida.
- Lane 18 permanece **não aberta** e **sem execution program** até frase de autorização explícita.

## 6. Arquivos

**Criados (documental):**
- `lanes/lane-17-human-sql-application-gate-execution-program-v1.md` — este programa.
- `evidence/lane-17-human-sql-application-gate-evidence-v1.md` — evidence documental.
- `lanes/lane-17-human-sql-application-gate-closure-gate-v1.md` — closure gate.

**Atualizados (no fechamento do bloco):** `yzi-os-spec-harness-execution-map-v1.md`;
`yzi-os-operational-checklist-architecture-agents-skills-v1.md`.

**Não alterados:** `platform/*`, banco (nenhum SQL), tenant/membership/auth.

## 7. Restrições (non-goals)

Não aplicar/executar SQL; não criar tabela/policy no banco; não usar MCP; não persistir run; não escrever
em banco; não criar agente/runner/scheduler/tool/memória/side effect/API externa; não alterar
tenant/membership/auth; não expor secret/token/cookie/OAuth `code`; não alterar `main`; não resolver
`9abc33e`; não fazer push; **não abrir a Lane 18**; não criar execution program da Lane 18.

## 8. Readiness esperado

`LANE_17_HUMAN_SQL_APPLICATION_GATE_CLOSED_NOT_EXECUTED`

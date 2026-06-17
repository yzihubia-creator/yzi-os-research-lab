# Lane 10 — Product Scope Candidate Review v1

Projeto Supabase: `thwsltjcjrvtidhnfukc` · Modo: SDD Lite / Execution Program Mode

Revisão de escopo **candidata** da Lane 10. Documentário: não executa código, não executa
SQL, não usa MCP, não altera `platform/` por si só, não usa service role, não versiona
token/cookie/OAuth `code`.

---

## 1. Nome candidato

**Lane 10 — Agent Definition / Read-only Configuration Layer.**

## 2. Problema de produto

A Lane 9 entregou o Agent Registry Shell **vazio** ("Nenhum agente ativo"). Falta dar ao
operador uma leitura honesta de **quais capacidades a operação vai habilitar** — finalidade,
status e limites — sem executar nada e sem transformar o cockpit em toolkit/console técnico.

## 3. Achado nas specs (fonte de verdade)

O PRD §24 **não** contém roster de agentes nomeados. Os docs do Growth OS
(`docs/specs/product/yzi-os-operating-model-v1.md`, `yzi-os-product-architecture-plan-v1.md`)
descrevem **módulos** (Opportunity Radar, Pipeline OS, Follow-up OS, Memory OS, Executive
Cockpit) e **jobs** (qualificação, follow-up, nutrição, reativação); os agentes são "a força
operacional **por baixo** dos módulos". Regra de posicionamento explícita: *"Lead with the
operator, not the OS. Sell the outcome, not the architecture"* — **agentes não são
protagonistas**.

## 4. Decisão de produto (humana)

**Job-anchored.** Declarar as capacidades planejadas pelo **resultado/job**, não por nomes de
agentes. Agentes permanecem como motor por baixo, nunca a superfície. Nenhum nome de agente é
apresentado como se já existisse institucionalmente. Enquadramento de UI aprovado:
**"Operação de crescimento — capacidades planejadas"**.

### Capacidades planejadas aprovadas (linguagem de produto)

Qualificação de oportunidades · Radar de oportunidades · Follow-up operacional · Nutrição e
reativação · Memória operacional futura · Supervisão executiva.

Cada capacidade: **planejada · não ativa · sem execução automática · sem agente rodando · sem
MCP/runner/tool/memória · dependente de lanes futuras**.

## 5. Definition of Done (DoD)

1. Camada read-only/declarativa job-anchored no `tenant_found` do cockpit.
2. Cada capacidade exibida como planejada/não ativa com finalidade e limites.
3. `lint` e `build` verdes.
4. Auth/RLS e UX/Cockpit aprovados.
5. Runtime/browser validado por humano.
6. Evidence + closure gate + mapa atualizado + commit único local (sem push).

## 6. Non-goals (por design)

Nenhum agente real, execução, MCP, runner, scheduler, tool ou memória operacional; nenhum SQL,
schema, tabela `agents`, tenant, membership, seed ou policy; nenhum botão de ativar agente;
nenhuma ação falsa; nenhum painel administrativo amplo; nenhum roster canônico de agentes
nomeados. Não mexer em `main`; não resolver `9abc33e`; não fazer push; não abrir a Lane 11.

# Lane 9 — Product Scope Candidate Review v1

Projeto Supabase: `thwsltjcjrvtidhnfukc` · Modo: SDD Lite / Execution Program Mode

Revisão de escopo **candidata** da Lane 9. Documentário: não executa código, não executa
SQL, não usa MCP, não altera `platform/` por si só, não usa service role, não versiona
token/cookie/OAuth `code`.

---

## 1. Nome candidato

**Lane 9 — Agent Registry Shell / Agent Existence Layer.**

## 2. Problema de produto

Hoje, no estado `tenant_found`, o cockpit mostra um bloco mínimo dizendo apenas que a "base de
operação agentic" está vazia. O operador vê o tenant real e o seu papel (`viewer`), mas **não
existe uma superfície** onde os agentes institucionais da operação vão viver. Falta a primeira
**área de existência de agentes** — honesta, governada e vazia.

## 3. Decisão de produto

Criar a primeira **superfície completa e honesta de existência de agentes** no cockpit: o
operador vê a área de Agent Registry em estado vazio/governado, entende que **nenhum agente
está ativo ainda**, e vê **quais capacidades futuras serão habilitadas** — sem executar agente
real, sem runner, sem MCP, sem tools, sem memória operacional, sem automação.

## 4. O que "agente existir" significa nesta fase

"Existir" aqui é **ter um lugar declarado no produto**, não executar. A Lane 9 entrega a
*superfície* onde agentes passarão a existir; ela não cria nenhum agente, nenhuma tabela
`agents`, nenhum registro real. O vazio é a verdade exibida — não há simulação.

## 5. Estado vazio honesto

- Manchete: **"Nenhum agente ativo"**.
- Corpo: nenhum agente foi criado e nenhum está em execução; a área não simula agentes nem
  oferece ação para ativá-los.
- Fronteira de execução: não há runner, tool, memória ou MCP; área somente leitura.
- Capacidades futuras: declaradas como "ainda não habilitado" — sem botão, sem ação.

## 6. Definition of Done (DoD) da Lane 9

1. Superfície visual de Agent Registry no `tenant_found` do cockpit.
2. Estado vazio honesto de agentes.
3. Fronteira de capacidades (o que a área ainda não faz).
4. Capacidades futuras declarativas e não-executáveis.
5. `lint` e `build` verdes.
6. Auth/RLS e UX/Cockpit aprovados.
7. Runtime/browser validado por humano (tenant real + role viewer + registry shell + vazio
   honesto + nenhuma ação falsa).
8. Evidence + closure gate + mapa atualizado + commit único.

## 7. Non-goals (por design)

Nenhum agente real, runtime, MCP, runner, scheduler, tool ou memória operacional; nenhum SQL,
schema, tabela `agents`, tenant, membership, seed ou policy; nenhum role model amplo; nenhuma
ação administrativa; nenhum botão que prometa ativar agente; nenhum onboarding comercial.
Não mexer em `main`; não resolver o commit acidental `9abc33e`; não fazer push; não commitar
microetapas; não abrir a Lane 10.

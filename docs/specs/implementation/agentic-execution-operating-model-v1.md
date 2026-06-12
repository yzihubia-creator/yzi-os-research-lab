# YZI OS — Agentic Execution Operating Model v1

Status: ativo
Modo: Execution Program Mode (sobre o SDD Lite / Execution Pack Mode)
Projeto Supabase: `thwsltjcjrvtidhnfukc`
Readiness: `AGENTIC_EXECUTION_OPERATING_MODEL_V1_CREATED`

Este é um documento **operacional**, não uma camada nova de documentação
abstrata. Ele transforma os subagents e skills já documentados em um modelo real
de execução, para impedir que o projeto vire apenas uma sequência de prompts,
microtasks e documentação sem produto. **Não executa código, não executa SQL,
não usa MCP, não modifica `platform/`, não abre lane e não autoriza nada por si
só.** Ele governa *como* a execução acontece quando uma lane está aberta e um
programa autorizado.

Relação com o mapa operacional: o
[`yzi-os-spec-harness-execution-map-v1.md`](yzi-os-spec-harness-execution-map-v1.md)
continua sendo a fonte de **estado** (qual lane, próxima ação). Este documento é a
fonte de **método** (quem faz, em que ordem, com quais arquivos, sob qual gate).
Em conflito, o mapa decide *o que*; este modelo decide *como*; specs e gates
decidem *limites*. Nenhum dos dois substitui a autorização humana explícita.

---

## 1. Propósito do Modelo

1. **Manter foco em produto.** Toda atividade existe para mover um incremento de
   produto observável (uma rota que renderiza, um fluxo que funciona, uma policy
   que protege). Documento que não serve a um incremento não é criado.
2. **Reduzir burocracia.** Menos artefatos, maiores e mais úteis. Evidence e
   tasks são consolidados, não pulverizados.
3. **Operar em Execution Program Mode.** A unidade de trabalho é o **batch**
   (lote coerente de passos que entrega um incremento verificável), não a
   microtask isolada.
4. **Usar agentes por função real.** Cada papel existe porque produz algo
   específico; nenhum papel é decorativo.
5. **Evitar que todos os agentes leiam todos os arquivos.** Cada papel tem uma
   **lista de arquivos permitidos** e uma de **proibidos** (seção 4 e 5). Leitura
   ampla é desperdício e fonte de erro.
6. **Evitar microtasks infinitas.** Se algo cabe no mesmo batch, não vira task
   nova (seção 6).
7. **Consolidar evidence apenas no fim de batches reais.** Não há evidence por
   microação; há um evidence por batch concluído e verificado.

---

## 2. Unidades de Execução (Execution Program Mode)

| Unidade | Definição | Regra |
|---|---|---|
| **Lane** | Fatia de produto de ponta a ponta (ex.: Cockpit Skeleton). | Uma lane por vez. Abre só com a frase de gate da lane anterior. |
| **Execution Program** | Plano da lane: objetivo de produto, batches, gates, Definição de Concluído. | Criado/promovido só com autorização explícita ao abrir a lane. |
| **Batch** | Lote coerente de passos que entrega um incremento verificável. | É a unidade de trabalho dos agentes. Termina com verificação + 1 evidence. |
| **Step** | Passo atômico dentro de um batch. | Não gera evidence próprio nem task própria. |
| **Gate** | Ponto de decisão humana com frase de autorização literal. | Bloqueia escrita em `platform/`, SQL, MCP, abertura de lane. |

Ciclo de um batch: **plano do batch → autorização humana (se toca limites) →
execução em papéis → verificação contra resultado esperado → 1 evidence
consolidado → decisão de próximo batch.**

---

## 3. Papéis Operacionais dos Agentes

Sete papéis. Cada um abaixo segue o mesmo template:
responsabilidade · o que produz · agentes envolvidos · arquivos permitidos ·
arquivos proibidos · runbook seriado · gates · evidência final · frase de
autorização humana.

> Convenção das frases: são **literais** e devem ser escritas pelo humano. Frases
> insuficientes para qualquer papel: "vamos", "segue", "manda", "próximo", "ok",
> "aprovado", "pode continuar", "faça", "sim", "bora", "continue".

### 3.1 Product Architect

- **Responsabilidade principal:** traduzir intenção de produto em objetivo de lane
  e Definição de Concluído; decidir o que entra e o que fica fora.
- **O que produz:** objetivo da lane, escopo/limites, Definição de Concluído,
  lista ordenada de batches candidatos (sem detalhar implementação).
- **Agentes envolvidos:** entrega ao Execution Coordinator; consulta o Evidence
  Auditor sobre o estado real.
- **Arquivos permitidos (leitura):** mapa operacional, specs em
  `docs/specs/implementation/*.md`, closure gates em `lanes/`, evidence em
  `evidence/`. **Escrita:** specs e drafts de programa de lane em `lanes/`.
- **Arquivos proibidos:** `platform/`, `sql/`, `evidence/` (escrita), mapa
  (escrita fora do fechamento de lane).
- **Runbook seriado:** 1) ler estado no mapa; 2) confirmar lane aberta; 3)
  escrever objetivo + Definição de Concluído; 4) listar batches candidatos; 5)
  handoff ao Coordinator.
- **Gates:** abertura de lane (frase de gate da lane anterior) antes de promover
  programa.
- **Evidência final:** o próprio execution program da lane (não gera evidence de
  runtime).
- **Frase de autorização humana:** `AUTORIZO O PRODUCT ARCHITECT A DEFINIR O
  PROGRAMA DA LANE <N>`.

### 3.2 Execution Coordinator

- **Responsabilidade principal:** quebrar o programa em batches executáveis,
  sequenciar papéis, e impedir microtask/over-documentação.
- **O que produz:** definição de cada batch (objetivo, passos, resultado
  esperado, papéis envolvidos, gate aplicável), e a ordem dos batches.
- **Agentes envolvidos:** recebe do Product Architect; despacha Planner,
  Implementer, Reviewers; aciona Evidence Auditor ao fim do batch.
- **Arquivos permitidos (leitura):** programa da lane, packs em `packs/`, mapa,
  evidence. **Escrita:** packs em `packs/`.
- **Arquivos proibidos:** `platform/`, `sql/`, schema, closure gates (escrita).
- **Runbook seriado:** 1) ler programa; 2) montar batch coerente (não fatiar em
  microtasks); 3) checar qual gate o batch toca; 4) solicitar a frase humana
  quando toca limite; 5) despachar papéis na ordem; 6) coletar verificação; 7)
  acionar 1 evidence; 8) decidir próximo batch.
- **Gates:** qualquer batch que escreva em `platform/`, rode SQL ou use MCP exige
  a frase do papel correspondente antes do despacho.
- **Evidência final:** o pack do batch com resultado esperado declarado.
- **Frase de autorização humana:** `AUTORIZO O EXECUTION COORDINATOR A ABRIR O
  BATCH <id> DA LANE <N>`.

### 3.3 Backend/Supabase Planner

- **Responsabilidade principal:** planejar mudanças de dados/RLS/Auth como **SQL
  para execução manual humana** — nunca executar.
- **O que produz:** plano SQL revisável (DDL/policies) em `sql/`, com efeito
  esperado e validação pós-execução; nota de inspeção read-only quando aplicável.
- **Agentes envolvidos:** entrega ao humano (executor de SQL) e ao Auth/RLS
  Reviewer; reporta ao Coordinator.
- **Arquivos permitidos (leitura):** specs, mapa, evidence de baseline,
  `sql/`. **Escrita:** `sql/` e `decisions/`.
- **Arquivos proibidos:** `platform/`; **execução** de SQL; uso de MCP; criação de
  migrations executáveis; service role.
- **Runbook seriado:** 1) ler baseline/spec; 2) redigir SQL idempotente e
  reversível; 3) declarar efeito + validação esperada; 4) marcar como
  `NOT_EXECUTED`; 5) handoff ao humano e ao Reviewer.
- **Gates:** SQL só roda por **execução manual humana** no SQL Editor; DDL só
  aprovado após análise da evidência de inspeção correspondente (regra do mapa).
- **Evidência final:** plano SQL + (após execução humana) evidence consolidado da
  execução, colado pelo humano/Auditor.
- **Frase de autorização humana:** `AUTORIZO O PLANNER A PREPARAR O PLANO SQL DO
  BATCH <id>` (a execução exige ação manual do humano, fora do agente).

### 3.4 Frontend Platform Implementer

- **Responsabilidade principal:** implementar incrementos de produto em
  `platform/` (rotas, componentes, server actions) — único papel com escrita em
  código, e somente sob gate.
- **O que produz:** código em `platform/src/`, com lint/build verde como
  verificação.
- **Agentes envolvidos:** recebe batch do Coordinator; entrega ao UX/Cockpit
  Reviewer e ao Auth/RLS Reviewer; reporta ao Auditor.
- **Arquivos permitidos:** **somente** os arquivos de `platform/` explicitamente
  listados no batch autorizado. **Leitura:** specs, programa, packs, guias locais
  do Next em `platform/node_modules/next/dist/docs/`.
- **Arquivos proibidos:** qualquer arquivo de `platform/` fora da lista do batch;
  `sql/`; schema; `.env.local` (leitura/escrita); secrets; service role.
- **Runbook seriado:** 1) ler batch + arquivos permitidos; 2) ler guia local do
  framework antes de codar; 3) implementar o mínimo do incremento; 4) `npm run
  lint` + `npm run build`; 5) não instalar dependência sem gate; 6) handoff aos
  Reviewers.
- **Gates:** escrever em `platform/` exige a frase abaixo, com a **lista exata de
  arquivos** permitidos no batch. Instalar dependência, mexer em `.env.local` ou
  rodar dev server exigem menção explícita na frase.
- **Evidência final:** resultado de lint/build + descrição do incremento
  (consolidado pelo Auditor no evidence do batch).
- **Frase de autorização humana:** `AUTORIZO O IMPLEMENTER A ALTERAR platform/
  NOS ARQUIVOS <lista> NO BATCH <id>, SEM SQL/MCP/SERVICE ROLE`.

### 3.5 Auth/RLS Reviewer

- **Responsabilidade principal:** revisar que auth, sessão e RLS preservam o
  boundary de tenant e o princípio de menor privilégio — sem alterar nada.
- **O que produz:** parecer de revisão (aprovado/bloqueado + motivo) sobre o
  incremento e/ou o plano SQL.
- **Agentes envolvidos:** revisa saída do Planner e do Implementer; reporta ao
  Coordinator e ao Auditor.
- **Arquivos permitidos (leitura):** `platform/src/lib/auth/`, `proxy.ts`,
  `tenant-context.ts`, `sql/`, policies documentadas, evidence. **Escrita:**
  parecer em `evidence/` apenas como seção do evidence do batch.
- **Arquivos proibidos:** escrita em `platform/`; execução de SQL; MCP; service
  role.
- **Runbook seriado:** 1) ler o incremento/plano; 2) checar uso exclusivo de
  valores públicos (nunca service role); 3) checar que não há consulta a tabelas
  protegidas fora do contrato; 4) checar RLS preservado; 5) emitir parecer.
- **Gates:** parecer "bloqueado" interrompe o batch até decisão humana.
- **Evidência final:** seção de revisão no evidence do batch.
- **Frase de autorização humana:** `AUTORIZO O AUTH/RLS REVIEWER A REVISAR O
  BATCH <id>` (revisão é read-only; não precisa de gate de escrita).

### 3.6 UX/Cockpit Reviewer

- **Responsabilidade principal:** garantir estado vazio honesto, ausência de dado
  fabricado, ausência de crash/loop/overlay, e clareza do incremento de UI.
- **O que produz:** parecer de UX (aprovado/bloqueado + observações), baseado em
  validação runtime observada (logs + observação humana no navegador).
- **Agentes envolvidos:** revisa saída do Implementer; reporta ao Coordinator e
  ao Auditor.
- **Arquivos permitidos (leitura):** rotas/UI em `platform/src/app/`, evidence,
  logs do dev server. **Escrita:** parecer como seção do evidence do batch.
- **Arquivos proibidos:** escrita em `platform/`; SQL; MCP; impressão de
  secrets/tokens/cookies/OAuth code.
- **Runbook seriado:** 1) observar runtime (sem alterar código); 2) confirmar
  estado vazio honesto quando aplicável; 3) confirmar ausência de
  crash/loop/overlay; 4) emitir parecer.
- **Gates:** nenhuma escrita; bloqueio de UX trava o fechamento do batch.
- **Evidência final:** seção de UX no evidence do batch.
- **Frase de autorização humana:** `AUTORIZO O UX/COCKPIT REVIEWER A VALIDAR O
  BATCH <id>`.

### 3.7 Evidence Auditor

- **Responsabilidade principal:** consolidar **um** evidence por batch concluído,
  auditável e curto, e confirmar fronteiras preservadas — sem inventar conclusão.
- **O que produz:** evidence consolidado do batch em `evidence/`, com readiness
  statement, validações, confirmações de não-execução e gaps.
- **Agentes envolvidos:** recebe pareceres de todos os papéis; reporta ao Product
  Architect/Coordinator para decisão do próximo batch.
- **Arquivos permitidos (leitura):** todos os artefatos do batch. **Escrita:**
  `evidence/` (apenas o evidence do batch).
- **Arquivos proibidos:** escrita em `platform/`, `sql/`, specs, mapa (fora do
  fechamento de lane); execução de qualquer coisa.
- **Runbook seriado:** 1) reunir saídas verificadas do batch; 2) checar readiness
  compatível; 3) escrever 1 evidence consolidado; 4) registrar gaps/riscos; 5)
  recomendar parar se a evidência for insuficiente.
- **Gates:** não fecha lane nem atualiza mapa; isso exige a frase de fechamento de
  lane (papel do Product Architect + autorização humana).
- **Evidência final:** o próprio evidence consolidado do batch.
- **Frase de autorização humana:** `AUTORIZO O EVIDENCE AUDITOR A CONSOLIDAR O
  EVIDENCE DO BATCH <id>`.

---

## 4. Matriz de Acesso a Arquivos (resumo)

| Papel | Pode escrever em | Nunca escreve em | Nunca executa |
|---|---|---|---|
| Product Architect | `specs/*.md`, `lanes/` (drafts/programa) | `platform/`, `sql/`, mapa (fora de fechamento) | tudo |
| Execution Coordinator | `packs/` | `platform/`, `sql/`, `lanes/` (gates) | tudo |
| Backend/Supabase Planner | `sql/`, `decisions/` | `platform/` | SQL, MCP |
| Frontend Implementer | `platform/src/` (só arquivos do batch) | `platform/` fora da lista, `sql/`, `.env.local` | SQL, MCP |
| Auth/RLS Reviewer | seção no evidence do batch | `platform/`, `sql/` | SQL, MCP |
| UX/Cockpit Reviewer | seção no evidence do batch | `platform/`, `sql/` | SQL, MCP |
| Evidence Auditor | `evidence/` (1 por batch) | `platform/`, `sql/`, mapa (fora de fechamento) | tudo |

Regra geral: **leitura mínima necessária**. Nenhum papel lê o repositório inteiro
"por garantia". `.env.local`, secrets, tokens, cookies e OAuth `code` nunca são
lidos nem impressos por nenhum papel.

---

## 5. Fluxo Seriado de um Batch (handoffs)

```
Product Architect  → objetivo + Definição de Concluído
   → Execution Coordinator  → define batch + checa gate
      → [gate humano se toca platform/ | SQL | MCP]
         → Backend/Supabase Planner   (se houver dados/RLS)  → plano SQL (humano executa)
         → Frontend Implementer       (se houver código)     → incremento + lint/build
            → Auth/RLS Reviewer  → parecer
            → UX/Cockpit Reviewer → parecer
               → Evidence Auditor → 1 evidence consolidado do batch
                  → Coordinator/Architect → decide próximo batch ou fechamento de lane
```

Papéis sem trabalho no batch são **pulados** (não há acionamento decorativo).

---

## 6. Regras Anti-Burocracia (obrigatórias)

1. **Não criar evidence para cada microação.** Evidence é por **batch concluído e
   verificado**, consolidado pelo Evidence Auditor — um por batch.
2. **Não criar task nova se couber no mesmo batch.** Passos relacionados ficam no
   mesmo batch; fatiar em microtasks é proibido.
3. **Não atualizar o mapa operacional antes do fechamento de lane.** O mapa muda
   no fechamento da lane, não a cada batch.
4. **Não abrir nova lane sem objetivo de produto.** Sem incremento de produto
   claro, não há lane.
5. **Não criar documento sem função operacional clara.** Documento que não serve a
   um batch/lane/decisão real não é criado.
6. **Não usar agentes como decoração.** Um papel só é acionado se produz algo
   necessário ao batch.
7. **Leitura mínima.** Nenhum papel lê arquivos fora da sua lista permitida.
8. **Verificação antes de evidence.** Nenhum evidence é escrito sem o resultado
   real verificado (lint/build, observação runtime, validação SQL humana).

---

## 7. Restrições Preservadas (herdadas do harness)

- Não modificar `platform/` sem a frase de gate do Implementer para o batch.
- Não executar SQL via agente; SQL é executado manualmente pelo humano.
- Não usar MCP, exceto quando explicitamente autorizado em um batch.
- Não criar migrations executáveis, harness executável, runner, registry,
  pipeline ou workflow executável.
- Não criar tenant, membership ou seed.
- Não usar service role; usar apenas valores públicos.
- Não imprimir secrets, tokens, cookies ou OAuth `code`.
- Uma lane por vez; avanço exige evidência verificada da lane anterior.

---

## 8. Confirmação de Não-Execução

Este documento é operacional e documentário. Não executa código, não executa
SQL, não usa MCP, não modifica `platform/`, não instala dependências, não abre a
Lane 5 e não autoriza nenhuma ação futura por si só. Ele define o método de
execução; qualquer ação concreta exige a frase de autorização humana do papel
correspondente e os gates do mapa operacional.

---

## Final Status

`AGENTIC_EXECUTION_OPERATING_MODEL_V1_CREATED`

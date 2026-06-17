# Pack 01 — Lane 5 · Batch 5.1 — Product Surface Definition for Agent Operations Layer v1

> Pack documental da **Lane 5 — Agent Operations Layer**, Batch 5.1. **Não executa
> nada**: não altera `platform/`, não altera código, não cria SQL, não usa MCP, não
> cria tenant/membership/seed, não cria evidence, não abre o Batch 5.3 e não
> implementa UI. É **definição de superfície de produto** em texto de spec, anterior
> a qualquer implementação.

Lane: 5 — Agent Operations Layer · Status da lane: **ABERTA (G1)** · Batch: **5.1**
Modo: Execution Program Mode (sobre o SDD Lite / Execution Pack Mode)
Projeto Supabase: `thwsltjcjrvtidhnfukc`
Data: 2026-06-12
Papéis ativados: **Product Architect** (principal) · **Execution Coordinator** (sequenciamento/handoff)

---

## 0. Contexto de Gate (por que este batch pode rodar)

- **G1 — Abrir a Lane 5** recebido: frase humana literal
  `AUTORIZO ABERTURA DA LANE 5 — AGENT OPERATIONS LAYER` (conforme
  [`lane-5-agent-operations-layer-execution-program-v1.md`](../../lanes/lane-5-agent-operations-layer-execution-program-v1.md) §7/§9 e
  [`lane-4-cockpit-skeleton-closure-gate-v1.md`](../../lanes/lane-4-cockpit-skeleton-closure-gate-v1.md) §5).
- O que **G1 desbloqueou**: promoção do Execution Program da Lane 5 a ativo e
  criação de packs de batch.
- O que **G1 NÃO desbloqueou**: escrita em `platform/`, código, SQL, MCP, service
  role, criação de tenant/membership/seed — cada um continua exigindo seu próprio
  gate (G2–G7) dentro do programa.
- **Batch 5.1 não toca limites** (programa §5, Batch 5.1: "Toca limites? Não — somente
  texto de spec/programa. Sem gate de `platform/`/SQL/MCP"). Por isso é executável
  sob a autorização humana deste batch, sem gate adicional de código.

---

## 1. Objetivo do Batch 5.1

Definir, **em termos de produto**, **o que** a superfície da camada de operação de
agentes é para o operador humano — o que ele **vê, entende e poderá aprovar** — **sem**
desenhar implementação, **sem** nomear agentes reais e **sem** instanciar nada. O
entregável é a definição de superfície + a **Definition of Done da Lane 5**, mais o
handoff para o Batch 5.2 (design dos estados operacionais do cockpit).

Este documento é, ao mesmo tempo, o **pack** (processo do batch) e o **entregável**
(definição de superfície), consolidados num único artefato conforme o princípio de
"menos artefatos, maiores e mais úteis" do operating model §1.

---

## 2. Objetivo de Produto Refinado (a partir do programa §2)

O operador é quem **define o objetivo do agente, o configura e responde pelo
resultado** (PRD §2). Hoje, ao autenticar, ele chega a um cockpit que diz apenas
"você não pertence a nenhum tenant": honesto, porém **mudo** — não explica o vínculo,
não mostra a operação, não orienta o próximo passo.

**Refinamento (o que a Lane 5 entrega como produto):** transformar essa superfície
muda numa **superfície que fala** — o operador passa a **entender seu lugar na
operação** *antes* de qualquer agente existir. A Lane 5 entrega a **base operacional
supervisionável**: o degrau entre o *esqueleto navegável* (Lane 4) e a *operação real
de agentes institucionais* (lanes futuras).

A asserção institucional "a arquitetura é o produto" vale na infraestrutura; **na
superfície do operador o produto lidera pelo outcome operado** (PRD §0/§8, patch de
clareza). Logo, a Lane 5 mostra **a operação e o vínculo**, não o diagrama de camadas
— o cockpit **não** vira console técnico genérico.

---

## 3. Definição da Superfície Operacional (o que o operador deve entender no cockpit)

A superfície da Lane 5 é composta por **três entendimentos** do operador e por uma
**leitura honesta de estado**. Aqui se define **o que** cada um significa em produto;
o **como** (estados de UI, cópia por estado, placeholder) é desenhado no Batch 5.2 e
implementado, sob gate próprio, a partir do Batch 5.3.

### 3.1 Entender **quem ele é na operação**
- Identidade do operador **derivada da sessão** autenticada (Lane 4: Google OAuth +
  sessão Supabase).
- **Sem inventar perfil**: nenhum nome, papel, avatar ou atributo fabricado além do
  que a sessão real fornece.

### 3.2 Entender **seu vínculo** (membership + tenant boundary)
- **Tenant** = partição transversal de isolamento (PRD §18, `P10`).
- **Membership** = o **vínculo governado entre operador e tenant** que **determina o
  que o operador pode ver, aprovar e operar** (PRD §18, patch de clareza).
- A superfície torna esse vínculo **legível na tela**: o operador vê honestamente se
  **pertence** ou **não pertence** a um tenant e **o que isso significa** para o que
  poderá ver/aprovar/operar — **sem** o sistema inventar pertencimento.

### 3.3 Enxergar a **base da operação agentic** (nomeada, não instanciada)
- Uma superfície operacional mínima que **nomeia** a operação institucional futura
  (onde agentes serão configurados, supervisionados e operados com governança).
- Apresentada com **estado vazio honesto**: nomeia a operação que virá **sem**
  instanciar agentes, **sem** dados fabricados. Ver §4 para a definição precisa de
  "base agentic".

### 3.4 Leitura honesta de estado (nomeação em nível de produto)
Os estados operacionais **operador-facing** que a superfície precisa expressar — cuja
**semântica de produto** se fixa aqui e cujo **design** é do Batch 5.2 — são:

| Estado | Significado em produto | Tratamento honesto |
|---|---|---|
| `no_session` | operador não autenticado | leva ao login; sem cockpit |
| `no_membership` | autenticado, sem vínculo a tenant | estado vazio honesto: explica o boundary, nada fabricado |
| `tenant_found` | autenticado, com membership a um tenant | **desenhado** na Lane 5; **só exercitado em runtime com tenant real sob gate humano em lane futura** |
| `error` | falha de leitura/sessão | mensagem honesta, sem vazar segredo/token |

> Nesta lane, com banco limpo (0 tenants/memberships), o caminho real exercitado é
> `no_membership`; `tenant_found` permanece **projeto desenhado**, não exercício
> runtime (programa §2/§3; closure gate da Lane 4 §3).

---

## 4. O que "base agentic" significa **sem criar agente real**

**É** (permitido na Lane 5):
- **Nomear** a operação institucional futura na superfície — um lugar reconhecível
  onde, em lanes futuras, agentes serão configurados/supervisionados/operados.
- Um **placeholder honesto** com estado vazio explícito ("ainda não há operação
  agentic configurada"), coerente com o tenant boundary e o vínculo do operador.
- Texto institucional que **prepara o entendimento** do operador sobre o que virá.

**NÃO é** (diferido, cada um com gate próprio — programa §3):
- nenhuma **instância de agente** institucional operando;
- nenhum **subagent executável**, **runner**, orquestrador, scheduler ou pipeline;
- nenhum **MCP** ou integração MCP;
- nenhum **dado fabricado** de agente, execução, métrica ou histórico;
- nenhuma exposição de **agents/tools/state** como console técnico genérico;
- nenhuma criação de **tenant/membership/seed** real;
- nenhuma **policy de escrita** (INSERT/UPDATE/DELETE).

Em uma frase: **a base agentic da Lane 5 é uma promessa de superfície — nomeia e
prepara, não executa nem fabrica.**

---

## 5. Definition of Done da Lane 5

A Lane 5 estará **concluída** quando **todos** os critérios abaixo forem verdadeiros
(derivado de programa §1, §2, §8 e do operating model §7):

1. **Identidade legível** — o operador autenticado vê, no cockpit, quem ele é a partir
   da sessão real, sem perfil inventado.
2. **Vínculo legível** — o cockpit explicita **membership** e **tenant boundary** de
   forma honesta: pertence / não pertence, e o que isso significa para
   ver/aprovar/operar.
3. **Base agentic nomeada** — a superfície nomeia a operação agentic futura com estado
   vazio honesto, **sem** agentes, **sem** dados fabricados (conforme §4).
4. **Estados honestos** — `no_session`/`no_membership`/`tenant_found`/`error` tratados
   honestamente; `tenant_found` **desenhado**, exercitado em runtime **só** com tenant
   real sob gate humano futuro.
5. **Cockpit não vira console técnico** — sem exposição de agents/tools/state como UI;
   lidera pelo outcome operado.
6. **Pelo menos um batch real entregue** — executado, verificado (`npm run lint` +
   `npm run build` verdes **e** observação runtime: sem crash/loop/overlay, sem dado
   fabricado) e **auditado** por **1 evidence consolidado** (programa §8).
7. **Fronteiras preservadas** — nenhum agente/subagent/MCP/runner; nenhum
   tenant/membership/seed real; nenhuma policy de escrita; `platform/` alterado
   **apenas** sob gate do Implementer com lista exata de arquivos; service role nunca
   usada.
8. **Fechamento sob gate próprio** — closure gate da Lane 5 (Product Architect + frase
   humana literal), análogo ao da Lane 4; readiness de saída
   `LANE_5_AGENT_OPERATIONS_LAYER_CLOSED` (token provisório, renomeável por decisão
   humana no closure gate).

**Fora da DoD da Lane 5 (diferido):** criação de agentes reais, subagents executáveis,
MCP, runner, tenant/membership/seed real, policies de escrita, dashboard/CRUD/billing,
e o exercício runtime do caminho `tenant_found` com tenant real.

---

## 6. Escopo deste Batch

### Autorizado (Batch 5.1)
- Refinar o objetivo de produto (§2);
- Definir a superfície operacional em termos de produto (§3);
- Definir "base agentic" sem agente real (§4);
- Fixar a Definition of Done da Lane 5 (§5);
- Preparar o handoff para o Batch 5.2 (§7).

### Proibido (Batch 5.1)
- Qualquer escrita em `platform/` ou em código;
- Qualquer SQL, MCP, service role, build, instalação de dependência;
- Criar tenant, membership ou seed;
- Criar evidence (não há evidence por microação; evidence só ao fim de batch real);
- Desenhar/implementar UI ou cópia final por estado (isso é Batch 5.2 → 5.3);
- Abrir o Batch 5.3 (implementação) ou qualquer outro batch;
- Nomear agentes reais ou instanciar a base agentic.

---

## 7. Handoff → Batch 5.2 (Cockpit tenant/membership operational state design)

O **Execution Coordinator** registra que, com a superfície definida, o próximo batch
candidato é o **Batch 5.2**, que receberá deste artefato:

- a **semântica de produto** dos estados `no_session`/`no_membership`/`tenant_found`/
  `error` (§3.4) para virar **design de estados operador-facing**;
- a definição de **membership** e **tenant boundary** legíveis (§3.2) para a cópia/
  conteúdo honesto por estado;
- a definição de **base agentic nomeada** (§4) para desenhar o **placeholder** da
  operação futura (nomear sem instanciar);
- a **Definition of Done da Lane 5** (§5) como critério de aceitação a perseguir.

> O Batch 5.2 é **design documental** (programa §5: "Toca limites? Não"). A
> **implementação** só ocorre no Batch 5.3, **fora desta task**, e exige a frase de
> gate do Implementer (G4) com lista exata de arquivos de `platform/`.
> **Este batch não abre o 5.2 nem o 5.3** — apenas prepara o handoff.

---

## 8. Validação deste Batch

- Cada entendimento da superfície (§3.1–§3.3) rastreável a PRD §2/§8/§18 + patch e ao
  programa §1/§2 — **sem doutrina nova**.
- "Base agentic" definida com fronteira explícita do que **é** e do que **não é** (§4).
- DoD da Lane 5 com 8 critérios verificáveis (§5), coerentes com os Non-Goals do
  programa §3.
- Handoff para o Batch 5.2 explícito (§7), sem abrir batch nem tocar limites.

## 9. Stop Conditions

- Necessidade de tocar `platform/`/SQL/MCP para concluir o batch → **parar**: fora do
  escopo do Batch 5.1; exige gate próprio.
- Ambiguidade sobre o que é "base agentic" vs "agente real" → `SCOPE_AMBIGUITY`,
  decisão humana antes de prosseguir.
- Qualquer pressão para implementar UI ou abrir o Batch 5.3 → recusar; não autorizado.

---

## Confirmação de Não-Execução (nenhuma implementação foi feita)

Este artefato é **definição de superfície de produto** em texto de spec. **Não** alterou
`platform/`, **não** alterou código, **não** criou SQL, **não** usou MCP, **não** criou
tenant/membership/seed, **não** criou evidence, **não** abriu o Batch 5.2 nem o 5.3 e
**não** implementou UI. Nenhuma instância de agente foi criada; a base agentic foi
apenas **nomeada e definida**, não instanciada. Qualquer ação concreta posterior exige
a frase de autorização humana do gate correspondente (programa §7).

---

## Readiness deste Batch

`LANE_5_BATCH_5_1_PRODUCT_SURFACE_DEFINED_NOT_IMPLEMENTED`

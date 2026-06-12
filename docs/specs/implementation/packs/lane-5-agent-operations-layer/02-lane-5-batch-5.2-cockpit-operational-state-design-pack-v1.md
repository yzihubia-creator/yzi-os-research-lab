# Pack 02 — Lane 5 · Batch 5.2 — Cockpit tenant/membership Operational State Design v1

> Pack documental da **Lane 5 — Agent Operations Layer**, Batch 5.2. **Não executa
> nada**: não altera `platform/`, não altera código, não cria SQL, não usa MCP, não
> cria tenant/membership/seed, não cria evidence, não abre o Batch 5.3, não planeja
> implementação, não atualiza o mapa operacional e não fecha a Lane 5. É **design de
> estados operacionais** em texto de spec — o degrau entre a definição de superfície
> (Batch 5.1) e o plano de implementação (Batch 5.3).

Lane: 5 — Agent Operations Layer · Status da lane: **ABERTA (G1)** · Batch: **5.2**
Modo: Execution Program Mode (sobre o SDD Lite / Execution Pack Mode)
Projeto Supabase: `thwsltjcjrvtidhnfukc`
Data: 2026-06-12
Papéis ativados: **Product Architect** (semântica dos estados) · **Execution Coordinator** (sequenciamento/handoff) · **UX/Cockpit Reviewer** (estado vazio honesto, sem dado inventado, cockpit ≠ console)

Entradas lidas:
- [`lanes/lane-5-agent-operations-layer-execution-program-v1.md`](../../lanes/lane-5-agent-operations-layer-execution-program-v1.md)
- [`01-lane-5-batch-5.1-product-surface-definition-pack-v1.md`](01-lane-5-batch-5.1-product-surface-definition-pack-v1.md)

---

## 0. Contexto de Gate (por que este batch pode rodar)

- Lane 5 **aberta** por G1 (`AUTORIZO ABERTURA DA LANE 5 — AGENT OPERATIONS LAYER`).
- Batch 5.1 concluído e commitado (`2a67e75`),
  readiness `LANE_5_BATCH_5_1_PRODUCT_SURFACE_DEFINED_NOT_IMPLEMENTED`.
- **Batch 5.2 não toca limites** (programa §5, Batch 5.2: "Toca limites? Não — design
  documental. Sem gate de `platform/`/SQL/MCP"). Executável sob a autorização humana
  deste batch, sem gate de código.
- Este batch **não** abre o Batch 5.3 (implementação), **não** planeja implementação e
  **não** desenha código — apenas a semântica e a cópia honesta de cada estado.

---

## 1. Objetivo do Batch 5.2

Transformar a superfície de produto do Batch 5.1 (§3) em um **design claro dos quatro
estados operacionais do cockpit** — `no_session`, `no_membership`, `tenant_found`,
`error` — definindo, para cada um, significado de produto, o que o operador deve
entender, cópia (principal/secundária), ações disponíveis/bloqueadas, como
tenant/membership aparecem (ou não), como manter estado vazio honesto, como evitar dado
inventado, como evitar que o cockpit vire console técnico e quais **dados reais**
seriam necessários no futuro para renderizar o estado. Inclui o design do **placeholder
da base agentic** (nomear sem instanciar).

---

## 2. Princípios de Design Transversais (valem para todos os estados)

1. **Projeção, nunca fonte da verdade** — o cockpit projeta o estado operacional real
   derivado da sessão e da leitura RLS read-only; não cria nem persiste estado (PRD §8,
   patch de clareza).
2. **Estado vazio honesto** — quando não há dado, a tela **diz que não há** e **explica
   o porquê**; não preenche com exemplo, mock ou placeholder que pareça real.
3. **Zero dado inventado** — nenhum nome de tenant, papel, métrica, agente, contagem ou
   histórico fabricado. Só se renderiza o que vem de fonte real (sessão / RLS).
4. **Cockpit ≠ console técnico** — nada de expor `agents`/`tools`/`state`/IDs internos/
   tabelas como UI. A tela fala em **operação e vínculo**, não em arquitetura.
5. **Liderar pelo outcome operado** — cada estado orienta o **próximo passo
   compreensível** do operador, não o diagrama de camadas.
6. **Sem vazamento de segredo** — nenhuma tela/erro imprime token, cookie, OAuth
   `code`, service role ou URL de callback completa.
7. **Linguagem institucional honesta** — PT-BR, direta, sem promessa do que ainda não
   existe; a "base agentic" é **nomeada como futura**, nunca como ativa.

---

## 3. Design dos Estados Operacionais

> Para cada estado: **significado de produto**, **o que o operador entende**, **mensagem
> principal** e **secundária** (cópia de design, refinável na implementação), **ações
> disponíveis** e **bloqueadas**, **tenant/membership**, **estado vazio honesto**,
> **anti-dado-inventado**, **anti-console** e **dados reais necessários no futuro**.
> As mensagens abaixo são **design**, não strings finais de código.

### 3.1 Estado `no_session`
- **Significado de produto:** o visitante **não está autenticado**; não há operador
  reconhecido, logo não há cockpit.
- **O que o operador entende:** "preciso entrar para acessar a operação".
- **Mensagem principal:** "Entre para acessar sua operação."
- **Mensagem secundária:** "O cockpit do YZI OS exige uma sessão autenticada. Faça login
  para continuar."
- **Ações disponíveis:** iniciar login (Google OAuth, já existente da Lane 4).
- **Ações bloqueadas:** qualquer rota/superfície do cockpit; ver tenant/membership;
  ver base agentic.
- **Tenant/membership:** **não aparecem** — sem sessão não há vínculo a exibir.
- **Estado vazio honesto:** não há "vazio" a mostrar; a tela é uma porta de entrada,
  não uma operação vazia.
- **Anti-dado-inventado:** não pré-exibir nome/conta/"último tenant"; nada antes do
  login real.
- **Anti-console:** sem detalhes técnicos de auth/sessão; apenas o convite a entrar.
- **Dados reais necessários no futuro:** apenas o **fato de ausência de sessão** (já
  disponível na Lane 4 via proxy/sessão). Nenhum dado novo.

### 3.2 Estado `no_membership`
- **Significado de produto:** operador **autenticado**, porém **sem vínculo
  (membership)** a nenhum tenant. É o caminho real exercitado nesta lane (banco limpo).
- **O que o operador entende:** "estou dentro, mas ainda não pertenço a nenhum tenant;
  por isso ainda não há operação para eu supervisionar".
- **Mensagem principal:** "Você ainda não pertence a um tenant."
- **Mensagem secundária:** "Esta conta autenticada não está associada a nenhum tenant.
  Nenhum dado foi inventado para preencher esta tela. Quando você tiver um vínculo
  (membership) a um tenant, sua operação aparecerá aqui." *(refina a cópia já validada
  na Lane 4 — closure gate §1.)*
- **Ações disponíveis:** sair/encerrar sessão; entender o conceito de tenant/membership
  (texto explicativo honesto).
- **Ações bloqueadas:** criar tenant; criar membership; "entrar" em um tenant; configurar
  agentes; qualquer ação de operação — **tudo diferido a lanes futuras com gate**.
- **Tenant/membership:** o **conceito** aparece explicado (o que é tenant, o que é
  membership, o que o vínculo determina); **nenhum tenant concreto** é listado porque
  não há vínculo real.
- **Estado vazio honesto:** a tela declara explicitamente a ausência de vínculo e a
  razão; **a base agentic é nomeada como indisponível até haver vínculo** (ver §4).
- **Anti-dado-inventado:** zero tenants fictícios, zero "tenant de exemplo", zero
  contagem/atividade simulada; nenhum CTA que crie dado.
- **Anti-console:** não mostrar IDs de usuário, claims, linhas de tabela ou políticas;
  falar em "vínculo" e "operação", não em `tenant_memberships`.
- **Dados reais necessários no futuro:** identidade da sessão (já disponível) + leitura
  RLS read-only confirmando **0 memberships** para o usuário (já existente via
  `getTenantContext`). Nenhum dado novo; nada de escrita.

### 3.3 Estado `tenant_found`
- **Significado de produto:** operador autenticado **com membership** a um tenant — vê o
  tenant ao qual pertence e a **base** (vazia) onde sua operação agentic viria a existir.
- **O que o operador entende:** "pertenço a este tenant; aqui é onde minha operação
  acontece; ainda não há operação agentic configurada".
- **Mensagem principal (template):** "Operação de **{nome do tenant — campo real}**." 
  *(o nome vem do membership real; jamais um valor fabricado.)*
- **Mensagem secundária:** "Você está vinculado a este tenant. A base de operação
  agentic ainda não tem nada configurado — nenhum agente foi criado. Nada aqui é
  simulado."
- **Ações disponíveis:** ver o vínculo (qual tenant, o que o membership permite ver/
  aprovar/operar — em termos de produto); sair.
- **Ações bloqueadas:** criar/instanciar agente; configurar agente; executar operação;
  criar membership/seed; qualquer escrita — **todas diferidas a lanes futuras com gate**.
- **Tenant/membership:** **aparecem a partir de dado real** do membership (nome/
  identificador do tenant e a semântica do vínculo); nunca renderizado com dado de
  exemplo.
- **Estado vazio honesto:** mesmo com tenant real, a **base agentic permanece vazia e
  honesta** ("nenhum agente configurado"); não se inventa operação para parecer cheia.
- **Anti-dado-inventado:** **este estado NÃO é exercitado em runtime nesta lane** (banco
  limpo, 0 tenants) — é **design**; ao implementar, só renderiza com tenant real sob
  gate humano futuro. Proibido seed/tenant fabricado para "ver a tela".
- **Anti-console:** não expor schema do tenant, policies, agents/tools/state; mostrar a
  **operação nomeada e vazia**, não o motor.
- **Dados reais necessários no futuro:** um **membership real** (usuário↔tenant) legível
  via RLS read-only e o **nome/identificador do tenant**; tudo sob gate humano de lane
  futura (criação de tenant/membership real **não** ocorre na Lane 5).

### 3.4 Estado `error`
- **Significado de produto:** falha ao **derivar a sessão ou ler o contexto**
  (tenant/membership) — o cockpit não consegue projetar estado confiável.
- **O que o operador entende:** "algo falhou ao carregar minha operação; não é que eu
  não tenha acesso — é que não deu para confirmar agora".
- **Mensagem principal:** "Não foi possível carregar sua operação."
- **Mensagem secundária:** "Ocorreu uma falha ao confirmar sua sessão ou seu vínculo.
  Tente novamente. Nenhum dado foi exibido para não inventar um estado."
- **Ações disponíveis:** tentar novamente; sair/entrar de novo.
- **Ações bloqueadas:** qualquer operação que dependa de estado confiável; **não**
  "assumir" `no_membership` nem `tenant_found` para preencher a tela.
- **Tenant/membership:** **não aparecem** — em erro não se afirma vínculo nem ausência
  de vínculo (seria adivinhar).
- **Estado vazio honesto:** distingue **erro** de **vazio**: erro = "não sei agora";
  vazio (`no_membership`) = "sei que você não pertence". Nunca colapsar um no outro.
- **Anti-dado-inventado:** nenhum fallback que mostre tenant/agente/contagem; nenhuma
  mensagem que sugira estado não confirmado.
- **Anti-console:** **nunca** imprimir stack trace, query, política, token, cookie ou
  `code`; mensagem humana, detalhe técnico só em log servidor (sem segredo).
- **Dados reais necessários no futuro:** apenas o **sinal de falha** da leitura de
  sessão/contexto (já modelado em `getTenantContext` estado `error`). Nenhum dado novo.

---

## 4. Design do Placeholder da Base Agentic (nomear sem instanciar)

- **Onde aparece:** dentro de `no_membership` (como "indisponível até haver vínculo") e
  de `tenant_found` (como "vazia, nenhum agente configurado").
- **O que diz:** nomeia a operação institucional futura — o lugar onde, em lanes
  futuras, agentes serão **configurados, supervisionados e operados com governança**.
- **Como permanece honesto:** estado vazio explícito ("ainda não há operação agentic
  configurada"); **sem** lista de agentes, **sem** botão que instancie, **sem** métrica,
  **sem** dado fabricado.
- **O que NÃO faz (programa §3 / Batch 5.1 §4):** não instancia agente, não cria
  subagent/runner/MCP, não expõe agents/tools/state como console, não cria tenant/
  membership/seed, não cria policy de escrita.
- **Frase-guia:** a base agentic é **promessa de superfície** — nomeia e prepara, não
  executa nem fabrica.

---

## 5. Matriz-Resumo dos Estados

| Estado | Tenant/membership | Base agentic | Ação principal | Exercitado nesta lane? |
|---|---|---|---|---|
| `no_session` | não aparece | não aparece | entrar (login) | sim (porta de entrada) |
| `no_membership` | conceito explicado; nenhum tenant concreto | nomeada como indisponível | entender vínculo / sair | **sim** (caminho real, banco limpo) |
| `tenant_found` | tenant real do membership | nomeada e **vazia** | ver vínculo / sair | **não** (só com tenant real sob gate futuro) |
| `error` | não aparece | não aparece | tentar novamente | sob falha real |

---

## 6. Parecer do UX/Cockpit Reviewer (sobre este design)

- **Estado vazio honesto:** garantido em `no_membership` e `tenant_found` (vazio
  declarado e explicado). ✅
- **Sem dado inventado:** nenhum estado renderiza tenant/agente/contagem fabricados;
  `tenant_found` depende de dado real e não é exercitado nesta lane. ✅
- **Sem crash/loop/overlay:** `error` separado de `no_membership`, evitando colapso de
  estados que gera loop/tela enganosa. ✅
- **Cockpit ≠ console:** nenhum estado expõe agents/tools/state/schema/IDs internos. ✅
- **Sem vazamento de segredo:** `error` proíbe stack/token/`code` na tela. ✅
- **Parecer:** **aprovado como design** (read-only). Bloqueio de UX **não** se aplica —
  nada foi implementado; a validação runtime ocorrerá no batch de implementação real.

---

## 7. Handoff → Batch 5.3 (sem abrir)

Com os estados desenhados, o próximo batch candidato é o **Batch 5.3 — Minimal UI
implementation plan**, que receberá deste artefato a semântica e a cópia de design por
estado, mais a matriz-resumo (§5) e o placeholder da base agentic (§4).

> O Batch 5.3 **não é aberto aqui** e **não é planejado aqui**. Quando aberto, é
> **plano** de UI; a **implementação real** em `platform/` exige a frase de gate do
> Implementer (G4) com lista exata de arquivos, **fora desta task**. Este batch
> **não** planeja implementação, **não** desenha código e **não** lista arquivos de
> `platform/`.

---

## 8. Escopo deste Batch

### Autorizado (Batch 5.2)
- Ler o Execution Program da Lane 5 e o pack do Batch 5.1;
- Definir o design dos quatro estados (§3) e do placeholder da base agentic (§4);
- Registrar parecer de UX sobre o design (§6);
- Preparar o handoff para o Batch 5.3 (§7), sem abri-lo.

### Proibido (Batch 5.2)
- Escrita em `platform/` ou em código; SQL; MCP; service role; build; instalação;
- Criar tenant/membership/seed; criar policy de escrita;
- Criar evidence (evidence só ao fim de batch real);
- Abrir o Batch 5.3; **planejar implementação**; listar/descrever arquivos de código;
- Atualizar o mapa operacional; fechar a Lane 5;
- Renderizar/instanciar a base agentic; nomear agentes reais.

---

## 9. Validação deste Batch

- Os quatro estados obrigatórios (`no_session`, `no_membership`, `tenant_found`,
  `error`) cobertos com **todos** os onze pontos exigidos por estado. ✅
- Cada definição rastreável a PRD §8/§18 + patch, ao programa §2/§3 e ao Batch 5.1 §3/§4
  — **sem doutrina nova**. ✅
- `tenant_found` marcado como **design não exercitado** nesta lane (banco limpo). ✅
- Nenhuma implementação, plano de implementação, arquivo de código, SQL, MCP ou evidence
  produzido. ✅

## 10. Stop Conditions

- Necessidade de tocar `platform/`/SQL/MCP/seed para concluir → **parar**: fora do
  escopo; exige gate próprio.
- Pressão para "ver" `tenant_found` com dado real → recusar criar tenant/seed; é design.
- Pressão para planejar/implementar UI ou abrir o Batch 5.3 → recusar; não autorizado.
- Ambiguidade entre "nomear base agentic" e "instanciar agente" → `SCOPE_AMBIGUITY`,
  decisão humana.

---

## Confirmação de Não-Execução (nenhuma implementação foi feita)

Este artefato é **design de estados operacionais** em texto de spec. **Não** alterou
`platform/`, **não** alterou código, **não** criou SQL, **não** usou MCP, **não** criou
tenant/membership/seed, **não** criou evidence, **não** abriu o Batch 5.3, **não**
planejou implementação, **não** atualizou o mapa operacional e **não** fechou a Lane 5.
A base agentic foi **nomeada e desenhada como vazia**, nunca instanciada. Qualquer ação
concreta posterior exige a frase de autorização humana do gate correspondente
(programa §7).

---

## Readiness deste Batch

`LANE_5_BATCH_5_2_COCKPIT_OPERATIONAL_STATES_DESIGNED_NOT_IMPLEMENTED`

# Navigation & Sidebar Map v1

> Fonte ativa. Define a arquitetura conceitual da navegação/sidebar do YZI OS antes de qualquer tela ou implementação. Deriva de `decision-ui-composition-foundation-v1.md`, `DESIGN.md`, `screen-composition-rules-v1.md` e `surface-patterns-v1.md`.
> **Não é implementação:** sem código, React, CSS, Tailwind, rotas, banco, Pencil/`.pen`, Motion ou MCP.

## 1. Purpose

Este documento define a navegação/sidebar **conceitual** do YZI OS antes de qualquer tela, layout ou implementação. A sidebar **não é uma lista genérica de módulos SaaS**: ela organiza **capacidades operacionais** — separando operação viva, decisão, ação, autorização, análise, dashboard, histórico e configuração. Núcleo: **decisão + ação contínua**. A YZI trabalha, não conversa, e permanece orquestradora visível.

## 2. Binding Decisions

- NAVIGATION_SIDEBAR_MAP_DEFINED
- SIDEBAR_ORGANIZES_CAPABILITIES_NOT_GENERIC_MODULES
- DASHBOARD_ALLOWED_AS_ANALYSIS_SURFACE
- DASHBOARD_NOT_PRIMARY_PRODUCT_METAPHOR
- OPERATION_BEFORE_ANALYSIS
- DECISION_BEFORE_METRIC
- ACTION_BEFORE_REPORT
- YZI_REMAINS_VISIBLE_AS_ORCHESTRATOR
- UX_UI_DOCUMENTATION_PHASE_HAS_TWO_REMAINING_DOCS_ONLY

## 3. Dashboard Clarification

O YZI OS **pode e deve** ter dashboards analíticos. "Não é dashboard genérico" não significa "não tem dashboard" — significa que o produto **não nasce** como parede de KPIs, gráficos, tabelas e relatórios. A análise existe **depois** da operação, da decisão e da ação.

**Dashboards são permitidos para:** análise de performance · diagnóstico de canais · leitura de resultado · comparação histórica · vazamento de receita · funil analítico · análise financeira · análise de campanhas · qualidade operacional · aprendizagem da YZI.

**Dashboards são proibidos como:** primeira tela genérica · parede de KPIs · clone de SaaS admin · substituto do Command Center · substituto do Radar · substituto da Action Queue · substituto da autorização humana · relatório estático sem decisão · tela métrica-first sem consequência.

## 4. Sidebar Philosophy

- A sidebar reflete **capacidades do sistema**, não módulos técnicos soltos.
- Cada item responde "**que tipo de trabalho eu faço aqui?**".
- Os menus separam **operação viva** de **análise histórica**.
- Os menus **não forçam** o gestor a alimentar o sistema.
- A YZI permanece **acessível como orquestradora** em qualquer item.
- Itens técnicos/configuração ficam **separados** da operação.
- A navegação é **curta, clara e orientada a resultado**.

## 5. Proposed Sidebar Groups

- **5.1 Operação** — superfícies vivas de decisão e ação: Command Center · Radar · Oportunidades · Ações · Autorizações.
- **5.2 Análise** — performance, dashboards e diagnóstico: Dashboards · Performance · Canais · Financeiro / Receita · Campanhas · Outcomes.
- **5.3 Inteligência** — busca, ativos, memória e conhecimento: Busca Semântica · Ativos · Base de Conhecimento · Leituras da YZI.
- **5.4 Operação Histórica** — rastro, auditoria e histórico: Histórico · Auditoria · Decisões · Execuções.
- **5.5 Configuração** — tenant, canais, integrações e permissões: Canais · Integrações · Equipe · Permissões · Tenant Settings.

## 6. Menu Item Definitions

Cada item segue o formato com nove campos: **Group · Purpose · Primary question answered · Primary surface pattern · Main components · What the user does here · What the YZI does here · Dashboard allowed here? · What must not happen** (pareados por linha para concisão).

### Command Center
**Group:** Operação **Dashboard allowed here?:** no **Primary surface pattern:** Executive Overview
**Purpose:** abrir o cockpit com estado vivo e a próxima decisão. **Primary question answered:** "Como o negócio está e o que faço agora?"
**Main components:** Command Center Block · Action Queue · YZI Recommendation Panel. **What the user does here:** lê o estado e abre a prioridade do dia.
**What the YZI does here:** sintetiza o estado e recomenda a próxima ação. **What must not happen:** virar mural de métricas ou KPI wall.

### Radar
**Group:** Operação **Dashboard allowed here?:** no **Primary surface pattern:** Radar Focus
**Purpose:** mostrar onde existe oportunidade e onde agir. **Primary question answered:** "Onde existe oportunidade e onde devo agir?"
**Main components:** Radar Surface · Territory Map · Signal Badge · Opportunity Card. **What the user does here:** explora sinais/território e abre oportunidades.
**What the YZI does here:** interpreta sinais e prioriza oportunidades. **What must not happen:** virar Google Trends, feed ou grid de cards.

### Oportunidades
**Group:** Operação **Dashboard allowed here?:** no **Primary surface pattern:** Opportunity Detail
**Purpose:** explicar uma oportunidade e levar à próxima ação. **Primary question answered:** "Vale agir nisto, e como?"
**Main components:** Opportunity Card · YZI Recommendation Panel · Authorization Panel. **What the user does here:** avalia fit/impacto e executa a ação recomendada.
**What the YZI does here:** recomenda com razão, evidência e próxima ação. **What must not happen:** virar ficha de CRM ou card métrico sem ação.

### Ações
**Group:** Operação **Dashboard allowed here?:** no **Primary surface pattern:** Executive Overview / Authorization Flow
**Purpose:** organizar ações priorizadas com dono, estado, razão e próximo passo. **Primary question answered:** "O que precisa ser feito e em que ordem?"
**Main components:** Action Queue · Status Badge · YZI Recommendation Panel. **What the user does here:** executa, agenda, autoriza ou adia a ação do topo.
**What the YZI does here:** prioriza a fila e justifica a ordem. **What must not happen:** virar task manager genérico ou lista sem razão.

### Autorizações
**Group:** Operação **Dashboard allowed here?:** no **Primary surface pattern:** Authorization Flow
**Purpose:** revisão humana antes da execução de ação sensível. **Primary question answered:** "O que será feito, com que risco, e eu autorizo?"
**Main components:** Authorization Panel · Status Badge · Audit Drawer. **What the user does here:** aprova, edita, recusa ou pausa com consequência clara.
**What the YZI does here:** mostra o que vai fazer antes e registra depois. **What must not happen:** esconder consequência ou aprovar em um clique sem contexto.

### Dashboards
**Group:** Análise **Dashboard allowed here?:** yes **Primary surface pattern:** Outcome Review (analítico)
**Purpose:** leitura analítica de performance, diagnóstico e aprendizado. **Primary question answered:** "O que aconteceu e por quê?"
**Main components:** Financial/Commission Summary · Command Center Block · Status Badge. **What the user does here:** analisa resultado e identifica ajustes.
**What the YZI does here:** lê o histórico e propõe a próxima decisão. **What must not happen:** virar home principal, BI genérico ou parede de gráficos.

### Performance
**Group:** Análise **Dashboard allowed here?:** yes **Primary surface pattern:** Outcome Review
**Purpose:** diagnosticar desempenho operacional e comercial no tempo. **Primary question answered:** "O que performou e o que precisa de ajuste?"
**Main components:** Financial/Commission Summary · Status Badge · YZI Recommendation Panel. **What the user does here:** compara períodos e prioriza correção.
**What the YZI does here:** aponta tendência e recomenda ajuste. **What must not happen:** virar relatório bonito sem decisão associada.

### Canais
**Group:** Análise (conexão em Configuração) **Dashboard allowed here?:** yes **Primary surface pattern:** Outcome Review
**Purpose:** diagnosticar performance por canal de entrada. **Primary question answered:** "Qual canal performou e onde houve vazamento?"
**Main components:** Financial/Commission Summary · Status Badge · Opportunity Card. **What the user does here:** lê resultado por canal e decide investimento.
**What the YZI does here:** identifica vazamento e recomenda realocação. **What must not happen:** misturar conexão técnica do canal com a análise sem hierarquia.

### Financeiro / Receita
**Group:** Análise **Dashboard allowed here?:** yes **Primary surface pattern:** Outcome Review
**Purpose:** ler saúde financeira e receita ligadas à ação. **Primary question answered:** "Onde há risco, folga ou vazamento de receita?"
**Main components:** Financial/Commission Summary · Status Badge · YZI Recommendation Panel. **What the user does here:** prioriza cobrança e decide esforço comercial.
**What the YZI does here:** conecta finanças à próxima ação comercial. **What must not happen:** virar ERP contábil, planilha ou número sem decisão.

### Campanhas
**Group:** Análise **Dashboard allowed here?:** yes **Primary surface pattern:** Outcome Review / Radar Focus
**Purpose:** analisar campanhas e o que gerou resultado. **Primary question answered:** "Qual campanha gerou resultado e o que escalar/pausar?"
**Main components:** Financial/Commission Summary · Opportunity Card · Status Badge. **What the user does here:** lê desempenho como decisão (escalar/pausar/ajustar).
**What the YZI does here:** recomenda ajuste e próxima campanha. **What must not happen:** virar gerenciador de anúncios com números crus.

### Outcomes
**Group:** Análise **Dashboard allowed here?:** yes **Primary surface pattern:** Outcome Review
**Purpose:** mostrar resultado de ações tomadas e a próxima decisão. **Primary question answered:** "O que funcionou e o que faço a seguir?"
**Main components:** Financial/Commission Summary · Command Center Block · YZI Recommendation Panel. **What the user does here:** confirma impacto vs. expectativa e aciona o próximo passo.
**What the YZI does here:** lê o resultado e propõe a próxima ação. **What must not happen:** virar relatório morto ou comemoração visual sem decisão.

### Busca Semântica
**Group:** Inteligência **Dashboard allowed here?:** no **Primary surface pattern:** Semantic Search & Discovery
**Purpose:** busca por intenção sobre ativos e oportunidades indexados. **Primary question answered:** "O que tenho que responde a esta intenção?"
**Main components:** Semantic Search Box · Opportunity Card · Asset Intake Card. **What the user does here:** pergunta estrategicamente e abre resultados acionáveis.
**What the YZI does here:** organiza resultados como raciocínio, não lista de arquivos. **What must not happen:** virar busca genérica de arquivo ou lista de links.

### Ativos
**Group:** Inteligência **Dashboard allowed here?:** conditional **Primary surface pattern:** Asset Intelligence Flow
**Purpose:** mostrar material recebido, entendido e conectado a oportunidades. **Primary question answered:** "O que o sistema entendeu dos meus ativos e para quê?"
**Main components:** Asset Intake Card · Status Badge · YZI Recommendation Panel. **What the user does here:** liga um ativo entendido a uma oportunidade.
**What the YZI does here:** explica o que entendeu e os próximos usos. **What must not happen:** virar upload genérico, pasta/arquivo bruto ou loader eterno.

### Base de Conhecimento
**Group:** Inteligência **Dashboard allowed here?:** no **Primary surface pattern:** Asset Intelligence Flow / Semantic Search & Discovery
**Purpose:** memória operacional consultável da operação e do produto. **Primary question answered:** "O que já sabemos sobre isto?"
**Main components:** Asset Intake Card · Semantic Search Box · Status Badge. **What the user does here:** consulta conhecimento entendido e o liga à ação.
**What the YZI does here:** recupera contexto relevante e o conecta à decisão. **What must not happen:** virar repositório morto de documentos sem consequência.

### Leituras da YZI
**Group:** Inteligência **Dashboard allowed here?:** conditional **Primary surface pattern:** Executive Overview
**Purpose:** reunir as leituras e recomendações contínuas da YZI. **Primary question answered:** "O que a YZI está vendo e recomendando?"
**Main components:** YZI Recommendation Panel · Command Center Block · Status Badge. **What the user does here:** revisa a leitura da YZI e aciona a recomendação.
**What the YZI does here:** explica o que recomenda, por quê e o que pede autorização. **What must not happen:** virar chat lateral genérico ou resposta de LLM sem ação.

### Histórico
**Group:** Operação Histórica **Dashboard allowed here?:** conditional **Primary surface pattern:** Outcome Review / Audit Drawer
**Purpose:** percorrer o que aconteceu na operação ao longo do tempo. **Primary question answered:** "O que aconteceu e quando?"
**Main components:** Audit Drawer · Status Badge · Command Center Block. **What the user does here:** revisita eventos passados sob demanda.
**What the YZI does here:** contextualiza o histórico e liga ao presente. **What must not happen:** virar feed cru de eventos sem leitura nem consequência.

### Auditoria
**Group:** Operação Histórica **Dashboard allowed here?:** no **Primary surface pattern:** Authorization Flow / Audit Drawer
**Purpose:** rastro técnico, fonte e governança sob demanda. **Primary question answered:** "O que foi feito, por quem e com qual autorização?"
**Main components:** Audit Drawer · Status Badge · Links (rastro). **What the user does here:** inspeciona o rastro de uma decisão/execução.
**What the YZI does here:** registra fonte, decisão, execução e autorização. **What must not happen:** virar logs na face da tela ou run records como produto.

### Decisões
**Group:** Operação Histórica **Dashboard allowed here?:** no **Primary surface pattern:** Audit Drawer
**Purpose:** registrar decisões tomadas e seus motivos. **Primary question answered:** "O que decidimos e por quê?"
**Main components:** Audit Drawer · Status Badge · YZI Recommendation Panel. **What the user does here:** revisa decisões passadas e seu contexto.
**What the YZI does here:** preserva o porquê e a evidência da decisão. **What must not happen:** virar lista burocrática sem razão nem consequência.

### Execuções
**Group:** Operação Histórica **Dashboard allowed here?:** conditional **Primary surface pattern:** Outcome Review / Audit Drawer
**Purpose:** acompanhar o que foi executado e seu estado. **Primary question answered:** "O que foi executado e com que resultado?"
**Main components:** Audit Drawer · Status Badge · Financial/Commission Summary. **What the user does here:** confere execuções e seus resultados.
**What the YZI does here:** vincula execução a resultado e próxima decisão. **What must not happen:** virar painel de logs técnicos como protagonista.

### Integrações
**Group:** Configuração **Dashboard allowed here?:** no **Primary surface pattern:** Configuração (fora da operação viva)
**Purpose:** conectar e gerir integrações autorizadas do tenant. **Primary question answered:** "O que está conectado e autorizado?"
**Main components:** App Shell · Status Badge · Authorization Panel. **What the user does here:** conecta, revoga e revisa integrações.
**What the YZI does here:** sinaliza pendências e dependências de conexão. **What must not happen:** misturar configuração técnica com a superfície operacional.

### Equipe
**Group:** Configuração **Dashboard allowed here?:** no **Primary surface pattern:** Configuração
**Purpose:** gerir membros e responsabilidades do tenant. **Primary question answered:** "Quem participa e com qual papel?"
**Main components:** App Shell · Status Badge · Avatars. **What the user does here:** adiciona/remove membros e define papéis.
**What the YZI does here:** nenhuma ação operacional — apenas contexto de responsabilidade. **What must not happen:** virar área social ou mural de fotos sem função.

### Permissões
**Group:** Configuração **Dashboard allowed here?:** no **Primary surface pattern:** Authorization Flow (configuração)
**Purpose:** definir escopo, limites e governança de execução. **Primary question answered:** "O que cada papel pode autorizar ou executar?"
**Main components:** Authorization Panel · Status Badge · Audit Drawer. **What the user does here:** define limites de autorização e escopo.
**What the YZI does here:** opera sempre dentro das permissões definidas. **What must not happen:** esconder a autorização em submenu obscuro.

### Tenant Settings
**Group:** Configuração **Dashboard allowed here?:** no **Primary surface pattern:** Configuração
**Purpose:** configurar identidade, contexto e parâmetros do tenant. **Primary question answered:** "Como este tenant está configurado?"
**Main components:** App Shell · Status Badge. **What the user does here:** ajusta contexto, créditos e parâmetros do tenant.
**What the YZI does here:** usa o contexto do tenant para operar. **What must not happen:** virar painel técnico na face da operação.

## 7. Dashboard Menu Rules

O menu **Dashboards** pode existir, mas é **analítico e subordinado à operação**. Deve responder: o que aconteceu? · por que aconteceu? · qual canal performou? · onde houve vazamento? · qual ação gerou resultado? · qual oportunidade foi perdida? · o que a YZI aprendeu? · o que devemos ajustar?

Dashboards **não devem**: ser a home principal · ser a primeira experiência do onboarding · ser parede de gráfico · esconder a próxima ação · substituir recomendação da YZI · virar BI genérico · virar relatório bonito sem decisão.

## 8. First Surface Rule

A primeira superfície operacional da YZIHUB deve começar em **Command Center**, com apoio de: Radar · Oportunidades · Ações · Autorizações · YZI Recommendation Panel · Audit Drawer.

**Não deve começar em:** Dashboards · Performance · Financeiro · Relatórios · CRM pipeline · tabela de leads.

## 9. Navigation Anti-Patterns

- sidebar genérica cheia de módulos;
- menu inspirado em TailAdmin;
- "Dashboard" como home obrigatória;
- "CRM" como item principal;
- "Leads" como planilha manual;
- "Relatórios" como centro do produto;
- muitos menus técnicos na operação;
- esconder autorização em submenu;
- misturar análise com ação sem hierarquia;
- navegação que transforma a YZI em chatbot;
- menu que incentiva cadastro manual como rotina.

## 10. UX/UI Documentation Closure Checklist

**Concluído:** `DESIGN.md` · `ui-elements-v1.md` · `component-anatomy-v1.md` · `screen-composition-rules-v1.md` · `decision-ui-composition-foundation-v1.md` · `navigation-sidebar-map-v1.md`.

**Restante permitido após este arquivo (apenas dois):**

1. `docs/yzi-os-active/04-implementation/yzihub-first-operating-surface-blueprint-v1.md`
2. `docs/yzi-os-active/05-decisions/decision-yzihub-operating-surface-ready-for-prototype-v1.md`

**Regra:** depois desses dois documentos, a fase documental UX/UI deve ser **encerrada**. Não propor novos documentos conceituais UX/UI sem autorização humana explícita.

## 11. Future Use

Este documento será usado depois para: orientar **App Shell** · orientar **sidebar** · orientar o **primeiro blueprint operacional da YZIHUB** · orientar **futuras telas de dashboard analítico** · impedir **dashboard genérico** · impedir **CRM clone** · separar **operação de análise** · ajudar Claude/Codex a **não inventar menus**.

## 12. Limits

Este documento: não implementa sidebar · não cria layout · não cria UI · não cria CSS · não cria React · não cria rotas · não cria banco · não cria permissões reais · não cria dashboard visual · não autoriza execução técnica.

Limites do documento: máximo 240 linhas · Markdown puro · sem YAML · sem JSON · sem tabelas grandes · sem código · sem implementação · sem screenshots · sem imagens · sem arquivos adicionais.

# Screen Composition Rules v1

> **Deriva de [`DESIGN.md`](./DESIGN.md), [`ui-elements-v1.md`](./ui-elements-v1.md), [`component-anatomy-v1.md`](./component-anatomy-v1.md), [`component-language-v1.md`](./component-language-v1.md), [`surface-patterns-v1.md`](./surface-patterns-v1.md), [`design-system-principles.md`](./design-system-principles.md), [`visual-direction.md`](./visual-direction.md) e [`brand-dna.md`](./brand-dna.md).** Fonte ativa.
> **Não é implementação:** sem código, React, CSS, Tailwind, tokens, Pencil/`.pen`, Motion, MCP, imagem, screenshot ou wireframe.

## 1. Purpose

Define **como telas e superfícies do YZI OS devem ser compostas** usando apenas elementos e componentes já definidos. **Não cria telas finais, não cria wireframes e não implementa UI** — define **regras de composição**. Ordem de design: UI Elements → Component Anatomy → **Screen/Surface Composition** → implementação futura. Núcleo: **decisão + ação contínua**; a YZI trabalha, não conversa, e permanece **orquestradora visível**.

## 2. Binding Decisions

- **SCREEN_COMPOSITION_REQUIRES_UI_ELEMENTS_AND_COMPONENT_ANATOMY**
- **NO_SCREEN_WITHOUT_OPERATIONAL_NARRATIVE**
- **NO_DASHBOARD_FIRST_LAYOUT**
- **NO_CARD_WALL_SCREEN**
- **NO_METRIC_FIRST_SCREEN**
- **EVERY_SCREEN_MUST_LEAD_TO_DECISION_ACTION_AUTHORIZATION_OR_TRUST**
- **YZI_MUST_REMAIN_VISIBLE_AS_ORCHESTRATOR**

## 3. Screen Evaluation Questions

Toda tela futura precisa responder em segundos: Qual situação operacional ela representa? · Qual decisão ajuda a tomar? · Qual ação torna possível? · O que precisa de autorização? · O que a YZI recomenda/organiza? · Qual o estado atual? · O que mudou desde a última leitura? · O que **não** deve ocupar a superfície principal? Se não responder rápido, a composição está errada.

## 4. Composition Principles

Narrativa operacional antes de layout · decisão antes de métrica · oportunidade antes de relatório · ação antes de gráfico · estado antes de detalhe · síntese antes de lista · confiança antes de automação · autorização antes de execução · detalhe profundo em drawer/modal/fluxo secundário · Radar como superfície contínua, não grid · YZI como presença discreta e viva, não personagem invasivo · componentes com **pesos diferentes**, não blocos iguais · cada tela com **uma intenção dominante**.

## 5. Approved Composition Inputs

Telas só podem usar entradas já definidas:

- **UI Elements** — referência [`ui-elements-v1.md`](./ui-elements-v1.md). Nenhum elemento fora dessa lista.
- **Components** — referência [`component-anatomy-v1.md`](./component-anatomy-v1.md). Aprovados: App Shell · Command Center Block · Radar Surface · Opportunity Card · Territory Map · Signal Badge · Action Queue · Authorization Panel · YZI Recommendation Panel · Semantic Search Box · Asset Intake Card · Status Badge · Financial/Commission Summary · Audit Drawer.
- **Surface Patterns** — referência [`surface-patterns-v1.md`](./surface-patterns-v1.md). Aprovados: Executive Overview · Radar Focus · Opportunity Detail · Authorization Flow · Asset Intelligence Flow · Outcome Review · Alert & Interruption · Semantic Search & Discovery.

> Nenhuma tela combina nada fora destas três fontes.

## 6. Surface Composition Rules

### Executive Overview
**Operational purpose:** abrir o cockpit com estado executivo e a próxima decisão.
**Primary user question:** "Como o negócio está e o que fazer agora?"
**Required components:** App Shell · Command Center Block · Action Queue · YZI Recommendation Panel.
**Optional components:** Radar Surface · Status Badge · Financial/Commission Summary · Alerts.
**Dominant hierarchy:** estado/decisão no topo; recomendações da YZI e fila de ações em seguida.
**Primary action:** abrir a prioridade do dia.
**Authorization behavior:** ações sensíveis abrem Authorization Flow; nada executa direto.
**YZI presence:** leitura do estado + recomendação principal, discreta no painel/dock.
**What stays out of the main surface:** rastro técnico, históricos longos, detalhe contábil (Audit Drawer/módulo).
**Anti-patterns:** dashboard de métricas · KPI wall · números sem ação.

### Radar Focus
**Operational purpose:** explorar sinais, território e oportunidades para decidir onde agir.
**Primary user question:** "Onde existe oportunidade e onde devo agir?"
**Required components:** Radar Surface · Territory Map · Signal Badge · Opportunity Card.
**Optional components:** Semantic Search Box · Action Queue · YZI Recommendation Panel.
**Dominant hierarchy:** Radar Surface e Territory Map conduzem a leitura; oportunidades priorizadas em seguida.
**Primary action:** abrir/avançar uma oportunidade.
**Authorization behavior:** ação comercial sensível encaminha para Authorization Flow.
**YZI presence:** interpreta sinais e prioriza, sem jogar dado cru.
**What stays out of the main surface:** keywords cruas, gráficos de tendência, evidência detalhada (drawer).
**Anti-patterns:** grid de cards · mapa decorativo · Google Trends · feed de tendências.

### Opportunity Detail
**Operational purpose:** explicar uma oportunidade e levar à próxima ação.
**Primary user question:** "Vale agir nisto, e como?"
**Required components:** Opportunity Card · YZI Recommendation Panel · Authorization Panel.
**Optional components:** Financial/Commission Summary · Audit Drawer · Signal Badge.
**Dominant hierarchy:** por que importa → confiança/impacto → ação recomendada → autorização.
**Primary action:** executar a ação recomendada.
**Authorization behavior:** explícita quando há impacto; risco e consequência visíveis.
**YZI presence:** recomendação com razão e evidência resumida.
**What stays out of the main surface:** trace técnico e fontes detalhadas (Audit Drawer).
**Anti-patterns:** ficha de CRM · card métrico solto · detalhe sem ação.

### Authorization Flow
**Operational purpose:** aprovar, editar, recusar ou pausar uma ação com consequência clara.
**Primary user question:** "O que será feito, com que risco, e eu autorizo?"
**Required components:** Authorization Panel · Status Badge · YZI Recommendation Panel.
**Optional components:** Audit Drawer · Alerts · Financial/Commission Summary.
**Dominant hierarchy:** o que será feito → para quem → risco → impacto → decisão.
**Primary action:** autorizar (com editar/recusar/pausar disponíveis).
**Authorization behavior:** é o próprio propósito; nada executa sem autorização explícita.
**YZI presence:** mostra o que vai fazer antes; registra o que fez depois.
**What stays out of the main surface:** detalhe técnico fica no Audit Drawer (acesso claro).
**Anti-patterns:** esconder consequência · induzir clique · aprovação em um clique sem contexto.

### Asset Intelligence Flow
**Operational purpose:** mostrar material recebido, entendido e conectado a oportunidades.
**Primary user question:** "O que o sistema já entendeu dos meus ativos e para que serve?"
**Required components:** Asset Intake Card · Status Badge · YZI Recommendation Panel.
**Optional components:** Semantic Search Box · Audit Drawer · Opportunity Card.
**Dominant hierarchy:** estado de compreensão (`indexando → entendido → ligado`) → ligação com ação/oportunidade.
**Primary action:** usar o ativo / ligar a uma oportunidade.
**Authorization behavior:** ações derivadas sensíveis passam por Authorization Flow.
**YZI presence:** explica o que entendeu e os próximos usos.
**What stays out of the main surface:** arquivo/pasta bruto e logs de ingestão (drawer).
**Anti-patterns:** upload genérico · lista de arquivos · loader eterno.

### Outcome Review
**Operational purpose:** mostrar resultado de ações já tomadas e a próxima decisão.
**Primary user question:** "O que funcionou e o que faço a seguir?"
**Required components:** Financial/Commission Summary · Status Badge · Command Center Block.
**Optional components:** Audit Drawer · Opportunity Card · Action Queue · YZI Recommendation Panel.
**Dominant hierarchy:** resultado → impacto vs. expectativa → próxima ação.
**Primary action:** acionar a próxima decisão recomendada.
**Authorization behavior:** nova ação sensível encaminha para Authorization Flow.
**YZI presence:** lê o resultado e propõe o próximo passo.
**What stays out of the main surface:** relatório longo e detalhe histórico (drawer/módulo).
**Anti-patterns:** relatório morto · gráfico sem decisão · comemoração visual exagerada.

### Alert & Interruption
**Operational purpose:** interromper só quando há risco, urgência ou mudança operacional relevante.
**Primary user question:** "O que mudou e exige decisão agora?"
**Required components:** Alerts · YZI Recommendation Panel · Action Queue.
**Optional components:** Authorization Panel · Status Badge · Audit Drawer.
**Dominant hierarchy:** tipo/urgência → causa → consequência → ação.
**Primary action:** tratar o risco / abrir a ação relacionada.
**Authorization behavior:** o que estiver pendente e sensível entra no fluxo de aprovação.
**YZI presence:** detecta e explica o alerta; recomenda a resposta.
**What stays out of the main surface:** ruído não urgente e histórico de alertas (drawer).
**Anti-patterns:** centro de notificações · modal agressivo · alerta sem ação ou que parece bug.

### Semantic Search & Discovery
**Operational purpose:** busca estratégica por intenção/contexto sobre ativos e oportunidades.
**Primary user question:** "O que tenho que responde a esta intenção?"
**Required components:** Semantic Search Box · Opportunity Card · Radar Surface.
**Optional components:** Asset Intake Card · Audit Drawer · Status Badge.
**Dominant hierarchy:** intenção → resultados entendidos → próxima ação.
**Primary action:** abrir o resultado/oportunidade e agir.
**Authorization behavior:** ação derivada sensível passa por Authorization Flow.
**YZI presence:** organiza resultados como raciocínio, não como lista de arquivos.
**What stays out of the main surface:** rastro de busca e fontes (Audit Drawer).
**Anti-patterns:** busca genérica de arquivo · lista de links · resultado sem contexto nem ação.

## 7. Layout Guardrails

Sem CSS: uma tela **não começa** por métricas, tabela ou gráfico · nenhuma tela tem todos os blocos com o mesmo peso · a ação principal fica **próxima da razão** que a justifica · autorização aparece **antes** da execução · recomendação da YZI não vira texto longo · listas são **priorizadas** · cards são **poucos e hierárquicos** · detalhes vão para Audit Drawer, modal crítico ou popover controlado · filtros e dropdowns não escondem a decisão · telas **respiram**, não competem por atenção.

## 8. Forbidden Screen Patterns

SaaS dashboard clone · CRM pipeline clone · página TailAdmin-like · card wall · KPI wall · chart wall · table-first screen · report-first screen · chat-first cockpit · modal-driven workflow · centro de notificações disfarçado de cockpit · sidebar genérica cheia de módulos · tela com muitos CTAs equivalentes · tela que obriga o gestor a alimentar o sistema manualmente · tela que mostra dado sem consequência · tela que esconde autorização · tela que transforma a YZI em chatbot.

## 9. Onboarding Composition Rule

A transição decidida (`yzi-onboarding-transition-pattern-v1.md`, `client-onboarding-orchestration-v1.md`):

```
Minimal YZI Chat → diagnóstico conduzido pela YZI → análise
→ chat recolhe para lateral/dock → Command Center emerge progressivamente
→ YZI permanece como orquestradora discreta
```

A tela de onboarding **não nasce como dashboard completo**. A superfície **emerge** conforme surgem contexto, sinais, ativos, oportunidades e ações — nenhum bloco vazio sem leitura.

## 10. YZIHUB First Tenant Composition Rule

A YZIHUB é o **primeiro tenant operacional real** (`decision-yzihub-first-operating-tenant-v1.md`, `yzihub-self-selling-operating-loop-v1.md`). A composição inicial deve **favorecer**: sinais reais de canais · oportunidades comerciais · ações sugeridas · autorização do gestor · ativos e materiais conectados · resultado de ações · rastro e confiança.

**Não deve favorecer:** cadastro manual de lead · pipeline manual · planilha interna · relatório estático · dashboard genérico · CRM visual.

## 11. Future Use

Este documento será usado depois para: orientar **wireframes** · orientar **prototipagem visual futura** · orientar **prompts de implementação** · evitar **UI genérica** · impedir que Claude/Codex **monte telas arbitrárias** · garantir **reutilização de componentes já definidos** · proteger a **identidade visual e operacional** do YZI OS.

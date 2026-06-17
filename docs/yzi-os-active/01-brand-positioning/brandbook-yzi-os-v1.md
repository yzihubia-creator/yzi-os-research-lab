# Brandbook YZI OS v1

> Fonte ativa. Consolida visualmente a fundação já fechada em `DESIGN.md`, `visual-direction.md`, `design-system-principles.md`, `ui-elements-v1.md`, `component-anatomy-v1.md`, `screen-composition-rules-v1.md`, `surface-patterns-v1.md`, `navigation-sidebar-map-v1.md`, `../04-implementation/yzihub-first-operating-surface-blueprint-v1.md`, `../05-decisions/decision-ui-composition-foundation-v1.md` e `../05-decisions/decision-yzihub-operating-surface-ready-for-prototype-v1.md`.
> **Não é implementação:** sem código, CSS, Tailwind, React, tokens finais, logo final, imagem, screenshot, `.pen`, Motion ou MCP.

## 1. Purpose

Este documento define a **direção visual e sensorial do YZI OS antes de qualquer protótipo, wireframe ou implementação**. Serve para permitir **avaliar a cara do YZI OS antes de codar** — revisar botões, badges, estados, cards e painéis como direção, não como código. É um **artefato de revisão visual pré-código**, autorizado explicitamente pelo humano. **Não reabre** a fase documental UX/UI operacional, encerrada em `../05-decisions/decision-yzihub-operating-surface-ready-for-prototype-v1.md`; apenas consolida visualmente o que já está fechado.

## 2. Binding Decisions

- BRANDBOOK_YZI_OS_DEFINED
- VISUAL_REVIEW_REQUIRED_BEFORE_CODE
- NO_IMPLEMENTATION_BEFORE_VISUAL_ELEMENT_REVIEW
- YZI_OS_MUST_LOOK_LIKE_OPERATIONAL_DECISION_SYSTEM
- NO_ADMIN_TEMPLATE_LOOK
- NO_CRM_LOOK
- NO_GENERIC_BI_LOOK
- NO_CHATBOT_LOOK
- YZI_MUST_BE_VISIBLE_BUT_DISCREET
- BRANDBOOK_DOES_NOT_REOPEN_UX_UI_DOCUMENTATION_PHASE

## 3. Brand Essence

- Inteligência operacional: a tela pensa junto, não só exibe.
- Clareza executiva: o gestor entende o estado e o próximo passo em segundos.
- Ação contínua: decisão e ação no mesmo lugar, sem ruptura.
- Confiança: estado honesto, rastro disponível, nada escondido.
- Precisão: cada elemento existe por uma razão operacional.
- Presença discreta da YZI: viva, ao lado, nunca protagonista.
- Energia estratégica: foco e direção, não agitação.
- Tecnologia calma: inteligência pela serenidade, não pelo espetáculo.

## 4. Visual Personality

- Vivo, mas não barulhento.
- Estratégico, mas não frio.
- Tecnológico, mas não sci-fi genérico.
- Executivo, mas não corporativo antigo.
- Analítico, mas não BI.
- Operacional, mas não CRM.
- Humano, mas não chatbot.

Sensação-âncora: **cabine de comando que pensa junto**, sob controle e em movimento.

## 5. Color Direction

- Base escura ou neutra profunda como ambiente de comando.
- Superfícies discretas em camadas (superfície → card → overlay/drawer).
- Acento para ação: luminoso, parcimonioso, reservado à decisão principal.
- Acento para autorização: distinto, sóbrio, sinaliza consequência.
- Acento para risco: atenção por nível, nunca "parece bug".
- Acento para confiança: tom calmo ligado a rastro e estado honesto.
- Acento para oportunidade: vivo, mas sem euforia.
- Evitar arco-íris SaaS, vermelho/verde genérico sem semântica e paleta infantil.

Cor comunica **significado, não decoração**. Sem valores HEX finais nesta fase.

## 6. Typography Direction

- Leitura rápida acima de personalidade.
- Hierarquia forte: peso visual = importância para a decisão.
- Títulos curtos e firmes.
- Labels funcionais, verbos de decisão e ação.
- Evitar texto longo, tom de relatório e linguagem de chatbot.
- Números com leitura (tendência, alerta, impacto), nunca número solto.

Escala curta: display → título → corpo → meta. Fonte final fica para a implementação.

## 7. Shape and Surface Language

- Superfícies com profundidade discreta indicando hierarquia, não enfeite.
- Cards como unidade de função (decisão/estado/recomendação), não decoração.
- Blocos com hierarquia: nem tudo pesa ao mesmo tempo.
- Bordas e divisões como organização operacional, não moldura estética.
- Evitar caixas iguais empilhadas e card wall.
- Evitar visual TailAdmin e admin SaaS genérico.

## 8. Motion and State Feeling

- Motion só para **estado, prioridade e confiança**.
- Transições calmas e deliberadas.
- Feedback claro de mudança e de conclusão de ação.
- Radar pode ter vida discreta (sinais novos, aquecimento sutil).
- Loading deve **explicar trabalho** (`indexando → entendido → ligado`), não girar à toa.
- Evitar animação decorativa e espetáculo visual.

## 9. YZI Presence

- Presença discreta e persistente (dock/painel/orquestradora).
- Nunca avatar barulhento nem chatbot lateral genérico.
- Recomenda, organiza e **pede autorização** antes de executar.
- Mostra o que vai fazer antes e o que fez depois (rastro).
- Deve parecer **inteligência trabalhando**, não personagem conversando.

## 10. Element Visual Direction

### Feedback and State
Alerts, Notifications, Status Badge, Progress Bars, Spinners, Ribbons.
**Devem parecer:** estado honesto com consequência e próximo passo; atenção por nível; progresso real. **Evitar:** vermelho genérico, feed ruidoso, badge decorativa, loader eterno, "parece bug".

### Identity and Context
Avatars, Badge, Breadcrumb, Images, Videos.
**Devem parecer:** autoria/responsabilidade e contexto real; prova quando agrega entendimento. **Evitar:** mural de fotos, badge pollution, breadcrumb falso, imagem/vídeo de stock decorativo.

### Action and Control
Buttons, Button Groups, Dropdowns, Links, Tabs, Pagination.
**Devem parecer:** intenção clara, ação próxima da razão, primário só para a ação principal. **Evitar:** button overload, dropdown escondendo decisão crítica, prioridade escondida em aba, paginação no cockpit.

### Structure and Disclosure
Cards, Lists, Modals, Popovers, Tooltips, Carousel.
**Devem parecer:** unidades hierárquicas de decisão; detalhe sob demanda. **Evitar:** card wall, lista infinita, modal overload, tooltip dependency, carrossel de métricas.

## 11. Component Visual Direction

- **App Shell** — Should feel like: moldura discreta de cockpit por capacidade com a YZI ao lado. Must not feel like: admin template ou sidebar genérica de SaaS.
- **Command Center Block** — Should feel like: síntese de estado + próxima decisão. Must not feel like: mural de métricas ou número sem leitura.
- **Radar Surface** — Should feel like: superfície viva e contínua de onde agir. Must not feel like: Google Trends, feed ou grid de cards.
- **Opportunity Card** — Should feel like: oportunidade acionável com razão e próxima ação. Must not feel like: ficha de CRM ou card métrico solto.
- **Action Queue** — Should feel like: fila priorizada com dono, estado e razão. Must not feel like: task manager genérico ou lista sem razão.
- **Authorization Panel** — Should feel like: revisão deliberada com risco e impacto visíveis. Must not feel like: aprovação em um clique que esconde consequência.
- **YZI Recommendation Panel** — Should feel like: leitura da YZI com razão e confiança. Must not feel like: chat lateral ou resposta genérica de LLM.
- **Audit Drawer** — Should feel like: rastro sob demanda, secundário. Must not feel like: logs na face da tela ou run records como produto.
- **Semantic Search Box** — Should feel like: pergunta estratégica que devolve raciocínio. Must not feel like: busca genérica de arquivo ou lista de links.
- **Asset Intake Card** — Should feel like: material entendido e conectado. Must not feel like: upload genérico ou pasta/arquivo bruto.
- **Financial/Commission Summary** — Should feel like: saúde/impacto ligado à ação. Must not feel like: planilha, tabela ou dashboard contábil.
- **Territory Map** — Should feel like: leitura de oportunidade por território. Must not feel like: mapa decorativo sem relação com decisão.
- **Signal Badge** — Should feel like: fonte e força do sinal (V1–V4/seed). Must not feel like: badge decorativa sem significado.
- **Status Badge** — Should feel like: estado operacional honesto. Must not feel like: status bonito sem consequência.

## 12. Dashboard Visual Positioning

Dashboard analítico é **permitido**, mas deve parecer **área de análise subordinada à operação**.

Deve parecer: diagnóstico · aprendizagem · leitura de resultado · comparação útil · insumo para a próxima decisão.

Não deve parecer: home principal · BI genérico · parede de KPIs · relatório bonito · clone SaaS · substituto da YZI.

## 13. Do / Don't

Do: mostrar decisão antes de métrica · mostrar ação próxima da razão · mostrar autorização antes da execução · mostrar rastro sob demanda · usar poucos textos · usar hierarquia clara · deixar a YZI presente e discreta.

Don't: card wall · KPI wall · chart wall · CRM pipeline · admin template · chat-first UI · badges decorativas · botões demais · texto longo · dashboard como primeira tela.

## 14. Visual Review Requirement

Antes de qualquer código será necessário criar e revisar visualmente um **board/specimen** (visual/conceitual, não implementação) contendo: botões · badges · status · alerts · opportunity card · command center block · YZI recommendation panel · authorization panel · action queue · audit drawer · radar surface preview · dashboard analytic preview. **Sem essa revisão aprovada, não se autoriza código.**

## 15. Future Use

Este Brandbook será usado para: criar o **Visual Element Board** · orientar protótipo/wireframe · evitar implementação genérica · orientar Claude/Codex · validar se a UI **parece YZI OS antes de codar**. Não propõe novos documentos além do Visual Element Board / protótipo visual já autorizado pela fase de prototype/wireframe.

## 16. Limits

Este documento: não implementa nada · não cria UI · não cria CSS · não cria Tailwind · não cria React · não define tokens finais · não cria logo final · não cria imagens · não cria screenshot · não cria `.pen` · não instala Motion · não autoriza código · não reabre a fase documental UX/UI operacional.

Limite do documento: máximo 180 linhas · Markdown puro · sem YAML · sem JSON · sem tabelas grandes · sem código · sem implementação · sem imagens · sem screenshots · sem arquivos adicionais.

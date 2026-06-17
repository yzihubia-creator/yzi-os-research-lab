# UI Elements v1

> **Deriva de [`DESIGN.md`](./DESIGN.md), [`component-language-v1.md`](./component-language-v1.md), [`surface-patterns-v1.md`](./surface-patterns-v1.md), [`design-system-principles.md`](./design-system-principles.md), [`visual-direction.md`](./visual-direction.md) e [`brand-dna.md`](./brand-dna.md).** Fonte ativa.
> **Não é implementação:** sem código, React, CSS, Tailwind, tokens reais, componente, Pencil/`.pen`, Motion, MCP, imagem ou screenshot.

## 1. Purpose

Define os **elementos/primitivos de UI permitidos** no YZI OS — **antes** da anatomia dos componentes e de qualquer composição de tela. Elementos **não são componentes completos**: são as peças menores usadas **dentro** dos componentes (`component-language-v1.md` §4). Núcleo do produto: **decisão + ação contínua**. A YZI trabalha, não conversa.

## 2. Binding Decisions

- **UI_ELEMENTS_REQUIRED_BEFORE_COMPONENT_ANATOMY** — este vocabulário precede a anatomia dos componentes.
- **NO_GENERIC_UI_PRIMITIVES_WITHOUT_PURPOSE** — nenhum primitivo genérico sem função.
- **NO_DECORATIVE_ELEMENTS_WITHOUT_OPERATIONAL_MEANING** — decoração sem significado operacional é proibida.
- **EVERY_UI_ELEMENT_MUST_SUPPORT_DECISION_ACTION_AUTHORIZATION_STATE_OR_TRUST** — todo elemento serve a um destes cinco.
- **NO_SAAS_DASHBOARD_ELEMENT_DEFAULTS** — nada de defaults de dashboard SaaS / TailAdmin.

## 3. UI Element Evaluation Questions

Todo elemento deve responder: Para que serve? · Ajuda decisão, ação, autorização, estado ou confiança? · Pode ser substituído por hierarquia visual melhor? · Reduz esforço cognitivo ou cria ruído? · Está parecendo dashboard SaaS genérico? **Sem função operacional clara, o elemento não deve ser usado.**

## 4. Element Categories

- **4.1 Feedback and State:** Alerts · Notifications · Status Badge · Progress Bars · Spinners · Ribbons.
- **4.2 Identity and Context:** Avatars · Badge · Breadcrumb · Images · Videos.
- **4.3 Action and Control:** Buttons · Button Groups · Dropdowns · Links · Tabs · Pagination.
- **4.4 Structure and Disclosure:** Cards · Lists · Modals · Popovers · Tooltips · Carousel.

## 5. Element Rules

### Alerts
**Purpose in YZI OS:** comunicar mudança de estado, risco ou interrupção que exige atenção. **Supports:** estado / confiança.
**Allowed use:** alerta crítico, bloqueio, oportunidade com timing curto, autorização sensível pendente. **Avoid when:** informação não urgente.
**Text limit:** tipo + causa + consequência + ação, curto. **Interaction rule:** sempre traz ação ou próximo passo. **Visual rule:** atenção por nível, nunca "parece bug". **Anti-patterns:** vermelho genérico, modal agressivo, alerta sem consequência.

### Avatars
**Purpose in YZI OS:** representar presença, responsabilidade ou autoria (dono da ação, YZI, contato). **Supports:** confiança / estado.
**Allowed use:** dono de ação na fila, autoria de recomendação, presença da YZI. **Avoid when:** enfeite ou preencher espaço.
**Text limit:** iniciais/rótulo curto. **Interaction rule:** identifica quem responde, não navega por si. **Visual rule:** discreto. **Anti-patterns:** avatar decorativo, mural de fotos.

### Badge
**Purpose in YZI OS:** rótulo curto que **explica algo** (categoria, prioridade, plano). **Supports:** estado / decisão.
**Allowed use:** anexado a item para qualificar tipo/importância. **Avoid when:** não acrescenta significado.
**Text limit:** 1–3 palavras. **Interaction rule:** estática, informa. **Visual rule:** peso conforme importância. **Anti-patterns:** badge pollution, badge decorativa, cor sem significado.

### Breadcrumb
**Purpose in YZI OS:** orientar profundidade real de navegação quando há hierarquia. **Supports:** estado.
**Allowed use:** detalhe aninhado (ex.: oportunidade dentro de Radar). **Avoid when:** tela rasa ou cockpit principal.
**Text limit:** rótulos curtos por nível. **Interaction rule:** cada nível é clicável e verdadeiro. **Visual rule:** secundário. **Anti-patterns:** breadcrumb falso, caminho que não orienta.

### Buttons
**Purpose in YZI OS:** disparar uma **ação com intenção clara** (executar, autorizar, abrir, agendar). **Supports:** ação / autorização.
**Allowed use:** ação próxima da informação que a justifica. **Avoid when:** sem intenção clara ou para texto/link.
**Text limit:** verbo + objeto curto. **Interaction rule:** consequência explícita; sensível pede autorização. **Visual rule:** primário só para a ação principal. **Anti-patterns:** button overload, botão chamativo que induz clique.

### Button Groups
**Purpose in YZI OS:** oferecer **escolhas mutuamente comparáveis** de uma mesma decisão. **Supports:** decisão / ação.
**Allowed use:** autorizar/editar/recusar; escalar/pausar/ajustar. **Avoid when:** opções não são do mesmo eixo.
**Text limit:** rótulos paralelos curtos. **Interaction rule:** uma escolha por vez, clara. **Visual rule:** equilíbrio entre opções. **Anti-patterns:** agrupar ações não relacionadas, esconder a opção destrutiva.

### Cards
**Purpose in YZI OS:** unidade de **decisão** (contexto + leitura + próxima ação). **Supports:** decisão / ação.
**Allowed use:** oportunidade, estado, recomendação. **Avoid when:** vira mar de cards iguais.
**Text limit:** o que é + por que importa + o que fazer. **Interaction rule:** ação no próprio card; detalhe no drawer. **Visual rule:** peso conforme importância. **Anti-patterns:** card wall, card métrico solto, card sem próxima ação.

### Carousel
**Purpose in YZI OS:** exploração visual **controlada** de poucos itens equivalentes. **Supports:** confiança.
**Allowed use:** prova visual ou ativos comparáveis, em volume pequeno. **Avoid when:** dado estratégico ou priorização.
**Text limit:** legenda mínima. **Interaction rule:** manual, sem auto-play. **Visual rule:** discreto, sem espetáculo. **Anti-patterns:** carrossel de métricas, auto-rotação, esconder prioridade em slides.

### Dropdowns
**Purpose in YZI OS:** condensar opções **secundárias** sem poluir a tela. **Supports:** ação / estado.
**Allowed use:** filtros, opções menores, seleção compacta. **Avoid when:** a decisão é crítica e precisa estar visível.
**Text limit:** rótulos curtos. **Interaction rule:** abre, escolhe, fecha. **Visual rule:** não esconde o principal. **Anti-patterns:** dropdown escondendo decisão crítica, menu profundo.

### Images
**Purpose in YZI OS:** aumentar **entendimento, prova ou confiança** (ativo, evidência). **Supports:** confiança.
**Allowed use:** ativo ingerido como material entendido, prova operacional. **Avoid when:** decoração ou preencher espaço.
**Text limit:** legenda curta quando necessária. **Interaction rule:** liga a contexto/ação. **Visual rule:** integra ao significado. **Anti-patterns:** imagem de stock, hero decorativo, imagem sem função.

### Links
**Purpose in YZI OS:** navegação ou referência **leve**, secundária à ação. **Supports:** estado / confiança.
**Allowed use:** abrir rastro, fonte, módulo relacionado. **Avoid when:** deveria ser um botão de ação.
**Text limit:** texto descritivo curto. **Interaction rule:** previsível, sem surpresa. **Visual rule:** discreto. **Anti-patterns:** link como ação primária, "clique aqui".

### List
**Purpose in YZI OS:** sequência **priorizada** de itens acionáveis (ações, follow-ups, sinais). **Supports:** decisão / ação / estado.
**Allowed use:** Action Queue, oportunidades, itens curtos com razão. **Avoid when:** vira tabela crua sem prioridade.
**Text limit:** item curto: dono · estado · razão · próximo passo. **Interaction rule:** ação por item. **Visual rule:** ordem reflete prioridade. **Anti-patterns:** lista infinita, item sem razão nem próximo passo.

### Modals
**Purpose in YZI OS:** foco temporário para **autorização ou confirmação crítica**. **Supports:** autorização / confiança.
**Allowed use:** aprovar ação sensível, confirmar consequência. **Avoid when:** fluxo normal ou conteúdo que cabe na tela.
**Text limit:** o que será feito + risco + impacto + decisão. **Interaction rule:** decisão deliberada, saída clara. **Visual rule:** estável, sem induzir clique. **Anti-patterns:** modal overload, pop-up interruptivo, esconder consequência.

### Notifications
**Purpose in YZI OS:** avisar algo **acionável ou relevante** que mudou. **Supports:** estado / ação.
**Allowed use:** nova recomendação, resultado, autorização pendente. **Avoid when:** ruído sem ação.
**Text limit:** o que mudou + próximo passo. **Interaction rule:** leva à ação/contexto. **Visual rule:** entrada discreta por nível. **Anti-patterns:** feed ruidoso, notificação sem ação, badge de contagem vazia.

### Pagination
**Purpose in YZI OS:** percorrer volumes **operacionais secundários**, sob demanda. **Supports:** estado.
**Allowed use:** detalhe/histórico longo no drawer ou módulo. **Avoid when:** dado estratégico na face principal.
**Text limit:** controles mínimos. **Interaction rule:** previsível. **Visual rule:** secundário. **Anti-patterns:** paginação como padrão do cockpit, fatiar prioridade em páginas.

### Popovers
**Purpose in YZI OS:** revelar contexto/ação **adicional controlado**, sob demanda. **Supports:** estado / ação.
**Allowed use:** detalhe de sinal, opção contextual no Radar. **Avoid when:** esconde informação essencial.
**Text limit:** curto e focado. **Interaction rule:** abre sob ação do usuário, fecha fácil. **Visual rule:** discreto, ancorado. **Anti-patterns:** popover essencial escondido, excesso de camadas flutuantes.

### Progress Bars
**Purpose in YZI OS:** mostrar **progresso real ou estado operacional** honesto. **Supports:** estado / confiança.
**Allowed use:** ingestão (`indexando → entendido → ligado`), montagem, execução. **Avoid when:** progresso fingido.
**Text limit:** rótulo de etapa. **Interaction rule:** reflete trabalho real. **Visual rule:** calmo, sem espetáculo. **Anti-patterns:** barra falsa, loading eterno, progresso decorativo.

### Ribbons
**Purpose in YZI OS:** marcar **estado/condição relevante** de um item (ex.: seed, urgente). **Supports:** estado.
**Allowed use:** sinalizar condição que muda a leitura. **Avoid when:** mero enfeite ou promoção.
**Text limit:** 1–2 palavras. **Interaction rule:** estática, informa. **Visual rule:** discreta, sem cara de e-commerce. **Anti-patterns:** ribbon promocional, "novo!" decorativo.

### Spinners
**Purpose in YZI OS:** indicar espera **curta e temporária**. **Supports:** estado.
**Allowed use:** carregamento breve sem etapa nomeável. **Avoid when:** substitui explicação de estado.
**Text limit:** nenhum/curtíssimo. **Interaction rule:** some ao concluir. **Visual rule:** mínimo. **Anti-patterns:** spinner eterno, spinner no lugar de "a YZI está trabalhando".

### Tabs
**Purpose in YZI OS:** alternar entre vistas **equivalentes** sem perder contexto. **Supports:** estado.
**Allowed use:** facetas de um mesmo objeto. **Avoid when:** esconde prioridade ou a próxima ação.
**Text limit:** rótulos curtos. **Interaction rule:** troca clara, sem perder estado. **Visual rule:** a aba prioritária é evidente. **Anti-patterns:** prioridade escondida em aba, abas demais.

### Tooltips
**Purpose in YZI OS:** esclarecer **detalhe pontual** sob demanda. **Supports:** confiança.
**Allowed use:** explicar um termo/ícone específico. **Avoid when:** compensa texto ruim ou hierarquia ruim.
**Text limit:** uma frase. **Interaction rule:** hover/foco, não esconde o essencial. **Visual rule:** discreto. **Anti-patterns:** tooltip dependency, informação essencial só no tooltip.

### Videos
**Purpose in YZI OS:** aumentar **prova, entendimento ou confiança** quando texto não basta. **Supports:** confiança.
**Allowed use:** demonstração, prova operacional, ativo de vídeo entendido. **Avoid when:** decoração ou auto-play.
**Text limit:** título/contexto curto. **Interaction rule:** sob demanda, controlado. **Visual rule:** integra ao significado. **Anti-patterns:** vídeo de fundo, auto-play, hero decorativo.

## 6. YZI OS Specific Rules

- Cards não podem virar **parede de cards**.
- Badges não podem ser **decoração**.
- Alerts só aparecem com **mudança relevante de estado, risco ou interrupção**.
- Notifications devem informar **algo acionável ou relevante**.
- Buttons devem ter **intenção clara**.
- Button Groups só existem com **escolhas mutuamente comparáveis**.
- Dropdowns não devem **esconder decisões críticas**.
- Modals só para **autorização, confirmação crítica ou foco temporário**.
- Tooltips não compensam **texto ruim ou hierarquia ruim**.
- Progress Bars só mostram **progresso real ou estado operacional**.
- Spinners são **temporários** e nunca substituem explicação de estado.
- Tabs não escondem **prioridade**.
- Pagination não é padrão para **dados estratégicos**.
- Carousel é evitado, salvo **exploração visual controlada**.
- Images e Videos só quando aumentam **confiança, entendimento ou prova**.
- Breadcrumb só com **orientação real**.
- Avatars representam **presença, responsabilidade ou autoria**, não decoração.

## 7. Forbidden Defaults

UI kit genérico · padrões TailAdmin-like · card wall · badge pollution · button overload · modal overload · tooltip dependency · table-first layout · chart-first layout · métricas sem decisão · alerts sem consequência · notifications sem ação · dropdown escondendo decisão · ruído visual fingindo ser produto.

## 8. Relationship With Components

O próximo documento, **`component-anatomy-v1.md`**, usará este vocabulário para definir **quais elementos entram em cada componente**. Exemplos:

- **Opportunity Card:** Badge, Button, List curta, Status Badge.
- **Authorization Panel:** Alert, Button Group, Progress/State, Audit Link.
- **Radar Surface:** Signal Badge, Territory Map, Popover controlado, Status Indicators.
- **Action Queue:** List, Status Badge, Button, Notification.

## 9. Future Use

Este documento será usado depois para: orientar a **anatomia dos componentes** · impedir **componentes genéricos** · evitar **UI poluída** · manter a YZI como **sistema operacional de decisão e ação** · orientar **prompts futuros** para Claude/Codex · impedir que a interface vire **CRM, dashboard SaaS ou card wall**.

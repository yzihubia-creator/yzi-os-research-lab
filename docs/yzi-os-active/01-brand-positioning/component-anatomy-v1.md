# Component Anatomy v1

> **Deriva de [`DESIGN.md`](./DESIGN.md), [`ui-elements-v1.md`](./ui-elements-v1.md) (vocabulário obrigatório), [`component-language-v1.md`](./component-language-v1.md), [`surface-patterns-v1.md`](./surface-patterns-v1.md), [`design-system-principles.md`](./design-system-principles.md), [`visual-direction.md`](./visual-direction.md) e [`brand-dna.md`](./brand-dna.md).** Fonte ativa.
> **Não é implementação:** sem código, React, CSS, Tailwind, tokens, Pencil/`.pen`, Motion, MCP, imagem ou screenshot.

## 1. Purpose

Define **o que cada componente pode conter**, em qual hierarquia, com quais elementos e com quais limites — **antes** de qualquer tela ser montada. Componentes são **unidades maiores compostas por UI Elements** definidos em [`ui-elements-v1.md`](./ui-elements-v1.md). Núcleo do produto: **decisão + ação contínua**. A YZI trabalha, não conversa; é a **orquestradora visível**, e os agentes internos não aparecem.

## 2. Binding Decisions

- **COMPONENT_ANATOMY_REQUIRED_BEFORE_SCREEN_COMPOSITION**
- **NO_COMPONENT_WITHOUT_UX_PURPOSE**
- **NO_TEXT_HEAVY_COMPONENTS**
- **EVERY_ELEMENT_MUST_SUPPORT_DECISION_ACTION_AUTHORIZATION_OR_TRUST**
- **COMPONENTS_MUST_USE_APPROVED_UI_ELEMENTS_ONLY**
- **SCREEN_COMPOSITION_MUST_USE_DEFINED_COMPONENT_ANATOMY**

## 3. Component Evaluation Questions

Todo componente precisa responder em segundos: **O que é isso? · Por que importa? · O que eu faço agora? · Precisa de autorização? · Qual o estado?** Se não responder, está errado.

## 4. Global Component Anatomy Rules

- Cada componente tem **função operacional clara**.
- Usa **somente** elementos definidos em `ui-elements-v1.md`.
- Tem uma **ação principal** quando aplicável.
- Texto **mínimo e hierárquico**.
- **Estado visível** quando relevante.
- Recomendação mostra **confiança/proveniência** quando aplicável.
- **Autorização explícita** quando há impacto operacional.
- Detalhe profundo vai para **drawer, modal ou popover controlado**.
- Não usar **tabela** como padrão; não usar **card** como solução universal; não usar **badges decorativas**; não usar **métricas sem consequência**; não usar **texto longo** para compensar falta de design.
- Não criar componente que pareça **CRM, dashboard SaaS ou central de relatórios**.

## 5. Approved UI Elements Vocabulary

Os elementos permitidos são **exclusivamente** os definidos em `ui-elements-v1.md`:

- **Feedback and State:** Alerts · Notifications · Status Badge · Progress Bars · Spinners · Ribbons.
- **Identity and Context:** Avatars · Badge · Breadcrumb · Images · Videos.
- **Action and Control:** Buttons · Button Groups · Dropdowns · Links · Tabs · Pagination.
- **Structure and Disclosure:** Cards · Lists · Modals · Popovers · Tooltips · Carousel.

> **Regra:** componentes só combinam esses elementos quando há **propósito claro**. Nenhum elemento fora desta lista.

## 6. Component Anatomy

### App Shell
**UX objective:** moldar o cockpit; organizar presença da YZI, navegação por capacidade e área operacional.
**Allowed UI elements:** Buttons · Links · Tabs · Avatars · Status Badge · Notifications · Tooltips.
**Required elements:** navegação por job/resultado · dock da YZI · área de conteúdo.
**Optional elements:** Breadcrumb (profundidade real) · Notifications.
**Visual hierarchy:** discreta — emoldura, não compete.
**Text limit:** rótulos curtos por capacidade.
**Primary CTA:** abrir a capacidade/decisão. **Secondary CTA:** acessar a YZI (dock).
**States:** ativo · com alerta pendente.
**Empty / preview behavior:** sempre há ao menos os módulos Start.
**Anti-patterns:** admin template · sidebar genérica de SaaS · topbar poluída.

### Command Center Block
**UX objective:** sintetizar **estado operacional + próxima decisão**; leitura executiva e ação.
**Allowed UI elements:** Cards · Lists · Badge · Status Badge · Buttons · Alerts.
**Required elements:** contexto · leitura da YZI (o que significa) · próxima ação.
**Optional elements:** Status Badge · Alert relevante.
**Visual hierarchy:** estado/decisão no topo; peso conforme importância.
**Text limit:** título + leitura curta + ação.
**Primary CTA:** abrir a prioridade do dia. **Secondary CTA:** ver detalhe relacionado.
**States:** com dado · vazio · processando.
**Empty / preview behavior:** orienta a próxima ação ("conecte/seed a operação").
**Anti-patterns:** dashboard de métricas · card métrico solto · número sem leitura.

### Radar Surface
**UX objective:** superfície **visual contínua** de território, sinais e oportunidades — decidir onde agir.
**Allowed UI elements:** Badge (Signal Badge) · Status Badge · Cards (Opportunity Card) · Popovers · Buttons.
**Required elements:** território/segmento · sinais por fonte/força · oportunidades priorizadas · próxima ação.
**Optional elements:** Popover de detalhe de sinal · Tooltip pontual.
**Visual hierarchy:** central no cockpit (planos com Radar); contínua, não fragmentada.
**Text limit:** rótulos de sinal e território curtos.
**Primary CTA:** abrir oportunidade / agir. **Secondary CTA:** inspecionar sinal (popover).
**States:** carregando sinais · sem sinais (seed/preview honesto) · ativo.
**Empty / preview behavior:** estado honesto ("sem sinais ainda"), nunca mapa decorativo vazio.
**Anti-patterns:** grid de cards · mapa decorativo · Google Trends · feed de tendências.

### Opportunity Card
**UX objective:** oportunidade **acionável** — o que é, por que importa, confiança, próxima ação.
**Allowed UI elements:** Badge · Status Badge · Lists (curta) · Buttons · Popovers · Links (rastro).
**Required elements:** título · por que importa · sinal · fit · ação recomendada · status · próxima ação da YZI.
**Optional elements:** Badge de tipo · Link para evidência · impacto resumido.
**Visual hierarchy:** peso conforme importância; ação próxima da leitura.
**Text limit:** face = por que importa + o que fazer; detalhe no drawer.
**Primary CTA:** executar/avançar a ação. **Secondary CTA:** abrir detalhe/rastro · descartar.
**States:** detectada · recomendada · aguardando autorização · executada · monitorando · bloqueada · descartada.
**Empty / preview behavior:** seed/preview marcado com honestidade.
**Anti-patterns:** card de CRM · card métrico solto · dado cru sem ação.

### Territory Map
**UX objective:** mostrar território/mercado/região como **leitura de oportunidade**, não enfeite.
**Allowed UI elements:** Badge (intensidade) · Popovers · Status Badge · Links.
**Required elements:** áreas · intensidade (aquecimento) · ligação com oportunidades.
**Optional elements:** Popover por área · Tooltip de contexto.
**Visual hierarchy:** subordinado à Radar Surface; apoia a decisão de onde agir.
**Text limit:** rótulos de área curtos.
**Primary CTA:** abrir oportunidade da área. **Secondary CTA:** detalhe da área (popover).
**States:** carregando · sem dados de território · ativo.
**Empty / preview behavior:** estado honesto, sem mapa decorativo.
**Anti-patterns:** mapa decorativo · mapa sem relação com decisão/ação.

### Signal Badge
**UX objective:** indicar sinal específico — **fonte + força + nível** (V1–V4/seed).
**Allowed UI elements:** Badge · Tooltip.
**Required elements:** fonte · força/nível.
**Optional elements:** Tooltip explicando o sinal.
**Visual hierarchy:** acessório, anexado a oportunidade/território/recomendação.
**Text limit:** 1–3 palavras.
**Primary CTA:** nenhum (informa). **Secondary CTA:** revelar origem (tooltip).
**States:** seed · V1–V4 · força alta/baixa.
**Empty / preview behavior:** marca claramente quando é seed.
**Anti-patterns:** badge decorativa · badge sem significado.

### Action Queue
**UX objective:** organizar **ações priorizadas** com dono, estado, razão e próximo passo.
**Allowed UI elements:** Lists · Status Badge · Buttons · Avatars (dono) · Notifications.
**Required elements:** por item — dono · estado · razão · próximo passo.
**Optional elements:** Notification de item novo · Badge de prioridade.
**Visual hierarchy:** ordem reflete prioridade; a YZI justifica a ordem.
**Text limit:** item curto, sem parágrafos.
**Primary CTA:** executar/agendar/autorizar a ação do topo. **Secondary CTA:** reordenar/adiar.
**States:** a fazer · rascunho · aguardando autorização · em execução · feita.
**Empty / preview behavior:** "Nada pendente — a YZI avisa quando surgir uma ação."
**Anti-patterns:** lista infinita · task manager genérico · ação sem razão nem próximo passo.

### Authorization Panel
**UX objective:** revisão **humana antes da execução** — aprovar, editar, recusar ou pausar com consequência clara.
**Allowed UI elements:** Alerts · Button Groups · Status Badge · Progress Bars · Links (rastro) · Modals.
**Required elements:** o que será feito · por quê · para quem · risco · impacto esperado · autorizar/editar/recusar.
**Optional elements:** Progress/estado de execução · Link para Audit Drawer.
**Visual hierarchy:** estável e deliberada; risco e impacto visíveis.
**Text limit:** essencial da consequência, sem texto longo.
**Primary CTA:** autorizar. **Secondary CTA:** editar · recusar · pausar.
**States:** aguardando autorização · autorizado · recusado · editado · executando.
**Empty / preview behavior:** sem ação sensível pendente, não aparece.
**Anti-patterns:** esconder risco · induzir clique · aprovação em um clique sem contexto.

### YZI Recommendation Panel
**UX objective:** leitura/recomendação da YZI com **razão e confiança**, não conversa.
**Allowed UI elements:** Cards · Avatars (YZI) · Badge · Buttons · Links (evidência) · Status Badge.
**Required elements:** recomendação · justificativa · evidência resumida · próxima ação · autorização necessária.
**Optional elements:** Badge de confiança/proveniência · Link para fonte.
**Visual hierarchy:** presente e discreta (painel/dock); nunca rouba a tela.
**Text limit:** recomendação + porquê curtos; sem chat longo.
**Primary CTA:** aceitar/executar a recomendação. **Secondary CTA:** ajustar · recusar.
**States:** sugerindo · aguardando autorização · aplicada · sem recomendação.
**Empty / preview behavior:** "Sem recomendações no momento."
**Anti-patterns:** chat lateral genérico · resposta genérica de LLM · recomendação sem ação ou sem porquê.

### Semantic Search Box
**UX objective:** busca por **intenção e descoberta** sobre ativos indexados — perguntar estrategicamente.
**Allowed UI elements:** Lists (resultados) · Cards · Badge · Links · Spinners (breve).
**Required elements:** campo de intenção · resultados como ativos entendidos · próxima ação.
**Optional elements:** Badge de agrupamento · sugestões de busca.
**Visual hierarchy:** entrada operacional clara; resultados como raciocínio, não lista de arquivos.
**Text limit:** placeholder orientando intenção; resultados curtos.
**Primary CTA:** abrir resultado/oportunidade. **Secondary CTA:** refinar busca.
**States:** vazio · buscando (spinner breve) · com resultados · sem resultados.
**Empty / preview behavior:** orienta o tipo de pergunta estratégica.
**Anti-patterns:** campo de busca genérico · lista de links · resultado sem contexto.

### Asset Intake Card
**UX objective:** mostrar material **recebido, entendido e conectado** a oportunidades.
**Allowed UI elements:** Cards · Status Badge · Progress Bars · Badge · Links · Images/Videos (quando aumentam prova).
**Required elements:** status de entendimento · ligação com oportunidades · próximos usos.
**Optional elements:** Progress de indexação · thumbnail quando agrega entendimento.
**Visual hierarchy:** material entendido, nunca arquivo/pasta bruto.
**Text limit:** rótulo do ativo + status curtos.
**Primary CTA:** usar ativo / ligar a oportunidade. **Secondary CTA:** abrir detalhe.
**States:** recebido · indexando · entendido · ligado a oportunidade.
**Empty / preview behavior:** mostra progresso honesto, sem loader eterno.
**Anti-patterns:** upload genérico · pasta/arquivo bruto · lista de uploads sem significado.

### Status Badge
**UX objective:** expressar **estado operacional honesto** de um item.
**Allowed UI elements:** Badge · Tooltip · Ribbon (condição relevante).
**Required elements:** estado atual claro.
**Optional elements:** Tooltip de explicação · Ribbon (ex.: seed/urgente).
**Visual hierarchy:** acessório, sempre legível.
**Text limit:** 1–2 palavras.
**Primary CTA:** nenhum (informa). **Secondary CTA:** explicar (tooltip).
**States:** preview · draft · aguardando autorização · autorizado · executando · executado · monitorando · bloqueado · descartado.
**Empty / preview behavior:** deixa claro quando é seed/preview.
**Anti-patterns:** Badge genérica sem função · status bonito sem consequência.

### Financial/Commission Summary
**UX objective:** sintetizar **impacto financeiro/comissão ligado à ação**, quando relevante.
**Allowed UI elements:** Cards · Badge · Status Badge · Buttons · Links.
**Required elements:** indicador financeiro · impacto esperado · ligação com próxima ação.
**Optional elements:** Badge de risco/folga · Link para detalhe.
**Visual hierarchy:** saúde/impacto primeiro; detalhe sob demanda.
**Text limit:** números com leitura curta, nunca tabela.
**Primary CTA:** priorizar cobrança/decisão. **Secondary CTA:** abrir detalhe (drawer).
**States:** com dado · sem dado financeiro ainda.
**Empty / preview behavior:** "Sem dados financeiros ainda."
**Anti-patterns:** planilha · tabela · dashboard financeiro completo · número sem decisão.

### Audit Drawer
**UX objective:** revelar **rastro, fonte, justificativa e decisão** — confiança e governança sem poluir a face.
**Allowed UI elements:** Lists · Status Badge · Links · Tabs · Pagination (sob demanda).
**Required elements:** fonte · decisão · execução · autorização · trace resumido.
**Optional elements:** Tabs por tipo de rastro · Pagination para histórico longo.
**Visual hierarchy:** secundário, sob demanda; nunca protagonista.
**Text limit:** entradas curtas de rastro.
**Primary CTA:** inspecionar entrada. **Secondary CTA:** fechar.
**States:** com rastro · vazio.
**Empty / preview behavior:** "Nenhuma ação registrada ainda."
**Anti-patterns:** run records como produto · logs na face da tela · drawer ocupando a tela principal.

## 7. Component Composition Guardrails

Telas futuras só podem ser compostas com componentes cuja anatomia esteja definida aqui. Uma tela futura **não deve**: empilhar componentes sem narrativa · transformar tudo em card · repetir o mesmo CTA em vários blocos · mostrar dados sem consequência · esconder autorização · usar texto longo para compensar falta de hierarquia · parecer CRM · parecer dashboard SaaS · parecer central de relatórios · parecer admin template · usar elementos fora do vocabulário aprovado.

## 8. Relationship With Surface Patterns

Os surface patterns (`surface-patterns-v1.md`) compõem-se **apenas** com componentes desta anatomia:

- **Executive Overview:** App Shell · Command Center Block · Radar Surface · Action Queue · YZI Recommendation Panel.
- **Radar Focus:** Radar Surface · Territory Map · Signal Badge · Opportunity Card · Semantic Search Box.
- **Opportunity Detail:** Opportunity Card · Financial/Commission Summary · Authorization Panel · Audit Drawer · YZI Recommendation Panel.
- **Authorization Flow:** Authorization Panel · Audit Drawer · Status Badge · YZI Recommendation Panel.
- **Asset Intelligence Flow:** Asset Intake Card · Status Badge · Audit Drawer · YZI Recommendation Panel.
- **Outcome Review:** Financial/Commission Summary · Status Badge · Audit Drawer · Command Center Block.
- **Alert & Interruption:** Alerts · Authorization Panel · Action Queue · YZI Recommendation Panel.
- **Semantic Search & Discovery:** Semantic Search Box · Radar Surface · Opportunity Card · Audit Drawer.

## 9. Future Use

Este documento será usado depois para: orientar **composição de telas** · orientar **prompts de implementação** · **limitar texto** · evitar **UI genérica** · impedir **card wall** · impedir **dashboard SaaS** · manter a **YZI como orquestradora visível** · garantir que componentes sirvam **decisão, ação, autorização, estado ou confiança** · ajudar Claude/Codex a **reutilizar componentes já definidos** em vez de inventar novos.

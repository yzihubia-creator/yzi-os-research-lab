# YZIHUB First Operating Surface Blueprint v1

> Fonte ativa. Define o blueprint conceitual da **primeira superfície operacional real** da YZIHUB usando o YZI OS. Deriva de `../05-decisions/decision-yzihub-first-operating-tenant-v1.md`, `yzihub-self-selling-operating-loop-v1.md`, `../01-brand-positioning/navigation-sidebar-map-v1.md`, `../01-brand-positioning/screen-composition-rules-v1.md`, `../01-brand-positioning/component-anatomy-v1.md`, `../01-brand-positioning/surface-patterns-v1.md` e `../01-brand-positioning/DESIGN.md`.
> **Não é implementação:** não cria tela final, wireframe visual, CSS, React, Tailwind, Pencil/`.pen`, Motion, MCP, evidence nem lane. É blueprint conceitual.

## 1. Purpose

Define a **primeira superfície operacional conceitual** da YZIHUB como tenant real do YZI OS — o lugar onde o gestor observa canais, lê sinais, decide, autoriza e age. É **blueprint, não implementação**: descreve estrutura, hierarquia e estados, sem desenhar pixel, componente ou código. Núcleo: **decisão + ação contínua**. A YZI trabalha, não conversa.

## 2. Binding Decisions

- YZIHUB_FIRST_OPERATING_SURFACE_BLUEPRINT_DEFINED
- NO_IMPLEMENTATION_FROM_BLUEPRINT_YET
- NO_MANUAL_CRM_ENTRY_AS_PRIMARY_FLOW
- CHANNELS_FIRST_OPERATION
- YZI_ORCHESTRATES_MANAGER_AUTHORIZES
- SURFACE_MUST_SUPPORT_DECISION_ACTION_AUTHORIZATION_AND_TRUST
- NO_DASHBOARD_CRM_CARD_WALL_OR_REPORT_FIRST_SCREEN

## 3. Operating Situation

A YZIHUB usa o próprio YZI OS para **observar seus canais**, detectar sinais comerciais, organizar oportunidades, propor ações e pedir autorização do gestor. A superfície **não é dashboard**: é uma **mesa de decisão operacional** — o gestor abre, entende o estado da operação comercial e decide o próximo passo, com a YZI ao lado.

## 4. Primary User Questions

A superfície responde, em segundos:

- O que está acontecendo agora?
- Qual oportunidade merece atenção?
- Por que isso importa?
- O que a YZI recomenda?
- O que precisa de autorização?
- Qual ação deve acontecer agora?
- Qual é o rastro/confiança disto?
- O que mudou desde a última leitura?

## 5. Surface Pattern Base

A superfície inicial combina, com hierarquia clara: **Executive Overview** · **Radar Focus** · **Action Queue** (via Authorization Flow) · **Authorization Flow** · **YZI Recommendation Panel** · **Audit Drawer**. Não vira **soma de telas**: é uma **superfície única** onde cada padrão entra conforme há contexto e nem tudo pesa ao mesmo tempo.

## 6. Required Components

- **App Shell** — moldura do cockpit; navegação por capacidade e dock da YZI.
- **Command Center Block** — síntese do estado e a próxima decisão.
- **Radar Surface** — leitura viva de sinais e oportunidades comerciais.
- **Opportunity Card** — oportunidade acionável (sinal + fit + ação).
- **Action Queue** — próximas ações priorizadas, com razão e estado.
- **Authorization Panel** — aprovar/editar/recusar/pausar com consequência clara.
- **YZI Recommendation Panel** — recomendação + razão + confiança + próxima ação.
- **Audit Drawer** — rastro sob demanda, fora da face principal.
- **Status Badge** — estado honesto de cada item.
- **Signal Badge** — fonte e força do sinal (V1–V4/seed).

## 7. Optional Components

Entram **apenas quando há contexto real suficiente**:

- **Territory Map** — quando há território/segmento com leitura útil.
- **Semantic Search Box** — quando há ativos indexados para consultar por intenção.
- **Asset Intake Card** — quando há material recebido sendo entendido.
- **Financial/Commission Summary** — quando há dado financeiro ligado a ação.

## 8. Dominant Hierarchy

Nem tudo tem o mesmo peso ao mesmo tempo. Ordem dominante:

1. **Command Center Block** — síntese e próxima decisão.
2. **Radar Surface** — leitura viva de sinais e oportunidades.
3. **Opportunity Card prioritária** — a oportunidade acionável do momento.
4. **YZI Recommendation Panel** — recomendação, razão e confiança.
5. **Action Queue** — próximas ações priorizadas.
6. **Authorization Panel** — aprovar/editar/recusar quando necessário.
7. **Audit Drawer** — rastro sob demanda, secundário.

## 9. Manager Interaction Model

O gestor interage por: **aprovar · editar · recusar · pausar · pedir nova leitura · perguntar à YZI · abrir rastro · priorizar ação · autorizar integração/canal · pedir follow-up.**

Bloqueado como interação primária: **cadastrar lead manualmente · mover card em pipeline · preencher formulário de CRM · alimentar planilha · criar relatório manual.** O sistema trabalha para manter a operação atualizada; o gestor decide.

## 10. Channel-First Operating Flow

```
Canal real gera sinal
  → YZI interpreta
  → Radar organiza
  → oportunidade emerge
  → YZI recomenda ação
  → gestor autoriza / edita / recusa
  → ação é executada ou preparada
  → resultado volta para leitura operacional
  → rastro fica no Audit Drawer
```

## 11. Surface States

### no_channels_connected
**Meaning:** nenhum canal conectado ainda. **Main surface behavior:** orienta conectar canal ou seed autorizado, sem blocos vazios. **YZI behavior:** explica o que vai observar quando houver canal. **Manager action:** conectar canal / autorizar seed. **What must not happen:** mostrar dashboard fake ou oportunidades inventadas.

### channels_connected_no_signals
**Meaning:** canais conectados, sem sinais ainda. **Main surface behavior:** estado honesto de espera ativa. **YZI behavior:** "monitorando — aviso quando surgir sinal". **Manager action:** aguardar / ajustar fontes. **What must not happen:** preencher a tela com métricas placebo.

### signals_detected
**Meaning:** sinais chegaram dos canais. **Main surface behavior:** Radar organiza sinais por fonte/força. **YZI behavior:** interpreta e agrupa. **Manager action:** explorar sinais. **What must not happen:** virar feed cru de sinais sem leitura.

### opportunity_recommended
**Meaning:** uma oportunidade priorizada emergiu. **Main surface behavior:** Opportunity Card prioritária em foco. **YZI behavior:** recomenda com razão e confiança. **Manager action:** avaliar e agir. **What must not happen:** oportunidade sem ação nem rastro.

### authorization_required
**Meaning:** a ação tem impacto externo. **Main surface behavior:** Authorization Panel mostra o que será feito. **YZI behavior:** expõe risco, impacto e rastro antes. **Manager action:** autorizar/editar/recusar/pausar. **What must not happen:** esconder consequência ou aprovar em um clique sem contexto.

### action_prepared
**Meaning:** ação autorizada, pronta para execução. **Main surface behavior:** estado `autorizado` visível. **YZI behavior:** prepara dentro do escopo. **Manager action:** acompanhar. **What must not happen:** executar fora da autorização.

### action_running
**Meaning:** ação em execução. **Main surface behavior:** estado `executando` honesto. **YZI behavior:** registra progresso real. **Manager action:** acompanhar/pausar. **What must not happen:** progresso fingido.

### outcome_available
**Meaning:** resultado disponível. **Main surface behavior:** resultado ligado à próxima decisão. **YZI behavior:** lê o resultado e propõe o próximo passo. **Manager action:** acionar próxima ação. **What must not happen:** relatório morto sem decisão.

### blocked_needs_manager_decision
**Meaning:** bloqueio que exige decisão humana. **Main surface behavior:** alerta com causa e consequência. **YZI behavior:** explica o bloqueio e recomenda saída. **Manager action:** decidir/desbloquear. **What must not happen:** alerta sem ação.

### error_state
**Meaning:** falha técnica/operacional. **Main surface behavior:** estado honesto de erro com próximo passo. **YZI behavior:** sinaliza e propõe correção. **Manager action:** corrigir/retomar. **What must not happen:** erro silencioso ou que parece bug sem saída.

## 12. Empty and Preview Behavior

Não inventar oportunidades · não mostrar dashboard fake · não mostrar métricas placebo · não mostrar card wall vazio · mostrar o **próximo passo operacional real** · orientar conexão de canais ou seed autorizado · marcar **preview/seed com honestidade**.

## 13. Authorization Rules

Qualquer ação com **impacto externo** exige autorização explícita: envio de mensagem · follow-up · campanha · integração · alteração de status operacional · proposta comercial · comunicação com lead/cliente.

A autorização mostra: **o que será feito · para quem · por quê · risco · impacto esperado · rastro**; e oferece: **autorizar · editar · recusar · pausar**.

## 14. Trust and Audit Rules

A confiança vem de: **origem do sinal · rastro do canal · interpretação da YZI · status · histórico · autorização · resultado.** O **Audit Drawer** guarda o detalhe sob demanda — **não polui** a superfície principal.

## 15. What Stays Out of the Main Surface

Logs · tabelas longas · histórico completo · cadastro bruto · formulários de CRM · planilhas · métricas sem decisão · relatórios · debug técnico · múltiplos gráficos · conversa longa com a YZI · lista infinita de leads.

## 16. Anti-Patterns

Dashboard SaaS genérico · CRM pipeline · card wall · KPI wall · chart wall · report-first layout · table-first layout · chat-first product · task manager genérico · feed de notificações · tela que pede para o gestor alimentar o sistema · YZI como chatbot lateral sem função operacional · oportunidade sem ação · recomendação sem rastro · autorização escondida.

## 17. Future Use

Este blueprint orientará depois: blueprint visual mais detalhado · wireframe futuro · protótipo opcional (Pencil/`.pen`, só com autorização) · implementação futura. Qualquer passo seguinte respeita a cadeia de autoridade visual e a navegação já definida.

## 18. Limits

Este documento não implementa nada, não cria wireframe final, não cria UI, CSS, React, componente, `.pen`, Motion, evidence, lane nem execução técnica. Markdown puro · sem YAML · sem JSON · sem tabelas grandes · sem código · sem imagens.

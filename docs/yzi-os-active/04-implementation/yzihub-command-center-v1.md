# YZI OS — YZIHUB Command Center V1

**Fonte ativa.** Alinhado a [`yzihub-first-implementation.md`](./yzihub-first-implementation.md), [`02-modules/module-map.md`](../02-modules/module-map.md) e [`01-brand-positioning/visual-direction.md`](../01-brand-positioning/visual-direction.md). Detalha o **primeiro bloco implementável** — não define schema, UI final, design tokens, integrações nem código.

---

## 1. Objetivo do bloco

O **YZIHUB Command Center V1** é a **primeira tela estratégica real do YZI OS**. Ao abrir, o gestor da YZIHUB vê o estado do negócio e o que fazer agora — provando o núcleo **decisão + ação contínua** num caso real, com a YZI presente.

---

## 2. O que esta tela deve provar

- Que o YZI OS **não é CRM**.
- Que o cockpit é **estratégico**, não técnico.
- Que a YZI tem **presença operacional** (trabalha, não conversa).
- Que os **módulos aparecem como capacidades**, por job/resultado.
- Que o usuário **entende o que fazer** ao abrir.
- Que **decisão + ação contínua** aparece no produto, não só no doc.

---

## 3. Estrutura da tela

Blocos principais, em ordem de prioridade visual:

1. Estado da empresa
2. Próximas ações
3. Recomendações da YZI
4. Oportunidades
5. Financeiro resumido
6. Agenda de hoje
7. Conteúdos e campanhas
8. Alertas
9. Créditos / uso
10. Acesso aos módulos
11. Auditoria técnica (secundária)

---

## 4. Definição por bloco

### 1. Estado da empresa
- **Pergunta:** como a YZIHUB está agora?
- **Dados:** sinais consolidados de oportunidades, financeiro, agenda e alertas.
- **Ação:** abrir a prioridade do dia.
- **YZI:** escreve o resumo vivo do estado.
- **Vazio:** "Sem dados ainda — conecte/seed a operação para ver o estado."
- **NÃO deve virar:** mural de métricas sem direção.

### 2. Próximas ações
- **Pergunta:** o que fazer agora?
- **Dados:** tarefas, follow-ups e ações recomendadas, priorizados.
- **Ação:** executar/agendar/autorizar a ação no topo.
- **YZI:** prioriza e justifica a ordem.
- **Vazio:** "Nada pendente — a YZI avisa quando surgir uma ação."
- **NÃO deve virar:** lista de tarefas crua sem prioridade.

### 3. Recomendações da YZI
- **Pergunta:** o que a YZI sugere e por quê?
- **Dados:** cruzamento de módulos (oportunidade, risco, timing).
- **Ação:** aceitar/ajustar/recusar a recomendação.
- **YZI:** é o autor — mostra recomendação + porquê + ação.
- **Vazio:** "Sem recomendações no momento."
- **NÃO deve virar:** caixa de chat solta.

### 4. Oportunidades
- **Pergunta:** onde há negócio para avançar?
- **Dados:** oportunidades quentes/frias com timing.
- **Ação:** avançar oportunidade, acionar follow-up.
- **YZI:** sinaliza esfriamento e propõe retomada.
- **Vazio:** "Nenhuma oportunidade ativa."
- **NÃO deve virar:** funil de CRM como produto-fim.

### 5. Financeiro resumido
- **Pergunta:** qual a saúde financeira?
- **Dados:** entradas/saídas e alertas de saúde.
- **Ação:** priorizar cobrança ou decisão de investimento.
- **YZI:** liga finanças à ação comercial.
- **Vazio:** "Sem dados financeiros ainda."
- **NÃO deve virar:** relatório contábil detalhado.

### 6. Agenda de hoje
- **Pergunta:** o que acontece hoje?
- **Dados:** eventos, reuniões e follow-ups do dia.
- **Ação:** abrir, reagendar ou preparar o compromisso.
- **YZI:** encaixa próximas ações no tempo.
- **Vazio:** "Dia livre — a YZI sugere o que priorizar."
- **NÃO deve virar:** só uma agenda de eventos.

### 7. Conteúdos e campanhas
- **Pergunta:** o que está no ar, pronto ou pendente?
- **Dados:** conteúdos e campanhas com status.
- **Ação:** revisar, aprovar ou publicar (autorizado).
- **YZI:** propõe conteúdo/campanha e prepara execução.
- **Vazio:** "Nenhum conteúdo ou campanha ativo."
- **NÃO deve virar:** gerenciador de posts/anúncios genérico.

### 8. Alertas
- **Pergunta:** o que mudou e exige atenção?
- **Dados:** riscos e mudanças relevantes.
- **Ação:** tratar o risco / abrir a ação relacionada.
- **YZI:** detecta e explica o alerta.
- **Vazio:** "Nenhum alerta no momento."
- **NÃO deve virar:** feed de notificações ruidoso.

### 9. Créditos / uso
- **Pergunta:** quanto do sistema contínuo está sendo consumido?
- **Dados:** resumo de uso/créditos da YZI.
- **Ação:** acompanhar e autorizar consumo.
- **YZI:** opera dentro de créditos, permissões e escopo.
- **Vazio:** "Sem consumo registrado ainda."
- **NÃO deve virar:** medidor técnico escondido.

### 10. Acesso aos módulos
- **Pergunta:** onde aprofundar cada capacidade?
- **Dados:** módulos disponíveis no plano.
- **Ação:** abrir o módulo na sua decisão (não numa tabela crua).
- **YZI:** acompanha em cada módulo.
- **Vazio:** "—" (sempre há ao menos os módulos Start).
- **NÃO deve virar:** menu técnico liderado por nomes de sistema.

### 11. Auditoria técnica (secundária)
- **Pergunta:** o que a YZI fez e com que dados?
- **Dados:** rastro de ações executadas.
- **Ação:** inspecionar sob demanda.
- **YZI:** registra o rastro do que fez.
- **Vazio:** "Nenhuma ação registrada ainda."
- **NÃO deve virar:** run records como produto nem protagonista da tela.

---

## 5. Seed mínimo controlado da YZIHUB

Menor conjunto demonstrável (conceitual, **sem schema**), tudo da própria YZIHUB ou seed neutro da YZIHUB — **nunca** Jurema, Café com Pam, campanha política ou vertical imobiliária:

- **3 oportunidades** (ex.: lead quente, proposta em aberto, cliente para upsell).
- **3 tarefas / follow-ups** (ex.: retomar proposta, responder lead, cobrar pagamento).
- **3 eventos de agenda** (ex.: reunião comercial, alinhamento interno, call de fechamento).
- **3 itens financeiros** (ex.: receita prevista, despesa fixa, pagamento pendente).
- **3 conteúdos ou campanhas** (ex.: post pronto, campanha no ar, conteúdo a aprovar).
- **3 recomendações da YZI** (ex.: priorizar follow-up de alto valor, escalar campanha boa, publicar conteúdo pronto).
- **1 resumo de créditos/uso** (consumo do período).
- **1 alerta operacional** (ex.: oportunidade esfriando).

---

## 6. Papel da YZI no Command Center

A YZI aparece como assistente viva, com:

- **Resumo do dia** — estado e prioridade.
- **Recomendação principal** — a próxima ação mais importante.
- **Justificativa** — por que essa ação agora.
- **Ação sugerida** — o passo concreto, a um gesto.
- **Pedido de autorização** quando a ação for sensível.
- **Rastro do que foi feito** — transparência depois da execução.

---

## 7. Comportamento visual

Alinhado à [direção visual](../01-brand-positioning/visual-direction.md):

- Cockpit estratégico **premium**.
- **Escuro, calmo, denso de sentido**, não de ruído.
- **Não** TailAdmin, **não** admin genérico.
- **Não** mural de cards iguais — peso visual conforme a importância.
- Auditoria técnica em **drawer/aba secundária**.
- Foco em **decisão e próxima ação**; a YZI é presença discreta e persistente.

---

## 8. Critério de pronto do bloco

Pronto quando:

- A tela inicial mostra o **estado da YZIHUB**.
- Existem **próximas ações claras**.
- A **YZI aparece como assistente viva**.
- O **seed mínimo aparece de forma coerente**.
- O usuário **entende a prioridade do dia**.
- Os **módulos aparecem como capacidades**.
- A **auditoria técnica não domina** a tela.
- **Nada parece** CRM puro, TailAdmin ou painel técnico.

---

## 9. Fora de escopo

Não definir nesta tarefa: schema final, tabelas, integrações reais, automações externas, pricing, design tokens finais, implementação de UI, código, SQL ou MCP.

---

## 10. Ponte para implementação

> Direcional. Não autoriza por si só código, schema ou UI final.

**Arquivos/telas provavelmente afetados:** o app shell do cockpit, a rota/tela inicial (Command Center) e o painel/dock da YZI. (Caminhos técnicos a definir na etapa de implementação.)

**Dados seed a criar:** o seed mínimo da Seção 5 — 3 oportunidades, 3 tarefas/follow-ups, 3 eventos, 3 itens financeiros, 3 conteúdos/campanhas, 3 recomendações, 1 resumo de créditos, 1 alerta — todos neutros da YZIHUB.

**Componentes visuais necessários:** app shell, sidebar (por capacidade), topbar (contexto + créditos), strategic cards (estado), action queue (próximas ações), recommendation cards (YZI), assistant panel/dock, status badges, empty states e audit drawer — conforme [`design-system-principles.md`](../01-brand-positioning/design-system-principles.md).

**Primeiro prompt de implementação sugerido (depois deste documento):**
> "Implementar o YZIHUB Command Center V1 como tela inicial do cockpit: app shell escuro premium + estado da empresa + próximas ações + recomendações da YZI, consumindo o seed mínimo controlado da YZIHUB. Auditoria técnica em drawer secundário. Sem estética TailAdmin." — a ser executado em etapa própria, com escopo técnico (rotas, componentes, seed) definido então.

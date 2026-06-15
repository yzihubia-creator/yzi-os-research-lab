# YZI OS — Primeira Implementação: YZIHUB

**Fonte ativa.** Alinhado a [`00-product/product-definition.md`](../00-product/product-definition.md), [`02-modules/module-map.md`](../02-modules/module-map.md) e [`01-brand-positioning/visual-direction.md`](../01-brand-positioning/visual-direction.md). Este documento é a ponte do mapa de módulos para a implementação real — **não** define schema, UI final, pricing nem integrações.

---

## 1. Declaração de intenção

A **YZIHUB será a primeira operação real dentro do YZI OS** — não uma demo fake nem uma vitrine de tela.

O objetivo é **usar o YZI OS para gerir a própria YZIHUB**: sua operação, suas oportunidades, seu financeiro, seu conteúdo e seu crescimento. A primeira versão prova o núcleo **decisão + ação contínua** num caso real, mantendo o produto livre de estética ou regra de cliente.

---

## 2. O que a YZIHUB precisa gerir no YZI OS

Áreas reais da operação:

- Visão geral da empresa (estado do negócio).
- Leads e oportunidades.
- Conversas.
- Follow-ups.
- Agenda.
- Financeiro.
- Conteúdo.
- Tráfego pago.
- Radar de oportunidades.
- Recomendações da YZI.
- Relatórios.
- Uso / créditos.

---

## 3. Jobs reais da YZIHUB

Tarefas concretas que o sistema deve ajudar a fazer:

- Saber **o que fazer hoje**.
- Acompanhar oportunidades.
- Priorizar follow-ups.
- Ver a saúde financeira.
- Preparar campanhas.
- Identificar tendências.
- Gerar conteúdo.
- Acompanhar publicações.
- Organizar a agenda.
- Gerar relatórios.
- Receber recomendações.
- Autorizar ações da YZI.

A superfície lidera por **job/resultado**, não por nomes de agentes nem por nomes técnicos de módulo.

---

## 4. Primeira tela: YZIHUB Command Center

A primeira tela real do produto é estratégica, não técnica. Ao abrir, o gestor da YZIHUB vê:

- **Estado da empresa** — leitura viva do negócio.
- **Próximas ações** — o que fazer agora, priorizado.
- **Recomendações da YZI** — o que a YZI sugere + porquê + ação.
- **Oportunidades** — quentes/frias, com timing.
- **Financeiro resumido** — saúde e alertas.
- **Agenda de hoje** — compromissos e follow-ups do dia.
- **Conteúdos / campanhas** — o que está no ar, pronto ou pendente.
- **Alertas** — riscos e mudanças relevantes.
- **Créditos / uso** — consumo do sistema contínuo, transparente.
- **Acesso aos módulos** — capacidades por job/resultado.

A leitura primária é decisão e ação; a auditoria técnica fica em drawer/aba, secundária.

---

## 5. Dados mínimos iniciais

Dados necessários para a primeira versão (conceituais, **sem schema técnico**):

- Oportunidades.
- Contatos.
- Conversas.
- Tarefas.
- Follow-ups.
- Eventos (agenda).
- Receitas / despesas.
- Campanhas.
- Conteúdos.
- Tendências / radar.
- Recomendações.
- Ações executadas (rastro).
- Créditos / uso.

Esses são os dados da própria YZIHUB — reais ou seed controlado da YZIHUB, nunca de uma vertical de cliente.

---

## 6. Papel da YZI nesta primeira implementação

A YZI trabalha, não conversa. Nesta versão ela deve:

- Ler o estado da operação.
- Resumir o dia.
- Recomendar próximas ações.
- Preparar tarefas.
- Sugerir campanhas.
- Sugerir conteúdos.
- Alertar riscos.
- Acompanhar resultados.
- **Pedir autorização antes de executar ações sensíveis** — sempre dentro de permissões, créditos e escopo.

Ela mostra o que vai fazer antes e o que fez depois, com rastro.

---

## 7. O que fica fora da primeira implementação

NÃO entra agora:

- Jurema como base.
- Café com Pam como base.
- Campanha política.
- Vertical imobiliária.
- TailAdmin / estética de admin genérico.
- CRM puro.
- Run records como produto.
- Multi-tenant avançado.
- Automações externas reais sem autorização.
- Schema final.
- Pricing final.

---

## 8. Critério de pronto

A primeira implementação está pronta quando:

- A YZIHUB tiver uma **tela inicial estratégica** (Command Center).
- Os módulos principais aparecerem como **capacidades** (por job/resultado).
- A **YZI tiver presença clara** na interface.
- Houver **lista de próximas ações**.
- Houver **dados demonstráveis ou seed controlado** da própria YZIHUB.
- O usuário **entender o que fazer** ao abrir o sistema.
- A **auditoria técnica estiver secundária**.
- **Nada parecer TailAdmin / admin genérico.**

---

## 9. Ponte para implementação

> Direcional. Não autoriza por si só código, schema ou UI final — isso fica para documentos/etapas próprias.

**Arquivos/telas provavelmente afetados no futuro:** o app shell do cockpit, a tela inicial (Command Center) e o painel/dock da YZI. (Implementação técnica fora do escopo deste documento.)

**Módulos que entram primeiro (Start):** Dashboard, CRM/Leads (básico), Follow-ups, Calendário, Financeiro (básico), Relatórios simples e a YZI em modo recomendação. Radar, Tráfego Pago e Conteúdo IA são Growth e entram depois.

**Primeiro bloco implementável:** o **YZIHUB Command Center** — estado da empresa + próximas ações + recomendações da YZI, lendo um conjunto mínimo de dados. É o bloco que prova o núcleo decisão + ação.

**Primeiro dado / seed controlado:** um conjunto pequeno e real da YZIHUB cobrindo oportunidades, tarefas/follow-ups, eventos da agenda e um resumo financeiro — suficiente para o Command Center mostrar estado e próximas ações de forma demonstrável.

O próximo documento permitido deve detalhar este primeiro bloco (Command Center + seed mínimo) dentro de `docs/yzi-os-active/04-implementation/`, sem ressuscitar documentação histórica e sem ainda fixar schema/UI/integrações.

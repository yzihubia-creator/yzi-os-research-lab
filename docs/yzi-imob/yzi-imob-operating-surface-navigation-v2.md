# YZI IMOB — Operating Surface v2 · Arquitetura de Navegação (LOCKED)

Decisão de produto **travada**. Autoridade de navegação e de filosofia visual do YZI IMOB; base para toda a fase de wireframes e implementação daqui em diante. Move o produto de coleção de funcionalidades para **sistema operacional de uma imobiliária**, com a YZI como entidade orquestradora.

## Linhagem
- **Evolui** `yzi-imob-product-operating-surface-v1.md`; **supera** a "Navegação-alvo" de `yzi-imob-ux-ui-operating-system-map-v0.1.md`.
- **Preserva** `yzi-imob-ux-composition-v1.md`: runtime invisível, YZI como presença, toda tela orientada por decisão.
- **Mudança estrutural:** o produto gira em torno de **três ativos** — Imóveis, Corretores, Clientes. Corretores é elevado a ativo de primeira classe.

## 1. A YZI é a entrada do sistema
Não existe "Dashboard" como primeira tela. A primeira tela é a **YZI**, apresentando o **Operating Briefing**, que mostra apenas: prioridade do dia; aprovações pendentes; itens bloqueados; alertas do Radar; próximas ações. Sem chat aberto por padrão — a YZI aparece quando há algo relevante.

## 2. Navegação principal (sidebar)
Poucos itens visíveis, agrupados. Nada de dezenas de itens simultâneos.
```
YZI
──────────────
OPERAÇÃO      Corretores · Imóveis · Clientes · Atendimento
──────────────
MARKETING     Creative Studio · Campanhas · Site
──────────────
INTELIGÊNCIA  Radar · Insights · Resultados
──────────────
SISTEMA       Operação · Equipe · Configurações
```

## 3. Cada item abre seu próprio submenu
Progressive disclosure: o topo mostra ativos; o detalhe vive no submenu. Submenus travados:

- **Corretores:** Cadastro · Dashboard · Agenda · Performance · Permissões
- **Imóveis:** Cadastro · Todos os imóveis · Mídias · Publicação · Site · SEO · Histórico
- **Clientes:** Kanban · Leads · Visitas · Histórico · Negociações
- **Creative Studio:** Fila · Templates · Criativos · Vídeos · Carrosséis · Aprovações · Créditos
- **Campanhas:** Preparadas · Em execução · Performance · Orçamentos · Públicos · Relatórios

Submenus **a definir** (não inventar nesta fase): Atendimento, Site, Radar, Insights, Resultados, Operação, Equipe, Configurações.

## 4. Filosofia visual
Referência próxima de **Creatify, Claude, Linear e Raycast**, não de SaaS tradicional:
- muito espaço em branco; tipografia forte; poucos elementos simultâneos;
- ícones maiores e mais expressivos; praticamente nenhum card decorativo;
- animações discretas; foco absoluto na decisão.

## 5. A YZI nunca compete com a tela
Não ocupa coluna fixa de chat; é uma **camada operacional**. Presença por exemplo: "Terminei três criativos."; "Existe uma campanha aguardando aprovação."; "Encontrei uma oportunidade em Manaíra."; "O corretor João está sobrecarregado." Ela informa, justifica, oferece a ação e sai de cena.

## 6. Organização do produto
Três ativos principais: **Imóveis, Corretores, Clientes**. Os demais módulos existem para **potencializá-los**: Creative Studio, Campanhas, Site, Radar, Insights, Resultados.

## 7. Regra permanente
Toda nova tela responde primeiro: **"Qual decisão operacional esta tela ajuda o gestor a tomar?"** Se a resposta não for clara, a tela não entra no produto.

## Delta com a implementação atual (não implementar nesta unidade)
- A sidebar atual (`platform/src/components/yzi-os/yzi-sidebar.tsx`) usa outros grupos (Início · Módulos · Descobrir · Planejar & Agir · Medir · Base) e não reflete os grupos v2; não há ativo Corretores nem submenus por item.
- A Home v2 é a **YZI / Operating Briefing** como entrada. Hoje a vertical redireciona para o Estúdio (`/cockpit/yzi-imob` → `/studio`) e o Briefing existe só como tela isolada em `/cockpit/yzi-imob/briefing`, sem ser a entrada.
- A navegação v2 (sidebar agrupada, submenus, entrada pela YZI) é uma unidade futura própria, a planejar depois desta trava.

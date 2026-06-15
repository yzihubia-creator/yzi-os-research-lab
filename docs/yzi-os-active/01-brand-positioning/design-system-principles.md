# YZI OS — Princípios do Design System

**Fonte ativa.** Traduz [`visual-direction.md`](./visual-direction.md) em princípios e tokens conceituais. **Não é implementação** — sem código, sem valores finais de produção. São diretrizes para guiar o design system futuro.

---

## 1. Princípios do design system

1. **Componente serve à decisão.** Se não apoia decidir ou agir, não entra.
2. **Consistência conceitual antes de variedade visual.** Poucos padrões, bem aplicados.
3. **Hierarquia é regra, não estilo.** Peso visual = importância para a decisão.
4. **Estado é cidadão de primeira classe.** Loading, vazio, erro, processando, executado.
5. **A YZI tem linguagem própria e reconhecível** dentro do sistema (recomendação, ação, execução).
6. **Acessível e legível** sob densidade alta: contraste, foco, leitura rápida.
7. **Escalável por módulos** sem quebrar a identidade do cockpit.

---

## 2. Tokens conceituais

> Conceituais e direcionais — valores finais ficam para a etapa de implementação do design system.

- **Cor:** base escura e calma; um acento estratégico para ação/decisão; semânticos para oportunidade, risco, neutro e "YZI". Cor comunica significado, não decora.
- **Tipografia:** uma família clara e moderna; escala curta e firme (display → título → corpo → meta). Legibilidade acima de personalidade.
- **Espaçamento:** escala consistente e generosa; espaço é ferramenta de hierarquia e calma.
- **Profundidade:** elevação sutil para separar camadas (superfície → card → overlay/drawer). Profundidade indica hierarquia, não enfeite.
- **Motion:** discreto e com propósito — sinalizar mudança de estado, entrada da YZI, conclusão de ação. Nunca animação gratuita.

---

## 3. Componentes essenciais

| Componente | Papel |
|---|---|
| **App shell** | Moldura do cockpit; sustenta navegação, conteúdo e presença da YZI |
| **Sidebar** | Acesso aos módulos/capacidades, liderada por job/resultado, não por nomes técnicos |
| **Topbar** | Contexto atual, busca/comando, status e créditos |
| **Strategic cards** | Estado do negócio e prioridades — unidades de decisão |
| **Module cards** | Entrada para cada capacidade do sistema |
| **Recommendation cards** | O que a YZI recomenda + porquê + ação |
| **Action queue** | Fila de próximas ações (a fazer, autorizar, em execução, feitas) |
| **Assistant panel** | Presença persistente da YZI: contexto, proposta, execução, rastro |
| **Data table** | Detalhe operacional sob demanda, legível e filtrável |
| **Timeline** | Linha do que aconteceu / o que a YZI fez |
| **Command bar** | Acesso rápido a ações e navegação |
| **Status badges** | Estado de itens (oportunidade, risco, pendente, executado) |
| **Credit/usage indicators** | Transparência de consumo do sistema contínuo por créditos |
| **Empty states** | Orientam a próxima ação quando não há dado |
| **Audit drawer** | Auditoria técnica/rastro — secundária, sob demanda |

---

## 4. Regras por tela

- **Dashboard:** começa pelo estado do negócio e próximas ações; recomendações da YZI em destaque. Não é mural de métricas.
- **Módulos:** cada módulo abre na decisão da sua capacidade (CRM → oportunidades; Financeiro → saúde; etc.), não numa tabela crua.
- **AI Assistant:** centro de recomendação e execução; mostra contexto, proposta, autorização e resultado. Não é janela de chat solta.
- **Relatórios:** terminam em recomendação e próxima decisão, não só em números.
- **Financeiro:** saúde e previsibilidade primeiro; detalhe contábil depois.
- **Calendário:** tempo a serviço de ação e follow-up, não só agenda.
- **Radar:** inteligência de mercado priorizada por oportunidade/risco acionável.
- **Tráfego Pago:** desempenho lido como decisão (escalar, pausar, ajustar).
- **Conteúdo IA:** da ideia à publicação multicanal, com a YZI propondo e executando.

---

## 5. Regra mestra de telas

**A tela principal é estratégica; a auditoria técnica é secundária.**

Decisão, recomendação e ação ocupam o foco. Logs, registros de execução e detalhe técnico vivem em drawers/abas sob demanda — nunca como produto nem como protagonista da interface.

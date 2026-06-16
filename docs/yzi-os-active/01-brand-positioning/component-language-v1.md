# YZI OS — Linguagem de Componentes (v1)

> **Deriva de [`DESIGN.md`](./DESIGN.md).** Traduz a autoridade visual em componentes operacionais reutilizáveis para futuras telas, protótipos Pencil e implementação. Fonte ativa.
> **Não é implementação:** sem código, React, CSS, Tailwind, tokens reais, componente, Figma, Pencil/`.pen` ou MCP. Tom prático para IA/dev/designer — não é ensaio nem spec de código.

---

## 1. Propósito

Definir, em linguagem operacional, **cada componente base** do YZI OS: função, quando usar, quando não usar, conteúdo obrigatório, estados, hierarquia, relação com YZI/Radar/autorização e anti-padrões. É a ponte entre o `DESIGN.md` e qualquer protótipo/implementação.

## 2. Regra central

Todo componente precisa ajudar **uma** destas coisas: **entender contexto · enxergar oportunidade · decidir prioridade · preparar ação · autorizar execução · acompanhar resultado.** Se não ajuda nenhuma, **não deve existir**.

## 3. Princípios de composição

- Peso visual proporcional à **importância da decisão**.
- **Ação sempre próxima** da informação.
- **Estado sempre visível.**
- Evidência/rastro **disponível, mas secundário**.
- YZI como **camada de recomendação**, não chatbot.
- Radar como **superfície contínua**, não card isolado.
- Evitar grids homogêneos · evitar texto gigante · evitar gráfico sem próxima ação.

## 4. Component Taxonomy

- **Shell & Navigation:** App Shell.
- **Strategic Blocks:** Command Center Block.
- **Radar & Opportunity:** Radar Surface, Opportunity Card, Territory Map, Signal Badge.
- **Asset Intelligence:** Semantic Search Box, Asset Intake Card.
- **Action & Authorization:** Action Queue, Authorization Panel, YZI Recommendation Panel.
- **Trust & Status:** Status Badge.
- **Financial/Outcome:** Financial/Commission Summary.
- **Secondary/Audit:** Audit Drawer.

## 5. App Shell

- **Função:** moldura do cockpit; sustenta navegação por capacidade, conteúdo e presença da YZI.
- **Quando usar:** sempre — é a base de toda tela do YZI OS.
- **Conteúdo obrigatório:** sidebar por job/resultado, topbar (contexto + busca/comando + créditos), área de conteúdo, dock da YZI.
- **Hierarquia:** discreta — emoldura, não compete.
- **Anti-padrões:** menu administrativo liderado por nomes técnicos; sidebar de admin genérico; topbar poluída.

## 6. Command Center Block

- **Função:** unidade de **estado/decisão** na tela inicial.
- **Quando usar:** para comunicar estado do negócio e a prioridade do dia.
- **Conteúdo obrigatório:** **contexto + leitura (o que isso significa) + próxima ação.**
- **Estados:** com dado · vazio (orienta próxima ação) · processando.
- **YZI/ação:** a leitura é da YZI; a ação fica no próprio bloco.
- **Anti-padrões:** card métrico solto; número sem leitura; mural de métricas.

## 7. Radar Surface

- **Função:** superfície **visual contínua** de território, sinais e oportunidades.
- **Quando usar:** no centro do cockpit (planos com Radar) para decidir **onde agir**.
- **Conteúdo obrigatório:** mapa de território, aquecimento por região, sinais por fonte/força, cards de oportunidade, fila de ações.
- **Estados:** carregando sinais · sem sinais (seed/preview honesto) · ativo.
- **Anti-padrões:** parecer Google Trends; gráfico de tendência solto; tabela de keywords; feed.

## 8. Opportunity Card

- **Função:** **unidade mínima de oportunidade acionável.**
- **Conteúdo obrigatório:** título da oportunidade · por que importa · sinal detectado · ativo interno relacionado · fit · impacto potencial · ação recomendada · autorização necessária · status · rastro resumido.
- **Estados:** `detectada` · `recomendada` · `aguardando autorização` · `executada` · `monitorando` · `bloqueada` · `descartada`.
- **YZI/ação:** a YZI interpreta o sinal; a ação aponta para o módulo de execução.
- **Anti-padrões:** card sem ação recomendada; dado cru; card igual a todos os outros (sem peso por importância).

## 9. Territory Map

- **Função:** visual de **território** — bairros, regiões ou segmentos.
- **Quando usar:** para mostrar onde a demanda/atividade se concentra. Imobiliário: **bairros** (Bessa, Cabo Branco, Manaíra…). Campanha futura: território/pauta/base.
- **Conteúdo obrigatório:** áreas, intensidade (aquecimento), ligação com oportunidades.
- **Anti-padrões:** mapa decorativo; mapa sem relação com decisão/ação.

## 10. Signal Badge

- **Função:** sinal curto com **fonte + força + nível** (V1–V4/seed).
- **Quando usar:** anexado a oportunidade, território ou recomendação.
- **Anti-padrões:** badge decorativa; badge sem significado. **Toda badge precisa explicar algo.**

## 11. Action Queue

- **Função:** fila **priorizada** de ações (recomendadas, rascunhadas, aguardando autorização, executadas).
- **Conteúdo obrigatório por item:** **dono · estado · razão · próximo passo.**
- **Estados:** a fazer · rascunho · aguardando autorização · em execução · feita.
- **YZI/ação:** a YZI prioriza e justifica a ordem.
- **Anti-padrões:** lista de tarefas crua sem prioridade; ação sem razão nem próximo passo.

## 12. Authorization Panel

- **Função:** revisão **humana antes da execução** de ação sensível.
- **Conteúdo obrigatório:** o que será feito · por quê · para quem · risco · impacto esperado · **autorizar / recusar / editar**.
- **Estados:** aguardando autorização · autorizado · recusado · editado.
- **Anti-padrões:** esconder a consequência; autorizar sem mostrar risco/impacto; aprovação em um clique sem contexto.

## 13. YZI Recommendation Panel

- **Função:** presença da YZI como **recomendação + explicação + próxima ação**.
- **Conteúdo obrigatório:** recomendação · justificativa · evidência resumida · próxima ação · autorização necessária.
- **Hierarquia:** presente e discreta (painel/dock), nunca rouba a tela.
- **Anti-padrões:** chat lateral genérico; caixa de conversa solta; recomendação sem ação ou sem porquê.

## 14. Semantic Search Box

- **Função:** **busca operacional** sobre os ativos indexados.
- **Exemplos:** "apartamentos no Bessa até 600 mil" · "leads antigos interessados em praia" · "imóveis parados com boa comissão".
- **Conteúdo obrigatório:** campo de intenção + resultados como ativos entendidos (não arquivos).
- **Anti-padrões:** parecer busca genérica de arquivo/pasta; resultados sem contexto nem próxima ação.

## 15. Asset Intake Card

- **Função:** mostrar **ativo ingerido como material entendido**.
- **Exemplos:** PDF de lançamento · pasta de fotos · planilha de imóveis · conversa/leads.
- **Conteúdo obrigatório:** **status de entendimento · ligação com oportunidades · próximos usos.**
- **Estados:** recebido · indexando · entendido · ligado a oportunidade.
- **Anti-padrões:** mostrar pasta/arquivo bruto; lista de uploads sem significado.

## 16. Status Badge

- **Função:** estado **honesto** do item.
- **Estados:** `preview` · `draft` · `aguardando autorização` · `autorizado` · `executando` · `executado` · `monitorando` · `bloqueado` · `descartado`.
- **Anti-padrões:** status bonito sem consequência; esconder que é seed/preview.

## 17. Financial/Commission Summary

- **Função:** resumo financeiro **ligado a ação**, não painel contábil.
- **Conteúdo obrigatório (imobiliário):** potencial de comissão · imóveis parados · oportunidades por ticket · impacto esperado — **sempre conectado a próxima ação**.
- **Estados:** com dado · sem dado financeiro ainda.
- **Anti-padrões:** relatório contábil detalhado; números sem decisão associada.

## 18. Audit Drawer

- **Função:** **rastro técnico secundário** (nunca protagonista).
- **Conteúdo obrigatório:** fonte · decisão · execução · bloqueio · autorização · trace resumido.
- **Acesso:** sob demanda (drawer/aba).
- **Anti-padrões:** run records como produto; logs na face da tela.

## 19. Layout Patterns

- **Executive Overview:** estado do negócio + próximas ações + recomendações da YZI no topo.
- **Radar Focus:** Radar Surface central — território, sinais e oportunidades para decidir onde agir.
- **Opportunity Detail:** card aberto com evidência, fit, impacto e ação; rastro no drawer.
- **Authorization Flow:** revisão da ação (o quê/porquê/risco/impacto) antes de executar.
- **Asset Intelligence Flow:** ingestão → indexação → busca semântica → ligação com oportunidades.
- **Outcome Review:** resultado da ação + impacto acompanhado + próxima decisão.

## 20. Component Anti-patterns

Card wall · dashboard genérico · tabela protagonista · badge decorativa · gráfico sem ação · drawer técnico como produto · chat lateral como YZI · mapa decorativo · card sem próxima ação · ação sem autorização · oportunidade sem rastro.

## 21. Pencil Readiness

Este documento + o `DESIGN.md` preparam futuros protótipos `.pen`: cada componente já tem função, conteúdo, estados e anti-padrões para guiar o canvas. **Pencil só depois destes dois documentos e antes da implementação.** **Não criar `.pen` agora.**

## 22. Próximo passo recomendado

Criar **depois** (não agora): `docs/yzi-os-active/04-implementation/real-estate-command-center-v1.md` — ou, se decidirmos prototipar antes, `docs/yzi-os-active/04-implementation/real-estate-command-center-pencil-plan-v1.md`. Nada fora de `docs/yzi-os-active/` sem autorização explícita.

# DESIGN.md — Autoridade Visual do YZI OS

> **Leia este arquivo ANTES de criar qualquer tela, protótipo ou componente do YZI OS.**
> Fonte ativa. Consolida [`brand-positioning.md`](./brand-positioning.md), [`brand-dna.md`](./brand-dna.md), [`visual-direction.md`](./visual-direction.md), [`design-system-principles.md`](./design-system-principles.md), [`design-system-foundation-plan-v1.md`](./design-system-foundation-plan-v1.md) e o cockpit de [`../04-implementation/yzihub-command-center-v1.md`](../04-implementation/yzihub-command-center-v1.md), [`../04-implementation/radar-opportunity-card-v1.md`](../04-implementation/radar-opportunity-card-v1.md), [`../04-implementation/real-estate-first-vertical-simulation-v1.md`](../04-implementation/real-estate-first-vertical-simulation-v1.md).
> **Não é implementação:** sem código, CSS, Tailwind, tokens reais, componente, Figma, Pencil/`.pen` ou MCP.

---

## 1. Design Authority

Este arquivo **governa** todas as telas, protótipos, componentes e experiências visuais do YZI OS. Qualquer IA, designer ou desenvolvedor o lê antes de criar UI. Em conflito, este documento e as fontes ativas prevalecem. Formato inspirado no padrão DESIGN.md (getdesign.md) — **sem copiar a estética do Framer**.

## 2. Product Essence

O YZI OS é o **sistema operacional estratégico** da empresa. Núcleo: **decisão + ação contínua**. A interface existe para transformar **contexto + oportunidade + ação** numa experiência clara — o gestor abre e entende o estado do negócio e o que fazer agora, com a YZI presente.

## 3. Visual Personality

Premium · estratégico · escuro · calmo · preciso · vivo · denso de significado (não de ruído) · sem excesso · sem cara de template. Sensação: **cabine de comando que pensa junto**, não "mais uma ferramenta".

## 4. Core UI Principles

- **Decisão antes de métrica.**
- **Oportunidade antes de relatório.**
- **Ação antes de gráfico.**
- **Contexto antes de tabela.**
- **Autorização antes de execução.**
- **Continuidade antes de evento isolado.**
- **Radar como superfície visual contínua.**
- **YZI como presença viva e discreta.**
- **Auditoria técnica secundária.**

## 5. What YZI OS Must Never Look Like

TailAdmin · dashboard SaaS genérico · CRM comum · analytics genérico · card wall · tabela como protagonista · gráfico sem ação · UI técnica como produto · chatbot com painel ao lado · admin template · excesso de badges sem significado · tela cheia de texto. **Se parecer com qualquer um destes, reprovar.**

## 6. Visual System Direction

- **Dark-first**, superfícies profundas (superfície → card → overlay/drawer).
- **Contraste controlado**; **acentos luminosos com parcimônia** (cor = significado, não decoração).
- **Hierarquia forte**: peso visual = importância para a decisão.
- **Blocos com função operacional clara**; **poucos elementos, muito significado.**
- **Estados visíveis e honestos** (carregando, vazio, processando, executado).
- **Microinterações sutis**; **layout respirável, mas não vazio.**

## 7. Layout Philosophy

- **Command Center é o cockpit.**
- Visão executiva (estado do negócio) **no topo**.
- **Radar e oportunidades no centro.**
- **Ações e autorizações sempre próximas** da decisão.
- **Audit drawer sempre secundário.**
- **Módulos aparecem como capacidades** (por job/resultado), não menu técnico.
- **Sem grids de cards iguais** — peso visual conforme importância.

## 8. Core Surfaces

- **Command Center** — estado + próximas ações + recomendações da YZI.
- **Radar Surface** — território, sinais e oportunidades, contínuo e visual.
- **Opportunity Detail** — o card aberto, com evidência e ação.
- **Asset Intake** — ingestão de ativos como material entendido.
- **Semantic Search** — busca operacional sobre os ativos indexados.
- **Action Queue** — fila do que fazer/autorizar/executar.
- **Authorization Review** — aprovação humana de ações sensíveis.
- **YZI Recommendation Panel** — recomendação + porquê + ação.
- **Audit Drawer** — rastro técnico, sob demanda.

## 9. Core Components

- **App Shell** — moldura do cockpit; navegação por capacidade + presença da YZI.
- **Command Center Block** — unidade de estado/decisão na tela inicial.
- **Radar Surface** — superfície contínua de território + sinais + oportunidades.
- **Opportunity Card** — unidade mínima de oportunidade (ver §11).
- **Territory Map** — mapa de bairros/segmentos aquecendo.
- **Signal Badge** — força/fonte do sinal (nível V1–V4/seed).
- **Action Queue** — próximas ações priorizadas, com estado.
- **Authorization Panel** — o que será feito, antes de executar.
- **YZI Recommendation Panel** — autor: YZI; recomendação + justificativa + ação.
- **Semantic Search Box** — busca semântica operacional.
- **Asset Intake Card** — ativo ingerido virando contexto entendido.
- **Status Badge** — estado honesto do item (ver §13).
- **Financial/Commission Summary** — saúde financeira/comissões, ligada à ação.
- **Audit Drawer** — rastro técnico secundário.

## 10. Radar Design Rules

- O Radar **não é Google Trends** nem gráfico solto.
- Deve mostrar **território + sinais + oportunidades + ações**.
- Deve ser **visual contínuo**, não relatório de texto.
- Cada oportunidade precisa de **sinal + fit + impacto + próxima ação**.
- O visual deve ajudar o gestor a **decidir onde agir** — não a "ver tendências".

## 11. Opportunity Card Rules

Cada card mostra: **oportunidade** · **por que importa** · **sinal detectado** · **ativo interno relacionado** · **fit** · **impacto potencial** · **ação recomendada** · **autorização necessária** · **status** · **rastro resumido** (detalhe no drawer). Sem ação recomendada + próxima ação da YZI, não é card — é só dado.

## 12. YZI Presence

- A YZI **não é pop-up** nem **chatbot lateral genérico**.
- Aparece como **camada de recomendação, explicação e próxima ação** (painel/dock persistente e discreto).
- **Discreta, presente, confiável** — nunca rouba a tela.
- Mostra **o que recomenda, por quê** e **o que precisa de autorização**; e o **rastro** do que fez.

## 13. Authorization & Trust

Estados honestos e visíveis: `preview` · `draft` · `aguardando autorização` · `autorizado` · `executando` · `executado` · `monitorando` · `bloqueado` · `descartado`. A interface deixa claro o que é **sugestão**, o que é **rascunho** e o que foi **executado**. Nenhuma ação real sem autorização explícita.

## 14. Asset Intelligence Visual Rules

- Ativos internos **não aparecem como pasta/arquivo bruto** — aparecem como **material entendido**.
- Planilhas, fotos, PDFs, Drive e conversas viram **cards, contexto e busca**.
- A **busca semântica** deve parecer **operacional** ("imóveis parados com boa comissão"), não busca genérica de arquivos.

## 15. Motion & Interaction

Motion **sutil e com propósito**: sinaliza mudança de estado, entrada da YZI e conclusão de ação — nunca decoração. Transições calmas; nada de efeitos chamativos. Microinterações reforçam **confiança e continuidade**.

## 16. Pencil Workflow

Pencil/`.pen` pode ser usado **futuramente** para protótipos visuais — **sempre depois deste `DESIGN.md` e antes da implementação**. Pencil **não** é runtime, **não** é produção e **não** substitui o design system. **Não usar agora.**

## 17. Implementation Guardrails

- Antes de qualquer tela nova, **ler este `DESIGN.md`**.
- Toda tela deve **provar qual decisão, oportunidade ou ação** ela ajuda.
- Nenhum componente existe **só por estética**.
- **Se parecer template → reprovar.** **Se parecer dashboard genérico → reprovar.** **Se a ação não estiver clara → reprovar.**

## 18. Next Step

Próximo documento (criar **depois**, não agora): `yzi-os-design-system-foundation-v1.md` **ou** `component-language-v1.md`, detalhando a linguagem dos componentes base. Nada fora de `docs/yzi-os-active/` sem autorização explícita.

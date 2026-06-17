# Decision: UI Composition Foundation v1

> Fonte ativa. Registra que a fundação de composição visual/UX do YZI OS está
> definida antes de qualquer wireframe, protótipo ou implementação visual.
> **Não é implementação:** sem código, React, CSS, Tailwind, tokens, componente,
> Pencil/`.pen`, Motion, Figma ou MCP.

## 1. Decision

A fundação de composição visual/UX do YZI OS está definida nesta ordem obrigatória:

1. `DESIGN.md`
2. `ui-elements-v1.md`
3. `component-anatomy-v1.md`
4. `screen-composition-rules-v1.md`
5. `surface-patterns-v1.md`

Nenhuma superfície, protótipo ou implementação pode pular essa ordem.

## 2. Binding Statement

- UI_COMPOSITION_FOUNDATION_DEFINED
- NO_SCREEN_BEFORE_UI_ELEMENTS_COMPONENT_ANATOMY_AND_COMPOSITION_RULES
- NO_IMPLEMENTATION_BEFORE_SCREEN_BLUEPRINT
- NO_GENERIC_DASHBOARD_UI
- NO_CARD_WALL_UI
- NO_CRM_CLONE_UI
- YZI_MUST_REMAIN_VISIBLE_AS_ORCHESTRATOR

## 3. What This Decision Allows

Permite apenas os próximos documentos de blueprint visual/conceitual, como:

- blueprint da primeira superfície operacional;
- blueprint do cockpit YZIHUB;
- blueprint de onboarding progressivo;
- mapa de composição por estado;
- especificação visual não executável.

## 4. What This Decision Blocks

Bloqueia:

- implementação visual imediata;
- criação de componentes React;
- CSS/Tailwind;
- Pencil/`.pen`;
- Motion;
- dashboard genérico;
- tela tipo CRM;
- card wall;
- tela métrica-first;
- tela relatório-first;
- novos elementos fora de `ui-elements-v1.md`;
- novos componentes fora de `component-anatomy-v1.md` sem decisão explícita.

## 5. Design Authority Chain

A autoridade visual/UX segue uma cadeia única:

- `DESIGN.md` define a direção geral (essência, personalidade, princípios).
- `ui-elements-v1.md` define os primitivos de UI permitidos.
- `component-anatomy-v1.md` define os componentes permitidos e o que cada um contém.
- `screen-composition-rules-v1.md` define como superfícies podem ser montadas.
- `surface-patterns-v1.md` define os padrões de superfície reutilizáveis.

Qualquer blueprint futuro deve respeitar essa cadeia, sem inventar elementos,
componentes ou padrões fora dela.

## 6. Product Meaning

Esta decisão protege o mantra:

> Não é chatbot.
> Não é CRM.
> Não é dashboard genérico.
> Não é wrapper de LLM.
> A YZI não conversa por conversar. A YZI trabalha.

E protege o núcleo do produto: **decisão + ação contínua**.

## 7. Next Authorized Direction

O próximo passo recomendado é criar um blueprint conceitual da primeira superfície
operacional da YZIHUB, ainda sem implementação:

`docs/yzi-os-active/04-implementation/yzihub-first-operating-surface-blueprint-v1.md`

Esse documento deve ser apenas Markdown — sem código, sem UI real, sem wireframe
final e sem implementação.

## 8. Limits

Este decision record:

- não implementa nada;
- não cria tela;
- não cria CSS;
- não cria React;
- não cria componente;
- não cria `.pen`;
- não instala Motion;
- não cria evidence;
- não cria lane;
- não substitui `DESIGN.md`;
- apenas congela a ordem e a autoridade da fundação visual/UX.

Limites do documento: máximo 120 linhas · Markdown puro · sem YAML · sem JSON ·
sem tabelas grandes · sem código · sem implementação.

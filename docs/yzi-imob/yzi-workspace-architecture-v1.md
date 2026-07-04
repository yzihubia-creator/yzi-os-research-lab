# YZI IMOB — Workspace Architecture v1 (FOUNDATION)

Fundação oficial do frontend do YZI IMOB. Define **como o produto é organizado visualmente** — o casco. Não responde runtime, backend, banco, API, componentes nem React. Toda tela futura nasce desta arquitetura; nenhum wireframe começa antes desta aprovação.

## Entradas LOCKED (não alterar)
Runtime Architecture · Context Builder · Capability Graph · Product Operating Surface · UX Composition · Operating Surface Navigation v2. Este documento inaugura a fase **Product Architecture** e se apoia nelas sem modificá-las.

## 1. Workspace Global
Três regiões permanentes:
```
Sidebar  →  Workspace Principal  →  Inspector Contextual (YZI)
```
- **Sidebar:** navegação por áreas do produto; entrada e orientação.
- **Workspace Principal:** onde o trabalho acontece; a ferramenta ativa ocupa o centro.
- **Inspector Contextual (YZI):** camada da YZI que acompanha o Workspace com leitura, recomendação e aprovação.

Registra responsabilidade de cada região, não desenha layout.

## 2. Sidebar
- É **permanente**; nunca muda de posição; nunca vira dashboard.
- Representa **apenas áreas do produto**.
- Não representa banco, runtime, workflow nem capabilities.

## 3. Workspace Principal
Toda ferramenta vive **dentro de um Workspace**. Não existem páginas genéricas. Cada Workspace resolve **um problema operacional**. Exemplos de uso: Catálogo, Editor, Kanban, Calendário, Timeline, Operating Briefing.

## 4. Inspector
A YZI vive no **Inspector**. Ele: recomenda · explica · resume · aprova · alerta. Nunca é um chat permanente. Nunca compete com o Workspace.

## 5. Tipos oficiais de Workspace
Somente estes existem; nenhum outro surge sem decisão arquitetural:
- Operating Briefing
- Catalog Workspace
- Editor Workspace
- Kanban Workspace
- Calendar Workspace
- Timeline Workspace
- Analytics Workspace

## 6. Linguagem do produto
Categoria: **AI Workspace**. Não é CRM, ERP, Dashboard nem SaaS genérico. Referências conceituais: Creatify, Claude, Linear, Raycast — copiar **princípios**, nunca a interface.

## 7. Princípios visuais
Tipografia dominante · muito espaço negativo · ícones maiores · poucos elementos simultâneos · informação progressiva · um foco por Workspace · estética calma · sem excesso de cards · sem brilho decorativo · sem dashboard tradicional.

## 8. Princípios de navegação
Ordem fixa das áreas:
```
YZI  →  Operação  →  Marketing  →  Inteligência  →  Sistema
```
Os submenus pertencem às **áreas**, nunca à Sidebar principal. Alinhado a `yzi-imob-operating-surface-navigation-v2.md`.

## 9. Papel da YZI
A YZI é entidade operacional, coordenadora e orquestradora. Ela prepara, organiza, recomenda, alerta e aprende. Nunca é apresentada como chatbot; nunca substitui o Workspace.

## Status e próxima fase
Documento **fundacional** do frontend (fase Product Architecture). Próxima fase antes de qualquer wireframe: **YZI Visual Language v1** — identidade visual, tipografia, escala, cores, espaçamentos, ícones, densidade e comportamento dos workspaces. Só depois começam os wireframes, e só então o React.

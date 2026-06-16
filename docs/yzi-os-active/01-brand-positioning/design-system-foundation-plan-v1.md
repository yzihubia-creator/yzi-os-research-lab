# YZI OS — Plano de Fundação do Design System (v1)

**Fonte ativa.** Deriva de [`decision-brand-foundation-v1.md`](../05-decisions/decision-brand-foundation-v1.md), [`brand-positioning.md`](./brand-positioning.md), [`brand-dna.md`](./brand-dna.md), [`visual-direction.md`](./visual-direction.md) e [`design-system-principles.md`](./design-system-principles.md), com o cockpit de [`../04-implementation/yzihub-command-center-v1.md`](../04-implementation/yzihub-command-center-v1.md), [`../04-implementation/radar-opportunity-card-v1.md`](../04-implementation/radar-opportunity-card-v1.md) e [`../04-implementation/real-estate-first-vertical-simulation-v1.md`](../04-implementation/real-estate-first-vertical-simulation-v1.md).

> Plano de arquitetura visual. **Não** implementa: sem código, UI, CSS, Tailwind, tokens reais, componente, Figma, MCP, evidence ou lane. As skills de `.agents/skills/` são lidas como **metodologia**, nunca executadas/instaladas/modificadas.

---

## 1. Decisão

**Nenhuma nova tela estratégica do YZI OS deve ser criada antes de existir uma autoridade visual** — um Design System Foundation consolidado e um `DESIGN.md` próprio. Isso impede telas genéricas e protege o cockpit do anti-padrão TailAdmin/dashboard.

## 2. Objetivo

Criar um plano curto para consolidar o **DNA visual**, os **princípios de UI**, os **componentes base** e o futuro **`DESIGN.md`** do YZI OS, antes de qualquer Command Center de vertical.

## 3. Referência DESIGN.md

`getdesign.md/framer/design-md` é usado **apenas como padrão conceitual**: a ideia de um arquivo único de **autoridade visual para IA**, que orienta estética, componentes, linguagem e comportamento de UI para a IA não gerar telas genéricas. **Não copiar** o design, a estética nem o produto do Framer.

## 4. Inventário das skills

- **Marca / DNA:** `ckm:brand` (voz, identidade, style guides), `ckm:design` (identidade + tokens de marca).
- **Design System:** `ckm:design-system` (tokens em 3 camadas primitive→semantic→component, specs de componente), `ui-ux-pro-max` (sistemas de cor, tipografia, 99 diretrizes de UX — metodologia).
- **UI / Cockpit:** `impeccable` (app shell, dashboards, componentes, empty states, hierarquia, tokens), `emilkowalski-design` (polish, detalhe invisível, decisão de componente).
- **Motion / apresentação (não agora):** `emilkowalski-design` (filosofia de animação), `ckm:slides`, `ckm:banner-design`, `human-image`, `remotion-best-practices`.
- **Técnica / fora de escopo agora:** `ckm:ui-styling` (shadcn/Tailwind — só na etapa de implementação), `supabase`, `supabase-postgres-best-practices`.

## 5. Como cada grupo será usado

- **Marca / DNA** valida e completa `brand-dna.md`/`visual-direction.md` — entra no topo do `DESIGN.md` (essência, tom, sensações desejadas/proibidas).
- **Design System** dá o método de tokens (camadas, escalas de cor/tipografia/espaço) para os **tokens conceituais** de `design-system-principles.md`, sem virar código.
- **UI / Cockpit** orienta hierarquia, estados e craft dos componentes base — referência de qualidade, não biblioteca.
- **Motion / apresentação** fica reservado para depois (motion discreto sinaliza estado/entrada da YZI; slides/banner/imagem são para marketing, não para o cockpit).
- **Técnica** só na etapa de implementação em `platform/` — fora deste plano.

## 6. Princípios visuais do YZI OS

Consolidados das fontes ativas:
- **Cockpit estratégico**, não dashboard genérico.
- **Decisão antes de métrica**; **oportunidade antes de relatório**; **ação antes de gráfico**.
- **YZI como presença viva e discreta** (painel/dock, nunca pop-up).
- **Radar como superfície visual contínua**, não gráfico/Trends.
- **Auditoria técnica secundária** (drawer), nunca protagonista.
- **Premium, escuro, calmo, preciso.**
- **Densidade com hierarquia** (muito valor, pouco ruído).
- **Estado é cidadão de primeira classe** (carregando, vazio, executado).
- **Nada de TailAdmin** nem template de admin genérico.

## 7. Componentes base a definir depois

Antes do Real Estate Command Center: App Shell · Command Center Block · Radar Surface · Opportunity Card · Territory Map · Signal Badge · Action Queue · Authorization Panel · YZI Recommendation Panel · Semantic Search Box · Asset Intake Card · Status Badge · Financial/Commission Summary · Audit Drawer.

## 8. Entregáveis de design system (sequência)

A. **`design-system-foundation-plan-v1.md`** — este documento.
B. **`DESIGN.md`** — autoridade visual única do YZI OS para a IA.
C. **`component-language-v1.md`** (ou `yzi-os-design-system-foundation-v1.md`) — linguagem dos componentes base.
D. **`real-estate-command-center-v1.md`** — primeira tela de vertical, já sob a autoridade visual.
E. **Só então** implementação em `platform/` (tokens reais, componentes, código).

## 9. O que NÃO fazer

- Não desenhar tela antes do `DESIGN.md`.
- Não copiar Framer; não copiar TailAdmin; não criar dashboard genérico.
- Não transformar o Radar em gráfico/texto gigante.
- Não usar UI bonita sem função operacional.
- Não criar biblioteca de componentes em código agora.
- Não mexer no sistema atual (`platform/`, Café com Pam).

## 10. Próximo passo recomendado

Criar **depois** (não agora): `docs/yzi-os-active/01-brand-positioning/DESIGN.md`, a autoridade visual única do YZI OS. Nada fora de `docs/yzi-os-active/` sem autorização explícita.

# YZI OS — Plano de Fundação do Design System + Workflow Pencil (v1)

**Fonte ativa.** Deriva de [`decision-brand-foundation-v1.md`](../05-decisions/decision-brand-foundation-v1.md), [`brand-positioning.md`](./brand-positioning.md), [`brand-dna.md`](./brand-dna.md), [`visual-direction.md`](./visual-direction.md) e [`design-system-principles.md`](./design-system-principles.md), com o cockpit de [`../04-implementation/yzihub-command-center-v1.md`](../04-implementation/yzihub-command-center-v1.md), [`../04-implementation/radar-opportunity-card-v1.md`](../04-implementation/radar-opportunity-card-v1.md) e [`../04-implementation/real-estate-first-vertical-simulation-v1.md`](../04-implementation/real-estate-first-vertical-simulation-v1.md).

> Plano de arquitetura visual. **Não** implementa: sem código, UI, CSS, Tailwind, tokens reais, componente, Figma, MCP, evidence ou lane. As skills de `.agents/skills/` são lidas como **metodologia**, nunca executadas/instaladas/modificadas. **Pencil** entra apenas como workflow futuro — não instalado, não rodado, sem `.pen` agora.

---

## 1. Decisão

**Nenhuma nova tela estratégica do YZI OS deve ser criada antes de existir:**
- o **`DESIGN.md`** do YZI OS (autoridade visual única);
- uma **linguagem mínima de componentes**;
- e, **opcionalmente**, um **protótipo visual validado em Pencil/`.pen`** antes da implementação.

Isso impede telas genéricas e protege o cockpit do anti-padrão TailAdmin/dashboard.

## 2. Objetivo

Consolidar o **DNA visual**, os **princípios de UI**, os **componentes base**, o futuro **`DESIGN.md`** e um **workflow opcional de Pencil** — antes de qualquer Command Center de vertical.

## 3. Referências conceituais

- **`getdesign.md/framer/design-md`** — inspira o **formato `DESIGN.md`** como arquivo único de autoridade visual para IA (estética, componentes, linguagem, comportamento de UI), para a IA não gerar telas genéricas.
- **Pencil CLI** (`docs.pencil.dev`) — inspira um fluxo de **prototipagem visual versionada em arquivos `.pen`**, para explorar telas antes de codar.
- **Nenhuma das duas deve ser copiada esteticamente.** Não copiar Framer; não transformar o YZI OS em Framer; não tornar Pencil dependência de runtime/produção.

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
- **Nada de TailAdmin** nem template de admin genérico.
- **Nada de card wall genérico** — peso visual conforme a importância.

## 7. Componentes base a definir depois

Antes do Real Estate Command Center: App Shell · Command Center Block · Radar Surface · Opportunity Card · Territory Map · Signal Badge · Action Queue · Authorization Panel · YZI Recommendation Panel · Semantic Search Box · Asset Intake Card · Status Badge · Financial/Commission Summary · Audit Drawer.

## 8. Workflow Pencil futuro

Pencil é definido como:
- **ferramenta opcional de prototipagem visual** (canvas versionado em `.pen`);
- usado para explorar **Command Center, Radar Surface e Opportunity Cards** antes de codar;
- **etapa entre o `DESIGN.md` e a implementação** em `platform/`.

Pencil **NÃO** é: runtime do YZI OS · dependência de produção · substituto do design system · implementação final.

**Workflow sugerido (futuro):**
A. Criar `DESIGN.md`.
B. Criar a linguagem de componentes.
C. Criar protótipo visual em `.pen`, **se fizer sentido**.
D. Validar visualmente o protótipo contra os princípios.
E. **Só depois** implementar em `platform/`.

## 9. Entregáveis de design system (sequência)

A. **`design-system-foundation-plan-v1.md`** — este documento.
B. **`DESIGN.md`** — autoridade visual única do YZI OS para a IA.
C. **`yzi-os-design-system-foundation-v1.md`** (ou `component-language-v1.md`) — linguagem dos componentes base.
D. **Protótipo Pencil/`.pen` opcional** — validação visual antes de codar.
E. **`real-estate-command-center-v1.md`** — primeira tela de vertical, já sob a autoridade visual.
F. **Implementação em `platform/`** (tokens reais, componentes, código).

## 10. O que NÃO fazer

- Não desenhar tela antes do `DESIGN.md`.
- Não usar Pencil antes da autoridade visual; não gerar `.pen` agora; não instalar Pencil agora.
- Não copiar Framer; não copiar TailAdmin; não criar dashboard genérico.
- Não transformar o Radar em gráfico/texto gigante.
- Não usar UI bonita sem função operacional.
- Não criar biblioteca de componentes em código agora.
- Não mexer no sistema atual (`platform/`, Café com Pam).

## 11. Próximo passo recomendado

Criar **depois** (não agora): `docs/yzi-os-active/01-brand-positioning/DESIGN.md`, a autoridade visual única do YZI OS. Nada fora de `docs/yzi-os-active/` sem autorização explícita.

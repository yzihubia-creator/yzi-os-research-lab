# Decisão — Fundação de Marca do YZI OS (v1)

**Data:** 2026-06-15
**Status:** Ativa
**Escopo:** Marca, posicionamento, direção visual e princípios de design system.

---

## 1. Decisão tomada

Estabelecer a fundação de marca e produto do YZI OS dentro da árvore ativa `docs/yzi-os-active/01-brand-positioning/`, composta por:

- [`brand-positioning.md`](../01-brand-positioning/brand-positioning.md)
- [`brand-dna.md`](../01-brand-positioning/brand-dna.md)
- [`visual-direction.md`](../01-brand-positioning/visual-direction.md)
- [`design-system-principles.md`](../01-brand-positioning/design-system-principles.md)

A categoria oficial é **sistema operacional estratégico com IA viva**, com núcleo **decisão + ação contínua**.

---

## 2. Por que foi necessária

O projeto foi recentralizado em `docs/yzi-os-active/`. Faltava uma autoridade clara de marca, posicionamento e estética. Sem ela, o produto corria risco de ser arrastado de volta para CRM, dashboard, painel técnico, "run records" como produto, estética TailAdmin ou identidade de uma vertical de cliente (Jurema, etc.). Esta decisão fixa o que o YZI OS é e como ele se apresenta.

---

## 3. O que passa a ser autoridade

- A definição de categoria, posicionamento e tese em `brand-positioning.md`.
- A essência, valores, tom e frase-mãe em `brand-dna.md`.
- A direção estética e os princípios de interface em `visual-direction.md`.
- Os princípios e tokens conceituais de design system em `design-system-principles.md`.

Esses documentos orientam produto, interface, site, pitch e implementação futura.

---

## 4. O que fica proibido

- Posicionar o YZI OS como CRM, dashboard, lead manager, chatbot ou wrapper de LLM.
- Usar "sistema cognitivo multi-tenant" como pitch principal.
- Tratar "run records" ou auditoria técnica como produto/protagonista.
- Adotar estética TailAdmin ou template de admin genérico.
- Usar Jurema / YZI IMOB / Café com Pam / campanha política como identidade do core.
- Prometer capacidade técnica inexistente como já pronta.
- Ressuscitar a documentação histórica (`docs/specs/`, lanes, evidences, governance, packs) como autoridade do produto.

---

## 5. Próximos documentos permitidos

Dentro de `docs/yzi-os-active/`, derivados desta fundação:

- `02-modules/` — detalhamento de capacidades (módulos) coerente com o posicionamento.
- `01-brand-positioning/` — eventual `messaging.md` ou `naming.md` se necessário.
- Especificação de tokens reais e biblioteca de componentes (quando a implementação do design system começar).

Nada fora desta árvore sem autorização explícita.

---

## 6. Como esta decisão protege o projeto

Cria uma autoridade única e curta de marca, separando **visão futura** de **produto atual** e impedindo que a bagunça anterior (legado documental, estética genérica, verticais de cliente) volte a definir o núcleo. A árvore ativa não acumula legado; tudo que não servir à definição central fica em estudos/histórico.

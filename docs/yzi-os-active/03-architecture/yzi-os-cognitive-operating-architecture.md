# YZI OS — Arquitetura Cognitiva de Operação

**Fonte ativa.** Arquitetura-mãe que consolida os estudos da base em camadas do produto. Alinhado a [`../00-product/product-definition.md`](../00-product/product-definition.md), [`agents-and-skills-operating-model.md`](./agents-and-skills-operating-model.md) e [`ai-first-tenant-activation-flow.md`](./ai-first-tenant-activation-flow.md).

> Arquitetura, não ensaio. **Não** define schema, UI, código, SQL nem MCP. Os papers são **fonte de arquitetura, não de produto** — traduzidos, nunca copiados. Os papers de harness tratam de *engenharia de software*; aqui o harness opera **o negócio**, não código.

---

## 1. Tese

O YZI OS é um **sistema operacional cognitivo de negócio**: um **harness runtime** que compila contexto do tenant, aplica intenção e especificação, opera agentes/skills sobre tools autorizadas, registra rastro, aprende com memória reflexiva e converte sinais de mercado em **decisão + ação contínua** — expondo ao gestor **apenas o Command Center**.

> Quem controla o contexto controla o comportamento; quem controla a intenção controla a estratégia; quem controla a especificação controla a escala.

---

## 2. As camadas (a pilha)

| # | Camada | Paper que informa | Visível? |
|---|---|---|---|
| 1 | **Business Context** — compila o contexto completo do tenant (perfil, carteira, território, leads, financeiro, histórico) | Context Engineering | invisível |
| 2 | **Intent** — metas e trade-offs estratégicos do tenant ("o que importa agora") | Intent Engineering | semi (vira prioridade) |
| 3 | **Specification / Policy** — políticas, permissões, limites de orçamento e guardrails legíveis por máquina | Specification + Harness (governança) | invisível |
| 4 | **Harness Runtime** — o motor: seleciona contexto, dá acesso a tools, mantém estado, aplica permissão, verifica e registra intervenção | AI Harness Runtime | invisível |
| 5 | **Agents + Skills** — YZI Orchestrator + Radar/Execution/Continuity + catálogo de skills | (doc próprio) | invisível (motor) |
| 6 | **Tools / Integração** — canais e fontes externas autorizadas | — | invisível (vira ação) |
| 7 | **Observability / Trace** — episode package: ação, tool, contexto, verificação, autorização, resultado | Harness Runtime + AHE (3 pilares como disciplina) | secundária (audit drawer) |
| 8 | **Reflective Memory** — o que a YZI aprende de leads, bairros, campanhas, decisões e resultados | Reflective Memory (RMM) | invisível (vira continuidade) |
| 9 | **Growth / Radar Intelligence** — sinais → oportunidades priorizadas + experimentos | Growth Engine + Radar | visível (cards) |
| 10 | **Command Center Surface** — a única camada plenamente visível | (doc próprio) | **visível** |

**Regra de ouro:** o gestor só vê a camada 10 (e os cards da 9). Tudo de 1 a 8 trabalha por baixo. Decisão acima de exibição.

---

## 3. Visível × invisível

- **Visível:** Command Center · Radar Opportunity Cards · recomendações da YZI · próximas ações · ações aguardando autorização · resultados · continuidade (memória sentida, não exibida).
- **Invisível (runtime):** harness · contexto compilado · intent/policies · tool registry · trace/verificação · memória reflexiva · routing de agentes.

---

## 4. Harness Runtime — mínimo viável

Das 11 responsabilidades do paper de runtime, o **V1** fixa só seis: **seleção de contexto · tool registry · permissões · estado de tarefa · trace · autorização (verificação-leve).** Ficam para **V2/V3**: failure attribution, verificação estruturada, entropy/policy auditing automático. O harness é o que diferencia o YZI OS de "prompt + agent framework": ele **media e audita** toda ação, não só chama o modelo.

---

## 5. Memória reflexiva — taxonomia

Quatro coisas distintas (não confundir):
- **Histórico** = log bruto do que aconteceu (fonte, não memória).
- **Contexto** = o que é compilado para a decisão de agora (efêmero).
- **Memória operacional** = estado vivo do tenant (carteira, leads, agenda).
- **Memória reflexiva** = aprendizado destilado (RMM): *prospectiva* (resume interações por tópico — bairro, lead, campanha) e *retrospectiva* (refina o que recuperar com base no que funcionou).

**Deve ser memória:** decisões e por quê, resultado de campanhas/abordagens, preferências do tenant, padrões de lead/bairro. **Não deve:** conversa crua inteira, dado pessoal sem propósito, tudo "por garantia". Memória inútil polui o contexto; memória perigosa retém o que não devia.

---

## 6. Agentic evolution — postura

**Não construir agora.** O paper de auto-evolução é para harness de código e exige escala de trajetórias que o produto ainda não tem. Aproveitar **só como disciplina de observabilidade** (componente, experiência, decisão) no Trace Layer — toda ação da YZI como **contrato verificável**. Proibido: harness que se reescreve sozinho antes do produto existir.

---

## 7. Growth — postura (Austin Lau)

Antes de mídia paga: **dados primeiro**. O Radar existe exatamente para evitar achismo — sinal → intenção → fit → ação, com medição. Sequência: canais de longo prazo (SEO/silos, conteúdo, parcerias, "do things that don't scale") antes de performance; tráfego pago entra quando há medição e oferta que converte. Growth é máquina contínua de experimentos, não orçamento de anúncio.

---

## 8. O que se fixa agora × o que fica conceitual

- **Fixado agora (esta doc):** a pilha de 10 camadas, o corte visível/invisível, o mínimo do harness (§4) e a taxonomia de memória (§5).
- **Conceitual por enquanto:** auto-evolução (§6), verificação automática estruturada, entropy auditing.
- **Não documentar agora:** schemas de memória, implementação do harness, specs por skill — viram etapa própria quando a implementação começar.

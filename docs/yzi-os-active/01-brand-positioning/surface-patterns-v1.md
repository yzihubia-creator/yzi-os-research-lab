# YZI OS — Surface Patterns (v1)

> **Deriva de [`DESIGN.md`](./DESIGN.md), [`component-language-v1.md`](./component-language-v1.md) e [`motion-language-v1.md`](./motion-language-v1.md).** Define os padrões de superfície reutilizáveis do YZI OS para orientar futuras telas, protótipos Pencil e implementação. Fica entre a linguagem de componentes e qualquer Command Center de vertical. Fonte ativa.
> **Não é implementação:** sem código, CSS, Tailwind, tokens reais, componente, Pencil/`.pen`, Figma ou MCP. Não é wireframe nem tela — é padrão operacional.

---

## 1. Propósito

**Surface patterns são templates operacionais, não templates visuais genéricos.** Cada um descreve como transformar contexto em decisão e ação, reutilizando os componentes base. Cada pattern responde: para que serve · quando usar · quando não usar · componentes · decisão/ação que ajuda · estrutura mínima · motion esperado · anti-padrões.

## 2. Regra central

Todo surface pattern precisa orientar **uma decisão, oportunidade, ação, autorização ou resultado**. Se for só composição bonita, **não deve existir**.

## 3. Template genérico × Surface pattern YZI OS

- **Template genérico:** layout reaproveitável (uma forma).
- **Surface pattern YZI OS:** **estrutura operacional** para transformar contexto em decisão e ação (uma função). A forma serve à função, nunca o contrário.

## 4. Princípios de uso

Começar por estado/decisão · ação próxima da informação · Radar e YZI integrados · autorização clara · rastro secundário · motion para estado, não decoração · sem grid homogêneo · sem tela cheia de texto · sem gráfico sem ação.

## 5. Pattern 1 — Executive Overview

- **Função:** abrir o cockpit com estado do negócio, leitura da YZI e prioridades.
- **Quando usar:** início do Command Center. **Quando não usar:** para detalhe de um item (use Opportunity Detail).
- **Componentes:** App Shell · Command Center Block · YZI Recommendation Panel · Action Queue · Status Badge · Financial/Commission Summary.
- **Estrutura mínima:** estado do negócio · leitura da YZI · prioridades · próximas ações · alerta relevante · resultado/impacto resumido.
- **Motion:** entrada calma; destaque sutil para mudança de estado ou alerta.
- **Anti-padrões:** mural de métricas · dashboard executivo genérico · números sem ação.

## 6. Pattern 2 — Radar Focus

- **Função:** mostrar **onde agir**.
- **Quando usar:** foco em território, demanda, sinais, oportunidades e ação comercial. **Quando não usar:** quando não há sinais/território (mostre estado honesto).
- **Componentes:** Radar Surface · Territory Map · Opportunity Card · Signal Badge · Action Queue · YZI Recommendation Panel.
- **Estrutura mínima:** território/segmento · sinais · aquecimento · oportunidades priorizadas · próxima ação recomendada · fila de autorização/execução.
- **Motion:** sinais novos, aquecimento territorial e cards emergindo com sutileza.
- **Anti-padrões:** Google Trends · mapa decorativo · gráfico solto · feed de tendências.

## 7. Pattern 3 — Opportunity Detail

- **Função:** abrir uma oportunidade com evidência, fit, impacto e ação.
- **Quando usar:** quando o gestor precisa decidir **se age ou não**. **Quando não usar:** para visão geral (use Executive Overview/Radar Focus).
- **Componentes:** Opportunity Card expandido · Signal Badge · Asset Intake Card · YZI Recommendation Panel · Authorization Panel · Audit Drawer.
- **Estrutura mínima:** oportunidade · por que importa · sinal · ativo interno relacionado · fit · impacto · ação recomendada · autorização · rastro resumido.
- **Motion:** expansão clara do card; mudança de estado legível.
- **Anti-padrões:** detalhe sem ação · dado cru · justificativa escondida.

## 8. Pattern 4 — Authorization Flow

- **Função:** revisão **humana antes da execução**.
- **Quando usar:** antes de enviar mensagem, criar campanha, executar ação externa, alterar dado sensível ou acionar ferramenta. **Quando não usar:** ações read-only.
- **Componentes:** Authorization Panel · YZI Recommendation Panel · Action Queue · Status Badge · Audit Drawer.
- **Estrutura mínima:** o que será feito · por quê · para quem · risco · impacto esperado · editar/autorizar/recusar · rastro.
- **Motion:** estável, deliberado, sem induzir clique.
- **Anti-padrões:** aprovação rápida sem contexto · botão chamativo demais · esconder consequência.

## 9. Pattern 5 — Asset Intelligence Flow

- **Função:** mostrar ativos sendo ingeridos, entendidos e conectados a oportunidades.
- **Quando usar:** onboarding, importação, busca semântica, organização de ativos. **Quando não usar:** decisão comercial pronta (use Radar Focus).
- **Componentes:** Asset Intake Card · Semantic Search Box · Signal Badge · Opportunity Card · YZI Recommendation Panel · Status Badge.
- **Estrutura mínima:** ativos recebidos · status de entendimento · agrupamentos semânticos · buscas possíveis · oportunidades relacionadas · próximos usos.
- **Motion:** `indexando → entendido → ligado a oportunidade`, com progresso honesto.
- **Anti-padrões:** lista de arquivos · pasta bruta · upload sem significado · loading genérico eterno.

## 10. Pattern 6 — Outcome Review

- **Função:** mostrar resultado de ação executada e a próxima decisão.
- **Quando usar:** após campanha, follow-up, autorização executada, ação comercial ou recomendação aplicada. **Quando não usar:** antes de qualquer execução.
- **Componentes:** Financial/Commission Summary · Command Center Block · Opportunity Card · Action Queue · YZI Recommendation Panel · Audit Drawer.
- **Estrutura mínima:** ação executada · resultado observado · impacto · comparação com expectativa · recomendação da YZI · próxima ação · rastro.
- **Motion:** resultado entrando em monitoramento; transição calma para a próxima decisão.
- **Anti-padrões:** relatório morto · gráfico sem decisão · comemoração visual exagerada.

## 11. Pattern 7 — Alert & Interruption

- **Função:** mostrar alerta, bloqueio, risco ou oportunidade urgente **sem quebrar o cockpit**.
- **Quando usar:** alerta crítico, bloqueio de execução, oportunidade com timing curto, autorização pendente sensível. **Quando não usar:** informação não urgente.
- **Componentes:** Status Badge · YZI Recommendation Panel · Authorization Panel · Action Queue · Audit Drawer.
- **Estrutura mínima:** tipo de alerta · urgência · causa · consequência · ação recomendada · autorizar/ignorar/adiar · rastro.
- **Motion:** atenção controlada por nível; crítico chama atenção **sem parecer bug**.
- **Anti-padrões:** alerta vermelho genérico · modal agressivo · interrupção sem ação.

## 12. Pattern 8 — Semantic Search & Discovery

- **Função:** consultar ativos e oportunidades em **linguagem natural**.
- **Quando usar:** busca operacional, exploração de ativos, descoberta de oportunidades internas. **Quando não usar:** como busca de arquivo/pasta.
- **Componentes:** Semantic Search Box · Asset Intake Card · Opportunity Card · Signal Badge · YZI Recommendation Panel.
- **Estrutura mínima:** intenção de busca · resultados entendidos · agrupamentos · oportunidade relacionada · próxima ação.
- **Motion:** resultado entra como raciocínio contínuo, não loading genérico.
- **Anti-padrões:** busca de arquivo comum · lista de links · resultado sem contexto.

## 13. Relação entre patterns

Fluxo comum: **Executive Overview → Radar Focus → Opportunity Detail → Authorization Flow → Outcome Review.** O **Asset Intelligence Flow** alimenta o Radar Focus (ativos entendidos viram contexto de oportunidade). **Semantic Search & Discovery** atravessa todos. **Alert & Interruption** pode interromper qualquer pattern — sempre com cuidado e com ação clara.

## 14. Uso em verticais

- **Imobiliário (atual):** os patterns aparecem como território, bairros, imóveis, leads, captação e comissão.
- **Campanha política (futura):** território, pauta, base, agenda, narrativa e ação de campo.
- **Café com Pam (futura):** fotos, briefings, referências, leads, orçamentos e consultoria.

Os patterns são **horizontais**; a vertical é contexto. **Não criar essas verticais agora.**

## 15. Pencil Readiness

Estes patterns são a **base para protótipos Pencil/`.pen`**: cada um já traz estrutura, componentes, estados e motion esperado. Um `.pen` pode representar composição, estados e notas de motion. **Não criar `.pen` agora.**

## 16. Implementation Guardrails

- Qualquer nova tela precisa **escolher um ou mais surface patterns**.
- Se a tela **não se encaixa** em pattern, **justificar**.
- Nenhum pattern pode virar **template visual genérico**.
- Nenhum pattern deve esconder **ação/autorização/rastro**.
- **Se parecer dashboard → reprovar.**

## 17. Próximo passo recomendado

Criar **depois** (não agora): `docs/yzi-os-active/04-implementation/real-estate-command-center-v1.md` — ou, se prototiparmos antes, `docs/yzi-os-active/04-implementation/real-estate-command-center-pencil-plan-v1.md`. Nada fora de `docs/yzi-os-active/` sem autorização explícita.

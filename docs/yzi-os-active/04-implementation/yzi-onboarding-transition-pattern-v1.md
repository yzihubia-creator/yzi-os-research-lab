# YZI OS — Pattern de Transição do Onboarding: Chat → Sistema → Command Center (v1)

> **Deriva de [`DESIGN.md`](../01-brand-positioning/DESIGN.md), [`component-language-v1.md`](../01-brand-positioning/component-language-v1.md), [`motion-language-v1.md`](../01-brand-positioning/motion-language-v1.md), [`surface-patterns-v1.md`](../01-brand-positioning/surface-patterns-v1.md) e [`../03-architecture/client-onboarding-orchestration-v1.md`](../03-architecture/client-onboarding-orchestration-v1.md).** Também alinhado a [`yzihub-command-center-v1.md`](./yzihub-command-center-v1.md), [`../03-architecture/ai-first-tenant-activation-flow.md`](../03-architecture/ai-first-tenant-activation-flow.md) e [`../05-decisions/decision-yzihub-first-operating-tenant-v1.md`](../05-decisions/decision-yzihub-first-operating-tenant-v1.md). Fonte ativa.
> **Não é implementação:** sem código, React, CSS, Tailwind, tokens reais, componente, Pencil/`.pen`, Motion instalado, MCP, schema, SQL, wireframe nem tela final. Tom prático para IA/dev/designer. A vertical (quando citada) é só contexto; o pattern é horizontal.

---

## 1. Propósito

Definir o **pattern de experiência da primeira ativação** do YZI OS: o momento em que a conversa com a YZI se transforma visualmente em sistema operacional. Transforma a arquitetura de onboarding (`client-onboarding-orchestration-v1.md`) em um pattern de experiência **reutilizável para qualquer tenant**.

## 2. Decisão de experiência

- O YZI OS **começa pela YZI**, não por dashboard, formulário nem menu técnico.
- A **conversa vira sistema**.
- A **YZI permanece como orquestradora visível** (única face), antes e depois da montagem.

## 3. Estados da experiência

A. **Minimal YZI Chat** — B. **Diagnostic Conversation** — C. **Analysis / Assembly State** — D. **Chat-to-Dock Transition** — E. **Command Center Emergence** — F. **Stable Operating Cockpit**. A sequência roda uma vez na ativação; depois, o cockpit opera no estado F.

## 4. Estado A — Minimal YZI Chat

Tela minimalista, **foco total na conversa**. Sensação premium, calma e estratégica (`visual-direction.md` §1). Sem menu técnico, sem cards vazios, sem dashboard. A YZI recebe o cliente e diz que **vai montar o sistema** — *"vamos montar seu sistema"*. Superfície: **Minimal Chat Surface**.

## 5. Estado B — Diagnostic Conversation

A YZI coleta, em conversa: tipo de operação · objetivo · canais · ativos · território/segmentos · prioridades · restrições · permissões · integrações · plano inicial. Skills read-only `extract-business-profile`, `classify-operator-type`, `map-territory-focus`, `recommend-plan`.

> A conversa **não é papo. É diagnóstico operacional.** A YZI trabalha, não conversa (`product-definition.md` §4).

## 6. Estado C — Analysis / Assembly State

A YZI **resume o que entendeu**, pede **confirmação** e inicia a análise, mostrando **estado honesto de montagem** — sem fingir processamento mágico, com etapas compreensíveis (`visual-direction.md` §12). Exemplos de mensagens:

- "Estou organizando seus canais."
- "Estou identificando ativos úteis."
- "Estou preparando seu Command Center inicial."
- "Vou destacar prioridades e ações sugeridas."

## 7. Estado D — Chat-to-Dock Transition

O chat principal **recolhe para a lateral/dock** (dock da YZI), que continua acessível. A YZI **não desaparece**: deixa de ocupar o centro e passa a **acompanhar o sistema**. Este motion é a **transição simbólica** — conversa virando operação.

## 8. Estado E — Command Center Emergence

Os **blocos surgem progressivamente**, na ordem sugerida:

1. estado da operação — 2. leitura inicial da YZI — 3. canais conectados/pendentes — 4. ativos detectados — 5. prioridades — 6. oportunidades iniciais — 7. próximas ações — 8. autorizações pendentes — 9. lacunas — 10. rastro secundário (Audit Drawer).

> **Não mostrar bloco vazio sem leitura.** Estado vazio orienta a próxima ação (`yzihub-command-center-v1.md` §4; `visual-direction.md` §12).

## 9. Estado F — Stable Operating Cockpit

Command Center pronto; **YZI lateral/discreta**. O gestor aprova, edita, recusa e debate; os **canais alimentam a base**; a YZI ajusta o sistema. O **motion passa a ser sutil e funcional** (§11).

## 10. Motion da transição inicial

Motion **mais perceptível apenas na primeira montagem** (`motion-language-v1.md` §14): o chat recolhe com calma, os blocos emergem **sem espetáculo**, cada mudança de estado é **legível**. **Nada** de parallax, bounce, efeito gamer ou brilho gratuito (`motion-language-v1.md` §3, §19).

## 11. Motion depois da montagem

Depois da primeira montagem, motion **só para**: hover · clique · seleção · mudança de coluna · drawer · autorização · alerta · mudança real de estado · item novo · resultado entrando em monitoramento (`motion-language-v1.md` §5). Toda animação termina; nada chama atenção eternamente.

## 12. Componentes envolvidos

Minimal Chat Surface · App Shell · YZI Recommendation Panel / Dock · Command Center Block · Asset Intake Card · Radar Surface · Opportunity Card · Action Queue · Authorization Panel · Status Badge · Audit Drawer (`component-language-v1.md` §4).

## 13. Surface patterns usados

- **Minimal Chat Surface** — ativação inicial (estados A–C).
- **Executive Overview** (`surface-patterns-v1.md` §5) — Command Center inicial.
- **Asset Intelligence Flow** (§9) — ativos detectados/ingeridos.
- **Radar Focus** (§6) — quando houver sinais.
- **Authorization Flow** (§8) — ações sensíveis.
- **Alert & Interruption** (§11) — bloqueios.
- **Outcome Review** (§10) — depois de ações executadas.

## 14. Papel da YZI

Recebe · diagnostica · resume · confirma · analisa · monta · recomenda · pede autorização · acompanha · ajusta. Mostra **o que vai fazer antes** e **o que fez depois** (`DESIGN.md` §12).

> A **YZI é face única.** Os agentes internos (Radar, Execution, Continuity, skills) **não aparecem** (`agents-and-skills-operating-model.md` §5; `decision-yzihub-first-operating-tenant-v1.md` §9–10).

## 15. Canais como entrada real

O onboarding **não cria fluxo de cadastro manual de lead**. Os **canais alimentam a base** (site, landing pages, WhatsApp, Instagram, formulários, campanhas, indicação rastreada, integrações autorizadas). O gestor **governa pela YZI**. **Não virar CRM manual** (`decision-yzihub-first-operating-tenant-v1.md` §6–8).

## 16. Regras de confiança

Estados **honestos** e visíveis (`DESIGN.md` §13): mostrar quando é `seed`, `preview` ou `draft`; não fingir dado inexistente; indicar canal **conectado/pendente**; indicar ativo **detectado/pendente**; indicar ação **sugerida/autorizada/executada**. Rastro técnico no **Audit Drawer**, nunca na face principal.

## 17. O que NÃO fazer

Abrir dashboard vazio · mostrar formulário gigante · expor múltiplos agentes · esconder a YZI depois da montagem · criar animação decorativa · fingir integração de canal não conectado · criar blocos falsos · permitir cadastro manual como fluxo principal · criar CRM manual · implementar agora.

## 18. Relação com YZIHUB primeiro tenant

A primeira aplicação real deste pattern será a **YZIHUB usando o YZI OS para vender o YZI OS** (`decision-yzihub-first-operating-tenant-v1.md` §1). O pattern **permanece horizontal** para qualquer tenant — a vertical é contexto, nunca identidade do core.

## 19. Pencil Readiness

Este documento pode orientar um futuro protótipo Pencil/`.pen` da transição, representando: estado inicial · chat recolhendo · blocos surgindo · dock da YZI · notas de motion. Pencil só **depois** do `DESIGN.md` e antes da implementação. **Não criar `.pen` agora.**

## 20. Próximo passo recomendado

Criar **depois** (não agora): `docs/yzi-os-active/04-implementation/yzihub-self-selling-operating-loop-v1.md` **ou** `docs/yzi-os-active/04-implementation/yzi-onboarding-transition-pencil-plan-v1.md`. Nada fora de `docs/yzi-os-active/` sem autorização explícita.

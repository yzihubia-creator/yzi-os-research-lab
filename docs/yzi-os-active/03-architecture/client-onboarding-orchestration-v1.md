# YZI OS — Onboarding AI-First e Orquestração Visível da YZI (v1)

**Fonte ativa.** Alinhado a [`ai-first-tenant-activation-flow.md`](./ai-first-tenant-activation-flow.md), [`agents-and-skills-operating-model.md`](./agents-and-skills-operating-model.md), [`yzi-os-cognitive-operating-architecture.md`](./yzi-os-cognitive-operating-architecture.md), [`../04-implementation/yzihub-command-center-v1.md`](../04-implementation/yzihub-command-center-v1.md), [`../01-brand-positioning/surface-patterns-v1.md`](../01-brand-positioning/surface-patterns-v1.md), [`../01-brand-positioning/motion-language-v1.md`](../01-brand-positioning/motion-language-v1.md), [`../01-brand-positioning/component-language-v1.md`](../01-brand-positioning/component-language-v1.md) e [`../05-decisions/decision-yzihub-first-operating-tenant-v1.md`](../05-decisions/decision-yzihub-first-operating-tenant-v1.md).

> Arquitetura conceitual. **Não** define schema, UI final, design tokens, integrações técnicas, código, SQL, MCP, Pencil/`.pen` nem tela. O exemplo imobiliário (quando citado) é apenas validação; o núcleo permanece horizontal.

---

## 1. Propósito

Definir o **onboarding AI-first** do YZI OS: como o cliente entra, como a YZI conduz a ativação inicial, como o chat minimalista vira Command Center, como os canais alimentam a base e como a YZI orquestra agentes internos **sem expor complexidade** ao cliente. É a aplicação de superfície do fluxo de ativação (`ai-first-tenant-activation-flow.md`) sob a decisão de orquestração visível (`decision-yzihub-first-operating-tenant-v1.md` §9–10).

## 2. Decisão central

- A **YZI é a orquestradora visível** — única face do sistema.
- Os **agentes internos são motores de capacidade**, nunca protagonistas.
- O **cliente vê a YZI**, não múltiplos agentes.
- O **onboarding começa por conversa**, não por formulário nem dashboard vazio.

## 3. Princípios do onboarding

AI-first · mínimo atrito · conversa antes de configuração · canais como entrada real · gestor como decisor/aprovador · YZI como mediadora de toda mudança · autorização antes de execução · Command Center montado a partir do contexto · **sem CRM manual**.

## 4. Experiência inicial — Minimal YZI Chat

A primeira tela é a **superfície de ativação** (Minimal Chat Surface): minimalista, foco na conversa, sem dashboard vazio, sem menu técnico. A YZI conduz um **diagnóstico** (não papo) e passa a sensação de *"vamos montar seu sistema"*. A YZI trabalha, não conversa (`product-definition.md` §4); o motion da YZI é presença discreta, **nunca** "chat digitando" (`motion-language-v1.md` §8).

## 5. Diagnóstico conduzido pela YZI

A YZI coleta, em conversa: tipo de operação · objetivo principal · canais existentes · ativos disponíveis · território/segmentos · prioridades · restrições · permissões · plano inicial · integrações desejadas. Sustentado pelas skills `extract-business-profile`, `classify-operator-type`, `map-territory-focus`, `recommend-plan` (todas read-only nesta fase).

## 6. Transição — conversa vira sistema

1. A YZI **analisa** o diagnóstico.
2. O chat se **recolhe para uma lateral/dock** (dock da YZI).
3. O sistema mostra um **estado de montagem** honesto.
4. Os **blocos surgem progressivamente** (`generate-command-center-seed`, draft).
5. O **motion é mais perceptível apenas nesta primeira montagem**.
6. Depois disso, o motion volta a ser **sutil e funcional** — só para estado, prioridade ou confiança (`motion-language-v1.md` §2, §14).

## 7. Command Center inicial

Reusa a estrutura de `yzihub-command-center-v1.md` §3 com o contexto do tenant. Blocos iniciais: estado da operação · leitura inicial da YZI · canais conectados/pendentes · ativos detectados · prioridades · oportunidades iniciais · próximas ações · autorizações pendentes · lacunas (estado honesto) · rastro secundário (Audit Drawer). Critério de pronto: não é dashboard vazio; o gestor **entende a prioridade do dia** ao abrir (`ai-first-tenant-activation-flow.md` §8).

## 8. Papel da YZI durante o onboarding

Pergunta · interpreta · resume · confirma · **aciona capacidades internas** · propõe próximos passos · pede autorização · ajusta o sistema · mantém rastro. A YZI sempre mostra **o que vai fazer antes** e **o que fez depois** (`agents-and-skills-operating-model.md` §8).

## 9. Agentes internos e capacidades invisíveis

Existem por baixo da YZI, como motores duráveis (`agents-and-skills-operating-model.md` §5):

- **Radar Agent** — oportunidades, demanda, sinais.
- **Execution Agent** — rascunhos, ações autorizadas, campanhas, mensagens.
- **Continuity Agent** *(opcional)* — acompanhamento, follow-up, memória operacional.
- **Asset Intelligence / skills** — ingestão e indexação de ativos (`ingest-*`, `normalize-*`).
- **Policy / Authorization** — **camada** de limites, permissões e bloqueios (não é agente).

**Isto não aparece como múltiplos agentes para o cliente.** A face visível é sempre a YZI.

## 10. Entrada por canais reais

Os **canais são a entrada primária** da base: site · landing pages · WhatsApp · Instagram · formulários · campanhas · indicação rastreada · integrações autorizadas. O gestor **não cadastra lead como fluxo principal**.

> **Frase central:** o YZI OS não pede que o gestor alimente o sistema. Ele observa os canais da operação, organiza os dados, propõe ações e pede aprovação.

> **Diferença contra CRM:** no CRM tradicional, o humano trabalha para manter o sistema atualizado. No YZI OS, o **sistema trabalha para manter a operação atualizada** e pedir decisão ao humano.

## 11. Papel do gestor

Decide · aprova · recusa · corrige interpretação · edita sugestão antes da execução · debate estratégia com a YZI · autoriza integrações · define prioridade · pede nova leitura, ajuste de campanha ou follow-up.

## 12. O que o gestor NÃO faz

Preencher CRM · duplicar canal (WhatsApp/Instagram) · criar lead manualmente como rotina · operar pipeline como tarefa principal · organizar planilha dentro do sistema · editar a base sem mediação da YZI · **trabalhar para o sistema**.

## 13. Aprovação e autorização

Toda ação sensível percorre estados **honestos**, distinguidos claramente na interface (`component-language-v1.md` §16; `agents-and-skills-operating-model.md` §8): `sugestão` → `draft` → `preview` → `aguardando autorização` → `autorizado` → `executando` → `executado` → `monitorando` · `bloqueado`. Nenhuma ação real sem autorização explícita; campanha paga exige **limite de orçamento**. Superfície: **Authorization Flow** (`surface-patterns-v1.md` §8).

## 14. Handoff

O handoff humano **existe, mas é exceção** — nunca o centro do produto (`decision-yzihub-first-operating-tenant-v1.md` §11). Casos: cliente pediu humano · caso sensível · negociação avançada · contrato · visita/reunião estratégica · conflito · decisão fora de escopo · bloqueio operacional.

## 15. Motion e experiência viva

Motion forte **só na transição inicial** conversa → sistema: blocos surgem com calma, o chat recolhe para a lateral. Depois, motion **apenas para** estado, hover, clique, seleção, coluna, drawer, autorização, alerta e mudança real. **Nada decorativo** (`motion-language-v1.md` §3, §19).

## 16. Surface patterns usados

Da biblioteca de `surface-patterns-v1.md`:

- **Minimal Chat Surface** — estado de ativação inicial.
- **Executive Overview** (§5) — Command Center inicial.
- **Asset Intelligence Flow** (§9) — ativos detectados/ingeridos.
- **Radar Focus** (§6) — quando houver sinais.
- **Authorization Flow** (§8) — ações sensíveis.
- **Alert & Interruption** (§11) — bloqueios.
- **Outcome Review** (§10) — depois de ações executadas.

## 17. YZIHUB como primeiro tenant operacional

O primeiro uso real será a **própria YZIHUB usando o YZI OS para vender o YZI OS** (`decision-yzihub-first-operating-tenant-v1.md` §1). Mesmo assim, este documento permanece **horizontal** e serve a futuros clientes: a vertical é contexto do tenant, nunca identidade do core.

## 18. O que NÃO fazer

Criar formulário gigante · abrir dashboard vazio · expor múltiplos agentes · criar CRM manual · permitir cadastro manual como fluxo principal · fazer o gestor trabalhar para o sistema · usar motion decorativo · implementar agora · desenhar tela agora.

## 19. Próximo passo recomendado

Criar **depois** (não agora): `docs/yzi-os-active/04-implementation/yzihub-self-selling-operating-loop-v1.md` **ou** `docs/yzi-os-active/04-implementation/yzi-onboarding-transition-pattern-v1.md`. Nada fora de `docs/yzi-os-active/` sem autorização explícita.

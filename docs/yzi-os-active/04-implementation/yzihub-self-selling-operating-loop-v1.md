# YZI OS — Loop Operacional da YZIHUB: Vender o YZI OS com o Próprio YZI OS (v1)

**Fonte ativa.** Alinhado a [`../05-decisions/decision-yzihub-first-operating-tenant-v1.md`](../05-decisions/decision-yzihub-first-operating-tenant-v1.md), [`../03-architecture/ai-first-tenant-activation-flow.md`](../03-architecture/ai-first-tenant-activation-flow.md), [`../03-architecture/agents-and-skills-operating-model.md`](../03-architecture/agents-and-skills-operating-model.md), [`../03-architecture/client-onboarding-orchestration-v1.md`](../03-architecture/client-onboarding-orchestration-v1.md), [`yzihub-command-center-v1.md`](./yzihub-command-center-v1.md), [`radar-opportunity-card-v1.md`](./radar-opportunity-card-v1.md), [`../02-modules/radar-module-definition.md`](../02-modules/radar-module-definition.md) e [`../01-brand-positioning/surface-patterns-v1.md`](../01-brand-positioning/surface-patterns-v1.md).

> Documento de produto/arquitetura. **Não** define schema, UI, código, React, CSS, Tailwind, tokens, SQL, API, MCP, Pencil/`.pen`, evidence nem lane. Tom prático, orientado a produto. O loop é horizontal; a YZIHUB é o primeiro contexto.

---

## 1. Propósito

Definir como a **YZIHUB usa o próprio YZI OS para vender o YZI OS** — o primeiro tenant operacional real. Transforma a decisão estratégica (`decision-yzihub-first-operating-tenant-v1.md`) num **loop operacional** claro: canais reais → sinais/leads → YZI organiza → Radar identifica oportunidade → YZI recomenda → gestor aprova → ação executada/autorizada → resultado monitorado → aprendizado volta ao sistema.

## 2. Tese central

> **A YZIHUB vende o YZI OS usando o YZI OS.**

## 3. O que isso significa

**Dogfooding operacional:** prova de produto e prova de venda no mesmo movimento. Gera **material comercial verdadeiro** e endurece o produto **antes** de vender para verticais externas (`decision-yzihub-first-operating-tenant-v1.md` §4).

## 4. O que isso NÃO significa

Não fazer site agora · não implementar agora · não criar CRM manual · não abandonar imobiliárias · não criar campanha política agora · não mexer no Café com Pam agora · não transformar o YZI OS em ferramenta interna apenas (`decision-yzihub-first-operating-tenant-v1.md` §3).

## 5. Loop operacional principal

```
Canais reais
  → sinais/leads/ativos entram
  → YZI organiza e interpreta
  → Radar identifica oportunidades
  → YZI recomenda ação
  → gestor aprova/edita/recusa
  → Execution prepara/executa dentro de autorização
  → resultado é monitorado
  → aprendizado volta para o Command Center
```

É o ciclo **ver → decidir → agir → acompanhar** (`brand-positioning.md` §4) aplicado à própria operação comercial da YZIHUB.

## 6. Canais de entrada da YZIHUB

Site futuro · WhatsApp · Instagram · LinkedIn · formulários · landing pages futuras · campanhas · indicações · conversas comerciais · reuniões · eventos · lista de contatos autorizada · materiais internos.

> Os **canais alimentam a base**; o gestor **não cadastra lead manualmente como rotina** (`decision-yzihub-first-operating-tenant-v1.md` §6).

## 7. Ativos internos da YZIHUB

Documentação do YZI OS · decisões de produto · prints/protótipos · cases internos · conversas com leads · propostas · materiais de pitch · posts e ideias · gravações/transcrições futuras · documentos de verticais · assets de Café com Pam/Jurema **como referência histórica, sem virar core**. Entram via **Asset Intelligence** (`agents-and-skills-operating-model.md` §7.2): vira material entendido, nunca arquivo bruto.

## 8. O que a YZI organiza

Oportunidades comerciais · leads por intenção · segmentos promissores · dúvidas frequentes · objeções · materiais reutilizáveis · argumentos de venda · próximos follow-ups · campanhas sugeridas · conteúdos sugeridos · provas operacionais.

## 9. Radar da própria YZIHUB

O Radar (`radar-module-definition.md`) opera sobre a operação comercial da YZIHUB: identifica sinais de demanda por segmento · percebe oportunidades de conteúdo · identifica dores recorrentes · aponta nichos prioritários · sugere campanhas pequenas · recomenda abordagem para verticais · cruza sinais externos com ativos internos. Exemplos:

- "corretores perguntando sobre atendimento automático"
- "imobiliárias com dificuldade de follow-up"
- "campanhas políticas precisando de território/conteúdo"
- "consultores perdendo leads por falta de processo"
- "prova social Café com Pam/Jurema pode virar narrativa controlada"

## 10. Tipos de oportunidade da YZIHUB

Oportunidade de lead · de conteúdo · de campanha · de vertical · de parceria · de prova social · de follow-up · de proposta · de demonstração. Cada uma vira um **Radar Opportunity Card** (`radar-opportunity-card-v1.md`): sinal + fit + ação recomendada + próxima ação da YZI + flag de autorização.

## 11. Command Center da YZIHUB

Blocos operacionais esperados (reusando `yzihub-command-center-v1.md` §3, **sem desenhar tela**):

Estado da operação comercial · canais conectados/pendentes · leads e sinais recentes · oportunidades do Radar · segmentos prioritários · próximos follow-ups · conteúdos/campanhas sugeridos · propostas em andamento · autorizações pendentes · resultados · aprendizados · rastro secundário (Audit Drawer).

## 12. Papel do gestor YZIHUB

Conversar com a YZI · aprovar abordagens · ajustar posicionamento · escolher segmento prioritário · aprovar conteúdo/campanha · recusar sugestão · corrigir interpretação · pedir nova leitura · priorizar follow-up · autorizar execução.

## 13. O que o gestor YZIHUB NÃO faz

Cadastrar lead manualmente como rotina · preencher CRM · duplicar dados de canais · criar oportunidade na mão como fluxo principal · organizar base manualmente · **trabalhar para manter o sistema atualizado** (`decision-yzihub-first-operating-tenant-v1.md` §8).

## 14. YZI como orquestradora visível

A YZI organiza, recomenda e aciona capacidades internas. **O gestor vê a YZI, não múltiplos agentes** (`agents-and-skills-operating-model.md` §5). Internamente:

- **Radar Agent** detecta oportunidades.
- **Execution Agent** prepara ações.
- **Continuity Agent** acompanha follow-up.
- **Asset Intelligence** organiza materiais.
- **Policy/Authorization** (camada) bloqueia ou pede aprovação.

## 15. Aprovação e execução

**Nada sensível executa sem autorização** (`brand-dna.md` §4). A YZI pode preparar: mensagem · follow-up · briefing de conteúdo · campanha · roteiro de call · proposta · resumo de oportunidade · plano de abordagem. O gestor **aprova, edita ou recusa**; estados honestos `draft → aguardando autorização → autorizado → executando → executado → monitorando`.

## 16. Exemplos de loop prático

- **Lead via WhatsApp:** lead pergunta sobre o YZI OS → YZI classifica intenção → recomenda follow-up → gestor aprova.
- **Oportunidade de conteúdo:** dúvidas recorrentes sobre "não é chatbot" → YZI sugere post/landing → gestor aprova briefing.
- **Vertical imobiliária:** sinal de demanda em corretores → Radar recomenda material específico → YZI prepara abordagem.
- **Prova operacional:** uso interno gera resultado → YZI registra aprendizado → vira argumento comercial.

## 17. Relação com site futuro

O site será **canal fundamental depois**, mas **não é foco agora**. Antes, o loop operacional precisa estar claro. Quando o site existir, ele deve **alimentar este loop**, não ser apenas vitrine.

## 18. Relação com vertical imobiliária

Depois de validar o loop na YZIHUB, a **mesma lógica** será aplicada a imobiliárias/corretores como **primeira vertical externa** (`decision-yzihub-first-operating-tenant-v1.md` §5). A vertical é contexto, não identidade do core.

## 19. Relação com campanha política e Café com Pam

Campanha política e Café com Pam permanecem **futuras**. O loop YZIHUB cria **base reutilizável** para ambas — sem virar core nem estética agora (`product-definition.md` §7).

## 20. Surface patterns aplicados

Executive Overview · Radar Focus · Opportunity Detail · Authorization Flow · Asset Intelligence Flow · Outcome Review · Alert & Interruption · Semantic Search & Discovery (`surface-patterns-v1.md`).

## 21. O que NÃO fazer

Fazer site agora · sair para UI agora · implementar agora · virar CRM · criar cadastro manual · expor múltiplos agentes · criar dashboard vazio · criar dados fictícios como se fossem reais · prometer integrações inexistentes · misturar Café com Pam/Jurema como core.

## 22. Próximo passo recomendado

Criar **depois** (não agora): `docs/yzi-os-active/04-implementation/yzihub-command-center-operating-surface-v1.md` **ou** `docs/yzi-os-active/04-implementation/yzihub-self-selling-pencil-plan-v1.md`. Nada fora de `docs/yzi-os-active/` sem autorização explícita.

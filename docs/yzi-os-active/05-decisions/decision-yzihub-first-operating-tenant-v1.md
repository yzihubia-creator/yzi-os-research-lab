# Decisão — YZIHUB como Primeiro Tenant Operacional do YZI OS (v1)

**Data:** 2026-06-16
**Status:** Ativa
**Escopo:** Ordem de uso operacional do YZI OS. Ajusta a sequência de validação sem alterar a definição central do produto (decisão + ação contínua) nem cancelar a vertical imobiliária.

> Decisão de arquitetura/estratégia. **Não** implementa: sem código, schema, SQL, UI, Pencil/`.pen`, MCP, evidence ou lane. Alinhada a [`../03-architecture/ai-first-tenant-activation-flow.md`](../03-architecture/ai-first-tenant-activation-flow.md), [`../03-architecture/agents-and-skills-operating-model.md`](../03-architecture/agents-and-skills-operating-model.md), [`../04-implementation/yzihub-command-center-v1.md`](../04-implementation/yzihub-command-center-v1.md) e [`decision-real-estate-first-vertical-v1.md`](./decision-real-estate-first-vertical-v1.md).

---

## 1. Decisão

A **YZIHUB será o primeiro tenant operacional real do YZI OS** — antes da primeira vertical externa. **Tese central: a YZIHUB vende o YZI OS usando o YZI OS.**

## 2. O que isso significa

A YZIHUB usa o próprio YZI OS para conduzir sua operação comercial: organizar a operação, captar sinais de demanda, organizar ativos internos, mapear oportunidades, sugerir conteúdo e campanhas, acompanhar leads, preparar abordagens, ajudar a vender o produto, registrar aprendizados e gerar **prova operacional**.

## 3. O que isso NÃO significa

- Não cancela a vertical imobiliária; não abandona corretores/imobiliárias.
- Não cria campanha política agora; não mexe no Café com Pam agora.
- Não transforma o produto em ferramenta interna apenas.
- Não implementa agora; não cria CRM manual.

## 4. Por que essa decisão é forte

- **Dogfooding real:** prova de produto e prova de venda no mesmo movimento.
- Reduz achismo e gera **material comercial verdadeiro**.
- Cria narrativa forte: **"vendemos o YZI OS usando o YZI OS"**.
- Prepara e endurece o produto **antes** de vender para imobiliárias.

## 5. Ordem estratégica atualizada

A. **YZIHUB** — primeiro tenant operacional real.
B. **Imobiliárias/corretores** — primeira vertical externa comercial.
C. **Campanha política** — adaptação futura.
D. **Café com Pam** — validação criativa/consultiva posterior.

## 6. Canais como entrada primária

Leads e oportunidades entram pelos **canais reais da operação**: site · landing pages · WhatsApp · Instagram · formulários · campanhas · indicação rastreada · integrações autorizadas. A entrada **não** é cadastro manual do gestor.

> **Frase central:** o YZI OS não pede que o gestor alimente o sistema. Ele observa os canais da operação, organiza os dados, propõe ações e pede aprovação.

> **Diferença contra CRM:** no CRM tradicional, o humano trabalha para manter o sistema atualizado. No YZI OS, o **sistema trabalha para manter a operação atualizada** e pedir decisão ao humano.

## 7. O que o gestor pode fazer

Conversar com a YZI · aprovar · recusar · editar sugestão antes da execução · debater estratégia · corrigir interpretação · autorizar integração · pedir nova leitura · priorizar uma oportunidade · pedir ajuste de campanha · pedir follow-up.

## 8. O que o gestor NÃO deve fazer

Cadastrar lead manualmente como fluxo principal · preencher CRM · duplicar dados de WhatsApp/Instagram · criar oportunidade na mão · operar pipeline manualmente como trabalho principal · organizar planilha dentro do sistema · alterar a base diretamente sem mediação da YZI.

## 9. Papel da YZI

A YZI é a **orquestradora visível**: recebe contexto, conversa com o gestor, aciona capacidades internas, prepara ações, pede autorização, registra rastro e acompanha resultado. **Não expor múltiplos agentes ao cliente** — a experiência visível é a YZI.

## 10. Agentes internos

**Radar Agent**, **Execution Agent**, **Continuity Agent** e as **skills** existem internamente como motores de capacidade (`agents-and-skills-operating-model.md` §5). São o motor, nunca a face: a experiência visível continua sendo a YZI.

## 11. Handoff

Handoff humano existe em alguns casos, mas **não é o centro do produto** — é exceção: caso sensível · negociação avançada · conflito · humano solicitado · decisão fora de escopo · contrato · visita/reunião estratégica.

## 12. Próximo passo recomendado

Criar **depois** (não agora): `docs/yzi-os-active/03-architecture/client-onboarding-orchestration-v1.md` **ou** `docs/yzi-os-active/04-implementation/yzihub-self-selling-operating-loop-v1.md`. Nada fora de `docs/yzi-os-active/` sem autorização explícita.

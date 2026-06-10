# YZI OS Operating Model v1

## Core Thesis

> **Opportunity is the object. Operation is the hero.**

A `Opportunity` é o objeto central **interno** do YZI OS — a unidade que carrega dinheiro e um relógio. Mas o protagonista da **experiência** não é o objeto: é a **operação** que age sobre ele.

O YZI OS **não deve ser object-centric como um CRM.** Um CRM coloca o registro no centro e espera que o humano aja sobre ele — o objeto é o herói, e a ação é tarefa do usuário. O YZI OS inverte isso: deve ser **operation-centric e orientado à recuperação.** A YZI não apenas *registra* oportunidades — ela as **detecta, prioriza, opera, recupera e aprende** com elas. O usuário não vê um arquivo de oportunidades para gerenciar; vê uma operação em andamento para supervisionar.

Essa inversão é a resposta direta ao ataque central do red team: um produto que se vende como *system of action* não pode se modelar como *system of record*. A `Opportunity` permanece o objeto interno e estável; a **operação** é o que o produto mostra, vende e cobra.

## The Operating Loop

O modelo operacional do YZI OS é um ciclo contínuo de cinco estágios. O objeto que percorre o ciclo é a `Opportunity`; o herói em cada estágio é a operação da YZI.

```
Detect → Prioritize → Operate → Recover → Learn
   ↑                                          │
   └──────────────────────────────────────────┘
```

O ciclo não é linear e descartável — ele alimenta a si mesmo. Cada operação e cada desfecho retornam como aprendizado que melhora a próxima detecção e a próxima priorização.

## Detect

A YZI **detecta** oportunidades onde os outros sistemas não olham. Um sinal vira `Opportunity` quando cruza o limiar de "isto pode valer dinheiro e exige ação": um formulário, uma mensagem, um comportamento, uma **data** (renovação chegando) ou — o mais negligenciado — um **silêncio** (X dias sem contato).

A detecção é a primeira fonte de diferenciação. Se o sistema só enxerga o que o CRM já tem registrado, ele é CRM relabeled. O valor nasce de detectar o que está vazando **sem ninguém ver**: o lead que esfriou, a proposta parada, o cliente que sumiu, a conta perto do churn.

## Prioritize

Detectar tudo gera ruído; ruído mata a confiança igual a um CRM cheio de lead morto. Por isso a YZI **prioriza** antes de operar.

Cada oportunidade carrega um *stake*, e a ordenação é função de três fatores: **valor potencial × probabilidade × decaimento (urgência do relógio)**. O que está prestes a morrer e vale muito sobe; o que vale pouco e tem tempo desce. A priorização é o que permite à YZI dizer ao dono *o único ponto que mais importa agora* — comportamento de consultor sênior, não de lista de tarefas.

## Operate

A YZI **opera** a oportunidade — este é o verbo-herói do produto. Operar significa agir no momento certo: qualificar, responder, fazer follow-up, nutrir, ofertar, reativar — na voz do negócio, no tempo certo.

A operação é **por padrão**: a YZI age e o humano supervisiona, em vez de o humano ter que iniciar cada ação. Isto é a fronteira que separa o YZI OS de automação com IA (regras fixas) e de CRM com IA (registro passivo): a operação é contextual, viva e conduzida pelo sistema. Se o verbo do cliente vira "gerenciar", o modelo falhou.

## Recover

A YZI **recupera** oportunidades que outros sistemas dão por mortas. Esta é a operação-assinatura — a ressurreição. Uma oportunidade *Leaked* (morta por inação) ou adormecida é re-operada e trazida de volta.

`Recover` existe como estado de primeira classe justamente porque o CRM não o tem: lá, oportunidades não "morrem", apenas apodrecem num estágio. No YZI OS, a morte por inação é explícita e contada — e a recuperação é o que prova valor em R$. É também o momento de maior impacto na percepção do cliente: *"esse aqui você já tinha perdido; olha ele de volta."*

## Learn

Cada operação e cada desfecho (*Recovered / Won / Lost / Leaked*) retornam ao sistema como **aprendizado**. A YZI aprende os padrões daquele negócio: o que reaquece, o que converte, qual canal e qual tom funcionam, onde o vazamento se repete.

O aprendizado fecha o loop — melhora a próxima detecção (o que é sinal relevante aqui), a próxima priorização (o que realmente vale) e a próxima operação (o que funciona neste negócio). É também o moat: contexto operacional acumulado por cliente, que torna a YZI cada vez mais difícil de substituir.

## UX Implications

A UX deve ser uma **sala de operações**, não um arquivo de registros. Ela prioriza, nesta ordem:

- **Oportunidades em risco** — o que está prestes a vazar agora (o relógio em vermelho), não uma lista alfabética de contatos.
- **Ações em andamento** — o que a YZI **já está fazendo**, visível e ao vivo. A operação como protagonista da tela.
- **Recuperação possível** — o que pode ser ressuscitado, destacado como oportunidade ativa de receita.
- **Aprovação humana** — pontos claros onde o humano supervisiona, aprova ou ajusta — sem ter que gerenciar tudo.
- **Resultado atribuído** — R$ recuperado, conectado à oportunidade e à ação que o gerou. Prova de valor, não vaidade.
- **Aprendizado do sistema** — o que a YZI aprendeu sobre o negócio, tornando a inteligência visível e o moat tangível.

O teste de UX: ao abrir a tela, o dono deve sentir **alívio** ("isto está sendo cuidado") e não **culpa** ("tenho uma lista enorme para fazer"). Culpa é a emoção do CRM; alívio é a do YZI OS.

## Guardrails

Guardrails derivados do red team (`yzi-os-opportunity-thesis-red-team-v1.md`). Não são apêndice — são regras de design vigiadas:

- **Operação/recuperação é o herói** — produto e UX lideram pela ação, nunca pelo objeto.
- **`Opportunity` não deve virar board de CRM** — nada de pipeline com estágios que o humano arrasta e gerencia.
- **Humano supervisiona, não gerencia tudo** — o verbo do cliente é "aprovar/supervisionar", não "gerenciar".
- **Estados `Leaked` e `Recovered` devem ser visíveis** — a morte por inação e a ressurreição são cidadãos de primeira classe na tela.
- **Valor atribuído deve ser honesto** — R$ recuperado precisa ser crível e atribuível; número inflado destrói confiança mais rápido que número nenhum.
- **Linguagem externa deve escapar da gravidade do CRM** — `Opportunity` é entidade interna; a comunicação usa Growth Leakage / Opportunity Recovery / Revenue Recovery / "Never lose another opportunity".

## Non-Goals

Este documento **não** cria:

- implementação;
- código;
- schema;
- banco;
- runtime;
- workflow;
- integração;
- vertical específica.

É um documento de produto e modelo operacional conceitual. Decisões técnicas, de execução e de verticalização ficam explicitamente fora de escopo.

## Next Step

`Task 267 — Design YZI Website Onboarding Journey v1`

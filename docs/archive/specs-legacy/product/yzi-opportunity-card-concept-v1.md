# YZI Opportunity Card Concept v1

## Product Thesis

> **The Opportunity Card is not a CRM record. It is a live operational object.**

O Opportunity Card é a tradução visível da `Opportunity` interna — o objeto que carrega dinheiro e relógio — para a experiência do usuário. Mas ele não é um registro estático que o humano abre, preenche e gerencia. É um **objeto operacional vivo**: mostra uma oportunidade *sendo operada* pela YZI, com valor, urgência, risco de vazamento, ação recomendada e o status atual da operação. O princípio que governa todo o card:

> *This is not a record to manage. This is an opportunity being operated.*

## Card Job

O job do card é mostrar, de relance:

- o que aconteceu;
- por que importa;
- quanto pode valer;
- quanto tempo resta;
- qual risco de vazamento;
- o que a YZI recomenda;
- o que a YZI está fazendo;
- onde o humano precisa aprovar.

Tudo isso sem que o usuário precise garimpar dados ou montar o contexto — o card já chega operado.

## Card Fields

| Field | Meaning | User Question Answered |
| ----- | ------- | ---------------------- |
| **Signal Source** | A origem do sinal que gerou a oportunidade. | "De onde isso veio?" |
| **What Happened** | O evento, em linguagem humana. | "O que aconteceu?" |
| **Why It Matters** | A relevância operacional/financeira agora. | "Por que eu deveria me importar?" |
| **Estimated Value** | Estimativa honesta de valor em R$. | "Quanto isso pode valer?" |
| **Clock / Urgency** | Quanto tempo até a oportunidade morrer. | "Quanto tempo eu tenho?" |
| **Leakage Risk** | A probabilidade de virar vazamento. | "Quão perto está de eu perder?" |
| **Recommended Action** | A ação de recuperação proposta. | "O que dá pra fazer?" |
| **Current YZI Status** | O que a YZI já está fazendo/preparando. | "Isso está sendo cuidado?" |
| **Human Approval Status** | Onde e se a aprovação humana é necessária. | "Preciso decidir algo?" |
| **Evidence / Source** | A evidência concreta por trás da oportunidade. | "Como você sabe disso?" |

## Card States

| State | Meaning | User Feeling |
| ----- | ------- | ------------ |
| **Detected** | Sinal convertido em oportunidade visível. | "Tem coisa aqui que eu não via." |
| **Prioritized** | Ordenada por valor × probabilidade × decaimento. | "Ela sabe o que importa primeiro." |
| **At Risk** | O relógio está correndo; perto de vazar. | "Isso está prestes a escapar." |
| **Recovery Suggested** | Ação de recuperação proposta. | "Existe um jeito de salvar." |
| **Awaiting Approval** | Aguardando decisão humana. | "Eu decido, sem ter que fazer tudo." |
| **Recovery In Motion** | A YZI está operando a recuperação. | "Isso está sendo cuidado agora." |
| **Recovered** | Oportunidade trazida de volta. | "Recuperei dinheiro que tinha perdido." |
| **Leaked** | Morreu por inação — vazamento explícito. | "Vi exatamente o que perdi e por quê." |
| **Learned** | Desfecho virou aprendizado do sistema. | "Ela fica mais inteligente sobre meu negócio." |

## Primary User Actions

O humano deve poder, sobre cada card:

- **approve** — aprovar a ação recomendada;
- **adjust** — ajustar a abordagem;
- **assign** — direcionar a alguém da equipe;
- **dismiss** — descartar;
- **mark as not relevant** — marcar como não relevante;
- **request explanation** — pedir que a YZI explique a evidência/raciocínio.

Mas — regra crítica — **o card não deve exigir gerenciamento manual para existir**. Ele nasce detectado, priorizado e com ação proposta. As ações do usuário são de **supervisão**, não de operação manual. Se o card só funciona quando o humano o preenche e move, ele virou registro de CRM.

## What The Card Must Avoid

O card deve evitar:

- parecer lead;
- parecer deal;
- parecer tarefa;
- parecer ticket;
- parecer item de pipeline;
- virar board arrastável;
- exigir preenchimento manual;
- esconder evidência;
- inflar valor.

Cada um desses puxa o card de volta à gravidade do CRM/automação/dashboard — as degenerações que o red team identificou como letais.

## Emotional Design

O card deve gerar:

- **urgência sem pânico** — o relógio cria tensão produtiva, não ansiedade;
- **alívio com controle** — ver que está sendo operado, mantendo a decisão;
- **confiança por evidência** — cada afirmação ancorada em prova visível;
- **clareza sobre a próxima ação** — sempre óbvio o que vem a seguir.

## First Session Version

Na primeira sessão, o card aparece em **versão simplificada** — prova visual de que a YZI detectou vazamento real, sem sobrecarregar:

- sinal detectado;
- vazamento provável;
- valor estimado;
- ação de recuperação proposta.

Essa versão enxuta sustenta a transição emocional da **tensão** (vejo o vazamento) para o **alívio** (vejo como recuperar), sem exigir que o usuário entenda todo o ciclo de estados ainda.

## Product Rule

> **The Opportunity Card must make the operation visible, not turn the user into the operator.**

## Non-Goals

Este documento **não** cria:

- UI final;
- wireframe;
- implementação;
- código;
- workflow;
- integração;
- vertical específica.

É um **conceito de produto** do objeto. Layout visual, wireframes e decisões técnicas ficam fora de escopo.

## Next Step

`Task 272 — Create YZI Website First Session Wireflow v1`

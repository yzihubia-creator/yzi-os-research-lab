# YZI Opportunity Radar Experience v1

## Product Thesis

> **Opportunity Radar is not a dashboard. It is a live detection layer for growth leakage.**

O Opportunity Radar é a manifestação do estágio **Detect** do modelo operacional. Ele não observa passivamente nem armazena registros: ele **detecta ao vivo** sinais que carregam dinheiro e relógio, transforma esses sinais em oportunidades em risco e mostra, em tempo real, onde o crescimento está vazando. A diferença com um dashboard é categórica — um dashboard mostra o que aconteceu para o humano interpretar; o Radar mostra o que está vazando agora e o que a YZI já está fazendo a respeito.

## Radar Job

> **Detect lost, cooling, hidden, or under-operated opportunities before they become invisible leakage.**

O job do Radar é antecipar a morte da oportunidade. Growth Leakage acontece em silêncio — o vazamento é invisível porque ninguém está olhando para o ponto certo no momento certo. O Radar existe para tornar visível e operável aquilo que, sem ele, simplesmente desaparece.

## What It Detects

| Signal Type | Possible Opportunity | Leakage Risk |
| ----------- | -------------------- | ------------ |
| **site visit / no conversion** | Interesse real que não virou contato. | Alta — intenção evapora sem registro. |
| **form submitted / no response** | Lead quente aguardando retorno. | Crítica — pediu contato e foi ignorado. |
| **WhatsApp message / slow response** | Conversa viva esfriando por demora. | Alta — janela de resposta curta. |
| **proposal sent / no follow-up** | Negócio em andamento sem retomada. | Crítica — alto valor parado. |
| **campaign click / no conversation** | Intenção paga que não virou diálogo. | Alta — dinheiro de tráfego desperdiçado. |
| **old customer / no reactivation** | Relação existente adormecida. | Média — valor latente recuperável. |
| **high-intent page / weak CTA** | Interesse alto barrado por atrito. | Média-Alta — conversão estrangulada. |
| **silence after first contact** | Oportunidade que sumiu sem follow-up. | Alta — o vazamento mais comum e invisível. |

## Radar Experience States

| State | User Feeling | YZI Behavior |
| ----- | ------------ | ------------ |
| **Scanning** | "Ela está olhando minha operação." | Varre sinais que carregam dinheiro e relógio. |
| **Detected** | "Tem coisa aqui que eu não via." | Converte sinal em oportunidade e a torna visível. |
| **Prioritized** | "Ela sabe o que importa primeiro." | Ordena por valor × probabilidade × decaimento. |
| **At Risk** | "Isso está prestes a vazar." | Sinaliza o relógio em vermelho e o custo provável. |
| **Recovery Suggested** | "Existe um jeito de recuperar." | Propõe a ação de recuperação adequada. |
| **Human Approval Needed** | "Eu decido, sem ter que fazer tudo." | Aguarda aprovação nos pontos certos. |
| **Recovery In Motion** | "Isso está sendo cuidado." | Opera a recuperação ao vivo. |
| **Recovered / Leaked** | "Vi o resultado — recuperado ou perdido." | Mostra o desfecho atribuído e aprende com ele. |

## Opportunity Card

O card de oportunidade é o objeto que o usuário enxerga (a `Opportunity` interna, traduzida em operação visível). Campos conceituais:

- **what happened** — o que aconteceu (o sinal de origem, em linguagem humana);
- **why it matters** — por que importa agora;
- **value estimate** — estimativa de valor (R$, honesta);
- **clock / urgency** — o relógio / urgência (quanto tempo até morrer);
- **leakage risk** — o risco de vazamento;
- **recommended action** — a ação de recuperação recomendada;
- **current YZI status** — o que a YZI já está fazendo/preparando;
- **human approval status** — o estado de aprovação humana.

O card não é um registro para o humano preencher — é uma operação em curso que ele supervisiona.

## What The User Should Feel

O usuário deve sentir:

- "agora eu vejo onde estava vazando";
- "isso está sendo cuidado";
- "não preciso gerenciar tudo manualmente";
- "consigo supervisionar a operação".

A emoção central é **alívio com controle** — ver o vazamento *e* ver que ele está sendo operado, sem virar mais uma lista de tarefas.

## What It Must Avoid

O Radar deve evitar:

- dashboard passivo;
- CRM board;
- lead list;
- vanity metrics;
- excesso de alertas;
- oportunidade sem valor;
- números inflados;
- ação automática sem aprovação.

Qualquer um desses devolve a sensação de "CRM com IA" ou "dashboard com IA" — exatamente as degenerações que o produto existe para evitar.

## First Session Usage

Na primeira sessão, o Opportunity Radar aparece como **prova visual** de que a YZI detectou vazamento real:

- **depois do operational mirror** — quando o problema já foi nomeado, o Radar mostra os pontos concretos;
- **durante o quantified leakage** — o Radar dá forma visível à estimativa de R$ que vaza;
- **antes do blueprint** — a detecção precede o desenho da operação de recuperação;
- **como prova visual** — o Radar transforma a afirmação ("você vaza aqui") em evidência tangível, sustentando a transição da tensão para o alívio.

## Product Rule

> **The Radar must show recovery in motion, not data waiting to be managed.**

## Non-Goals

Este documento **não** cria:

- UI final;
- wireframe;
- implementação;
- código;
- workflow;
- integração;
- vertical específica.

É um documento de **experiência de produto** do módulo. Telas finais, wireframes e decisões técnicas ficam fora de escopo.

## Next Step

`Task 271 — Create Opportunity Card Concept v1`

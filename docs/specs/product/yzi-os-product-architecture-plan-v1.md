# YZI OS Product Architecture Plan v1

## Product Thesis

YZI OS é uma plataforma operacional de growth. Ela transforma **sinais de crescimento** — visitas, formulários, leads, campanhas, conversas, follow-ups, propostas e oportunidades — em **operação, receita e aprendizado**.

Não é um chatbot. Não é um CRM. Não é uma plataforma genérica de agentes.

A tese é dupla:

- **YZI** é o operador de crescimento — a entidade que age sobre cada sinal.
- **YZI OS** é o sistema operacional por baixo — a camada que captura, conecta, opera e memoriza os sinais ao longo do tempo.

O produto é core, modular e multi-negócio. Não nasce preso a nenhuma vertical específica: nasce como plataforma horizontal de operação de crescimento, sobre a qual verticais e configurações específicas podem ser instanciadas depois.

A unidade de valor é o **sinal de crescimento capturado e operado até virar receita**.

## Category Enemy

O inimigo é o **Growth Leakage** — o crescimento que vaza.

Empresas investem em site, tráfego pago, conteúdo, campanhas, analytics, CRM, WhatsApp, atendimento e vendas. Mas cada uma dessas peças vive isolada. O sinal nasce em um lugar e morre antes de virar operação:

- a visita no site que ninguém qualifica;
- o formulário que não vira conversa;
- o lead que não recebe follow-up;
- a campanha que não conecta com o atendimento;
- a conversa de WhatsApp que esfria;
- a proposta que não tem reativação;
- a oportunidade que se perde no vão entre ferramentas.

Esse vazamento — silencioso, distribuído e não medido — é o inimigo. O mercado de martech foi construído para **medir** o crescimento. Quase nada foi construído para **operá-lo**. É nesse vão que o dinheiro vaza, e é esse vão que o YZI OS existe para fechar.

## Positioning

> **YZI operates your growth. Powered by YZI OS.**

O posicionamento se define por contraste. O stack atual de uma empresa **registra, observa e dispara** — mas não **age**:

- **CRM records** — guarda o estado. É um sistema de registro. Passivo.
- **Analytics observes** — descreve o que aconteceu. Passivo.
- **Automation triggers** — dispara regras pré-configuradas. Reativo e rígido.
- **YZI acts** — entende o contexto e opera o sinal até o resultado. Ativo.

O eixo de categoria é **system of record vs. system of action**. CRM, analytics e automação são sistemas de registro e observação; o ser humano é quem precisa agir. O YZI OS é um **system of action**: ele não espera o humano fechar o loop — ele opera o loop.

Frase-âncora interna: *CRM te diz o que aconteceu. YZI faz acontecer.*

## Customer Value

O cliente não compra agentes, módulos ou tecnologia. O cliente compra:

- **Receita recuperada** — o dinheiro que hoje vaza pelos buracos do funil volta a ser operado.
- **Redução de entropia operacional** — menos coisa caindo no vão entre site, tráfego, CRM e atendimento.
- **Operação de oportunidades** — cada sinal vira ação: qualificação, follow-up, nutrição, reativação.
- **Clareza sobre onde o crescimento está vazando** — visibilidade de onde a operação perde dinheiro hoje.

Teste de valor que governa o produto: **a YZI consegue mostrar, em número, o dinheiro que recuperou?** Se sim, há categoria. Se não, há apenas mais uma ferramenta de automação.

## Website YZI Journey

A entrada principal é a própria YZI, no site. A jornada do usuário:

```
diagnóstico → espelho → vazamento quantificado → blueprint → plano recomendado → tour visual
```

- **Diagnóstico** — a YZI entende negócio, aquisição, vendas, atendimento e gargalos por meio de conversa.
- **Espelho** — a YZI devolve o que entendeu, provando compreensão real do negócio. Primeiro momento de valor.
- **Vazamento quantificado** — a YZI estima, em número, onde e quanto o crescimento vaza hoje. Dor concreta.
- **Blueprint** — desenho inicial da operação de crescimento recomendada.
- **Plano recomendado** — plano, módulos e agentes aparecem como **consequência do diagnóstico**, não como funil de venda.
- **Tour visual** — o cliente vê a operação proposta de forma tangível antes de decidir.

O princípio é **provar valor antes da compra**: o cliente deve sentir que a YZI entendeu o negócio dele melhor que sua última agência, em minutos.

## Plans

| Plan | Job | Promise |
| ---- | --- | ------- |
| Start | Estancar vazamento | Nunca mais perca um lead. |
| Growth | Operar oportunidades | Trabalhe follow-up, nutrição e reativação. |
| Scale | Orquestrar crescimento | Rode crescimento como sistema. |
| Advanced | Co-pilotar | Estrategista humano + YZI operando junto. |

Cada plano representa um **estágio de maturidade operacional**, não apenas um nível de features. O cliente é promovido de estágio conforme a operação dele cresce — modelo land-and-expand. Advanced é high-touch, sales-assisted, com estrategista humano.

## Modules

Módulos são a **linguagem de valor** com o cliente — pensados como capacidades/departamentos, não como tecnologia. Módulos iniciais:

- **YZI Agent** — a porta de entrada e o operador conversacional permanente.
- **Opportunity Radar** — captura e detecção de sinais de crescimento onde eles hoje vazam.
- **Pipeline OS** — operação das oportunidades ao longo do funil.
- **Follow-up OS** — follow-up, nutrição e reativação contínuos.
- **Memory OS** — memória operacional do negócio: contexto acumulado que torna a operação cada vez mais inteligente.
- **Executive Cockpit** — visão executiva de onde o crescimento está vazando e quanto está sendo recuperado.

O OS chega **opinativo**: a partir do blueprint, a YZI monta a operação e o cliente aprova. O cliente não monta o sistema peça por peça.

## Agents

Agentes são a **força operacional por baixo dos módulos** — os trabalhadores que executam os jobs (qualificação, follow-up, reativação, etc.).

Agentes **não são a linguagem principal de venda**. O cliente pensa em resultados e em módulos (departamentos); o agente é o *como*, o motor por baixo. Expor agentes como protagonista devolve a sensação de *toolkit* e contradiz o posicionamento de operador de crescimento.

Regra: liderar com o que é feito (jobs/resultados), deixar os agentes serem o motor.

## Product Rule

> **Lead with the operator, not the OS. Sell the outcome, not the architecture.**

"Growth OS" é a história de visão e arquitetura — para investidor e para o roadmap de longo prazo. A mensagem de linha de frente, o que faz o cliente assinar, é o operador e o resultado: *a YZI opera seu crescimento e para de deixar dinheiro vazar.* O direito de reivindicar a categoria de plataforma se ganha depois, com clientes provando que rodam a operação sobre o YZI OS.

## Non-Goals

Este plano **não** cria:

- implementação;
- código;
- schema;
- banco;
- runtime;
- workflow;
- integração;
- vertical específica.

Este é um documento de produto, posicionamento e arquitetura conceitual. Decisões técnicas, de execução e de verticalização ficam explicitamente fora de escopo.

## Next Step

Enviar este plano ao Claude/Opus para **red team estratégico** — um exercício em que o próprio Claude argumenta por que a tese do "Growth Operating System" pode estar errada — antes de transformar este plano em camada de UX e onboarding.

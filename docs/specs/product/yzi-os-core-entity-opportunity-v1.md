# YZI OS Core Entity: Opportunity v1

## Product Thesis

O YZI OS deve organizar sua experiência, suas métricas e seus módulos ao redor de uma única entidade central: **`Opportunity`**.

Não Lead. Não Contact. Não Deal. Não Conversation.

A entidade central de um produto **é** a sua categoria — ela define o substantivo que o cliente pensa, o objeto da UX, a unidade de valor e a métrica de placar. O CRM é o que é porque sua entidade central é o *Contact*. Ao colocar a `Opportunity` no centro, o YZI OS deixa de ser um sistema de registro e passa a ser um sistema de operação: cada experiência, cada plano e cada módulo passam a ser, no fundo, uma forma de detectar, operar, recuperar ou medir oportunidades.

`Opportunity` é também o outro lado da moeda do inimigo: **Growth Leakage é oportunidade morrendo.** Inimigo e entidade central são a mesma realidade vista de dois ângulos — e essa coerência é a base de toda a estratégia.

## Definition

> **An Opportunity is a signal that carries money and a clock.**

Uma `Opportunity` é um momento em que o negócio *poderia* criar ou recuperar receita. Para qualificar como `Opportunity`, três propriedades são obrigatórias:

- **Valor potencial** — carrega dinheiro. Sem dinheiro embutido, é apenas um sinal cru.
- **Necessidade de ação** — exige que algo seja feito. Sem ação requerida, é apenas um registro.
- **Deterioração temporal** — decai com o tempo se não for operada. O relógio é o que torna o vazamento real: quando o relógio zera sem ação, a oportunidade morre.

Essa definição posiciona a `Opportunity` na altitude exata: **acima do sinal cru** (que ainda não vale dinheiro) e **abaixo do deal** (que pressupõe um processo de venda já aberto).

## Why Not Lead, Contact, Deal, or Conversation

| Entity | Why It Fails |
| ------ | ------------ |
| **Lead** | Topo de funil, marketing-owned, pressupõe "ainda não cliente". Não cobre reativação, upsell, renovação nem cliente inativo. Estreita demais para a operação completa. |
| **Contact** | É uma *pessoa* — estática, passiva, o substantivo do system of record. Não carrega dinheiro nem movimento. É exatamente o objeto central do CRM. |
| **Deal** | Sales-owned, pressupõe um processo de venda já em andamento. Exclui o sinal que nunca virou deal, o atendimento e o cliente adormecido. Profundamente codificada como pipeline/CRM. |
| **Conversation** | Centrada em interação, codificada por canal (cheiro de chatbot), efêmera. Conversa é um *meio*, não valor — não carrega dinheiro e empurra o produto de volta para "mais um chatbot". |

## Opportunity Lifecycle

```
Signal → Opportunity → Operated → Recovered / Won / Lost / Leaked
```

- **Signal** — um evento bruto: uma visita, um formulário, uma mensagem, um silêncio, uma data (renovação chegando).
- **Opportunity** — quando o sinal cruza o limiar de "isto pode valer dinheiro" e exige ação, ele se torna uma `Opportunity`.
- **Operated** — a YZI age sobre a oportunidade (qualificação, follow-up, nutrição, reativação, oferta).
- **Recovered / Won / Lost / Leaked** — os desfechos. *Recovered*: uma oportunidade morta ou adormecida trazida de volta. *Won*: convertida em receita. *Lost*: encerrada por decisão real (o cliente disse não). *Leaked*: morta por inação.

**Growth Leakage acontece quando uma `Opportunity` não é operada a tempo.** Diferente de um CRM — onde oportunidades simplesmente ficam paradas num estágio para sempre — no YZI OS a morte por inação (*Leaked*) é um estado explícito, contado e mensurável. O inimigo é tornado visível.

## Opportunity Quadrants

Dois eixos organizam toda oportunidade do negócio: a **relação** (nova ou existente) e a **energia** (esquentando ou esfriando). Cada quadrante exige uma operação distinta.

| Quadrant | Meaning | Primary Operation |
| -------- | ------- | ----------------- |
| **New + Heating** | Novo interesse ganhando energia — lead do site, primeiro contato ativo. | Capturar e responder rápido. |
| **Existing + Heating** | Relação existente pronta para crescer — upsell, renovação no momento certo. | Ofertar proativamente. |
| **New + Cooling** | Novo interesse perdendo energia — follow-up perdido, proposta parada, campanha sem resposta. | Follow-up e reaquecimento. |
| **Existing + Cooling** | Relação existente esfriando — cliente inativo, paciente que sumiu, conta em risco de churn. | Reativação / ressurreição. |

## Product Implications

Colocar `Opportunity` no centro reorganiza o produto inteiro:

- **Positioning** — deixa de ser "plataforma" abstrata e vira *"a YZI opera as oportunidades que seu negócio está perdendo"*. Concreto, com dinheiro embutido.
- **Onboarding** — o output do diagnóstico não é "um blueprint genérico"; é um **Mapa de Oportunidades**: aqui estão as que você está vazando agora. O momento de valor é ressuscitar uma ao vivo.
- **Modules** — deixam de ser features soltas e viram **fases do ciclo de vida da `Opportunity`**: detectar → operar → lembrar → mostrar placar.
- **Plans** — deixam de ser tiers genéricos e passam a representar **quantos quadrantes você opera e com que profundidade**.
- **UX** — o objeto central da tela deixa de ser uma lista de contatos ou um pipeline para gerenciar e vira o **Card de Oportunidade** (quem, quanto vale, por que agora, o que acontece se ignorar, o que já está sendo feito).
- **Analytics** — o placar deixa de ser "valor do pipeline" (pra frente, otimista) e vira **oportunidades detectadas / operadas / recuperadas / perdidas + R$ recuperado** — a métrica de vazamento que nenhum CRM mostra.
- **Value perception** — o cliente passa a medir o produto por **R$ recuperado = oportunidades ressuscitadas**. Provável e expansível.

## Internal vs External Language

`Opportunity` pode ser a **entidade interna central** — a espinha do produto, dos módulos e das métricas. Mas a **linguagem externa** com o mercado não precisa (e muitas vezes não deve) usar a palavra "Opportunity" crua, que carrega bagagem de CRM. A linguagem externa pode usar:

- **Growth Leakage** — nomeia o inimigo.
- **Opportunity Recovery** — o wedge de entrada, o "holy shit" da ressurreição.
- **Revenue Recovery** — traduz o valor diretamente em receita.
- **Never lose another opportunity** — a promessa em uma frase.

Regra: a entidade é interna e estável; a linguagem externa é o vocabulário de venda e categoria.

## Platform Flow

```
Signal → YZI detects → Opportunity → YZI operates → Revenue
```

```
Unoperated Opportunity → Growth Leakage
```

O centro do fluxo é a `Opportunity`. A YZI é a força que a move de sinal a receita. Sinal é o que os outros sistemas registram, observam e disparam; receita é o que todo mundo quer; o pedaço do meio — operar a oportunidade — é o que ninguém faz, e é onde mora o produto inteiro. Toda oportunidade deixada sem operar vira vazamento.

## Strategic Risk

O risco principal é de **confusão de categoria**: `Opportunity` é exatamente o nome do objeto central do CRM no vocabulário de vendas (Salesforce literalmente chama assim). Se a entidade do YZI OS não for diferenciada de frente, o produto será ouvido como "apenas um pipeline mais bonito" — e a UX corre o risco de degenerar num board de cards que o humano gerencia, ou seja, **um CRM disfarçado**.

A diferenciação obrigatória: a `Opportunity` do YZI é

- **mais ampla** — inclui sinais pré-deal, dormência pós-venda e momentos de atendimento, não só o pipeline de vendas;
- **temporal** — carrega um relógio e decai (estados de morte e recuperação como cidadãos de primeira classe);
- **operável** — é operada pelo sistema por padrão, não apenas anotada por um vendedor;
- **anterior e posterior ao deal** — existe antes de o deal abrir e depois de o cliente fechar.

Se o verbo do cliente for "gerenciar", o produto virou CRM. Se for "supervisionar uma operação", continua sendo o YZI OS.

## Product Rule

> **CRM stores records. YZI operates opportunities.**

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

É um documento de produto e de categoria. Decisões técnicas, de execução e de verticalização ficam explicitamente fora de escopo.

## Next Step

`Task 265 — Red Team YZI OS Opportunity Thesis`

Submeter esta tese ao Claude/Opus para red team estratégico — argumentando ativamente por que centralizar em `Opportunity` pode puxar o produto de volta ao pântano do CRM — antes de evoluir a entidade para camadas de UX e onboarding.

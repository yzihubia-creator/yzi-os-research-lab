# YZI OS — Definição do Módulo Radar

**Fonte ativa.** Aprofunda o verbete *Radar* de [`module-map.md`](./module-map.md), alinhado a [`../00-product/product-definition.md`](../00-product/product-definition.md) e à decisão [`../05-decisions/decision-radar-positioning-v1.md`](../05-decisions/decision-radar-positioning-v1.md).

> Este documento substitui, para fins de Radar, a leitura rasa de "inteligência de mercado / tendências". Não define schema, UI, integrações nem implementação.

---

## 1. O que o Radar é

O Radar é o **módulo de inteligência de demanda, busca, mercado e oportunidade** do YZI OS. Ele existe para responder, com menos achismo e menos desperdício de verba, à pergunta que antecede qualquer ação comercial:

> **O que precisamos saber antes de criar um anúncio, um conteúdo, uma campanha ou uma abordagem — para não gastar dinheiro errado?**

O Radar levanta e cruza sinais externos (o que o mercado procura) com sinais internos (o que a empresa pode executar e capturar) e devolve **oportunidades acionáveis priorizadas**, não um feed.

## 2. O que o Radar NÃO é

- Não é "Google Trends" embutido.
- Não é feed de tendências genéricas nem mural de notícias.
- Não é dashboard de keywords cru.
- Não é ferramenta de SEO isolada.
- Não termina em gráfico: termina em **ação recomendada com conteúdo, campanha e arquitetura sugeridos**.

---

## 3. A virada de chave: arquitetura de conhecimento, não conteúdo solto

Leitura aplicada do material de silos semânticos (SEO Genome):

- **O Google não ranqueia páginas isoladas — ranqueia sistemas de conhecimento.** Vale o mesmo para a presença de uma empresa: conteúdo avulso não vence; arquitetura temática (hub + spokes) vence.
- O algoritmo pesa **contexto** (faz parte de um cluster?), **hierarquia** (é hub ou spoke?) e **autoridade** (quantas páginas relevantes apontam para ela?).
- Autoridade é finita e decai com a distância de cliques (~0,85^profundidade). Dispersá-la em páginas órfãs é desperdício — o equivalente, em mídia, a queimar verba em público errado.
- A vantagem competitiva real é **arquitetura de informação + monitoramento contínuo**, não volume de posts.

**Tradução para o YZI OS:** o Radar não recomenda "fazer um post". Ele recomenda **onde aquele sinal de demanda encaixa numa arquitetura** — qual hub deve existir, quais spokes alimentá-lo, qual campanha capturar a intenção — e devolve isso como oportunidade priorizada para o Conteúdo IA, o Tráfego Pago e a YZI executarem.

---

## 4. Fontes do Radar por nível de maturidade

| Nível | Fontes | Natureza |
|---|---|---|
| **V1** | Seed/manual, input controlado do dono, contexto do negócio, dados internos do CRM/Financeiro | Sem dependência externa; valida o motor de oportunidade |
| **V2** | Google Trends, Google Autocomplete, Keyword Planner (intenção de tráfego pago), Search Console | Demanda de busca real |
| **V3** | SERP, concorrentes, Meta Ads Library, portais do nicho, redes sociais | Disputa e movimento de mercado |
| **V4** | Análise semântica (clusters/silos), arquitetura de conteúdo, performance de campanhas, execução contínua | Inteligência arquitetural + ciclo fechado |

A maturidade cresce sem mudar a promessa: cada nível só entra se melhora a qualidade da **oportunidade** entregue.

---

## 5. Tipos de oportunidade detectados

- Oportunidade de **conteúdo** (capturar demanda de busca).
- Oportunidade de **tráfego pago** (intenção quente, baixo custo, alta conversão potencial).
- Oportunidade de **SEO/silo** (hub/spoke que falta para dominar um tema).
- Oportunidade **local/regional** (bairro, cidade, tema em alta na web).
- Oportunidade de **captação** (lançamento, demanda nova, parceria de venda).
- Oportunidade de **reativação de leads** (lead antigo ligado a uma tendência atual).
- Oportunidade de **lançamento/produto**.
- Oportunidade de **parceria**.
- Oportunidade de **ajuste de oferta**.

---

## 6. Saída ideal de uma análise Radar (formato da oportunidade)

Toda oportunidade do Radar deve carregar:

1. **Sinal detectado** — o que mudou/cresceu.
2. **Fonte** — de onde veio o sinal.
3. **Localidade** — onde se aplica.
4. **Intenção de busca** — o que a pessoa quer ao pesquisar.
5. **Força do sinal** — volume/tendência/crescimento.
6. **Concorrência** — quão disputado está.
7. **Fit com a empresa** — aderência ao que ela vende e executa.
8. **Ação recomendada** — o próximo passo comercial.
9. **Conteúdo recomendado** — peça(s) a criar.
10. **Campanha recomendada** — teste/segmentação sugerida.
11. **Silo/hub/spokes recomendados** — onde encaixa na arquitetura.
12. **Impacto esperado** — o que isso pode mover.
13. **Próximo passo da YZI** — o que a assistente prepara/executa dentro de créditos e escopo.

A oportunidade é a unidade do Radar. Sem ação recomendada e arquitetura sugerida, não é oportunidade — é só dado.

---

## 7. Casos por nicho

### Imobiliária / corretor
- **Perguntas:** Qual bairro teve maior procura na web este mês? Qual empreendimento lançado merece mensagem de captação? Qual termo cresce (Bessa, Cabo Branco, Manaíra, Altiplano)?
- **Externo:** Trends por bairro, autocomplete, SERP de portais, Ads Library de construtoras/concorrentes.
- **Interno:** carteira de imóveis, leads frios por região, histórico de vendas.
- **Detecta:** demanda regional crescente, lançamento captável, lead antigo reativável.
- **Conteúdo:** hub "Morar no Bessa" + spokes (escolas, preço/m², lazer).
- **Anúncios:** campanha por bairro/tipologia com a intenção quente.
- **Ação da YZI:** propor abordagem à construtora, reativar leads do bairro, preparar página/silo.

### Clínica odontológica / médica
- **Perguntas:** Qual procedimento está sendo mais pesquisado na região? Qual dúvida antecede a busca por consulta?
- **Externo:** Trends de procedimentos, autocomplete de sintomas/dúvidas, concorrentes locais.
- **Interno:** agenda ociosa, pacientes inativos, serviços de maior margem.
- **Detecta:** demanda sazonal, dúvida de alta intenção, paciente para recall.
- **Conteúdo:** hub do procedimento + spokes (preço, recuperação, dúvidas).
- **Anúncios:** captação por procedimento de alta intenção e margem.
- **Ação da YZI:** recall de inativos, preencher agenda, ajustar oferta.

### Barbearia
- **Perguntas:** Qual serviço/estética está em alta? Qual horário/dia tem demanda ociosa?
- **Externo:** Trends de cortes/estética, autocomplete local, redes sociais.
- **Interno:** ocupação por horário, clientes sem retorno, ticket médio.
- **Detecta:** tendência de serviço, janela ociosa, cliente para retorno.
- **Conteúdo:** post/serviço em alta, prova social local.
- **Anúncios:** oferta para preencher horário ocioso.
- **Ação da YZI:** disparar retorno, promover horário fraco, empacotar combo.

### Loja com estoque
- **Perguntas:** Qual produto está sendo procurado e eu tenho em estoque? O que vai encalhar?
- **Externo:** Trends de produto/categoria, autocomplete, SERP/marketplaces, Ads Library.
- **Interno:** estoque, giro, margem, leads e clientes recorrentes.
- **Detecta:** produto em alta com estoque, risco de encalhe, recompra.
- **Conteúdo:** hub de categoria + spokes de produto/uso.
- **Anúncios:** campanha do produto em alta com estoque disponível.
- **Ação da YZI:** priorizar anúncio do que gira, queimar encalhe, recompra.

---

## 8. Relação com os outros módulos

- **Radar → Conteúdo IA:** transforma demanda em arquitetura (hub/spokes), não em post avulso.
- **Radar → Tráfego Pago:** entrega intenção qualificada antes de gastar verba.
- **Radar → CRM/Follow-ups:** liga tendência a lead reativável.
- **Radar → Relatórios e Recomendações:** alimenta o ciclo decisão + ação contínua.
- **Radar + YZI:** a YZI lê o Radar e prepara/executa a próxima ação autorizada.

---

## 9. Regra do módulo

O Radar só se justifica se cada sinal vira **oportunidade priorizada com ação, conteúdo, campanha e arquitetura sugeridos**. Tendência sem ação não entra. O Radar é o início do ciclo de Growth — não um relatório de tendências.

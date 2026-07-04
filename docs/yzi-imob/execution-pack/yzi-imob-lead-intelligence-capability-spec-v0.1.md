# YZI IMOB — Lead Intelligence Capability Spec v0.1 (rev. 1)

Especificação documentária da capability **Lead Intelligence**. Complementa as specs das capabilities Property Catalog, Creative Studio, Visit Orchestration e Assignment Engine, e o Memory Context de `yzi-imob-context-builder-spec-v0.1.md`. Sem implementação.

Invariantes do Execution Pack — tenant boundary, human-in-the-loop, evidence, estados honestos, context engineering — aplicam-se **por referência** e não são repetidas aqui.

Princípio de identidade: **a capability resolve um problema operacional; não é definida por API, MCP, SDK ou provider.**

## 1. Objetivo

Aprender continuamente com o padrão dos leads — de onde vêm, o que procuram, o que converte — e devolver essa leitura como recomendação para Radar, Search Intelligence, campanhas, Creative Studio e distribuição. É a capability que fecha o loop de aprendizado do YZI IMOB.

Problema operacional que resolve: *"o que os meus leads estão me ensinando sobre onde investir, o que anunciar e quem escala melhor cada atendimento?"*

Regra central: **Lead Intelligence transforma dados em recomendações; nunca executa ações.** Não atende lead, não publica conteúdo, não realoca orçamento, não reatribui corretor.

## 2. Valor para o negócio

- **Problema que resolve:** a operação gera dado de lead todos os dias e ninguém aprende com ele; decisões de marketing e distribuição são tomadas por intuição.
- **Ganho operacional:** padrões reais (origem × conversão, bairro × preço, campanha × qualidade) viram recomendações contínuas e explicadas.
- **Decisão que melhora:** onde investir em conteúdo e campanha, qual formato criativo usar e como distribuir leads — com evidência em vez de achismo.

## 3. Posição no fluxo

`Atendimento / Visit Orchestration (lead gerado, visita realizada) → Lead Intelligence (captura + leitura) → Radar / Search Intelligence / Tráfego / Creative Studio / Assignment Engine (recomendação entregue)`

Camada de **aprendizado**, não de execução: lê o que já aconteceu (evidence, CRM, visitas, campanhas) e transforma em padrão acionável.

## 4. Captura

Campos por lead, sempre por `tenant_id`: `origem` (canal de entrada) · `cidade` · `estado` · `UTM` (`utm_source`, `utm_medium`, `utm_campaign`) · `campanha` · `imóvel` (`property_id` de interesse) · `bairro` · `faixa de preço` · `objetivo` (morar, investir, alugar) · `intenção` (comprar agora, pesquisar, comparar).

Campo não informado fica `null`/lacuna declarada, nunca inferido como certeza.

## 5. Estrutura da capability

- **Lead Capture Normalizer** — recebe e organiza os campos de captura por lead.
- **Behavior Engine** — observa o comportamento individual e agregado dos leads: como chegam, como respondem, onde esfriam, o que visitam. Produz **fatos comportamentais**, não conclusões.
- **Insight Engine** — cruza os fatos do Behavior Engine para produzir **conclusões acionáveis**: origem que converte, bairro em alta, campanha que traz lead frio. Toda conclusão carrega confidence, evidence e volume analisado.
- **Radar Feed** — traduz insight em sinal de oportunidade/risco para o Radar.
- **Search Intelligence** — traduz padrão de busca e intenção em inteligência de demanda orgânica: pautas, silos, páginas faltantes, termos em ascensão (mais amplo que "SEO Advisor" — cobre a demanda de busca como um todo).
- **Campaign Advisor** — traduz padrão de conversão em recomendação de campanha/canal/orçamento para o Campaign Provider (Meta Ads é um provider possível — detalhe de implementação).
- **Creative Advisor** — recomenda workflow criativo/ângulo ao Creative Studio com base no que engajou.
- **Distribution Advisor** — entrega score histórico por corretor/perfil ao Assignment Engine.
- **Learning Recorder** — registra o aprendizado como evidência, ligado à Memory do runtime.

## 6. Workflows

`LEAD_DATA_CAPTURE` · `LEAD_BEHAVIOR_OBSERVE` · `LEAD_INSIGHT_DETECT` · `LEAD_RADAR_SIGNAL_EMIT` · `LEAD_SEARCH_RECOMMEND` · `LEAD_CAMPAIGN_RECOMMEND` · `LEAD_CREATIVE_RECOMMEND` · `LEAD_DISTRIBUTION_RECOMMEND` · `LEAD_LEARNING_RECORD`

Toda saída é recomendação para decisão humana ou insumo para outra capability — nunca execução.

## 7. Confidence, evidence e volume

Toda recomendação declara três coisas, sempre juntas:

- **Confidence** — quão forte é o padrão (alto/médio/baixo, conceitual).
- **Evidence** — quais leads/campos/períodos sustentam a conclusão.
- **Volume analisado** — quantos leads/eventos entraram na leitura.

Regras: confidence **nunca substitui** evidence; padrão sem volume suficiente é estado honesto (`insufficient_data`), nunca conclusão inventada; toda recomendação é **explicável** — a YZI declara quais fatores considerou e por que recomenda.

## 8. Destinos das recomendações

- **Radar** — sinal fundamentado (oportunidade, risco, tendência), com o porquê e para onde aponta.
- **Search Intelligence → Site/conteúdo** — pauta e silo orgânico sugeridos; nunca publicação automática.
- **Campanhas** — escalar/pausar/ajustar por canal, consistente com o papel do módulo Tráfego (leitura + recomendação).
- **Creative Studio** — workflow criativo preferencial por tipo de imóvel/público, com evidência de engajamento.
- **Assignment Engine** — score histórico por corretor/perfil; nunca reatribui lead em andamento.

## 9. Nota arquitetural — generalização para o YZI OS

O par **Behavior Engine + Insight Engine** é agnóstico de vertical: qualquer módulo do YZI OS que gere leads/eventos pode usar o mesmo padrão (capturar → observar → concluir → recomendar com confidence/evidence/volume). A versão atual é especializada para IMOB; o motor pode ser promovido futuramente ao Core do YZI OS. **Sem mover a capability agora.**

## 10. Estados honestos

`capturing` · `observing` · `insufficient_data` · `insight_detected` · `signal_emitted_to_radar` · `search_recommendation_ready` · `campaign_recommendation_ready` · `creative_recommendation_ready` · `distribution_recommendation_ready` · `recommendation_accepted` · `recommendation_ignored` · `learning_recorded`

## 11. Próxima Capability

**Esta capability entrega:** recomendações explicadas com confidence, evidence e volume — por destino (Radar, busca orgânica, campanha, criativo, distribuição).

**Consumida por:** Radar (sinais) · Site/conteúdo (pautas) · Tráfego / futura Campaign Capability (ajustes de campanha) · Creative Studio (workflow criativo preferencial) · Assignment Engine (score histórico) · Operating Surface (leituras da YZI visíveis ao gestor).

## 12. Fora do escopo

Sem implementação, código, SQL, API, modelo de ML real, banco, execução automática de campanha/conteúdo/reatribuição ou efeito externo. Mapa da capability para autorização futura.

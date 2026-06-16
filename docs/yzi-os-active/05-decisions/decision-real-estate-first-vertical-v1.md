# Decisão — Corretores/Imobiliárias como Primeira Vertical Concreta (v1)

**Data:** 2026-06-15
**Status:** Ativa
**Escopo:** Escolha da primeira vertical concreta para construção prática do YZI OS e a camada de ingestão/indexação semântica de ativos que ela exige. Não altera a definição central do produto.

---

## 1. Decisão

A primeira vertical concreta para construir o YZI OS na prática será **corretores/imobiliárias**, com foco inicial em **João Pessoa**: Radar de oportunidades, dominação de território e transformação de ativos internos desorganizados em oportunidades comerciais.

## 2. Contexto

Estávamos escolhendo onde gastar tempo agora entre três frentes: Café com Pam, corretores/imobiliárias e campanha política. A decisão é avançar primeiro com imobiliária como vertical de validação prática, sem mudar o núcleo decisão + ação contínua de [`../00-product/product-definition.md`](../00-product/product-definition.md).

## 3. Por que imobiliária/corretores primeiro

- Dor mais direta e monetizável.
- Mercado forte em João Pessoa, com alto potencial de tráfego, território e captação.
- Imobiliárias e corretores já têm ativos internos espalhados (planilhas, fotos, Drive, PDFs, materiais de lançamento, leads antigos, conversas, proprietários, imóveis, contatos) — fora de um sistema inteligente, sem busca semântica e sem cruzamento com demanda real.
- O YZI OS pode transformar esse acervo morto em inteligência operacional.
- A lógica imobiliária constrói componentes horizontais reutilizáveis depois em campanha política e Café com Pam.

**Tese central:** o YZI OS transforma **ativos internos desorganizados + sinais externos de demanda** em **oportunidades acionáveis**.

## 4. O que será construído de forma reutilizável

Território, mapa visual, base de contatos, Radar contínuo, conteúdo, agenda, ações autorizadas e Command Center — todos horizontais, não exclusivos do imobiliário.

## 5. Asset Intake & Semantic Index Layer

**Camada de Ingestão e Indexação Semântica de Ativos** — parte essencial do YZI OS, sobretudo em verticais onde o cliente já possui ativos espalhados.

- **Recebe:** planilhas, fotos, PDFs, materiais de lançamento, pastas de Drive, links, leads, conversas, briefings, catálogos, documentos, registros comerciais.
- **Transforma em:** ativos estruturados, busca semântica, contexto operacional, oportunidades cruzáveis com o Radar e material reutilizável para conteúdo, campanhas, follow-up e decisão.

Para imobiliária/corretor:
- **Ativos internos** = imóveis, fotos, leads, materiais de lançamento, proprietários, terrenos, bairros, construtoras, conversas, histórico comercial.
- **Sinais externos** = buscas, bairros em alta, lançamentos, demanda por tipologia, concorrência, tráfego, comportamento territorial.
- **Oportunidade** = compra, venda, captação, reativação de lead, campanha, conteúdo, parceria, comissão.

> Exemplo: a Pitanga Imobiliária já tem imóveis, fotos, leads e materiais, mas mortos em planilhas e Drive. A YZI organiza, indexa, entende semanticamente, cruza com demanda do mercado e mostra onde isso vira captação, venda e comissão.

## 6. O que o Radar deve mostrar

Oportunidades acionáveis priorizadas — sinal + fonte + intenção + fit + ação + impacto + próximo passo — cruzando ativos internos indexados com sinais externos de demanda territorial, conforme [`../02-modules/radar-module-definition.md`](../02-modules/radar-module-definition.md). Não é Google Trends embutido.

## 7. Relação com campanha política

A vertical imobiliária constrói componentes que depois servem à campanha política: território, mapa visual, base de contatos, pautas/demandas, Radar contínuo, conteúdo, agenda, ações autorizadas e Command Center. A campanha **não** é criada agora.

## 8. Relação com Café com Pam

Café com Pam continua importante, mas vem depois como validação de operação consultiva/criativa. Com Asset Intake, busca semântica, Radar, Command Center, ações e autorizações já construídos, fica mais fácil — seus ativos também são desorganizados (fotos, briefings, referências, orçamentos, leads, posts, materiais criativos).

## 9. O que NÃO significa

- Não transformar o core do YZI OS em imobiliário (segue valendo "não é uma vertical imobiliária" da definição de produto).
- Não abandonar Café com Pam. Não criar campanha política agora.
- Não implementar ainda. Não criar integração/API, schema ou SQL agora.
- Não criar documentação gigante nem 20 agentes.
- Não transformar o Radar em Google Trends nem o Command Center em dashboard técnico.

## 10. Próximo passo recomendado

Criar **depois** (não agora) um documento curto de arquitetura da primeira vertical: `../04-implementation/real-estate-first-vertical-simulation-v1.md`. Nada fora de `docs/yzi-os-active/` sem autorização explícita.

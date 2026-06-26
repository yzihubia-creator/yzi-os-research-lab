# Evidência — Radar YZIHUB v0.1

## Objetivo

Substituir o placeholder genérico de `/cockpit/radar` por uma tela Radar v0.1
com estado honesto: enquadramento de tema em estado local (sem persistência) e
estrutura de análise em blocos vazios, sem API, backend, SQL ou dados fake.

## Tipo de alteração

Funcionalidade real mínima (tela), não placeholder genérico — porém ainda sem
fonte de dados. Recomendações explicitamente aguardam autorização humana.

## Arquivos alterados

- `platform/src/components/yzi-os/radar-v0.tsx` (novo — client component).
- `platform/src/app/cockpit/radar/page.tsx` (passa a renderizar `RadarV0`).

## O que a tela faz

- Cabeçalho do módulo (back-link, badge "em preparação", título, descrição
  reaproveitada de `getCockpitModule`).
- `YziAlert` honesto: sem fonte conectada, sem dado automático, recomendações
  aguardam autorização humana.
- Campo `YziInput` de tema/mercado em `useState` local — não salva, não busca,
  não dispara análise.
- Botão `disabled` ("Análise automática indisponível nesta fase") — sem ação.
- Bloco "Tema analisado" que ecoa apenas o que o usuário digitou (input do
  próprio usuário, não dado inventado).
- 6 blocos de análise em estado vazio honesto: Sinais, Nível de oportunidade,
  Por que importa, Próxima ação recomendada, Dados ausentes, Fonte necessária.

## Validações realizadas

- `npm run lint`: passou (exit 0).
- `npm run build`: passou (exit 0); rota `/cockpit/radar` compila (21 rotas).
- Hooks do harness ativos durante a edição (sem bloqueio: sem service role,
  sem MCP, dentro de path de produto autorizado).

## Lacunas conhecidas (reais)

- Nenhuma fonte/API conectada; análise não é gerada automaticamente.
- Nada é persistido — o tema some ao recarregar.
- Modelo de dados futuro proposto (não implementado): `radar_runs` e
  `radar_findings`. Sem SQL nesta fase.
- 1ª integração externa candidata para fase 2: Tavily/Brave Search (simples);
  depois Google Search Console (dado próprio).

## Próximo passo sugerido

- Validar visualmente a tela autenticada e, se aprovado, fechar com `/yzi-close`
  mediante autorização de commit local.
- Em task futura: decidir entre persistência mínima (`radar_runs`) ou 1ª fonte
  externa simples — uma de cada vez.

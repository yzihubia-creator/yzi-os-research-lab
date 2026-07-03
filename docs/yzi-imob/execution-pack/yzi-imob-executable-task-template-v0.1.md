# YZI IMOB — Executable Task Template v0.1

Template padrão para toda task futura de tela/feature do YZI IMOB. Copiar, preencher todas as seções e responder todas as perguntas obrigatórias. Task sem template preenchido não deve ser executada.

---

## Estado atual

<último commit fechado, branch, telas/rotas existentes relevantes>

## Arquivo fonte lido

- `docs/yzi-imob/yzi-imob-ux-ui-operating-system-map-v0.1.md`
- `docs/yzi-imob/execution-pack/yzi-imob-multitenant-boundary-v0.1.md`
- <outros specs relevantes>

## Objetivo

<uma frase: qual tela/feature será criada e qual etapa do fluxo principal ela serve>

## Ativo central

<como esta unidade se conecta ao imóvel (ou a lead/deal/campanha/documento/comissão subordinados ao imóvel)>

## Tenant boundary

<qual boundary se aplica; como o tenant ativo é assumido; confirmação de que nenhum dado atravessa tenant>

## Escopo permitido

<lista explícita do que pode ser feito>

## Fora de escopo

<lista explícita do que não pode ser feito nesta unidade>

## Rotas/componentes permitidos

<rotas e arquivos que podem ser criados/tocados — nada além disso>

## Regras de UI

Confirmar os 7 itens: estado atual; próxima ação; o que a YZI pode fazer; o que depende de humano; integração/canal envolvido; ID operacional quando fizer sentido; aprendizado/evidência.

## Regras de dados honestos

<dado de exemplo declarado como exemplo; nenhum dado global disfarçado de dado real; nenhum estado fake de integração>

## Validação

<checks a executar: escopo, boundary, lint/build quando aplicável, regra de UI>

## Commit

Não commitar sem autorização humana. Sugestão de mensagem: `<tipo>(yzi-imob): <resumo>`. Sem push.

## Proibições

<proibições específicas da unidade, além das padrão: sem service role, sem credenciais, sem MCP, sem dependência nova, sem SQL, sem push>

---

## Perguntas obrigatórias (toda task deve responder)

1. Qual tela/feature será criada?
2. Qual tenant boundary se aplica?
3. Quais IDs operacionais aparecem?
4. O que a YZI pode fazer nesta tela?
5. O que depende de humano?
6. Existe integração? Qual, e em que estágio (planejada/simulada/real)?
7. Existe dado real? Se não, o exemplo está declarado como exemplo?
8. Existe execução real? Se sim, onde está a aprovação humana?
9. Quais arquivos podem ser tocados?

Qualquer pergunta sem resposta clara bloqueia a task.

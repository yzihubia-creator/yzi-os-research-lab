# YZI IMOB — Interaction Language v1 (FOUNDATION)

Define o **comportamento** do produto — não aparência, não React, não animação. Como a YZI age, como os Workspaces mudam de estado e como cada interação acontece. Nenhum wireframe pode ignorar esta linguagem.

## Relação com as fundações
Quarta fundação, junto de Runtime Language, Product Architecture e Visual Language. Reusa o Workspace Lifecycle e os Workspace States já definidos; aqui define o **comportamento** deles, sem alterá-los.

## 1. Como a YZI aparece
Presença que entra, informa e recua — nunca permanente.
- **Inicia:** anuncia em uma frase o que vai fazer e sai de cena.
- **Trabalha:** presença discreta de trabalho em andamento, sem bloquear o usuário.
- **Termina:** volta com resultado, justificativa e a ação disponível.
- **Alerta:** aparece quando há risco ou bloqueio, sempre com a razão.
- **Recomenda:** apresenta recommendation e confidence; aceitar ou ignorar é do humano.
- **Espera aprovação:** mostra o que preparou e para, aguardando a decisão humana.

## 2. Como os Workspaces mudam de estado
Transição do caminho principal:
```
Empty → Preparing → Working → Review → Approved → Done
```
`Waiting` e `Error` são ramificações desse fluxo. Mapeia os Workspace States oficiais da Visual Language v1; `Done` é o estado finalizado (Finalizar). A mudança de estado é sempre visível e honesta.

## 3. Como approvals aparecem
Nunca popup. Nunca modal invasivo. Sempre **fluxo natural**: a aprovação surge no contexto do Workspace, como próxima etapa do ciclo, não como interrupção.

## 4. Como uploads aparecem
Fila · preview · progresso real. Nunca spinner infinito. O usuário vê o que subiu, o que falta e o estado de cada item.

## 5. Como background jobs aparecem
O usuário **nunca espera olhando**. A YZI continua trabalhando em segundo plano e avisa quando há resultado. Sem tela travada aguardando.

## 6. Como erros aparecem
Humanos, sem stack, sem código técnico. Sempre nesta ordem:
```
Problema → Impacto → Como resolver
```

## 7. Como loading aparece
Nunca tela branca. Sempre **skeleton** com contexto do que está por vir. O usuário entende o que carrega enquanto carrega.

## 8. Como listas funcionam
Busca · filtro · ordenação. Sem poluição visual. A lista serve à decisão, não ao volume de dados.

## 9. Como o Canvas funciona
Quatro tipos, cada um com regras próprias:
- **Editor:** foco em um objeto; estado salvo; preview do resultado.
- **Catálogo:** busca/filtro/ordenação; selecionar abre o Inspector.
- **Timeline:** cronologia de eventos; leitura, não edição pesada.
- **Kanban:** estágios operacionais; mover um card muda o estado real.

## 10. Como o Inspector se comporta
- **Muda** conforme o item selecionado.
- **Recolhe** quando não há seleção ou quando o foco é total no Workspace.
- **Fixa** quando o usuário precisa mantê-lo aberto.
- **Acompanha** a seleção, sempre contextual ao item ativo.

## 11. Como a navegação acontece
Trocas suaves, sem sensação de "página web". O usuário nunca sente que abriu outra página — sempre entra em outro **Workspace**.

## Resultado e próxima fase
Com este documento, as quatro fundações — **Runtime Language · Product Architecture · Visual Language · Interaction Language** — estão prontas para os wireframes. A próxima fase passa a se chamar **YZI Workspace Wireframes v1** (não "Operating Wireframes"): desenhamos workspaces que resolvem decisões operacionais, não telas.

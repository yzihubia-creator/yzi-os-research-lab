# /yzi-imob-design-screen

## Objetivo
Converter uma tela futura do YZI IMOB em estrutura visual compatível com o Dashboard Visual System, mantendo estados honestos.

## Quando usar
Ao especificar ou criar qualquer tela nova do YZI IMOB.

## Entradas esperadas
- Task preenchida no `yzi-imob-executable-task-template-v0.1.md`.
- Mapa UX/UI e Execution Pack.
- Dashboard Visual System / brandbook vigente.

## Procedimento
1. Confirmar rota e etapa do fluxo no mapa.
2. Estruturar a tela cobrindo os 7 itens da regra de UI:
   - estado atual;
   - próxima ação;
   - ação YZI (o que a YZI pode fazer);
   - dependência humana;
   - integração/canal envolvido;
   - ID operacional quando fizer sentido;
   - evidência/aprendizado.
3. Declarar todo dado de exemplo como exemplo (estado honesto).
4. Manter consistência com o visual system.

## Saídas esperadas
Estrutura da tela (seções, cards, estados) com os 7 itens da regra de UI cobertos e dados honestos.

## Proibições
- Não inventar dado real.
- Não criar rota fora do mapa.
- Não quebrar o Dashboard Visual System.
- Não simular integração como se estivesse conectada.

## Checklist final
- [ ] 7 itens da regra de UI presentes.
- [ ] Estados honestos (exemplo declarado como exemplo).
- [ ] Visual system respeitado.
- [ ] Rota confirmada no mapa.

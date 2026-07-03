# /yzi-imob-read-operating-map

## Objetivo
Ler o mapa UX/UI e o Execution Pack do YZI IMOB antes de qualquer task, extraindo o contexto operacional da unidade.

## Quando usar
No início de toda task de tela/feature do YZI IMOB, antes de qualquer implementação.

## Entradas esperadas
- `docs/yzi-imob/yzi-imob-ux-ui-operating-system-map-v0.1.md`
- `docs/yzi-imob/execution-pack/yzi-imob-execution-pack-v0.1.md`
- A task proposta.

## Procedimento
1. Ler o mapa UX/UI e o Execution Pack.
2. Identificar a etapa do fluxo principal que a task serve.
3. Confirmar a rota no mapa (atual ou futura prioritária).
4. Identificar como a unidade se conecta ao ativo central (imóvel).
5. Listar os IDs operacionais envolvidos.
6. Extrair as regras de UI aplicáveis (7 itens).
7. Apontar próximos riscos (boundary, integração, dado fake).

## Saídas esperadas
Síntese curta: etapa do fluxo; rota; ativo central; IDs operacionais; regra de UI aplicável; próximos riscos.

## Proibições
- Não implementar nada.
- Não alterar o mapa ou o Execution Pack.
- Não inventar rota ou módulo fora do mapa.

## Checklist final
- [ ] Mapa e Execution Pack lidos.
- [ ] Etapa do fluxo identificada.
- [ ] Rota confirmada no mapa.
- [ ] IDs operacionais listados.
- [ ] Riscos apontados.

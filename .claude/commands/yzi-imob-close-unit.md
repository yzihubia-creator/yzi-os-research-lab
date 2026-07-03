# /yzi-imob-close-unit

## Objetivo
Fechar uma unidade YZI IMOB com escopo restrito, validações registradas, staging explícito e commit local somente com autorização humana. Complementa `/yzi-close`.

## Quando usar
No fim de toda unidade validada do YZI IMOB.

## Entradas esperadas
- Lista dos arquivos da unidade.
- Resultado das validações (escopo, boundary, lint/build quando aplicável).
- Autorização humana explícita de commit (quando existir).

## Procedimento
1. `git status` — conferir o working tree.
2. Confirmar que apenas os arquivos da unidade serão commitados.
3. Separar pendências externas (arquivos fora da unidade ficam de fora e são reportados).
4. Rodar lint/build quando a unidade tocar código.
5. Staging explícito arquivo a arquivo; verificar `git diff --cached --name-only`.
6. Commitar somente com autorização humana explícita; reportar o hash.
7. Nunca fazer push.

## Saídas esperadas
Staging verificado restrito à unidade; hash do commit (se autorizado); pendências externas listadas separadamente.

## Proibições
- Não commitar sem autorização humana explícita.
- Não incluir arquivos fora do escopo da unidade.
- Não fazer push remoto.

## Checklist final
- [ ] Staging restrito verificado.
- [ ] Lint/build quando aplicável.
- [ ] Autorização humana registrada.
- [ ] Pendências externas separadas.
- [ ] Sem push.

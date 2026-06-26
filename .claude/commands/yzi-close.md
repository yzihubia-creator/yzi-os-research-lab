---
description: Fechar uma unidade validada — evidência curta e commit local sob autorização
argument-hint: [opcional: nome da unidade]
---

# /yzi-close

## Quando usar
Depois de uma implementação validada, para fechar a unidade.

## Objetivo
Preparar o fechamento limpo: conferir estado, evidência curta se necessária, e commit local somente com autorização explícita.

## Escopo permitido
- Rodar `git status` e conferir o diff dos arquivos da unidade.
- Rodar `npm run lint` e `npm run build` se aplicável.
- Criar evidência curta em `docs/specs/implementation/evidence/` se necessária.
- Fazer commit local **apenas** com frase de autorização humana explícita.

## Escopo proibido
- Push remoto sem autorização explícita.
- Commit sem autorização explícita.
- Documentação longa.
- Incluir no commit arquivos fora do escopo da unidade.

## Passos mínimos
1. `git status` — mostrar o working tree.
2. Conferir o diff apenas dos arquivos da unidade.
3. Rodar lint/build se aplicável.
4. Criar evidência curta se a unidade exigir.
5. Sugerir mensagem de commit.
6. Parar e aguardar autorização humana explícita antes de commitar.

## Saída esperada
- Status do working tree.
- Arquivos prontos para o commit (somente os da unidade).
- Validações executadas.
- Mensagem de commit sugerida.
- Confirmação de que aguarda autorização humana (sem push remoto).

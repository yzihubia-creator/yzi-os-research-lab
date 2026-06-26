---
description: Corrigir um erro concreto de lint, build, UI ou comportamento, sem refatorar
argument-hint: [erro observado]
---

# /yzi-fix

## Quando usar
Quando houver um erro concreto já observado (lint, build, UI ou comportamento).

## Objetivo
Corrigir apenas o erro reportado, com a menor mudança possível.

## Escopo permitido
- Alterar somente o que é necessário para corrigir o erro.

## Escopo proibido
- Refatorar fora do escopo do erro.
- Reabrir arquitetura ou trocar abordagem sem necessidade.
- Criar documentação.
- Usar MCP, SQL ou credencial de serviço.
- Commit ou push por conta própria.

## Passos mínimos
1. Reproduzir/confirmar o erro reportado.
2. Identificar a causa raiz mínima.
3. Aplicar a correção menor possível.
4. Rodar a validação mínima aplicável (lint/build ou repro).
5. Explicar causa e correção em 2-3 linhas.

## Saída esperada
- Erro corrigido (qual era).
- Arquivo(s) alterado(s).
- Validação executada e resultado.
- Risco residual, se houver.

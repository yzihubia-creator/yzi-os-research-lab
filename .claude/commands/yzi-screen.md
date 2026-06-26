---
description: Criar ou refinar uma tela/UI do YZI OS de forma pequena e controlada
argument-hint: [tela ou ajuste desejado]
---

# /yzi-screen

## Quando usar
Quando o pedido for criar ou refinar tela, UI, componente visual ou layout dentro do YZI OS (cockpit).

## Objetivo
Entregar a tela ou ajuste com o menor escopo possível, reaproveitando o design system existente, sem drift e sem dados fake.

## Escopo permitido
- Editar telas/componentes em `platform/src/` relacionados ao pedido.
- Reusar tokens, primitives e padrões visuais já existentes no projeto.

## Escopo proibido
- Inventar dados fake ou métricas.
- Criar backend, SQL, migrations ou usar service role / MCP.
- Misturar Jurema, Café com Pam ou verticais sem autorização explícita.
- Criar documentação longa.
- Commit ou push sem autorização humana explícita.

## Passos mínimos
1. Confirmar em 1 linha o objetivo da tela e o path autorizado.
2. Inspecionar o design system / componentes existentes a reaproveitar.
3. Implementar a menor mudança que atende o pedido.
4. Rodar `npm run lint` e `npm run build` em `platform/`.
5. Parar e relatar — sem commitar por conta própria.

## Saída esperada
- Arquivos alterados.
- Validações executadas (lint/build) e resultado.
- Riscos / pendências.
- Próximo passo sugerido.

---
description: Revisar uma mudança já feita antes do commit (boundaries + lint/build)
argument-hint: [opcional: o que foi alterado]
---

# /yzi-review

## Quando usar
Após implementar uma mudança e antes de fechar/commitar.

## Objetivo
Verificar rapidamente se a mudança respeita as boundaries do YZI OS e está pronta para commit.

## Escopo permitido
- Ler o diff e os arquivos alterados.
- Rodar `npm run lint` e `npm run build` se houve alteração de produto.

## Escopo proibido
- Refatorar ou "melhorar" fora do que foi revisado.
- Criar arquivos novos além de evidência curta, se necessária.
- Commit ou push por conta própria.

## Passos mínimos (checar)
1. Auth/RLS boundary respeitada.
2. Paths dentro do escopo autorizado.
3. Sem dados fake, sem credencial de serviço Supabase, sem MCP, sem SQL indevido.
4. UI/UX mínima coerente (se aplicável).
5. `npm run lint` e `npm run build` passam (se produto).
6. Precisa de evidência curta? Sim/Não.

## Saída esperada
- Veredito: aprovado / ajustes necessários.
- Achados críticos (se houver).
- Validações executadas e resultado.
- Recomendação: pode commitar (aguardando autorização) ou corrigir antes.

---
description: Trabalhar ou preparar um módulo do YZI OS sem inventar funcionalidade
argument-hint: [módulo: dashboard|crm|financeiro|agenda|radar|trafego-pago|assistente|...]
---

# /yzi-module

## Quando usar
Quando o pedido envolver um módulo do cockpit YZI OS: Dashboard, CRM, Financeiro, Agenda, Radar, Tráfego Pago, Assistente YZI, Módulos.

## Objetivo
Avançar o módulo com escopo pequeno, separando claramente placeholder honesto de funcionalidade real, sem inventar dados.

## Escopo permitido
- Editar o módulo indicado em `platform/src/`.
- Criar placeholder honesto e explícito quando a funcionalidade real ainda não existe.

## Escopo proibido
- Misturar verticais (Jurema, Café com Pam, core) sem autorização explícita.
- Criar backend/SQL/migrations ou usar service role / MCP sem autorização.
- Inventar métricas, dados ou integrações inexistentes.
- Documentação longa.
- Commit ou push sem autorização humana explícita.

## Passos mínimos
1. Confirmar qual módulo e se é placeholder ou funcionalidade real.
2. Confirmar o path autorizado.
3. Implementar a menor unidade coerente.
4. Registrar lacunas reais (o que ainda falta).
5. Rodar `npm run lint` e `npm run build` se alterar produto.
6. Parar e relatar — sem commitar por conta própria.

## Saída esperada
- Módulo trabalhado e tipo de alteração (placeholder vs real).
- Arquivos alterados.
- Validações executadas.
- Lacunas reais conhecidas.
- Próximo passo sugerido.

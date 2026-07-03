# /yzi-imob-plan-integration

## Objetivo
Planejar integrações do YZI IMOB em nível documentário, sem conectar nada e sem credenciais reais.

## Quando usar
Quando uma tela/feature envolve canal ou API externa: Meta Ads/MCP, WhatsApp, Google, Higgsfield, Foreplay, Supabase Storage.

## Entradas esperadas
- Canal/integração alvo.
- `docs/yzi-imob/execution-pack/yzi-imob-multitenant-boundary-v0.1.md`.
- Inventário de APIs existente (`docs/yzi-imob/yzi-imob-api-setup-inventory-v0.1.md`).

## Procedimento
1. Descrever o que a integração fará no fluxo principal.
2. Mapear tokens/conexões por tenant (`connection_id` subordinado a `tenant_id`).
3. Marcar todos os pontos que exigem aprovação humana antes de action real.
4. Separar o que é planejado / simulado / real (estado honesto).
5. Registrar dependências externas como pendências separadas.

## Saídas esperadas
Plano documentário: função da integração; tokens por tenant; pontos de aprovação humana; estágio (planejada/simulada/real); pendências externas.

## Proibições
- Não usar nem armazenar credenciais reais.
- Não conectar serviço algum.
- Não configurar MCP.
- Não executar chamada real.

## Checklist final
- [ ] Tokens modelados por tenant.
- [ ] Zero credenciais no plano.
- [ ] Aprovações humanas marcadas.
- [ ] Estágio da integração declarado honestamente.

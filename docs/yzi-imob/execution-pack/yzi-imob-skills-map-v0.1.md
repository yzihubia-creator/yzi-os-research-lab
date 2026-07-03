# YZI IMOB — Skills Map v0.1

Skills operacionais do YZI IMOB, definidas em nível documentário. Materialização real segue o padrão do projeto (`.claude/commands/` para comandos operacionais; `.agents/skills/` é governado por `skills-lock.json` e exige unidade autorizada).

## 1. yzi-imob-read-operating-map

- **Objetivo**: ler `docs/yzi-imob/yzi-imob-ux-ui-operating-system-map-v0.1.md` e extrair fluxo, rotas, regras de UI e IDs operacionais antes de qualquer implementação.
- **Quando usar**: início de toda task de tela/feature do YZI IMOB.
- **Entradas**: o mapa UX/UI e a task proposta.
- **Saídas**: síntese curta — etapa do fluxo afetada, rota, regras de UI aplicáveis, IDs operacionais envolvidos.
- **Proibições**: não implementar; não alterar o mapa; não inventar rota ou módulo fora do mapa.
- **Checklist**: [ ] mapa lido; [ ] etapa do fluxo identificada; [ ] rota confirmada; [ ] IDs listados.

## 2. yzi-imob-validate-tenant-boundary

- **Objetivo**: validar se uma task respeita o boundary multi-tenant (`yzi-imob-multitenant-boundary-v0.1.md`).
- **Quando usar**: antes de implementar e antes de fechar qualquer unidade com dados.
- **Entradas**: descrição da tela/feature, dados exibidos, integrações previstas.
- **Saídas**: parecer aprovado/bloqueado com o checklist de boundary preenchido.
- **Proibições**: não aprovar dado global disfarçado de dado de cliente; não aprovar service role em frontend; não aprovar vazamento entre tenants.
- **Checklist**: o checklist de revisão de boundary do documento multi-tenant.

## 3. yzi-imob-design-screen

- **Objetivo**: converter uma tela futura em estrutura visual compatível com o Dashboard Visual System, mantendo estado honesto.
- **Quando usar**: ao especificar ou criar tela nova do YZI IMOB.
- **Entradas**: task no template executável, mapa UX/UI, brandbook/visual system vigente.
- **Saídas**: estrutura da tela cobrindo os 7 itens da regra de UI, com dados de exemplo declarados como exemplo.
- **Proibições**: não inventar dado real; não criar rota fora do mapa; não quebrar consistência visual.
- **Checklist**: [ ] 7 itens da regra de UI presentes; [ ] estados honestos; [ ] visual system respeitado.

## 4. yzi-imob-plan-integration

- **Objetivo**: planejar integrações (Meta, WhatsApp, Google, Higgsfield, Foreplay, Supabase) sem conectar nada sem autorização.
- **Quando usar**: quando uma tela/feature envolve canal ou API externa.
- **Entradas**: canal/integração alvo, tenant boundary, inventário de APIs existente.
- **Saídas**: plano documentário — o que a integração fará, quais tokens por tenant, o que exige aprovação humana.
- **Proibições**: não usar credenciais reais; não conectar serviço; não configurar MCP; não executar chamada real.
- **Checklist**: [ ] tokens por tenant; [ ] nenhuma credencial no plano; [ ] pontos de aprovação humana marcados.

## 5. yzi-imob-close-unit

- **Objetivo**: fechar unidade com validação de escopo, lint/build quando aplicável, staging explícito e commit local sem push.
- **Quando usar**: fim de toda unidade validada (complementa `/yzi-close`).
- **Entradas**: arquivos da unidade, autorização humana explícita de commit.
- **Saídas**: `git diff --cached --name-only` restrito à unidade, hash do commit, pendências externas separadas.
- **Proibições**: não commitar sem autorização; não incluir arquivos fora do escopo; não fazer push.
- **Checklist**: [ ] staging restrito verificado; [ ] lint/build quando aplicável; [ ] autorização registrada; [ ] sem push.

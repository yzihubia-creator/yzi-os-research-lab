# YZI IMOB — UX/UI & Operating System Map v0.1

Mapa mestre de UX, UI, navegação, módulos, rotas e fluxo operacional do YZI IMOB.
Documento estratégico-operacional. Não autoriza refatoração imediata; serve como mapa para as próximas unidades.

## Princípio central

YZI IMOB não é uma coleção de telas. É uma operação comercial visual centrada no imóvel.

O imóvel é o ativo central. Cada imóvel deve poder se conectar a: cadastro; mídia; card no catálogo; página no site; silo orgânico; criativos; campanha; WhatsApp; lead; corretor; pipeline; documento comercial; comissão; venda/perda; aprendizado.

## Fluxo principal

`Formulário → Catálogo → Pasta Comercial → Site/Silo → Conteúdo IA → Ads → WhatsApp → Pipeline → Documento/Comissão → Aprendizado`

- **Formulário**: corretor fornece dados reais.
- **Catálogo**: imóvel vira card operacional.
- **Pasta Comercial**: YZI organiza estratégia do imóvel.
- **Site/Silo**: imóvel entra na estrutura orgânica.
- **Conteúdo IA**: YZI prepara copy, criativos e campanha.
- **Ads**: escala a oferta aprovada.
- **WhatsApp**: YZI atende e qualifica.
- **Pipeline**: time acompanha oportunidade.
- **Documento/Comissão**: contrato manual e financeiro rastreável.
- **Aprendizado**: venda/perda melhora próximos imóveis.

## Navegação-alvo (futura, não implementar agora)

A sidebar atual é MVP e será reorganizada depois.

- **Visão Geral**: Dashboard · Atividade · Próximas ações
- **Imóveis**: Catálogo · Cadastrar Imóvel · Pastas Comerciais · Site & Silos
- **Atendimento**: Chat YZI · Leads · Agenda · Follow-ups
- **Comercial**: Pipeline · Propostas · Documentos · Financeiro
- **Marketing**: Conteúdo IA · Criativos · Campanhas · Radar
- **Operação**: Conexões · Tokens & APIs · DevOps · Logs

## Rotas atuais (MVP)

Ainda não representam a navegação final.

| Rota | Papel |
|---|---|
| `/cockpit/yzi-imob/catalogo` | Catálogo de Imóveis |
| `/cockpit/yzi-imob/imoveis` | Pastas Comerciais dos Imóveis |
| `/cockpit/yzi-imob/site` | Site e Silos Orgânicos |
| `/cockpit/yzi-imob/studio` | Conteúdo IA / Estúdio Comercial |

## Rotas futuras prioritárias (ordem sugerida)

1. `/cockpit/yzi-imob/atendimento` → Chat YZI / WhatsApp
2. `/cockpit/yzi-imob/pipeline` → Kanban Comercial
3. `/cockpit/yzi-imob/financeiro` → Financeiro mínimo
4. `/cockpit/yzi-imob/conexoes` ou ajuste global de Conexões → Tokens/APIs/MCPs
5. `/cockpit/yzi-imob/devops` → Operação técnica e logs

## Regra de UI

Toda tela do YZI IMOB precisa mostrar:

- estado atual;
- próxima ação;
- o que a YZI pode fazer;
- o que depende de humano;
- qual integração/canal está envolvido;
- qual ID operacional aparece quando fizer sentido;
- qual aprendizado ou evidência existe.

## Ações YZI (executar ou preparar)

Organizar cadastro; identificar campos faltantes; sugerir silo; gerar título; gerar descrição; gerar CTA; preparar página; gerar briefing visual; preparar criativos; preparar campanha; atender lead; qualificar lead; sugerir próximo passo; gerar follow-up; registrar aprendizado.

## IDs operacionais (conceitual, sem banco nesta task)

`tenant_id` · `property_id` · `lead_id` · `broker_id` · `deal_id` · `document_id` · `commission_id` · `asset_id` · `connection_id`

## Referência conceitual — Palmier

Palmier organiza humano + agente em torno de um ativo central, a timeline. YZI IMOB deve organizar humano + YZI em torno de ativos comerciais: imóvel; lead; deal; campanha; documento; comissão.

Não copiar stack, código ou desktop app do Palmier. A lição é:

`Ativo central → ações do agente → aprovação humana → estado → histórico → execução`

## Regra de execução — Execution Pack

Antes de criar novas telas grandes, criar um Execution Pack com specs, skills, subagentes e critérios de implementação, para evitar gambiarra.

Este mapa deve guiar:

- reorganização futura da sidebar;
- criação do Chat YZI;
- criação do Pipeline Kanban;
- criação do Financeiro mínimo;
- criação de Conexões/Tokens/APIs;
- criação de DevOps/Logs.

## Escopo

Este documento não autoriza refatoração imediata. Nenhuma tela, rota, sidebar ou código foi alterado nesta unidade.

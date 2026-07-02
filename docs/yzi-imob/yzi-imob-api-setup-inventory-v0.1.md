# YZI IMOB — Inventário de Setups e APIs v0.1

## 1. Visão geral

Este documento lista o que precisa ser configurado para operar o YZI IMOB em produção: contas, acessos e integrações necessários para colocar em funcionamento a operação completa — orgânico estruturado + Ads assistido + atendimento WhatsApp + qualificação + agendamento + DevOps operacional + aprendizado por imóvel vendido.

Não é um guia técnico de implementação. É um levantamento de planejamento: o que existe, o que falta e em que ordem resolver.

## 2. Tabela de setups

| Área | Integração/API | Para que serve | Conta/acesso necessário | Status atual | Prioridade | Observações |
|---|---|---|---|---|---|---|
| Site e domínio | Domínio + deploy (Vercel/host) | Publicar a página de cada imóvel | Acesso ao registrador do domínio ou domínio próprio | não conectado | essencial | ver risco de domínio em terceiro |
| Banco de dados | Supabase (ou banco do projeto) | Guardar imóveis, mídia, leads, histórico | Projeto Supabase do tenant | não conectado | essencial | já é o padrão do YZI OS |
| Cadastro de imóveis | Formulário interno do YZI IMOB | Entrada estruturada de dados do imóvel | — (interno) | não implementado nesta fase | essencial | pré-requisito de tudo abaixo |
| Upload de fotos/vídeos | Storage (Supabase Storage ou equivalente) | Guardar mídia por imóvel | Bucket configurado | não implementado nesta fase | essencial | sem upload real ainda |
| WhatsApp oficial | WhatsApp Business API (Meta ou provedor/BSP) | Atendimento e conversão de leads | Número dedicado + verificação Meta | não conectado | essencial | pode começar com provedor temporário |
| Atendimento da YZI | Lógica de atendimento sobre o canal WhatsApp | Entender pedido, qualificar, encaminhar | Depende do WhatsApp oficial ativo | não implementado nesta fase | essencial | depende do item anterior |
| Qualificação de leads | Regras/critérios de qualificação | Separar interesse real de curiosidade | — (interno) | não implementado nesta fase | essencial | parte da lógica de atendimento |
| Agendamento de visitas | Agenda interna ou Google Calendar API | Marcar visita com corretor | Calendário do corretor/imobiliária | não conectado | importante | pode começar manual |
| Instagram/Facebook | Conta profissional + Página | Publicar conteúdo social do imóvel | Conta Instagram profissional + Página Facebook | não conectado | essencial | pré-requisito de Meta Ads |
| Meta Ads | Meta Business Manager + conta de anúncios | Rodar campanha assistida | Business Manager + método de pagamento | não conectado | essencial | trava até método de pagamento existir |
| Google Search Console | Verificação de propriedade do site | Medir indexação e termos de busca | Acesso ao domínio verificado | não conectado | importante | depende do site estar no ar |
| Google Analytics | Tag no site | Medir tráfego e comportamento | Propriedade GA4 | não conectado | importante | depende do site estar no ar |
| Google Trends / tendência | Fonte de sazonalidade e demanda | Orientar prioridade de conteúdo/campanha | Sem conta obrigatória (consulta pública) | não consultado nesta fase | fase 2 | automação fica para depois |
| Radar de concorrentes/criativos | Foreplay ou equivalente | Analisar criativos ativos no mercado | Conta na ferramenta escolhida | não conectado | fase 2 | não essencial para o primeiro MVP |
| Logs, monitoramento e DevOps | Observabilidade do site/integrações | Saber quando algo quebrou | Acesso à infraestrutura de deploy | parcial (via stack do YZI OS) | essencial | sustentação, não feature |

## 3. APIs essenciais para MVP

Mínimo para rodar a primeira operação real:

- Domínio, site e deploy.
- Supabase (ou banco do projeto).
- Storage para fotos e vídeos.
- WhatsApp oficial ou provedor temporário (BSP).
- Google Analytics.
- Search Console.
- Meta Business Manager.
- Página do Facebook.
- Conta Instagram profissional.
- Conta de anúncios (Meta Ads).
- Pixel / Conversions API — planejado, não essencial no dia um.

## 4. APIs que ficam para fase 2

- Meta Ads API completa (automação de campanha).
- Instagram Graph API (publicação automática).
- Facebook Pages API.
- Google Trends automatizado.
- Foreplay API ou radar criativo equivalente.
- Search Console API (hoje: só verificação manual).
- Google Calendar API (hoje: agendamento manual).
- CRM externo, se a imobiliária já usar um.
- Automações avançadas de publicação multi-canal.

## 5. Checklist de acesso do cliente

O que a imobiliária precisa entregar:

- [ ] Domínio ou acesso ao domínio.
- [ ] Logo e identidade visual.
- [ ] Conta Meta Business.
- [ ] Página do Facebook.
- [ ] Instagram profissional.
- [ ] Conta de anúncios.
- [ ] Método de pagamento da Meta.
- [ ] Número de WhatsApp.
- [ ] Acesso ao provedor do WhatsApp, se já existir um.
- [ ] Lista inicial de imóveis.
- [ ] Fotos e vídeos dos imóveis.
- [ ] Corretores e responsáveis.
- [ ] Horários de atendimento.
- [ ] Política de repasse de leads.
- [ ] E-mail comercial.
- [ ] Acesso ao Google Analytics/Search Console, se já existir.

## 6. Ordem recomendada de setup

1. Domínio e site.
2. Banco e storage.
3. Cadastro de imóveis.
4. WhatsApp.
5. Analytics e Search Console.
6. Meta Business, Página e Instagram.
7. Pixel.
8. Campanhas assistidas.
9. APIs avançadas (fase 2).

## 7. Riscos e dependências

- Cliente não ter Business Manager organizado.
- Conta Meta bloqueada ou em revisão.
- WhatsApp sem verificação oficial.
- Domínio registrado em nome de terceiro.
- Instagram pessoal em vez de profissional.
- Fotos e vídeos de baixa qualidade dos imóveis.
- Falta de padrão no cadastro dos imóveis.
- Tráfego pago iniciado antes do site/silo/página estarem prontos.
- Dependência de APIs que exigem aprovação externa (Meta, Google) com prazo fora do controle do YZI OS.

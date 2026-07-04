# YZI IMOB — Property Catalog Capability Spec v0.1 (rev. 1)

Especificação documentária da capability **Property Catalog**. Complementa o Execution Pack e o padrão de capability de `property-search.ts`. Sem implementação.

Invariantes do Execution Pack — tenant boundary, human-in-the-loop, evidence, approval, estados honestos, context engineering — aplicam-se **por referência** (`yzi-imob-multitenant-boundary-v0.1.md`, `yzi-imob-approval-queue-spec-v0.1.md`, `yzi-imob-context-builder-spec-v0.1.md`) e não são repetidas aqui.

Princípio de identidade: **uma capability resolve um problema operacional do gestor; nunca é definida por API, MCP, SDK ou provider** — esses pertencem apenas à implementação futura.

## 1. Objetivo

Organizar o ciclo de vida do imóvel como ativo operacional, do cadastro do corretor até o imóvel entrar pronto no Creative Studio. É a capability que dá **completude e prontidão comercial** ao imóvel antes de qualquer criativo ou campanha existir.

Problema operacional que resolve: *"como sei que este imóvel está pronto para ser vendido, divulgado e compartilhado — e o que ainda falta?"*

## 2. Valor para o negócio

- **Problema que resolve:** imóveis entram na operação incompletos, sem mídia ou sem padrão, e travam tudo que vem depois (site, criativo, campanha).
- **Ganho operacional:** cada imóvel tem estado de prontidão visível; a operação sabe o que falta sem depender de memória do corretor.
- **Decisão que melhora:** priorizar o que completar primeiro e decidir quando um imóvel está pronto para investir em divulgação.

## 3. Fluxo

`Corretor → Cadastro → Armazenamento de mídia → Pasta do imóvel → Assets → Status de completude → Link do site → UTM → Compartilhar → Creative Studio`

- **Corretor**: origem humana do dado real do imóvel.
- **Cadastro**: formulário estrutura os campos do imóvel.
- **Armazenamento de mídia**: guarda a mídia bruta enviada (via Media Storage Provider).
- **Pasta do imóvel**: agrupamento lógico do imóvel (cadastro + mídia + metadados).
- **Assets**: mídia organizada e vinculada à pasta (fotos, vídeos, plantas).
- **Status de completude**: leitura honesta do que falta para publicar.
- **Link do site**: URL pública do imóvel quando completo o suficiente.
- **UTM**: parametrização de rastreio para tráfego pago/orgânico.
- **Compartilhar**: link + UTM prontos para envio.
- **Creative Studio**: entrega do Creative Brief do imóvel pronto.

## 4. Estrutura da capability

Módulos conceituais (padrão capability sobre o Runtime):

- **Property Record** — estado estrutural do imóvel (campos, `property_id`, `tenant_id`).
- **Media Pipeline** — organiza a mídia entre o armazenamento e a Pasta do imóvel.
- **Completeness Engine** — lê Property Record + Assets e monta o que falta.
- **Publish Gate** — decide se o imóvel pode gerar Link do site (bloqueia se incompleto).
- **Share Package** — monta link + UTM + resumo do imóvel para compartilhamento.
- **Creative Brief Builder** — prepara o **Creative Brief**: saída oficial do ciclo de vida do imóvel, consumida pelo Creative Studio.

## 5. Workflows

- `PROPERTY_INTAKE` — corretor cadastra/edita o imóvel.
- `PROPERTY_MEDIA_UPLOAD` — mídia entra no armazenamento e é vinculada à pasta.
- `PROPERTY_COMPLETENESS_CHECK` — monta o status de completude, read-only.
- `PROPERTY_PUBLISH_REQUEST` — propõe geração de link do site (exige completude mínima; aprovação humana conforme Approval Queue).
- `PROPERTY_UTM_BUILD` — prepara parâmetros UTM para o link.
- `PROPERTY_SHARE_PREPARE` — monta pacote de compartilhamento.
- `PROPERTY_CREATIVE_BRIEF` — entrega o Creative Brief ao Creative Studio.

Parada honesta em qualquer etapa quando faltar dado ou autorização.

## 6. Inputs

`tenant_id` · `user_id` (corretor/gestor) · `property_id` (quando já existe) · campos do cadastro (tipo, dormitórios, endereço, preço, descrição) · referências de mídia (nunca binário na capability) · `required_context` do workflow ativo · critério de publicação do tenant.

## 7. Outputs

- **Property Record atualizado** — campos + `missing_fields` honestos.
- **Assets vinculados** — mídia com `media_id`, origem e status.
- **Completeness Report** — o que falta e bloqueadores de publicação.
- **Publish Result** — `link_url` (ou `null` + motivo honesto do bloqueio).
- **UTM Set** — `utm_source`, `utm_medium`, `utm_campaign` ligados ao `property_id`.
- **Share Package** — link + UTM + resumo prontos para envio.
- **Creative Brief** — o que o Creative Studio recebe: `property_id`, assets aprovados, resumo comercial, ângulo sugerido e restrições (o que não pode virar copy).

## 8. Media Storage Provider

O armazenamento de mídia é uma **abstração** (Media Storage Provider); Supabase Storage ou equivalente é detalhe de implementação. A capability: pede referência de mídia já resolvida pela camada de storage; valida que a mídia pertence ao `tenant_id`/`property_id` corretos; nunca expõe credencial ou URL assinada além do necessário. Falha de upload é estado honesto (`asset_pending`/`asset_failed`).

## 9. Integração com Site

O Link do site só nasce via `PROPERTY_PUBLISH_REQUEST` quando o Publish Gate confirma completude mínima. A capability entrega ao Site apenas dados públicos + assets aprovados, nunca campos internos. Mudança de status (ex.: vendido) reflete no Site como despublicação/atualização, não deleção silenciosa.

## 10. Estados honestos

`incomplete` · `media_pending` · `ready_to_publish` · `published` · `share_ready` · `brief_ready` · `blocked` (com motivo).

## 11. Próxima Capability

**Esta capability entrega:** imóvel completo, publicado e rastreável + **Creative Brief** (assets aprovados, resumo comercial, restrições).

**Consumida por:** Creative Studio (Creative Brief como entrada obrigatória) · Visit Orchestration (imóvel visitável com estado confiável) · Lead Intelligence (imóvel/bairro/faixa como dimensão de padrão) · Operating Surface / módulo Imóveis (estado de prontidão visível ao gestor).

## 12. Fora do escopo

Sem implementação, código, SQL, API, provider real, upload real, link público real ou efeito externo. Mapa da capability para autorização futura.

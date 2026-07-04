# YZI IMOB — Creative Studio Capability Spec v0.1 (rev. 1)

Especificação documentária da capability **Creative Studio**. Complementa `yzi-imob-property-catalog-capability-spec-v0.1.md` e `yzi-imob-creative-engine-higgsfield-mcp-v0.1.md`. Sem implementação.

Invariantes do Execution Pack — tenant boundary, human-in-the-loop, evidence, approval, estados honestos, créditos — aplicam-se **por referência** (`yzi-imob-approval-queue-spec-v0.1.md`, `yzi-imob-ai-runtime-credits-boundary-v0.1.md`) e não são repetidas aqui.

Princípio de identidade: **a capability resolve um problema operacional; não é definida por API, MCP, SDK ou provider.** Higgsfield é um provider possível do Creative Provider — detalhe de implementação, nunca identidade da capability.

## 1. Objetivo

Transformar o Creative Brief do imóvel (entregue pelo Property Catalog) em criativos comerciais prontos para aprovação — sem inventar nada sobre o imóvel e sem publicar nada sem humano.

Problema operacional que resolve: *"como transformo cada imóvel em material de divulgação de qualidade sem depender de designer e sem risco de propaganda enganosa?"*

## 2. Valor para o negócio

- **Problema que resolve:** produzir criativo por imóvel é caro, lento e sem padrão; a maioria dos imóveis nunca ganha material de divulgação decente.
- **Ganho operacional:** todo imóvel completo pode gerar material comercial em escala, com identidade da marca e aprovação registrada.
- **Decisão que melhora:** qual imóvel merece campanha agora e qual formato usar — decidido com previews reais na mesa, não no escuro.

## 3. Posição no fluxo

`Property Catalog (Creative Brief) → Creative Studio → Aprovação humana → Tráfego`

Só recebe o Creative Brief quando o Property Catalog entregou imóvel com completude suficiente e mídia aprovada. Nunca gera criativo para imóvel incompleto.

## 4. Entradas

`fotos` · `vídeos` · `plantas` · `3D` · `PDF` (memorial/incorporação) · `memorial` · `logo` · `brand` (identidade do tenant) — todas via Creative Brief, como referências de mídia (nunca binário cru). Entrada ausente fica `null`/lacuna declarada.

Regra de segurança imobiliária (de `yzi-imob-creative-engine-higgsfield-mcp-v0.1.md`): melhorar apresentação, formato, recorte e atmosfera é permitido; **inventar cômodo, fachada, piscina, vista, acabamento, metragem ou localização é proibido**.

## 5. Estrutura da capability

- **Creative Workflow Selector** — escolhe o **workflow criativo** (não apenas o template): sequência completa de template + copy + formato + canal-alvo, a partir do Creative Brief e do objetivo comercial.
- **Copy Generator** — prepara headline, legenda e CTA a partir do contexto do imóvel.
- **Prompt Builder** — monta o briefing visual estruturado para o Creative Provider.
- **Creative Provider** — abstração do gerador visual (Higgsfield é um provider possível; a capability não muda se o provider mudar).
- **Creative QA** — verifica cada peça gerada **antes do preview**: aderência ao brief, regra de segurança imobiliária, brand aplicado, formato correto. Peça reprovada no QA não chega ao gestor.
- **Preview Assembler** — organiza as variações aprovadas no QA em carrossel apresentável.
- **Approval Handoff** — encaminha o pacote à Approval Queue.
- **Resource Manager** — administra os recursos de geração (créditos, cota por tenant, limites por período), não apenas o contador de créditos.
- **Evidence Recorder** — registra o que foi visto, gerado, decidido e por quem.

## 6. Workflow (pipeline)

`selecionar workflow criativo → gerar copy → preparar briefing visual → acionar Creative Provider → Creative QA → montar previews → apresentar carrossel → receber aprovação → registrar evidence → administrar recursos`

Workflows candidatos do runtime: `CREATIVE_WORKFLOW_SELECT` · `CREATIVE_COPY_GENERATE` · `CREATIVE_PROMPT_PREPARE` · `CREATIVE_PROVIDER_REQUEST` · `CREATIVE_QA_CHECK` · `CREATIVE_PREVIEW_ASSEMBLE` · `CREATIVE_CAROUSEL_PRESENT` · `CREATIVE_APPROVAL_REQUEST` · `CREATIVE_EVIDENCE_RECORD` · `CREATIVE_RESOURCE_CHECK`.

Parada honesta quando faltar material, recurso ou autorização. A recomendação de workflow criativo é **explicável**: a YZI declara quais fatores pesaram (material disponível, objetivo, histórico do que converteu) e por que sugeriu aquele formato.

## 7. Templates iniciais (dentro dos workflows criativos)

- **Tour Narrado** — vídeo guiado com narração sequencial. Requer fotos/vídeos suficientes e copy roteirizado por cômodo. Saída: vídeo com narração e legendas.
- **Carrossel** — sequência de imagens para social/feed. Requer mínimo de fotos aprovadas, headline + legenda por card. Saída: cards ordenados com CTA final.
- **Story** — peça vertical curta. Requer poucas fotos/vídeos, copy direto, brand aplicado. Saída: peça vertical com CTA único.
- **Lançamento** — kit multi-formato para novo imóvel/empreendimento. Requer mais material (fotos, 3D, memorial, PDF) e copy de posicionamento. Sempre exige aprovação (maior investimento).

Cada template declara: material mínimo, estrutura de copy, formato de saída e regra de aprovação.

## 8. Creative Provider

Toda solicitação ao provider carrega: `tenant_id`, `property_id`, workflow criativo, briefing final, regras de segurança imobiliária e estimativa de recurso. A resposta é sempre **candidato a preview** (passa por Creative QA e aprovação), nunca conteúdo final. Trocar de provider não altera contratos da capability.

## 9. Recursos e aprovação

O Resource Manager valida limite antes de acionar o provider e registra consumo depois; bloqueio honesto (`resource_limit_reached`) em vez de geração parcial disfarçada. Todo carrossel apresentado gera item na Approval Queue com `prepared_payload_summary`, `risk_level` e estimativa de recurso — regras completas por referência ao Execution Pack.

## 10. Estados honestos

`missing_material` · `workflow_selected` · `copy_ready` · `brief_ready` · `generating` · `qa_failed` · `preview_ready` · `awaiting_approval` · `approved` · `rejected_needs_revision` · `resource_limit_reached` · `blocked_by_policy` · `evidence_recorded`

## 11. Próxima Capability

**Esta capability entrega:** criativos aprovados por humano, com evidence, prontos para veicular — por imóvel, com link + UTM herdados do Property Catalog.

**Consumida por:** Tráfego / futura Campaign Capability (criativo aprovado como insumo de campanha) · Lead Intelligence (desempenho por workflow criativo alimenta recomendações futuras) · Operating Surface / módulo Creative Studio (fila de aprovação visível ao gestor).

## 12. Fora do escopo

Sem implementação, código, SQL, API, conexão real a provider, geração real, publicação real, banco ou efeito externo. Mapa da capability para autorização futura.

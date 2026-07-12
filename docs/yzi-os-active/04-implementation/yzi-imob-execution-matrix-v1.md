# YZI IMOB — Execution Matrix v1

Sem arquitetura nova. Extrai o padrão validado em `PREPARE_PROPERTY_CONTACT` (3371cbe→9c970d8) e organiza os workflows restantes em unidades executáveis, com approval gates, ownership e batches.

Fontes auditadas (leitura): `lib/yzi-os/*`, `lib/yzi-imob/runtime/*`, `app/cockpit/yzi-imob/*`, `components/yzi-imob/*`, `docs/yzi-imob/execution-pack/*`, `docs/harness-engineering/*`, `docs/yzi-imob/growth-os/*`, `docs/yzi-os-active/04-implementation/*`, `.codex/agents/*`, `.claude/agents/*`, `.claude/commands/yzi-imob-*`.

## 1. Estado atual

Runtime core (`lib/yzi-imob/runtime/*`, `lib/yzi-os/runs.ts|actions.ts`) funciona ponta a ponta para 1 workflow: types, context-builder (sem mock fallback), workflow-selector, tool-registry (declarativo, não executa), persistence (puro), runtime-api. Approval Queue não é módulo — decisão via `yzi_action_requests`+`run-decision.ts`. Intent Router não existe como arquivo separado (coberto pelo selector).

Schema: `yzi-imob-core-entities-manual-sql-pack-v1.sql` (properties, leads, property_interests, conversations, messages, run_contexts) + `yzi-imob-prepare-contact-run-manual-sql-pack-v1.sql` (runs/steps/artifacts/action_requests+RPCs). Sem tabela broker/visit/proposal/media.

Frontend: 24 rotas em `app/cockpit/yzi-imob/`; só `runtime/page.tsx` usa Supabase real, as demais (imoveis, corretores, clientes, atendimento, marketing, growth/*, agenda, radar, apis-creditos, etc.) são mock.

Docs de autoridade já existentes (não redocumentar): Execution Pack completo, 8 harnesses, Growth OS congelado, Material System v1. 6 agentes `.codex/agents/*.toml` já definidos (evidence-closer, frontend-implementer, integration-planner, product-architect, tenant-boundary-reviewer, ux-ui-architect) — nenhum autoriza commit/push.

## 2. Princípios

1. Imóvel é o ativo central — todo workflow referencia `property_id`.
2. Novos workflows são entradas no `WORKFLOW_REGISTRY` existente, não runtimes paralelos.
3. Sem mock como autoridade em fluxo normal — só em integração ainda não contratada.
4. Approval gate nomeado por artifact contract (`yzi.imob.<artifact>.v1`), igual a `contact_draft`.
5. RLS + tenant_id sempre. Sem service role/SQL direto no frontend.

## 3. Catálogo (61 workflows, 6 famílias)

| Família (qtd) | Padrão de approval | Bloqueio principal | Owner |
|---|---|---|---|
| Operação comercial (13): conversa, qualificação, handoff, corretor, visita, proposta | A leitura/estado · B handoff/corretor/visita/proposta | broker/visit/proposal ausentes | commercial-runtime / conversation-runtime |
| Imóvel e mídia (9): cadastro, qualidade, descrição, publicação, link | A interno · B publicação site | tabela media+bucket | data-foundation / creative-runtime |
| Creative Studio (18): briefing→copy→geração→aprovação→artifact | A draft/ajuste · B geração paga (Higgsfield/ElevenLabs) · C consumo | media/creative_asset + bucket + contrato assinado | creative-runtime |
| Growth (11): sinais→diagnóstico→estratégia→campanha→resultado | A leitura/plano · B campanha/orçamento | engine real (hoje mock-brain) | growth-runtime |
| Distribuição (11): publicar, agendar, campanhas Meta, integrações | B publicação/campanha · A sync | credenciais do cliente (titularidade do cliente) | surface-integration |
| Governança (10): consumo, reserva, limite, gasto, alerta | A leitura · B reserva/orçamento · C bloqueio/alerta | modelo de créditos indefinido | cost-governance |

`PREPARE_PROPERTY_CONTACT` já implementado — referência, não reabrir. Detalhe workflow-a-workflow disponível na auditoria original desta unidade (histórico da sessão); consolidado aqui por família conforme owner/approval/dependência compartilhados.

**Prioritários do 1º ciclo** (sem bloqueio de schema): RECEIVE_CONVERSATION, QUALIFY_LEAD, UPDATE_LEAD_TEMPERATURE, CREATE_FOLLOWUP, UPDATE_PROPERTY_LEAD_STATE, COMPLETE_PROPERTY_INFO, VALIDATE_PROPERTY_QUALITY, PREPARE_PROPERTY_DESCRIPTION, GENERATE_SHARE_LINK, CREATE_BRIEFING, SELECT_MEDIA, GENERATE_COPY, GENERATE_SCRIPT, PREPARE_CAPTIONS.

## 4. Approvals

**A — sem aprovação**: reversível/interno/baixo risco (leitura, diagnóstico, draft, classificação). **B — antes da execução**: externo/custoso/irreversível (publicar, enviar, campanha, créditos, orçamento, atribuir corretor). **C — exceção**: automático, para diante de baixa confiança/conflito/custo acima do limite/risco legal. Gate só no artifact final nomeado, nunca em toda tela/etapa.

## 5. Subagentes (contrato apenas — não criar arquivos nesta unidade)

| Subagente | Missão | Arquivos permitidos | Condição de parada |
|---|---|---|---|
| yzi-data-foundation | Schema (broker/visit/proposal/media) | SQL packs novos, `runtime/types.ts` (extensão) | tabela sem decisão de produto |
| yzi-commercial-runtime | Handoff/visita/proposta | `workflows.ts`/`persistence.ts` (entradas), `runs.ts` (funções) | depende de data-foundation |
| yzi-conversation-runtime | Qualificação/temperatura/follow-up | idem, sem tocar commercial | nenhuma — inicia já |
| yzi-creative-runtime | Creative Studio | `capabilities/*`, `workflows.ts` (entradas) | bloqueado até bucket+contrato |
| yzi-growth-runtime | Growth sobre dados reais | `growth-intelligence/*` | bloqueado até engine real |
| yzi-cost-governance | Créditos/consumo/orçamento | schema credits (proposta), `lib/yzi-os/*` custo | depende de modelo de créditos |
| yzi-surface-integration | Publicação/campanhas | `integrations/*` (novo, adapters) | não edita runtime core |
| yzi-runtime-integrator | Reconcilia contratos compartilhados | `workflow-selector.ts`,`tool-registry.ts`,`types.ts` | único autorizado a resolver conflito |
| yzi-quality-auditor | Lint/build/evidência | nenhum (revisão) | — |

Todos: sem commit/push autônomo; evidência ao integrador via relatório curto.

## 6. Ownership de alto conflito

Owner único **yzi-runtime-integrator**: `workflow-selector.ts`, `tool-registry.ts`, `runtime/types.ts`, `context-builder.ts`, `runs.ts`, `actions.ts`, `workflows.ts`, `persistence.ts`, `yzi-imob-shell-v2.tsx`, `yzi-imob-sidebar-v2.tsx`, `yzi-imob-workspace-*`. SQL packs: owner único **yzi-data-foundation**. Cada `page.tsx` de rota: owner o subagente de domínio (ex.: imoveis→data-foundation, atendimento→conversation-runtime). Integrações externas nunca editam runtime core — só propõem adapter ao integrador.

## 7. DAG

Foundation (broker/visit/proposal/media) bloqueia Commercial. Conversation e parte de Creative (briefing/copy/script) não dependem, iniciam já. Growth depende de engine real (fora desta unidade). Cost Governance depende de decisão de modelo de créditos. Todos convergem em `runtime-integrator → surface-integration → quality-auditor → validação humana`.

## 8. Batches

1. **Conversa real** (pequena/média) — conversation-runtime, sem dependência — aceite: `atendimento/` sem `mock-data.ts`.
2. **Imóvel completo** (pequena) — data-foundation, sem dependência — aceite: `imoveis/` sem mock.
3. **Foundation de pessoas** (pequena) — schema broker/visit/proposal, data-foundation — aceite: SQL revisado por humano antes de apply.
4. **Operação comercial completa** (grande) — commercial-runtime, depende do Batch 3 — aceite: corretor/visita/proposta reais.
5. **Creative draft-only** (média) — creative-runtime, sem dependência — aceite: preview aprovável sem custo externo.
6. **Governança de créditos** (média) — cost-governance, depende de decisão de modelo — aceite: dashboard de gasto real.
7. **Mídia gerada** (grande) — creative-runtime+surface-integration, depende de 5,6+contrato — aceite: 1ª imagem com créditos debitados.
8. **Growth real** (grande) — growth-runtime, depende de decisão de produto — aceite: estratégia de sinais reais.
9. **Distribuição externa** (grande) — surface-integration, depende de 5-8+credenciais do cliente — aceite: 1ª campanha Meta publicada.

## 9. Skills por agente

`/yzi-module` (runtime/lib) · `/yzi-screen` (tela) · `/yzi-fix` (correção pontual) · `/yzi-review` (antes do commit) · `/yzi-imob-close-unit`+`/yzi-close` (fechamento) · `/yzi-imob-read-operating-map` (leitura obrigatória antes de iniciar) · `/yzi-imob-plan-integration` (integração externa) · `/yzi-imob-validate-tenant-boundary` (qualquer tabela/coluna/tenant_id). Revisores bloqueantes: `yzi-imob-tenant-boundary-reviewer`, `yzi-imob-ux-ui-architect`, `yzi-imob-product-architect`.

## 10. Validação

`npm run lint`+`npm run build` por batch. Nenhuma tela migra mock→real sem remover o import mock. Nenhuma tabela nova sem RLS+tenant_id. Approval gate testado com caso de rejeição, não só aprovação.

## 11. Riscos e decisões humanas pendentes

Conflito em arquivo compartilhado sem integrador (mitigado por §6). Modelo de créditos indefinido bloqueia Batches 6/7. Distribuição de corretor (captador-prioridade vs. lançamento-Uber) sem decisão de schema — bloqueia Batch 3/4. Growth engine real sem RESEARCH suficiente. Integrações externas dependem de credenciais do cliente — não bloquear o resto do produto por isso.

## 12. Primeiro batch recomendado

**Batch 1 (Conversa real) + Batch 2 (Imóvel completo) em paralelo.**
- Agentes: yzi-conversation-runtime (Batch 1), yzi-data-foundation (Batch 2) — não compartilham arquivo de escrita.
- Arquivos do Batch 1: rotas/componentes `atendimento/*`, `runtime/workflows.ts` (novas entradas), `runs.ts` (novas funções de leitura). Proibido: tocar `imoveis/*`, `workflow-selector.ts`/`tool-registry.ts`/`types.ts` (só integrador).
- Arquivos do Batch 2: rotas/componentes `imoveis/*`, `runtime/workflows.ts` (entradas de imóvel). Proibido: tocar `atendimento/*`, arquivos de alto conflito (§6).
- Integração: só via `yzi-runtime-integrator`, ao final de ambos, para mesclar entradas em `workflows.ts`.
- Testes de encerramento: `npm run lint`+`npm run build`; tela sem import de `mock-data.ts`; approval gate testado com rejeição onde aplicável.
- Decisões humanas que ainda bloqueiam trabalho posterior: modelo de créditos, schema de corretor, engine real de Growth.

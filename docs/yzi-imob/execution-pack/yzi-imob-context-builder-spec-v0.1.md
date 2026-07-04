# YZI IMOB — Context Builder Spec v0.1

Especificação documentária do Context Builder do runtime YZI IMOB. Complementa `yzi-imob-runtime-backend-architecture-v0.1.md`, `yzi-imob-intent-router-workflow-selector-spec-v0.1.md`, `yzi-imob-tool-registry-spec-v0.1.md`, `yzi-imob-approval-queue-spec-v0.1.md` e `yzi-imob-ai-runtime-credits-boundary-v0.1.md`. Nada aqui autoriza implementação: sem código, SQL, API, Runtime ou banco.

## 1. Objetivo

**Finalidade.** Montar o **menor contexto útil** para a YZI decidir a próxima ação de um workflow já classificado. É a camada oficial de **Context Engineering** do Runtime: transforma fontes cruas e dispersas em um pacote compacto, seguro, rastreável e auditável. **Papel:** recebe do Workflow Selector o `workflow_id` e o `required_context`; entrega ao YZI Orchestrator um pacote pronto para decisão. Não decide ação, não chama tool, não executa.

Regra forte: `A YZI só deve ver o que é necessário para a próxima decisão do workflow ativo.`

## 2. Responsabilidades

**O que faz:** resolve as fontes exigidas pelo `required_context`; filtra tudo por `tenant_id` e permissões de `user_id`; compacta histórico/logs/payloads em summaries; monta os Context Blocks por prioridade; aplica orçamento de tokens; anexa proveniência e frescor a cada bloco; gera o fingerprint do contexto; retorna erro honesto quando não pode montar com segurança.

**O que nunca faz:** misturar dados de tenants diferentes; incluir API keys, tokens, service role ou segredos; decidir ação, chamar tool ou executar efeito externo; inventar dado ausente (faltante vira erro, não preenchimento); carregar histórico/documento inteiro quando o resumo basta; montar contexto sem `tenant_id` ativo.

## 3. Posição no Runtime

`Runtime API → Intent Router → Workflow Selector → Policy/Governance → Context Builder → YZI Orchestrator → Tool Registry → Approval Queue → Executor → Evidence → Memory`

Só age depois de intenção classificada, workflow selecionado e policy aplicada; entrega contexto ao Orchestrator e nunca pula etapas.

## 4. Context Sources

Origens conceituais; cada uma só entra quando o `required_context` a exige.

`Tenant` (identidade, plano, módulos, boundary) · `User` (papel, permissões) · `Conversation` (intenção + histórico recente) · `Lead` (lead ativo, origem, estágio) · `CRM` (imóvel, deal, pipeline, comissão) · `Workflow` (passo, output contract, tools) · `Policies` (regras críticas, boundary, approval) · `Memory` (decisões/aprendizados resumidos) · `Knowledge Base` (conhecimento de produto/domínio) · `Tool Registry` (tools permitidas + contratos) · `Approval Queue` (pendências e decisões humanas) · `Runtime` (rota, módulo, estado) · `Evidence` (última evidência relevante) · `Usage` (consumo relevante ao limite) · `Credits` (política e saldo do tenant)

## 5. Context Blocks

Cada bloco tem origem rastreável e frescor próprio.

- **Core Context** — identidade do produto/módulo e regras invariantes.
- **Tenant Context** — `tenant_id`, plano, módulos, boundary, créditos.
- **Workflow Context** — `workflow_id`, passo atual, `output_contract`, tools previstas.
- **Conversation Context** — intenção atual e histórico recente resumido.
- **Knowledge Context** — conhecimento de produto/domínio necessário.
- **Memory Context** — decisões e aprendizados resumidos.
- **Tool Context** — tools permitidas e contratos resumidos (via Tool Registry).
- **Approval Context** — o que exige humano antes de executar.
- **Evidence Context** — última evidência relevante.
- **Execution Context** — rota, módulo, ativo ativo, estado atual, próxima ação.

Contexto por ativo (compacto, dentro de Execution Context): **property** (`property_id`, status, campos preenchidos/faltantes, mídia, silo/campanha status, leads resumidos, próxima ação); **lead** (`lead_id`, origem, imóvel de interesse, estágio, restrições de contato); **deal** (`deal_id`, property/lead vinculados, estágio, comissão, riscos); **connection** (`connection_id`, provedor, status, permissões, tools habilitáveis, **sem token/segredo**).

## 6. Prioridade dos blocos

Ordem conceitual — preservado primeiro, descartado por último sob restrição de orçamento:

`1 Core → 2 Tenant → 3 Workflow → 4 Approval → 5 Execution → 6 Tool → 7 Conversation → 8 Evidence → 9 Memory → 10 Knowledge`

Regra forte: `Boundary, tenant e workflow nunca são cortados por orçamento; conhecimento e memória cedem primeiro.`

## 7. Context Validation

- **Incluir** quando: exigido pelo `required_context`, pertence ao tenant ativo, usuário tem permissão e o dado está fresco.
- **Descartar** quando: irrelevante, redundante, expirado ou substituível por summary sem perda de decisão.
- **Bloquear** quando: dado de outro tenant, segredo/credencial ou fonte fora do escopo do workflow.
- **Retornar erro** quando: falta `tenant_id`; falta bloco obrigatório (tenant, workflow, policy, approval); excede orçamento mesmo após compactação; fonte desconhecida; contexto corrompido.

## 8. Token Budget

Conceitos, sem algoritmo: **priorização** (blocos entram na ordem da seção 6, orçamento gasto de cima para baixo); **compressão** (histórico, logs, payloads e listas longas viram summaries antes de entrar); **summaries** (cada fonte volumosa reduzida ao mínimo que preserva a decisão); **orçamento de contexto** (teto conceitual por execução; ultrapassá-lo aciona compactação e, persistindo, `context_overflow`). Preservar sempre: decisões humanas, aprovações, `tenant_id`, IDs operacionais, estado atual, campos faltantes, riscos, próxima ação, evidência mais recente.

## 9. Provenance

Todo bloco carrega **origem rastreável**: de qual Context Source veio, sob qual `tenant_id`/`user_id`, e quando foi resolvido. Conceito arquitetural apenas — nenhum dado entra sem procedência declarada, sustentando auditoria e Evidence First.

## 10. Freshness

Cada bloco declara **frescor**. Contexto antigo, expirado ou invalidado por evento posterior não pode passar por atual: `fresh` (válido para a decisão), `stale` (só com marcação explícita, nunca como estado real), `expired/invalid` (descartado ou vira erro, nunca silenciado).

## 11. Context Fingerprint

O pacote final recebe um **fingerprint** conceitual — assinatura do conjunto de blocos, fontes, versões e frescor que o compuseram. Objetivo: **auditoria** (saber o que a YZI viu ao decidir), **reprodutibilidade** (reconstruir a decisão a partir do mesmo contexto) e **evidência** (vincular decisão e execução ao contexto de origem). Sem algoritmo ou hash específico.

## 12. Integrações

- **Intent Router** — fornece a intenção classificada que delimita o contexto.
- **Workflow Selector** — entrega `workflow_id` e `required_context`; monta-se exatamente o pedido.
- **Tool Registry** — fonte das tools permitidas; só liberadas entram no Tool Context.
- **Approval Queue** — fornece pendências e decisões humanas do Approval Context.
- **Executor** — nunca chamado aqui; recebe contexto só indiretamente via Orchestrator.
- **Evidence** — recebe fingerprint e proveniência para registro auditável.
- **Memory** — fornece aprendizados resumidos (entrada); o que vira decisão volta adiante, fora desta camada.

## 13. Error States

`context_empty` · `context_incomplete` · `tenant_missing` · `workflow_missing` · `policy_missing` · `knowledge_missing` · `approval_missing` · `context_overflow` · `context_corrupted` · `unknown_source`

Todo estado é honesto e explícito; nunca se entrega contexto parcial disfarçado de completo.

## 14. Fora do MVP

Sem implementação, SQL, Runtime, API, Redis, vetores, embeddings, cache, banco ou código. Também fora: retrieval automático complexo; RAG global multi-tenant; contexto cross-tenant; memória autônoma de longo prazo; self-modifying context policy; carregamento automático de todos os docs.

## 15. Princípios e próximas specs

Aderência: AI First · Multi-Tenant · Tenant Boundary · Context Engineering · Dynamic Workflows · Tool-Based Runtime · Approval First · Evidence First · Human-in-the-loop · Estados honestos. Compatível com a arquitetura consolidada. Próximas specs sugeridas: Context Builder Data Model → Usage/Credits Data Model → Tool Registry Data Model → Approval Queue Data Model → Runtime API Skeleton → First read-only context flow.

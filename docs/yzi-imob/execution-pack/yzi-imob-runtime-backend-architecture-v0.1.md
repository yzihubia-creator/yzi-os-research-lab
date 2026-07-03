# YZI IMOB — Runtime Backend Architecture v0.1

Arquitetura backend/runtime do YZI IMOB, derivada do Execution Pack e dos princípios Anthropic (building effective agents; writing tools for agents; effective context engineering). Documento arquitetural — nada aqui autoriza implementação.

## 1. Decisão central

YZI IMOB não deve começar como agente autônomo gigante. Deve começar como **runtime multi-tenant com workflows explícitos**, orquestração governada, tools bem desenhadas, contexto controlado e aprovação humana para toda ação real. Começar simples; autonomia é conquista posterior, não ponto de partida.

## 2. Claude Code vs Claude API

- **Claude Code** é ferramenta de desenvolvimento do laboratório.
- **YZI em produção** usa Claude API/Anthropic API via backend seguro, com créditos, limites, logs e políticas por tenant.
- A conta Claude Code do desenvolvedor nunca é runtime de cliente final.

## 3. Arquitetura runtime

`Frontend → YZI Runtime API → YZI Orchestrator → Context Builder → Policy/Governance → Tool Registry → Agent/Workflow Executor → Approval Queue → Logs/Memory/Evidence → Supabase/Storage/Integrations`

## 4. Componentes backend

- **YZI Runtime API** — entrada única para intenções do usuário no produto; todo request carrega `tenant_id`.
- **YZI Orchestrator** — classifica a intenção, escolhe workflow/subagentes/tools e bloqueia risco antes de executar.
- **Context Builder** — monta o menor contexto útil por task (context engineering: alto sinal, baixo token, compaction quando crescer).
- **Policy/Governance Engine** — valida tenant boundary, permissões, plano, aprovação humana e proibições antes de qualquer tool.
- **Tool Registry** — expõe apenas tools permitidas por tenant, módulo, plano e estado de conexão; tools pequenas, namespaced, sem sobreposição.
- **Agent/Workflow Executor** — executa workflow determinístico ou chamada Claude API com as tools autorizadas; subagentes recebem contexto limpo.
- **Approval Queue** — fila de ações reais aguardando humano; nada real sai sem passar por ela.
- **Memory/Notes** — memória estruturada: decisões, aprendizados, estado resumido por ativo/tenant.
- **Usage/Credits** — conta tokens/custo/limites por tenant.
- **Evidence/Logs** — registra input, contexto usado, decisão, ação preparada/executada, erro e trilha de auditoria.

## 5. Padrões agentic permitidos

- Routing; prompt chaining; orchestrator-workers; evaluator-optimizer; human approval loop.
- Autonomia total só entra quando houver evals e logs suficientes (seção 10).

## 6. Tools iniciais agent-friendly

Tools conceituais (não endpoints crus). Regras comuns: propósito claro e único; `tenant_id` obrigatório; retorno compacto de alto sinal; nenhuma credencial; nenhuma execução real sem aprovação.

| Tool | Propósito |
|---|---|
| `yzi_imob_get_property_context` | Contexto compacto do imóvel: cadastro, mídia, silo, estado no fluxo, campos faltantes. |
| `yzi_imob_prepare_property_page` | Prepara (não publica) página/silo do imóvel: título, descrição, CTA. |
| `yzi_imob_prepare_ad_brief` | Prepara briefing de criativo/campanha da oferta aprovada. |
| `yzi_imob_get_lead_context` | Contexto compacto do lead: origem, imóvel de interesse, histórico, estágio no pipeline. |
| `yzi_imob_prepare_followup` | Prepara follow-up sugerido para aprovação (nunca envia). |
| `yzi_imob_submit_for_human_approval` | Envia ação preparada à Approval Queue com evidência anexa. |
| `yzi_imob_record_learning` | Registra aprendizado de venda/perda na memória estruturada do tenant. |

## 7. Context Pack mínimo

Toda execução recebe apenas: tenant summary; user role; module/route; active asset (imóvel/lead/deal); relevant IDs; task intent; allowed tools; approval policy; compact memory; last evidence; output contract. Nada além do necessário para a task.

## 8. Multi-tenant e segurança

- Todo request exige `tenant_id`; tools validam `tenant_id` de novo (defesa em profundidade).
- Credenciais nunca vão ao frontend; service role nunca no frontend (padrão Backend Foundation: RLS + RPCs seguras).
- Logs não podem vazar dados entre tenants.
- Usage/credits contabilizados por tenant.
- BYOK (chave própria do tenant) pode existir no futuro; não é MVP.

## 9. Aprovação humana obrigatória

Sempre exigem aprovação: publicar página; publicar post; criar/enviar campanha; enviar WhatsApp fora de resposta permitida; confirmar visita; alterar documento/contrato; registrar comissão como recebida; conectar API real; usar token/credencial nova.

## 10. Evals antes de autonomia

Antes de aumentar autonomia, criar evals com tarefas reais:

1. Preparar página de imóvel incompleto (deve apontar campos faltantes, não inventar).
2. Sugerir campanha com dados faltantes (deve pedir dados, não fabricar).
3. Qualificar lead sem inventar disponibilidade.
4. Preparar follow-up correto por estágio.
5. Bloquear ação sem `tenant_id`.
6. Bloquear execução real sem aprovação.

## 11. Ordem futura de implementação backend

1. Runtime architecture docs (este documento);
2. AI runtime/credits boundary;
3. Tool registry spec;
4. Context builder spec;
5. Approval queue spec;
6. Runtime API route skeleton;
7. First read-only tool;
8. First approval-only action;
9. Usage logging.

## Escopo

Documento arquitetural. Nenhum backend, API, SQL, MCP, Claude API ou integração foi criado/configurado nesta unidade.

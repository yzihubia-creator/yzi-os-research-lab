# YZI IMOB — Execution Pack v0.1

Pack operacional derivado de `docs/yzi-imob/yzi-imob-ux-ui-operating-system-map-v0.1.md`. Toda tela grande nova do YZI IMOB deve nascer a partir deste pack — nunca de improviso.

## Identidade

- **Produto**: YZI IMOB.
- **Natureza**: operação comercial imobiliária multi-tenant.
- **Ativo central**: o imóvel. YZI IMOB não é coleção de telas nem CRM genérico.
- **Modelo**: `Ativo central → ações do agente → aprovação humana → estado → histórico → execução`.

## Fluxo principal

`Formulário → Catálogo → Pasta Comercial → Site/Silo → Conteúdo IA → Ads → WhatsApp → Pipeline → Documento/Comissão → Aprendizado`

## Rotas atuais (MVP)

| Rota | Papel |
|---|---|
| `/cockpit/yzi-imob/catalogo` | Catálogo de Imóveis |
| `/cockpit/yzi-imob/imoveis` | Pastas Comerciais dos Imóveis |
| `/cockpit/yzi-imob/site` | Site e Silos Orgânicos |
| `/cockpit/yzi-imob/studio` | Conteúdo IA / Estúdio Comercial |

## Rotas futuras e ordem das próximas unidades

1. Chat YZI / Atendimento → `/cockpit/yzi-imob/atendimento`
2. Pipeline Kanban → `/cockpit/yzi-imob/pipeline`
3. Financeiro mínimo → `/cockpit/yzi-imob/financeiro`
4. Conexões / Tokens / APIs / MCPs → `/cockpit/yzi-imob/conexoes` ou ajuste global de Conexões
5. DevOps / Logs → `/cockpit/yzi-imob/devops`

## Regra de UI

Toda tela mostra: estado atual; próxima ação; o que a YZI pode fazer; o que depende de humano; qual integração/canal está envolvido; qual ID operacional aparece quando fizer sentido; qual aprendizado ou evidência existe.

## Regra de execução

Antes de criar qualquer tela grande:

1. Ler o mapa UX/UI (skill `yzi-imob-read-operating-map`).
2. Escrever a task usando `yzi-imob-executable-task-template-v0.1.md`.
3. Validar tenant boundary (`yzi-imob-multitenant-boundary-v0.1.md`).
4. Implementar dentro do escopo declarado, com estados honestos.
5. Fechar com validação, staging explícito e commit local autorizado, sem push.

## Artefatos do pack

- `yzi-imob-multitenant-boundary-v0.1.md` — regras multi-tenant obrigatórias.
- `yzi-imob-skills-map-v0.1.md` — skills operacionais.
- `yzi-imob-subagents-map-v0.1.md` — subagentes e responsabilidades.
- `yzi-imob-executable-task-template-v0.1.md` — template padrão de task.
- `yzi-imob-orchestrator-v0.1.md` — camada documentária de orquestração.
- `yzi-imob-skill-graph-v0.1.md` — grafo operacional de commands/subagentes.
- `yzi-imob-ai-runtime-credits-boundary-v0.1.md` — boundary de Claude API, créditos, uso por tenant e segurança de chaves.
- `yzi-imob-tool-registry-spec-v0.1.md` — especificação das tools permitidas, contratos, policies e estados.

## Nota sobre materialização de skills/subagentes

Neste repositório, skills reais são governadas por `skills-lock.json` (`.agents/skills/`) e comandos operacionais vivem em `.claude/commands/`; subagentes reais são artefatos controlados em `.claude/agents/`, criados apenas sob autorização humana explícita por arquivo. Este pack define skills e subagentes em nível documentário; a materialização exige unidade própria autorizada seguindo esse padrão.

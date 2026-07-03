# Memória do Projeto

YZI OS Research Lab é o laboratório de construção do YZI OS, plataforma operacional multi-tenant. YZI IMOB é o primeiro módulo vertical, centrado no imóvel como ativo comercial. Apenas fatos confirmados e decisões datadas; não duplicar `CLAUDE.md`, `AGENTS.md` ou Execution Pack.

## Decisões arquiteturais

- **[2026-06] SDD Lite / implementação-first**
  Decisão: specs mínimas quando necessário, implementar cedo, validar com lint/build, commit local por unidade.
  Consequência: evitar documentação extensa antes de execução.

- **[2026-06] Supabase multi-tenant foundation**
  Decisão: `tenant_id` é boundary operacional.
  Consequência: sem `tenant_id`, não existe dado operacional confiável.

- **[2026-06] Sem service role no frontend**
  Decisão: frontend usa anon/RLS/RPCs seguras (Backend Foundation v1.2).
  Consequência: service role nunca entra em `platform/src`.

- **[2026-06] Commit local sem push por padrão**
  Decisão: commits locais por unidade validada; push apenas com autorização humana explícita.
  Consequência: não fazer push automático.

- **[2026-06] Estados honestos na UI**
  Decisão: telas podem ter placeholders e estados vazios, mas não dados falsos como se fossem reais.
  Consequência: exemplo declarado como exemplo; integração não conectada aparece como não conectada.

- **[2026-07] YZI IMOB centrado no imóvel**
  Decisão: YZI IMOB não é CRM genérico nem coleção de telas.
  Consequência: todo módulo deve se conectar ao fluxo do imóvel.

- **[2026-07] Execution Pack multi-tenant**
  Decisão: próximas unidades YZI IMOB usam Execution Pack, Tenant Boundary, commands e subagentes.
  Consequência: task sem boundary/escopo claro deve ser bloqueada.

- **[2026-07] Claude Code vs Claude API**
  Decisão: Claude Code é ferramenta de desenvolvimento; runtime de cliente usa Claude API via backend seguro.
  Consequência: conta Claude Code do desenvolvedor não é runtime de produção.

- **[2026-07] Context Foundation raiz**
  Decisão: `CLAUDE.md` e `AGENTS.md` na raiz são contexto sempre-carregado.
  Consequência: prompts futuros devem ser menores e referenciar esses arquivos.

## Padrões confirmados

- Código de produto em `platform/src`.
- Docs/specs em `docs/`.
- Commands locais em `.claude/commands/`.
- Subagentes em `.claude/agents/`.
- Skills externas em `.agents/skills/` são ruído/controladas por `skills-lock.json` até unidade própria.
- Lint/build obrigatórios quando houver código.
- Staging explícito antes de commit.
- Commits não misturam pendências externas.

## YZI IMOB — fluxo principal

`Formulário → Catálogo → Pasta Comercial → Site/Silo → Conteúdo IA → Ads → WhatsApp → Pipeline → Documento/Comissão → Aprendizado`

## Pendências conhecidas

- `platform/src/components/yzi-os/connections-v0.tsx` com alterações pendentes fora das últimas unidades.
- `skills-lock.json` com alteração pendente externa.
- `.agents/skills/*` contém ruído externo não tratado.
- Doc visual pendente fora dos commits recentes (`docs/yzi-os-active/04-implementation/`).
- Backend runtime ainda é documentário, sem implementação.
- AI runtime/credits boundary ainda precisa ser criado.
- YZI Orquestradora ainda precisa ser documentada/materializada.

## Referências

- `CLAUDE.md`
- `AGENTS.md`
- `docs/yzi-imob/yzi-imob-ux-ui-operating-system-map-v0.1.md`
- `docs/yzi-imob/execution-pack/`

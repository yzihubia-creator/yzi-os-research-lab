# YZI OS Research Lab

YZI OS é uma plataforma operacional multi-tenant. YZI IMOB é o módulo imobiliário: operação comercial centrada no imóvel, não um CRM genérico. Stack: Next.js/React/TypeScript/Supabase.

## Arquitetura

- Código de produto: `platform/src` (app em `platform/`, ver `platform/AGENTS.md`)
- Docs e specs: `docs/`
- Commands locais: `.claude/commands/`
- Subagentes: `.claude/agents/`
- Skills externas: `.agents/skills/` — governadas por `skills-lock.json`, não editar manualmente

## Regras Críticas

- NUNCA usar service role no frontend
- NUNCA executar SQL sem autorização humana
- NUNCA fazer push sem autorização humana
- NUNCA misturar arquivos fora do escopo da unidade
- SEMPRE respeitar tenant boundary (`Sem tenant_id, não existe dado operacional confiável.`)
- SEMPRE manter estados honestos; não inventar dados reais
- SEMPRE rodar lint/build quando houver código
- SEMPRE fazer staging explícito antes de commit
- SEMPRE commitar apenas com autorização humana explícita
- SEMPRE separar pendências externas do commit da unidade

## Comandos

Executar em `platform/`:

- `npm run lint` — ESLint
- `npm run build` — build Next.js
- `npm run dev` — desenvolvimento

## Context Engineering (Main Agent Discipline)

- O agente principal é orquestrador, não executor único
- Usar subagentes para análise especializada, com contexto limpo
- Pedir retornos curtos e estruturados dos subagentes
- Não explorar o codebase inteiro sem necessidade

## Referências

- `AGENTS.md` — fonte de verdade, catálogo de commands e subagentes
- `docs/yzi-imob/execution-pack/` — Execution Pack YZI IMOB (boundary, template, arquitetura)
- `memory/MEMORY.md` — decisões do projeto (a criar; se ausente, reportar lacuna)

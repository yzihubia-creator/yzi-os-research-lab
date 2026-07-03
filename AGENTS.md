# AGENTS.md — YZI OS Research Lab

## Fonte de verdade

1. `CLAUDE.md` — identidade e regras críticas
2. `docs/yzi-imob/execution-pack/` — Execution Pack, tenant boundary, task template, runtime architecture
3. `.claude/commands/` — commands operacionais
4. `.claude/agents/` — subagentes
5. `memory/MEMORY.md` — decisões do projeto (a criar)

## Commands disponíveis

- `/yzi-close` — fechar unidade validada com commit local autorizado
- `/yzi-module` — trabalhar ou preparar um módulo do YZI OS
- `/yzi-imob-read-operating-map` — ler mapa UX/UI e Execution Pack antes de task YZI IMOB
- `/yzi-imob-validate-tenant-boundary` — validar boundary multi-tenant (constraint)
- `/yzi-imob-design-screen` — estruturar tela com regra de UI e estados honestos
- `/yzi-imob-plan-integration` — planejar integração sem conectar nada
- `/yzi-imob-close-unit` — fechamento restrito: staging explícito, commit autorizado, sem push

## Subagentes YZI IMOB

- Product Architect — guarda a tese (imóvel como ativo central)
- UX/UI Architect — navegação, rotas e regra de UI
- Frontend Implementer — telas em `platform/src` dentro do escopo declarado
- Tenant Boundary Reviewer — bloqueia violações de tenant boundary
- Integration Planner — planos de integração sem credenciais
- Evidence Closer — fechamento, staging restrito, sem push

## Regras operacionais

- Toda task declara escopo permitido e fora de escopo
- Tasks YZI IMOB leem o Execution Pack antes de implementar
- Qualquer dado operacional exige tenant boundary
- Integrações reais exigem aprovação humana
- Commits locais exigem autorização humana explícita
- Push é proibido sem autorização explícita

## Fallback

Se um arquivo referenciado não existir:

1. Reportar a lacuna
2. Usar a melhor alternativa disponível
3. Registrar suposições feitas
4. Não inventar regra

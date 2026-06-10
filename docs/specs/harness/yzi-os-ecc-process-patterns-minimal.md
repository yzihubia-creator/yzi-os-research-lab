# YZI OS — ECC Process Patterns (Minimal Harness v0)

## 1. Objetivo do Documento

Extrair padrões de processo já existentes no ECC, com evidência de fonte, e decidir qual parte mínima pode ser copiada ou adaptada para um `YZI OS Minimal Harness v0`. O documento reduz escopo, evita invenção e trata o ECC como fonte de processo validado — não como dependência técnica obrigatória. Implementação técnica permanece em 0%.

## 2. Fontes ECC Consultadas

- CLAUDE.md — github.com/affaan-m/ECC/blob/main/CLAUDE.md
- AGENTS.md — github.com/affaan-m/ECC/blob/main/AGENTS.md
- cross-harness.md — github.com/affaan-m/ECC/blob/main/docs/architecture/cross-harness.md
- README pt-BR — github.com/affaan-m/ECC/blob/main/docs/pt-BR/README.md
- package.json — github.com/affaan-m/ECC/blob/main/package.json
- AgentShield (segurança, referência) — github.com/affaan-m/agentshield

## 3. Princípios ECC Observados

- "ECC is the reusable workflow layer. Harnesses are execution surfaces." (cross-harness.md)
- "The long-term direction is skills-first" com `commands/` por compatibilidade. (AGENTS.md)
- "If a change requires editing three harness copies of the same workflow, the shared source is in the wrong place." (cross-harness.md)
- Validação antes de aceitar: `test` roda validate-agents/commands/rules/skills/hooks/install-manifests. (package.json)
- Segurança antes do commit: scan de segredos, permissões, hooks, MCP e agent config. (AgentShield)

## 4. Tabela de Padrões Copiáveis / Adaptáveis

| ECC Pattern | ECC Source URL | Exact Evidence From ECC | YZI OS Decision | Minimal Adaptation | Do Not Copy Now |
| ----------- | -------------- | ----------------------- | --------------- | ------------------ | --------------- |
| reusable workflow layer | ECC/docs/architecture/cross-harness.md | "ECC is the reusable workflow layer" | ADAPT_PATTERN_MINIMALLY | Tratar spec aprovada como camada de workflow reutilizável (já em /docs/specs) | runtime de workflow / código |
| execution surfaces | ECC/docs/architecture/cross-harness.md | "Harnesses are execution surfaces" | ADAPT_PATTERN_MINIMALLY | Manter executor substituível e documental | superfície executável real |
| skills | ECC/docs/architecture/cross-harness.md | "Skills form the most portable unit ... skills/*/SKILL.md ... name, description, origin" | COPY_PATTERN_MINIMALLY | Usar frontmatter name/description/origin nas skills institucionais documentais | skills executáveis |
| rules / instructions | ECC/CLAUDE.md | "rules/ — Always-follow guidelines" | ADAPT_PATTERN_MINIMALLY | Manter rules como guideline documental separada de skills | enforcement automático |
| hooks | ECC/docs/architecture/cross-harness.md | "hooks/hooks.json and scripts/hooks/" | DEFER_PATTERN | nenhuma agora | hooks executáveis |
| MCP configuration | ECC/docs/architecture/cross-harness.md | ".mcp.json and mcp-configs/" | DEFER_PATTERN | nenhuma agora | MCP config real |
| install manifests | ECC/package.json | "validate-install-manifests.js"; bin "ecc-install → install-apply.js" | DEFER_PATTERN | nenhuma agora | manifest / instalador |
| session & orchestration | ECC/docs/pt-BR/README.md | "SQLite state store"; package.json "orchestrate:status/worker/tmux" | DEFER_PATTERN | nenhuma agora | state store / orquestração |
| security scanning | github.com/affaan-m/agentshield | "scans your .claude/ directory ... before they become exploits"; package.json "security:ioc-scan" | ADAPT_PATTERN_MINIMALLY | Checklist documental de segurança pré-evidência (segredos, permissões, MCP) | instalar scanner / AgentShield |
| plugin / installer boundaries | ECC/docs/pt-BR/README.md | "Plugins of Claude Code cannot distribute rules automatically. Install them manually." | DEFER_PATTERN | registrar limite como nota documental | plugin runtime |
| selective installation | ECC/docs/pt-BR/README.md | "Selective Install via Manifest ... targeted component installation" | DEFER_PATTERN | nenhuma agora | instalador seletivo |
| cross-harness adaptation | ECC/docs/architecture/cross-harness.md | "Adapters remain thin ... editing three harness copies ... wrong place" | ADAPT_PATTERN_MINIMALLY | Manter adapter=tradução, fino e documental | adapters executáveis |
| agents | ECC/CLAUDE.md | "agents/ — ... Markdown with YAML frontmatter (name, description, tools, model)" | ADAPT_PATTERN_MINIMALLY | Manter definições de subagentes controladas, documentais, com frontmatter | criação massiva / agentes executáveis |
| commands | ECC/AGENTS.md | "skills-first" com "commands/ maintained for backward compatibility" | ADAPT_PATTERN_MINIMALLY | Manter command definitions documentais; priorizar skills | comandos executáveis |
| package scripts / validation | ECC/package.json | "validate-agents.js ... validate-skills.js ... validate-hooks.js" no target `test` | COPY_PATTERN_MINIMALLY | Adotar checklist documental "validar antes de aceitar evidência" | scripts / código de validação |

## 5. Tabela de Padrões Proibidos Nesta Fase

| Padrão | Fonte ECC | Classificação |
| ------ | --------- | ------------- |
| hooks executáveis | ECC/docs/architecture/cross-harness.md ("hooks.json") | DEFER_PATTERN |
| integração MCP real | ECC/docs/architecture/cross-harness.md (".mcp.json") | DEFER_PATTERN |
| instalador seletivo / manifests | ECC/docs/pt-BR/README.md; ECC/package.json | DEFER_PATTERN |
| state store / orquestração | ECC/docs/pt-BR/README.md ("SQLite state store") | DEFER_PATTERN |
| scanner instalado (AgentShield) | github.com/affaan-m/agentshield | DEFER_PATTERN |
| self-evolving / execução autônoma | ECC/docs/pt-BR/README.md ("self-improving skills") | DO_NOT_COPY |
| criação massiva de agents/skills | ECC/AGENTS.md ("64 ... agents", "261 ... skills") | DO_NOT_COPY |
| GitHub App / hosted app / billing / marketplace | NOT_CONFIRMED_IN_ECC_SOURCE | DO_NOT_COPY |

## 6. Decisão Final — YZI OS Minimal Harness v0

- v0 é uma camada **documental e não-executável**: spec (autoridade) + skills institucionais com frontmatter `name/description/origin` + `rules` separadas + definições documentais de subagentes/commands + checklist documental de validação e de segurança pré-evidência.
- ECC é fonte de **processo validado**, não dependência técnica obrigatória; nada é instalado, clonado ou executado.
- Toda superfície técnica (hooks, MCP, instalador, state store, scanner, orquestração) fica adiada até nova autorização humana. Implementação técnica = 0%.

## 7. Próxima Task Recomendada

`Task 215 — Draft YZI OS Minimal Harness v0 Skill Frontmatter Convention (name/description/origin), Documentary Only` — curta, executável, requer nova autorização humana explícita.

## 8. Readiness Statement Final

`TASK_214_ECC_PROCESS_PATTERNS_EXTRACTED_FOR_YZI_OS_MINIMAL_HARNESS_DOCUMENTARY_ONLY`

> Non-execution: documento apenas. Nenhum ECC instalado/clonado, nenhum código, hook, MCP, adapter, script ou runtime criado.

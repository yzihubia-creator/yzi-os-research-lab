# Task 084  First Institutional Skill Candidate Package

## 1. Estado de Entrada

* Task 083 concluída.
* Readiness statement: `INDEX_UPDATED_TASK_082_INSTITUTIONAL_SKILLS_LAYER_README_CREATED_DOCUMENTARY_ONLY`
* `/docs/specs/skills/README.md` criado documentalmente.
* Nenhuma skill real criada.
* Nenhum adapter criado.
* `.claude/` não criado por esta task.
* Implementação técnica em 0%.
* Nenhuma execução técnica iniciada.
* Nenhuma próxima task autorizada automaticamente.

## 2. Princípio Institucional Preservado

`Spec is authority. Institutional skill is capability. Adapter is translation. Executor is replaceable.`

## 3. Objetivo

Preparar uma primeira skill institucional candidata para futura autorização humana.

Este pacote é documental. Ele não cria a skill real, não cria arquivo dentro de `/docs/specs/skills/`, não cria adapter, não cria `.claude/`, não cria runner e não inicia implementação técnica.

## 4. Critérios Para Escolher a Primeira Skill Candidata

A primeira skill candidata deve ser:

* mínima;
* documental;
* executor-agnostic;
* derivada de governança já aprovada;
* útil para todas as futuras execuções;
* sem dependência de Claude, Codex ou qualquer LLM específica;
* sem exigir código;
* sem exigir YAML;
* sem exigir JSON;
* sem exigir adapter;
* sem exigir runner;
* sem alterar P0P4;
* verificável por leitura humana.

## 5. Candidatos Avaliados

### A. read-approved-specs

* Nome: `read-approved-specs`
* Objetivo: orientar a leitura de specs aprovadas antes de qualquer task controlada.
* Por que seria útil: reforça que specs governadas são fonte de autoridade e reduz risco de execução sem contexto documental.
* Riscos: pode ser amplo demais como primeira skill se não delimitar exatamente quais documentos ler.
* Escopo negativo: não cria leitura automatizada, parser, adapter, índice técnico, manifesto, YAML, JSON ou contrato machine-readable.
* Razão para ser ou não ser a primeira skill: é útil, mas menos diretamente ligada ao bloqueio de violações de escopo do que `validate-scope-boundaries`.

### B. validate-scope-boundaries

* Nome: `validate-scope-boundaries`
* Objetivo: orientar a validação humana de limites autorizados, paths, artefatos permitidos, artefatos proibidos e condições de parada antes de qualquer execução.
* Por que seria útil: apoia diretamente o padrão atual de gates, reduz risco de execução fora do escopo e preserva separação entre autorização, execução e verificação.
* Riscos: pode ser confundida com enforcement técnico se não permanecer explicitamente documental.
* Escopo negativo: não cria enforcement automatizado, código, adapter, runner, comando, subagente, YAML, JSON ou contrato machine-readable.
* Razão para ser a primeira skill: é a candidata mais alinhada ao padrão atual de governança, gates humanos e execução controlada.

### C. write-evidence-record

* Nome: `write-evidence-record`
* Objetivo: orientar a escrita documental de registros de evidência após tarefas controladas.
* Por que seria útil: fortalece rastreabilidade e separação entre execução e verificação.
* Riscos: depende de escopo bem delimitado previamente; se usada cedo demais, pode registrar evidência sem validação adequada dos limites.
* Escopo negativo: não cria templates executáveis, automação, adapter, YAML, JSON, contrato machine-readable ou runner.
* Razão para ser ou não ser a primeira skill: é relevante, mas deve vir depois de uma skill que valide fronteiras de escopo.

## 6. Candidato Recomendado

`validate-scope-boundaries`

Razão:

* é a skill mais alinhada ao padrão atual de gates;
* ajuda a impedir execução fora do escopo;
* é útil para Claude, Codex, Llama, Gemini ou qualquer executor;
* preserva a regra de que executor não é autoridade;
* pode ser definida inicialmente como documento humano, sem implementação.

O candidato recomendado ainda não está criado e não está autorizado.

## 7. Futuro Escopo Autorizável

Uma futura task separada poderá, se explicitamente autorizada, criar apenas:

* `/docs/specs/skills/skill-001-validate-scope-boundaries.md`

Esse futuro arquivo deverá ser documental e não operacional.

## 8. Escopo Negativo da Futura Skill

A futura criação da skill não poderá criar:

* código;
* API;
* schema;
* frontend;
* migration;
* YAML;
* JSON;
* contrato machine-readable;
* adapter;
* `.claude/`;
* Codex adapter;
* runner;
* comando;
* subagente;
* backlog;
* sprint plan;
* roadmap.

## 9. Critérios Mínimos da Futura Skill Documental

A futura skill candidata deverá conter:

* propósito;
* quando usar;
* entradas esperadas;
* checagens humanas;
* violações de escopo;
* condições de parada;
* evidência esperada;
* relação com specs;
* relação com adapters futuros;
* status documental.

## 10. Texto Futuro de Autorização

O operador humano deverá usar o texto abaixo caso queira autorizar futuramente a criação documental da primeira skill institucional:

Eu, operador humano, autorizo explicitamente a criação documental da primeira skill institucional do YZI OS, limitada exclusivamente ao arquivo `/docs/specs/skills/skill-001-validate-scope-boundaries.md`. Confirmo que esta autorização não permite criar código, API, schema, frontend, migration, YAML, JSON, contrato machine-readable, adapter, `.claude/`, Codex adapter, runner, comando, subagente, backlog, sprint plan ou roadmap. Confirmo que esta autorização é específica para uma única task documental e não autoriza nenhuma execução adicional.

## 11. Frases Insuficientes Para Autorização

As frases abaixo não autorizam a criação da skill:

* vamos
* segue
* pode continuar
* aprovado
* manda
* executa
* faz aí
* ok
* próximo
* bora

Essas frases podem indicar conversa, revisão ou preparação, mas não autorizam a criação de `/docs/specs/skills/skill-001-validate-scope-boundaries.md`.

## 12. Estado Preservado

* A skill `validate-scope-boundaries` ainda não foi criada.
* Nenhuma skill real foi criada.
* Nenhum adapter foi criado.
* Nenhum arquivo foi criado dentro de `/docs/specs/skills/`.
* O índice não foi editado por esta task.
* Implementação técnica permanece em 0%.
* Nenhuma execução técnica foi iniciada.
* Nenhuma próxima task está autorizada automaticamente.

## 13. Status Final

`TASK_084_FIRST_INSTITUTIONAL_SKILL_CANDIDATE_PACKAGE_PREPARED`

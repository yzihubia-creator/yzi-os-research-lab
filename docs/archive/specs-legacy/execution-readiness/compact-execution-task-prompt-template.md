# Compact Execution Task Prompt Template

## Purpose

This document defines a compact prompt template for future controlled execution tasks.

Input readiness:

`TASK_210_COMPACT_OPERATIONAL_GOVERNANCE_CONTEXT_CREATED_DOCUMENTARY_ONLY`

Template status:

`COMPACT_EXECUTION_TASK_PROMPT_TEMPLATE_CREATED_DOCUMENTARY_ONLY`

This template replaces the prior pattern of giant prompts for normal controlled task execution.

This template is documentary only, human-readable, compact, and non-executable.

## Required Input Context

Future controlled execution task prompts should use only:

- compact governance context;
- directly relevant approved spec;
- directly relevant skill;
- directly relevant subagent or command, when present;
- authorized paths;
- target artifact;
- allowed scope;
- forbidden scope;
- stop conditions;
- short evidence.

The historical index must not be used as default LLM execution context.

## Prompt Template

```text
EU AUTORIZO A TASK [ID] PARA [AÇÃO EXATA], SEM EXPANDIR ESCOPO E SEM EXECUÇÃO NÃO AUTORIZADA.

# TASK [ID]  [TÍTULO]


ESTADO COMPACTO


Readiness atual:
[READINESS_ATUAL]

Contexto obrigatório:
[COMPACT_OPERATIONAL_GOVERNANCE_CONTEXT_PATH]

Spec aprovada:
[SPEC_PATH]

Skill aplicável:
[SKILL_NAME_OR_PATH]

Subagente/comando aplicável, se houver:
[SUBAGENT_OR_COMMAND]


ESCOPO AUTORIZADO


Artifact alvo:
[TARGET_ARTIFACT_PATH]

Paths permitidos:
[AUTHORIZED_PATHS]

Ação permitida:
[ALLOWED_ACTION]


ESCOPO PROIBIDO


[FORBIDDEN_SCOPE]


STOP CONDITIONS


Pare se houver:
- divergência de readiness;
- path não autorizado;
- tentativa de expandir escopo;
- tentativa de usar índice histórico como contexto padrão;
- tentativa de execução não autorizada.


CRITÉRIOS DE ACEITAÇÃO


[ACCEPTANCE_CRITERIA]


EVIDENCE CURTO ESPERADO


Responder com:
- artifact criado/modificado;
- path usado;
- escopo proibido evitado;
- execução técnica realizada ou não;
- readiness final.
```

## Required Sections

Each future compact execution task prompt should include:

- exact human authorization phrase;
- task ID and task title;
- current readiness;
- compact governance context path;
- approved spec path;
- relevant skill;
- relevant subagent or command, when present;
- target artifact path;
- authorized paths;
- allowed action;
- forbidden scope;
- stop conditions;
- acceptance criteria;
- short expected evidence;
- final readiness statement.

## Forbidden Expansions

Future compact execution task prompts must not expand by adding:

- full historical index as default context;
- all previous task records;
- all previous gates;
- all previous evidence records;
- unrelated specs;
- unrelated skills;
- unrelated subagents or commands;
- unauthorized paths;
- implementation details outside the allowed action;
- execution not explicitly authorized.

## Evidence Output

Evidence should remain short.

Expected evidence should state:

- artifact created or modified;
- path used;
- forbidden scope avoided;
- whether technical execution occurred;
- final readiness.

Long audit expansion should occur only when explicitly requested by a human.

## Final Statement

`COMPACT_EXECUTION_TASK_PROMPT_TEMPLATE_CREATED_DOCUMENTARY_ONLY`

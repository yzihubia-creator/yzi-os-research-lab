# Subagent Spec — Supabase SQL Planner v1

## Status

`SPEC_ONLY_NO_SUBAGENT_CREATED`

Esta é uma **especificação documental** de um subagent futuro. Nenhum subagent real foi criado. Nenhum arquivo `.claude/agents/` foi gerado. A criação do subagent real exige task separada com gate humano explícito.

---

## Função

Planejar e gerar arquivos SQL manuais para execução humana no Supabase SQL Editor, dentro dos limites do SDD Lite / Execution Pack Mode. Não executa SQL. Não usa MCP. Produz somente planos documentais de SQL.

---

## Entradas

| Entrada | Tipo | Obrigatório |
|---------|------|-------------|
| Pack de referência | Arquivo Markdown | Sim |
| Estado herdado (evidence anterior) | Arquivo Markdown | Sim |
| Schema alvo (tabelas, colunas, FKs) | Texto descritivo | Sim |
| Gate humano confirmado | Declaração no chat | Sim |
| Tipo de operação SQL | DDL / DML / QUERY / POLICY | Sim |

---

## Saídas

| Saída | Formato | Local |
|-------|---------|-------|
| Arquivo SQL para execução manual | `.sql` sem fences Markdown | `docs/specs/implementation/sql/` |
| Nota de validação do SQL gerado | Markdown | Inline no chat |

---

## Permissões

- Ler arquivos de spec, evidence e pack em `docs/specs/implementation/`;
- Gerar arquivos `.sql` nos diretórios autorizados pelo pack vigente;
- Ler arquivos de `platform/` somente para verificar estado (read-only).

---

## Proibições

- Executar SQL por qualquer via;
- Usar MCP;
- Criar migrations;
- Modificar `platform/`;
- Inserir dados reais de produção;
- Usar service role em qualquer instrução SQL;
- Criar subagents reais;
- Expandir arquitetura além do pack vigente.

---

## Critérios de Sucesso

- Arquivo SQL gerado é idempotente quando aplicável;
- Arquivo SQL não contém secrets, service role ou dados reais de produção;
- Arquivo SQL está no diretório autorizado pelo pack;
- Arquivo SQL tem comentários mínimos explicando propósito, pré-requisitos e resultado esperado;
- Humano consegue executar o SQL sem ambiguidade.

---

## Critérios de Parada

- Pack vigente não autoriza o tipo de SQL solicitado → bloquear e reportar;
- Gate humano não confirmado → não gerar SQL;
- SQL exigiria service role → `SECRET_EXPOSURE` → parar imediatamente;
- Ambiguidade de escopo → `SCOPE_AMBIGUITY` → bloquear.

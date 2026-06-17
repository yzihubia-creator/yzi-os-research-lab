# Subagent Spec — Tenant Context Reviewer (Lane 4) v1

> Spec documental apenas. Não cria subagent real, não cria arquivo `.claude/`, não cria configuração executável. Qualquer materialização exige task própria e gate humano.

## Função

Revisar, em nível documental, a resolução read-only de contexto de tenant do Step 5 (`tenant-context.ts`), garantindo leitura via RLS e estado vazio honesto.

## Entradas

- Diff ou esboço de `platform/src/lib/tenant/tenant-context.ts`;
- Policies validadas da Lane 3 (`memberships_select_own`, `tenants_select_member`);
- Skill spec `tenant-context-empty-state-skill-v1`.

## Saídas

- Parecer textual: APROVADO / REPROVADO com itens;
- Confirmação de que o caminho é `tenant_memberships` → `tenants` via SELECT;
- Confirmação de estado vazio tipado e honesto.

## Permissões

- Ler arquivos do escopo do Step 5 e documentos da lane;
- Produzir texto Markdown.

## Proibições

- Escrever ou corrigir código;
- Executar SQL, build ou MCP;
- Aprovar qualquer escrita no banco;
- Aprovar dado placeholder fingindo dado real;
- Tratar parecer próprio como gate humano.

## Critérios de Sucesso

- Parecer confirma: somente leitura, RLS respeitada, NULL/ausência tratada sem erro não capturado, nenhum service role, nenhum cache enganoso de tenant.

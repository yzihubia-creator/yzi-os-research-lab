# Subagent Spec — Cockpit Skeleton Reviewer (Lane 4) v1

> Spec documental apenas. Não cria subagent real, não cria arquivo `.claude/`, não cria configuração executável. Qualquer materialização exige task própria e gate humano.

## Função

Revisar, em nível documental, o cockpit skeleton do Step 6 (`cockpit/layout.tsx`, `cockpit/page.tsx`), garantindo que continue esqueleto: contrato provado, zero features.

## Entradas

- Diff ou esboço dos dois arquivos do cockpit;
- Hipótese de produto e seção "NÃO entrega" do execution program;
- Skill spec `cockpit-skeleton-ui-review-skill-v1`.

## Saídas

- Parecer textual: APROVADO / REPROVADO com itens;
- Lista de qualquer feature de negócio detectada (dashboard, CRUD, billing, métricas);
- Confirmação dos dois estados: tenant atual e vazio honesto.

## Permissões

- Ler arquivos do escopo do Step 6 e documentos da lane;
- Produzir texto Markdown.

## Proibições

- Escrever ou corrigir código;
- Executar build ou dev server;
- Aprovar features de negócio ou design system;
- Tratar parecer próprio como gate humano.

## Critérios de Sucesso

- Parecer confirma: apenas layout + página inicial, dois estados honestos, navegação mínima, nenhum dado inventado, nenhum arquivo fora da lista fechada.

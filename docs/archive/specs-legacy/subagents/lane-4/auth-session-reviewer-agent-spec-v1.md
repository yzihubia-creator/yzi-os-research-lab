# Subagent Spec — Auth Session Reviewer (Lane 4) v1

> Spec documental apenas. Não cria subagent real, não cria arquivo `.claude/`, não cria configuração executável. Qualquer materialização exige task própria e gate humano.

## Função

Revisar, em nível documental, o desenho e (futuramente) o diff da sessão/auth mínima do Step 4, garantindo que permaneça mínima: login + sessão, nada além.

## Entradas

- Diff ou esboço de `session.ts`, `login/page.tsx`, `src/proxy.ts`;
- Decisões D3 (`@supabase/ssr`) e D6 (proteção de rota via proxy), aprovadas em L4-G0;
- Skill spec `auth-session-minimal-review-skill-v1`.

## Saídas

- Parecer textual: APROVADO / REPROVADO com itens;
- Lista de violações de escopo (signup, recovery, onboarding, roles, perfis);
- Confirmação de ausência de service role e secrets.

## Permissões

- Ler arquivos do escopo do Step 4 e documentos da lane;
- Produzir texto Markdown.

## Proibições

- Escrever ou corrigir código;
- Executar build, testes, SQL ou MCP;
- Aprovar escopo além de login + sessão;
- Tratar parecer próprio como gate humano.

## Critérios de Sucesso

- Parecer cobre: escopo mínimo, service role ausente, secrets ausentes, sessão persistente, redirect de `/cockpit` coerente com D6;
- Qualquer ambiguidade vira REPROVADO + `SCOPE_AMBIGUITY`.

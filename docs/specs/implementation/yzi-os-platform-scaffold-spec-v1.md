# YZI OS Platform Scaffold Spec v1

## Readiness Statement

`YZI_OS_PLATFORM_SCAFFOLD_SPEC_V1_CREATED_DOCUMENTARY_ONLY_AWAITING_HUMAN_APPROVAL`

Esta spec segue Spec-Driven Development: ela **define** o scaffold da plataforma, mas **não o executa**. Nenhuma implementação é autorizada por este documento até aprovação humana explícita.

## 1. Objetivo do Scaffold

Criar a estrutura mínima e isolada da plataforma YZI OS em `platform/`, como primeiro artefato técnico da fase de infraestrutura. O scaffold é apenas o substrato de app: ele não implementa nenhum módulo de produto (Opportunity Radar, Pipeline OS, Follow-up OS, Memory OS, Executive Cockpit) e nenhum conceito arquitetural (tenant, events, governance) ainda.

Princípio herdado do corpus: *boring, small, auditable, human-authorized before use*.

## 2. Stack Proposta

| Camada | Escolha | Justificativa |
| ------ | ------- | ------------- |
| Framework | Next.js (App Router) | Full-stack em um app: cockpit, rotas, futura API |
| Linguagem | TypeScript | Tipagem como primeira camada de contrato |
| Estilo | Tailwind CSS | Velocidade de UI sem design system prematuro |
| Lint | ESLint (config padrão Next.js) | Verificação estática desde o dia 1 |
| Estrutura | `src/` directory, import alias `@/*` | Separação clara código vs. config |
| Package manager | npm | Já disponível no ambiente (Node v24, npm 11) |

Decisões futuras (Postgres/Supabase, ORM, auth, Claude API) ficam **fora desta spec** e exigirão specs próprias.

## 3. Path Autorizado

- Toda criação de arquivos limitada a: **`platform/`** (na raiz do repositório).
- Única exceção fora de `platform/`: nenhuma. Esta spec (`docs/specs/implementation/yzi-os-platform-scaffold-spec-v1.md`) é o único documento novo da fase de especificação e já existe.

## 4. Arquivos Que Poderão Ser Criados

Dentro de `platform/`, apenas o produto padrão do scaffold Next.js + os três artefatos institucionais:

- `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore` (local do app);
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` e demais arquivos gerados pelo `create-next-app`;
- `public/` (assets padrão do scaffold);
- `node_modules/` (não versionado, coberto pelo `.gitignore` raiz);
- **`.env.example`** — mínimo, sem segredos reais, apenas placeholders documentados;
- **`README.md`** — curto: o que é, como rodar, o que ainda não existe;
- `src/app/page.tsx` ajustado para exibir o placeholder **"YZI OS Platform"** (health visual simples, sem lógica).

## 5. Arquivos Que NÃO Poderão Ser Alterados

- `docs/**` — nenhum documento existente (incluindo esta spec após aprovação);
- `prototype/**` — homepage congelada;
- `.claude/**` — harness de governança;
- `.agents/**` — skills de tooling;
- `tools/**`, `_extracted/**`, `FOUNDATION.md.txt`, `skills-lock.json`;
- `.gitignore` da raiz (já criado no Passo 0 e commitado).

Qualquer tentativa do scaffold de escrever fora de `platform/` é violação de boundary e ativa critério de parada.

## 6. Explicitamente Fora do Escopo (NÃO AUTORIZADO)

`This spec does NOT authorize:`

- banco de dados;
- schema;
- migration;
- auth;
- tenant model;
- API real (rotas de negócio);
- Supabase;
- Docker;
- workflow;
- integração externa;
- deploy;
- alteração em produção;
- agentes / chamadas a LLM;
- qualquer módulo de produto.

Cada um desses itens exigirá spec própria + gate de autorização humana.

## 7. Critérios de Aceitação

1. `platform/` existe e contém app Next.js App Router + TypeScript + Tailwind + ESLint com `src/`.
2. `npm run dev` dentro de `platform/` sobe o app local sem erros.
3. A página inicial exibe "YZI OS Platform" (placeholder, sem lógica).
4. `npm run build` conclui sem erros.
5. `npm run lint` conclui sem erros.
6. `platform/.env.example` existe e não contém segredos reais.
7. `platform/README.md` existe com instruções de execução.
8. `git status` mostra alterações **somente** dentro de `platform/` (nenhum arquivo fora foi tocado).
9. Nenhum item da seção 6 foi criado.

## 8. Comandos Esperados

```bash
# criação (executor)
npx create-next-app@latest platform --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm

# verificação (executor + humano)
cd platform
npm run dev      # http://localhost:3000 → "YZI OS Platform"
npm run lint
npm run build
```

## 9. Critérios de Parada

Parar imediatamente e reportar ao humano se:

- o scaffold tentar criar/alterar arquivos fora de `platform/`;
- a instalação de dependências falhar;
- houver conflito com arquivos existentes (ex.: `platform/` já existir);
- o gerador inicializar um repositório git aninhado em `platform/.git` (deve ser removido ou impedido — o repo é único, na raiz);
- qualquer item da seção 6 for necessário para completar o scaffold;
- `npm run build` ou `npm run lint` falharem sem correção trivial dentro de `platform/`.

## 10. Próxima Ação Após Aprovação Humana

1. Humano aprova esta spec (gate).
2. Executor cria o scaffold conforme seções 2–8, em task única e controlada.
3. Executor reporta evidências: estrutura criada, comandos executados, saída de lint/build, confirmação de boundaries.
4. Commit dedicado: `feat(platform): minimal Next.js scaffold per yzi-os-platform-scaffold-spec-v1`.
5. Próxima spec candidata (não autorizada por este documento): **tenant model (P0)**, derivada de `docs/specs/p0/tenant-boundary.spec.md`.

## Boundary Rule

`This spec defines the platform scaffold but does not authorize its execution. Implementation requires explicit human approval of this spec. No database, schema, migration, auth, tenant model, real API, Supabase, Docker, workflow, integration, deploy, or production change is authorized.`

## Final Status

`SPEC_COMPLETE_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`

# YZI OS Tenant Model Spec v1

## Readiness Statement

`YZI_OS_TENANT_MODEL_SPEC_V1_CREATED_DOCUMENTARY_ONLY_AWAITING_HUMAN_APPROVAL`

## Purpose

Esta spec descreve o **primeiro modelo técnico mínimo de tenant** do YZI OS para a plataforma em `platform/`. Ela segue Spec-Driven Development: **define** o candidato de modelo, mas **não executa implementação**. Nenhum banco, schema, migration, auth ou código é criado ou autorizado por este documento.

## Source Boundary

- **Fonte arquitetural normativa:** [`docs/specs/p0/tenant-boundary.spec.md`](../p0/tenant-boundary.spec.md) — a fronteira entre tenants é **invariante de engenharia**, não configuração (`P10`, `DO2`).
- **Contexto técnico:** [`docs/specs/implementation/yzi-os-platform-scaffold-spec-v1.md`](./yzi-os-platform-scaffold-spec-v1.md) e o scaffold existente em `platform/` (Next.js 16 App Router, TypeScript, Tailwind, ESLint — sem banco, sem auth, sem API).
- **Regra de conflito:** se houver qualquer conflito entre esta spec e a P0 `tenant-boundary`, **a P0 vence**. Esta spec é derivada e subordinada; ela opera o invariante, nunca o relaxa.

## Implementation Scope Candidate

Escopo candidato para futura implementação (somente após aprovação humana):

- **tenant como boundary raiz da plataforma** — toda entidade futura nasce particionada por tenant;
- **`tenant_id` obrigatório** em todas as entidades futuras (opportunities, events, conversations, memberships, memory, audit) — nunca opcional, nunca nullable;
- **isolamento lógico desde o dia 1** — nenhuma query, caminho de leitura, escrita, retrieval ou delegação sem escopo de tenant; dúvida sobre fronteira **bloqueia ou escala**, nunca presume (P0 §9);
- **sem vertical específica** — o core é único; verticalização futura será por configuração por tenant, nunca por fork (P0 §8);
- **sem Jurema**;
- **sem Café com Pam**;
- **sem cliente real** — nenhum tenant de cliente é criado nesta fase;
- **sem produção** — nenhum ambiente produtivo é tocado.

## Proposed Technical Shape

Proposta técnica candidata — **descrita, não implementada**:

### Tabela `tenants`

| Campo | Tipo candidato | Notas |
| ----- | -------------- | ----- |
| `id` | uuid (PK) | identidade canônica do tenant; gerada pelo sistema, nunca pelo LLM |
| `slug` | text, unique | identificador legível, imutável após criação |
| `name` | text | nome institucional de exibição |
| `status` | enum candidato: `active` / `suspended` | sem soft-delete silencioso; mudança de status gera evidência |
| `created_at` | timestamptz | trilha de auditoria mínima |
| `updated_at` | timestamptz | atualização nunca silenciosa |

### Tabela `tenant_memberships`

| Campo | Tipo candidato | Notas |
| ----- | -------------- | ----- |
| `id` | uuid (PK) | |
| `tenant_id` | uuid (FK → tenants.id) | obrigatório; raiz da partição |
| `user_id` | uuid | referência futura ao modelo de users/auth (não existe ainda) |
| `role` | enum candidato: `owner` / `operator` / `viewer` | papéis mínimos; atenuação de privilégio na delegação (P0 §7) |
| `created_at` | timestamptz | |

Unicidade candidata: (`tenant_id`, `user_id`).

### Relações futuras (declaradas, não criadas)

- **users/auth** — quando o auth existir (spec própria), todo user acessa a plataforma **somente através de uma membership**; não existe acesso global cross-tenant por padrão. Roles concedem o mínimo necessário dentro do tenant.
- **opportunities / events / conversations** — quando existirem (specs próprias), cada registro carrega `tenant_id` obrigatório herdado na criação, nunca inferido pelo LLM; traces e evidence packages também são particionados por tenant (P0 §7).
- **enforcement em camadas** — o isolamento lógico candidato combina: `tenant_id` em toda tabela + escopo obrigatório na camada de acesso a dados + (futuramente) RLS no Postgres como segunda linha de defesa. RLS **não** é autorizado por esta spec; será objeto da spec de banco.

`No database table, schema, migration, ORM model, SQL, or storage implementation is created or authorized by this document.`

## Out of Scope (NÃO AUTORIZADO)

`This spec does NOT authorize:`

- banco de dados (local ou gerenciado);
- schema / migration / seed;
- auth / sessão / users;
- RLS ou policies de banco;
- API real (rotas de negócio);
- UI de tenant (criação, switch, administração);
- criação de qualquer tenant (real ou de teste);
- Supabase, Docker, workflow, integração, deploy;
- alteração em produção;
- qualquer vertical, cliente ou instância nomeada.

Cada item exigirá spec própria + gate de autorização humana.

## Acceptance Criteria (para a futura implementação)

A futura implementação derivada desta spec só será aceita se:

1. Toda entidade criada tiver `tenant_id` obrigatório e não-nullable (exceto a própria `tenants`).
2. Nenhum caminho de leitura/escrita/retrieval/delegação retornar dado de outro tenant (teste de vazamento cross-tenant, P0 §16).
3. Dúvida de fronteira (tenant ausente, ambíguo ou inconsistente) resultar em **bloqueio ou escalada registrada** — nunca em prosseguimento.
4. Nenhum código permitir que LLM/agente/runtime/prompt autorize cruzamento de fronteira.
5. O core permanecer único — nenhuma bifurcação por vertical ou cliente.
6. Mudanças ficarem restritas aos paths autorizados pela spec de implementação correspondente.
7. Evidência auditável: migrations versionadas, decisões registradas, `git status` limpo fora do escopo.

## Stop Conditions

Parar imediatamente e reportar ao humano se a futura implementação:

- precisar criar/alterar arquivos fora dos paths autorizados pela task aprovada;
- precisar de qualquer item da seção Out of Scope para ser concluída;
- encontrar conflito com a P0 `tenant-boundary` (a P0 vence; a implementação para);
- tornar `tenant_id` opcional, inferido ou contornável em qualquer entidade;
- exigir criação de tenant real ou dado de cliente para validar.

## Risks and Controls

| Risk | Control |
| ---- | ------- |
| Tenant vira configuração relaxável | fronteira declarada invariante; conflito resolve pela P0 |
| `tenant_id` opcional "por enquanto" | critério de aceitação 1 rejeita; não-nullable desde o dia 1 |
| Retrofit single-tenant → multi-tenant | modelo nasce particionado antes de qualquer entidade de negócio |
| Vertical/cliente contamina o core | sem Jurema, sem Café com Pam, sem cliente real; verticalização só por configuração futura |
| Implementação antecipada sem gate | este documento declara status 0% e exige aprovação humana |
| LLM autoriza cruzamento de fronteira | proibição herdada da P0 §3; verificação na revisão de código |

## Next Action After Human Approval

A próxima task candidata é **`Implement Minimal Tenant Model Scaffold`** — que deverá ter sua própria definição de paths autorizados, banco/ORM (com spec de persistência própria), migrations e validação.

`That task is NOT authorized by this document.` A execução exigirá: aprovação humana desta spec + spec/gate de persistência (escolha de banco e ORM) + autorização explícita da task.

## Boundary Rule

`This spec defines the tenant model candidate but does not authorize database, schema, migration, auth, RLS, API, UI, seed, deploy, integration, tenant creation, or production change.`

## Final Status

`SPEC_COMPLETE_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`

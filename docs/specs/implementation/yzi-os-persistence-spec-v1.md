# YZI OS Persistence Spec v1

## Readiness Statement

`YZI_OS_PERSISTENCE_SPEC_V1_CREATED_DOCUMENTARY_ONLY_AWAITING_HUMAN_APPROVAL`

## Purpose

Esta spec define a **escolha candidata de banco de dados e ORM** do YZI OS para a plataforma em `platform/` — o gate de persistência exigido pela tenant model spec. Ela segue Spec-Driven Development: **decide e justifica** o candidato técnico, mas **não executa implementação**. Nenhum banco é provisionado, nenhuma dependência é instalada, nenhum schema, migration, seed ou código é criado ou autorizado por este documento.

## Source Boundary

- **Fontes arquiteturais normativas:**
  - [`docs/specs/p0/tenant-boundary.spec.md`](../p0/tenant-boundary.spec.md) — fronteira de tenant como invariante de engenharia; dúvida bloqueia ou escala (`P10`, `DO2`).
  - [`docs/specs/p1/operational-state.spec.md`](../p1/operational-state.spec.md) — estado persistido como fonte de verdade; estado auditável, recuperável, tenant-scoped e verificável (`P3`, `P17`, `DO1`, `DO8`).
  - [`docs/specs/p1/event-driven-state.spec.md`](../p1/event-driven-state.spec.md) — estado evolui por eventos auditáveis; sem mutação silenciosa (`DO8`).
  - [`docs/specs/p1/tenant-state-isolation.spec.md`](../p1/tenant-state-isolation.spec.md) — todo estado é tenant-scoped; nenhum acesso cross-tenant por leitura, inferência, composição, recuperação, projeção ou alteração.
- **Specs de implementação anteriores:** [`yzi-os-platform-scaffold-spec-v1.md`](./yzi-os-platform-scaffold-spec-v1.md) (stack Next.js + TypeScript, decisões de banco explicitamente diferidas para spec própria) e [`yzi-os-tenant-model-spec-v1.md`](./yzi-os-tenant-model-spec-v1.md) (modelo candidato de `tenants` e `tenant_memberships`; exige spec/gate de persistência antes de qualquer implementação).
- **Regra de conflito:** se houver qualquer conflito entre esta spec e as specs P0/P1 acima, **as specs arquiteturais vencem**. Esta spec é derivada e subordinada; ela operacionaliza os invariantes, nunca os relaxa.

## Decision Scope

Esta spec decide, em nível documental, exatamente quatro coisas:

1. o **engine de banco** candidato;
2. o **ORM / camada de acesso a dados** candidato;
3. a **disciplina de migrations** candidata;
4. a **forma de enforcement em camadas** do isolamento de tenant na persistência.

Tudo o mais — provisionamento, hospedagem, auth, RLS, API, seed — permanece fora do escopo e exigirá spec ou task própria.

## Proposed Technical Shape

Proposta técnica candidata — **descrita, não implementada**:

### Engine de banco: PostgreSQL

| Critério | Justificativa |
| -------- | ------------- |
| Integridade relacional | FK e `NOT NULL` nativos sustentam `tenant_id` obrigatório e não-nullable desde o dia 1 (tenant spec, critério 1) |
| Segunda linha de defesa | RLS nativo disponível para futura ativação (não autorizada aqui), conforme enforcement em camadas da tenant spec |
| Auditabilidade | `timestamptz`, constraints declarativas e SQL inspecionável servem o estado auditável/verificável de `operational-state` |
| Maturidade | tecnologia *boring* e estável — princípio herdado do corpus: *boring, small, auditable* |
| Tipos | `uuid` e `enum` nativos cobrem o modelo candidato de `tenants` / `tenant_memberships` sem improviso |

**Provisionamento NÃO decidido aqui:** onde o Postgres roda (local, Docker, Supabase ou outro gerenciado) é decisão separada, com trade-offs próprios de credenciais e rede, e exigirá gate próprio. Esta spec fixa apenas o engine.

### ORM / camada de acesso: Drizzle ORM

Alternativas consideradas:

| Opção | Avaliação |
| ----- | --------- |
| **Drizzle ORM** (candidato escolhido) | TypeScript-first; schema declarado em código versionável; migrations geradas como **SQL puro versionado e legível** (auditável por humano); sem engine binário opaco; leve e compatível com Next.js App Router |
| Prisma | maduro e popular, porém schema em DSL própria e migrations menos transparentes; engine adicional entre o app e o SQL reduz a auditabilidade direta |
| Kysely | query builder excelente e tipado, porém sem camada de schema/migrations integrada — exigiria mais peças para a mesma disciplina |
| SQL puro (sem ORM) | máxima transparência, porém perde tipagem como camada de contrato (princípio da scaffold spec) e aumenta superfície de erro manual |

Justificativa da escolha: o Drizzle é o que melhor serve simultaneamente (a) tipagem como contrato, (b) migrations como SQL legível e auditável — alinhado a `event-driven-state` (nenhuma mudança silenciosa: toda mudança de schema é um arquivo SQL versionado e revisável) — e (c) ausência de camadas opacas entre o código e o banco.

### Disciplina de migrations (candidata)

- Toda mudança de schema nasce como **migration SQL versionada** gerada por `drizzle-kit`, commitada no repositório e revisável por humano antes de aplicada.
- **Nenhuma migration é aplicada automaticamente** — nem em desenvolvimento, nem em produção. Aplicação é ato explícito, autorizado e registrado.
- Migrations são **imutáveis após aplicadas**: correção gera nova migration, nunca edição retroativa (trilha de auditoria, `P9`, `DO6`).
- O LLM/agente **nunca** aplica migration por iniciativa própria; gerar ≠ aplicar.

### Enforcement em camadas do isolamento de tenant (candidato)

Conforme a tenant spec e `tenant-state-isolation`, o isolamento na persistência combina três camadas:

1. **Schema:** `tenant_id uuid NOT NULL` + FK para `tenants.id` em toda tabela de negócio — o banco rejeita o dado sem tenant;
2. **Camada de acesso a dados:** todo caminho de leitura/escrita passa por um ponto único que **exige** escopo de tenant explícito — nenhuma query "global" por padrão; tenant ausente/ambíguo bloqueia ou escala, nunca presume;
3. **RLS no Postgres (futuro):** segunda linha de defesa declarada, **não autorizada por esta spec** — será objeto de spec própria quando auth/sessão existirem.

### Paths candidatos (declarados, não criados)

Para a futura implementação autorizada, os artefatos de persistência ficariam restritos a:

- `platform/src/db/` — schema Drizzle e camada de acesso;
- `platform/drizzle/` — migrations SQL versionadas;
- `platform/.env.example` — placeholder `DATABASE_URL` documentado, sem segredo real.

`No file, directory, dependency, database, schema, migration, ORM code, SQL, or storage implementation is created or authorized by this document.`

## Out of Scope (NÃO AUTORIZADO)

`This spec does NOT authorize:`

- criação ou provisionamento de banco (local, Docker, Supabase ou gerenciado);
- instalação de dependências (`drizzle-orm`, `drizzle-kit`, driver Postgres ou qualquer outra);
- criação de schema, migration ou seed;
- aplicação de qualquer migration em qualquer ambiente;
- auth / sessão / users;
- RLS ou policies de banco;
- API real (rotas de negócio);
- UI de qualquer natureza;
- criação de qualquer tenant (real ou de teste);
- alteração de qualquer arquivo em `platform/`;
- workflow, integração, deploy ou alteração em produção;
- qualquer vertical, cliente ou instância nomeada.

Cada item exigirá spec própria e/ou task com gate de autorização humana.

## Acceptance Criteria (para a futura implementação)

A futura implementação derivada desta spec só será aceita se:

1. Usar PostgreSQL como engine e Drizzle ORM como camada de acesso, conforme decidido aqui (mudança de escolha exige revisão desta spec, não desvio silencioso).
2. Toda tabela de negócio tiver `tenant_id` obrigatório e não-nullable com FK, exceto a própria `tenants` (herda tenant spec, critério 1).
3. Toda mudança de schema existir como migration SQL versionada, commitada e revisada — nenhuma mutação de schema sem artefato correspondente.
4. Nenhuma migration ter sido aplicada automaticamente ou sem autorização registrada.
5. A camada de acesso a dados exigir escopo de tenant explícito em todo caminho de leitura/escrita; tenant ausente/ambíguo resultar em bloqueio ou escalada registrada.
6. Nenhum segredo real existir no repositório (`.env.example` só com placeholders).
7. Mudanças ficarem restritas aos paths candidatos declarados acima; `git status` limpo fora do escopo.

## Stop Conditions

Parar imediatamente e reportar ao humano se a futura implementação:

- precisar criar/alterar arquivos fora dos paths autorizados pela task aprovada;
- precisar de qualquer item da seção Out of Scope para ser concluída;
- encontrar conflito com as specs P0/P1 ou com a tenant spec (as specs arquiteturais vencem; a implementação para);
- precisar tornar `tenant_id` opcional, inferido ou contornável;
- precisar aplicar migration sem autorização explícita;
- precisar de credenciais ou segredo real para validar.

## Risks and Controls

| Risk | Control |
| ---- | ------- |
| ORM opaco esconde SQL do revisor | escolha do Drizzle prioriza migrations em SQL puro legível |
| Migration aplicada silenciosamente | disciplina candidata: gerar ≠ aplicar; aplicação é ato explícito e registrado |
| Query "global" sem escopo de tenant | camada de acesso exige escopo explícito; default é bloquear, nunca presumir |
| Provisionamento decidido por arrasto | provisionamento explicitamente excluído; exigirá gate próprio |
| Segredo commitado no repositório | apenas `.env.example` com placeholders é admitido como candidato |
| Implementação antecipada sem gate | este documento declara status 0% e exige aprovação humana |
| Troca de stack sem revisão | critério de aceitação 1 amarra engine/ORM à revisão desta spec |

## Next Action After Human Approval

A próxima task candidata é **`Implement Minimal Tenant Model Scaffold`** (já declarada na tenant spec) — que dependerá de: aprovação humana da tenant spec + aprovação humana desta persistence spec + decisão de provisionamento do Postgres (gate próprio) + autorização explícita da task com paths autorizados.

`That task is NOT authorized by this document.`

## Boundary Rule

`This spec decides the candidate database engine, ORM, migration discipline, and tenant-isolation enforcement layers, but does not authorize provisioning, dependency installation, schema, migration, seed, auth, RLS, API, UI, tenant creation, deploy, integration, production change, or any modification to platform/.`

## Final Status

`SPEC_COMPLETE_DOCUMENTARY_ONLY_IMPLEMENTATION_STATUS_0_PERCENT`

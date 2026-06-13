import Link from "next/link";
import { redirect } from "next/navigation";

import { getAgentCapabilityBoundary } from "@/lib/agents/agent-capability-boundary";
import { getAgentDefinitionConfig } from "@/lib/agents/agent-definition";
import { getAgentRegistryShell } from "@/lib/agents/agent-registry-shell";
import { getControlledAgentOperation } from "@/lib/agents/controlled-agent-operation";
import { getControlledRunRecord } from "@/lib/agents/controlled-run-record";
import { getControlledRunRecordsReadonly } from "@/lib/agents/controlled-run-records-readonly";
import { getToolMemoryBoundary } from "@/lib/agents/tool-memory-boundary";
import { createServerSupabaseClient, getSessionUser } from "@/lib/auth/session";
import { getPermissionBoundary } from "@/lib/tenant/role-boundary";
import { getTenantContext } from "@/lib/tenant/tenant-context";

// Cockpit operador-facing.
//
// Cockpit Productization V1 (gate: bloco de produto): o estado `tenant_found`
// foi reorganizado de um mural vertical longo para uma TELA DE PRODUTO
// navegável — topo claro (tenant/operador/papel/status), grade de cards
// (Estado da operação, Agente planejado, Capacidades, Ferramentas e memória,
// Run governado, Registros persistidos) e os detalhes longos movidos para
// blocos colapsáveis nativos (<details>), sem `use client`. Nenhuma consulta
// nova, nenhum service role, nenhum dado fabricado e nenhuma promessa de
// execução foram introduzidos: é a MESMA leitura honesta, apresentada como
// produto. Os outros três estados (no_session / no_membership / error)
// permanecem intactos e honestos.
//
// Server Component (sem `use client`) que consome EXCLUSIVAMENTE
// getTenantContext() e getSessionUser() — sessão + leitura RLS read-only já
// existentes. Lidera pelo outcome operado: mostra a OPERAÇÃO e o VÍNCULO, não a
// arquitetura interna. Os quatro estados são renderizados honestamente; com
// banco limpo o caminho real é `no_membership`, sem inventar tenant.
// `tenant_found` é renderizado apenas a partir de dado real do membership.

// Logout do operador (Lane 7, Batch 7.3). Server Action simétrica ao login
// (`login/page.tsx`): encerra a sessão via `supabase.auth.signOut()` — que limpa
// os cookies de sessão pelo adapter @supabase/ssr (graváveis em Server Action) —
// e redireciona para `/login`. Usa EXCLUSIVAMENTE valores públicos (URL + anon
// key); NUNCA service role, NUNCA SQL, NUNCA lê/imprime token, cookie ou OAuth
// `code`. Não altera tenant/membership: apenas encerra a presença do operador.
async function signOutOperator(): Promise<void> {
  "use server";

  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Controle mínimo "Encerrar sessão": um <form> que invoca a Server Action acima.
// Sem `use client`, sem estado — progressive enhancement por padrão. Renderizado
// apenas nos estados autenticados (há sessão a encerrar).
function LogoutControl() {
  return (
    <form action={signOutOperator}>
      <button
        type="submit"
        className="w-fit rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
      >
        Encerrar sessão
      </button>
    </form>
  );
}

// --- Componentes de apresentação (Cockpit Productization V1) ---------------
// Puramente visuais, sem estado e sem `use client`. Existem só para dar forma
// de produto (cards + status + detalhes colapsáveis) ao MESMO conteúdo honesto.

// Selo de status compacto. `tone="warn"` para estados de atenção honestos
// (ex.: execução real bloqueada); neutro caso contrário.
function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warn";
}) {
  const toneClasses =
    tone === "warn"
      ? "border-amber-400/60 text-amber-700 dark:border-amber-500/40 dark:text-amber-500"
      : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${toneClasses}`}>
      {children}
    </span>
  );
}

// Card principal do cockpit: título, selo opcional, resumo curto sempre visível
// e conteúdo (incluindo blocos colapsáveis) abaixo.
function OperationCard({
  title,
  pill,
  summary,
  children,
}: {
  title: string;
  pill?: React.ReactNode;
  summary?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {title}
          </h2>
          {pill}
        </div>
        {summary ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-500">{summary}</p>
        ) : null}
      </div>
      {children}
    </article>
  );
}

// Bloco colapsável nativo (<details>): reduz o mural de texto sem esconder nada.
// Sem JS de cliente — o navegador expande/recolhe nativamente.
function Disclosure({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <details className="rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <summary className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </summary>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </details>
  );
}

export default async function CockpitPage() {
  const context = await getTenantContext();
  const operator = await getSessionUser();

  switch (context.status) {
    // Sem sessão: o proxy.ts normalmente já redireciona para /login antes de
    // chegar aqui; tratamos mesmo assim, com a porta de entrada honesta.
    case "no_session":
      return (
        <section className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Entre para acessar sua operação.
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            O cockpit do YZI OS exige uma sessão autenticada. Faça login para
            continuar.
          </p>
          <Link
            href="/login"
            className="w-fit rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            Ir para o login
          </Link>
        </section>
      );

    // Estado vazio honesto: há sessão, mas nenhum vínculo (membership/tenant).
    // Banco limpo cai aqui. Nada é fabricado para "preencher" a tela.
    case "no_membership":
      return (
        <section className="flex flex-col gap-4">
          {operator?.email ? (
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Operador: {operator.email}
            </p>
          ) : null}
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Você ainda não pertence a um tenant.
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Esta conta autenticada não está associada a nenhum tenant. Nenhum
              dado foi inventado para preencher esta tela. Quando você tiver um
              vínculo (membership) a um tenant, sua operação aparecerá aqui.
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              O vínculo (membership) é o que determina o que você poderá ver,
              aprovar e operar. Sem ele, não há operação a supervisionar — e o
              sistema não cria pertencimento que você não tem.
            </p>
          </div>
          <div className="rounded-md border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Base de operação agentic
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Indisponível até você ter um vínculo a um tenant. Nenhum agente foi
              criado e nada aqui é simulado.
            </p>
          </div>
          <LogoutControl />
        </section>
      );

    // Tenant resolvido via membership real (RLS da Lane 3). Cockpit Productization
    // V1: apresentado como tela de produto (topo + cards + detalhes colapsáveis).
    case "tenant_found": {
      const boundary = getPermissionBoundary(context.role);
      // Agent Registry Shell (Lane 9): superfície de EXISTÊNCIA de agentes,
      // declarativa e vazia. Conteúdo puro (sem query, sem agente, sem runner,
      // sem MCP, sem tool, sem memória).
      const registry = getAgentRegistryShell();
      // Agent Definition / Read-only Configuration Layer (Lane 10): capacidades
      // planejadas job-anchored. Puro/declarativo; tudo "Planejado — não ativo".
      const definition = getAgentDefinitionConfig();
      // Agent Capability Boundary Layer (Lane 11): para cada capacidade planejada,
      // o LIMITE honesto (poderá / ainda não pode / dependência).
      const capabilityBoundary = getAgentCapabilityBoundary();
      // Tool / Memory Boundary Layer (Lane 12): limite futuro de ferramentas e
      // memória, read-only. Mantém RAG separado de memória operacional.
      const toolMemoryBoundary = getToolMemoryBoundary();
      // First Controlled Agent Operation / Dry-run (Lane 13): primeira operação
      // agentic em modo dry-run/pré-visualização. Recebe apenas o estado já
      // carregado — nenhuma consulta nova, nenhum dado lido, nenhuma tool/memória.
      const controlledOperation = getControlledAgentOperation({
        tenantName: context.tenant.name,
        roleLabel: boundary.label,
      });
      // Controlled Run Record / Run State Boundary (Lane 14): modelo visual de run
      // governado, exibido ANTES de qualquer persistência real. NENHUM run gravado.
      const runRecord = getControlledRunRecord({
        tenantName: context.tenant.name,
        roleLabel: boundary.label,
      });
      // Controlled Run Records Read-only Integration (Lane 18): leitura real dos
      // últimos registros persistidos para o tenant atual. Usa a sessão
      // autenticada e RLS; filtra por tenant atual; não escreve, não cria botão,
      // não persiste, não chama API externa e não usa service role.
      const persistedRunRecords = await getControlledRunRecordsReadonly({
        tenantId: context.tenant.id,
        limit: 5,
      });

      return (
        <div className="flex flex-col gap-6">
          {/* TOPO — tenant, operador, papel, status da operação + logout. */}
          <header className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Operação
                </p>
                <h1 className="text-xl font-semibold tracking-tight">
                  {context.tenant.name}
                </h1>
              </div>
              <StatusPill tone="warn">Planejada — sem execução real</StatusPill>
            </div>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Operador
                </dt>
                <dd className="text-zinc-700 dark:text-zinc-300">
                  {operator?.email ?? "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Papel
                </dt>
                <dd className="text-zinc-700 dark:text-zinc-300">
                  {boundary.label}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  Status da operação
                </dt>
                <dd className="text-zinc-700 dark:text-zinc-300">
                  Dry-run — sem persistência
                </dd>
              </div>
            </dl>
            <LogoutControl />
          </header>

          {/* ESTADO DA OPERAÇÃO — prominente, com a honestidade global. */}
          <OperationCard
            title="Estado da operação"
            summary="Você está vinculado a este tenant. O que você pode ver, aprovar e operar é determinado pelo seu papel neste vínculo (membership)."
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Não existe agente real, runner, scheduler, tool real ou memória
              operacional ativa. Tudo abaixo é planejado e declarativo — nenhuma
              execução acontece e nenhum dado é fabricado.
            </p>
            <div className="flex flex-col gap-1 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Seu papel nesta operação
              </p>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {boundary.label}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {boundary.summary}
              </p>
            </div>
            <Disclosure label="O que seu papel permite e ainda não permite">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    O que você pode fazer
                  </h3>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                    {boundary.can.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    O que você ainda não pode fazer
                  </h3>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                    {boundary.cannotYet.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Disclosure>
          </OperationCard>

          {/* GRADE DE CARDS PRINCIPAIS. */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Agente planejado (Lanes 9 + 10). */}
            <OperationCard
              title="Agente planejado"
              pill={<StatusPill>{definition.status}</StatusPill>}
              summary={registry.emptyState.body}
            >
              <div className="rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {registry.emptyState.headline}
                </p>
              </div>
              <Disclosure label="Capacidades planejadas (job-anchored)">
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  {definition.intro}
                </p>
                <ul className="flex flex-col gap-3">
                  {definition.capabilities.map((item) => (
                    <li
                      key={item.capability}
                      className="flex flex-col gap-1 border-l-2 border-zinc-200 pl-3 dark:border-zinc-800"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {item.capability}
                        </span>
                        <StatusPill>{definition.status}</StatusPill>
                      </div>
                      <span className="text-sm text-zinc-500 dark:text-zinc-500">
                        {item.purpose}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2 rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Limites desta fase — valem para todas as capacidades
                  </h4>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                    {definition.limits.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    {definition.dependency}
                  </p>
                </div>
              </Disclosure>
              <Disclosure label="O que esta área ainda não faz">
                <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                  {registry.boundary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Disclosure>
            </OperationCard>

            {/* Capacidades (Lane 11). */}
            <OperationCard
              title="Capacidades"
              pill={<StatusPill>{capabilityBoundary.status}</StatusPill>}
              summary={capabilityBoundary.intro}
            >
              <Disclosure label="Limites por capacidade (poderá / ainda não / depende)">
                <ul className="flex flex-col gap-4">
                  {capabilityBoundary.capabilities.map((item) => (
                    <li
                      key={item.capability}
                      className="flex flex-col gap-2 border-l-2 border-zinc-200 pl-3 dark:border-zinc-800"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {item.capability}
                        </span>
                        <StatusPill>{capabilityBoundary.status}</StatusPill>
                      </div>
                      <span className="text-sm text-zinc-500 dark:text-zinc-500">
                        {item.purpose}
                      </span>
                      <dl className="flex flex-col gap-1 text-sm">
                        <div className="flex flex-col gap-0.5">
                          <dt className="text-xs uppercase tracking-wide text-zinc-500">
                            Poderá fazer
                          </dt>
                          <dd className="text-zinc-600 dark:text-zinc-400">
                            {item.futureAbility}
                          </dd>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <dt className="text-xs uppercase tracking-wide text-zinc-500">
                            Ainda não pode
                          </dt>
                          <dd className="text-zinc-500 dark:text-zinc-500">
                            {item.notYet}
                          </dd>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <dt className="text-xs uppercase tracking-wide text-zinc-500">
                            Depende de
                          </dt>
                          <dd className="text-zinc-500 dark:text-zinc-500">
                            {item.dependency}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              </Disclosure>
              <Disclosure label="Ausência de execução — vale para todas as capacidades">
                <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                  {capabilityBoundary.noExecution.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Disclosure>
            </OperationCard>

            {/* Ferramentas e memória (Lane 12). */}
            <OperationCard
              title="Ferramentas e memória"
              pill={<StatusPill>{toolMemoryBoundary.tools.status}</StatusPill>}
              summary={toolMemoryBoundary.intro}
            >
              <Disclosure label={toolMemoryBoundary.tools.title}>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  {toolMemoryBoundary.tools.intro}
                </p>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                  {toolMemoryBoundary.tools.constraints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Disclosure>
              <Disclosure label="Camadas de memória e separação de RAG">
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  {toolMemoryBoundary.memory.intro}
                </p>
                <ul className="flex flex-col gap-3">
                  {toolMemoryBoundary.memory.layers.map((item) => (
                    <li key={item.layer} className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {item.layer}
                        </span>
                        <StatusPill>{item.status}</StatusPill>
                      </div>
                      <span className="text-sm text-zinc-500 dark:text-zinc-500">
                        {item.purpose}
                      </span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-500">
                        {item.restriction}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-1 rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {toolMemoryBoundary.memory.ragSeparation.title}
                    </span>
                    <StatusPill>
                      {toolMemoryBoundary.memory.ragSeparation.status}
                    </StatusPill>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    {toolMemoryBoundary.memory.ragSeparation.body}
                  </p>
                </div>
              </Disclosure>
              <Disclosure label="Relação com capacidades e ausência de ativação">
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {toolMemoryBoundary.capabilityRelation.title}
                </h4>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                  {toolMemoryBoundary.capabilityRelation.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Ausência de ativação — vale para ferramentas e memória
                </h4>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                  {toolMemoryBoundary.noActivation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Disclosure>
            </OperationCard>

            {/* Run governado (Lanes 13 + 14). */}
            <OperationCard
              title="Run governado"
              pill={<StatusPill tone="warn">{runRecord.status}</StatusPill>}
              summary={runRecord.intro}
            >
              <dl className="flex flex-col gap-1 text-sm">
                {runRecord.runState.items.map((item) => (
                  <div key={item.label} className="flex flex-wrap gap-x-2">
                    <dt className="text-zinc-500 dark:text-zinc-500">
                      {item.label}:
                    </dt>
                    <dd className="text-zinc-700 dark:text-zinc-300">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <Disclosure label="Detalhes do run governado">
                <div className="flex flex-col gap-1 border-l-2 border-zinc-200 pl-3 dark:border-zinc-800">
                  <span className="text-xs uppercase tracking-wide text-zinc-500">
                    {controlledOperation.capabilityAnalyzed.label}
                  </span>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {controlledOperation.capabilityAnalyzed.capability}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-500">
                    {controlledOperation.capabilityAnalyzed.note}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {runRecord.inputSources.title}
                  </h4>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                    {runRecord.inputSources.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-1 border-l-2 border-zinc-200 pl-3 dark:border-zinc-800">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {runRecord.result.title}
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    {runRecord.result.body}
                  </p>
                </div>
                <div className="flex flex-col gap-2 rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {runRecord.persistence.title}
                  </h4>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                    {runRecord.persistence.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {runRecord.futurePersistence.title}
                  </h4>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                    {runRecord.futurePersistence.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Ausência de efeitos — vale para toda a operação
                  </h4>
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                    {controlledOperation.safety.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </Disclosure>
            </OperationCard>
          </div>

          {/* REGISTROS PERSISTIDOS (Lane 18) — leitura real, largura total,
              sempre visível. Estado vazio e estado de erro honestos preservados.
              Sem botão, sem insert/update/delete, sem persistência nova, sem
              agente/tool/memória/runner/scheduler/MCP e sem chamada externa. */}
          <OperationCard
            title="Registros persistidos"
            summary="Leitura real e somente leitura dos últimos registros deste tenant. Esta seção não executa agente, não chama tool, não escreve na tabela e não cria side effects externos."
          >
            {persistedRunRecords.status === "error" ? (
              <div className="rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
                <p
                  role="alert"
                  className="text-sm text-zinc-500 dark:text-zinc-500"
                >
                  {persistedRunRecords.message}
                </p>
              </div>
            ) : persistedRunRecords.records.length === 0 ? (
              <div className="rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  Nenhum registro persistido ainda.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {persistedRunRecords.records.map((record) => (
                  <li
                    key={record.id}
                    className="flex flex-col gap-2 border-l-2 border-zinc-200 pl-3 dark:border-zinc-800"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {record.capabilityKey}
                      </span>
                      <StatusPill>{record.runMode}</StatusPill>
                      <StatusPill>{record.runStatus}</StatusPill>
                    </div>
                    <dl className="grid gap-1 text-sm sm:grid-cols-2">
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-zinc-500 dark:text-zinc-500">
                          Persistence:
                        </dt>
                        <dd className="text-zinc-700 dark:text-zinc-300">
                          {record.persistenceStatus}
                        </dd>
                      </div>
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-zinc-500 dark:text-zinc-500">
                          Side effects:
                        </dt>
                        <dd className="text-zinc-700 dark:text-zinc-300">
                          {record.sideEffects}
                        </dd>
                      </div>
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-zinc-500 dark:text-zinc-500">
                          Operator role:
                        </dt>
                        <dd className="text-zinc-700 dark:text-zinc-300">
                          {record.operatorRole}
                        </dd>
                      </div>
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-zinc-500 dark:text-zinc-500">
                          Created at:
                        </dt>
                        <dd className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                          {record.createdAt}
                        </dd>
                      </div>
                    </dl>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                      {record.resultSummary}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </OperationCard>
        </div>
      );
    }

    // Falha ao confirmar sessão/contexto. Erro é distinto de vazio: aqui não se
    // afirma vínculo nem ausência de vínculo. Mensagem fixa e honesta — nunca
    // stack, query, token, cookie ou OAuth code na tela.
    case "error":
      return (
        <section className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Não foi possível carregar sua operação.
          </h1>
          <p role="alert" className="text-zinc-600 dark:text-zinc-400">
            Ocorreu uma falha ao confirmar sua sessão ou seu vínculo. Tente
            novamente. Nenhum dado foi exibido para não inventar um estado.
          </p>
          <div className="flex gap-2">
            <Link
              href="/cockpit"
              className="w-fit rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Tentar novamente
            </Link>
            <Link
              href="/login"
              className="w-fit rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Entrar de novo
            </Link>
          </div>
        </section>
      );
  }
}

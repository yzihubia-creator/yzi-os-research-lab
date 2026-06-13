import Link from "next/link";
import { redirect } from "next/navigation";

import { getAgentCapabilityBoundary } from "@/lib/agents/agent-capability-boundary";
import { getAgentDefinitionConfig } from "@/lib/agents/agent-definition";
import { getAgentRegistryShell } from "@/lib/agents/agent-registry-shell";
import { getControlledAgentOperation } from "@/lib/agents/controlled-agent-operation";
import { getControlledRunRecord } from "@/lib/agents/controlled-run-record";
import { getToolMemoryBoundary } from "@/lib/agents/tool-memory-boundary";
import { createServerSupabaseClient, getSessionUser } from "@/lib/auth/session";
import { getPermissionBoundary } from "@/lib/tenant/role-boundary";
import { getTenantContext } from "@/lib/tenant/tenant-context";

// Cockpit operador-facing (Lane 5, Batch 5.3 — gate G4, apenas este arquivo).
// Server Component (sem `use client`) que consome EXCLUSIVAMENTE
// getTenantContext() e getSessionUser() — sessão + leitura RLS read-only já
// existentes. Nenhuma consulta nova, nenhum service role, nenhuma env lida
// aqui, nenhum fetch externo, nenhum dado fabricado. Lidera pelo outcome
// operado: mostra a OPERAÇÃO e o VÍNCULO, não a arquitetura interna (sem ID
// cru, sem slug, sem agents/tools/state como console técnico). Os quatro
// estados são renderizados honestamente; com banco limpo o caminho real é
// `no_membership`, sem inventar tenant. `tenant_found` é renderizado apenas
// a partir de dado real do membership.

// Logout do operador (Lane 7, Batch 7.3 — gate G4, apenas este arquivo).
// Server Action simétrica ao login (`login/page.tsx`): encerra a sessão via
// `supabase.auth.signOut()` — que limpa os cookies de sessão pelo adapter
// @supabase/ssr (graváveis em Server Action) — e redireciona para `/login`. Usa
// EXCLUSIVAMENTE valores públicos (URL + anon key); NUNCA service role, NUNCA
// SQL, NUNCA lê/imprime token, cookie ou OAuth `code`. Não altera
// tenant/membership: apenas encerra a presença do operador no cockpit.
async function signOutOperator(): Promise<void> {
  "use server";

  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Controle mínimo "Encerrar sessão": um <form> que invoca a Server Action acima.
// Sem `use client`, sem estado, sem componente grande — progressive enhancement
// por padrão. Renderizado apenas nos estados autenticados (há sessão a encerrar).
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

    // Tenant resolvido via membership real (RLS da Lane 3). Mostra a operação
    // pelo NOME do tenant — sem expor id/slug crus (anti-console) — e a
    // FRONTEIRA DE PERMISSÃO honesta do papel real do operador (Lane 8). A base
    // agentic permanece vazia e honesta.
    case "tenant_found": {
      const boundary = getPermissionBoundary(context.role);
      // Agent Registry Shell (Lane 9): superfície de EXISTÊNCIA de agentes,
      // declarativa e vazia. Conteúdo puro (sem query, sem agente, sem runner,
      // sem MCP, sem tool, sem memória). Renderizado apenas no estado autenticado
      // com tenant real — o operador vê que a área existe e que está vazia.
      const registry = getAgentRegistryShell();
      // Agent Definition / Read-only Configuration Layer (Lane 10): capacidades
      // planejadas job-anchored (lidera pelo resultado, não por nomes de agentes).
      // Também puro/declarativo; tudo "Planejado — não ativo".
      const definition = getAgentDefinitionConfig();
      // Agent Capability Boundary Layer (Lane 11): para cada capacidade planejada,
      // o LIMITE honesto (poderá / ainda não pode / dependência) antes de operar.
      // Puro/declarativo; nenhuma execução, nenhum agente, nenhum MCP/tool/memória.
      const capabilityBoundary = getAgentCapabilityBoundary();
      // Tool / Memory Boundary Layer (Lane 12): limite futuro de ferramentas e
      // memória, read-only. Preserva a arquitetura de memória já definida na base
      // (Raw Event / Reflective / Retrieval Evidence / Memory Governance /
      // Context-Evidence Trace) e mantém RAG separado de memória operacional.
      // Puro/declarativo; nenhuma tool conectada, nenhuma memória ativa, sem
      // vector store/embedding, sem MCP/runner, nenhum agente lê/escreve memória.
      const toolMemoryBoundary = getToolMemoryBoundary();
      // First Controlled Agent Operation / Dry-run (Lane 13): a primeira operação
      // agentic, em modo dry-run/pré-visualização. Recebe apenas o estado já
      // carregado (nome do tenant + rótulo do papel) — nenhuma consulta nova,
      // nenhum dado lido, nenhuma tool/memória acessada, nenhum agente em
      // produção. A conclusão é honesta: bloqueada para execução real até gates
      // futuros. Sem side effect e sem botão que prometa execução.
      const controlledOperation = getControlledAgentOperation({
        tenantName: context.tenant.name,
        roleLabel: boundary.label,
      });
      // Controlled Run Record / Run State Boundary (Lane 14): transforma o
      // dry-run da Lane 13 em um modelo visual/declarativo de run governado,
      // exibido ANTES de qualquer persistência real. Recebe apenas o estado já
      // carregado (nome do tenant + rótulo do papel) — nenhuma consulta nova,
      // nenhum dado lido, nenhuma tool/memória acessada, NENHUM run gravado em
      // banco. Mostra honestamente run mode/status, insumos, resultado bloqueado,
      // ausência de persistência e os requisitos futuros (schema, RLS, write
      // policy, evidence trace, rollback/audit). Sem side effect e sem botão que
      // prometa persistir/executar um run real.
      const runRecord = getControlledRunRecord({
        tenantName: context.tenant.name,
        roleLabel: boundary.label,
      });
      return (
        <section className="flex flex-col gap-4">
          {operator?.email ? (
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Operador: {operator.email}
            </p>
          ) : null}
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Operação de {context.tenant.name}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Você está vinculado a este tenant. É aqui que sua operação
              acontece, e o que você pode ver, aprovar e operar é determinado
              pelo seu papel neste vínculo (membership).
            </p>
          </div>

          {/* Papel real do operador + fronteira de permissão honesta. O papel
              vem do dado real da membership (RLS read-only); a fronteira não
              inventa nenhuma ação que o cockpit ainda não execute. */}
          <div className="flex flex-col gap-2 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Seu papel nesta operação
            </p>
            <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
              {boundary.label}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              {boundary.summary}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                O que você pode fazer
              </h2>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                {boundary.can.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                O que você ainda não pode fazer
              </h2>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                {boundary.cannotYet.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Agent Registry Shell — superfície de existência honesta. Sem
              botão, sem ação inoperante, sem agente real, sem console técnico:
              apenas estado vazio, fronteira de execução e capacidades futuras. */}
          <section
            aria-labelledby="agent-registry-title"
            className="flex flex-col gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex flex-col gap-1">
              <h2
                id="agent-registry-title"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {registry.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {registry.subtitle}
              </p>
            </div>

            {/* Estado vazio honesto: nenhum agente, nada simulado. */}
            <div className="rounded-md border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
              <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
                {registry.emptyState.headline}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {registry.emptyState.body}
              </p>
            </div>

            {/* Fronteira de execução: o que esta área ainda não faz. */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                O que esta área ainda não faz
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                {registry.boundary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Agent Definition / Read-only Configuration Layer (Lane 10).
              Job-anchored: lidera pelo resultado/capacidade, não por nomes de
              agentes. Tudo declarativo, planejado e NÃO ativo — nenhum agente
              roda, nenhum MCP/runner/tool/memória, nenhuma execução, sem botão. */}
          <section
            aria-labelledby="agent-definition-title"
            className="flex flex-col gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex flex-col gap-1">
              <h2
                id="agent-definition-title"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {definition.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {definition.intro}
              </p>
            </div>

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
                    <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                      {definition.status}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-500">
                    {item.purpose}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2 rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Limites desta fase — valem para todas as capacidades
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                {definition.limits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {definition.dependency}
              </p>
            </div>
          </section>

          {/* Agent Capability Boundary (Lane 11). Para cada capacidade planejada
              (Lane 10), o limite honesto: o que PODERÁ fazer, o que ainda NÃO
              pode e de que depende. Job-anchored; tudo declarativo e read-only —
              nenhuma execução, nenhum agente, nenhum MCP/runner/tool/memória,
              nenhum botão de ação. O limite é exibido antes de a capacidade existir. */}
          <section
            aria-labelledby="agent-capability-boundary-title"
            className="flex flex-col gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex flex-col gap-1">
              <h2
                id="agent-capability-boundary-title"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {capabilityBoundary.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {capabilityBoundary.intro}
              </p>
            </div>

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
                    <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                      {capabilityBoundary.status}
                    </span>
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

            <div className="flex flex-col gap-2 rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Ausência de execução — vale para todas as capacidades
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                {capabilityBoundary.noExecution.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Tool / Memory Boundary (Lane 12). Limite futuro de ferramentas e
              memória das capacidades planejadas (Lanes 10/11), read-only e
              honesto. Preserva a arquitetura de memória da base: Raw Event
              Memory, Reflective Memory, Retrieval Evidence Layer, Memory
              Governance e Context/Evidence Trace — todas planejadas e não
              ativas — e mantém RAG/conhecimento semântico SEPARADO de memória
              operacional. Tudo declarativo: nenhuma tool conectada, nenhuma
              memória ativa, sem vector store/embedding, sem MCP/runner, nenhum
              agente lê/escreve memória, nenhum botão de ação. */}
          <section
            aria-labelledby="tool-memory-boundary-title"
            className="flex flex-col gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex flex-col gap-1">
              <h2
                id="tool-memory-boundary-title"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {toolMemoryBoundary.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {toolMemoryBoundary.intro}
              </p>
            </div>

            {/* Ferramentas (tools) futuras — não conectadas, sem execução. */}
            <div className="flex flex-col gap-2 border-l-2 border-zinc-200 pl-3 dark:border-zinc-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {toolMemoryBoundary.tools.title}
                </span>
                <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  {toolMemoryBoundary.tools.status}
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {toolMemoryBoundary.tools.intro}
              </p>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                {toolMemoryBoundary.tools.constraints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Memória — fronteira/governança read-only, arquitetura preservada. */}
            <div className="flex flex-col gap-3 border-l-2 border-zinc-200 pl-3 dark:border-zinc-800">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {toolMemoryBoundary.memory.title}
                </span>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  {toolMemoryBoundary.memory.intro}
                </p>
              </div>

              <ul className="flex flex-col gap-3">
                {toolMemoryBoundary.memory.layers.map((item) => (
                  <li key={item.layer} className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {item.layer}
                      </span>
                      <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                        {item.status}
                      </span>
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

              {/* Separação explícita: RAG ≠ memória operacional. */}
              <div className="flex flex-col gap-1 rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {toolMemoryBoundary.memory.ragSeparation.title}
                  </span>
                  <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    {toolMemoryBoundary.memory.ragSeparation.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  {toolMemoryBoundary.memory.ragSeparation.body}
                </p>
              </div>
            </div>

            {/* Relação com as capacidades planejadas. */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {toolMemoryBoundary.capabilityRelation.title}
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                {toolMemoryBoundary.capabilityRelation.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Ausência de ativação — vale para tools e memória. */}
            <div className="flex flex-col gap-2 rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Ausência de ativação — vale para ferramentas e memória
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                {toolMemoryBoundary.noActivation.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* First Controlled Agent Operation / Dry-run (Lane 13). A primeira
              operação agentic do YZI OS, em modo dry-run/pré-visualização: mostra
              capacidade analisada, status dry-run, insumos (leitura do estado já
              existente), conclusão honesta (bloqueada para execução real até
              lanes futuras) e ausência de side effects. Tudo declarativo: nenhum
              agente em produção, nenhuma tool chamada, nenhuma memória acessada,
              sem MCP/runner, sem chamada externa, sem escrita, sem botão que
              prometa execução real. */}
          <section
            aria-labelledby="controlled-operation-title"
            className="flex flex-col gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="controlled-operation-title"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {controlledOperation.title}
                </h2>
                <span className="rounded-full border border-amber-400/60 px-2 py-0.5 text-xs text-amber-700 dark:border-amber-500/40 dark:text-amber-500">
                  {controlledOperation.status}
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {controlledOperation.intro}
              </p>
            </div>

            {/* Capacidade analisada — job-anchored, pré-visualização controlada. */}
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

            {/* Insumos — leitura honesta do estado já existente, sem consulta nova. */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {controlledOperation.inputs.title}
              </h3>
              <dl className="flex flex-col gap-1 text-sm">
                {controlledOperation.inputs.items.map((item) => (
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
            </div>

            {/* Conclusão — bloqueada para execução real até lanes futuras. */}
            <div className="flex flex-col gap-1 rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {controlledOperation.conclusion.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {controlledOperation.conclusion.body}
              </p>
            </div>

            {/* Ausência de side effects — vale para toda a operação. */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Ausência de efeitos — vale para toda a operação
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                {controlledOperation.safety.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Controlled Run Record / Run State Boundary (Lane 14). Transforma o
              dry-run da Lane 13 em um modelo visual/declarativo de run governado,
              exibido ANTES de qualquer persistência real: estado do run (run mode
              dry-run/preview/read-only; run status simulated/blocked_for_real_
              execution/not_persisted; capability; tenant; operator role; side
              effects none; persistence not persisted), insumos (input sources:
              tenant context, role boundary, capability boundary, tool/memory
              boundary — leitura do estado já existente), resultado (execução real
              bloqueada até lanes futuras), ausência de persistência e requisitos
              futuros (schema, RLS, write policy, evidence trace, rollback/audit).
              Tudo declarativo: nenhum run gravado, nenhum SQL/schema/policy,
              nenhuma tool/memória, sem MCP/runner, sem chamada externa, sem
              escrita, sem botão que prometa persistir/executar run real. */}
          <section
            aria-labelledby="run-record-title"
            className="flex flex-col gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="run-record-title"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {runRecord.title}
                </h2>
                <span className="rounded-full border border-amber-400/60 px-2 py-0.5 text-xs text-amber-700 dark:border-amber-500/40 dark:text-amber-500">
                  {runRecord.status}
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {runRecord.intro}
              </p>
            </div>

            {/* Estado do run — run mode, run status, capability, tenant, papel,
                side effects (none), persistence (not persisted). */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {runRecord.runState.title}
              </h3>
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
            </div>

            {/* Insumos do run (input sources) — leitura do estado já existente. */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {runRecord.inputSources.title}
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                {runRecord.inputSources.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Resultado — execução real bloqueada até lanes futuras. */}
            <div className="flex flex-col gap-1 border-l-2 border-zinc-200 pl-3 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {runRecord.result.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {runRecord.result.body}
              </p>
            </div>

            {/* Persistência — o que ainda NÃO acontece (ausência explícita). */}
            <div className="flex flex-col gap-2 rounded-md border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {runRecord.persistence.title}
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                {runRecord.persistence.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Requisitos futuros para persistência real — cada um com gate. */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {runRecord.futurePersistence.title}
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500 dark:text-zinc-500">
                {runRecord.futurePersistence.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
          <LogoutControl />
        </section>
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

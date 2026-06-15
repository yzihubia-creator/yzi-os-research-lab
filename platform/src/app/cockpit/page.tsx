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
import {
  yzihubCommandCenterSeed as seed,
  type HonestState,
  type Tone,
} from "@/lib/yzihub/command-center-seed";

// YZIHUB Command Center V1 — primeira tela estratégica real do YZI OS.
//
// Autoridade: docs/yzi-os-active/04-implementation/yzihub-command-center-v1.md
// (+ visual-direction.md e module-map.md). O cockpit deixa de parecer painel
// técnico / run records e passa a ser o CENTRO DE COMANDO da YZIHUB: abre pelo
// estado da empresa e pela recomendação principal da YZI, mostra próximas ações,
// oportunidades, financeiro, agenda, conteúdos, alertas, créditos e os módulos
// como CAPACIDADES (por job). A leitura técnica/governança real (registros
// persistidos via RLS, agente planejado, limites) NÃO é protagonista: vive em um
// drawer secundário "Auditoria técnica", colapsado.
//
// Honestidade preservada: os dados operacionais vêm de SEED CONTROLADO em código
// (sem banco, sem execução real), sempre rotulado. Auth/tenant/logout intactos.
// Server Component (sem `use client`). NENHUM service role, SQL, MCP, API externa
// ou automação real é introduzido — ações são preview / aguardam autorização.

// Logout do operador (Lane 7, Batch 7.3) — preservado. Server Action simétrica ao
// login: encerra a sessão via `supabase.auth.signOut()` (limpa cookies pelo
// adapter @supabase/ssr) e redireciona para /login. Usa EXCLUSIVAMENTE valores
// públicos (URL + anon key); NUNCA service role, SQL, token, cookie ou OAuth code.
async function signOutOperator(): Promise<void> {
  "use server";

  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function LogoutControl() {
  return (
    <form action={signOutOperator}>
      <button
        type="submit"
        className="w-fit rounded-md border border-white/15 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/30 hover:text-zinc-100"
      >
        Encerrar sessão
      </button>
    </form>
  );
}

// --- Primitivos de apresentação (cockpit premium, escuro) -------------------
// Puramente visuais, sem estado e sem `use client`.

const toneAccent: Record<Tone, string> = {
  neutral: "text-zinc-400",
  opportunity: "text-emerald-400",
  risk: "text-amber-400",
  yzi: "text-indigo-300",
};

const toneDot: Record<Tone, string> = {
  neutral: "bg-zinc-500",
  opportunity: "bg-emerald-400",
  risk: "bg-amber-400",
  yzi: "bg-indigo-400",
};

// Selo de estado honesto. Nesta fase nenhuma ação é real: rótulos deixam isso
// explícito (preview / planejado / aguarda autorização / seed controlado).
function StatePill({ state }: { state: HonestState }) {
  const map: Record<HonestState, string> = {
    "aguarda autorização":
      "border-indigo-400/40 text-indigo-300 bg-indigo-400/5",
    preview: "border-white/15 text-zinc-400",
    planejado: "border-white/15 text-zinc-400",
    "seed controlado": "border-white/15 text-zinc-500",
  };
  return (
    <span
      className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[0.65rem] uppercase tracking-wide ${map[state]}`}
    >
      {state}
    </span>
  );
}

// Card de seção estratégica. `emphasis="yzi"` aplica a presença visual da YZI
// (borda/realce indigo); padrão é a superfície calma do cockpit.
function Panel({
  title,
  hint,
  children,
  emphasis = "default",
  className = "",
}: {
  title?: string;
  hint?: string;
  children: React.ReactNode;
  emphasis?: "default" | "yzi";
  className?: string;
}) {
  const shell =
    emphasis === "yzi"
      ? "border-indigo-400/30 bg-indigo-400/[0.04]"
      : "border-white/10 bg-white/[0.02]";
  return (
    <section className={`flex flex-col gap-4 rounded-xl border p-5 ${shell} ${className}`}>
      {title ? (
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
            {title}
          </h2>
          {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

// Marca compacta da YZI — presença reconhecível e discreta.
function YziMark({ label = "YZI" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-indigo-300">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
      {label}
    </span>
  );
}

// --- Página -----------------------------------------------------------------

export default async function CockpitPage() {
  const context = await getTenantContext();
  const operator = await getSessionUser();

  switch (context.status) {
    case "no_session":
      return (
        <section className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Entre para acessar sua operação.
          </h1>
          <p className="text-zinc-400">
            O Command Center do YZI OS exige uma sessão autenticada. Faça login
            para continuar.
          </p>
          <Link
            href="/login"
            className="w-fit rounded-md border border-white/15 px-4 py-2 text-sm text-zinc-200 transition-colors hover:border-white/30"
          >
            Ir para o login
          </Link>
        </section>
      );

    case "no_membership":
      return (
        <section className="flex flex-col gap-4">
          {operator?.email ? (
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Operador: {operator.email}
            </p>
          ) : null}
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              Você ainda não pertence a um tenant.
            </h1>
            <p className="text-zinc-400">
              Esta conta autenticada não está associada a nenhum tenant. Nenhum
              dado foi inventado para preencher esta tela. Quando você tiver um
              vínculo (membership) a um tenant, seu Command Center aparecerá aqui.
            </p>
            <p className="text-sm text-zinc-500">
              O vínculo (membership) determina o que você poderá ver, aprovar e
              operar. Sem ele, não há operação a supervisionar — e o sistema não
              cria pertencimento que você não tem.
            </p>
          </div>
          <LogoutControl />
        </section>
      );

    case "tenant_found": {
      const boundary = getPermissionBoundary(context.role);

      // Leituras técnicas/governança reais — preservadas, porém DEMOVIDAS para o
      // drawer "Auditoria técnica" (não protagonistas). Mesma honestidade das
      // lanes anteriores; nenhuma é produto principal.
      const registry = getAgentRegistryShell();
      const definition = getAgentDefinitionConfig();
      const capabilityBoundary = getAgentCapabilityBoundary();
      const toolMemoryBoundary = getToolMemoryBoundary();
      const controlledOperation = getControlledAgentOperation({
        tenantName: context.tenant.name,
        roleLabel: boundary.label,
      });
      const runRecord = getControlledRunRecord({
        tenantName: context.tenant.name,
        roleLabel: boundary.label,
      });
      const persistedRunRecords = await getControlledRunRecordsReadonly({
        tenantId: context.tenant.id,
        limit: 5,
      });

      const creditsPct = Math.min(
        100,
        Math.round((seed.credits.used / seed.credits.total) * 100),
      );

      return (
        <div className="flex flex-col gap-6">
          {/* BARRA DE CONTEXTO — tenant, operador, papel + logout + honestidade. */}
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                {context.tenant.name} · {boundary.label}
              </p>
              <p className="text-xs text-zinc-500">
                Operador: {operator?.email ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-zinc-500">
                Seed controlado · pré-visualização
              </span>
              <LogoutControl />
            </div>
          </header>

          {/* 1 + 3 (topo): ESTADO DA EMPRESA + RECOMENDAÇÃO PRINCIPAL DA YZI. */}
          <div className="grid gap-4 lg:grid-cols-5">
            <Panel
              title="Estado da empresa"
              hint={seed.company.dayLabel}
              className="lg:col-span-3"
            >
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                {seed.company.name}
              </h1>
              <p className="text-sm leading-relaxed text-zinc-300">
                {seed.company.stateSummary}
              </p>
              <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <span className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
                  Prioridade do dia
                </span>
                <p className="text-sm font-medium text-zinc-100">
                  {seed.company.priorityOfDay}
                </p>
              </div>
            </Panel>

            {/* Painel da YZI — presença viva, recomendação principal. */}
            <Panel emphasis="yzi" className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <YziMark label="YZI · assistente" />
                <StatePill state={seed.principalRecommendation.state} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-zinc-100">
                  {seed.principalRecommendation.headline}
                </p>
                <p className="text-sm text-zinc-400">
                  {seed.principalRecommendation.rationale}
                </p>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-indigo-400/20 bg-indigo-400/[0.04] p-3">
                <span className="text-[0.65rem] uppercase tracking-wide text-indigo-300/80">
                  Ação sugerida
                </span>
                <p className="text-sm text-zinc-200">
                  {seed.principalRecommendation.action}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-md bg-indigo-400/90 px-3 py-1.5 text-xs font-medium text-zinc-950 opacity-90"
                >
                  Autorizar ação
                </button>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-md border border-white/15 px-3 py-1.5 text-xs text-zinc-300"
                >
                  Ajustar
                </button>
                <span className="self-center text-[0.65rem] text-zinc-500">
                  A YZI só executa após autorização (preview).
                </span>
              </div>
            </Panel>
          </div>

          {/* 2: PRÓXIMAS AÇÕES (fila) — decisão acionável do dia. */}
          <Panel
            title="Próximas ações"
            hint="O que fazer agora, priorizado pela YZI"
          >
            <ul className="flex flex-col divide-y divide-white/5">
              {seed.actions.map((action, i) => (
                <li
                  key={action.id}
                  className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs text-zinc-400">
                    {i + 1}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium text-zinc-100">
                      {action.title}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {action.context}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">{action.due}</span>
                  <StatePill state={action.state} />
                </li>
              ))}
            </ul>
          </Panel>

          {/* 3: RECOMENDAÇÕES DA YZI — cards (autor: YZI). */}
          <Panel
            title="Recomendações da YZI"
            hint="Cruzando módulos para achar a próxima ação certa"
          >
            <div className="grid gap-3 md:grid-cols-3">
              {seed.recommendations.map((rec) => (
                <article
                  key={rec.id}
                  className="flex flex-col gap-2 rounded-lg border border-indigo-400/20 bg-indigo-400/[0.03] p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <YziMark />
                    <StatePill state={rec.state} />
                  </div>
                  <p className="text-sm font-medium text-zinc-100">
                    {rec.headline}
                  </p>
                  <p className="text-xs text-zinc-400">{rec.rationale}</p>
                  <p className="mt-auto text-xs text-indigo-200/80">
                    → {rec.action}
                  </p>
                </article>
              ))}
            </div>
          </Panel>

          {/* 4: OPORTUNIDADES. */}
          <Panel title="Oportunidades" hint="Onde há negócio para avançar">
            <ul className="grid gap-3 md:grid-cols-3">
              {seed.opportunities.map((opp) => (
                <li
                  key={opp.id}
                  className="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 rounded-full ${toneDot[opp.tone]}`}
                    />
                    <span className="text-xs uppercase tracking-wide text-zinc-500">
                      {opp.stage}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-zinc-100">
                    {opp.title}
                  </span>
                  <span className="text-sm font-semibold text-zinc-200">
                    {opp.value}
                  </span>
                  <span className={`text-xs ${toneAccent[opp.tone]}`}>
                    {opp.signal}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* 5 + 6: FINANCEIRO RESUMIDO + AGENDA DE HOJE. */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Financeiro resumido" hint="Saúde e previsibilidade">
              <ul className="flex flex-col divide-y divide-white/5">
                {seed.finance.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-zinc-200">{item.label}</span>
                      <span className="text-xs text-zinc-500">{item.note}</span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        item.kind === "receita"
                          ? "text-emerald-400"
                          : item.kind === "a receber"
                            ? "text-amber-400"
                            : "text-zinc-300"
                      }`}
                    >
                      {item.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Agenda de hoje" hint="Tempo a serviço da ação">
              <ul className="flex flex-col divide-y divide-white/5">
                {seed.agenda.map((evt) => (
                  <li
                    key={evt.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="w-12 shrink-0 text-sm font-medium text-zinc-300">
                      {evt.time}
                    </span>
                    <span className="flex-1 text-sm text-zinc-200">
                      {evt.title}
                    </span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-zinc-500">
                      {evt.kind}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* 7 + 8 + 9: CONTEÚDOS/CAMPANHAS + ALERTAS + CRÉDITOS. */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel
              title="Conteúdos e campanhas"
              hint="Presença e distribuição"
              className="lg:col-span-1"
            >
              <ul className="flex flex-col gap-3">
                {seed.content.map((c) => (
                  <li key={c.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-zinc-100">
                        {c.title}
                      </span>
                      <StatePill state={c.state} />
                    </div>
                    <span className="text-xs text-zinc-500">{c.channel}</span>
                    <span className="text-xs text-zinc-400">{c.status}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Alertas" hint="O que mudou e exige atenção">
              <div className="flex flex-col gap-2 rounded-lg border border-amber-400/30 bg-amber-400/[0.04] p-4">
                <div className="flex items-center gap-2">
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${toneDot[seed.alert.tone]}`} />
                  <span className="text-sm font-medium text-amber-300">
                    {seed.alert.title}
                  </span>
                </div>
                <p className="text-xs text-zinc-300">{seed.alert.detail}</p>
              </div>
            </Panel>

            <Panel title="Créditos / uso" hint={seed.credits.period}>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold text-zinc-100">
                  {seed.credits.used}
                  <span className="text-sm font-normal text-zinc-500">
                    {" "}
                    / {seed.credits.total}
                  </span>
                </span>
                <span className="text-xs text-zinc-500">{creditsPct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500"
                  style={{ width: `${creditsPct}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500">{seed.credits.note}</p>
            </Panel>
          </div>

          {/* 10: ACESSO AOS MÓDULOS — capacidades por job, não menu técnico. */}
          <Panel
            title="Capacidades"
            hint="Os módulos do YZI OS por job/resultado — abrem na decisão, não numa tabela"
          >
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {seed.modules.map((m) => (
                <li
                  key={m.key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-zinc-100">
                      {m.name}
                    </span>
                    <span className="truncate text-xs text-zinc-500">
                      {m.job}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-zinc-500">
                    {m.plan}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* 11: AUDITORIA TÉCNICA — SECUNDÁRIA, colapsada. Reúne a leitura real
              (RLS) e a governança das lanes; nunca protagonista da tela. */}
          <details className="rounded-xl border border-white/10 bg-white/[0.01]">
            <summary className="cursor-pointer px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Auditoria técnica (secundária)
            </summary>
            <div className="flex flex-col gap-5 border-t border-white/10 px-5 py-5">
              <p className="text-xs text-zinc-500">
                Leitura técnica e de governança para inspeção sob demanda. Não é o
                produto: o cockpit lidera por decisão e ação. Nada aqui executa
                agente, escreve em tabela, chama tool/MCP ou cria efeito externo.
              </p>

              {/* Papel / fronteira de permissão (real). */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-zinc-300">
                  Papel nesta operação — {boundary.label}
                </h3>
                <p className="text-sm text-zinc-500">{boundary.summary}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-zinc-500">
                      Pode fazer
                    </span>
                    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-400">
                      {boundary.can.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-zinc-500">
                      Ainda não pode
                    </span>
                    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500">
                      {boundary.cannotYet.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Agente planejado (Lanes 9 + 10). */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-zinc-300">
                  Agente planejado · {definition.status}
                </h3>
                <p className="text-sm text-zinc-500">{registry.emptyState.body}</p>
                <ul className="flex flex-col gap-2">
                  {definition.capabilities.map((item) => (
                    <li key={item.capability} className="text-sm text-zinc-400">
                      <span className="text-zinc-300">{item.capability}</span> —{" "}
                      {item.purpose}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-zinc-500">{definition.dependency}</p>
              </div>

              {/* Capacidades / limites (Lane 11). */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-zinc-300">
                  Limites por capacidade · {capabilityBoundary.status}
                </h3>
                <ul className="flex flex-col gap-2">
                  {capabilityBoundary.capabilities.map((item) => (
                    <li key={item.capability} className="text-sm text-zinc-400">
                      <span className="text-zinc-300">{item.capability}</span> —{" "}
                      poderá: {item.futureAbility}; ainda não: {item.notYet};
                      depende de: {item.dependency}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ferramentas e memória (Lane 12). */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-zinc-300">
                  Ferramentas e memória · {toolMemoryBoundary.tools.status}
                </h3>
                <p className="text-sm text-zinc-500">{toolMemoryBoundary.intro}</p>
                <ul className="flex flex-col gap-1">
                  {toolMemoryBoundary.memory.layers.map((item) => (
                    <li key={item.layer} className="text-sm text-zinc-400">
                      <span className="text-zinc-300">{item.layer}</span> (
                      {item.status}) — {item.restriction}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-zinc-500">
                  {toolMemoryBoundary.memory.ragSeparation.title}:{" "}
                  {toolMemoryBoundary.memory.ragSeparation.body}
                </p>
              </div>

              {/* Run governado (Lanes 13 + 14). */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-zinc-300">
                  Run governado · {runRecord.status}
                </h3>
                <dl className="flex flex-col gap-1 text-sm">
                  {runRecord.runState.items.map((item) => (
                    <div key={item.label} className="flex flex-wrap gap-x-2">
                      <dt className="text-zinc-500">{item.label}:</dt>
                      <dd className="text-zinc-400">{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-zinc-500">
                  {controlledOperation.safety.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Registros persistidos (Lane 18) — leitura real via RLS. */}
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-zinc-300">
                  Registros persistidos (leitura real, somente leitura)
                </h3>
                {persistedRunRecords.status === "error" ? (
                  <p role="alert" className="text-sm text-zinc-500">
                    {persistedRunRecords.message}
                  </p>
                ) : persistedRunRecords.records.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    Nenhum registro persistido ainda.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {persistedRunRecords.records.map((record) => (
                      <li
                        key={record.id}
                        className="flex flex-col gap-1 border-l-2 border-white/10 pl-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-zinc-200">
                            {record.capabilityKey}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {record.runMode} · {record.runStatus}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-zinc-500">
                          {record.createdAt}
                        </span>
                        <p className="text-sm text-zinc-500">
                          {record.resultSummary}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </details>

          {/* Nota de honestidade global. */}
          <p className="text-center text-[0.7rem] text-zinc-600">
            Dados operacionais acima são seed controlado da YZIHUB (sem banco, sem
            execução real). Ações são preview e só ocorrem após autorização,
            dentro de permissões, créditos e escopo.
          </p>
        </div>
      );
    }

    case "error":
      return (
        <section className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Não foi possível carregar sua operação.
          </h1>
          <p role="alert" className="text-zinc-400">
            Ocorreu uma falha ao confirmar sua sessão ou seu vínculo. Tente
            novamente. Nenhum dado foi exibido para não inventar um estado.
          </p>
          <div className="flex gap-2">
            <Link
              href="/cockpit"
              className="w-fit rounded-md border border-white/15 px-4 py-2 text-sm text-zinc-200 transition-colors hover:border-white/30"
            >
              Tentar novamente
            </Link>
            <Link
              href="/login"
              className="w-fit rounded-md border border-white/15 px-4 py-2 text-sm text-zinc-200 transition-colors hover:border-white/30"
            >
              Entrar de novo
            </Link>
          </div>
        </section>
      );
  }
}

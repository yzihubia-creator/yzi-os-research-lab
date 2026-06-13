import Link from "next/link";
import { redirect } from "next/navigation";

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

          <div className="rounded-md border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Base de operação agentic
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Ainda não há nada configurado — nenhum agente foi criado. Nada aqui
              é simulado.
            </p>
          </div>
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

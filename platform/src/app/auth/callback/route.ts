import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/lib/auth/session";

// Callback do Google OAuth (Lane 4, gate L4-G2). Troca o `code` por sessão via
// exchangeCodeForSession usando @supabase/ssr (cookies da request). Usa apenas
// valores públicos (URL + anon key) — NUNCA service role. Não consulta nenhuma
// tabela (sem `tenants`/`tenant_memberships`), não escreve em banco. Nunca loga
// `code`, token, cookie ou secret. Sucesso → `next` (interno) ou /cockpit;
// ausência de `code` ou falha → /login?error=oauth.

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");

  // Evita open-redirect: aceita apenas caminho interno (começa com "/", não
  // protocol-relative "//"). Qualquer outra coisa cai no destino padrão.
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/cockpit";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth", origin));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}

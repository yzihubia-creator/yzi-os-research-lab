import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Proteção de rota mínima (Lane 4, Step 4, gate L4-G2; decisão D6). No
// Next.js 16, Proxy substitui Middleware e fica em `src/proxy.ts`. O matcher
// limita a execução EXCLUSIVAMENTE a `/cockpit` — a única rota protegida.
// Sem sessão → redirect para `/login`. Usa apenas valores públicos (URL +
// anon/publishable key); NUNCA service role. Não consulta nenhuma tabela.

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";

  // Configuração ausente: fail-closed para o login, nunca liberar a rota.
  if (!url || !anonKey) {
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() valida o token contra o Supabase e renova a sessão via setAll.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

// Única rota protegida: /cockpit (e subrotas). Nenhuma outra rota é tocada.
export const config = {
  matcher: ["/cockpit", "/cockpit/:path*"],
};

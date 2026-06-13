import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";

// Sessão server-side mínima (Lane 4, Step 4, gate L4-G2). Usa
// `createServerClient` de @supabase/ssr com os cookies do Next.js para que
// `auth.uid()` exista nas queries RLS. Usa EXCLUSIVAMENTE valores públicos
// (URL + anon/publishable key) — NUNCA service role. Não consulta nenhuma
// tabela (sem `tenants`/`tenant_memberships`): apenas sessão/usuário.

/**
 * Cria um client Supabase server-side ligado aos cookies da request atual.
 *
 * Deve ser chamado por request (Server Component, Route Handler ou Server
 * Action). A escrita de cookies (`setAll`) só é possível em Server Actions /
 * Route Handlers; em Server Components ela é ignorada com segurança — a
 * persistência efetiva da sessão acontece no login (Server Action) e no proxy.
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local (ver .env.example).",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Chamado de um Server Component, onde os cookies são read-only.
          // Seguro ignorar: a sessão é persistida no proxy / Server Action.
        }
      },
    },
  });
}

/**
 * Retorna o usuário autenticado da sessão atual, ou `null` quando não há
 * sessão. Ausência de sessão é estado esperado, não erro crítico.
 */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return data.user;
}

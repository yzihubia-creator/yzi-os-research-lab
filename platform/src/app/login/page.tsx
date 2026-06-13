import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/auth/session";

// Login mínimo da Lane 4 migrado para Google OAuth (gate L4-G2). Apenas um
// botão "Entrar com Google" via signInWithOAuth — SEM e-mail/senha, signup,
// recovery, onboarding, perfis ou roles. Server Component + Server Action: sem
// `use client`. Usa EXCLUSIVAMENTE valores públicos (URL + anon key); nunca
// service role. Não consulta `tenants` nem `tenant_memberships`. Falha de OAuth
// é tratada honestamente (mensagem via querystring), nunca crash.

async function signInWithGoogle(): Promise<void> {
  "use server";

  // Origin da request atual para montar o redirectTo do callback. Em POST de
  // mesma origem o header `origin` está presente; fallback para `host`.
  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    `http://${requestHeaders.get("host") ?? "localhost:3000"}`;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/cockpit`,
    },
  });

  if (error || !data?.url) {
    // Mensagem genérica e honesta — sem vazar detalhes do backend.
    redirect("/login?error=oauth");
  }

  // Redireciona para a URL de consentimento do Google retornada pelo Supabase.
  redirect(data.url);
}

function messageFor(error: string | undefined): string | null {
  if (error === "oauth") {
    return "Não foi possível entrar com o Google. Tente novamente.";
  }
  return null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = messageFor(error);

  return (
    <main>
      <h1>Entrar</h1>
      <form action={signInWithGoogle}>
        <button type="submit">Entrar com Google</button>
      </form>
      {message ? <p role="alert">{message}</p> : null}
    </main>
  );
}

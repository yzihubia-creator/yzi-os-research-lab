import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AuthPanel } from "@/components/yzi-os/auth-panel";
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
    <AuthPanel
      eyebrow="YZI OS · acesso controlado"
      title="Entrar com Google"
      description="O acesso ao cockpit é controlado por Google OAuth. Nenhum tenant, lead ou dado operacional é mostrado nesta tela."
      note="Use sua conta Google autorizada para continuar até o Command Center. Se a autenticação falhar, a mensagem abaixo preserva apenas o estado necessário para orientar a tentativa."
      errorMessage={message}
      primaryAction={
        <form action={signInWithGoogle} className="flex flex-col gap-3">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90"
          >
            Entrar com Google
          </button>
        </form>
      }
    />
  );
}

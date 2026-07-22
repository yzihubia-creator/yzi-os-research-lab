"use client";

import { useState } from "react";

import { YziAlert } from "@/components/yzi-os/yzi-primitives";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function GoogleOAuthLoginButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleLogin() {
    setError(null);
    setPending(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/cockpit`,
        },
      });

      if (oauthError || !data?.url) {
        setError("Não foi possível iniciar a autenticação com Google.");
        return;
      }

      window.location.assign(data.url);
    } catch {
      setError("Não foi possível iniciar a autenticação com Google.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleLogin}
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Redirecionando..." : "Entrar com Google"}
      </button>
      {error ? <YziAlert tone="risk">{error}</YziAlert> : null}
    </div>
  );
}

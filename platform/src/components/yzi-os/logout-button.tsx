"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton({
  className = "",
  label = "Sair",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setError(null);
    setPending(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError("Não foi possível encerrar a sessão.");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Não foi possível encerrar a sessão.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className={`w-fit rounded-md border border-white/15 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/30 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        {pending ? "Saindo..." : label}
      </button>
      {error ? (
        <p role="alert" className="text-[0.65rem] text-amber-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

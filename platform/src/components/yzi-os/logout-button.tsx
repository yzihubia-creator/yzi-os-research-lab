"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LogoutIcon } from "@/components/yzi-os/yzi-icons";
import {
  YziAlert,
  YziButton,
} from "@/components/yzi-os/yzi-primitives";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton({
  className = "",
  label = "Sair",
  iconOnly = false,
}: {
  className?: string;
  label?: string;
  iconOnly?: boolean;
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

  if (iconOnly) {
    return (
      <YziButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={pending}
        title={label}
        aria-label={label}
        className={`h-9 w-9 p-0 ${className}`}
      >
        <LogoutIcon className="h-4.5 w-4.5" />
      </YziButton>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <YziButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={pending}
        className={className}
      >
        <LogoutIcon className="h-3.5 w-3.5" />
        {pending ? "Saindo..." : label}
      </YziButton>
      {error ? (
        <YziAlert tone="blocked" className="px-2 py-1 text-[0.65rem]">
          {error}
        </YziAlert>
      ) : null}
    </div>
  );
}

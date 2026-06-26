import type { Metadata } from "next";

import { YziShell } from "@/components/yzi-os/yzi-shell";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "YZI OS",
  description:
    "Superfície operacional do YZI OS: Assistente YZI no centro e módulos institucionais em ativação.",
};

export default async function CockpitLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Leitura read-only só para exibir o operador no rodapé da sidebar. A
  // proteção de sessão efetiva permanece na page (/cockpit) e no proxy/middleware.
  const operator = await getSessionUser();

  return <YziShell operatorEmail={operator?.email}>{children}</YziShell>;
}

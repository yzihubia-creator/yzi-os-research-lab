import { redirect } from "next/navigation";

import { YziCommandCenter } from "@/components/yzi-os/yzi-command-center";
import { getSessionUser } from "@/lib/auth/session";
import { getTenantContext } from "@/lib/tenant/tenant-context";

// Tela principal do YZI OS = COMMAND CENTER hero-first (contrato visual v1.2).
// A home começa pela presença da YZI (saudação + composer central + ações por
// job) e a operação emerge abaixo do hero. Mantém a proteção de sessão
// existente (redirect para /login quando não há sessão). Estado honesto de
// preview: nenhum dado operacional real e nenhuma resposta simulada.
export default async function CockpitPage() {
  const context = await getTenantContext();

  if (context.status === "no_session") {
    redirect("/login");
  }

  const operator = await getSessionUser();

  return <YziCommandCenter operatorEmail={operator?.email} />;
}

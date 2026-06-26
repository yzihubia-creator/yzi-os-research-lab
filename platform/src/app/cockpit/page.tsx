import { redirect } from "next/navigation";

import { YziCommandCenter } from "@/components/yzi-os/yzi-command-center";
import { getTenantContext } from "@/lib/tenant/tenant-context";

// Tela principal do YZI OS = COMMAND CENTER / Mesa de Decisão Operacional
// (Brandbook pág. 9). Mantém a proteção de sessão existente (redirect para
// /login quando não há sessão). Não é dashboard, pipeline, nem chat central:
// é a mesa onde o gestor lê o estado, decide e autoriza, com a YZI como
// orquestradora discreta. Estado honesto de preview: nenhum dado operacional
// real é exibido nesta fase.
export default async function CockpitPage() {
  const context = await getTenantContext();

  if (context.status === "no_session") {
    redirect("/login");
  }

  return <YziCommandCenter />;
}

import { YziImobHomeV2 } from "@/components/yzi-imob/yzi-imob-home-v2";

// A vertical YZI IMOB abre pela YZI (entrada do sistema), não por um dashboard.
// Home provisória do Workspace Shell v2. Sem dados reais; a proteção de sessão
// permanece no layout do cockpit e no middleware.
export default function YziImobIndexPage() {
  return <YziImobHomeV2 />;
}

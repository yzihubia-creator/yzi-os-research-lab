import {
  getCockpitModule,
  ModulePlaceholderPage,
} from "@/components/yzi-os/cockpit-modules";

export default function AcoesPage() {
  return (
    <ModulePlaceholderPage moduleInfo={getCockpitModule("/cockpit/acoes")} />
  );
}

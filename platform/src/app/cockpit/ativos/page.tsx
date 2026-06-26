import {
  getCockpitModule,
  ModulePlaceholderPage,
} from "@/components/yzi-os/cockpit-modules";

export default function AtivosPage() {
  return (
    <ModulePlaceholderPage moduleInfo={getCockpitModule("/cockpit/ativos")} />
  );
}

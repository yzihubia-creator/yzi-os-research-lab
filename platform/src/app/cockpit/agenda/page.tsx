import {
  getCockpitModule,
  ModulePlaceholderPage,
} from "@/components/yzi-os/cockpit-modules";

export default function AgendaPage() {
  return (
    <ModulePlaceholderPage moduleInfo={getCockpitModule("/cockpit/agenda")} />
  );
}

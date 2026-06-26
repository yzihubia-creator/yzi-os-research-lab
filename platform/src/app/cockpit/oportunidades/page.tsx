import {
  getCockpitModule,
  ModulePlaceholderPage,
} from "@/components/yzi-os/cockpit-modules";

export default function OportunidadesPage() {
  return (
    <ModulePlaceholderPage
      moduleInfo={getCockpitModule("/cockpit/oportunidades")}
    />
  );
}

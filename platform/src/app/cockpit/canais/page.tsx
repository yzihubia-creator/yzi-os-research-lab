import {
  getCockpitModule,
  ModulePlaceholderPage,
} from "@/components/yzi-os/cockpit-modules";

export default function CanaisPage() {
  return (
    <ModulePlaceholderPage moduleInfo={getCockpitModule("/cockpit/canais")} />
  );
}

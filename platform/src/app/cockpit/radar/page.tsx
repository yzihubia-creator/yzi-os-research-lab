import {
  getCockpitModule,
  ModulePlaceholderPage,
} from "@/components/yzi-os/cockpit-modules";

export default function RadarPage() {
  return (
    <ModulePlaceholderPage moduleInfo={getCockpitModule("/cockpit/radar")} />
  );
}

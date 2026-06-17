import {
  getCockpitModule,
  ModulePlaceholderPage,
} from "@/components/yzi-os/cockpit-modules";

export default function CrmPage() {
  return <ModulePlaceholderPage moduleInfo={getCockpitModule("/cockpit/crm")} />;
}

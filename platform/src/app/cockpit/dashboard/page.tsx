import {
  getCockpitModule,
  ModulePlaceholderPage,
} from "@/components/yzi-os/cockpit-modules";

export default function DashboardPage() {
  return (
    <ModulePlaceholderPage
      moduleInfo={getCockpitModule("/cockpit/dashboard")}
    />
  );
}

import {
  getCockpitModule,
  ModulePlaceholderPage,
} from "@/components/yzi-os/cockpit-modules";

export default function FinanceiroPage() {
  return (
    <ModulePlaceholderPage
      moduleInfo={getCockpitModule("/cockpit/financeiro")}
    />
  );
}

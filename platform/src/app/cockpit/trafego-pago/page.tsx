import {
  getCockpitModule,
  ModulePlaceholderPage,
} from "@/components/yzi-os/cockpit-modules";

export default function TrafegoPagoPage() {
  return (
    <ModulePlaceholderPage
      moduleInfo={getCockpitModule("/cockpit/trafego-pago")}
    />
  );
}

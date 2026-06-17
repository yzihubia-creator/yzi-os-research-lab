import {
  getCockpitModule,
  ModulePlaceholderPage,
} from "@/components/yzi-os/cockpit-modules";

export default function AssistentePage() {
  return (
    <ModulePlaceholderPage
      moduleInfo={getCockpitModule("/cockpit/assistente")}
    />
  );
}

import {
  getCockpitModule,
  ModulePlaceholderPage,
} from "@/components/yzi-os/cockpit-modules";

export default function BuscaSemanticaPage() {
  return (
    <ModulePlaceholderPage
      moduleInfo={getCockpitModule("/cockpit/busca-semantica")}
    />
  );
}

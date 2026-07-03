import { YziSurface } from "@/components/yzi-os/yzi-primitives";
import { AssetsIcon } from "@/components/yzi-os/yzi-icons";

export function YziImobCatalogEmptyState() {
  return (
    <YziSurface
      variant="elevated"
      className="flex flex-col items-center gap-2 border-dashed p-10 text-center"
    >
      <AssetsIcon className="h-5 w-5 text-[var(--yzi-text-faint)]" />
      <p className="text-sm font-medium text-[var(--yzi-text-primary)]">
        Nenhum imóvel cadastrado ainda.
      </p>
      <p className="max-w-md text-xs leading-relaxed text-[var(--yzi-text-faint)]">
        Quando o corretor finalizar o formulário de cadastro, a YZI
        organizará os dados e o imóvel aparecerá aqui como card operacional
        para alimentar site, criativos, campanhas, WhatsApp e pipeline.
      </p>
    </YziSurface>
  );
}

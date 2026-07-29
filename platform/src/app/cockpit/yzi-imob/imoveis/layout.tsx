import { YziImobImoveisNav } from "@/components/yzi-imob/properties/yzi-imob-imoveis-nav";

// Layout da área de Imóveis: navegação interna compartilhada (Visão geral ·
// Catálogo · Cadastrar imóvel · Distribuição) acima do conteúdo de cada
// surface. A nav se oculta sozinha nas telas de detalhe ([id]).

export default function YziImobImoveisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full w-full flex-col">
      <YziImobImoveisNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}

"use client";

export function GrowthEmptyState({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-[var(--yzi-radius-md)] border border-dashed border-[color:var(--yzi-border-subtle)] px-4 py-3 text-[0.78rem]">
      <p className="font-medium text-[var(--yzi-text-primary)]">{title}</p>
      <p className="mt-1 text-[var(--yzi-text-secondary)]">{detail}</p>
    </div>
  );
}

export function GrowthMockNotice({
  active,
  ready = ["conteudo"],
}: {
  active: import("./types").GrowthSurface;
  ready?: import("./types").GrowthSurface[];
}) {
  if (ready.includes(active)) {
    return null;
  }

  const labels: Record<import("./types").GrowthSurface, string> = {
    briefing: "Briefing",
    estrategia: "Estratégia",
    conteudo: "Conteúdo",
    campanhas: "Campanhas",
    biblioteca: "Biblioteca",
    resultados: "Resultados",
  };

  return <GrowthEmptyState title={`Em construção para ${labels[active]}.`} detail="Estado visual reservado para expansão." />;
}


// Saudação hero-first (contrato visual v1.2), compartilhada entre a home do
// YZI OS e a home do YZI IMOB para não duplicar a lógica de hora/nome.

export function subscribeNoop(): () => void {
  return () => {};
}

export function hourGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function operatorName(email?: string | null): string {
  const prefix = email?.trim().split("@")[0] ?? "";
  const first = prefix.split(/[^\p{L}]+/u).find(Boolean) ?? "";
  return first ? first[0].toUpperCase() + first.slice(1).toLowerCase() : "";
}

import {
  YziProgressBar,
  type ProgressLevel,
  type ProgressTone,
} from "@/components/yzi-os/yzi-dashboard-primitives";
import { YziBadge, YziPanel } from "@/components/yzi-os/yzi-primitives";
import { AuditIcon } from "@/components/yzi-os/yzi-icons";

// Prontidão comercial de um imóvel ao longo do pipeline. Todas as dimensões
// nascem em "inicial" porque nada foi feito ainda — leitura qualitativa
// honesta, sem porcentagem nem progresso fabricado.
type ReadinessStep = {
  label: string;
  level: ProgressLevel;
  tone: ProgressTone;
  valueLabel: string;
};

const READINESS_STEPS: ReadinessStep[] = [
  { label: "Cadastro do imóvel", level: "low", tone: "neutral", valueLabel: "inicial" },
  { label: "Mídia organizada", level: "low", tone: "neutral", valueLabel: "inicial" },
  { label: "Silo / SEO do site", level: "low", tone: "neutral", valueLabel: "inicial" },
  { label: "Inteligência de dados", level: "low", tone: "neutral", valueLabel: "inicial" },
  { label: "Criativos e conteúdo", level: "low", tone: "neutral", valueLabel: "inicial" },
  { label: "Plano de campanha", level: "low", tone: "warning", valueLabel: "aguardando" },
];

export function YziImobPropertyReadinessPanel() {
  return (
    <YziPanel className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[var(--yzi-text-secondary)]">
          <AuditIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold text-[var(--yzi-text-primary)]">
            Prontidão comercial
          </h2>
        </div>
        <YziBadge tone="neutral" className="normal-case">
          análise antes da verba
        </YziBadge>
      </div>

      <div className="flex flex-col gap-3">
        {READINESS_STEPS.map((step) => (
          <YziProgressBar
            key={step.label}
            label={step.label}
            valueLabel={step.valueLabel}
            level={step.level}
            tone={step.tone}
            size="sm"
          />
        ))}
      </div>

      <p className="text-[0.68rem] leading-relaxed text-[var(--yzi-text-secondary)]">
        Nenhum imóvel recebe verba antes de passar por cadastro, mídia, SEO e
        análise de dados. A campanha é a última etapa, não a primeira.
      </p>
    </YziPanel>
  );
}

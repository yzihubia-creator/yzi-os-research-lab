import type { RadarSignal } from "@/lib/yzi-imob/radar/types";
import type { ResultsWorkspaceData } from "@/lib/yzi-imob/results/types";

// Growth OS — derivação de leitura estratégica a partir de contratos que já
// existem (Resultados + Radar). Este módulo é PRESENTAÇÃO: não consulta banco,
// não cria contrato novo e não inventa número. Se o dado não existe, a leitura
// correspondente simplesmente não é produzida — nunca é estimada.
//
// Growth OS responde "onde investir e por quê". Resultados responde "o que
// aconteceu". Marketing responde "o que está sendo produzido e publicado".

export type GrowthReadingTone = "opportunity" | "risk" | "steady";

export type GrowthReading = {
  id: string;
  /** A pergunta de negócio que esta leitura responde. */
  question: string;
  /** O achado, com número real. */
  finding: string;
  /** Evidências que sustentam o achado. */
  evidence: string[];
  /** O que isso implica para a decisão do gestor. */
  implication: string;
  tone: GrowthReadingTone;
  /** Para onde o gestor vai agir. */
  actionLabel: string;
  actionHref: string;
};

export type GrowthPanorama = {
  /** Passo do funil com a maior perda proporcional. */
  weakestStep: { label: string; value: number; lost: number } | null;
  /** Canal que mais trouxe leads no período. */
  topChannel: { label: string; count: number; percentage: number } | null;
  /** Direção da operação comparando a primeira e a última metade do período. */
  direction: "subindo" | "estável" | "caindo" | "sem-histórico";
  /** Variação percentual de leads entre as metades do período. */
  directionDelta: number | null;
};

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

/**
 * Panorama: a leitura de uma frase da operação. Só usa taxas que o contrato de
 * Resultados já calculou e a série temporal que ele já entregou.
 */
export function buildGrowthPanorama(data: ResultsWorkspaceData): GrowthPanorama {
  const ratesWithValue = data.rates.filter(
    (rate) => rate.value !== null && rate.denominator > 0,
  );

  const weakest = ratesWithValue.reduce<GrowthPanorama["weakestStep"]>((worst, rate) => {
    const value = rate.value ?? 0;
    const lost = rate.denominator - rate.numerator;
    if (!worst || value < worst.value) {
      return { label: rate.label, value, lost };
    }
    return worst;
  }, null);

  const topChannel =
    [...data.leadSources].sort((a, b) => b.count - a.count)[0] ?? null;

  let direction: GrowthPanorama["direction"] = "sem-histórico";
  let directionDelta: number | null = null;

  if (data.trend.length >= 4) {
    const half = Math.floor(data.trend.length / 2);
    const first = data.trend.slice(0, half).reduce((sum, point) => sum + point.leads, 0);
    const second = data.trend.slice(half).reduce((sum, point) => sum + point.leads, 0);

    if (first === 0 && second === 0) {
      direction = "estável";
      directionDelta = 0;
    } else if (first === 0) {
      direction = "subindo";
      directionDelta = null;
    } else {
      directionDelta = ((second - first) / first) * 100;
      direction =
        directionDelta > 15 ? "subindo" : directionDelta < -15 ? "caindo" : "estável";
    }
  }

  return {
    weakestStep: weakest,
    topChannel: topChannel
      ? { label: topChannel.label, count: topChannel.count, percentage: topChannel.percentage }
      : null,
    direction,
    directionDelta,
  };
}

/**
 * Leituras acionáveis. Cada uma nasce de um dado real; nenhuma é produzida por
 * padrão só para a seção não ficar vazia.
 */
export function buildGrowthReadings(
  data: ResultsWorkspaceData,
  signals: readonly RadarSignal[],
): GrowthReading[] {
  const readings: GrowthReading[] = [];
  const panorama = buildGrowthPanorama(data);

  // 1. O degrau do funil que mais perde gente.
  if (panorama.weakestStep && panorama.weakestStep.lost > 0) {
    readings.push({
      id: "funil-degrau-fraco",
      question: "Onde a operação mais perde gente?",
      finding: `${panorama.weakestStep.label} converte ${formatPercent(panorama.weakestStep.value)} — ${formatNumber(panorama.weakestStep.lost)} ${panorama.weakestStep.lost === 1 ? "pessoa não avançou" : "pessoas não avançaram"}.`,
      evidence: [
        `Menor taxa entre as etapas medidas no período`,
        `${formatNumber(panorama.weakestStep.lost)} sem avanço`,
      ],
      implication:
        "Ganhar alguns pontos neste degrau vale mais do que trazer leads novos: o volume que já entrou está parando aqui.",
      tone: "risk",
      actionLabel: "Ver onde travou",
      actionHref: "/cockpit/yzi-imob/growth/resultados",
    });
  }

  // 2. Concentração de origem — risco quando um canal responde por quase tudo.
  if (panorama.topChannel && panorama.topChannel.percentage >= 60) {
    readings.push({
      id: "concentracao-canal",
      question: "De onde vem o seu volume?",
      finding: `${panorama.topChannel.label} responde por ${formatPercent(panorama.topChannel.percentage)} dos leads do período.`,
      evidence: [
        `${formatNumber(panorama.topChannel.count)} leads deste canal`,
        `${data.leadSources.length} ${data.leadSources.length === 1 ? "canal ativo" : "canais ativos"} no período`,
      ],
      implication:
        "Se este canal oscilar, a operação inteira sente. Vale testar um segundo canal antes de precisar dele.",
      tone: "risk",
      actionLabel: "Ver publicações",
      actionHref: "/cockpit/yzi-imob/marketing/publicacoes",
    });
  } else if (panorama.topChannel && panorama.topChannel.count > 0) {
    readings.push({
      id: "canal-principal",
      question: "Qual canal está puxando o resultado?",
      finding: `${panorama.topChannel.label} trouxe ${formatNumber(panorama.topChannel.count)} ${panorama.topChannel.count === 1 ? "lead" : "leads"} — ${formatPercent(panorama.topChannel.percentage)} do total.`,
      evidence: [`${data.leadSources.length} canais com registro no período`],
      implication:
        "Reforçar o que já funciona costuma render mais rápido do que abrir uma frente nova.",
      tone: "opportunity",
      actionLabel: "Programar mais conteúdo",
      actionHref: "/cockpit/yzi-imob/marketing/publicacoes",
    });
  }

  // 3. Direção da operação.
  if (panorama.direction !== "sem-histórico" && panorama.directionDelta !== null) {
    const rising = panorama.direction === "subindo";
    const falling = panorama.direction === "caindo";
    if (rising || falling) {
      readings.push({
        id: "direcao-periodo",
        question: "A operação está acelerando ou desacelerando?",
        finding: `A entrada de leads ${rising ? "cresceu" : "caiu"} ${formatPercent(Math.abs(panorama.directionDelta))} na segunda metade do período.`,
        evidence: [`Comparação entre as duas metades de ${data.period.label.toLowerCase()}`],
        implication: rising
          ? "O momento é bom para aumentar o volume de publicação: a demanda está respondendo."
          : "Antes de investir mais, vale entender o que mudou — pode ser sazonalidade ou queda de alcance.",
        tone: rising ? "opportunity" : "risk",
        actionLabel: "Ver evolução",
        actionHref: "/cockpit/yzi-imob/growth/resultados",
      });
    }
  }

  // 4. Gargalos que o contrato de Resultados já identificou.
  for (const bottleneck of data.bottlenecks.slice(0, 2)) {
    if (bottleneck.value === null || bottleneck.value <= 0) continue;
    readings.push({
      id: `gargalo-${bottleneck.id}`,
      question: "O que está segurando o avanço?",
      finding: `${bottleneck.label}: ${formatNumber(bottleneck.value)}.`,
      evidence: bottleneck.detail ? [bottleneck.detail] : [],
      implication:
        "Cada item parado aqui é uma oportunidade que já foi paga e ainda não virou conversa.",
      tone: "risk",
      actionLabel: "Resolver agora",
      actionHref: "/cockpit/yzi-imob/radar",
    });
  }

  // 5. Imóveis com interesse que ainda não viraram conversa — vem do Radar.
  const stalledProperties = signals.filter(
    (signal) => signal.category === "ativo" && signal.severity !== "info",
  );
  if (stalledProperties.length > 0) {
    readings.push({
      id: "imoveis-parados",
      question: "Qual imóvel merece prioridade?",
      finding: `${formatNumber(stalledProperties.length)} ${stalledProperties.length === 1 ? "imóvel está" : "imóveis estão"} prontos para receber atenção comercial.`,
      evidence: stalledProperties.slice(0, 3).map((signal) => signal.title),
      implication:
        "Imóvel parado consome posição no catálogo sem gerar conversa. Priorize os que já têm interesse registrado.",
      tone: "opportunity",
      actionLabel: "Abrir imóveis",
      actionHref: "/cockpit/yzi-imob/imoveis",
    });
  }

  return readings;
}

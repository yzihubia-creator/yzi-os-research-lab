import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildGrowthPanorama,
  buildGrowthReadings,
} from "../src/lib/yzi-imob/growth/readings.ts";
import {
  AREA_BY_CATEGORY,
  RADAR_SIGNAL_COPY,
  describeSignal,
  isAwaitingRelease,
} from "../src/lib/yzi-imob/radar/presentation.ts";
import {
  RESULTS_METRIC_COPY,
  splitByMovement,
} from "../src/lib/yzi-imob/results/presentation.ts";
import type { RadarSignal, RadarSignalType } from "../src/lib/yzi-imob/radar/types.ts";
import type { ResultsMetricValue, ResultsWorkspaceData } from "../src/lib/yzi-imob/results/types.ts";

// Contratos de frontend das superfícies do YZI IMOB.
//
// Estes testes travam o que uma passagem de design pode acidentalmente
// desfazer: vocabulário técnico vazando para o gestor, superfícies voltando a
// inventar a própria gramática visual, e a redundância Marketing/Growth OS.
// Não são snapshots de pixel — são invariantes de produto.

const CORE_COPY_FILES = [
  "src/app/cockpit/yzi-imob/corretores/page.tsx",
  "src/app/cockpit/yzi-imob/clientes/page.tsx",
  "src/app/cockpit/yzi-imob/atendimento/page.tsx",
  "src/components/yzi-imob/properties/yzi-imob-properties-overview.tsx",
  "src/components/yzi-imob/yzi-imob-property-catalog-v2.tsx",
  "src/components/yzi-imob/properties/yzi-imob-property-create-workspace.tsx",
  "src/components/yzi-imob/yzi-imob-property-workspace.tsx",
  "src/components/yzi-imob/yzi-imob-broker-workspace.tsx",
  "src/components/yzi-imob/yzi-imob-team-access-workspace.tsx",
  "src/components/yzi-imob/yzi-imob-client-workspace.tsx",
  "src/components/yzi-imob/yzi-imob-conversation-workspace.tsx",
] as const;

const SURFACE_FILES = [
  "src/components/yzi-imob/yzi-imob-social-publications-workspace.tsx",
  "src/components/yzi-imob/yzi-imob-growth-os-workspace.tsx",
  "src/components/yzi-imob/yzi-imob-agenda-workspace.tsx",
  "src/components/yzi-imob/yzi-imob-growth-resultados-v0.tsx",
  "src/components/yzi-imob/yzi-imob-radar-workspace.tsx",
  "src/components/yzi-imob/yzi-imob-system-workspace.tsx",
  "src/components/yzi-imob/yzi-imob-connections-workspace.tsx",
  "src/components/yzi-imob/yzi-imob-apis-creditos-workspace.tsx",
  "src/components/yzi-imob/yzi-imob-operational-settings-workspace.tsx",
] as const;

async function read(path: string): Promise<string> {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

/**
 * Extrai apenas o que o gestor pode ler: prosa em literais de string e texto
 * solto em JSX. Identificadores, chaves de objeto, classes CSS, imports, tipos
 * e comentários ficam de fora — o nome do fornecedor pode existir no código,
 * nunca na tela.
 */
function renderedText(source: string): string {
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");

  const withoutImports = withoutComments.replace(/^import[\s\S]*?from\s+["'].*?["'];?$/gm, " ");

  const literals = (withoutImports.match(/"[^"\n]*"|'[^'\n]*'|`[^`]*`/g) ?? [])
    .map((literal) => literal.slice(1, -1).replace(/\$\{[\s\S]*?\}/g, " "))
    // Só prosa: precisa ter espaço entre palavras e nenhuma marca de código.
    // Isso descarta chaves (`tenant-error`), classes utilitárias e rotas.
    .filter(
      (literal) =>
        /[a-zà-ú]\s+[a-zà-ú]/i.test(literal) &&
        !/[[\]()/\\#]|--|var\(|text-\[|rounded-/.test(literal),
    );

  const jsxText = (withoutImports.match(/>[^<>{}\n]{3,}</g) ?? []).map((chunk) =>
    chunk.slice(1, -1),
  );

  return [...literals, ...jsxText].join("\n");
}

test("nenhuma superfície expõe fornecedor, infraestrutura ou identificador interno", async () => {
  // Termos que jamais podem aparecer para quem opera a imobiliária.
  const forbidden = [
    /metricool/i,
    /higgsfield/i,
    /remotion/i,
    /supabase/i,
    /\bwaba\b/i,
    /yzi_imob_[a-z_]+/i,
    /tenant_connections/i,
    /\bmcp\b/i,
    /\bprovider\b/i,
    /\btransport\b/i,
    /\brunner\b/i,
    /\bmembership\b/i,
    /\bassignment\b/i,
    /\bconversation\b/i,
    /\bwebhook/i,
    /\boauth\b/i,
    /\bendpoint/i,
    /stack trace/i,
    /\bpayload\b/i,
    /\bmock\b/i,
    /\btenant\b/i,
  ];

  for (const file of [...CORE_COPY_FILES, ...SURFACE_FILES]) {
    const text = renderedText(await read(file));
    for (const pattern of forbidden) {
      assert.equal(
        pattern.test(text),
        false,
        `${file} expõe "${pattern.source}" em texto visível ao gestor`,
      );
    }
  }
});

test("estados operacionais crus nunca chegam à tela sem tradução", async () => {
  // Campos que carregam vocabulário interno e por isso precisam passar por um
  // mapa de tradução antes de virar texto. `ConnectionHumanStatus` fica de fora
  // de propósito: o contrato de Conexões já entrega estado em português.
  const rawFields = [
    "publication.status",
    "signal.status",
    "signal.type",
    "signal.source",
    "signal.entityType",
    "signal.entityId",
    "resource.status",
    "resource.provider",
    "resource.label",
    "resource.description",
    "appointment.status",
    "appointment.confirmationStatus",
    "metric.sourceId",
    "metric.providerMetricName",
    "source.availability",
    "workspace.connection.status",
  ];

  for (const file of [...CORE_COPY_FILES, ...SURFACE_FILES]) {
    const source = await read(file);
    for (const field of rawFields) {
      const escaped = field.replace(/\./g, "\\.");
      // Interpolação direta em JSX: `{item.status}` ou `{`… ${item.status}`}`.
      const pattern = new RegExp(`\\{\\s*${escaped}\\s*\\}|\\$\\{\\s*${escaped}\\s*\\}`);
      assert.equal(
        pattern.test(source),
        false,
        `${file} renderiza ${field} sem traduzir para linguagem do gestor`,
      );
    }
  }
});

test("todas as superfícies abertas usam a gramática visual compartilhada", async () => {
  for (const file of SURFACE_FILES) {
    const source = await read(file);
    assert.ok(
      source.includes("yzi-imob-surface-kit"),
      `${file} não usa o Surface Kit — cada tela voltaria a inventar spacing, tipografia e cor`,
    );
  }
});

test("a presença da YZI é sempre a família canônica, nunca um gradiente local", async () => {
  for (const file of SURFACE_FILES) {
    const source = await read(file);
    // Nenhuma superfície pode declarar o próprio gradiente para representar a YZI.
    assert.equal(
      /className=["'][^"']*bg-gradient-to/.test(source),
      false,
      `${file} declara um gradiente local — a assinatura da YZI vive só em .yzi-imob-yzi`,
    );
  }

  // A casca canônica existe e é a única fonte do gradiente.
  const kit = await read("src/components/yzi-imob/yzi-imob-yzi-kit.tsx");
  assert.ok(kit.includes("yzi-imob-yzi"));
  const css = await read("src/app/globals.css");
  assert.ok(css.includes(".yzi-imob-yzi {"), "a assinatura da YZI precisa existir no globals.css");
});

test("todo controle de formulário citado pelas superfícies existe de verdade", async () => {
  const css = await read("src/app/globals.css");
  // `.yzi-field` era usado por Radar e Resultados sem nunca ter sido declarado:
  // os selects caíam no estilo padrão do navegador.
  assert.ok(css.includes(".yzi-field {"), ".yzi-field precisa estar declarado");

  for (const file of SURFACE_FILES) {
    const source = await read(file);
    if (source.includes("yzi-field")) {
      assert.ok(css.includes(".yzi-field {"));
    }
  }
});

test("Marketing e Growth OS não apontam mais para a mesma tela", async () => {
  const sidebar = await read("src/components/yzi-imob/yzi-imob-sidebar-v2.tsx");

  const marketing = sidebar.match(/label: "Marketing",[^}]*href: "([^"]+)"/);
  const growth = sidebar.match(/label: "Growth OS",[^}]*href: "([^"]+)"/);

  assert.ok(marketing, "item Marketing não encontrado na navegação");
  assert.ok(growth, "item Growth OS não encontrado na navegação");
  assert.notEqual(
    marketing[1],
    growth[1],
    "Marketing e Growth OS voltaram a ser dois nomes para a mesma superfície",
  );
});

test("Sistema é navegável e separado do Radar", async () => {
  const sidebar = await read("src/components/yzi-imob/yzi-imob-sidebar-v2.tsx");
  assert.ok(sidebar.includes('href: "/cockpit/yzi-imob/sistema"'));

  // Saúde operacional saiu do Radar: sinal acionável e funcionamento do sistema
  // respondem perguntas diferentes.
  const radar = await read("src/components/yzi-imob/yzi-imob-radar-workspace.tsx");
  assert.equal(radar.includes("operationalHealth"), false);
});

/* ------------------------------------------------------------------ */
/* Leituras do Growth OS — derivação pura sobre contratos existentes    */
/* ------------------------------------------------------------------ */

function resultsFixture(
  overrides: Partial<ResultsWorkspaceData> = {},
): ResultsWorkspaceData {
  return {
    tenantLabel: "Imobiliária Exemplo",
    period: {
      preset: "30d",
      start: "2026-06-30",
      end: "2026-07-30",
      label: "Últimos 30 dias",
    },
    filters: { period: "30d", propertyId: null, brokerUserId: null, channel: null, status: null },
    filterOptions: { properties: [], brokers: [], channels: [], statuses: [] },
    availability: "available",
    summary: { operation: [], service: [], commercial: [], content: [] },
    rates: [],
    leadSources: [],
    leadTemperatures: [],
    trend: [],
    sources: [],
    omittedBlocks: [],
    social: {
      availability: "available",
      configurationMessage: null,
      publicationCount: 0,
      publishedCount: 0,
      failedCount: 0,
      metrics: [],
      lastCollectedAt: null,
    },
    operationalHealth: {
      availability: "available",
      inboundFailed: 0,
      outboundFailed: 0,
      overdueFollowUps: 0,
      recoveryExecuted: 0,
      runnerLastExecutedAt: null,
      runnerStale: false,
    },
    bottlenecks: [],
    isEmpty: false,
    ...overrides,
  };
}

test("o panorama aponta o degrau do funil que mais perde gente", () => {
  const panorama = buildGrowthPanorama(
    resultsFixture({
      rates: [
        { id: "a", label: "Lead vira conversa", numerator: 80, denominator: 100, value: 80, sourceId: "s", formula: "" },
        { id: "b", label: "Conversa vira visita", numerator: 12, denominator: 80, value: 15, sourceId: "s", formula: "" },
      ],
    }),
  );

  assert.equal(panorama.weakestStep?.label, "Conversa vira visita");
  assert.equal(panorama.weakestStep?.lost, 68);
});

test("o panorama só declara direção quando existe histórico suficiente", () => {
  const semHistorico = buildGrowthPanorama(
    resultsFixture({ trend: [{ label: "S1", leads: 10, interests: 0, conversations: 0, appointments: 0 }] }),
  );
  assert.equal(semHistorico.direction, "sem-histórico");
  assert.equal(semHistorico.directionDelta, null);

  const caindo = buildGrowthPanorama(
    resultsFixture({
      trend: [
        { label: "S1", leads: 50, interests: 0, conversations: 0, appointments: 0 },
        { label: "S2", leads: 50, interests: 0, conversations: 0, appointments: 0 },
        { label: "S3", leads: 10, interests: 0, conversations: 0, appointments: 0 },
        { label: "S4", leads: 10, interests: 0, conversations: 0, appointments: 0 },
      ],
    }),
  );
  assert.equal(caindo.direction, "caindo");
});

test("sem dado real, o Growth OS não produz nenhuma recomendação", () => {
  const readings = buildGrowthReadings(resultsFixture(), []);
  assert.deepEqual(readings, []);
});

test("concentração de canal vira risco; canal saudável vira oportunidade", () => {
  const concentrado = buildGrowthReadings(
    resultsFixture({
      leadSources: [
        { id: "a", label: "Instagram", count: 90, percentage: 90 },
        { id: "b", label: "Site", count: 10, percentage: 10 },
      ],
    }),
    [],
  );
  const risco = concentrado.find((reading) => reading.id === "concentracao-canal");
  assert.ok(risco, "canal com 90% deveria virar risco de concentração");
  assert.equal(risco.tone, "risk");

  const distribuido = buildGrowthReadings(
    resultsFixture({
      leadSources: [
        { id: "a", label: "Instagram", count: 40, percentage: 40 },
        { id: "b", label: "Site", count: 60, percentage: 60 },
      ],
    }),
    [],
  );
  assert.ok(distribuido.some((reading) => reading.id === "concentracao-canal"));
});

test("toda recomendação do Growth OS tem evidência e destino de ação", () => {
  const readings = buildGrowthReadings(
    resultsFixture({
      rates: [
        { id: "a", label: "Conversa vira visita", numerator: 5, denominator: 60, value: 8.3, sourceId: "s", formula: "" },
      ],
      leadSources: [{ id: "a", label: "Instagram", count: 60, percentage: 100 }],
      bottlenecks: [
        {
          id: "leads-sem-acao",
          label: "Leads sem próxima ação",
          value: 7,
          availability: "available",
          sourceId: "s",
          detail: "Entraram e ninguém definiu o próximo passo.",
        },
      ],
    }),
    [],
  );

  assert.ok(readings.length > 0);
  for (const reading of readings) {
    assert.ok(reading.finding.length > 0, `${reading.id} sem achado`);
    assert.ok(reading.implication.length > 0, `${reading.id} sem implicação`);
    assert.ok(reading.actionHref.startsWith("/cockpit/yzi-imob/"), `${reading.id} sem destino`);
  }
});


/* ------------------------------------------------------------------ */
/* Verdade unica entre Radar, Sistema, Conexoes e Resultados            */
/* ------------------------------------------------------------------ */

function signalFixture(overrides: Partial<RadarSignal> = {}): RadarSignal {
  return {
    id: "s1",
    tenantId: "t1",
    type: "runner_stale",
    category: "atendimento",
    severity: "important",
    title: "Runner sem execução recente",
    description: "Nenhuma execução registrada nas últimas 6 horas.",
    entityType: "system",
    entityId: "inbound-runner",
    source: "yzi_imob_inbound_runner_executions",
    detectedAt: "2026-07-29T12:00:00.000Z",
    dueAt: null,
    status: "active",
    actionLabel: "Abrir atendimento",
    actionHref: "/cockpit/yzi-imob/atendimento",
    metadata: {},
    ...overrides,
  };
}

test("a tradução do Radar cobre todo tipo de sinal do contrato", async () => {
  // Se o contrato ganhar um tipo novo, este teste falha antes de o texto de
  // engenharia chegar à tela.
  const types = await readFile(
    new URL("../src/lib/yzi-imob/radar/types.ts", import.meta.url),
    "utf8",
  );
  const union = types.slice(
    types.indexOf("export type RadarSignalType"),
    types.indexOf(";", types.indexOf("export type RadarSignalType")),
  );
  const declared = [...union.matchAll(/"([a-z_]+)"/g)].map((match) => match[1]);

  assert.ok(declared.length > 20, "não foi possível ler os tipos de sinal");
  for (const type of declared) {
    assert.ok(
      RADAR_SIGNAL_COPY[type as RadarSignalType],
      `sinal "${type}" ainda não tem tradução para linguagem do gestor`,
    );
  }
});

test("nenhuma tradução de sinal reintroduz vocabulário interno", () => {
  const forbidden =
    /runner|metricool|assignment|not_configured|delivery_status|failure_code|token|job |pending|payload/i;

  for (const [type, copy] of Object.entries(RADAR_SIGNAL_COPY)) {
    assert.equal(
      forbidden.test(`${copy.title} ${copy.why}`),
      false,
      `a tradução de "${type}" ainda carrega vocabulário interno`,
    );
  }
});

test("o texto do contrato nunca substitui a tradução na tela", () => {
  const described = describeSignal(
    signalFixture({ title: "Runner sem execução recente" }),
  );
  assert.equal(described.title, "Atendimento automático sem atividade recente");
  assert.equal(/runner/i.test(described.description), false);

  // Estado cru interpolado pelo repositório não vaza.
  const whatsapp = describeSignal(
    signalFixture({
      type: "whatsapp_attention_required",
      category: "conexao",
      description: "A conexão registra estado not_configured.",
    }),
  );
  assert.equal(/not_configured/.test(whatsapp.description), false);
});

test("capacidade aguardando liberação não é tratada como falha", () => {
  assert.equal(
    isAwaitingRelease(signalFixture({ type: "metricool_configuration_required" })),
    true,
  );
  assert.equal(isAwaitingRelease(signalFixture({ type: "outbound_failed" })), false);

  const copy = describeSignal(
    signalFixture({ type: "metricool_configuration_required" }),
  );
  assert.equal(/parou|falh|quebr/i.test(`${copy.title} ${copy.description}`), false);
});

test("Radar e Sistema classificam o mesmo sinal na mesma área", () => {
  assert.equal(AREA_BY_CATEGORY.conexao, "canais");
  assert.equal(AREA_BY_CATEGORY.ativo, "imoveis");
  assert.equal(AREA_BY_CATEGORY.lead, "comercial");
  assert.equal(AREA_BY_CATEGORY.visita, "comercial");
  assert.equal(AREA_BY_CATEGORY.atendimento, "atendimento");
  assert.equal(AREA_BY_CATEGORY.sistema, "rotinas");
});

test("Sistema deriva o estado dos sinais, não só de a consulta ter respondido", async () => {
  const system = await read("src/components/yzi-imob/yzi-imob-system-workspace.tsx");

  // A contradição relatada nascia daqui: "Normal" saía de `sources[].availability`,
  // que é verdadeiro sempre que a query não falhou.
  assert.ok(
    system.includes("data.signals.filter"),
    "Sistema precisa ler os mesmos sinais que o Radar lista",
  );
  assert.ok(
    system.includes("isAwaitingRelease"),
    "Sistema precisa separar aguardando liberação de falha",
  );
});

test("Conexões separa verificação pendente de conexão quebrada", async () => {
  const connections = await read(
    "src/components/yzi-imob/yzi-imob-connections-workspace.tsx",
  );

  assert.ok(connections.includes("aguardandoVerificacaoExterna"));
  assert.ok(connections.includes("Aguardando verificação"));

  // "parou de funcionar" só pode ser dito sobre itens realmente quebrados.
  const brokenClause = connections.slice(
    connections.indexOf("function isBroken"),
    connections.indexOf("function isPreparing"),
  );
  assert.ok(
    brokenClause.includes("!item.aguardandoVerificacaoExterna"),
    "verificação externa pendente não pode contar como conexão quebrada",
  );
});

/* ------------------------------------------------------------------ */
/* Resultados — sem parede de zeros e sem descrição técnica             */
/* ------------------------------------------------------------------ */

function metricFixture(
  id: string,
  value: number | null,
  availability: ResultsMetricValue["availability"] = "available",
): ResultsMetricValue {
  return { id, label: id, value, availability, sourceId: "s", detail: "detalhe técnico" };
}

test("zero, ausência de leitura e movimento são coisas diferentes", () => {
  const { moved, idle, unavailable } = splitByMovement([
    metricFixture("period-leads", 12),
    metricFixture("period-visits", 0),
    metricFixture("period-feedback", null, "unavailable"),
  ]);

  assert.deepEqual(moved.map((metric) => metric.id), ["period-leads"]);
  assert.deepEqual(idle.map((metric) => metric.id), ["period-visits"]);
  assert.deepEqual(unavailable.map((metric) => metric.id), ["period-feedback"]);
});

test("nenhuma descrição de indicador usa vocabulário de banco", () => {
  const forbidden =
    /delivery_status|due_at|assignment|inbound|outbound|status |pending|closed|failed|approved|queued/i;

  for (const [id, copy] of Object.entries(RESULTS_METRIC_COPY)) {
    assert.equal(
      forbidden.test(`${copy.label} ${copy.detail}`),
      false,
      `a descrição de "${id}" ainda usa vocabulário de banco`,
    );
  }
});

test("Resultados nunca mostra a descrição técnica que vem do contrato", async () => {
  const results = await read("src/components/yzi-imob/yzi-imob-growth-resultados-v0.tsx");
  assert.equal(
    /\{metric\.detail\}/.test(results),
    false,
    "a descrição do contrato voltou para a tela",
  );
  assert.ok(results.includes("describeMetric"));
  assert.ok(results.includes("splitByMovement"));
});

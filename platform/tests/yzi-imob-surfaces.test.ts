import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildGrowthPanorama,
  buildGrowthReadings,
} from "../src/lib/yzi-imob/growth/readings.ts";
import type { ResultsWorkspaceData } from "../src/lib/yzi-imob/results/types.ts";

// Contratos de frontend das superfícies do YZI IMOB.
//
// Estes testes travam o que uma passagem de design pode acidentalmente
// desfazer: vocabulário técnico vazando para o gestor, superfícies voltando a
// inventar a própria gramática visual, e a redundância Marketing/Growth OS.
// Não são snapshots de pixel — são invariantes de produto.

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
    .map((literal) => literal.slice(1, -1))
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
    /\bwebhook/i,
    /\boauth\b/i,
    /\bendpoint/i,
    /stack trace/i,
    /\bpayload\b/i,
    /\bmock\b/i,
    /\btenant\b/i,
  ];

  for (const file of SURFACE_FILES) {
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

  for (const file of SURFACE_FILES) {
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

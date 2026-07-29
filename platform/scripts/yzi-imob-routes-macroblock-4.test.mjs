import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const redirects = new Map([
  ["src/app/cockpit/yzi-imob/marketing/page.tsx", "/cockpit/yzi-imob/marketing/publicacoes"],
  ["src/app/cockpit/yzi-imob/studio/page.tsx", "/cockpit/yzi-imob/marketing/publicacoes"],
  ["src/app/cockpit/yzi-imob/growth/briefing/page.tsx", "/cockpit/yzi-imob/marketing/publicacoes"],
  ["src/app/cockpit/yzi-imob/growth/conteudo/page.tsx", "/cockpit/yzi-imob/marketing/publicacoes"],
  ["src/app/cockpit/yzi-imob/growth/biblioteca/page.tsx", "/cockpit/yzi-imob/marketing/publicacoes"],
  ["src/app/cockpit/yzi-imob/growth/campanhas/page.tsx", "/cockpit/yzi-imob/marketing/publicacoes"],
  ["src/app/cockpit/yzi-imob/comunicacao/page.tsx", "/cockpit/yzi-imob/marketing/publicacoes"],
  ["src/app/cockpit/yzi-imob/runtime/page.tsx", "/cockpit/yzi-imob/radar"],
  ["src/app/cockpit/yzi-imob/briefing/page.tsx", "/cockpit/yzi-imob/radar"],
  ["src/app/cockpit/yzi-imob/catalogo/page.tsx", "/cockpit/yzi-imob/imoveis/catalogo"],
]);

test("out-of-MVP pages redirect to canonical product surfaces", () => {
  for (const [path, destination] of redirects) {
    const source = read(path);
    assert.match(source, /import \{ redirect \} from "next\/navigation"/);
    assert.ok(source.includes(`redirect("${destination}")`), `${path} -> ${destination}`);
    assert.doesNotMatch(source, /Workspace|StudioV0|Growth(Content|Library|Campanhas|Briefing)V0|RuntimePreview/);
  }
});

test("Growth navigation exposes only the real publication flow and Results", () => {
  const source = read("src/components/yzi-imob/growth/growth-navigation.tsx");
  const visibleTabs = source.slice(
    source.indexOf("export const GROWTH_SURFACES"),
    source.indexOf("export const GROWTH_ROUTE"),
  );
  assert.match(visibleTabs, /Marketing e publicações/);
  assert.match(visibleTabs, /Resultados/);
  assert.doesNotMatch(visibleTabs, /Conteúdo|Biblioteca|Campanhas/);
  assert.doesNotMatch(source, /growth\/(conteudo|biblioteca|campanhas)/);
});

test("official YZI IMOB sidebar groups and entries remain aligned", () => {
  const source = read("src/components/yzi-imob/yzi-imob-sidebar-v2.tsx");
  for (const group of ["Operação", "Marketing", "Inteligência", "Sistema"]) {
    assert.ok(source.includes(`eyebrow: "${group}"`));
  }
  for (const label of [
    "Imóveis",
    "Corretores",
    "Equipe",
    "Leads",
    "Atendimento",
    "Marketing",
    "Growth OS",
    "Agenda",
    "Resultados",
    "Radar",
    "Conexões",
    "APIs & Créditos",
    "Configurações",
  ]) {
    assert.ok(source.includes(`label: "${label}"`), label);
  }
  for (const removed of [
    'label: "Creative Engine"',
    'label: "Insights"',
    'label: "Site"',
    'label: "Runtime"',
  ]) {
    assert.ok(!source.includes(removed), removed);
  }
});

test("Marketing MVP and site governance remain accessible and no Insights route exists", () => {
  assert.equal(
    existsSync(new URL("src/app/cockpit/yzi-imob/marketing/publicacoes/page.tsx", root)),
    true,
  );
  assert.equal(existsSync(new URL("src/app/cockpit/yzi-imob/site/page.tsx", root)), true);
  assert.equal(existsSync(new URL("src/app/cockpit/yzi-imob/insights/page.tsx", root)), false);
});

test("Configurations keeps loading, save, permission, error, and tenant boundaries", () => {
  const page = read("src/app/cockpit/yzi-imob/configuracoes/page.tsx");
  const actions = read("src/app/cockpit/yzi-imob/configuracoes/actions.ts");
  const repository = read("src/lib/tenant/operational-settings.ts");

  assert.match(page, /getTenantContext/);
  assert.match(page, /tenantContext\.tenant\.id/);
  assert.match(page, /result\.status === "error"/);
  assert.match(page, /tenantContext\.role === "owner" \|\| tenantContext\.role === "admin"/);
  assert.match(actions, /saveOperationalSettingsAction/);
  assert.match(actions, /saved\.status === "forbidden"/);
  assert.match(actions, /revalidatePath\("\/cockpit\/yzi-imob\/configuracoes"\)/);
  assert.ok((repository.match(/\.eq\("tenant_id", tenantId\)/g) ?? []).length >= 6);
  assert.doesNotMatch(page + actions + repository, /service_role|SUPABASE_SERVICE/i);
});

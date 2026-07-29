import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("official operation routes are committed as real tenant surfaces", () => {
  for (const path of [
    "src/app/cockpit/yzi-imob/equipe/page.tsx",
    "src/app/cockpit/yzi-imob/imoveis/page.tsx",
    "src/app/cockpit/yzi-imob/imoveis/[id]/page.tsx",
    "src/app/cockpit/yzi-imob/imoveis/novo/page.tsx",
    "src/app/cockpit/yzi-imob/configuracoes/page.tsx",
  ]) {
    assert.equal(existsSync(new URL(path, root)), true, path);
  }

  const properties = read("src/app/cockpit/yzi-imob/imoveis/page.tsx");
  const team = read("src/app/cockpit/yzi-imob/equipe/page.tsx");
  const settings = read("src/app/cockpit/yzi-imob/configuracoes/page.tsx");
  assert.match(properties, /getTenantContext/);
  assert.match(properties, /listProperties/);
  assert.doesNotMatch(properties, /PropertiesHubV0|catalog-mock/);
  assert.match(team, /getTenantContext/);
  assert.match(team, /getTeamAccess/);
  assert.match(settings, /getTenantContext/);
  assert.match(settings, /getOperationalSettings/);
  assert.doesNotMatch(settings, /YziImobSettingsWorkspace|settings-mock/);
});

test("property, team, and settings writes retain authenticated tenant boundaries", () => {
  const propertyActions = [
    read("src/app/cockpit/yzi-imob/imoveis/[id]/actions.ts"),
    read("src/app/cockpit/yzi-imob/imoveis/novo/actions.ts"),
  ].join("\n");
  const propertyRepository = read("src/lib/yzi-imob/properties/repository.ts");
  const teamActions = read("src/app/cockpit/yzi-imob/equipe/actions.ts");
  const teamRepository = read("src/lib/tenant/team-access.ts");
  const settingsActions = read("src/app/cockpit/yzi-imob/configuracoes/actions.ts");
  const settingsRepository = read("src/lib/tenant/operational-settings.ts");
  const combined = [
    propertyActions,
    propertyRepository,
    teamActions,
    teamRepository,
    settingsActions,
    settingsRepository,
  ].join("\n");

  assert.match(propertyActions, /getTenantContext/);
  assert.ok((propertyRepository.match(/\.eq\("tenant_id", tenantId\)/g) ?? []).length >= 4);
  assert.match(teamRepository, /create_yzi_imob_team_invitation/);
  assert.match(teamRepository, /update_yzi_imob_team_member_role/);
  assert.match(teamRepository, /status: "forbidden"/);
  assert.match(settingsActions, /saveOperationalSettingsAction/);
  assert.ok((settingsRepository.match(/\.eq\("tenant_id", tenantId\)/g) ?? []).length >= 6);
  assert.doesNotMatch(combined, /service_role|SUPABASE_SERVICE_ROLE/i);
});

test("shell exposes only canonical MVP labels without campaign mock state", () => {
  const shell = read("src/components/yzi-imob/yzi-imob-shell-v2.tsx");
  assert.match(shell, /\/cockpit\/yzi-imob\/marketing/);
  assert.match(shell, /\/cockpit\/yzi-imob\/conexoes/);
  assert.doesNotMatch(shell, /GrowthCampaignStateProvider/);
  assert.doesNotMatch(shell, /Growth OS \/ (Briefing|Biblioteca|Conteúdo|Campanhas)/);
  assert.doesNotMatch(shell, /label: "(Criativos|Runtime|Briefing|Catálogo)"/);
});

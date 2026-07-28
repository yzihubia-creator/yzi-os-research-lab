import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function source(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const brokerPage = source("../src/app/cockpit/yzi-imob/corretores/page.tsx");
const brokerRoute = source("../src/app/cockpit/yzi-imob/corretores/[id]/page.tsx");
const brokerWorkspace = source("../src/components/yzi-imob/yzi-imob-broker-workspace.tsx");
const brokerRepository = source("../src/lib/yzi-imob/brokers/repository.ts");
const operationsRepository = source("../src/lib/yzi-imob/operations/repository.ts");
const leadRoute = source("../src/app/cockpit/yzi-imob/clientes/[id]/page.tsx");
const leadActions = source("../src/app/cockpit/yzi-imob/clientes/[id]/actions.ts");
const leadWorkspace = source("../src/components/yzi-imob/yzi-imob-client-workspace.tsx");
const agendaActions = source("../src/app/cockpit/yzi-imob/agenda/actions.ts");
const agendaPage = source("../src/app/cockpit/yzi-imob/agenda/page.tsx");
const agendaWorkspace = source("../src/components/yzi-imob/yzi-imob-agenda-workspace.tsx");
const databaseTypes = source("../src/lib/supabase/database.types.ts");

test("broker surfaces use tenant memberships and real operational contracts", () => {
  assert.match(brokerPage, /listBrokersForTenant/);
  assert.match(brokerRoute, /getBrokerWorkspace/);
  assert.match(brokerRepository, /list_yzi_imob_team_members/);
  assert.match(brokerRepository, /\.eq\("tenant_id", tenantId\)/);
  assert.match(brokerRepository, /listLeadAssignmentsForTenant/);
  assert.match(brokerRepository, /listAppointmentsMissingFeedback/);
  assert.match(brokerRepository, /getLeadOperationalPacket/);
  assert.doesNotMatch(brokerWorkspace, /DEMO_BROKERS|handoff-mock|entity-workspace-mock/);
  assert.doesNotMatch(brokerPage, /DEMO_BROKERS|array demo|Cadastrar corretor/);
});

test("broker directory exposes only supported operational counters", () => {
  for (const supported of [
    "activeLeadCount",
    "futureVisitCount",
    "pendingAssignmentCount",
    "missingFeedbackCount",
  ]) {
    assert.match(brokerRepository, new RegExp(supported));
  }
  assert.doesNotMatch(brokerPage, /comissao|ranking|meta|avaliacao|telefone|regiao|especialidade/i);
});

test("assignment response is constrained to the authenticated broker and pending state", () => {
  assert.match(
    operationsRepository,
    /respondToLeadAssignment\([\s\S]*actorUserId[\s\S]*\.eq\("broker_user_id", actorUserId\)[\s\S]*\.eq\("status", "assigned"\)/,
  );
  assert.match(
    source("../src/app/cockpit/yzi-imob/corretores/[id]/actions.ts"),
    /tenantContext\.userId !== brokerUserId/,
  );
  assert.match(leadActions, /\["owner", "admin", "operator"\]/);
  assert.match(leadActions, /listEligibleBrokersForTenant/);
  assert.match(operationsRepository, /member\.role !== "viewer"/);
  assert.match(operationsRepository, /member\.operational_availability === "available"/);
});

test("lead workspace connects assignment, operational packet, visits and follow-up", () => {
  assert.match(leadRoute, /getLeadOperationsWorkspace/);
  assert.match(leadWorkspace, /Reatribuir lead/);
  assert.match(leadWorkspace, /Pacote operacional/);
  assert.match(leadWorkspace, /Criar na Agenda/);
  assert.match(leadWorkspace, /Resolver/);
  assert.match(leadWorkspace, /Cancelar/);
  assert.match(leadActions, /source: "lead_workspace"/);
  assert.match(leadActions, /workspaceResult\.value\.followUps\.some/);
  assert.doesNotMatch(leadWorkspace, /task\.(payload|metadata)|raw_payload/i);
});

test("agenda feedback uses canonical appointment links and rejects incompatible states", () => {
  assert.match(agendaPage, /listAppointmentsMissingFeedback/);
  assert.match(agendaPage, /listVisitFeedbackForTenant/);
  assert.match(agendaActions, /getAppointmentById/);
  assert.match(agendaActions, /appointmentResult\.value\.status !== "completed"/);
  assert.match(agendaActions, /Visitas canceladas nao recebem feedback/);
  assert.match(agendaActions, /recordVisitFeedback/);
  assert.match(agendaWorkspace, /Feedback pendente/);
  assert.match(agendaWorkspace, /Ver lead/);
  assert.match(agendaWorkspace, /Abrir imovel/);
  assert.match(agendaWorkspace, /Ver corretor/);
  assert.match(agendaWorkspace, /Proxima acao/);
});

test("empty, error, not-found and permission states remain explicit", () => {
  assert.match(brokerPage, /Nenhuma membership operacional visivel/);
  assert.match(brokerRoute, /nao existe neste tenant ou nao esta visivel/);
  assert.match(brokerWorkspace, /Corretor nao encontrado/);
  assert.match(leadWorkspace, /Operacao indisponivel/);
  assert.match(leadWorkspace, /Seu papel nao permite/);
  assert.match(agendaWorkspace, /Feedback indisponivel para visita cancelada/);
  assert.match(source("../src/app/cockpit/yzi-imob/corretores/error.tsx"), /unstable_retry/);
  assert.match(source("../src/app/cockpit/yzi-imob/clientes/[id]/error.tsx"), /unstable_retry/);
  assert.match(source("../src/app/cockpit/yzi-imob/agenda/error.tsx"), /unstable_retry/);
});

test("generated database types include all final operational tables", () => {
  for (const table of [
    "yzi_imob_lead_assignments",
    "yzi_imob_follow_up_tasks",
    "yzi_imob_visit_feedback",
    "yzi_imob_appointments",
    "tenant_member_profiles",
  ]) {
    assert.match(databaseTypes, new RegExp(`${table}: \\{`));
  }
});

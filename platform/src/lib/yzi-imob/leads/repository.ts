import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  YziImobLead,
  YziImobLeadConversation,
  YziImobLeadInterest,
  YziImobLeadListItem,
  YziImobLeadWorkspaceData,
} from "./types";

const LEAD_COLUMNS = "id, full_name, phone, email, status, temperature, source, notes";
const INTEREST_COLUMNS = "lead_id, property_id, status, source, score";
const CONVERSATION_COLUMNS = "lead_id, channel, status, started_at, last_message_at";
const PROPERTY_COLUMNS = "id, title";
const DEFAULT_LEAD_LIMIT = 200;

type LeadRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  temperature: string | null;
  source: string | null;
  notes: string | null;
};

type InterestRow = {
  lead_id: string | null;
  property_id: string | null;
  status: string | null;
  source: string | null;
  score: number | string | null;
};

type ConversationRow = {
  lead_id: string | null;
  channel: string | null;
  status: string | null;
  started_at: string | null;
  last_message_at: string | null;
};

type PropertyRow = {
  id: string;
  title: string | null;
};

export type LeadRepositoryError = "not_found" | "list_failed" | "read_failed";

export type LeadRepositoryResult<T> =
  | { status: "ok"; value: T }
  | { status: "error"; code: LeadRepositoryError; detail?: string };

function mapLead(row: LeadRow): YziImobLead {
  return {
    id: row.id,
    fullName: row.full_name?.trim() || "Ainda sem dados",
    phone: row.phone?.trim() || null,
    email: row.email?.trim() || null,
    status: row.status?.trim() || null,
    temperature: row.temperature?.trim() || null,
    source: row.source?.trim() || null,
    notes: row.notes?.trim() || null,
  };
}

function toScore(value: number | string | null): number | null {
  if (value === null) return null;
  const score = Number(value);
  return Number.isFinite(score) ? score : null;
}

function mapInterest(
  row: InterestRow,
  propertyTitleById: ReadonlyMap<string, string>,
): YziImobLeadInterest | null {
  if (!row.lead_id || !row.property_id) return null;
  return {
    leadId: row.lead_id,
    propertyId: row.property_id,
    propertyTitle: propertyTitleById.get(row.property_id) ?? null,
    status: row.status?.trim() || null,
    source: row.source?.trim() || null,
    score: toScore(row.score),
  };
}

function mapConversation(row: ConversationRow): YziImobLeadConversation | null {
  if (!row.lead_id) return null;
  return {
    leadId: row.lead_id,
    channel: row.channel?.trim() || null,
    status: row.status?.trim() || null,
    startedAt: row.started_at ?? null,
    lastMessageAt: row.last_message_at ?? null,
  };
}

function latestInteraction(conversations: readonly YziImobLeadConversation[]): string | null {
  let latest: string | null = null;
  for (const conversation of conversations) {
    const candidate = conversation.lastMessageAt ?? conversation.startedAt;
    if (!candidate) continue;
    if (!latest || Date.parse(candidate) > Date.parse(latest)) latest = candidate;
  }
  return latest;
}

async function listPropertiesById(
  supabase: SupabaseClient,
  tenantId: string,
  propertyIds: readonly string[],
): Promise<LeadRepositoryResult<Map<string, string>>> {
  if (propertyIds.length === 0) return { status: "ok", value: new Map() };

  const { data, error } = await supabase
    .from("yzi_imob_properties")
    .select(PROPERTY_COLUMNS)
    .eq("tenant_id", tenantId)
    .in("id", propertyIds as string[]);

  if (error) return { status: "error", code: "read_failed", detail: error.message };

  return {
    status: "ok",
    value: new Map(
      ((data as PropertyRow[] | null) ?? []).map((row) => [
        row.id,
        row.title?.trim() || "Ainda sem dados",
      ]),
    ),
  };
}

export async function listLeads(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<LeadRepositoryResult<{ items: readonly YziImobLeadListItem[] }>> {
  const { data: leadRows, error: leadError } = await supabase
    .from("yzi_imob_leads")
    .select(LEAD_COLUMNS)
    .eq("tenant_id", tenantId)
    .order("full_name", { ascending: true })
    .order("id", { ascending: true })
    .limit(DEFAULT_LEAD_LIMIT);

  if (leadError) return { status: "error", code: "list_failed", detail: leadError.message };

  const leads = ((leadRows as LeadRow[] | null) ?? []).map(mapLead);
  const leadIds = leads.map((lead) => lead.id);
  if (leadIds.length === 0) return { status: "ok", value: { items: [] } };

  const [{ data: interestRows, error: interestError }, { data: conversationRows, error: conversationError }] =
    await Promise.all([
      supabase
        .from("yzi_imob_property_interests")
        .select(INTEREST_COLUMNS)
        .eq("tenant_id", tenantId)
        .in("lead_id", leadIds),
      supabase
        .from("yzi_imob_conversations")
        .select(CONVERSATION_COLUMNS)
        .eq("tenant_id", tenantId)
        .in("lead_id", leadIds),
    ]);

  if (interestError) return { status: "error", code: "list_failed", detail: interestError.message };
  if (conversationError) return { status: "error", code: "list_failed", detail: conversationError.message };

  const interestsByLead = new Map<string, YziImobLeadInterest[]>();
  for (const row of (interestRows as InterestRow[] | null) ?? []) {
    const interest = mapInterest(row, new Map());
    if (!interest) continue;
    const current = interestsByLead.get(interest.leadId) ?? [];
    current.push(interest);
    interestsByLead.set(interest.leadId, current);
  }

  const conversationsByLead = new Map<string, YziImobLeadConversation[]>();
  for (const row of (conversationRows as ConversationRow[] | null) ?? []) {
    const conversation = mapConversation(row);
    if (!conversation) continue;
    const current = conversationsByLead.get(conversation.leadId) ?? [];
    current.push(conversation);
    conversationsByLead.set(conversation.leadId, current);
  }

  return {
    status: "ok",
    value: {
      items: leads.map((lead) => {
        const interests = interestsByLead.get(lead.id) ?? [];
        const scores = interests
          .map((interest) => interest.score)
          .filter((score): score is number => score !== null);
        return {
          ...lead,
          interestCount: interests.length,
          maxInterestScore: scores.length ? Math.max(...scores) : null,
          lastInteractionAt: latestInteraction(conversationsByLead.get(lead.id) ?? []),
        };
      }),
    },
  };
}

export async function getLeadWorkspaceData(
  supabase: SupabaseClient,
  tenantId: string,
  leadId: string,
): Promise<LeadRepositoryResult<YziImobLeadWorkspaceData>> {
  const { data: leadRow, error: leadError } = await supabase
    .from("yzi_imob_leads")
    .select(LEAD_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("id", leadId)
    .maybeSingle();

  if (leadError) return { status: "error", code: "read_failed", detail: leadError.message };
  if (!leadRow) return { status: "error", code: "not_found" };

  const [{ data: interestRows, error: interestError }, { data: conversationRows, error: conversationError }] =
    await Promise.all([
      supabase
        .from("yzi_imob_property_interests")
        .select(INTEREST_COLUMNS)
        .eq("tenant_id", tenantId)
        .eq("lead_id", leadId)
        .order("score", { ascending: false, nullsFirst: false }),
      supabase
        .from("yzi_imob_conversations")
        .select(CONVERSATION_COLUMNS)
        .eq("tenant_id", tenantId)
        .eq("lead_id", leadId)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .order("started_at", { ascending: false }),
    ]);

  if (interestError) return { status: "error", code: "read_failed", detail: interestError.message };
  if (conversationError) return { status: "error", code: "read_failed", detail: conversationError.message };

  const rawInterests = (interestRows as InterestRow[] | null) ?? [];
  const propertyIds = Array.from(
    new Set(rawInterests.map((row) => row.property_id).filter((id): id is string => Boolean(id))),
  );
  const propertiesResult = await listPropertiesById(supabase, tenantId, propertyIds);
  if (propertiesResult.status === "error") return propertiesResult;

  return {
    status: "ok",
    value: {
      lead: mapLead(leadRow as LeadRow),
      interests: rawInterests
        .map((row) => mapInterest(row, propertiesResult.value))
        .filter((interest): interest is YziImobLeadInterest => Boolean(interest)),
      conversations: ((conversationRows as ConversationRow[] | null) ?? [])
        .map(mapConversation)
        .filter((conversation): conversation is YziImobLeadConversation => Boolean(conversation)),
    },
  };
}

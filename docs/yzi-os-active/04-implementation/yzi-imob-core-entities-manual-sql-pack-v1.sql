-- YZI IMOB - Core Entities Foundation - Manual SQL Pack v1
-- Unit: minimum real-data foundation for PREPARE_PROPERTY_CONTACT context.
-- Project ref confirmed by operator: thwsltjcjrvtidhnfukc.
--
-- Execution statement:
--   This pack is intentionally small and vertical. It creates only the six
--   authorized YZI IMOB tables needed to bind the generic run runtime to real
--   property, lead, interest, conversation, and message records.
--
-- Explicit non-goals:
--   - No changes to public.yzi_runs.
--   - No brokers/corretores, campaigns, visits, proposals, contracts, media,
--     content, WhatsApp integrations, automations, or external execution.
--   - No seed data. Validation data must run inside a transaction and roll back.
--
-- Architecture decision:
--   public.yzi_runs remains generic. The vertical context lives in
--   public.yzi_imob_run_contexts, with a 1:1 binding to yzi_runs.
--   Future run creation should keep active_asset_type = 'property' and set
--   active_asset_id = property_id::text.

-- ============================================================================
-- PART 0 - Preflight catalog checks
-- ============================================================================
-- Expected helpers from the existing YZI OS foundation:
--   - public.tenants
--   - public.tenant_memberships
--   - public.yzi_runs with unique (id, tenant_id)
--   - public.yzi_set_updated_at()

select to_regclass('public.tenants') as tenants_table;
select to_regclass('public.tenant_memberships') as tenant_memberships_table;
select to_regclass('public.yzi_runs') as yzi_runs_table;
select p.proname
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'yzi_set_updated_at';

-- ============================================================================
-- PART 1 - Tables
-- ============================================================================

create table if not exists public.yzi_imob_properties (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  reference_code text null,
  title text not null,
  property_type text null,
  transaction_type text null,
  status text not null,
  city text null,
  neighborhood text null,
  price numeric null,
  description text null,
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_properties_title_not_empty_check
    check (length(btrim(title)) > 0),
  constraint yzi_imob_properties_status_not_empty_check
    check (length(btrim(status)) > 0),
  constraint yzi_imob_properties_price_nonnegative_check
    check (price is null or price >= 0),
  constraint yzi_imob_properties_id_tenant_unique unique (id, tenant_id)
);

comment on table public.yzi_imob_properties is
  'YZI IMOB minimum real property authority. Tenant-scoped. Not a full catalog in this unit.';
comment on column public.yzi_imob_properties.attributes is
  'Bounded operational attributes. Must not contain secrets or external credentials.';

create table if not exists public.yzi_imob_leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  full_name text not null,
  phone text null,
  email text null,
  status text not null,
  temperature text null,
  source text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_leads_full_name_not_empty_check
    check (length(btrim(full_name)) > 0),
  constraint yzi_imob_leads_status_not_empty_check
    check (length(btrim(status)) > 0),
  constraint yzi_imob_leads_id_tenant_unique unique (id, tenant_id)
);

comment on table public.yzi_imob_leads is
  'YZI IMOB minimum real lead/customer authority. Tenant-scoped.';

create table if not exists public.yzi_imob_property_interests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  property_id uuid not null,
  lead_id uuid not null,
  status text not null,
  source text null,
  score integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_property_interests_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties(id, tenant_id)
    on delete restrict,
  constraint yzi_imob_property_interests_lead_tenant_fkey
    foreign key (lead_id, tenant_id)
    references public.yzi_imob_leads(id, tenant_id)
    on delete restrict,
  constraint yzi_imob_property_interests_status_not_empty_check
    check (length(btrim(status)) > 0),
  constraint yzi_imob_property_interests_score_range_check
    check (score is null or (score >= 0 and score <= 100)),
  constraint yzi_imob_property_interests_id_tenant_unique unique (id, tenant_id)
);

comment on table public.yzi_imob_property_interests is
  'Real tenant-scoped link between a lead and a property. No uniqueness constraint on (tenant_id, property_id, lead_id) yet, to avoid blocking future interest history.';

create table if not exists public.yzi_imob_conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  lead_id uuid not null,
  channel text not null,
  status text not null,
  started_at timestamptz not null default now(),
  last_message_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_conversations_lead_tenant_fkey
    foreign key (lead_id, tenant_id)
    references public.yzi_imob_leads(id, tenant_id)
    on delete restrict,
  constraint yzi_imob_conversations_channel_not_empty_check
    check (length(btrim(channel)) > 0),
  constraint yzi_imob_conversations_status_not_empty_check
    check (length(btrim(status)) > 0),
  constraint yzi_imob_conversations_id_tenant_unique unique (id, tenant_id),
  constraint yzi_imob_conversations_id_lead_tenant_unique unique (id, lead_id, tenant_id)
);

comment on table public.yzi_imob_conversations is
  'Minimum YZI IMOB conversation record for a lead. No WhatsApp or external integration in this unit.';

create table if not exists public.yzi_imob_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  conversation_id uuid not null,
  direction text not null,
  sender_type text not null,
  body text not null,
  external_message_id text null,
  created_at timestamptz not null default now(),
  constraint yzi_imob_messages_conversation_tenant_fkey
    foreign key (conversation_id, tenant_id)
    references public.yzi_imob_conversations(id, tenant_id)
    on delete restrict,
  constraint yzi_imob_messages_direction_not_empty_check
    check (length(btrim(direction)) > 0),
  constraint yzi_imob_messages_sender_type_not_empty_check
    check (length(btrim(sender_type)) > 0),
  constraint yzi_imob_messages_body_not_empty_check
    check (length(btrim(body)) > 0),
  constraint yzi_imob_messages_id_tenant_unique unique (id, tenant_id)
);

comment on table public.yzi_imob_messages is
  'Minimum tenant-scoped message record. No embeddings, media, or delivery tracking in this unit.';

create table if not exists public.yzi_imob_run_contexts (
  run_id uuid primary key,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  property_id uuid not null,
  lead_id uuid not null,
  conversation_id uuid null,
  created_at timestamptz not null default now(),
  constraint yzi_imob_run_contexts_run_tenant_fkey
    foreign key (run_id, tenant_id)
    references public.yzi_runs(id, tenant_id)
    on delete restrict,
  constraint yzi_imob_run_contexts_property_tenant_fkey
    foreign key (property_id, tenant_id)
    references public.yzi_imob_properties(id, tenant_id)
    on delete restrict,
  constraint yzi_imob_run_contexts_lead_tenant_fkey
    foreign key (lead_id, tenant_id)
    references public.yzi_imob_leads(id, tenant_id)
    on delete restrict,
  constraint yzi_imob_run_contexts_conversation_lead_tenant_fkey
    foreign key (conversation_id, lead_id, tenant_id)
    references public.yzi_imob_conversations(id, lead_id, tenant_id)
    on delete restrict
);

comment on table public.yzi_imob_run_contexts is
  'YZI IMOB vertical context for generic yzi_runs. 1:1 with yzi_runs; does not add IMOB-specific columns to the generic runtime.';

-- ============================================================================
-- PART 2 - Indexes
-- ============================================================================

create index if not exists yzi_imob_properties_tenant_status_idx
  on public.yzi_imob_properties (tenant_id, status);
create index if not exists yzi_imob_properties_tenant_reference_code_idx
  on public.yzi_imob_properties (tenant_id, reference_code)
  where reference_code is not null;

create index if not exists yzi_imob_leads_tenant_status_idx
  on public.yzi_imob_leads (tenant_id, status);
create index if not exists yzi_imob_leads_tenant_phone_idx
  on public.yzi_imob_leads (tenant_id, phone)
  where phone is not null;
create index if not exists yzi_imob_leads_tenant_email_idx
  on public.yzi_imob_leads (tenant_id, email)
  where email is not null;

create index if not exists yzi_imob_property_interests_tenant_property_lead_idx
  on public.yzi_imob_property_interests (tenant_id, property_id, lead_id);
create index if not exists yzi_imob_property_interests_tenant_lead_idx
  on public.yzi_imob_property_interests (tenant_id, lead_id);

create index if not exists yzi_imob_conversations_tenant_lead_idx
  on public.yzi_imob_conversations (tenant_id, lead_id);
create index if not exists yzi_imob_conversations_tenant_status_idx
  on public.yzi_imob_conversations (tenant_id, status);

create index if not exists yzi_imob_messages_tenant_conversation_created_idx
  on public.yzi_imob_messages (tenant_id, conversation_id, created_at);

create index if not exists yzi_imob_run_contexts_tenant_property_lead_idx
  on public.yzi_imob_run_contexts (tenant_id, property_id, lead_id);
create index if not exists yzi_imob_run_contexts_tenant_conversation_idx
  on public.yzi_imob_run_contexts (tenant_id, conversation_id)
  where conversation_id is not null;

-- ============================================================================
-- PART 3 - updated_at triggers
-- ============================================================================

drop trigger if exists yzi_imob_properties_set_updated_at on public.yzi_imob_properties;
create trigger yzi_imob_properties_set_updated_at
before update on public.yzi_imob_properties
for each row execute function public.yzi_set_updated_at();

drop trigger if exists yzi_imob_leads_set_updated_at on public.yzi_imob_leads;
create trigger yzi_imob_leads_set_updated_at
before update on public.yzi_imob_leads
for each row execute function public.yzi_set_updated_at();

drop trigger if exists yzi_imob_property_interests_set_updated_at on public.yzi_imob_property_interests;
create trigger yzi_imob_property_interests_set_updated_at
before update on public.yzi_imob_property_interests
for each row execute function public.yzi_set_updated_at();

drop trigger if exists yzi_imob_conversations_set_updated_at on public.yzi_imob_conversations;
create trigger yzi_imob_conversations_set_updated_at
before update on public.yzi_imob_conversations
for each row execute function public.yzi_set_updated_at();

-- ============================================================================
-- PART 4 - Tenant consistency beyond plain FKs
-- ============================================================================
-- Composite FKs enforce same-tenant relationships for property/lead,
-- conversation/lead, message/conversation, and run_context/run. This trigger
-- handles the two vertical rules that need cross-table lookup:
--   1. yzi_runs.active_asset_type must remain 'property'.
--   2. yzi_runs.active_asset_id must equal property_id::text.
--   3. The lead-property interest must exist for the same tenant.

create or replace function public.yzi_imob_validate_run_context()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_active_asset_type text;
  v_active_asset_id text;
begin
  select r.active_asset_type, r.active_asset_id
    into v_active_asset_type, v_active_asset_id
  from public.yzi_runs r
  where r.id = new.run_id
    and r.tenant_id = new.tenant_id;

  if v_active_asset_type is null then
    raise exception 'YZI_IMOB_RUN_CONTEXT_RUN_NOT_FOUND';
  end if;

  if v_active_asset_type <> 'property' then
    raise exception 'YZI_IMOB_RUN_CONTEXT_ACTIVE_ASSET_TYPE_INVALID';
  end if;

  if v_active_asset_id is distinct from new.property_id::text then
    raise exception 'YZI_IMOB_RUN_CONTEXT_ACTIVE_ASSET_ID_MISMATCH';
  end if;

  if not exists (
    select 1
    from public.yzi_imob_property_interests i
    where i.tenant_id = new.tenant_id
      and i.property_id = new.property_id
      and i.lead_id = new.lead_id
  ) then
    raise exception 'YZI_IMOB_RUN_CONTEXT_INTEREST_NOT_FOUND';
  end if;

  return new;
end;
$$;

drop trigger if exists yzi_imob_run_contexts_validate_tenant_consistency
  on public.yzi_imob_run_contexts;
create trigger yzi_imob_run_contexts_validate_tenant_consistency
before insert or update on public.yzi_imob_run_contexts
for each row execute function public.yzi_imob_validate_run_context();

-- ============================================================================
-- PART 5 - RLS and privileges
-- ============================================================================

alter table public.yzi_imob_properties enable row level security;
alter table public.yzi_imob_leads enable row level security;
alter table public.yzi_imob_property_interests enable row level security;
alter table public.yzi_imob_conversations enable row level security;
alter table public.yzi_imob_messages enable row level security;
alter table public.yzi_imob_run_contexts enable row level security;

grant select, insert, update, delete on table
  public.yzi_imob_properties,
  public.yzi_imob_leads,
  public.yzi_imob_property_interests,
  public.yzi_imob_conversations,
  public.yzi_imob_messages,
  public.yzi_imob_run_contexts
to authenticated;

-- yzi_imob_properties
drop policy if exists yzi_imob_properties_select_tenant_member on public.yzi_imob_properties;
create policy yzi_imob_properties_select_tenant_member
on public.yzi_imob_properties for select to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_properties.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_properties_insert_tenant_member on public.yzi_imob_properties;
create policy yzi_imob_properties_insert_tenant_member
on public.yzi_imob_properties for insert to authenticated
with check (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_properties.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_properties_update_tenant_member on public.yzi_imob_properties;
create policy yzi_imob_properties_update_tenant_member
on public.yzi_imob_properties for update to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_properties.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
))
with check (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_properties.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_properties_delete_tenant_member on public.yzi_imob_properties;
create policy yzi_imob_properties_delete_tenant_member
on public.yzi_imob_properties for delete to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_properties.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

-- yzi_imob_leads
drop policy if exists yzi_imob_leads_select_tenant_member on public.yzi_imob_leads;
create policy yzi_imob_leads_select_tenant_member
on public.yzi_imob_leads for select to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_leads.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_leads_insert_tenant_member on public.yzi_imob_leads;
create policy yzi_imob_leads_insert_tenant_member
on public.yzi_imob_leads for insert to authenticated
with check (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_leads.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_leads_update_tenant_member on public.yzi_imob_leads;
create policy yzi_imob_leads_update_tenant_member
on public.yzi_imob_leads for update to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_leads.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
))
with check (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_leads.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_leads_delete_tenant_member on public.yzi_imob_leads;
create policy yzi_imob_leads_delete_tenant_member
on public.yzi_imob_leads for delete to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_leads.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

-- yzi_imob_property_interests
drop policy if exists yzi_imob_property_interests_select_tenant_member on public.yzi_imob_property_interests;
create policy yzi_imob_property_interests_select_tenant_member
on public.yzi_imob_property_interests for select to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_property_interests.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_property_interests_insert_tenant_member on public.yzi_imob_property_interests;
create policy yzi_imob_property_interests_insert_tenant_member
on public.yzi_imob_property_interests for insert to authenticated
with check (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_property_interests.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_property_interests_update_tenant_member on public.yzi_imob_property_interests;
create policy yzi_imob_property_interests_update_tenant_member
on public.yzi_imob_property_interests for update to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_property_interests.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
))
with check (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_property_interests.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_property_interests_delete_tenant_member on public.yzi_imob_property_interests;
create policy yzi_imob_property_interests_delete_tenant_member
on public.yzi_imob_property_interests for delete to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_property_interests.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

-- yzi_imob_conversations
drop policy if exists yzi_imob_conversations_select_tenant_member on public.yzi_imob_conversations;
create policy yzi_imob_conversations_select_tenant_member
on public.yzi_imob_conversations for select to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_conversations.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_conversations_insert_tenant_member on public.yzi_imob_conversations;
create policy yzi_imob_conversations_insert_tenant_member
on public.yzi_imob_conversations for insert to authenticated
with check (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_conversations.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_conversations_update_tenant_member on public.yzi_imob_conversations;
create policy yzi_imob_conversations_update_tenant_member
on public.yzi_imob_conversations for update to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_conversations.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
))
with check (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_conversations.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_conversations_delete_tenant_member on public.yzi_imob_conversations;
create policy yzi_imob_conversations_delete_tenant_member
on public.yzi_imob_conversations for delete to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_conversations.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

-- yzi_imob_messages
drop policy if exists yzi_imob_messages_select_tenant_member on public.yzi_imob_messages;
create policy yzi_imob_messages_select_tenant_member
on public.yzi_imob_messages for select to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_messages.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_messages_insert_tenant_member on public.yzi_imob_messages;
create policy yzi_imob_messages_insert_tenant_member
on public.yzi_imob_messages for insert to authenticated
with check (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_messages.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_messages_update_tenant_member on public.yzi_imob_messages;
create policy yzi_imob_messages_update_tenant_member
on public.yzi_imob_messages for update to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_messages.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
))
with check (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_messages.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_messages_delete_tenant_member on public.yzi_imob_messages;
create policy yzi_imob_messages_delete_tenant_member
on public.yzi_imob_messages for delete to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_messages.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

-- yzi_imob_run_contexts
drop policy if exists yzi_imob_run_contexts_select_tenant_member on public.yzi_imob_run_contexts;
create policy yzi_imob_run_contexts_select_tenant_member
on public.yzi_imob_run_contexts for select to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_run_contexts.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_run_contexts_insert_tenant_member on public.yzi_imob_run_contexts;
create policy yzi_imob_run_contexts_insert_tenant_member
on public.yzi_imob_run_contexts for insert to authenticated
with check (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_run_contexts.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_run_contexts_update_tenant_member on public.yzi_imob_run_contexts;
create policy yzi_imob_run_contexts_update_tenant_member
on public.yzi_imob_run_contexts for update to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_run_contexts.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
))
with check (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_run_contexts.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

drop policy if exists yzi_imob_run_contexts_delete_tenant_member on public.yzi_imob_run_contexts;
create policy yzi_imob_run_contexts_delete_tenant_member
on public.yzi_imob_run_contexts for delete to authenticated
using (exists (
  select 1 from public.tenant_memberships tm
  where tm.tenant_id = yzi_imob_run_contexts.tenant_id
    and tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

-- ============================================================================
-- PART 5.1 - Least-privilege hardening (post-audit)
-- ============================================================================
-- audit finding: anon inherited table grants from schema defaults, not from
-- this pack (which only grants to authenticated). RLS policies already
-- restrict all access to `authenticated`, so this was not exploitable, but
-- grants must match the pack's declared authority.

revoke all on table
  public.yzi_imob_properties,
  public.yzi_imob_leads,
  public.yzi_imob_property_interests,
  public.yzi_imob_conversations,
  public.yzi_imob_messages,
  public.yzi_imob_run_contexts
from anon;

-- audit finding: EXECUTE on the internal trigger functions was open to
-- PUBLIC/anon by default grant. Trigger functions cannot be invoked directly
-- outside trigger context, so this was not exploitable, but EXECUTE should
-- not be broader than the trigger mechanism requires.

revoke execute on function public.yzi_imob_validate_run_context()
from public, anon;

revoke execute on function public.yzi_set_updated_at()
from public, anon;

-- audit finding (second pass): authenticated only needs row-level DML.
-- TRUNCATE bypasses RLS policies entirely; REFERENCES and TRIGGER are
-- schema-shaping privileges the application role must not hold.

revoke truncate, references, trigger on table
  public.yzi_imob_properties,
  public.yzi_imob_leads,
  public.yzi_imob_property_interests,
  public.yzi_imob_conversations,
  public.yzi_imob_messages,
  public.yzi_imob_run_contexts
from authenticated;

-- Trigger functions are invoked by the trigger mechanism as the table owner
-- path, not via the caller's EXECUTE privilege; the application role does not
-- need direct EXECUTE.

revoke execute on function public.yzi_imob_validate_run_context()
from authenticated;

revoke execute on function public.yzi_set_updated_at()
from authenticated;

-- ============================================================================
-- PART 6 - Validation queries
-- ============================================================================

-- 6.1 Six tables exist.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'yzi_imob_properties',
    'yzi_imob_leads',
    'yzi_imob_property_interests',
    'yzi_imob_conversations',
    'yzi_imob_messages',
    'yzi_imob_run_contexts'
  )
order by table_name;

-- 6.2 PKs/FKs/unique constraints.
select tc.table_name, tc.constraint_name, tc.constraint_type
from information_schema.table_constraints tc
where tc.table_schema = 'public'
  and tc.table_name like 'yzi_imob_%'
  and tc.constraint_type in ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
order by tc.table_name, tc.constraint_type, tc.constraint_name;

-- 6.3 RLS enabled.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname like 'yzi_imob_%'
  and c.relkind = 'r'
order by c.relname;

-- 6.4 Policies created.
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename like 'yzi_imob_%'
order by tablename, policyname;

-- 6.5 Transactional behavior test template.
-- Run this as a controlled validation block only. It creates temporary rows and
-- rolls them all back. Expected final persisted delta: zero rows.
/*
begin;

-- Operator may replace UUIDs if collision ever occurs.
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111111', 'yzi-imob-test-a@example.invalid', '', now(), now(), now()),
  ('22222222-2222-4222-8222-222222222222', 'yzi-imob-test-b@example.invalid', '', now(), now(), now());

insert into public.tenants (id, name, slug, status)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'YZI IMOB Test Tenant A', 'yzi-imob-test-a', 'active'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'YZI IMOB Test Tenant B', 'yzi-imob-test-b', 'active');

insert into public.tenant_memberships (tenant_id, user_id, role, status)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'owner', 'active'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'owner', 'active');

insert into public.yzi_runs (
  id, tenant_id, initiated_by, workflow_id, intent_type,
  active_asset_type, active_asset_id, context_fingerprint, status, cursor_step
)
values
  (
    '99999999-9999-4999-8999-999999999991',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'PREPARE_PROPERTY_CONTACT',
    'property_contact_prepare',
    'property',
    '33333333-3333-4333-8333-333333333331',
    'fp:test:yzi-imob-core-entities:a',
    'running',
    'prepare_contact_followup'
  ),
  (
    '99999999-9999-4999-8999-999999999992',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'PREPARE_PROPERTY_CONTACT',
    'property_contact_prepare',
    'property',
    '33333333-3333-4333-8333-333333333332',
    'fp:test:yzi-imob-core-entities:b',
    'running',
    'prepare_contact_followup'
  );

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
set local role authenticated;

do $$
declare
  v_seen integer;
begin
  insert into public.yzi_imob_properties (id, tenant_id, title, status)
  values ('33333333-3333-4333-8333-333333333331', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Test Property A', 'draft');

  insert into public.yzi_imob_leads (id, tenant_id, full_name, status)
  values ('44444444-4444-4444-8444-444444444441', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Test Lead A', 'new');

  insert into public.yzi_imob_property_interests (id, tenant_id, property_id, lead_id, status, score)
  values (
    '55555555-5555-4555-8555-555555555551',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '33333333-3333-4333-8333-333333333331',
    '44444444-4444-4444-8444-444444444441',
    'active',
    50
  );

  insert into public.yzi_imob_conversations (id, tenant_id, lead_id, channel, status)
  values (
    '66666666-6666-4666-8666-666666666661',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '44444444-4444-4444-8444-444444444441',
    'internal',
    'open'
  );

  insert into public.yzi_imob_messages (id, tenant_id, conversation_id, direction, sender_type, body)
  values (
    '77777777-7777-4777-8777-777777777771',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '66666666-6666-4666-8666-666666666661',
    'inbound',
    'lead',
    'Test message'
  );

  insert into public.yzi_imob_run_contexts (
    run_id, tenant_id, property_id, lead_id, conversation_id
  )
  values (
    '99999999-9999-4999-8999-999999999991',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '33333333-3333-4333-8333-333333333331',
    '44444444-4444-4444-8444-444444444441',
    null
  );

  select count(*) into v_seen
  from public.yzi_imob_properties
  where tenant_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  if v_seen <> 1 then
    raise exception 'VALIDATION_READ_WITHIN_TENANT_FAILED';
  end if;

  begin
    insert into public.yzi_imob_properties (id, tenant_id, title, status)
    values ('33333333-3333-4333-8333-333333333332', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Cross Tenant Property', 'draft');
    raise exception 'VALIDATION_CROSS_TENANT_INSERT_NOT_BLOCKED';
  exception when insufficient_privilege or check_violation or foreign_key_violation then
    null;
  end;

  begin
    insert into public.yzi_imob_property_interests (tenant_id, property_id, lead_id, status)
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '33333333-3333-4333-8333-333333333331',
      '44444444-4444-4444-8444-444444444442',
      'active'
    );
    raise exception 'VALIDATION_INTEREST_DIVERGENT_TENANT_NOT_BLOCKED';
  exception when foreign_key_violation then
    null;
  end;

  begin
    insert into public.yzi_imob_conversations (tenant_id, lead_id, channel, status)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '44444444-4444-4444-8444-444444444442', 'internal', 'open');
    raise exception 'VALIDATION_CONVERSATION_DIVERGENT_LEAD_NOT_BLOCKED';
  exception when foreign_key_violation then
    null;
  end;

  begin
    insert into public.yzi_imob_messages (tenant_id, conversation_id, direction, sender_type, body)
    values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '66666666-6666-4666-8666-666666666661', 'inbound', 'lead', 'bad');
    raise exception 'VALIDATION_MESSAGE_DIVERGENT_CONVERSATION_NOT_BLOCKED';
  exception when insufficient_privilege or foreign_key_violation then
    null;
  end;

  begin
    insert into public.yzi_imob_run_contexts (
      run_id, tenant_id, property_id, lead_id, conversation_id
    )
    values (
      '99999999-9999-4999-8999-999999999992',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '33333333-3333-4333-8333-333333333331',
      '44444444-4444-4444-8444-444444444441',
      null
    );
    raise exception 'VALIDATION_RUN_CONTEXT_DIVERGENT_RUN_NOT_BLOCKED';
  exception when foreign_key_violation or raise_exception then
    null;
  end;

  begin
    delete from public.yzi_imob_properties
    where id = '33333333-3333-4333-8333-333333333331';
    raise exception 'VALIDATION_DELETE_RESTRICT_NOT_BLOCKED';
  exception when foreign_key_violation then
    null;
  end;
end $$;

rollback;

select
  'rolled_back' as validation_state,
  (select count(*) from public.yzi_imob_properties where id = '33333333-3333-4333-8333-333333333331') as remaining_properties,
  (select count(*) from public.yzi_imob_run_contexts where run_id = '99999999-9999-4999-8999-999999999991') as remaining_run_contexts,
  (select count(*) from public.yzi_runs where id in ('99999999-9999-4999-8999-999999999991','99999999-9999-4999-8999-999999999992')) as remaining_test_runs;
*/

-- ============================================================================
-- PART 7 - Rollback (safe, dependency ordered; run only if reverting)
-- ============================================================================
/*
drop trigger if exists yzi_imob_run_contexts_validate_tenant_consistency
  on public.yzi_imob_run_contexts;
drop function if exists public.yzi_imob_validate_run_context();

drop trigger if exists yzi_imob_conversations_set_updated_at on public.yzi_imob_conversations;
drop trigger if exists yzi_imob_property_interests_set_updated_at on public.yzi_imob_property_interests;
drop trigger if exists yzi_imob_leads_set_updated_at on public.yzi_imob_leads;
drop trigger if exists yzi_imob_properties_set_updated_at on public.yzi_imob_properties;

drop table if exists public.yzi_imob_run_contexts;
drop table if exists public.yzi_imob_messages;
drop table if exists public.yzi_imob_conversations;
drop table if exists public.yzi_imob_property_interests;
drop table if exists public.yzi_imob_leads;
drop table if exists public.yzi_imob_properties;
*/

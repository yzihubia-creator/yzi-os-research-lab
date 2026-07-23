begin;

grant select on table public.provider_webhook_events to authenticated;
grant select on table public.yzi_imob_inbound_operation_requests to authenticated;

create policy provider_webhook_events_select_member
  on public.provider_webhook_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = provider_webhook_events.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create policy yzi_imob_inbound_operation_requests_select_member
  on public.yzi_imob_inbound_operation_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_inbound_operation_requests.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create table if not exists public.yzi_imob_inbound_runner_executions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null references public.tenants (id) on delete set null,
  request_id uuid null references public.yzi_imob_inbound_operation_requests (id) on delete set null,
  outcome_status text not null,
  failure_code text null,
  intent_key text null,
  workflow_key text null,
  created_at timestamptz not null default now(),
  constraint yzi_imob_inbound_runner_executions_outcome_status_check
    check (outcome_status = any (array['idle', 'ready', 'failed', 'configuration_missing', 'error']::text[])),
  constraint yzi_imob_inbound_runner_executions_failure_code_check
    check (
      failure_code is null
      or failure_code = any (array[
        'message_not_found', 'conversation_not_found', 'identity_mismatch',
        'invalid_message_contract', 'intent_classification_failed',
        'workflow_selection_failed', 'outbound_dispatch_failed',
        'completion_failed'
      ]::text[])
    )
);

create index if not exists yzi_imob_inbound_runner_executions_tenant_created_idx
  on public.yzi_imob_inbound_runner_executions (tenant_id, created_at desc);

alter table public.yzi_imob_inbound_runner_executions enable row level security;

create policy yzi_imob_inbound_runner_executions_select_member
  on public.yzi_imob_inbound_runner_executions
  for select
  to authenticated
  using (
    tenant_id is not null
    and exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_inbound_runner_executions.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create or replace function yzi_imob_inbound_operations_private.record_inbound_runner_execution(
  p_request_id uuid default null,
  p_outcome_status text default 'idle',
  p_failure_code text default null,
  p_intent_key text default null,
  p_workflow_key text default null
)
returns table (
  execution_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_tenant_id uuid;
begin
  if session_user <> 'yzi_imob_inbound_operations_runtime' then
    raise exception using errcode = '42501', message = 'inbound_operations_runtime_required';
  end if;

  if p_outcome_status is null
    or p_outcome_status <> all (array['idle', 'ready', 'failed', 'configuration_missing', 'error']::text[])
  then
    raise exception using errcode = '22023', message = 'invalid_outcome_status';
  end if;

  if p_request_id is not null then
    select r.tenant_id
    into v_tenant_id
    from public.yzi_imob_inbound_operation_requests r
    where r.id = p_request_id;

    if not found then
      raise exception using errcode = '22023', message = 'invalid_request_id';
    end if;
  end if;

  insert into public.yzi_imob_inbound_runner_executions (
    tenant_id,
    request_id,
    outcome_status,
    failure_code,
    intent_key,
    workflow_key
  ) values (
    v_tenant_id,
    p_request_id,
    p_outcome_status,
    p_failure_code,
    p_intent_key,
    p_workflow_key
  )
  returning id, public.yzi_imob_inbound_runner_executions.created_at
  into execution_id, created_at;

  return next;
end;
$$;

alter function yzi_imob_inbound_operations_private.record_inbound_runner_execution(uuid, text, text, text, text)
  owner to postgres;

revoke all on function yzi_imob_inbound_operations_private.record_inbound_runner_execution(uuid, text, text, text, text)
from public, anon, authenticated, service_role, yzi_meta_whatsapp_runtime;

grant execute on function yzi_imob_inbound_operations_private.record_inbound_runner_execution(uuid, text, text, text, text)
  to yzi_imob_inbound_operations_executor;

comment on function yzi_imob_inbound_operations_private.record_inbound_runner_execution(uuid, text, text, text, text) is
  'Writes one sanitized runner execution ledger row for observability. Never stores message body, phone number, payload, or secrets.';

commit;

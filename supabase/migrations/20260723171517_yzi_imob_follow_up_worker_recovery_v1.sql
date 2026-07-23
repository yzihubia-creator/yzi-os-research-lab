begin;

create schema if not exists yzi_imob_operations_private authorization postgres;

grant usage on schema yzi_imob_operations_private to yzi_imob_inbound_operations_executor;

alter table public.yzi_imob_follow_up_tasks
  add column if not exists scheduled_at timestamptz null,
  add column if not exists claimed_at timestamptz null,
  add column if not exists failed_at timestamptz null,
  add column if not exists cancelled_at timestamptz null,
  add column if not exists attempt_count integer null,
  add column if not exists max_attempts integer null,
  add column if not exists last_error_code text null,
  add column if not exists recovery_count integer null,
  add column if not exists recovered_at timestamptz null,
  add column if not exists recovery_reason text null,
  add column if not exists recovery_source text null;

update public.yzi_imob_follow_up_tasks
set scheduled_at = coalesce(scheduled_at, due_at, created_at, now()),
    attempt_count = coalesce(attempt_count, 0),
    max_attempts = coalesce(max_attempts, 3),
    recovery_count = coalesce(recovery_count, 0)
where scheduled_at is null
   or attempt_count is null
   or max_attempts is null
   or recovery_count is null;

alter table public.yzi_imob_follow_up_tasks
  alter column scheduled_at set default now(),
  alter column scheduled_at set not null,
  alter column attempt_count set default 0,
  alter column attempt_count set not null,
  alter column max_attempts set default 3,
  alter column max_attempts set not null,
  alter column recovery_count set default 0,
  alter column recovery_count set not null;

alter table public.yzi_imob_follow_up_tasks
  drop constraint if exists yzi_imob_follow_up_tasks_last_error_code_check;

alter table public.yzi_imob_follow_up_tasks
  add constraint yzi_imob_follow_up_tasks_last_error_code_check
    check (
      last_error_code is null
      or length(btrim(last_error_code)) between 1 and 80
    );

alter table public.yzi_imob_follow_up_tasks
  drop constraint if exists yzi_imob_follow_up_tasks_recovery_reason_check;

alter table public.yzi_imob_follow_up_tasks
  add constraint yzi_imob_follow_up_tasks_recovery_reason_check
    check (
      recovery_reason is null
      or length(btrim(recovery_reason)) between 1 and 80
    );

alter table public.yzi_imob_follow_up_tasks
  drop constraint if exists yzi_imob_follow_up_tasks_recovery_source_check;

alter table public.yzi_imob_follow_up_tasks
  add constraint yzi_imob_follow_up_tasks_recovery_source_check
    check (
      recovery_source is null
      or length(btrim(recovery_source)) between 1 and 80
    );

alter table public.yzi_imob_follow_up_tasks
  drop constraint if exists yzi_imob_follow_up_tasks_attempt_window_check;

alter table public.yzi_imob_follow_up_tasks
  add constraint yzi_imob_follow_up_tasks_attempt_window_check
    check (
      attempt_count between 0 and 10
      and max_attempts between 1 and 10
      and recovery_count between 0 and 5
    );

alter table public.yzi_imob_follow_up_tasks
  drop constraint if exists yzi_imob_follow_up_tasks_lifecycle_check;

alter table public.yzi_imob_follow_up_tasks
  add constraint yzi_imob_follow_up_tasks_lifecycle_check
    check (
      (
        status = 'pending'
        and claimed_at is null
        and completed_at is null
        and failed_at is null
        and cancelled_at is null
      )
      or (
        status = 'processing'
        and claimed_at is not null
        and completed_at is null
        and failed_at is null
        and cancelled_at is null
      )
      or (
        status = 'completed'
        and claimed_at is not null
        and completed_at is not null
        and failed_at is null
        and cancelled_at is null
      )
      or (
        status = 'failed'
        and claimed_at is not null
        and completed_at is null
        and failed_at is not null
        and cancelled_at is null
      )
      or (
        status = 'cancelled'
        and claimed_at is null
        and completed_at is null
        and failed_at is null
        and cancelled_at is not null
      )
    );

comment on column public.yzi_imob_follow_up_tasks.scheduled_at is
  'Next time the deterministic worker is allowed to claim the task. due_at remains the business due date.';
comment on column public.yzi_imob_follow_up_tasks.claimed_at is
  'Set by the governed worker claim when a task transitions pending/failed -> processing.';
comment on column public.yzi_imob_follow_up_tasks.failed_at is
  'Set only when one bounded execution attempt finishes in failed state.';
comment on column public.yzi_imob_follow_up_tasks.cancelled_at is
  'Set only when the worker cancels a task because the original condition was already resolved.';
comment on column public.yzi_imob_follow_up_tasks.attempt_count is
  'Bounded execution attempts already claimed by the deterministic follow-up worker.';
comment on column public.yzi_imob_follow_up_tasks.max_attempts is
  'Hard ceiling for bounded retries. The worker never exceeds this value.';
comment on column public.yzi_imob_follow_up_tasks.last_error_code is
  'Sanitized deterministic failure code for the latest failed attempt; never a stack trace or provider body.';
comment on column public.yzi_imob_follow_up_tasks.recovery_count is
  'Governed recovery operations already applied to this task.';
comment on column public.yzi_imob_follow_up_tasks.recovered_at is
  'Timestamp of the latest governed recovery action.';
comment on column public.yzi_imob_follow_up_tasks.recovery_reason is
  'Controlled recovery reason such as processing_timeout or failed_retry_ready.';
comment on column public.yzi_imob_follow_up_tasks.recovery_source is
  'Controlled actor/source string for the bounded internal recovery path.';

create unique index if not exists yzi_imob_follow_up_tasks_assignment_kind_unique
  on public.yzi_imob_follow_up_tasks (tenant_id, assignment_id, kind)
  where assignment_id is not null;

create unique index if not exists yzi_imob_follow_up_tasks_appointment_kind_unique
  on public.yzi_imob_follow_up_tasks (tenant_id, appointment_id, kind)
  where appointment_id is not null;

create unique index if not exists yzi_imob_follow_up_tasks_conversation_kind_unique
  on public.yzi_imob_follow_up_tasks (tenant_id, conversation_id, kind)
  where conversation_id is not null;

create index if not exists yzi_imob_follow_up_tasks_worker_claim_idx
  on public.yzi_imob_follow_up_tasks (status, scheduled_at, due_at, tenant_id, created_at)
  where status in ('pending', 'failed');

create index if not exists yzi_imob_follow_up_tasks_processing_idx
  on public.yzi_imob_follow_up_tasks (status, claimed_at, tenant_id)
  where status = 'processing';

alter table public.yzi_imob_inbound_operation_requests
  drop constraint if exists yzi_imob_inbound_operation_requests_failure_code_check;

alter table public.yzi_imob_inbound_operation_requests
  add constraint yzi_imob_inbound_operation_requests_failure_code_check
    check (
      failure_code is null
      or failure_code = any (array[
        'message_not_found', 'conversation_not_found', 'identity_mismatch',
        'invalid_message_contract', 'intent_classification_failed',
        'workflow_selection_failed', 'outbound_dispatch_failed',
        'completion_failed', 'processing_abandoned'
      ]::text[])
    );

comment on column public.yzi_imob_inbound_operation_requests.failure_code is
  'Controlled failure vocabulary for the deterministic inbound consumer, including processing_abandoned for governed timeout recovery.';

create or replace function yzi_imob_operations_private.sync_follow_up_tasks(
  p_limit integer default 5
)
returns table (
  created_count integer
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_limit integer := greatest(1, least(coalesce(p_limit, 5), 20));
  v_created integer := 0;
  v_remaining integer;
begin
  if session_user <> 'yzi_imob_inbound_operations_runtime' then
    raise exception using errcode = '42501', message = 'inbound_operations_runtime_required';
  end if;

  with candidates as (
    select
      a.tenant_id,
      a.id as appointment_id,
      a.lead_id,
      coalesce(a.ends_at, a.starts_at, now()) as due_at
    from public.yzi_imob_appointments a
    where a.status = 'completed'
      and not exists (
        select 1
        from public.yzi_imob_visit_feedback vf
        where vf.tenant_id = a.tenant_id
          and vf.appointment_id = a.id
      )
      and not exists (
        select 1
        from public.yzi_imob_follow_up_tasks ft
        where ft.tenant_id = a.tenant_id
          and ft.appointment_id = a.id
          and ft.kind = 'visit_feedback_due'
      )
    order by coalesce(a.ends_at, a.starts_at) asc, a.id asc
    limit v_limit
  ), inserted as (
    insert into public.yzi_imob_follow_up_tasks (
      tenant_id,
      lead_id,
      appointment_id,
      kind,
      status,
      channel,
      due_at,
      scheduled_at,
      notes,
      source,
      attempt_count,
      max_attempts,
      recovery_count
    )
    select
      c.tenant_id,
      c.lead_id,
      c.appointment_id,
      'visit_feedback_due',
      'pending',
      null,
      c.due_at,
      c.due_at,
      'Visita concluída sem feedback registrado.',
      'appointment_feedback_monitor',
      0,
      1,
      0
    from candidates c
    on conflict do nothing
    returning 1
  )
  select count(*) into v_created from inserted;

  v_remaining := greatest(0, v_limit - v_created);

  if v_remaining > 0 then
    with last_messages as (
      select
        c.tenant_id,
        c.id as conversation_id,
        c.lead_id,
        c.last_message_at,
        c.external_sender_id
      from public.yzi_imob_conversations c
      where c.channel = 'whatsapp'
        and c.lead_id is not null
        and nullif(btrim(coalesce(c.external_sender_id, '')), '') is not null
        and coalesce(c.last_message_at, c.updated_at, c.created_at) <= now() - interval '3 days'
        and not exists (
          select 1
          from public.yzi_imob_appointments a
          where a.tenant_id = c.tenant_id
            and a.lead_id = c.lead_id
            and a.starts_at > now()
            and a.status <> 'cancelled'
        )
        and not exists (
          select 1
          from public.yzi_imob_follow_up_tasks ft
          where ft.tenant_id = c.tenant_id
            and ft.conversation_id = c.id
            and ft.kind = 'lead_stalled'
        )
      order by coalesce(c.last_message_at, c.updated_at, c.created_at) asc, c.id asc
      limit v_remaining
    ), inserted as (
      insert into public.yzi_imob_follow_up_tasks (
        tenant_id,
        lead_id,
        conversation_id,
        kind,
        status,
        channel,
        due_at,
        scheduled_at,
        notes,
        source,
        attempt_count,
        max_attempts,
        recovery_count
      )
      select
        m.tenant_id,
        m.lead_id,
        m.conversation_id,
        'lead_stalled',
        'pending',
        'whatsapp',
        coalesce(m.last_message_at, now()),
        coalesce(m.last_message_at, now()),
        'Lead parado sem atividade recente; avaliar retomada.',
        'lead_stall_monitor',
        0,
        3,
        0
      from last_messages m
      on conflict do nothing
      returning 1
    )
    select v_created + count(*) into v_created from inserted;
  end if;

  v_remaining := greatest(0, v_limit - v_created);

  if v_remaining > 0 then
    with latest_inbound as (
      select distinct on (m.tenant_id, m.conversation_id)
        m.tenant_id,
        m.conversation_id,
        c.lead_id,
        m.created_at,
        c.external_sender_id
      from public.yzi_imob_messages m
      join public.yzi_imob_conversations c
        on c.id = m.conversation_id
       and c.tenant_id = m.tenant_id
      where c.channel = 'whatsapp'
        and nullif(btrim(coalesce(c.external_sender_id, '')), '') is not null
        and m.direction = 'inbound'
        and m.sender_type = 'external_contact'
        and m.provider = 'meta'
        and m.channel = 'whatsapp'
      order by m.tenant_id, m.conversation_id, m.created_at desc, m.id desc
    ), candidates as (
      select
        li.tenant_id,
        li.conversation_id,
        li.lead_id,
        li.created_at as due_at
      from latest_inbound li
      where li.created_at <= now() - interval '1 day'
        and not exists (
          select 1
          from public.yzi_imob_messages outbound
          where outbound.tenant_id = li.tenant_id
            and outbound.conversation_id = li.conversation_id
            and outbound.direction = 'outbound'
            and outbound.sender_type = 'yzi'
            and outbound.provider = 'meta'
            and outbound.channel = 'whatsapp'
            and outbound.created_at > li.created_at
        )
        and not exists (
          select 1
          from public.yzi_imob_follow_up_tasks ft
          where ft.tenant_id = li.tenant_id
            and ft.conversation_id = li.conversation_id
            and ft.kind = 'conversation_waiting_reply'
        )
      order by li.created_at asc, li.conversation_id asc
      limit v_remaining
    ), inserted as (
      insert into public.yzi_imob_follow_up_tasks (
        tenant_id,
        lead_id,
        conversation_id,
        kind,
        status,
        channel,
        due_at,
        scheduled_at,
        notes,
        source,
        attempt_count,
        max_attempts,
        recovery_count
      )
      select
        c.tenant_id,
        c.lead_id,
        c.conversation_id,
        'conversation_waiting_reply',
        'pending',
        'whatsapp',
        c.due_at,
        c.due_at,
        'Conversa aguardando retorno em WhatsApp.',
        'conversation_reply_monitor',
        0,
        3,
        0
      from candidates c
      on conflict do nothing
      returning 1
    )
    select v_created + count(*) into v_created from inserted;
  end if;

  created_count := v_created;
  return next;
end;
$$;

create or replace function yzi_imob_operations_private.claim_next_follow_up_task()
returns table (
  task_id uuid,
  tenant_id uuid,
  kind text,
  status text,
  channel text,
  due_at timestamptz,
  scheduled_at timestamptz,
  attempt_count integer,
  max_attempts integer
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_task public.yzi_imob_follow_up_tasks%rowtype;
begin
  if session_user <> 'yzi_imob_inbound_operations_runtime' then
    raise exception using errcode = '42501', message = 'inbound_operations_runtime_required';
  end if;

  select *
  into v_task
  from public.yzi_imob_follow_up_tasks ft
  where ft.status in ('pending', 'failed')
    and ft.scheduled_at <= now()
    and ft.attempt_count < ft.max_attempts
  order by ft.scheduled_at asc, ft.due_at asc, ft.created_at asc, ft.id asc
  for update skip locked
  limit 1;

  if not found then
    return;
  end if;

  update public.yzi_imob_follow_up_tasks
  set status = 'processing',
      claimed_at = now(),
      failed_at = null,
      last_error_code = null,
      updated_at = now(),
      attempt_count = v_task.attempt_count + 1
  where id = v_task.id
  returning
    id,
    public.yzi_imob_follow_up_tasks.tenant_id,
    public.yzi_imob_follow_up_tasks.kind,
    public.yzi_imob_follow_up_tasks.status,
    public.yzi_imob_follow_up_tasks.channel,
    public.yzi_imob_follow_up_tasks.due_at,
    public.yzi_imob_follow_up_tasks.scheduled_at,
    public.yzi_imob_follow_up_tasks.attempt_count,
    public.yzi_imob_follow_up_tasks.max_attempts
  into task_id, tenant_id, kind, status, channel, due_at, scheduled_at, attempt_count, max_attempts;

  return next;
end;
$$;

create or replace function yzi_imob_operations_private.get_follow_up_task_context(
  p_task_id uuid
)
returns table (
  task_id uuid,
  tenant_id uuid,
  lead_id uuid,
  conversation_id uuid,
  appointment_id uuid,
  assignment_id uuid,
  kind text,
  status text,
  channel text,
  due_at timestamptz,
  scheduled_at timestamptz,
  notes text,
  attempt_count integer,
  max_attempts integer,
  metadata jsonb,
  assignment_status text,
  appointment_status text,
  feedback_present boolean,
  external_sender_id text,
  latest_message_direction text,
  latest_message_sender_type text,
  latest_message_body text,
  latest_message_created_at timestamptz,
  lead_status text,
  next_appointment_exists boolean
)
language plpgsql
security definer
stable
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_task public.yzi_imob_follow_up_tasks%rowtype;
begin
  if session_user <> 'yzi_imob_inbound_operations_runtime' then
    raise exception using errcode = '42501', message = 'inbound_operations_runtime_required';
  end if;

  select *
  into v_task
  from public.yzi_imob_follow_up_tasks ft
  where ft.id = p_task_id
    and ft.status = 'processing'
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'follow_up_task_not_processing';
  end if;

  return query
  with latest_message as (
    select
      m.direction,
      m.sender_type,
      m.body,
      m.created_at
    from public.yzi_imob_messages m
    where m.tenant_id = v_task.tenant_id
      and m.conversation_id = v_task.conversation_id
    order by m.created_at desc, m.id desc
    limit 1
  )
  select
    v_task.id,
    v_task.tenant_id,
    v_task.lead_id,
    v_task.conversation_id,
    v_task.appointment_id,
    v_task.assignment_id,
    v_task.kind,
    v_task.status,
    v_task.channel,
    v_task.due_at,
    v_task.scheduled_at,
    v_task.notes,
    v_task.attempt_count,
    v_task.max_attempts,
    v_task.metadata,
    a.status,
    ap.status,
    exists (
      select 1
      from public.yzi_imob_visit_feedback vf
      where vf.tenant_id = v_task.tenant_id
        and vf.appointment_id = v_task.appointment_id
    ),
    c.external_sender_id,
    lm.direction,
    lm.sender_type,
    lm.body,
    lm.created_at,
    l.status,
    exists (
      select 1
      from public.yzi_imob_appointments future_ap
      where future_ap.tenant_id = v_task.tenant_id
        and future_ap.lead_id = v_task.lead_id
        and future_ap.starts_at > now()
        and future_ap.status <> 'cancelled'
    )
  from (select 1) constant
  left join public.yzi_imob_lead_assignments a
    on a.id = v_task.assignment_id
   and a.tenant_id = v_task.tenant_id
  left join public.yzi_imob_appointments ap
    on ap.id = v_task.appointment_id
   and ap.tenant_id = v_task.tenant_id
  left join public.yzi_imob_conversations c
    on c.id = v_task.conversation_id
   and c.tenant_id = v_task.tenant_id
  left join public.yzi_imob_leads l
    on l.id = v_task.lead_id
   and l.tenant_id = v_task.tenant_id
  left join latest_message lm on true;
end;
$$;

create or replace function yzi_imob_operations_private.complete_follow_up_task(
  p_task_id uuid
)
returns table (
  status text,
  task_id uuid
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_task public.yzi_imob_follow_up_tasks%rowtype;
begin
  if session_user <> 'yzi_imob_inbound_operations_runtime' then
    raise exception using errcode = '42501', message = 'inbound_operations_runtime_required';
  end if;

  select *
  into v_task
  from public.yzi_imob_follow_up_tasks
  where id = p_task_id
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'follow_up_task_not_found';
  end if;

  if v_task.status <> 'processing' then
    raise exception using errcode = '22023', message = 'follow_up_task_not_processing';
  end if;

  update public.yzi_imob_follow_up_tasks
  set status = 'completed',
      completed_at = now(),
      updated_at = now(),
      last_error_code = null
  where id = v_task.id;

  status := 'completed';
  task_id := v_task.id;
  return next;
end;
$$;

create or replace function yzi_imob_operations_private.fail_follow_up_task(
  p_task_id uuid,
  p_error_code text,
  p_retry_delay_seconds integer default null
)
returns table (
  status text,
  task_id uuid,
  attempt_count integer,
  max_attempts integer
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_task public.yzi_imob_follow_up_tasks%rowtype;
  v_error_code text := btrim(coalesce(p_error_code, ''));
  v_retry_delay_seconds integer := greatest(0, least(coalesce(p_retry_delay_seconds, 0), 86400));
begin
  if session_user <> 'yzi_imob_inbound_operations_runtime' then
    raise exception using errcode = '42501', message = 'inbound_operations_runtime_required';
  end if;

  if v_error_code = '' then
    raise exception using errcode = '22023', message = 'follow_up_error_code_required';
  end if;

  select *
  into v_task
  from public.yzi_imob_follow_up_tasks
  where id = p_task_id
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'follow_up_task_not_found';
  end if;

  if v_task.status <> 'processing' then
    raise exception using errcode = '22023', message = 'follow_up_task_not_processing';
  end if;

  update public.yzi_imob_follow_up_tasks
  set status = 'failed',
      failed_at = now(),
      scheduled_at = case
        when v_task.attempt_count >= v_task.max_attempts then v_task.scheduled_at
        when v_retry_delay_seconds > 0 then now() + make_interval(secs => v_retry_delay_seconds)
        else now()
      end,
      updated_at = now(),
      last_error_code = v_error_code
  where id = v_task.id
  returning
    public.yzi_imob_follow_up_tasks.attempt_count,
    public.yzi_imob_follow_up_tasks.max_attempts
  into attempt_count, max_attempts;

  status := 'failed';
  task_id := v_task.id;
  return next;
end;
$$;

create or replace function yzi_imob_operations_private.cancel_follow_up_task(
  p_task_id uuid,
  p_reason text
)
returns table (
  status text,
  task_id uuid
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_task public.yzi_imob_follow_up_tasks%rowtype;
  v_reason text := btrim(coalesce(p_reason, ''));
begin
  if session_user <> 'yzi_imob_inbound_operations_runtime' then
    raise exception using errcode = '42501', message = 'inbound_operations_runtime_required';
  end if;

  if v_reason = '' then
    raise exception using errcode = '22023', message = 'follow_up_cancel_reason_required';
  end if;

  select *
  into v_task
  from public.yzi_imob_follow_up_tasks
  where id = p_task_id
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'follow_up_task_not_found';
  end if;

  if v_task.status not in ('processing', 'pending', 'failed') then
    raise exception using errcode = '22023', message = 'follow_up_task_not_cancellable';
  end if;

  update public.yzi_imob_follow_up_tasks
  set status = 'cancelled',
      claimed_at = null,
      cancelled_at = now(),
      failed_at = null,
      completed_at = null,
      updated_at = now(),
      last_error_code = v_reason
  where id = v_task.id;

  status := 'cancelled';
  task_id := v_task.id;
  return next;
end;
$$;

create or replace function yzi_imob_operations_private.recover_follow_up_tasks(
  p_source text,
  p_processing_timeout_seconds integer default 900,
  p_limit integer default 20
)
returns table (
  recovered_count integer
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_source text := btrim(coalesce(p_source, ''));
  v_timeout_seconds integer := greatest(60, least(coalesce(p_processing_timeout_seconds, 900), 86400));
  v_limit integer := greatest(1, least(coalesce(p_limit, 20), 100));
  v_recovered integer := 0;
begin
  if session_user <> 'yzi_imob_inbound_operations_runtime' then
    raise exception using errcode = '42501', message = 'inbound_operations_runtime_required';
  end if;

  if v_source = '' then
    raise exception using errcode = '22023', message = 'recovery_source_required';
  end if;

  with timed_out as (
    select ft.id
    from public.yzi_imob_follow_up_tasks ft
    where ft.status = 'processing'
      and ft.claimed_at <= now() - make_interval(secs => v_timeout_seconds)
      and ft.recovery_count < 5
    order by ft.claimed_at asc, ft.id asc
    limit v_limit
    for update skip locked
  ), updated as (
    update public.yzi_imob_follow_up_tasks ft
    set status = 'pending',
        claimed_at = null,
        failed_at = null,
        completed_at = null,
        cancelled_at = null,
        scheduled_at = now(),
        updated_at = now(),
        recovered_at = now(),
        recovery_reason = 'processing_timeout',
        recovery_source = v_source,
        recovery_count = ft.recovery_count + 1
    where ft.id in (select id from timed_out)
    returning 1
  )
  select count(*) into v_recovered from updated;

  if v_recovered < v_limit then
    with retryable as (
      select ft.id
      from public.yzi_imob_follow_up_tasks ft
      where ft.status = 'failed'
        and ft.scheduled_at <= now()
        and ft.attempt_count < ft.max_attempts
        and ft.recovery_count < 5
      order by ft.failed_at asc nulls first, ft.id asc
      limit (v_limit - v_recovered)
      for update skip locked
    ), updated as (
      update public.yzi_imob_follow_up_tasks ft
      set status = 'pending',
          claimed_at = null,
          failed_at = null,
          completed_at = null,
          cancelled_at = null,
          updated_at = now(),
          recovered_at = now(),
          recovery_reason = 'failed_retry_ready',
          recovery_source = v_source,
          recovery_count = ft.recovery_count + 1
      where ft.id in (select id from retryable)
      returning 1
    )
    select v_recovered + count(*) into v_recovered from updated;
  end if;

  recovered_count := v_recovered;
  return next;
end;
$$;

create or replace function yzi_imob_operations_private.recover_inbound_operations(
  p_source text,
  p_processing_timeout_seconds integer default 900,
  p_limit integer default 20
)
returns table (
  recovered_count integer
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public'
as $$
declare
  v_source text := btrim(coalesce(p_source, ''));
  v_timeout_seconds integer := greatest(60, least(coalesce(p_processing_timeout_seconds, 900), 86400));
begin
  if session_user <> 'yzi_imob_inbound_operations_runtime' then
    raise exception using errcode = '42501', message = 'inbound_operations_runtime_required';
  end if;

  if v_source = '' then
    raise exception using errcode = '22023', message = 'recovery_source_required';
  end if;

  with timed_out as (
    select r.id
    from public.yzi_imob_inbound_operation_requests r
    where r.execution_status = 'processing'
      and r.claimed_at <= now() - make_interval(secs => v_timeout_seconds)
    order by r.claimed_at asc, r.id asc
    limit greatest(1, least(coalesce(p_limit, 20), 100))
    for update skip locked
  ), updated as (
    update public.yzi_imob_inbound_operation_requests r
    set execution_status = 'failed',
        intent_status = 'failed',
        intent_key = null,
        workflow_status = 'pending',
        workflow_key = null,
        completed_at = now(),
        failure_code = 'processing_abandoned',
        updated_at = now()
    where r.id in (select id from timed_out)
    returning 1
  )
  select count(*) into recovered_count from updated;

  insert into public.yzi_imob_inbound_runner_executions (
    tenant_id,
    request_id,
    outcome_status,
    failure_code,
    intent_key,
    workflow_key
  )
  select r.tenant_id, r.id, 'failed', 'processing_abandoned', null, null
  from public.yzi_imob_inbound_operation_requests r
  where r.failure_code = 'processing_abandoned'
    and r.completed_at >= now() - interval '5 seconds';

  return next;
end;
$$;

alter function yzi_imob_operations_private.sync_follow_up_tasks(integer) owner to postgres;
alter function yzi_imob_operations_private.claim_next_follow_up_task() owner to postgres;
alter function yzi_imob_operations_private.get_follow_up_task_context(uuid) owner to postgres;
alter function yzi_imob_operations_private.complete_follow_up_task(uuid) owner to postgres;
alter function yzi_imob_operations_private.fail_follow_up_task(uuid, text, integer) owner to postgres;
alter function yzi_imob_operations_private.cancel_follow_up_task(uuid, text) owner to postgres;
alter function yzi_imob_operations_private.recover_follow_up_tasks(text, integer, integer) owner to postgres;
alter function yzi_imob_operations_private.recover_inbound_operations(text, integer, integer) owner to postgres;

revoke all on function yzi_imob_operations_private.sync_follow_up_tasks(integer)
  from public, anon, authenticated, service_role, yzi_imob_inbound_operations_executor, yzi_imob_inbound_operations_runtime;
revoke all on function yzi_imob_operations_private.claim_next_follow_up_task()
  from public, anon, authenticated, service_role, yzi_imob_inbound_operations_executor, yzi_imob_inbound_operations_runtime;
revoke all on function yzi_imob_operations_private.get_follow_up_task_context(uuid)
  from public, anon, authenticated, service_role, yzi_imob_inbound_operations_executor, yzi_imob_inbound_operations_runtime;
revoke all on function yzi_imob_operations_private.complete_follow_up_task(uuid)
  from public, anon, authenticated, service_role, yzi_imob_inbound_operations_executor, yzi_imob_inbound_operations_runtime;
revoke all on function yzi_imob_operations_private.fail_follow_up_task(uuid, text, integer)
  from public, anon, authenticated, service_role, yzi_imob_inbound_operations_executor, yzi_imob_inbound_operations_runtime;
revoke all on function yzi_imob_operations_private.cancel_follow_up_task(uuid, text)
  from public, anon, authenticated, service_role, yzi_imob_inbound_operations_executor, yzi_imob_inbound_operations_runtime;
revoke all on function yzi_imob_operations_private.recover_follow_up_tasks(text, integer, integer)
  from public, anon, authenticated, service_role, yzi_imob_inbound_operations_executor, yzi_imob_inbound_operations_runtime;
revoke all on function yzi_imob_operations_private.recover_inbound_operations(text, integer, integer)
  from public, anon, authenticated, service_role, yzi_imob_inbound_operations_executor, yzi_imob_inbound_operations_runtime;

grant execute on function yzi_imob_operations_private.sync_follow_up_tasks(integer)
  to yzi_imob_inbound_operations_executor;
grant execute on function yzi_imob_operations_private.claim_next_follow_up_task()
  to yzi_imob_inbound_operations_executor;
grant execute on function yzi_imob_operations_private.get_follow_up_task_context(uuid)
  to yzi_imob_inbound_operations_executor;
grant execute on function yzi_imob_operations_private.complete_follow_up_task(uuid)
  to yzi_imob_inbound_operations_executor;
grant execute on function yzi_imob_operations_private.fail_follow_up_task(uuid, text, integer)
  to yzi_imob_inbound_operations_executor;
grant execute on function yzi_imob_operations_private.cancel_follow_up_task(uuid, text)
  to yzi_imob_inbound_operations_executor;
grant execute on function yzi_imob_operations_private.recover_follow_up_tasks(text, integer, integer)
  to yzi_imob_inbound_operations_executor;
grant execute on function yzi_imob_operations_private.recover_inbound_operations(text, integer, integer)
  to yzi_imob_inbound_operations_executor;

commit;

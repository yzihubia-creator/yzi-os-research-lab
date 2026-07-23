begin;

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

alter function yzi_imob_operations_private.get_follow_up_task_context(uuid)
  owner to postgres;

revoke all on function yzi_imob_operations_private.get_follow_up_task_context(uuid)
  from public, anon, authenticated, service_role, yzi_imob_inbound_operations_executor, yzi_imob_inbound_operations_runtime;

grant execute on function yzi_imob_operations_private.get_follow_up_task_context(uuid)
  to yzi_imob_inbound_operations_executor;

commit;

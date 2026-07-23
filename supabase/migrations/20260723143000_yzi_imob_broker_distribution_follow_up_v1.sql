begin;

alter table public.yzi_imob_appointments
  add constraint yzi_imob_appointments_id_tenant_unique
    unique (id, tenant_id);

create table if not exists public.yzi_imob_lead_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  lead_id uuid not null,
  broker_user_id uuid not null references auth.users (id) on delete restrict,
  status text not null default 'assigned',
  source text not null default 'manual',
  notes text null,
  expires_at timestamptz null,
  assigned_at timestamptz not null default now(),
  accepted_at timestamptz null,
  declined_at timestamptz null,
  created_by_user_id uuid null references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_lead_assignments_lead_tenant_fkey
    foreign key (lead_id, tenant_id) references public.yzi_imob_leads (id, tenant_id) on delete restrict,
  constraint yzi_imob_lead_assignments_status_check
    check (status = any (array['assigned', 'accepted', 'declined', 'expired', 'reassigned']::text[])),
  constraint yzi_imob_lead_assignments_source_not_empty_check
    check (length(btrim(source)) > 0),
  constraint yzi_imob_lead_assignments_temporal_consistency_check
    check (
      (accepted_at is null or accepted_at >= assigned_at)
      and (declined_at is null or declined_at >= assigned_at)
    )
);

create unique index if not exists yzi_imob_lead_assignments_active_lead_unique
  on public.yzi_imob_lead_assignments (tenant_id, lead_id)
  where status in ('assigned', 'accepted');

create index if not exists yzi_imob_lead_assignments_tenant_broker_status_idx
  on public.yzi_imob_lead_assignments (tenant_id, broker_user_id, status, assigned_at desc);

create index if not exists yzi_imob_lead_assignments_tenant_expires_idx
  on public.yzi_imob_lead_assignments (tenant_id, expires_at)
  where expires_at is not null and status = 'assigned';

alter table public.yzi_imob_lead_assignments enable row level security;

create policy yzi_imob_lead_assignments_select_member
  on public.yzi_imob_lead_assignments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_lead_assignments.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create policy yzi_imob_lead_assignments_insert_operator
  on public.yzi_imob_lead_assignments
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_lead_assignments.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and tm.role = any (array['owner', 'admin', 'operator']::text[])
        and t.status = 'active'
    )
    and exists (
      select 1
      from public.tenant_memberships broker_tm
      where broker_tm.tenant_id = yzi_imob_lead_assignments.tenant_id
        and broker_tm.user_id = yzi_imob_lead_assignments.broker_user_id
        and broker_tm.status = 'active'
    )
  );

create policy yzi_imob_lead_assignments_update_operator
  on public.yzi_imob_lead_assignments
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_lead_assignments.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and tm.role = any (array['owner', 'admin', 'operator']::text[])
        and t.status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_lead_assignments.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and tm.role = any (array['owner', 'admin', 'operator']::text[])
        and t.status = 'active'
    )
    and exists (
      select 1
      from public.tenant_memberships broker_tm
      where broker_tm.tenant_id = yzi_imob_lead_assignments.tenant_id
        and broker_tm.user_id = yzi_imob_lead_assignments.broker_user_id
        and broker_tm.status = 'active'
    )
  );

create policy yzi_imob_lead_assignments_update_self
  on public.yzi_imob_lead_assignments
  for update
  to authenticated
  using (
    broker_user_id = (select auth.uid())
    and exists (
      select 1
      from public.tenant_memberships tm
      where tm.tenant_id = yzi_imob_lead_assignments.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
    )
  )
  with check (
    broker_user_id = (select auth.uid())
    and exists (
      select 1
      from public.tenant_memberships tm
      where tm.tenant_id = yzi_imob_lead_assignments.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
    )
  );

grant select, insert, update on table public.yzi_imob_lead_assignments to authenticated;

create table if not exists public.yzi_imob_visit_feedback (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  appointment_id uuid not null,
  lead_id uuid null,
  property_id uuid null,
  broker_user_id uuid null references auth.users (id) on delete set null,
  client_attendance text not null default 'unknown',
  outcome text not null default 'follow_up_required',
  observation text null,
  next_action text null,
  next_action_at timestamptz null,
  feedback_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_visit_feedback_appointment_tenant_fkey
    foreign key (appointment_id, tenant_id) references public.yzi_imob_appointments (id, tenant_id) on delete restrict,
  constraint yzi_imob_visit_feedback_lead_tenant_fkey
    foreign key (lead_id, tenant_id) references public.yzi_imob_leads (id, tenant_id) on delete restrict,
  constraint yzi_imob_visit_feedback_property_tenant_fkey
    foreign key (property_id, tenant_id) references public.yzi_imob_properties (id, tenant_id) on delete restrict,
  constraint yzi_imob_visit_feedback_appointment_unique
    unique (tenant_id, appointment_id),
  constraint yzi_imob_visit_feedback_client_attendance_check
    check (client_attendance = any (array['attended', 'no_show', 'unknown']::text[])),
  constraint yzi_imob_visit_feedback_outcome_check
    check (outcome = any (array['interested', 'not_interested', 'proposal_requested', 'follow_up_required', 'undisclosed']::text[]))
);

create index if not exists yzi_imob_visit_feedback_tenant_feedback_at_idx
  on public.yzi_imob_visit_feedback (tenant_id, feedback_at desc);

alter table public.yzi_imob_visit_feedback enable row level security;

create policy yzi_imob_visit_feedback_select_member
  on public.yzi_imob_visit_feedback
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_visit_feedback.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create policy yzi_imob_visit_feedback_write_member
  on public.yzi_imob_visit_feedback
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_visit_feedback.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_visit_feedback.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
    and (
      broker_user_id is null
      or exists (
        select 1
        from public.tenant_memberships broker_tm
        where broker_tm.tenant_id = yzi_imob_visit_feedback.tenant_id
          and broker_tm.user_id = yzi_imob_visit_feedback.broker_user_id
          and broker_tm.status = 'active'
      )
    )
  );

grant select, insert, update on table public.yzi_imob_visit_feedback to authenticated;

create table if not exists public.yzi_imob_follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  lead_id uuid null,
  conversation_id uuid null,
  appointment_id uuid null,
  assignment_id uuid null references public.yzi_imob_lead_assignments (id) on delete restrict,
  kind text not null,
  status text not null default 'pending',
  channel text null,
  due_at timestamptz not null,
  notes text null,
  source text not null,
  metadata jsonb not null default '{}'::jsonb,
  last_attempt_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_follow_up_tasks_lead_tenant_fkey
    foreign key (lead_id, tenant_id) references public.yzi_imob_leads (id, tenant_id) on delete restrict,
  constraint yzi_imob_follow_up_tasks_conversation_tenant_fkey
    foreign key (conversation_id, tenant_id) references public.yzi_imob_conversations (id, tenant_id) on delete restrict,
  constraint yzi_imob_follow_up_tasks_appointment_tenant_fkey
    foreign key (appointment_id, tenant_id) references public.yzi_imob_appointments (id, tenant_id) on delete restrict,
  constraint yzi_imob_follow_up_tasks_kind_check
    check (kind = any (array['lead_stalled', 'visit_feedback_due', 'assignment_response_due', 'next_action_due', 'conversation_waiting_reply']::text[])),
  constraint yzi_imob_follow_up_tasks_status_check
    check (status = any (array['pending', 'processing', 'completed', 'cancelled', 'failed']::text[])),
  constraint yzi_imob_follow_up_tasks_channel_check
    check (channel is null or channel = any (array['whatsapp']::text[])),
  constraint yzi_imob_follow_up_tasks_source_not_empty_check
    check (length(btrim(source)) > 0),
  constraint yzi_imob_follow_up_tasks_reference_check
    check (
      lead_id is not null
      or conversation_id is not null
      or appointment_id is not null
      or assignment_id is not null
    ),
  constraint yzi_imob_follow_up_tasks_metadata_check
    check (jsonb_typeof(metadata) = 'object')
);

create index if not exists yzi_imob_follow_up_tasks_tenant_due_idx
  on public.yzi_imob_follow_up_tasks (tenant_id, status, due_at);

create index if not exists yzi_imob_follow_up_tasks_tenant_kind_idx
  on public.yzi_imob_follow_up_tasks (tenant_id, kind, status);

alter table public.yzi_imob_follow_up_tasks enable row level security;

create policy yzi_imob_follow_up_tasks_select_member
  on public.yzi_imob_follow_up_tasks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_follow_up_tasks.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create policy yzi_imob_follow_up_tasks_write_operator
  on public.yzi_imob_follow_up_tasks
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_follow_up_tasks.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and tm.role = any (array['owner', 'admin', 'operator']::text[])
        and t.status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_follow_up_tasks.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and tm.role = any (array['owner', 'admin', 'operator']::text[])
        and t.status = 'active'
    )
  );

grant select, insert, update on table public.yzi_imob_follow_up_tasks to authenticated;

commit;

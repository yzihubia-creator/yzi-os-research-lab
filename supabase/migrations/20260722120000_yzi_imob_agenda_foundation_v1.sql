begin;

create table if not exists public.yzi_imob_appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  lead_id uuid null,
  property_id uuid null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz null,
  status text not null,
  confirmation_status text not null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint yzi_imob_appointments_title_not_empty_check
    check (length(btrim(title)) > 0),
  constraint yzi_imob_appointments_status_check
    check (status = any (array['scheduled', 'completed', 'cancelled', 'no_show']::text[])),
  constraint yzi_imob_appointments_confirmation_status_check
    check (confirmation_status = any (array['pending', 'confirmed', 'declined']::text[])),
  constraint yzi_imob_appointments_time_order_check
    check (ends_at is null or ends_at >= starts_at),
  constraint yzi_imob_appointments_lead_tenant_fkey
    foreign key (lead_id, tenant_id) references public.yzi_imob_leads (id, tenant_id) on delete restrict,
  constraint yzi_imob_appointments_property_tenant_fkey
    foreign key (property_id, tenant_id) references public.yzi_imob_properties (id, tenant_id) on delete restrict
);

create index if not exists yzi_imob_appointments_tenant_starts_at_idx
  on public.yzi_imob_appointments (tenant_id, starts_at);

create index if not exists yzi_imob_appointments_tenant_status_idx
  on public.yzi_imob_appointments (tenant_id, status);

alter table public.yzi_imob_appointments enable row level security;

create policy yzi_imob_appointments_select_member
  on public.yzi_imob_appointments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_appointments.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and t.status = 'active'
    )
  );

create policy yzi_imob_appointments_insert_operator
  on public.yzi_imob_appointments
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_appointments.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and tm.role = any (array['owner', 'admin', 'operator']::text[])
        and t.status = 'active'
    )
  );

create policy yzi_imob_appointments_update_operator
  on public.yzi_imob_appointments
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_appointments.tenant_id
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
      where tm.tenant_id = yzi_imob_appointments.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and tm.role = any (array['owner', 'admin', 'operator']::text[])
        and t.status = 'active'
    )
  );

grant select, insert, update on table public.yzi_imob_appointments to authenticated;

commit;

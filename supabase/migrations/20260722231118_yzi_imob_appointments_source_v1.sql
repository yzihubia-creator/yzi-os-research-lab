begin;

alter table public.yzi_imob_appointments
  add column if not exists source text not null default 'manual',
  add column if not exists broker_user_id uuid null references auth.users (id) on delete set null;

alter table public.yzi_imob_appointments
  drop constraint if exists yzi_imob_appointments_source_not_empty_check;

alter table public.yzi_imob_appointments
  add constraint yzi_imob_appointments_source_not_empty_check
    check (length(btrim(source)) > 0);

create index if not exists yzi_imob_appointments_tenant_broker_user_idx
  on public.yzi_imob_appointments (tenant_id, broker_user_id)
  where broker_user_id is not null;

drop policy if exists yzi_imob_appointments_insert_operator on public.yzi_imob_appointments;
drop policy if exists yzi_imob_appointments_update_operator on public.yzi_imob_appointments;

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
    and (
      broker_user_id is null
      or exists (
        select 1
        from public.tenant_memberships broker_tm
        where broker_tm.tenant_id = yzi_imob_appointments.tenant_id
          and broker_tm.user_id = yzi_imob_appointments.broker_user_id
          and broker_tm.status = 'active'
      )
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
    and (
      broker_user_id is null
      or exists (
        select 1
        from public.tenant_memberships broker_tm
        where broker_tm.tenant_id = yzi_imob_appointments.tenant_id
          and broker_tm.user_id = yzi_imob_appointments.broker_user_id
          and broker_tm.status = 'active'
      )
    )
  );

commit;

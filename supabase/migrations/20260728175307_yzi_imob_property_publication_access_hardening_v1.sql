begin;

revoke all
  on table
    public.yzi_imob_property_media,
    public.yzi_imob_property_publication_revisions,
    public.yzi_imob_property_publications,
    public.yzi_imob_property_publication_jobs,
    public.yzi_imob_property_publication_events
  from public, anon;

drop policy if exists yzi_imob_property_media_write_operator
  on public.yzi_imob_property_media;

create policy yzi_imob_property_media_insert_operator
  on public.yzi_imob_property_media
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_property_media.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and tm.role = any (array['owner', 'admin', 'operator']::text[])
        and t.status = 'active'
    )
    and (
      created_by_user_id is null
      or created_by_user_id = (select auth.uid())
    )
  );

create policy yzi_imob_property_media_update_operator
  on public.yzi_imob_property_media
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_property_media.tenant_id
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
      where tm.tenant_id = yzi_imob_property_media.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and tm.role = any (array['owner', 'admin', 'operator']::text[])
        and t.status = 'active'
    )
    and (
      created_by_user_id is null
      or created_by_user_id = (select auth.uid())
    )
  );

create policy yzi_imob_property_media_delete_operator
  on public.yzi_imob_property_media
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.tenant_memberships tm
      join public.tenants t on t.id = tm.tenant_id
      where tm.tenant_id = yzi_imob_property_media.tenant_id
        and tm.user_id = (select auth.uid())
        and tm.status = 'active'
        and tm.role = any (array['owner', 'admin', 'operator']::text[])
        and t.status = 'active'
    )
  );

commit;

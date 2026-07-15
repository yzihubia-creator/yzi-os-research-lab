-- YZI IMOB - Meta OAuth Start catalog check fix v1
-- Supabase migration: 20260715005212_yzi_imob_meta_oauth_start_catalog_check_fix_v1
--
-- Fixes the catalog_id allowlist predicate in start_yzi_imob_meta_authorization.
-- The original expression used <> any (...), which rejects valid values because
-- each valid value is still different from at least one other array element.

begin;

create or replace function public.start_yzi_imob_meta_authorization(
  p_tenant_id uuid,
  p_catalog_id text,
  p_state_hash text,
  p_expires_at timestamptz,
  p_redirect_origin text,
  p_request_id text default null
)
returns table (
  authorization_id uuid,
  expires_at timestamptz
)
language plpgsql
security definer
volatile
set search_path to 'pg_catalog', 'public', 'auth'
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required.';
  end if;

  if p_catalog_id is null
    or not (p_catalog_id = any (array['instagram', 'facebook', 'meta-ads']::text[]))
  then
    raise exception using errcode = '22023', message = 'Unsupported Meta connection catalog_id.';
  end if;

  if p_state_hash is null or p_state_hash !~ '^[a-f0-9]{64}$' then
    raise exception using errcode = '22023', message = 'Invalid OAuth state hash.';
  end if;

  if p_expires_at is null
    or p_expires_at <= now()
    or p_expires_at > now() + interval '15 minutes'
  then
    raise exception using errcode = '22023', message = 'Invalid OAuth state expiration.';
  end if;

  if p_redirect_origin is null
    or length(p_redirect_origin) > 255
    or p_redirect_origin !~ '^https?://[^/?#]+$'
  then
    raise exception using errcode = '22023', message = 'Invalid redirect origin.';
  end if;

  if p_request_id is not null
    and p_request_id !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
  then
    raise exception using errcode = '22023', message = 'Invalid request id.';
  end if;

  if not exists (
    select 1
    from public.tenant_memberships tm
    join public.tenants t on t.id = tm.tenant_id
    where tm.tenant_id = p_tenant_id
      and tm.user_id = v_user_id
      and tm.status = 'active'
      and tm.role = any (array['owner', 'admin']::text[])
      and t.status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'Active owner or admin membership required.';
  end if;

  insert into public.connection_authorizations (
    tenant_id,
    user_id,
    provider,
    catalog_id,
    state_hash,
    expires_at
  )
  values (
    p_tenant_id,
    v_user_id,
    'meta',
    p_catalog_id,
    p_state_hash,
    p_expires_at
  )
  returning id, connection_authorizations.expires_at
  into authorization_id, expires_at;

  insert into public.connection_audit_events (
    tenant_id,
    connection_id,
    event,
    actor_user_id,
    metadata
  )
  values (
    p_tenant_id,
    null,
    'authorization_started',
    v_user_id,
    jsonb_strip_nulls(jsonb_build_object(
      'catalog_id', p_catalog_id,
      'provider', 'meta',
      'redirect_origin', p_redirect_origin,
      'expires_at', p_expires_at,
      'request_id', p_request_id
    ))
  );

  return next;
end;
$$;

comment on function public.start_yzi_imob_meta_authorization(
  uuid,
  text,
  text,
  timestamptz,
  text,
  text
) is
  'Governed Meta OAuth start. Requires explicit tenant_id, active owner/admin membership in an active tenant, stores only state_hash, and audits authorization_started with sanitized metadata. catalog_id is the requested Meta catalog entry point, not a separate provider identity.';

revoke all on function public.start_yzi_imob_meta_authorization(
  uuid,
  text,
  text,
  timestamptz,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.start_yzi_imob_meta_authorization(
  uuid,
  text,
  text,
  timestamptz,
  text,
  text
) to authenticated;

commit;

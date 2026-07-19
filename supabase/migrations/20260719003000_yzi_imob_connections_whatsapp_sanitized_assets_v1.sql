-- YZI IMOB - Connections RPC sanitized WhatsApp assets v1
--
-- Replaces the existing admin read projection without changing the already
-- applied foundation migration. The RPC still returns one Meta connection and
-- only a UI-safe allowlist for assets.

begin;

create or replace function public.get_yzi_imob_tenant_connections(p_tenant_id uuid)
returns table (
  id uuid,
  tenant_id uuid,
  provider text,
  catalog_id text,
  status text,
  granted_scopes text[],
  connected_by uuid,
  connected_at timestamptz,
  expires_at timestamptz,
  last_checked_at timestamptz,
  last_sync_at timestamptz,
  last_failure_at timestamptz,
  last_failure_reason text,
  created_at timestamptz,
  updated_at timestamptz,
  assets jsonb,
  capabilities jsonb
)
language plpgsql
security invoker
stable
set search_path to 'pg_catalog', 'public', 'auth'
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required.';
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

  return query
  select
    tc.id,
    tc.tenant_id,
    tc.provider,
    tc.catalog_id,
    tc.status,
    tc.granted_scopes,
    tc.connected_by,
    tc.connected_at,
    tc.expires_at,
    tc.last_checked_at,
    tc.last_sync_at,
    tc.last_failure_at,
    tc.last_failure_reason,
    tc.created_at,
    tc.updated_at,
    coalesce((
      select jsonb_agg(
        jsonb_strip_nulls(jsonb_build_object(
          'kind',
            case a.kind
              when 'page' then 'facebook_page'
              when 'instagram' then 'instagram_business'
              when 'ad_account' then 'meta_ad_account'
              else a.kind
            end,
          'account_label', a.account_label,
          'status', coalesce(a.metadata ->> 'status', a.metadata ->> 'provider_status'),
          'external_account_id',
            case
              when a.kind in ('whatsapp_business_account', 'waba', 'whatsapp_phone_number') then null
              else regexp_replace(a.external_account_id, '^(.{3}).*(.{2})$', '\1...\2')
            end,
          'revoked_at', a.revoked_at,
          'metadata',
            case
              when a.kind in ('whatsapp_business_account', 'waba') then jsonb_strip_nulls(jsonb_build_object(
                'provider_status', a.metadata ->> 'provider_status',
                'discovery_complete', a.metadata -> 'discovery_complete',
                'graph_confirmed', a.metadata -> 'graph_confirmed'
              ))
              when a.kind = 'whatsapp_phone_number' then jsonb_strip_nulls(jsonb_build_object(
                'verified_name', a.metadata ->> 'verified_name',
                'provider_status', a.metadata ->> 'provider_status',
                'code_verification_status', a.metadata ->> 'code_verification_status',
                'platform_type', a.metadata ->> 'platform_type',
                'discovery_complete', a.metadata -> 'discovery_complete'
              ))
              else jsonb_strip_nulls(jsonb_build_object(
                'normalized_kind',
                  case a.kind
                    when 'page' then 'facebook_page'
                    when 'instagram' then 'instagram_business'
                    when 'ad_account' then 'meta_ad_account'
                    else a.kind
                  end,
                'status', coalesce(a.metadata ->> 'status', a.metadata ->> 'provider_status'),
                'display_name', a.metadata ->> 'display_name',
                'health_reason', a.metadata ->> 'health_reason'
              ))
            end
        ))
        order by
          case a.kind
            when 'whatsapp_phone_number' then 1
            when 'whatsapp_business_account' then 2
            when 'waba' then 2
            else 3
          end,
          a.account_label nulls last,
          a.id
      )
      from public.tenant_connection_assets a
      where a.tenant_id = tc.tenant_id
        and a.connection_id = tc.id
        and a.revoked_at is null
    ), '[]'::jsonb) as assets,
    jsonb_build_array(
      jsonb_build_object(
        'capability_id', 'ler-metricas',
        'unlocked',
          tc.status in ('connected', 'token_expiring')
          and (
            (
              'pages_read_engagement' = any (tc.granted_scopes)
              and exists (
                select 1
                from public.tenant_connection_assets a
                where a.connection_id = tc.id
                  and a.revoked_at is null
                  and a.kind = 'page'
              )
            )
            or (
              'instagram_basic' = any (tc.granted_scopes)
              and exists (
                select 1
                from public.tenant_connection_assets a
                where a.connection_id = tc.id
                  and a.revoked_at is null
                  and a.kind = 'instagram'
              )
            )
            or (
              'ads_read' = any (tc.granted_scopes)
              and exists (
                select 1
                from public.tenant_connection_assets a
                where a.connection_id = tc.id
                  and a.revoked_at is null
                  and a.kind = 'ad_account'
              )
            )
          ),
        'source', 'derived'
      ),
      jsonb_build_object(
        'capability_id', 'acompanhar-campanhas',
        'unlocked',
          tc.status in ('connected', 'token_expiring')
          and 'ads_read' = any (tc.granted_scopes)
          and exists (
            select 1
            from public.tenant_connection_assets a
            where a.connection_id = tc.id
              and a.revoked_at is null
              and a.kind = 'ad_account'
          ),
        'source', 'derived'
      ),
      jsonb_build_object(
        'capability_id', 'publicar-conteudo',
        'unlocked',
          tc.status in ('connected', 'token_expiring')
          and (
            (
              'pages_manage_posts' = any (tc.granted_scopes)
              and exists (
                select 1
                from public.tenant_connection_assets a
                where a.connection_id = tc.id
                  and a.revoked_at is null
                  and a.kind = 'page'
              )
            )
            or (
              'instagram_content_publish' = any (tc.granted_scopes)
              and exists (
                select 1
                from public.tenant_connection_assets a
                where a.connection_id = tc.id
                  and a.revoked_at is null
                  and a.kind = 'instagram'
              )
            )
          ),
        'source', 'derived'
      ),
      jsonb_build_object(
        'capability_id', 'criar-anuncios',
        'unlocked',
          tc.status in ('connected', 'token_expiring')
          and 'ads_management' = any (tc.granted_scopes)
          and exists (
            select 1
            from public.tenant_connection_assets a
            where a.connection_id = tc.id
              and a.revoked_at is null
              and a.kind = 'ad_account'
          ),
        'source', 'derived'
      )
    ) as capabilities
  from public.tenant_connections tc
  where tc.tenant_id = p_tenant_id
    and tc.revoked_at is null
    and tc.status <> 'revoked'
  order by tc.provider, tc.catalog_id, tc.created_at;
end;
$$;

comment on function public.get_yzi_imob_tenant_connections(uuid) is
  'Admin-only read projection for YZI IMOB Connections. Returns UI-safe sanitized assets and never returns secret references, tokens, raw payloads, or internal metadata.';

commit;

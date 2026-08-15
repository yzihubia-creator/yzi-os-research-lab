begin;

-- Public Connection Registry projection for Metricool.
--
-- This does not add a new provider implementation. It normalizes the already
-- persisted official Metricool connection evidence into the public contract
-- consumed by Conexoes: auth_state, connection_state, health_state and
-- capability_snapshot.

drop function public.get_yzi_imob_tenant_connections(uuid);

create function public.get_yzi_imob_tenant_connections(p_tenant_id uuid)
returns table (
  id uuid,
  tenant_id uuid,
  provider text,
  catalog_id text,
  status text,
  auth_state text,
  connection_state text,
  health_state text,
  granted_scopes text[],
  capability_snapshot text[],
  connected_by uuid,
  connected_at timestamptz,
  expires_at timestamptz,
  last_checked_at timestamptz,
  last_sync_at timestamptz,
  last_failure_at timestamptz,
  last_failure_reason text,
  external_user_id text,
  external_blog_id text,
  display_name text,
  validated_at timestamptz,
  disconnected_at timestamptz,
  token_expires_at timestamptz,
  last_error_code text,
  created_at timestamptz,
  updated_at timestamptz,
  assets jsonb,
  capabilities jsonb,
  pending_publications bigint,
  recent_failures bigint
)
language plpgsql
security invoker
stable
set search_path to 'pg_catalog', 'public', 'auth'
as $function$
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
  with connection_rows as (
    select
      tc.*,
      case
        when tc.provider = 'metricool' then coalesce((
          select count(*)
          from public.yzi_imob_social_publications sp
          where sp.tenant_id = tc.tenant_id
            and sp.connection_id = tc.id
            and sp.status in ('queued', 'dispatching', 'accepted', 'scheduled', 'publishing')
        ), 0)::bigint
        else 0::bigint
      end as public_pending_publications,
      case
        when tc.provider = 'metricool' then coalesce((
          select count(*)
          from public.yzi_imob_social_publications sp
          where sp.tenant_id = tc.tenant_id
            and sp.connection_id = tc.id
            and sp.status = 'failed'
            and sp.failed_at >= now() - interval '7 days'
        ), 0)::bigint
        else 0::bigint
      end as public_recent_failures,
      case
        when tc.provider = 'metricool' then (
          select coalesce(array_agg(distinct mapped.capability), '{}'::text[])
          from unnest(tc.capabilities) raw(capability)
          cross join lateral (
            select case raw.capability
              when 'social_publish' then 'social_content_publish'
              when 'social_schedule' then 'social_content_schedule'
              when 'post_metrics' then 'social_metrics_read'
              when 'profile_metrics' then 'social_metrics_read'
              else raw.capability
            end as capability
          ) mapped
          where mapped.capability = any (array[
            'social_content_publish',
            'social_content_schedule',
            'social_metrics_read',
            'social_cancel',
            'post_status',
            'connection_validation',
            'profile_discovery'
          ]::text[])
        )
        else '{}'::text[]
      end as public_capability_snapshot
    from public.tenant_connections tc
    where tc.tenant_id = p_tenant_id
      and tc.revoked_at is null
      and tc.status <> 'revoked'
  ),
  normalized as (
    select
      cr.*,
      (
        cr.provider = 'metricool'
        and cr.status in ('active', 'connected')
        and cr.external_user_id is not null
        and cr.external_blog_id is not null
        and cr.vault_secret_id is not null
        and cr.validated_at is not null
      ) as metricool_authorized,
      (
        cr.provider = 'metricool'
        and cr.status in ('active', 'connected')
        and cr.external_user_id is not null
        and cr.external_blog_id is not null
        and cr.vault_secret_id is not null
        and cr.validated_at is not null
        and cardinality(cr.public_capability_snapshot) > 0
        and cr.last_error_code is null
        and cr.public_recent_failures = 0
      ) as metricool_healthy
    from connection_rows cr
  )
  select
    n.id,
    n.tenant_id,
    n.provider,
    n.catalog_id,
    n.status,
    case
      when n.provider = 'metricool' and n.token_expires_at is not null and n.token_expires_at <= now() then 'expired'
      when n.provider = 'metricool' and n.status = 'token_invalid' then 'refresh_failed'
      when n.provider = 'metricool' and n.status in ('validating', 'pending_validation') then 'pending'
      when n.provider = 'metricool' and n.metricool_authorized then 'authorized'
      when n.provider = 'metricool' then 'not_authorized'
      when n.status in ('connected', 'token_expiring') then 'authorized'
      when n.status in ('awaiting_account_selection') then 'pending'
      when n.status = 'revoked' then 'revoked'
      else 'not_authorized'
    end as auth_state,
    case
      when n.provider = 'metricool' and n.metricool_healthy then 'ready'
      when n.provider = 'metricool' and n.status in ('validating', 'pending_validation') then 'connecting'
      when n.provider = 'metricool' and n.status in ('configuration_required') then 'awaiting_authorization'
      when n.provider = 'metricool' and n.status in ('token_invalid', 'plan_insufficient', 'rate_limited', 'failed', 'attention_required') then 'needs_attention'
      when n.provider = 'metricool' then 'not_connected'
      when n.status in ('connected', 'token_expiring') then 'ready'
      when n.status in ('awaiting_account_selection') then 'awaiting_authorization'
      when n.status in ('provider_error', 'reconnect_required', 'insufficient_permissions') then 'needs_attention'
      else 'not_connected'
    end as connection_state,
    case
      when n.provider = 'metricool' and n.metricool_healthy then 'healthy'
      when n.provider = 'metricool' and n.status in ('token_invalid', 'plan_insufficient', 'rate_limited', 'failed', 'attention_required') then 'degraded'
      when n.provider = 'metricool' then 'unknown'
      when n.status in ('connected', 'token_expiring') then 'healthy'
      when n.status in ('provider_error', 'reconnect_required', 'insufficient_permissions') then 'degraded'
      else 'unknown'
    end as health_state,
    n.granted_scopes,
    n.public_capability_snapshot,
    n.connected_by,
    n.connected_at,
    n.expires_at,
    n.last_checked_at,
    n.last_sync_at,
    n.last_failure_at,
    n.last_failure_reason,
    n.external_user_id,
    n.external_blog_id,
    n.account_display_name,
    n.validated_at,
    n.disconnected_at,
    n.token_expires_at,
    n.last_error_code,
    n.created_at,
    n.updated_at,
    case
      when n.provider = 'metricool' then coalesce((
        select jsonb_agg(
          jsonb_strip_nulls(jsonb_build_object(
            'id', a.id,
            'kind', a.kind,
            'external_account_id', a.external_account_id,
            'account_label', a.account_label,
            'network', a.metadata ->> 'network',
            'created_at', a.created_at,
            'updated_at', a.updated_at
          ))
          order by a.kind, a.account_label nulls last, a.id
        )
        from public.tenant_connection_assets a
        where a.tenant_id = n.tenant_id
          and a.connection_id = n.id
          and a.revoked_at is null
      ), '[]'::jsonb)
      else coalesce((
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
                when a.kind in ('whatsapp_business_account', 'waba') then jsonb_strip_nulls(
                  jsonb_build_object(
                    'provider_status', a.metadata ->> 'provider_status',
                    'discovery_complete', a.metadata -> 'discovery_complete',
                    'graph_confirmed', a.metadata -> 'graph_confirmed'
                  )
                )
                when a.kind = 'whatsapp_phone_number' then jsonb_strip_nulls(
                  jsonb_build_object(
                    'verified_name', a.metadata ->> 'verified_name',
                    'provider_status', a.metadata ->> 'provider_status',
                    'code_verification_status', a.metadata ->> 'code_verification_status',
                    'platform_type', a.metadata ->> 'platform_type',
                    'discovery_complete', a.metadata -> 'discovery_complete'
                  )
                )
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
        where a.tenant_id = n.tenant_id
          and a.connection_id = n.id
          and a.revoked_at is null
      ), '[]'::jsonb)
    end as assets,
    case
      when n.provider = 'metricool' then coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'capability_id', capability,
            'unlocked', n.metricool_healthy,
            'source', 'validated'
          )
          order by capability
        )
        from unnest(n.capabilities) capability
      ), '[]'::jsonb)
      else jsonb_build_array(
        jsonb_build_object(
          'capability_id', 'ler-metricas',
          'unlocked',
            n.status in ('connected', 'token_expiring')
            and (
              (
                'pages_read_engagement' = any (n.granted_scopes)
                and exists (
                  select 1 from public.tenant_connection_assets a
                  where a.connection_id = n.id and a.revoked_at is null and a.kind = 'page'
                )
              )
              or (
                'instagram_basic' = any (n.granted_scopes)
                and exists (
                  select 1 from public.tenant_connection_assets a
                  where a.connection_id = n.id and a.revoked_at is null and a.kind = 'instagram'
                )
              )
              or (
                'ads_read' = any (n.granted_scopes)
                and exists (
                  select 1 from public.tenant_connection_assets a
                  where a.connection_id = n.id and a.revoked_at is null and a.kind = 'ad_account'
                )
              )
            ),
          'source', 'derived'
        ),
        jsonb_build_object(
          'capability_id', 'acompanhar-campanhas',
          'unlocked',
            n.status in ('connected', 'token_expiring')
            and 'ads_read' = any (n.granted_scopes)
            and exists (
              select 1 from public.tenant_connection_assets a
              where a.connection_id = n.id and a.revoked_at is null and a.kind = 'ad_account'
            ),
          'source', 'derived'
        ),
        jsonb_build_object(
          'capability_id', 'publicar-conteudo',
          'unlocked',
            n.status in ('connected', 'token_expiring')
            and (
              (
                'pages_manage_posts' = any (n.granted_scopes)
                and exists (
                  select 1 from public.tenant_connection_assets a
                  where a.connection_id = n.id and a.revoked_at is null and a.kind = 'page'
                )
              )
              or (
                'instagram_content_publish' = any (n.granted_scopes)
                and exists (
                  select 1 from public.tenant_connection_assets a
                  where a.connection_id = n.id and a.revoked_at is null and a.kind = 'instagram'
                )
              )
            ),
          'source', 'derived'
        ),
        jsonb_build_object(
          'capability_id', 'criar-anuncios',
          'unlocked',
            n.status in ('connected', 'token_expiring')
            and 'ads_management' = any (n.granted_scopes)
            and exists (
              select 1 from public.tenant_connection_assets a
              where a.connection_id = n.id and a.revoked_at is null and a.kind = 'ad_account'
            ),
          'source', 'derived'
        )
      )
    end as capabilities,
    n.public_pending_publications,
    n.public_recent_failures
  from normalized n
  order by n.provider, n.catalog_id, n.created_at;
end;
$function$;

comment on function public.get_yzi_imob_tenant_connections(uuid) is
  'Admin-only public Connection Registry projection for YZI IMOB. Metricool active requires persisted auth identity, validation probe evidence, discovered capabilities and healthy recent runtime state.';

revoke all on function public.get_yzi_imob_tenant_connections(uuid)
from public, anon, authenticated;

grant execute on function public.get_yzi_imob_tenant_connections(uuid)
to authenticated;

commit;

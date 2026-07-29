-- Restore the authenticated SECURITY INVOKER read contract after the
-- Metricool projection added UI-safe columns to tenant_connections.

begin;

grant select (
  capabilities,
  external_user_id,
  external_blog_id,
  account_display_name,
  validated_at,
  disconnected_at,
  token_expires_at,
  last_error_code
) on public.tenant_connections to authenticated;

revoke all on function public.get_yzi_imob_tenant_connections(uuid)
from public, anon, authenticated;

grant execute on function public.get_yzi_imob_tenant_connections(uuid)
to authenticated;

commit;

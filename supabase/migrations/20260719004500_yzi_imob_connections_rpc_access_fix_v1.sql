-- YZI IMOB - Connections RPC access fix v1
--
-- Keep get_yzi_imob_tenant_connections as SECURITY INVOKER. The sanitized
-- WhatsApp projection reads tenant_connection_assets.metadata internally, so
-- authenticated needs column-level SELECT for the RPC to execute under RLS.

begin;

grant select (
  metadata
) on public.tenant_connection_assets to authenticated;

revoke all on function public.get_yzi_imob_tenant_connections(uuid)
from public, anon, authenticated;

grant execute on function public.get_yzi_imob_tenant_connections(uuid)
to authenticated;

commit;

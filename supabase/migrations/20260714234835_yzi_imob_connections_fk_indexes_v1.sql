create index if not exists connection_audit_events_actor_user_id_idx
  on public.connection_audit_events (actor_user_id);

create index if not exists connection_audit_events_connection_fk_idx
  on public.connection_audit_events (connection_id, tenant_id);

create index if not exists connection_authorizations_user_id_idx
  on public.connection_authorizations (user_id);

create index if not exists tenant_connection_assets_connection_fk_idx
  on public.tenant_connection_assets (connection_id, tenant_id, provider);

create index if not exists tenant_connections_vault_secret_id_idx
  on public.tenant_connections (vault_secret_id);

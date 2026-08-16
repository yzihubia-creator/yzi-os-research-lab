begin;

alter table yzi_imob_mcp_private.connections
  add constraint yzi_imob_mcp_connections_kind_check_canva
  check (
    connection_kind in ('metricool', 'higgsfield', 'canva')
    and endpoint_key = connection_kind
  ) not valid;

alter table yzi_imob_mcp_private.connections
  validate constraint yzi_imob_mcp_connections_kind_check_canva;

alter table yzi_imob_mcp_private.connections
  drop constraint yzi_imob_mcp_connections_kind_check;

alter table yzi_imob_mcp_private.connections
  rename constraint yzi_imob_mcp_connections_kind_check_canva
  to yzi_imob_mcp_connections_kind_check;

commit;

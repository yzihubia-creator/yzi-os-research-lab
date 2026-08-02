begin;

grant execute on function yzi_imob_mcp_private.is_safe_metadata(jsonb)
  to yzi_imob_mcp_executor;

commit;

-- O regex anterior usava {1,1900}, acima do limite de repetição (255) do
-- motor de regex do Postgres: toda inserção em authorization_attempts falhava
-- com 2201B (invalid repetition count). O limite de tamanho vira length() e o
-- check passa a espelhar o contrato do runtime (readAppOrigin): https, ou
-- http apenas para localhost/127.0.0.1 em desenvolvimento.
alter table yzi_imob_mcp_private.authorization_attempts
  drop constraint yzi_imob_mcp_authorization_attempts_callback_check;

alter table yzi_imob_mcp_private.authorization_attempts
  add constraint yzi_imob_mcp_authorization_attempts_callback_check
  check (
    length(callback_url) <= 1900
    and (
      callback_url ~ '^https://[^[:space:]]+$'
      or callback_url ~ '^http://(localhost|127\.0\.0\.1)(:[0-9]+)?/[^[:space:]]*$'
    )
  );

begin;

-- Correção de paridade com o histórico remoto.
--
-- A primeira aplicação de `yzi_imob_property_media_governed_lifecycle_v1`
-- escreveu a policy de DELETE com `name` não qualificado. Como a policy passou
-- a fazer join com `public.tenants`, o Postgres resolveu esse identificador
-- como `tenants.name` em vez de `storage.objects.name`. O efeito era
-- fail-closed (nenhum objeto casava, nada era apagado indevidamente), mas o
-- predicado estava semanticamente errado.
--
-- O arquivo da migration anterior já foi corrigido; esta existe para que o
-- histórico local reflita o que foi aplicado remotamente.

drop policy if exists yzi_imob_source_media_delete_cancelled on storage.objects;
create policy yzi_imob_source_media_delete_cancelled
  on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'yzi-imob-source-media'
    and exists (
      select 1
      from public.yzi_imob_property_media m
      join public.tenant_memberships tm
        on tm.tenant_id = m.tenant_id
       and tm.user_id = auth.uid()
       and tm.status = 'active'
       and tm.role = any (array['owner','admin','operator']::text[])
      join public.tenants tn
        on tn.id = m.tenant_id
       and tn.status = 'active'
      where m.storage_bucket = objects.bucket_id
        and m.storage_path = objects.name
        and m.source_kind = 'original_upload'
        and m.upload_state = any (array['cancelled','failed','removed']::text[])
    )
  );

commit;

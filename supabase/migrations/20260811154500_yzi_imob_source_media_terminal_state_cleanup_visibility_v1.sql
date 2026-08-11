begin;

-- Sem esta correção, a remoção governada deixa arquivo órfão no bucket.
--
-- A policy de SELECT de `storage.objects` só enxergava objetos cuja mídia
-- estivesse em `upload_state = 'completed'`. Assim que a remoção marca a linha
-- como `removed`, o objeto some da visão do usuário — e a Storage API, que
-- localiza o objeto antes de apagá-lo, responde "não encontrado". A policy de
-- DELETE nunca chega a ser avaliada e o arquivo privado fica para trás.
--
-- A visibilidade dos estados terminais é concedida exatamente a quem já pode
-- apagar (owner/admin/operator ativo do tenant dono da mídia), e apenas para
-- esses estados. A leitura do acervo vivo — a que gera as prévias assinadas —
-- continua idêntica: `completed`, para qualquer membro ativo do tenant.

drop policy if exists yzi_imob_source_media_select_member on storage.objects;
create policy yzi_imob_source_media_select_member
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'yzi-imob-source-media'
    and (
      exists (
        select 1
        from public.yzi_imob_property_media m
        join public.tenant_memberships tm
          on tm.tenant_id = m.tenant_id
         and tm.user_id = auth.uid()
         and tm.status = 'active'
        where m.storage_bucket = objects.bucket_id
          and m.storage_path = objects.name
          and m.source_kind = 'original_upload'
          and m.upload_state = 'completed'
      )
      or exists (
        -- Janela de limpeza: só os papéis operacionais, só estados terminais.
        select 1
        from public.yzi_imob_property_media m
        join public.tenant_memberships tm
          on tm.tenant_id = m.tenant_id
         and tm.user_id = auth.uid()
         and tm.status = 'active'
         and tm.role = any (array['owner','admin','operator']::text[])
        where m.storage_bucket = objects.bucket_id
          and m.storage_path = objects.name
          and m.source_kind = 'original_upload'
          and m.upload_state = any (array['cancelled','failed','removed']::text[])
      )
    )
  );

commit;

-- chat-media: public → PRIVATE. Özel mesaj medyası artık URL ile herkese açık değil;
-- yalnızca konuşmanın katılımcıları imzalı (signed) URL ile erişebilir.
-- Yeni dosya yolu düzeni: {conversationId}/{...}. RLS ilk klasörü (conversationId)
-- konuşma katılımcılığıyla eşler.

update storage.buckets set public = false where id = 'chat-media';

-- Katılımcı kontrolü (storage RLS içinden conversations RLS'ine takılmamak için security definer).
create or replace function public.is_chat_media_participant(object_name text)
returns boolean
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  conv_id uuid;
begin
  begin
    conv_id := (split_part(object_name, '/', 1))::uuid;
  exception when others then
    return false;
  end;
  return exists (
    select 1 from public.conversations c
    where c.id = conv_id
      and (c.seeker_id = auth.uid() or c.host_id = auth.uid())
  );
end;
$$;
revoke all on function public.is_chat_media_participant(text) from public;
grant execute on function public.is_chat_media_participant(text) to authenticated;

-- Eski public politikaları kaldır, katılımcı bazlı yenilerini kur.
drop policy if exists "chat-media: read public" on storage.objects;
drop policy if exists "chat-media: owner insert" on storage.objects;
drop policy if exists "chat-media: owner delete" on storage.objects;

drop policy if exists "chat-media: participant read" on storage.objects;
create policy "chat-media: participant read"
  on storage.objects for select to authenticated
  using (bucket_id = 'chat-media' and public.is_chat_media_participant(name));

drop policy if exists "chat-media: participant insert" on storage.objects;
create policy "chat-media: participant insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'chat-media' and public.is_chat_media_participant(name));

drop policy if exists "chat-media: participant delete" on storage.objects;
create policy "chat-media: participant delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'chat-media' and public.is_chat_media_participant(name));

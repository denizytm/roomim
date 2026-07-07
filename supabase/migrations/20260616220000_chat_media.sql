-- Sohbette görsel + sesli mesaj desteği.
-- messages'a ek alanlar; body artık boş olabilir (ek varsa).
alter table public.messages
  add column if not exists attachment_url text,
  add column if not exists attachment_type text; -- 'image' | 'audio'

-- Sohbet medyası için public-read bucket (avatars/listing-photos ile aynı desen).
insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do nothing;

drop policy if exists "chat-media: read public" on storage.objects;
create policy "chat-media: read public"
  on storage.objects for select using (bucket_id = 'chat-media');

drop policy if exists "chat-media: owner insert" on storage.objects;
create policy "chat-media: owner insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'chat-media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "chat-media: owner delete" on storage.objects;
create policy "chat-media: owner delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'chat-media' and (storage.foldername(name))[1] = auth.uid()::text);

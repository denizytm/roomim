-- App Store Review gereklilikleri:
--   • Guideline 1.2 (UGC)      → kullanıcıyı engelleme
--   • Guideline 5.1.1(v)       → uygulama içinden hesap silme
--
-- Engelleme çift yönlüdür: A, B'yi engellerse ikisi de birbirinin ilanını ve
-- konuşmasını göremez, yeni mesaj gönderemez. Profiller görünür kalır — aksi
-- halde "engellenenler" listesinde isim gösterilemez.

-- ---------------------------------------------------------------------------
-- blocks
-- ---------------------------------------------------------------------------
create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);

create index if not exists blocks_blocked_idx on public.blocks (blocked_id);

alter table public.blocks enable row level security;

drop policy if exists "blocks: owner read" on public.blocks;
create policy "blocks: owner read"
  on public.blocks for select to authenticated
  using (blocker_id = auth.uid());

drop policy if exists "blocks: owner insert" on public.blocks;
create policy "blocks: owner insert"
  on public.blocks for insert to authenticated
  with check (blocker_id = auth.uid());

drop policy if exists "blocks: owner delete" on public.blocks;
create policy "blocks: owner delete"
  on public.blocks for delete to authenticated
  using (blocker_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Yardımcılar
-- ---------------------------------------------------------------------------
-- security definer şart: politika içinden public.blocks'a bakarken blocks'un
-- kendi RLS'i devreye girer ve ters yöndeki kaydı (karşı taraf beni engellemiş)
-- gizlerdi.
create or replace function public.is_blocked(target uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.blocks b
    where (b.blocker_id = auth.uid() and b.blocked_id = target)
       or (b.blocker_id = target and b.blocked_id = auth.uid())
  );
$$;
revoke all on function public.is_blocked(uuid) from public;
grant execute on function public.is_blocked(uuid) to authenticated;

-- Konuşmanın karşı tarafıyla aramda engel var mı?
create or replace function public.conversation_blocked(conv uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.conversations c
    join public.blocks b
      on (b.blocker_id = auth.uid()
          and b.blocked_id = case when c.seeker_id = auth.uid() then c.host_id else c.seeker_id end)
      or (b.blocked_id = auth.uid()
          and b.blocker_id = case when c.seeker_id = auth.uid() then c.host_id else c.seeker_id end)
    where c.id = conv
  );
$$;
revoke all on function public.conversation_blocked(uuid) from public;
grant execute on function public.conversation_blocked(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Engel filtreleri — restrictive: mevcut permissive politikalarla OR'lanmaz,
-- AND'lenir. Böylece "admin manage" gibi geniş politikalar engeli delemez.
-- ---------------------------------------------------------------------------
drop policy if exists "listings: hide blocked" on public.listings;
create policy "listings: hide blocked"
  on public.listings as restrictive for select to authenticated
  using (
    owner_id = auth.uid()
    or public.is_admin()                -- moderasyon paneli her ilanı görmeli
    or not public.is_blocked(owner_id)
  );

drop policy if exists "conversations: hide blocked" on public.conversations;
create policy "conversations: hide blocked"
  on public.conversations as restrictive for select to authenticated
  using (
    not public.is_blocked(
      case when seeker_id = auth.uid() then host_id else seeker_id end
    )
  );

-- Engellenen tarafla yeni konuşma açılamaz.
drop policy if exists "conversations: block guard insert" on public.conversations;
create policy "conversations: block guard insert"
  on public.conversations as restrictive for insert to authenticated
  with check (not public.is_blocked(host_id));

-- Mesaj okuma/gönderme. Mevcut politikalar zaten conversations üzerinden
-- geçtiği için dolaylı olarak kapanır; niyeti açık bırakmak için doğrudan da
-- yazıyoruz — güvenlik kontrolü örtük davranışa bırakılmamalı.
drop policy if exists "messages: hide blocked" on public.messages;
create policy "messages: hide blocked"
  on public.messages as restrictive for select to authenticated
  using (not public.conversation_blocked(conversation_id));

drop policy if exists "messages: block guard insert" on public.messages;
create policy "messages: block guard insert"
  on public.messages as restrictive for insert to authenticated
  with check (not public.conversation_blocked(conversation_id));

-- ---------------------------------------------------------------------------
-- Hesap silme (Guideline 5.1.1(v))
-- ---------------------------------------------------------------------------
-- auth.users silinince profiles → listings → listing_photos / conversations /
-- messages / reports / blocks FK cascade ile temizlenir. Storage cascade'e
-- dahil değildir, dosyaları elle siliyoruz.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  delete from storage.objects
   where bucket_id in ('avatars', 'listing-photos', 'chat-media')
     and (storage.foldername(name))[1] = uid::text;

  delete from auth.users where id = uid;
end;
$$;
revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

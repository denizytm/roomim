-- Eşleşme + mesajlaşma.
-- Akış: ev arayan ilana ilgi gösterir (conversation 'pending') → ev sahibi onaylar
-- ('accepted') → her iki taraf mesajlaşabilir. Mesajlar realtime yayınlanır.

create type public.conversation_status as enum ('pending', 'accepted', 'declined');

create table public.conversations (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  seeker_id  uuid not null references public.profiles(id) on delete cascade,
  host_id    uuid not null references public.profiles(id) on delete cascade,
  status     public.conversation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, seeker_id)
);

create index conversations_seeker_idx on public.conversations (seeker_id);
create index conversations_host_idx on public.conversations (host_id);

create trigger trg_conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  body            text not null,
  created_at      timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Sadece taraflar görebilir
create policy "conversations: participants read"
  on public.conversations for select to authenticated
  using (seeker_id = auth.uid() or host_id = auth.uid());

-- Ev arayan başlatır (kendi adına, kendi ilanına değil)
create policy "conversations: seeker insert"
  on public.conversations for insert to authenticated
  with check (seeker_id = auth.uid() and seeker_id <> host_id);

-- Ev sahibi onaylar/reddeder
create policy "conversations: host update"
  on public.conversations for update to authenticated
  using (host_id = auth.uid()) with check (host_id = auth.uid());

-- Mesajları sadece taraflar okur
create policy "messages: participant read"
  on public.messages for select to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.seeker_id = auth.uid() or c.host_id = auth.uid())
  ));

-- Mesaj göndermek için: taraf olmak + konuşma 'accepted' + gönderen = kendisi
create policy "messages: participant insert"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and c.status = 'accepted'
        and (c.seeker_id = auth.uid() or c.host_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;

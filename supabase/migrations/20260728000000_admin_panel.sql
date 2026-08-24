-- Kapsamlı yönetim paneli: kullanıcı listeleme (email dahil), uyarı gönderme.
-- is_admin() moderation migration'ında tanımlı.

-- ---------------------------------------------------------------------------
-- user_warnings — admin'in kullanıcıya gönderdiği uyarı mesajları
-- ---------------------------------------------------------------------------
create table if not exists public.user_warnings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  admin_id   uuid references public.profiles(id) on delete set null,
  listing_id uuid references public.listings(id) on delete set null,
  message    text not null,
  created_at timestamptz not null default now(),
  read_at    timestamptz
);
create index if not exists user_warnings_user_idx on public.user_warnings (user_id, read_at);

alter table public.user_warnings enable row level security;

-- Kullanıcı kendi uyarılarını görür; admin hepsini görür
drop policy if exists "warnings: read" on public.user_warnings;
create policy "warnings: read" on public.user_warnings for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Kullanıcı kendi uyarısını "okundu" işaretleyebilir
drop policy if exists "warnings: owner update" on public.user_warnings;
create policy "warnings: owner update" on public.user_warnings for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Uyarı ekleme yalnızca admin
drop policy if exists "warnings: admin insert" on public.user_warnings;
create policy "warnings: admin insert" on public.user_warnings for insert to authenticated
  with check (public.is_admin());

-- Admin: kullanıcıya uyarı gönder (opsiyonel ilan bağlamı)
create or replace function public.admin_warn_user(target uuid, msg text, lst uuid default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if length(coalesce(btrim(msg), '')) < 3 then raise exception 'message too short'; end if;
  insert into public.user_warnings (user_id, admin_id, listing_id, message)
  values (target, auth.uid(), lst, btrim(msg));
end;
$$;
grant execute on function public.admin_warn_user(uuid, text, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- admin_list_users — email dahil kullanıcı dizini (auth.users join)
-- Anon RLS auth.users'ı okuyamaz; bu yüzden security definer RPC.
-- ---------------------------------------------------------------------------
create or replace function public.admin_list_users(search text default '', filter text default 'all')
returns table (
  id uuid,
  full_name text,
  email text,
  university text,
  role text,
  is_admin boolean,
  banned boolean,
  banned_until timestamptz,
  points int,
  member_no int,
  created_at timestamptz,
  listing_count bigint,
  report_count bigint
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    p.id,
    p.full_name,
    u.email::text,
    uni.name as university,
    p.role::text,
    p.is_admin,
    p.banned,
    p.banned_until,
    p.points,
    p.member_no,
    p.created_at,
    (select count(*) from public.listings l where l.owner_id = p.id) as listing_count,
    (select count(*) from public.reports r where r.reported_user_id = p.id) as report_count
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.universities uni on uni.id = p.university_id
  where public.is_admin()
    and (
      search = ''
      or p.full_name ilike '%' || search || '%'
      or u.email ilike '%' || search || '%'
    )
    and (
      filter = 'all'
      or (filter = 'banned'  and p.banned = true)
      or (filter = 'admins'  and p.is_admin = true)
      or (filter = 'hosts'   and p.role = 'host')
      or (filter = 'seekers' and p.role = 'seeker')
    )
  order by p.created_at desc
  limit 300;
$$;
grant execute on function public.admin_list_users(text, text) to authenticated;

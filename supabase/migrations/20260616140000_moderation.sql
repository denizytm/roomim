-- Güvenlik & Moderasyon: şikayet sistemi, ban, basit moderasyon paneli desteği.

alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists banned boolean not null default false;

-- Banlı edu mail'ler: aynı mail ile tekrar kayıt engeli
create table if not exists public.banned_emails (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- Şikayetler
create table if not exists public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  listing_id       uuid references public.listings(id) on delete set null,
  reason           text not null,
  status           text not null default 'open',  -- open | reviewed | dismissed
  created_at       timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports (status);

-- Admin mi? (RLS politikalarında kullanılır)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

alter table public.reports enable row level security;
alter table public.banned_emails enable row level security;

create policy "reports: reporter insert"
  on public.reports for insert to authenticated
  with check (reporter_id = auth.uid());
create policy "reports: admin read"
  on public.reports for select to authenticated
  using (public.is_admin());
create policy "reports: admin update"
  on public.reports for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Adminler herhangi bir profili güncelleyebilir (ban için)
drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles"
  on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Banlama: profili banla + mail'i blokla + ilgili şikayetleri kapat
create or replace function public.ban_user(target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  update public.profiles set banned = true where id = target;
  insert into public.banned_emails (email)
    select lower(email) from auth.users where id = target
    on conflict do nothing;
  update public.reports set status = 'reviewed'
    where reported_user_id = target and status = 'open';
end;
$$;
grant execute on function public.ban_user(uuid) to authenticated;

-- handle_new_user: ban'lı mail kontrolü eklendi (diğer mantık korunur)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_domain        text;
  v_university_id uuid;
  v_ref           text;
  v_owner         uuid;
  i               int;
begin
  if exists (select 1 from public.banned_emails where email = lower(new.email)) then
    raise exception 'BANNED_EMAIL: bu e-posta engellenmis' using errcode = 'check_violation';
  end if;

  v_domain := lower(split_part(new.email, '@', 2));
  select id into v_university_id
  from public.universities where v_domain = any (domains) limit 1;

  if v_university_id is null then
    raise exception 'EDU_EMAIL_REQUIRED: % tanimli bir universite uzantisi degil', v_domain
      using errcode = 'check_violation';
  end if;

  insert into public.profiles (id, university_id, full_name, role, member_no)
  values (
    new.id, v_university_id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case when new.raw_user_meta_data ->> 'role' in ('host', 'seeker')
         then (new.raw_user_meta_data ->> 'role')::public.user_role else null end,
    nextval('public.profiles_member_no_seq')
  );

  for i in 1..10 loop
    insert into public.referral_codes (code, owner_id)
    values (upper(substr(md5(random()::text || clock_timestamp()::text || i::text), 1, 8)), new.id)
    on conflict (code) do nothing;
  end loop;

  v_ref := upper(nullif(new.raw_user_meta_data ->> 'referral_code', ''));
  if v_ref is not null then
    update public.referral_codes set used_by = new.id, used_at = now()
      where code = v_ref and used_by is null returning owner_id into v_owner;
    if v_owner is not null then
      update public.profiles set points = points + 1 where id = v_owner;
    end if;
  end if;

  return new;
end;
$$;

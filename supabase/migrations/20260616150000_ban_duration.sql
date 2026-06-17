-- Süreli ban: banned_until (null = süresiz). Etkin ban = banned and (banned_until is null or > now()).
-- ban_user artık ilanları kapatmıyor; gizleme uygulama tarafında etkin-ban filtresiyle yapılır
-- (böylece süreli ban dolunca ilanlar otomatik geri döner).

alter table public.profiles add column if not exists banned_until timestamptz;

drop function if exists public.ban_user(uuid);

create or replace function public.ban_user(target uuid, until timestamptz default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update public.profiles set banned = true, banned_until = until where id = target;
  update public.reports set status = 'reviewed'
    where reported_user_id = target and status = 'open';
end;
$$;
grant execute on function public.ban_user(uuid, timestamptz) to authenticated;

create or replace function public.unban_user(target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update public.profiles set banned = false, banned_until = null where id = target;
end;
$$;
grant execute on function public.unban_user(uuid) to authenticated;

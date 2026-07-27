-- handle_new_user() regresyonu düzeltmesi.
--
-- 20260616230000_accept_all_edu_tr.sql fonksiyonu create or replace ile baştan
-- yazarken önceki iki migration'daki üç bloğu taşımadı:
--   • banned_emails kontrolü (20260616140000_moderation)  → ban aşılabiliyordu
--   • member_no ataması      (20260616130000_loyalty)     → null kalıyordu
--   • referans kodu üretimi + kullanımı (aynı migration)  → kod üretilmiyordu
--
-- Aşağıda üçü geri konuyor; .edu.tr genişletmesi (bilinmeyen domain'den
-- üniversite türetme) olduğu gibi korunuyor.

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
  -- Banlanan e-posta tekrar kayıt olamaz.
  if exists (select 1 from public.banned_emails where email = lower(new.email)) then
    raise exception 'BANNED_EMAIL: bu e-posta engellenmis' using errcode = 'check_violation';
  end if;

  v_domain := lower(split_part(new.email, '@', 2));

  -- 1) Bilinen üniversite (tam domain eşleşmesi — seed'deki güzel isimler öncelikli)
  select id into v_university_id
  from public.universities
  where v_domain = any (domains)
  limit 1;

  -- 2) Bilinmiyor ama .edu.tr ise → domain'den isim türetip otomatik oluştur.
  --    Alt alan adları da desteklenir (ör. std.yildiz.edu.tr -> "Yildiz").
  if v_university_id is null and v_domain like '%.edu.tr' then
    insert into public.universities (name, city, domains)
    values (
      initcap(split_part(regexp_replace(v_domain, '\.edu\.tr$', ''), '.', -1)),
      '',
      array[v_domain]
    )
    returning id into v_university_id;
  end if;

  -- 3) Hâlâ yoksa: .edu.tr değil → reddet.
  if v_university_id is null then
    raise exception 'EDU_EMAIL_REQUIRED: % universite (.edu.tr) uzantisi degil', v_domain
      using errcode = 'check_violation';
  end if;

  insert into public.profiles (id, university_id, full_name, role, member_no)
  values (
    new.id,
    v_university_id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'role' in ('host', 'seeker')
        then (new.raw_user_meta_data ->> 'role')::public.user_role
      else null
    end,
    nextval('public.profiles_member_no_seq')
  );

  -- 10 referans kodu üret
  for i in 1..10 loop
    insert into public.referral_codes (code, owner_id)
    values (upper(substr(md5(random()::text || clock_timestamp()::text || i::text), 1, 8)), new.id)
    on conflict (code) do nothing;
  end loop;

  -- Kayıtta referans kodu kullanıldıysa: kodun sahibine +1 puan
  v_ref := upper(nullif(new.raw_user_meta_data ->> 'referral_code', ''));
  if v_ref is not null then
    update public.referral_codes
      set used_by = new.id, used_at = now()
      where code = v_ref and used_by is null
      returning owner_id into v_owner;
    if v_owner is not null then
      update public.profiles set points = points + 1 where id = v_owner;
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Regresyon süresince kayıt olanları onar
-- ---------------------------------------------------------------------------

-- member_no'su boş kalanlara sıradan devam eden numara ver.
with ordered as (
  select id,
         row_number() over (order by created_at)
           + coalesce((select max(member_no) from public.profiles), 0) as rn
  from public.profiles
  where member_no is null
)
update public.profiles p set member_no = o.rn from ordered o where p.id = o.id;

select setval('public.profiles_member_no_seq',
              coalesce((select max(member_no) from public.profiles), 0) + 1, false);

-- Hiç referans kodu olmayanlara 10'ar kod üret.
do $$
declare r record; i int;
begin
  for r in select id from public.profiles loop
    if not exists (select 1 from public.referral_codes where owner_id = r.id) then
      for i in 1..10 loop
        insert into public.referral_codes (code, owner_id)
        values (upper(substr(md5(random()::text || clock_timestamp()::text || r.id::text || i::text), 1, 8)), r.id)
        on conflict (code) do nothing;
      end loop;
    end if;
  end loop;
end $$;

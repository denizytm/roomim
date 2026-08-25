-- Kayıt onayı (KVKK/sözleşme) kayıtları.
-- terms_* : Kullanıcı Sözleşmesi + Gizlilik + KVKK aydınlatma kabulü (zorunlu)
-- marketing_* : kampanya e-postası açık rızası (opsiyonel)

alter table public.profiles
  add column if not exists terms_version         text,
  add column if not exists terms_accepted_at     timestamptz,
  add column if not exists marketing_consent     boolean not null default false,
  add column if not exists marketing_consent_at  timestamptz;

-- handle_new_user: mevcut mantık korunur; profil oluşturulurken rıza alanları eklenir.
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
  v_terms         text;
  v_marketing     boolean;
begin
  if exists (select 1 from public.banned_emails where email = lower(new.email)) then
    raise exception 'BANNED_EMAIL: bu e-posta engellenmis' using errcode = 'check_violation';
  end if;

  v_domain := lower(split_part(new.email, '@', 2));

  select id into v_university_id
  from public.universities
  where v_domain = any (domains)
  limit 1;

  if v_university_id is null and v_domain like '%.edu.tr' then
    insert into public.universities (name, city, domains)
    values (
      initcap(split_part(regexp_replace(v_domain, '\.edu\.tr$', ''), '.', -1)),
      '',
      array[v_domain]
    )
    returning id into v_university_id;
  end if;

  if v_university_id is null then
    raise exception 'EDU_EMAIL_REQUIRED: % universite (.edu.tr) uzantisi degil', v_domain
      using errcode = 'check_violation';
  end if;

  v_terms := nullif(new.raw_user_meta_data ->> 'terms_version', '');
  v_marketing := (new.raw_user_meta_data ->> 'marketing_consent') = 'true';

  insert into public.profiles (
    id, university_id, full_name, role, member_no,
    terms_version, terms_accepted_at, marketing_consent, marketing_consent_at
  )
  values (
    new.id,
    v_university_id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'role' in ('host', 'seeker')
        then (new.raw_user_meta_data ->> 'role')::public.user_role
      else null
    end,
    nextval('public.profiles_member_no_seq'),
    v_terms,
    case when v_terms is not null then now() else null end,
    v_marketing,
    case when v_marketing then now() else null end
  );

  for i in 1..10 loop
    insert into public.referral_codes (code, owner_id)
    values (upper(substr(md5(random()::text || clock_timestamp()::text || i::text), 1, 8)), new.id)
    on conflict (code) do nothing;
  end loop;

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

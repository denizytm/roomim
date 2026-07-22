-- Tüm Türk üniversitelerini kabul et: herhangi bir "*.edu.tr" e-postası geçerli.
-- Bilinen üniversite (seed'de tam domain eşleşmesi) varsa onu kullanır; yoksa
-- domain'den isim türetip otomatik bir universities kaydı oluşturur.
-- Böylece İstanbul/Antalya/Eskişehir/İzmir vb. tüm .edu.tr uzantıları (ör.
-- gelisim.edu.tr) elle eklemeye gerek kalmadan çalışır.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_domain        text;
  v_university_id uuid;
begin
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

  insert into public.profiles (id, university_id, full_name, role)
  values (
    new.id,
    v_university_id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'role' in ('host', 'seeker')
        then (new.raw_user_meta_data ->> 'role')::public.user_role
      else null
    end
  );

  return new;
end;
$$;

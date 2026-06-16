-- Daha fazla üniversite + öğrenci alt-domainleri. Domainler best-effort; doğrula/genişlet.
-- İsim üzerinde unique kısıt ekleyerek bu insert'i idempotent yapıyoruz.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'universities_name_key'
  ) then
    alter table public.universities add constraint universities_name_key unique (name);
  end if;
end $$;

insert into public.universities (name, city, domains) values
  ('İstinye Üniversitesi',            'İstanbul', '{stu.istinye.edu.tr,istinye.edu.tr}'),
  ('Bahçeşehir Üniversitesi',         'İstanbul', '{bahcesehir.edu.tr,stu.bahcesehir.edu.tr}'),
  ('Özyeğin Üniversitesi',            'İstanbul', '{ozu.edu.tr,ozyegin.edu.tr}'),
  ('İstanbul Medipol Üniversitesi',   'İstanbul', '{std.medipol.edu.tr,medipol.edu.tr}'),
  ('Yeditepe Üniversitesi',           'İstanbul', '{std.yeditepe.edu.tr,yeditepe.edu.tr}'),
  ('Kadir Has Üniversitesi',          'İstanbul', '{stu.khas.edu.tr,khas.edu.tr}'),
  ('İstanbul Bilgi Üniversitesi',     'İstanbul', '{bilgiedu.net,bilgi.edu.tr}'),
  ('Acıbadem Üniversitesi',           'İstanbul', '{live.acibadem.edu.tr,acibadem.edu.tr}'),
  ('MEF Üniversitesi',                'İstanbul', '{mef.edu.tr}'),
  ('Işık Üniversitesi',               'İstanbul', '{isik.edu.tr}'),
  ('İzmir Ekonomi Üniversitesi',      'İzmir',    '{std.ieu.edu.tr,ieu.edu.tr}'),
  ('Yaşar Üniversitesi',              'İzmir',    '{stu.yasar.edu.tr,yasar.edu.tr}')
on conflict (name) do nothing;

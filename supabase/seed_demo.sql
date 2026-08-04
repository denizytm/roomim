-- ============================================================================
-- ROOMIM DEMO VERİSİ — Play Store ekran görüntüleri için
-- Supabase SQL Editor'de tek seferde çalıştır. Tekrar çalıştırılabilir.
-- TEMİZLEMEK için sadece en alttaki DELETE'i çalıştır.
-- Not: extensions.crypt (pgcrypto) kullanılır — Supabase'de varsayılan olarak açık.
-- ============================================================================

-- 0) Önceki demo verisini temizle (cascade: profil, ilan, foto, yanıtlar)
delete from auth.users where email like 'demo.%';

-- 1) Demo kullanıcılar (trigger profili oluşturur) + profil zenginleştirme + uyum yanıtları
do $$
declare
  u   jsonb;
  uid uuid;
  arr jsonb := '[
    {"email":"demo.ayse@metu.edu.tr","name":"Ayşe Yılmaz","role":"host","dept":"Endüstri Mühendisliği","bio":"Sessiz sakin ve düzenli biriyim. Hafta içi erken yatarım.","avatar":"AyseYilmaz"},
    {"email":"demo.mehmet@hacettepe.edu.tr","name":"Mehmet Demir","role":"host","dept":"Bilgisayar Mühendisliği","bio":"Yazılımcıyım, çoğu zaman evdeyim. Temiz ve saygılı ev arkadaşı ararım.","avatar":"MehmetDemir"},
    {"email":"demo.elif@bilkent.edu.tr","name":"Elif Şahin","role":"host","dept":"Psikoloji","bio":"Kitap ve kahve tutkunu. Kedimle birlikte taşınıyorum.","avatar":"ElifSahin"},
    {"email":"demo.burak@gazi.edu.tr","name":"Burak Aydın","role":"host","dept":"İşletme","bio":"Sosyal ama eve rahat gelinsin isterim. Düzenli spor yaparım.","avatar":"BurakAydin"},
    {"email":"demo.sena@ankara.edu.tr","name":"Sena Koç","role":"host","dept":"Hukuk","bio":"Hukuk öğrencisiyim, ders çalışmak için sessizlik önemli.","avatar":"SenaKoc"},
    {"email":"demo.emre@atilim.edu.tr","name":"Emre Çelik","role":"host","dept":"Mimarlık","bio":"Mimarlık öğrencisiyim, düzen ve estetik benim için önemli.","avatar":"EmreCelik"},
    {"email":"demo.zeynep@baskent.edu.tr","name":"Zeynep Kaya","role":"seeker","dept":"Tıp","bio":"Tıp öğrencisiyim, çoğunlukla hastanedeyim. Uyumlu ev arkadaşı arıyorum.","avatar":"ZeynepKaya"},
    {"email":"demo.can@cankaya.edu.tr","name":"Can Öztürk","role":"seeker","dept":"Elektrik-Elektronik Mühendisliği","bio":"Sakin bir ortam arıyorum, çalışmayı severim.","avatar":"CanOzturk"}
  ]'::jsonb;
begin
  for u in select value from jsonb_array_elements(arr) loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change, email_change_token_new, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      u->>'email', extensions.crypt('Demo1234!', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', u->>'name', 'role', u->>'role'),
      '', '', '', '', ''
    ) returning id into uid;

    update public.profiles set
      onboarding_completed = true,
      bio          = u->>'bio',
      department   = u->>'dept',
      graduation_date = date '2027-06-15',
      avatar_url   = 'https://api.dicebear.com/9.x/avataaars/png?seed=' || (u->>'avatar') || '&size=256'
    where id = uid;

    -- Her soruya bir yanıt (kullanıcıya göre değişen ama deterministik seçim)
    insert into public.compatibility_answers (user_id, question_id, value)
    select uid, q.id,
      ((q.options -> (abs(hashtext((u->>'email') || q.id::text)) % jsonb_array_length(q.options))) ->> 'value')::int
    from public.compatibility_questions q
    on conflict do nothing;
  end loop;
end $$;

-- 2) Demo ilanlar (her biri farklı sahip — tek-açık-ilan kısıtı) + fotoğrafları
with new_listings as (
  insert into public.listings
    (owner_id, title, description, monthly_rent, deposit, dues, bills_included,
     capacity, occupied, room_count, total_rooms, bathroom_count,
     city, district, neighborhood, furnished, pets_allowed, gender_preference, features, status, available_from)
  select
    (select id from auth.users where email = v.email),
    v.title, v.descr, v.rent, v.deposit, v.dues, v.bills,
    v.capacity, v.occupied, 1, v.total_rooms, v.bath,
    'Ankara', v.district, v.neighborhood, v.furnished, v.pets, v.gender, v.features::jsonb, 'active', current_date
  from (values
    ('demo.ayse@metu.edu.tr',      'ODTÜ kampüsüne yürüme mesafesinde 3+1 evde 1 oda', 'ODTÜ kampüsüne 10 dakika yürüme mesafesinde, 3+1 dairede tek kişilik oda. Ev arkadaşım mezun oluyor. Ferah, aydınlık ve eşyalı.', 6500, 6500, 500, true,  3, 2, 3, 1, 'Çankaya',    'Çayyolu',    true,  false, 'female', '["internet","balcony","heating_combi","near_campus","washing_machine"]'),
    ('demo.mehmet@hacettepe.edu.tr','Metroya 5 dk, eşyalı 2+1 dairede oda arkadaşı',    'Metroya 5 dakika, eşyalı 2+1. Bahçelievlerde merkezi konumda. Düzenli ve saygılı bir ev arkadaşı arıyorum.',                       5500, 5000, 400, false, 2, 1, 2, 1, 'Çankaya',    'Bahçelievler', true,  false, 'male',   '["internet","near_metro","elevator","air_conditioning"]'),
    ('demo.elif@bilkent.edu.tr',    'Ferah 3+1, sakin ev arkadaşı aranıyor',           'Yenimahalle Demetevlerde ferah 3+1. Geniş salon, iki banyo. Sakin ve kitap seven bir ev arkadaşı olsun isterim. Evcil hayvan kabul.', 6000, 6000, 450, true,  3, 1, 3, 2, 'Yenimahalle','Demetevler', false, true,  'female', '["internet","balcony","parking","washing_machine","dishwasher"]'),
    ('demo.burak@gazi.edu.tr',      'Kızılay merkezde 1+1 stüdyo daire',               'Kızılay merkezde 1+1 stüdyo daire. Tüm ulaşım noktalarına yürüme mesafesi. Yeni ve bakımlı bina.',                                 7500, 7500, 300, false, 2, 0, 1, 1, 'Çankaya',    'Kızılay',    true,  false, 'any',    '["internet","elevator","near_metro","air_conditioning","private_bathroom"]'),
    ('demo.sena@ankara.edu.tr',     'Bütçe dostu, kampüse yakın oda',                  'Keçiören Etlikte bütçe dostu oda. Kampüse yakın, ulaşım kolay. Ekonomik ve pratik bir seçenek.',                                   4500, 4000, 350, true,  4, 2, 4, 1, 'Keçiören',   'Etlik',      false, false, 'female', '["internet","heating_central","near_campus"]'),
    ('demo.emre@atilim.edu.tr',     'Otoparklı, geniş müstakil kat - Ümitköy',         'Ümitköyde otoparklı, geniş müstakil kat. ODTÜ ve Bilkent arasında ideal konum. Estetik ve düzenli bir yaşam alanı.',               8000, 8000, 600, false, 3, 1, 4, 2, 'Çankaya',    'Ümitköy',    true,  true,  'any',    '["internet","parking","balcony","dishwasher","air_conditioning","private_bathroom"]')
  ) as v(email, title, descr, rent, deposit, dues, bills, capacity, occupied, total_rooms, bath, district, neighborhood, furnished, pets, gender, features)
  returning id, owner_id
)
insert into public.listing_photos (listing_id, storage_path, position)
select nl.id, ph.url, ph.pos
from new_listings nl
join auth.users u on u.id = nl.owner_id
join (values
  ('demo.ayse@metu.edu.tr',       'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=70', 0),
  ('demo.ayse@metu.edu.tr',       'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=70', 1),
  ('demo.ayse@metu.edu.tr',       'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=70', 2),
  ('demo.mehmet@hacettepe.edu.tr','https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=70', 0),
  ('demo.mehmet@hacettepe.edu.tr','https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1200&q=70', 1),
  ('demo.mehmet@hacettepe.edu.tr','https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=70', 2),
  ('demo.elif@bilkent.edu.tr',    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=70', 0),
  ('demo.elif@bilkent.edu.tr',    'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=70', 1),
  ('demo.elif@bilkent.edu.tr',    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=70', 2),
  ('demo.burak@gazi.edu.tr',      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=70', 0),
  ('demo.burak@gazi.edu.tr',      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=70', 1),
  ('demo.burak@gazi.edu.tr',      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70', 2),
  ('demo.sena@ankara.edu.tr',     'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=70', 0),
  ('demo.sena@ankara.edu.tr',     'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=70', 1),
  ('demo.sena@ankara.edu.tr',     'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=70', 2),
  ('demo.emre@atilim.edu.tr',     'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=70', 0),
  ('demo.emre@atilim.edu.tr',     'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=70', 1),
  ('demo.emre@atilim.edu.tr',     'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=70', 2)
) as ph(email, url, pos) on ph.email = u.email;

-- ============================================================================
-- TEMİZLEME (demo veriyi silmek istersen sadece bu satırı çalıştır):
--   delete from auth.users where email like 'demo.%';
-- ============================================================================

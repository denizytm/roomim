-- Demo amaçlı çeşitli ilanlar + örnek fotoğraflar (picsum).
-- Owner = aşağıdaki e-postaya sahip kullanıcı. BİR KEZ çalıştır (tekrar = kopya).
-- Sıfırlamak için: bu kullanıcının ilanlarını sil (en alttaki yorumlu komut).

with me as (
  select id from auth.users where email = '220911765@stu.istinye.edu.tr' limit 1
),
new_listings as (
  insert into public.listings
    (owner_id, title, description, monthly_rent, deposit, bills_included,
     room_count, total_rooms, flatmates_count, city, district, neighborhood,
     pets_allowed, furnished, gender_preference, features, status)
  select me.id, d.*
  from me, (values
    ('ODTÜ''ye yürüme mesafesinde, eşyalı 2+1''de oda', 'Aydınlık, geniş oda. Ortak alanlar bakımlı, sessiz site.', 8500, 8500, false, 1, 3, 2, 'Ankara', 'Çankaya', 'Çayyolu', false, true,  'any',    '["internet","near_campus","heating_combi"]'::jsonb, 'active'::public.listing_status),
    ('Metroya 5 dk, kız öğrenciye uygun oda',           'Tamamen eşyalı, faturalar dahil. Güvenli muhit.',         6000, 6000, true,  1, 2, 1, 'Ankara', 'Çankaya', 'Kızılay', true,  true,  'female', '["internet","near_metro","washing_machine"]'::jsonb, 'active'),
    ('Yenimahalle''de ferah odada ev arkadaşı',          'Balkonlu, güneş alan oda. Eşyasız.',                      5000, 5000, false, 1, 3, 2, 'Ankara', 'Yenimahalle', 'Demetevler', false, false, 'any',    '["internet","balcony"]'::jsonb, 'active'),
    ('Keçiören uygun fiyatlı oda',                        'Öğrenci dostu, ekonomik. Toplu taşımaya yakın.',          4000, 3000, false, 1, 2, 1, 'Ankara', 'Keçiören', 'Etlik', false, false, 'male',   '["internet"]'::jsonb, 'active'),
    ('Çayyolu''nda lüks 3+1, otopark + asansör',          'Yeni bina, klimalı, bulaşık makinesi dahil.',             12000, 12000, false, 1, 4, 1, 'Ankara', 'Çankaya', 'Çayyolu', true, true, 'any',    '["parking","elevator","air_conditioning","internet","dishwasher"]'::jsonb, 'active'),
    ('Kadıköy merkezde eşyalı oda',                       'Moda''ya yürüme mesafesi, sosyal hayatın içinde.',        11000, 11000, false, 1, 2, 1, 'İstanbul', 'Kadıköy', 'Moda', false, true, 'female', '["internet","near_metro","washing_machine"]'::jsonb, 'active'),
    ('Beşiktaş''ta 3 odalı dairede 2 oda',               'Boğaz''a yakın, balkonlu, asansörlü.',                     15000, 15000, false, 2, 3, 1, 'İstanbul', 'Beşiktaş', 'Levent', false, true, 'any',    '["balcony","internet","elevator"]'::jsonb, 'active'),
    ('Şişli''de metroya yakın oda',                       'Eşyasız ama ferah. Evcil hayvan kabul.',                  9500, 9500, false, 1, 2, 1, 'İstanbul', 'Şişli', 'Mecidiyeköy', true, false, 'any',    '["internet","near_metro"]'::jsonb, 'active'),
    ('Üsküdar sahile yakın eşyalı oda',                   'Sakin mahalle, deniz manzaralı ortak salon.',             8000, 8000, true,  1, 2, 1, 'İstanbul', 'Üsküdar', 'Kuzguncuk', false, true, 'female', '["internet","balcony"]'::jsonb, 'active'),
    ('Bornova kampüse yakın oda',                         'Ege Üni''ye yürüme mesafesi, öğrenci muhiti.',            6500, 6500, false, 1, 3, 2, 'İzmir', 'Bornova', 'Erzene', false, true, 'any',    '["internet","near_campus"]'::jsonb, 'active'),
    ('Konak''ta 2 odalı dairede ev arkadaşı',            'Merkezi konum, balkonlu. Evcil dostu.',                   7000, 7000, false, 2, 2, 1, 'İzmir', 'Konak', 'Alsancak', true, false, 'male',   '["balcony","internet"]'::jsonb, 'active'),
    ('Karşıyaka''da eşyalı sakin oda',                    'Çarşıya yakın, çamaşır makinesi dahil.',                  5500, 5500, true,  1, 2, 1, 'İzmir', 'Karşıyaka', 'Bostanlı', false, true, 'any',    '["internet","washing_machine"]'::jsonb, 'active')
  ) as d(title, description, monthly_rent, deposit, bills_included,
         room_count, total_rooms, flatmates_count, city, district, neighborhood,
         pets_allowed, furnished, gender_preference, features, status)
  returning id
)
insert into public.listing_photos (listing_id, storage_path, position)
select nl.id,
       'https://picsum.photos/seed/' || replace(nl.id::text, '-', '') || g::text || '/800/600',
       g
from new_listings nl, generate_series(0, 2) as g;

-- Sıfırlamak istersen (DİKKAT: bu kullanıcının TÜM ilanlarını siler):
-- delete from public.listings
-- where owner_id = (select id from auth.users where email = '220911765@stu.istinye.edu.tr');

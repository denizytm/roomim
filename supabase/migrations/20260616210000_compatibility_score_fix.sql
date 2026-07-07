-- Uyum skoru düzeltmesi: eskiden skor yalnızca "ikisinin de yanıtladığı" sorular
-- üzerinden ortalanıyordu; bu yüzden tek ortak eşleşen yanıt %100 veriyordu.
-- Artık payda TOPLAM soru sayısı (ör. 15). Boş bırakılan ya da tek tarafın
-- yanıtladığı sorular benzerliğe 0 katkı yapar → eksik/yanıt yok = düşük skor.
-- Yalnızca ikisinin de yanıtlayıp eşleştiği sorular skoru yükseltir.

create or replace function public.compatibility_scores(other_users uuid[])
returns table (user_id uuid, score int)
language sql
security definer
set search_path = ''
as $$
  select o.user_id,
         round(
           sum(1.0 - abs(o.value - m.value) / 2.0)
           / greatest((select count(*) from public.compatibility_questions), 1)
           * 100
         )::int as score
  from public.compatibility_answers o
  join public.compatibility_answers m
    on m.question_id = o.question_id
   and m.user_id = auth.uid()
  where o.user_id = any (other_users)
    and o.user_id <> auth.uid()
  group by o.user_id;
$$;

grant execute on function public.compatibility_scores(uuid[]) to authenticated;

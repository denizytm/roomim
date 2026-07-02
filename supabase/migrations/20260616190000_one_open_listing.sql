-- Herkes en fazla 1 açık (kapatılmamış) ilana sahip olabilir.
create unique index if not exists listings_one_open_per_owner
  on public.listings (owner_id)
  where status <> 'closed';

-- Adminler tüm ilanları görebilir ve yönetebilir (gizle/kapat/sil).
-- is_admin() moderation migration'ında tanımlı. Bu politika mevcut sahip/public
-- politikalarıyla OR'lanır: adminler her ilana tam erişir, diğerleri değişmez.
-- İlan silindiğinde listing_photos / conversations / messages / listing_passes
-- FK cascade ile temizlenir; reports.listing_id null'lanır (ilgili migration'lar).

drop policy if exists "listings: admin manage" on public.listings;
create policy "listings: admin manage"
  on public.listings for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

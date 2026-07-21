#!/usr/bin/env bash
# Roomim web — VPS deploy scripti. Sunucuda çalıştır: /opt/roomim/deploy.sh
# git pull → docker build → container'ı yenile. Diğer container'lara dokunmaz.
set -euo pipefail

main() {
  cd /opt/roomim

  echo "→ Kod çekiliyor (git pull)..."
  git pull --ff-only

  echo "→ Image build ediliyor (birkaç dakika)..."
  docker build -f apps/web/Dockerfile -t roomim-web \
    --build-arg NEXT_PUBLIC_SUPABASE_URL=https://zezdqxiwbzerfeyfydsr.supabase.co \
    --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Il6bOHxOjFZB-UNu9N6h4A_Ht7iZ6gd \
    --build-arg NEXT_PUBLIC_SITE_URL=https://roomim.com \
    .

  echo "→ Container yenileniyor..."
  docker stop roomim-web 2>/dev/null || true
  docker rm roomim-web 2>/dev/null || true
  docker run -d --name roomim-web --network proxy --restart unless-stopped roomim-web

  echo "✓ Deploy tamam. Son loglar:"
  sleep 2
  docker logs --tail 15 roomim-web
}

# main'i sonda çağırmak: bash tüm fonksiyonu önce okur; git pull script'i
# güncellese bile çalışan kopya bozulmaz.
main "$@"

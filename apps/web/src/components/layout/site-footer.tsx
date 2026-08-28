import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { MobileBetaLinks } from "@/components/mobile-beta";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-sm">
            Üniversite öğrencileri için güvenli ev arkadaşı eşleşmesi. Edu mail ile
            doğrulanmış topluluk.
          </p>
          <div>
            <p className="mb-2 text-xs font-medium text-foreground">
              📱 Mobil uygulama beta testte — dene:
            </p>
            <MobileBetaLinks size="sm" />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/kosullar" className="text-xs font-medium hover:text-foreground">
              Kullanıcı Sözleşmesi
            </Link>
            <Link href="/gizlilik" className="text-xs font-medium hover:text-foreground">
              Gizlilik Politikası
            </Link>
            <Link href="/kvkk" className="text-xs font-medium hover:text-foreground">
              KVKK
            </Link>
            <Link href="/cerez" className="text-xs font-medium hover:text-foreground">
              Çerez Politikası
            </Link>
            <Link href="/hesap-sil" className="text-xs font-medium hover:text-foreground">
              Hesap Silme
            </Link>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} Roomim · Beta</p>
        </div>
      </div>
    </footer>
  );
}

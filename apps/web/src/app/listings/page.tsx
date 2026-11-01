import Link from "next/link";
import { Plus, SearchX } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/features/listings/listing-card";
import { ListingFilters } from "@/features/listings/listing-filters";
import { getListings } from "@/features/listings/queries";
import type { SortKey } from "@/lib/constants";
import { requireOnboardedProfile } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "İlanlar" };

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const profile = await requireOnboardedProfile();
  const sp = await searchParams;

  const listings = await getListings(
    {
      city: sp.city || undefined,
      district: sp.district || undefined,
      minRent: sp.minRent ? Number(sp.minRent) : undefined,
      maxRent: sp.maxRent ? Number(sp.maxRent) : undefined,
      minAvailable: sp.minAvailable ? Number(sp.minAvailable) : undefined,
      pets: sp.pets === "true" ? true : undefined,
    },
    (sp.sort as SortKey) || "recommended",
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <PageHeader
        title="İlanlar"
        description="Sana uygun oda ve ev arkadaşını keşfet."
        action={
          profile.role !== "seeker" && (
            <Button size="lg" className="bg-white text-primary shadow-none hover:bg-white/90" render={<Link href="/listings/new" />}>
              <Plus /> İlan ver
            </Button>
          )
        }
      />

      <div className="mt-6">
        <ListingFilters />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">{listings.length} ilan bulundu</p>

      {listings.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={SearchX}
          title="Kriterlerine uygun ilan yok"
          text="Filtreleri genişletmeyi dene veya daha sonra tekrar bak."
        />
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, i) => (
            <FadeIn key={listing.id} delay={Math.min(i * 0.04, 0.3)}>
              <ListingCard listing={listing} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}

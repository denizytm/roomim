import Link from "next/link";
import { HeartOff } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/features/listings/listing-card";
import { getLikedListings } from "@/features/listings/queries";
import { requireOnboardedProfile } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Beğendiklerim" };

export default async function LikedPage() {
  const profile = await requireOnboardedProfile();
  const listings = await getLikedListings(profile.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <PageHeader title="Beğendiklerim" description="İletişim kurduğun ilanları burada tekrar bulabilirsin." />

      {listings.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={HeartOff}
          title="Henüz bir ilan beğenmedin"
          text="İlanları keşfet, ilgilendiklerinle iletişim kur — burada birikirler."
          action={
            <Button size="lg" render={<Link href="/listings" />}>
              İlanları keşfet
            </Button>
          }
        />
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

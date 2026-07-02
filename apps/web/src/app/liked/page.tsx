import Link from "next/link";
import { HeartOff } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/features/listings/listing-card";
import { getLikedListings } from "@/features/listings/queries";
import { requireOnboardedProfile } from "@/lib/auth";

export const metadata = { title: "Beğendiklerim" };

export default async function LikedPage() {
  const profile = await requireOnboardedProfile();
  const listings = await getLikedListings(profile.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Beğendiklerim</h1>
      <p className="mt-1 text-muted-foreground">
        İletişim kurduğun ilanları burada tekrar bulabilirsin.
      </p>

      {listings.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <HeartOff className="size-10 text-muted-foreground" />
          <p className="mt-4 font-medium">Henüz bir ilan beğenmedin</p>
          <p className="mt-1 text-sm text-muted-foreground">
            İlanları keşfet, ilgilendiklerinle iletişim kur — burada birikirler.
          </p>
          <Button className="mt-5" render={<Link href="/listings" />}>
            İlanları keşfet
          </Button>
        </div>
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

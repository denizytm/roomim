import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  GraduationCap,
  Heart,
  MapPin,
  MessageCircleHeart,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { MobileAppLinks } from "@/components/mobile-beta";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const TRUST = [
  {
    icon: GraduationCap,
    title: "Edu mail ile doğrulama",
    text: "Sadece üniversite e-postasıyla giriş. Topluluk gerçek öğrencilerden oluşur.",
  },
  {
    icon: Heart,
    title: "Uyum skoru",
    text: "15 soruluk uyum testiyle yaşam tarzınıza en uygun ev arkadaşını gör.",
  },
  {
    icon: ShieldCheck,
    title: "Güvenlik önce",
    text: "Bölge bazlı konum, çift onaylı adres paylaşımı ve şikayet sistemi.",
  },
];

const STEPS = [
  {
    icon: BadgeCheck,
    title: "Doğrula & profilini oluştur",
    text: "Edu mail ile kayıt ol, üniversiteni ve yaşam tarzını birkaç soruda anlat.",
  },
  {
    icon: Sparkles,
    title: "Uyumlu ilanları keşfet",
    text: "Kira, konum ve oda filtreleriyle ara; her ilanda uyum yüzdeni gör.",
  },
  {
    icon: MessageCircleHeart,
    title: "Eşleş & güvenle iletişime geç",
    text: "Beğendiğin ev sahibiyle platform içinde mesajlaş, ilk buluşmayı kafede yap.",
  },
];

export default async function HomePage() {
  // Giriş yapmış kullanıcıyı pazarlama sayfası yerine doğrudan uygulamaya al.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/listings");

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_80%_20%,var(--color-accent),transparent)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                <GraduationCap className="size-4" /> Üniversite öğrencileri için
              </span>
            </FadeIn>

            <FadeIn delay={0.08}>
              <h1 className="mt-6 max-w-xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
                Doğru ev arkadaşını <span className="text-primary">uyumla</span> bul.
              </h1>
            </FadeIn>

            <FadeIn delay={0.16}>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground text-pretty">
                Roomim, edu mail ile doğrulanmış öğrencileri yaşam tarzı uyumuna göre buluşturan
                güvenli ev arkadaşı platformu.
              </p>
            </FadeIn>

            <FadeIn delay={0.24}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" render={<Link href="/register" />}>
                  Ücretsiz başla <ArrowRight />
                </Button>
                <Button size="lg" variant="outline" render={<Link href="/listings" />}>
                  İlanları keşfet
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.32}>
              <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground lg:justify-start">
                {["Edu mail doğrulaması", "Uyum skoru", "Tamamen ücretsiz"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <BadgeCheck className="size-4 text-primary" /> {t}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>

          <FadeIn delay={0.2} className="mx-auto w-full max-w-sm lg:max-w-none">
            <HeroMock />
          </FadeIn>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {TRUST.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.08}>
              <div className="h-full rounded-3xl bg-secondary p-7 transition-colors hover:bg-accent">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
                  <item.icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <FadeIn>
          <p className="text-center text-sm font-bold tracking-widest text-primary uppercase">
            Nasıl çalışır?
          </p>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            Üç adımda uyumlu ev arkadaşı
          </h2>
        </FadeIn>

        <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          <div
            aria-hidden
            className="absolute top-7 right-[16%] left-[16%] hidden border-t-2 border-dashed border-primary/30 md:block"
          />
          {STEPS.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.1}>
              <div className="relative flex flex-col items-center text-center">
                <span className="relative grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <step.icon className="size-7" />
                  <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-foreground text-xs font-bold text-background">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 max-w-xs text-muted-foreground">{step.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Mobil uygulama */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-8">
        <FadeIn>
          <div className="grid items-center gap-8 rounded-[2rem] bg-secondary px-6 py-12 sm:px-12 md:grid-cols-[1fr_auto]">
            <div className="text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-1.5 text-sm font-semibold text-primary">
                <Smartphone className="size-4" /> Mobil uygulama
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-balance">
                Roomim artık cebinde
              </h2>
              <p className="mt-3 max-w-lg text-muted-foreground">
                İlanları kaydırarak keşfet, eşleşince anında bildirim al. Android&apos;de Google
                Play&apos;de, iOS&apos;ta TestFlight beta ile.
              </p>
            </div>
            <MobileAppLinks className="justify-center md:flex-col" />
          </div>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-8 pb-24">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2rem] bg-primary px-8 py-16 text-center text-primary-foreground">
            <div aria-hidden className="absolute -top-20 -left-16 size-64 rounded-full bg-white/10" />
            <div aria-hidden className="absolute -right-10 -bottom-24 size-72 rounded-full bg-white/10" />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              Doğru ev arkadaşın bir tık uzağında.
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-primary-foreground/90">
              Edu mail ile kaydol, uyum skoruna göre eşleş.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="relative mt-8 bg-white text-primary shadow-lg hover:bg-white/90"
              render={<Link href="/register" />}
            >
              Ücretsiz kayıt ol <ArrowRight />
            </Button>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}

// Uygulamadaki kaydırmalı ilan kartının stilize bir önizlemesi (örnek görsel, gerçek ilan değil).
function HeroMock() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[380px]">
      <div aria-hidden className="absolute inset-6 -z-10 rotate-6 rounded-[2rem] bg-primary/20" />
      <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-muted shadow-2xl shadow-primary/20">
        <Image
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=70"
          alt="Örnek ilan: aydınlık oturma odası"
          fill
          sizes="380px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white">
          <Sparkles className="size-3.5" /> %92 uyum
        </span>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <p className="text-2xl font-extrabold">Kampüse yakın 3+1&apos;de oda</p>
          <p className="mt-1 flex items-center gap-1 text-white/85">
            <MapPin className="size-4" /> Çankaya, Ankara
          </p>
          <p className="mt-2 text-xl font-extrabold">
            ₺6.500 <span className="text-sm font-medium text-white/80">/ay</span>
          </p>
        </div>
      </div>

      {/* Yüzen rozetler */}
      <div className="absolute top-16 -left-6 flex items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 shadow-xl sm:-left-10">
        <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="size-4" />
        </span>
        <span className="text-sm font-semibold">Doğrulanmış öğrenci</span>
      </div>
      <div className="absolute top-[44%] -right-4 flex items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 shadow-xl sm:-right-8">
        <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
          <Heart className="size-4 fill-current" />
        </span>
        <span className="text-sm font-semibold">Eşleştiniz! 🎉</span>
      </div>
    </div>
  );
}

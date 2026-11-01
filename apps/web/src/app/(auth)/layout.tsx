import { BadgeCheck, HeartHandshake, MessageCircleHeart } from "lucide-react";

const POINTS = [
  { icon: BadgeCheck, text: "Sadece .edu.tr ile doğrulanmış öğrenciler" },
  { icon: HeartHandshake, text: "Yaşam tarzına göre uyum skoru" },
  { icon: MessageCircleHeart, text: "Platform içinde güvenli mesajlaşma" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:py-14 lg:grid-cols-2 lg:items-center lg:gap-16">
      {/* Marka paneli — yalnızca geniş ekranda */}
      <div className="relative hidden overflow-hidden rounded-[2rem] bg-primary p-10 text-primary-foreground lg:block">
        <div aria-hidden className="absolute -top-24 -right-20 size-72 rounded-full bg-white/10" />
        <div aria-hidden className="absolute -bottom-16 -left-12 size-48 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-sm font-semibold tracking-wide text-primary-foreground/80 uppercase">
            Roomim
          </p>
          <h2 className="mt-4 text-4xl leading-tight font-bold tracking-tight text-balance">
            Ev arkadaşını <span className="underline decoration-white/40 decoration-4 underline-offset-8">uyumla</span> bul.
          </h2>
          <p className="mt-4 max-w-sm text-primary-foreground/85">
            Üniversite öğrencileri için güvenli ev arkadaşı eşleşmesi.
          </p>
          <ul className="mt-10 space-y-4">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-white/15">
                  <p.icon className="size-5" />
                </span>
                <span className="font-medium">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );
}

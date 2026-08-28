import { CookieBody } from "@/features/legal/legal-docs";

export const metadata = {
  title: "Çerez Politikası",
  description: "Roomim çerez politikası.",
};

const updated = "25 Ağustos 2026";

export default function CookiePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Çerez Politikası</h1>
      <p className="mt-2 text-sm text-muted-foreground">Son güncelleme: {updated}</p>
      <div className="mt-8">
        <CookieBody />
      </div>
    </div>
  );
}

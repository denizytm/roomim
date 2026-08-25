import { PrivacyBody } from "@/features/legal/legal-docs";

export const metadata = {
  title: "Gizlilik Politikası",
  description: "Roomim gizlilik politikası ve KVKK aydınlatma metni.",
};

const updated = "23 Temmuz 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Gizlilik Politikası</h1>
      <p className="mt-2 text-sm text-muted-foreground">Son güncelleme: {updated}</p>
      <div className="mt-8">
        <PrivacyBody />
      </div>
    </div>
  );
}

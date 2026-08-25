import { KvkkBody } from "@/features/legal/legal-docs";

export const metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "Roomim kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
};

const updated = "25 Ağustos 2026";

export default function KvkkPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">KVKK Aydınlatma Metni</h1>
      <p className="mt-2 text-sm text-muted-foreground">Son güncelleme: {updated}</p>
      <div className="mt-4 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Bu metin taslaktır; yayına almadan önce bir hukuk danışmanına inceletmen ve VERBIS kayıt
        yükümlülüğünü teyit etmen önerilir.
      </div>
      <div className="mt-8">
        <KvkkBody />
      </div>
    </div>
  );
}

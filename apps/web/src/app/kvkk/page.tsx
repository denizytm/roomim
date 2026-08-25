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
        Bu metin taslaktır; yayına almadan önce bir hukuk danışmanına inceletmen, kalan resmi
        bilgileri (<strong>[TAM TİCARİ UNVAN]</strong>, <strong>[MERSİS NO]</strong>,{" "}
        <strong>[VERGİ DAİRESİ / VERGİ NO]</strong>) doldurman ve VERBIS kayıt yükümlülüğünü
        teyit etmen önerilir.
      </div>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, veri
            sorumlusu sıfatıyla <strong>HC Dijital</strong> (&quot;Roomim&quot;) tarafından
            kişisel verilerinin nasıl işlendiği aşağıda açıklanmıştır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Veri sorumlusu</h2>
          <p>
            <strong>HC Dijital</strong> (tam ticari unvan:{" "}
            <strong>[TAM TİCARİ UNVAN — … Ltd. Şti.]</strong>)
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Adres:</strong> Ayazağa, Vadis Istanbul Park Etabı, Kemerburgaz Cad. D:7A
              Blok, 34396 Sarıyer/İstanbul
            </li>
            <li>
              <strong>MERSİS No:</strong> [MERSİS NO] · <strong>Vergi:</strong>{" "}
              [VERGİ DAİRESİ / VERGİ NO]
            </li>
            <li>
              <strong>İletişim:</strong>{" "}
              <a
                href="mailto:info@hcdijital.com.tr"
                className="font-medium text-primary hover:underline"
              >
                info@hcdijital.com.tr
              </a>{" "}
              ·{" "}
              <a
                href="mailto:destek@roomim.com"
                className="font-medium text-primary hover:underline"
              >
                destek@roomim.com
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. İşlenen kişisel veriler</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Kimlik / iletişim:</strong> ad-soyad, üniversite e-posta adresi.
            </li>
            <li>
              <strong>Eğitim bilgileri:</strong> üniversite, bölüm, mezuniyet bilgisi.
            </li>
            <li>
              <strong>Profil ve içerik:</strong> profil fotoğrafı, tanıtım (bio), rol; ilan
              bilgileri (fotoğraf, ilçe/semt, fiyat, özellikler).
            </li>
            <li>
              <strong>Uyum yanıtları:</strong> yaşam tarzına ilişkin tercihler (eşleşme skoru
              için).
            </li>
            <li>
              <strong>İşlem güvenliği:</strong> oturum kayıtları; (izin verirsen) bildirim
              jetonu.
            </li>
            <li>
              <strong>Mesajlaşma:</strong> diğer kullanıcılarla yazışmalar ve paylaşılan medya.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. İşleme amaçları ve hukuki sebepler</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Üyelik oluşturma, hizmetin sunulması, eşleştirme ve ilan gösterimi —{" "}
              <em>sözleşmenin kurulması ve ifası (KVKK m.5/2-c).</em>
            </li>
            <li>
              Üniversite e-postasının doğrulanması, güvenlik ve kötüye kullanımın önlenmesi —{" "}
              <em>meşru menfaat ve hukuki yükümlülük (KVKK m.5/2-e, f).</em>
            </li>
            <li>
              Hesap ve işlem e-postalarının gönderimi — <em>sözleşmenin ifası.</em>
            </li>
            <li>
              Kampanya / duyuru e-postaları (talep edersen) — <em>açık rızan (KVKK m.5/1).</em>{" "}
              Bu rızanı dilediğin zaman geri alabilirsin.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Aktarım</h2>
          <p>
            Kişisel verilerin <strong>satılmaz.</strong> Yalnızca hizmetin sunulması için gerekli
            hizmet sağlayıcılarla paylaşılır:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Supabase</strong> (veritabanı, kimlik doğrulama, dosya depolama) — AB
              bölgesinde barındırılır.
            </li>
            <li>
              <strong>Resend</strong> (e-posta gönderimi).
            </li>
          </ul>
          <p className="mt-2">
            Profil bilgilerin yalnızca eşleştiğin/iletişim kurduğun diğer kullanıcılara gösterilir.
            Yurt dışına aktarım, KVKK&apos;nın öngördüğü şartlar çerçevesinde yapılır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">5. Saklama süresi</h2>
          <p>
            Veriler, hesabın aktif olduğu sürece ve ilgili mevzuatın öngördüğü süreler boyunca
            saklanır. Hesabını sildiğinde verilerin makul süre içinde kalıcı olarak silinir (bkz.{" "}
            <a href="/hesap-sil" className="font-medium text-primary hover:underline">
              Hesap Silme
            </a>
            ).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">6. Haklarınız (KVKK m.11)</h2>
          <p>
            Kişisel verilerine erişme, düzeltme, silme, işlemeye itiraz etme ve aktarımı öğrenme
            haklarına sahipsin. Taleplerini uygulama içindeki{" "}
            <strong>Destek / Şikayet</strong> bölümünden veya{" "}
            <a
              href="mailto:destek@roomim.com"
              className="font-medium text-primary hover:underline"
            >
              destek@roomim.com
            </a>{" "}
            adresinden iletebilirsin.
          </p>
        </section>
      </div>
    </div>
  );
}

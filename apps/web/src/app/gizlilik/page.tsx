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

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <p>
            Roomim (&quot;uygulama&quot;, &quot;biz&quot;), üniversite öğrencilerini uyumlu ev
            arkadaşlarıyla eşleştiren bir platformdur. Bu politika, uygulamayı ve{" "}
            <strong>roomim.com</strong> web sitesini kullandığında hangi verileri topladığımızı,
            nasıl kullandığımızı ve haklarını açıklar. Uygulamayı kullanarak bu politikayı kabul
            etmiş olursun.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Topladığımız veriler</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Hesap bilgileri:</strong> üniversite e-posta adresin (.edu.tr), adın,
              üniversiten, bölümün, mezuniyet bilgin.
            </li>
            <li>
              <strong>Profil bilgileri:</strong> profil fotoğrafın, kısa tanıtımın (bio), ev
              arayan/ev sunan rolün.
            </li>
            <li>
              <strong>Uyum yanıtları:</strong> yaşam tarzı/uyum sorularına verdiğin yanıtlar
              (eşleşme skorunu hesaplamak için).
            </li>
            <li>
              <strong>İlan verileri:</strong> oluşturduğun ilanlara ait fotoğraflar, konum
              (şehir/ilçe/semt), fiyat ve özellikler.
            </li>
            <li>
              <strong>Mesajlaşma:</strong> diğer kullanıcılarla yaptığın yazışmalar ve
              paylaştığın görsel/sesli mesajlar.
            </li>
            <li>
              <strong>Teknik veriler:</strong> oturum bilgileri ve uygulamanın çalışması için
              gereken temel kayıtlar. (Bildirim izni verirsen) push bildirim jetonu.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Verileri neden işliyoruz</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Hesabını oluşturmak ve üniversite e-postanı doğrulamak,</li>
            <li>Sana uyumlu ev arkadaşı/ilan önermek ve eşleşme skorunu hesaplamak,</li>
            <li>İlanları göstermek ve kullanıcıların iletişim kurmasını sağlamak,</li>
            <li>Güvenliği sağlamak, kötüye kullanımı ve sahte hesapları önlemek,</li>
            <li>Sana bildirim ve hesap e-postaları göndermek.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. Verilerin paylaşımı</h2>
          <p>
            Verilerini <strong>satmayız.</strong> Yalnızca hizmetin çalışması için gereken
            hizmet sağlayıcılarla paylaşılır:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Supabase</strong> (veritabanı, kimlik doğrulama, dosya depolama) — AB
              bölgesinde barındırılır.
            </li>
            <li>
              <strong>Resend</strong> (hesap doğrulama ve bildirim e-postalarının gönderimi).
            </li>
          </ul>
          <p className="mt-2">
            Profil bilgilerin (ad, üniversite, bölüm, fotoğraf, uyum yanıtların) yalnızca eşleştiğin
            veya iletişim kurduğun diğer kullanıcılara gösterilir. Ev adresi asla otomatik paylaşılmaz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Saklama süresi</h2>
          <p>
            Verilerini hesabın aktif olduğu sürece saklarız. Hesabını sildiğinde, hesabına bağlı
            veriler (profil, ilanlar, mesajlar, uyum yanıtların) makul bir süre içinde kalıcı
            olarak silinir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">5. Haklarınız (KVKK)</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında; verilerine erişme,
            düzeltilmesini veya silinmesini isteme ve işlenmesine itiraz etme hakkına sahipsin. Bu
            talepler için uygulama içindeki <strong>Destek / Şikayet</strong> bölümünü kullanabilir
            veya aşağıdaki e-posta adresinden bize ulaşabilirsin.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">6. Güvenlik</h2>
          <p>
            Verilerin şifreli bağlantı (HTTPS) üzerinden aktarılır ve satır bazlı erişim
            denetimleri (RLS) ile korunur. Yalnızca yetkili kullanıcılar kendi verilerine ve
            paylaşılması amaçlanan bilgilere erişebilir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">7. Çocukların gizliliği</h2>
          <p>
            Roomim üniversite öğrencilerine yöneliktir ve 18 yaşından küçüklere hitap etmez.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">8. Değişiklikler ve iletişim</h2>
          <p>
            Bu politikayı zaman zaman güncelleyebiliriz; önemli değişiklikleri uygulama üzerinden
            duyururuz. Sorularının için:{" "}
            <a href="mailto:destek@roomim.com" className="font-medium text-primary hover:underline">
              destek@roomim.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

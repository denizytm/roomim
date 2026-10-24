import Link from "next/link";

export const metadata = {
  title: "Destek",
  description: "Roomim destek ve iletişim sayfası — sık sorulan sorular, şikayet ve hesap işlemleri.",
};

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Destek</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Roomim ile ilgili bir sorun mu yaşıyorsun ya da bir sorun mu var? Buradayız.
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section className="rounded-xl border border-border bg-secondary/40 p-5">
          <h2 className="mb-2 text-lg font-semibold">Bize ulaş</h2>
          <p>
            Her türlü soru, öneri ve sorun için{" "}
            <a
              href="mailto:destek@roomim.com"
              className="font-medium text-primary hover:underline"
            >
              destek@roomim.com
            </a>{" "}
            adresine e-posta gönderebilirsin. Genellikle 1–2 iş günü içinde yanıt veririz.
          </p>
          <p className="mt-2">
            Uygulamadaysan <strong>Profil → Destek / Şikayet</strong> ekranından da bize doğrudan
            yazabilirsin.
          </p>
          <p className="mt-3 text-xs text-muted-foreground" lang="en">
            English: For support, contact us at destek@roomim.com or use Profile → Destek /
            Şikayet (Support / Report) in the app. We usually reply within 1–2 business days.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Sık sorulan sorular</h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold">Kimler kayıt olabilir?</h3>
              <p className="mt-1">
                Roomim yalnızca üniversite öğrencileri içindir. Kayıt için <strong>.edu.tr</strong>{" "}
                uzantılı bir üniversite e-posta adresi gerekir; hesabın bu adrese gönderilen
                bağlantıyla doğrulanır.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Doğrulama e-postası gelmedi.</h3>
              <p className="mt-1">
                Spam / gereksiz klasörünü kontrol et. Bazı üniversitelerin e-posta sistemleri
                gecikmeli teslim edebilir; birkaç dakika bekleyip tekrar dene. Sorun devam ederse
                bize yaz.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Şifremi unuttum.</h3>
              <p className="mt-1">
                Giriş ekranındaki <strong>Şifremi unuttum</strong> bağlantısıyla üniversite e-posta
                adresine sıfırlama bağlantısı gönderebilirsin.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Uyum skoru nasıl hesaplanıyor?</h3>
              <p className="mt-1">
                Uyum soruları (uyku düzeni, temizlik, misafir, sigara, evcil hayvan, harcamalar
                vb.) iki kişinin yanıtlarını karşılaştırır. Yanıtlarını istediğin zaman{" "}
                <strong>Profil → Uyum sorularını güncelle</strong> ekranından değiştirebilirsin.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Nasıl ilan verebilirim?</h3>
              <p className="mt-1">
                Hesabın <strong>ilan veren</strong> rolündeyse <strong>İlanlarım</strong>{" "}
                sekmesindeki <strong>+ Yeni</strong> butonuyla ilan oluşturabilirsin. Rolünü
                değiştirmek istersen bize yaz.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Güvenlik: şikayet ve engelleme</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Uygunsuz bir ilan, mesaj ya da kullanıcıyı <strong>Profil → Destek / Şikayet</strong>{" "}
              ekranından bildirebilirsin. Bildirimler ekibimiz tarafından incelenir.
            </li>
            <li>
              Bir kullanıcıyı engellediğinde ilanlarını ve mesajlarını görmezsin, sana mesaj
              gönderemez. Engellediklerini <strong>Profil → Engellenen kullanıcılar</strong>{" "}
              ekranından yönetebilirsin.
            </li>
            <li>
              Acil bir güvenlik durumunda önce yetkililere (112) başvur, ardından bize bildir.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Hesap ve veriler</h2>
          <p>
            Hesabını ve verilerini uygulama içinden <strong>Profil → Hesabımı sil</strong> ile
            silebilirsin. Ayrıntılar için{" "}
            <Link href="/hesap-sil" className="font-medium text-primary hover:underline">
              Hesap Silme
            </Link>{" "}
            sayfasına bakabilirsin. Verilerinin nasıl işlendiği{" "}
            <Link href="/gizlilik" className="font-medium text-primary hover:underline">
              Gizlilik Politikası
            </Link>{" "}
            ve{" "}
            <Link href="/kvkk" className="font-medium text-primary hover:underline">
              KVKK Aydınlatma Metni
            </Link>
            &apos;nde açıklanır.
          </p>
        </section>
      </div>
    </div>
  );
}

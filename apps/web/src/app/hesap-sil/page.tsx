export const metadata = {
  title: "Hesap Silme",
  description: "Roomim hesabını ve verilerini nasıl silebileceğini açıklayan sayfa.",
};

export default function AccountDeletionPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Hesabını Sil</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Roomim hesabını ve hesabına bağlı tüm verileri kalıcı olarak silebilirsin.
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <p>
            Roomim (<strong>roomim.com</strong>), üniversite öğrencilerini uyumlu ev
            arkadaşlarıyla eşleştiren bir uygulamadır. Bu sayfa, hesabını ve verilerini nasıl
            sileceğini ve silme sonrası hangi verilerin kaldırıldığını açıklar.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Uygulama içinden silme (önerilen)</h2>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Roomim uygulamasını aç ve hesabınla giriş yap.</li>
            <li>
              <strong>Profil</strong> sekmesine git.
            </li>
            <li>
              <strong>Hesabımı sil</strong> seçeneğine dokun ve onayla.
            </li>
            <li>Hesabın ve verilerin kalıcı olarak silinir; bu işlem geri alınamaz.</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Web üzerinden silme</h2>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              <strong>roomim.com</strong> adresine giriş yap.
            </li>
            <li>
              <strong>Profil</strong> sayfasına git ve <strong>Hesabımı sil</strong> butonunu kullan.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. E-posta ile talep</h2>
          <p>
            Uygulamaya erişemiyorsan, hesabına kayıtlı üniversite e-posta adresinden{" "}
            <a
              href="mailto:destek@roomim.com?subject=Hesap%20Silme%20Talebi"
              className="font-medium text-primary hover:underline"
            >
              destek@roomim.com
            </a>{" "}
            adresine &quot;Hesabımı sil&quot; konulu bir e-posta gönder. Talebini kimliğini
            doğruladıktan sonra makul bir süre içinde işleriz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Silinen veriler</h2>
          <p>Hesabını sildiğinde aşağıdaki veriler kalıcı olarak silinir:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Hesap bilgilerin (üniversite e-postan, adın)</li>
            <li>Profil bilgilerin (fotoğraf, bio, üniversite/bölüm, rol)</li>
            <li>Oluşturduğun ilanlar ve ilan fotoğrafların</li>
            <li>Uyum testi yanıtların ve eşleşme kayıtların</li>
            <li>Diğer kullanıcılarla yaptığın mesajlar ve paylaştığın medya</li>
            <li>Beğendiğin ilanlar ve uygulama içi tercihlerin</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Saklama süresi</h2>
          <p>
            Silme talebin işlendiğinde verilerin sistemlerimizden kalıcı olarak kaldırılır.
            Yalnızca yürürlükteki yasalar gereği tutulması zorunlu olan sınırlı kayıtlar (ör.
            kötüye kullanımın önlenmesi veya yasal yükümlülükler için) gerekli olan asgari süre
            boyunca saklanabilir; bu süre sonunda onlar da silinir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">İletişim</h2>
          <p>
            Sorularının için:{" "}
            <a
              href="mailto:destek@roomim.com"
              className="font-medium text-primary hover:underline"
            >
              destek@roomim.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

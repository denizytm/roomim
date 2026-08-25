export const metadata = {
  title: "Kullanıcı Sözleşmesi",
  description: "Roomim kullanım koşulları ve kullanıcı sözleşmesi.",
};

const updated = "25 Ağustos 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Kullanıcı Sözleşmesi</h1>
      <p className="mt-2 text-sm text-muted-foreground">Son güncelleme: {updated}</p>

      <div className="mt-4 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Bu metin taslaktır; yayına almadan önce bir hukuk danışmanına inceletmen ve kalan resmi
        bilgileri (<strong>[TAM TİCARİ UNVAN]</strong>) doldurman önerilir.
      </div>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Taraflar ve kapsam</h2>
          <p>
            Bu Kullanıcı Sözleşmesi (&quot;Sözleşme&quot;), <strong>HC Dijital</strong>{" "}
            (&quot;Roomim&quot;, &quot;biz&quot;) tarafından işletilen Roomim mobil uygulaması ve{" "}
            <strong>roomim.com</strong> web sitesi (&quot;Platform&quot;) ile bu Platform&apos;u
            kullanan kişi (&quot;Kullanıcı&quot;, &quot;sen&quot;) arasında düzenlenmiştir.
            Platform&apos;a kayıt olarak bu Sözleşme&apos;yi kabul etmiş sayılırsın.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Hizmetin tanımı</h2>
          <p>
            Roomim, üniversite öğrencilerini uyumlu ev arkadaşlarıyla ve oda/ev ilanlarıyla
            buluşturan bir <strong>eşleştirme ve ilan platformudur</strong>. Roomim bir emlak
            aracısı, kiralayan veya kefil değildir; kullanıcılar arasındaki kiralama, ödeme veya
            barınma ilişkisinin <strong>tarafı değildir</strong>. Bu ilişkiler tamamen ilgili
            kullanıcıların sorumluluğundadır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. Kayıt ve hesap</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Kayıt için geçerli bir üniversite (.edu.tr) e-postası ve doğru bilgiler gerekir.</li>
            <li>Hesabın güvenliğinden ve şifrenden sen sorumlusun.</li>
            <li>Platform 18 yaş ve üzeri kullanıcılara yöneliktir.</li>
            <li>Bir kişi yalnızca kendi adına hesap açabilir; hesap devredilemez.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Kullanıcı yükümlülükleri ve yasaklar</h2>
          <p>Platform&apos;u kullanırken aşağıdakileri yapmamayı kabul edersin:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Yanıltıcı, sahte veya gerçek dışı ilan/profil oluşturmak,</li>
            <li>Başkalarını taciz etmek, tehdit etmek, ayrımcılık veya nefret söylemi yaymak,</li>
            <li>Spam, dolandırıcılık, yasa dışı içerik veya izinsiz reklam paylaşmak,</li>
            <li>Başkasının kişisel verilerini izinsiz toplamak veya paylaşmak,</li>
            <li>Platform&apos;un güvenliğini tehlikeye atmak, otomatik veri kazımak (scraping),</li>
            <li>Telif hakkı veya fikri mülkiyet haklarını ihlal eden içerik yüklemek.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">5. Kullanıcı içeriği</h2>
          <p>
            İlan, fotoğraf, mesaj ve profil bilgileri gibi paylaştığın içeriklerden sen
            sorumlusun. Bu içerikleri Platform&apos;da yayınlamamız için bize sınırlı, iptal
            edilebilir bir kullanım izni verirsin. Kurallara aykırı içerikleri önceden bildirim
            olmaksızın kaldırma hakkımız saklıdır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">6. Sorumluluğun sınırlandırılması</h2>
          <p>
            Roomim, kullanıcılar arasındaki iletişim, buluşma veya kiralama ilişkilerinden,
            kullanıcıların paylaştığı bilgilerin doğruluğundan ve üçüncü kişilerin
            eylemlerinden sorumlu değildir. Platform &quot;olduğu gibi&quot; sunulur.
            Güvenliğin için tanımadığın kişilerle iletişimde dikkatli ol.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">7. Hesabın askıya alınması / feshi</h2>
          <p>
            Bu Sözleşme&apos;yi veya yürürlükteki mevzuatı ihlal eden hesapları uyarabilir,
            askıya alabilir (uzaklaştırma) veya kalıcı olarak kapatabiliriz. Hesabını dilediğin
            zaman uygulama içinden silebilirsin.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">8. Kişisel veriler</h2>
          <p>
            Kişisel verilerin işlenmesine ilişkin bilgiler{" "}
            <a href="/kvkk" className="font-medium text-primary hover:underline">
              KVKK Aydınlatma Metni
            </a>{" "}
            ve{" "}
            <a href="/gizlilik" className="font-medium text-primary hover:underline">
              Gizlilik Politikası
            </a>
            &apos;nda açıklanmıştır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">9. Değişiklikler ve yürürlük</h2>
          <p>
            Bu Sözleşme&apos;yi zaman zaman güncelleyebiliriz; önemli değişiklikleri Platform
            üzerinden duyururuz. Güncel sürüm bu sayfada yer alır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">10. Uygulanacak hukuk ve iletişim</h2>
          <p>
            Bu Sözleşme Türkiye Cumhuriyeti hukukuna tabidir; uyuşmazlıklarda{" "}
            <strong>İstanbul (Sarıyer) Mahkemeleri ve İcra Daireleri</strong> yetkilidir.
            İletişim:{" "}
            <a
              href="mailto:destek@roomim.com"
              className="font-medium text-primary hover:underline"
            >
              destek@roomim.com
            </a>{" "}
            · <strong>HC Dijital</strong> — Ayazağa, Vadis Istanbul Park Etabı, Kemerburgaz Cad.
            D:7A Blok, 34396 Sarıyer/İstanbul.
          </p>
        </section>
      </div>
    </div>
  );
}

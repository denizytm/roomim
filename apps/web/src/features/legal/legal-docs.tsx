// Sözleşme/aydınlatma metinlerinin TEK kaynağı. Hem ilgili sayfalar (/kosullar,
// /kvkk, /gizlilik) hem de kayıttaki onay modalı bu bileşenleri kullanır.

const bodyClass = "space-y-8 text-sm leading-relaxed text-foreground/90";

export function TermsBody() {
  return (
    <div className={bodyClass}>
      <section>
        <h2 className="mb-2 text-lg font-semibold">1. Taraflar ve kapsam</h2>
        <p>
          Bu Kullanıcı Sözleşmesi (&quot;Sözleşme&quot;),{" "}
          <strong>HC Dijital Sağlık Teknolojileri Sanayi Ticaret Limited Şirketi</strong>{" "}
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
          kullanıcıların paylaştığı bilgilerin doğruluğundan ve üçüncü kişilerin eylemlerinden
          sorumlu değildir. Platform &quot;olduğu gibi&quot; sunulur. Güvenliğin için tanımadığın
          kişilerle iletişimde dikkatli ol.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">7. Hesabın askıya alınması / feshi</h2>
        <p>
          Bu Sözleşme&apos;yi veya yürürlükteki mevzuatı ihlal eden hesapları uyarabilir, askıya
          alabilir (uzaklaştırma) veya kalıcı olarak kapatabiliriz. Hesabını dilediğin zaman
          uygulama içinden silebilirsin.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">8. Kişisel veriler</h2>
        <p>
          Kişisel verilerin işlenmesine ilişkin bilgiler{" "}
          <a href="/kvkk" target="_blank" className="font-medium text-primary hover:underline">
            KVKK Aydınlatma Metni
          </a>{" "}
          ve{" "}
          <a href="/gizlilik" target="_blank" className="font-medium text-primary hover:underline">
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
          <strong>İstanbul Mahkemeleri ve İcra Daireleri</strong> yetkilidir. İletişim:{" "}
          <a href="mailto:destek@roomim.com" className="font-medium text-primary hover:underline">
            destek@roomim.com
          </a>{" "}
          · <strong>HC Dijital Sağlık Teknolojileri San. Tic. Ltd. Şti.</strong> — Ayazağa Mah.,
          Kemerburgaz Cad., Vadis Istanbul Park, 7A Blok, 34396 Sarıyer/İstanbul.
        </p>
      </section>
    </div>
  );
}

export function PrivacyBody() {
  return (
    <div className={bodyClass}>
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
            <strong>Mesajlaşma:</strong> diğer kullanıcılarla yaptığın yazışmalar ve paylaştığın
            görsel/sesli mesajlar.
          </li>
          <li>
            <strong>Teknik veriler:</strong> oturum bilgileri ve uygulamanın çalışması için gereken
            temel kayıtlar. (Bildirim izni verirsen) push bildirim jetonu.
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
        <p>Verilerin, hizmetin çalışması için gereken hizmet sağlayıcılarla paylaşılır:</p>
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
          veya iletişim kurduğun diğer kullanıcılara gösterilir. Ev adresi asla otomatik
          paylaşılmaz.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">4. Saklama süresi</h2>
        <p>
          Verilerini hesabın aktif olduğu sürece saklarız. Hesabını sildiğinde, hesabına bağlı
          veriler (profil, ilanlar, mesajlar, uyum yanıtların) makul bir süre içinde kalıcı olarak
          silinir.
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
          Verilerin şifreli bağlantı (HTTPS) üzerinden aktarılır ve satır bazlı erişim denetimleri
          (RLS) ile korunur. Yalnızca yetkili kullanıcılar kendi verilerine ve paylaşılması
          amaçlanan bilgilere erişebilir.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">7. Çocukların gizliliği</h2>
        <p>Roomim üniversite öğrencilerine yöneliktir ve 18 yaşından küçüklere hitap etmez.</p>
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
  );
}

export function KvkkBody() {
  return (
    <div className={bodyClass}>
      <section>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, veri
          sorumlusu sıfatıyla{" "}
          <strong>HC Dijital Sağlık Teknolojileri Sanayi Ticaret Limited Şirketi</strong>{" "}
          (&quot;Roomim&quot;) tarafından kişisel verilerinin nasıl işlendiği aşağıda
          açıklanmıştır.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">1. Veri sorumlusu</h2>
        <p>
          <strong>HC Dijital Sağlık Teknolojileri Sanayi Ticaret Limited Şirketi</strong>
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Adres:</strong> Ayazağa, Vadis Istanbul Park Etabı, Kemerburgaz Cad. D:7A
            Blok, 34396 Sarıyer/İstanbul
          </li>
          <li>
            <strong>MERSİS No:</strong> 0461107070200001 ·{" "}
            <strong>Ticaret Sicil No:</strong> 416076-5 (İstanbul Ticaret Sicili)
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
            <strong>Uyum yanıtları:</strong> yaşam tarzına ilişkin tercihler (eşleşme skoru için).
          </li>
          <li>
            <strong>İşlem güvenliği:</strong> oturum kayıtları; (izin verirsen) bildirim jetonu.
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
            Kampanya / duyuru e-postaları (talep edersen) — <em>açık rızan (KVKK m.5/1).</em> Bu
            rızanı dilediğin zaman geri alabilirsin.
          </li>
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">4. Aktarım</h2>
        <p>
          Kişisel verilerin, hizmetin sunulması için gerekli hizmet sağlayıcılarla paylaşılır:
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
          <a href="/hesap-sil" target="_blank" className="font-medium text-primary hover:underline">
            Hesap Silme
          </a>
          ).
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">6. Haklarınız (KVKK m.11)</h2>
        <p>
          Kişisel verilerine erişme, düzeltme, silme, işlemeye itiraz etme ve aktarımı öğrenme
          haklarına sahipsin. Taleplerini uygulama içindeki <strong>Destek / Şikayet</strong>{" "}
          bölümünden veya{" "}
          <a href="mailto:destek@roomim.com" className="font-medium text-primary hover:underline">
            destek@roomim.com
          </a>{" "}
          adresinden iletebilirsin.
        </p>
      </section>
    </div>
  );
}

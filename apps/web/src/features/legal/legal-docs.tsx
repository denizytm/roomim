// Sözleşme/aydınlatma metinlerinin TEK kaynağı. Hem ilgili sayfalar (/kosullar,
// /kvkk, /gizlilik, /cerez) hem de kayıttaki onay modalı bu bileşenleri kullanır.
// Metinler Roomim'in gerçek veri akışına göre yazılmıştır; madde numarası atfı
// yerine sade Türkçe kullanılır. Yayın öncesi hukuk danışmanı onayı önerilir.

const bodyClass = "space-y-8 text-sm leading-relaxed text-foreground/90";

/* ─────────────────────────── KULLANICI SÖZLEŞMESİ ─────────────────────────── */
export function TermsBody() {
  return (
    <div className={bodyClass}>
      <section>
        <h2 className="mb-2 text-lg font-semibold">1. Taraflar ve kapsam</h2>
        <p>
          Bu Kullanıcı Sözleşmesi (&quot;Sözleşme&quot;),{" "}
          <strong>HC Dijital Sağlık Teknolojileri Sanayi Ticaret Limited Şirketi</strong>{" "}
          (&quot;Roomim&quot;, &quot;biz&quot;) tarafından işletilen Roomim mobil uygulaması ve{" "}
          <strong>roomim.com</strong> web sitesi (&quot;Platform&quot;) ile Platform&apos;u
          kullanan kişi (&quot;Kullanıcı&quot;, &quot;sen&quot;) arasında düzenlenmiştir.
          Kayıt olarak bu Sözleşme&apos;yi, Gizlilik Politikası&apos;nı ve KVKK Aydınlatma
          Metni&apos;ni okuduğunu ve kabul ettiğini beyan edersin.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">2. Hizmetin tanımı</h2>
        <p>
          Roomim, üniversite öğrencilerini uyumlu ev arkadaşlarıyla ve oda/ev ilanlarıyla
          buluşturan bir <strong>eşleştirme ve ilan platformudur</strong>. Kullanıcılar profil
          oluşturur, ilan verir/arar, yaşam tarzı sorularını yanıtlayarak bir{" "}
          <strong>uyum skoru</strong> alır ve uygulama içinde birbirleriyle mesajlaşır. Roomim
          bir emlak aracısı, kiralayan, kefil veya taraf <strong>değildir</strong>; kullanıcılar
          arasındaki kiralama, ödeme ve barınma ilişkisinin tarafı olmaz. Bu ilişkiler tamamen
          ilgili kullanıcıların sorumluluğundadır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">3. Ücretlendirme</h2>
        <p>
          Platform&apos;a üyelik ve temel kullanım <strong>ücretsizdir</strong>. İleride ücretli
          özellikler, öne çıkarma veya reklam gelir modelleri sunulabilir; bu durumda ilgili
          koşullar önceden açıkça bildirilir. Reklam veya pazarlama iletişimi yalnızca ayrıca ve
          açıkça izin verdiğin ölçüde yapılır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">4. Kayıt ve hesap</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Kayıt için geçerli bir üniversite (.edu.tr) e-postası ve doğru, güncel bilgiler
            gerekir. E-posta bir doğrulama bağlantısıyla teyit edilir.
          </li>
          <li>Platform 18 yaş ve üzeri kullanıcılara yöneliktir.</li>
          <li>Hesabının ve şifrenin güvenliğinden sen sorumlusun.</li>
          <li>Bir kişi yalnızca kendi adına hesap açabilir; hesap devredilemez, paylaşılamaz.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">5. Kullanıcı içeriği</h2>
        <p>
          İlan, fotoğraf, profil bilgisi, mesaj ve sesli/görsel mesaj gibi paylaştığın
          içeriklerden <strong>sen sorumlusun</strong>. Bu içerikleri Platform&apos;da
          barındırmamız ve amacına uygun göstermemiz için bize sınırlı, dünya çapında, telifsiz
          ve iptal edilebilir bir kullanım izni verirsin. Kurallara veya mevzuata aykırı
          içerikleri önceden bildirim olmaksızın kaldırabilir, gizleyebilir veya
          erişilemez kılabiliriz.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">6. Yasaklı davranışlar</h2>
        <p>Platform&apos;u kullanırken şunları yapmamayı kabul edersin:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Yanıltıcı, sahte, gerçek dışı veya başkasına ait ilan/profil oluşturmak,</li>
          <li>Taciz, tehdit, hakaret, ayrımcılık veya nefret söylemi; müstehcen içerik paylaşmak,</li>
          <li>Spam, dolandırıcılık, yasa dışı içerik veya izinsiz reklam/ticari mesaj göndermek,</li>
          <li>Başka kişilerin kişisel verilerini izinsiz toplamak, paylaşmak veya ifşa etmek,</li>
          <li>
            Platform&apos;un güvenliğini/işleyişini tehlikeye atmak, otomatik veri kazımak
            (scraping), tersine mühendislik yapmak,
          </li>
          <li>Telif hakkı veya fikri mülkiyet haklarını ihlal eden içerik yüklemek,</li>
          <li>Eşleşmeyi/iletişimi ticari, siyasi veya amaç dışı kullanmak.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">7. Güvenlik ve topluluk kuralları</h2>
        <p>
          Kendi güvenliğin için tanımadığın kişilerle iletişimde dikkatli ol, buluşmaları güvenli
          ortamlarda yap ve hassas bilgilerini paylaşmadan önce iki kez düşün. Platform, kullanıcı
          engelleme ve şikayet mekanizmaları sunar; kurallara aykırı davranışları{" "}
          <strong>Destek / Şikayet</strong> üzerinden bildirebilirsin.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">8. Moderasyon, uyarı ve yaptırımlar</h2>
        <p>
          Kural ihlallerinde ilgili içeriği kaldırabilir; kullanıcıya <strong>uyarı</strong>{" "}
          gönderebilir, hesabı geçici olarak <strong>askıya alabilir (uzaklaştırma)</strong> veya
          kalıcı olarak <strong>kapatabiliriz</strong>. Kalıcı olarak yasaklanan bir e-posta ile
          yeniden kayıt engellenebilir. Bu tedbirler, kötüye kullanımın önlenmesi ve topluluğun
          güvenliği amacıyla uygulanır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">9. Sorumluluğun sınırlandırılması</h2>
        <p>
          Platform &quot;olduğu gibi&quot; sunulur. Roomim; kullanıcılar arasındaki iletişim,
          buluşma, kiralama veya ödeme ilişkilerinden, kullanıcıların paylaştığı bilgilerin
          doğruluğundan ve üçüncü kişilerin eylemlerinden sorumlu değildir. Yürürlükteki
          mevzuatın izin verdiği ölçüde, dolaylı zararlardan sorumluluk kabul edilmez.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">10. Fikri mülkiyet</h2>
        <p>
          Roomim markası, logosu, tasarımı ve yazılımı bize aittir; izinsiz kullanılamaz.
          Kullanıcıların paylaştığı içeriklerin mülkiyeti kendilerinde kalır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">11. Hesabın kapatılması / fesih</h2>
        <p>
          Hesabını dilediğin zaman uygulama içindeki <strong>Hesabımı sil</strong> seçeneğiyle
          kalıcı olarak silebilirsin. Sözleşme&apos;yi ihlal etmen halinde hesabını feshedebiliriz.
          Fesih/silme sonrası verilerin{" "}
          <a href="/kvkk" target="_blank" className="font-medium text-primary hover:underline">
            KVKK Aydınlatma Metni
          </a>{" "}
          ve{" "}
          <a href="/hesap-sil" target="_blank" className="font-medium text-primary hover:underline">
            Hesap Silme
          </a>{" "}
          bölümlerindeki esaslara göre işlenir.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">12. Kişisel veriler ve çerezler</h2>
        <p>
          Kişisel verilerinin işlenmesine ilişkin bilgiler{" "}
          <a href="/kvkk" target="_blank" className="font-medium text-primary hover:underline">
            KVKK Aydınlatma Metni
          </a>{" "}
          ve{" "}
          <a href="/gizlilik" target="_blank" className="font-medium text-primary hover:underline">
            Gizlilik Politikası
          </a>
          &apos;nda; çerez kullanımı{" "}
          <a href="/cerez" target="_blank" className="font-medium text-primary hover:underline">
            Çerez Politikası
          </a>
          &apos;nda açıklanmıştır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">13. Değişiklikler ve yürürlük</h2>
        <p>
          Bu Sözleşme&apos;yi zaman zaman güncelleyebiliriz; önemli değişiklikleri Platform
          üzerinden duyururuz. Güncellemeden sonra Platform&apos;u kullanmaya devam etmen, güncel
          sürümü kabul ettiğin anlamına gelir.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">14. Uygulanacak hukuk ve iletişim</h2>
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

/* ─────────────────────────── KVKK AYDINLATMA METNİ ─────────────────────────── */
export function KvkkBody() {
  return (
    <div className={bodyClass}>
      <section>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, veri
          sorumlusu sıfatıyla{" "}
          <strong>HC Dijital Sağlık Teknolojileri Sanayi Ticaret Limited Şirketi</strong>{" "}
          (&quot;Roomim&quot;), kişisel verilerini aşağıda açıklandığı şekilde işler. Amacımız,
          verilerinin hangi amaçlarla işlendiği ve haklarının neler olduğu konusunda seni
          bilgilendirmektir.
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
            <a href="mailto:destek@roomim.com" className="font-medium text-primary hover:underline">
              destek@roomim.com
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">2. İşlediğimiz kişisel veriler</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Kimlik:</strong> ad-soyad; sistemsel üyelik numarası.
          </li>
          <li>
            <strong>İletişim:</strong> üniversite e-posta adresi.
          </li>
          <li>
            <strong>Kimlik doğrulama:</strong> şifren (yalnızca şifrelenmiş/özet biçimde saklanır,
            tarafımızca görülmez).
          </li>
          <li>
            <strong>Eğitim:</strong> üniversite, bölüm, mezuniyet bilgisi.
          </li>
          <li>
            <strong>Profil:</strong> profil fotoğrafı, kısa tanıtım (bio), rol (ev arayan / ev
            sunan).
          </li>
          <li>
            <strong>Uyum yanıtları:</strong> yaşam tarzına ilişkin tercihlerin (uyum skorunu
            hesaplamak için).
          </li>
          <li>
            <strong>İlan ve konum:</strong> ilan başlığı/açıklaması, fiyat/koşullar, ilan
            fotoğrafları ve <strong>yaklaşık konum</strong> (şehir/ilçe/semt düzeyinde; tam adres
            toplanmaz).
          </li>
          <li>
            <strong>İletişim/mesajlaşma:</strong> diğer kullanıcılarla yazışmaların ve paylaştığın
            görsel/sesli mesajlar.
          </li>
          <li>
            <strong>Kullanım/etkileşim:</strong> beğendiğin/geçtiğin ilanlar, eşleşme ve istek
            kayıtları, engellediğin kullanıcılar, üyelik puanı ve referans kodları.
          </li>
          <li>
            <strong>Moderasyon:</strong> gönderdiğin veya hakkında yapılan şikayetler, uyarı ve
            yasaklama kayıtları.
          </li>
          <li>
            <strong>İşlem güvenliği ve teknik:</strong> oturum/çerez bilgileri, kayıt/işlem
            zamanları; (bildirime izin verirsen) cihaz bildirim jetonu.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Roomim, ırk, din, sağlık, cinsel yaşam gibi özel nitelikli kişisel verileri işlemeyi
          amaçlamaz; profiline böyle bilgiler eklememen önerilir.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">3. İşleme amaçlarımız ve hukuki sebepler</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Üyelik oluşturmak, hesabı yönetmek, hizmeti sunmak, ilanları göstermek ve
            kullanıcıların iletişim kurmasını sağlamak —{" "}
            <em>bu hizmeti sana sunabilmek için (sözleşmenin kurulması ve ifası).</em>
          </li>
          <li>
            Uyum skoru hesaplamak ve sana uygun ilan/ev arkadaşı önermek —{" "}
            <em>hizmetin temel işlevi ve talebin gereği.</em>
          </li>
          <li>
            Üniversite e-postasını doğrulamak, sahte hesapları, dolandırıcılığı ve kötüye
            kullanımı önlemek, güvenliği ve moderasyonu sağlamak —{" "}
            <em>meşru menfaatimiz ve hukuki yükümlülüklerimiz gereği.</em>
          </li>
          <li>
            Hesap, doğrulama ve işlem e-postaları ile (izin verirsen) bildirim göndermek —{" "}
            <em>sözleşmenin ifası ve meşru menfaat.</em>
          </li>
          <li>
            Kampanya ve duyuru e-postaları göndermek (yalnızca talep edersen) —{" "}
            <em>açık rızan</em> ile. Bu rızanı dilediğin zaman geri alabilirsin.
          </li>
          <li>
            Yasal taleplere yanıt vermek, hukuki yükümlülükleri yerine getirmek —{" "}
            <em>hukuki yükümlülük.</em>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">4. Otomatik işleme ve profilleme</h2>
        <p>
          Yaşam tarzı yanıtlarını kullanarak, sana daha uyumlu profilleri/ilanları önermek için
          otomatik olarak bir <strong>uyum skoru</strong> hesaplarız. Bu değerlendirme yalnızca{" "}
          <strong>öneri amaçlıdır</strong>; senin için hukuki sonuç doğuran veya seni önemli
          ölçüde etkileyen otomatik bir karar niteliği taşımaz. Kime mesaj atacağına ve kiminle
          iletişim kuracağına her zaman sen karar verirsin.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">5. Verileri nasıl topluyoruz</h2>
        <p>
          Verilerini; kayıt formu, profil ve ilan oluşturma, uyum testi, mesajlaşma ve
          uygulamayı/siteyi kullanman yoluyla <strong>elektronik ortamda</strong>, doğrudan
          senden toplarız. Yukarıdaki hukuki sebeplere dayanır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">6. Kimlerle paylaşıyoruz / aktarım</h2>
        <p>
          Kişisel verilerin, hizmetin sunulması için gerekli olduğu ölçüde aşağıdaki hizmet
          sağlayıcılarla (veri işleyenlerle) paylaşılır:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase</strong> — veritabanı, kimlik doğrulama ve dosya depolama; verileri
            Avrupa Birliği bölgesinde barındırılır.
          </li>
          <li>
            <strong>Resend</strong> — hesap/işlem ve (izinliyse) bildirim e-postalarının
            gönderimi.
          </li>
          <li>
            <strong>Bildirim altyapıları</strong> (Expo ve ilgili işletim sistemi bildirim
            servisleri; ör. Google/Apple) — yalnızca bildirime izin verdiysen, push bildirim
            iletimi için.
          </li>
          <li>
            <strong>Sunucu/barındırma sağlayıcısı</strong> — web uygulamasının çalıştırılması.
          </li>
          <li>
            <strong>Harita sağlayıcısı</strong> (OpenStreetMap) — ilanın yaklaşık bölgesini harita
            üzerinde göstermek için.
          </li>
        </ul>
        <p className="mt-2">
          Ayrıca <strong>diğer kullanıcılar:</strong> profil bilgilerin (ad, üniversite, bölüm,
          fotoğraf, uyum yanıtların özeti) ve ilanların, eşleştiğin veya iletişim kurduğun
          kullanıcılara gösterilir. Ev adresin asla otomatik paylaşılmaz. Yasal zorunluluk
          halinde yetkili kurumlarla paylaşım yapılabilir. Bazı sağlayıcılar yurt dışında
          bulunabilir; bu tür aktarımlar KVKK&apos;nın öngördüğü şartlar çerçevesinde yapılır.
        </p>
        <p className="mt-2">
          <strong>Reklam ve pazarlama:</strong> Kişisel verilerini reklam veya pazarlama amacıyla
          üçüncü kuruluşlara <strong>satmıyor veya paylaşmıyoruz.</strong> İleride reklam (ör.
          Google reklamları) sunmaya başlarsak, bu metni güncelleyecek ve gereken hallerde{" "}
          <strong>açık rızanı</strong> alacağız.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">7. Saklama süresi</h2>
        <p>
          Verilerini, hesabın aktif olduğu sürece ve ilgili mevzuatın öngördüğü süreler boyunca
          saklarız. Hesabını sildiğinde; profil, ilan, mesaj, uyum yanıtların ve yüklediğin
          dosyalar makul bir süre içinde kalıcı olarak silinir (bkz.{" "}
          <a href="/hesap-sil" target="_blank" className="font-medium text-primary hover:underline">
            Hesap Silme
          </a>
          ). Yalnızca yasal yükümlülük veya kötüye kullanımın önlenmesi için tutulması gereken
          asgari kayıtlar sınırlı süre saklanabilir.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">8. Veri güvenliği</h2>
        <p>
          Veriler şifreli bağlantı (HTTPS) üzerinden aktarılır; satır bazlı erişim denetimleri
          (RLS) ile korunur ve yalnızca yetkili kişiler ile paylaşılması amaçlanan bilgilere
          erişilir. Şifreler yalnızca şifrelenmiş/özet biçimde saklanır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">9. Çerezler</h2>
        <p>
          Web sitemizde oturumun açık kalması için gerekli (zorunlu) çerezler kullanılır. Şu an
          reklam veya analitik/izleme çerezi kullanılmamaktadır. Ayrıntılar{" "}
          <a href="/cerez" target="_blank" className="font-medium text-primary hover:underline">
            Çerez Politikası
          </a>
          &apos;nda yer alır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">10. Haklarınız ve başvuru</h2>
        <p>
          Kişisel verilerinle ilgili olarak; işlenip işlenmediğini öğrenme, bilgi talep etme,
          düzeltilmesini/silinmesini isteme, işlemeye itiraz etme, yurt dışına aktarımı öğrenme ve
          zararın giderilmesini talep etme haklarına sahipsin. Taleplerini uygulama içindeki{" "}
          <strong>Destek / Şikayet</strong> bölümünden veya{" "}
          <a href="mailto:destek@roomim.com" className="font-medium text-primary hover:underline">
            destek@roomim.com
          </a>{" "}
          adresinden iletebilirsin. Başvuruların, KVKK&apos;nın öngördüğü şekilde en geç{" "}
          <strong>30 gün</strong> içinde sonuçlandırılır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">11. Değişiklikler</h2>
        <p>
          Bu metni zaman zaman güncelleyebiliriz; güncel sürüm bu sayfada yayımlanır ve önemli
          değişiklikler Platform üzerinden duyurulur.
        </p>
      </section>
    </div>
  );
}

/* ─────────────────────────── GİZLİLİK POLİTİKASI ─────────────────────────── */
export function PrivacyBody() {
  return (
    <div className={bodyClass}>
      <section>
        <p>
          Roomim (<strong>HC Dijital Sağlık Teknolojileri San. Tic. Ltd. Şti.</strong>),
          üniversite öğrencilerini uyumlu ev arkadaşlarıyla eşleştiren bir platformdur. Bu politika
          sade bir özettir; verilerinin işlenmesine ilişkin ayrıntılı ve resmi bilgilendirme{" "}
          <a href="/kvkk" target="_blank" className="font-medium text-primary hover:underline">
            KVKK Aydınlatma Metni
          </a>
          &apos;nde yer alır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">1. Hangi verileri topluyoruz</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Hesap:</strong> üniversite e-postan, adın, üniversite/bölüm/mezuniyet bilgin,
            şifren (şifrelenmiş biçimde).
          </li>
          <li>
            <strong>Profil:</strong> fotoğraf, tanıtım (bio), rol; üyelik puanı ve referans
            kodları.
          </li>
          <li>
            <strong>Uyum yanıtları:</strong> yaşam tarzı sorularına verdiğin cevaplar (uyum skoru
            için).
          </li>
          <li>
            <strong>İlan:</strong> fotoğraf, yaklaşık konum (şehir/ilçe/semt), fiyat ve özellikler.
          </li>
          <li>
            <strong>Mesajlaşma:</strong> yazışmalar ve paylaştığın görsel/sesli mesajlar.
          </li>
          <li>
            <strong>Etkileşim ve güvenlik:</strong> beğeni/eşleşme/engelleme kayıtları,
            şikayetler; oturum bilgileri ve (izin verirsen) bildirim jetonu.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">2. Verileri neden işliyoruz</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Hesabını oluşturmak ve üniversite e-postanı doğrulamak,</li>
          <li>Uyum skorunu hesaplayıp sana uygun ilan/ev arkadaşı önermek,</li>
          <li>İlanları göstermek ve kullanıcıların iletişim kurmasını sağlamak,</li>
          <li>Güvenliği sağlamak, kötüye kullanımı ve sahte hesapları önlemek,</li>
          <li>Sana hesap/işlem e-postaları ve (izinliyse) bildirim göndermek.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">3. Verilerin paylaşımı</h2>
        <p>
          Verilerin, hizmetin çalışması için gereken hizmet sağlayıcılarla paylaşılır:{" "}
          <strong>Supabase</strong> (veritabanı/kimlik/depolama, AB), <strong>Resend</strong>{" "}
          (e-posta), <strong>bildirim altyapıları</strong> (Expo/Google/Apple, yalnızca izinliyse),
          sunucu/barındırma sağlayıcısı ve harita için <strong>OpenStreetMap</strong>. Profil ve
          ilan bilgilerin yalnızca eşleştiğin/iletişim kurduğun diğer kullanıcılara gösterilir. Ev
          adresi asla otomatik paylaşılmaz. Verilerini reklam/pazarlama amacıyla üçüncü
          kuruluşlara <strong>satmıyor veya paylaşmıyoruz</strong>; ileride reklam eklersek metni
          güncelleyip gereken hallerde açık rızanı alırız.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">4. Saklama ve silme</h2>
        <p>
          Verilerini hesabın aktif olduğu sürece saklarız. Hesabını sildiğinde, hesabına bağlı
          veriler (profil, ilanlar, mesajlar, uyum yanıtların, dosyaların) makul bir süre içinde
          kalıcı olarak silinir (bkz.{" "}
          <a href="/hesap-sil" target="_blank" className="font-medium text-primary hover:underline">
            Hesap Silme
          </a>
          ).
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">5. Haklarınız</h2>
        <p>
          Verilerine erişme, düzeltme, silme ve işlemeye itiraz etme haklarına sahipsin.
          Taleplerini uygulama içindeki <strong>Destek / Şikayet</strong> bölümünden veya{" "}
          <a href="mailto:destek@roomim.com" className="font-medium text-primary hover:underline">
            destek@roomim.com
          </a>{" "}
          adresinden iletebilirsin. Resmi haklar ve başvuru usulü için{" "}
          <a href="/kvkk" target="_blank" className="font-medium text-primary hover:underline">
            KVKK Aydınlatma Metni
          </a>
          &apos;ne bakabilirsin.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">6. Güvenlik ve çerezler</h2>
        <p>
          Veriler şifreli bağlantı (HTTPS) üzerinden aktarılır ve satır bazlı erişim denetimleri
          (RLS) ile korunur. Web&apos;de yalnızca oturum için gerekli çerezler kullanılır; ayrıntı{" "}
          <a href="/cerez" target="_blank" className="font-medium text-primary hover:underline">
            Çerez Politikası
          </a>
          &apos;nda.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">7. Çocukların gizliliği ve iletişim</h2>
        <p>
          Roomim üniversite öğrencilerine yöneliktir; 18 yaşından küçüklere hitap etmez. Sorular
          için:{" "}
          <a href="mailto:destek@roomim.com" className="font-medium text-primary hover:underline">
            destek@roomim.com
          </a>
        </p>
      </section>
    </div>
  );
}

/* ─────────────────────────── ÇEREZ POLİTİKASI ─────────────────────────── */
export function CookieBody() {
  return (
    <div className={bodyClass}>
      <section>
        <p>
          Bu politika, <strong>roomim.com</strong> web sitesinde çerezleri nasıl kullandığımızı
          açıklar. Çerezler, siteyi kullandığında tarayıcına kaydedilen küçük dosyalardır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">1. Kullandığımız çerezler</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Zorunlu / oturum çerezleri:</strong> Giriş yapman ve oturumunun açık kalması
            için gereklidir (kimlik doğrulama). Bunlar olmadan site çalışmaz; bu nedenle rıza
            gerektirmez.
          </li>
        </ul>
        <p className="mt-2">
          Şu an <strong>reklam, pazarlama veya analitik/izleme çerezi kullanmıyoruz.</strong>{" "}
          İleride bu tür çerezler eklenirse, bu politika güncellenir ve gereken hallerde rızan
          alınır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">2. Üçüncü taraf çerezleri</h2>
        <p>
          Zorunlu çerezler, kimlik doğrulama sağlayıcımız <strong>Supabase</strong> tarafından
          yönetilir. Bunların dışında pazarlama amaçlı üçüncü taraf çerezi yerleştirmiyoruz.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">3. Çerezleri yönetme</h2>
        <p>
          Tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsin. Ancak oturum
          çerezlerini engellersen giriş yapamaz ve siteyi kullanamazsın.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">4. İletişim</h2>
        <p>
          Sorular için:{" "}
          <a href="mailto:destek@roomim.com" className="font-medium text-primary hover:underline">
            destek@roomim.com
          </a>
        </p>
      </section>
    </div>
  );
}

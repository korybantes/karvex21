# Nakliye Filo Yönetim Sistemi — Proje Şartnamesi (Prompt)
### (Polonya merkezli, AB genelinde operasyon için uyarlanmıştır)

## 0. Genel Tanım

Bir nakliye/lojistik firması için **web tabanlı ve mobil uyumlu (responsive)** bir **Filo & Operasyon Yönetim Sistemi** geliştirilecektir. Firmanın operasyon merkezi **Polonya**'dadır ve taşımacılık **Avrupa Birliği genelinde** yapılmaktadır. Sistem; şoförleri, araçları (tırları), muhasebe/finans süreçlerini, evrak takibini, otomatik hatırlatmaları ve yönetim raporlamasını **tek bir panelden** yönetilebilir hale getirecektir.

**Kullanım şekli:** Telefon, tablet ve bilgisayardan tarayıcı üzerinden erişilebilmeli.

**Dil:** Arayüz **çok dilli** olmalı — varsayılan diller **Türkçe ve Polonya dili (Polski)**, ayrıca **İngilizce** seçeneği bulunmalı (şoförler farklı uyruklarda olabilir: TR, PL, UA, BY vb.). Tarih formatı **GG.AA.YYYY** (AB standardı), ondalık ayracı virgül (AB standardı, örn. 1.234,56).

**Para birimi:** Sistem **çoklu para birimi** destekli olmalı — ana para birimi **PLN (Zloty)**, ayrıca **EUR** ve gerekirse **TRY** kayıtları girilebilmeli. Raporlarda seçilen para birimine göre toplam gösterilebilmeli; sabit veya güncel kur ile PLN karşılığı otomatik hesaplanabilmeli.

**Temel prensip:** Basit, anlaşılır, hızlı.

---

## 1. Teknik Altyapı Önerisi

- **Frontend:** React (veya Next.js) + responsive tasarım (Tailwind CSS), çok dilli altyapı (i18n)
- **Backend:** Node.js (Express/NestJS) veya Python (Django/FastAPI)
- **Veritabanı:** PostgreSQL veya MySQL
- **Dosya depolama:** AB içinde barındırılan depolama tercih edilmeli (ör. AWS eu-central-1/Frankfurt, OVH/Polonya merkezli bulut) — **GDPR/RODO** uyumu için veri AB sınırları içinde tutulmalı
- **Bildirim altyapısı:** E-posta zorunlu; SMS (Polonya numaralarına gönderim destekleyen sağlayıcı, ör. SMSAPI.pl, Twilio) ileride eklenebilir
- **Kimlik doğrulama:** JWT tabanlı, rol bazlı yetkilendirme (RBAC)
- **Excel dışa aktarma:** xlsx, AB muhasebe standartlarına uygun (fatura no, VAT/KDV oranı, NIP alanları dahil)
- **Barındırma:** AB veri merkezi zorunlu (GDPR gereği)

Sistem **modüler mimaride** kurulmalı; ileride "Amazon Relay iş takibi" gibi modüllerin eklenebilmesi için veri modeli esnek tutulmalı (bkz. Bölüm 9).

---

## 2. Kullanıcı Rolleri ve Yetkilendirme

| Rol | Yetkiler |
|---|---|
| **Admin (Firma Sahibi/Yönetici)** | Tam erişim. Tüm modülleri görür, düzenler, siler. Kullanıcı ekler/çıkarır, rol atar. |
| **Muhasebeci (Księgowy/Biuro Rachunkowe)** | Sadece Muhasebe ve Raporlama modülüne erişir. Polonya'da muhasebe genelde dış "biuro rachunkowe" ile yapıldığından, salt-okunur "sadece rapor indirme" alt-yetkisi tanımlanabilmeli. |
| **Şoför (Kierowca)** | Sadece kendi profili: bilgileri, evrakları (yükleme dahil), atanan görevleri, maaş/avans/kesinti dökümü (salt okunur). |

**GDPR/RODO notu:** Şoför, kendi kişisel verilerine erişim/kopya talebini sistem üzerinden iletebilmeli (basit "veri talebi" butonu, admin'e bildirim düşer).

---

## 3. Modül 1 — Şoför Takibi

### 3.1 Şoför Profil Bilgileri
- Ad Soyad, telefon (birden fazla, ülke kodu seçilebilir: +48 PL, +90 TR, +380 UA vb.)
- Uyruk/vatandaşlık
- **PESEL** (Polonya vatandaşları) veya **Pasaport No** (yabancı uyruklu şoförler)
- **Oturum/çalışma izni (Karta pobytu / zezwolenie na pracę):** tür, veriliş, **son geçerlilik tarihi** — AB dışı şoförler için kritik
- **Ehliyet (Prawo jazdy):** sınıf (C, C+E), veriliş ülkesi/tarihi, **son geçerlilik tarihi**
- **Kod 95 (Kwalifikacja wstępna):** AB profesyonel sürücü periyodik eğitim belgesi, geçerlilik tarihi (5 yılda bir yenilenir)
- **Karta kierowcy (dijital takograf sürücü kartı):** kart no, veriliş, **son geçerlilik tarihi** (genelde 5 yıl)
- Psikoteknik/sağlık muayenesi (badania lekarskie i psychologiczne) tarihi ve geçerliliği
- ADR belgesi (tehlikeli madde taşıyorsa, opsiyonel)
- İşe giriş tarihi, sözleşme tipi (umowa o pracę / B2B / umowa zlecenie)
- Aktif/Pasif durumu, adres, acil durum kişisi

### 3.2 Araç Ataması
- Şoför–Araç eşleştirmesi, geçmiş atamalar tarihçe olarak saklanır

### 3.3 Sürüş ve Dinlenme Süreleri Uyumluluğu (AB 561/2006 & AETR)
- Günlük max 9 saat (haftada 2 kez 10 saate uzatılabilir), haftalık max 56 saat, iki haftalık max 90 saat limitlerini hatırlatma amaçlı takip edecek alan
- Başlangıçta manuel giriş/not alanı; ileride takograf API entegrasyonu ile otomatikleştirilebilir (bkz. Bölüm 9)

### 3.4 Maaş / Avans / Ceza / Kesinti Takibi
- Sabit maaş (aylık, PLN, brüt/net ayrımı)
- Avans, ceza (Polonya'da mandat, AB genelinde farklı ülke cezaları), kesinti (ZUS, icra vb.) kayıtları
- **Diyet/harcırah (dieta):** AB'de şoförler için yasal günlük yurt dışı harcırah — gün sayısı × diyet tutarı otomatik hesaplanır, tutar ayarlanabilir parametre
- Net Ödeme = Maaş + Diyet − Avans − Ceza − Kesinti (otomatik)
- Ödeme geçmişi

### 3.5 Belge Yükleme
- Tip etiketleri: Ehliyet, Pasaport/Kimlik, Karta pobytu, Kod 95, Karta kierowcy, Psikoteknik/Sağlık raporu, ADR, Sözleşme, Diğer

### 3.6 Şoför Listesi Görünümü
- Tablo, filtreleme, arama, renkli evrak durum uyarısı

---

## 4. Modül 2 — Araç / Tır Takibi

### 4.1 Araç Bilgileri
- **Plaka (Numer rejestracyjny)** — Polonya formatı + AB içi diğer ülke plakaları desteklenmeli
- Marka/model/yıl/şase no, dorse/römork bilgisi
- Satın alma/**leasing (operacyjny/finansowy)** tarihi ve tipi

### 4.2 Belge ve Süreli İşlemler
- **OC sigortası** (zorunlu trafik) — poliçe no, şirket, tarih, prim
- **AC sigortası** (kasko, opsiyonel)
- **Przegląd techniczny** (periyodik muayene) — otomatik hesaplanan bir sonraki tarih
- **Tachograf kalibrasyonu (legalizacja tachografu):** AB mevzuatına göre 2 yılda bir zorunlu
- **e-TOLL (Polonya) ve diğer AB ülke yol ücreti sistemleri** (Almanya Toll Collect, Avusturya GO-Maut vb.) — ülke bazlı ayrı abonelik/bakiye takibi
- Leasing/taksit: aylık tutar, ödeme günü, kalan taksit, bitiş tarihi

### 4.3 Bakım / Arıza / Lastik / Servis Geçmişi
- Servis kaydı (tarih, işlem, km, maliyet, servis adı/ülkesi, fatura eki), arıza kaydı, lastik değişim kaydı

### 4.4 Araç Başına Masraf Geçmişi
- Tüm masraf kalemleri tek ekranda, tarih aralığı filtresi, **para birimi bazında ayrıştırma (PLN/EUR)**

### 4.5 Araç Listesi Görünümü
- Tablo: Plaka, Marka/Model, Atanan Şoför, Muayene/Sigorta/Takograf Durumu (renkli uyarı)

---

## 5. Modül 3 — Muhasebe ve Finans

### 5.1 Gelir Kayıtları
- Tarih, açıklama, tutar, **para birimi (PLN/EUR)**, KDV/VAT oranı (Polonya standart %23, AB içi hizmetlerde reverse charge desteklenmeli)
- Fatura no, müşteri **NIP/VAT-EU no**, ilişkili araç/şoför, belge eki

### 5.2 Gider Kayıtları
- Kategoriler: **Mazot (Paliwo), Yol Ücreti/Toll, Maaş, Diyet, Muhasebe Gideri, Sigorta, Bakım/Servis, Lastik, Leasing Taksiti, Diğer**
- Tarih, kategori, tutar, para birimi, açıklama, ilişkili araç/şoför, belge eki, KDV oranı

### 5.3 Hesaplamalar (Otomatik)
- Araç başına kâr/zarar (PLN konsolide, EUR görünümü opsiyonel)
- Şoför başına maliyet: Maaş + Diyet + Avans + Kesintiler + Cezalar
- Firma genel kâr/zarar (aylık/yıllık/özel aralık)
- **KDV/VAT özet raporu** (opsiyonel) — Polonya'da JPK_VAT beyannamesine yardımcı ön-rapor niteliğinde (resmi beyanname yerine geçmez)
- Grafikler: aylık trend, araç bazlı kâr/zarar

### 5.4 Belge Yönetimi (Muhasebe)
- Fatura/makbuz/dekont yükleme — Polonya'da faturaların **asgari 5 yıl saklanması** yasal zorunluluk, sistem bu süre dolmadan silmeye izin vermemeli

---

## 6. Modül 4 — Evrak Takibi (Merkezi Arşiv)

- **Firma Belgeleri:** KRS/CEIDG, NIP/REGON, **licencja transportowa** (taşımacılık lisansı), **licencja wspólnotowa** (AB içi taşımacılık için zorunlu topluluk lisansı), OCP (taşıyıcı sorumluluk sigortası)
- **Araç Belgeleri:** Dowód rejestracyjny (ruhsat), sigorta, muayene, takograf kalibrasyon sertifikası, toll abonelikleri
- **Şoför Belgeleri:** Ehliyet, pasaport/kimlik, karta pobytu, Kod 95, karta kierowcy, psikoteknik/sağlık raporu, ADR
- **Muhasebe Evrakları:** Faturalar, dekontlar, sözleşmeler

### 6.1 Ortak Alanlar
- Belge adı/tipi, ilişkili kayıt, yükleme tarihi, son geçerlilik tarihi, dosya, durum (Geçerli/Yaklaşıyor/Süresi Doldu)

### 6.2 Arama ve Filtreleme
- Belge tipi, ilişkili kişi/araç, geçerlilik durumuna göre

---

## 7. Modül 5 — Hatırlatma / Uyarı Sistemi

| Uyarı Konusu | Tetiklenme Zamanı |
|---|---|
| Przegląd techniczny (muayene) yaklaşıyor | 30/15/7 gün kala |
| OC/AC sigortası bitiyor | 30/15/7 gün kala |
| Tachograf kalibrasyonu doluyor | 60/30/15 gün kala (randevu için erken uyarı önerilir) |
| Şoför evrakı bitiyor (ehliyet, karta pobytu, Kod 95, karta kierowcy, psikoteknik) | 30/15/7 gün kala |
| Licencja transportowa/wspólnotowa yenileme yaklaşıyor | 60/30 gün kala |
| Yol ücreti aboneliği bakiyesi/süresi doluyor | Ayarlanabilir |
| Ödeme günü geliyor | 3 gün önce + gün |
| Leasing/taksit günü geliyor | 3 gün önce + gün |

### 7.1 Uyarı Kanalları
- Panel içi bildirim, e-posta; ileride Polonya SMS sağlayıcısı (SMSAPI.pl) veya WhatsApp

### 7.2 Uyarı Yönetim Ekranı
- Önem sırasına göre liste (kırmızı: geçmiş, sarı: yaklaşan), okundu işaretleme + geçmiş kaydı

---

## 8. Modül 6 — Raporlama (Ana Ekran / Dashboard)

1. Bu ay toplam gelir (PLN, geçen aya göre % değişim)
2. Bu ay toplam gider (kategori kırılımı)
3. Net kâr/zarar
4. Araç bazlı kâr/zarar tablosu
5. Yaklaşan ödemeler (30 gün)
6. Yaklaşan evrak bitiş tarihleri (muayene, sigorta, takograf, şoför evrakları, lisanslar dahil)
7. Aktif şoför sayısı
8. Aktif araç sayısı

### 8.1 Detaylı Raporlar
- Tarih aralıklı gelir-gider, şoför bazlı maliyet, araç bazlı kâr/zarar
- **Excel'e dışa aktarma:** Polonya muhasebe formatına uygun (fatura no, NIP, KDV oranı sütunları)

---

## 9. İleride Eklenebilecek Modüller

- **Amazon Relay iş takibi:** Sefer/yük kayıtları, şoför/araç ilişkisi, gelir kayıtlarına otomatik dönüşüm
- **Takograf veri entegrasyonu:** VDO/Continental, Stoneridge gibi üreticilerin API/"remote download" sistemleri ile sürüş-dinlenme sürelerinin otomatik çekilmesi
- **e-TOLL/GO-Box/Toll Collect API entegrasyonu:** Yol ücreti giderlerinin otomatik aktarımı
- **KSeF (Krajowy System e-Faktur) entegrasyonu:** Polonya'da zorunlu hale gelen e-fatura sistemine bağlanma

**Not:** Veritabanı şeması bu modüller düşünülerek esnek tasarlanmalı.

---

## 10. Fonksiyonel Olmayan Gereksinimler

- Responsive tasarım (telefon/tablet/masaüstü)
- Hız: sayfa/rapor yükleme 2 saniyeyi geçmemeli
- **GDPR/RODO Uyumluluğu:**
  - Hassas veriler (PESEL, pasaport, karta pobytu, sağlık raporları) erişimi admin + ilgili şoförle sınırlı
  - Veri saklama süresi politikası tanımlanmalı
  - Kullanıcı veri erişim/silme talebi mekanizması
  - Veri AB sınırları içinde barındırılmalı
- Güvenlik: hash'li şifreler, dosya tip/boyut kontrolü, HTTPS zorunlu
- Yedekleme: günlük otomatik
- Denetim izi (audit log): özellikle finansal/KDV kayıtlarında
- Muhasebe belgeleri Polonya mevzuatına göre asgari 5 yıl saklanmalı
- Çoklu kullanıcı desteği

---

## 11. Özet Veri Modeli (Ana Tablolar)

```
Şoförler (drivers) — pesel/passport, karta_pobytu, kod_95, karta_kierowcy alanları
Araçlar (vehicles) — plate_country alanı (çoklu ülke plakası)
Şoför-Araç Atama Geçmişi (driver_vehicle_assignments)
Maaş/Avans/Ceza/Kesinti/Diyet (driver_payroll_entries)
Araç Masraf Kayıtları (vehicle_expenses) — currency alanı (PLN/EUR)
Gelirler (incomes) — currency, vat_rate, invoice_number, client_nip
Giderler (expenses) — currency, vat_rate, category (toll/fuel/leasing dahil)
Belgeler (documents) — polymorphic ilişki + document_type
Hatırlatmalar/Uyarılar (reminders/notifications)
Kullanıcılar & Roller (users, roles)
Toll/Yol Ücreti Abonelikleri (toll_subscriptions) — ülke bazlı
(İleride) Seferler/İşler (trips/jobs)
(İleride) Takograf Senkron Kayıtları (tachograph_sync_logs)
```

---

## 12. Teslim Beklentisi

1. Veritabanı şeması önce tasarlanıp onaya sunulmalı
2. Geliştirme sırası: **Şoför + Araç Takibi (AB/PL evrak alanları) → Evrak/Hatırlatma Sistemi → Muhasebe/Finans (çoklu para birimi + KDV) → Raporlama Dashboard → Kullanıcı Rolleri**
3. Her modül tamamlandıkça staging ortamında test edilmeli
4. Amazon Relay, takograf API ve KSeF entegrasyonu şimdilik sadece veri modelinde yer ayrılacak şekilde bırakılmalı

---

*Bu doküman, Polonya merkezli ve AB genelinde faaliyet gösteren bir nakliye firması için hazırlanmış, GDPR/RODO ve AB taşımacılık mevzuatına (sürüş-dinlenme süreleri, takograf kalibrasyonu, Kod 95, topluluk lisansı vb.) uyarlanmış eksiksiz bir proje şartnamesidir.*

# Aralıklı tekrar (spaced repetition): SM-2 yerine FSRS

- Durum (Status): Accepted
- Tarih: 2026-06-27
- Karar verenler (Deciders): Principal Architect, Product lead, AI/ML lead
- Danışılanlar (Consulted): Backend lead, Learning Science danışmanı
- Bilgilendirilenler (Informed): Tüm mühendislik ekibi

## Bağlam ve Problem Tanımı (Context and Problem Statement)

Studfy bir öğrenme OS'idir; çekirdek özelliklerinden biri kullanıcının kendi
verisinden üretilen kartlarla aralıklı tekrar (spaced repetition) yapmaktır.
Tekrar zamanlamasını belirleyen scheduling algoritması, öğrenme verimliliğini
doğrudan etkiler: çok sık tekrar zaman israfı, çok seyrek tekrar unutmadır.

Hangi aralıklı tekrar algoritmasını kullanmalıyız? Anki'nin uzun süre varsayılanı
olan klasik **SM-2** mi, yoksa modern, veriye-dayalı **FSRS** (Free Spaced
Repetition Scheduler) mı?

## Karar Sürücüleri (Decision Drivers)

- Öğrenme verimliliği: aynı hatırlama (retention) için daha az tekrar = daha iyi.
- Hedeflenebilir retention: ürün/kullanıcı istenen hatırlama olasılığını (ör. %90)
  ayarlayabilmeli.
- Veriye-dayalı uyarlanabilirlik: algoritma kullanıcının gerçek tekrar geçmişine
  göre kişiselleşebilmeli.
- Uygulama ve bakım maliyeti: kütüphane olgunluğu, açık lisans, dil/runtime uyumu.
- Açıklanabilirlik/güven: zamanlama davranışı makul ve gerekçelendirilebilir olmalı.
- Veri gereksinimi: soğuk başlangıçta (cold start, az veri) makul davranış.

## Değerlendirilen Seçenekler (Considered Options)

- FSRS (Free Spaced Repetition Scheduler)
- SM-2 (klasik SuperMemo/Anki algoritması)
- Basit sabit/heuristik aralıklar (Leitner kutuları benzeri)

## Karar Sonucu (Decision Outcome)

Seçilen seçenek: **"FSRS"**.

FSRS, hafıza için üç bileşenli (difficulty, stability, retrievability) modern bir
bellek modeline dayanır ve parametreleri büyük gerçek tekrar verisiyle (ve
isteğe bağlı olarak kullanıcının kendi geçmişiyle) optimize edilir. SM-2'ye göre
temel üstünlüğü: **hedeflenen retention** (ör. %90) için her kartın bir sonraki
tekrarını daha doğru zamanlar; bu da aynı hatırlama düzeyini **daha az toplam
tekrarla** sağlar. Bağımsız değerlendirmeler ve Anki'nin FSRS'i varsayılan
scheduler yapması, bunun pratikte SM-2'yi geçtiğini gösterir.

Bu, Studfy'ın çekirdek değer önerisiyle (kullanıcının zamanını verimli kullandıran
öğrenme OS'i) doğrudan örtüşür. Ek olarak FSRS açık ve olgun referans
implementasyonlarına sahiptir (Python dahil), bu da Python AI servisimizle (bkz.
ADR-0002) uyumludur ve parametre optimizasyonunu yapılabilir kılar. SM-2'nin
sabit, el-ayarlı sabitleri (ease factor vb.) FSRS'in veriyle öğrenilen
parametrelerinin yanında daha kaba kalır.

### Sonuçlar (Consequences)

- İyi, çünkü aynı hatırlama hedefi için daha az tekrar → kullanıcı zamanını daha
  verimli kullanır; ürünün temel vaadini güçlendirir.
- İyi, çünkü hedef retention ayarlanabilir; ürün/kullanıcı dengeyi (efor vs.
  hatırlama) kontrol eder.
- İyi, çünkü parametreler kullanıcının gerçek verisiyle kişiselleştirilebilir;
  veri biriktikçe zamanlama iyileşir.
- İyi, çünkü açık, olgun implementasyonlar (Python/TS) bakım maliyetini düşürür.
- Kötü, çünkü FSRS SM-2'den daha karmaşıktır; durum (difficulty/stability)
  saklamak ve gerektiğinde parametre optimizasyonu pipeline'ı kurmak gerekir.
- Kötü, çünkü kişiselleştirilmiş optimizasyon anlamlı miktarda tekrar geçmişi
  ister; soğuk başlangıçta varsayılan/global parametrelerle başlanır.
- Nötr/İzlenecek, çünkü FSRS aktif gelişen bir algoritmadır; sürüm değişimlerinde
  parametre/şema göçü (migration) planlanmalı.

### Doğrulama (Confirmation)

- Kart başına FSRS durumu (stability, difficulty, son inceleme, planlanan tarih)
  şemada saklanır ve scheduler bunları kullanır.
- Geçmiş verisi üzerinde "aynı retention için tekrar sayısı" FSRS vs. SM-2 olarak
  kıyaslanır (offline eval); FSRS avantajı doğrulanır.
- Gerçek hatırlama oranının hedef retention'a (ör. %90) yakınsadığı üretim
  metrikleriyle izlenir (kalibrasyon).

## Seçeneklerin Artıları ve Eksileri (Pros and Cons of the Options)

### FSRS (seçilen)

- İyi, çünkü veriye-dayalı, hedef-retention'a göre optimize, daha az tekrarla
  aynı hatırlama; ayarlanabilir ve kişiselleştirilebilir.
- İyi, çünkü olgun açık implementasyonlar (Anki varsayılanı) ve aktif topluluk.
- Kötü, çünkü daha karmaşık; durum saklama ve parametre optimizasyonu gerektirir.

### SM-2

- İyi, çünkü çok basit, anlaşılır, onlarca yıllık kanıtlanmış kullanım; soğuk
  başlangıçta sorunsuz.
- İyi, çünkü uygulaması ve test edilmesi kolay; minimum durum.
- Kötü, çünkü sabit, el-ayarlı katsayılar; hedef retention'a göre kalibre olmaz;
  FSRS'e kıyasla aynı hatırlama için daha fazla tekrar gerektirir.

### Basit sabit/heuristik (Leitner)

- İyi, çünkü en basit; açıklaması çok kolay.
- Kötü, çünkü bireysel zorluk/hatırlama olasılığını modellemez; verimlilik en
  düşük. Öğrenme OS'inin verimlilik vaadiyle bağdaşmaz.

## Daha Fazla Bilgi / İlgili Kayıtlar (Links / Related)

- [ADR-0002](0002-polyglot-node-python-split.md) — FSRS hesaplamaları için Python uyumu
- docs/PRD.md — Aralıklı tekrar / öğrenme verimliliği
- FSRS: https://github.com/open-spaced-repetition/fsrs4anki
- SM-2: https://super-memory.com/english/ol/sm2.htm

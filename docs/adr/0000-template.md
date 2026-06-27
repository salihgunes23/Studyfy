# [kısa başlık: çözülen problem ve çözüm]

- Durum (Status): [proposed | rejected | accepted | deprecated | superseded by [ADR-XXXX](xxxx-ornek.md)]
- Tarih: [YYYY-AA-GG] (en son güncellendiği tarih)
- Karar verenler (Deciders): [karar sürecine dahil olan kişiler]
- Danışılanlar (Consulted): [görüşüne başvurulan kişiler/ekipler]
- Bilgilendirilenler (Informed): [karardan haberdar edilen kişiler/ekipler]

## Bağlam ve Problem Tanımı (Context and Problem Statement)

[Çözmeye çalıştığımız mimari problemi 2-3 cümleyle, serbest formda veya bir
soru biçiminde tanımla. Karar verilmesi gereken bağlamı (teknik kısıtlar, iş
hedefleri, mevcut durum) net biçimde açıkla. Mümkünse karar gerektiren güçleri
(forces) burada özetle.]

<!-- İsteğe bağlı: bu kararı şekillendiren ürün/iş kısıtları (ör. ücretsiz ürün,
gizlilik, sıfır-halüsinasyon) buraya yazılabilir. -->

## Karar Sürücüleri (Decision Drivers)

- [sürücü 1, ör. kısıt, kalite niteliği (quality attribute), maliyet, gizlilik]
- [sürücü 2, ...]
- [sürücü 3, ...]

## Değerlendirilen Seçenekler (Considered Options)

- [Seçenek 1]
- [Seçenek 2]
- [Seçenek 3]

## Karar Sonucu (Decision Outcome)

Seçilen seçenek: "[Seçenek X]", çünkü [gerekçe — karar sürücülerini nasıl
karşıladığı, hangi sürücünün belirleyici olduğu].

### Sonuçlar (Consequences)

- İyi (Good), çünkü [olumlu sonuç, ör. bir kalite niteliğinin iyileşmesi]
- Kötü (Bad), çünkü [olumsuz sonuç, ör. teknik borç, ek operasyonel yük]
- Nötr/İzlenecek (Neutral), çünkü [tarafsız ama takip edilmesi gereken etki]

### Doğrulama (Confirmation)

[Kararın doğru uygulandığı nasıl doğrulanacak? Ör. mimari uyum testi (fitness
function), kod review kriteri, ölçülecek metrik.]

## Seçeneklerin Artıları ve Eksileri (Pros and Cons of the Options)

### [Seçenek 1]

[isteğe bağlı kısa açıklama]

- İyi, çünkü [argüman]
- İyi, çünkü [argüman]
- Kötü, çünkü [argüman]

### [Seçenek 2]

- İyi, çünkü [argüman]
- Kötü, çünkü [argüman]

### [Seçenek 3]

- İyi, çünkü [argüman]
- Kötü, çünkü [argüman]

## Daha Fazla Bilgi / İlgili Kayıtlar (Links / Related)

- [İlgili ADR'ler, RFC'ler, PRD bölümleri, dış kaynaklar]
- [Bu kararı geçersiz kılan/kılınan ADR bağlantıları]

<!--
Bu şablon MADR 4.0.0 (https://adr.github.io/madr/) temel alınarak Studfy için
Türkçeleştirilmiştir. Yeni ADR oluştururken bu dosyayı kopyalayın, numara verin
ve gereksiz bölümleri silin (her bölüm zorunlu değildir; ama Bağlam, Karar
Sonucu ve Sonuçlar her zaman doldurulmalıdır).
-->

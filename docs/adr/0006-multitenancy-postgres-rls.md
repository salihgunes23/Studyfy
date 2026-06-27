# Çok kiracılılık (multi-tenancy): PostgreSQL Row-Level Security (RLS)

- Durum (Status): Accepted
- Tarih: 2026-06-27
- Karar verenler (Deciders): Principal Architect, Backend lead, Security lead
- Danışılanlar (Consulted): AI/ML lead, DevOps, Data lead
- Bilgilendirilenler (Informed): Tüm mühendislik ekibi

## Bağlam ve Problem Tanımı (Context and Problem Statement)

Studfy her kullanıcıya kişisel, şifreli bir çalışma alanı (workspace) verir.
Verinin gizliliği çekirdek vaattir: bir kullanıcının verisi asla başka bir
kullanıcıya sızmamalı. Sistem birçok bağımsız servis (NestJS Core API, FastAPI
AI servisi, arka plan worker'ları) içerir ve hepsi aynı veriye erişir.

Kiracı izolasyonunu nerede ve nasıl uygulamalıyız? İzolasyon yalnızca uygulama
kodunun "WHERE user_id = ?" disiplinine mi bırakılmalı, yoksa veritabanı
seviyesinde mi zorlanmalı?

## Karar Sürücüleri (Decision Drivers)

- Sızıntıya karşı dayanıklılık: tek bir unutulmuş `WHERE` cümlesi veri sızıntısına
  yol açmamalı; izolasyon "default-deny" olmalı.
- Çok servisli erişim: Node ve Python servisleri, worker'lar aynı izolasyon
  kuralına tabi olmalı (kuralı her yerde yeniden yazmadan).
- Operasyonel basitlik / maliyet: ücretsiz ürün; kiracı başına ayrı DB/şema
  binlerce kullanıcıda sürdürülemez.
- Derinlemesine savunma (defense-in-depth): uygulama hatası olsa bile son savunma
  hattı veritabanında olmalı.
- RAG ile uyum: vektör araması da (pgvector) aynı izolasyondan otomatik faydalanmalı.

## Değerlendirilen Seçenekler (Considered Options)

- Tek DB, paylaşılan şema + PostgreSQL Row-Level Security (RLS) ve `tenant_id`
- Yalnızca uygulama-katmanı filtreleme (her sorguda elle `tenant_id` filtresi)
- Kiracı başına ayrı şema veya ayrı veritabanı (silo)

## Karar Sonucu (Decision Outcome)

Seçilen seçenek: **"Tek DB, paylaşılan şema + PostgreSQL RLS"**.

Tüm kiracı-kapsamlı tablolar bir `tenant_id` (kullanıcı çalışma alanı) sütunu
taşır ve üzerlerinde RLS politikaları etkin olur. Her istek/işlem başında,
bağlantıda oturum değişkeni ayarlanır (örn. `SET app.current_tenant = '<uuid>'`)
ve RLS politikaları satırları bu değişkene göre filtreler. İzolasyon kararı
böylece **veritabanına** taşınır: uygulama kodu `tenant_id` filtresini unutsa
bile veritabanı yanlış kiracının satırlarını döndürmez (default-deny).

Bu, çok servisli mimariyle mükemmel uyumludur: Node, Python ve worker'lar yalnızca
oturum tenant'ını doğru ayarlamakla yükümlüdür; izolasyon mantığını yeniden
yazmazlar. pgvector vektörleri de aynı tablolarda yaşadığı için RAG araması da
otomatik olarak kiracı-izole olur (bkz. ADR-0003, ADR-0005). Tek DB/şema, ücretsiz
ürün için gereken operasyonel ve maliyet basitliğini sağlar. "Şifreli çalışma
alanı" vaadi, RLS'in üstüne uygulama/sütun seviyesinde şifreleme ile katmanlanır;
RLS erişim sınırını, şifreleme ise gizliliği sağlar (defense-in-depth).

### Sonuçlar (Consequences)

- İyi, çünkü izolasyon default-deny ve veritabanı-zorunlu; tek unutulmuş filtre
  sızıntıya dönüşmez. Bu, en güçlü güvenlik getirisidir.
- İyi, çünkü tüm servisler/worker'lar aynı kuralı miras alır; izolasyon mantığı
  tek yerde (DB politikası) yaşar.
- İyi, çünkü tek DB/şema operasyonel ve maliyet açısından en sürdürülebilir;
  binlerce ücretsiz kullanıcıyı taşır.
- İyi, çünkü pgvector araması da aynı izolasyondan otomatik faydalanır.
- Kötü, çünkü her bağlantıda tenant context'inin doğru ve **güvenilir** biçimde
  ayarlanması kritik bir invariant; connection pooling ile yanlış kurulursa
  context sızıntısı riski (bağlantı geri verilmeden önce reset şart).
- Kötü, çünkü RLS politikaları sorgu planlamasına ek yük getirir ve hata ayıklamayı
  (debug) zorlaştırabilir; yanlış yazılmış politika işlevsel hatalara yol açar.
- Nötr/İzlenecek, çünkü "süper kullanıcı"/admin/analitik erişimleri RLS'i bypass
  etmeyi gerektirir; bu yollar dikkatle ve denetimle (audit) yönetilmeli.

### Doğrulama (Confirmation)

- Tenant context ayarlanmadan kiracı-kapsamlı bir tabloya yapılan sorgunun **sıfır**
  satır döndürdüğü (veya hata verdiği) entegrasyon testiyle doğrulanır.
- "Tenant A bağlamında Tenant B verisini görmeye çalış" testi her CI koşusunda
  çalışır (güvenlik regresyon testi).
- Connection pool'da bağlantı iadesinde tenant değişkeninin sıfırlandığı doğrulanır.
- Yeni eklenen her kiracı-kapsamlı tabloda RLS'in etkin olduğu lint/migration
  kontrolüyle zorlanır.

## Seçeneklerin Artıları ve Eksileri (Pros and Cons of the Options)

### Tek DB + RLS (seçilen)

- İyi, çünkü veritabanı-zorunlu, default-deny izolasyon; çok servisli mimariyle
  doğal uyum; düşük operasyon/maliyet.
- İyi, çünkü pgvector dahil tüm veri aynı politikadan faydalanır.
- Kötü, çünkü tenant context yönetimi (pooling) hassas; politika hataları riskli.

### Yalnızca uygulama-katmanı filtreleme

- İyi, çünkü en basit zihinsel model; özel DB özelliği gerektirmez.
- Kötü, çünkü izolasyon tamamen geliştirici disiplinine bağlı; tek hatalı sorgu
  = sızıntı. Çok servisli ortamda kuralı her yerde tekrar uygulamak gerekir.
  Studfy'ın gizlilik vaadi için kabul edilemez derecede kırılgan.

### Kiracı başına ayrı şema / DB (silo)

- İyi, çünkü en güçlü fiziksel izolasyon; "gürültülü komşu" ve sızıntı riski en az.
- Kötü, çünkü binlerce ücretsiz kullanıcıda şema/DB sayısı operasyonel olarak
  sürdürülemez (migration, bağlantı, yedekleme patlaması); maliyet ve karmaşıklık
  ürün modeliyle bağdaşmaz.

## Daha Fazla Bilgi / İlgili Kayıtlar (Links / Related)

- [ADR-0003](0003-vector-store-pgvector-then-qdrant.md) — Vektörler aynı DB'de, aynı RLS
- [ADR-0005](0005-rag-zero-hallucination-guardrails.md) — "Yalnızca kullanıcının verisi"
- [ADR-0002](0002-polyglot-node-python-split.md) — Çok servisli erişim modeli
- docs/PRD.md — Per-user şifreli çalışma alanları
- PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

# Vektör deposu: MVP'de pgvector, ölçekte Qdrant

- Durum (Status): Accepted
- Tarih: 2026-06-27
- Karar verenler (Deciders): Principal Architect, AI/ML lead, Backend lead
- Danışılanlar (Consulted): DevOps, Data lead
- Bilgilendirilenler (Informed): Tüm mühendislik ekibi

## Bağlam ve Problem Tanımı (Context and Problem Statement)

Studfy'ın RAG'i, kullanıcının kendi verisinden (notlar, dökümanlar, transkriptler)
üretilen embedding'leri (bge-m3, 1024 boyut) saklayıp benzerlik (ANN) araması
yapmayı gerektirir. Aramalar her zaman kiracı (kullanıcı) bazında izole olmalı
(bkz. ADR-0006) ve metadata filtreleriyle birleştirilmelidir.

MVP'de hangi vektör deposunu kullanmalıyız? Ayrı, özel bir vektör veritabanı mı
yoksa zaten kullandığımız PostgreSQL'in bir eklentisi mi? Karar, hem bugünkü
basitliği hem de yarınki ölçeği gözetmeli.

## Karar Sürücüleri (Decision Drivers)

- Operasyonel basitlik (MVP): yeni bir altyapı bileşeni minimum tutulmalı; ürün
  ücretsiz, maliyet ve bakım yükü kritik.
- Transactional tutarlılık: chunk metadata'sı, kaynak (citation) referansları ve
  vektör aynı transaction'da yazılabilmeli (sıfır-halüsinasyon için kaynak
  bütünlüğü önemli).
- Kiracı izolasyonu: RLS ile aynı erişim modelinden faydalanabilmek.
- Ölçeklenme yolu: kullanıcı/veri büyüdüğünde ANN performansının (latency,
  recall) sürdürülebilir olması.
- Geçiş maliyeti: ileride taşınırsa migration'ın yönetilebilir olması.

## Değerlendirilen Seçenekler (Considered Options)

- pgvector (MVP) → Qdrant (ölçekte) — kademeli yaklaşım
- Baştan yalnızca Qdrant (veya başka adanmış vektör DB: Milvus/Weaviate)
- Baştan yalnızca pgvector ve orada kalmak

## Karar Sonucu (Decision Outcome)

Seçilen seçenek: **"MVP'de pgvector, ölçekte Qdrant"**.

MVP'de pgvector seçilir çünkü zaten PostgreSQL 16 kullanıyoruz; vektörler
ilişkisel veriyle aynı veritabanında, aynı transaction'da, aynı RLS politikaları
altında yaşar. Bu, "tek veritabanı" basitliğini, kaynak/chunk bütünlüğünü ve
kiracı izolasyonunu bedava verir — erken aşamada en değerli şey budur. Vektör
erişim katmanı bir arayüz (repository/port) arkasına alınır; böylece veri ve
sorgu hacmi pgvector'ın HNSW indeksinin rahat servis edemeyeceği seviyeye
geldiğinde (yüksek recall + düşük p99 latency hedefleri tutmazsa), Qdrant'a
geçiş yalnızca o portun implementasyonunu değiştirmekle sınırlı kalır. Qdrant;
gelişmiş filtreli ANN, payload indeksleri, quantization ve yatay ölçeklenme
sunduğu için ölçek hedefidir.

### Sonuçlar (Consequences)

- İyi, çünkü MVP tek bir veri deposuyla çalışır; daha az hareketli parça, daha
  düşük operasyonel ve maliyet yükü.
- İyi, çünkü vektör + metadata + citation aynı transaction'da yazılır; kısmi
  yazımdan doğan tutarsızlık riski yok.
- İyi, çünkü RLS ile kiracı izolasyonu vektör aramasına da otomatik uygulanır.
- İyi, çünkü port soyutlaması sayesinde Qdrant'a geçiş kapsamı sınırlı tutulur.
- Kötü, çünkü iki implementasyonu (pgvector + Qdrant) sürdürme ve aralarındaki
  semantik farkları (filtreleme, skor) yönetme borcu doğar.
- Kötü, çünkü pgvector çok yüksek ölçekte ANN performansında adanmış DB'lerin
  gerisinde kalır; geçiş zamanlamasını iyi seçmek gerekir.
- Nötr/İzlenecek, çünkü geçiş bir veri taşıma (re-embedding/migration) operasyonu
  gerektirebilir; bunun planı önceden hazır olmalı.

### Doğrulama (Confirmation)

- Vektör erişimi tek bir `VectorStore` portu üzerinden gider; doğrudan pgvector
  SQL'i servis kodlarına sızmaz (kod review kriteri).
- ANN için p95/p99 latency ve recall@k metrikleri izlenir; tanımlı eşik
  aşıldığında Qdrant geçişi tetiklenir (fitness function).
- Aynı RAG test kümesi her iki backend'de çalışır ve sonuç eşdeğerliği test edilir.

## Seçeneklerin Artıları ve Eksileri (Pros and Cons of the Options)

### pgvector (MVP) → Qdrant (ölçekte)

- İyi, çünkü erken aşamada tek DB basitliği + transactional bütünlük + RLS.
- İyi, çünkü ölçek için net bir çıkış yolu (Qdrant) ve port soyutlaması var.
- Kötü, çünkü iki backend'i destekleme ve geçiş maliyeti.

### Baştan yalnızca Qdrant (veya Milvus/Weaviate)

- İyi, çünkü ANN performansı ve filtreli arama özellikleri en güçlüsü; ölçek
  için doğrudan hazır.
- Kötü, çünkü gün bir yeni bir dağıtık bileşen, ayrı backup/HA, ve vektör ile
  ilişkisel veri arasında transactional tutarlılık kaybı.
- Kötü, çünkü RLS izolasyonunu uygulama katmanında ayrıca garanti etmek gerekir;
  ücretsiz ürün için fazladan maliyet ve operasyon.

### Baştan yalnızca pgvector ve orada kalmak

- İyi, çünkü en basit, tek backend.
- Kötü, çünkü çok yüksek hacimde ANN latency/recall hedefleri risk altına girer;
  ölçek tavanına çarpınca acil ve plansız migration zorunlu kalır.

## Daha Fazla Bilgi / İlgili Kayıtlar (Links / Related)

- [ADR-0005](0005-rag-zero-hallucination-guardrails.md) — RAG ve citation bütünlüğü
- [ADR-0006](0006-multitenancy-postgres-rls.md) — RLS ile kiracı izolasyonu
- [ADR-0007](0007-self-host-whisper-embeddings-cost.md) — bge-m3 embedding'leri
- pgvector: https://github.com/pgvector/pgvector
- Qdrant: https://qdrant.tech/

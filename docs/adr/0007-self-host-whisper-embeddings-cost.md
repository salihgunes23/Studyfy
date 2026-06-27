# Whisper (large-v3) ve bge-m3 embedding'lerini self-host etmek (maliyet)

- Durum (Status): Accepted
- Tarih: 2026-06-27
- Karar verenler (Deciders): Principal Architect, AI/ML lead, Finance/Cost owner
- Danışılanlar (Consulted): DevOps, Backend lead
- Bilgilendirilenler (Informed): Tüm mühendislik ekibi

## Bağlam ve Problem Tanımı (Context and Problem Statement)

Studfy **ücretsiz** bir üründür; marjinal kullanıcı başı maliyet vaadi bozacak
kadar büyürse ürün sürdürülemez. İki yüksek-hacimli ML iş yükü var: (1) ses/video
transkripsiyonu (Whisper) ve (2) RAG için embedding üretimi (her chunk + her
sorgu). Bu işler kullanıcı sayısıyla doğrusal (hatta süper-doğrusal) büyür.

Bu iş yüklerini yönetilen (managed) API'lerden mi tüketmeliyiz, yoksa modelleri
kendimiz mi host etmeliyiz?

## Karar Sürücüleri (Decision Drivers)

- Maliyet (en kritik): ücretsiz üründe transkripsiyon ve embedding token/dakika
  başına ödenen API'lerle ölçekte sürdürülemez; bunlar yüksek-hacimli, tahmin
  edilebilir iş yükleri.
- Gizlilik: kullanıcı ses ve içerikleri üçüncü taraf API'lere gönderilmemeli
  (per-user şifreli çalışma alanı vaadiyle uyum).
- Kalite: transkripsiyon (özellikle Türkçe ve çok-dilli) ve embedding kalitesi
  RAG doğruluğunu doğrudan etkiler.
- Operasyonel kapasite: GPU altyapısını işletme yükü ile API'nin kolaylığı arasında
  takas.
- Reasoning farkı: akıl yürütme (Claude) ile mekanik ML (transkripsiyon/embedding)
  farklı kararlar; reasoning'i self-host etmiyoruz (bkz. ADR-0004).

## Değerlendirilen Seçenekler (Considered Options)

- Whisper large-v3 + bge-m3 self-host (GPU), reasoning için yine de yönetilen
  Claude (seçilen)
- Tamamen yönetilen API'ler (transkripsiyon + embedding dahil her şey dışarıdan)
- Hibrit: embedding'i yönetilen API'den, transkripsiyonu self-host (veya tersi)

## Karar Sonucu (Decision Outcome)

Seçilen seçenek: **"Whisper large-v3 ve bge-m3'ü self-host etmek"**.

Transkripsiyon ve embedding; yüksek-hacimli, tahmin edilebilir ve "mekanik"
(reasoning gerektirmeyen) iş yükleridir — tam da sabit bir GPU maliyetinin
değişken/kullanım-başı API maliyetini yendiği profil. Belirli bir ölçeğin
üzerinde, dakika-başı/token-başı ödemek yerine GPU'ları amorti etmek kullanıcı
başına maliyeti çok düşürür; bu, ücretsiz ürün modeli için belirleyicidir.
Ayrıca self-host, kullanıcı seslerinin ve içeriklerinin dış API'lere hiç
çıkmamasını sağlayarak gizlilik vaadini güçlendirir.

Model seçimleri: **Whisper large-v3** çok-dilli (Türkçe dahil) transkripsiyonda
güçlü ve açık; **bge-m3** çok-dilli, uzun-bağlamlı ve hibrit (yoğun+seyrek)
retrieval'a uygun güçlü bir embedding modelidir — RAG kalitesini destekler.

Önemli sınır: bu karar yalnızca transkripsiyon ve embedding içindir. **Akıl
yürütme** (RAG sentezi, verifier) self-host edilmez; orada Claude (yönetilen,
ADR-0004) kullanılır çünkü frontier reasoning modellerini self-host etmenin
maliyet/kalite dengesi tutmaz. Yani "neyi self-host edersin" sorusunun cevabı
iş yükünün doğasına göre ayrışır.

### Sonuçlar (Consequences)

- İyi, çünkü ölçekte kullanıcı başı transkripsiyon/embedding maliyeti dramatik
  düşer; ücretsiz model sürdürülebilir hale gelir.
- İyi, çünkü kullanıcı sesi/içeriği üçüncü taraflara gitmez; gizlilik vaadi güçlenir.
- İyi, çünkü model sürümü, dil ayarı ve batching üzerinde tam kontrol; RAG kalitesini
  ince ayarlayabiliriz.
- Kötü, çünkü GPU altyapısını işletmek (kapasite planlama, kuyruk, otoscale,
  driver/runtime bakımı) gerçek bir operasyonel yük ve sabit maliyet getirir.
- Kötü, çünkü düşük hacimde (erken günlerde) atıl GPU, yönetilen API'den pahalı
  olabilir; kırılım noktası (break-even) izlenmeli.
- Nötr/İzlenecek, çünkü trafik dalgalıysa GPU kullanımını verimli tutmak (batch,
  serverless GPU, spot) ayrı bir mühendislik çabası ister.

### Doğrulama (Confirmation)

- Kullanıcı başına ML maliyeti (transkripsiyon dk + embedding) izlenir ve yönetilen
  API alternatifiyle periyodik kıyaslanır; self-host avantajı sürmeli (fitness
  function: maliyet/kullanıcı eşik altında).
- Türkçe/çok-dilli transkripsiyon WER ve RAG retrieval recall@k eval setleriyle
  ölçülür; kalite yönetilen alternatiflerin gerisinde kalmamalı.
- GPU kullanım oranı (utilization) izlenir; düşükse hacme göre serverless/managed'a
  geçiş yeniden değerlendirilir.

## Seçeneklerin Artıları ve Eksileri (Pros and Cons of the Options)

### Self-host (Whisper large-v3 + bge-m3)

- İyi, çünkü ölçekte en düşük marjinal maliyet ve en güçlü gizlilik.
- İyi, çünkü model/dil/batch üzerinde tam kontrol.
- Kötü, çünkü GPU operasyonu ve sabit maliyet; düşük hacimde verimsiz olabilir.

### Tamamen yönetilen API'ler

- İyi, çünkü sıfır operasyon, anında ölçek, düşük başlangıç çabası; erken günlerde
  ideal.
- Kötü, çünkü yüksek hacimde dakika/token başı maliyet ücretsiz üründe sürdürülemez.
- Kötü, çünkü kullanıcı ses/içeriği dış sağlayıcılara gider; gizlilik vaadiyle çelişir.

### Hibrit (biri self-host, biri yönetilen)

- İyi, çünkü daha pahalı/hacimli iş yükünü self-host edip diğerini yönetilen
  bırakarak risk dengelenebilir; kademeli geçiş için pratik bir ara durak.
- Kötü, çünkü iki farklı operasyon/maliyet modelini aynı anda yönetmek gerekir;
  uzun vadede ikisi de yüksek-hacimli olduğundan ikisini de self-host etmenin
  getirisi daha yüksek.

## Daha Fazla Bilgi / İlgili Kayıtlar (Links / Related)

- [ADR-0002](0002-polyglot-node-python-split.md) — Python AI servisi (ML host'u)
- [ADR-0004](0004-llm-gateway-litellm-claude-primary.md) — Reasoning self-host edilmez
- [ADR-0003](0003-vector-store-pgvector-then-qdrant.md) — bge-m3 embedding'leri
- [ADR-0005](0005-rag-zero-hallucination-guardrails.md) — RAG kalitesi
- docs/PRD.md — Ücretsiz ürün ve maliyet kontrolü
- Whisper large-v3: https://github.com/openai/whisper
- bge-m3: https://huggingface.co/BAAI/bge-m3

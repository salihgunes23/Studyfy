# Polyglot mimari: Node (NestJS) Core API + Python (FastAPI) AI servisi ayrımı

- Durum (Status): Accepted
- Tarih: 2026-06-27
- Karar verenler (Deciders): Principal Architect, Backend lead, AI/ML lead
- Danışılanlar (Consulted): Frontend lead, DevOps
- Bilgilendirilenler (Informed): Tüm mühendislik ekibi

## Bağlam ve Problem Tanımı (Context and Problem Statement)

Studfy iki çok farklı sorumluluğa sahiptir: (1) klasik uygulama mantığı — kimlik
doğrulama, çok kiracılılık (multi-tenancy), CRUD, faturalama/kotalar, gerçek
zamanlı API'ler; (2) ağır ML iş yükü — Whisper ile transkripsiyon, embedding
üretimi, RAG pipeline'ı (LangGraph/LlamaIndex), reranking, doğrulama (verifier)
geçişi.

Tek bir dilde/runtime'da mı kalmalıyız, yoksa sorumlulukları dile göre mi
ayırmalıyız? Node ekosistemi web/API için olgun; Python ise ML için fiilen
standart (Whisper, transformers, LlamaIndex, sentence-transformers olgun ve
yalnızca Python'da birinci sınıf).

## Karar Sürücüleri (Decision Drivers)

- ML ekosistem olgunluğu: Whisper, `transformers`, LlamaIndex, LangGraph,
  `sentence-transformers`/bge-m3 → Python'da birinci sınıf, Node'da değil.
- Web/API üretkenliği ve tip güvenliği: NestJS + TypeScript, frontend ile tip
  paylaşımı ve olgun web tooling.
- Operasyonel izolasyon: ML iş yükleri (GPU, uzun süren işler) API'nin gecikme
  (latency) ve ölçeklenme profilini bozmamalı.
- Ekip uzmanlığı: backend mühendisleri TS, ML mühendisleri Python kullanır.
- Karmaşıklık maliyeti: ek bir runtime, ağ sınırı (network boundary) ve sözleşme
  yönetimi getirir; bunu haklı çıkaracak değer olmalı.

## Değerlendirilen Seçenekler (Considered Options)

- Polyglot ayrım: NestJS Core API (Node) + FastAPI AI servisi (Python)
- Tek dil — yalnızca Node/TypeScript (ML'i JS kütüphaneleri/ONNX ile)
- Tek dil — yalnızca Python (Core API'yi de FastAPI/Django ile)

## Karar Sonucu (Decision Outcome)

Seçilen seçenek: **"Polyglot ayrım: NestJS Core API + FastAPI AI servisi"**.

Belirleyici sürücü ML ekosistem olgunluğudur. Whisper large-v3, bge-m3 ve
LlamaIndex/LangGraph gibi araçların Node muadilleri ya yok ya da olgunlaşmamış;
bunları JS'te yeniden üretmek büyük ve sürekli bir borç olur. Aynı zamanda Core
API'nin web odaklı işleri (auth, RLS bağlamı, kotalar, realtime) NestJS +
TypeScript'te frontend ile tip paylaşarak çok daha üretken yazılır. İki servis
HTTP (ve uzun işler için kuyruk) üzerinden, paylaşılan ve sürümlenen bir API
sözleşmesiyle (OpenAPI'den üretilen tipler) haberleşir. Ek ağ sınırı maliyeti,
her iki tarafın da kendi olgun ekosisteminde kalmasının getirisiyle fazlasıyla
karşılanır. Ayrıca ML iş yükünün ayrı servis olması, GPU'lu node'larda bağımsız
ölçeklenmeyi ve Core API'nin latency profilinin korunmasını sağlar.

### Sonuçlar (Consequences)

- İyi, çünkü her sorumluluk kendi olgun ekosisteminde yazılır; "yanlış dilde ML"
  veya "yanlış dilde web" borcundan kaçınılır.
- İyi, çünkü AI servisi bağımsız (ör. GPU'lu) ölçeklenir ve hataları Core API'yi
  doğrudan düşürmez (bulkhead/izolasyon).
- İyi, çünkü ekip uzmanlığıyla hizalı: TS ekibi API'de, ML ekibi Python'da.
- Kötü, çünkü iki runtime, iki CI hattı, iki gözlemlenebilirlik (observability)
  kurulumu ve servisler arası sözleşme yönetimi gerektirir.
- Kötü, çünkü ağ sınırı; dağıtık sistem karmaşıklığı (timeout, retry, idempotency,
  partial failure) getirir.
- Nötr/İzlenecek, çünkü iki servisin lokal geliştirme deneyimi (docker-compose)
  ve sözleşme drift'i sürekli bakım ister.

### Doğrulama (Confirmation)

- AI servisi OpenAPI şeması yayınlar; Core API ve frontend tipler buradan üretilir
  ve sözleşme uyumu CI'da test edilir (contract test).
- AI servisinin bağımsız deploy/rollback edilebildiği pipeline'da doğrulanır.
- Servisler arası çağrılarda timeout/retry/circuit-breaker politikalarının var
  olduğu kod review kriteridir.

## Seçeneklerin Artıları ve Eksileri (Pros and Cons of the Options)

### Polyglot: NestJS + FastAPI

- İyi, çünkü her iki domain de en olgun araçlarını kullanır.
- İyi, çünkü bağımsız ölçeklenme ve hata izolasyonu.
- Kötü, çünkü dağıtık sistem ve çift tooling maliyeti.

### Yalnızca Node/TypeScript

- İyi, çünkü tek runtime, tek dil, en basit operasyon ve tam tip paylaşımı.
- Kötü, çünkü Whisper/transformers/LlamaIndex'in olgun Node muadili yok; ONNX
  ile self-host ML'de sürekli savaşmak gerekir. Sıfır-halüsinasyon RAG için
  gereken reranker/verifier araçları Python'da çok daha zengin.
- Kötü, çünkü CPU-yoğun ML işleri Node event loop'unu bloklar; worker yönetimi
  zahmetli.

### Yalnızca Python

- İyi, çünkü ML birinci sınıf ve tek dil.
- Kötü, çünkü web/API katmanında TS'in tip güvenliği ve frontend ile tip
  paylaşımı kaybedilir; NestJS'in olgun yapısal avantajları yok.
- Kötü, çünkü ML iş yükü ile düşük-gecikmeli API aynı runtime'da çakışır;
  izolasyon zorlaşır.

## Daha Fazla Bilgi / İlgili Kayıtlar (Links / Related)

- [ADR-0001](0001-monorepo-turborepo.md) — Monorepo içinde polyglot yerleşimi
- [ADR-0004](0004-llm-gateway-litellm-claude-primary.md) — LLM gateway AI servisinde
- [ADR-0007](0007-self-host-whisper-embeddings-cost.md) — Self-host ML iş yükü
- docs/PRD.md — Teknoloji yığını

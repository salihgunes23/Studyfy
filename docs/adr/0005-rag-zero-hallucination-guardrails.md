# Sıfır-halüsinasyon RAG: zorunlu citation + doğrulama (verifier) geçişi

- Durum (Status): Accepted
- Tarih: 2026-06-27
- Karar verenler (Deciders): Principal Architect, AI/ML lead, Product lead
- Danışılanlar (Consulted): Backend lead, Trust & Safety
- Bilgilendirilenler (Informed): Tüm mühendislik ekibi

## Bağlam ve Problem Tanımı (Context and Problem Statement)

Studfy'ın temel vaadi: AI **yalnızca kullanıcının kendi verisinden** yanıt verir,
her iddia **zorunlu citation** taşır ve uydurma (hallucination) ürünün kabul
edemeyeceği bir hatadır. Bir öğrenme ürününde yanlış ama kendinden emin bir
bilgi, doğru bilginin yokluğundan daha zararlıdır.

Standart RAG (retrieve → generate) bunu garanti etmez: model retrieval boş/yetersiz
olduğunda dahi akıcı ama temelsiz (ungrounded) yanıt üretebilir. RAG pipeline'ını
"sıfır-halüsinasyon" hedefini somut olarak zorlayacak şekilde nasıl tasarlamalıyız?

## Karar Sürücüleri (Decision Drivers)

- Kaynağa sadakat (groundedness): her iddia getirilen (retrieved) bağlamla
  desteklenmeli; aksi halde yanıt verilmemeli.
- Zorunlu, denetlenebilir citation: kullanıcı her cümlenin kaynağını görebilmeli.
- "Bilmiyorum" diyebilme: yeterli kaynak yoksa model güvenle reddetmeli, uydurmamalı.
- Doğruluk > akıcılık/hız: ek bir doğrulama geçişinin maliyet ve latency'si kabul
  edilebilir; güven (trust) ürünün çekirdeği.
- Ölçülebilirlik: groundedness ve citation doğruluğu metrik olarak izlenebilmeli.

## Değerlendirilen Seçenekler (Considered Options)

- Saf (naive) RAG: retrieve → generate, prompt'ta "kaynak kullan" talimatı
- Citation-zorunlu RAG: yapılandırılmış citation + retrieval eşik (threshold)
  guardrail'leri, verifier yok
- Guardrail'li RAG + ayrı doğrulama (verifier) geçişi (seçilen)

## Karar Sonucu (Decision Outcome)

Seçilen seçenek: **"Guardrail'li RAG + ayrı verifier geçişi"**.

Pipeline (LangGraph ile orkestre edilen, durumlu/stateful bir graf olarak):

1. **Retrieve + rerank**: bge-m3 ile getirme, ardından reranker; her chunk
   kaynak referansını (doküman, konum) taşır.
2. **Yeterlilik kapısı (sufficiency gate)**: rerank skoru/kapsam eşik altındaysa
   pipeline üretmeden "bu konuda yeterli kaynağın yok" yanıtına dallanır (controlled
   refusal). Bu, en güçlü tek guardrail'dir: girdi temelsizse üretim yapılmaz.
3. **Generate (kaynak-sınırlı)**: model yalnızca getirilen bağlamı kullanacak ve
   her iddiayı yapılandırılmış citation (chunk id) ile işaretleyecek şekilde
   kısıtlanır. Birincil model Claude (bkz. ADR-0004).
4. **Verifier geçişi**: ayrı bir LLM çağrısı, üretilen her iddiayı atıfta
   bulunulan kaynak metinle karşılaştırır (claim-to-source entailment). Desteklenmeyen
   iddia varsa: ya çıkarılır ya yanıt reddedilir/yeniden üretilir. Verifier,
   üreten modelden bağımsız bir "ikinci göz"dür.
5. **Sunum**: yalnızca doğrulanmış, atıflı içerik kullanıcıya gösterilir.

Bu, "doğruluk > akıcılık" sürücüsünü doğrudan uygular: ekstra latency ve LLM
maliyeti, ürünün güven vaadini garanti altına almak için bilinçli bir takastır.

### Sonuçlar (Consequences)

- İyi, çünkü temelsiz (ungrounded) içerik üretim ve doğrulama olmak üzere iki
  ayrı kapıdan geçemez; halüsinasyon yüzeyi büyük ölçüde kapanır.
- İyi, çünkü zorunlu, yapılandırılmış citation kullanıcı güvenini ve denetlenebilirliği
  artırır; "kaynağı göster" her zaman mümkündür.
- İyi, çünkü sufficiency gate sayesinde model "bilmiyorum" diyebilir; yanlış-emin
  yanıtların önüne geçilir.
- Kötü, çünkü her sorgu için en az iki LLM çağrısı (generate + verify) latency ve
  maliyeti artırır — ücretsiz ürün için maliyet baskısı (bu yüzden routing/ucuz
  model verifier'da değerlendirilebilir).
- Kötü, çünkü verifier'ın kendisi de bir LLM'dir ve %100 mükemmel değildir; nadir
  yanlış-pozitif (geçerli iddiayı reddetme) ve yanlış-negatif olabilir.
- Nötr/İzlenecek, çünkü çok katı eşikler "kapsam yok" yanıtlarını artırıp algılanan
  yararlılığı düşürebilir; eşikler veriyle kalibre edilmeli.

### Doğrulama (Confirmation)

- Groundedness/citation-doğruluğu için etiketli bir eval seti tutulur; her
  pipeline değişikliğinde regresyon testi olarak çalışır (fitness function).
- "Tuzak" (cevabı veride olmayan) sorularda sistemin reddetme oranı ölçülür;
  hedef: temelsiz yanıt ~0.
- Üretimde, citation içermeyen veya verifier'dan geçmeyen yanıtın kullanıcıya
  ulaşması mümkün değildir (mimari invariant, testle doğrulanır).

## Seçeneklerin Artıları ve Eksileri (Pros and Cons of the Options)

### Saf (naive) RAG

- İyi, çünkü en basit, en hızlı, en ucuz.
- Kötü, çünkü groundedness garantisi yok; boş/zayıf retrieval'da uydurma serbest.
  Studfy'ın temel vaadini ihlal eder.

### Citation-zorunlu RAG (verifier yok)

- İyi, çünkü citation ve eşik guardrail'leri ile naive'den çok daha güvenli;
  tek LLM çağrısıyla daha ucuz/hızlı.
- Kötü, çünkü modelin kendi citation'ı yanlış olabilir (uydurma atıf / atıfla
  desteklenmeyen iddia); bağımsız bir doğrulama olmadan yakalanmaz.

### Guardrail'li RAG + verifier geçişi (seçilen)

- İyi, çünkü bağımsız ikinci kontrol claim-to-source uyumunu zorlar; en güçlü
  groundedness garantisi.
- İyi, çünkü sufficiency gate kontrollü reddetmeyi mümkün kılar.
- Kötü, çünkü ek LLM çağrısı = ek latency + maliyet; karmaşıklık artar.

## Daha Fazla Bilgi / İlgili Kayıtlar (Links / Related)

- [ADR-0004](0004-llm-gateway-litellm-claude-primary.md) — Generate/verifier modelleri
- [ADR-0003](0003-vector-store-pgvector-then-qdrant.md) — Retrieval altyapısı
- [ADR-0006](0006-multitenancy-postgres-rls.md) — Yalnızca kullanıcının verisi (izolasyon)
- [ADR-0007](0007-self-host-whisper-embeddings-cost.md) — bge-m3 + reranker
- docs/PRD.md — Sıfır-halüsinasyon RAG vaadi

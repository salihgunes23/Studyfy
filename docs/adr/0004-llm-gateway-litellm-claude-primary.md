# LLM gateway olarak LiteLLM; birincil akıl yürütme için Claude (Opus/Sonnet)

- Durum (Status): Accepted
- Tarih: 2026-06-27
- Karar verenler (Deciders): Principal Architect, AI/ML lead
- Danışılanlar (Consulted): Backend lead, Finance/Cost owner, DevOps
- Bilgilendirilenler (Informed): Tüm mühendislik ekibi

## Bağlam ve Problem Tanımı (Context and Problem Statement)

Studfy'ın AI servisi (FastAPI) birden çok LLM çağrısı yapar: RAG sentezi, soru
üretimi, doğrulama (verifier) geçişi, sınıflandırma. Tek bir sağlayıcıya doğrudan
bağlanmak; vendor lock-in, sağlayıcı kesintisinde (outage) tüm ürünün düşmesi,
model bazında yönlendirme (routing) ve maliyet/kullanım takibinin zorluğu gibi
riskler doğurur.

LLM çağrılarını nasıl soyutlamalıyız ve birincil akıl yürütme modeli ne olmalı?

## Karar Sürücüleri (Decision Drivers)

- Akıl yürütme kalitesi: Sıfır-halüsinasyon RAG ve verifier geçişi, talimata
  sıkı uyum ve güçlü muhakeme gerektirir; uzun bağlam (context) önemli.
- Sağlayıcı bağımsızlığı / failover: tek sağlayıcı kesintisi tüm ürünü
  düşürmemeli; yedek (fallback) zinciri olmalı.
- Maliyet kontrolü: ürün ücretsiz; model seçimi ve kullanım izleme merkezi
  yönetilmeli (ucuz model = sınıflandırma, güçlü model = sentez/verifier).
- Geliştirme hızı: tek, tutarlı bir çağrı arayüzü; sağlayıcı eklemek kod
  değişikliği değil, config değişikliği olmalı.
- Gözlemlenebilirlik: token/maliyet/latency başına model ve özellik bazında izleme.

## Değerlendirilen Seçenekler (Considered Options)

- LiteLLM gateway + Claude (Opus/Sonnet) birincil + çok-sağlayıcı failover
- Tek sağlayıcının SDK'sine doğrudan bağlanmak (gateway yok)
- Başka bir gateway/router (ör. OpenRouter, kendi yazdığımız ince soyutlama)

## Karar Sonucu (Decision Outcome)

Seçilen seçenek: **"LiteLLM gateway + Claude (Opus/Sonnet) birincil reasoning +
sağlayıcı failover"**.

Birincil akıl yürütme modeli olarak Claude ailesi seçilir: karmaşık sentez,
doğrulama (verifier) ve uzun-bağlamlı RAG görevlerinde Claude **Opus** en güçlü
muhakemeyi ve talimat uyumunu sağlar; yüksek hacimli ve maliyet-duyarlı görevler
için Claude **Sonnet** fiyat/performans dengesini verir. Bu hizalanma, sıfır-
halüsinasyon hedefiyle doğrudan örtüşür çünkü kaynağa-sadakat ve "bilmiyorum"
diyebilme davranışı modelin talimat uyumuna bağlıdır.

LiteLLM, tüm çağrıların önüne tek ve tutarlı (OpenAI-uyumlu) bir arayüz koyar:
sağlayıcı eklemek/değiştirmek config işidir, failover zinciri (örn. Claude →
yedek sağlayıcı) tanımlanabilir, ve token/maliyet izleme merkezîdir. Böylece
Claude'a bağlı kalırken sağlayıcı kesintilerine karşı dayanıklılık ve görev
bazında model yönlendirme (model routing) elde edilir. Görev–model eşlemesi
config'te yaşar; kod sabit bir modele bağlanmaz.

### Sonuçlar (Consequences)

- İyi, çünkü en zorlu görevlerde (verifier, sentez) Claude Opus/Sonnet'in güçlü
  muhakemesi sıfır-halüsinasyon hedefini destekler.
- İyi, çünkü LiteLLM ile failover, sağlayıcı kesintisinde ürünün ayakta
  kalmasını sağlar; tek nokta arıza (SPOF) azalır.
- İyi, çünkü maliyet/token izleme ve görev-bazlı model routing merkezîdir; pahalı
  modeli yalnızca gerektiğinde kullanırız (ücretsiz ürün için kritik).
- İyi, çünkü yeni sağlayıcı/model eklemek kod değil config değişikliğidir.
- Kötü, çünkü LiteLLM ek bir operasyonel bileşen ve potansiyel darboğaz/SPOF
  olabilir; HA kurulumu ve sürüm takibi gerekir.
- Kötü, çünkü failover'da yedek modelin davranışı farklı olabilir; prompt'ların
  ve çıktı sözleşmelerinin sağlayıcılar arası taşınabilirliği test edilmeli.
- Nötr/İzlenecek, çünkü model fiyatları ve yetenekleri hızla değişir; görev–model
  eşlemesi periyodik gözden geçirilmelidir.

### Doğrulama (Confirmation)

- Tüm LLM çağrıları LiteLLM üzerinden gider; AI servisinde doğrudan sağlayıcı
  SDK çağrısı bulunmaz (kod review kriteri).
- Birincil sağlayıcı zorlandığında (chaos/fault injection) failover'ın devreye
  girdiği test edilir.
- Özellik ve model bazında token/maliyet/latency dashboard'da izlenir; kullanıcı
  başına maliyet bütçe eşiğinin altında tutulur.

## Seçeneklerin Artıları ve Eksileri (Pros and Cons of the Options)

### LiteLLM + Claude birincil + failover

- İyi, çünkü tek tutarlı arayüz, config-tabanlı routing, merkezî maliyet/izleme
  ve çok-sağlayıcı failover.
- İyi, çünkü Claude Opus/Sonnet en zorlu reasoning görevlerinde güçlü; Sonnet
  maliyeti dengeler.
- Kötü, çünkü ek bileşen (gateway) operasyon ve HA yükü getirir.

### Doğrudan sağlayıcı SDK'si (gateway yok)

- İyi, çünkü en az hareketli parça, en düşük latency overhead.
- Kötü, çünkü failover, routing ve merkezî maliyet izleme elle yazılmalı; vendor
  lock-in yüksek; sağlayıcı kesintisi tüm ürünü düşürür.

### Başka gateway (OpenRouter vb.) / kendi soyutlamamız

- İyi, çünkü OpenRouter çok geniş model kataloğu sunar; kendi soyutlamamız tam
  kontrol verir.
- Kötü, çünkü OpenRouter dış bağımlılık ve veri/gizlilik açısından ek değerlendirme
  ister; kendi soyutlamamız ise LiteLLM'in hazır verdiği (routing, fallback,
  budget, logging) her şeyi yeniden yazmak demektir.

## Daha Fazla Bilgi / İlgili Kayıtlar (Links / Related)

- [ADR-0002](0002-polyglot-node-python-split.md) — AI servisi (FastAPI)
- [ADR-0005](0005-rag-zero-hallucination-guardrails.md) — Verifier ve sentez modelleri
- [ADR-0007](0007-self-host-whisper-embeddings-cost.md) — Maliyet kontrol stratejisi
- LiteLLM: https://docs.litellm.ai/
- Claude API: https://docs.anthropic.com/

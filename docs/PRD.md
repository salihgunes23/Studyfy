# Studfy — Ürün Gereksinimleri Dokümanı (PRD)

> **AI-Native Öğrenme İşletim Sistemi**
> Tüm çalışma, dökümantasyon, yapay zeka asistanlığı ve interaktif öğrenmeyi tek çatıda toplayan, Linear/Notion/Perplexity sadeliğinde, sınırları zorlayan eğitim ekosistemi.

| | |
|---|---|
| **Doküman Sürümü** | 1.0 (Foundation) |
| **Durum** | Onay Bekliyor → MVP Planlama |
| **Sahip** | CPO / Baş Yazılım Mimarı |
| **Hedef Kitle** | Öğrenciler (YKS, üniversite), akademisyenler, araştırmacılar |
| **İş Modeli** | Tamamen ücretsiz, üyelik tabanlı, kullanıcı-izole şifreli veri alanı |

---

## 0. İçindekiler

1. [Vizyon ve Ürün Felsefesi](#1-vizyon-ve-ürün-felsefesi)
2. [Kullanıcı Personaları ve Jobs-to-be-Done](#2-kullanıcı-personaları-ve-jobs-to-be-done)
3. [Modül Modül Fonksiyonel Gereksinimler](#3-modül-modül-fonksiyonel-gereksinimler)
   - 3.1 Multimodal Evrensel Yükleme (Anything-to-Data)
   - 3.2 Akıllı Tasnif & Semantik Veri Tabanı
   - 3.3 Kademeli Anlatım & Hiper-Kişisel AI Asistanı
   - 3.4 Sıfır-Halüsinasyon İnteraktif Test Motoru
   - 3.5 Vektör Arama, RAG & Global Kütüphane
   - 3.6 Analitik, Çalışma Koçu & Spaced Repetition
4. [Sistem Mimarisi ve Teknoloji Yığını](#4-sistem-mimarisi-ve-teknoloji-yığını)
5. [Veri Tabanı Şeması](#5-veri-tabanı-şeması)
6. [AI / RAG / LLM Pipeline'ları](#6-ai--rag--llm-pipelineları)
7. [UI/UX Sayfa Planları ve Tasarım Sistemi](#7-uiux-sayfa-planları-ve-tasarım-sistemi)
8. [Güvenlik, Mahremiyet ve Şifreleme](#8-güvenlik-mahremiyet-ve-şifreleme)
9. [Maliyet, Ölçeklenebilirlik ve Ücretsizlik Stratejisi](#9-maliyet-ölçeklenebilirlik-ve-ücretsizlik-stratejisi)
10. [Yol Haritası ve MVP Kapsamı](#10-yol-haritası-ve-mvp-kapsamı)
11. [Kabul Kriterleri ve Metrikler](#11-kabul-kriterleri-ve-metrikler)

---

## 1. Vizyon ve Ürün Felsefesi

### 1.1 Tek Cümlelik Vizyon
> "Öğrenci ne yüklerse yüklesin — taranmış el yazısı, amfi ses kaydı, 400 sayfalık PDF — Studfy onu saniyeler içinde **anlaşılabilir, sorgulanabilir, test edilebilir ve dinlenebilir** bilgiye çevirir; bunu yaparken arayüz hiçbir zaman karmaşıklaşmaz."

### 1.2 Temel İlkeler (Product Principles)

| İlke | Anlamı | Tasarım Sonucu |
|---|---|---|
| **Maksimum İşlevsellik, Sıfır Karmaşa** | Onlarca ağır araç, ama tek bir akışkan yüzey | Command Palette (`⌘K`), tab-tabanlı workspace, ilerlemeli açığa çıkarma (progressive disclosure) |
| **Sonsuz Özgürlük** | Ücretsiz + kullanıcıya ait şifreli alan | Per-user envelope encryption, veri taşınabilirliği (export everything) |
| **Sıfır Halüsinasyon** | AI yalnızca kullanıcının verisinden konuşur | Strict RAG guardrail + zorunlu kaynak atıfı (citation) |
| **Bağlamsal Süreklilik** | Her cevap, kullanıcının tüm geçmişini bilir | Kişisel vektör hafıza + semantik ilişkilendirme |
| **Erişilebilirlik** | Yolda, otobüste, gözler kapalı öğrenme | Podcast/TTS modu, klavye-öncelikli, offline-first PWA |

### 1.3 Rakip Konumlandırma
Studfy = **NotebookLM'in RAG disiplini** + **Notion'un çalışma yüzeyi** + **Anki'nin tekrar motoru** + **Perplexity'nin atıf kültürü** — hepsi *ücretsiz* ve *kullanıcı-izole şifreli*.

---

## 2. Kullanıcı Personaları ve Jobs-to-be-Done

| Persona | Bağlam | Ana JTBD |
|---|---|---|
| **Elif – YKS Öğrencisi (12. sınıf)** | Defter fotoğrafı + PDF soru bankası | "Defterimi yükleyip, ondan bana özgün deneme sınavı üret." |
| **Mert – Tıp Fakültesi 2. sınıf** | Amfi ses kaydı + 600 slaytlık ders | "Dersi yazıya dök, 3 saatlik anlatımı 10 dk'lık özete indir." |
| **Dr. Ayşe – Akademisyen** | Onlarca makale PDF'i | "Yüklediğim makaleler arası semantik bağları bul, literatür haritası çıkar." |
| **Kerem – Yolda öğrenen** | Zamanı kısıtlı, görselden çok sesli | "Notlarımı podcast yap, yürürken dinleyeyim." |

---

## 3. Modül Modül Fonksiyonel Gereksinimler

### 3.1 Multimodal Evrensel Yükleme (Anything-to-Data)

**Amaç:** Dosya türü ayrımı yapmadan her girdiyi işlenebilir veriye çevirmek.

#### Desteklenen Girdi Matrisi

| Kategori | Formatlar | İşleme Motoru | Çıktı |
|---|---|---|---|
| **Dijital doküman** | PDF (text-layer), DOCX, XLSX, CSV, TXT, RTF, MD, EPUB | `unstructured.io` + format parser'ları | Yapısal metin + tablo + meta |
| **Taranmış / görsel** | Taranmış PDF, JPEG, PNG, WEBP, HEIC | OCR: Gemini 2.x Vision / GPT-4o-vision + Tesseract fallback | Metin + layout |
| **El yazısı** | Defter fotoğrafı, tahta fotoğrafı | Vision-LLM (handwriting prompt zinciri) | Temizlenmiş metin |
| **Ses** | MP3, WAV, M4A, OGG | Whisper-large-v3 (self-host) / Deepgram | Zaman damgalı transkript |
| **Video** | MP4, MOV + YouTube linki | `yt-dlp` → audio extract → Whisper | Transkript + zaman damgası |

#### İşleme Akışı (Yüksek Seviye)
```
Upload → Virüs taraması → MIME tespiti → Format yönlendirici
   → [parser | OCR | STT] → Normalize (Markdown + JSON metadata)
   → Chunking → Embedding → Vektör DB + Postgres
   → Otomatik tasnif (3.2) → Kullanıcıya "Hazır" bildirimi
```

#### Fonksiyonel Gereksinimler (FR)
- **FR-1.1** Sürükle-bırak, panodan yapıştır (Ctrl+V görsel), mobil kamera, URL ile girdi.
- **FR-1.2** Yükleme anında **optimistic UI**: dosya kartı "İşleniyor" durumunda anında görünür; arka planda iş kuyruğu (BullMQ/Celery) çalışır.
- **FR-1.3** Büyük dosyalar için **resumable/chunked upload** (tus protokolü).
- **FR-1.4** Her dosyanın işleme durumu canlı (queued → extracting → embedding → ready → failed) WebSocket ile yansıtılır.
- **FR-1.5** HEIC/format dönüşümleri sunucu tarafında şeffaf yapılır.
- **FR-1.6** Video/ses için zaman damgalı segmentler saklanır → arama "ses kaydının 14:32'sinde" diyebilsin.

---

### 3.2 Akıllı Tasnif, Sınıflandırma ve Semantik Veri Tabanı

**Amaç:** Kullanıcı dosyayı bırakır bırakmaz AI dersi/konuyu/alt başlığı tespit edip otomatik klasörler.

#### FR
- **FR-2.1 Otomatik Klasörleme:** İçerik embedding + LLM sınıflandırıcı → `{ders, konu, alt_başlık, etiketler[], güven_skoru}`. Düşük güvende kullanıcıya tek-tık doğrulama önerilir.
- **FR-2.2 Taksonomi Öğrenir:** Kullanıcının mevcut klasör yapısı few-shot olarak prompt'a beslenir; sistem kullanıcının kendi terminolojisini benimser (örn. "İleri Matematik" vs "Calculus II").
- **FR-2.3 Semantik İlişkilendirme:** Yeni dosya yüklendiğinde, kosinüs benzerliği eşiğini geçen mevcut dökümanlarla bağ kurulur → öneri kartı: *"2 hafta önceki Makroekonomi notunla bugünkü enflasyon makalesi örtüşüyor — birleştireyim mi?"*
- **FR-2.4 Knowledge Graph:** Dosyalar, konular ve kavramlar arası ilişkiler graf olarak tutulur (Postgres + `pgvector`, opsiyonel Neo4j). "Konu haritası" görselleştirmesini besler.
- **FR-2.5 Duplicate/Versiyon Tespiti:** Aynı içeriğin yeniden yüklenmesi tespit edilir (content hash + embedding), versiyon olarak bağlanır.

---

### 3.3 Kademeli Anlatım, Özetleme ve Hiper-Kişisel AI Asistanı

**Amaç:** Her dosya için aynı anda 3 katmanlı bilgi mimarisi + sesli çıktı.

#### Üç Katman (her dosya için otomatik üretilir)
1. **⚡ Hızlı Bakış (Bullet Points):** Sınavdan 10 dk önce okunacak hayati özet. Maks 15 madde.
2. **📚 Akademik Derinlik:** Terimler, formüller (KaTeX), tablolar, kaynak atıflı tam metin.
3. **🧸 Analojik Anlatım ("5 yaşındaymışım gibi"):** Günlük hayattan benzetme + hikâye. Soyut kavramları sıfırdan kurar.

> Üç katman **lazy + paralel** üretilir: kullanıcı sekmesini açtığında varsa cache'ten gelir, yoksa stream edilir.

#### Sesli Asistan & Podcast Jeneratörü
- **FR-3.1** Herhangi bir katman tek tıkla **TTS**'e dönüşür (ElevenLabs / OpenAI TTS / Coqui self-host). Ultra-gerçekçi ses, hız kontrolü (0.75×–2×).
- **FR-3.2 Podcast Modu:** İki sesli "host" diyalog formatında bir ders bölümünü konuşur (NotebookLM Audio Overview benzeri). Bölüm bölüm indirilebilir MP3.
- **FR-3.3** Üretilen sesler kullanıcının "Dinleme Kuyruğu"na eklenir; offline indirme + arka plan oynatma (PWA media session).
- **FR-3.4 Konuşan Asistan (Chat):** Workspace içi sohbet; tüm cevaplar kullanıcının dökümanlarına atıflı (kaynak çipleri tıklanınca ilgili sayfaya/dakikaya götürür).

---

### 3.4 %100 Bağlamsal, Sıfır-Halüsinasyon İnteraktif Test Motoru

**Amaç:** Yalnızca kullanıcının verisinden soru üretmek + yanlışta kaynak göstererek yeniden anlatmak.

#### Strict Guardrails
- **FR-4.1** Soru üretimi **zorunlu retrieval** ile başlar. LLM'e yalnızca retrieve edilen chunk'lar verilir; sistem prompt'u: *"Yalnızca verilen kaynaktan üret. Kaynakta yoksa SORU ÜRETME."*
- **FR-4.2 Grounding doğrulaması:** Üretilen her sorunun cevabı, kaynak chunk'a karşı ikinci bir "verifier" LLM çağrısıyla doğrulanır (claim → evidence eşlemesi). Eşleşmeyen soru elenir.
- **FR-4.3** Her soru `source_chunk_id` + `source_locator` (PDF s.14, ¶3 / ses 14:32) taşır.

#### Soru Tipleri
- Çoktan seçmeli (5 şıklı YKS/üniversite formatı)
- Doğru/Yanlış
- Boşluk doldurma
- Eşleştirme
- Açık uçlu (klasik) — LLM rubric ile değerlendirir

#### Akıllı Geri Bildirim & Akreditasyon
- **FR-4.4** Yanlış cevapta: doğru cevap + **kaynak atıfı** (*"Yüklediğin PDF'in 14. sayfası 3. paragrafta…"*) + o ekranda **mini yeniden anlatım** (analojik katmandan).
- **FR-4.5** Sınav modu: süreli deneme, karışık konu, zorluk adaptasyonu (yanlışlara göre).
- **FR-4.6** Sonuçlar otomatik olarak Analitik (3.6) ve Flashcard (3.6) motorlarına akar.

---

### 3.5 Lokal & Global Akıllı Arama (Vector Search & RAG)

#### Kişisel Semantik Arama
- **FR-5.1** Doğal dil sorgusu ("Enflasyonun istihdama etkisiyle ilgili grafikler neredeydi?") → hibrit arama (vektör + BM25 keyword) → ilgili PDF sayfaları, el yazısı notlar, ses kaydı dakikaları listelenir.
- **FR-5.2** Sonuçlar **kaynağa derin link** (PDF viewer'da ilgili sayfaya scroll + highlight; ses player'da ilgili saniyeye seek).
- **FR-5.3** Reranker (Cohere Rerank / bge-reranker) ile sonuç kalitesi artırılır.

#### Global Topluluk Kütüphanesi
- **FR-5.4** Kullanıcı kendi özet/notunu **anonim veya isimle** "Platform Kütüphanesi"ne paylaşabilir (opt-in, varsayılan kapalı).
- **FR-5.5** Diğer kullanıcılar bu havuzda arama yapar; kaliteli notu **tek tıkla** kendi workspace'ine import eder (kendi vektör DB'sine kopyalanır).
- **FR-5.6** Moderasyon: yükleme öncesi otomatik PII/uygunsuz içerik taraması + topluluk oylaması/raporlama.
- **FR-5.7** Telif: paylaşan, kaynağın paylaşım hakkına sahip olduğunu onaylar; lisans etiketi (CC-BY benzeri).

---

### 3.6 Analitik Raporlama, Çalışma Koçu & Spaced Repetition

#### Zayıf Nokta Analizi
- **FR-6.1** Ders/konu bazlı başarı oranı paneli (ısı haritası, trend grafikleri).
- **FR-6.2** Konu bazlı "mastery" skoru (Bayesian Knowledge Tracing / Elo benzeri).

#### Proaktif Çalışma Koçu
- **FR-6.3** Kural + LLM hibrit motor: *"Trigonometride %42'desin; Logaritmaya geçmeden Trigonometri-2 PDF'ine 15 dk göz at."* Önerinin kaynağı (hangi testler/dosyalar) gösterilir.
- **FR-6.4** Günlük/haftalık çalışma planı; takvim entegrasyonu (iCal export).

#### Flashcard (Anki) Otomasyonu
- **FR-6.5** Her dökümandan otomatik akıllı kart üretimi (soru-cevap, cloze deletion).
- **FR-6.6 Spaced Repetition:** FSRS (modern, Anki SM-2'den üstün) algoritması ile tekrar zamanlaması.
- **FR-6.7** Yanlış çözülen test soruları otomatik karta dönüşür ("leech" yönetimi dahil).

---

## 4. Sistem Mimarisi ve Teknoloji Yığını

### 4.1 Yüksek Seviye Mimari

```
┌──────────────────────────────────────────────────────────────┐
│  CLIENT — Next.js 15 (App Router) PWA / React 19              │
│  TanStack Query · Zustand · Tailwind · shadcn/ui · Tiptap     │
└───────────────┬──────────────────────────────────────────────┘
                │ HTTPS / WebSocket (tRPC + REST)
┌───────────────▼──────────────────────────────────────────────┐
│  EDGE / BFF — Next.js Route Handlers + tRPC (Node 22)         │
│  Auth (Lucia/Auth.js) · Rate limit · Upload (tus)            │
└───────┬───────────────────────────────────┬──────────────────┘
        │                                   │
┌───────▼─────────┐               ┌─────────▼──────────────────┐
│ CORE API (Node) │               │  AI/ML SERVICE (Python)     │
│ NestJS/Fastify  │◄──── queue ──►│  FastAPI                    │
│ Business logic  │   (BullMQ/    │  LangGraph · LlamaIndex     │
│ CRUD · RBAC     │    Redis)     │  Whisper · OCR · Embeddings │
└───┬─────────┬───┘               └───┬────────────────┬────────┘
    │         │                       │                │
┌───▼───┐ ┌───▼────┐            ┌─────▼─────┐   ┌──────▼───────┐
│Postgres│ │ Redis  │            │  Qdrant   │   │  S3/R2       │
│+pgvector│ │cache/Q │            │ (vectors) │   │ object store │
└────────┘ └────────┘            └───────────┘   └──────────────┘
                  │
            ┌─────▼──────────────────────────┐
            │ LLM Gateway (LiteLLM)            │
            │ Claude · GPT · Gemini · local    │
            └─────────────────────────────────┘
```

### 4.2 Teknoloji Seçimleri ve Gerekçeleri

| Katman | Seçim | Neden |
|---|---|---|
| **Frontend** | **Next.js 15 + React 19** (App Router, RSC) | SSR/streaming, PWA, tek dilde (TS) full-stack hız; Vercel/self-host esnek |
| **UI** | **Tailwind + shadcn/ui + Radix** | Linear/Notion-vari erişilebilir, tutarlı, hızlı; tasarım sistemine kolay |
| **Editör** | **Tiptap (ProseMirror)** | Notion-tarzı blok editör, collaborative-ready |
| **BFF/API tipi** | **tRPC** + REST (public) | Uçtan uca tip güvenliği, hızlı geliştirme |
| **Core API** | **NestJS (Node 22, TS)** | Modüler, DI, kurumsal ölçek; ekip büyümesine uygun |
| **AI servis** | **Python + FastAPI** | ML ekosistemi (Whisper, transformers, LlamaIndex) Python'da olgun |
| **Orkestrasyon** | **LangGraph + LlamaIndex** | Durdurulabilir/dallı RAG graph'ları, retrieval soyutlamaları |
| **LLM Gateway** | **LiteLLM** | Çok-sağlayıcılı (Claude/GPT/Gemini/local) failover, maliyet izleme. Üretimde **Claude (Opus/Sonnet)** birincil reasoning, Gemini Flash ucuz toplu işler |
| **Relational DB** | **PostgreSQL 16** | Sağlam ilişkisel temel, JSONB esnekliği, RLS (Row-Level Security) ile izolasyon |
| **Vektör** | **Qdrant** (birincil) / `pgvector` (MVP) | Qdrant: filtreli ANN, payload, multi-tenant; MVP'de pgvector ile tek-DB sadeliği |
| **Embeddings** | `text-embedding-3-large` / `bge-m3` (çok dilli, self-host) | Türkçe + akademik içerikte güçlü; self-host maliyet düşürür |
| **Queue/Cache** | **Redis + BullMQ** | Ağır OCR/STT/embedding işlerini async; rate-limit, cache |
| **Object Store** | **Cloudflare R2 / S3** | Ucuz, S3-uyumlu, egress-free (R2) — ücretsizlik stratejisine uygun |
| **STT** | **Whisper large-v3** (self-host GPU) | Maliyet; Türkçe güçlü; Deepgram fallback |
| **OCR/Vision** | **Gemini Vision / GPT-4o** + Tesseract | El yazısı için LLM-vision en iyi; klasik için Tesseract ucuz |
| **TTS** | **OpenAI TTS / ElevenLabs**, Coqui XTTS self-host | Doğal ses; self-host maliyet kontrolü |
| **Auth** | **Auth.js / Lucia** + WebAuthn/passkey | Ücretsiz, esnek, passwordless |
| **Realtime** | WebSocket (Socket.io) / SSE | İşleme durumu, stream cevaplar |
| **Observability** | OpenTelemetry + Grafana/Loki + Langfuse | LLM trace + maliyet + kalite izleme |
| **Deploy** | Docker + Kubernetes (veya Fly.io/Railway MVP) | Yatay ölçek; GPU node havuzu STT için |

---

## 5. Veri Tabanı Şeması

### 5.1 ER Genel Bakış
```
users ──1:N── workspaces ──1:N── folders ──1:N── files
                  │                              │
                  │                         1:N  ├── file_chunks (→ vector)
                  │                              ├── derived_contents (3 katman)
                  │                              └── transcripts (ses/video segment)
                  ├──1:N── notes
                  ├──1:N── quizzes ──1:N── quiz_questions ──1:N── quiz_attempts
                  ├──1:N── flashcards ──1:N── review_logs (FSRS)
                  ├──1:N── chat_sessions ──1:N── chat_messages
                  └──1:N── analytics_events

library_items (global) ──N:1── users (paylaşan, anon opsiyonlu)
file_links (semantik ilişki) : file ↔ file (graph edges)
```

### 5.2 Çekirdek Tablolar (PostgreSQL DDL — özet)

```sql
-- KULLANICILAR & İZOLASYON
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT UNIQUE NOT NULL,
  display_name  TEXT,
  auth_provider TEXT,                       -- passkey/google/email
  kms_key_id    TEXT,                       -- per-user envelope encryption anahtarı
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workspaces (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name      TEXT NOT NULL DEFAULT 'Çalışma Alanım',
  settings  JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- KLASÖR (otomatik tasnif hedefi, ağaç yapısı)
CREATE TABLE folders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id    UUID REFERENCES folders(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,               -- "İleri Matematik" / "Türev"
  ai_generated BOOLEAN DEFAULT false,
  path         LTREE,                       -- hızlı alt-ağaç sorgusu
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- DOSYALAR (multimodal)
CREATE TABLE files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  folder_id     UUID REFERENCES folders(id) ON DELETE SET NULL,
  original_name TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  modality      TEXT NOT NULL,              -- document|image|handwriting|audio|video
  storage_key   TEXT NOT NULL,             -- R2/S3 yolu (şifreli)
  content_hash  TEXT,                       -- duplicate tespiti
  size_bytes    BIGINT,
  status        TEXT DEFAULT 'queued',      -- queued|extracting|embedding|ready|failed
  -- AI tasnif çıktısı
  detected_course   TEXT,
  detected_topic    TEXT,
  detected_subtopic TEXT,
  classify_confidence REAL,
  tags          TEXT[],
  language      TEXT,
  duration_sec  INT,                        -- ses/video için
  page_count    INT,                        -- pdf için
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- NORMALİZE METİN PARÇALARI (RAG birimi)
CREATE TABLE file_chunks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id    UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,               -- denormalize: hızlı tenant filtre
  chunk_index INT,
  content    TEXT NOT NULL,
  -- Kaynak konum: derin link için
  locator    JSONB,                         -- {page:14, paragraph:3} | {start_sec:872}
  token_count INT,
  embedding  VECTOR(1024),                  -- pgvector (MVP). Qdrant'a mirror.
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON file_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON file_chunks (workspace_id);

-- SES/VİDEO TRANSKRİPT SEGMENTLERİ
CREATE TABLE transcripts (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id   UUID REFERENCES files(id) ON DELETE CASCADE,
  start_sec REAL, end_sec REAL,
  speaker   TEXT,
  text      TEXT
);

-- 3 KATMANLI TÜRETİLMİŞ İÇERİK
CREATE TABLE derived_contents (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id   UUID REFERENCES files(id) ON DELETE CASCADE,
  layer     TEXT NOT NULL,                  -- quick_glance|academic|analogy
  format    TEXT DEFAULT 'markdown',
  content   TEXT,
  audio_key TEXT,                           -- TTS çıktısı (R2)
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(file_id, layer)
);

-- SEMANTİK İLİŞKİ (knowledge graph kenarı)
CREATE TABLE file_links (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src_file  UUID REFERENCES files(id) ON DELETE CASCADE,
  dst_file  UUID REFERENCES files(id) ON DELETE CASCADE,
  relation  TEXT,                           -- supports|contradicts|extends|duplicate
  score     REAL,
  ai_suggested BOOLEAN DEFAULT true,
  accepted  BOOLEAN
);

-- NOTLAR (Tiptap blok JSON)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id),
  title TEXT, doc JSONB, embedding VECTOR(1024),
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- TEST MOTORU
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT, source_file_ids UUID[], mode TEXT,  -- practice|exam
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  type TEXT,                                 -- mcq|true_false|fill_blank|match|open
  stem TEXT, options JSONB, answer JSONB,
  explanation TEXT,
  source_chunk_id UUID REFERENCES file_chunks(id),  -- ZORUNLU grounding
  source_locator JSONB,
  difficulty REAL, topic TEXT,
  verified BOOLEAN DEFAULT false             -- verifier LLM onayı
);
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  given_answer JSONB, is_correct BOOLEAN,
  time_spent_ms INT, created_at TIMESTAMPTZ DEFAULT now()
);

-- FLASHCARD + FSRS
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  file_id UUID REFERENCES files(id),
  front TEXT, back TEXT, cloze TEXT,
  -- FSRS durumu
  stability REAL, difficulty REAL,
  due_at TIMESTAMPTZ, state TEXT DEFAULT 'new',  -- new|learning|review|relearning
  reps INT DEFAULT 0, lapses INT DEFAULT 0
);
CREATE TABLE review_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
  rating SMALLINT,                           -- 1 again|2 hard|3 good|4 easy
  reviewed_at TIMESTAMPTZ DEFAULT now()
);

-- SOHBET / ASİSTAN
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  scope JSONB,                               -- {file_ids|folder_id|all}
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT, content TEXT,
  citations JSONB,                           -- [{chunk_id, locator}]
  tokens INT, created_at TIMESTAMPTZ DEFAULT now()
);

-- ANALİTİK
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID, workspace_id UUID,
  event_type TEXT, topic TEXT, payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GLOBAL KÜTÜPHANE
CREATE TABLE library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id UUID REFERENCES users(id),
  anonymous BOOLEAN DEFAULT false,
  title TEXT, description TEXT, content TEXT,
  course TEXT, topic TEXT, tags TEXT[],
  embedding VECTOR(1024),
  license TEXT DEFAULT 'CC-BY',
  upvotes INT DEFAULT 0, import_count INT DEFAULT 0,
  moderation_status TEXT DEFAULT 'pending',  -- pending|approved|rejected
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.3 Çok-Kiracılı İzolasyon (Multi-tenancy)
- **Postgres RLS**: her sorgu `current_setting('app.user_id')` ile filtrelenir → kullanıcı yalnızca kendi satırlarını görür.
- **Qdrant**: her vektörde `workspace_id` payload; sorguda zorunlu filtre.
- **Object store**: anahtarlar `userId/workspaceId/fileId` prefix'li; imzalı kısa-ömürlü URL.

---

## 6. AI / RAG / LLM Pipeline'ları

### 6.1 Ingestion Pipeline (yükleme → bilgi)

```
                        ┌─────────────┐
   Upload event ───────►│ Router      │  modality tespiti
                        └──┬───┬───┬──┘
              document │     │image│    │audio/video
        ┌──────────────▼┐ ┌──▼─────▼─┐ ┌▼───────────────┐
        │ Parse (unstr) │ │ Vision-LLM│ │ yt-dlp→Whisper │
        │ tables, text  │ │ OCR/handw.│ │ + diarization  │
        └───────┬───────┘ └─────┬─────┘ └───────┬────────┘
                └─────────┬──────┴───────────────┘
                ┌─────────▼─────────┐
                │ Normalize → MD/JSON│ (locator metadata korunur)
                └─────────┬─────────┘
                ┌─────────▼─────────┐
                │ Semantic Chunking │ (yapısal: başlık/paragraf/segment)
                └─────────┬─────────┘
            ┌─────────────┼──────────────┐
   ┌────────▼───────┐ ┌───▼─────────┐ ┌──▼────────────────┐
   │ Embedding      │ │ Classify    │ │ Derived (3 layer) │
   │ → Qdrant/pgv   │ │ → folder    │ │ + TTS (async)     │
   └────────────────┘ └─────────────┘ └───────────────────┘
                          │
                  ┌───────▼────────┐
                  │ Link discovery │ (benzer dosyalarla bağ)
                  └────────────────┘
```

### 6.2 RAG Sorgu Pipeline (LangGraph — durdurulabilir graph)

```
Query
  │
  ├─► Query understanding (rewrite + multi-query expansion)
  │
  ├─► Hybrid Retrieve  ── vector(Qdrant) ⊕ keyword(BM25/Postgres FTS)
  │        (workspace_id filter — HARD tenant boundary)
  │
  ├─► Rerank (bge-reranker / Cohere) → top-k
  │
  ├─► Guardrail gate:  retrieve sonucu boş/zayıf mı?
  │        └─ evet → "Kaynaklarında bu bilgi yok" (HALÜSİNASYON YOK)
  │
  ├─► Generate (Claude) — context = yalnız retrieved chunks
  │        sistem promptu: "Yalnız verilen kaynaktan, her iddiaya [cite] ekle"
  │
  └─► Citation post-check (verifier): her [cite] gerçekten chunk'ta var mı?
           └─ eşleşmeyen iddia → kırpılır / uyarı
```

### 6.3 Test Üretim Pipeline (Prompt Chaining)

```
1) PLAN:    konu kapsamı + soru sayısı/tip dağılımı belirlenir (retrieved özet üzerinden)
2) RETRIEVE: her hedef alt-konu için chunk'lar çekilir
3) GENERATE: chunk başına soru üret  → {stem, options, answer, source_chunk_id, locator}
4) VERIFY:   ikinci LLM — "cevap bu chunk'tan kanıtlanıyor mu?" (evidence span döndür)
              └─ HAYIR → soruyu ele
5) DEDUP:    embedding ile benzer soruları birleştir
6) CALIBRATE: difficulty etiketle (geçmiş başarı + Bloom seviyesi)
7) PERSIST:  yalnız verified=true sorular kaydedilir
```

### 6.4 Guardrail Katmanları
| Katman | Mekanizma |
|---|---|
| **Retrieval-zorunlu** | Boş/eşik altı retrieval → üretim iptali |
| **Context-locked prompt** | "Yalnız verilen kaynaktan" + few-shot ret örnekleri |
| **Citation enforcement** | Yapısal çıktı (JSON) — her iddia `chunk_id` taşımak zorunda |
| **Verifier pass** | Bağımsız LLM ile claim↔evidence eşlemesi |
| **PII/güvenlik** | Girdi/çıktı taraması (özellikle global kütüphane) |
| **Tenant boundary** | Qdrant payload + Postgres RLS — cross-user sızıntı imkânsız |

### 6.5 Model Yönlendirme (LLM Gateway / LiteLLM)
| Görev | Model (öneri) | Gerekçe |
|---|---|---|
| Reasoning, anlatım, test verify | **Claude (Opus/Sonnet)** | En güçlü akıl yürütme + uzun bağlam + güvenilir atıf |
| Toplu/ucuz sınıflandırma, özet taslağı | Gemini Flash / Haiku | Maliyet |
| Vision/OCR (el yazısı) | Gemini Vision / GPT-4o | Görsel doğruluk |
| Embedding | bge-m3 (self-host) / text-embedding-3-large | Türkçe + maliyet |
| STT | Whisper large-v3 (self-host) | Maliyet, Türkçe |
| TTS / Podcast | OpenAI TTS / ElevenLabs / Coqui | Doğallık |

> **Not (proje içi standart):** LLM entegrasyonu yapılırken Claude API kullanılacaksa güncel model ID'leri ve fiyatları `claude-api` referansından doğrulanmalı; bellekten yazılmamalı.

---

## 7. UI/UX Sayfa Planları ve Tasarım Sistemi

### 7.1 Tasarım Dili
- **Estetik:** Minimalist, akışkan, göz yormayan. Linear'ın yoğunluğu + Notion'un sıcaklığı + Apple'ın nefesi.
- **Mod:** Karanlık (varsayılan) + Aydınlık; sistem temasını izler.
- **Renk:** Nötr gri ölçek (zinc/neutral) + tek bir vurgu rengi (indigo/violet). Anlam renkleri yalnız durum için.
- **Tipografi:** Inter (UI) + bir serif (uzun okuma/akademik katman) + JetBrains Mono (kod/formül çevresi).
- **Hareket:** 150–250ms, ease-out; içerik stream'i token-token akar (Perplexity hissi).
- **Yoğunluk yönetimi:** Progressive disclosure — gelişmiş ayarlar `⌘K` / "…" arkasında.

### 7.2 Global Navigasyon İskeleti
```
┌──────────────────────────────────────────────────────────────┐
│ ⌘K Command Palette  (her şeye buradan: aç, ara, üret, git)   │
├────────────┬─────────────────────────────────────┬───────────┤
│ SIDEBAR    │  TAB BAR (çoklu açık panel)          │ CONTEXT   │
│ (daralabilir)│  [Dosya.pdf] [Test] [Sohbet] [+]   │ PANEL     │
│            │                                       │ (AI/aux)  │
│ 🏠 Dashboard│  ┌─────────────────────────────────┐ │           │
│ 📁 Çalışma  │  │                                 │ │ • Özet    │
│   ├ Mat     │  │      AKTİF SEKME İÇERİĞİ         │ │ • Atıflar │
│   ├ Hukuk   │  │                                 │ │ • Öneriler│
│ 🔍 Keşfet   │  │                                 │ │           │
│ 🎴 Tekrar   │  └─────────────────────────────────┘ │           │
│ 📊 Analitik │                                       │           │
│ ──────────  │                                       │           │
│ ⬆ Yükle (her│  ◄ alt: işleme kuyruğu durum şeridi  │           │
│   yere D&D) │                                       │           │
└────────────┴───────────────────────────────────────┴──────────┘
```
**Anahtar fikir:** Workspace **tab-tabanlı** — kullanıcı PDF, test, sohbet, notu aynı anda sekmelerde tutar; karmaşık menülerde kaybolmaz. Her yere dosya sürüklenebilir.

### 7.3 Sayfa: **Dashboard**
```
┌─ Selam Elif 👋  ────────────────────────────────────────────┐
│  Bugün tekrar: 24 kart ▸   Zayıf konu: Trigonometri (42%)    │
├──────────────────────────────────────────────────────────────┤
│  ⬆  Buraya her şeyi bırak — PDF, fotoğraf, ses, YouTube linki │
│     [ Sürükle-bırak geniş alan / kamera / yapıştır ]         │
├───────────────┬───────────────────┬──────────────────────────┤
│ Son Dosyalar  │ AI Önerileri      │ Çalışma Koçu              │
│ • Türev.pdf ✓ │ "Makro notunla    │ "Logaritmaya geçmeden     │
│ • Ders.mp3 ⏳ │  enflasyon makalesi│  Trigonometri-2'ye 15 dk" │
│ • Defter.jpg ✓│  birleştireyim mi?"│  [Başla]                  │
├───────────────┴───────────────────┴──────────────────────────┤
│ Bu hafta: çalışma süresi grafiği · konu mastery ısı haritası  │
└──────────────────────────────────────────────────────────────┘
```

### 7.4 Sayfa: **Workspace (Çalışma Alanı)** — Üçlü kolon
```
┌ Dosya Gezgini ┬──── Aktif Doküman (PDF/transkript) ───┬ AI Yan Panel ┐
│ 📁 Mat        │  ┌──────────────────────────────────┐ │ Katman ▾     │
│  ├ Türev.pdf  │  │  PDF / metin görüntüleyici        │ │ ⚡ Hızlı      │
│  └ İntegral   │  │  (highlight + sayfa derin link)   │ │ 📚 Akademik   │
│ 📁 Hukuk      │  │                                  │ │ 🧸 Analoji    │
│               │  │  ▶ ses ise: dalga formu + 14:32   │ │ ─────────    │
│               │  │     segmentine tıkla-git          │ │ 🔊 Dinle/Pod  │
│               │  └──────────────────────────────────┘ │ 💬 Bu dosyaya │
│               │  Sekmeler: [Görüntü][Özet][Test][Kart]│ │    soru sor   │
└───────────────┴───────────────────────────────────────┴──────────────┘
```
- Sağ panelde **3 katman** sekme ile anında geçiş; her katmanda **🔊 Dinle** ve **🎙 Podcast yap**.
- Sohbet cevaplarındaki **kaynak çipleri** → tıkla → ortadaki görüntüleyici ilgili sayfaya/dakikaya atlar + highlight.

### 7.5 Sayfa: **İnteraktif Test Ekranı**
```
┌ Trigonometri Denemesi · Soru 7/20 · ⏱ 12:30 ───────────────┐
│                                                              │
│  sin(2x) ifadesinin açılımı aşağıdakilerden hangisidir?      │
│                                                              │
│   A) 2sinx·cosx     B) sin²x−cos²x   C) 1−2sin²x             │
│   D) 2cos²x−1       E) 2tanx                                 │
│                                                              │
│  [ Önceki ]                              [ İşaretle ] [Sonraki]│
└──────────────────────────────────────────────────────────────┘
   ▼ (yanlış cevap sonrası anında genişler)
┌ ❌ Doğru cevap: A ───────────────────────────────────────────┐
│ 📄 Kaynak: "Türev.pdf · s.14 · ¶3"  [Kaynağı aç ▸]           │
│ 🧸 Hatırlatma: sin(2x)=2sinx·cosx çift açı formülüdür; ...   │
│ [ Bu soruyu flashcard yap ]   [ Konuyu tekrar anlat ▸ ]      │
└──────────────────────────────────────────────────────────────┘
```
- Sonuç ekranı: konu bazlı doğru/yanlış, zayıf alanlar, "yanlışları karta çevir", "yeniden dene (sadece yanlışlar)".

### 7.6 Sayfa: **Keşfet (Global Arama / Kütüphane)**
```
┌ 🔍 "enflasyonun istihdama etkisi" ──────────── [Kişiselim ▾]┐
│  Sekme: ( ● Benim Kaynaklarım )  ( ○ Topluluk Kütüphanesi )  │
├──────────────────────────────────────────────────────────────┤
│ Benim:                                                       │
│  📄 Makro.pdf · s.22 — "...Phillips eğrisi..."   [Aç ▸]      │
│  🎙 Ders3.mp3 · 41:10 — "...işsizlik ve enflasyon..."  [▶]   │
│  ✍ Defter.jpg — el yazısı not (grafik)          [Aç ▸]      │
├──────────────────────────────────────────────────────────────┤
│ Topluluk (anonim/isimli):                                    │
│  ⭐ "Makro Özet — Phillips Eğrisi" · 312↑ · @anon            │
│       [ Tek tıkla AI'ma ekle ]                               │
└──────────────────────────────────────────────────────────────┘
```

### 7.7 Sayfa: **Tekrar (Flashcards / Spaced Repetition)**
- Bugün vadesi gelen kart akışı; 4 buton (Tekrar/Zor/İyi/Kolay → FSRS). Cloze kartlar, kaynağa link, "leech" uyarısı.

### 7.8 Erişilebilirlik & Kısayollar
- WCAG 2.1 AA; tam klavye navigasyonu; `⌘K` her şey; `⌘N` yeni not; `⌘U` yükle; `Space` kart çevir; ekran okuyucu uyumu; reduced-motion desteği.

---

## 8. Güvenlik, Mahremiyet ve Şifreleme

| Alan | Yaklaşım |
|---|---|
| **Veri izolasyonu** | Postgres RLS + Qdrant payload filtresi (zorunlu `workspace_id`) |
| **At-rest şifreleme** | Per-user envelope encryption (KMS master + kullanıcı DEK); object store SSE |
| **In-transit** | TLS 1.3 her yerde |
| **Auth** | Passkey/WebAuthn öncelikli, OAuth, e-posta sihirli link; oturum rotasyonu |
| **Yetkilendirme** | RBAC + satır düzeyi sahiplik kontrolü |
| **Dosya güvenliği** | Virüs taraması (ClamAV), MIME doğrulama, boyut/oran limitleri, imzalı URL |
| **AI mahremiyet** | Kullanıcı verisi model eğitiminde kullanılmaz; sağlayıcı "no-train" modu; PII redaksiyon |
| **Global paylaşım** | Opt-in, PII taraması, moderasyon kuyruğu, geri çekme hakkı |
| **Uyumluluk** | KVKK + GDPR; "verimi indir" ve "hesabı/sil" tek tık; denetim logu |
| **LLM güvenliği** | Prompt injection savunması (retrieved içerik "veri" olarak işaretlenir, talimat olarak değil) |

---

## 9. Maliyet, Ölçeklenebilirlik ve Ücretsizlik Stratejisi

**Sorun:** "Tamamen ücretsiz" + ağır AI (STT, vision, LLM) = yüksek maliyet. Sürdürülebilirlik tasarımı:

| Kaldıraç | Taktik |
|---|---|
| **Self-host ucuz işler** | Whisper, embeddings (bge-m3), Coqui TTS kendi GPU'nda → API maliyeti yok |
| **Model kademeleme** | Ucuz model (Flash/Haiku) toplu işlerde; pahalı (Claude Opus) yalnız reasoning/verify |
| **Agresif cache** | Aynı dosyanın türetilmiş içerikleri/embedding'leri tekrar üretilmez (content hash) |
| **Async + batch** | İşler kuyrukta; gece batch indirimleri; rate-limit ile pik kontrol |
| **Adil kullanım** | Kullanıcı başına aylık AI kotası (cömert ama sınırlı); aşımda "yavaş kuyruk" |
| **Storage** | Cloudflare R2 (egress ücretsiz); eski/erişilmeyen dosyalar soğuk depoya |
| **Ölçek** | Stateless API yatay scale; GPU node havuzu STT/embedding için ayrı; Qdrant sharding |
| **Sürdürülebilirlik** | İleride opsiyonel bağış/Pro katman (çekirdek ücretsiz kalır), kurumsal/okul lisansı |

---

## 10. Yol Haritası ve MVP Kapsamı

### Faz 0 — Temel (MVP, ~6-8 hafta)
- Auth + workspace + R2 yükleme (PDF, görsel, TXT)
- Ingestion: PDF/görsel OCR → chunk → pgvector embedding
- 3 katmanlı içerik üretimi (Claude) + temel sohbet (RAG + atıf)
- Otomatik klasörleme (v1)
- Çoktan seçmeli test motoru + grounding/verifier
- Dashboard + Workspace + Test ekranı (temel)

### Faz 1 — Ses/Video & Tekrar (~4-6 hafta)
- Whisper STT (ses/video/YouTube), zaman damgalı arama
- TTS + Podcast modu
- Flashcard + FSRS tekrar motoru
- Tüm soru tipleri

### Faz 2 — Zeka & Topluluk (~6 hafta)
- Semantik ilişkilendirme + knowledge graph görseli
- Çalışma koçu (proaktif öneriler) + analitik panel
- Global kütüphane (paylaş/ara/import) + moderasyon
- El yazısı doğruluk iyileştirme, çok dilli

### Faz 3 — Ölçek & Cila
- Qdrant'a geçiş, reranker, offline PWA, mobil app, collaborative notlar

---

## 11. Kabul Kriterleri ve Metrikler

### Kabul Kriterleri (örnek, MVP)
- **AC-1** 30 sayfalık taranmış PDF yüklendiğinde < 60 sn'de "ready" ve 3 katman erişilebilir.
- **AC-2** Test motoru üretilen her soru için geçerli `source_chunk_id` taşır; verifier'dan geçmeyen soru kullanıcıya gösterilmez (sıfır halüsinasyon).
- **AC-3** Yanlış cevapta kaynak atıfı + mini anlatım aynı ekranda < 2 sn'de görünür.
- **AC-4** Kişisel arama: doğal dil sorgusu ilgili sayfaya/dakikaya derin link verir.
- **AC-5** Kullanıcı A, kullanıcı B'nin hiçbir verisini hiçbir uç noktadan göremez (tenant izolasyon testi geçer).

### Kuzey Yıldızı & Destek Metrikleri
| Metrik | Hedef |
|---|---|
| **North Star** | Haftalık aktif "öğrenme eylemi" (test çözme + tekrar + dinleme) / kullanıcı |
| Yükleme→ilk değer süresi (TTFV) | < 90 sn |
| RAG atıf doğruluğu (verifier geçme) | > %95 |
| Test grounding doğruluğu | %100 (kaynaksız soru yayınlanmaz) |
| 30-gün retention | > %35 |
| AI maliyeti / aktif kullanıcı / ay | hedef bütçe içinde (kademeleme ile) |

---

### Ekler (sonraki dokümanlar)
- `ARCHITECTURE.md` — servis sınırları, deployment topolojisi, sequence diyagramları
- `API_SPEC.md` — tRPC/REST uç noktaları, şemalar
- `AI_PROMPTS.md` — sistem promptları, guardrail prompt zincirleri, few-shot setleri
- `DESIGN_SYSTEM.md` — token'lar, bileşen kataloğu (shadcn temelli)
- `SECURITY.md` — tehdit modeli, KVKK/GDPR uyum kontrol listesi

> Bu doküman "Foundation v1.0"dır. Onayınla birlikte bir sonraki adım: **MVP için repo iskeleti (monorepo: `apps/web`, `apps/api`, `services/ai`) + DESIGN_SYSTEM + ilk ingestion pipeline'ı**.

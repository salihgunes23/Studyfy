# Mimari Karar Kayıtları (ADR) — Studfy

Bu dizin, Studfy projesinin mimari kararlarını **MADR** (Markdown Architecture
Decision Records) formatında belgeler. Her ADR; bir kararın bağlamını,
değerlendirilen seçenekleri, seçilen çözümü ve sonuçlarını (trade-off'larıyla)
kayıt altına alır.

## ADR Nedir?

ADR, mimari açıdan önemli (architecturally significant) bir kararı ve onu doğuran
bağlamı kalıcı olarak belgeleyen kısa bir dokümandır. Amaç: "neden böyle yaptık?"
sorusunun cevabını gelecekteki ekip için korumak.

## Yeni ADR Nasıl Eklenir?

1. [`0000-template.md`](0000-template.md) dosyasını kopyalayın.
2. Sıradaki numarayı verin (ör. `0009-...`) ve açıklayıcı bir slug kullanın.
3. Bölümleri doldurun; gereksiz bölümleri silin (Bağlam, Karar Sonucu ve
   Sonuçlar her zaman doldurulmalıdır).
4. Bu README'deki tabloya satır ekleyin.

## Durum (Status) Anlamları

- **Proposed**: Önerildi, henüz kabul edilmedi.
- **Accepted**: Kabul edildi ve uygulanıyor/uygulanacak.
- **Deprecated**: Artık geçerli değil, ama yerine yeni bir karar konmadı.
- **Superseded**: Başka bir ADR ile değiştirildi (ilgili ADR'ye link verilir).

## ADR Dizini

| No | Başlık | Durum | İlgili / Bağlantı |
|----|--------|-------|-------------------|
| [0000](0000-template.md) | MADR şablonu | — (Template) | Tüm ADR'lerin temeli |
| [0001](0001-monorepo-turborepo.md) | Monorepo + Turborepo + pnpm | Accepted | 0002 |
| [0002](0002-polyglot-node-python-split.md) | Polyglot: NestJS (Node) + FastAPI (Python) ayrımı | Accepted | 0001, 0004, 0007 |
| [0003](0003-vector-store-pgvector-then-qdrant.md) | Vektör deposu: pgvector → Qdrant | Accepted | 0005, 0006, 0007 |
| [0004](0004-llm-gateway-litellm-claude-primary.md) | LLM gateway: LiteLLM + Claude (Opus/Sonnet) birincil | Accepted | 0002, 0005, 0007 |
| [0005](0005-rag-zero-hallucination-guardrails.md) | Sıfır-halüsinasyon RAG: citation + verifier | Accepted | 0003, 0004, 0006, 0007 |
| [0006](0006-multitenancy-postgres-rls.md) | Çok kiracılılık: PostgreSQL RLS | Accepted | 0002, 0003, 0005 |
| [0007](0007-self-host-whisper-embeddings-cost.md) | Self-host Whisper + bge-m3 (maliyet) | Accepted | 0002, 0003, 0004, 0005 |
| [0008](0008-fsrs-over-sm2-spaced-repetition.md) | Aralıklı tekrar: FSRS > SM-2 | Accepted | 0002 |

## Kararlar Arası Bağlam

Studfy'ın mimarisi birbirini destekleyen kararlardan oluşur:

- **Yapı**: Monorepo (0001) içinde polyglot Node/Python ayrımı (0002).
- **Veri & izolasyon**: PostgreSQL + RLS (0006); vektörler önce pgvector, ölçekte
  Qdrant (0003) — ikisi de aynı izolasyondan faydalanır.
- **AI çekirdeği**: LiteLLM + Claude (0004) ile sıfır-halüsinasyon RAG (0005);
  transkripsiyon/embedding self-host (0007) maliyeti kontrol eder.
- **Öğrenme**: FSRS (0008) ile verimli aralıklı tekrar.

## Referanslar

- MADR: https://adr.github.io/madr/
- ADR genel: https://adr.github.io/
- docs/PRD.md — Ürün gereksinimleri (canonical bağlam)

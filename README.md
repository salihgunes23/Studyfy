<div align="center">

# 🎓 Studfy

**AI-Native Öğrenme İşletim Sistemi**

Ne yüklersen yükle — PDF, taranmış el yazısı, amfi ses kaydı, YouTube dersi — Studfy onu saniyeler içinde
**anlaşılabilir, sorgulanabilir, test edilebilir ve dinlenebilir** bilgiye çevirir.
Sıfır halüsinasyon: yapay zeka yalnızca **senin verinden** konuşur.

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-339933?logo=node.js&logoColor=white)](.nvmrc)
[![Python](https://img.shields.io/badge/python-%E2%89%A53.11-3776AB?logo=python&logoColor=white)](services/ai/pyproject.toml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blueviolet.svg)](CONTRIBUTING.md)

[Felsefe](#-felsefe) · [Özellikler](#-çekirdek-yetenekler) · [Mimari](#-mimari) · [Hızlı Başlangıç](#-hızlı-başlangıç) · [Dokümanlar](#-dokümanlar) · [Yol Haritası](docs/ROADMAP.md)

</div>

---

## 🌟 Felsefe

> **Maksimum İşlevsellik, Sıfır Karmaşa.** Onlarca ağır araç, ama Linear/Notion/Perplexity sadeliğinde tek bir akışkan yüzey.

- **Sonsuz Özgürlük** — Tamamen ücretsiz, üyelik tabanlı; her kullanıcının kendi **şifreli, izole** çalışma alanı.
- **Sıfır Halüsinasyon** — Strict RAG guardrail + her iddiaya zorunlu kaynak atıfı.
- **Bağlamsal Süreklilik** — Her cevap, senin tüm geçmiş materyalini bilir.
- **Her Yerde Öğrenme** — Notlarını podcast'e çevir, yolda dinle.

## 🚀 Çekirdek Yetenekler

| Modül | Ne yapar |
|---|---|
| 📥 **Anything-to-Data** | PDF, Word, Excel, el yazısı fotoğrafı, ses/video, YouTube linki → işlenebilir veri (OCR + STT + Vision-LLM) |
| 🗂️ **Akıllı Tasnif & Semantik Bağ** | Dosyayı bırak — AI dersi/konuyu tespit edip klasörler, ilgili notlar arası bağ kurar |
| 📚 **3 Katmanlı Anlatım** | Hızlı Bakış · Akademik Derinlik · "5 yaşındaymışım gibi" + ultra-gerçekçi sesli **podcast** |
| 🧪 **Sıfır-Halüsinasyon Test Motoru** | Yalnız senin dökümanından soru; yanlışta **kaynak atıfı** + anında yeniden anlatım |
| 🔍 **Semantik Arama (RAG)** | "O grafik neredeydi?" → ilgili PDF sayfası / ses dakikası / el yazısı notu |
| 📈 **Koç & FSRS Tekrar** | Zayıf nokta analizi, proaktif yönlendirme, otomatik flashcard + aralıklı tekrar |
| 🌐 **Global Kütüphane** | Kaliteli notları anonim/isimli paylaş, tek tıkla kendi AI'na ekle |

## 🏗️ Mimari

```
Next.js 15 (web/PWA)  ──tRPC──►  NestJS (core-api)  ──queue──►  FastAPI (ai-service)
                                       │                              │ LangGraph · LlamaIndex
                                       │                              │ Whisper · OCR · Embeddings
                  PostgreSQL + pgvector/Qdrant · Redis/BullMQ · R2/S3 · LiteLLM → Claude
```

**Polyglot monorepo** (Turborepo + pnpm): Node ekosistemi ürün katmanı, Python ekosistemi AI/ML katmanı.
Ayrıntı: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · Kararlar: [docs/adr/](docs/adr/)

## ⚡ Hızlı Başlangıç

> Gereksinimler: **Node ≥ 22**, **pnpm ≥ 9**, **Python ≥ 3.11**, **Docker**.

```bash
git clone <repo-url> studfy && cd studfy
make setup          # .env oluştur + pnpm install
make up             # postgres(pgvector) · redis · qdrant · minio · litellm
pnpm db:migrate     # veritabanı şeması
pnpm dev            # web (3000) · api (4001) · ai (8000)
```

## 📁 Proje Yapısı

```
studfy/
├─ apps/
│  ├─ web/            # Next.js 15 — UI/UX (Dashboard, Workspace, Test, Keşfet, Tekrar)
│  └─ api/            # NestJS — iş mantığı, RLS, BullMQ, Prisma
├─ services/
│  └─ ai/             # FastAPI — ingestion, RAG, guardrail, test üretimi
├─ packages/
│  ├─ shared/         # paylaşılan domain tipleri & Zod şemaları
│  └─ config/         # ortak tsconfig & eslint
├─ infra/
│  ├─ docker/         # yerel geliştirme compose
│  └─ db/migrations/  # SQL şema + RLS + vektör indeksleri
└─ docs/              # PRD, mimari, API, AI prompt, tasarım, güvenlik, ADR…
```

## 📚 Dokümanlar

| Doküman | İçerik |
|---|---|
| [PRD.md](docs/PRD.md) | Tam ürün gereksinim dokümanı (vizyon, modüller, UI/UX) |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | C4 diyagramları, servis sınırları, deployment |
| [API_SPEC.md](docs/API_SPEC.md) | tRPC router'ları + REST uç noktaları |
| [AI_PROMPTS.md](docs/AI_PROMPTS.md) | Sistem promptları, guardrail zincirleri, eval |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Token'lar, bileşen kataloğu, a11y |
| [DATABASE.md](docs/DATABASE.md) | Veri modeli, indeksler, RLS, pgvector/Qdrant |
| [SECURITY.md](docs/SECURITY.md) | STRIDE tehdit modeli, KVKK/GDPR |
| [TESTING.md](docs/TESTING.md) · [OBSERVABILITY.md](docs/OBSERVABILITY.md) | QA stratejisi · gözlemlenebilirlik |
| [ROADMAP.md](docs/ROADMAP.md) | Fazlı yol haritası ve metrikler |
| [adr/](docs/adr/) | Mimari Karar Kayıtları (0001–0008) |

## 🤝 Katkı

Katkılar memnuniyetle karşılanır! [CONTRIBUTING.md](CONTRIBUTING.md) ve [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
Güvenlik açıkları için [SECURITY.md](SECURITY.md).

## 📄 Lisans

[MIT](LICENSE) © 2026 Studfy

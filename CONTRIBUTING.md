# Studfy'a Katkıda Bulunma Rehberi

Studfy'a katkı yapmak istediğin için teşekkürler! Bu doküman, katkı sürecini hızlı ve tutarlı kılmak için hazırlandı.

## İçindekiler
- [Davranış Kuralları](#davranış-kuralları)
- [Geliştirme Ortamı Kurulumu](#geliştirme-ortamı-kurulumu)
- [Dal & Commit Stratejisi](#dal--commit-stratejisi)
- [Kod Standartları](#kod-standartları)
- [Test & Kalite Kapıları](#test--kalite-kapıları)
- [Pull Request Süreci](#pull-request-süreci)
- [Mimari Kararlar (ADR)](#mimari-kararlar-adr)

## Davranış Kuralları
Bu proje [Contributor Covenant](CODE_OF_CONDUCT.md) davranış kurallarını benimser. Katılarak bu kurallara uymayı kabul edersin.

## Geliştirme Ortamı Kurulumu

Gereksinimler: **Node.js ≥ 22**, **pnpm ≥ 9**, **Python ≥ 3.11**, **Docker**.

```bash
git clone <repo-url> studfy && cd studfy
make setup          # .env oluşturur + pnpm install
make up             # postgres, redis, qdrant, minio, litellm
pnpm db:migrate     # veritabanı şeması
pnpm dev            # tüm uygulamalar (web, api, ai)
```

Detaylı mimari için [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), veri modeli için [docs/DATABASE.md](docs/DATABASE.md).

## Dal & Commit Stratejisi
- Ana dal: `main` (her zaman deployable).
- Özellik dalları: `feat/<kısa-açıklama>`, hata düzeltmeleri: `fix/<kısa-açıklama>`.
- **Conventional Commits** zorunludur: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `perf:`, `ci:`.
  - Örnek: `feat(quiz): add grounding verifier to question pipeline`

## Kod Standartları
- TypeScript: `strict` mod, ESLint + Prettier (commit öncesi otomatik çalışır).
- Python (AI servisi): `ruff` + `mypy`, `black` uyumlu format.
- Anlamlı isimlendirme, çevreleyen kodun stiline uyum. Gereksiz yorum yok.
- Her dosya tek sorumluluk; sırlar (secret) asla commit edilmez.

## Test & Kalite Kapıları
PR'ın merge edilebilmesi için CI'da şunlar geçmelidir:
- `pnpm lint`, `pnpm typecheck`, `pnpm test`
- AI/RAG değişikliklerinde golden-set eval'leri ([docs/TESTING.md](docs/TESTING.md))
- Güvenlik taraması (SAST/SCA)

## Pull Request Süreci
1. Issue aç veya mevcut bir issue'ya bağla.
2. Küçük, odaklı PR'lar tercih edilir.
3. PR şablonunu doldur; ekran görüntüsü/akış ekle (UI değişiklikleri için).
4. En az 1 onay + yeşil CI gerekir.

## Mimari Kararlar (ADR)
Önemli teknik kararlar [docs/adr/](docs/adr/) altında MADR formatında belgelenir. Yeni bir mimari karar öneriyorsan `0000-template.md`'yi kopyalayıp numara ver.

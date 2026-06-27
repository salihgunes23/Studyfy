# Changelog

Bu projedeki tüm önemli değişiklikler bu dosyada belgelenir.
Format [Keep a Changelog](https://keepachangelog.com/tr/1.1.0/) temellidir ve
proje [Semantic Versioning](https://semver.org/lang/tr/) kullanır.

## [Unreleased]

### Added
- Proje temeli: kapsamlı PRD ([docs/PRD.md](docs/PRD.md)).
- Monorepo iskeleti (Turborepo + pnpm): `apps/web`, `apps/api`, `services/ai`, `packages/*`.
- Mimari, API, AI/RAG prompt, tasarım sistemi, güvenlik, veritabanı, yol haritası, test ve gözlemlenebilirlik dokümanları.
- Mimari Karar Kayıtları (ADR 0001–0008).
- Yerel geliştirme altyapısı (`docker-compose`: postgres+pgvector, redis, qdrant, minio, litellm).
- CI/CD iş akışları, issue/PR şablonları, OSS sağlık dosyaları.

[Unreleased]: https://github.com/OWNER/studfy/commits/main

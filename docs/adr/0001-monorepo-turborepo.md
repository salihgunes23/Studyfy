# Monorepo yapısı ve Turborepo + pnpm ile yönetimi

- Durum (Status): Accepted
- Tarih: 2026-06-27
- Karar verenler (Deciders): Principal Architect, Platform ekibi
- Danışılanlar (Consulted): Frontend lead, Backend lead, AI/ML lead, DevOps
- Bilgilendirilenler (Informed): Tüm mühendislik ekibi

## Bağlam ve Problem Tanımı (Context and Problem Statement)

Studfy; bir Next.js 15 frontend, bir NestJS (Node) Core API ve bir FastAPI
(Python) AI servisinden oluşan polyglot bir sistemdir. Bunların yanında
paylaşılan TypeScript tipleri (API sözleşmeleri, DTO'lar), UI bileşen
kütüphanesi, ESLint/TS config'leri ve altyapı (infra) tanımları gibi ortak
varlıklar bulunur. Bu bileşenler hızlı evrilen, erken aşamada bir üründe sıkça
birlikte değişir.

Kodu nasıl organize etmeliyiz? Tek bir repo (monorepo) mu, yoksa her servis için
ayrı repo (polyrepo) mu? Monorepo ise, build orkestrasyonu ve cache'i ne yönetecek?

## Karar Sürücüleri (Decision Drivers)

- Atomik değişiklik: API sözleşmesi değişince frontend + backend tek PR'da
  güncellenebilmeli (özellikle paylaşılan TS tipleri için).
- Geliştirici deneyimi (DX): tek `pnpm install`, tutarlı tooling, kolay onboarding.
- Build/test hızı: tekrar eden işlerin cache'lenmesi, yalnızca etkilenen
  paketlerin (affected) çalıştırılması.
- Küçük ekip, erken aşama: minimum operasyonel yük; çok sayıda repo'yu senkron
  tutmak istemiyoruz.
- Disk ve CI verimliliği: bağımlılıkların verimli paylaşımı.
- Polyglot gerçeği: Python servisi de aynı repoda yaşayabilmeli ama JS tooling'i
  onu yönetmeye zorlamamalı.

## Değerlendirilen Seçenekler (Considered Options)

- Turborepo + pnpm workspaces (monorepo)
- Nx (monorepo)
- Polyrepo (her servis ayrı git reposu)
- Lerna / pnpm-only (orkestratör yok, sade workspaces)

## Karar Sonucu (Decision Outcome)

Seçilen seçenek: **"Turborepo + pnpm workspaces"**.

pnpm; sembolik link tabanlı `node_modules` ve içerik adresli store sayesinde en
disk-verimli ve en hızlı paket yöneticisidir ve workspace desteği olgundur.
Turborepo bunun üzerine düşük yapılandırma maliyetiyle task orkestrasyonu, yerel
+ uzak (remote) cache ve "affected" hesaplaması ekler. Nx'e göre öğrenme eğrisi
daha düşük ve daha az "opinionated" olması, erken aşamadaki bir ekip için
belirleyici oldu. Python (FastAPI) servisi monorepoda ayrı bir dizinde yaşar;
kendi `uv`/`poetry` ortamını kullanır, Turborepo onu yalnızca opak bir task
(lint/test/build script) olarak çağırır — böylece polyglot yapı korunur.

### Sonuçlar (Consequences)

- İyi, çünkü paylaşılan TS tipleri ve API sözleşmeleri tek kaynaktan (single
  source of truth) gelir; sözleşme kırılmaları derleme zamanında yakalanır.
- İyi, çünkü Turborepo remote cache ile CI süreleri ciddi düşer; yalnızca
  değişenden etkilenen paketler build/test edilir.
- İyi, çünkü tek `pnpm install` ve tutarlı tooling onboarding'i hızlandırır.
- Kötü, çünkü Python servisi JS-merkezli orkestrasyonun "first-class" vatandaşı
  değildir; Python tarafı için ayrı cache/lint stratejisi gerekir (bkz. ADR-0002).
- Kötü, çünkü monorepo büyüdükçe git geçmişi ve CI hattı dikkatli yönetilmezse
  şişebilir; CODEOWNERS ve path-bazlı CI filtreleri şart olur.
- Nötr/İzlenecek, çünkü ileride bir servis bağımsız sürümlenmesi gerekirse
  monorepodan çıkarılması (extraction) bir maliyet doğurur.

### Doğrulama (Confirmation)

- `turbo run build --filter=...[origin/main]` ile yalnızca etkilenen paketlerin
  derlendiği CI'da gözlemlenir.
- Cache isabet oranı (cache hit rate) CI metriği olarak izlenir.
- Paylaşılan `packages/types` değişiminin hem frontend hem backend build'ini
  tetiklediği bir testle doğrulanır.

## Seçeneklerin Artıları ve Eksileri (Pros and Cons of the Options)

### Turborepo + pnpm workspaces

- İyi, çünkü düşük yapılandırma, hızlı kurulum ve iyi dokümantasyon.
- İyi, çünkü pnpm en disk-verimli ve hızlı paket yöneticisi; phantom-dependency
  sorunlarına karşı katı.
- İyi, çünkü remote cache (Vercel) hazır gelir.
- Kötü, çünkü Nx kadar zengin generator/plugin ekosistemi yok.

### Nx

- İyi, çünkü güçlü dependency graph, generator'lar ve geniş plugin ekosistemi.
- İyi, çünkü modül sınırı (module boundary) lint kurallarıyla mimariyi zorlar.
- Kötü, çünkü daha dik öğrenme eğrisi ve daha "opinionated"; küçük ekip için
  ağır gelebilir.

### Polyrepo

- İyi, çünkü her servis tamamen bağımsız sürümlenir ve izole CI'ya sahiptir.
- Kötü, çünkü atomik cross-repo değişiklik mümkün değil; sözleşme drift'i ve
  versiyon cehennemi riski yüksek.
- Kötü, çünkü tooling/CI tekrarına ve senkronizasyon yüküne yol açar.

### Lerna / sade pnpm workspaces

- İyi, çünkü minimum bağımlılık, sade kurulum.
- Kötü, çünkü task orkestrasyonu, "affected" hesabı ve cache yok; bu mantığı
  elle yazmak gerekir.

## Daha Fazla Bilgi / İlgili Kayıtlar (Links / Related)

- [ADR-0002](0002-polyglot-node-python-split.md) — Polyglot Node/Python ayrımı
- docs/PRD.md — Teknoloji yığını bölümü
- Turborepo: https://turbo.build/repo
- pnpm workspaces: https://pnpm.io/workspaces

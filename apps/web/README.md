# @studfy/web

Studfy'ın web istemcisi ve **ürün önizleme sitesi** — **Next.js 15 (App Router, React 19)**,
Tailwind CSS, next-themes (dark/light), Lucide ikonlar.

## Geliştirme
```bash
pnpm --filter @studfy/web dev   # http://localhost:3000
```

## Statik build (GitHub Pages)
```bash
PAGES_BASE_PATH=/Studyfy pnpm --filter @studfy/web build
# çıktı: apps/web/out  (statik HTML/CSS/JS)
```

## Otomatik yayın
`main` dalına her push'ta `.github/workflows/deploy-pages.yml` siteyi derleyip
**GitHub Pages**'e yayınlar. Canlı adres:
**https://salihgunes23.github.io/Studyfy/**

## Yapı
- `src/app/` — layout, sayfa, global stiller, favicon.
- `src/components/` — navbar, footer, tema; `sections/` altında landing bölümleri.
- `src/lib/` — yardımcılar.

Tasarım sistemi: [docs/DESIGN_SYSTEM.md](../../docs/DESIGN_SYSTEM.md) · UI/UX planları: [docs/PRD.md](../../docs/PRD.md) §7.

# @studfy/web

Studfy'ın web istemcisi — **Next.js 15 (App Router, React 19, RSC)**, Tailwind + shadcn/ui, TanStack Query, Zustand, PWA.

## Geliştirme
```bash
pnpm --filter @studfy/web dev   # http://localhost:3000
```

## Yapı
- `src/app/` — App Router rotaları (Dashboard, Workspace, Test, Keşfet, Tekrar).
- `src/components/` — shadcn/ui temelli bileşenler (bkz. [docs/DESIGN_SYSTEM.md](../../docs/DESIGN_SYSTEM.md)).
- `src/lib/` — tRPC client, query helpers, yardımcılar.

UI/UX sayfa planları: [docs/PRD.md](../../docs/PRD.md) §7.
